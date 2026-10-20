/* Studio ES 2027 : interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const NB = ' ', fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const stock = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const compte = (p, t) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: p, title: t || p, event: true }); } catch (e) {} };
  const toast = t => { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 3400); };
  const ico = id => `<svg class="i"><use href="#${id}"/></svg>`;

  /* en-tête et dock : verre dépoli au défilement, version nuit au-dessus des sections sombres */
  const hd = $('#hd'), dock = $('#dock'), sombres = $$('[data-dark]');
  const etat = () => {
    hd.classList.toggle('on', scrollY > 10);
    const sur = y => sombres.some(s => { const r = s.getBoundingClientRect(); return r.top < y && r.bottom > y; });
    hd.classList.toggle('dk', sur(32)); if (dock) dock.classList.toggle('dk', sur(innerHeight - 40));
  };
  addEventListener('scroll', etat, { passive: true }); addEventListener('resize', etat); etat();

  /* apparition au défilement */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .06 });
  $$('.rv').forEach(e => io.observe(e));

  /* chiffres qui roulent : chaque chiffre est une bande de 0 à 9 */
  const roule = (el, v, depuisZero) => {
    const s = typeof v === 'string' ? v : fmt(v); el.setAttribute('aria-label', typeof v === 'string' ? fmt(el.dataset.v || '') : fmt(v));
    const motif = s.replace(/\d/g, '9');
    if (el.dataset.motif !== motif || !el.querySelector('.dg')) {
      el.dataset.motif = motif;
      el.innerHTML = [...s].map(c => /\d/.test(c) ? `<span class="dg" aria-hidden="true"><span class="st" style="--n:0">${'0123456789'.split('').map(d => `<span>${d}</span>`).join('')}</span></span>` : `<span class="sp" aria-hidden="true">${c === NB ? '' : c}</span>`).join('');
      if (!depuisZero) { const cols = $$('.st', el), ds = s.replace(/\D/g, ''); cols.forEach((c, i) => { c.style.transition = 'none'; c.style.setProperty('--n', ds[i]); }); void el.offsetWidth; cols.forEach(c => c.style.transition = ''); if (typeof v !== 'string') el.dataset.v = v; return; }
      void el.offsetWidth;
    }
    const ds = s.replace(/\D/g, '');
    $$('.st', el).forEach((c, i) => { c.style.setProperty('--dl', (i * 55) + 'ms'); c.style.setProperty('--n', ds[i]); });
    if (typeof v !== 'string') el.dataset.v = v;
  };
  const rolls = $$('.roll');
  if (reduit) rolls.forEach(r => roule(r, +r.dataset.v, false));
  else {
    rolls.forEach(r => { roule(r, fmt(+r.dataset.v).replace(/\d/g, '0'), false); r.dataset.attend = 1; });
    const ior = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const r = e.target; ior.unobserve(r); delete r.dataset.attend; setTimeout(() => roule(r, +r.dataset.v, true), 250); } }), { threshold: .6 });
    rolls.forEach(r => ior.observe(r));
  }
  const prix = (el, v) => { el.dataset.v = v; el.setAttribute('aria-label', fmt(v)); if (!el.dataset.attend) roule(el, v, true); };

  /* cartes d'accueil : inclinaison légère au pointeur */
  if (!tactile && !reduit) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', ev => { const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height; c.style.setProperty('--ry', ((x - .5) * 3).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 3).toFixed(2) + 'deg'); });
    c.addEventListener('pointerleave', () => ['--rx', '--ry'].forEach(p => c.style.removeProperty(p)));
  });

  /* portes : diaporamas à la même cadence, la fenêtre de l'étiquette recadre la même image */
  const portes = $$('[data-slides]').map((p, n) => {
    const ims = $$('.fd img', p), win = $('.win', p);
    const cl = ims.map(i => { const c = document.createElement('img'); c.alt = ''; if (i.style.objectPosition) { c.style.objectPosition = i.style.objectPosition; c.style.transformOrigin = i.style.objectPosition; } if (i.classList.contains('on')) { c.src = i.getAttribute('src'); c.className = 'on'; } else c.dataset.src = i.dataset.src; win && win.appendChild(c); return c; });
    return { ims, cl, k: 0, n };
  });
  const charge = i => { if (i.dataset.src) { i.src = i.dataset.src; i.removeAttribute('data-src'); } };
  setTimeout(() => portes.forEach(P => { P.ims.forEach(charge); P.cl.forEach(charge); }), 1400);
  if (!reduit && portes.length) setInterval(() => { if (document.hidden) return; portes.forEach(P => setTimeout(() => { [P.ims, P.cl].forEach(L => L[P.k] && L[P.k].classList.remove('on')); P.k = (P.k + 1) % P.ims.length; [P.ims, P.cl].forEach(L => { if (L[P.k]) { charge(L[P.k]); L[P.k].classList.add('on'); } }); }, P.n * 700)); }, 4800);

  /* cartes d'offre : formule choisie, prix et détail */
  const majCarte = c => {
    const b = $('.seg [aria-pressed="true"]', c), r = $('.roll', c); if (!b || !r) return;
    const mois = c.dataset.mois === '1' && b.dataset.m;
    prix(r, +(mois ? b.dataset.m : b.dataset.p));
    const dt = $('[data-dt]', c); if (dt) dt.textContent = b.dataset.t;
    const u = $('[data-u]', c); if (u) u.textContent = mois ? '€ par mois, sur 12 mois' : '€ par an';
    const e = $('[data-est]', c); if (e) e.dataset.est = e.dataset.est.split(':')[0] + ':' + $$('.seg button', c).indexOf(b) + (mois ? ':m' : '');
  };
  $$('[data-of]').forEach(c => {
    $$('.seg button', c).forEach(b => b.addEventListener('click', () => { $$('.seg button', c).forEach(x => x.setAttribute('aria-pressed', String(x === b))); majCarte(c); }));
    const bm = $('.bascule[data-mo]', c);
    if (bm) $$('button', bm).forEach(b => b.addEventListener('click', () => { bm.dataset.v = b.dataset.v; $$('button', bm).forEach(x => x.setAttribute('aria-pressed', String(x === b))); c.dataset.mois = b.dataset.v; majCarte(c); }));
  });
  /* site : avec reportage photo */
  const swPh = $('#swPh');
  if (swPh) swPh.addEventListener('change', () => $$('.of.st').forEach(c => { const r = $('.roll', c); prix(r, +r.dataset.b + (swPh.checked ? 350 : 0)); const e = $('[data-est]', c); e.dataset.est = e.dataset.est.split(':').slice(0, 2).join(':') + (swPh.checked ? ':ph' : ''); }));
  /* application : abonnement ou achat */
  const bAp = $('#bAp');
  if (bAp) $$('button', bAp).forEach(b => b.addEventListener('click', () => {
    const achat = b.dataset.v === '1'; bAp.dataset.v = b.dataset.v; $$('button', bAp).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $$('#gAp .roll').forEach(r => prix(r, +(achat ? r.dataset.ac : r.dataset.ab)));
    $$('#gAp .dt, #nAp').forEach(d => { d.innerHTML = achat ? d.dataset.ac : d.dataset.ab; });
  }));

  /* points sous les carrousels mobiles */
  $$('[data-grp]').forEach(g => {
    const d = g.nextElementSibling; if (!d || !d.classList.contains('dots')) return;
    const n = g.children.length; d.innerHTML = '<i></i>'.repeat(n);
    const maj = () => { const w = g.scrollWidth - g.clientWidth; const k = w > 0 ? Math.round(g.scrollLeft / w * (n - 1)) : 0; $$('i', d).forEach((x, j) => x.classList.toggle('on', j === k)); };
    g.addEventListener('scroll', maj, { passive: true }); maj();
  });

  /* rails : glisser à la souris, flèches, défilement lent tant que personne n'y touche */
  const rails = [];
  const rail = (el, opt = {}) => {
    if (!el) return; const R = { el, pos: el.scrollLeft, attente: 0, vis: false, fin: 0 }; rails.push(R);
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
    new IntersectionObserver(e => { R.vis = e[0].isIntersecting; }, { threshold: .2 }).observe(el);
    R.tiens = tiens; R.auto = opt.auto !== false && !reduit; return R;
  };
  const vitesse = tactile ? 22 : 28; let tP = performance.now();
  const derive = t => {
    const dt = Math.min(64, t - tP); tP = t;
    rails.forEach(R => {
      if (!R.auto || !R.vis || document.hidden || t < R.attente) return;
      const el = R.el, max = el.scrollWidth - el.clientWidth; if (max <= 4) return;
      if (R.pos >= max - 1) { if (!R.fin) R.fin = t; else if (t - R.fin > 2200) { R.fin = 0; el.style.scrollSnapType = ''; el.scrollTo({ left: 0, behavior: 'smooth' }); R.pos = 0; R.attente = t + 2200; } return; }
      if (Math.abs(el.scrollLeft - Math.round(R.pos)) > 2) R.pos = el.scrollLeft;
      el.style.scrollSnapType = 'none'; R.pos = Math.min(max, R.pos + vitesse * dt / 1000); el.scrollLeft = R.pos;
    });
    requestAnimationFrame(derive);
  };
  requestAnimationFrame(derive);
  $$('[data-rail]').forEach(b => b.addEventListener('click', () => { const R = rails.find(x => x.el.id === 'rail'); if (!R) return; R.tiens(8000); R.el.style.scrollSnapType = ''; R.el.scrollBy({ left: Number(b.dataset.rail) * R.el.clientWidth * .75, behavior: 'smooth' }); setTimeout(() => R.pos = R.el.scrollLeft, 700); }));

  /* reportages */
  const K = { scene: 'Concert', public: 'Festival et public', corp: 'Entreprise, collectivité' };
  const FI = [['tout', 'Tout'], ['scene', 'Concerts'], ['public', 'Festivals et public'], ['corp', 'Entreprises et collectivités']];
  const REPS = window.REPS || []; let liste = REPS, vus = new Set(stock.get('es-vus') || []), filtre = 'tout';
  const railR = $('#rail'), chips = $('#chips');
  const BR = ['lf0092', 'ge0091', 'lf0031', 'ge0128', 'lf0157', 'ge0092', 'lf0008']; let brI = 0;
  const carteCas = () => `<a class="rc" href="/projets/fl-auto/"><span class="k">Étude de cas</span><span class="im"><img src="/projets/fl-auto/img/photo-1.webp" alt="" loading="lazy"></span><span class="lab"><b>FL Auto</b><span>Reportage d’entreprise</span><small>Voir le projet ${ico('ne')}</small></span></a>`;
  const carteBR = () => `<button class="rc br" id="brC" aria-label="La retouche : photo suivante"><span class="im"><img src="/b/${BR[brI]}-brut.webp" alt="Photo brute" loading="lazy"><img class="apres" src="/b/${BR[brI]}-retouche.webp" alt="Même photo retouchée" loading="lazy"><i class="lig"></i><span class="lb g">Brut</span><span class="lb d">Retouché</span></span><span class="lab"><b>La retouche</b><span>Brut, puis retouché</span><small>Touchez pour la photo suivante</small></span></button>`;
  const dessine = () => {
    if (!railR) return;
    let h = '';
    liste.forEach((r, i) => {
      if (i === 2 && filtre === 'tout') h += carteBR();
      h += `<button class="rc" data-i="${i}" aria-label="Ouvrir le reportage ${r.t}"><span class="im"><img src="/p/t/${r.ph[0]}.webp" alt="" loading="${i < 5 ? 'eager' : 'lazy'}"></span><span class="lab"><b>${r.t}</b><span>${K[r.k] || ''}</span><small>${vus.has(r.id) ? ico('ok') + 'Vu · ' : ''}${r.ph.length} photos</small></span></button>`;
      if (i === 0 && (filtre === 'corp')) h += carteCas();
    });
    if (filtre === 'tout') h = h.replace(/(<button class="rc" data-i="3")/, carteCas() + '$1');
    railR.innerHTML = h; railR.scrollLeft = 0; const R = rails.find(x => x.el === railR); if (R) { R.pos = 0; R.fin = 0; }
  };
  if (railR) {
    rail(railR);
    FI.forEach(([k, l], i) => {
      const n = k === 'tout' ? REPS.length : REPS.filter(r => r.k === k).length; if (!n) return;
      const b = document.createElement('button'); b.innerHTML = `${l}<small>${n}</small>`; b.setAttribute('aria-pressed', String(!i));
      b.addEventListener('click', () => { $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); filtre = k; liste = k === 'tout' ? REPS : REPS.filter(r => r.k === k); dessine(); });
      chips.appendChild(b);
    });
    dessine();
    railR.addEventListener('click', e => {
      if (railR.moved) { e.preventDefault(); return; }
      const c = e.target.closest('.rc'); if (!c) return;
      if (c.id === 'brC') { brI = (brI + 1) % BR.length; const [a, b] = $$('img', c); a.src = `/b/${BR[brI]}-brut.webp`; b.src = `/b/${BR[brI]}-retouche.webp`; [b, $('.lig', c)].forEach(x => { x.style.animation = 'none'; void x.offsetWidth; x.style.animation = ''; }); return; }
      if (c.dataset.i != null) ouvre(+c.dataset.i);
    });
  }
  rail($('#usages'));

  /* visionneuse de reportages */
  const sv = $('#sv'), img = $('#svImg'), bars = $('#svBars'); let ri = 0, pi = 0, t0 = 0, raf = 0, pause = false, ecoule = 0; const DUREE = 4500;
  const rep = () => liste[ri];
  const montre = () => {
    const r = rep(); img.src = `/p/${r.ph[pi]}.jpg`; img.alt = `${r.t}, photo ${pi + 1} sur ${r.ph.length}`; $('#svAmb').style.backgroundImage = `url(/p/t/${r.ph[pi]}.webp)`;
    $$('i', bars).forEach((b, j) => { b.firstChild.style.width = j < pi ? '100%' : '0'; });
    const n = r.ph[pi + 1]; if (n) { const p = new Image(); p.src = `/p/${n}.jpg`; }
    t0 = performance.now(); ecoule = 0;
  };
  const chargeR = () => {
    const r = rep(); pi = 0; $('#svT').textContent = r.t; $('#svK').textContent = (K[r.k] || '') + ' · ' + r.ph.length + ' photos';
    bars.innerHTML = r.ph.map(() => '<i><b></b></i>').join(''); vus.add(r.id); stock.set('es-vus', [...vus]);
    try { history.replaceState(null, '', '#r=' + r.id); } catch (e) {}
    compte('/reportage/' + r.id, r.t); montre();
  };
  const boucle = t => { if (!sv.classList.contains('on')) return; if (!pause) { const k = Math.min(1, (ecoule + t - t0) / DUREE); const b = bars.children[pi]; if (b) b.firstChild.style.width = (k * 100) + '%'; if (k >= 1) suiv(); } raf = requestAnimationFrame(boucle); };
  const suiv = () => { if (pi < rep().ph.length - 1) { pi++; montre(); } else if (ri < liste.length - 1) { ri++; chargeR(); } else ferme(); };
  const prec = () => { if (pi > 0) { pi--; montre(); } else if (ri > 0) { ri--; chargeR(); } else montre(); };
  const ouvre = i => { if (!sv) return; ri = i; sv.hidden = false; requestAnimationFrame(() => sv.classList.add('on')); document.documentElement.style.overflow = 'hidden'; chargeR(); cancelAnimationFrame(raf); raf = requestAnimationFrame(boucle); $('#svX').focus(); };
  const ferme = () => { sv.classList.remove('on'); cancelAnimationFrame(raf); document.documentElement.style.overflow = ''; setTimeout(() => sv.hidden = true, 350); try { history.replaceState(null, '', location.pathname); } catch (e) {} if (railR) { const x = railR.scrollLeft; dessine(); railR.scrollLeft = x; const R = rails.find(y => y.el === railR); if (R) R.pos = x; } };
  if (sv) {
    $('#svX').addEventListener('click', ferme);
    $('#svN').addEventListener('click', () => { if (!sv.tenu) suiv(); });
    $('#svP').addEventListener('click', () => { if (!sv.tenu) prec(); });
    $('#svNR').addEventListener('click', () => { if (ri < liste.length - 1) { ri++; chargeR(); } else ferme(); });
    $('#svPR').addEventListener('click', () => { if (ri > 0) { ri--; chargeR(); } });
    let ht = 0; const box = $('.box', sv);
    box.addEventListener('pointerdown', () => { sv.tenu = false; ht = setTimeout(() => { pause = true; sv.tenu = true; ecoule += performance.now() - t0; }, 260); });
    const lache = () => { clearTimeout(ht); if (pause) { pause = false; t0 = performance.now(); } };
    box.addEventListener('pointerup', lache); box.addEventListener('pointercancel', lache); box.addEventListener('pointerleave', lache);
    let ty = 0; box.addEventListener('touchstart', e => ty = e.touches[0].clientY, { passive: true }); box.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - ty > 90) ferme(); }, { passive: true });
    addEventListener('keydown', e => { if (!sv.classList.contains('on')) return; if (e.key === 'Escape') ferme(); if (e.key === 'ArrowRight') suiv(); if (e.key === 'ArrowLeft') prec(); });
  }
  const h = location.hash.match(/^#r=([\w-]+)/);
  if (h) { const i = REPS.findIndex(r => r.id === h[1]); if (i >= 0 && sv) { liste = REPS; setTimeout(() => ouvre(i), 300); } else { const go = { soute: '/projets/la-soute/', marelle: '/projets/mjc-la-marelle/' }[h[1]]; if (go) location.replace(go); else { const t = $('#travaux'); if (t) setTimeout(() => t.scrollIntoView(), 200); } } }

  /* feuilles */
  const voile = $('#voile'); let ouverte = null, avant = null;
  const ouvreF = id => { const s = $(id); if (!s) return; if (ouverte && ouverte !== s) { ouverte.classList.remove('on'); ouverte.hidden = true; } avant = document.activeElement; s.hidden = false; requestAnimationFrame(() => requestAnimationFrame(() => { s.classList.add('on'); voile.classList.add('on'); })); ouverte = s; document.documentElement.style.overflow = 'hidden'; if (dock) dock.classList.add('cache'); setTimeout(() => { const f = $('.x', s); if (f) f.focus({ preventScroll: true }); }, 80); };
  const fermeF = () => { if (!ouverte) return; const s = ouverte; s.classList.remove('on'); voile.classList.remove('on'); document.documentElement.style.overflow = ''; if (dock) dock.classList.remove('cache'); setTimeout(() => { if (!s.classList.contains('on')) s.hidden = true; }, 600); ouverte = null; if (avant) avant.focus({ preventScroll: true }); };
  voile.addEventListener('click', fermeF); $$('[data-close]').forEach(b => b.addEventListener('click', fermeF));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) fermeF(); });
  $$('[data-legal]').forEach(b => b.addEventListener('click', () => ouvreF('#shL')));
  $$('[data-msg]').forEach(b => b.addEventListener('click', () => { ouvreF('#shM'); setTimeout(() => $('#ecrire [name=nom]').focus({ preventScroll: true }), 450); }));

  /* envoi par FormSubmit */
  const envoie = async champs => {
    const r = await fetch('https://formsubmit.co/ajax/contact@studioes.fr', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(Object.assign({ _template: 'table', _captcha: 'false' }, champs)) });
    if (!r.ok) throw new Error('envoi'); return r;
  };
  const mailOk = m => /^\S+@\S+\.\S+$/.test(m || '');

  /* estimation : grille du 20 octobre 2026, prix « dès » */
  const PJ = {
    mariage: { l: 'Un mariage', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Formule', o: [['Cérémonie', 1290, 'Moments clés, 4 à 6 h'], ['Journée', 1890, '8 à 10 h sur place'], ['Journée et album', 2590, 'Album imprimé, séance à deux']] }, o: { l: 'Options', o: [['Aperçu de 20 photos le soir même', 150], ['Une heure de plus', 80]] } },
    evenement: { l: 'Un événement', g: 'Photographie', ic: 'ap', date: 1, f: { l: 'Durée', o: [['Concert ou spectacle', 250, '1 h 30 à 2 h'], ['Demi-journée', 350, '4 h sur place'], ['Journée', 550, '8 h sur place'], ['Festival', 550, 'Par jour', 'j']] }, o: { l: 'Options', o: [['Sélection le soir même', 150], ['Une heure de plus', 80]] } },
    annee: { l: 'Un photographe à l’année', g: 'Photographie', ic: 'ca', f: { l: 'Forfait', o: [['4 demi-journées', [1290, 109]], ['8 demi-journées', [2490, 209]], ['12 demi-journées', [3590, 299]]] }, p: { l: 'Paiement', o: [['Par an', 'en une fois'], ['Par mois', 'sur 12 mois']] } },
    site: { l: 'Un site internet', g: 'Web', ic: 'ec', f: { l: 'Formule', o: [['Une page', 990, 'Livrée en 10 jours'], ['3 à 5 pages', 1990, 'Une page par service'], ['Site complet', 4490, 'Arborescence sur mesure'], ['À définir ensemble', null, 'On en parle']] }, o: { l: 'En plus', o: [['Reportage photo du lieu et de l’équipe', 350], ['Réservation ou espace membres', null]] } },
    app: { l: 'Une application', g: 'Web', ic: 'pl', f: { l: 'Projet', o: [['Devis en ligne', [190, 85, 1090]], ['Application web', [390, 150, 2790]], ['Avec automatisations', [790, 250, 5490]], ['Une idée à préciser', null, 'On en parle']] }, p: { l: 'Formule', o: [['Abonnement', 'engagement 18 mois'], ['Achat', 'l’application vous appartient']] } }
  };
  const estB = $('#estB'), estF = $('#estF');
  let ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: {} };
  const calc = () => {
    if (!ES.k) return null; const P = PJ[ES.k], f = P.f.o[ES.f]; let a = 0, m = 0, dv = false, per = ''; const L = [f[0]];
    if (ES.k === 'annee') { if (ES.p) { m = f[1][1]; per = 'par mois, sur 12 mois'; } else { a = f[1][0]; per = 'par an'; } L.push(ES.p ? 'paiement au mois' : 'paiement à l’année'); }
    else if (ES.k === 'app') { if (f[1] == null) dv = true; else if (ES.p) { a = f[1][2]; L.push('à l’achat'); } else { a = f[1][0]; m = f[1][1]; L.push('en abonnement'); } }
    else { if (f[1] == null) dv = true; else a = f[1] * (f[3] === 'j' ? ES.j : 1); if (f[3] === 'j') L[0] += `, ${ES.j} jour${ES.j > 1 ? 's' : ''}`; if (ES.k === 'site' && f[1] != null) m = 35; }
    if (P.o) ES.o.forEach(i => { const o = P.o.o[i]; if (o[1] == null) dv = true; else a += o[1]; L.push(o[0]); });
    return { a, m, dv, per, L };
  };
  const txtEst = r => !r ? '' : (r.a || r.m) ? `dès ${fmt(r.a || r.m)} €${r.a && r.m ? `, puis ${fmt(r.m)} € par mois` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}` : 'sur devis';
  const pied = () => {
    const r = calc();
    const v = r ? ((r.a || r.m) ? `<small>Estimation</small><span class="v"><small style="display:inline;font-size:14px;color:var(--mu)">dès</small><b class="roll" id="estN"></b><i>€${r.a && r.m ? `, puis ${fmt(r.m)} € par mois` : r.per ? ' ' + r.per : ''}${r.dv ? ', plus une partie sur devis' : ''}</i></span>` : `<small>Estimation</small><span class="v"><b>Sur devis</b></span>`) : `<small>Estimation</small><span class="v"><i>Choisissez votre projet</i></span>`;
    const act = ES.e === 0 ? `<a class="bt cl sm" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Préférer un appel</a>`
      : ES.e === 1 ? `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-nav="1">Continuer <span class="ar">${ico('ar')}</span></button>`
      : `<button class="bt cl sm" data-nav="-1">Retour</button><button class="bt sm" data-envoi>Envoyer la demande <span class="ar">${ico('ar')}</span></button>`;
    const ancien = $('#estN'), avantV = ancien ? +ancien.dataset.v : 0;
    estF.innerHTML = ES.e === 3 ? '' : `<div class="tot">${v}</div><div class="act">${act}</div>`;
    const n = $('#estN'); if (n && r) { const cible = r.a || r.m; if (avantV) { roule(n, avantV, false); requestAnimationFrame(() => roule(n, cible, true)); } else roule(n, cible, !reduit); }
  };
  const rendE = () => {
    $$('#estP i').forEach((x, i) => x.classList.toggle('on', i <= Math.min(ES.e, 2)));
    let h = '';
    if (ES.e === 0) {
      ['Photographie', 'Web'].forEach(g => { h += `<div class="q"><p>${g}</p><div class="opts ch">${Object.entries(PJ).filter(([, P]) => P.g === g).map(([k, P]) => `<button data-k="${k}" aria-pressed="${ES.k === k}">${ico(P.ic)}<span>${P.l}</span></button>`).join('')}</div></div>`; });
    } else if (ES.e === 1) {
      const P = PJ[ES.k];
      h += `<div class="q"><p>${P.l}</p></div><div class="q"><p>${P.f.l}</p><div class="opts">${P.f.o.map((o, i) => { const pr = o[1] == null ? 'sur devis' : Array.isArray(o[1]) ? (ES.k === 'app' ? (ES.p ? `dès ${fmt(o[1][2])} €` : `dès ${fmt(o[1][0])} €, puis ${o[1][1]} €/mois`) : (ES.p ? `dès ${o[1][1]} € par mois` : `dès ${fmt(o[1][0])} € par an`)) : `dès ${fmt(o[1])} €`; return `<button data-f="${i}" aria-pressed="${ES.f === i}">${o[0]}<small>${[o[2], pr].filter(Boolean).join(' · ')}</small></button>`; }).join('')}</div></div>`;
      const f = P.f.o[ES.f]; if (f[3] === 'j') h += `<div class="q"><p>Nombre de jours</p><div class="opts" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5].map(j => `<button data-j="${j}" aria-pressed="${ES.j === j}" style="align-items:center">${j}</button>`).join('')}</div></div>`;
      if (P.p) h += `<div class="q"><p>${P.p.l}</p><div class="opts">${P.p.o.map((o, i) => `<button data-p="${i}" aria-pressed="${ES.p === i}">${o[0]}<small>${o[1]}</small></button>`).join('')}</div></div>`;
      if (P.o) h += `<div class="q"><p>${P.o.l} (facultatif)</p><div class="opts">${P.o.o.map((o, i) => `<button data-o="${i}" aria-pressed="${ES.o.includes(i)}">${o[0]}<small>${o[1] == null ? 'sur devis' : '+' + fmt(o[1]) + ' €'}</small></button>`).join('')}</div></div>`;
    } else if (ES.e === 2) {
      const P = PJ[ES.k], r = calc(), c = ES.c;
      h += `<div class="recap"><b>${P.l}</b>${r.L.join(' · ')}<br>Estimation : ${txtEst(r)}</div><div class="form" style="margin-top:16px">
        <label>Nom, structure<input id="eNom" autocomplete="name" value="${(c.nom || '').replace(/"/g, '&quot;')}"></label>
        <label>E-mail<input id="eMail" type="email" autocomplete="email" value="${(c.mail || '').replace(/"/g, '&quot;')}"></label>
        <label>Téléphone, si vous préférez être rappelé<input id="eTel" type="tel" autocomplete="tel" value="${(c.tel || '').replace(/"/g, '&quot;')}"></label>
        ${P.date ? `<label>Date et lieu, même approximatifs<input id="eDate" value="${(c.date || '').replace(/"/g, '&quot;')}"></label>` : ''}
        <label>Précisions<textarea id="eMsg" placeholder="Facultatif">${c.msg || ''}</textarea></label></div>`;
    } else {
      h += `<div class="fini"><span class="ok-i">${ico('ok')}</span><h3>Demande envoyée.</h3><p>Réponse sous 48 h avec un devis détaillé.<br>Pour aller plus vite, un appel de 30 min est possible.</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:22px"><a class="bt" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Réserver un appel <span class="ar">${ico('ne')}</span></a><button class="bt cl" data-close>Fermer</button></div></div>`;
    }
    estB.innerHTML = h; estB.scrollTop = 0; pied();
    $$('[data-close]', estB).forEach(b => b.addEventListener('click', fermeF));
  };
  const garde = () => { const g = id => { const e = $('#' + id); return e ? e.value.trim() : ''; }; if (ES.e === 2) ES.c = { nom: g('eNom'), mail: g('eMail'), tel: g('eTel'), date: g('eDate'), msg: g('eMsg') }; };
  if (estB) {
    estB.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
      if (d.k) { ES.k = d.k; ES.f = 0; ES.o = []; ES.p = 0; ES.j = 1; ES.e = 1; rendE(); compte('/estimation/' + d.k, 'Estimation : ' + PJ[d.k].l); return; }
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
        try { await envoie({ _subject: 'Demande de devis : ' + P.l.toLowerCase(), Projet: P.l, 'Détail': r.L.join(', '), Estimation: txtEst(r), Nom: c.nom, Email: c.mail, 'Téléphone': c.tel, 'Date et lieu': c.date || '', Message: c.msg || '' }); ES.e = 3; rendE(); compte('/estimation/envoyee', 'Demande de devis envoyée'); }
        catch (er) { b.disabled = false; toast('L’envoi a échoué. Écrivez à contact@studioes.fr.'); }
      }
    });
    $$('[data-est]').forEach(b => b.addEventListener('click', () => {
      const [k, f, x] = (b.dataset.est || '').split(':');
      if (ES.e === 3) ES = { e: 0, k: null, f: 0, o: [], p: 0, j: 1, c: ES.c };
      if (k && PJ[k]) { ES.k = k; ES.f = Number(f) || 0; ES.o = []; ES.j = 1; ES.p = k === 'app' ? (bAp && bAp.dataset.v === '1' ? 1 : 0) : (x === 'm' ? 1 : 0); if (k === 'site' && x === 'ph') ES.o = [0]; ES.e = 1; }
      else if (!ES.k) ES.e = 0;
      rendE(); ouvreF('#shE'); compte('/estimation', 'Ouverture de l’estimation');
    }));
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

  /* rendez-vous : agenda Cal.com intégré, calendrier maison en secours */
  const calBox = $('#calEmbed');
  const calSecours = () => {
    if (!calBox || calBox.dataset.fb) return; calBox.dataset.fb = 1; calBox.classList.remove('pret');
    calBox.innerHTML = `<div class="cal-fb"><div class="mo"><b id="moT"></b><div><button class="ic" id="moP" aria-label="Mois précédent">${ico('al')}</button><button class="ic" id="moN" aria-label="Mois suivant">${ico('arr')}</button></div></div><div class="wd" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="days" id="days"></div><div class="go"><p id="calTx">Choisissez un jour<b>&nbsp;</b></p><a class="bt sm" id="calGo" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Voir les créneaux <span class="ar">${ico('ne')}</span></a></div></div>`;
    const auj = new Date(); auj.setHours(0, 0, 0, 0); const C = { y: auj.getFullYear(), m: auj.getMonth(), sel: null };
    const MO = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'], JO = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const p2 = n => String(n).padStart(2, '0'), iso = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`, cap = s => s[0].toUpperCase() + s.slice(1);
    const trace = () => {
      const pr = new Date(C.y, C.m, 1), dec = (pr.getDay() + 6) % 7, nj = new Date(C.y, C.m + 1, 0).getDate();
      $('#moT').textContent = cap(MO[C.m]) + ' ' + C.y;
      $('#moP').disabled = C.y === auj.getFullYear() && C.m === auj.getMonth();
      $('#moN').disabled = (C.y - auj.getFullYear()) * 12 + C.m - auj.getMonth() >= 2;
      let h = '<span></span>'.repeat(dec);
      for (let d = 1; d <= nj; d++) { const dt = new Date(C.y, C.m, d), wd = dt.getDay(); h += `<button data-d="${iso(dt)}" ${dt <= auj || wd === 0 || wd === 6 ? 'disabled' : ''} class="${C.sel === iso(dt) ? 'on' : ''}">${d}</button>`; }
      $('#days').innerHTML = h;
    };
    $('#days').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; C.sel = b.dataset.d; const d = new Date(C.sel + 'T12:00'); $$('#days button').forEach(x => x.classList.toggle('on', x === b)); $('#calTx').innerHTML = `Jour choisi<b>${cap(JO[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()]}</b>`; $('#calGo').href = `https://cal.eu/studioes/30min?month=${C.sel.slice(0, 7)}&date=${C.sel}`; });
    $('#moP').onclick = () => { C.m--; if (C.m < 0) { C.m = 11; C.y--; } trace(); };
    $('#moN').onclick = () => { C.m++; if (C.m > 11) { C.m = 0; C.y++; } trace(); };
    trace();
  };
  const calCharge = () => {
    if (!calBox || calBox.dataset.ld) return; calBox.dataset.ld = 1;
    try {
      (function (C, A, L) { const p = function (a, ar) { a.q.push(ar); }; const d = C.document; C.Cal = C.Cal || function () { const cal = C.Cal; const ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; const s = d.createElement('script'); s.src = A; s.onerror = calSecours; d.head.appendChild(s); cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const ns = ar[1]; api.q = api.q || []; if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; p(cal.ns[ns], ar); p(cal, ['initNamespace', ns]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.eu/embed/embed.js', 'init');
      calBox.innerHTML = ''; calBox.classList.add('pret');
      Cal('init', 'rdv', { origin: 'https://app.cal.eu' });
      Cal.ns.rdv('inline', { elementOrSelector: '#calEmbed', calLink: 'studioes/30min', config: { layout: 'month_view', theme: 'light' } });
      Cal.ns.rdv('ui', { theme: 'light', hideEventTypeDetails: true, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#141414', 'cal-brand-emphasis': '#2a2a2a', 'cal-brand-text': '#ffffff', 'cal-bg': '#F0EEE9', 'cal-bg-muted': '#E5E2DA', 'cal-border': 'rgba(20,20,20,.09)', 'cal-text': '#141414' } } });
      Cal.ns.rdv('on', { action: 'bookingSuccessful', callback: () => compte('/rendez-vous/pris', 'Rendez-vous pris') });
      setTimeout(() => { if (!calBox.querySelector('iframe')) calSecours(); }, 9000);
    } catch (e) { calSecours(); }
  };
  if (calBox) new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); calCharge(); } }, { rootMargin: '600px 0px' }).observe(calBox);
})();

/* anciens ancrages */
(() => { const H = location.hash;
  if (H === '#mentions') { const b = document.querySelector('[data-legal]'); if (b) setTimeout(() => b.click(), 300); return; }
  if (H === '#devis' || H === '#estimer') { const b = document.querySelector('[data-est=""]') || document.querySelector('[data-est]'); if (b) setTimeout(() => b.click(), 300); return; }
  const m = { '#rdv': 'contact', '#offre': 'photographie', '#offres': 'photographie' }[H]; const t = m && document.getElementById(m); if (t) setTimeout(() => t.scrollIntoView(), 200); })();
