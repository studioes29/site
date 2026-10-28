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
    ('Matmatah', '#r=matmatah', '/p/matmatah-10.jpg', 'photo', 'Concert'),
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
def tuile(t, cls='', n=0):
    titre, lien, img, tags, ligne = t
    w, h = taille(img)
    g = lien[3:] if lien.startswith('#r=') else ''
    lab = ''.join('<em class="k-%s">%s</em>' % (x, NOM[x]) for x in tags.split())
    href = '/' + lien if g else lien
    num = '<i class="tl-n">%02d</i>' % n if n else ''
    trans = ' tl-x' if len(tags.split()) > 1 else ''
    return ('<a class="tl tl-%s%s%s" href="%s"%s data-t="%s"><span class="tl-i"><img src="%s" alt="%s, %s" loading="lazy" decoding="async" width="%d" height="%d"></span>'
            '<span class="tl-l">%s<b>%s</b><span>%s</span><small>%s</small></span></a>') % (
        tags.split()[0], trans, cls, href, ' data-r="%s"' % g if g else '', tags, img, titre, ligne[0].lower() + ligne[1:], w, h, num, titre, ligne, lab)

SEL = ['Matmatah', 'Pierceval Tattoo', 'Les Petites Folies', 'FL Auto, l’atelier', 'La Soute', 'Campagnes', 'Inauguration', 'MJC La Marelle']
selection = '<div class="ed-g">' + ''.join(tuile(next(t for t in TR if t[0] == n), ' rv', i + 1) for i, n in enumerate(SEL)) + '</div>'
HOME = HOME.replace('{SELECTION}', selection)
# bannière : chaque mot est découpé en lettres, pour qu'elles se recomposent une à une
def lettres(m):
    mot = m.group(2)
    return m.group(1) + ''.join('<u style="--k:%d">%s</u>' % (i, '&nbsp;' if c == ' ' else c) for i, c in enumerate(mot)) + '</span>'
HOME = re.sub(r'(<span data-a="\d">)([^<]+)</span>', lettres, HOME.split('<p class="hx-leg">')[0]) + '<p class="hx-leg">' + HOME.split('<p class="hx-leg">')[1]
# l'animation démarre avant le premier affichage, sauf si le visiteur a demandé moins de mouvement
HOME = HOME.replace('<section class="hero hx" id="hx" data-dark aria-labelledby="h1">', '<section class="hero hx" id="hx" data-dark aria-labelledby="h1"><script>if(!matchMedia("(prefers-reduced-motion: reduce)").matches)document.currentScript.parentNode.dataset.a=1</script>')

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
exec(open(os.path.join(D, 'metiers.py'), encoding='utf8').read())

# ---------- Réalisations : toutes disciplines, plusieurs étiquettes par projet ----------
n = {k: sum(1 for t in TR if k in t[3].split()) for k in NOM}
rl = entete('Réalisations', 'Réalisations', 'Toutes disciplines.', 'Reportages, sites, identités, campagnes et éditions. Un projet qui mêle plusieurs disciplines se retrouve dans chacune.', ' u-noir mh-rl', FG('Portfolio', 'left:-2vw;bottom:-.2em', 'o'), '', '', True) + '''
<section class="sec feuille rl-f u-papier" id="travaux-tous" aria-label="Réalisations">
  <div class="w">
    <div class="chips rv" data-filtre role="group" aria-label="Filtrer les réalisations"><button type="button" aria-pressed="true" data-f="">Tout<small>%d</small></button>%s</div>
    <div class="rl-g">%s</div>
  </div>
</section>
''' % (len(TR), ''.join('<button type="button" aria-pressed="false" data-f="%s">%s<small>%d</small></button>' % (k, NOM[k], n[k]) for k in NOM), ''.join(tuile(t) for t in TR)) + contact_p
page('realisations', 'Réalisations · Studio ES', 'Portfolio de Studio ES : reportages photo, sites et applications, identités, campagnes et éditions, en Bretagne.', 'https://studioes.fr/realisations/', rl, ld=LD('Réalisations', 'https://studioes.fr/realisations/', 'Portfolio photographie, web et design graphique'))
print('ok')
