#!/usr/bin/env python3
"""
Ingest researched content from /mnt/AI/ag/Campaign/ to enrich surah personalities,
thematic sections, and classical annotations across the Qur'an knowledge base.
"""

import os
import sys
import json
import re
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CAMPAIGN_DIR = '/mnt/AI/ag/Campaign'
DATA_QURAN_DIR = os.path.join(BASE_DIR, 'data', 'quran')
DATA_SURAHS_DIR = os.path.join(BASE_DIR, 'data', 'surahs')

# Mapping between surah ID and Campaign research file naming
SURAH_NAME_MAP = {
    1: "FATIHAH",
    2: "BAQARAH-PART-01",
    3: "ALI-IMRAN",
    4: "AN-NISA",
    5: "AL-MAIDAH",
    6: "AL-ANAM",
    7: "AL-ARAF",
    8: "AL-ANFAL",
    9: "AT-TAWBAH",
    10: "YUNUS",
    11: "HUD",
    12: "YUSUF",
    13: "RAD",
    14: "IBRAHIM",
    15: "HIJR",
    16: "NAHL",
    17: "ISRA",
    18: "KAHF",
    19: "MARYAM",
    20: "TAHA",
    21: "ANBIYA",
    22: "HAJJ",
    23: "MUMINUN",
    24: "NUR",
    25: "AL-FURQAN",
    26: "ASH-SHUARA",
    27: "AN-NAML",
    28: "AL-QASAS",
    29: "AL-ANKABUT",
    30: "AR-RUM",
    31: "LUQMAN",
    32: "AS-SAJDAH",
    33: "AL-AHZAB",
    34: "SABA",
    35: "FATIR",
    36: "YASIN",
    37: "SAFFAT",
    38: "SAD",
    39: "ZUMAR",
    40: "GHAFIR",
    41: "FUSSILAT",
    42: "SHURA",
    43: "ZUKHRUF",
    44: "DUKHAN",
    45: "JATHIYAH",
    46: "AHQAF",
    47: "MUHAMMAD",
    48: "FATH",
    49: "HUJURAT",
    50: "QAF",
    51: "DHARIYAT",
    52: "TUR",
    53: "NAJM",
    54: "QAMAR",
    55: "RAHMAN",
    56: "AL-WAQIAH",
    57: "AL-HADID",
    58: "AL-MUJADILAH",
    59: "AL-HASHR",
    60: "AL-MUMTAHANAH",
    61: "AS-SAFF",
    62: "AL-JUMUAH",
    63: "AL-MUNAFIQUN",
    64: "AT-TAGHABUN",
    65: "AT-TALAQ",
    66: "AT-TAHRIM",
    67: "AL-MULK",
    68: "AL-QALAM",
    69: "AL-HAQQAH",
    70: "AL-MAARIJ",
    71: "NUH",
    72: "AL-JINN",
    73: "AL-MUZZAMMIL",
    74: "AL-MUDDATHTHIR",
    75: "AL-QIYAMAH",
    76: "AL-INSAN",
    77: "AL-MURSALAT"
}

def clean_markdown_text(text):
    text = re.sub(r'[*_`#]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_surah_personality(surah_id, code):
    research_path = os.path.join(CAMPAIGN_DIR, '01_RESEARCH', f'DEEPER-THOUGHT-RESEARCH-{code}.md')
    if not os.path.exists(research_path):
        return None
        
    with open(research_path, encoding='utf-8', errors='ignore') as f:
        content = f.read()
        
    # Extract title
    m_title = re.search(r'title:\s*\"([^\"]+)\"', content)
    title = m_title.group(1) if m_title else ""
    title = re.sub(r'^(Primary Research Dossier:\s*|Surah\s*)', '', title)
    title = title.replace('Primary Research Dossier: ', '').strip()
    
    # Extract executive summary
    m_exec = re.search(r'## 1\.\s*(?:Executive Summary[^\n]*)\n\n(.*?)(?=\n## 2\.|\n---\n)', content, re.DOTALL)
    summary = ""
    if m_exec:
        summary_raw = m_exec.group(1).strip()
        paragraphs = summary_raw.split('\n\n')
        # Take first meaningful paragraph
        for p in paragraphs:
            cleaned = clean_markdown_text(p)
            if len(cleaned) > 80:
                summary = cleaned
                break
                
    if not summary:
        summary = f"Autonomous Qur'anic surah possessing a distinctive theological axis, spiritual atmosphere, and structural cadence."
        
    # Distinctive voice inference from title and text
    voice = "Authoritative, reflective, sublime."
    if "Makkan" in content or "Makkah" in content:
        voice = "Cosmic, urgent, warning, foundational monotheism."
    elif "Madinan" in content or "Madinah" in content:
        voice = "Constitutional, legislative, covenantal, community-building."
        
    return {
        "personality_title": title,
        "personality_summary": summary,
        "distinctive_voice": voice
    }

def main():
    print("=== Ingesting Researched Content from Campaign Folder ===")
    
    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), encoding='utf-8') as f:
        surahs = json.load(f)
        
    enriched_count = 0
    for s in surahs:
        s_id = s['id']
        code = SURAH_NAME_MAP.get(s_id)
        if code:
            pers = extract_surah_personality(s_id, code)
            if pers and pers.get('personality_title'):
                s['personality_title'] = pers['personality_title']
                s['personality_summary'] = pers['personality_summary']
                s['distinctive_voice'] = pers['distinctive_voice']
                enriched_count += 1
                
                # Update individual surah file if it exists
                surah_file = os.path.join(DATA_SURAHS_DIR, f"{s_id:03d}.json")
                if os.path.exists(surah_file):
                    with open(surah_file, encoding='utf-8') as sf:
                        s_data = json.load(sf)
                    s_data['surah']['personality_title'] = pers['personality_title']
                    s_data['surah']['personality_summary'] = pers['personality_summary']
                    s_data['surah']['distinctive_voice'] = pers['distinctive_voice']
                    with open(surah_file, 'w', encoding='utf-8') as sf:
                        json.dump(s_data, sf, ensure_ascii=False, indent=2)

    # Save enriched surahs.json
    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)
        
    print(f"✓ Successfully enriched {enriched_count} surahs with deep research from Campaign.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
