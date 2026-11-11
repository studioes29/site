/* Studio ES 2027 : interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const NB = ' ', fmt = n => { const [e, d] = (Math.round(n * 100) / 100).toFixed(2).split('.'); return e.replace(/\B(?=(\d{3})+(?!\d))/g, NB) + (d === '00' ? '' : ',' + d); };
  const compte = (p, t) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: p, title: t || p, event: true }); } catch (e) {} };
  const toast = t => { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 3400); };
  const ico = id => `<svg class="i"><use href="#${id}"/></svg>`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rangs = el => [...el.children].forEach((c, i) => c.style.setProperty('--i', i));

  /* une nouvelle page s'ouvre toujours en haut, sauf si son adresse vise une rubrique précise */
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (!location.hash && (!nav || nav.type !== 'back_forward')) scrollTo(0, 0);
  /* au retour (bouton précédent, croix d'une étude de cas), la page reprend là où le visiteur l'avait quittée */
  try {
    addEventListener('pagehide', () => sessionStorage.setItem('y:' + location.pathname, scrollY));
    if (nav && nav.type === 'back_forward') { const y = +sessionStorage.getItem('y:' + location.pathname) || 0;
      if (y) { const va = () => scrollTo(0, y); va(); addEventListener('load', () => { va(); setTimeout(va, 120); }); } }
  } catch (e) {}
  /* bouton retour : la page précédente du site si elle existe, sinon l'accueil ; caché sur l'accueil */
  const ret = document.querySelector('[data-ret]');
  if (ret) { if (document.getElementById('hx')) ret.hidden = true;
    ret.addEventListener('click', e => { try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch (x) {} }); }
  /* en-tête, dock et retour en haut : verre dépoli, version nuit au-dessus des rubriques sombres */
  const hd = $('#hd'), dock = $('#dock'), hautBt = $('.haut-bt'), sombres = $$('[data-dark]'), feuilles = $$('.feuille');
  /* empilement : chaque rubrique se fige à sa fin, la suivante glisse par-dessus (sauf .libre : rubrique dont la hauteur change en cours d'usage, comme celle du module d'aperçu) */
  const pile = [...document.querySelectorAll('main > .hero, main > .hv, main > .mh, main > .feuille:not(.libre)')];
  /* la hauteur de chaque rubrique est mesurée seulement quand elle change vraiment, le haut de figeage est calculé en CSS sur la petite hauteur d'écran : rien ne saute quand la barre du navigateur mobile apparaît */
  const fige = () => pile.forEach(el => { el.classList.add('empile'); const h = el.offsetHeight; if (Math.abs((el._h || 0) - h) > 2) { el._h = h; el.style.setProperty('--h', h + 'px'); } });
  fige(); if (window.ResizeObserver) { const ro = new ResizeObserver(() => fige()); pile.forEach(el => ro.observe(el)); }
  /* la rubrique visible à une hauteur donnée est la dernière feuille qui la recouvre */
  const ici = y => { let h = null; for (const el of pile) { const r = el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) h = el; } return h; };
  const sur = y => { const h = ici(y); return !!h && h.hasAttribute('data-dark'); };
  const teinte = (el, y) => { const h = ici(y); const f = h ? getComputedStyle(h).getPropertyValue('--fond').trim() : ''; if (f !== el._f) { el._f = f; el.style.setProperty('--hf', f || 'var(--papier)'); } };
  let tic = false;
  const etat = () => {
    tic = false; const y = scrollY, H = innerHeight;
    hd.classList.toggle('on', y > 10); hd.classList.toggle('dk', sur(32)); teinte(hd, 32);
    const loin = y > H * 1.2;
    if (dock) { dock.classList.toggle('dk', sur(H - 40)); dock.classList.toggle('haut', loin); }
    if (hautBt) { hautBt.classList.toggle('on', loin); hautBt.classList.toggle('dk', sur(H - 50)); }
    pile.forEach((el, i) => { const n = pile[i + 1]; if (!n) return; const d = clamp((H * .3 - n.getBoundingClientRect().top) / (H * .3), 0, 1); el.style.setProperty('--dim', reduit ? 0 : (d * d * .34).toFixed(3)); });
  };
  addEventListener('scroll', () => { if (!tic) { tic = true; requestAnimationFrame(etat); } }, { passive: true });
  addEventListener('resize', etat); etat();
  $$('[data-haut]').forEach(b => b.addEventListener('click', () => scrollTo({ top: 0, behavior: reduit ? 'auto' : 'smooth' })));

  /* apparition au défilement */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  $$('.rv').forEach(e => io.observe(e));

  /* prix : chaque chiffre est une bande qui tourne, les chiffres s'arrêtent l'un après l'autre avec un léger rebond */
  const HC = 1.08, BANDE = '0123456789'.repeat(3).split('').map(d => `<span class="c">${d}</span>`).join('');
  const odo = (el, txt, depuisZero) => {
    if (!/\d/.test(txt)) { el.innerHTML = `<span class="sr">${txt}</span><span class="v" aria-hidden="true">${txt}</span>`; el._ch = null; if (!reduit) el.animate([{ opacity: 0, transform: 'translateY(.2em)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' }); return; }
    const ch = [...txt].filter(c => /\d/.test(c)).map(Number), anc = depuisZero ? [] : (el._ch || []);
    el.innerHTML = `<span class="sr">${txt}</span>` + '<span class="od" aria-hidden="true">' + [...txt].map(c => /\d/.test(c) ? `<span class="dg"><b>${c}</b><span>${BANDE}</span></span>` : c === ',' ? '<span class="vg">,</span>' : '<span class="sp"></span>').join('') + '</span>';
    const cols = $$('.dg>span', el), n = cols.length; let fin = 0;
    cols.forEach((c, i) => {
      const d = ch[i], p = anc[anc.length - n + i];
      if (reduit || (p === d && anc.length === n)) { c.style.transform = `translateY(${-d * HC}em)`; return; }
      const dep = p == null ? 0 : p, arr = 20 + d, dur = 650 + i * 150; fin = Math.max(fin, dur);
      c.animate([{ transform: `translateY(${-dep * HC}em)`, filter: 'blur(0)' }, { filter: 'blur(1.4px)', offset: .5 }, { transform: `translateY(${-arr * HC}em)`, filter: 'blur(0)' }], { duration: dur, easing: 'cubic-bezier(.22,.8,.26,1.14)', fill: 'forwards' });
    });
    if (fin && !reduit) el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.07)' }, { transform: 'scale(1)' }], { duration: 360, delay: fin - 140, easing: 'ease-out' });
    el._ch = ch;
  };
  const prix = (el, v) => {
    if (!el) return; const txt = v == null ? 'Sur devis' : fmt(v);
    el.classList.toggle('txt', v == null); const px = el.closest('.px'); if (px) px.classList.toggle('sd', v == null);
    if (el.dataset.t === txt) return; el.dataset.t = txt; el.dataset.v = v == null ? '' : v;
    const sr = el.querySelector('.sr'); if (sr) sr.textContent = txt;
    if (el.dataset.vu) odo(el, txt, false);
  };
  /* première apparition : les chiffres tournent depuis zéro quand la carte entre à l'écran */
  const prixVus = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const el = e.target; prixVus.unobserve(el); el.dataset.vu = 1; odo(el, el.dataset.t, true); } }), { threshold: .6 });
  $$('.prix').forEach(el => { el.dataset.t = el.textContent.trim().replace(/\s/g, NB); el.innerHTML = `<span class="sr">${el.dataset.t}</span><span class="v" aria-hidden="true" style="visibility:hidden">${el.dataset.t}</span>`; if (reduit) { el.dataset.vu = 1; odo(el, el.dataset.t, true); } else prixVus.observe(el); });

  /* cartes d'accueil : inclinaison légère au pointeur */
  if (!tactile && !reduit) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', ev => { const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height; c.style.setProperty('--ry', ((x - .5) * 3).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 3).toFixed(2) + 'deg'); });
    c.addEventListener('pointerleave', () => ['--rx', '--ry'].forEach(p => c.style.removeProperty(p)));
  });

  /* bannière : le viseur fait la mise au point, déclenche, puis la photo se range dans la page d'accueil d'un site ; les étiquettes suivent */
  const charge = i => { if (!i) return; if (i.dataset.srcset) { i.srcset = i.dataset.srcset; i.removeAttribute('data-srcset'); } if (i.dataset.src) { i.src = i.dataset.src; i.removeAttribute('data-src'); } };
  const puces = $$('[data-chips]').map(el => ({ ims: $$('.win > img', el), k: 0 }));
  const avancePuces = () => puces.forEach(D => { if (!D.ims.length) return; D.ims[D.k].classList.remove('on'); D.k = (D.k + 1) % D.ims.length; charge(D.ims[D.k]); D.ims[D.k].classList.add('on'); });
  const ban = $('#ban');
  if (ban) {
    const ims = $$('.shot .ph img', ban), hT = $('#banH');
    let k = 0, n = 1, vis = true, tm = [];
    /* cadrage dans la fenêtre du site : chaque photo est réduite et recentrée sur son sujet (data-f), sans laisser de vide */
    const ui = $('.shot .ui', ban), bar = $('.shot .bar', ban);
    const cadre = () => {
      const W = ban.clientWidth, H = ban.clientHeight; if (!W || !ui) return;
      const bh = bar ? bar.offsetHeight : 0;
      const L = ui.offsetLeft, T = ui.offsetTop + bh, R = L + ui.offsetWidth, B = ui.offsetTop + ui.offsetHeight;
      const cx = (L + R) / 2, cy = (T + B) / 2;
      ims.forEach(im => {
        const nw = im.naturalWidth, nh = im.naturalHeight; if (!nw || nw < 4) return;
        const f = (im.dataset.f || '.5 .45').split(' ').map(Number), q = Math.max(W / nw, H / nh);
        const fx = (W - nw * q) / 2 + f[0] * nw * q, fy = (H - nh * q) / 2 + f[1] * nh * q;
        let s = Math.max((cx - L) / fx, (R - cx) / (W - fx), (cy - T) / fy, (B - cy) / (H - fy), .2);
        s = Math.min(s, 1);
        /* le sujet arrive au centre de la fenêtre ; bords recalés pour qu'aucun vide n'apparaisse */
        let gx = cx - s * fx, gy = cy - s * fy;
        gx = Math.min(L, Math.max(R - s * W, gx)); gy = Math.min(T, Math.max(B - s * H, gy));
        const tx = gx - W / 2 + s * W / 2, ty = gy - H / 2 + s * H / 2;
        im.style.setProperty('--tx', tx.toFixed(1) + 'px'); im.style.setProperty('--ty', ty.toFixed(1) + 'px'); im.style.setProperty('--s', s.toFixed(4));
      });
    };
    ims.forEach(im => im.addEventListener('load', cadre));
    addEventListener('resize', () => { clearTimeout(cadre.t); cadre.t = setTimeout(cadre, 150); });
    cadre();
    /* chaque photo est chargée juste avant son tour, pas toutes au démarrage */
    setTimeout(() => charge(ims[1]), 2500);
    const plus = (f, ms) => tm.push(setTimeout(f, ms));
    const tour = premier => {
      tm.forEach(clearTimeout); tm = [];
      if (!vis || document.hidden) { plus(() => tour(premier), 800); return; }
      const im = ims[k];
      if (!premier) { ims.forEach(x => x.classList.toggle('on', x === im)); charge(im); avancePuces(); }
      plus(() => charge(ims[(k + 1) % ims.length]), 2500);
      ban.classList.remove('site', 'net', 'clic'); ban.classList.add('flou');
      hT.textContent = im.dataset.h;
      plus(() => { ban.classList.remove('flou'); ban.classList.add('net'); }, premier ? 900 : 700);
      plus(() => { ban.classList.remove('net', 'clic'); ban.classList.add('site'); }, premier ? 2150 : 1900);
      plus(() => { ban.classList.remove('site'); }, premier ? 6300 : 6050);
      plus(() => { k = (k + 1) % ims.length; tour(false); }, premier ? 7250 : 7000);
    };
    if (!reduit) {
      new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .15 }).observe(ban);
      tour(true);
    }
  }


  /* menu mobile */
  const brg = $('[data-mnu]'), mnu = $('#mnu');
  if (brg && mnu) {
    const ferme = () => { brg.setAttribute('aria-expanded', 'false'); brg.setAttribute('aria-label', 'Ouvrir le menu'); mnu.classList.remove('on'); setTimeout(() => { if (!mnu.classList.contains('on')) { mnu.hidden = true; document.documentElement.classList.remove('mnu-on'); document.documentElement.style.overflow = ''; } }, 650); };
    brg.addEventListener('click', () => {
      if (mnu.classList.contains('on')) return ferme();
      const r = brg.getBoundingClientRect(); mnu.style.setProperty('--ox', (r.left + r.width / 2) + 'px'); mnu.style.setProperty('--oy', (r.top + r.height / 2) + 'px');
      mnu.hidden = false; brg.setAttribute('aria-expanded', 'true'); brg.setAttribute('aria-label', 'Fermer le menu'); document.documentElement.classList.add('mnu-on'); document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => mnu.classList.add('on')));
    });
    $$('a, [data-est]', mnu).forEach(a => a.addEventListener('click', ferme));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mnu.classList.contains('on')) ferme(); });
  }
  /* dock : la lentille se pose sur la rubrique en cours ; on peut la faire glisser d'une rubrique à l'autre */
  if (dock) {
    const lens = $('.lens', dock), liens = $$('a', dock);
    const pose = (a, dx, w) => { if (!lens || (!a && dx == null)) return; dock.style.setProperty('--lx', (dx != null ? dx : a.offsetLeft) + 'px'); dock.style.setProperty('--lw', (w || (a ? a.offsetWidth : 56)) + 'px'); dock.classList.add('a-lens'); };
    const ici = liens.find(a => a.getAttribute('aria-current') === 'page');
    if (ici) requestAnimationFrame(() => pose(ici));
    let x0 = null, glisse = false, vise = null, bloque = false;
    const sous = x => { const r0 = dock.getBoundingClientRect(); const c = x - r0.left; let m = null, d = 1e9; liens.forEach(a => { const k = Math.abs(a.offsetLeft + a.offsetWidth / 2 - c); if (k < d) { d = k; m = a; } }); return m; };
    dock.addEventListener('dragstart', e => e.preventDefault()); dock.addEventListener('contextmenu', e => e.preventDefault());
    dock.addEventListener('pointerdown', e => { if (!e.target.closest('a')) return; x0 = e.clientX; glisse = false; });
    dock.addEventListener('pointermove', e => {
      if (x0 == null) return;
      if (!glisse && Math.abs(e.clientX - x0) > 6) { glisse = true; dock.classList.add('glisse'); try { dock.setPointerCapture(e.pointerId); } catch (x) {} }
      if (!glisse) return;
      const r0 = dock.getBoundingClientRect(), c = e.clientX - r0.left, a = sous(e.clientX), w = a.offsetWidth, mn = liens[0].offsetLeft, dern = liens[liens.length - 1], mx = dern.offsetLeft + dern.offsetWidth - w;
      pose(null, Math.max(mn, Math.min(mx, c - w / 2)), w);
      if (a !== vise) { liens.forEach(l => l.classList.toggle('sur', l === a)); vise = a; if (navigator.vibrate) try { navigator.vibrate(3); } catch (x) {} }
    });
    const fin = () => {
      if (x0 == null) return; x0 = null;
      if (!glisse) return;
      dock.classList.remove('glisse'); bloque = true; setTimeout(() => bloque = false, 400);
      if (vise) { pose(vise); const h = vise.href; if (vise !== ici) setTimeout(() => location.href = h, 120); else liens.forEach(l => l.classList.remove('sur')); }
      glisse = false;
    };
    dock.addEventListener('pointerup', fin); dock.addEventListener('pointercancel', () => { x0 = null; glisse = false; dock.classList.remove('glisse'); if (ici) pose(ici); else dock.classList.remove('a-lens'); liens.forEach(l => l.classList.remove('sur')); });
    dock.addEventListener('click', e => { if (bloque) { e.preventDefault(); return; } const a = e.target.closest('a'); if (a) pose(a); }, true);
    window.addEventListener('pageshow', e => { if (e.persisted) { liens.forEach(l => l.classList.remove('sur')); if (ici) pose(ici); else dock.classList.remove('a-lens'); } });
  }
  /* cartes d'offre */
  const swPh = $('#swPh');
  const etatCarte = c => {
    const k = c.dataset.k, rows = $$('.sel [role="radio"]', c), b = rows.find(x => x.getAttribute('aria-checked') === 'true');
    const f = b ? rows.indexOf(b) : Number(c.dataset.f || 0);
    const o = $$('.opt .op', c).filter(i => i.getAttribute('aria-pressed') === 'true').map(i => +i.dataset.o);
    const mois = c.dataset.mois === '1', achat = c.dataset.achat === '1';
    let v;
    const nf = Number(c.dataset.nf || 0);
    if (k === 'site') v = nf ? Math.floor(+$('.prix', c).dataset.b * 100 / nf) / 100 : +$('.prix', c).dataset.b + (swPh && swPh.checked ? 350 : 0);
    else if (k === 'app') v = nf ? Math.floor(+$('.prix', c).dataset.b * 100 / nf) / 100 : +$('.prix', c).dataset.b;
    else if (b && b.dataset.p) v = +(mois && b.dataset.m ? b.dataset.m : b.dataset.p) + $$('.opt .op', c).filter(i => i.getAttribute('aria-pressed') === 'true').reduce((s, i) => s + Number(i.dataset.p), 0);
    else v = null;
    return { k, f, o, mois, achat, nf, ph: k === 'site' && swPh && swPh.checked, v };
  };
  const repere = c => { const s = $('.sel', c); if (!s) return; const b = $('[aria-checked="true"]', s); if (!b) return; s.style.setProperty('--y', b.offsetTop + 'px'); s.style.setProperty('--h', b.offsetHeight + 'px'); s.style.setProperty('--x', b.offsetLeft + 'px'); s.style.setProperty('--w', b.offsetWidth + 'px'); const dd = $('[data-dd]', c); if (dd && b.dataset.d) dd.textContent = b.dataset.d; };
  const majCarte = c => {
    const E = etatCarte(c); prix($('.prix', c), E.v);
    const u = $('[data-u]', c); if (u) u.textContent = E.mois ? '€/mois' : '€/an';
    const bm = $('.bascule[data-mo]', c); if (bm) bm.hidden = E.v == null;
    if (E.k === 'site' || E.k === 'app') { const d = $('.dt', c), un = $('.px .u', c), sv = c.dataset.sv || 9; d.innerHTML = E.nf ? `sur ${E.nf} mois sans frais, + ${sv}&nbsp;€ de suivi${E.ph ? '<br>photos : 350&nbsp;€ à la commande' : ''}` : `+ ${sv}&nbsp;€ par mois de suivi`; if (un) un.textContent = E.nf ? '€/mois' : '€'; }
    repere(c);
  };
  const cartes = $$('[data-of]');
  cartes.forEach(c => {
    $$('.sel [role="radio"]', c).forEach(b => b.addEventListener('click', () => { $$('.sel [role="radio"]', c).forEach(x => x.setAttribute('aria-checked', String(x === b))); majCarte(c); }));
    $$('.opt .op', c).forEach(i => i.addEventListener('click', () => { i.setAttribute('aria-pressed', String(i.getAttribute('aria-pressed') !== 'true')); majCarte(c); }));
    const bm = $('.bascule[data-mo]', c);
    if (bm) $$('button', bm).forEach(b => b.addEventListener('click', () => { bm.dataset.v = b.dataset.v; $$('button', bm).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.mois = b.dataset.v; majCarte(c); }));
    const bn = $('.bascule[data-nf]', c);
    if (bn) { const pose = () => { const b = $('[aria-pressed="true"]', bn); if (b) { bn.style.setProperty('--x', b.offsetLeft + 'px'); bn.style.setProperty('--w', b.offsetWidth + 'px'); } };
      $$('button', bn).forEach(b => b.addEventListener('click', () => { $$('button', bn).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.nf = b.dataset.v; pose(); majCarte(c); }));
      pose(); addEventListener('resize', pose); document.fonts && document.fonts.ready.then(pose); }
    const ba = $('.bascule[data-ap]', c);
    if (ba) $$('button', ba).forEach(b => b.addEventListener('click', () => { ba.dataset.v = b.dataset.v; $$('button', ba).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.achat = b.dataset.v; majCarte(c); }));
    /* un clic n'importe où sur la carte ouvre le devis, avec ce qui a été choisi */
    c.addEventListener('click', e => { if (e.target.closest('.sel,.opt,.bascule,a')) return; ouvreDevis(etatCarte(c)); });
    repere(c);
  });
  addEventListener('resize', () => cartes.forEach(repere));
  document.fonts && document.fonts.ready.then(() => cartes.forEach(repere));
  const vraies = $('.vraies');
  if (swPh) swPh.addEventListener('change', () => { if (vraies) vraies.classList.toggle('on', swPh.checked); $$('[data-of][data-k="site"]').forEach(c => majCarte(c)); });

  /* carrousels tactiles : le sens du geste est décidé au départ ; vertical, les cartes restent immobiles */
  const verrou = el => {
    if (!el || !tactile) return; el.style.touchAction = 'pan-y'; el.style.overflowY = 'hidden'; let x0 = 0, y0 = 0, s0 = 0, t0 = 0, axe = null, dx = 0;
    el.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; s0 = el.scrollLeft; t0 = performance.now(); axe = null; dx = 0; }, { passive: true });
    el.addEventListener('touchmove', e => {
      const t = e.touches[0]; dx = t.clientX - x0; const dy = t.clientY - y0;
      if (!axe && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) axe = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axe === 'x') { e.preventDefault(); el.style.scrollSnapType = 'none'; el.scrollLeft = s0 - dx; }
    }, { passive: false });
    el.addEventListener('touchend', () => {
      if (axe !== 'x') return; const v = dx / Math.max(1, performance.now() - t0), cible = s0 - dx - v * 220;
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0, kids = [...el.children];
      let best = 0, bd = 1e9; kids.forEach(k => { const x = k.offsetLeft - el.firstElementChild.offsetLeft; const d = Math.abs(x - cible); if (d < bd) { bd = d; best = x; } });
      el.scrollTo({ left: Math.max(0, best + (pad ? 0 : 0)), behavior: 'smooth' }); setTimeout(() => { el.style.scrollSnapType = ''; }, 500);
    }, { passive: true });
  };
  $$('[data-grp], .rail, #gpSim').forEach(verrou);
  /* points sous les carrousels mobiles */
  $$('[data-grp]').forEach(g => {
    const d = g.nextElementSibling; if (!d || !d.classList.contains('dots')) return;
    d.innerHTML = '<i></i>'.repeat(g.children.length);
    const maj = () => { const n = [...g.children].filter(x => !x.hidden).length; const w = g.scrollWidth - g.clientWidth; const k = w > 0 ? Math.round(g.scrollLeft / w * (n - 1)) : 0; $$('i', d).forEach((x, j) => x.classList.toggle('on', j === k)); };
    g.addEventListener('scroll', maj, { passive: true }); maj();
  });

  /* rails : glisser à la souris, flèches, défilement lent tant que personne n'y touche */
  const rails = [];
  const rail = el => {
    if (!el) return; const R = { el, pos: el.scrollLeft, attente: performance.now() + 1500, vis: false, fin: 0 }; rails.push(R);
    const tiens = ms => { R.attente = performance.now() + ms; R.pos = el.scrollLeft; el.style.scrollSnapType = ''; };
    if (!tactile) { let x0 = 0, s0 = 0, bas = false;
      el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; bas = true; el.moved = false; x0 = e.clientX; s0 = el.scrollLeft; tiens(1e9); });
      addEventListener('pointermove', e => { if (!bas) return; const d = e.clientX - x0; if (Math.abs(d) > 6) { el.moved = true; el.classList.add('drag'); } if (el.moved) el.scrollLeft = s0 - d; });
      addEventListener('pointerup', () => { if (!bas) return; bas = false; el.classList.remove('drag'); setTimeout(() => el.moved = false, 30); tiens(3000); });
      el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') tiens(1e9); });
      el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !bas) tiens(1200); });
    }
    el.addEventListener('touchstart', () => tiens(1e9), { passive: true });
    el.addEventListener('touchend', () => tiens(5000), { passive: true });
    el.addEventListener('wheel', () => tiens(4000), { passive: true });
    el.addEventListener('focusin', () => tiens(1e9));
    el.addEventListener('click', e => { if (el.moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    new IntersectionObserver(e => { R.vis = e[0].isIntersecting; }, { threshold: .2 }).observe(el);
    R.tiens = tiens; return R;
  };
  const vitesse = tactile ? 22 : 28; let tP = performance.now();
  const derive = t => {
    const dt = Math.min(64, t - tP); tP = t;
    if (!reduit) rails.forEach(R => {
      if (!R.vis || document.hidden || t < R.attente) return;
      const el = R.el, max = el.scrollWidth - el.clientWidth; if (max <= 4) return;
      if (Math.abs(el.scrollLeft - Math.round(R.pos)) > 2) R.pos = el.scrollLeft;
      if (R.pos >= max - 1) { if (!R.fin) R.fin = t; else if (t - R.fin > 2200) { R.fin = 0; el.style.scrollSnapType = ''; el.scrollTo({ left: 0, behavior: 'smooth' }); R.pos = 0; R.attente = t + 2400; } return; }
      el.style.scrollSnapType = 'none'; R.pos = Math.min(max, R.pos + vitesse * dt / 1000); el.scrollLeft = R.pos;
    });
    requestAnimationFrame(derive);
  };
  requestAnimationFrame(derive);
  addEventListener('touchstart', () => rails.forEach(R => { R.attente = Math.max(R.attente, performance.now() + 6000); }), { passive: true });
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => { const R = rails.find(x => x.el.id === b.dataset.rail); if (!R) return; R.tiens(8000); R.el.scrollBy({ left: Number(b.dataset.d) * R.el.clientWidth * .7, behavior: 'smooth' }); setTimeout(() => R.pos = R.el.scrollLeft, 700); }));

  /* reportages */
  const K = { scene: 'Concert', public: 'Festival', corp: 'Événementiel et institutions', ident: 'Identités visuelles', camp: 'Campagnes', edit: 'Éditions' };
  // trois familles de reportages : concerts et festivals, événementiel et institutions, portraits et métiers
  const CAT = r => r.k === 'corp' ? (r.id === 'fl-auto-photo' ? 'metier' : 'inst') : 'concert';
  const FI = [['tout', 'Tout'], ['concert', 'Concerts et festivals'], ['inst', 'Événementiel et institutions'], ['metier', 'Portraits et métiers']];
  const GRAPH = window.GRAPH || [];
  const trouve = id => REPS.find(x => x.id === id) || GRAPH.find(x => x.id === id);
  const REPS = window.REPS || []; let filtre = 'tout';
  const railR = $('#rail'), chips = $('#chips');
  const dessine = () => {
    if (!railR) return;
    const L = filtre === 'tout' ? REPS : REPS.filter(r => CAT(r) === filtre);
    let h = '';
    L.forEach((r, i) => {
      h += `<a class="rc" href="/${r.id}/" data-r="${r.id}"><span class="im"><img src="/p/t/${r.ph[0]}.webp" alt="" loading="${i < 8 ? 'eager' : 'lazy'}" decoding="async"><span class="rafale" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></span></span><span class="lab"><b>${r.t}</b><span>${K[r.k] || ''}</span><small>${r.ph.length} photos</small></span></a>`;
    });
    railR.innerHTML = h; rangs(railR); if (railR.classList.contains('vu') && !reduit) { railR.classList.remove('vu'); void railR.offsetWidth; requestAnimationFrame(() => railR.classList.add('vu')); } railR.scrollLeft = 0; const R = rails.find(x => x.el === railR); if (R) { R.pos = 0; R.fin = 0; R.attente = performance.now() + 1500; }
  };
  if (railR) {
    rail(railR);
    FI.forEach(([k, l], i) => {
      const n = k === 'tout' ? REPS.length : REPS.filter(r => CAT(r) === k).length; if (!n) return;
      const b = document.createElement('button'); b.innerHTML = `${l}<small>${n}</small>`; b.setAttribute('aria-pressed', String(!i));
      b.addEventListener('click', () => { $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); filtre = k; dessine(); });
      chips.appendChild(b);
    });
    dessine();
    /* survol : la carte passe en rafale et montre quatre images du reportage */
    if (!tactile && !reduit) {
      let raf = null;
      const stop = () => { if (!raf) return; clearInterval(raf.t); raf.c.classList.remove('raf'); raf.img.src = `/p/t/${raf.r.ph[0]}.webp`; $$('.rafale i', raf.c).forEach((x, j) => x.classList.toggle('on', !j)); raf = null; };
      railR.addEventListener('pointerover', e => {
        const c = e.target.closest('.rc'); if (!c || (raf && raf.c === c)) return; stop();
        const r = REPS.find(x => x.id === c.dataset.r); if (!r || r.ph.length < 2) return;
        const img = $('.im img', c), L = r.ph.slice(0, 4); L.forEach(p => { const x = new Image(); x.src = `/p/t/${p}.webp`; });
        let j = 0; raf = { c, img, r, t: setInterval(() => { j = (j + 1) % L.length; img.src = `/p/t/${L[j]}.webp`; $$('.rafale i', c).forEach((x, q) => x.classList.toggle('on', q === j)); }, 420) }; c.classList.add('raf');
      });
      railR.addEventListener('pointerleave', stop);
      railR.addEventListener('pointerout', e => { if (raf && !raf.c.contains(e.relatedTarget)) stop(); });
    }
    railR.addEventListener('click', e => { const c = e.target.closest('[data-r]'); if (c) { e.preventDefault(); ouvreGal(REPS.find(r => r.id === c.dataset.r)); } });
  }
  rail($('#usages')); rail($('#reals'));
  /* toutes les cartes de rail arrivent de la même façon, l'une après l'autre, dès que le rail entre à l'écran */
  const vuR = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vu'); vuR.unobserve(e.target); } }), { threshold: .12 });
  $$('.rail').forEach(el => { rangs(el); if (reduit) el.classList.add('vu'); else vuR.observe(el); });

  /* cartes d'usage : un toucher retourne la carte */
  $$('.us[aria-pressed]').forEach(b => b.addEventListener('click', () => { const R = rails.find(x => x.el.id === 'usages'); if (R && R.el.moved) return; b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); }));

  /* galerie d'un reportage, puis la photo en grand */
  const gp = $('#gp'), gpG = $('#gpG'), lb = $('#lb'), lbI = $('#lbI'); const G = { r: null, i: 0 };
  let avantG = null;
  const ouvreGal = r => {
    if (!gp || !r) return; G.r = r;
    $('#gpK').textContent = K[r.k] || 'Reportage'; const gpf = $('.gp-f .d'); if (gpf) gpf.textContent = GRAPH.includes(r) ? 'Un projet graphique\u00a0?' : 'Un événement à photographier\u00a0?'; $('#gpT').textContent = r.t; $('#gpS').textContent = r.ph.length + ' photos';
    const RAT = window.RAT || {}; gpG.innerHTML = r.ph.map((p, i) => `<button data-i="${i}" aria-label="Agrandir la photo ${i + 1}" style="aspect-ratio:${RAT[p] || .75}"${i ? '' : ' class="une"'}><img src="${i ? `/p/t/${p}.webp` : `/p/${p}.jpg`}" width="640" height="${Math.round(640 / (RAT[p] || .75))}" alt="${r.t}, photo ${i + 1}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"></button>`).join('');
    gpG.querySelectorAll('img').forEach(im => { const ok = () => im.classList.add('ok'); if (im.complete) ok(); else im.addEventListener('load', ok, { once: true }); });
    const tous = GRAPH.includes(r) ? GRAPH : REPS; const autres = tous.filter(x => x !== r && x.k === r.k).concat(tous.filter(x => x !== r && x.k !== r.k)).slice(0, 4);
    $('#gpSim').innerHTML = autres.map(x => `<button data-r="${x.id}"><img src="/p/t/${x.ph[0]}.webp" alt="" loading="lazy"><b>${x.t}</b></button>`).join('');
    if (gp.hidden) { avantG = document.activeElement; gp.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => gp.classList.add('on'))); document.documentElement.style.overflow = 'hidden'; if (dock) dock.classList.add('cache'); setTimeout(() => $('#gpB').focus({ preventScroll: true }), 80); }
    gp.scrollTop = 0; try { history.replaceState(null, '', '#r=' + r.id); } catch (e) {}
    $$('button', gpG).forEach(b => b.classList.add('in'));
    compte('/galerie/' + r.id, 'Galerie : ' + r.t);
  };
  const fermeGal = () => { if (!gp || gp.hidden) return; fermeLb(); gp.classList.remove('on'); document.documentElement.style.overflow = ''; if (dock) dock.classList.remove('cache'); setTimeout(() => gp.hidden = true, 400); try { history.replaceState(null, '', location.pathname); } catch (e) {} if (avantG) avantG.focus({ preventScroll: true }); };
  /* visionneuse : la photo part de sa vignette, suit le doigt d'une image à l'autre, et retourne à sa place quand on la tire vers le bas */
  const RMV = matchMedia('(prefers-reduced-motion: reduce)').matches, ECART = 28;
  let V = null, fermant = 0;
  const monteLb = () => {
    if (V) return V;
    const f = document.createElement('div'); f.className = 'lb-f'; const st = document.createElement('div'); st.className = 'lb-s';
    const ims = [lbI, lbI.cloneNode(), lbI.cloneNode()]; ims[1].removeAttribute('id'); ims[2].removeAttribute('id');
    const vs = ims.map(im => { const v = document.createElement('div'); v.className = 'lb-v'; v.appendChild(im); st.appendChild(v); im.draggable = false; return v; });
    lb.prepend(st); lb.prepend(f);
    return V = { f, st, vs, ims, o: [0, 1, 2], x: 0, a: 0 };
  };
  const pasLb = () => innerWidth + ECART;
  const poseLb = x => { V.x = x; V.st.style.transform = x ? `translate3d(${x}px,0,0)` : ''; };
  const rangeLb = () => V.o.forEach((k, j) => { V.vs[k].style.transform = j === 1 ? '' : `translate3d(${(j - 1) * pasLb()}px,0,0)`; });
  const tailleLb = (im, q) => { const lw = innerWidth > 600 ? Math.min(innerWidth * .94, 1400) : innerWidth, lh = innerHeight * .86, w = Math.min(lw, lh * q); im.style.width = Math.round(w) + 'px'; im.style.height = Math.round(w / q) + 'px'; im.style.borderRadius = w >= innerWidth - 1 ? '0' : '6px'; };
  const vignLb = i => { const z = gp && !gp.hidden ? gpG : $('[data-rp]'); return z ? z.querySelector(`[data-i="${i}"] img`) : null; };
  const chargeLb = (k, i) => {
    const r = G.r, n = r.ph.length, p = r.ph[(i + n) % n], im = V.ims[k], RAT = window.RAT || {};
    if (im.dataset.p === p) { tailleLb(im, +im.dataset.q); return; }
    const v = vignLb((i + n) % n), q = RAT[p] || (v && v.naturalWidth ? v.naturalWidth / v.naturalHeight : .75);
    im.dataset.p = p; im.dataset.q = q; tailleLb(im, q); im.alt = `${r.t}, photo ${(i + n) % n + 1} sur ${n}`;
    im.src = v && v.complete && v.naturalWidth ? (v.currentSrc || v.src) : `/p/t/${p}.webp`;
    const g = new Image(); g.src = `/p/${p}.jpg`; const pret = () => { if (im.dataset.p !== p) return; if (!RAT[p] && g.naturalWidth) { im.dataset.q = g.naturalWidth / g.naturalHeight; tailleLb(im, +im.dataset.q); } im.src = g.src; };
    if (g.decode) g.decode().then(pret, pret); else g.onload = pret;
  };
  const marqueLb = () => { $$('.lb-src').forEach(e => e.classList.remove('lb-src')); const v = vignLb(G.i); if (v && !lb.hidden) v.parentNode.classList.add('lb-src'); };
  const majLb = () => { const n = G.r.ph.length; $('#lbC').textContent = (G.i + 1) + ' / ' + n; V.vs[V.o[0]].style.visibility = V.vs[V.o[2]].style.visibility = n > 1 ? '' : 'hidden'; V.ims.forEach((im, k) => im.setAttribute('aria-hidden', k === V.o[1] ? 'false' : 'true')); marqueLb(); };
  /* trajet entre la vignette et la photo en grand : même cadrage au départ, le recadrage s'ouvre en route */
  const trajetLb = (im, v) => {
    const a = v.getBoundingClientRect(), b = im.getBoundingClientRect(); if (!a.width || !b.width) return null;
    const e = Math.max(a.width / b.width, a.height / b.height), ix = Math.max(0, (b.width - a.width / e) / 2), iy = Math.max(0, (b.height - a.height / e) / 2), ry = parseFloat(getComputedStyle(v).borderTopLeftRadius) || parseFloat(getComputedStyle(v.parentNode).borderTopLeftRadius) || 0;
    return { transform: `translate(${a.left + a.width / 2 - b.left - b.width / 2}px,${a.top + a.height / 2 - b.top - b.height / 2}px) scale(${e})`, clipPath: `inset(${iy}px ${ix}px ${iy}px ${ix}px round ${ry / e}px)` };
  };
  const PLEIN = im => ({ transform: 'translate(0px,0px) scale(1)', clipPath: `inset(0px 0px 0px 0px round ${im.style.borderRadius || '0px'})` });
  const arretLb = () => { if (V && V.a) { cancelAnimationFrame(V.a); V.a = 0; } };
  const ressortLb = (v0, fin) => {
    arretLb(); if (RMV) { poseLb(0); if (fin) fin(); return; }
    let x = V.x, v = v0, t0 = performance.now();
    const f = t => { let dt = Math.min(.12, (t - t0) / 1000); t0 = t; for (let n = Math.max(1, Math.ceil(dt / .006)), h = dt / n, i = 0; i < n; i++) { v += (-240 * x - 29 * v) * h; x += v * h; } if (Math.abs(x) < .5 && Math.abs(v) < 12) { V.a = 0; poseLb(0); if (fin) fin(); return; } poseLb(x); V.a = requestAnimationFrame(f); };
    V.a = requestAnimationFrame(f);
  };
  /* photo suivante ou précédente : les rôles tournent tout de suite, la rangée rattrape sa place avec l'élan du geste */
  const vaLb = (d, v0) => {
    const n = G.r.ph.length; if (n < 2 || fermant) return; arretLb();
    G.i = (G.i + d + n) % n; V.o = d > 0 ? [V.o[1], V.o[2], V.o[0]] : [V.o[2], V.o[0], V.o[1]];
    chargeLb(V.o[d > 0 ? 2 : 0], G.i + d); rangeLb(); poseLb(V.x + d * pasLb()); majLb(); ressortLb(v0 || 0);
  };
  const finLb = () => { fermant = 0; lb.hidden = true; lb.classList.remove('tire'); $$('.lb-src').forEach(e => e.classList.remove('lb-src')); if (V) { V.ims.forEach(im => { im.getAnimations().forEach(a => a.cancel()); im.style.transform = ''; }); V.f.style.cssText = ''; poseLb(0); } };
  const ouvreLb = i => {
    const r = G.r, n = r.ph.length; if (fermant) { clearTimeout(fermant); finLb(); }
    monteLb(); arretLb(); G.i = (i + n) % n; chargeLb(V.o[1], G.i); if (n > 1) { chargeLb(V.o[0], G.i - 1); chargeLb(V.o[2], G.i + 1); } rangeLb(); poseLb(0);
    const neuf = lb.hidden; if (neuf) { lb.hidden = false; lb.offsetWidth; lb.classList.add('on'); $('#lbX').focus({ preventScroll: true }); }
    const im = V.ims[V.o[1]], v = vignLb(G.i), de = neuf && !RMV && v ? trajetLb(im, v) : null;
    majLb();
    if (de) im.animate([de, PLEIN(im)], { duration: 520, easing: 'cubic-bezier(.2,.85,.2,1)' });
    else if (neuf) im.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  };
  const fermeLb = () => {
    if (!lb || lb.hidden || fermant) return; arretLb(); poseLb(0);
    const im = V.ims[V.o[1]], v = vignLb(G.i), ici = im.style.transform || 'translate(0px,0px) scale(1)';
    if (v && !RMV) v.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    im.style.transform = ''; const vers = v && !RMV ? trajetLb(im, v) : null;
    V.f.style.transition = ''; V.f.style.opacity = ''; lb.classList.remove('on');
    if (vers) { im.animate([Object.assign(PLEIN(im), { transform: ici }), vers], { duration: 420, easing: 'cubic-bezier(.3,.75,.2,1)', fill: 'forwards' }); }
    else im.animate([{ transform: ici, opacity: 1 }, { transform: ici, opacity: 0 }], { duration: 240, fill: 'forwards' });
    fermant = setTimeout(() => { finLb(); if (v && v.parentNode.focus) v.parentNode.focus({ preventScroll: true }); }, vers ? 430 : 250);
  };
  if (gp) {
    $('#gpB').addEventListener('click', fermeGal);
    gpG.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) ouvreLb(+b.dataset.i); });
    $('#gpSim').addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) ouvreGal(trouve(b.dataset.r)); });
    $('#gpGo').addEventListener('click', () => { const r = G.r; fermeGal(); const gk = r && { ident: 'identite', camp: 'campagne', edit: 'edition' }[r.k]; ouvreDevis(gk ? { k: gk, f: 0, o: [] } : { k: 'evenement', f: r && r.k === 'public' ? 2 : 0, o: [] }); });
    $('#lbP').addEventListener('click', () => vaLb(-1)); $('#lbN').addEventListener('click', () => vaLb(1)); $('#lbX').addEventListener('click', fermeLb);
    lb.addEventListener('click', e => { if (!e.target.closest('img,button')) fermeLb(); });
    /* geste : le sens est décidé au départ ; à l'horizontale la rangée suit le doigt, vers le bas la photo se détache et le fond s'éclaircit */
    let g = null;
    const zoome = () => window.visualViewport && visualViewport.scale > 1.02;
    lb.addEventListener('touchstart', e => { if (e.touches.length > 1 || zoome() || fermant || !V) { g = null; return; } const t = e.touches[0]; arretLb(); g = { x: t.clientX, y: t.clientY, x0: V.x, s: 0, dx: 0, dy: 0, vx: 0, vy: 0, lx: t.clientX, ly: t.clientY, lt: e.timeStamp }; }, { passive: true });
    lb.addEventListener('touchmove', e => {
      if (!g) return; if (e.touches.length > 1) { const s = g.s; g = null; if (s === 1) ressortLb(0); else if (s === 2) lacheLb(); return; }
      const t = e.touches[0]; g.dx = t.clientX - g.x; g.dy = t.clientY - g.y;
      if (!g.s) { if (Math.hypot(g.dx, g.dy) < 8) return; g.s = Math.abs(g.dx) > Math.abs(g.dy) ? 1 : g.dy > 0 ? 2 : 3; if (g.s === 2) lb.classList.add('tire'); }
      if (e.cancelable) e.preventDefault();
      const dt = e.timeStamp - g.lt; if (dt > 0) { g.vx = .6 * (t.clientX - g.lx) / dt + .4 * g.vx; g.vy = .6 * (t.clientY - g.ly) / dt + .4 * g.vy; g.lx = t.clientX; g.ly = t.clientY; g.lt = e.timeStamp; }
      if (g.s === 1) poseLb(g.x0 + (G.r.ph.length > 1 ? g.dx : g.dx * .25));
      else if (g.s === 2) { const dy = Math.max(0, g.dy), k = Math.max(.5, 1 - dy / innerHeight * .8); V.ims[V.o[1]].style.transform = `translate(${g.dx * .9}px,${dy}px) scale(${k})`; V.f.style.transition = 'none'; V.f.style.opacity = Math.max(0, 1 - dy / (innerHeight * .45)); }
    }, { passive: false });
    const lacheLb = () => { const im = V.ims[V.o[1]], ici = im.style.transform; lb.classList.remove('tire'); V.f.style.transition = ''; V.f.style.opacity = ''; im.style.transform = ''; if (ici && !RMV) im.animate([{ transform: ici }, { transform: 'translate(0px,0px) scale(1)' }], { duration: 420, easing: 'cubic-bezier(.3,1.35,.5,1)' }); };
    const finGeste = e => {
      if (!g) return; const o = g; g = null;
      if (o.s === 1) { const W = innerWidth, seul = G.r.ph.length < 2, d = seul ? 0 : (V.x < -W * .2 || o.vx < -.45) && V.x < 0 ? 1 : (V.x > W * .2 || o.vx > .45) && V.x > 0 ? -1 : 0; if (d) vaLb(d, o.vx * 1000); else ressortLb(o.vx * 1000); }
      else if (o.s === 2) { if (e.type === 'touchend' && (o.dy > 110 || o.vy > .55)) fermeLb(); else lacheLb(); }
    };
    lb.addEventListener('touchend', finGeste, { passive: true }); lb.addEventListener('touchcancel', finGeste, { passive: true });
    addEventListener('resize', () => { if (V && !lb.hidden) { V.ims.forEach(im => im.dataset.q && tailleLb(im, +im.dataset.q)); rangeLb(); } });
    addEventListener('keydown', e => { if (!lb.hidden) { if (e.key === 'ArrowRight') vaLb(1); else if (e.key === 'ArrowLeft') vaLb(-1); else if (e.key === 'Escape') fermeLb(); } else if (!gp.hidden && e.key === 'Escape') fermeGal(); });
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-r]'); if (!c || c.closest('#rail') || c.closest('#gpSim') || !gp) return;
    const r = trouve(c.dataset.r); if (!r) return; e.preventDefault(); ouvreGal(r);
  });
  /* page d'un reportage : les photos s'ouvrent en grand dans la même visionneuse */
  const rp = $('[data-rp]');
  if (rp && lb) rp.addEventListener('click', e => { const a = e.target.closest('[data-i]'); const r = trouve(rp.dataset.rp); if (!a || !r) return; e.preventDefault(); G.r = r; ouvreLb(+a.dataset.i); });
  const h = location.hash.match(/^#r=([\w-]+)/);
  if (h) { const r = trouve(h[1]); if (r && gp) setTimeout(() => ouvreGal(r), 300); else { const go = { soute: '/projets/la-soute/', marelle: '/projets/mjc-la-marelle/' }[h[1]]; if (go) location.replace(go); else { const t = $('#travaux'); if (t) setTimeout(() => t.scrollIntoView(), 200); } } }

  /* feuilles */
  const voile = $('#voile'); let ouverte = null, avant = null;
  const ouvreF = id => { const s = $(id); if (!s) return; if (ouverte && ouverte !== s) { ouverte.classList.remove('on'); ouverte.hidden = true; } else avant = document.activeElement; s.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => { s.classList.add('on'); voile.classList.add('on'); })); ouverte = s; document.documentElement.style.overflow = 'hidden'; if (dock) dock.classList.add('cache'); setTimeout(() => { const f = $('.x', s); if (f) f.focus({ preventScroll: true }); }, 80); };
  const fermeF = () => { if (!ouverte) return; const s = ouverte; s.classList.remove('on'); voile.classList.remove('on'); document.documentElement.style.overflow = ''; if (dock) dock.classList.remove('cache'); setTimeout(() => { if (!s.classList.contains('on')) s.hidden = true; }, 600); ouverte = null; if (avant) avant.focus({ preventScroll: true }); };
  voile.addEventListener('click', fermeF); $$('[data-close]').forEach(b => b.addEventListener('click', fermeF));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) fermeF(); });
  $$('[data-legal]').forEach(b => b.addEventListener('click', () => ouvreF('#shL')));
  $$('[data-msg]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ouvreF('#shM'); setTimeout(() => $('#ecrire [name=nom]').focus({ preventScroll: true }), 450); }));

  /* envoi par le service de formulaires (Supabase) */
  const envoie = async champs => {
    const r = await fetch('https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/formulaire', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ _template: 'table', _captcha: 'false' }, champs)) });
    if (!r.ok) throw new Error('envoi'); return r;
  };
  const mailOk = m => /^\S+@\S+\.\S+$/.test(m || '');

  /* devis : grille du 20 octobre 2026, prix « dès » */
  const PJ = {
    mariage: { l: 'Un mariage', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Formule', o: [['Cérémonie', 1290, 'Moments clés, 4 à 6 h'], ['Journée', 1890, '8 à 10 h sur place'], ['Journée et album', 2590, 'Album imprimé, séance à deux']] }, o: { l: 'Options', o: [['Aperçu de 20 photos le soir même', 150], ['Une heure de plus', 80]] } },
    evenement: { l: 'Un événement', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Durée', o: [['Concert', 250, 'Spectacle, 1 h 30 à 2 h'], ['Demi-journée', 350, '4 h sur place'], ['Journée ou festival', 550, '8 h sur place, par jour', 'j']] }, o: { l: 'Options', o: [['Sélection livrée le soir même', 150], ['Une heure de plus', 80]] } },
    annee: { l: 'Un suivi photo annuel', g: 'Photographie', ic: 'ca', f: { l: 'Forfait', o: [['4 demi-journées', [1290, 109], 'soit 323 € l’une'], ['8 demi-journées', [2490, 209], 'soit 311 € l’une'], ['12 demi-journées', [3590, 299], 'soit 299 € l’une'], ['Plus de 12', null, 'sur devis']] }, p: { l: 'Paiement', o: [['Par an', 'en une fois'], ['Par mois', 'sur 12 mois']] } },
    site: { l: 'Un site internet', g: 'Web', ic: 'ec', f: { l: 'Formule', o: [['Essentiel', [490, [6, 12]], 'Une page'], ['Vitrine', [990, [6, 12, 24]], '3 à 5 pages'], ['Sur mesure', [1990, [6, 12, 24]], 'Autant de pages qu’il faut'], ['À définir ensemble', null, 'On en parle']] }, p: { l: 'Paiement, sans frais', o: [['En une fois', 'acompte de 30 %', 0], ['En 6 fois', 'par carte', 6], ['En 12 fois', 'par carte', 12], ['En 24 fois', 'par carte', 24]] }, o: { l: 'En plus', o: [['Reportage photo du lieu et de l’équipe', 350], ['Une fonction sur mesure', null]] } },
    app: { l: 'Une application', g: 'Web', ic: 'pl', f: { l: 'Formule', o: [['Outil simple', [490, [6, 12], 9], 'Une seule fonction : devis en ligne, quiz, réservation simple'], ['Application', [990, [6, 12, 24], 19], 'Des comptes : inscriptions d’adhérents, planning, suivi de dossiers'], ['Plateforme', [1990, [6, 12, 24], 39], 'Toute une activité : espace client, paiements, e-mails automatiques'], ['Une idée à préciser', null, 'On en parle']] }, p: { l: 'Paiement, sans frais', o: [['En une fois', 'acompte de 30 %', 0], ['En 6 fois', 'par carte', 6], ['En 12 fois', 'par carte', 12], ['En 24 fois', 'par carte', 24]] } },
    identite: { l: 'Une identité visuelle', g: 'Design graphique', ic: 'gr', f: { l: 'Projet', o: [['Logo et univers', null, 'Logotype, couleurs, typographies'], ['Identité complète', null, 'Charte et déclinaisons'], ['Identité et signalétique', null, 'Enseigne, panneaux, lieux'], ['À définir ensemble', null, 'On en parle']] } },
    campagne: { l: 'Une campagne', g: 'Design graphique', ic: 'ms', date: 1, f: { l: 'Projet', o: [['Événement ou festival', null, 'Affiche et déclinaisons'], ['Saison culturelle', null, 'Direction artistique de saison'], ['Recrutement ou institution', null, 'Message, affichage, réseaux'], ['À définir ensemble', null, 'On en parle']] } },
    edition: { l: 'Une édition', g: 'Design graphique', ic: 's3', date: 1, f: { l: 'Support', o: [['Brochure ou programme', null, '8 à 40 pages'], ['Magazine ou catalogue', null, 'Numéros réguliers'], ['Dépliant ou plaquette', null, 'Recto verso, plis'], ['À définir ensemble', null, 'On en parle']] } },
  };
  const estB = $('#estB'), estF = $('#estF');
  let ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: {}, d: 5 };
  const calc = () => {
    if (!ES.k) return null; const P = PJ[ES.k], f = P.f.o[ES.f]; let a = 0, m = 0, dv = false, per = ''; const L = [f[0]];
    if (ES.k === 'annee') { if (f[1] == null) dv = true; else if (ES.p) { m = f[1][1]; per = 'par mois, sur 12 mois'; } else { a = f[1][0]; per = 'par an'; } if (f[1]) L.push(ES.p ? 'paiement au mois' : 'paiement à l’année'); }
    else if (ES.k === 'site' || ES.k === 'app') { const nb = nfSite(f), sv = f[1] ? (f[1][2] || 9) : 9; if (f[1] == null) dv = true; else if (nb) { m = Math.floor(f[1][0] * 100 / nb) / 100 + sv; per = `par mois pendant ${nb} mois, suivi compris, puis ${sv} € par mois`; L.push(`en ${nb} fois sans frais`); } else { a = f[1][0]; m = sv; L.push('en une fois'); } }
    else { if (f[1] == null) dv = true; else a = f[1] * (f[3] === 'j' ? ES.j : 1); if (f[3] === 'j') L[0] += `, ${ES.j} jour${ES.j > 1 ? 's' : ''}`; }
    if (P.o) ES.o.forEach(i => { const o = P.o.o[i]; if (o[1] == null) dv = true; else a += o[1]; L.push(o[0]); });
    if (ES.k === 'site' && ES.fl) L.push('le faire vivre avec Fill');
    return { a, m, dv, per, L };
  };
  /* site : nombre de mensualités choisi, ramené à une valeur que la formule propose (l'Essentiel s'arrête à 12) */
  const nfSite = f => { const P = PJ[ES.k], nb = P && P.p && P.p.o[ES.p] ? P.p.o[ES.p][2] : 0; return f && f[1] && Array.isArray(f[1][1]) && f[1][1].includes(nb) ? nb : 0; };
  const formDemande = () => {
    const P = PJ[ES.k], r = calc(), c = ES.c, q = s => (s || '').replace(/"/g, '&quot;');
    if (P.date && ES.d != null && !c.date) c.date = moisTxt().replace(/^./, m => m.toUpperCase()) + ', ';
    const recap = ES.multi ? `<div class="recap"><button type="button" class="rc-mod" data-mod>Modifier</button><b>Votre sélection</b>${ES.multi.join('<br>')}</div>` : `<div class="recap"><button type="button" class="rc-mod" data-mod>Modifier</button><b>${P.l}</b>${r.L.concat(P.date && ES.d != null ? [moisTxt()] : []).join(' · ')}<br>Estimation : ${txtEst(r)}</div>`;
    return recap + `<div class="form" style="margin-top:16px">
        <label>Nom, structure<input id="eNom" autocomplete="name" value="${q(c.nom)}"></label>
        <label>E-mail<input id="eMail" type="email" autocomplete="email" value="${q(c.mail)}"></label>
        <label>Téléphone, si vous préférez être rappelé<input id="eTel" type="tel" autocomplete="tel" value="${q(c.tel)}"></label>
        ${P.date || ES.k === 'annee' ? `<label>${ES.k === 'annee' ? 'Vos temps forts de l’année, même approximatifs' : 'Date et lieu, même approximatifs'}<input id="eDate" value="${q(c.date)}"></label>` : ''}
        <label>Précisions<textarea id="eMsg" placeholder="Facultatif">${c.msg || ''}</textarea></label></div>`;
  };
  const modeCmd = () => ES.e === 2 && !!clesCommande() && !ES.multi && ES.mode !== 'dem';
  const choixFin = () => `<div class="q fin-c"><p>Comment voulez-vous avancer&nbsp;?</p><div class="fc" role="radiogroup">
    <button type="button" role="radio" data-mode="cmd" aria-checked="${ES.mode !== 'dem'}"><span class="rd"></span><b>Commander maintenant</b><small>Devis immédiat, paiement sécurisé par carte, le projet démarre.</small></button>
    <button type="button" role="radio" data-mode="dem" aria-checked="${ES.mode === 'dem'}"><span class="rd"></span><b>En parler d’abord</b><small>Une réponse sous 48&nbsp;h, sans engagement.</small></button></div></div>`;
  /* « Trouver ce qu'il me faut » : six situations en cartes ; on glisse à droite (c'est moi) ou à gauche (pas moi), puis une seule recommandation */
  const SW = [
    { k: 'trouve', t: 'Peu de gens me trouvent sur internet.', c: '#B9B4FF', ic: 'ec', w: 'vous voulez être trouvé en ligne' },
    { k: 'vieux', t: 'J’ai déjà un site, mais il a vieilli.', c: '#F6B8C4', ic: 's3', w: 'votre site actuel a vieilli' },
    { k: 'multi', t: 'Je propose plusieurs services ou plusieurs métiers.', c: '#9FDCC3', ic: 'sx', w: 'vous avez plusieurs services à présenter' },
    { k: 'questions', t: 'On me pose toujours les mêmes questions.', c: '#F5D199', ic: 'ms', w: 'on vous pose toujours les mêmes questions' },
    { k: 'resa', t: 'Inscriptions, réservations ou plannings se gèrent encore à la main.', c: '#A9CCFF', ic: 'ca', w: 'une partie de votre organisation se fait encore à la main' },
    { k: 'clients', t: 'Mes clients voudraient suivre leur demande ou payer en ligne.', c: '#D7E8A4', ic: 'cu', w: 'vos clients veulent suivre leur demande en ligne' }
  ];
  /* une recommandation par besoin : un site si l'une des trois premières cartes parle, une application si l'une des trois dernières parle */
  const recos = () => {
    const Y = ES.sw.r, oui = k => Y[k] === 1, L = [];
    const ws = ['trouve', 'vieux', 'multi'].filter(oui), wa = ['questions', 'resa', 'clients'].filter(oui);
    if (ws.length) L.push({ k: 'site', f: oui('multi') ? 1 : 0, w: ws, t: SW.find(c => c.k === ws[0]).c });
    if (wa.length) { const f = oui('clients') ? 2 : oui('resa') ? 1 : 0; L.push({ k: 'app', f, w: wa, t: SW.find(c => c.k === wa[wa.length - 1]).c }); }
    return L;
  };
  const prixTxt = (k, f) => { const o = PJ[k].f.o[f], p = o[1][0], n = Math.max(...o[1][1]), des = (k === 'app' && f === 2) || (k === 'site' && f === 2) ? 'dès ' : ''; return `${des}${fmt(p)}&nbsp;€<small>ou ${des}${fmt(Math.floor(p * 100 / n) / 100)}&nbsp;€ par mois en ${n} fois sans frais</small>`; };
  const nomReco = R => (R.k === 'site' ? 'Site ' : '') + PJ[R.k].f.o[R.f][0];
  const carteSw = (c, i, r) => `<div class="sw-c${r === 0 ? ' haut' : ''}" data-i="${i}" style="--t:${c.c};--r:${r}" aria-hidden="${r !== 0}"><div class="pt-c"><span>${String(i + 1).padStart(2, '0')}</span></div><div class="pt-l"><p>${c.t}</p></div><b class="st oui">C’est moi</b><b class="st non">Pas moi</b></div>`;
  const vueSwipe = () => {
    const S = ES.sw;
    if (S.i < SW.length) return `<div class="sw">
      <div class="sw-pile">${SW.map((c, i) => i < S.i || i > S.i + 2 ? '' : carteSw(c, i, i - S.i)).reverse().join('')}</div>
      <div class="sw-b"><button type="button" class="sw-x" data-sw="0" aria-label="Pas moi">${ico('x')}<span>Pas moi</span></button><button type="button" class="sw-x ok" data-sw="1" aria-label="C’est moi">${ico('ok')}<span>C’est moi</span></button></div></div>`;
    const L = recos();
    if (!L.length) return `<div class="sw-r"><h3 class="d">Rien ne presse.<span class="it">Votre présence en ligne tient la route.</span></h3><p>Si un projet se précise, décrivez-le : une réponse arrive sous 48&nbsp;h.</p><div class="sw-ra"><button type="button" class="bt" data-swr="parler">En parler <span class="ar">${ico('ar')}</span></button><button type="button" class="bt cl" data-swr="refaire">Recommencer</button></div></div>`;
    if (!S.sel) S.sel = L.map((x, i) => i);
    return `<div class="sw-r"><p class="sw-k">${L.length > 1 ? 'Deux réponses, qui se complètent. Gardez celles qui vous intéressent.' : 'Notre recommandation'}</p><div class="sw-l">${L.map((R, i) => { const o = PJ[R.k].f.o[R.f], on = S.sel.includes(i);
      return `<button type="button" class="sw-o" data-pick="${i}" aria-pressed="${on}" style="--i:${i}"><span class="ck">${ico('ok')}</span><span class="sw-ot"><small>${R.k === 'site' ? 'Site internet' : 'Application'}</small><b class="d">${nomReco(R)}</b><span class="sw-od">${o[2]}</span><span class="sw-op">${prixTxt(R.k, R.f)}</span><span class="sw-ow">${(t => (/^[aeiouyéèh]/i.test(t) ? 'Parce qu’' : 'Parce que ') + t)(R.w.map(k => SW.find(c => c.k === k).w).join(', ').replace(/, ([^,]*)$/, ' et $1'))}.</span></span></button>`; }).join('')}</div>
      <button type="button" class="sw-re" data-swr="refaire">Recommencer</button></div>`;
  };
  /* geste : la carte suit le doigt, s'incline, et part au-delà d'un seuil (ou d'un geste vif) */
  const swipeLie = () => {
    const c = $('.sw-c.haut', estB); if (!c) return;
    let x0 = 0, y0 = 0, dx = 0, t0 = 0, actif = false, raf = 0;
    const pose = () => { raf = 0; c.style.transform = `translate3d(${dx}px,${Math.abs(dx) * .06}px,0) rotate(${dx / 18}deg)`; c.style.setProperty('--o', Math.min(1, Math.abs(dx) / 90).toFixed(2)); c.dataset.s = dx > 0 ? 'oui' : 'non'; };
    c.addEventListener('pointerdown', e => { actif = true; x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = performance.now(); c.setPointerCapture(e.pointerId); c.classList.add('tient'); });
    c.addEventListener('pointermove', e => { if (!actif) return; dx = e.clientX - x0; if (!raf) raf = requestAnimationFrame(pose); });
    const fin = () => { if (!actif) return; actif = false; c.classList.remove('tient'); const v = Math.abs(dx) / Math.max(1, performance.now() - t0); if (Math.abs(dx) > 70 || (Math.abs(dx) > 24 && v > .35)) jette(dx > 0 ? 1 : 0); else { c.style.transform = ''; c.style.setProperty('--o', 0); } };
    c.addEventListener('pointerup', fin); c.addEventListener('pointercancel', fin);
  };
  let jetEnCours = false;
  const jette = oui => {
    const c = $('.sw-c.haut', estB); if (!c || jetEnCours) return; jetEnCours = true;
    const S = ES.sw; S.r[SW[S.i].k] = oui;
    c.dataset.s = oui ? 'oui' : 'non'; c.style.setProperty('--o', 1); c.classList.add('part');
    c.style.transform = `translate3d(${(oui ? 1 : -1) * (innerWidth + 200)}px,40px,0) rotate(${oui ? 24 : -24}deg)`;
    if (navigator.vibrate) try { navigator.vibrate(6); } catch (x) {}
    const suiv = $(`.sw-c[data-i="${S.i + 1}"]`, estB); if (suiv) { suiv.classList.add('haut'); suiv.style.setProperty('--r', 0); suiv.setAttribute('aria-hidden', 'false'); }
    $$('.sw-c', estB).forEach(x => { const i = +x.dataset.i; if (i > S.i + 1) x.style.setProperty('--r', i - S.i - 1); });
    const pile = $('.sw-pile', estB), n3 = S.i + 3; if (pile && SW[n3]) pile.insertAdjacentHTML('afterbegin', carteSw(SW[n3], n3, 2));
    setTimeout(() => { jetEnCours = false; S.i++; if (S.i >= SW.length) { S.sel = null; rendE(); compte('/devis/trouver-fini', 'Trouver : résultat'); } else { c.remove(); majEtape(); swipeLie(); } }, 190);
  };
  const majEtape = () => { const L = $('#estL'); if (L && ES.e === 'swipe') L.textContent = ES.sw.i < SW.length ? `Situation ${ES.sw.i + 1} sur ${SW.length}` : 'Votre recommandation'; };
  addEventListener('keydown', e => { if (ES.e !== 'swipe' || !ES.sw || ES.sw.i >= SW.length || $('#shE').hidden) return; if (e.key === 'ArrowRight') { e.preventDefault(); jette(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); jette(0); } });
  /* commande en ligne, dans le configurateur : la saisie va jusqu'au paiement, sans changer de site.
     Prix affichés ici pour l'écran ; le serveur (fonction acompte) les recalcule de son côté à partir des mêmes clés. */
  const ACOMPTE = 'https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/acompte';
  /* catalogue public (mêmes clés et mêmes prix que la fonction acompte, qui fait foi) */
  const CATC_ = {
    'site-essentiel': { p: 490, t: 'site', sv: 9, n: 'Site Essentiel, une page' }, 'site-vitrine': { p: 990, t: 'site', sv: 9, n: 'Site Vitrine, 3 à 5 pages' },
    'app-outil': { p: 490, t: 'app', sv: 9, n: 'Application, formule Outil simple', s: 'Suivi de l’outil' }, 'app-application': { p: 990, t: 'app', sv: 19, n: 'Application, formule Application', s: 'Suivi de l’application' },
    'concert': { p: 250, t: 'photo', n: 'Reportage, concert ou spectacle' }, 'demi': { p: 350, t: 'photo', n: 'Reportage, une demi-journée' }, 'journee': { p: 550, t: 'photo', n: 'Reportage, une journée' },
    'mariage-ceremonie': { p: 1290, t: 'mariage', n: 'Mariage, cérémonie' }, 'mariage-journee': { p: 1890, t: 'mariage', n: 'Mariage, la journée' }, 'mariage-album': { p: 2590, t: 'mariage', n: 'Mariage, la journée et l’album' },
    'annee-4': { p: 1290, m: 109, t: 'annee', n: 'Suivi photo annuel, 4 demi-journées' }, 'annee-8': { p: 2490, m: 209, t: 'annee', n: 'Suivi photo annuel, 8 demi-journées' }, 'annee-12': { p: 3590, m: 299, t: 'annee', n: 'Suivi photo annuel, 12 demi-journées' },
    'site-photo': { p: 350, n: 'Reportage photo pour le site' }, 'soir': { p: 150, n: 'Sélection livrée le soir même' }, 'heure': { p: 80, n: 'Une heure de plus sur place' }
  };
  /* ce qui se commande en ligne : tout ce qui a un prix fixe ; les formules « dès » et « à définir » passent par un échange */
  const clesCommande = () => {
    const f = ES.f, o = ES.o; let p = null;
    if (ES.k === 'site' && f < 2 && !o.includes(1)) { p = [f ? 'site-vitrine' : 'site-essentiel']; if (o.includes(0)) p.push('site-photo'); }
    else if (ES.k === 'app' && f < 2) p = [f ? 'app-application' : 'app-outil'];
    else if (ES.k === 'evenement') { p = [['concert', 'demi', 'journee'][f] + (f === 2 && ES.j > 1 ? '*' + ES.j : '')]; if (o.includes(0)) p.push('soir'); if (o.includes(1)) p.push('heure'); }
    else if (ES.k === 'mariage') { p = [['mariage-ceremonie', 'mariage-journee', 'mariage-album'][f]]; if (o.includes(0)) p.push('soir'); if (o.includes(1)) p.push('heure'); }
    else if (ES.k === 'annee' && f < 3) p = [['annee-4', 'annee-8', 'annee-12'][f]];
    return p;
  };
  const totCmd = () => {
    const c = clesCommande(); if (!c) return null;
    const [k0, qq] = c[0].split('*'), A = CATC_[k0], q = Number(qq || 1), opts = c.slice(1).reduce((s, k) => s + CATC_[k].p, 0);
    const annuel = A.t === 'annee', nb = annuel ? (ES.p === 1 ? 12 : 0) : (A.t === 'site' || A.t === 'app') ? nfSite(PJ[ES.k].f.o[ES.f]) : 0;
    const etale = nb ? (annuel ? A.m * 12 : A.p) : 0, total = nb ? opts : A.p * q + opts, mens = nb ? (annuel ? A.m : Math.floor(etale * 100 / nb) / 100) : 0, sv = A.sv || 0;
    const acompte = Math.round(total * 30) / 100;
    return { c, A, k0, q, nb, annuel, etale, total, mens, sv, acompte, auj: Math.round((acompte + (nb ? mens + sv : 0)) * 100) / 100 };
  };
  const numDevis = () => { const t = new Date(), a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let s = ''; for (let k = 0; k < 4; k++) s += a.charAt(Math.floor(Math.random() * a.length)); return String(t.getFullYear()).slice(2) + ('0' + (t.getMonth() + 1)).slice(-2) + ('0' + t.getDate()).slice(-2) + '-' + s; };
  const ANTICIPE = 'Je demande que la prestation commence avant la fin du délai de rétractation et reconnais que, une fois la prestation pleinement exécutée, je ne pourrai plus me rétracter.';
  const qe = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const champsCmd = part => part
    ? [['rep', 'Nom et prénom', 'name'], ['adr', 'Adresse', 'street-address'], ['ville', 'Code postal et ville', 'address-level2'], ['mail', 'E-mail', 'email']]
    : [['struct', 'Structure', 'organization'], ['rep', 'Votre nom', 'name'], ['fonction', 'Votre fonction', 'organization-title'], ['adr', 'Adresse', 'street-address'], ['ville', 'Code postal et ville', 'address-level2'], ['mail', 'E-mail', 'email']];
  const vueCmd = () => {
    const T = totCmd(), m = ES.cm, part = !T.nb && m.part;
    const lg = T.c.map(x => { const [k, q] = x.split('*'), A = CATC_[k], n = Number(q || 1); return `<li><span>${A.n}${n > 1 ? `, ${n} jours` : ''}</span><b>${T.annuel && T.nb ? fmt(A.m) + '&nbsp;€/mois' : fmt(A.p * n) + '&nbsp;€'}</b></li>`; }).join('');
    const sl = T.sv ? `<li><span>${T.A.s || 'Suivi du site'}, sans engagement</span><b>${T.sv}&nbsp;€/mois</b></li>` : '';
    const txt = T.annuel && T.nb ? `12 mensualités de ${fmt(T.mens)}&nbsp;€, la première aujourd’hui, sans acompte.`
      : T.nb ? `En ${T.nb} fois sans frais : ${fmt(T.mens + T.sv)}&nbsp;€ par mois, suivi compris${T.total ? `, plus ${fmt(T.acompte)}&nbsp;€ d’acompte pour le reportage` : ''}. Ensuite, le suivi seul : ${T.sv}&nbsp;€ par mois.`
      : `Acompte de 30&nbsp;% aujourd’hui, le solde ${T.A.t === 'mariage' ? 'avant le jour J' : T.A.t === 'photo' ? 'après le reportage' : T.annuel ? 'au fil de l’année' : 'à la livraison'}${T.sv ? `, puis ${T.sv}&nbsp;€ par mois de suivi` : ''}.${T.A.t === 'photo' || T.A.t === 'mariage' ? ' La date est confirmée sous 24&nbsp;h ; si elle n’est pas libre, l’acompte est remboursé.' : ''}`;
    let h = `<div class="cm-r"><ul>${lg}${sl}</ul><p>${txt}</p></div>`;
    if (!T.nb) h += `<div class="q"><p>Vous commandez</p><div class="bascule cm-qui" role="group" data-v="${part ? 1 : 0}"><button type="button" data-qui="0" aria-pressed="${!part}">Pour une structure</button><button type="button" data-qui="1" aria-pressed="${part}">En tant que particulier</button></div></div>`;
    h += `<div class="form cm-f">${champsCmd(part).map(f => `<label>${f[1]}<input id="c_${f[0]}" autocomplete="${f[2]}"${f[0] === 'mail' ? ' type="email" inputmode="email"' : ''} value="${qe(m[f[0]])}"></label>`).join('')}</div>`;
    if (part) h += `<label class="cm-ok"><input type="checkbox" id="c_anticipe"${m.anticipe ? ' checked' : ''}><span>${ANTICIPE} Délai de rétractation de 14 jours : voir les <a href="/conditions/" target="_blank" rel="noopener">conditions</a>.</span></label>`;
    h += `<p class="cm-n">Le devis se télécharge, puis le paiement sécurisé s’ouvre : vous y acceptez le devis et les <a href="/conditions/" target="_blank" rel="noopener">conditions de vente</a>.${T.nb ? ' Le paiement en plusieurs fois est réservé aux professionnels et aux associations.' : ''}</p>`;
    return h;
  };
  const piedCmd = () => { const T = totCmd(); return `<div class="tot"><small>À régler aujourd’hui</small><span class="v"><b class="prix">${fmt(T.auj)}</b><i>€${T.nb ? `, puis ${fmt(T.mens + T.sv)} € par mois` : T.sv ? `, puis ${T.sv} € par mois` : ''}</i></span></div><div class="act"><button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-payer>Payer <span class="ar">${ico('ar')}</span></button></div><p class="cm-n rappel">Si le paiement n’aboutit pas, vous recevrez un seul e-mail pour reprendre votre commande.</p>`; };
  const gardeCmd = () => { if (!modeCmd()) return; ['struct', 'rep', 'fonction', 'adr', 'ville', 'mail'].forEach(k => { const i = $('#c_' + k); if (i) ES.cm[k] = i.value.trim(); }); const a = $('#c_anticipe'); if (a) ES.cm.anticipe = a.checked; };
  let ressources = null;
  const chargeDevis = () => ressources || (ressources = ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', '/conditions/cgv.js', 'https://dossiers.studioes.fr/assets/devis-fonts.js', 'https://dossiers.studioes.fr/assets/devis.js'].reduce((p, s) => p.then(() => new Promise((ok, ko) => { const x = document.createElement('script'); x.src = s; if (s.includes('/jspdf/')) { x.integrity = 'sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA=='; x.crossOrigin = 'anonymous'; x.referrerPolicy = 'no-referrer'; } x.onload = ok; x.onerror = () => s.includes('cgv') ? ok() : ko(new Error(s)); document.head.appendChild(x); })), Promise.resolve()).catch(e => { ressources = null; throw e; }));
  let CATC = null;
  const catalogue = () => CATC ? Promise.resolve(CATC) : fetch('https://dossiers.studioes.fr/commander/data.json', { cache: 'no-cache' }).then(r => r.json()).then(j => (CATC = j.configurateur));
  const payer = async b => {
    gardeCmd(); const T = totCmd(), m = ES.cm, part = !T.nb && m.part;
    const manque = champsCmd(part).find(f => !m[f[0]] || (f[0] === 'mail' && !mailOk(m.mail)));
    $$('.cm-f input').forEach(i => i.removeAttribute('aria-invalid'));
    if (manque) { const i = $('#c_' + manque[0]); i.setAttribute('aria-invalid', 'true'); i.focus(); erreur(manque[0] === 'mail' && m.mail ? 'Cette adresse e-mail semble incomplète.' : 'Complétez ce champ pour établir le devis.'); return; }
    if (part && !m.anticipe) { erreur('Cochez la demande de démarrage pour continuer.'); return; }
    erreur(''); b.disabled = true; b.classList.add('charge'); b.firstChild.textContent = 'Préparation ';
    const num = ES.num || (ES.num = numDevis());
    try {
      const [cf] = await Promise.all([catalogue(), chargeDevis()]);
      const cles = T.c.map(x => x.split('*')[0]), opts = [], suiviNom = T.A.s || 'Suivi du site'; cf.etapes.forEach(e => e.options.forEach(o => { if ((o.cle && cles.includes(o.cle)) || (o.mois && o.suivi && T.sv && (o.titreDevis || o.l) === suiviNom)) opts.push(o); }));
      const lignes = opts.map(o => { const prin = o.cle === T.k0; return { n: (o.titreDevis || o.l) + (prin && T.q > 1 ? `, ${T.q} jours` : '') + (prin && T.annuel && T.nb ? ', réglé en 12 mensualités' : ''), l: o.lignes || (o.d ? [o.d] : []), p: prin ? (T.annuel && T.nb ? T.etale : o.p * T.q) : (o.p || 0), mois: !!o.mois, min: o.min, devis: false, etaler: prin && T.nb ? [T.nb] : null, suivi: !!(o.mois && o.suivi) }; });
      const client = { struct: part ? '' : m.struct, rep: m.rep, fonction: part ? '' : m.fonction, adr: m.adr, ville: m.ville, mail: m.mail };
      const out = window.studioDevis({ nom: client.struct || client.rep, objet: cf.objet, quand: ES.d != null && PJ[ES.k] && PJ[ES.k].date ? libM(ES.d) : '', public: false, particulier: part, remise: null, echeances: T.nb }, lignes, client, num, { date: new Date().toISOString(), nom: client.rep, mode: 'carte', anticipe: part }, cf.regles);
      const u = URL.createObjectURL(out.blob), a = document.createElement('a'); a.href = u; a.download = out.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
      /* la fiche du client remonte dans Hors-champ, comme depuis un dossier */
      fetch('https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/formulaire', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, keepalive: true, body: JSON.stringify({ _subject: 'Devis ' + num + ' : ' + (client.struct || client.rep) + ' (commande en ligne)', _template: 'table', _captcha: 'false', source: 'studioes.fr', dossier: 'commander', devis: num, etat: T.nb ? 'devis accepté, première mensualité en cours' : 'devis accepté, acompte en cours', public: 'non', particulier: part ? 'oui' : 'non', structure: client.struct, nom: client.rep, fonction: client.fonction, adresse: client.adr, ville: client.ville, mail: client.mail, lignes: lignes.map(x => x.n + ' : ' + x.p + (x.mois ? ' €/mois' : ' €')).join(' ; '), total: T.total + ' €', reglement: T.nb ? 'en ' + T.nb + ' fois sans frais : ' + T.mens + ' €/mois pour ' + T.etale + ' €, plus ' + T.sv + ' €/mois de suivi' : 'en une fois', paiement: 'carte', acompte: T.acompte + ' €', date_souhaitee: PJ[ES.k].date && ES.d != null ? moisTxt() : '', jours: T.q > 1 ? String(T.q) : '', fill: ES.fl ? 'intéressé par Fill' : '', demarrage_anticipe: part ? 'oui' : '' }) }).catch(() => {});
      const corps = { action: 'creer', reprise: ES, cles: T.c, dossier: 'commander', devis: num, structure: client.struct || client.rep, nom: client.rep, email: client.mail, total: T.total, particulier: part, demarrage_anticipe: part, retour: location.origin + location.pathname };
      if (T.nb) Object.assign(corps, { etale: T.etale, echeances: T.nb, suivi: T.sv });
      const r = await fetch(ACOMPTE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.erreur || !/^https:\/\//.test(j.url || '')) throw new Error(j.erreur || 'Le paiement n’a pas pu être préparé.');
      compte('commande-paiement', 'Commande : vers le paiement'); b.firstChild.textContent = 'Ouverture du paiement ';
      try { sessionStorage.setItem('es:paiement', JSON.stringify({ t: Date.now(), ES })); } catch (e) {}
      setTimeout(() => { location.href = j.url; }, 600);
    } catch (e) {
      b.disabled = false; b.classList.remove('charge'); b.firstChild.textContent = 'Réessayer ';
      erreur(qe(e && e.message && !/^https?:/.test(e.message) ? e.message : 'La connexion a échoué.') + ' Réessayez, ou écrivez à <a href="mailto:contact@studioes.fr">contact@studioes.fr</a> en indiquant le devis n°&nbsp;' + num + '.');
    }
  };
  /* retour de paiement : ?paye=<session> ; le serveur confirme, le configurateur affiche la suite */
  const vuePaye = () => {
    const j = ES.py || {};
    if (j.statut === 'paye') return `<div class="fin2"><span class="ok-i">${ico('ok')}</span><h3 class="d">Commande confirmée.<span class="it">Merci.</span></h3><p class="cm-n">${+j.mensuel > 0 ? `${fmt(+j.montant)}&nbsp;€ reçus pour le devis n°&nbsp;${qe(j.devis)}. Les mensualités suivantes, de ${fmt(+j.mensuel + (+j.suivi || 0))}&nbsp;€, sont prélevées chaque mois.` : `Acompte de ${fmt(+j.acompte)}&nbsp;€ reçu pour le devis n°&nbsp;${qe(j.devis)}. La facture vous parvient sous 24&nbsp;h.`} Un e-mail de confirmation vient de partir. Choisissez un créneau pour caler le démarrage.</p><div class="act2"><button class="bt" data-cal>Choisir un créneau <span class="ar">${ico('ar')}</span></button><button class="bt cl" data-close>Fermer</button></div></div>`;
    if (j.statut === 'inconnu') return `<div class="fin2"><h3 class="d">Paiement introuvable.</h3><p class="cm-n">Écrivez à <a href="mailto:contact@studioes.fr">contact@studioes.fr</a> : la commande sera vérifiée à la main.</p></div>`;
    return `<div class="fin2"><h3 class="d">Vérification du paiement…</h3><p class="cm-n">${j.lent ? 'La confirmation prend un peu de temps : vous recevrez un e-mail dès qu’elle arrive.' : 'Un instant.'}</p></div>`;
  };
  const retourPaiement = () => {
    let rep = ''; try { const u = new URL(location.href); rep = u.searchParams.get('reprendre') || ''; if (rep) { u.searchParams.delete('reprendre'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (e) {}
    if (/^[0-9a-f-]{36}$/.test(rep)) {
      fetch(ACOMPTE + '?reprendre=' + encodeURIComponent(rep), { cache: 'no-store' }).then(r => r.json()).then(j => {
        if (j.statut === 'a_reprendre' && j.reprise && typeof j.reprise === 'object') { ES = Object.assign({}, ES, j.reprise); delete ES.py; rendE(); ouvreF('#shE'); compte('commande-reprise', 'Commande reprise depuis le mail'); setTimeout(() => { erreur('Votre commande est reprise telle que vous l’aviez laissée. Vérifiez vos coordonnées, puis réglez quand vous le souhaitez.'); }, 400); }
        else if (j.statut === 'paye') { ouvreF('#shE'); setTimeout(() => erreur('Cette commande est déjà réglée. Merci.'), 400); }
        else { ouvreF('#shE'); setTimeout(() => erreur('Ce lien a expiré. Vous pouvez refaire votre devis en quelques clics, ou écrire à <a href="mailto:contact@studioes.fr">contact@studioes.fr</a>.'), 400); }
      }).catch(() => {});
      return;
    }
    let ses = ''; try { const u = new URL(location.href); ses = u.searchParams.get('paye') || ''; if (ses) { u.searchParams.delete('paye'); history.replaceState(null, '', u.pathname + u.search + u.hash); } } catch (e) {}
    if (!/^cs_(live|test)_/.test(ses)) {
      /* retour de Stripe sans paiement (bouton retour, page fermée) : la commande reprend où elle en était */
      let g = null; try { g = JSON.parse(sessionStorage.getItem('es:paiement') || 'null'); sessionStorage.removeItem('es:paiement'); } catch (e) {}
      if (g && g.ES && Date.now() - g.t < 6 * 3600e3) { ES = g.ES; rendE(); ouvreF('#shE'); setTimeout(() => { erreur('Paiement non abouti : votre commande est gardée. Vous pouvez reprendre le paiement, ou écrire à <a href="mailto:contact@studioes.fr">contact@studioes.fr</a>.'); const e = $('#estErr'); if (e) e.scrollIntoView({ block: 'center' }); }, 400); }
      return;
    }
    try { sessionStorage.removeItem('es:paiement'); } catch (e) {}
    ES.e = 'paye'; ES.py = {}; rendE(); ouvreF('#shE');
    let n = 0; const lire = () => fetch(ACOMPTE + '?session=' + encodeURIComponent(ses), { cache: 'no-store' }).then(r => r.json()).then(j => { if (j.statut === 'en_attente' && ++n <= 6) { setTimeout(lire, 2000); return; } ES.py = j.statut === 'en_attente' ? { lent: 1 } : j; rendE(); if (j.statut === 'paye') compte('commande-payee', 'Commande payée'); }).catch(() => { if (++n <= 6) setTimeout(lire, 2000); else { ES.py = { lent: 1 }; rendE(); } });
    lire();
  };
  const eng = () => ES.k === 'site' || ES.k === 'app' ? (nfSite(PJ[ES.k].f.o[ES.f]) ? '' : ' de suivi') : '';
  /* site en plusieurs fois avec reportage : la mensualité d'abord, le reportage réglé à la commande */
  const siteMois = r => ES.k === 'site' && nfSite(PJ.site.f.o[ES.f]) && r.m && r.a;
  const txtEst = r => !r ? '' : siteMois(r) ? `dès ${fmt(r.m)} € ${r.per}, plus ${fmt(r.a)} € de reportage photo à la commande${r.dv ? ', plus une partie sur devis' : ''}` : (r.a || r.m) ? `dès ${fmt(r.a || r.m)} €${r.a && r.m ? `, puis ${fmt(r.m)} € par mois${eng()}` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}` : 'sur devis';

  /* frise de date du devis */
  const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const NM = 24, M0 = (() => { const n = new Date(); return { a: n.getFullYear(), m: n.getMonth() }; })();
  const moisDe = i => { const t = M0.m + i; return { a: M0.a + Math.floor(t / 12), m: t % 12 }; };
  const libM = i => { const x = moisDe(i); return MOIS[x.m][0].toUpperCase() + MOIS[x.m].slice(1) + ' ' + x.a; };
  const delai = i => i === 0 ? 'ce mois-ci' : i === 1 ? 'le mois prochain' : `dans ${i} mois`;
  const conseil = (k, i) => {
    if (i == null) return 'Aucun souci : la date se cale ensemble, au moment du devis.';
    const ete = [4, 5, 6, 7, 8].includes(moisDe(i).m);
    if (k === 'mariage') return i < 3 ? 'Délai court : la disponibilité est vérifiée dès réception de la demande.' : i < 9 ? (ete ? 'Bon délai, sur une période très demandée : mieux vaut bloquer la date sans attendre.' : 'Bon délai : le temps de se rencontrer et de préparer la journée.') : 'La date est bloquée dès l’acompte versé, rien d’autre à prévoir d’ici là.';
    return i === 0 ? 'Ce mois-ci : la disponibilité est confirmée sous 48 h.' : i < 3 ? 'Bon délai pour préparer le repérage et le déroulé.' : (ete ? 'Saison des festivals : la date est bloquée dès l’acompte versé.' : 'La date est bloquée dès l’acompte versé.');
  };
  const friseH = k => {
    let t = '', l = '';
    for (let i = 0; i < NM; i++) { const x = moisDe(i); t += `<i class="${x.m === 0 || i === 0 ? 'a' : ''}"></i>`; if (x.m === 0) l += `<span style="left:${(i + .5) / NM * 100}%">${x.a}</span>`; }
    l = `<span style="left:${.5 / NM * 100}%">Auj.</span>` + l;
    return `<div class="q"><p>Quand&nbsp;?</p><div class="frise" id="frise">
      <div class="fr-h"><b class="d" id="frM"></b><span id="frD"></span></div>
      <div class="fr-r" id="frR" role="slider" tabindex="0" aria-label="Mois de l’événement" aria-valuemin="0" aria-valuemax="${NM - 1}"><div class="fr-t" style="--n:${NM}">${t}</div><div class="fr-l">${l}</div></div>
      <p class="fr-n" id="frN"></p>
      <button type="button" class="fr-x" data-nd>Date pas encore fixée</button></div></div>`;
  };
  const friseMaj = () => {
    const f = $('#frise'); if (!f) return; const i = ES.d, nd = i == null;
    f.classList.toggle('nd', nd);
    $('#frM').textContent = nd ? 'À définir' : libM(i);
    $('#frD').textContent = nd ? '' : delai(i);
    $('#frN').textContent = conseil(ES.k, i);
    $$('#frR .fr-t i').forEach((x, k) => { x.classList.toggle('on', k === i); x.classList.toggle('av', !nd && k < i); });
    const r = $('#frR'); r.setAttribute('aria-valuenow', nd ? 0 : i); r.setAttribute('aria-valuetext', nd ? 'Date à définir' : libM(i));
    $('[data-nd]', f).textContent = nd ? 'Choisir un mois' : 'Date pas encore fixée';
  };
  const friseLie = () => {
    const r = $('#frR'); if (!r) return;
    const pose = e => { const b = r.getBoundingClientRect(); const i = Math.max(0, Math.min(NM - 1, Math.floor((e.clientX - b.left) / b.width * NM))); if (i !== ES.d) { ES.d = i; friseMaj(); if (navigator.vibrate) try { navigator.vibrate(4); } catch (x) {} } };
    r.addEventListener('pointerdown', e => { r.setPointerCapture(e.pointerId); pose(e); const mv = ev => pose(ev), up = () => { r.removeEventListener('pointermove', mv); r.removeEventListener('pointerup', up); }; r.addEventListener('pointermove', mv); r.addEventListener('pointerup', up); });
    r.addEventListener('keydown', e => { const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); ES.d = Math.max(0, Math.min(NM - 1, (ES.d == null ? 0 : ES.d) + d)); friseMaj(); });
    friseMaj();
  };
  const moisTxt = () => ES.d == null ? '' : MOIS[moisDe(ES.d).m] + ' ' + moisDe(ES.d).a;
  let dernier = null;
  const pied = () => {
    const r = calc(), sm = r && siteMois(r), cible = r && !ES.multi ? (sm ? r.m : r.a || r.m || null) : null;
    const v = ES.multi && ES.e === 2 ? `<small>Votre sélection</small><span class="v"><i>${ES.multi.length} formules, chiffrées ensemble</i></span>` : !r ? `<small>Estimation</small><span class="v"><i>Choisissez votre projet</i></span>`
      : cible ? `<small>Estimation</small><span class="v"><small>dès</small><b class="prix" id="estN"></b><i>€${sm ? ` ${r.per}, plus ${fmt(r.a)} € de reportage à la commande` : r.a && r.m ? `, puis ${fmt(r.m)} € par mois${eng()}` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}</i></span>`
      : `<small>Estimation</small><span class="v"><b class="sd">Sur devis</b></span>`;
    const act = ES.e === 0 ? `<button class="bt cl sm" data-cal>Préférer un appel</button>`
      : ES.e === 1 ? `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-nav="1">Continuer <span class="ar">${ico('ar')}</span></button>`
      : `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-envoi>Envoyer la demande <span class="ar">${ico('ar')}</span></button>`;
    if (ES.e === 'swipe') { const fini = ES.sw.i >= SW.length, n = fini && ES.sw.sel ? ES.sw.sel.length : 0, L = fini ? recos() : [];
      estF.innerHTML = `<div class="act"><button class="bt cl sm" data-nav="0">Retour</button></div>${L.length ? `<div class="act"><button class="bt sm" data-swgo${n ? '' : ' disabled'}>${n > 1 ? 'Envoyer ma demande' : n ? 'Continuer' : 'Choisissez une formule'} <span class="ar">${ico('ar')}</span></button></div>` : ''}`; dernier = null; return; }
    if (modeCmd()) { estF.innerHTML = piedCmd(); dernier = null; return; }
    if (ES.e === 'paye') { estF.innerHTML = ''; return; }
    if (ES.e === 'fill') { estF.innerHTML = `<div class="tot"><small>Accompagnement régulier</small><span class="v"><i>Sur fill.studioes.fr</i></span></div><div class="act"><button class="bt cl sm" data-nav="0">Retour</button></div>`; return; }
    estF.innerHTML = ES.e === 3 ? '' : `<div class="tot">${v}</div><div class="act">${act}</div>`;
    const n = $('#estN');
    if (n) { n._ch = dernier; odo(n, fmt(cible), !dernier); dernier = n._ch; } else dernier = null;
  };
  const rendE = () => {
    $$('#estP i').forEach((x, i) => x.classList.toggle('on', ES.e === 'swipe' ? i === 0 : ES.e === 'paye' ? true : ES.e === 'fill' ? i === 0 : i <= Math.min(ES.e, 2)));
    const TT = $('#shET'); if (TT) TT.textContent = ES.e === 'swipe' ? 'Ce qu’il vous faut' : modeCmd() || ES.e === 'paye' ? 'Commander' : 'Demander un devis';
    const L = $('#estL'); if (L) L.textContent = ES.e === 'paye' ? 'Paiement' : ES.e === 'fill' ? 'Accompagnement régulier' : ES.e === 3 ? 'Demande envoyée' : `Étape ${ES.e + 1} sur 3 : ${['votre projet', 'les détails', clesCommande() && !ES.multi ? 'commander ou en parler' : 'vos coordonnées'][ES.e]}`;
    let h = '';
    if (ES.e === 'swipe') { h += vueSwipe();
    } else if (ES.e === 0) {
      const GR = ['Photographie', 'Web', 'Design graphique']; if (ES.g) GR.sort((a, b) => (b === ES.g) - (a === ES.g));
      GR.forEach(g => { h += `<div class="q${ES.g && g !== ES.g ? ' q-aut' : ES.g ? ' q-ici' : ''}"><p>${ES.g && g !== ES.g ? 'Ou bien, ' + g.toLowerCase() : g}</p><div class="opts ch">${Object.entries(PJ).filter(([, P]) => P.g === g).map(([k, P]) => `<button data-k="${k}" aria-pressed="${ES.k === k}">${ico(P.ic)}<span>${P.l}</span></button>`).join('')}${g === 'Web' ? `<button data-swipe class="op-sw">${ico('cl')}<span>Je ne sais pas encore<small>Six situations, la bonne formule</small></span></button>` : ''}</div></div>`; });
      h += `<div class="q q-fill"><p>Un accompagnement régulier</p><div class="opts ch"><button data-fill>${ico('cu')}<span>Une communication suivie chaque mois<small>Publications, actualités, créations</small></span></button></div></div>`;
    } else if (ES.e === 'fill') {
      h += `<div class="fl-go"><svg class="fl-lgo" viewBox="0 0 1376 720" role="img" aria-label="Fill"><g fill="#1A1A1A"><path d="M100 700V262C100 158 168 90 274 90H300V214H282C246 214 224 236 224 274V700Z"/><rect x="18" y="330" width="282" height="104" rx="8"/><rect x="360" y="330" width="124" height="370" rx="8"/><circle cx="422" cy="178" r="72"/></g><g fill="none" stroke-width="96" stroke-linecap="round" stroke-linejoin="round"><path stroke="#7052B3" d="M560 655C590 540 672 260 732 144C762 74 854 59 860 120C866 234 800 400 660 570C630 620 640 668 710 664C750 662 763 640 788 600"/><path stroke="#FF8A6B" d="M788 600C818 540 900 260 960 144C990 74 1082 59 1088 120C1094 234 1028 400 888 570C858 620 868 668 938 664C1038 660 1088 615 1188 612C1258 610 1288 600 1318 575"/></g></svg>
        <h3 class="d">Ce besoin est pris en charge par Fill.</h3>
        <p>Fill est le service de communication externalisée conçu par Studio ES pour les collectivités et les entreprises : publications, actualités, créations et suivi, avec un prix fixe chaque mois.</p>
        <div class="fl-go-a"><a class="bt" href="https://fill.studioes.fr/simulateur/">Estimer mon besoin sur Fill <span class="ar">${ico('ne')}</span></a><a class="bt cl" href="https://fill.studioes.fr/diagnostic/">Faire le diagnostic</a></div></div>`;
    } else if (ES.e === 'paye') { h += vuePaye();
    } else if (ES.e === 1) {
      const P = PJ[ES.k];
      h += `<div class="q"><p>${P.l}</p></div><div class="q"><p>${P.f.l}</p><div class="opts">${P.f.o.map((o, i) => { const pr = o[1] == null ? 'sur devis' : Array.isArray(o[1]) ? (ES.k === 'site' || ES.k === 'app' ? (nfSite(o) ? `dès ${fmt(Math.floor(o[1][0] * 100 / nfSite(o)) / 100)} € par mois` : `dès ${fmt(o[1][0])} €`) : (ES.p ? `dès ${o[1][1]} € par mois` : `dès ${fmt(o[1][0])} € par an`)) : `dès ${fmt(o[1])} €`; return `<button data-f="${i}" aria-pressed="${ES.f === i}">${o[0]}${o[2] ? `<small>${o[2]}</small>` : ''}<em>${pr}</em></button>`; }).join('')}</div></div>`;
      if (P.date) h += friseH(ES.k);
      const f = P.f.o[ES.f]; if (f[3] === 'j') h += `<div class="q"><p>Nombre de jours</p><div class="opts" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5].map(j => `<button data-j="${j}" aria-pressed="${ES.j === j}" style="align-items:center">${j}</button>`).join('')}</div></div>`;
      if (P.p && f[1] != null) h += `<div class="q"><p>${P.p.l}</p><div class="opts">${P.p.o.map((o, i) => (ES.k === 'site' || ES.k === 'app') && o[2] && !f[1][1].includes(o[2]) ? '' : `<button data-p="${i}" aria-pressed="${ES.k === 'site' || ES.k === 'app' ? (nfSite(f) ? ES.p === i : i === 0) : ES.p === i}">${o[0]}<small>${o[1]}</small></button>`).join('')}</div></div>`;
      if (P.o) h += `<div class="q"><p>${P.o.l} (facultatif)</p><div class="opts">${P.o.o.map((o, i) => `<button data-o="${i}" aria-pressed="${ES.o.includes(i)}">${o[0]}<em>${o[1] == null ? 'sur devis' : '+' + fmt(o[1]) + ' €'}</em></button>`).join('')}${ES.k === 'site' ? `<button class="op-fill" data-fl aria-pressed="${!!ES.fl}"><span class="fm-m"><svg role="img" aria-label="Fill"><use href="#fill"/></svg></span><span class="fl-t">Le faire vivre chaque mois<small>Actualités, nouvelles pages, visuels : un prix fixe chaque mois, sans engagement de durée.</small></span><em>sur abonnement</em></button>` : ''}</div></div>`;
    } else if (ES.e === 2 && clesCommande() && !ES.multi) {
      h += choixFin();
      if (modeCmd()) h += vueCmd(); else h += formDemande();
    } else if (ES.e === 2) {
      h += formDemande();
    } else {
      { const P = PJ[ES.k], r = calc(), mo = P.date ? moisTxt() : '', prem = (ES.c.nom || '').split(/[\s,]/)[0];
      const etapes = [
        ['Aujourd’hui', `Demande reçue : ${P.l.toLowerCase()}${mo ? ', ' + mo : ''}.`],
        ['Sous 48 h', `Un devis détaillé, ${(r.a || r.m) ? 'sur la base de l’estimation ' + txtEst(r) : 'chiffré selon votre besoin'}.`],
        ['À la signature', P.date ? 'Acompte de 30 % en ligne : la date vous est réservée.' : ES.k === 'app' && !ES.p ? 'Devis accepté : le projet démarre, sans mensualité d’avance.' : 'Acompte de 30 % en ligne : le projet démarre.']
      ];
      h += `<div class="fin2"><span class="ok-i">${ico('ok')}</span><h3 class="d">Merci${prem ? ' ' + prem.replace(/</g, '') : ''}.<span class="it">La suite, étape par étape.</span></h3>
        <ol class="suite">${etapes.map((e, k) => `<li class="${k ? '' : 'on'}" style="--k:${k}"><b>${e[0]}</b><span>${e[1]}</span></li>`).join('')}</ol>
        <div class="act2"><button class="bt" data-cal>Réserver un appel <span class="ar">${ico('ar')}</span></button><button class="bt cl" data-close>Fermer</button></div></div>`; }
    }
    estB.innerHTML = h; estB.scrollTop = 0; pied(); friseLie(); if (ES.e === 'swipe') { majEtape(); swipeLie(); }
    $$('[data-close]', estB).forEach(b => b.addEventListener('click', fermeF));
  };
  const erreur = t => { let e = $('#estErr'); if (!e) { e = document.createElement('p'); e.id = 'estErr'; e.className = 'err'; e.setAttribute('role', 'alert'); const f = $('.form', estB); if (f) f.after(e); else estB.appendChild(e); } e.innerHTML = t; e.hidden = !t; };
  const garde = () => { const g = id => { const e = $('#' + id); return e ? e.value.trim() : ''; }; if (ES.e === 2 && $('#eNom')) ES.c = { nom: g('eNom'), mail: g('eMail'), tel: g('eTel'), date: g('eDate'), msg: g('eMsg') }; };
  const ouvreDevis = s => {
    if (ES.e === 3 || ES.e === 'paye') ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: {}, d: 5, g: ES.g };
    if (s && s.k && PJ[s.k]) { ES.k = s.k; ES.f = s.f || 0; ES.o = (s.o || []).slice(); ES.j = 1; ES.p = s.k === 'site' || s.k === 'app' ? Math.max(0, PJ[s.k].p.o.findIndex(o => o[2] === (s.nf || 0))) : (s.mois ? 1 : 0); if (s.ph) ES.o = [0]; ES.e = 1; }
    else if (s && s.swipe) { ES.sw = { i: 0, r: {} }; ES.e = 'swipe'; }
    else if (!ES.k) ES.e = 0;
    dernier = null; rendE(); ouvreF('#shE'); compte('devis-ouvert', 'Ouverture du devis');
  };
  if (estB) {
    estB.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.k) { ES.k = d.k; ES.f = 0; ES.o = []; ES.fl = false; ES.multi = null; ES.p = 0; ES.j = 1; ES.e = 1; rendE(); compte('/devis/' + d.k, 'Devis : ' + PJ[d.k].l); return; }
      if (d.swipe != null) { ES.sw = { i: 0, r: {} }; ES.e = 'swipe'; rendE(); compte('/devis/trouver', 'Trouver ce qu’il me faut'); return; }
      if (d.sw != null) { jette(d.sw === '1' ? 1 : 0); return; }
      if (d.pick != null) { const S = ES.sw, i = +d.pick; S.sel = S.sel.includes(i) ? S.sel.filter(x => x !== i) : [...S.sel, i].sort(); b.setAttribute('aria-pressed', String(S.sel.includes(i))); pied(); return; }
      if (d.swr === 'refaire') { ES.sw = { i: 0, r: {} }; rendE(); return; }
      if (d.swr === 'parler') { ES.k = 'site'; ES.f = 3; ES.o = []; ES.p = 0; ES.multi = null; ES.e = 2; ES.mode = 'dem'; ES.cm = Object.assign({ part: ES.k === 'mariage' }, ES.cm || {}); rendE(); return; }
      if (d.nd != null) { ES.d = ES.d == null ? 5 : null; friseMaj(); return; }
      if (d.fill != null) { ES.e = 'fill'; rendE(); compte('/devis/fill', 'Devis : redirection vers Fill'); return; }
      if (d.mod != null) { garde(); if (ES.multi) { ES.e = 'swipe'; ES.multi = null; } else ES.e = 1; rendE(); return; }
      if (d.mode) { garde(); gardeCmd(); ES.mode = d.mode; ES.cm = ES.cm || { part: ES.k === 'mariage' }; if (d.mode === 'cmd') { ES.cm.rep = ES.cm.rep || ES.c.nom || ''; ES.cm.mail = ES.cm.mail || ES.c.mail || ''; } else { ES.c.nom = ES.c.nom || ES.cm.rep || ''; ES.c.mail = ES.c.mail || ES.cm.mail || ''; } const y = estB.scrollTop; rendE(); estB.scrollTop = y; compte('/devis/' + d.mode, d.mode === 'cmd' ? 'Commande en ligne' : 'Demande'); return; }
      if (d.qui != null) { gardeCmd(); ES.cm.part = d.qui === '1'; rendE(); return; }
      if (d.f != null) ES.f = +d.f; else if (d.p != null) ES.p = +d.p; else if (d.j) ES.j = +d.j; else if (d.o != null) { const i = +d.o; ES.o = ES.o.includes(i) ? ES.o.filter(x => x !== i) : [...ES.o, i]; } else if (d.fl != null) ES.fl = !ES.fl; else return;
      const y = estB.scrollTop; rendE(); estB.scrollTop = y;
    });
    estF.addEventListener('click', async e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.swgo != null) {
        const L = recos(), ch = (ES.sw.sel || []).map(i => L[i]).filter(Boolean); if (!ch.length) return;
        const oui = SW.filter(c => ES.sw.r[c.k] === 1).map(c => '« ' + c.t + ' »').join(' ');
        ES.k = ch[0].k; ES.f = ch[0].f; ES.o = []; ES.fl = false; ES.j = 1; ES.p = 0;
        ES.multi = ch.length > 1 ? ch.map(R => nomReco(R) + ' (' + prixTxt(R.k, R.f).replace(/<small>.*$/, '').replace(/&nbsp;/g, ' ') + ')') : null;
        if (oui) ES.c.msg = (ES.multi ? 'Formules choisies : ' + ES.multi.join(', ') + '. ' : '') + 'Situations qui me correspondent : ' + oui;
        if (ch.length > 1) { ES.e = 2; ES.mode = 'dem'; ES.cm = Object.assign({ part: ES.k === 'mariage' }, ES.cm || {}); compte('/devis/trouver-plusieurs', 'Trouver : plusieurs formules'); }
        else { ES.e = 1; compte('/devis/trouver-choisir', 'Trouver : formule choisie'); }
        rendE(); return; }
      if (b.dataset.nav === '0') { ES.e = 0; rendE(); return; }
      if (b.dataset.payer != null) { payer(b); return; }
      if (b.dataset.nav) { garde(); gardeCmd(); ES.e = Math.max(0, ES.e + Number(b.dataset.nav)); if (ES.e === 2) ES.cm = Object.assign({ part: ES.k === 'mariage' }, ES.cm || {}); rendE(); if (ES.e === 2) setTimeout(() => { const n = $('#eNom'); if (n && !n.value) n.focus({ preventScroll: true }); }, 350); return; }
      if (b.dataset.envoi != null) {
        garde(); const c = ES.c;
        const faute = (id, t) => { const f = $('#' + id); f.setAttribute('aria-invalid', 'true'); f.addEventListener('input', () => f.removeAttribute('aria-invalid'), { once: true }); erreur(t); f.focus(); };
        if (!c.nom) { faute('eNom', 'Indiquez votre nom ou celui de votre structure.'); return; }
        if (!mailOk(c.mail)) { faute('eMail', 'Cette adresse e-mail semble incomplète.'); return; }
        erreur(''); const P = PJ[ES.k], r = calc(); b.disabled = true; b.classList.add('charge'); b.firstChild.textContent = 'Envoi en cours ';
        try { await envoie({ _subject: 'Demande de devis : ' + (ES.multi ? 'plusieurs formules web' : P.l.toLowerCase()), Projet: ES.multi ? 'Plusieurs formules' : P.l, 'Détail': ES.multi ? ES.multi.join(', ') : r.L.join(', '), Estimation: ES.multi ? '' : txtEst(r), Nom: c.nom, Email: c.mail, 'Téléphone': c.tel, 'Date et lieu': c.date || '', Message: c.msg || '' }); ES.e = 3; if (!reduit) { const fl = document.createElement('div'); fl.className = 'flash'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 600); } rendE(); compte('devis-envoye', 'Demande de devis envoyée'); }
        catch (er) { b.disabled = false; b.classList.remove('charge'); b.firstChild.textContent = 'Réessayer '; erreur('L’envoi n’a pas abouti. Vérifiez votre connexion et réessayez, ou écrivez à <a href="mailto:contact@studioes.fr">contact@studioes.fr</a> : vos choix sont conservés.'); }
      }
    });
    estB.addEventListener('input', gardeCmd); estB.addEventListener('change', gardeCmd);
    retourPaiement();
    $$('[data-est]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ES.g = b.dataset.g || (b.dataset.k && PJ[b.dataset.k] ? PJ[b.dataset.k].g : null); ouvreDevis(b.dataset.swipe != null ? { swipe: 1 } : b.dataset.k && PJ[b.dataset.k] ? { k: b.dataset.k, f: 0, o: [] } : null); }));
  }

  /* message libre */
  const form = $('#ecrire');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(form)); if (d._honey) return;
    if (!d.nom) { toast('Indiquez votre nom ou celui de votre structure.'); return; }
    if (!mailOk(d.email)) { toast('Cette adresse e-mail semble incomplète.'); return; }
    if (!d.message) { toast('Quelques mots sur votre projet, et c’est parti.'); return; }
    const bt = $('button[type=submit]', form); bt.disabled = true; bt.classList.add('charge');
    try { await envoie({ _subject: 'Nouveau message depuis studioes.fr', Nom: d.nom, Email: d.email, 'Téléphone': d.tel || '', Message: d.message }); form.reset(); fermeF(); toast('Message envoyé. Réponse sous 48 h.'); compte('message-envoye', 'Message envoyé'); }
    catch (er) { toast('L’envoi n’a pas abouti. Réessayez ou écrivez à contact@studioes.fr.'); }
    bt.disabled = false; bt.classList.remove('charge');
  });

  /* appel de 30 min : fenêtre Cal.com par-dessus le site, nouvel onglet en secours */
  const CAL = 'https://cal.com/studioes/30min'; let calPret = false, calLance = false;
  const calCharge = () => {
    if (calLance) return; calLance = true;
    try {
      (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; const s = d.createElement('script'); s.src = A; s.onload = () => { calPret = true; }; d.head.appendChild(s); cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const ns = ar[1]; api.q = api.q || []; if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.com/embed/embed.js', 'init');
      Cal('init', 'rdv', { origin: 'https://app.cal.com' });
      Cal.ns.rdv('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#141414', 'cal-brand-emphasis': '#2a2a2a', 'cal-brand-text': '#ffffff' } } });
      Cal.ns.rdv('on', { action: 'bookingSuccessful', callback: () => compte('rdv-pris', 'Rendez-vous pris') });
    } catch (e) {}
  };
  const ouvreCal = () => {
    compte('rdv-ouvert', 'Ouverture de l’agenda');
    /* l'agenda s'ouvre toujours par-dessus le site : fenêtre Cal.com si son script est prêt, sinon notre propre feuille avec l'agenda intégré */
    const modale = () => { try { Cal.ns.rdv('modal', { calLink: 'studioes/30min', config: { layout: 'month_view', theme: 'light' } }); return true; } catch (e) { return false; } };
    if (calPret && window.Cal && Cal.ns && Cal.ns.rdv && modale()) return;
    calCharge(); const t0 = Date.now(); toast('Ouverture de l’agenda…');
    const attend = () => { if (calPret && window.Cal && Cal.ns && Cal.ns.rdv && modale()) return; if (Date.now() - t0 < 2500) return setTimeout(attend, 120); feuilleCal(); };
    attend();
  };
  const feuilleCal = () => {
    const f = $('#calF'); if (!f.src) f.src = 'https://app.cal.com/studioes/30min/embed?embed=&layout=month_view&theme=light&embedType=inline';
    ouvreF('#shC');
  };
  /* liens vers Fill et son espace client : un événement court par destination */
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="https://fill.studioes.fr"]'); if (a) compte(/^https:\/\/fill\.studioes\.fr\/espace/.test(a.href) ? 'espace-fill' : 'fill', a.textContent.trim()); });
  document.addEventListener('click', e => { const b = e.target.closest('[data-cal]'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (ouverte) fermeF(); ouvreCal(); });
  const ctc = $('#contact'); if (ctc) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); calCharge(); } }, { rootMargin: '800px 0px' }).observe(ctc);
  $$('[data-est]').forEach(b => b.addEventListener('pointerenter', calCharge, { once: true }));
})();

/* anciens ancrages */
(() => { const H = location.hash;
  if (H === '#mentions') { const b = document.querySelector('[data-legal]'); if (b) setTimeout(() => b.click(), 300); return; }
  if (H === '#devis' || H === '#estimer') { const b = document.querySelector('[data-est]'); if (b) setTimeout(() => b.click(), 300); return; }
  if (H === '#cal') { const b = document.querySelector('[data-cal]'); try { history.replaceState(null, '', location.pathname); } catch (e) {} if (b) setTimeout(() => b.click(), 300); return; }
  const vers = { '#photographie': '/metiers/photographie/', '#travaux': '/metiers/photographie/#photographie', '#web': '/metiers/sites-et-outils/', '#realisations': '/realisations/', '#applications': '/metiers/sites-et-outils/#applications', '#offre': '/metiers/photographie/#formules', '#offres': '/metiers/photographie/#formules' }[H];
  if (vers && !document.getElementById(H.slice(1))) { location.replace(vers); return; }
  const m = { '#rdv': 'contact' }[H]; const t = m && document.getElementById(m); if (t) setTimeout(() => t.scrollIntoView(), 200); })();

/* bannière : fondu entre les photos, une toutes les 5 secondes */
(function(){var f=document.querySelector('.h2p');if(!f||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var im=[].slice.call(f.querySelectorAll('img')),c=document.getElementById('h2c'),k=0;
setInterval(function(){if(document.hidden)return;im[k].classList.remove('on');k=(k+1)%im.length;im[k].classList.add('on');c.textContent=im[k].dataset.c;},5000);})();

/* Réalisations : filtres par discipline, un projet peut porter plusieurs étiquettes */
(() => {
  const f = document.querySelector('[data-filtre]'); if (!f) return;
  const tl = [...document.querySelectorAll('.rl-g .nu')], g = document.querySelector('.rl-g');
  f.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return; const k = b.dataset.f;
    f.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    tl.forEach((t, i) => { const on = !k || t.dataset.t.split(' ').includes(k); t.hidden = !on; if (on) { t.classList.remove('in'); void t.offsetWidth; t.classList.add('in'); } });
    if (g) { g.scrollLeft = 0; g.dispatchEvent(new Event('scroll')); }
    const d = g && g.nextElementSibling; if (d && d.classList.contains('dots')) { const n = tl.filter(t => !t.hidden).length; d.innerHTML = '<i></i>'.repeat(n); g.dispatchEvent(new Event('scroll')); }
  });
})();
/* « Voir plus » : un nuancier de plus de deux lignes (quatre cartes sur mobile) se replie, un bouton l'ouvre */
(() => {
  const mob = matchMedia('(max-width:600px)');
  document.querySelectorAll('.pk-g').forEach(g => {
    const cartes = [...g.children], n = cartes.length;
    if (n <= 4) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'bt pk-plus';
    b.innerHTML = 'Voir plus <span class="ar"><svg class="i"><use href="#ar"/></svg></span>';
    g.after(b);
    const maj = () => {
      const lim = mob.matches ? 4 : 10, ouvert = g.classList.contains('ouvert');
      cartes.forEach((c, i) => { c.hidden = !ouvert && i >= lim; });
      b.hidden = ouvert || n <= lim;
    };
    b.addEventListener('click', () => { g.classList.add('ouvert'); maj(); const c = cartes[mob.matches ? 4 : 10]; if (c) c.querySelector('a,[tabindex]')?.focus?.({ preventScroll: true }); });
    mob.addEventListener('change', maj); maj();
  });
})();
