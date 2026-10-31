"""Supports à plat Maison Blé, sur la vraie charte (or, noir, crème, blanc ; Mixta Didone -> Playfair, Baloo Thambi 2)."""
import asyncio, base64, json, sys
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
FONTS="""@font-face{font-family:Did;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Bal;font-weight:400;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Bal;font-weight:500;src:url(data:font/woff2;base64,%s)}""" % (
 b64(F+'fontsource-playfair-display/files/playfair-display-latin-400-normal.woff2'),
 b64(F+'fontsource-baloo-thambi-2/files/baloo-thambi-2-latin-400-normal.woff2'),
 b64(F+'fontsource-baloo-thambi-2/files/baloo-thambi-2-latin-500-normal.woff2'))
LG=json.load(open('/home/claude/mk/mb_logo.json'))
BL,CR,OR,AN,NO='#FFFFFF','#EBE7DE','#B58B24','#424242','#221F20'
def sym(color,w,css='',arch=True):
    vb='0 0 287.221 436.779' if arch else '88 52 112 333'
    h=w*436.779/287.221 if arch else w*333/112
    d=(LG['arch'] if arch else '')
    return '<svg viewBox="%s" style="display:block;width:%.1fpx;height:%.1fpx;%s"><path fill="%s" d="%s"/><path fill="%s" d="%s"/></svg>'%(vb,w,h,css,color,d,color,LG['epi'])
def lock(color,W,css='',sub=None):
    fs=W/5.6; sub=sub or color
    return ('<div style="position:absolute;width:%dpx;display:flex;flex-direction:column;align-items:center;%s">%s'
      '<div style="font:400 %.1fpx/1 Did;color:%s;white-space:nowrap;margin-top:%.1fpx">MAISON BLÉ</div>'
      '<div style="font:400 %.1fpx/1 Bal;color:%s;letter-spacing:.24em;margin-right:-.24em;margin-top:%.1fpx">BOULANGERIE</div></div>')%(
      W,css,sym(color,W*.42),fs,color,W*.11,fs*.36,sub,W*.035)
BASE="*{margin:0;padding:0;box-sizing:border-box}body{background:transparent}#c{position:relative;overflow:hidden}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
# cartes de visite 85x55 -> 1700x1100
D['recto']=page(1700,1100,NO,lock(OR,520,'left:590px;top:250px',CR))
D['verso']=page(1700,1100,CR,sym(OR,120,'position:absolute;left:140px;top:130px')+
 '''<div class=n><b>Maison Blé</b><span>Boulangerie</span></div>
 <div class=co><p>12 rue du Four</p><p>29000 Finistère</p><p class=g></p><p>02 98 00 00 00</p><p>bonjour@maisonble.fr</p></div>
 <div class=h>Du mardi au dimanche, de 7 h à 19 h</div>''',
 '''.n{position:absolute;left:140px;top:560px;color:%s}.n b{display:block;font:400 86px/1 Did}.n span{display:block;margin-top:22px;font:400 30px Bal;letter-spacing:.26em;text-transform:uppercase;color:%s}
 .co{position:absolute;right:140px;top:568px;text-align:right;font:400 33px/1.5 Bal;color:%s}.co .g{height:22px}
 .h{position:absolute;left:140px;right:140px;bottom:110px;padding-top:28px;border-top:2px solid %s;font:400 26px Bal;letter-spacing:.22em;text-transform:uppercase;color:%s}'''%(NO,OR,AN,OR,AN))
# carte de remerciement A6 paysage
D['merci']=page(1600,1100,BL,sym(OR,104,'position:absolute;left:748px;top:140px')+
 '<h1>Pétri la veille,<br>cuit au matin.</h1><p>Merci de votre visite. À demain, au fournil.</p><div class=sg>Maison Blé · Boulangerie</div>',
 '''h1{position:absolute;left:0;right:0;top:390px;text-align:center;font:400 98px/1.1 Did;color:%s}
 p{position:absolute;left:0;right:0;top:680px;text-align:center;font:400 34px Bal;color:%s}
 .sg{position:absolute;left:0;right:0;bottom:118px;text-align:center;font:500 24px Bal;letter-spacing:.34em;text-transform:uppercase;color:%s}'''%(NO,AN,OR))
# carte de fidélité A5 paysage
st=''.join('<i>%s</i>'%(sym(OR,30,'margin:auto;opacity:%s'%('1' if i<4 else '0'),False)) for i in range(10))
D['fidelite']=page(2100,1480,BL,'<div class=g>'+lock(OR,470,'left:195px;top:430px',CR)+'</div>'+
 '<div class=d><h2>Carte de fidélité</h2><p>Un tampon par pain. Le dixième vous est offert.</p><div class=t>%s</div><div class=nm>Nom</div></div>'%st,
 '''.g{position:absolute;left:0;top:0;bottom:0;width:860px;background:%s}
 .d{position:absolute;left:860px;right:0;top:0;bottom:0;padding:170px 150px 0;color:%s}
 h2{font:400 92px/1 Did}.d p{margin-top:30px;font:400 34px Bal;color:%s}
 .t{margin-top:100px;display:grid;grid-template-columns:repeat(5,1fr);gap:46px 38px}
 .t i{display:flex;aspect-ratio:1;border:2.5px solid %s;border-radius:50%%;align-items:center}
 .nm{position:absolute;left:150px;right:150px;bottom:150px;padding-bottom:14px;border-bottom:2px solid %s;font:500 26px Bal;letter-spacing:.3em;text-transform:uppercase;color:%s}'''%(NO,NO,AN,OR,OR,OR))
async def main(keys):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            if keys and k not in keys: continue
            open('/home/claude/mk/flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/mk/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(150)
            await p.locator('#c').screenshot(path='/home/claude/mk/flats/%s.png'%k, omit_background=True)
        await b.close()
if __name__=='__main__': asyncio.run(main(sys.argv[1:]))
