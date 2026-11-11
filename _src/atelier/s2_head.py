import bpy, bmesh, math, sys, json, random, os
from mathutils import Vector, Euler, Matrix
from bpy_extras.object_utils import world_to_camera_view

A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
MOMENT = A[0] if len(A) > 0 else 'jour'
LAMPE = (A[1] == '1') if len(A) > 1 else MOMENT in ('soir', 'nuit')
RX = int(A[2]) if len(A) > 2 else 960
SAMP = int(A[3]) if len(A) > 3 else 64
MODE = A[4] if len(A) > 4 else 'beauty'   # beauty | mask | depth
OUT = A[5] if len(A) > 5 else '/tmp/rd/out.png'
SITE = '/home/claude/site'
random.seed(7)

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.unit_settings.system = 'METRIC'
ZONES = {}  # obj name -> zone id
YB = .75
WALL = .55

# ---------------------------------------------------------------- helpers
def link(o):
    S.collection.objects.link(o); return o

def ob(name, mesh):
    return link(bpy.data.objects.new(name, mesh))

def smooth(o, bev=.003, seg=3, ang=None):
    for p in o.data.polygons: p.use_smooth = True
    if bev:
        m = o.modifiers.new('b', 'BEVEL'); m.width = bev; m.segments = seg; m.limit_method = 'ANGLE'; m.harden_normals = True
    return o

def box(name, w, d, h, loc, mat, bev=.003, rot=(0, 0, 0), seg=3, parent=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=(w, d, h), verts=bm.verts); bm.to_mesh(me); bm.free()
    o = ob(name, me); o.location = loc; o.rotation_euler = rot; o.data.materials.append(mat)
    smooth(o, bev, seg)
    if parent: o.parent = parent
    return o

def cyl(name, r, h, loc, mat, rot=(0, 0, 0), v=48, bev=.0015, r2=None, parent=None, cap=True):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=cap, segments=v, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bm.to_mesh(me); bm.free()
    o = ob(name, me); o.location = loc; o.rotation_euler = rot; o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    if bev:
        m = o.modifiers.new('b', 'BEVEL'); m.width = bev; m.segments = 2; m.limit_method = 'ANGLE'; m.angle_limit = math.radians(50); m.harden_normals = True
    if parent: o.parent = parent
    return o

def plane(name, w, h, loc, mat, rot=(math.pi / 2, 0, 0), parent=None):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=.5); bmesh.ops.scale(bm, vec=(w, h, 1), verts=bm.verts)
    uv = bm.loops.layers.uv.new()
    for f in bm.faces:
        for l in f.loops: l[uv].uv = (l.vert.co.x / w + .5, l.vert.co.y / h + .5)
    bm.to_mesh(me); bm.free()
    o = ob(name, me); o.location = loc; o.rotation_euler = rot; o.data.materials.append(mat)
    if parent: o.parent = parent
    return o

def sheet(name, w, h, t, loc, mat, rot=(math.pi / 2, 0, 0), edge=None, parent=None):
    """thin card with image on front face"""
    o = plane(name, w, h, loc, mat, rot, parent)
    m = o.modifiers.new('s', 'SOLIDIFY'); m.thickness = t; m.offset = -1
    if edge: o.data.materials.append(edge); m.material_offset = 1; m.material_offset_rim = 1
    return o

def empty(name, loc=(0, 0, 0), rot=(0, 0, 0)):
    e = bpy.data.objects.new(name, None); e.location = loc; e.rotation_euler = rot; link(e); return e

def zone(o, z):
    ZONES[o.name] = z
    for c in o.children_recursive: ZONES[c.name] = z
    return o

# ---------------------------------------------------------------- materials
def mat(name, col=(.8, .8, .8), rough=.5, metal=0, **k):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*col, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    for kk, vv in k.items():
        inp = {'coat': 'Coat Weight', 'coatr': 'Coat Roughness', 'trans': 'Transmission Weight', 'ior': 'IOR', 'sss': 'Subsurface Weight', 'spec': 'Specular IOR Level', 'aniso': 'Anisotropic', 'sheen': 'Sheen Weight'}[kk]
        b.inputs[inp].default_value = vv
    return m

def nodes(m):
    return m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes['Principled BSDF']

def hexc(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + .055) / 1.055) ** 2.4 if x > .04045 else x / 12.92 for x in c)

def bump(m, scale=200, strength=.05, detail=8, kind='noise', dist=.002):
    N, L, b = nodes(m)
    tc = N.new('ShaderNodeTexCoord')
    if kind == 'noise':
        t = N.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value = scale; t.inputs['Detail'].default_value = detail
    else:
        t = N.new('ShaderNodeTexVoronoi'); t.inputs['Scale'].default_value = scale
    L.new(tc.outputs['Object'], t.inputs['Vector'])
    bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength; bp.inputs['Distance'].default_value = dist
    L.new(t.outputs[0] if kind == 'noise' else t.outputs['Distance'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
    return t

def img_mat(name, path, rough=.45, emis=0, coat=0, ext='CLIP'):
    m = bpy.data.materials.new(name); m.use_nodes = True; N, L, b = nodes(m)
    t = N.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(path); t.extension = ext; t.interpolation = 'Cubic'
    L.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat
    if emis:
        L.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = emis
        b.inputs['Base Color'].default_value = (0, 0, 0, 1); L.remove(b.inputs['Base Color'].links[0]); b.inputs['Roughness'].default_value = .08; b.inputs['Coat Weight'].default_value = 1
    return m

# oak: wave rings + noise
oak = mat('oak', rough=.42, coat=.15, coatr=.25)
N, L, b = nodes(oak)
tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 9, 1)
L.new(tc.outputs['Object'], mp.inputs['Vector'])
nz = N.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3; nz.inputs['Detail'].default_value = 6; nz.inputs['Distortion'].default_value = 1.2
L.new(mp.outputs['Vector'], nz.inputs['Vector'])
wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'; wv.inputs['Scale'].default_value = 2.2; wv.inputs['Distortion'].default_value = 9; wv.inputs['Detail'].default_value = 3
L.new(mp.outputs['Vector'], wv.inputs['Vector'])
fine = N.new('ShaderNodeTexNoise'); fine.inputs['Scale'].default_value = 400; fine.inputs['Detail'].default_value = 2
mp2 = N.new('ShaderNodeMapping'); mp2.inputs['Scale'].default_value = (1, 40, 1); L.new(tc.outputs['Object'], mp2.inputs['Vector']); L.new(mp2.outputs['Vector'], fine.inputs['Vector'])
mx = N.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'; mx.inputs[1].default_value = .6; L.new(wv.outputs['Fac'], mx.inputs[0]); L.new(fine.outputs['Fac'], mx.inputs[2])
cr = N.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].color = (*hexc('#9A6B3E'), 1); cr.color_ramp.elements[1].color = (*hexc('#D3A877'), 1)
cr.color_ramp.elements[0].position = .25; cr.color_ramp.elements[1].position = .85
L.new(mx.outputs[0], cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .08; bp.inputs['Distance'].default_value = .0005; L.new(fine.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])

plaster = mat('plaster', hexc('#E6DED2'), .92); bump(plaster, 90, .12, 10, dist=.004)
plaster_win = mat('plasterw', hexc('#E9E2D7'), .92); bump(plaster_win, 90, .12, 10, dist=.004)
floor = mat('floor', hexc('#7A5233'), .5, coat=.3)
N, L, b = nodes(floor)
br = N.new('ShaderNodeTexBrick'); br.inputs['Scale'].default_value = 1.6; br.inputs['Mortar Size'].default_value = .002
br.inputs['Color1'].default_value = (*hexc('#6E4527'), 1); br.inputs['Color2'].default_value = (*hexc('#8E6240'), 1); br.offset = .5
br.inputs['Brick Width'].default_value = 1.2; br.inputs['Row Height'].default_value = .14
L.new(br.outputs['Color'], b.inputs['Base Color'])
steel = mat('steel', hexc('#161616'), .45, .7); bump(steel, 1200, .03)
alu = mat('alu', hexc('#C9CBCE'), .26, 1, aniso=.4)
aluD = mat('aluD', hexc('#4D5055'), .3, 1)
blackG = mat('blackG', hexc('#0B0B0C'), .25, coat=.6)
blackM = mat('blackM', hexc('#121212'), .62); bump(blackM, 900, .05)
rubber = mat('rubber', hexc('#141414'), .85)
N, L, b = nodes(rubber); tc = N.new('ShaderNodeTexCoord'); wv = N.new('ShaderNodeTexWave'); wv.wave_type = 'RINGS'; wv.rings_direction = 'Z'; wv.inputs['Scale'].default_value = 60
L.new(tc.outputs['Object'], wv.inputs['Vector']); bp = N.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = .5; L.new(wv.outputs['Fac'], bp.inputs['Height']); L.new(bp.outputs['Normal'], b.inputs['Normal'])
glass = mat('glass', (1, 1, 1), 0, trans=1, ior=1.5)
lensglass = mat('lensg', hexc('#1A2230'), .02, coat=1, ior=1.6)
whiteP = mat('whiteP', hexc('#EEEBE5'), .38)
paper = mat('paper', hexc('#F4EFE6'), .8, sss=.05)
cream = mat('cream', hexc('#F5F1E8'), .55)
felt = mat('felt', hexc('#3A3936'), .95, sheen=.6); bump(felt, 600, .2)
lav = mat('lav', hexc('#B6A2F7'), .5)
cork = mat('cork', hexc('#A9825A'), .8); bump(cork, 300, .3, kind='vor')
brass = mat('brass', hexc('#C7A162'), .3, 1)
woodClip = mat('clip', hexc('#C8A27A'), .6)
ceram = mat('ceram', hexc('#F2EEE7'), .18, coat=.8)
terracotta = mat('terra', hexc('#B86A47'), .75)
linen = mat('linen', hexc('#F1ECE2'), .9, trans=.0, sss=.3, sheen=.5)
lampSh = mat('lampSh', hexc('#1E1E1E'), .5, .2)
fabric = mat('fabric', hexc('#55504A'), .95, sheen=.5); bump(fabric, 500, .25)

def emis(name, col, st):
    m = bpy.data.materials.new(name); m.use_nodes = True; N, L, b = nodes(m)
    b.inputs['Base Color'].default_value = (0, 0, 0, 1); b.inputs['Emission Color'].default_value = (*col, 1); b.inputs['Emission Strength'].default_value = st
    return m

