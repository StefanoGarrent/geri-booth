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
    try {
      // First, enumerate devices
      await refreshDevices();

      // Start with front camera if available
      const frontCamera = devices.find(d => d.label.toLowerCase().includes('front') || d.label.toLowerCase().includes('depan'));
      const deviceId = frontCamera ? frontCamera.deviceId : (devices[0] ? devices[0].deviceId : undefined);

      await startStream(deviceId);
    } catch (err) {
      console.error('Camera init error:', err);
      showNoCameraError(err);
    }
  }

  async function refreshDevices() {
    const allDevices = await navigator.mediaDevices.enumerateDevices();
    devices = allDevices.filter(d => d.kind === 'videoinput');
    return devices;
  }

  async function startStream(deviceId) {
    // Stop existing stream
    stopStream();

    const constraints = {
      video: {
        deviceId: deviceId ? { exact: deviceId } : undefined,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: deviceId ? undefined : 'user'
      },
      audio: false
    };

    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      currentDeviceId = deviceId;
      video.srcObject = stream;
      await video.play();
      
      if (noCamMsg) noCamMsg.style.display = 'none';
      video.style.display = 'block';

      // Re-enumerate after stream starts (gets labels)
      await refreshDevices();

    } catch (err) {
      console.error('Stream start error:', err);
      showNoCameraError(err);
      throw err;
    }
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

    // Apply mirror
    if (isMirrored) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }

    // Apply filter
    ctx.filter = filterCss || 'none';

    ctx.drawImage(video, 0, 0, vw, vh);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  function showNoCameraError(err) {
    if (noCamMsg) noCamMsg.style.display = 'flex';
    video.style.display = 'none';

    let msg = 'Terjadi kesalahan saat mengakses kamera.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      msg = 'Akses kamera ditolak. Klik ikon kunci di address bar dan izinkan akses kamera.';
    } else if (err.name === 'NotFoundError') {
      msg = 'Tidak ada kamera yang ditemukan di perangkat ini.';
    } else if (err.name === 'NotReadableError') {
      msg = 'Kamera sedang digunakan oleh aplikasi lain.';
    }

    const errorEl = noCamMsg.querySelector('.camera-error p');
    if (errorEl) errorEl.textContent = msg;
  }

  function getVideoElement() { return video; }
  function getStream() { return stream; }
  function getDevices() { return devices; }
  function getMirrored() { return isMirrored; }

  return {
    init,
    switchCamera,
    toggleMirror,
    captureFrame,
    stopStream,
    getVideoElement,
    getStream,
    getDevices,
    getMirrored
  };
})();

window.CameraManager = CameraManager;
