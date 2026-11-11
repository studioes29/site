cd /tmp/rd
for m in "jour 0" "soir 1" "nuit 1" "matin 0"; do set -- $m
 for z in web photo graph fill contact; do
  d=fl/$z-$1; mkdir -p $d; f0=1
  while [ $f0 -le 31 ] && [ -f $d/f$(printf %04d $f0).png ]; do f0=$((f0+1)); done
  [ $f0 -gt 31 ] && continue
  FLIGHT=$z F0=$f0 F1=31 /tmp/bl/bin/python scene2.py -- $1 $2 800 10 beauty $d/f 2>&1 | grep -E "RENDER|Error|Traceback" | sed "s/^/fl $z $1 /" >> fl/log.txt
 done
done
echo FINI >> fl/log.txt
