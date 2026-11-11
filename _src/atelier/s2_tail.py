# ---------------------------------------------------------------- world and sun
W = bpy.data.worlds.new('w'); S.world = W; W.use_nodes = True
N, L = W.node_tree.nodes, W.node_tree.links
bg = N['Background']
HD = {'matin': ('forest_slope_1k', .8, .35), 'jour': ('rooitou_park_1k', 1.0, .45), 'soir': ('forest_slope_1k', .45, .22), 'nuit': ('dikhololo_night_1k', .6, .08)}[MOMENT]
ROT = float(os.environ.get('HROT', {'matin': 0, 'jour': 0, 'soir': 0, 'nuit': 0}[MOMENT]))
et = N.new('ShaderNodeTexEnvironment'); et.image = bpy.data.images.load('/tmp/rd/hdri/%s.hdr' % HD[0])
tc_ = N.new('ShaderNodeTexCoord'); mpw = N.new('ShaderNodeMapping'); mpw.inputs['Rotation'].default_value = (0, 0, math.radians(ROT))
W.node_tree.links.new(tc_.outputs['Generated'], mpw.inputs['Vector']); W.node_tree.links.new(mpw.outputs['Vector'], et.inputs['Vector'])
bg2 = N.new('ShaderNodeBackground'); bg.inputs['Strength'].default_value = HD[2]; bg2.inputs['Strength'].default_value = HD[1]
L.new(et.outputs['Color'], bg.inputs['Color']); L.new(et.outputs['Color'], bg2.inputs['Color'])
lp = N.new('ShaderNodeLightPath'); mxm = N.new('ShaderNodeMath'); mxm.operation = 'MAXIMUM'
L.new(lp.outputs['Is Camera Ray'], mxm.inputs[0]); L.new(lp.outputs['Is Transmission Ray'], mxm.inputs[1])
ms = N.new('ShaderNodeMixShader'); L.new(mxm.outputs[0], ms.inputs['Fac']); L.new(bg.outputs[0], ms.inputs[1]); L.new(bg2.outputs[0], ms.inputs[2])
L.new(ms.outputs[0], N['World Output'].inputs['Surface'])
SUN = {'matin': (0, 0, (1, .8, .62), 3.0), 'jour': (0, 0, (1, .9, .76), 3.6), 'soir': (0, 0, (1, .58, .32), 2.8), 'nuit': (0, 0, (.5, .6, 1), 0)}[MOMENT]
if SUN[3] > 0:
    bpy.ops.object.light_add(type='SUN'); sn = bpy.context.object
    el, az = math.radians(SUN[0]), math.radians(SUN[1])
    # light comes in through the left window: direction from -x side
    a2 = math.radians({'matin': -12, 'jour': 18, 'soir': 34}[MOMENT]); el = math.radians({'matin': 16, 'jour': 22, 'soir': 9}[MOMENT])
    d = Vector((math.cos(el) * math.cos(a2), math.cos(el) * math.sin(a2), -math.sin(el))).normalized()
    sn.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler(); sn.data.energy = SUN[3]; sn.data.color = SUN[2]; sn.data.angle = math.radians(1.2)
else:
    bpy.ops.object.light_add(type='AREA', location=(WX - .5, fy, fz + .3)); mn_ = bpy.context.object; mn_.data.size = 1; mn_.data.energy = 2.5; mn_.data.color = (.55, .65, 1)
    mn_.rotation_euler = (0, math.radians(-75), 0); mn_.visible_camera = False; mn_.visible_glossy = False; mn_.visible_transmission = False
# soft fill from the room behind the camera (bounce)
bpy.ops.object.light_add(type='AREA', location=(.6, -2.6, 1.8)); fl = bpy.context.object; fl.data.size = 2.5; fl.data.energy = {'matin': 16, 'jour': 20, 'soir': 8, 'nuit': 1.2}[MOMENT]
fl.data.color = (1, .88, .76) if MOMENT != 'nuit' else (.7, .75, 1); fl.rotation_euler = (math.radians(70), 0, 0); fl.visible_camera = False; fl.visible_glossy = False

# ---------------------------------------------------------------- camera
META = '/tmp/rd/meta-p.json' if os.environ.get('PORTRAIT') else '/tmp/rd/meta.json'
PORT = bool(os.environ.get('PORTRAIT'))
bpy.ops.object.camera_add(location=(-.1, -2.15, 1.36) if PORT else (.82, -1.22, 1.36)); cam = bpy.context.object; S.camera = cam
tgt = Vector((-.1, .55, 1.14)) if PORT else Vector((-.06, .3, 1.11))
cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 21.5; cam.data.sensor_width = 36
if PORT: cam.data.lens = 25; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36
cam.data.dof.use_dof = MODE == 'beauty'; cam.data.dof.focus_distance = (Vector((0, .1, YB + .15)) - cam.location).length; cam.data.dof.aperture_fstop = 2.8
S.render.resolution_x = RX; S.render.resolution_y = int(RX * 10 / 16) if PORT else int(RX * 9 / 16); S.render.resolution_percentage = 100

# ---------------------------------------------------------------- render settings
S.render.engine = 'CYCLES'; S.cycles.device = 'CPU'
S.cycles.samples = SAMP; S.cycles.use_adaptive_sampling = True; S.cycles.adaptive_threshold = float(os.environ.get('SEUIL', '.02'))
S.cycles.use_denoising = MODE == 'beauty'
S.cycles.use_auto_tile = True; S.cycles.tile_size = 768
S.cycles.max_bounces = 8; S.cycles.diffuse_bounces = 4; S.cycles.glossy_bounces = 4; S.cycles.transmission_bounces = 8; S.cycles.caustics_reflective = False; S.cycles.caustics_refractive = False
S.cycles.blur_glossy = 1.0
S.render.film_transparent = False
vs = S.view_settings
try:
    vs.view_transform = 'AgX'
    for lk in ('AgX - Medium High Contrast', 'Medium High Contrast', 'AgX - Base Contrast'):
        try: vs.look = lk; break
        except Exception: pass
except Exception: vs.view_transform = 'Filmic'
vs.exposure = {'matin': .3, 'jour': .15, 'soir': .35, 'nuit': .55}[MOMENT]
S.render.image_settings.file_format = 'PNG'; S.render.image_settings.color_mode = 'RGB'

def meta():
    bpy.context.view_layer.update()
    res = {}
    def proj(o, pts):
        out = []
        for p in pts:
            v = world_to_camera_view(S, cam, o.matrix_world @ Vector(p)); out.append([round(v.x, 5), round(1 - v.y, 5), round(v.z, 4)])
        return out
    def corners(o):
        me = o.data; vs_ = [v.co for v in me.vertices]
        xs = sorted(set(round(v.x, 6) for v in vs_)); ys = sorted(set(round(v.y, 6) for v in vs_))
        return [(xs[0], ys[-1], 0), (xs[-1], ys[-1], 0), (xs[-1], ys[0], 0), (xs[0], ys[0], 0)]  # TL TR BR BL
    for n in ('mon_screen', 'ph_scr', 'lap_scr', 'ip_scr'):
        o = bpy.data.objects[n]; res[n] = proj(o, corners(o))
    res['tea'] = proj(tea, [(0, 0, .085)])[0]
    res['lamp_head'] = proj(hd, [(0, 0, -.06)])[0]
    res['window'] = proj(bpy.data.objects['pane'], [(-.5, .5, 0), (.5, .5, 0), (.5, -.5, 0), (-.5, -.5, 0)]) if False else None
    res['focus'] = cam.data.dof.focus_distance
    def bbox(names):
        xs, ys = [], []
        for n in names:
            o = bpy.data.objects[n]
            for c in [o] + list(o.children_recursive):
                if c.type != 'MESH': continue
                for v in c.bound_box:
                    p = world_to_camera_view(S, cam, c.matrix_world @ Vector(v)); xs.append(p.x); ys.append(1 - p.y)
        return [round(min(xs), 4), round(min(ys), 4), round(max(xs), 4), round(max(ys), 4)]
    res['cibles'] = {'photo': bbox(['gallery']), 'web': bbox(['mon_screen']), 'graph': bbox(['ipad']), 'fill': bbox(['fill']), 'contact': bbox(['phone'])}
    json.dump(res, open(META, 'w'), indent=1)

if MODE == 'mask':
    # flat colours per zone, black elsewhere ; screen etc. own ids
    ZC = {'photo': 1, 'web': 2, 'graph': 3, 'fill': 4, 'contact': 5, 'lampe': 6, 'plante': 7, 'tasse': 8, 'neon': 9, 'declic': 10}
    # screen gets its own id (11) so the live desktop can be mapped exactly
    ZONES['mon_screen'] = 'ecran'; ZC['ecran'] = 11; ZC['chat'] = 12
    cache = {}
    def em(v):
        if v not in cache: cache[v] = emis('id%d' % v, (v / 255, v / 255, v / 255), 1)
        return cache[v]
    black = em(0)
    for o in S.objects:
        if o.type in ('MESH', 'CURVE', 'FONT'):
            z = ZONES.get(o.name); v = ZC[z] * 20 if z else 0
            o.data.materials.clear(); o.data.materials.append(em(v))
            for ms_ in o.material_slots: ms_.material = em(v)
    for o in list(S.objects):
        if o.type == 'LIGHT': bpy.data.objects.remove(o)
    bg.inputs['Strength'].default_value = 0
    if bg.inputs['Color'].links: L.remove(bg.inputs['Color'].links[0])
    bg.inputs['Color'].default_value = (0, 0, 0, 1)
    vs.view_transform = 'Standard'; vs.look = 'None'; vs.exposure = 0
    S.cycles.samples = 4; S.cycles.use_adaptive_sampling = False; S.cycles.filter_width = .01; S.cycles.max_bounces = 0
    meta()
elif MODE == 'depth':
    dm = bpy.data.materials.new('depth'); dm.use_nodes = True; N2, L2 = dm.node_tree.nodes, dm.node_tree.links
    for n in list(N2): N2.remove(n)
    cd = N2.new('ShaderNodeCameraData'); mr = N2.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = .8; mr.inputs['From Max'].default_value = 3.6
    mr.inputs['To Min'].default_value = 1; mr.inputs['To Max'].default_value = 0
    e = N2.new('ShaderNodeEmission'); o_ = N2.new('ShaderNodeOutputMaterial')
    L2.new(cd.outputs['View Distance'], mr.inputs['Value']); L2.new(mr.outputs['Result'], e.inputs['Color']); L2.new(e.outputs['Emission'], o_.inputs['Surface'])
    for o in S.objects:
        if o.type in ('MESH', 'CURVE', 'FONT'):
            o.data.materials.clear(); o.data.materials.append(dm)
    for o in list(S.objects):
        if o.type == 'LIGHT': bpy.data.objects.remove(o)
    if bg.inputs['Color'].links: L.remove(bg.inputs['Color'].links[0])
    bg.inputs['Color'].default_value = (0, 0, 0, 1)
    vs.view_transform = 'Standard'; vs.look = 'None'; vs.exposure = 0
    S.cycles.samples = 4; S.cycles.use_adaptive_sampling = False; S.cycles.max_bounces = 0
    bpy.data.objects['pane'].hide_render = True

CLOSE = os.environ.get('CLOSE')
def look(c, pos, tgt, up=Vector((0, 0, 1))):
    f = (tgt - pos).normalized(); r = f.cross(up).normalized(); u = r.cross(f)
    from mathutils import Matrix as M3
    m = M3(((r.x, u.x, -f.x), (r.y, u.y, -f.y), (r.z, u.z, -f.z))); c.location = pos; c.rotation_euler = m.to_euler()
FLIGHT = os.environ.get('FLIGHT')
if CLOSE or FLIGHT:
    bpy.context.view_layer.update()
    def ctr(names):
        pts = []
        for n in names:
            o = bpy.data.objects[n]
            for c_ in [o] + list(o.children_recursive):
                if c_.type == 'MESH': pts += [c_.matrix_world @ Vector(v) for v in c_.bound_box]
        mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts))); mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
        return (mn + mx) / 2
    st0 = (cam.location.copy(), cam.rotation_euler.to_quaternion(), cam.data.lens, cam.data.dof.focus_distance, cam.data.dof.aperture_fstop)
    Z_ = CLOSE or FLIGHT
    cam.data.lens = 50; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36
    if Z_ == 'web':
        o = bpy.data.objects['mon_screen']; t = o.matrix_world.translation.copy(); n = (o.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized(); look(cam, t + n * 1.75, t)
    elif Z_ == 'photo':
        t = ctr(['gallery']); look(cam, t + Vector((0, -2.75, 0)), t); cam.data.lens = 32
    elif Z_ == 'graph':
        o = bpy.data.objects['ip_scr']; t = o.matrix_world.translation.copy(); n = (o.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized(); look(cam, t + n * .8, t)
    elif Z_ == 'fill':
        o = bpy.data.objects['fill_lbl']; t = ctr(['fill']); n = (o.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized(); n.z = 0; n.normalize(); n = Matrix.Rotation(-.22, 3, 'Z') @ n; look(cam, t + n * .55 + Vector((0, 0, .16)), t)
    elif Z_ == 'contact':
        o = bpy.data.objects['ph_scr']; t = o.matrix_world.translation.copy(); up = (o.matrix_world.to_3x3() @ Vector((0, 1, 0))).normalized(); look(cam, t + Vector((0, 0, .62)), t, up)
    cam.data.dof.use_dof = True; cam.data.dof.focus_distance = (cam.location - t).length; cam.data.dof.aperture_fstop = 5.6
    bpy.context.view_layer.update()
if FLIGHT:
    st1 = (cam.location.copy(), cam.rotation_euler.to_quaternion(), cam.data.lens, cam.data.dof.focus_distance, cam.data.dof.aperture_fstop)
    NF = int(os.environ.get('NF', '32'))
    def ease(p): return p * p * (3 - 2 * p)
    th0, th1 = math.atan(18 / st0[2]), math.atan(18 / st1[2])
    if st0[1].dot(st1[1]) < 0: st1 = (st1[0], -st1[1], st1[2], st1[3], st1[4])
    cam.rotation_mode = 'QUATERNION'
    fr = []
    for f_ in range(NF + 1):
        e_ = ease(f_ / NF)
        cam.location = st0[0].lerp(st1[0], e_); cam.rotation_quaternion = st0[1].slerp(st1[1], e_)
        th = math.exp(math.log(th0) + (math.log(th1) - math.log(th0)) * e_); cam.data.lens = 18 / math.tan(th)
        cam.data.dof.focus_distance = st0[3] + (st1[3] - st0[3]) * e_; cam.data.dof.aperture_fstop = st0[4] + (st1[4] - st0[4]) * e_
        for dp in ('location', 'rotation_quaternion'): cam.keyframe_insert(dp, frame=f_)
        cam.data.keyframe_insert('lens', frame=f_); cam.data.dof.keyframe_insert('focus_distance', frame=f_); cam.data.dof.keyframe_insert('aperture_fstop', frame=f_)
    for f_ in range(NF + 1):
        S.frame_set(f_); bpy.context.view_layer.update(); rf = {}
        for nm in ('mon_screen', 'ph_scr', 'lap_scr'):
            o = bpy.data.objects[nm]; me = o.data; vs_ = [v.co for v in me.vertices]
            xs = sorted(set(round(v.x, 6) for v in vs_)); ys = sorted(set(round(v.y, 6) for v in vs_))
            rf[nm] = []
            for p_ in [(xs[0], ys[-1], 0), (xs[-1], ys[-1], 0), (xs[-1], ys[0], 0), (xs[0], ys[0], 0)]:
                v = world_to_camera_view(S, cam, o.matrix_world @ Vector(p_)); rf[nm].append([round(v.x, 5), round(1 - v.y, 5), round(v.z, 4)])
        fr.append(rf)
    json.dump({'nf': NF, 'frames': fr}, open('/tmp/rd/meta-flight-%s.json' % FLIGHT, 'w'))
    S.frame_start, S.frame_end = int(os.environ.get('F0', '1')), int(os.environ.get('F1', str(NF - 1)))
    S.render.use_motion_blur = True; S.render.motion_blur_shutter = .3
if CLOSE:
    res = {}
    for nm in ('mon_screen', 'ph_scr'):
        o = bpy.data.objects[nm]; me = o.data; vs_ = [v.co for v in me.vertices]
        xs = sorted(set(round(v.x, 6) for v in vs_)); ys = sorted(set(round(v.y, 6) for v in vs_))
        res[nm] = []
        for p_ in [(xs[0], ys[-1], 0), (xs[-1], ys[-1], 0), (xs[-1], ys[0], 0), (xs[0], ys[0], 0)]:
            v = world_to_camera_view(S, cam, o.matrix_world @ Vector(p_)); res[nm].append([round(v.x, 5), round(1 - v.y, 5), round(v.z, 4)])
    json.dump(res, open('/tmp/rd/meta-close-%s.json' % CLOSE, 'w'))
CATANIM = int(os.environ.get('CATANIM', '0'))
if CATANIM:
    bpy.context.view_layer.update()
    pH, pT = bpy.data.objects['cat_headpiv'], bpy.data.objects['cat_tailpiv']
    for f_ in range(CATANIM + 1):
        ph_ = 2 * math.pi * f_ / CATANIM
        pH.rotation_euler = (math.sin(ph_ * 2) * .03, 0, math.sin(ph_) * .26); pH.keyframe_insert('rotation_euler', frame=f_ + 1)
        pT.rotation_euler = (0, 0, math.sin(ph_ * 2 + .6) * .16); pT.keyframe_insert('rotation_euler', frame=f_ + 1)
    S.frame_start, S.frame_end = 1, CATANIM
    pts = []
    for nm in ('catframe',):
        o = bpy.data.objects[nm]
        for c_ in o.children_recursive:
            if c_.type == 'MESH': pts += [c_.matrix_world @ Vector(v) for v in c_.bound_box]
    vv = [world_to_camera_view(S, cam, p_) for p_ in pts]
    x0, x1 = min(v.x for v in vv) - .03, max(v.x for v in vv) + .03; y0, y1 = min(v.y for v in vv) - .03, max(v.y for v in vv) + .03
    S.render.use_border = True; S.render.use_crop_to_border = True
    S.render.border_min_x, S.render.border_max_x, S.render.border_min_y, S.render.border_max_y = max(0, x0), min(1, x1), max(0, y0), min(1, y1)
    json.dump({'rect': [round(max(0, x0), 5), round(1 - min(1, y1), 5), round(min(1, x1) - max(0, x0), 5), round(min(1, y1) - max(0, y0), 5)], 'n': CATANIM}, open('/tmp/rd/meta-cat.json', 'w'))
if os.environ.get('BORDER') and not CATANIM:   # essai sur une portion du cadre : BORDER=x0,y0,x1,y1 (fractions, origine en haut à gauche)
    bx_ = [float(v) for v in os.environ['BORDER'].split(',')]; S.render.use_border = True; S.render.use_crop_to_border = True
    S.render.border_min_x, S.render.border_max_x, S.render.border_min_y, S.render.border_max_y = bx_[0], bx_[2], 1 - bx_[3], 1 - bx_[1]
if MODE == 'beauty' and os.environ.get('HALO', '1') == '1':
    # finition photo : halo des sources (enseigne, lampe, écrans), calculé en lumière linéaire avant la courbe de rendu
    try:
        ng_ = bpy.data.node_groups.new('finition', 'CompositorNodeTree'); S.compositing_node_group = ng_
        ng_.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
        rl_ = ng_.nodes.new('CompositorNodeRLayers'); gl_ = ng_.nodes.new('CompositorNodeGlare'); go_ = ng_.nodes.new('NodeGroupOutput')
        for k_, v_ in (('Type', 'Bloom'), ('Quality', 'High'), ('Threshold', float(os.environ.get('HALO_S', '2.2'))), ('Smoothness', .6), ('Strength', float(os.environ.get('HALO_F', '.45'))), ('Saturation', 1.0), ('Size', float(os.environ.get('HALO_T', '.42')))):
            if k_ in gl_.inputs: gl_.inputs[k_].default_value = v_
            else: print('HALO: entrée absente', k_)
        ng_.links.new(rl_.outputs['Image'], gl_.inputs['Image']); ng_.links.new(gl_.outputs['Image'], go_.inputs[0])
        print('HALO ok', [i.name for i in gl_.inputs])
    except Exception as e_:
        print('HALO indisponible', e_)
if MODE != 'beauty': S.render.dither_intensity = 0
S.render.filepath = OUT
import time; t = time.time()
if CATANIM or FLIGHT:
    bpy.ops.render.render(animation=True)
else:
    bpy.ops.render.render(write_still=True)
print('RENDER', MODE, MOMENT, LAMPE, RX, SAMP, round(time.time() - t, 1), 's')
if MODE == 'beauty' and not os.path.exists(META) and not CLOSE and not CATANIM and not FLIGHT: meta()
