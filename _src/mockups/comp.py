import numpy as np, cv2, sys
from PIL import Image
S='/tmp/claude-0/-home-claude/bcdc88ad-2961-5e7f-b276-c7accbe18194/scratchpad/'
def load(p): return cv2.imread(p).astype(np.float32)/255
def flat(k):
    a=np.array(Image.open('flats/%s.png'%k).convert('RGBA')).astype(np.float32)/255
    return cv2.cvtColor(a,cv2.COLOR_RGBA2BGRA)
def warp(d,quad,shape):
    h,w=d.shape[:2]; q=np.float32(quad)
    sc=np.linalg.norm(q[1]-q[0])/w
    if sc<1: d=cv2.GaussianBlur(d,(0,0),0.5/sc*0.6)
    # premultiply
    d=d.copy(); d[...,:3]*=d[...,3:4]
    M=cv2.getPerspectiveTransform(np.float32([[0,0],[w,0],[w,h],[0,h]]),q)
    o=cv2.warpPerspective(d,M,(shape[1],shape[0]),flags=cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)
    a=o[...,3:4]; rgb=np.where(a>1e-4,o[...,:3]/np.maximum(a,1e-4),0)
    return rgb,a
def lum(p): return (0.114*p[...,0]+0.587*p[...,1]+0.299*p[...,2])
def shade(photo,a,ref=None):
    L=lum(photo); 
    if ref is None: ref=np.percentile(L[a[...,0]>.9],96)
    return (L/ref)[...,None]
def quadmask(quad,shape,inset=0,feather=1.0):
    m=np.zeros(shape[:2],np.float32); cv2.fillConvexPoly(m,np.int32(np.round(np.float32(quad)*8)),1.0,lineType=cv2.LINE_AA,shift=3)
    if inset>0: m=cv2.erode(m,np.ones((3,3),np.uint8),iterations=int(inset))
    return cv2.GaussianBlur(m,(0,0),feather)[...,None]
def save(img,name,w=2400):
    img=np.clip(img,0,1); h=int(img.shape[0]*w/img.shape[1])
    o=cv2.resize(img,(w,h),interpolation=cv2.INTER_AREA)
    cv2.imwrite('out/%s.jpg'%name,(o*255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,92])
    cv2.imwrite(S+'c_%s.jpg'%name,(cv2.resize(o,(1200,int(h*1200/w)))*255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,88])
import os; os.makedirs('out',exist_ok=True)

def card(photo,k,quad,ref=None,gain=1.0,tint=0.0):
    rgb,a=warp(flat(k),quad,photo.shape); m=quadmask(quad,photo.shape)
    sh=shade(photo,m,ref)*gain
    if tint:
        L=lum(photo)[...,None]; cast=photo/np.maximum(L,1e-3)
        sh=sh*((1-tint)+tint*cast)
    # léger contraste du papier : on garde un peu des microdétails de la photo
    out=rgb*sh
    # grain du papier : détail fin de la photo, renforcé dans les aplats foncés
    L=lum(photo); hp=(L-cv2.GaussianBlur(L,(0,0),3))[...,None]
    dark=1-lum(rgb)[...,None]
    out=out+hp*(0.35+1.4*dark)
    return photo*(1-m)+out*m

def ink(photo,k,quad,color_strength=0.92,rough=0.18,blur=0.6,disp=0):
    rgb,a=warp(flat(k),quad,photo.shape)
    if disp:
        L=cv2.GaussianBlur(lum(photo),(0,0),6)
        gx=cv2.Sobel(L,cv2.CV_32F,1,0,ksize=5); gy=cv2.Sobel(L,cv2.CV_32F,0,1,ksize=5)
        h,w=L.shape; X,Y=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
        mx=X+disp*gx; my=Y+disp*gy
        rgb=cv2.remap(rgb,mx,my,cv2.INTER_LINEAR); a=cv2.remap(a,mx,my,cv2.INTER_LINEAR)
    a=cv2.GaussianBlur(a,(0,0),blur)[...,None] if a.ndim==2 else cv2.GaussianBlur(a[...,0],(0,0),blur)[...,None]
    # encre : grain du papier -> l'encre prend moins dans les creux clairs
    n=cv2.GaussianBlur(np.random.RandomState(1).rand(*photo.shape[:2]).astype(np.float32),(0,0),1.2)
    n=(n-n.mean())/n.std()
    a=np.clip(a*(1-rough*np.clip(n,0,3)/3)[...,None],0,1)*color_strength
    L=lum(photo); ref=np.median(L[a[...,0]>.3]) if (a>.3).any() else L.mean()
    out=rgb*(L/ref)[...,None]
    return photo*(1-a)+out*a

which=sys.argv[1:] or ['cartes','merci','fidelite','sac','pain']
if 'cartes' in which:
    p=load('AdobeStock_577531893.jpeg')
    p=card(p,'recto',[(1631,259),(2682,578),(2502,1161),(1440,828)],tint=0.5)
    p=card(p,'verso',[(1346,1096),(2406,1434),(2220,2029),(1152,1671)],tint=0.8)
    save(p,'cartes')
if 'merci' in which:
    p=load('AdobeStock_412678071.jpeg'); s=3.421
    q=[(1042,567),(2630,595),(2614,1669),(1023,1648)]
    p=card(p,'merci',q); save(p,'merci')
if 'fidelite' in which:
    p=load('AdobeStock_375393949.jpeg'); s=3.42
    q=[(1172,575),(2943,588),(2932,1831),(1163,1820)]
    p=card(p,'fidelite',q); save(p,'fidelite')
if 'sac' in which:
    p=load('AdobeStock_212740131.jpeg'); s=3.388
    # face avant du sac ; le logo occupe le milieu haut
    cx,cy,w=474*s,330*s,175*s; h=w*1.1
    q=[(cx-w/2,cy-h/2),(cx+w/2-3,cy-h/2-2),(cx+w/2-6,cy+h/2),(cx-w/2-4,cy+h/2)]
    p=ink(p,'sac',q); save(p,'sac')
if 'pain' in which:
    p=load('AdobeStock_402694190.jpeg'); s=3.421
    cx,cy,w=270*s,492*s,190*s
    q=[(cx-w/2,cy-w/2),(cx+w/2,cy-w/2+4),(cx+w/2-2,cy+w/2+4),(cx-w/2-2,cy+w/2)]
    p=ink(p,'tampon',q,0.97,0.22,0.7,disp=1.2); save(p,'pain')
