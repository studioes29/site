import asyncio, base64, sys, io
from PIL import Image
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
import subprocess, os
if not os.path.exists(F+'fontsource-oswald'):
    subprocess.run('cd %s && npm pack @fontsource/oswald >/dev/null 2>&1 && tar xzf fontsource-oswald-*.tgz && mv package fontsource-oswald'%F,shell=True)
FONTS=''.join('@font-face{font-family:Osw;font-weight:%d;src:url(data:font/woff2;base64,%s)}'%(w,b64(F+'fontsource-oswald/files/oswald-latin-%d-normal.woff2'%w)) for w in (300,400,500))
V,FO,SA,BL,NO='#71AD6F','#3F613E','#293F28','#FFFFFF','#211F20'
SYM='data:image/png;base64,'+b64('/home/claude/cp/sym.png'); NAME='data:image/png;base64,'+b64('/home/claude/cp/name.png')
SR=878/1084; NR=1110/277
def sym(c,H,css=''): return '<div style="position:absolute;width:%.0fpx;height:%.0fpx;background:%s;-webkit-mask:url(%s) center/contain no-repeat;%s"></div>'%(H*SR,H,c,SYM,css)
def name(c,W,css=''): return '<div style="position:absolute;width:%.0fpx;height:%.0fpx;background:%s;-webkit-mask:url(%s) center/contain no-repeat;%s"></div>'%(W,W/NR,c,NAME,css)
def lock(c,W,x,y,sc=None):
    """logo vertical : symbole centré au-dessus du nom ; W = largeur du nom"""
    sc=sc or c; H=W*0.94; sw=H*SR
    return sym(sc,H,'left:%.0fpx;top:%.0fpx'%(x+(W-sw)/2,y))+name(c,W,'left:%.0fpx;top:%.0fpx'%(x,y+H+W*0.07))
def lock_h(c,H,x,y,sc=None):
    """logo horizontal : symbole à gauche, nom centré verticalement"""
    sc=sc or c; sw=H*SR; W=H*1.55
    return sym(sc,H,'left:%.0fpx;top:%.0fpx'%(x,y))+name(c,W,'left:%.0fpx;top:%.0fpx'%(x+sw+H*0.18,y+(H-W/NR)/2))
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}.ph{position:absolute;background-size:cover;background-position:center}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body style="background:transparent"><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
D={}
# flanc d'utilitaire : 1300x1080, logo horizontal centré, services dessous
H=300; tw=H*SR+H*0.18+H*1.55
D['van']=page(1300,420,'transparent',lock_h(SA,H,(1300-tw)/2,60,V))
D['polo']=page(400,400,'transparent',sym(BL,360,'left:%.0fpx;top:20px'%((400-360*SR)/2)))
async def main(keys):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            if keys and k not in keys: continue
            open('flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/cp/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(150)
            await p.locator('#c').screenshot(path='flats/%s.png'%k,omit_background=True)
        await b.close()
if __name__=='__main__': asyncio.run(main(sys.argv[1:]))
