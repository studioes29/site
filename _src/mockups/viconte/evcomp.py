import sys; sys.path.insert(0,'/home/claude/mk'); from complib import *
ST='/home/claude/stock/'; F='/home/claude/ev/flats/'; O='/home/claude/ev/out'
w=sys.argv[1:] or ['pola','tirages','carte','tote']
if 'pola' in w:
    p=load(ST+'AdobeStock_341728960.jpeg')
    p=surface(p,F+'tirage_face.png',[(758,699),(1733,628),(1805,1618),(833,1686)],smooth=30,grain=0.15,clip=(0.85,1.2))
    p=ink(p,F+'marge.png',[(840,1690),(1807,1622),(1823,1855),(856,1925)],0.95,0.1,0.5)
    save(p,'ev_pola',O)
if 'tirages' in w:
    p=load(ST+'AdobeStock_289440194.jpeg')
    p=surface(p,F+'tirage_boy.png',[(1375,327),(2176,211),(2258,776),(1457,894)],smooth=30,grain=0.15,clip=(0.85,1.2))
    p=surface(p,F+'tirage_logo.png',[(2453,690),(3258,786),(3189,1354),(2385,1257)],smooth=120,grain=0.25,clip=(0.94,1.06))
    p=surface(p,F+'tirage_post4.png',[(1666,1500),(2473,1431),(2522,2002),(1714,2071)],smooth=30,grain=0.15,clip=(0.85,1.2))
    save(p,'ev_tirages',O)
if 'carte' in w:
    p=load(ST+'AdobeStock_386915475.jpeg')
    im=cv2.imread(ST+'AdobeStock_386915475.jpeg'); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY); hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    mk=((g>150)&(hsv[...,1]<50)).astype(np.uint8)*255; mk=cv2.morphologyEx(mk,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(mk); big=1+np.argmax(st[1:,4]); mk=(lab==big).astype(np.float32)
    mk=cv2.morphologyEx(mk,cv2.MORPH_CLOSE,np.ones((15,15),np.uint8)); mk=cv2.GaussianBlur(mk,(0,0),1.2)[...,None]
    p=paper(p,F+'carte_bleue.png',[(703,705),(2256,759),(2228,1715),(665,1659)],mask=mk)
    save(p,'ev_carte',O)
if 'tote' in w:
    p=load(ST+'AdobeStock_213062022.jpeg')
    p=ink(p,F+'tote.png',[(585,1560),(1675,1560),(1685,2650),(575,2650)],0.95,0.25,0.8,disp=1.0)
    save(p,'ev_tote',O)
