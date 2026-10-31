"""Ajoute la croix de fermeture (fixe, en haut à droite) sur chaque page projets/*/index.html."""
import re, glob
CSS=('<style>.ferme{position:fixed;z-index:59;top:80px;right:var(--side,24px);display:grid;place-items:center;width:48px;height:48px;border-radius:50%;'
     'background:var(--s1);color:var(--tx);box-shadow:inset 0 0 0 1.5px var(--tx),0 10px 30px -12px rgba(20,20,18,.35);text-decoration:none;transition:transform .3s}'
     '.ferme:hover{transform:rotate(90deg)}.ferme svg{width:16px;height:16px;stroke:currentColor;stroke-width:2;stroke-linecap:round;fill:none}'
     '@media (max-width:860px){.ferme{display:none}}</style>')
for p in sorted(glob.glob('projets/*/index.html')):
    s=open(p).read()
    if 'id="ferme"' in s: continue
    m=re.search(r'<p class="fil"><a href="/">Studio ES</a><span>/</span><a href="([^"]+)">([^<]+)</a>',s)
    href,lab=m.group(1),m.group(2)
    if href=='/metiers/graphisme/': href+='#identites'
    a=('<a class="ferme" id="ferme" href="%s" aria-label="Fermer le projet et revenir à la page %s">'
       '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></a>')%(href,lab)
    s=s.replace('</head>',CSS+'</head>',1).replace('<main>',a+'\n<main>',1).replace('</body>','<script src="/ferme.js" defer></script>\n</body>',1)
    open(p,'w').write(s); print(p,href)
