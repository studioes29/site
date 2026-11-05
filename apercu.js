/* Module « Votre site en aperçu » (rubrique des offres web).
   1. nom, activité, ville  2. fiche Google  3. couleurs et logo  4. e-mail pendant la préparation  5. l'aperçu dans la page.
   La préparation démarre quand tout ce qu'il faut est connu (fiche, couleurs, logo) ; la barre avance pendant la saisie de l'e-mail.
   L'aperçu reste verrouillé côté serveur tant que l'e-mail n'est pas donné. */
(function () {
  'use strict';
  var R = document.getElementById('apercu');
  if (!R) return;
  var FN = 'https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/apercu';
  var $ = function (s) { return R.querySelector(s); };
  var etapes = R.querySelectorAll('.ae-e'), pas = R.querySelectorAll('.ae-pas li');
  var st = { session: '', place: null, prep: null, id: '', pal: null, logo: null, debut: 0 };

  /* mêmes familles de couleurs que la fonction */
  var P = function (nom, fond, accent, clair) { return { nom: nom, fond: fond, accent: accent, clair: clair }; };
  var FAM = [
    [/restau|bistro|brasserie|cr[eê]p|pizz|caf[eé]|\bbar\b|traiteur|boulang|p[aâ]tiss|cuisine|snack|burger|glac|food|cave|vin|[ée]picerie|chocolat|fromag|boucher|poissonn/i,
      [P('Bordeaux', '#1f0f10', '#f0875a', '#f2eadf'), P('Olive', '#161a10', '#d9c35c', '#eee9da'), P('Nuit', '#101521', '#f2a65a', '#efe9e0')]],
    [/coiff|beaut|esth[eé]t|ongl|spa\b|massage|bien-[eê]tre|barb|tatou|pierc|maquill|institut|soin/i,
      [P('Aubergine', '#1c0f1f', '#e68dca', '#ece6df'), P('Poudre', '#24181b', '#efb3a8', '#f4ece8'), P('Sauge', '#142019', '#b6d6b1', '#edf0e8')]],
    [/garage|m[eé]can|auto|carross|plomb|[ée]lectric|menuis|charpent|ma[cç]on|couvr|peint|carrel|serrur|chauff|b[aâ]timent|paysag|jardin|artisan|[eé]b[eé]nist|r[eé]nov|terrass/i,
      [P('Anthracite', '#141518', '#f2c14e', '#ecebe6'), P('Bleu nuit', '#0f1726', '#7fb0ff', '#e9edf2'), P('Rouille', '#1b1411', '#e07a4f', '#efe7dd')]],
    [/kin[eé]|ost[eé]o|infirm|m[eé]dec|dentist|psych|sophro|pharma|sant[eé]|v[eé]t[eé]rin|di[eé]t|orthophon|podo|naturo|th[eé]rap|cabinet|avocat|notaire|comptab|conseil|assurance|immobili/i,
      [P('Marine', '#0f1a24', '#8cc7c2', '#eef1ef'), P('Ardoise', '#161a1f', '#b6a6ff', '#eceae6'), P('Forêt', '#102018', '#9fd8a8', '#ebeee6')]]
  ];
  var DEF = [P('Aubergine', '#1c0f1f', '#e68dca', '#ece6df'), P('Forêt', '#102018', '#9fd8a8', '#ebeee6'), P('Nuit', '#101521', '#f2a65a', '#efe9e0')];
  function palettes(a) { for (var i = 0; i < FAM.length; i++) if (FAM[i][0].test(a)) return FAM[i][1]; return DEF; }

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)); }
  function appel(corps) {
    return fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.erreur || 'Erreur ' + r.status); e.j = j; e.statut = r.status; throw e; } return j; }); });
  }
  function aller(n) {
    etapes.forEach(function (e, i) { e.classList.toggle('on', i === n); });
    pas.forEach(function (p, i) { p.classList.toggle('on', i === Math.min(n, 3)); p.classList.toggle('ok', i < Math.min(n, 4)); });
    var f = etapes[n] && etapes[n].querySelector('input:not([type=file]):not([tabindex="-1"]),button');
    if (f && n && innerWidth > 860) setTimeout(function () { f.focus({ preventScroll: true }); }, 320);
  }
  function erreur(zone, t) { var z = zone.querySelector('.ae-err'); if (!z) { z = el('p', 'ae-err'); zone.appendChild(z); } z.textContent = t; z.hidden = !t; }

  /* ---------- 1. recherche de la fiche ---------- */
  var f1 = $('#ae-f1');
  f1.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nom = f1.nom.value.trim(), act = f1.activite.value.trim(), ville = f1.ville.value.trim();
    if (nom.length < 2 || ville.length < 2) { erreur(f1, 'Indiquez le nom de l’établissement et sa ville.'); return; }
    erreur(f1, '');
    var b = f1.querySelector('.bt'); b.disabled = true;
    st.session = uid();
    appel({ action: 'chercher', q: nom + ' ' + ville, session: st.session })
      .then(function (j) { return j.resultats && j.resultats.length ? j : appel({ action: 'chercher', q: nom + ' ' + act + ' ' + ville, session: st.session }); })
      .then(function (j) { liste(j.resultats || []); aller(1); })
      .catch(function (e) { erreur(f1, e.message); })
      .then(function () { b.disabled = false; });
  });
  function liste(res) {
    var z = $('#ae-res'); z.textContent = '';
    if (!res.length) {
      z.appendChild(el('p', 'ae-vide', 'Aucune fiche Google ne correspond. Vérifiez le nom et la ville, ou écrivez-nous : l’aperçu peut aussi se préparer sans fiche.'));
      return;
    }
    res.forEach(function (r) {
      var b = el('button'); b.type = 'button';
      b.appendChild(el('span', 'pin', (r.nom || '?').trim().charAt(0).toUpperCase()));
      var t = el('span'); t.appendChild(el('b', null, r.nom)); t.appendChild(el('small', null, r.lieu)); b.appendChild(t);
      b.appendChild(el('span', 'fl', '→'));
      b.addEventListener('click', function () { choisir(r); });
      z.appendChild(b);
    });
  }
  R.querySelectorAll('[data-ret]').forEach(function (b) { b.addEventListener('click', function () { aller(+b.dataset.ret); }); });

  /* ---------- 2. la fiche choisie : la préparation démarre ---------- */
  var f3 = $('#ae-f3'), f4 = $('#ae-f4');
  function choisir(r) {
    st.place = r; st.id = '';
    $('#ae-nom').textContent = r.nom;
    var act = f1.activite.value.trim();
    var pals = palettes(act + ' ' + r.nom);
    st.pal = pals[0];
    var z = $('#ae-pal'); z.textContent = '';
    pals.forEach(function (p, i) {
      var b = el('button'); b.type = 'button'; b.setAttribute('aria-pressed', i ? 'false' : 'true');
      var sw = el('span', 'ae-sw'); [p.fond, p.accent, p.clair].forEach(function (c) { var x = el('i'); x.style.background = c; sw.appendChild(x); });
      b.appendChild(sw); b.appendChild(document.createTextNode(p.nom));
      b.addEventListener('click', function () { st.pal = p; z.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); });
      z.appendChild(b);
    });
    erreur(f3, '');
    aller(2);
  }
  /* couleurs et logo choisis : la préparation part, l'e-mail se saisit pendant ce temps */
  f3.addEventListener('submit', function (ev) {
    ev.preventDefault();
    st.debut = Date.now(); st.id = ''; erreur(f4, '');
    progres(0);
    st.prep = appel({ action: 'preparer', place: st.place.id, session: st.session, nom: f1.nom.value.trim(), activite: f1.activite.value.trim(), ville: f1.ville.value.trim(), palette: st.pal, logo: st.logo, _honey: f1._honey.value })
      .then(function (j) { st.id = j.id; progres(1); return j; });
    st.prep.catch(function (e) { progres(-1); erreur(f4, e.message); });
    aller(3);
  });
  var ETAPES = ['Lecture de votre fiche Google', 'Récupération de vos photos', 'Rédaction des textes', 'Mise en page'];
  var minuteur;
  function progres(fin) {
    var p = $('#ae-prog'), lab = p.querySelector('b'), pc = p.querySelector('span'), bar = p.querySelector('.bar');
    clearInterval(minuteur);
    p.classList.toggle('fini', fin === 1);
    if (fin === 1) { lab.textContent = 'Votre aperçu est prêt'; pc.textContent = '100 %'; bar.style.setProperty('--p', 1); return; }
    if (fin === -1) { lab.textContent = 'La préparation a échoué'; pc.textContent = ''; return; }
    var tic = function () {
      var t = (Date.now() - st.debut) / 1000, v = Math.min(.94, 1 - Math.exp(-t / 8));
      lab.textContent = ETAPES[t < 3 ? 0 : t < 8 ? 1 : t < 15 ? 2 : 3] + '…';
      pc.textContent = Math.round(v * 100) + ' %'; bar.style.setProperty('--p', v.toFixed(3));
    };
    tic(); minuteur = setInterval(tic, 400);
  }

  /* logo facultatif : réduit à 600 px avant l'envoi */
  var fl = $('#ae-logo');
  fl.addEventListener('change', function () {
    var f = fl.files && fl.files[0]; if (!f) return;
    var fin = function (d) { st.logo = d; var v = $('#ae-logo-v'); v.hidden = false; v.querySelector('img').src = d; };
    if (f.size > 8e6) { erreur(f3, 'Ce fichier est trop lourd (8 Mo au plus).'); return; }
    var lr = new FileReader();
    lr.onload = function () {
      if (f.type === 'image/svg+xml') { if (f.size < 1.4e6) fin(lr.result); return; }
      var im = new Image();
      im.onload = function () {
        var k = Math.min(1, 600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        fin(c.toDataURL('image/png'));
      };
      im.src = lr.result;
    };
    lr.readAsDataURL(f);
  });
  $('#ae-logo-x').addEventListener('click', function () { st.logo = null; fl.value = ''; $('#ae-logo-v').hidden = true; });

  /* ---------- 3. l'e-mail débloque l'aperçu ---------- */
  f4.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var email = f4.email.value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) { erreur(f4, 'Vérifiez votre adresse e-mail.'); f4.email.focus(); return; }
    erreur(f4, '');
    var b = f4.querySelector('.bt'); b.disabled = true; b.firstChild.textContent = 'Encore un instant… ';
    st.prep.then(function () {
      return appel({ action: 'debloquer', id: st.id, email: email });
    }).then(function (j) { afficher(j.url, email); })
      .catch(function (e) { erreur(f4, e.message); })
      .then(function () { b.disabled = false; b.firstChild.textContent = 'Voir mon aperçu '; });
  });

  /* ---------- 4. l'aperçu dans la page ---------- */
  function afficher(url, email) {
    var c = $('.ae-c'), v = $('#ae-v');
    v.querySelector('iframe').src = url;
    v.querySelector('.bb em').textContent = (st.place && st.place.nom ? st.place.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '') : 'votre-site') + '.fr';
    v.querySelector('[data-ouvrir]').href = url;
    $('#ae-mail').textContent = email;
    R.classList.add('vu'); c.classList.add('vu');
    aller(4);
    if (window.goatcounter && goatcounter.count) try { goatcounter.count({ path: 'apercu-genere', event: true }); } catch (e) { /* mesure facultative */ }
    R.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
})();
