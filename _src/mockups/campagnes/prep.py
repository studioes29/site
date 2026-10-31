import cv2, numpy as np, torch, glob, os, sys
torch.set_num_threads(8)
M_=torch.jit.load('/root/.cache/torch/hub/checkpoints/big-lama.pt',map_location='cpu').eval()
def lama(img,M):
    ys,xs=np.where(M>0); y0=max(0,ys.min()-160); y1=min(img.shape[0],ys.max()+160)
    sub=img[y0:y1]; m=M[y0:y1]; h,w=sub.shape[:2]; ph=(8-h%8)%8; pw=(8-w%8)%8
    s=cv2.copyMakeBorder(sub,0,ph,0,pw,cv2.BORDER_REFLECT); mm=cv2.copyMakeBorder(m,0,ph,0,pw,cv2.BORDER_REFLECT)
    t=torch.from_numpy(cv2.cvtColor(s,cv2.COLOR_BGR2RGB)).permute(2,0,1)[None].float()/255
    tm=torch.from_numpy((mm>127).astype(np.float32))[None,None]
    with torch.no_grad(): o=M_(t,tm)[0].permute(1,2,0).numpy()
    o=cv2.cvtColor(np.clip(o*255,0,255).astype(np.uint8)[:h,:w],cv2.COLOR_RGB2BGR)
    a=cv2.GaussianBlur((m>127).astype(np.float32),(0,0),1.5)[...,None]
    out=img.copy(); out[y0:y1]=(sub*(1-a)+o*a).astype(np.uint8)
    k,lab=cv2.connectedComponents(M)
    for i in range(1,k):
        mm_=(lab==i).astype(np.uint8); ring=cv2.dilate(mm_,np.ones((15,15),np.uint8))-mm_; px=img[ring>0]
        sd=px.std(0).max()
        if sd<2.5: out[mm_>0]=np.median(px,0).astype(np.uint8)
        elif sd<12:
            tl=cv2.inpaint(img,cv2.dilate(mm_,np.ones((3,3),np.uint8))*255,15,cv2.INPAINT_TELEA)
            g=np.random.default_rng(0).normal(0,min(sd*0.15,1.2),img.shape).astype(np.float32)
            tl=np.clip(tl.astype(np.float32)+g,0,255).astype(np.uint8)
            out[mm_>0]=tl[mm_>0]
    return out
def mask1080(img):
    M=np.zeros(img.shape[:2],np.uint8); M[82:138,112:822]=255; M[64:156,902:960]=255
    return M
def maskrec(img):
    s=img.shape[1]/825; M=np.zeros(img.shape[:2],np.uint8)
    for x0,y0,x1,y1 in [(36,36,218,72),(370,36,442,72),(704,36,792,72)]: M[int(y0*s):int(y1*s),int(x0*s):int(x1*s)]=255
    return M
for f in sorted(glob.glob('src/*/*')):
    d,b=f.split('/')[1:]; out='clean/%s/%s.png'%(d,os.path.splitext(b)[0]); os.makedirs('clean/'+d,exist_ok=True)
    if os.path.exists(out): continue
    img=cv2.imread(f)
    if d=='campagnes-de-recrutement':
        sm=cv2.resize(img,(1500,2000),interpolation=cv2.INTER_AREA); M=maskrec(sm); r=lama(sm,M)
    elif b.startswith('1.') or 'reel' in d: r=img
    else: r=lama(img,mask1080(img))
    cv2.imwrite(out,r); print(out,flush=True)
