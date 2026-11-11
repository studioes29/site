"""Banc d'essai de la bannière à horloge virtuelle : chaque image avance le temps de la page d'un pas fixe.
usage : banc.py <heure> <sortie> [mob] [--pas ms] [--plan "t:action,..."] [--film dossier] [--url suffixe]
plan : suite de segments "durée_s" ou "durée_s@défilement_px_fin" ; par défaut arrivée puis défilement."""
import sys, io, subprocess, time, os, argparse
from playwright.sync_api import sync_playwright
from PIL import Image
ap = argparse.ArgumentParser(); ap.add_argument('heure', type=int); ap.add_argument('sortie'); ap.add_argument('--mob', action='store_true')
ap.add_argument('--pas', type=float, default=250); ap.add_argument('--plan', default='4.6,2.4@640,1.2@0'); ap.add_argument('--film', default='')
ap.add_argument('--url', default='?arrivee&atdbg'); ap.add_argument('--port', default='8768'); ap.add_argument('--rm', action='store_true'); ap.add_argument('--vu', action='store_true'); ap.add_argument('--col', type=int, default=6)
A = ap.parse_args()
HORLOGE = """(h=>{const D=Date,off=new D(2026,10,5,h,20).getTime()-D.now();let vt=0;const q=new Map();let id=0;
class FD extends D{constructor(...a){if(a.length)super(...a);else super(D.now()+off)}static now(){return D.now()+off}};window.Date=FD;
performance.now=()=>vt;window.requestAnimationFrame=f=>{q.set(++id,f);return id};window.cancelAnimationFrame=i=>q.delete(i);
window.__pas=(ms)=>{vt+=ms;const l=[...q.values()];q.clear();for(const f of l){try{f(vt)}catch(e){console.error('raf',e&&e.message)}}
 for(const a of document.getAnimations()){try{if(a.playState!=='paused'){a.pause();a.__v=1}else if(a.__v)a.currentTime=(a.currentTime||0)+ms;else{a.__v=1}}catch(e){}}return vt};
window.__vt=()=>vt;})(%d)"""
srv = subprocess.Popen(['python3','-m','http.server',A.port], cwd='/home/claude/site', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        kw = dict(reduced_motion='reduce') if A.rm else {}
        cx = b.new_context(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True, **kw) if A.mob else b.new_context(viewport={'width':1440,'height':810}, **kw)
        cx.add_init_script(HORLOGE % A.heure)
        if A.vu: cx.add_init_script("try{sessionStorage.setItem('at-vu','1')}catch(e){}")
        pg = cx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append('ERR ' + str(e)[:300])); pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and 'GPU stall' not in m.text else None)
        pg.on('response', lambda r: errs.append('%d %s' % (r.status, r.url[-60:])) if r.status >= 400 else None)
        pg.goto('http://localhost:%s/%s' % (A.port, A.url), wait_until='load')
        # la boucle n'avance que par __pas : on attend que le moteur soit prêt (classe at-pret) en pompant à pas nul
        for _ in range(400):
            if pg.evaluate("document.getElementById('hx').classList.contains('at-pret')"): break
            pg.wait_for_timeout(100)
        ims = []; n = 0; y = 0
        if A.film: os.makedirs(A.film, exist_ok=True)
        for seg in A.plan.split(','):
            d, _, yf = seg.partition('@'); d = float(d); k = max(1, round(d * 1000 / A.pas)); y0 = y; y1 = float(yf) if yf else y
            for i in range(k):
                if y1 != y0:
                    u = (i + 1) / k; e = u * u * (3 - 2 * u); y = y0 + (y1 - y0) * e
                    pg.evaluate("window.scrollTo({top:%f,behavior:'instant'})" % y)
                pg.evaluate("__pas(%f)" % A.pas)
                raw = pg.screenshot(type='jpeg', quality=92)
                if A.film: open('%s/%05d.jpg' % (A.film, n), 'wb').write(raw)
                else: ims.append(Image.open(io.BytesIO(raw)).convert('RGB'))
                n += 1
            y = y1
        print('état', pg.evaluate("JSON.stringify({a: window.__arrivee ? {fin: __arrivee.fin, e: __arrivee.e} : null, cls: document.getElementById('hx').className, sd: getComputedStyle(document.getElementById('hx')).getPropertyValue('--sd')})"))
        print('erreurs', errs[:8], 'images', n); b.close()
    if ims:
        w, h = (195, 422) if A.mob else (400, 225); c = A.col; l = (len(ims) + c - 1) // c
        s = Image.new('RGB', (w * c, h * l))
        for i, im in enumerate(ims): s.paste(im.resize((w, h)), ((i % c) * w, (i // c) * h))
        s.save(A.sortie, quality=88)
finally:
    srv.terminate()
