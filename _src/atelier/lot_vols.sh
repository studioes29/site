#!/bin/bash
# Suite du lot A : travellings vers le mur de photos (nuit, jour), plans rapprochés photo, puis vues mobiles
cd /tmp/rd; PY=/tmp/bl/bin/python
while ! grep -q "FIN B" fin/log.txt 2>/dev/null; do sleep 20; done
vol(){ # zone moment lampe
  local d=fl/$1-$2; mkdir -p $d; local f0=1
  while [ $f0 -le 31 ] && [ -f $d/f$(printf %04d $f0).png ]; do f0=$((f0+1)); done
  [ $f0 -gt 31 ] && return
  FLIGHT=$1 F0=$f0 F1=31 $PY scene2.py -- $2 $3 800 10 beauty $d/f 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/vol $1 $2 /" >> fin/log.txt
  echo "$(date +%H:%M) fait vol $1 $2 ($(ls $d | wc -l) images)" >> fin/log.txt
}
close(){ # zone moment lampe
  [ -f fin/c-$1-$2.png ] && return
  CLOSE=$1 $PY scene2.py -- $2 $3 1600 32 beauty fin/_tmp_c-$1-$2.png 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/c-$1-$2 /" >> fin/log.txt
  [ -f fin/_tmp_c-$1-$2.png ] && mv fin/_tmp_c-$1-$2.png fin/c-$1-$2.png && echo "$(date +%H:%M) fait c-$1-$2" >> fin/log.txt
}
vol photo nuit 1; close photo nuit 1
vol photo jour 0; close photo jour 0
echo "$(date +%H:%M) FIN A2" >> fin/log.txt
./lot.sh c
