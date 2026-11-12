#!/usr/bin/env python3
"""
Aggregate relationships and evidence from research/pilots/ and research/relationships/ into data/relationships/
"""

import os
import sys
import json
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_REL_DIR = os.path.join(BASE_DIR, 'data', 'relationships')
os.makedirs(DATA_REL_DIR, exist_ok=True)

def main():
    print("Aggregating all relationships and evidence...")
    rel_files = glob.glob(os.path.join(BASE_DIR, 'research', 'pilots', '*', 'relationships.json')) + \
                glob.glob(os.path.join(BASE_DIR, 'research', 'relationships', '*relationships*.json'))
                
    ev_files = glob.glob(os.path.join(BASE_DIR, 'research', 'pilots', '*', 'evidence.json')) + \
               glob.glob(os.path.join(BASE_DIR, 'research', 'relationships', '*evidence*.json'))
    
    all_relationships = []
    all_evidence = []
    
    seen_rel = set()
    for rf in rel_files:
        with open(rf, encoding='utf-8') as f:
            for item in json.load(f):
                if item['id'] not in seen_rel:
                    all_relationships.append(item)
                    seen_rel.add(item['id'])
            
    seen_ev = set()
    for ef in ev_files:
        with open(ef, encoding='utf-8') as f:
            for item in json.load(f):
                if item['id'] not in seen_ev:
                    all_evidence.append(item)
                    seen_ev.add(item['id'])
            
    print(f"Total deduplicated relationships: {len(all_relationships)}")
    print(f"Total deduplicated evidence items: {len(all_evidence)}")
    
    with open(os.path.join(DATA_REL_DIR, 'relationships.json'), 'w', encoding='utf-8') as f:
        json.dump(all_relationships, f, ensure_ascii=False, indent=2)
        
    with open(os.path.join(DATA_REL_DIR, 'evidence.json'), 'w', encoding='utf-8') as f:
        json.dump(all_evidence, f, ensure_ascii=False, indent=2)
        
    print("✓ Successfully aggregated into data/relationships/")
    return 0

if __name__ == '__main__':
    sys.exit(main())
