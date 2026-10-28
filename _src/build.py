"""Génère studioes.fr : accueil portfolio, pages métiers (photographie, web, graphisme) et réalisations.
Usage : python3 build.py <PREFIXE_ASSETS> <DOSSIER_SORTIE> <robots>"""
import re, sys, os, json
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); RACINE = os.path.dirname(D)
P, OUT, ROBOTS = sys.argv[1], sys.argv[2], sys.argv[3]
T = open(os.path.join(D, 'tpl.html'), encoding='utf8').read().replace('{P}', P)
B = open(os.path.join(D, 'blocs.html'), encoding='utf8').read()
HOME = open(os.path.join(D, 'home.html'), encoding='utf8').read()
def sect(id, src=None):
    m = re.search(r'<section class="sec[^"]*" id="%s"[^>]*>.*?\n</section>' % id, src or (T + '\n' + B), re.S); return m.group(0)
def ar(): return '<span class="ar"><svg class="i"><use href="#ar"/></svg></span>'

# ---------- galeries de graphisme (même visionneuse que les reportages) ----------
GRAPH = [
    ('identites', 'Identités visuelles', 'ident', ['fl-auto-id-2', 'pierceval-1', 'maison-ble-1', 'laureen-1', 'poupon-1', 'oceane-1', 'molan-move-1', 'viconte-1']),
    ('signaletique', 'Signalétique', 'ident', ['carenage-1', 'jardin-1', 'jardin-3', 'totem-1', 'totem-2', 'creche-sig-1', 'creche-sig-4', 'creche-sig-6']),
    ('campagnes', 'Campagnes', 'camp', ['saisons-ellipse-8', 'saisons-ellipse-9', 'recrutement-1', 'recrutement-2', 'recrutement-3', 'budget-1', 'budget-2', 'zero-plastique-2', 'don-2', 'ete-sportif-1', 'fdm-1', 'fdm-5', 'voeux-1', 'boucherie-2', 'ads-1']),
    ('affiches', 'Affiches', 'camp', ['affiches-2', 'affiches-4', 'affiches-6', 'affiches-8', 'affiches-10', 'affiches-12', 'affiches-14', 'affiches-15', 'affiches-16']),
    ('editions', 'Éditions', 'edit', ['marelle-1', 'marelle-2', 'marelle-3', 'marelle-4', 'marelle-5', 'editions-1', 'editions-4', 'editions-5', 'editions-6', 'editions-7', 'saisons-ellipse-67', 'fdm-4', 'fdm-2']),
]
RAT = {}
for _, _, _, L in GRAPH:
    for n in L:
        w, h = Image.open(os.path.join(RACINE, 'p/t/%s.webp' % n)).size; RAT[n] = round(w / h, 3)
open(os.path.join(OUT, 'graph.js'), 'w', encoding='utf8').write('window.GRAPH=%s;Object.assign(window.RAT=window.RAT||{},%s);' % (
    json.dumps([{'id': i, 't': t, 'k': k, 'ph': L} for i, t, k, L in GRAPH], ensure_ascii=False), json.dumps(RAT)))
T = T.replace('<script src="%sapp.js' % P, '<script src="%sgraph.js?v=1"></script>\n<script src="%sapp.js' % (P, P))

def taille(chemin):
    try:
        w, h = Image.open(os.path.join(RACINE, chemin.lstrip('/'))).size; return w, h
    except Exception: return 800, 600

# ---------- les réalisations : une seule liste, plusieurs étiquettes ----------
# (titre, lien ou galerie, image, étiquettes, ligne)
TR = [
    ('Pierceval Tattoo', '/projets/pierceval-tattoo/', '/projets/pierceval-tattoo/img/cover-800.webp', 'web graph', 'Site, réservation en ligne et carte cadeau'),
    ('Matmatah', '#r=matmatah', '/p/t/matmatah-1.webp', 'photo', 'Concert'),
    ('La Soute', '/projets/la-soute/', '/projets/la-soute/img/cover-800.webp', 'web graph photo', 'Identité, saison culturelle et site'),
    ('Les Petites Folies', '#r=pub-petites-folies', '/p/t/pub-petites-folies-1.webp', 'photo', 'Festival'),
    ('MJC La Marelle', '/projets/mjc-la-marelle/', '/projets/mjc-la-marelle/img/cover-800.webp', 'graph web', 'Brochure de saison et site'),
    ('Campagnes', '#r=campagnes', '/p/t/saisons-ellipse-8.webp', 'graph', 'Saisons culturelles, recrutement, prévention'),
    ('Inauguration', '#r=inauguration', '/p/t/inaug-digue-7.webp', 'photo', 'Événementiel et institutions'),
    ('FL Auto', '/projets/fl-auto/', '/projets/fl-auto/img/cover-800.webp', 'graph photo', 'Identité, signalétique et reportage'),
    ('flouz.', '/projets/flouz/', '/projets/flouz/img/cover-800.webp', 'web', 'Application de budget'),
    ('Philippe Katerine', '#r=philippe-katerine', '/p/t/philippe-katerine-2.webp', 'photo', 'Concert'),
    ('Identités visuelles', '#r=identites', '/p/t/maison-ble-1.webp', 'graph', 'Logotypes, univers et déclinaisons'),
    ('Mam’our et merveilles', '/projets/mam-our-et-merveilles/', '/projets/mam-our-et-merveilles/img/cover-800.webp', 'graph', 'Identité et réseaux sociaux'),
    ('Le Chant de l’Eucalyptus', '#r=pub-eucalyptus', '/p/t/pub-eucalyptus-1.webp', 'photo', 'Festival'),
    ('FL Auto, l’atelier', '#r=fl-auto-photo', '/p/t/fl-auto-photo-1.webp', 'photo', 'Portraits et métiers'),
    ('Éditions', '#r=editions', '/p/t/editions-5.webp', 'graph', 'Brochures, programmes, dépliants'),
    ('Cérémonie des vœux', '#r=voeux-ph', '/p/t/voeux-ph-1.webp', 'photo', 'Événementiel et institutions'),
    ('Affiches', '#r=affiches', '/p/t/affiches-6.webp', 'graph', 'Expositions, spectacles, événements'),
    ('Fatal Bazooka', '#r=fatal-bazooka', '/p/t/fatal-bazooka-1.webp', 'photo', 'Concert'),
    ('Signalétique', '#r=signaletique', '/p/t/carenage-1.webp', 'graph', 'Lieux publics et commerces'),
    ('Forum des associations', '#r=forum-asso', '/p/t/forum-asso-11.webp', 'photo', 'Événementiel et institutions'),
    ('Danakil', '#r=danakil', '/p/t/danakil-8.webp', 'photo', 'Concert'),
    ('Festidreuz', '#r=pub-festidreuz', '/p/t/pub-festidreuz-1.webp', 'photo', 'Festival'),
]
NOM = {'photo': 'Photographie', 'web': 'Web', 'graph': 'Graphisme'}
def tuile(t, cls=''):
    titre, lien, img, tags, ligne = t
    w, h = taille(img)
    g = lien[3:] if lien.startswith('#r=') else ''
    lab = ' · '.join(NOM[x] for x in tags.split())
    href = '/' + lien if g else lien
    return ('<a class="tl%s" href="%s"%s data-t="%s"><span class="tl-i"><img src="%s" alt="" loading="lazy" decoding="async" width="%d" height="%d"></span>'
            '<span class="tl-l"><b>%s</b><span>%s</span><small>%s</small></span></a>') % (
        cls, href, ' data-r="%s"' % g if g else '', tags, img, w, h, titre, ligne, lab)

SEL = ['Matmatah', 'Pierceval Tattoo', 'Les Petites Folies', 'La Soute', 'Inauguration', 'MJC La Marelle', 'Campagnes', 'FL Auto']
selection = '<div class="sel-g">' + ''.join(tuile(next(t for t in TR if t[0] == n), ' rv') for n in SEL) + '</div>'
HOME = HOME.replace('{SELECTION}', selection)

HEAD_END = T.index('<main id="haut">'); FOOT = T.index('</main>')
def page(path, title, desc, canon, main, home=False, ld='', og=''):
    h = T[:HEAD_END] + '<main id="haut">\n' + main + '\n' + T[FOOT:]
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + desc, h)
    h = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + canon, h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + canon, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + title, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + desc, h)
    if og: h = h.replace('content="https://studioes.fr/og.jpg"', 'content="https://studioes.fr/' + og + '"')
    h = h.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="%s">' % ROBOTS)
    if not home:
        h = h.replace('<a class="evite" href="#selection">', '<a class="evite" href="#h1">')
        h = re.sub(r'<script type="application/ld\+json">.*?</script>', '<script type="application/ld+json">' + ld + '</script>' if ld else '', h, count=1, flags=re.S)
    # la rubrique courante est signalée dans le menu
    if path: h = h.replace('<a href="/%s/">' % path, '<a aria-current="page" href="/%s/">' % path, 1)
    d = os.path.join(OUT, path); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(h)

page('', 'Studio ES · Photographie, web et design graphique en Bretagne', 'Studio indépendant en Bretagne : photographie de concert, d’événement et de mariage, sites internet et applications, identités visuelles, campagnes et éditions.', 'https://studioes.fr/', HOME + '\n' + sect('contact'), True)

contact = sect('contact')
def nettoie(s):
    s = re.sub(r'<div class="qui rv">.*?</div></div>\s*', '', s, count=1, flags=re.S)
    s = re.sub(r'<div class="sec-t rv">.*?</div>\s*', '', s, count=1, flags=re.S)
    return s
contact_p = nettoie(contact).replace('<div class="ct">', '<div class="sec-t rv"><h2 class="d" id="t-ct">Parlons de<span class="it">votre projet.</span></h2><p class="lead">Réponse sous 48 h, devis gratuit et sans engagement.</p></div>\n    <div class="ct">', 1)
def entete(nom, titre, it, lead, cls=''):
    return ('<section class="mh%s" aria-labelledby="h1"><div class="w">\n  <p class="fil"><a href="/">Studio ES</a><span>/</span><span>%s</span></p>\n'
            '  <h1 class="d" id="h1">%s<span class="it">%s</span></h1>\n  <p class="lead">%s</p>\n</div></section>') % (cls, nom, titre, it, lead)
def LD(nom, url, service, offres=()):
    g = [{"@type": "Service", "name": service, "url": url, "provider": {"@id": "https://studioes.fr/#studio"}, "areaServed": {"@type": "AdministrativeArea", "name": "Bretagne"}},
         {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"}, {"@type": "ListItem", "position": 2, "name": nom, "item": url}]}]
    if offres: g[0]["offers"] = [{"@type": "Offer", "name": n, "priceCurrency": "EUR", "price": str(p), "priceSpecification": {"@type": "PriceSpecification", "minPrice": p, "priceCurrency": "EUR"}} for n, p in offres]
    return json.dumps({"@context": "https://schema.org", "@graph": g}, ensure_ascii=False)
def croise(titre, texte, lien, lib, img):
    return ('<section class="sec feuille cr-f" aria-label="Et aussi"><div class="w croise2 rv"><a class="cr-i" href="%s" aria-label="Voir"><img src="%s" alt="" loading="lazy"></a>'
            '<div class="cr-tx"><h2 class="d">%s</h2><p>%s</p><a class="bt" href="%s">%s %s</a></div></div></section>') % (lien, img, titre, texte, lien, lib, ar())

# ---------- Photographie : le portfolio d'abord, les formules ensuite ----------
bp = sect('photographie', B).split('\n')
offres_ph = '\n'.join(bp[4:44])          # grp + dots
travaux = '\n'.join(bp[45:49])          # titre, filtres et rail
ph = entete('Photographie', 'Photographie', 'Vos moments forts, sur le vif.', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.', ' mh-ph') + '''
<section class="sec feuille ph-f" id="photographie" aria-labelledby="t-tr">
  <div class="w">
''' + travaux.replace('<h3 class="d">Reportages récents</h3>', '<h2 class="d" id="t-tr">Reportages</h2>') + '''
</section>
<section class="sec feuille fo-f" id="formules" aria-labelledby="t-fo">
  <div class="w">
    <div class="sec-t rv"><h2 class="d" id="t-fo">Les formules<span class="it">Événement, suivi annuel, mariage.</span></h2><p class="lead">Des prix connus d’avance, modulables selon la durée. Le devis précise le reste.</p></div>
''' + offres_ph + '''
  </div>
</section>
''' + croise('Le studio fait aussi<span class="it">des sites et des applications.</span>', 'Un site clair et bien référencé, ou une application qui fait gagner du temps. Et quand il faut de belles photos pour l’habiller, elles sont déjà là.', '/metiers/sites-et-outils/', 'Voir le web', '/projets/pierceval-tattoo/img/cover-800.webp') + '\n' + contact_p
page('metiers/photographie', 'Photographe de concert, d’événement et de mariage en Bretagne · Studio ES', 'Reportages photo sur le vif dans le Finistère et en Bretagne : concerts et festivals, événements et institutions, portraits et métiers, mariages. Événement dès 250 €.', 'https://studioes.fr/metiers/photographie/', ph, og='og-photo.jpg', ld=LD('Photographie', 'https://studioes.fr/metiers/photographie/', 'Reportage photo d’événement, de concert et de mariage', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290)]))

# ---------- Web : les réalisations d'abord, les offres ensuite ----------
bw = sect('web', B).split('\n')
offres_web = '\n'.join(bw[4:48])         # sous-titre, grp, dots, vraies photos, note
reals = '\n'.join(bw[48:56])           # titre et rail des réalisations
wb = entete('Web', 'Web', 'Sites et applications sur mesure.', 'Pour les TPE, commerces, artisans et collectivités de Bretagne : un site clair, rédigé et bien référencé localement, et des applications qui font gagner du temps au quotidien.', ' mh-wb') + '''
<section class="sec feuille dk" id="web" data-dark aria-labelledby="realisations">
  <div class="w">
''' + reals.replace('<h3 class="d">Réalisations web</h3>', '<h2 class="d">Réalisations</h2>') + '''
</section>
<section class="sec feuille dk wb-o" data-dark aria-label="Les offres de site">
  <div class="w">
''' + offres_web + '''
  </div>
</section>
''' + sect('applications', B) + '\n' + croise('Le studio fait aussi<span class="it">de la photographie.</span>', 'Concerts, festivals, cérémonies, vie d’une entreprise, mariages : un reportage discret, puis une sélection resserrée et retouchée.', '/metiers/photographie/', 'Voir la photographie', '/p/t/matmatah-1.webp') + '\n' + contact_p
page('metiers/sites-et-outils', 'Sites internet et applications en Bretagne · Studio ES', 'Sites internet pour TPE, associations et collectivités dès 990 €, applications sur mesure dès 190 € : réservation, devis, inscriptions. Études de cas et tarifs.', 'https://studioes.fr/metiers/sites-et-outils/', wb, og='og-web.jpg', ld=LD('Web', 'https://studioes.fr/metiers/sites-et-outils/', 'Création de sites internet et d’applications web', [('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))

# ---------- Design graphique : trois familles, sur devis ----------
def mosa(ids):
    out = ''
    for g in ids:
        gg = next(x for x in GRAPH if x[0] == g)
        for n in gg[3][:4]:
            w, h = taille('/p/t/%s.webp' % n)
            out += '<button type="button" data-r="%s" aria-label="Voir : %s"><img src="/p/t/%s.webp" alt="" loading="lazy" width="%d" height="%d"></button>' % (g, gg[1], n, w, h)
    return out
def famille(n, id, titre, it, texte, points, ids, cas, k):
    cas_h = ''.join('<a class="gr-c" href="%s">%s %s</a>' % (l, t, '<svg class="i"><use href="#ne"/></svg>') for t, l in cas)
    return ('''<section class="sec feuille gr-f gr-%s" id="%s" aria-labelledby="t-%s">
  <div class="w gr">
    <div class="gr-t rv"><p class="ds-n">%s</p><h2 class="d" id="t-%s">%s<span class="it">%s</span></h2><p class="lead">%s</p>
      <ul class="ds-b">%s</ul>%s
      <button type="button" class="bt" data-est data-k="%s">Parler de mon projet %s</button></div>
    <div class="gr-m rv">%s</div>
  </div>
</section>''') % (id, id, id, n, id, titre, it, texte, ''.join('<li>%s</li>' % p for p in points), '<p class="gr-cs">' + cas_h + '</p>' if cas_h else '', k, ar(), mosa(ids))
gr = entete('Design graphique', 'Graphisme', 'Identités, campagnes, éditions.', 'Une direction artistique qui tient sur tous les supports : l’identité d’un lieu ou d’une marque, la campagne d’une saison, la brochure qu’on garde. Chaque projet est chiffré sur devis.', ' mh-gr') + '\n' + \
    famille('01', 'identites', 'Identités visuelles', 'Une identité complète, pas seulement un logo.', 'Logotype, univers graphique, typographies, couleurs et règles de déclinaison : de quoi rester reconnaissable sur l’enseigne, le site et les réseaux.', ['Logotype et univers', 'Charte et typographies', 'Signalétique et déclinaisons'], ['identites', 'signaletique'], [('FL Auto', '/projets/fl-auto/'), ('Pierceval Tattoo', '/projets/pierceval-tattoo/'), ('Mam’our et merveilles', '/projets/mam-our-et-merveilles/')], 'identite') + '\n' + \
    famille('02', 'campagnes', 'Campagnes et directions artistiques', 'Une idée, déclinée partout.', 'Festivals, saisons culturelles, événements, recrutement, communication institutionnelle : un concept fort, puis l’affiche, les réseaux, l’affichage et la presse.', ['Concept et direction artistique', 'Affiches et déclinaisons', 'Saisons culturelles et événements'], ['campagnes', 'affiches'], [('La Soute', '/projets/la-soute/')], 'campagne') + '\n' + \
    famille('03', 'editions', 'Édition et supports imprimés', 'Des pages qui se lisent.', 'Brochures, programmes, magazines, catalogues et dépliants : une grille claire, une hiérarchie lisible, et des fichiers prêts pour l’imprimeur.', ['Brochures et programmes de saison', 'Magazines et catalogues', 'Systèmes éditoriaux réutilisables'], ['editions'], [('MJC La Marelle', '/projets/mjc-la-marelle/')], 'edition') + '''
<section class="sec feuille fl-f fl-c" aria-label="Production régulière">
  <div class="w fl-ct rv"><p>Besoin de supports chaque mois plutôt que d’un projet&nbsp;? Publications, affiches courantes, newsletters : c’est le rôle de <b>Fill</b>, le service de communication régulière conçu par Studio ES.</p><a class="bt" href="https://fill.studioes.fr">Découvrir Fill <span class="ar"><svg class="i"><use href="#ne"/></svg></span></a></div>
</section>
''' + contact_p
page('metiers/graphisme', 'Design graphique en Bretagne : identités, campagnes, éditions · Studio ES', 'Identités visuelles, campagnes et directions artistiques, brochures et éditions pour les lieux culturels, collectivités et entreprises de Bretagne. Sur devis.', 'https://studioes.fr/metiers/graphisme/', gr, ld=LD('Design graphique', 'https://studioes.fr/metiers/graphisme/', 'Identité visuelle, campagne et édition'))

# ---------- Réalisations : toutes disciplines, plusieurs étiquettes par projet ----------
n = {k: sum(1 for t in TR if k in t[3].split()) for k in NOM}
rl = entete('Réalisations', 'Réalisations', 'Toutes disciplines.', 'Reportages, sites, identités, campagnes et éditions. Un projet qui mêle plusieurs disciplines se retrouve dans chacune.', ' mh-rl') + '''
<section class="sec feuille rl-f" id="travaux-tous" aria-label="Réalisations">
  <div class="w">
    <div class="chips rv" data-filtre role="group" aria-label="Filtrer les réalisations"><button type="button" aria-pressed="true" data-f="">Tout<small>%d</small></button>%s</div>
    <div class="rl-g">%s</div>
  </div>
</section>
''' % (len(TR), ''.join('<button type="button" aria-pressed="false" data-f="%s">%s<small>%d</small></button>' % (k, NOM[k], n[k]) for k in NOM), ''.join(tuile(t) for t in TR)) + contact_p
page('realisations', 'Réalisations · Studio ES', 'Portfolio de Studio ES : reportages photo, sites et applications, identités, campagnes et éditions, en Bretagne.', 'https://studioes.fr/realisations/', rl, ld=LD('Réalisations', 'https://studioes.fr/realisations/', 'Portfolio photographie, web et design graphique'))
print('ok')
