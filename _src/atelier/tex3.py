from PIL import Image, ImageDraw, ImageFont
import random
DJ='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def legends(path, W_m, H_m, cols, rows, x0, dx, y0, dy, cx, cy, labels, col, px=4000):
    W=px; H=int(px*H_m/W_m); im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    f=ImageFont.truetype(DJ,int(H*.075))
    for r,row in enumerate(labels):
        for c,t in enumerate(row):
            if not t: continue
            x=x0+c*dx; y=y0-r*dy
            u=(x-(cx-W_m/2))/W_m; v=1-(y-(cy-H_m/2))/H_m
            fs=f if len(t)<=2 else ImageFont.truetype(DJ,int(H*.042))
            d.text((u*W- dx/W_m*W*.3, v*H- dy/H_m*H*.32),t,font=fs,fill=col)
    im.save(path)
kw=.0223*19+.012
K=[['²','&','é','"',"'",'(','-','è','_','ç','à',')','=','⌫','','7','8','9','/'],
   ['⇥','A','Z','E','R','T','Y','U','I','O','P','^','$','↵','','4','5','6','*'],
   ['⇪','Q','S','D','F','G','H','J','K','L','M','ù','`','#','','1','2','3','-'],
   ['⇧','<','W','X','C','V','B','N',',',';',':','!','⇧','↑','','0','.','↵','+'],
   ['fn','ctrl','alt','cmd','','','','','','cmd','alt','←','↓','→','','','','','']]
legends('/tmp/rd/kb_leg.png',kw,.118,19,5,-kw/2+.0172,.0223,.043,.0215,0,0,K,(110,110,112,255))
L=[['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','⏻'],
   ['@','&','é','"',"'",'(','§','è','!','ç','à',')','-','⌫'],
   ['⇥','A','Z','E','R','T','Y','U','I','O','P','^','$','↵'],
   ['⇪','Q','S','D','F','G','H','J','K','L','M','ù','`',''],
   ['⇧','<','W','X','C','V','B','N',',',';',':','=','⇧',''],
   ['fn','ctrl','alt','cmd','','','','','','cmd','alt','←','↓','→']]
legends('/tmp/rd/lap_leg.png',.27,.1,14,6,-.1235,.019,.074,.0168,0,.032,L,(200,200,205,255))
# book spines
F=lambda s: ImageFont.truetype('/tmp/rd/br.ttf',s)
T=['Photographier la scène','Lumière naturelle','Grilles et mises en page','Concerts 2025','Bretagne','Typographie','Portraits','Couleur']
cols=['#2D3A33','#C9B9A0','#7A4A35','#E7DFD0','#1E1E1E','#B98A4E','#8E9A86','#2B2B2B']
for i,(t,c) in enumerate(zip(T,cols)):
    im=Image.new('RGB',(1200,160),c); d=ImageDraw.Draw(im); lum=sum(int(c[k:k+2],16) for k in (1,3,5))/3
    fg='#F4EFE6' if lum<140 else '#1E1E1E'; d.text((60,80),t,font=F(64),fill=fg,anchor='lm'); d.text((1140,80),'ES' if i%3==0 else '',font=F(48),fill=fg,anchor='rm')
    im.rotate(90,expand=True).save('/tmp/rd/spine%d.png'%i)
print('ok')
