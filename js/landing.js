/* ============================================
   geri.booth - Landing Page Script
   ============================================ */

// Create floating particles
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const colors = ['#ff2d8a', '#9b5de5', '#00f5d4', '#ffd60a', '#ff6b35'];
  const count = 40;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    
    const x = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = 10 + Math.random() * 15;
    const size = 2 + Math.random() * 4;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText = `
      left: ${x}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
    `;

    container.appendChild(p);
  }
})();

// Smooth scroll reveal for feature cards
(function revealCards() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.animation = 'fadeSlideUp 0.5s ease forwards';
          entry.target.style.opacity = '1';
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    observer.observe(card);
  });
})();

// Start button hover sound-like pulse
const startBtn = document.getElementById('start-btn');
if (startBtn) {
  startBtn.addEventListener('mouseenter', () => {
    startBtn.style.transform = 'translateY(-3px) scale(1.03)';
  });
  startBtn.addEventListener('mouseleave', () => {
    startBtn.style.transform = '';
  });
}
