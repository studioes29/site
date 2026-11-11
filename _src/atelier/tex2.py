from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
import math
S='/home/claude/site_h'; BR='/tmp/rd/br.ttf'; F=lambda s: ImageFont.truetype(BR,s)
# clock
W=900; im=Image.new('RGB',(W,W),'#F2ECE1'); d=ImageDraw.Draw(im); c=W/2
for k in range(60):
    a=k/60*2*math.pi; r1=c*.93; r2=c*(.84 if k%5==0 else .895)
    d.line([(c+math.sin(a)*r1,c-math.cos(a)*r1),(c+math.sin(a)*r2,c-math.cos(a)*r2)],fill='#2A2622',width=12 if k%5==0 else 4)
for n,a in ((12,0),(3,90),(6,180),(9,270)):
    r=c*.68; x=c+math.sin(math.radians(a))*r; y=c-math.cos(math.radians(a))*r
    d.text((x,y),str(n),font=F(96),fill='#2A2622',anchor='mm')
im.save('/tmp/rd/clock.png')
# ipad : drawing app with a poster in progress
im=Image.new('RGB',(1140,800),'#1E1E20'); d=ImageDraw.Draw(im)
d.rectangle([0,0,1140,44],fill='#2A2A2D'); d.text((20,12),'Affiche · Académie des sports',font=F(20),fill='#C9C9CF')
for i,col in enumerate(['#E04A2F','#F2C14E','#1F9D74','#2F5BE0','#B6A2F7','#F4EFE6']): d.ellipse([20,80+i*52,56,116+i*52],fill=col)
art=ImageOps.fit(Image.open(S+'/projets/academie-des-sports/img/cover-800.webp').convert('RGB'),(900,630)); im.paste(art,(150,110))
d.rectangle([150,110,1050,740],outline='#5A5A60',width=2)
im.save('/tmp/rd/ipad.png')
# placeholder desktop (replaced by the JS-rendered one)
im=Image.new('RGB',(1600,900),'#2a2a2a'); bgp=ImageOps.fit(Image.open(S+'/p/matmatah-6.jpg' if False else S+'/p/t/matmatah-6.webp').convert('RGB'),(1600,900)).filter(ImageFilter.GaussianBlur(2)); im.paste(bgp)
im.save('/tmp/rd/desk.png')
print('ok')
