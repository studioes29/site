/* Studio ES V2 : bannière montée en quatre temps, filigranes, feuilles qui se posent, cartes projets */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- 1. la bannière : photographie, site, imprimé, studio ---------- */
  const hx = $('#hx');
  if (hx) {
    const T = [[0, 1], [2700, 2], [4500, 'defile'], [5600, 3], [8300, 4]], FIN = 9600;
    const DUR = { 1: 2700, 2: 2900, 3: 2700 };
    const bt = $('#hxP'), tc = $('#hxT'), barre = $('#hxB');
    const mots = a => $$('.hx-mots', hx).forEach(m => {
      $$('span', m).forEach(s => {
        const ici = s.dataset.a === String(a);
        if (s.classList.contains('on') && !ici) { s.classList.remove('on'); s.classList.add('sort'); setTimeout(() => s.classList.remove('sort'), 720); }
        if (ici) { s.classList.remove('sort'); s.classList.add('on'); }
      });
    });
    const disc = a => $$('.hx-disc li', hx).forEach(li => {
      const n = +li.dataset.a; li.style.setProperty('--dur', (DUR[n] || 2600) + 'ms');
      li.classList.toggle('on', n === a); li.classList.toggle('fait', n < a);
    });
    const pose = a => { hx.dataset.a = a; mots(a); disc(a); };
    let t0 = 0, ecoule = 0, k = 0, joue = false, fini = false, vis = true, raf = 0;
    const libelle = () => {
      if (!bt) return;
      const lab = fini ? 'Revoir' : joue ? 'Pause' : 'Lecture';
      bt.querySelector('span').textContent = lab;
      bt.setAttribute('aria-label', fini ? 'Revoir l’animation' : joue ? 'Mettre l’animation en pause' : 'Reprendre l’animation');
      bt.querySelector('path').setAttribute('d', fini ? 'M5 12a7 7 0 1 0 2-5M5 4v4h4' : joue ? 'M9 6v12M15 6v12' : 'M8 5l11 7-11 7z');
    };
    const tic = t => {
      raf = 0; if (!joue) return;
      if (!vis || document.hidden) { t0 = t - ecoule; raf = requestAnimationFrame(tic); return; }
      ecoule = t - t0;
      while (k < T.length && ecoule >= T[k][0]) { const e = T[k][1]; if (e === 'defile') hx.classList.add('defile'); else pose(e); k++; }
      const s = Math.min(9, Math.floor(ecoule / 1000)); if (tc) tc.textContent = '00:0' + s;
      if (barre) barre.style.setProperty('--t', Math.min(1, ecoule / FIN).toFixed(3));
      if (ecoule >= FIN) { joue = false; fini = true; libelle(); return; }
      raf = requestAnimationFrame(tic);
    };
    const lance = () => {
      hx.classList.remove('defile'); k = 0; ecoule = 0; fini = false; joue = true;
      $$('.hx-mots span', hx).forEach(s => s.classList.remove('on', 'sort'));
      $$('.hx-disc li', hx).forEach(li => li.classList.remove('on', 'fait'));
      requestAnimationFrame(t => { t0 = t; if (!raf) raf = requestAnimationFrame(tic); }); libelle();
    };
    if (reduit) { delete hx.dataset.a; mots(4); }
    else {
      /* la première image est prête : on lance */
      const im = $('.hx-ph img', hx), go = () => lance();
      if (im.complete) go(); else { im.addEventListener('load', go, { once: true }); setTimeout(() => { if (!joue && !fini) go(); }, 1800); }
      new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .1 }).observe(hx);
      if (bt) bt.addEventListener('click', () => {
        if (fini) { lance(); return; }
        joue = !joue; if (joue) { requestAnimationFrame(t => { t0 = t - ecoule; if (!raf) raf = requestAnimationFrame(tic); }); } libelle();
      });
    }
  }

  /* ---------- 2. chapitres : la feuille se pose, le filigrane glisse à contre-sens ---------- */
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
      if (s.classList.contains('feuille') && !reduit) {
        /* de l'entrée en bas d'écran jusqu'au tiers haut : la feuille passe de légèrement retenue à posée */
        const p = clamp((H - r.top) / (H * .72), 0, 1), e = 1 - Math.pow(1 - p, 3);
        s.style.setProperty('--pose', e.toFixed(3));
        s.classList.toggle('pose', p > 0 && p < 1);
      }
      if (s.querySelector('.fg, .fg-m')) s.style.setProperty('--px', clamp((H - r.top) / (H + r.height), 0, 1).toFixed(3));
    });
  };
  const demande = () => { if (!tic2) { tic2 = true; requestAnimationFrame(pas); } };
  addEventListener('scroll', demande, { passive: true }); addEventListener('resize', demande); pas();

  /* ---------- 3. cartes projets : de la vignette à l'étude de cas, l'image fait le trajet ---------- */
  if (!reduit) document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="/projets/"]'); if (!a || e.metaKey || e.ctrlKey) return;
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
    const s = p.querySelector('.vp-s'), cur = document.createElement('p'); cur.className = 'vp-cur'; p.querySelector('.vp-f').after(cur);
    const pose = b => {
      p.querySelectorAll('.vp-f button').forEach(x => x.setAttribute('aria-pressed', x === b));
      cur.textContent = b.querySelector('span').textContent;
      const d = b.dataset.d, m = b.dataset.m, nom = p.querySelector('.vp-f').closest('.vp').id;
      const ec = s.querySelector('.vs-pg img, .vs-app img'), tel = s.querySelector('.vs-tel img');
      const change = (im, src) => { if (!im || !src || im.getAttribute('src') === src) return; const n = new Image(); n.onload = () => { im.src = src; im.classList.remove('chg'); void im.offsetWidth; im.classList.add('chg'); }; n.src = src; };
      change(ec, d); if (m) change(tel, m);
      s.classList.toggle('sans-tel', !m && !!tel);
    };
    p.querySelectorAll('.vp-f button').forEach(b => b.addEventListener('click', () => pose(b)));
    cur.textContent = p.querySelector('.vp-f button').querySelector('span').textContent;
    const b0 = p.querySelector('.vp-f button'); if (!b0.dataset.m && s.querySelector('.vs-tel')) s.classList.add('sans-tel');
  });
})();
