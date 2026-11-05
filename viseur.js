/* Bannière « viseur » de l'accueil : les travaux du studio en profondeur, un collimateur d'autofocus fait la mise au point
   sur ce qu'il survole (le reste passe dans le flou), un clic déclenche (flash) puis ouvre le reportage ou l'étude de cas. */
(() => {
  const H = document.getElementById('hx'); if (!H) return;
  const champ = H.querySelector('.hv-champ'), af = H.querySelector('.hv-af'), fl = H.querySelector('.hv-flash'), tt = H.querySelector('.hv-t');
  const lbD = af.querySelector('.hv-lb span'), lbT = af.querySelector('.hv-lb b');
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOB = matchMedia('(max-width: 860px)').matches;
  const D = [...H.querySelectorAll('.hc')].filter(el => getComputedStyle(el).display !== 'none').map((el, i) => ({ el, z: parseFloat(el.style.getPropertyValue('--z')) || 0, i, b: -1, o: -1 }));
  H.classList.add('vj'); if (FINE) H.classList.add('cur');
  let tx = 0, ty = 0, mx = 0, my = 0, px = innerWidth / 2, py = innerHeight / 2, dedans = false, cible = null, focale = 0;
  let ax = px - 27, ay = py - 27, aw = 54, ah = 54, vu = true, t0 = performance.now(), auto = true, kAuto = 0, tAuto = 1500, gyro = false, bouge = 0;
  const fixe = (c) => {
    cible = c; af.classList.toggle('lock', !!c);
    if (c) { lbD.textContent = c.dataset.d; lbT.textContent = c.dataset.l; }
  };
  const flash = () => { if (RM) return; fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); };
  H.addEventListener('pointermove', e => {
    const r = H.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top;
    if (FINE) { tx = (px / r.width - .5) * 2; ty = (py / r.height - .5) * 2; dedans = true; bouge = performance.now(); if (auto) { auto = false; if (!cible || !cible.matches(':hover')) fixe(null); } }
  }, { passive: true });
  H.addEventListener('pointerleave', () => { dedans = false; if (FINE) fixe(null); });
  tt.addEventListener('pointerenter', () => H.classList.add('hors')); tt.addEventListener('pointerleave', () => H.classList.remove('hors'));
  D.forEach(d => {
    const c = d.el;
    c.addEventListener('pointerenter', () => { if (FINE) fixe(c); });
    c.addEventListener('pointerleave', () => { if (FINE && cible === c) fixe(null); });
    c.addEventListener('focus', () => fixe(c));
    c.addEventListener('blur', () => { if (cible === c && FINE) fixe(null); });
    c.addEventListener('click', e => {
      // au doigt : un premier toucher fait la mise au point, le second ouvre
      if (!FINE && cible !== c) { e.preventDefault(); e.stopImmediatePropagation(); auto = false; fixe(c); return; }
      flash();
      if (c.tagName === 'A' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setTimeout(() => { location.href = c.href; }, 170); }
    }, true);
  });
  // le téléphone qui bouge fait bouger la scène (sans demande d'autorisation : Android ; sinon une dérive lente)
  addEventListener('deviceorientation', e => { if (e.gamma == null) return; gyro = true; tx = Math.max(-1, Math.min(1, e.gamma / 25)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vu = es[0].isIntersecting; if (vu) requestAnimationFrame(image); }).observe(H);
  const pref = ['Franglish, Festidreuz', 'Pierceval Tattoo, site et réservation', 'Fatal Bazooka, Les Petites Folies', 'Matmatah, Les Petites Folies', 'Plateforme interne, outil de gestion', 'Mam’our et merveilles, identité', 'Danakil, Les Petites Folies', 'Affiche, Paralympiques', 'Le public des Petites Folies', 'MJC La Marelle, brochure'];
  const ordre = pref.map(l => D.find(d => d.el.dataset.l === l)).filter(Boolean).map(d => d.el);
  function image(now) {
    if (!vu) return;
    if ((!FINE && !gyro) || (FINE && auto)) { tx = Math.sin(now / 4200) * .55; ty = Math.cos(now / 5300) * .35; }
    // au repos, l'autofocus cherche seul un sujet, comme un boîtier : vite à l'arrivée, puis posément
    if (FINE && !auto && !cible && now - bouge > 5000) auto = true;
    if (auto && ordre.length && now - tAuto > (kAuto < 3 ? 900 : 2600)) { tAuto = now; fixe(ordre[kAuto++ % ordre.length]); }
    mx += (tx - mx) * .07; my += (ty - my) * .07;
    champ.style.perspectiveOrigin = (50 - mx * 16).toFixed(2) + '% ' + (45 - my * 12).toFixed(2) + '%';
    const hh = H.offsetHeight, s = Math.max(0, Math.min(1, scrollY / hh));
    const visee = cible ? D.find(d => d.el === cible).z : 0;
    focale += (visee - focale) * .09;
    const t = now - t0;
    for (const d of D) {
      let e = 1 - Math.max(0, Math.min(1, (t - 150 - d.i * 70) / 1400)); e = e * e * (3 - 2 * e);
      if (RM) e = 0;
      const z = d.z - e * 900 + s * 650, sc = d.el === cible ? 1.035 : 1;
      d.el.style.transform = 'translate(-50%,-50%) translate3d(0,0,' + z.toFixed(1) + 'px) scale(' + sc + ')';
      const b = RM ? 0 : Math.min(7.5, Math.abs(d.z - focale) / 85 + e * 12);
      if (Math.abs(b - d.b) > .2) { d.b = b; d.el.style.filter = b > .3 ? 'blur(' + b.toFixed(1) + 'px) brightness(' + (1 - Math.min(.32, b * .04)).toFixed(2) + ')' : 'none'; }
      const o = Math.min(1, (1 - e) * 1.3);
      if (Math.abs(o - d.o) > .01) { d.o = o; d.el.style.opacity = o.toFixed(2); }
    }
    tt.style.opacity = (1 - s * 1.4).toFixed(3); tt.style.transform = 'translate3d(0,' + (s * -60).toFixed(1) + 'px,0)';
    // le collimateur : libre sous le curseur, il se verrouille sur le sujet visé
    let bx, by, bw, bh;
    if (cible) { const r = cible.getBoundingClientRect(), h = H.getBoundingClientRect(); bx = r.left - h.left - 9; by = r.top - h.top - 9; bw = r.width + 18; bh = r.height + 18; }
    else { bw = bh = 54; bx = px - 27; by = py - 27; }
    const k = cible ? .2 : .35; ax += (bx - ax) * k; ay += (by - ay) * k; aw += (bw - aw) * k; ah += (bh - ah) * k;
    af.style.transform = 'translate3d(' + ax.toFixed(1) + 'px,' + ay.toFixed(1) + 'px,0)'; af.style.width = aw.toFixed(1) + 'px'; af.style.height = ah.toFixed(1) + 'px';
    af.classList.toggle('vis', (FINE && dedans) || !!cible);
    // l'étiquette reste dans le cadre
    af.classList.toggle('dr', ax + 260 > H.offsetWidth); af.classList.toggle('ht', ay + ah + 56 > H.offsetHeight);
    requestAnimationFrame(image);
  }
  requestAnimationFrame(image);
})();
