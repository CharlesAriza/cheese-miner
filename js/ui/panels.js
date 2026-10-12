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
  // Cada tipo, un color y una marca: verde bueno, rojo manía, azul oficio, dorado legendario.
  const KIND_MARK = { good: '&#9650; ', quirk: '&#9660; ', job: '', legend: '&#9733; ' };
  const traitChip = (id, grade) => '<span class="stat ' + KIND_CLS[T[id].kind] + '">' + KIND_MARK[T[id].kind] + T[id].name + (grade && T[id].job ? ' ' + ROMAN[grade] : '') + '</span>';
  // Descripción de un rasgo: lo malo en rojo. En los mixtos («..., but ...») se marca la parte contraria.
  function traitDesc(id) {
    const def = T[id];
    const parts = def.desc.split(', but ');
    if (def.kind === 'quirk') return '<span class="tbad">' + parts[0] + '</span>' + (parts[1] ? ', but <span class="tok">' + parts[1] + '</span>' : '');
    return parts[0] + (parts[1] ? ', but <span class="tbad">' + parts[1] + '</span>' : '');
  }
  const rareChip = (m) => (m.rarity ? '<span class="stat rare' + m.rarity + '">' + RARITY[m.rarity].name.toUpperCase() + '</span>' : '');
  const affChips = (m) =>
    CM.mice.CHAIN.filter((k) => m.aff && m.aff[k])
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
    const every = (ms) => ' every ' + secs(Math.max(200, ms / sp));
    if (skill === 'mining') return (y === 1 ? 'a swing' : 'a x' + round1(y) + ' swing') + every(q.minerInterval(s));
    if (skill === 'drilling') return round1(q.drillYield(s, zone) * y) + ' Raw' + every(q.drillDuration(s));
    if (skill === 'refining') return round1(q.refineBatch(s) * q.refineMult(s) * y) + ' Base' + every(q.refineDuration(s));
    if (skill === 'trading') return (y === 1 ? 'a sale' : 'a x' + (Math.round(y * 100) / 100) + ' sale') + every(q.sellDuration(s));
    const recipe = CM.cheesery.laneRecipe(s, zone);
    const n = y === 1 ? 'a cheese' : round1(y) + ' cheese';
    return recipe ? n + every(CM.cheesery.jobTime(s, CM.cheesery.parseKey(recipe.key), recipe)) : 'cooks ' + times(sp) + ' as fast as by hand';
  }
  // Lista de todo lo que hace especial a un ratón, explicado.
  function traitList(m) {
    const K = CM.mice;
    let h = '<ul class="traits">';
    if (m.rarity) h += '<li>' + rareChip(m) + Math.round(RARITY[m.rarity].bonus * 100) + '% faster at any job</li>';
    for (const t of K.traitsOf(m)) {
      const def = T[t.id];
      h += '<li>' + traitChip(t.id, t.grade) + traitDesc(t.id) + (def.job ? '. Only counts at ' + B.skills[def.job].name + (t.grade > 1 ? ', ' + times(M.gradeMult[t.grade - 1]) + ' as strong as grade I' : '') : '') + '</li>';
    }
    for (const c of K.combosOf(m)) h += '<li><span class="stat tcombo">COMBO · ' + c.name + '</span>' + c.desc + '</li>';
    // Afinidades, en una sola línea: corazones junto a cada oficio que le gusta.
    const likes = K.CHAIN.filter((k) => m.aff && m.aff[k]).sort((a, b) => m.aff[b] - m.aff[a]);
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
    if (offer.kind === 'level') h += btn('trait:' + m.id + ':mystery', '<span><span class="stat tmyst">? MYSTERY TRAIT</span><small>Any trait in the game. It could be a legendary... <span class="tbad">or a quirk</span>.</small></span>', { cls: 'opt tmyst' });
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

  // ---------- La colonia dibujada: cada roca, su línea de puestos ----------
  const POST_NAME = { mining: 'MINE', drilling: 'DRILL', refining: 'REFINE', cheesemaking: 'CHEESE', trading: 'SELL' };
  const hearts = (a) => (a ? '<i class="hrt">' + (a === 2 ? '&#9829;&#9829;' : '&#9829;') + '</i>' : '');
  // Lo único que se avisa bajo el nombre: un rasgo por elegir o un ascenso que ya se puede pagar.
  const todo = (s, m) => (m.offer ? '<small class="todo">NEW TRAIT</small>' : CM.mice.promoteInfo(s, m).can ? '<small class="todo up">PROMOTE</small>' : '');
  // Un puesto: quién está, o hueco. Con un ratón seleccionado, cada puesto es un destino.
  function postCell(s, ui, skill, zone) {
    const K = CM.mice;
    const m = K.at(s, skill, zone);
    const sel = ui.sel ? K.byId(s, ui.sel) : null;
    // Un toque abre la ficha. Solo al mover (desde la ficha) los puestos pasan a ser destinos.
    let act = m ? 'card:' + m.id : 'emptypost';
    let cls = 'pcell' + (m ? '' : ' none') + (m && !sel && m.offer ? ' has' : m && !sel && K.promoteInfo(s, m).can ? ' has up' : '');
    if (sel && sel === m) {
      act = 'unsel';
      cls += ' sel';
    } else if (sel) {
      act = 'post:' + sel.id + ':' + K.postKey(skill, zone);
      cls += ' target';
    }
    let body = m ? face(m) + '<b>' + esc(m.name) + '</b>' : '<span class="hole">+</span>';
    // Cómo le iría ahí al ratón seleccionado; si no hay selección, lo que tenga pendiente.
    if (sel && sel !== m) body += '<em>' + times(K.score(sel, skill)) + hearts(sel.aff[skill]) + '</em>';
    else if (m) body += todo(s, m);
    return '<button data-act="' + act + '" class="' + cls + '">' + body + '</button>';
  }
  const comboNote = (c, what) => '<p class="cnote"><b>' + c.name + '</b>' + (what ? ' · ' + what : '') + ': ' + c.desc.charAt(0).toLowerCase() + c.desc.slice(1) + '</p>';

  function linesView(s, ui) {
    const K = CM.mice;
    const cols = K.CHAIN.slice(0, 4);
    let h = '<div class="colony"><div class="crow head"><span></span>' + cols.map((k) => '<span>' + POST_NAME[k] + '</span>').join('') + '</div>';
    for (const z of q.openZones(s)) {
      // Una misma combinación entre varios vecinos seguidos se cuenta una vez, con todos los implicados.
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
    // La casa: los que no tienen puesto.
    const home = s.mice.filter((m) => !m.post);
    const sel = ui.sel ? K.byId(s, ui.sel) : null;
    if (home.length || (sel && sel.post)) {
      h += '<div class="crow"><span class="rock"><small>House</small></span>';
      for (const m of home) h += '<button data-act="' + (sel === m ? 'unsel' : sel ? 'noop' : 'card:' + m.id) + '" class="pcell' + (sel === m ? ' sel' : !sel && m.offer ? ' has' : !sel && K.promoteInfo(s, m).can ? ' has up' : '') + '">' + face(m) + '<b>' + esc(m.name) + '</b>' + (sel ? '' : todo(s, m)) + '</button>';
      if (sel && sel.post) h += '<button data-act="post:' + sel.id + ':" class="pcell none target"><span class="hole">z</span><em>rest</em></button>';
      h += '</div>';
    }
    return h + '</div>';
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
    for (const k of K.CHAIN) {
      const id = m.spec[k];
      const grade = K.gradeOf(m, k);
      const n = m.jobs[k] || 0;
      const next = M.jobGrades[id ? grade : 0];
      const what = id ? traitChip(id, grade) + '<small>' + T[id].desc + (next ? ' · ' + whole(n) + '/' + CM.fmt(next) + ' to ' + ROMAN[grade + 1] : '') + '</small>' : '<small>' + (n >= M.jobGrades[0] ? 'speciality ready to pick' : whole(n) + '/' + M.jobGrades[0] + ' jobs to a speciality') + '</small>';
      h += '<div class="' + (k === skill ? 'here' : '') + '"><b>' + B.skills[k].name + hearts(m.aff[k]) + '</b><span>' + what + '</span></div>';
    }
    h += '</div><p class="hint">&#9829; likes the job, &#9829;&#9829; loves it: a bit faster there, and it specialises sooner.</p>';

    if (skill) {
      const t = K.team(s, skill, zone);
      t.links.forEach((l) => (h += comboNote(l, 'with a neighbour')));
      t.sets.forEach((d) => (h += comboNote(d, 'whole rock')));
    }
    h += '<h4>RANK</h4>' + promoteBlock(s, m);
    h += '<div class="tabs">' + btn('movefrom:' + m.id, 'MOVE', { cls: 'buy' }) + btn('dismiss:' + m.id, 'DISMISS', { cls: 'close' }) + '</div>';
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
      s.candidates.forEach((c, i) => {
        const as = K.normalize(Object.assign({ xp: 0, rank: 0 }, c));
        h +=
          '<div class="mouse cand"><div class="mhead">' + face(as) + '<div class="info"><b>' + esc(c.name) + '</b>' + traitList(as) + '</div></div>' +
          '<div class="mfoot"><small class="mjob">' + (dest ? 'There: <b>' + mouseRate(s, as, dest.skill, dest.zone) + '</b>' + (as.aff[dest.skill] ? ' · ' + M.affinity[as.aff[dest.skill]].name.toLowerCase() + ' it' : '') : 'Waits in the house') + '</small>' + btn('choose:' + i, 'CHOOSE', { cls: 'buy' }) + '</div></div>';
      });
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

    // Barra del ratón seleccionado, o una sola línea de ayuda.
    const sel = ui.sel ? K.byId(s, ui.sel) : null;
    if (sel) h += '<div class="selbar"><div><b>MOVING ' + esc(sel.name).toUpperCase() + '</b><small>Tap the post where it should work. The number is how it would do there.</small></div>' + btn('unsel', 'CANCEL', { cls: 'close' }) + '</div>';
    else {
      // Lo pendiente, arriba del todo y resaltado: se resuelve aquí mismo, de un toque.
      for (const m of s.mice.filter((x) => x.offer)) h += '<div class="due"><div class="who">' + face(m) + '<div><b>' + esc(m.name) + '</b><small>' + (m.post ? K.postLabel(m.post) : 'in the house') + ' · LV ' + K.level(m) + '</small></div></div>' + pickBox(s, m) + '</div>';
      for (const m of s.mice.filter((x) => !x.offer && K.promoteInfo(s, x).can)) {
        const pr = K.promoteInfo(s, m);
        const [skill, zone] = m.post ? m.post.split(':') : [];
        const next = Object.assign({}, m, { rank: m.rank + 1 });
        h += '<div class="due promo">' + face(m) + '<div><b>' + esc(m.name) + ' can be a ' + pr.next.name + '</b>' + (skill ? mouseRate(s, m, skill, zone) + ' &gt; <span class="tok">' + mouseRate(s, next, skill, zone) + '</span>' : 'Works faster for good') + '</div>' + btn('promote:' + m.id, 'PROMOTE<br>' + coin(pr.cost), { cls: 'buy' }) + '</div>';
      }
      if (s.mice.length) h += '<p class="hint">Tap a mouse to open it.</p>';
    }

    h += linesView(s, ui);

    const cost = K.recruitCost(s);
    h += btn('recruit', 'RECRUIT A MOUSE · ' + coin(cost) + (free.length ? '' : '<br><small>Every post is taken: it would wait in the house</small>'), { off: s.coins < cost, cls: 'buy wide serveall', cost });
    if (!s.mice.length) return h + '<p class="hint">Your first recruit takes over a stage so you do not have to tap it.</p>';
    const moves = s.mice.length > 1 ? K.bestFitMoves(s) : 0;
    h += '<div class="tabs">' + btn('bestfit', 'BEST FIT' + (moves ? '' : ' &#10003;'), { cls: 'close', off: !moves }) + btn('album', 'ALBUM ' + K.albumCount(s) + '/' + K.albumTotal, { cls: 'close' }) + '</div>';
    h += '<p class="hint">Best fit places each mouse where it works best on its own. Combos between mice are yours to find.</p>';
    if (s.mice.some((m) => M.ranks[m.rank].manager)) h += row('Managers buy upgrades', 'They buy the cheapest upgrade of their job on their own', btn('managers', s.settings.managersBuy ? 'ON' : 'OFF', { cls: 'buy' }));
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
