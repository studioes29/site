# Pages métiers de Studio ES (photographie, web, graphisme), exécuté par build.py avec ses variables.
AR = '<span class="ar"><svg class="i"><use href="#ar"/></svg></span>'
PV = '/projets/pierceval-tattoo/img/'

def entete(nom, titre, it, lead, cls='', fg='', droite='', actions='', dark=False):
    it = '<span class="it">%s</span>' % it if it else ''
    return ('<section class="mh%s"%s aria-labelledby="h1"><div class="w mh-g">\n  <div class="mh-t"><p class="fil"><a href="/">Studio ES</a><span>/</span><span>%s</span></p>\n'
            '  <h1 class="d" id="h1">%s%s</h1>\n  <p class="lead">%s</p>%s</div>%s\n</div></section>') % (cls, ' data-dark' if dark else '', nom, titre, it, lead, actions, droite)

def LD(nom, url, service, offres=()):
    g = [{"@type": "Service", "name": service, "url": url, "provider": {"@id": "https://studioes.fr/#studio"}, "areaServed": {"@type": "AdministrativeArea", "name": "Bretagne"}},
         {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"}, {"@type": "ListItem", "position": 2, "name": nom, "item": url}]}]
    if offres: g[0]["offers"] = [{"@type": "Offer", "name": n, "priceCurrency": "EUR", "price": str(p), "priceSpecification": {"@type": "PriceSpecification", "minPrice": p, "priceCurrency": "EUR"}} for n, p in offres]
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False)

def croise(titre, texte, lien, lib, img, u='u-lilas'):
    return ('<section class="sec cr-f %s" aria-label="%s"><div class="w croise2"><a class="cr-i" href="%s" tabindex="-1" aria-hidden="true"><img src="%s" alt="" loading="lazy"></a>'
            '<div class="cr-tx"><h2 class="d">%s</h2><p>%s</p><a class="ln" href="%s">%s</a></div></div></section>') % (u, titre, lien, img, titre, texte, lien, lib)

def contact_m(texte, g):
    # le contact se règle sur le métier de la page : le devis s'ouvre directement sur les projets de ce métier
    h = contact_p.replace('class="ca" data-est>', 'class="ca" data-est data-g="%s">' % g, 1)
    return h.replace('<span data-dv>Trois étapes, une estimation immédiate.</span>', '<span data-dv>%s</span>' % texte, 1)

def FG(t, st, cl=''):
    # filigranes : un seul par page, là où il porte un sens
    if 'garde' not in cl: return ''
    return '<span class="fg%s" style="%s" aria-hidden="true">%s</span>' % (' ' + cl, st, t)

# ---------- Photographie : les têtes d'affiche, tous les reportages, au-delà de la scène, puis les formules ----------
bp = sect('photographie', B).split('\n')
offres_ph = '\n'.join(bp[4:44])
travaux = '\n'.join(bp[45:49])
# une sélection d'images, toutes familles confondues ; aucun reportage n'est mis en avant pour sa notoriété
SELPH = [('philippe-katerine', 'Philippe Katerine', 'Concert', '/p/philippe-katerine-2.jpg'), ('inauguration', 'Inauguration', 'Institution', '/p/inaug-digue-5.jpg'),
         ('pub-eucalyptus', 'Le Chant de l’Eucalyptus', 'Festival', '/p/pub-eucalyptus-2.jpg'), ('gael-faye', 'Gaël Faye', 'Concert', '/p/gael-faye-1.jpg'),
         ('fl-auto-photo', 'FL Auto', 'Portrait de métier', '/p/fl-auto-photo-2.jpg'), ('voeux-ph', 'Cérémonie des vœux', 'Institution', '/p/voeux-ph-2.jpg'),
         ('mentissa', 'Mentissa', 'Concert', '/p/mentissa-2.jpg'), ('forum-asso', 'Forum des associations', 'Événement', '/p/forum-asso-11.jpg')]
tetes = ''.join('<button type="button" class="ta ta%d" data-r="%s" aria-label="Voir le reportage %s"><img src="%s" alt="" loading="lazy"><span><b class="d">%s</b><small>%s</small></span></button>' % (
    i + 1, r, t, im, t, k) for i, (r, t, k, im) in enumerate(SELPH))
AUDELA = [('pub-petites-folies', 'Festivals', 'Les Petites Folies, Le Chant de l’Eucalyptus, Festidreuz', '/p/t/pub-petites-folies-2.webp'),
          ('inauguration', 'Institutions', 'Inaugurations, cérémonies des vœux, commémorations', '/p/t/voeux-ph-2.webp'),
          ('fl-auto-photo', 'Entreprises et portraits', 'Un atelier, une équipe, des gestes de métier', '/projets/fl-auto/img/photo-2.webp'),
          ('', 'Mariages', 'Des préparatifs à l’ouverture du bal, sur le vif', '/h/mariage-800.webp')]
def ad(r, t, l, im):
    o = '<button type="button" class="ad" data-r="%s" aria-label="Voir : %s">' % (r, t) if r else '<a class="ad" href="#formules">'
    f = '</button>' if r else '</a>'
    return o + '<span class="ad-i"><img src="%s" alt="" loading="lazy"></span><span class="ad-l"><b class="d">%s</b><span>%s</span></span>' % (im, t, l) + f
audela = ''.join(ad(*x) for x in AUDELA)
ph_droite = '<figure class="mh-ph" aria-hidden="true"><img class="a" src="/p/helena-3.jpg" alt="" fetchpriority="high" width="825" height="1100"><img class="b" src="/p/t/voeux-ph-2.webp" alt=""><img class="c" src="/projets/fl-auto/img/photo-2.webp" alt=""></figure>'
ph_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="evenement">Demander un devis</button><a class="ln" href="#reportages">Voir les reportages</a></div>'
ph = entete('Photographie', 'Photographie', 'Concerts, institutions, entreprises, mariages.', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.',
            ' u-noir mh-ph-s', FG('Photo', 'left:-1vw;bottom:-.44em;font-size:calc(var(--fg-t) * 1.1)'), ph_droite, ph_act, True)
ph += '''
<section class="sec feuille pose dk ph-f u-noir" id="reportages" data-dark aria-labelledby="t-tr">
  ''' + FG('Reportage', 'right:-2vw;top:-.36em;--vy:-80px;font-size:calc(var(--fg-t) * .72)') + '''
  <div class="w">
    <div class="idx"><h2 class="d" id="t-tr">Reportages</h2><p class="idx-n">36 reportages, 272 photographies. Chaque reportage s’ouvre en grand.</p></div>
    <div class="tetes">''' + tetes + '''</div>
''' + travaux.replace('<h3 class="d">Reportages récents</h3>', '<h3 class="d">Tous les reportages</h3>').replace('id="travaux"', 'id="photographie"') + '''
</section>
<section class="sec ad-f u-papier" id="au-dela" aria-labelledby="t-ad">
  ''' + FG('Sur le vif', 'left:-2vw;bottom:-.3em;font-family:var(--sf);font-style:italic;font-weight:300;font-size:calc(var(--fg-t) * .62)') + '''
  <div class="w">
    <div class="col-t"><h2 class="d" id="t-ad">Au-delà de la scène</h2><p class="lead">La même discrétion pour une inauguration, un atelier ou une journée de mariage : personne ne pose, rien n’est rejoué.</p></div>
    <div class="adl">''' + audela + '''</div>
  </div>
</section>
<section class="sec fo-f u-sable" id="formules" aria-labelledby="t-fo">
  ''' + FG('Formules', 'right:-3vw;top:-.38em;--vy:-70px;font-size:calc(var(--fg-t) * .62)') + '''
  <div class="w">
    <div class="idx"><h2 class="d" id="t-fo">Tarifs</h2><p class="idx-n">Prix de départ, selon la durée sur place. Le devis précise le reste.</p></div>
''' + offres_ph + '''
  </div>
</section>
''' + croise('Le studio fait aussi les sites', 'Un site de réservation, la billetterie d’une salle, une application de budget. Les photos qui l’habillent sont déjà faites.', '/metiers/sites-et-outils/', 'Sites et applications', '/projets/pierceval-tattoo/img/cover-800.webp', 'u-sable') + '\n' + \
    contact_m('Événement, suivi annuel ou mariage : quelques choix, une estimation immédiate.', 'Photographie')
page('metiers/photographie', 'Photographe de concert, d’événement et de mariage en Bretagne · Studio ES', 'Reportages photo en Bretagne : concerts et festivals (Philippe Katerine, Gaël Faye, Matmatah…), événements institutionnels, entreprises, portraits et mariages. Événement dès 250 €.', 'https://studioes.fr/metiers/photographie/', ph, og='og-photo.jpg',
     ld=LD('Photographie', 'https://studioes.fr/metiers/photographie/', 'Reportage photo d’événement, de concert et de mariage', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290)]))

# ---------- Web : trois projets à égalité, la vitrine, puis les offres ----------
bw = sect('web', B).split('\n')
offres_web = '\n'.join(bw[4:48])
VITRINE = [
    ('pierceval', 'Pierceval Tattoo', 'Site, réservation, carte cadeau', '/projets/pierceval-tattoo/',
     'Identité et site conçus ensemble : un fond prune, un rose franc, un lettrage italique qui rappelle l’enseigne.', [
        ('Accueil', 'Les deux métiers dès l’ouverture, et la prise de rendez-vous à portée de pouce.', 'ecran', PV + 'd-hero.webp', PV + 'm-hero.webp', 'piercevaltattoo.fr'),
        ('Réservation', 'Deux parcours, tatouage ou piercing : la demande arrive complète, avec le projet et les disponibilités.', 'ecran', PV + 'd-rdv-type.webp', PV + 'm-rdv-type.webp', 'piercevaltattoo.fr'),
        ('Carte cadeau', 'Montant, message et destinataire choisis en ligne ; la carte arrive en PDF, prête à offrir.', 'ecran', PV + 'd-cadeau-ok.webp', PV + 'm-cadeau.webp', 'piercevaltattoo.fr'),
        ('Réalisations', 'Les tatouages classés par style, pour se décider avant même d’appeler.', 'ecran', PV + 'd-real.webp', PV + 'm-real.webp', 'piercevaltattoo.fr')]),
    ('soute', 'La Soute', 'Site de saison et billetterie', '/projets/la-soute/',
     'Le O de Soute devient un hublot : le même signe sert de logo, de cadre photo et de repère sur le site, la brochure et les affiches.', [
        ('La saison en ligne', 'L’agenda de la saison et les fiches concerts, dans la continuité de la brochure.', 'image', '/projets/la-soute/img/site.webp', '', ''),
        ('Sur téléphone', 'La programmation lisible d’un coup d’œil, la réservation des places au bout du pouce.', 'duo', '/projets/la-soute/img/soute-8.webp', '/projets/la-soute/img/soute-9.webp', ''),
        ('Du papier à l’écran', 'La brochure, les affiches et le site partagent le même hublot et les mêmes couleurs.', 'image', '/projets/la-soute/img/cover.webp', '', '')]),
    ('flouz', 'flouz.', 'Application de budget', '/projets/flouz/',
     'Une interface sombre, un seul violet pour l’essentiel : le solde, les budgets, les alertes.', [
        ('Tableau de bord', 'Le solde, le mois en cours et les dépenses épinglées sur un seul écran.', 'image', '/projets/flouz/img/tableau.webp', '', ''),
        ('Budgets', 'Chaque catégorie a sa jauge ; l’application prévient avant le dépassement.', 'image', '/projets/flouz/img/budget.webp', '', ''),
        ('Objectifs', 'Ce qu’il reste à mettre de côté chaque mois pour atteindre un objectif à temps.', 'image', '/projets/flouz/img/objectifs.webp', '', '')]),
]
def scene_v(t, typ, d, m, url):
    if typ == 'ecran':
        return ('<div class="vs vs-ecran"><div class="vs-ec"><div class="wb-bar"><i></i><i></i><i></i><em>%s</em></div><div class="vs-pg"><img data-v="d" src="%s" alt="%s sur ordinateur" loading="lazy"></div></div>'
                '<div class="vs-tel"><img data-v="m" src="%s" alt="%s sur téléphone" loading="lazy"></div></div>') % (url, d, t, m, t)
    if typ == 'duo':
        return '<div class="vs vs-duo"><div class="vs-tel"><img data-v="d" src="%s" alt="%s sur téléphone" loading="lazy"></div><div class="vs-pap"><img data-v="m" src="%s" alt="%s, page de saison" loading="lazy"></div></div>' % (d, t, m, t)
    return '<div class="vs vs-img"><img data-v="d" src="%s" alt="%s" loading="lazy"></div>' % (d, t)
def vitrine():
    tabs = ''.join('<button type="button" role="tab" id="vt-%s" aria-controls="vp-%s" aria-selected="%s"%s><b>%s</b><span>%s</span></button>' % (
        k, k, 'true' if i == 0 else 'false', '' if i == 0 else ' tabindex="-1"', t, l) for i, (k, t, l, _, _, _) in enumerate(VITRINE))
    pans = ''
    for i, (k, t, l, lien, da, ecr) in enumerate(VITRINE):
        fct = ''.join('<button type="button" aria-pressed="%s" data-j="%d"><b>%s</b><span>%s</span></button>' % ('true' if j == 0 else 'false', j, n, x) for j, (n, x, *_r) in enumerate(ecr))
        scenes = ''.join('<div class="vsc%s" data-j="%d"%s>%s</div>' % (' on' if j == 0 else '', j, '' if j == 0 else ' hidden', scene_v(t, typ, d, m, url)) for j, (n, x, typ, d, m, url) in enumerate(ecr))
        pans += ('<div class="vp" role="tabpanel" id="vp-%s" aria-labelledby="vt-%s"%s><div class="vp-t"><p class="vp-k">Fonctionnalités</p><div class="vp-f">%s</div>'
                 '<p class="vp-da"><b>Direction artistique</b>%s</p><a class="ln" href="%s">Étude de cas</a></div><div class="vp-s">%s</div></div>') % (
            k, k, '' if i == 0 else ' hidden', fct, da, lien, scenes)
    return '<div class="vt" role="tablist" aria-label="Projets web">%s</div>%s' % (tabs, pans)
wb_droite = ('<div class="mh-trio" aria-hidden="true">'
             '<span class="tr-a"><span class="wb-bar"><i></i><i></i><i></i><em>piercevaltattoo.fr</em></span><span class="tr-pg"><img src="/h/hx-site.webp" alt="" width="1200" height="1499"></span></span>'
             '<span class="tr-b"><img src="/projets/la-soute/img/soute-8.webp" alt="" width="480" height="1039"></span>'
             '<span class="tr-c"><img src="/projets/flouz/img/budget.webp" alt="" width="1200" height="1600"></span></div>')
wb_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="site">Démarrer mon site</button><a class="ln" href="#visite">Voir un site en détail</a></div>'
wb = entete('Web', 'Sites et applications', '', 'Pierceval Tattoo prend ses rendez-vous et vend ses cartes cadeaux en ligne. La Soute publie sa saison et vend ses places. flouz suit un budget au jour le jour. Des outils pour les TPE, les lieux culturels et les collectivités de Bretagne.',
            ' u-papier mh-wb-s', '', wb_droite, wb_act)
wb += '''
<section class="sec feuille pose dk vis-f u-nuit" id="visite" data-dark aria-labelledby="t-vis">
  <div class="vis-piste" data-vis data-d="0,750,1500,2249,2905,3539,4289" data-m="0,804,1842,2880,3918,4956,5994">
    <div class="vis-sc">
      <div class="w vis-g">
        <div class="vis-t">
          <h2 class="d" id="t-vis">piercevaltattoo.fr, de haut en bas</h2>
          <ol class="vis-e"><li class="on"><button type="button" data-e="0"><i>01</i><b>Accueil</b><span>Les deux métiers dès l’ouverture, et la prise de rendez-vous toujours à portée.</span></button></li><li><button type="button" data-e="1"><i>02</i><b>Deux métiers</b><span>Le tatouage et le piercing ont chacun leur parcours, avec les tarifs et les acomptes annoncés.</span></button></li><li><button type="button" data-e="2"><i>03</i><b>Réalisations</b><span>Les tatouages classés par style, pour choisir avant d’appeler.</span></button></li><li><button type="button" data-e="3"><i>04</i><b>Suivi de cicatrisation</b><span>Trois questions, et le site indique les gestes à adopter jour après jour.</span></button></li><li><button type="button" data-e="4"><i>05</i><b>Questions fréquentes</b><span>Les réponses aux questions posées le plus souvent au téléphone.</span></button></li><li><button type="button" data-e="5"><i>06</i><b>Contact</b><span>L’adresse, les horaires et l’itinéraire, sans chercher.</span></button></li></ol>
          <div class="vis-ac"><a class="bt" href="/projets/pierceval-tattoo/">Étude de cas</a><a class="ln" href="https://piercevaltattoo.fr" target="_blank" rel="noopener">Ouvrir piercevaltattoo.fr</a></div>
        </div>
        <div class="vis-m" aria-label="Le site de Pierceval Tattoo, capturé page par page">
          <div class="vis-nav"><div class="wb-bar"><i></i><i></i><i></i><em>piercevaltattoo.fr</em></div><div class="vis-ec" tabindex="0" aria-label="Pages du site sur ordinateur"><img src="/projets/pierceval-tattoo/img/visite-d.webp" alt="Le site de Pierceval Tattoo sur ordinateur, de l’accueil au contact" width="1200" height="4289" loading="lazy" decoding="async"></div></div>
          <div class="vis-tel"><div class="vis-tec" tabindex="0" aria-label="Pages du site sur téléphone"><img src="/projets/pierceval-tattoo/img/visite-m.webp" alt="Le site de Pierceval Tattoo sur téléphone, de l’accueil au contact" width="480" height="5994" loading="lazy" decoding="async"></div></div>
        </div>
      </div>
    </div>
  </div>
</section>'''

wb += '''
<section class="sec vi-f u-papier" id="vitrine" aria-labelledby="t-vi">
  ''' + '' + '''
  <div class="w">
    <div class="idx"><h2 class="d" id="t-vi">Trois projets, fonction par fonction</h2><p class="idx-n">Choisissez un projet, puis une fonction : l’écran correspondant s’affiche.</p></div>
    <div class="vi">''' + vitrine() + '''</div>
  </div>
</section>
<section class="sec wb-o u-sable" id="web" data-dark aria-labelledby="t-of">
  ''' + '' + '''
  <div class="w">
    <div class="idx"><h2 class="d" id="t-of">Tarifs des sites</h2><p class="idx-n">Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris. Puis 35&nbsp;€ par mois de suivi.</p></div>
''' + offres_web.replace('<div class="sous"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>', '') + '''
  </div>
</section>
''' + sect('applications', B) + '\n' + croise('Le studio photographie aussi', 'Concerts, festivals, cérémonies, entreprises, mariages : 36 reportages en ligne.', '/metiers/photographie/', 'Voir les reportages', '/p/t/matmatah-1.webp', 'u-papier') + '\n' + \
    contact_m('Site ou application : quelques choix, une estimation immédiate.', 'Web')
page('metiers/sites-et-outils', 'Sites internet et applications en Bretagne · Studio ES', 'Sites internet, réservation en ligne et applications sur mesure pour les TPE, lieux culturels et collectivités de Bretagne : Pierceval Tattoo, La Soute, flouz. Sites dès 990 €.', 'https://studioes.fr/metiers/sites-et-outils/', wb, og='og-web.jpg',
     ld=LD('Web', 'https://studioes.fr/metiers/sites-et-outils/', 'Création de sites internet et d’applications web', [('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))

# ---------- Design graphique : trois familles, l'ensemble puis le détail ----------
def galbt(g, lib):
    return '<button type="button" class="ln gal-b" data-r="%s">%s</button>' % (g, lib)
def puces(g, n=5, skip=0, nom=''):
    # les autres projets de la famille, en puces de nuancier numérotées
    gg = next(x for x in GRAPH if x[0] == g); out = ''
    for i, nn in enumerate(gg[3][skip:skip + n]):
        out += '<button type="button" class="pu" data-r="%s" aria-label="Voir : %s"><span class="pu-i"><img src="/p/t/%s.webp" alt="" loading="lazy"></span><span class="pu-l"><b>%s</b><small>N° %02d</small></span></button>' % (g, gg[1], nn, nom, skip + i + 1)
    return out
def pantone(nom, code, c, txt='#fff'):
    return '<li class="pan" style="--c:%s;--t:%s"><span class="pan-c"></span><span class="pan-l"><b>%s</b><small>%s</small></span></li>' % (c, txt, nom, code)
def tete(n, id, titre, it, texte, k, cas=''):
    return ('<div class="gr-t"><h2 class="d" id="t-%s">%s</h2><div class="gr-tx"><p class="lead">%s</p>'
            '<div class="ds-ac">%s<button type="button" class="ln" data-est data-k="%s">Demander un devis</button></div></div></div>') % (id, titre, texte, cas, k)
def detail(src, alt, pos, legende):
    return '<figure class="det rv"><img src="%s" alt="%s" loading="lazy" style="object-position:%s"><figcaption>Détail · %s</figcaption></figure>' % (src, alt, pos, legende)
gr_droite = ('<div class="mh-gr" aria-hidden="true"><img class="a" src="/projets/la-soute/img/affiche.webp" alt=""><img class="b" src="/projets/mjc-la-marelle/img/p1.webp" alt="">'
             '<img class="c" src="/projets/pierceval-tattoo/img/identite.webp" alt=""></div>')
gr_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-g="Design graphique">Demander un devis</button><a class="ln" href="#identites">Voir les projets</a></div>'
gr = entete('Design graphique', 'Design graphique', 'Identités, campagnes, éditions.', 'L’identité d’un studio de tatouage, la saison d’une salle de concert, la brochure d’une MJC. Du premier croquis au fichier prêt pour l’imprimeur, chiffré sur devis.',
            ' u-sable mh-gr-s', '', gr_droite, gr_act)
gr += '''
<section class="sec gr-f gr-identites u-papier" id="identites" aria-labelledby="t-identites">
  ''' + '' + '''
  <div class="w">
    ''' + tete('01', 'identites', 'Identités visuelles', '', 'Pour Pierceval Tattoo : un badge, un aubergine, un rose franc et un lettrage italique qui reprend l’enseigne. Le même système sur la vitrine, le site, la carte cadeau et la carte de visite.', 'identite', '<a class="ln" href="/projets/pierceval-tattoo/">Étude de cas Pierceval Tattoo</a>') + '''
    <div class="sys rv" aria-label="Le système d’identité de Pierceval Tattoo">
      <figure class="sy sy-logo"><img src="''' + PV + '''id-logo.webp" alt="Logotype de Pierceval Tattoo" loading="lazy"><figcaption>Logotype</figcaption></figure>
      <figure class="sy sy-pal"><ul class="pans">''' + pantone('Aubergine', '#2B1330', '#2B1330') + pantone('Rose', '#E58BD0', '#E58BD0', '#2B1330') + pantone('Peau', '#F3EDE4', '#F3EDE4', '#2B1330') + '''</ul><figcaption>Couleurs</figcaption></figure>
      <figure class="sy sy-vit"><img src="''' + PV + '''id-vitrine.webp" alt="Le logotype en vitrine du studio" loading="lazy"><figcaption>Vitrine</figcaption></figure>
      <figure class="sy sy-cad"><img src="''' + PV + '''id-cadeau.webp" alt="Carte cadeau imprimée" loading="lazy"><figcaption>Carte cadeau</figcaption></figure>
      <figure class="sy sy-cdv"><img src="''' + PV + '''id-cdv-verso.webp" alt="Carte de visite" loading="lazy"><figcaption>Carte de visite</figcaption></figure>
      <figure class="sy sy-web"><img src="''' + PV + '''m-hero.webp" alt="Le site sur téléphone" loading="lazy"><figcaption>Site</figcaption></figure>
    </div>
    ''' + detail(PV + 'id-vitrine.webp', 'Le logotype de Pierceval Tattoo en vitrophanie, vu de près', '50% 45%', 'le badge en vitrine, à taille réelle') + '''
    <div class="aut rv"><p class="d">Autres identités</p><div class="aut-g">''' + puces('identites', 5, 2, 'Identité') + '''</div><div class="aut-l">''' + galbt('identites', 'Toutes les identités') + galbt('signaletique', 'La signalétique') + '''</div></div>
  </div>
</section>
<section class="sec feuille pose gr-f gr-campagnes dk u-terre" id="campagnes" data-dark aria-labelledby="t-campagnes">
  ''' + '' + '''
  <div class="w">
    ''' + tete('02', 'campagnes', 'Campagnes', '', 'Pour la saison de La Soute : le O du nom devient un hublot qui cadre les artistes. Il revient sur la brochure, les affiches de chaque soir et le site.', 'campagne', '<a class="ln" href="/projets/la-soute/">Étude de cas La Soute</a>') + '''
    <div class="camp rv">
      <div class="cp-con"><p class="cp-k">Le concept</p><p class="cp-t d">Un hublot</p><p class="cp-x">Le O de La Soute devient un hublot : il cadre les artistes, rythme les affiches et sert de repère sur chaque support.</p>
        <ul class="pans">''' + pantone('Marine', '#13153E', '#13153E') + pantone('Corail', '#FF6B4F', '#FF6B4F', '#13153E') + pantone('Soleil', '#FFE45C', '#FFE45C', '#13153E') + pantone('Lilas', '#CBC3F3', '#CBC3F3', '#13153E') + '''</ul></div>
      <figure class="cp-kv"><img src="/projets/la-soute/img/affiche.webp" alt="Affiche de concert de La Soute" loading="lazy"><figcaption>Affiche de concert</figcaption></figure>
      <figure class="cp-d1"><img src="/projets/la-soute/img/soute-6.webp" alt="Affiche du temps fort" loading="lazy"><figcaption>Temps fort</figcaption></figure>
      <figure class="cp-d2"><img src="/projets/la-soute/img/soute-5.webp" alt="Visuel de saison" loading="lazy"><figcaption>Saison</figcaption></figure>
      <figure class="cp-d3"><img src="/projets/la-soute/img/soute-8.webp" alt="Déclinaison sur le site, sur téléphone" loading="lazy"><figcaption>Site</figcaption></figure>
    </div>
    ''' + detail('/projets/la-soute/img/affiche.webp', 'Le titre de l’affiche Louve Majeure, vu de près', '20% 64%', 'la typographie de l’affiche de concert') + '''
    <div class="aut rv"><p class="d">Autres campagnes</p><div class="aut-g">''' + puces('campagnes', 5, 0, 'Campagne') + '''</div><div class="aut-l">''' + galbt('campagnes', 'Toutes les campagnes') + galbt('affiches', 'Les affiches') + '''</div></div>
  </div>
</section>
<section class="sec gr-f gr-editions u-sable" id="editions" aria-labelledby="t-editions">
  ''' + '' + '''
  <div class="w">
    ''' + tete('03', 'editions', 'Éditions', '', 'La brochure de saison de la MJC La Marelle, huit pages à feuilleter ci-dessous. Brochures, programmes, magazines et dépliants, jusqu’aux fichiers prêts pour l’imprimeur.', 'edition', '<a class="ln" href="/projets/mjc-la-marelle/">Étude de cas MJC La Marelle</a>') + '''
    <div class="flb rv" data-flb>
      <div class="flb-livre" data-i="0" role="group" aria-label="Brochure de saison de la MJC La Marelle, à feuilleter"><div class="flb-f" data-l="0"><img src="/projets/mjc-la-marelle/img/p1.webp" alt="Brochure de la MJC La Marelle, page 1 : Couverture" loading="lazy" decoding="async"><img class="dos" src="/projets/mjc-la-marelle/img/p2.webp" alt="Brochure de la MJC La Marelle, page 2 : Activités régulières" loading="lazy" decoding="async"></div><div class="flb-f" data-l="1"><img src="/projets/mjc-la-marelle/img/p3.webp" alt="Brochure de la MJC La Marelle, page 3 : École de musique" loading="lazy" decoding="async"><img class="dos" src="/projets/mjc-la-marelle/img/p4.webp" alt="Brochure de la MJC La Marelle, page 4 : Espace Jeunesse" loading="lazy" decoding="async"></div><div class="flb-f" data-l="2"><img src="/projets/mjc-la-marelle/img/p5.webp" alt="Brochure de la MJC La Marelle, page 5 : Espace Familles Adultes" loading="lazy" decoding="async"><img class="dos" src="/projets/mjc-la-marelle/img/p6.webp" alt="Brochure de la MJC La Marelle, page 6 : Chantier d’insertion Friperie Laverie" loading="lazy" decoding="async"></div><div class="flb-f" data-l="3"><img src="/projets/mjc-la-marelle/img/p7.webp" alt="Brochure de la MJC La Marelle, page 7 : Animations culturelles" loading="lazy" decoding="async"><img class="dos" src="/projets/mjc-la-marelle/img/p8.webp" alt="Brochure de la MJC La Marelle, page 8 : Spectacles" loading="lazy" decoding="async"></div></div>
      <div class="flb-ui"><button type="button" class="flb-p" aria-label="Page précédente" disabled>←</button><span class="flb-n" aria-live="polite">Couverture</span><button type="button" class="flb-s" aria-label="Page suivante">→</button></div>
      <p class="flb-aide">Cliquez sur la page, glissez, ou utilisez les flèches du clavier pour tourner.</p>
      <div class="flb-bande" tabindex="0" aria-label="Brochure de saison de la MJC La Marelle, page par page"><figure><img src="/projets/mjc-la-marelle/img/p1.webp" alt="Brochure de la MJC La Marelle, page 1 : Couverture" loading="lazy" decoding="async"><figcaption>1 / 8 · Couverture</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p2.webp" alt="Brochure de la MJC La Marelle, page 2 : Activités régulières" loading="lazy" decoding="async"><figcaption>2 / 8 · Activités régulières</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p3.webp" alt="Brochure de la MJC La Marelle, page 3 : École de musique" loading="lazy" decoding="async"><figcaption>3 / 8 · École de musique</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p4.webp" alt="Brochure de la MJC La Marelle, page 4 : Espace Jeunesse" loading="lazy" decoding="async"><figcaption>4 / 8 · Espace Jeunesse</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p5.webp" alt="Brochure de la MJC La Marelle, page 5 : Espace Familles Adultes" loading="lazy" decoding="async"><figcaption>5 / 8 · Espace Familles Adultes</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p6.webp" alt="Brochure de la MJC La Marelle, page 6 : Chantier d’insertion Friperie Laverie" loading="lazy" decoding="async"><figcaption>6 / 8 · Chantier d’insertion Friperie Laverie</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p7.webp" alt="Brochure de la MJC La Marelle, page 7 : Animations culturelles" loading="lazy" decoding="async"><figcaption>7 / 8 · Animations culturelles</figcaption></figure><figure><img src="/projets/mjc-la-marelle/img/p8.webp" alt="Brochure de la MJC La Marelle, page 8 : Spectacles" loading="lazy" decoding="async"><figcaption>8 / 8 · Spectacles</figcaption></figure></div>
    </div>
    ''' + detail('/projets/mjc-la-marelle/img/hero.webp', 'La couverture illustrée de la brochure de la MJC La Marelle, vue de près', '50% 50%', 'l’illustration de couverture, redessinée d’après photo') + '''
    <div class="aut rv"><p class="d">Autres éditions</p><div class="aut-g">''' + puces('editions', 5, 5, 'Édition') + '''</div><div class="aut-l">''' + galbt('editions', 'Toutes les éditions') + '''</div></div>
  </div>
</section>
<section class="sec fl-f fl-c" aria-label="Fill">
  <div class="w fl-ct"><p>Pour une production régulière plutôt qu’un projet ponctuel, Studio ES a conçu <b>Fill</b>, la communication courante des communes et des entreprises, en abonnement.</p><div class="ds-ac"><a class="bt" href="https://fill.studioes.fr">fill.studioes.fr</a><a class="ln" href="/projets/fill/">La conception de Fill</a></div></div>
</section>
''' + contact_m('Identité, campagne ou édition : décrivez le projet, le devis suit.', 'Design graphique')
page('metiers/graphisme', 'Design graphique en Bretagne : identités, campagnes, éditions · Studio ES', 'Identités visuelles, campagnes et directions artistiques, brochures et éditions pour les lieux culturels, collectivités et entreprises de Bretagne : La Soute, Pierceval Tattoo, MJC La Marelle. Sur devis.', 'https://studioes.fr/metiers/graphisme/', gr,
     ld=LD('Design graphique', 'https://studioes.fr/metiers/graphisme/', 'Identité visuelle, campagne et édition'))

# ---------- Offres : toutes les formules au même endroit ----------
of = entete('Offres', 'Offres et tarifs', 'Prix connus d’avance.', 'Photographie, sites et applications : le prix de départ, les options, les abonnements et les durées d’engagement. Le design graphique est chiffré sur devis.', ' u-papier mh-of',
            '', '', '<nav class="mh-ac of-nav" aria-label="Rubriques des offres"><a class="ln" href="#of-photo">Photographie</a><a class="ln" href="#of-web">Sites internet</a><a class="ln" href="#applications">Applications</a><a class="ln" href="#of-graph">Design graphique</a></nav>')
of += '''
<section class="sec feuille pose fo-f u-sable" id="of-photo" aria-labelledby="t-op">
  <div class="w">
    <div class="idx"><h2 class="d" id="t-op">Photographie</h2><p class="idx-n">Un reportage ponctuel, un photographe attitré à l’année ou une journée de mariage. Sélection retouchée, droits d’utilisation inclus.</p></div>
''' + offres_ph + '''
  </div>
</section>
<section class="sec wb-o u-papier" id="of-web" data-dark aria-labelledby="t-ow">
  <div class="w">
    <div class="idx"><h2 class="d" id="t-ow">Sites internet</h2><p class="idx-n">Un prix de création, puis 35&nbsp;€ par mois de suivi, douze mois minimum : hébergement, nom de domaine, sauvegardes, mises à jour et 30 minutes de modifications par mois.</p></div>
''' + offres_web.replace('<div class="sous"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>', '') + '''
  </div>
</section>
''' + sect('applications', B) + '''
<section class="sec u-sable" id="of-graph" aria-labelledby="t-og">
  <div class="w">
    <div class="idx"><h2 class="d" id="t-og">Design graphique</h2><p class="idx-n">Sur devis, après un premier échange : nombre de supports, déclinaisons, délais et impression.</p></div>
    <ul class="ctn-l og"><li><button type="button" class="ca" data-est data-k="identite"><b class="d">Identité visuelle</b><span>Logo, charte, déclinaisons et signalétique.</span></button></li><li><button type="button" class="ca" data-est data-k="campagne"><b class="d">Campagne</b><span>Concept, affiche et déclinaisons.</span></button></li><li><button type="button" class="ca" data-est data-k="edition"><b class="d">Édition</b><span>Brochure, programme, magazine.</span></button></li></ul>
  </div>
</section>
''' + contact_m('Trois étapes, une estimation immédiate.', '')
page('offres', 'Offres et tarifs : photographie, sites et applications · Studio ES', 'Les formules de Studio ES : reportage photo dès 250 €, suivi photo annuel, mariage, sites internet dès 990 € avec suivi mensuel, applications en abonnement ou à l’achat. Design graphique sur devis.', 'https://studioes.fr/offres/', of,
     ld=LD('Offres', 'https://studioes.fr/offres/', 'Photographie, sites internet et applications', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290), ('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))
