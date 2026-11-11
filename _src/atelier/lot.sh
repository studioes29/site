#!/bin/bash
# Lot de rendus de la bannière (reprise possible : tout rendu déjà présent est sauté)
cd /tmp/rd; mkdir -p fin fl; PY=/tmp/bl/bin/python
log(){ echo "$(date +%H:%M) $*" >> fin/log.txt; }
run(){ # moment lampe largeur échantillons mode nom [variables]
  local out=fin/$6.png; [ -f $out ] && return
  env $7 $8 $9 $PY scene2.py -- $1 $2 $3 $4 $5 fin/_tmp_$6.png 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/$6 /" >> fin/log.txt
  [ -f fin/_tmp_$6.png ] && mv fin/_tmp_$6.png $out && log "fait $6"
}
ETAPE=${1:-tout}
if [ $ETAPE = a ] || [ $ETAPE = tout ]; then
  [ -f fin/mask.png ] || rm -f meta.json
  run jour 0 2240 4 mask mask
  run jour 0 2240 4 depth depth
  run nuit 0 2240 44 beauty nuit-n NEON_ON=0
  run nuit 0 2240 44 beauty nuit-0
  run nuit 1 2240 44 beauty nuit-1
  run jour 0 2240 44 beauty jour-0
  log "FIN A"
fi
if [ $ETAPE = b ] || [ $ETAPE = tout ]; then
  [ -f fin/p-mask.png ] || rm -f meta-p.json
  run jour 0 2400 4 mask p-mask PORTRAIT=1
  run jour 0 2400 4 depth p-depth PORTRAIT=1
  run nuit 0 2400 36 beauty p-nuit-n PORTRAIT=1 NEON_ON=0
  run nuit 1 2400 36 beauty p-nuit-1 PORTRAIT=1
  run jour 0 2400 36 beauty p-jour-0 PORTRAIT=1
  log "FIN B"
fi
if [ $ETAPE = c ] || [ $ETAPE = tout ]; then
  run soir 0 2240 44 beauty soir-n NEON_ON=0
  run soir 0 2240 44 beauty soir-0
  run soir 1 2240 44 beauty soir-1
  run matin 0 2240 44 beauty matin-0
  run soir 0 2400 36 beauty p-soir-n PORTRAIT=1 NEON_ON=0
  run soir 1 2400 36 beauty p-soir-1 PORTRAIT=1
  run matin 0 2400 36 beauty p-matin-0 PORTRAIT=1
  for m in "nuit 1" "jour 0" "soir 1" "matin 0"; do set -- $m; run $1 $2 1600 32 beauty c-photo-$1 CLOSE=photo; done
  log "FIN C"
fi
