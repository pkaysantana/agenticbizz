#!/usr/bin/env python3
"""
Not-AI-Slop Dashboard Server
Reads real corpus style profiles and serves an interactive demo dashboard.

Usage:
    python3 dashboard/server.py
    Then open http://localhost:5000
"""

import json
import re
from pathlib import Path
from collections import Counter
from http.server import HTTPServer, BaseHTTPRequestHandler

# Paths — relative to project root
ROOT          = Path(__file__).resolve().parent.parent
PROFILES_DIR  = ROOT / "corpus" / "style_profiles"
INDEX_FILE    = ROOT / "corpus" / "index.json"
TRANSCRIPTS   = ROOT / "corpus" / "transcripts"
DASHBOARD_DIR = Path(__file__).resolve().parent

PORT = 5000


# ─────────────────────────────────────────────
# DATA BUILDER — converts profiles into dashboard JSON
# ─────────────────────────────────────────────

def get_excerpt(niche, year, position):
    """Pull a representative excerpt from a transcript of the given niche+year."""
    index = load_index()
    candidates = [
        v for v in index.values()
        if v.get("niche") == niche
        and v.get("year") == str(year)
        and v.get("transcript_status") == "ok"
        and v.get("transcript_path")
    ]
    if not candidates:
        return None

    # Pick first available transcript
    for c in candidates:
        path = Path(c["transcript_path"])
        if not path.is_absolute():
            path = ROOT / path
        if path.exists():
            text = path.read_text(encoding="utf-8", errors="ignore")
            lines = [l for l in text.splitlines() if l.strip()]
            # Strip timestamps
            clean = []
            for l in lines:
                m = re.match(r'^\d+:\d+\s+(.*)', l)
                clean.append(m.group(1) if m else l)

            if len(clean) < 6:
                continue

            if position == "opening":
                seg = clean[:4]
            elif position == "midpoint":
                mid = len(clean) // 2
                seg = clean[mid:mid+4]
            else:  # ending
                seg = clean[-4:]

            return ' '.join(seg)[:400]
    return None


def load_index():
    if INDEX_FILE.exists():
        return json.loads(INDEX_FILE.read_text())
    return {}


def load_profile(niche):
    path = PROFILES_DIR / f"{niche}_profile.json"
    if path.exists():
        return json.loads(path.read_text())
    return None


def build_dashboard_data():
    """Build the full dashboard dataset from real corpus profiles."""
    data = {}

    if not PROFILES_DIR.exists():
        return {"error": "No profiles found. Run: python3 analyser.py --analyse"}

    profile_files = list(PROFILES_DIR.glob("*_profile.json"))
    niches = [f.stem.replace("_profile", "") for f in profile_files
              if not f.stem.startswith("_")]

    for niche in niches:
        profile = load_profile(niche)
        if not profile:
            continue

        cohorts = {}
        for c in profile.get("cohort_history", []):
            year = c["cohort"]
            cohorts[year] = {
                "count":        c.get("video_count", 0),
                "wordCount":    int(c.get("top_avg_word_count", 0)),
                "sentenceLen":  round(c.get("top_sentence_len", 0)),
                "pacing":       round(c.get("top_pacing", 0)),
                "powerDensity": c.get("top_power_density", 0),
                "ctaRate":      round(c.get("top_cta_rate", 0)),
                "hooks":        c.get("top_hook_patterns", {}),
                "vocab":        c.get("trending_vocab", [])[:15],
                "opening":      get_excerpt(niche, year, "opening") or "(no transcript sample available)",
                "midpoint":     get_excerpt(niche, year, "midpoint") or "(no transcript sample available)",
                "ending":       get_excerpt(niche, year, "ending") or "(no transcript sample available)",
            }

        data[niche] = {
            "guidance": profile.get("script_guidance", ""),
            "cohorts":  cohorts,
        }

    return data


# ─────────────────────────────────────────────
# HTTP SERVER
# ─────────────────────────────────────────────

class DashboardHandler(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass  # quiet

    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            html = (DASHBOARD_DIR / "index.html").read_text(encoding="utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(html.encode("utf-8"))

        elif self.path == "/api/data":
            data = build_dashboard_data()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode("utf-8"))

        else:
            self.send_response(404)
            self.end_headers()


def main():
    print(f"""
╔══════════════════════════════════════════════╗
║   Not-AI-Slop Dashboard                        ║
╠══════════════════════════════════════════════╣
║   Reading corpus from:                         ║
║   {str(PROFILES_DIR):<44}║
║                                                ║
║   Open in browser:                             ║
║   http://localhost:{PORT}                        ║
║                                                ║
║   Press Ctrl+C to stop                         ║
╚══════════════════════════════════════════════╝
""")

    if not PROFILES_DIR.exists():
        print("⚠  WARNING: No style profiles found.")
        print("   Run this first: python3 analyser.py --analyse\n")

    server = HTTPServer(("localhost", PORT), DashboardHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nDashboard stopped.")
        server.shutdown()


if __name__ == "__main__":
    main()
