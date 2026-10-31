import asyncio, base64, json, sys, os, subprocess
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
if not os.path.exists(F+'fontsource-jost'):
    subprocess.run('cd %s && npm pack @fontsource/jost >/dev/null 2>&1 && tar xzf fontsource-jost-*.tgz && mv package fontsource-jost'%F,shell=True)
FONTS=''.join('@font-face{font-family:Jost;font-weight:%d;src:url(data:font/woff2;base64,%s)}'%(w,b64(F+'fontsource-jost/files/jost-latin-%d-normal.woff2'%w)) for w in (100,300,400,500))
BU,BE,JA,BL,NO='#3D5876','#CBC0AE','#FFDC9C','#FFFFFF','#211F20'
LG=json.load(open('/home/claude/ev/ev_logo.json'))
WM='data:image/png;base64,'+b64('/home/claude/ev/wordmark.png')
TL,TR,BR_,BLc=(2384.008,1712.730),(2926.924,2018.703),(2590.709,2616.661),(2047.793,2310.688)
OX,OY,LW,LH=2059,1948,852,511
def illu(color,k,clip=True):
    a=((TR[0]-TL[0])/946.957,(TR[1]-TL[1])/946.957); c=((BLc[0]-TL[0])/1042.32,(BLc[1]-TL[1])/1042.32)
    body=LG['body'].replace('fill="rgb(100%, 100%, 100%)"','fill="%s"'%color)
    return '<svg width="946.957" height="1042.32" viewBox="0 0 946.957 1042.32" style="position:absolute;left:0;top:0;transform-origin:0 0;transform:matrix(%.5f,%.5f,%.5f,%.5f,%.2f,%.2f)">%s</svg>'%(a[0]*k,a[1]*k,c[0]*k,c[1]*k,(TL[0]-OX)*k,(TL[1]-OY)*k,body)
def lock(color,W,css='',text=True):
    k=W/LW
    t='<div style="position:absolute;left:%.1fpx;top:%.1fpx;width:%.1fpx;height:%.1fpx;background:%s;-webkit-mask:url(%s) center/contain no-repeat"></div>'%((2400-OX)*k,(2305-OY)*k,516*k,156*k,color,WM) if text else ''
    return '<div style="position:absolute;width:%.1fpx;height:%.1fpx;%s">%s%s</div>'%(W,LH*k,css,illu(color,k),t)
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}.ph{position:absolute;background-size:cover;background-position:center}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body style="background:transparent"><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
def photo(path,box=None,w=1400,gray=True):
    from PIL import Image, ImageOps; import io
    im=Image.open(path).convert('RGB')
    if box: im=im.crop(box)
    if gray: im=ImageOps.grayscale(im).convert('RGB')
    im.thumbnail((w,w*2)); bb=io.BytesIO(); im.save(bb,'JPEG',quality=90)
    return 'data:image/jpeg;base64,'+base64.b64encode(bb.getvalue()).decode()
FACE='/home/claude/ev/ph_face-.jpg'; BOY='/home/claude/ev/ph_teena.jpg'
D={}
D['carte_bleue']=page(1700,1100,BU,lock(BL,900,'left:400px;top:280px'))
D['logo_seul']=page(1000,1000,BL,lock(BU,700,'left:150px;top:290px'))
D['tote']=page(1200,1200,'transparent',lock(BU,900,'left:150px;top:330px'))
D['marge']=page(1000,240,'transparent',lock(BU,300,'left:350px;top:30px'))
D['tirage_face']=page(1000,1000,NO,'<div class=ph style="inset:0;background-image:url(%s);background-position:50%% 40%%"></div>'%photo(FACE,(0,600,3645,4245)))
D['tirage_boy']=page(1400,1000,NO,'<div class=ph style="inset:0;background-image:url(%s)"></div>'%photo(BOY,(400,0,5000,3300)))
D['tirage_post4']=page(1400,1000,NO,'<div class=ph style="inset:0;background-image:url(%s);background-position:50%% 0"></div>'%photo('/home/claude/ev/ph_post_4.jpg',(0,0,1080,760)))
D['tirage_logo']=page(1400,1000,BU,lock(BL,820,'left:290px;top:250px'))
async def main(keys):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            if keys and k not in keys: continue
            open('flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/ev/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(150)
            await p.locator('#c').screenshot(path='flats/%s.png'%k,omit_background=True)
        await b.close()
if __name__=='__main__': asyncio.run(main(sys.argv[1:]))
