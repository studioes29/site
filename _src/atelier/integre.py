"""Intègre les rendus de /tmp/rd/fin dans le site sans perdre les métadonnées déjà publiées
(plans rapprochés, chat, travellings) quand le lot en cours ne les recalcule pas."""
import json, os, shutil, subprocess, sys
R = '/home/claude/site/js/atelier/r/'; T = '/tmp/rd/_integre'; shutil.rmtree(T, ignore_errors=True); os.makedirs(T)
ici = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, os.path.join(ici, 'process.py')], env=dict(os.environ, SORTIE=T), check=True, stdout=subprocess.DEVNULL)
for v in 'lp':
    f = f'{T}/{v}.json'
    if not os.path.exists(f): continue
    neuf = json.load(open(f)); vieux = json.load(open(R + v + '.json')) if os.path.exists(R + v + '.json') else {}
    for k, x in vieux.items():
        if k not in neuf or (k in ('close', 'chat', 'vols') and not neuf[k]) or (k == 'closeups' and x): neuf[k] = x
    json.dump(neuf, open(f, 'w'), separators=(',', ':'))
for f in sorted(os.listdir(T)): shutil.copy2(f'{T}/{f}', R + f); print(f, os.path.getsize(R + f))
