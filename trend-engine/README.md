# Not-AI-Slop — YouTube Trend-Aware Video Script Generator

A pipeline that collects trending YouTube transcripts, analyses style evolution across years using a sliding window, and generates video scripts shaped by what actually performed well in a given year and niche.

## How it works

```
1. collector.py / channel_collector.py / focused_collector.py
   → Fetches trending YouTube videos + downloads transcripts

2. ingest_hf.py
   → Ingests the jamescalam/youtube-transcriptions HuggingFace dataset (695 Tech/AI videos)

3. analyser.py
   → Sliding window analysis across years
   → Extracts hook patterns, pacing, vocabulary, CTA rate per cohort
   → Saves style profiles per niche

4. pipeline.py
   → Generates scripts (mimic / own / remix style)
   → Loads year-specific style profile to shape guidance
   → Outputs timestamped .txt scripts
```

## Setup

```bash
pip install google-api-python-client yt-dlp datasets --break-system-packages
export YOUTUBE_API_KEY='your_key_here'
```

## Usage

### Collect data
```bash
python3 collector.py --collect           # broad collection
python3 channel_collector.py             # curated channels (better transcript rate)
python3 ingest_hf.py                     # ingest HuggingFace dataset (Tech/AI)
```

### Analyse
```bash
python3 analyser.py --analyse
python3 analyser.py --profile Tech_AI
```

### Generate scripts
```bash
# Single file
python3 pipeline.py my_transcript.txt --style remix --niche Tech_AI --year 2023

# Batch
python3 pipeline.py ./transcripts/ --style own --niche Tech_AI --year 2024 --output ./scripts

# Styles: mimic | own | remix
# Niches: Tech_AI | Self_Improvement | Health_Fitness
# Years:  2019 – 2025
```

## Data structure

```
corpus/
  index.json                        master index of all collected videos
  transcripts/
    Tech_AI/                        transcripts by niche
    Self_Improvement/
    Health_Fitness/
  style_profiles/
    Tech_AI_profile.json            style guidance per niche
    _all_profiles.json
data/
  index.json                        legacy index from broad collector
```

## Current corpus

- Tech/AI: 695 videos, 9 cohorts (2016–2025)
- Self Improvement: pending
- Health/Fitness: pending

## Files

| File | Purpose |
|------|---------|
| `pipeline.py` | Main script generator |
| `analyser.py` | Sliding window trend analyser |
| `collector.py` | Broad YouTube API collector |
| `channel_collector.py` | Curated channel collector |
| `focused_collector.py` | Year-targeted niche collector |
| `ingest_hf.py` | HuggingFace dataset ingestion |
| `README.md` | This file |

## Next steps

- [ ] Wire Anthropic API into `_rewrite_chunk` for LLM-powered rewriting
- [ ] Add Self Improvement + Health/Fitness corpus
- [ ] Image prompt generator per script section
