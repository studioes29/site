/* Module « Votre site en aperçu » (rubrique des offres web).
   1. nom et ville  2. fiche Google  3. logo facultatif  4. e-mail pendant la préparation  5. l'aperçu dans la page.
   Les couleurs ne se choisissent pas : elles viennent du logo s'il est fourni, sinon de l'activité (côté serveur).
   La préparation démarre quand tout ce qu'il faut est connu (fiche, logo) ; la barre avance pendant la saisie de l'e-mail.
   L'aperçu reste verrouillé côté serveur tant que l'e-mail n'est pas donné. */
(function () {
  'use strict';
  var R = document.getElementById('apercu');
  if (!R) return;
  var FN = 'https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/apercu';
  var $ = function (s) { return R.querySelector(s); };
  var etapes = R.querySelectorAll('.ae-e'), pas = R.querySelectorAll('.ae-pas li');
  var st = { session: '', place: null, prep: null, id: '', pal: null, logo: null, debut: 0 };

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
    var nom = f1.nom.value.trim(), ville = f1.ville.value.trim();
    if (nom.length < 2 || ville.length < 2) { erreur(f1, 'Indiquez le nom et la ville.'); return; }
    erreur(f1, '');
    var b = f1.querySelector('.bt'); b.disabled = true;
    st.session = uid();
    appel({ action: 'chercher', nom: nom, ville: ville, session: st.session })
      .then(function (j) { liste(j.resultats || []); aller(1); })
      .catch(function (e) { erreur(f1, e.message); })
      .then(function () { b.disabled = false; });
  });
  function liste(res) {
    var z = $('#ae-res'); z.textContent = '';
    if (!res.length) {
      z.appendChild(el('p', 'ae-vide', 'Aucune fiche Google ne correspond. Vérifiez l’orthographe du nom et de la ville, ou écrivez-nous : l’aperçu peut aussi se préparer sans fiche.'));
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
    erreur(f3, '');
    aller(2);
  }
  /* logo donné ou non : la préparation part, l'e-mail se saisit pendant ce temps */
  f3.addEventListener('submit', function (ev) {
    ev.preventDefault();
    st.debut = Date.now(); st.id = ''; erreur(f4, '');
    progres(0);
    st.prep = appel({ action: 'preparer', place: st.place.id, session: st.session, nom: f1.nom.value.trim(), ville: f1.ville.value.trim(), palette: st.pal, logo: st.logo, _honey: f1._honey.value })
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
    var fin = function (d) { st.logo = d; var v = $('#ae-logo-v'); v.hidden = false; v.querySelector('img').src = d; couleursLogo(d); };
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
  $('#ae-logo-x').addEventListener('click', function () { st.logo = null; st.pal = null; fl.value = ''; $('#ae-logo-v').hidden = true; });

  /* couleurs tirées du logo : teinte dominante (hors blancs, noirs et gris) ; logo sans couleur : choix laissé au serveur */
  function hsl(h, s, l) {
    var k = function (n) { return (n + h / 30) % 12; }, a = s * Math.min(l, 1 - l);
    var f = function (n) { return Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))); };
    return '#' + [f(0), f(8), f(4)].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }
  function couleursLogo(src) {
    st.pal = null;
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d'); x.drawImage(im, 0, 0, 64, 64);
      var d; try { d = x.getImageData(0, 0, 64, 64).data; } catch (e) { return; }
      var seaux = {}, total = 0;
      for (var i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 160) continue;
        var r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dl = mx - mn;
        if (dl < .08) continue;
        var s = dl / (1 - Math.abs(2 * l - 1));
        if (s < .25 || l < .12 || l > .92) continue;
        var h = mx === r ? ((g - b) / dl + 6) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4; h *= 60;
        var k = Math.floor(h / 15), o = seaux[k] || (seaux[k] = { n: 0, h: 0, s: 0, l: 0 });
        o.n += s; o.h += h * s; o.s += s * s; o.l += l * s; total++;
      }
      if (total < 30) return;
      var m = null; for (var q in seaux) if (!m || seaux[q].n > m.n) m = seaux[q];
      var H = m.h / m.n, S = m.s / m.n, L = m.l / m.n;
      st.pal = { fond: hsl(H, Math.min(.38, S * .5), .09), accent: hsl(H, Math.max(.45, Math.min(.85, S)), Math.max(.58, Math.min(.72, L))), clair: hsl(H, .22, .93) };
    };
    im.src = src;
  }

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
