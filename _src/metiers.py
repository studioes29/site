# Pages métiers de Studio ES (photographie, web, graphisme), exécuté par build.py avec ses variables.
AR = '<span class="ar"><svg class="i"><use href="#ar"/></svg></span>'
PV = '/projets/pierceval-tattoo/img/'

def entete(nom, titre, it, lead, cls='', fg='', droite='', actions='', dark=False):
    return ('<section class="mh%s"%s aria-labelledby="h1">%s<div class="w mh-g">\n  <div class="mh-t"><p class="fil"><a href="/">Studio ES</a><span>/</span><span>%s</span></p>\n'
            '  <h1 class="d" id="h1">%s<span class="it">%s</span></h1>\n  <p class="lead">%s</p>%s</div>%s\n</div></section>') % (cls, ' data-dark' if dark else '', fg, nom, titre, it, lead, actions, droite)

def LD(nom, url, service, offres=()):
    g = [{"@type": "Service", "name": service, "url": url, "provider": {"@id": "https://studioes.fr/#studio"}, "areaServed": {"@type": "AdministrativeArea", "name": "Bretagne"}},
         {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"}, {"@type": "ListItem", "position": 2, "name": nom, "item": url}]}]
    if offres: g[0]["offers"] = [{"@type": "Offer", "name": n, "priceCurrency": "EUR", "price": str(p), "priceSpecification": {"@type": "PriceSpecification", "minPrice": p, "priceCurrency": "EUR"}} for n, p in offres]
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False)

def croise(titre, texte, lien, lib, img, u='u-lilas'):
    return ('<section class="sec feuille cr-f %s" aria-label="Et aussi"><div class="w croise2 rv"><a class="cr-i" href="%s" aria-label="%s"><img src="%s" alt="" loading="lazy"></a>'
            '<div class="cr-tx"><p class="pt"><i>Et aussi</i><span>Une autre discipline du studio</span></p><h2 class="d">%s</h2><p>%s</p><a class="bt" href="%s">%s %s</a></div></div></section>') % (u, lien, lib, img, titre, texte, lien, lib, ar())

def contact_m(texte, g):
    # le contact se règle sur le métier de la page : le devis s'ouvre directement sur les projets de ce métier
    h = contact_p.replace('data-est><span class="sheen"', 'data-est data-g="%s"><span class="sheen"' % g, 1)
    return h.replace('<span>Quelques choix, une estimation immédiate, votre demande part en un clic.</span>', '<span>%s</span>' % texte, 1)

def FG(t, st, cl=''):
    return '<span class="fg%s" style="%s" aria-hidden="true">%s</span>' % (' ' + cl if cl else '', st, t)

# ---------- Photographie : à la une, tous les reportages, puis les formules ----------
bp = sect('photographie', B).split('\n')
offres_ph = '\n'.join(bp[4:44])
travaux = '\n'.join(bp[45:49])
UNE = [('matmatah', '/p/matmatah-7.jpg', 'Concerts et festivals', 'Matmatah', 'La scène au plus près, sans jamais gêner le spectacle.'),
       ('inauguration', '/p/t/inaug-digue-5.webp', 'Événementiel et institutions', 'Inauguration', 'Les officiels, le public, les détails : le récit complet d’une journée.'),
       ('fl-auto-photo', '/projets/fl-auto/img/photo-10.webp', 'Portraits et métiers', 'FL Auto', 'Un atelier, des gestes précis, une équipe : de quoi habiller un site et des réseaux.')]
une_h = ''.join('<button type="button" class="un un%d rv" data-r="%s" style="--i:%d"><span class="un-i"><img src="%s" alt="" loading="lazy"></span>'
                '<span class="un-l"><small>%s</small><b class="d">%s</b><span>%s</span><em>Voir le reportage %s</em></span></button>' % (i + 1, r, i, im, k, t, l, AR) for i, (r, im, k, t, l) in enumerate(UNE))
ph_droite = '<figure class="mh-ph" aria-hidden="true"><img class="a" src="/p/helena-3.jpg" alt="" fetchpriority="high" width="825" height="1100"><img class="b" src="/p/t/voeux-ph-2.webp" alt=""><img class="c" src="/projets/fl-auto/img/photo-2.webp" alt=""></figure>'
ph_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="evenement">Demander un devis %s</button><a class="ln" href="#photographie">Voir les reportages</a></div>' % AR
ph = entete('Photographie', 'Photographie', 'Vos moments forts, sur le vif.', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.',
            ' u-noir mh-ph-s', FG('Photo', 'left:-2vw;bottom:-.18em', 'o'), ph_droite, ph_act, True) + '''
<section class="sec feuille dk ph-f u-foret" id="photographie" data-dark aria-labelledby="t-tr">
  ''' + FG('Reportage', 'right:-4vw;top:-.08em;--vy:-90px;font-size:calc(var(--fg-t) * .58)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>À la une</span></p><h2 class="d" id="t-tr">Reportages<span class="it">Scène, institutions, métiers.</span></h2></div><p class="lead">Trois façons de travailler, une même attention : être là au bon moment, sans se faire remarquer. Chaque reportage s’ouvre en grand.</p></div>
    <div class="une">''' + une_h + '''</div>
''' + travaux.replace('<h3 class="d">Reportages récents</h3>', '<h3 class="d">Tous les reportages</h3>') + '''
</section>
<section class="sec feuille fo-f u-menthe" id="formules" aria-labelledby="t-fo">
  ''' + FG('Formules', 'left:-3vw;bottom:-.2em;--vy:-70px;font-size:calc(var(--fg-t) * .55)', 'o') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Les formules</span></p><h2 class="d" id="t-fo">Événement, suivi,<span class="it">mariage.</span></h2></div><p class="lead">Des prix connus d’avance, modulables selon la durée. Le devis précise le reste.</p></div>
''' + offres_ph + '''
  </div>
</section>
''' + croise('Le studio fait aussi<span class="it">des sites et des applications.</span>', 'Un site clair et bien référencé, ou une application qui fait gagner du temps. Et quand il faut de belles photos pour l’habiller, elles sont déjà là.', '/metiers/sites-et-outils/', 'Découvrir le web', '/projets/pierceval-tattoo/img/cover-800.webp', 'u-lilas') + '\n' + \
    contact_m('Événement, suivi annuel ou mariage : quelques choix, une estimation immédiate.', 'Photographie')
page('metiers/photographie', 'Photographe de concert, d’événement et de mariage en Bretagne · Studio ES', 'Reportages photo sur le vif dans le Finistère et en Bretagne : concerts et festivals, événements et institutions, portraits et métiers, mariages. Événement dès 250 €.', 'https://studioes.fr/metiers/photographie/', ph, og='og-photo.jpg',
     ld=LD('Photographie', 'https://studioes.fr/metiers/photographie/', 'Reportage photo d’événement, de concert et de mariage', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290)]))

# ---------- Web : la vitrine d'abord, les offres ensuite ----------
bw = sect('web', B).split('\n')
offres_web = '\n'.join(bw[4:48])
VITRINE = [
    ('pierceval', 'Pierceval Tattoo', 'Site, réservation et carte cadeau', '/projets/pierceval-tattoo/', 'piercevaltattoo.fr',
     'Identité et site conçus ensemble : un fond prune, un rose franc, un lettrage italique qui rappelle l’enseigne.', [
        ('Accueil', 'Les deux métiers dès l’ouverture, et la prise de rendez-vous à portée de pouce.', PV + 'd-hero.webp', PV + 'm-hero.webp'),
        ('Réservation', 'Deux parcours, tatouage ou piercing : la demande arrive complète, avec le projet et les disponibilités.', PV + 'd-rdv-type.webp', PV + 'm-rdv-type.webp'),
        ('Carte cadeau', 'Montant, message et destinataire choisis en ligne ; la carte arrive en PDF, prête à offrir.', PV + 'd-cadeau-ok.webp', PV + 'm-cadeau.webp'),
        ('Réalisations', 'Les tatouages classés par style, pour se décider avant même d’appeler.', PV + 'd-real.webp', PV + 'm-real.webp')]),
    ('soute', 'La Soute', 'Identité, saison et site', '/projets/la-soute/', '',
     'Le O de Soute devient un hublot : le même signe sert de logo, de cadre photo et de repère sur le site.', [
        ('Sur tous les écrans', 'Le site reprend la brochure et les affiches : une seule identité, du papier au téléphone.', '/projets/la-soute/img/site.webp', ''),
        ('La saison', 'La programmation lisible d’un coup d’œil, avec un accès direct à la billetterie.', '/projets/la-soute/img/soute-9.webp', '/projets/la-soute/img/soute-8.webp')]),
    ('flouz', 'flouz.', 'Application de budget', '/projets/flouz/', '',
     'Une interface sombre et un seul violet pour l’essentiel : le solde, les budgets, les alertes.', [
        ('Tableau de bord', 'Le solde, le mois en cours et les dépenses épinglées sur un seul écran.', '/projets/flouz/img/tableau.webp', ''),
        ('Budgets', 'Chaque catégorie a sa jauge ; l’application prévient avant le dépassement.', '/projets/flouz/img/budget.webp', ''),
        ('Au quotidien', 'Pensée pour le téléphone, utilisée en quelques secondes.', '/projets/flouz/img/main.webp', '')]),
]
def scene_v(t, url, d, m):
    if m:
        return ('<div class="vs-ec"><div class="wb-bar"><i></i><i></i><i></i><em>%s</em></div><div class="vs-pg"><img src="%s" alt="%s sur ordinateur" loading="lazy"></div></div>'
                '<div class="vs-tel"><img src="%s" alt="%s sur téléphone" loading="lazy"></div>') % (url, d, t, m, t)
    return '<div class="vs-app"><img src="%s" alt="%s" loading="lazy"></div>' % (d, t)
def vitrine():
    tabs = ''.join('<button type="button" role="tab" id="vt-%s" aria-controls="vp-%s" aria-selected="%s"%s><b>%s</b><span>%s</span></button>' % (
        k, k, 'true' if i == 0 else 'false', '' if i == 0 else ' tabindex="-1"', t, l) for i, (k, t, l, _, _, _, _) in enumerate(VITRINE))
    pans = ''
    for i, (k, t, l, lien, url, da, ecr) in enumerate(VITRINE):
        fct = ''.join('<button type="button" aria-pressed="%s" data-d="%s" data-m="%s"><b>%s</b><span>%s</span></button>' % ('true' if j == 0 else 'false', d, m, n, x) for j, (n, x, d, m) in enumerate(ecr))
        pans += ('<div class="vp" role="tabpanel" id="vp-%s" aria-labelledby="vt-%s" data-url="%s"%s><div class="vp-t"><p class="vp-k">Fonctionnalités</p><div class="vp-f">%s</div>'
                 '<p class="vp-da"><b>Direction artistique</b>%s</p><a class="bt" href="%s">Voir l’étude de cas %s</a></div><div class="vp-s">%s</div></div>') % (
            k, k, url, '' if i == 0 else ' hidden', fct, da, lien, AR, scene_v(t, url, ecr[0][2], ecr[0][3]))
    return '<div class="vt" role="tablist" aria-label="Projets web">%s</div>%s' % (tabs, pans)
wb_droite = ('<div class="mh-wb" aria-hidden="true"><div class="wb-ec"><div class="wb-bar"><i></i><i></i><i></i><em>piercevaltattoo.fr</em></div><div class="wb-pg"><img src="/h/hx-site.webp" alt="" width="1200" height="1499"></div></div>'
             '<div class="wb-tel"><img src="' + PV + 'm-hero.webp" alt=""></div></div>')
wb_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="site">Démarrer mon site %s</button><a class="ln" href="#vitrine">Voir les réalisations</a></div>' % AR
wb = entete('Web', 'Web', 'Sites et applications sur mesure.', 'Pour les TPE, commerces, artisans et collectivités de Bretagne : un site clair, rédigé et bien référencé localement, et des applications qui font gagner du temps au quotidien.',
            ' u-nuit mh-wb-s', FG('Web', 'right:-2vw;top:-.04em') + FG('&lt;/&gt;', 'left:34vw;bottom:-.22em;font-size:calc(var(--fg-t) * .46)', 'o'), wb_droite, wb_act, True) + '''
<section class="sec feuille vi-f u-lilas" id="vitrine" aria-labelledby="t-vi">
  ''' + FG('Web', 'left:-3vw;bottom:-.2em;--vy:-80px', 'o') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>Réalisations</span></p><h2 class="d" id="t-vi">À l’écran,<span class="it">sur ordinateur et sur téléphone.</span></h2></div><p class="lead">Chaque projet en situation : ses écrans, ses fonctionnalités et ce qu’il change pour le client. Choisissez une fonctionnalité pour l’afficher.</p></div>
    <div class="vi rv">''' + vitrine() + '''</div>
  </div>
</section>
<section class="sec feuille dk wb-o u-violet" id="web" data-dark aria-labelledby="t-of">
  ''' + FG('Sites', 'right:-3vw;top:-.1em;--vy:-80px;font-size:calc(var(--fg-t) * .6)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Les offres</span></p><h2 class="d" id="t-of">Un site,<span class="it">à votre mesure.</span></h2></div><p class="lead">Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris. Le suivi mensuel garde le site à jour.</p></div>
''' + offres_web.replace('<div class="sous rv"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>', '') + '''
  </div>
</section>
''' + sect('applications', B) + '\n' + croise('Le studio fait aussi<span class="it">de la photographie.</span>', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret, puis une sélection resserrée et retouchée.', '/metiers/photographie/', 'Découvrir la photographie', '/p/t/matmatah-1.webp', 'u-menthe') + '\n' + \
    contact_m('Site ou application : quelques choix, une estimation immédiate.', 'Web')
page('metiers/sites-et-outils', 'Sites internet et applications en Bretagne · Studio ES', 'Sites internet pour TPE, associations et collectivités dès 990 €, applications sur mesure dès 190 € : réservation, devis, inscriptions. Réalisations et tarifs.', 'https://studioes.fr/metiers/sites-et-outils/', wb, og='og-web.jpg',
     ld=LD('Web', 'https://studioes.fr/metiers/sites-et-outils/', 'Création de sites internet et d’applications web', [('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))

# ---------- Design graphique : trois familles, trois mises en scène ----------
def galbt(g, lib):
    return '<button type="button" class="ln gal-b" data-r="%s">%s</button>' % (g, lib)
def vign(g, n=4, skip=0):
    gg = next(x for x in GRAPH if x[0] == g); out = ''
    for nn in gg[3][skip:skip + n]:
        w, h = taille('/p/t/%s.webp' % nn)
        out += '<button type="button" data-r="%s" aria-label="Voir : %s"><img src="/p/t/%s.webp" alt="" loading="lazy" width="%d" height="%d"></button>' % (g, gg[1], nn, w, h)
    return out
def tete(n, id, titre, it, texte, k, cas=''):
    return ('<div class="gr-t rv"><p class="pt"><i>%s</i><span>%s</span></p><h2 class="d" id="t-%s">%s<span class="it">%s</span></h2><p class="lead">%s</p>'
            '<div class="ds-ac"><button type="button" class="bt" data-est data-k="%s">Parler de mon projet %s</button>%s</div></div>') % (n, titre, id, titre, it, texte, k, AR, cas)
gr_droite = '<div class="mh-gr" aria-hidden="true"><img class="a" src="/projets/la-soute/img/affiche.webp" alt=""><img class="b" src="/p/t/marelle-2.webp" alt=""><img class="c" src="/p/t/maison-ble-1.webp" alt=""></div>'
gr_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-g="Design graphique">Parler de mon projet %s</button><a class="ln" href="#identites">Voir les projets</a></div>' % AR
gr = entete('Design graphique', 'Graphisme', 'Identités, campagnes, éditions.', 'Une direction artistique qui tient sur tous les supports : l’identité d’un lieu ou d’une marque, la campagne d’une saison, la brochure qu’on garde. Chaque projet est chiffré sur devis.',
            ' u-rose mh-gr-s', FG('Design', 'left:-3vw;bottom:-.2em', 'o'), gr_droite, gr_act) + '''
<section class="sec feuille gr-f gr-identites u-papier" id="identites" aria-labelledby="t-identites">
  ''' + FG('Identité', 'right:-4vw;top:-.06em;--vy:-80px;font-size:calc(var(--fg-t) * .55)') + '''
  <div class="w">
    ''' + tete('01', 'identites', 'Identités visuelles', 'Un système complet, pas seulement un logo.', 'Logotype, couleurs, typographies et règles de déclinaison : de quoi rester reconnaissable sur l’enseigne, le site, la carte cadeau et les réseaux.', 'identite', '<a class="ln" href="/projets/pierceval-tattoo/">Étude de cas Pierceval Tattoo</a>') + '''
    <div class="sys rv" aria-label="Le système d’identité de Pierceval Tattoo">
      <figure class="sy sy-logo"><img src="''' + PV + '''id-logo.webp" alt="Logotype de Pierceval Tattoo" loading="lazy"><figcaption>Logotype</figcaption></figure>
      <figure class="sy sy-pal"><div class="pal"><i style="--c:#2B1330"><b>Prune</b><span>Fond et texte</span></i><i style="--c:#E58BD0"><b>Rose</b><span>Accent</span></i><i style="--c:#F3EDE4;color:#2B1330"><b>Crème</b><span>Papier</span></i></div><figcaption>Couleurs</figcaption></figure>
      <figure class="sy sy-vit"><img src="''' + PV + '''id-vitrine.webp" alt="Le logotype en vitrine du studio" loading="lazy"><figcaption>Vitrine</figcaption></figure>
      <figure class="sy sy-cad"><img src="''' + PV + '''id-cadeau.webp" alt="Carte cadeau imprimée" loading="lazy"><figcaption>Carte cadeau</figcaption></figure>
      <figure class="sy sy-cdv"><img src="''' + PV + '''id-cdv-verso.webp" alt="Carte de visite" loading="lazy"><figcaption>Carte de visite</figcaption></figure>
      <figure class="sy sy-web"><img src="''' + PV + '''m-hero.webp" alt="Le site sur téléphone" loading="lazy"><figcaption>Site</figcaption></figure>
    </div>
    <div class="aut rv"><p class="d">Autres identités</p><div class="aut-g">''' + vign('identites', 5, 2) + '''</div><div class="aut-l">''' + galbt('identites', 'Toutes les identités') + galbt('signaletique', 'La signalétique') + '''</div></div>
  </div>
</section>
<section class="sec feuille gr-f gr-campagnes dk u-terre" id="campagnes" data-dark aria-labelledby="t-campagnes">
  ''' + FG('Campagne', 'left:-3vw;bottom:-.2em;--vy:-90px;font-size:calc(var(--fg-t) * .6)', 'o') + '''
  <div class="w">
    ''' + tete('02', 'campagnes', 'Campagnes et directions artistiques', 'Une idée, déclinée partout.', 'Festivals, saisons culturelles, événements, recrutement : un concept fort, puis l’affiche, les réseaux, l’affichage et la presse.', 'campagne', '<a class="ln" href="/projets/la-soute/">Étude de cas La Soute</a>') + '''
    <div class="camp rv">
      <div class="cp-con"><p class="cp-k">Le concept</p><p class="cp-t d">Un hublot<span class="it">pour signature.</span></p><p class="cp-x">Le O de La Soute devient un hublot : il cadre les artistes, rythme les affiches et sert de repère sur chaque support.</p><img src="/projets/la-soute/img/soute-7.webp" alt="Le hublot, signe de La Soute" loading="lazy"></div>
      <figure class="cp-kv"><img src="/projets/la-soute/img/affiche.webp" alt="Affiche de concert de La Soute" loading="lazy"><figcaption>Affiche de concert</figcaption></figure>
      <figure class="cp-d1"><img src="/projets/la-soute/img/soute-6.webp" alt="Affiche du temps fort" loading="lazy"><figcaption>Temps fort</figcaption></figure>
      <figure class="cp-d2"><img src="/projets/la-soute/img/soute-5.webp" alt="Visuel de saison" loading="lazy"><figcaption>Saison</figcaption></figure>
      <figure class="cp-d3"><img src="/projets/la-soute/img/soute-8.webp" alt="Déclinaison sur le site, sur téléphone" loading="lazy"><figcaption>Site</figcaption></figure>
    </div>
    <div class="aut rv"><p class="d">Autres campagnes</p><div class="aut-g">''' + vign('campagnes', 5) + '''</div><div class="aut-l">''' + galbt('campagnes', 'Toutes les campagnes') + galbt('affiches', 'Les affiches') + '''</div></div>
  </div>
</section>
<section class="sec feuille gr-f gr-editions u-sable" id="editions" aria-labelledby="t-editions">
  ''' + FG('Édition', 'right:-3vw;top:-.08em;--vy:-80px;font-size:calc(var(--fg-t) * .6)') + '''
  <div class="w">
    ''' + tete('03', 'editions', 'Édition et supports imprimés', 'Des pages qui se lisent.', 'Brochures, programmes, magazines et dépliants : une grille claire, une hiérarchie lisible, des fichiers prêts pour l’imprimeur.', 'edition', '<a class="ln" href="/projets/mjc-la-marelle/">Étude de cas MJC La Marelle</a>') + '''
    <div class="livre rv">
      <button type="button" class="lv-cou" data-r="editions" aria-label="Voir les éditions : couverture"><img src="/projets/mjc-la-marelle/img/p1.webp" alt="" loading="lazy"><span>Couverture</span></button>
      <button type="button" class="lv-dbl" data-r="editions" aria-label="Voir les éditions : pages intérieures"><span class="pg"><img src="/projets/mjc-la-marelle/img/p2.webp" alt="" loading="lazy"></span><span class="pg"><img src="/projets/mjc-la-marelle/img/p3.webp" alt="" loading="lazy"></span><span class="lg">Pages intérieures</span></button>
      <div class="lv-pl">''' + ''.join('<button type="button" data-r="editions" aria-label="Voir les éditions : page %d"><img src="/projets/mjc-la-marelle/img/p%d.webp" alt="" loading="lazy"></button>' % (n, n) for n in (4, 5, 6, 7)) + '''</div>
    </div>
    <div class="aut rv"><p class="d">Autres éditions</p><div class="aut-g">''' + vign('editions', 5, 5) + '''</div><div class="aut-l">''' + galbt('editions', 'Toutes les éditions') + '''</div></div>
  </div>
</section>
<section class="sec feuille fl-f fl-c" aria-label="Production régulière">
  <div class="w fl-ct rv"><p>Besoin de supports chaque mois plutôt que d’un projet&nbsp;? Publications, affiches courantes, newsletters : c’est le rôle de <b>Fill</b>, le service de communication régulière conçu par Studio ES.</p><a class="bt" href="https://fill.studioes.fr">Découvrir Fill <span class="ar"><svg class="i"><use href="#ne"/></svg></span></a></div>
</section>
''' + contact_m('Identité, campagne ou édition : décrivez le projet, le devis suit.', 'Design graphique')
page('metiers/graphisme', 'Design graphique en Bretagne : identités, campagnes, éditions · Studio ES', 'Identités visuelles, campagnes et directions artistiques, brochures et éditions pour les lieux culturels, collectivités et entreprises de Bretagne. Sur devis.', 'https://studioes.fr/metiers/graphisme/', gr,
     ld=LD('Design graphique', 'https://studioes.fr/metiers/graphisme/', 'Identité visuelle, campagne et édition'))
