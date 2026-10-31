"""Planches de l'étude Maison Blé sur la vraie charte."""
import asyncio, base64, io, sys
from PIL import Image
from playwright.async_api import async_playwright
from flats2 import FONTS, sym, lock, BL, CR, OR, AN, NO
OUT='/home/claude/site/projets/maison-ble/img/'
def photo(path,box=None,w=1400,q=88):
    im=Image.open(path).convert('RGB')
    if box: im=im.crop(box)
    im.thumbnail((w,w*2)); b=io.BytesIO(); im.save(b,'JPEG',quality=q)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
P1='/home/claude/mb-src/photo_various-.jpg'   # 2828x3535
P2='/home/claude/mk/AdobeStock_402694190.jpeg'  # 3421x2280
GRAIN="background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")"
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}.gr:after{content:'';position:absolute;inset:0;%s;opacity:.18;mix-blend-mode:overlay;pointer-events:none}.ph{background-size:cover;background-position:center}"%GRAIN
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body><div id=c class=gr>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
# ---------- couverture : la photo de pain, le logo crème
D['cover']=(1400,980,page(1400,980,NO,
 '<div class=ph style="position:absolute;inset:0;background-image:url(%s);background-position:50%% 62%%"></div><div class=v></div>'%photo(P1,(0,700,2828,3200))+
 lock(CR,430,'left:485px;top:250px',CR),
 '.v{position:absolute;inset:0;background:radial-gradient(60% 70% at 50% 48%,rgba(20,18,18,.62),rgba(20,18,18,.2) 70%,rgba(20,18,18,.45))}'))
# ---------- construction
def construction():
    W,H=1400,1050; sh=760; sw=sh*287.221/436.779; x0=(W*0.40)-sw/2; y0=(H-sh)/2; r=sw/2; xg=sw*0.22
    L='stroke="%s" stroke-width="1.2" fill="none"'%OR; Ld='stroke="%s" stroke-width="1.2" fill="none" stroke-dasharray="6 6"'%OR
    svg='<svg width="%d" height="%d" style="position:absolute;left:0;top:0">'%(W,H)
    svg+='<line x1="%.1f" y1="40" x2="%.1f" y2="%d" %s/>'%(x0+r,x0+r,H-40,L)
    for yy in (y0,y0+r,y0+sh-r,y0+sh): svg+='<line x1="60" y1="%.1f" x2="%.1f" y2="%.1f" %s/>'%(yy,x0+sw+50,yy,L)
    svg+='<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" %s/>'%(x0-xg,y0-xg,sw+2*xg,sh+2*xg,Ld)
    svg+='<circle cx="%.1f" cy="%.1f" r="4" fill="%s"/><circle cx="%.1f" cy="%.1f" r="4" fill="%s"/>'%(x0+r,y0+r,OR,x0+r,y0+sh-r,OR)
    svg+='<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" %s/>'%(x0+r,y0+r,x0+sw,y0+r,'stroke="%s" stroke-width="2"'%OR)
    svg+='</svg>'
    lab='<span class=l style="left:%.0fpx;top:%.0fpx">r</span><span class=l style="left:%.0fpx;top:%.0fpx">x</span>'%(x0+r*1.45,y0+r-40,x0-xg+14,y0-xg+8)
    notes='''<div class=nt><div class=lg>%s</div><dl><dt>Arche</dt><dd>Deux demi-cercles de rayon r, reliés par deux droites.</dd><dt>Épi</dt><dd>Centré sur l’axe vertical, dessiné d’un trait plein.</dd><dt>Zone de protection</dt><dd>x autour du signe, sans texte ni image.</dd></dl></div>'''%lock(NO,300,'position:relative',OR)
    return page(W,H,CR,svg+sym(NO,sw,'position:absolute;left:%.1fpx;top:%.1fpx'%(x0,y0))+lab+notes,
     '.l{position:absolute;font:500 22px Bal;color:%s}.nt{position:absolute;left:880px;top:180px;width:420px}.nt .lg{height:300px;position:relative;margin-bottom:60px}.nt .lg>div{left:0}'
     'dl{display:grid;gap:8px}dt{font:500 15px Bal;letter-spacing:.24em;text-transform:uppercase;color:%s;margin-top:18px}dd{font:400 21px/1.4 Bal;color:%s}'%(OR,OR,AN))
D['construction']=(1400,1050,construction())
# ---------- variantes : quatre fonds
tiles=[(NO,OR,CR),(CR,NO,OR),(OR,NO,NO),(BL,OR,AN)]
D['variantes']=(1400,1050,page(1400,1050,CR,''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:700px;height:525px;background:%s">%s</div>'%(
   (i%2)*700,(i//2)*525,bg,lock(fg,300,'left:200px;top:90px',sub)) for i,(bg,fg,sub) in enumerate(tiles))))
# ---------- système : l'épi agrandi, l'arche qui cadre, la signature
D['systeme']=(1400,1050,page(1400,1050,NO,
 sym('#2E2B2B',1100,'position:absolute;left:-60px;top:-420px;transform:rotate(-14deg)',False)+
 '<div class=ar><div class=ph style="position:absolute;inset:0;background-image:url(%s)"></div></div>'%photo(P1,(250,900,2700,3500),900)+
 '<div class=sg>%s</div><p class=t>Pétri la veille,<br>cuit au matin.</p>'%lock(OR,240,'position:relative',CR),
 '.ar{position:absolute;right:120px;top:120px;width:470px;height:810px;border-radius:235px 235px 0 0;overflow:hidden}'
 '.sg{position:absolute;left:110px;bottom:110px;width:240px;height:200px}.sg>div{left:0;bottom:0}'
 '.t{position:absolute;left:110px;top:150px;font:400 74px/1.08 Did;color:%s}'%CR))
# ---------- palette et typographies
def cmyk(h):
    r,g,b=[int(h[i:i+2],16)/255 for i in (1,3,5)]; k=1-max(r,g,b)
    if k>=1: return (0,0,0,100)
    return tuple(round(100*x) for x in ((1-r-k)/(1-k),(1-g-k)/(1-k),(1-b-k)/(1-k),k))
sw=[('Farine',BL,AN),('Mie',CR,AN),('Blé',OR,NO),('Fournil',AN,CR),('Four',NO,CR)]
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span><span>CMJN %s</span></div>'%(
  c,t,n,c.upper(),' '.join(str(int(c[i:i+2],16)) for i in (1,3,5)),' '.join(map(str,cmyk(c)))) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,'#F4F1EA','<div class=sw>%s</div><div class=ty><div><i>Titres</i><b>Mixta Didone</b><p>Regular et Bold, en capitales pour le nom, en bas de casse pour les phrases.</p></div><div><i>Texte</i><b class=bt>Baloo Thambi 2</b><p class=sp>Aa Bb Cc 0123 · Du mardi au dimanche, de 7 h à 19 h.</p></div></div>'%cells,
 '.sw{position:absolute;left:80px;right:80px;top:80px;height:500px;display:grid;grid-template-columns:repeat(5,1fr);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}'
 '.s{box-shadow:inset 0 0 0 1px rgba(34,31,32,.10);padding:30px 26px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 17px Bal}.s b{font:500 30px Bal;margin-bottom:10px}'
 '.ty{position:absolute;left:80px;right:80px;top:640px;display:grid;grid-template-columns:1fr 1fr;gap:60px;color:%s}'
 '.ty i{font:500 15px Bal;font-style:normal;letter-spacing:.26em;text-transform:uppercase;color:%s}.ty b{display:block;margin:14px 0 18px;font:500 54px/1 Bal;color:%s}.ty p{font:400 21px/1.45 Bal;color:%s;max-width:26em}.ty .sp{font-size:26px}'%(NO,OR,NO,AN)))
# ---------- affiche
D['affiche']=(900,1200,page(900,1200,NO,
 '<p class=t>Pétri la veille,<br>cuit au matin.</p><div class=ar><div class=ph style="position:absolute;inset:0;background-image:url(%s)"></div></div>%s<p class=h>Du mardi au dimanche · 7 h à 19 h</p>'%(photo(P1,(400,900,2700,3450),800),lock(OR,250,'left:70px;bottom:70px',CR)),
 '.t{position:absolute;left:70px;top:80px;font:400 82px/1.06 Did;color:%s}.ar{position:absolute;right:70px;top:340px;width:400px;height:600px;border-radius:200px 200px 0 0;overflow:hidden}'
 '.h{position:absolute;right:70px;bottom:78px;font:500 17px Bal;letter-spacing:.2em;text-transform:uppercase;color:%s}'%(CR,OR)))
# ---------- réseaux : six publications 4:5
pw,ph=400,500
posts=[
 '<div class=ph style="position:absolute;inset:0;background-image:url(%s)"></div><div style="position:absolute;inset:0;background:rgba(20,18,18,.45)"></div>%s'%(photo(P1,(0,600,2828,3535),600),lock(CR,190,'left:105px;top:150px',CR)),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=q style="color:%s">Ce sac<br>m’a coûté<br>du blé.</p>%s'%(NO,OR,sym(OR,46,'position:absolute;left:40px;bottom:40px')),
 '<div style="position:absolute;inset:0;background:%s"></div><div style="position:absolute;left:80px;right:80px;top:60px;bottom:60px;border-radius:120px 120px 0 0;overflow:hidden"><div class=ph style="position:absolute;inset:0;background-image:url(%s)"></div></div>'%(CR,photo(P2,(300,100,1500,2100),500)),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=k style="color:%s">Horaires</p><p class=i style="color:%s">Du mardi<br>au dimanche,<br>de 7 h à 19 h.</p>'%(OR,NO,NO),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(NO,''.join(sym('#3A3636' if (i+j)%2 else OR,34,'position:absolute;left:%dpx;top:%dpx'%(40+i*86,30+j*96),False) for i in range(4) for j in range(5))),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=q2 style="color:%s">« La mie<br>se mérite. »</p><p class=k2 style="color:%s">Maison Blé</p>'%(CR,NO,OR),
]
grid=''.join('<div class=p style="left:%dpx;top:%dpx">%s</div>'%(70+(i%3)*(pw+20),70+(i//3)*(ph+20),x) for i,x in enumerate(posts))
D['reseaux']=(1400,1200,page(1400,1200,'#DCD6CA',grid,
 '.p{position:absolute;width:%dpx;height:%dpx;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.08)}.q{position:absolute;left:40px;top:60px;font:400 56px/1.08 Did}'
 '.k,.k2{position:absolute;left:40px;font:500 15px Bal;letter-spacing:.26em;text-transform:uppercase}.k{top:60px}.k2{bottom:50px}.i{position:absolute;left:40px;bottom:50px;font:400 46px/1.12 Did}.q2{position:absolute;left:40px;top:150px;font:400 54px/1.1 Did}'%(pw,ph)))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/mk/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            png=await p.locator('#c').screenshot()
            im=Image.open(io.BytesIO(png)).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                o=im.resize((1400,980)).crop((0,122,1400,857)).resize((1200,630)); o.save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
