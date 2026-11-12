#!/usr/bin/env python3
"""
Build script for the website prototype.
Copies data files into site/data/ and verifies structure.
"""

import os
import sys
import json
import shutil
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SITE_DATA_DIR = os.path.join(BASE_DIR, 'site', 'data')
os.makedirs(SITE_DATA_DIR, exist_ok=True)

def main():
    print("Building site data bundle...")
    
    # 1. Copy surahs metadata
    src_surahs = os.path.join(BASE_DIR, 'data', 'quran', 'surahs.json')
    dst_surahs = os.path.join(SITE_DATA_DIR, 'surahs.json')
    shutil.copyfile(src_surahs, dst_surahs)
    
    # 2. Copy source register
    src_sources = os.path.join(BASE_DIR, 'research', 'source-register.json')
    dst_sources = os.path.join(SITE_DATA_DIR, 'sources.json')
    shutil.copyfile(src_sources, dst_sources)
    
    # 3. Copy compiled relationships & evidence
    src_rel = os.path.join(BASE_DIR, 'data', 'relationships', 'relationships.json')
    dst_rel = os.path.join(SITE_DATA_DIR, 'relationships.json')
    shutil.copyfile(src_rel, dst_rel)
    
    src_ev = os.path.join(BASE_DIR, 'data', 'relationships', 'evidence.json')
    dst_ev = os.path.join(SITE_DATA_DIR, 'evidence.json')
    shutil.copyfile(src_ev, dst_ev)
    
    # 4. Copy themes
    src_th = os.path.join(BASE_DIR, 'data', 'themes', 'thematic_networks.json')
    dst_th = os.path.join(SITE_DATA_DIR, 'themes.json')
    shutil.copyfile(src_th, dst_th)
    
    # 5. Copy all 114 surahs into site/data/surahs for seamless interactive exploration
    site_surahs_dir = os.path.join(SITE_DATA_DIR, 'surahs')
    os.makedirs(site_surahs_dir, exist_ok=True)
    
    surah_files = glob.glob(os.path.join(BASE_DIR, 'data', 'surahs', '*.json'))
    for sf in surah_files:
        dst_s = os.path.join(site_surahs_dir, os.path.basename(sf))
        shutil.copyfile(sf, dst_s)
            
    print(f"✓ Copied data bundles and {len(surah_files)} surah files into site/data/")
    return 0

if __name__ == '__main__':
    sys.exit(main())
