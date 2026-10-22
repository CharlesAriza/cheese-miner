# Monta main2-b6.html (bloque 6: QA y entrega para integración). Misma librería y módulos que el bloque 5, más el paquete
# entregado (out/main2: manifiestos y PNG) y las pruebas de QA (qa/) metidos en la página, para que se vea exactamente lo
# que se entrega y no una copia redibujada.
import base64, json, os
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..')
L = open(os.path.join(P, 'main2-ad.html'), encoding='utf-8').read().split('\n')
i_style = L.index('</style>'); i_script = L.index('<script>', i_style); i_ready = L.index('adReady(() => {')
head = '\n'.join(L[:i_style]).replace('<title>Main 2.0 Art Review</title>', '<title>Main 2.0 QA Handoff</title>')
assert '<title>Main 2.0 QA Handoff</title>' in head
lib = '\n'.join(L[i_script + 1:i_ready]); blk = L[i_ready + 1:]
a = [k for k, l in enumerate(blk) if l.startswith('const COL = $c(')][0]; b = [k for k, l in enumerate(blk) if l.startswith('const big = (cv')][0]
helpers = '\n'.join(blk[a:b + 1])
body = '''<div class="ad-wrap">
  <header class="ad-head"><b>MAIN 2.0 · BLOQUE 6: QA Y ENTREGA</b><p>El paquete artístico del MVP (superficie, Cheddar, Gouda y Brie) comprobado y listo para integrarlo en el juego real.</p></header>
  <nav class="ad-toc" id="ad-toc"></nav>
  <main class="ad-col" id="ad-col"></main>
</div>
<div class="ad-hidden" aria-hidden="true"><div id="fit"><div id="phone"></div></div><div id="mc-stage"><canvas id="mc-cv"></canvas></div><div id="mc-goal"></div></div>'''
mods = [os.path.join('..', 'ev2', f) for f in ['ev_px.js', 'ev_art.js', 'ev_bed.js', 'ev2_refine.js', 'ev2_lie.js', 'ev2_house.js', 'ev2_lab.js']] + [os.path.join('..', 'ev3', f) for f in ['ev3_house.js', 'ev3_sleep.js']] + [os.path.join('..', 'ev4', 'ev4_bedanim.js'), os.path.join('..', 'b1', 'b1_surface.js'), os.path.join('..', 'b2', 'b2_cheddar.js'), os.path.join('..', 'b3', 'b3_gouda.js'), os.path.join('..', 'b4', 'b4_brie.js'), os.path.join('..', 'b5', 'b5_shared.js'), os.path.join('..', 'b5', 'b5_ui.js')]
# El paquete: cada carpeta con su manifiesto y sus PNG en data URI.
OUT = os.path.join(P, 'out', 'main2'); pack = {}
for z in ['superficie', 'cheddar', 'gouda', 'brie', 'compartido']:
    m = json.load(open(os.path.join(OUT, z, 'manifest.json'), encoding='utf-8'))
    for f in m['files']: f['uri'] = 'data:image/png;base64,' + base64.b64encode(open(os.path.join(OUT, z, f['file']), 'rb').read()).decode()
    pack[z] = m
qa = {}
for f in sorted(os.listdir(os.path.join(D, 'qa'))):
    mime = 'image/jpeg' if f.endswith('.jpg') else 'image/png'
    qa[f.rsplit('.', 1)[0]] = f'data:{mime};base64,' + base64.b64encode(open(os.path.join(D, 'qa', f), 'rb').read()).decode()
data = 'const PACK6 = ' + json.dumps(pack, ensure_ascii=False) + ';\nconst QA6 = ' + json.dumps(qa) + ';\n'
js = lib + '\n' + '\n'.join(open(os.path.join(D, f), encoding='utf-8').read() for f in mods) + '\n' + data + 'adReady(() => {\n' + helpers + '\n' + open(os.path.join(D, 'b6_page.js'), encoding='utf-8').read() + '\n});\n'
css = '\n'.join(open(os.path.join(D, '..', *p), encoding='utf-8').read() for p in [('ev2', 'ev.css'), ('ev2', 'ev2.css'), ('b5', 'b5.css'), ('b6', 'b6.css')])
out = head + '\n' + css + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n'
open(os.path.join(P, 'main2-b6.html'), 'w', encoding='utf-8').write(out)
# Para la comprobación de sintaxis basta el código (sin los datos, que son JSON).
open(os.path.join(D, '.chk.js'), 'w', encoding='utf-8').write(js.replace(data, 'const PACK6 = {}, QA6 = {};\n'))
print(len(out))
