import sys; sys.path.insert(0,'/home/claude/mk'); from complib import *
ST='/home/claude/stock/'; F='/home/claude/mm/flats/'; O='/home/claude/mm/out'
w=sys.argv[1:] or ['affiche','phone','depliant']
def bright(path,thr=215,sat=30,k=9):
    im=cv2.imread(path); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY); h=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    m=((g>thr)&(h[...,1]<sat)).astype(np.uint8); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((k,k),np.uint8))
    return cv2.GaussianBlur(m.astype(np.float32),(0,0),1.0)[...,None]
if 'affiche' in w:
    f=ST+'AdobeStock_280876458.jpeg'; p=load(f)
    p=paper(p,F+'a3.png',[(796,560),(1735,463),(1745,2032),(796,1984)],mask=bright(f,170,40),grain=False); save(p,'mm_affiche',O)
if 'phone' in w:
    f=ST+'AdobeStock_553163834.jpeg'; p=load(f)
    p=surface(p,F+'story.png',[(1445,428),(1945,428),(1945,1496),(1445,1496)],smooth=40,grain=0.05,clip=(0.97,1.03),mask=bright(f,200,30)); save(p,'mm_phone',O)
if 'depliant' in w:
    f=ST+'AdobeStock_937522065.jpeg'; p=load(f); mk=bright(f,175,25)
    p=paper(p,F+'dep_l.png',[(1811,1418),(2700,1406),(2700,2576),(1778,2543)],mask=mk,grain=False)
    k=5.625; P=lambda *pts:[(x*k,y*k) for x,y in pts]
    p=paper(p,F+'dep1_l.png',P((100,252),(205,138),(357,263),(252,383)),mask=mk,grain=False)
    p=paper(p,F+'dep1_r.png',P((205,138),(310,63),(463,183),(357,263)),mask=mk,grain=False)
    p=paper(p,F+'dep_r.png',[(2700,1406),(3572,1451),(3600,2599),(2700,2576)],mask=mk,grain=False); save(p,'mm_depliant',O)
