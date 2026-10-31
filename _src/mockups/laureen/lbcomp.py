import numpy as np, cv2, sys
_ARGS=sys.argv[1:]; sys.argv=[sys.argv[0],'__none__']
exec(open('/home/claude/mk/comp.py').read().split("which=sys.argv")[0])
os.chdir('/home/claude/lb')
def flat(k):
    a=np.array(Image.open('flats/%s.png'%k).convert('RGBA')).astype(np.float32)/255
    return cv2.cvtColor(a,cv2.COLOR_RGBA2BGRA)
def surface(photo,k,quad,smooth=5,grain=0.6,keep=None,tint=0.0):
    """remplace une surface (sombre ou claire) : ombrage = luminance lissée / médiane de la surface"""
    rgb,a=warp(flat(k),quad,photo.shape); m=quadmask(quad,photo.shape)
    if keep is not None: m=m*(1-keep)
    L=lum(photo); Ls=cv2.GaussianBlur(L,(0,0),smooth)
    ref=np.median(Ls[m[...,0]>.9]); sh=(Ls/ref)[...,None]
    sh=np.clip(sh,0.5,1.35)
    hp=(L-cv2.GaussianBlur(L,(0,0),2.5))[...,None]
    out=rgb*sh+hp*grain
    if tint:
        cast=photo/np.maximum(L[...,None],1e-3); out=out*((1-tint)+tint*cast)
    a=a*m if a.shape[-1]==1 else m
    return photo*(1-m)+out*m
import os; os.makedirs('out',exist_ok=True)
ST='/home/claude/stock/'
w=sys.argv[2:] if len(sys.argv)>2 else ['plaque','carte','plat']
def run(which):
    if 'plaque' in which:
        p=load(ST+'AdobeStock_669386320.jpeg')
        p=surface(p,'plaque',[(1836,430),(2685,270),(2680,1128),(1832,1146)],smooth=4,grain=0.5)
        save(p,'lb_plaque')
        p=load(ST+'AdobeStock_669386320.jpeg'); p=surface(p,'plaque_b',[(1836,430),(2685,270),(2680,1128),(1832,1146)],smooth=4,grain=0.5); save(p,'lb_plaque_b')
    if 'carte' in which:
        p=load(ST+'AdobeStock_455230401.jpeg')
        p=surface(p,'carte_noire',[(603,1029),(1794,252),(2306,834),(1098,1632)],smooth=6,grain=0.9)
        save(p,'lb_carte')
    if 'plat' in which:
        p=load(ST+'AdobeStock_239458609.jpeg')
        # carnet : la couverture en pétrole, l'élastique reste blanc
        q=[(326,406),(1196,406),(1198,1764),(326,1764)]
        keep=np.zeros(p.shape[:2],np.float32); keep[:,968:1018]=1; keep=cv2.GaussianBlur(keep,(0,0),1.5)[...,None]
        p=surface(p,'carnet',q,smooth=8,grain=0.4,keep=keep)
        p=surface(p,'carte_teal',[(1476,411),(2082,414),(2082,751),(1470,750)],smooth=6,grain=0.4)
        p=card(p,'carte_blanche',[(2409,1570),(3026,1587),(3023,1927),(2401,1911)])
        p=card(p,'bloc',[(2376,560),(3078,568),(3069,1459),(2357,1449)])
        save(p,'lb_plat')
import sys as _s
run(_ARGS or ['plaque','carte','plat'])
