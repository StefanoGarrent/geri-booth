/* ============================================
   geri.booth - Frames Definition
   ============================================ */

const FRAMES = [
  {
    id: 'none',
    name: 'Tanpa Frame',
    emoji: '✖',
    type: 'none',
    src: null
  },
  {
    id: 'floral',
    name: 'Floral',
    emoji: '🌸',
    type: 'image',
    src: 'assets/frames/frame_floral.png'
  },
  {
    id: 'y2k',
    name: 'Y2K',
    emoji: '💫',
    type: 'image',
    src: 'assets/frames/frame_y2k.png'
  },
  {
    id: 'neon',
    name: 'Neon',
    emoji: '⚡',
    type: 'image',
    src: 'assets/frames/frame_neon.png'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📜',
    type: 'image',
    src: 'assets/frames/frame_vintage.png'
  },
  {
    id: 'hearts',
    name: 'Hearts',
    emoji: '❤️',
    type: 'drawn',
    draw: drawHeartsFrame
  },
  {
    id: 'stars',
    name: 'Stars',
    emoji: '⭐',
    type: 'drawn',
    draw: drawStarsFrame
  },
  {
    id: 'minimal',
    name: 'Minimal',
    emoji: '▢',
    type: 'drawn',
    draw: drawMinimalFrame
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    type: 'drawn',
    draw: drawRainbowFrame
  },
  {
    id: 'film',
    name: 'Film Strip',
    emoji: '🎞',
    type: 'drawn',
    draw: drawFilmFrame
  }
];

/* ---- Drawn Frames ---- */

function drawHeartsFrame(ctx, w, h) {
  const hearts = [];
  const margin = 40;
  const count = 18;
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    if (t < 0.25) {
      // top edge
      hearts.push({ x: w * (t / 0.25), y: margin * 0.5 });
    } else if (t < 0.5) {
      // right edge
      hearts.push({ x: w - margin * 0.5, y: h * ((t - 0.25) / 0.25) });
    } else if (t < 0.75) {
      // bottom edge
      hearts.push({ x: w - w * ((t - 0.5) / 0.25), y: h - margin * 0.5 });
    } else {
      // left edge
      hearts.push({ x: margin * 0.5, y: h - h * ((t - 0.75) / 0.25) });
    }
  }

  const colors = ['#ff2d8a', '#ff6eb4', '#ff9de2', '#c8b6ff', '#9b5de5'];
  hearts.forEach((pos, idx) => {
    const size = 14 + Math.sin(idx * 1.5) * 6;
    const color = colors[idx % colors.length];
    drawHeart(ctx, pos.x, pos.y, size, color);
  });
}

function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.3);
  ctx.bezierCurveTo(-size * 0.5, -size * 0.2, -size, size * 0.1, 0, size);
  ctx.bezierCurveTo(size, size * 0.1, size * 0.5, -size * 0.2, 0, size * 0.3);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawStarsFrame(ctx, w, h) {
  const count = 24;
  const colors = ['#ffd60a', '#ff2d8a', '#00f5d4', '#9b5de5', '#ffffff'];
  const sizes = [8, 12, 16, 10, 14];
  const positions = [];

  const margin = 50;
  for (let i = 0; i < count; i++) {
    const t = i / count;
    let x, y;
    if (t < 0.25) {
      x = w * (t / 0.25); y = margin * Math.random() + 10;
    } else if (t < 0.5) {
      x = w - margin * Math.random() - 10; y = h * ((t - 0.25) / 0.25);
    } else if (t < 0.75) {
      x = w - w * ((t - 0.5) / 0.25); y = h - margin * Math.random() - 10;
    } else {
      x = margin * Math.random() + 10; y = h - h * ((t - 0.75) / 0.25);
    }
    positions.push({ x, y });
  }

  positions.forEach((pos, idx) => {
    const size = sizes[idx % sizes.length];
    const color = colors[idx % colors.length];
    drawStar(ctx, pos.x, pos.y, size, 5, color);
  });
}

function drawStar(ctx, cx, cy, outerR, points, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : outerR * 0.4;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawMinimalFrame(ctx, w, h) {
  const margin = 20;
  const cornerLen = 60;
  const lineWidth = 6;
  const color = '#ffffff';
  const alpha = 0.8;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + cornerLen);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + cornerLen, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - margin - cornerLen, margin);
  ctx.lineTo(w - margin, margin);
  ctx.lineTo(w - margin, margin + cornerLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, h - margin - cornerLen);
  ctx.lineTo(margin, h - margin);
  ctx.lineTo(margin + cornerLen, h - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - margin - cornerLen, h - margin);
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(w - margin, h - margin - cornerLen);
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawRainbowFrame(ctx, w, h) {
  const thickness = 18;
  const colors = ['#ff0000', '#ff7700', '#ffee00', '#00cc00', '#0066ff', '#9900cc'];
  
  colors.forEach((color, i) => {
    const offset = i * (thickness * 0.6);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.globalAlpha = 0.65;
    ctx.strokeRect(
      offset + thickness / 2,
      offset + thickness / 2,
      w - offset * 2 - thickness,
      h - offset * 2 - thickness
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  });
}

function drawFilmFrame(ctx, w, h) {
  const sprocketSize = 28;
  const sprocketGap = 52;
  const sprocketMargin = 18;
  const filmBg = 'rgba(0,0,0,0.85)';
  const filmAccent = '#ffcc00';

  // Left film strip border
  ctx.save();
  ctx.fillStyle = filmBg;
  ctx.fillRect(0, 0, sprocketMargin + sprocketSize + 12, h);

  // Right film strip border
  ctx.fillRect(w - sprocketMargin - sprocketSize - 12, 0, sprocketMargin + sprocketSize + 12, h);

  ctx.fillStyle = filmAccent;
  // Left sprockets
  let y = sprocketGap / 2;
  while (y < h) {
    ctx.beginPath();
    ctx.roundRect(sprocketMargin, y - sprocketSize / 2, sprocketSize, sprocketSize, 4);
    ctx.fill();
    y += sprocketGap;
  }

  // Right sprockets
  y = sprocketGap / 2;
  while (y < h) {
    ctx.beginPath();
    ctx.roundRect(w - sprocketMargin - sprocketSize, y - sprocketSize / 2, sprocketSize, sprocketSize, 4);
    ctx.fill();
    y += sprocketGap;
  }

  ctx.restore();
}

window.FRAMES = FRAMES;
