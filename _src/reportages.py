# Une page par reportage photo et par galerie de graphisme, à l'adresse /<id>/ (exécuté par build.py après metiers.py, avec ses variables).
# Les cartes du site gardent la visionneuse : un clic ouvre la galerie par-dessus la page ; l'adresse sert aux moteurs, aux assistants et au partage.
import html as _h
_s = open(os.path.join(RACINE, 'reps.js'), encoding='utf8').read()
REPS = json.loads(_s[_s.index('['):_s.index('];') + 1])
GALS = [{'id': i, 't': t, 'k': k, 'ph': L} for i, t, k, L in GRAPH]

# festivals et éditions déjà publiés sur le site (légendes de l'accueil)
FEST = {'matmatah': 'Les Petites Folies 2026', 'fatal-bazooka': 'Les Petites Folies 2026', 'philippe-katerine': 'Les Petites Folies 2025',
        'franglish': 'Festidreuz 2026', 'helena': 'Festidreuz 2026', 'genezio': 'No Skip 2026', 'la-fouine': 'No Skip 2026',
        'rimk': 'Le Chant de l’Eucalyptus 2026', 'atipycs': 'Le Chant de l’Eucalyptus 2026', 'mentissa': 'Le Chant de l’Eucalyptus 2026'}
PAGE_FEST = {'Les Petites Folies': 'pub-petites-folies', 'Festidreuz': 'pub-festidreuz', 'Le Chant de l’Eucalyptus': 'pub-eucalyptus'}
CORP = {
    'inauguration': ('Inauguration', 'Reportage photo d’une inauguration : les prises de parole, les invités et les lieux, sur le vif.'),
    'voeux-ph': ('Cérémonie des vœux', 'Reportage photo d’une cérémonie des vœux : les prises de parole, le public et les échanges, sur le vif.'),
    'forum-asso': ('Forum des associations', 'Reportage photo d’un forum des associations : les stands, les bénévoles et les visiteurs, sur le vif.'),
    'commemo': ('Cérémonie commémorative', 'Reportage photo d’une cérémonie commémorative : ses temps forts et ses participants, avec la discrétion qu’elle demande.'),
    'fl-auto-photo': ('FL Auto, l’atelier', 'Reportage photo dans un garage : l’équipe, les gestes de métier et l’atelier, pour l’identité et la communication de l’entreprise.'),
}
GTXT = {
    'identites': ('Logotypes, univers et déclinaisons : une sélection d’identités visuelles conçues par Studio ES. Chaque identité a son étude de cas, du signe aux supports.', 'identite'),
    'signaletique': ('Panneaux, plaques, totems et vitrophanie : une sélection de signalétique conçue par Studio ES, de la maquette aux fichiers prêts pour le fabricant.', 'identite'),
    'affiches': ('Expositions, spectacles et événements : une sélection d’affiches conçues par Studio ES, déclinées ensuite sur les réseaux, l’affichage et la presse.', 'campagne'),
    'editions': ('Brochures, programmes, magazines et livrets : une sélection d’éditions conçues par Studio ES, jusqu’aux fichiers prêts pour l’imprimeur.', 'edition'),
}
KLAB = {'scene': 'Concert', 'public': 'Festival', 'corp': 'Événementiel et institutions', 'ident': 'Identités visuelles', 'camp': 'Campagnes', 'edit': 'Éditions'}

def de(t):
    if t.startswith('Les '): return 'des ' + t[4:]
    if t.startswith('Le '): return 'du ' + t[3:]
    return ('d’' if t[0] in 'AEIOUÉHaeiouh' else 'de ') + t

def nom(r): return CORP[r['id']][0] if r['id'] in CORP else r['t']
def lien_fest(f):
    n = f.rsplit(' ', 1)[0]
    return '<a href="/%s/">%s</a> %s' % (PAGE_FEST[n], n, f.rsplit(' ', 1)[1]) if n in PAGE_FEST else f

def textes(r, gal):
    """Titre, sous-titre, chapô (HTML), description, légende des photos."""
    i, t, n = r['id'], r['t'], len(r['ph'])
    if gal:
        lead, _ = GTXT[i]
        desc_t = re.sub('<[^>]+>', '', lead)
        if i == 'identites':
            lead += ' Études de cas : %s.' % ', '.join('<a href="%s">%s</a>' % (x[1], x[0]) for x in IDS if not x[1].startswith('#'))
        return (t, 'Galerie de design graphique', lead, desc_t, t)
    if r['k'] == 'scene':
        f = FEST.get(i)
        sous = 'Reportage photo de concert' + (', ' + f if f else '')
        lead = 'Le concert %s, photographié sur le vif%s : la scène, les lumières et le public, sans poses ni mise en scène.' % (de(t), ' au festival ' + lien_fest(f) if f else '')
        desc = 'Photos du concert %s%s par Studio ES : %d images prises sur le vif. Photographe de concert et de festival en Bretagne.' % (de(t), ' (' + f + ')' if f else '', n)
        return (t, sous, lead, desc, t + ' en concert' + (', ' + f if f else ''))
    if r['k'] == 'public':
        liste = [x for x in REPS if FEST.get(x['id'], '').startswith(t)]
        lead = 'Reportage photo du festival %s : les concerts, le public, les bénévoles et l’ambiance du site, sur le vif.' % t
        if liste: lead += ' Concerts photographiés sur place : %s.' % ', '.join('<a href="/%s/">%s</a> (%s)' % (x['id'], x['t'], FEST[x['id']].rsplit(' ', 1)[1]) for x in liste)
        desc = 'Photos du festival %s par Studio ES : concerts, public, bénévoles et ambiance, %d images sur le vif. Photographe de festival en Bretagne.' % (t, n)
        return (t, 'Reportage photo de festival', lead, desc, 'Festival ' + t)
    titre, lead = CORP[i]
    if i == 'fl-auto-photo': lead += ' L’identité visuelle et la signalétique du garage sont présentées dans <a href="/projets/fl-auto/">l’étude de cas FL Auto</a>.'
    desc = re.sub('<[^>]+>', '', lead).split(' : ')[0] + ' par Studio ES : %d photos prises sur le vif, sans poses ni mise en scène. Photographe en Bretagne.' % n
    return (titre, 'Reportage photo', lead, desc, titre)

SUITE = {
    'scene': 'Studio ES photographie concerts et festivals : une présence discrète près de la scène, puis une sélection resserrée et retouchée, prête à servir pour la communication de l’artiste ou de l’organisateur.',
    'public': 'Pour un festival, le reportage couvre la scène comme les à-côtés : arrivée du public, bénévoles, installations. La sélection livrée sert aux réseaux, au bilan et à l’annonce de l’édition suivante.',
    'corp': 'Pour une collectivité, une institution ou une entreprise : un reportage discret, sans poses ni mise en scène, puis une sélection retouchée, prête pour le site, les réseaux, le magazine et la presse.',
}
RAT_P = {}
def ratio(p):
    if p not in RAT_P:
        try: w, h = Image.open(os.path.join(RACINE, 'p/%s.jpg' % p)).size
        except Exception: w, h = 3, 4
        RAT_P[p] = (w, h)
    return RAT_P[p]

def carte(x):
    return ('<a class="rc" href="/%s/"><span class="im"><img src="/p/t/%s.webp" alt="" loading="lazy" decoding="async" width="640" height="800"></span>'
            '<span class="lab"><b>%s</b><span>%s</span><small>%d photos</small></span></a>') % (x['id'], x['ph'][0], nom(x), KLAB.get(x['k'], ''), len(x['ph']))

RP_PAGES = []
def rp_page(r, gal):
    i, n = r['id'], len(r['ph'])
    titre, sous, lead, desc, leg = textes(r, gal)
    url = 'https://studioes.fr/%s/' % i
    rub, rub_url = ('Design graphique', '/metiers/graphisme/') if gal else ('Photographie', '/metiers/photographie/')
    k = r['k']
    tous = GALS if gal else REPS
    pos = tous.index(r); tour = tous[pos + 1:] + tous[:pos]  # rotation : chaque page reçoit autant de liens qu'elle en donne
    autres = [x for x in tour if x['k'] == k] + [x for x in tour if x['k'] != k]
    if not gal and k == 'scene' and FEST.get(i):  # d'abord les concerts du même festival
        f0 = FEST[i].rsplit(' ', 1)[0]
        autres = sorted(autres, key=lambda x: (not FEST.get(x['id'], '').startswith(f0), x['k'] != k))
    autres = autres[:6]
    gk = {'ident': 'identite', 'camp': 'campagne', 'edit': 'edition'}.get(k, 'evenement')
    act = ('<div class="mh-ac"><button type="button" class="bt" data-est data-k="%s">%s %s</button><a class="bt ct" href="%s">%s</a></div>'
           % (gk, 'Parler de mon projet' if gal else 'Demander un devis', AR, rub_url + ('#identites' if gal else '#reportages'), 'Le design graphique' if gal else 'Tous les reportages'))
    tete = ('<section class="mh u-noir mh-rp" data-dark aria-labelledby="h1">%s<div class="w mh-g">\n  <div class="mh-t"><p class="fil"><a href="/">Studio ES</a><span>/</span><a href="%s">%s</a><span>/</span><span>%s</span></p>\n'
            '  <h1 class="d" id="h1">%s<span class="it">%s.</span></h1>\n  <p class="lead">%s</p>%s%s</div>\n</div></section>') % (
        FG(KLAB.get(k, 'Reportage'), 'right:-2vw;bottom:-.3em;font-size:calc(var(--fg-t) * .72)'), rub_url, rub, titre, titre, sous, lead,
        '' if gal else '<p class="rp-s">%s</p>' % SUITE[k], act)
    ph = []
    for j, p in enumerate(r['ph']):
        w, h = ratio(p)
        alt = _h.escape('%s, photo %d sur %d' % (leg, j + 1, n), quote=True)
        if j == 0:
            ph.append('<a class="une" href="/p/%s.jpg" data-i="0"><img src="/p/%s.jpg" alt="%s" width="%d" height="%d" fetchpriority="high" decoding="async"></a>' % (p, p, alt, w, h))
        else:
            ph.append('<a href="/p/%s.jpg" data-i="%d"><img src="/p/t/%s.webp" alt="%s" width="640" height="%d" loading="lazy" decoding="async"></a>' % (p, j, p, alt, round(640 * h / w)))
    corps = ('''
<section class="sec feuille dk u-noir rp-f" data-dark id="photos" aria-label="%s">
  <div class="w">
    <div class="gp-g rp-g" data-rp="%s">%s</div>
    <div class="gp-f"><p class="d">%s</p><button type="button" class="bt" data-est data-k="%s">%s %s</button></div>
  </div>
</section>
<section class="sec feuille u-papier rp-a" aria-labelledby="t-au">
  <div class="w">
    <div class="sous rv"><h2 class="d" id="t-au">%s</h2></div>
    <div class="rp-sim">%s</div>
  </div>
</section>
''' % ('Photos' if not gal else 'Réalisations', i, ''.join(ph), 'Un projet graphique ?' if gal else 'Un événement à photographier ?', gk,
       'Parler de mon projet' if gal else 'Demander mon devis', AR, 'Autres galeries' if gal else 'Autres reportages', ''.join(carte(x) for x in autres)))
    corps += contact_m('Identité, campagne ou édition : décrivez le projet, le devis suit.' if gal else 'Concert, festival, événement ou entreprise : quelques choix, une estimation immédiate.', 'Design graphique' if gal else 'Photographie')
    imgs = []
    for j, p in enumerate(r['ph']):
        w, h = ratio(p)
        imgs.append({"@type": "ImageObject", "contentUrl": "https://studioes.fr/p/%s.jpg" % p, "thumbnailUrl": "https://studioes.fr/p/t/%s.webp" % p,
                     "width": w, "height": h, "name": "%s, photo %d sur %d" % (leg, j + 1, n), "creator": {"@id": "https://studioes.fr/#studio"},
                     "creditText": "Studio ES", "copyrightNotice": "© Studio ES"})
    ld = json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "ImageGallery", "@id": url + "#galerie", "url": url, "name": "%s · %s" % (titre, sous), "description": desc, "inLanguage": "fr",
         "isPartOf": {"@id": "https://studioes.fr/#site"}, "author": {"@id": "https://studioes.fr/#studio"}, "image": imgs},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Studio ES", "item": "https://studioes.fr/"},
            {"@type": "ListItem", "position": 2, "name": rub, "item": "https://studioes.fr" + rub_url},
            {"@type": "ListItem", "position": 3, "name": titre, "item": url}]}]}, ensure_ascii=False)
    if gal: ttl = '%s : galerie de design graphique · Studio ES' % titre
    elif k == 'scene': ttl = '%s en concert : reportage photo · Studio ES' % titre
    elif k == 'public': ttl = '%s : photos du festival · Studio ES' % titre
    else: ttl = '%s : reportage photo · Studio ES' % titre
    page(i, _h.escape(ttl, quote=False), _h.escape(desc, quote=True), url, tete + corps, ld=ld, og='p/%s.jpg' % r['ph'][0])
    RP_PAGES.append((i, r))

for r in REPS: rp_page(r, False)
for r in GALS: rp_page(r, True)
