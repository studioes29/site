import asyncio, io, sys, base64
from PIL import Image
from playwright.async_api import async_playwright
from cp_flats import FONTS, lock, lock_h, sym, name, page, V, FO, SA, BL, NO
OUT='/home/claude/site/projets/christopher-poupon/img/'
def photo(path,box=None,w=1400):
    im=Image.open(path).convert('RGB')
    if box: im=im.crop(box)
    im.thumbnail((w,w*2)); b=io.BytesIO(); im.save(b,'JPEG',quality=88)
    return 'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode()
WB='/home/claude/cp/ph_unrecogniz.jpg'; GD='/home/claude/cp/ph_gardener-w.jpg'
D={}
W=420
D['cover']=(1400,980,page(1400,980,NO,'<div class=ph style="inset:0;background-image:url(%s)"></div><div style="position:absolute;inset:0;background:rgba(20,30,20,.45)"></div>'%photo(WB,(0,0,7316,4916))+lock(BL,W,(1400-W)/2,(980-W*0.94-W*0.07-W/4.0)/2)))
tiles=[(BL,V,V),(NO,V,V),(V,BL,BL),(SA,BL,V)]
D['variantes']=(1400,1050,page(1400,1050,BL,''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:700px;height:525px;background:%s">%s</div>'%((i%2)*700,(i//2)*525,bg,lock(c,300,200,(525-300*0.94-300*0.07-300/4.0)/2,sc)) for i,(bg,c,sc) in enumerate(tiles))))
sw=[('Vert',V,BL),('Forêt',FO,BL),('Sapin',SA,BL),('Blanc',BL,NO),('Noir',NO,BL)]
rgb=lambda c:' '.join(str(int(c[i:i+2],16)) for i in (1,3,5))
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span></div>'%(c,t,n,c.upper(),rgb(c)) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,'#F4F6F3','<div class=sw>%s</div><div class=lg>%s</div><div class=tx><i>Nom et titres</i><b>Agency FB</b><p>Des capitales étroites, en Regular et en Bold, pour le nom comme pour les titres des devis.</p></div>'%(cells,lock(BL,300,130,(400-300*0.94-300*0.07-300/4.0)/2,BL)),
 '.sw{position:absolute;left:70px;right:70px;top:70px;height:440px;display:grid;grid-template-columns:repeat(5,1fr);border-radius:24px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)}.s{padding:28px 24px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 18px Osw}.s b{font:500 30px Osw;margin-bottom:8px;text-transform:uppercase;letter-spacing:.03em}'
 '.lg{position:absolute;left:70px;top:580px;width:560px;height:400px;border-radius:24px;background:%s}.tx{position:absolute;left:700px;top:650px;width:620px;color:%s}.tx i{font:500 15px Osw;font-style:normal;letter-spacing:.24em;text-transform:uppercase;color:%s}.tx b{display:block;font:500 50px Osw;margin:10px 0 14px;text-transform:uppercase}.tx p{font:300 23px/1.5 Osw;color:#555}'%(FO,NO,FO)))
D['systeme']=(1400,1050,page(1400,1050,SA,'<div class=ph style="left:700px;top:0;width:700px;height:1050px;background-image:url(%s)"></div>'%photo(GD,(1800,0,6200,4591),900)+lock(BL,380,160,250,V)+'<p class=t>Création et entretien de jardin<br>Maçonnerie et menuiserie paysagère</p>',
 '.t{position:absolute;left:0;width:700px;top:760px;text-align:center;font:400 26px/1.5 Osw;letter-spacing:.06em;text-transform:uppercase;color:%s}'%BL))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/cp/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            im=Image.open(io.BytesIO(await p.locator('#c').screenshot())).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                im.crop((0,122,1400,857)).resize((1200,630)).save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
