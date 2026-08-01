/* ============================================================
   REZNIK v2 — main.js
   8-stage wake, orientation toggle, sleeping egg, cursor tracking
   ============================================================ */

// ─── NAV SCROLL ─────────────────────────────────────────────
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── PARTICLE SYSTEM ────────────────────────────────────────
function createParticles(container, count = 7) {
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${15 + Math.random() * 70}%;
      bottom: ${8 + Math.random() * 35}%;
      --dur: ${2.8 + Math.random() * 2.2}s;
      --delay: ${Math.random() * 3.5}s;
      width: ${2.5 + Math.random() * 3}px;
      height: ${2.5 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
}
createParticles(document.getElementById('particles-hero'), 9);
createParticles(document.getElementById('demo-particles'), 9);

// ─── BLINK UTILS ────────────────────────────────────────────
function blinkEye(eye) {
  if (!eye) return;
  eye.classList.remove('blink');
  void eye.offsetWidth; // reflow
  eye.classList.add('blink');
  eye.addEventListener('animationend', () => eye.classList.remove('blink'), { once: true });
}

let blinkTimers = {};
function scheduleBlink(id, eyes, minMs = 2200, maxMs = 6500) {
  if (blinkTimers[id]) clearTimeout(blinkTimers[id]);
  const delay = minMs + Math.random() * (maxMs - minMs);
  blinkTimers[id] = setTimeout(() => {
    eyes.forEach(e => blinkEye(e));
    scheduleBlink(id, eyes, minMs, maxMs);
  }, delay);
}

// ─── HERO EYES — IDLE DRIFT ─────────────────────────────────
const heroLeftEye   = document.getElementById('left-eye-hero');
const heroRightEye  = document.getElementById('right-eye-hero');
const heroLeftInner = document.getElementById('left-inner-hero');
const heroRightInner= document.getElementById('right-inner-hero');

let heroLookTimer = null;
function moveHeroEyes(nx, ny) {
  const maxX = 8, maxY = 6;
  const px = 50 + nx * maxX;
  const py = 50 + ny * maxY;
  if (heroLeftInner)  { heroLeftInner.style.left  = px + '%'; heroLeftInner.style.top  = py + '%'; }
  if (heroRightInner) { heroRightInner.style.left = px + '%'; heroRightInner.style.top = py + '%'; }
}
function randomHeroLook() {
  moveHeroEyes((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.2);
  heroLookTimer = setTimeout(randomHeroLook, 1400 + Math.random() * 2800);
}
randomHeroLook();
scheduleBlink('hero', [heroLeftEye, heroRightEye]);

// ─── PERSONALITY EYES — BLINK ───────────────────────────────
const persLeft  = document.getElementById('pers-left');
const persRight = document.getElementById('pers-right');
if (persLeft && persRight) scheduleBlink('pers', [persLeft, persRight], 2500, 6000);

// ─── DEMO STATE ──────────────────────────────────────────────
const demoPhone     = document.getElementById('demo-phone');
const demoEyes      = document.getElementById('demo-eyes');
const demoSleeping  = document.getElementById('demo-sleeping');
const demoLeftEye   = document.getElementById('demo-left-eye');
const demoRightEye  = document.getElementById('demo-right-eye');
const demoLeftInner = document.getElementById('demo-left-inner');
const demoRightInner= document.getElementById('demo-right-inner');
const demoGlow      = document.getElementById('demo-glow');
const statusDot     = document.getElementById('status-dot');
const statusText    = document.getElementById('status-text');
const wakeBtn       = document.getElementById('wake-btn-demo');
const breatheBtn    = document.getElementById('breathe-btn');
const sleepingEgg   = document.getElementById('sleeping-egg');

let demoAwake  = false;
let demoWaking = false;
let demoLookTimer = null;
let isLandscape = false;

// ─── 8-STAGE WAKE SEQUENCE ──────────────────────────────────
function wakeReznik() {
  if (demoAwake || demoWaking) return;
  demoWaking = true;

  const easeOpen = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  // Stage 1 — Eyes Closed / Zzz fading
  statusDot.className = 'status-dot waking';
  statusText.textContent = 'Stirring…';
  demoSleeping.style.transition = 'opacity 0.7s';
  demoSleeping.style.opacity = '0';
  demoEyes.style.transition = 'opacity 0.5s';
  demoEyes.classList.add('visible');
  demoLeftEye.style.transition  = 'none';
  demoRightEye.style.transition = 'none';
  demoLeftEye.style.transform   = 'scaleY(0.04)';
  demoRightEye.style.transform  = 'scaleY(0.04)';

  // Stage 2 — Starting to open (400ms)
  setTimeout(() => {
    statusText.textContent = 'Waking…';
    demoLeftEye.style.transition  = `transform 0.6s ${easeOpen}`;
    demoRightEye.style.transition = `transform 0.6s ${easeOpen}`;
    demoLeftEye.style.transform   = 'scaleY(0.18)';
    demoRightEye.style.transform  = 'scaleY(0.18)';
  }, 400);

  // Stage 3 — Half open (900ms)
  setTimeout(() => {
    demoLeftEye.style.transition  = `transform 0.5s ${easeOpen}`;
    demoRightEye.style.transition = `transform 0.5s ${easeOpen}`;
    demoLeftEye.style.transform   = 'scaleY(0.55)';
    demoRightEye.style.transform  = 'scaleY(0.55)';
  }, 900);

  // Stage 4 — Fully open / Awake (1400ms)
  setTimeout(() => {
    demoLeftEye.style.transition  = `transform 0.6s ${easeOpen}`;
    demoRightEye.style.transition = `transform 0.6s ${easeOpen}`;
    demoLeftEye.style.transform   = 'scaleY(1)';
    demoRightEye.style.transform  = 'scaleY(1)';
    demoPhone.classList.add('awake');
    demoGlow.classList.add('active');
  }, 1400);

  // Stage 5 — Looking around (2000ms)
  setTimeout(() => {
    statusText.textContent = 'Looking around…';
    moveDemoEyes(-0.65, 0.25);
  }, 2000);
  setTimeout(() => moveDemoEyes(0.7, -0.2), 2550);
  setTimeout(() => moveDemoEyes(0.1, 0.3), 3100);
  setTimeout(() => moveDemoEyes(0, 0), 3600);

  // Stage 6 — Fully awake (3900ms)
  setTimeout(() => {
    demoAwake  = true;
    demoWaking = false;
    statusDot.className  = 'status-dot awake';
    statusText.textContent = 'Awake — move your cursor';
  }, 3900);

  // Stage 7 — Natural blink (4300ms)
  setTimeout(() => {
    blinkEye(demoLeftEye);
    blinkEye(demoRightEye);
  }, 4300);

  // Stage 8 — Back to idle (4700ms)
  setTimeout(() => {
    scheduleBlink('demo', [demoLeftEye, demoRightEye]);
    startDemoLookAround();
  }, 4700);
}

function sleepReznik() {
  demoAwake = false;
  if (blinkTimers['demo']) clearTimeout(blinkTimers['demo']);
  if (demoLookTimer) { clearTimeout(demoLookTimer); demoLookTimer = null; }
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
  } else if (!demoWaking) {
    wakeReznik();
    wakeBtn.textContent = 'Put to Sleep';
  }
});

if (breatheBtn) {
  breatheBtn.addEventListener('click', () => {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
  });
}

// ─── DEMO EYES — CURSOR TRACKING ────────────────────────────
function moveDemoEyes(nx, ny) {
  // nx, ny in range [-1, 1]
  const maxX = isLandscape ? 14 : 10;
  const maxY = isLandscape ?  6 :  8;
  const lx = 50 + nx * maxX;
  const ly = 50 + ny * maxY;
  if (demoLeftInner)  { demoLeftInner.style.left  = lx + '%'; demoLeftInner.style.top  = ly + '%'; }
  if (demoRightInner) { demoRightInner.style.left = lx + '%'; demoRightInner.style.top = ly + '%'; }
}

function startDemoLookAround() {
  if (demoLookTimer) clearTimeout(demoLookTimer);
  randomDemoLook();
}
function randomDemoLook() {
  if (!demoAwake) return;
  moveDemoEyes((Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.0);
  demoLookTimer = setTimeout(randomDemoLook, 1600 + Math.random() * 2600);
}

demoPhone.addEventListener('mousemove', (e) => {
  if (!demoAwake) return;
  if (demoLookTimer) { clearTimeout(demoLookTimer); demoLookTimer = null; }
  const rect = demoPhone.getBoundingClientRect();
  const nx = Math.max(-1, Math.min(1, (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)));
  const ny = Math.max(-1, Math.min(1, (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)));
  moveDemoEyes(nx, ny);
});
demoPhone.addEventListener('mouseleave', () => {
  if (!demoAwake) return;
  setTimeout(startDemoLookAround, 700);
});

// ─── ORIENTATION TOGGLE ──────────────────────────────────────
const btnPortrait  = document.getElementById('btn-portrait');
const btnLandscape = document.getElementById('btn-landscape');

if (btnPortrait && btnLandscape) {
  btnPortrait.addEventListener('click', () => {
    if (isLandscape) switchOrientation(false);
  });
  btnLandscape.addEventListener('click', () => {
    if (!isLandscape) switchOrientation(true);
  });
}

function switchOrientation(toLandscape) {
  isLandscape = toLandscape;
  demoPhone.classList.toggle('landscape', toLandscape);
  btnPortrait.classList.toggle('active', !toLandscape);
  btnLandscape.classList.toggle('active',  toLandscape);
  // Give CSS transition time, then recalculate look
  if (demoAwake) {
    setTimeout(() => moveDemoEyes(0, 0), 300);
  }
}

// ─── SLEEPING EGG — EASTER EGG CLICK ────────────────────────
if (sleepingEgg) {
  sleepingEgg.addEventListener('click', () => {
    // Scroll to demo section
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
    // Pulse the egg
    sleepingEgg.classList.add('waking');
    setTimeout(() => sleepingEgg.classList.remove('waking'), 500);
    // Wake Reznik after scroll lands
    setTimeout(() => {
      if (!demoAwake && !demoWaking) {
        wakeReznik();
        if (wakeBtn) wakeBtn.textContent = 'Put to Sleep';
      }
    }, 900);
  });
  sleepingEgg.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') sleepingEgg.click();
  });
}

// ─── HERO BUTTON — SCROLL + WAKE ────────────────────────────
// "Get Reznik" is now an <a> tag pointing to GitHub — no JS needed.
// "See it Breathe" scrolls to demo.

// ─── PARALLAX ON HERO ───────────────────────────────────────
const phoneHero = document.getElementById('phone-hero');
window.addEventListener('scroll', () => {
  if (phoneHero) phoneHero.style.transform = `translateY(${window.scrollY * 0.08}px)`;
}, { passive: true });

// ─── SCROLL REVEAL — GENERAL ────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.card, .section-title, .section-tag'
).forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });

// ─── FEATURE CARDS — STAGGER ────────────────────────────────
const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.feature-card').forEach(c => featureObserver.observe(c));

// ─── PIPELINE — STAGGER ─────────────────────────────────────
const pipelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.2 });
document.querySelectorAll('.pipeline-step, .pipeline-arrow').forEach(el => pipelineObserver.observe(el));

// ─── PERSONALITY BUBBLES — STAGGER ──────────────────────────
const bubbleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.speech-bubble').forEach((b, i) => {
        setTimeout(() => b.classList.add('visible'), i * 180);
      });
      bubbleObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });
const bubblesScene = document.querySelector('.bubbles-scene');
if (bubblesScene) bubbleObserver.observe(bubblesScene);

// ─── CARDS — 3D TILT ────────────────────────────────────────
document.querySelectorAll('.card, .feature-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-6px) rotateX(${-dy * 3}deg) rotateY(${dx * 3}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ─── BUTTON SQUISH ──────────────────────────────────────────
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-nav, .orient-btn').forEach(btn => {
  btn.addEventListener('mousedown', () => { btn.style.transform = 'scale(0.96)'; });
  btn.addEventListener('mouseup',   () => { btn.style.transform = ''; });
  btn.addEventListener('mouseleave',() => { btn.style.transform = ''; });
});

// ─── SMOOTH SCROLL (anchor links) ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

console.log('%c Reznik v2 — awake. ', 'background:#1A1A1A; color:#F97316; font-family:Georgia,serif; font-size:13px; padding:6px 14px; border-radius:4px; font-style:italic;');
