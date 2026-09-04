(() => {
  'use strict';

  const allowedFontPattern = /\.(ttf|otf|woff2?|woff)$/i;

  const hostedFonts = (Array.isArray(window.FONT_FILES) ? window.FONT_FILES : [])
    .map((item, index) => normalizeHostedFont(item, index))
    .filter(Boolean);

  let fonts = hostedFonts.slice();
  let sourceMode = 'hosted';
  let sourceGeneration = 0;

  const els = {
    grid: document.getElementById('fontGrid'),
    count: document.getElementById('fontCount'),
    sampleText: document.getElementById('sampleText'),
    search: document.getElementById('searchInput'),
    columnButtons: document.getElementById('columnButtons'),
    fontSize: document.getElementById('fontSize'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    cardHeight: document.getElementById('cardHeight'),
    cardHeightValue: document.getElementById('cardHeightValue'),
    showNames: document.getElementById('showNames'),
    presentation: document.getElementById('presentationButton'),
    exitPresentation: document.getElementById('exitPresentation'),
    fullscreen: document.getElementById('fullscreenButton'),
    theme: document.getElementById('themeButton'),
    openLocal: document.getElementById('openLocalButton'),
    localFolder: document.getElementById('localFolderInput'),
    useHosted: document.getElementById('useHostedButton'),
    sourceLabel: document.getElementById('sourceLabel'),
    empty: document.getElementById('emptyState'),
    emptyMessage: document.getElementById('emptyMessage'),
    error: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage')
  };

  const state = {
    columns: clampNumber(readSetting('columns', 6), 1, 8),
    fontSize: clampNumber(readSetting('fontSize', 24), 14, 72),
    cardHeight: clampNumber(readSetting('cardHeight', 120), 80, 260),
    showNames: readSetting('showNames', 'true') !== 'false',
    theme: readSetting('theme', 'light'),
    loaded: new Set(),
    failed: new Set(),
    faces: new Map(),
    observer: null
  };

  function normalizeHostedFont(item, index) {
    if (typeof item === 'string') {
      return {
        file: item,
        name: stripExtension(item.split('/').pop() || item),
        index,
        source: 'hosted'
      };
    }

    const file = item && item.file ? String(item.file) : '';
    if (!file) return null;

    const name = item && item.name
      ? String(item.name)
      : stripExtension(file.split('/').pop() || file);

    return { file, name, index, source: 'hosted' };
  }

  function normalizeLocalFonts(fileList) {
    return Array.from(fileList)
      .filter(file => allowedFontPattern.test(file.name))
      .sort((a, b) => {
        const aPath = a.webkitRelativePath || a.name;
        const bPath = b.webkitRelativePath || b.name;
        return aPath.localeCompare(bPath, undefined, { numeric: true, sensitivity: 'base' });
      })
      .map((file, index) => ({
        file,
        path: file.webkitRelativePath || file.name,
        name: stripExtension(file.name),
        index,
        source: 'local'
      }));
  }

  function stripExtension(value) {
    return String(value).replace(allowedFontPattern, '');
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
  }

  function readSetting(key, fallback) {
    try {
      return localStorage.getItem(`fontPreviewer.${key}`) ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function saveSetting(key, value) {
    try {
      localStorage.setItem(`fontPreviewer.${key}`, String(value));
    } catch (_) {
      // Storage may be unavailable in privacy modes. The app still works.
    }
  }

  function encodeHostedFontPath(path) {
    return 'fonts/' + path
      .replace(/\\/g, '/')
      .split('/')
      .map(segment => encodeURIComponent(segment))
      .join('/');
  }

  function familyName(index) {
    return `PreviewFont_${sourceGeneration}_${index}`;
  }

  function resetLoadedFonts() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    state.faces.forEach(face => {
      try {
        document.fonts.delete(face);
      } catch (_) {
        // Ignore browsers that refuse deleting a face during cleanup.
      }
    });

    state.faces.clear();
    state.loaded.clear();
    state.failed.clear();
    sourceGeneration += 1;
    showLoadErrors();
  }

  function applySettings() {
    document.documentElement.dataset.theme = state.theme;
    document.documentElement.style.setProperty('--preview-size', `${state.fontSize}px`);
    document.documentElement.style.setProperty('--card-height', `${state.cardHeight}px`);
    els.grid.style.setProperty('--columns', state.columns);

    els.fontSize.value = state.fontSize;
    els.fontSizeValue.textContent = state.fontSize;
    els.cardHeight.value = state.cardHeight;
    els.cardHeightValue.textContent = state.cardHeight;
    els.showNames.checked = state.showNames;
    document.body.classList.toggle('hide-names', !state.showNames);

    els.columnButtons.querySelectorAll('[data-columns]').forEach(button => {
      button.classList.toggle('is-active', Number(button.dataset.columns) === state.columns);
    });
  }

  function createCard(font) {
    const card = document.createElement('article');
    card.className = 'font-card';
    card.dataset.fontIndex = font.index;
    card.dataset.search = `${font.name} ${font.path || font.file || ''}`.toLowerCase();

    const name = document.createElement('div');
    name.className = 'font-name';
    name.textContent = font.name;
    name.title = font.path || font.name;

    const preview = document.createElement('div');
    preview.className = 'font-preview';
    preview.textContent = els.sampleText.value || 'Beautiful Fonts';

    card.append(name, preview);
    return card;
  }

  function render() {
    els.grid.replaceChildren();
    els.search.value = '';

    updateSourceUi();

    if (!fonts.length) {
      els.empty.hidden = false;
      els.count.textContent = '0 fonts';
      els.emptyMessage.textContent = sourceMode === 'local'
        ? 'No supported font files were found in that folder.'
        : 'No bundled fonts are available. Click Open Local Folder to preview fonts directly from your computer.';
      return;
    }

    els.empty.hidden = true;
    const fragment = document.createDocumentFragment();
    fonts.forEach(font => fragment.appendChild(createCard(font)));
    els.grid.appendChild(fragment);

    setupLazyLoading();
    updateCount();
  }

  function updateSourceUi() {
    const local = sourceMode === 'local';
    els.sourceLabel.textContent = local ? 'Local folder' : 'Bundled fonts';
    els.useHosted.hidden = !local;
  }

  function setupLazyLoading() {
    if (state.observer) state.observer.disconnect();

    state.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        state.observer.unobserve(entry.target);
        const index = Number(entry.target.dataset.fontIndex);
        loadFont(index, entry.target);
      });
    }, {
      root: null,
      rootMargin: '1200px 0px',
      threshold: 0.01
    });

    els.grid.querySelectorAll('.font-card').forEach(card => state.observer.observe(card));
  }

  async function loadFont(index, card) {
    const font = fonts[index];
    if (!font || state.failed.has(index)) return;

    const preview = card.querySelector('.font-preview');
    const family = familyName(index);

    if (state.loaded.has(index)) {
      preview.style.fontFamily = `"${family}"`;
      return;
    }

    try {
      let face;

      if (font.source === 'local') {
        const buffer = await font.file.arrayBuffer();
        face = new FontFace(family, buffer);
      } else {
        face = new FontFace(family, `url("${encodeHostedFontPath(font.file)}")`);
      }

      const loadedFace = await face.load();
      document.fonts.add(loadedFace);
      state.faces.set(index, loadedFace);
      state.loaded.add(index);
      preview.style.fontFamily = `"${family}"`;
    } catch (error) {
      state.failed.add(index);
      card.classList.add('font-card--failed');
      card.title = `Could not load ${font.path || font.file || font.name}`;
      showLoadErrors();
      console.warn('Font load failed:', font.path || font.file || font.name, error);
    }
  }

  function showLoadErrors() {
    if (!state.failed.size) {
      els.error.hidden = true;
      return;
    }

    els.error.hidden = false;
    els.errorMessage.textContent = `${state.failed.size} font file${state.failed.size === 1 ? '' : 's'} could not be loaded.`;
  }

  function openLocalFolder() {
    els.localFolder.value = '';
    els.localFolder.click();
  }

  function useLocalFiles(fileList) {
    const selectedFonts = normalizeLocalFonts(fileList);
    resetLoadedFonts();
    sourceMode = 'local';
    fonts = selectedFonts;
    render();
  }

  function useHostedFonts() {
    resetLoadedFonts();
    sourceMode = 'hosted';
    fonts = hostedFonts.slice();
    render();
  }

  function updatePreviewText() {
    const value = els.sampleText.value || ' ';
    els.grid.querySelectorAll('.font-preview').forEach(preview => {
      preview.textContent = value;
    });
  }

  function filterFonts() {
    const query = els.search.value.trim().toLowerCase();
    let visible = 0;

    els.grid.querySelectorAll('.font-card').forEach(card => {
      const match = !query || card.dataset.search.includes(query);
      card.hidden = !match;
      if (match) visible += 1;
    });

    updateCount(visible);
  }

  function updateCount(visible = null) {
    const total = fonts.length;
    const shown = visible ?? total;
    els.count.textContent = shown === total ? `${total} fonts` : `${shown} of ${total}`;
  }

  function setColumns(columns) {
    state.columns = clampNumber(columns, 1, 8);
    els.grid.style.setProperty('--columns', state.columns);
    saveSetting('columns', state.columns);

    els.columnButtons.querySelectorAll('[data-columns]').forEach(button => {
      button.classList.toggle('is-active', Number(button.dataset.columns) === state.columns);
    });

    const suggested = state.columns >= 7 ? 18 : state.columns >= 5 ? 22 : state.columns >= 3 ? 28 : 38;
    setFontSize(suggested);
  }

  function setFontSize(size) {
    state.fontSize = clampNumber(size, 14, 72);
    document.documentElement.style.setProperty('--preview-size', `${state.fontSize}px`);
    els.fontSize.value = state.fontSize;
    els.fontSizeValue.textContent = state.fontSize;
    saveSetting('fontSize', state.fontSize);
  }

  function setCardHeight(height) {
    state.cardHeight = clampNumber(height, 80, 260);
    document.documentElement.style.setProperty('--card-height', `${state.cardHeight}px`);
    els.cardHeightValue.textContent = state.cardHeight;
    saveSetting('cardHeight', state.cardHeight);
  }

  function togglePresentation(force) {
    const next = typeof force === 'boolean'
      ? force
      : !document.body.classList.contains('presentation');

    document.body.classList.toggle('presentation', next);
    els.exitPresentation.hidden = !next;
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen unavailable:', error);
    }
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = state.theme;
    saveSetting('theme', state.theme);
  }

  els.sampleText.addEventListener('input', updatePreviewText);
  els.search.addEventListener('input', filterFonts);

  els.columnButtons.addEventListener('click', event => {
    const button = event.target.closest('[data-columns]');
    if (button) setColumns(button.dataset.columns);
  });

  els.fontSize.addEventListener('input', event => setFontSize(event.target.value));
  els.cardHeight.addEventListener('input', event => setCardHeight(event.target.value));

  els.showNames.addEventListener('change', event => {
    state.showNames = event.target.checked;
    document.body.classList.toggle('hide-names', !state.showNames);
    saveSetting('showNames', state.showNames);
  });

  els.openLocal.addEventListener('click', openLocalFolder);
  els.localFolder.addEventListener('change', event => useLocalFiles(event.target.files));
  els.useHosted.addEventListener('click', useHostedFonts);
  els.presentation.addEventListener('click', () => togglePresentation());
  els.exitPresentation.addEventListener('click', () => togglePresentation(false));
  els.fullscreen.addEventListener('click', toggleFullscreen);
  els.theme.addEventListener('click', toggleTheme);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('presentation')) {
      togglePresentation(false);
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      els.search.focus();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    els.fullscreen.textContent = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  });

  applySettings();
  render();
})();
