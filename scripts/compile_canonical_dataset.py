#!/usr/bin/env python3
"""
Compile raw Quran data files into structured canonical format:
- data/quran/surahs.json (all 114 surahs metadata and personality profiles)
- data/quran/ayah_lookup.json (surah:ayah -> text & translations)
- data/surahs/{id:03d}.json (individual surah dossiers)
"""

import os
import sys
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_QURAN_DIR = os.path.join(BASE_DIR, 'data', 'quran')
DATA_SURAHS_DIR = os.path.join(BASE_DIR, 'data', 'surahs')

os.makedirs(DATA_SURAHS_DIR, exist_ok=True)

# Personality profiles and distinctive identities for surahs
# Each surah is unique and has a different personality
SURAH_PERSONALITIES = {
    1: {
        "personality_title": "Umm al-Kitāb (The Mother of the Book) — The Gateway of Devotional Covenant",
        "personality_summary": "A concise, rhythmic, liturgical opening that moves symmetrically from the objective majesty of divine praise (Tawḥīd and Mercy) to the intimate second-person commitment of servitude (Iyyāka na'budu), culminating in the desperate human petition for the Straight Path. It sets the orientation and spiritual posture of the seeker before entering the vast expanse of the Qur'an.",
        "distinctive_voice": "Devotional, communal, invocatory, foundational.",
        "opening_ending_dynamic": "Opens with universal praise of the Lord of all worlds (Rabb al-'Ālamīn) and closes with the petition to be safeguarded from those who incur anger or wander astray."
    },
    2: {
        "personality_title": "Al-Baqarah — The Comprehensive Constitution of the Vicegerency",
        "personality_summary": "Majestic, legislative, covenantal, and vast. Al-Baqarah functions as the comprehensive blueprint for humanity's stewardship on earth, answering Al-Fatihah's plea for guidance. It navigates from the archetypal appointment of Adam as khalifah, through a thorough critique of the historical covenant failures of Banī Isrā'īl, to the Abrahamic foundation of the Ka'bah and the establishment of an independent, balanced community (Ummatan Wasaṭan) governed by holistic law, civil ethics, economic justice, and reliant supplication.",
        "distinctive_voice": "Architectural, legislative, covenantal, authoritative.",
        "opening_ending_dynamic": "Opens declaring the Book as undeniable guidance for the God-conscious (Hudan lil-muttaqīn) and closes with the believers' collective surrender and plea for forgiveness and divine aid against disbelief (2:285-286)."
    },
    3: {
        "personality_title": "Āl ʿImrān — The Shield of Steadfastness and Intellectual Resilience",
        "personality_summary": "Vigorous, apologetic, pastoral, and resilient. Where Al-Baqarah establishes the internal institutions and law of the Muslim community while critiquing the Judaic covenant history, Āl ʿImrān addresses the Christian theological encounter (the delegation of Najrān and Christological debates) externally, while internally nursing and disciplining the community through the physical and spiritual crisis of the Battle of Uḥud. It is the surah of steadfastness (Thabāt), distinguishing clear verses (Muḥkamāt) from ambiguous ones (Mutashābihāt), and warning against division.",
        "distinctive_voice": "Vigorous, dialogical, consoling, steeling.",
        "opening_ending_dynamic": "Opens establishing Allah as Al-Ḥayy Al-Qayyūm who sent the Book confirming previous scriptures (3:1-4), and closes with the clarion call to patience, steadfastness, vigilance, and Taqwa (3:200)."
    },
    54: {
        "personality_title": "Al-Qamar — The Rhythmic Thunderclap of Imminent Warning",
        "personality_summary": "Urgent, staccato, driving, and dramatic. Al-Qamar begins with the cosmic shock of the moon splitting and the Hour drawing near. It moves in rapid, percussive cycles through past civilizations (Nūḥ, 'Ād, Thamūd, Lūṭ, and Fir'awn) that rejected warnings, punctuated by the recurring refrain of divine retribution and ease of the Qur'an for remembrance. Its tone is terrifyingly vivid yet mercifully pedagogical.",
        "distinctive_voice": "Urgent, warning, historical-retributive, sharply rhythmic.",
        "opening_ending_dynamic": "Opens with the splitting of the moon and rejection by transgressors, and concludes with the righteous resting securely in seats of truth in the presence of an Omnipotent Sovereign (54:54-55)."
    },
    55: {
        "personality_title": "Ar-Raḥmān — The Cosmic Anthem of Divine Benevolence and Accountability",
        "personality_summary": "Lyrical, dual, expansive, and awe-inspiring. Ar-Raḥmān is unique in the Qur'anic canon as a direct dual address to both humans and jinn (al-Thaqalān), set to a hypnotic 31-fold refrain challenging them on which divine favours they deny. It balances exquisite depictions of cosmic equilibrium, terrestrial bounty, human mortality, eschatological terror, and layered gradations of celestial gardens.",
        "distinctive_voice": "Lyrical, hypnotic, dual-addressed, bountiful.",
        "opening_ending_dynamic": "Opens identifying the divine Teacher of the Qur'an by His most merciful Name (Ar-Raḥmān), and closes blessing that very Name: Tabāraka ismu rabbika dhi al-jalāli wa al-ikrām (55:78)."
    },
    56: {
        "personality_title": "Al-Wāqiʿah — The Inescapable Sifting of Human Destiny",
        "personality_summary": "Sobering, analytical, sensory, and definitive. Al-Wāqiʿah presents the inevitable Event that lowers and exalts, classifying humanity into three eternal cohorts: the Foremost (Al-Sābiqūn), the People of the Right, and the People of the Left. It interrogates human self-sufficiency through basic life supports (semen, agriculture, water, and fire) before swearing by the setting of stars to the transcendent preservation of the Noble Qur'an.",
        "distinctive_voice": "Eschatological, tripartite, interrogative, decisive.",
        "opening_ending_dynamic": "Opens with the shaking of the earth and falling of the Event, and concludes commanding glorification of the Supreme Name of the Lord (Fa-sabbiḥ bi-ismi rabbika al-'Aẓīm, 56:96)."
    }
}

def clean_arabic(text):
    # Remove tashkeel for searching
    tashkeel = [
        '\u064B', '\u064C', '\u064D', '\u064E', '\u064F', '\u0650',
        '\u0651', '\u0652', '\u0653', '\u0670', '\u0640'
    ]
    cleaned = text
    for t in tashkeel:
        cleaned = cleaned.replace(t, '')
    # Normalize alefs
    cleaned = cleaned.replace('\u0622', '\u0627').replace('\u0623', '\u0627').replace('\u0625', '\u0627')
    return cleaned

def main():
    print("Compiling canonical dataset...")
    
    with open(os.path.join(DATA_QURAN_DIR, 'info.json'), encoding='utf-8') as f:
        info = json.load(f)
        
    with open(os.path.join(DATA_QURAN_DIR, 'ara-uthmani-hafs.json'), encoding='utf-8') as f:
        ara_uthmani_data = json.load(f)['quran']

    with open(os.path.join(DATA_QURAN_DIR, 'ara-simple.json'), encoding='utf-8') as f:
        ara_simple_data = json.load(f)['quran']

    with open(os.path.join(DATA_QURAN_DIR, 'eng-saheeh.json'), encoding='utf-8') as f:
        eng_saheeh_data = json.load(f)['quran']

    with open(os.path.join(DATA_QURAN_DIR, 'eng-abdelhaleem.json'), encoding='utf-8') as f:
        eng_haleem_data = json.load(f)['quran']

    # Index text by (chapter, verse)
    uthmani_map = {(item['chapter'], item['verse']): item['text'] for item in ara_uthmani_data}
    simple_map = {(item['chapter'], item['verse']): item['text'] for item in ara_simple_data}
    saheeh_map = {(item['chapter'], item['verse']): item['text'] for item in eng_saheeh_data}
    haleem_map = {(item['chapter'], item['verse']): item['text'] for item in eng_haleem_data}

    compiled_surahs = []
    ayah_lookup = {}

    for ch in info['chapters']:
        ch_id = ch['chapter']
        name_ar = ch['arabicname']
        name_en = ch['name']
        name_meaning = ch['englishname']
        revelation = ch['revelation'].lower()
        revelation_classification = "makki" if "mecca" in revelation else "madani"
        ayah_count = len(ch['verses'])
        
        personality = SURAH_PERSONALITIES.get(ch_id, {
            "personality_title": f"Surah {name_en} ({name_meaning})",
            "personality_summary": f"Unique Qur'anic surah of {ayah_count} ayat revealed in {ch['revelation']}, possessing its distinct thematic core, atmosphere, and rhetorical progression.",
            "distinctive_voice": "Qur'anic discourse",
            "opening_ending_dynamic": "Connects opening theme to terminal resolution."
        })
        
        # Determine page and juz range
        pages = [v['page'] for v in ch['verses']]
        juzs = sorted(list(set(v['juz'] for v in ch['verses'])))
        
        surah_obj = {
            "id": ch_id,
            "name_ar": name_ar,
            "name_en": name_en,
            "name_meaning": name_meaning,
            "name_transliteration": name_en,
            "alternative_names": [],
            "revelation_classification": revelation_classification,
            "ayah_count": ayah_count,
            "page_start": min(pages),
            "page_end": max(pages),
            "juz_numbers": juzs,
            "personality_title": personality.get("personality_title", ""),
            "personality_summary": personality.get("personality_summary", ""),
            "distinctive_voice": personality.get("distinctive_voice", ""),
            "opening_ending_dynamic": personality.get("opening_ending_dynamic", ""),
            "overview": f"Surah {name_en} ({name_meaning}) is the {ch_id}{'st' if ch_id==1 else 'nd' if ch_id==2 else 'rd' if ch_id==3 else 'th'} surah in the canonical muṣḥaf sequence, comprising {ayah_count} ayat. Classified as {revelation_classification.capitalize()}.",
            "central_topics": [],
            "research_status": "draft"
        }
        
        # Build individual surah record with all ayahs
        surah_ayahs = []
        for v in ch['verses']:
            v_num = v['verse']
            key = (ch_id, v_num)
            uthmani_text = uthmani_map.get(key, "")
            simple_text = simple_map.get(key, "")
            clean_text = clean_arabic(simple_text)
            saheeh_text = saheeh_map.get(key, "")
            haleem_text = haleem_map.get(key, "")
            
            ayah_record = {
                "surah_id": ch_id,
                "ayah_number": v_num,
                "arabic_uthmani": uthmani_text,
                "arabic_simple": simple_text,
                "arabic_clean": clean_text,
                "translation_saheeh": saheeh_text,
                "translation_abdelhaleem": haleem_text,
                "juz_number": v['juz'],
                "page_number": v['page'],
                "ruku_number": v['ruku'],
                "sajda": v.get('sajda', False)
            }
            surah_ayahs.append(ayah_record)
            ayah_lookup[f"{ch_id}:{v_num}"] = {
                "arabic_uthmani": uthmani_text,
                "arabic_simple": simple_text,
                "translation_saheeh": saheeh_text,
                "juz": v['juz'],
                "page": v['page']
            }
            
        compiled_surahs.append(surah_obj)
        
        # Save individual surah file
        surah_file_path = os.path.join(DATA_SURAHS_DIR, f"{ch_id:03d}.json")
        with open(surah_file_path, 'w', encoding='utf-8') as sf:
            json.dump({
                "surah": surah_obj,
                "ayahs": surah_ayahs
            }, sf, ensure_ascii=False, indent=2)

    # Save compiled surahs metadata list
    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), 'w', encoding='utf-8') as f:
        json.dump(compiled_surahs, f, ensure_ascii=False, indent=2)
        
    # Save ayah quick lookup index
    with open(os.path.join(DATA_QURAN_DIR, 'ayah_lookup.json'), 'w', encoding='utf-8') as f:
        json.dump(ayah_lookup, f, ensure_ascii=False, indent=2)
        
    print(f"✓ Successfully compiled all {len(compiled_surahs)} surahs and {len(ayah_lookup)} ayahs into data/quran/ and data/surahs/.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
