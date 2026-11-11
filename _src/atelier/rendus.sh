#!/bin/bash
# Rendus définitifs de la bannière, par ordre de priorité. Reprise possible : tout fichier déjà présent est sauté.
# Définition : 2880 px (ordinateur), 3200 px (mobile), 1920 px (plans rapprochés), 800 px (travellings).
cd /tmp/rd; mkdir -p fin2 fl2; PY=/tmp/bl/bin/python; J=fin2/log.txt
log(){ echo "$(date +%H:%M) $*" >> $J; }
run(){ # nom moment lampe largeur échantillons mode [variables...]
  local n=$1 m=$2 l=$3 w=$4 s=$5 mode=$6; shift 6; local out=fin2/$n.png; [ -f $out ] && return
  env SEUIL=.015 "$@" $PY scene2.py -- $m $l $w $s $mode fin2/_tmp_$n.png 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/$n /" >> $J
  [ -f fin2/_tmp_$n.png ] && mv fin2/_tmp_$n.png $out && log "fait $n"
}
vol(){ # zone moment lampe f0 f1
  local d=fl2/$1-$2; mkdir -p $d; local f0=$4
  while [ $f0 -le $5 ] && [ -f $d/f$(printf %04d $f0).png ]; do f0=$((f0+1)); done
  [ $f0 -gt $5 ] && return
  FLIGHT=$1 F0=$f0 F1=$5 $PY scene2.py -- $2 $3 800 10 beauty $d/f 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/vol $1 $2 /" >> $J
  log "fait vol $1 $2 $4-$5 ($(ls $d | wc -l) images)"
}
E=${1:-tout}
if [ $E = a ] || [ $E = tout ]; then   # vue d'ensemble, ordinateur
  [ -f fin2/mask.png ] || rm -f meta.json
  run jour-0 jour 0 2880 48 beauty
  run mask jour 0 2880 4 mask; run depth jour 0 2880 4 depth
  run nuit-1 nuit 1 2880 64 beauty
  log "ETAPE A1"
  run nuit-0 nuit 0 2880 64 beauty; run nuit-n nuit 0 2880 64 beauty NEON_ON=0
  run soir-1 soir 1 2880 64 beauty; run soir-0 soir 0 2880 64 beauty; run soir-n soir 0 2880 64 beauty NEON_ON=0
  run matin-0 matin 0 2880 48 beauty
  log "FIN A"
fi
if [ $E = b ] || [ $E = tout ]; then   # vue mobile
  [ -f fin2/p-mask.png ] || rm -f meta-p.json
  run p-jour-0 jour 0 3200 48 beauty PORTRAIT=1
  run p-mask jour 0 3200 4 mask PORTRAIT=1; run p-depth jour 0 3200 4 depth PORTRAIT=1
  run p-nuit-1 nuit 1 3200 64 beauty PORTRAIT=1; run p-nuit-n nuit 0 3200 64 beauty PORTRAIT=1 NEON_ON=0
  run p-soir-1 soir 1 3200 64 beauty PORTRAIT=1; run p-soir-n soir 0 3200 64 beauty PORTRAIT=1 NEON_ON=0
  run p-matin-0 matin 0 3200 48 beauty PORTRAIT=1
  log "FIN B"
fi
if [ $E = c ] || [ $E = tout ]; then   # travellings où l'enseigne ou la plante sont à l'image
  for m in "nuit 1" "jour 0" "soir 1" "matin 0"; do set -- $m
    vol web $1 $2 1 31; vol photo $1 $2 1 31; vol graph $1 $2 1 14; vol fill $1 $2 1 13; vol contact $1 $2 1 8; vol contact $1 $2 21 28
  done
  log "FIN C"
fi
if [ $E = d ] || [ $E = tout ]; then   # plans rapprochés
  for z in photo web graph fill contact; do for m in "nuit 1" "jour 0" "soir 1" "matin 0"; do set -- $m
    run c-$z-$1 $1 $2 1920 36 beauty CLOSE=$z
  done; done
  log "FIN D"
fi
