/* Le bureau de l'écran principal de l'atelier : fond d'écran, barre de menus, dock et fenêtres.
   Dessiné dans un canvas 1600 × 900, plaqué sur l'écran de la scène. Les clics arrivent en coordonnées écran (0 à 1). */
const W = 1600, Hc = 900, DOCK_H = 88, MENU_H = 30;
const charge = (u) => new Promise((ok, ko) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = ko; i.src = u; });
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'], MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export const APPS = [
  { id: 'photos', nom: 'Photos' },
  { id: 'web', nom: 'Navigateur' },
  { id: 'graph', nom: 'Graphisme' },
  { id: 'fill', nom: 'Fill' },
  { id: 'declic', nom: 'Déclic' },
  { id: 'mail', nom: 'Contact' },
  { id: 'notes', nom: 'Notes' },
  { id: 'sep' },
  { id: 'corbeille', nom: 'Corbeille' }
];
const SITES = [
  { t: 'La Soute', u: 'lasoute.fr', im: '/projets/la-soute/img/d-accueil.webp', go: '/projets/la-soute/' },
  { t: 'Fill', u: 'fill.studioes.fr', im: '/projets/fill/img/d-accueil.webp', go: 'https://fill.studioes.fr/' },
  { t: 'Pierceval Tattoo', u: 'piercevaltattoo.fr', im: '/projets/pierceval-tattoo/img/d-hero.webp', go: '/projets/pierceval-tattoo/' },
  { t: 'Plateforme interne', u: 'outil interne', im: '/projets/plateforme-interne/img/d-maintenant.webp', go: '/projets/plateforme-interne/' }
];
const PHOTOS = [['franglish', 'franglish-3'], ['helena', 'helena-7'], ['rimk', 'rimk-1'], ['genezio', 'genezio-7'], ['matmatah', 'matmatah-10'], ['philippe-katerine', 'philippe-katerine-2'], ['la-fouine', 'la-fouine-7'], ['fatal-bazooka', 'fatal-bazooka-10']];
const GRAPH = [
  { t: 'L’Ellipse', im: '/projets/saisons-ellipse/img/cover-800.webp', go: '/projets/saisons-ellipse/' },
  { t: 'Académie des sports', im: '/projets/academie-des-sports/img/cover-800.webp', go: '/projets/academie-des-sports/' },
  { t: 'Maison Blé', im: '/projets/maison-ble/img/cover-800.webp', go: '/projets/maison-ble/' },
  { t: 'FL Auto', im: '/projets/fl-auto/img/cover-800.webp', go: '/projets/fl-auto/' }
];

export class Bureau {
  constructor({ fonte = 'sans-serif', fond = '/p/t/jahneration-6.webp', actions = {}, h = 900 } = {}) {
    this.H = h; this.c = document.createElement('canvas'); this.c.width = W; this.c.height = h; this.x = this.c.getContext('2d');
    this.f = fonte; this.act = actions; this.im = {}; this.app = 'fill'; this.onglet = 0; this.survol = null; this.zones = []; this.sale = true;
    this.pret = Promise.all([fond, ...SITES.map(s => s.im), ...PHOTOS.map(p => '/p/t/' + p[1] + '.webp'), ...GRAPH.map(g => g.im)]
      .map(u => charge(u).then(i => { this.im[u] = i; }).catch(() => {}))).then(() => { this.fond = this.im[fond]; this.sale = true; });
  }
  ouvre(id) { this.app = id; this.sale = true; }
  /* ---------- dessin ---------- */
  rr(x, y, w, h, r) { const c = this.x; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  couvre(im, x, y, w, h, haut) {
    if (!im) { this.x.fillStyle = '#2a2a2e'; this.x.fillRect(x, y, w, h); return; }
    const s = Math.max(w / im.width, h / im.height), iw = im.width * s, ih = im.height * s;
    this.x.save(); this.x.beginPath(); this.x.rect(x, y, w, h); this.x.clip(); this.x.drawImage(im, x + (w - iw) / 2, haut ? y : y + (h - ih) / 2, iw, ih); this.x.restore();
  }
  zone(x, y, w, h, fn, id) { this.zones.push({ x, y, w, h, fn, id }); }
  texte(t, x, y, taille, poids = 500, coul = '#fff', al = 'left') { const c = this.x; c.font = poids + ' ' + taille + 'px ' + this.f; c.fillStyle = coul; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(t, x, y); }
  icone(id, x, y, s) {
    /* icônes Studio ES : carré arrondi, aplat légèrement dégradé, pictogramme au trait de 1/16, couleurs de la charte */
    const c = this.x, INK = '#1A1918', PAP = '#F3EFE7', RGE = '#E04A2F', LAV = '#B9A6F5', VRT = '#2E7D5B';
    const fondI = { photos: [INK, '#2B2927'], web: [PAP, '#E4DDD0'], graph: [RGE, '#C73A22'], fill: [LAV, '#9F88EE'], declic: ['#232120', INK], mail: [VRT, '#246B4C'], notes: ['#FBF6EA', '#EFE6D2'], corbeille: ['#DCD7CF', '#C5BFB5'] }[id];
    c.save(); c.translate(x, y);
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = s * .18; c.shadowOffsetY = s * .06;
    const g = c.createLinearGradient(0, 0, 0, s); g.addColorStop(0, fondI[0]); g.addColorStop(1, fondI[1]);
    this.rr(0, 0, s, s, s * .24); c.fillStyle = g; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; this.rr(.5, .5, s - 1, s - 1, s * .24); c.stroke();
    const m = s / 2, lw = s / 16; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
    const trait = (col) => { c.strokeStyle = col; c.fillStyle = col; };
    if (id === 'photos') { trait(PAP); c.beginPath(); c.arc(m, m, s * .28, 0, 7); c.stroke(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.beginPath(); c.moveTo(m + Math.cos(a) * s * .28, m + Math.sin(a) * s * .28); c.lineTo(m + Math.cos(a + 2.1) * s * .11, m + Math.sin(a + 2.1) * s * .11); c.stroke(); } c.fillStyle = RGE; c.beginPath(); c.arc(s * .78, s * .22, s * .045, 0, 7); c.fill(); }
    if (id === 'web') { trait(INK); this.rr(s * .2, s * .26, s * .6, s * .48, s * .06); c.stroke(); c.fillStyle = RGE; this.rr(s * .2, s * .26, s * .6, s * .12, s * .05); c.fill(); trait(INK); c.beginPath(); c.moveTo(s * .3, s * .52); c.lineTo(s * .55, s * .52); c.moveTo(s * .3, s * .62); c.lineTo(s * .45, s * .62); c.stroke(); }
    if (id === 'graph') { trait(PAP); c.beginPath(); c.moveTo(m, s * .2); c.lineTo(m + s * .19, s * .5); c.lineTo(m, s * .76); c.lineTo(m - s * .19, s * .5); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(m, s * .2); c.lineTo(m, s * .5); c.stroke(); c.beginPath(); c.arc(m, s * .53, s * .04, 0, 7); c.fill(); }
    if (id === 'fill') { this.texte('fill', m, m + s * .02, s * .36, 800, INK, 'center'); c.fillStyle = INK; c.fillRect(s * .3, s * .7, s * .4, lw); }
    if (id === 'declic') { trait(RGE); const a = s * .24, b = s * .76, k = s * .12; [[a, a, 1, 1], [b, a, -1, 1], [a, b, 1, -1], [b, b, -1, -1]].forEach(([px, py, dx, dy]) => { c.beginPath(); c.moveTo(px, py + dy * k); c.lineTo(px, py); c.lineTo(px + dx * k, py); c.stroke(); }); c.beginPath(); c.arc(m, m, s * .07, 0, 7); c.fill(); }
    if (id === 'mail') { trait(PAP); this.rr(s * .2, s * .3, s * .6, s * .4, s * .05); c.stroke(); c.beginPath(); c.moveTo(s * .22, s * .33); c.lineTo(m, s * .53); c.lineTo(s * .78, s * .33); c.stroke(); }
    if (id === 'notes') { c.strokeStyle = RGE; c.lineWidth = lw * .7; c.beginPath(); c.moveTo(s * .3, s * .16); c.lineTo(s * .3, s * .84); c.stroke(); c.strokeStyle = 'rgba(26,25,24,.55)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(s * .38, s * (.32 + k * .13)); c.lineTo(s * .78, s * (.32 + k * .13)); c.stroke(); } }
    if (id === 'corbeille') { trait(INK); c.beginPath(); c.moveTo(s * .3, s * .32); c.lineTo(s * .34, s * .78); c.lineTo(s * .66, s * .78); c.lineTo(s * .7, s * .32); c.stroke(); c.beginPath(); c.moveTo(s * .24, s * .3); c.lineTo(s * .76, s * .3); c.moveTo(s * .42, s * .3); c.lineTo(s * .44, s * .22); c.lineTo(s * .56, s * .22); c.lineTo(s * .58, s * .3); c.stroke(); c.beginPath(); c.moveTo(s * .45, s * .42); c.lineTo(s * .46, s * .68); c.moveTo(s * .55, s * .42); c.lineTo(s * .54, s * .68); c.stroke(); }
    c.restore();
  }
  fenetre(titre, x, y, w, h) {
    const c = this.x;
    c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 50; c.shadowOffsetY = 18; this.rr(x, y, w, h, 14); c.fillStyle = '#F6F4EF'; c.fill(); c.restore();
    c.save(); this.rr(x, y, w, h, 14); c.clip(); c.fillStyle = '#E8E5DE'; c.fillRect(x, y, w, 44); c.restore();
    ['#EE6A5F', '#F5BE4F', '#62C554'].forEach((k, i) => { c.beginPath(); c.arc(x + 22 + i * 22, y + 22, 7, 0, 7); c.fillStyle = k; c.fill(); });
    this.zone(x + 14, y + 12, 18, 20, () => this.ouvre(null), 'fermer');
    this.texte(titre, x + w / 2, y + 23, 15, 600, '#3A3A3A', 'center');
    return { x, y: y + 44, w, h: h - 44 };
  }
  dessine(heure = new Date()) {
    const c = this.x; this.zones = [];
    this.couvre(this.fond, 0, 0, W, this.H);
    c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, 0, W, this.H);
    /* barre de menus */
    c.fillStyle = 'rgba(30,24,22,.38)'; c.fillRect(0, 0, W, MENU_H);
    this.texte('Studio ES', 22, MENU_H / 2, 15, 700);
    let mxp = 118; ['Fichier', 'Édition', 'Présentation', 'Fenêtre', 'Aide'].forEach(t => { this.texte(t, mxp, MENU_H / 2, 14, 400, 'rgba(255,255,255,.9)'); mxp += c.measureText(t).width + 26; });
    const hh = String(heure.getHours()).padStart(2, '0') + ':' + String(heure.getMinutes()).padStart(2, '0');
    this.texte(JOURS[heure.getDay()] + ' ' + heure.getDate() + ' ' + MOIS[heure.getMonth()] + '  ' + hh, W - 22, MENU_H / 2, 14, 500, '#fff', 'right');
    /* fenêtre ouverte */
    const A = this.app;
    if (A === 'fill' || A === 'web') {
      const S = A === 'fill' ? SITES[1] : SITES[this.onglet];
      const f = this.fenetre(A === 'fill' ? 'Fill' : 'Navigateur', 230, 70, 1140, 690);
      if (A === 'web') {
        SITES.filter(s => s.t !== 'Fill').forEach((s, i) => { const on = SITES[this.onglet] === s, tx = f.x + 150 + i * 210; this.rr(tx, f.y - 40, 200, 30, 8); c.fillStyle = on ? '#F6F4EF' : 'rgba(0,0,0,.05)'; c.fill(); this.texte(s.t, tx + 100, f.y - 25, 13, on ? 600 : 400, '#3A3A3A', 'center'); this.zone(tx, f.y - 40, 200, 30, () => { this.onglet = SITES.indexOf(s); this.sale = true; }); });
      }
      this.rr(f.x + 300, f.y + 8, f.w - 600, 30, 9); c.fillStyle = '#E8E5DE'; c.fill(); this.texte(S.u, f.x + f.w / 2, f.y + 23, 14, 500, '#555', 'center');
      this.couvre(this.im[S.im], f.x, f.y + 46, f.w, f.h - 46, true);
      this.zone(f.x, f.y + 46, f.w, f.h - 46, () => this.act.lien && this.act.lien(S.go));
    } else if (A === 'photos') {
      const f = this.fenetre('Photos · Reportages', 230, 70, 1140, 690);
      PHOTOS.forEach(([id, n], i) => { const cw = 262, ch = 300, x = f.x + 24 + (i % 4) * (cw + 12), y = f.y + 18 + Math.floor(i / 4) * (ch + 12); this.couvre(this.im['/p/t/' + n + '.webp'], x, y, cw, ch); if (this.survol === 'p' + i) { c.strokeStyle = '#fff'; c.lineWidth = 4; c.strokeRect(x + 2, y + 2, cw - 4, ch - 4); } this.zone(x, y, cw, ch, () => this.act.reportage && this.act.reportage(id), 'p' + i); });
    } else if (A === 'graph') {
      const f = this.fenetre('Graphisme · Projets', 230, 70, 1140, 690);
      GRAPH.forEach((g, i) => { const cw = 534, ch = 290, x = f.x + 24 + (i % 2) * (cw + 24), y = f.y + 20 + Math.floor(i / 2) * (ch + 22); this.couvre(this.im[g.im], x, y, cw, ch); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(x, y + ch - 40, cw, 40); this.texte(g.t, x + 16, y + ch - 20, 17, 600); this.zone(x, y, cw, ch, () => this.act.lien && this.act.lien(g.go)); });
    } else if (A === 'declic') {
      const f = this.fenetre('Déclic', 470, 150, 660, 520); c.fillStyle = '#101010'; c.fillRect(f.x, f.y, f.w, f.h);
      this.texte('DÉCLIC', f.x + f.w / 2, f.y + 140, 78, 800, '#fff', 'center');
      this.texte('Trois scènes, un seul déclenchement.', f.x + f.w / 2, f.y + 210, 20, 400, 'rgba(255,255,255,.75)', 'center');
      this.rr(f.x + f.w / 2 - 110, f.y + 290, 220, 58, 29); c.fillStyle = '#E04A2F'; c.fill(); this.texte('Jouer', f.x + f.w / 2, f.y + 319, 22, 700, '#fff', 'center');
      this.zone(f.x + f.w / 2 - 110, f.y + 290, 220, 58, () => this.act.lien && this.act.lien('https://declic.studioes.fr/', true));
    } else if (A === 'mail') {
      const f = this.fenetre('Nouveau message', 420, 120, 760, 560);
      this.texte('À :  contact@studioes.fr', f.x + 28, f.y + 34, 17, 500, '#333'); c.fillStyle = '#E2DED6'; c.fillRect(f.x + 20, f.y + 58, f.w - 40, 1);
      this.texte('Objet :  Mon projet', f.x + 28, f.y + 86, 17, 500, '#333'); c.fillRect(f.x + 20, f.y + 110, f.w - 40, 1);
      this.texte('Bonjour Ewen,', f.x + 28, f.y + 150, 17, 400, '#555');
      this.rr(f.x + f.w - 230, f.y + f.h - 80, 200, 52, 26); c.fillStyle = '#1E1E1E'; c.fill(); this.texte('Demander un devis', f.x + f.w - 130, f.y + f.h - 54, 16, 600, '#fff', 'center');
      this.zone(f.x + f.w - 230, f.y + f.h - 80, 200, 52, () => this.act.devis && this.act.devis());
    } else if (A === 'notes') {
      const f = this.fenetre('Notes', 520, 130, 560, 520); c.fillStyle = '#FFF8DC'; c.fillRect(f.x, f.y, f.w, f.h);
      this.texte('À faire cette semaine', f.x + 30, f.y + 40, 24, 700, '#2A2A2A');
      [['✓', 'Trier les photos du concert'], ['✓', 'Envoyer la galerie au client'], ['✓', 'Mettre le site en ligne'], ['○', 'Ranger le bureau'], ['○', 'Arroser la plante']].forEach(([k, t], i) => { this.texte(k + '  ' + t, f.x + 34, f.y + 100 + i * 46, 19, 400, k === '✓' ? '#888' : '#2A2A2A'); });
    } else if (A === 'corbeille') {
      const f = this.fenetre('Corbeille', 560, 260, 480, 260);
      this.texte('La corbeille est vide.', f.x + f.w / 2, f.y + f.h / 2 - 8, 20, 500, '#555', 'center');
    }
    /* dock */
    const apps = APPS, n = apps.length, s = 64, gap = 14, dw = apps.reduce((a, p) => a + (p.id === 'sep' ? 14 : s + gap), gap);
    let dx = (W - dw) / 2; const dy = this.H - DOCK_H - 10;
    this.rr(dx, dy, dw, DOCK_H, 24); c.fillStyle = 'rgba(245,240,232,.28)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.stroke();
    dx += gap;
    apps.forEach(p => {
      if (p.id === 'sep') { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(dx, dy + 16, 1.5, DOCK_H - 32); dx += 14; return; }
      const sz = this.survol === p.id ? s * 1.18 : s, ox = (sz - s) / 2;
      this.icone(p.id, dx - ox, dy + (DOCK_H - s) / 2 - ox * 2, sz);
      if (this.app === p.id) { c.fillStyle = '#fff'; c.beginPath(); c.arc(dx + s / 2, dy + DOCK_H - 7, 2.5, 0, 7); c.fill(); }
      if (this.survol === p.id) { this.rr(dx + s / 2 - 60, dy - 44, 120, 30, 8); c.fillStyle = 'rgba(30,30,30,.82)'; c.fill(); this.texte(p.nom, dx + s / 2, dy - 29, 14, 600, '#fff', 'center'); }
      this.zone(dx, dy, s, DOCK_H, () => this.ouvre(p.id), p.id);
      dx += s + gap;
    });
    this.sale = false;
    return this.c;
  }
  /* ---------- interactions (u, v entre 0 et 1) ---------- */
  touche(u, v) { const x = u * W, y = v * this.H; for (let i = this.zones.length - 1; i >= 0; i--) { const z = this.zones[i]; if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z; } return null; }
  survole(u, v) { const z = u === null ? null : this.touche(u, v), id = z ? (z.id || 'z') : null; if (id !== this.survol) { this.survol = id; this.sale = true; } return !!z; }
  clic(u, v) { const z = this.touche(u, v); if (z) { z.fn(); this.sale = true; return true; } return false; }
}
