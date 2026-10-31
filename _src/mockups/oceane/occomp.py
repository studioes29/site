import sys; sys.path.insert(0,'/home/claude/mk'); from complib import *
ST='/home/claude/stock/'; F='/home/claude/oc/flats/'; O='/home/claude/oc/out'
w=sys.argv[1:] or ['tote','body','carte','poster']
def brightmask(path,thr=200,sat=40,k=15):
    im=cv2.imread(path); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY); h=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    m=((g>thr)&(h[...,1]<sat)).astype(np.uint8); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((k,k),np.uint8)); m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((7,7),np.uint8))
    return cv2.GaussianBlur(m.astype(np.float32),(0,0),1.2)[...,None]
if 'tote' in w:
    p=load(ST+'AdobeStock_366673336.jpeg')
    p=ink(p,F+'tote.png',[(970,1290),(1870,1290),(1874,1890),(966,1890)],0.95,0.2,0.7,disp=0.8); save(p,'oc_tote',O)
if 'body' in w:
    p=load(ST+'AdobeStock_460631977.jpeg')
    p=ink(p,F+'body.png',[(1310,830),(2090,830),(2092,1376),(1308,1376)],0.95,0.2,0.7,disp=1.0); save(p,'oc_body',O)
if 'carte' in w:
    f=ST+'AdobeStock_470073700.jpeg'; p=load(f)
    im=cv2.imread(f); h=cv2.cvtColor(im,cv2.COLOR_BGR2HSV); mk=(h[...,1]<40).astype(np.uint8); mk=cv2.morphologyEx(mk,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8)); mk=cv2.GaussianBlur(mk.astype(np.float32),(0,0),1.2)[...,None]
    p=paper(p,F+'carte.png',[(1619,228),(2602,548),(2134,1898),(1182,1561)],mask=mk); save(p,'oc_carte',O)
if 'poster' in w:
    f=ST+'AdobeStock_250448413.jpeg'; p=load(f)
    mk=brightmask(f,195,30); im=cv2.imread(f); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY); hs=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    low=((g>222)&(hs[...,1]<14)).astype(np.float32); low=cv2.morphologyEx(low,cv2.MORPH_OPEN,np.ones((9,9),np.uint8)); low=cv2.GaussianBlur(low,(0,0),1.2)[...,None]
    mk[1690:]=np.minimum(mk[1690:],low[1690:])
    p=paper(p,F+'poster.png',[(855,265),(2117,265),(2117,2010),(855,2010)],mask=mk); save(p,'oc_poster',O)
