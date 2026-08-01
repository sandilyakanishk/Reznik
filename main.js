/* ============================================================
   REZNIK — main.js
   Eyes, blinking, cursor tracking, wake animation, scroll FX
   ============================================================ */

// ─── NAV SCROLL ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── SCROLL REVEAL ──────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.card, .feature-card, .pipeline-step, .pipeline-arrow, .section-title, .section-tag, .speech-bubble'
).forEach(el => {
  el.classList.add('reveal');
  observer.observe(el);
});

// Re-observe specific elements that already have their own animation
document.querySelectorAll('.pipeline-step, .pipeline-arrow').forEach(el => {
  observer.observe(el);
});

// ─── PARTICLE SYSTEM ────────────────────────────────────────
function createParticles(container, count = 6) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${20 + Math.random() * 60}%;
      bottom: ${10 + Math.random() * 30}%;
      --dur: ${2.5 + Math.random() * 2}s;
      --delay: ${Math.random() * 3}s;
      width: ${3 + Math.random() * 3}px;
      height: ${3 + Math.random() * 3}px;
      opacity: 0;
    `;
    container.appendChild(p);
  }
}

createParticles(document.getElementById('particles-hero'), 8);
createParticles(document.getElementById('demo-particles'), 8);

// ─── HERO EYES — BLINK & DRIFT ──────────────────────────────
const heroLeftEye = document.getElementById('left-eye-hero');
const heroRightEye = document.getElementById('right-eye-hero');
const heroLeftInner = document.getElementById('left-inner-hero');
const heroRightInner = document.getElementById('right-inner-hero');

let heroLookTarget = { x: 0, y: 0 };
let heroCurrentLook = { x: 0, y: 0 };
let heroLookTimer = null;

function moveHeroEyes(nx, ny) {
  // nx, ny in range [-1, 1]
  const maxX = 8, maxY = 6;
  const px = 50 + nx * maxX;
  const py = 50 + ny * maxY;
  heroLeftInner.style.left = px + '%';
  heroLeftInner.style.top = py + '%';
  heroRightInner.style.left = px + '%';
  heroRightInner.style.top = py + '%';
}

function randomHeroLook() {
  const nx = (Math.random() - 0.5) * 1.6;
  const ny = (Math.random() - 0.5) * 1.2;
  heroLookTarget = { x: nx, y: ny };
  moveHeroEyes(nx, ny);
  heroLookTimer = setTimeout(randomHeroLook, 1200 + Math.random() * 2800);
}
randomHeroLook();

function blinkEye(eye) {
  eye.classList.remove('blink');
  void eye.offsetWidth;
  eye.classList.add('blink');
  eye.addEventListener('animationend', () => eye.classList.remove('blink'), { once: true });
}

function scheduleBlink(eyes, minMs = 2000, maxMs = 6000) {
  const delay = minMs + Math.random() * (maxMs - minMs);
  setTimeout(() => {
    eyes.forEach(e => blinkEye(e));
    scheduleBlink(eyes, minMs, maxMs);
  }, delay);
}

scheduleBlink([heroLeftEye, heroRightEye]);

// ─── PERSONALITY EYES — BLINK ───────────────────────────────
const persLeft = document.getElementById('pers-left');
const persRight = document.getElementById('pers-right');
if (persLeft && persRight) {
  scheduleBlink([persLeft, persRight], 2500, 5500);
}

// ─── DEMO SECTION — WAKE INTERACTION ───────────────────────
const wakeBtn = document.getElementById('wake-btn-demo');
const wakeHeroBtn = document.getElementById('wake-btn-hero');
const breatheBtn = document.getElementById('breathe-btn');
const demoPhone = document.getElementById('demo-phone');
const demoScreen = document.getElementById('demo-screen');
const demoEyes = document.getElementById('demo-eyes');
const demoSleeping = document.getElementById('demo-sleeping');
const demoLeftEye = document.getElementById('demo-left-eye');
const demoRightEye = document.getElementById('demo-right-eye');
const demoLeftInner = document.getElementById('demo-left-inner');
const demoRightInner = document.getElementById('demo-right-inner');
const demoGlow = document.getElementById('demo-glow');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

let demoAwake = false;
let demoWaking = false;

function wakeReznik() {
  if (demoAwake || demoWaking) return;
  demoWaking = true;

  statusDot.className = 'status-dot waking';
  statusText.textContent = 'Stirring…';

  // Hide zzz
  demoSleeping.style.transition = 'opacity 0.5s';
  demoSleeping.style.opacity = '0';

  // Show eyes slowly
  setTimeout(() => {
    demoEyes.style.transition = 'opacity 1.2s';
    demoEyes.classList.add('visible');
    demoPhone.classList.add('awake');
    demoGlow.classList.add('active');
  }, 400);

  setTimeout(() => {
    // Eyes open animation - start closed then open
    demoLeftEye.style.transform = 'scaleY(0.05)';
    demoRightEye.style.transform = 'scaleY(0.05)';
  }, 800);

  setTimeout(() => {
    demoLeftEye.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    demoRightEye.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    demoLeftEye.style.transform = 'scaleY(1)';
    demoRightEye.style.transform = 'scaleY(1)';
  }, 1000);

  setTimeout(() => {
    demoAwake = true;
    demoWaking = false;
    statusDot.className = 'status-dot awake';
    statusText.textContent = 'Awake — move your cursor';
    scheduleBlink([demoLeftEye, demoRightEye]);
    startDemoLookAround();
  }, 1800);
}

function sleepReznik() {
  demoAwake = false;
  demoPhone.classList.remove('awake');
  demoGlow.classList.remove('active');
  demoEyes.classList.remove('visible');
  demoSleeping.style.opacity = '1';
  statusDot.className = 'status-dot';
  statusText.textContent = 'Sleeping';
}

wakeBtn.addEventListener('click', () => {
  if (demoAwake) {
    sleepReznik();
    wakeBtn.textContent = 'Wake Reznik';
  } else {
    wakeReznik();
    wakeBtn.textContent = 'Put to Sleep';
  }
});

// Hero buttons link to demo section
wakeHeroBtn.addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    if (!demoAwake && !demoWaking) {
      wakeReznik();
      wakeBtn.textContent = 'Put to Sleep';
    }
  }, 800);
});

breatheBtn.addEventListener('click', () => {
  document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
});

// ─── DEMO EYES — CURSOR TRACKING ────────────────────────────
let demoLookTimer = null;

function startDemoLookAround() {
  if (demoLookTimer) clearTimeout(demoLookTimer);
  randomDemoLook();
}

function randomDemoLook() {
  if (!demoAwake) return;
  const nx = (Math.random() - 0.5) * 1.4;
  const ny = (Math.random() - 0.5) * 1;
  moveDemoEyes(nx, ny);
  demoLookTimer = setTimeout(randomDemoLook, 1500 + Math.random() * 2500);
}

function moveDemoEyes(nx, ny) {
  const maxX = 10, maxY = 8;
  const lx = 50 + nx * maxX;
  const ly = 50 + ny * maxY;
  demoLeftInner.style.left = lx + '%';
  demoLeftInner.style.top = ly + '%';
  demoRightInner.style.left = lx + '%';
  demoRightInner.style.top = ly + '%';
}

// Cursor tracking over the phone
demoPhone.addEventListener('mousemove', (e) => {
  if (!demoAwake) return;
  if (demoLookTimer) { clearTimeout(demoLookTimer); demoLookTimer = null; }

  const rect = demoPhone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  const nx = Math.max(-1, Math.min(1, dx));
  const ny = Math.max(-1, Math.min(1, dy));
  moveDemoEyes(nx, ny);
});

demoPhone.addEventListener('mouseleave', () => {
  if (!demoAwake) return;
  // Resume random look after leaving
  setTimeout(startDemoLookAround, 800);
});

// ─── PARALLAX ON HERO ───────────────────────────────────────
const phoneHero = document.getElementById('phone-hero');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  if (phoneHero) {
    phoneHero.style.transform = `translateY(${scrollY * 0.08}px)`;
  }
}, { passive: true });

// ─── PERSONALITY BUBBLES — STAGGER ON SCROLL ────────────────
const bubbleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bubbles = entry.target.querySelectorAll('.speech-bubble');
      bubbles.forEach((b, i) => {
        setTimeout(() => b.classList.add('visible'), i * 180);
      });
      bubbleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

const bubblesScene = document.querySelector('.bubbles-scene');
if (bubblesScene) bubbleObserver.observe(bubblesScene);

// ─── FEATURE CARDS — STAGGER REVEAL ────────────────────────
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.feature-card').forEach(card => {
  featureObserver.observe(card);
});

// ─── PIPELINE STEPS — STAGGER ───────────────────────────────
const pipelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.pipeline-step, .pipeline-arrow').forEach(el => {
  pipelineObserver.observe(el);
});

// ─── SECTION TITLES — REVEAL ────────────────────────────────
const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.2 });

document.querySelectorAll('.section-title, .section-tag').forEach(el => {
  titleObserver.observe(el);
});

// ─── BUTTON SQUISH ──────────────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-nav').forEach(btn => {
  btn.addEventListener('mousedown', () => {
    btn.style.transform = 'scale(0.96)';
  });
  btn.addEventListener('mouseup', () => {
    btn.style.transform = '';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ─── FOOTER DOODLE — GENTLE BREATHING ──────────────────────
const footerDoodle = document.getElementById('footer-doodle');
if (footerDoodle) {
  footerDoodle.style.animation = 'breathe 5s ease-in-out infinite';
}

// ─── SMOOTH SCROLL FOR NAV LINKS ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── CARDS — TILT ON HOVER ──────────────────────────────────
document.querySelectorAll('.card, .feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-6px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

console.log('%c Reznik is awake. ', 'background:#1A1A1A; color:#F97316; font-family:Georgia; font-size:14px; padding:6px 12px; border-radius:4px;');
