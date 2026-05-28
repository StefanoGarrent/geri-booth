/* ============================================
   geri.booth - Themes Definition
   ============================================ */

const THEMES = [
  {
    id: 'default',
    name: 'Default',
    emoji: '🌌',
    bg: 'linear-gradient(135deg, #0a0a1f, #1a0a2e)',
    accent: '#ff2d8a',
    stripBg: '#0f0f1f',
    stripText: '#ffffff',
    camBg: '#0a0a1f',
    borderColor: '#ff2d8a',
    description: 'Dark & Moody'
  },
  {
    id: 'y2k',
    name: 'Y2K',
    emoji: '💫',
    bg: 'linear-gradient(135deg, #ff9de2, #c8b6ff, #b8c0ff)',
    accent: '#ff006e',
    stripBg: '#ffe0f7',
    stripText: '#5c0099',
    camBg: '#ffc8e8',
    borderColor: '#ff006e',
    description: 'Retro Cyber'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📜',
    bg: 'linear-gradient(135deg, #e8d5b0, #c9a96e)',
    accent: '#8b4513',
    stripBg: '#f5e6cc',
    stripText: '#3d1c02',
    camBg: '#dfc89a',
    borderColor: '#8b4513',
    description: 'Classic Film'
  },
  {
    id: 'neon',
    name: 'Neon',
    emoji: '⚡',
    bg: 'linear-gradient(135deg, #050020, #0d0035)',
    accent: '#00f5d4',
    stripBg: '#02000f',
    stripText: '#00f5d4',
    camBg: '#030015',
    borderColor: '#00f5d4',
    description: 'Cyberpunk'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    emoji: '🌸',
    bg: 'linear-gradient(135deg, #ffd6e7, #c1f0f6, #ffe8cc)',
    accent: '#ff6b9d',
    stripBg: '#fff5f9',
    stripText: '#c25a8a',
    camBg: '#ffe0f0',
    borderColor: '#ff6b9d',
    description: 'Soft & Sweet'
  },
  {
    id: 'gothic',
    name: 'Gothic',
    emoji: '🖤',
    bg: 'linear-gradient(135deg, #0d0010, #1a0020)',
    accent: '#9b00ff',
    stripBg: '#050008',
    stripText: '#cc00ff',
    camBg: '#080010',
    borderColor: '#9b00ff',
    description: 'Dark Elegance'
  },
  {
    id: 'summer',
    name: 'Summer',
    emoji: '☀️',
    bg: 'linear-gradient(135deg, #ff6347, #ffd700, #ff8c00)',
    accent: '#ff4500',
    stripBg: '#fff8dc',
    stripText: '#8b4513',
    camBg: '#ffb347',
    borderColor: '#ff4500',
    description: 'Tropical Vibes'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    bg: 'linear-gradient(135deg, #001a33, #003355, #001a00)',
    accent: '#00ff7f',
    stripBg: '#001420',
    stripText: '#00ff7f',
    camBg: '#002030',
    borderColor: '#00ff7f',
    description: 'Northern Lights'
  }
];

// Export for use in other modules
window.THEMES = THEMES;
