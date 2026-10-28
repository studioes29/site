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

# ---------- Photographie : les têtes d'affiche, tous les reportages, au-delà de la scène, puis les formules ----------
bp = sect('photographie', B).split('\n')
offres_ph = '\n'.join(bp[4:44])
travaux = '\n'.join(bp[45:49])
TETES = [('philippe-katerine', 'Philippe Katerine', '/p/philippe-katerine-2.jpg'), ('la-fouine', 'La Fouine', '/p/la-fouine-2.jpg'), ('fatal-bazooka', 'Fatal Bazooka', '/p/fatal-bazooka-1.jpg'),
         ('gael-faye', 'Gaël Faye', '/p/gael-faye-1.jpg'), ('mentissa', 'Mentissa', '/p/mentissa-2.jpg'), ('danakil', 'Danakil', '/p/danakil-7.jpg'),
         ('axel-bauer', 'Axel Bauer', '/p/axel-bauer-1.jpg'), ('synapson', 'Synapson', '/p/synapson-1.jpg')]
NPH = {r['id']: len(r['ph']) for r in json.loads(re.search(r'window.REPS=(\[.*?\]);', open(os.path.join(RACINE, 'reps.js'), encoding='utf8').read(), re.S).group(1))}
tetes = ''.join('<button type="button" class="ta ta%d" data-r="%s" aria-label="Voir le reportage %s, %d photos"><img src="%s" alt="" loading="lazy"><span><b class="d">%s</b><small>%d photos</small></span></button>' % (
    i + 1, r, t, NPH.get(r, 0), im, t, NPH.get(r, 0)) for i, (r, t, im) in enumerate(TETES))
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
ph_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="evenement">Demander un devis %s</button><a class="ln" href="#tetes">Voir les reportages</a></div>' % AR
ph = entete('Photographie', 'Photographie', 'Vos moments forts, sur le vif.', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.',
            ' u-noir mh-ph-s', FG('Photo', 'left:-1vw;bottom:-.44em;font-size:calc(var(--fg-t) * 1.1)'), ph_droite, ph_act, True)
ph += '''
<section class="sec feuille dk ph-f u-foret" id="tetes" data-dark aria-labelledby="t-tr">
  ''' + FG('Scène', 'right:-2vw;top:-.36em;--vy:-80px;font-size:calc(var(--fg-t) * .9)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>Sur scène</span></p><h2 class="d" id="t-tr">Têtes d’affiche<span class="it">Concerts et festivals.</span></h2></div><p class="lead">Des artistes de premier plan, photographiés au plus près de la scène. Chaque reportage s’ouvre en grand.</p></div>
    <div class="tetes">''' + tetes + '''</div>
''' + travaux.replace('<h3 class="d">Reportages récents</h3>', '<h3 class="d">Tous les reportages</h3>').replace('id="travaux"', 'id="photographie"') + '''
</section>
<section class="sec feuille ad-f u-papier" id="au-dela" aria-labelledby="t-ad">
  ''' + FG('Sur le vif', 'left:-2vw;bottom:-.3em;--vy:-60px;font-family:var(--sf);font-style:italic;font-weight:300;font-size:calc(var(--fg-t) * .62)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Au-delà de la scène</span></p><h2 class="d" id="t-ad">Événements,<span class="it">entreprises, mariages.</span></h2></div><p class="lead">La même discrétion pour une inauguration, un atelier ou une journée de mariage.</p></div>
    <div class="adl">''' + audela + '''</div>
  </div>
</section>
<section class="sec feuille fo-f u-menthe" id="formules" aria-labelledby="t-fo">
  ''' + FG('Formules', 'right:-3vw;top:-.38em;--vy:-70px;font-size:calc(var(--fg-t) * .62)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>03</i><span>Les formules</span></p><h2 class="d" id="t-fo">Événement, suivi,<span class="it">mariage.</span></h2></div><p class="lead">Des prix connus d’avance, modulables selon la durée. Le devis précise le reste.</p></div>
''' + offres_ph + '''
  </div>
</section>
''' + croise('Le studio fait aussi<span class="it">des sites et des applications.</span>', 'Un site clair et bien référencé, ou une application qui fait gagner du temps. Et quand il faut de belles photos pour l’habiller, elles sont déjà là.', '/metiers/sites-et-outils/', 'Découvrir le web', '/projets/pierceval-tattoo/img/cover-800.webp', 'u-violet dk') + '\n' + \
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
                 '<p class="vp-da"><b>Direction artistique</b>%s</p><a class="bt" href="%s">Voir l’étude de cas %s</a></div><div class="vp-s">%s</div></div>') % (
            k, k, '' if i == 0 else ' hidden', fct, da, lien, AR, scenes)
    return '<div class="vt" role="tablist" aria-label="Projets web">%s</div>%s' % (tabs, pans)
wb_droite = ('<div class="mh-trio" aria-hidden="true">'
             '<span class="tr-a"><span class="wb-bar"><i></i><i></i><i></i><em>piercevaltattoo.fr</em></span><span class="tr-pg"><img src="/h/hx-site.webp" alt="" width="1200" height="1499"></span></span>'
             '<span class="tr-b"><img src="/projets/la-soute/img/soute-8.webp" alt="" width="480" height="1039"></span>'
             '<span class="tr-c"><img src="/projets/flouz/img/budget.webp" alt="" width="1200" height="1600"></span></div>')
wb_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-k="site">Démarrer mon site %s</button><a class="ln" href="#vitrine">Voir les réalisations</a></div>' % AR
wb = entete('Web', 'Web', 'Sites et applications sur mesure.', 'Un site de réservation, le site d’une salle de concert, une application de budget : des projets différents, conçus avec la même exigence de clarté, pour les TPE, les lieux culturels et les collectivités de Bretagne.',
            ' u-nuit mh-wb-s', FG('Web', 'right:-3vw;top:-.36em;font-size:calc(var(--fg-t) * 1.25)'), wb_droite, wb_act, True)
wb += '''
<section class="sec feuille vi-f u-lilas" id="vitrine" aria-labelledby="t-vi">
  ''' + FG('Écrans', 'left:-2vw;bottom:-.34em;--vy:-80px;font-size:calc(var(--fg-t) * .8)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>Réalisations</span></p><h2 class="d" id="t-vi">Trois projets,<span class="it">trois expériences.</span></h2></div><p class="lead">Choisissez un projet, puis une fonctionnalité : l’écran correspondant s’affiche.</p></div>
    <div class="vi rv">''' + vitrine() + '''</div>
  </div>
</section>
<section class="sec feuille dk wb-o u-violet" id="web" data-dark aria-labelledby="t-of">
  ''' + FG('Sites', 'right:-2vw;bottom:-.4em;--vx:-50px;--vy:-40px;font-size:calc(var(--fg-t) * .85)') + '''
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Les offres</span></p><h2 class="d" id="t-of">Un site,<span class="it">à votre mesure.</span></h2></div><p class="lead">Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris. Le suivi mensuel garde le site à jour.</p></div>
''' + offres_web.replace('<div class="sous rv"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>', '') + '''
  </div>
</section>
''' + sect('applications', B) + '\n' + croise('Le studio fait aussi<span class="it">de la photographie.</span>', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret, puis une sélection resserrée et retouchée.', '/metiers/photographie/', 'Découvrir la photographie', '/p/t/matmatah-1.webp', 'u-foret dk') + '\n' + \
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
    return ('<div class="gr-t rv"><p class="pt"><i>%s</i><span>%s</span></p><h2 class="d" id="t-%s">%s<span class="it">%s</span></h2><div class="gr-tx"><p class="lead">%s</p>'
            '<div class="ds-ac"><button type="button" class="bt" data-est data-k="%s">Parler de mon projet %s</button>%s</div></div></div>') % (n, titre, id, titre, it, texte, k, AR, cas)
def detail(src, alt, pos, legende):
    return '<figure class="det rv"><img src="%s" alt="%s" loading="lazy" style="object-position:%s"><figcaption>Détail · %s</figcaption></figure>' % (src, alt, pos, legende)
gr_droite = ('<div class="mh-gr" aria-hidden="true"><img class="a" src="/projets/la-soute/img/affiche.webp" alt=""><img class="b" src="/projets/mjc-la-marelle/img/p1.webp" alt="">'
             '<img class="c" src="/projets/pierceval-tattoo/img/identite.webp" alt=""></div>')
gr_act = '<div class="mh-ac"><button type="button" class="bt" data-est data-g="Design graphique">Parler de mon projet %s</button><a class="ln" href="#identites">Voir les projets</a></div>' % AR
gr = entete('Design graphique', 'Graphisme', 'Identités, campagnes, éditions.', 'Une direction artistique qui tient sur tous les supports : l’identité d’un lieu ou d’une marque, la campagne d’une saison, la brochure qu’on garde. Chaque projet est chiffré sur devis.',
            ' u-rose mh-gr-s', FG('Design', 'left:-1vw;bottom:-.42em;font-size:calc(var(--fg-t) * 1.05)'), gr_droite, gr_act)
gr += '''
<section class="sec feuille gr-f gr-identites u-papier" id="identites" aria-labelledby="t-identites">
  ''' + FG('Identité', 'right:-2vw;top:-.36em;--vy:-80px;font-size:calc(var(--fg-t) * .72)') + '''
  <div class="w">
    ''' + tete('01', 'identites', 'Identités visuelles', 'Un système complet, pas seulement un logo.', 'Logotype, couleurs, typographies et règles de déclinaison : de quoi rester reconnaissable sur l’enseigne, le site, la carte cadeau et les réseaux.', 'identite', '<a class="ln" href="/projets/pierceval-tattoo/">Étude de cas Pierceval Tattoo</a>') + '''
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
<section class="sec feuille gr-f gr-campagnes dk u-terre" id="campagnes" data-dark aria-labelledby="t-campagnes">
  ''' + FG('Campagne', 'left:-2vw;bottom:-.4em;--vx:50px;--vy:-50px;font-size:calc(var(--fg-t) * .78)') + '''
  <div class="w">
    ''' + tete('02', 'campagnes', 'Campagnes et directions artistiques', 'Une idée, déclinée partout.', 'Festivals, saisons culturelles, événements, recrutement : un concept fort, puis l’affiche, les réseaux, l’affichage et la presse.', 'campagne', '<a class="ln" href="/projets/la-soute/">Étude de cas La Soute</a>') + '''
    <div class="camp rv">
      <div class="cp-con"><p class="cp-k">Le concept</p><p class="cp-t d">Un hublot<span class="it">pour signature.</span></p><p class="cp-x">Le O de La Soute devient un hublot : il cadre les artistes, rythme les affiches et sert de repère sur chaque support.</p>
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
<section class="sec feuille gr-f gr-editions u-sable" id="editions" aria-labelledby="t-editions">
  ''' + FG('Édition', 'right:-1vw;bottom:-.38em;--vy:-60px;font-family:var(--sf);font-style:italic;font-weight:300;font-size:calc(var(--fg-t) * .78)') + '''
  <div class="w">
    ''' + tete('03', 'editions', 'Édition et supports imprimés', 'Des pages qui se lisent.', 'Brochures, programmes, magazines et dépliants : une grille claire, une hiérarchie lisible, des fichiers prêts pour l’imprimeur.', 'edition', '<a class="ln" href="/projets/mjc-la-marelle/">Étude de cas MJC La Marelle</a>') + '''
    <div class="livre rv">
      <button type="button" class="lv-cou" data-r="editions" aria-label="Voir les éditions : couverture"><img src="/projets/mjc-la-marelle/img/p1.webp" alt="" loading="lazy"><span>Couverture</span></button>
      <button type="button" class="lv-dbl" data-r="editions" aria-label="Voir les éditions : pages intérieures"><span class="pg"><img src="/projets/mjc-la-marelle/img/p2.webp" alt="" loading="lazy"></span><span class="pg"><img src="/projets/mjc-la-marelle/img/p3.webp" alt="" loading="lazy"></span><span class="lg">Pages intérieures</span></button>
      <div class="lv-pl">''' + ''.join('<button type="button" data-r="editions" aria-label="Voir les éditions : page %d"><img src="/projets/mjc-la-marelle/img/p%d.webp" alt="" loading="lazy"></button>' % (n, n) for n in (4, 5, 6, 7)) + '''</div>
    </div>
    ''' + detail('/projets/mjc-la-marelle/img/hero.webp', 'La couverture illustrée de la brochure de la MJC La Marelle, vue de près', '50% 50%', 'l’illustration de couverture, redessinée d’après photo') + '''
    <div class="aut rv"><p class="d">Autres éditions</p><div class="aut-g">''' + puces('editions', 5, 5, 'Édition') + '''</div><div class="aut-l">''' + galbt('editions', 'Toutes les éditions') + '''</div></div>
  </div>
</section>
<section class="sec feuille fl-f fl-c" aria-label="Fill">
  <div class="w fl-ct rv"><p>Pour une production régulière plutôt qu’un projet ponctuel, Studio ES a conçu <b>Fill</b>, un service de communication externalisée pour les communes et les entreprises.</p><div class="ds-ac"><a class="bt" href="https://fill.studioes.fr">Découvrir Fill <span class="ar"><svg class="i"><use href="#ne"/></svg></span></a><a class="ln" href="/projets/fill/">La conception de Fill</a></div></div>
</section>
''' + contact_m('Identité, campagne ou édition : décrivez le projet, le devis suit.', 'Design graphique')
page('metiers/graphisme', 'Design graphique en Bretagne : identités, campagnes, éditions · Studio ES', 'Identités visuelles, campagnes et directions artistiques, brochures et éditions pour les lieux culturels, collectivités et entreprises de Bretagne : La Soute, Pierceval Tattoo, MJC La Marelle. Sur devis.', 'https://studioes.fr/metiers/graphisme/', gr,
     ld=LD('Design graphique', 'https://studioes.fr/metiers/graphisme/', 'Identité visuelle, campagne et édition'))

# ---------- Offres : toutes les formules au même endroit ----------
of = entete('Offres', 'Offres', 'Prix connus d’avance.', 'Photographie, sites et applications : les formules et leurs options, avec le prix de départ, les abonnements et les durées d’engagement. Le design graphique est chiffré sur devis.', ' u-noir mh-of',
            FG('Offres', 'right:-2vw;bottom:-.42em;font-size:calc(var(--fg-t) * .95)'), '', '<div class="mh-ac of-nav"><a class="bt" href="#of-photo">Photographie ' + AR + '</a><a class="bt" href="#of-web">Sites ' + AR + '</a><a class="bt" href="#applications">Applications ' + AR + '</a><a class="ln" href="#of-graph">Design graphique</a></div>', True)
of += '''
<section class="sec feuille fo-f u-menthe" id="of-photo" aria-labelledby="t-op">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>01</i><span>Photographie</span></p><h2 class="d" id="t-op">Événement, suivi,<span class="it">mariage.</span></h2></div><p class="lead">Un reportage ponctuel, un photographe attitré à l’année ou une journée de mariage. Livraison d’une sélection retouchée, droits d’utilisation inclus.</p></div>
''' + offres_ph + '''
  </div>
</section>
<section class="sec feuille dk wb-o u-violet" id="of-web" data-dark aria-labelledby="t-ow">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>02</i><span>Sites internet</span></p><h2 class="d" id="t-ow">Un site,<span class="it">puis son suivi.</span></h2></div><p class="lead">Un prix de création, puis 35 € par mois de suivi, douze mois minimum : hébergement, nom de domaine, sauvegardes, mises à jour et 30 minutes de modifications par mois.</p></div>
''' + offres_web.replace('<div class="sous rv"><h3 class="d">Site internet</h3><p>Textes rédigés, référencement local, mise en ligne et une heure de prise en main compris.</p></div>', '') + '''
  </div>
</section>
''' + sect('applications', B) + '''
<section class="sec feuille u-rose" id="of-graph" aria-labelledby="t-og">
  <div class="w">
    <div class="sec-t rv"><div><p class="pt"><i>04</i><span>Design graphique</span></p><h2 class="d" id="t-og">Sur devis,<span class="it">selon le projet.</span></h2></div><p class="lead">Une identité, une campagne ou une édition se chiffrent après un premier échange : nombre de supports, déclinaisons, délais et impression.</p></div>
    <div class="og rv"><button type="button" class="og-c" data-est data-k="identite"><b class="d">Identité visuelle</b><span>Logo, charte, déclinaisons et signalétique.</span><em>Demander un devis ''' + AR + '''</em></button><button type="button" class="og-c" data-est data-k="campagne"><b class="d">Campagne</b><span>Concept, affiche et déclinaisons.</span><em>Demander un devis ''' + AR + '''</em></button><button type="button" class="og-c" data-est data-k="edition"><b class="d">Édition</b><span>Brochure, programme, magazine.</span><em>Demander un devis ''' + AR + '''</em></button></div>
  </div>
</section>
''' + contact_m('Quelques choix, une estimation immédiate, votre demande part en un clic.', '')
page('offres', 'Offres et tarifs : photographie, sites et applications · Studio ES', 'Les formules de Studio ES : reportage photo dès 250 €, suivi photo annuel, mariage, sites internet dès 990 € avec suivi mensuel, applications en abonnement ou à l’achat. Design graphique sur devis.', 'https://studioes.fr/offres/', of,
     ld=LD('Offres', 'https://studioes.fr/offres/', 'Photographie, sites internet et applications', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290), ('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))
