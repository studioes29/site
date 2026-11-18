/* Studio ES : la matière des gestes. Les cartes se prennent comme des tirages, la préparation de l'aperçu est un fil qui travaille puis se tend.
   Tout est facultatif : mouvement réduit ou écran tactile, et le site se comporte comme avant. */
(() => {
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent =
    '.nu.ph-tient{transition:box-shadow .3s ease;will-change:transform}' +
    '.lb img{cursor:grab}.lb.saisi,.lb.saisi img{cursor:grabbing}' +
    '.ae-prog .bar.ph-fil{overflow:visible;background:none}.ae-prog .bar.ph-fil i{display:none}' +
    '.ae-prog .bar.ph-fil svg{position:absolute;left:0;top:50%;width:100%;height:18px;margin-top:-9px;overflow:visible}' +
    '.ae-prog .bar.ph-fil path{fill:none;stroke-linecap:round;stroke-width:6px}.ae-prog .bar.ph-fil .pf{stroke:rgba(255,255,255,.14)}.ae-prog .bar.ph-fil .pa{stroke:#fff}';
  document.head.appendChild(css);

  /* ---------- 1. les cartes des réalisations : un tirage qu'on soulève, qui penche sous la main et retombe en ressort ---------- */
  if (!reduit && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const M = new WeakMap();
    let actifs = new Set(), raf = 0;
    const etat = c => { let e = M.get(c); if (!e) { e = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, tx: 0, ty: 0, tz: 0, s: 1, vs: 0, ts: 1 }; M.set(c, e); } return e; };
    let avant = 0;
    const pas = t => {
      raf = 0; const dt = Math.min(.032, (t - avant) / 1000 || .016); avant = t;
      actifs.forEach(c => {
        const e = etat(c); let repos = true;
        [['x', 'vx', 'tx'], ['y', 'vy', 'ty'], ['z', 'vz', 'tz'], ['s', 'vs', 'ts']].forEach(([p, v, c2]) => {
          const a = (e[c2] - e[p]) * 210 - e[v] * 19; e[v] += a * dt; e[p] += e[v] * dt;
          if (Math.abs(e[c2] - e[p]) > .002 || Math.abs(e[v]) > .02) repos = false;
        });
        if (repos && !e.tz) { actifs.delete(c); c.style.transform = ''; c.style.boxShadow = ''; c.style.zIndex = ''; c.classList.remove('ph-tient'); return; }
        c.style.transform = `perspective(900px) translateY(${(-6 * e.z).toFixed(2)}px) rotateX(${e.x.toFixed(2)}deg) rotateY(${e.y.toFixed(2)}deg) scale(${e.s.toFixed(4)})`;
        c.style.boxShadow = `0 1px 0 rgba(32,32,32,.04),${(-e.y * 2.2).toFixed(1)}px ${(20 + 16 * e.z + e.x * 2.2).toFixed(1)}px ${(40 + 14 * e.z).toFixed(0)}px -30px rgba(32,32,32,${(.35 + .12 * e.z).toFixed(2)})`;
      });
      if (actifs.size) raf = requestAnimationFrame(pas);
    };
    const lance = c => { actifs.add(c); c.classList.add('ph-tient'); if (!raf) { avant = performance.now(); raf = requestAnimationFrame(pas); } };
    const carte = e => { const c = e.target.closest && e.target.closest('.nu'); return c && innerWidth > 860 ? c : null; };
    document.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return; const c = carte(e);
      actifs.forEach(o => { if (o !== c) { const s = etat(o); s.tx = s.ty = s.tz = 0; s.ts = 1; } });
      if (!c) return; const r = c.getBoundingClientRect(), s = etat(c);
      s.ty = ((e.clientX - r.left) / r.width - .5) * 5.5; s.tx = (.5 - (e.clientY - r.top) / r.height) * 4.5; s.tz = 1; c.style.zIndex = 2; lance(c);
    }, { passive: true });
    document.addEventListener('pointerdown', e => { const c = carte(e); if (c && e.pointerType === 'mouse') { etat(c).ts = .975; lance(c); } }, { passive: true });
    const relache = () => actifs.forEach(o => { etat(o).ts = 1; });
    document.addEventListener('pointerup', relache, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => actifs.forEach(o => { const s = etat(o); s.tx = s.ty = s.tz = 0; s.ts = 1; }));
    /* au clic, la carte part vers son étude de cas (motion.js) : on lui rend sa place sans attendre */
    document.addEventListener('click', e => { const c = carte(e); if (c) { actifs.delete(c); c.style.transform = ''; c.style.boxShadow = ''; c.style.zIndex = ''; c.classList.remove('ph-tient'); M.delete(c); } }, true);
  }

  /* ---------- 2. l'aperçu de site : pendant la préparation, la barre est un fil qui ondule ; prêt, il se tend ---------- */
  const prog = document.getElementById('ae-prog'), bar = prog && prog.querySelector('.bar');
  if (bar && !reduit) {
    const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), pf = document.createElementNS(NS, 'path'), pa = document.createElementNS(NS, 'path');
    pf.setAttribute('class', 'pf'); pa.setAttribute('class', 'pa'); svg.setAttribute('aria-hidden', 'true'); svg.appendChild(pf); svg.appendChild(pa); bar.appendChild(svg); bar.classList.add('ph-fil');
    let p = 0, amp = 0, raf = 0, fin = 0;
    const dessine = t => {
      raf = 0; const W = bar.clientWidth; if (!W || !prog.offsetParent) return;      // carte masquée : on s'arrête, l'observateur relancera
      const cible = parseFloat(bar.style.getPropertyValue('--p')) || 0, fini = prog.classList.contains('fini');
      p += (cible - p) * .08; if (fini && !fin) fin = t;
      const visee = fini ? 0 : cible > 0 ? 3.4 : 0; amp += (visee - amp) * (fini ? .09 : .05);
      const a = fini ? amp * Math.cos((t - fin) / 70) : amp, x1 = Math.max(3, p * W), ph = t / 260;
      let d = 'M3 9';
      for (let x = 3; x <= x1; x += 6) { const k = Math.min(1, (x - 3) / 40, (x1 - x) / 24 + .15); d += ` L${x.toFixed(1)} ${(9 + a * k * Math.sin(x / 17 - ph)).toFixed(2)}`; }
      d += ` L${x1.toFixed(1)} 9`;
      pa.setAttribute('d', d); pf.setAttribute('d', `M3 9 L${W - 3} 9`);
      if (fini && Math.abs(amp) < .03 && Math.abs(cible - p) < .002) { pa.setAttribute('d', `M3 9 L${W - 3} 9`); return; }
      raf = requestAnimationFrame(dessine);
    };
    const reveil = () => { if (!prog.classList.contains('fini')) fin = 0; if (!raf) raf = requestAnimationFrame(dessine); };
    new MutationObserver(reveil).observe(prog, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
    const carte = prog.closest('.ae-e'); if (carte) new MutationObserver(reveil).observe(carte, { attributes: true, attributeFilter: ['class'] });
    reveil();
  }
})();
