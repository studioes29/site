/* Studio ES 2027 : interactions du site */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tactile = matchMedia('(hover: none)').matches;
  const NB = ' ', fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const stock = { get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const compte = (p, t) => { try { if (window.goatcounter && goatcounter.count) goatcounter.count({ path: p, title: t || p, event: true }); } catch (e) {} };
  const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => e.classList.remove('on'), 3200); };

  /* en-tête et dock : verre au défilement, sombres au-dessus des sections sombres */
  const hd = $('#hd'), dock = $('#dock'), sombres = $$('[data-dark]');
  const etat = () => {
    hd.classList.toggle('on', scrollY > 12);
    const surH = sombres.some(s => { const r = s.getBoundingClientRect(); return r.top < 34 && r.bottom > 34; });
    const surD = sombres.some(s => { const r = s.getBoundingClientRect(); return r.top < innerHeight - 40 && r.bottom > innerHeight - 40; });
    hd.classList.toggle('dk', surH); dock.classList.toggle('dk', surD);
  };
  addEventListener('scroll', etat, { passive: true }); etat();

  /* apparition au défilement */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .08 });
  $$('.rv').forEach(e => io.observe(e));

  /* cartes : légère inclinaison et reflet qui suivent le pointeur */
  if (!tactile && !reduit) $$('[data-tilt]').forEach(c => {
    c.addEventListener('pointermove', ev => {
      const r = c.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      c.style.setProperty('--ry', ((x - .5) * 4).toFixed(2) + 'deg'); c.style.setProperty('--rx', ((.5 - y) * 4).toFixed(2) + 'deg');
      c.style.setProperty('--mx', (x * 100) + '%'); c.style.setProperty('--my', (y * 100) + '%');
      c.style.setProperty('--px', ((x - .5) * 18).toFixed(1) + 'px'); c.style.setProperty('--py', ((y - .5) * 18).toFixed(1) + 'px');
    });
    c.addEventListener('pointerleave', () => ['--rx', '--ry', '--px', '--py'].forEach(p => c.style.removeProperty(p)));
  });

  /* porte photo : diaporama */
  const fd = $('#phFd');
  if (fd) {
    const ims = $$('img', fd); let k = 0;
    const charge = i => { if (i.dataset.src) { i.src = i.dataset.src; i.removeAttribute('data-src'); } };
    setTimeout(() => ims.forEach(charge), 1200);
    if (!reduit) setInterval(() => { if (document.hidden) return; ims[k].classList.remove('on'); k = (k + 1) % ims.length; charge(ims[k]); ims[k].classList.add('on'); }, 4800);
  }

  /* bascules : par an / par mois, abonnement / achat */
  const anime = (el, de, a, suf) => {
    if (reduit || de === a) { el.textContent = suf(a); return; }
    const t0 = performance.now(); const pas = t => { const k = Math.min(1, (t - t0) / 550), v = Math.round(de + (a - de) * (1 - Math.pow(1 - k, 3))); el.textContent = suf(v); if (k < 1) requestAnimationFrame(pas); }; requestAnimationFrame(pas);
  };
  const bascule = (id, f) => { const b = $(id); if (!b) return; $$('button', b).forEach(x => x.addEventListener('click', () => { const v = x.dataset.v; b.dataset.v = v; $$('button', b).forEach(y => y.setAttribute('aria-pressed', String(y === x))); f(v === '1'); })); };
  bascule('#bAn', mois => {
    const c = $('#forfait');
    $$('[data-an]', c).forEach(el => { const de = Number(el.dataset.cur || el.dataset.an), a = Number(mois ? el.dataset.mo : el.dataset.an); el.dataset.cur = a; const gros = el.tagName === 'B' && el.parentNode.classList.contains('px'); anime(el, de, a, v => gros ? fmt(v) : 'dès ' + fmt(v) + ' €' + (mois ? ' /mois' : '')); });
    $('[data-u]', c).textContent = mois ? '€ par mois, 12 mois' : '€ par an';
  });
  bascule('#bAp', achat => { $$('#lAp b').forEach(b => { b.innerHTML = achat ? b.dataset.ac : b.dataset.ab; }); const n = $('#nAp'); n.innerHTML = achat ? n.dataset.ac : n.dataset.ab; });

  /* portfolio : filtres et rail */
  const K = { scene: 'Concert', public: 'Festival', corp: 'Entreprise, collectivité' };
  const FI = [['tout', 'Tout'], ['scene', 'Concerts'], ['public', 'Festivals et public'], ['corp', 'Entreprises et collectivités']];
  const REPS = window.REPS || []; let liste = REPS, vus = new Set(stock.get('es-vus') || []);
  const rail = $('#rail') || document.createElement('div'), chips = $('#chips') || document.createElement('div');
  const dessine = () => {
    rail.innerHTML = '';
    liste.forEach((r, i) => {
      const b = document.createElement('button'); b.className = 'rc' + (vus.has(r.id) ? ' vu' : ''); b.setAttribute('aria-label', 'Ouvrir le reportage ' + r.t);
      b.innerHTML = `<img src="/p/t/${r.ph[0]}.webp" alt="" loading="${i < 4 ? 'eager' : 'lazy'}"><span class="k">${K[r.k] || ''}</span><span class="ct"><span><b>${r.t}</b><small>${r.ph.length} photos</small></span><span class="pl"><svg class="i"><use href="#arr"/></svg></span></span>`;
      b.addEventListener('click', () => { if (!rail.moved) ouvre(i); });
      rail.appendChild(b);
    });
    rail.scrollLeft = 0;
  };
  FI.forEach(([k, l], i) => {
    const n = k === 'tout' ? REPS.length : REPS.filter(r => r.k === k).length; if (!n) return;
    const b = document.createElement('button'); b.innerHTML = `${l}<small>${n}</small>`; b.setAttribute('aria-pressed', String(!i));
    b.addEventListener('click', () => { $$('button', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b))); liste = k === 'tout' ? REPS : REPS.filter(r => r.k === k); dessine(); });
    chips.appendChild(b);
  });
  dessine();
  /* glisser à la souris */
  if (!tactile) { let x0 = 0, s0 = 0, bas = false;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; bas = true; rail.moved = false; x0 = e.clientX; s0 = rail.scrollLeft; });
    addEventListener('pointermove', e => { if (!bas) return; const d = e.clientX - x0; if (Math.abs(d) > 5) { rail.moved = true; rail.classList.add('drag'); } rail.scrollLeft = s0 - d; });
    addEventListener('pointerup', () => { if (!bas) return; bas = false; rail.classList.remove('drag'); setTimeout(() => rail.moved = false, 30); });
  }

  /* visionneuse de reportages */
  const sv = $('#sv'), img = $('#svImg'), bars = $('#svBars'); let ri = 0, pi = 0, t0 = 0, raf = 0, pause = false, ecoule = 0; const DUREE = 4500;
  const rep = () => liste[ri];
  const montre = () => {
    const r = rep(), src = `/p/${r.ph[pi]}.jpg`; img.src = src; img.alt = `${r.t}, photo ${pi + 1} sur ${r.ph.length}`; $('#svAmb').style.backgroundImage = `url(/p/t/${r.ph[pi]}.webp)`;
    $$('i', bars).forEach((b, j) => { b.firstChild.style.width = j < pi ? '100%' : '0'; });
    const n = r.ph[pi + 1]; if (n) { const p = new Image(); p.src = `/p/${n}.jpg`; }
    t0 = performance.now(); ecoule = 0;
  };
  const charge = () => {
    const r = rep(); pi = 0; $('#svT').textContent = r.t; $('#svK').textContent = (K[r.k] || '') + ' · ' + r.ph.length + ' photos';
    bars.innerHTML = r.ph.map(() => '<i><b></b></i>').join(''); vus.add(r.id); stock.set('es-vus', [...vus]);
    try { history.replaceState(null, '', '#r=' + r.id); } catch (e) {}
    compte('/reportage/' + r.id, r.t); montre();
  };
  const boucle = t => { if (!sv.classList.contains('on')) return; if (!pause) { const k = Math.min(1, (ecoule + t - t0) / DUREE); const b = bars.children[pi]; if (b) b.firstChild.style.width = (k * 100) + '%'; if (k >= 1) { suiv(); } } raf = requestAnimationFrame(boucle); };
  const suiv = () => { if (pi < rep().ph.length - 1) { pi++; montre(); } else if (ri < liste.length - 1) { ri++; charge(); } else ferme(); };
  const prec = () => { if (pi > 0) { pi--; montre(); } else if (ri > 0) { ri--; charge(); } else montre(); };
  const ouvre = i => { ri = i; sv.hidden = false; requestAnimationFrame(() => sv.classList.add('on')); document.documentElement.style.overflow = 'hidden'; charge(); cancelAnimationFrame(raf); raf = requestAnimationFrame(boucle); $('#svX').focus(); };
  const ferme = () => { sv.classList.remove('on'); cancelAnimationFrame(raf); document.documentElement.style.overflow = ''; setTimeout(() => sv.hidden = true, 350); try { history.replaceState(null, '', location.pathname); } catch (e) {} dessineVus(); };
  const dessineVus = () => $$('.rc', rail).forEach((b, i) => b.classList.toggle('vu', vus.has(liste[i] && liste[i].id)));
  $('#svX').addEventListener('click', ferme);
  $('#svN').addEventListener('click', () => { if (!sv.tenu) suiv(); });
  $('#svP').addEventListener('click', () => { if (!sv.tenu) prec(); });
  $('#svNR').addEventListener('click', () => { if (ri < liste.length - 1) { ri++; charge(); } else ferme(); });
  $('#svPR').addEventListener('click', () => { if (ri > 0) { ri--; charge(); } });
  let ht = 0; const box = $('.box', sv);
  box.addEventListener('pointerdown', () => { sv.tenu = false; ht = setTimeout(() => { pause = true; sv.tenu = true; ecoule += performance.now() - t0; }, 260); });
  const lache = () => { clearTimeout(ht); if (pause) { pause = false; t0 = performance.now(); } };
  box.addEventListener('pointerup', lache); box.addEventListener('pointercancel', lache); box.addEventListener('pointerleave', lache);
  let ty = 0; box.addEventListener('touchstart', e => ty = e.touches[0].clientY, { passive: true }); box.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - ty > 90) ferme(); }, { passive: true });
  addEventListener('keydown', e => { if (!sv.classList.contains('on')) return; if (e.key === 'Escape') ferme(); if (e.key === 'ArrowRight') suiv(); if (e.key === 'ArrowLeft') prec(); });
  const h = location.hash.match(/^#r=([\w-]+)/); if (h) { const i = REPS.findIndex(r => r.id === h[1]); if (i >= 0) { liste = REPS; setTimeout(() => ouvre(i), 300); } else { const go = { soute: '/projets/la-soute/', marelle: '/projets/mjc-la-marelle/' }[h[1]]; if (go) location.replace(go); else { const t = document.getElementById('travaux'); if (t) setTimeout(() => t.scrollIntoView(), 200); } } }

  /* brut et retouché */
  const cmp = $('#cmp');
  if (cmp) {
    const P = ['lf0092', 'ge0091', 'lf0031', 'ge0128', 'lf0157', 'ge0092', 'lf0008']; let c = 0;
    const pose = e => { const r = cmp.getBoundingClientRect(); cmp.style.setProperty('--x', Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)) + '%'); };
    let actif = false;
    cmp.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; actif = true; pose(e); });
    addEventListener('pointermove', e => { if (actif) pose(e); }); addEventListener('pointerup', () => actif = false);
    if (!tactile) cmp.addEventListener('pointermove', e => { if (!actif && !e.target.closest('button')) pose(e); });
    $('#cmpN').addEventListener('click', () => { c = (c + 1) % P.length; $('#cmpA').src = `/b/${P[c]}-brut.webp`; $('#cmpB').src = `/b/${P[c]}-retouche.webp`; cmp.style.setProperty('--x', '50%'); });
  }

  /* feuilles */
  const voile = $('#voile'); let ouverte = null, avant = null;
  const ouvreF = id => { const s = $(id); avant = document.activeElement; s.hidden = false; requestAnimationFrame(() => { s.classList.add('on'); voile.classList.add('on'); }); ouverte = s; document.documentElement.style.overflow = 'hidden'; setTimeout(() => { const f = $('button,a', s); if (f) f.focus(); }, 60); };
  const fermeF = () => { if (!ouverte) return; const s = ouverte; s.classList.remove('on'); voile.classList.remove('on'); document.documentElement.style.overflow = ''; setTimeout(() => s.hidden = true, 500); ouverte = null; if (avant) avant.focus(); };
  voile.addEventListener('click', fermeF); $$('[data-close]').forEach(b => b.addEventListener('click', fermeF));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) fermeF(); });
  $$('[data-legal]').forEach(b => b.addEventListener('click', () => ouvreF('#shL')));

  /* estimation : grille du 20 octobre 2026, prix « dès » */
  const E = {
    ph: { l: 'Photographie', s: {
      mariage: { l: 'Un mariage', q: [{ id: 'f', l: 'Formule', o: [['Cérémonie', 1290, 'moments clés, 4 à 6 h'], ['Journée', 1890, '8 à 10 h'], ['Journée et album', 2590, 'album, séance à deux']] }, { id: 'o', l: 'Options', m: 1, o: [['Aperçu de 20 photos le soir même', 150], ['Une heure de plus', 80]] }] },
      evenement: { l: 'Un événement', q: [{ id: 'f', l: 'Durée', o: [['Concert ou spectacle', 250, '1 h 30 à 2 h'], ['Demi-journée', 350, '4 h'], ['Journée', 550, '8 h'], ['Festival, 2 jours', 1100, '550 € par jour']] }, { id: 'o', l: 'Options', m: 1, o: [['Sélection le soir même', 150], ['Une heure de plus', 80]] }] },
      annee: { l: 'Un photographe toute l’année', q: [{ id: 'f', l: 'Forfait', o: [['4 demi-journées', [1290, 109]], ['8 demi-journées', [2490, 209]], ['12 demi-journées', [3590, 299]]] }, { id: 'p', l: 'Paiement', o: [['Par an', 0], ['Par mois', 1, '12 mois']] }] } } },
    web: { l: 'Web', s: {
      site: { l: 'Un site internet', q: [{ id: 'f', l: 'Formule', o: [['Une page', 990], ['3 à 5 pages', 1990], ['Site complet', 4490], ['À définir ensemble', null]] }, { id: 'o', l: 'En plus', m: 1, o: [['Reportage photo du lieu et de l’équipe', 350], ['Réservation, espace membres', null]] }] },
      app: { l: 'Une application', q: [{ id: 'f', l: 'Projet', o: [['Devis en ligne', [190, 85, 1090]], ['Application web', [390, 150, 2790]], ['Avec automatisations', [790, 250, 5490]], ['Une automatisation', [550, 0, 550]], ['Autre idée', null]] }, { id: 'p', l: 'Formule', o: [['Abonnement', 0, 'engagement 18 mois'], ['Achat', 1]] }] } } }
  };
  let ES = { d: null, s: null, c: {} };
  const estB = $('#estB'); if (!estB) return;
  const calcule = () => {
    if (!ES.d || !ES.s) return null; const S = E[ES.d].s[ES.s]; let a = 0, m = 0, dv = false; const L = [];
    const f = S.q[0].o[ES.c.f]; if (!f) return null;
    if (ES.s === 'annee') { const mo = ES.c.p === 1; if (mo) m = f[1][1]; else a = f[1][0]; L.push('Forfait : ' + f[0] + (mo ? ', au mois' : ', à l’année')); }
    else if (ES.s === 'app') { if (f[1] == null) dv = true; else { const ach = ES.c.p === 1 || !f[1][1]; if (ach) a = f[1][2]; else { a = f[1][0]; m = f[1][1]; } L.push('Projet : ' + f[0] + (ach ? ', à l’achat' : ', en abonnement')); } }
    else { if (f[1] == null) dv = true; else a += f[1]; L.push(S.q[0].l + ' : ' + f[0]); }
    if (ES.s === 'site' && f[1] != null) m = 35;
    const q2 = S.q[1]; if (q2 && q2.m) (ES.c.o || []).forEach(i => { const o = q2.o[i]; if (o[1] == null) dv = true; else a += o[1]; L.push(q2.l + ' : ' + o[0]); });
    return { a, m, dv, L };
  };
  const rendE = () => {
    let h = `<div class="q"><p>Pour quoi&nbsp;?</p><div class="opts">${Object.entries(E).map(([k, d]) => `<button data-d="${k}" aria-pressed="${ES.d === k}">${d.l}</button>`).join('')}</div></div>`;
    if (ES.d) h += `<div class="q"><p>Votre besoin</p><div class="opts">${Object.entries(E[ES.d].s).map(([k, s]) => `<button data-s="${k}" aria-pressed="${ES.s === k}">${s.l}</button>`).join('')}</div></div>`;
    if (ES.s) E[ES.d].s[ES.s].q.forEach(q => {
      h += `<div class="q"><p>${q.l}${q.m ? ' (facultatif)' : ''}</p><div class="opts">${q.o.map((o, i) => { const on = q.m ? (ES.c[q.id] || []).includes(i) : ES.c[q.id] === i; const pr = Array.isArray(o[1]) ? '' : o[1] == null ? 'sur devis' : (q.id === 'p' ? '' : 'dès ' + fmt(o[1]) + ' €'); const sm = [o[2], pr].filter(Boolean).join(' · '); return `<button data-q="${q.id}" data-i="${i}" data-m="${q.m ? 1 : 0}" aria-pressed="${on}">${o[0]}${sm ? `<small>${sm}</small>` : ''}</button>`; }).join('')}</div></div>`;
    });
    const r = calcule();
    h += `<div class="res"><div class="v"><small>Estimation</small>${r ? (r.a || r.m ? `<b>dès ${fmt(r.a || r.m)} €</b> <i>${r.a && r.m ? `puis ${fmt(r.m)} € par mois` : !r.a && r.m ? 'par mois' : ''}${r.dv ? ', plus une partie sur devis' : ''}</i>` : '<b>Sur devis</b>') : '<b>…</b> <i>Choisissez votre besoin</i>'}</div><div style="display:flex;gap:8px;flex-wrap:wrap"><a class="bt cl sm" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Un appel</a><button class="bt sm" id="estGo" ${r ? '' : 'disabled'}>Recevoir un devis <span class="ar"><svg class="i"><use href="#ar"/></svg></span></button></div></div>`;
    estB.innerHTML = h;
  };
  estB.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.d) { ES = { d: b.dataset.d, s: null, c: {} }; }
    else if (b.dataset.s) { ES.s = b.dataset.s; ES.c = { f: 0, p: 0, o: [] }; }
    else if (b.dataset.q) { const i = Number(b.dataset.i); if (b.dataset.m === '1') { const a = ES.c[b.dataset.q] || []; ES.c[b.dataset.q] = a.includes(i) ? a.filter(x => x !== i) : [...a, i]; } else ES.c[b.dataset.q] = i; }
    else if (b.id === 'estGo') { const r = calcule(); if (!r) return; const S = E[ES.d].s[ES.s]; $('#msg').value = `${S.l}\n${r.L.join('\n')}\nEstimation : ${r.a ? 'dès ' + fmt(r.a) + ' €' : ''}${r.m ? (r.a ? ' puis ' : 'dès ') + fmt(r.m) + ' € par mois' : ''}${r.dv ? ', plus une partie sur devis' : ''}\n\nDate, lieu et précisions : `; compte('/estimation/' + ES.s, 'Estimation envoyée au formulaire'); fermeF(); setTimeout(() => { $('#ecrire').scrollIntoView({ behavior: reduit ? 'auto' : 'smooth' }); setTimeout(() => $('[name=nom]').focus({ preventScroll: true }), 700); }, 350); return; }
    else return;
    const y = estB.scrollTop; rendE(); estB.scrollTop = y;
  });
  $$('[data-est]').forEach(b => b.addEventListener('click', () => { const v = b.dataset.est; if (v) { const [d, s] = v.split(':'); ES = { d, s, c: { f: 0, p: 0, o: [] } }; } rendE(); ouvreF('#shE'); compte('/estimation', 'Ouverture de l’estimation'); }));

  /* formulaire */
  const form = $('#ecrire');
  if (form) form.addEventListener('submit', async e => {
    e.preventDefault(); const d = Object.fromEntries(new FormData(form)); if (d._honey) return;
    if (!d.nom || !d.email || !/^\S+@\S+\.\S+$/.test(d.email) || !d.message) { toast('Il manque votre nom, un e-mail valide ou votre message.'); return; }
    const bt = $('button[type=submit]', form); bt.disabled = true;
    try {
      const r = await fetch('https://formsubmit.co/ajax/contact@studioes.fr', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ _subject: 'Nouvelle demande depuis studioes.fr', _template: 'table', _captcha: 'false', Nom: d.nom, Email: d.email, 'Téléphone': d.tel || '', Message: d.message }) });
      if (!r.ok) throw 0; form.reset(); toast('Message envoyé. Réponse sous 48 h.'); compte('/contact/envoye', 'Message envoyé');
    } catch (er) { toast('L’envoi a échoué. Écrivez à contact@studioes.fr.'); }
    bt.disabled = false;
  });
})();

/* anciens ancrages */
(() => { const H = location.hash;
  if (H === '#mentions') { const b = document.querySelector('[data-legal]'); if (b) setTimeout(() => b.click(), 300); return; }
  if (H === '#devis' || H === '#estimer') { const b = document.querySelector('[data-est=""]') || document.querySelector('[data-est]'); if (b) setTimeout(() => b.click(), 300); return; }
  const m = { '#rdv': 'contact', '#offre': 'photographie', '#offres': 'photographie' }[H]; const t = m && document.getElementById(m); if (t) setTimeout(() => t.scrollIntoView(), 200); })();
