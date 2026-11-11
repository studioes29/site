import json, os, glob
from PIL import Image
R = '/home/claude/site/js/atelier/r/'; os.makedirs(R + 'v', exist_ok=True)
L = json.load(open(R + 'l.json')); vols = {}
for z in ['web', 'photo', 'graph', 'fill', 'contact']:
    mf = '/tmp/rd/meta-flight-%s.json' % z
    if not os.path.exists(mf): continue
    d = json.load(open(mf)); nf = d['nf']; ok = False
    for m in ['jour', 'soir', 'nuit', 'matin']:
        src = '/tmp/rd/fl/%s-%s/' % (z, m)
        if not all(os.path.exists(src + 'f%04d.png' % k) for k in range(1, nf)): continue
        ok = True
        for k in range(1, nf):
            o = R + 'v/%s-%s-%02d.webp' % (z, m, k)
            if not os.path.exists(o): Image.open(src + 'f%04d.png' % k).convert('RGB').save(o, 'WEBP', quality=74, method=6)
    if ok: vols[z] = [{n: [[round(p[0], 4), round(p[1], 4), round(p[2], 3)] for p in f[n]] for n in f} for f in d['frames']]
    L['nv'] = nf
L['vols'] = vols
json.dump(L, open(R + 'l.json', 'w'), separators=(',', ':'))
print('vols', list(vols), os.path.getsize(R + 'l.json'))
