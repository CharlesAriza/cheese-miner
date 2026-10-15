# Exploración de estilos (NO es código del juego). Genera index.html a partir de los sprites y
# datos reales extraídos de la partida de pruebas (assets/data.json y assets/*.png).
# Uso: python3 build.py   (desde esta carpeta)
import json, html

D = json.load(open('assets/data.json'))
M = D['main']
MICE = D['mice'][:7]
E = html.escape
ROCK_NAMES = {'cheddar': 'Cheddar', 'gouda': 'Gouda', 'brie': 'Brie', 'emmental': 'Emmental', 'parmesan': 'Parmesan', 'blue': 'Blue'}
TILE_IMG = {'rock': 'tile_rock', 'drill': 'tile_drill', 'refinery': 'tile_refinery', 'cheesery': 'tile_cheesery', 'shop': 'tile_shop', 'lab': 'tile_lab'}
RAR = {'Common': 'r0', 'Rare': 'r1', 'Legendary': 'r2'}
for _m in MICE:
    _m['mult'] = round(_m['mult']) if _m['mult'] >= 10 else _m['mult']  # como el juego: x10, x4.7


def img(name, cls='', alt=''):
    return f'<img class="px {cls}" src="assets/{name}.png" alt="{E(alt)}">'


def hearts(n):
    return img('ic_heart', 'hrt') * n


def badge_text(b):
    return b.replace('UP! ', 'UP ').replace('NEW!', 'NEW')


# ------------------------------------------------------------------ B: híbrido
def b_main():
    tiles = ''
    for t in M['tiles']:
        cls = 'b-st' + (' sel' if t['sel'] else '') + (' new' if t['isnew'] else '') + (f" boost{t['boost']}" if t['boost'] else '')
        tag = f'<em class="{"new" if "NEW" in t["badge"] else ""}">{E(badge_text(t["badge"]))}</em>' if t['badge'] else ''
        tiles += f'<div class="{cls}">{tag}{img(TILE_IMG[t["st"]], "ico")}<b>{E(t["label"])}</b><small>{E(t["lv"])}</small></div>'
    rocks = ''.join(f'<span class="b-rock{" on" if r["on"] else ""}">{img("rock_" + r["z"])}{E(r["name"])}</span>' for r in M['rocks'])
    flow = lambda ic, name, val, rate, ok: f'<div class="b-fc">{img(ic)}<div><small>{name}</small><b>{E(val)}</b><em class="{ok}">{E(rate)}</em></div></div>'
    return f'''
<div class="ph vB">
  <header class="b-top">
    <div class="b-res">{img("coin", "big")}<div><small>COINS</small><b>{E(M["coins"])}</b><em class="ok">{E(M["coinRate"])}</em></div></div>
    <div class="b-res warn">{img("shop", "big")}<div><small>SHOP · ALL ROCKS</small><b>{E(M["shop"])}</b><em class="hot">Full · extra at ½ price</em></div></div>
  </header>
  <div class="b-goal"><span class="b-tag">GOAL</span><p>New milestone in CHEESE upgrades: Grand Wheel</p>{img("ic_go", "go")}</div>
  <div class="b-scene"><img class="px scene" src="assets/scene.png" alt="Cheddar rock scene">
    <span class="b-depth">{E(M["depthLabel"])}</span>
    <div class="b-flow">{flow("res_raw", "RAW", M["raw"], M["rawRate"], "ok")}{flow("res_base", "BASE", M["base"], M["baseRate"], "ok")}{flow("res_lot", "CHEESE", M["lots"], "/min to shop", "ok")}</div>
  </div>
  <div class="b-body">
    <div class="b-stations">{tiles}</div>
    <div class="b-rocks">{rocks}</div>
    <section class="b-dock">
      <div class="b-dhead"><b>Drilling</b><span class="b-lv">LV 96</span><small>{E(M["xp"])}</small></div>
      <div class="b-xp"><i style="width:{M["xpPct"]}"></i></div>
      <div class="b-stats"><span>+215.3 Raw / 0.8s</span><span>15.5K/min</span></div>
      <div class="b-why ok">Cheddar · depth 92 · Running</div>
      <div class="b-act">
        <button class="b-main"><span class="b-plate">{E(M["plate"])}</span><b>DRILL</b><small>Auto · hold to boost</small></button>
        <div class="b-worker">{img("mouse_" + M["workerId"], "face")}<div><b>{E(M["worker"])}</b><small>LV 51 · Manager</small></div></div>
      </div>
      <div class="b-ups">
        <button class="buy"><b>{E(M["quick"])}</b><span>{img("coin")}{E(M["quickCost"])}</span></button>
        <button><b>UPGRADES</b><span class="ok">{E(M["tree"])}</span></button>
        <button class="buy"><b>BUY ALL</b><span>{E(M["all"])}</span></button>
      </div>
    </section>
  </div>
  <nav class="b-nav"><button>COLONY</button><button class="alert">MICE <small>{E(M["miceN"])}</small></button><button class="alert">BOOSTS <small>{M["freeBoosts"]} free</small></button><button>MENU</button></nav>
</div>'''


def b_row(m):
    can = m.get('can')
    aff = ''.join(f'<span class="b-aff">{E(a["job"])}{hearts(a["hearts"])}</span>' for a in m['affs'][:2])
    spec = ''.join(f'<span class="b-spec">{E(s["name"])} {s["grade"]}</span>' for s in m['specs'] if s['here'])[:400]
    good = [t for t in m['traits'] if t['kind'] in ('good', 'legend')]
    more = len(m['traits']) - 0
    where = E(m['job']) + (f' · {E(m["rock"])}' if m['rock'] else '')
    return f'''<div class="b-row{" due" if can else ""}">
  <span class="b-face {RAR[m["rarity"]]}">{img("mouse_" + m["id"], "face")}</span>
  <div class="b-rmain"><div class="b-name"><b>{E(m["name"])}</b><span class="b-rank">{E(m["rank"])}</span><small>LV {m["lv"]}</small></div>
    <small class="b-where">{where}</small>
    <div class="b-chips">{aff}{spec}<span class="b-more">{len(good)} traits</span></div></div>
  <div class="b-rside"><b class="b-mult">×{m["mult"]}</b>{img("ic_rankup", "up") if can else ""}</div>
</div>'''


def b_roster():
    rows = ''.join(b_row(m) for m in MICE)
    return f'''
<div class="ph vB">
  <header class="b-appbar"><b>MICE</b><span>26 mice · {E(M["miceN"])} posts</span><button>CLOSE</button></header>
  <div class="b-seg"><button>COLONY</button><button class="on promo">ROSTER 26</button><button>HOUSE</button></div>
  <div class="b-hire"><div><b>FIND NEW MICE</b><small>Meet 3 candidates. Choose one to hire.</small></div><button>{img("coin")}{E(M["recruitCost"])}</button></div>
  <button class="b-note"><b>{M["promotable"]}</b> can be promoted</button>
  <div class="b-filter"><span>Sort: <b>Post</b> · Show: <b>All</b> · 26/26</span><em>CHANGE</em></div>
  <div class="b-list">{rows}</div>
</div>'''


# ------------------------------------------------------------------ C: idle RPG
def c_main():
    st = ''
    for t in M['tiles']:
        boost = f'<span class="c-boost b{t["boost"]}">{"×2.25" if t["boost"] == "2" else "+50%"}</span>' if t['boost'] else ''
        tag = f'<span class="c-tag{" new" if "NEW" in t["badge"] else ""}">{E(badge_text(t["badge"]))}</span>' if t['badge'] else ''
        st += f'<div class="c-st{" sel" if t["sel"] else ""}">{img(TILE_IMG[t["st"]], "ico")}<div><b>{E(t["label"].title())}</b><small>{E(t["lv"].replace("LV", "Lv"))}</small></div>{boost}{tag}</div>'
    rocks = ''.join(f'<span class="c-rock{" on" if r["on"] else ""}">{img("rock_" + r["z"])}</span>' for r in M['rocks'])
    return f'''
<div class="ph vC">
  <header class="c-bar"><span class="c-menu" aria-hidden="true"><i></i><i></i><i></i></span><b>Drilling</b><span class="c-coins">{img("coin")}{E(M["coins"])}</span></header>
  <div class="c-scroll">
    <div class="c-goal"><small>CURRENT GOAL</small><p>New milestone in Cheese upgrades: Grand Wheel</p></div>
    <section class="c-skill">{img("tile_drill", "sk")}<div class="c-skm"><div class="c-skh"><b>Drilling</b><span>Level 96</span></div><div class="c-bar2"><i style="width:{M["xpPct"]}"></i></div><small>{E(M["xp"].replace("xp", "XP"))}</small></div></section>
    <div class="c-scene"><img class="px scene" src="assets/scene.png" alt="Cheddar rock scene"><span>Cheddar Rock · Depth 92</span></div>
    <div class="c-rocks"><small>ROCK</small>{rocks}<b>Cheddar</b></div>
    <section class="c-panel"><h4>Production chain</h4>
      <table class="c-tbl"><tr><td>{img("res_raw")}Raw</td><td>{E(M["raw"])}</td><td class="ok">{E(M["rawRate"])}</td></tr>
      <tr><td>{img("res_base")}Base</td><td>{E(M["base"])}</td><td class="ok">{E(M["baseRate"])}</td></tr>
      <tr><td>{img("res_lot")}Cheese</td><td>{E(M["lots"])}/min</td><td class="ok">to shop</td></tr>
      <tr><td>{img("shop")}Shop</td><td>{E(M["shop"])}</td><td class="hot">full</td></tr></table></section>
    <section class="c-panel"><h4>Stations</h4><div class="c-sts">{st}</div></section>
    <section class="c-panel c-actp">
      <button class="c-main"><b>Drill</b><small>Auto · hold to boost</small></button>
      <dl class="c-dl"><dt>Output</dt><dd>+215.3 Raw / 0.8s</dd><dt>Rate</dt><dd>15.5K / min</dd><dt>Boost</dt><dd class="blue">{E(M["plate"]).replace("×", "×")} (2/2)</dd><dt>Status</dt><dd class="ok">Running</dd></dl>
      <div class="c-worker">{img("mouse_" + M["workerId"], "face")}<div><b>{E(M["worker"])}</b><small>Lv 51 · Manager</small></div><span>Worker</span></div>
    </section>
    <section class="c-panel"><h4>Upgrades</h4>
      <div class="c-up"><div><b>{E(M["quick"])}</b><small>Cheapest Drilling upgrade</small></div><button>{img("coin")}{E(M["quickCost"])}</button></div>
      <div class="c-up"><div><b>Upgrade tree</b><small class="ok">{E(M["tree"].lower())}</small></div><button class="ghost">Open</button></div>
      <div class="c-up"><div><b>Buy all</b><small>Every skill, cheapest first</small></div><button>{E(M["all"])}</button></div>
    </section>
  </div>
  <nav class="c-nav"><button>Colony</button><button class="alert">Mice <small>{E(M["miceN"])}</small></button><button class="alert">Boosts <small>{M["freeBoosts"]}</small></button><button>Menu</button></nav>
</div>'''


def c_row(m):
    can = m.get('can')
    aff = ' '.join(f'{E(a["job"])} {hearts(a["hearts"])}' for a in m['affs'][:2])
    spec = next((f'{E(s["name"])} {s["grade"]}' for s in m['specs'] if s['here']), '—')
    good = len([t for t in m['traits'] if t['kind'] in ('good', 'legend')])
    quirk = len([t for t in m['traits'] if t['kind'] == 'quirk'])
    return f'''<div class="c-row{" due" if can else ""}">
  <span class="c-face {RAR[m["rarity"]]}">{img("mouse_" + m["id"], "face")}</span>
  <div class="c-rm"><div class="c-rn"><b>{E(m["name"])}</b><small>Lv {m["lv"]} · {E(m["rank"])}</small></div>
    <div class="c-rj">{E(m["job"])}{(" · " + E(m["rock"])) if m["rock"] else ""}</div>
    <div class="c-rs"><span>Spec <b>{spec}</b></span><span>Likes {aff}</span><span>Traits <b>{good}</b>{f' · <b class="bad">{quirk}</b> quirk' if quirk else ''}</span></div></div>
  <div class="c-rr"><b>×{m["mult"]}</b>{'<span class="c-ready">' + img("ic_rankup") + 'Ready</span>' if can else ''}</div>
</div>'''


def c_roster():
    rows = ''.join(c_row(m) for m in MICE)
    return f'''
<div class="ph vC">
  <header class="c-bar"><span class="c-menu" aria-hidden="true"><i></i><i></i><i></i></span><b>Mice</b><span class="c-coins">{img("coin")}{E(M["coins"])}</span></header>
  <div class="c-tabs"><button>Colony</button><button class="on">Roster <small>26</small></button><button>House</button></div>
  <div class="c-scroll">
    <section class="c-panel c-sum"><div><small>POSTS</small><b>{E(M["miceN"])}</b></div><div><small>PROMOTABLE</small><b class="ok">{M["promotable"]}</b></div><div><small>NEXT HIRE</small><b>{img("coin")}{E(M["recruitCost"])}</b></div></section>
    <div class="c-actions"><button class="primary">Find new mice</button><button>Promote {M["promotable"]}</button></div>
    <div class="c-th"><span>Mouse</span><span>Sort: Post</span><span>Output</span></div>
    {rows}
  </div>
  <nav class="c-nav"><button>Colony</button><button class="alert on">Mice <small>{E(M["miceN"])}</small></button><button class="alert">Boosts <small>{M["freeBoosts"]}</small></button><button>Menu</button></nav>
</div>'''


def a_frame(name, alt):
    return f'<div class="ph vA"><img src="assets/{name}.png" alt="{alt}"></div>'


SCREENS = {
    'main': [a_frame('a_main', 'Current MAIN screen'), b_main(), c_main()],
    'mice': [a_frame('a_roster', 'Current MICE roster'), b_roster(), c_roster()],
}
LABELS = [('A', 'Pixel art actual', 'Captura del juego real a 360 px'), ('B', 'Híbrido pixel art + UI moderna', 'Maqueta HTML/CSS con sprites reales'), ('C', 'Idle RPG · Melvor-like', 'Maqueta HTML/CSS con sprites reales')]

cols = ''
for i, (k, t, sub) in enumerate(LABELS):
    frames = ''.join(f'<div class="scr scr-{s}">{SCREENS[s][i]}</div>' for s in SCREENS)
    cols += f'<article class="col" data-v="{k}"><header><span class="vk">{k}</span><div><h2>{t}</h2><p>{sub}</p></div></header>{frames}</article>'

page = open('page.html').read().replace('<!--COLUMNS-->', cols)
open('index.html', 'w').write(page)
print('ok', len(page))
