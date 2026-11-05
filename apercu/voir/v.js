/* Charge un aperçu (fonction Supabase « apercu ») et le confie au moteur. */
(function () {
  'use strict';
  var FN = 'https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/apercu';
  var site = document.getElementById('site'), q = new URLSearchParams(location.search), id = q.get('a');
  function etat(titre, texte, lien) {
    site.innerHTML = '';
    var d = document.createElement('div'); d.className = 'etat';
    var c = document.createElement('div'), h = document.createElement('h1'), p = document.createElement('p');
    h.textContent = titre; p.textContent = texte; c.appendChild(h); c.appendChild(p);
    if (lien) { var a = document.createElement('a'); a.href = lien[1]; a.textContent = lien[0]; c.appendChild(a); }
    d.appendChild(c); site.appendChild(d);
  }
  function rendre(D) {
    var r = window.ApercuMoteur.rendre(site, D, { variante: q.has('v') ? +q.get('v') : undefined });
    document.title = (D.site && D.site.nom ? D.site.nom : 'Aperçu') + ' · Aperçu de site';
    var m = document.querySelector('meta[name=theme-color]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    m.content = getComputedStyle(site).getPropertyValue('--bg') ? getComputedStyle(site).backgroundColor : '#141414';
    return r;
  }
  if (q.has('demo') || !id) {
    fetch('demo.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(rendre)
      .catch(function () { etat('Aperçu introuvable', 'Ce lien ne correspond à aucun aperçu.', ['Préparer un aperçu', '/metiers/sites-et-outils/#apercu']); });
    return;
  }
  fetch(FN + '?a=' + encodeURIComponent(id)).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j, st: r.status }; }); }).then(function (x) {
    if (x.ok && x.j && x.j.site) return rendre(x.j);
    if (x.st === 410) return etat('Cet aperçu a expiré', 'Les aperçus restent visibles trente jours. Le site, lui, peut toujours être réalisé.', ['Contacter Studio ES', 'https://studioes.fr/#contact']);
    etat('Aperçu introuvable', 'Ce lien ne correspond à aucun aperçu. Vérifiez qu’il est complet.', ['Préparer un aperçu', '/metiers/sites-et-outils/#apercu']);
  }).catch(function () { etat('Connexion interrompue', 'L’aperçu n’a pas pu être chargé. Réessayez dans un instant.', ['Recharger', location.href]); });
})();
