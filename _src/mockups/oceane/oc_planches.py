import asyncio, io, sys, base64
from PIL import Image
from playwright.async_api import async_playwright
from oc_flats import FONTS, logo, page, YE, TE, BE, BL, NO
OUT='/home/claude/site/projets/creche-oceane/img/'
def photo(path,box=None,w=1400):
    im=Image.open(path).convert('RGB')
    if box: im=im.crop(box)
    im.thumbnail((w,w*2)); b=io.BytesIO(); im.save(b,'JPEG',quality=88)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
A='/home/claude/oc/_DSC3544.jpg'; B='/home/claude/oc/_DSC3551.jpg'
D={}
D['cover']=(1400,980,page(1400,980,NO,'<div class=ph style="inset:0;background-image:url(%s)"></div>'%photo(B,(300,0,4496,2530))+logo(520,'position:absolute;left:440px;top:640px')))
tiles=[(YE,dict()),(TE,dict()),(BL,dict(lens=YE,mono=BL)),(BE,dict(lens=BL,mono=TE))]
D['variantes']=(1400,1050,page(1400,1050,BL,''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:700px;height:525px;background:%s">%s</div>'%((i%2)*700,(i//2)*525,bg,logo(500,'position:absolute;left:100px;top:140px',**kw)) for i,(bg,kw) in enumerate(tiles))))
sw=[('Soleil',YE,NO),('Lagon',TE,BL),('Sable',BE,BL),('Blanc',BL,NO),('Nuit',NO,BL)]
rgb=lambda c:' '.join(str(int(c[i:i+2],16)) for i in (1,3,5))
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span></div>'%(c,t,n,c.upper(),rgb(c)) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,'#F6F3EC','<div class=sw>%s</div><div class=lg>%s</div><div class=tx><i>Écriture</i><b>Arsenale White</b><p>Une écriture manuscrite, pour « crèche » et « Moëlan-sur-Mer » dans le logo comme pour les mots d’accueil.</p></div>'%(cells,logo(520,'',lens=BL)),
 '.sw{position:absolute;left:70px;right:70px;top:70px;height:440px;display:grid;grid-template-columns:repeat(5,1fr);border-radius:24px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}.s{padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 16px Pop}.s b{font:500 26px Pop;margin-bottom:8px}'
 '.lg{position:absolute;left:70px;top:580px;width:560px;height:400px;border-radius:24px;background:%s;display:grid;place-items:center}.tx{position:absolute;left:700px;top:640px;width:620px;color:%s}.tx i{font:500 14px Pop;font-style:normal;letter-spacing:.24em;text-transform:uppercase;color:%s}.tx b{display:block;font:500 46px Pop;margin:12px 0 16px}.tx p{font:300 22px/1.5 Pop;color:#555}'%(YE,NO,TE)))
pw,ph=400,500
posts=[
 '<div class=ph style="inset:0;background-image:url(%s)"></div>%s'%(photo(B,(1400,0,3800,2530),600),logo(330,'position:absolute;left:35px;top:180px')),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=q style="color:%s">Bienvenue<br>à la crèche.</p>'%(YE,TE),
 '<div class=ph style="inset:0;background-image:url(%s)"></div>'%photo(A,(600,0,2400,2094),600),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=k style="color:%s;top:60px">Inscriptions</p><p class=i style="color:#fff">Renseignements<br>auprès de<br>la crèche.</p>'%(TE,YE),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(BE,logo(330,'position:absolute;left:35px;top:180px',lens=BL)),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(BL,logo(330,'position:absolute;left:35px;top:180px',lens=YE,mono=BL)),
]
grid=''.join('<div class=p style="left:%dpx;top:%dpx">%s</div>'%(70+(i%3)*(pw+20),70+(i//3)*(ph+20),x) for i,x in enumerate(posts))
D['reseaux']=(1400,1200,page(1400,1200,'#EEF3F4',grid,'.p{position:absolute;width:%dpx;height:%dpx;overflow:hidden;border-radius:4px}.q{position:absolute;left:40px;bottom:60px;font:500 44px/1.15 Pop}.k{position:absolute;left:40px;font:500 14px Pop;letter-spacing:.24em;text-transform:uppercase}.i{position:absolute;left:40px;bottom:50px;font:400 34px/1.2 Pop}'%(pw,ph)))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/oc/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            im=Image.open(io.BytesIO(await p.locator('#c').screenshot())).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                im.crop((0,122,1400,857)).resize((1200,630)).save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
