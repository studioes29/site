# Pages locales « site internet à <ville> » : une page par ville, chacune avec son propre texte (jamais une page clonée), exécuté par build.py après metiers.py.
# Ne rien affirmer sur une ville qu'on ne sait pas : pas de chiffres, pas de commerces nommés qui ne sont pas des clients.
VILLES = [
    # (slug, ville, « à » ou « au », trajet depuis Leuhan, lead, trois besoins (titre, texte), réalisations proches)
    ('quimper', 'Quimper', 'à', 'à une demi-heure',
     'Commerces du centre, artisans de l’agglomération, cabinets et professions libérales : un site clair, qui dit ce que vous faites, quand vous êtes ouverts et comment vous joindre, et qui ressort quand on vous cherche à Quimper.',
     [('Être trouvé à Quimper', 'Des pages rédigées pour les recherches locales (« votre métier à Quimper ») et une fiche Google reliée au site.'),
      ('Prendre rendez-vous en ligne', 'Une demande complète qui arrive par mail, sans échange de messages pour caler un créneau.'),
      ('Des informations à jour', 'Horaires, prestations et tarifs que vous modifiez vous-même, ou que le studio met à jour pour vous.')],
     ['Pierceval Tattoo', 'FL Auto', 'La Soute']),
    ('concarneau', 'Concarneau', 'à', 'à une demi-heure',
     'Restaurants, hébergements, activités nautiques et commerces : à Concarneau, les visiteurs préparent leur venue en ligne. Un site qui donne les horaires de la saison, les prestations et le moyen de réserver, sur téléphone d’abord.',
     [('La saison, à jour', 'Horaires d’été et d’hiver, fermetures et tarifs de l’année, sans informations périmées qui font fuir.'),
      ('Réserver ou demander en ligne', 'Une table, une sortie, une chambre ou un devis : la demande arrive complète, avec les dates.'),
      ('Vendre hors saison', 'Une carte cadeau en ligne : montant, message et destinataire choisis, la carte arrive en PDF.')],
     ['Pierceval Tattoo', 'La Soute', 'FL Auto']),
    ('quimperle', 'Quimperlé', 'à', 'à une demi-heure',
     'Commerces de la Basse-Ville et de la Haute-Ville, artisans et associations du pays de Quimperlé : un site sobre et rapide, rédigé pour vous, qui présente votre activité et facilite le premier contact.',
     [('Une présence à vous', 'Un site à votre nom, au lieu d’une simple page de réseau social ou d’annuaire.'),
      ('Le premier contact facilité', 'Appel, itinéraire, formulaire ou rendez-vous en un geste depuis un téléphone.'),
      ('Être trouvé localement', 'Des textes écrits pour les recherches du pays de Quimperlé et une fiche Google reliée au site.')],
     ['Pierceval Tattoo', 'FL Auto', 'MJC La Marelle']),
    ('rosporden', 'Rosporden', 'à', 'à vingt minutes',
     'Commerces, artisans et associations de Rosporden et de Kernével : un site simple et soigné, qui présente votre activité, vos horaires et vos réalisations, et vous fait trouver par les gens du coin.',
     [('Vos réalisations en avant', 'Chantiers, créations ou produits classés par type, pour se décider avant d’appeler.'),
      ('Demander un devis en ligne', 'Les bonnes questions posées d’avance : la demande arrive complète, vous chiffrez plus vite.'),
      ('Un site qui vous ressemble', 'Couleurs, logo et photos repris de votre enseigne, sans modèle générique.')],
     ['FL Auto', 'Pierceval Tattoo', 'MJC La Marelle']),
    ('scaer', 'Scaër', 'à', 'à dix minutes',
     'Pierceval Tattoo, FL Auto, la MJC La Marelle : plusieurs structures de Scaër travaillent déjà avec le studio. Un site, une identité ou les deux, conçus ensemble et rédigés pour vous.',
     [('Site et identité ensemble', 'Le logo, l’enseigne et le site pensés d’un même trait, comme pour FL Auto et Pierceval Tattoo.'),
      ('Réservation et carte cadeau', 'Les outils du site de Pierceval Tattoo, adaptés à votre activité.'),
      ('Un interlocuteur proche', 'Le studio est installé à Leuhan : un rendez-vous chez vous se cale facilement.')],
     ['Pierceval Tattoo', 'FL Auto', 'MJC La Marelle']),
    ('chateauneuf-du-faou', 'Châteauneuf-du-Faou', 'à', 'à un quart d’heure',
     'Commerces, artisans, hébergements et associations de Châteauneuf-du-Faou et des bords de l’Aulne : un site clair, qui présente votre activité et vos horaires, et permet de vous contacter ou de réserver en un geste.',
     [('Accueillir les visiteurs', 'Pour un gîte, une activité ou un commerce : les informations pratiques, la saison et la réservation au même endroit.'),
      ('Être trouvé localement', 'Des textes écrits pour les recherches de Châteauneuf-du-Faou et des environs, et une fiche Google reliée au site.'),
      ('Un interlocuteur proche', 'Le studio est installé à Leuhan, à côté : un rendez-vous chez vous se cale facilement.')],
     ['Pierceval Tattoo', 'FL Auto', 'MJC La Marelle']),
]

def autres(sauf=''):
    L = ['%s <a href="/site-internet/%s/">%s</a>' % (p, s, v) for s, v, p, *_ in VILLES if s != sauf]
    return ', '.join(L[:-1]) + ' et ' + L[-1]

for slug, ville, prep, trajet, lead, besoins, proches in VILLES:
    url = 'https://studioes.fr/site-internet/%s/' % slug
    act = ('<div class="mh-ac"><button type="button" class="bt" data-est data-k="site">Démarrer mon site %s</button>'
           '<a class="bt ct" href="/metiers/sites-et-outils/#apercu">Voir votre site en aperçu</a></div>') % AR
    h = entete('Site internet %s %s' % (prep, ville), 'Site internet', '%s %s.' % (prep, ville), lead, ' u-foret mh-wb-s', FG(ville, 'right:-3vw;font-size:calc(var(--fg-t) * .9)'), wb_droite, act, True)
    # le fil d'Ariane passe par la page Web
    h = h.replace('<a href="/">Studio ES</a><span>/</span>', '<a href="/">Studio ES</a><span>/</span><a href="/metiers/sites-et-outils/">Web</a><span>/</span>', 1)
    h += '''
<section class="sec feuille u-papier" id="besoins" aria-labelledby="t-be">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>%s</span></p><h2 class="d" id="t-be">Ce que le site fait<span class="it">pour vous.</span></h2></div><p class="lead">Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>
    %s
  </div>
</section>
<section class="sec feuille libre dk wb-o u-foret" id="web" data-dark aria-labelledby="t-of">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Les offres</span></p><h2 class="d" id="t-of">Sites internet<span class="it">Écrits et mis en ligne pour vous.</span></h2></div><p class="lead">Payables en plusieurs fois sans frais.</p></div>
''' % (ville, eaussi(besoins))
    h += offres_web.replace('<div class="sous rv"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris. <button type="button" class="trv" data-est data-swipe>Je ne sais pas ce qu’il me faut</button></p></div>', '<div class="sous rv"><p><button type="button" class="trv" data-est data-swipe>Je ne sais pas ce qu’il me faut</button></p></div>')
    h += '''
  </div>
</section>
<section class="sec feuille rl-f u-papier" id="proches" aria-labelledby="t-pr">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>03</i><span>Réalisations</span></p><h2 class="d" id="t-pr">Le studio<span class="it">%s de %s.</span></h2></div><p class="lead">Studio ES est installé à Leuhan. Quelques projets menés pour des structures du Finistère.</p></div>
  </div>
  <div class="nu-g rl-g" aria-label="Réalisations">%s</div>
  <div class="w"><p class="note rv">Le studio crée aussi des sites %s.</p></div>
</section>
''' % (trajet, ville, ''.join(tuile(next(t for t in TR if t[0] == n)) for n in proches), autres(slug))
    h += contact_m('Site internet %s %s : quelques choix, une estimation immédiate.' % (prep, ville), 'Web')
    ld = LD('Site internet %s %s' % (prep, ville), url, 'Création de site internet %s %s' % (prep, ville), [('Site Essentiel', 490), ('Site Vitrine', 990), ('Site sur mesure', 1990)])
    ld = ld.replace('"areaServed": [{"@type": "AdministrativeArea", "name": "Bretagne"}, {"@type": "Country", "name": "France"}]', '"areaServed": [{"@type": "City", "name": "%s"}, {"@type": "AdministrativeArea", "name": "Finistère"}]' % ville)
    ld = ld.replace('{"@type": "ListItem", "position": 2, "name": "Site internet %s %s"' % (prep, ville), '{"@type": "ListItem", "position": 2, "name": "Web", "item": "https://studioes.fr/metiers/sites-et-outils/"}, {"@type": "ListItem", "position": 3, "name": "%s"' % ville)
    page('site-internet/' + slug, 'Création de site internet %s %s · Studio ES' % (prep, ville),
         'Création de site internet %s %s pour les commerces, artisans et associations : textes rédigés, référencement local, réservation en ligne. Dès 490 €, en plusieurs fois sans frais.' % (prep, ville),
         url, h, og='og-web.jpg', ld=ld)
PAGES_VILLES = ['site-internet/' + s for s, *_ in VILLES]

# la page Web renvoie vers les pages locales (sans ces liens, les moteurs les trouvent mal)
_f = os.path.join(OUT, 'metiers/sites-et-outils/index.html'); _h = open(_f, encoding='utf8').read()
_n = '<p class="note rv">Le suivi couvre l’hébergement, le nom de domaine et les sauvegardes, sans engagement.</p>'
assert _h.count(_n) == 1
_h = _h.replace(_n, _n + '\n    <p class="note rv">Sites internet ' + autres() + '.</p>', 1)
open(_f, 'w', encoding='utf8').write(_h)
