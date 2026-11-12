// The Qur'an in Conversation - Web Application Engine
document.addEventListener('DOMContentLoaded', async () => {
  let surahsData = [];
  let relationshipsData = [];
  let evidenceData = [];
  let sourcesData = [];
  let themesData = [];
  let currentTransitionCluster = 'all';
  let currentAtlasCluster = 'all';

  // DOM Elements
  const tabs = document.querySelectorAll('nav.main-nav button');
  const panels = document.querySelectorAll('.tab-panel');
  const surahGrid = document.getElementById('surahGrid');
  const surahSearch = document.getElementById('surahSearch');
  const surahFilter = document.getElementById('surahFilter');
  const transitionsList = document.getElementById('transitionsList');
  const transitionClusterBar = document.getElementById('transitionClusterBar');
  const atlasClusterBar = document.getElementById('atlasClusterBar');
  const atlasSvg = document.getElementById('atlasSvg');
  const atlasEdgeInspector = document.getElementById('atlasEdgeInspector');
  const inspectorTitle = document.getElementById('inspectorTitle');
  const inspectorContent = document.getElementById('inspectorContent');
  const closeInspectorBtn = document.getElementById('closeInspectorBtn');
  const envelopeList = document.getElementById('envelopeList');
  const themesList = document.getElementById('themesList');
  const personalitiesList = document.getElementById('personalitiesList');
  const libraryGrid = document.getElementById('libraryGrid');
  const modalOverlay = document.getElementById('surahModal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // Load Data
  try {
    const [surahsRes, relsRes, evRes, sourcesRes, themesRes] = await Promise.all([
      fetch('data/surahs.json'),
      fetch('data/relationships.json'),
      fetch('data/evidence.json'),
      fetch('data/sources.json'),
      fetch('data/themes.json')
    ]);

    surahsData = await surahsRes.json();
    relationshipsData = await relsRes.json();
    evidenceData = await evRes.json();
    const sData = await sourcesRes.json();
    sourcesData = sData.sources || [];
    themesData = await themesRes.json();

    renderSurahs(surahsData);
    renderAtlasGraph('all');
    renderTransitions('all');
    renderEnvelopes();
    renderThemes();
    renderPersonalities();
    renderLibrary();
  } catch (err) {
    console.error('Error loading data:', err);
  }

  // Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) {
        target.classList.add('active');
        if (tab.dataset.tab === 'tab-atlas') {
          renderAtlasGraph(currentAtlasCluster);
        }
      }
    });
  });

  // Helper: Extract Surah number from ID string
  function extractSurahNumber(idStr) {
    if (!idStr) return null;
    const match = idStr.match(/(?:surah|ayah|section):0*(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }

  // Helper: Classify relationship into cluster
  function classifyRelationship(rel) {
    const s1 = extractSurahNumber(rel.from_id);
    const s2 = extractSurahNumber(rel.to_id);
    const nums = [s1, s2].filter(n => n !== null);
    if (!nums.length) return 'other';

    if (allIn(nums, 1, 9)) return 'tiwal';
    if (allIn(nums, 9, 18)) return 'prophetic';
    if (allIn(nums, 18, 28)) return 'narrative';
    if (allIn(nums, 39, 47)) return 'hawamim';
    if (allIn(nums, 57, 66) || (nums.includes(56) && nums.includes(57))) return 'musabbihat';
    if (allIn(nums, 54, 56)) return 'eschatological';
    if (nums.every(n => n >= 105) || (nums.includes(114) && nums.includes(1))) return 'final';
    return 'other';
  }

  function allIn(arr, min, max) {
    return arr.every(n => n >= min && n <= max);
  }

  // Surah Search & Filtering
  function filterSurahs() {
    const query = (surahSearch.value || '').toLowerCase().trim();
    const type = surahFilter.value;

    const filtered = surahsData.filter(s => {
      const matchQuery = s.name_en.toLowerCase().includes(query) ||
                         s.name_ar.includes(query) ||
                         s.name_meaning.toLowerCase().includes(query) ||
                         (s.personality_summary && s.personality_summary.toLowerCase().includes(query)) ||
                         (s.personality_title && s.personality_title.toLowerCase().includes(query)) ||
                         s.id.toString() === query;
      const matchType = !type || s.revelation_classification === type;
      return matchQuery && matchType;
    });

    renderSurahs(filtered);
  }

  if (surahSearch) surahSearch.addEventListener('input', filterSurahs);
  if (surahFilter) surahFilter.addEventListener('change', filterSurahs);

  // Render Surah Cards
  function renderSurahs(surahs) {
    if (!surahGrid) return;
    surahGrid.innerHTML = '';
    
    surahs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'surah-card';
      card.innerHTML = `
        <div class="surah-card-header">
          <span class="surah-number">#${s.id}</span>
          <span class="surah-ar-name">${s.name_ar}</span>
        </div>
        <div class="surah-en-name">${s.name_en}</div>
        <div class="surah-meaning">${s.name_meaning}</div>
        <div class="surah-personality-preview">
          <strong>Distinct Personality:</strong> ${s.personality_summary ? s.personality_summary.substring(0, 130) + '...' : 'Unique Qur\'anic voice and thematic progression.'}
        </div>
        <div class="surah-meta">
          <span>${s.revelation_classification.toUpperCase()}</span>
          <span>•</span>
          <span>${s.ayah_count} Ayat</span>
          <span>•</span>
          <span>Pages ${s.page_start}–${s.page_end}</span>
        </div>
      `;
      card.addEventListener('click', () => openSurahModal(s.id));
      surahGrid.appendChild(card);
    });
  }

  // Open Surah Detail Modal with Full Verses & Personality
  async function openSurahModal(surahId) {
    const surah = surahsData.find(s => s.id === surahId);
    if (!surah || !modalOverlay) return;

    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h2 style="font-family: var(--font-arabic); font-size: 2.3rem; color: var(--accent-emerald); direction: rtl; margin-bottom: 0.25rem;">
          ${surah.name_ar}
        </h2>
        <h3 style="font-size: 1.45rem; font-weight: 600;">Surah ${surah.name_en} (${surah.name_meaning})</h3>
        <p style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
          Surah #${surah.id} • ${surah.revelation_classification.toUpperCase()} • ${surah.ayah_count} Ayat • Juz ${surah.juz_numbers.join(', ')}
        </p>
      </div>

      <div style="background: var(--accent-gold-soft); border: 1px solid #ebd7ab; border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <h4 style="font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700; color: #875708; text-transform: uppercase;">
            🌟 Surah Personality & Atmosphere (Jaww al-Sūrah)
          </h4>
          <span class="badge badge-reltype" style="background: #ffffff; color: #875708; font-size: 0.75rem;">Unique Identity</span>
        </div>
        <div style="font-size: 1.15rem; font-weight: 700; color: var(--accent-emerald); margin-bottom: 0.5rem;">
          ${surah.personality_title || surah.name_en}
        </div>
        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6; margin-bottom: 0.6rem;">
          ${surah.personality_summary || 'Each surah has a unique spiritual atmosphere, thematic axis, and rhetorical cadence.'}
        </p>
        ${surah.distinctive_voice ? `
          <div style="background: #ffffff; border: 1px solid #ebd7ab; border-radius: var(--radius-sm); padding: 0.5rem 0.75rem; font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.5rem;">
            <strong style="color: var(--accent-emerald);">💡 Spiritual Tone & Voice:</strong> ${surah.distinctive_voice}
          </div>
        ` : ''}
      </div>

      <div id="modalAyahsContainer">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Loading canonical verses...</p>
      </div>
    `;

    modalOverlay.classList.add('open');

    // Fetch individual surah ayahs
    try {
      const paddedId = String(surahId).padStart(3, '0');
      const res = await fetch(`data/surahs/${paddedId}.json`);
      if (res.ok) {
        const fullData = await res.json();
        const ayahsCont = document.getElementById('modalAyahsContainer');
        if (ayahsCont && fullData.ayahs) {
          const totalAyahs = fullData.ayahs.length;
          let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">
              <h4 style="font-size: 1.1rem; font-weight: 600;">Canonical Verses (${totalAyahs})</h4>
              ${totalAyahs > 20 ? `<button id="toggleAllAyahsBtn" class="badge badge-reltype" style="cursor: pointer; border: none; background: var(--bg-subtle);">Show All ${totalAyahs} Verses</button>` : ''}
            </div>
            <div id="ayahListContent">
          `;

          const renderList = (limit) => {
            let inner = '';
            const list = limit ? fullData.ayahs.slice(0, limit) : fullData.ayahs;
            list.forEach(a => {
              inner += `
                <div style="margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem;">
                    <span style="font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700; color: var(--accent-gold);">Ayah ${a.ayah_number}</span>
                    <div class="arabic-block" style="font-size: 1.4rem; margin: 0; line-height: 2;">${a.arabic_uthmani}</div>
                  </div>
                  <div class="english-translation" style="font-size: 0.94rem; color: var(--text-secondary); margin-top: 0.35rem;">"${a.translation_saheeh}"</div>
                </div>
              `;
            });
            return inner;
          };

          const initialLimit = totalAyahs > 20 ? 20 : totalAyahs;
          html += renderList(initialLimit) + `</div>`;
          ayahsCont.innerHTML = html;

          const toggleBtn = document.getElementById('toggleAllAyahsBtn');
          if (toggleBtn) {
            let isExpanded = false;
            toggleBtn.addEventListener('click', () => {
              isExpanded = !isExpanded;
              document.getElementById('ayahListContent').innerHTML = renderList(isExpanded ? null : 20);
              toggleBtn.textContent = isExpanded ? 'Show First 20 Verses' : `Show All ${totalAyahs} Verses`;
            });
          }
        }
      }
    } catch (e) {
      console.log('Ayah fetch skipped for modal', e);
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  // ==========================================
  // INTERACTIVE ATLAS GRAPH RENDERING (SVG)
  // ==========================================
  function renderAtlasGraph(cluster = 'all') {
    currentAtlasCluster = cluster;
    if (!atlasSvg) return;

    // Define Cluster Subsets
    const clusterDefinitions = {
      tiwal: {
        title: 'The Seven Long Surahs (Al-Sabʿ al-Ṭiwāl: 1–9)',
        surahIds: [1, 2, 3, 4, 5, 6, 7, 8, 9]
      },
      prophetic: {
        title: 'The Prophetic & Wisdom Cluster (10–18)',
        surahIds: [10, 11, 12, 13, 14, 15, 16, 17, 18]
      },
      narrative: {
        title: 'Deliverance & Prophetic Narrative Continuum (19–28)',
        surahIds: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28]
      },
      hawamim: {
        title: 'The Ḥawāmīm Silk Brocades (Dībāj al-Qur\'ān: 39–47)',
        surahIds: [39, 40, 41, 42, 43, 44, 45, 46, 47]
      },
      eschatological: {
        title: 'Cosmic Signs & Eschatological Realities (54–57)',
        surahIds: [54, 55, 56, 57]
      },
      musabbihat: {
        title: 'The Musabbiḥāt & Medinan Order Cluster (57–66)',
        surahIds: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66]
      },
      final: {
        title: 'The Final Surahs Cluster & Grand Cosmic Seal (105–114 & 114➔1)',
        surahIds: [105, 106, 107, 108, 109, 110, 111, 112, 113, 114]
      }
    };

    let activeClusters = [];
    if (cluster === 'all') {
      activeClusters = ['tiwal', 'prophetic', 'narrative', 'hawamim', 'musabbihat', 'final'];
    } else if (clusterDefinitions[cluster]) {
      activeClusters = [cluster];
    }

    // Update Layman Storyline Banner for Newbies
    const storylineCard = document.getElementById('clusterStorylineCard');
    if (storylineCard && clusterStorylines[cluster]) {
      const sl = clusterStorylines[cluster];
      storylineCard.innerHTML = `
        <div class="storyline-title">
          <h4>${sl.title}</h4>
          <span class="badge badge-reltype" style="background: var(--accent-gold-soft); color: #875708; border-color: #ebd7ab;">${sl.badge}</span>
        </div>
        <p class="storyline-narrative">${sl.narrative}</p>
        <div class="storyline-takeaway">
          <span style="font-size: 1.1rem;">💡</span>
          <span><strong>Quick Summary:</strong> ${sl.takeaway}</span>
        </div>
      `;
    }

    // Determine Canvas Dimensions
    const width = 1100;
    const rowHeight = 150;
    const totalHeight = activeClusters.length === 1 ? 260 : (activeClusters.length * rowHeight + 100);
    atlasSvg.setAttribute('viewBox', `0 0 ${width} ${totalHeight}`);
    atlasSvg.setAttribute('height', Math.max(300, totalHeight));

    // Clear SVG
    atlasSvg.innerHTML = `
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" class="atlas-edge-arrow" />
        </marker>
        <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#1b4332" />
        </marker>
        <marker id="arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b38029" />
        </marker>
      </defs>
    `;

    const nodesMap = new Map(); // surahId -> { x, y, surah }

    // Position Nodes per Cluster Row
    activeClusters.forEach((cKey, cIndex) => {
      const cDef = clusterDefinitions[cKey];
      const sIds = cDef.surahIds;
      const y = activeClusters.length === 1 ? 130 : (cIndex * rowHeight + 90);

      // Section Header in SVG
      const sectionText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      sectionText.setAttribute('x', '30');
      sectionText.setAttribute('y', y - 48);
      sectionText.setAttribute('font-family', 'var(--font-sans)');
      sectionText.setAttribute('font-size', '13px');
      sectionText.setAttribute('font-weight', '700');
      sectionText.setAttribute('fill', 'var(--accent-emerald)');
      sectionText.setAttribute('letter-spacing', '0.04em');
      sectionText.textContent = cDef.title.toUpperCase();
      atlasSvg.appendChild(sectionText);

      // Compute X coordinates
      const startX = 60;
      const endX = width - 60;
      const stepX = (endX - startX) / (sIds.length - 1 || 1);

      sIds.forEach((sId, i) => {
        const x = startX + i * stepX;
        const sObj = surahsData.find(s => s.id === sId);
        nodesMap.set(sId, { x, y, surah: sObj, cluster: cKey });
      });
    });

    // Draw Edges First (Underneath nodes)
    relationshipsData.forEach(rel => {
      const sFrom = extractSurahNumber(rel.from_id);
      const sTo = extractSurahNumber(rel.to_id);

      if (!sFrom || !sTo) return;
      const nodeFrom = nodesMap.get(sFrom);
      const nodeTo = nodesMap.get(sTo);

      if (!nodeFrom || !nodeTo) return;

      const isSameCluster = nodeFrom.cluster === nodeTo.cluster;
      const isLoop = (sFrom === 114 && sTo === 1);

      // Draw Path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'atlas-edge');
      path.setAttribute('data-rel-id', rel.id);
      path.setAttribute('marker-end', 'url(#arrow)');

      let d = '';
      if (isLoop) {
        // Grand Cosmic Loop curve
        d = `M ${nodeFrom.x} ${nodeFrom.y - 25} C ${nodeFrom.x - 100} ${nodeFrom.y - 120}, ${nodeTo.x + 100} ${nodeTo.y + 120}, ${nodeTo.x} ${nodeTo.y + 25}`;
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('stroke', '#b38029');
      } else if (isSameCluster) {
        // Horizontal forward transition
        const midX = (nodeFrom.x + nodeTo.x) / 2;
        const curvature = Math.abs(nodeTo.x - nodeFrom.x) > 200 ? 25 : 0;
        d = `M ${nodeFrom.x + 40} ${nodeFrom.y} Q ${midX} ${nodeFrom.y - curvature}, ${nodeTo.x - 42} ${nodeTo.y}`;
      } else {
        d = `M ${nodeFrom.x} ${nodeFrom.y + 25} Q ${(nodeFrom.x + nodeTo.x)/2} ${(nodeFrom.y + nodeTo.y)/2}, ${nodeTo.x} ${nodeTo.y - 25}`;
      }

      path.setAttribute('d', d);

      // Edge click event
      path.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.atlas-edge').forEach(el => el.classList.remove('selected'));
        path.classList.add('selected');
        inspectRelationship(rel);
      });

      atlasSvg.appendChild(path);
    });

    // Draw Nodes
    nodesMap.forEach((node, sId) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'atlas-node');
      g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      g.setAttribute('data-surah-id', sId);

      const s = node.surah || { name_ar: '', name_en: `Surah ${sId}` };

      g.innerHTML = `
        <rect x="-42" y="-24" width="84" height="48" rx="8" />
        <text x="0" y="-5" text-anchor="middle" font-family="var(--font-arabic)" font-size="14px" font-weight="700" fill="var(--accent-emerald)" direction="rtl">
          ${s.name_ar}
        </text>
        <text x="0" y="14" text-anchor="middle" font-family="var(--font-sans)" font-size="10.5px" font-weight="600" fill="var(--text-secondary)">
          #${sId} ${s.name_en}
        </text>
      `;

      // Node click -> open modal
      g.addEventListener('click', () => {
        openSurahModal(sId);
      });

      atlasSvg.appendChild(g);
    });
  }

  // Helper: Layman Plain-English Explanations for Newcomers
  const laymanTakes = {
    'rel_001_002_petition_response': "In Surah 1 (Al-Fātiḥah), humanity asks God: 'Guide us to the Straight Path.' Surah 2 (Al-Baqarah) opens with the immediate answer: 'Here is the Book—in it is guidance.' An instant question-and-answer handshake!",
    'rel_002_003_victory_response': "Surah 2 ends with the community's heartfelt prayer: 'Grant us victory over the disbelievers!' Surah 3 opens by reassuring the believers after the trial of Uhud, showing how God grants steadfastness.",
    'rel_003_004_uhud_orphans': "Surah 3 closes with the martyrs who fell in battle. Surah 4 immediately tackles the human aftermath: protecting the widows and orphans left behind, establishing justice and inheritance.",
    'rel_004_005_covenant_fulfillment': "Surah 4 concludes with laws of inheritance and divine covenants. Surah 5 opens with the overarching command: 'O you who believe, honor and fulfill all your covenants!'",
    'rel_009_010_messenger_astonishment': "Surah 9 concludes with the compassionate Messenger sent to humanity. Surah 10 opens by addressing the skeptics who asked: 'Why would God choose a mortal human being to guide us?'",
    'rel_018_019_transition': "Surah 18 ends by affirming that the Prophet is a mortal servant receiving revelation. Surah 19 opens by showing how God honors humble human servants (Zechariah, Mary, and Jesus) with miraculous mercy.",
    'rel_019_020_transition': "Surah 19 ends with the eerie silence of ancient destroyed empires. Surah 20 immediately comforts the Prophet: 'We did not send down the Qur'an upon you that you should suffer distress!'",
    'rel_020_021_transition': "Surah 20 ends on waiting ('Each of us is waiting, so wait!'). Surah 21 shatters the waiting: 'Humanity's reckoning has drawn near while they are heedless!'",
    'rel_021_022_transition': "The Prophet prays at the end of 21: 'My Lord, judge in truth!' Surah 22 opens with the colossal reality of that truth: 'The earthquake of the Final Hour is a tremendous thing!'",
    'rel_022_023_transition': "Surah 22 ends with the command: 'Establish prayer, give zakah, and hold fast to Allah.' Surah 23 starts with the reward: 'Certainly have the believers succeeded—those who are humble in their prayers and pay zakah!'",
    'rel_023_024_transition': "Surah 23 ends with a plea for divine mercy and praised those who guard their chastity. Surah 24 introduces the legal and ethical charter that practically protects society from slander and shields modesty.",
    'rel_024_025_transition': "Surah 24 closes with God's dominion over heavens and earth. Surah 25 opens by celebrating that sovereignty with 'Tabāraka', sending the Criterion upon His servant to guide the worlds.",
    'rel_025_026_transition': "Surah 25 warns that denial brings inevitable retribution. Surah 26 consoles the Prophet's heartbreak over their denial, recounting seven ancient messengers who were similarly vindicated.",
    'rel_026_027_transition': "Surah 26 exempts and praises the believers who do good deeds. Surah 27 opens by declaring the Book as glad tidings specifically for those believers who pray and give zakah.",
    'rel_027_028_transition': "Surah 27 ends with the promise: 'He will show you His signs and you will recognize them.' Surah 28 opens with the greatest sign: the providential story of baby Moses defeating Pharaoh.",
    'rel_039_040_transition': "Surah 39 ends with the angels surrounding the Throne after Judgment Day. Surah 40 opens by revealing that those same Throne-bearing angels are praying right now for the forgiveness of believers on earth!",
    'rel_040_041_transition': "Surah 40 ends with the futility of regretting disbelief when punishment arrives. Surah 41 opens with an expounded Arabic Book offering clear warnings before it is too late.",
    'rel_041_042_transition': "Surah 41 ends with signs in the cosmos and human soul. Surah 42 connects those signs to the universal revelation uniting all biblical and prophetic messengers under one faith.",
    'rel_042_043_transition': "Surah 42 describes revelation as a life-giving spirit guiding to the straight path. Surah 43 swears by the clear Book rooted in the celestial Mother of the Book, exposing earthly gold as trivial.",
    'rel_043_044_transition': "The Prophet laments in 43: 'My Lord, they do not believe!' and God says 'They will soon know.' Surah 44 reveals what they will know: the arrival of the visible apocalyptic smoke.",
    'rel_044_045_transition': "Surah 44 ends with 'Watch, for they are watching.' Surah 45 points to cosmic signs and depicts the scene where all waiting ends: every nation fallen on its knees.",
    'rel_045_046_transition': "Surah 45 concludes with praise belonging to 'Al-Aziz Al-Hakim'. Surah 46 opens with those exact two attributes, linking them to the purposeful creation of heavens and earth.",
    'rel_046_047_transition': "Surah 46 ends with the command to have patience like the messengers of firm resolve. Surah 47 names the Prophet Muhammad and begins active divine defense, nullifying the plots of his enemies.",
    'rel_056_057_transition': "Surah 56 ends with: 'Glorify the name of your Lord, the Supreme!' Surah 57 opens: 'Everything in the heavens and earth has already glorified Him!' The command meets universal realization.",
    'rel_057_058_transition': "Surah 57 affirms God's all-encompassing knowledge and bounty. Surah 58 demonstrates that knowledge in the intimate hearing of a distressed woman who whispered in her home, heard from above seven heavens.",
    'rel_058_059_transition': "Surah 58 concludes with the victory of the Party of Allah. Surah 59 immediately demonstrates the downfall of those who opposed Allah and His Messenger (the expulsion of Banu an-Nadir).",
    'rel_059_060_transition': "Surah 59 concludes with the Most Beautiful Names of the Supreme Sovereign. Surah 60 opens by asking: If God is your King, how can you secretly ally with His enemies?",
    'rel_060_061_transition': "Surah 60 forbids alliance with those under divine anger. Surah 61 demands internal integrity: why say what you do not do? Stand united like a lead-cemented wall.",
    'rel_061_062_transition': "Surah 61 ends with the prophecy of Ahmad. Surah 62 celebrates the fulfillment of that prophecy in the Prophet sent to the unlettered, shifting to continuous praise (Yusabbihu).",
    'rel_062_063_transition': "Surah 62 warns against leaving the Friday sermon for business. Surah 63 unmasks the real danger: hypocrites who come to the mosque with deceitful oaths.",
    'rel_063_064_transition': "Surah 63 ends with the hoarder's deathbed panic to give charity. Surah 64 names the Day of Mutual Loss and Gain where worldly hoarders discover their true bankruptcy.",
    'rel_064_065_transition': "Surah 64 warns of domestic friction with family. Surah 65 provides the sacred legal boundaries for divorce with compassion, guaranteeing relief and provision for those with Taqwa.",
    'rel_065_066_transition': "Surah 65 ends with God's knowledge encompassing all things in seven heavens and earth. Surah 66 shows that knowledge hearing a private confidence whispered in the Prophet's house.",
    'rel_105_106_sanctuary_security': "Surah 105 destroyed the army of elephants to protect the Ka'bah. Surah 106 tells the Quraysh: since God protected your Sanctuary, worship the Lord of this House who fed you and kept you safe.",
    'rel_114_001_cosmic_envelope': "The Grand Cosmic Loop: Surah 114 seeks refuge from the stealthy whisperer who misguides hearts. That refuge directly protects the prayer you make in Surah 1: 'Guide us to the Straight Path and don't let us go astray.' The end seals the beginning!"
  };

  // Helper: Cluster Storylines & Plain-English Summaries
  const clusterStorylines = {
    all: {
      title: 'The Living Tapestry (All 60 Connected Surahs)',
      badge: 'Macro Architecture',
      narrative: 'Think of the Qur\'an not as isolated, separate chapters, but as a grand interconnected symphony. From the opening prayer for guidance in Surah 1, through the building of community laws, into the comforting stories of tested prophets, through the sublime hymns of cosmic praise, and down to the final protection surahs that loop all the way back to the opening prayer—every chapter hands the baton to the next.',
      takeaway: 'The Qur\'an has an intentional divine flow. Moving from chapter to chapter reveals how faith, ethics, tests, and cosmic signs are bound together.'
    },
    tiwal: {
      title: 'The Foundation Pillars (Surahs 1–9)',
      badge: 'Worldview & Community',
      narrative: 'In Surah 1 (Al-Fātiḥah), humanity prays: "Guide us to the Straight Path." In Surah 2 (Al-Baqarah), God immediately answers: "This is the Book—in it is guidance." From there, Surahs 2 through 9 systematically lay down the foundation: who God is, how to build a just society, family law, defending the vulnerable, and honoring covenants.',
      takeaway: 'Faith begins with sincere prayer (1), receives the Book (2), defends the truth (3), protects the weak (4), and honors covenants (5–9).'
    },
    prophetic: {
      title: 'The Tested Believer: Comfort in Hardship (Surahs 10–18)',
      badge: 'Emotional Resilience',
      narrative: 'After the legal foundations, the Qur\'an speaks directly to the human heart. Surahs 10 to 18 follow prophets who were mocked, outnumbered, or thrown into wells (Yūnus, Hūd, Yūsuf, Ibrāhīm). Surah 18 (Al-Kahf) brings four ultimate life trials: faith (the Cave youth), wealth (the garden), knowledge (Mūsā & Al-Khiḍr), and power (Dhū al-Qarnayn).',
      takeaway: 'A spiritual shelter for difficult days—reminding you that every hardship has an appointed divine relief.'
    },
    narrative: {
      title: 'Deliverance & Hope: How God Defends the Vulnerable (Surahs 19–28)',
      badge: 'Providential Victory',
      narrative: 'This 10-chapter epic starts with silent tears and ends with the collapse of an arrogant empire. It opens with an elderly prophet praying in secret and Mary giving birth alone under a palm tree (Surah 19). It moves through divine light and moral modesty (Surah 24), and peaks with baby Moses placed in a reed basket in the Nile, growing up to bring down Pharaoh (Surah 28).',
      takeaway: 'No tyrant is too powerful for God, and no sincere whispered prayer is ever forgotten.'
    },
    hawamim: {
      title: 'The 7 Silk Brocades: Dismantling Ego & Arrogance (Surahs 40–46)',
      badge: 'Dībāj al-Qur\'ān',
      narrative: 'Celebrated by the Prophet\'s companions as the "crown jewels" of the Qur\'an. All seven chapters open with the letters Ḥā-Mīm. They directly confront intellectual arrogance—people who think wealth and status make them untouchable. A secret believer speaks truth to power in Pharaoh\'s cabinet, nature invites our intellect to reflect, and worldly gold is shown to be cheap compared to eternal truth.',
      takeaway: 'True strength is moral courage and humility before the Creator, not palaces, gold, or political muscle.'
    },
    eschatological: {
      title: 'Cosmic Awakening: Signs in the Heavens (Surahs 54–57)',
      badge: 'Awe & Reflection',
      narrative: 'A cinematic, high-impact sequence: the moon splitting (Al-Qamar), the rhythmic reminder of boundless divine gifts—"Which of the favors of your Lord will you deny?" (Ar-Raḥmān), the three cohorts of human destiny (Al-Wāqiʿah), and the descent of Iron to balance spiritual light with material strength (Al-Ḥadīd).',
      takeaway: 'Look up at the cosmos and look within your heart—gratitude is the only rational human response.'
    },
    musabbihat: {
      title: 'The Cosmic Symphony & Everyday Peace (Surahs 57–66)',
      badge: 'Celestial Praise & Social Order',
      narrative: 'All across nature, trees, stars, and atoms are glorifying their Maker (Tasbīḥ). In these chapters, God links cosmic harmony to everyday ethics: hearing a distressed woman who felt wronged in her marriage (Al-Mujādilah), standing together in unshakeable solidarity (Aṣ-Ṣaff), attending Friday prayer without commercial distraction (Al-Jumuʿah), and treating spouses with mercy during divorce (Aṭ-Ṭalāq).',
      takeaway: 'True worship isn\'t just singing God\'s praise—it is bringing justice, fairness, and compassion into our homes and communities.'
    },
    final: {
      title: 'The Cosmic Circle & Ultimate Sanctuary (Surahs 105–114 & 114➔1)',
      badge: 'The Grand Loop',
      narrative: 'The short, powerful surahs memorized worldwide. From defeating the army of war elephants (105), to feeding the poor (107), abundant good (108), and pure monotheism (112). And the breathtaking climax: Surah 114 seeks refuge from the stealthy whisperer who causes human doubt—which directly protects the prayer you make in Surah 1 to stay on the Straight Path!',
      takeaway: 'The Qur\'an is an unbroken circle. When you finish reading at An-Nās (114), you are immediately guided back to Al-Fātiḥah (1).'
    }
  };

  // Inspect Relationship details in Atlas
  function inspectRelationship(rel) {
    if (!atlasEdgeInspector || !inspectorContent) return;

    const relatedEvidence = evidenceData.filter(e => e.relationship_id === rel.id);

    let confidenceBadge = `<span class="badge badge-confidence-classical">Classical Sunni Mufassir</span>`;
    if (rel.confidence === 'supported_by_multiple_tafsir_sources') {
      confidenceBadge = `<span class="badge badge-confidence-multiple">Multiple Tafsir Authorities</span>`;
    }

    const laymanText = laymanTakes[rel.id] || rel.description;

    let evHtml = '';
    relatedEvidence.forEach(ev => {
      evHtml += `
        <div class="evidence-box" style="margin-top: 0.75rem;">
          <div class="evidence-header">Classical Citation: ${ev.exact_reference}</div>
          <div class="evidence-quote-ar">${ev.original_quote}</div>
          <div class="evidence-quote-en">"${ev.translation_or_paraphrase}"</div>
        </div>
      `;
    });

    inspectorTitle.innerHTML = `
      <span>Transition: ${rel.from_id} ➔ ${rel.to_id}</span>
    `;

    inspectorContent.innerHTML = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
        ${confidenceBadge}
        <span class="badge badge-reltype">${rel.relationship_type.replace(/_/g, ' ')}</span>
      </div>

      <!-- Newbie Layman Take Callout -->
      <div class="layman-take-box">
        <div class="layman-take-header">
          <span>💡</span> The Layman's Quick Take (Why They Connect):
        </div>
        <div class="layman-take-text">
          ${laymanText}
        </div>
      </div>

      <div style="font-family: var(--font-sans); font-size: 0.85rem; font-weight: 700; color: var(--accent-emerald); text-transform: uppercase; margin-bottom: 0.35rem;">
        📜 Classical Scholarly Analysis:
      </div>
      <p style="font-size: 0.95rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 0.75rem;">
        ${rel.description}
      </p>
      ${evHtml}
    `;

    atlasEdgeInspector.style.display = 'block';
    atlasEdgeInspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  if (closeInspectorBtn) {
    closeInspectorBtn.addEventListener('click', () => {
      atlasEdgeInspector.style.display = 'none';
      document.querySelectorAll('.atlas-edge').forEach(el => el.classList.remove('selected'));
    });
  }

  // Atlas Cluster Bar Buttons
  if (atlasClusterBar) {
    const clusterBtns = atlasClusterBar.querySelectorAll('.cluster-btn');
    clusterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        clusterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAtlasGraph(btn.dataset.cluster);
        if (atlasEdgeInspector) atlasEdgeInspector.style.display = 'none';
      });
    });
  }

  // ==========================================
  // RENDER TRANSITIONS TAB WITH CLUSTER FILTER
  // ==========================================
  function renderTransitions(cluster = 'all') {
    currentTransitionCluster = cluster;
    if (!transitionsList) return;
    transitionsList.innerHTML = '';

    let transitions = relationshipsData.filter(r => 
      r.relationship_type === 'adjacent_surah_transition' || 
      r.relationship_type === 'cause_and_response' ||
      r.relationship_type === 'structural_parallel'
    );

    if (cluster !== 'all') {
      transitions = transitions.filter(r => classifyRelationship(r) === cluster);
    }

    if (transitions.length === 0) {
      transitionsList.innerHTML = `<p style="color: var(--text-muted); font-style: italic;">No transitions found for this filter.</p>`;
      return;
    }

    transitions.forEach(rel => {
      const card = createRelationshipCard(rel);
      transitionsList.appendChild(card);
    });
  }

  // Transition Cluster Bar Buttons
  if (transitionClusterBar) {
    const clusterBtns = transitionClusterBar.querySelectorAll('.cluster-btn');
    clusterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        clusterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTransitions(btn.dataset.cluster);
      });
    });
  }

  // Render Envelopes (Opening/Ending)
  function renderEnvelopes() {
    if (!envelopeList) return;
    envelopeList.innerHTML = '';

    const envelopes = relationshipsData.filter(r => 
      r.relationship_type === 'opening_ending_correspondence'
    );

    envelopes.forEach(rel => {
      const card = createRelationshipCard(rel);
      envelopeList.appendChild(card);
    });
  }

  // Render Thematic Networks
  function renderThemes() {
    if (!themesList) return;
    themesList.innerHTML = '';

    themesData.forEach(th => {
      const card = document.createElement('div');
      card.className = 'relationship-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
          <h3 style="font-size: 1.35rem; color: var(--accent-emerald);">${th.name}</h3>
          <span style="font-family: var(--font-arabic); font-size: 1.3rem; color: var(--accent-gold); direction: rtl;">
            ${(th.related_terms_ar || []).join(' • ')}
          </span>
        </div>
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
          ${th.description}
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
          <strong style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted); align-self: center;">Anchor Passages:</strong>
          ${(th.anchor_passages || []).map(p => `<span class="badge badge-reltype">${p}</span>`).join('')}
        </div>
        <div style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted);">
          <strong>Key Concepts:</strong> ${(th.related_terms_en || []).join(', ')}
        </div>
      `;
      themesList.appendChild(card);
    });
  }

  // Create Generic Relationship Card
  function createRelationshipCard(rel) {
    const card = document.createElement('div');
    card.className = 'relationship-card';

    // Look up evidence items
    const relatedEvidence = evidenceData.filter(e => e.relationship_id === rel.id);

    let confidenceClass = 'badge-confidence-classical';
    let confidenceText = 'Classical Mufassir';
    if (rel.confidence === 'supported_by_multiple_tafsir_sources') {
      confidenceClass = 'badge-confidence-multiple';
      confidenceText = 'Multiple Sources';
    } else if (rel.confidence === 'classical_scholarly_observation') {
      confidenceClass = 'badge-confidence-observation';
      confidenceText = 'Scholarly Observation';
    }

    let evidenceHtml = '';
    relatedEvidence.forEach(ev => {
      evidenceHtml += `
        <div class="evidence-box">
          <div class="evidence-header">Classical Citation: ${ev.exact_reference}</div>
          <div class="evidence-quote-ar">${ev.original_quote}</div>
          <div class="evidence-quote-en">"${ev.translation_or_paraphrase}"</div>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="rel-badge-bar">
        <span class="badge ${confidenceClass}">${confidenceText}</span>
        <span class="badge badge-reltype">${rel.relationship_type.replace(/_/g, ' ')}</span>
        <span class="badge badge-reltype">${rel.from_id} ➔ ${rel.to_id}</span>
      </div>
      <div class="rel-title">${rel.id.replace(/rel_/g, '').replace(/_/g, ' ').toUpperCase()}</div>
      <div class="rel-description">${rel.description}</div>
      ${evidenceHtml}
    `;

    return card;
  }

  // Render Surah Personalities Showcase
  function renderPersonalities() {
    if (!personalitiesList) return;
    personalitiesList.innerHTML = '';

    const detailedSurahs = surahsData.filter(s => s.personality_title);

    detailedSurahs.forEach(s => {
      const card = document.createElement('div');
      card.className = 'relationship-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
          <h3 style="font-size: 1.3rem; color: var(--accent-emerald);">#${s.id}. ${s.name_en} — ${s.personality_title}</h3>
          <span style="font-family: var(--font-arabic); font-size: 1.6rem; color: var(--text-primary);">${s.name_ar}</span>
        </div>
        <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.6;">
          ${s.personality_summary}
        </div>
        <div style="display: flex; gap: 1rem; font-family: var(--font-sans); font-size: 0.85rem; color: var(--accent-gold);">
          <span><strong>Distinctive Voice:</strong> ${s.distinctive_voice}</span>
        </div>
      `;
      personalitiesList.appendChild(card);
    });
  }

  // Render Library
  function renderLibrary() {
    if (!libraryGrid) return;
    libraryGrid.innerHTML = '';

    sourcesData.forEach(src => {
      const card = document.createElement('div');
      card.className = 'library-card';
      card.innerHTML = `
        <div class="library-author">${src.author}</div>
        <div class="library-title">${src.work_title}</div>
        <div class="library-desc">${src.reliability_notes || ''}</div>
        <div style="margin-top: 0.5rem; font-family: var(--font-sans); font-size: 0.78rem; color: var(--text-muted);">
          ${src.school_or_tradition} • ${src.edition || ''}
        </div>
      `;
      libraryGrid.appendChild(card);
    });
  }
});