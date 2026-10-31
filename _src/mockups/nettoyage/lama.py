import sys, cv2, numpy as np, torch
from masks import J, MAM, mask
S='/tmp/claude-0/-home-claude/bcdc88ad-2961-5e7f-b276-c7accbe18194/scratchpad/'
torch.set_num_threads(8)
M_=torch.jit.load('/root/.cache/torch/hub/checkpoints/big-lama.pt',map_location='cpu').eval()
def lama(img,M):
    # traite une bande autour du masque (plus rapide, même qualité)
    ys,xs=np.where(M>0); y0=max(0,ys.min()-120); y1=min(img.shape[0],ys.max()+120)
    sub=img[y0:y1]; m=M[y0:y1]
    h,w=sub.shape[:2]; ph=(8-h%8)%8; pw=(8-w%8)%8
    s=cv2.copyMakeBorder(sub,0,ph,0,pw,cv2.BORDER_REFLECT); mm=cv2.copyMakeBorder(m,0,ph,0,pw,cv2.BORDER_REFLECT)
    t=torch.from_numpy(cv2.cvtColor(s,cv2.COLOR_BGR2RGB)).permute(2,0,1)[None].float()/255
    tm=torch.from_numpy((mm>127).astype(np.float32))[None,None]
    with torch.no_grad(): o=M_(t,tm)[0].permute(1,2,0).numpy()
    o=cv2.cvtColor(np.clip(o*255,0,255).astype(np.uint8)[:h,:w],cv2.COLOR_RGB2BGR)
    a=cv2.GaussianBlur((m>127).astype(np.float32),(0,0),1.2)[...,None]
    out=img.copy(); out[y0:y1]=(sub*(1-a)+o*a).astype(np.uint8); return out,(y0,y1)
names=sys.argv[1:] or list(J)+['mam-'+k for k in MAM]
for n in names:
    img,M=mask(n)
    if n in ('mam-b2','mam-b3','mam-b5'):
        out=cv2.inpaint(img,M,9,cv2.INPAINT_TELEA); y0,y1=0,140
    else: out,(y0,y1)=lama(img,M)
    # zones unies : remplissage à la couleur exacte du pourtour
    k,lab=cv2.connectedComponents(M)
    for i in range(1,k):
        m=(lab==i).astype(np.uint8); ring=cv2.dilate(m,np.ones((15,15),np.uint8))-m
        px=img[ring>0]
        if px.std(0).max()<2.5: out[m>0]=np.median(px,0).astype(np.uint8)
    cv2.imwrite('res_%s.png'%n,out)
    cv2.imwrite(S+'lm_%s.jpg'%n,np.vstack([img[y0:y1],out[y0:y1]]))
    print(n,flush=True)
