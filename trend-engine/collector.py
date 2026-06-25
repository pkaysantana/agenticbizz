#!/usr/bin/env python3
"""
YouTube Trending Data Collector
Pulls trending + top videos per niche, downloads transcripts, stores with metadata.
Run weekly via cron or manually.
"""

import os
import json
import time
import argparse
import subprocess
from pathlib import Path
from datetime import datetime

try:
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("ERROR: Run: pip install google-api-python-client")
    exit(1)

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

API_KEY = os.environ.get("YOUTUBE_API_KEY", "YOUR_API_KEY")

# Niches to collect — maps to YouTube search queries
NICHES = {
    "Technology":       ["AI technology 2024", "tech explained", "future of AI"],
    "Finance":          ["how to invest money", "passive income 2024", "stock market explained"],
    "Health":           ["morning routine health", "workout tips", "sleep science"],
    "Self Improvement": ["productivity habits", "discipline mindset", "how to focus"],
    "Science":          ["science explained", "space discovery", "physics explained"],
    "History":          ["history explained", "ancient civilizations", "world war documentary"],
    "Gaming":           ["gaming explained", "game review 2024", "esports highlights"],
    "Food":             ["recipe explained", "cooking tips", "food science"],
}

# How many videos per query to fetch (max 50 per API call)
VIDEOS_PER_QUERY = 10

# Output directory structure
DATA_ROOT = Path("./data")
TRANSCRIPTS_DIR = DATA_ROOT / "transcripts"
METADATA_DIR    = DATA_ROOT / "metadata"
INDEX_FILE      = DATA_ROOT / "index.json"


# ─────────────────────────────────────────────
# YOUTUBE API HELPERS
# ─────────────────────────────────────────────

def get_youtube_client():
    return build("youtube", "v3", developerKey=API_KEY)


def fetch_trending_videos(youtube, region_code="US", max_results=50):
    """Fetch current trending videos (YouTube trending page equivalent)."""
    print(f"  Fetching trending videos (region: {region_code})...")
    try:
        response = youtube.videos().list(
            part="snippet,statistics,contentDetails",
            chart="mostPopular",
            regionCode=region_code,
            maxResults=max_results,
            videoCategoryId=""  # all categories
        ).execute()
        return response.get("items", [])
    except HttpError as e:
        print(f"  ERROR fetching trending: {e}")
        return []


def search_videos_by_niche(youtube, query, max_results=10, published_after=None):
    """Search top videos for a given niche query."""
    print(f"  Searching: '{query}'...")
    try:
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "order": "viewCount",
            "maxResults": max_results,
            "videoDuration": "medium",  # 4-20 mins
            "relevanceLanguage": "en",
        }
        if published_after:
            params["publishedAfter"] = published_after  # e.g. "2023-01-01T00:00:00Z"

        response = youtube.search().list(**params).execute()
        video_ids = [item["id"]["videoId"] for item in response.get("items", [])]

        if not video_ids:
            return []

        # Get full stats for each video
        stats_response = youtube.videos().list(
            part="snippet,statistics,contentDetails",
            id=",".join(video_ids)
        ).execute()

        return stats_response.get("items", [])

    except HttpError as e:
        print(f"  ERROR searching '{query}': {e}")
        return []


def parse_video_metadata(item, niche=None, source="search"):
    """Extract clean metadata dict from a YouTube API video item."""
    snippet    = item.get("snippet", {})
    stats      = item.get("statistics", {})
    details    = item.get("contentDetails", {})

    return {
        "video_id":      item["id"],
        "title":         snippet.get("title", ""),
        "channel":       snippet.get("channelTitle", ""),
        "published_at":  snippet.get("publishedAt", ""),
        "description":   snippet.get("description", "")[:500],
        "niche":         niche or "Unknown",
        "source":        source,  # 'trending' or 'search'
        "views":         int(stats.get("viewCount", 0)),
        "likes":         int(stats.get("likeCount", 0)),
        "comments":      int(stats.get("commentCount", 0)),
        "duration":      details.get("duration", ""),
        "collected_at":  datetime.now().isoformat(),
        "transcript_path": None,
        "transcript_status": "pending",
    }


# ─────────────────────────────────────────────
# TRANSCRIPT DOWNLOADER
# ─────────────────────────────────────────────

def download_transcript(video_id, output_dir, retries=2):
    """
    Use yt-dlp to download auto-generated English subtitles.
    Returns path to saved transcript or None.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"{video_id}.txt"

    if out_path.exists():
        return str(out_path)  # already downloaded

    url = f"https://www.youtube.com/watch?v={video_id}"

    for attempt in range(retries + 1):
        try:
            # Download auto-generated subtitles as VTT, then convert to txt
            vtt_path = output_dir / f"{video_id}.en.vtt"
            cmd = [
                "yt-dlp",
                "--write-auto-sub",
                "--sub-lang", "en",
                "--sub-format", "vtt",
                "--skip-download",
                "--no-warnings",
                "--convert-subs", "vtt",
                "-o", str(output_dir / f"{video_id}.%(ext)s"),
                "--output-na-placeholder", "",
                url
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            # Find the downloaded VTT file — yt-dlp may name it by title, so glob broadly
            vtt_files = list(output_dir.glob(f"*{video_id}*.vtt"))
            if not vtt_files:
                vtt_files = list(output_dir.glob("*.vtt"))
            if not vtt_files:
                return None

            # Convert VTT to clean timestamped text
            vtt_content = vtt_files[0].read_text(encoding='utf-8', errors='ignore')
            clean_text = vtt_to_text(vtt_content)

            if clean_text.strip():
                out_path.write_text(clean_text, encoding='utf-8')
                # Clean up vtt
                for f in vtt_files:
                    f.unlink(missing_ok=True)
                return str(out_path)

        except subprocess.TimeoutExpired:
            print(f"    Timeout on {video_id} (attempt {attempt+1})")
        except Exception as e:
            print(f"    Error on {video_id}: {e}")

        time.sleep(2)

    return None


def vtt_to_text(vtt_content):
    """Convert VTT subtitle content to clean timestamped transcript text."""
    import re
    lines = vtt_content.splitlines()
    result = []
    seen = set()

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Match timestamp lines like: 00:00:03.000 --> 00:00:06.000
        ts_match = re.match(r'(\d{2}):(\d{2}):(\d{2})\.\d+ -->', line)
        if ts_match:
            h, m, s = int(ts_match.group(1)), int(ts_match.group(2)), int(ts_match.group(3))
            total_secs = h*3600 + m*60 + s
            ts_str = f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"

            # Collect text lines after timestamp
            i += 1
            text_parts = []
            while i < len(lines) and lines[i].strip() and '-->' not in lines[i]:
                raw = lines[i].strip()
                # Remove VTT tags like <c>, </c>, <00:00:03.000>
                clean = re.sub(r'<[^>]+>', '', raw).strip()
                if clean:
                    text_parts.append(clean)
                i += 1

            text = ' '.join(text_parts)
            # Deduplicate consecutive identical lines
            if text and text not in seen:
                seen.add(text)
                result.append(f"{ts_str} {text}")
            continue

        i += 1

    return '\n'.join(result)


# ─────────────────────────────────────────────
# INDEX MANAGER
# ─────────────────────────────────────────────

def load_index():
    """Load existing index or return empty dict."""
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return {}


def save_index(index):
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    INDEX_FILE.write_text(json.dumps(index, indent=2))


def already_collected(video_id, index):
    return video_id in index


# ─────────────────────────────────────────────
# MAIN COLLECTION RUN
# ─────────────────────────────────────────────

def run_collection(niches=None, include_trending=True, published_after=None, dry_run=False):
    """
    Full collection run:
    1. Fetch trending videos
    2. Search top videos per niche
    3. Download transcripts
    4. Update index
    """
    if API_KEY == "YOUR_API_KEY":
        print("ERROR: Set your API key first.")
        print("  export YOUTUBE_API_KEY='your_key_here'")
        return

    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)

    youtube = get_youtube_client()
    index   = load_index()
    new_count = 0
    skip_count = 0

    all_videos = []  # (metadata_dict)

    # ── 1. Trending videos ──
    if include_trending:
        print("\n[1] Fetching trending videos...")
        trending = fetch_trending_videos(youtube, max_results=50)
        for item in trending:
            meta = parse_video_metadata(item, niche="Trending", source="trending")
            all_videos.append(meta)
        print(f"    Got {len(trending)} trending videos.")

    # ── 2. Niche searches ──
    target_niches = niches or list(NICHES.keys())
    print(f"\n[2] Searching {len(target_niches)} niches...")

    for niche in target_niches:
        queries = NICHES.get(niche, [niche])
        for query in queries:
            videos = search_videos_by_niche(
                youtube, query,
                max_results=VIDEOS_PER_QUERY,
                published_after=published_after
            )
            for item in videos:
                meta = parse_video_metadata(item, niche=niche, source="search")
                all_videos.append(meta)
            time.sleep(0.5)  # be gentle with the API

    # Deduplicate by video_id
    seen_ids = set()
    unique_videos = []
    for v in all_videos:
        if v["video_id"] not in seen_ids:
            seen_ids.add(v["video_id"])
            unique_videos.append(v)

    print(f"\n[3] Processing {len(unique_videos)} unique videos...")

    for i, meta in enumerate(unique_videos):
        vid = meta["video_id"]

        if already_collected(vid, index):
            skip_count += 1
            continue

        print(f"  [{i+1}/{len(unique_videos)}] {meta['title'][:60]}...")
        print(f"       Views: {meta['views']:,}  |  Niche: {meta['niche']}")

        if not dry_run:
            # Download transcript
            niche_dir = TRANSCRIPTS_DIR / meta["niche"].replace(" ", "_")
            transcript_path = download_transcript(vid, niche_dir)

            if transcript_path:
                meta["transcript_path"] = transcript_path
                meta["transcript_status"] = "ok"
                print(f"       ✓ Transcript saved")
            else:
                meta["transcript_status"] = "no_transcript"
                print(f"       ✗ No transcript available")

            # Save metadata file
            meta_file = METADATA_DIR / f"{vid}.json"
            meta_file.write_text(json.dumps(meta, indent=2))

        index[vid] = meta
        new_count += 1
        time.sleep(1)  # rate limit buffer

    save_index(index)

    print(f"\n{'='*50}")
    print(f"Collection complete.")
    print(f"  New videos processed : {new_count}")
    print(f"  Already in index     : {skip_count}")
    print(f"  Total in index       : {len(index)}")
    print(f"  Index saved to       : {INDEX_FILE}")
    print(f"{'='*50}\n")


# ─────────────────────────────────────────────
# STATS / INSPECTION HELPERS
# ─────────────────────────────────────────────

def print_stats():
    """Print a summary of what's been collected so far."""
    index = load_index()
    if not index:
        print("No data collected yet. Run: python3 collector.py --collect")
        return

    total = len(index)
    with_transcript = sum(1 for v in index.values() if v.get("transcript_status") == "ok")
    by_niche = {}
    by_year  = {}

    for v in index.values():
        niche = v.get("niche", "Unknown")
        by_niche[niche] = by_niche.get(niche, 0) + 1

        year = v.get("published_at", "")[:4]
        if year:
            by_year[year] = by_year.get(year, 0) + 1

    print(f"\n{'='*50}")
    print(f"COLLECTION STATS")
    print(f"{'='*50}")
    print(f"Total videos    : {total}")
    print(f"With transcript : {with_transcript} ({100*with_transcript//total if total else 0}%)")
    print(f"\nBy niche:")
    for niche, count in sorted(by_niche.items(), key=lambda x: -x[1]):
        print(f"  {niche:<20} {count}")
    print(f"\nBy year:")
    for year, count in sorted(by_year.items()):
        print(f"  {year}  {count}")
    print(f"{'='*50}\n")


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='YouTube Trending Data Collector')
    parser.add_argument('--collect', action='store_true',
        help='Run a collection pass (fetch videos + download transcripts)')
    parser.add_argument('--stats', action='store_true',
        help='Print stats on collected data')
    parser.add_argument('--niches', nargs='+', default=None,
        help='Specific niches to collect (default: all)')
    parser.add_argument('--no-trending', action='store_true',
        help='Skip trending videos, only do niche searches')
    parser.add_argument('--after', default=None,
        help='Only collect videos published after this date (YYYY-MM-DD)')
    parser.add_argument('--dry-run', action='store_true',
        help='Fetch metadata only, skip transcript downloads')

    args = parser.parse_args()

    if args.stats:
        print_stats()
        return

    if args.collect:
        published_after = None
        if args.after:
            published_after = f"{args.after}T00:00:00Z"

        run_collection(
            niches=args.niches,
            include_trending=not args.no_trending,
            published_after=published_after,
            dry_run=args.dry_run,
        )
        return

    parser.print_help()


if __name__ == '__main__':
    main()
