"""Politique de sécurité du contenu et politique de référent pour les pages de studioes.fr (GitHub Pages ne permet pas d'en-têtes HTTP).
Chaque script en ligne est autorisé par son empreinte : un script injecté ne peut pas s'exécuter.
Usage : python3 _src/securite.py [dossier ou fichiers...] (par défaut : tout le site). À relancer après toute modification d'une page écrite à la main
ou de conditions/index.html ; build.py le lance lui-même sur les pages qu'il génère."""
import sys, os, re, glob, hashlib, base64
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = ("default-src 'self'; script-src 'self' https://gc.zgo.at https://app.cal.com{h}; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https://studioes.goatcounter.com; font-src 'self'; "
        "connect-src 'self' https://formsubmit.co https://studioes.goatcounter.com https://app.cal.com https://cal.com; "
        "frame-src https://app.cal.com https://cal.com; "
        "form-action 'self' https://formsubmit.co; base-uri 'self'; object-src 'none'; upgrade-insecure-requests")
REF = '<meta name="referrer" content="strict-origin-when-cross-origin">'
def pages(args):
    for a in args or [RACINE]:
        if os.path.isdir(a):
            for f in glob.glob(os.path.join(a, '**/*.html'), recursive=True):
                if '/_src/' not in f and '/.git/' not in f and not f.endswith('page.tpl.html'): yield f
        else: yield a
n = 0
for f in pages(sys.argv[1:]):
    h = open(f, encoding='utf8').read()
    h = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>', '', h)
    h = h.replace(REF, '')
    hs = ''.join(" 'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode('utf8')).digest()).decode() for s in re.findall(r'<script>(.*?)</script>', h, re.S))
    meta = '<meta http-equiv="Content-Security-Policy" content="%s">%s' % (BASE.format(h=hs), REF)
    if '<meta charset="utf-8">' not in h: print('pas de meta charset :', f); continue
    h = h.replace('<meta charset="utf-8">', '<meta charset="utf-8">' + meta, 1)
    open(f, 'w', encoding='utf8').write(h); n += 1
print('CSP et referrer posés sur %d pages' % n)
