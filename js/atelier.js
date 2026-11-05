/* L'atelier de Studio ES : une pièce en 3D où chaque coin mène à un métier.
   Le mur de tirages pour la photographie, le bureau et son écran pour le web, le plan de travail pour le graphisme,
   l'étagère lavande pour Fill, le téléphone pour le contact. La lumière suit l'heure du visiteur ; quelques détails se cachent. */
import * as THREE from './three/three.module.min.js';
import { RoundedBoxGeometry } from './three/RoundedBoxGeometry.js';
import { RoomEnvironment } from './three/RoomEnvironment.js';

const H = document.getElementById('hx');
const C = H && H.querySelector('.at-c');
if (C) demarre();

function demarre() {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOB = matchMedia('(max-width: 860px)').matches;
  let rd;
  try { rd = new THREE.WebGLRenderer({ canvas: C, antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch (e) { H.classList.add('at-sans'); return; }
  rd.setPixelRatio(Math.min(devicePixelRatio, MOB ? 1.6 : 2));
  rd.outputColorSpace = THREE.SRGBColorSpace;
  rd.toneMapping = THREE.ACESFilmicToneMapping; rd.toneMappingExposure = 1.05;
  rd.shadowMap.enabled = true; rd.shadowMap.type = THREE.PCFSoftShadowMap;

  const sc = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(rd);
  sc.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  const cam = new THREE.PerspectiveCamera(MOB ? 40 : 30, 1, .1, 100);

  /* ---------- l'heure du visiteur ---------- */
  const now = new Date(), h = now.getHours() + now.getMinutes() / 60, mois = now.getMonth();
  const moment = h < 6.5 || h >= 21 ? 'nuit' : h < 9.5 ? 'matin' : h < 17 ? 'jour' : 'soir';
  H.dataset.moment = moment;
  // de jour la pièce est claire : l'en-tête repasse en encre
  if (moment !== 'nuit') { H.removeAttribute('data-dark'); dispatchEvent(new Event('scroll')); }
  const CIEL = { nuit: ['#0E1430', '#1E2650'], matin: ['#F6D9C2', '#BFD6EA'], jour: ['#CFE3F2', '#9FC4E6'], soir: ['#F2A66B', '#7E6BA8'] }[moment];
  const SOLEIL = { nuit: ['#7C8CC8', .25], matin: ['#FFD9B0', 2.3], jour: ['#FFF4E2', 2.9], soir: ['#FFB27A', 2.6] }[moment];
  const FOND = { nuit: '#15171C', matin: '#E9E2D6', jour: '#ECE7DD', soir: '#E7D9CB' }[moment];
  sc.background = new THREE.Color(FOND);

  /* ---------- matières ---------- */
  const M = (c, r = .85, m = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra));
  const mat = {
    mur: M('#F2EDE3', .95), mur2: M('#F4EFE6', .95), sol: M('#C9B796', .7), plinthe: M('#E2DACB', .9),
    encre: M('#1E1E1E', .5), bois: M('#B89A72', .6), boisC: M('#D8C3A0', .65), metal: M('#2A2A2A', .35, .6),
    papier: M('#FBF8F1', .9), lilas: M('#C7C5E3', .8), menthe: M('#C5E3D2', .8), rose: M('#E3C8C5', .8), sable: M('#E2DDC5', .85),
    lav: M('#B8A4FF', .6), terra: M('#B5583F', .7), plante: M('#5E8A5A', .8), pot: M('#E9E3D7', .7), noir: M('#121212', .4)
  };
  const tl = new THREE.TextureLoader();
  const tex = (u) => { const t = tl.load(u); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, hh, d, m, r = .04) => { const g = new THREE.Mesh(new RoundedBoxGeometry(w, hh, d, 3, Math.min(r, w / 2.01, hh / 2.01, d / 2.01)), m); g.castShadow = g.receiveShadow = true; return g; };
  const pose = (o, x, y, z, p = sc) => { o.position.set(x, y, z); p.add(o); return o; };
  const Bx = (w, hh, d, m) => { const g = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), m); g.castShadow = g.receiveShadow = true; return g; };

  /* ---------- la pièce (diorama) ---------- */
  const L = 10, P = 8, HT = 5.2;
  const cvp = document.createElement('canvas'); cvp.width = 1024; cvp.height = 1024; const xp = cvp.getContext('2d');
  xp.fillStyle = '#CDBB9A'; xp.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 16; i++) { for (let j = 0; j < 4; j++) { const dx = (i % 2) * 128 + j * 256; xp.fillStyle = 'hsl(36,' + (30 + Math.random() * 8) + '%,' + (66 + Math.random() * 6) + '%)'; xp.fillRect(dx, i * 64, 254, 62); } }
  xp.globalAlpha = .06; for (let k = 0; k < 900; k++) { xp.fillStyle = Math.random() > .5 ? '#5a4630' : '#ffffff'; xp.fillRect(Math.random() * 1024, Math.random() * 1024, 40 + Math.random() * 120, 1); } xp.globalAlpha = 1;
  const tp = new THREE.CanvasTexture(cvp); tp.colorSpace = THREE.SRGBColorSpace; tp.wrapS = tp.wrapT = THREE.RepeatWrapping; tp.repeat.set(2.2, 2.2); tp.anisotropy = 8;
  mat.sol = M('#FFFFFF', .62, 0, { map: tp });
  const sol = pose(B(L, .3, P, mat.sol, .12), 0, -.15, 0);
  const fond = pose(B(L, HT, .3, mat.mur, .12), 0, HT / 2, -P / 2 - .15);
  const gauche = new THREE.Group(); pose(gauche, -L / 2 - .15, 0, 0);
  // mur de gauche percé d'une fenêtre (quatre panneaux autour de l'ouverture)
  const fz = -.6, fy = 2.7, fw = 2.6, fh = 2.2;
  pose(Bx(.3, fy - fh / 2, P, mat.mur2), 0, (fy - fh / 2) / 2, 0, gauche);
  pose(Bx(.3, HT - fy - fh / 2, P, mat.mur2), 0, fy + fh / 2 + (HT - fy - fh / 2) / 2, 0, gauche);
  pose(Bx(.3, fh, (P / 2 + fz - fw / 2), mat.mur2), 0, fy, -P / 2 + (P / 2 + fz - fw / 2) / 2, gauche);
  pose(Bx(.3, fh, (P / 2 - fz - fw / 2), mat.mur2), 0, fy, P / 2 - (P / 2 - fz - fw / 2) / 2, gauche);
  // cadre, croisillon et rebord de la fenêtre
  const cad = M('#FBF8F1', .6);
  [[0, fh / 2, 0, .34, .08, fw + .1], [0, -fh / 2, 0, .5, .1, fw + .3], [0, 0, -fw / 2, .34, fh, .08], [0, 0, fw / 2, .34, fh, .08], [0, 0, 0, .1, fh, .05], [0, 0, 0, .1, .05, fw]]
    .forEach(([x, y, z, w, hh, d]) => pose(B(w, hh, d, cad, .02), x + .05, fy + y, fz + z, gauche));
  // le ciel derrière la fenêtre
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256;
  const cx = cv.getContext('2d'), gr = cx.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, CIEL[1]); gr.addColorStop(1, CIEL[0]); cx.fillStyle = gr; cx.fillRect(0, 0, 64, 256);
  if (moment === 'nuit') { cx.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { cx.globalAlpha = Math.random() * .8 + .2; cx.fillRect(Math.random() * 64, Math.random() * 160, 1, 1); } cx.globalAlpha = 1; }
  const ciel = new THREE.Mesh(new THREE.PlaneGeometry(fw + .6, fh + .6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), toneMapped: false }));
  ciel.material.map.colorSpace = THREE.SRGBColorSpace; ciel.rotation.y = Math.PI / 2; pose(ciel, -L / 2 - .4, fy, fz);
  // le rai de lumière qui entre par la fenêtre
  if (moment !== 'nuit') {
    const cvr = document.createElement('canvas'); cvr.width = 8; cvr.height = 128; const xr = cvr.getContext('2d'), gg = xr.createLinearGradient(0, 0, 0, 128);
    gg.addColorStop(0, 'rgba(255,240,215,.0)'); gg.addColorStop(.25, 'rgba(255,240,215,.16)'); gg.addColorStop(1, 'rgba(255,240,215,0)'); xr.fillStyle = gg; xr.fillRect(0, 0, 8, 128);
    const tr = new THREE.CanvasTexture(cvr);
    const rai = new THREE.Mesh(new THREE.PlaneGeometry(fw, 6.5), new THREE.MeshBasicMaterial({ map: tr, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false }));
    rai.rotation.set(0, Math.PI / 2, 0); rai.rotateX(-.95); pose(rai, -L / 2 + 2.4, fy - 1.4, fz);
    const rai2 = rai.clone(); rai2.rotateY(.25); rai2.position.x += .2; sc.add(rai2);
  }
  // plinthes
  pose(B(L, .14, .05, mat.plinthe, .01), 0, .07, -P / 2 + .03);

  /* ---------- lumières ---------- */
  sc.add(new THREE.HemisphereLight(moment === 'nuit' ? '#3A4470' : '#FFFFFF', '#C9B796', moment === 'nuit' ? .35 : .9));
  const so = new THREE.DirectionalLight(SOLEIL[0], SOLEIL[1]);
  const angle = moment === 'matin' ? .55 : moment === 'soir' ? .32 : moment === 'nuit' ? .9 : .9;
  so.position.set(-14, 9 * angle + 2, 2 + (moment === 'soir' ? -3 : moment === 'matin' ? 4 : 0)); so.target.position.set(1, 0, -1);
  so.castShadow = true; so.shadow.mapSize.set(MOB ? 1024 : 2048, MOB ? 1024 : 2048); so.shadow.bias = -.0004; so.shadow.normalBias = .02;
  Object.assign(so.shadow.camera, { left: -9, right: 9, top: 9, bottom: -6, near: 1, far: 40 });
  sc.add(so, so.target);
  const remplis = new THREE.DirectionalLight('#FFFFFF', moment === 'nuit' ? .15 : .55); remplis.position.set(8, 10, 12); sc.add(remplis);
  const droite = new THREE.DirectionalLight('#FFF8EE', moment === 'nuit' ? .1 : .7); droite.position.set(14, 6, 1); sc.add(droite);

  /* ---------- zones cliquables ---------- */
  const zones = {}, cliquables = [];
  const zone = (id, grp, cible, vue) => { grp.userData.zone = id; zones[id] = { grp, cible: new THREE.Vector3(...cible), vue: new THREE.Vector3(...vue) }; cliquables.push(grp); return grp; };
  const objet = (id, o) => { o.userData.oeuf = id; cliquables.push(o); return o; };

  /* PHOTOGRAPHIE : mur de tirages encadrés + appareil sur trépied */
  const ph = new THREE.Group(); sc.add(ph);
  const tirages = [['/h/ph/franglish.webp', .75], ['/h/ph/fatal.webp', .75], ['/h/ph/helena.webp', .8], ['/h/ph/rimk.webp', .75], ['/h/ph/genezio.webp', .75], ['/h/ph/drapeau.webp', .75], ['/h/ph/mouvement.webp', .75], ['/h/ph/public.webp', 1.56]];
  const pos = [[2.35, 3.35, .62], [3.15, 3.35, .62], [3.95, 3.35, .62], [2.35, 2.35, .62], [3.15, 2.35, .62], [3.95, 2.35, .62], [4.55, 2.85, .5], [3.15, 4.25, .9]];
  tirages.forEach(([u, ratio], i) => {
    const [x, y, w] = pos[i], hh = w / ratio * (ratio > 1 ? 1 : 1);
    const ww = ratio > 1 ? w * 1.6 : w, hhh = ratio > 1 ? w : w / ratio * .75;
    const fr = B(ww + .1, hhh + .1, .06, i % 3 === 1 ? mat.bois : mat.encre, .015); pose(fr, x, y, -P / 2 + .04, ph);
    const im = new THREE.Mesh(new THREE.PlaneGeometry(ww, hhh), new THREE.MeshStandardMaterial({ map: tex(u), roughness: .55 }));
    pose(im, x, y, -P / 2 + .075, ph);
  });
  // trépied et boîtier
  const tri = new THREE.Group(); pose(tri, 3.4, 0, -1.6, ph);
  for (let i = 0; i < 3; i++) { const j = new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, 1.75, 8), mat.metal); j.castShadow = true; const a = i / 3 * Math.PI * 2; j.position.set(Math.cos(a) * .32, .82, Math.sin(a) * .32); j.lookAt(0, 1.8, 0); j.rotateX(Math.PI / 2); tri.add(j); }
  const boit = new THREE.Group(); pose(boit, 0, 1.78, 0, tri); boit.rotation.y = -2.3;
  pose(B(.42, .28, .22, mat.encre, .05), 0, 0, 0, boit);
  const obj = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .22, 24), mat.noir); obj.rotation.x = Math.PI / 2; obj.castShadow = true; pose(obj, 0, -.01, .2, boit);
  pose(B(.1, .06, .08, mat.encre, .02), -.12, .17, 0, boit);
  const flashL = new THREE.PointLight('#FFFFFF', 0, 6); pose(flashL, 0, .2, .3, boit);
  zone('photo', ph, [3.1, 2.4, -3.2], [4.6, 3.0, 4.2]);

  /* WEB : bureau, écran qui fait défiler les sites, téléphone, clavier */
  const wb = new THREE.Group(); sc.add(wb);
  const bx = -.4, bz = -2.95;
  pose(B(2.9, .08, 1.15, mat.boisC, .03), bx, .95, bz, wb);
  [[-1.35, -.48], [1.35, -.48], [-1.35, .48], [1.35, .48]].forEach(([x, z]) => pose(B(.06, .95, .06, mat.encre, .02), bx + x, .475, bz + z, wb));
  const ecr = new THREE.Group(); pose(ecr, bx, 1.0, bz - .25, wb);
  pose(B(.1, .4, .1, mat.encre, .03), 0, .2, -.05, ecr); pose(B(.5, .03, .28, mat.encre, .015), 0, .015, 0, ecr);
  pose(B(1.62, 1.04, .06, mat.encre, .04), 0, .9, 0, ecr);
  const ecrans = ['/projets/la-soute/img/d-accueil.webp', '/projets/pierceval-tattoo/img/d-hero.webp', '/projets/plateforme-interne/img/d-maintenant.webp', '/projets/fill/img/d-accueil.webp'].map(tex);
  const dalle = new THREE.Mesh(new THREE.PlaneGeometry(1.52, .95), new THREE.MeshBasicMaterial({ map: ecrans[0], toneMapped: false }));
  pose(dalle, 0, .9, .032, ecr);
  pose(B(.95, .025, .3, mat.papier, .01), bx - .05, 1.0, bz + .2, wb); // clavier
  const tel = new THREE.Group(); pose(tel, bx + .95, 1.0, bz + .05, wb); tel.rotation.y = -.35;
  pose(B(.24, .02, .14, mat.encre, .01), 0, .01, 0, tel); const tc = B(.2, .42, .02, mat.noir, .03); tc.rotation.x = -.25; pose(tc, 0, .22, -.02, tel);
  const td = new THREE.Mesh(new THREE.PlaneGeometry(.18, .39), new THREE.MeshBasicMaterial({ map: tex('/projets/pierceval-tattoo/img/t-hero.webp'), toneMapped: false })); td.rotation.x = -.25; pose(td, 0, .22, -.005, tel);
  // chaise
  const ch = new THREE.Group(); pose(ch, bx + .1, 0, bz + 1.35, wb); ch.rotation.y = .25;
  pose(B(.62, .08, .58, mat.encre, .04), 0, .55, 0, ch); pose(B(.6, .62, .07, mat.encre, .04), 0, .95, .28, ch);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .5, 10), mat.metal), 0, .27, 0, ch);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .03, 24), mat.metal), 0, .03, 0, ch);
  zone('web', wb, [bx, 1.55, bz], [bx + 1.6, 2.5, 2.6]);
  // la tasse (vapeur le matin) et la lampe de bureau
  const tasse = new THREE.Group(); pose(tasse, bx - .95, 1.0, bz + .25, sc);
  const ta = new THREE.Mesh(new THREE.CylinderGeometry(.07, .06, .14, 20), mat.terra); ta.castShadow = true; pose(ta, 0, .07, 0, tasse);
  objet('tasse', tasse);
  const lampe = new THREE.Group(); pose(lampe, bx - 1.2, 1.0, bz - .3, sc);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .04, 24), mat.encre), 0, .02, 0, lampe);
  const bras = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .7, 8), mat.encre); bras.position.set(.12, .36, 0); bras.rotation.z = -.35; lampe.add(bras);
  const abat = new THREE.Mesh(new THREE.ConeGeometry(.14, .2, 24, 1, true), M('#1E1E1E', .5, 0, { side: THREE.DoubleSide })); abat.position.set(.3, .68, .05); abat.rotation.z = .9; abat.castShadow = true; lampe.add(abat);
  const ampoule = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 12), new THREE.MeshBasicMaterial({ color: '#FFE7B8' })); ampoule.position.set(.33, .62, .05); lampe.add(ampoule);
  const lumL = new THREE.PointLight('#FFD9A0', 0, 5, 1.6); lumL.position.set(.36, .55, .1); lumL.castShadow = !MOB; lampe.add(lumL);
  objet('lampe', lampe);

  /* GRAPHISME : panneau d'affiches + table à dessin avec brochure et nuancier */
  const gp = new THREE.Group(); sc.add(gp);
  pose(B(2.7, 1.9, .06, mat.liege = M('#CDB48C', .95), .03), -3.35, 3.0, -P / 2 + .05, gp);
  [['/p/t/affiches-6.webp', -4.15, 3.05, .62, .78, .06], ['/projets/la-soute/img/affiche.webp', -3.38, 3.1, .62, .78, -.04], ['/p/t/editions-5.webp', -2.6, 3.0, .62, .78, .05], ['/projets/mjc-la-marelle/img/p1.webp', -2.55, 2.35, .4, .57, -.08]]
    .forEach(([u, x, y, w, hh, r]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), M('#fff', .8, 0, { map: tex(u) })); m.rotation.z = r; m.castShadow = true; pose(m, x, y, -P / 2 + .1, gp); const pin = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 8), mat.terra); pose(pin, x, y + hh / 2 - .05, -P / 2 + .12, gp); });
  const tb = new THREE.Group(); pose(tb, -3.4, 0, -2.4, gp); tb.rotation.y = .12;
  const plat = B(1.9, .06, 1.1, mat.papier, .02); plat.rotation.x = -.18; pose(plat, 0, 1.0, 0, tb);
  [[-.85, -.45], [.85, -.45], [-.85, .45], [.85, .45]].forEach(([x, z]) => pose(B(.06, 1, .06, mat.bois, .02), x, .5, z, tb));
  const bro = new THREE.Mesh(new THREE.PlaneGeometry(.42, .6), M('#fff', .7, 0, { map: tex('/projets/mjc-la-marelle/img/p8.webp') })); bro.rotation.set(-Math.PI / 2 - .18 + .0, 0, .3); pose(bro, -.35, 1.05, .05, tb);
  const cdv = new THREE.Mesh(new THREE.PlaneGeometry(.6, .42), M('#fff', .7, 0, { map: tex('/projets/mam-our-et-merveilles/img/cover-800.webp') })); cdv.rotation.set(-Math.PI / 2 - .18, 0, -.15); pose(cdv, .4, 1.06, -.05, tb);
  // nuancier en éventail
  const nu = new THREE.Group(); pose(nu, .2, 1.1, .35, tb); nu.rotation.x = -.18;
  ['#C5E3D2', '#C7C5E3', '#E3C8C5', '#E2DDC5', '#B5583F', '#1E1848'].forEach((c, i) => { const l = B(.06, .012, .38, M(c, .7), .005); l.position.z = -.17; const g = new THREE.Group(); g.add(l); g.rotation.y = -.5 + i * .2; nu.add(g); });
  zone('graph', gp, [-3.3, 2.1, -3.0], [-1.2, 3.0, 2.6]);

  /* FILL : étagère lavande près de la fenêtre, avec son logo */
  const fl = new THREE.Group(); pose(fl, -4.55, 0, 2.1, sc);
  pose(B(.6, 1.5, 1.4, mat.lav, .06), 0, .75, 0, fl);
  pose(B(.62, .04, 1.3, M('#A592F0', .6), .01), 0, 1.0, 0, fl); pose(B(.62, .04, 1.3, M('#A592F0', .6), .01), 0, .5, 0, fl);
  const cvf = document.createElement('canvas'); cvf.width = 256; cvf.height = 128; const xf = cvf.getContext('2d');
  xf.fillStyle = '#FBF8F1'; xf.fillRect(0, 0, 256, 128); xf.font = '800 78px "Bricolage Grotesque", sans-serif'; xf.fillStyle = '#1A1A1A'; xf.fillText('fi', 40, 92);
  xf.strokeStyle = '#7052B3'; xf.lineWidth = 12; xf.lineCap = 'round'; xf.beginPath(); xf.moveTo(118, 96); xf.bezierCurveTo(130, 40, 150, 20, 154, 40); xf.bezierCurveTo(156, 60, 128, 96, 150, 96); xf.stroke();
  xf.strokeStyle = '#FF8A6B'; xf.beginPath(); xf.moveTo(150, 96); xf.bezierCurveTo(165, 40, 185, 20, 189, 40); xf.bezierCurveTo(191, 60, 163, 96, 200, 92); xf.stroke();
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(.5, .25), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cvf), roughness: .6 })); pl.material.map.colorSpace = THREE.SRGBColorSpace; pl.rotation.y = Math.PI / 2; pose(pl, .31, 1.25, 0, fl);
  [[0, 1.12, -.35, .3, .18, .22, '#E3C8C5'], [0, 1.12, .3, .3, .22, .3, '#FBF8F1'], [0, .62, -.2, .3, .3, .3, '#C5E3D2']].forEach(([x, y, z, w, hh, d, c]) => pose(B(w, hh, d, M(c, .8), .03), x, y, z, fl));
  zone('fill', fl, [-4.3, 1.3, 2.0], [-.6, 2.6, 5.2]);

  const et = new THREE.Group(); pose(et, -4.82, 2.75, 1.9, sc);
  pose(B(.36, .05, 1.6, mat.boisC, .015), 0, 0, 0, et); pose(B(.36, .05, 1.6, mat.boisC, .015), 0, .62, 0, et);
  const LIV = ['#1E1E1E', '#C7C5E3', '#B5583F', '#E2DDC5', '#C5E3D2', '#1E1848', '#E3C8C5', '#FBF8F1', '#B89A72'];
  let zl = -.7; for (let i = 0; i < 9; i++) { const w = .05 + Math.random() * .04, hh = .32 + Math.random() * .16; const l = B(.24, hh, w, M(LIV[i], .8), .006); l.position.set(0, .025 + hh / 2, zl + w / 2); if (i === 8) { l.rotation.x = .28; l.position.z += .06; } et.add(l); zl += w + .008; }
  const pp = new THREE.Group(); pose(pp, 0, .67, .5, et); pose(new THREE.Mesh(new THREE.CylinderGeometry(.09, .07, .14, 16), mat.pot), 0, .07, 0, pp);
  for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 8), mat.plante); f.scale.set(.4, 1.3, .2); const a = i / 6 * Math.PI * 2; f.position.set(Math.cos(a) * .05, .24, Math.sin(a) * .05); f.rotation.set(Math.sin(a) * .7, a, Math.cos(a) * .7); pp.add(f); }
  const vin = B(.02, .4, .4, M('#FFFFFF', .7, 0, { map: tex('/h/ph/drapeau.webp') }), .005); vin.rotation.x = -.12; pose(vin, .02, .27, .3, et);
  // boîte à lumière sur pied, côté photo
  const bl = new THREE.Group(); pose(bl, 4.55, 0, -.4, ph); bl.rotation.y = -2.4;
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 2.1, 8), mat.metal), 0, 1.05, 0, bl);
  for (let i = 0; i < 3; i++) { const j = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .5, 6), mat.metal); const a = i / 3 * Math.PI * 2; j.position.set(Math.cos(a) * .18, .2, Math.sin(a) * .18); j.lookAt(0, .45, 0); j.rotateX(Math.PI / 2); bl.add(j); }
  const sb = B(.75, .75, .32, M('#F7F5F0', .9, 0, { emissive: '#FFF6E6', emissiveIntensity: moment === 'nuit' ? .6 : .15 }), .04); sb.rotation.x = .25; pose(sb, 0, 2.15, .05, bl);
  // carnet et petite plante sur le bureau
  pose(B(.32, .025, .22, mat.lilas, .01), -.4 - .7, 1.0, -2.95 + .3, sc);
  const pb = new THREE.Group(); pose(pb, -.4 + 1.25, 1.0, -2.95 - .3, sc); pose(new THREE.Mesh(new THREE.CylinderGeometry(.07, .06, .12, 16), mat.rose), 0, .06, 0, pb);
  for (let i = 0; i < 5; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 8), mat.plante); f.scale.set(.5, 1.2, .25); const a = i / 5 * Math.PI * 2; f.position.set(Math.cos(a) * .04, .19, Math.sin(a) * .04); f.rotation.set(Math.sin(a) * .7, a, Math.cos(a) * .7); pb.add(f); }

  /* CONTACT : guéridon, téléphone à cadran */
  const ct = new THREE.Group(); pose(ct, 2.6, 0, 1.6, sc);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.45, .45, .05, 32), mat.boisC), 0, .7, 0, ct);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.04, .06, .7, 10), mat.encre), 0, .35, 0, ct);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .03, 24), mat.encre), 0, .015, 0, ct);
  const phone = new THREE.Group(); pose(phone, 0, .73, 0, ct); phone.rotation.y = -.6;
  pose(B(.36, .14, .28, mat.menthe, .05), 0, .07, 0, phone);
  const com = B(.42, .07, .1, mat.menthe, .035); pose(com, 0, .19, -.04, phone);
  const cad2 = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .02, 24), mat.papier); cad2.rotation.x = -.6; pose(cad2, 0, .13, .1, phone);
  zone('contact', ct, [2.6, .9, 1.6], [5.4, 2.6, 5.2]);

  /* ---------- décor et détails ---------- */
  // tapis lilas
  const tap = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, .02, 64), mat.lilas); tap.scale.z = .7; tap.receiveShadow = true; pose(tap, .1, .011, -.6);
  // plante haute
  const plante = new THREE.Group(); pose(plante, 4.3, 0, -3.3, sc);
  pose(new THREE.Mesh(new THREE.CylinderGeometry(.28, .22, .55, 24), mat.pot), 0, .275, 0, plante);
  const feuilles = [];
  for (let i = 0; i < 9; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.28, 12, 10), mat.plante); f.scale.set(.5, 1.2, .18); const a = i / 9 * Math.PI * 2; f.position.set(Math.cos(a) * .22, .95 + (i % 3) * .28, Math.sin(a) * .22); f.rotation.set(Math.sin(a) * .6, a, Math.cos(a) * .5); f.castShadow = true; plante.add(f); feuilles.push(f); }
  objet('plante', plante);
  // horloge à l'heure du visiteur
  const hor = new THREE.Group(); pose(hor, .55, 4.25, -P / 2 + .06, sc);
  const hc = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .05, 40), mat.papier); hc.rotation.x = Math.PI / 2; hc.castShadow = true; hor.add(hc);
  const bord = new THREE.Mesh(new THREE.TorusGeometry(.34, .025, 8, 40), mat.encre); hor.add(bord);
  const aig = (l, w) => { const g = new THREE.Group(); const a = new THREE.Mesh(new THREE.BoxGeometry(w, l, .01), mat.encre); a.position.y = l / 2; g.add(a); g.position.z = .04; hor.add(g); return g; };
  const ah = aig(.17, .025), am = aig(.26, .016);
  // néon « Studio ES » (s'allume le soir)
  const cvn = document.createElement('canvas'); cvn.width = 512; cvn.height = 128; const xn = cvn.getContext('2d');
  xn.font = '800 92px "Bricolage Grotesque", sans-serif'; xn.textBaseline = 'middle'; xn.shadowColor = '#C5E3D2'; xn.shadowBlur = 18; xn.fillStyle = '#E8FFF2'; xn.fillText('Studio ES', 18, 66);
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .48), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvn), transparent: true, toneMapped: false, opacity: moment === 'nuit' || moment === 'soir' ? 1 : .42 }));
  neon.material.map.colorSpace = THREE.SRGBColorSpace; pose(neon, -.4, 3.55, -P / 2 + .07);
  objet('neon', neon);
  // platine vinyle sur un meuble bas
  const mb = new THREE.Group(); pose(mb, 1.9, 0, -3.5, sc);
  pose(B(1.2, .55, .55, mat.sable, .04), 0, .275, 0, mb);
  pose(B(.62, .08, .45, mat.encre, .02), -.15, .59, 0, mb);
  const disque = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .01, 40), mat.noir); pose(disque, -.2, .64, 0, mb);
  const rond = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .012, 24), mat.terra); pose(rond, -.2, .645, 0, mb);
  objet('vinyle', mb);
  // petite console : le jeu Déclic
  const con = new THREE.Group(); pose(con, 2.25, .6, -3.45, sc); con.rotation.y = -.4;
  pose(B(.2, .3, .04, mat.rose, .04), 0, .15, 0, con);
  const cvd = document.createElement('canvas'); cvd.width = 64; cvd.height = 64; const xd = cvd.getContext('2d'); xd.fillStyle = '#191919'; xd.fillRect(0, 0, 64, 64); xd.strokeStyle = '#E1DBC4'; xd.lineWidth = 4; xd.strokeRect(14, 14, 36, 36); xd.fillStyle = '#E1DBC4'; xd.fillRect(30, 30, 4, 4);
  const cdd = new THREE.Mesh(new THREE.PlaneGeometry(.15, .15), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvd), toneMapped: false })); pose(cdd, 0, .2, .021, con);
  objet('declic', con);
  // guirlande en décembre
  const guir = [];
  if (mois === 11) for (let i = 0; i < 22; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), new THREE.MeshBasicMaterial({ color: ['#FFD9A0', '#C5E3D2', '#E3C8C5'][i % 3], toneMapped: false })); const t = i / 21; pose(b, -4.6 + t * 9.2, 4.9 - Math.sin(t * Math.PI * 4) ** 2 * .3, -P / 2 + .12); guir.push(b); }
  // ombres et lumière de nuit
  if (moment === 'nuit') { lumL.intensity = 3.2; }
  const notes = [];

  /* ---------- caméra ---------- */
  const base = { cible: new THREE.Vector3(-.4, 1.7, -1.3), vue: MOB ? new THREE.Vector3(9.8, 7.6, 15.5) : new THREE.Vector3(9.6, 6.3, 11.9) };
  const camCible = base.cible.clone(), camVue = base.vue.clone(), viseC = base.cible.clone(), viseV = base.vue.clone();
  cam.position.copy(RM ? base.vue : base.vue.clone().add(new THREE.Vector3(6, 5, 8)));
  let mx = 0, my = 0, tx = 0, ty = 0, ouverte = null;

  /* ---------- interface ---------- */
  const eti = H.querySelector('.at-eti'), pan = H.querySelector('.at-pan'), titre = H.querySelector('.hv-t');
  const INFO = {
    photo: 'Photographie · les reportages', web: 'Web · sites et applications', graph: 'Design graphique · identités et campagnes', fill: 'Fill · la communication externalisée', contact: 'Contact · parlons de votre projet',
    lampe: '', tasse: '', plante: '', neon: '', vinyle: '', declic: 'Déclic · le jeu'
  };
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(-9, -9);
  let survol = null;
  const trouve = (o) => { while (o && !o.userData.zone && !o.userData.oeuf) o = o.parent; return o; };
  C.addEventListener('pointermove', e => {
    const r = C.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    tx = ptr.x; ty = ptr.y;
    eti.style.transform = 'translate3d(' + (e.clientX - r.left + 16) + 'px,' + (e.clientY - r.top + 14) + 'px,0)';
  }, { passive: true });
  C.addEventListener('pointerleave', () => { ptr.set(-9, -9); tx = ty = 0; });
  const ouvre = (id) => {
    const z = zones[id]; if (!z) return; ouverte = id; viseC.copy(z.cible); viseV.copy(z.vue);
    H.classList.add('at-zoom'); pan.querySelectorAll('.at-z').forEach(x => x.hidden = x.dataset.z !== id); pan.hidden = false; requestAnimationFrame(() => pan.classList.add('on'));
  };
  const ferme = () => { H.querySelectorAll('[data-at]').forEach(x => x.setAttribute('aria-pressed', 'false')); ouverte = null; viseC.copy(base.cible); viseV.copy(base.vue); H.classList.remove('at-zoom'); pan.classList.remove('on'); setTimeout(() => { if (!ouverte) pan.hidden = true; }, 400); };
  pan.querySelectorAll('[data-ferme]').forEach(b => b.addEventListener('click', ferme));
  H.querySelectorAll('[data-at]').forEach(b => b.addEventListener('click', () => { if (ouverte === b.dataset.at) ferme(); else { if (b.dataset.at === 'photo') flashT = performance.now(); ouvre(b.dataset.at); } H.querySelectorAll('[data-at]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.at === ouverte))); }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) ferme(); });
  let flashT = 0, vinyle = false, plantT = 0, tasseT = 0;
  C.addEventListener('click', () => {
    if (!survol) { if (ouverte) ferme(); return; }
    const z = survol.userData.zone, o = survol.userData.oeuf;
    if (z) { if (z === 'photo') flashT = performance.now(); ouvre(z); return; }
    if (o === 'lampe') lumL.intensity = lumL.intensity > 0 ? 0 : 3.2;
    if (o === 'vinyle') vinyle = !vinyle;
    if (o === 'plante') plantT = performance.now();
    if (o === 'tasse') tasseT = performance.now();
    if (o === 'neon') neon.material.opacity = neon.material.opacity > .5 ? .42 : 1;
    if (o === 'declic') window.open('https://declic.studioes.fr/', '_blank', 'noopener');
  });
  // au doigt : un toucher sur un objet vaut un survol puis un clic
  C.addEventListener('touchstart', e => { const t = e.touches[0], r = C.getBoundingClientRect(); ptr.set((t.clientX - r.left) / r.width * 2 - 1, -(t.clientY - r.top) / r.height * 2 + 1); visePtr(); }, { passive: true });

  function visePtr() {
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(cliquables, true)[0];
    const o = hit ? trouve(hit.object) : null;
    if (o !== survol) {
      survol = o; C.style.cursor = o ? 'pointer' : '';
      const k = o ? (o.userData.zone || o.userData.oeuf) : '';
      eti.textContent = INFO[k] || ''; eti.classList.toggle('on', !!(o && INFO[k]));
    }
  }

  /* ---------- vapeur de la tasse (le matin et au clic) ---------- */
  const vap = [];
  for (let i = 0; i < 5; i++) { const v = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0 })); tasse.add(v); vap.push(v); }

  /* ---------- boucle ---------- */
  const taille = () => { const w = H.clientWidth, hh = H.clientHeight; rd.setSize(w, hh, false); cam.aspect = w / hh;
    // sur grand écran, la pièce glisse vers la droite : le titre garde sa place à gauche
    cam.updateProjectionMatrix(); };
  let ox = MOB ? 0 : -.05, oy = MOB ? .1 : -.02;
  const decale = () => { const w = H.clientWidth, hh = H.clientHeight; const tx2 = MOB ? 0 : (ouverte ? .17 : -.05), ty2 = MOB ? (ouverte ? .26 : .1) : -.02; ox += (tx2 - ox) * .07; oy += (ty2 - oy) * .07; cam.setViewOffset(w, hh, w * ox, hh * oy, w, hh); cam.updateProjectionMatrix(); };
  taille(); addEventListener('resize', taille);
  let vu = true, kE = 0, t0 = performance.now();
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vu = es[0].isIntersecting; if (vu) requestAnimationFrame(image); }).observe(H);
  H.classList.add('at-pret');
  function image(t) {
    if (!vu) return;
    const el = (t - t0) / 1000;
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    camCible.lerp(viseC, RM ? 1 : .06); camVue.lerp(viseV, RM ? 1 : .05);
    const dv = camVue.clone().add(new THREE.Vector3(mx * (ouverte ? .25 : .9), my * (ouverte ? .15 : .5), 0));
    cam.position.lerp(dv, RM ? 1 : .06); cam.lookAt(camCible); decale();
    if (!RM) visePtr();
    // l'écran fait défiler les sites
    const k = Math.floor(el / 4) % ecrans.length; if (k !== kE) { kE = k; dalle.material.map = ecrans[k]; dalle.material.needsUpdate = true; }
    // horloge
    const d = new Date(); ah.rotation.z = -((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2; am.rotation.z = -(d.getMinutes() / 60) * Math.PI * 2;
    // flash de l'appareil
    const fa = (t - flashT) / 1000; flashL.intensity = fa < .35 ? (1 - fa / .35) * 40 : 0;
    // vinyle
    if (vinyle) { disque.rotation.y -= .06; rond.rotation.y -= .06; }
    // plante qui frissonne
    const pa = (t - plantT) / 1000; feuilles.forEach((f, i) => { f.rotation.z = Math.cos(i) * .5 + (pa < 1.2 ? Math.sin(pa * 18 + i) * .15 * (1 - pa / 1.2) : Math.sin(el * .8 + i) * .02); });
    // vapeur : le matin, ou quand on touche la tasse
    const va = (t - tasseT) / 1000, fume = moment === 'matin' || va < 4;
    vap.forEach((v, i) => { const p = ((el * .35 + i / vap.length) % 1); v.position.set(Math.sin(p * 9 + i) * .02, .16 + p * .45, 0); v.scale.setScalar(1 + p * 2.2); v.material.opacity = fume ? (1 - p) * .35 : 0; });
    // guirlande
    guir.forEach((b, i) => b.material.color.setStyle(['#FFD9A0', '#C5E3D2', '#E3C8C5'][(i + Math.floor(el * 2)) % 3]));
    rd.render(sc, cam);
    requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
}
