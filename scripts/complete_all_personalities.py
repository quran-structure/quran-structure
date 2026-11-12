#!/usr/bin/env python3
"""
Populate complete, authentic Sunni personality profiles for all 37 surahs of Juz 'Amma (78-114).
Ensures that all 114 surahs of the Qur'an have distinct personality titles, summaries, and voices.
"""

import os
import sys
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA_QURAN_DIR = os.path.join(BASE_DIR, 'data', 'quran')
DATA_SURAHS_DIR = os.path.join(BASE_DIR, 'data', 'surahs')

JUZ_AMMA_PERSONALITIES = {
    78: {
        "personality_title": "An-Naba — The Tremendous Announcement & The Horizon of Reckoning",
        "personality_summary": "Interrogative, majestic, awe-inspiring, cosmic. Opens with the disbelievers' contentious questioning regarding the Great News of resurrection, answers through the vast panoramic signposts of creation (earth as a bed, mountains as pegs, sleep as rest, sun as a blazing lamp), and confronts mankind with the Day of Sorting where transgressors meet Hell and the righteous enter attainment.",
        "distinctive_voice": "Cosmic, rhetorical, confronting, panoramic."
    },
    79: {
        "personality_title": "An-Nazi'at — The Violent Strippers & The Climax of Overwhelming Calamity",
        "personality_summary": "Staccato, oath-bound, dramatic, historical-eschatological. Begins with celestial oaths by the soul-extracting and smoothly gliding angels, recounts Moses's confrontation with Pharaoh's pride ('I am your highest lord'), and climaxes in the Overwhelming Calamity (At-Tammah al-Kubra) when man confronts what he strove for.",
        "distinctive_voice": "Urgent, oath-driven, dramatic, admonishing."
    },
    80: {
        "personality_title": "'Abasa — The Divine Rebuke & The Moral Priority of the Seeker",
        "personality_summary": "Moral, pastoral, introspective, humbling. Opens with a historic divine rebuke of the Prophet prioritizing powerful pagan elites over the blind, sincere seeker Ibn Umm Maktum, establishing that spiritual reception outweighs social pedigree. Transitions to ingratitude for human genesis and concludes with the Deafening Blast where man flees from his brother, mother, and father.",
        "distinctive_voice": "Moral-corrective, introspective, searing, eschatological."
    },
    81: {
        "personality_title": "At-Takwir — The Solar Shrouding & The Unveiling of the Cosmic Stage",
        "personality_summary": "Apocalyptic, vivid, relentless, illuminating. A continuous cascade of twelve conditional 'when' clauses portraying the cosmic dissolution: sun folded up, stars falling, mountains swept away, pregnant camels neglected, and the buried female infant interrogated for what crime she was slain. Closes affirming the dignity of the angelic and prophetic messengers.",
        "distinctive_voice": "Apocalyptic, percussive, solemn, visual."
    },
    82: {
        "personality_title": "Al-Infitar — The Cleaving Sky & The Reproach of the Deluded Soul",
        "personality_summary": "Reflective, tenderly rebuking, judicial, sober. Portrays the shattered sky and overturned graves, posing the piercing psychological question: 'O man, what has deceived you concerning your Generous Lord?' Details the noble recording scribes (Kiramun Katiboon) who log every action for the Day of Judgment where no soul possesses power for another.",
        "distinctive_voice": "Affectionately rebuking, investigative, juridical."
    },
    83: {
        "personality_title": "Al-Mutaffifin — Woe to the Defrauders & The Dichotomy of Sijjin and 'Illiyyun",
        "personality_summary": "Socio-economic, moral, contrasting, vindicating. Denounces economic cheating and fraudulent measures in trade, linking micro-level commercial dishonesty to loss of faith in the Day of Great Standing. Systematically contrasts the dark register of the wicked in Sijjin with the aromatic, sealed nectar awaiting the righteous in 'Illiyyun.",
        "distinctive_voice": "Economic-ethical, severe, contrastive, triumphant."
    },
    84: {
        "personality_title": "Al-Inshiqaq — The Submissive Cosmos & The Inevitable Meeting with the Lord",
        "personality_summary": "Cosmic, dutiful, existential, inevitable. Portrays the heavens splitting open and listening in obedient surrender to their Lord, reminding mankind: 'You are laboring toward your Lord with exertion and you will meet Him.' Delineates the joyful reception of the record in the right hand versus the despair of receiving it behind the back.",
        "distinctive_voice": "Obedient, existential, transitioning from struggle to reckoning."
    },
    85: {
        "personality_title": "Al-Buruj — The Starry Mansions & The Unyielding Witness of Faith",
        "personality_summary": "Fortified, heroic, consolation through martyrdom, majestic. Oaths by the sky holding constellations and the Promised Day introduce the heroic martyrdom of the Believers of the Ditch (Ashab al-Ukhdood), burned alive for their faith. Assures the persecuted that the grip of their Lord is severe and that the Qur'an is inscribed in the Preserved Tablet (Lawh Mahfuz).",
        "distinctive_voice": "Heroic, consoling, unshakeable, vindicating."
    },
    86: {
        "personality_title": "At-Tariq — The Piercing Night-Star & The Testing of Secret Motives",
        "personality_summary": "Nocturnal, biological, analytical, triumphant. Swears by the nocturnal star of piercing brightness that over every soul is a watchful keeper. Prompts man to observe his origin from an ejaculated fluid from between the spine and ribs, establishing the certainty of resurrection on the Day when all hidden secrets are laid bare.",
        "distinctive_voice": "Piercing, analytical, biological-eschatological."
    },
    87: {
        "personality_title": "Al-A'la — The Exaltation of the Most High & The Primordial Balance",
        "personality_summary": "Liturgical, reassuring, philosophical, eternal. Commands the exaltation of the Name of the Lord Most High who created and proportioned, comforted the Prophet that he will recite and never forget, and exposed the root delusion of humanity: 'Nay, you prefer the worldly life, while the Hereafter is better and more enduring.'",
        "distinctive_voice": "Liturgical, serene, comforting, transcendent."
    },
    88: {
        "personality_title": "Al-Ghashiyah — The Overwhelming Enclosure & The Fourfold Call to Nature",
        "personality_summary": "Sensory, binary, observational, pastoral. Contrasts downcast, scorched faces drinking from boiling springs against joyful, serene souls reclining in gardens where no idle speech is heard. Calls humanity to observe the creation of camels, the elevation of the sky, the anchoring of mountains, and the spreading of the earth, concluding that the Prophet is an admonisher, not a controller.",
        "distinctive_voice": "Sensory, bifurcated, observational, pastoral."
    },
    89: {
        "personality_title": "Al-Fajr — The Breaking Dawn & The Tranquil Soul's Return",
        "personality_summary": "Historical, dramatic, socioeconomic, spiritually climactic. Oaths by dawn and ten nights recall the ruin of ancient monolithic civilizations ('Ad, Thamud, Pharaoh), exposes the shallow theology of measuring divine love by wealth, and culminates in the most celebrated spiritual welcome in scripture: 'O reassured soul, return to your Lord, well-pleased and pleasing to Him.'",
        "distinctive_voice": "Historical-warning, socioeconomic critique, transcendent peace."
    },
    90: {
        "personality_title": "Al-Balad — The Sacred City & The Steep Ascent of Altruistic Sacrifice",
        "personality_summary": "Topographical, sacrificial, communal, heroic. Swears by the sacred precinct of Mecca and the human condition created in struggle. Interrogates man's boastful self-sufficiency and challenges him to scale the steep uphill path (Al-'Aqabah): not through ritual ostentation, but through freeing the enslaved and feeding the famished orphan.",
        "distinctive_voice": "Heroic, demanding, altruistic, ethical."
    },
    91: {
        "personality_title": "Ash-Shams — The Elevenfold Cosmic Oath & The Purification of the Soul",
        "personality_summary": "Cosmological, rhythmic, psychological, historic-exemplary. Features the longest consecutive oath sequence in the Qur'an (sun, morning radiance, moon, day, night, heaven, earth, and the balanced human soul) leading to a singular psychological verdict: 'He has succeeded who purifies it, and he has failed who corrupts it,' punctuated by the ruin of Thamud.",
        "distinctive_voice": "Lyrical, cosmic, binary, psychologically definitive."
    },
    92: {
        "personality_title": "Al-Layl — The Polarities of Night and Day & The Divergence of Human Striving",
        "personality_summary": "Bipolar, ethical, consequential, reassuring. Contrasts the covering night and radiant day with the divergence of human endeavor: the generous soul who gives, fears God, and believes in the ultimate good is eased toward absolute ease, while the miser who hoarding self-sufficiency is eased toward devastation.",
        "distinctive_voice": "Ethical, comparative, balanced, promise-oriented."
    },
    93: {
        "personality_title": "Ad-Duha — The Morning Splendor & Divine Consolation in Apparent Silence",
        "personality_summary": "Tender, intimate, maternal, intensely consoling. Addressed directly to the Prophet during a painful cessation of revelation: 'Your Lord has neither forsaken you nor hated you.' Reminds him of his orphanhood, wandering, and poverty, commanding tenderness toward orphans and petitioners, and proclamation of divine grace.",
        "distinctive_voice": "Tender, restorative, intimate, pastoral."
    },
    94: {
        "personality_title": "Ash-Sharh — The Relieved Chest & The Inseparability of Ease from Trial",
        "personality_summary": "Expansive, weightless, uplifting, mobilizing. A direct companion to Ad-Duha, celebrating the expansion of the prophetic heart, the removal of the crushing burden, and the exaltation of his remembrance. Enunciates the cosmic spiritual law that hardship does not merely precede ease, but accompanies it, urging relentless devotion upon completion of tasks.",
        "distinctive_voice": "Exhilarating, weightless, motivating, victorious."
    },
    95: {
        "personality_title": "At-Tin — The Sacred Sanctuaries & The Nobility of the Human Mould",
        "personality_summary": "Geographical-spiritual, anthropological, judicial. Oaths by the Fig, Olive, Mount Sinai, and the Secure City of Mecca frame the ontological creation of humanity in the best of statures (Fi Ahsani Taqweem), followed by regression to the lowest of the low except for those anchored in faith and righteous works.",
        "distinctive_voice": "Sanctified, anthropological, moral, dignified."
    },
    96: {
        "personality_title": "Al-'Alaq — The Dawn of Epistemology & The Prostration of Proximity",
        "personality_summary": "Primordial, epistemological, revolutionary, devotional. The very first revelation of the Qur'an: 'Read in the name of your Lord who created.' Establishes knowledge and the pen as divine gifts, diagnoses human tyranny as rooted in self-sufficiency, and closes defying the persecutor: 'Nay, do not obey him. Prostrate and draw near!'",
        "distinctive_voice": "Primordial, authoritative, uncompromising, devotional."
    },
    97: {
        "personality_title": "Al-Qadr — The Night of Sovereign Decree & The Descent of Serenity",
        "personality_summary": "Mystical, nocturnal, peaceful, luminous. Celebrates the descent of the Qur'an on the Night of Destiny (Laylat al-Qadr), declaring it greater in value than a thousand months. Portrays the earth saturated by the descent of angels and the Spirit (Gabriel), cloaking existence in divine peace until the emergence of dawn.",
        "distinctive_voice": "Luminous, sacred, peaceful, nocturnal."
    },
    98: {
        "personality_title": "Al-Bayyinah — The Manifest Proof & The Sincerity of True Religion",
        "personality_summary": "Polemical, doctrinal, ecclesiastical, definitive. Explains why earlier communities could not be extracted from error without a Clear Proof: an emissary reciting purified scrolls. Delineates the pristine core of all revelation (worshiping Allah in sincerity, establishing prayer, giving charity) and contrasts the worst of creation with the best of creation.",
        "distinctive_voice": "Doctrinal, defining, clarifying, polarizing."
    },
    99: {
        "personality_title": "Az-Zalzalah — The Apocalyptic Quake & The Microscopic Scales of Justice",
        "personality_summary": "Seismic, judicial, revelatory, meticulous. Portrays the earth convulsing in its final earthquake, casting forth its hidden burials and speaking its recorded testimonies. Concludes with the ultimate standard of divine justice: whoever performs an atom's weight of good or evil shall see it.",
        "distinctive_voice": "Seismic, revealing, meticulous, sobering."
    },
    100: {
        "personality_title": "Al-'Adiyat — The Panting Cavalry & The Unmasking of Ingratitude",
        "personality_summary": "Dynamic, kinetic, visceral, psychological. Oaths by snorting war-chargers striking sparks of flint, raiding at dawn, and raising clouds of dust expose the dark underside of human nature: intense ingratitude to the Lord and an all-consuming love for worldly wealth, warning of the day graves are overturned and breast-secrets extracted.",
        "distinctive_voice": "Kinetic, galloping, piercing, unmasking."
    },
    101: {
        "personality_title": "Al-Qari'ah — The Striking Calamity & The Abyss of Hawiyah",
        "personality_summary": "Sudden, crushing, sensory, eschatological. The sudden shock of the Calamity that scatters humanity like dispersed moths and renders mountains like carded wool. Sets the balance of eternal destiny: heavy scales leading to a pleasant life versus light scales plunging into the mothering abyss of the Blazing Fire (Hawiyah).",
        "distinctive_voice": "Crushing, urgent, pictorial, decisive."
    },
    102: {
        "personality_title": "At-Takathur — The Mania of Accumulation & The Interrogation of Delights",
        "personality_summary": "Challenging, diagnostic, grave, forensic. Diagnoses the universal addiction to rivalry in worldly accumulation that blinds humanity until they literally visit the graves. Asserts the reality of the intermediate realm (Barzakh) and concludes with the inescapable final audit: 'Then you will surely be asked that Day about every pleasure.'",
        "distinctive_voice": "Diagnostic, sobering, grave, interrogative."
    },
    103: {
        "personality_title": "Al-'Asr — The Witness of Fleeting Time & The Four Pillars of Salvation",
        "personality_summary": "Compressed, universal, axiomatic, foundational. Celebrated by Imam al-Shafi'i as sufficient guidance had nothing else been revealed. Swears by the relentless march of declining Time that all humanity is in total catastrophic loss, except those who synthesize four indivisible pillars: faith, righteous deeds, mutual counseling in truth, and mutual counseling in patience.",
        "distinctive_voice": "Axiomatic, urgent, universal, salvific."
    },
    104: {
        "personality_title": "Al-Humazah — The Slandering Hoarder & The Fire Vault of Hutamah",
        "personality_summary": "Psychological, retributive, anatomical, terrifying. Denounces the cynical backbiter who amasses wealth and counts it, delusional in thinking his fortune makes him immortal. Delivers the terrifying retribution of Al-Hutamah: the crushing divine fire that penetrates and closes over the very core of the heart in outstretched pillars.",
        "distinctive_voice": "Severely warning, psychological, retributive."
    },
    105: {
        "personality_title": "Al-Fil — The Crushed Armies of the Elephant & Divine Sanctuary Defense",
        "personality_summary": "Historical, narrative-rhetorical, protective, definitive. Recalls the miraculous defense of the Ka'bah against Abraha's invading army of war-elephants in the year of the Prophet's birth, showing how Allah reduced mighty imperial arrogance to chewed straw through flocks of small birds casting stones of baked clay.",
        "distinctive_voice": "Triumphant, narrative, sheltering, historical."
    },
    106: {
        "personality_title": "Quraysh — The Sacred Enclave & The Covenant of Gratitude",
        "personality_summary": "Civic, economic, covenantal, grateful. An immediate thematic twin to Al-Fil, reminding the tribe of Quraysh of their divine gift of secure winter and summer trading voyages, summoning them to worship the Lord of this Sacred Sanctuary who fed them against hunger and safeguarded them from fear.",
        "distinctive_voice": "Gracious, covenantal, pastoral, reassuring."
    },
    107: {
        "personality_title": "Al-Ma'un — The Hypocrisy of Ritualism & The Denial of Small Mercies",
        "personality_summary": "Socially diagnostic, unmasking, severe, prophetic. Unmasks the fatal spiritual hypocrisy of those who perform showy prayers (Mura'oon) while repelling the vulnerable orphan, refusing to feed the impoverished, and withholding the simplest domestic kindnesses (Al-Ma'un).",
        "distinctive_voice": "Diagnostic, ethical, exposes hypocrisy, social."
    },
    108: {
        "personality_title": "Al-Kawthar — The Abundant Stream & The Obliteration of the Detractor",
        "personality_summary": "Bountiful, consoling, defiant, victorious. The shortest surah in the Qur'an, yet overflowing with boundless generosity: gifting the Prophet the celestial pool of Al-Kawthar in response to pagan taunts regarding the death of his sons. Commands prayer and sacrifice, concluding that his hateful mocker is the one cut off from posterity.",
        "distinctive_voice": "Overflowing, consoling, protective, victorious."
    },
    109: {
        "personality_title": "Al-Kafirun — The Manifesto of Disavowal & The Inviolability of Creed",
        "personality_summary": "Defiant, uncompromising, theological boundary-setting. A categorical public repudiation of religious syncretism and theological compromise in response to pagan offers of rotating worship: 'I do not worship what you worship, nor do you worship what I worship... To you your religion, and to me my religion.'",
        "distinctive_voice": "Uncompromising, definitive, polemical, liberating."
    },
    110: {
        "personality_title": "An-Nasr — The Culmination of Victory & The Liturgy of Forgiveness",
        "personality_summary": "Triumphant, eschatological, prophetic farewell, humble. Signals the historic victory and mass entry of humanity into the fold of Islam, yet instructs the Prophet not to celebrate with imperial hubris, but to drown victory in the glorification of Allah and the seeking of divine forgiveness, subtly foreshadowing his imminent departure.",
        "distinctive_voice": "Victorious, humble, liturgical, poignant."
    },
    111: {
        "personality_title": "Al-Masad — The Ruin of the Persecutor & The Palm-Fiber Noose",
        "personality_summary": "Judicial, punitive, historical-prophetic, uncompromising. The definitive condemnation of the Prophet's vicious uncle Abu Lahab and his wife Umm Jamil, declaring the absolute futility of their wealth and status against divine justice, and depicting her eternal carrying of firewood with a twisted rope of palm-fiber around her neck.",
        "distinctive_voice": "Punitive, prophetic judgment, uncompromising."
    },
    112: {
        "personality_title": "Al-Ikhlas — The Diamond of Monotheism & The Absolute Refuge",
        "personality_summary": "Absolute, foundational, ontological, equal to one-third of the Qur'an. The purest distilled definition of monotheism in scripture: Allah is One (Ahad), Allah is As-Samad (the Eternal Refuge needed by all, needing none), He neither begets nor is He begotten, and none can ever be co-equal to Him.",
        "distinctive_voice": "Sublime, absolute, ontological, uncompromising monotheism."
    },
    113: {
        "personality_title": "Al-Falaq — The Cleaving Dawn & Sanctuary from External Malice",
        "personality_summary": "Protective, apotropaic, luminous, shielding. Seeking refuge with the Lord of the Daybreak from the dangers of the external physical and metaphysical world: the evil of created things, the enshrouding darkness of the night, the sorcerers blowing on knots, and the destructive poison of the envious when he envies.",
        "distinctive_voice": "Protective, luminous, vigilant, sanctuary-seeking."
    },
    114: {
        "personality_title": "An-Nas — The King of Humanity & The Fortress Against Whispered Doubts",
        "personality_summary": "Sovereign, intimate, psychological, the grand seal of the Qur'an. Seeking sanctuary with the Lord, King, and God of mankind from the internal, stealthy, retreating whisperer (Al-Waswas Al-Khannas) who casts doubts into the human breast from both jinn and men. The final word of the Qur'an brings the seeker full circle from the cosmos back into the human heart.",
        "distinctive_voice": "Intimate, protective, sovereign, ultimate sanctuary."
    }
}

def main():
    print("=== Populating Juz 'Amma Personalities (Surahs 78-114) ===")
    
    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), encoding='utf-8') as f:
        surahs = json.load(f)
        
    updated_count = 0
    for s in surahs:
        s_id = s['id']
        if s_id in JUZ_AMMA_PERSONALITIES:
            data = JUZ_AMMA_PERSONALITIES[s_id]
            s['personality_title'] = data['personality_title']
            s['personality_summary'] = data['personality_summary']
            s['distinctive_voice'] = data['distinctive_voice']
            updated_count += 1
            
            # Update individual file
            surah_file = os.path.join(DATA_SURAHS_DIR, f"{s_id:03d}.json")
            if os.path.exists(surah_file):
                with open(surah_file, encoding='utf-8') as sf:
                    s_data = json.load(sf)
                s_data['surah']['personality_title'] = data['personality_title']
                s_data['surah']['personality_summary'] = data['personality_summary']
                s_data['surah']['distinctive_voice'] = data['distinctive_voice']
                with open(surah_file, 'w', encoding='utf-8') as sf:
                    json.dump(s_data, sf, ensure_ascii=False, indent=2)

    with open(os.path.join(DATA_QURAN_DIR, 'surahs.json'), 'w', encoding='utf-8') as f:
        json.dump(surahs, f, ensure_ascii=False, indent=2)
        
    print(f"✓ Successfully updated all {updated_count} Juz 'Amma surahs.")
    return 0

if __name__ == '__main__':
    sys.exit(main())
