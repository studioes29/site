/* L'atelier de Studio ES : une photographie de synthèse (rendu Cycles) rendue vivante en WebGL.
   Parallaxe par carte de profondeur, zones cliquables par carte d'identifiants, écran, horloge et téléphone en direct,
   lampe allumable, vapeur, poussière, néon. Quatre ambiances selon l'heure du visiteur. */
import { Bureau } from '/js/atelier/bureau.js?v=1';
(() => {
  const H = document.getElementById('hx'); if (!H) return;
  const C = H.querySelector('.at-c'), eti = H.querySelector('.at-eti'), pan = H.querySelector('.at-pan');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOB = matchMedia('(max-width: 860px)').matches, V = MOB ? 'p' : 'l';
  const R = '/js/atelier/r/';

  /* ---------- l'heure du visiteur ---------- */
  const now = new Date(), hr = now.getHours() + now.getMinutes() / 60;
  const moment = hr < 6.5 || hr >= 21 ? 'nuit' : hr < 9.5 ? 'matin' : hr < 17.5 ? 'jour' : 'soir';
  H.dataset.moment = moment;
  if (moment !== 'nuit') { H.removeAttribute('data-dark'); dispatchEvent(new Event('scroll')); }
  let lampe = moment === 'soir' || moment === 'nuit';
  const nom = (l) => R + V + '-' + moment + '-' + (MOB || (moment !== 'soir' && moment !== 'nuit') ? (moment === 'soir' || moment === 'nuit' ? 1 : 0) : (l ? 1 : 0)) + '.webp';
  H.style.setProperty('--at-img', 'url("' + nom(lampe) + '")');

  /* ---------- panneau et puces (fonctionnent même sans WebGL) ---------- */
  let ouverte = null, vue = null;
  const presse = () => H.querySelectorAll('[data-at]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.at === ouverte)));
  const ouvre = (id) => {
    ouverte = id; H.classList.add('at-zoom');
    pan.querySelectorAll('.at-z').forEach(x => x.hidden = x.dataset.z !== id); pan.hidden = false;
    requestAnimationFrame(() => pan.classList.add('on')); presse(); if (vue) vue.vise(id);
  };
  const ferme = () => {
    ouverte = null; H.classList.remove('at-zoom'); pan.classList.remove('on');
    setTimeout(() => { if (!ouverte) pan.hidden = true; }, 400); presse(); if (vue) vue.vise(null);
  };
  pan.querySelectorAll('[data-ferme]').forEach(b => b.addEventListener('click', ferme));
  H.querySelectorAll('[data-at]').forEach(b => b.addEventListener('click', () => {
    if (ouverte === b.dataset.at) ferme(); else { if (vue && b.dataset.at === 'photo') vue.flash(); ouvre(b.dataset.at); }
  }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && ouverte) ferme(); });

  /* ---------- WebGL ---------- */
  const gl = C.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: false });
  if (!gl) return;
  const charge = (u) => new Promise((ok, ko) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = ko; i.src = u; });
  const ZID = { photo: 1, web: 2, graph: 3, fill: 4, contact: 5, lampe: 6, plante: 7, tasse: 8, neon: 9, declic: 10 };
  const ZNOM = Object.fromEntries(Object.entries(ZID).map(([k, v]) => [v, k])); ZNOM[11] = 'web'; ZNOM[12] = 'chat';
  const INFO = { photo: 'Photographie · les reportages', web: 'Web · sites et applications', graph: 'Design graphique · identités et campagnes', fill: 'Fill · la communication externalisée', contact: 'Contact · parlons de votre projet', declic: 'Déclic · le jeu', lampe: 'La lampe', tasse: 'Un café ?', neon: 'Le néon', plante: 'La plante', chat: 'Le chat' };

  Promise.all([fetch(R + V + '.json').then(r => r.json()), charge(nom(lampe)).catch(() => charge(R + V + '-jour-0.webp')), charge(R + V + '-mask.png'), charge(R + V + '-depth.webp'), charge('/p/t/helena-7.webp')])
    .then(a => demarre(...a)).catch(e => console.warn('atelier', e));

  function demarre(M, imA, imM, imD, imP) {
    /* carte des zones côté processeur pour le survol */
    const mc = document.createElement('canvas'); mc.width = imM.width; mc.height = imM.height;
    const mx2 = mc.getContext('2d', { willReadFrequently: true }); mx2.drawImage(imM, 0, 0);
    const md = mx2.getImageData(0, 0, mc.width, mc.height).data;
    const zoneA = (u, v) => { const x = Math.min(mc.width - 1, Math.max(0, u * mc.width | 0)), y = Math.min(mc.height - 1, Math.max(0, v * mc.height | 0)); return Math.round(md[(y * mc.width + x) * 4] / 20); };

    /* téléphone : écran dessiné en direct */
    const pc = document.createElement('canvas'); pc.width = 330; pc.height = 660; const px = pc.getContext('2d');
    const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const fonte = (getComputedStyle(document.documentElement).getPropertyValue('--d') || '').trim() || 'sans-serif';
    const dessineTel = () => {
      const d = new Date(), s = Math.max(330 / imP.width, 660 / imP.height);
      px.fillStyle = '#000'; px.fillRect(0, 0, 330, 660);
      px.globalAlpha = .72; px.drawImage(imP, (330 - imP.width * s) / 2, (660 - imP.height * s) / 2, imP.width * s, imP.height * s); px.globalAlpha = 1;
      px.fillStyle = '#fff'; px.textAlign = 'center';
      px.font = '700 84px ' + fonte; px.fillText(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), 165, 150);
      px.font = '500 20px ' + fonte; px.fillText(JOURS[d.getDay()] + ' ' + d.getDate() + ' ' + MOIS[d.getMonth()], 165, 186);
      px.fillStyle = 'rgba(255,255,255,.88)'; px.beginPath(); px.roundRect ? px.roundRect(26, 268, 278, 76, 20) : px.rect(26, 268, 278, 76); px.fill();
      px.fillStyle = '#111'; px.textAlign = 'left'; px.font = '700 16px ' + fonte; px.fillText('Nouveau message', 44, 296); px.fillStyle = '#444'; px.font = '400 15px ' + fonte; px.fillText('« On se cale un shooting ? »', 44, 322);
    };
    dessineTel();

    /* l'écran principal : un vrai bureau */
    const lien = (u, ext) => { if (ext || /^https?:/.test(u)) window.open(u, '_blank', 'noopener'); else location.href = u; };
    const bureau = new Bureau({ fonte, actions: {
      lien,
      reportage: (id) => { const b = document.createElement('button'); b.dataset.r = id; b.hidden = true; H.appendChild(b); b.click(); b.remove(); },
      devis: () => { const b = H.querySelector('[data-est]'); if (b) b.click(); }
    } });
    /* écran du portable (bibliothèque photo) et téléphone, réunis dans un atlas */
    const portable = new Bureau({ fonte, h: 1041, fond: '/p/t/the-avener-1.webp' }); portable.ouvre('photos');
    const atlas = document.createElement('canvas'); atlas.width = 1930; atlas.height = 1041; const ax_ = atlas.getContext('2d');
    const majAtlas = () => { ax_.drawImage(portable.dessine(), 0, 0); ax_.drawImage(pc, 1600, 0); return atlas; };

    /* ---------- shaders ---------- */
    const VS = 'attribute vec2 p;varying vec2 u;void main(){u=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}';
    const FS = `precision highp float;varying vec2 u;
uniform sampler2D tA,tB,tM,tD,tS,tP,tC,tK,tF,tG;uniform vec4 uW;uniform mat3 uFs,uFp,uFl,uGs,uGp,uGl;uniform vec4 uR,uDR,uRC,uKR,uAP;uniform vec2 uPar,uTx,uTea;uniform float uMix,uHov,uT,uFl,uNe,uPl,uSt,uDu,uB,uK,uCM,uKF,uKOn,uCZ;
uniform mat3 uHs,uHp,uHl,uHs2,uHp2;
float zid(vec2 q){return floor(texture2D(tM,q).r*255./20.+.5);}
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p*=2.03;a*=.5;}return s;}
vec2 hom(mat3 m,vec2 q){vec3 r=m*vec3(q,1.);return r.xy/r.z;}
float bord(vec2 s,vec2 k){vec2 e=min(s,1.-s)*k;return clamp(min(e.x,e.y),0.,1.);}
bool dans(vec2 s){return s.x>0.&&s.x<1.&&s.y>0.&&s.y<1.;}
vec3 tel(vec2 p){return texture2D(tP,uAP.xy+p*uAP.zw).rgb;}
vec3 ecr(vec3 c,vec2 q,mat3 hs,mat3 hp,mat3 hl){vec2 s=hom(hs,q);if(dans(s))c=mix(c,texture2D(tS,s).rgb*uB+c*.04,bord(s,vec2(400.,225.)));vec2 p=hom(hp,q);if(dans(p))c=mix(c,tel(p)*uB*.95+c*.05,bord(p,vec2(70.,140.)));vec2 l=hom(hl,q);if(dans(l))c=mix(c,texture2D(tP,vec2(l.x*.829,l.y)).rgb*uB*.9+c*.05,bord(l,vec2(300.,200.)));return c;}
vec3 grade(vec3 c){c=clamp(c,0.,1.);c=mix(c,c*c*(3.-2.*c),uK);float lu=dot(c,vec3(.299,.587,.114));return mix(vec3(lu),c,1.+uK*.25);}
void main(){
  vec2 q=uR.xy+u*uR.zw;
  float dep=texture2D(tD,q).r;
  q+=uPar*(dep-.62)*vec2(.016,.011);
  float z=zid(q);
  if(z==7.)q.x+=sin(uT*2.1+q.y*60.)*.0007*uPl;
  vec3 c=mix(texture2D(tA,q).rgb,texture2D(tB,q).rgb,uMix);
  if(uKOn>.5){vec2 kl=(q-uKR.xy)/uKR.zw;if(dans(kl)){vec2 cell=vec2(mod(uKF,6.),floor(uKF/6.));vec2 kq=(cell+clamp(kl,.004,.996))/vec2(6.,4.);float fe=smoothstep(0.,.14,min(min(kl.x,1.-kl.x),min(kl.y,1.-kl.y)));c=mix(c,texture2D(tK,kq).rgb,fe*uKOn);}}
  vec2 s=hom(uHs,q);
  if(dans(s)&&z>10.5){vec3 e=texture2D(tS,s).rgb;c=mix(c,e*uB+c*.04,bord(s,vec2(400.,225.)));}
  vec2 p2=hom(uHp,q);
  if(dans(p2)&&z==5.){c=mix(c,tel(p2)*uB*.95+c*.05,bord(p2,vec2(70.,140.)));}
  vec2 l2=hom(uHl,q);
  if(dans(l2)&&z==2.){vec2 la=vec2(l2.x*.829,l2.y);c=mix(c,texture2D(tP,la).rgb*uB*.9+c*.05,bord(l2,vec2(300.,200.)));}
  c=grade(c);
  if(z==9.)c*=uNe;
  if(uSt>0.){vec2 l=(q-uTea)/vec2(.022,.07);l.y=-l.y;if(l.y>0.&&l.y<1.4&&abs(l.x)<1.2){float n=fbm(vec2(l.x*2.2+sin(l.y*3.-uT*.8)*.6,l.y*2.-uT*.55));float m=smoothstep(.45,.85,n)*(1.-smoothstep(.2,1.4,l.y))*smoothstep(1.2,.2,abs(l.x))*smoothstep(0.,.15,l.y);c+=vec3(.95)*m*.22*uSt;}}
  if(uDu>0.&&q.x>uDR.x&&q.x<uDR.z&&q.y>uDR.y&&q.y<uDR.w){vec2 g=(q+vec2(uT*.004,-uT*.0025))*vec2(160.,90.);vec2 i=floor(g);vec2 o=vec2(h21(i),h21(i+7.3))*.8+.1;float b=smoothstep(.06,0.,length(fract(g)-o))*step(.86,h21(i+3.1))*(.5+.5*sin(uT*1.5+h21(i)*40.));c+=vec3(1.,.95,.85)*b*.3*uDu;}
  float zh=z>10.5?2.:z;if(uHov>0.&&uW.x>.99&&zh==uHov){vec2 t=uTx*1.5;float e=0.;for(int j=0;j<4;j++){vec2 o=j==0?vec2(t.x,0.):j==1?vec2(-t.x,0.):j==2?vec2(0.,t.y):vec2(0.,-t.y);float n=zid(q+o);n=n>10.5?2.:n;e+=step(.5,abs(n-zh));}c=c*1.06+.02+vec3(1.)*min(e,1.)*.22;}
  if(uW.x<1.){vec2 q2=uRC.xy+u*uRC.zw;vec3 o=c*uW.x;
    if(uW.y>0.)o+=grade(ecr(texture2D(tF,q2).rgb,q2,uFs,uFp,uFl))*uW.y;
    if(uW.z>0.)o+=grade(ecr(texture2D(tG,q2).rgb,q2,uGs,uGp,uGl))*uW.z;
    if(uW.w>0.){vec3 cc=texture2D(tC,q2).rgb;
    if(uCZ==1.){vec2 s2=hom(uHs2,q2);if(dans(s2))cc=mix(cc,texture2D(tS,s2).rgb*uB+cc*.04,bord(s2,vec2(400.,225.)));}
    if(uCZ==2.){vec2 s2=hom(uHp2,q2);if(dans(s2))cc=mix(cc,tel(s2)*uB*.95+cc*.05,bord(s2,vec2(70.,140.)));}
    o+=grade(cc)*uW.w;}
    c=o;}
  c=mix(c,vec3(1.),uFl);
  c+=(h21(u*vec2(1931.,1733.)+fract(uT))-.5)*.016;
  gl_FragColor=vec4(c,1.);
}`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
    const UL = {}, U = (k) => UL[k] || (UL[k] = gl.getUniformLocation(pr, k));
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    const tex = (unit, src, near) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
      const f = near ? gl.NEAREST : gl.LINEAR;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const maj = (unit, t, src) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src); };
    const T = { A: tex(0, imA), B: tex(1, imA), M: tex(2, imM, true), D: tex(3, imD), S: tex(4, bureau.dessine()), P: tex(5, majAtlas()), C: tex(6, imA), K: tex(7, imD) };
    bureau.pret.then(() => { maj(4, T.S, bureau.dessine()); });
    portable.pret.then(() => { maj(5, T.P, majAtlas()); });
    ['tA', 'tB', 'tM', 'tD', 'tS', 'tP', 'tC', 'tK', 'tF', 'tG'].forEach((n, i) => gl.uniform1i(U(n), i));
    gl.uniform4f(U('uAP'), 1600 / 1930, 0, 330 / 1930, 660 / 1041);
    gl.uniform2f(U('uTx'), 1 / imM.width, 1 / imM.height);

    /* homographies : coordonnées image -> carré unité de chaque écran (coins HG, HD, BD, BG) */
    const homo = (P) => {
      const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = P;
      const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
      const den = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den;
      const A = x1 - x0 + g * x1, B = x3 - x0 + h * x3, Cc = x0, D = y1 - y0 + g * y1, E = y3 - y0 + h * y3, F = y0, G = g, Hh = h, I = 1;
      const co = [E * I - F * Hh, -(B * I - Cc * Hh), B * F - Cc * E, -(D * I - F * G), A * I - Cc * G, -(A * F - Cc * D), D * Hh - E * G, -(A * Hh - B * G), A * E - B * D];
      const m = new Float32Array([co[0], co[3], co[6], co[1], co[4], co[7], co[2], co[5], co[8]]); m.js = co; return m;
    };
    const HS = homo(M.mon_screen); gl.uniformMatrix3fv(U('uHs'), false, HS);
    const versEcran = (u, v) => { const k = HS.js, w = k[6] * u + k[7] * v + k[8]; return [(k[0] * u + k[1] * v + k[2]) / w, (k[3] * u + k[4] * v + k[5]) / w]; };
    const surEcran = (u, v) => { const [a, b] = versEcran(u, v); return a > 0 && a < 1 && b > 0 && b < 1 ? [a, b] : null; };
    gl.uniformMatrix3fv(U('uHp'), false, homo(M.ph_scr));
    gl.uniformMatrix3fv(U('uHl'), false, M.lap_scr ? homo(M.lap_scr) : new Float32Array([0, 0, 0, 0, 0, 0, -5, -5, 1]));
    gl.uniform2f(U('uTea'), M.tea[0], M.tea[1]);
    gl.uniform4fv(U('uDR'), M.poussiere || [0, 0, 0, 0]);
    gl.uniform1f(U('uB'), { nuit: .82, soir: .88, matin: .9, jour: .93 }[moment]);
    gl.uniform1f(U('uK'), { nuit: .08, soir: .2, matin: .3, jour: .42 }[moment]);
    gl.uniform1f(U('uDu'), moment === 'jour' || moment === 'matin' ? 1 : 0);

    /* ---------- cadrage ---------- */
    const IA = imA.width / imA.height, base = { x: (M.cadre || [.5, .5])[0], y: (M.cadre || [.5, .5])[1] };
    let W = 1, Hh = 1, ech = 1, ec = 1, cx = base.x, cy = base.y, tcx = base.x, tcy = base.y, glisse = 0;
    const rect = (s, x, y) => {
      const ca = W / Hh; let w = 1, h = 1; if (ca > IA) h = IA / ca; else w = ca / IA;
      w /= s * 1.035; h /= s * 1.035;
      x = Math.min(1 - w / 2, Math.max(w / 2, x)); y = Math.min(1 - h / 2, Math.max(h / 2, y));
      return [x - w / 2, y - h / 2, w, h];
    };
    const taille = () => {
      const d = Math.min(devicePixelRatio || 1, MOB ? 2 : 1.75); W = H.clientWidth; Hh = H.clientHeight;
      C.width = Math.round(W * d); C.height = Math.round(Hh * d); gl.viewport(0, 0, C.width, C.height);
    };
    taille(); addEventListener('resize', taille);
    let tw = null; // mouvement de caméra en cours
    const bouge = (s2, x2, y2) => { tw = { t0: performance.now(), d: RM ? 1 : 1100, a: [ec, cx, cy], b: [s2, x2, y2] }; ech = s2; tcx = x2; tcy = y2; };
    const zoneLibre = () => {
      let ax0 = 28, ay0 = MOB ? 70 : 92, ax1 = W - 28, ay1 = Hh - (MOB ? 24 : 96);
      if (!pan.hidden) { if (MOB) ay1 = Math.min(ay1, pan.offsetTop - 18); else ax1 = Math.min(ax1, pan.offsetLeft - 32); }
      return [ax0, ay0, ax1, ay1];
    };
    const zoomVers = (id, d) => {
      const b = (M.cibles && M.cibles[id]) || M.zones[id]; if (!b) return;
      const [ax0, ay0, ax1, ay1] = zoneLibre(), [x0, y0, x1, y1] = b, zw = x1 - x0, zh = y1 - y0, r0 = rect(1, .5, .5);
      const s2 = Math.max(1, Math.min(id === 'web' ? 2.6 : 2.2, Math.min((ax1 - ax0) / W * r0[2] / zw, (ay1 - ay0) / Hh * r0[3] / zh) * .94));
      const vw = r0[2] / s2, vh = r0[3] / s2;
      bouge(s2, (x0 + x1) / 2 - ((ax0 + ax1) / 2 / W - .5) * vw, (y0 + y1) / 2 - ((ay0 + ay1) / 2 / Hh - .5) * vh);
      if (d) tw.d = d;
    };
    /* plans rapprochés de face (ordinateur) : un vrai travelling calculé en rendu (32 images) mène de la vue d'ensemble au plan frontal */
    const CL = M.close || {}, closeIm = {}, ZONES5 = ['web', 'photo', 'graph', 'fill', 'contact'], VOLS = M.vols || {}, NV = M.nv || 0;
    const chargeClose = (id) => closeIm[id] || (closeIm[id] = charge(R + 'c-' + id + '-' + moment + '.webp').catch(() => null));
    const volIm = {}, unites = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    const chargeVol = (id) => volIm[id] || (volIm[id] = (VOLS[id] && unites >= 10 && !RM ? Promise.all(Array.from({ length: NV - 1 }, (_, k) => charge(R + 'v/' + id + '-' + moment + '-' + String(k + 1).padStart(2, '0') + '.webp'))) : Promise.reject()).catch(() => null));
    if (!MOB && M.closeups) setTimeout(() => { let k = Promise.resolve(); ZONES5.forEach(id => { k = k.then(() => chargeClose(id)).then(() => chargeVol(id)); }); }, 2500);
    let cz = null, cm = 0, cmT = null, cT0 = 0, jeton = 0, vol = null;
    const HS2 = CL.web ? homo(CL.web.mon_screen) : null; if (HS2) gl.uniformMatrix3fv(U('uHs2'), false, HS2);
    if (CL.contact) gl.uniformMatrix3fv(U('uHp2'), false, homo(CL.contact.ph_scr));
    const fondu = (to, d, quand = 0) => { cmT = { t0: performance.now() + quand, a: cm, b: to, d: RM ? 1 : d }; };
    /* images du travelling : trois textures tournantes sur les unités 8 et 9 */
    const NUL = new Float32Array([0, 0, 0, 0, 0, 0, -5, -5, 1]), hCache = {};
    const TFp = unites >= 10 ? [0, 1, 2].map(() => ({ t: tex(10, imD), k: -1, u: 0 })) : [];
    const lie = (unit, id, k, garde) => {
      let e = TFp.find(o => o.k === id + k);
      if (!e) { e = TFp.filter(o => o.k !== id + garde).sort((a, b) => a.u - b.u)[0]; gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, e.t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, volIm[id].v[k - 1]); e.k = id + k; }
      e.u = performance.now(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, e.t);
      const c = hCache[id + k] || (hCache[id + k] = ['mon_screen', 'ph_scr', 'lap_scr'].map(n => { const P = VOLS[id][k][n]; return P.some(p => p[2] <= .02) ? NUL : homo(P); }));
      const L = unit === 8 ? ['uFs', 'uFp', 'uFl'] : ['uGs', 'uGp', 'uGl']; L.forEach((n, i) => gl.uniformMatrix3fv(U(n), false, c[i]));
    };
    const lisse = (x) => x * x * (3 - 2 * x), lerpR = (a, b, e) => a.map((v, i) => v + (b[i] - v) * e);
    const rectBase = () => rect(1, base.x + glisse, base.y);
    const volU = (t) => { if (!vol) return 0; const p = Math.min(1, Math.max(0, (t - vol.t0) / vol.d)); return vol.u0 + (vol.u1 - vol.u0) * p; };
    const decolle = (id, u0, u1, fin) => {
      const D = u1 > u0 ? 1500 : 1250;
      vol = { id, u0, u1, t0: performance.now(), d: Math.max(1, Math.abs(u1 - u0) / NV * D), fin };
      cmT = null; cm = 0; tw = null;
    };
    const vise = (id) => {
      const j = ++jeton;
      const part = () => {
        if (j !== jeton) return;
        if (!id) { cz = null; vol = null; bouge(1, base.x + glisse, base.y); return; }
        if (id === 'web' && auto) bureau.ouvre('fill');
        if (MOB || !M.closeups || !ZONES5.includes(id)) { zoomVers(id, 950); return; }
        Promise.all([chargeClose(id), chargeVol(id)]).then(([im, fr]) => {
          if (j !== jeton) return;
          if (!im) { zoomVers(id, 950); return; }
          maj(6, T.C, im); gl.uniform1f(U('uCZ'), id === 'web' ? 1 : id === 'contact' ? 2 : 0);
          if (!fr) { /* repli : glissement puis fondu */ zoomVers(id, 950); cz = id; cT0 = performance.now(); fondu(1, 520, 700); return; }
          volIm[id].v = fr; cz = id;
          if (lampe !== lampe0) basculeLampe();
          vol = null; ec = ech = 1; cx = tcx = base.x + glisse; cy = tcy = base.y;
          decolle(id, 0, NV, () => { cm = 1; cT0 = performance.now(); });
        });
      };
      /* retour : on refait le chemin à l'envers, depuis là où se trouve la caméra */
      if (vol || (cz && cm > .01 && volIm[cz] && volIm[cz].v)) {
        const z = vol ? vol.id : cz, u = vol ? volU(performance.now()) : NV;
        decolle(z, u, 0, () => { cz = null; vol = null; part(); });
        return;
      }
      if (cm > .01) { fondu(0, 320); setTimeout(() => { if (j === jeton) { cz = null; if (!id) bouge(1, base.x + glisse, base.y); else part(); } }, 320); return; }
      part();
    };
    const rectClose = (t, derive = 1) => {
      const [ax0, ay0, ax1, ay1] = zoneLibre(), sC = 1.1 + (derive ? Math.min(.05, Math.max(0, t - cT0) / 1000 * .006) : 0), r0 = rect(sC, .5, .5);
      return rect(sC, .5 - ((ax0 + ax1) / 2 / W - .5) * r0[2], .5 - ((ay0 + ay1) / 2 / Hh - .5) * r0[3]);
    };
    const versEcran2 = (u, v) => { const k = HS2.js, w = k[6] * u + k[7] * v + k[8]; return [(k[0] * u + k[1] * v + k[2]) / w, (k[3] * u + k[4] * v + k[5]) / w]; };
    /* le chat : courte boucle (tête et queue) calculée en rendu, rejouée par moments */
    let kIm = null; const lampe0 = lampe;
    if (!MOB && M.chat) charge(R + 'l-chat-' + moment + '.webp').then(im => { kIm = im; maj(7, T.K, im); gl.uniform4fv(U('uKR'), M.chat.rect); }).catch(() => {});

    /* ---------- interactions ---------- */
    let tx = 0, ty = 0, mx = 0, my = 0, survol = 0, flT = -9e9, plT = -9e9, teT = -9e9, neT = -9e9, mixT = -1, chargeB = null, imgB = null, enVue = true;
    const versImage = (e) => { const r = C.getBoundingClientRect(), R0 = rect(ec, cx, cy); return [R0[0] + (e.clientX - r.left) / r.width * R0[2], R0[1] + (e.clientY - r.top) / r.height * R0[3]]; };
    const ecranSous = (e) => {
      if (vol) return null;
      if (cm > .5 && cz === 'web' && HS2) { const r = C.getBoundingClientRect(), R2 = rectClose(performance.now()); const q2 = [R2[0] + (e.clientX - r.left) / r.width * R2[2], R2[1] + (e.clientY - r.top) / r.height * R2[3]]; const [a, b] = versEcran2(...q2); return a > 0 && a < 1 && b > 0 && b < 1 ? [a, b] : null; }
      if (ouverte === 'web' && cm < .01) return surEcran(...versImage(e));
      return null;
    };
    const actif = (z) => { const n = ZNOM[z]; if (!n) return 0; if ((n === 'neon' || n === 'lampe') && moment !== 'nuit' && moment !== 'soir') return 0; if (n === 'lampe' && MOB) return 0; return z; };
    let dragX = null, dragged = false;
    C.addEventListener('pointerdown', e => { dragX = e.clientX; dragged = false; });
    addEventListener('pointerup', () => { dragX = null; });
    C.addEventListener('pointermove', e => {
      const r = C.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (MOB && dragX !== null && !ouverte) {
        const dx = e.clientX - dragX; if (Math.abs(dx) > 4) dragged = true; dragX = e.clientX;
        const r0 = rect(1, .5, .5); glisse = Math.max(-.5, Math.min(.5, glisse - dx / W * r0[2])); tcx = base.x + glisse;
      }
      if (e.pointerType !== 'mouse') return;
      const pi = versImage(e), se = ecranSous(e);
      if (se) { const sur = bureau.survole(...se); C.style.cursor = sur ? 'pointer' : 'default'; if (survol) { survol = 0; eti.classList.remove('on'); } return; } else bureau.survole(null);
      if (cm > .5 || vol) { if (survol) { survol = 0; eti.classList.remove('on'); } C.style.cursor = ''; return; }
      const z = actif(zoneA(...pi) === 11 ? 2 : zoneA(...pi));
      if (z !== survol) { survol = z; C.style.cursor = z ? 'pointer' : ''; eti.textContent = INFO[ZNOM[z]] || ''; eti.classList.toggle('on', !!z); }
      eti.style.transform = 'translate3d(' + (e.clientX - r.left + 16) + 'px,' + (e.clientY - r.top + 14) + 'px,0)';
    }, { passive: true });
    C.addEventListener('pointerleave', () => { tx = ty = 0; survol = 0; eti.classList.remove('on'); C.style.cursor = ''; });
    C.addEventListener('click', e => {
      if (dragged) return;
      const pi = versImage(e), se = ecranSous(e);
      if (se) { auto = false; bureau.clic(...se); return; }
      if (vol) { if (vol.u1 > 0) ferme(); return; }
      if (cm > .5) { ferme(); return; }
      const z0 = zoneA(...pi), z = actif(z0 === 11 ? 2 : z0), n = ZNOM[z], t = performance.now();
      if (!n) { if (ouverte) ferme(); return; }
      if (n === 'photo') flT = t;
      if (ZID[n] <= 5) { ouvre(n); return; }
      if (n === 'lampe') basculeLampe();
      if (n === 'plante') plT = t;
      if (n === 'tasse') teT = t;
      if (n === 'neon') neT = t;
      if (n === 'chat') { eti.textContent = 'Miaou.'; eti.classList.add('on'); setTimeout(() => { eti.textContent = INFO.chat; }, 1400); }
      if (n === 'declic') window.open('https://declic.studioes.fr/', '_blank', 'noopener');
    });

    /* lampe : fondu entre les deux rendus */
    const basculeLampe = () => {
      if (mixT >= 0) return;
      (chargeB || (chargeB = charge(nom(!lampe)))).then(im => { imgB = im; maj(1, T.B, im); mixT = performance.now(); });
    };
    if (!MOB && (moment === 'soir' || moment === 'nuit')) setTimeout(() => { if (!chargeB) { chargeB = charge(nom(!lampe)); chargeB.catch(() => {}); } }, 5000);

    /* écran : le bureau change de fenêtre tout seul tant qu'on n'y touche pas ; téléphone : l'heure tourne */
    let auto = true, kA = 0; const CYCLE = ['fill', 'photos', 'fill', 'graph', 'fill', 'web'];
    /* l'écran principal reste sur Fill tant qu'on n'y touche pas */
    setInterval(() => { bureau.sale = true; dessineTel(); maj(5, T.P, majAtlas()); }, 15000);
    vue = { vise, flash: () => { flT = performance.now(); } };
    if (location.search.includes('atdbg')) window.__at = { etat: () => ({ ec, cx, cy, ech, tcx, tcy, W, Hh, r: rect(ec, cx, cy), cib: M.cibles, panL: pan.offsetLeft, panH: pan.hidden }), bureau, ecranDe: (x, y) => { const pi = versImage({ clientX: x, clientY: y }); return [pi, versEcran(...pi), ec, cx, cy]; }, versClient: (su, sv) => {
      // inverse : coordonnées écran -> coordonnées image (quadrilatère) -> client
      const P = M.mon_screen, lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const top = lerp(P[0], P[1], su), bot = lerp(P[3], P[2], su), q = lerp(top, bot, sv), R0 = rect(ec, cx, cy), r = C.getBoundingClientRect();
      for (let it = 0; it < 8; it++) { const e0 = versEcran(q[0], q[1]), h = 1e-4, ex = versEcran(q[0] + h, q[1]), ey = versEcran(q[0], q[1] + h);
        const a11 = (ex[0] - e0[0]) / h, a21 = (ex[1] - e0[1]) / h, a12 = (ey[0] - e0[0]) / h, a22 = (ey[1] - e0[1]) / h, dt = a11 * a22 - a12 * a21, du = su - e0[0], dv = sv - e0[1];
        q[0] += (a22 * du - a12 * dv) / dt; q[1] += (-a21 * du + a11 * dv) / dt; }
      return [r.left + (q[0] - R0[0]) / R0[2] * r.width, r.top + (q[1] - R0[1]) / R0[3] * r.height];
    } };
    if (ouverte) vise(ouverte);

    /* ---------- boucle ---------- */
    const t0 = performance.now(); let tp = 0;
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !enVue) { enVue = true; requestAnimationFrame(image); } enVue = v; }).observe(H);
    H.classList.add('at-pret');
    function image(t) {
      if (!enVue) return;
      const el = (t - t0) / 1000, dt = Math.min(.1, Math.max(.001, (t - (tp || t)) / 1000)); tp = t; const k = RM ? 1 : 1 - Math.exp(-dt * 3.6), k2 = 1 - Math.exp(-dt * 3);
      const ax = MOB ? Math.sin(el * .35) * .4 : tx, ay = MOB ? Math.cos(el * .27) * .25 : ty;
      mx += (ax - mx) * k2; my += (ay - my) * k2;
      if (tw) {
        const p = Math.min(1, (t - tw.t0) / tw.d), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        ec = tw.a[0] + (tw.b[0] - tw.a[0]) * e; cx = tw.a[1] + (tw.b[1] - tw.a[1]) * e; cy = tw.a[2] + (tw.b[2] - tw.a[2]) * e;
        if (p >= 1) tw = null;
      } else { ec += (ech - ec) * k; cx += (tcx - cx) * k; cy += (tcy - cy) * k; }
      gl.uniform4fv(U('uR'), rect(ec, cx, cy));
      const pf = RM || ouverte === 'web' ? 0 : (ouverte ? .4 : 1); gl.uniform2f(U('uPar'), -mx * pf, -my * pf);
      gl.uniform1f(U('uT'), el);
      gl.uniform1f(U('uHov'), survol || 0);
      const fa = (t - flT) / 1000; gl.uniform1f(U('uFl'), fa < .45 ? Math.pow(1 - fa / .45, 2) * .75 : 0);
      const pa = (t - plT) / 1000; gl.uniform1f(U('uPl'), (survol === 7 ? .6 : 0) + (pa < 2 ? (1 - pa / 2) * 2.5 : 0) + .15);
      const ta = (t - teT) / 1000; gl.uniform1f(U('uSt'), Math.max(moment === 'matin' || moment === 'jour' ? .8 : 0, ta < 6 ? 1.3 * (1 - ta / 6) : 0));
      const na = (t - neT) / 1000; let ne = 1;
      if (na < 1.6) ne = (Math.sin(na * 47) > .2 || na > 1.2) ? 1 : .25; else if (Math.sin(el * 13) > .997) ne = .5;
      gl.uniform1f(U('uNe'), ne);
      if (bureau.sale) maj(4, T.S, bureau.dessine());
      if (mixT >= 0) {
        const m = Math.min(1, (t - mixT) / 700); gl.uniform1f(U('uMix'), m * m * (3 - 2 * m));
        if (m >= 1) { lampe = !lampe; maj(0, T.A, imgB); gl.uniform1f(U('uMix'), 0); chargeB = charge(nom(!lampe)); chargeB.catch(() => {}); mixT = -1; }
      } else gl.uniform1f(U('uMix'), 0);
      if (cmT) { const p = Math.min(1, Math.max(0, (t - cmT.t0) / cmT.d)), e = p * p * (3 - 2 * p); cm = cmT.a + (cmT.b - cmT.a) * e; if (p >= 1) cmT = null; }
      if (vol) {
        const u = volU(t), fini = (t - vol.t0) >= vol.d, e = lisse(Math.min(1, u / NV));
        const Rv = lerpR(rectBase(), vol.u1 > vol.u0 ? rectClose(t, 0) : rectClose(t), e);
        gl.uniform4fv(U('uR'), Rv); gl.uniform4fv(U('uRC'), Rv);
        const i = Math.min(NV - 1, Math.floor(u)), b = u - i;
        if (i >= 1) lie(8, vol.id, i, i + 1); if (i + 1 <= NV - 1) lie(9, vol.id, i + 1, i);
        gl.uniform4f(U('uW'), i === 0 ? 1 - b : 0, i >= 1 ? 1 - b : 0, i + 1 <= NV - 1 ? b : 0, i + 1 === NV ? b : 0);
        if (fini) { const f = vol.fin; vol = null; if (f) f(); }
      } else {
        gl.uniform4f(U('uW'), 1 - cm, 0, 0, cm); if (cm > 0) gl.uniform4fv(U('uRC'), rectClose(t));
      }
      if (kIm && lampe === lampe0 && mixT < 0 && !RM) { const per = 6.5, tt = el % per; gl.uniform1f(U('uKF'), tt < 2 ? Math.min(23, Math.floor(tt * 12)) : 0); gl.uniform1f(U('uKOn'), 1); } else gl.uniform1f(U('uKOn'), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(image);
    }
    requestAnimationFrame(image);
  }
})();
