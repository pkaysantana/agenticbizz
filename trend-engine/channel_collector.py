#!/usr/bin/env python3
"""
Channel-based Corpus Collector
Targets known high-quality channels with reliable transcripts.
Searches each channel for videos per year, downloads transcripts.
"""

import os
import json
import time
import subprocess
import re
from pathlib import Path
from datetime import datetime

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("ERROR: pip install google-api-python-client")
    exit(1)

API_KEY   = os.environ.get("YOUTUBE_API_KEY", "YOUR_API_KEY")
DATA_ROOT = Path("./corpus")
INDEX     = DATA_ROOT / "index.json"

YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]
TARGET_PER_YEAR_PER_NICHE = 10

# ─────────────────────────────────────────────
# CURATED CHANNEL LIST — all have reliable captions
# ─────────────────────────────────────────────

CHANNELS = {
    "Tech_AI": [
        "UCHnyfMqiRRG1u-2MsSQLbXA",  # Veritasium
        "UCsXVk37bltHxD1rDPwtNM8Q",  # Kurzgesagt
        "UCbmNph6atAoGfqLoCL_duAg",  # Two Minute Papers
        "UCSHZKyawb77ixDdsGog4iWA",  # Lex Fridman
        "UCsBjURrPoezykLs9EqgamOA",  # Fireship
        "UC4QZ_LsYcvcq7qOsOhpAX4A",  # ColdFusion
        "UCccATcpctzIJ9qCQMOkKaog",  # Real Engineering
        "UCYO_jab_esuFRV4b17AJtAw",  # 3Blue1Brown
        "UCNIuvl7V8zACPpTmmNIqioA",  # Wendover Productions
    ],
    "Self_Improvement": [
        "UCoOae5nYA7VqaXzerajD0lg",  # Ali Abdaal
        "UC2D2CMWXMOVWx7giW1n3LIg",  # Huberman Lab
        "UCJ24N4O0bP7LGLBDvye7oCA",  # Matt D'Avella
        "UC2Xd-TjJByJyK2w1zNwY0zg",  # Thomas Frank
        "UCfbLDMh8uO8YHmNpA3dkCqA",  # Better Than Yesterday
        "UCxv4BpqNwvlHDkQXCf2dfpA",  # Improvement Pill
        "UCBcRF18a7Qf58cCRy5xuWwQ",  # Nathaniel Drew
    ],
    "Health_Fitness": [
        "UC2D2CMWXMOVWx7giW1n3LIg",  # Huberman Lab
        "UC98OryKGQBGBFgnRkHbPf5g",  # Jeff Nippard
        "UCfQgsL3Wr5GzMZBMpADiLrg",  # Renaissance Periodization
        "UC7Kj99M-nXVxPoNrAtRhkSA",  # Thomas DeLauer
        "UCkdJGmIjOGTnFgIKMcakyXQ",  # Jeremy Ethier
        "UC9ENMdKuLKBEbJMLNMhfaRA",  # PictureFit
    ],
}


def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {}


def save_index(idx):
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(idx, indent=2))


def get_channel_videos_for_year(youtube, channel_id, year, max_results=20):
    """Get top videos from a channel published in a specific year."""
    try:
        r = youtube.search().list(
            part="snippet",
            channelId=channel_id,
            type="video",
            order="viewCount",
            maxResults=max_results,
            videoDuration="medium",
            publishedAfter=f"{year}-01-01T00:00:00Z",
            publishedBefore=f"{year}-12-31T23:59:59Z",
        ).execute()

        ids = [i["id"]["videoId"] for i in r.get("items", [])]
        if not ids:
            return []

        stats = youtube.videos().list(
            part="snippet,statistics,contentDetails",
            id=",".join(ids)
        ).execute()

        return stats.get("items", [])

    except HttpError as e:
        print(f"    API error on channel {channel_id}: {e}")
        return []


def download_transcript(video_id, niche):
    """Download transcript via yt-dlp. Returns text or None."""
    out_dir = DATA_ROOT / "transcripts" / niche
    out_dir.mkdir(parents=True, exist_ok=True)
    out_txt = out_dir / f"{video_id}.txt"

    if out_txt.exists():
        content = out_txt.read_text(encoding="utf-8", errors="ignore")
        if len(content.split()) > 100:
            return content

    tmp_dir = DATA_ROOT / "tmp"
    tmp_dir.mkdir(exist_ok=True)

    # Clean any leftover vtt files
    for f in tmp_dir.glob("*.vtt"):
        f.unlink(missing_ok=True)

    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        cmd = [
            "yt-dlp",
            "--write-auto-sub", "--sub-lang", "en",
            "--sub-format", "vtt", "--skip-download",
            "--no-warnings",
            "-o", str(tmp_dir / f"{video_id}.%(ext)s"),
            url
        ]
        subprocess.run(cmd, capture_output=True, text=True, timeout=45)

        vtt_files = (list(tmp_dir.glob(f"*{video_id}*.vtt")) or
                     list(tmp_dir.glob("*.vtt")))
        if not vtt_files:
            return None

        vtt  = vtt_files[0].read_text(encoding="utf-8", errors="ignore")
        text = vtt_to_text(vtt)

        for f in tmp_dir.glob("*.vtt"):
            f.unlink(missing_ok=True)

        if len(text.split()) < 100:
            return None

        out_txt.write_text(text, encoding="utf-8")
        return text

    except subprocess.TimeoutExpired:
        return None
    except Exception:
        return None


def vtt_to_text(vtt):
    lines  = vtt.splitlines()
    result, seen = [], set()
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        m = re.match(r'(\d{2}):(\d{2}):(\d{2})\.\d+ -->', line)
        if m:
            h, mn, s = int(m.group(1)), int(m.group(2)), int(m.group(3))
            ts = f"{h}:{mn:02d}:{s:02d}" if h else f"{mn}:{s:02d}"
            i += 1
            parts = []
            while i < len(lines) and lines[i].strip() and '-->' not in lines[i]:
                clean = re.sub(r'<[^>]+>', '', lines[i].strip()).strip()
                if clean:
                    parts.append(clean)
                i += 1
            text = ' '.join(parts)
            if text and text not in seen:
                seen.add(text)
                result.append(f"{ts} {text}")
            continue
        i += 1
    return '\n'.join(result)


def run():
    if API_KEY == "YOUR_API_KEY":
        print("Set YOUTUBE_API_KEY first: export YOUTUBE_API_KEY='your_key'")
        return

    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    youtube = build("youtube", "v3", developerKey=API_KEY)
    index   = load_index()

    grand_total    = 0
    grand_transcripts = 0

    for niche, channel_ids in CHANNELS.items():
        print(f"\n{'='*55}")
        print(f"NICHE: {niche}  ({len(channel_ids)} channels)")
        print(f"{'='*55}")
        niche_total = 0

        for year in YEARS:
            existing = sum(
                1 for v in index.values()
                if v.get("niche") == niche
                and v.get("year") == str(year)
                and v.get("transcript_status") == "ok"
            )

            if existing >= TARGET_PER_YEAR_PER_NICHE:
                print(f"  {year}: already have {existing} ✓")
                continue

            needed    = TARGET_PER_YEAR_PER_NICHE - existing
            collected = 0
            print(f"  {year}: need {needed}...")

            for channel_id in channel_ids:
                if collected >= needed:
                    break

                videos = get_channel_videos_for_year(youtube, channel_id, year)
                time.sleep(0.4)

                for item in videos:
                    if collected >= needed:
                        break

                    vid   = item["id"]
                    stats = item.get("statistics", {})
                    views = int(stats.get("viewCount", 0))

                    if vid in index and index[vid].get("transcript_status") == "ok":
                        collected += 1
                        continue

                    title = item["snippet"].get("title", "")[:50]
                    print(f"    {title}... ({views:,})", end="", flush=True)

                    transcript = download_transcript(vid, niche)
                    time.sleep(1)

                    meta = {
                        "video_id":          vid,
                        "title":             item["snippet"].get("title", ""),
                        "channel":           item["snippet"].get("channelTitle", ""),
                        "published_at":      item["snippet"].get("publishedAt", ""),
                        "niche":             niche,
                        "year":              str(year),
                        "views":             views,
                        "likes":             int(stats.get("likeCount", 0)),
                        "collected_at":      datetime.now().isoformat(),
                        "transcript_status": "ok" if transcript else "none",
                        "transcript_path":   str(DATA_ROOT / "transcripts" / niche / f"{vid}.txt") if transcript else None,
                    }

                    index[vid] = meta
                    save_index(index)

                    if transcript:
                        print(" ✓")
                        collected += 1
                        grand_transcripts += 1
                    else:
                        print(" ✗")

                    grand_total += 1

            niche_total += collected
            print(f"  {year}: got {collected}/{needed}")

        print(f"  → {niche} total with transcripts: {niche_total}")

    print(f"\n{'='*55}")
    print(f"COMPLETE")
    print(f"  Videos processed      : {grand_total}")
    print(f"  Transcripts collected : {grand_transcripts}")
    print(f"  Index location        : {INDEX}")
    print(f"{'='*55}\n")


if __name__ == "__main__":
    run()
