/* ============================================
   geri.booth - Photo Strip Generator
   ============================================ */

const StripGenerator = (() => {

  /**
   * Generate the final photo strip canvas
   * @param {string[]} photoDataUrls - Array of captured photo data URLs
   * @param {object} layout - Layout config from LAYOUTS
   * @param {object} theme - Theme config from THEMES
   * @param {object} frame - Frame config from FRAMES
   * @returns {Promise<HTMLCanvasElement>}
   */
  async function generate(photoDataUrls, layout, theme, frame) {
    const canvas = document.getElementById('strip-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = layout.canvasWidth;
    canvas.height = layout.canvasHeight;

    // ---- Background ----
    if (theme.bg.startsWith('linear-gradient') || theme.bg.startsWith('radial-gradient')) {
      const gradient = parseGradient(ctx, theme.bg, layout.canvasWidth, layout.canvasHeight);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = theme.stripBg || theme.bg;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- Polaroid background (white card) ----
    if (layout.polaroid) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 10;
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // ---- Draw Photos into slots ----
    const photos = await loadImages(photoDataUrls);
    
    for (let i = 0; i < layout.slots.length; i++) {
      const slot = layout.slots[i];
      const photo = photos[i];

      if (!photo) {
        // Draw placeholder
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = `${slot.h * 0.15}px Outfit`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('📷', slot.x + slot.w / 2, slot.y + slot.h / 2);
        continue;
      }

      // Draw photo with cover-fit
      ctx.save();
      ctx.beginPath();
      if (layout.polaroid) {
        roundRect(ctx, slot.x, slot.y, slot.w, slot.h, 4);
      } else {
        ctx.rect(slot.x, slot.y, slot.w, slot.h);
      }
      ctx.clip();

      const { sx, sy, sw, sh } = coverFit(photo.width, photo.height, slot.w, slot.h);
      ctx.drawImage(photo, sx, sy, sw, sh, slot.x, slot.y, slot.w, slot.h);
      ctx.restore();

      // Gap line between photos (for strips)
      if (i < layout.slots.length - 1 && !layout.polaroid) {
        const nextSlot = layout.slots[i + 1];
        const gapY1 = slot.y + slot.h;
        const gapY2 = nextSlot.y;
        if (gapY1 < gapY2 && gapY2 - gapY1 < 100) {
          ctx.fillStyle = theme.stripBg || '#0f0f1f';
          ctx.fillRect(slot.x, gapY1, slot.w, gapY2 - gapY1);
        }
      }
    }

    // ---- Label / Branding ----
    if (layout.labelY) {
      drawLabel(ctx, canvas.width, layout, theme);
    }

    // ---- Apply Frame ----
    if (frame && frame.type !== 'none') {
      await applyFrame(ctx, canvas.width, canvas.height, frame);
    }

    return canvas;
  }

  function drawLabel(ctx, canvasW, layout, theme) {
    const y = layout.labelY;
    const textColor = theme.stripText || '#ffffff';

    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.7;

    // Site name
    ctx.font = `bold ${Math.round(layout.canvasWidth * 0.045)}px Outfit`;
    ctx.fillText('geri.booth', canvasW / 2, y);

    // Date
    ctx.globalAlpha = 0.45;
    ctx.font = `${Math.round(layout.canvasWidth * 0.028)}px Outfit`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    ctx.fillText(dateStr, canvasW / 2, y + layout.canvasWidth * 0.055);

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  async function applyFrame(ctx, w, h, frame) {
    if (frame.type === 'image' && frame.src) {
      try {
        const img = await loadImage(frame.src);
        ctx.drawImage(img, 0, 0, w, h);
      } catch (e) {
        console.warn('Frame image failed to load:', frame.src, e);
      }
    } else if (frame.type === 'drawn' && typeof frame.draw === 'function') {
      frame.draw(ctx, w, h);
    }
  }

  // ---- Utilities ----

  function loadImages(urls) {
    return Promise.all(urls.map(url => url ? loadImage(url) : Promise.resolve(null)));
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Calculate source crop for object-fit: cover
   */
  function coverFit(imgW, imgH, destW, destH) {
    const imgRatio = imgW / imgH;
    const destRatio = destW / destH;

    let sw, sh, sx, sy;
    if (imgRatio > destRatio) {
      // Image is wider — crop sides
      sh = imgH;
      sw = imgH * destRatio;
      sy = 0;
      sx = (imgW - sw) / 2;
    } else {
      // Image is taller — crop top/bottom
      sw = imgW;
      sh = imgW / destRatio;
      sx = 0;
      sy = (imgH - sh) / 2;
    }

    return { sx, sy, sw, sh };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  /**
   * Parse CSS gradient string to CanvasGradient (simplified)
   */
  function parseGradient(ctx, gradientStr, w, h) {
    // Extract colors from linear-gradient
    const colorMatches = gradientStr.match(/#[a-fA-F0-9]{3,8}|rgb[a]?\([^)]+\)/g);
    
    if (!colorMatches || colorMatches.length < 2) {
      return '#0f0f1f';
    }

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    colorMatches.forEach((color, i) => {
      gradient.addColorStop(i / (colorMatches.length - 1), color);
    });

    return gradient;
  }

  return {
    generate
  };
})();

window.StripGenerator = StripGenerator;
