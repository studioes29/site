import re, sys, os
P, OUT, ROBOTS = sys.argv[1], sys.argv[2], sys.argv[3]
T = open(os.path.join(os.path.dirname(__file__), 'tpl.html'), encoding='utf8').read().replace('{P}', P)
def sect(id):
    m = re.search(r'<section class="sec[^"]*" id="%s"[^>]*>.*?\n</section>' % id, T, re.S); return m.group(0)
HEAD_END = T.index('<main id="haut">'); FOOT = T.index('</main>')
def page(path, title, desc, canon, main, home=False):
    h = T[:HEAD_END] + '<main id="haut">\n' + main + '\n' + T[FOOT:]
    h = re.sub(r'<title>.*?</title>', '<title>%s</title>' % title, h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r'\g<1>' + desc, h)
    h = re.sub(r'(<link rel="canonical" href=")[^"]*', r'\g<1>' + canon, h)
    h = re.sub(r'(<meta property="og:url" content=")[^"]*', r'\g<1>' + canon, h)
    h = h.replace('<meta name="robots" content="noindex">', '<meta name="robots" content="%s">' % ROBOTS)
    if not home:
        for a, b in [('href="#photographie"', 'href="/metiers/photographie/"'), ('href="#web"', 'href="/metiers/sites-et-outils/"'), ('href="#travaux"', 'href="/#travaux"'), ('href="#haut"', 'href="/"')]:
            h = h.replace(a, b)
        h = re.sub(r'<script type="application/ld\+json">.*?</script>', '', h, flags=re.S)
    d = os.path.join(OUT, path); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(h)
home = T[HEAD_END + len('<main id="haut">\n'):FOOT]
page('', 'Studio ES · Photographie et web, Bretagne', 'Photographie de mariage et d’événement, sites internet et applications sur mesure pour les TPE et les collectivités. Basé en Bretagne.', 'https://studioes.fr/', home, True)
contact = sect('contact')
def nettoie(s):  # la section reprend sans son titre ni son chapeau, déjà portés par l'en-tête de page
    s = re.sub(r'<div class="sec-t rv">.*?</div>\s*', '', s, count=1, flags=re.S)
    s = re.sub(r'<p class="lead rv">.*?</p>\s*', '', s, count=1, flags=re.S)
    return s.replace('class="sec"', 'class="sec" style="padding-top:clamp(40px,5vw,70px)"', 1).replace('class="sec dk"', 'class="sec dk" style="padding-top:clamp(50px,6vw,90px)"', 1)
porteW = re.search(r'<a class="porte web.*?</a>', T, re.S).group(0)
porteP = re.search(r'<a class="porte grain rv".*?</a>', T, re.S).group(0)
ph = '''<section class="mh w" aria-labelledby="h1">
  <p class="fil"><a href="/">Studio ES</a><span>/</span><span>Photographie</span></p>
  <h1 class="d" id="h1">Photographie<span class="it">Mariages et événements, sur le vif.</span></h1>
  <p class="lead">Mariages, concerts, festivals, inaugurations, cérémonies, vie d’une entreprise : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.</p>
  %s
</section>
%s
<section class="sec" style="padding:0" aria-label="Et aussi"><div class="w croise">%s</div></section>
%s''' % (porteP.replace('<a class="porte', '<div class="porte').replace('href="#photographie" ', '').rsplit('</a>', 1)[0] + '</div>', nettoie(sect('photographie')), porteW.replace('href="#web"', 'href="/metiers/sites-et-outils/"').replace('<h2 class="d">Web', '<h2 class="d">Et le web').replace(' style="--i:1"', ''), contact)
page('metiers/photographie', 'Photographe de mariage et d’événement en Bretagne · Studio ES', 'Reportage photo sur le vif en Bretagne : mariage dès 1 290 €, événement dès 250 €, forfait à l’année pour les collectivités, entreprises et lieux culturels.', 'https://studioes.fr/metiers/photographie/', ph)
wb = '''<section class="mh w" aria-labelledby="h1">
  <p class="fil"><a href="/">Studio ES</a><span>/</span><span>Web</span></p>
  <h1 class="d" id="h1">Web<span class="it">Sites et applications sur mesure.</span></h1>
  <p class="lead">Pour les TPE, commerces, artisans et collectivités de Bretagne : un site clair, rédigé et bien référencé localement, et des applications qui font gagner du temps au quotidien, en abonnement ou à l’achat.</p>
  %s
</section>
%s
<section class="sec" style="padding-bottom:0" aria-label="Et aussi"><div class="w croise">%s</div></section>
%s''' % (porteW.replace('<a class="porte', '<div class="porte').replace('href="#web" ', '').replace(' style="--i:1"', '').rsplit('</a>', 1)[0] + '</div>', nettoie(sect('web')), porteP.replace('href="#photographie"', 'href="/metiers/photographie/"').replace('<h2 class="d">Photographie', '<h2 class="d">Et la photo'), contact)
page('metiers/sites-et-outils', 'Création de sites internet et d’applications sur mesure en Bretagne · Studio ES', 'Sites internet pour TPE, commerces et collectivités dès 990 €, applications sur mesure (devis en ligne, réservation, espace client) en abonnement ou à l’achat. Basé en Bretagne.', 'https://studioes.fr/metiers/sites-et-outils/', wb)
print('ok')
