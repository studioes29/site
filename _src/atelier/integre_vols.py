"""Remplace dans le site les images de travelling recalculées (dossier /tmp/rd/fl2), sans toucher aux autres ni aux trajectoires."""
import glob, os, re
from PIL import Image
R = '/home/claude/site/js/atelier/r/v/'; n = 0
for f in sorted(glob.glob('/tmp/rd/fl2/*/f[0-9][0-9][0-9][0-9].png')):
    zm = os.path.basename(os.path.dirname(f)); k = int(re.search(r'f(\d+)\.png', f).group(1)); o = R + '%s-%02d.webp' % (zm, k)
    if os.path.exists(o) and os.path.getmtime(o) > os.path.getmtime(f): continue
    Image.open(f).convert('RGB').save(o, 'WEBP', quality=74, method=6); n += 1
print('images de travelling remplacées :', n)
