import asyncio, base64
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
FONTS="""@font-face{font-family:PF;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Italiana;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Jos;font-weight:300;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Jos;font-weight:400;src:url(data:font/woff2;base64,%s)}""" % (b64(F+'fontsource-playfair-display/files/playfair-display-latin-400-normal.woff2'),
 b64(F+'fontsource-italiana/files/italiana-latin-400-normal.woff2'),
 b64(F+'fontsource-josefin-sans/files/josefin-sans-latin-300-normal.woff2'),
 b64(F+'fontsource-josefin-sans/files/josefin-sans-latin-400-normal.woff2'))
M={k:'data:image/png;base64,'+b64('/home/claude/mk/%s_mask.png'%k) for k in ('logo','sym','epi')}
def lock(color,W,css):
    fs=W/5.75
    return ('<div style="position:absolute;width:%dpx;display:flex;flex-direction:column;align-items:center;color:%s;%s">'
      '<div style="position:relative;width:%.1fpx;height:%.1fpx;border:%.2fpx solid %s;border-radius:9999px">'
      '<div class="mk" style="position:absolute;-webkit-mask-image:url(%s);background:%s;left:%.1fpx;top:%.1fpx;width:%.1fpx;height:%.1fpx"></div></div>'
      '<div style="font:400 %.1fpx/1 PF;white-space:nowrap;margin-top:%dpx">MAISON BLÉ</div>'
      '<div style="font:300 %.1fpx/1 Jos;letter-spacing:.32em;margin-right:-.32em;margin-top:%dpx">BOULANGERIE</div></div>') % (
      W,color,css,W*.44,W*.44*340/224,W*.44*5/224,color,M['epi'],color,W*.44*61/224,W*.44*32/340*1.5,W*.44*93/224,W*.44*267/224,fs,W*.13,fs*.33,W*.045)
def mk(k,color,css): return '<div class="mk" style="-webkit-mask-image:url(%s);background:%s;%s"></div>'%(M[k],color,css)
BR,BL,FO,FA='#5C3B22','#C9A15A','#2A211C','#F5EFE4'
BASE="*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}#c{position:relative;overflow:hidden}.mk{-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)

D={}
# sac : logo seul, transparent
D['sac']=page(1000,1100,'transparent',lock(BR,600,'left:200px;top:150px'))
D['tampon']=page(1000,1000,'transparent',lock(BR,700,'left:150px;top:120px'))
# cartes de visite 85x55 -> 1700x1100
D['recto']=page(1700,1100,BR,lock(FA,560,'left:570px;top:250px'),'.s{position:absolute;left:0;right:0;bottom:90px;text-align:center;font:300 30px Jos;letter-spacing:.32em;color:%s}'%BL)
D['verso']=page(1700,1100,FA,mk('epi',BR,'position:absolute;left:140px;top:150px;width:110px;height:316px')+
 '''<div class=n><b>Maison Blé</b><span>Boulangerie artisanale</span></div>
 <div class=co><p>12 rue du Four</p><p>29000 Finistère</p><p class=g></p><p>02 98 00 00 00</p><p>bonjour@maisonble.fr</p></div>
 <div class=h>Du mardi au dimanche, de 7 h à 19 h</div>''',
 '''.n{position:absolute;left:140px;top:560px;color:%s}.n b{display:block;font:400 92px PF;letter-spacing:.01em;line-height:1}.n span{display:block;margin-top:22px;font:300 30px Jos;letter-spacing:.32em;text-transform:uppercase}
 .co{position:absolute;right:140px;top:560px;text-align:right;font:300 33px/1.55 Jos;color:%s}.co .g{height:24px}
 .h{position:absolute;left:140px;right:140px;bottom:110px;padding-top:30px;border-top:2px solid %s;font:300 27px Jos;letter-spacing:.24em;text-transform:uppercase;color:%s}'''%(BR,BR,BL,BR))
# carte de remerciement A6 paysage 1600x1100
D['merci']=page(1600,1100,'#fff','<div style="position:absolute;left:744px;top:150px;width:112px;height:170px;border:2.5px solid %s;border-radius:999px"><div class=mk style="position:absolute;-webkit-mask-image:url(%s);background:%s;left:30px;top:18px;width:46.5px;height:133.5px"></div></div>'%(BR,M['epi'],BR)+
 '<h1>Pétri la veille,<br>cuit au matin.</h1><p>Merci de votre visite. À demain, au fournil.</p><div class=sg>Maison Blé · Boulangerie</div>',
 '''h1{position:absolute;left:0;right:0;top:400px;text-align:center;font:400 96px/1.1 PF;color:%s}
 p{position:absolute;left:0;right:0;top:690px;text-align:center;font:300 34px Jos;letter-spacing:.06em;color:%s}
 .sg{position:absolute;left:0;right:0;bottom:120px;text-align:center;font:300 24px Jos;letter-spacing:.4em;text-transform:uppercase;color:%s}'''%(BR,BR,'#8A6A4B'))
# carte de fidélité A5 paysage 2100x1480
st=''.join('<i>%s</i>'%(mk('epi',BR,'width:100%%;height:100%%;opacity:%s'%('1' if i<4 else '0')) ) for i in range(10))
D['fidelite']=page(2100,1480,'#fff','<div class=g>'+lock(FA,480,'left:190px;top:400px')+'</div>'+
 '<div class=d><h2>Carte de fidélité</h2><p>Un tampon par pain. Le dixième vous est offert.</p><div class=t>%s</div><div class=nm>Nom</div></div>'%st,
 '''.g{position:absolute;left:0;top:0;bottom:0;width:860px;background:%s}
 .d{position:absolute;left:860px;right:0;top:0;bottom:0;padding:170px 150px 0 150px;color:%s}
 h2{font:400 88px PF;letter-spacing:0}.d p{margin-top:26px;font:300 34px Jos;letter-spacing:.04em}
 .t{margin-top:100px;display:grid;grid-template-columns:repeat(5,1fr);gap:46px 38px}
 .t i{display:block;aspect-ratio:1;border:2px solid %s;border-radius:50%%;padding:18px 0}
 .nm{position:absolute;left:150px;right:150px;bottom:150px;padding-bottom:14px;border-bottom:2px solid %s;font:300 26px Jos;letter-spacing:.32em;text-transform:uppercase;color:%s}'''%(BR,BR,BL,BL,BL))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            open('/home/claude/mk/flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/mk/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(150)
            await p.locator('#c').screenshot(path='/home/claude/mk/flats/%s.png'%k, omit_background=True)
        await b.close()
asyncio.run(main())
