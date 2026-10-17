/* Studio ES, refonte 2026 (v4). Code sans dépendance. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const BASE = '/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const store = {get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ico = id => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
const preload = u => { const i = new Image(); i.decoding = 'async'; i.src = u; return i; };
const anim = (el, kf, o) => el.animate ? el.animate(kf, Object.assign({fill: 'forwards', easing: 'cubic-bezier(.16,1,.3,1)'}, o)) : null;
const IOE = 'cubic-bezier(.76,0,.24,1)';
const root = document.documentElement;

/* ---------- Images : apparition douce une fois chargées ---------- */
document.addEventListener('load', e => { const t = e.target; if (t && t.tagName === 'IMG') t.classList.add('ld'); }, true);
const markLoaded = root => $$('img', root).forEach(i => { if (i.complete && i.naturalWidth) i.classList.add('ld'); });

/* ---------- Données ---------- */
const FMAP = {}; REPS.forEach(r => r.ph.forEach(p => { FMAP[p[0]] = [r, p]; }));
const big = (r, f) => BASE + (r.old ? 'images/' : 'p/') + f + '.jpg';
const sm = (r, f) => BASE + (r.old ? 'images/t/' : 'p/t/') + f + '.webp';
const bigF = f => big(FMAP[f][0], f), smF = f => sm(FMAP[f][0], f);
const byId = id => REPS.find(r => r.id === id);
const PHR = REPS.filter(r => r.k !== 'g'), GRR = REPS.filter(r => r.k === 'g');
const isEnt = r => r.id.startsWith('fl-auto'), isCol = r => r.k === 'corp' && !isEnt(r);
const CAT = r => r.k === 'scene' ? 'Concert' : r.k === 'public' ? 'Festival' : r.k === 'g' ? 'Graphisme' : isEnt(r) ? 'Entreprise' : 'Collectivité';
P.autre = {t: 'Autre projet', n: [SITE, OUTIL, SUP, RS, COM()]};
const PROFS = [['culture', 'Lieu culturel, festival', 'Concerts, saisons, festivals'], ['collectivite', 'Collectivité', 'Commune, intercommunalité'], ['entreprise', 'Entreprise', 'Commerce, PME, lieu'], ['club', 'Club, association', 'Sport, culture, loisirs'], ['particulier', 'Particulier', 'Mariage, projet perso'], ['autre', 'Autre projet', 'Site, outil, application']];
const WHO = [['culture', 'Culture'], ['collectivite', 'Collectivité'], ['entreprise', 'Entreprise'], ['club', 'Club, asso'], ['particulier', 'Particulier']];
const HERO_OF = {culture: 'festival', collectivite: 'collectivite', entreprise: 'entreprise', club: 'club', particulier: 'mariage'};

/* ---------- État ---------- */
const st = {p: null, tab: 'all'};
{ const s = store.get('ses5'); if (s && P[s]) st.p = s; }
const seen = new Set((store.get('ses5-seen') || '').split(',').filter(Boolean));
let toastT = 0;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2200); }

/* ---------- Focus : on entre dans chaque fenêtre et on revient d'où l'on vient ---------- */
const FOC = [];
function focusIn(el, sel) { FOC.push(document.activeElement); setTimeout(() => { const f = $(sel || 'button,a,input,[tabindex]', el); if (f) f.focus({preventScroll: true}); }, 60); }
function focusBack() { const f = FOC.pop(); if (f && f.focus) f.focus({preventScroll: true}); }

/* ---------- Ancres ---------- */
function goTo(el) { if (!el) return; window.scrollTo({top: el.getBoundingClientRect().top + scrollY - (el.id === 'accueil' ? 0 : 20), behavior: RM ? 'auto' : 'smooth'}); }
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const t = $(a.getAttribute('href')); if (!t) return;
  e.preventDefault(); closeSheets(); closeSV(); closePF(); goTo(t);
});
$$('[data-open-pf]').forEach(b => b.addEventListener('click', () => openPF(b.id === 'feedMore' ? (PFMAP[st.tab] || 'all') : 'all')));

/* ================= ACCUEIL : une photo par artiste, fondu rapide ================= */
const HERO = ['la-fouine-3', 'philippe-katerine-4', 'matmatah-10', 'danakil-4', 'franglish-5', 'genezio-3', 'fatal-bazooka-1', 'gael-faye-5'];
const por = $('#por'), amb = $('#amb'), dots = $('#hDots');
const H = {i: 0, busy: false, t0: 0, el: 0, dur: 5200, cur: $('#pImg')};
dots.innerHTML = HERO.map(() => '<s><i></i></s>').join('');
function heroMeta() {
  const f = HERO[H.i], r = FMAP[f][0];
  $('#hT').textContent = r.t; $('#hK').textContent = CAT(r); $('#hTh').src = smF(f);
  $$('s', dots).forEach((s, j) => { s.classList.toggle('dn', j < H.i); $('i', s).style.transform = j < H.i ? 'scaleX(1)' : 'scaleX(0)'; });
}
function heroGo(i) {
  if (H.busy) return; H.busy = true;
  const u = bigF(HERO[i]), im = preload(u);
  const run = () => {
    H.i = i; heroMeta(); H.el = 0; H.t0 = performance.now();
    const old = H.cur, nx = document.createElement('img'); nx.className = 'nx'; nx.alt = ''; nx.src = u; por.appendChild(nx); H.cur = nx;
    amb.style.backgroundImage = `url(${smF(HERO[i])})`;
    requestAnimationFrame(() => requestAnimationFrame(() => nx.classList.add('in')));
    setTimeout(() => { old.remove(); nx.className = ''; H.busy = false; }, RM ? 0 : 600);
    preload(bigF(HERO[(i + 1) % HERO.length]));
  };
  im.complete ? run() : (im.onload = run, im.onerror = () => { H.busy = false; });
}
let heroVis = true;
new IntersectionObserver(es => { heroVis = es[0].isIntersecting; }).observe($('#accueil'));
(function loop(now) {
  if (!H.t0) H.t0 = now;
  if (H.busy || !heroVis || document.hidden) H.t0 = now - H.el;
  H.el = now - H.t0;
  const p = clamp(H.el / H.dur, 0, 1), bar = $$('s i', dots)[H.i];
  if (bar) bar.style.transform = `scaleX(${p})`;
  if (p >= 1 && !H.busy) heroGo((H.i + 1) % HERO.length);
  requestAnimationFrame(loop);
})(performance.now());
H.cur.src = bigF(HERO[0]); amb.style.backgroundImage = `url(${smF(HERO[0])})`; heroMeta(); preload(bigF(HERO[1]));
const startUp = () => { if (document.body.classList.contains('go')) return; document.body.classList.add('go'); if (!RM) anim(H.cur, [{opacity: 0}, {opacity: 1}], {duration: 900, easing: 'ease-out'}); };
H.cur.complete ? requestAnimationFrame(startUp) : (H.cur.onload = startUp, setTimeout(startUp, 2200));
$('#hCard').onclick = () => { const r = FMAP[HERO[H.i]][0]; openSV(SCENE, SCENE.indexOf(r), r.ph.findIndex(p => p[0] === HERO[H.i])); };

/* ================= LE TRAVAIL : stories + onglets par cible + grille ================= */
/* notoriété des artistes : les plus connus en premier */
const POP = ['philippe-katerine', 'matmatah', 'fatal-bazooka', 'la-fouine', 'gael-faye', 'rimk', 'danakil', 'axel-bauer', 'the-avener', 'synapson', 'bakermat', 'les-sheriff', 'biga-ranx', 'mentissa', 'bekar', 'kemmler', 'ramoneurs', 'dali', 'helena', 'franglish', 'genezio', 'sara-lugo', 'jahneration', 'feder', 'bushi', 'radio-byzance', 'aupinard', 'candeur-cyclone', 'perceval', 'starfish', 'atipycs'];
const rank = r => { const i = POP.indexOf(r.id); return i < 0 ? 99 : i; };
const SCENE = PHR.filter(r => r.k === 'scene').sort((a, b) => rank(a) - rank(b));
const PUB = PHR.filter(r => r.k === 'public'), COL = PHR.filter(isCol), ENT = PHR.filter(isEnt);
let ORD = [];
const GPREF = ['soute', 'identites', 'marelle', 'campagnes', 'signaletique', 'ellipse', 'recrutement', 'affiches', 'atrium', 'festin', 'editions', 'budget'];
const GORD = GRR.slice().sort((a, b) => GPREF.indexOf(a.id) - GPREF.indexOf(b.id));
const FORUM = byId('forum-asso'), INAUG = byId('inauguration'), VOEUX = byId('voeux-ph'), COMM = byId('commemo');
/* [clé, libellé, reportages photo (stories et grille, dans l'ordre), projets graphiques] */
const TABS = [
  ['culture', 'Concerts et festivals', () => [...SCENE.slice(0, 5), PUB[0], ...SCENE.slice(5, 11), PUB[1], ...SCENE.slice(11), PUB[2]], ['soute', 'marelle', 'ellipse', 'atrium']],
  ['collectivite', 'Collectivités', () => [INAUG, FORUM, VOEUX, COMM, ...PUB], ['signaletique', 'campagnes', 'recrutement', 'budget']],
  ['entreprise', 'Entreprises', () => [...ENT, INAUG, VOEUX], ['identites', 'recrutement', 'signaletique', 'campagnes']],
  ['club', 'Clubs et assos', () => [FORUM, ...PUB], ['identites', 'affiches', 'festin', 'campagnes']],
  ['particulier', 'Particuliers', () => [...PUB], ['identites', 'affiches']],
  ['web', 'Sites et outils', () => [], []]
];
const PFMAP = {culture: 'scene', collectivite: 'col', entreprise: 'ent', club: 'public', particulier: 'photo'};
const stories = $('#stories');
function renderStories() {
  stories.style.display = ORD.length ? '' : 'none';
  stories.innerHTML = ORD.map((r, i) => `<button class="sto${seen.has(r.id) ? ' seen' : ''}" data-i="${i}" style="transition-delay:${Math.min(i, 12) * 30}ms"><span class="ring"><span><img src="${sm(r, r.ph[0][0])}" alt="" loading="lazy"></span></span><b>${esc(r.t)}</b></button>`).join('');
  stories.scrollLeft = 0; markLoaded(stories); edge(stories);
}
stories.addEventListener('click', e => { const b = e.target.closest('.sto'); if (b) openSV(ORD, +b.dataset.i, 0); });

const SZ = {L: [6, 4, 6, 2, 2], M: [3, 2, 3, 1, 1], W: [6, 2, 6, 2, 1]};
const sz = s => { const z = SZ[s]; return `--cw:${z[0]};--ch:${z[1]};--tw:${z[2]};--mw:${z[3]};--mh:${z[4]}`; };
function cardRep(r, s, list) {
  const f = r.ph.find(p => s === 'W' ? p[1] > 1.2 : p[1] < 1.2) || r.ph[0];
  return `<button class="c ph" data-r="${r.id}" data-l="${list}" data-sz="${s}" style="${sz(s)}"><img class="bgi" src="${sm(r, f[0])}" alt="" loading="lazy" decoding="async"><span class="bars">${r.ph.slice(0, 5).map(() => '<s><i></i></s>').join('')}</span><span class="chip glass"><i></i>${CAT(r)}</span><span class="chip glass cnt">${r.ph.length}${r.k === 'g' ? ' visuels' : ' photos'}</span><span class="bot"><h3>${esc(r.t)}</h3><span class="ic">${ico('ne')}</span></span></button>`;
}
const TX = (ic, t, p, cfg) => `<button class="c k-tx" data-cfg="${cfg || ''}" style="${sz('M')}">${ico(ic).replace('<svg', '<svg class="big"')}<span><h3>${t}</h3><p>${p}</p></span></button>`;
const feed = $('#feed');
const LAY = ['L', 'M', 'M', 'M', 'M', 'W', 'M', 'M'];
function renderFeed() {
  const T = TABS.find(t => t[0] === st.tab); let h = '';
  ORD = T[2]().filter(Boolean); renderStories();
  if (st.tab === 'web') h = CASES.map(c => `<a class="c ph k-site" href="${c.url}" style="${sz('L')}"><img class="bgi" src="${c.img}" alt="" loading="lazy"><span class="chip glass"><i></i>${c.k}</span><span class="bot"><h3>${c.t}</h3><span class="ic">${ico('ne')}</span></span></a>`).join('');
  else {
    const ph = T[2]().filter(Boolean), gr = T[3].map(byId).filter(Boolean), items = [];
    ph.forEach(r => items.push([r, 'p'])); gr.forEach(r => items.push([r, 'g']));
    /* on alterne : 5 photos, puis le graphisme glissé dans la grille */
    const mix = [...items.filter(x => x[1] === 'p').slice(0, 5), items.find(x => x[1] === 'g'), ...items.filter(x => x[1] === 'p').slice(5), ...items.filter(x => x[1] === 'g').slice(1)].filter(Boolean).slice(0, 8);
    h = mix.map((x, i) => cardRep(x[0], LAY[i], x[1])).join('');
  }
  feed.innerHTML = h; markLoaded(feed);
  $$('.c', feed).forEach((c, i) => { c.style.transitionDelay = (i % 4) * 60 + 'ms'; io.observe(c); });
  $$('.c[data-r]', feed).forEach(bindCard);
  $$('.c[data-cfg]', feed).forEach(c => c.onclick = () => openCfg({p: c.dataset.cfg}));
  $('#feedMore').style.display = st.tab === 'web' ? 'none' : '';
}
function bindCard(c) {
  const r = byId(c.dataset.r), list = c.dataset.l === 'g' ? GORD : ORD, img = $('.bgi', c), bars = $$('.bars s i', c), n = bars.length;
  c.onclick = () => openSV(list, list.indexOf(r), 0);
  if (!FINE) return;
  let raf = 0, t0 = 0, idx = 0; const orig = img.src, frames = r.ph.slice(0, n).map(p => sm(r, p[0]));
  const step = now => { const p = (now - t0) / 1100; if (p >= 1) { idx = (idx + 1) % n; t0 = now; img.src = frames[idx]; bars.forEach((b, j) => b.style.transform = `scaleX(${j < idx ? 1 : 0})`); } bars[idx].style.transform = `scaleX(${clamp(p, 0, 1)})`; raf = requestAnimationFrame(step); };
  c.addEventListener('pointerenter', () => { frames.forEach(preload); c.classList.add('play'); idx = 0; t0 = performance.now(); raf = requestAnimationFrame(step); });
  c.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); c.classList.remove('play'); bars.forEach(b => b.style.transform = ''); img.src = orig; });
}
const tabs = $('#tabs'), ink = $('#ink');
tabs.insertAdjacentHTML('beforeend', TABS.map(([k, l]) => `<button role="tab" data-k="${k}">${l}</button>`).join(''));
st.tab = st.p && TABS.some(t => t[0] === st.p) ? st.p : 'culture';
function moveInk() { const b = $(`button[data-k="${st.tab}"]`, tabs); if (!b) return; ink.style.width = b.offsetWidth + 'px'; ink.style.transform = `translateX(${b.offsetLeft - 5}px)`; ink.style.left = '5px'; $$('button', tabs).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); tabs.scrollTo({left: b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2, behavior: 'smooth'}); }
tabs.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b || b.dataset.k === st.tab) return; st.tab = b.dataset.k; if (P[st.tab]) { st.p = st.tab; store.set('ses5', st.p); plImg(); } moveInk(); renderFeed(); });

/* rangées défilantes : glisser à la souris, fondu de bord tant qu'il reste du contenu */
function edge(el) { el.classList.toggle('end', el.scrollLeft + el.clientWidth >= el.scrollWidth - 4); }
function dragScroll(el) {
  let down = false, x0 = 0, s0 = 0, moved = 0;
  el.addEventListener('scroll', () => edge(el), {passive: true});
  el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; x0 = e.clientX; s0 = el.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const d = e.clientX - x0; moved = Math.max(moved, Math.abs(d)); if (moved > 5) { el.classList.add('drag'); el.scrollLeft = s0 - d; } });
  addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => el.classList.remove('drag'), 0); });
  el.addEventListener('click', e => { if (moved > 5) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
  edge(el);
}
dragScroll(stories); dragScroll(tabs);

/* ================= PORTFOLIO PLEIN ÉCRAN ================= */
const CASES = [{id: 'la-soute', t: 'La Soute', k: 'Identité et site', q: 'la soute salle de spectacle concert saison brochure affiche identite site internet web billetterie', url: '/projets/la-soute/', img: '/projets/la-soute/img/cover.webp', ar: 1.43}, {id: 'pierceval-tattoo', t: 'Pierceval Tattoo', k: 'Site internet', q: 'pierceval tattoo tatouage piercing site internet web scaer', url: '/projets/pierceval-tattoo/', img: '/projets/pierceval-tattoo/img/cover.webp', ar: 1.43}];
const SEAS = ['soute', 'ellipse', 'marelle', 'atrium'], CAMP = ['campagnes', 'recrutement', 'budget', 'festin', 'affiches'];
const CH = [
  ['all', 'Tout', () => true], ['photo', 'Photographie', r => r.k !== 'g'], ['scene', 'Concerts', r => r.k === 'scene'], ['public', 'Festivals', r => r.k === 'public'],
  ['col', 'Collectivités', isCol], ['ent', 'Entreprises', isEnt], ['graph', 'Graphisme', r => r.k === 'g'], ['seas', 'Saisons culturelles', r => SEAS.includes(r.id)],
  ['id', 'Identités', r => r.id === 'identites'], ['camp', 'Campagnes', r => CAMP.includes(r.id)], ['sig', 'Signalétique', r => r.id === 'signaletique'], ['ed', 'Éditions', r => r.id === 'editions'], ['web', 'Web', () => false]
];
const pf = $('#pf'), pfG = $('#pfG'), pfQ = $('#pfQ'), pfC = $('#pfC');
const PF = {c: 'all', q: '', list: []};
const caseIn = c => c === 'all' || c === 'web';
pfC.innerHTML = CH.map(([k, l, f]) => `<button data-c="${k}">${l}<em>${REPS.filter(f).length + (caseIn(k) ? CASES.length : 0)}</em></button>`).join('');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function pfRender() {
  const f = CH.find(c => c[0] === PF.c)[2], q = norm(PF.q.trim());
  PF.list = REPS.filter(r => f(r) && (!q || norm(r.t + ' ' + CAT(r) + ' ' + r.ph.map(p => p[2] || '').join(' ')).includes(q)));
  $$('button', pfC).forEach(b => b.classList.toggle('on', b.dataset.c === PF.c));
  const cs = caseIn(PF.c) ? CASES.filter(c => !q || norm(c.t + ' ' + c.q).includes(q)) : [];
  $('#pfN').textContent = PF.list.length + cs.length;
  setTimeout(() => markLoaded(pfG), 0);
  pfG.innerHTML = PF.list.length + cs.length ? cs.map(c => `<a class="pc" href="${c.url}"><img src="${c.img}" alt="" loading="lazy" style="aspect-ratio:${c.ar}"><span class="chip glass"><i></i>${c.k}</span><span class="ti"><b>${esc(c.t)}</b><span>Étude de cas</span></span></a>`).join('') + PF.list.map((r, i) => { const p = r.ph[0]; return `<button class="pc" data-i="${i}" style="animation-delay:${Math.min(i, 16) * 35}ms"><img src="${sm(r, p[0])}" alt="" loading="lazy" style="aspect-ratio:${p[1]}"><span class="chip glass"><i></i>${CAT(r)}</span><span class="ti"><b>${esc(r.t)}</b><span>${r.ph.length}</span></span></button>`; }).join('') : '<p class="pf-empty">Aucun résultat. Essayez un autre mot.</p>';
}
pfC.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; PF.c = b.dataset.c; pfRender(); b.scrollIntoView({inline: 'nearest', block: 'nearest', behavior: 'smooth'}); });
pfQ.addEventListener('input', () => { PF.q = pfQ.value; pfRender(); });
pfG.addEventListener('click', e => { const b = e.target.closest('.pc'); if (b) openSV(PF.list, +b.dataset.i, 0); });
function openPF(c) { PF.c = c || 'all'; pfRender(); pf.classList.add('on'); pf.scrollTop = 0; root.style.overflow = 'hidden'; dockOff(true); focusIn(pf, '#pfX'); }
function closePF() { if (!pf.classList.contains('on')) return; pf.classList.remove('on'); root.style.overflow = ''; dockOff(false); focusBack(); }
$('#pfX').onclick = closePF;

/* ================= PLAN LARGE : trois paliers, une image qui s'élargit ================= */
const off = $('#offre'), plS = $('#plS'), plV = $('#plV');
const PL = {t: 0, auto: true, t0: 0, DUR: 5200, vis: false};
function low(n) { let lo = Infinity, u = ''; n.calc[0].o.forEach(o => { if (o[1] != null && o[1] > 0 && o[1] < lo) { lo = o[1]; u = o[2] || ''; } }); return lo === Infinity ? null : [lo, u]; }
const unitS = u => u ? ' / ' + ({mois: 'mois', an: 'an', saison: 'saison', semaine: 'semaine'}[u]) : '';
function plImg() {
  const ph = P[st.p || 'culture'].ph.filter(f => FMAP[f]), set = (im, u) => { if (im.getAttribute('src') !== u) im.src = u; };
  const [v0, v1, v2] = $$('.v', plV);
  set($('img', v0), bigF(ph[0]));
  const i1 = $$('img', v1); set(i1[0], bigF(ph[1] || ph[0])); set(i1[1], BASE + 's/affiche.webp'); set(i1[2], BASE + 's/site.webp');
  /* photothèque : uniquement des verticales 3:4 ou 4:5, pour ne rien couper */
  const pv = f => { const r = FMAP[f] && FMAP[f][1][1]; return r >= .7 && r <= .85; };
  const k0 = FMAP[ph[0]][0].k, six = [...ph.slice(1).filter(pv)];
  for (const r of REPS) { if (six.length >= 6) break; if (r.k !== k0 && k0 !== 'g') continue; const f = r.ph.map(p => p[0]).find(pv); if (f && !six.includes(f) && f !== ph[0]) six.push(f); }
  $$('img', v2).forEach((im, j) => set(im, smF(six[j % six.length])));
}
function plSnap(t, user) {
  PL.t = t; PL.t0 = performance.now(); PL.el = 0; if (user) PL.auto = false;
  plS.classList.toggle('man', !PL.auto || RM);
  $$('li', plS).forEach((li, j) => { li.classList.toggle('on', j === t); li.classList.toggle('dn', j < t); const b = $('button', li); b.setAttribute('aria-selected', j === t); if (j !== t || !PL.auto) $('s i', li).style.transform = ''; });
  $$('.v', plV).forEach((v, j) => v.classList.toggle('on', j === t));
}
plS.addEventListener('click', e => { const b = e.target.closest('button'); if (b) plSnap(+b.dataset.i, true); });
plS.addEventListener('keydown', e => { const d = {ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1}[e.key]; if (d == null) return; e.preventDefault(); const t = clamp(PL.t + d, 0, 2); plSnap(t, true); $$('button', plS)[t].focus(); });
new IntersectionObserver(es => { PL.vis = es[0].isIntersecting; if (PL.vis) PL.t0 = performance.now() - 0; }, {threshold: .45}).observe(plV);
(function plLoop(now) {
  if (PL.auto && !RM) {
    if (!PL.vis || document.hidden) PL.t0 = now - (PL.el || 0);
    PL.el = now - PL.t0; const p = clamp(PL.el / PL.DUR, 0, 1), li = $$('li', plS)[PL.t];
    if (PL.t < 2) $('s i', li).style.transform = `scaleY(${p})`;
    if (p >= 1) { PL.el = 0; if (PL.t < 2) plSnap(PL.t + 1); else { PL.auto = false; plS.classList.add('man'); } }
  }
  requestAnimationFrame(plLoop);
})(performance.now());
$('#plGo').onclick = () => openCfg({p: st.p || 'culture', pal: PL.t});
plImg(); plSnap(0);

/* ================= CONFIGURATEUR (panier) ================= */
const CF = {step: 0, p: null, n: null, picks: [], basket: []};
try { CF.basket = JSON.parse(store.get('ses5-cart') || '[]'); } catch (e) { CF.basket = []; }
const cfg = $('#cfg');
const STEPS = ['Profil', 'Besoin', 'Formule', 'Récapitulatif'];
const saveCart = () => { store.set('ses5-cart', JSON.stringify(CF.basket)); const n = CF.basket.length; $('#estN').textContent = n; $('#estB').classList.toggle('has', n > 0); };
function openCfg(o = {}) {
  if (o.p) { CF.p = o.p; CF.step = 1; CF.n = null; if (o.pal != null) { const j = P[CF.p].n.findIndex(x => x.pal === o.pal); if (j >= 0) { CF.n = j; initPicks(); CF.step = 2; } } }
  else CF.step = CF.basket.length && o.pal == null ? 3 : 0;
  cfgRender(); openSheet('shE');
}
function initPicks() { CF.picks = P[CF.p].n[CF.n].calc.map(g => g.m ? [] : [0]); }
function lineEst() { return CF.p != null && CF.n != null ? estimate(P[CF.p].n[CF.n].calc, CF.picks) : null; }
function cfgRender() {
  const s = CF.step;
  $('#prog').innerHTML = STEPS.map((t, i) => `<button data-s="${i}" class="${i < s ? 'dn' : i === s ? 'on' : ''}" ${i > s || (i === 3 && !CF.basket.length) ? 'disabled' : ''}><i></i>${t}</button>`).join('');
  let h = '';
  if (s === 0) h = `<div class="stp"><h3 class="d">Vous êtes</h3><div class="opts">${PROFS.map(([k, t, d]) => `<button class="op${CF.p === k ? ' on' : ''}" data-p="${k}">${t}<small>${d}</small></button>`).join('')}</div></div>`;
  if (s === 1) h = `<div class="stp"><h3 class="d">Vous cherchez</h3><div class="opts">${P[CF.p].n.map((x, i) => { const l = low(x); return `<button class="op${CF.n === i ? ' on' : ''}" data-n="${i}">${x.l}<small>${l ? 'dès ' + fmt(rNr(l[0])) + ' €' + unitS(l[1]) : 'sur devis'}</small></button>`; }).join('')}</div></div>`;
  if (s === 2) { const n = P[CF.p].n[CF.n]; h = `<div class="stp"><h3 class="d">${n.l}</h3>${n.calc.map((g, gi) => `<div class="grp"><h4>${g.q}${g.m ? ', au choix' : ''}</h4><div class="chs" data-g="${gi}">${g.o.map((o, oi) => `<button data-o="${oi}" class="${(CF.picks[gi] || []).includes(oi) ? 'on' : ''}">${o[0]}<em>${o[1] == null ? 'sur devis' : o[1] === 0 ? '' : (g.m ? '+' : '') + fmt(rNr(o[1])) + ' €' + unitS(o[2] || '')}</em></button>`).join('')}</div></div>`).join('')}</div>`; }
  if (s === 3) {
    const pub = CF.basket.some(b => b.p === 'collectivite');
    h = `<div class="stp"><h3 class="d">Votre sélection</h3><ul class="bask">${CF.basket.map((b, i) => `<li><span><b>${esc(b.l)}</b><small>${esc(b.labels.join(' · ') || 'Sur devis')}</small></span><span class="pr">${b.lo ? rangeF(b.lo) + unitS(b.unit) : 'Sur devis'}<button class="rm" data-rm="${i}">Retirer</button></span></li>`).join('')}</ul>
      <button class="addb" id="addMore">+ Ajouter un autre besoin</button>
      <p class="note">${pub ? 'Pour une collectivité : paiement après la prestation, sur facture. Le devis peut servir de base au bon de commande.' : 'À la commande : un acompte de 30 % sur la partie ponctuelle. Les formules mensuelles démarrent à une date fixée ensemble.'}</p>
      <form id="cfgForm" style="margin-top:18px" novalidate>
        <div class="two"><label class="fld"><span>Date souhaitée</span><input name="date" type="date"></label><label class="fld"><span>Lieu</span><input name="lieu" placeholder="Ville, salle…"></label></div>
        <div class="two"><label class="fld"><span>Nom, structure</span><input name="name" autocomplete="name" required></label><label class="fld"><span>E-mail</span><input name="email" type="email" autocomplete="email" required></label></div>
        <label class="fld"><span>Téléphone</span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="fld"><span>Précisions</span><textarea name="message" placeholder="Ce qui compte pour vous"></textarea></label>
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
        <p class="fok" id="cfgOk" aria-live="polite"></p>
      </form></div>`;
  }
  cfg.innerHTML = h; cfg.scrollTop = 0; cfgFoot();
}
function totals() { let lo = 0, devis = false; const rec = {}; CF.basket.forEach(b => { if (b.devis) devis = true; if (b.unit) rec[b.unit] = (rec[b.unit] || 0) + b.lo; else lo += b.lo; }); return {lo, hi: up50(lo * 1.2), rec, devis}; }
let shown = 0;
function countTo(el, to) { const from = shown; shown = to; if (RM || !from || from === to) { el.textContent = rangeF(to); return; } const t0 = performance.now(); (function tk(now) { const t = clamp((now - t0) / 600, 0, 1), v = Math.round(lerp(from, to, 1 - Math.pow(1 - t, 4)) / 10) * 10; el.textContent = rangeF(t < 1 ? v : to); if (t < 1) requestAnimationFrame(tk); })(t0); }
function cfgFoot() {
  const s = CF.step, tN = $('#tN'), tK = $('#tK'), tR = $('#tR'), act = $('#cfgAct'), back = `<button class="bt bt-g" data-back>Retour</button>`;
  tR.innerHTML = '';
  if (s < 2) { tK.textContent = CF.basket.length ? 'Votre sélection' : 'Estimation'; const t = totals(); if (CF.basket.length && t.lo) countTo(tN, t.lo); else { tN.textContent = s === 0 ? 'Choisissez' : P[CF.p].t; shown = 0; } act.innerHTML = s === 0 ? (CF.basket.length ? `<button class="bt bt-w" data-goto="3">Voir ma sélection (${CF.basket.length})</button>` : `<a class="bt bt-g" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Plutôt en parler de vive voix</a>`) : back; return; }
  if (s === 2) { const e = lineEst(); tK.textContent = e.unit ? 'Estimation, ' + UNIT[e.unit] : 'Estimation'; if (e.lo) countTo(tN, e.lo); else { tN.textContent = 'Sur devis'; shown = 0; } if (e.devis && e.lo) tR.innerHTML = '<small>plus une partie</small><b>sur devis</b>'; act.innerHTML = back + `<button class="bt bt-a" data-add>Ajouter au devis${ico('a')}</button>`; return; }
  const t = totals(), recs = Object.entries(t.rec);
  if (t.lo) { tK.textContent = 'Total ponctuel'; countTo(tN, t.lo); tR.innerHTML = recs.map(([u, v]) => `<small>puis ${UNIT[u]}</small><b>${rangeF(v)}</b>`).join(''); }
  else if (recs.length) { const [u, v] = recs[0]; tK.textContent = 'Total, ' + UNIT[u]; countTo(tN, v); tR.innerHTML = recs.slice(1).map(([u2, v2]) => `<small>et ${UNIT[u2]}</small><b>${rangeF(v2)}</b>`).join(''); }
  else { tK.textContent = 'Total'; tN.textContent = 'Sur devis'; shown = 0; }
  act.innerHTML = `<a class="bt bt-g" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Réserver un appel</a><button class="bt bt-a" data-send>Envoyer la demande</button>`;
}
$('#prog').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; CF.step = +b.dataset.s; cfgRender(); });
cfg.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.p) { CF.p = b.dataset.p; CF.n = null; CF.step = 1; cfgRender(); return; }
  if (b.dataset.n != null) { CF.n = +b.dataset.n; initPicks(); CF.step = 2; cfgRender(); return; }
  if (b.dataset.o != null) { const gi = +b.parentElement.dataset.g, g = P[CF.p].n[CF.n].calc[gi], oi = +b.dataset.o; if (g.m) { const a = CF.picks[gi] || []; CF.picks[gi] = a.includes(oi) ? a.filter(x => x !== oi) : a.concat(oi); } else CF.picks[gi] = [oi]; $$('button', b.parentElement).forEach(x => x.classList.toggle('on', (CF.picks[gi] || []).includes(+x.dataset.o))); cfgFoot(); return; }
  if (b.dataset.rm != null) { CF.basket.splice(+b.dataset.rm, 1); saveCart(); if (!CF.basket.length) CF.step = 0; cfgRender(); return; }
  if (b.id === 'addMore') { CF.step = CF.p ? 1 : 0; cfgRender(); }
});
$('#cfgAct').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.hasAttribute('data-back')) { CF.step = Math.max(0, CF.step - 1); cfgRender(); }
  if (b.dataset.goto) { CF.step = 3; cfgRender(); }
  if (b.hasAttribute('data-add')) { const n = P[CF.p].n[CF.n], e2 = lineEst(); CF.basket.push({p: CF.p, l: n.l, labels: e2.labels, lo: e2.lo, hi: e2.hi, unit: e2.unit, devis: e2.devis}); saveCart(); CF.step = 3; cfgRender(); if (!RM) anim($('#estB'), [{transform: 'scale(1)'}, {transform: 'scale(1.18)'}, {transform: 'scale(1)'}], {duration: 600}); }
  if (b.hasAttribute('data-send')) sendCfg(b);
});
async function sendCfg(btn) {
  const f = $('#cfgForm'), ok = $('#cfgOk');
  if (!f.name.value.trim() || !/\S+@\S+\.\S+/.test(f.email.value)) { ok.textContent = 'Merci de renseigner votre nom et votre e-mail.'; f.name.focus(); return; }
  const t = totals(), d = Object.fromEntries(new FormData(f));
  d.selection = CF.basket.map(b => `• ${b.l} : ${b.labels.join(', ')} (${b.lo ? rangeF(b.lo) + (b.unit ? ' ' + UNIT[b.unit] : '') : 'sur devis'})`).join('\n');
  d.total = t.lo ? rangeF(t.lo) : 'sur devis'; d.profil = (PROFS.find(p => p[0] === CF.basket[0].p) || [])[1] || '';
  d._subject = 'Demande de devis depuis studioes.fr'; d._template = 'table';
  btn.textContent = 'Envoi…';
  try { const r = await fetch('https://formsubmit.co/ajax/contact@studioes.fr', {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(d)}); if (!r.ok) throw 0; CF.basket = []; saveCart(); closeSheets(); toast('Demande envoyée. Réponse sous 48 h.'); CF.step = 0; }
  catch (err) { ok.textContent = 'L\'envoi n\'a pas abouti. Écrivez à contact@studioes.fr.'; btn.textContent = 'Envoyer la demande'; }
}
$('#estB').onclick = () => openCfg({});
saveCart();

/* ================= FEUILLES ================= */
const veil = $('#veil'); let sheetOpen = null;
function openSheet(id) { if (!sheetOpen) FOC.push(document.activeElement); $$('.sheet.on').forEach(s => s.classList.remove('on')); const s = $('#' + id); setTimeout(() => { const f = $('[data-close]', s); if (f) f.focus({preventScroll: true}); }, 60); s.classList.add('on'); veil.classList.add('on'); sheetOpen = s; root.style.overflow = 'hidden'; dockOff(true); }
function closeSheets() { if (!sheetOpen) return; $$('.sheet.on').forEach(s => { s.classList.remove('on'); s.style.transform = ''; }); sheetOpen = null; veil.classList.remove('on'); focusBack(); if (!pf.classList.contains('on')) { root.style.overflow = ''; dockOff(false); } }
veil.onclick = closeSheets;
$$('[data-close]').forEach(b => b.onclick = closeSheets);
$$('.sheet .gr').forEach(g => { let y0 = 0, dy = 0; const s = g.parentElement;
  g.addEventListener('pointerdown', e => { y0 = e.clientY; dy = 0; g.setPointerCapture(e.pointerId); s.style.transition = 'none'; });
  g.addEventListener('pointermove', e => { if (!y0) return; dy = Math.max(0, e.clientY - y0); s.style.transform = `translate(-50%,${dy}px)`; });
  g.addEventListener('pointerup', () => { s.style.transition = ''; y0 = 0; if (dy > 110) closeSheets(); else s.style.transform = ''; }); });
$('#openMsg').onclick = () => openSheet('shM');
$('#ctDevis').onclick = () => openCfg({});
$$('[data-pf]').forEach(b => b.onclick = () => openPF(b.dataset.pf));
$$('[data-cfgp]').forEach(b => b.onclick = () => openCfg(b.dataset.cfgp ? {p: b.dataset.cfgp} : {}));
$('#mlB').onclick = () => openSheet('shL');
$('#form').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, ok = $('#fOk'), b = $('#sendB');
  if (!f.name.value.trim() || !/\S+@\S+\.\S+/.test(f.email.value) || !f.message.value.trim()) { ok.textContent = 'Merci de renseigner votre nom, votre e-mail et votre projet.'; return; }
  b.textContent = 'Envoi…';
  try { const d = Object.fromEntries(new FormData(f)); d._subject = 'Nouveau message depuis studioes.fr'; d._template = 'table'; const r = await fetch('https://formsubmit.co/ajax/contact@studioes.fr', {method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'}, body: JSON.stringify(d)}); if (!r.ok) throw 0; f.reset(); closeSheets(); toast('Message envoyé. Réponse sous 48 h.'); b.textContent = 'Envoyer'; }
  catch (err) { ok.textContent = 'L\'envoi n\'a pas abouti. Écrivez directement à contact@studioes.fr.'; b.textContent = 'Envoyer'; }
});

/* ================= RENDEZ-VOUS : agenda Cal.com intégré, calendrier maison en secours ================= */
const calBox = $('#calEmbed');
function calFallback() {
  if (calBox.dataset.fb) return; calBox.dataset.fb = 1;
  calBox.innerHTML = `<div class="cal-fb"><div class="mo"><b id="moT"></b><div><button class="ic" id="moP" aria-label="Mois précédent">${ico('al')}</button><button class="ic" id="moN" aria-label="Mois suivant">${ico('a')}</button></div></div><div class="wd" aria-hidden="true"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="days" id="days"></div><div class="cal-go"><p id="calTx">Choisissez un jour<b>&nbsp;</b></p><a class="bt bt-a bt-s" id="calGo" href="https://cal.eu/studioes/30min" target="_blank" rel="noopener">Voir les créneaux${ico('a')}</a></div></div>`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const C = {y: today.getFullYear(), m: today.getMonth(), sel: null};
  const MO = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'], JO = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const p2 = n => String(n).padStart(2, '0'), iso = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`, cap = s => s[0].toUpperCase() + s.slice(1);
  function draw() {
    const first = new Date(C.y, C.m, 1), off = (first.getDay() + 6) % 7, nd = new Date(C.y, C.m + 1, 0).getDate();
    $('#moT').textContent = cap(MO[C.m]) + ' ' + C.y;
    $('#moP').disabled = C.y === today.getFullYear() && C.m === today.getMonth();
    $('#moN').disabled = (C.y - today.getFullYear()) * 12 + C.m - today.getMonth() >= 2;
    let h = '<span></span>'.repeat(off);
    for (let d = 1; d <= nd; d++) { const dt = new Date(C.y, C.m, d), wd = dt.getDay(); h += `<button data-d="${iso(dt)}" ${dt <= today || wd === 0 || wd === 6 ? 'disabled' : ''} class="${C.sel === iso(dt) ? 'on' : ''}">${d}</button>`; }
    $('#days').innerHTML = h;
  }
  $('#days').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; C.sel = b.dataset.d; const d = new Date(C.sel + 'T12:00'); $$('#days button').forEach(x => x.classList.toggle('on', x === b)); $('#calTx').innerHTML = `Jour choisi<b>${cap(JO[d.getDay()])} ${d.getDate()} ${MO[d.getMonth()]}</b>`; $('#calGo').href = `https://cal.eu/studioes/30min?month=${C.sel.slice(0, 7)}&date=${C.sel}`; });
  $('#moP').onclick = () => { C.m--; if (C.m < 0) { C.m = 11; C.y--; } draw(); };
  $('#moN').onclick = () => { C.m++; if (C.m > 11) { C.m = 0; C.y++; } draw(); };
  draw();
}
function calLoad() {
  if (calBox.dataset.ld) return; calBox.dataset.ld = 1;
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; const s = d.createElement('script'); s.src = A; s.onerror = calFallback; d.head.appendChild(s); cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, 'https://app.cal.eu/embed/embed.js', 'init');
  Cal('init', 'rdv', {origin: 'https://app.cal.eu'});
  Cal.ns.rdv('inline', {elementOrSelector: '#calEmbed', calLink: 'studioes/30min', config: {layout: 'month_view', theme: 'dark'}});
  Cal.ns.rdv('ui', {theme: 'dark', hideEventTypeDetails: true, layout: 'month_view', cssVarsPerTheme: {dark: {'cal-brand': '#E1DBC4', 'cal-brand-emphasis': '#ece7d6', 'cal-brand-text': '#191919', 'cal-bg': '#1A1A17', 'cal-bg-muted': '#23221F', 'cal-border': 'rgba(237,233,221,.12)', 'cal-text': '#EDE9DD'}}});
  setTimeout(() => { if (!$('iframe', calBox)) calFallback(); }, 7000);
}
new IntersectionObserver(es => { if (es[0].isIntersecting) calLoad(); }, {rootMargin: FINE ? '600px' : '150px'}).observe(calBox);

/* ================= STORIES PLEIN ÉCRAN ================= */
const sv = $('#sv');
const S = {list: [], ri: 0, pi: 0, t0: 0, el: 0, paused: false, open: false, busy: false, DUR: 4800};
function openSV(list, ri, pi = 0) { if (!S.open) focusIn(sv, '#svX'); S.list = list; S.open = true; sv.classList.add('on'); root.style.overflow = 'hidden'; dockOff(true); loadRep(ri, pi, 0); requestAnimationFrame(svTick); }
function closeSV() {
  if (!S.open) return; S.open = false; sv.classList.remove('on'); focusBack();
  if (!pf.classList.contains('on') && !sheetOpen) { root.style.overflow = ''; dockOff(false); }
  $$('.sto', stories).forEach(b => b.classList.toggle('seen', seen.has(ORD[+b.dataset.i].id)));
  if (location.hash.startsWith('#r=')) history.replaceState(null, '', location.pathname);
}
function layer(r, p) { const d = document.createElement('div'); d.className = 'sv-s'; d.innerHTML = `<div class="fl" style="background-image:url(${sm(r, p[0])})"></div><img class="${p[1] < .9 && r.k !== 'g' ? 'cv' : ''}" src="${big(r, p[0])}" alt="${esc(r.t)}">`; return d; }
function svBars() { $$('#svBars s i').forEach((b, j) => b.style.transform = `scaleX(${j < S.pi ? 1 : 0})`); }
function loadRep(ri, pi, dir) {
  const old = $$('.sv-s', $('#svC')); S.ri = ri; const r = S.list[ri];
  seen.add(r.id); store.set('ses5-seen', [...seen].join(','));
  $('#svT').textContent = r.t; $('#svK').textContent = CAT(r) + ' · ' + r.ph.length + (r.k === 'g' ? ' visuels' : ' photos');
  $('#svAv').src = sm(r, r.ph[0][0]); $('#svBars').innerHTML = r.ph.map(() => '<s><i></i></s>').join('');
  $('#svPR').style.visibility = ri > 0 ? '' : 'hidden'; $('#svNR').style.visibility = ri < S.list.length - 1 ? '' : 'hidden';
  if (dir && !RM) {
    const nl = layer(r, r.ph[pi]); nl.style.zIndex = 1; $('#svC').insertBefore(nl, $('#svBars'));
    anim(nl, [{transform: `translateX(${dir * 100}%)`}, {transform: 'none'}], {duration: 560, easing: IOE});
    old.forEach(o => { anim(o, [{transform: 'none', opacity: 1}, {transform: `translateX(${-dir * 30}%)`, opacity: .3}], {duration: 560, easing: IOE}); setTimeout(() => o.remove(), 580); });
    S.pi = pi; svBars(); S.t0 = performance.now(); S.el = 0; $('#svAmb').style.backgroundImage = `url(${sm(r, r.ph[pi][0])})`; $('#svCap').textContent = r.ph[pi][2] || '';
    return;
  }
  old.forEach(o => o.remove()); showPh(pi, true);
}
function showPh(pi, first) {
  const r = S.list[S.ri]; S.pi = pi; const p = r.ph[pi];
  svBars(); $('#svCap').textContent = p[2] || ''; S.busy = true; S.el = 0;
  const im = preload(big(r, p[0]));
  const done = () => { const nl = layer(r, p); if (!first && !RM) $('img', nl).classList.add('fd'); const prev = $$('.sv-s', $('#svC')); $('#svC').insertBefore(nl, $('#svBars')); setTimeout(() => prev.forEach(o => o.remove()), 260); $('#svAmb').style.backgroundImage = `url(${sm(r, p[0])})`; S.busy = false; S.t0 = performance.now(); S.el = 0; if (r.ph[pi + 1]) preload(big(r, r.ph[pi + 1][0])); };
  im.complete ? done() : (im.onload = im.onerror = done);
}
function nextRep(dir) { const j = S.ri + dir; if (j < 0) return showPh(0); if (j >= S.list.length) return closeSV(); loadRep(j, 0, dir); }
function svNext() { const r = S.list[S.ri]; if (S.pi < r.ph.length - 1) showPh(S.pi + 1); else nextRep(1); }
function svPrev() { if (S.pi > 0) showPh(S.pi - 1); else nextRep(-1); }
function svTick(now) { if (!S.open) return; if (S.paused || S.busy) S.t0 = now - S.el; S.el = now - S.t0; const p = clamp(S.el / S.DUR, 0, 1), bar = $$('#svBars s i')[S.pi]; if (bar) bar.style.transform = `scaleX(${p})`; if (p >= 1 && !S.busy) svNext(); requestAnimationFrame(svTick); }
{ let hold = 0, sx = 0, sy = 0, used = false; const c = $('#svC');
  c.addEventListener('pointerdown', e => { if (e.target.closest('.sv-hd,.sv-ft')) return; sx = e.clientX; sy = e.clientY; used = false; hold = setTimeout(() => { S.paused = true; used = true; }, 220); });
  c.addEventListener('pointerup', e => { clearTimeout(hold); S.paused = false; const dy = e.clientY - sy, dx = e.clientX - sx; if (dy > 90 && Math.abs(dy) > Math.abs(dx)) { used = true; closeSV(); } else if (Math.abs(dx) > 60) { used = true; nextRep(dx < 0 ? 1 : -1); } });
  $('#svN').addEventListener('click', () => { if (!used) svNext(); });
  $('#svP').addEventListener('click', () => { if (!used) svPrev(); }); }
$('#svX').onclick = closeSV;
$('#svPR').onclick = () => nextRep(-1);
$('#svNR').onclick = () => nextRep(1);
$('#svSh').onclick = async () => { const r = S.list[S.ri], url = location.origin + location.pathname + '#r=' + r.id; S.paused = true; try { if (navigator.share && !FINE) await navigator.share({title: r.t + ' · Studio ES', url}); else { await navigator.clipboard.writeText(url); toast('Lien du reportage copié'); } } catch (e) {} S.paused = false; };
$('#svMsg').onclick = () => { const r = S.list[S.ri]; closeSV(); $('#fM').value = `Bonjour,\n\nNous avons vu « ${r.t} » et aimerions quelque chose de similaire.\n\n`; openSheet('shM'); };
$('#svEst').onclick = () => { const r = S.list[S.ri]; closeSV(); openCfg({p: st.p, pal: r.k === 'g' ? 1 : 0}); };
addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (S.open) closeSV(); else if (sheetOpen) closeSheets(); else closePF(); }
  if (!S.open) return;
  if (e.key === 'ArrowRight') svNext(); if (e.key === 'ArrowLeft') svPrev();
  if (e.key === ' ') { e.preventDefault(); S.paused = !S.paused; }
});

/* ================= DOCK ================= */
const dock = $('#dock'), dk = $('#dk'), links = $$('a,button', dk);
let dockForced = false;
function dockOff(f) { dockForced = f; dockSync(); }
function dockSync() { dock.classList.toggle('off', dockForced || scrollY < innerHeight * .5); }
if (FINE && !RM) {
  dk.addEventListener('pointermove', e => links.forEach(a => { const r = a.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2)), s = 1 + .28 * Math.max(0, 1 - d / 110); a.style.transform = `translateY(${-(s - 1) * 20}px) scale(${s})`; }));
  dk.addEventListener('pointerleave', () => links.forEach(a => a.style.transform = ''));
}

/* ================= APPARITIONS ================= */
/* Apparitions : on vérifie la position à chaque défilement (plus fiable sur Safari iOS qu'un observateur) */
const REV = '[data-in]:not(.vis),.mk:not(.vis),.stories:not(.vis),.c:not(.vis)';
let revQ = false;
function reveal() { revQ = false; const lim = innerHeight * .96; $$(REV).forEach(el => { const r = el.getBoundingClientRect(); if (r.top < lim && r.bottom > -40) el.classList.add('vis'); }); }
function queueReveal() { if (revQ) return; revQ = true; requestAnimationFrame(reveal); }
const io = {observe: queueReveal, unobserve() {}};
addEventListener('scroll', queueReveal, {passive: true});
addEventListener('resize', queueReveal);
addEventListener('load', queueReveal);
setTimeout(() => $$(REV).forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 3) el.classList.add('vis'); }), 2500);
$$('[data-in],.mk,.stories').forEach(el => io.observe(el));
$$('.t2').forEach(h => $$('.mk', h).forEach((m, i) => m.firstElementChild.style.transitionDelay = i * .1 + 's'));

/* ================= DÉFILEMENT ================= */
const top = $('#top'); let lastY = scrollY, tk = false;
addEventListener('scroll', () => {
  if (tk) return; tk = true;
  requestAnimationFrame(() => {
    const y = scrollY; top.classList.toggle('sc', y > 30);
    if (y > 300 && y > lastY + 3) top.classList.add('hide'); else if (y < lastY - 3 || y < 300) top.classList.remove('hide');
    lastY = y; dockSync(); document.body.classList.toggle('top-on', !top.classList.contains('hide'));
    const mid = innerHeight * .45; let cur = 'accueil';
    ['accueil', 'travaux', 'offre', 'rdv'].forEach(id => { if ($('#' + id).getBoundingClientRect().top <= mid) cur = id; });
    links.forEach(a => a.classList.toggle('on', a.dataset.s === cur));
    tk = false;
  });
}, {passive: true});
addEventListener('resize', moveInk);

/* ================= DÉPART ================= */
renderFeed(); moveInk(); dockSync();
if (document.fonts) document.fonts.ready.then(moveInk);
{ const h = location.hash;
  const AL = {'#contact': '#rdv', '#portfolio': '#travaux', '#plan-large': '#offre', '#services': '#offre'};
  if (AL[h]) { history.replaceState(null, '', AL[h]); setTimeout(() => $(AL[h]).scrollIntoView(), 200); }
  if (h === '#devis') { history.replaceState(null, '', location.pathname); openCfg({}); }
  if (h.startsWith('#r=')) { const r = byId(h.slice(3)); if (r) { const list = r.k === 'g' ? GORD : ORD; openSV(list, list.indexOf(r), 0); } } }
})();
