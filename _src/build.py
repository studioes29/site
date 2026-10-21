"""Génère l'accueil et les pages métier de studioes.fr à partir de tpl.html.
Usage : python3 build.py <PREFIXE_ASSETS> <DOSSIER_SORTIE> <robots>"""
import re, sys, os, json
P, OUT, ROBOTS = sys.argv[1], sys.argv[2], sys.argv[3]
T = open(os.path.join(os.path.dirname(__file__), 'tpl.html'), encoding='utf8').read().replace('{P}', P)
def sect(id):
    m = re.search(r'<section class="sec[^"]*" id="%s"[^>]*>.*?\n</section>' % id, T, re.S); return m.group(0)
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
        for a, b in [('href="#photographie"', 'href="/metiers/photographie/"'), ('href="#web"', 'href="/metiers/sites-et-outils/"'), ('href="#applications"', 'href="/metiers/sites-et-outils/#applications"'),
                     ('href="#travaux"', 'href="/metiers/photographie/#travaux"'), ('href="#realisations"', 'href="/metiers/sites-et-outils/#realisations"'),
                     ('href="#haut"', 'href="/"'), ('<a class="evite" href="/metiers/photographie/">', '<a class="evite" href="#h1">')]:
            h = h.replace(a, b)
        h = re.sub(r'<script type="application/ld\+json">.*?</script>', '<script type="application/ld+json">' + ld + '</script>' if ld else '', h, count=1, flags=re.S)
    d = os.path.join(OUT, path); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(h)

home = T[HEAD_END + len('<main id="haut">\n'):FOOT]
page('', 'Studio ES · Photographe et sites internet en Bretagne', 'Studio photo et web dans le Finistère : reportages d’événement et de mariage, sites internet et applications pour entreprises, collectivités et associations.', 'https://studioes.fr/', home, True)

contact = sect('contact')
def nettoie(s):  # la section reprend sans son titre ni son chapeau, déjà portés par l'en-tête de page
    s = re.sub(r'<div class="sec-t rv">.*?</div>\s*', '', s, count=1, flags=re.S)
    s = re.sub(r'(<div class="sous rv"[^>]*>)<h3 class="d">(.*?)</h3>', r'\1<h2 class="d">\2</h2>', s)
    return s.replace('class="sec"', 'class="sec" style="padding-top:clamp(36px,4vw,56px)"', 1).replace('class="sec dk"', 'class="sec dk" style="padding-top:clamp(44px,5vw,72px)"', 1)
PT = open(os.path.join(os.path.dirname(__file__), 'portes.html'), encoding='utf8').read().replace('{P}', P)
porteW = re.search(r'<a class="porte wb".*?</a>', PT, re.S).group(0)
porteP = re.search(r'<a class="porte ph".*?</a>', PT, re.S).group(0)
def croise(porte, titre, texte, lien, lib):
    return ('<section class="sec feuille cr-f" style="padding-top:clamp(64px,7vw,100px)" aria-label="Et aussi"><div class="w croise"><div class="portes">%s'
            '<div class="cr-tx rv"><h2 class="d">%s</h2><p>%s</p><a class="bt" href="%s">%s <span class="ar"><svg class="i"><use href="#ar"/></svg></span></a></div></div></div></section>') % (porte, titre, texte, lien, lib)

ph = '''<section class="mh" aria-labelledby="h1"><div class="w">
  <p class="fil"><a href="/">Studio ES</a><span>/</span><span>Photographie</span></p>
  <h1 class="d" id="h1">Photographie<span class="it">Vos moments forts, sur le vif.</span></h1>
  <p class="lead">Mariages, concerts, festivals, inaugurations, cérémonies, vie d’une entreprise : un reportage discret en Bretagne, sans poses ni mise en scène, puis une sélection resserrée et retouchée, prête à servir.</p>
</div></section>
%s
%s
%s''' % (nettoie(sect('photographie')).replace('<div class="grp"', '<h2 class="sr">Les formules photo</h2>\n    <div class="grp"', 1), croise(porteW.replace('href="#web"', 'href="/metiers/sites-et-outils/"'), 'Le studio fait aussi<span class="it">des sites et des applications.</span>', 'Un site clair et bien référencé, ou une application qui fait gagner du temps. Et quand il faut de belles photos pour l’habiller, elles sont déjà là.', '/metiers/sites-et-outils/', 'Voir le web'), contact)
def LD(nom, url, service, offres):
    return json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "Service", "name": service, "url": url, "provider": {"@id": "https://studioes.fr/#studio"}, "areaServed": {"@type": "AdministrativeArea", "name": "Bretagne"},
         "offers": [{"@type": "Offer", "name": n, "priceCurrency": "EUR", "price": str(p), "priceSpecification": {"@type": "PriceSpecification", "minPrice": p, "priceCurrency": "EUR"}} for n, p in offres]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"}, {"@type": "ListItem", "position": 2, "name": nom, "item": url}]}]}, ensure_ascii=False)
page('metiers/photographie', 'Photographe d’événement et de mariage en Bretagne · Studio ES', 'Reportage photo sur le vif dans le Finistère et en Bretagne : événement dès 250 €, mariage dès 1 290 €, suivi annuel pour entreprises et collectivités.', 'https://studioes.fr/metiers/photographie/', ph, og='og-photo.jpg', ld=LD('Photographie', 'https://studioes.fr/metiers/photographie/', 'Reportage photo d’événement et de mariage', [('Événement', 250), ('Suivi photo annuel', 1290), ('Mariage', 1290)]))

wb = '''<section class="mh" aria-labelledby="h1"><div class="w">
  <p class="fil"><a href="/">Studio ES</a><span>/</span><span>Web</span></p>
  <h1 class="d" id="h1">Web<span class="it">Sites et applications sur mesure.</span></h1>
  <p class="lead">Pour les TPE, commerces, artisans et collectivités de Bretagne : un site clair, rédigé et bien référencé localement, et des applications qui font gagner du temps au quotidien, en abonnement ou à l’achat.</p>
</div></section>
%s
%s
%s
%s''' % (nettoie(sect('web')), sect('applications'), croise(porteP.replace('href="#photographie"', 'href="/metiers/photographie/"'), 'Le studio fait aussi<span class="it">de la photographie.</span>', 'Mariages, concerts, festivals, vie d’une entreprise : un reportage discret, puis une sélection resserrée et retouchée.', '/metiers/photographie/', 'Voir la photographie'), contact)
page('metiers/sites-et-outils', 'Sites internet et applications en Bretagne · Studio ES', 'Sites internet pour TPE, associations et collectivités dès 990 €, applications sur mesure dès 190 € : devis, rendez-vous, inscriptions. Basé dans le Finistère.', 'https://studioes.fr/metiers/sites-et-outils/', wb, og='og-web.jpg', ld=LD('Web', 'https://studioes.fr/metiers/sites-et-outils/', 'Création de sites internet et d’applications web', [('Site Essentiel', 990), ('Site Vitrine', 1990), ('Site sur mesure', 4490), ('Application sur mesure', 190)]))
print('ok')
