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
    'mouse-level': 'That mouse needs more levels first',
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
    richDepth: (s) => '+' + Math.round((B.depth.richness + q.mods(s)('richDepth')) * 100) + '% Raw for each depth level',
    drillYield: (s) => round1(q.drillYield(s, B.zones[0].id)) + ' Raw per cycle',
    drillRich: (s) => round1(q.drillYield(s, B.zones[0].id)) + ' Raw per cycle',
    drillSpeed: (s) => 'a cycle every ' + secs(q.drillDuration(s)),
    refBatch: (s) => round1(q.refineBatch(s) * q.refineMult(s)) + ' Base per cycle',
    refBonus: (s) => round1(q.refineBatch(s) * q.refineMult(s)) + ' Base from ' + q.refineBatch(s) * B.refinery.rawPerBase + ' Raw',
    refSpeed: (s) => 'a cycle every ' + secs(q.refineDuration(s)),
    cheeseSpeed: (s) => 'a plain cheese in ' + secs(B.cheesery.baseTimeMs / (1 + q.mods(s)('cheeseSpeed'))),
    cheeseValue: (s) => 'a plain Cheddar is worth ' + round1(B.bases.cheddar.value * (1 + q.mods(s)('cheeseValue')) * q.skillMult(s, 'cheesemaking')),
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
    const n = CM.tree.affordable(s, skill);
    h += btn('buyAll:' + skill, n ? 'BUY EVERYTHING I CAN AFFORD' : 'NOTHING AFFORDABLE YET', { off: !n, cls: 'buy wide serveall' });
    for (const br of BRANCHES) {
      const nodes = B.trees[skill].filter((x) => x.branch === br[0]);
      if (!nodes.length) continue;
      h += '<h3>' + (skill === 'colony' ? 'WHILE YOU ARE AWAY' : br[1]) + '</h3><p class="hint">' + (skill === 'colony' ? 'Only stages with a mouse keep going when the game is closed' : br[2]) + '</p>';
      for (const node of nodes) {
        const info = CM.tree.info(s, skill, node.id);
        const title = node.name + (node.max > 1 ? ' <span class="rank">' + info.rank + '/' + node.max + '</span>' : '');
        const sub = node.desc + '<br><span class="st ' + (info.rank ? 'good' : 'dim') + '">' + effectText(s, skill, node, info.rank) + '</span>';
        let right;
        if (info.maxed) right = '<span class="tag">' + (node.max === 1 ? 'HIRED' : 'MAX') + '</span>';
        else if (info.locked) right = '<span class="tag lock">Needs ' + B.skills[skill].name + '<br>LV ' + node.level + '</span>';
        else right = btn('node:' + skill + ':' + node.id, (node.branch === 'auto' && node.max === 1 ? 'HIRE' : 'BUY') + '<br>' + coin(info.cost), { off: !info.canBuy, cls: 'buy', cost: info.cost });
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
  function cheesePanel(s, ui) {
    const C = CM.cheesery;
    const laneOf = (base) => s.zones[q.zoneOfBase(base)];
    const hasCook = q.isAutomated(s, 'cheesemaking');
    const cookAt = (base) => q.auto(s, 'cheesemaking', q.zoneOfBase(base));
    const level = q.level(s, 'cheesemaking');
    let h = '';
    // Cada queso se cocina en su propia línea: puede haber varios encargos a la vez.
    for (const def of q.openZones(s)) {
      const job = s.zones[def.id].cookJob;
      if (!job) continue;
      const r = job.recipeId ? C.recipe(s, job.recipeId) : null;
      const label = job.kind === 'experiment' && !r ? 'New ' + B.bases[def.base].name + ' recipe...' : esc(r ? r.name : 'cheese') + (job.lotsLeft > 1 ? ' (' + job.lotsLeft + ' left)' : '');
      h += '<div class="jobbar">' + I.img('lot', def.base) + '<span>' + label + '</span><div class="bar"><i data-job="cook:' + def.id + '"></i></div>' + btn('cheeseTap:' + def.id, 'SPEED UP', { cls: 'buy' }) + '</div>';
    }
    h += '<p class="hint stock">' + C.unlockedBases(s).map((b) => I.img('base', b) + B.bases[b].name + ' Base ' + CM.fmt(s.inv.base[b])).join(' &nbsp; ') + '</p>';
    h += '<div class="tabs">' + btn('tab:experiment', 'NEW RECIPE', { cls: ui.cheeseTab === 'experiment' ? 'on' : '' }) + btn('tab:book', 'RECIPE BOOK ' + s.recipes.length + '/' + C.totalCombos(), { cls: ui.cheeseTab === 'book' ? 'on' : '' }) + '</div>';

    if (ui.cheeseTab === 'experiment') {
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
        const can = !laneOf(combo.base).cookJob && s.inv.base[combo.base] >= B.cheesery.experimentBase && s.coins >= coins;
        const syn = C.formula(combo).synergies;
        h += '<div class="result"><div><b>Undiscovered cheese</b><small>' + (syn.length ? 'These go well together! ' : '') + 'Costs ' + B.cheesery.experimentBase + ' ' + B.bases[combo.base].name + ' Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + secs(C.jobTime(s, combo, null)) + ' · you get the recipe and 1 cheese</small></div></div>';
        h += btn('experiment', 'DISCOVER IT', { off: !can, cls: 'buy wide' });
      }
      return h + '<p class="hint">Cheesemaking LV ' + level + '. Higher levels unlock better ingredients.</p>';
    }

    if (!s.recipes.length) return h + '<p class="hint">No recipes yet. Combine four parts in NEW RECIPE.</p>';
    h += '<p class="hint">' + (hasCook ? 'A mouse on Cheesemaking cooks the most valuable recipe of its cheese on its own. Pin a different one with ALWAYS COOK THIS.' : 'Each cheese is cooked on its own line, at the same time. Tip: put a mouse on Cheesemaking (MICE) to cook automatically.') + '</p>';
    const sorted = s.recipes.slice().sort((a, b) => CM.cheesery.valueOf(s, b) - CM.cheesery.valueOf(s, a));
    for (const r of sorted) {
      const combo = C.parseKey(r.key);
      const coins = B.ingredients[combo.ingredient].coinCost;
      const max = C.maxLots(s, r);
      const job = laneOf(combo.base).cookJob;
      const mouseHere = cookAt(combo.base);
      const cooking = mouseHere && C.isCooking(s, r);
      const autoPick = mouseHere && !cooking && !laneOf(combo.base).cookRecipe && C.laneRecipe(s, q.zoneOfBase(combo.base)) === r;
      const m = C.masteryLevel(r);
      const nextAt = B.cheesery.masteryAt[m];
      const syn = C.formula(combo).synergies;
      h +=
        '<div class="recipe' + (cooking || autoPick ? ' cooking' : '') + '"><div class="rhead">' + I.img('lot', combo.base, 'big') + '<b>' + esc(r.name) + '</b>' + btn('rename:' + r.id, 'RENAME', { cls: 'mini' }) + '</div><small>' + comboLine(combo) + (syn.length ? ' · ' + syn.join(', ') : '') + '</small><div>' + valueTag(s, r) + '<span class="stat">Mastery ' + m + (nextAt ? ' · ' + (r.made || 0) + '/' + nextAt : ' MAX') + '</span></div>' +
        '<div class="rfoot"><span>Have ' + (s.lots[r.id] || 0) + ' · ' + B.cheesery.lotBase + ' Base' + (coins ? ' + ' + coins + 'c' : '') + ' each · ' + secs(C.jobTime(s, combo, r)) + '</span><span>' +
        btn('make:' + r.id + ':1', 'MAKE 1', { off: job || max < 1, cls: 'buy' }) + btn('make:' + r.id + ':' + Math.max(1, max), 'MAKE ' + (max > 1 ? max : 'MAX'), { off: job || max < 2, cls: 'buy' }) + '</span></div>' +
        (mouseHere ? btn(cooking ? 'uncook:' + q.zoneOfBase(combo.base) : 'cook:' + r.id, cooking ? 'PINNED · TAP TO GO BACK TO AUTO' : autoPick ? 'COOKING THIS (BEST) · TAP TO PIN' : 'ALWAYS COOK THIS', { cls: 'wide ' + (cooking ? 'on' : autoPick ? 'auto' : '') }) : '') + '</div>';
    }
    return h;
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
  const traitChip = (id, grade) => '<span class="stat ' + KIND_CLS[T[id].kind] + '">' + T[id].name + (grade && T[id].job ? ' ' + ROMAN[grade] : '') + '</span>';
  const rareChip = (m) => (m.rarity ? '<span class="stat rare' + m.rarity + '">' + RARITY[m.rarity].name.toUpperCase() + '</span>' : '');
  const affChips = (m) =>
    CM.mice.CHAIN.filter((k) => m.aff && m.aff[k])
      .sort((a, b) => m.aff[b] - m.aff[a])
      .map((k) => '<span class="stat aff a' + m.aff[k] + '">' + M.affinity[m.aff[k]].name + ' ' + B.skills[k].name + '</span>')
      .join('');
  const chipsOf = (m) => rareChip(m) + CM.mice.traitsOf(m).map((t) => traitChip(t.id, t.grade)).join('') + affChips(m);
  const face = (m, cls) => '<img class="pix ' + (cls || 'face') + ' r' + (m.rank || 0) + '" alt="" src="' + CM.mouseUrl(m) + '">';
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
    const every = (ms) => ' every ' + secs(Math.max(200, ms / sp));
    if (skill === 'mining') return (y === 1 ? 'a swing' : 'a x' + round1(y) + ' swing') + every(q.minerInterval(s));
    if (skill === 'drilling') return round1(q.drillYield(s, zone) * y) + ' Raw' + every(q.drillDuration(s));
    if (skill === 'refining') return round1(q.refineBatch(s) * q.refineMult(s) * y) + ' Base' + every(q.refineDuration(s));
    if (skill === 'trading') return (y === 1 ? 'a sale' : 'a x' + (Math.round(y * 100) / 100) + ' sale') + every(q.sellDuration(s));
    const recipe = CM.cheesery.laneRecipe(s, zone);
    const n = y === 1 ? 'a cheese' : round1(y) + ' cheese';
    return recipe ? n + every(CM.cheesery.jobTime(s, CM.cheesery.parseKey(recipe.key), recipe)) : 'cooks ' + times(sp) + ' as fast as by hand';
  }
  // De dónde sale su velocidad en un oficio.
  function speedParts(s, m, skill, zone) {
    const K = CM.mice;
    const lv = K.level(m);
    const out = [];
    let power = 1;
    const part = (label, n) => {
      if (!n) return;
      power += n;
      out.push(label + ' ' + signed(n));
    };
    part('level ' + lv, M.perLevel * (lv - 1));
    part(M.ranks[m.rank].name, M.ranks[m.rank].bonus);
    part(RARITY[m.rarity || 0].name, RARITY[m.rarity || 0].bonus);
    part(K.affinity(m, skill).name.toLowerCase() + ' this job', K.affinity(m, skill).speed);
    part('rank traits', K.trait(m, 'rankSpeed', skill) * m.rank);
    const rest = K.speed(m, skill, s, zone) / power;
    if (Math.abs(rest - 1) > 0.004) out.push('traits and neighbours ' + times(rest));
    return out;
  }
  // Lista de todo lo que hace especial a un ratón, explicado.
  function traitList(m) {
    const K = CM.mice;
    let h = '<ul class="traits">';
    if (m.rarity) h += '<li>' + rareChip(m) + Math.round(RARITY[m.rarity].bonus * 100) + '% faster at any job</li>';
    for (const t of K.traitsOf(m)) {
      const def = T[t.id];
      h += '<li>' + traitChip(t.id, t.grade) + def.desc + (def.job ? '. Only counts at ' + B.skills[def.job].name + (t.grade > 1 ? ', ' + times(M.gradeMult[t.grade - 1]) + ' as strong as grade I' : '') : '') + '</li>';
    }
    for (const c of K.combosOf(m)) h += '<li><span class="stat tcombo">COMBO · ' + c.name + '</span>' + c.desc + '</li>';
    for (const k of K.CHAIN) {
      const a = m.aff && m.aff[k];
      if (a) h += '<li><span class="stat aff a' + a + '">' + M.affinity[a].name + ' ' + B.skills[k].name + '</span>' + Math.round(M.affinity[a].speed * 100) + '% faster there and specialises ' + M.affinity[a].learn + 'x as fast</li>';
    }
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
      h += btn('trait:' + m.id + ':' + i, '<span>' + traitChip(id) + '<small>' + T[id].desc + '</small>' + (then && then !== now ? '<em>Here: ' + then + '</em>' : skill && T[id].job && T[id].job !== skill ? '<em>No change on this post</em>' : '') + '</span>', { cls: 'opt ' + KIND_CLS[T[id].kind] });
    });
    if (offer.kind === 'level') h += btn('trait:' + m.id + ':mystery', '<span><span class="stat tmyst">? MYSTERY TRAIT</span><small>Any trait in the game. ' + Math.round(M.mystery.legend * 100) + '% legendary, ' + Math.round(M.mystery.quirk * 100) + '% a quirk, the rest a good one.</small></span>', { cls: 'opt tmyst' });
    const cost = K.rerollCost(m);
    return h + btn('reroll:' + m.id, 'REROLL THESE THREE · ' + coin(cost), { off: s.coins < cost, cls: 'mini wide', cost }) + '</div>';
  }
  // Casillas de rasgos de nivel y progreso de cada oficio.
  function growth(m) {
    const K = CM.mice;
    const lv = K.level(m);
    let h = '<h4>LEVEL TRAITS</h4><div class="slots">';
    for (let i = 0; i < M.traitSlots; i++) {
      const id = m.learned[i];
      const at = (i + 1) * M.traitEvery;
      h += id ? '<div class="full">' + traitChip(id) + '</div>' : i === m.picks && lv >= at ? '<div class="ready">PICK!</div>' : '<div>LV ' + at + '</div>';
    }
    h += '</div><h4>SPECIALITIES</h4><p class="hint">Working a job earns its speciality: a trait of that job with three grades.</p><div class="specs">';
    for (const k of K.CHAIN) {
      const jobs = m.jobs[k] || 0;
      const id = m.spec[k];
      const grade = K.gradeOf(m, k);
      const next = M.jobGrades[id ? grade : 0];
      const aff = m.aff[k] ? ' <i class="aff a' + m.aff[k] + '">' + M.affinity[m.aff[k]].name + '</i>' : '';
      let right;
      if (id) right = traitChip(id, grade) + (next ? '<small>' + whole(jobs) + ' / ' + CM.fmt(next) + ' jobs to ' + ROMAN[grade + 1] + '</small>' : '<small>top grade</small>');
      else right = jobs >= M.jobGrades[0] ? '<small class="hot">ready to pick</small>' : '<small>' + whole(jobs) + ' / ' + M.jobGrades[0] + ' jobs</small>';
      const pctDone = next ? Math.min(100, Math.round((jobs / next) * 100)) : 100;
      h += '<div><span><b>' + B.skills[k].name + '</b>' + aff + '</span><span>' + right + '</span><div class="bar xp"><i style="width:' + pctDone + '%"></i></div></div>';
    }
    return h + '</div>';
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
  // La escalera de rangos de un ratón: qué da cada uno y cómo se ve.
  function rankLadder(s, m) {
    const [skill, zone] = m.post ? m.post.split(':') : [];
    return (
      '<div class="ladder">' +
      M.ranks
        .map((r, i) => {
          const as = Object.assign({}, m, { rank: i });
          const state = i < m.rank ? 'done' : i === m.rank ? 'now' : '';
          const need = i <= m.rank ? (i === m.rank ? 'current rank' : 'done') : 'LV ' + r.level + ' + ' + CM.fmt(r.cost) + ' coins';
          return '<div class="' + state + '">' + face(as, 'face mini') + '<span><b>' + r.name + '</b><small>' + (skill ? mouseRate(s, as, skill, zone) : 'works ' + times(1 + r.bonus) + ' as fast') + (r.manager ? ' · buys upgrades on its own' : '') + '</small></span><em>' + need + '</em></div>';
        })
        .join('') +
      '</div>'
    );
  }
  CM.mouseRate = mouseRate;

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
      s.candidates.forEach((c, i) => {
        const as = K.normalize(Object.assign({ xp: 0, rank: 0 }, c));
        h +=
          '<div class="mouse cand rar' + (c.rarity || 0) + '"><div class="mhead">' + face(c) + '<div class="info"><b>' + esc(c.name) + '</b>' + traitList(as) + '</div></div>' +
          '<div class="mfoot"><small class="mjob">' + (dest ? 'There: <b>' + mouseRate(s, as, dest.skill, dest.zone) + '</b>' + (as.aff[dest.skill] ? ' · ' + M.affinity[as.aff[dest.skill]].name.toLowerCase() + ' it' : '') : 'Waits in the house') + '</small>' + btn('choose:' + i, 'CHOOSE', { cls: 'buy' }) + '</div></div>';
      });
      return h;
    }

    // Álbum: lo coleccionado, por categorías.
    if (ui.miceTab === 'album') {
      h += btn('album', 'BACK TO MY MICE', { cls: 'mini wide' });
      h += '<p class="lead"><b>' + K.albumCount(s) + ' of ' + K.albumTotal + '</b> found. Customers pay <b>' + times(1 + q.albumBonus(s)) + '</b>.</p><p class="hint">Every new fur, hat, accessory, trait and combo on your mice goes in here for good, even if that mouse leaves. Each one raises all your sale prices by ' + Math.round(M.albumPrice * 100) + '%. Combos are found by trying: get the right traits together on one mouse.</p>';
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

    const staffed = posts.length - free.length;
    const ready = s.mice.filter((m) => K.promoteInfo(s, m).can).length;
    const picks = s.mice.filter((m) => m.offer).length;
    h +=
      '<div class="msum"><div><b>' + s.mice.length + '</b><small>' + (s.mice.length === 1 ? 'mouse' : 'mice') + '</small></div><div class="' + (free.length ? 'warn' : 'good') + '"><b>' + staffed + '/' + posts.length + '</b><small>posts filled</small></div><div class="' + (picks ? 'hot' : '') + '"><b>' + picks + '</b><small>traits to pick</small></div><div class="' + (ready ? 'good' : '') + '"><b>' + ready + '</b><small>to promote</small></div></div>';

    const cost = K.recruitCost(s);
    const goes = free.length ? 'Goes to ' + K.postLabel(free[0].key) : 'Every post is taken: it would wait in the house';
    h += btn('recruit', 'RECRUIT A MOUSE · ' + coin(cost) + '<br><small>' + goes + '</small>', { off: s.coins < cost, cls: 'buy wide serveall', cost });
    if (free.length) h += '<p class="hint note warn">' + plural(free.length, 'post') + ' with no mouse (you work ' + (free.length === 1 ? 'it' : 'them') + ' by hand): ' + free.slice(0, 3).map((p) => K.postLabel(p.key)).join(', ') + (free.length > 3 ? ' and ' + (free.length - 3) + ' more' : '') + '.</p>';
    else if (s.mice.length) h += '<p class="hint note">Every post has a mouse. More posts open with each new rock. Recruit anyway to swap in a better mouse.</p>';
    if (s.mice.length > 1) {
      const moves = K.bestFitMoves(s);
      h += moves ? btn('bestfit', 'BEST FIT: PLACE EVERYONE FOR ME<br><small>Moves ' + plural(moves, 'mouse') + '. Looks at each mouse alone, not at neighbours</small>', { cls: 'buy wide calm' }) : '<p class="hint note good">Best fit: each mouse is where it works best on its own. Neighbour effects are yours to arrange.</p>';
    }
    if (s.mice.length) h += btn('album', 'ALBUM · ' + K.albumCount(s) + '/' + K.albumTotal + ' FOUND<br><small>Customers pay ' + times(1 + q.albumBonus(s)) + ' thanks to it</small>', { cls: 'buy wide calm' });
    h += '<p class="hint">Each candidate: ' + Math.round(RARITY[1].chance * 100) + '% Rare, ' + Math.round(RARITY[2].chance * 100) + '% Legendary.</p>';
    if (s.mice.some((m) => M.ranks[m.rank].manager)) h += row('Managers buy upgrades', 'They buy the cheapest upgrade of their job on their own', btn('managers', s.settings.managersBuy ? 'ON' : 'OFF', { cls: 'buy' }));
    if (!s.mice.length) return h + '<p class="hint">No mice yet. Your first recruit will take over a stage so you do not have to tap it.</p>';

    // Primero los que tienen algo que elegir, luego los que esperan; el resto, en el orden de la cadena.
    const order = (m) => (m.offer ? -1 : m.post ? 1 + posts.findIndex((p) => p.key === m.post) : 0);
    const sorted = s.mice.slice().sort((a, b) => order(a) - order(b));
    for (const m of sorted) {
      const p = K.xpProgress(m);
      const [skill, zone] = m.post ? m.post.split(':') : [];
      const open = ui.moving === m.id;
      let job;
      if (skill) job = '<b>' + K.postLabel(m.post) + '</b> · ' + mouseRate(s, m, skill, zone);
      else if (m.rest) job = '<b>Resting in the house</b> · you sent it to rest. Tap MANAGE to give it a post';
      else job = '<b>Waiting in the house</b> · every post is taken. Tap MANAGE to swap it in';
      const pips = M.ranks.map((r, i) => '<i class="' + (i <= m.rank ? 'on' : '') + '"></i>').join('');
      const combos = K.combosOf(m);
      h +=
        '<div class="mouse rar' + (m.rarity || 0) + (m.post ? '' : ' idle') + (open ? ' open' : '') + (m.offer ? ' picking' : '') + '" data-mouse="' + m.id + '"><div class="mhead">' + face(m) + '<div class="info"><b>' + esc(m.name) + ' <span class="rank">' + M.ranks[m.rank].name + '</span><span class="pips">' + pips + '</span></b>' +
        '<div class="lvl"><span>LV ' + p.level + '</span>' + xpBar(p) + '<span>' + (p.maxed ? 'MAX' : p.cur + '/' + p.need) + '</span></div><div>' + chipsOf(m) + combos.map((c) => '<span class="stat tcombo">' + c.name + '</span>').join('') + '</div></div></div>' +
        '<p class="mjob">' + job + '</p>' + pickBox(s, m) + promoteBlock(s, m) +
        '<div class="mfoot">' + btn('move:' + m.id, open ? 'CLOSE' : 'MANAGE: TRAITS · MOVE · DISMISS', { cls: 'mini wide' }) + '</div>';
      if (open) {
        h += '<div class="mdetail"><h4>WHAT MAKES ' + esc(m.name).toUpperCase() + ' SPECIAL</h4>' + traitList(m);
        if (skill) {
          const parts = speedParts(s, m, skill, zone);
          const best = K.CHAIN.filter((k) => (m.aff[k] || 0) > (m.aff[skill] || 0)).sort((a, b) => m.aff[b] - m.aff[a])[0];
          h += '<p class="hint">Works ' + times(K.speed(m, skill, s, zone)) + ' as fast as you by hand' + (parts.length ? ': ' + parts.join(', ') : '') + '.' + (best ? ' It ' + M.affinity[m.aff[best]].name.toLowerCase() + ' ' + B.skills[best].name + ' more than this job.' : '') + '</p>';
        }
        if (!p.maxed) h += '<p class="hint">' + (m.post ? (p.need - p.cur) + ' more jobs to reach LV ' + (p.level + 1) + '. Each level makes it ' + Math.round(M.perLevel * 100) + '% faster; every ' + M.traitEvery + ' levels it learns a trait.' : 'It does not level up while it is in the house.') + '</p>';
        h += growth(m);
        h += '<h4>RANKS</h4><p class="hint">Each rank makes it faster for good and changes its outfit.</p>' + rankLadder(s, m);
        // Elegir puesto: cada opción dice cuánto rendiría ahí y a quién desplazaría.
        h += '<h4>MOVE TO</h4><div class="posts">';
        for (const post of posts) {
          const other = s.mice.find((x) => x.post === post.key && x !== m);
          const here = m.post === post.key;
          const a = m.aff[post.skill];
          h += btn(here ? 'noop' : 'post:' + m.id + ':' + post.key, '<span>' + K.postLabel(post.key) + '<small>' + (here ? 'it works here now' : other ? 'swaps places with ' + esc(other.name) : 'free post') + (a ? ' · ' + M.affinity[a].name.toLowerCase() + ' it' : '') + (m.spec[post.skill] ? ' · ' + T[m.spec[post.skill]].name + ' ' + ROMAN[K.gradeOf(m, post.skill)] : '') + '</small></span><span>' + mouseRate(s, m, post.skill, post.zone) + '</span>', { cls: 'deliver' + (here ? ' open' : ''), off: here });
        }
        if (m.post) h += btn('post:' + m.id + ':', '<span>Rest in the house<small>its post is left empty</small></span><span></span>', { cls: 'deliver calmrow' });
        h += '</div><h4>LET IT GO</h4><p class="hint">It leaves for good. Its level, rank and traits are lost and nothing is refunded.</p>' + btn('dismiss:' + m.id, 'DISMISS ' + esc(m.name).toUpperCase(), { cls: 'danger wide' }) + '</div>';
      }
      h += '</div>';
    }
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
    title(name, ui) {
      if (name === 'tree') return ui.tree === 'colony' ? 'COLONY' : B.skills[ui.tree].name.toUpperCase() + ' UPGRADES';
      return { cheese: 'CHEESERY', stock: 'PANTRY', mice: 'MICE', options: 'MENU', dev: 'PLAYTEST TOOLS' }[name];
    },
    render(name, s, ui) {
      return { tree: treePanel, cheese: cheesePanel, stock: stockPanel, mice: micePanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
