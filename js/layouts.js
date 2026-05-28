/* ============================================
   geri.booth - Layouts Definition
   ============================================ */

const LAYOUTS = [
  {
    id: 'strip3',
    name: 'Strip 3',
    emoji: '📋',
    photoCount: 3,
    // Canvas dimensions: width x height
    canvasWidth: 600,
    canvasHeight: 1800,
    // Array of {x, y, w, h} for each photo slot (in canvas pixels)
    slots: [
      { x: 0,   y: 0,    w: 600, h: 580 },
      { x: 0,   y: 610,  w: 600, h: 580 },
      { x: 0,   y: 1220, w: 600, h: 580 }
    ],
    labelY: 1730
  },
  {
    id: 'strip4',
    name: 'Strip 4',
    emoji: '🎞',
    photoCount: 4,
    canvasWidth: 600,
    canvasHeight: 2300,
    slots: [
      { x: 0, y: 0,    w: 600, h: 540 },
      { x: 0, y: 570,  w: 600, h: 540 },
      { x: 0, y: 1140, w: 600, h: 540 },
      { x: 0, y: 1710, w: 600, h: 540 }
    ],
    labelY: 2230
  },
  {
    id: 'grid2x2',
    name: '2×2 Grid',
    emoji: '⊞',
    photoCount: 4,
    canvasWidth: 1200,
    canvasHeight: 1300,
    slots: [
      { x: 0,   y: 0,   w: 580, h: 580 },
      { x: 620, y: 0,   w: 580, h: 580 },
      { x: 0,   y: 620, w: 580, h: 580 },
      { x: 620, y: 620, w: 580, h: 580 }
    ],
    labelY: 1240
  },
  {
    id: 'single',
    name: 'Single',
    emoji: '🖼',
    photoCount: 1,
    canvasWidth: 900,
    canvasHeight: 1100,
    slots: [
      { x: 60, y: 60, w: 780, h: 920 }
    ],
    labelY: 1040
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    emoji: '📷',
    photoCount: 1,
    canvasWidth: 800,
    canvasHeight: 1000,
    slots: [
      { x: 50, y: 50, w: 700, h: 750 }
    ],
    labelY: 870,
    polaroid: true  // flag to add polaroid styling
  },
  {
    id: 'wide2',
    name: 'Wide ×2',
    emoji: '🔀',
    photoCount: 2,
    canvasWidth: 1400,
    canvasHeight: 800,
    slots: [
      { x: 0,   y: 0, w: 680, h: 800 },
      { x: 720, y: 0, w: 680, h: 800 }
    ],
    labelY: null
  }
];

window.LAYOUTS = LAYOUTS;
