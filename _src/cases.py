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
SIG = {'sig-1': ('creche-sig-1', (140, 0, 880, 1100)), 'sig-4': ('creche-sig-4', None), 'sig-6': ('creche-sig-6', None)}
BR = json.load(open(os.path.join(SRC, 'brands.json')))

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
        if i == 2:
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
    out = h + '\n'.join(m) + '\n' + TAIL
    if re.search('[–—]', re.sub(r'<(script|style)[^>]*>.*?</\1>', '', out, flags=re.S)): raise SystemExit('tiret long dans ' + c['slug'])
    p = os.path.join(R, 'projets', c['slug'], 'index.html'); open(p, 'w', encoding='utf8').write(out)
    return p

if __name__ == '__main__':
    import subprocess
    ps = [page(c) for c in C]
    subprocess.run([sys.executable, os.path.join(R, '_src', 'securite.py')] + ps, check=True)
    print('\n'.join(ps))
