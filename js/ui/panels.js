// Paneles de la interfaz. Cada función devuelve HTML a partir del estado;
// los botones llevan data-act y main.js los traduce en acciones reales.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;

  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const secs = (ms) => (Math.round(ms / 100) / 10).toString().replace(/\.0$/, '') + 's';
  const coin = (n) => '<span class="coin-txt"><i class="ico coin"></i>' + n + '</span>';
  const btn = (act, label, opts) => {
    const o = opts || {};
    return '<button data-act="' + act + '" class="' + (o.cls || '') + (o.off ? ' off' : '') + '">' + label + '</button>';
  };
  const row = (title, sub, right, cls) =>
    '<div class="rowc ' + (cls || '') + '"><div class="info"><b>' + title + '</b><small>' + sub + '</small></div><div class="side">' + right + '</div></div>';
  const cost = (n) => (n > 0 ? coin(n) : 'FREE');

  // Explicación legible de por qué algo no se puede hacer.
  CM.REASONS = {
    'vein-exposed': 'Vein exposed: use the DRILL',
    depleted: 'This deposit is exhausted. Open or switch deposits in BUILD',
    'no-vein': 'No vein exposed: mine the rock first',
    'not-built': 'Build it first in BUILD',
    'storage-full': 'Storage is full',
    'no-raw': 'Not enough Raw Cheese (need ' + B.refinery.rawPerBase + ')',
    'no-base': 'Not enough Cheese Base',
    'no-coins': 'Not enough coins',
    locked: 'Not unlocked yet',
    'already-built': 'Already built',
    'max-level': 'Already at max level',
    'no-house': 'Build the Mouse House first',
    'no-beds': 'No free beds: upgrade the Mouse House',
    'role-full': 'No more workers of that role in the alpha',
    busy: 'The Cheesery is busy',
    known: 'That recipe is already in your Recipe Book',
    'base-locked': 'You have not opened that deposit yet',
    'no-lots': 'Not enough lots of that cheese',
    'no-match': 'That cheese does not meet the order',
    'order-gone': 'That order is gone',
    'not-in-alpha': 'Not available in the alpha',
    'empty-name': 'Type a name first',
    idle: 'Nothing is being made',
  };

  const STATUS = {
    active: ['Working', 'good'],
    'vein-exposed': ['Waiting: vein exposed', 'warn'],
    'waiting-vein': ['Waiting for a vein', 'warn'],
    'no-material': ['No Raw Cheese', 'warn'],
    'storage-full': ['Storage full', 'bad'],
    'no-work': ['No work', 'bad'],
    none: ['Not hired', 'dim'],
  };

  function machineLine(s, id) {
    const caps = q.caps(s);
    if (id === 'drill') return '+' + q.drillYield(s) + ' Raw / ' + secs(q.drillDuration(s));
    if (id === 'refinery') return q.refineBatch(s) * B.refinery.rawPerBase + ' Raw > ' + q.refineBatch(s) + ' Base / ' + secs(q.refineDuration(s));
    if (id === 'storage') return 'Raw ' + caps.raw + ' · Base ' + caps.base + ' · Lots ' + caps.lots;
    if (id === 'house') return q.slots(s) + ' beds';
    if (id === 'cheesery') return 'Discover recipes, make lots';
    if (id === 'market') return 'Sell lots to buyers';
    return '';
  }
  const PITCH = {
    drill: 'Extracts Raw Cheese from an exposed vein',
    refinery: 'Turns Raw Cheese into Cheese Base',
    cheesery: 'Turns Cheese Base into cheese lots',
    market: 'Sells lots for coins',
    storage: 'More room for Raw, Base and lots',
    house: 'Beds for workers that automate stages',
  };

  function upgradeBtn(s, id) {
    const u = CM.construction.upgradeInfo(s, id);
    if (u.maxed) return '<span class="tag">MAX</span>';
    return btn('upgrade:' + id, 'UPGRADE<br>' + coin(u.cost), { off: !u.canUpgrade, cls: 'buy' });
  }

  function buildPanel(s) {
    let h = '<h3>BUILDINGS</h3>';
    for (const id of CM.construction.order) {
      const def = B.buildings[id];
      const info = CM.construction.buildInfo(s, id);
      if (info.built) {
        const lvl = B.upgrades[id] ? ' LV ' + (s.levels[id] + 1) : '';
        h += row(def.name + lvl, machineLine(s, id), B.upgrades[id] ? upgradeBtn(s, id) : '<span class="tag">BUILT</span>');
      } else if (!info.condOk) {
        h += row(def.name, PITCH[id], '<span class="tag lock">' + esc(info.condText) + '</span>', 'locked');
      } else {
        h += row(def.name, PITCH[id], btn('build:' + id, 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy' }));
      }
    }
    h += '<h3>TOOLS</h3>';
    h += row('Pickaxe LV ' + (s.levels.pickaxe + 1), 'Search power ' + q.pickPower(s) + ' per hit', upgradeBtn(s, 'pickaxe'));
    h += '<h3>DEPOSITS</h3>';
    for (const def of B.deposits) {
      const d = s.deposits[def.id];
      const phase = q.depPhase(s, def.id);
      const veins = 'Veins ' + Math.min(d.veinIndex + (d.veinRevealed ? 1 : 0), def.veins.length) + '/' + def.veins.length;
      if (def.inAlpha === false) {
        h += row(def.name, 'Not in this alpha', '<span class="tag lock">SOON</span>', 'locked');
      } else if (!d.unlocked) {
        const c = CM.deposits.unlockCost(s, def.id);
        h += row(def.name, 'New base: ' + B.bases[def.base].name + '. Bigger veins', btn('unlock:' + def.id, 'OPEN<br>' + cost(c), { off: s.coins < c, cls: 'buy' }));
      } else {
        const state = phase === 'depleted' ? 'Exhausted' : phase === 'vein_revealed' ? d.veinRemaining + ' Raw left in vein' : 'Searching ' + d.discover + '/' + q.veinDef(s, def.id).hits;
        const right = s.activeDeposit === def.id ? '<span class="tag">ACTIVE</span>' : btn('switch:' + def.id, 'GO', { cls: 'buy' });
        h += row(def.name, veins + ' · ' + state, right, phase === 'depleted' ? 'locked' : '');
      }
    }
    return h;
  }

  function workersPanel(s) {
    if (!s.built.house) {
      const info = CM.construction.buildInfo(s, 'house');
      return (
        '<p class="hint">Workers automate a stage so it keeps running without taps, even while you are away. They need beds.</p>' +
        row('Mouse House', PITCH.house, btn('build:house', 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy' }))
      );
    }
    let h = '<p class="hint">Beds ' + q.workersTotal(s) + '/' + q.slots(s) + '. Workers automate; upgrades (BUILD) make machines faster.</p>';
    for (const role of CM.workers.roles) {
      const def = B.workers[role];
      const info = CM.workers.hireInfo(s, role);
      const st = STATUS[CM.workers.status(s, role)];
      const right = info.maxed ? '<span class="tag">HIRED</span>' : btn('hire:' + role, 'HIRE<br>' + coin(info.cost), { off: !info.canHire, cls: 'buy' });
      h += row(def.name + ' ' + s.workers[role] + '/' + def.max, def.does + '<br><span class="st ' + st[1] + '">' + st[0] + '</span>', right);
    }
    h += row('Mouse House LV ' + (s.levels.house + 1), q.slots(s) + ' beds', upgradeBtn(s, 'house'));
    return h;
  }

  const statLine = (st) =>
    '<span class="stat t">Taste ' + st.taste + '</span><span class="stat f">Funk ' + st.funk + '</span><span class="stat a">Aroma ' + st.aroma + '</span><span class="stat v">Value ' + st.value + '</span>';

  function comboLine(combo) {
    return [B.bases[combo.base].name, B.ingredients[combo.ingredient].name, B.treatments[combo.treatment].name, B.maturations[combo.maturation].name].join(' + ');
  }

  function baseStock(s) {
    return CM.cheesery
      .unlockedBases(s)
      .map((b) => B.bases[b].name + ' Base ' + s.inv.base[b])
      .join(' · ');
  }

  function cheesePanel(s, ui) {
    if (!s.built.cheesery) {
      const info = CM.construction.buildInfo(s, 'cheesery');
      const right = info.condOk ? btn('build:cheesery', 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy' }) : '<span class="tag lock">' + esc(info.condText) + '</span>';
      return row('Cheesery', PITCH.cheesery, right);
    }
    const C = CM.cheesery;
    const job = s.jobs.cheesery;
    let h = '';
    if (job) {
      const r = job.recipeId ? C.recipe(s, job.recipeId) : null;
      const label = job.kind === 'experiment' && !r ? 'Experimenting...' : 'Making ' + esc(r ? r.name : 'cheese') + ' (' + job.lotsLeft + ' left)';
      h += '<div class="jobbar"><span>' + label + '</span><div class="bar"><i data-job="cheesery"></i></div>' + btn('cheeseTap', 'SPEED UP', { cls: 'buy' }) + '</div>';
    }
    h += '<p class="hint">' + baseStock(s) + ' · Lots ' + q.lotsTotal(s) + '/' + q.caps(s).lots + '</p>';
    h += '<div class="tabs">' + btn('tab:experiment', 'EXPERIMENT', { cls: ui.cheeseTab === 'experiment' ? 'on' : '' }) + btn('tab:book', 'RECIPE BOOK ' + s.recipes.length, { cls: ui.cheeseTab === 'book' ? 'on' : '' }) + '</div>';

    if (ui.cheeseTab === 'experiment') {
      const combo = ui.combo;
      if (C.unlockedBases(s).indexOf(combo.base) < 0) combo.base = C.unlockedBases(s)[0];
      const groups = [
        ['base', 'BASE', C.unlockedBases(s).map((k) => [k, B.bases[k].name, 'have ' + s.inv.base[k]])],
        ['ingredient', 'INGREDIENT', Object.keys(B.ingredients).map((k) => [k, B.ingredients[k].name, B.ingredients[k].coinCost ? B.ingredients[k].coinCost + ' coins' : 'free'])],
        ['treatment', 'TREATMENT', Object.keys(B.treatments).map((k) => [k, B.treatments[k].name, B.treatments[k].timeMs ? '+' + secs(B.treatments[k].timeMs) : 'quick'])],
        ['maturation', 'MATURATION', Object.keys(B.maturations).map((k) => [k, B.maturations[k].name, B.maturations[k].timeMs ? '+' + secs(B.maturations[k].timeMs) : 'quick'])],
      ];
      for (const g of groups) {
        h += '<div class="pick"><span>' + g[1] + '</span><div>';
        for (const o of g[2]) h += btn('pick:' + g[0] + ':' + o[0], esc(o[1]) + '<small>' + o[2] + '</small>', { cls: 'chip' + (combo[g[0]] === o[0] ? ' on' : '') });
        h += '</div></div>';
      }
      const known = C.recipeByKey(s, C.keyOf(combo));
      const coins = B.ingredients[combo.ingredient].coinCost;
      if (known) {
        h += '<div class="result"><b>' + esc(known.name) + '</b><div>' + statLine(C.statsOf(known)) + '</div><small>Already in your Recipe Book</small></div>';
      } else {
        const can = !job && s.inv.base[combo.base] >= B.cheesery.experimentBase && s.coins >= coins && q.lotsSpace(s) >= 1;
        h +=
          '<div class="result"><b>Unknown cheese</b><div><span class="stat">Taste ?</span><span class="stat">Funk ?</span><span class="stat">Aroma ?</span><span class="stat">Value ?</span></div><small>Costs ' +
          B.cheesery.experimentBase + ' ' + B.bases[combo.base].name + ' Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + secs(C.lotTime(combo)) + ' · gives the recipe and 1 lot</small></div>';
        h += btn('experiment', 'EXPERIMENT', { off: !can, cls: 'buy wide' });
      }
    } else if (!s.recipes.length) {
      h += '<p class="hint">No recipes yet. Try a combination in EXPERIMENT.</p>';
    } else {
      for (const r of s.recipes) {
        const combo = C.parseKey(r.key);
        const st = C.statsOf(r);
        const coins = B.ingredients[combo.ingredient].coinCost;
        const canMake = (n) => !job && s.inv.base[combo.base] >= B.cheesery.lotBase * n && s.coins >= coins * n && q.lotsSpace(s) >= n;
        h +=
          '<div class="recipe"><div class="rhead"><b>' + esc(r.name) + '</b>' + btn('rename:' + r.id, 'RENAME', { cls: 'mini' }) + '</div><small>' + comboLine(combo) + (st.synergies.length ? ' · Synergy: ' + st.synergies.join(', ') : '') + '</small><div>' + statLine(st) +
          '</div><div class="rfoot"><span>In stock: ' + (s.lots[r.id] || 0) + ' · ' + B.cheesery.lotBase + ' Base' + (coins ? ' + ' + coins + 'c' : '') + ' / lot · ' + secs(C.lotTime(combo)) + '</span><span>' +
          btn('make:' + r.id + ':1', 'MAKE 1', { off: !canMake(1), cls: 'buy' }) + btn('make:' + r.id + ':3', 'MAKE 3', { off: !canMake(3), cls: 'buy' }) + '</span></div></div>';
      }
    }
    return h;
  }

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

  function marketPanel(s) {
    if (!s.built.market) {
      const info = CM.construction.buildInfo(s, 'market');
      const right = info.condOk ? btn('build:market', 'BUILD<br>' + cost(info.cost), { off: !info.canBuild, cls: 'buy' }) : '<span class="tag lock">' + esc(info.condText) + '</span>';
      return row('Market', PITCH.market, right);
    }
    let h = '<p class="hint">Pick a lot that meets what each buyer wants. Better buyers show up as you sell.</p>';
    for (let i = 0; i < B.merchant.slots; i++) {
      const order = s.orders[i];
      if (!order || !order.id) {
        h += '<div class="order wait">Next customer in ' + Math.ceil(((order && order.cooldown) || 0) / 1000) + 's</div>';
        continue;
      }
      const buyer = B.merchant.buyers[order.buyer];
      h += '<div class="order"><div class="rhead"><b>' + buyer.name + ' · wants ' + order.qty + ' lot' + (order.qty > 1 ? 's' : '') + '</b>' + btn('decline:' + order.id, 'DECLINE', { cls: 'mini' }) + '</div><small>' + buyer.blurb + ' · pays x' + buyer.priceMult + '</small><div>' + wants(order) + '</div>';
      const stocked = s.recipes.filter((r) => (s.lots[r.id] || 0) > 0);
      if (!stocked.length) h += '<small class="none">You have no lots. Make cheese in CHEESE.</small>';
      for (const r of stocked) {
        const ok = CM.merchant.matches(order, r);
        const enough = s.lots[r.id] >= order.qty;
        const quote = CM.merchant.quote(order, r);
        const why = !ok ? 'does not match' : !enough ? 'need ' + order.qty : coin(quote.total) + (quote.bonus ? ' bonus!' : '');
        h += btn('deliver:' + order.id + ':' + r.id, '<span>' + esc(r.name) + ' x' + s.lots[r.id] + '</span><span>' + why + '</span>', { off: !ok || !enough, cls: 'deliver' });
      }
      h += '</div>';
    }
    return h;
  }

  function optionsPanel(s, ui) {
    return (
      row('Sound', 'Synth effects', btn('sound', CM.sfx.isMuted() ? 'OFF' : 'ON', { cls: 'buy' })) +
      row('Export save', 'Save + metrics + events as JSON', btn('export', 'EXPORT', { cls: 'buy' })) +
      row('Import save', 'Paste an exported JSON', btn('import', 'IMPORT', { cls: 'buy' })) +
      row('Playtest tools', 'Dev menu: marks the session as assisted', btn('open:dev', 'OPEN', { cls: 'buy' })) +
      row('Reset save', 'Start over from zero', btn('reset', 'RESET', { cls: 'danger' })) +
      '<p class="hint">Played ' + Math.floor(s.clock / 60000) + ' min' + (s.devUsed ? ' · dev tools used' : '') + '. Data never leaves this browser.</p>'
    );
  }

  function devPanel(s) {
    const D = CM.dev;
    const g = (items) => '<div class="devgrid">' + items.map((i) => btn('dev:' + i[0], i[1], { cls: 'chip' + (i[2] ? ' on' : '') })).join('') + '</div>';
    return (
      '<h3>TIME</h3>' + g([['speed:1', 'x1', D.speed === 1], ['speed:2', 'x2', D.speed === 2], ['speed:10', 'x10', D.speed === 10], ['pause', D.paused ? 'RESUME' : 'PAUSE', D.paused]]) +
      '<h3>GIVE</h3>' + g([['coins', '+200 coins'], ['raw', '+10 raw'], ['base', '+10 base'], ['reveal', 'reveal vein']]) +
      '<h3>UNLOCK</h3>' + g([['buildings', 'all buildings'], ['deposits', 'all deposits'], ['hire', 'hire all'], ['lvl:drill', 'drill +1'], ['lvl:refinery', 'refinery +1'], ['lvl:pickaxe', 'pickaxe +1'], ['lvl:storage', 'storage +1']]) +
      '<h3>FORCE</h3>' + g([['full', 'storage full'], ['veinout', 'vein depleted'], ['noraw', 'no raw']]) +
      '<h3>SCENARIO</h3>' + g([['scn:chain', 'chain ready'], ['scn:colony', 'colony + coins'], ['scn:fresh', 'new game']]) +
      '<h3>REPORT</h3><pre class="report" id="dev-report"></pre>' + btn('export', 'EXPORT JSON', { cls: 'buy wide' })
    );
  }

  CM.panels = {
    esc,
    statLine,
    comboLine,
    TITLES: { build: 'BUILD', workers: 'WORKERS', cheese: 'CHEESERY', market: 'MARKET', options: 'OPTIONS', dev: 'PLAYTEST TOOLS' },
    render(name, s, ui) {
      return { build: buildPanel, workers: workersPanel, cheese: cheesePanel, market: marketPanel, options: optionsPanel, dev: devPanel }[name](s, ui);
    },
  };
})();
