#!/usr/bin/env python3
"""
Focused Corpus Collector
Targets specific niches × years, only keeps videos with transcripts available.
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

TARGET_NICHES = {
    "Tech_AI": [
        "artificial intelligence explained",
        "AI technology future",
        "machine learning explained",
        "tech explained",
    ],
    "Self_Improvement": [
        "productivity habits",
        "self improvement tips",
        "how to be more disciplined",
        "morning routine",
    ],
    "Health_Fitness": [
        "fitness science explained",
        "how to lose weight science",
        "sleep science health",
        "nutrition explained",
    ],
}

YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025]
TARGET_PER_YEAR_PER_NICHE = 10


def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {}


def save_index(idx):
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(idx, indent=2))


def check_has_captions(youtube, video_id):
    """Check if a video has captions available via API."""
    try:
        r = youtube.captions().list(part="snippet", videoId=video_id).execute()
        items = r.get("items", [])
        for item in items:
            lang = item["snippet"].get("language", "")
            if lang.startswith("en"):
                return True
        # If captions list is empty it may still have auto-captions
        # so we fall back to attempting download
        return len(items) > 0
    except Exception:
        return True  # assume yes, let yt-dlp decide


def download_transcript(video_id, niche):
    """Download transcript via yt-dlp. Returns text or None."""
    out_dir = DATA_ROOT / "transcripts" / niche
    out_dir.mkdir(parents=True, exist_ok=True)
    out_txt = out_dir / f"{video_id}.txt"

    if out_txt.exists():
        return out_txt.read_text(encoding="utf-8", errors="ignore")

    url = f"https://www.youtube.com/watch?v={video_id}"
    tmp_dir = DATA_ROOT / "tmp"
    tmp_dir.mkdir(exist_ok=True)

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

        # Find vtt — yt-dlp may use title in filename
        vtt_files = list(tmp_dir.glob(f"*{video_id}*.vtt")) or list(tmp_dir.glob("*.vtt"))
        if not vtt_files:
            return None

        vtt = vtt_files[0].read_text(encoding="utf-8", errors="ignore")
        text = vtt_to_text(vtt)

        # Clean up tmp
        for f in tmp_dir.glob("*.vtt"):
            f.unlink(missing_ok=True)

        if len(text.split()) < 100:
            return None

        out_txt.write_text(text, encoding="utf-8")
        return text

    except subprocess.TimeoutExpired:
        return None
    except Exception as e:
        return None


def vtt_to_text(vtt):
    lines = vtt.splitlines()
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


def search_year(youtube, query, year, max_results=20):
    """Search videos published in a specific year."""
    try:
        r = youtube.search().list(
            part="snippet",
            q=query,
            type="video",
            order="viewCount",
            maxResults=max_results,
            videoDuration="medium",
            relevanceLanguage="en",
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
        print(f"    API error: {e}")
        return []


def run():
    if API_KEY == "YOUR_API_KEY":
        print("Set YOUTUBE_API_KEY first.")
        return

    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    youtube = build("youtube", "v3", developerKey=API_KEY)
    index   = load_index()

    total_new = 0
    total_with_transcript = 0

    for niche, queries in TARGET_NICHES.items():
        print(f"\n{'='*50}")
        print(f"NICHE: {niche}")
        print(f"{'='*50}")

        for year in YEARS:
            # Count how many we already have for this niche+year with transcripts
            existing = sum(
                1 for v in index.values()
                if v.get("niche") == niche
                and v.get("year") == str(year)
                and v.get("transcript_status") == "ok"
            )

            if existing >= TARGET_PER_YEAR_PER_NICHE:
                print(f"  {year}: already have {existing} ✓ skipping")
                continue

            needed = TARGET_PER_YEAR_PER_NICHE - existing
            print(f"  {year}: need {needed} more...")

            collected = 0
            for query in queries:
                if collected >= needed:
                    break

                videos = search_year(youtube, query, year, max_results=20)
                time.sleep(0.3)

                for item in videos:
                    if collected >= needed:
                        break

                    vid = item["id"]
                    if vid in index and index[vid].get("transcript_status") == "ok":
                        continue

                    snippet = item.get("snippet", {})
                    stats   = item.get("statistics", {})
                    views   = int(stats.get("viewCount", 0))

                    if views < 100000:
                        continue

                    print(f"    → {snippet.get('title', '')[:55]}... ({views:,} views)", end="", flush=True)

                    transcript = download_transcript(vid, niche)
                    time.sleep(1)

                    meta = {
                        "video_id":          vid,
                        "title":             snippet.get("title", ""),
                        "channel":           snippet.get("channelTitle", ""),
                        "published_at":      snippet.get("publishedAt", ""),
                        "niche":             niche,
                        "year":              str(year),
                        "views":             views,
                        "likes":             int(stats.get("likeCount", 0)),
                        "collected_at":      datetime.now().isoformat(),
                        "transcript_status": "ok" if transcript else "none",
                        "transcript_path":   str(DATA_ROOT / "transcripts" / niche / f"{vid}.txt") if transcript else None,
                    }

                    index[vid] = meta

                    if transcript:
                        print(f" ✓")
                        collected += 1
                        total_with_transcript += 1
                    else:
                        print(f" ✗ no transcript")

                    total_new += 1

            save_index(index)
            print(f"  {year}: collected {collected}/{needed}")

    print(f"\n{'='*50}")
    print(f"DONE")
    print(f"  Total processed    : {total_new}")
    print(f"  With transcripts   : {total_with_transcript}")
    print(f"  Index saved        : {INDEX}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    run()
