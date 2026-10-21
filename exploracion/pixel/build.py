# Exploración de pixel art (NO es código del juego). Genera index.html con los ratones actuales
# y la propuesta, renderizados con pxl (out/sprites/*.png).
# Uso: node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build mice.px.js && python3 build.py
HATS = [('helmet', 'Casco'), ('cap', 'Gorra'), ('beanie', 'Gorro de lana'), ('tophat', 'Chistera'), ('crown', 'Corona (legendario)')]
FURS = [('white', 'Blanco'), ('grey', 'Gris'), ('brown', 'Marrón'), ('dark', 'Oscuro')]


def sp(name, cls=''):
    return f'<img class="px {cls}" src="out/sprites/{name}.png" alt="">'


rows = ''
for hat, hl in HATS:
    cells = ''.join(f'<div class="pair"><figure>{sp(f"cur_{f}_{hat}", "x4")}<figcaption>Actual</figcaption></figure><figure class="new">{sp(f"new_{f}_{hat}", "x4")}<figcaption>Propuesta</figcaption></figure><small>{fl}</small></div>' for f, fl in FURS)
    rows += f'<section class="hatrow"><h3>{hl}</h3><div class="pairs">{cells}</div></section>'

# En contexto: retratos de ROSTER (como el juego: 33 px en un marco de 44) y sobre el escenario.
cast = [('white', 'helmet'), ('grey', 'cap'), ('brown', 'beanie'), ('dark', 'tophat'), ('white', 'crown')]
cards = lambda pre: ''.join(f'<span class="face{" gold" if h == "crown" else ""}">{sp(f"{pre}_{f}_{h}", "card")}</span>' for f, h in cast)
stage = lambda pre: ''.join(sp(f'{pre}_{f}_{h}', 'onstage') for f, h in cast)
ctx = f'''<div class="ctx">
  <div><h4>Actual</h4><div class="faces">{cards("cur")}</div><div class="stage">{stage("cur")}</div></div>
  <div><h4>Propuesta</h4><div class="faces">{cards("new")}</div><div class="stage">{stage("new")}</div></div>
</div>'''

page = open('page.html').read().replace('<!--ROWS-->', rows).replace('<!--CTX-->', ctx)
open('index.html', 'w').write(page)
print('ok', len(page))
