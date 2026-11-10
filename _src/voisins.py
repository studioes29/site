"""Études de cas : un bloc « Autres projets » (trois liens) en bas de chaque page, et la description dans les données structurées.
Les voisins partagent une discipline et tournent dans l'ordre des réalisations : chaque projet reçoit autant de liens qu'il en donne.
Exécuté par build.py (variables TR et taille) ; relancé à chaque construction, il remplace le bloc précédent."""
import html as _h
NOM_D = {'photo': 'Photographie', 'web': 'Web', 'graph': 'Graphisme'}
PROJ = [t for t in TR if t[1].startswith('/projets/')]
CSS_V = ('<style id="vois-css">.vois{padding-block:0 clamp(70px,9vw,130px)}.vois h2{margin:0 0 22px;text-align:center}'
         '.vois-g{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(10px,1.4vw,20px);max-width:1180px;margin:0 auto}'
         '.vois a{display:flex;flex-direction:column;gap:12px;color:inherit;text-decoration:none}'
         '.vois img{display:block;width:100%;aspect-ratio:10/7;object-fit:cover;border-radius:14px;transition:transform .8s var(--e,ease)}'
         '.vois b{font-family:var(--d);font-weight:800;font-size:clamp(18px,1.5vw,22px);letter-spacing:-.04em;line-height:1.05}'
         '.vois span span{display:block;margin-top:4px;font-size:14px;color:var(--mu)}'
         '@media (hover:hover){.vois a:hover img{transform:scale(1.025)}}'
         '@media (max-width:760px){.vois-g{grid-template-columns:1fr 1fr}.vois a:nth-child(3){display:none}}</style>')
def voisins(i):
    t = PROJ[i]; tags = set(t[3].split()); n = len(PROJ)
    out = [PROJ[(i + k) % n] for k in range(1, n) if tags & set(PROJ[(i + k) % n][3].split())]
    out += [PROJ[(i + k) % n] for k in range(1, n) if PROJ[(i + k) % n] not in out]
    return out[:3]
for i, t in enumerate(PROJ):
    f = os.path.join(RACINE, t[1].strip('/'), 'index.html')
    if not os.path.exists(f): continue
    h = open(f, encoding='utf8').read()
    h = re.sub(r'\n?<!--voisins-->.*?<!--/voisins-->', '', h, flags=re.S).replace(CSS_V, '')
    cartes = ''.join('<a href="%s"><img src="%s" alt="" loading="lazy" decoding="async" width="480" height="336"><span><b>%s</b><span>%s</span></span></a>' % (
        v[1], v[2].replace('cover-800.webp', 'cover-480.webp') if os.path.exists(os.path.join(RACINE, v[2].replace('cover-800.webp', 'cover-480.webp').lstrip('/'))) else v[2], v[0], v[4]) for v in voisins(i))
    bloc = '\n<!--voisins--><section class="vois w" aria-labelledby="vois-t"><h2 class="d" id="vois-t">Autres projets</h2><div class="vois-g">%s</div></section><!--/voisins-->' % cartes
    h = h.replace('</main>', bloc + '\n</main>', 1).replace('</head>', CSS_V + '</head>', 1)
    d = re.search(r'<meta name="description" content="([^"]*)"', h).group(1)
    def ld(m):
        o = json.loads(m.group(1))
        for x in o.get('@graph', []):
            if x.get('@type') == 'CreativeWork': x['description'] = _h.unescape(d)
        return '<script type="application/ld+json">%s</script>' % json.dumps(o, ensure_ascii=False)
    h = re.sub(r'<script type="application/ld\+json">(.*?)</script>', ld, h, count=1, flags=re.S)
    open(f, 'w', encoding='utf8').write(h)
print('voisins :', len(PROJ), 'études de cas')
