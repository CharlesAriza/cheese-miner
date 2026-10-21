const TREEUI = (() => {
// ---------- Iconos de las mejoras (pixel, contorno automático; un tamaño por contexto) ----------
const P = { k: '#3a3d4a', s: '#b9c1d1', S: '#8a92a4', W: '#fffbe0', y: '#ffe55c', Y: '#e0a020', o: '#ff8a2e', O: '#c9561c', r: '#e2462f', R: '#8c2235', b: '#9a6a40', B: '#5a3a24', g: '#62d36e', G: '#2f8f44', u: '#5a9cf0', U: '#2b5cab', w: '#ffffff', v: '#b58cff', V: '#5a3aa8', p: '#ff9ab5' };
const ic = (rows, pal = P) => () => icon(rows, pal);
const IMG = (src) => { const i = new Image(); i.src = src; return i; };
const PICK_IMG = IMG('out/sprites/ic_pick.png');
IC.u_pick = () => { const c = document.createElement('canvas'); c.width = 14; c.height = 14; const d = () => c.getContext('2d').drawImage(PICK_IMG, 0, 0); if (PICK_IMG.complete) d(); else PICK_IMG.addEventListener('load', d); return c; };
IC.u_pickG = ic(['..yyy....', '.y...y...', 'y..B..y..', '...B.....', '...B.....', '...B.....', '...b.....']);
IC.u_swing = ic(['....y....', 'y..yWy..y', '.y.yWy.y.', '..yWWWy..', 'yyWWWWWyy', '..yWWWy..', '.y.yWy.y.', 'y..yWy..y', '....y....'], { y: '#ffcf2e', W: '#fffbe0' });
IC.u_charge = ic(['......y.', '.....y..', '..RRRk..', '.RrrrR..', '.RrrrR..', '.RrrrR..', '.RrrrR..', '..RRR...']);
IC.u_paws = ic(['.p.p.p..', 'pp.p.pp.', '........', '.ppppp..', 'pppppppp', 'pppppppp', '.pppppp.']);
IC.u_sense = ic(['...yy...', '..yWWy..', '.yWyyWy.', 'yWy..yWy', '.yWyyWy.', '..yWWy..', '...yy...']);
IC.u_deep = ic(['..u..', '.uWu.', 'uWWWu', 'UuuuU', '.UuU.', '..U..', 'UUUUU'], { u: '#5a9cf0', U: '#2b5cab', W: '#cfeefa' });
IC.u_bit = ic(['ssssss', '.sSSs.', '.sSSs.', '..ss..', '..sS..', '...s..']);
IC.u_motor = ic(['..k.k..', '.kkkkk.', 'kksSskk', '.ksWsk.', 'kksSskk', '.kkkkk.', '..k.k..']);
IC.u_shift = ic(['..yyy..', '.yy....', 'yy.....', 'yy.....', 'yy.....', '.yy....', '..yyy..'], { y: '#cfeefa' });
// Raw + un «+» limpio de 3 × 3, separado del queso por su contorno.
IC.u_rich = ic(['..yyy.....', '.yWyyy....', 'yyyyyyY...', 'yyyYyyY.g.', '.yyyyY.ggg', '..YYY...g.']);
IC.u_vat = ic(['k......k', 'kssssssk', 'ksyyyysk', 'ksyyyysk', 'kssssssk', '.kkkkkk.', '.k....k.']);
IC.u_furnace = ic(['...o...', '..ooo..', '.oyyyo.', 'oyWWyyo', 'oyyyyyo', '.OOOOO.']);
IC.u_twin = ic(['.o...o.', 'ooo.ooo', 'oyo.oyo', 'oyy.oyy', 'OOO.OOO']);
IC.u_press = ic(['kkkkkkk', '...k...', '...k...', '.kkkkk.', '.yyyyy.', 'yyyyyyy', 'kkkkkkk']);
IC.u_prices = ic(['....yyy', '...yWyY', '..yyyyY', '.yyyyY.', 'yyyyY..', 'yyyY...', '.YY....']);
IC.u_counter = ic(['yyyyyyyy', 'bbbbbbbb', 'b.b..b.b', 'bBbBBbBb', 'bBbBBbBb', 'BBBBBBBB']);
IC.u_quick = ic(['kkkkk', '.yyy.', '..y..', '.y.y.', 'yyyyy', 'kkkkk']);
IC.u_sign = ic(['..k..', 'rrrrr', 'rWWWr', 'rrrrr', '..k..', '..k..']);
IC.u_assist = ic(['..ss..', '..ss..', '.sggs.', 'sggggs', 'sgWggs', '.ssss.']);
IC.u_adv = ic(['...r...', '..rrr..', '.rWWWr.', 'rrWrWrr', '.rWWWr.', '..rrr..', '...r...']);
IC.u_strain = ic(['.sssss.', 's.g.v.s', 's.gvv.s', 's.vg..s', '.sssss.']);
IC.u_bunsen = ic(['..u..', '.uWu.', '.uuu.', '..k..', '..k..', '.kkk.']);
IC.u_samples = ic(['s.s.s', 's.s.s', 'y.g.v', 'y.g.v', 'sss.s']);
IC.u_lamp = ic(['..kkk..', '.kyyyk.', 'kyWWWyk', 'kyWWWyk', '.kyyyk.', '..kkk..', '...k...', '..kkk..']);
IC.u_mould = ic(['.kkkkkkk.', 'kWyyyyyYk', 'kyyyyyyYk', 'ksssssssk', 'kSSSSSSSk', '.kkkkkkk.']);
IC.u_curds = ic(['..ww.w...', '.wwwwww..', 'wwbwwbwww', 'BbbbbbbbB', '.BbbbbbB.', '..BBBBB..'], { w: '#ffffff', b: '#9ab8d8', B: '#5a7aa8' });
IC.u_cellar = ic(['.BBBBBBB.', 'Bbbbbbbbb', 'kkkkkkkkk', 'Bbbbbbbbb', 'Bbbbbbbbb', 'kkkkkkkkk', '.BBBBBBB.']);
IC.wheel = () => icon(['..yyyy..', '.yYWYYy.', 'yYYYYYYy', 'y!!!!!!O', '.!!?!!O.', '..OOOO..'], { y: '#ffcf2e', Y: '#ffe55c', W: '#fffbe0', '!': '#e0a020', '?': '#c98a08', O: '#8a5a0a' }, '#2a1d0a');
IC.lock = () => icon(['.ggg.', 'g...g', 'g...g', 'LLLLL', 'LLkLL', 'LLkLL', 'LLLLL'], { g: '#9aa3b8', L: '#d6c070', k: '#3a2a10' });
IC.spk = () => icon(['..g..', '.gWg.', 'gWWWg', '.gWg.', '..gW.'].map((r, i) => (i === 4 ? '..g..' : r)), { g: '#62d36e', W: '#e8ffe8' }, '#0f2a14');

// ---------- Árboles (datos de balance.js) ----------
const N = (o) => ({ level: 1, max: 1, cost: 0, growth: 1, ...o });
const TREES = {
  mining: { name: 'Mining', head: 'MINE', looks: 'pick', nodes: {
    pick: N({ br: 'power', name: 'Sharper Pick', desc: '+1 search power per hit', ic: 'u_pick', max: 80, cost: 12, growth: 1.3, fx: (r) => `${1 + r} search per hit` }),
    swing: N({ br: 'power', name: 'Heavy Swing', desc: 'Critical hits are 0.5x stronger', ic: 'u_swing', level: 6, max: 30, cost: 150, growth: 1.45, fx: (r) => `crits hit x${r1(2 + 0.5 * r)}` }),
    charge: N({ br: 'power', name: 'Blasting Charges', desc: '12.5% more search power per hit', ic: 'u_charge', max: 999, cost: 1.2e10, growth: 3, needsMax: 'pick', fx: (r) => `${r1(81 * (1 + 0.125 * r))} search per hit` }),
    paws: N({ br: 'auto', name: 'Quick Paws', desc: 'The mouse mining each rock swings 10% faster', ic: 'u_paws', level: 10, max: 30, cost: 300, growth: 1.42, fx: (r) => `a swing every ${r1(1.2 / (1 + 0.1 * r))} s` }),
    sense: N({ br: 'special', name: 'Vein Sense', desc: 'Every vein holds 4% more cheese', ic: 'u_sense', level: 8, max: 40, cost: 200, growth: 1.4, fx: (r) => `${Math.round(60 * (1 + 0.04 * r))} Raw in a Cheddar vein` }),
    deep: N({ br: 'special', name: 'Deep Riches', desc: "Each depth level is worth another 0.1% on that rock's cheese", ic: 'u_deep', level: 20, max: 25, cost: 2000, growth: 1.6, fx: (r) => `each depth level multiplies that rock's cheese value by ${(1.002 + 0.001 * r).toFixed(3)}` }),
  } },
  drilling: { name: 'Drilling', head: 'DRILL', looks: 'pdrill', fw: 44, fh: 50, nodes: {
    bit: N({ br: 'power', name: 'Bigger Bit', desc: '+1 Raw Cheese per cycle', ic: 'u_bit', max: 999, cost: 50, growth: 3, fx: (r) => `${1 + r} Raw per cycle` }),
    motor: N({ br: 'power', name: 'Turbo Motor', desc: 'Drills run 8% faster', ic: 'u_motor', level: 4, max: 40, cost: 70, growth: 1.4, fx: (r) => `a cycle every ${r1(2.4 / (1 + 0.08 * r))} s` }),
    shift: N({ br: 'auto', name: 'Night Shift', desc: 'Drills run another 10% faster', ic: 'u_shift', level: 12, max: 30, cost: 400, growth: 1.45, fx: (r) => `a cycle every ${r1(2.4 / (1 + 0.1 * r))} s` }),
    rich: N({ br: 'special', name: 'Rich Extraction', desc: '2.5% more Raw Cheese from every cycle', ic: 'u_rich', level: 9, max: 50, cost: 250, growth: 1.38, fx: (r) => `${r1(5 * (1 + 0.025 * r))} Raw per cycle` }),
  } },
  refining: { name: 'Refining', head: 'REFINE', looks: 'prefinery', fw: 56, fh: 70, nodes: {
    vat: N({ br: 'power', name: 'Bigger Vat', desc: '+2 Cheese Base per cycle', ic: 'u_vat', max: 999, cost: 50, growth: 3, fx: (r) => `${2 + 2 * r} Base per cycle` }),
    furnace: N({ br: 'power', name: 'Hot Furnace', desc: 'Refines 8% faster', ic: 'u_furnace', level: 4, max: 40, cost: 70, growth: 1.4, fx: (r) => `a cycle every ${r1(3 / (1 + 0.08 * r))} s` }),
    burners: N({ br: 'auto', name: 'Twin Burners', desc: 'Refines another 10% faster', ic: 'u_twin', level: 12, max: 30, cost: 400, growth: 1.45, fx: (r) => `a cycle every ${r1(3 / (1 + 0.1 * r))} s` }),
    press: N({ br: 'special', name: 'Double Press', desc: '2% more Cheese Base from the same Raw', ic: 'u_press', level: 9, max: 50, cost: 250, growth: 1.38, fx: (r) => `${r1(10 * (1 + 0.02 * r))} Base from 20 Raw` }),
  } },
  cheesemaking: { name: 'Cheesemaking', head: 'CHEESE', looks: 'pcheesery', fw: 60, fh: 68, goal: true, nodes: {
    wheel: N({ br: 'milestone', name: 'Grand Wheel', desc: 'Every 10 minutes of cooking, each line turns out a Grand Wheel worth 2 more minutes of its cheese', ic: 'wheel', cost: 1.74e11, unlock: true, gate: () => S.r.moulds >= 20, gateTxt: () => `Opens at More Moulds 20 (now ${S.r.moulds})`, gateP: () => Math.min(1, S.r.moulds / 20), explain: '<b>Grand Wheel unlocked.</b> Every 10 minutes of cooking, each line turns out a Grand Wheel worth 2 more minutes of its cheese. It costs no Base or coins, and it also happens while you are away.' }),
    master: N({ br: 'milestone', name: 'Grand Master', desc: 'Name one mouse Grand Master: the cheese it cooks is worth more, the more it has cooked in its life', ic: 'star', cost: 2e14, unlock: true, gate: () => S.goal >= 1, gateTxt: () => `Opens with the next goal: cook ${fmtN(2.4e9)} cheese`, gateP: () => S.goal, explain: '<b>Grand Master unlocked.</b> Give the title to one mouse from its card. The cheese it cooks is worth more, the more it has cooked in its life.' }),
    moulds: N({ br: 'power', name: 'More Moulds', desc: '+1 cheese per batch', ic: 'u_mould', max: 999, cost: 50, growth: 3, fx: (r) => `${1 + r} cheese per batch` }),
    curds: N({ br: 'power', name: 'Faster Curds', desc: 'Cheese cooks 8% faster', ic: 'u_curds', max: 60, cost: 30, growth: 1.33, fx: (r) => `a plain cheese in ${r1(6 / (1 + 0.08 * r))} s` }),
    cellar: N({ br: 'special', name: 'Cheese Cellar', desc: 'Every cheese is worth 8% more', ic: 'u_cellar', level: 5, max: 80, cost: 150, growth: 1.38, fx: (r) => `a plain Cheddar is worth ${Math.round(10 * (1 + 0.08 * r))}` }),
  } },
  trading: { name: 'Trading', head: 'SELL', looks: 'pshop', fw: 50, fh: 54, nodes: {
    prices: N({ br: 'power', name: 'Better Prices', desc: 'Sell everything for 6% more', ic: 'u_prices', max: 80, cost: 40, growth: 1.36, fx: (r) => `customers pay x${(1 + 0.06 * r).toFixed(2)}` }),
    counter: N({ br: 'power', name: 'Bigger Counter', desc: '+18 cheese sold per cycle', ic: 'u_counter', max: 999, cost: 50, growth: 3, fx: (r) => `${18 + 18 * r} cheese per sale` }),
    quick: N({ br: 'auto', name: 'Quick Sales', desc: 'Sales are 10% faster', ic: 'u_quick', level: 5, max: 40, cost: 100, growth: 1.4, fx: (r) => `a sale every ${r1(4 / (1 + 0.1 * r))} s` }),
    sign: N({ br: 'special', name: 'Fancy Sign', desc: 'Another 10% on every price', ic: 'u_sign', level: 15, max: 40, cost: 900, growth: 1.55, fx: (r) => `customers pay x${(1 + 0.1 * r).toFixed(2)} more` }),
  } },
  lab: { name: 'Lab', head: 'LAB', lab: true, nodes: {
    assistant: N({ br: 'unlock', name: 'Research Assistant', desc: 'Opens a Research post: a mouse there researches recipes for you', ic: 'u_assist', level: 0, cost: 100, unlock: true, explain: '<b>Research post open.</b> Put a mouse there from COLONY and it researches recipes for you, even while you are away.' }),
    advanced: N({ br: 'unlock', name: 'Advanced Research', desc: 'You choose what the lab looks for: value, speed, one cheese or one component', ic: 'u_adv', level: 0, cost: 3000, unlock: true, needs: 'assistant', explain: '<b>Advanced Research.</b> In the lab, pick a direction: the most valuable recipe, the quickest, one cheese or one component.' }),
    strains: N({ br: 'unlock', name: 'Strain Research', desc: 'Opens STRAINS: mutations of a cheese you already know', ic: 'u_strain', level: 0, cost: 25000, unlock: true, needLevel: ['Cheesemaking', 10], explain: '<b>STRAINS open.</b> The lab can now find mutations of a cheese you know. Each gives something and asks for something.' }),
    burners: N({ br: 'power', name: 'Bunsen Burners', desc: 'Every research is 8% faster', ic: 'u_bunsen', level: 0, max: 25, cost: 400, growth: 1.6, fx: (r) => `the next recipe takes ${r1(240 / (1 + 0.08 * r))} s` }),
    samples: N({ br: 'power', name: 'Smaller Samples', desc: 'Every research uses 5% less Cheese Base', ic: 'u_samples', level: 0, max: 10, cost: 600, growth: 1.8, fx: (r) => `the next research uses ${Math.round(400 * (1 - 0.05 * r))} Cheese Base` }),
  } },
  colony: { name: 'Colony', head: 'COLONY', colony: true, nodes: {
    lamp: N({ br: 'special', name: 'Night Lamp', desc: 'Your mice keep working 2 more hours while you are away', ic: 'u_lamp', level: 0, max: 10, cost: 500, growth: 2.2, key: true, fx: (r) => `${8 + 2 * r} hours away` }),
  } },
};
const ROCKS = [['cheddar', 'Cheddar Rock', 0, 'Cheddar', 10], ['gouda', 'Gouda Rock', 2e5, 'Gouda', 24], ['brie', 'Brie Rock', 3e9, 'Brie', 60], ['emmental', 'Emmental Rock', 1e12, 'Emmental', 150], ['parmesan', 'Parmesan Rock', 1.2e13, 'Parmesan', 380], ['blue', 'Blue Rock', 8e13, 'Blue', 950]];
// Estados de ejemplo: final de partida (los niveles de MAIN) y principio.
const PRESETS = {
  late: {
    mining: { lv: 62, coins: 3.9e15, r: { pick: 80, swing: 30, charge: 14, paws: 30, sense: 40, deep: 25 } },
    drilling: { lv: 91, coins: 3.9e15, r: { bit: 26, motor: 40, shift: 30, rich: 50 } },
    refining: { lv: 85, coins: 3.9e15, r: { vat: 25, furnace: 40, burners: 30, press: 50 } },
    cheesemaking: { lv: 93, coins: 3.9e15, goal: 0.67, r: { moulds: 23, curds: 24, cellar: 80, wheel: 0, master: 0 } },
    trading: { lv: 86, coins: 3.9e15, r: { prices: 80, counter: 24, quick: 40, sign: 40 } },
    lab: { lv: 93, coins: 3.9e15, r: { assistant: 1, advanced: 1, strains: 1, burners: 25, samples: 9 } },
    colony: { lv: 0, coins: 3.9e15, zones: 6, r: { lamp: 8 } },
  },
  early: {
    mining: { lv: 12, coins: 2400, r: { pick: 10, swing: 3, charge: 0, paws: 2, sense: 1, deep: 0 } },
    drilling: { lv: 6, coins: 900, r: { bit: 4, motor: 2, shift: 0, rich: 0 } },
    refining: { lv: 10, coins: 1500, r: { vat: 5, furnace: 3, burners: 0, press: 1 } },
    cheesemaking: { lv: 8, coins: 4000, goal: 0.1, r: { moulds: 6, curds: 9, cellar: 2, wheel: 0, master: 0 } },
    trading: { lv: 7, coins: 1200, r: { prices: 6, counter: 3, quick: 1, sign: 0 } },
    lab: { lv: 8, coins: 5200, r: { assistant: 1, advanced: 0, strains: 0, burners: 3, samples: 1 } },
    colony: { lv: 0, coins: 260000, zones: 1, r: { lamp: 3 } },
  },
};
let T, S, E = {}; let TREE = 'cheesemaking', PRE = 'late';
const cost = (n, r) => n.cost * Math.pow(n.growth, r);
const power = () => Object.entries(T.nodes).filter(([, n]) => n.br === 'power').reduce((a, [id]) => a + (S.r[id] || 0), 0);
const TIERS = [0, 3, 8, 16, 30, 50];
const tierOf = (p) => TIERS.reduce((t, v, i) => (p >= v ? i : t), 0);
function lockWhy(id) {
  const n = T.nodes[id];
  if (n.level && S.lv < n.level && !T.lab && !T.colony) return `Needs ${T.name} LV ${n.level}`;
  if (n.needs && !S.r[n.needs]) return `Needs ${T.nodes[n.needs].name}`;
  if (n.needsMax && S.r[n.needsMax] < T.nodes[n.needsMax].max) return `Needs ${T.nodes[n.needsMax].name} ${T.nodes[n.needsMax].max}`;
  if (n.needLevel && S.lv < n.needLevel[1]) return `Needs ${n.needLevel[0]} LV ${n.needLevel[1]}`;
  if (n.gate && !n.gate()) return 'gate';
  return '';
}
const affordable = () => Object.entries(T.nodes).filter(([id, n]) => !n.unlock && !n.key && S.r[id] < n.max && !lockWhy(id) && cost(n, S.r[id]) <= S.coins).length;

// ---------- Aspectos: hojas Pulido+ (8 fotogramas) o, en Mining, el ratón picando ----------
// Cada lienzo se dibuja al crearse (nunca sale en blanco) y después a su compás. Los aspectos aún no alcanzados se dibujan
// como silueta oscura (forma sin detalles). Al alcanzarlos, se revelan: destello blanco y color.
const SHEETS = {};
const sheet = (b, t) => { const k = b + t; if (!SHEETS[k]) SHEETS[k] = IMG(`out/anims/${b}_${t}.png`); return SHEETS[k]; };
const SWING = { iron: IMG('out/anims/swing_player.png'), gold: IMG('out/anims/swing_gold.png') };
// Caja real del ratón con su pico en el fotograma 0 (para centrarlo de verdad en su casilla).
const BBOX = {};
for (const [k, im] of Object.entries(SWING)) im.addEventListener('load', () => { const c = document.createElement('canvas'); c.width = 32; c.height = 20; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 20, 0, 0, 32, 20); const d = x.getImageData(0, 0, 32, 20).data; let a = 32, b = 0; for (let yy = 0; yy < 20; yy++) for (let xx = 0; xx < 32; xx++) if (d[(yy * 32 + xx) * 4 + 3]) { a = Math.min(a, xx); b = Math.max(b, xx); } BBOX[k] = [a, b]; });
const LOOKS = [];
const SCR = document.createElement('canvas');
function lookCanvas(t, head) {
  const c = document.createElement('canvas');
  if (T.looks === 'pick') { if (head) { c.width = 30; c.height = 34; c._mine = 1; } else { c.width = 26; c.height = 20; c._swing = 1; } }
  else { c.width = T.fw; c.height = T.fh; c._b = T.looks; }
  c._t = t; LOOKS.push(c); drawLook(c, performance.now()); return c;
}
const MINE_SEQ = [0, 0, 0, 1, 2, 3, 4];
function drawLook(c, now) {
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  SCR.width = c.width; SCR.height = c.height; const s2 = SCR.getContext('2d'); s2.imageSmoothingEnabled = false; s2.clearRect(0, 0, c.width, c.height);
  const gold = c._t >= 3;
  if (c._mine) {
    // Escena de Mining (30 × 34): el ratón entero a la izquierda y una roca de queso a la derecha. En cada golpe: destello
    // en estrella, la roca tiembla 1 px y saltan esquirlas de piedra y de queso en arco, con gravedad.
    const P2 = (a, b, w, h, col) => { s2.fillStyle = col; s2.fillRect(a, b, w, h); };
    const f = MINE_SEQ[Math.floor(now / 120) % MINE_SEQ.length], im = SWING[gold ? 'gold' : 'iron'];
    if (f === 3 && c._lastF !== 3) {
      c._parts = c._parts || [];
      const cols = gold ? ['#fff3a0', '#ffcf2e', '#ffffff', '#e0a020'] : ['#ffcf2e', '#c8c8d4', '#9a9aa8', '#fff3a0'];
      for (let k = 0; k < 8; k++) c._parts.push({ x: 20 + (k % 2), y: 25 + (k % 3), vx: (k % 4 === 0 ? 0.6 : -0.5) - Math.random() * 1.2, vy: -1.8 - Math.random() * 1.4, col: cols[k % cols.length], s: k % 3 === 0 ? 2 : 1, life: 12 + (k % 5) });
    }
    c._lastF = f;
    const shake = f === 3 ? 1 : 0;
    const ROCK = ['...kkk...', '.kkLLsk..', 'kLLsssyk.', 'kLssyYsSk', 'kLssssSSk', 'ksssyysSk', 'ksssySSSk', 'kSssSSSSk', '.kSSSSSk.', '..kkkkk..'];
    const RP = { k: '#2a1d2e', L: '#c8c8d4', s: '#9a9aa8', S: '#6a6a78', y: '#ffcf2e', Y: '#e0a020' };
    ROCK.forEach((row, yy) => [...row].forEach((ch, xx) => { if (ch !== '.') P2(21 + xx + shake, 24 + yy, 1, 1, RP[ch]); }));
    if (im.complete) s2.drawImage(im, f * 32, 0, 32, 20, 0, 14, 32, 20);
    // Destello del golpe: estrella de 5 × 5 en el golpe y un anillo de puntos justo después.
    if (f === 3) { const sx = 21, sy = 27, W = '#ffffff', Y = gold ? '#ffd84a' : '#fff3a0'; P2(sx, sy - 2, 1, 5, Y); P2(sx - 2, sy, 5, 1, Y); P2(sx, sy - 1, 1, 3, W); P2(sx - 1, sy, 3, 1, W); }
    if (f === 4) { const Y = gold ? '#ffcf2e' : '#fff3a0'; P2(18, 24, 1, 1, Y); P2(24, 24, 1, 1, Y); P2(18, 30, 1, 1, Y); P2(17, 27, 1, 1, Y); }
    // Esquirlas.
    if (c._parts) { c._parts = c._parts.filter((q) => q.life > 0); for (const q of c._parts) { P2(Math.round(q.x), Math.round(q.y), q.s, q.s, q.col); if (c._tick !== now) { q.x += q.vx; q.y += q.vy; q.vy += 0.45; q.life--; if (q.y > 33) { q.y = 33; q.vy = 0; q.vx *= 0.5; } } } c._tick = now; }
  } else if (c._swing) {
    const im = SWING[gold ? 'gold' : 'iron'], bb = BBOX[gold ? 'gold' : 'iron'] || [0, 21];
    if (im.complete) s2.drawImage(im, 0, 0, 32, 20, Math.round(13 - (bb[0] + bb[1] + 1) / 2), 0, 32, 20);
  } else {
    const im = sheet(c._b, c._t); if (im.complete) s2.drawImage(im, (Math.floor(now / 110) % 8) * c.width, 0, c.width, c.height, 0, 0, c.width, c.height);
  }
  x.clearRect(0, 0, c.width, c.height);
  const flash = c._flash && now - c._flash < 300;
  if (c._sil || flash) { s2.globalCompositeOperation = 'source-in'; s2.fillStyle = flash ? '#fffbe8' : '#3d3550'; s2.fillRect(0, 0, c.width, c.height); s2.globalCompositeOperation = 'source-over'; }
  x.drawImage(SCR, 0, 0);
}
setInterval(() => { const now = performance.now(); for (const c of LOOKS) if (c.isConnected) drawLook(c, now); }, 60);

// ---------- Iconos de los árboles (aprobados en Pulido+, 16-10-2026) ----------
// Cada árbol lleva el símbolo de su oficio en el título, en lugar del ratón genérico: pico, perforadora compacta, crisol,
// queso, puesto, matraz y estandarte. Todos caben en el mismo hueco (30 × 32 px a ×2) y se ven a escala entera.
const MET = { W: '#ffffff', L: '#dfe4ee', s: '#b9c1d1', S: '#8a92a4', D: '#5a6070' };
// SPRITE: crisol al fuego (Refining): el Raw se funde en Base dorada; asas, borde de hierro y llamas.
const CRUCIBLE = () => icon([
  '.............',
  '..W.W..W.....',
  'S.SSSSSSSSS.S',
  'SLyyyWyyyyySS',
  '.LyYyyyyYyyS.',
  '.LsssssssssS.',
  '.LssSssssSsS.',
  '..SSSSSSSSS..',
  '...D.....D...',
  '..o.oy.yo.o..',
  '.oyo.oYo.oyo.',
  '..OoOoOoOoO..'], { ...MET, y: '#ffcf2e', Y: '#f5ab12', o: '#ff8a2e', O: '#e2462f' });
function gridP(w, h) { const g = Array.from({ length: h }, () => Array(w).fill('.')); g.set = (x, y, c) => { if (y >= 0 && y < h && x >= 0 && x < w) g[y][x] = c; }; g.rows = () => g.map((r) => r.join('')); return g; }
const STEEL = { W: '#ffffff', L: '#e4e8f0', s: '#b9c1d1', S: '#8a92a4', D: '#5a6070', y: '#ffcf2e', Y: '#e0a020', c: '#ffcf2e', C: '#f5ab12' };
// SPRITE: C2 · perforadora compacta: la máquina de MAIN reducida a lo esencial (cuerpo, chimenea, orugas y el cono).
const DRILL_C2 = () => {
  const g = gridP(13, 11);
  g.set(1, 0, 'r'); g.set(1, 1, 'R'); g.set(1, 2, 'R');
  for (let x = 0; x <= 5; x++) for (let y = 3; y <= 6; y++) g.set(x, y, y === 3 ? 'P' : y === 6 ? 'Q' : x === 0 ? 'P' : x === 5 ? 'Q' : 'p');
  g.set(3, 4, 'k'); g.set(4, 4, 'W');
  for (let x = 6; x <= 12; x++) { const hh = Math.round(3 * (1 - (x - 6) / 6)); for (let y = 5 - hh; y <= 5 + hh; y++) { const k = (x + y + 60) % 3; g.set(x, y, y === 5 - hh ? 'W' : k === 0 ? 'D' : k === 1 ? 's' : 'L'); } }
  for (let x = 0; x <= 6; x++) { g.set(x, 7, 'D'); g.set(x, 8, x % 2 ? 's' : 'D'); g.set(x, 9, 'D'); }
  return icon(g.rows(), { ...STEEL, P: '#9c94e8', p: '#6a62c8', Q: '#443c90', r: '#ff8a5a', R: '#c9502a', k: '#24204a', D: '#3a3d4a' });
};
// SPRITE: COLONY afinada: estandarte de la colonia (cola de golondrina, rueda de queso bordada) con remate dorado, sobre la roca.
const FLAG2 = () => icon([
  '.y...........',
  'yYy..........',
  '.krrrrrrrrr..',
  '.krRyyyrrrr..',
  '.krryWyyrr...',
  '.krryyyYrr...',
  '.krrrYYrrrr..',
  '.krrrrrrrrrr.',
  '.k...........',
  '.k...........',
  '.kLs.........',
  'Lssyss.......',
  'ssyysSS......',
  'sssSSSSS.....'], { k: '#8e6234', y: '#ffcf2e', Y: '#e0a020', W: '#fffbe0', r: '#e2462f', R: '#ff7a5a', L: '#c8c8d4', s: '#9a9aa8', S: '#6a6a78' });
// SPRITE: TRADING simplificado: toldo de tres franjas anchas, borde festoneado y una sola rueda de queso en el mostrador.
const STALL2 = () => icon([
  'rrrWWWrrrWWWr',
  'rrrWWWrrrWWWr',
  'rr.WW.rr.WW.r',
  '.b.........b.',
  '.b.ccc.....b.',
  '.bcWccC..y.b.',
  '.bcccCC.yYyb.',
  'BBBBBBBBBBBBB',
  'bbbbbbbbbbbbb',
  'BBBBBBBBBBBBB'], { r: '#e2462f', W: '#fffbe0', b: '#b07a40', B: '#5c3a1b', c: '#ffcf2e', C: '#f5ab12', y: '#ffe55c', Y: '#c98a08' });
const TPNG = (n) => { const i = new Image(); i.src = 'out/sprites/' + n + '.png'; i.className = 'pix'; return i; };
const TREE_IC = { mining: () => TPNG('ic_pick'), drilling: DRILL_C2, refining: CRUCIBLE, cheesemaking: () => TPNG('ic_lot_cheddar'), trading: STALL2, lab: () => TPNG('ic_flask'), colony: FLAG2 };
// Escala ×2 por el tamaño natural del dibujo (PNG o lienzo), sin estirar.
function treeIcon(tree, k = 2) {
  const el = TREE_IC[tree](); const png = el.tagName === 'IMG';
  const set = () => { el.style.width = (png ? el.naturalWidth : el.width) * k + 'px'; el.style.height = (png ? el.naturalHeight : el.height) * k + 'px'; };
  if (png && !el.complete) el.addEventListener('load', set); else set();
  return el;
}
// ---------- Pantalla ----------
const body = document.getElementById('sbody');
document.getElementById('ic-head').replaceWith(Object.assign(document.createElement('span'), { className: 'up-tic' }));
function build(tree = TREE, pre = PRE) {
  TREE = tree; PRE = pre; T = TREES[tree];
  const p0 = PRESETS[pre][tree]; S = { coins: p0.coins, lv: p0.lv, goal: p0.goal || 0, zones: p0.zones || 0, r: { ...p0.r } };
  document.querySelector('.shead .ttl b').textContent = T.head;
  document.querySelector('.shead .up-tic').replaceChildren(treeIcon(tree));
  body.replaceChildren(); E = { nodes: {} };
  if (T.lab) { const b = document.createElement('div'); b.className = 'box up-labrow'; b.innerHTML = '<span class="t"><b>BACK TO THE LAB</b><small>The lab starts simple. Each upgrade here teaches it something new.</small></span><span class="act">BACK</span>'; body.appendChild(b); }
  else if (!T.colony) {
    const head = document.createElement('div'); head.className = 'box up-head';
    head.innerHTML = `<span class="bld"></span><span class="t"><span class="k">UPGRADES</span><span class="sk">${T.name.toUpperCase()}</span><span class="lv"><b><small>LV</small>${S.lv}</b><small>${pre === 'late' ? '1.18M / 1.42M' : '86 / 210'} xp</small></span><span class="xp"><i style="width:${pre === 'late' ? 83 : 41}%"></i></span><p>Each level: +2% to this skill. Levels unlock new upgrades. You earn xp by doing the work, or by having a mouse do it.</p></span>`;
    E.headBld = lookCanvas(tierOf(power()), true); head.querySelector('.bld').appendChild(E.headBld);
    if (T.looks !== 'pick') { E.headBld.style.width = T.fw + 'px'; E.headBld.style.height = T.fh + 'px'; E.headBld.style.left = Math.round((60 - T.fw) / 2) + 'px'; }
    body.appendChild(head);
  }
  E.all = document.createElement('span'); E.all.className = 'fc-go up-all'; E.all.onclick = buyAll;
  if (!T.colony) body.appendChild(E.all);
  if (!T.lab && !T.colony) { const hint = document.createElement('p'); hint.className = 'up-hint'; hint.textContent = 'This tree only, always the cheapest upgrade first.' + (pre === 'late' ? ' Your managers already buy, on their own, upgrades of their job that cost under 10% of your coins.' : ''); body.appendChild(hint); }
  E.goal = document.createElement('div'); E.goal.className = 'box up-goal'; if (T.goal) body.appendChild(E.goal);
  if (T.colony) { E.zones = document.createElement('div'); E.zones.style.cssText = 'display:flex;flex-direction:column;gap:6px'; body.appendChild(E.zones); }
  E.list = document.createElement('div'); E.list.style.cssText = 'display:flex;flex-direction:column;gap:6px'; body.appendChild(E.list);
  paint();
  body.scrollTop = 0;
}
const BRANCHES = { std: [['milestone', 'MILESTONES', 'One of a kind. You buy each one yourself: BUY ALL and managers leave them alone'], ['power', 'POWER', null], ['auto', 'TEMPO', 'Faster cycles for this stage, whoever does the work'], ['special', 'SPECIAL', 'What makes this skill different']],
  lab: [['unlock', 'NEW FUNCTIONS', 'Each one opens something new in the lab'], ['power', 'EFFICIENCY', 'Faster and cheaper research, by hand or with a mouse']],
  colony: [['special', 'WHILE YOU ARE AWAY', 'Only stages with a mouse keep going when the game is closed']] };
function paint() {
  paintAll(); if (T.goal) paintGoal(); if (T.colony) paintZones();
  E.list.replaceChildren(); E.nodes = {};
  for (const [br, title, h] of BRANCHES[T.lab ? 'lab' : T.colony ? 'colony' : 'std']) {
    const ids = Object.keys(T.nodes).filter((id) => T.nodes[id].br === br); if (!ids.length) continue;
    const hd = document.createElement('div'); hd.className = 'up-br'; hd.innerHTML = `<b>${title}</b><small>${h || (T.looks === 'pick' ? 'More output. From 16 ranks, your pick turns gold' : 'More output. Each rank changes how the building looks')}</small>`; E.list.appendChild(hd);
    if (br === 'power' && T.looks) { E.looks = looksEl(); E.list.appendChild(E.looks); }
    for (const id of ids) { const el = nodeEl(id); E.nodes[id] = el; E.list.appendChild(el); }
  }
}
function paintAll() { if (T.colony) return; const n = affordable(); E.all.textContent = n ? 'BUY EVERYTHING I CAN AFFORD HERE' : 'NOTHING AFFORDABLE YET'; E.all.classList.toggle('off', !n); if (T.lab) E.all.style.display = n ? '' : 'none'; }
function paintGoal() {
  if (S.r.master) { E.goal.style.display = 'none'; return; }
  E.goal.style.display = ''; const cur = 2.4e9 * S.goal;
  E.goal.innerHTML = `<div class="h"><b>NEXT MILESTONE</b><span class="n">${fmtN(cur)} / ${fmtN(2.4e9)} cheese cooked</span></div><span class="bar"><i style="width:${Math.round(S.goal * 100)}%"></i></span><small>${S.goal >= 1 ? '<b style="color:var(--gold)">Goal met.</b> Grand Master is open.' : PRE === 'late' ? 'About 1 h 20 min at your pace.' : 'About 6 h at your pace.'} The goal is set and does not move. Everything you cook counts, also while you are away.</small>`;
  E.goal.querySelector('b').prepend(toImg(IC.wheel(), 1.5));
}
// Rocas (árbol de la colonia): abiertas trabajando, la siguiente con su precio, el resto bloqueadas.
function paintZones() {
  E.zones.replaceChildren();
  const hd = document.createElement('div'); hd.className = 'up-br'; hd.innerHTML = '<b>ROCKS</b><small>Every rock you open keeps working. Rocks never run out: they just get deeper and richer.</small>'; E.zones.appendChild(hd);
  ROCKS.forEach(([id, name, c, base, val], i) => {
    const z = document.createElement('div'); z.className = 'box up-zone' + (i < S.zones ? ' open' : i === S.zones ? '' : ' locked'); z.dataset.z = id;
    z.innerHTML = `<span class="ic"><img class="pix" src="out/sprites/ic_raw_${id}.png" alt=""></span><span class="t"><b>${i < S.zones ? `${name} · depth ${[80, 65, 58, 56, 47, 39][i]}` : name}</b><small>${i < S.zones ? `${['18', '14', '9', '6', '4', '2'][i]} Raw left in this vein · ${['26', '21', '17', '12', '9', '6'][i]} Raw per cycle` : i === S.zones ? `New cheese: ${base}, worth ${val} (Cheddar is 10). Unlocks 36 recipes` : 'Open the previous rock first'}</small></span><span class="act2"></span>`;
    const a = z.querySelector('.act2');
    if (i < S.zones) a.innerHTML = '<span class="up-tag work">WORKING</span>';
    else if (i === S.zones) { const can = c <= S.coins; const b = document.createElement('span'); b.className = 'up-btn' + (can ? ' go' : ' off'); b.innerHTML = `OPEN<small>${coinI()}${fmtN(c)}</small>`; b.onclick = () => openRock(i, b); a.appendChild(b); }
    else a.innerHTML = `<span class="up-tag lock">LOCKED<small>${coinI(10)}${fmtN(c)}</small></span>`;
    E.zones.appendChild(z);
  });
}
// Aspectos: los seis del edificio (o los dos del pico). Los alcanzados, normales; el actual, en oro; el siguiente,
// punteado; los futuros, silueta oscura con el nivel que piden.
const lookList = () => (T.looks === 'pick' ? [[0, 0], [3, 16]] : TIERS.map((v, i) => [i, v]));
const lookCur = () => { const t = tierOf(power()); return T.looks === 'pick' ? (t >= 3 ? 1 : 0) : t; };
function looksEl() {
  const box = document.createElement('div'); box.className = 'box up-looks'; box.style.position = 'relative';
  const row = document.createElement('div'); row.className = 'row' + (T.looks === 'pick' ? ' two' : '');
  box._tiles = lookList().map(([ti, v], k) => { const lk = document.createElement('span'); const c = lookCanvas(ti); c.style.width = (T.looks === 'pick' ? 52 : T.fw / 2) + 'px'; c.style.height = (T.looks === 'pick' ? 40 : T.fh / 2) + 'px'; lk.appendChild(c); lk.insertAdjacentHTML('beforeend', `<small>${T.looks === 'pick' ? (k ? 'Gold · 16' : 'Iron · 0') : v}</small>`); row.appendChild(lk); lk._c = c; return lk; });
  const cap2 = document.createElement('span'); cap2.className = 'cap2';
  box.append(row, cap2); box._cap = cap2;
  updateLooks(box);
  return box;
}
function updateLooks(box = E.looks) {
  const cur = lookCur(), list = lookList(), p = power();
  box._tiles.forEach((lk, k) => { lk.className = 'lk ' + (k < cur ? 'past' : k === cur ? 'now' : k === cur + 1 ? 'next' : 'fut'); lk._c._sil = k > cur; });
  const nx = list[cur + 1];
  box._cap.innerHTML = `<span>POWER ranks: <b>${p}</b></span>${nx ? `<span>Next look at <em>${nx[1]}</em> · ${nx[1] - p} to go</span>` : '<em>Final look</em>'}`;
}
function nodeEl(id) {
  const n = T.nodes[id], r = S.r[id], maxed = r >= n.max, why = lockWhy(id), locked = !!why, gated = why === 'gate';
  const ms = n.br === 'milestone' || (T.lab && n.unlock);
  const el = document.createElement('div'); el.className = 'box up-node' + (ms ? ' ms' + (maxed ? ' done' : !locked ? ' ready' : '') : '') + (n.key ? ' key' : '') + (locked ? ' locked' : '') + (maxed && !ms ? ' maxed' : ''); el.dataset.id = id;
  const icn = document.createElement('span'); icn.className = 'ic'; const big = IC[n.ic](); icn.appendChild(toImg(big, big.width > 11 ? 2 : 3));
  if (locked) { const l = toImg(IC.lock(), 2); l.classList.add('lk'); icn.appendChild(l); }
  const t = document.createElement('span'); t.className = 't';
  const rk = n.max === 1 ? '' : `<span class="rk">${r}${n.max >= 500 ? '' : '/' + n.max}</span>`;
  let fx = '';
  if (n.unlock) fx = `<span class="fx"><i>NOW</i><span>${maxed ? 'Unlocked' : 'Not unlocked yet'}</span></span>`;
  else fx = maxed ? `<span class="fx"><i>NOW</i><span>${n.fx(r)}</span></span>` : `<span class="fx"><i>NOW</i><span class="nw">${n.fx(r)}</span><i>NEXT</i><span class="nx">${n.fx(r + 1)}</span></span>`;
  let seg = '';
  if (n.max > 1 && n.max < 500) { const per = n.max / 10; seg = '<span class="seg">' + Array.from({ length: 10 }, (_, k) => { const f = Math.max(0, Math.min(1, (r - k * per) / per)); return `<i class="${f >= 1 ? 'on' : f > 0 ? 'part' : ''}" style="--p:${Math.round(f * 100)}%"></i>`; }).join('') + '</span>'; }
  else if (n.max >= 500) seg = '<span class="cap"><span>No limit</span></span>';
  const gate = gated ? `<span class="gate"><span class="d" style="color:var(--soft)">${n.gateTxt()}</span><span class="bar"><i style="width:${Math.round(n.gateP() * 100)}%"></i></span></span>` : '';
  t.innerHTML = `<span class="unm">${n.key ? '<i class="kv">INVESTMENT</i>' : ''}${n.name}${rk}</span><span class="d">${n.desc}</span>${gate || fx}${seg}`;
  const a = document.createElement('span'); a.className = 'act2';
  if (maxed) a.innerHTML = `<span class="up-tag">${n.unlock ? 'DONE' : 'MAX'}</span>`;
  else if (locked) a.innerHTML = `<span class="up-tag lock">${gated ? 'LOCKED' : why.replace(/ (LV \d+)$/, '<br>$1').replace(/^Needs /, 'Needs<br>')}<small>${coinI(10)}${fmtN(cost(n, r))}</small></span>`;
  else { const c = cost(n, r), can = c <= S.coins; const b = document.createElement('span'); b.className = 'up-btn' + (can ? (n.unlock || n.key ? ' go' : '') : ' off'); b.innerHTML = `${n.unlock ? 'UNLOCK' : 'BUY'}<small>${coinI()}${fmtN(c)}</small>`; b.onclick = () => buy(id, b); a.appendChild(b); }
  if (ms && !maxed && !locked) a.insertAdjacentHTML('afterbegin', '<span class="ribbon">READY</span>');
  el.prepend(icn); el.append(t, a);
  return el;
}
// ---------- Animaciones (las aprobadas en Cheesemaking) ----------
function flyCoin(from, to) {
  if (reduced) return; const [x0, y0] = ptOf(from), [x1, y1] = ptOf(to);
  const c = document.createElement('img'); c.src = 'out/sprites/ic_coin.png'; c.className = 'up-fly'; c.style.left = x0 - 7 + 'px'; c.style.top = y0 - 7 + 'px'; sfxL().appendChild(c);
  c.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${(x1 - x0) / 2}px, ${(y1 - y0) / 2 - 22}px)`, offset: 0.5 }, { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scale(.6)`, opacity: 0.2 }], { duration: 300, easing: 'steps(8)' });
  setTimeout(() => c.remove(), 300);
}
function relock(ids) { for (const id of ids) { if (!E.nodes[id]) continue; const was = E.nodes[id].classList.contains('locked'); const el = nodeEl(id); E.nodes[id].replaceWith(el); E.nodes[id] = el; if (was && !el.classList.contains('locked')) unlockFx(el); } }
function buy(id, btn) {
  const n = T.nodes[id], r = S.r[id], c = cost(n, r);
  if (r >= n.max) return;
  if (c > S.coins) { btn && (btn.classList.remove('shake'), void btn.offsetWidth, btn.classList.add('shake')); return; }
  const before = tierOf(power());
  S.coins -= c; S.r[id]++;
  const old = E.nodes[id];
  if (btn) flyCoin(btn, old.querySelector('.ic'));
  if (n.unlock) { milestone(id, old); relock(Object.keys(T.nodes).filter((k) => k !== id)); return; }
  const el = nodeEl(id); old.replaceWith(el); E.nodes[id] = el;
  const icn = el.querySelector('.ic');
  if (!reduced) { icn.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 200, delay: 260, easing: 'steps(3)', fill: 'backwards' }); const rk = el.querySelector('.rk'); rk && rk.animate([{ transform: 'translateY(-6px)', color: '#c8ffc0' }, { transform: 'none' }], { duration: 220, delay: 260, easing: 'steps(4)', fill: 'backwards' }); const nw = el.querySelector('.fx .nw'); nw && nw.animate([{ transform: 'translateY(6px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, delay: 260, easing: 'steps(4)', fill: 'backwards' }); }
  setTimeout(() => { const [x, y] = ptOf(icn, 0, -14); floatText(sfxL(), x - 8, y, '+1', 'up-plus', 700, 12); burst(sfxL(), x, y + 14, 6, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 18, up: 6, size: 3, dur: 380, fall: 2 }); }, reduced ? 0 : 260);
  if (n.key) investFx(el);
  if (S.r[id] >= n.max) setTimeout(() => { const tag = el.querySelector('.up-tag'); if (tag && !reduced) tag.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 260, easing: 'steps(5)' }); const [x, y] = ptOf(tag); burst(sfxL(), x, y + 10, 12, ['#ffcf2e', '#fff3a0', '#c98a08'], { spread: 40, up: 4, size: 3, dur: 500, fall: 6 }); toast(`<b>${n.name}</b> is at its top rank`, '', true); }, reduced ? 0 : 320);
  if (n.br === 'power' && E.looks) { const after = tierOf(power()); updateLooks(); if (after !== before && (T.looks !== 'pick' || (before < 3 && after >= 3))) newLook(after); }
  relock(Object.keys(T.nodes).filter((k) => k !== id));
  paintAll();
}
// Aspecto nuevo (como al subir de ayuntamiento): la casilla deja de ser silueta con un destello blanco y aparece en
// color, salta, la recorre un brillo y sueltan chispas doradas; «NEW LOOK» (o «GOLD PICK»). La cabecera cambia con el
// mismo destello. Nada más se mueve.
function newLook(t, quiet) {
  const tile = E.looks.querySelector('.lk.now'), c = tile && tile._c, now = performance.now();
  if (c) { c._flash = now; c._sil = false; }
  if (E.headBld) { E.headBld._t = t; E.headBld._flash = now; }
  if (!reduced && tile) { tile.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: 0.35 }, { transform: 'scale(.96)', offset: 0.7 }, { transform: 'none' }], { duration: 420, easing: 'steps(6)' }); tile.classList.add('reveal'); setTimeout(() => tile.classList.remove('reveal'), 800); }
  const tag = document.createElement('span'); tag.className = 'up-newlook'; tag.textContent = T.looks === 'pick' ? 'GOLD PICK' : 'NEW LOOK'; E.looks.appendChild(tag);
  if (!reduced) tag.animate([{ transform: 'translate(-50%, 6px)', opacity: 0 }, { transform: 'translate(-50%, 0)', opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1600, easing: 'steps(8)', fill: 'forwards' });
  setTimeout(() => tag.remove(), 1600);
  if (tile) { const [x, y] = ptOf(tile); burst(sfxL(), x, y, 18, ['#ffcf2e', '#fff3a0', '#ffffff'], { spread: 60, up: 18, size: 3, dur: 700, fall: 10 }); }
  if (!quiet) toast(T.looks === 'pick' ? 'Your pick turns <b style="color:var(--gold)">gold</b>' : `The ${{ pdrill: 'Drill', prefinery: 'Refinery', pcheesery: 'Cheesery', pshop: 'Shop' }[T.looks]} gets a <b style="color:var(--gold)">new look</b>`, '', true);
}
// Desbloqueo: el candado se rompe en pedazos, la tarjeta se enciende desde el gris y aparece la chispa de NEW.
function unlockFx(el) {
  const icn = el.querySelector('.ic');
  if (!reduced) el.animate([{ filter: 'grayscale(1) brightness(.6)' }, { filter: 'none' }], { duration: 360, easing: 'steps(6)' });
  const [x, y] = ptOf(icn, 14, 14); burst(sfxL(), x, y, 12, ['#d6c070', '#9aa3b8', '#3a2a10'], { spread: 34, up: 14, size: 3, dur: 520, fall: 20 });
  const nm = el.querySelector('.unm'); const nw = document.createElement('span'); nw.className = 'new'; nw.append(toImg(icon(['..g..', '.gWg.', 'gWWWg', '.gWg.', '..g..'], { g: '#62d36e', W: '#e8ffe8' }, '#0f2a14'), 1), 'NEW'); nm.appendChild(nw);
  if (!reduced) nw.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.4)', offset: 0.6 }, { transform: 'none' }], { duration: 260, delay: 200, easing: 'steps(5)', fill: 'backwards' });
}
// Hito / función nueva: la tarjeta destella en oro, el icono gira y se asienta, confeti dorado, sello DONE y la
// explicación de qué hace se despliega debajo (en el juego, se explica al comprarlo).
function milestone(id, old) {
  const n = T.nodes[id];
  const el = nodeEl(id); old.replaceWith(el); E.nodes[id] = el;
  const icn = el.querySelector('.ic canvas');
  if (!reduced) { el.animate([{ boxShadow: 'inset 0 0 0 200px #ffcf2e55' }, { boxShadow: '' }], { duration: 500, delay: 260, easing: 'steps(5)', fill: 'backwards' }); icn.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'scaleX(1)' }, { transform: 'scaleX(-1)' }, { transform: 'translateY(-6px) scale(1.2)' }, { transform: 'none' }], { duration: 600, delay: 260, easing: 'steps(8)', fill: 'backwards' }); }
  setTimeout(() => {
    const [x, y] = ptOf(el.querySelector('.ic')); burst(sfxL(), x, y, 24, ['#ffcf2e', '#fff3a0', '#ffffff', '#e0a020'], { spread: 80, up: 24, size: 4, dur: 800, fall: 20 });
    const tag = el.querySelector('.up-tag'); if (tag && !reduced) tag.animate([{ transform: 'scale(1.8)', opacity: 0 }, { transform: 'scale(.9)', opacity: 1, offset: 0.6 }, { transform: 'none' }], { duration: 280, easing: 'steps(5)' });
    const ex = document.createElement('div'); ex.className = 'explain'; ex.innerHTML = n.explain; el.appendChild(ex); if (!reduced) ex.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'steps(4)' });
    toast(`<b style="color:var(--gold)">${n.name}</b> unlocked`, '', true);
  }, reduced ? 0 : 620);
  paintAll();
}
// Inversión (Night Lamp): se celebra, como en el juego; la lámpara se enciende y alumbra.
function investFx(el) {
  const icn = el.querySelector('.ic');
  if (!reduced) icn.animate([{ boxShadow: '0 0 0 0 #fff3a0' }, { boxShadow: '0 0 0 8px #fff3a044' }, { boxShadow: '0 0 0 0 #fff3a000' }], { duration: 700, delay: 260, easing: 'steps(6)' });
  setTimeout(() => { const [x, y] = ptOf(icn); burst(sfxL(), x, y, 14, ['#fff3a0', '#ffcf2e', '#ffffff'], { spread: 40, up: 10, size: 3, dur: 600, fall: 4 }); }, reduced ? 0 : 300);
  toast(`<b>Night Lamp</b>: your mice keep working ${8 + 2 * S.r.lamp} hours while you are away`, '', true);
}
// Abrir una roca: la fila se enciende, el trozo de queso salta, confeti y WORKING; la siguiente roca muestra su precio.
function openRock(i, btn) {
  const c = ROCKS[i][2];
  if (c > S.coins) { btn.classList.remove('shake'); void btn.offsetWidth; btn.classList.add('shake'); return; }
  S.coins -= c; S.zones = i + 1;
  flyCoin(btn, btn.closest('.up-zone').querySelector('.ic'));
  paintZones();
  const z = E.zones.querySelector(`[data-z="${ROCKS[i][0]}"]`), im = z.querySelector('.ic img');
  if (!reduced) { z.animate([{ boxShadow: 'inset 0 0 0 200px #ffcf2e44' }, { boxShadow: '' }], { duration: 500, delay: 260, easing: 'steps(5)', fill: 'backwards' }); im.animate([{ transform: 'translateY(-8px) scale(1.3)' }, { transform: 'none' }], { duration: 300, delay: 260, easing: 'steps(5)', fill: 'backwards' }); }
  setTimeout(() => { const [x, y] = ptOf(z.querySelector('.ic')); burst(sfxL(), x, y, 20, ['#ffcf2e', '#fff3a0', '#ffffff'], { spread: 60, up: 18, size: 3, dur: 700, fall: 14 }); }, reduced ? 0 : 300);
  toast(`<b>${ROCKS[i][1]}</b> is open · new cheese: <b style="color:var(--gold)">${ROCKS[i][3]}</b>`, '', true);
}
// Objetivo cumplido (Cheesemaking): la barra se llena y late en oro; Grand Master rompe su candado.
function goalMet() {
  if (S.goal >= 1) return;
  S.goal = 1; const bar = E.goal.querySelector('.bar i'); bar.style.width = '100%';
  setTimeout(() => { paintGoal(); E.goal.classList.add('met'); setTimeout(() => E.goal.classList.remove('met'), 1600); relock(['master']); const [x, y] = ptOf(E.goal); burst(sfxL(), x, y, 16, ['#ffcf2e', '#fff3a0', '#ffffff'], { spread: 90, up: 10, size: 3, dur: 700, fall: 14 }); toast('Goal met: <b style="color:var(--gold)">Grand Master</b> is open', '', true); }, reduced ? 0 : 520);
}
// BUY EVERYTHING (aprobado): todas las compras en el acto; cada tarjeta cuenta su rango y suelta un solo «+N»; el
// aspecto cambia una vez; un único aviso resume. Un segundo toque compra si queda algo; si no, no tiembla en 0,7 s.
let allAt = 0;
function buyAll() {
  if (!affordable()) { if (performance.now() - allAt < 700) return; E.all.classList.remove('shake'); void E.all.offsetWidth; E.all.classList.add('shake'); return; }
  allAt = performance.now();
  const before = { ...S.r }, start = S.coins, tier0 = tierOf(power());
  let k0 = 0;
  for (;;) {
    const opts = Object.entries(T.nodes).filter(([id, n]) => !n.unlock && !n.key && S.r[id] < n.max && !lockWhy(id) && cost(n, S.r[id]) <= S.coins).sort((a, b) => cost(a[1], S.r[a[0]]) - cost(b[1], S.r[b[0]]));
    if (!opts.length || k0 >= 999) break;
    const [id, n] = opts[0]; S.coins -= cost(n, S.r[id]); S.r[id]++; k0++;
  }
  const changed = Object.keys(T.nodes).filter((id) => S.r[id] !== before[id]), maxed = [];
  changed.forEach((id, k) => {
    const el = nodeEl(id); E.nodes[id].replaceWith(el); E.nodes[id] = el;
    const gain = S.r[id] - before[id], max = T.nodes[id].max; if (S.r[id] >= max) maxed.push(T.nodes[id].name);
    const rk = el.querySelector('.rk');
    if (rk && !reduced) { const t0 = performance.now() + k * 90, d = 420; const tick = () => { const e = Math.min(1, Math.max(0, (performance.now() - t0) / d)); rk.textContent = Math.round(before[id] + gain * e) + (max >= 500 ? '' : '/' + max); if (e < 1) requestAnimationFrame(tick); }; tick(); }
    setTimeout(() => { const icn = el.querySelector('.ic'); if (!reduced) icn.animate([{ transform: 'scale(1.25)' }, { transform: 'none' }], { duration: 200, easing: 'steps(3)' }); const [x, y] = ptOf(icn, 0, -14); floatText(sfxL(), x - 10, y, '+' + gain, 'up-plus', 800, 12); burst(sfxL(), x, y + 14, 6, ['#a8ccff', '#5a9cf0', '#ffffff'], { spread: 18, up: 6, size: 3, dur: 380, fall: 2 }); }, reduced ? 0 : k * 90);
  });
  relock(Object.keys(T.nodes).filter((id) => !changed.includes(id)));
  const tier1 = tierOf(power()), looked = tier1 !== tier0 && (T.looks !== 'pick' || (tier0 < 3 && tier1 >= 3));
  // La tira cambia de golpe solo en el texto; si hay aspecto nuevo, se revela con su animación (sin reconstruir nada).
  if (E.looks) { if (looked) { E.looks._cap.innerHTML = ''; setTimeout(() => { updateLooks(); newLook(tier1, true); }, reduced ? 0 : changed.length * 90 + 120); } else updateLooks(); }
  paintAll();
  toast(`Bought <b>${k0}</b> upgrade${k0 === 1 ? '' : 's'} for <b style="color:var(--gold)">${fmtN(start - S.coins)}</b>: ${changed.map((id) => `${T.nodes[id].name} +${S.r[id] - before[id]}`).join(', ')}${maxed.length ? ` · <b>${maxed.join(', ')}</b> at top rank` : ''}${looked ? ' · <b style="color:var(--gold)">new look</b>' : ''}`, '', true);
}
build();

return { build, treeIcon, TREES };
})();
