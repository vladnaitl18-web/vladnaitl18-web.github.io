// Pixel-art night city drawn into a low-res canvas behind each page.
(() => {
  const PX = 4;
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const SKY = ['#07060d', '#0a0916', '#0e0c1f', '#131029', '#191533', '#1f1a3a'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STAR = Array.from({ length: 10 }, (_, i) => `rgba(236,230,214,${(i / 10).toFixed(1)})`);

  const rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`; };

  class Scene {
    constructor(canvas) {
      this.c = canvas;
      this.ctx = canvas.getContext('2d');
      this.accents = canvas.dataset.colors.split(',');
      this.seed = Number(canvas.dataset.seed || 7);
      this.base = document.createElement('canvas');
      this.t = 0;
    }

    resize() {
      const book = document.getElementById('book');
      const bw = book.clientWidth, bh = book.clientHeight;
      if (!bw || !bh) return;
      const W = Math.ceil(bw / PX), H = Math.ceil(bh / PX);
      if (W === this.W && H === this.H) return;
      this.W = W; this.H = H;
      this.c.width = W; this.c.height = H;
      this.base.width = W; this.base.height = H;
      this.build();
      this.draw(true);
    }

    build() {
      const { W, H } = this;
      const rand = rng(this.seed);
      const b = this.base.getContext('2d');
      const tint = this.accents[0];

      const sky = SKY.map(hex), tc = hex(tint);
      const low = sky.map((c) => c.map((v, k) => Math.round(v + (tc[k] - v) * 0.05)));
      const img = b.createImageData(W, H);
      const d = img.data;
      for (let y = 0; y < H; y++) {
        const f = (y / H) * (SKY.length - 1);
        const i = Math.min(SKY.length - 2, Math.floor(f));
        const t = f - i;
        const pal = y > H * 0.6 ? low : sky;
        for (let x = 0; x < W; x++) {
          const c = pal[BAYER[y & 3][x & 3] / 16 < t ? i + 1 : i];
          const o = (y * W + x) * 4;
          d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
        }
      }
      b.putImageData(img, 0, 0);

      const mx = Math.round(W * 0.84), my = Math.round(H * 0.15), mr = Math.max(5, Math.round(Math.min(W, H) * 0.06));
      for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) {
        const d = x * x + y * y;
        if (d > mr * mr) continue;
        const cut = (x + mr * 0.45) ** 2 + (y - mr * 0.25) ** 2 < (mr * 0.9) ** 2;
        if (cut) continue;
        b.fillStyle = d > (mr - 1) ** 2 ? '#bdb595' : '#e8e1c4';
        b.fillRect(mx + x, my + y, 1, 1);
      }
      b.fillStyle = 'rgba(232,225,196,.07)';
      for (let y = -mr * 2; y <= mr * 2; y++) for (let x = -mr * 2; x <= mr * 2; x++) {
        if (x * x + y * y < (mr * 2) ** 2 && BAYER[(y + 99) % 4][(x + 99) % 4] < 3) b.fillRect(mx + x, my + y, 1, 1);
      }

      this.stars = [];
      const n = Math.round((W * H) / 70);
      for (let k = 0; k < n; k++) {
        const y = Math.floor(rand() * H * 0.62);
        this.stars.push({ x: Math.floor(rand() * W), y, lvl: rand(), ph: rand() * 6.28, sp: 0.6 + rand() * 1.6 });
      }

      this.clouds = [];
      for (let k = 0; k < 4; k++) {
        this.clouds.push({ x: rand() * W, y: Math.floor(H * (0.18 + rand() * 0.3)), w: 14 + Math.floor(rand() * 26), sp: 0.03 + rand() * 0.05 });
      }

      this.windows = [];
      const skyline = (yBase, minH, maxH, minW, maxW, body, litP, dim) => {
        let x = -Math.floor(rand() * 6);
        while (x < W) {
          const w = minW + Math.floor(rand() * (maxW - minW));
          const h = Math.floor(H * (minH + rand() * (maxH - minH)));
          const top = yBase - h;
          b.fillStyle = body;
          b.fillRect(x, top, w, h);
          if (rand() < 0.35) b.fillRect(x + Math.floor(w / 2) - 1, top - 3, 2, 3);
          if (rand() < 0.2) b.fillRect(x + 1, top - 1, w - 2, 1);
          const color = this.accents[Math.floor(rand() * this.accents.length)];
          for (let wy = top + 2; wy < yBase - 2; wy += 3) {
            for (let wx = x + 2; wx < x + w - 1; wx += 3) {
              if (rand() < litP) {
                const c = mix(color, '#0b0a16', dim + rand() * 0.25);
                this.windows.push({ x: wx, y: wy, c, flick: rand() < 0.08, ph: rand() * 50 });
              } else if (rand() < 0.5) {
                b.fillStyle = body === '#0a0812' ? '#0e0c18' : '#17142a';
                b.fillRect(wx, wy, 1, 1);
              }
            }
          }
          x += w + (rand() < 0.3 ? 1 + Math.floor(rand() * 3) : 0);
        }
      };
      skyline(H - 2, 0.16, 0.34, 7, 15, '#120f22', 0.14, 0.45);
      skyline(H - 1, 0.08, 0.2, 9, 20, '#0a0812', 0.2, 0.2);
      b.fillStyle = '#06050a';
      b.fillRect(0, H - 2, W, 2);
    }

    draw(force) {
      if (!this.W) return;
      const { ctx, W, H } = this;
      const t = this.t;
      ctx.drawImage(this.base, 0, 0);
      for (const s of this.stars) {
        const tw = reduced ? 0.6 : (Math.sin(t * s.sp + s.ph) + 1) / 2;
        const a = 0.25 + s.lvl * 0.5 * (0.4 + tw * 0.6);
        ctx.fillStyle = STAR[Math.min(9, Math.round(a * 10))];
        ctx.fillRect(s.x, s.y, 1, 1);
        if (s.lvl > 0.93 && tw > 0.7) {
          ctx.fillStyle = STAR[Math.round(a * 4.5)];
          ctx.fillRect(s.x - 1, s.y, 1, 1); ctx.fillRect(s.x + 1, s.y, 1, 1);
          ctx.fillRect(s.x, s.y - 1, 1, 1); ctx.fillRect(s.x, s.y + 1, 1, 1);
        }
      }
      ctx.fillStyle = 'rgba(40,34,70,.55)';
      for (const c of this.clouds) {
        const x = Math.floor(((c.x + t * c.sp * 10) % (W + c.w)) - c.w);
        ctx.fillRect(x, c.y, c.w, 1);
        ctx.fillRect(x + 3, c.y - 1, c.w - 8, 1);
        ctx.fillRect(x + 6, c.y - 2, Math.max(2, c.w - 16), 1);
      }
      for (const w of this.windows) {
        if (w.flick && !reduced && Math.sin(t * 0.7 + w.ph) > 0.85) continue;
        ctx.fillStyle = w.c;
        ctx.fillRect(w.x, w.y, 1, 1);
      }
      if (!reduced) {
        const cyc = (t * 0.12) % 9;
        if (cyc < 1) {
          const sx = Math.floor(W * 0.15 + cyc * W * 0.45), sy = Math.floor(H * 0.08 + cyc * H * 0.12);
          for (let k = 0; k < 6; k++) {
            ctx.fillStyle = `rgba(240,234,214,${(0.7 - k * 0.11).toFixed(2)})`;
            ctx.fillRect(sx - k * 2, sy - k, 2, 1);
          }
        }
      }
    }
  }

  const scenes = Array.from(document.querySelectorAll('canvas.scene')).map((c) => new Scene(c));
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => scenes.forEach((s) => s.resize()), 150); });
  scenes.forEach((s, i) => idle(() => s.resize(), { timeout: 1500 + i * 300 }));

  let last = 0;
  const loop = (now) => {
    if (now - last > 160 && !document.body.classList.contains('is-flipping')) {
      last = now;
      for (const s of scenes) {
        if (s.c.closest('.page').hidden) continue;
        if (!s.W) s.resize();
        if (!s.W) continue;
        s.t += 0.16;
        s.draw();
      }
    }
    if (!reduced) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  window.__scenes = scenes;
})();
