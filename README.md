# The Qur'an in Conversation
### A Study of Surah, Ayah and Thematic Connections

> **Core Project Slogan:**  
> *"Each surah is unique and has a different personality."*

---

## Overview

**The Qur'an in Conversation** is a rigorous, source-backed digital research atlas and knowledge base dedicated to investigating how the 114 surahs and 6,236 ayat of the Holy Qur'an relate to one another within the canonical *muṣḥaf* order.

Grounded firmly in classical Sunni Qur'anic scholarship (*Tafsir* and *ʿUlūm al-Qur'ān*), the project analyzes:
1. **Munāsabāt al-Suwar:** Relationships and handoffs between adjacent surahs.
2. **Surah Architecture & Personality:** Internal thematic sections, distinctive atmosphere (*Jaww al-Sūrah*), voice, and rhetorical cadence.
3. **Opening & Ending Correspondences:** Structural envelopes (*Maṭāliʿ wa Maqāṭiʿ*) connecting the first and last verses of surahs.
4. **Thematic Networks:** Overarching themes traced across the Qur'an without homogenizing distinct contexts.

---

## Repository Structure

```text
├── AGENTODO.md                     # Master project instructions & research guidelines
├── docs/
│   └── research-methodology.md     # Sunni source discipline & confidence framework
├── schemas/                        # Formal JSON schemas for data integrity
│   ├── surah.schema.json
│   ├── ayah.schema.json
│   ├── relationship.schema.json
│   ├── source.schema.json
│   └── evidence.schema.json
├── research/
│   ├── source-register.json        # 14 verified classical Sunni references
│   └── pilots/
│       ├── 001-fatihah-baqarah/    # Pilot 1: Al-Fatihah → Al-Baqarah
│       ├── 002-baqarah-ali-imran/  # Pilot 2: Al-Baqarah → Al 'Imran
│       ├── 003-qamar-rahman-waqiah/# Pilot 3: Al-Qamar → Ar-Rahman → Al-Waqi'ah
│       └── 004-matali-maqati/      # Pilot 4: Openings & Endings (Al-Mu'minun, Al-Qasas, Al-Kahf)
├── data/
│   ├── quran/                      # Canonical 114 surahs & 6236 ayahs (Tanzil Hafs + Saheeh Intl)
│   ├── surahs/                     # Individual surah JSON records (001.json - 114.json)
│   └── relationships/              # Consolidated relationships & classical evidence
├── scripts/
│   ├── fetch_canonical_quran.py    # Fetches verified Tanzil text & translations
│   ├── compile_canonical_dataset.py# Compiles unified dataset & personality profiles
│   ├── compile_relationships.py    # Merges pilot relationships & evidence
│   ├── validate_quran_references.py# Validates verse references & bounds
│   ├── validate_citations.py       # Validates citations against source register
│   ├── validate_data.py            # System integrity & personality assertion
│   └── build_site.py               # Generates data bundle for website atlas
├── site/                           # Static Research Atlas web application
│   ├── index.html
│   ├── assets/ (style.css, app.js)
│   └── data/
└── tests/
    └── test_system_integrity.py    # Automated test suite (Python unittest)
```

---

## Validation & Verification

Run the complete test suite:
```bash
python3 -m unittest tests/test_system_integrity.py
python3 scripts/validate_citations.py
python3 scripts/validate_quran_references.py
python3 scripts/validate_data.py
```

---

## Viewing the Research Atlas

The web application in `site/` is completely static and lightweight. Open `site/index.html` directly in any modern browser or run a simple local web server:
```bash
python3 -m http.server 8000 --directory site
```
Visit `http://localhost:8000` to explore the 114 surahs, view the pilot transitions, explore opening/closing correspondences, and inspect classical citations from Al-Biqāʿī, Ibn al-Zubayr al-Gharnāṭī, Al-Suyūṭī, and Al-Rāzī.
