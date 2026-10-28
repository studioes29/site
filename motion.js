/* Studio ES V2 : bannière montée en quatre temps, filigranes, feuilles qui se posent, cartes projets */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 1. la bannière : photographie, interface, affiche, puis le studio ---------- */
  const hx = $('#hx');
  if (hx) {
    const T = [[0, 1], [2600, 2], [3900, 'defile'], [5400, 3], [7900, 4]], FIN = 9300;
    const DUR = { 1: 2600, 2: 2800, 3: 2500 };
    const bt = $('#hxP');
    const mots = a => $$('.hx-mots span', hx).forEach(s => {
      const ici = s.dataset.a === String(a);
      if (s.classList.contains('on') && !ici) { s.classList.remove('on'); s.classList.add('sort'); setTimeout(() => s.classList.remove('sort'), 800); }
      if (ici) { s.classList.remove('sort'); s.classList.add('on'); }
    });
    const disc = a => $$('.hx-disc li', hx).forEach(li => {
      const n = +li.dataset.a; li.style.setProperty('--dur', (DUR[n] || 2600) + 'ms');
      li.classList.toggle('on', n === a); li.classList.toggle('fait', n < a);
    });
    const pose = a => { hx.dataset.a = a; mots(a); disc(a); };
    let t0 = 0, ecoule = 0, k = 0, joue = false, fini = false, vis = true, raf = 0;
    const libelle = () => {
      if (!bt) return;
      bt.querySelector('span').textContent = fini ? 'Revoir' : joue ? 'Pause' : 'Lecture';
      bt.setAttribute('aria-label', fini ? 'Revoir l’animation' : joue ? 'Mettre l’animation en pause' : 'Reprendre l’animation');
      bt.querySelector('path').setAttribute('d', fini ? 'M5 12a7 7 0 1 0 2-5M5 4v4h4' : joue ? 'M9 6v12M15 6v12' : 'M8 5l11 7-11 7z');
      hx.classList.toggle('arret', !joue && !fini);
    };
    const tic = t => {
      raf = 0; if (!joue) return;
      if (!vis || document.hidden) { t0 = t - ecoule; raf = requestAnimationFrame(tic); return; }
      ecoule = t - t0;
      while (k < T.length && ecoule >= T[k][0]) { const e = T[k][1]; if (e === 'defile') hx.classList.add('defile'); else pose(e); k++; }
      if (ecoule >= FIN) { joue = false; fini = true; libelle(); return; }
      raf = requestAnimationFrame(tic);
    };
    const lance = () => {
      hx.classList.remove('defile'); k = 0; ecoule = 0; fini = false; joue = true;
      $$('.hx-mots span', hx).forEach(s => s.classList.remove('on', 'sort'));
      $$('.hx-disc li', hx).forEach(li => li.classList.remove('on', 'fait'));
      requestAnimationFrame(t => { t0 = t; if (!raf) raf = requestAnimationFrame(tic); }); libelle();
    };
    if (reduit) { delete hx.dataset.a; }
    else {
      const im = $('.hx-ph img', hx), go = () => { if (!joue && !fini) lance(); };
      if (im.complete) go(); else { im.addEventListener('load', go, { once: true }); setTimeout(go, 1600); }
      new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .1 }).observe(hx);
      if (bt) bt.addEventListener('click', () => {
        if (fini) { lance(); return; }
        joue = !joue; if (joue) requestAnimationFrame(t => { t0 = t - ecoule; if (!raf) raf = requestAnimationFrame(tic); });
        hx.querySelectorAll('*').forEach(x => x.getAnimations && x.getAnimations().forEach(an => joue ? an.play() : an.pause()));
        libelle();
      });
      /* parallaxe très légère au pointeur, une fois la composition posée */
      if (matchMedia('(hover: hover)').matches) hx.addEventListener('pointermove', e => { const r = hx.getBoundingClientRect(); hx.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); hx.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
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
