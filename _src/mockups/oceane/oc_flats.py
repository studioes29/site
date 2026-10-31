import asyncio, base64, json, sys
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
FONTS=''.join('@font-face{font-family:Pop;font-weight:%d;src:url(data:font/woff2;base64,%s)}'%(w,b64(F+'fontsource-poppins/files/poppins-latin-%d-normal.woff2'%w)) for w in (300,400,500))
YE,TE,BE,BL,NO='#F1C155','#346778','#9D8F6C','#FFFFFF','#232323'
LG=json.load(open('/home/claude/oc/oc_logo.json'))
_N=[0]
def logo(W,css='',lens=BL,O=YE,txt=TE,small=YE,pupil=TE,mono=None):
    """lens : couleur de l'amande ; les lettres évidées prennent les couleurs posées dessous"""
    _N[0]+=1; cid='cl%d'%_N[0]
    inner=BL
    if mono: O=txt=small=pupil=mono; inner=lens
    under=('<rect x="0" y="0" width="842" height="596" fill="%s"/>'%small+
           '<rect x="276" y="255" width="440" height="100" fill="%s"/>'%txt+'<rect x="360" y="215" width="150" height="40" fill="%s"/>'%txt+
           '<rect x="135" y="225" width="141" height="140" fill="%s"/>'%O+'<circle cx="208.5" cy="294" r="41" fill="%s"/>'%inner)
    paths=''.join('<path d="%s" fill="%s"/>'%(d,pupil if i==1 else lens) for i,d in enumerate(LG['paths']))
    return ('<svg viewBox="12 96 819 402" style="display:block;width:%.1fpx;height:auto;%s"><defs><clipPath id="%s"><path d="%s"/></clipPath></defs>'
            '<g clip-path="url(#%s)">%s</g>%s</svg>')%(W,css,cid,LG['outer'],cid,under,paths)
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}.ph{position:absolute;background-size:cover;background-position:center}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body style="background:transparent"><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
D['test']=page(1800,900,'#888',logo(800,'position:absolute;left:50px;top:50px')+logo(800,'position:absolute;left:950px;top:50px',lens=YE,mono=BL)+logo(800,'position:absolute;left:50px;top:480px',lens=BL,mono=TE))
D['tote']=page(1200,800,'transparent',logo(1000,'position:absolute;left:100px;top:150px',lens=YE,mono='transparent'))
D['body']=page(1000,700,'transparent',logo(800,'position:absolute;left:100px;top:150px',lens=TE,mono='transparent'))
D['carte']=page(1400,1960,YE,logo(1000,'position:absolute;left:200px;top:640px')+'<p class=t>Bienvenue à la crèche</p>',
 '.t{position:absolute;left:0;right:0;top:1230px;text-align:center;font:500 54px/1.2 Pop;color:%s}'%TE)
D['poster']=page(1300,1760,TE,logo(1000,'position:absolute;left:150px;top:680px'))
async def main(keys):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            if keys and k not in keys: continue
            open('flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/oc/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(120)
            await p.locator('#c').screenshot(path='flats/%s.png'%k,omit_background=True)
        await b.close()
if __name__=='__main__': asyncio.run(main(sys.argv[1:]))
