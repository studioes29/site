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
    /* les lettres sont remplies par la même photographie, surexposée : on cale l'image sur le cadrage plein écran */
    const mesure = () => {
      W = innerWidth; H = vol ? innerHeight : hx.offsetHeight;
      const op = getComputedStyle(sc).getPropertyValue('--op').trim().split(/\s+/).map(v => parseFloat(v) / 100);
      const k = Math.max(W / IW, H / IH), bw = IW * k, bh = IH * k;
      sc.style.setProperty('--bw', bw + 'px'); sc.style.setProperty('--bh', bh + 'px');
      sc.style.setProperty('--bx', (W - bw) * op[0] + 'px'); sc.style.setProperty('--by', (H - bh) * op[1] + 'px');
      sc.style.setProperty('--sw', W + 'px'); sc.style.setProperty('--sh', H + 'px');
      lettres.forEach(l => { const nom = l.closest('.sx-nom'); let x = 0, y = 0, e = l; while (e && e !== nom && e !== document.body) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } l.style.setProperty('--lx', x + 'px'); l.style.setProperty('--ly', y + 'px'); });
      if (sel) S = Math.max(H * .5, sel.getBoundingClientRect().top + scrollY);
    };
    /* au défilement : la photographie se rétracte jusqu'à la place exacte de la première carte, les lettres sortent par le haut */
    const ease = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    let der = -1;
    const pas = () => {
      if (!vol) return;
      const p = clamp(scrollY / S, 0, 1);
      if (p === der) return; der = p;
      hx.classList.toggle('fini', p >= 1); hx.classList.toggle('mue', p > .001 && p < 1);
      const e = ease(p), c = carte();
      if (p > 0 && c) {
        const r = c.getBoundingClientRect();
        sc.style.setProperty('--cx', r.left * e + 'px'); sc.style.setProperty('--cy', r.top * e + 'px');
        sc.style.setProperty('--cw', W + (r.width - W) * e + 'px'); sc.style.setProperty('--ch', H + (r.height - H) * e + 'px');
        sc.style.setProperty('--cr', 13 * e + 'px');
      } else { ['--cx', '--cy', '--cw', '--ch', '--cr'].forEach(v => sc.style.removeProperty(v)); }
      sc.style.setProperty('--ce', e.toFixed(4));
      if (sel) sc.style.setProperty('--st', clamp(sel.getBoundingClientRect().top, 0, H) + 'px');
      sc.style.setProperty('--dz', (Math.sin(Math.PI * p) * .07).toFixed(4));
      hx.style.setProperty('--q', clamp((p - .1) / .6, 0, 1).toFixed(4));
      sc.style.setProperty('--o', (1 - clamp(p / .16, 0, 1)).toFixed(3));
    };
    const tout = () => { mesure(); der = -1; pas(); };
    tout(); if (document.fonts) document.fonts.ready.then(tout);
    addEventListener('resize', tout); addEventListener('load', tout);
    if (vol) {
      let t = false; addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; pas(); }); } }, { passive: true });
      /* l'ouverture ne démarre qu'une fois la photographie et la police prêtes */
      const im = $('.sx-ph img', hx); let parti = false;
      const go = () => { if (parti) return; parti = true; tout(); hx.classList.add('go'); };
      Promise.all([im.decode ? im.decode().catch(() => {}) : Promise.resolve(), document.fonts ? document.fonts.ready : Promise.resolve()]).then(go);
      setTimeout(go, 2200);
      if (bt) bt.addEventListener('click', () => {
        const arret = hx.classList.toggle('pause');
        bt.querySelector('span').textContent = arret ? 'Lecture' : 'Pause';
        bt.setAttribute('aria-label', arret ? 'Reprendre l’animation' : 'Mettre l’animation en pause');
        bt.querySelector('path').setAttribute('d', arret ? 'M8 5l11 7-11 7z' : 'M9 6v12M15 6v12');
      });
      if (matchMedia('(hover: hover)').matches) addEventListener('pointermove', e => { if (scrollY > H * .5 || hx.classList.contains('pause')) return; sc.style.setProperty('--mx', (e.clientX / W - .5).toFixed(3)); sc.style.setProperty('--my', (e.clientY / H - .5).toFixed(3)); }, { passive: true });
    }
  }

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
