/* Moteur d'aperçu de site Studio ES (formule Essentiel).
   Une base exigeante, cinq directions qui changent selon l'activité (composition, typographies, modules),
   chacune avec deux variantes tirées de l'identifiant de l'aperçu.
     atelier  : tatouage, coiffure, beauté, bien-être (sombre, badge tournant, ruban, galerie)
     table    : restauration, boulangerie, commerces de bouche (clair, carte de la semaine, statut d'ouverture)
     chantier : artisans, garages, bâtiment (condensé, frise des horaires, demande en trois questions)
     cabinet  : santé, professions libérales (calme, prise de rendez-vous par jour, avant de venir)
     vitrine  : boutiques et autres (affirmé, mosaïque, avis qui défilent)
   ApercuMoteur.rendre(element, donnees, { variante, commande }) ; toutes les chaînes passent par textContent.
   La mise en page répond à la largeur du conteneur (container queries), pas de l'écran. */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  var JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  /* ---------- outils ---------- */
  function h(tag, cls, kids, attrs) {
    // h(tag, cls, attrs, kids) et h(tag, attrs, kids) sont aussi acceptés
    if (cls && typeof cls === 'object' && !Array.isArray(cls)) { attrs = cls; cls = null; }
    if (kids && typeof kids === 'object' && !Array.isArray(kids) && !(kids instanceof Node)) { var t = kids; kids = attrs; attrs = t; }
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) if (attrs[k] != null && attrs[k] !== false) e.setAttribute(k, attrs[k]);
    (Array.isArray(kids) ? kids : [kids]).forEach(function (c) {
      if (c == null || c === false || c === '') return;
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null) e.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
      else e.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    });
    return e;
  }
  function s(tag, attrs, kids) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); (kids || []).forEach(function (c) { e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); }); return e; }
  function em(t) { return t ? h('em', null, t) : null; }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function hex(c) { c = str(c).replace('#', ''); if (c.length === 3) c = c.replace(/./g, '$&$&'); return /^[0-9a-f]{6}$/i.test(c) ? c : null; }
  function rgb(c) { var x = hex(c) || '000000'; return [0, 2, 4].map(function (i) { return parseInt(x.substr(i, 2), 16); }); }
  function toHex(a) { return '#' + a.map(function (v) { return Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0'); }).join(''); }
  function mix(a, b, t) { var x = rgb(a), y = rgb(b); return toHex(x.map(function (v, i) { return v + (y[i] - v) * t; })); }
  function lum(c) { var x = rgb(c).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * x[0] + .7152 * x[1] + .0722 * x[2]; }
  function hash(t) { var x = 2166136261; t = String(t); for (var i = 0; i < t.length; i++) { x ^= t.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rnd(seed) { return function () { seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function initiales(n) { var m = str(n).replace(/[^A-Za-zÀ-ÿ0-9 '-]/g, ' ').split(/[\s'-]+/).filter(function (w) { return w.length > 1 && !/^(le|la|les|de|du|des|et|l|d|chez|au|aux|cabinet|maison)$/i.test(w); }); var r = m.length > 1 ? m[0][0] + m[1][0] : (m[0] || str(n) || 'S').slice(0, 2); return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase(); }
  function dateFr(iso) { try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }); } catch (e) { return ''; } }
  function noteFr(n) { return Number(n).toFixed(1).replace('.', ','); }
  function etoiles(n) { var x = Math.max(1, Math.min(5, Math.round(n || 5))); return '★★★★★'.slice(0, x) + '☆☆☆☆☆'.slice(0, 5 - x); }

  /* ---------- horaires ---------- */
  // « 10h à 12h, 14h30 à 18h » devient [[600,720],[870,1080]]
  function plages(t) {
    if (!t) return [];
    if (/24/.test(t)) return [[0, 1440]];
    var r = [], re = /(\d{1,2})h(\d{2})?\s*à\s*(\d{1,2})h(\d{2})?/g, m;
    while ((m = re.exec(t))) { var a = +m[1] * 60 + (+m[2] || 0), b = +m[3] * 60 + (+m[4] || 0); if (b <= a) b += 1440; r.push([a, b]); }
    return r;
  }
  function hm(min) { min = min % 1440; var hh = Math.floor(min / 60), mm = min % 60; return hh + 'h' + (mm ? String(mm).padStart(2, '0') : ''); }
  function statut(H) {
    if (!H) return null;
    var now = new Date(), j = (now.getDay() + 6) % 7, m = now.getHours() * 60 + now.getMinutes();
    var auj = plages(H[j]);
    for (var i = 0; i < auj.length; i++) if (m >= auj[i][0] && m < auj[i][1]) return { ouvert: true, texte: 'Ouvert jusqu’à ' + hm(auj[i][1]) };
    for (var k = 0; k < 7; k++) {
      var jj = (j + k) % 7, p = plages(H[jj]).filter(function (x) { return k || x[0] > m; });
      if (p.length) return { ouvert: false, texte: 'Fermé, ouvre ' + (k === 0 ? 'à ' : k === 1 ? 'demain à ' : JOURS[jj].toLowerCase() + ' à ') + hm(p[0][0]) };
    }
    return { ouvert: false, texte: 'Fermé' };
  }
  function resumeHoraires(H) {
    var g = [], i = 0, j = function (k) { return JOURS[k].toLowerCase(); };
    while (i < 7) { var k = i; while (k + 1 < 7 && H[k + 1] === H[i]) k++; g.push([i, k, H[i]]); i = k + 1; }
    var o = g.filter(function (x) { return x[2]; }).map(function (x) { return (x[0] === x[1] ? 'Le ' + j(x[0]) : x[1] - x[0] === 1 ? 'Le ' + j(x[0]) + ' et le ' + j(x[1]) : 'Du ' + j(x[0]) + ' au ' + j(x[1])) + ' : ' + x[2] + '.'; });
    var f = []; H.forEach(function (x, k) { if (!x) f.push('le ' + j(k)); });
    if (f.length) o.push('Fermé ' + (f.length > 1 ? f.slice(0, -1).join(', ') + ' et ' + f[f.length - 1] : f[0]) + '.');
    return o.join(' ');
  }

  /* ---------- plan dessiné : un quartier inventé, la rue jusqu'à la porte ---------- */
  function plan(seed, rue, cls) {
    var R = rnd(seed), W = 1000, H = 760, cx = 540 + R() * 60, cy = 380 + R() * 50;
    var svg = s('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'plan ' + (cls || ''), preserveAspectRatio: 'xMidYMid slice', role: 'img', 'aria-label': 'Plan d’accès' });
    var g = s('g', { class: 'rues' });
    function trace(x0, y0, ang, len, c) { var d = 'M' + x0.toFixed(0) + ' ' + y0.toFixed(0), x = x0, y = y0; for (var i = 0; i < 6; i++) { ang += (R() - .5) * .2; x += Math.cos(ang) * len / 6; y += Math.sin(ang) * len / 6; d += ' L' + x.toFixed(0) + ' ' + y.toFixed(0); } g.appendChild(s('path', { d: d, class: c })); }
    for (var i = 0; i < 6; i++) trace(60 + i * 170 + (R() - .5) * 80, -60, Math.PI / 2 + (R() - .5) * .3, 1000, i % 3 ? 'r2' : 'r1');
    for (var j = 0; j < 5; j++) trace(-60, 60 + j * 160 + (R() - .5) * 60, (R() - .5) * .25, 1250, j % 3 ? 'r2' : 'r1');
    for (var k = 0; k < 5; k++) trace(R() * W, R() * H, R() * Math.PI * 2, 200, 'r3');
    svg.appendChild(g);
    var y1 = cy + 70 - R() * 140, main = 'M-60 ' + y1.toFixed(0) + ' Q' + ((cx - 60) / 2).toFixed(0) + ' ' + ((y1 + cy) / 2 - 26).toFixed(0) + ' ' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ' L' + (cx + 80).toFixed(0) + ' ' + (cy + 16).toFixed(0);
    var id = 'pm' + seed;
    svg.appendChild(s('path', { d: main, class: 'rp', id: id }));
    if (rue) svg.appendChild(s('text', { class: 'rl', dy: '-14' }, [s('textPath', { href: '#' + id, startOffset: '18%' }, [rue])]));
    var pin = s('g', { transform: 'translate(' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ')' });
    pin.appendChild(s('circle', { class: 'pp', r: '14' })); pin.appendChild(s('circle', { class: 'pd', r: '15' })); pin.appendChild(s('circle', { class: 'pc', r: '5' }));
    svg.appendChild(pin);
    return svg;
  }

  /* ---------- familles et polices ---------- */
  var FAMILLES = [
    ['table', /restau|bistro|brasserie|cr[eê]p|pizz|caf[eé]|\bbar\b|traiteur|boulang|p[aâ]tiss|cuisine|snack|burger|glac|food|cave|vin|[ée]picerie|chocolat|fromag|boucher|poissonn|torr[eé]f/i],
    ['atelier', /coiff|beaut|esth[eé]t|ongl|spa\b|massage|bien-[eê]tre|barb|tatou|pierc|maquill|institut|soin|yoga|danse|pole/i],
    ['chantier', /garage|m[eé]can|auto|carross|plomb|[ée]lectric|menuis|charpent|ma[cç]on|couvr|peint|carrel|serrur|chauff|b[aâ]timent|paysag|jardin|artisan|[eé]b[eé]nist|r[eé]nov|terrass|ramon|d[eé]pann/i],
    ['cabinet', /kin[eé]|ost[eé]o|infirm|m[eé]dec|dentist|psych|sophro|pharma|sant[eé]|v[eé]t[eé]rin|di[eé]t|orthophon|podo|naturo|th[eé]rap|cabinet|avocat|notaire|comptab|conseil|assurance|immobili|architect/i]
  ];
  function direction(D) { var st = D.style || {}; if (/^(atelier|table|chantier|cabinet|vitrine)$/.test(st.direction)) return st.direction; var a = str(D.activite) + ' ' + str(D.site && D.site.activite) + ' ' + str(D.site && D.site.nom); for (var i = 0; i < FAMILLES.length; i++) if (FAMILLES[i][1].test(a)) return FAMILLES[i][0]; return 'vitrine'; }
  var POLICES = {
    atelier: 'family=Rubik:ital,wght@0,300..800;1,300..800&family=Instrument+Serif:ital@0;1&family=Antonio:wght@500;700',
    table: 'family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..800,50;1,9..144,300..800,50&family=Figtree:wght@400..700',
    chantier: 'family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;600',
    cabinet: 'family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..600&family=Hanken+Grotesk:wght@300..700',
    vitrine: 'family=Unbounded:wght@400..800&family=Manrope:wght@400..700'
  };
  function polices(dir) {
    var id = 'ap-f-' + dir; if (document.getElementById(id)) return;
    var l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?' + POLICES[dir] + '&display=swap'; document.head.appendChild(l);
  }

  /* ---------- couleurs : trois teintes, chaque direction s'en sert à sa façon ---------- */
  function couleurs(el, st) {
    var f = hex(st && st.fond) ? '#' + hex(st.fond) : '#1c0f1f', a = hex(st && st.accent) ? '#' + hex(st.accent) : '#e68dca', c = hex(st && st.clair) ? '#' + hex(st.clair) : '#ece6df';
    var v = {
      '--f': f, '--f2': mix(mix(f, a, .09), '#ffffff', .05), '--f3': mix(mix(f, a, .16), '#ffffff', .1),
      '--a': a, '--a2': mix(a, f, .25), '--on-a': lum(a) > .35 ? f : '#ffffff', '--a-sur-c': lum(a) > .45 ? mix(a, f, .55) : a,
      '--c': c, '--c2': mix(c, '#ffffff', .55), '--c3': mix(c, f, .08), '--ln': mix(c, f, .16),
      '--t': mix(c, '#ffffff', .6), '--tm': mix(mix(c, a, .1), f, .34), '--o': mix(f, c, .05), '--om': mix(f, c, .42)
    };
    for (var k in v) el.style.setProperty(k, v[k]);
  }

  /* ---------- feuille de style, une seule fois ---------- */
  var CSS = [
    /* base commune */
    '.ap{container-type:inline-size;position:relative;isolation:isolate;overflow:clip;background:var(--bg);color:var(--fg);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}',
    '.ap *{box-sizing:border-box}.ap h1,.ap h2,.ap h3,.ap p,.ap figure,.ap ul,.ap ol,.ap dl,.ap dd{margin:0}.ap ul,.ap ol{padding:0;list-style:none}',
    '.ap img{display:block;max-width:100%}.ap a{color:inherit}.ap button{font:inherit;color:inherit;cursor:pointer;background:none;border:0;padding:0}',
    '.ap .w{max-width:1200px;margin-inline:auto;padding-inline:max(18px,4.5cqi)}',
    '.ap .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '.ap h1,.ap h2,.ap h3{text-wrap:balance}.ap p{text-wrap:pretty}',
    '.ap :focus-visible{outline:2px solid var(--a);outline-offset:3px}',
    '.ap .bt{display:inline-flex;align-items:center;gap:10px;min-height:50px;padding:0 24px;border-radius:999px;font-weight:600;text-decoration:none;white-space:nowrap;transition:transform .25s,background .25s,color .25s}',
    '.ap .bt:active{transform:scale(.97)}',
    '.ap .arr{transition:transform .3s}.ap .bt:hover .arr{transform:translateX(4px)}',
    '.ap .plan{position:absolute;inset:0;width:100%;height:100%}.ap .plan .rues path,.ap .plan .rp{fill:none;stroke-linecap:round;stroke-linejoin:round}',
    '.ap .plan .r1{stroke-width:7}.ap .plan .r2{stroke-width:4}.ap .plan .r3{stroke-width:2.5;stroke-dasharray:2 7}.ap .plan .rp{stroke-width:10}.ap .plan .rl{font-weight:600;font-size:22px}',
    '.ap .plan .pp{opacity:.35;transform-box:fill-box;transform-origin:center;animation:ap-pulse 2.2s ease-out infinite}',
    '@keyframes ap-pulse{from{transform:scale(.6);opacity:.55}to{transform:scale(3);opacity:0}}',
    '.ap .toast{position:sticky;z-index:40;bottom:84px;margin:0 auto -48px;width:max-content;max-width:calc(100% - 32px);padding:10px 18px;border-radius:999px;background:var(--fg);color:var(--bg);font-size:.92rem;opacity:0;pointer-events:none;transition:opacity .3s}',
    '.ap .toast.on{opacity:1}',
    /* carte Studio ES, hors du design du site */
    '.ap .es{position:sticky;z-index:50;bottom:14px;display:flex;align-items:center;gap:14px;width:min(560px,calc(100% - 24px));margin:0 auto 14px;padding:10px 10px 10px 18px;border-radius:999px;background:#F0EEE9;color:#141414;box-shadow:0 18px 50px -16px rgba(0,0,0,.5);font:400 14.5px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif}',
    '.ap .es p{flex:1;min-width:0}.ap .es b{display:block;font-weight:600}.ap .es span{color:#65615A}',
    '.ap .es a{flex:none;background:#141414;color:#F0EEE9;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:999px;white-space:nowrap}',
    '@container (max-width:560px){.ap .es{border-radius:22px}.ap .es span{display:none}}',
    '@media (prefers-reduced-motion:reduce){.ap *,.ap *::before{animation:none!important;transition:none!important}}',

    /* ================= ATELIER (Pierceval) ================= */
    '.ap-atelier{--bg:var(--f);--fg:var(--t);font-family:"Rubik",system-ui,sans-serif;font-weight:350}',
    '.ap-atelier em{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.01em}',
    '.ap-atelier .hd{position:absolute;z-index:5;inset:0 0 auto}.ap-atelier .hd .w{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:16px}',
    '.ap-atelier .mq{display:flex;align-items:center;gap:12px;font-weight:700;letter-spacing:-.02em}.ap-atelier .mq i{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:color-mix(in oklab,var(--a) 18%,transparent);color:var(--a);font:italic 1.5rem/1 "Instrument Serif",serif}',
    '.ap-atelier .nv{display:flex;gap:4px}.ap-atelier .nv a{padding:8px 12px;color:var(--tm);text-decoration:none;font-size:.95rem}',
    '.ap-atelier .bt-a{background:var(--a);color:var(--on-a)}.ap-atelier .bt-l{box-shadow:inset 0 0 0 1.5px currentColor}',
    '.ap-atelier .hero{position:relative;overflow:hidden;min-height:min(92vh,880px);display:grid;align-items:center}',
    '.ap-atelier .hero .ph{position:absolute;inset:0;z-index:-2}.ap-atelier .hero .ph img{width:100%;height:100%;object-fit:cover;filter:grayscale(.4) contrast(1.05)}',
    '.ap-atelier .hero::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(100deg,color-mix(in oklab,var(--f) 94%,transparent),color-mix(in oklab,var(--f) 72%,transparent) 50%,color-mix(in oklab,var(--f2) 55%,transparent)),linear-gradient(0deg,var(--f),transparent 40%)}',
    '.ap-atelier .hero .w{display:grid;grid-template-columns:1.2fr .8fr;gap:5cqi;align-items:center;padding-block:150px 110px}',
    '.ap-atelier h1{font-weight:700;letter-spacing:-.045em;line-height:.92;font-size:clamp(3rem,8.6cqi,7.2rem)}.ap-atelier h1.long{font-size:clamp(2.5rem,6.4cqi,5.6rem)}',
    '.ap-atelier h1 span{display:block}.ap-atelier h1 em{color:var(--a);font-size:1.06em}',
    '.ap-atelier .sous{margin-top:24px;max-width:40ch;color:color-mix(in oklab,var(--t) 78%,transparent);font-size:1.1rem}',
    '.ap-atelier .cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px}',
    '.ap-atelier .note-h{display:inline-flex;gap:10px;align-items:baseline;margin-top:24px;color:var(--tm);font-size:.95rem}.ap-atelier .note-h b{font:700 1.3rem "Antonio",sans-serif;color:var(--t)}.ap-atelier .note-h i{color:var(--a);font-style:normal;letter-spacing:2px}',
    '.ap-atelier .badge{display:grid;place-items:center}.ap-atelier .badge svg{width:min(100%,420px);overflow:visible}',
    '.ap-atelier .badge .rot{transform-origin:200px 200px;animation:ap-spin 60s linear infinite}@keyframes ap-spin{to{transform:rotate(360deg)}}',
    '.ap-atelier .badge text{font:700 21px "Antonio",sans-serif;letter-spacing:5px;fill:currentColor}.ap-atelier .badge .ini{font:italic 400 130px "Instrument Serif",serif;letter-spacing:-4px;fill:var(--a)}.ap-atelier .badge .sm{font:600 16px "Rubik",sans-serif;letter-spacing:3px}',
    '.ap-atelier .badge .logo{width:min(80%,340px);aspect-ratio:1;border-radius:50%;background:var(--c);display:grid;place-items:center;box-shadow:0 0 0 10px color-mix(in oklab,var(--t) 8%,transparent)}.ap-atelier .badge .logo img{width:70%;height:70%;object-fit:contain}',
    '.ap-atelier .ruban{position:relative;z-index:2;overflow:hidden;padding-block:18px;margin-block:-18px;background:linear-gradient(180deg,var(--f) 50%,var(--c) 50%)}',
    '.ap-atelier .ruban div{background:var(--a);color:var(--on-a);white-space:nowrap;transform:rotate(-1.2deg);width:110%;margin-left:-5%;overflow:hidden}',
    '.ap-atelier .ruban p{display:inline-flex;gap:28px;padding-block:12px;animation:ap-defile 40s linear infinite;font-size:clamp(1.2rem,2.5cqi,1.8rem);font-weight:700;letter-spacing:-.02em}',
    '.ap-atelier .ruban p span{white-space:nowrap}.ap-atelier .ruban p span:nth-child(4n+3){font:italic 400 1.08em "Instrument Serif",serif}@keyframes ap-defile{to{transform:translateX(-50%)}}',
    '.ap-atelier .bd{padding-block:clamp(72px,11cqi,128px)}.ap-atelier .peau{background:var(--c);color:var(--o)}.ap-atelier .prune{background:var(--f2)}',
    '.ap-atelier h2{font-weight:700;letter-spacing:-.03em;line-height:1;font-size:clamp(2.2rem,5.4cqi,4.2rem);margin-bottom:clamp(28px,4.5cqi,52px)}.ap-atelier h2 em{color:var(--a);font-size:1.08em}.ap-atelier .peau h2 em{color:var(--f3)}',
    '.ap-atelier .duo{display:grid;grid-template-columns:1fr 1fr;gap:18px}',
    '.ap-atelier .met{position:relative;overflow:hidden;border-radius:6px;min-height:500px;display:flex;flex-direction:column;justify-content:flex-end;gap:14px;padding:clamp(22px,3cqi,36px);color:var(--t);text-decoration:none;isolation:isolate;background:var(--f3)}',
    '.ap-atelier .met img{position:absolute;inset:0;z-index:-2;width:100%;height:100%;object-fit:cover;filter:grayscale(.5);transition:transform 1.2s}.ap-atelier .met:hover img{transform:scale(1.06)}',
    '.ap-atelier .met::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 25%,color-mix(in oklab,var(--f) 92%,transparent) 85%)}',
    '.ap-atelier .met h3{font-weight:700;letter-spacing:-.035em;font-size:clamp(2.2rem,4.2cqi,3.3rem);line-height:1}.ap-atelier .met h3 em{color:var(--a)}',
    '.ap-atelier .met .tag{position:absolute;top:20px;left:20px;font-size:.82rem;padding:5px 12px;border-radius:999px;background:color-mix(in oklab,var(--f) 60%,transparent)}',
    '.ap-atelier .met .go{color:var(--a);font-weight:600}.ap-atelier .met svg{position:absolute;z-index:-2;inset:14% 18% auto;width:64%;color:var(--a);opacity:.8}',
    '.ap-atelier .gal{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.ap-atelier .gal button{position:relative;overflow:hidden;border-radius:4px;aspect-ratio:4/5;background:var(--f2)}',
    '.ap-atelier .gal img{width:100%;height:100%;object-fit:cover;filter:grayscale(.85);transition:filter .6s,transform .9s}.ap-atelier .gal button:hover img{filter:none;transform:scale(1.06)}.ap-atelier .gal .large{grid-column:span 2;aspect-ratio:auto}',
    '.ap-atelier .studio{display:grid;grid-template-columns:.95fr 1.05fr;gap:clamp(28px,5cqi,72px);align-items:center}',
    '.ap-atelier .studio figure{position:relative;aspect-ratio:4/5;overflow:hidden;border-radius:4px;background:var(--f2)}.ap-atelier .studio figure img{width:100%;height:100%;object-fit:cover}',
    '.ap-atelier .studio figcaption{position:absolute;left:14px;bottom:12px;font:italic 1.2rem "Instrument Serif",serif;color:var(--c)}',
    '.ap-atelier .gros{font-weight:700;letter-spacing:-.05em;line-height:.85;font-size:clamp(4rem,11cqi,8.6rem);color:var(--f2)}.ap-atelier .gros em{color:var(--f3)}',
    '.ap-atelier .faits{display:grid;margin-top:28px}.ap-atelier .faits div{display:grid;grid-template-columns:130px 1fr;gap:16px;padding:16px 0;border-top:1px solid var(--ln)}.ap-atelier .faits dt{font-weight:600}.ap-atelier .faits dd{color:var(--om)}',
    '.ap-atelier .avis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.ap-atelier .av{position:relative;background:var(--f);border-radius:6px;padding:26px 24px 22px;display:grid;gap:14px;align-content:space-between}',
    '.ap-atelier .av::before{content:"\\201C";position:absolute;right:16px;top:-8px;font:6rem/1 "Instrument Serif",serif;color:color-mix(in oklab,var(--a) 28%,transparent)}.ap-atelier .av footer{display:flex;justify-content:space-between;gap:10px;font-size:.88rem;color:var(--tm)}.ap-atelier .av footer b{color:var(--t)}.ap-atelier .av footer i{color:var(--a);font-style:normal}',
    '.ap-atelier .notebig{font:700 clamp(5rem,13cqi,9rem)/.8 "Antonio",sans-serif;color:var(--a)}.ap-atelier .notebig small{font-size:.3em;color:var(--tm)}.ap-atelier .avh{display:flex;flex-wrap:wrap;gap:20px 48px;align-items:end;margin-bottom:40px}.ap-atelier .avh h2{margin:0}',
    '.ap-atelier .bas{display:grid;grid-template-columns:1.1fr .9fr;border-top:1px solid color-mix(in oklab,var(--a) 22%,transparent)}.ap-atelier .carte{position:relative;min-height:360px;background:var(--f2)}',
    '.ap-atelier .plan .r1{stroke:color-mix(in oklab,var(--c) 55%,transparent)}.ap-atelier .plan .r2{stroke:color-mix(in oklab,var(--c) 30%,transparent)}.ap-atelier .plan .r3{stroke:color-mix(in oklab,var(--c) 20%,transparent)}.ap-atelier .plan .rp,.ap-atelier .plan .pp,.ap-atelier .plan .pd{stroke:var(--a);fill:none}.ap-atelier .plan .pp,.ap-atelier .plan .pd{fill:var(--a)}.ap-atelier .plan .pd{stroke:var(--f);stroke-width:4}.ap-atelier .plan .pc{fill:var(--f)}.ap-atelier .plan .rl{fill:var(--a)}',
    '.ap-atelier .acces{display:grid;gap:18px;align-content:center;padding:clamp(28px,4cqi,56px)}.ap-atelier .acces h2{margin:0}',
    '.ap-atelier .pied{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding-block:56px}.ap-atelier .pied h3{font:italic 400 1.7rem "Instrument Serif",serif;color:var(--a);margin-bottom:12px}',
    '.ap-atelier .hr{display:grid;grid-template-columns:96px 1fr;padding:4px 0;font-size:.95rem}.ap-atelier .hr.off{color:var(--tm)}.ap-atelier .hr.auj{color:var(--a)}.ap-atelier .tel{font:500 1.5rem "Antonio",sans-serif}',
    '.ap-atelier .fin{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;padding-block:20px 90px;border-top:1px solid color-mix(in oklab,var(--t) 12%,transparent);font-size:.86rem;color:var(--tm)}',
    '.ap-atelier .form{display:grid;gap:12px;background:var(--f);border-radius:8px;padding:clamp(20px,4cqi,40px)}.ap-atelier .form input,.ap-atelier .form textarea{width:100%;border:0;border-radius:6px;background:color-mix(in oklab,var(--t) 7%,transparent);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--t) 16%,transparent);padding:14px 16px;font:inherit;color:var(--t)}.ap-atelier .form textarea{min-height:120px}.ap-atelier .form label{display:grid;gap:6px;font-size:.9rem;color:var(--tm)}.ap-atelier .ecr{display:grid;grid-template-columns:.9fr 1.1fr;gap:5cqi;align-items:start}',
    '.ap-atelier.v1 .hero .w{grid-template-columns:1fr;justify-items:center;text-align:center}.ap-atelier.v1 .hero .badge{order:-1}.ap-atelier.v1 .hero .badge svg{width:min(46cqi,220px)}.ap-atelier.v1 .hero .badge .logo{width:min(40cqi,200px)}.ap-atelier.v1 .sous{margin-inline:auto}.ap-atelier.v1 .cta{justify-content:center}.ap-atelier.v1 .duo{grid-template-columns:1.3fr .7fr}',
    '@container (max-width:860px){.ap-atelier .hero .w{grid-template-columns:1fr;text-align:center;justify-items:center;padding-top:110px}.ap-atelier .badge{order:-1}.ap-atelier .badge svg{width:min(56cqi,220px)}.ap-atelier .badge .logo{width:min(44cqi,190px)}.ap-atelier .cta{justify-content:center}.ap-atelier .sous{margin-inline:auto}.ap-atelier .nv,.ap-atelier .hd .bt{display:none}.ap-atelier .duo,.ap-atelier.v1 .duo,.ap-atelier .studio,.ap-atelier .bas,.ap-atelier .ecr{grid-template-columns:1fr}.ap-atelier .met{min-height:380px}.ap-atelier .avis{grid-template-columns:1fr}.ap-atelier .gal{grid-template-columns:1fr 1fr}.ap-atelier .pied{grid-template-columns:1fr 1fr}.ap-atelier .studio figure{aspect-ratio:16/11}}',
    '@container (max-width:520px){.ap-atelier .pied{grid-template-columns:1fr}.ap-atelier .faits div{grid-template-columns:96px 1fr}}',

    /* ================= TABLE (clair, carte) ================= */
    '.ap-table{--bg:var(--c);--fg:var(--o);font-family:"Figtree",system-ui,sans-serif}',
    '.ap-table .fr{font-family:"Fraunces",Georgia,serif;font-variation-settings:"SOFT" 50,"opsz" 144;letter-spacing:-.025em}',
    '.ap-table em{font-family:"Fraunces",Georgia,serif;font-style:italic;font-weight:400;font-variation-settings:"SOFT" 100}',
    '.ap-table .hd .w{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:18px;border-bottom:1px solid var(--ln)}',
    '.ap-table .mq{font:600 1.35rem/1 "Fraunces",serif;letter-spacing:-.02em;text-decoration:none;display:flex;align-items:center;gap:12px}.ap-table .mq img{height:44px;width:auto}',
    '.ap-table .nv{display:flex;gap:22px;font-size:.95rem}.ap-table .nv a{text-decoration:none;color:var(--om)}',
    '.ap-table .etat{display:inline-flex;align-items:center;gap:8px;font-size:.88rem;font-weight:600;padding:6px 12px;border-radius:999px;background:var(--c2)}.ap-table .etat i{width:8px;height:8px;border-radius:50%;background:#C2410C}.ap-table .etat.on i{background:#15803D;box-shadow:0 0 0 4px rgba(21,128,61,.18)}',
    '.ap-table .hero .w{display:grid;grid-template-columns:1fr 1fr;gap:5cqi;align-items:center;padding-block:clamp(36px,6cqi,80px)}',
    '.ap-table .hero .kick{font-size:.95rem;color:var(--om);display:flex;flex-wrap:wrap;gap:8px 16px;align-items:center}',
    '.ap-table h1{margin-top:22px;font-size:clamp(3.2rem,9cqi,7.6rem);line-height:.9;font-weight:500}.ap-table h1 em{display:block;color:var(--a-sur-c);font-size:.62em;margin-top:.18em;line-height:1}',
    '.ap-table .sous{margin-top:24px;max-width:38ch;font-size:1.12rem;color:var(--om)}',
    '.ap-table .cta{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.ap-table .bt-a{background:var(--f);color:var(--c)}.ap-table .bt-l{box-shadow:inset 0 0 0 1.5px var(--f)}',
    '.ap-table .vis{position:relative}.ap-table .vis .p1{aspect-ratio:4/5;border-radius:999px 999px 18px 18px;overflow:hidden;background:var(--c3)}.ap-table .vis .p1 img{width:100%;height:100%;object-fit:cover}',
    '.ap-table .vis .p2{position:absolute;left:-12%;bottom:8%;width:42%;aspect-ratio:1;border-radius:50%;overflow:hidden;border:8px solid var(--c);background:var(--c3)}.ap-table .vis .p2 img{width:100%;height:100%;object-fit:cover}',
    '.ap-table .vis .tampon{position:absolute;right:-4%;top:6%;width:120px;aspect-ratio:1;border-radius:50%;background:var(--a);color:var(--on-a);display:grid;place-items:center;text-align:center;font:600 .82rem/1.15 "Figtree",sans-serif;padding:14px;transform:rotate(-10deg)}.ap-table .vis .tampon b{display:block;font:500 1.7rem/1 "Fraunces",serif}',
    '.ap-table .vis .vide{aspect-ratio:4/5;border-radius:999px 999px 18px 18px;background:var(--f);display:grid;place-items:center;color:var(--a);font:italic 400 clamp(5rem,16cqi,10rem)/1 "Fraunces",serif}',
    '.ap-table .bd{padding-block:clamp(64px,10cqi,120px)}',
    '.ap-table h2{font-size:clamp(2.2rem,5.6cqi,4.4rem);line-height:.98;font-weight:500;margin-bottom:clamp(26px,4cqi,48px)}.ap-table h2 em{color:var(--a-sur-c)}',
    '.ap-table .plats{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(18px,3cqi,36px)}',
    '.ap-table .plat{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:start;padding-top:22px;border-top:1px solid var(--ln)}.ap-table .plat .n{font:italic 400 3rem/1 "Fraunces",serif;color:var(--a-sur-c)}',
    '.ap-table .plat h3{font:500 1.7rem/1.1 "Fraunces",serif;letter-spacing:-.02em}.ap-table .plat p{margin-top:8px;color:var(--om)}.ap-table .plat .tag{display:inline-block;margin-top:12px;font-size:.82rem;font-weight:600;padding:4px 10px;border-radius:999px;background:var(--c2)}',
    '.ap-table .film{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:10px;scrollbar-width:thin}.ap-table .film figure{flex:none;width:clamp(220px,32cqi,380px);aspect-ratio:3/4;border-radius:14px;overflow:hidden;scroll-snap-align:start;background:var(--c3)}.ap-table .film img{width:100%;height:100%;object-fit:cover}.ap-table .film figure:nth-child(even){margin-top:40px}',
    '.ap-table .semaine{background:var(--f);color:var(--c)}.ap-table .semaine .bt-a{background:var(--a);color:var(--on-a)}.ap-table .semaine .w{display:grid;grid-template-columns:.8fr 1.2fr;gap:6cqi;align-items:start}.ap-table .semaine h2 em{color:var(--a)}',
    '.ap-table .menu{background:var(--c2);color:var(--o);border-radius:6px;padding:clamp(22px,4cqi,44px);box-shadow:0 30px 60px -30px rgba(0,0,0,.6);transform:rotate(-.6deg)}',
    '.ap-table .menu h3{font:italic 400 1.6rem "Fraunces",serif;text-align:center;margin-bottom:18px}',
    '.ap-table .li{display:flex;align-items:baseline;gap:10px;padding:8px 0;font-size:1.02rem}.ap-table .li::after{content:"";order:2;flex:1;border-bottom:2px dotted var(--ln);transform:translateY(-4px)}.ap-table .li b{order:1;font-weight:600}.ap-table .li span{order:3;text-align:right}.ap-table .li.off{color:var(--om)}.ap-table .li.auj b{color:var(--a-sur-c)}',
    '.ap-table .livre{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,3cqi,32px)}.ap-table .mot{padding-top:18px;border-top:2px solid var(--f)}.ap-table .mot p{font:italic 400 1.18rem/1.45 "Fraunces",serif}.ap-table .mot footer{margin-top:14px;font-size:.88rem;color:var(--om)}',
    '.ap-table .venir{display:grid;grid-template-columns:1.1fr .9fr;gap:5cqi;align-items:center}.ap-table .adr{font:500 clamp(2rem,5cqi,3.6rem)/1 "Fraunces",serif;letter-spacing:-.03em}.ap-table .adr small{display:block;margin-top:12px;font:400 1.05rem "Figtree",sans-serif;color:var(--om)}',
    '.ap-table .tick{background:var(--c2);border-radius:18px;padding:26px;display:grid;gap:12px}.ap-table .tick .tel{font:500 2rem "Fraunces",serif;text-decoration:none}',
    '.ap-table .form{display:grid;gap:12px}.ap-table .form input,.ap-table .form textarea{width:100%;border:0;border-bottom:1.5px solid var(--f);background:transparent;padding:12px 2px;font:inherit;color:var(--o);border-radius:0}.ap-table .form textarea{min-height:90px}.ap-table .form label{display:grid;gap:4px;font-size:.88rem;color:var(--om)}',
    '.ap-table .fin{padding-block:28px 96px;border-top:1px solid var(--ln);display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;font-size:.86rem;color:var(--om)}',
    '.ap-table.v1 .hero .w{grid-template-columns:1fr;text-align:center;justify-items:center}.ap-table.v1 .hero .kick,.ap-table.v1 .cta{justify-content:center}.ap-table.v1 .sous{margin-inline:auto}.ap-table.v1 .vis{width:min(100%,780px)}.ap-table.v1 .vis .p1,.ap-table.v1 .vis .vide{aspect-ratio:16/9;border-radius:18px}.ap-table.v1 .vis .p2{left:auto;right:4%;bottom:-10%;width:24%}.ap-table.v1 .plats{grid-template-columns:1fr}',
    '@container (max-width:860px){.ap-table .hero .w,.ap-table .semaine .w,.ap-table .venir{grid-template-columns:1fr}.ap-table .nv{display:none}.ap-table .plats{grid-template-columns:1fr}.ap-table .livre{grid-template-columns:1fr}.ap-table .vis{max-width:420px;margin-inline:auto}.ap-table .vis .p2{left:-4%}.ap-table .vis .tampon{right:0;width:104px}}',

    /* ================= CHANTIER (condensé, horaires en frise) ================= */
    '.ap-chantier{--bg:var(--f);--fg:var(--t);font-family:"Archivo",system-ui,sans-serif;font-stretch:100%}',
    '.ap-chantier .cd{font-stretch:68%;font-weight:800;text-transform:uppercase;letter-spacing:-.01em;line-height:.88}',
    '.ap-chantier .mono{font-family:"IBM Plex Mono",ui-monospace,monospace}',
    '.ap-chantier .hd{background:var(--a);color:var(--on-a)}.ap-chantier .hd .w{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-block:10px}',
    '.ap-chantier .mq{display:flex;align-items:center;gap:12px;font-size:1.5rem;text-decoration:none}.ap-chantier .mq img{height:40px;width:auto;background:#fff;padding:3px;border-radius:4px}',
    '.ap-chantier .hd .tl{font:600 1.05rem "IBM Plex Mono",monospace;text-decoration:none}',
    '.ap-chantier .hero{position:relative;overflow:hidden}.ap-chantier .hero .w{display:grid;grid-template-columns:1.05fr .95fr;gap:4cqi;align-items:end;padding-block:clamp(40px,7cqi,90px) 0}',
    '.ap-chantier h1{font-size:clamp(2.8rem,8cqi,6.6rem)}.ap-chantier h1 span{display:block}.ap-chantier h1 .sur{display:inline;background:var(--a);color:var(--on-a);padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone}',
    '.ap-chantier .sous{margin:24px 0 0;max-width:42ch;font-size:1.1rem;color:var(--tm)}',
    '.ap-chantier .cta{display:flex;flex-wrap:wrap;gap:10px;margin:30px 0 clamp(40px,7cqi,90px)}.ap-chantier .bt{border-radius:4px;text-transform:uppercase;font-stretch:80%;font-weight:800;letter-spacing:.02em}.ap-chantier .bt-a{background:var(--a);color:var(--on-a)}.ap-chantier .bt-l{box-shadow:inset 0 0 0 2px var(--t)}',
    '.ap-chantier .ph{position:relative;align-self:stretch;min-height:440px;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%);background:var(--f3)}.ap-chantier .ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}',
    '.ap-chantier .ph .vide{position:absolute;inset:0;display:grid;place-items:center;color:var(--a);font-size:clamp(7rem,22cqi,14rem)}',
    '.ap-chantier .chiffres{display:grid;grid-template-columns:repeat(4,1fr);border-top:2px solid var(--a);border-bottom:2px solid var(--a)}.ap-chantier .chiffres div{padding:20px clamp(14px,2cqi,24px);border-left:1px solid color-mix(in oklab,var(--t) 14%,transparent)}.ap-chantier .chiffres div:first-child{border-left:0}',
    '.ap-chantier .chiffres b{display:block;font-size:clamp(2rem,4.6cqi,3.4rem)}.ap-chantier .chiffres span{font-size:.86rem;color:var(--tm)}',
    '.ap-chantier .bd{padding-block:clamp(64px,10cqi,120px)}.ap-chantier .clair{background:var(--c);color:var(--o)}',
    '.ap-chantier h2{font-size:clamp(2.6rem,7cqi,5.4rem);margin-bottom:clamp(26px,4cqi,48px)}.ap-chantier h2 span{color:var(--a)}.ap-chantier .clair h2 span{color:var(--f3)}',
    '.ap-chantier .demande{display:grid;grid-template-columns:.85fr 1.15fr;gap:5cqi;align-items:start}',
    '.ap-chantier .q{background:var(--c2);border-radius:6px;padding:clamp(20px,3.4cqi,36px);display:grid;gap:22px;color:var(--o)}',
    '.ap-chantier .q p.l{font:600 .8rem "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--om);margin-bottom:10px}',
    '.ap-chantier .chips{display:flex;flex-wrap:wrap;gap:8px}.ap-chantier .chips button{padding:12px 16px;border-radius:4px;box-shadow:inset 0 0 0 1.5px var(--ln);font-weight:600;background:#fff}.ap-chantier .chips button[aria-pressed=true]{background:var(--f);color:var(--c);box-shadow:none}',
    '.ap-chantier .recap{padding:16px;border-radius:4px;background:var(--f);color:var(--t);font-size:.95rem}.ap-chantier .recap b{color:var(--a)}',
    '.ap-chantier .etapes{display:grid;grid-template-columns:repeat(4,1fr);gap:0;counter-reset:e}.ap-chantier .etapes li{padding:22px 18px 6px 0;border-top:2px solid var(--f)}.ap-chantier .etapes li::before{counter-increment:e;content:"0" counter(e);display:block;font:600 .9rem "IBM Plex Mono",monospace;color:var(--om);margin-bottom:14px}.ap-chantier .etapes b{display:block;font-size:1.4rem;font-stretch:72%;font-weight:800;text-transform:uppercase}.ap-chantier .etapes span{display:block;margin-top:6px;color:var(--om);font-size:.95rem}',
    '.ap-chantier .frise{display:grid;gap:8px}.ap-chantier .fl{display:grid;grid-template-columns:110px 1fr 190px;gap:16px;align-items:center;font-size:.95rem}',
    '.ap-chantier .fl .barre{position:relative;height:14px;border-radius:2px;background:color-mix(in oklab,var(--t) 9%,transparent)}.ap-chantier .fl .barre i{position:absolute;top:0;bottom:0;background:var(--a);border-radius:2px}',
    '.ap-chantier .fl.auj{color:var(--a)}.ap-chantier .fl.off{color:var(--tm)}.ap-chantier .fl .mono{text-align:right;font-size:.8rem;white-space:nowrap}.ap-chantier .echelle{display:grid;grid-template-columns:110px 1fr 190px;gap:16px;font:.78rem "IBM Plex Mono",monospace;color:var(--tm)}.ap-chantier .echelle div{display:flex;justify-content:space-between}',
    '.ap-chantier .avis{display:grid}.ap-chantier .av{display:grid;grid-template-columns:150px 1fr;gap:24px;padding:22px 0;border-top:1px solid var(--ln)}.ap-chantier .av b{display:block}.ap-chantier .av i{font-style:normal;color:var(--f3);letter-spacing:2px}',
    '.ap-chantier .gal{display:grid;grid-template-columns:2fr 1fr 1fr;grid-auto-rows:220px;gap:6px}.ap-chantier .gal figure{overflow:hidden;background:var(--f3)}.ap-chantier .gal figure:first-child{grid-row:span 2}.ap-chantier .gal img{width:100%;height:100%;object-fit:cover}.ap-chantier .gal.n3{grid-template-columns:2fr 1fr}',
    '.ap-chantier .zone{display:grid;grid-template-columns:1fr 1fr;min-height:420px}.ap-chantier .carte{position:relative;background:var(--f2)}',
    '.ap-chantier .plan .r1{stroke:color-mix(in oklab,var(--t) 40%,transparent)}.ap-chantier .plan .r2{stroke:color-mix(in oklab,var(--t) 22%,transparent)}.ap-chantier .plan .r3{stroke:color-mix(in oklab,var(--t) 16%,transparent)}.ap-chantier .plan .rp{stroke:var(--a)}.ap-chantier .plan .pp,.ap-chantier .plan .pd{fill:var(--a)}.ap-chantier .plan .pd{stroke:var(--f);stroke-width:4}.ap-chantier .plan .pc{fill:var(--f)}.ap-chantier .plan .rl{fill:var(--a);font-family:"Archivo",sans-serif;text-transform:uppercase}',
    '.ap-chantier .acc{padding:clamp(28px,4cqi,56px);display:grid;gap:16px;align-content:center}.ap-chantier .acc .tel{font:600 clamp(1.8rem,4cqi,2.6rem) "IBM Plex Mono",monospace;text-decoration:none;color:var(--a)}',
    '.ap-chantier .form{display:grid;gap:10px}.ap-chantier .form input,.ap-chantier .form textarea{width:100%;border:0;border-radius:4px;background:#fff;box-shadow:inset 0 0 0 1.5px var(--ln);padding:14px;font:inherit;color:var(--o)}.ap-chantier .form textarea{min-height:110px}',
    '.ap-chantier .fin{padding-block:22px 96px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;font:.8rem "IBM Plex Mono",monospace;color:var(--tm);border-top:2px solid var(--a)}',
    '.ap-chantier.v1 .hero .w{grid-template-columns:1fr;padding-top:0}.ap-chantier.v1 .ph{order:-1;min-height:clamp(240px,42cqi,520px);clip-path:none;margin-inline:calc(max(18px,4.5cqi) * -1)}.ap-chantier.v1 .hero h1{margin-top:clamp(28px,5cqi,60px)}.ap-chantier.v1 .etapes{grid-template-columns:repeat(2,1fr)}',
    '@container (max-width:860px){.ap-chantier .hero .w,.ap-chantier .demande,.ap-chantier .zone{grid-template-columns:1fr}.ap-chantier .ph{order:-1;min-height:300px;clip-path:none;margin-inline:calc(max(18px,4.5cqi) * -1)}.ap-chantier .chiffres{grid-template-columns:1fr 1fr}.ap-chantier .chiffres div:nth-child(3){border-left:0}.ap-chantier .etapes,.ap-chantier.v1 .etapes{grid-template-columns:1fr 1fr}.ap-chantier .fl,.ap-chantier .echelle{grid-template-columns:84px 1fr}.ap-chantier .fl .mono,.ap-chantier .echelle>span:last-child{grid-column:2;text-align:left}.ap-chantier .av{grid-template-columns:1fr;gap:6px}.ap-chantier .gal{grid-template-columns:1fr 1fr;grid-auto-rows:160px}.ap-chantier .carte{min-height:300px}}',

    /* ================= CABINET (calme, rendez-vous) ================= */
    '.ap-cabinet{--bg:var(--c2);--fg:var(--o);font-family:"Hanken Grotesk",system-ui,sans-serif;font-weight:400}',
    '.ap-cabinet .nr{font-family:"Newsreader",Georgia,serif;font-weight:400;letter-spacing:-.015em}.ap-cabinet em{font-family:"Newsreader",Georgia,serif;font-style:italic}',
    '.ap-cabinet .hd .w{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-block:22px}.ap-cabinet .mq{display:flex;align-items:center;gap:12px;text-decoration:none;font-weight:600}.ap-cabinet .mq i{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--f);color:var(--c);font:italic 1.1rem "Newsreader",serif}.ap-cabinet .mq img{height:40px;width:auto}',
    '.ap-cabinet .nv{display:flex;gap:26px;font-size:.95rem}.ap-cabinet .nv a{text-decoration:none;color:var(--om)}',
    '.ap-cabinet .bt-a{background:var(--f);color:var(--c)}.ap-cabinet .bt-l{box-shadow:inset 0 0 0 1px var(--ln);background:#fff}',
    '.ap-cabinet .hero .w{display:grid;grid-template-columns:1.1fr .9fr;gap:6cqi;align-items:center;padding-block:clamp(40px,7cqi,100px)}',
    '.ap-cabinet .kick{display:inline-flex;align-items:center;gap:10px;font-size:.92rem;color:var(--om)}.ap-cabinet .kick i{width:28px;height:1px;background:var(--om)}',
    '.ap-cabinet h1{margin-top:20px;font-size:clamp(2.8rem,6.6cqi,5.4rem);line-height:1.02}.ap-cabinet h1 em{color:var(--f3)}',
    '.ap-cabinet .sous{margin-top:22px;max-width:44ch;font-size:1.12rem;color:var(--om)}.ap-cabinet .cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}',
    '.ap-cabinet .arche{position:relative;aspect-ratio:4/5;border-radius:999px 999px 28px 28px;overflow:hidden;background:color-mix(in oklab,var(--a) 30%,var(--c))}.ap-cabinet .arche img{width:100%;height:100%;object-fit:cover}',
    '.ap-cabinet .arche .rond{position:absolute;inset:auto 10% 10% auto;width:46%;aspect-ratio:1;border-radius:50%;background:color-mix(in oklab,var(--a) 70%,#fff)}.ap-cabinet .arche .rond2{position:absolute;inset:18% auto auto 12%;width:30%;aspect-ratio:1;border-radius:50%;border:1.5px solid var(--f);opacity:.35}',
    '.ap-cabinet .arche .ini{position:absolute;inset:0;display:grid;place-items:center;font:italic 300 clamp(5rem,14cqi,9rem) "Newsreader",serif;color:var(--f)}',
    '.ap-cabinet .bd{padding-block:clamp(60px,9cqi,110px)}.ap-cabinet .blanc{background:#fff}',
    '.ap-cabinet h2{font-size:clamp(2rem,4.8cqi,3.6rem);line-height:1.05;margin-bottom:clamp(24px,4cqi,44px)}.ap-cabinet h2 em{color:var(--f3)}',
    '.ap-cabinet .rdv{display:grid;grid-template-columns:.9fr 1.1fr;gap:5cqi;align-items:start}',
    '.ap-cabinet .pan{background:var(--c2);border-radius:24px;padding:clamp(20px,3.4cqi,34px);box-shadow:0 1px 0 rgba(0,0,0,.03)}',
    '.ap-cabinet .jours{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.ap-cabinet .jours button{display:grid;gap:2px;justify-items:center;padding:12px 4px;border-radius:14px;background:#fff;font-size:.82rem;color:var(--om)}.ap-cabinet .jours button b{font-size:1.05rem;color:var(--o)}.ap-cabinet .jours button[disabled]{opacity:.38;cursor:default}.ap-cabinet .jours button[aria-pressed=true]{background:var(--f);color:var(--c)}.ap-cabinet .jours button[aria-pressed=true] b{color:var(--c)}',
    '.ap-cabinet .creneaux{margin-top:18px;padding:18px;border-radius:16px;background:#fff;display:grid;gap:10px}.ap-cabinet .creneaux p{font-size:1.05rem}.ap-cabinet .creneaux .tel{font:500 1.5rem "Newsreader",serif;text-decoration:none}',
    '.ap-cabinet .soins{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.ap-cabinet .soin{padding:28px;border-radius:24px;background:#fff;display:grid;gap:10px;align-content:start}.ap-cabinet .soin h3{font:400 1.9rem/1.1 "Newsreader",serif}.ap-cabinet .soin h3 em{color:var(--f3)}.ap-cabinet .soin p{color:var(--om)}.ap-cabinet .soin .tag{justify-self:start;font-size:.82rem;padding:4px 12px;border-radius:999px;background:var(--c2)}',
    '.ap-cabinet .avant{display:grid}.ap-cabinet details{border-top:1px solid var(--ln)}.ap-cabinet details:last-child{border-bottom:1px solid var(--ln)}.ap-cabinet summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;gap:16px;padding:20px 0;font:400 1.4rem "Newsreader",serif}.ap-cabinet summary::-webkit-details-marker{display:none}.ap-cabinet summary::after{content:"+";font-family:"Hanken Grotesk",sans-serif;color:var(--om)}.ap-cabinet details[open] summary::after{content:"–"}.ap-cabinet details p{padding:0 0 20px;color:var(--om);max-width:60ch}',
    '.ap-cabinet .cit{display:grid;grid-template-columns:1fr 1fr;gap:5cqi}.ap-cabinet .cit blockquote{margin:0;font:italic 300 clamp(1.3rem,2.4cqi,1.8rem)/1.4 "Newsreader",serif}.ap-cabinet .cit footer{margin-top:16px;font:500 .92rem "Hanken Grotesk",sans-serif;color:var(--om)}',
    '.ap-cabinet .lieu{display:grid;grid-template-columns:1fr 1fr;gap:16px}.ap-cabinet .carte{position:relative;min-height:340px;border-radius:24px;overflow:hidden;background:var(--c3)}',
    '.ap-cabinet .plan .r1{stroke:color-mix(in oklab,var(--f) 22%,transparent)}.ap-cabinet .plan .r2{stroke:color-mix(in oklab,var(--f) 12%,transparent)}.ap-cabinet .plan .r3{stroke:color-mix(in oklab,var(--f) 10%,transparent)}.ap-cabinet .plan .rp{stroke:var(--f3)}.ap-cabinet .plan .pp,.ap-cabinet .plan .pd{fill:var(--f3)}.ap-cabinet .plan .pd{stroke:#fff;stroke-width:4}.ap-cabinet .plan .pc{fill:#fff}.ap-cabinet .plan .rl{fill:var(--f3)}',
    '.ap-cabinet .form{display:grid;gap:12px;padding:26px;border-radius:24px;background:#fff}.ap-cabinet .form input,.ap-cabinet .form textarea{width:100%;border:0;border-radius:12px;background:var(--c2);padding:14px;font:inherit;color:var(--o)}.ap-cabinet .form textarea{min-height:100px}',
    '.ap-cabinet .fin{padding-block:26px 96px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;font-size:.86rem;color:var(--om);border-top:1px solid var(--ln)}',
    '.ap-cabinet.v1 .hero .w{grid-template-columns:1fr;text-align:center;justify-items:center}.ap-cabinet.v1 .arche{display:none}.ap-cabinet.v1 .sous{margin-inline:auto}.ap-cabinet.v1 .cta{justify-content:center}.ap-cabinet.v1 h1{font-size:clamp(3rem,7.6cqi,6.4rem)}',
    '@container (max-width:860px){.ap-cabinet .hero .w,.ap-cabinet .rdv,.ap-cabinet .cit,.ap-cabinet .lieu,.ap-cabinet .soins{grid-template-columns:1fr}.ap-cabinet .nv{display:none}.ap-cabinet .arche{max-width:380px;width:100%;margin-inline:auto}.ap-cabinet .jours{grid-template-columns:repeat(4,1fr)}}',

    /* ================= VITRINE (affirmé) ================= */
    '.ap-vitrine{--bg:var(--c);--fg:var(--o);font-family:"Manrope",system-ui,sans-serif}',
    '.ap-vitrine .ub{font-family:"Unbounded",system-ui,sans-serif;font-weight:700;letter-spacing:-.04em;line-height:.95}',
    '.ap-vitrine .hd .w{display:flex;align-items:center;justify-content:space-between;gap:14px;padding-block:16px}.ap-vitrine .mq{display:flex;align-items:center;gap:10px;text-decoration:none;font:700 1.05rem "Unbounded",sans-serif;letter-spacing:-.03em}.ap-vitrine .mq img{height:42px;width:auto}',
    '.ap-vitrine .nv{display:flex;gap:6px}.ap-vitrine .nv a{text-decoration:none;padding:9px 16px;border-radius:999px;background:var(--c2);font-weight:600;font-size:.92rem}',
    '.ap-vitrine .bt-a{background:var(--a);color:var(--on-a)}.ap-vitrine .bt-l{background:var(--f);color:var(--c)}',
    '.ap-vitrine .hero .w{display:grid;grid-template-columns:1fr 1fr;gap:3cqi;align-items:stretch;padding-block:10px clamp(40px,6cqi,80px)}',
    '.ap-vitrine .bloc{position:relative;border-radius:32px;background:var(--a);color:var(--on-a);padding:clamp(26px,4.6cqi,56px);display:flex;flex-direction:column;justify-content:space-between;gap:30px;overflow:hidden}',
    '.ap-vitrine h1{font-size:clamp(2.2rem,5.6cqi,4.8rem);overflow-wrap:break-word}.ap-vitrine h1.long{font-size:clamp(1.9rem,4.4cqi,3.8rem)}.ap-vitrine h1 span{display:block}',
    '.ap-vitrine .sous{max-width:36ch;font-size:1.1rem;opacity:.85}.ap-vitrine .cta{display:flex;flex-wrap:wrap;gap:10px}',
    '.ap-vitrine .mos{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;min-height:480px}.ap-vitrine .mos figure{border-radius:26px;overflow:hidden;background:var(--c3)}.ap-vitrine .mos figure:first-child{grid-row:span 2}.ap-vitrine .mos img{width:100%;height:100%;object-fit:cover}',
    '.ap-vitrine .mos .vide{display:grid;place-items:center;background:var(--f);color:var(--a);font:700 clamp(4rem,11cqi,8rem) "Unbounded",sans-serif}',
    '.ap-vitrine .sticker{position:absolute;right:20px;top:20px;padding:10px 16px;border-radius:999px;background:var(--f);color:var(--c);font-weight:700;font-size:.88rem;transform:rotate(6deg)}.ap-vitrine .sticker i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:8px;background:#22C55E}.ap-vitrine .sticker.off i{background:#F97316}',
    '.ap-vitrine .bd{padding-block:clamp(56px,9cqi,110px)}',
    '.ap-vitrine h2{font-size:clamp(2rem,5cqi,3.8rem);margin-bottom:clamp(24px,4cqi,44px)}',
    '.ap-vitrine .cats{display:grid;grid-template-columns:1fr 1fr;gap:12px}.ap-vitrine .cat{border-radius:28px;padding:30px;min-height:260px;display:flex;flex-direction:column;justify-content:space-between;gap:20px;background:var(--c2);text-decoration:none}.ap-vitrine .cat:nth-child(2){background:var(--f);color:var(--c)}.ap-vitrine .cat h3{font:700 clamp(1.6rem,3.4cqi,2.4rem)/1 "Unbounded",sans-serif;letter-spacing:-.04em}.ap-vitrine .cat p{opacity:.8}.ap-vitrine .cat .go{font-weight:700}',
    '.ap-vitrine .defile{overflow:hidden;padding-block:clamp(40px,6cqi,70px);background:var(--f);color:var(--c)}.ap-vitrine .defile .rang{display:flex;gap:16px;width:max-content;animation:ap-defile 60s linear infinite}.ap-vitrine .defile:hover .rang{animation-play-state:paused}',
    '.ap-vitrine .bulle{width:min(420px,78cqi);flex:none;padding:24px;border-radius:24px;background:var(--f2);display:grid;gap:14px}.ap-vitrine .bulle footer{display:flex;justify-content:space-between;font-size:.88rem;opacity:.75}.ap-vitrine .bulle i{color:var(--a);font-style:normal;letter-spacing:2px}',
    '.ap-vitrine .dh{display:flex;flex-wrap:wrap;gap:12px 40px;align-items:end;justify-content:space-between;margin-bottom:28px}.ap-vitrine .dh .n{font:700 clamp(3.4rem,9cqi,6rem)/.9 "Unbounded",sans-serif;color:var(--a)}',
    '.ap-vitrine .infos{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ap-vitrine .tuile{border-radius:28px;padding:28px;background:var(--c2);display:grid;gap:12px;align-content:start}.ap-vitrine .tuile h3{font:700 1.2rem "Unbounded",sans-serif;letter-spacing:-.03em}.ap-vitrine .tuile.carte{position:relative;min-height:300px;overflow:hidden;background:var(--f);color:var(--c);align-content:end}',
    '.ap-vitrine .plan .r1{stroke:color-mix(in oklab,var(--c) 40%,transparent)}.ap-vitrine .plan .r2{stroke:color-mix(in oklab,var(--c) 22%,transparent)}.ap-vitrine .plan .r3{stroke:color-mix(in oklab,var(--c) 14%,transparent)}.ap-vitrine .plan .rp{stroke:var(--a)}.ap-vitrine .plan .pp,.ap-vitrine .plan .pd{fill:var(--a)}.ap-vitrine .plan .pd{stroke:var(--f);stroke-width:4}.ap-vitrine .plan .pc{fill:var(--f)}.ap-vitrine .plan .rl{fill:var(--a)}',
    '.ap-vitrine .tuile.carte>*:not(svg){position:relative;z-index:1}.ap-vitrine .hr{display:flex;justify-content:space-between;gap:10px;font-size:.95rem}.ap-vitrine .hr.off{opacity:.55}.ap-vitrine .hr.auj{font-weight:700}',
    '.ap-vitrine .form{display:grid;gap:10px}.ap-vitrine .form input,.ap-vitrine .form textarea{width:100%;border:0;border-radius:16px;background:#fff;padding:14px;font:inherit;color:var(--o)}.ap-vitrine .form textarea{min-height:100px}',
    '.ap-vitrine .fin{padding-block:26px 96px;display:flex;flex-wrap:wrap;gap:10px;justify-content:space-between;font-size:.86rem;opacity:.7}',
    '.ap-vitrine.v1 .hero .w{grid-template-columns:1.4fr .6fr}.ap-vitrine.v1 .mos{grid-template-columns:1fr;grid-template-rows:1fr}.ap-vitrine.v1 .mos figure:not(:first-child){display:none}.ap-vitrine.v1 .bloc{order:2}',
    '@container (max-width:860px){.ap-vitrine .mos{min-height:240px}.ap-vitrine .hero .w,.ap-vitrine.v1 .hero .w,.ap-vitrine .cats,.ap-vitrine .infos{grid-template-columns:1fr}.ap-vitrine .nv{display:none}.ap-vitrine .mos{min-height:340px}.ap-vitrine.v1 .bloc{order:0}}'
  ].join('\n');
  function feuille() { if (document.getElementById('ap-css')) return; var st = document.createElement('style'); st.id = 'ap-css'; st.textContent = CSS; document.head.appendChild(st); }

  /* ---------- pièces communes ---------- */
  function lienTel(S, cls, txt) { return S.tel ? h('a', cls, txt || S.telAffiche || S.tel, { href: 'tel:' + S.tel }) : null; }
  function formulaire(ctx, champs) {
    var f = h('form', 'form', [
      h('label', null, ['Nom', h('input', null, null, { name: 'nom', autocomplete: 'name' })]),
      h('label', null, ['E-mail ou téléphone', h('input', null, null, { name: 'contact' })]),
      h('label', null, [champs || 'Votre message', h('textarea', null, null, { name: 'message' })]),
      h('button', 'bt bt-a', ['Envoyer ', h('span', 'arr', '→')], { type: 'submit', style: 'justify-self:start' })
    ], { novalidate: '' });
    f.addEventListener('submit', function (e) { e.preventDefault(); ctx.toast('Dans l’aperçu, le formulaire n’envoie rien. Il sera relié à votre boîte mail.'); });
    return f;
  }
  function adresse(S) { return [str(S.adresse), [str(S.cp), str(S.commune || S.ville)].filter(Boolean).join(' ')].filter(Boolean); }
  function rueDe(S) { var r = str(S.adresse).replace(/^\d+[a-z]?(\s*(bis|ter))?,?\s*/i, ''); return r.length < 32 ? r : ''; }
  function itineraire(S, nom) { return S.maps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nom + ' ' + adresse(S).join(' ')); }
  function avisRetenus(S, n) { return (S.avis || []).filter(function (a) { return str(a.texte).length > 30; }).slice(0, n).map(function (a) { var t = str(a.texte); if (t.length > 300) t = t.slice(0, 290).replace(/\s+\S*$/, '') + '…'; return { auteur: str(a.auteur), note: a.note, texte: t }; }); }
  function aujIndex() { return (new Date().getDay() + 6) % 7; }
  function motif(i) { var x = document.createElementNS(SVGNS, 'svg'); x.setAttribute('viewBox', '0 0 300 300'); x.setAttribute('aria-hidden', 'true'); x.innerHTML = i % 2 ? '<path d="M40 230 C 90 110, 150 80, 260 60" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="260" cy="60" r="7" fill="currentColor"/><circle cx="40" cy="230" r="7" fill="currentColor"/>' : '<circle cx="150" cy="150" r="110" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="150" cy="150" r="72" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/><circle cx="150" cy="40" r="7" fill="currentColor"/>'; return x; }
  function ti(sv) { var t = sv.titre; return /['’]$/.test(t) ? [t, h('em', null, sv.it)] : [t + ' ', h('em', null, sv.it)]; }
  function img(p, alt) { return p ? h('img', null, null, { src: p.url, alt: alt || '', loading: 'lazy' }) : null; }

  /* ================= ATELIER ================= */
  function atelier(ctx) {
    var S = ctx.S, T = ctx.T, nom = ctx.nom, ph = ctx.ph, out = [];
    var liens = [['#services', 'Services'], ctx.photos.length > 2 ? ['#galerie', 'En images'] : null, ctx.avis.length ? ['#avis', 'Avis'] : null, ['#contact', 'Contact']].filter(Boolean);
    out.push(h('header', 'hd', h('div', 'w', [
      h('a', 'mq', [ctx.logo ? h('i', null, h('img', null, null, { src: ctx.logo, alt: '', style: 'width:100%;height:100%;object-fit:contain;padding:6px;background:#fff;border-radius:50%' })) : h('i', null, initiales(nom)), nom], { href: '#haut' }),
      h('nav', 'nv', liens.map(function (l) { return h('a', null, l[1], { href: l[0] }); })),
      h('a', 'bt bt-l', ctx.cta, { href: '#contact' })
    ])));
    var lng = Math.max.apply(null, ctx.h1.join(' ').split(/\s+/).map(function (w) { return w.length; })) > 9;
    var gauche = h('div', null, [
      h('h1', lng ? 'long' : null, [ctx.h1[0] ? h('span', null, ctx.h1[0]) : null, ctx.h1[1] ? h('span', null, ctx.h1[1]) : null, ctx.h1[2] ? h('span', null, em(ctx.h1[2])) : null, h('span', 'sr', ', ' + nom)]),
      T.sous ? h('p', 'sous', str(T.sous)) : null,
      h('div', 'cta', [h('a', 'bt bt-a', [ctx.cta, h('span', 'arr', '→')], { href: S.tel ? 'tel:' + S.tel : '#contact' }), h('a', 'bt bt-l', 'Nous trouver', { href: '#contact' })]),
      ctx.note ? h('p', 'note-h', [h('i', null, '★★★★★'), h('b', null, noteFr(ctx.note)), ctx.nbAvis + ' avis Google']) : null
    ]);
    var droite;
    if (ctx.logo) droite = h('div', 'badge', h('div', 'logo', h('img', null, null, { src: ctx.logo, alt: 'Logo ' + nom })));
    else {
      var u = (nom + ' · ' + str(S.ville || S.commune) + ' · ').toUpperCase(), t = '';
      for (var k = Math.max(1, Math.round(56 / u.length)); k > 0; k--) t += u;
      var svg = s('svg', { viewBox: '0 0 400 400', 'aria-hidden': 'true' });
      svg.appendChild(s('defs', {}, [s('path', { id: 'cercle-' + ctx.id, d: 'M200,200 m-160,0 a160,160 0 1,1 320,0 a160,160 0 1,1 -320,0' })]));
      svg.appendChild(s('g', { class: 'rot' }, [s('text', { textLength: '1000', lengthAdjust: 'spacing' }, [s('textPath', { href: '#cercle-' + ctx.id }, [t])])]));
      svg.appendChild(s('circle', { cx: 200, cy: 200, r: 128, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-dasharray': '2 7', opacity: '.7' }));
      svg.appendChild(s('text', { x: 200, y: 238, 'text-anchor': 'middle', class: 'ini' }, [initiales(nom)]));
      if (S.activite) svg.appendChild(s('text', { x: 200, y: 290, 'text-anchor': 'middle', class: 'sm' }, [str(S.activite).toUpperCase().slice(0, 22)]));
      droite = h('div', 'badge', svg);
    }
    out.push(h('section', 'hero', [h('div', 'ph', img(ph(0))), h('div', 'w', [gauche, droite])], { id: 'haut' }));
    var mots = ctx.ruban, p = h('p');
    for (var r = 0; r < 4; r++) mots.forEach(function (m) { p.appendChild(h('span', null, m)); p.appendChild(h('span', null, '✦')); });
    out.push(h('div', 'ruban', h('div', null, p), { 'aria-hidden': 'true' }));
    out.push(h('section', 'bd peau', h('div', 'w', [
      h('h2', null, [ctx.titre(T.servicesTitre, 'Ce que nous', 'faisons')]),
      h('div', 'duo', ctx.services.map(function (sv, i) {
        return h('a', 'met', [ctx.photos.length > 1 && ph(i + 1) ? img(ph(i + 1)) : motif(i), sv.tag ? h('span', 'tag', sv.tag) : null, h('h3', null, ti(sv)), h('p', null, sv.texte), h('span', 'go', (sv.cta || 'Nous contacter') + ' →')], { href: '#contact' });
      }))
    ]), { id: 'services' }));
    if (ctx.photos.length > 2) {
      var large = ctx.photos.length >= 5, g = h('div', 'gal');
      ctx.photos.slice(0, large ? 5 : 3).forEach(function (q, i) { g.appendChild(h('button', i === 0 && large ? 'large' : null, img(q, 'Photo ' + (i + 1)), { type: 'button', 'data-lb': i })); });
      out.push(h('section', 'bd', h('div', 'w', [h('h2', null, ctx.titre(T.galerieTitre, 'Quelques', 'images')), g]), { id: 'galerie' }));
    }
    var pr = T.presentation || {};
    out.push(h('section', 'bd peau', h('div', 'w studio', [
      h('figure', null, [img(ph(ctx.photos.length > 3 ? 3 : 1)) || motif(0), pr.legende ? h('figcaption', null, pr.legende) : null]),
      h('div', null, [
        ctx.note ? h('p', 'gros', [noteFr(ctx.note), ' ', em('/5')]) : h('h2', null, [nom, ' ', em(str(pr.titre && pr.titre[1]))]),
        ctx.note ? h('p', null, ['d’après ' + ctx.nbAvis + ' avis Google, ', em(str(pr.sous && pr.sous[1]))]) : null,
        h('dl', 'faits', (pr.faits || []).slice(0, 3).map(function (f) { return h('div', null, [h('dt', null, f.t), h('dd', null, f.d)]); }))
      ])
    ])));
    if (ctx.avis.length) out.push(h('section', 'bd prune', h('div', 'w', [
      h('div', 'avh', [ctx.note ? h('p', 'notebig', [noteFr(ctx.note), h('small', null, '/5')]) : null, h('h2', null, ['Ils en ', em('parlent')])]),
      h('div', 'avis', ctx.avis.map(function (a) { return h('figure', 'av', [h('p', null, a.texte), h('footer', null, [h('b', null, a.auteur), h('i', null, etoiles(a.note))])]); }))
    ]), { id: 'avis' }));
    out.push(h('section', 'bd prune', h('div', 'w ecr', [h('div', null, [h('h2', null, ['Nous ', em('écrire')]), h('p', null, 'Une question, une demande de rendez-vous : le message arrive directement par e-mail.')]), formulaire(ctx)])));
    var H = ctx.horaires, auj = aujIndex();
    out.push(h('footer', null, [
      h('div', 'bas', [h('div', 'carte', plan(ctx.seed, rueDe(S))), h('div', 'acces', [h('h2', null, ctx.titre(T.appel, 'Passer', 'nous voir')), h('p', null, ctx.adr.join(', ')), h('div', 'cta', [h('a', 'bt bt-a', 'Itinéraire ↗', { href: ctx.itin, target: '_blank', rel: 'noopener' }), lienTel(S, 'bt bt-l')])])]),
      h('div', 'w pied', [
        h('div', null, [h('h3', null, 'Horaires'), H ? H.map(function (x, i) { return h('div', 'hr' + (x ? '' : ' off') + (i === auj ? ' auj' : ''), [h('span', null, JOURS[i]), h('span', null, x || 'Fermé')]); }) : h('p', null, 'À préciser')]),
        h('div', null, [h('h3', null, 'Contact'), lienTel(S, 'tel')]),
        h('div', null, [h('h3', null, 'En ligne'), h('a', null, 'Fiche Google', { href: ctx.itin, target: '_blank', rel: 'noopener' })])
      ]),
      ctx.fin()
    ], { id: 'contact' }));
    return out;
  }

  /* ================= TABLE ================= */
  function table(ctx) {
    var S = ctx.S, T = ctx.T, nom = ctx.nom, ph = ctx.ph, out = [], st = statut(ctx.horaires), auj = aujIndex();
    out.push(h('header', 'hd', h('div', 'w', [
      h('a', 'mq', [ctx.logo ? h('img', null, null, { src: ctx.logo, alt: '' }) : null, nom], { href: '#haut' }),
      h('nav', 'nv', [h('a', null, 'La maison', { href: '#maison' }), ctx.horaires ? h('a', null, 'Horaires', { href: '#semaine' }) : null, ctx.avis.length ? h('a', null, 'Avis', { href: '#livre' }) : null, h('a', null, 'Venir', { href: '#venir' })]),
      st ? h('span', 'etat' + (st.ouvert ? ' on' : ''), [h('i'), st.texte]) : null
    ])));
    var vis;
    if (ph(0)) vis = h('div', 'vis', [h('div', 'p1', img(ph(0))), ph(1) && ctx.photos.length > 1 ? h('div', 'p2', img(ph(1))) : null, ctx.note ? h('div', 'tampon', h('span', null, [h('b', null, noteFr(ctx.note)), ctx.nbAvis + ' avis Google'])) : null]);
    else vis = h('div', 'vis', [ctx.logo ? h('div', 'vide', h('img', null, null, { src: ctx.logo, alt: '', style: 'width:60%' })) : h('div', 'vide', initiales(nom))]);
    out.push(h('section', 'hero', h('div', 'w', [
      h('div', null, [
        h('p', 'kick', [ctx.h1.filter(Boolean).join(' ')]),
        h('h1', 'fr', [nom, em(str(S.ville || S.commune) ? 'à ' + str(S.ville || S.commune) : '')]),
        T.sous ? h('p', 'sous', T.sous) : null,
        h('div', 'cta', [h('a', 'bt bt-a', [ctx.cta, h('span', 'arr', '→')], { href: S.tel ? 'tel:' + S.tel : '#venir' }), h('a', 'bt bt-l', 'Voir les horaires', { href: '#semaine' })])
      ]), vis
    ]), { id: 'haut' }));
    out.push(h('section', 'bd', h('div', 'w', [
      h('h2', 'fr', ctx.titre(T.servicesTitre, 'La', 'maison')),
      h('div', 'plats', ctx.services.map(function (sv, i) { return h('article', 'plat', [h('span', 'n', String(i + 1)), h('div', null, [h('h3', null, ti(sv)), h('p', null, sv.texte), sv.tag ? h('span', 'tag', sv.tag) : null])]); }))
    ]), { id: 'maison' }));
    if (ctx.photos.length > 2) out.push(h('section', 'bd', h('div', 'w', [h('h2', 'fr', ctx.titre(T.galerieTitre, 'En', 'images')), h('div', 'film', ctx.photos.slice(0, 6).map(function (q, i) { return h('figure', null, img(q, 'Photo ' + (i + 1))); }))]), { style: 'padding-top:0' }));
    if (ctx.horaires) out.push(h('section', 'bd semaine', h('div', 'w', [
      h('div', null, [h('h2', 'fr', ['Cette ', em('semaine')]), st ? h('p', null, st.texte + '.') : null, h('div', 'cta', [lienTel(S, 'bt bt-a', 'Appeler ' + (S.telAffiche || ''))])]),
      h('div', 'menu', [h('h3', null, nom), ctx.horaires.map(function (x, i) { return h('div', 'li' + (x ? '' : ' off') + (i === auj ? ' auj' : ''), [h('b', null, JOURS[i]), h('span', null, x || 'fermé')]); })])
    ]), { id: 'semaine' }));
    if (ctx.avis.length) out.push(h('section', 'bd', h('div', 'w', [
      h('h2', 'fr', ['Le livre ', em('d’or')]),
      h('div', 'livre', ctx.avis.map(function (a) { return h('figure', 'mot', [h('p', null, '« ' + a.texte + ' »'), h('footer', null, a.auteur + ', sur Google')]); }))
    ]), { id: 'livre' }));
    out.push(h('section', 'bd', h('div', 'w venir', [
      h('div', null, [h('h2', 'fr', ctx.titre(T.appel, 'Venir', 'nous voir')), h('p', 'adr', [ctx.adr[0] || nom, h('small', null, ctx.adr.slice(1).join(' '))]), h('div', 'cta', [h('a', 'bt bt-a', 'Itinéraire ↗', { href: ctx.itin, target: '_blank', rel: 'noopener' })])]),
      h('div', 'tick', [S.tel ? h('p', null, 'Par téléphone') : null, lienTel(S, 'tel'), h('p', null, 'Ou par écrit'), formulaire(ctx, 'Votre demande (commande, réservation, question)')])
    ]), { id: 'venir' }));
    out.push(h('footer', 'w', ctx.fin()));
    return out;
  }

  /* ================= CHANTIER ================= */
  function chantier(ctx) {
    var S = ctx.S, T = ctx.T, nom = ctx.nom, ph = ctx.ph, out = [], auj = aujIndex(), st = statut(ctx.horaires);
    out.push(h('header', 'hd', h('div', 'w', [h('a', 'mq cd', [ctx.logo ? h('img', null, null, { src: ctx.logo, alt: '' }) : null, nom], { href: '#haut' }), lienTel(S, 'tl', '☎ ' + (S.telAffiche || ''))])));
    var lignes = ctx.h1.filter(Boolean);
    out.push(h('section', 'hero', h('div', 'w', [
      h('div', null, [
        h('h1', 'cd', lignes.map(function (l, i) { return h('span', null, i === lignes.length - 1 ? h('span', 'sur', l) : l); })),
        T.sous ? h('p', 'sous', T.sous) : null,
        h('div', 'cta', [h('a', 'bt bt-a', [ctx.cta, h('span', 'arr', '→')], { href: S.tel ? 'tel:' + S.tel : '#demande' }), h('a', 'bt bt-l', 'Décrire mon besoin', { href: '#demande' })])
      ]),
      h('div', 'ph', ph(0) ? img(ph(0)) : h('div', 'vide cd', initiales(nom)))
    ]), { id: 'haut' }));
    var ch = [];
    if (ctx.note) ch.push([noteFr(ctx.note) + '/5', 'note Google']);
    if (ctx.nbAvis) ch.push([String(ctx.nbAvis), 'avis publiés']);
    if (st) ch.push([st.ouvert ? 'Ouvert' : 'Fermé', st.texte.replace(/^(Ouvert|Fermé),?\s*/, '') || 'en ce moment']);
    if (S.ville || S.commune) ch.push([str(S.ville || S.commune), 'et ses environs']);
    while (ch.length < 4 && ch.length) ch.push([ctx.services[ch.length % 2] ? ctx.services[ch.length % 2].it : nom, 'à votre service']);
    out.push(h('div', 'w', h('div', 'chiffres', ch.slice(0, 4).map(function (c) { return h('div', null, [h('b', 'cd', c[0]), h('span', null, c[1])]); }))));
    // la demande en trois questions : rien ne part, la page prépare le message
    var choix = { quoi: '', quand: '' };
    var recap = h('p', 'recap', '');
    function maj() { recap.textContent = ''; if (!choix.quoi && !choix.quand) {  return; } recap.appendChild(h('b', null, 'Votre demande : ')); recap.appendChild(document.createTextNode([choix.quoi, choix.quand].filter(Boolean).join(', ') + '. ' + (S.tel ? 'Appelez le ' + (S.telAffiche || S.tel) + ' ou écrivez-nous.' : 'Écrivez-nous.'))); }
    function chips(lst, cle) { var z = h('div', 'chips'); lst.forEach(function (x) { var b = h('button', null, x, { type: 'button', 'aria-pressed': 'false' }); b.addEventListener('click', function () { choix[cle] = choix[cle] === x ? '' : x; z.querySelectorAll('button').forEach(function (y) { y.setAttribute('aria-pressed', String(y.textContent === choix[cle])); }); maj(); }); z.appendChild(b); }); return z; }
    var quoi = ctx.services.map(function (sv) { return ((/['’]$/.test(sv.titre) ? sv.titre : sv.titre + ' ') + sv.it).replace(/^(Le|La|Les|Nos|Notre|Votre|Vos)\s+/i, ''); }).concat(['Autre demande']).map(function (t) { return t.charAt(0).toUpperCase() + t.slice(1); });
    out.push(h('section', 'bd clair', h('div', 'w demande', [
      h('div', null, [h('h2', 'cd', ['Votre ', h('span', null, 'demande')]), h('p', null, 'Deux questions, et le message est prêt à partir. La réponse arrive par téléphone ou par e-mail.')]),
      h('div', 'q', [h('div', null, [h('p', 'l', '1 · Pour'), chips(quoi, 'quoi')]), h('div', null, [h('p', 'l', '2 · Quand'), chips(['Cette semaine', 'Ce mois-ci', 'Pas pressé'], 'quand')]), recap, h('div', 'cta', { style: 'margin:0' }, [lienTel(S, 'bt bt-a', 'Appeler'), h('a', 'bt bt-l', 'Écrire', { href: '#ecrire', style: 'box-shadow:inset 0 0 0 2px var(--f)' })])])
    ]), { id: 'demande' }));
    out.push(h('section', 'bd clair', h('div', 'w', [
      h('h2', 'cd', ['Comment ', h('span', null, 'ça se passe')]),
      h('ol', 'etapes', [['Le contact', 'Par téléphone, sur place ou par le formulaire.'], ['Le diagnostic', 'On regarde ensemble ce qu’il faut faire.'], ['Le devis', 'Le prix est annoncé avant toute intervention.'], ['L’intervention', ctx.services[0] ? ctx.services[0].texte.split(/[.!]/)[0] + '.' : 'Dans les délais annoncés.']].map(function (e) { return h('li', null, [h('b', null, e[0]), h('span', null, e[1])]); }))
    ]), { style: 'padding-top:0' }));
    if (ctx.photos.length > 2) out.push(h('section', 'bd', h('div', 'w', [h('h2', 'cd', ['Sur ', h('span', null, 'place')]), h('div', 'gal' + (ctx.photos.length < 5 ? ' n3' : ''), ctx.photos.slice(0, ctx.photos.length < 5 ? 3 : 5).map(function (q, i) { return h('figure', null, img(q, 'Photo ' + (i + 1))); }))])));
    if (ctx.horaires) {
      var deb = 360, fin = 1260, pct = function (m) { return Math.max(0, Math.min(100, (m - deb) / (fin - deb) * 100)); };
      out.push(h('section', 'bd', h('div', 'w', [
        h('h2', 'cd', ['Les ', h('span', null, 'horaires')]),
        h('div', 'frise', [h('div', 'echelle mono', [h('span'), h('div', null, ['6h', '9h', '12h', '15h', '18h', '21h'].map(function (x) { return h('span', null, x); })), h('span')])].concat(ctx.horaires.map(function (x, i) {
          return h('div', 'fl' + (x ? '' : ' off') + (i === auj ? ' auj' : ''), [h('b', null, JOURS[i]), h('div', 'barre', plages(x).map(function (p) { return h('i', null, null, { style: 'left:' + pct(p[0]) + '%;width:' + (pct(p[1]) - pct(p[0])) + '%' }); })), h('span', 'mono', x || 'Fermé')]);
        })))
      ]), { id: 'horaires' }));
    }
    if (ctx.avis.length) out.push(h('section', 'bd clair', h('div', 'w', [h('h2', 'cd', ['Ce qu’en disent ', h('span', null, 'nos clients')]), h('div', 'avis', ctx.avis.map(function (a) { return h('div', 'av', [h('div', null, [h('b', null, a.auteur), h('i', null, etoiles(a.note))]), h('p', null, a.texte)]); }))])));
    out.push(h('section', null, h('div', 'zone', [h('div', 'carte', plan(ctx.seed, rueDe(S))), h('div', 'acc', [h('h2', 'cd', ['Nous ', h('span', null, 'trouver')]), h('p', null, ctx.adr.join(', ')), lienTel(S, 'tel'), h('div', 'cta', { style: 'margin:0' }, [h('a', 'bt bt-a', 'Itinéraire ↗', { href: ctx.itin, target: '_blank', rel: 'noopener' })])])]), { id: 'contact' }));
    out.push(h('section', 'bd clair', h('div', 'w demande', [h('h2', 'cd', ['Nous ', h('span', null, 'écrire')]), formulaire(ctx, 'Votre demande (véhicule, travaux, délai)')]), { id: 'ecrire' }));
    out.push(h('footer', 'w', ctx.fin()));
    return out;
  }

  /* ================= CABINET ================= */
  function cabinet(ctx) {
    var S = ctx.S, T = ctx.T, nom = ctx.nom, ph = ctx.ph, out = [], H = ctx.horaires, auj = aujIndex();
    out.push(h('header', 'hd', h('div', 'w', [
      h('a', 'mq', [ctx.logo ? h('img', null, null, { src: ctx.logo, alt: '' }) : h('i', null, initiales(nom)), nom], { href: '#haut' }),
      h('nav', 'nv', [h('a', null, 'Rendez-vous', { href: '#rdv' }), h('a', null, 'Prises en charge', { href: '#soins' }), h('a', null, 'Avant de venir', { href: '#avant' }), h('a', null, 'Accès', { href: '#lieu' })]),
      h('a', 'bt bt-a', 'Prendre rendez-vous', { href: '#rdv', style: 'min-height:44px' })
    ])));
    var ville = str(S.ville || S.commune);
    out.push(h('section', 'hero', h('div', 'w', [
      h('div', null, [h('p', 'kick', [h('i'), [str(S.activite), ville].filter(Boolean).join(' · ')]), h('h1', 'nr', [ctx.h1.slice(0, 2).filter(Boolean).join(' ') + ' ', em(ctx.h1[2])]), T.sous ? h('p', 'sous', T.sous) : null, h('div', 'cta', [h('a', 'bt bt-a', [ctx.cta, h('span', 'arr', '→')], { href: '#rdv' }), lienTel(S, 'bt bt-l')])]),
      h('div', 'arche', ph(0) ? img(ph(0)) : [h('span', 'rond'), h('span', 'rond2'), h('span', 'ini', initiales(nom))])
    ]), { id: 'haut' }));
    // rendez-vous : un jour, ses horaires, le moyen de réserver
    var pan = h('div', 'pan'), cr = h('div', 'creneaux');
    function jour(i) { cr.textContent = ''; cr.appendChild(h('p', null, [h('b', null, JOURS[i] + ' : '), H[i] || 'fermé'])); cr.appendChild(h('p', null, 'Réservation par téléphone ou par le formulaire, en précisant le motif.')); var t = lienTel(S, 'tel'); if (t) cr.appendChild(t); }
    if (H) {
      var js = h('div', 'jours');
      JOURS.forEach(function (j, i) { var b = h('button', null, [j.slice(0, 3) + '.', h('b', null, H[i] ? plages(H[i]).length ? hm(plages(H[i])[0][0]) : '·' : '–')], { type: 'button', 'aria-pressed': String(i === auj && !!H[i]), disabled: H[i] ? null : 'disabled' }); b.addEventListener('click', function () { js.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); jour(i); }); js.appendChild(b); });
      pan.appendChild(js); var premier = H[auj] ? auj : H.findIndex(function (x) { return x; }); jour(premier < 0 ? 0 : premier); if (premier >= 0) js.children[premier].setAttribute('aria-pressed', 'true');
    } else { cr.appendChild(h('p', null, 'Les horaires seront précisés ici.')); var t2 = lienTel(S, 'tel'); if (t2) cr.appendChild(t2); }
    pan.appendChild(cr);
    out.push(h('section', 'bd blanc', h('div', 'w rdv', [h('div', null, [h('h2', 'nr', ['Prendre ', em('rendez-vous')]), h('p', null, H ? resumeHoraires(H) : 'Par téléphone ou par le formulaire.')]), pan]), { id: 'rdv' }));
    out.push(h('section', 'bd', h('div', 'w', [h('h2', 'nr', ctx.titre(T.servicesTitre, 'Nos', 'prises en charge')), h('div', 'soins', ctx.services.map(function (sv) { return h('article', 'soin', [sv.tag ? h('span', 'tag', sv.tag) : null, h('h3', null, ti(sv)), h('p', null, sv.texte)]); }))]), { id: 'soins' }));
    var pr = T.presentation || {};
    out.push(h('section', 'bd blanc', h('div', 'w', [h('h2', 'nr', ['Avant de ', em('venir')]), h('div', 'avant', (pr.faits || []).slice(0, 3).map(function (f, i) { var d = h('details', null, [h('summary', null, f.t), h('p', null, f.d)]); if (!i) d.open = true; return d; }).concat(ctx.adr.length ? [h('details', null, [h('summary', null, 'Adresse'), h('p', null, ctx.adr.join(', '))])] : []))]), { id: 'avant' }));
    if (ctx.avis.length) out.push(h('section', 'bd', h('div', 'w', [h('h2', 'nr', ['Ce que disent ', em('les patients')]), h('div', 'cit', ctx.avis.slice(0, 2).map(function (a) { return h('figure', null, [h('blockquote', null, '« ' + a.texte + ' »'), h('footer', null, a.auteur + ', avis Google')]); }))])));
    out.push(h('section', 'bd blanc', h('div', 'w', [h('h2', 'nr', ctx.titre(T.appel, 'Accès au', 'cabinet')), h('div', 'lieu', [h('div', 'carte', plan(ctx.seed, rueDe(S))), h('div', null, [h('p', { style: 'font-size:1.2rem;margin-bottom:14px' }, ctx.adr.join(', ')), formulaire(ctx, 'Motif de votre demande')])])]), { id: 'lieu' }));
    out.push(h('footer', 'w', ctx.fin()));
    return out;
  }

  /* ================= VITRINE ================= */
  function vitrine(ctx) {
    var S = ctx.S, T = ctx.T, nom = ctx.nom, ph = ctx.ph, out = [], st = statut(ctx.horaires), auj = aujIndex();
    out.push(h('header', 'hd', h('div', 'w', [h('a', 'mq', [ctx.logo ? h('img', null, null, { src: ctx.logo, alt: '' }) : null, nom], { href: '#haut' }), h('nav', 'nv', [h('a', null, ctx.services[0] ? ctx.services[0].it : 'Services', { href: '#offre' }), ctx.avis.length ? h('a', null, 'Avis', { href: '#avis' }) : null, h('a', null, 'Infos', { href: '#infos' })])])));
    var mos = h('div', 'mos', ctx.photos.length ? ctx.photos.slice(0, 3).map(function (q) { return h('figure', null, img(q)); }) : [h('figure', 'vide', initiales(nom))]);
    out.push(h('section', 'hero', h('div', 'w', [
      h('div', 'bloc', [st ? h('span', 'sticker' + (st.ouvert ? '' : ' off'), [h('i'), st.texte]) : null, h('h1', 'ub' + (Math.max.apply(null, ctx.h1.join(' ').split(/\s+/).map(function (w) { return w.length; })) > 9 ? ' long' : ''), ctx.h1.filter(Boolean).map(function (l) { return h('span', null, l); })), h('div', null, [T.sous ? h('p', 'sous', T.sous) : null, h('div', 'cta', { style: 'margin-top:20px' }, [h('a', 'bt bt-l', [ctx.cta, h('span', 'arr', '→')], { href: S.tel ? 'tel:' + S.tel : '#infos' })])])]),
      mos
    ]), { id: 'haut' }));
    out.push(h('section', 'bd', h('div', 'w', [h('h2', 'ub', ctx.titre(T.servicesTitre, 'Chez', 'nous')), h('div', 'cats', ctx.services.map(function (sv) { return h('a', 'cat', [h('div', null, [h('h3', null, ti(sv).map(function (x) { return typeof x === 'string' ? x : x.textContent; }).join('')), sv.tag ? h('p', { style: 'margin-top:10px' }, sv.tag) : null]), h('p', null, sv.texte), h('span', 'go', (sv.cta || 'Nous contacter') + ' →')], { href: '#infos' }); }))]), { id: 'offre' }));
    if (ctx.avis.length) { var rang = h('div', 'rang'); for (var k = 0; k < 2; k++) ctx.avis.forEach(function (a) { rang.appendChild(h('figure', 'bulle', [h('p', null, a.texte), h('footer', null, [h('b', null, a.auteur), h('i', null, etoiles(a.note))])])); }); out.push(h('section', 'defile', [h('div', 'w dh', [h('h2', 'ub', { style: 'margin:0' }, ['Ils sont passés']), ctx.note ? h('p', 'n', noteFr(ctx.note)) : null]), rang], { id: 'avis' })); }
    var H = ctx.horaires;
    out.push(h('section', 'bd', h('div', 'w', [h('h2', 'ub', ctx.titre(T.appel, 'Passer', 'nous voir')), h('div', 'infos', [
      h('div', 'tuile carte', [plan(ctx.seed, ''), h('h3', null, ctx.adr[0] || nom), h('p', null, ctx.adr.slice(1).join(' ')), h('a', 'bt bt-a', 'Itinéraire ↗', { href: ctx.itin, target: '_blank', rel: 'noopener', style: 'justify-self:start' })]),
      h('div', 'tuile', [h('h3', null, 'Horaires'), H ? H.map(function (x, i) { return h('div', 'hr' + (x ? '' : ' off') + (i === auj ? ' auj' : ''), [h('span', null, JOURS[i]), h('span', null, x || 'Fermé')]); }) : h('p', null, 'À préciser'), lienTel(S, 'bt bt-l', 'Appeler')]),
      h('div', 'tuile', [h('h3', null, 'Nous écrire'), formulaire(ctx)])
    ])]), { id: 'infos' }));
    out.push(h('footer', 'w', ctx.fin()));
    return out;
  }

  var DIRECTIONS = { atelier: atelier, table: table, chantier: chantier, cabinet: cabinet, vitrine: vitrine };

  /* ---------- point d'entrée ---------- */
  function rendre(el, D, o) {
    o = o || {};
    feuille();
    var S = D.site || {}, T = D.textes || {}, ST = D.style || {}, dir = o.direction || direction({ style: ST, activite: D.activite, site: S });
    polices(dir);
    var nom = str(S.nom) || 'Votre établissement', seed = hash(str(D.id) + nom);
    var variante = o.variante != null ? o.variante : (ST.variante != null ? ST.variante : seed % 2);
    var photos = (S.photos || []).filter(function (p) { return p && p.url; });
    var note = Number(S.note) >= 4 && Number(S.nbAvis) >= 5 ? Number(S.note) : 0;
    var toastEl = h('div', 'toast', null, { role: 'status' }), tt;
    var ctx = {
      id: str(D.id) || 'x', S: S, T: T, nom: nom, seed: seed, photos: photos, logo: ST.logo || null,
      ph: function (i) { return photos.length ? photos[i % photos.length] : null; },
      h1: (T.h1 && T.h1.length ? T.h1 : [S.activite || nom, '', S.ville ? 'à ' + S.ville : '']).map(str),
      cta: str(T.cta) || (S.tel ? 'Nous appeler' : 'Nous écrire'),
      ruban: (T.ruban && T.ruban.length ? T.ruban : [S.activite, S.ville, nom]).map(str).filter(Boolean),
      services: (T.services || []).slice(0, 2).map(function (x) { return { titre: str(x.titre), it: str(x.it), tag: str(x.tag), texte: str(x.texte), cta: str(x.cta) }; }),
      avis: avisRetenus(S, 3), note: note, nbAvis: Number(S.nbAvis) || 0,
      horaires: Array.isArray(S.horaires) && S.horaires.length === 7 && S.horaires.some(Boolean) ? S.horaires : null,
      adr: adresse(S), itin: itineraire(S, nom),
      titre: function (p, a, b) { return [str(p && p[0]) || a, ' ', em(str(p && p[1]) || b)]; },
      toast: function (t) { toastEl.textContent = t; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('on'); }, 3200); },
      fin: function () { return h('div', 'fin', [h('span', null, '© ' + new Date().getFullYear() + ' ' + nom), h('span', null, 'Avis et photos : Google'), h('span', null, ['Site réalisé par ', h('a', null, 'Studio ES', { href: 'https://studioes.fr', target: '_blank', rel: 'noopener' })])]); }
    };
    el.textContent = '';
    el.className = 'ap ap-' + dir + ' v' + variante;
    couleurs(el, ST);
    DIRECTIONS[dir](ctx).forEach(function (x) { el.appendChild(x); });
    el.appendChild(toastEl);
    if (o.commande !== false) {
      var exp = D.expire ? dateFr(D.expire) : '';
      el.appendChild(h('aside', 'es', [h('p', null, [h('b', null, 'Aperçu préparé par Studio ES' + (exp ? ', visible jusqu’au ' + exp : '')), h('span', null, 'Ce site en ligne sous 10 jours : 490 €, en une fois ou en plusieurs.')]), h('a', null, 'Le commander →', { href: o.commande || 'https://studioes.fr/metiers/sites-et-outils/#web', target: '_blank', rel: 'noopener' })], { 'aria-label': 'Studio ES' }));
    }
    // visionneuse simple pour les galeries qui l'utilisent
    el.querySelectorAll('[data-lb]').forEach(function (b) { b.addEventListener('click', function () { var p = photos[+b.dataset.lb]; if (p) ctx.toast(p.credit ? 'Photo : ' + p.credit + ', via Google' : 'Photo via Google'); }); });
    return { direction: dir, variante: variante };
  }

  window.ApercuMoteur = { rendre: rendre, direction: direction };
})();
