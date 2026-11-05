/* Aperçu de site Studio ES : construit la page à partir des données de la fonction « apercu ».
   Toutes les chaînes passent par textContent (jamais d'HTML venu des données). */
(function () {
  'use strict';
  var SB = 'https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/apercu';
  var COMMANDE = 'https://studioes.fr/metiers/sites-et-outils/#web';
  var app = document.getElementById('app');
  var q = new URLSearchParams(location.search);

  /* ---------- outils ---------- */
  function h(tag, cls, kids, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false) return;
      e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return e;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, kids) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function em(t) { return h('em', null, t); }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function hex(c) { c = str(c).replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return /^[0-9a-f]{6}$/i.test(c) ? c : null; }
  function rgb(c) { var x = hex(c); return x ? [0, 2, 4].map(function (i) { return parseInt(x.substr(i, 2), 16); }) : null; }
  function toHex(a) { return '#' + a.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return toHex(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
  function lum(c) { var x = rgb(c).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * x[0] + .7152 * x[1] + .0722 * x[2]; }
  var toastT;
  function toast(t) { var e = document.getElementById('toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 3200); }
  function dateFr(iso) { try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } }
  function hash(t) { var x = 2166136261; for (var i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rnd(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function initiales(n) { var m = str(n).replace(/[^A-Za-zÀ-ÿ0-9 '-]/g, ' ').split(/[\s'-]+/).filter(function (w) { return w.length > 1 && !/^(le|la|les|de|du|des|et|l|d|chez|au|aux)$/i.test(w); }); return (m.length > 1 ? m[0][0] + m[1][0] : (m[0] || str(n) || 'S').slice(0, 2)).toUpperCase().replace(/^(.)(.)$/, function (_, a, b) { return a + b.toLowerCase(); }); }

  /* ---------- palette : trois teintes, le reste en découle ---------- */
  function palette(st) {
    var fond = hex(st && st.fond) ? '#' + hex(st.fond) : '#1c0f1f';
    var acc = hex(st && st.accent) ? '#' + hex(st.accent) : '#e68dca';
    var clair = hex(st && st.clair) ? '#' + hex(st.clair) : '#ece6df';
    var r = document.documentElement.style;
    var v = {
      '--ink': fond, '--plum': mix(mix(fond, acc, .09), '#ffffff', .05), '--plum-2': mix(mix(fond, acc, .16), '#ffffff', .08),
      '--pink': acc, '--skin': clair, '--skin-line': mix(clair, fond, .14),
      '--text': mix(clair, '#ffffff', .55), '--muted': mix(mix(clair, acc, .12), fond, .32),
      '--on-skin': mix(fond, clair, .06), '--on-skin-2': mix(fond, clair, .42),
      '--on-pink': lum(acc) > .35 ? fond : '#ffffff'
    };
    for (var k in v) r.setProperty(k, v[k]);
    var m = document.querySelector('meta[name=theme-color]'); if (m) m.content = fond;
  }

  /* ---------- plan dessiné : un quartier inventé, la rue principale jusqu'à la porte ---------- */
  function plan(seed, rue) {
    var R = rnd(seed), W = 1000, H = 900, cx = 520 + R() * 80, cy = 430 + R() * 60;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'plan', preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': 'Plan d’accès' });
    var g = s('g', { class: 'roads' });
    function trace(x0, y0, ang, len, cls) {
      var d = 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1), x = x0, y = y0;
      for (var i = 0; i < 6; i++) { ang += (R() - .5) * .22; x += Math.cos(ang) * len / 7; y += Math.sin(ang) * len / 7; d += ' L' + x.toFixed(1) + ' ' + y.toFixed(1); }
      g.appendChild(s('path', { d: d, class: cls }));
    }
    for (var i = 0; i < 6; i++) trace(60 + i * 160 + (R() - .5) * 90, -60, Math.PI / 2 + (R() - .5) * .35, 1300, i % 3 ? 'r5' : 'r3');
    for (var j = 0; j < 5; j++) trace(-60, 80 + j * 190 + (R() - .5) * 80, (R() - .5) * .3, 1400, j % 3 ? 'r5' : 'r3');
    for (var k = 0; k < 6; k++) trace(R() * W, R() * H, R() * Math.PI * 2, 220, 'r6');
    svg.appendChild(g);
    var a = -.12 + (R() - .5) * .2, x1 = -60, y1 = cy - Math.tan(a) * (cx + 60), mid = (x1 + cx) / 2;
    var main = 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Q' + mid.toFixed(1) + ' ' + (y1 + (cy - y1) / 2 - 24).toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' L' + (cx + 90).toFixed(1) + ' ' + (cy + 18).toFixed(1);
    svg.appendChild(s('path', { d: main, class: 'main', id: 'pm' }));
    if (rue) {
      var tp = s('textPath', { href: '#pm', startOffset: '16%' }, [rue]);
      svg.appendChild(s('text', { class: 'main-l', dy: '-14' }, [tp]));
    }
    var pin = s('g', { class: 'pin', transform: 'translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')' });
    pin.appendChild(s('circle', { class: 'pulse', r: '14' }));
    pin.appendChild(s('circle', { class: 'dot', r: '15' }));
    pin.appendChild(s('circle', { class: 'core', r: '5' }));
    svg.appendChild(pin);
    return svg;
  }

  /* ---------- badge rond : le nom tourne autour des initiales ---------- */
  function badge(site) {
    var u = (str(site.nom) + ' · ' + str(site.ville || site.commune) + ' · ').toUpperCase(), t = '';
    for (var k = Math.max(1, Math.round(56 / u.length)); k > 0; k--) t += u;
    var svg = s('svg', { viewBox: '0 0 400 400', 'aria-hidden': 'true' });
    svg.appendChild(s('defs', {}, [s('path', { id: 'cercle', d: 'M200,200 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0' })]));
    var rot = s('g', { class: 'rot' });
    rot.appendChild(s('text', { textLength: '1000', lengthAdjust: 'spacing' }, [s('textPath', { href: '#cercle' }, [t])]));
    svg.appendChild(rot);
    svg.appendChild(s('circle', { cx: 200, cy: 200, r: 128, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-dasharray': '2 7', opacity: '.7' }));
    svg.appendChild(s('text', { x: 200, y: 238, 'text-anchor': 'middle', class: 'ini' }, [initiales(site.nom)]));
    if (site.activite) svg.appendChild(s('text', { x: 200, y: 290, 'text-anchor': 'middle', class: 'sm' }, [str(site.activite).toUpperCase().slice(0, 22)]));
    return h('div', 'badge', svg);
  }

  /* ---------- quelques pictogrammes pour les cartes sans photo ---------- */
  var MOTIFS = [
    '<circle cx="150" cy="150" r="110" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="150" cy="150" r="72" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/><circle cx="150" cy="40" r="7" fill="currentColor"/><circle cx="260" cy="150" r="7" fill="currentColor"/><circle cx="72" cy="228" r="7" fill="currentColor"/>',
    '<path d="M40 230 C 90 110, 150 80, 260 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M60 260 C 120 160, 190 130, 270 120" fill="none" stroke="currentColor" stroke-width="2" opacity=".5" stroke-linecap="round"/><circle cx="260" cy="60" r="7" fill="currentColor"/><circle cx="40" cy="230" r="7" fill="currentColor"/>'
  ];
  function motif(i) { var x = document.createElementNS(SVGNS, 'svg'); x.setAttribute('viewBox', '0 0 300 300'); x.setAttribute('aria-hidden', 'true'); x.innerHTML = MOTIFS[i % 2]; return x; }

  /* « Du mercredi au samedi : 10h à 12h. Fermé le lundi et le dimanche. » */
  function resumeHoraires(H) {
    var g = [], i = 0, j = function (k) { return JOURS[k].toLowerCase(); };
    while (i < 7) { var k = i; while (k + 1 < 7 && H[k + 1] === H[i]) k++; g.push([i, k, H[i]]); i = k + 1; }
    var ouv = g.filter(function (x) { return x[2]; }).map(function (x) {
      var d = x[0] === x[1] ? 'Le ' + j(x[0]) : x[1] - x[0] === 1 ? 'Le ' + j(x[0]) + ' et le ' + j(x[1]) : 'Du ' + j(x[0]) + ' au ' + j(x[1]);
      return d + ' : ' + x[2] + '.';
    });
    var fer = []; H.forEach(function (x, k) { if (!x) fer.push('le ' + j(k)); });
    if (fer.length) ouv.push('Fermé ' + (fer.length > 1 ? fer.slice(0, -1).join(', ') + ' et ' + fer[fer.length - 1] : fer[0]) + '.');
    return ouv.join(' ');
  }
  var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  /* ---------- la page ---------- */
  function rendre(D) {
    var S = D.site || {}, T = D.textes || {}, ST = D.style || {};
    palette(ST);
    var nom = str(S.nom) || 'Votre établissement';
    document.title = nom + (S.ville ? ', ' + S.ville : '') + ' · Aperçu de site';
    var photos = (S.photos || []).filter(function (p) { return p && p.url; });
    var ph = function (i) { return photos.length ? photos[i % photos.length] : null; };
    var h1 = (T.h1 && T.h1.length ? T.h1 : [S.activite || nom, '', S.ville ? 'à ' + S.ville : '']).map(str);
    var tel = str(S.tel), telAff = str(S.telAffiche) || tel;
    var cta = str(T.cta) || (tel ? 'Nous appeler' : 'Nous écrire');
    var adr = [str(S.adresse), [str(S.cp), str(S.commune || S.ville)].filter(Boolean).join(' ')].filter(Boolean);
    var itin = S.maps || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nom + ' ' + adr.join(' ')));
    var avis = (S.avis || []).filter(function (a) { return str(a.texte).length > 30; }).slice(0, 3);
    var note = Number(S.note) || 0, nbAvis = Number(S.nbAvis) || 0;
    var horaires = Array.isArray(S.horaires) && S.horaires.length === 7 ? S.horaires : null;
    var services = (T.services || []).slice(0, 2);
    var pres = T.presentation || {};
    var frag = document.createDocumentFragment();

    /* bandeau de l'aperçu */
    var exp = D.expire ? dateFr(D.expire) : '';
    frag.appendChild(h('div', 'bar', h('div', 'wrap', [
      h('span', null, 'Aperçu préparé par Studio ES pour ' + nom + (exp ? ', visible jusqu’au ' + exp : '')),
      h('a', null, 'CE SITE POUR 490 €', { href: COMMANDE, target: '_blank', rel: 'noopener' })
    ])));

    /* en-tête */
    var liens = [['#services', 'Services'], photos.length > 2 ? ['#galerie', 'En images'] : null, avis.length ? ['#avis', 'Avis'] : null, ['#questions', 'Questions'], ['#contact', 'Contact']].filter(Boolean);
    var mk = h('span', 'mk', ST.logo ? h('img', null, null, { src: ST.logo, alt: '' }) : initiales(nom));
    frag.appendChild(h('header', 'nav', h('div', 'wrap', [
      h('a', 'brand', [mk, h('span', null, nom)], { href: '#top', 'aria-label': nom + ', haut de page' }),
      h('ul', null, liens.map(function (l) { return h('li', null, h('a', 'ulink', l[1], { href: l[0] })); })),
      h('a', 'btn btn-line nav-cta', h('span', null, cta), { href: '#contact' }),
      h('button', 'burger', [h('i'), h('i')], { type: 'button', 'aria-label': 'Ouvrir le menu', 'data-menu': '' })
    ])));
    frag.appendChild(h('nav', 'menu', [
      h('button', 'close', '✕', { type: 'button', 'aria-label': 'Fermer le menu', 'data-menu': '' }),
      h('ul', null, liens.map(function (l) { return h('li', null, h('a', null, l[1], { href: l[0], 'data-ferme': '' })); }))
    ], { 'aria-label': 'Menu' }));

    var main = h('main', null, null, { id: 'top' });

    /* bannière */
    var hero = h('section', 'hero', null, { 'aria-label': 'Accueil' });
    hero.appendChild(h('div', 'ph', ph(0) ? h('img', null, null, { src: ph(0).url, alt: '', fetchpriority: 'high' }) : null, { 'aria-hidden': 'true' }));
    var gauche = h('div', null, [
      h('h1', Math.max.apply(null, h1.map(function (x) { return Math.max.apply(null, x.split(/\s+/).map(function (w) { return w.length; })); })) > 9 ? 'long' : null, [
        h1[0] ? h('span', 'l', h('span', null, h1[0])) : null,
        h1[1] ? h('span', 'l', h('span', null, h1[1])) : null,
        h1[2] ? h('span', 'l', h('span', null, em(h1[2]))) : null,
        h('span', 'sr', ', ' + nom)
      ]),
      T.sous ? h('p', 'sub', str(T.sous)) : null,
      h('div', 'cta', [
        h('a', 'btn btn-pink', [h('span', null, cta), h('span', 'arr', '→')], { href: tel ? 'tel:' + tel : '#contact' }),
        h('a', 'btn btn-line', h('span', null, 'Nous trouver'), { href: '#contact' })
      ]),
      note >= 4 && nbAvis >= 5 ? h('a', 'stars', [h('span', 'etoiles', '★★★★★'), h('b', null, note.toFixed(1).replace('.', ',')), h('span', null, nbAvis + ' avis Google')], { href: '#avis', style: 'text-decoration:none' }) : null
    ]);
    var droite = ST.logo ? h('div', 'badge', h('div', 'logo', h('img', null, null, { src: ST.logo, alt: 'Logo ' + nom }))) : badge(S);
    hero.appendChild(h('div', 'wrap', [gauche, droite]));
    main.appendChild(hero);

    /* bande défilante */
    var mots = (T.ruban && T.ruban.length ? T.ruban : [S.activite, S.ville, nom, 'Bienvenue']).map(str).filter(Boolean);
    var track = h('div', 'track');
    for (var r = 0; r < 4; r++) mots.forEach(function (m) { track.appendChild(h('span', null, m)); track.appendChild(h('i', null, '✦')); });
    main.appendChild(h('div', 'ribbon-wrap', h('div', 'ribbon', track), { 'aria-hidden': 'true' }));

    /* services */
    if (services.length) {
      main.appendChild(h('section', 'band skin', h('div', 'wrap', [
        h('div', 'head reveal', [h('h2', 'title', [str(T.servicesTitre && T.servicesTitre[0]) || 'Ce que nous', ' ', em(str(T.servicesTitre && T.servicesTitre[1]) || 'faisons pour vous')]), T.servicesLead ? h('p', 'lead', str(T.servicesLead)) : null]),
        h('div', 'duo', services.map(function (sv, i) {
          var p = ph(i + 1);
          return h('a', 'metier reveal', [
            h('span', 'bg', p && photos.length > 1 ? h('img', null, null, { src: p.url, alt: '', loading: 'lazy' }) : motif(i)),
            sv.tag ? h('span', 'tag', str(sv.tag)) : null,
            h('h3', null, [str(sv.titre) + ' ', em(str(sv.it))]),
            h('p', null, str(sv.texte)),
            h('span', 'go', [str(sv.cta) || 'Nous contacter', ' ', h('span', null, '→')])
          ], { href: '#contact', style: '--i:' + i });
        }))
      ]), { id: 'services', 'aria-labelledby': 't-s' }));
    }

    /* galerie */
    if (photos.length > 2) {
      var gal = h('div', 'gallery reveal');
      var large = photos.length >= 5, nG = large ? 5 : 3;
      photos.slice(0, nG).forEach(function (p, i) {
        var f = h('button', 'shot' + (i === 0 && large ? ' wide' : ''), h('img', null, null, { src: p.url, alt: 'Photo ' + (i + 1) + ' de ' + nom, loading: 'lazy' }), { type: 'button', 'data-i': i });
        gal.appendChild(f);
      });
      main.appendChild(h('section', 'band', h('div', 'wrap', [
        h('div', 'head reveal', [h('h2', 'title', [str(T.galerieTitre && T.galerieTitre[0]) || 'Quelques', ' ', em(str(T.galerieTitre && T.galerieTitre[1]) || 'images')])]),
        gal,
        h('p', 'gal-foot', 'Photos publiées sur la fiche Google de l’établissement.')
      ]), { id: 'galerie' }));
    }

    /* présentation */
    var grand = pres.grand || (note >= 4 && nbAvis >= 5 ? [note.toFixed(1).replace('.', ','), '/5'] : null);
    main.appendChild(h('section', 'band skin', h('div', 'wrap studio', [
      h('figure', 'reveal', [ph(photos.length > 3 ? 3 : 1) ? h('img', null, null, { src: ph(photos.length > 3 ? 3 : 1).url, alt: '', loading: 'lazy' }) : h('span', 'bg', motif(0), { style: 'display:grid;place-items:center;height:100%;color:var(--pink)' }), pres.legende ? h('figcaption', null, str(pres.legende)) : null]),
      h('div', 'reveal', [
        grand ? h('p', 'years', [str(grand[0]), ' ', em(str(grand[1]))]) : h('h2', 'title', [str(pres.titre && pres.titre[0]) || nom, ' ', em(str(pres.titre && pres.titre[1]))]),
        (str(pres.sous && pres.sous[0]) || str(pres.sous && pres.sous[1]) || grand) ? h('p', 'years-sub', [str(pres.sous && pres.sous[0]) || (grand && nbAvis ? 'd’après ' + nbAvis + ' avis Google,' : ''), ' ', em(str(pres.sous && pres.sous[1]))]) : null,
        (pres.faits || []).length ? h('dl', 'facts', pres.faits.slice(0, 3).map(function (f) { return h('div', null, [h('dt', null, str(f.t)), h('dd', null, str(f.d))]); })) : null
      ])
    ]), { 'aria-label': 'Présentation' }));

    /* avis */
    if (avis.length) {
      main.appendChild(h('section', 'band plum', h('div', 'wrap', [
        h('div', 'avis-h reveal', [
          note ? h('p', 'note', [note.toFixed(1).replace('.', ','), h('small', null, '/5')]) : null,
          h('div', null, [h('h2', 'title', ['Ils en ', em('parlent')]), h('p', 'lead', [nbAvis ? nbAvis + ' avis sur Google. ' : '', 'Quelques extraits, tels qu’ils ont été publiés.'])])
        ]),
        h('div', 'avis', avis.map(function (a, i) {
          var t = str(a.texte); if (t.length > 330) t = t.slice(0, 320).replace(/\s+\S*$/, '') + '…';
          return h('figure', 'av reveal', [h('p', null, t), h('footer', null, [h('b', null, str(a.auteur)), h('span', 'etoiles', '★★★★★'.slice(0, Math.max(1, Math.round(a.note || 5))))])], { style: 'margin:0;transition-delay:' + (i * 80) + 'ms' });
        }))
      ]), { id: 'avis' }));
    }

    /* questions : rédigées à partir des seules informations connues */
    var faq = [];
    if (horaires) faq.push(['Quels sont vos horaires ?', resumeHoraires(horaires)]);
    if (adr.length) faq.push(['Où vous trouver ?', nom + ' vous accueille ' + adr.join(', ') + '. L’itinéraire s’ouvre depuis le bas de cette page.']);
    faq.push(['Comment nous joindre ?', tel ? 'Par téléphone au ' + telAff + ', ou par le formulaire de cette page : la réponse arrive par e-mail.' : 'Par le formulaire de cette page : la réponse arrive par e-mail.']);
    (T.faq || []).slice(0, 2).forEach(function (x) { if (x && x.q && x.a) faq.push([str(x.q), str(x.a)]); });
    main.appendChild(h('section', 'band skin', h('div', 'wrap faq', [
      h('div', 'faq-side reveal', [h('h2', 'title', ['Vos ', em('questions')]), h('p', 'lead', 'L’essentiel avant de venir.')]),
      h('div', 'reveal', faq.map(function (x, i) { var d = h('details', 'qa', [h('summary', null, [x[0], h('i')]), h('div', 'a', x[1])]); if (!i) d.open = true; return d; }))
    ]), { id: 'questions' }));

    /* écrire */
    var form = h('form', 'form reveal', [
      h('div', 'row2', [h('label', null, ['Nom', h('input', null, null, { name: 'nom', autocomplete: 'name' })]), h('label', null, ['E-mail', h('input', null, null, { name: 'email', type: 'email', autocomplete: 'email' })])]),
      h('label', null, ['Votre message', h('textarea', null, null, { name: 'message' })]),
      h('button', 'btn btn-pink', [h('span', null, 'Envoyer'), h('span', 'arr', '→')], { type: 'submit' })
    ], { novalidate: '' });
    form.addEventListener('submit', function (e) { e.preventDefault(); toast('Dans l’aperçu, le formulaire n’envoie rien. Il sera relié à votre boîte mail.'); });
    main.appendChild(h('section', 'band plum', h('div', 'wrap ecrire', [
      h('div', 'reveal', [h('h2', 'title', ['Nous ', em('écrire')]), h('p', 'lead', 'Une question, une demande de rendez-vous ou de devis : le message arrive directement par e-mail.')]),
      form
    ]), { id: 'ecrire' }));

    frag.appendChild(main);

    /* pied de page */
    var rue = str(S.adresse).replace(/^\d+[a-z]?(\s*(bis|ter))?,?\s*/i, '');
    var mapEl = h('div', 'f-map reveal', [plan(hash(str(D.id) + nom), rue.length < 34 ? rue : ''), h('div', 'tag', [h('b', null, nom), adr.join(', ')])]);
    var appel = T.appel && T.appel.length ? T.appel : ['Passer', 'nous voir'];
    var hrs = horaires ? h('div', 'hours', horaires.map(function (x, i) { var auj = (new Date().getDay() + 6) % 7 === i; return h('div', (x ? '' : 'off') + (auj ? ' today' : ''), [h('span', null, JOURS[i]), h('span', null, x || 'Fermé')]); })) : h('p', 'lead', 'Horaires à préciser.');
    frag.appendChild(h('footer', 'pied', [
      h('div', 'f-top', [mapEl, h('div', 'f-call', [
        h('h2', null, [str(appel[0]) + ' ', em(str(appel[1]))]),
        adr.length ? h('p', 'addr', adr.map(function (l, i) { return i ? [h('br'), l] : l; }).flat()) : null,
        h('div', 'row', [h('a', 'btn btn-pink', [h('span', null, 'Itinéraire'), h('span', 'arr', '↗')], { href: itin, target: '_blank', rel: 'noopener' }), tel ? h('a', 'btn btn-line', h('span', null, telAff), { href: 'tel:' + tel }) : null])
      ])]),
      h('div', 'wrap f-grid', [
        h('div', null, [h('h3', null, 'Horaires'), hrs]),
        h('div', null, [h('h3', null, 'Contact'), h('div', 'f-list', [tel ? h('a', 'tel ulink', telAff, { href: 'tel:' + tel }) : null, h('a', 'ulink', 'Écrire un message', { href: '#ecrire' })])]),
        h('div', null, [h('h3', null, 'En ligne'), h('div', 'f-list', [h('a', 'ulink', 'Fiche Google', { href: itin, target: '_blank', rel: 'noopener' }), S.web ? h('a', 'ulink', 'Site actuel', { href: S.web, target: '_blank', rel: 'noopener nofollow' }) : null])])
      ]),
      h('div', 'wrap f-bottom', [
        h('span', null, '© ' + new Date().getFullYear() + ' ' + nom),
        h('span', null, 'Avis et photos : Google'),
        h('span', null, ['Site réalisé par ', h('a', 'ulink', 'Studio ES', { href: 'https://studioes.fr', target: '_blank', rel: 'noopener' })])
      ])
    ], { id: 'contact' }));

    /* carte Studio ES */
    var es = h('aside', 'es', [
      h('p', null, [h('b', null, 'Ce site peut être en ligne sous 10 jours.'), h('span', null, '490 €, en une fois ou en 6 ou 12 mensualités.')]),
      h('a', null, ['Le commander', ' →'], { href: COMMANDE, target: '_blank', rel: 'noopener' }),
      h('button', null, '✕', { type: 'button', 'aria-label': 'Masquer' })
    ], { 'aria-label': 'Studio ES' });
    frag.appendChild(es);

    /* visionneuse */
    var lb = h('div', 'lb', [h('img', null, null, { alt: '' }), h('div', 'bar2', [h('p'), h('div', null, [h('button', null, '←', { type: 'button', 'aria-label': 'Précédente', 'data-d': '-1' }), h('button', null, '→', { type: 'button', 'aria-label': 'Suivante', 'data-d': '1' }), h('button', null, '✕', { type: 'button', 'aria-label': 'Fermer', 'data-x': '' })])])], { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Photo' });
    frag.appendChild(lb);

    app.replaceWith(frag);
    brancher(photos, lb, es);
  }

  function brancher(photos, lb, es) {
    var root = document.documentElement;
    document.querySelectorAll('[data-menu]').forEach(function (b) { b.addEventListener('click', function () { root.classList.toggle('menu-open'); }); });
    document.querySelectorAll('[data-ferme]').forEach(function (a) { a.addEventListener('click', function () { root.classList.remove('menu-open'); }); });
    var cur = 0, im = lb.querySelector('img'), cap = lb.querySelector('p');
    function voir(i) { cur = (i + photos.length) % photos.length; im.src = photos[cur].url; cap.textContent = photos[cur].credit ? 'Photo : ' + photos[cur].credit + ', via Google' : 'Photo via Google'; lb.classList.add('on'); }
    document.querySelectorAll('.shot').forEach(function (b) { b.addEventListener('click', function () { voir(+b.dataset.i); }); });
    lb.addEventListener('click', function (e) { var t = e.target.closest('button'); if (t && t.dataset.d) voir(cur + +t.dataset.d); else if ((t && 'x' in t.dataset) || e.target === lb) lb.classList.remove('on'); });
    document.addEventListener('keydown', function (e) { if (!lb.classList.contains('on')) return; if (e.key === 'Escape') lb.classList.remove('on'); if (e.key === 'ArrowRight') voir(cur + 1); if (e.key === 'ArrowLeft') voir(cur - 1); });
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' }) : null;
    document.querySelectorAll('.reveal').forEach(function (e) { io ? io.observe(e) : e.classList.add('in'); });
    var ferme = false;
    es.querySelector('button').addEventListener('click', function () { ferme = true; es.classList.remove('on'); });
    var tick = false;
    addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () { tick = false; if (!ferme) es.classList.toggle('on', scrollY > innerHeight * .9); });
    }, { passive: true });
  }

  function etat(titre, it, texte, lien) {
    app.innerHTML = '';
    app.appendChild(h('div', 'etat', h('div', null, [h('h1', null, [titre, em(it)]), h('p', null, texte), lien ? h('a', null, lien[0], { href: lien[1] }) : null])));
  }

  /* ---------- chargement ---------- */
  var id = q.get('a');
  if (q.has('demo') || !id) {
    fetch('demo.json').then(function (r) { return r.json(); }).then(rendre).catch(function () { etat('Aperçu', 'introuvable', 'Ce lien ne correspond à aucun aperçu.', ['Créer un aperçu', '/apercu/']); });
    return;
  }
  fetch(SB + '?a=' + encodeURIComponent(id)).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j, st: r.status }; }); }).then(function (x) {
    if (x.ok && x.j && x.j.site) return rendre(x.j);
    if (x.st === 410) return etat('Cet aperçu', 'a expiré', 'Les aperçus restent visibles trente jours. Le site, lui, peut toujours être réalisé : il suffit d’en parler.', ['Contacter Studio ES', 'https://studioes.fr/#contact']);
    etat('Aperçu', 'introuvable', 'Ce lien ne correspond à aucun aperçu. Vérifiez qu’il est complet.', ['Créer un aperçu', '/apercu/']);
  }).catch(function () { etat('Connexion', 'interrompue', 'L’aperçu n’a pas pu être chargé. Réessayez dans un instant.', ['Recharger', location.href]); });
})();
