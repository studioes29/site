import asyncio, base64, io, sys
from PIL import Image
from playwright.async_api import async_playwright
from lb_flats import FONTS, logo_h, logo_v, sym, LT, TE, PE, NU, BL, AN
OUT='/home/claude/site/projets/laureen-boudigou/img/'
def photo(path,box=None,w=1400,q=88):
    im=Image.open(path).convert('RGB')
    if box: im=im.crop(box)
    im.thumbnail((w,w*2)); b=io.BytesIO(); im.save(b,'JPEG',quality=q)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
A='/home/claude/lb/archi.jpg'  # 4396x6586
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}.ph{position:absolute;background-size:cover;background-position:center}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
D['cover']=(1400,980,page(1400,980,NU,'<div class=ph style="inset:0;background-image:url(%s)"></div><div style="position:absolute;inset:0;background:linear-gradient(0deg,rgba(25,64,69,.72),rgba(25,64,69,.45))"></div>'%photo(A,(0,1500,4396,4600))+logo_h(BL,BL,560,'position:absolute;left:420px;top:380px')))
sw=[('Lagon',LT,NU),('Pétrole',TE,BL),('Abysse',PE,BL),('Nuit',NU,BL),('Blanc',BL,NU),('Anthracite',AN,BL)]
def rgb(c): return ' '.join(str(int(c[i:i+2],16)) for i in (1,3,5))
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span></div>'%(c,t,n,c.upper(),rgb(c)) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,'#111111','<div class=sw>%s</div><div class=vg style="background-image:url(%s)"></div><div class=tx><i>Titres et nom</i><b>Vegawanty</b><p>Une didone aux empattements fins, en bas de casse, déclinée sur les trois teintes de pétrole.</p></div>'%(cells,photo('crop_vega.jpg',None,900)),
 '.sw{position:absolute;left:70px;right:70px;top:70px;height:430px;display:grid;grid-template-columns:repeat(6,1fr);border-radius:22px;overflow:hidden}.s{padding:26px 22px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 16px Pop}.s b{font:500 24px Pop;margin-bottom:8px}'
 '.vg{position:absolute;left:58px;top:530px;width:470px;height:463px;background-size:cover}.tx{position:absolute;left:600px;top:600px;width:700px;color:#EDEDED}.tx i{font:500 14px Pop;font-style:normal;letter-spacing:.24em;text-transform:uppercase;color:%s}.tx b{display:block;font:500 54px Pop;margin:14px 0 18px}.tx p{font:300 22px/1.5 Pop;color:#BDBDBD;max-width:24em}'%LT))
# système : le carré agrandi en fond, l'architecture cadrée, la signature
D['systeme']=(1400,1050,page(1400,1050,TE,sym('rgba(255,255,255,.08)',1300,'position:absolute;left:-260px;top:-180px')+
 '<div class=ph style="left:760px;top:0;width:640px;height:1050px;background-image:url(%s)"></div>'%photo(A,(800,0,3800,4900),900)+
 logo_h(BL,BL,420,'position:absolute;left:120px;bottom:120px')+'<p class=t>Conseil<br>et défense,<br>au cabinet.</p>',
 '.t{position:absolute;left:120px;top:130px;font:300 64px/1.12 Pop;color:#fff}'))
# réseaux
pw,ph=400,500
posts=[
 '<div class=ph style="inset:0;background-image:url(%s)"></div><div style="position:absolute;inset:0;background:rgba(25,64,69,.55)"></div>%s'%(photo(A,(500,1200,3900,5500),600),logo_v(BL,BL,170,'position:absolute;left:115px;top:140px')),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=q style="color:#fff">Écouter,<br>conseiller,<br>défendre.</p><p class=k style="color:%s">Le cabinet</p>'%(TE,LT),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(BL,sym(TE,200,'position:absolute;left:100px;top:150px')),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=k style="color:%s;top:60px">Rendez-vous</p><p class=i style="color:#fff">Au cabinet<br>ou en visio,<br>sur rendez-vous.</p>'%(NU,LT),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(PE,''.join(sym('rgba(255,255,255,%s)'%('.9' if (i+j)%3==0 else '.14'),56,'position:absolute;left:%dpx;top:%dpx'%(34+i*92,36+j*92)) for i in range(4) for j in range(5))),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(AN,logo_h(BL,BL,300,'position:absolute;left:50px;top:200px')),
]
grid=''.join('<div class=p style="left:%dpx;top:%dpx">%s</div>'%(70+(i%3)*(pw+20),70+(i//3)*(ph+20),x) for i,x in enumerate(posts))
D['reseaux']=(1400,1200,page(1400,1200,'#E6EEEF',grid,'.p{position:absolute;width:%dpx;height:%dpx;overflow:hidden}.q{position:absolute;left:40px;top:70px;font:300 50px/1.1 Pop}.k{position:absolute;left:40px;bottom:50px;font:500 14px Pop;letter-spacing:.24em;text-transform:uppercase}.i{position:absolute;left:40px;bottom:50px;font:300 38px/1.2 Pop}'%(pw,ph)))
D['affiche']=(900,1200,page(900,1200,NU,'<div class=ph style="left:0;top:0;width:900px;height:760px;background-image:url(%s)"></div>'%photo(A,(300,600,4100,5700),900)+
 '<div style="position:absolute;left:0;right:0;top:760px;bottom:0;background:%s"></div>'%TE+logo_h(BL,BL,470,'position:absolute;left:70px;top:860px')+'<p style="position:absolute;left:70px;bottom:70px;font:400 18px Pop;letter-spacing:.2em;text-transform:uppercase;color:%s">Sur rendez-vous</p>'%LT))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/lb/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            im=Image.open(io.BytesIO(await p.locator('#c').screenshot())).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                im.crop((0,122,1400,857)).resize((1200,630)).save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
