// year
document.getElementById('year').textContent = new Date().getFullYear();

// nav scroll state
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// burger menu
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  burger.classList.toggle('x');
});
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('x');
  })
);

// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.06 + 's';
  io.observe(el);
});

// count up
const countEls = document.querySelectorAll('[data-count]');
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.max(1, Math.round(target / 36));
    const run = () => {
      cur = Math.min(target, cur + step);
      el.textContent = cur + suffix;
      if (cur < target) requestAnimationFrame(run);
    };
    run();
    cio.unobserve(el);
  });
}, { threshold: 0.5 });
countEls.forEach((el) => cio.observe(el));

// skills slider
const skTabs = Array.from(document.querySelectorAll('.skills__tab'));
const skTrack = document.getElementById('skillTrack');
const skVp = document.getElementById('skillVp');
const skInd = document.getElementById('skillInd');
const skPanels = Array.from(document.querySelectorAll('.skills__panel'));
if (skTabs.length && skTrack) {
  let skActive = 0;
  const skSelect = (i) => {
    skActive = i;
    skTabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
    skTrack.style.transform = `translateX(${-i * 100}%)`;
    skVp.style.height = skPanels[i].offsetHeight + 'px';
    skInd.style.left = skTabs[i].offsetLeft + 'px';
    skInd.style.width = skTabs[i].offsetWidth + 'px';
    skTabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  skTabs.forEach((t, i) => t.addEventListener('click', () => skSelect(i)));
  window.addEventListener('load', () => skSelect(skActive));
  window.addEventListener('resize', () => skSelect(skActive));
  skSelect(0);
}

// theater spotlight
const spot = document.getElementById('spotlight');
if (spot && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
  // hide the spotlight while scrolling so it doesn't repaint the full screen each frame
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    document.body.classList.add('is-scrolling');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => document.body.classList.remove('is-scrolling'), 160);
  }, { passive: true });

  if (window.matchMedia('(hover:hover)').matches) {
    // follow the cursor, but stop repainting when settled
    spot.style.setProperty('--sr', '340px');
    let mx = window.innerWidth / 2, my = window.innerHeight * 0.4, sx = mx, sy = my, rafId = null;
    const step = () => {
      const dx = mx - sx, dy = my - sy;
      sx += dx * 0.16;
      sy += dy * 0.16;
      spot.style.setProperty('--sx', sx.toFixed(1) + 'px');
      spot.style.setProperty('--sy', sy.toFixed(1) + 'px');
      rafId = (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) ? requestAnimationFrame(step) : null;
    };
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (rafId == null) rafId = requestAnimationFrame(step);
    }, { passive: true });
    step();
  } else {
    // touch fallback: highlight the element nearest viewport center on scroll
    const targets = Array.from(document.querySelectorAll('.dossier, .work, .fcard, .terminal, .contact__card'));
    let ticking = false;
    const place = () => {
      ticking = false;
      const cy = window.innerHeight / 2;
      let best = null, bestD = Infinity;
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > window.innerHeight + 40) continue;
        const ey = r.top + r.height / 2;
        const d = Math.abs(ey - cy);
        if (d < bestD) { bestD = d; best = r; }
      }
      if (!best) return;
      const rad = Math.min(560, Math.max(260, Math.max(best.width, best.height) * 0.62 + 150));
      spot.style.setProperty('--sx', (best.left + best.width / 2).toFixed(0) + 'px');
      spot.style.setProperty('--sy', (best.top + best.height / 2).toFixed(0) + 'px');
      spot.style.setProperty('--sr', rad.toFixed(0) + 'px');
    };
    const onMove = () => { if (!ticking) { ticking = true; requestAnimationFrame(place); } };
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    place();
  }
}

// custom cursor
const dot = document.getElementById('cursorDot');
if (dot && window.matchMedia('(hover:hover)').matches) {
  let x = 0, y = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
  const loop = () => {
    tx += (x - tx) * 0.25; ty += (y - ty) * 0.25;
    dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.querySelectorAll('a,button,.work,.fcard,.chip').forEach((el) => {
    el.addEventListener('mouseenter', () => dot.classList.add('big'));
    el.addEventListener('mouseleave', () => dot.classList.remove('big'));
  });
}

// subtle tilt on work cards
document.querySelectorAll('.work').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-6px) perspective(900px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});
