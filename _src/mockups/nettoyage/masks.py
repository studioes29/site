import cv2, numpy as np
from PIL import Image
A=(90,50,800,140); B=(25,28,805,80)
LOGO_A=(730,52,790,128)
J={'affiches-2':(A,'w'),'affiches-4':(A,'w'),'affiches-6':(A,'w'),'affiches-8':(A,'w'),'affiches-10':(A,'w'),'affiches-12':(A,'w'),'affiches-14':(A,'w'),
 'affiches-15':(B,'w'),'saisons-ellipse-8':(A,'w'),'saisons-ellipse-9':(A,'w'),'recrutement-1':(B,'w'),'recrutement-2':(B,'w'),'recrutement-3':(B,'w'),
 'jardin-3':(A,'w'),'creche-sig-4':(A,'k'),'creche-sig-6':(A,'k'),'fdm-4':(A,'w'),'fdm-2':(A,'k'),
 'saisons-ellipse-67':([(75,50,470,92),(584,42,624,102),(775,50,1170,92),(1284,42,1324,102)],'R'),
 'budget-2':(A,'w'),'zero-plastique-2':(A,'w'),'don-2':(A,'k'),'fdm-5':(A,'k'),'boucherie-2':(A,'k')}
HD=[(62,32,285,84),(522,32,725,84),(980,32,1155,84),(1436,32,1565,84)]
MAM={'b12':HD,'b2':HD,'b3':HD,'b4':HD,'b5':HD,'b9':HD,'cover':[(540,852,965,952)]}
RB=[(36,36,218,72),(370,36,442,72),(704,36,792,72)]
def load(n):
    if n.startswith('mam-'): return cv2.cvtColor(np.array(Image.open('orig/%s.webp'%n).convert('RGB')),cv2.COLOR_RGB2BGR)
    return cv2.imread('orig/%s.jpg'%n)
def txt(img,box,col,thr=22):
    x0,y0,x1,y1=box; r=img[y0:y1,x0:x1]
    L=cv2.cvtColor(r,cv2.COLOR_BGR2GRAY).astype(np.float32)
    bg=cv2.medianBlur(L.astype(np.uint8),31).astype(np.float32)
    if col=='w': m=(L-bg)>thr
    elif col=='k': m=(bg-L)>thr
    else: m=np.abs(L-bg)>thr
    m=m.astype(np.uint8)*255
    n,lab,st,_=cv2.connectedComponentsWithStats(m); keep=np.zeros_like(m)
    for i in range(1,n):
        x,y,w,h,a=st[i]
        if h<=60 and w<=220 and a>=3: keep[lab==i]=255
    M=np.zeros(img.shape[:2],np.uint8); M[y0:y1,x0:x1]=keep
    return M
def mask(n):
    img=load(n)
    if n.startswith('mam-'):
        M=np.zeros(img.shape[:2],np.uint8)
        for x0,y0,x1,y1 in MAM[n[4:]]: M[y0:y1,x0:x1]=255
    else:
        box,col=J[n]
        if col=='R':
            M=np.zeros(img.shape[:2],np.uint8)
            for x0,y0,x1,y1 in box: M[y0:y1,x0:x1]=255
        elif box==B:
            M=np.zeros(img.shape[:2],np.uint8)
            for x0,y0,x1,y1 in RB: M[y0:y1,x0:x1]=255
        else:
            M=txt(img,box,col)
            M=cv2.morphologyEx(M,cv2.MORPH_CLOSE,cv2.getStructuringElement(cv2.MORPH_RECT,(41,21)))
            M=cv2.dilate(M,cv2.getStructuringElement(cv2.MORPH_RECT,(9,7)))
            x0,y0,x1,y1=LOGO_A; M[y0:y1,x0:x1]=255
    M=cv2.dilate(M,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))
    return img,M
