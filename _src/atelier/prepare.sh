#!/bin/bash
# Reconstruit l'espace de travail /tmp/rd de l'atelier à partir du dépôt. À lancer depuis la racine du site.
# Les scripts de scène lisent leurs textures dans /tmp/rd et les photos du site dans /home/claude/site (variable SITE de s2_head.py).
set -e
SRC=_src/atelier; mkdir -p /tmp/rd/old /tmp/rd/hdri /tmp/rd/fin /tmp/rd/fl
[ -x /tmp/bl/bin/python ] || { uv venv -p 3.13 /tmp/bl; VIRTUAL_ENV=/tmp/bl uv pip install bpy==5.1.2 fonttools brotli pillow numpy scipy; }
cp $SRC/s2_head.py $SRC/s2_body.py $SRC/s2_tail.py $SRC/tex*.py $SRC/process.py $SRC/process_fl.py $SRC/flights.sh /tmp/rd/
/tmp/bl/bin/python -c "
from fontTools.ttLib import TTFont
for a,b in (('f/br.woff2','br.ttf'),('f/ur-i.woff2','ur.ttf')):
    f=TTFont(a); f.flavor=None; f.save('/tmp/rd/'+b)"
for f in rooitou_park_1k forest_slope_1k dikhololo_night_1k; do [ -f /tmp/rd/hdri/$f.hdr ] || curl -sSfL -o /tmp/rd/hdri/$f.hdr https://raw.githubusercontent.com/pmndrs/drei-assets/master/hdri/$f.hdr; done
# plante : modèle « Diffuse Transmission Plant » (Khronos glTF Sample Assets, CC BY 4.0), textures réduites à 1024 px
if [ ! -f /tmp/rd/old/DiffuseTransmissionPlant.glb ]; then
  mkdir -p /tmp/m3d/raw && (cd /tmp/m3d && npm i -s @gltf-transform/cli@4.1.1 >/dev/null 2>&1)
  curl -sSfL -o /tmp/m3d/raw/p.glb https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DiffuseTransmissionPlant/glTF-Binary/DiffuseTransmissionPlant.glb
  /tmp/m3d/node_modules/.bin/gltf-transform optimize /tmp/m3d/raw/p.glb /tmp/rd/old/DiffuseTransmissionPlant.glb --texture-compress webp --texture-size 1024 --compress false --simplify false
fi
/tmp/bl/bin/python /tmp/rd/tex.py; /tmp/bl/bin/python /tmp/rd/tex2.py; /tmp/bl/bin/python /tmp/rd/tex3.py; /tmp/bl/bin/python $SRC/tex4.py
python3 $SRC/ecrans.py
cd /tmp/rd && cat s2_head.py s2_body.py s2_tail.py > scene2.py && echo "scène prête : /tmp/rd/scene2.py"
