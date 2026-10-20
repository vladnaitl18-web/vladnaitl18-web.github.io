const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pages = Array.from(document.querySelectorAll('.page'));
const byId = (id) => pages.find((p) => p.id === id) || pages[0];
let current = pages.find((p) => !p.hidden) || pages[0];
let busy = false;

// only a few loops decode at once: the best-visible ones on the current page
const hydrate = (v) => {
  if (v.dataset.poster && !v.poster) v.poster = v.dataset.poster;
  if (v.classList.contains('loop') && v.dataset.src && !v.getAttribute('src')) v.src = v.dataset.src;
};
const nearIO = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { hydrate(e.target); nearIO.unobserve(e.target); } }), { rootMargin: '600px 0px' });
document.querySelectorAll('video[data-poster]').forEach((v) => nearIO.observe(v));
const loops = Array.from(document.querySelectorAll('video.loop'));
const MAX_PLAYING = window.matchMedia('(max-width: 700px)').matches ? 4 : 8;
const ratios = new Map();
let frozen = false;
let queued = false;
const applyPlayback = () => {
  queued = false;
  const mid = window.innerHeight / 2;
  const ranked = frozen ? [] : loops
    .filter((v) => (ratios.get(v) || 0) > 0.2 && !v.closest('.page').hidden)
    .map((v) => { const r = v.getBoundingClientRect(); return { v, score: (ratios.get(v) || 0) * 2 - Math.abs(r.top + r.height / 2 - mid) / window.innerHeight }; })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PLAYING)
    .map((x) => x.v);
  const on = new Set(ranked);
  loops.forEach((v) => {
    if (on.has(v)) {
      hydrate(v);
      if (v.preload === 'none') v.preload = 'auto';
      if (v.paused) v.play().catch(() => {});
    } else if (!v.paused) v.pause();
  });
};
const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(applyPlayback); } };
const vis = new IntersectionObserver((entries) => {
  entries.forEach((e) => ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
  schedule();
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });
loops.forEach((v) => { v.muted = true; vis.observe(v); });
pages.forEach((p) => p.addEventListener('scroll', schedule, { passive: true }));
const freeze = (on) => { if (on) stopScreens(); frozen = on; document.body.classList.toggle('is-flipping', on); if (on) applyPlayback(); else schedule(); };

let typer = 0;
const typed = new Set();
const typeParts = (npc, parts, instant) => {
  parts.forEach((el) => { if (!el.dataset.full) el.dataset.full = el.textContent.trim(); });
  clearInterval(typer);
  const finishAll = () => { parts.forEach((el) => { el.textContent = el.dataset.full; el.classList.remove('typing'); el.closest('li')?.classList.add('shown'); }); npc.classList.add('done'); };
  if (reduced || instant) { finishAll(); return; }
  npc.classList.remove('done');
  parts.forEach((el) => { el.textContent = ''; el.closest('li')?.classList.remove('shown'); });
  let k = 0, n = 0;
  typer = setInterval(() => {
    const el = parts[k];
    if (!el) { clearInterval(typer); finishAll(); return; }
    el.closest('li')?.classList.add('shown');
    n += 2;
    el.classList.add('typing');
    el.textContent = el.dataset.full.slice(0, n);
    if (n >= el.dataset.full.length) { el.classList.remove('typing'); k += 1; n = 0; }
  }, 22);
};
const npcParts = (npc) => Array.from(npc.querySelectorAll('.npc__box > [data-type]'));
const typeNpc = (page) => {
  const npc = page.querySelector('.npc');
  if (!npc) return;
  npc.querySelectorAll('.npc__nets li').forEach((li, i) => li.style.setProperty('--i', i));
  const first = !typed.has(page.id);
  typed.add(page.id);
  typeParts(npc, npcParts(npc), !first);
};
// experience donut with arrow labels
const XP = [
  { t: 'Flutter · 2+ года', d: 'приложения и игры для iOS и Android', c: '--c-gm' },
  { t: 'QA', d: 'тестирование мобильных приложений', c: '--qa' },
  { t: 'ИИ-видео', d: 'фильмы и рекламные креативы', c: '--c-films' },
  { t: 'Playable ads', d: 'на Cocos Creator', c: '--c-pl' },
  { t: 'Автоматизация', d: 'конвейеры, боты, скрипты', c: '--c-tl' },
  { t: 'Преподавание', d: 'Python, Scratch и ИИ в онлайн-школах', c: '--c-cr' },
];
const xp = document.getElementById('xp');
const buildXp = () => {
  const css = getComputedStyle(document.documentElement);
  const col = (v) => css.getPropertyValue(v === '--qa' ? '--c-qa' : v).trim();
  const W = 960, H = 460, cx = W / 2, cy = H / 2, r = 120, sw = 46, n = XP.length, gap = 4;
  const ns = 'http://www.w3.org/2000/svg';
  const pt = (a, rr) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
  const vb = window.innerWidth < 900 ? `${cx - 175} ${cy - 175} 350 350` : `0 0 ${W} ${H}`;
  let svg = `<svg viewBox="${vb}" xmlns="${ns}" aria-hidden="true">`;
  svg += `<defs><marker id="xpArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z" fill="currentColor"/></marker></defs>`;
  svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" style="stroke:var(--k)" stroke-width="${sw + 10}"/>`;
  const C = 2 * Math.PI * r;
  const seg = 360 / n;
  XP.forEach((x, i) => {
    const a0 = -90 + i * seg + gap / 2, a1 = -90 + (i + 1) * seg - gap / 2;
    const len = ((a1 - a0) / 360) * C;
    const c = col(x.c);
    svg += `<circle class="xp__seg" style="--d:${i * 0.16}s;--len:${len.toFixed(1)}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}"
      stroke-dasharray="${len.toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${len.toFixed(1)}" transform="rotate(${a0} ${cx} ${cy})"/>`;
    const am = ((a0 + a1) / 2) * Math.PI / 180;
    const right = Math.cos(am) >= 0;
    const [x1, y1] = pt(am, r + sw / 2 + 6);
    const [x2, y2] = pt(am, r + sw / 2 + 34);
    const x3 = right ? cx + 205 : cx - 205;
    svg += `<polyline class="xp__line" style="--d:${0.5 + i * 0.16}s;color:${c}" points="${x3},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${c}" stroke-width="3" marker-end="url(#xpArrow)"/>`;
    const tx = right ? x3 + 8 : x3 - 8, anchor = right ? 'start' : 'end';
    svg += `<g class="xp__lbl" style="--d:${0.7 + i * 0.16}s"><text x="${tx}" y="${(y2 - 4).toFixed(1)}" text-anchor="${anchor}" fill="${c}" class="xp__t">${x.t}</text>`;
    svg += `<text x="${tx}" y="${(y2 + 16).toFixed(1)}" text-anchor="${anchor}" class="xp__d">${x.d}</text></g>`;
  });
  const stops = XP.map((x, i) => `<stop offset="${(i / (XP.length - 1)).toFixed(2)}" stop-color="${col(x.c)}"/>`).join('');
  const ir = r - sw / 2 - 16;
  svg += `<defs><linearGradient id="xpGrad" x1="0" y1="0" x2="1" y2="1">${stops}<animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="7s" repeatCount="indefinite"/></linearGradient>
    <radialGradient id="xpShine" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`;
  svg += `<g class="xp__core"><circle cx="${cx}" cy="${cy}" r="${ir}" fill="url(#xpGrad)"/><circle cx="${cx}" cy="${cy}" r="${ir}" fill="url(#xpShine)"/>
    <circle cx="${cx}" cy="${cy}" r="${ir}" fill="none" style="stroke:var(--k)" stroke-width="6"/></g>`;
  svg += '</svg>';
  document.getElementById('xpChart').innerHTML = svg;
  document.getElementById('xpLegend').innerHTML = XP.map((x, i) => `<li style="--c:${col(x.c)};--d:${0.6 + i * 0.12}s"><b>${x.t}</b><span>${x.d}</span></li>`).join('');
};
const openXp = () => {
  buildXp();
  xp.hidden = false;
  xp.classList.remove('on');
  void xp.offsetWidth;
  xp.classList.add('on');
};
window.addEventListener('resize', () => { if (!xp.hidden) buildXp(); });
const closeXp = () => { xp.classList.remove('on'); setTimeout(() => { xp.hidden = true; }, 200); };
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-exp]')) return openXp();
  if (e.target.closest('[data-xp-close]') || e.target === xp) closeXp();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !xp.hidden) { e.stopImmediatePropagation(); closeXp(); } }, true);
const enter = (page) => {
  if (typed.has(page.id)) typeNpc(page); else setTimeout(() => typeNpc(page), page.id === 'home' ? 250 : 350);
  page.querySelectorAll('.phead, .ptitle, .npc, .proj, .auto, .qa, .sub, .work, .exp li, .intro > *, .door').forEach((el, i) => el.style.setProperty('--d', Math.min(i, 14) * 0.045));
  page.classList.remove('enter');
  void page.offsetWidth;
  page.classList.add('enter');
};

const shade = (page, bg, from, to, opts) => {
  const s = document.createElement('div');
  s.className = 'shade';
  s.style.background = bg;
  s.style.top = page.scrollTop + 'px';
  s.style.height = page.clientHeight + 'px';
  s.style.bottom = 'auto';
  page.appendChild(s);
  s.animate([{ opacity: from }, { opacity: to }], { fill: 'forwards', ...opts }).onfinish = () => s.remove();
};

// horizontal page turn, hinged on the left edge like a book
const topSec = document.getElementById('topSec');
const setPlate = (page) => {
  const on = page.id !== 'home';
  document.body.classList.toggle('in-section', on);
  if (!on) { topSec.hidden = true; return; }
  topSec.style.setProperty('--c', getComputedStyle(page).getPropertyValue('--c'));
  topSec.querySelector('img').src = page.dataset.art;
  topSec.querySelector('.top__sec-t').textContent = (window.innerWidth <= 760 && page.dataset.short) || page.dataset.title;
  topSec.querySelector('.top__sec-s').textContent = page.dataset.sub;
  topSec.hidden = false;
  topSec.style.animation = 'none';
  void topSec.offsetWidth;
  topSec.style.animation = '';
};

const turn = (to, { push = true } = {}) => {
  if (busy || to === current) return;
  const from = current;
  const forward = Number(to.dataset.i) > Number(from.dataset.i);
  if (push) history.pushState({ id: to.id }, '', to.id === 'home' ? location.pathname : '#' + to.id);
  to.scrollTop = 0;
  to.hidden = false;
  current = to;
  setPlate(to);
  if (reduced) { from.hidden = true; from.classList.remove('enter'); if (forward) enter(to); schedule(); return; }
  busy = true;
  freeze(true);
  const dur = 820;
  const moving = forward ? from : to;
  const still = forward ? to : from;
  moving.style.zIndex = 2;
  still.style.zIndex = 1;
  moving.classList.add('flipping');
  // a page lifts, bends slightly and swings over its left edge
  const turnKF = [
    { transform: 'rotateY(0deg) translateZ(0) skewY(0deg)', offset: 0 },
    { transform: 'rotateY(-18deg) translateZ(30px) skewY(-1.2deg)', offset: 0.28 },
    { transform: 'rotateY(-62deg) translateZ(20px) skewY(-2deg)', offset: 0.65 },
    { transform: 'rotateY(-92deg) translateZ(0) skewY(0deg)', offset: 1 },
  ];
  const kf = forward ? turnKF : turnKF.slice().reverse().map((k) => ({ ...k, offset: 1 - k.offset }));
  const a = moving.animate(kf, { duration: dur, easing: forward ? 'cubic-bezier(.45,.05,.35,1)' : 'cubic-bezier(.4,0,.3,1)' });
  shade(moving, 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.15) 55%, rgba(0,0,0,.7) 100%)', forward ? 0 : 1, forward ? 1 : 0, { duration: dur, easing: 'ease-in' });
  shade(still, 'linear-gradient(90deg, rgba(0,0,0,.75), rgba(0,0,0,.35))', forward ? 1 : 0, forward ? 0 : 1, { duration: dur, easing: forward ? 'ease-out' : 'ease-in' });
  still.animate(forward
    ? [{ transform: 'scale(.97) translateX(-12px)' }, { transform: 'none' }]
    : [{ transform: 'none' }, { transform: 'scale(.97) translateX(-12px)' }],
  { duration: dur, easing: 'cubic-bezier(.3,.6,.3,1)' });
  if (forward) enter(to);
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    a.cancel();
    [from, to].forEach((p) => p.querySelectorAll('.shade').forEach((x) => x.remove()));
    from.hidden = true;
    from.classList.remove('enter');
    moving.classList.remove('flipping');
    moving.style.zIndex = '';
    still.style.zIndex = '';
    busy = false;
    freeze(false);
  };
  a.onfinish = finish;
  setTimeout(finish, dur + 400);
};

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) turn(byId(go.dataset.go));
});
window.addEventListener('popstate', () => turn(byId(location.hash.slice(1) || 'home'), { push: false }));

// swipe right = back to the previous page, swipe left = next
let sx = 0, sy = 0, st = 0;
let skip = false;
document.getElementById('book').addEventListener('touchstart', (e) => { skip = !!e.target.closest('.grid--pl'); const t = e.touches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
document.getElementById('book').addEventListener('touchend', (e) => {
  if (skip) return;
  const t = e.changedTouches[0];
  const dx = t.clientX - sx, dy = t.clientY - sy;
  if (Date.now() - st > 600 || Math.abs(dx) < 80 || Math.abs(dy) > Math.abs(dx) * 0.6) return;
  const i = Number(current.dataset.i);
  if (dx > 0 && i > 0) turn(i === 1 ? byId('home') : pages[i - 1]);
  if (dx < 0 && i > 0 && i < pages.length - 1) turn(pages[i + 1]);
}, { passive: true });

const start = location.hash.slice(1);
if (start && byId(start) !== pages[0]) {
  pages.forEach((p) => { p.hidden = p.id !== start; });
  current = byId(start);
  history.replaceState({ id: start }, '', '#' + start);
}
setPlate(current);
// boot: a short pixel loader, then the book opens
const boot = document.getElementById('boot');
const cells = document.getElementById('bootCells');
const pctEl = document.getElementById('bootPct');
const hintEl = document.getElementById('bootHint');
const CELL_COLORS = ['--c-films', '--c-films', '--c-films', '--c-gm', '--c-gm', '--c-gm', '--c-pl', '--c-pl', '--c-pl', '--c-tl', '--c-tl', '--c-tl'];
cells.innerHTML = CELL_COLORS.map((c) => `<i style="--cc: var(${c})"></i>`).join('');
const cellEls = Array.from(cells.children);
const HINTS = ['включаю город…', 'монтирую фильмы…', 'собираю игры…', 'готово!'];
const firstImgs = Array.from(current.querySelectorAll('img')).slice(0, 8);
let doneN = 0, shown = 0, target = 6;
const total = firstImgs.length + 1;
const tick = () => { doneN += 1; target = Math.max(target, (doneN / total) * 100); };
const imgReady = (img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }); })).then(() => (img.decode ? img.decode().catch(() => {}) : null)).then(tick);
const t0 = performance.now();
let loaded = false;
Promise.race([
  Promise.all([(document.fonts ? document.fonts.ready : Promise.resolve()).then(tick), ...firstImgs.map(imgReady)]),
  new Promise((r) => setTimeout(r, 3500)),
]).then(() => { loaded = true; target = 100; });
const MIN = reduced ? 0 : 1100;
const bootTimer = setInterval(() => {
  const cap = loaded ? 100 : Math.min(target, 92);
  shown += (cap - shown) * 0.18 + 0.4;
  if (shown > cap) shown = cap;
  const lit = Math.round((shown / 100) * cellEls.length);
  cellEls.forEach((c, i) => c.classList.toggle('on', i < lit));
  pctEl.textContent = Math.round(shown) + '%';
  hintEl.textContent = HINTS[Math.min(HINTS.length - 1, Math.floor((shown / 100) * (HINTS.length - 1)))];
  if (loaded && shown >= 99.5 && performance.now() - t0 >= MIN) {
    clearInterval(bootTimer);
    if (window.__rebuildScenes) window.__rebuildScenes();
    setTimeout(() => {
      document.body.classList.add('ready');
      setTimeout(() => enter(current), 250);
      setTimeout(() => boot.remove(), 1100);
    }, 180);
  }
}, 30);


// games / subscription switcher with a sliding pill
document.querySelectorAll('.seg').forEach((seg) => {
  const btns = Array.from(seg.querySelectorAll('.seg__btn'));
  const pill = seg.querySelector('.seg__pill');
  const place = () => { const on = btns.find((b) => b.classList.contains('is-on')); pill.style.width = on.offsetWidth + 'px'; pill.style.transform = `translateX(${on.offsetLeft}px)`; };
  new ResizeObserver(place).observe(seg);
  document.fonts && document.fonts.ready.then(place);
  let swapping = false;
  btns.forEach((b, i) => b.addEventListener('click', () => {
    const cur = btns.findIndex((x) => x.classList.contains('is-on'));
    if (i === cur || swapping) return;
    const from = document.getElementById(btns[cur].dataset.pane);
    const to = document.getElementById(b.dataset.pane);
    const fwd = i > cur;
    btns.forEach((x, k) => { x.classList.toggle('is-on', k === i); x.setAttribute('aria-selected', k === i); });
    place();
    const show = () => {
      from.hidden = true;
      from.classList.remove('out-l', 'out-r', 'is-on');
      to.hidden = false;
      to.classList.add('is-on', fwd ? 'in-r' : 'in-l');
      setTimeout(() => to.classList.remove('in-r', 'in-l'), 460);
      swapping = false;
      schedule();
    };
    if (reduced) return show();
    swapping = true;
    from.classList.add(fwd ? 'out-l' : 'out-r');
    setTimeout(show, 220);
  }));
});

// full videos with sound: start on demand, only one at a time
const screens = Array.from(document.querySelectorAll('.screen'));
const stopScreens = (except) => screens.forEach((sc) => { const v = sc.querySelector('video'); if (sc !== except && !v.paused) v.pause(); });
screens.forEach((sc) => {
  const v = sc.querySelector('video');
  sc.querySelector('.screen__play').addEventListener('click', () => {
    stopScreens(sc);
    sc.classList.add('is-on');
    hydrate(v);
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.controls = true;
    v.preload = 'auto';
    v.play().catch(() => {});
  });
  v.addEventListener('play', () => stopScreens(sc));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && current.id !== 'home') turn(byId('home'));
});

// day / night theme
const themeBtn = document.getElementById('themeBtn');
const applyTheme = (day) => {
  if (day) document.documentElement.dataset.theme = 'day'; else delete document.documentElement.dataset.theme;
  themeBtn.setAttribute('aria-label', day ? 'Ночная тема' : 'Дневная тема');
  document.querySelector('meta[name="theme-color"]').setAttribute('content', day ? '#f1e3bf' : '#0c0b0f');
  if (window.__rebuildScenes) window.__rebuildScenes();
  if (!xp.hidden) buildXp();
  try { localStorage.setItem('theme', day ? 'day' : 'night'); } catch (e) {}
};
themeBtn.setAttribute('aria-label', document.documentElement.dataset.theme === 'day' ? 'Ночная тема' : 'Дневная тема');
themeBtn.addEventListener('click', () => {
  const day = document.documentElement.dataset.theme !== 'day';
  if (document.startViewTransition && !reduced && document.visibilityState === 'visible') {
    const vt = document.startViewTransition(() => applyTheme(day));
    [vt.ready, vt.finished, vt.updateCallbackDone].forEach((p) => p.catch(() => {}));
  }
  else applyTheme(day);
});
