"""Vignettes carrées des cartes nuancier de la page Graphisme (p/n/<projet>.webp, 640 px)."""
import os, io, subprocess
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O = os.path.join(R, 'p', 'n'); os.makedirs(O, exist_ok=True)
def carre(src, nom, cx=.5, cy=.5, zoom=1.0):
    im = Image.open(os.path.join(R, src)).convert('RGB'); w, h = im.size; c = min(w, h) / zoom
    x = max(0, min(w - c, cx * w - c / 2)); y = max(0, min(h - c, cy * h - c / 2))
    im.crop((int(x), int(y), int(x + c), int(y + c))).resize((640, 640), Image.LANCZOS).save(os.path.join(O, nom + '.webp'), quality=84, method=6)
for s in ('christopher-poupon', 'maison-ble', 'laureen-boudigou', 'molan-move', 'elodie-viconte', 'creche-oceane'):
    carre('projets/%s/img/logo.webp' % s, s)
carre('projets/fl-auto/img/logo.webp', 'fl-auto')
carre('projets/pierceval-tattoo/img/id-logo.webp', 'pierceval-tattoo')
carre('projets/mam-our-et-merveilles/img/b3.webp', 'mam-our-et-merveilles')
carre('projets/la-soute/img/affiche.webp', 'la-soute', cy=.62)
carre('projets/mjc-la-marelle/img/p1.webp', 'mjc-la-marelle', cy=.3)
print('ok')
