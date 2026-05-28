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
  
  // Custom states selectors
  const btnStartCamPrompt = document.getElementById('btn-start-camera-prompt');
  const stateRequest = document.getElementById('cam-state-request');
  const stateError = document.getElementById('cam-state-error');
  const errMessage = document.getElementById('camera-error-message');

  async function init() {
    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showNoCameraError({ name: 'NotSupportedError' });
      return;
    }

    // Bind local UI buttons
    if (btnStartCamPrompt) {
      btnStartCamPrompt.addEventListener('click', async () => {
        const originalText = btnStartCamPrompt.innerHTML;
        btnStartCamPrompt.disabled = true;
        btnStartCamPrompt.innerHTML = '<span>⏳</span> Menghubungkan Kamera...';
        
        try {
          await runCameraSetup();
        } catch (err) {
          // Restore button
          btnStartCamPrompt.disabled = false;
          btnStartCamPrompt.innerHTML = originalText;
        }
      });
    }

    // Check permission state first if supported
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        
        if (permissionStatus.state === 'granted') {
          // Already allowed, start camera immediately
          await runCameraSetup();
          return;
        } else if (permissionStatus.state === 'denied') {
          // Explicitly blocked, show guide
          showNoCameraError({ name: 'NotAllowedError' });
          return;
        } else {
          // Prompt (undecided), show request screen
          showRequestState();
          return;
        }
      }
    } catch (e) {
      console.warn('Permissions query API not supported, attempting auto-setup:', e);
    }

    // Fallback: If query fails or isn't supported, we try to run camera setup automatically.
    // If it fails, showRequestState() is a great fallback so it doesn't just error out.
    try {
      await runCameraSetup();
    } catch (err) {
      // If direct request fails on load, show request screen instead of error screen
      showRequestState();
    }
  }

  async function runCameraSetup() {
    try {
      await refreshDevices();

      const frontCamera = devices.find(d =>
        d.label.toLowerCase().includes('front') ||
        d.label.toLowerCase().includes('depan') ||
        d.label.toLowerCase().includes('user')
      );
      const deviceId = frontCamera ? frontCamera.deviceId : (devices[0] ? devices[0].deviceId : undefined);

      await startStream(deviceId);
    } catch (err) {
      console.error('runCameraSetup failed:', err);
      showNoCameraError(err);
      throw err;
    }
  }

  function showRequestState() {
    if (noCamMsg) noCamMsg.style.display = 'flex';
    if (stateRequest) stateRequest.style.display = 'block';
    if (stateError) stateError.style.display = 'none';
    video.style.display = 'none';
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
    if (stateRequest) stateRequest.style.display = 'none';
    if (stateError) stateError.style.display = 'block';
    video.style.display = 'none';

    const messages = {
      NotAllowedError:     '🔒 Akses kamera ditolak. Browser kamu memblokir izin kamera untuk geri.booth.',
      PermissionDeniedError: '🔒 Akses kamera ditolak. Browser kamu memblokir izin kamera untuk geri.booth.',
      NotFoundError:       '📵 Tidak ada perangkat kamera yang terdeteksi di komputer atau HP kamu.',
      NotReadableError:    '⚠️ Kamera sedang digunakan oleh aplikasi lain (seperti Zoom, Google Meet, Teams, WhatsApp). Tutup aplikasi tersebut lalu klik tombol di bawah.',
      OverconstrainedError:'⚙️ Kamera tidak mendukung spesifikasi resolusi video geri.booth.',
      NotSupportedError:   '❌ Browser kamu tidak mendukung perekaman kamera. Gunakan Chrome, Edge, atau Firefox versi terbaru.',
      SecurityError:       '🔐 Akses kamera diblokir oleh pengaturan keamanan browser. geri.booth harus dibuka dengan koneksi aman (HTTPS).',
    };

    const msg = messages[err.name] || `❌ Gagal membuka kamera: ${err.message || err.name}`;
    if (errMessage) {
      errMessage.textContent = msg;
    }
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
