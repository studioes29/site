# Atelier : la scène 3D de la bannière d'accueil

La pièce de la bannière est une scène Blender entièrement écrite en Python (rendu Cycles). Ce dossier en est la source.
Elle a été reconstituée le 11 novembre 2026 à partir de l'historique de travail, puis vérifiée contre les rendus en ligne
(coins de l'écran identiques à la cinquième décimale, carte des zones identique à 99 %).

## Fichiers
- `s2_head.py`, `s2_body.py`, `s2_tail.py` : la scène, en trois parties à concaténer dans cet ordre (`scene2.py`).
  tête = outils et matières de base ; corps = la pièce et ses objets ; fin = lumière, caméra, modes de rendu.
- `tex.py`, `tex2.py`, `tex3.py`, `tex4.py`, `ecrans.py` : fabrication des textures (étiquettes, écrans, touches, tirages du mur).
- `process.py`, `process_fl.py` : conversion des rendus vers `js/atelier/r/` (images, carte des zones, profondeur, `l.json`, `p.json`, travellings).
- `flights.sh` : rendu des 20 travellings. `prepare.sh` : reconstruit l'espace de travail `/tmp/rd`.

## Rendre
    bash _src/atelier/prepare.sh
    cd /tmp/rd && /tmp/bl/bin/python scene2.py -- <moment> <lampe 0|1> <largeur> <échantillons> <beauty|mask|depth> <sortie.png>

Moments : `matin`, `jour`, `soir`, `nuit`. Variables d'environnement :
- `PORTRAIT=1` : vue mobile (de face, 16:10) ; `CLOSE=<zone>` : plan rapproché de face (`web`, `photo`, `graph`, `fill`, `contact`) ;
- `FLIGHT=<zone>` avec `F0`, `F1`, `NF` : travelling de la vue d'ensemble au plan rapproché ; `CATANIM=48` : boucle du chat ;
- `NOFUR=1` : chat sans fourrure, pour les essais rapides.

Réglages des rendus en ligne : vue d'ensemble 2240 px et 44 échantillons ; plans rapprochés 1600 px et 32 ; chat 2240 px et 40 ;
vue mobile 2400 px et 36 ; travellings 800 px, 10 échantillons, 32 images ; carte des zones et profondeur 4 échantillons.

Crédit : plante « Diffuse Transmission Plant » © 2024 Darmstadt Graphics Group GmbH, par Eric Chadwick, CC BY 4.0.
