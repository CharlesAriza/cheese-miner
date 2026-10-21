# Monta main2-ev2.html (revisión: REFINE restaurada, cama V3, evolución V2, BOOST y fuentes). Las fuentes viven aquí, en el
# proyecto; la librería común (motor de V4.1, piezas y herramientas de las revisiones anteriores) sale de main2-ad.html.
import os
D = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(D, '..', '..')
L = open(os.path.join(P, 'main2-ad.html'), encoding='utf-8').read().split('\n')
i_style = L.index('</style>'); i_script = L.index('<script>', i_style); i_ready = L.index('adReady(() => {')
head = '\n'.join(L[:i_style]).replace('<title>Main 2.0 Art Review</title>', '<title>Main 2.0 Art Fixes</title>')
assert '<title>Main 2.0 Art Fixes</title>' in head
lib = '\n'.join(L[i_script + 1:i_ready]); blk = L[i_ready + 1:]
a = [k for k, l in enumerate(blk) if l.startswith('const COL = $c(')][0]; b = [k for k, l in enumerate(blk) if l.startswith('const big = (cv')][0]
helpers = '\n'.join(blk[a:b + 1])
body = '''<div class="ad-wrap">
  <header class="ad-head"><b>MAIN 2.0 · CORRECCIONES DE ARTE</b><p>Iteración pequeña antes de aprobar: REFINE restaurada, la cama de HOUSE con una pose tumbada, la evolución de HOUSE y LAB, el BOOST sobre los edificios originales y el inventario de fuentes. Todo es propuesta.</p></header>
  <nav class="ad-toc" id="ad-toc"></nav>
  <main class="ad-col" id="ad-col"></main>
</div>
<div class="ad-hidden" aria-hidden="true"><div id="fit"><div id="phone"></div></div><div id="mc-stage"><canvas id="mc-cv"></canvas></div><div id="mc-goal"></div></div>'''
mods = ['ev_px.js', 'ev_art.js', 'ev_mach.js', 'ev_bed.js', 'ev2_refine.js', 'ev2_lie.js', 'ev2_house.js', 'ev2_lab.js']
js = lib + '\n' + '\n'.join(open(os.path.join(D, f), encoding='utf-8').read() for f in mods) + '\nadReady(() => {\n' + helpers + '\n' + open(os.path.join(D, 'ev2_page.js'), encoding='utf-8').read() + '\n});\n'
out = head + '\n' + open(os.path.join(D, 'ev.css'), encoding='utf-8').read() + '\n' + open(os.path.join(D, 'ev2.css'), encoding='utf-8').read() + '\n</style>\n' + body + '\n<script>\n' + js + '\n</script>\n'
open(os.path.join(P, 'main2-ev2.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(D, '.chk.js'), 'w', encoding='utf-8').write(js)
print(len(out))
