"""Anciennes adresses de studioes.fr : une page de redirection immédiate vers la nouvelle adresse (GitHub Pages n'offre pas de 301).
Signal unique pour les moteurs : redirection, canonical vers la cible, pas de noindex (Google traite une redirection immédiate comme permanente).
Usage : python3 _src/redirections.py (puis python3 _src/securite.py sur les pages produites)."""
import os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIBLES = {
    'a-propos': '/#contact', 'about': '/#contact', 'contact': '/#contact', 'services': '/',
    'atrium': '/metiers/photographie/#reportages', 'photographie': '/metiers/photographie/', 'graphisme': '/metiers/graphisme/',
    'campagnes': '/metiers/graphisme/#campagnes', 'portfolio': '/realisations/', 'projects': '/realisations/', 'work': '/realisations/',
    'budget': '/projets/budget-participatif/', 'campagne-festin-dmouettes-2025': '/projets/festin-d-mouettes/', 'festin-dmouettes-2026': '/projets/festin-d-mouettes/',
    'la-soute-saison-culturelle-2627': '/projets/la-soute/', 'soute': '/projets/la-soute/', 'marelle': '/projets/mjc-la-marelle/',
    'recrutement': '/projets/campagnes-de-recrutement/', 'voeux': '/projets/voeux-2025/',
    'digue': '/inauguration/', 'square': '/inauguration/', 'forum': '/forum-asso/',
    'covering-camion-frigorifique': '/signaletique/', 'signaletique-aire-de-carenage': '/signaletique/', 'un-sac-qui-a-la-cote': '/editions/',
}
GABARIT = ('<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Studio ES</title><link rel="canonical" href="https://studioes.fr{c}">'
           '<meta http-equiv="refresh" content="0; url={u}"><script>location.replace("{u}")</script></head><body><a href="{u}">Studio ES</a></body></html>\n')
for d, u in CIBLES.items():
    f = os.path.join(R, d, 'index.html')
    os.makedirs(os.path.dirname(f), exist_ok=True)
    open(f, 'w', encoding='utf8').write(GABARIT.format(u=u, c=u.split('#')[0]))
print(len(CIBLES), 'redirections')
