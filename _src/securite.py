"""Politique de sécurité du contenu pour toutes les pages de studioes.fr (GitHub Pages ne permet pas d'en-têtes HTTP).
Chaque script en ligne est autorisé par son empreinte : un script injecté ne peut pas s'exécuter.
Usage : python3 _src/securite.py <racine du site>. À relancer après toute modification d'une page."""
import sys, os, re, glob, hashlib, base64
R = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = ("default-src 'self'; script-src 'self' https://gc.zgo.at https://app.cal.eu{h}; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https://studioes.goatcounter.com; font-src 'self'; "
        "connect-src 'self' https://formsubmit.co https://studioes.goatcounter.com https://app.cal.eu https://cal.eu; "
        "frame-src https://cal.eu https://app.cal.eu https://cal.com https://app.cal.com; "
        "form-action 'self' https://formsubmit.co; base-uri 'self'; object-src 'none'; upgrade-insecure-requests")
n = 0
for f in glob.glob(os.path.join(R, '**/*.html'), recursive=True):
    if '/_src/' in f or '/.git/' in f: continue
    h = open(f, encoding='utf8').read()
    scripts = re.findall(r'<script>(.*?)</script>', h, re.S)
    hs = ''.join(" 'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode('utf8')).digest()).decode() for s in scripts)
    meta = '<meta http-equiv="Content-Security-Policy" content="%s"><meta name="referrer" content="strict-origin-when-cross-origin">' % BASE.format(h=hs)
    h = re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>(<meta name="referrer"[^>]*>)?', '', h)
    h = re.sub(r'(<meta charset="utf-8">)', r'\1' + meta.replace('\\', '\\\\'), h, count=1, flags=re.I)
    if 'Content-Security-Policy' not in h: print('pas de meta charset :', f); continue
    open(f, 'w', encoding='utf8').write(h); n += 1
print('CSP posée sur %d pages' % n)
