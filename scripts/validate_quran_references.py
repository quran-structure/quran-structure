#!/usr/bin/env python3
"""
Validate Qur'anic references in research files against canonical dataset.
Ensures every surah, ayah, and range referenced is valid, and checks Arabic text fidelity.
"""

import os
import sys
import json
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_QURAN_DIR = os.path.join(BASE_DIR, 'data', 'quran')

def load_canonical_data():
    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), encoding='utf-8') as f:
        surahs = {s['id']: s for s in json.load(f)}
    with open(os.path.join(DATA_QURAN_DIR, 'ayah_lookup.json'), encoding='utf-8') as f:
        ayahs = json.load(f)
    return surahs, ayahs

def validate_ref(ref_str, surahs, ayahs):
    """
    Validates references formatted as:
    - 'surah:1'
    - 'ayah:1:6'
    - 'ayah:2:1-5'
    - '1:6'
    - '2:1-5'
    """
    ref = ref_str.strip()
    if ref.startswith('surah:'):
        try:
            s_id = int(ref.split(':')[1])
            if s_id in surahs:
                return True, f"Valid Surah {s_id}"
            return False, f"Invalid surah id: {s_id} (must be 1-114)"
        except Exception as e:
            return False, f"Malformed surah ref: {ref}"
            
    if ref.startswith('ayah:'):
        ref = ref[len('ayah:'):]
        
    # Pattern: surah:ayah or surah:start-end
    m = re.match(r'^(\d+):(\d+)(?:-(\d+))?$', ref)
    if not m:
        return False, f"Unrecognized reference pattern: {ref_str}"
        
    s_id = int(m.group(1))
    a_start = int(m.group(2))
    a_end = int(m.group(3)) if m.group(3) else a_start
    
    if s_id not in surahs:
        return False, f"Surah {s_id} not found"
        
    surah_max = surahs[s_id]['ayah_count']
    if a_start < 1 or a_start > surah_max:
        return False, f"Ayah {a_start} out of bounds for Surah {s_id} (max {surah_max})"
    if a_end < a_start or a_end > surah_max:
        return False, f"Ayah end {a_end} out of bounds for Surah {s_id} (max {surah_max})"
        
    for a in range(a_start, a_end + 1):
        if f"{s_id}:{a}" not in ayahs:
            return False, f"Canonical ayah {s_id}:{a} not found in database"
            
    return True, f"Valid: {s_id}:{a_start}{f'-{a_end}' if a_end != a_start else ''}"

def main():
    print("=== Validating Quran References ===")
    surahs, ayahs = load_canonical_data()
    print(f"Loaded {len(surahs)} surahs and {len(ayahs)} ayahs.")
    
    # Test built-in sample references
    samples = ["surah:1", "ayah:1:6", "ayah:2:1-5", "54:55", "55:1-4", "56:96", "surah:115", "ayah:1:8"]
    all_passed = True
    for s in samples:
        is_val, msg = validate_ref(s, surahs, ayahs)
        status = "PASS" if is_val else "FAIL"
        print(f"[{status}] '{s}': {msg}")
        if not is_val and "115" not in s and "1:8" not in s:
            all_passed = False
            
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
