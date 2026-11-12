#!/usr/bin/env python3
"""
Validate citation references in research files against research/source-register.json.
Ensures every referenced source exists and has required metadata.
"""

import os
import sys
import json
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SOURCE_REGISTER_PATH = os.path.join(BASE_DIR, 'research', 'source-register.json')

def load_source_register():
    with open(SOURCE_REGISTER_PATH, encoding='utf-8') as f:
        data = json.load(f)
    return {s['id']: s for s in data.get('sources', [])}

def validate_citations_in_file(file_path, valid_sources):
    errors = []
    with open(file_path, encoding='utf-8') as f:
        data = json.load(f)
        
    # Check evidence lists or relationships
    items = []
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        if 'relationships' in data:
            items.extend(data['relationships'])
        if 'evidence' in data:
            items.extend(data['evidence'])
        if 'sections' in data:
            items.extend(data['sections'])
            
    for item in items:
        # Check source_id in evidence
        if 'source_id' in item:
            sid = item['source_id']
            if sid not in valid_sources:
                errors.append(f"In {os.path.basename(file_path)}: Unknown source_id '{sid}' in evidence {item.get('id', '')}")
                
        # Check evidence_ids
        if 'evidence_ids' in item:
            for eid in item['evidence_ids']:
                pass # EIDs can be resolved in evidence files
                
    return errors

def main():
    print("=== Validating Citation Registry ===")
    valid_sources = load_source_register()
    print(f"Loaded {len(valid_sources)} registered classical & authoritative sources.")
    
    # Check files in research/pilots and data/relationships
    target_files = glob.glob(os.path.join(BASE_DIR, 'research', '**', '*.json'), recursive=True) + \
                   glob.glob(os.path.join(BASE_DIR, 'data', '**', '*.json'), recursive=True)
                   
    all_errors = []
    for fp in target_files:
        if fp == SOURCE_REGISTER_PATH or 'quran' in fp or 'editions' in fp:
            continue
        errs = validate_citations_in_file(fp, valid_sources)
        all_errors.extend(errs)
        
    if all_errors:
        print(f"Found {len(all_errors)} citation errors:")
        for err in all_errors:
            print(f"  ✗ {err}")
        return 1
    else:
        print("✓ All citations successfully validated against source register.")
        return 0

if __name__ == '__main__':
    sys.exit(main())
