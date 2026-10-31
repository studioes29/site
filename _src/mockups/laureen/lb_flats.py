import asyncio, base64, re, sys
from playwright.async_api import async_playwright
F='/home/claude/mk/f/'
def b64(p): return base64.b64encode(open(p,'rb').read()).decode()
import subprocess,os
if not os.path.exists(F+'fontsource-poppins'):
    subprocess.run('cd %s && npm pack @fontsource/poppins >/dev/null 2>&1 && tar xzf fontsource-poppins-*.tgz && mv package fontsource-poppins'%F,shell=True)
FONTS="""@font-face{font-family:Pop;font-weight:300;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Pop;font-weight:400;src:url(data:font/woff2;base64,%s)}
@font-face{font-family:Pop;font-weight:500;src:url(data:font/woff2;base64,%s)}"""%tuple(b64(F+'fontsource-poppins/files/poppins-latin-%d-normal.woff2'%w) for w in (300,400,500))
LT,TE,PE,NU,BL,AN='#87F3FF','#038B99','#16666F','#194045','#FFFFFF','#424242'
_N=[0]
def _svg(f,vb,s,t,w,css=''):
    _N[0]+=1; u='u%d'%_N[0]
    x=open('/home/claude/lb/'+f).read().replace('cls-1',u+'a').replace('cls-2',u+'b')
    x=re.sub(r'<\?xml[^>]*\?>','',x)
    x=re.sub(r'<style>.*?</style>','<style>.%sa{fill:%s}.%sb{fill:%s}</style>'%(u,t,u,s),x)
    x=re.sub(r'viewBox="[^"]+"','viewBox="%s" style="display:block;width:%.1fpx;height:auto;overflow:hidden;%s"'%(vb,w,css),x,count=1)
    x=x.replace('id="Calque_1"','')
    return x
def logo_h(s,t,w,css=''): return _svg('V_COULEUR.svg','0 0 397.87 154.4',s,t,w,css)
def logo_v(s,t,w,css=''): return _svg('H_COULEUR.svg','0 0 236.52 323.35',s,t,w,css)
def sym(c,w,css=''): return _svg('V_COULEUR.svg','0 0 153.6 153.6',c,c,w,css)
BASE="*{margin:0;padding:0;box-sizing:border-box}#c{position:relative;overflow:hidden}"
def page(w,h,bg,body,css=''):
    return '<!doctype html><html><head><meta charset=utf-8><style>%s%s#c{width:%dpx;height:%dpx;background:%s}%s</style></head><body style="background:transparent"><div id=c>%s</div></body></html>'%(FONTS,BASE,w,h,bg,css,body)
CO='<p>Tél. 06 06 06 06 06</p><p>prenom.nom@gmail.com</p><p>Adresse · Code postal Ville</p>'
D={}
D['plaque']=page(1600,1600,NU,logo_h(BL,BL,620,'position:absolute;left:490px;top:680px'))
D['plaque_b']=page(1600,1600,AN,sym(BL,300,'position:absolute;left:650px;top:650px'))
D['carte_noire']=page(1700,1100,AN,logo_h(BL,BL,820,'position:absolute;left:440px;top:390px'))
D['carte_teal']=page(1700,1100,TE,sym(BL,300,'position:absolute;left:700px;top:400px'))
D['carte_blanche']=page(1700,1100,BL,logo_h(TE,'#252523',620,'position:absolute;left:130px;top:130px')+'<div class=co>%s</div>'%CO,
  '.co{position:absolute;left:130px;bottom:120px;font:400 32px/1.6 Pop;color:#424242}')
D['carnet']=page(1750,2700,TE,logo_v(BL,BL,560,'position:absolute;left:420px;top:900px'))
D['bloc']=page(1420,1980,BL,sym(TE,120,'position:absolute;right:110px;top:110px')+''.join('<i style="position:absolute;left:110px;right:110px;top:%dpx;height:2px;background:#d7eef0"></i>'%(420+k*90) for k in range(16)))
D['enveloppe']=page(1900,1900,'transparent',logo_h(TE,'#252523',420,'position:absolute;left:110px;bottom:120px'))
async def main(keys):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); p=await b.new_page()
        for k,h in D.items():
            if keys and k not in keys: continue
            open('flats/%s.html'%k,'w').write(h)
            await p.goto('file:///home/claude/lb/flats/%s.html'%k); await p.evaluate('document.fonts.ready'); await p.wait_for_timeout(120)
            await p.locator('#c').screenshot(path='flats/%s.png'%k,omit_background=True)
        await b.close()
if __name__=='__main__': asyncio.run(main(sys.argv[1:]))
