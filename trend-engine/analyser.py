#!/usr/bin/env python3
"""
Sliding Window Trend Analyser
Reads the collected corpus (corpus/index.json + transcripts), groups videos into
per-year cohorts per niche, and extracts the style signals that correlate with
top-performing videos: hook patterns, pacing, sentence length, power-word density,
CTA rate, and trending vocabulary.

Writes one style profile per niche to corpus/style_profiles/{niche}_profile.json
(plus a combined _all_profile.json) in the exact shape consumed by pipeline.py
and dashboard/server.py.

Usage:
    python3 analyser.py --analyse              # build all style profiles
    python3 analyser.py --profile Tech_AI      # print a profile summary
"""

import re
import sys
import json
import argparse
from pathlib import Path
from statistics import mean
from collections import Counter, defaultdict

# Windows consoles default to cp1252 and choke on the ✓/→/█ glyphs below.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

DATA_ROOT    = Path("./corpus")
INDEX_FILE   = DATA_ROOT / "index.json"
PROFILES_DIR = DATA_ROOT / "style_profiles"

# Fraction of a cohort (ranked by views) treated as "top performers".
TOP_FRACTION = 0.5
MIN_TOP      = 3

# ─────────────────────────────────────────────
# LEXICONS
# ─────────────────────────────────────────────

POWER_WORDS = {
    "amazing", "incredible", "insane", "secret", "proven", "ultimate", "essential",
    "powerful", "shocking", "surprising", "best", "worst", "never", "always",
    "instantly", "guaranteed", "free", "new", "exclusive", "breakthrough", "revealed",
    "mistake", "stop", "warning", "danger", "truth", "easy", "simple", "fast",
    "biggest", "crazy", "unbelievable", "transform", "explode", "hack", "trick",
    "must", "critical", "game-changing", "revolutionary", "game", "changer",
}

CTA_PATTERNS = [
    "subscribe", "like and subscribe", "hit the like", "smash that like",
    "hit the bell", "comment below", "let me know", "link in the description",
    "link below", "check out", "sign up", "click the link", "join the",
    "leave a comment", "share this", "follow me", "down below",
]

# Known opening "shapes". Matched as a prefix on the first cleaned line.
HOOK_PREFIXES = [
    "how to", "what if", "what is", "this is", "in this video", "have you ever",
    "did you know", "why", "the secret", "imagine", "here's", "here is",
    "let me", "today", "i'm going to", "i am going to", "we're going to",
    "we are going to", "meet", "introducing", "everyone", "most people",
    "you've probably", "you have probably", "in 2019", "in 2020", "in 2021",
    "in 2022", "in 2023", "in 2024", "in 2025", "for the past", "there's a",
    "there is a", "despite",
]

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for",
    "with", "as", "by", "from", "is", "are", "was", "were", "be", "been", "being",
    "it", "its", "this", "that", "these", "those", "i", "you", "he", "she", "we",
    "they", "them", "his", "her", "our", "your", "their", "my", "me", "us", "him",
    "so", "do", "does", "did", "have", "has", "had", "will", "would", "can", "could",
    "should", "not", "no", "yes", "just", "like", "get", "got", "going", "go", "what",
    "when", "where", "who", "how", "why", "which", "than", "then", "there", "here",
    "all", "some", "any", "more", "most", "very", "really", "actually", "about",
    "out", "up", "down", "into", "over", "now", "one", "two", "also", "because",
    "know", "think", "want", "make", "made", "thing", "things", "lot", "kind", "okay",
    "right", "well", "gonna", "yeah", "uh", "um", "im", "dont", "thats", "youre",
    "were", "weve", "ive", "lets", "let", "see", "look", "way", "much", "many", "even",
    "good", "great", "people", "time", "work", "use", "using", "used", "need", "first",
    "music", "applause", "laughter",
}


# ─────────────────────────────────────────────
# I/O
# ─────────────────────────────────────────────

def load_index():
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text(encoding="utf-8"))
    return {}


def resolve_transcript_path(meta):
    raw = meta.get("transcript_path")
    if not raw:
        return None
    p = Path(raw)
    if not p.is_absolute() and not p.exists():
        # Index may store paths relative to project root or to corpus.
        for candidate in (Path(raw), DATA_ROOT.parent / raw, DATA_ROOT / raw):
            if candidate.exists():
                return candidate
    return p if p.exists() else None


def read_transcript(meta):
    path = resolve_transcript_path(meta)
    if not path:
        return None
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None


# ─────────────────────────────────────────────
# TEXT PROCESSING
# ─────────────────────────────────────────────

_TS_LINE = re.compile(r'^\s*\d{1,2}:\d{2}(?::\d{2})?\s+(.*)$')
_WORD    = re.compile(r"[a-zA-Z][a-zA-Z'-]+")


def strip_timestamps(raw):
    """Return (clean_lines, num_segments). Each timestamped line is one segment."""
    lines = []
    segments = 0
    for ln in raw.splitlines():
        ln = ln.strip()
        if not ln:
            continue
        m = _TS_LINE.match(ln)
        if m:
            segments += 1
            text = m.group(1).strip()
            if text:
                lines.append(text)
        else:
            lines.append(ln)
    return lines, max(segments, len(lines))


def tokenize(text):
    return [w.lower() for w in _WORD.findall(text)]


def count_sentences(text):
    parts = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    return len(parts)


def classify_hook(first_line):
    low = first_line.lower().strip()
    for prefix in HOOK_PREFIXES:
        if low.startswith(prefix):
            return prefix
    words = tokenize(first_line)
    if not words:
        return "other"
    return " ".join(words[:3])


# ─────────────────────────────────────────────
# PER-VIDEO METRICS
# ─────────────────────────────────────────────

def analyse_video(meta):
    raw = read_transcript(meta)
    if not raw:
        return None

    clean_lines, segments = strip_timestamps(raw)
    full_text = " ".join(clean_lines)
    words = tokenize(full_text)
    if len(words) < 80:
        return None

    word_count = len(words)
    sentences  = count_sentences(full_text)
    if sentences < 2:
        # Auto-captions often lack punctuation — approximate.
        sentence_len = 15.0
    else:
        sentence_len = word_count / sentences

    pacing = word_count / segments if segments else float(word_count)

    power_hits   = sum(1 for w in words if w in POWER_WORDS)
    power_density = round(power_hits / word_count * 100, 2)

    low_text = full_text.lower()
    has_cta = any(p in low_text for p in CTA_PATTERNS)

    hook = classify_hook(clean_lines[0]) if clean_lines else "other"

    content_words = [w for w in words if w not in STOPWORDS and len(w) > 3]

    return {
        "video_id":     meta.get("video_id"),
        "views":        int(meta.get("views", 0) or 0),
        "word_count":   word_count,
        "sentence_len": sentence_len,
        "pacing":       pacing,
        "power_density": power_density,
        "has_cta":      has_cta,
        "hook":         hook,
        "content_words": content_words,
    }


# ─────────────────────────────────────────────
# COHORT AGGREGATION
# ─────────────────────────────────────────────

def select_top_performers(videos):
    """Top videos by views; if no view data, keep them all (e.g. HF corpus)."""
    if any(v["views"] > 0 for v in videos):
        ranked = sorted(videos, key=lambda v: v["views"], reverse=True)
    else:
        ranked = sorted(videos, key=lambda v: v["word_count"], reverse=True)
    n = max(MIN_TOP, int(round(len(ranked) * TOP_FRACTION)))
    return ranked[:n]


def global_word_rates(videos):
    """Baseline content-word frequency across the whole niche."""
    total = Counter()
    for v in videos:
        total.update(v["content_words"])
    grand = sum(total.values()) or 1
    return {w: c / grand for w, c in total.items()}, grand


def trending_vocab(cohort_videos, baseline_rates, top_k=15):
    """Words that over-index in this cohort relative to the niche baseline."""
    counts = Counter()
    for v in cohort_videos:
        counts.update(v["content_words"])
    total = sum(counts.values()) or 1
    scored = []
    for w, c in counts.items():
        if c < 2:
            continue
        rate = c / total
        lift = rate - baseline_rates.get(w, 0)
        scored.append((lift, c, w))
    scored.sort(reverse=True)
    return [w for _, _, w in scored[:top_k]]


def build_cohort(year, cohort_videos, baseline_rates, overall_power):
    top = select_top_performers(cohort_videos)

    hook_counter = Counter(v["hook"] for v in top)
    top_hooks = dict(hook_counter.most_common(5))

    top_power = round(mean(v["power_density"] for v in top), 2)

    return {
        "cohort":              str(year),
        "video_count":         len(cohort_videos),
        "top_performer_count": len(top),
        "top_avg_word_count":  round(mean(v["word_count"] for v in top), 1),
        "top_sentence_len":    round(mean(v["sentence_len"] for v in top), 1),
        "top_pacing":          round(mean(v["pacing"] for v in top), 1),
        "top_power_density":   top_power,
        "top_cta_rate":        round(sum(1 for v in top if v["has_cta"]) / len(top) * 100, 1),
        "top_hook_patterns":   top_hooks,
        "trending_vocab":      trending_vocab(cohort_videos, baseline_rates),
        "power_uplift":        round(top_power - overall_power, 2),
    }


def build_guidance(niche, cohorts):
    if not cohorts:
        return "No cohorts analysed yet — collect more data and re-run."
    latest = cohorts[-1]
    hooks = list(latest["top_hook_patterns"].keys())
    vocab = latest["trending_vocab"][:6]
    return "\n".join([
        f"Niche: {niche} — latest cohort {latest['cohort']} "
        f"({latest['video_count']} videos).",
        f"Open with a '{hooks[0]}' style hook." if hooks
            else "Open with a strong, specific hook.",
        f"Target ~{int(latest['top_avg_word_count']):,} words, "
        f"~{int(latest['top_sentence_len'])}-word sentences, "
        f"~{int(latest['top_pacing'])} words per segment.",
        f"Aim for ~{latest['top_power_density']}% power-word density "
        f"({'above' if latest['power_uplift'] > 0 else 'around'} the niche average).",
        (f"{int(latest['top_cta_rate'])}% of top performers use a CTA — "
         f"{'include one' if latest['top_cta_rate'] > 50 else 'optional'}."),
        f"Lean on currently trending vocab: {', '.join(vocab)}." if vocab else "",
    ]).strip()


# ─────────────────────────────────────────────
# MAIN ANALYSIS
# ─────────────────────────────────────────────

def analyse():
    index = load_index()
    if not index:
        print("No corpus found. Run a collector or ingest_hf.py first.")
        return

    PROFILES_DIR.mkdir(parents=True, exist_ok=True)

    # niche -> list of per-video metrics
    by_niche = defaultdict(list)
    # niche -> year -> list of per-video metrics
    by_niche_year = defaultdict(lambda: defaultdict(list))

    print("Analysing transcripts...")
    analysed = 0
    for meta in index.values():
        if meta.get("transcript_status") != "ok":
            continue
        result = analyse_video(meta)
        if not result:
            continue
        niche = meta.get("niche", "Unknown")
        year  = str(meta.get("year") or (meta.get("published_at", "")[:4]) or "unknown")
        by_niche[niche].append(result)
        by_niche_year[niche][year].append(result)
        analysed += 1
        if analysed % 100 == 0:
            print(f"  {analysed} transcripts analysed...")

    print(f"  {analysed} transcripts analysed total\n")

    all_cohorts = []
    for niche, videos in sorted(by_niche.items()):
        baseline_rates, _ = global_word_rates(videos)
        overall_power = round(mean(v["power_density"] for v in videos), 2)

        cohorts = []
        for year in sorted(by_niche_year[niche].keys()):
            cohort_videos = by_niche_year[niche][year]
            if len(cohort_videos) < 1:
                continue
            cohorts.append(build_cohort(year, cohort_videos, baseline_rates, overall_power))

        profile = {
            "niche":           niche,
            "video_count":     len(videos),
            "cohort_count":    len(cohorts),
            "overall_power_density": overall_power,
            "cohort_history":  cohorts,
            "script_guidance": build_guidance(niche, cohorts),
        }

        out = PROFILES_DIR / f"{niche}_profile.json"
        out.write_text(json.dumps(profile, indent=2), encoding="utf-8")
        all_cohorts.extend(cohorts)
        print(f"  ✓ {niche:<18} {len(videos):>4} videos, {len(cohorts)} cohorts → {out.name}")

    # Combined profile across all niches (years merged).
    if all_cohorts:
        merged = defaultdict(list)
        for c in all_cohorts:
            merged[c["cohort"]].append(c)
        combined_history = []
        for year in sorted(merged.keys()):
            group = merged[year]
            combined_history.append({
                "cohort":              year,
                "video_count":         sum(c["video_count"] for c in group),
                "top_performer_count": sum(c["top_performer_count"] for c in group),
                "top_avg_word_count":  round(mean(c["top_avg_word_count"] for c in group), 1),
                "top_sentence_len":    round(mean(c["top_sentence_len"] for c in group), 1),
                "top_pacing":          round(mean(c["top_pacing"] for c in group), 1),
                "top_power_density":   round(mean(c["top_power_density"] for c in group), 2),
                "top_cta_rate":        round(mean(c["top_cta_rate"] for c in group), 1),
                "top_hook_patterns":   dict(sum((Counter(c["top_hook_patterns"]) for c in group), Counter()).most_common(5)),
                "trending_vocab":      list(dict.fromkeys(w for c in group for w in c["trending_vocab"]))[:15],
                "power_uplift":        round(mean(c["power_uplift"] for c in group), 2),
            })
        combined = {
            "niche":           "_all",
            "cohort_history":  combined_history,
            "script_guidance": build_guidance("All niches", combined_history),
        }
        (PROFILES_DIR / "_all_profile.json").write_text(
            json.dumps(combined, indent=2), encoding="utf-8")
        print(f"  ✓ {'_all':<18} combined profile → _all_profile.json")

    print(f"\nProfiles written to {PROFILES_DIR}")
    print("Now run: python3 pipeline.py <transcript> --niche <Niche> --year <Year>")


def show_profile(niche):
    path = PROFILES_DIR / f"{niche}_profile.json"
    if not path.exists():
        print(f"No profile for '{niche}'. Run: python3 analyser.py --analyse")
        return
    profile = json.loads(path.read_text(encoding="utf-8"))
    print(f"\n{'='*60}")
    print(f"STYLE PROFILE: {profile.get('niche')}  ({profile.get('video_count', 0)} videos)")
    print(f"{'='*60}")
    print(profile.get("script_guidance", ""))
    print(f"\n{'year':<6}{'vids':>6}{'words':>8}{'sent':>6}{'pace':>6}{'power':>7}{'cta':>6}  hooks")
    for c in profile.get("cohort_history", []):
        hooks = ", ".join(list(c["top_hook_patterns"].keys())[:2])
        print(f"{c['cohort']:<6}{c['video_count']:>6}{int(c['top_avg_word_count']):>8}"
              f"{int(c['top_sentence_len']):>6}{int(c['top_pacing']):>6}"
              f"{c['top_power_density']:>6}%{int(c['top_cta_rate']):>5}%  {hooks}")
    print(f"{'='*60}\n")


def main():
    parser = argparse.ArgumentParser(description="Sliding window trend analyser.")
    parser.add_argument("--analyse", action="store_true",
        help="Analyse the corpus and build style profiles.")
    parser.add_argument("--profile", default=None,
        help="Print the style profile summary for a niche, e.g. Tech_AI")
    args = parser.parse_args()

    if args.profile:
        show_profile(args.profile)
        return
    if args.analyse:
        analyse()
        return
    parser.print_help()


if __name__ == "__main__":
    main()
