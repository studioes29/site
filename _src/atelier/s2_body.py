
# ================================================================ v2 : atelier chaleureux
def walnut_mat(name, light='#C79A6B', dark='#8A5A35', sc=9):
    m = mat(name, rough=.38, coat=.25, coatr=.2)
    N, L, b = nodes(m)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, sc, 1)
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'; wv.inputs['Scale'].default_value = 2.4; wv.inputs['Distortion'].default_value = 8; wv.inputs['Detail'].default_value = 4
    L.new(mp.outputs['Vector'], wv.inputs['Vector'])
    fine = N.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 300; fine.inputs['Detail'].default_value = 3
    mp2 = N.new('ShaderNodeMapping'); mp2.inputs['Scale'].default_value = (1, 50, 1); L.new(tc.outputs['Object'], mp2.inputs['Vector']); L.new(mp2.outputs['Vector'], fine.inputs['Vector'])
    big = N.new('ShaderNodeTexNoise'); big.inputs['Scale'].default_value = 2.5; L.new(tc.outputs['Object'], big.inputs['Vector'])
    mx = N.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'; mx.inputs[1].default_value = .55; L.new(wv.outputs['Fac'], mx.inputs[0]); L.new(fine.outputs['Fac'], mx.inputs[2])
    mx2 = N.new('ShaderNodeMath'); mx2.operation = 'MULTIPLY_ADD'; mx2.inputs[1].default_value = .35; L.new(big.outputs['Fac'], mx2.inputs[0]); L.new(mx.outputs[0], mx2.inputs[2])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*hexc(dark), 1); cr.color_ramp.elements[1].color = (*hexc(light), 1)
    cr.color_ramp.elements[0].position = .35; cr.color_ramp.elements[1].position = 1.0
    L.new(mx2.outputs[0], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .06; bp.inputs['Distance'].default_value = .0004; L.new(fine.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

oakW = walnut_mat('oakW', '#875838', '#432818', 9)
oakFrame = walnut_mat('oakF', '#875838', '#432818', 20)

def limewash(name, a, b_):
    m = mat(name, rough=.95)
    N, L, b = nodes(m); tc = N.new('ShaderNodeTexCoord')
    nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2.2; nz.inputs['Detail'].default_value = 6; nz.inputs['Roughness'].default_value = .62
    L.new(tc.outputs['Object'], nz.inputs['Vector'])
    cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*hexc(a), 1); cr.color_ramp.elements[1].color = (*hexc(b_), 1); cr.color_ramp.elements[0].position = .35; cr.color_ramp.elements[1].position = .68
    L.new(nz.outputs['Fac'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    fn = N.new('ShaderNodeTexNoise'); fn.inputs['Scale'].default_value = 140; fn.inputs['Detail'].default_value = 8; L.new(tc.outputs['Object'], fn.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .1; bp.inputs['Distance'].default_value = .003; L.new(fn.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m

wallM = limewash('wall', '#E2D6C4', '#EEE6D9')
wallL = limewash('wallL', '#E6DBCA', '#F1EADF')
ceilM = mat('ceil', hexc('#E9E2D6'), .95)
floorM = walnut_mat('floorW', '#8E6446', '#523422', 4)
rugM = mat('rug', hexc('#C3A378'), 1, sheen=.5)
N, L, b = nodes(rugM); tc = N.new('ShaderNodeTexCoord'); wv = N.new('ShaderNodeTexWave'); wv.inputs['Scale'].default_value = 140; wv.bands_direction = 'X'
L.new(tc.outputs['Object'], wv.inputs['Vector']); vo = N.new('ShaderNodeTexNoise'); vo.inputs['Scale'].default_value = 900; L.new(tc.outputs['Object'], vo.inputs['Vector'])
ad = N.new('ShaderNodeMath'); ad.operation = 'ADD'; L.new(wv.outputs['Fac'], ad.inputs[0]); L.new(vo.outputs['Fac'], ad.inputs[1])
bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .6; L.new(ad.outputs[0], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
silver = mat('silver', hexc('#D2D4D7'), .3, 1, aniso=.5)
standM = mat('standM', hexc('#BDBBB7'), .48, 1, aniso=.3)
spaceG = mat('spaceG', hexc('#3A3B3E'), .32, 1, aniso=.3)
glassBlk = mat('glassBlk', hexc('#060607'), .05, coat=1)
keyBlk = mat('keyBlk', hexc('#151516'), .55)
camBody = mat('camBody', hexc('#1A1A1B'), .55); bump(camBody, 1600, .08)
camGrip = mat('camGrip', hexc('#111111'), .8); bump(camGrip, 500, .5, kind='vor')
ribbed = mat('ribbed', hexc('#121212'), .7)
N, L, b = nodes(ribbed); tc = N.new('ShaderNodeTexCoord'); g = N.new('ShaderNodeSeparateXYZ'); L.new(tc.outputs['Object'], g.inputs[0])
at = N.new('ShaderNodeMath'); at.operation = 'ARCTAN2'; L.new(g.outputs['X'], at.inputs[0]); L.new(g.outputs['Y'], at.inputs[1])
mu = N.new('ShaderNodeMath'); mu.operation = 'MULTIPLY'; mu.inputs[1].default_value = 60; L.new(at.outputs[0], mu.inputs[0])
si = N.new('ShaderNodeMath'); si.operation = 'SINE'; L.new(mu.outputs[0], si.inputs[0])
bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .8; bp.inputs['Distance'].default_value = .0008; L.new(si.outputs[0], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
mugM = mat('mug', hexc('#E9E1D3'), .25, coat=.7); bump(mugM, 800, .04)
N, L, b = nodes(mugM); tc = N.new('ShaderNodeTexCoord'); vo = N.new('ShaderNodeTexVoronoi'); vo.inputs['Scale'].default_value = 220; L.new(tc.outputs['Object'], vo.inputs['Vector'])
cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*hexc('#5A4A3A'), 1); cr.color_ramp.elements[1].color = (*hexc('#EAE2D4'), 1); cr.color_ramp.elements[0].position = .0; cr.color_ramp.elements[1].position = .06
L.new(vo.outputs['Distance'], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
coffee = mat('coffee', hexc('#2A160B'), .05, coat=1)
matBoard = mat('matB', hexc('#F3EEE4'), .9)
frameBlk = mat('frameBlk', hexc('#1B1A19'), .5); bump(frameBlk, 900, .05)
pictGlass = mat('pglass', (1, 1, 1), 0, trans=1, ior=1.5)
brassM = mat('brassM', hexc('#B8925A'), .28, 1)
linenSh = mat('linenSh', hexc('#EFE4D2'), .8, sss=.2, sheen=.5)

def rod(name, p1, p2, r, m, parent=None, v=24):
    p1, p2 = Vector(p1), Vector(p2); d = p2 - p1
    o = cyl(name, r, d.length, (p1 + p2) / 2, m, v=v, bev=0, parent=parent)
    o.rotation_euler = d.to_track_quat('Z', 'Y').to_euler(); return o

# ---------------------------------------------------------------- room
plane('floor', 8, 8, (0, 0, 0), floorM, rot=(0, 0, 0))
box('wall_back', 6, .1, 3.2, (.5, WALL + .05, 1.6), wallM, 0)
box('skirt', 6, .015, .1, (.5, WALL - .007, .05), oakW, .002)
WX, WY0, WY1, WZ0, WZ1 = -1.3, -.8, .3, .9, 2.35
NI = .38  # depth of the window niche
def lw(name, y0, y1, z0, z1):
    box(name, NI + .06, y1 - y0, z1 - z0, (WX - (NI + .06) / 2, (y0 + y1) / 2, (z0 + z1) / 2), wallL, 0)
lw('lw_a', -3, WY0, 0, 3.2); lw('lw_b', WY1, WALL + .1, 0, 3.2); lw('lw_c', WY0, WY1, 0, WZ0); lw('lw_d', WY0, WY1, WZ1, 3.2)
box('ceiling', 6, 6, .1, (.5, -2, 3.2), ceilM, 0)
fr = walnut_mat('winframe', '#875838', '#432818', 14)
fy, fz = (WY0 + WY1) / 2, (WZ0 + WZ1) / 2
for nm, (y, z, d, h) in {'f1': (fy, WZ1 - .03, WY1 - WY0, .06), 'f2': (fy, WZ0 + .03, WY1 - WY0, .06), 'f3': (WY0 + .03, fz, .06, WZ1 - WZ0), 'f4': (WY1 - .03, fz, .06, WZ1 - WZ0),
                         'f5': (fy, fz, .05, WZ1 - WZ0)}.items():
    box(nm, .07, d, h, (WX - NI + .02, y, z), fr, .005)
box('sill', NI + .06, WY1 - WY0 + .04, .04, (WX - NI / 2 + .02, fy, WZ0 - .005), oakW, .006)
g = plane('pane', WY1 - WY0, WZ1 - WZ0, (WX - NI + .02, fy, fz), glass, rot=(math.pi / 2, 0, math.pi / 2)); g.visible_shadow = False; g.visible_diffuse = False; g.visible_volume_scatter = False
bpy.ops.object.light_add(type='AREA', location=(WX - NI + .04, fy, fz)); po = bpy.context.object; po.data.shape = 'RECTANGLE'
po.data.size = WY1 - WY0; po.data.size_y = WZ1 - WZ0; po.rotation_euler = (0, math.radians(90), 0); po.data.cycles.is_portal = True
# linen curtain gathered at the front edge
me = bpy.data.meshes.new('curt'); bm = bmesh.new(); nx, nz = 46, 30
vs = [[bm.verts.new((WX + .07 + .03 * math.sin(i / 2.6) + .012 * math.sin(i / 1.1), WY0 + .02 + i * .0065, .82 + j * (2.5 - .82) / nz)) for j in range(nz + 1)] for i in range(nx + 1)]
for i in range(nx):
    for j in range(nz): bm.faces.new((vs[i][j], vs[i + 1][j], vs[i + 1][j + 1], vs[i][j + 1]))
bm.to_mesh(me); bm.free(); cu = ob('curtain', me); cu.data.materials.append(linenSh); [setattr(p, 'use_smooth', True) for p in cu.data.polygons]
cu.modifiers.new('s', 'SOLIDIFY').thickness = .002
linenSh.node_tree.nodes['Principled BSDF'].inputs['Transmission Weight'].default_value = .3
cyl('rod', .009, 1.0, (WX + .07, WY0 + .3, 2.52), brassM, rot=(math.pi / 2, 0, 0))
# rug
rg = box('rug', 2.2, 1.6, .012, (0, -.15, .006), rugM, .004)

# ---------------------------------------------------------------- desk (solid oak, tapered legs, apron with drawers)
DW, DD, DT = 1.72, .76, .032
DY = .12
box('desk_top', DW, DD, DT, (0, DY, YB - DT / 2), oakW, .008, seg=4)
box('apron_b', DW - .12, .02, .07, (0, DY + DD / 2 - .07, YB - DT - .035), oakW, .003)
box('apron_l', .02, DD - .14, .07, (-DW / 2 + .07, DY, YB - DT - .035), oakW, .003)
box('apron_r', .02, DD - .14, .07, (DW / 2 - .07, DY, YB - DT - .035), oakW, .003)
box('apron_f', DW - .12, .02, .07, (0, DY - DD / 2 + .07, YB - DT - .035), oakW, .003)
for i, x in enumerate((-.35, .35)):
    box('drawer%d' % i, .5, .006, .055, (x, DY - DD / 2 + .058, YB - DT - .035), oakW, .002)
    box('pull%d' % i, .08, .012, .008, (x, DY - DD / 2 + .052, YB - DT - .03), brassM, .003)
for sx in (-1, 1):
    for sy in (-1, 1):
        lg = cyl('leg%d%d' % (sx, sy), .028, YB - DT, (sx * (DW / 2 - .08), DY + sy * (DD / 2 - .08), (YB - DT) / 2), oakW, r2=.042, v=4, bev=.004); lg.data.transform(Matrix.Rotation(math.pi / 4, 4, 'Z'))
        lg.rotation_euler = (sy * -.06, sx * .06, 0)
        lg.scale = (1, 1, 1)

# ---------------------------------------------------------------- WEB : 27" display on aluminium stand
mon = empty('mon', (-.02, DY + .22, YB))
box('mon_foot', .19, .2, .007, (0, 0, .0035), standM, .0035, seg=4, parent=mon)
arm = box('mon_arm', .17, .012, .31, (0, .045, .155), standM, .004, rot=(math.radians(-14), 0, 0), parent=mon)
pnl = empty('mon_panel', (0, -.0, .375), (math.radians(-5), 0, 0)); pnl.parent = mon
box('mon_case', .623, .022, .362, (0, .004, 0), silver, .006, seg=4, parent=pnl)
box('mon_glass', .619, .004, .358, (0, -.008, 0), glassBlk, .003, parent=pnl)
desk_tex = '/tmp/rd/desk.png'
scr = plane('mon_screen', .597, .336, (0, -.0102, .0), img_mat('scr', desk_tex, emis=1.25), rot=(math.pi / 2, 0, 0), parent=pnl)
zone(mon, 'web')
cv = bpy.data.curves.new('cable', 'CURVE'); cv.dimensions = '3D'; cv.bevel_depth = .0028; sp = cv.splines.new('BEZIER'); sp.bezier_points.add(2)
sp.bezier_points.add(6)
for p, co in zip(sp.bezier_points, [(-.02, DY + .29, YB + .24), (.02, DY + .33, YB + .03), (.05, .47, YB + .003), (.075, .507, YB - .016), (.1, WALL - .012, YB - .1), (.16, WALL - .012, .42), (.45, WALL - .014, .4), (.6, WALL - .03, .36), (.66, WALL - .05, .318)]): p.co = co; p.handle_left_type = p.handle_right_type = 'AUTO'
cab = ob('cable', cv); cab.data.materials.append(whiteP)
# desk pad (leather, warm)
leather = mat('leather', hexc('#CDB898'), .5, sheen=.2); bump(leather, 400, .12)
box('deskmat', .8, .34, .003, (.06, -.02, YB + .0015), leather, .0015)
# keyboard : aluminium, white keys
kb = empty('kb', (-.05, -.02, YB + .003), (0, 0, math.radians(1)))
KC = 19; kw = .0223 * KC + .012
box('kb_body', kw, .118, .007, (0, 0, .0035), silver, .0028, parent=kb)
for r in range(5):
    for c in range(KC):
        if c in (14,): continue
        if r == 4 and 3 < c < 9:
            if c == 4: box('key_sp', .108, .0175, .004, (-kw / 2 + .006 + .0223 * 6.5, .043 - 4 * .0215, .009), whiteP, .0013, parent=kb)
            continue
        box('key%d_%d' % (r, c), .0193, .0175, .004, (-kw / 2 + .0172 + c * .0223, .043 - r * .0215, .009), whiteP, .0013, seg=2, parent=kb)
zone(kb, 'web')
tpd = empty('trackpad', (.29, -.025, YB), (0, 0, math.radians(1)))
box('tp_base', .16, .115, .0045, (0, 0, .00225), silver, .002, parent=tpd)
box('tp_top', .157, .112, .0016, (0, 0, .0052), mat('tpw', hexc('#F1F0EC'), .22, coat=.4), .0015, parent=tpd)
zone(tpd, 'web')
# laptop (space grey aluminium, black bezel)
lap = empty('laptop', (.64, -.05, YB), (0, 0, math.radians(18)))
box('lap_base', .312, .221, .0105, (0, 0, .00525), spaceG, .004, seg=4, parent=lap)
box('lap_well', .275, .105, .0008, (0, .03, .0106), keyBlk, .0004, parent=lap)
for r in range(6):
    for c in range(14):
        box('lk%d_%d' % (r, c), .0165, .0145 if r else .008, .0012, (-.1235 + c * .019, .074 - r * .0168, .0112), keyBlk, .0006, seg=1, parent=lap)
box('lap_pad', .14, .085, .0004, (0, -.062, .0107), spaceG, .0003, parent=lap)
lid = empty('lid', (0, .11, .0105), (math.radians(-16), 0, 0)); lid.parent = lap
box('lap_lid', .312, .006, .215, (0, .003, .1075), spaceG, .003, seg=3, parent=lid)
box('lap_bezel', .304, .0008, .207, (0, -.0004, .1075), glassBlk, .0006, parent=lid)
plane('lap_scr', .292, .19, (0, -.001, .108), img_mat('lr', '/tmp/rd/lap.png', emis=1.1), parent=lid)
box('lap_notch', .03, .0006, .008, (0, -.0012, .207), glassBlk, .002, parent=lid)
zone(lap, 'web')

# ---------------------------------------------------------------- PHOTO : full-frame mirrorless + 24-70, prime lens, gallery wall
cam_o = empty('camera', (-.56, .0, YB), (0, 0, math.radians(-34)))
box('cb_main', .127, .046, .074, (0, .008, .042), camBody, .008, seg=4, parent=cam_o)
box('cb_grip', .036, .068, .084, (.047, -.004, .047), camGrip, .014, seg=5, parent=cam_o)
box('cb_top', .124, .044, .012, (0, .009, .084), camBody, .005, parent=cam_o)
evf = box('cb_evf', .056, .046, .02, (-.012, .01, .092), camBody, .0095, seg=6, parent=cam_o)
box('cb_eye', .034, .012, .016, (-.012, .036, .093), camGrip, .006, parent=cam_o)
cyl('cb_mode', .011, .011, (-.048, .01, .0965), ribbed, parent=cam_o)
cyl('cb_dial1', .0095, .007, (.032, .022, .094), ribbed, parent=cam_o)
cyl('cb_dial2', .0105, .008, (.05, .008, .094), ribbed, parent=cam_o)
cyl('cb_shut', .0065, .004, (.05, -.02, .0915), silver, parent=cam_o)
cyl('cb_shutr', .009, .003, (.05, -.02, .0895), camBody, parent=cam_o)
cyl('cb_c1', .005, .004, (.026, -.002, .0915), camBody, parent=cam_o)
cyl('cb_mount', .03, .006, (-.01, -.018, .042), silver, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_base', .039, .02, (-.01, -.031, .042), camBody, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_zoom', .042, .045, (-.01, -.064, .042), ribbed, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_mid', .0415, .015, (-.01, -.094, .042), camBody, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_focus', .042, .028, (-.01, -.115, .042), ribbed, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_front', .043, .016, (-.01, -.137, .042), camBody, rot=(math.pi / 2, 0, 0), parent=cam_o)
cyl('ln_glass', .036, .002, (-.01, -.1452, .042), lensglass, rot=(math.pi / 2, 0, 0), bev=0, parent=cam_o)
cyl('ln_ring', .0435, .0025, (-.01, -.13, .042), mat('lnred', hexc('#C0392B'), .4), rot=(math.pi / 2, 0, 0), parent=cam_o)
zone(cam_o, 'photo')

# gallery wall : thin dibond prints, full bleed, floating 12 mm off the wall
def dibond(name, cx, cz, w, h, img):
    e = empty(name, (cx, WALL, cz))
    box(name + '_sp', w * .6, .012, h * .6, (0, -.006, 0), blackM, .001, parent=e)
    box(name + '_al', w, .003, h, (0, -.0135, 0), silver, .0006, seg=1, parent=e)
    plane(name + '_img', w - .0004, h - .0004, (0, -.0152, 0), img_mat(name + 'im', img, .42, coat=.15), parent=e)
    return e
gal = empty('gallery')
DIB = [('franglish-3', -.86, 1.63, .30, .40), ('matmatah-6', -.39, 1.63, .54, .36), ('helena-2', .065, 1.74, .27, .18),
       ('kemmler-5', .065, 1.52, .27, .18), ('rimk-1', .40, 1.63, .30, .40)]
for i, (n, cx, cz, w, h) in enumerate(DIB):
    dibond('dib%d' % i, cx, cz, w, h, '/tmp/rd/dib_%s.jpg' % n).parent = gal
zone(gal, 'photo')
# a few loose prints next to the camera
for i, (n, dx, dy, a) in enumerate([('genezio-7', 0, 0, 8), ('philippe-katerine-2', .03, .012, -6), ('helena-7', .06, -.006, 15)]):
    sheet('loose%d' % i, .1, .125, .0004, (-.47 + dx, -.2 + dy, YB + .0006 + i * .0005), img_mat('lp%d' % i, '/tmp/rd/dib_%s.jpg' % n, .5), rot=(0, 0, math.radians(a)), edge=paper)
    zone(bpy.data.objects['loose%d' % i], 'photo')

# ---------------------------------------------------------------- GRAPHISME : tablet + pencil, framed cover leaning, swatches
ip = empty('ipad', (.43, .315, YB + .095), (math.radians(68), 0, math.radians(-24)))
ipst = empty('ipad_stand', (.43, .3, YB)); ipst.rotation_euler = (0, 0, math.radians(-24))
box('ips_base', .12, .09, .012, (0, .0, .006), oakW, .004, parent=ipst)
box('ips_lip', .12, .012, .02, (0, -.04, .016), oakW, .003, parent=ipst)
box('ip_body', .248, .179, .0062, (0, 0, .0031), silver, .005, seg=4, parent=ip)
box('ip_glass', .244, .175, .0006, (0, 0, .0063), glassBlk, .004, parent=ip)
plane('ip_scr', .228, .16, (0, 0, .0067), img_mat('ips', '/tmp/rd/ipad.png', emis=1.0), rot=(0, 0, 0), parent=ip)
pc_ = cyl('pencil', .0045, .166, (.4, .2, YB + .0045), whiteP, rot=(0, math.pi / 2, math.radians(-30)), v=24)

zone(ip, 'graph')
po1 = empty('pochette', (1.13, WALL - .04, 1.264), (math.radians(-12), 0, math.radians(2)))
box('poch_back', .24, .003, .12, (0, 0, .06), paper, .0008, parent=po1)
plane('poch_img', .238, .118, (0, -.0017, .06), img_mat('el', '/tmp/rd/pochette.jpg', .5), parent=po1)
box('ticket', .085, .0012, .06, (.05, .0012, .125), paper, .0005, rot=(0, math.radians(-6), 0), parent=po1)
plane('ticket_t', .08, .055, (.05, -.0002, .125), img_mat('tk', '/tmp/rd/ticket.png', .6), rot=(math.pi / 2, math.radians(6), 0), parent=po1)
zone(po1, 'graph')

# ---------------------------------------------------------------- FILL box, CONTACT phone
ph = empty('phone', (.2, .2, YB), (0, 0, math.radians(-16)))
box('ph_body', .0715, .147, .0082, (0, 0, .0041), spaceG, .007, seg=4, parent=ph)
box('ph_glass', .069, .1445, .0006, (0, 0, .0083), glassBlk, .006, parent=ph)
plane('ph_scr', .064, .139, (0, 0, .0088), img_mat('phs', '/tmp/rd/phone.png', emis=1.2), rot=(0, 0, 0), parent=ph)
zone(ph, 'contact')

# ---------------------------------------------------------------- warm props
# mug of coffee
mg_ = empty('mug', (-.34, .09, YB))
mm = cyl('mug_b', .04, .092, (0, 0, .046), mugM, v=64, bev=.002, parent=mg_, cap=False)
mm.modifiers.new('s', 'SOLIDIFY').thickness = .004
cyl('coffee', .0365, .002, (0, 0, .076), coffee, v=64, bev=0, parent=mg_)
cyl('mug_bot', .038, .006, (0, 0, .003), mugM, v=64, parent=mg_)
bpy.ops.mesh.primitive_torus_add(major_radius=.025, minor_radius=.0065, location=(.045, 0, .048), rotation=(math.pi / 2, 0, 0)); hd_ = bpy.context.object; hd_.data.materials.append(mugM); hd_.parent = mg_; hd_.scale = (.8, 1, 1.05)
for p in hd_.data.polygons: p.use_smooth = True
zone(mg_, 'tasse')
# ceramic pen pot
pc = empty('pencup', (-.33, .42, YB))
cyl('cup', .036, .1, (0, 0, .05), mat('potM', hexc('#9C5B3F'), .6), v=64, parent=pc)
for i in range(6):
    a = i * 1.05; cl = ['#D9B44A', '#1E1E1E', '#B84A32', '#2F5BE0', '#1E1E1E', '#F4EFE6'][i]
    cyl('pc%d' % i, .0035, .17, (math.cos(a) * .015, math.sin(a) * .015, .12), mat('pcm%d' % i, hexc(cl), .4), rot=(math.cos(a) * .2, math.sin(a) * .2, 0), v=6, parent=pc)
# stack of photo books
y0 = YB
for i, (w, d, h, c) in enumerate([(.3, .23, .03, '#5B4433'), (.27, .21, .022, '#C9B9A0'), (.25, .2, .028, '#7A4A35'), (.22, .17, .018, '#E7DFD0')]):
    box('bk%d' % i, w, d, h, (-.76, .38, y0 + h / 2), mat('bkm%d' % i, hexc(c), .6), .003, rot=(0, 0, math.radians(6 - i * 5)))
    y0 += h
BOOKTOP = y0
fb = empty('fill', (-.75, .37, BOOKTOP), (0, 0, math.radians(10)))
box('fill_box', .16, .11, .07, (0, 0, .035), lav, .004, parent=fb)
box('fill_lid', .165, .115, .02, (0, 0, .062), lav, .004, parent=fb)
plane('fill_lbl', .09, .03, (0, -.0578, .045), img_mat('fl', '/tmp/rd/fill.png', .6), parent=fb)
zone(fb, 'fill')
# lamp (brass + black, warm)
lamp = empty('lamp', (-.6, .4, YB))
ceramM = mat('ceramLamp', hexc('#EFE8DC'), .35, coat=.4); bump(ceramM, 300, .05)
lb = cyl('lamp_base', .085, .17, (0, 0, .085), ceramM, r2=.05, v=64, bev=.02, parent=lamp)
cyl('lamp_neck', .02, .05, (0, 0, .19), ceramM, v=32, parent=lamp)
cyl('lamp_socket', .016, .04, (0, 0, .23), brassM, v=24, parent=lamp)
rattan = mat('rattan', hexc('#D2B48A'), .7, sss=.3, trans=.25)
N_, L_, b_ = nodes(rattan); tc_ = N_.new('ShaderNodeTexCoord'); br_ = N_.new('ShaderNodeTexBrick'); br_.inputs['Scale'].default_value = 90; br_.inputs['Mortar Size'].default_value = .08
br_.inputs['Color1'].default_value = (*hexc('#D8BC93'), 1); br_.inputs['Color2'].default_value = (*hexc('#BF9C6E'), 1); br_.inputs['Mortar'].default_value = (*hexc('#7A5C3A'), 1)
L_.new(tc_.outputs['Object'], br_.inputs['Vector']); L_.new(br_.outputs['Color'], b_.inputs['Base Color'])
bpb = N_.new('ShaderNodeBump'); bpb.inputs['Strength'].default_value = .5; L_.new(br_.outputs['Fac'], bpb.inputs['Height']); L_.new(bpb.outputs['Normal'], b_.inputs['Normal'])
hd = empty('lamp_head', (0, 0, .3)); hd.parent = lamp
sh_ = cyl('lamp_shade', .13, .15, (0, 0, 0), rattan, v=96, bev=0, parent=hd, cap=False); sh_.modifiers.new('s', 'SOLIDIFY').thickness = .003
for zz in (.075, -.075): cyl('shade_rim%d' % (zz > 0), .1305, .006, (0, 0, zz), mat('rimC', hexc('#A88660'), .6), v=96, bev=.002, parent=hd, cap=False)
inner = emis('bulb', (1, .8, .58), 30 if LAMPE else 0)
cyl('lamp_bulb', .028, .05, (0, 0, -.01), inner, parent=hd)
zone(lamp, 'lampe')
if LAMPE:
    bpy.ops.object.light_add(type='POINT', location=(0, 0, -.01)); pl = bpy.context.object; pl.parent = hd; pl.data.energy = 18; pl.data.color = (1, .74, .48); pl.data.shadow_soft_size = .03

# wall clock, on the same axis as the frames
# enseigne au néon : le titre de la bannière. Ordinateur : à droite de la galerie, au-dessus de l'étagère ; mobile : au-dessus de la galerie, dans l'axe de l'écran.
# NEON=x,z,corps la déplace ; NEON_ON=0 l'éteint (pour la mise en scène de l'arrivée), NEON_ON=1 la force allumée.
NX, NZ, NS = [float(v) for v in os.environ.get('NEON', '-.01,1.89,.2' if os.environ.get('PORTRAIT') else '.83,1.57,.14').split(',')]
neon_on = {'0': False, '1': True}.get(os.environ.get('NEON_ON', ''), True)
NK = NS / .09; NJ = MOMENT in ('jour', 'matin')
bpy.ops.object.text_add(location=(NX, WALL - .008, NZ), rotation=(math.pi / 2, 0, 0)); tx = bpy.context.object; tx.name = 'neon'
tx.data.body = 'Studio ES'; tx.data.font = bpy.data.fonts.load('/tmp/rd/ur.ttf'); tx.data.size = NS; tx.data.align_x = 'CENTER'
tx.data.extrude = .0; tx.data.bevel_depth = .0028 * NK ** .5; tx.data.fill_mode = 'NONE'
tx.data.materials.append(emis('neonm', tuple(float(v) for v in os.environ.get('NEON_C', '1,.3,.42' if NJ else '1,.42,.5').split(',')), float(os.environ.get('NEON_E', {'jour': 5.5, 'matin': 8}.get(MOMENT, 12)))) if neon_on else mat('neonoff', hexc('#E6DCD6'), .15, trans=.5))
zone(tx, 'neon')
if neon_on:
    bpy.ops.object.light_add(type='AREA', location=(NX, WALL - .12, NZ + .03 * NK)); nl = bpy.context.object; nl.data.size = .4 * NK; nl.data.size_y = .12 * NK
    nl.rotation_euler = (math.radians(-90), 0, 0); nl.data.energy = 3.5 * NK * (2.2 if NJ else 1); nl.data.color = (1, .45, .55); nl.visible_camera = False

# ---------------------------------------------------------------- the cat (seal-point Birman) looking out of the window
def hairmat(name, mel, red=.35, rough=.35):
    m = bpy.data.materials.new(name); m.use_nodes = True; N2, L2 = m.node_tree.nodes, m.node_tree.links
    for n in list(N2): N2.remove(n)
    hb = N2.new('ShaderNodeBsdfHairPrincipled')
    try: hb.parametrization = 'MELANIN'
    except Exception: pass
    hb.inputs['Melanin'].default_value = mel; hb.inputs['Melanin Redness'].default_value = red; hb.inputs['Roughness'].default_value = rough
    o_ = N2.new('ShaderNodeOutputMaterial'); L2.new(hb.outputs[0], o_.inputs['Surface']); return m
CX, CY, CZ = WX - NI / 2 + .03, .02, WZ0 + .015
CAT_ROT = math.radians(-52)   # looks out of the window, three-quarter from behind
cf = empty('catframe', (CX, CY, CZ), (0, 0, CAT_ROT))
# ---- fur shader : melanin driven by position on the body (seal/blue points, white gloves and bib)
fm = bpy.data.materials.new('catfur'); fm.use_nodes = True; NT = fm.node_tree; Nn, Ll = NT.nodes, NT.links
for n in list(Nn): Nn.remove(n)
tco = Nn.new('ShaderNodeTexCoord'); xyz = Nn.new('ShaderNodeSeparateXYZ'); Ll.new(tco.outputs['Object'], xyz.inputs[0])
def mr(sock, a, b):
    m = Nn.new('ShaderNodeMapRange'); m.interpolation_type = 'SMOOTHSTEP'; m.clamp = True
    m.inputs['From Min'].default_value = a; m.inputs['From Max'].default_value = b; Ll.new(sock, m.inputs['Value']); return m.outputs['Result']
def op(o, a, b):
    m = Nn.new('ShaderNodeMath'); m.operation = o; m.use_clamp = True
    for k, v in enumerate((a, b)):
        if isinstance(v, float): m.inputs[k].default_value = v
        else: Ll.new(v, m.inputs[k])
    return m.outputs[0]
X, Y, Z = xyz.outputs['X'], xyz.outputs['Y'], xyz.outputs['Z']
ay = Nn.new('ShaderNodeMath'); ay.operation = 'ABSOLUTE'; Ll.new(Y, ay.inputs[0]); AY = ay.outputs[0]
face = op('MULTIPLY', mr(X, -.078, -.104), mr(Z, .205, .23))
legs = op('MULTIPLY', mr(X, -.045, -.062), mr(Z, .125, .085))
feet = op('MULTIPLY', op('MULTIPLY', op('MULTIPLY', mr(Z, .035, .02), mr(AY, .04, .052)), mr(X, .035, .015)), .5)
tail = op('MAXIMUM', op('MULTIPLY', mr(X, .06, .085), mr(Z, .07, .045)), op('MULTIPLY', mr(AY, .07, .085), mr(Z, .05, .03)))
back = op('MULTIPLY', mr(Z, .2, .27), .2)          # slightly darker saddle and head top
pt = op('MAXIMUM', op('MAXIMUM', face, legs), op('MAXIMUM', op('MAXIMUM', feet, tail), back))
paw = op('MULTIPLY', mr(Z, .028, .016), mr(AY, .072, .064))
bib = op('MULTIPLY', op('MULTIPLY', mr(X, -.05, -.068), mr(AY, .03, .018)), op('MULTIPLY', mr(Z, .115, .135), mr(Z, .215, .195)))
wht = op('MAXIMUM', paw, op('MULTIPLY', bib, op('SUBTRACT', 1., face)))
mel = Nn.new('ShaderNodeMix'); mel.data_type = 'FLOAT'; Ll.new(pt, mel.inputs['Factor']); mel.inputs['A'].default_value = .1; mel.inputs['B'].default_value = .62
mel2 = Nn.new('ShaderNodeMix'); mel2.data_type = 'FLOAT'; Ll.new(wht, mel2.inputs['Factor']); Ll.new(mel.outputs['Result'], mel2.inputs['A']); mel2.inputs['B'].default_value = .0
red = Nn.new('ShaderNodeMix'); red.data_type = 'FLOAT'; Ll.new(pt, red.inputs['Factor']); red.inputs['A'].default_value = .3; red.inputs['B'].default_value = .1
hb = Nn.new('ShaderNodeBsdfHairPrincipled')
try: hb.parametrization = 'MELANIN'
except Exception: pass
Ll.new(mel2.outputs['Result'], hb.inputs['Melanin']); Ll.new(red.outputs['Result'], hb.inputs['Melanin Redness'])
hb.inputs['Roughness'].default_value = .34; hb.inputs['Radial Roughness'].default_value = .5; hb.inputs['Coat'].default_value = .15
for nm, v in (('Random Color', .12), ('Random Roughness', .15)):
    if nm in hb.inputs: hb.inputs[nm].default_value = v
oo = Nn.new('ShaderNodeOutputMaterial'); Ll.new(hb.outputs[0], oo.inputs['Surface'])
furPoint = bpy.data.materials.new('furPoint'); furPoint.use_nodes = True
for n in list(furPoint.node_tree.nodes): furPoint.node_tree.nodes.remove(n)
hp = furPoint.node_tree.nodes.new('ShaderNodeBsdfHairPrincipled')
try: hp.parametrization = 'MELANIN'
except Exception: pass
hp.inputs['Melanin'].default_value = .66; hp.inputs['Melanin Redness'].default_value = .12; hp.inputs['Roughness'].default_value = .35
furPoint.node_tree.links.new(hp.outputs[0], furPoint.node_tree.nodes.new('ShaderNodeOutputMaterial').inputs['Surface'])
skinM = mat('catskin', hexc('#C9B49C'), .85)
def fur(o, m, n, length, children=30, align=-.5, rad=.00017, rnd=.35):
    o.data.materials.append(m)
    if os.environ.get('NOFUR'): return None
    mod = o.modifiers.new('fur', 'PARTICLE_SYSTEM'); ps = mod.particle_system.settings
    ps.type = 'HAIR'; ps.count = n; ps.hair_length = length; ps.use_advanced_hair = True; ps.length_random = rnd
    ps.normal_factor = length; ps.factor_random = length * .1; ps.object_align_factor = (0, 0, align * length); ps.hair_step = 5
    ps.child_type = 'INTERPOLATED'; ps.child_percent = 6; ps.rendered_child_count = children; ps.child_radius = .004
    ps.clump_factor = .35; ps.clump_shape = -.2; ps.roughness_1 = .0008; ps.roughness_1_size = .2; ps.roughness_endpoint = .0012; ps.roughness_end_shape = 1.5
    ps.root_radius = 1; ps.tip_radius = 0; ps.radius_scale = rad; ps.material_slot = m.name
    return ps
# ---- one continuous body made of metaballs
B = [((.04, 0, .07), .075, (1.1, .95, .85)), ((.03, .042, .06), .052, (1.3, .7, .9)), ((.03, -.042, .06), .052, (1.3, .7, .9)),
     ((-.01, .056, .012), .022, (2.0, .8, .55)), ((-.01, -.056, .012), .022, (2.0, .8, .55)),
     ((.0, 0, .1), .065, (1, .85, 1)), ((-.02, 0, .14), .062, (.95, .8, 1.1)), ((-.045, .018, .165), .038, (1, .8, 1.2)), ((-.045, -.018, .165), .038, (1, .8, 1.2)),
     ((-.064, 0, .15), .044, (.8, .9, 1.2)), ((-.064, 0, .212), .035, (1, 1, 1.25)),
     ((-.073, 0, .262), .042, (1.12, 1.05, .95)), ((-.091, .021, .247), .023, (1, 1, 1)), ((-.091, -.021, .247), .023, (1, 1, 1)),
     ((-.113, 0, .247), .019, (1.25, 1.1, .8)), ((-.105, 0, .232), .013, (1, 1, 1))]
for sg in (1, -1):
    for k, z in enumerate((.13, .106, .082, .058, .036)): B.append(((-.068 - k * .002, sg * .022, z), .017 - k * .0007, (1, 1, 1.3)))
    B.append(((-.084, sg * .022, .011), .017, (1.5, 1, .6)))
tp = [(.1, .03, .03), (.13, .1, .012), (.04, .135, .012), (-.06, .1, .012)]
def bez(t):
    p0, p1, p2, p3 = [Vector(v) for v in tp]
    return (1 - t) ** 3 * p0 + 3 * (1 - t) ** 2 * t * p1 + 3 * (1 - t) * t * t * p2 + t ** 3 * p3
for k in range(22):
    t = k / 21; B.append((tuple(bez(t)), .0125 - .004 * t, (1, 1, 1)))
HEADP = Vector((-.066, 0, .222)); TAILP = Vector((.1, .03, .03))
headIdx = {11, 12, 13, 14, 15}
BH = [b for i, b in enumerate(B[:28]) if i in headIdx]; BB = [b for i, b in enumerate(B[:28]) if i not in headIdx]; BT = B[28:]
BB.append((tuple(bez(0)), .0125, (1, 1, 1))); BT = [b for b in BT]
pivH = empty('cat_headpiv', HEADP); pivH.parent = cf
pivT = empty('cat_tailpiv', TAILP); pivT.parent = cf
def catpart(name, balls, parent, off, n, smooth=14):
    mb = bpy.data.metaballs.new(name); mb.resolution = .0045; mb.render_resolution = .0035
    mo = bpy.data.objects.new(name + '_mb', mb); link(mo)
    for co, r, sc in balls:
        e = mb.elements.new(); e.co = co; e.radius = r; e.type = 'ELLIPSOID'; e.size_x, e.size_y, e.size_z = sc; e.stiffness = 2.2
    bpy.context.view_layer.update()
    me_ = bpy.data.meshes.new_from_object(mo.evaluated_get(bpy.context.evaluated_depsgraph_get())); bpy.data.objects.remove(mo)
    o = ob(name, me_); o.parent = parent; o.location = -off   # mesh stays in cat space so the fur colours line up
    for p in o.data.polygons: p.use_smooth = True
    sm_ = o.modifiers.new('sm', 'SMOOTH'); sm_.iterations = smooth; sm_.factor = .7
    fur(o, fm, n, .0058, 34, -.65); return o
catBody = catpart('cat', BB, cf, Vector((0, 0, 0)), 22000)
catHeadM = catpart('cathead', BH + [((-.064, 0, .212), .035, (1, 1, 1.25))], pivH, HEADP, 7000, 10)
catTail = catpart('cattail', BT, pivT, TAILP, 4000, 6)
# ---- ears : thin, translucent, short dark fur outside
ears = []
earM = mat('earM', hexc('#6A5852'), .55, sss=.8)
earM.node_tree.nodes['Principled BSDF'].inputs['Subsurface Radius'].default_value = (.9, .35, .3)
for sg in (1, -1):
    bpy.ops.mesh.primitive_cone_add(vertices=32, radius1=.027, radius2=.0012, depth=.058, location=(0, 0, 0))
    ear = bpy.context.object; ear.name = 'ear%d' % sg; ear.scale = (.32, .82, .82)
    ear.parent = pivH; ear.location = Vector((-.07, sg * .027, .295)) - HEADP; ear.rotation_euler = (sg * -.42, -.15, sg * .25)
    for p in ear.data.polygons: p.use_smooth = True
    ear.data.materials.append(earM); fur(ear, furPoint, 900, .0022, 12, 0, .00012, .2); ears.append(ear)
# ---- eyes, nose, whiskers
eyeM = mat('eye', hexc('#9DB7D6'), .02, coat=1, ior=1.38)
for sg in (1, -1):
    e_ = cyl('eye%d' % sg, .0075, .004, Vector((-.104, sg * .019, .262)) - HEADP, eyeM, rot=(0, math.pi / 2 - .25, sg * .35), v=24, parent=pivH)
cyl('nose', .0045, .004, Vector((-.1245, 0, .252)) - HEADP, mat('nose', hexc('#3B2E2C'), .35), rot=(0, math.pi / 2, 0), v=16, parent=pivH)
whM = mat('whisk', hexc('#F4F1EA'), .3)
for sg in (1, -1):
    for k in range(6):
        cv_ = bpy.data.curves.new('wh', 'CURVE'); cv_.dimensions = '3D'; cv_.bevel_depth = .00022
        sp_ = cv_.splines.new('BEZIER'); sp_.bezier_points.add(2)
        a0 = Vector((-.115, sg * .012, .244 + (k % 3) * .003))
        pts_ = [a0, a0 + Vector((.01, sg * .03, -.002 - k * .002)), a0 + Vector((.03, sg * .062, -.008 - k * .005))]
        for p_, co in zip(sp_.bezier_points, pts_): p_.co = co; p_.handle_left_type = p_.handle_right_type = 'AUTO'
        w_ = ob('whisker%d_%d' % (sg, k), cv_); w_.data.materials.append(whM); w_.parent = pivH; w_.location = -HEADP
tail = catBody; catBib = catHead = catLegs = catPaws = catBody
cat, cap_ = catBody, catBody
catg = empty('catg')
zone(cf, 'chat')

# ---------------------------------------------------------------- glTF models
def glb(name, h, loc, rz=0, z=None):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath='/tmp/rd/old/' + name + '.glb')
    new = [o for o in bpy.data.objects if o not in before]
    roots = [o for o in new if o.parent is None]
    root = empty('g_' + name)
    for r in roots: r.parent = root
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == 'MESH' for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); mxv = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    s = h / (mxv.z - mn.z)
    root.scale = (s, s, s)
    ctr = (mn + mxv) / 2
    for r in roots: r.location -= Vector((ctr.x, ctr.y, mn.z))
    root.location = loc; root.rotation_euler = (0, 0, rz)
    return root

pla = glb('DiffuseTransmissionPlant', 1.05, (-1.06, -.78, 0), .4); zone(pla, 'plante')
tea = mg_

# ---------------------------------------------------------------- extra warm details
cj = empty('candle', (.6, .44, YB))
cyl('cj_glass', .032, .07, (0, 0, .035), mat('amber', hexc('#B8742E'), .05, trans=.85, ior=1.5), v=48, cap=False, parent=cj).modifiers.new('s', 'SOLIDIFY').thickness = .002
cyl('cj_wax', .029, .045, (0, 0, .024), mat('wax', hexc('#EFE6D6'), .5, sss=.6), v=48, parent=cj)
cyl('cj_wick', .0012, .01, (0, 0, .051), blackM, v=6, bev=0, parent=cj)
if MOMENT in ('soir', 'nuit'):
    fl_ = cyl('flame', .004, .014, (0, 0, .062), emis('flame', (1, .62, .25), 40), r2=.0005, v=12, bev=0, parent=cj)
    bpy.ops.object.light_add(type='POINT', location=(.6, .44, YB + .065)); cl_ = bpy.context.object; cl_.data.energy = 1.2; cl_.data.color = (1, .6, .3); cl_.data.shadow_soft_size = .01
sp_ = empty('succulent', (.2, .45, YB))
cyl('sc_pot', .03, .045, (0, 0, .0225), mat('concrete', hexc('#B9B4AC'), .9), v=48, parent=sp_)
cyl('sc_soil', .027, .002, (0, 0, .044), mat('soil', hexc('#3A2B20'), 1), v=32, bev=0, parent=sp_)
leafM = mat('leafS', hexc('#7D9A7E'), .45, sss=.2)
for k in range(14):
    a = k * 2.399; rr = .006 + .0014 * k
    lf = cyl('sc_l%d' % k, .006, .03, (math.cos(a) * rr, math.sin(a) * rr, .056 - k * .0006), leafM, r2=.001, v=12, bev=0, parent=sp_)
    lf.rotation_euler = (math.cos(a) * (.3 + k * .06), -math.sin(a) * (.3 + k * .06), 0); lf.scale = (1, .55, 1)


# floating oak shelf on the right with books, vase and a small print
shf = empty('shelf2', (.9, WALL - .1, 1.25))
box('sh2_board', .62, .2, .028, (0, 0, 0), oakW, .004, parent=shf)
x_ = -.28
for i, (w, h, c) in enumerate([(.03, .22, '#2D3A33'), (.022, .2, '#C9B9A0'), (.035, .24, '#7A4A35'), (.025, .19, '#E7DFD0'), (.03, .215, '#1E1E1E'), (.02, .2, '#B98A4E')]):
    box('sb%d' % i, w, .15, h, (x_ + w / 2, .01, .014 + h / 2), mat('sbm%d' % i, hexc(c), .65), .002, parent=shf); x_ += w + .003
box('sb_lean', .028, .15, .2, (x_ + .03, .01, .014 + .1), mat('sbl', hexc('#8E9A86'), .65), .002, rot=(0, -.25, 0), parent=shf)
vz = cyl('sh_vase', .045, .16, (.1, .0, .094), mat('vaseM', hexc('#D8CBB7'), .5, coat=.3), r2=.03, v=48, parent=shf)
stemM = mat('stem', hexc('#B89A6E'), .7)
for k in range(9):
    a = k * .7; tilt = .15 + .05 * (k % 3)
    st = cyl('stem%d' % k, .0018, .1, (.1 + math.sin(a) * .03, math.cos(a) * .015, .19), stemM, rot=(math.cos(a) * tilt, math.sin(a) * tilt, 0), v=6, bev=0, parent=shf)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=.018, location=(0, 0, .05)); fl_ = bpy.context.object; fl_.parent = st; fl_.scale = (.6, .6, 1.5); fl_.data.materials.append(mat('pampas', hexc('#E3D3B5'), .9, sss=.4))

# ---------------------------------------------------------------- fine details
def img_alpha(name, path, rough=.5):
    m = img_mat(name, path, rough); N_, L_, b_ = nodes(m)
    L_.new([n for n in N_ if n.type == 'TEX_IMAGE'][0].outputs['Alpha'], b_.inputs['Alpha']); return m
plane('kb_leg', kw, .118, (0, 0, .01115), img_alpha('kbl', '/tmp/rd/kb_leg.png', .4), rot=(0, 0, 0), parent=kb)
plane('lap_leg', .27, .1, (0, .032, .01245), img_alpha('lpl', '/tmp/rd/lap_leg.png', .5), rot=(0, 0, 0), parent=lap)
ZONES['kb_leg'] = 'web'; ZONES['lap_leg'] = 'web'
# spines on the shelf books
x_ = -.28
for i, (w, h) in enumerate([(.03, .22), (.022, .2), (.035, .24), (.025, .19), (.03, .215), (.02, .2)]):
    plane('spine%d' % i, w - .002, h - .004, (x_ + w / 2, .01 - .0755, .014 + h / 2), img_mat('spm%d' % i, '/tmp/rd/spine%d.png' % i, .6), parent=shf); x_ += w + .003
def roughvar(m, lo, hi, sc=40):
    N_, L_, b_ = nodes(m); tc_ = N_.new('ShaderNodeTexCoord'); nz = N_.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = sc; nz.inputs['Detail'].default_value = 6
    L_.new(tc_.outputs['Object'], nz.inputs['Vector']); mr_ = N_.new('ShaderNodeMapRange'); mr_.inputs['From Min'].default_value = .35; mr_.inputs['From Max'].default_value = .75
    mr_.inputs['To Min'].default_value = lo; mr_.inputs['To Max'].default_value = hi; L_.new(nz.outputs['Fac'], mr_.inputs['Value']); L_.new(mr_.outputs['Result'], b_.inputs['Roughness'])
    if 'Coat Roughness' in b_.inputs:
        L_.new(mr_.outputs['Result'], b_.inputs['Coat Roughness'])
roughvar(glassBlk, .02, .16, 30); roughvar(silver, .25, .31, 25); roughvar(spaceG, .26, .42, 60); roughvar(oakW, .3, .5, 8); roughvar(leather, .45, .7, 20)
def cable(name, pts, r=.0022, m=None):
    cv_ = bpy.data.curves.new(name, 'CURVE'); cv_.dimensions = '3D'; cv_.bevel_depth = r; cv_.bevel_resolution = 3
    sp_ = cv_.splines.new('BEZIER'); sp_.bezier_points.add(len(pts) - 1)
    for p_, co in zip(sp_.bezier_points, pts): p_.co = co; p_.handle_left_type = p_.handle_right_type = 'AUTO'
    o = ob(name, cv_); o.data.materials.append(m or blackM); return o
cable('lamp_cable', [(-.56, .47, YB + .01), (-.59, .487, YB + .003), (-.57, .507, YB - .016), (-.52, WALL - .012, YB - .1), (-.47, WALL - .012, .3), (-.43, WALL - .012, .03)], .0022)
cable('lap_cable', [(.78, .02, YB + .006), (.83, .1, YB + .002), (.82, .3, YB + .002), (.8, .47, YB + .002), (.79, .507, YB - .016), (.77, WALL - .012, YB - .1), (.76, WALL - .02, .45), (.745, WALL - .045, .34), (.74, WALL - .05, .318)], .002, whiteP)
strapM = mat('strap', hexc('#1B1A19'), .85); bump(strapM, 900, .25, kind='vor')
cvs = bpy.data.curves.new('cam_strap', 'CURVE'); cvs.dimensions = '3D'; cvs.extrude = .0105; cvs.twist_mode = 'Z_UP'; cvs.resolution_u = 24
sps = cvs.splines.new('BEZIER'); STP = [(-.067, .014, .072, 1.5708), (-.072, .028, .05, 1.0), (-.08, .05, .02, .3), (-.088, .085, .0035, 0), (-.07, .15, .0035, 0), (-.02, .19, .0035, 0),
    (.04, .185, .0035, 0), (.085, .13, .0035, 0), (.092, .07, .0035, 0), (.083, .042, .02, .3), (.074, .026, .05, 1.0), (.068, .014, .072, 1.5708)]
sps.bezier_points.add(len(STP) - 1)
for p_, (x, y, z, tl) in zip(sps.bezier_points, STP): p_.co = (x, y, z); p_.tilt = tl; p_.handle_left_type = p_.handle_right_type = 'AUTO'
st_o = ob('cam_strap', cvs); st_o.data.materials.append(strapM); st_o.parent = cam_o; st_o.modifiers.new('s', 'SOLIDIFY').thickness = .0016
for sg in (-1, 1):
    bpy.ops.mesh.primitive_torus_add(major_radius=.0045, minor_radius=.0009, location=(sg * .0665, .013, .075), rotation=(0, math.pi / 2, 0))
    rg_ = bpy.context.object; rg_.parent = cam_o; rg_.data.materials.append(silver)
    box('cb_lug%d' % (sg > 0), .006, .008, .01, (sg * .064, .013, .078), camBody, .002, parent=cam_o)
ZONES['cam_strap'] = 'photo'

# ================================================================ chair : walnut shell, cognac leather, polished aluminium star base
cognac = mat('cognac', hexc('#8E5530'), .42, coat=.25, coatr=.35, sheen=.15)
N_, L_, b_ = nodes(cognac); tc_ = N_.new('ShaderNodeTexCoord')
vo_ = N_.new('ShaderNodeTexVoronoi'); vo_.inputs['Scale'].default_value = 650; L_.new(tc_.outputs['Object'], vo_.inputs['Vector'])
nz_ = N_.new('ShaderNodeTexNoise'); nz_.inputs['Scale'].default_value = 25; nz_.inputs['Detail'].default_value = 4; L_.new(tc_.outputs['Object'], nz_.inputs['Vector'])
cr_ = N_.new('ShaderNodeValToRGB'); cr_.color_ramp.elements[0].color = (*hexc('#6E3E22'), 1); cr_.color_ramp.elements[1].color = (*hexc('#A2643A'), 1); L_.new(nz_.outputs['Fac'], cr_.inputs['Fac']); L_.new(cr_.outputs['Color'], b_.inputs['Base Color'])
bpv = N_.new('ShaderNodeBump'); bpv.inputs['Strength'].default_value = .25; bpv.inputs['Distance'].default_value = .0006; L_.new(vo_.outputs['Distance'], bpv.inputs['Height']); L_.new(bpv.outputs['Normal'], b_.inputs['Normal'])
polish = mat('polish', hexc('#D9DBDE'), .12, 1)
def arcslab(name, R_, a0, a1, z0, z1, cy, th, m, parent, nseg=24):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rows = []
    for j in range(7):
        z = z0 + (z1 - z0) * j / 6; row = []
        for i in range(nseg + 1):
            a = math.radians(a0 + (a1 - a0) * i / nseg); row.append(bm.verts.new((R_ * math.sin(a), cy - R_ * math.cos(a), z)))
        rows.append(row)
    for j in range(6):
        for i in range(nseg): bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
    bm.to_mesh(me); bm.free(); o = ob(name, me); o.parent = parent; o.data.materials.append(m)
    so = o.modifiers.new('s', 'SOLIDIFY'); so.thickness = th; so.offset = 0
    bv = o.modifiers.new('b', 'BEVEL'); bv.width = th * .45; bv.segments = 4; bv.limit_method = 'ANGLE'
    o.modifiers.new('sub', 'SUBSURF').levels = 1
    for p in o.data.polygons: p.use_smooth = True
    return o
boucle = mat('boucle', hexc('#EEE7DA'), .95, sheen=1)
N_, L_, b_ = nodes(boucle); tc_ = N_.new('ShaderNodeTexCoord')
vo1 = N_.new('ShaderNodeTexVoronoi'); vo1.inputs['Scale'].default_value = 420; vo1.feature = 'SMOOTH_F1' if hasattr(vo1, 'feature') else vo1.feature
vo2 = N_.new('ShaderNodeTexNoise'); vo2.inputs['Scale'].default_value = 900; vo2.inputs['Detail'].default_value = 6
L_.new(tc_.outputs['Object'], vo1.inputs['Vector']); L_.new(tc_.outputs['Object'], vo2.inputs['Vector'])
ad_ = N_.new('ShaderNodeMath'); ad_.operation = 'ADD'; L_.new(vo1.outputs['Distance'], ad_.inputs[0]); L_.new(vo2.outputs['Fac'], ad_.inputs[1])
bpc = N_.new('ShaderNodeBump'); bpc.inputs['Strength'].default_value = 1.0; bpc.inputs['Distance'].default_value = .002; L_.new(ad_.outputs[0], bpc.inputs['Height']); L_.new(bpc.outputs['Normal'], b_.inputs['Normal'])
crb = N_.new('ShaderNodeValToRGB'); crb.color_ramp.elements[0].color = (*hexc('#D9CFBE'), 1); crb.color_ramp.elements[1].color = (*hexc('#F3EDE2'), 1); L_.new(vo1.outputs['Distance'], crb.inputs['Fac']); L_.new(crb.outputs['Color'], b_.inputs['Base Color'])
metalB = mat('metalB', hexc('#1C1C1C'), .4, .8)
def tub(name, R_, a0, a1, zlo, zhi_f, cy, th, m, parent, nseg=48):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rows = []
    for j in range(9):
        row = []
        for i in range(nseg + 1):
            t = i / nseg; a = math.radians(a0 + (a1 - a0) * t); zt = zhi_f(abs(2 * t - 1))
            z = zlo + (zt - zlo) * j / 8; row.append(bm.verts.new((R_ * math.sin(a), cy - R_ * math.cos(a), z)))
        rows.append(row)
    for j in range(8):
        for i in range(nseg): bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
    bm.to_mesh(me); bm.free(); o = ob(name, me); o.parent = parent; o.data.materials.append(m)
    so = o.modifiers.new('s', 'SOLIDIFY'); so.thickness = th; so.offset = 0
    bv = o.modifiers.new('b', 'BEVEL'); bv.width = th * .48; bv.segments = 6; bv.limit_method = 'ANGLE'
    o.modifiers.new('sub', 'SUBSURF').levels = 2
    for p in o.data.polygons: p.use_smooth = True
    return o
chair = empty('chair', (.12, -.48, 0), (0, 0, math.radians(-14)))
SH = .47
cyl('ch_col', .022, .33, (0, 0, .27), metalB, v=32, parent=chair)
cyl('ch_hub', .04, .04, (0, 0, .1), metalB, v=40, parent=chair)
for k in range(4):
    a = k * math.pi / 2 + math.pi / 4; tip = Vector((math.cos(a) * .3, math.sin(a) * .3, .012))
    rod('ch_leg%d' % k, (0, 0, .11), tip, .011, metalB, parent=chair)
    cyl('ch_glide%d' % k, .013, .01, tip + Vector((0, 0, -.004)), mat('glide', hexc('#111111'), .5), parent=chair)
box('ch_plate', .22, .22, .02, (0, 0, SH - .04), metalB, .006, parent=chair)
cs_ = box('ch_seat', .5, .47, .1, (0, .02, SH + .02), boucle, .045, seg=6, parent=chair); cs_.modifiers.new('sub', 'SUBSURF').levels = 2
tub('ch_tub', .27, -128, 128, SH - .03, lambda u: SH + .2 + .24 * (1 - u) ** 1.5, -.02, .075, boucle, chair)
# ================================================================ extra realism details
# wall sockets and switch behind the desk, cables plugged in
sockM = mat('sock', hexc('#EFEAE1'), .35)
for k, x in enumerate((.66, .74)):
    box('socket%d' % k, .07, .012, .07, (x, WALL - .006, .3), sockM, .006)
    cyl('sockhole%d' % k, .019, .004, (x, WALL - .013, .3), mat('sockin', hexc('#D8D2C8'), .5), rot=(math.pi / 2, 0, 0), parent=None)
    box('plug%d' % k, .035, .03, .035, (x, WALL - .03, .3), whiteP if k else blackM, .006)
box('switch', .075, .012, .075, (-1.05, WALL - .006, 1.12), sockM, .006)
box('switch_k', .05, .006, .05, (-1.05, WALL - .014, 1.12), sockM, .004)
# window handle (brass espagnolette)
box('wh_plate', .012, .03, .1, (WX - NI + .06, -.25, 1.4), brassM, .004)
rod('wh_lever', (WX - NI + .07, -.25, 1.42), (WX - NI + .07, -.25, 1.3), .006, brassM)
# cork coaster under the mug
cyl('coaster', .052, .005, (-.34, .09, YB + .0025), cork, v=64)
mg_.location.z = YB + .005
# walnut desk tray with pens
tr = empty('tray', (-.2, .3, YB), (0, 0, math.radians(-4)))
box('tray_b', .2, .09, .006, (0, 0, .003), oakW, .002, parent=tr)
for sg in (1, -1): box('tray_s%d' % sg, .2, .006, .016, (0, sg * .042, .008), oakW, .002, parent=tr)
for k, c in enumerate(['#1E1E1E', '#B84A32', '#D9B44A']):
    cyl('tpen%d' % k, .0042, .145, (-.01 + k * .004, -.02 + k * .018, .011), mat('tpm%d' % k, hexc(c), .35), rot=(0, math.pi / 2, .04 * k), v=12, parent=tr)
# stitching on the desk mat
box('mat_stitch', .78, .32, .0004, (.06, -.02, YB + .0032), mat('stitch', hexc('#C9A47A'), .6), .0002)
box('mat_stitch_in', .772, .312, .0005, (.06, -.02, YB + .00325), leather, .0002)

# trailing pothos on the shelf
pp_ = empty('pothos', (.885, WALL - .1, 1.25 + .014))
cyl('po_pot', .05, .085, (.0, .0, .0425), mat('terraPot', hexc('#A65A3A'), .7), r2=.04, v=48, parent=pp_)
cyl('po_soil', .046, .003, (0, 0, .083), mat('soil2', hexc('#3A2B20'), 1), v=32, bev=0, parent=pp_)
leafP = mat('leafP', hexc('#3F6B3A'), .38, sss=.15, coat=.3)
def heart_leaf(L):
    # pothos leaf : heart outline, midrib fold, cupped, hanging from its petiole at the top (origin)
    me = bpy.data.meshes.new('leaf'); bm = bmesh.new(); N = 28; rings = 6; prev = None; ctr = bm.verts.new((0, 0, -L * .42))
    out = []
    for i in range(N):
        a = 2 * math.pi * i / N; x = 16 * math.sin(a) ** 3; y = 13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)
        out.append((x / 34 * L, -(y + 5) / 34 * L - L * .1))
    grid = []
    for r in range(1, rings + 1):
        f = r / rings; row = []
        for (x, z) in out:
            X = x * f; Z = -L * .42 + (z + L * .42) * f; Y = -abs(X) * .35 - (X * X) * 6 + .004 * math.sin(Z * 80)
            row.append(bm.verts.new((X, Y, Z)))
        grid.append(row)
    for i in range(N): bm.faces.new((ctr, grid[0][i], grid[0][(i + 1) % N]))
    for r in range(rings - 1):
        for i in range(N): bm.faces.new((grid[r][i], grid[r][(i + 1) % N], grid[r + 1][(i + 1) % N], grid[r + 1][i]))
    bm.to_mesh(me); bm.free(); [setattr(p, 'use_smooth', True) for p in me.polygons]
    return me
random.seed(11)
for v_ in range(5):
    ang = v_ * 1.3 - 2.6; px_, py_, pz_ = 0, 0, .085
    for k in range(13):
        t = k / 12
        px_ += math.cos(ang) * .018 * (1 - t * .3); py_ += -abs(math.sin(ang)) * .012 - .004
        pz_ += .012 if k < 2 else -.028 - .01 * t
        if k >= 2 and py_ > -.12: py_ = min(py_, -.105)
        lf = ob('po_l%d_%d' % (v_, k), heart_leaf(.042 - .012 * t)); lf.parent = pp_; lf.location = (px_, py_ - .004, pz_)
        lf.rotation_euler = (random.uniform(-.35, .15), random.uniform(-.35, .35), random.uniform(-.7, .7) + (k % 2 - .5) * 1.1)
        lf.data.materials.append(leafP)
        if k: rod('po_st%d_%d' % (v_, k), (px_ - math.cos(ang) * .018, py_ + .012, pz_ + .028), (px_, py_, pz_), .0016, mat('stemG', hexc('#55703F'), .5), parent=pp_)

# ================================================================ realism pass 2
# skirting board along the window wall
box('skirt_l', .015, WALL + 3, .1, (WX + .007, (WALL - 3) / 2, .05), oakW, .002)
# column radiator under the window, white satin, brass valve
radM = mat('radM', hexc('#F2EEE8'), .32, coat=.25, coatr=.3)
rad = empty('radiator', (WX + .045, -.18, .16))
NC = 15
for k in range(NC):
    yk = (k - (NC - 1) / 2) * .042
    box('rad_c%d' % k, .06, .032, .52, (0, yk, .26), radM, .012, seg=4, parent=rad)
for zz in (.035, .485):
    cyl('rad_h%d' % (zz > .2), .014, NC * .042, (0, 0, zz), radM, rot=(math.pi / 2, 0, 0), v=24, parent=rad)
rod('rad_pipe', (0, -NC * .021 - .03, .035), (0, -NC * .021 - .03, -.16), .009, radM, parent=rad)
rod('rad_pipe2', (0, NC * .021 + .03, .035), (0, NC * .021 + .03, -.16), .009, radM, parent=rad)
cyl('rad_valve', .016, .05, (0, NC * .021 + .03, .075), brassM, v=32, parent=rad)
cyl('rad_knob', .022, .03, (0, NC * .021 + .03, .115), mat('knob', hexc('#ECE7DF'), .4), v=32, parent=rad)
for sg in (-1, 1): box('rad_br%d' % sg, .03, .02, .02, (-.035, sg * NC * .016, .44), radM, .004, parent=rad)
# ================================================================ AirPods-style case (generic, no logo) and two lenses on the sill
gloss = mat('glossW', hexc('#F4F3F0'), .18, coat=.6, coatr=.08)
ap = empty('earcase', (-.235, .175, YB), (0, 0, math.radians(24)))
box('ec_low', .0606, .0217, .031, (0, 0, .0155), gloss, .0095, seg=8, parent=ap)
box('ec_lid', .0606, .0217, .0138, (0, 0, .0383), gloss, .0095, seg=8, parent=ap)
box('ec_seam', .0598, .0209, .0007, (0, 0, .0313), mat('seam', hexc('#9A9893'), .5), .0002, parent=ap)
cyl('ec_led', .0011, .0004, (0, -.0109, .0205), mat('ledoff', hexc('#3A3A38'), .3), rot=(math.pi / 2, 0, 0), v=12, bev=0, parent=ap)
cyl('ec_hinge', .0018, .012, (0, .0109, .031), silver, rot=(0, math.pi / 2, 0), v=16, bev=0, parent=ap)
zone(ap, 'contact')
rubber = mat('rubberRib', hexc('#151515'), .75); N_, L_, b_ = nodes(rubber); tc_ = N_.new('ShaderNodeTexCoord')
grad = N_.new('ShaderNodeSeparateXYZ'); L_.new(tc_.outputs['Object'], grad.inputs['Vector'])
at_ = N_.new('ShaderNodeMath'); at_.operation = 'ARCTAN2'; L_.new(grad.outputs['Y'], at_.inputs[0]); L_.new(grad.outputs['X'], at_.inputs[1])
sn_ = N_.new('ShaderNodeMath'); sn_.operation = 'SINE'; ml_ = N_.new('ShaderNodeMath'); ml_.operation = 'MULTIPLY'; ml_.inputs[1].default_value = 90
L_.new(at_.outputs[0], ml_.inputs[0]); L_.new(ml_.outputs[0], sn_.inputs[0])
bpr = N_.new('ShaderNodeBump'); bpr.inputs['Strength'].default_value = .6; bpr.inputs['Distance'].default_value = .0008; L_.new(sn_.outputs[0], bpr.inputs['Height']); L_.new(bpr.outputs['Normal'], b_.inputs['Normal'])
satin = mat('lensSatin', hexc('#1C1C1D'), .42, coat=.2); bump(satin, 2000, .04)
alu = mat('lensMount', hexc('#C9CACC'), .25, 1)
def lens_stack(name, parts, loc, rot, front_glass=True, cap=False):
    """parts: list of (radius, height, material) from the mount upwards"""
    e = empty(name, loc, rot); z = 0
    for k, (r, h, m) in enumerate(parts):
        cyl('%s_p%d' % (name, k), r, h, (0, 0, z + h / 2), m, v=96, bev=min(.0012, h * .3), parent=e); z += h
    rf = parts[-1][0]
    if cap:
        cyl(name + '_cap', rf - .001, .007, (0, 0, z + .0035), rubber, v=96, bev=.0015, parent=e)
        cyl(name + '_capc', rf * .55, .0012, (0, 0, z + .0072), satin, v=64, bev=.0005, parent=e)
    elif front_glass:
        cyl(name + '_thr', rf - .0015, .003, (0, 0, z - .0015), alu, v=96, bev=.0003, parent=e)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=rf * 1.3, location=(0, 0, z - rf * 1.3 + .004), segments=64, ring_count=32)
        dm_ = bpy.context.object; dm_.parent = e; dm_.data.materials.append(lensglass); [setattr(p, 'use_smooth', True) for p in dm_.data.polygons]
        bpy.ops.object.modifier_add(type='BOOLEAN'); bo = dm_.modifiers[-1]
        cutter = cyl(name + '_cut', rf - .0035, .02, (0, 0, z - .005), lensglass, v=96, bev=0, parent=e); cutter.hide_render = True; cutter.display_type = 'WIRE'
        bo.operation = 'INTERSECT'; bo.object = cutter
    zone(e, 'photo')
    return e
# 50 mm prime standing on its rear cap, glass up
lens_stack('lensA', [(.0285, .011, rubber), (.03, .004, alu), (.0335, .018, satin), (.034, .022, rubber), (.034, .006, satin), (.0342, .007, satin)],
           (WX - .2, -.27, WZ0 + .015), (0, 0, 0), cap=True)
# 85 mm lying on its side, front cap on
lB = lens_stack('lensB', [(.032, .012, rubber), (.0335, .004, alu), (.0385, .022, satin), (.039, .03, rubber), (.0385, .012, satin), (.04, .01, satin)],
           (WX - .2, -.165, WZ0 + .015), (0, 0, 0), cap=True)
