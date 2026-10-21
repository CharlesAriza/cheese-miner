# Recupera las fuentes editables de un prototipo construido (un solo HTML) partiéndolo por las cabeceras de sus módulos, y
# comprueba que al volver a unir las piezas sale exactamente el mismo archivo. No toca el original.
# Uso: python3 split.py main2-v41.html v41
import os, sys
here = os.path.dirname(os.path.abspath(__file__))
src, tag = sys.argv[1], sys.argv[2]
L = open(os.path.join(here, '..', src), encoding='utf-8').read().split('\n')
MARK = {
  'v41': [('head_css_body', None), ('shared_tree', '// ---------- Ajuste del teléfono ----------'), ('tree_iife', 'const TREEUI = (() => {'),
          ('m41_core', '// ---------- MAIN 2.0 · V4.1'), ('v3_parts', '// ---- Primitivas ----'), ('m4_art', '// ---------- ARTE PILOTO · CHEDDAR (V4)'),
          ('m41_art', '// ---------- ARTE V4.1: separar identidades'), ('m41_sim', '// ---------- SIMULACIÓN ESPEJO (V4.1)'),
          ('m41_scene', '// ---------- CHEDDAR V4.1: terreno'), ('m41_snd', '// ---------- Sonido (V4.1, revisión de arte)'),
          ('m41_mice', '// ---------- RATONES VIVOS V4.1'), ('m41_ui', '// ---------- Dibujo ----------'), ('m41_col', '// ---------- Columna ----------')],
  'v4': [('head_css_body', None), ('shared_tree', '// ---------- Ajuste del teléfono ----------'), ('m4_core', '// ---------- MAIN 2.0 · V4'),
         ('v3_parts', '// ---- Primitivas ----'), ('m4_art', '// ---------- ARTE PILOTO · CHEDDAR (V4)'), ('m4_scene', '// ---------- CHEDDAR PILOTO'),
         ('m4_ui', '// ---------- Dibujo de todas las paradas'), ('m4_col', '// ---------- Columna ----------')],
  'ev': [('head_css_body', None), ('shared_tree', '// ---------- Ajuste del teléfono ----------'), ('engine_v41', '// ---------- MAIN 2.0 · V4.1'),
         ('ad_lib', '// ---------- ART DIRECTION · herramientas de píxel'), ('ev_px', '// ---------- EVOLUCIÓN Y BOOST · tratamiento'), ('ev_art', '// ---------- EVOLUCIÓN Y BOOST · edificios'),
         ('ev_mach', '// ---------- EVOLUCIÓN Y BOOST · máquinas'), ('ev_bed', '// ---------- HOUSE · la cama'), ('ev_page', 'adReady(() => {')],
  'ad': [('head_css_body', None), ('shared_tree', '// ---------- Ajuste del teléfono ----------'), ('engine_v41', '// ---------- MAIN 2.0 · V4.1'),
         ('ad_px', '// ---------- ART DIRECTION · herramientas de píxel'), ('ad_bld', '// ---------- ART DIRECTION · edificios'),
         ('ad_world', '// ---------- ART DIRECTION · el motor de V4.1'), ('ad_sys', '// ---------- ART DIRECTION · teléfono'), ('ad_pages', 'adReady(() => {')],
}[tag]
idx = [0]
for name, m in MARK[1:]:
    k = next(i for i, l in enumerate(L) if i > idx[-1] and l.startswith(m))
    idx.append(k)
out = os.path.join(here, tag); os.makedirs(out, exist_ok=True)
parts = []
for j, (name, _) in enumerate(MARK):
    a, b = idx[j], idx[j + 1] if j + 1 < len(idx) else len(L)
    chunk = '\n'.join(L[a:b]); parts.append(chunk)
    open(os.path.join(out, f'{j:02d}_{name}.' + ('html' if j == 0 else 'js')), 'w', encoding='utf-8').write(chunk)
assert '\n'.join(parts) == '\n'.join(L), 'no coincide'
print(tag, 'ok:', len(MARK), 'piezas; al unirlas sale el mismo archivo')
