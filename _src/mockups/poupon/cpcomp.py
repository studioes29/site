import sys; sys.path.insert(0,'/home/claude/mk'); from complib import *
import math
ST='/home/claude/stock/'; F='/home/claude/cp/flats/'; O='/home/claude/cp/out'
w=sys.argv[1:] or ['van','polo']
if 'van' in w:
    p=load(ST+'AdobeStock_683691571.jpeg')
    p=ink(p,F+'van.png',[(2250,1118),(2905,1106),(2907,1318),(2250,1330)],0.97,0.05,0.6); save(p,'cp_van',O)
if 'polo' in w:
    p=load(ST+'AdobeStock_490250950.jpeg')
    cx,cy,s,ang=2045,935,215,math.radians(-27)
    pts=[(-1,-1),(1,-1),(1,1),(-1,1)]
    q=[(cx+s/2*(x*math.cos(ang)-y*math.sin(ang)),cy+s/2*(x*math.sin(ang)+y*math.cos(ang))) for x,y in pts]
    rgb,a=warp(flat(F+'polo.png'),q,p.shape); a=cv2.GaussianBlur(a.reshape(a.shape[:2]),(0,0),0.7)[...,None]*0.93
    L=lum(p); Ls=cv2.GaussianBlur(L,(0,0),3); ref=np.median(Ls[a[...,0]>.3]); sh=np.clip(Ls/ref,0.6,1.3)[...,None]
    out=rgb*sh*0.95
    p=p*(1-a)+out*a; save(p,'cp_polo',O)
