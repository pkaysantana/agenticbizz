#!/usr/bin/env python3
"""
Ingest jamescalam/youtube-transcriptions from Hugging Face
into the corpus format used by analyser.py
"""

import json
from pathlib import Path
from collections import defaultdict
from datasets import load_dataset

DATA_ROOT = Path("./corpus")
INDEX     = DATA_ROOT / "index.json"

# All videos in this dataset are Tech/AI
NICHE = "Tech_AI"

def load_index():
    if INDEX.exists():
        return json.loads(INDEX.read_text())
    return {}

def save_index(idx):
    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    INDEX.write_text(json.dumps(idx, indent=2))

def run():
    print("Loading dataset from Hugging Face...")
    data = load_dataset("jamescalam/youtube-transcriptions", split="train")
    print(f"  {len(data):,} transcript chunks across all videos")

    # Group chunks by video_id and reconstruct full transcripts
    print("Grouping chunks by video...")
    videos = defaultdict(lambda: {"chunks": [], "meta": {}})

    for row in data:
        vid = row["video_id"]
        videos[vid]["chunks"].append({
            "start": row["start"],
            "end":   row["end"],
            "text":  row["text"],
        })
        if not videos[vid]["meta"]:
            videos[vid]["meta"] = {
                "title":      row["title"],
                "published":  row["published"],
                "url":        row["url"],
                "channel_id": row["channel_id"],
                "video_id":   vid,
            }

    print(f"  Found {len(videos):,} unique videos")

    # Save transcripts and build index
    index     = load_index()
    out_dir   = DATA_ROOT / "transcripts" / NICHE
    out_dir.mkdir(parents=True, exist_ok=True)

    saved = 0
    skipped = 0

    for vid, vdata in videos.items():
        if vid in index and index[vid].get("transcript_status") == "ok":
            skipped += 1
            continue

        meta   = vdata["meta"]
        chunks = sorted(vdata["chunks"], key=lambda x: x["start"])

        # Build timestamped transcript text
        lines = []
        for chunk in chunks:
            secs = int(chunk["start"])
            m, s = secs // 60, secs % 60
            ts   = f"{m}:{s:02d}"
            text = chunk["text"].strip()
            if text:
                lines.append(f"{ts} {text}")

        transcript = "\n".join(lines)
        if len(transcript.split()) < 100:
            skipped += 1
            continue

        # Save transcript file
        out_file = out_dir / f"{vid}.txt"
        out_file.write_text(transcript, encoding="utf-8")

        # Extract year
        year = meta["published"][:4] if meta.get("published") else "unknown"

        index[vid] = {
            "video_id":          vid,
            "title":             meta["title"],
            "channel":           meta["channel_id"],
            "published_at":      meta["published"],
            "niche":             NICHE,
            "year":              year,
            "views":             0,   # not available in this dataset
            "likes":             0,
            "collected_at":      meta["published"],
            "transcript_status": "ok",
            "transcript_path":   str(out_file),
        }
        saved += 1

        if saved % 50 == 0:
            save_index(index)
            print(f"  Saved {saved} transcripts...")

    save_index(index)

    # Summary by year
    by_year = defaultdict(int)
    for v in index.values():
        if v.get("niche") == NICHE and v.get("transcript_status") == "ok":
            by_year[v.get("year", "unknown")] += 1

    print(f"\n{'='*50}")
    print(f"INGESTION COMPLETE")
    print(f"  Saved     : {saved}")
    print(f"  Skipped   : {skipped}")
    print(f"  Total     : {len(index)}")
    print(f"\nBy year:")
    for year in sorted(by_year):
        bar = "█" * min(by_year[year], 40)
        print(f"  {year}  {bar} {by_year[year]}")
    print(f"{'='*50}\n")
    print("Now run: python3 analyser.py --analyse")

if __name__ == "__main__":
    run()
