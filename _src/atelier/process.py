import json, sys, os, numpy as np
from PIL import Image, ImageFilter
D=os.environ.get('FIN','/tmp/rd/fin'); O=os.environ.get('SORTIE','/home/claude/site/js/atelier/r'); os.makedirs(O,exist_ok=True)
ZC={'photo':[1],'web':[2,11],'graph':[3],'fill':[4],'contact':[5],'ecran':[11]}
for v,pre,meta in (('l','', '/tmp/rd/meta.json'),('p','p-','/tmp/rd/meta-p.json')):
    mp=f'{D}/{pre}mask.png'
    if not os.path.exists(mp): continue
    m=np.array(Image.open(mp).convert('L')).astype(float)
    f=lambda x:(1.055*x**(1/2.4)-.055)*255 if x>.0031308 else 12.92*x*255
    EX=np.array([f(i*20/255) for i in range(13)],float)
    ids=np.abs(m[...,None]-EX[None,None,:]).argmin(-1).astype(np.uint8)
    ids[m<66]=0
    im=Image.fromarray(ids).filter(ImageFilter.MedianFilter(5))
    ids=np.array(im)
    from scipy import ndimage
    for i in range(1,13):
        lab,n=ndimage.label(ids==i)
        if n:
            sz=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
            for k,v_ in enumerate(sz):
                if v_<900: ids[lab==k+1]=0
    im=Image.fromarray(ids)
    W,H=im.size
    # mask downscaled x0.5 nearest for weight
    small=im.resize((W//2,H//2),Image.NEAREST)
    Image.fromarray((np.array(small).astype(np.uint16)*20).clip(0,255).astype(np.uint8)).save(f'{O}/{v}-mask.png',optimize=True)
    Z={}
    for k,i in ZC.items():
        bm=Image.fromarray((np.isin(ids,i)*255).astype(np.uint8)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.MaxFilter(7))
        ys,xs=np.nonzero(np.array(bm)>0)
        if len(xs)<50: continue
        Z[k]=[round(float(np.percentile(xs,1))/W,4),round(float(np.percentile(ys,1))/H,4),round(float(np.percentile(xs,99))/W,4),round(float(np.percentile(ys,99))/H,4)]
    dp=Image.open(f'{D}/{pre}depth.png').convert('L').filter(ImageFilter.GaussianBlur(2)).resize((W//2,H//2),Image.BILINEAR)
    dp.save(f'{O}/{v}-depth.webp',quality=80)
    M=json.load(open(meta))
    out={k:[[p[0],p[1]] for p in M[k]] for k in ('mon_screen','ph_scr')}
    out['cibles']=M.get('cibles',{})
    if v=='l':
        out['lap_scr']=[[p[0],p[1]] for p in M['lap_scr']]
        cl={}
        for z,key in (('web','mon_screen'),('contact','ph_scr')):
            fp='/tmp/rd/meta-close-%s.json'%z
            if os.path.exists(fp): cl[z]={key:[[p[0],p[1]] for p in json.load(open(fp))[key]]}
        out['close']=cl; out['closeups']=any(f.startswith('c-') for f in os.listdir(D))
        if os.path.exists('/tmp/rd/meta-cat.json'): out['chat']=json.load(open('/tmp/rd/meta-cat.json'))
    out['tea']=M['tea'][:2]; out['zones']=Z
    out['poussiere']=[.03,.02,.48,.7] if v=='l' else [.0,.0,.5,.55]
    out['cadre']=[.54,.5] if v=='l' else [.52,.5]
    json.dump(out,open(f'{O}/{v}.json','w'))
    print(v,Z)
for f in sorted(os.listdir(D)):
    if f.startswith('c-') and f.endswith('.png'):
        Image.open(f'{D}/{f}').convert('RGB').save(f'{O}/{f[:-4]}.webp',quality=84,method=6); continue
    if f.startswith('cat-') and os.path.isdir(f'{D}/{f}'):
        fr=sorted(x for x in os.listdir(f'{D}/{f}') if x.endswith('.png'))
        if len(fr)<48: continue
        ims=[Image.open(f'{D}/{f}/{x}').convert('RGB') for x in fr[:48]]; w,h=ims[0].size; sh=Image.new('RGB',(w*8,h*6))
        for i,im in enumerate(ims): sh.paste(im,((i%8)*w,(i//8)*h))
        sh.save(f'{O}/l-chat-{f[4:]}.webp',quality=88,method=6); continue
    if f.endswith('.png') and 'mask' not in f and 'depth' not in f and not f.startswith('c-'):
        v='p' if f.startswith('p-') else 'l'; n=f[2:] if v=='p' else f
        Image.open(f'{D}/{f}').convert('RGB').save(f'{O}/{v}-{n[:-4]}.webp',quality=84,method=6)
os.system(f'ls -la {O}')
