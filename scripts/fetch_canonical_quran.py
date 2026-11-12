#!/usr/bin/env python3
"""
Fetch verified canonical Qur'an datasets (Arabic text, Surah metadata, English translations).
Saves structured JSON data in data/quran/.
"""

import os
import sys
import json
import urllib.request
import ssl

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

DATA_QURAN_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'quran'))
os.makedirs(DATA_QURAN_DIR, exist_ok=True)

def fetch_json(url):
    print(f"Fetching: {url}")
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return json.loads(resp.read().decode('utf-8'))

def main():
    with open(os.path.join(DATA_QURAN_DIR, 'editions.json')) as f:
        editions = json.load(f)
        
    targets = {
        'ara_quranuthmanihaf': 'ara-uthmani-hafs.json',
        'ara_quransimple': 'ara-simple.json',
        'eng_ummmuhammad': 'eng-saheeh.json',
        'eng_abdelhaleem': 'eng-abdelhaleem.json'
    }
    
    for key, filename in targets.items():
        if key in editions:
            link = editions[key]['link']
            dest = os.path.join(DATA_QURAN_DIR, filename)
            if not os.path.exists(dest):
                print(f"Downloading {key} -> {filename} from {link}")
                data = fetch_json(link)
                with open(dest, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"✓ Saved {filename} ({len(data.get('quran', []))} ayahs)")
            else:
                print(f"✓ {filename} already exists")
        else:
            print(f"Warning: {key} not found in editions.json")
            
    print("\nCanonical data acquisition completed.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
