/* Studio ES 2027 : interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const NB = ' ', fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const compte = (p, t) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: p, title: t || p, event: true }); } catch (e) {} };
  const toast = t => { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 3400); };
  const ico = id => `<svg class="i"><use href="#${id}"/></svg>`;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rangs = el => [...el.children].forEach((c, i) => c.style.setProperty('--i', i));

  /* en-tête, dock et retour en haut : verre dépoli, version nuit au-dessus des rubriques sombres */
  const hd = $('#hd'), dock = $('#dock'), hautBt = $('.haut-bt'), sombres = $$('[data-dark]'), feuilles = $$('.feuille');
  /* empilement : chaque rubrique se fige à sa fin, la suivante glisse par-dessus */
  const pile = [...document.querySelectorAll('main > .hero, main > .mh, main > .feuille')];
  /* la hauteur de chaque rubrique est mesurée seulement quand elle change vraiment, le haut de figeage est calculé en CSS sur la petite hauteur d'écran : rien ne saute quand la barre du navigateur mobile apparaît */
  const fige = () => pile.forEach(el => { el.classList.add('empile'); const h = el.offsetHeight; if (Math.abs((el._h || 0) - h) > 2) { el._h = h; el.style.setProperty('--h', h + 'px'); } });
  fige(); if (window.ResizeObserver) { const ro = new ResizeObserver(() => fige()); pile.forEach(el => ro.observe(el)); }
  const sur = y => sombres.some(s => { const r = s.getBoundingClientRect(); return r.top < y && r.bottom > y; });
  let tic = false;
  const etat = () => {
    tic = false; const y = scrollY, H = innerHeight;
    hd.classList.toggle('on', y > 10); hd.classList.toggle('dk', sur(32));
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
    el.innerHTML = `<span class="sr">${txt}</span>` + '<span class="od" aria-hidden="true">' + [...txt].map(c => /\d/.test(c) ? `<span class="dg"><span>${BANDE}</span></span>` : '<span class="sp"></span>').join('') + '</span>';
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
  const charge = i => { if (i.dataset.src) { i.src = i.dataset.src; i.removeAttribute('data-src'); } };
  const puces = $$('[data-chips]').map(el => ({ ims: $$('.win > img', el), k: 0 }));
  const avancePuces = () => puces.forEach(D => { if (!D.ims.length) return; D.ims[D.k].classList.remove('on'); D.k = (D.k + 1) % D.ims.length; charge(D.ims[D.k]); D.ims[D.k].classList.add('on'); });
  const ban = $('#ban');
  if (ban) {
    const ims = $$('.shot .ph img', ban), hT = $('#banH'), hud = $('.hud', ban), af = $('#af');
    let k = 0, n = 1, vis = true, tm = [];
    setTimeout(() => { ims.forEach(charge); puces.forEach(D => D.ims.forEach(charge)); }, 900);
    const plus = (f, ms) => tm.push(setTimeout(f, ms));
    const tour = premier => {
      tm.forEach(clearTimeout); tm = [];
      if (!vis || document.hidden) { plus(() => tour(premier), 800); return; }
      const im = ims[k];
      if (!premier) { ims.forEach(x => x.classList.toggle('on', x === im)); charge(im); avancePuces(); }
      ban.classList.remove('site', 'net', 'clic'); ban.classList.add('flou');
      hT.textContent = im.dataset.h;
      plus(() => { ban.classList.remove('flou'); ban.classList.add('net'); }, premier ? 900 : 700);
      plus(() => { ban.classList.add('clic'); }, premier ? 1700 : 1450);
      plus(() => { ban.classList.remove('net', 'clic'); ban.classList.add('site'); }, premier ? 2150 : 1900);
      plus(() => { ban.classList.remove('site'); }, premier ? 6300 : 6050);
      plus(() => { k = (k + 1) % ims.length; tour(false); }, premier ? 7250 : 7000);
    };
    if (!reduit) {
      new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .15 }).observe(ban);
      tour(true);
      /* sur ordinateur, le collimateur suit la souris dans le cadre */
      if (!tactile) ban.addEventListener('pointermove', e => { const r = hud.getBoundingClientRect(); af.style.setProperty('--ax', clamp(e.clientX - r.left, 50, r.width - 50) + 'px'); af.style.setProperty('--ay', clamp(e.clientY - r.top, 36, r.height - 36) + 'px'); });
      if (!tactile) ban.addEventListener('pointerleave', () => { af.style.removeProperty('--ax'); af.style.removeProperty('--ay'); });
    }
  }

  /* cartes d'offre */
  const swPh = $('#swPh');
  const etatCarte = c => {
    const k = c.dataset.k, rows = $$('.sel [role="radio"]', c), b = rows.find(x => x.getAttribute('aria-checked') === 'true');
    const f = b ? rows.indexOf(b) : Number(c.dataset.f || 0);
    const o = $$('.opt .op', c).filter(i => i.getAttribute('aria-pressed') === 'true').map(i => +i.dataset.o);
    const mois = c.dataset.mois === '1', achat = c.dataset.achat === '1';
    let v;
    if (k === 'site') v = +$('.prix', c).dataset.b + (swPh && swPh.checked ? 350 : 0);
    else if (k === 'app') v = +$('.prix', c).dataset[achat ? 'ac' : 'ab'];
    else if (b && b.dataset.p) v = +(mois && b.dataset.m ? b.dataset.m : b.dataset.p) + $$('.opt .op', c).filter(i => i.getAttribute('aria-pressed') === 'true').reduce((s, i) => s + Number(i.dataset.p), 0);
    else v = null;
    return { k, f, o, mois, achat, ph: k === 'site' && swPh && swPh.checked, v };
  };
  const repere = c => { const s = $('.sel', c); if (!s) return; const b = $('[aria-checked="true"]', s); if (!b) return; s.style.setProperty('--y', b.offsetTop + 'px'); s.style.setProperty('--h', b.offsetHeight + 'px'); };
  const majCarte = c => {
    const E = etatCarte(c); prix($('.prix', c), E.v);
    const u = $('[data-u]', c); if (u) u.textContent = E.mois ? '€/mois' : '€/an';
    const bm = $('.bascule[data-mo]', c); if (bm) bm.hidden = E.v == null;
    if (E.k === 'app') { const d = $('.dt', c); d.innerHTML = E.achat ? d.dataset.ac : d.dataset.ab; }
    repere(c);
  };
  const cartes = $$('[data-of]');
  cartes.forEach(c => {
    $$('.sel [role="radio"]', c).forEach(b => b.addEventListener('click', () => { $$('.sel [role="radio"]', c).forEach(x => x.setAttribute('aria-checked', String(x === b))); majCarte(c); }));
    $$('.opt .op', c).forEach(i => i.addEventListener('click', () => { i.setAttribute('aria-pressed', String(i.getAttribute('aria-pressed') !== 'true')); majCarte(c); }));
    const bm = $('.bascule[data-mo]', c);
    if (bm) $$('button', bm).forEach(b => b.addEventListener('click', () => { bm.dataset.v = b.dataset.v; $$('button', bm).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.mois = b.dataset.v; majCarte(c); }));
    const ba = $('.bascule[data-ap]', c);
    if (ba) $$('button', ba).forEach(b => b.addEventListener('click', () => { ba.dataset.v = b.dataset.v; $$('button', ba).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.achat = b.dataset.v; majCarte(c); }));
    /* un clic n'importe où sur la carte ouvre le devis, avec ce qui a été choisi */
    c.addEventListener('click', e => { if (e.target.closest('.sel,.opt,.bascule,a')) return; ouvreDevis(etatCarte(c)); });
    repere(c);
  });
  addEventListener('resize', () => cartes.forEach(repere));
  document.fonts && document.fonts.ready.then(() => cartes.forEach(repere));
  const vraies = $('.vraies');
  if (swPh) swPh.addEventListener('change', () => { if (vraies) vraies.classList.toggle('on', swPh.checked); $$('[data-k="site"]').forEach(c => majCarte(c)); });

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
    const n = g.children.length; d.innerHTML = '<i></i>'.repeat(n);
    const maj = () => { const w = g.scrollWidth - g.clientWidth; const k = w > 0 ? Math.round(g.scrollLeft / w * (n - 1)) : 0; $$('i', d).forEach((x, j) => x.classList.toggle('on', j === k)); };
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
  const K = { scene: 'Concert', public: 'Festival et public', corp: 'Entreprise, collectivité' };
  const FI = [['tout', 'Tout'], ['scene', 'Concerts'], ['public', 'Festivals et public'], ['corp', 'Entreprises et collectivités']];
  const REPS = window.REPS || []; let filtre = 'tout';
  const railR = $('#rail'), chips = $('#chips');
  const dessine = () => {
    if (!railR) return;
    const L = filtre === 'tout' ? REPS : REPS.filter(r => r.k === filtre);
    let h = '';
    L.forEach((r, i) => {
      h += `<button class="rc" data-r="${r.id}" aria-label="Voir le reportage ${r.t}"><span class="im"><img src="/p/t/${r.ph[0]}.webp" alt="" loading="${i < 8 ? 'eager' : 'lazy'}" decoding="async"><span class="rafale" aria-hidden="true"><i class="on"></i><i></i><i></i><i></i></span></span><span class="lab"><b>${r.t}</b><span>${K[r.k] || ''}</span><small>${r.ph.length} photos</small></span></button>`;
    });
    railR.innerHTML = h; rangs(railR); if (railR.classList.contains('vu') && !reduit) { railR.classList.remove('vu'); void railR.offsetWidth; requestAnimationFrame(() => railR.classList.add('vu')); } railR.scrollLeft = 0; const R = rails.find(x => x.el === railR); if (R) { R.pos = 0; R.fin = 0; R.attente = performance.now() + 1500; }
  };
  if (railR) {
    rail(railR);
    FI.forEach(([k, l], i) => {
      const n = k === 'tout' ? REPS.length : REPS.filter(r => r.k === k).length; if (!n) return;
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
    railR.addEventListener('click', e => { const c = e.target.closest('[data-r]'); if (c) ouvreGal(REPS.find(r => r.id === c.dataset.r)); });
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
    $('#gpK').textContent = K[r.k] || 'Reportage'; $('#gpT').textContent = r.t; $('#gpS').textContent = r.ph.length + ' photos';
    const RAT = window.RAT || {}; gpG.innerHTML = r.ph.map((p, i) => `<button data-i="${i}" aria-label="Agrandir la photo ${i + 1}" style="aspect-ratio:${RAT[p] || .75}"><img src="/p/t/${p}.webp" width="640" height="${Math.round(640 / (RAT[p] || .75))}" alt="${r.t}, photo ${i + 1}" loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async"></button>`).join('');
    const autres = REPS.filter(x => x !== r && x.k === r.k).concat(REPS.filter(x => x !== r && x.k !== r.k)).slice(0, 4);
    $('#gpSim').innerHTML = autres.map(x => `<button data-r="${x.id}"><img src="/p/t/${x.ph[0]}.webp" alt="" loading="lazy"><b>${x.t}</b></button>`).join('');
    if (gp.hidden) { avantG = document.activeElement; gp.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => gp.classList.add('on'))); document.documentElement.style.overflow = 'hidden'; if (dock) dock.classList.add('cache'); setTimeout(() => $('#gpB').focus({ preventScroll: true }), 80); }
    gp.scrollTop = 0; try { history.replaceState(null, '', '#r=' + r.id); } catch (e) {}
    $$('button', gpG).forEach(b => b.classList.add('in'));
    compte('/galerie/' + r.id, 'Galerie : ' + r.t);
  };
  const fermeGal = () => { if (!gp || gp.hidden) return; fermeLb(); gp.classList.remove('on'); document.documentElement.style.overflow = ''; if (dock) dock.classList.remove('cache'); setTimeout(() => gp.hidden = true, 400); try { history.replaceState(null, '', location.pathname); } catch (e) {} if (avantG) avantG.focus({ preventScroll: true }); };
  const ouvreLb = i => { const r = G.r; G.i = (i + r.ph.length) % r.ph.length; lbI.style.opacity = .25; lbI.onload = () => lbI.style.opacity = 1; lbI.src = `/p/${r.ph[G.i]}.jpg`; lbI.alt = `${r.t}, photo ${G.i + 1} sur ${r.ph.length}`; $('#lbC').textContent = (G.i + 1) + ' / ' + r.ph.length; if (lb.hidden) { lb.hidden = false; requestAnimationFrame(() => lb.classList.add('on')); $('#lbX').focus({ preventScroll: true }); } const n = new Image(); n.src = `/p/${r.ph[(G.i + 1) % r.ph.length]}.jpg`; };
  const fermeLb = () => { if (!lb || lb.hidden) return; lb.classList.remove('on'); setTimeout(() => lb.hidden = true, 300); };
  if (gp) {
    $('#gpB').addEventListener('click', fermeGal);
    gpG.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) ouvreLb(+b.dataset.i); });
    $('#gpSim').addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (b) ouvreGal(REPS.find(r => r.id === b.dataset.r)); });
    $('#gpGo').addEventListener('click', () => { const r = G.r; fermeGal(); ouvreDevis({ k: r && r.k === 'corp' ? 'evenement' : 'evenement', f: r && r.k === 'public' ? 2 : 0, o: [] }); });
    $('#lbP').addEventListener('click', () => ouvreLb(G.i - 1)); $('#lbN').addEventListener('click', () => ouvreLb(G.i + 1)); $('#lbX').addEventListener('click', fermeLb);
    lb.addEventListener('click', e => { if (e.target === lb) fermeLb(); });
    let x0 = null; lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true }); lb.addEventListener('touchend', e => { if (x0 == null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) ouvreLb(G.i + (d < 0 ? 1 : -1)); x0 = null; }, { passive: true });
    addEventListener('keydown', e => { if (!lb.hidden) { if (e.key === 'ArrowRight') ouvreLb(G.i + 1); else if (e.key === 'ArrowLeft') ouvreLb(G.i - 1); else if (e.key === 'Escape') fermeLb(); } else if (!gp.hidden && e.key === 'Escape') fermeGal(); });
  }
  const h = location.hash.match(/^#r=([\w-]+)/);
  if (h) { const r = REPS.find(x => x.id === h[1]); if (r && gp) setTimeout(() => ouvreGal(r), 300); else { const go = { soute: '/projets/la-soute/', marelle: '/projets/mjc-la-marelle/' }[h[1]]; if (go) location.replace(go); else { const t = $('#travaux'); if (t) setTimeout(() => t.scrollIntoView(), 200); } } }

  /* feuilles */
  const voile = $('#voile'); let ouverte = null, avant = null;
  const ouvreF = id => { const s = $(id); if (!s) return; if (ouverte && ouverte !== s) { ouverte.classList.remove('on'); ouverte.hidden = true; } else avant = document.activeElement; s.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => { s.classList.add('on'); voile.classList.add('on'); })); ouverte = s; document.documentElement.style.overflow = 'hidden'; if (dock) dock.classList.add('cache'); setTimeout(() => { const f = $('.x', s); if (f) f.focus({ preventScroll: true }); }, 80); };
  const fermeF = () => { if (!ouverte) return; const s = ouverte; s.classList.remove('on'); voile.classList.remove('on'); document.documentElement.style.overflow = ''; if (dock) dock.classList.remove('cache'); setTimeout(() => { if (!s.classList.contains('on')) s.hidden = true; }, 600); ouverte = null; if (avant) avant.focus({ preventScroll: true }); };
  voile.addEventListener('click', fermeF); $$('[data-close]').forEach(b => b.addEventListener('click', fermeF));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) fermeF(); });
  $$('[data-legal]').forEach(b => b.addEventListener('click', () => ouvreF('#shL')));
  $$('[data-msg]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ouvreF('#shM'); setTimeout(() => $('#ecrire [name=nom]').focus({ preventScroll: true }), 450); }));

  /* envoi par FormSubmit */
  const envoie = async champs => {
    const r = await fetch('https://formsubmit.co/ajax/contact@studioes.fr', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ _template: 'table', _captcha: 'false' }, champs)) });
    if (!r.ok) throw new Error('envoi'); return r;
  };
  const mailOk = m => /^\S+@\S+\.\S+$/.test(m || '');

  /* devis : grille du 20 octobre 2026, prix « dès » */
  const PJ = {
    mariage: { l: 'Un mariage', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Formule', o: [['Cérémonie', 1290, 'Moments clés, 4 à 6 h'], ['Journée', 1890, '8 à 10 h sur place'], ['Journée et album', 2590, 'Album imprimé, séance à deux']] }, o: { l: 'Options', o: [['Aperçu de 20 photos le soir même', 150], ['Une heure de plus', 80]] } },
    evenement: { l: 'Un événement', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Durée', o: [['Concert', 250, 'Spectacle, 1 h 30 à 2 h'], ['Demi-journée', 350, '4 h sur place'], ['Journée ou festival', 550, '8 h sur place, par jour', 'j']] }, o: { l: 'Options', o: [['Sélection livrée le soir même', 150], ['Une heure de plus', 80]] } },
    annee: { l: 'Un suivi photo annuel', g: 'Photographie', ic: 'ca', f: { l: 'Forfait', o: [['4 demi-journées', [1290, 109], 'soit 323 € l’une'], ['8 demi-journées', [2490, 209], 'soit 311 € l’une'], ['12 demi-journées', [3590, 299], 'soit 299 € l’une'], ['Plus de 12', null, 'sur devis']] }, p: { l: 'Paiement', o: [['Par an', 'en une fois'], ['Par mois', 'sur 12 mois']] } },
    site: { l: 'Un site internet', g: 'Web', ic: 'ec', f: { l: 'Formule', o: [['Essentiel', 990, 'Une page'], ['Vitrine', 1990, '3 à 5 pages'], ['Sur mesure', 4490, 'Arborescence libre'], ['À définir ensemble', null, 'On en parle']] }, o: { l: 'En plus', o: [['Reportage photo du lieu et de l’équipe', 350], ['Réservation ou espace membres', null]] } },
    app: { l: 'Une application', g: 'Web', ic: 'pl', f: { l: 'Projet', o: [['Devis en ligne', [190, 85, 1090]], ['Application web', [390, 150, 2790]], ['Avec automatisations', [790, 250, 5490]], ['Une idée à préciser', null, 'On en parle']] }, p: { l: 'Formule', o: [['Abonnement', 'engagement de 18 mois'], ['Achat', 'l’application vous appartient']] } }
  };
  const estB = $('#estB'), estF = $('#estF');
  let ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: {} };
  const calc = () => {
    if (!ES.k) return null; const P = PJ[ES.k], f = P.f.o[ES.f]; let a = 0, m = 0, dv = false, per = ''; const L = [f[0]];
    if (ES.k === 'annee') { if (f[1] == null) dv = true; else if (ES.p) { m = f[1][1]; per = 'par mois, sur 12 mois'; } else { a = f[1][0]; per = 'par an'; } if (f[1]) L.push(ES.p ? 'paiement au mois' : 'paiement à l’année'); }
    else if (ES.k === 'app') { if (f[1] == null) dv = true; else if (ES.p) { a = f[1][2]; L.push('à l’achat'); } else { a = f[1][0]; m = f[1][1]; L.push('en abonnement'); } }
    else { if (f[1] == null) dv = true; else a = f[1] * (f[3] === 'j' ? ES.j : 1); if (f[3] === 'j') L[0] += `, ${ES.j} jour${ES.j > 1 ? 's' : ''}`; if (ES.k === 'site' && f[1] != null) m = 35; }
    if (P.o) ES.o.forEach(i => { const o = P.o.o[i]; if (o[1] == null) dv = true; else a += o[1]; L.push(o[0]); });
    return { a, m, dv, per, L };
  };
  const txtEst = r => !r ? '' : (r.a || r.m) ? `dès ${fmt(r.a || r.m)} €${r.a && r.m ? `, puis ${fmt(r.m)} € par mois` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}` : 'sur devis';
  let dernier = null;
  const pied = () => {
    const r = calc(), cible = r ? (r.a || r.m || null) : null;
    const v = !r ? `<small>Estimation</small><span class="v"><i>Choisissez votre projet</i></span>`
      : cible ? `<small>Estimation</small><span class="v"><small>dès</small><b class="prix" id="estN"></b><i>€${r.a && r.m ? `, puis ${fmt(r.m)} € par mois` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}</i></span>`
      : `<small>Estimation</small><span class="v"><b class="sd">Sur devis</b></span>`;
    const act = ES.e === 0 ? `<button class="bt cl sm" data-cal>Préférer un appel</button>`
      : ES.e === 1 ? `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-nav="1">Continuer <span class="ar">${ico('ar')}</span></button>`
      : `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-envoi>Envoyer la demande <span class="ar">${ico('ar')}</span></button>`;
    estF.innerHTML = ES.e === 3 ? '' : `<div class="tot">${v}</div><div class="act">${act}</div>`;
    const n = $('#estN');
    if (n) { n._ch = dernier; odo(n, fmt(cible), !dernier); dernier = n._ch; } else dernier = null;
  };
  const rendE = () => {
    $$('#estP i').forEach((x, i) => x.classList.toggle('on', i <= Math.min(ES.e, 2)));
    let h = '';
    if (ES.e === 0) {
      ['Photographie', 'Web'].forEach(g => { h += `<div class="q"><p>${g}</p><div class="opts ch">${Object.entries(PJ).filter(([, P]) => P.g === g).map(([k, P]) => `<button data-k="${k}" aria-pressed="${ES.k === k}">${ico(P.ic)}<span>${P.l}</span></button>`).join('')}</div></div>`; });
    } else if (ES.e === 1) {
      const P = PJ[ES.k];
      h += `<div class="q"><p>${P.l}</p></div><div class="q"><p>${P.f.l}</p><div class="opts">${P.f.o.map((o, i) => { const pr = o[1] == null ? 'sur devis' : Array.isArray(o[1]) ? (ES.k === 'app' ? (ES.p ? `dès ${fmt(o[1][2])} €` : `dès ${fmt(o[1][0])} €, puis ${o[1][1]} €/mois`) : (ES.p ? `dès ${o[1][1]} € par mois` : `dès ${fmt(o[1][0])} € par an`)) : `dès ${fmt(o[1])} €`; return `<button data-f="${i}" aria-pressed="${ES.f === i}">${o[0]}${o[2] ? `<small>${o[2]}</small>` : ''}<em>${pr}</em></button>`; }).join('')}</div></div>`;
      const f = P.f.o[ES.f]; if (f[3] === 'j') h += `<div class="q"><p>Nombre de jours</p><div class="opts" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5].map(j => `<button data-j="${j}" aria-pressed="${ES.j === j}" style="align-items:center">${j}</button>`).join('')}</div></div>`;
      if (P.p && f[1] != null) h += `<div class="q"><p>${P.p.l}</p><div class="opts">${P.p.o.map((o, i) => `<button data-p="${i}" aria-pressed="${ES.p === i}">${o[0]}<small>${o[1]}</small></button>`).join('')}</div></div>`;
      if (P.o) h += `<div class="q"><p>${P.o.l} (facultatif)</p><div class="opts">${P.o.o.map((o, i) => `<button data-o="${i}" aria-pressed="${ES.o.includes(i)}">${o[0]}<em>${o[1] == null ? 'sur devis' : '+' + fmt(o[1]) + ' €'}</em></button>`).join('')}</div></div>`;
    } else if (ES.e === 2) {
      const P = PJ[ES.k], r = calc(), c = ES.c, q = s => (s || '').replace(/"/g, '&quot;');
      h += `<div class="recap"><b>${P.l}</b>${r.L.join(' · ')}<br>Estimation : ${txtEst(r)}</div><div class="form" style="margin-top:16px">
        <label>Nom, structure<input id="eNom" autocomplete="name" value="${q(c.nom)}"></label>
        <label>E-mail<input id="eMail" type="email" autocomplete="email" value="${q(c.mail)}"></label>
        <label>Téléphone, si vous préférez être rappelé<input id="eTel" type="tel" autocomplete="tel" value="${q(c.tel)}"></label>
        ${P.date || ES.k === 'annee' ? `<label>${ES.k === 'annee' ? 'Vos temps forts de l’année, même approximatifs' : 'Date et lieu, même approximatifs'}<input id="eDate" value="${q(c.date)}"></label>` : ''}
        <label>Précisions<textarea id="eMsg" placeholder="Facultatif">${c.msg || ''}</textarea></label></div>`;
    } else {
      h += `<div class="fini"><span class="ok-i">${ico('ok')}</span><h3>Demande envoyée.</h3><p>Réponse sous 48 h avec un devis détaillé.<br>Pour aller plus vite, un appel de 30 min est possible.</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:22px"><button class="bt" data-cal>Réserver un appel <span class="ar">${ico('ar')}</span></button><button class="bt cl" data-close>Fermer</button></div></div>`;
    }
    estB.innerHTML = h; estB.scrollTop = 0; pied();
    $$('[data-close]', estB).forEach(b => b.addEventListener('click', fermeF));
  };
  const garde = () => { const g = id => { const e = $('#' + id); return e ? e.value.trim() : ''; }; if (ES.e === 2) ES.c = { nom: g('eNom'), mail: g('eMail'), tel: g('eTel'), date: g('eDate'), msg: g('eMsg') }; };
  const ouvreDevis = s => {
    if (ES.e === 3) ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: ES.c };
    if (s && s.k && PJ[s.k]) { ES.k = s.k; ES.f = s.f || 0; ES.o = (s.o || []).slice(); ES.j = 1; ES.p = s.k === 'app' ? (s.achat ? 1 : 0) : (s.mois ? 1 : 0); if (s.ph) ES.o = [0]; ES.e = 1; }
    else if (!ES.k) ES.e = 0;
    dernier = null; rendE(); ouvreF('#shE'); compte('/devis', 'Ouverture du devis');
  };
  if (estB) {
    estB.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.k) { ES.k = d.k; ES.f = 0; ES.o = []; ES.p = 0; ES.j = 1; ES.e = 1; rendE(); compte('/devis/' + d.k, 'Devis : ' + PJ[d.k].l); return; }
      if (d.f != null) ES.f = +d.f; else if (d.p != null) ES.p = +d.p; else if (d.j) ES.j = +d.j; else if (d.o != null) { const i = +d.o; ES.o = ES.o.includes(i) ? ES.o.filter(x => x !== i) : [...ES.o, i]; } else return;
      const y = estB.scrollTop; rendE(); estB.scrollTop = y;
    });
    estF.addEventListener('click', async e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.nav) { garde(); ES.e = Math.max(0, ES.e + Number(b.dataset.nav)); rendE(); if (ES.e === 2) setTimeout(() => { const n = $('#eNom'); if (n && !n.value) n.focus({ preventScroll: true }); }, 350); return; }
      if (b.dataset.envoi != null) {
        garde(); const c = ES.c;
        if (!c.nom) { toast('Indiquez votre nom ou celui de votre structure.'); $('#eNom').focus(); return; }
        if (!mailOk(c.mail)) { toast('Cette adresse e-mail semble incomplète.'); $('#eMail').focus(); return; }
        const P = PJ[ES.k], r = calc(); b.disabled = true;
        try { await envoie({ _subject: 'Demande de devis : ' + P.l.toLowerCase(), Projet: P.l, 'Détail': r.L.join(', '), Estimation: txtEst(r), Nom: c.nom, Email: c.mail, 'Téléphone': c.tel, 'Date et lieu': c.date || '', Message: c.msg || '' }); ES.e = 3; rendE(); compte('/devis/envoye', 'Demande de devis envoyée'); }
        catch (er) { b.disabled = false; toast('L’envoi a échoué. Écrivez à contact@studioes.fr.'); }
      }
    });
    $$('[data-est]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ouvreDevis(null); }));
  }

  /* combien de temps une application ferait gagner */
  const cal = $('#calc');
  if (cal) {
    const rH = $('#rH'), SEM = 47;
    const remp = r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%');
    const maj = () => {
      const h = +rH.value, an = h * SEM, j = Math.round(an / 7);
      $('#cH').textContent = h + ' h'; remp(rH);
      prix($('#cAn'), an); prix($('#cJ'), j);
    };
    rH.addEventListener('input', maj); maj();
  }

  /* message libre */
  const form = $('#ecrire');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(form)); if (d._honey) return;
    if (!d.nom) { toast('Indiquez votre nom ou celui de votre structure.'); return; }
    if (!mailOk(d.email)) { toast('Cette adresse e-mail semble incomplète.'); return; }
    if (!d.message) { toast('Quelques mots sur votre projet, et c’est parti.'); return; }
    const bt = $('button[type=submit]', form); bt.disabled = true;
    try { await envoie({ _subject: 'Nouveau message depuis studioes.fr', Nom: d.nom, Email: d.email, 'Téléphone': d.tel || '', Message: d.message }); form.reset(); fermeF(); toast('Message envoyé. Réponse sous 48 h.'); compte('/contact/envoye', 'Message envoyé'); }
    catch (er) { toast('L’envoi a échoué. Écrivez à contact@studioes.fr.'); }
    bt.disabled = false;
  });

  /* appel de 30 min : fenêtre Cal.com par-dessus le site, nouvel onglet en secours */
  const CAL = 'https://cal.eu/studioes/30min'; let calPret = false, calLance = false;
  const calCharge = () => {
    if (calLance) return; calLance = true;
    try {
      (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; const s = d.createElement('script'); s.src = A; s.onload = () => { calPret = true; }; d.head.appendChild(s); cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const ns = ar[1]; api.q = api.q || []; if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.eu/embed/embed.js', 'init');
      Cal('init', 'rdv', { origin: 'https://app.cal.eu' });
      Cal.ns.rdv('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#141414', 'cal-brand-emphasis': '#2a2a2a', 'cal-brand-text': '#ffffff' } } });
      Cal.ns.rdv('on', { action: 'bookingSuccessful', callback: () => compte('/rendez-vous/pris', 'Rendez-vous pris') });
    } catch (e) {}
  };
  const ouvreCal = () => {
    compte('/rendez-vous/ouverture', 'Ouverture de l’agenda');
    if (calPret && window.Cal && Cal.ns && Cal.ns.rdv) { try { Cal.ns.rdv('modal', { calLink: 'studioes/30min', config: { layout: 'month_view', theme: 'light' } }); return; } catch (e) {} }
    window.open(CAL, '_blank', 'noopener');
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-cal]'); if (!b) return; e.preventDefault(); e.stopPropagation(); if (ouverte) fermeF(); ouvreCal(); });
  const ctc = $('#contact'); if (ctc) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); calCharge(); } }, { rootMargin: '800px 0px' }).observe(ctc);
  $$('[data-est]').forEach(b => b.addEventListener('pointerenter', calCharge, { once: true }));
})();

/* anciens ancrages */
(() => { const H = location.hash;
  if (H === '#mentions') { const b = document.querySelector('[data-legal]'); if (b) setTimeout(() => b.click(), 300); return; }
  if (H === '#devis' || H === '#estimer') { const b = document.querySelector('[data-est]'); if (b) setTimeout(() => b.click(), 300); return; }
  const m = { '#rdv': 'contact', '#offre': 'photographie', '#offres': 'photographie' }[H]; const t = m && document.getElementById(m); if (t) setTimeout(() => t.scrollIntoView(), 200); })();
