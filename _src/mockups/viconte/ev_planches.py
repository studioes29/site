import asyncio, io, sys
from PIL import Image
from playwright.async_api import async_playwright
from ev_flats import FONTS, lock, photo, BU, BE, JA, BL, NO, FACE, BOY
import ev_flats
OUT='/home/claude/site/projets/elodie-viconte/img/'
def page(w,h,bg,body,css=''): return ev_flats.page(w,h,bg,body,css)
P3='/home/claude/ev/ph_post_3.jpg'; P6='/home/claude/ev/ph_post_6.jpg'; P1='/home/claude/ev/ph_post_1.jpg'
D={}
D['cover']=(1400,980,page(1400,980,NO,'<div class=ph style="inset:0;background-image:url(%s);background-position:50%% 35%%"></div><div style="position:absolute;inset:0;background:rgba(20,20,22,.45)"></div>'%photo(BOY,(0,0,5000,3520))+lock(BL,700,'left:350px;top:280px')))
tiles=[(BU,BL),(BL,BU),(BE,NO),(JA,BU)]
D['variantes']=(1400,1050,page(1400,1050,BL,''.join('<div style="position:absolute;left:%dpx;top:%dpx;width:700px;height:525px;background:%s">%s</div>'%((i%2)*700,(i//2)*525,bg,lock(fg,470,'left:115px;top:110px')) for i,(bg,fg) in enumerate(tiles))))
sw=[('Bleu',BU,BL),('Lin',BE,NO),('Soleil',JA,NO),('Blanc',BL,NO),('Noir',NO,BL)]
rgb=lambda c:' '.join(str(int(c[i:i+2],16)) for i in (1,3,5))
cells=''.join('<div class=s style="background:%s;color:%s"><b>%s</b><span>%s</span><span>RVB %s</span></div>'%(c,t,n,c.upper(),rgb(c)) for n,c,t in sw)
D['palette']=(1400,1050,page(1400,1050,BL,'<div class=sw>%s</div><div class=ty style="background-image:url(%s)"></div><div class=tx><i>Nom</i><b>Billionaire Medium</b><p>Des capitales Art déco aux barres hautes, pour le nom seul.</p><i>Textes</i><b class=j>Jost, Thin et Medium</b><p>Une linéale géométrique : fine pour les phrases, médium pour les titres.</p></div>'%(cells,photo('/home/claude/ev/crop_typo.jpg',None,900,False)),
 '.sw{position:absolute;left:70px;right:70px;top:70px;height:400px;display:grid;grid-template-columns:repeat(5,1fr);border-radius:22px;overflow:hidden;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}.s{padding:26px 22px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;font:400 16px Jost}.s b{font:500 26px Jost;margin-bottom:8px}'
 '.ty{position:absolute;left:62px;top:500px;width:500px;height:492px;background-size:cover}.tx{position:absolute;left:640px;top:520px;width:680px;color:%s}.tx i{display:block;font:500 14px Jost;font-style:normal;letter-spacing:.26em;text-transform:uppercase;color:%s;margin-top:26px}.tx b{display:block;font:500 40px Jost;margin:10px 0 10px}.tx p{font:300 21px/1.5 Jost;color:#555}'%(NO,BU)))
D['systeme']=(1400,1050,page(1400,1050,BU,'<div class=ph style="left:0;top:0;width:700px;height:1050px;background-image:url(%s)"></div>'%photo(FACE,(0,300,3645,5467),900)+lock(BL,560,'left:770px;top:250px')+'<p class=t>L’instant, puis le tirage.</p>',
 '.t{position:absolute;left:700px;right:0;top:700px;text-align:center;font:300 34px/1.3 Jost;letter-spacing:.02em;color:%s}'%BL))
pw,ph=400,500
posts=[
 '<div class=ph style="inset:0;background-image:url(%s)"></div><div style="position:absolute;inset:0;background:rgba(0,0,0,.35)"></div>%s'%(photo(BOY,(900,0,4400,3520),600),lock(BL,280,'left:60px;top:185px')),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=q style="color:%s">L’instant,<br>puis le tirage.</p>'%(JA,BU),
 '<div class=ph style="inset:0;background-image:url(%s);background-position:50%% 0"></div>'%photo(P3,(0,0,1080,700),600),
 '<div style="position:absolute;inset:0;background:%s"></div><p class=k style="color:%s;top:60px">Séances</p><p class=i style="color:#fff">Sur<br>rendez-vous.</p>'%(BU,JA),
 '<div class=ph style="inset:0;background-image:url(%s);background-position:50%% 0"></div>'%photo(P6,(0,0,1080,700),600),
 '<div style="position:absolute;inset:0;background:%s"></div>%s'%(BE,lock(BU,280,'left:60px;top:185px')),
]
grid=''.join('<div class=p style="left:%dpx;top:%dpx">%s</div>'%(70+(i%3)*(pw+20),70+(i//3)*(ph+20),x) for i,x in enumerate(posts))
D['reseaux']=(1400,1200,page(1400,1200,'#EEF1F4',grid,'.p{position:absolute;width:%dpx;height:%dpx;overflow:hidden}.q{position:absolute;left:40px;bottom:60px;font:300 46px/1.12 Jost}.k{position:absolute;left:40px;font:500 14px Jost;letter-spacing:.24em;text-transform:uppercase}.i{position:absolute;left:40px;bottom:50px;font:300 40px/1.15 Jost}'%(pw,ph)))
D['affiche']=(900,1200,page(900,1200,BL,'<div class=ph style="left:60px;top:60px;width:780px;height:820px;background-image:url(%s)"></div>'%photo(FACE,(0,500,3645,4300),900)+lock(BU,400,'left:250px;top:915px')))
async def main(keys):
    async with async_playwright() as pw_:
        b=await pw_.chromium.launch(); p=await b.new_page()
        for k,(w,h,html) in D.items():
            if keys and k not in keys: continue
            f='/home/claude/ev/flats/pl_%s.html'%k; open(f,'w').write(html)
            await p.goto('file://'+f); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(250)
            im=Image.open(io.BytesIO(await p.locator('#c').screenshot())).convert('RGB'); im.save(OUT+k+'.webp',quality=88,method=6)
            if k=='cover':
                s=im.copy(); s.thumbnail((800,800)); s.save(OUT+'cover-800.webp',quality=84,method=6)
                im.crop((0,122,1400,857)).resize((1200,630)).save(OUT+'og.jpg',quality=88)
        await b.close()
asyncio.run(main(sys.argv[1:]))
