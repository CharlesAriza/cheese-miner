// Conecta simulación, escena, HUD, paneles, sonido y guardado.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const sfx = CM.sfx;
  const STEP = B.sim.stepMs;
  const $ = (id) => document.getElementById(id);

  const loaded = CM.storage.load(Date.now());
  let state = loaded.state;
  state.metrics.sessions += 1;
  const scene = CM.createScene($('scene'));
  const ui = { panel: null, cheeseTab: 'experiment', combo: { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' }, lastHtml: '' };
  const els = { mine: $('btn-mine'), drill: $('btn-drill'), refine: $('btn-refine'), floaters: $('floaters'), banner: $('banner'), toast: $('toast'), combo: $('combo') };
  let dirty = false;

  window.addEventListener('error', (e) => CM.telemetry.error(state, e.message));

  // ---------- Feedback ----------
  function float(text, id, cls) {
    const at = scene.anchor(id);
    if (at[0] < 0.02 || at[0] > 0.98) return;
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.textContent = text;
    el.style.left = (at[0] + (Math.random() - 0.5) * 0.08) * 100 + '%';
    el.style.top = at[1] * 100 + '%';
    els.floaters.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
  function retrigger(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  function banner(text) {
    els.banner.textContent = text;
    retrigger(els.banner, 'show');
  }
  let toastTimer = 0;
  function toast(text, good) {
    els.toast.textContent = text;
    els.toast.classList.toggle('good', !!good);
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2200);
  }
  const buzz = (pattern) => {
    const active = navigator.userActivation ? navigator.userActivation.hasBeenActive : true;
    if (navigator.vibrate && active) navigator.vibrate(pattern);
  };
  // Los trabajadores producen sin parar: se limita cada sonido para no saturar.
  const lastPlayed = {};
  function play(name, arg) {
    const t = performance.now();
    if (t - (lastPlayed[name] || 0) < 350 && name !== 'hit' && name !== 'boost') return;
    lastPlayed[name] = t;
    sfx[name](arg);
  }

  function feedback(ev, now) {
    scene.onEvent(ev, state, now);
    switch (ev.type) {
      case 'hit':
        if (ev.source !== 'manual') break;
        play('hit', ev.combo);
        buzz(ev.crit ? 25 : 8);
        if (ev.crit) {
          play('crit');
          float('CRIT!', 'rock', 'crit');
        }
        if (ev.combo >= 3) retrigger(els.combo, 'pop');
        break;
      case 'reveal':
        play('reveal');
        buzz([30, 40, 80]);
        banner('CHEESE VEIN FOUND!');
        break;
      case 'drillStart':
      case 'refineStart':
        if (ev.source === 'manual') play('start');
        break;
      case 'drillBoost':
      case 'refineBoost':
      case 'cheeseBoost':
        play('boost');
        buzz(5);
        break;
      case 'drillDone':
        play('raw');
        float('+' + ev.amount + ' RAW', 'rock', 'raw');
        retrigger($('res-raw'), 'bump');
        break;
      case 'refineDone':
        play('base');
        float('+' + ev.amount + ' BASE', 'refinery', 'base');
        retrigger($('res-base'), 'bump');
        break;
      case 'lotDone':
        play('base');
        float('+1 LOT', 'cheesery', 'lot');
        retrigger($('res-lots'), 'bump');
        break;
      case 'recipeDiscovered':
        play('reveal');
        askRecipeName(ev.recipeId, true);
        break;
      case 'sale':
        play('coin');
        buzz(20);
        float('+' + ev.coins + ' COINS', 'market', 'coins');
        retrigger($('res-coins'), 'bump');
        dirty = true;
        break;
      case 'built':
        play('upgrade');
        banner(B.buildings[ev.id].name.toUpperCase() + ' BUILT!');
        scene.focus(ev.id);
        dirty = true;
        break;
      case 'upgraded':
      case 'hired':
        play('upgrade');
        toast(ev.type === 'hired' ? B.workers[ev.role].name + ' hired!' : B.upgrades[ev.id].name + ' upgraded to LV ' + (ev.level + 1), true);
        dirty = true;
        break;
      case 'veinDepleted':
        float('VEIN DEPLETED', 'rock', 'info');
        break;
      case 'depositDepleted':
        banner('DEPOSIT EXHAUSTED');
        toast('Open or switch to another deposit in BUILD');
        break;
      case 'depositUnlocked':
        play('reveal');
        banner(q.depDef(ev.id).name.toUpperCase() + ' OPENED!');
        dirty = true;
        break;
      case 'depositSwitched':
        play('newRock');
        scene.focus('rock');
        break;
      case 'goal':
        toast('Goal done: ' + ev.text, true);
        break;
    }
  }

  function drainEvents() {
    if (!CM.events.length) return;
    const now = Date.now();
    const batch = CM.events.splice(0, CM.events.length);
    batch.forEach((ev) => feedback(ev, now));
    renderPanel();
  }

  // Muestra por qué una acción no se pudo hacer.
  function report(result, el) {
    if (result && result.ok === false) {
      play('denied');
      toast(CM.REASONS[result.reason] || 'Not possible right now');
      if (el) retrigger(el, 'nope');
    }
    return result;
  }

  // ---------- Acciones principales ----------
  const actions = {
    mine() {
      scene.focus('rock');
      report(CM.mining.hit(state, 'manual'), els.mine);
    },
    drill() {
      scene.focus('rock');
      if (!state.built.drill) return needsBuilding('drill', els.drill);
      report(CM.drilling.tap(state), els.drill);
    },
    refine() {
      scene.focus('refinery');
      if (!state.built.refinery) return needsBuilding('refinery', els.refine);
      report(CM.refining.tap(state), els.refine);
    },
  };
  function needsBuilding(id, el) {
    const info = CM.construction.buildInfo(state, id);
    if (info.condOk) openPanel('build');
    else report(CM.fail('locked'), el), toast(info.condText);
  }
  for (const name of ['mine', 'drill', 'refine']) {
    els[name].addEventListener('pointerdown', (e) => {
      e.preventDefault();
      actions[name]();
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.repeat || ui.panel || !$('modal').hidden) return;
    const name = { 1: 'mine', 2: 'drill', 3: 'refine' }[e.key];
    if (name) actions[name]();
  });

  // Escena: arrastrar para desplazar la colonia, tocar un edificio para usarlo o abrir su panel.
  const stage = $('scene');
  let drag = null;
  const logical = (px) => (px / stage.getBoundingClientRect().width) * scene.W;
  stage.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, last: e.clientX, moved: false };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > 8) drag.moved = true;
    if (drag.moved) scene.panBy(-logical(e.clientX - drag.last));
    drag.last = e.clientX;
  });
  stage.addEventListener('pointerup', (e) => {
    const wasDrag = drag && drag.moved;
    drag = null;
    if (wasDrag) return;
    const id = scene.hitTest(logical(e.clientX - stage.getBoundingClientRect().left));
    if (id === 'rock') (q.dep(state).veinRevealed && state.built.drill ? actions.drill : actions.mine)();
    else if (id === 'drill') actions.drill();
    else if (id === 'refinery') actions.refine();
    else if (id === 'cheesery') state.jobs.cheesery ? report(CM.cheesery.tap(state)) : openPanel('cheese');
    else if (id === 'market') openPanel('market');
    else if (id === 'house') openPanel('workers');
    else if (id === 'storage') openPanel('build');
  });
  stage.addEventListener('pointercancel', () => (drag = null));

  // ---------- Paneles ----------
  const FOCUS = { cheese: 'cheesery', market: 'market', workers: 'house' };
  function openPanel(name) {
    ui.panel = name;
    ui.lastHtml = '';
    $('sheet-title').textContent = CM.panels.TITLES[name];
    $('sheet').hidden = false;
    $('sheet-body').scrollTop = 0;
    if (FOCUS[name] && state.built[FOCUS[name]]) scene.focus(FOCUS[name]);
    renderPanel();
  }
  function closePanel() {
    ui.panel = null;
    $('sheet').hidden = true;
  }
  // Solo toca el DOM si el contenido cambió, para no perder taps a medio pulsar.
  function renderPanel() {
    if (!ui.panel) return;
    const html = CM.panels.render(ui.panel, state, ui);
    if (html !== ui.lastHtml) {
      ui.lastHtml = html;
      $('sheet-body').innerHTML = html;
    }
    const rep = $('dev-report');
    if (rep) rep.textContent = CM.dev.report(state);
  }

  document.querySelectorAll('.tools [data-panel]').forEach((b) => b.addEventListener('click', () => openPanel(b.dataset.panel)));

  const ACTS = {
    close: closePanel,
    build: (id) => CM.construction.build(state, id),
    upgrade: (id) => CM.construction.upgrade(state, id),
    unlock: (id) => {
      const r = CM.deposits.unlock(state, id);
      if (r.ok && q.depPhase(state, state.activeDeposit) === 'depleted') CM.deposits.setActive(state, id);
      return r;
    },
    switch: (id) => {
      const r = CM.deposits.setActive(state, id);
      if (r.ok) closePanel();
      return r;
    },
    hire: (role) => CM.workers.hire(state, role),
    tab: (name) => void (ui.cheeseTab = name),
    pick: (part, value) => void (ui.combo[part] = value),
    experiment: () => CM.cheesery.experiment(state, ui.combo),
    make: (id, n) => CM.cheesery.produce(state, id, Number(n)),
    cheeseTap: () => CM.cheesery.tap(state),
    rename: (id) => void askRecipeName(id, false),
    deliver: (orderId, recipeId) => CM.merchant.deliver(state, orderId, recipeId),
    decline: (orderId) => CM.merchant.decline(state, orderId),
    open: (name) => void openPanel(name),
    sound: () => void sfx.toggleMute(),
    export: exportSave,
    import: importSave,
    reset: confirmReset,
    dev: devAction,
  };

  function onAct(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const parts = el.dataset.act.split(':');
    const fn = ACTS[parts[0]];
    if (!fn) return;
    report(fn.apply(null, parts.slice(1)), el);
    drainEvents();
    renderPanel();
    dirty = true;
  }
  $('sheet').addEventListener('click', onAct);
  $('sheet').addEventListener('click', (e) => {
    if (e.target === $('sheet')) closePanel();
  });

  // ---------- Modales ----------
  let modalHandlers = {};
  function showModal(html, handlers) {
    modalHandlers = handlers || {};
    $('modal-body').innerHTML = html;
    $('modal').hidden = false;
  }
  function closeModal() {
    $('modal').hidden = true;
    modalHandlers = {};
  }
  $('modal').addEventListener('click', (e) => {
    const el = e.target.closest('[data-m]');
    if (!el) return;
    const fn = modalHandlers[el.dataset.m];
    if (!fn || fn() !== false) closeModal();
    renderPanel();
  });

  function askRecipeName(recipeId, isNew) {
    const recipe = CM.cheesery.recipe(state, recipeId);
    if (!recipe) return;
    const P = CM.panels;
    showModal(
      '<h2>' + (isNew ? 'NEW RECIPE!' : 'RENAME RECIPE') + '</h2><p class="hint">' + P.comboLine(CM.cheesery.parseKey(recipe.key)) + '</p><div class="stats">' + P.statLine(CM.cheesery.statsOf(recipe)) +
        '</div><input id="name-input" maxlength="24" autocomplete="off" value="' + P.esc(recipe.name) + '" /><p class="hint">' + (isNew ? 'Saved to your Recipe Book with 1 sample lot. Name it:' : 'Pick a new name:') + '</p><div class="row"><button class="buy" data-m="ok">SAVE</button></div>',
      {
        ok() {
          const r = CM.cheesery.rename(state, recipeId, $('name-input').value);
          if (!r.ok && !isNew) return report(r), false;
          dirty = true;
        },
      }
    );
    if (isNew) banner('NEW RECIPE DISCOVERED!');
  }

  function showOffline(sum) {
    if (!sum) return;
    const d = sum.delta;
    const mins = Math.round(sum.simulatedMs / 60000);
    const lines = [];
    if (d.veinsFound) lines.push('Veins found: ' + d.veinsFound);
    if (d.rawProduced) lines.push('Raw Cheese drilled: +' + d.rawProduced);
    if (d.rawConsumed) lines.push('Raw Cheese refined: -' + d.rawConsumed);
    if (d.baseProduced) lines.push('Cheese Base made: +' + d.baseProduced);
    if (d.lotsProduced) lines.push('Lots finished: +' + d.lotsProduced);
    const labels = { active: 'working', 'vein-exposed': 'waiting: vein exposed', 'waiting-vein': 'waiting for a vein', 'no-material': 'out of Raw Cheese', 'storage-full': 'storage full', 'no-work': 'no work' };
    const stops = sum.workers.map((w) => B.workers[w.role].name + ': ' + labels[w.status]);
    if (!lines.length && sum.simulatedMs < 60000) return;
    showModal(
      '<h2>WELCOME BACK</h2><p class="hint">Away ' + (mins < 1 ? 'under a minute' : mins + ' min') + (sum.capped ? ' (only the first ' + Math.round(B.offline.capMs / 3600000) + ' h count)' : '') + '</p>' +
        (lines.length ? '<ul class="list">' + lines.map((l) => '<li>' + l + '</li>').join('') + '</ul>' : '<p class="hint">' + (sum.automated ? 'Your workers had nothing they could do.' : 'Nothing was produced: no stage is automated yet. Hire workers to keep the colony running.') + '</p>') +
        (stops.length ? '<p class="hint">Now: ' + stops.join(' · ') + '</p>' : '') + '<div class="row"><button class="buy" data-m="ok">OK</button></div>',
      { ok() {} }
    );
  }

  function exportSave() {
    const text = CM.storage.exportText(state, Date.now());
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = 'cheese-miner-playtest.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {}
    showModal('<h2>EXPORT</h2><p class="hint">A file was downloaded. You can also copy the text:</p><textarea id="io-text" readonly></textarea><div class="row"><button class="buy" data-m="ok">DONE</button></div>', { ok() {} });
    $('io-text').value = text;
  }

  function replaceState(next) {
    state = next;
    CM.events.length = 0;
    CM.telemetry.resetSamples();
    scene.reset();
    CM.storage.save(state, Date.now());
    ui.lastHtml = '';
  }

  function importSave() {
    showModal('<h2>IMPORT</h2><p class="hint">Paste an exported save. It replaces the current game.</p><textarea id="io-text"></textarea><div class="row"><button class="close" data-m="no">CANCEL</button><button class="buy" data-m="ok">LOAD</button></div>', {
      no() {},
      ok() {
        const next = CM.storage.parse($('io-text').value, Date.now());
        if (!next) return toast('That is not a valid Cheese Miner save'), false;
        next.lastSavedAt = Date.now();
        replaceState(next);
        closePanel();
        toast('Save loaded', true);
      },
    });
  }

  function confirmReset() {
    showModal('<h2>RESET GAME?</h2><p class="hint">All progress and metrics will be lost.</p><div class="row"><button class="close" data-m="no">CANCEL</button><button class="danger" data-m="ok">RESET</button></div>', {
      no() {},
      ok() {
        CM.storage.clear();
        CM.dev.speed = 1;
        CM.dev.paused = false;
        replaceState(CM.createState(Date.now()));
        closePanel();
      },
    });
  }

  function devAction(name, arg) {
    const D = CM.dev;
    const simple = {
      coins: () => D.addCoins(state, 200),
      raw: () => D.addRaw(state, 10),
      base: () => D.addBase(state, 10),
      reveal: () => D.revealVein(state),
      buildings: () => D.unlockBuildings(state),
      deposits: () => D.unlockDeposits(state),
      hire: () => D.hireAll(state),
      full: () => D.forceStorageFull(state),
      veinout: () => D.forceVeinDepleted(state),
      noraw: () => D.forceNoRaw(state),
      pause: () => (D.paused = !D.paused),
    };
    if (simple[name]) simple[name]();
    else if (name === 'speed') D.speed = Number(arg);
    else if (name === 'lvl') D.levelUp(state, arg);
    else if (name === 'scn') replaceState(arg === 'fresh' ? CM.createState(Date.now()) : D.scenario(arg, Date.now()));
    state.devUsed = !(name === 'scn' && arg === 'fresh');
    ui.lastHtml = '';
  }

  // ---------- HUD ----------
  const cache = new Map();
  function set(el, prop, value) {
    let seen = cache.get(el);
    if (!seen) cache.set(el, (seen = {}));
    if (seen[prop] === value) return;
    seen[prop] = value;
    if (prop === 'text') el.textContent = value;
    else if (prop === 'width') el.style.width = value;
    else el.classList.toggle(prop, value);
  }
  function button(el, sub, fill, mode) {
    set(el.querySelector('small'), 'text', sub);
    set(el.querySelector('.fill'), 'width', Math.round(fill * 100) + '%');
    for (const cls of ['hot', 'locked', 'idle', 'blocked']) set(el, cls, mode === cls);
  }
  const progress = (job) => (job ? 1 - job.remaining / job.total : 0);

  function machineButton(el, id, st, job, auto, readyText) {
    if (st === 'not-built') {
      const ok = CM.construction.buildInfo(state, id).condOk;
      return button(el, ok ? 'Tap to build' : 'Locked', 0, ok ? 'hot' : 'locked');
    }
    if (st === 'running') return button(el, auto ? 'Auto · tap to boost' : 'TAP TO BOOST!', progress(job), '');
    if (st === 'ready') return button(el, readyText, 0, 'hot');
    const text = { 'no-vein': 'No vein yet', depleted: 'Deposit empty', 'storage-full': 'Storage full!', 'no-raw': 'Need ' + B.refinery.rawPerBase + ' Raw' }[st];
    button(el, text, 0, st === 'storage-full' ? 'blocked' : 'idle');
  }

  function updateHUD() {
    const caps = q.caps(state);
    const d = q.dep(state);
    const vein = q.veinDef(state, state.activeDeposit);
    set($('coins'), 'text', String(state.coins));
    set($('raw'), 'text', q.rawTotal(state) + '/' + caps.raw);
    set($('base'), 'text', q.baseTotal(state) + '/' + caps.base);
    set($('lots'), 'text', q.lotsTotal(state) + '/' + caps.lots);
    set($('res-raw'), 'full', q.rawTotal(state) >= caps.raw);
    set($('res-base'), 'full', q.baseTotal(state) >= caps.base);
    set($('res-lots'), 'full', q.lotsTotal(state) >= caps.lots);

    const obj = CM.sim.objective(state);
    set($('obj-text'), 'text', obj.text);
    set($('obj-num'), 'text', obj.hasBar ? obj.cur + '/' + obj.max : '');
    set($('obj-fill'), 'width', (obj.hasBar ? Math.round((obj.cur / obj.max) * 100) : obj.done ? 100 : 0) + '%');

    const mineSt = CM.mining.status(state);
    if (mineSt === 'ready') button(els.mine, (state.workers.miner ? 'Miner at work · ' : 'Search ') + d.discover + '/' + vein.hits, d.discover / vein.hits, 'hot');
    else if (mineSt === 'vein-exposed') button(els.mine, d.veinRemaining + ' Raw in vein', 0, 'idle');
    else button(els.mine, 'Deposit empty', 0, 'idle');

    const drillSt = CM.drilling.status(state);
    machineButton(els.drill, 'drill', drillSt, state.jobs.drill, state.workers.driller > 0, '+' + Math.min(q.drillYield(state), d.veinRemaining) + ' Raw');
    const refSt = CM.refining.status(state);
    const base = CM.refining.pickBase(state);
    const n = base ? Math.min(q.refineBatch(state), Math.floor(state.inv.raw[base] / B.refinery.rawPerBase)) : 0;
    machineButton(els.refine, 'refinery', refSt, state.jobs.refinery, state.workers.refiner > 0, n * B.refinery.rawPerBase + ' Raw > ' + n + ' Base');

    const comboOn = mineSt === 'ready' && state.combo >= 3 && state.clock - state.lastHitAt <= B.mining.comboWindowMs;
    set(els.combo, 'on', comboOn);
    if (comboOn) set(els.combo, 'text', 'COMBO x' + state.combo);
    set($('devflag'), 'text', CM.dev.paused ? 'PAUSED' : CM.dev.speed > 1 ? 'SPEED x' + CM.dev.speed : '');

    document.querySelectorAll('[data-job]').forEach((el) => (el.style.width = Math.round(progress(state.jobs[el.dataset.job]) * 100) + '%'));
  }

  // Avisos en la navegación: solo cuando hay algo nuevo que hacer ahí.
  function updateDots() {
    const C = CM.construction;
    const dots = {
      build: C.order.some((id) => C.buildInfo(state, id).canBuild) || B.deposits.some((d) => d.inAlpha !== false && !state.deposits[d.id].unlocked && state.coins >= CM.deposits.unlockCost(state, d.id)),
      workers: CM.workers.roles.some((r) => CM.workers.hireInfo(state, r).canHire),
      cheese: state.built.cheesery && !state.jobs.cheesery && q.lotsSpace(state) > 0 && CM.cheesery.unlockedBases(state).some((b) => state.inv.base[b] >= (state.recipes.length ? B.cheesery.lotBase : B.cheesery.experimentBase)),
      market: state.orders.some((o) => o && o.id && state.recipes.some((r) => (state.lots[r.id] || 0) >= o.qty && CM.merchant.matches(o, r))),
    };
    document.querySelectorAll('.tools [data-panel]').forEach((b) => {
      const dot = b.querySelector('.dot');
      if (dot) dot.classList.toggle('on', !!dots[b.dataset.panel]);
    });
  }

  // ---------- Bucle ----------
  let last = performance.now();
  let acc = 0;
  let slowTick = 0;
  let saveTick = 0;
  function frame(t) {
    const real = Math.min(250, t - last);
    last = t;
    if (!CM.dev.paused) {
      acc += real * CM.dev.speed;
      let steps = 0;
      while (acc >= STEP && steps < 300) {
        CM.sim.step(state, STEP);
        acc -= STEP;
        steps += 1;
      }
      if (steps >= 300) acc = 0;
    }
    drainEvents();
    scene.draw(state, Date.now(), real / 1000);
    updateHUD();
    slowTick += real;
    if (slowTick > 400) {
      slowTick = 0;
      updateDots();
      renderPanel();
      CM.telemetry.sample(state);
    }
    saveTick += real;
    if (dirty || saveTick > 5000) {
      dirty = false;
      saveTick = 0;
      CM.storage.save(state, Date.now());
    }
    requestAnimationFrame(frame);
  }

  function comeBack() {
    const sum = CM.sim.applyOffline(state, Date.now());
    CM.storage.save(state, Date.now());
    last = performance.now();
    acc = 0;
    showOffline(sum);
  }

  window.addEventListener('resize', scene.resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) CM.storage.save(state, Date.now());
    else comeBack();
  });
  window.addEventListener('pagehide', () => CM.storage.save(state, Date.now()));

  if (loaded.recovered) toast('Your save was damaged, so a new game was started');
  if (!loaded.isNew) comeBack();
  else CM.storage.save(state, Date.now());
  // Acceso para depurar desde la consola del navegador.
  window.CM_DEBUG = {
    get state() {
      return state;
    },
    comeBack,
  };
  requestAnimationFrame(frame);
})();
