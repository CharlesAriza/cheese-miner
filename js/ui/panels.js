// Paneles de la interfaz. Cada función devuelve HTML a partir del estado;
// los botones llevan data-act y main.js los traduce en acciones reales.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const I = CM.icons;

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const secs = (ms) => (Math.round(ms / 100) / 10).toString().replace(/\.0$/, '') + 's';
  const coin = (n) => '<span class="coin-txt">' + I.img('coin') + CM.fmt(n) + '</span>';
  const btn = (act, label, opts) => {
    const o = opts || {};
    // data-cost permite pintar en el botón cuánto falta para poder pagarlo.
    return '<button data-act="' + act + '"' + (o.cost ? ' data-cost="' + o.cost + '"' : '') + ' class="' + (o.cls || '') + (o.off ? ' off' : '') + '">' + label + '</button>';
  };
  const row = (title, sub, right, cls) =>
    '<div class="rowc ' + (cls || '') + '"><div class="info"><b>' + title + '</b><small>' + sub + '</small></div><div class="side">' + right + '</div></div>';
  const xpBar = (p) => '<div class="bar xp"><i style="width:' + Math.round((p.cur / p.need) * 100) + '%"></i></div>';

  // Explicación legible de por qué algo no se puede hacer.
  CM.REASONS = {
    'vein-exposed': 'Vein exposed: use the DRILL',
    'no-vein': 'No vein exposed: mine the rock first',
    'not-built': 'Build it first',
    'no-raw': 'Not enough Raw Cheese (need ' + B.refinery.rawPerBase + ')',
    'no-base': 'Not enough Cheese Base',
    'no-cheese': 'No cheese to sell. Make some in the Cheesery',
    'no-coins': 'Not enough coins',
    'level-locked': 'Your skill level is too low for that',
    'part-locked': 'You have not unlocked that ingredient yet',
    locked: 'Not unlocked yet',
    'already-built': 'Already built',
    'max-level': 'Already at max rank',
    'no-house': 'Build the Mouse House first',
    'lab-busy': 'The lab is already researching a recipe',
    'mouse-level': 'That mouse needs more levels first',
    'empty-post': 'Nobody works here: recruit a mouse, or select one and tap this post',
    invalid: 'That is not possible',
    busy: 'The Cheesery is busy',
    known: 'That recipe is already in your Recipe Book',
    'empty-name': 'Type a name first',
    idle: 'Nothing is being made',
  };

  // Efecto de un nudo en valores reales: lo que tienes ahora y lo que tendrás
  // con un rango más («2 Raw > 3 Raw»), nunca un porcentaje suelto.
  const round1 = (n) => Math.round(n * 10) / 10;
  const SHOW = {
    pickPower: (s) => round1(q.pickPower(s)) + ' search per hit',
    critMult: (s) => 'crits hit x' + round1(q.critMult(s)),
    minerSpeed: (s) => 'a swing every ' + secs(q.minerInterval(s)),
    veinCap: (s) => CM.fmt(q.veinCapacity(s, B.zones[0].id)) + ' Raw in a ' + B.zones[0].name + ' vein',
    richDepth: (s) => 'each depth level multiplies that rock\'s cheese value by ' + (1 + B.depth.richness + q.mods(s)('richDepth')).toFixed(3),
    drillYield: (s) => round1(q.drillYield(s, B.zones[0].id)) + ' Raw per cycle',
    drillRich: (s) => round1(q.drillYield(s, B.zones[0].id)) + ' Raw per cycle',
    drillSpeed: (s) => 'a cycle every ' + secs(q.drillDuration(s)),
    refBatch: (s) => round1(q.refineBatch(s) * q.refineMult(s)) + ' Base per cycle',
    refBonus: (s) => round1(q.refineBatch(s) * q.refineMult(s)) + ' Base from ' + round1(q.refineBatch(s) * q.skillMult(s, 'refining') * B.refinery.rawPerBase) + ' Raw',
    refSpeed: (s) => 'a cycle every ' + secs(q.refineDuration(s)),
    labSpeed: (s) => 'the next recipe takes ' + secs(CM.cheesery.labTime(s)),
    labSaving: (s) => 'the next research uses ' + CM.cheesery.labCost(s) + ' Cheese Base',
    cheeseBatch: (s) => q.cheeseBatch(s) + ' cheese per batch',
    cheeseSpeed: (s) => 'a plain cheese in ' + secs(B.cheesery.baseTimeMs / (1 + q.mods(s)('cheeseSpeed'))),
    cheeseValue: (s) => 'a plain Cheddar is worth ' + round1(B.bases.cheddar.value * (1 + q.mods(s)('cheeseValue')) * q.depthRich(s, B.zones[0].id)),
    price: (s) => 'customers pay x' + Math.round(q.priceMult(s) * 100) / 100,
    sellCount: (s) => q.sellCount(s) + ' cheese per sale',
    sellSpeed: (s) => 'a sale every ' + secs(q.sellDuration(s)),
    offlineHours: (s) => Math.round(q.offlineCapMs(s) / 3600000) + ' hours away',
  };
  // Calcula el texto como si el nudo tuviera otro rango, sin tocar la partida.
  function atRank(s, key, rank, fn) {
    const had = s.nodes[key];
    if (rank > 0) s.nodes[key] = rank;
    else delete s.nodes[key];
    const out = fn(s);
    if (had === undefined) delete s.nodes[key];
    else s.nodes[key] = had;
    return out;
  }
  function effectText(s, skill, node, rank) {
    if (node.unlock) return rank ? 'Unlocked' : 'Not unlocked yet';
    if (node.max === 1) return rank ? 'Working for you' : 'Not hired yet';
    const show = SHOW[Object.keys(node.eff)[0]];
    const key = skill + '.' + node.id;
    const now = atRank(s, key, rank, show);
    return rank >= node.max ? now : 'Now: ' + now + '<br>Next: ' + atRank(s, key, rank + 1, show);
  }

  const BRANCHES = [
    ['power', 'POWER', 'More output. Each rank changes how the building looks'],
    ['auto', 'TEMPO', 'Faster cycles for this stage, whoever does the work'],
    ['special', 'SPECIAL', 'What makes this skill different'],
  ];

  const LAB_BRANCHES = [
    ['unlock', 'NEW FUNCTIONS', 'Each one opens something new in the lab'],
    ['power', 'EFFICIENCY', 'Faster and cheaper research, by hand or with a mouse'],
  ];

  // ---------- ÁRBOL DE UNA HABILIDAD ----------
  function treePanel(s, ui) {
    const skill = ui.tree;
    const isSkill = !!B.skills[skill];
    let h = '';
    if (isSkill) {
      const p = q.xpProgress(s, skill);
      h += '<div class="rep"><div class="rhead"><b>' + B.skills[skill].name + ' · LEVEL ' + p.level + '</b><span>' + (p.maxed ? 'MAX' : CM.fmt(p.cur) + '/' + CM.fmt(p.need) + ' xp') + '</span></div>' + xpBar(p) + '<small>Each level: +' + Math.round(B.xp.bonusPerLevel * 100) + '% to this skill. Levels unlock new upgrades. You earn xp by doing the work, or by having a mouse do it.</small></div>';
    }
    if (skill === 'colony') h += zonesBlock(s);
    if (skill === 'lab') h += btn('open:lab', '<b>BACK TO THE LAB</b><span>The lab starts simple. Each upgrade here teaches it something new.</span><em>BACK</em>', { cls: 'labrow' });
    const n = CM.tree.affordable(s, skill, true);
    if (skill !== 'lab' || n) h += btn('buyAll:' + skill, n ? 'BUY EVERYTHING I CAN AFFORD' : 'NOTHING AFFORDABLE YET', { off: !n, cls: 'buy wide serveall' });
    for (const br of skill === 'lab' ? LAB_BRANCHES : BRANCHES) {
      const nodes = B.trees[skill].filter((x) => x.branch === br[0]);
      if (!nodes.length) continue;
      h += '<h3>' + (skill === 'colony' ? 'WHILE YOU ARE AWAY' : br[1]) + '</h3><p class="hint">' + (skill === 'colony' ? 'Only stages with a mouse keep going when the game is closed' : br[2]) + '</p>';
      for (const node of nodes) {
        const info = CM.tree.info(s, skill, node.id);
        const title = node.name + (node.max > 1 ? ' <span class="rank">' + info.rank + (node.max >= 500 ? '' : '/' + node.max) + '</span>' : '');
        const sub = node.desc + '<br><span class="st ' + (info.rank ? 'good' : 'dim') + '">' + effectText(s, skill, node, info.rank) + '</span>';
        let right;
        if (info.maxed) right = '<span class="tag">' + (node.unlock ? 'DONE' : node.max === 1 ? 'HIRED' : 'MAX') + '</span>';
        else if (info.locked) right = '<span class="tag lock">' + info.why.replace(/ (LV \d+)$/, '<br>$1') + '<br>' + coin(info.cost) + '</span>';
        else right = btn('node:' + skill + ':' + node.id, (node.unlock ? 'UNLOCK' : node.branch === 'auto' && node.max === 1 ? 'HIRE' : 'BUY') + '<br>' + coin(info.cost), { off: !info.canBuy, cls: 'buy', cost: info.cost });
        h += row(title, sub, right, info.locked ? 'locked' : '');
      }
    }
    return h;
  }

  // Zonas: se suman, todas producen a la vez.
  function zonesBlock(s) {
    let h = '<h3>ROCKS</h3><p class="hint">Every rock you open keeps working. Rocks never run out: they just get deeper and richer.</p>';
    const next = CM.zones.next(s);
    for (const def of B.zones) {
      const z = s.zones[def.id];
      const icon = I.img('raw', def.base, 'big');
      if (z.unlocked) {
        const state = z.veinRevealed ? z.veinRemaining + ' Raw left in this vein' : 'Searching ' + Math.floor(z.discover) + '/' + q.veinHits(s, def.id);
        h += '<div class="zone active">' + icon + '<div class="info"><b>' + def.name + ' · depth ' + z.depth + '</b><small>' + state + ' · ' + Math.round(q.drillYield(s, def.id) * 10) / 10 + ' Raw per cycle</small></div><div class="side"><span class="tag">WORKING</span></div></div>';
      } else if (next && next.id === def.id) {
        h += '<div class="zone">' + icon + '<div class="info"><b>' + def.name + '</b><small>New cheese: ' + B.bases[def.base].name + ', worth ' + B.bases[def.base].value + ' (Cheddar is ' + B.bases.cheddar.value + '). Unlocks ' + CM.cheesery.allCombos([def.base]).length + ' recipes</small></div><div class="side">' + btn('zone:' + def.id, 'OPEN<br>' + coin(def.unlockCost), { off: s.coins < def.unlockCost, cls: 'buy', cost: def.unlockCost }) + '</div></div>';
      } else {
        h += '<div class="zone locked">' + icon + '<div class="info"><b>' + def.name + '</b><small>Open the previous rock first</small></div><div class="side"><span class="tag lock">LOCKED</span></div></div>';
      }
    }
    return h;
  }

  function comboLine(combo) {
    return [B.bases[combo.base].name, B.ingredients[combo.ingredient].name, B.treatments[combo.treatment].name, B.maturations[combo.maturation].name].join(' + ');
  }
  const valueTag = (s, recipe) => {
    const v = CM.cheesery.valueOf(s, recipe);
    return '<span class="stat v">' + coin(CM.shop.price(s, recipe)) + '</span><span class="stat tier ' + CM.cheesery.tierOf(v).toLowerCase() + '">' + CM.cheesery.tierOf(v) + '</span>';
  };

  // ---------- CHEESERY ----------
  // ---------- CHEESE LAB ----------
  const DIR_NAME = (dir) => {
    const [kind, id] = String(dir || '').split(':');
    if (kind === 'value') return 'the most valuable recipe';
    if (kind === 'fast') return 'the quickest recipe to cook';
    if (kind === 'strain') return 'strains';
    if (kind === 'base') return B.bases[id].name + ' recipes';
    if (kind === 'ingredient') return 'recipes with ' + B.ingredients[id].name;
    if (kind === 'treatment') return B.treatments[id].name + ' recipes';
    if (kind === 'maturation') return B.maturations[id].name + ' recipes';
    return '';
  };
  // Dirección en dos palabras, para el botón del selector.
  const DIR_LABEL = (dir) => {
    const [kind, id] = String(dir || '').split(':');
    if (kind === 'value') return 'Highest value';
    if (kind === 'fast') return 'Quickest to cook';
    if (kind === 'strain') return 'Strains';
    if (kind === 'base') return B.bases[id].name + ' recipes';
    if (kind === 'ingredient') return 'With ' + B.ingredients[id].name;
    if (kind === 'treatment') return B.treatments[id].name;
    if (kind === 'maturation') return B.maturations[id].name;
    return 'No direction';
  };

  // ---- Cabecera común: el banco del laboratorio, con quién investiga y qué hay en el matraz ----
  function labHeader(s) {
    const C = CM.cheesery;
    const w = C.labWorker(s);
    const job = s.lab.job;
    const wait = C.labWaiting(s);
    let h = '<div class="labhead' + (job ? ' busy' : '') + '">';
    // Sin edificio todavía no hay puesto: solo se enseña lo que se investiga.
    if (C.labHas(s, 'assistant')) {
      h += w
        ? '<button data-act="researcher" class="labwho">' + face(w) + '<span><b>' + esc(w.name) + '</b><small>Research LV ' + CM.mice.level(w) + hearts(w.aff.research) + '</small><small>' + mouseRate(s, w, 'research', 'all') + '</small></span><em>CHANGE</em></button>'
        : '<button data-act="researcher" class="labwho none"><i class="labhole">+</i><span><b>No researcher</b><small>Research by hand</small></span><em>ASSIGN</em></button>';
    }
    h += '<div class="labnow"><i class="labflask">' + I.img('flask') + '</i><div>';
    if (job) {
      const known = C.recipeByKey(s, job.key);
      h += '<small>' + (job.retried ? 'INCONCLUSIVE · AGAIN' : job.strain ? 'CULTURING A STRAIN' : 'RESEARCHING') + '</small><b>' + esc(job.strain && known ? known.name : C.defaultName(C.parseKey(job.key))) + '</b><div class="bar labtube"><i data-job="lab"></i></div>';
      // Lo que el jugador ha pedido a mano para después.
      if (s.lab.next && C.parseKey(s.lab.next)) {
        const nk = C.recipeByKey(s, s.lab.next);
        h += '<div class="labwait"><span>Next: ' + (nk ? 'strain of ' + esc(nk.name) : esc(C.defaultName(C.parseKey(s.lab.next)))) + '</span>' + btn('labcancel', 'CANCEL', { cls: 'chip' }) + '</div>';
      }
    } else if (wait) {
      const short = wait.have < wait.need;
      h += '<small>' + (short ? 'WAITING FOR CHEESE BASE' : wait.coin > s.coins ? 'WAITING FOR COINS' : 'ABOUT TO START') + '</small><b>' + (wait.strain ? 'Strain of ' : '') + esc(wait.name) + '</b>';
      h += '<div class="bar labtube wait"><i style="width:' + Math.round(Math.min(1, wait.have / wait.need) * 100) + '%"></i></div>';
      h += '<div class="labwait"><span>' + CM.fmt(Math.min(wait.have, wait.need)) + '/' + CM.fmt(wait.need) + ' ' + B.bases[wait.base].name + ' Base' + (wait.coin ? ' · ' + wait.coin + ' coins' : '') + '</span>' + (wait.queued ? btn('labcancel', 'CANCEL', { cls: 'chip' }) : '') + '</div>';
    } else {
      h += '<small>IDLE</small><b>' + (w && C.labDir(s) ? 'Nothing left to research at your level' : w ? 'Choose a direction' : 'Start a research below') + '</b>';
    }
    return h + '</div></div></div>';
  }

  // ---- RECIPES: dirección en un selector plegado, libro y prueba a mano ----
  const DIR_CATS = [['goal', 'GOAL'], ['base', 'CHEESE'], ['ingredient', 'INGREDIENT'], ['treatment', 'TREATMENT'], ['maturation', 'AGING']];
  function labRecipes(s, ui) {
    const C = CM.cheesery;
    const w = C.labWorker(s);
    const dir = s.lab.dir;
    let h = '';
    if (s.built.lab) {
      // Las direcciones llegan con Advanced Research; antes, el ratón va a por la más valiosa.
      if (C.labHas(s, 'advanced')) {
        const what = dir === 'strain' ? 'is culturing strains: choose a direction to go back to recipes' : !dir ? 'researches nothing on its own until you choose' : C.labPick(s, false) ? 'works through ' + DIR_NAME(dir) : 'has nothing left in ' + DIR_NAME(dir) + ' at your Cheesemaking level';
        h += '<button data-act="labdiropen" class="labdir' + (ui.labDirOpen ? ' open' : '') + '"><small>DIRECTION</small><b>' + DIR_LABEL(dir === 'strain' ? '' : dir) + '</b><span>' + (w ? esc(w.name) + ' ' + what : 'Your researcher will follow it') + '</span><em>' + (ui.labDirOpen ? 'CLOSE' : 'CHANGE') + '</em></button>';
        if (ui.labDirOpen) {
          // Una categoría a la vista cada vez: el selector no crece con las opciones.
          const kind = String(dir || '').split(':')[0];
          const cat = ui.labDirCat || (DIR_CATS.some((c) => c[0] === kind) ? kind : 'goal');
          const chip = (d, label) => btn('labdir:' + (d || 'none'), label, { cls: 'chip' + (dir === d ? ' on' : '') });
          const parts = (part) => Object.keys(B[C.TABLES[part]]).filter((id) => !C.partLocked(s, part, id)).map((id) => chip(part + ':' + id, (part === 'base' ? I.img('base', id) : '') + B[C.TABLES[part]][id].name)).join('');
          h += '<div class="labdirsel"><div class="labcats">' + DIR_CATS.map((c) => btn('labdircat:' + c[0], c[1], { cls: cat === c[0] ? 'on' : '' })).join('') + '</div>';
          h += '<div class="labopts">' + (cat === 'goal' ? chip('value', 'Highest value') + chip('fast', 'Quickest to cook') + chip('', 'None') : parts(cat)) + '</div></div>';
        }
      } else if (w) {
        h += '<div class="labinfo"><b>' + esc(w.name) + ' researches for you</b><span>' + (C.labDir(s) === 'strain' ? 'Now culturing strains.' : 'Always the most valuable recipe you can make, one after another.') + '</span></div>';
      }
    } else {
      const info = CM.construction.buildInfo(s, 'lab');
      const need = B.buildings.lab.requires.min;
      const got = Math.min(s.totals.recipes, need);
      h += '<div class="labbuild">' + I.img('flask', '', 'big') + '<div>' + (info.canBuild
        ? '<b>THE CHEESE LAB IS READY TO BUILD</b><small>Its own building, with a post for a Research mouse: you choose what to look for and it researches for you.</small>' + btn('build:lab', 'BUILD · It is free', { cls: 'buy wide' })
        : '<b>CHEESE LAB · ' + got + '/' + need + ' RECIPES</b><div class="labpips">' + Array.from({ length: need }, (_, n) => '<i class="' + (n < got ? 'on' : '') + '"></i>').join('') + '</div><small>Discover ' + need + ' recipes by hand and you can build the lab, where a mouse researches for you.</small>') + '</div></div>';
    }
    if (s.built.lab) {
      // Mejoras: lo siguiente que el laboratorio puede aprender, siempre a mano.
      const nextUp = B.trees.lab.find((n) => n.unlock && !CM.tree.rank(s, 'lab', n.id));
      const ready = CM.tree.affordable(s, 'lab');
      const ni = nextUp ? CM.tree.info(s, 'lab', nextUp.id) : null;
      h += btn('tree:lab', '<b>LAB UPGRADES</b><span>' + (nextUp ? 'Next: ' + nextUp.name + ' · ' + (ni.locked ? ni.why.toLowerCase() : CM.fmt(ni.cost) + ' coins') : 'Faster and cheaper research') + '</span><em>' + (ready ? ready + ' READY' : 'OPEN') + '</em>', { cls: 'labrow' + (ready ? ' ready' : '') });
    }
    h += btn('book', '<b>RECIPE BOOK</b><span>' + s.recipes.length + '/' + C.totalCombos() + ' discovered</span><em>OPEN</em>', { cls: 'labrow', off: !s.recipes.length });
    // A mano: abierto mientras no haya quien investigue; con investigador, plegado.
    const hand = ui.labHand === null || ui.labHand === undefined ? !w : ui.labHand;
    h += '<button data-act="labhand" class="labrow' + (hand ? ' open' : '') + '"><b>RESEARCH ONE BY HAND</b><span>' + C.labCost(s) + ' Cheese Base · ' + secs(C.labTime(s) / (w ? CM.mice.speed(w, 'research', s, 'all') : 1)) + '</span><em>' + (hand ? 'CLOSE' : 'OPEN') + '</em></button>';
    if (hand) h += '<div class="labhand">' + recipePicker(s, ui) + '</div>';
    return h;
  }

  // ---- STRAINS ----
  // Lo que da cada cepa en una receta, en valores reales.
  function strainStats(s, r, id) {
    const C = CM.cheesery;
    const as = Object.assign({}, r, { strain: id || '' });
    const st = B.strains[id] || {};
    return { time: C.jobTime(s, C.parseKey(r.key), as), base: C.baseUse(as), price: CM.shop.price(s, as), teach: st.teach || 1 };
  }
  // Filas de una cepa frente a la receta sin cepa: [texto, 'up' | 'down'].
  function strainLines(s, r, id) {
    const a = strainStats(s, r, id);
    const p = strainStats(s, r, '');
    const out = [];
    if (a.time !== p.time) out.push(['Cooks in ' + secs(a.time) + ' <s>' + secs(p.time) + '</s>', a.time < p.time ? 'up' : 'down']);
    if (a.teach !== p.teach) out.push(['Cheesemaker learns ' + a.teach + 'x as fast', 'up']);
    if (a.price > p.price) out.push(['Sells for ' + CM.fmt(a.price) + ' <s>' + CM.fmt(p.price) + '</s>', 'up']);
    if (a.base !== p.base) out.push(['Uses ' + a.base + ' Cheese Base <s>' + p.base + '</s>', a.base < p.base ? 'up' : 'down']);
    if (a.price < p.price) out.push(['Sells for ' + CM.fmt(a.price) + ' <s>' + CM.fmt(p.price) + '</s>', 'down']);
    return out;
  }
  const STRAIN_NAME = (id) => (id ? B.strains[id].name : 'Plain');
  // Cómo es cada cepa, en una frase: lo que se ve en el laboratorio, no una cifra.
  const STRAIN_NOTE = { quick: 'A restless culture: the curd sets before it has time to mature.', dense: 'Pressed until there is nothing left to press. Heavy, rich and hungry.', teaching: 'Slow and fussy. Every wheel is a lesson for whoever makes it.' };
  const strainIcon = (id, cls) => (id ? I.img(id, '', cls) : I.img('lot', 'cheddar', cls));
  function labStrains(s, ui) {
    const C = CM.cheesery;
    if (!C.strainsOpen(s)) {
      return '<div class="labbuild">' + I.img('flask', '', 'big') + '<div><b>STRAINS</b><small>A strain is a mutation of a cheese you already know: the same recipe, made another way. ' + (s.built.lab ? 'They open at Cheesemaking LV ' + B.cheesery.strainLevel + ' (you are LV ' + q.level(s, 'cheesemaking') + ').' : 'They need the Cheese Lab built and Cheesemaking LV ' + B.cheesery.strainLevel + '.') + '</small></div></div>';
    }
    const w = C.labWorker(s);
    let h = '';
    // Recién encontrada: un hallazgo, con lo que cambia frente a lo que hay.
    const f = s.lab.found;
    const fr = f && C.recipe(s, f.recipeId);
    if (fr) {
      const cur = fr.next !== undefined ? fr.next : fr.strain || '';
      const a = strainStats(s, fr, cur);
      const b = strainStats(s, fr, f.strain);
      const row = (label, x, y, better) => (x === y ? '' : '<tr><th>' + label + '</th><td>' + x + '</td><td class="' + (better ? 'tok' : 'tbad') + '">' + y + '</td></tr>');
      h += '<div class="strainnew" data-strain="' + f.strain + '"><div class="strainfound">' + strainIcon(f.strain, 'huge') + '<div><small>DISCOVERY</small><b>' + B.strains[f.strain].name.toUpperCase() + '</b><span>A new strain of ' + esc(fr.name) + '</span></div></div><p>' + STRAIN_NOTE[f.strain] + '</p>';
      h += '<table class="straincmp"><tr><th></th><th>NOW · ' + STRAIN_NAME(cur) + '</th><th>' + STRAIN_NAME(f.strain) + '</th></tr>';
      h += row('Cooks in', secs(a.time), secs(b.time), b.time < a.time) + row('Cheese Base each', a.base, b.base, b.base < a.base) + row('Sells for', CM.fmt(a.price), CM.fmt(b.price), b.price > a.price) + row('Cheesemaker learns', a.teach + 'x', b.teach + 'x', b.teach > a.teach) + '</table><div class="strainact">';
      h += btn('strain:' + fr.id + ':' + f.strain, 'USE ' + B.strains[f.strain].name.toUpperCase(), { cls: 'buy' }) + btn('strainkeep', 'KEEP ' + STRAIN_NAME(cur).toUpperCase(), { cls: 'chip' }) + '</div></div>';
    }
    // Recetas con cepas a la vista: la que cocina la línea, las que ya tienen alguna y las mejores.
    const pool = s.recipes.filter((r) => B.cheesery.strainBases.indexOf(C.parseKey(r.key).base) >= 0).sort((a, b) => C.valueOf(s, b, true) - C.valueOf(s, a, true));
    if (!pool.length) return h + '<p class="hint">You know no Cheddar recipe yet.</p>';
    const lane = C.laneRecipe(s, q.zoneOfBase(B.cheesery.strainBases[0]));
    const shown = pool.filter((r, i) => r === lane || (r.strains || []).length || i < 3 || r.id === ui.strainRecipe);
    shown.sort((a, b) => (b === lane) - (a === lane));
    const r = shown.find((x) => x.id === ui.strainRecipe) || (fr && shown.indexOf(fr) >= 0 ? fr : shown[0]);
    const want = r.next !== undefined ? r.next : r.strain || '';
    const combo = C.parseKey(r.key);
    if (shown.length > 1) h += '<div class="strainpick">' + shown.map((x) => btn('strainrecipe:' + x.id, esc(x.name) + (x === lane ? ' · cooking' : ''), { cls: 'chip' + (x === r ? ' on' : '') })).join('') + '</div>';
    h += '<div class="strainhero" data-strain="' + (want || 'plain') + '"><i class="straindish">' + I.img('lot', combo.base, 'big') + '</i><div><small>SPECIMEN</small><b>' + esc(r.name) + '</b><span>' + (r === lane ? 'Your ' + B.bases[combo.base].name + ' line cooks this one' : 'Not being cooked now') + '</span></div><em>' + strainIcon(want) + STRAIN_NAME(want).toUpperCase() + (r.next !== undefined ? '<small>next batch</small>' : '') + '</em></div>';
    h += '<div class="straingrid">';
    const plain = strainStats(s, r, '');
    for (const id of [''].concat(Object.keys(B.strains))) {
      const found = !id || r.strains.indexOf(id) >= 0;
      if (!found) continue;
      const lines = id ? strainLines(s, r, id).map((l) => '<li class="' + (l[1] === 'up' ? 'tok' : 'tbad') + '">' + (l[1] === 'up' ? '&#9650; ' : '&#9660; ') + l[0] + '</li>').join('') : '<li>Cooks in ' + secs(plain.time) + '</li><li>Uses ' + plain.base + ' Cheese Base</li><li>Sells for ' + CM.fmt(plain.price) + '</li>';
      h += '<button data-act="strain:' + r.id + ':' + (id || 'plain') + '" data-strain="' + (id || 'plain') + '" class="straincard' + (want === id ? ' on' : '') + '"><b>' + strainIcon(id) + STRAIN_NAME(id).toUpperCase() + '</b><ul>' + lines + '</ul><em>' + (want === id ? 'IN USE' : 'USE') + '</em></button>';
    }
    const missing = Object.keys(B.strains).length - r.strains.length;
    // Las que faltan: una sola fila, una placa vacía por cada una.
    if (missing) h += '<div class="straincard unknown">' + '<i class="straindish">?</i>'.repeat(missing) + '<small>' + missing + ' undiscovered strain' + (missing > 1 ? 's' : '') + '</small></div>';
    h += '</div>';
    // Buscar: a mano en la receta que se ve; el investigador sigue a la línea.
    const busy = !!s.lab.job;
    const queued = s.lab.next === r.key;
    const cost = C.labCost(s);
    const time = secs((C.labTime(s) * B.cheesery.strainTime) / (w ? CM.mice.speed(w, 'research', s, 'all') : 1));
    h += btn('strainfind:' + r.id, !missing ? 'EVERY STRAIN OF THIS CHEESE FOUND' : queued ? 'NEXT IN THE LAB' : 'CULTURE A NEW STRAIN' + (busy ? ' NEXT' : '') + '<br>' + cost + ' ' + B.bases[combo.base].name + ' Base · ' + time, { cls: 'buy wide', off: !missing || queued });
    if (w) h += btn('labdir:strain', '<b>' + esc(w.name).toUpperCase() + ' KEEPS CULTURING</b><span>follows the recipe your line cooks</span><em>' + (s.lab.dir === 'strain' ? 'ON' : 'OFF') + '</em>', { cls: 'labrow' + (s.lab.dir === 'strain' ? ' open' : '') });
    return h;
  }

  function labPanel(s, ui) {
    if (!s.built.cheesery) return '<p class="hint">Build the Cheesery first.</p>';
    // La primera receta: todavía no hay laboratorio que enseñar, solo qué mezclar.
    if (!s.recipes.length) return (s.lab.job ? labHeader(s) : '<p class="lead">A cheese is <b>a base and three choices</b>. Pick them and discover your first one: you get the recipe and a cheese to sell.</p>') + recipePicker(s, ui);
    let h = labHeader(s);
    if (!s.built.lab) return h + labRecipes(s, ui);
    // STRAINS no existe en pantalla hasta que se compra su investigación.
    if (!CM.cheesery.strainsOpen(s)) return h + labRecipes(s, ui);
    const tab = ui.labTab === 'strains' ? 'strains' : 'recipes';
    const fresh = !!s.lab.found || (CM.cheesery.strainsOpen(s) && !s.recipes.some((r) => (r.strains || []).length) && !(s.lab.job && s.lab.job.strain));
    h += '<div class="tabs labtabs">' + btn('labtab:recipes', 'RECIPES', { cls: tab === 'recipes' ? 'on' : '' }) + btn('labtab:strains', 'STRAINS' + (fresh ? ' · NEW' : ''), { cls: (tab === 'strains' ? 'on' : '') + (fresh && tab !== 'strains' ? ' labnew' : '') }) + '</div>';
    return h + (tab === 'strains' ? labStrains(s, ui) : labRecipes(s, ui));
  }

  // Elegir cuatro componentes y lanzar la investigación a mano.
  function recipePicker(s, ui) {
    const C = CM.cheesery;
    const level = q.level(s, 'cheesemaking');
    let h = '';
    const combo = ui.combo;
    for (const p of C.PARTS) if (C.partLocked(s, p, combo[p])) combo[p] = Object.keys(B[C.TABLES[p]]).find((id) => !C.partLocked(s, p, id));
    const groups = [
      ['base', '1 · BASE', (k) => I.img('base', k) + B.bases[k].name, (k) => 'worth ' + B.bases[k].value + ' · have ' + s.inv.base[k], (k) => 'open its rock'],
      ['ingredient', '2 · INGREDIENT', (k) => B.ingredients[k].name, (k) => 'x' + B.ingredients[k].mult + (B.ingredients[k].coinCost ? ' · ' + B.ingredients[k].coinCost + ' coins' : ' · free')],
      ['treatment', '3 · TREATMENT', (k) => B.treatments[k].name, (k) => 'x' + B.treatments[k].mult + (B.treatments[k].timeMs ? ' · +' + secs(B.treatments[k].timeMs) : '')],
      ['maturation', '4 · MATURATION', (k) => B.maturations[k].name, (k) => 'x' + B.maturations[k].mult + (B.maturations[k].timeMs ? ' · +' + secs(B.maturations[k].timeMs) : '')],
    ];
    for (const g of groups) {
      h += '<div class="pick"><span>' + g[1] + '</span><div>';
      for (const id of Object.keys(B[C.TABLES[g[0]]])) {
        const locked = C.partLocked(s, g[0], id);
        if (locked && g[0] === 'base') continue; // los quesos de rocas sin abrir no ocupan sitio
        const need = g[0] === 'base' ? g[4](id) : 'Cheesemaking LV ' + B[C.TABLES[g[0]]][id].level;
        h += btn(locked ? 'noop' : 'pick:' + g[0] + ':' + id, g[2](id) + '<small>' + (locked ? need : g[3](id)) + '</small>', { cls: 'chip' + (combo[g[0]] === id ? ' on' : '') + (locked ? ' lockedchip' : ''), off: locked });
      }
      h += '</div></div>';
    }
    const known = C.recipeByKey(s, C.keyOf(combo));
    const coins = B.ingredients[combo.ingredient].coinCost;
    if (known) {
      h += '<div class="result">' + I.img('lot', combo.base, 'big') + '<div><b>' + esc(known.name) + '</b><div>' + valueTag(s, known) + '</div><small>Already in your Recipe Book</small></div></div>';
    } else {
      const short = s.inv.base[combo.base] < C.labCost(s);
      const queued = s.lab.next === C.keyOf(combo);
      const busy = !!s.lab.job;
      const can = !queued && !(busy && s.lab.job.key === C.keyOf(combo)) && (busy || short || s.coins >= coins);
      const syn = C.formula(combo).synergies;
      h += '<div class="result"><div><b>Undiscovered cheese</b><small>' + (syn.length ? 'These go well together! ' : '') + 'Costs ' + C.labCost(s) + ' ' + B.bases[combo.base].name + ' Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + secs(C.jobTime(s, combo, null)) + ' · you get the recipe and 1 cheese</small></div></div>';
      h += btn('experiment', queued ? 'NEXT IN THE LAB' : busy ? 'DISCOVER IT NEXT<br>after the research in progress' : short ? 'DISCOVER IT<br>the lab saves up the Cheese Base first' : 'DISCOVER IT', { off: !can, cls: 'buy wide' });
    }
    return h + '<p class="hint">Cheesemaking LV ' + level + '. Higher levels unlock better ingredients.</p>';
  }

  // ---------- CHEESERY ----------
  // Dos vistas: PRODUCCIÓN (una tarjeta por línea, la elegida abierta) y RECIPE BOOK
  // (las recetas de un queso, para comparar y elegir). Investigar es cosa del laboratorio.
  const strainTag = (r) => (r && r.strain ? '<i class="ctag" data-strain="' + r.strain + '">' + B.strains[r.strain].name + '</i>' : '');
  function cheeseLine(s, ui, def, open) {
    const C = CM.cheesery;
    const z = s.zones[def.id];
    const base = def.base;
    const name = B.bases[base].name;
    const job = z.cookJob;
    const mouse = CM.mice.at(s, 'cheesemaking', def.id);
    const lane = C.laneRecipe(s, def.id);
    const pinned = !!C.recipe(s, z.cookRecipe);
    const cooking = job && job.recipeId ? C.recipe(s, job.recipeId) : null;
    const r = cooking || lane;
    const have = s.inv.base[base];
    const reserve = s.lab.want === base ? C.labCost(s) : 0;
    let state = '';
    let tone = '';
    if (job) state = (job.per > 1 ? CM.fmt(job.per) + ' cheeses' : '1 cheese') + ' every ' + secs(job.total);
    else if (!r) {
      state = C.knowsRecipeFor(s, base) ? 'No coins for the ingredient of any ' + name + ' recipe' : 'No ' + name + ' recipe yet: discover one in LAB';
      tone = 'cbad';
    } else if (have - reserve < C.baseUse(r)) {
      state = 'Waiting for Cheese Base: ' + CM.fmt(have) + '/' + CM.fmt(C.baseUse(r) + reserve) + (reserve ? ' (' + reserve + ' set aside for the lab)' : '');
      tone = 'cwarn';
    } else if (s.coins < B.ingredients[C.parseKey(r.key).ingredient].coinCost) {
      state = 'Needs ' + B.ingredients[C.parseKey(r.key).ingredient].coinCost + ' coins for ' + B.ingredients[C.parseKey(r.key).ingredient].name;
      tone = 'cbad';
    } else if (!mouse) {
      state = 'Ready: nobody cooks here, make it by hand';
      tone = 'cidle';
    } else state = 'Starting';
    let h = '<div class="cline' + (open ? ' on' : '') + (tone ? ' ' + tone : '') + (job ? ' crun' : '') + '"><button data-act="cline:' + def.id + '" class="chead">' + I.img('lot', base, 'big') + '<span>';
    h += '<small>' + name.toUpperCase() + ' · ' + (mouse ? 'AUTO · ' + esc(mouse.name) : 'BY HAND') + '</small>';
    h += '<b>' + (r ? esc(r.name) : 'No recipe') + '</b>';
    h += '<i class="crow"><i class="bar"><i data-job="cook:' + def.id + '"></i></i><em class="cstat">' + state + '</em></i></span></button>';
    if (!open) return h + '</div>';
    // La línea elegida: por qué cocina eso, qué gasta y qué se puede hacer con ella.
    h += '<div class="cbody">';
    if (r) {
      const combo = C.parseKey(r.key);
      const coins = B.ingredients[combo.ingredient].coinCost;
      const why = !mouse ? 'You choose what to make here.' : pinned ? 'Pinned by you: ' + esc(mouse.name) + ' always cooks this one.' : esc(mouse.name) + ' cooks your most valuable ' + name + ' recipe.';
      h += '<p>' + (mouse ? '<i class="ctag ' + (pinned ? 'pin' : 'best') + '">' + (pinned ? 'PINNED' : 'BEST') + '</i>' : '') + strainTag(r) + why + '</p>';
      if (cooking && lane && lane.id !== cooking.id) h += '<p class="cnext">Next batch: ' + esc(lane.name) + '</p>';
      h += '<ul class="cfacts"><li><b>' + C.baseUse(r) + '</b>' + name + ' Base each' + (coins ? ' + ' + coins + 'c' : '') + '</li><li><b>' + CM.fmt(have) + '</b>Base in stock</li><li><b>' + CM.fmt(CM.shop.price(s, r)) + '</b>coins each</li></ul>';
    }
    h += '<div class="cact">';
    if (job) h += btn('cheeseTap:' + def.id, 'SPEED UP<br><small>each tap: ' + secs(B.cheesery.boostMs) + ' off this batch</small>', { cls: 'buy' });
    else if (r && !mouse) {
      const max = C.maxLots(s, r);
      h += btn('make:' + r.id + ':1', 'MAKE 1', { off: max < 1, cls: 'buy' }) + btn('make:' + r.id + ':' + Math.max(1, max), 'MAKE ' + (max > 1 ? max : 'MAX'), { off: max < 2, cls: 'buy' });
    }
    h += btn('bookbase:' + base, 'CHANGE RECIPE', { cls: 'chip' });
    if (!mouse) h += btn('staffpost:cheesemaking:' + def.id, 'PUT A MOUSE', { cls: 'chip' });
    return h + '</div></div></div>';
  }
  function cheeseBook(s, ui) {
    const C = CM.cheesery;
    const bases = C.unlockedBases(s);
    const base = bases.indexOf(ui.bookBase) >= 0 ? ui.bookBase : B.zones.find((z) => z.id === ui.zone).base;
    const zoneId = q.zoneOfBase(base);
    const z = s.zones[zoneId];
    const mouse = CM.mice.at(s, 'cheesemaking', zoneId);
    const lane = C.laneRecipe(s, zoneId);
    const pinnedId = C.recipe(s, z.cookRecipe) ? z.cookRecipe : '';
    let h = '<div class="tabs">' + btn('cview:lines', 'PRODUCTION', {}) + btn('noop', 'RECIPE BOOK ' + s.recipes.length + '/' + C.totalCombos(), { cls: 'on' }) + '</div>';
    if (bases.length > 1) h += '<div class="bookbases">' + bases.map((b) => btn('bookbase:' + b, I.img('base', b) + B.bases[b].name, { cls: 'chip' + (b === base ? ' on' : '') })).join('') + '</div>';
    const list = s.recipes.filter((r) => C.parseKey(r.key).base === base).sort((a, b) => C.valueOf(s, b, true) - C.valueOf(s, a, true));
    h += '<p class="hint">' + (!list.length ? 'You know no ' + B.bases[base].name + ' recipe yet. Discover one in LAB.' : mouse ? esc(mouse.name) + ' cooks the most valuable ' + B.bases[base].name + ' recipe on its own (BEST). Tap a recipe to pin another.' : 'Nobody cooks ' + B.bases[base].name + ': tap a recipe to make it by hand.') + '</p>';
    for (const r of list) {
      const combo = C.parseKey(r.key);
      const isPinned = pinnedId === r.id;
      const isBest = !!mouse && !pinnedId && lane === r;
      const open = ui.bookRow === r.id;
      const m = C.masteryLevel(r);
      h += '<div class="brow' + (open ? ' on' : '') + (isPinned || isBest ? ' cooking' : '') + '"><button data-act="bookrow:' + r.id + '" class="bhead"><b>' + esc(r.name) + '</b><span>' + (isPinned ? '<i class="ctag pin">PINNED</i>' : isBest ? '<i class="ctag best">BEST</i>' : '') + strainTag(r) + '</span><small>' + valueTag(s, r) + '<span class="stat">' + secs(C.jobTime(s, combo, r)) + '</span><span class="stat">' + C.baseUse(r) + ' Base</span><span class="stat">Mastery ' + m + '</span></small></button>';
      if (open) {
        const coins = B.ingredients[combo.ingredient].coinCost;
        const max = C.maxLots(s, r);
        const job = z.cookJob;
        const nextAt = B.cheesery.masteryAt[m];
        const syn = C.formula(combo).synergies;
        h += '<div class="bbody"><p>' + comboLine(combo) + (syn.length ? ' · ' + syn.join(', ') : '') + (coins ? ' · ' + coins + ' coins each' : '') + '</p><p>' + (nextAt ? 'Mastery ' + m + ': ' + CM.fmt(r.made || 0) + '/' + CM.fmt(nextAt) + ' made for the next level' : 'Mastery at its top level') + ' · ' + CM.fmt(s.lots[r.id] || 0) + ' in stock</p><div class="cact">';
        if (mouse) h += btn(isPinned ? 'uncook:' + zoneId : 'cook:' + r.id, isPinned ? 'BACK TO AUTO' : 'ALWAYS COOK THIS', { cls: 'buy' });
        else h += btn('make:' + r.id + ':1', 'MAKE 1', { off: !!job || max < 1, cls: 'buy' }) + btn('make:' + r.id + ':' + Math.max(1, max), 'MAKE ' + (max > 1 ? max : 'MAX'), { off: !!job || max < 2, cls: 'buy' });
        h += btn('rename:' + r.id, 'RENAME', { cls: 'chip' }) + '</div></div>';
      }
      h += '</div>';
    }
    return h;
  }
  function cheesePanel(s, ui) {
    const C = CM.cheesery;
    if (ui.cheeseView === 'book') return cheeseBook(s, ui);
    const zones = q.openZones(s);
    const sel = zones.some((z) => z.id === ui.cheeseLine) ? ui.cheeseLine : '';
    let h = '<div class="tabs">' + btn('noop', 'PRODUCTION', { cls: 'on' }) + btn('cview:book', 'RECIPE BOOK ' + s.recipes.length + '/' + C.totalCombos(), {}) + '</div>';
    for (const def of zones) h += cheeseLine(s, ui, def, def.id === sel);
    if (!q.isAutomated(s, 'cheesemaking')) h += '<p class="hint">Each cheese is cooked on its own line, all at once. A mouse on Cheesemaking keeps its line going on its own.</p>';
    return h + btn('open:lab', '<b>CHEESE LAB</b><span>new recipes are discovered there</span><em>OPEN</em>', { cls: 'labrow' });
  }

  // ---------- DESPENSA ----------
  // Todo lo que tienes, una fila por cosa, como un banco. No hay tope.
  function stockPanel(s) {
    const cell = (icon, name, amount, sub) => '<div class="stockrow' + (amount ? '' : ' empty') + '">' + icon + '<div class="info"><b>' + name + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><span class="qty">' + CM.fmt(amount) + '</span></div>';
    const bases = CM.cheesery.unlockedBases(s);
    let h = '<p class="hint">Everything you own. There is no limit: it just piles up until the next stage uses it.</p>';
    h += '<h3>RAW CHEESE · from the drills, used by the Refinery</h3>';
    for (const b of bases) h += cell(I.img('raw', b, 'big'), 'Raw ' + B.bases[b].name, s.inv.raw[b]);
    h += '<h3>CHEESE BASE · from the Refinery, used by the Cheesery</h3>';
    for (const b of bases) h += cell(I.img('base', b, 'big'), B.bases[b].name + ' Base', s.inv.base[b]);
    h += '<h3>CHEESE · from the Cheesery, sold in the Shop</h3>';
    const stocked = s.recipes.slice().sort((a, b) => CM.shop.price(s, b) - CM.shop.price(s, a));
    if (!stocked.length) h += '<p class="hint">No recipes yet.</p>';
    let worth = 0;
    for (const r of stocked) {
      const n = s.lots[r.id] || 0;
      const price = CM.shop.price(s, r);
      worth += n * price;
      h += cell(I.img('lot', CM.cheesery.parseKey(r.key).base, 'big'), esc(r.name), n, 'sells for ' + CM.fmt(price) + ' each');
    }
    if (worth) h += '<p class="hint">Your cheese is worth ' + CM.fmt(worth) + ' coins in total.</p>';
    return h;
  }

  // ---------- RATONES ----------
  const M = B.mice;
  const T = M.traits;
  const RARITY = M.rarities;
  const ROMAN = ['', 'I', 'II', 'III'];
  const KIND_CLS = { good: 'tgood', quirk: 'tquirk', job: 'tjob', legend: 'tlegend' };
  // Cada tipo, un color y una marca: verde bueno, rojo manía, azul oficio, dorado legendario.
  const KIND_MARK = { good: '&#9650; ', quirk: '&#9660; ', job: '', legend: '&#9733; ' };
  const traitChip = (id, grade) => '<span class="stat ' + KIND_CLS[T[id].kind] + '">' + KIND_MARK[T[id].kind] + T[id].name + (grade && T[id].job ? ' ' + ROMAN[grade] : '') + '</span>';
  // Descripción de un rasgo: lo malo en rojo. En los mixtos («..., but ...») se marca la parte contraria.
  // Efecto de un rasgo de oficio en cada grado, con cifras: «+10% / +20% / +35% speed».
  const EFF_WORD = { speed: 'speed', yield: 'output', double: 'chance of double', awaySpeed: 'speed while away', depthSpeed: 'speed per depth level', depthYield: 'output per depth level', recipeYield: 'output per recipe known', auraNext: 'speed for the next mouse', labCost: 'Cheese Base per research', labLuck: 'chance of a breakthrough', labFail: 'inconclusive results', labBonus: 'chance of a second recipe' };
  function gradeNumbers(id, grade) {
    const def = T[id];
    return Object.keys(def.eff)
      .map((k) => M.gradeMult.map((g, i) => (i + 1 === grade ? '<b>' : '') + (def.eff[k] < 0 ? '' : '+') + round1(def.eff[k] * g * 100) + '%' + (i + 1 === grade ? '</b>' : '')).join(' / ') + ' ' + (EFF_WORD[k] || k))
      .join(', ');
  }
  function traitDesc(id, grade) {
    const def = T[id];
    if (def.job) return def.desc + ': ' + gradeNumbers(id, grade || 0) + (grade ? '' : ' (grade I / II / III)');
    const parts = def.desc.split(', but ');
    if (def.kind === 'quirk') return '<span class="tbad">' + parts[0] + '</span>' + (parts[1] ? ', but <span class="tok">' + parts[1] + '</span>' : '');
    return parts[0] + (parts[1] ? ', but <span class="tbad">' + parts[1] + '</span>' : '');
  }
  const rareChip = (m) => (m.rarity ? '<span class="stat rare' + m.rarity + '">' + RARITY[m.rarity].name.toUpperCase() + '</span>' : '');
  const affChips = (m) =>
    CM.mice.JOBS.filter((k) => m.aff && m.aff[k])
      .sort((a, b) => m.aff[b] - m.aff[a])
      .map((k) => '<span class="stat aff a' + m.aff[k] + '">' + M.affinity[m.aff[k]].name + ' ' + B.skills[k].name + '</span>')
      .join('');
  const chipsOf = (m) => rareChip(m) + CM.mice.traitsOf(m).map((t) => traitChip(t.id, t.grade)).join('') + affChips(m);
  // Retrato sin marco: el brillo dorado de un legendario va en el propio ratón.
  const face = (m, cls) => '<img class="pix ' + (cls || 'face') + (CM.mice.isLegend(m) ? ' glow' : '') + '" alt="" src="' + CM.mouseUrl(m) + '">';
  // Lo que cambia a la vista con cada rango.
  const RANK_LOOK = ['no scarf', 'a blue scarf', 'a red scarf and a medal', 'a suit, a gold tie and a purple scarf'];
  const signed = (n) => (n < 0 ? '-' : '+') + Math.round(Math.abs(n) * 100) + '%';
  const times = (n) => 'x' + (Math.round(n * 100) / 100).toFixed(2);
  const plural = (n, word) => n + ' ' + (n === 1 ? word : word === 'mouse' ? 'mice' : word + 's');
  const whole = (n) => CM.fmt(Math.floor(n));

  // Lo que hace un ratón en un puesto, en valores reales («2 Raw every 2.1s»).
  // Las cantidades son la media, contando la suerte de sacar doble.
  function mouseRate(s, m, skill, zone) {
    const K = CM.mice;
    const sp = K.speed(m, skill, s, zone);
    const y = K.yieldMult(m, skill, s, zone) * (1 + K.doubleChance(m, skill));
    // Con el ciclo en su mínimo, la velocidad de más sale como cantidad.
    const rate = (ms, amount, unit, one) => {
      const c = CM.cycle(ms / sp);
      const n = amount * c.mult;
      return (one && Math.abs(n - 1) < 0.005 ? one : (n >= 100 ? CM.fmt(Math.round(n)) : round1(n)) + ' ' + unit) + ' every ' + secs(c.total);
    };
    if (skill === 'mining') return (y === 1 ? 'a swing' : 'a x' + round1(y) + ' swing') + ' every ' + secs(q.minerInterval(s) / sp);
    if (skill === 'drilling') return rate(q.drillDuration(s), q.drillYield(s, zone) * y, 'Raw');
    if (skill === 'refining') return rate(q.refineDuration(s), q.refineBatch(s) * q.refineMult(s) * y, 'Base');
    if (skill === 'research') return 'a recipe every ' + secs(CM.cheesery.labTime(s) / sp);
    if (skill === 'trading') return rate(q.sellDuration(s), q.sellCount(s), 'cheese sold');
    const recipe = CM.cheesery.laneRecipe(s, zone);
    return recipe ? rate(CM.cheesery.jobTime(s, CM.cheesery.parseKey(recipe.key), recipe), y * q.cheeseBatch(s) * q.skillMult(s, 'cheesemaking'), 'cheese', 'a cheese') : 'cooks ' + times(sp) + ' as fast as by hand';
  }
  // Lista de todo lo que hace especial a un ratón, explicado.
  function traitList(m) {
    const K = CM.mice;
    let h = '<ul class="traits">';
    if (m.rarity) h += '<li>' + rareChip(m) + Math.round(RARITY[m.rarity].bonus * 100) + '% faster at any job</li>';
    for (const t of K.traitsOf(m)) {
      const def = T[t.id];
      h += '<li>' + traitChip(t.id, t.grade) + traitDesc(t.id, t.grade) + (def.job ? '. Only counts at ' + B.skills[def.job].name : '') + '</li>';
    }
    for (const c of K.combosOf(m)) h += '<li><span class="stat tcombo">COMBO · ' + c.name + '</span>' + c.desc + '</li>';
    // Afinidades, en una sola línea: corazones junto a cada oficio que le gusta.
    const likes = K.JOBS.filter((k) => m.aff && m.aff[k]).sort((a, b) => m.aff[b] - m.aff[a]);
    if (likes.length) h += '<li class="likes">' + likes.map((k) => B.skills[k].name + hearts(m.aff[k])).join(' &nbsp; ') + '</li>';
    return h + '</ul>';
  }

  // Elección de rasgo pendiente: las opciones, la casilla misteriosa y volver a tirar.
  function pickBox(s, m) {
    const K = CM.mice;
    const offer = m.offer;
    if (!offer) return '';
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const now = skill ? mouseRate(s, m, skill, zone) : '';
    const withTrait = (id) => (offer.kind === 'job' ? Object.assign({}, m, { spec: Object.assign({}, m.spec, { [offer.skill]: id }) }) : Object.assign({}, m, { learned: m.learned.concat(id) }));
    let h = '<div class="pickbox"><b>' + (offer.kind === 'job' ? B.skills[offer.skill].name.toUpperCase() + ' SPECIALITY: PICK ONE' : 'NEW TRAIT: PICK ONE') + '</b><small>' + (offer.kind === 'job' ? 'Earned by working. It only counts at ' + B.skills[offer.skill].name + ' and grows with more work there.' : 'Trait ' + (m.picks + 1) + ' of ' + M.traitSlots + '. It keeps it for good.') + (now ? ' Now: ' + now + '.' : '') + '</small>';
    offer.options.forEach((id, i) => {
      const then = skill ? mouseRate(s, withTrait(id), skill, zone) : '';
      h += btn('trait:' + m.id + ':' + i, '<span>' + traitChip(id) + (T[id].kind === 'legend' ? '<span class="legtag">LEGENDARY</span>' : '') + '<small>' + traitDesc(id) + '</small>' + (then && then !== now ? '<em>Here: ' + then + '</em>' : skill && T[id].job && T[id].job !== skill ? '<em>No change on this post</em>' : '') + '</span>', { cls: 'opt ' + KIND_CLS[T[id].kind] });
    });
    if (offer.kind === 'level') h += btn('trait:' + m.id + ':mystery', '<i class="qmark">?</i><span><span class="stat tmyst">MYSTERY TRAIT</span><small>Any trait in the game. It could be a <span class="tleg">legendary</span>... <span class="tbad">or a quirk</span>.</small></span>', { cls: 'opt tmyst' });
    const cost = K.rerollCost(m);
    return h + btn('reroll:' + m.id, '<span>REROLL THESE THREE</span>' + coin(cost) + '<small>next reroll: ' + CM.fmt(cost * M.rerollGrowth) + '</small>', { off: s.coins < cost, cls: 'rerollbtn', cost }) + '</div>';
  }
  // Qué le falta a un ratón para ascender: siempre lo dice.
  function promoteBlock(s, m) {
    const K = CM.mice;
    const pr = K.promoteInfo(s, m);
    if (pr.maxed) return '<div class="mrank top"><b>TOP RANK</b><small>' + (K.level(m) >= M.maxLevel ? 'Max level too.' : 'It still gets faster with every level, up to LV ' + M.maxLevel + '.') + '</small></div>';
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const next = Object.assign({}, m, { rank: m.rank + 1 });
    // Qué mejora: antes y después en valores reales, y cómo cambia su aspecto.
    const gain =
      '<div class="gain">' + face(m, 'face mini') + '<span class="arrow">&gt;</span>' + face(next, 'face mini') + '<ul>' +
      (skill ? '<li>Now: ' + mouseRate(s, m, skill, zone) + '</li><li class="up">' + pr.next.name + ': ' + mouseRate(s, next, skill, zone) + '</li>' : '<li class="up">Works ' + times(1 + pr.next.bonus) + ' as fast, for good</li>') +
      (pr.next.manager ? '<li class="up">Buys upgrades of its job on its own</li>' : '') +
      '<li>New look: ' + RANK_LOOK[m.rank + 1] + '</li></ul></div>';
    if (pr.why === 'level') {
      const stuck = !m.post ? ' It only levels up while it works on a post.' : '';
      return '<div class="mrank wait"><div><b>' + pr.next.name.toUpperCase() + ' AT LV ' + pr.next.level + '</b><small>' + plural(pr.levelsLeft, 'level') + ' to go, then ' + CM.fmt(pr.cost) + ' coins.' + stuck + '</small></div></div>';
    }
    return '<div class="mrank ' + (pr.can ? 'go' : 'wait') + '"><div><b>' + (pr.can ? 'READY FOR ' : 'SAVE UP FOR ') + pr.next.name.toUpperCase() + '</b><small>' + (pr.can ? 'A promotion makes it faster for good.' : 'Level is enough. You need ' + CM.fmt(pr.cost - s.coins) + ' more coins.') + '</small>' + gain + '</div>' + btn('promote:' + m.id, 'PROMOTE<br>' + coin(pr.cost), { off: !pr.can, cls: 'buy', cost: pr.cost }) + '</div>';
  }
  CM.mouseRate = mouseRate;
  CM.traitDesc = traitDesc;

  // ---------- Gestión de la colonia ----------
  // Dos vistas: por roca (los puestos, en rejilla) y la lista completa de ratones.
  // Todo se hace desde aquí: tocar un puesto enseña quién podría ocuparlo, tocar un
  // ratón enseña a qué puestos puede ir. Un toque más y queda asignado.
  const POST_NAME = { mining: 'MINE', drilling: 'DRILL', refining: 'REFINE', cheesemaking: 'CHEESE', trading: 'SELL' };
  const hearts = (a) => (a ? '<i class="hrt">' + (a === 2 ? '&#9829;&#9829;' : '&#9829;') + '</i>' : '');
  const todo = (s, m) => (m.offer ? '<small class="todo">NEW TRAIT</small>' : CM.mice.promoteInfo(s, m).can ? '<small class="todo up">PROMOTE</small>' : '');
  // Lo que rinde un ratón por sí solo en un oficio (lo que mira BEST FIT): sin vecinos ni combinaciones.
  const power = (m, skill) => times(CM.mice.score(m, skill));
  // Rasgos de un vistazo: los dos de nacimiento y cuántos más lleva.
  function brief(m) {
    const all = CM.mice.traitsOf(m);
    return all.slice(0, 2).map((t) => traitChip(t.id, t.grade)).join('') + (all.length > 2 ? '<span class="more">+' + (all.length - 2) + '</span>' : '');
  }
  const comboNote = (c, what) => '<p class="cnote"><b>' + c.name + '</b>' + (what ? ' · ' + what : '') + ': ' + c.desc.charAt(0).toLowerCase() + c.desc.slice(1) + '</p>';

  // Un puesto en la rejilla: quién está y cuánto rinde ahí.
  function postCell(s, ui, skill, zone) {
    const K = CM.mice;
    const key = K.postKey(skill, zone);
    const m = K.at(s, skill, zone);
    const on = ui.pick && ui.pick.type === 'post' && ui.pick.key === key;
    const cls = 'pcell' + (m ? '' : ' none') + (on ? ' sel' : '') + (m && m.offer ? ' has' : m && K.promoteInfo(s, m).can ? ' has up' : '');
    const body = m ? face(m) + '<b>' + esc(m.name) + '</b><em>' + power(m, skill) + hearts(m.aff[skill]) + '</em>' : '<span class="hole">+</span><em class="warn">empty</em>';
    return '<button data-act="pickpost:' + key + '" class="' + cls + '">' + body + '</button>';
  }
  // Fila compacta de un ratón: retrato, nombre y nivel, dónde está, rasgos y un dato a la derecha.
  function mouseRow(s, m, act, right, sub, cls) {
    const K = CM.mice;
    const where = m.post ? K.postLabel(m.post) : m.rest ? 'resting' : 'no post';
    return (
      '<button data-act="' + act + '" class="mrow' + (m.post ? '' : ' free') + (cls ? ' ' + cls : '') + '">' + face(m) +
      '<span class="mmain"><b>' + esc(m.name) + ' <i>LV ' + K.level(m) + '</i></b><small>' + (sub || where) + '</small><span class="mtraits">' + brief(m) + '</span></span>' +
      '<span class="mright">' + right + '</span></button>'
    );
  }

  function rocksView(s, ui) {
    const K = CM.mice;
    const cols = K.CHAIN.slice(0, 4);
    let h = '<div class="colony"><div class="crow head"><span></span>' + cols.map((k) => '<span>' + POST_NAME[k] + '</span>').join('') + '</div>';
    for (const z of q.openZones(s)) {
      const found = {};
      const mark = (l, a, b) => {
        const f = found[l.id] || (found[l.id] = { link: l, jobs: [] });
        for (const k of [a, b]) if (f.jobs.indexOf(k) < 0) f.jobs.push(k);
      };
      h += '<div class="crow"><span class="rock">' + I.img('raw', z.base) + '<small>' + B.bases[z.base].name + '</small></span>';
      cols.forEach((k, i) => {
        const built = k === 'mining' || s.built[B.skills[k].station];
        h += built ? postCell(s, ui, k, z.id) : '<span></span>';
        if (i && built) K.linksAt(s, cols[i - 1], z.id, k, z.id).forEach((l) => mark(l, cols[i - 1], k));
      });
      if (s.built.shop) K.linksAt(s, 'cheesemaking', z.id, 'trading', 'all').forEach((l) => mark(l, 'cheesemaking', 'trading'));
      let notes = '';
      for (const id of Object.keys(found)) {
        const f = found[id];
        const names = f.jobs.map((k) => (k === 'trading' ? 'Shop' : B.skills[k].name));
        notes += comboNote(f.jobs.length > 2 ? Object.assign({}, f.link, { desc: f.link.desc.replace(/^Both /, 'All ' + f.jobs.length + ' ').replace(/: both /, ': all ' + f.jobs.length + ' ') }) : f.link, names.join(' + '));
      }
      K.setsAt(s, z.id).forEach((d) => (notes += comboNote(d, 'whole rock')));
      h += '</div>' + notes;
    }
    if (s.built.shop) h += '<div class="crow"><span class="rock">' + I.img('coin') + '<small>Shop</small></span>' + postCell(s, ui, 'trading', 'all') + '</div>';
    return h + '</div>';
  }

  // Tras tocar un puesto: quién está y quién podría ocuparlo, del que mejor rinde ahí al que peor.
  function postSheet(s, ui, key) {
    const K = CM.mice;
    const [skill, zone] = key.split(':');
    const now = K.at(s, skill, zone);
    let h = '<div class="sheetbox"><div class="shead"><b>' + K.postLabel(key).toUpperCase() + '</b>' + btn('unpick', 'CLOSE', { cls: 'close' }) + '</div>';
    h += now ? mouseRow(s, now, 'card:' + now.id, power(now, skill) + hearts(now.aff[skill]), 'works here · ' + mouseRate(s, now, skill, zone), 'cur') : '<p class="hint">Nobody works here: you do it by hand.</p>';
    const others = s.mice.filter((m) => m !== now).sort((a, b) => K.score(b, skill) - K.score(a, skill));
    if (others.length) h += '<p class="hint">Tap a mouse to put it here' + (now ? ' (it swaps places with ' + esc(now.name) + ')' : '') + '. Best on its own first.</p>';
    for (const m of others) {
      const sp = m.spec[skill] ? ' · ' + T[m.spec[skill]].name + ' ' + ROMAN[K.gradeOf(m, skill)] : '';
      h += mouseRow(s, m, 'post:' + m.id + ':' + key, power(m, skill) + hearts(m.aff[skill]), (m.post ? 'now at ' + K.postLabel(m.post) : 'free') + sp);
    }
    if (now) h += btn('post:' + now.id + ':', 'SEND ' + esc(now.name).toUpperCase() + ' TO REST', { cls: 'close wide' });
    return h + '</div>';
  }
  // Tras tocar un ratón: a qué puestos puede ir, del que mejor le va al que peor.
  function mouseSheet(s, ui, m) {
    const K = CM.mice;
    let h = '<div class="sheetbox"><div class="shead"><b>' + esc(m.name).toUpperCase() + ' · LV ' + K.level(m) + '</b>' + btn('card:' + m.id, 'FULL CARD', { cls: 'buy' }) + btn('unpick', 'CLOSE', { cls: 'close' }) + '</div>';
    h += '<div class="mtraits wide">' + chipsOf(m) + '</div><p class="hint">Tap a post to send it there. Best for it first.</p>';
    const posts = K.posts(s).slice().sort((a, b) => K.score(m, b.skill) - K.score(m, a.skill));
    for (const p of posts) {
      const other = K.at(s, p.skill, p.zone);
      const here = other === m;
      const sp = m.spec[p.skill] ? ' · ' + T[m.spec[p.skill]].name + ' ' + ROMAN[K.gradeOf(m, p.skill)] : '';
      h += btn(here ? 'noop' : 'post:' + m.id + ':' + p.key, '<span>' + K.postLabel(p.key) + hearts(m.aff[p.skill]) + '<small>' + (here ? 'it works here now' : other ? 'swaps with ' + esc(other.name) + ' (' + power(other, p.skill) + ')' : 'free post') + sp + '</small></span><span>' + power(m, p.skill) + '</span>', { cls: 'deliver' + (here ? ' open' : ''), off: here });
    }
    if (m.post) h += btn('post:' + m.id + ':', 'SEND TO REST', { cls: 'close wide' });
    return h + '</div>';
  }
  // La lista completa: todos los ratones, ordenables, con lo que rinden donde están.
  function rosterView(s, ui) {
    const K = CM.mice;
    const sort = ui.miceSort || 'post';
    const posts = K.posts(s);
    const where = (m) => (m.post ? posts.findIndex((p) => p.key === m.post) : -1);
    const here = (m) => (m.post ? K.score(m, m.post.split(':')[0]) : 0);
    const by = { post: (a, b) => where(a) - where(b), level: (a, b) => K.level(b) - K.level(a), power: (a, b) => here(b) - here(a) }[sort];
    let h = '<div class="tabs sorts">' + [['post', 'BY POST'], ['level', 'BY LEVEL'], ['power', 'BY OUTPUT']].map((o) => btn('micesort:' + o[0], o[1], { cls: 'chip' + (sort === o[0] ? ' on' : '') })).join('') + '</div>';
    for (const m of s.mice.slice().sort(by)) {
      const skill = m.post ? m.post.split(':')[0] : '';
      h += mouseRow(s, m, 'pickmouse:' + m.id, (skill ? power(m, skill) + hearts(m.aff[skill]) : '<i class="warn">FREE</i>') + todo(s, m), '', ui.pick && ui.pick.type === 'mouse' && ui.pick.id === m.id ? 'cur' : '');
    }
    return h;
  }

  // La ficha de un ratón: retrato, y cada rasgo en una línea con lo que hace.
  function cardView(s, ui, m) {
    const K = CM.mice;
    const p = K.xpProgress(m);
    const [skill, zone] = m.post ? m.post.split(':') : [];
    let h = btn('back', '&lt; BACK', { cls: 'mini' });
    h +=
      '<div class="mcard">' + face(m, 'face huge') + '<div class="info"><b class="mname">' + esc(m.name) + '</b>' +
      '<p class="msub">' + (m.rarity ? RARITY[m.rarity].name + ' · ' : '') + M.ranks[m.rank].name + ' · LV ' + p.level + '</p>' + xpBar(p) +
      '<p class="mjob">' + (skill ? '<b>' + K.postLabel(m.post) + '</b><br>' + mouseRate(s, m, skill, zone) : m.rest ? '<b>Resting in the house</b>' : '<b>Waiting in the house</b><br>every post is taken') + '</p></div></div>';
    h += pickBox(s, m);

    h += '<h4>TRAITS</h4><ul class="trows">';
    for (const id of m.traits.concat(m.learned)) if (T[id]) h += '<li>' + traitChip(id) + '<span>' + traitDesc(id) + '</span></li>';
    for (const c of K.combosOf(m)) h += '<li><span class="stat tcombo">' + c.name + '</span><span>Combo: ' + c.desc.charAt(0).toLowerCase() + c.desc.slice(1) + '</span></li>';
    h += '</ul>';
    const nextAt = (m.picks + 1) * M.traitEvery;
    if (!m.offer || m.offer.kind !== 'level') h += '<p class="hint">' + (m.picks >= M.traitSlots ? 'It has learned all its level traits.' : 'Next trait at LV ' + nextAt + (m.post ? '.' : '. It only levels up on a post.')) + '</p>';

    h += '<h4>JOBS</h4><div class="jrows">';
    for (const k of K.JOBS) {
      const id = m.spec[k];
      const grade = K.gradeOf(m, k);
      const n = m.jobs[k] || 0;
      const next = M.jobGrades[id ? grade : 0];
      const what = id ? traitChip(id, grade) + '<small>' + traitDesc(id, grade) + (next ? '<br>' + whole(n) + '/' + CM.fmt(next) + ' jobs to grade ' + ROMAN[grade + 1] : '') + '</small>' : '<small>' + (n >= M.jobGrades[0] ? 'speciality ready to pick' : whole(n) + '/' + M.jobGrades[0] + ' jobs to a speciality') + '</small>';
      h += '<div class="' + (k === skill ? 'here' : '') + '"><b>' + B.skills[k].name + hearts(m.aff[k]) + '</b><span>' + what + '</span></div>';
    }
    h += '</div><p class="hint">&#9829; likes the job, &#9829;&#9829; loves it: a bit faster there, and it specialises sooner.</p>';

    if (skill) {
      const t = K.team(s, skill, zone);
      t.links.forEach((l) => (h += comboNote(l, 'with a neighbour')));
      t.sets.forEach((d) => (h += comboNote(d, 'whole rock')));
    }
    h += '<h4>RANK</h4>' + promoteBlock(s, m);
    h += '<div class="tabs">' + btn('pickmouse:' + m.id, 'MOVE', { cls: 'buy' }) + btn('dismiss:' + m.id, 'DISMISS', { cls: 'close' }) + '</div>';
    return h;
  }

  function micePanel(s, ui) {
    const K = CM.mice;
    if (!s.built.house) {
      const info = CM.construction.buildInfo(s, 'house');
      if (!info.condOk) return '<p class="hint">Mice do the work for you. First: ' + esc(info.condText.toLowerCase()) + '.</p>';
      return (
        '<p class="lead">A <b>mouse on a post</b> does that job on its own, even while you are away.</p><p class="hint">Every mouse is one of a kind: its own look, traits, quirks and jobs it likes. As it works it levels up, learns new traits you choose, and specialises in its job. They stay until you dismiss them.</p>' +
        btn('build:house', 'BUILD THE MOUSE HOUSE<br>It is free', { cls: 'buy wide' })
      );
    }
    const posts = K.posts(s);
    const free = posts.filter((p) => !s.mice.some((m) => m.post === p.key));
    let h = '';
    // Candidatos pendientes: se elige uno de tres.
    if (s.candidates.length) {
      const dest = free[0];
      h += '<h3>CHOOSE ONE OF THREE</h3><p class="hint">Already paid. ' + (dest ? 'The one you pick goes straight to <b>' + K.postLabel(dest.key) + '</b>.' : 'Every post has a mouse, so the one you pick waits in the house until you move it.') + '</p>';
      h += '<div class="cands">';
      s.candidates.forEach((c, i) => {
        const as = K.normalize(Object.assign({ xp: 0, rank: 0 }, c));
        const likes = K.JOBS.filter((k) => as.aff[k]).sort((a, b) => as.aff[b] - as.aff[a]);
        h +=
          '<div class="cand">' + face(as) + '<b>' + esc(c.name) + '</b>' + (c.rarity ? '<i class="rar rar' + c.rarity + '">' + RARITY[c.rarity].name + '</i>' : '') +
          c.traits.map((id) => '<p>' + traitChip(id) + '<small>' + traitDesc(id) + '</small></p>').join('') +
          '<p class="likes">' + likes.map((k) => B.skills[k].name + hearts(as.aff[k])).join('<br>') + '</p>' +
          (dest ? '<p class="there">' + mouseRate(s, as, dest.skill, dest.zone) + '</p>' : '') + btn('choose:' + i, 'CHOOSE', { cls: 'buy' }) + '</div>';
      });
      h += '</div><p class="hint">' + (dest ? 'The line in blue is what each one would do at ' + K.postLabel(dest.key) + '. ' : '') + '&#9829; likes the job, &#9829;&#9829; loves it.</p>';
      return h;
    }

    // Álbum: lo coleccionado, por categorías.
    if (ui.miceTab === 'album') {
      h += btn('album', '&lt; BACK', { cls: 'mini' });
      h += '<p class="lead"><b>' + K.albumCount(s) + ' of ' + K.albumTotal + '</b> found. Customers pay <b>' + times(1 + q.albumBonus(s)) + '</b>.</p><p class="hint">Every new fur, hat, accessory, trait and combo on your mice goes in here for good, even if that mouse leaves. Each one raises all your sale prices by ' + Math.round(M.albumPrice * 100) + '%. Combos are found by trying: the right traits on one mouse, on neighbours in a line, or across a whole rock.</p>';
      for (const cat of K.ALBUM) {
        const got = cat.items.filter((it) => s.album[it.key]).length;
        h += '<h3>' + cat.title + ' · ' + got + '/' + cat.items.length + '</h3><div class="album' + (cat.kind === 'combo' ? ' one' : '') + '">';
        for (const it of cat.items) {
          const have = !!s.album[it.key];
          if (cat.kind === 'combo' && !have) continue;
          const pic = cat.kind === 'trait' || cat.kind === 'combo' ? '' : '<img class="pix face mini' + (have ? '' : ' shade') + '" alt="" src="' + CM.partUrl(it.key) + '">';
          h += '<div class="' + (have ? 'have' : 'miss') + ' rar' + it.rarity + '">' + pic + '<span>' + (have ? it.name : '???') + (have && it.desc ? '<small>' + it.desc + '</small>' : it.rarity && cat.kind !== 'trait' ? '<small>' + RARITY[it.rarity].name + ' only</small>' : '') + '</span></div>';
        }
        if (cat.kind === 'combo' && got < cat.items.length) h += '<div class="miss"><span>' + (cat.items.length - got) + ' more to discover</span></div>';
        h += '</div>';
      }
      return h;
    }

    // Ficha de un ratón.
    const shown = ui.card ? K.byId(s, ui.card) : null;
    if (shown) return cardView(s, ui, shown);

    // Lo pendiente, arriba del todo y resaltado: de uno en uno, se resuelve aquí mismo.
    const picks = s.mice.filter((x) => x.offer);
    const promos = s.mice.filter((x) => !x.offer && K.promoteInfo(s, x).can);
    if (picks.length) {
      const m = picks[0];
      h += '<div class="due"><div class="who">' + face(m) + '<div><b>' + esc(m.name) + '</b><small>' + (m.post ? K.postLabel(m.post) : 'in the house') + ' · LV ' + K.level(m) + (picks.length > 1 ? ' · 1 of ' + picks.length + ' mice with a new trait' : '') + '</small></div></div>' + pickBox(s, m) + '</div>';
    } else if (promos.length) {
      const m = promos[0];
      const pr = K.promoteInfo(s, m);
      const [skill, zone] = m.post ? m.post.split(':') : [];
      const next = Object.assign({}, m, { rank: m.rank + 1 });
      h += '<div class="due promo">' + face(m) + '<div><b>' + esc(m.name) + ' can be a ' + pr.next.name + '</b>' + (skill ? mouseRate(s, m, skill, zone) + ' &gt; <span class="tok">' + mouseRate(s, next, skill, zone) + '</span>' : 'Works faster for good') + (promos.length > 1 ? '<br>1 of ' + promos.length + ' ready' : '') + '</div>' + btn('promote:' + m.id, 'PROMOTE<br>' + coin(pr.cost), { cls: 'buy' }) + '</div>';
    }

    // Sin puesto: a la vista y asignables de un toque.
    const idle = s.mice.filter((m) => !m.post);
    if (idle.length) {
      h += '<div class="idlebox"><b>' + plural(idle.length, 'mouse') + ' WITH NO POST</b>';
      for (const m of idle) h += mouseRow(s, m, 'pickmouse:' + m.id, '<i class="warn">' + (m.rest ? 'REST' : 'FREE') + '</i>', free.length ? 'tap to give it a post' : 'every post is taken: tap to swap it in', ui.pick && ui.pick.type === 'mouse' && ui.pick.id === m.id ? 'cur' : '');
      h += '</div>';
    }

    const view = ui.miceView === 'roster' ? 'roster' : 'rocks';
    h += '<div class="tabs">' + btn('miceview:rocks', 'BY ROCK', { cls: view === 'rocks' ? 'on' : '' }) + btn('miceview:roster', 'ALL MICE · ' + s.mice.length, { cls: view === 'roster' ? 'on' : '' }) + '</div>';
    // La hoja del puesto o del ratón tocado sale justo encima de la vista, para no tener que buscarla.
    const pickedMouse = ui.pick && ui.pick.type === 'mouse' ? K.byId(s, ui.pick.id) : null;
    if (ui.pick && ui.pick.type === 'post' && posts.some((p) => p.key === ui.pick.key)) h += postSheet(s, ui, ui.pick.key);
    else if (pickedMouse) h += mouseSheet(s, ui, pickedMouse);
    else if (s.mice.length) h += '<p class="hint">' + (view === 'rocks' ? 'Tap a post to see who could work there. The number is what each mouse gives on its own.' : 'Tap a mouse to move it or open its card.') + '</p>';
    h += view === 'rocks' ? rocksView(s, ui) : rosterView(s, ui);

    const cost = K.recruitCost(s);
    h += btn('recruit', 'RECRUIT A MOUSE · ' + coin(cost) + '<br><small>' + (free.length ? plural(free.length, 'post') + ' with no mouse' : 'Every post is taken: use it to look for a better mouse') + '. Each recruit costs ' + Math.round((M.recruitGrowth - 1) * 100) + '% more than the last, for good.</small>', { off: s.coins < cost, cls: 'buy wide serveall', cost });
    if (!s.mice.length) return h + '<p class="hint">Your first recruit takes over a stage so you do not have to tap it.</p>';
    const moves = s.mice.length > 1 ? K.bestFitMoves(s) : 0;
    h += '<div class="tabs">' + btn('bestfit', 'BEST FIT' + (moves ? '' : ' &#10003;'), { cls: 'close', off: !moves }) + btn('album', 'ALBUM ' + K.albumCount(s) + '/' + K.albumTotal, { cls: 'close' }) + '</div>';
    h += '<p class="hint">Best fit places each mouse where it works best on its own. Combos between mice are yours to find.</p>';
    if (s.mice.some((m) => M.ranks[m.rank].manager)) h += row('Managers buy upgrades', 'They buy cheap upgrades of their job on their own: never more than ' + Math.round(M.managerBudget * 100) + '% of your coins at once', btn('managers', s.settings.managersBuy ? 'ON' : 'OFF', { cls: 'buy' }));
    return h;
  }

  function optionsPanel(s) {
    return (
      row('Sound', 'Effects are ' + (CM.sfx.isMuted() ? 'muted' : 'on'), btn('sound', CM.sfx.isMuted() ? 'TURN ON' : 'MUTE', { cls: 'buy' })) +
      row('Export save', 'Save + metrics as JSON', btn('export', 'EXPORT', { cls: 'buy' })) +
      row('Import save', 'Paste an exported JSON', btn('import', 'IMPORT', { cls: 'buy' })) +
      row('Playtest tools', 'Dev menu: marks the session as assisted', btn('open:dev', 'OPEN', { cls: 'buy' })) +
      row('Reset save', 'Start over from zero', btn('reset', 'RESET', { cls: 'danger' })) +
      '<p class="hint">Played ' + Math.floor(s.clock / 60000) + ' min · total level ' + q.totalLevel(s) + (s.devUsed ? ' · dev tools used' : '') + '. Data never leaves this browser.</p>'
    );
  }

  function devPanel() {
    const D = CM.dev;
    const g = (items) => '<div class="devgrid">' + items.map((i) => btn('dev:' + i[0], i[1], { cls: 'chip' + (i[2] ? ' on' : '') })).join('') + '</div>';
    return (
      '<h3>TIME</h3>' + g([['speed:1', 'x1', D.speed === 1], ['speed:2', 'x2', D.speed === 2], ['speed:10', 'x10', D.speed === 10], ['pause', D.paused ? 'RESUME' : 'PAUSE', D.paused]]) +
      '<h3>GIVE</h3>' + g([['coins:1000', '+1K coins'], ['coins:1000000', '+1M coins'], ['raw', '+10 raw'], ['base', '+10 base'], ['levels', '+5 levels'], ['reveal', 'reveal veins']]) +
      '<h3>UNLOCK</h3>' + g([['buildings', 'all buildings'], ['zones', 'all rocks'], ['hire', 'mouse on every post'], ['micexp', 'mice +10 levels'], ['power:3', 'power +3'], ['power:10', 'power +10']]) +
      '<h3>FORCE</h3>' + g([['noraw', 'no raw']]) +
      '<h3>SCENARIO</h3>' + g([['scn:chain', 'chain ready'], ['scn:fresh', 'new game']]) +
      '<h3>REPORT</h3><pre class="report" id="dev-report"></pre>' + btn('export', 'EXPORT JSON', { cls: 'buy wide' })
    );
  }

  CM.panels = {
    esc,
    secs,
    coin,
    btn,
    comboLine,
    title(name, ui, s) {
      if (name === 'lab' && s && !s.recipes.length) return 'YOUR FIRST RECIPE';
      if (name === 'lab' && s && !s.built.lab) return 'RECIPES';
      if (name === 'tree') return ui.tree === 'colony' ? 'COLONY' : ui.tree === 'lab' ? 'LAB UPGRADES' : B.skills[ui.tree].name.toUpperCase() + ' UPGRADES';
      return { cheese: 'CHEESERY', lab: 'CHEESE LAB', stock: 'PANTRY', mice: 'MICE', options: 'MENU', dev: 'PLAYTEST TOOLS' }[name];
    },
    render(name, s, ui) {
      return { tree: treePanel, cheese: cheesePanel, lab: labPanel, stock: stockPanel, mice: micePanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
