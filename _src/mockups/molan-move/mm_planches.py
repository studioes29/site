import asyncio, io, sys, base64
from PIL import Image
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
FONTS=''.join('@font-face{font-family:Pop;font-weight:%d;src:url(data:font/woff2;base64,%s)}'%(w,b64(F+'fontsource-poppins/files/poppins-latin-%d-normal.woff2'%w)) for w in (300,400,500))
CO,AQ,ME,AN,NO,BL='#EE3F60','#AADADD','#F0FAEF','#434343','#272526','#FFFFFF'
OUT='/home/claude/site/projets/molan-move/img/'
LC='data:image/png;base64,'+b64('/home/claude/mm/logo_color.png'); LM='data:image/png;base64,'+b64('/home/claude/mm/logo_mask.png')
R=2370/2442
def logo(W,css='',mono=None):
    H=W/R
    if mono: return '<div style="position:absolute;width:%.0fpx;height:%.0fpx;background:%s;-webkit-mask:url(%s) center/contain no-repeat;%s"></div>'%(W,H,mono,LM,css)
    return '<img src="%s" style="position:absolute;width:%.0fpx;height:%.0fpx;%s">'%(LC,W,H,css)
def center(W,cw,ch): return 'left:%.0fpx;top:%.0fpx'%((cw-W)/2,(ch-W/R)/2)
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
D['cover']=(1400,980,page(1400,980,ME,logo(400,center(400,1400,980))))
tiles=[(BL,None),(CO,BL),(AN,'anth'),(AQ,BL)]
def tile(bg,m):
    if m=='anth':  # symbole en couleurs, nom en blanc : on superpose le masque blanc sous la version couleur, puis on blanchit le nom
        return logo(300,center(300,700,525),BL)+'<div style="position:absolute;%s;width:300px;height:%.0fpx;overflow:hidden">%s</div>'%(center(300,700,525),300/R*0.40,logo(300,'left:0;top:0'))
    return logo(300,center(300,700,525),m)
D['variantes']=(1400,1050,page(1400,1050,BL,''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:700px;height:525px;background:%s">%s</div>'%((i%2)*700,(i//2)*525,bg,tile(bg,m)) for i,(bg,m) in enumerate(tiles))))
sw=[('Corail',CO,BL),('Aqua',AQ,NO),('Menthe',ME,NO),('Anthracite',AN,BL),('Noir',NO,BL)]
rgb=lambda c:' '.join(str(int(c[i:i+2],16)) for i in (1,3,5))
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span></div>'%(c,t,n,c.upper(),rgb(c)) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,BL,'<div class=sw>%s</div><div class=lg>%s</div><div class=tx><i>Nom et titres</i><b>Lena</b><p>Des minuscules arrondies et des liaisons entre les lettres, pour le nom comme pour les titres du programme.</p></div>'%(cells,logo(240,center(240,560,400))),
 '.sw{position:absolute;left:70px;right:70px;top:70px;height:440px;display:grid;grid-template-columns:repeat(5,1fr);border-radius:24px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}.s{padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 16px Pop}.s b{font:500 26px Pop;margin-bottom:8px}'
 '.lg{position:absolute;left:70px;top:580px;width:560px;height:400px;border-radius:24px;background:%s}.tx{position:absolute;left:700px;top:660px;width:620px;color:%s}.tx i{font:500 14px Pop;font-style:normal;letter-spacing:.24em;text-transform:uppercase;color:%s}.tx b{display:block;font:500 46px Pop;margin:12px 0 16px}.tx p{font:300 22px/1.5 Pop;color:#555}'%(ME,NO,CO)))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/mm/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            im=Image.open(io.BytesIO(await p.locator('#c').screenshot())).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                im.crop((0,122,1400,857)).resize((1200,630)).save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
