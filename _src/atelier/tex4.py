# Tirages du mur (cadres dibond), pochette et billet : à lancer depuis la racine du site
from PIL import Image, ImageOps, ImageDraw, ImageFont
for n,w,h in [('franglish-3',.30,.40),('matmatah-6',.54,.36),('helena-2',.27,.18),('kemmler-5',.27,.18),('rimk-1',.30,.40),('genezio-7',.1,.125),('philippe-katerine-2',.1,.125),('helena-7',.1,.125)]:
    im=Image.open('p/%s.jpg'%n).convert('RGB'); H=1100 if h>=w else int(1100*h/w); W=int(H*w/h)
    ImageOps.fit(im,(W,H),centering=(.5,.4)).save('/tmp/rd/dib_%s.jpg'%n,quality=92)
im=Image.open('projets/saisons-ellipse/img/cover.webp').convert('RGB'); ImageOps.fit(im,(1000,500)).save('/tmp/rd/pochette.jpg',quality=92)
t=Image.new('RGB',(400,275),'#F4EFE6'); d=ImageDraw.Draw(t); F=lambda s: ImageFont.truetype('/tmp/rd/br.ttf',s)
d.text((24,22),'L’Ellipse',font=F(46),fill='#1E1E1E'); d.text((24,86),'Saison 26-27',font=F(26),fill='#555'); d.line([(24,150),(376,150)],fill='#999',width=2)
d.text((24,170),'Placement libre',font=F(22),fill='#555'); d.text((24,206),'Rang · Place',font=F(22),fill='#555')
for x in range(0,400,16): d.ellipse([x,268,x+6,274],fill='#CFC8BB')
t.save('/tmp/rd/ticket.png')
