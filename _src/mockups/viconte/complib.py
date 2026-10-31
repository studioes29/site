import numpy as np, cv2, os
from PIL import Image
S='/tmp/claude-0/-home-claude/bcdc88ad-2961-5e7f-b276-c7accbe18194/scratchpad/'
def load(p): return cv2.imread(p).astype(np.float32)/255
def flat(path):
    a=np.array(Image.open(path).convert('RGBA')).astype(np.float32)/255
    return cv2.cvtColor(a,cv2.COLOR_RGBA2BGRA)
def warp(d,quad,shape):
    h,w=d.shape[:2]; q=np.float32(quad)
    sc=np.linalg.norm(q[1]-q[0])/w
    if sc<1: d=cv2.GaussianBlur(d,(0,0),0.5/sc*0.6)
    d=d.copy(); d[...,:3]*=d[...,3:4]
    M=cv2.getPerspectiveTransform(np.float32([[0,0],[w,0],[w,h],[0,h]]),q)
    o=cv2.warpPerspective(d,M,(shape[1],shape[0]),flags=cv2.INTER_LINEAR)
    a=o[...,3:4]; rgb=np.where(a>1e-4,o[...,:3]/np.maximum(a,1e-4),0)
    return rgb,a
def lum(p): return 0.114*p[...,0]+0.587*p[...,1]+0.299*p[...,2]
def quadmask(quad,shape,feather=1.0):
    m=np.zeros(shape[:2],np.float32); cv2.fillConvexPoly(m,np.int32(np.round(np.float32(quad)*8)),1.0,lineType=cv2.LINE_AA,shift=3)
    return cv2.GaussianBlur(m,(0,0),feather)[...,None]
def paper(photo,fl,quad,tint=0.0,mask=None,grain=True):
    """papier clair : ombrage = luminance / blanc de référence"""
    rgb,a=warp(flat(fl),quad,photo.shape); m=quadmask(quad,photo.shape)
    if mask is not None: m=m*mask
    L=lum(photo); ref=np.percentile(L[m[...,0]>.9],96); sh=(L/ref)[...,None]
    if tint: sh=sh*((1-tint)+tint*photo/np.maximum(L[...,None],1e-3))
    out=rgb*sh
    if grain:
        hp=(L-cv2.GaussianBlur(L,(0,0),3))[...,None]; out=out+hp*(0.35+1.4*(1-lum(rgb)[...,None]))
    return photo*(1-m)+out*m
def surface(photo,fl,quad,smooth=6,grain=0.5,clip=(0.5,1.35),mask=None):
    """surface quelconque : ombrage = luminance lissée / médiane de la surface"""
    rgb,a=warp(flat(fl),quad,photo.shape); m=quadmask(quad,photo.shape)
    if mask is not None: m=m*mask
    L=lum(photo); mm=(m[...,0]>.5).astype(np.float32)
    Ls=cv2.GaussianBlur(L*mm,(0,0),smooth)/np.maximum(cv2.GaussianBlur(mm,(0,0),smooth),1e-4); ref=np.median(Ls[m[...,0]>.9])
    sh=np.clip(Ls/ref,*clip)[...,None]; hp=(L-cv2.GaussianBlur(L,(0,0),2.5))[...,None]
    out=rgb*sh+hp*grain
    return photo*(1-m)+out*m
def ink(photo,fl,quad,strength=0.92,rough=0.18,blur=0.6,disp=0):
    rgb,a=warp(flat(fl),quad,photo.shape)
    if disp:
        L=cv2.GaussianBlur(lum(photo),(0,0),6); gx=cv2.Sobel(L,cv2.CV_32F,1,0,ksize=5); gy=cv2.Sobel(L,cv2.CV_32F,0,1,ksize=5)
        h,w=L.shape; X,Y=np.meshgrid(np.arange(w,dtype=np.float32),np.arange(h,dtype=np.float32))
        rgb=cv2.remap(rgb,X+disp*gx,Y+disp*gy,cv2.INTER_LINEAR); a=cv2.remap(a,X+disp*gx,Y+disp*gy,cv2.INTER_LINEAR)
    a=cv2.GaussianBlur(a.reshape(a.shape[:2]),(0,0),blur)[...,None]
    n=cv2.GaussianBlur(np.random.RandomState(1).rand(*photo.shape[:2]).astype(np.float32),(0,0),1.2); n=(n-n.mean())/n.std()
    a=np.clip(a*(1-rough*np.clip(n,0,3)/3)[...,None],0,1)*strength
    L=lum(photo); ref=np.median(L[a[...,0]>.3]) if (a>.3).any() else L.mean()
    out=rgb*(L/ref)[...,None]
    return photo*(1-a)+out*a
def save(img,name,outdir,w=2400):
    os.makedirs(outdir,exist_ok=True)
    img=np.clip(img,0,1); h=int(img.shape[0]*w/img.shape[1]); o=cv2.resize(img,(w,h),interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(outdir,name+'.jpg'),(o*255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,92])
    cv2.imwrite(S+'c_%s.jpg'%name,(cv2.resize(o,(1200,int(h*1200/w)))*255).astype(np.uint8),[cv2.IMWRITE_JPEG_QUALITY,88])
