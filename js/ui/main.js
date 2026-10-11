// Conecta simulación, escena, HUD, cadena de estaciones, paneles, sonido y guardado.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const P = CM.panels;
  const I = CM.icons;
  const sfx = CM.sfx;
  const STEP = B.sim.stepMs;
  const $ = (id) => document.getElementById(id);

  const loaded = CM.storage.load(Date.now());
  let state = loaded.state;
  state.metrics.sessions += 1;
  const scene = CM.createScene($('scene'));
  const STATIONS = ['rock', 'drill', 'refinery', 'cheesery', 'market'];
  const ui = {
    panel: null,
    station: 'rock',
    cheeseTab: 'experiment',
    combo: { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' },
    lastHtml: '',
    dockHtml: '',
    dockKind: 'mine',
    shown: { coins: state.coins, raw: q.rawTotal(state), base: q.baseTotal(state), lots: q.lotsTotal(state) },
  };
  const els = { floaters: $('floaters'), banner: $('banner'), toast: $('toast'), combo: $('combo'), main: $('dock-main'), flyers: $('flyers'), bubbles: $('bubbles') };
  const tiles = {};
  document.querySelectorAll('#chain .tile').forEach((t) => (tiles[t.dataset.st] = t));
  let dirty = false;

  window.addEventListener('error', (e) => CM.telemetry.error(state, e.message));

  // ---------- Feedback ----------
  function retrigger(el, cls) {
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  }
  // Texto que sube desde un edificio. Solo se usa para eventos reales.
  function float(text, id, cls) {
    const at = scene.anchor(id);
    if (at[0] < 0.03 || at[0] > 0.97) return;
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.innerHTML = text;
    el.style.left = (at[0] + (Math.random() - 0.5) * 0.22) * 100 + '%';
    el.style.top = (at[1] + 0.03 + Math.random() * 0.06) * 100 + '%';
    els.floaters.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
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
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 2400);
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

  // Punto de la pantalla (relativo a #app) de una estación: su edificio si se ve, o su casilla.
  function pointOf(target) {
    const app = $('app').getBoundingClientRect();
    if (typeof target !== 'string') {
      const r = target.getBoundingClientRect();
      return [r.left + r.width / 2 - app.left, r.top + r.height / 2 - app.top];
    }
    const at = scene.anchor(target);
    if (at[0] > 0.03 && at[0] < 0.97) {
      const st = $('stage').getBoundingClientRect();
      return [st.left + at[0] * st.width - app.left, st.top + (at[1] + 0.08) * st.height - app.top];
    }
    return pointOf(tiles[target] || $('nav-colony'));
  }
  // Iconos que vuelan de un sitio a otro: enseñan de dónde sale y a dónde va cada recurso.
  function fly(src, from, to, count, onArrive) {
    const a = pointOf(from);
    const b = pointOf(to);
    const n = Math.max(1, Math.min(count, 6));
    if (els.flyers.childElementCount > 40) return onArrive && onArrive();
    for (let i = 0; i < n; i++) {
      const el = document.createElement('img');
      el.className = 'pix flyer';
      el.src = src;
      const ox = (Math.random() - 0.5) * 26;
      const oy = (Math.random() - 0.5) * 18;
      el.style.left = a[0] + ox + 'px';
      el.style.top = a[1] + oy + 'px';
      els.flyers.appendChild(el);
      const dx = b[0] - a[0] - ox;
      const dy = b[1] - a[1] - oy;
      const anim = el.animate(
        [
          { transform: 'translate(-50%,-50%) scale(0.4)', opacity: 0 },
          { transform: 'translate(-50%,-50%) translate(' + ox * 0.6 + 'px,' + (-24 + oy) + 'px) scale(1.5)', opacity: 1, offset: 0.25 },
          { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(0.8)', opacity: 1 },
        ],
        { duration: 620, delay: i * 55, easing: 'cubic-bezier(.5,0,.7,.4)', fill: 'backwards' }
      );
      anim.onfinish = () => {
        el.remove();
        if (i === n - 1 && onArrive) onArrive();
      };
    }
  }
  const bump = (id) => retrigger($(id), 'bump');
  const tileBump = (st) => retrigger(tiles[st], 'bump');
  const baseOfActive = () => q.depDef(state.activeDeposit).base;

  function feedback(ev, now) {
    scene.onEvent(ev, state, now);
    switch (ev.type) {
      case 'hit':
        // El número del golpe es progreso de búsqueda, no un recurso.
        float('+' + ev.amount, 'rock', ev.crit ? 'crit' : ev.source === 'manual' ? 'search' : 'search dim');
        if (ev.source !== 'manual') break;
        play('hit', ev.combo);
        buzz(ev.crit ? 25 : 8);
        if (ev.crit) {
          play('crit');
          float('CRIT!', 'rock', 'crit big');
        }
        if (ev.combo >= 3) retrigger(els.combo, 'pop');
        break;
      case 'reveal':
        play('reveal');
        buzz([30, 40, 80]);
        banner('CHEESE VEIN FOUND!');
        float(ev.capacity + ' RAW INSIDE', 'rock', 'info');
        if (ui.station === 'rock') select('drill');
        break;
      case 'drillStart':
        if (ev.source === 'manual') play('start');
        break;
      case 'refineStart':
        if (ev.source === 'manual') play('start');
        fly(I.url('raw', ev.base), $('res-raw'), 'refinery', Math.ceil(ev.used / 2));
        break;
      case 'cheeseStart':
        fly(I.url('base', ev.base), $('res-base'), 'cheesery', Math.ceil(ev.used / 2));
        break;
      case 'drillBoost':
      case 'refineBoost':
      case 'cheeseBoost':
        play('boost');
        buzz(5);
        break;
      case 'drillDone':
        play('raw');
        float(I.img('raw', ev.base) + '+' + ev.amount, 'rock', 'raw');
        fly(I.url('raw', ev.base), 'rock', $('res-raw'), ev.amount, () => bump('res-raw'));
        tileBump('drill');
        break;
      case 'refineDone':
        play('base');
        float(I.img('base', ev.base) + '+' + ev.amount, 'refinery', 'base');
        fly(I.url('base', ev.base), 'refinery', $('res-base'), ev.amount, () => bump('res-base'));
        tileBump('refinery');
        break;
      case 'lotDone': {
        const recipe = CM.cheesery.recipe(state, ev.recipeId);
        const base = recipe ? CM.cheesery.parseKey(recipe.key).base : 'cheddar';
        play('base');
        float(I.img('lot', base) + '+1 CHEESE', 'cheesery', 'lot');
        fly(I.url('lot', base), 'cheesery', $('res-lots'), 1, () => bump('res-lots'));
        tileBump('cheesery');
        break;
      }
      case 'recipeDiscovered':
        play('reveal');
        scene.celebrate();
        askRecipeName(ev.recipeId, true);
        break;
      case 'sale': {
        const recipe = CM.cheesery.recipe(state, ev.recipeId);
        const base = recipe ? CM.cheesery.parseKey(recipe.key).base : 'cheddar';
        play('coin');
        buzz(20);
        fly(I.url('lot', base), $('res-lots'), 'market', ev.qty);
        fly(I.url('coin'), 'market', $('res-coins'), 6, () => bump('res-coins'));
        float(I.img('coin') + '+' + ev.coins + (ev.bonus ? ' BONUS!' : ''), 'market', 'coins');
        tileBump('market');
        dirty = true;
        break;
      }
      case 'purchase':
        if (ev.cost > 0) {
          const el = document.createElement('div');
          el.className = 'spend';
          el.textContent = '-' + ev.cost;
          $('res-coins').appendChild(el);
          el.addEventListener('animationend', () => el.remove());
        }
        break;
      case 'built':
        play('upgrade');
        banner(B.buildings[ev.id].name.toUpperCase() + ' BUILT!');
        scene.focus(ev.id);
        scene.celebrate();
        dirty = true;
        break;
      case 'upgraded':
        play('upgrade');
        float('LEVEL UP!', ev.id === 'pickaxe' ? 'rock' : ev.id, 'lot');
        toast(B.upgrades[ev.id].name + ' is now LV ' + (ev.level + 1), true);
        dirty = true;
        break;
      case 'hired':
        play('upgrade');
        banner(B.workers[ev.role].name.toUpperCase() + ' HIRED!');
        toast(B.workers[ev.role].name + ': ' + B.workers[ev.role].does.toLowerCase(), true);
        if (ev.role === 'cheesemaker' && state.recipes.length) {
          ui.cheeseTab = 'book';
          openPanel('cheese');
        }
        dirty = true;
        break;
      case 'veinDepleted':
        float('VEIN EMPTY', 'rock', 'info');
        if (ui.station === 'drill' && q.depPhase(state, state.activeDeposit) !== 'depleted') {
          select('rock');
          toast('Vein used up. Mine the rock to find the next one');
        }
        break;
      case 'depositDepleted':
        banner('ZONE EXHAUSTED');
        select('rock');
        toast('This rock has no cheese left. Travel to another zone in COLONY');
        break;
      case 'depositUnlocked':
        play('reveal');
        scene.celebrate();
        zoneOpened(ev.id);
        dirty = true;
        break;
      case 'depositSwitched':
        play('newRock');
        select('rock');
        banner('WELCOME TO ' + q.depDef(ev.id).name.toUpperCase());
        setIcons();
        break;
      case 'goal':
        play('crit');
        scene.celebrate();
        retrigger($('objective'), 'done');
        toast('Goal complete: ' + ev.text, true);
        break;
    }
  }

  function drainEvents() {
    if (!CM.events.length) return;
    const now = Date.now();
    CM.events.splice(0, CM.events.length).forEach((ev) => feedback(ev, now));
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

  // ---------- Cadena de estaciones ----------
  const BUILDING = { drill: 'drill', refinery: 'refinery', cheesery: 'cheesery', market: 'market' };
  const WORKER = { rock: 'miner', drill: 'driller', refinery: 'refiner', cheesery: 'cheesemaker' };
  const UPGRADE = { rock: 'pickaxe', drill: 'drill', refinery: 'refinery' };

  function select(st, quiet) {
    ui.station = st;
    scene.select(st);
    if (!quiet) scene.focus(st);
    ui.dockHtml = null;
  }

  const deliverable = () => state.orders.filter((o) => o && o.id && state.recipes.some((r) => (state.lots[r.id] || 0) >= o.qty && CM.merchant.matches(o, r))).length;
  const canCook = () =>
    !state.jobs.cheesery && q.lotsSpace(state) > 0 && CM.cheesery.unlockedBases(state).some((b) => state.inv.base[b] >= (state.recipes.length ? B.cheesery.lotBase : B.cheesery.experimentBase));
  const progress = (job) => (job ? 1 - job.remaining / job.total : 0);

  // Estado resumido de una estación: locked, build, ready, working, waiting o blocked.
  function stationInfo(st) {
    const d = q.dep(state);
    const vein = q.veinDef(state, state.activeDeposit);
    if (BUILDING[st] && !state.built[st]) return { state: CM.construction.buildInfo(state, st).condOk ? 'build' : 'locked', progress: 0 };
    if (st === 'rock') {
      const ms = CM.mining.status(state);
      if (ms === 'ready') return { state: state.workers.miner ? 'working' : 'ready', progress: d.discover / vein.hits };
      if (ms === 'vein-exposed') return { state: 'waiting', progress: d.veinRemaining / vein.capacity, vein: true };
      return { state: 'blocked', progress: 0 };
    }
    if (st === 'drill' || st === 'refinery') {
      const ms = st === 'drill' ? CM.drilling.status(state) : CM.refining.status(state);
      const map = { running: 'working', ready: 'ready', 'no-vein': 'waiting', 'no-raw': 'waiting' };
      return { state: map[ms] || 'blocked', progress: progress(state.jobs[st]), reason: ms };
    }
    if (st === 'cheesery') {
      if (state.jobs.cheesery) return { state: 'working', progress: progress(state.jobs.cheesery) };
      const cook = state.workers.cheesemaker ? CM.cheesery.autoStatus(state) : '';
      if (cook === 'storage-full' || cook === 'no-recipe') return { state: 'blocked', progress: 0, reason: cook };
      return { state: canCook() ? 'ready' : 'waiting', progress: 0, reason: cook };
    }
    const n = deliverable();
    return { state: n ? 'ready' : 'waiting', progress: 0, ready: n };
  }

  // Si esa estación tiene una mejora o contratación que ya se puede pagar.
  function canInvest(st) {
    const up = UPGRADE[st];
    if (up && CM.construction.upgradeInfo(state, up).canUpgrade) return true;
    return !!WORKER[st] && (st === 'rock' || state.built[st]) && CM.workers.hireInfo(state, WORKER[st]).canHire;
  }

  // Qué estación pide el objetivo actual.
  const GOAL_AT = { vein: 'rock', drill: 'drill', raw: 'drill', refinery: 'refinery', base: 'refinery', cheesery: 'cheesery', recipe: 'cheesery', market: 'market', sale: 'market', house: 'colony', worker: 'colony', allRoles: 'colony', deposit2: 'colony', cook: 'colony' };

  const BUBBLE = { 'storage-full': 'FULL!', 'no-vein': 'NO VEIN', depleted: 'EMPTY', 'no-raw': 'NO RAW', 'no-recipe': 'NO RECIPE', 'no-material': 'NO BASE' };
  const bubbles = {};
  function bubble(id, text, cls) {
    let el = bubbles[id];
    if (!el) {
      el = bubbles[id] = document.createElement('div');
      els.bubbles.appendChild(el);
    }
    const at = scene.anchor(id);
    const on = !!text && at[0] > 0.04 && at[0] < 0.96;
    set(el, 'text', text || '');
    set(el, 'cls', 'bubble ' + (cls || '') + (on ? ' on' : ''));
    if (on) {
      el.style.left = at[0] * 100 + '%';
      el.style.top = at[1] * 100 + '%';
    }
  }

  function updateChain() {
    const goal = CM.sim.objective(state);
    const goalAt = GOAL_AT[goal.id];
    for (const st of STATIONS) {
      const info = stationInfo(st);
      const tile = tiles[st];
      for (const cls of ['locked', 'build', 'ready', 'working', 'waiting', 'blocked']) set(tile, cls, info.state === cls);
      set(tile, 'sel', ui.station === st);
      set(tile, 'goal', goalAt === st && ui.station !== st);
      set(tile.querySelector('.mini > i'), 'width', Math.round(info.progress * 100) + '%');
      const auto = WORKER[st] && state.workers[WORKER[st]] > 0;
      set(tile.querySelector('em'), 'text', info.state === 'locked' ? 'LOCK' : info.state === 'build' ? 'BUILD' : st === 'market' && info.ready ? info.ready + ' SELL' : canInvest(st) ? 'UP!' : auto ? 'AUTO' : '');
      // Aviso sobre el edificio solo cuando está parado por algo.
      const reason = info.reason !== 'no-vein' && (info.state === 'blocked' || (auto && info.state === 'waiting')) ? BUBBLE[info.reason] : '';
      if (st !== 'rock') bubble(st, st === 'market' && info.ready ? 'SELL!' : reason || '', st === 'market' && info.ready ? 'good' : 'bad');
    }
    const def = q.depDef(state.activeDeposit);
    const d = q.dep(state);
    bubble('rock', q.depPhase(state, def.id) === 'depleted' ? def.name.toUpperCase() + ' · EMPTY' : def.name.toUpperCase() + ' · VEIN ' + Math.min(d.veinIndex + 1, def.veins.length) + '/' + def.veins.length, 'name');
    set($('nav-colony'), 'goal', goalAt === 'colony');
  }

  // ---------- Dock: la estación seleccionada, con su acción, mejora y trabajador ----------
  const perMin = (amount, ms) => Math.round((amount * 600000) / ms) / 10;

  function investButtons(st) {
    let h = '';
    const up = UPGRADE[st];
    if (up && (st === 'rock' || state.built[st])) {
      const u = CM.construction.upgradeInfo(state, up);
      h += u.maxed ? '<span class="tag">' + (st === 'rock' ? 'PICK' : 'LEVEL') + ' MAX</span>' : P.btn('upgrade:' + up, (st === 'rock' ? 'PICK' : 'UPGRADE') + ' LV' + (u.level + 2) + '<br>' + P.coin(u.cost), { off: !u.canUpgrade, cls: 'buy' });
    }
    const role = WORKER[st];
    if (role && (st === 'rock' || state.built[st])) {
      const info = CM.workers.hireInfo(state, role);
      const name = B.workers[role].name.toUpperCase();
      if (info.maxed) h += '<span class="tag">' + name + ' ON DUTY</span>';
      else if (!state.built.house) h += P.btn('open:colony', name + '<br>needs Mouse House', { off: true, cls: 'buy' });
      else h += P.btn('hire:' + role, 'HIRE ' + name + '<br>' + P.coin(info.cost), { off: !info.canHire, cls: 'buy' });
    }
    return h;
  }

  function dockModel(st) {
    const info = stationInfo(st);
    const d = q.dep(state);
    const def = q.depDef(state.activeDeposit);
    const m = { title: '', status: '', tone: '', kind: 'none', label: '', sub: '', fill: 0, mode: 'idle', side: investButtons(st) };

    if (BUILDING[st] && !state.built[st]) {
      const b = CM.construction.buildInfo(state, st);
      m.title = B.buildings[st].name;
      m.status = { drill: 'Extracts Raw Cheese from an exposed vein', refinery: 'Turns Raw Cheese into Cheese Base', cheesery: 'Turns Cheese Base into cheese you can sell', market: 'Sells your cheese for coins' }[st];
      m.kind = 'build:' + st;
      m.label = 'BUILD';
      m.sub = b.condOk ? (b.cost ? b.cost + ' coins' : 'FREE') : b.condText;
      m.mode = b.canBuild ? 'hot' : 'locked';
      m.side = '';
      return m;
    }

    if (st === 'rock') {
      const vein = q.veinDef(state, def.id);
      m.title = def.name + ' · vein ' + Math.min(d.veinIndex + 1, def.veins.length) + '/' + def.veins.length;
      m.kind = 'mine';
      m.label = 'MINE';
      if (info.state === 'blocked') {
        m.status = 'No cheese left in this zone';
        m.tone = 'bad';
        m.kind = 'open:colony';
        m.label = 'ZONES';
        m.sub = 'Travel to another rock';
        m.mode = 'hot';
      } else if (info.vein) {
        m.status = 'Vein exposed: ' + d.veinRemaining + ' Raw Cheese inside';
        m.tone = 'good';
        m.kind = 'goto:drill';
        m.label = 'GO DRILL';
        m.sub = 'Mining is done here';
        m.mode = state.workers.driller ? 'idle' : 'hot';
      } else {
        m.status = 'Mining finds the vein. It gives no cheese · power ' + q.pickPower(state) + (state.workers.miner ? ' · Miner searching' : '');
        m.sub = 'Search ' + d.discover + '/' + vein.hits;
        m.fill = d.discover / vein.hits;
        m.mode = 'hot';
      }
      return m;
    }

    if (st === 'drill' || st === 'refinery') {
      const isDrill = st === 'drill';
      const auto = state.workers[WORKER[st]] > 0;
      const rate = isDrill ? perMin(q.drillYield(state), q.drillDuration(state)) : perMin(q.refineBatch(state), q.refineDuration(state));
      m.title = B.buildings[st].name + ' LV ' + (state.levels[st] + 1);
      m.kind = isDrill ? 'drill' : 'refine';
      m.label = isDrill ? 'DRILL' : 'REFINE';
      const what = isDrill ? '+' + q.drillYield(state) + ' Raw / ' + P.secs(q.drillDuration(state)) : q.refineBatch(state) * B.refinery.rawPerBase + ' Raw > ' + q.refineBatch(state) + ' Base / ' + P.secs(q.refineDuration(state));
      m.status = what + ' · up to ' + rate + '/min' + (auto ? ' · automated' : '');
      if (info.state === 'working') {
        m.sub = auto ? 'Auto · hold to boost' : 'HOLD TO BOOST!';
        m.fill = info.progress;
        m.mode = '';
      } else if (info.state === 'ready') {
        m.sub = 'Tap to start';
        m.mode = 'hot';
      } else {
        m.status = { 'no-vein': 'Waiting: no vein exposed. Mine the rock', depleted: 'This zone has no cheese left', 'storage-full': isDrill ? 'Stopped: Raw storage is full. Refine it or build Storage' : 'Stopped: Base storage is full. Make cheese or build Storage', 'no-raw': 'Waiting: needs ' + B.refinery.rawPerBase + ' Raw Cheese from the drill' }[info.reason];
        m.tone = info.state === 'blocked' ? 'bad' : 'warn';
        m.sub = BUBBLE[info.reason] || '';
        m.mode = info.state === 'blocked' ? 'blocked' : 'idle';
      }
      return m;
    }

    if (st === 'cheesery') {
      const job = state.jobs.cheesery;
      const cook = state.workers.cheesemaker > 0;
      const recipe = CM.cheesery.recipe(state, state.cookRecipe);
      m.title = 'Cheesery · ' + state.recipes.length + ' recipe' + (state.recipes.length === 1 ? '' : 's');
      if (job) {
        const r = job.recipeId ? CM.cheesery.recipe(state, job.recipeId) : null;
        m.status = (job.kind === 'experiment' && !r ? 'Experimenting with a new combination' : 'Making ' + (r ? r.name : 'cheese')) + (cook ? ' · automated' : '');
        m.kind = 'cheeseBoost';
        m.label = 'SPEED UP';
        m.sub = 'Hold to boost';
        m.fill = info.progress;
        m.mode = '';
      } else {
        m.kind = 'open:cheese';
        m.label = state.recipes.length ? 'MAKE CHEESE' : 'EXPERIMENT';
        const st2 = cook ? P.workerStatus('cheesemaker', CM.cheesery.autoStatus(state)) : null;
        m.status = cook ? 'Cheesemaker: ' + st2[0] + (recipe ? ' · ' + recipe.name : '') : info.state === 'ready' ? 'Ready: you have Cheese Base to use' : 'Needs Cheese Base from the Refinery';
        m.tone = cook ? st2[1] : info.state === 'ready' ? 'good' : 'warn';
        m.sub = state.recipes.length ? 'Open the Recipe Book' : 'Discover your first recipe';
        m.mode = info.state === 'ready' ? 'hot' : '';
      }
      m.side = P.btn('open:cheese', (cook ? 'COOK: ' + (recipe ? P.esc(recipe.name) : 'choose') : 'RECIPES') + '<br>open book', { cls: 'buy' }) + m.side;
      return m;
    }

    const n = info.ready || 0;
    const waiting = state.orders.filter((o) => o && o.id).length;
    m.title = 'Market · ' + waiting + ' buyer' + (waiting === 1 ? '' : 's') + ' waiting';
    m.status = n ? n + ' order' + (n === 1 ? '' : 's') + ' you can fill right now' : q.lotsTotal(state) ? 'None of your cheese fits these orders' : 'You have no cheese to sell yet';
    m.tone = n ? 'good' : 'warn';
    m.kind = 'open:market';
    m.label = 'SELL';
    m.sub = n ? n + ' ready!' : 'See the orders';
    m.mode = n ? 'hot' : '';
    m.side = '';
    return m;
  }

  function updateDock() {
    const m = dockModel(ui.station);
    ui.dockKind = m.kind;
    set($('dock-title'), 'text', m.title);
    set($('dock-status'), 'text', m.status);
    set($('dock-status'), 'cls', m.tone);
    set(els.main.querySelector('b'), 'text', m.label);
    set(els.main.querySelector('small'), 'text', m.sub);
    set(els.main.querySelector('.fill'), 'width', Math.round(m.fill * 100) + '%');
    for (const cls of ['hot', 'locked', 'idle', 'blocked']) set(els.main, cls, m.mode === cls);
    for (const st of STATIONS) set(els.main, 'st-' + st, st === ui.station);
    if (m.side !== ui.dockHtml) {
      ui.dockHtml = m.side;
      $('dock-side').innerHTML = m.side;
    }
  }

  // Acción del botón grande según la estación.
  const REPEATABLE = { mine: 1, drill: 1, refine: 1, cheeseBoost: 1 };
  function mainAction() {
    const kind = ui.dockKind;
    if (kind === 'mine') return report(CM.mining.hit(state, 'manual'), els.main);
    if (kind === 'drill') return report(CM.drilling.tap(state), els.main);
    if (kind === 'refine') return report(CM.refining.tap(state), els.main);
    if (kind === 'cheeseBoost') return report(CM.cheesery.tap(state), els.main);
    if (kind.startsWith('goto:')) return select(kind.slice(5));
    if (kind.startsWith('open:')) return openPanel(kind.slice(5));
    if (kind.startsWith('build:')) {
      const id = kind.slice(6);
      const info = CM.construction.buildInfo(state, id);
      if (!info.condOk) return report(CM.fail('locked'), els.main), toast(info.condText);
      return report(CM.construction.build(state, id), els.main);
    }
  }
  // Mantener pulsado repite la acción: no hace falta machacar el botón.
  let holdTimer = 0;
  const stopHold = () => clearInterval(holdTimer);
  els.main.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    stopHold();
    mainAction();
    if (REPEATABLE[ui.dockKind]) holdTimer = setInterval(() => (REPEATABLE[ui.dockKind] ? mainAction() : stopHold()), 160);
  });
  for (const type of ['pointerup', 'pointerleave', 'pointercancel']) els.main.addEventListener(type, stopHold);
  window.addEventListener('blur', stopHold);

  for (const st of STATIONS) tiles[st].addEventListener('click', () => select(st));
  window.addEventListener('keydown', (e) => {
    if (e.repeat || ui.panel || !$('modal').hidden) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 5) select(STATIONS[n - 1]);
    if (e.key === ' ') {
      e.preventDefault();
      mainAction();
    }
  });

  // Escena: arrastrar para desplazar la colonia, tocar un edificio para seleccionarlo o usarlo.
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
    if (!id) return;
    if (id === 'house' || id === 'storage') return openPanel('colony');
    // Tocar la estación ya seleccionada hace su acción; tocar otra la selecciona.
    if (ui.station === id) {
      updateDock();
      mainAction();
    } else select(id, true);
  });
  stage.addEventListener('pointercancel', () => (drag = null));

  // ---------- Paneles ----------
  const FOCUS = { cheese: 'cheesery', market: 'market', colony: 'house' };
  function openPanel(name) {
    if ((name === 'cheese' && !state.built.cheesery) || (name === 'market' && !state.built.market)) return select(name === 'cheese' ? 'cheesery' : 'market');
    if (name === 'cheese' && !state.recipes.length) ui.cheeseTab = 'experiment';
    ui.panel = name;
    ui.lastHtml = '';
    $('sheet-title').textContent = P.TITLES[name];
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
    const html = P.render(ui.panel, state, ui);
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
    unlock: (id) => CM.deposits.unlock(state, id),
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
    cook: (id) => CM.cheesery.assign(state, id || ''),
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
    ui.dockHtml = null;
    dirty = true;
  }
  $('sheet').addEventListener('click', onAct);
  $('dock-side').addEventListener('click', onAct);
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
    const combo = CM.cheesery.parseKey(recipe.key);
    showModal(
      '<h2>' + (isNew ? 'NEW RECIPE!' : 'RENAME RECIPE') + '</h2><div class="hero">' + I.img('lot', combo.base, 'huge') + '</div><p class="hint">' + P.comboLine(combo) + '</p><div class="stats">' + P.statLine(CM.cheesery.statsOf(recipe)) +
        '</div><input id="name-input" maxlength="24" autocomplete="off" value="' + P.esc(recipe.name) + '" /><p class="hint">' + (isNew ? 'It is in your Recipe Book now, with 1 cheese ready to sell. Give it a name:' : 'Pick a new name:') + '</p><div class="row"><button class="buy" data-m="ok">SAVE</button></div>',
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

  // Explica qué se acaba de comprar al abrir una zona.
  function zoneOpened(id) {
    const def = q.depDef(id);
    const total = def.veins.reduce((a, v) => a + v.capacity, 0);
    const recipes = Object.keys(B.ingredients).length * Object.keys(B.treatments).length * Object.keys(B.maturations).length;
    showModal(
      '<h2>NEW ZONE OPENED!</h2><div class="hero">' + I.img('raw', def.base, 'huge') + I.img('base', def.base, 'huge') + I.img('lot', def.base, 'huge') + '</div><p class="hint"><b>' + def.name + '</b> is a new rock with ' + def.veins.length + ' veins and ' + total + ' Raw Cheese in total.</p><ul class="list"><li>It gives ' + B.bases[def.base].name + ', a new cheese base.</li><li>' + recipes + ' new recipes to discover in the Cheesery.</li><li>Your buildings, workers and stock come with you.</li><li>You can travel between zones any time in COLONY.</li></ul><div class="row"><button class="close" data-m="no">LATER</button><button class="buy" data-m="ok">TRAVEL NOW</button></div>',
      {
        no() {},
        ok() {
          CM.deposits.setActive(state, id);
          closePanel();
        },
      }
    );
  }

  function showOffline(sum) {
    if (!sum) return;
    const d = sum.delta;
    const mins = Math.round(sum.simulatedMs / 60000);
    const base = baseOfActive();
    const lines = [];
    if (d.veinsFound) lines.push('Veins found: ' + d.veinsFound);
    if (d.rawProduced) lines.push(I.img('raw', base) + 'Raw Cheese drilled: +' + d.rawProduced);
    if (d.baseProduced) lines.push(I.img('base', base) + 'Cheese Base refined: +' + d.baseProduced + ' (used ' + d.rawConsumed + ' Raw)');
    if (d.lotsProduced) lines.push(I.img('lot', base) + 'Cheese made: +' + d.lotsProduced);
    const stops = sum.workers.map((w) => B.workers[w.role].name + ': ' + P.workerStatus(w.role, w.status)[0].toLowerCase());
    // Sin nada automatizado ni producido no hay nada que contar.
    if (!lines.length && (!sum.automated || sum.simulatedMs < 60000)) return;
    showModal(
      '<h2>WELCOME BACK</h2><p class="hint">Away ' + (mins < 1 ? 'under a minute' : mins + ' min') + (sum.capped ? ' (only the first ' + Math.round(B.offline.capMs / 3600000) + ' h count)' : '') + '</p>' +
        (lines.length ? '<ul class="list plain">' + lines.map((l) => '<li>' + l + '</li>').join('') + '</ul>' : '<p class="hint">' + (sum.automated ? 'Your workers had nothing they could do.' : 'Nothing was produced: no stage is automated yet. Hire workers to keep the colony running.') + '</p>') +
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

  const syncShown = () => (ui.shown = { coins: state.coins, raw: q.rawTotal(state), base: q.baseTotal(state), lots: q.lotsTotal(state) });

  function replaceState(next) {
    state = next;
    CM.events.length = 0;
    CM.telemetry.resetSamples();
    scene.reset();
    select('rock');
    setIcons();
    syncShown();
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
    else if (prop === 'cls') el.className = value;
    else el.classList.toggle(prop, value);
  }

  function setIcons() {
    const base = baseOfActive();
    $('ic-coins').src = I.url('coin');
    $('ic-raw').src = I.url('raw', base);
    $('ic-base').src = I.url('base', base);
    $('ic-lots').src = I.url('lot', base);
    tiles.rock.querySelector('img').src = I.url('pick');
    tiles.drill.querySelector('img').src = I.url('raw', base);
    tiles.refinery.querySelector('img').src = I.url('base', base);
    tiles.cheesery.querySelector('img').src = I.url('lot', base);
    tiles.market.querySelector('img').src = I.url('coin');
  }

  // Los contadores ruedan hacia su valor real en vez de saltar.
  function roll(key, target) {
    const cur = ui.shown[key];
    if (cur === target) return target;
    const step = Math.max(1, Math.ceil(Math.abs(target - cur) * 0.18));
    return (ui.shown[key] = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step));
  }

  function updateHUD() {
    const caps = q.caps(state);
    set($('coins'), 'text', String(roll('coins', state.coins)));
    set($('raw'), 'text', roll('raw', q.rawTotal(state)) + '/' + caps.raw);
    set($('base'), 'text', roll('base', q.baseTotal(state)) + '/' + caps.base);
    set($('lots'), 'text', roll('lots', q.lotsTotal(state)) + '/' + caps.lots);
    set($('res-raw'), 'full', q.rawTotal(state) >= caps.raw);
    set($('res-base'), 'full', q.baseTotal(state) >= caps.base);
    set($('res-lots'), 'full', q.lotsTotal(state) >= caps.lots);

    const obj = CM.sim.objective(state);
    set($('obj-text'), 'text', (obj.done ? '' : 'GOAL: ') + obj.text);
    set($('obj-num'), 'text', obj.hasBar ? obj.cur + '/' + obj.max : '');
    set($('obj-fill'), 'width', (obj.hasBar ? Math.round((obj.cur / obj.max) * 100) : obj.done ? 100 : 0) + '%');

    const comboOn = CM.mining.status(state) === 'ready' && state.combo >= 3 && state.clock - state.lastHitAt <= B.mining.comboWindowMs;
    set(els.combo, 'on', comboOn);
    if (comboOn) set(els.combo, 'text', 'COMBO x' + state.combo + (state.combo % B.mining.critEvery === B.mining.critEvery - 1 ? '  CRIT NEXT!' : ''));
    set($('devflag'), 'text', CM.dev.paused ? 'PAUSED' : CM.dev.speed > 1 ? 'SPEED x' + CM.dev.speed : '');

    updateChain();
    updateDock();
    document.querySelectorAll('[data-job]').forEach((el) => (el.style.width = Math.round(progress(state.jobs[el.dataset.job]) * 100) + '%'));
  }

  // Aviso en COLONY: solo cuando hay algo nuevo que se puede comprar ahí.
  function updateDots() {
    const C = CM.construction;
    const colony =
      ['storage', 'house'].some((id) => C.buildInfo(state, id).canBuild || (state.built[id] && C.upgradeInfo(state, id).canUpgrade)) ||
      B.deposits.some((d) => d.inAlpha !== false && !state.deposits[d.id].unlocked && state.coins >= CM.deposits.unlockCost(state, d.id)) ||
      CM.workers.roles.some((r) => CM.workers.hireInfo(state, r).canHire);
    $('nav-colony').querySelector('.dot').classList.toggle('on', colony);
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
    syncShown();
    showOffline(sum);
  }

  window.addEventListener('resize', scene.resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) CM.storage.save(state, Date.now());
    else comeBack();
  });
  window.addEventListener('pagehide', () => CM.storage.save(state, Date.now()));

  setIcons();
  // Al volver, se abre la estación que pide el objetivo actual.
  const startAt = GOAL_AT[CM.sim.objective(state).id];
  select(STATIONS.indexOf(startAt) >= 0 ? startAt : 'rock');
  if (loaded.recovered) toast('Your save was damaged, so a new game was started');
  if (!loaded.isNew) comeBack();
  else CM.storage.save(state, Date.now());
  // Acceso para depurar desde la consola del navegador.
  window.CM_DEBUG = {
    get state() {
      return state;
    },
    comeBack,
    select,
  };
  requestAnimationFrame(frame);
})();
