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
    if (allIn(nums, 39, 47)) return 'hawamim';
    if (allIn(nums, 54, 57)) return 'eschatological';
    if (nums.every(n => n >= 105) || (nums.includes(114) && nums.includes(1))) return 'final';
    if (nums.some(n => n === 23 || n === 28)) return 'matali';
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
        <h4 style="font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700; color: #875708; text-transform: uppercase; margin-bottom: 0.4rem;">
          🌟 Surah Personality & Atmospheric Atmosphere (Jaww al-Sūrah)
        </h4>
        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          ${surah.personality_title || surah.name_en}
        </div>
        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6;">
          ${surah.personality_summary || 'Each surah has a unique spiritual atmosphere, thematic axis, and rhetorical cadence.'}
        </p>
        ${surah.distinctive_voice ? `<p style="font-size: 0.88rem; margin-top: 0.6rem; color: var(--accent-emerald);"><strong>Distinctive Voice:</strong> ${surah.distinctive_voice}</p>` : ''}
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
        title: 'The Seven Long Surahs (Al-Sabʿ al-Ṭiwāl)',
        surahIds: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        yOffset: 80
      },
      prophetic: {
        title: 'The Prophetic & Wisdom Cluster',
        surahIds: [10, 11, 12, 13, 14, 15, 16, 17, 18],
        yOffset: 80
      },
      hawamim: {
        title: 'The Ḥawāmīm Silk Brocades (Dībāj al-Qur\'ān)',
        surahIds: [39, 40, 41, 42, 43, 44, 45, 46, 47],
        yOffset: 80
      },
      eschatological: {
        title: 'Cosmic Signs & Eschatological Realities',
        surahIds: [54, 55, 56, 57],
        yOffset: 80
      },
      final: {
        title: 'The Final Surahs Cluster & Grand Cosmic Seal',
        surahIds: [105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
        yOffset: 80
      }
    };

    let activeClusters = [];
    if (cluster === 'all') {
      activeClusters = ['tiwal', 'prophetic', 'hawamim', 'eschatological', 'final'];
    } else if (clusterDefinitions[cluster]) {
      activeClusters = [cluster];
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

  // Inspect Relationship details in Atlas
  function inspectRelationship(rel) {
    if (!atlasEdgeInspector || !inspectorContent) return;

    const relatedEvidence = evidenceData.filter(e => e.relationship_id === rel.id);

    let confidenceBadge = `<span class="badge badge-confidence-classical">Classical Sunni Mufassir</span>`;
    if (rel.confidence === 'supported_by_multiple_tafsir_sources') {
      confidenceBadge = `<span class="badge badge-confidence-multiple">Multiple Tafsir Authorities</span>`;
    }

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
      <p style="font-size: 0.98rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 0.75rem;">
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