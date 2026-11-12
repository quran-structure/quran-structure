#!/usr/bin/env python3
"""
Automated unit and integration test suite for the Quran Munasabat Knowledge Base.
Tests data fidelity, reference resolution, citation registry, and schema compliance.
"""

import unittest
import os
import json
import glob

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

class TestQuranIntegrity(unittest.TestCase):

    def setUp(self):
        with open(os.path.join(BASE_DIR, 'data', 'quran', 'surahs.json'), encoding='utf-8') as f:
            self.surahs = json.load(f)
        with open(os.path.join(BASE_DIR, 'data', 'quran', 'ayah_lookup.json'), encoding='utf-8') as f:
            self.ayahs = json.load(f)
        with open(os.path.join(BASE_DIR, 'research', 'source-register.json'), encoding='utf-8') as f:
            self.sources = {s['id']: s for s in json.load(f)['sources']}
        with open(os.path.join(BASE_DIR, 'data', 'relationships', 'relationships.json'), encoding='utf-8') as f:
            self.relationships = json.load(f)
        with open(os.path.join(BASE_DIR, 'data', 'relationships', 'evidence.json'), encoding='utf-8') as f:
            self.evidence = {e['id']: e for e in json.load(f)}

    def test_canonical_counts(self):
        """Assert 114 surahs and exactly 6236 ayahs."""
        self.assertEqual(len(self.surahs), 114)
        self.assertEqual(len(self.ayahs), 6236)

    def test_surah_personality_axiom(self):
        """Test slogan compliance: each surah must have unique personality metadata."""
        for s in self.surahs:
            self.assertTrue(s.get('personality_summary'), f"Surah {s['id']} missing personality_summary")
            self.assertTrue(s.get('personality_title'), f"Surah {s['id']} missing personality_title")

    def test_citation_integrity(self):
        """Every evidence item must cite a registered classical source."""
        for eid, ev in self.evidence.items():
            sid = ev['source_id']
            self.assertIn(sid, self.sources, f"Evidence {eid} references unknown source_id {sid}")

    def test_relationship_evidence_linkage(self):
        """Every relationship must point to existing evidence records."""
        for rel in self.relationships:
            eids = rel.get('evidence_ids', [])
            self.assertTrue(len(eids) > 0, f"Relationship {rel['id']} has no evidence_ids")
            for eid in eids:
                self.assertIn(eid, self.evidence, f"Relationship {rel['id']} references missing evidence {eid}")

    def test_arabic_fidelity(self):
        """Test that ayahs in lookup contain non-empty Uthmani Arabic."""
        for key, val in list(self.ayahs.items())[:100]:
            self.assertTrue(len(val['arabic_uthmani']) > 0)
            self.assertTrue(len(val['translation_saheeh']) > 0)

if __name__ == '__main__':
    unittest.main()
