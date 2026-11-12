// The Qur'an in Conversation - Web Application Engine
document.addEventListener('DOMContentLoaded', async () => {
  let surahsData = [];
  let relationshipsData = [];
  let evidenceData = [];
  let sourcesData = [];
  let themesData = [];

  // DOM Elements
  const tabs = document.querySelectorAll('nav.main-nav button');
  const panels = document.querySelectorAll('.tab-panel');
  const surahGrid = document.getElementById('surahGrid');
  const surahSearch = document.getElementById('surahSearch');
  const surahFilter = document.getElementById('surahFilter');
  const transitionsList = document.getElementById('transitionsList');
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
    renderTransitions();
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
      if (target) target.classList.add('active');
    });
  });

  // Surah Search & Filtering
  function filterSurahs() {
    const query = (surahSearch.value || '').toLowerCase().trim();
    const type = surahFilter.value;

    const filtered = surahsData.filter(s => {
      const matchQuery = s.name_en.toLowerCase().includes(query) ||
                         s.name_ar.includes(query) ||
                         s.name_meaning.toLowerCase().includes(query) ||
                         (s.personality_summary && s.personality_summary.toLowerCase().includes(query)) ||
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
          <strong>Distinct Personality:</strong> ${s.personality_summary ? s.personality_summary.substring(0, 140) + '...' : 'Unique Qur\'anic voice and thematic progression.'}
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

  // Open Surah Detail Modal
  async function openSurahModal(surahId) {
    const surah = surahsData.find(s => s.id === surahId);
    if (!surah || !modalOverlay) return;

    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h2 style="font-family: var(--font-arabic); font-size: 2.2rem; color: var(--accent-emerald); direction: rtl; margin-bottom: 0.25rem;">
          ${surah.name_ar}
        </h2>
        <h3 style="font-size: 1.4rem; font-weight: 600;">Surah ${surah.name_en} (${surah.name_meaning})</h3>
        <p style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
          Surah #${surah.id} • ${surah.revelation_classification.toUpperCase()} • ${surah.ayah_count} Ayat • Juz ${surah.juz_numbers.join(', ')}
        </p>
      </div>

      <div style="background: var(--accent-gold-soft); border: 1px solid #ebd7ab; border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h4 style="font-family: var(--font-sans); font-size: 0.88rem; font-weight: 700; color: #875708; text-transform: uppercase; margin-bottom: 0.4rem;">
          🌟 Surah Personality & Distinct Atmosphere
        </h4>
        <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">
          ${surah.personality_title || surah.name_en}
        </div>
        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.6;">
          ${surah.personality_summary || 'Each surah has a unique spiritual atmosphere, thematic axis, and rhetorical cadence.'}
        </p>
        ${surah.distinctive_voice ? `<p style="font-size: 0.85rem; margin-top: 0.5rem; color: var(--accent-emerald);"><strong>Distinctive Voice:</strong> ${surah.distinctive_voice}</p>` : ''}
      </div>

      <div id="modalAyahsContainer">
        <p style="color: var(--text-muted); font-size: 0.9rem;">Loading canonical verses...</p>
      </div>
    `;

    modalOverlay.classList.add('open');

    // Try fetching individual surah ayahs
    try {
      const paddedId = String(surahId).padStart(3, '0');
      const res = await fetch(`data/surahs/${paddedId}.json`);
      if (res.ok) {
        const fullData = await res.json();
        const ayahsCont = document.getElementById('modalAyahsContainer');
        if (ayahsCont && fullData.ayahs) {
          let html = `<h4 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.5rem;">Canonical Verses (Selected)</h4>`;
          const displayAyahs = fullData.ayahs.slice(0, 15); // first 15 ayahs
          displayAyahs.forEach(a => {
            html += `
              <div style="margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.4rem;">
                  <span style="font-family: var(--font-sans); font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Ayah ${a.ayah_number}</span>
                  <div class="arabic-block" style="font-size: 1.35rem; margin: 0;">${a.arabic_uthmani}</div>
                </div>
                <div class="english-translation" style="font-size: 0.92rem; color: var(--text-secondary);">"${a.translation_saheeh}"</div>
              </div>
            `;
          });
          if (fullData.ayahs.length > 15) {
            html += `<p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">... and ${fullData.ayahs.length - 15} more verses in full dataset.</p>`;
          }
          ayahsCont.innerHTML = html;
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

  // Render Sequential Transitions
  function renderTransitions() {
    if (!transitionsList) return;
    transitionsList.innerHTML = '';

    const transitions = relationshipsData.filter(r => 
      r.relationship_type === 'adjacent_surah_transition' || 
      r.relationship_type === 'cause_and_response'
    );

    transitions.forEach(rel => {
      const card = createRelationshipCard(rel);
      transitionsList.appendChild(card);
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

    // Show surahs with personalities
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
