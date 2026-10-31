"""Études de cas des campagnes : images (depuis /home/claude/camp/clean), pages, cartes du nuancier."""
import os, re, html, json
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
R='/home/claude/site/'; C='/home/claude/camp/'
NB=lambda t:t.replace(' :',' :').replace(' ;',' ;').replace(' ?',' ?').replace(' !',' !').replace('« ','« ').replace(' »',' »')
def src(p):
    p=C+'clean/'+p+'.png'
    return Image.open(p).convert('RGB')
def spread(*ps):
    ims=[src(p) for p in ps]; h=min(i.height for i in ims)
    ims=[i.resize((round(i.width*h/i.height),h)) for i in ims]
    W=Image.new('RGB',(sum(i.width for i in ims),h)); x=0
    for i in ims: W.paste(i,(x,0)); x+=i.width
    return W
def rec(n,box): return Image.open(C+'src/campagnes-de-recrutement/Post Insta_%d.jpg'%n).convert('RGB').crop(box)
def stories(files,bg):
    ims=[Image.open(C+'clean/ads-1-reel---1-story/%s.png'%f).convert('RGB') for f in files]
    w,h=520,924; g=40; W=Image.new('RGB',(g+len(ims)*(w+g),h+2*g),bg)
    from PIL import ImageDraw
    for k,i in enumerate(ims):
        t=i.resize((w,h),Image.LANCZOS); m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),28,fill=255)
        W.paste(t,(g+k*(w+g),g),m)
    return W
def fit(im,maxw=1400):
    if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    return im
def cover(im,W,H,fx=.5,fy=.5):
    s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x=round((im.width-W)*fx); y=round((im.height-H)*fy); return im.crop((x,y,x+W,y+H))

P=[]
def proj(**k): P.append(k)

proj(slug='saisons-ellipse', nom='L’Ellipse', se='Une image par saison.', k=['Campagne','Saison culturelle'],
 client='Pôle culturel l’Ellipse, Ville de Moëlan-sur-Mer', inter='Affiches, grand format, brochures, programmes, kakémono, réseaux sociaux',
 ctx='Le pôle culturel de Moëlan-sur-Mer présente chaque année sa programmation. À chaque saison son image, déclinée de l’affiche à la brochure.',
 pc=('#1E2B45','#E0457B'), card='#E0457B',
 img={'s23':lambda:src('saison-23-24--1-post/1'),'s23b':lambda:src('saison-23-24--1-post/2'),
      's24':lambda:spread('saison-24-25--1-post/4','saison-24-25--1-post/5'),'s24a':lambda:src('saison-24-25--1-post/1'),
      's24b':lambda:src('saison-24-25--1-post/2'),'s24c':lambda:src('saison-24-25--1-post/3'),
      's25':lambda:src('saison-culturelle-2025-2026/1'),'s25b':lambda:src('saison-culturelle-2025-2026/2'),
      's25c':lambda:src('saison-culturelle-2025-2026/3'),'s25d':lambda:src('saison-culturelle-2025-2026/4')},
 cov=('s24',.5,.5), sq=('s24a',.5,.4),
 ch=[('Saison 2023-2024','Le lapin en veste rouge','Un fond rose franc, un lapin à lunettes dans une veste rouge et le nom de l’Ellipse en capitales étroites. L’affiche passe au grand format, au kakémono et à la couverture de la brochure.',
      [('s23',0,'L’affiche de la saison 2023-2024 de l’Ellipse'),('s23b',0,'La saison 2023-2024 en grand format, en kakémono et en brochure')]),
     ('Saison 2024-2025','La tête dans les nuages','Un enfant, les yeux fermés, dont la tête se mêle aux nuages. L’image tient en vitrine comme en panneau grand format ; la brochure et les visuels de chaque rendez-vous reprennent la même grille.',
      [('s24',1,'Le visuel de la saison 2024-2025 en panneau grand format'),('s24a',0,'Les affiches de la saison 2024-2025 en vitrine'),('s24b',0,'La brochure et les visuels des rendez-vous'),('s24c',0,'Le programme de la saison 2024-2025')]),
     ('Saison 2025-2026','Le portrait et la fleur','Un portrait de femme traversé de ciel, une fleur jaune et le nom de l’Ellipse en capitales condensées : le visuel occupe un panneau d’affichage, la brochure, le programme et le kakémono.',
      [('s25',0,'Le visuel de la saison 2025-2026 sur un panneau d’affichage'),('s25d',0,'Le kakémono de la saison 2025-2026'),('s25b',0,'La brochure de la saison 2025-2026'),('s25c',0,'Le programme de la saison 2025-2026')])],
 liv=[('s23','Affiche 2023-2024','Le lapin en veste rouge.'),('s24a','Affiche 2024-2025','En vitrine.'),('s24','Grand format','La saison 2024-2025.'),('s25','Panneau 2025-2026','Le portrait et la fleur.'),('s25d','Kakémono','Saison 2025-2026.'),('s25b','Brochures','La programmation.')])

proj(slug='campagnes-de-recrutement', nom='Campagnes de recrutement', se='Un métier, une phrase.', k=['Campagne','Recrutement'],
 client='Ville de Moëlan-sur-Mer', inter='Affiches, visuels web, réseaux sociaux',
 ctx='La Ville de Moëlan-sur-Mer recrute toute l’année. Chaque poste a sa campagne : une phrase qui part d’un angle du métier, une image qui la prolonge.',
 pc=('#1F1D1A','#C9D84A'), card='#3A3631',
 img={'r3':lambda:src('campagnes-de-recrutement/Post Insta_3'),'r4':lambda:src('campagnes-de-recrutement/Post Insta_4'),'r5':lambda:src('campagnes-de-recrutement/Post Insta_5'),
      'p1':lambda:rec(3,(1485,2175,2880,4110)),'p2':lambda:rec(4,(1565,2175,2860,4030)),'p3':lambda:rec(5,(1475,2050,2880,4005)),'p4':lambda:rec(4,(2975,2175,4290,4030))},
 cov=('r3',.5,.42), sq=('p1',.5,.85),
 ch=[('Partir du métier','pour le regarder autrement','Agent des espaces verts, ATSEM, chargé(e) d’accueil à la médiathèque : chaque affiche prend un détail du poste et le retourne en une phrase. « Les chantiers de demain commencent à la maternelle. »',
      [('r3',0,'Trois affiches de recrutement sur un mur de briques'),('r4',0,'Trois affiches de recrutement le long d’un mur de béton')]),
     ('Une série','qui se reconnaît','Même typographie, même place pour la phrase et la mention du poste en dessous : d’une campagne à l’autre, la série reste lisible comme un ensemble.',
      [('r5',0,'Trois affiches de recrutement sous un auvent'),('p1',0,'L’affiche de recrutement d’un(e) ATSEM')]),
     ('Les affiches','une à une','« Pour notre chantier le plus important, on cherche les bons piliers. » « S’occuper de la route, c’est s’occuper de ceux qui l’empruntent. » La photographie porte le métier, la phrase porte l’idée.',
      [('p2',0,'L’affiche de recrutement du centre technique municipal'),('p3',0,'L’affiche de recrutement d’un agent d’exploitation du patrimoine routier'),('p4',0,'L’affiche de recrutement du responsable de la crèche'),]),],
 liv=[('p1','ATSEM','Les chantiers de demain.'),('p2','Centre technique','Les bons piliers.'),('p3','Patrimoine routier','Ceux qui l’empruntent.'),('p4','Petite enfance','Faire grandir une équipe.'),('r3','Affichage','La série en situation.')])

proj(slug='budget-participatif', nom='Budget participatif', se='Cette année, vous montez aussi à bord.', k=['Campagne','Participation citoyenne'],
 client='Ville de Moëlan-sur-Mer', inter='Affiches, grand format, abribus, documents du dispositif, réseaux sociaux, communiqué de presse',
 ctx='Le budget participatif de Moëlan-sur-Mer invite les habitants à proposer des projets pour leur commune, puis à voter. Deux éditions, deux campagnes.',
 pc=('#1D3E5E','#F4E01B'), card='#E8D41A',
 img={'b24':lambda:spread('budget-participatif-24--1-post/4','budget-participatif-24--1-post/5'),'b24a':lambda:src('budget-participatif-24--1-post/1'),
      'b24b':lambda:spread('budget-participatif-24--1-post/2','budget-participatif-24--1-post/3'),'b24c':lambda:spread('budget-participatif-24--1-post/6','budget-participatif-24--1-post/7'),
      'b25':lambda:src('budget-participatif-25--1-post/1'),'b25b':lambda:spread('budget-participatif-25--1-post/2','budget-participatif-25--1-post/3')},
 cov=('b24',.5,.5), sq=('b24a',.5,.45),
 ch=[('Première édition','tout le monde à bord','Une famille dans un bateau en papier, au bord de l’eau, et le jaune du budget participatif. L’image appelle à déposer un projet jusqu’au 15 juin 2024, du panneau grand format à l’affiche.',
      [('b24',1,'Le visuel du budget participatif 2024 en grand format'),('b24a',0,'Les affiches du budget participatif 2024')]),
     ('Du dépôt','au vote','Documents du dispositif, projets soumis au vote présentés un par un, affichage urbain et communiqué de presse : chaque support reprend le jaune, la photographie et le logo du dispositif.',
      [('b24b',1,'Les documents du dispositif et les projets soumis au vote'),('b24c',1,'Les supports de la campagne 2024 réunis')]),
     ('L’édition suivante','et si c’était vous ?','Des commentaires encadrés comme sur un réseau social, posés sur un mur blanc, et une question : « Et si cette fois, c’était vous qui décidiez ? » L’affiche tient dans un abribus comme dans un fil d’actualité.',
      [('b25',0,'L’affiche du budget participatif 2025 dans un abribus'),('b25b',1,'Les visuels réseaux sociaux du budget participatif 2025')])],
 liv=[('b24a','Affiche 2024','Vous montez aussi à bord.'),('b24','Grand format','Déposer un projet.'),('b24b','Projets soumis au vote','Un par un.'),('b25','Affiche 2025','Et si c’était vous ?'),('b25b','Réseaux sociaux','Les commentaires encadrés.')])

proj(slug='objectif-zero-plastique', nom='Objectif zéro plastique', se='N’est-elle pas plus belle au naturel ?', k=['Campagne','Environnement'],
 client='Ville de Moëlan-sur-Mer', inter='Affiche, affichage urbain',
 ctx='Une opération de nettoyage le samedi 5 avril 2025 : l’affiche invite chacun à trouver le point de rendez-vous le plus proche de chez lui.',
 pc=('#1B3F73','#9CC3E6'), card='#24508F',
 img={'z1':lambda:src('objectif-zero-plastique--1-post/1'),'z2':lambda:src('objectif-zero-plastique--1-post/2')},
 cov=('z2',.5,.45), sq=('z1',.5,.5),
 ch=[('Un paysage','et ce qu’on y laisse','La côte, l’eau, une île au loin et, au premier plan, un tas de bouteilles en plastique. La question en haut de l’affiche laisse l’image faire le reste.',
      [('z1',0,'L’affiche Objectif zéro plastique dans la rue'),('z2',0,'L’affiche Objectif zéro plastique')])],
 liv=[('z2','Affiche','Plus belle au naturel.'),('z1','Affichage urbain','En situation.')])

proj(slug='don-d-organes', nom='Don d’organes et de sang', se='Elle vous donnerait son cœur… et vous ?', k=['Campagne','Sensibilisation'],
 client='Ville de Moëlan-sur-Mer', inter='Affiches, affichage urbain',
 ctx='Une journée dédiée à la sensibilisation au don d’organes et de sang, à Moëlan-sur-Mer.',
 pc=('#3B2B22','#E0383E'), card='#E0383E',
 img={'d1':lambda:src('don-d-organes--1-post/1'),'d2':lambda:src('don-d-organes--1-post/2')},
 cov=('d2',.5,.55), sq=('d2',.5,.55),
 ch=[('Un geste','à hauteur d’enfant','Une petite fille cache un cœur en papier dans son dos, sa mère en arrière-plan. La question vient ensuite, en capitales, avec les derniers mots sur fond rouge.',
      [('d2',0,'L’affiche de la journée du don d’organes et de sang'),('d1',0,'Les affiches en série sous un auvent')])],
 liv=[('d2','Affiche','Elle vous donnerait son cœur.'),('d1','Affichage urbain','En série.')])

proj(slug='ete-sportif', nom='Été sportif', se='La tête dans le guidon, même en vacances.', k=['Campagne','Animations sportives'],
 client='Ville de Moëlan-sur-Mer', inter='Affiches, réseaux sociaux',
 ctx='Le programme des animations sportives de l’été à Moëlan-sur-Mer, annoncé par une série d’affiches avec un QR code vers le programme.',
 pc=('#2F3B33','#F2B544'), card='#6E9E62',
 img={'e1':lambda:src('ete-sportif--1-post/1'),'e2':lambda:spread('ete-sportif--1-post/2','ete-sportif--1-post/3')},
 cov=('e2',.5,.5), sq=('e1',.5,.5),
 ch=[('L’humour','en accroche','« La piémontaise à midi, c’était peut-être pas l’idée du siècle… » « On a hâte de s’ambiancer sur le HIIT de l’été ! » Chaque affiche associe une phrase du quotidien à une photographie d’effort et à une forme de couleur.',
      [('e2',1,'Les trois affiches de l’été sportif le long d’une grille'),('e1',0,'L’affiche « La piémontaise à midi »')])],
 liv=[('e1','Affiche','La piémontaise à midi.'),('e2','Affichage','Les trois affiches.')])

proj(slug='festin-d-mouettes', nom='Fest’in d’mouettes', se='Une mouette, trois étés.', k=['Campagne','Festival'],
 client='Ville de Moëlan-sur-Mer', inter='Affiches, grand format, bâche, programmes, bracelets, sous-bocks, coloriage, réseaux sociaux',
 ctx='Le festival d’été de Moëlan-sur-Mer, concerts et animations en plein air. Depuis 2023, la même mouette change de tenue à chaque édition.',
 pc=('#0E5A78','#E5397B'), card='#E5397B',
 img={'f23':lambda:src('fest-in-23--1-post/1'),'f23b':lambda:src('fest-in-23--1-post/3'),'f23c':lambda:spread('fest-in-23--1-post/4','fest-in-23--1-post/5'),'f23d':lambda:src('fest-in-23--1-post/2'),
      'f24':lambda:src('fest-in-24--1-post/1'),'f24b':lambda:src('fest-in-24--1-post/2'),'f24c':lambda:src('fest-in-24--1-post/3'),
      'f25':lambda:src('fdm-2025/1'),'f25b':lambda:spread('fdm-2025/5','fdm-2025/6'),'f25c':lambda:spread('fdm-2025/2','fdm-2025/3'),'f25d':lambda:src('fdm-2025/7'),
      'f25e':lambda:cover(src('fdm-2025/4').crop((0,170,1080,1350)),1080,1350,.5,.5)},
 cov=('f25b',.5,.5), sq=('f23',.5,.4),
 ch=[('2023','La mouette au casque','Un titre en lettres hautes, rose et jaune, et une mouette au casque audio sur fond bleu. L’affiche se décline en grand format, en panneau directionnel et sur les réseaux sociaux.',
      [('f23c',1,'Le visuel 2023 en grand format sur une palissade'),('f23',0,'L’affiche 2023 sur un mur bleu'),('f23b',0,'Le panneau directionnel du festival'),('f23d',0,'Les publications 2023 sur un mur bleu')]),
     ('2024','Sous les lumières','La mouette passe aux lunettes de soleil, devant les lumières d’une scène. L’affiche et le programme tiennent sur un panneau, un flyer et un écran de téléphone.',
      [('f24',0,'L’affiche 2024 sur un panneau'),('f24c',0,'L’affiche et le programme 2024'),('f24b',0,'Le panneau grand format et le flyer 2024')]),
     ('2025','À la carte','Le festival se lit comme un menu : apéro, entrée, plat, dessert, digestif. La mouette en foulard sert la programmation sur la bâche, les publications, le programme, les bracelets, les sous-bocks et un coloriage pour les enfants.',
      [('f25b',1,'La bâche 2025 et la programmation'),('f25',0,'L’affiche 2025 sur un panneau'),('f25e',0,'Les publications 2025 sur téléphone'),('f25c',1,'Bracelet, sous-bock et programme 2025'),('f25d',0,'Le coloriage 2025')])],
 liv=[('f23','Affiche 2023','La mouette au casque.'),('f24','Affiche 2024','Sous les lumières.'),('f25','Affiche 2025','À la carte.'),('f25b','Bâche','La programmation 2025.'),('f25c','Bracelets et sous-bocks','Pour les soirs de concert.'),('f25d','Coloriage','Pour les enfants.')])

proj(slug='voeux-2025', nom='Vœux 2025', se='L’année dans les nuages.', k=['Campagne','Vœux'],
 client='Ville de Moëlan-sur-Mer', inter='Carte de vœux, visuels web et réseaux sociaux',
 ctx='La carte de vœux de la Ville de Moëlan-sur-Mer pour 2025 et ses déclinaisons.',
 pc=('#1D4F9A','#8EC1F0'), card='#3B6DB5',
 img={'v1':lambda:src('voeux-2025--1-post/1'),'v2':lambda:src('voeux-2025--1-post/2'),'v3':lambda:spread('voeux-2025--1-post/3','voeux-2025--1-post/4')},
 cov=('v3',.5,.6), sq=('v1',.5,.35),
 ch=[('Une image','et un chiffre','Une jeune femme assise au sommet d’un dôme d’escalade regarde le ciel, où les nuages dessinent 2025. La carte s’ouvre sur le message des vœux.',
      [('v1',0,'Le visuel des vœux 2025'),('v2',0,'La carte de vœux 2025, fermée et ouverte'),('v3',1,'Le visuel des vœux 2025 en largeur')])],
 liv=[('v1','Visuel','Les nuages de 2025.'),('v2','Carte de vœux','Fermée et ouverte.'),('v3','Format large','Le ciel et le dôme.')])

proj(slug='boucherie-les-fistons', nom='Boucherie Les Fistons', se='Des côtes à tomber.', k=['Campagne','Commerce'],
 client='Boucherie Les Fistons', inter='Affiche',
 ctx='Une affiche pour la boucherie Les Fistons.',
 pc=('#2A1A12','#C8763A'), card='#6E3B22',
 img={'o1':lambda:src('boucherie--1-post/1'),'o2':lambda:src('boucherie--1-post/2')},
 cov=('o2',.5,.4), sq=('o2',.5,.4),
 ch=[('Le jeu de mots','et la pièce de viande','« Des côtes à tomber, et votre mise sera toujours gagnante. » Une pièce grillée dans une poêle en fonte, le titre en capitales blanches et le tampon de la boucherie en pied d’affiche.',
      [('o2',0,'L’affiche de la boucherie Les Fistons'),('o1',0,'L’affiche posée sur la roche')])],
 liv=[('o2','Affiche','Des côtes à tomber.'),('o1','Mise en situation','Sur la roche.')])

proj(slug='academie-des-sports', nom='Académie des sports', se='Des enfants en mouvement.', k=['Identité et campagne','Sport'],
 client='Ville de Moëlan-sur-Mer', inter='Logo, couleurs, typographies, affiches, stories, réseaux sociaux',
 ctx='L’Académie des sports de Moëlan-sur-Mer : une identité et une campagne pour présenter les activités sportives proposées aux jeunes.',
 pc=('#1B1B1B','#D7F03A'), card='#C9E62E',
 img={'a1':lambda:src('ads-1-post/1'),'a2':lambda:spread('ads-1-post/2','ads-1-post/3'),'a4':lambda:src('ads-1-post/4'),
      'st1':lambda:stories(['10','2','3','6','7'],(27,27,27)),'st2':lambda:stories(['4','8','9','5','1'],(27,27,27))},
 cov=('a1',.5,.4), sq=('a1',.5,.45),
 ch=[('Un nom','en deux graisses','« Académie » en italique, « SPORTS » en capitales larges et « des » à la verticale : le logo se pose en blanc sur la photographie. Un vert acidulé, un bleu, un rouge et le blanc forment la palette, avec la Hoss Round Narrow pour les textes.',
      [('a1',0,'Le logo de l’Académie des sports sur une photographie'),('a4',0,'Le logo, la palette et les typographies de l’Académie des sports'),('a2',1,'Le logo, les affiches et les visuels de l’Académie des sports')]),
     ('Les stories','un enfant, un sport','Tennis, skate, football : dix stories, chacune avec un enfant en action et le logo au centre de l’image.',
      [('st1',1,'Cinq stories de l’Académie des sports'),('st2',1,'Cinq autres stories de l’Académie des sports')])],
 liv=[('a1','Logo','Sur la photographie.'),('a4','Système','Palette et typographies.'),('a2','Affiches','En situation.'),('st1','Stories','Un enfant, un sport.')])

def export(p):
    d=R+'projets/%s/img/'%p['slug']; os.makedirs(d,exist_ok=True); cache={}
    def get(n):
        if n not in cache: cache[n]=p['img'][n]()
        return cache[n]
    used=set(n for c in p['ch'] for n,_,_ in c[3])|set(n for n,_,_ in p['liv'])
    for n in used: fit(get(n)).save(d+n+'.webp',quality=86,method=6)
    n,fx,fy=p['cov']; c=cover(get(n),1400,980,fx,fy); c.save(d+'cover.webp',quality=86,method=6)
    s=c.copy(); s.thumbnail((800,800)); s.save(d+'cover-800.webp',quality=84,method=6)
    cover(get(n),1200,630,fx,fy).save(d+'og.jpg',quality=86)
    n,fx,fy=p['sq']; cover(get(n),640,640,fx,fy).save(R+'p/n/%s.webp'%p['slug'],quality=84,method=6)
def sz(p,n): return Image.open(R+'projets/%s/img/%s.webp'%(p['slug'],n)).size
E=html.escape
def page(p):
    T=open(R+'projets/molan-move/index.html').read(); s=p['slug']
    title='%s, campagne · Studio ES'%p['nom'] if 'Identité' not in p['k'][0] else '%s, identité et campagne · Studio ES'%p['nom']
    T=T.replace('Molan Move, identité visuelle · Studio ES',E(title,quote=False)).replace('molan-move',s)
    T=re.sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="%s">'%E('%s : %s. Un projet Studio ES, basé en Bretagne.'%(p['nom'],p['inter'].lower() if not p['inter'].startswith('Logo') else p['inter'][0].lower()+p['inter'][1:])),T)
    T=re.sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="%s">'%E(p['se']),T)
    ld={"@context":"https://schema.org","@graph":[{"@type":"CreativeWork","@id":"https://studioes.fr/projets/%s/#projet"%s,"name":title.replace(' · Studio ES',''),"url":"https://studioes.fr/projets/%s/"%s,"inLanguage":"fr-FR","image":"https://studioes.fr/projets/%s/img/og.jpg"%s,"creator":{"@id":"https://studioes.fr/#studio"},"keywords":"campagne, affiche, %s"%p['k'][1].lower()},
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Studio ES","item":"https://studioes.fr/"},{"@type":"ListItem","position":2,"name":p['nom'],"item":"https://studioes.fr/projets/%s/"%s}]}]}
    T=re.sub(r'<script type="application/ld\+json">.*?</script>','<script type="application/ld+json">%s</script>'%json.dumps(ld,ensure_ascii=False),T,count=1,flags=re.S)
    T=T.replace('</head>','<style>.gal .solo{grid-column:1/-1;width:calc(50% - 7px);justify-self:center}</style></head>',1)
    T=T.replace('href="/metiers/graphisme/#identites" aria-label','href="/metiers/graphisme/#campagnes" aria-label')
    nsup=len(set(n for c in p['ch'] for n,_,_ in c[3]))
    hero=('<section class="fh w" aria-labelledby="t" style="--pc:%s;--pc2:%s">\n  <div class="tx">\n    <p class="fil"><a href="/">Studio ES</a><span>/</span><a href="/metiers/graphisme/">Graphisme</a></p>\n'
      '    <h1 class="d" id="t">%s<span class="se">%s</span></h1>\n    <div class="k"><span>%s</span><span>%s</span></div>\n    <dl class="meta">\n    <div><dt>Client</dt><dd>%s</dd></div>\n'
      '    <div><dt>Intervention</dt><dd>%s</dd></div>\n    <div><dt>Discipline</dt><dd>%s</dd></div>\n  </dl>\n  </div>\n  <div class="cd" data-r>\n'
      '    <div class="chip"><div class="win"><img src="img/cover.webp" srcset="img/cover-800.webp 800w, img/cover.webp 1400w" sizes="(max-width: 860px) 100vw, 60vw" width="1400" height="980" fetchpriority="high" alt="%s"></div><div class="lab"><b>%s</b><span>%s</span><small>%s</small></div></div>\n  </div>\n</section>\n'
      '<section class="bref" aria-label="Le projet en bref"><div><dl><dt>Contexte</dt><dd>%s</dd></dl></div><div><dl><dt>Le travail réalisé</dt><dd>%s.</dd></dl><p class="dis"><em style="--kc:#B5583F">Design graphique</em></p></div><div><dl><dt>Supports présentés</dt><dd class="nb">%d supports</dd></dl></div></section>')%(
      p['pc'][0],p['pc'][1],E(p['nom']),E(p['se']),E(p['k'][0]),E(p['k'][1]),E(p['client']),E(p['inter']),'Direction artistique et campagne' if 'Identité' not in p['k'][0] else 'Identité visuelle et campagne',
      E('%s, %s'%(p['nom'],p['k'][0].lower())),E(p['nom']),E(p['k'][0]),E(p['k'][1]),NB(E(p['ctx'],quote=False)),E(p['inter']),nsup)
    a=T.index('<section class="fh w"'); b=T.index('</section>',T.index('<section class="bref"'))+10; T=T[:a]+hero+T[b:]
    chs=''
    for i,(t,se,tx,_,imgs) in enumerate([(c[0],c[1],c[2],None,c[3]) for c in p['ch']],1):
        cl=[]; run=[]
        for k,(n,w,al) in enumerate(imgs):
            cl.append('wide' if w else '')
            if w:
                if len(run)%2: cl[run[-1]]='solo'
                run=[]
            else: run.append(k)
        if len(run)%2: cl[run[-1]]='solo'
        g=''.join('\n    <img data-r%s src="img/%s.webp" width="%d" height="%d" alt="%s" loading="lazy">'%(' class="%s"'%c if c else '',n,*sz(p,n),E(al)) for (n,w,al),c in zip(imgs,cl))
        chs+=('<section class="ch" aria-labelledby="c%d">\n  <div class="tx" data-r>\n    <span class="n">%02d</span>\n    <h2 class="d" id="c%d">%s <span class="se">%s</span></h2>\n    <p>%s</p>\n  </div>\n  <div class="gal" tabindex="0" role="region" aria-label="Galerie">%s\n  </div>\n</section>\n')%(i,i,i,E(t),E(se),NB(E(tx,quote=False)),g)
    a=T.index('<section class="ch"'); b=T.index('<section class="cqd"'); b=T.rindex('</div>',a,b)
    T=T[:a]+chs+T[b:]
    a=T.index('<div class="mq" style="--ar:3/4">'); b=T.index('</div>',a)+6
    T=T[:a]+'<div class="mq" style="--ar:3/4">'+''.join('<figure><img src="img/%s.webp" alt="%s" loading="lazy" decoding="async"><figcaption><b>%s</b><span>%s</span></figcaption></figure>'%(n,E(t),E(t),NB(E(l,quote=False))) for n,t,l in p['liv'])+'</div>'+T[b:]
    T=T.replace('Une activité à lancer ? <span class="se">Parlons-en.</span>','Une campagne à lancer ? <span class="se">Parlons-en.</span>')
    open(R+'projets/%s/index.html'%s,'w').write(T)
if __name__=='__main__':
    import sys
    for p in P:
        if len(sys.argv)>1 and p['slug'] not in sys.argv[1:]: continue
        export(p); page(p); print(p['slug'])
