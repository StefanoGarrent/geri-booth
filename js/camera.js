/* ============================================
   geri.booth - Camera Management
   ============================================ */

const CameraManager = (() => {
  let stream = null;
  let currentDeviceId = null;
  let devices = [];
  let isMirrored = true;

  const video = document.getElementById('camera-video');
  const noCamMsg = document.getElementById('no-camera-msg');

  async function init() {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showNoCameraError({ name: 'NotSupportedError' });
      return;
    }

    try {
      // Try to enumerate devices first (may be empty without permission yet)
      await refreshDevices();

      const frontCamera = devices.find(d =>
        d.label.toLowerCase().includes('front') ||
        d.label.toLowerCase().includes('depan') ||
        d.label.toLowerCase().includes('user')
      );
      const deviceId = frontCamera ? frontCamera.deviceId : (devices[0] ? devices[0].deviceId : undefined);

      await startStream(deviceId);
    } catch (err) {
      console.error('Camera init error:', err);
      showNoCameraError(err);
    }
  }

  async function refreshDevices() {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      devices = allDevices.filter(d => d.kind === 'videoinput');
    } catch (e) {
      devices = [];
    }
    return devices;
  }

  async function startStream(deviceId) {
    stopStream();

    // Try 3 levels of constraints — from ideal to bare minimum
    const constraintOptions = [
      // Level 1: Full HD preferred
      {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: deviceId ? undefined : 'user'
        },
        audio: false
      },
      // Level 2: Any video, prefer front camera
      {
        video: { facingMode: 'user' },
        audio: false
      },
      // Level 3: Just any video input
      {
        video: true,
        audio: false
      }
    ];

    let lastErr = null;
    for (const constraints of constraintOptions) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentDeviceId = deviceId;
        video.srcObject = stream;
        await video.play();

        if (noCamMsg) noCamMsg.style.display = 'none';
        video.style.display = 'block';

        // Re-enumerate to get device labels
        await refreshDevices();
        return; // Success — stop trying
      } catch (err) {
        lastErr = err;
        console.warn('Camera constraint failed, trying fallback:', err.name, constraints);

        // Don't retry on permission denied — user explicitly blocked it
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          throw err;
        }
      }
    }

    // All levels failed
    throw lastErr;
  }

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  async function switchCamera() {
    if (devices.length < 2) {
      showToast('Hanya ada 1 kamera yang tersedia', 'error');
      return;
    }
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    await startStream(devices[nextIndex].deviceId);
    showToast(`Kamera: ${devices[nextIndex].label || 'Kamera ' + (nextIndex + 1)}`);
  }

  function toggleMirror() {
    isMirrored = !isMirrored;
    video.classList.toggle('mirrored', isMirrored);
    return isMirrored;
  }

  function captureFrame(filterCss = 'none') {
    const canvas = document.getElementById('capture-canvas');
    const ctx = canvas.getContext('2d');

    const vw = video.videoWidth || 640;
    const vh = video.videoHeight || 480;
    canvas.width = vw;
    canvas.height = vh;

    ctx.save();
    if (isMirrored) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = filterCss || 'none';
    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function showNoCameraError(err) {
    if (noCamMsg) noCamMsg.style.display = 'flex';
    video.style.display = 'none';

    const messages = {
      NotAllowedError:     '🔒 Akses kamera ditolak. Klik ikon kunci/kamera di address bar browser, lalu pilih "Izinkan", kemudian refresh halaman.',
      PermissionDeniedError: '🔒 Akses kamera ditolak. Izinkan akses kamera di pengaturan browser, lalu refresh halaman.',
      NotFoundError:       '📵 Tidak ada kamera yang ditemukan di perangkat ini.',
      NotReadableError:    '⚠️ Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain, lalu coba lagi.',
      OverconstrainedError:'⚙️ Kamera tidak mendukung resolusi yang diminta. Coba lagi.',
      NotSupportedError:   '❌ Browser kamu tidak mendukung akses kamera. Gunakan Chrome, Edge, atau Firefox terbaru.',
      SecurityError:       '🔐 Akses kamera diblokir oleh pengaturan keamanan. Pastikan website dibuka via HTTPS.',
    };

    const msg = messages[err.name] || `❌ Gagal mengakses kamera: ${err.message || err.name}`;
    const errorEl = noCamMsg.querySelector('.camera-error p');
    if (errorEl) errorEl.textContent = msg;
  }

  return {
    init,
    switchCamera,
    toggleMirror,
    captureFrame,
    stopStream,
    getVideoElement: () => video,
    getStream: () => stream,
    getDevices: () => devices,
    getMirrored: () => isMirrored
  };
})();

window.CameraManager = CameraManager;
