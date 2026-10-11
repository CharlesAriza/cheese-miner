// Paneles de la interfaz. Cada función devuelve HTML a partir del estado;
// los botones llevan data-act y main.js los traduce en acciones reales.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const I = CM.icons;

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const secs = (ms) => (Math.round(ms / 100) / 10).toString().replace(/\.0$/, '') + 's';
  const coin = (n) => '<span class="coin-txt">' + I.img('coin') + CM.fmt(n) + '</span>';
  const cost = (n) => (n > 0 ? coin(n) : 'FREE');
  const btn = (act, label, opts) => {
    const o = opts || {};
    // data-cost permite pintar en el botón cuánto falta para poder pagarlo.
    return '<button data-act="' + act + '"' + (o.cost ? ' data-cost="' + o.cost + '"' : '') + ' class="' + (o.cls || '') + (o.off ? ' off' : '') + '">' + label + '</button>';
  };
  const row = (title, sub, right, cls) =>
    '<div class="rowc ' + (cls || '') + '"><div class="info"><b>' + title + '</b><small>' + sub + '</small></div><div class="side">' + right + '</div></div>';

  // Explicación legible de por qué algo no se puede hacer.
  CM.REASONS = {
    'vein-exposed': 'Vein exposed: use the DRILL',
    depleted: 'This zone is exhausted. Open COLONY to travel',
    'no-vein': 'No vein exposed: mine the rock first',
    'not-built': 'Build it first',
    'storage-full': 'Storage is full',
    'no-raw': 'Not enough Raw Cheese (need ' + B.refinery.rawPerBase + ')',
    'no-base': 'Not enough Cheese Base',
    'no-coins': 'Not enough coins',
    locked: 'Not unlocked yet',
    'already-built': 'Already built',
    'max-level': 'Already at max level',
    'no-house': 'Build the Mouse House first (COLONY)',
    'no-beds': 'No free beds: upgrade the Mouse House (COLONY)',
    'role-full': 'No more workers of that role in the alpha',
    busy: 'The Cheesery is busy',
    known: 'That recipe is already in your Recipe Book',
    'base-locked': 'You have not opened that zone yet',
    'no-lots': 'Not enough of that cheese',
    'no-match': 'That cheese does not meet the order',
    'order-gone': 'That customer already left',
    'not-in-alpha': 'Not available in the alpha',
    'empty-name': 'Type a name first',
    idle: 'Nothing is being made',
  };

  // Texto y tono del estado de un trabajador.
  function workerStatus(role, st) {
    const map = {
      active: ['Working', 'good'],
      'vein-exposed': ['Waiting: vein exposed', 'warn'],
      'waiting-vein': ['Waiting for a vein', 'warn'],
      'no-material': [role === 'cheesemaker' ? 'No Cheese Base' : 'No Raw Cheese', 'warn'],
      'no-recipe': ['No recipe assigned', 'bad'],
      'no-coins': ['No coins for the ingredient', 'bad'],
      'storage-full': ['Storage full', 'bad'],
      'no-work': ['No work', 'bad'],
      none: ['Not hired', 'dim'],
    };
    return map[st] || map.none;
  }

  function upgradeBtn(s, id) {
    const u = CM.construction.upgradeInfo(s, id);
    if (u.maxed) return '<span class="tag">MAX</span>';
    return btn('upgrade:' + id, 'UPGRADE<br>' + coin(u.cost), { off: !u.canUpgrade, cls: 'buy', cost: u.cost });
  }

  // ---------- COLONY: zonas, almacén, casa y trabajadores ----------
  function colonyPanel(s) {
    let h = '<h3>ZONES</h3><p class="hint">Each zone is a rock with its own cheese. Your colony and stock travel with you.</p>';
    for (const def of B.deposits) {
      const d = s.deposits[def.id];
      const phase = q.depPhase(s, def.id);
      const icon = I.img('raw', def.base, 'big');
      const done = Math.min(d.veinIndex + (d.veinRevealed ? 1 : 0), def.veins.length);
      if (def.inAlpha === false) {
        h += '<div class="zone locked">' + icon + '<div class="info"><b>' + def.name + '</b><small>Coming after the alpha</small></div><div class="side"><span class="tag lock">SOON</span></div></div>';
      } else if (!d.unlocked) {
        const c = CM.deposits.unlockCost(s, def.id);
        const total = def.veins.reduce((a, v) => a + v.capacity, 0);
        h += '<div class="zone">' + icon + '<div class="info"><b>' + def.name + '</b><small>New cheese: ' + B.bases[def.base].name + ' · ' + def.veins.length + ' veins · ' + total + ' Raw · new recipes</small></div><div class="side">' + btn('unlock:' + def.id, 'OPEN ZONE<br>' + cost(c), { off: s.coins < c, cls: 'buy', cost: c }) + '</div></div>';
      } else {
        const here = s.activeDeposit === def.id;
        const text = phase === 'depleted' ? 'Exhausted' : phase === 'vein_revealed' ? d.veinRemaining + ' Raw left in this vein' : 'Searching ' + d.discover + '/' + q.veinDef(s, def.id).hits;
        const right = here ? '<span class="tag here">YOU ARE<br>HERE</span>' : phase === 'depleted' ? '<span class="tag lock">EMPTY</span>' : btn('switch:' + def.id, 'TRAVEL', { cls: 'buy' });
        h += '<div class="zone' + (here ? ' active' : '') + (phase === 'depleted' ? ' locked' : '') + '">' + icon + '<div class="info"><b>' + def.name + '</b><small>Vein ' + done + '/' + def.veins.length + ' · ' + text + '</small></div><div class="side">' + right + '</div></div>';
      }
    }

    h += '<h3>STORAGE</h3>';
    const caps = q.caps(s);
    const capLine = 'Raw ' + q.rawTotal(s) + '/' + caps.raw + ' · Base ' + q.baseTotal(s) + '/' + caps.base + ' · Cheese ' + q.lotsTotal(s) + '/' + caps.lots;
    if (s.built.storage) h += row('Storage LV ' + (s.levels.storage + 1), capLine, upgradeBtn(s, 'storage'));
    else {
      const info = CM.construction.buildInfo(s, 'storage');
      h += row('Storage', capLine + '<br>Building it more than doubles every limit', btn('build:storage', 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy', cost: info.cost }));
    }

    h += '<h3>MOUSE HOUSE &amp; WORKERS</h3>';
    if (!s.built.house) {
      const info = CM.construction.buildInfo(s, 'house');
      h += '<p class="hint">Workers keep a stage running with no taps, even while you are away. They need beds.</p>';
      h += row('Mouse House', '2 beds for workers', btn('build:house', 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy', cost: info.cost }));
    } else {
      h += row('Mouse House LV ' + (s.levels.house + 1), 'Beds ' + q.workersTotal(s) + '/' + q.slots(s), upgradeBtn(s, 'house'));
    }
    for (const role of CM.workers.roles) {
      const def = B.workers[role];
      const info = CM.workers.hireInfo(s, role);
      const st = workerStatus(role, CM.workers.status(s, role));
      const right = info.maxed ? '<span class="tag">HIRED</span>' : btn('hire:' + role, 'HIRE<br>' + coin(info.cost), { off: !info.canHire, cls: 'buy', cost: s.built.house && !info.full ? info.cost : 0 });
      h += row(def.name + ' ' + s.workers[role] + '/' + def.max, def.does + '<br><span class="st ' + st[1] + '">' + st[0] + '</span>', right, s.built.house ? '' : 'locked');
    }
    return h;
  }

  const statLine = (st) =>
    '<span class="stat t">Taste ' + st.taste + '</span><span class="stat f">Funk ' + st.funk + '</span><span class="stat a">Aroma ' + st.aroma + '</span><span class="stat v">Value ' + st.value + '</span>';

  function comboLine(combo) {
    return [B.bases[combo.base].name, B.ingredients[combo.ingredient].name, B.treatments[combo.treatment].name, B.maturations[combo.maturation].name].join(' + ');
  }

  // ---------- CHEESERY ----------
  function cheesePanel(s, ui) {
    const C = CM.cheesery;
    const job = s.jobs.cheesery;
    const hasCook = s.workers.cheesemaker > 0;
    let h = '';
    if (job) {
      const r = job.recipeId ? C.recipe(s, job.recipeId) : null;
      const label = job.kind === 'experiment' && !r ? 'Experimenting...' : 'Making ' + esc(r ? r.name : 'cheese') + (job.lotsLeft > 1 ? ' (' + job.lotsLeft + ' left)' : '');
      h += '<div class="jobbar"><span>' + label + '</span><div class="bar"><i data-job="cheesery"></i></div>' + btn('cheeseTap', 'SPEED UP', { cls: 'buy' }) + '</div>';
    }
    h += '<p class="hint stock">' + C.unlockedBases(s).map((b) => I.img('base', b) + B.bases[b].name + ' Base ' + s.inv.base[b]).join(' &nbsp; ') + ' &nbsp; ' + I.img('lot', 'cheddar') + 'Cheese ' + q.lotsTotal(s) + '/' + q.caps(s).lots + '</p>';
    h += '<div class="tabs">' + btn('tab:experiment', 'EXPERIMENT', { cls: ui.cheeseTab === 'experiment' ? 'on' : '' }) + btn('tab:book', 'RECIPE BOOK ' + s.recipes.length, { cls: ui.cheeseTab === 'book' ? 'on' : '' }) + '</div>';

    if (ui.cheeseTab === 'experiment') {
      const combo = ui.combo;
      if (C.unlockedBases(s).indexOf(combo.base) < 0) combo.base = C.unlockedBases(s)[0];
      const groups = [
        ['base', '1 · BASE', C.unlockedBases(s).map((k) => [k, I.img('base', k) + B.bases[k].name, 'have ' + s.inv.base[k]])],
        ['ingredient', '2 · INGREDIENT', Object.keys(B.ingredients).map((k) => [k, B.ingredients[k].name, B.ingredients[k].coinCost ? B.ingredients[k].coinCost + ' coins' : 'free'])],
        ['treatment', '3 · TREATMENT', Object.keys(B.treatments).map((k) => [k, B.treatments[k].name, B.treatments[k].timeMs ? '+' + secs(B.treatments[k].timeMs) : 'quick'])],
        ['maturation', '4 · MATURATION', Object.keys(B.maturations).map((k) => [k, B.maturations[k].name, B.maturations[k].timeMs ? '+' + secs(B.maturations[k].timeMs) + ', worth more' : 'quick'])],
      ];
      for (const g of groups) {
        h += '<div class="pick"><span>' + g[1] + '</span><div>';
        for (const o of g[2]) h += btn('pick:' + g[0] + ':' + o[0], o[1] + '<small>' + o[2] + '</small>', { cls: 'chip' + (combo[g[0]] === o[0] ? ' on' : '') });
        h += '</div></div>';
      }
      const known = C.recipeByKey(s, C.keyOf(combo));
      const coins = B.ingredients[combo.ingredient].coinCost;
      if (known) {
        h += '<div class="result">' + I.img('lot', combo.base, 'big') + '<div><b>' + esc(known.name) + '</b><div>' + statLine(C.statsOf(known)) + '</div><small>Already in your Recipe Book</small></div></div>';
      } else {
        const can = !job && s.inv.base[combo.base] >= B.cheesery.experimentBase && s.coins >= coins && q.lotsSpace(s) >= 1;
        h += '<div class="result"><div><b>Unknown cheese</b><div><span class="stat">Taste ?</span><span class="stat">Funk ?</span><span class="stat">Aroma ?</span><span class="stat">Value ?</span></div><small>Costs ' + B.cheesery.experimentBase + ' ' + B.bases[combo.base].name + ' Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + secs(C.jobTime(s, combo, null)) + ' · gives the recipe and 1 cheese</small></div></div>';
        h += btn('experiment', 'EXPERIMENT', { off: !can, cls: 'buy wide' });
      }
      return h;
    }

    if (!s.recipes.length) return h + '<p class="hint">No recipes yet. Try a combination in EXPERIMENT.</p>';
    if (hasCook) h += '<p class="hint">Your Cheesemaker cooks one recipe non-stop. Pick which with COOK THIS.</p>';
    else h += '<p class="hint">Tip: hire a Cheesemaker (COLONY) to cook a recipe automatically.</p>';
    for (const r of s.recipes) {
      const combo = C.parseKey(r.key);
      const st = C.statsOf(r);
      const coins = B.ingredients[combo.ingredient].coinCost;
      const max = Math.max(0, Math.min(B.cheesery.maxQueue, Math.floor(s.inv.base[combo.base] / B.cheesery.lotBase), q.lotsSpace(s), coins ? Math.floor(s.coins / coins) : 99));
      const cooking = hasCook && s.cookRecipe === r.id;
      const made = r.made || 0;
      const nextAt = B.cheesery.masteryAt[st.mastery];
      h +=
        '<div class="recipe' + (cooking ? ' cooking' : '') + '"><div class="rhead">' + I.img('lot', combo.base, 'big') + '<b>' + esc(r.name) + '</b>' + btn('rename:' + r.id, 'RENAME', { cls: 'mini' }) + '</div><small>' + comboLine(combo) + (st.synergies.length ? ' · Synergy: ' + st.synergies.join(', ') : '') + '</small><div>' + statLine(st) +
        '</div><small class="mastery">Mastery LV ' + st.mastery + (nextAt ? ' · ' + made + '/' + nextAt + ' made for the next level (more value, faster)' : ' · MAX') + '</small><div class="rfoot"><span>In stock: ' + (s.lots[r.id] || 0) + ' · ' + B.cheesery.lotBase + ' Base' + (coins ? ' + ' + coins + 'c' : '') + ' each · ' + secs(C.jobTime(s, combo, r)) + '</span><span>' +
        btn('make:' + r.id + ':1', 'MAKE 1', { off: job || max < 1, cls: 'buy' }) + btn('make:' + r.id + ':' + Math.max(1, max), 'MAKE ' + (max > 1 ? max : 'MAX'), { off: job || max < 2, cls: 'buy' }) + '</span></div>' +
        (hasCook ? btn(cooking ? 'cook:' : 'cook:' + r.id, cooking ? 'COOKING THIS · TAP TO STOP' : 'COOK THIS', { cls: 'wide ' + (cooking ? 'on' : '') }) : '') + '</div>';
    }
    return h;
  }

  // ---------- MARKET ----------
  function wants(order) {
    const out = [];
    const req = order.req;
    const names = { taste: 'Taste', funk: 'Funk', aroma: 'Aroma', value: 'Value' };
    for (const k of CM.merchant.STATS) if (req[k] !== undefined) out.push('<span class="stat ' + k[0] + '">' + names[k] + ' ' + req[k] + '+</span>');
    if (req.maturation) out.push('<span class="stat">' + B.maturations[req.maturation].name + ' only</span>');
    const buyer = B.merchant.buyers[order.buyer];
    if (buyer.bonus) out.push('<span class="stat">Any cheese · pays more for ' + names[buyer.bonus.stat] + ' ' + buyer.bonus.min + '+</span>');
    return out.join('');
  }

  function marketPanel(s, ui) {
    const M = B.merchant;
    const rep = CM.merchant.repProgress(s);
    const nextBuyer = Object.keys(M.buyers).find((id) => M.buyers[id].unlockRep === rep.level + 1);
    let h =
      '<div class="rep"><div class="rhead"><b>Reputation LV ' + rep.level + '</b><span>' + (rep.maxed ? 'MAX' : rep.cur + '/' + rep.need) + '</span></div><div class="bar"><i style="width:' + Math.round((rep.cur / rep.need) * 100) + '%"></i></div><small>Prices +' + Math.round(M.repPricePerLevel * (rep.level - 1) * 100) + '%' +
      (nextBuyer ? ' · LV ' + (rep.level + 1) + ' brings the ' + M.buyers[nextBuyer].name : '') + ' · fair deals and discounts build reputation fastest</small></div>';
    const ready = s.orders.filter((o) => o && o.id && CM.merchant.bestFor(s, o)).length;
    h += btn('serveAll', ready ? 'SERVE ALL AT FAIR PRICE (' + ready + ')' : 'NO ONE YOU CAN SERVE YET', { off: !ready, cls: 'buy wide serveall' });
    for (let i = 0; i < M.slots; i++) {
      const order = s.orders[i];
      if (!order || !order.id) {
        h += '<div class="order wait">Next customer in ' + Math.ceil(((order && order.cooldown) || 0) / 1000) + 's</div>';
        continue;
      }
      const buyer = M.buyers[order.buyer];
      h += '<div class="order"><div class="rhead"><img class="pix face" alt="" src="' + CM.mouseUrl(order.buyer) + '"><b>' + buyer.name + ' · wants ' + order.qty + ' cheese' + (order.qty > 1 ? 's' : '') + '</b>' + btn('decline:' + order.id, 'SEND AWAY', { cls: 'mini' }) + '</div><div class="bar pat"><i data-patience="' + order.id + '"></i></div><small>' + buyer.blurb + '</small><div>' + wants(order) + '</div>';
      const stocked = s.recipes
        .filter((r) => (s.lots[r.id] || 0) > 0)
        .map((r) => ({ r, ok: CM.merchant.matches(order, r), enough: s.lots[r.id] >= order.qty, quote: CM.merchant.quote(s, order, r, 'fair') }))
        .sort((a, b) => (b.ok && b.enough ? b.quote.total : -1) - (a.ok && a.enough ? a.quote.total : -1));
      if (!stocked.length) h += '<small class="none">You have no cheese to sell. Make some in the Cheesery.</small>';
      stocked.forEach((x, n) => {
        const good = x.ok && x.enough;
        const base = CM.cheesery.parseKey(x.r.key).base;
        const open = good && ui.offer && ui.offer.order === order.id && ui.offer.recipe === x.r.id;
        const why = !x.ok ? 'does not match' : !x.enough ? 'need ' + order.qty : open ? 'pick a price' : coin(x.quote.total) + (x.quote.bonus ? ' loves it!' : '');
        h += btn('offer:' + order.id + ':' + x.r.id, '<span>' + I.img('lot', base) + esc(x.r.name) + ' x' + s.lots[x.r.id] + (good && n === 0 && stocked.length > 1 ? ' · BEST' : '') + '</span><span>' + why + '</span>', { off: !good, cls: 'deliver' + (open ? ' open' : '') });
        if (!open) return;
        // Regateo: cuatro precios, con la probabilidad de que acepte a la vista.
        h += '<div class="haggle">';
        for (const id of Object.keys(M.stances)) {
          const qt = CM.merchant.quote(s, order, x.r, id);
          const pct = Math.round(qt.chance * 100);
          h += btn('sell:' + order.id + ':' + x.r.id + ':' + id, M.stances[id].label + '<br>' + coin(qt.total) + '<small>' + (pct >= 100 ? 'always says yes' : pct + '% says yes') + ' · +' + M.stances[id].rep * order.qty + ' rep</small>', { cls: 'stance ' + id });
        }
        h += '</div><small class="none">If they say no, they leave. You keep the cheese.</small>';
      });
      h += '</div>';
    }
    return h;
  }

  function optionsPanel(s) {
    return (
      row('Sound', 'Synth effects', btn('sound', CM.sfx.isMuted() ? 'OFF' : 'ON', { cls: 'buy' })) +
      row('Export save', 'Save + metrics + events as JSON', btn('export', 'EXPORT', { cls: 'buy' })) +
      row('Import save', 'Paste an exported JSON', btn('import', 'IMPORT', { cls: 'buy' })) +
      row('Playtest tools', 'Dev menu: marks the session as assisted', btn('open:dev', 'OPEN', { cls: 'buy' })) +
      row('Reset save', 'Start over from zero', btn('reset', 'RESET', { cls: 'danger' })) +
      '<p class="hint">Played ' + Math.floor(s.clock / 60000) + ' min' + (s.devUsed ? ' · dev tools used' : '') + '. Data never leaves this browser.</p>'
    );
  }

  function devPanel() {
    const D = CM.dev;
    const g = (items) => '<div class="devgrid">' + items.map((i) => btn('dev:' + i[0], i[1], { cls: 'chip' + (i[2] ? ' on' : '') })).join('') + '</div>';
    return (
      '<h3>TIME</h3>' + g([['speed:1', 'x1', D.speed === 1], ['speed:2', 'x2', D.speed === 2], ['speed:10', 'x10', D.speed === 10], ['pause', D.paused ? 'RESUME' : 'PAUSE', D.paused]]) +
      '<h3>GIVE</h3>' + g([['coins', '+200 coins'], ['raw', '+10 raw'], ['base', '+10 base'], ['reveal', 'reveal vein']]) +
      '<h3>UNLOCK</h3>' + g([['buildings', 'all buildings'], ['deposits', 'all zones'], ['hire', 'hire all'], ['lvl:drill', 'drill +1'], ['lvl:refinery', 'refinery +1'], ['lvl:pickaxe', 'pickaxe +1'], ['lvl:storage', 'storage +1']]) +
      '<h3>FORCE</h3>' + g([['full', 'storage full'], ['veinout', 'vein depleted'], ['noraw', 'no raw']]) +
      '<h3>SCENARIO</h3>' + g([['scn:chain', 'chain ready'], ['scn:colony', 'colony + coins'], ['scn:fresh', 'new game']]) +
      '<h3>REPORT</h3><pre class="report" id="dev-report"></pre>' + btn('export', 'EXPORT JSON', { cls: 'buy wide' })
    );
  }

  CM.panels = {
    esc,
    secs,
    coin,
    cost,
    btn,
    statLine,
    comboLine,
    workerStatus,
    TITLES: { colony: 'COLONY', cheese: 'CHEESERY', market: 'CHEESE SHOP', options: 'OPTIONS', dev: 'PLAYTEST TOOLS' },
    render(name, s, ui) {
      return { colony: colonyPanel, cheese: cheesePanel, market: marketPanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
