# Écrans du bureau (grand écran et portable) photographiés depuis js/atelier/bureau.js : à lancer depuis la racine du site
import subprocess, time, os
from playwright.sync_api import sync_playwright
open('_bt.html','w',encoding='utf8').write("""<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/s.css"><body style="margin:0;background:#000">
<script type="module">
import { Bureau } from '/js/atelier/bureau.js';
const f = getComputedStyle(document.documentElement).getPropertyValue('--d').trim() || 'sans-serif';
const q = new URLSearchParams(location.search); const b = new Bureau({ fonte: f, h: +(q.get('h') || 900), fond: q.get('fond') || undefined });
await document.fonts.load('600 20px ' + f);
await b.pret; b.ouvre(q.get('a') || 'fill');
b.dessine(new Date(2026, 10, 5, 14, 20)); b.c.style.display = 'block'; b.c.id = 'c'; document.body.appendChild(b.c); window.ok = true;
</script>""")
srv = subprocess.Popen(['python3','-m','http.server','8767'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--no-sandbox']); pg = b.new_page(viewport={'width':1600,'height':1100})
        for a, ex, out in (('fill','','/tmp/rd/desk.png'),('photos','&h=1041&fond=/p/t/the-avener-1.webp','/tmp/rd/lap.png')):
            pg.goto('http://localhost:8767/_bt.html?a='+a+ex); pg.wait_for_function('()=>window.ok', timeout=30000); pg.wait_for_timeout(800); pg.locator('#c').screenshot(path=out)
        b.close()
finally:
    srv.terminate(); os.remove('_bt.html')
