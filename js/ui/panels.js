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
    'storage-full': 'Storage is full. Upgrade it in COLONY',
    'no-raw': 'Not enough Raw Cheese (need ' + B.refinery.rawPerBase + ')',
    'no-base': 'Not enough Cheese Base',
    'no-cheese': 'No cheese to sell. Make some in the Cheesery',
    'no-coins': 'Not enough coins',
    'level-locked': 'Your skill level is too low for that',
    'part-locked': 'You have not unlocked that ingredient yet',
    locked: 'Not unlocked yet',
    'already-built': 'Already built',
    'max-level': 'Already at max rank',
    busy: 'The Cheesery is busy',
    known: 'That recipe is already in your Recipe Book',
    'empty-name': 'Type a name first',
    idle: 'Nothing is being made',
  };

  // Efecto actual y siguiente de un nudo, en texto corto.
  const PCT = { critMult: 0, pickPower: 0, miners: 0, drillYield: 0, refBatch: 0, sellCount: 0, offlineHours: 0, drillAuto: 0, refAuto: 0, cheeseAuto: 0, sellAuto: 0 };
  function effectText(node, rank) {
    const key = Object.keys(node.eff)[0];
    const per = node.eff[key];
    if (node.max === 1) return rank ? 'Working for you' : 'Not hired yet';
    const show = (r) => (key in PCT ? '+' + Math.round(per * r * 10) / 10 : '+' + Math.round(per * r * 100) + '%');
    return rank >= node.max ? show(rank) : show(rank) + ' > ' + show(rank + 1);
  }

  const BRANCHES = [
    ['power', 'POWER', 'More output. Each rank changes how the building looks'],
    ['auto', 'MICE', 'Mice that do the work for you, even while you are away'],
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
      h += '<h3>' + (skill === 'colony' && br[0] === 'power' ? 'STORAGE' : br[1]) + '</h3><p class="hint">' + (skill === 'colony' && br[0] === 'power' ? 'More room for each resource. The storage building grows with it' : br[2]) + '</p>';
      for (const node of nodes) {
        const info = CM.tree.info(s, skill, node.id);
        const title = node.name + (node.max > 1 ? ' <span class="rank">' + info.rank + '/' + node.max + '</span>' : '');
        const sub = node.desc + '<br><span class="st ' + (info.rank ? 'good' : 'dim') + '">' + effectText(node, info.rank) + '</span>';
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
    const job = s.jobs.cheesery;
    const hasCook = q.isAutomated(s, 'cheesemaking');
    const level = q.level(s, 'cheesemaking');
    let h = '';
    if (job) {
      const r = job.recipeId ? C.recipe(s, job.recipeId) : null;
      const label = job.kind === 'experiment' && !r ? 'Experimenting...' : 'Making ' + esc(r ? r.name : 'cheese') + (job.lotsLeft > 1 ? ' (' + job.lotsLeft + ' left)' : '');
      h += '<div class="jobbar"><span>' + label + '</span><div class="bar"><i data-job="cheesery"></i></div>' + btn('cheeseTap', 'SPEED UP', { cls: 'buy' }) + '</div>';
    }
    h += '<p class="hint stock">' + C.unlockedBases(s).map((b) => I.img('base', b) + B.bases[b].name + ' Base ' + s.inv.base[b]).join(' &nbsp; ') + ' &nbsp; ' + I.img('lot', 'cheddar') + 'Cheese ' + q.lotsTotal(s) + '/' + q.caps(s).lots + '</p>';
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
        const can = !job && s.inv.base[combo.base] >= B.cheesery.experimentBase && s.coins >= coins && q.lotsSpace(s) >= 1;
        const syn = C.formula(combo).synergies;
        h += '<div class="result"><div><b>Undiscovered cheese</b><small>' + (syn.length ? 'These go well together! ' : '') + 'Costs ' + B.cheesery.experimentBase + ' ' + B.bases[combo.base].name + ' Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + secs(C.jobTime(s, combo, null)) + ' · you get the recipe and 1 cheese</small></div></div>';
        h += btn('experiment', 'DISCOVER IT', { off: !can, cls: 'buy wide' });
      }
      return h + '<p class="hint">Cheesemaking LV ' + level + '. Higher levels unlock better ingredients.</p>';
    }

    if (!s.recipes.length) return h + '<p class="hint">No recipes yet. Combine four parts in NEW RECIPE.</p>';
    h += '<p class="hint">' + (hasCook ? 'Your Cheesemaker cooks one recipe non-stop. Pick it with COOK THIS.' : 'Tip: hire the Cheesemaker Mouse in the tree to cook automatically.') + '</p>';
    const sorted = s.recipes.slice().sort((a, b) => CM.cheesery.valueOf(s, b) - CM.cheesery.valueOf(s, a));
    for (const r of sorted) {
      const combo = C.parseKey(r.key);
      const coins = B.ingredients[combo.ingredient].coinCost;
      const max = C.maxLots(s, r);
      const cooking = hasCook && s.cookRecipe === r.id;
      const m = C.masteryLevel(r);
      const nextAt = B.cheesery.masteryAt[m];
      const syn = C.formula(combo).synergies;
      h +=
        '<div class="recipe' + (cooking ? ' cooking' : '') + '"><div class="rhead">' + I.img('lot', combo.base, 'big') + '<b>' + esc(r.name) + '</b>' + btn('rename:' + r.id, 'RENAME', { cls: 'mini' }) + '</div><small>' + comboLine(combo) + (syn.length ? ' · ' + syn.join(', ') : '') + '</small><div>' + valueTag(s, r) + '<span class="stat">Mastery ' + m + (nextAt ? ' · ' + (r.made || 0) + '/' + nextAt : ' MAX') + '</span></div>' +
        '<div class="rfoot"><span>Have ' + (s.lots[r.id] || 0) + ' · ' + B.cheesery.lotBase + ' Base' + (coins ? ' + ' + coins + 'c' : '') + ' each · ' + secs(C.jobTime(s, combo, r)) + '</span><span>' +
        btn('make:' + r.id + ':1', 'MAKE 1', { off: job || max < 1, cls: 'buy' }) + btn('make:' + r.id + ':' + Math.max(1, max), 'MAKE ' + (max > 1 ? max : 'MAX'), { off: job || max < 2, cls: 'buy' }) + '</span></div>' +
        (hasCook ? btn(cooking ? 'cook:' : 'cook:' + r.id, cooking ? 'COOKING THIS · TAP TO STOP' : 'COOK THIS', { cls: 'wide ' + (cooking ? 'on' : '') }) : '') + '</div>';
    }
    return h;
  }

  function optionsPanel(s) {
    return (
      row('Sound', 'Synth effects', btn('sound', CM.sfx.isMuted() ? 'OFF' : 'ON', { cls: 'buy' })) +
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
      '<h3>UNLOCK</h3>' + g([['buildings', 'all buildings'], ['zones', 'all rocks'], ['hire', 'all mice'], ['power:3', 'power +3'], ['power:10', 'power +10']]) +
      '<h3>FORCE</h3>' + g([['full', 'storage full'], ['noraw', 'no raw']]) +
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
      return { cheese: 'CHEESERY', options: 'MENU', dev: 'PLAYTEST TOOLS' }[name];
    },
    render(name, s, ui) {
      return { tree: treePanel, cheese: cheesePanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
