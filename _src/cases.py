"""Études de cas d'identité visuelle : une page par projet dans projets/<slug>/.
Gabarit : la page FL Auto (styles, en-tête, pied de page, scripts). Visuels : produits à part (dossier cases), copiés dans projets/<slug>/img/.
Usage : python3 _src/cases.py <dossier des visuels>"""
import os, re, sys, shutil, json, html
from PIL import Image

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
TPL = open(os.path.join(R, 'projets/fl-auto/index.html'), encoding='utf8').read()
HEAD, TAIL = TPL[:TPL.index('<main>')], TPL[TPL.index('</main>'):]
AR = '<svg aria-hidden="true"><use href="#a"/></svg>'

# (slug, titre, sous-titre, étiquettes, intervention, contexte, nombre de supports,
#  chapitres [(titre, se, texte, [(image, classe, alt)]), ...], livrables [(image, titre, ligne)], couleurs de la carte, fin)
C = [
 dict(slug='christopher-poupon', nom='Christopher Poupon', se='Deux initiales, un seul trait.', k=['Identité visuelle', 'Paysagiste'],
  inter='Logo, couleurs, typographies, cartes de visite, papeterie, réseaux sociaux',
  ctx='Un paysagiste à son compte : une signature lisible sur un chantier comme sur un devis, brodée sur un gant ou imprimée sur un panneau.',
  ch=[('Un monogramme', 'd’un seul tenant', 'Le C s’ouvre en arc et le P en descend : les deux initiales partagent le même trait épais. Le signe reste lisible brodé sur un gant de travail, et le nom en capitales étroites tient dessous sans l’écraser.', [('logo', 'wide', 'Le monogramme de Christopher Poupon sur fond vert sapin'), ('variantes', 'wide', 'Le logo sur quatre fonds de la palette')]),
      ('Les couleurs', 'du jardin', 'Un vert sapin pour le métier, une sauge et une terre cuite pour les supports secondaires, une craie à la place du blanc pur. Les titres en capitales étroites reprennent la géométrie du nom.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('Les supports', 'sur le terrain', 'Cartes de visite, papeterie, réseaux sociaux : partout, le monogramme seul suffit dès que la place manque.', [('cartes', 'wide', 'Cartes de visite recto verso'), ('application', 'wide', 'Devis, enveloppe et carte de correspondance'), ('photo', '', 'Le logo brodé sur un gant de travail'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo et variantes', 'Sur fond clair, foncé et couleur.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, deux familles.'), ('cartes', 'Cartes de visite', 'Recto verso.'), ('application', 'Papeterie', 'Devis, enveloppe, correspondance.'), ('reseaux', 'Réseaux sociaux', 'Profil et gabarits de publication.')],
  fin=('Une activité à lancer', 'Parlons-en.')),
 dict(slug='maison-ble', nom='Maison Blé', se='Un épi, une arche.', k=['Identité visuelle', 'Boulangerie'],
  inter='Logo, couleurs, typographies, cartes, sac à pain, étiquettes, réseaux sociaux',
  ctx='Une boulangerie artisanale : une identité sobre, qui se lit sur un sac à pain, une étiquette et une vitrine sans prendre le pas sur le produit.',
  ch=[('Un épi', 'dans une arche', 'L’épi est dessiné d’un trait fin, posé dans une arche aux angles arrondis qui rappelle la bouche du four. Le nom en capitales à fort contraste donne le ton d’une maison artisanale ; « Boulangerie », espacé, se lit en second.', [('logo', 'wide', 'Le logo Maison Blé sur fond brun'), ('variantes', 'wide', 'Le logo sur quatre fonds de la palette')]),
      ('Les couleurs', 'du pain', 'Elles viennent du pain lui-même : la croûte, le blé, le noir du fournil et la farine pour les fonds. Les titres à fort contraste répondent à un texte courant fin et espacé.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('Les supports', 'du comptoir', 'Le sac à pain en papier kraft porte le logo d’une seule couleur ; l’étiquette ronde ferme les sachets et identifie les pains.', [('application', '', 'Sac à pain kraft et étiquette ronde'), ('cartes', '', 'Cartes de visite recto verso'), ('photo', 'wide', 'Le logo posé sur la photographie des pains'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo et variantes', 'Sur fond clair, foncé et couleur.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, deux familles.'), ('application', 'Sac à pain et étiquette', 'Une couleur, sur kraft.'), ('cartes', 'Cartes de visite', 'Recto verso.'), ('reseaux', 'Réseaux sociaux', 'Profil et gabarits de publication.')],
  fin=('Une enseigne à faire connaître', 'Parlons-en.')),
 dict(slug='laureen-boudigou', nom='Laureen Boudigou', se='Un monogramme tenu au cordeau.', k=['Identité visuelle', 'Avocate'],
  inter='Logo, couleurs, typographies, cartes de visite, papeterie, réseaux sociaux',
  ctx='Une avocate qui ouvre son cabinet : une identité sérieuse sans être austère, du papier à en-tête à la plaque de l’entrée.',
  ch=[('Un monogramme', 'en cartouche', 'Le L et le B s’imbriquent dans un cartouche aux lignes droites, traversé de bandes horizontales : la rigueur du métier, sans raideur. Le nom en romain à empattements équilibre le signe.', [('logo', 'wide', 'Le logo de Laureen Boudigou sur fond encre'), ('variantes', 'wide', 'Le logo sur quatre fonds de la palette')]),
      ('Les couleurs', 'du cabinet', 'Une encre presque noire, un laiton pour la plaque et les détails, une pierre et un ivoire pour les papiers. Les titres en garamond, les textes dans une linéale sobre.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('Les supports', 'de l’accueil', 'La papeterie du cabinet garde l’encre et l’ivoire ; les cartes reprennent le cartouche en réserve sur l’encre.', [('application', 'wide', 'Lettre à en-tête, enveloppe et carte de correspondance'), ('cartes', '', 'Cartes de visite recto verso'), ('photo', 'wide', 'Le logo posé sur la photographie d’une colonnade'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo et variantes', 'Sur fond clair, foncé et couleur.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, deux familles.'), ('application', 'Papeterie', 'Lettre, enveloppe, correspondance.'), ('cartes', 'Cartes de visite', 'Recto verso.'), ('reseaux', 'Réseaux sociaux', 'Profil et gabarits de publication.')],
  fin=('Un cabinet à ouvrir', 'Parlons-en.')),
 dict(slug='molan-move', nom='Molan Move', se='Un élan en deux traits.', k=['Identité visuelle', 'Événement sportif'],
  inter='Logo, couleurs, typographies, dossard, supports, réseaux sociaux',
  ctx='Un événement sportif à Moëlan-sur-Mer : un nom court et un signe qui se lisent sur un dossard, une affiche et une banderole d’arrivée.',
  ch=[('Un signe', 'en mouvement', 'Deux formes pleines, comme une foulée ou une vague, au-dessus d’un nom en minuscules arrondies. Les liaisons entre les lettres donnent au nom le rythme d’une course.', [('logo', 'wide', 'Le logo Molan Move sur fond bleu'), ('variantes', 'wide', 'Le logo sur quatre fonds de la palette')]),
      ('Les couleurs', 'du plein air', 'Un bleu marée, une écume et un orange pour l’effort : des couleurs franches, lisibles de loin et en plein soleil. Une seule famille de caractères, de la plus fine à la plus grasse.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('Les supports', 'de la course', 'Le dossard porte le signe et le numéro en grand, la médaille reprend le signe ; les réseaux annoncent les parcours et les inscriptions.', [('application', '', 'Le dossard et la médaille de l’événement'), ('photo', '', 'Le logo posé sur une photographie de course'), ('cartes', 'wide', 'Cartes recto verso'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo et variantes', 'Sur fond clair, foncé et couleur.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, une famille.'), ('application', 'Dossard', 'Le numéro lisible de loin.'), ('cartes', 'Cartes', 'Recto verso.'), ('reseaux', 'Réseaux sociaux', 'Profil et gabarits de publication.')],
  fin=('Un événement à annoncer', 'Parlons-en.')),
 dict(slug='elodie-viconte', nom='Élodie Viconte', se='La main, l’appareil, le déclic.', k=['Identité visuelle', 'Photographe'],
  inter='Logo, couleurs, typographies, cartes de visite, pochette de tirages, réseaux sociaux',
  ctx='Une photographe : une signature dessinée, assez fine pour signer une image sans la recouvrir.',
  ch=[('Un dessin', 'au trait', 'Une main tient un appareil argentique, le flash part. Le nom en capitales Art déco, aux barres hautes, répond à la finesse du dessin ; « Photography », très espacé, ferme la composition.', [('logo', 'wide', 'Le logo d’Élodie Viconte sur fond noir'), ('variantes', 'wide', 'Le logo sur quatre fonds de la palette')]),
      ('Les couleurs', 'du laboratoire', 'Le noir et le papier baryté du tirage argentique, un gris sel d’argent et le rouge de la lampe du laboratoire, réservé aux détails.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('Les supports', 'des tirages', 'La pochette accompagne les tirages remis aux clients ; la signature se pose en blanc sur les images, sans les recouvrir.', [('application', '', 'Pochette de tirages et tirage'), ('cartes', '', 'Cartes de visite recto verso'), ('photo', 'wide', 'Le logo posé sur une photographie'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo et variantes', 'Sur fond clair, foncé et couleur.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, deux familles.'), ('application', 'Pochette de tirages', 'Pour la remise des images.'), ('cartes', 'Cartes de visite', 'Recto verso.'), ('reseaux', 'Réseaux sociaux', 'Profil et signature des images.')],
  fin=('Un regard à signer', 'Parlons-en.')),
 dict(slug='creche-oceane', nom='Crèche Océane', se='Un nom évidé.', k=['Identité et signalétique', 'Petite enfance'],
  inter='Logo, couleurs, typographies, signalétique murale, badges, carnet de liaison, réseaux sociaux',
  ctx='La crèche de Moëlan-sur-Mer : un nom à faire vivre auprès des familles, et des murs à habiller sur le thème de la mer.',
  ch=[('Un nom', 'évidé', 'Le nom est découpé dans une forme blanche aux pointes douces, posée sur la photo : l’image se voit à travers les lettres. « Crèche » et « Moëlan-sur-Mer », écrits à la main, ajoutent la chaleur d’un dessin d’enfant.', [('variantes', 'wide', 'Le logo posé sur les photographies de la crèche et sur le bleu marine')]),
      ('Les couleurs', 'de la mer', 'Un orange vif et un bleu marine, ceux des murs de la crèche, une terre pour les écritures à la main et un lin pour les fonds. Les titres en capitales dessinées, les petits mots à la main.', [('palette', 'wide', 'Palette et typographies de l’identité')]),
      ('La signalétique', 'sur les murs', 'Un grand poisson orange dans l’espace de jeu, des phrases sur la mer et des dessins au trait dans les couloirs : la crèche raconte son nom pièce par pièce.', [('sig-1', '', 'Le grand poisson orange peint dans l’espace de jeu'), ('sig-4', '', 'Une phrase et une flèche peintes dans le couloir'), ('sig-6', 'wide', 'Un poulpe dessiné au trait et une phrase sur le mur')]),
      ('Les supports', 'du quotidien', 'Badges de l’équipe, carnet de liaison, cartes et réseaux sociaux reprennent le logo et les couleurs des murs.', [('application', 'wide', 'Badge de l’équipe et carnet de liaison'), ('cartes', '', 'Cartes recto verso'), ('reseaux', 'wide', 'Le profil Instagram et sa grille')])],
  liv=[('logo', 'Logo', 'Posé sur la photographie.'), ('sig-1', 'Signalétique murale', 'Le poisson, les phrases, les dessins.'), ('palette', 'Couleurs et typographies', 'Quatre teintes, deux familles.'), ('application', 'Badges et carnet', 'Pour l’équipe et les familles.'), ('reseaux', 'Réseaux sociaux', 'Profil et gabarits de publication.')],
  fin=('Un lieu à habiller', 'Parlons-en.')),
]
# ---------- structure commune : signe, système, supports, réseaux ----------
SYS = {
 'christopher-poupon': ('Le monogramme agrandi devient un fond, répété il devient un motif pour les papiers et les publications.', 'Rond comme la lettre C : la photographie se cadre dans un cercle, sur les affiches comme sur les réseaux.'),
 'maison-ble': ('L’épi agrandi habille les fonds, et l’arche cadre les photographies de pain.', 'L’arche reprend la bouche du four : elle cadre les images sur l’affiche et les réseaux.'),
 'laureen-boudigou': ('Le cartouche agrandi devient un fond à l’encre ; en motif, il signe la correspondance.', 'Un cadre net, un filet laiton : la même retenue sur l’affiche que sur la papeterie.'),
 'molan-move': ('Les deux formes du signe, agrandies, donnent l’élan des fonds ; en motif, elles rythment les publications.', 'Les photographies se coupent en biais, dans le sens de la course.'),
 'elodie-viconte': ('Le dessin agrandi, à peine visible sur le noir, sert de fond ; en motif, il signe les tirages.', 'Chaque image est présentée comme un tirage, avec sa marge blanche.'),
 'creche-oceane': ('La forme en amande du logo devient un motif à elle seule : elle se répète sur les fonds et cadre les photographies.', 'L’amande cadre les photographies de la crèche, sur l’affiche comme sur les réseaux.'),
}
def restructure(c):
    old = {t: (se, tx, ims) for t, se, tx, ims in c['ch']}
    first = c['ch'][0]; cols = c['ch'][1]; sup = [x for x in c['ch'] if x[0] == 'Les supports'][0]
    sig = [x for x in c['ch'] if x[0] == 'La signalétique']
    nom = c['nom']; sy = SYS[c['slug']]
    ch = [(first[0], first[1], first[2], [('construction', 'wide', 'La construction du logo ' + nom), ('variantes', 'wide', 'Le logo sur les fonds de l’identité')]),
          ('Le système', cols[1], sy[0] + ' ' + cols[2], [('systeme', 'wide', 'Le signe agrandi, le motif et la signature'), ('palette', 'wide', 'Palette et typographies de l’identité')]),
          (sup[0], sup[1], sup[2] + ' ' + sy[1], [('affiche', '', 'Affiche'), ('cartes', '', 'Cartes de visite, dorure et gaufrage'), ('application', 'wide', 'Supports')])]
    ch += sig
    ch.append(('Les réseaux', 'en campagne', 'Six publications pensées ensemble : une phrase, une photographie, le motif, une information, une citation et la signature. La grille se lit d’un seul regard.', [('reseaux', 'wide', 'Grille de publications Instagram')]))
    c['ch'] = ch
    lv = [('construction', 'Construction', 'Proportions et zone de protection.'), ('systeme', 'Système graphique', 'Signe, motif, signature.'),
          ('affiche', 'Affiche', 'Le cadre propre à l’identité.'), ('cartes', 'Cartes de visite', 'Dorure ou gaufrage.'), ('application', c['liv'][2][1] if c['slug'] != 'creche-oceane' else 'Badges et carnet', 'Les supports du métier.'),
          ('reseaux', 'Réseaux sociaux', 'Une grille pensée ensemble.')]
    if c['slug'] == 'creche-oceane': lv.insert(1, ('sig-1', 'Signalétique murale', 'Les murs de la crèche.'))
    c['liv'] = lv
for c in C: restructure(c)

# supports propres à chaque client (bespoke.py), à la place des supports génériques
BESP = {
 'christopher-poupon': [('plan', 'wide', 'Plan de jardin coté, avec le monogramme en cartouche'), ('etiquettes', '', 'Étiquettes de végétaux'), ('affiche', '', 'Affiche'), ('application', 'wide', 'Devis, enveloppe et carte de correspondance'), ('cartes', 'wide', 'Cartes de visite, monogramme gaufré')],
 'maison-ble': [('vitrine', 'wide', 'La devanture, l’arche dorée sur la vitrine'), ('boite', '', 'Boîte à pâtisseries'), ('application', '', 'Sac à pain et étiquette'), ('ardoise', 'wide', 'La carte des pains'), ('cartes', 'wide', 'Cartes de visite, dorure à chaud')],
 'laureen-boudigou': [('plaque', '', 'Plaque professionnelle en laiton'), ('chemise', '', 'Chemise de dossier, cartouche gaufré'), ('site', 'wide', 'Le site du cabinet'), ('cartes', 'wide', 'Cartes de visite, dorure à chaud'), ('application', 'wide', 'Lettre à en-tête, enveloppe et correspondance')],
 'molan-move': [('affiche', '', 'Affiche de la course'), ('tshirt', '', 'T-shirt finisher'), ('application', 'wide', 'Dossard et médaille'), ('cartes', 'wide', 'Cartes')],
 'elodie-viconte': [('planche', 'wide', 'Planche contact, sélection au crayon gras'), ('bon', '', 'Bon cadeau et son enveloppe'), ('application', '', 'Pochette de tirages'), ('site', 'wide', 'Le site, en galerie'), ('cartes', 'wide', 'Cartes de visite, dorure à chaud')],
 'creche-oceane': [('portes', 'wide', 'Plaques des sections'), ('livret', 'wide', 'Livret d’accueil des familles'), ('sac', '', 'Sac des familles'), ('application', '', 'Badge de l’équipe et carnet de liaison'), ('cartes', 'wide', 'Cartes')],
}
LIVB = {
 'christopher-poupon': [('plan', 'Plan de jardin', 'Le monogramme en cartouche.'), ('etiquettes', 'Étiquettes de végétaux', 'Plantées au jardin.')],
 'maison-ble': [('vitrine', 'Devanture', 'L’arche dorée sur la vitrine.'), ('ardoise', 'Carte des pains', 'Au comptoir.')],
 'laureen-boudigou': [('plaque', 'Plaque', 'Laiton, à l’entrée.'), ('site', 'Site du cabinet', 'Accueil et domaines.')],
 'molan-move': [('tshirt', 'T-shirt finisher', 'Pour l’arrivée.')],
 'elodie-viconte': [('planche', 'Planche contact', 'La sélection au crayon.'), ('site', 'Site', 'Une galerie en noir.')],
 'creche-oceane': [('portes', 'Plaques des sections', 'Une couleur par section.'), ('livret', 'Livret d’accueil', 'Pour les familles.')],
}
for c in C:
    for i, t in enumerate(c['ch']):
        if t[0] == 'Les supports': c['ch'][i] = (t[0], t[1], t[2], BESP[c['slug']])
    c['liv'] = c['liv'][:3] + LIVB[c['slug']] + c['liv'][3:]

SIG = {'sig-1': ('creche-sig-1', (140, 0, 880, 1100)), 'sig-4': ('creche-sig-4', None), 'sig-6': ('creche-sig-6', None)}
BR = json.load(open(os.path.join(SRC, 'brands.json')))


# ---------- chaque page prend l'identité du client : police de titre, fond, couleur d'accent ----------
TH = {  # (fond de page, surface, texte, accent, police, graisse, interlettrage, capitales)
 'christopher-poupon': ('#EFEADF', '#F7F3EA', '#1F3B2D', '#C2794A', 'oswald', 'Oswald', 600, '0', True),
 'maison-ble': ('#F5EFE4', '#FBF7EF', '#2A211C', '#9C7A3F', 'italiana', 'Italiana', 400, '.02em', False),
 'laureen-boudigou': ('#F5F2EC', '#FFFFFF', '#1D2635', '#8A7650', 'cormorant-garamond', 'Cormorant Garamond', 600, '-.01em', False),
 'molan-move': ('#F2F4F1', '#FFFFFF', '#133E6B', '#FF6A3D', 'outfit', 'Outfit', 700, '-.03em', False),
 'elodie-viconte': ('#141414', '#1E1E1E', '#EDE7DC', '#C4483B', 'poiret-one', 'Poiret One', 400, '0', False),
 'creche-oceane': ('#F6F0E8', '#FFFFFF', '#1F5C8F', '#F0901E', 'amatic-sc', 'Amatic SC', 700, '0', False),
}
def theme(slug):
    bg, s1, tx, ac, pkg, fam, w, ls, caps = TH[slug]
    d = os.path.join(R, 'projets', slug, 'f'); os.makedirs(d, exist_ok=True)
    shutil.copy(os.path.join(SRC, 'fonts', pkg, 'files', '%s-latin-%d-normal.woff2' % (pkg, w)), os.path.join(d, 't.woff2'))
    dark = sum(int(bg[i:i + 2], 16) for i in (1, 3, 5)) < 200
    mu = 'rgba(237,231,220,.62)' if dark else 'color-mix(in srgb,%s 64%%,transparent)' % tx
    ln = 'rgba(237,231,220,.14)' if dark else 'color-mix(in srgb,%s 14%%,transparent)' % tx
    return ('<link rel="preload" href="f/t.woff2" as="font" type="font/woff2" crossorigin>\n<style>@font-face{font-family:"Marque";src:url(f/t.woff2) format("woff2");font-weight:%d;font-display:swap}'
            ':root{--bg:%s;--s1:%s;--s2:%s;--tx:%s;--mu:%s;--fa:%s;--ln:%s;--pa:%s;--pink:%s}'
            'main .d{font-family:"Marque",var(--d);font-weight:%d;letter-spacing:%s%s}main h1.d{line-height:.9}main .se{color:%s}main .n{color:%s}'
            'main .bref,main .ch,main .cqd,main .end{color:var(--tx)}main .bref dt,main .meta dt{color:var(--mu)}main .dis em{--kc:%s}'
            '%s</style>\n') % (w, bg, s1, s1, tx, mu, mu, ln, ac, ac, w, ls, ';text-transform:uppercase' if caps else '', ac, ac, ac,
            'body{background:var(--bg);color:var(--tx)}main .chip,main .mq figure{background:#1E1E1E;color:#EDE7DC}main .bt-g{background:#2a2a2a;color:#EDE7DC}main .k span{background:#1E1E1E;color:#EDE7DC;box-shadow:inset 0 0 0 1px rgba(237,231,220,.14)}' if dark else '')

def esc(s): return html.escape(s, quote=True)
def nb(s): return s.replace(' :', ' :').replace(' ;', ' ;').replace(' ?', ' ?').replace(' !', ' !').replace('« ', '« ').replace(' »', ' »')

def images(c):
    d = os.path.join(R, 'projets', c['slug'], 'img'); os.makedirs(d, exist_ok=True)
    src = os.path.join(SRC, 'out', c['slug'])
    for f in os.listdir(src):
        im = Image.open(os.path.join(src, f)).convert('RGB')
        im.save(os.path.join(d, f), quality=84, method=6)
    for k, (n, crop) in SIG.items():
        if c['slug'] != 'creche-oceane': continue
        im = Image.open(os.path.join(R, 'p', n + '.jpg')).convert('RGB')
        if crop: im = im.crop(crop)
        im.save(os.path.join(d, k + '.webp'), quality=84, method=6)
    cv = Image.open(os.path.join(d, 'cover.webp'))
    s = cv.copy(); s.thumbnail((800, 800)); s.save(os.path.join(d, 'cover-800.webp'), quality=82, method=6)
    og = cv.resize((1200, int(cv.height * 1200 / cv.width))); top = (og.height - 630) // 2
    og.crop((0, top, 1200, top + 630)).save(os.path.join(d, 'og.jpg'), quality=85)
    return d

def page(c):
    d = images(c)
    def sz(n): return Image.open(os.path.join(d, n + '.webp')).size
    b = BR[c['slug']]; url = 'https://studioes.fr/projets/%s/' % c['slug']
    titre = '%s, %s · Studio ES' % (c['nom'], c['k'][0].lower())
    desc = '%s : %s. Un projet Studio ES, basé en Bretagne.' % (c['nom'], c['inter'][0].lower() + c['inter'][1:])
    h = HEAD
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % esc(titre), h)
    for prop, val in (('description', desc),):
        h = re.sub(r'(<meta name="%s" content=")[^"]*' % prop, lambda m: m.group(1) + esc(val), h)
    h = h.replace('https://studioes.fr/projets/fl-auto/', url)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', lambda m: m.group(1) + esc(titre), h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', lambda m: m.group(1) + esc(nb(c['se'])), h)
    ld = {"@context": "https://schema.org", "@graph": [{"@type": "CreativeWork", "@id": url + "#projet", "name": '%s, %s' % (c['nom'], c['k'][0].lower()), "url": url, "inLanguage": "fr-FR", "image": url + "img/og.jpg", "creator": {"@id": "https://studioes.fr/#studio"}, "keywords": "identité visuelle, logo, " + c['k'][1].lower()},
                                                          {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"}, {"@type": "ListItem", "position": 2, "name": c['nom'], "item": url}]}]}
    h = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: '<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False), h, count=1, flags=re.S)
    h = h.replace('<a class="ret" href="/realisations/"', '<a class="ret" href="/metiers/graphisme/"')
    pal = b['pal']
    w, hh = sz('cover')
    m = ['<main>', '<section class="fh w" aria-labelledby="t" style="--pc:%s;--pc2:%s">' % (b['dark'] if c['slug'] != 'creche-oceane' else pal[1][1], pal[1][1] if c['slug'] != 'creche-oceane' else pal[2][1]),
         '  <div class="tx">', '    <p class="fil"><a href="/">Studio ES</a><span>/</span><a href="/metiers/graphisme/">Graphisme</a></p>',
         '    <h1 class="d" id="t">%s<span class="se">%s</span></h1>' % (esc(c['nom']), esc(nb(c['se']))),
         '    <div class="k">%s</div>' % ''.join('<span>%s</span>' % esc(x) for x in c['k']),
         '    <dl class="meta">', '    <div><dt>Client</dt><dd>%s</dd></div>' % esc(c['nom']), '    <div><dt>Intervention</dt><dd>%s</dd></div>' % esc(c['inter']),
         '    <div><dt>Discipline</dt><dd>%s</dd></div>' % esc(c['k'][0]), '  </dl>', '  </div>', '  <div class="cd" data-r>',
         '    <div class="chip"><div class="win"><img src="img/cover.webp" srcset="img/cover-800.webp 800w, img/cover.webp 1400w" sizes="(max-width: 860px) 100vw, 60vw" width="%d" height="%d" fetchpriority="high" alt="Le logo %s et sa mise en situation"></div><div class="lab"><b>%s</b><span>%s</span><small>%s</small></div></div>' % (w, hh, esc(c['nom']), esc(c['nom']), esc(c['k'][0]), esc(c['k'][1])),
         '  </div>', '</section>',
         '<section class="bref" aria-label="Le projet en bref"><div><dl><dt>Contexte</dt><dd>%s</dd></dl></div><div><dl><dt>Le travail réalisé</dt><dd>%s.</dd></dl><p class="dis"><em style="--kc:#B5583F">Design graphique</em></p></div><div><dl><dt>Supports présentés</dt><dd class="nb">%d supports</dd></dl></div></section>' % (esc(nb(c['ctx'])), esc(c['inter']), len(c['liv'])),
         '', '<div class="w">']
    for i, (t, se, tx, ims) in enumerate(c['ch'], 1):
        g = ''.join('\n    <img data-r%s src="img/%s.webp" width="%d" height="%d" alt="%s" loading="lazy">' % (' class="wide"' if cl else '', n, *sz(n), esc(a)) for n, cl, a in ims)
        sw = ''
        if t == 'Le système':
            sw = '\n    <div class="sw" role="group" aria-label="Palette">%s</div>' % ''.join('<i style="background:%s;color:%s">%s</i>' % (col, b['dark'] if sum(int(col[j:j + 2], 16) for j in (1, 3, 5)) > 450 else 'rgba(255,255,255,.8)', esc(n)) for n, col in pal)
        m += ['<section class="ch" aria-labelledby="c%d">' % i, '  <div class="tx" data-r>', '    <span class="n">%02d</span>' % i,
              '    <h2 class="d" id="c%d">%s <span class="se">%s</span></h2>' % (i, esc(t), esc(se)), '    <p>%s</p>%s' % (esc(nb(tx)), sw), '  </div>',
              '  <div class="gal" tabindex="0" role="region" aria-label="Galerie">%s\n  </div>' % g, '</section>']
    m += ['</div>', '',
          '<section class="cqd" aria-labelledby="cqd" style="padding-top:0"><div class="w"><h2 class="d" id="cqd" data-r>Les supports <span class="se">présentés</span></h2></div>',
          '  <div class="cqd-w" tabindex="0" role="region" aria-label="Livrables"><div class="mq" style="--ar:3/4">%s</div></div></section>' % ''.join(
              '<figure><img src="img/%s.webp" alt="%s" loading="lazy" decoding="async"><figcaption><b>%s</b><span>%s</span></figcaption></figure>' % (n, esc(t), esc(t), esc(l)) for n, t, l in c['liv']),
          '', '<section class="end w" aria-labelledby="fin">', '  <h2 class="d" id="fin" data-r>%s ? <span class="se">%s</span></h2>' % (esc(c['fin'][0]), esc(c['fin'][1])),
          '  <div class="bts" data-r>', '    <a class="bt bt-a" href="/#devis">Demander un devis<span class="o">%s</span></a>' % AR,
          '    <a class="bt bt-g" href="/#cal">Réserver un appel<span class="o">%s</span></a>' % AR, '  </div>', '</section>']
    h = h.replace('</head>', theme(c['slug']) + '</head>', 1)
    out = h + '\n'.join(m) + '\n' + TAIL
    if re.search('[–—]', re.sub(r'<(script|style)[^>]*>.*?</\1>', '', out, flags=re.S)): raise SystemExit('tiret long dans ' + c['slug'])
    p = os.path.join(R, 'projets', c['slug'], 'index.html'); open(p, 'w', encoding='utf8').write(out)
    return p

if __name__ == '__main__':
    import subprocess
    ps = [page(c) for c in C]
    subprocess.run([sys.executable, os.path.join(R, '_src', 'securite.py')] + ps, check=True)
    print('\n'.join(ps))
