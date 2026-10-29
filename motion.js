/* Studio ES : bannière en une scène, filigranes, feuilles qui se posent, cartes projets */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 1. la bannière : une scène, trois plans, puis la rétractation vers la première carte ---------- */
  const hx = $('#hx');
  if (hx && hx.classList.contains('sx')) {
    hx.dataset.m = 1; document.documentElement.classList.add('sx-js');
    const sc = $('.sx-sc', hx), bt = $('#hxP'), sel = $('#selection');
    const carte = () => $('.nu-scene .nu-i');
    const lettres = $$('.sx-nom .sx-l', hx);
    const IW = 1536, IH = 2048, vol = hx.classList.contains('vol') && !reduit;
    let W = 0, H = 0, S = 1;
    const pc = v => v.trim().split(/\s+/).map(x => parseFloat(x) / 100);
    /* les lettres sont remplies par la même photographie, surexposée : on cale l'image sur le cadrage plein écran (zoom vertical compris) */
    const mesure = () => {
      W = sc.clientWidth; H = sc.clientHeight;
      const cs = getComputedStyle(sc), op = pc(cs.getPropertyValue('--op')), zo = pc(cs.getPropertyValue('--zo')), zs = (parseFloat(cs.getPropertyValue('--zs')) || 1) + .025;
      const k = Math.max(W / IW, H / IH); let bw = IW * k, bh = IH * k, bx = (W - bw) * op[0], by = (H - bh) * op[1];
      const ox = W * zo[0], oy = H * zo[1]; bx = ox + (bx - ox) * zs; by = oy + (by - oy) * zs; bw *= zs; bh *= zs;
      sc.style.setProperty('--bw', bw + 'px'); sc.style.setProperty('--bh', bh + 'px');
      sc.style.setProperty('--bx', bx + 'px'); sc.style.setProperty('--by', by + 'px');
      sc.style.setProperty('--sw', W + 'px'); sc.style.setProperty('--sh', H + 'px');
      lettres.forEach(l => { const nom = l.closest('.sx-nom'); let x = 0, y = 0, e = l; while (e && e !== nom && e !== document.body) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } l.style.setProperty('--lx', x + 'px'); l.style.setProperty('--ly', y + 'px'); });
      if (sel) S = Math.max(H * .5, sel.getBoundingClientRect().top + scrollY);
    };
    /* au défilement : la photographie se rétracte jusqu'à la place exacte de la première carte ;
       les déformations (zoom, parallaxe, lumière, ombres) s'éteignent en même temps, les lettres sortent par le haut */
    const ease = p => p * p * p * (p * (p * 6 - 15) + 10);
    let der = -1;
    const pas = () => {
      if (!vol) return;
      const p = clamp(scrollY / S, 0, 1);
      if (p === der) return; der = p;
      hx.classList.toggle('fini', p >= 1); hx.classList.toggle('mue', p > 0 && p < 1);
      const e = ease(p), c = carte(); let haut = 0;
      if (p > 0 && c) {
        const r = c.getBoundingClientRect(); haut = r.top * e;
        sc.style.setProperty('--cx', r.left * e + 'px'); sc.style.setProperty('--cy', r.top * e + 'px');
        sc.style.setProperty('--cw', W + (r.width - W) * e + 'px'); sc.style.setProperty('--ch', H + (r.height - H) * e + 'px');
        sc.style.setProperty('--cr', 13 * e + 'px');
      } else { ['--cx', '--cy', '--cw', '--ch', '--cr'].forEach(v => sc.style.removeProperty(v)); }
      sc.style.setProperty('--ce', e.toFixed(4));
      sc.style.setProperty('--dz', (Math.sin(Math.PI * e) * .05).toFixed(4));
      /* dès que la scène se rétracte, elle se pose sur le papier du portfolio : les lettres qui sortent de l'image passent à l'encre */
      sc.style.setProperty('--st', p > 0 ? '0px' : H + 'px'); sc.style.setProperty('--fo', p > 0 ? 0 : 1);
      hx.style.setProperty('--q', clamp((p - .06) / .5, 0, 1).toFixed(4));
      if (sel) sel.style.setProperty('--sel', clamp((p - .45) / .55, 0, 1).toFixed(4));
      sc.style.setProperty('--o', (1 - clamp(p / .14, 0, 1)).toFixed(3));
      /* le menu passe en clair seulement quand le papier apparaît derrière lui */
      if (haut > 56) { if (hx.hasAttribute('data-dark')) { hx.removeAttribute('data-dark'); hx.style.setProperty('--fond', 'var(--papier)'); } }
      else if (!hx.hasAttribute('data-dark')) { hx.setAttribute('data-dark', ''); hx.style.removeProperty('--fond'); }
    };
    const tout = () => { mesure(); der = -1; pas(); };
    tout(); if (document.fonts) document.fonts.ready.then(tout);
    addEventListener('resize', tout); addEventListener('load', tout);
    if (vol) {
      let t = false; addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; pas(); }); } }, { passive: true });
      /* l'ouverture démarre dès que la police est prête (ou au plus tard après 0,6 s) : la fente révèle la photographie au fil de son arrivée */
      let parti = false;
      const go = () => { if (parti) return; parti = true; tout(); hx.classList.add('go'); };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(go); setTimeout(go, 600);
      if (bt) bt.addEventListener('click', () => {
        const arret = hx.classList.toggle('pause');
        bt.querySelector('span').textContent = arret ? 'Lecture' : 'Pause';
        bt.setAttribute('aria-label', arret ? 'Reprendre l’animation' : 'Mettre l’animation en pause');
        bt.querySelector('path').setAttribute('d', arret ? 'M8 5l11 7-11 7z' : 'M9 6v12M15 6v12');
      });
      /* profondeur au pointeur, lissée image par image */
      if (matchMedia('(hover: hover)').matches) {
        let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0;
        const glisse = () => { cx += (tx - cx) * .08; cy += (ty - cy) * .08; sc.style.setProperty('--mx', cx.toFixed(4)); sc.style.setProperty('--my', cy.toFixed(4)); raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(glisse) : 0; };
        addEventListener('pointermove', e => { if (scrollY > H * .3 || hx.classList.contains('pause')) return; tx = e.clientX / W - .5; ty = e.clientY / H - .5; if (!raf) raf = requestAnimationFrame(glisse); }, { passive: true });
      }
    }
  }

  /* ---------- 1 bis. cartes photo : le nombre d'images, et au survol le reportage défile ---------- */
  const REPS = window.REPS || [];
  $$('.nu-photo[data-r]').forEach(c => {
    const r = REPS.find(x => x.id === c.dataset.r); if (!r) return;
    const i = $('.nu-i', c); const n = document.createElement('span'); n.className = 'nu-n'; n.textContent = r.ph.length + ' photos'; i.appendChild(n);
    if (reduit || !matchMedia('(hover: hover)').matches) return;
    let t = 0, k = 0, imgs = [];
    c.addEventListener('pointerenter', () => {
      if (!imgs.length) imgs = r.ph.slice(1, 5).map(id => { const im = new Image(); im.className = 'nu-f'; im.alt = ''; im.decoding = 'async'; im.src = (window.RACINE || '/') + 'p/t/' + id + '.webp'; i.insertBefore(im, n); return im; });
      clearInterval(t); k = 0;
      t = setInterval(() => { imgs.forEach((im, j) => im.classList.toggle('on', j === k % imgs.length && im.complete)); k++; }, 900);
    });
    c.addEventListener('pointerleave', () => { clearInterval(t); imgs.forEach(im => im.classList.remove('on')); });
  });

  /* ---------- 2. chapitres : le filigrane glisse à contre-sens, les images se recomposent ---------- */
  /* recomposition : les images d'un chapitre convergent vers leur place pendant que le chapitre entre à l'écran */
  const recompo = $$('[data-recompo]');
  const recPas = () => { const H = innerHeight; recompo.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < -50 || r.top > H + 50) return; const p = clamp((H - r.top) / (H * .62), 0, 1); el.style.setProperty('--p', (1 - Math.pow(1 - p, 3)).toFixed(3)); }); };
  if (!reduit && recompo.length) { let t = false; addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; recPas(); }); } }, { passive: true }); addEventListener('resize', recPas); recPas(); }
  const feuilles = $$('main > .feuille');
  const mobiles = $$('.feuille, .mh').filter(s => s.querySelector('.fg, .fg-m'));
  const visibles = new Set();
  const vu = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) visibles.add(e.target); else visibles.delete(e.target); }), { rootMargin: '20% 0px' });
  feuilles.concat(mobiles).forEach(s => vu.observe(s));
  let tic2 = false;
  const pas = () => {
    tic2 = false; const H = innerHeight;
    visibles.forEach(s => {
      const r = s.getBoundingClientRect();
      if (s.querySelector('.fg, .fg-m')) s.style.setProperty('--px', clamp((H - r.top) / (H + r.height), 0, 1).toFixed(3));
    });
  };
  const demande = () => { if (!tic2) { tic2 = true; requestAnimationFrame(pas); } };
  addEventListener('scroll', demande, { passive: true }); addEventListener('resize', demande); pas();

  /* ---------- 3. cartes projets : de la vignette à l'étude de cas, l'image fait le trajet ---------- */
  if (!reduit) document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="projets/"]'); if (!a || e.metaKey || e.ctrlKey) return;
    const im = a.querySelector('img'); if (!im) return;
    $$('[style*="view-transition-name"]').forEach(x => x.style.viewTransitionName = '');
    im.style.viewTransitionName = 'projet';
  });
  addEventListener('pageshow', () => $$('img').forEach(x => { if (x.style.viewTransitionName) x.style.viewTransitionName = ''; }));

  /* cartes web : la page défile dans l'écran au survol ; cartes graphisme : la planche se soulève */
  if (!reduit && matchMedia('(hover: hover)').matches) {
    $$('.tl[data-t~="graph"], .ed-c').forEach(c => {
      c.addEventListener('pointermove', ev => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', ((ev.clientX - r.left) / r.width - .5).toFixed(3)); c.style.setProperty('--my', ((ev.clientY - r.top) / r.height - .5).toFixed(3)); });
      c.addEventListener('pointerleave', () => { c.style.removeProperty('--mx'); c.style.removeProperty('--my'); });
    });
  }
})();

/* vitrine web : un onglet par projet, une fonctionnalité affiche son écran sur ordinateur et sur téléphone */
(() => {
  const vi = document.querySelector('.vi'); if (!vi) return;
  const tabs = [...vi.querySelectorAll('[role="tab"]')];
  const choisit = (t, focus) => {
    tabs.forEach(x => { const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; const p = document.getElementById(x.getAttribute('aria-controls')); p.hidden = !on; if (on) { p.classList.remove('ent'); void p.offsetWidth; p.classList.add('ent'); } });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => choisit(t));
    t.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); choisit(tabs[(i + d + tabs.length) % tabs.length], true); });
  });
  vi.querySelectorAll('.vp').forEach(p => {
    const cur = document.createElement('p'); cur.className = 'vp-cur'; p.querySelector('.vp-f').after(cur);
    const pose = b => {
      p.querySelectorAll('.vp-f button').forEach(x => x.setAttribute('aria-pressed', x === b));
      cur.textContent = b.querySelector('span').textContent;
      p.querySelectorAll('.vsc').forEach(sc => { const on = sc.dataset.j === b.dataset.j; if (on && sc.hidden) { sc.hidden = false; sc.classList.remove('ent'); void sc.offsetWidth; sc.classList.add('ent'); } else if (!on) sc.hidden = true; });
    };
    p.querySelectorAll('.vp-f button').forEach(b => b.addEventListener('click', () => pose(b)));
    cur.textContent = p.querySelector('.vp-f button span').textContent;
  });
})();

/* web : la visite d'un site, pilotée par le défilement de la page */
(() => {
  const v = document.querySelector('[data-vis]'); if (!v) return;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = v.dataset.d.split(',').map(Number), M = v.dataset.m.split(',').map(Number);
  const ec = v.querySelector('.vis-ec'), tec = v.querySelector('.vis-tec'), di = ec.querySelector('img'), mi = tec.querySelector('img');
  const li = [...v.querySelectorAll('.vis-e li')], n = li.length;
  const marque = k => li.forEach((l, j) => l.classList.toggle('on', j === k));
  /* position dans le site (en pixels de la capture ordinateur) : la page défile par paliers, chaque partie marque un temps d'arrêt */
  const versM = y => { let k = 0; while (k < n - 1 && y >= D[k + 1]) k++; const f = (y - D[k]) / (D[k + 1] - D[k]); return M[k] + f * (M[k + 1] - M[k]); };
  const pose = y => {
    const kd = di.clientWidth / 1200, km = mi.clientWidth / 480;
    const maxD = Math.max(0, di.clientHeight - ec.clientHeight), maxM = Math.max(0, mi.clientHeight - tec.clientHeight);
    di.style.setProperty('--y', Math.min(maxD, y * kd).toFixed(1)); mi.style.setProperty('--y', Math.min(maxM, versM(y) * km).toFixed(1));
    let k = 0; while (k < n - 1 && y + 40 >= D[k + 1]) k++; marque(k);
  };
  if (reduit) {
    /* sans animation : on fait défiler les écrans à la main, les étapes y conduisent */
    li.forEach((l, k) => l.querySelector('button').addEventListener('click', () => { marque(k); ec.scrollTo({ top: D[k] * di.clientWidth / 1200 }); tec.scrollTo({ top: M[k] * mi.clientWidth / 480 }); }));
    return;
  }
  /* chaque partie occupe une part égale du défilement : 70 % de glissement, 30 % d'arrêt pour lire */
  const ver = p => { const s = p * (n - 1), k = Math.min(n - 2, Math.floor(s)), f = s - k, g = Math.min(1, f / .7); const e = g * g * (3 - 2 * g); return D[k] + e * (D[k + 1] - D[k]); };
  const prog = () => { const r = v.getBoundingClientRect(); return Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight))); };
  let t = false;
  const pas = () => { t = false; pose(ver(prog())); };
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(pas); } }, { passive: true });
  addEventListener('resize', pas); di.addEventListener('load', pas); mi.addEventListener('load', pas); pas();
  /* une étape cliquée : la page défile jusqu'à elle */
  li.forEach((l, k) => l.querySelector('button').addEventListener('click', () => {
    const r = v.getBoundingClientRect(), H = r.height - innerHeight; scrollTo({ top: scrollY + r.top + H * k / (n - 1) + 2, behavior: 'smooth' });
  }));
})();

/* graphisme : la brochure se feuillette */
(() => {
  const f = document.querySelector('[data-flb]'); if (!f) return;
  const livre = f.querySelector('.flb-livre'), ff = [...livre.querySelectorAll('.flb-f')], N = ff.length;
  const p = f.querySelector('.flb-p'), s = f.querySelector('.flb-s'), lab = f.querySelector('.flb-n');
  const NOM = ['Couverture', 'Pages 2 et 3', 'Pages 4 et 5', 'Pages 6 et 7', 'Page 8'];
  let i = 0;
  const pose = () => {
    livre.dataset.i = i;
    ff.forEach((l, k) => { const t = k < i; l.classList.toggle('tourne', t); l.style.setProperty('--z', t ? 10 + k : 10 + N - k); });
    p.disabled = i === 0; s.disabled = i === N; lab.textContent = NOM[i];
  };
  /* pendant qu'une page tourne, elle passe au-dessus des autres */
  const va = d => { const j = Math.max(0, Math.min(N, i + d)); if (j === i) return; const l = ff[d > 0 ? i : j]; l.style.setProperty('--z', 60); i = j; setTimeout(pose, 1050); ff.forEach((x, k) => x.classList.toggle('tourne', k < i)); livre.dataset.i = i; p.disabled = i === 0; s.disabled = i === N; lab.textContent = NOM[i]; };
  p.addEventListener('click', () => va(-1)); s.addEventListener('click', () => va(1));
  livre.addEventListener('click', e => { if (livre.moved) return; const r = livre.getBoundingClientRect(); va(e.clientX > r.left + r.width / 2 ? 1 : -1); });
  let x0 = null; livre.addEventListener('pointerdown', e => { x0 = e.clientX; livre.moved = false; });
  addEventListener('pointerup', e => { if (x0 === null) return; const d = e.clientX - x0; x0 = null; if (Math.abs(d) > 40) { livre.moved = true; va(d < 0 ? 1 : -1); setTimeout(() => livre.moved = false, 50); } });
  f.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); va(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); va(-1); } });
  livre.tabIndex = 0; pose();
})();
