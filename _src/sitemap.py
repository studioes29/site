"""Sitemap de studioes.fr, refait à chaque construction : toutes les pages indexables (ni noindex, ni redirection),
date de dernière modification tirée de git (aujourd'hui pour un fichier modifié et pas encore enregistré), images de chaque page.
Usage : python3 _src/sitemap.py"""
import os, re, glob, subprocess, datetime, html
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUJ = datetime.date.today().isoformat()
modifies = set(subprocess.run(['git', 'status', '--porcelain'], cwd=R, capture_output=True, text=True).stdout.split())
def date(f):
    rel = os.path.relpath(f, R)
    if any(rel == m or rel.startswith(m.rstrip('/') + '/') for m in modifies): return AUJ
    d = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', rel], cwd=R, capture_output=True, text=True).stdout.strip()
    return d or AUJ
pages = []
for f in sorted(glob.glob(os.path.join(R, '**/index.html'), recursive=True)):
    rel = os.path.relpath(f, R)
    if rel.startswith(('_src', '.git', 'apercu/voir', 'desinscription')): continue
    h = open(f, encoding='utf8').read()
    if 'http-equiv="refresh"' in h or re.search(r'<meta name="robots" content="[^"]*noindex', h): continue
    url = 'https://studioes.fr/' + (os.path.dirname(rel) + '/' if os.path.dirname(rel) else '')
    imgs = []
    og = re.search(r'<meta property="og:image" content="([^"]+)"', h)
    if og: imgs.append(og.group(1))
    if 'data-rp=' in h:  # page d'un reportage ou d'une galerie : toutes les photos, en grand
        imgs += ['https://studioes.fr' + x for x in re.findall(r'<a (?:class="une" )?href="(/p/[^"]+\.jpg)" data-i=', h)]
    else:
        for m in re.findall(r'<img [^>]*src="([^"]+)"', h)[:12]:
            if m.startswith(('data:', 'http')) or m.endswith('.svg'): continue
            u = m if m.startswith('/') else '/' + os.path.dirname(rel) + '/' + m
            imgs.append('https://studioes.fr' + u)
    vus = []
    for i in imgs:
        if i not in vus: vus.append(i)
    pages.append((url, date(f), vus))
pages.sort(key=lambda p: (p[0].count('/'), p[0]))
x = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">']
for u, d, im in pages:
    x.append('  <url><loc>%s</loc><lastmod>%s</lastmod>' % (u, d) + ''.join('\n    <image:image><image:loc>%s</image:loc></image:image>' % html.escape(i) for i in im) + '\n  </url>')
x.append('</urlset>\n')
open(os.path.join(R, 'sitemap.xml'), 'w', encoding='utf8').write('\n'.join(x))
print(len(pages), 'pages,', sum(len(p[2]) for p in pages), 'images')
