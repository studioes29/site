/* Confirmation de désinscription des envois de Studio ES et de Fill.
   La page ne fait rien à l'ouverture : seule la personne qui appuie sur « Confirmer » est désinscrite.
   Les filtres de sécurité des messageries ouvrent tous les liens d'un mail, mais n'appuient pas sur un bouton. */
(function () {
  var q = new URLSearchParams(location.search);
  var e = (q.get('e') || '').trim().toLowerCase(), s = q.get('s') || '';
  var titre = document.getElementById('titre'), texte = document.getElementById('texte'), ok = document.getElementById('ok');
  var secours = 'Répondez simplement « stop » au message reçu, ou écrivez à contact@studioes.fr.';
  function dire(t, x) { titre.textContent = t; texte.textContent = x; }

  if (!e || e.indexOf('@') < 0 || !s || q.get('invalide')) {
    dire('Lien invalide', 'Ce lien n’est pas valable ou a été modifié. ' + secours);
    return;
  }

  var adresse = document.createElement('b');
  adresse.textContent = e;
  texte.textContent = '';
  texte.append('Confirmez que ', adresse, ' ne doit plus recevoir de message de Studio ES ni de Fill.');
  ok.hidden = false;

  ok.addEventListener('click', function () {
    ok.disabled = true;
    ok.textContent = 'Un instant';
    fetch('https://nfnbseonwgmtouxsaajd.supabase.co/functions/v1/desinscription?e=' + encodeURIComponent(e) + '&s=' + encodeURIComponent(s), { method: 'POST' })
      .then(function (r) { return r.json().then(function (j) { return r.ok && j && j.ok === true; }); })
      .then(function (bien) {
        ok.hidden = true;
        if (bien) dire('C’est noté', 'Cette adresse ne recevra plus de message de Studio ES ni de Fill.');
        else dire('Lien invalide', 'Ce lien n’est pas valable ou a été modifié. ' + secours);
      })
      .catch(function () {
        ok.disabled = false;
        ok.textContent = 'Confirmer';
        dire('La confirmation n’a pas abouti', 'Réessayez dans un instant. Sinon : ' + secours);
      });
  });
})();
