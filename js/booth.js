/* ============================================
   geri.booth - Main Booth Controller
   ============================================ */

(function() {
  'use strict';

  // ---- State ----
  let state = {
    currentTheme: THEMES[0],
    currentLayout: LAYOUTS[1], // strip4 default
    currentFilter: FILTERS[0],
    currentFrame: FRAMES[0],
    shots: [],          // Array of {dataUrl, timestamp}
    isCountingDown: false,
    timerMode: false,   // 3s countdown before shot
    stripGenerated: false
  };

  // ---- DOM References ----
  const el = {
    themeGrid: document.getElementById('theme-grid'),
    layoutGrid: document.getElementById('layout-grid'),
    filterGrid: document.getElementById('filter-grid'),
    frameGrid: document.getElementById('frame-grid'),
    btnShutter: document.getElementById('btn-shutter'),
    btnMirror: document.getElementById('btn-mirror'),
    btnSwitchCam: document.getElementById('btn-switch-cam'),
    btnTimer: document.getElementById('btn-timer'),
    btnMakeStrip: document.getElementById('btn-make-strip'),
    btnGenerate: document.getElementById('btn-generate'),
    btnDownload: document.getElementById('btn-download'),
    btnRetakeAll: document.getElementById('btn-retake-all'),
    btnClearShots: document.getElementById('btn-clear-shots'),
    btnRetryCam: document.getElementById('btn-retry-cam'),
    btnHelp: document.getElementById('btn-help'),
    btnFullscreen: document.getElementById('btn-fullscreen'),
    countdownOverlay: document.getElementById('countdown-overlay'),
    countdownNumber: document.getElementById('countdown-number'),
    flashOverlay: document.getElementById('flash-overlay'),
    shotsGrid: document.getElementById('shots-grid'),
    shotsTaken: document.getElementById('shots-taken'),
    shotsNeeded: document.getElementById('shots-needed'),
    shotCountDisplay: document.getElementById('shot-count-display'),
    stripCanvasWrap: document.getElementById('strip-canvas-wrap'),
    cameraVideo: document.getElementById('camera-video'),
    toast: document.getElementById('toast'),
    boothBody: document.getElementById('booth-body'),
    boothMain: document.getElementById('booth-main')
  };

  // ---- Init ----
  function init() {
    renderThemes();
    renderLayouts();
    renderFilters();
    renderFrames();
    renderShotsGrid();
    updateShotCounters();

    // Set initial active states
    activateTheme(state.currentTheme);
    activateLayout(state.currentLayout);

    // Start camera
    CameraManager.init().catch(err => console.error(err));

    // Bind events
    bindEvents();
  }

  // ---- Render Selectors ----

  function renderThemes() {
    el.themeGrid.innerHTML = '';
    THEMES.forEach(theme => {
      const btn = document.createElement('button');
      btn.className = 'theme-btn' + (theme.id === state.currentTheme.id ? ' active' : '');
      btn.setAttribute('data-theme-id', theme.id);
      btn.title = `${theme.name} — ${theme.description}`;
      btn.style.background = theme.bg;
      btn.innerHTML = `
        <div class="theme-btn-inner">
          <span class="theme-emoji">${theme.emoji}</span>
          <span class="theme-name">${theme.name}</span>
        </div>
      `;
      btn.addEventListener('click', () => {
        state.currentTheme = theme;
        state.stripGenerated = false;
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activateTheme(theme);
      });
      el.themeGrid.appendChild(btn);
    });
  }

  function renderLayouts() {
    el.layoutGrid.innerHTML = '';
    LAYOUTS.forEach(layout => {
      const btn = document.createElement('button');
      btn.className = 'layout-btn' + (layout.id === state.currentLayout.id ? ' active' : '');
      btn.setAttribute('data-layout-id', layout.id);
      btn.title = layout.name;

      // Layout preview visual
      let previewHtml = '';
      if (layout.id === 'grid2x2') {
        previewHtml = '<div class="layout-preview grid-2x2">' + '<div class="layout-cell"></div>'.repeat(4) + '</div>';
      } else if (layout.id === 'wide2') {
        previewHtml = '<div class="layout-preview" style="flex-direction:row;">' + '<div class="layout-cell"></div>'.repeat(2) + '</div>';
      } else {
        const count = layout.photoCount;
        previewHtml = '<div class="layout-preview">' + '<div class="layout-cell"></div>'.repeat(count) + '</div>';
      }

      btn.innerHTML = previewHtml + `<span class="layout-name">${layout.name}</span>`;
      btn.addEventListener('click', () => {
        state.currentLayout = layout;
        state.shots = [];
        state.stripGenerated = false;
        document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderShotsGrid();
        updateShotCounters();
        hideStripPreview();
        updateButtons();
      });
      el.layoutGrid.appendChild(btn);
    });
  }

  function renderFilters() {
    el.filterGrid.innerHTML = '';
    FILTERS.forEach(filter => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (filter.id === state.currentFilter.id ? ' active' : '');
      btn.title = filter.name;
      btn.innerHTML = `<span>${filter.emoji}</span><br>${filter.name}`;
      btn.addEventListener('click', () => {
        state.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Apply filter to live video
        el.cameraVideo.style.filter = filter.css;
      });
      el.filterGrid.appendChild(btn);
    });
  }

  function renderFrames() {
    el.frameGrid.innerHTML = '';
    FRAMES.forEach(frame => {
      const btn = document.createElement('button');
      btn.className = 'frame-btn' + (frame.id === state.currentFrame.id ? ' active' : '');
      btn.title = frame.name;
      btn.setAttribute('data-frame-id', frame.id);

      if (frame.type === 'image' && frame.src) {
        btn.innerHTML = `<img src="${frame.src}" alt="${frame.name}" loading="lazy"><span class="frame-btn-name">${frame.name}</span>`;
      } else {
        btn.innerHTML = `<span class="frame-btn-icon">${frame.emoji}</span><span class="frame-btn-name">${frame.name}</span>`;
      }

      btn.addEventListener('click', () => {
        state.currentFrame = frame;
        state.stripGenerated = false;
        document.querySelectorAll('.frame-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateButtons();
      });
      el.frameGrid.appendChild(btn);
    });
  }

  function renderShotsGrid() {
    el.shotsGrid.innerHTML = '';
    const needed = state.currentLayout.photoCount;
    
    for (let i = 0; i < needed; i++) {
      const shot = state.shots[i];
      const cell = document.createElement('div');

      if (shot) {
        cell.className = 'shot-item';
        cell.innerHTML = `
          <img src="${shot.dataUrl}" alt="Foto ${i + 1}">
          <button class="shot-delete" data-index="${i}" title="Hapus">✕</button>
        `;
        cell.querySelector('.shot-delete').addEventListener('click', e => {
          e.stopPropagation();
          deleteShot(i);
        });
      } else {
        cell.className = 'shot-placeholder';
        cell.innerHTML = `<span>+</span>`;
      }

      el.shotsGrid.appendChild(cell);
    }
  }

  // ---- Theme Application ----
  function activateTheme(theme) {
    // Apply theme background to body / panels
    document.body.style.setProperty('--theme-accent', theme.accent);
    document.body.style.setProperty('--theme-bg', theme.stripBg);

    // Update topbar accent
    const logoText = document.querySelector('.logo-dot');
    if (logoText) {
      logoText.style.backgroundImage = `linear-gradient(135deg, ${theme.accent}, ${theme.borderColor})`;
      logoText.style.webkitBackgroundClip = 'text';
      logoText.style.webkitTextFillColor = 'transparent';
    }

    // Update shutter button
    if (el.btnShutter) {
      el.btnShutter.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.borderColor})`;
      el.btnShutter.style.boxShadow = `0 0 0 6px ${theme.accent}25, 0 8px 30px ${theme.accent}55`;
    }

    // Update camera corner colors
    document.querySelectorAll('.camera-corner').forEach(c => {
      c.style.borderColor = theme.accent + 'aa';
    });
  }

  // ---- Shot Management ----

  async function takeShot() {
    if (state.isCountingDown) return;

    const needed = state.currentLayout.photoCount;
    if (state.shots.length >= needed) {
      showToast('Sudah cukup! Buat strip atau hapus foto dulu 🎞', 'error');
      return;
    }

    if (state.timerMode) {
      await runCountdown(3);
    }

    doCapture();
  }

  async function runCountdown(seconds) {
    state.isCountingDown = true;
    el.countdownOverlay.classList.add('visible');

    return new Promise(resolve => {
      let count = seconds;
      
      const tick = () => {
        if (count <= 0) {
          el.countdownOverlay.classList.remove('visible');
          state.isCountingDown = false;
          resolve();
          return;
        }
        el.countdownNumber.textContent = count;
        el.countdownNumber.style.animation = 'none';
        // Force reflow
        el.countdownNumber.offsetHeight;
        el.countdownNumber.style.animation = 'countdownPop 1s ease';
        count--;
        setTimeout(tick, 1000);
      };

      tick();
    });
  }

  function doCapture() {
    // Flash effect
    el.flashOverlay.classList.add('flash');
    setTimeout(() => el.flashOverlay.classList.remove('flash'), 150);

    // Shutter animation
    el.btnShutter.classList.add('shooting');
    setTimeout(() => el.btnShutter.classList.remove('shooting'), 300);

    // Capture
    const dataUrl = CameraManager.captureFrame(state.currentFilter.css);
    
    state.shots.push({
      dataUrl,
      timestamp: Date.now()
    });

    renderShotsGrid();
    updateShotCounters();
    updateButtons();

    const needed = state.currentLayout.photoCount;
    if (state.shots.length >= needed) {
      showToast(`${needed} foto berhasil diambil! ✨ Klik Buat Strip`, 'success');
    } else {
      showToast(`Foto ${state.shots.length}/${needed} ✓`);
    }
  }

  function deleteShot(index) {
    state.shots.splice(index, 1);
    state.stripGenerated = false;
    renderShotsGrid();
    updateShotCounters();
    updateButtons();
    hideStripPreview();
  }

  function clearAllShots() {
    state.shots = [];
    state.stripGenerated = false;
    renderShotsGrid();
    updateShotCounters();
    updateButtons();
    hideStripPreview();
    showToast('Semua foto dihapus 🗑');
  }

  // ---- Strip Generation & Download ----

  async function generateStrip() {
    if (state.shots.length === 0) {
      showToast('Ambil foto dulu! 📷', 'error');
      return;
    }

    el.btnGenerate.disabled = true;
    el.btnGenerate.textContent = '⏳ Membuat...';

    try {
      const photoUrls = state.shots.map(s => s.dataUrl);
      // Pad with nulls if less than needed
      while (photoUrls.length < state.currentLayout.photoCount) {
        photoUrls.push(null);
      }

      await StripGenerator.generate(
        photoUrls,
        state.currentLayout,
        state.currentTheme,
        state.currentFrame
      );

      state.stripGenerated = true;
      el.stripCanvasWrap.style.display = 'flex';
      el.btnDownload.disabled = false;
      showToast('Strip foto siap! Klik Download 💾', 'success');

    } catch (err) {
      console.error('Strip generation error:', err);
      showToast('Gagal membuat strip. Coba lagi.', 'error');
    } finally {
      el.btnGenerate.disabled = false;
      el.btnGenerate.textContent = '🎞 Buat Strip Foto';
    }
  }

  function downloadStrip() {
    const canvas = document.getElementById('strip-canvas');
    const now = new Date();
    const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const filename = `geribooth_${state.currentTheme.id}_${ts}.png`;
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();

    showToast('Foto berhasil didownload! 🎉', 'success');
  }

  // ---- UI Helpers ----

  function updateShotCounters() {
    const count = state.shots.length;
    const needed = state.currentLayout.photoCount;
    if (el.shotsTaken) el.shotsTaken.textContent = count;
    if (el.shotsNeeded) el.shotsNeeded.textContent = needed;
    if (el.shotCountDisplay) el.shotCountDisplay.textContent = count;
  }

  function updateButtons() {
    const hasShots = state.shots.length > 0;
    if (el.btnGenerate) el.btnGenerate.disabled = !hasShots;
    if (el.btnDownload) el.btnDownload.disabled = !state.stripGenerated;
  }

  function hideStripPreview() {
    if (el.stripCanvasWrap) el.stripCanvasWrap.style.display = 'none';
    if (el.btnDownload) el.btnDownload.disabled = true;
  }

  // ---- Events ----
  function bindEvents() {
    if (el.btnShutter) el.btnShutter.addEventListener('click', takeShot);
    
    if (el.btnMirror) el.btnMirror.addEventListener('click', () => {
      const mirrored = CameraManager.toggleMirror();
      el.btnMirror.classList.toggle('active', mirrored);
      showToast(mirrored ? 'Mirror: Aktif 🔄' : 'Mirror: Nonaktif');
    });

    if (el.btnSwitchCam) el.btnSwitchCam.addEventListener('click', () => {
      CameraManager.switchCamera();
    });

    if (el.btnTimer) el.btnTimer.addEventListener('click', () => {
      state.timerMode = !state.timerMode;
      el.btnTimer.classList.toggle('active', state.timerMode);
      showToast(state.timerMode ? '⏱ Timer 3 detik aktif' : '⏱ Timer nonaktif');
    });

    if (el.btnMakeStrip) el.btnMakeStrip.addEventListener('click', generateStrip);
    if (el.btnGenerate) el.btnGenerate.addEventListener('click', generateStrip);
    if (el.btnDownload) el.btnDownload.addEventListener('click', downloadStrip);

    if (el.btnRetakeAll) el.btnRetakeAll.addEventListener('click', clearAllShots);
    if (el.btnClearShots) el.btnClearShots.addEventListener('click', clearAllShots);

    if (el.btnRetryCam) el.btnRetryCam.addEventListener('click', () => CameraManager.init());

    if (el.btnFullscreen) el.btnFullscreen.addEventListener('click', toggleFullscreen);

    if (el.btnHelp) el.btnHelp.addEventListener('click', showHelp);

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); takeShot(); }
      if (e.code === 'KeyG') generateStrip();
      if (e.code === 'KeyD' && state.stripGenerated) downloadStrip();
      if (e.code === 'KeyM') CameraManager.toggleMirror();
      if (e.code === 'KeyT') el.btnTimer.click();
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
      el.btnFullscreen.textContent = '⊡';
    } else {
      document.exitFullscreen();
      el.btnFullscreen.textContent = '⛶';
    }
  }

  function showHelp() {
    showToast('Spasi=Foto · G=Generate · D=Download · M=Mirror · T=Timer ⌨️', 'success');
  }

  // ---- Toast ----
  window.showToast = function(message, type = '') {
    const toast = el.toast;
    toast.textContent = message;
    toast.className = 'toast visible' + (type ? ` ${type}` : '');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  };

  // ---- Start ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
