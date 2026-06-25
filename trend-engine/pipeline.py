#!/usr/bin/env python3
"""
AI Video Script Generator — Profile-Aware
Generates scripts shaped by the sliding window style profiles per year.
"""

import os
import re
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

PROFILES_DIR = Path("./corpus/style_profiles")


# ─────────────────────────────────────────────
# 1. PROFILE LOADER
# ─────────────────────────────────────────────

def load_profile(niche, year=None):
    """
    Load style profile for a niche.
    If year given, find the closest cohort to that year.
    Returns the cohort data + top-level guidance.
    """
    profile_path = PROFILES_DIR / f"{niche}_profile.json"
    if not profile_path.exists():
        profile_path = PROFILES_DIR / "_all_profile.json"
    if not profile_path.exists():
        return None

    profile = json.loads(profile_path.read_text())

    if not year:
        # Use latest cohort
        cohorts = profile.get("cohort_history", [])
        cohort = cohorts[-1] if cohorts else None
    else:
        # Find closest year
        cohorts = profile.get("cohort_history", [])
        cohort = None
        best_diff = 9999
        for c in cohorts:
            diff = abs(int(c["cohort"]) - int(year))
            if diff < best_diff:
                best_diff = diff
                cohort = c

    return {
        "profile":  profile,
        "cohort":   cohort,
        "guidance": profile.get("script_guidance", ""),
    }


def format_profile_header(profile_data, year):
    """Format the profile insights block for the script header."""
    if not profile_data or not profile_data.get("cohort"):
        return "[No profile data — using default structure]"

    c = profile_data["cohort"]
    p = profile_data["profile"]

    hooks   = list(c.get("top_hook_patterns", {}).keys())[:3]
    vocab   = c.get("trending_vocab", [])[:8]
    pacing  = int(c.get("top_pacing", 30))
    sent    = c.get("top_sentence_len", 15)
    cta     = c.get("top_cta_rate", 0)
    power   = c.get("top_power_density", 0)
    words   = int(c.get("top_avg_word_count", 1200))
    uplift  = c.get("power_uplift", 0)

    lines = [
        f"── STYLE PROFILE: {p.get('niche', 'Unknown')} / {c['cohort']} ──",
        f"Based on {c['video_count']} videos, top {c['top_performer_count']} analysed",
        f"",
        f"HOOK PATTERNS    : {' | '.join(hooks) if hooks else 'n/a'}",
        f"TARGET LENGTH    : ~{words:,} words",
        f"SENTENCE LENGTH  : ~{int(sent)} words (top performers)",
        f"PACING           : ~{pacing} words per segment",
        f"POWER WORD DENSITY: {power}% {'↑ above avg' if uplift > 0 else '≈ avg'}",
        f"CTA RATE         : {cta}% of top performers include CTA",
        f"TRENDING VOCAB   : {', '.join(vocab)}",
        f"",
        f"GUIDANCE:",
    ]
    for line in profile_data["guidance"].splitlines():
        lines.append(f"  {line}")

    return '\n'.join(lines)


# ─────────────────────────────────────────────
# 2. TRANSCRIPT PARSER
# ─────────────────────────────────────────────

def parse_transcript(raw_text):
    lines = [l.strip() for l in raw_text.strip().splitlines() if l.strip()]
    ts_patterns = [
        r'^(\d{1,2}):(\d{2}):(\d{2})\s+(.*)',
        r'^(\d{1,2}):(\d{2})\s+(.*)',
        r'^\[(\d{1,2}):(\d{2}):(\d{2})\]\s*(.*)',
        r'^\[(\d{1,2}):(\d{2})\]\s*(.*)',
    ]
    timestamped = []
    for line in lines:
        matched = False
        for pat in ts_patterns:
            m = re.match(pat, line)
            if m:
                groups = m.groups()
                if len(groups) == 4:
                    h, mn, s, text = groups
                    secs = int(h)*3600 + int(mn)*60 + int(s)
                else:
                    mn, s, text = groups
                    secs = int(mn)*60 + int(s)
                timestamped.append({'time_sec': secs, 'text': text.strip()})
                matched = True
                break
        if not matched:
            timestamped.append({'time_sec': None, 'text': line})

    has_timestamps = any(e['time_sec'] is not None for e in timestamped)
    if not has_timestamps:
        full_text = ' '.join(e['text'] for e in timestamped)
        return {'format': 'plain', 'entries': [{'time_sec': None, 'text': full_text}]}
    return {'format': 'timestamped', 'entries': timestamped}


def estimate_duration(parsed):
    entries = parsed['entries']
    if parsed['format'] == 'timestamped':
        times = [e['time_sec'] for e in entries if e['time_sec'] is not None]
        if times:
            return max(times) + 30
    words = sum(len(e['text'].split()) for e in entries)
    return int((words / 130) * 60)


def secs_to_ts(secs):
    secs = int(secs)
    h = secs // 3600
    m = (secs % 3600) // 60
    s = secs % 60
    if h:
        return f"{h}:{m:02d}:{s:02d}"
    return f"{m}:{s:02d}"


# ─────────────────────────────────────────────
# 3. TOPIC DETECTION
# ─────────────────────────────────────────────

TOPIC_KEYWORDS = {
    'Tech_AI':         ['ai', 'artificial intelligence', 'tech', 'software', 'code',
                        'machine learning', 'chatgpt', 'openai', 'gpu', 'model', 'neural'],
    'Finance':         ['money', 'invest', 'stock', 'crypto', 'wealth', 'income', 'budget',
                        'finance', 'trading', 'passive income'],
    'Health_Fitness':  ['workout', 'exercise', 'diet', 'nutrition', 'muscle', 'weight',
                        'health', 'fitness', 'gym', 'calories', 'sleep'],
    'Self_Improvement':['productivity', 'habit', 'mindset', 'success', 'motivation',
                        'discipline', 'goal', 'morning routine', 'focus'],
    'Science':         ['science', 'physics', 'biology', 'chemistry', 'space', 'quantum',
                        'evolution', 'climate', 'research'],
}

def detect_topic(text):
    text_lower = text.lower()
    scores = {}
    for topic, keywords in TOPIC_KEYWORDS.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        if score > 0:
            scores[topic] = score
    return max(scores, key=scores.get) if scores else 'General'


# ─────────────────────────────────────────────
# 4. CHUNK + TIMESTAMP HELPERS
# ─────────────────────────────────────────────

def chunk_transcript(parsed, num_sections=6):
    entries = parsed['entries']
    if parsed['format'] == 'plain':
        text = entries[0]['text']
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunk_size = max(1, len(sentences) // num_sections)
        chunks = []
        for i in range(num_sections):
            start = i * chunk_size
            end = start + chunk_size if i < num_sections - 1 else len(sentences)
            chunks.append(' '.join(sentences[start:end]))
        return chunks
    else:
        times = [e['time_sec'] for e in entries if e['time_sec'] is not None]
        total = max(times) if times else 600
        section_dur = total / num_sections
        chunks = [[] for _ in range(num_sections)]
        for e in entries:
            if e['time_sec'] is not None:
                idx = min(int(e['time_sec'] / section_dur), num_sections - 1)
                chunks[idx].append(e['text'])
            else:
                if chunks:
                    chunks[-1].append(e['text'])
        return [' '.join(c) for c in chunks if c]


def assign_timestamps(num_sections, total_secs):
    gap = total_secs / (num_sections + 1)
    return [secs_to_ts(int(gap * i)) for i in range(num_sections)]


# ─────────────────────────────────────────────
# 5. SCRIPT GENERATORS — profile-aware
# ─────────────────────────────────────────────

def build_hook_instruction(profile_data):
    """Build a hook instruction from the profile."""
    if not profile_data or not profile_data.get("cohort"):
        return "Open with a strong hook."
    hooks = list(profile_data["cohort"].get("top_hook_patterns", {}).keys())
    if hooks:
        return f"Open with '{hooks[0]}' — the top hook pattern for this niche/year."
    return "Open with a bold question or surprising stat."


def build_cta_instruction(profile_data):
    """Whether to include a CTA based on profile data."""
    if not profile_data or not profile_data.get("cohort"):
        return "Include a CTA."
    rate = profile_data["cohort"].get("top_cta_rate", 0)
    if rate > 50:
        return f"Include a clear CTA — {rate}% of top performers use one."
    return f"CTA optional — only {rate}% of top performers include one."


def generate_script_mimic(parsed, topic, duration_secs, profile_data):
    chunks = chunk_transcript(parsed, num_sections=6)
    timestamps = assign_timestamps(len(chunks), duration_secs)
    section_labels = ['HOOK / INTRO', 'CONTEXT & BACKGROUND', 'MAIN POINT 1',
                      'MAIN POINT 2 / DEEP DIVE', 'KEY TAKEAWAY / TWIST', 'OUTRO & CTA']

    lines = [f"[STYLE: Mimic — closely follows source structure]",
             f"// {build_hook_instruction(profile_data)}", ""]

    for chunk, ts, label in zip(chunks, timestamps, section_labels):
        lines.append(f"[{ts}] ── {label} ──")
        lines.append(f"  {chunk[:500]}{'...' if len(chunk) > 500 else ''}")
        lines.append("")

    lines.append(f"// {build_cta_instruction(profile_data)}")
    return '\n'.join(lines)


def generate_script_own(parsed, topic, duration_secs, profile_data):
    chunks = chunk_transcript(parsed, num_sections=5)
    timestamps = assign_timestamps(5, duration_secs)

    vocab = []
    pacing = 30
    sent_len = 15
    if profile_data and profile_data.get("cohort"):
        c = profile_data["cohort"]
        vocab    = c.get("trending_vocab", [])[:6]
        pacing   = int(c.get("top_pacing", 30))
        sent_len = int(c.get("top_sentence_len", 15))

    structure = [
        ("HOOK",         build_hook_instruction(profile_data)),
        ("INTRO",        f"Introduce the topic. Keep sentences ~{sent_len} words. Build credibility fast."),
        ("CORE CONTENT", f"Break into 2-3 clear points. Pacing: ~{pacing} words per segment. Use: {', '.join(vocab) if vocab else 'clear direct language'}."),
        ("YOUR ANGLE",   "Add a contrarian take or personal insight to differentiate."),
        ("OUTRO",        build_cta_instruction(profile_data)),
    ]

    lines = [f"[STYLE: Own Format — same topic, your structure]", ""]
    for (label, guidance), ts, chunk in zip(structure, timestamps, chunks):
        lines.append(f"[{ts}] ── {label} ──")
        lines.append(f"// {guidance}")
        lines.append(f"  {chunk[:500]}{'...' if len(chunk) > 500 else ''}")
        lines.append("")

    return '\n'.join(lines)


def generate_script_remix(parsed, topic, duration_secs, profile_data):
    chunks = chunk_transcript(parsed, num_sections=6)
    timestamps = assign_timestamps(6, duration_secs)

    vocab = []
    if profile_data and profile_data.get("cohort"):
        vocab = profile_data["cohort"].get("trending_vocab", [])[:6]

    lines = [f"[STYLE: Remix — best ideas extracted and repackaged]", ""]

    lines.append(f"[{timestamps[0]}] ── COLD OPEN ──")
    lines.append(f"// {build_hook_instruction(profile_data)}")
    lines.append(f"  {chunks[0][:500]}{'...' if len(chunks[0]) > 500 else ''}")
    lines.append("")

    mid_labels = ['KEY IDEA 1', 'KEY IDEA 2', 'KEY IDEA 3', 'SURPRISING ANGLE']
    for label, ts, chunk in zip(mid_labels, timestamps[1:-1], chunks[1:-1]):
        lines.append(f"[{ts}] ── {label} ──")
        if vocab:
            lines.append(f"// Weave in trending vocab where natural: {', '.join(vocab)}")
        lines.append(f"  {chunk[:500]}{'...' if len(chunk) > 500 else ''}")
        lines.append("")

    lines.append(f"[{timestamps[-1]}] ── PAYOFF / WRAP ──")
    lines.append(f"// {build_cta_instruction(profile_data)}")
    lines.append(f"  {chunks[-1][:500]}{'...' if len(chunks[-1]) > 500 else ''}")

    return '\n'.join(lines)


# ─────────────────────────────────────────────
# 6. MAIN OUTPUT BUILDER
# ─────────────────────────────────────────────

def build_output(transcript_path, style, topic_override=None, niche=None, year=None):
    raw      = Path(transcript_path).read_text(encoding='utf-8', errors='ignore')
    filename = Path(transcript_path).stem
    parsed   = parse_transcript(raw)
    duration_secs = estimate_duration(parsed)
    full_text = ' '.join(e['text'] for e in parsed['entries'])
    auto_topic = detect_topic(full_text)
    topic = topic_override or niche or auto_topic

    # Load style profile
    profile_niche = niche or auto_topic
    profile_data  = load_profile(profile_niche, year)
    profile_block = format_profile_header(profile_data, year) if profile_data else "No profile available."

    header = '\n'.join([
        "=" * 60,
        f"SOURCE FILE  : {filename}.txt",
        f"NICHE        : {topic}",
        f"YEAR TARGET  : {year or 'latest'}",
        f"TRANSCRIPT   : {parsed['format'].upper()} format",
        f"EST. DURATION: ~{secs_to_ts(duration_secs)}",
        f"STYLE MODE   : {style.upper()}",
        f"GENERATED    : {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "=" * 60,
        "",
        profile_block,
        "",
        "=" * 60,
        "SCRIPT",
        "=" * 60,
        "",
    ])

    generators = {
        'mimic': generate_script_mimic,
        'own':   generate_script_own,
        'remix': generate_script_remix,
    }
    script_body = generators[style](parsed, topic, duration_secs, profile_data)

    footer = '\n'.join(["", "=" * 60, "END OF SCRIPT", "=" * 60])
    return header + script_body + footer


# ─────────────────────────────────────────────
# 7. CLI
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='AI Video Script Generator — profile-aware per niche and year.')
    parser.add_argument('input',
        help='Path to a .txt transcript or folder of transcripts')
    parser.add_argument('--style', choices=['mimic', 'own', 'remix'], default='remix')
    parser.add_argument('--niche', default=None,
        help='Niche profile to use: Tech_AI | Self_Improvement | Health_Fitness')
    parser.add_argument('--year', default=None,
        help='Target year style e.g. 2021, 2023, 2025')
    parser.add_argument('--output', default='./output_scripts')
    parser.add_argument('--topic', default=None)

    args   = parser.parse_args()
    in_path = Path(args.input)
    out_dir = Path(args.output)
    out_dir.mkdir(parents=True, exist_ok=True)

    files = [in_path] if in_path.is_file() else list(in_path.glob('*.txt'))
    if not files:
        print(f"No .txt files found at {args.input}")
        sys.exit(1)

    for f in files:
        print(f"Processing: {f.name}  niche={args.niche or 'auto'}  year={args.year or 'latest'}")
        text = build_output(str(f), args.style,
                            topic_override=args.topic,
                            niche=args.niche,
                            year=args.year)
        out_file = out_dir / f"{f.stem}_{args.style.upper()}_{args.year or 'latest'}.txt"
        out_file.write_text(text, encoding='utf-8')
        print(f"  ✓ Saved: {out_file.name}")


if __name__ == '__main__':
    main()
