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
    'no-boost': 'No free boost: take one off another post first',
    'boost-full': 'A post takes two boosts at most',
    'level-locked': 'Your skill level is too low for that',
    'part-locked': 'You have not unlocked that ingredient yet',
    locked: 'Not unlocked yet',
    'already-built': 'Already built',
    'max-level': 'Already at max rank',
    'no-house': 'Build the Mouse House first',
    'bed-busy': 'The Mouse House bed is taken: one mouse at a time',
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
    pickMult: (s) => round1(q.pickPower(s)) + ' search per hit',
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
    ['milestone', 'MILESTONES', 'One of a kind. You buy each one yourself: BUY ALL and managers leave them alone'],
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
    // En la colonia solo hay inversiones (y las rocas): se compran una a una, sin botón de comprarlo todo.
    if (skill !== 'colony' && (skill !== 'lab' || n)) h += btn('buyAll:' + skill, n ? 'BUY EVERYTHING I CAN AFFORD HERE' : 'NOTHING AFFORDABLE YET', { off: !n, cls: 'buy wide serveall' });
    // Qué compra cada cosa: este botón, BUY ALL y los gerentes.
    if (isSkill) h += '<p class="hint">This tree only. BUY ALL on the main screen does every skill at once, always the cheapest upgrade first.' + (s.mice.some((m) => M.ranks[m.rank].manager) ? ' Your managers already buy, on their own, upgrades of their job that cost under ' + Math.round(M.managerBudget * 100) + '% of your coins.' : '') + '</p>';
    if (skill === 'cheesemaking') h += quotaBlock(s);
    for (const br of skill === 'lab' ? LAB_BRANCHES : BRANCHES) {
      const nodes = B.trees[skill].filter((x) => x.branch === br[0] && !(x.parked && !CM.tree.rank(s, skill, x.id)));
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
        h += row((node.key ? '<i class="kv-tag">INVESTMENT</i>' : '') + title, sub, right, (info.locked ? 'locked' : '') + (node.key ? ' kv-row' : ''));
      }
    }
    return h;
  }

  // Cuánto falta para algo, en palabras.
  const span = (ms) => {
    const mins = Math.max(1, Math.round(ms / 60000));
    return mins < 60 ? mins + ' min' : Math.floor(mins / 60) + ' h ' + (mins % 60 ? (mins % 60) + ' min' : '');
  };
  const GRADES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const roman = (n) => GRADES[n] || String(n);
  // El objetivo de producción que abre el siguiente hito: cifra fija, barra y tiempo estimado.
  function quotaBlock(s) {
    const g = CM.milestones.goal(s);
    if (!g) return '';
    return '<div class="ms-goal"><div><b>NEXT MILESTONE</b><span>' + CM.fmt(g.cur) + ' / ' + CM.fmt(g.need) + ' cheese cooked</span></div><div class="bar"><i style="width:' + Math.round((g.cur / g.need) * 100) + '%"></i></div><small>' + (g.etaMs ? 'About ' + span(g.etaMs) + ' at your pace. ' : '') + 'The goal is set and does not move. Everything you cook counts, also while you are away.</small></div>';
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
    const pool = s.recipes.filter((r) => B.cheesery.strainBases.indexOf(C.parseKey(r.key).base) >= 0).sort((a, b) => C.potential(s, b) - C.potential(s, a));
    if (!pool.length) return h + '<p class="hint">You know no Cheddar recipe yet.</p>';
    const lane = C.laneRecipe(s, q.zoneOfBase(B.cheesery.strainBases[0]));
    const shown = pool.filter((r, i) => r === lane || (r.strains || []).length || i < 3 || r.id === ui.strainRecipe);
    shown.sort((a, b) => (b === lane) - (a === lane));
    const r = shown.find((x) => x.id === ui.strainRecipe) || (fr && shown.indexOf(fr) >= 0 ? fr : shown[0]);
    const want = r.next !== undefined ? r.next : r.strain || '';
    const combo = C.parseKey(r.key);
    if (shown.length > 1) h += '<div class="strainpick">' + shown.map((x) => btn('strainrecipe:' + x.id, esc(x.name) + (x === lane ? ' · cooking' : ''), { cls: 'chip' + (x === r ? ' on' : '') })).join('') + '</div>';
    h += '<div class="strainhero" data-strain="' + (want || 'plain') + '"><i class="straindish">' + I.img('lot', combo.base, 'big') + '</i><div><small>SPECIMEN</small><b>' + esc(r.name) + '</b><span>' + (r === lane ? 'Your ' + B.bases[combo.base].name + ' line cooks this one' : 'Not being cooked now') + '</span></div><em>' + strainIcon(want) + STRAIN_NAME(want).toUpperCase() + (r.next !== undefined ? '<small>next batch</small>' : '') + '</em></div>';
    // Una cepa equipada en una receta que la línea no cocina no hace nada: se dice, y se
    // ofrece fijar esa receta. Nunca se cambia sola.
    const cook = CM.mice.at(s, 'cheesemaking', q.zoneOfBase(combo.base));
    if (want && lane && r !== lane && cook) h += '<div class="strainidle"><span><b>' + STRAIN_NAME(want) + ' is equipped, but it is doing nothing yet.</b> ' + esc(cook.name) + ' is cooking ' + esc(lane.name) + '.</span>' + btn('cook:' + r.id, 'COOK THIS ONE', { cls: 'buy' }) + '</div>';
    h += '<div class="straingrid">';
    const plain = strainStats(s, r, '');
    for (const id of [''].concat(Object.keys(B.strains))) {
      const found = !id || r.strains.indexOf(id) >= 0;
      if (!found) continue;
      const lines = id ? strainLines(s, r, id).map((l) => '<li class="' + (l[1] === 'up' ? 'tok' : 'tbad') + '">' + (l[1] === 'up' ? I.px('tup') + ' ' : I.px('tdown') + ' ') + l[0] + '</li>').join('') : '<li>Cooks in ' + secs(plain.time) + '</li><li>Uses ' + plain.base + ' Cheese Base</li><li>Sells for ' + CM.fmt(plain.price) + '</li>';
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
      const why = !mouse ? 'You choose what to make here.' : pinned ? 'Pinned by you: ' + esc(mouse.name) + ' always cooks this one.' : esc(mouse.name) + ' cooks the ' + name + ' recipe that pays best once mastered.';
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
    const list = s.recipes.filter((r) => C.parseKey(r.key).base === base).sort((a, b) => C.potential(s, b) - C.potential(s, a));
    h += '<p class="hint">' + (!list.length ? 'You know no ' + B.bases[base].name + ' recipe yet. Discover one in LAB.' : mouse ? esc(mouse.name) + ' cooks on its own the ' + B.bases[base].name + ' recipe that pays best once mastered (BEST), even if another sells for more today. Tap a recipe to pin another.' : 'Nobody cooks ' + B.bases[base].name + ': tap a recipe to make it by hand.') + '</p>';
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
    if (CM.milestones.has(s, 'board')) h += boardCard(s);
    for (const def of zones) h += cheeseLine(s, ui, def, def.id === sel);
    if (!q.isAutomated(s, 'cheesemaking')) h += '<p class="hint">Each cheese is cooked on its own line, all at once. A mouse on Cheesemaking keeps its line going on its own.</p>';
    return h + btn('open:lab', '<b>CHEESE LAB</b><span>new recipes are discovered there</span><em>OPEN</em>', { cls: 'labrow' });
  }

  // Cheese Board: qué se vende de cada tipo y lo que eso sube todas las ventas.
  // Las clases de esta tarjeta empiezan por `cb-`.
  const FAMILY = { ingredient: ['INGREDIENTS', B.ingredients], treatment: ['TREATMENTS', B.treatments], maturation: ['MATURATIONS', B.maturations] };
  function boardCard(s) {
    const fams = CM.milestones.boardFamilies(s);
    let h = '<div class="cb-card"><div class="cb-head"><b>CHEESE BOARD</b><em>x' + s.board.mult.toFixed(2) + ' on every sale</em></div><small>Customers pay more when your recent sales are a real mix. A type that barely sells barely counts: each rock keeps the recipe you fix for it in the RECIPE BOOK.</small>';
    for (const id of Object.keys(FAMILY)) {
      const f = fams[id];
      const parts = f.shares.filter((x) => x.share >= 0.005).sort((a, b) => b.share - a.share);
      h += '<div class="cb-fam"><div><span>' + FAMILY[id][0] + '</span><small>' + (parts.length ? parts.map((x) => FAMILY[id][1][x.id].name + ' ' + Math.round(x.share * 100) + '%').join(' · ') : 'No sales yet') + '</small><u>+' + Math.round((f.eff - 1) * B.milestones.board.per * 100) + '%</u></div><i class="cb-bar">' + parts.map((x, i) => '<i class="c' + i + '" style="width:' + (x.share * 100).toFixed(1) + '%"></i>').join('') + '</i></div>';
    }
    return h + '</div>';
  }
  // El título de Grand Master en la ficha de un ratón.
  function masterBlock(s, m) {
    if (!CM.milestones.has(s, 'master')) return '';
    const MS = CM.milestones;
    const jobs = Math.floor((m.jobs && m.jobs.cheesemaking) || 0);
    const grade = MS.masterGrade(m);
    const pct = (g) => '+' + Math.round(g * B.milestones.master.per * 100) + '%';
    const next = 'Next grade at ' + CM.fmt(MS.masterNext(grade)) + ' batches cooked (now ' + CM.fmt(jobs) + ').';
    if (s.master === m.id) {
      const cooking = m.post && m.post.split(':')[0] === 'cheesemaking';
      return '<div class="gm-box on"><b>' + I.px('star') + ' GRAND MASTER' + (grade ? ' ' + roman(grade) : '') + '</b><small>' + (grade ? 'The cheese it cooks is worth ' + pct(grade) + '. ' : 'No grade yet. ') + next + '</small>' + (cooking ? '' : '<small class="gm-warn">The title only counts while it cooks: put it on a Cheesemaking post.</small>') + '</div>';
    }
    const cur = MS.master(s);
    return '<div class="gm-box"><div><b>GRAND MASTER</b><small>One mouse in the colony holds the title. ' + (grade ? 'This one would be grade ' + roman(grade) + ' (' + pct(grade) + ' on the cheese it cooks). ' : 'This one has no grade yet. ') + next + (cur ? ' ' + esc(cur.name) + ' holds it now and keeps its experience.' : '') + '</small></div>' + btn('namemaster:' + m.id, cur ? 'GIVE IT<br>THE TITLE' : 'NAME<br>GRAND MASTER', { cls: 'mini' }) + '</div>';
  }

  // ---------- REFUERZOS ----------
  // Una rejilla: una fila por roca y una columna por etapa, más la tienda. Tocar una casilla pone
  // un refuerzo libre; si no cabe o no queda ninguno libre, quita uno de ahí. Las clases
  // empiezan por `bo-`.
  const BOOST_COLS = [['mining', 'MINE', 'pick'], ['drilling', 'DRILL', 'raw'], ['refining', 'REFINE', 'base'], ['cheesemaking', 'CHEESE', 'lot']];
  // Chapa de un puesto reforzado: uno o dos galones, igual que en la barra de etapas.
  // Lo que dan n refuerzos en una casilla, sin la unidad (va en la cabecera de la columna).
  const boGain = (skill, n) => (n ? '<u>' + CM.boosts.label(skill, n).split(' ')[0] + '</u>' : '');
  // V4.4. Los dos huecos de un puesto, cada uno con su estado: gema puesta o engaste vacío.
  // Tocar uno lleno quita ESE refuerzo; tocar uno vacío pone uno de los libres en ESE hueco. Si no
  // queda ninguno, no se toca nada (nunca se quita de otro puesto). Con un solo refuerzo, el
  // hueco que ocupa es el que tocaste (`ui.boSlot`), para que volver a tocarlo haga lo esperado.
  const boOcc = (ui, key, n) => (n >= 2 ? [true, true] : n <= 0 ? [false, false] : ((ui.boSlot && ui.boSlot[key]) || 0) === 1 ? [false, true] : [true, false]);
  function boSlots(s, ui, skill, zone) {
    const key = skill + ':' + zone;
    const occ = boOcc(ui, key, CM.boosts.at(s, skill, zone));
    return '<span class="bo-slots">' + occ.map((on, i) => btn('boslot:' + skill + ':' + zone + ':' + i, I.img(on ? 'gem' : 'socket', '', 'bo-gem'), { cls: 'bo-slot' + (on ? ' on' : '') + (ui.boPop === key + ':' + i ? ' pop' : '') })).join('') + '</span>';
  }
  function boostsPanel(s, ui) {
    const BO = CM.boosts;
    const owned = BO.owned(s);
    const free = BO.free(s);
    let h = '<div class="bo-head"><div><b>' + free + '</b><small>FREE</small></div><div><b>' + s.boosts.length + '</b><small>PLACED</small></div><p>A boost gives one post <b>' + BO.label('mining', 1).toLowerCase() + '</b>, whoever works there. On a refinery it gives <b>' + BO.label('refining', 1).split(' ')[0] + ' Base</b> from the same Raw instead. Up to ' + B.boosts.perPost + ' per post.</p></div>';
    // Cuándo llega el siguiente.
    const nx = BO.next(s);
    if (nx && nx.kind === 'rock') h += '<div class="bo-next"><b>NEXT BOOST</b><span>when you open ' + (owned ? 'your next rock' : 'your third rock') + '</span></div>';
    else if (nx) h += '<div class="bo-next"><b>NEXT BOOST</b><span>' + CM.fmt(nx.cur) + ' / ' + CM.fmt(nx.need) + ' cheese cooked</span><div class="bar"><i style="width:' + Math.round((nx.cur / nx.need) * 100) + '%"></i></div><small>' + (nx.etaMs ? 'About ' + span(nx.etaMs) + ' at your pace. ' : '') + 'It counts while you are away too.</small></div>';
    if (!owned) return h + '<p class="hint">You have no boosts yet.</p>';
    h += '<p class="hint">Tap an empty slot ' + I.img('socket', '', 'bo-gemi') + ' to put a boost in it; tap a boost ' + I.img('gem', '', 'bo-gemi') + ' to take it back.</p>';
    h += '<div class="bo-grid"><span></span>' + BOOST_COLS.map((c) => '<small>' + c[1] + '<i>' + (c[0] === 'refining' ? 'BASE' : 'SPEED') + '</i></small>').join('');
    // V4.5: sin SLOW? ni +BASE? en la cuadrícula (ensuciaban más de lo que ayudaban). Su lógica
    // (CM.boosts.hint, alsoRefine, shopHint) sigue en el código para una presentación futura.
    for (const def of q.openZones(s)) {
      h += '<b>' + I.img('raw', def.base) + esc(B.bases[def.base].name) + '</b>';
      for (const c of BOOST_COLS) {
        const n = BO.at(s, c[0], def.id);
        const staffed = !!CM.mice.at(s, c[0], def.id);
        h += '<div class="bo-cell' + (n ? ' has n' + n : '') + (staffed ? '' : ' empty') + '"><span class="bo-face">' + I.img(c[2], def.base) + boGain(c[0], n) + '</span>' + boSlots(s, ui, c[0], def.id) + '</div>';
      }
    }
    h += '</div>';
    // La tienda: una sola, para todas las rocas.
    if (s.built.shop) {
      const n = BO.at(s, 'trading', 'all');
      h += '<div class="bo-shop' + (n ? ' has n' + n : '') + '">' + I.img('coin') + '<span><b>SHOP</b><small>Sells the cheese of every rock</small>' + (n ? '<u>' + BO.label('trading', n) + '</u>' : '') + '</span>' + boSlots(s, ui, 'trading', 'all') + '</div>';
    }
    h += '<p class="hint">A post with no mouse gets nothing from a boost.</p>';
    if (s.boosts.length) h += btn('boostclear', 'TAKE ALL BOOSTS BACK', { cls: 'mini' });
    return h;
  }

  // ---------- DESPENSA ----------
  // Todo lo que tienes, una fila por cosa, como un banco. No hay tope.
  // V4.1. Despensa: primero un resumen por roca (lo que hay de cada cosa); el detalle de cada
  // receta, al pedirlo.
  function stockPanel(s, ui) {
    const cell = (icon, name, amount, sub) => '<div class="stockrow' + (amount ? '' : ' empty') + '">' + icon + '<div class="info"><b>' + name + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</div><span class="qty">' + CM.fmt(amount) + '</span></div>';
    const bases = CM.cheesery.unlockedBases(s);
    const lotsOf = cheeseByBase(s);
    let h = '<p class="hint">What each rock has waiting for its next stage. Nothing has a limit except the shop shelves.</p><div class="ec-grid"><span></span><small>RAW</small><small>BASE</small><small>CHEESE</small>';
    for (const b of bases) h += '<b>' + I.img('raw', b) + B.bases[b].name + '</b><span>' + CM.fmt(s.inv.raw[b]) + '</span><span>' + CM.fmt(s.inv.base[b]) + '</span><span>' + CM.fmt(lotsOf[b] || 0) + '</span>';
    h += '</div>' + btn('stockall', ui.stockAll ? 'HIDE EVERY RECIPE' : 'SHOW EVERY RECIPE', { cls: 'mini' });
    if (!ui.stockAll) return h;
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
  const cheeseByBase = (s) => {
    const out = {};
    for (const r of s.recipes) if (s.lots[r.id]) out[CM.cheesery.parseKey(r.key).base] = (out[CM.cheesery.parseKey(r.key).base] || 0) + s.lots[r.id];
    return out;
  };
  // Ventana de medida de COINS y SHOP: lo cobrado y vendido de verdad en los últimos minutos.
  const EC_WINDOW = 180000;
  const perMin = (n) => CM.fmt(Math.round(n)) + '/min';
  const measured = (r) => (r.span < 0.2 ? '<p class="hint">Measuring: open it again in a moment for real numbers.</p>' : '<p class="ec-when">Real sales in the last ' + (r.span >= 1.5 ? Math.round(r.span) + ' min' : Math.round(r.span * 60) + ' s') + '.</p>');

  // V4.1. SHOP: qué queso hay para vender, de qué roca, cuánto cabe y qué pasa con lo que sobra.
  function shopInfoPanel(s) {
    const cap = CM.shop.capacity(s);
    const r = CM.telemetry.rates(s, EC_WINDOW);
    const stock = q.lotsTotal(s);
    const full = cap.shelf > 0 && stock >= cap.shelf * 0.97;
    const lotsOf = cheeseByBase(s);
    let h = '<div class="ec-top"><div><small>CHEESE ON THE SHELVES</small><b>' + CM.fmt(stock) + '</b></div>' + (full ? '<i class="ec-full">FULL</i>' : '') + '</div>';
    h += '<div class="ec-meter"><i style="width:' + Math.min(100, cap.shelf ? Math.round((stock / cap.shelf) * 100) : 0) + '%"></i></div><p class="ec-sub">Shelves hold about ' + B.shop.shelfMinutes + ' minutes of sales: ' + CM.fmt(cap.shelf) + ' cheese.</p>';
    h += '<div class="ec-stats"><span><small>CAN SELL</small><b>' + perMin(cap.perMin) + '</b></span><span><small>SOLD</small><b>' + perMin(r.sold - r.whole) + '</b></span><span><small>WHOLESALE</small><b class="' + (r.whole > 0.5 ? 'warn' : '') + '">' + perMin(r.whole) + '</b></span></div>';
    h += measured(r);
    h += '<h3>BY CHEESE</h3>';
    for (const z of q.openZones(s)) {
      const b = z.base;
      const n = lotsOf[b] || 0;
      const rb = r.bases[b] || { n: 0, wn: 0 };
      h += '<div class="ec-row">' + I.img('lot', b, 'big') + '<div><b>' + B.bases[b].name + '<span>' + CM.fmt(n) + ' on the shelves</span></b><i class="ec-bar"><i style="width:' + (stock ? Math.round((n / stock) * 100) : 0) + '%"></i></i><small>sells ' + perMin(rb.n) + (rb.wn > 0.5 ? ' · <u>wholesale ' + perMin(rb.wn) + '</u>' : '') + '</small></div></div>';
    }
    h += '<p class="hint">The shop sells the dearest cheese first. When the shelves are full, the wholesaler takes the extra at half price, cheapest first: nothing is lost and nothing piles up for ever. A faster trader (or a boost on the shop) sells more at full price.</p>';
    return h + btn('open:stock', 'FULL PANTRY', { cls: 'buy wide' });
  }

  // V4.1. COINS: de dónde sale el dinero. Monedas cobradas de verdad en ventas, por roca y canal.
  function coinsPanel(s) {
    const r = CM.telemetry.rates(s, EC_WINDOW);
    const rows = q.openZones(s).map((z) => ({ z, c: (r.bases[z.base] || { c: 0 }).c, w: (r.bases[z.base] || { w: 0 }).w })).map((x) => Object.assign(x, { t: x.c + x.w }));
    const fromRocks = rows.reduce((a, x) => a + x.t, 0);
    const total = Math.max(r.coins, fromRocks);
    rows.sort((a, b) => b.t - a.t);
    let h = '<div class="ec-top"><div><small>COINS PER MINUTE</small><b>' + perMin(r.coins) + '</b></div></div>' + measured(r);
    h += '<h3>BY ROCK</h3>';
    for (const x of rows) {
      const pc = total > 0 ? (x.t / total) * 100 : 0;
      h += '<div class="ec-row' + (x === rows[0] && x.t > 0 ? ' top' : '') + '">' + I.img('lot', x.z.base, 'big') + '<div><b>' + x.z.name + '<span>' + (x.t > 0 ? perMin(x.t) + ' · ' + (pc >= 10 ? Math.round(pc) : pc.toFixed(1)) + '%' : 'nothing sold') + '</span></b>' +
        '<i class="ec-bar two"><i style="width:' + (total ? (x.c / total) * 100 : 0) + '%"></i><i class="w" style="width:' + (total ? (x.w / total) * 100 : 0) + '%"></i></i>' + (x.w > 0.5 ? '<small>shelves ' + perMin(x.c) + ' · <u>wholesale ' + perMin(x.w) + '</u></small>' : '') + '</div></div>';
    }
    const other = r.coins - fromRocks;
    if (other > total * 0.01) h += '<p class="hint">Another ' + perMin(other) + ' came from elsewhere (rewards, lab samples).</p>';
    h += '<p class="hint">These are coins really paid by customers, after every bonus. A rock whose cheese does not sell earns nothing here, however much it makes. <span class="ec-key"><i></i>shelves</span> <span class="ec-key w"><i></i>wholesale, half price</span></p>';
    return h;
  }

  // ---------- RATONES ----------
  const M = B.mice;
  const T = M.traits;
  const RARITY = M.rarities;
  const ROMAN = ['', 'I', 'II', 'III'];
  const KIND_CLS = { good: 'tgood', quirk: 'tquirk', job: 'tjob', legend: 'tlegend' };
  // Cada tipo, un color y una marca: verde bueno, rojo manía, azul oficio, dorado legendario.
  // V4.3: las marcas son sprites pixel art (antes, símbolos de texto).
  const KIND_MARK = { good: I.px('tup') + ' ', quirk: I.px('tdown') + ' ', job: '', legend: I.px('star') + ' ' };
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
  const face = (m, cls) => '<img class="pix ' + (cls || 'face') + (CM.mice.isLegend(m) ? ' glow' : '') + '" alt="" src="' + CM.mouseUrl(m, null, m.id === ASLEEP) + '">';
  // Lo que cambia a la vista con cada rango.
  const RANK_LOOK = ['no scarf', 'a blue scarf', 'the hat of its trade, a red scarf and a medal', 'a suit, a gold tie, a gold-brimmed hat and a manager\'s clipboard'];
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

  // La cama de la Mouse House: quién está y cuánto le queda.
  const clock = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  function careBox(s) {
    const c = s.care;
    const m = c && CM.mice.byId(s, c.id);
    if (!m) return '';
    // V4.8: el resultado de un reentreno no se enseña hasta que acaba.
    const what = c.kind === 'quirk' ? 'Treating ' + T[c.what].name : 'Retraining ' + T[c.from || m.spec[c.what]].name + ' (random result)';
    return '<div class="carebox">' + face(m, 'face mini') + '<div><small>' + (c.kind === 'quirk' ? 'MOUSE HOUSE BED · ' : 'TRAINING ROOM · ') + clock(c.remaining) + ' left</small><b>' + esc(m.name) + ' · ' + what + '</b><div class="bar"><i style="width:' + Math.round((1 - c.remaining / c.total) * 100) + '%"></i></div><small>It keeps working meanwhile. One mouse at a time.</small></div></div>';
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

  // ---------- MICE: gestor de la colonia ----------
  // Tres pestañas: COLONY (los puestos, por roca), ROSTER (todos los ratones) y HOUSE (la
  // cama, reclutar, el diario y el álbum). Tocar un puesto abre su selector de candidatos;
  // tocar un ratón, su ficha. Los nombres de clase de esta pantalla empiezan por `mc-`.
  // V4.3: corazones de afinidad en pixel art (antes, el carácter ♥, que parecía un emoji).
  const hearts = (a) => (a ? '<i class="hrt' + (a === 2 ? ' two' : '') + '">' + I.px('heart', a === 2 ? 2 : 1) + '</i>' : '');
  const mult = (n) => 'x' + (n >= 10 ? Math.round(n) : (Math.round(n * 10) / 10).toFixed(1));
  const JOB_SHORT = { mining: 'Mine', drilling: 'Drill', refining: 'Refine', cheesemaking: 'Cheese', trading: 'Sell', research: 'Lab' };
  // Retrato con marco de rareza (gris, azul, dorado): se reconoce sin leer.
  // El Grand Master lleva una estrella en su retrato, allí donde salga.
  let GM = '';
  let ASLEEP = '';
  // V4.9: el que duerme en la cama va sin su Z de dormilón en los retratos (la cama pone las suyas).
  const portrait = (m, size) => '<i class="mc-face r' + (m.rarity || 0) + (size ? ' ' + size : '') + (m.id === GM ? ' gm' : '') + '"><img class="pix' + (CM.mice.isLegend(m) ? ' glow' : '') + '" alt="" src="' + CM.mouseUrl(m, null, m.id === ASLEEP) + '">' + (m.id === GM ? '<u class="gm-star">' + I.px('star') + '</u>' : '') + '</i>';
  const rankLv = (m) => 'LV ' + CM.mice.level(m) + ' · ' + M.ranks[m.rank].name;
  const canPromote = (s, m) => CM.mice.promoteInfo(s, m).can;
  // V4.8: «listo para ascender» se dice UNA vez por ratón: contorno verde y flecha en su tarjeta o
  // fila. La entrada (el contorno se enciende y la flecha sube 4 px) dura 0,4 s y no se repite al
  // repintar el panel: el retraso negativo la deja donde iba desde que se vio por primera vez.
  // Una vez por ratón y rango; pasado el medio segundo el texto ya no cambia y no fuerza repintados.
  const upAt = {};
  const upDelay = (m) => {
    const k = m.id + ':' + m.rank;
    const t = (performance.now() - (upAt[k] || (upAt[k] = performance.now()))) / 1000;
    return ' style="--upd:-' + (t > 0.5 ? '1' : t.toFixed(2)) + 's"';
  };
  const upArrow = (cls) => I.img('rankup', '', cls || 'mc-up');
  const quirksOf = (m) => m.traits.concat(m.learned).filter((id) => T[id] && T[id].kind === 'quirk');
  const legendsOf = (m) => CM.mice.traitsOf(m).filter((t) => T[t.id].kind === 'legend');
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  // Oficios que le gustan, de más a menos.
  const likesLine = (m, max) => {
    const list = CM.mice.JOBS.filter((k) => m.aff && m.aff[k]).sort((a, b) => m.aff[b] - m.aff[a]);
    const n = max || list.length;
    return list.slice(0, n).map((k) => '<i class="mc-like a' + m.aff[k] + '">' + JOB_SHORT[k] + hearts(m.aff[k]) + '</i>').join('') + (list.length > n ? '<span class="mc-more">+' + (list.length - n) + '</span>' : '');
  };
  // Rasgos que pesan en un oficio: legendarios, su especialidad y los que cambian lo que rinde ahí.
  const POWER_KEYS = ['speed', 'yield', 'double', 'awaySpeed', 'hereSpeed', 'depthSpeed', 'depthYield', 'levelSpeed', 'crowdSpeed', 'rankSpeed', 'recipeYield', 'labCost', 'labLuck', 'labFail', 'labBonus'];
  function keyTraits(m, skill, max) {
    const list = CM.mice.traitsOf(m).filter((t) => {
      const d = T[t.id];
      return (!d.job || d.job === skill) && (d.kind === 'legend' || POWER_KEYS.some((k) => d.eff[k]));
    });
    const order = (t) => (T[t.id].kind === 'legend' ? 0 : T[t.id].job ? 1 : T[t.id].kind === 'quirk' ? 3 : 2);
    list.sort((a, b) => order(a) - order(b));
    if (!max) return '';
    return list.slice(0, max).map((t) => traitChip(t.id, t.grade)).join('') + (list.length > max ? '<span class="mc-more">+' + (list.length - max) + '</span>' : '');
  }
  // Combinaciones de equipo activas en una roca: nombre, efecto, quién y dónde. Solo salen las
  // que ya están formadas (y por tanto descubiertas); las demás no se anuncian.
  function rockCombos(s, zoneId) {
    const K = CM.mice;
    const out = [];
    const cols = K.CHAIN.slice(0, 4);
    const add = (l, a, b) => {
      const f = out.find((x) => x.c === l) || out[out.push({ c: l, jobs: [], who: [] }) - 1];
      for (const p of [a, b]) {
        const m = K.at(s, p[0], p[1]);
        if (m && f.who.indexOf(m.name) < 0) {
          f.who.push(m.name);
          f.jobs.push(JOB_SHORT[p[0]]);
        }
      }
    };
    cols.forEach((k, i) => {
      if (i) K.linksAt(s, cols[i - 1], zoneId, k, zoneId).forEach((l) => add(l, [cols[i - 1], zoneId], [k, zoneId]));
    });
    K.linksAt(s, 'cheesemaking', zoneId, 'trading', 'all').forEach((l) => add(l, ['cheesemaking', zoneId], ['trading', 'all']));
    for (const k of ['cheesemaking', 'refining']) K.linksAt(s, k, zoneId, 'research', 'all').forEach((l) => add(l, [k, zoneId], ['research', 'all']));
    K.setsAt(s, zoneId).forEach((d) => out.push({ c: d, jobs: ['whole rock'], who: cols.map((k) => K.at(s, k, zoneId)).filter(Boolean).map((m) => m.name) }));
    return out;
  }
  const comboRow = (f) => '<div class="mc-combo"><b>' + f.c.name + '</b><span>' + f.c.desc + '</span><small>' + f.who.map(esc).join(' + ') + ' · ' + f.jobs.join(' + ') + '</small></div>';

  // Un puesto: el ratón, quién es, qué hace ahí y cuánto rinde de verdad.
  function postCard(s, skill, zone, wide, sel) {
    const K = CM.mice;
    const key = K.postKey(skill, zone);
    const m = K.at(s, skill, zone);
    // V4.1: con un ratón elegido para mover, tocar un puesto lo lleva ahí (o los intercambia).
    const target = sel && (!m || m.id !== sel.id);
    const act = (normal) => (!sel ? normal : target ? 'moveto:' + key : 'movecancel');
    const selCls = !sel ? '' : target ? ' mcx-target' : ' mcx-picked';
    if (!m) return '<button data-act="' + act('pickpost:' + key) + '" data-post="' + key + '" class="mc-post empty mcx-vac' + (wide ? ' wide' : '') + selCls + '"><i class="mc-face hole">+</i><span><small>' + JOB_SHORT[skill].toUpperCase() + '</small><b>EMPTY POST</b><em>TAP TO ASSIGN</em></span></button>';
    const due = canPromote(s, m);
    // V4: tocar abre la ficha; mantener pulsado lo levanta para arrastrarlo a otro puesto.
    return (
      '<button data-act="' + act('card:' + m.id) + '" data-post="' + key + '" data-mouse="' + m.id + '" class="mc-post' + (wide ? ' wide' : '') + (due ? ' mc-due' : '') + (s.care && s.care.id === m.id ? ' inbed' : '') + selCls + '"' + (due ? upDelay(m) : '') + '>' + portrait(m) +
      // V4.9: en la casa se dice con texto en su renglón (sin icono de cama en la esquina).
      '<span><small>' + JOB_SHORT[skill].toUpperCase() + hearts(m.aff[skill]) + '</small><b>' + esc(m.name) + '</b>' + (s.care && s.care.id === m.id ? '<em class="mc-incare ' + (s.care.kind === 'spec' ? 'train' : 'bed') + '">' + (s.care.kind === 'spec' ? 'Training' : 'Resting') + ' · ' + clock(s.care.remaining) + '</em>' : '<em>' + rankLv(m) + '</em>') + '</span>' +
      '<i class="mc-out">' + mult(K.here(s, m)) + '</i>' + (due ? upArrow() : '') + '</button>'
    );
  }
  // Fila de un ratón en una lista: quién es, dónde está, qué le gusta, sus rasgos y un dato a la derecha.
  function mouseLine(s, m, act, right, opts) {
    const K = CM.mice;
    const o = opts || {};
    const skill = o.skill || (m.post ? m.post.split(':')[0] : '');
    const where = o.sub || (m.post ? K.postLabel(m.post) : m.rest ? 'Resting' : 'No post');
    return (
      // Si la fila lleva un botón dentro, no puede ser ella misma un botón.
      '<' + (o.div ? 'div role="button" tabindex="0"' : 'button') + ' data-act="' + act + '" class="mc-row' + (m.post ? '' : ' free') + (o.cls ? ' ' + o.cls : '') + '">' + portrait(m) +
      '<span class="mc-main"><b>' + esc(m.name) + '<i>' + rankLv(m) + '</i></b><small>' + where + '</small><span class="mc-tags">' + (o.likes === false ? '' : likesLine(m, 2)) + keyTraits(m, skill, o.traits === undefined ? 2 : o.traits) + '</span></span>' +
      '<span class="mc-side">' + right + '</span></' + (o.div ? 'div' : 'button') + '>'
    );
  }

  const globalsShown = (s) => s.built.shop || CM.mice.posts(s).some((p) => p.skill === 'research');
  // ---- COLONY: los puestos por roca ----
  // V4 (experimento): sin el botón BEST FIT; las decisiones de plantilla son del jugador. El
  // algoritmo, su acción y sus pruebas siguen intactos: poner true lo devuelve a COLONY.
  const SHOW_BEST_FIT = false;
  function colonyView(s, ui) {
    const K = CM.mice;
    const zones = q.openZones(s);
    let h = '';
    // Lo que pide atención, en una línea: cada aviso lleva a donde se resuelve.
    const promos = s.mice.filter((m) => canPromote(s, m));
    const idle = s.mice.filter((m) => !m.post);
    const empty = K.posts(s).filter((p) => !K.at(s, p.skill, p.zone));
    let notes = '';
    if (promos.length) notes += btn('promos', '<b>' + promos.length + '</b> can be promoted', { cls: 'mc-note up' });
    if (idle.length) notes += btn(idle.length === 1 ? 'pickmouse:' + idle[0].id : 'rosterfilter:free', '<b>' + idle.length + '</b> unassigned · ASSIGN', { cls: 'mc-note idle' });
    // Ocupación: una línea fija arriba. Lo importante es el propio puesto vacío, que late.
    const total = K.posts(s).length;
    const sel = ui.moveSel ? K.byId(s, ui.moveSel) : null;
    if (sel) {
      h += '<div class="mcx-movebar"><div class="mcx-mvhead">' + portrait(sel, 'mini') + '<span><b>MOVING ' + esc(sel.name).toUpperCase() + '</b><small>Tap a post: empty to move, a mouse to swap</small></span>' + btn('movecancel', 'CANCEL', { cls: 'mcx-pixbtn' }) + '</div><div class="mcx-jumps">' +
        (globalsShown(s) ? btn('jump:all', 'COLONY', { cls: 'mcx-jump' }) : '') + zones.map((z) => btn('jump:' + z.id, I.img('raw', z.base) + z.name.split(' ')[0].toUpperCase(), { cls: 'mcx-jump' })).join('') +
        (sel.post ? btn('post:' + sel.id + ':', 'TO HOUSE', { cls: 'mcx-jump' }) : '') + '</div></div>';
    }
    h += '<div class="mcx-occ' + (empty.length ? ' gap' : '') + '"><b>' + (total - empty.length) + '/' + total + ' POSTS</b><span>' + (empty.length ? empty.length + ' EMPTY' : 'ALL STAFFED') + '</span>' + (ui.lastMove && !ui.fxOn ? btn('undomove', I.img('undo') + 'UNDO', { cls: 'mcx-undo mcx-pixbtn' }) : '') + '</div>';
    if (s.candidates.length) h += btn('recruitview', '<b>' + '3 CANDIDATES WAITING</b><span>Already paid' + (s.candidatesFor ? ', for ' + K.postLabel(s.candidatesFor) : '') + '. They wait until you choose.</span><em>CHOOSE</em>', { cls: 'labrow ready mcx-waiting' });
    if (!ui.dragTold && s.mice.length > 1) h += '<p class="mcx-tip">Tap a mouse for its card. Hold it to drag it to another post; drop it on a mouse to swap them.</p>';
    if (s.care && K.byId(s, s.care.id)) notes += btn('miceview:house', (s.care.kind === 'spec' ? 'Training: <b>' : 'Bed: <b>') + esc(K.byId(s, s.care.id).name) + '</b> ' + clock(s.care.remaining), { cls: 'mc-note bed' + (s.care.kind === 'spec' ? ' train' : '') });
    if (notes) h += '<div class="mc-notes">' + notes + '</div>';
    // Puestos de toda la colonia: la tienda y el laboratorio.
    const globals = [];
    if (s.built.shop) globals.push(postCard(s, 'trading', 'all', false, sel));
    if (K.posts(s).some((p) => p.skill === 'research')) globals.push(postCard(s, 'research', 'all', false, sel));
    if (globals.length) h += '<div class="mc-rock open" data-rock="all"><div class="mc-rockhead static">' + I.img('coin', '', 'big') + '<span><b>WHOLE COLONY</b><small>They work for every rock</small></span></div><div class="mc-posts">' + globals.join('') + '</div></div>';
    for (const z of zones) {
      // V4: todas abiertas de salida, para poder arrastrar entre rocas; se pueden plegar.
      const open = sel || (ui.rockOpen && ui.rockOpen[z.id] !== undefined ? ui.rockOpen[z.id] : true);
      const cols = K.CHAIN.slice(0, 4).filter((k) => k === 'mining' || s.built[B.skills[k].station]);
      const combos = rockCombos(s, z.id);
      const crew = cols.map((k) => K.at(s, k, z.id));
      h += '<div class="mc-rock' + (open ? ' open' : '') + '" data-rock="' + z.id + '"><button data-act="' + (sel ? 'noop' : 'rocktoggle:' + z.id) + '" class="mc-rockhead">' + I.img('raw', z.base, 'big') + '<span><b>' + z.name.toUpperCase() + '</b><small>Depth ' + s.zones[z.id].depth + (combos.length ? ' · ' + plural(combos.length, 'combo') : '') + '</small></span>';
      // Plegada: las caras de quien trabaja ahí, para reconocerlos sin abrir.
      // V4.8: sin flecha en la cabecera (repetía lo que dicen las tarjetas); plegada, la cara de
      // quien puede ascender lleva el mismo contorno verde.
      if (!open) h += '<i class="mc-crew">' + crew.map((m) => (m ? portrait(m, 'mini' + (canPromote(s, m) ? ' mc-dueface' : '')) : '<i class="mc-face mini hole mcx-vac">+</i>')).join('') + '</i>';
      h += '<em>' + (open ? 'HIDE' : 'SHOW') + '</em></button>';
      if (open) {
        h += '<div class="mc-posts">' + cols.map((k) => postCard(s, k, z.id, false, sel)).join('') + '</div>';
        // Combinaciones: una línea con sus nombres; el detalle, al tocarla.
        if (combos.length) {
          const shown = ui.comboOpen && ui.comboOpen[z.id];
          h += '<button data-act="combotoggle:' + z.id + '" class="mc-combos' + (shown ? ' open' : '') + '"><b>' + plural(combos.length, 'combo') + '</b><span>' + combos.slice(0, 3).map((f) => f.c.name).join(' · ') + (combos.length > 3 ? ' +' + (combos.length - 3) : '') + '</span><em>' + (shown ? 'HIDE' : 'SHOW') + '</em></button>';
          if (shown) combos.forEach((f) => (h += comboRow(f)));
        }
      }
      h += '</div>';
    }
    if (idle.length) {
      h += '<h4 class="mc-h">NO POST · ' + idle.length + '</h4>';
      // También se arrastran: soltarlo sobre un puesto lo pone ahí (quien estuviera, a la casa).
      for (const m of idle) h += mouseLine(s, m, 'card:' + m.id, btn('pickmouse:' + m.id, 'PLACE', { cls: 'mini' }), { sub: m.rest ? 'Resting in the house' : 'Waiting in the house', div: true }).replace('class="mc-row', 'data-mouse="' + m.id + '" class="mc-row');
    }
    if (SHOW_BEST_FIT && s.mice.length > 1) {
      // Sin volver a buscar al pintar: -1 si BEST FIT no ha mirado desde el último cambio.
      const moves = K.bestFitKnown(s);
      h += btn('bestfit', '<b>BEST FIT</b><span>' + (moves === 0 ? 'Every mouse is where the colony earns the most, as far as BEST FIT can tell. Combos between mice are yours to find.' : moves > 0 ? 'Moves ' + plural(moves, 'mouse') + ' to where the colony earns the most. Combos between mice are yours to find.' : 'Places each mouse where the colony earns the most. Combos between mice are yours to find.') + '</span><em>' + (moves === 0 ? 'DONE' : 'DO IT') + '</em>', { cls: 'labrow', off: moves === 0 });
    }
    return h;
  }

  // ---- Ascensos pendientes: elegir varios, ver el total y confirmar una vez ----
  // Las clases de esta vista empiezan por `pm-`. Nada se compra hasta confirmar.
  const RARITY_NAME = ['', 'Rare', 'Legendary'];
  function promosView(s, ui) {
    const K = CM.mice;
    const sel = ui.promo || {};
    const list = s.mice.map((m) => ({ m, steps: K.promoteSteps(s, m) })).filter((x) => x.steps.length);
    list.sort((a, b) => a.steps[0].cost - b.steps[0].cost || K.level(b.m) - K.level(a.m));
    let h = btn('promoback', '<b>PROMOTIONS</b><span>A promotion makes a mouse faster for good. Nothing is bought until you confirm.</span><em>BACK</em>', { cls: 'labrow' });
    const done = ui.promoDone;
    if (done) h += '<div class="pm-done"><b>' + plural(done.mice, 'mouse', 'mice') + ' promoted</b><small>' + plural(done.steps, 'rank') + ' for ' + CM.fmt(done.cost) + ' coins' + (done.managers ? ' · ' + plural(done.managers, 'new manager') + ' buying upgrades' : '') + '</small></div>';
    if (!list.length) return h + '<p class="hint">' + (done ? 'Nobody else is ready for a promotion.' : 'No mouse is ready for a promotion yet. They get there by working.') + '</p>';
    const plan = K.promoteCost(s, sel);
    h += '<div class="pm-tools">' + btn('promoset:all', 'SELECT ALL', { cls: 'chip' }) + btn('promoset:afford', 'AFFORDABLE', { cls: 'chip' }) + btn('promoset:none', 'NONE', { cls: 'chip' }) + '</div>';
    for (const { m, steps } of list) {
      const to = sel[m.id] && steps.some((st) => st.rank === sel[m.id]) ? sel[m.id] : 0;
      const step = steps.find((st) => st.rank === to) || steps[steps.length - 1];
      const after = Object.assign({}, m, { rank: step.rank });
      const [skill, zone] = m.post ? m.post.split(':') : [];
      // V4.7: el ritmo redondeado (p. ej. «251 Raw every 0.6s») podía salir igual antes y después;
      // la mejora real se dice en porcentaje de velocidad, que no se pierde en el redondeo.
      const pctUp = skill ? Math.round((K.speed(after, skill, s, zone) / K.speed(m, skill, s, zone) - 1) * 1000) / 10 : 0;
      const gain = skill ? mouseRate(s, after, skill, zone) + ' · <b>+' + pctUp + '% speed</b>' : 'No post: it will work faster once placed';
      h += '<div role="button" tabindex="0" data-act="promosel:' + m.id + '" class="pm-row' + (to ? ' on' : '') + (step.total > s.coins ? ' dear' : '') + '">' + portrait(m) +
        '<span class="pm-main"><b>' + esc(m.name) + '<i>LV ' + K.level(m) + (m.rarity ? ' · ' + RARITY_NAME[m.rarity] : '') + '</i></b>' +
        '<small class="pm-path">' + M.ranks.slice(m.rank, step.rank).map((r) => r.name).join(' <i>&gt;</i> ') + ' <i>&gt;</i> <u>' + step.name + '</u>' + (step.rank > m.rank + 1 ? ' <em>' + (step.rank - m.rank) + ' ranks</em>' : '') + '</small><small class="pm-gain">' + gain + (M.ranks[step.rank].manager ? ' · buys upgrades on its own' : '') + '</small></span>' +
        '<span class="pm-side">' + coin(step.total) + '<i class="pm-check"></i></span>';
      // V4.9: sin botones de «hasta qué rango» (se leían como elegir entre Journeyman o Master).
      // Elegido, un ratón sube rango a rango hasta donde le deja su nivel, sin saltarse ninguno;
      // la fila enseña el camino entero y el coste de todos los pasos.
      h += '</div>';
    }
    const short = plan.cost > s.coins;
    // V4.8: barra fija en dos renglones de alto fijo. Arriba, ratones y rangos (son cosas distintas:
    // un ratón puede subir varios). Abajo, el coste junto a lo que tienes, en una sola línea.
    h += '<div class="pm-foot"><div class="pm-sum"><b>' + (plan.steps ? plural(plan.mice, 'mouse', 'mice') + ' · ' + plural(plan.steps, 'rank') : 'Select mice to promote') + '</b>' +
      (plan.steps ? '<span class="pm-cost' + (short ? ' pm-short' : '') + '">' + I.img('coin') + '<b>' + CM.fmt(plan.cost) + '</b><i>of ' + CM.fmt(s.coins) + (short ? ' · ' + CM.fmt(plan.cost - s.coins) + ' short' : '') + '</i></span>' : '<span class="pm-cost"><i>Tap a mouse, or SELECT ALL</i></span>') + '</div>' +
      btn('promogo', plan.steps ? 'PROMOTE ' + plan.mice : 'PROMOTE', { cls: 'buy' + (plan.steps && !short ? ' ready' : ''), off: !plan.steps || short }) + '</div>';
    return h;
  }

  // ---- ROSTER: todos los ratones, ordenables y filtrables ----
  const ROSTER_SORT = [['post', 'Post'], ['level', 'Level'], ['rarity', 'Rarity'], ['power', 'Output']];
  const ROSTER_SHOW = [['all', 'All'], ['free', 'No post'], ['legend', 'Legendary'], ['promote', 'Promote'], ['quirk', 'Quirks']];
  function rosterView(s, ui) {
    const K = CM.mice;
    const sort = ui.miceSort || 'post';
    const show = ui.miceShow || 'all';
    const likes = ui.miceLikes || '';
    const posts = K.posts(s);
    const where = (m) => (m.post ? posts.findIndex((p) => p.key === m.post) : 99);
    const by = {
      post: (a, b) => where(a) - where(b),
      level: (a, b) => K.level(b) - K.level(a),
      rarity: (a, b) => (b.rarity || 0) + legendsOf(b).length * 0.1 - ((a.rarity || 0) + legendsOf(a).length * 0.1) || K.level(b) - K.level(a),
      power: (a, b) => K.here(s, b) - K.here(s, a),
    }[sort];
    const pass = { all: () => true, free: (m) => !m.post, legend: (m) => m.rarity === 2 || legendsOf(m).length > 0, promote: (m) => canPromote(s, m), quirk: (m) => quirksOf(m).length > 0 }[show];
    let list = s.mice.filter(pass);
    if (likes) list = list.filter((m) => m.aff && m.aff[likes]);
    list.sort(likes ? (a, b) => m2(b, likes) - m2(a, likes) || by(a, b) : by);
    const name = (table, id) => table.find((o) => o[0] === id)[1];
    const ready = s.mice.filter((m) => canPromote(s, m)).length;
    let h = ready ? '<div class="mc-notes">' + btn('promos', '<b>' + ready + '</b> can be promoted', { cls: 'mc-note up' }) + '</div>' : '';
    h += '<button data-act="rosteropts" class="mc-filter' + (ui.rosterOpts ? ' open' : '') + '"><span>Sort: <b>' + name(ROSTER_SORT, sort) + '</b> · Show: <b>' + name(ROSTER_SHOW, show) + (likes ? ', likes ' + JOB_SHORT[likes] : '') + '</b> · ' + list.length + '/' + s.mice.length + '</span><em>' + (ui.rosterOpts ? 'CLOSE' : 'CHANGE') + '</em></button>';
    if (ui.rosterOpts) {
      const chips = (table, act, cur) => table.map((o) => btn(act + ':' + o[0], o[1], { cls: 'chip' + (cur === o[0] ? ' on' : '') })).join('');
      h += '<div class="mc-opts"><small>SORT BY</small><div>' + chips(ROSTER_SORT, 'micesort', sort) + '</div><small>SHOW</small><div>' + chips(ROSTER_SHOW, 'rosterfilter', show) + '</div><small>LIKES THE JOB</small><div>' + K.JOBS.map((k) => btn('rosterlikes:' + k, JOB_SHORT[k], { cls: 'chip' + (likes === k ? ' on' : '') })).join('') + '</div></div>';
    }
    if (!list.length) return h + '<p class="hint">No mouse matches.</p>';
    for (const m of list) {
      const due = canPromote(s, m);
      const right = (m.post ? '<i class="mc-out">' + mult(K.here(s, m)) + '</i>' : '<i class="mc-out none">UNASSIGNED</i>') + (due ? upArrow('mc-uprow') : s.care && s.care.id === m.id ? '<small class="mc-todo bed">' + (s.care.kind === 'spec' ? 'TRAINING' : 'RESTING') + '</small>' : '');
      h += mouseLine(s, m, 'card:' + m.id, right, { cls: due ? 'mc-due' : '', skill: likes || undefined }).replace('class="mc-row', (due ? upDelay(m).trim() + ' ' : '') + 'class="mc-row');
    }
    return h;
  }
  const m2 = (m, job) => (m.aff && m.aff[job]) || 0;

  // ---- Selector de un puesto: quién está y quién podría ocuparlo ----
  function postPicker(s, ui, key) {
    const K = CM.mice;
    const [skill, zone] = key.split(':');
    const now = K.at(s, skill, zone);
    const base = now ? K.solo(now, skill, s, zone) : 0;
    let h = btn('unpick', '&lt; BACK', { cls: 'mini' }) + '<div class="mc-pickhead"><span><small>WHO WORKS AT</small><b>' + K.postLabel(key).toUpperCase() + '</b></span></div>';
    if (now) {
      h += '<div class="mc-now">' + mouseLine(s, now, 'card:' + now.id, '<i class="mc-out">' + mult(base) + '</i><small class="mc-todo plain">alone</small>', { sub: 'Here now · ' + mouseRate(s, now, skill, zone), skill, traits: 3, likes: false }).replace('<span class="mc-tags">', '<span class="mc-tags">' + (now.aff[skill] ? '<i class="mc-like a' + now.aff[skill] + '">' + JOB_SHORT[skill] + hearts(now.aff[skill]) + '</i>' : '')) + btn('post:' + now.id + ':', 'SEND ' + esc(now.name).toUpperCase() + ' TO REST', { cls: 'mini' }) + '</div>';
    } else return emptyPicker(s, ui, key);
    const others = s.mice.filter((m) => m !== now).sort((a, b) => K.solo(b, skill, s, zone) - K.solo(a, skill, s, zone));
    if (!others.length) return h + '<p class="hint">You have no other mouse. Recruit one in HOUSE.</p>';
    h += '<p class="hint">Tap a mouse to put it here' + (now ? ': it swaps places with ' + esc(now.name) : '') + '. The number is what each would do <b>on its own</b> at this post; neighbours and combos can change it.</p>';
    for (const m of others) {
      const v = K.solo(m, skill, s, zone);
      const d = now ? v - base : 0;
      const delta = now ? '<small class="mc-delta ' + (d > 0.005 ? 'tok' : d < -0.005 ? 'tbad' : '') + '">' + (d >= 0 ? '+' : '-') + (Math.round(Math.abs(d) * 10) / 10).toFixed(1) + '</small>' : '';
      h += mouseLine(s, m, 'post:' + m.id + ':' + key, '<i class="mc-out">' + mult(v) + '</i>' + delta, { sub: m.post ? 'Now at ' + K.postLabel(m.post) + (now ? ' · swaps' : '') : 'Free', skill, likes: false, traits: 3, cls: 'pickable' }).replace('<span class="mc-tags">', '<span class="mc-tags">' + (m.aff[skill] ? '<i class="mc-like a' + m.aff[skill] + '">' + JOB_SHORT[skill] + hearts(m.aff[skill]) + '</i>' : ''));
    }
    return h;
  }
  // Puesto vacío: dos caminos. Mover a un ratón que ya tienes, o pagar una vez por conocer a
  // tres nuevos; el elegido empieza en este puesto. El precio se ve antes de pagar y se pagan
  // con dos toques, sin ventanas.
  // V4.3. Puesto vacío: se elige QUÉ ratón poner aquí (el flujo inverso a MOVE desde la ficha,
  // donde ya hay un ratón y se elige su destino). Arriba, el destino y contratar; debajo, siempre
  // a la vista, los ratones que tienes, cada uno con «PUT HERE» y si deja otro puesto vacío.
  // (Antes «MOVE A MOUSE» era un interruptor que ocultaba esa lista: los ratones desaparecían.)
  function emptyPicker(s, ui, key) {
    const K = CM.mice;
    const [skill, zone] = key.split(':');
    const label = K.postLabel(key);
    let h = btn('unpick', '&lt; CANCEL', { cls: 'mini' }) + '<div class="mc-pickhead"><span><small>ASSIGN A MOUSE TO</small><b>' + label.toUpperCase() + '</b></span></div>';
    h += '<p class="hint">Nobody works here: you do it by hand until a mouse takes it.</p>';
    h += hireCard(s, 'recruitfor:' + skill + ':' + zone, 'recruitfor:' + skill + ':' + zone);
    if (!s.mice.length) return h;
    h += '<h4 class="mc-h">' + 'OR MOVE ONE YOU HAVE</h4><p class="hint">Tap a mouse to put it here. The number is what it would do <b>on its own</b> here; neighbours and combos can change it.</p>';
    // Primero los libres, luego los demás; dentro, por lo que harían aquí.
    const list = s.mice.map((m) => ({ m, v: K.solo(m, skill, s, zone) }));
    list.sort((a, b) => (a.m.post ? 1 : 0) - (b.m.post ? 1 : 0) || b.v - a.v);
    for (const { m, v } of list) {
      const sub = m.post ? '<span class="mcx-leaves">Leaves ' + K.postLabel(m.post) + ' empty</span>' : 'Unassigned · in the house';
      h += mouseLine(s, m, 'post:' + m.id + ':' + key, '<i class="mc-out">' + mult(v) + '</i><i class="mhi-put">PUT HERE</i>', { sub, skill, likes: false, traits: 2, cls: 'pickable' }).replace('<span class="mc-tags">', '<span class="mc-tags">' + (m.aff[skill] ? '<i class="mc-like a' + m.aff[skill] + '">' + JOB_SHORT[skill] + hearts(m.aff[skill]) + '</i>' : ''));
    }
    return h;
  }
  // V4.3. Contratar, con la misma tarjeta en la vacante y en HOUSE (clases `mhi-`):
  // · sin candidatos: pagar por CONOCER a tres (aún no se contrata a nadie), precio en el botón;
  // · con tres pagados esperando: seguir eligiendo, sin cobrar otra vez.
  // La contratación de verdad es «HIRE [NOMBRE]», en la pantalla de los tres.
  function hireCard(s, payAct, waitAct) {
    // V4.4: una sola tarjeta y un solo botón. Lo que es (FIND NEW MICE), lo que pasa después
    // (eliges 1 de 3) y el precio en el botón. Con tres pagados, la misma zona dice CONTINUE.
    if (s.candidates.length) return '<div class="mhi-card waiting"><div><b>3 MICE WAITING</b><small>Already paid' + (s.candidatesFor ? ', for ' + CM.mice.postLabel(s.candidatesFor) : '') + '</small></div>' + btn(waitAct, 'CONTINUE', { cls: 'mhi-go' }) + '</div>';
    const cost = CM.mice.recruitCost(s);
    const short = s.coins < cost;
    return '<div class="mhi-card"><div><b>FIND NEW MICE</b><small>Meet 3 candidates. Choose one to hire.</small></div>' + btn(payAct, I.img('coin', '', 'mhi-coin') + CM.fmt(cost), { cls: 'mhi-go pay' + (short ? ' short' : ''), off: short, cost }) + '</div>';
  }
  // V4.10. Fila fija de MICE: HIRE (con su precio, o seguir eligiendo si ya hay tres pagados).
  function hireBar(s) {
    if (s.candidates.length) return '<div class="mc-hirebar">' + btn('recruitview', '<b>HIRE</b><small>3 mice waiting · CONTINUE</small>', { cls: 'mc-hire waiting' }) + '</div>';
    const cost = CM.mice.recruitCost(s);
    const short = s.coins < cost;
    return '<div class="mc-hirebar">' + btn('recruit', '<b>HIRE</b><small>Meet 3, pick 1 · ' + I.px('coin') + CM.fmt(cost) + '</small>', { cls: 'mc-hire' + (short ? ' short' : ''), off: short, cost }) + '</div>';
  }
  // V4.3. Tratar una manía: botiquín pixel art, TREAT y el coste en su línea. Estados claros:
  // se puede, falta dinero, la cama la ocupa otro, y este mismo en tratamiento. Clases `mct-`.
  function treatBtn(s, m, id) {
    const c = s.care;
    // V4.9: sin iconos sueltos; el estado lo dicen el texto y el color de la sala (rosa la cama).
    if (c && c.id === m.id && c.what === id) return '<span class="mct-btn on bed"><b>RESTING</b><small>' + clock(c.remaining) + ' left</small></span>';
    if (c) return '<span class="mct-btn busy"><b>HOUSE BUSY</b><small>' + clock(c.remaining) + '</small></span>';
    const cost = CM.mice.careCost(s, 'quirk');
    const short = s.coins < cost;
    return btn('care:' + m.id + ':quirk:' + id, '<b>TREAT</b><small>' + I.px('coin') + CM.fmt(cost) + '</small>', { cls: 'mct-btn' + (short ? ' short' : ''), off: short, cost });
  }
  // Ascenso disponible (por nivel), arriba de la ficha. Si el siguiente es Manager, se dice
  // antes de pagar que compra mejoras solo. Sin ascenso a la vista, no ocupa nada.
  function promoTop(s, m) {
    const K = CM.mice;
    const pr = K.promoteInfo(s, m);
    if (pr.maxed || !pr.levelOk) return '';
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const next = Object.assign({}, m, { rank: m.rank + 1 });
    const pct = skill ? Math.round((K.speed(next, skill, s, zone) / K.speed(m, skill, s, zone) - 1) * 100) : 0;
    const gains = [pct > 0 ? 'Works ' + pct + '% faster here' : 'Works faster at any job'];
    if (m.rank + 1 === 2) gains.push('Wears the uniform of its trade');
    if (pr.next.manager) gains.push('<b class="pv-unlock">AUTO-UPGRADES:</b> buys its job\'s cheapest upgrades on its own');
    // V4.9: bloque de ascenso pulido. Cabecera, los dos retratos con su rango y la flecha de
    // ascenso, lo que gana (una línea cada cosa) y un botón ancho con el rango y el coste.
    const fig = (mm, rk, cls) => '<figure class="' + cls + '">' + face(mm, 'face') + '<figcaption>' + M.ranks[rk].name + '</figcaption></figure>';
    return '<div class="mpr' + (pr.can ? '' : ' short') + '"><div class="mpr-head"><b>' + (pr.can ? 'PROMOTION READY' : 'PROMOTION · SAVE UP') + '</b><small>Rank ' + (m.rank + 2) + ' of ' + M.ranks.length + '</small></div>' +
      '<div class="mpr-stage">' + fig(m, m.rank, 'now') + I.img('ranknext', '', 'mpr-arrow') + fig(next, m.rank + 1, 'to') + '</div>' +
      '<ul class="mpr-gains">' + gains.map((g) => '<li>' + g + '</li>').join('') + '</ul>' +
      btn('promote:' + m.id, '<b>PROMOTE TO ' + pr.next.name.toUpperCase() + '</b><small>' + I.px('coin') + CM.fmt(pr.cost) + (pr.can ? '' : ' · ' + CM.fmt(pr.cost - s.coins) + ' short') + '</small>', { off: !pr.can, cls: 'buy mpr-go', cost: pr.cost }) + '</div>';
  }
  // ---- La ficha de un ratón ----
  function cardSection(ui, id, title, count, body, openByDefault) {
    const open = ui.cardSec && ui.cardSec[id] !== undefined ? ui.cardSec[id] : openByDefault;
    return '<div class="mc-sec' + (open ? ' open' : '') + '"><button data-act="sec:' + id + '" class="mc-sechead"><b>' + title + '</b>' + (count !== '' ? '<i>' + count + '</i>' : '') + '<em>' + (open ? 'HIDE' : 'SHOW') + '</em></button>' + (open ? '<div class="mc-secbody">' + body + '</div>' : '') + '</div>';
  }
  function cardView(s, ui, m) {
    const K = CM.mice;
    const p = K.xpProgress(m);
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const busy = !!s.care;
    let h = btn('back', '&lt; BACK', { cls: 'mini' });
    // Cabecera: el personaje.
    h +=
      '<div class="mc-hero r' + (m.rarity || 0) + '">' + portrait(m, 'huge') + '<div><b class="mc-name">' + esc(m.name) + '</b><small class="mc-rar r' + (m.rarity || 0) + '">' + RARITY[m.rarity || 0].name + ' · ' + M.ranks[m.rank].name + '</small>' +
      '<span class="mc-lv">LV ' + p.level + '</span>' + xpBar(p) + '</div></div>';
    h += '<div class="mc-job">' + (skill ? '<span><small>WORKS AT</small><b>' + K.postLabel(m.post) + '</b><em>' + mouseRate(s, m, skill, zone) + '</em></span>' : '<span><small>UNASSIGNED</small><b>In the Mouse House</b><em>It only works and levels up on a post</em></span>') + btn('pickmouse:' + m.id, skill ? 'MOVE' : 'ASSIGN', { cls: 'buy' }) + '</div>';
    // Afinidades: los seis oficios, de un vistazo.
    h += '<div class="mc-affs">' + K.JOBS.map((k) => '<i class="a' + ((m.aff && m.aff[k]) || 0) + (k === skill ? ' here' : '') + '">' + JOB_SHORT[k] + hearts(m.aff && m.aff[k]) + '</i>').join('') + '</div>';
    // V4.1: un ascenso disponible se ve arriba, con lo que da y lo que cuesta.
    h += promoTop(s, m);
    if (busy && s.care.id === m.id) h += careBox(s);
    h += masterBlock(s, m);

    // Rasgos: lo que es. Una manía se puede tratar en la cama.
    const all = m.traits.concat(m.learned).filter((id) => T[id]);
    let tb = '<ul class="mc-traits">';
    for (const id of all) {
      const inBed = busy && s.care.id === m.id && s.care.what === id;
      const treat = T[id].kind === 'quirk' && s.built.house ? treatBtn(s, m, id) : '';
      tb += '<li class="' + KIND_CLS[T[id].kind] + '">' + traitChip(id) + '<span>' + traitDesc(id) + '</span>' + treat + '</li>';
    }
    tb += '</ul><p class="hint">' + (m.picks >= M.traitSlots ? 'It has developed all its traits.' : 'It develops a new trait on its own at LV ' + (m.picks + 1) * M.traitEvery + (m.post ? ', shaped by the jobs it has done.' : '. It only levels up on a post.')) + (quirksOf(m).length ? ' A quirk can be treated in the Mouse House bed: ' + Math.round(M.care.ms / 60000) + ' minutes, and the mouse keeps working.' : '') + '</p>';
    h += cardSection(ui, 'traits', 'TRAITS', all.length, tb, true);

    // Especialidades: lo que ha aprendido trabajando. V4.6: la información a la izquierda y RETRAIN
    // aparte, que abre la TRAINING ROOM con este ratón y esta especialidad ya elegidos.
    const worked = K.JOBS.filter((k) => m.spec[k] || (m.jobs[k] || 0) > 0);
    let sb = '';
    for (const k of worked) {
      const id = m.spec[k];
      const grade = K.gradeOf(m, k);
      const n = m.jobs[k] || 0;
      const next = M.jobGrades[id ? grade : 0];
      const from = id && grade ? M.jobGrades[grade - 1] : 0;
      // V4.9: el grado en texto (antes, tres puntos azules) y RETRAIN abajo, en su propia fila,
      // con lo que hace dicho al lado: una ficha aireada, como la de TREAT.
      const gradeTag = id ? '<em class="mcs-grade">GRADE ' + ROMAN[grade] + '</em>' : '';
      sb += '<div class="mcs-spec' + (k === skill ? ' here' : '') + '"><div class="mcs-main"><div class="mcs-head"><b>' + B.skills[k].name + hearts(m.aff[k]) + '</b>' + gradeTag + '</div>' +
        (id ? '<div class="mcs-name">' + traitChip(id, grade) + '</div><small>' + traitDesc(id, grade) + '</small>' : '<small>No speciality yet.</small>') +
        (next ? '<div class="bar"><i style="width:' + Math.round(Math.min(1, (n - from) / (next - from)) * 100) + '%"></i></div><small>' + whole(n) + '/' + CM.fmt(next) + ' jobs to ' + (id ? 'grade ' + ROMAN[grade + 1] : 'a speciality') + '</small>' : id ? '<small>Top grade.</small>' : '') +
        '</div>' + (id && s.built.house ? '<div class="mcs-act"><small>Retrain: random among the other 4, keeps grade ' + ROMAN[Math.max(1, grade)] + '.</small>' + retrainBtn(s, m, '', k) + '</div>' : '') + '</div>';
    }
    if (!worked.length) sb = '<p class="hint">It has not worked yet. After ' + M.jobGrades[0] + ' jobs in a trade it gets a speciality of that trade on its own.</p>';
    h += cardSection(ui, 'specs', 'SPECIALITIES', worked.filter((k) => m.spec[k]).length, sb, false);

    // Combinaciones: las suyas y las que forma ahora con otros.
    const own = K.combosOf(m);
    const team = skill ? K.team(s, skill, zone) : { links: [], sets: [] };
    let cb = '';
    for (const c of own) cb += '<div class="mc-combo"><b>' + c.name + '</b><span>' + c.desc + '</span><small>' + c.needs.map((id) => T[id].name).join(' + ') + ' · on this mouse, wherever it works</small></div>';
    if (skill) {
      const partners = (l) => K.neighboursOf(s, skill, zone).filter((x) => x !== m && K.linksAt(s, skill, zone, x.post.split(':')[0], x.post.split(':')[1]).indexOf(l) >= 0);
      for (const l of team.links) cb += '<div class="mc-combo"><b>' + l.name + '</b><span>' + l.desc + '</span><small>With ' + (partners(l).map((x) => esc(x.name)).join(' and ') || 'a neighbour') + ' · while they work side by side</small></div>';
      for (const d of team.sets) cb += '<div class="mc-combo"><b>' + d.name + '</b><span>' + d.desc + '</span><small>The four mice of ' + q.zoneDef(zone).name + ' · while they share the rock</small></div>';
    }
    const nCombos = own.length + team.links.length + team.sets.length;
    h += cardSection(ui, 'combos', 'COMBOS', nCombos, nCombos ? cb : '<p class="hint">None active. Combos are found by trying: certain traits on one mouse, on neighbours in a line, or across a whole rock.</p>', nCombos > 0);

    h += cardSection(ui, 'rank', 'RANK', M.ranks[m.rank].name, promoteBlock(s, m), canPromote(s, m));
    h += '<div class="mc-foot">' + btn('dismiss:' + m.id, 'DISMISS', { cls: 'close' }) + '</div>';
    return h;
  }

  // V4.1. La cama de la Mouse House, dibujada: una habitación pequeña con la cama y el ratón
  // que se trata, por qué, cuánto le falta y cómo acabó el último. Clases `mch-`.
  function bedScene(s, ui) {
    const c = s.care;
    const m = c && c.kind === 'quirk' && CM.mice.byId(s, c.id);
    const last = !m && ui.careLast && ui.careLast.kind === 'quirk' && CM.mice.byId(s, ui.careLast.id);
    const who = m || last;
    // V4.4: recién enviado a la cama, el ratón llega andando, se mete y se duerme (unos 2 s). La
    // animación sigue donde iba aunque el panel se repinte (retraso negativo = lo ya transcurrido)
    // y no se repite al volver a entrar.
    const since = m && ui.bedIntro && ui.bedIntro.id === m.id ? performance.now() - ui.bedIntro.at : Infinity;
    // Al acabar, se levanta y se queda de pie junto a la cama (la misma técnica, al revés).
    const woke = !m && ui.careLast && ui.careLast.at ? performance.now() - ui.careLast.at : Infinity;
    const intro = since < 2100 ? ' intro" style="--intro:-' + Math.round(since) + 'ms' : woke < 1700 ? ' outro" style="--intro:-' + Math.round(woke) + 'ms' : '';
    const sleepy = m && (CM.mice.parts(m).marks || '').split(',').indexOf('zzz') >= 0;
    let h = '<div class="mch-room' + (m ? ' busy' : last ? ' done' : '') + (sleepy ? ' sleepy' : '') + intro + '"><i class="mch-window"></i><div class="mch-bed"><img class="pix mch-frame" alt="" src="' + I.url('bed') + '">' + (who ? '<img class="pix mch-mouse" alt="" src="' + CM.mouseUrl(who, null, true) + '"><i class="mch-blanket"></i>' : '') + '</div>' + (m ? '<b class="mch-zz">Z<small>z</small></b>' : '') + '</div>';
    if (m) {
      const what = 'Treating <b class="tbad">' + T[c.what].name + '</b>';
      const pct = Math.round((1 - c.remaining / c.total) * 100);
      h += '<div class="mch-info"><b>' + esc(m.name) + '</b><small>' + what + '</small><div class="mch-bar"><i style="width:' + pct + '%"></i></div><small>' + clock(c.remaining) + ' left · it keeps working at ' + (m.post ? K_label(m.post) : 'the house') + '</small></div>';
    } else if (last) {
      const ev = ui.careLast;
      h += '<div class="mch-info"><b>' + esc(last.name) + ' is out of bed</b><small>' + (ev.kind === 'quirk' ? 'No more <b>' + T[ev.what].name + '</b>' : 'Now a <b class="tok">' + T[ev.to].name + '</b>') + '. The bed is free.</small></div>';
    } else h += '<div class="mch-info"><b>' + (s.care ? 'The bed waits: the house is busy' : 'The bed is free') + '</b><small>' + houseBusy(s, 'bed') + '</small></div>';
    return h;
  }
  // La casa cuida de un ratón a la vez (regla de siempre): si está en la otra sala, se dice.
  function houseBusy(s, room) {
    const c = s.care;
    const m = c && CM.mice.byId(s, c.id);
    if (!m) return room === 'bed' ? 'Pick a mouse with a quirk below.' : 'Pick a mouse below to retrain one of its specialities.';
    return 'The house looks after one mouse at a time: ' + esc(m.name) + ' is in the ' + (c.kind === 'quirk' ? 'BED' : 'TRAINING ROOM') + ' for ' + clock(c.remaining) + '.';
  }
  // V4.6. TRAINING ROOM: la misma estructura que la cama (escena, estado, lista con su acción).
  // V4.8: RETRAIN aleatorio; el resultado se ve al acabar, nunca antes.
  function trainScene(s, ui) {
    const c = s.care;
    const m = c && c.kind === 'spec' && CM.mice.byId(s, c.id);
    const last = !m && ui.careLast && ui.careLast.kind === 'spec' && CM.mice.byId(s, ui.careLast.id);
    const who = m || last;
    const since = m && ui.bedIntro && ui.bedIntro.id === m.id ? performance.now() - ui.bedIntro.at : Infinity;
    const woke = !m && ui.careLast && ui.careLast.at ? performance.now() - ui.careLast.at : Infinity;
    const intro = since < 2100 ? ' intro" style="--intro:-' + Math.round(since) + 'ms' : woke < 1700 ? ' outro" style="--intro:-' + Math.round(woke) + 'ms' : '';
    let h = '<div class="mch-room train' + (m ? ' busy' : last ? ' done' : '') + intro + '"><img class="pix mtr-board" alt="" src="' + I.url('board') + '">' +
      '<div class="mtr-desk"><img class="pix mtr-table" alt="" src="' + I.url('desk') + '"><img class="pix mtr-book a" alt="" src="' + I.url('book') + '"><img class="pix mtr-book b" alt="" src="' + I.url('book2') + '"></div>' +
      (who ? '<img class="pix mtr-mouse" alt="" src="' + CM.mouseUrl(who, null, true) + '">' : '') + (m ? '<i class="mtr-spark"></i>' : '') + '</div>';
    if (m) {
      const pct = Math.round((1 - c.remaining / c.total) * 100);
      // V4.8: el resultado ya está sorteado, pero no se enseña hasta el final: «?» con el grado.
      const g = Math.max(1, CM.mice.gradeOf(m, c.what));
      h += '<div class="mch-info"><b>' + esc(m.name) + ' is retraining</b><small>' + traitChip(c.from || m.spec[c.what], g) + ' ' + I.px('arrow') + ' <span class="stat tjob mtr-q">? ' + ROMAN[g] + '</span> · random, keeps grade ' + ROMAN[g] + '</small><div class="mch-bar"><i style="width:' + pct + '%"></i></div><small>' + clock(c.remaining) + ' left · it keeps working at ' + (m.post ? K_label(m.post) : 'the house') + '</small></div>';
    } else if (last) {
      const ev = ui.careLast;
      h += '<div class="mch-info"><b>' + esc(last.name) + ' finished training</b><small>' + (ev.from && T[ev.from] ? '<s>' + T[ev.from].name + '</s> ' + I.px('arrow') + ' ' : 'Now ') + traitChip(ev.to, CM.mice.gradeOf(last, ev.what)) + '. The desk is free.</small></div>';
    } else h += '<div class="mch-info"><b>' + (s.care ? 'The desk waits: the house is busy' : 'The desk is free') + '</b><small>' + houseBusy(s, 'training') + '</small></div>';
    return h;
  }
  // Lista de la TRAINING ROOM: el ratón, sus especialidades y RETRAIN. Elegido uno, debajo se
  // escoge cuál cambiar (si tiene varias) y la nueva, con su coste: un toque empieza.
  function trainList(s, ui) {
    const K = CM.mice;
    const sel = ui.trainSel || null;
    const specsOf = (m) => K.JOBS.filter((k) => m.spec[k]);
    const best = (m) => Math.max(0, ...specsOf(m).map((k) => K.gradeOf(m, k)));
    let list = s.mice.filter((m) => specsOf(m).length);
    if (!list.length) return '<p class="hint">No mouse has a speciality yet. After ' + M.jobGrades[0] + ' jobs in a trade a mouse gets one on its own.</p>';
    list.sort((a, b) => (sel && b.id === sel.id) - (sel && a.id === sel.id) || best(b) - best(a) || K.level(b) - K.level(a));
    const shown = ui.trainAll ? list : list.slice(0, 5);
    const cost = K.careCost(s, 'spec');
    let h = '';
    for (const m of shown) {
      const open = sel && sel.id === m.id;
      const sub = specsOf(m).map((k) => traitChip(m.spec[k], K.gradeOf(m, k))).join(' ');
      h += '<div data-train="' + m.id + '">' + mouseLine(s, m, 'card:' + m.id, retrainBtn(s, m, open ? 'CLOSE' : ''), { sub, likes: false, traits: 0, div: true, cls: open ? 'mtr-open' : '' }) + '</div>';
      if (!open) continue;
      const jobs = specsOf(m);
      const job = sel.job && m.spec[sel.job] ? sel.job : jobs.length === 1 ? jobs[0] : '';
      h += '<div class="mtr-pick">';
      if (!job) {
        h += '<small>Which speciality?</small><div class="mtr-jobs">' + jobs.map((k) => btn('trainjob:' + m.id + ':' + k, '<b>' + B.skills[k].name + '</b>' + traitChip(m.spec[k], K.gradeOf(m, k)), { cls: 'mtr-job' })).join('') + '</div>';
      } else {
        const grade = K.gradeOf(m, job);
        const busy = !!s.care;
        // V4.8, RETRAIN aleatorio: se elige qué especialidad se sustituye, no cuál llega. Las otras
        // cuatro se enseñan como posibles resultados (texto, no botones) y hay un solo botón.
        const g = Math.max(1, grade);
        const mins = Math.round(M.care.ms / 60000);
        h += '<small>' + (jobs.length > 1 ? btn('trainjob:' + m.id + ':', '&lt;', { cls: 'mtr-back' }) : '') + 'Replace ' + esc(m.name) + "'s <b>" + B.skills[job].name + '</b> speciality.</small>';
        h += '<div class="mtr-sum"><div><small>REPLACES</small>' + traitChip(m.spec[job], g) + '</div><div><small>GETS</small><span class="stat tjob mtr-q">? ' + ROMAN[g] + '</span></div></div>';
        h += '<ul class="mtr-facts"><li><b>Random</b> among the other 4 ' + B.skills[job].name + ' specialities, each as likely. Never the same one.</li><li>Keeps <b>grade ' + ROMAN[g] + '</b>: the grade comes from its ' + B.skills[job].name + ' jobs, which stay.</li><li><b>' + mins + ' minutes</b>; it keeps working meanwhile. The result shows when it ends.</li></ul>';
        h += '<div class="mtr-maybe"><small>COULD BECOME</small>' + K.retrainOptions(m, job).map((t2) => '<span title="' + esc(T[t2].desc) + '">' + T[t2].name + '</span>').join('') + '</div>';
        if (busy) h += '<small class="tbad">' + houseBusy(s, 'training') + '</small>';
        h += btn('care:' + m.id + ':spec:' + job, '<b>RETRAIN ' + esc(m.name).toUpperCase() + '</b><em>' + I.px('coin') + CM.fmt(cost) + ' · ' + mins + ' min</em>', { cls: 'buy wide mtr-go', off: busy || s.coins < cost, cost });
      }
      h += '</div>';
    }
    if (list.length > 5) h += btn('trainall', ui.trainAll ? 'Show fewer' : 'See all ' + list.length + ' mice with a speciality', { cls: 'mini' });
    return h;
  }
  // El botón RETRAIN, igual en la ficha y en la sala: el libro, la acción y el coste (o el estado).
  function retrainBtn(s, m, label, job) {
    const c = s.care;
    if (c && c.id === m.id && c.kind === 'spec' && (!job || c.what === job)) return '<span class="mct-btn on train"><b>TRAINING</b><small>' + clock(c.remaining) + ' left</small></span>';
    const act = job !== undefined ? 'trainroom:' + m.id + ':' + job : 'trainsel:' + m.id;
    if (c && label !== 'CLOSE') return '<span class="mct-btn busy"><b>HOUSE BUSY</b><small>' + clock(c.remaining) + '</small></span>';
    return btn(act, '<b>' + (label || 'RETRAIN') + '</b>' + (label === 'CLOSE' ? '' : '<small>' + I.px('coin') + CM.fmt(CM.mice.careCost(s, 'spec')) + '</small>'), { cls: 'mct-btn retrain' + (label === 'CLOSE' ? ' close' : '') });
  }
  const K_label = (post) => CM.mice.postLabel(post);
  // ---- HOUSE: la cama, reclutar, el diario y el álbum ----
  function houseView(s, ui) {
    const K = CM.mice;
    const free = K.posts(s).filter((p) => !K.at(s, p.skill, p.zone));
    let h = '';
    // La cama.
    const tc = K.careCost(s, 'quirk');
    const rc = K.careCost(s, 'spec');
    const mins = Math.round(M.care.ms / 60000);
    // V4.6. Habitaciones: THE BED y TRAINING ROOM, con la misma estructura (escena, estado,
    // lista de ratones con su acción). La casa sigue cuidando de un ratón a la vez.
    const room = ui.houseRoom === 'training' ? 'training' : 'bed';
    // V4.9: pestañas sin iconos; debajo del nombre, en texto, si la sala está libre o quién está.
    const pc = s.care && K.byId(s, s.care.id);
    const roomState = (kind) => (!pc ? 'free' : s.care.kind === kind ? esc(pc.name) + ' · ' + clock(s.care.remaining) : 'waits');
    h += '<div class="mch-rooms">' + btn('houseroom:bed', 'THE BED<small>' + roomState('quirk') + '</small>', { cls: (room === 'bed' ? 'on' : '') + (pc && s.care.kind === 'quirk' ? ' used' : '') }) + btn('houseroom:training', 'TRAINING<small>' + roomState('spec') + '</small>', { cls: (room === 'training' ? 'on' : '') + (pc && s.care.kind === 'spec' ? ' used' : '') }) + '</div>';
    if (room === 'bed') {
      h += bedScene(s, ui) + '<p class="hint">' + mins + ' minutes and it keeps working at its post. Treat a quirk: <b>' + CM.fmt(tc) + '</b> coins.</p>';
      const sick = s.mice.filter((m) => quirksOf(m).length).sort((a, b) => K.level(b) - K.level(a));
      for (const m of sick.slice(0, ui.bedAll ? sick.length : 5)) {
        const id = quirksOf(m)[0];
        h += mouseLine(s, m, 'card:' + m.id, treatBtn(s, m, id), { sub: '<span class="tbad">' + T[id].name + '</span>: ' + lower(T[id].desc), likes: false, traits: 0, div: true });
      }
      if (sick.length > 5) h += btn('bedall', ui.bedAll ? 'Show fewer' : 'See all ' + sick.length + ' mice with a quirk', { cls: 'mini' });
    } else {
      h += trainScene(s, ui) + '<p class="hint">' + mins + ' minutes and it keeps working at its post. Retrain a speciality: <b>' + CM.fmt(rc) + '</b> coins. It keeps its grade.</p>';
      h += trainList(s, ui);
    }
    // Reclutar.
    const cost = K.recruitCost(s);
    // V4.1: un toque con el precio a la vista paga y enseña a los tres. Cubrir una vacante
    // concreta se hace desde el puesto (COLONY); esto es buscar en general.
    h += '<h4 class="mc-h">' + 'HIRE</h4>';
    h += hireCard(s, 'recruit', 'recruitview');
    // Diario: lo que han ido desarrollando.
    if (s.news.length) {
      h += '<h4 class="mc-h">' + 'COLONY NEWS</h4><ul class="mc-news">';
      for (const n of s.news.slice(0, ui.newsAll ? 40 : 5)) h += '<li>' + traitChip(n.trait) + '<span><b>' + esc(n.name) + '</b> ' + (T[n.trait].job ? 'specialised' : 'developed it') + '</span></li>';
      h += '</ul>';
      if (s.news.length > 5) h += btn('newsall', ui.newsAll ? 'Show less' : 'Show ' + Math.min(40, s.news.length) + ' entries', { cls: 'mini' });
    }
    h += '<h4 class="mc-h">' + 'COLLECTION</h4>' + btn('album', '<b>ALBUM</b><span>' + K.albumCount(s) + ' of ' + K.albumTotal + ' found · customers pay ' + times(1 + q.albumBonus(s)) + '</span><em>OPEN</em>', { cls: 'labrow' });
    if (s.mice.some((m) => M.ranks[m.rank].manager)) h += row('Managers buy upgrades', 'They buy cheap upgrades of their job on their own: never more than ' + Math.round(M.managerBudget * 100) + '% of your coins at once', btn('managers', s.settings.managersBuy ? 'ON' : 'OFF', { cls: 'buy' }));
    return h;
  }

  // ---- Reclutar: tres candidatos, uno a la vista ----
  function recruitView(s, ui) {
    const K = CM.mice;
    const cands = s.candidates.map((c) => K.normalize(Object.assign({ xp: 0, rank: 0 }, c)));
    const best = cands.reduce((b, c, i) => ((c.rarity || 0) > (cands[b].rarity || 0) ? i : b), 0);
    const at = ui.cand >= 0 && ui.cand < cands.length ? ui.cand : best;
    const c = cands[at];
    const free = K.posts(s).filter((p) => !K.at(s, p.skill, p.zone));
    const want = s.candidatesFor ? free.find((p) => p.key === s.candidatesFor) : null;
    // V4.10: solo una vacante elegida decide el puesto; si no, llega sin asignar.
    const dest = want;
    let h = btn('recruitlater', '&lt; LATER', { cls: 'mini' }) + '<div class="mc-pickhead"><span><small>ALREADY PAID · THEY WAIT IF YOU LEAVE</small><b>CHOOSE WHO TO HIRE</b></span></div>';
    if (s.candidatesFor) h += '<div class="mcx-for' + (want ? '' : ' gone') + '"><small>HIRING FOR</small><b>' + K.postLabel(s.candidatesFor).toUpperCase() + '</b>' + (want ? '' : '<span>Filled meanwhile: the new mouse arrives unassigned and you choose its post</span>') + '</div>';
    h += '<div class="mc-cands">' + cands.map((x, i) => '<button data-act="cand:' + i + '" class="r' + (x.rarity || 0) + (i === at ? ' on' : '') + '">' + portrait(x) + '<b>' + esc(x.name) + '</b><small class="mc-rar r' + (x.rarity || 0) + '">' + RARITY[x.rarity || 0].name + '</small></button>').join('') + '</div>';
    h += '<div class="mc-hero r' + (c.rarity || 0) + '">' + portrait(c, 'huge') + '<div><b class="mc-name">' + esc(c.name) + '</b><small class="mc-rar r' + (c.rarity || 0) + '">' + RARITY[c.rarity || 0].name + (c.rarity ? ' · ' + Math.round(RARITY[c.rarity].bonus * 100) + '% faster at any job' : '') + '</small><span class="mc-lv">LV 1</span></div></div>';
    h += '<div class="mc-affs">' + K.JOBS.map((k) => '<i class="a' + (c.aff[k] || 0) + '">' + JOB_SHORT[k] + hearts(c.aff[k]) + '</i>').join('') + '</div>';
    h += '<ul class="mc-traits">' + c.traits.map((id) => '<li class="' + KIND_CLS[T[id].kind] + '">' + traitChip(id) + '<span>' + traitDesc(id) + '</span></li>').join('') + '</ul>';
    // En tu colonia: hechos, no promesas.
    const liked = free.filter((p) => c.aff[p.skill]);
    h += '<div class="mc-fit"><small>IN YOUR COLONY</small>' + (dest ? '<span>It would start at <b>' + K.postLabel(dest.key) + '</b>: ' + mouseRate(s, c, dest.skill, dest.zone) + '.</span>' : '<span>It arrives <b>unassigned</b>: after hiring you choose its post.</span>') + (liked.length ? '<span>Empty posts it likes: ' + liked.slice(0, 3).map((p) => K.postLabel(p.key)).join(', ') + '.</span>' : '') + '<span>What it becomes later is for you to find out.</span></div>';
    return h + btn('choose:' + at, 'HIRE ' + esc(c.name).toUpperCase(), { cls: 'buy wide' });
  }

  function albumView(s) {
    const K = CM.mice;
    let h = btn('album', '&lt; BACK', { cls: 'mini' });
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

  function micePanel(s, ui) {
    const K = CM.mice;
    if (!s.built.house) {
      const info = CM.construction.buildInfo(s, 'house');
      if (!info.condOk) return '<p class="hint">Mice do the work for you. First: ' + esc(info.condText.toLowerCase()) + '.</p>';
      return (
        '<p class="lead">A <b>mouse on a post</b> does that job on its own, even while you are away.</p><p class="hint">Every mouse is one of a kind: its own look, traits, quirks and jobs it likes. As it works it levels up, develops new traits of its own and specialises in its trade. They stay until you dismiss them.</p>' +
        btn('build:house', 'BUILD THE MOUSE HOUSE<br>It is free', { cls: 'buy wide' })
      );
    }
    // V4.1: los candidatos pagados esperan sin secuestrar el panel; se ven al ir a ellos.
    if (s.candidates.length && ui.miceTab === 'recruit') return recruitView(s, ui);
    if (ui.miceTab === 'album') return albumView(s);
    if (ui.miceTab === 'promos') return promosView(s, ui);
    const shown = ui.card ? K.byId(s, ui.card) : null;
    if (shown) return cardView(s, ui, shown);
    const posts = K.posts(s);
    if (ui.pick && ui.pick.type === 'post' && posts.some((p) => p.key === ui.pick.key)) return postPicker(s, ui, ui.pick.key);

    // V4.10: las pestañas (con HOUSE) se ven desde el primer momento, también sin ratones.
    const view = ui.miceView === 'roster' || ui.miceView === 'house' ? ui.miceView : 'rocks';
    const todo = s.mice.filter((m) => canPromote(s, m)).length;
    let h = '<div class="tabs mc-tabs">' + btn('miceview:rocks', 'COLONY', { cls: view === 'rocks' ? 'on' : '' }) + btn('miceview:roster', 'ROSTER ' + s.mice.length, { cls: (view === 'roster' ? 'on' : '') + (todo ? ' mc-promo' : '') }) + btn('miceview:house', 'HOUSE', { cls: view === 'house' ? 'on' : '' }) + '</div>';
    // V4.10: HIRE siempre a mano en COLONY y ROSTER (en HOUSE ya tiene su sección). Contratar
    // desde aquí no elige puesto: el nuevo llega sin asignar y el jugador lo coloca.
    if (view !== 'house') h += hireBar(s);
    if (!s.mice.length && view === 'rocks') h += '<p class="hint mc-first">Hire your first mouse, then tap a post to put it to work. A mouse on a post does that stage for you, even while you are away.</p>';
    return h + (view === 'roster' ? rosterView(s, ui) : view === 'house' ? houseView(s, ui) : colonyView(s, ui));
  }

  function optionsPanel(s) {
    return (
      row('Sound', 'Effects are ' + (CM.sfx.isMuted() ? 'muted' : 'on'), btn('sound', CM.sfx.isMuted() ? 'TURN ON' : 'MUTE', { cls: 'buy' })) +
      row('Export save', 'Save + metrics as JSON', btn('export', 'EXPORT', { cls: 'buy' })) +
      row('Import save', 'Paste an exported JSON', btn('import', 'IMPORT', { cls: 'buy' })) +
      row('Test colony', 'Prototype: replace this game with a saved one', btn('protoload:early', 'EARLY', { cls: 'buy' }) + btn('protoload:three', '3 ROCKS', { cls: 'buy' }) + btn('protoload:mid', 'MID', { cls: 'buy' }) + btn('protoload:late', 'LATE', { cls: 'buy' })) +
      row('Playtest tools', 'Dev menu: marks the session as assisted', btn('open:dev', 'OPEN', { cls: 'buy' })) +
      row('Reset save', 'Start over from zero', btn('reset', 'RESET', { cls: 'danger' })) +
      // Qué versión del prototipo se está probando (para no confundirla con una copia en caché).
      '<p class="hint"><b>Prototype V4.10</b> · played ' + Math.floor(s.clock / 60000) + ' min · total level ' + q.totalLevel(s) + (s.devUsed ? ' · dev tools used' : '') + '. Data never leaves this browser.</p>'
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
    traitChip,
    traitDesc,
    ROMAN,
    secs,
    coin,
    btn,
    comboLine,
    title(name, ui, s) {
      if (name === 'lab' && s && !s.recipes.length) return 'YOUR FIRST RECIPE';
      if (name === 'lab' && s && !s.built.lab) return 'RECIPES';
      if (name === 'tree') return ui.tree === 'colony' ? 'COLONY' : ui.tree === 'lab' ? 'LAB UPGRADES' : B.skills[ui.tree].name.toUpperCase() + ' UPGRADES';
      return { cheese: 'CHEESERY', lab: 'CHEESE LAB', stock: 'PANTRY', shopinfo: 'SHOP', coins: 'COINS', mice: 'MICE', boosts: 'BOOSTS', options: 'MENU', dev: 'PLAYTEST TOOLS' }[name];
    },
    render(name, s, ui) {
      GM = s.master && s.nodes['cheesemaking.master'] ? s.master : '';
      ASLEEP = s.care && s.care.kind === 'quirk' ? s.care.id : '';
      return { tree: treePanel, cheese: cheesePanel, lab: labPanel, stock: stockPanel, shopinfo: shopInfoPanel, coins: coinsPanel, mice: micePanel, boosts: boostsPanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
