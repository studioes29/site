from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps
import random, math
random.seed(3)
S='/home/claude/site'
BR='/tmp/rd/br.ttf'; UR='/tmp/rd/ur.ttf'
F=lambda p,s: ImageFont.truetype(p,s)
def thumb(n,w,h):
    im=Image.open(S+'/p/t/%s.webp'%n).convert('RGB'); return ImageOps.fit(im,(w,h))
PH=['franglish-3','fatal-bazooka-10','helena-7','rimk-1','genezio-7','matmatah-10','la-fouine-7','philippe-katerine-2','franglish-5','helena-3','matmatah-11','danakil-4']
# laptop: lightroom-like library
W,H=1600,1000; im=Image.new('RGB',(W,H),'#1C1D20'); d=ImageDraw.Draw(im)
d.rectangle([0,0,W,54],fill='#2A2B2F'); d.text((24,14),'Bibliothèque  ·  Les Petites Folies 2026',font=F(BR,24),fill='#B9B9C0')
d.rectangle([0,H-90,W,H],fill='#26272B')
for i,n in enumerate(PH):
    c,r=i%6,i//6; w,h=238,318; x=24+c*(w+22); y=80+r*(h+28)
    im.paste(thumb(n,w,h),(x,y))
    if i==4: d.rectangle([x-4,y-4,x+w+4,y+h+4],outline='#E8E3D6',width=4)
for i in range(14): im.paste(thumb(PH[i%12],48,64),(24+i*56,H-78))
im.save('/tmp/rd/lr.png')
# contact sheet
W,H=840,1080; im=Image.new('RGB',(W,H),'#151515'); d=ImageDraw.Draw(im)
for i in range(24):
    c,r=i%4,i//4; x=40+c*195; y=60+r*165
    im.paste(thumb(PH[i%12],180,135),(x,y)); d.text((x,y+138),'%02d'%(i+1),font=F(BR,16),fill='#E9A23B')
d.ellipse([40+195+60,60+165+20,40+195+130,60+165+120],outline='#E04A2F',width=5)
im.save('/tmp/rd/contact.png')
# sketchbook pages
for side in ('l','r'):
    im=Image.new('RGB',(630,870),'#F5F0E6'); d=ImageDraw.Draw(im)
    for _ in range(4000):
        x,y=random.randrange(630),random.randrange(870); v=random.randint(225,245); d.point((x,y),fill=(v,v-4,v-12))
    if side=='l':
        d.text((60,80),'ES',font=F(BR,180),fill='#2A2A2A')
        for k in range(3): d.ellipse([60+k*170,420,200+k*170,560],outline='#3A3A3A',width=3)
        d.text((60,620),'Studio ES',font=F(UR,64),fill='#3A3A3A')
        for k in range(8): d.line([(60,760+k*12),(560-random.randint(0,200),760+k*12)],fill='#9A958C',width=2)
    else:
        for k in range(6):
            x=70+(k%3)*170; y=90+(k//3)*230; d.rectangle([x,y,x+140,y+190],outline='#3A3A3A',width=3)
            d.line([(x,y),(x+140,y+190)],fill='#B0AAA0',width=1); d.line([(x+140,y),(x,y+190)],fill='#B0AAA0',width=1)
        d.text((70,600),'affiche · grille 3 col.',font=F(UR,36),fill='#4A4A4A')
        d.rectangle([70,670,250,760],fill='#E04A2F'); d.rectangle([270,670,450,760],fill='#B6A2F7')
    im=im.filter(ImageFilter.GaussianBlur(.6)); im.save('/tmp/rd/sk_%s.png'%side)
# fill label
im=Image.new('RGB',(600,200),'#F5F1E8'); d=ImageDraw.Draw(im); d.text((40,30),'Fill',font=F(BR,120),fill='#1E1E1E'); d.text((300,90),'studio es',font=F(UR,40),fill='#6B6B6B'); im.save('/tmp/rd/fill.png')
# phone
im=Image.new('RGB',(660,1310),'#0E0F12'); d=ImageDraw.Draw(im)
im.paste(ImageOps.fit(Image.open(S+'/p/t/helena-7.webp').convert('RGB'),(660,1310)).point(lambda v:int(v*.75)),(0,0))
d.text((330,250),'14:20',font=F(BR,170),fill='#FFFFFF',anchor='mm'); d.text((330,380),'jeudi 5 novembre',font=F(BR,40),fill='#E8E8E8',anchor='mm')
d.rounded_rectangle([60,560,600,700],radius=40,fill=(255,255,255)); d.text((100,590),'Nouveau message',font=F(BR,32),fill='#111'); d.text((100,640),'« On se cale un shooting ? »',font=F(BR,28),fill='#444')
im.save('/tmp/rd/phone.png')
# declic screen
im=Image.new('RGB',(260,200),'#0F1A12'); d=ImageDraw.Draw(im)
for k in range(12): d.rectangle([20+k*19,140-((k*37)%60),34+k*19,150],fill='#7CE38B')
d.text((20,20),'DÉCLIC',font=F(BR,40),fill='#C8F7CF'); im.save('/tmp/rd/declic.png')
# clock face (no hands, drawn live)
W=900; im=Image.new('RGB',(W,W),'#F3EFE7'); d=ImageDraw.Draw(im); c=W/2
for k in range(60):
    a=k/60*2*math.pi; r1=c*.9; r2=c*(.78 if k%5==0 else .85)
    d.line([(c+math.sin(a)*r1,c-math.cos(a)*r1),(c+math.sin(a)*r2,c-math.cos(a)*r2)],fill='#1E1E1E',width=14 if k%5==0 else 4)
d.text((c,c+c*.38),'Studio ES',font=F(UR,52),fill='#6B6B6B',anchor='mm')
im.save('/tmp/rd/clock.png')
print('ok')
