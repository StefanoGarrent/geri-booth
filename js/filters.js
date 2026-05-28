/* ============================================
   geri.booth - Filters Definition
   ============================================ */

const FILTERS = [
  { id: 'none',      name: 'Normal',    emoji: '✨', css: 'none' },
  { id: 'grayscale', name: 'B&W',       emoji: '🖤', css: 'grayscale(1)' },
  { id: 'sepia',     name: 'Sepia',     emoji: '📜', css: 'sepia(0.85)' },
  { id: 'vivid',     name: 'Vivid',     emoji: '🌈', css: 'saturate(2.5) contrast(1.1)' },
  { id: 'cold',      name: 'Cold',      emoji: '❄️', css: 'hue-rotate(180deg) saturate(0.7) brightness(1.1)' },
  { id: 'warm',      name: 'Warm',      emoji: '🌅', css: 'sepia(0.3) saturate(1.8) hue-rotate(-10deg)' },
  { id: 'fade',      name: 'Fade',      emoji: '🌫️', css: 'brightness(1.2) contrast(0.75) saturate(0.6)' },
  { id: 'noir',      name: 'Noir',      emoji: '🎭', css: 'grayscale(1) contrast(1.6) brightness(0.85)' },
  { id: 'dreamy',    name: 'Dreamy',    emoji: '💭', css: 'brightness(1.1) saturate(1.4) blur(0.4px) contrast(0.9)' },
  { id: 'golden',    name: 'Golden',    emoji: '✨', css: 'sepia(0.6) saturate(2) brightness(1.05) hue-rotate(-15deg)' }
];

window.FILTERS = FILTERS;
