/* ============================================================
   REZNIK v3 — main.js
   Custom Cursor, 60fps Eye Lerp, Solid Eyes, Sleeping Egg
   ============================================================ */

// ─── CUSTOM CURSOR ──────────────────────────────────────────
const cursor = document.getElementById('custom-cursor');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let cursorX = mouseX;
let cursorY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Cursor hover interactions
document.querySelectorAll('a, button, .card, .feature-card, .step-icon, .sleeping-egg').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
});
window.addEventListener('mousedown', () => cursor.classList.add('clicking'));
window.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

// ─── ANIMATION LOOP (60FPS LERP) ────────────────────────────
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

// Hero Eyes
const heroLeftEye = document.getElementById('left-eye-hero');
const heroRightEye = document.getElementById('right-eye-hero');
let heroEyeTx = 0, heroEyeTy = 0; // Current pos
let heroTargetTx = 0, heroTargetTy = 0; // Target pos
let heroLookTimer = null;
const heroMaxDist = 8; // Max movement in px

// Demo Eyes
const demoLeftEye = document.getElementById('demo-left-eye');
const demoRightEye = document.getElementById('demo-right-eye');
let demoEyeTx = 0, demoEyeTy = 0;
let demoTargetTx = 0, demoTargetTy = 0;
let demoLookTimer = null;
const demoMaxDist = 10;

function updateFrame() {
  // Lerp Custom Cursor (very fast follow)
  cursorX = lerp(cursorX, mouseX, 0.25);
  cursorY = lerp(cursorY, mouseY, 0.25);
  cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

  // Lerp Hero Eyes
  heroEyeTx = lerp(heroEyeTx, heroTargetTx, 0.08);
  heroEyeTy = lerp(heroEyeTy, heroTargetTy, 0.08);
  const hTransform = `translate(${heroEyeTx}px, ${heroEyeTy}px)`;
  if (heroLeftEye) { heroLeftEye.style.transform = hTransform; heroLeftEye.style.setProperty('--eye-tx', hTransform); }
  if (heroRightEye) { heroRightEye.style.transform = hTransform; heroRightEye.style.setProperty('--eye-tx', hTransform); }

  // Lerp Demo Eyes (only if awake)
  if (demoAwake) {
    demoEyeTx = lerp(demoEyeTx, demoTargetTx, 0.1);
    demoEyeTy = lerp(demoEyeTy, demoTargetTy, 0.1);
    const dTransform = `translate(${demoEyeTx}px, ${demoEyeTy}px)`;
    if (demoLeftEye) { demoLeftEye.style.transform = dTransform; demoLeftEye.style.setProperty('--eye-tx', dTransform); }
    if (demoRightEye) { demoRightEye.style.transform = dTransform; demoRightEye.style.setProperty('--eye-tx', dTransform); }
  }

  requestAnimationFrame(updateFrame);
}
requestAnimationFrame(updateFrame);

// ─── HERO EYES — IDLE / CURSOR TRACK ────────────────────────
const phoneHero = document.getElementById('phone-hero');
let isHeroHovered = false;

function randomHeroLook() {
  if (isHeroHovered) return;
  heroTargetTx = (Math.random() - 0.5) * heroMaxDist * 1.5;
  heroTargetTy = (Math.random() - 0.5) * heroMaxDist * 1.2;
  heroLookTimer = setTimeout(randomHeroLook, 1400 + Math.random() * 2800);
}
randomHeroLook();

if (phoneHero) {
  phoneHero.addEventListener('mousemove', (e) => {
    isHeroHovered = true;
    if (heroLookTimer) { clearTimeout(heroLookTimer); heroLookTimer = null; }
    const rect = phoneHero.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    heroTargetTx = Math.max(-1, Math.min(1, dx)) * heroMaxDist;
    heroTargetTy = Math.max(-1, Math.min(1, dy)) * heroMaxDist;
  });
  phoneHero.addEventListener('mouseleave', () => {
    isHeroHovered = false;
    heroTargetTx = 0;
    heroTargetTy = 0;
    setTimeout(randomHeroLook, 1000);
  });
}

// ─── BLINK UTILS ────────────────────────────────────────────
function blinkEye(eye) {
  if (!eye) return;
  eye.classList.remove('blink-anim');
  void eye.offsetWidth; // reflow
  eye.classList.add('blink-anim');
  eye.addEventListener('animationend', () => eye.classList.remove('blink-anim'), { once: true });
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

scheduleBlink('hero', [heroLeftEye, heroRightEye]);

// ─── PERSONALITY EYES — BLINK ───────────────────────────────
const persLeft  = document.getElementById('pers-left');
const persRight = document.getElementById('pers-right');
if (persLeft && persRight) scheduleBlink('pers', [persLeft, persRight], 2500, 6000);

// ─── DEMO STATE ──────────────────────────────────────────────
const demoPhone     = document.getElementById('demo-phone');
const demoFace      = document.getElementById('demo-face');
const demoSleeping  = document.getElementById('demo-sleeping');
const demoGlow      = document.getElementById('demo-glow');
const statusDot     = document.getElementById('status-dot');
const statusText    = document.getElementById('status-text');
const wakeBtn       = document.getElementById('wake-btn-demo');
const breatheBtn    = document.getElementById('breathe-btn');
const sleepingEgg   = document.getElementById('sleeping-egg');

let demoAwake  = false;
let demoWaking = false;
let isLandscape = false;
let isDemoHovered = false;

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
  
  demoFace.classList.add('visible');
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
    // Remove inline transitions so JS lerp can take over tracking
    demoLeftEye.style.transition = '';
    demoRightEye.style.transition = '';
    
    demoTargetTx = -demoMaxDist * 0.7;
    demoTargetTy = demoMaxDist * 0.3;
  }, 2000);
  setTimeout(() => { demoTargetTx = demoMaxDist * 0.8; demoTargetTy = -demoMaxDist * 0.2; }, 2550);
  setTimeout(() => { demoTargetTx = demoMaxDist * 0.1; demoTargetTy = demoMaxDist * 0.4; }, 3100);
  setTimeout(() => { demoTargetTx = 0; demoTargetTy = 0; }, 3600);

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
  demoTargetTx = 0; demoTargetTy = 0;
  
  demoPhone.classList.remove('awake');
  demoGlow.classList.remove('active');
  demoFace.classList.remove('visible');
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
function startDemoLookAround() {
  if (demoLookTimer) clearTimeout(demoLookTimer);
  randomDemoLook();
}
function randomDemoLook() {
  if (!demoAwake || isDemoHovered) return;
  demoTargetTx = (Math.random() - 0.5) * demoMaxDist * 1.5;
  demoTargetTy = (Math.random() - 0.5) * demoMaxDist;
  demoLookTimer = setTimeout(randomDemoLook, 1600 + Math.random() * 2600);
}

demoPhone.addEventListener('mousemove', (e) => {
  if (!demoAwake) return;
  isDemoHovered = true;
  if (demoLookTimer) { clearTimeout(demoLookTimer); demoLookTimer = null; }
  
  const rect = demoPhone.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  
  // Factor in landscape wider bounding box
  const boundX = isLandscape ? 14 : 10;
  const boundY = isLandscape ?  6 :  8;
  
  const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width / 2)));
  const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height / 2)));
  
  demoTargetTx = nx * boundX;
  demoTargetTy = ny * boundY;
});
demoPhone.addEventListener('mouseleave', () => {
  if (!demoAwake) return;
  isDemoHovered = false;
  demoTargetTx = 0;
  demoTargetTy = 0;
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
  if (demoAwake) {
    demoTargetTx = 0; demoTargetTy = 0;
  }
}

// ─── SLEEPING EGG — EASTER EGG CLICK ────────────────────────
if (sleepingEgg) {
  sleepingEgg.addEventListener('click', () => {
    document.getElementById('demo').scrollIntoView({ behavior: 'smooth' });
    sleepingEgg.classList.add('waking');
    setTimeout(() => sleepingEgg.classList.remove('waking'), 500);
    setTimeout(() => {
      if (!demoAwake && !demoWaking) {
        wakeReznik();
        if (wakeBtn) wakeBtn.textContent = 'Put to Sleep';
      }
    }, 900);
  });
}

// ─── PARALLAX ON HERO ───────────────────────────────────────
window.addEventListener('scroll', () => {
  if (phoneHero) phoneHero.style.transform = `translateY(${window.scrollY * 0.08}px)`;
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 40);
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

// ─── SCROLL REVEAL ──────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.card, .section-title, .section-tag').forEach(el => { el.classList.add('reveal'); revealObserver.observe(el); });

const featureObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.feature-card').forEach(c => featureObserver.observe(c));

const pipelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.2 });
document.querySelectorAll('.pipeline-step, .pipeline-arrow').forEach(el => pipelineObserver.observe(el));

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
if (document.querySelector('.bubbles-scene')) bubbleObserver.observe(document.querySelector('.bubbles-scene'));

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

console.log('%c Reznik v3 — clay, 60fps, cursor. ', 'background:#1A1A1A; color:#D6453D; font-family:Georgia,serif; font-size:13px; padding:6px 14px; border-radius:4px; font-style:italic;');
