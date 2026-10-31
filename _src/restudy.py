"""Réécrit une page d'étude de cas : couleurs du héros, textes des chapitres, galeries, palette, livrables."""
import re, html
NB=lambda t:t.replace(' :',' :').replace(' ;',' ;').replace(' ?',' ?').replace(' !',' !').replace('« ','« ').replace(' »',' »')
from PIL import Image
def sz(d,n): return Image.open('%s/img/%s'%(d,n)).size
def apply(d, pc, chapters, swatches, liv, meta=None, bref=None, nb_supports=None):
    p=d+'/index.html'; s=open(p).read()
    s=re.sub(r'(<section class="fh w" aria-labelledby="t" style=")[^"]*(")',r'\g<1>--pc:%s;--pc2:%s\2'%pc,s)
    for i,(title,se,text,imgs) in enumerate(chapters,1):
        a=s.index('<section class="ch" aria-labelledby="c%d">'%i); b=s.index('</section>',a)+10
        g=''.join('\n    <img data-r%s src="img/%s" width="%d" height="%d" alt="%s" loading="lazy">'%(' class="wide"' if w else '',n,*sz(d,n),html.escape(alt)) for n,w,alt in imgs)
        sw=''
        if i==2 and swatches:
            sw='\n    <div class="sw" role="group" aria-label="Palette">%s</div>'%''.join('<i style="background:%s;color:%s%s">%s</i>'%(c,t,';box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)' if c.upper() in('#FFFFFF','#FFF') else '',n) for n,c,t in swatches)
        sec=('<section class="ch" aria-labelledby="c%d">\n  <div class="tx" data-r>\n    <span class="n">0%d</span>\n    <h2 class="d" id="c%d">%s <span class="se">%s</span></h2>\n    <p>%s</p>%s\n  </div>\n  <div class="gal" tabindex="0" role="region" aria-label="Galerie">%s\n  </div>\n</section>')%(i,i,i,html.escape(title),html.escape(se),NB(html.escape(text,quote=False)),sw,g)
        s=s[:a]+sec+s[b:]
    a=s.index('<div class="mq" style="--ar:3/4">'); b=s.index('</div>',a)+6
    figs=''.join('<figure><img src="img/%s" alt="%s" loading="lazy" decoding="async"><figcaption><b>%s</b><span>%s</span></figcaption></figure>'%(n,html.escape(t),html.escape(t),NB(html.escape(l,quote=False))) for n,t,l in liv)
    s=s[:a]+'<div class="mq" style="--ar:3/4">'+figs+'</div>'+s[b:]
    if nb_supports: s=re.sub(r'<dd class="nb">\d+ supports</dd>','<dd class="nb">%d supports</dd>'%nb_supports,s)
    if meta:
        for o,n in meta: s=s.replace(o,n)
    open(p,'w').write(s)

def nuancier(slug,new):
    """Met à jour la couleur de la carte nuancier (page Graphisme et metiers.py)."""
    f='metiers/graphisme/index.html'; s=open(f).read()
    m=re.search(r'--c:(#[0-9A-Fa-f]{6})(;--i:\d+" href="/projets/%s/")'%slug,s)
    old=m.group(1); a=m.start(); b=s.index('· Identité',a)
    s=s[:a]+s[a:b].replace(old,new)+s[b:]; open(f,'w').write(s)
    f='_src/metiers.py'; t=open(f).read(); t=t.replace("'%s', '%s'"%(slug,old),"'%s', '%s'"%(slug,new)); open(f,'w').write(t)
    return old
