// NASA API Recopiler & Space Apps Explorer - Application Logic

(function () {
  'use strict';

  // =========================================================================
  // State Management
  // =========================================================================
  const state = {
    apiKey: localStorage.getItem('nasa_global_api_key') || 'DEMO_KEY',
    savedApis: JSON.parse(localStorage.getItem('nasa_api_dossier_saved') || '[]'),
    history: JSON.parse(localStorage.getItem('nasa_api_dossier_history') || '[]'),
    currentParams: [
      { key: 'api_key', value: 'DEMO_KEY', enabled: true, note: 'Clave de API de NASA' }
    ],
    currentResponse: null,
    currentRawJson: null,
    currentParsedData: null,
    currentFinalUrl: '',
    selectedStarRating: 5,
    activeSidebarTab: 'catalog',
    activeCategory: 'all',
    activeRespTab: 'json',
    activeCodeLang: 'js',
    useCorsProxy: false,
    currentSavedId: null // If editing an already saved API
  };

  // DOM Elements Cache
  const el = {
    globalApiKey: document.getElementById('global-api-key'),
    btnSaveKey: document.getElementById('btn-save-key'),
    cntSelected: document.getElementById('cnt-selected'),
    cntEvaluating: document.getElementById('cnt-evaluating'),
    cntTotal: document.getElementById('cnt-total'),
    sidebarSavedCount: document.getElementById('sidebar-saved-count'),

    // Sidebar
    sidebarTabs: document.querySelectorAll('.sidebar-tab'),
    sidebarFilterInput: document.getElementById('sidebar-filter-input'),
    presetsContainer: document.getElementById('presets-container'),
    presetCategoriesFilter: document.getElementById('preset-categories-filter'),
    savedContainer: document.getElementById('saved-container'),
    savedStatusFilter: document.getElementById('saved-status-filter'),
    historyContainer: document.getElementById('history-container'),
    btnClearHistory: document.getElementById('btn-clear-history'),

    // Request Runner
    corsProxyToggle: document.getElementById('cors-proxy-toggle'),
    requestUrlInput: document.getElementById('request-url-input'),
    btnSendRequest: document.getElementById('btn-send-request'),
    btnResetRequest: document.getElementById('btn-reset-request'),
    paramsTableBody: document.getElementById('params-table-body'),
    btnAddParam: document.getElementById('btn-add-param'),
    btnInjectApiKey: document.getElementById('btn-inject-api-key'),

    // Evaluation
    evalName: document.getElementById('eval-name'),
    evalDecision: document.getElementById('eval-decision'),
    evalStars: document.getElementById('eval-stars'),
    evalChallenge: document.getElementById('eval-challenge'),
    evalKeyData: document.getElementById('eval-key-data'),
    evalNotes: document.getElementById('eval-notes'),
    evalRisks: document.getElementById('eval-risks'),
    btnSaveEvaluation: document.getElementById('btn-save-evaluation'),

    // Response Views
    responseStats: document.getElementById('response-stats'),
    statStatusCode: document.getElementById('stat-status-code'),
    statTimeVal: document.getElementById('stat-time-val'),
    statSizeVal: document.getElementById('stat-size-val'),
    respTabBtns: document.querySelectorAll('.resp-tab-btn'),
    emptyResponseState: document.getElementById('empty-response-state'),
    loadingResponseState: document.getElementById('loading-response-state'),
    errorBanner: document.getElementById('error-banner'),
    errorTitle: document.getElementById('error-title'),
    errorDesc: document.getElementById('error-desc'),
    btnRetryProxy: document.getElementById('btn-retry-proxy'),

    // Response Tabs
    jsonToolbar: document.getElementById('json-toolbar'),
    jsonSearchInput: document.getElementById('json-search-input'),
    btnExpandAll: document.getElementById('btn-expand-all'),
    btnCollapseAll: document.getElementById('btn-collapse-all'),
    btnCopyJson: document.getElementById('btn-copy-json'),
    btnDownloadJson: document.getElementById('btn-download-json'),
    jsonOutputContainer: document.getElementById('json-output-container'),
    tabBtnMedia: document.getElementById('tab-btn-media'),
    mediaCount: document.getElementById('media-count'),
    mediaGalleryContainer: document.getElementById('media-gallery-container'),
    schemaTableBody: document.getElementById('schema-table-body'),
    snippetLangPills: document.querySelectorAll('.lang-pill'),
    codeSnippetContent: document.getElementById('code-snippet-content'),
    btnCopyCode: document.getElementById('btn-copy-code'),

    // Modals
    modalExport: document.getElementById('modal-export'),
    btnOpenExport: document.getElementById('btn-open-export'),
    btnCloseExport: document.getElementById('btn-close-export'),
    btnDlMd: document.getElementById('btn-dl-md'),
    btnCopyMd: document.getElementById('btn-copy-md'),
    btnDlJson: document.getElementById('btn-dl-json'),
    btnDlCsv: document.getElementById('btn-dl-csv'),
    exportPreviewBox: document.getElementById('export-preview-box'),

    modalImport: document.getElementById('modal-import'),
    btnOpenImport: document.getElementById('btn-open-import'),
    btnCloseImport: document.getElementById('btn-close-import'),
    importFileInput: document.getElementById('import-file-input'),

    toastContainer: document.getElementById('toast-container')
  };

  // =========================================================================
  // Initialize Application
  // =========================================================================
  function init() {
    el.globalApiKey.value = state.apiKey;
    renderParamsTable();
    renderPresetsCatalog();
    renderSavedList();
    renderHistoryList();
    updateMetrics();
    setupEventListeners();

    // Default select first preset if URL is empty
    if (typeof NASA_PRESETS !== 'undefined' && NASA_PRESETS.length > 0) {
      loadPreset(NASA_PRESETS[0], false);
    }
  }

  // =========================================================================
  // Event Listeners Setup
  // =========================================================================
  function setupEventListeners() {
    // API Key
    el.btnSaveKey.addEventListener('click', () => {
      const key = el.globalApiKey.value.trim() || 'DEMO_KEY';
      state.apiKey = key;
      localStorage.setItem('nasa_global_api_key', key);
      injectApiKeyToParams();
      showToast('Clave de API guardada correctamente', 'success');
    });

    // Sidebar navigation tabs
    el.sidebarTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        switchSidebarTab(targetTab);
      });
    });

    // Sidebar category filter
    el.presetCategoriesFilter.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        el.presetCategoriesFilter.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeCategory = pill.dataset.category;
        renderPresetsCatalog();
      });
    });

    // Sidebar filter search
    el.sidebarFilterInput.addEventListener('input', () => {
      renderPresetsCatalog();
      renderSavedList();
    });

    // Saved Status Filter
    el.savedStatusFilter.addEventListener('change', renderSavedList);

    // History Clear
    el.btnClearHistory.addEventListener('click', () => {
      state.history = [];
      localStorage.setItem('nasa_api_dossier_history', '[]');
      renderHistoryList();
      showToast('Historial limpiado', 'info');
    });

    // Request Runner Actions
    el.btnAddParam.addEventListener('click', () => {
      state.currentParams.push({ key: '', value: '', enabled: true, note: '' });
      renderParamsTable();
    });

    el.btnInjectApiKey.addEventListener('click', injectApiKeyToParams);

    el.btnResetRequest.addEventListener('click', resetRequestForm);

    el.corsProxyToggle.addEventListener('change', (e) => {
      state.useCorsProxy = e.target.checked;
      showToast(state.useCorsProxy ? 'Modo Proxy CORS activado' : 'Modo Directo activado', 'info');
    });

    el.btnSendRequest.addEventListener('click', executeApiRequest);

    // Shortcut: Ctrl+Enter or Cmd+Enter to execute GET
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        executeApiRequest();
      }
    });

    // Star Rating
    el.evalStars.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.value, 10);
        setStarRating(val);
      });
    });

    // Save Evaluation
    el.btnSaveEvaluation.addEventListener('click', saveEvaluation);

    // Response Tabs
    el.respTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchResponseTab(btn.dataset.tab);
      });
    });

    // Code Snippets Language Selector
    el.snippetLangPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.snippetLangPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeCodeLang = pill.dataset.lang;
        updateCodeSnippet();
      });
    });

    el.btnCopyCode.addEventListener('click', () => {
      copyToClipboard(el.codeSnippetContent.textContent, 'Código copiado al portapapeles');
    });

    // JSON Toolbar
    el.btnCopyJson.addEventListener('click', () => {
      if (!state.currentRawJson) return;
      copyToClipboard(state.currentRawJson, 'JSON copiado al portapapeles');
    });

    el.btnDownloadJson.addEventListener('click', downloadCurrentJson);

    el.jsonSearchInput.addEventListener('input', (e) => {
      filterJsonOutput(e.target.value.trim());
    });

    el.btnExpandAll.addEventListener('click', () => {
      if (state.currentParsedData) {
        renderJsonVisualizer(state.currentParsedData);
      }
    });

    el.btnCollapseAll.addEventListener('click', () => {
      if (state.currentParsedData) {
        renderJsonVisualizer(state.currentParsedData, true);
      }
    });

    el.btnRetryProxy.addEventListener('click', () => {
      el.corsProxyToggle.checked = true;
      state.useCorsProxy = true;
      executeApiRequest();
    });

    // Export Modal
    el.btnOpenExport.addEventListener('click', openExportModal);
    el.btnCloseExport.addEventListener('click', closeExportModal);
    el.modalExport.addEventListener('click', (e) => {
      if (e.target === el.modalExport) closeExportModal();
    });

    el.btnDlMd.addEventListener('click', downloadMarkdownDossier);
    el.btnCopyMd.addEventListener('click', () => {
      const md = generateMarkdownDossier();
      copyToClipboard(md, 'Reporte Markdown copiado al portapapeles');
    });
    el.btnDlJson.addEventListener('click', downloadJsonCollection);
    el.btnDlCsv.addEventListener('click', downloadCsvMatrix);

    // Import Modal
    el.btnOpenImport.addEventListener('click', () => el.modalImport.style.display = 'flex');
    el.btnCloseImport.addEventListener('click', () => el.modalImport.style.display = 'none');
    el.modalImport.addEventListener('click', (e) => {
      if (e.target === el.modalImport) el.modalImport.style.display = 'none';
    });
    el.importFileInput.addEventListener('change', handleImportFile);
  }

  // =========================================================================
  // Query Parameters Table
  // =========================================================================
  function renderParamsTable() {
    el.paramsTableBody.innerHTML = '';
    state.currentParams.forEach((param, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td style="text-align: center;">
          <input type="checkbox" ${param.enabled ? 'checked' : ''} data-index="${index}" class="param-enable-cb">
        </td>
        <td>
          <input type="text" class="param-input param-key-input" value="${escapeHtml(param.key)}" placeholder="param_name" data-index="${index}">
        </td>
        <td>
          <input type="text" class="param-input param-val-input" value="${escapeHtml(param.value)}" placeholder="valor" data-index="${index}">
        </td>
        <td>
          <input type="text" class="param-input param-desc-input" value="${escapeHtml(param.note || '')}" placeholder="Nota / significado" data-index="${index}">
        </td>
        <td style="text-align: center;">
          <button class="btn-remove-param" data-index="${index}" title="Eliminar">&times;</button>
        </td>
      `;

      el.paramsTableBody.appendChild(tr);
    });

    // Attach listeners
    el.paramsTableBody.querySelectorAll('.param-enable-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const i = e.target.dataset.index;
        state.currentParams[i].enabled = e.target.checked;
        updateCodeSnippet();
      });
    });

    el.paramsTableBody.querySelectorAll('.param-key-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = e.target.dataset.index;
        state.currentParams[i].key = e.target.value;
        updateCodeSnippet();
      });
    });

    el.paramsTableBody.querySelectorAll('.param-val-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = e.target.dataset.index;
        state.currentParams[i].value = e.target.value;
        updateCodeSnippet();
      });
    });

    el.paramsTableBody.querySelectorAll('.param-desc-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = e.target.dataset.index;
        state.currentParams[i].note = e.target.value;
      });
    });

    el.paramsTableBody.querySelectorAll('.btn-remove-param').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = e.target.dataset.index;
        state.currentParams.splice(i, 1);
        renderParamsTable();
        updateCodeSnippet();
      });
    });
  }

  function injectApiKeyToParams() {
    const keyParam = state.currentParams.find(p => p.key === 'api_key');
    if (keyParam) {
      keyParam.value = state.apiKey;
      keyParam.enabled = true;
    } else {
      state.currentParams.push({
        key: 'api_key',
        value: state.apiKey,
        enabled: true,
        note: 'Clave de API de NASA'
      });
    }
    renderParamsTable();
    updateCodeSnippet();
    showToast('api_key actualizada en los parámetros', 'info');
  }

  function resetRequestForm() {
    state.currentSavedId = null;
    el.requestUrlInput.value = '';
    state.currentParams = [
      { key: 'api_key', value: state.apiKey, enabled: true, note: 'Clave de API de NASA' }
    ];
    renderParamsTable();
    el.evalName.value = '';
    el.evalDecision.value = 'selected';
    setStarRating(5);
    el.evalChallenge.value = '';
    el.evalKeyData.value = '';
    el.evalNotes.value = '';
    el.evalRisks.value = '';
    hideResponsePanels();
    updateCodeSnippet();
  }

  // =========================================================================
  // URL & Query Building
  // =========================================================================
  function buildFinalUrl() {
    let rawUrl = el.requestUrlInput.value.trim();
    if (!rawUrl) return '';

    try {
      const urlObj = new URL(rawUrl);
      state.currentParams.forEach(p => {
        if (p.enabled && p.key.trim()) {
          urlObj.searchParams.set(p.key.trim(), p.value.trim());
        }
      });
      return urlObj.toString();
    } catch {
      // In case user entered relative or partial URL
      let queryParts = state.currentParams
        .filter(p => p.enabled && p.key.trim())
        .map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
        .join('&');
      return queryParts ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}${queryParts}` : rawUrl;
    }
  }

  // =========================================================================
  // API Request Execution (The GET Runner)
  // =========================================================================
  async function executeApiRequest() {
    const rawUrl = el.requestUrlInput.value.trim();
    if (!rawUrl) {
      showToast('Por favor introduce una dirección URL para hacer la consulta', 'error');
      el.requestUrlInput.focus();
      return;
    }

    const finalUrl = buildFinalUrl();
    state.currentFinalUrl = finalUrl;

    // UI State: Loading
    el.emptyResponseState.style.display = 'none';
    el.errorBanner.style.display = 'none';
    el.loadingResponseState.style.display = 'flex';
    el.responseStats.style.display = 'none';
    el.jsonToolbar.style.display = 'none';
    el.jsonOutputContainer.innerHTML = '';
    el.mediaGalleryContainer.innerHTML = '';
    el.schemaTableBody.innerHTML = '';

    const startTime = performance.now();
    let fetchUrl = finalUrl;

    // Apply CORS Proxy if activated
    if (state.useCorsProxy) {
      if (window.location.protocol.startsWith('http')) {
        fetchUrl = `/api/proxy?url=${encodeURIComponent(finalUrl)}`;
      } else {
        fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(finalUrl)}`;
      }
    }

    try {
      const response = await fetch(fetchUrl);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      const statusText = `${response.status} ${response.statusText || (response.ok ? 'OK' : '')}`;
      const rawText = await response.text();
      const sizeBytes = new Blob([rawText]).size;
      const sizeFormatted = sizeBytes > 1024 * 1024 
        ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB` 
        : `${(sizeBytes / 1024).toFixed(1)} KB`;

      // Update Header Stats
      el.responseStats.style.display = 'flex';
      el.statStatusCode.textContent = statusText;
      el.statTimeVal.textContent = `${latencyMs} ms`;
      el.statSizeVal.textContent = sizeFormatted;

      const statPill = document.getElementById('stat-status');
      if (response.ok) {
        statPill.classList.remove('error');
      } else {
        statPill.classList.add('error');
      }

      state.currentRawJson = rawText;

      // Try parsing JSON
      let parsed = null;
      try {
        parsed = JSON.parse(rawText);
        state.currentParsedData = parsed;
      } catch {
        parsed = null;
        state.currentParsedData = rawText;
      }

      // Hide loading
      el.loadingResponseState.style.display = 'none';

      if (!response.ok) {
        el.errorBanner.style.display = 'flex';
        el.errorTitle.textContent = `Respuesta con error HTTP ${response.status}`;
        el.errorDesc.textContent = (parsed && (parsed.error?.message || parsed.msg || parsed.message)) || `El servidor de la NASA respondió: ${response.statusText}`;
      }

      // Render Outputs
      el.jsonToolbar.style.display = 'flex';
      renderJsonVisualizer(state.currentParsedData);

      // Detect media
      const mediaList = extractMediaUrls(state.currentParsedData);
      renderMediaGallery(mediaList);

      // Extract Schema & populate key-data suggestions
      renderSchemaTable(state.currentParsedData);

      // Update Code snippets
      updateCodeSnippet();

      // Push to history
      addToHistory({
        url: finalUrl,
        status: response.status,
        timestamp: new Date().toLocaleTimeString(),
        duration: latencyMs
      });

      showToast(`Consulta completada (${response.status}) en ${latencyMs}ms`, response.ok ? 'success' : 'error');

    } catch (err) {
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      el.loadingResponseState.style.display = 'none';
      el.errorBanner.style.display = 'flex';
      el.errorTitle.textContent = 'Fallo en la conexión / Restricción CORS';
      el.errorDesc.textContent = `${err.message}. Muchos endpoints bloquean peticiones directas desde el navegador. Activa el 'Proxy CORS Fallback' e intenta nuevamente.`;
      
      el.responseStats.style.display = 'flex';
      el.statStatusCode.textContent = 'Error';
      document.getElementById('stat-status').classList.add('error');
      el.statTimeVal.textContent = `${latencyMs} ms`;
      el.statSizeVal.textContent = '0 KB';

      showToast('Error al conectar con la API', 'error');
    }
  }

  function hideResponsePanels() {
    el.emptyResponseState.style.display = 'flex';
    el.loadingResponseState.style.display = 'none';
    el.errorBanner.style.display = 'none';
    el.responseStats.style.display = 'none';
    el.jsonToolbar.style.display = 'none';
    el.jsonOutputContainer.innerHTML = '';
    el.mediaGalleryContainer.innerHTML = '';
    el.schemaTableBody.innerHTML = '';
  }

  // =========================================================================
  // JSON Syntax Highlighter & Visualizer
  // =========================================================================
  function renderJsonVisualizer(data, collapse = false) {
    if (typeof data !== 'object' || data === null) {
      el.jsonOutputContainer.textContent = String(data);
      return;
    }

    try {
      const formattedJson = JSON.stringify(data, null, 2);
      el.jsonOutputContainer.innerHTML = syntaxHighlightJson(formattedJson);
    } catch {
      el.jsonOutputContainer.textContent = String(data);
    }
  }

  function syntaxHighlightJson(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  function filterJsonOutput(filterText) {
    if (!state.currentParsedData) return;
    if (!filterText) {
      renderJsonVisualizer(state.currentParsedData);
      return;
    }

    const jsonString = JSON.stringify(state.currentParsedData, null, 2);
    const lines = jsonString.split('\n');
    const filteredLines = lines.filter(line => line.toLowerCase().includes(filterText.toLowerCase()));

    el.jsonOutputContainer.innerHTML = filteredLines.length > 0 
      ? syntaxHighlightJson(filteredLines.join('\n'))
      : `<span style="color: var(--text-subtle);">No se encontraron coincidencias para "${escapeHtml(filterText)}"</span>`;
  }

  function downloadCurrentJson() {
    if (!state.currentRawJson) return;
    const blob = new Blob([state.currentRawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa_api_response_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo .json descargado', 'success');
  }

  // =========================================================================
  // Media URL Extractor & Gallery
  // =========================================================================
  function extractMediaUrls(data, results = []) {
    if (!data) return results;

    const isMediaUrl = (str) => {
      if (typeof str !== 'string') return false;
      return (
        str.startsWith('http://') || str.startsWith('https://')
      ) && (
        /\.(jpg|jpeg|png|webp|gif|mp4)(\?|$)/i.test(str) ||
        str.includes('images.nasa.gov') ||
        str.includes('apod.nasa.gov') ||
        str.includes('epic.gsfc.nasa.gov')
      );
    };

    if (Array.isArray(data)) {
      data.forEach(item => extractMediaUrls(item, results));
    } else if (typeof data === 'object') {
      for (const [key, val] of Object.entries(data)) {
        if (typeof val === 'string' && isMediaUrl(val)) {
          results.push({
            key,
            url: val,
            title: data.title || data.id || data.pl_name || key
          });
        } else if (typeof val === 'object') {
          extractMediaUrls(val, results);
        }
      }
    }
    return results;
  }

  function renderMediaGallery(mediaList) {
    el.mediaGalleryContainer.innerHTML = '';
    el.mediaCount.textContent = mediaList.length;

    if (mediaList.length === 0) {
      el.mediaGalleryContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
          No se detectaron enlaces directos a imágenes en este payload.
        </div>
      `;
      return;
    }

    mediaList.slice(0, 30).forEach(item => {
      const card = document.createElement('div');
      card.className = 'media-card';
      card.innerHTML = `
        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none';">
        <div class="media-info">
          <span class="media-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
          <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" class="media-url">Abrir original ↗</a>
        </div>
      `;
      el.mediaGalleryContainer.appendChild(card);
    });
  }

  // =========================================================================
  // Schema & Fields Extractor
  // =========================================================================
  function renderSchemaTable(data) {
    el.schemaTableBody.innerHTML = '';
    if (!data || typeof data !== 'object') return;

    const sampleObj = Array.isArray(data) ? data[0] : data;
    if (!sampleObj || typeof sampleObj !== 'object') return;

    const detectedKeys = [];

    for (const [prop, val] of Object.entries(sampleObj)) {
      const type = Array.isArray(val) ? 'Array' : typeof val;
      const sampleVal = typeof val === 'object' ? JSON.stringify(val).slice(0, 60) + '...' : String(val);
      detectedKeys.push(prop);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="schema-prop">${escapeHtml(prop)}</td>
        <td><span class="schema-type">${escapeHtml(type)}</span></td>
        <td class="schema-sample" title="${escapeHtml(String(val))}">${escapeHtml(sampleVal)}</td>
        <td>
          <button class="btn-ghost-sm btn-add-to-key-data" data-key="${escapeHtml(prop)}">+ Usar Campo</button>
        </td>
      `;
      el.schemaTableBody.appendChild(tr);
    }

    // Attach listeners to "+ Usar Campo"
    el.schemaTableBody.querySelectorAll('.btn-add-to-key-data').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        const current = el.evalKeyData.value.trim();
        if (current) {
          if (!current.includes(key)) {
            el.evalKeyData.value = `${current}, ${key}`;
          }
        } else {
          el.evalKeyData.value = key;
        }
        showToast(`Campo "${key}" añadido a los datos clave`, 'info');
      });
    });

    // Auto-fill suggested key data if evaluation key data is currently blank
    if (!el.evalKeyData.value.trim() && detectedKeys.length > 0) {
      el.evalKeyData.value = detectedKeys.slice(0, 6).join(', ');
    }
  }

  // =========================================================================
  // Code Snippet Generator
  // =========================================================================
  function updateCodeSnippet() {
    const finalUrl = buildFinalUrl() || 'https://api.nasa.gov/...';
    let code = '';

    if (state.activeCodeLang === 'js') {
      code = `// Consulta con JavaScript moderno (fetch / async-await)
async function fetchNasaData() {
  const url = "${finalUrl}";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    console.log("Datos obtenidos de la NASA:", data);
    return data;
  } catch (error) {
    console.error("Error al consultar API de la NASA:", error);
  }
}

fetchNasaData();`;
    } else if (state.activeCodeLang === 'python') {
      code = `# Consulta con Python (librería requests)
import requests

url = "${finalUrl}"

try:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()
    print("Éxito al obtener datos:", data)
except requests.exceptions.RequestException as e:
    print(f"Error al conectar con la NASA: {e}")`;
    } else if (state.activeCodeLang === 'curl') {
      code = `# Ejecutar directamente en la Terminal / Bash
curl -X GET "${finalUrl}" \\
     -H "Accept: application/json"`;
    }

    el.codeSnippetContent.textContent = code;
  }

  // =========================================================================
  // Presets Catalog & Loading
  // =========================================================================
  function renderPresetsCatalog() {
    el.presetsContainer.innerHTML = '';
    const query = el.sidebarFilterInput.value.toLowerCase().trim();

    if (typeof NASA_PRESETS === 'undefined') return;

    const filtered = NASA_PRESETS.filter(p => {
      const matchCat = state.activeCategory === 'all' || p.category === state.activeCategory;
      const matchQuery = !query || 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) || 
        p.url.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      el.presetsContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          No hay presets que coincidan con la búsqueda.
        </div>
      `;
      return;
    }

    filtered.forEach(preset => {
      const card = document.createElement('div');
      card.className = 'preset-card';
      card.innerHTML = `
        <div class="preset-card-top">
          <div class="preset-title">${escapeHtml(preset.name)}</div>
          <span class="preset-badge">${escapeHtml(preset.badge)}</span>
        </div>
        <p class="preset-desc">${escapeHtml(preset.description)}</p>
        <div class="preset-footer">
          <span class="preset-endpoint-pill">${escapeHtml(preset.url.replace('https://api.nasa.gov', ''))}</span>
          <span>Probar ↗</span>
        </div>
      `;

      card.addEventListener('click', () => loadPreset(preset, true));
      el.presetsContainer.appendChild(card);
    });
  }

  function loadPreset(preset, notify = true) {
    state.currentSavedId = null;
    el.requestUrlInput.value = preset.url;
    
    // Clone params and inject user's key if api_key exists
    state.currentParams = preset.params.map(p => {
      if (p.key === 'api_key') {
        return { ...p, value: state.apiKey };
      }
      return { ...p };
    });

    renderParamsTable();

    // Populate default evaluation fields from preset
    el.evalName.value = preset.name;
    el.evalChallenge.value = preset.category;
    el.evalNotes.value = `Caso de uso sugerido: ${preset.recommendedFor}\n\nDescripción: ${preset.description}`;
    el.evalDecision.value = 'selected';
    setStarRating(5);

    updateCodeSnippet();

    if (notify) {
      showToast(`Cargada plantilla: ${preset.name}`, 'info');
      // Smooth scroll to top of workspace
      document.querySelector('.workspace-panel').scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // =========================================================================
  // Project Evaluation & Dossier Management (Core User Requirement)
  // =========================================================================
  function setStarRating(val) {
    state.selectedStarRating = val;
    el.evalStars.querySelectorAll('.star-btn').forEach(btn => {
      const btnVal = parseInt(btn.dataset.value, 10);
      if (btnVal <= val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function saveEvaluation() {
    const rawUrl = el.requestUrlInput.value.trim();
    if (!rawUrl) {
      showToast('Introduce al menos una URL para poder guardar la documentación', 'error');
      return;
    }

    const name = el.evalName.value.trim() || rawUrl;
    const finalUrl = buildFinalUrl();

    const evaluationItem = {
      id: state.currentSavedId || `api_${Date.now()}`,
      name: name,
      rawUrl: rawUrl,
      finalUrl: finalUrl,
      params: JSON.parse(JSON.stringify(state.currentParams)),
      decision: el.evalDecision.value,
      rating: state.selectedStarRating,
      challenge: el.evalChallenge.value.trim(),
      keyData: el.evalKeyData.value.trim(),
      notes: el.evalNotes.value.trim(),
      risks: el.evalRisks.value.trim(),
      savedAt: new Date().toISOString()
    };

    // Check if updating existing
    const existingIndex = state.savedApis.findIndex(item => item.id === evaluationItem.id);
    if (existingIndex >= 0) {
      state.savedApis[existingIndex] = evaluationItem;
      showToast(`Actualizada API en el Dossier: "${name}"`, 'success');
    } else {
      state.savedApis.unshift(evaluationItem);
      state.currentSavedId = evaluationItem.id;
      showToast(`¡Guardada en el Dossier del Proyecto!`, 'success');
    }

    localStorage.setItem('nasa_api_dossier_saved', JSON.stringify(state.savedApis));
    updateMetrics();
    renderSavedList();

    // Switch to Saved tab to confirm
    switchSidebarTab('saved');
  }

  function renderSavedList() {
    el.savedContainer.innerHTML = '';
    const statusFilter = el.savedStatusFilter.value;
    const query = el.sidebarFilterInput.value.toLowerCase().trim();

    const filtered = state.savedApis.filter(item => {
      const matchStatus = statusFilter === 'all' || item.decision === statusFilter;
      const matchQuery = !query || 
        item.name.toLowerCase().includes(query) ||
        (item.challenge && item.challenge.toLowerCase().includes(query)) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        item.finalUrl.toLowerCase().includes(query);
      return matchStatus && matchQuery;
    });

    el.sidebarSavedCount.textContent = state.savedApis.length;

    if (filtered.length === 0) {
      el.savedContainer.innerHTML = `
        <div style="padding: 30px 14px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          ${state.savedApis.length === 0 
            ? 'Aún no has guardado APIs en tu dossier. Prueba una API y pulsa "Guardar en el Dossier".' 
            : 'No hay APIs que coincidan con los filtros actuales.'}
        </div>
      `;
      return;
    }

    const decisionLabels = {
      selected: { text: '⭐ Seleccionada', class: 'selected' },
      evaluating: { text: '🤔 Evaluando', class: 'evaluating' },
      backup: { text: '💡 Idea Plan B', class: 'backup' },
      discarded: { text: '❌ Descartada', class: 'discarded' }
    };

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'saved-card';
      const dec = decisionLabels[item.decision] || { text: item.decision, class: '' };

      const starsString = '★'.repeat(item.rating || 5) + '☆'.repeat(5 - (item.rating || 5));

      card.innerHTML = `
        <div class="saved-card-header">
          <span class="status-pill ${dec.class}">${dec.text}</span>
          <span style="color: #f59e0b; font-size: 0.75rem;">${starsString}</span>
        </div>
        <div class="saved-name">${escapeHtml(item.name)}</div>
        <div class="saved-notes-snip">${escapeHtml(item.notes || 'Sin notas adicionales')}</div>
        <div class="saved-actions-row">
          <span class="preset-endpoint-pill" title="${escapeHtml(item.finalUrl)}">${escapeHtml(item.rawUrl)}</span>
          <div style="display: flex; gap: 6px;">
            <button class="btn-ghost-sm btn-load-saved" data-id="${item.id}">Cargar</button>
            <button class="btn-ghost-sm btn-delete-saved" data-id="${item.id}" style="color: var(--rose-danger);">&times;</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-load-saved').addEventListener('click', (e) => {
        e.stopPropagation();
        loadSavedApi(item);
      });

      card.querySelector('.btn-delete-saved').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSavedApi(item.id);
      });

      card.addEventListener('click', () => loadSavedApi(item));

      el.savedContainer.appendChild(card);
    });
  }

  function loadSavedApi(item) {
    state.currentSavedId = item.id;
    el.requestUrlInput.value = item.rawUrl;
    state.currentParams = JSON.parse(JSON.stringify(item.params || []));
    renderParamsTable();

    el.evalName.value = item.name;
    el.evalDecision.value = item.decision || 'selected';
    setStarRating(item.rating || 5);
    el.evalChallenge.value = item.challenge || '';
    el.evalKeyData.value = item.keyData || '';
    el.evalNotes.value = item.notes || '';
    el.evalRisks.value = item.risks || '';

    updateCodeSnippet();
    showToast(`Cargada del dossier: "${item.name}"`, 'info');
    document.querySelector('.workspace-panel').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteSavedApi(id) {
    const item = state.savedApis.find(i => i.id === id);
    if (!confirm(`¿Eliminar "${item ? item.name : 'esta API'}" del dossier?`)) return;

    state.savedApis = state.savedApis.filter(i => i.id !== id);
    localStorage.setItem('nasa_api_dossier_saved', JSON.stringify(state.savedApis));
    if (state.currentSavedId === id) state.currentSavedId = null;

    updateMetrics();
    renderSavedList();
    showToast('API eliminada del dossier', 'info');
  }

  function updateMetrics() {
    const selected = state.savedApis.filter(i => i.decision === 'selected').length;
    const evaluating = state.savedApis.filter(i => i.decision === 'evaluating').length;
    const total = state.savedApis.length;

    el.cntSelected.textContent = selected;
    el.cntEvaluating.textContent = evaluating;
    el.cntTotal.textContent = total;
    el.sidebarSavedCount.textContent = total;
  }

  // =========================================================================
  // History Tracker
  // =========================================================================
  function addToHistory(item) {
    state.history.unshift(item);
    if (state.history.length > 25) state.history.pop();
    localStorage.setItem('nasa_api_dossier_history', JSON.stringify(state.history));
    renderHistoryList();
  }

  function renderHistoryList() {
    el.historyContainer.innerHTML = '';
    if (state.history.length === 0) {
      el.historyContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
          No hay consultas en el historial reciente.
        </div>
      `;
      return;
    }

    state.history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <span class="history-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</span>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: ${item.status >= 200 && item.status < 300 ? '#34d399' : '#f87171'}">${item.status}</span>
          <span style="font-size: 0.68rem; color: var(--text-subtle);">${item.timestamp}</span>
        </div>
      `;
      div.addEventListener('click', () => {
        el.requestUrlInput.value = item.url;
        state.currentParams = [];
        renderParamsTable();
        executeApiRequest();
      });
      el.historyContainer.appendChild(div);
    });
  }

  // =========================================================================
  // Navigation & Tabs
  // =========================================================================
  function switchSidebarTab(tabName) {
    state.activeSidebarTab = tabName;
    el.sidebarTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));

    document.getElementById('content-catalog').classList.toggle('active', tabName === 'catalog');
    document.getElementById('content-saved').classList.toggle('active', tabName === 'saved');
    document.getElementById('content-history').classList.toggle('active', tabName === 'history');
  }

  function switchResponseTab(tabName) {
    state.activeRespTab = tabName;
    el.respTabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));

    document.getElementById('view-json').classList.toggle('active', tabName === 'json');
    document.getElementById('view-media').classList.toggle('active', tabName === 'media');
    document.getElementById('view-schema').classList.toggle('active', tabName === 'schema');
    document.getElementById('view-code').classList.toggle('active', tabName === 'code');
  }

  // =========================================================================
  // Export Suite (Markdown, JSON, CSV)
  // =========================================================================
  function openExportModal() {
    el.modalExport.style.display = 'flex';
    const preview = generateMarkdownDossier();
    el.exportPreviewBox.textContent = preview;
  }

  function closeExportModal() {
    el.modalExport.style.display = 'none';
  }

  function generateMarkdownDossier() {
    const dateStr = new Date().toLocaleDateString();
    const selected = state.savedApis.filter(i => i.decision === 'selected');
    const evaluating = state.savedApis.filter(i => i.decision === 'evaluating');
    const backup = state.savedApis.filter(i => i.decision === 'backup');

    let md = `# 🚀 Dossier de APIs de la NASA - Proyecto Space Apps Challenge\n\n`;
    md += `*Generado automáticamente el ${dateStr}*\n\n`;
    md += `## 📊 Resumen Ejecutivo del Arsenal de APIs\n\n`;
    md += `| Métrica | Cantidad |\n`;
    md += `| :--- | :--- |\n`;
    md += `| ⭐ APIs Seleccionadas para la Solución | **${selected.length}** |\n`;
    md += `| 🤔 APIs en Evaluación | **${evaluating.length}** |\n`;
    md += `| 💡 Alternativas / Plan B | **${backup.length}** |\n`;
    md += `| 📁 Total de APIs Documentadas | **${state.savedApis.length}** |\n\n`;

    md += `---\n\n`;
    md += `## 🌟 APIs Seleccionadas para el Proyecto\n\n`;

    if (selected.length === 0) {
      md += `*No hay APIs marcadas como 'Seleccionadas para el proyecto' aún.*\n\n`;
    } else {
      selected.forEach((api, idx) => {
        md += `### ${idx + 1}. ${api.name}\n\n`;
        md += `- **Endpoint Base:** \`${api.rawUrl}\`\n`;
        md += `- **URL de Prueba / Completa:** [Consultar API](${api.finalUrl})\n`;
        md += `- **Reto / Categoría:** ${api.challenge || 'General Space Apps'}\n`;
        md += `- **Nivel de Utilidad:** ${'⭐'.repeat(api.rating || 5)} (${api.rating || 5}/5)\n\n`;

        md += `#### 💡 ¿Por qué nos servirá para el proyecto?\n`;
        md += `${api.notes || 'Documentación en proceso.'}\n\n`;

        if (api.keyData) {
          md += `#### 🔑 Datos clave que entrega:\n`;
          md += `\`${api.keyData}\`\n\n`;
        }

        if (api.risks) {
          md += `#### ⚠️ Consideraciones y Límites (Rate Limits):\n`;
          md += `${api.risks}\n\n`;
        }

        md += `---\n\n`;
      });
    }

    if (evaluating.length > 0) {
      md += `## 🤔 APIs en Evaluación / Candidatas\n\n`;
      evaluating.forEach(api => {
        md += `- **${api.name}** (\`${api.rawUrl}\`): ${api.notes || 'En revisión'}\n`;
      });
      md += `\n---\n\n`;
    }

    if (backup.length > 0) {
      md += `## 💡 Ideas Secundarias / Plan B\n\n`;
      backup.forEach(api => {
        md += `- **${api.name}**: ${api.notes || 'Guardada como respaldo'}\n`;
      });
      md += `\n---\n\n`;
    }

    md += `*Documento preparado por el equipo para el concurso NASA Space Apps Challenge.*`;
    return md;
  }

  function downloadMarkdownDossier() {
    const md = generateMarkdownDossier();
    downloadFile(md, 'NASA_APIs_Dossier_Proyecto.md', 'text/markdown');
    showToast('Dossier en Markdown descargado', 'success');
  }

  function downloadJsonCollection() {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      apis: state.savedApis
    };
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, 'nasa_apis_collection_backup.json', 'application/json');
    showToast('Colección JSON descargada', 'success');
  }

  function downloadCsvMatrix() {
    if (state.savedApis.length === 0) {
      showToast('No hay APIs guardadas para exportar a CSV', 'error');
      return;
    }

    const headers = ['Nombre', 'Estado', 'Viabilidad', 'Reto', 'Endpoint', 'Datos Clave', 'Notas', 'Limitaciones'];
    const rows = state.savedApis.map(item => [
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${item.decision}"`,
      item.rating || 5,
      `"${(item.challenge || '').replace(/"/g, '""')}"`,
      `"${(item.finalUrl || '').replace(/"/g, '""')}"`,
      `"${(item.keyData || '').replace(/"/g, '""')}"`,
      `"${(item.notes || '').replace(/"/g, '""')}"`,
      `"${(item.risks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csvContent, 'matriz_apis_nasa.csv', 'text/csv;charset=utf-8;');
    showToast('Matriz CSV descargada', 'success');
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      try {
        const parsed = JSON.parse(evt.target.result);
        const importedList = Array.isArray(parsed) ? parsed : (parsed.apis || []);
        
        if (!Array.isArray(importedList)) {
          throw new Error('Formato no reconocido');
        }

        // Merge avoiding duplicates by ID or rawUrl
        let addedCount = 0;
        importedList.forEach(imported => {
          const exists = state.savedApis.some(s => s.id === imported.id || s.rawUrl === imported.rawUrl);
          if (!exists) {
            state.savedApis.push(imported);
            addedCount++;
          }
        });

        localStorage.setItem('nasa_api_dossier_saved', JSON.stringify(state.savedApis));
        updateMetrics();
        renderSavedList();
        el.modalImport.style.display = 'none';
        showToast(`Importadas ${addedCount} APIs con éxito`, 'success');
      } catch (err) {
        showToast('Error al leer el archivo JSON: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // Utilities
  // =========================================================================
  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg, 'success');
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast(successMsg, 'success');
    }
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
