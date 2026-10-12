// Conecta simulación, escena, HUD, cadena de estaciones, árboles, sonido y guardado.
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
  const STATIONS = ['rock', 'drill', 'refinery', 'cheesery', 'shop'];
  const SKILL = { rock: 'mining', drill: 'drilling', refinery: 'refining', cheesery: 'cheesemaking', shop: 'trading' };
  const ui = {
    panel: null,
    tree: 'mining',
    station: 'rock',
    zone: B.zones[0].id, // roca que se ve en la escena
    cheeseTab: 'experiment',
    combo: { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' },
    lastHtml: '',
    dockHtml: null,
    lanesKey: null,
    dockKind: 'mine',
    shown: {},
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
    if (at[0] < 0.03 || at[0] > 0.97 || els.floaters.childElementCount > 26) return;
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.innerHTML = text;
    el.style.setProperty('--r', (Math.random() * 16 - 8).toFixed(1) + 'deg');
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
  // Los ratones producen sin parar: se limita cada sonido para no saturar.
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
    if (els.flyers.childElementCount > 30) return onArrive && onArrive();
    const a = pointOf(from);
    const b = pointOf(to);
    const n = Math.max(1, Math.min(count, 5));
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
  const punch = () => retrigger($('scene'), 'punch');
  const baseOfZone = () => q.zoneDef(ui.zone).base;
  const recipeBase = (id) => {
    const r = CM.cheesery.recipe(state, id);
    return r ? CM.cheesery.parseKey(r.key).base : 'cheddar';
  };

  function feedback(ev, now) {
    scene.onEvent(ev, state, now, ui.zone);
    const here = !ev.zone || ev.zone === ui.zone;
    switch (ev.type) {
      case 'hit':
        if (!here) break;
        // El número del golpe es progreso de búsqueda, no un recurso.
        // Solo los golpes del jugador enseñan número; los de los ratones no, para no llenar la pantalla.
        if (ev.source !== 'manual') break;
        float('+' + CM.fmt(Math.max(1, Math.round(ev.amount))), 'rock', ev.crit ? 'crit' : 'search');
        play('hit', ev.combo);
        buzz(ev.crit ? 25 : 8);
        if (ev.crit) {
          punch();
          play('crit');
          float('CRIT!', 'rock', 'crit big');
        }
        if (ev.combo >= 3) retrigger(els.combo, 'pop');
        break;
      case 'reveal':
        if (!here) {
          tileBump('rock');
          break;
        }
        play('reveal');
        buzz([30, 40, 80]);
        punch();
        banner('CHEESE VEIN FOUND!');
        float(CM.fmt(ev.capacity) + ' RAW INSIDE', 'rock', 'info');
        // Si el taladro aún no existe, es el jugador quien va a su casilla a construirlo.
        if (ui.station === 'rock' && state.built.drill && !q.auto(state, 'drilling', ui.zone)) select('drill');
        break;
      case 'drillStart':
        if (here && ev.source === 'manual') play('start');
        break;
      case 'refineStart':
      case 'sellStart':
        // Los iconos solo vuelan cuando se GANA algo (del edificio al contador), nunca al gastar.
        if (ev.source === 'manual') play('start');
        break;
      case 'drillBoost':
      case 'refineBoost':
      case 'cheeseBoost':
      case 'sellBoost':
        play('boost');
        buzz(5);
        break;
      case 'drillDone':
        play('raw');
        if (here) float(I.img('raw', ev.base) + '+' + CM.fmt(ev.amount), 'rock', 'raw');
        fly(I.url('raw', ev.base), here ? 'rock' : tiles.drill, $('res-raw'), Math.min(4, ev.amount), () => bump('res-raw'));
        tileBump('drill');
        break;
      case 'deeper':
        if (here) {
          play('newRock');
          float('DEPTH ' + ev.depth + ': RICHER CHEESE', 'rock', 'lot');
          if (ui.station === 'drill' && !q.auto(state, 'mining', ui.zone)) {
            select('rock');
            toast('Vein used up. The rock goes deeper: mine to find the next vein');
          }
        } else toast(q.zoneDef(ev.zone).name + ' reached depth ' + ev.depth, true);
        break;
      case 'refineDone':
        play('base');
        float(I.img('base', ev.base) + '+' + CM.fmt(ev.amount), 'refinery', 'base');
        fly(I.url('base', ev.base), 'refinery', $('res-base'), Math.min(4, ev.amount), () => bump('res-base'));
        tileBump('refinery');
        break;
      case 'lotDone': {
        const base = recipeBase(ev.recipeId);
        play('lot');
        float(I.img('lot', base) + '+1', 'cheesery', 'lot');
        fly(I.url('lot', base), 'cheesery', $('res-lots'), 1, () => bump('res-lots'));
        tileBump('cheesery');
        break;
      }
      case 'recipeDiscovered': {
        // Sin ventana que interrumpa: aviso y a seguir. Se renombra desde el libro.
        const found = CM.cheesery.recipe(state, ev.recipeId);
        play('reveal');
        scene.celebrate();
        banner('NEW RECIPE: ' + found.name.toUpperCase());
        toast(found.name + ' sells for ' + CM.fmt(CM.shop.price(state, found)) + ' coins. It is in your Recipe Book', true);
        break;
      }
      case 'candidates': {
        const best = Math.max(...state.candidates.map((c) => c.rarity || 0));
        play(best ? 'reveal' : 'bell');
        if (best) {
          scene.celebrate();
          banner('A ' + B.mice.rarities[best].name.toUpperCase() + ' MOUSE CAME BY!');
        }
        break;
      }
      case 'album':
        if (!state.candidates.length) toast('New in your album: ' + ev.keys.slice(0, 4).map((k) => CM.mice.albumItem(k).name).join(', ') + (ev.keys.length > 4 ? '...' : '') + '. Customers now pay x' + (1 + q.albumBonus(state)).toFixed(2), true);
        break;
      case 'recruited': {
        const mouse = CM.mice.byId(state, ev.id);
        if (mouse.rarity === 2) legendMoment(mouse, mouse.traits[0], true);
        else play('build');
        scene.celebrate();
        banner(mouse.name.toUpperCase() + ' JOINED!');
        toast(mouse.post ? mouse.name + ' went to ' + CM.mice.postLabel(mouse.post) + ' and works there on its own' : mouse.name + ' is resting: every post has a mouse', true);
        dirty = true;
        break;
      }
      case 'traitReady': {
        const mouse = CM.mice.byId(state, ev.id);
        if (!mouse) break;
        if (ev.legend) legendOffer(mouse);
        else {
          play('bell');
          toast(mouse.name + (ev.kind === 'job' ? ' earned a speciality' : ' can learn a new trait') + '. Pick it in MICE', true);
        }
        dirty = true;
        break;
      }
      case 'traitLearned': {
        const mouse = CM.mice.byId(state, ev.id);
        const def = B.mice.traits[ev.trait];
        if (ev.mystery) revealMystery(mouse, ev.trait);
        else if (ev.kind === 'legend') legendMoment(mouse, ev.trait);
        else {
          play('reveal');
          banner(mouse.name.toUpperCase() + ': ' + def.name.toUpperCase() + '!');
        }
        dirty = true;
        break;
      }
      case 'legendOffer':
        legendOffer(CM.mice.byId(state, ev.id));
        break;
      case 'teamCombo':
        play('goal');
        scene.celebrate();
        banner((ev.rock ? 'ROCK COMBO: ' : 'LINE COMBO: ') + ev.name.toUpperCase() + '!');
        toast(ev.name + '. ' + ev.desc, true);
        dirty = true;
        break;
      case 'combo':
        for (const id of ev.combos) {
          const c = B.mice.combos.find((x) => x.id === id);
          play('goal');
          scene.celebrate();
          banner('COMBO FOUND: ' + c.name.toUpperCase() + '!');
          toast(c.needs.map((t) => B.mice.traits[t].name).join(' + ') + ' = ' + c.name + '. ' + c.desc, true);
        }
        break;
      case 'specUp': {
        const mouse = CM.mice.byId(state, ev.id);
        if (mouse && mouse.spec[ev.skill]) toast(mouse.name + ': ' + B.mice.traits[mouse.spec[ev.skill]].name + ' is now grade ' + ['', 'I', 'II', 'III'][ev.grade], true);
        dirty = true;
        break;
      }
      case 'dismissed':
        play('click');
        toast(ev.name + ' left the colony' + (ev.post && !state.mice.some((m) => m.post === ev.post) ? '. ' + CM.mice.postLabel(ev.post) + ' has no mouse now' : ''), true);
        dirty = true;
        break;
      case 'promoted': {
        const mouse = CM.mice.byId(state, ev.id);
        play('goal');
        scene.celebrate();
        banner(mouse.name.toUpperCase() + ' IS NOW ' + B.mice.ranks[ev.rank].name.toUpperCase() + '!');
        if (mouse.post) {
          const [skill, zone] = mouse.post.split(':');
          toast(CM.mouseRate(state, Object.assign({}, mouse, { rank: ev.rank - 1 }), skill, zone) + ' > ' + CM.mouseRate(state, mouse, skill, zone) + (B.mice.ranks[ev.rank].manager ? ', and it buys upgrades on its own' : ''), true);
        }
        dirty = true;
        break;
      }
      case 'mouseLevel': {
        // Solo se avisa si ese ratón trabaja en la línea que se está mirando.
        const mouse = CM.mice.byId(state, ev.id);
        const [skill, zone] = mouse && mouse.post ? mouse.post.split(':') : [];
        if (skill && (zone === 'all' || zone === ui.zone)) float(P.esc(mouse.name) + ' LV ' + ev.level, B.skills[skill].station, 'info');
        break;
      }
      case 'masteryUp': {
        const recipe = CM.cheesery.recipe(state, ev.recipeId);
        play('crit');
        float('MASTERY ' + ev.level + '!', 'cheesery', 'lot');
        toast((recipe ? recipe.name : 'Recipe') + ' mastery ' + ev.level + ': worth more, cooks faster', true);
        break;
      }
      case 'sale':
        play('coin');
        buzz(15);
        fly(I.url('coin'), 'shop', $('res-coins'), Math.min(5, 2 + ev.count), () => bump('res-coins'));
        float(I.img('coin') + '+' + CM.fmt(ev.coins), 'shop', 'coins');
        tileBump('shop');
        break;
      case 'levelUp': {
        const st = B.skills[ev.skill].station;
        // Subir de nivel pasa a menudo: aviso pequeño. La celebración grande, cada 5 niveles.
        play('upgrade');
        float('LEVEL ' + ev.level + '!', st, 'lot');
        if (ev.level % 5 === 0) {
          play('goal');
          scene.celebrate();
          banner(B.skills[ev.skill].name.toUpperCase() + ' LEVEL ' + ev.level + '!');
        }
        tileBump(st);
        // Avisa de lo que desbloquea ese nivel.
        const unlocked = B.trees[ev.skill].filter((n) => n.level === ev.level).map((n) => n.name);
        const buyer = ev.skill === 'trading' ? B.shop.buyers.find((b) => b.level === ev.level) : null;
        const parts = ev.skill === 'cheesemaking' ? ['ingredients', 'treatments', 'maturations'].flatMap((t) => Object.values(B[t]).filter((x) => x.level === ev.level).map((x) => x.name)) : [];
        const news = unlocked.concat(parts);
        if (buyer) toast('New customers: ' + buyer.name + ' pay x' + buyer.mult, true);
        else if (news.length) toast('Unlocked: ' + news.join(', '), true);
        dirty = true;
        break;
      }
      case 'purchase':
        if (ev.cost > 0) {
          const el = document.createElement('div');
          el.className = 'spend';
          el.textContent = '-' + CM.fmt(ev.cost);
          $('res-coins').appendChild(el);
          el.addEventListener('animationend', () => el.remove());
        }
        break;
      case 'nodeBought': {
        const node = CM.tree.node(ev.skill, ev.id);
        play(ev.auto && node.max === 1 ? 'build' : 'upgrade');
        if (ev.auto && node.max === 1) {
          banner(node.name.toUpperCase() + ' HIRED!');
          scene.celebrate();
        }
        if (ev.skill === 'cheesemaking' && ev.id === 'maker' && state.recipes.length) {
          ui.cheeseTab = 'book';
          openPanel('cheese');
        }
        dirty = true;
        break;
      }
      case 'built':
        punch();
        play('build');
        banner(B.buildings[ev.id].name.toUpperCase() + ' BUILT!');
        toast(UNLOCK[ev.id].then, true);
        scene.focus(ev.id);
        scene.celebrate();
        dirty = true;
        break;
      case 'zoneUnlocked':
        play('reveal');
        scene.celebrate();
        zoneOpened(ev.id);
        dirty = true;
        break;
      case 'goal':
        retrigger($('objective'), 'done');
        // Los primeros pasos ya tienen su propia tarjeta explicativa: sin más avisos encima.
        if (UNLOCK[ev.id] || ev.id === 'vein') {
          play('upgrade');
        } else if (ev.id === 'sale') {
          play('goal');
          firstSaleCard();
        } else {
          play('goal');
          scene.celebrate();
          toast('Goal complete: ' + ev.text + (ev.reward ? '  +' + CM.fmt(ev.reward) + ' coins' : ''), true);
        }
        if (ev.reward) fly(I.url('coin'), $('objective'), $('res-coins'), Math.min(5, 2 + Math.floor(ev.reward / 15)), () => bump('res-coins'));
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
  function select(st, quiet) {
    ui.station = st;
    scene.select(st);
    if (!quiet) scene.focus(st);
    ui.dockHtml = null;
  }
  // Cambia la roca que se ve en la escena. Todas siguen trabajando.
  function focusZone(id) {
    if (ui.zone === id || !state.zones[id].unlocked) return;
    ui.zone = id;
    scene.onEvent({ type: 'zoneFocus' }, state, Date.now(), id);
    setIcons();
    syncShown();
    ui.dockHtml = null;
    ui.lanesKey = null;
  }

  const progress = (job) => (job ? 1 - job.remaining / job.total : 0);
  // ¿Hay base para cocinar algo en la línea que se está mirando?
  const canCook = () => !state.zones[ui.zone].cookJob && state.inv.base[baseOfZone()] >= (state.recipes.some((r) => recipeBase(r.id) === baseOfZone()) ? B.cheesery.lotBase : B.cheesery.experimentBase);

  // Estado resumido de una estación: locked, build, ready, working, waiting o blocked.
  function stationInfo(st) {
    if (st !== 'rock' && !state.built[st]) return { state: CM.construction.buildInfo(state, st).condOk ? 'build' : 'locked', progress: 0 };
    const z = state.zones[ui.zone];
    if (st === 'rock') {
      if (!z.veinRevealed) return { state: q.auto(state, 'mining', ui.zone) ? 'working' : 'ready', progress: z.discover / q.veinHits(state, ui.zone) };
      return { state: 'waiting', progress: z.veinRemaining / q.veinCapacity(state, ui.zone), vein: true };
    }
    if (st === 'drill') {
      const ms = CM.drilling.status(state, ui.zone);
      return { state: { running: 'working', ready: 'ready', 'no-vein': 'waiting' }[ms] || 'blocked', progress: progress(z.drillJob), reason: ms };
    }
    if (st === 'refinery') {
      const ms = CM.refining.status(state, ui.zone);
      return { state: { running: 'working', ready: 'ready', 'no-raw': 'waiting' }[ms] || 'blocked', progress: progress(z.refJob), reason: ms };
    }
    if (st === 'cheesery') {
      const ms = CM.cheesery.status(state, ui.zone);
      if (ms === 'running') return { state: 'working', progress: progress(z.cookJob), reason: ms };
      if (ms === 'no-recipe') return { state: 'blocked', progress: 0, reason: ms };
      return { state: ms === 'ready' || canCook() ? 'ready' : 'waiting', progress: 0, reason: ms };
    }
    const ms = CM.shop.status(state);
    return { state: { running: 'working', ready: 'ready' }[ms] || 'waiting', progress: progress(state.jobs.shop), reason: ms };
  }

  // Qué estación pide el objetivo actual.
  const GOAL_AT = { house: 'mice', mouse: 'mice', allAuto: 'mice', promote: 'mice', vein: 'rock', drill: 'drill', raw: 'drill', refinery: 'refinery', base: 'refinery', cheesery: 'cheesery', recipe: 'cheesery', shop: 'shop', sale: 'shop', recipes8: 'cheesery', zone2: 'colony', zone3: 'colony', depth3: 'rock' };

  const BUBBLE = { 'no-raw': 'NO RAW', 'no-recipe': 'NO RECIPE', 'no-base': 'NO BASE', 'no-cheese': 'NO CHEESE' };
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
      const skill = SKILL[st];
      for (const cls of ['locked', 'build', 'ready', 'working', 'waiting', 'blocked']) set(tile, cls, info.state === cls);
      set(tile, 'isnew', info.state === 'build');
      set(tile, 'sel', ui.station === st);
      set(tile, 'goal', goalAt === st && ui.station !== st);
      set(tile.querySelector('.mini > i'), 'width', Math.round(info.progress * 100) + '%');
      set(tile.querySelector('u'), 'text', 'LV ' + q.level(state, skill));
      const auto = q.auto(state, skill, ui.zone);
      const ups = info.state !== 'locked' && info.state !== 'build' ? CM.tree.affordable(state, skill) : 0;
      set(tile.querySelector('em'), 'text', info.state === 'locked' ? 'LOCK' : info.state === 'build' ? 'NEW!' : ups ? 'UP! ' + ups : auto ? 'AUTO' : '');
      // Aviso sobre el edificio solo cuando está parado por algo.
      const reason = info.state === 'blocked' || (auto && info.state === 'waiting') ? BUBBLE[info.reason] : '';
      if (st !== 'rock') bubble(st, reason || '', 'bad');
    }
    const def = q.zoneDef(ui.zone);
    bubble('rock', def.name.toUpperCase() + ' · DEPTH ' + state.zones[ui.zone].depth, 'name');
    set($('nav-colony'), 'goal', goalAt === 'colony');
  }

  // ---------- Dock: la estación seleccionada ----------
  const perMin = (amount, ms) => CM.fmt(Math.round((amount * 60000) / ms));
  const round1 = (n) => Math.round(n * 10) / 10;

  function dockModel(st) {
    const info = stationInfo(st);
    const skill = SKILL[st];
    const z = state.zones[ui.zone];
    const def = q.zoneDef(ui.zone);
    const worker = CM.mice.at(state, skill, ui.zone);
    const auto = !!worker;
    const m = { title: B.skills[skill].name, status: '', tone: '', kind: 'none', label: '', sub: '', fill: 0, mode: 'idle', tree: true };

    if (st !== 'rock' && !state.built[st]) {
      const b = CM.construction.buildInfo(state, st);
      m.title = B.buildings[st].name;
      m.status = { drill: 'Extracts Raw Cheese from an exposed vein', refinery: 'Turns Raw Cheese into Cheese Base', cheesery: 'Turns Cheese Base into cheese you can sell', shop: 'Sells your cheese for coins' }[st];
      // Lo construye el jugador aquí, en el panel, cuando ya está desbloqueado.
      if (b.condOk) {
        m.status = UNLOCK[st].why;
        m.tone = 'good';
        m.kind = 'build:' + st;
        m.label = 'BUILD';
        m.sub = 'It is free';
        m.mode = 'hot';
      } else {
        m.kind = 'locked:' + st;
        m.label = 'LOCKED';
        m.sub = b.condText;
        m.mode = 'locked';
      }
      m.tree = false;
      return m;
    }

    if (st === 'rock') {
      m.kind = 'mine';
      m.label = 'MINE';
      if (info.vein) {
        m.status = def.name + ': vein exposed, ' + CM.fmt(z.veinRemaining) + ' Raw Cheese inside';
        m.tone = 'good';
        // Con la veta a la vista, este mismo botón taladra: sin paso intermedio.
        const ds = CM.drilling.status(state, ui.zone);
        m.kind = state.built.drill ? 'drill' : 'none';
        m.label = 'DRILL';
        m.sub = ds === 'running' ? (q.auto(state, 'drilling', ui.zone) ? 'Auto · hold to boost' : 'HOLD TO BOOST!') : 'Tap to drill the vein';
        m.fill = progress(z.drillJob);
        m.mode = ds === 'ready' ? 'hot' : '';
      } else {
        const need = q.veinHits(state, ui.zone);
        m.status = 'Mining finds the vein; it gives no cheese · power ' + round1(q.pickPower(state)) + (auto ? ' · ' + worker.name + ' is mining' : '');
        m.sub = 'Search ' + CM.fmt(Math.floor(z.discover)) + '/' + CM.fmt(need);
        m.fill = z.discover / need;
        m.mode = 'hot';
      }
      return m;
    }

    if (st === 'drill' || st === 'refinery') {
      const isDrill = st === 'drill';
      m.kind = isDrill ? 'drill' : 'refine';
      m.label = isDrill ? 'DRILL' : 'REFINE';
      const y = isDrill ? q.drillYield(state, ui.zone) : q.refineBatch(state) * q.refineMult(state);
      const d = isDrill ? q.drillDuration(state) : q.refineDuration(state);
      m.status = (isDrill ? '+' + round1(y) + ' Raw' : q.refineBatch(state) * B.refinery.rawPerBase + ' Raw > ' + round1(y) + ' Base') + ' / ' + P.secs(d) + ' · ' + perMin(y, d) + '/min' + (auto ? ' · automated' : '');
      if (info.state === 'working') {
        m.sub = auto ? 'Auto · hold to boost' : 'HOLD TO BOOST!';
        m.fill = info.progress;
        m.mode = '';
      } else if (info.state === 'ready') {
        m.sub = 'Tap to start';
        m.mode = 'hot';
      } else {
        m.status = { 'no-vein': 'Waiting: no vein exposed in ' + def.name + '. Mine the rock', 'no-raw': 'Waiting: needs ' + B.refinery.rawPerBase + ' Raw ' + B.bases[def.base].name + ' from its drill' }[info.reason];
        m.tone = info.state === 'blocked' ? 'bad' : 'warn';
        m.sub = BUBBLE[info.reason] || 'Waiting';
        m.mode = info.state === 'blocked' ? 'blocked' : 'idle';
      }
      return m;
    }

    if (st === 'cheesery') {
      const job = z.cookJob;
      const recipe = CM.cheesery.recipe(state, z.cookRecipe);
      const cheese = B.bases[def.base].name;
      if (job) {
        const r = job.recipeId ? CM.cheesery.recipe(state, job.recipeId) : null;
        m.status = (job.kind === 'experiment' && !r ? 'Experimenting with a new combination' : 'Making ' + (r ? r.name : 'cheese')) + (auto ? ' · automated' : '');
        m.kind = 'cheeseBoost';
        m.label = 'SPEED UP';
        m.sub = 'Hold to boost';
        m.fill = info.progress;
        m.mode = '';
      } else {
        m.kind = 'open:cheese';
        m.label = state.recipes.length ? 'RECIPES' : 'NEW RECIPE';
        const text = { 'no-recipe': 'You know no ' + cheese + ' recipe yet. Discover one', 'no-base': 'Cheesemaker waiting for ' + cheese + ' Base', 'no-coins': 'Cheesemaker has no coins for the ingredient' }[info.reason];
        m.status = text || (info.state === 'ready' ? 'Ready: you have ' + cheese + ' Base to use' : 'Needs ' + cheese + ' Base from the Refinery');
        m.tone = info.state === 'blocked' ? 'bad' : info.state === 'ready' ? 'good' : 'warn';
        m.sub = recipe && auto ? 'Cooking: ' + recipe.name : state.recipes.length ? state.recipes.length + '/' + CM.cheesery.totalCombos() + ' discovered' : 'Discover your first recipe';
        m.mode = info.state === 'ready' || info.reason === 'no-recipe' ? 'hot' : '';
      }
      m.book = !!job;
      return m;
    }

    const buyer = q.buyer(state);
    m.kind = 'sell';
    m.label = 'SELL';
    m.status = 'Customers: ' + buyer.name + ' (x' + buyer.mult + ') · ' + q.sellCount(state) + ' per sale / ' + P.secs(q.sellDuration(state)) + (auto ? ' · automated' : '');
    if (info.state === 'working') {
      m.sub = (auto ? 'Auto · ' : '') + 'selling for ' + CM.fmt(state.jobs.shop.coins);
      m.fill = info.progress;
      m.mode = '';
    } else if (info.state === 'ready') {
      m.sub = q.lotsTotal(state) + ' cheese to sell';
      m.mode = 'hot';
    } else {
      m.status = 'No cheese to sell yet. Make some in the Cheesery';
      m.tone = 'warn';
      m.sub = 'NO CHEESE';
    }
    return m;
  }

  function updateDock() {
    const st = ui.station;
    const skill = SKILL[st];
    const m = dockModel(st);
    const p = q.xpProgress(state, skill);
    ui.dockKind = m.kind;
    set($('dock-title'), 'text', m.title + (m.tree ? ' · LV ' + p.level : ''));
    set($('dock-xp'), 'width', (m.tree ? Math.round((p.cur / p.need) * 100) : 0) + '%');
    set($('dock-xpnum'), 'text', m.tree ? (p.maxed ? 'MAX' : CM.fmt(p.cur) + '/' + CM.fmt(p.need) + ' xp') : '');
    set($('dock-status'), 'text', m.status);
    set($('dock-status'), 'cls', m.tone);
    set(els.main.querySelector('b'), 'text', m.label);
    set(els.main.querySelector('small'), 'text', m.sub);
    set(els.main.querySelector('.fill'), 'width', Math.round(m.fill * 100) + '%');
    for (const cls of ['hot', 'locked', 'idle', 'blocked']) set(els.main, cls, m.mode === cls);
    for (const s2 of STATIONS) set(els.main, 'st-' + s2, s2 === st);

    // Compra rápida: la mejora más barata de esta habilidad, de un toque y sin
    // abrir el árbol. Debajo, el acceso al árbol entero.
    let side = '';
    if (m.tree) {
      let pick = null;
      let locked = 0;
      for (const node of B.trees[skill]) {
        const info = CM.tree.info(state, skill, node.id);
        if (info.locked) locked += 1;
        else if (!info.maxed && (!pick || info.cost < pick.cost)) pick = { node, cost: info.cost, can: info.canBuy };
      }
      if (pick) side += P.btn('node:' + skill + ':' + pick.node.id, P.esc(pick.node.name) + '<br>' + P.coin(pick.cost), { cls: 'buy' + (pick.can ? ' ready' : ''), off: !pick.can, cost: pick.cost });
      const n = CM.tree.affordable(state, skill);
      side += P.btn('tree:' + skill, m.book ? 'TREE' : 'ALL UPGRADES' + (n > 1 ? ' · ' + n : ''), { cls: 'buy calm small' });
      if (m.book) side += P.btn('open:cheese', 'RECIPES', { cls: 'buy calm small' });
      // Quién trabaja en este puesto.
      const worker = CM.mice.at(state, skill, ui.zone);
      if (state.built.house) side += P.btn(worker ? 'open:mice:' + worker.id : 'open:mice', worker ? (worker.offer ? 'PICK A TRAIT: ' + P.esc(worker.name).toUpperCase() : CM.mice.promoteInfo(state, worker).can ? 'PROMOTE ' + P.esc(worker.name).toUpperCase() : P.esc(worker.name) + ' · LV ' + CM.mice.level(worker)) : 'NO MOUSE HERE', { cls: 'buy calm small' + (worker ? (worker.offer || CM.mice.promoteInfo(state, worker).can ? ' ready' : '') : ' warn') });
    }
    if (side !== ui.dockHtml) {
      ui.dockHtml = side;
      $('dock-side').innerHTML = side;
    }

    updateLanes();
  }

  // ---------- Líneas: una fila por queso, con su recorrido completo ----------
  // Roca -> Raw -> Base -> queso. Cada paso con su cantidad y su barra, y una
  // frase que dice qué le pasa a esa línea. Tocar una fila la enseña en la escena.
  const laneEls = {};
  function laneWhy(def) {
    const z = state.zones[def.id];
    const name = B.bases[def.base].name;
    const auto = (k) => q.auto(state, k, def.id);
    if (!z.veinRevealed) {
      const pct = Math.floor((z.discover / q.veinHits(state, def.id)) * 100);
      return auto('mining') ? ['A mouse is searching for the next vein: ' + pct + '%', ''] : ['No vein: mine this rock (' + pct + '%)', 'warn'];
    }
    if (!state.built.drill) return ['Vein found: build the drill', 'warn'];
    if (!auto('drilling') && !z.drillJob) return ['Drill idle: tap DRILL', 'warn'];
    if (state.built.refinery && !auto('refining') && !z.refJob && CM.refining.status(state, def.id) === 'ready') return ['Raw ' + name + ' waiting: tap REFINE', 'warn'];
    if (state.built.cheesery) {
      const cs = CM.cheesery.status(state, def.id);
      if (cs === 'no-recipe') return ['No ' + name + ' recipe yet: discover one in CHEESE', 'bad'];
      if (cs === 'no-coins') return ['No coins for the ingredient', 'bad'];
      if (cs === 'idle' && state.inv.base[def.base] >= B.cheesery.lotBase) return [name + ' Base waiting: make cheese', 'warn'];
    }
    return ['Running', 'good'];
  }
  function updateLanes() {
    const open = state.built.drill ? q.openZones(state) : [];
    const key = open.map((d) => d.id).join(',') + '|' + ui.zone;
    if (key !== ui.lanesKey) {
      ui.lanesKey = key;
      let h = '';
      for (const def of open) {
        const cell = (kind, part) => '<span class="lcell">' + I.img(kind, def.base) + '<b data-l="' + part + '"></b><i><i data-l="' + part + 'bar"></i></i></span>';
        h += '<button data-act="zone:' + def.id + '" data-lane="' + def.id + '" class="lane' + (ui.zone === def.id ? ' on' : '') + '"><span class="lhead"><b>' + B.bases[def.base].name + '</b><u data-l="depth"></u></span><span class="lrow">' + cell('raw', 'raw') + '<i class="arrow"></i>' + cell('base', 'base') + '<i class="arrow"></i>' + cell('lot', 'lots') + '</span><em data-l="why"></em></button>';
      }
      $('dock-zones').innerHTML = h;
      for (const def of open) {
        const root = $('dock-zones').querySelector('[data-lane="' + def.id + '"]');
        laneEls[def.id] = {};
        root.querySelectorAll('[data-l]').forEach((el) => (laneEls[def.id][el.dataset.l] = el));
      }
    }
    for (const def of open) {
      const z = state.zones[def.id];
      const e = laneEls[def.id];
      const why = laneWhy(def);
      set(e.depth, 'text', 'DEPTH ' + z.depth);
      // La frase solo ocupa sitio cuando la línea necesita algo; si va bien, basta el borde verde.
      set(e.why, 'text', why[1] === 'good' ? '' : why[0]);
      set(e.why, 'cls', why[1]);
      set(e.raw.closest('.lane'), 'ok', why[1] === 'good');
      set(e.raw, 'text', CM.fmt(state.inv.raw[def.base]));
      set(e.base, 'text', CM.fmt(state.inv.base[def.base]));
      set(e.lots, 'text', CM.fmt(q.lotsOfBase(state, def.base)));
      // Bajo cada recurso, el progreso del ciclo que lo está produciendo.
      set(e.rawbar, 'width', Math.round(progress(z.drillJob) * 100) + '%');
      set(e.basebar, 'width', Math.round(progress(z.refJob) * 100) + '%');
      set(e.lotsbar, 'width', Math.round(progress(z.cookJob) * 100) + '%');
    }
  }

  // Acción del botón grande según la estación.
  const REPEATABLE = { mine: 1, drill: 1, refine: 1, cheeseBoost: 1, sell: 1 };
  function mainAction() {
    const kind = ui.dockKind;
    if (kind === 'mine') return report(CM.mining.hit(state, ui.zone, 'manual'), els.main);
    if (kind === 'drill') return report(CM.drilling.tap(state, ui.zone), els.main);
    if (kind === 'refine') return report(CM.refining.tap(state, ui.zone), els.main);
    if (kind === 'cheeseBoost') return report(CM.cheesery.tap(state, ui.zone), els.main);
    if (kind === 'sell') return report(CM.shop.tap(state), els.main);
    if (kind.startsWith('goto:')) return select(kind.slice(5));
    if (kind.startsWith('open:')) return openPanel(kind.slice(5));
    if (kind.startsWith('locked:')) return report(CM.fail('locked'), els.main), toast(CM.construction.buildInfo(state, kind.slice(7)).condText);
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

  // Escena: arrastrar para desplazar; tocar un edificio lo selecciona y hace su acción.
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
    if (id === 'storage') return openPanel('stock');
    if (id === 'house') return openPanel('mice');
    const same = ui.station === id;
    if (!same) select(id, true);
    updateDock();
    if (same || REPEATABLE[ui.dockKind]) mainAction();
  });
  stage.addEventListener('pointercancel', () => (drag = null));

  // ---------- Paneles ----------
  function openPanel(name) {
    if (name === 'cheese' && !state.built.cheesery) return select('cheesery');
    if (name === 'cheese' && !state.recipes.length) ui.cheeseTab = 'experiment';
    ui.panel = name;
    ui.lastHtml = '';
    $('sheet-title').textContent = P.title(name, ui);
    $('sheet').hidden = false;
    $('sheet-body').scrollTop = 0;
    if (name === 'cheese') scene.focus('cheesery');
    if (name === 'mice') {
      ui.sel = null;
      ui.card = null;
      ui.traitInfo = '';
      ui.miceTab = '';
      if (state.built.house) scene.focus('house');
    }
    renderPanel();
  }
  function openTree(skill) {
    ui.tree = skill;
    openPanel('tree');
    scene.focus(skill === 'colony' ? 'storage' : B.skills[skill].station);
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
      updateAfford();
    }
    const rep = $('dev-report');
    if (rep) rep.textContent = CM.dev.report(state);
  }
  $('nav-colony').addEventListener('click', () => openTree('colony'));
  $('nav-mice').addEventListener('click', () => openPanel('mice'));
  // Tocar un contador de recurso abre la despensa.
  for (const id of ['res-raw', 'res-base', 'res-lots']) $(id).addEventListener('click', () => openPanel('stock'));
  $('nav-menu').addEventListener('click', () => openPanel('options'));
  const muteLabel = () => {};
  // Compra todo lo que alcance en todos los árboles, de más barato a más caro.
  const buyable = () => Object.keys(B.trees).reduce((a, k) => a + ((B.skills[k] ? state.built[B.skills[k].station] !== false : true) ? CM.tree.affordable(state, k) : 0), 0);
  $('nav-all').addEventListener('click', () => {
    let bought = 0;
    for (let round = 0; round < 50; round++) {
      let any = 0;
      for (const skill of Object.keys(B.trees)) {
        const r = CM.tree.buyAll(state, skill);
        if (r.ok) any += r.bought;
      }
      if (!any) break;
      bought += any;
    }
    drainEvents();
    ui.dockHtml = null;
    dirty = true;
    if (bought) toast('Bought ' + bought + ' upgrade' + (bought === 1 ? '' : 's'), true);
    else report(CM.fail('no-coins'), $('nav-all'));
  });
  // Clic suave en cualquier botón que no sea el de acción principal (ese ya suena por sí mismo).
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('button');
    if (b && b !== els.main) sfx.click();
  });

  const ACTS = {
    close: closePanel,
    noop: () => {},
    tree: (skill) => void openTree(skill),
    node: (skill, id) => CM.tree.buy(state, skill, id),
    buyAll: (skill) => CM.tree.buyAll(state, skill),
    zone: (id) => {
      if (state.zones[id].unlocked) return void focusZone(id);
      return CM.zones.unlock(state, id);
    },
    build: (id) => CM.construction.build(state, id),
    recruit: () => CM.mice.offer(state),
    choose: (i) => CM.mice.choose(state, Number(i)),
    bestfit: () => CM.mice.bestFit(state),
    // Colonia: tocar un ratón lo selecciona; tocarlo otra vez (o OPEN) abre su ficha.
    sel: (id) => void (ui.sel = id),
    unsel: () => void (ui.sel = null),
    card: (id) => {
      ui.card = id;
      ui.sel = null;
      ui.traitInfo = '';
      $('sheet-body').scrollTop = 0;
    },
    back: () => void (ui.card = null),
    movefrom: (id) => {
      ui.card = null;
      ui.sel = id;
      $('sheet-body').scrollTop = 0;
    },
    emptypost: () => CM.fail('empty-post'),
    post: (id, skill, zone) => {
      ui.sel = null;
      return CM.mice.assign(state, id, skill ? skill + ':' + zone : '');
    },
    promote: (id) => CM.mice.promote(state, id),
    trait: (id, index) => CM.mice.pickTrait(state, id, index),
    reroll: (id) => CM.mice.reroll(state, id),
    album: () => void (ui.miceTab = ui.miceTab === 'album' ? '' : 'album'),
    dismiss: (id) => void confirmDismiss(id),
    managers: () => void (state.settings.managersBuy = !state.settings.managersBuy),
    tab: (name) => void (ui.cheeseTab = name),
    pick: (part, value) => void (ui.combo[part] = value),
    experiment: () => CM.cheesery.experiment(state, ui.combo),
    make: (id, n) => CM.cheesery.produce(state, id, Number(n)),
    cook: (id) => CM.cheesery.assign(state, id),
    uncook: (zoneId) => CM.cheesery.unassign(state, zoneId),
    cheeseTap: (zoneId) => CM.cheesery.tap(state, zoneId),
    rename: (id) => void askRecipeName(id, false),
    // Con un ratón: abre MICE con su ficha desplegada y a la vista.
    open: (name, id) => {
      openPanel(name);
      if (id) ui.card = id;
    },
    sound: () => {
      sfx.toggleMute();
      muteLabel();
    },
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
    ui.lanesKey = null;
    dirty = true;
  }
  $('sheet').addEventListener('click', onAct);
  $('dock-side').addEventListener('click', onAct);
  $('dock-zones').addEventListener('click', onAct);
  $('sheet').addEventListener('click', (e) => {
    if (e.target === $('sheet')) closePanel();
  });

  // ---------- Modales ----------
  let modalHandlers = {};
  function showModal(html, handlers) {
    modalHandlers = handlers || {};
    $('modal-body').classList.remove('badflash'); // el destello rojo de una manía no se queda para la siguiente ventana
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
    const value = CM.cheesery.valueOf(state, recipe);
    showModal(
      '<h2>' + (isNew ? 'NEW RECIPE!' : 'RENAME RECIPE') + '</h2><div class="hero">' + I.img('lot', combo.base, 'huge') + '</div><p class="hint">' + P.comboLine(combo) + '</p><div class="stats"><span class="stat v">' + P.coin(CM.shop.price(state, recipe)) + '</span><span class="stat tier ' + CM.cheesery.tierOf(value).toLowerCase() + '">' + CM.cheesery.tierOf(value) + '</span></div><input id="name-input" maxlength="24" autocomplete="off" value="' + P.esc(recipe.name) + '" /><p class="hint">' +
        (isNew ? 'It is in your Recipe Book now, with 1 cheese ready to sell. Give it a name:' : 'Pick a new name:') + '</p><div class="row"><button class="buy" data-m="ok">SAVE</button></div>',
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

  // ---------- Desbloqueos ----------
  // PATRÓN para toda mecánica nueva: nada aparece solo ni se construye desde
  // una ventana. El juego avisa de que hay algo nuevo, su casilla se marca con
  // NEW y el jugador va a su panel, lee para qué sirve y lo construye él.
  const UNLOCK = {
    drill: { why: 'You found a vein! Picking the rock only finds the cheese. A drill gets it out.', then: 'Now tap DRILL to pull Raw Cheese out of the vein' },
    refinery: { why: 'Raw Cheese is not ready to use. The Refinery presses 2 Raw into 1 Cheese Base.', then: 'Now tap REFINE to press your Raw Cheese' },
    cheesery: { why: 'Base is the main ingredient. The Cheesery mixes it with three more things into a real cheese.', then: 'Now discover your first recipe' },
    shop: { why: 'Your cheese needs a place to be sold. A shop turns cheese into coins.', then: 'Now tap SELL' },
    house: { why: 'A mouse on a post does that job on its own.', then: 'Now recruit your first mouse' },
  };
  let announced = null;
  function checkUnlocks() {
    const id = CM.construction.nextReady(state);
    if (!id) return void (announced = null);
    if (announced === id) return;
    announced = id;
    play('reveal');
    banner('NEW: ' + B.buildings[id].name.toUpperCase() + '!');
    toast('Something new to build. Tap ' + (tiles[id] ? tiles[id].querySelector('b').textContent : 'MICE') + ' below', true);
  }
  // Tras la primera venta: para qué sirven las monedas.
  function firstSaleCard() {
    showModal(
      '<h2>YOUR FIRST COINS!</h2><div class="hero">' + I.img('coin', '', 'huge') + '</div><p class="lead">That is the whole chain: <b>mine, drill, refine, make cheese, sell</b>.</p><ul class="list"><li>Coins buy <b>upgrades</b>: the green button next to each action.</li><li>Each stage has a <b>mouse</b> you can hire to do it for you.</li><li>Every action gives experience. Levels unlock better upgrades.</li></ul><div class="row"><button class="buy" data-m="ok">GOT IT</button></div>',
      { ok() {} }
    );
  }

  // Explica qué se acaba de comprar al abrir una roca.
  function zoneOpened(id) {
    const def = q.zoneDef(id);
    showModal(
      '<h2>NEW ROCK OPENED!</h2><div class="hero">' + I.img('raw', def.base, 'huge') + I.img('base', def.base, 'huge') + I.img('lot', def.base, 'huge') + '</div><p class="hint"><b>' + def.name + '</b> is now part of your colony.</p><ul class="list"><li>It gives ' + B.bases[def.base].name + ', worth ' + B.bases[def.base].value + ' per cheese (Cheddar is ' + B.bases.cheddar.value + ').</li><li>' + CM.cheesery.allCombos([def.base]).length + ' new recipes to discover.</li><li>It is a whole new production line: your other rocks keep working at the same time.</li><li>Your mice mine, drill and refine here too.</li><li>Your Cheesemaker needs a ' + B.bases[def.base].name + ' recipe: discover one and pick it.</li></ul><div class="row"><button class="buy" data-m="ok">SHOW ME</button></div>',
      {
        ok() {
          closePanel();
          select('rock');
          focusZone(id);
        },
      }
    );
  }

  function showOffline(sum) {
    if (!sum) return;
    const d = sum.delta;
    const mins = Math.round(sum.simulatedMs / 60000);
    const base = baseOfZone();
    const lines = [];
    if (sum.coins > 0) lines.push(I.img('coin') + 'Coins earned: +' + CM.fmt(sum.coins));
    if (d.lotsProduced) lines.push(I.img('lot', base) + 'Cheese made: +' + CM.fmt(d.lotsProduced) + ' (sold ' + CM.fmt(d.lotsSold) + ')');
    if (d.baseProduced) lines.push(I.img('base', base) + 'Cheese Base refined: +' + CM.fmt(d.baseProduced));
    if (d.rawProduced) lines.push(I.img('raw', base) + 'Raw Cheese drilled: +' + CM.fmt(d.rawProduced));
    if (d.veinsFound) lines.push('Veins found: ' + d.veinsFound);
    for (const up of sum.levelUps) lines.push(B.skills[up.skill].name + ': level ' + up.from + ' > ' + up.to);
    // Sin nada automatizado ni producido no hay nada que contar.
    if (!lines.length && (!sum.automated || sum.simulatedMs < 60000)) return;
    showModal(
      '<h2>WELCOME BACK</h2><p class="hint">Away ' + (mins < 1 ? 'under a minute' : mins >= 120 ? Math.round(mins / 60) + ' h' : mins + ' min') + (sum.capped ? ' (your mice work up to ' + Math.round(sum.capMs / 3600000) + ' h alone; the Night Lamp in COLONY extends it)' : '') + '</p>' +
        (lines.length ? '<ul class="list plain">' + lines.map((l) => '<li>' + l + '</li>').join('') + '</ul>' : '<p class="hint">Your mice had nothing they could do. Check what is stopped.</p>') + '<div class="row"><button class="buy" data-m="ok">NICE</button></div>',
      { ok() {} }
    );
    if (lines.length) scene.celebrate();
  }

  function exportSave() {
    const text = CM.storage.exportText(state, Date.now());
    try {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      a.download = 'cheese-miner-save.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) {}
    showModal('<h2>EXPORT</h2><p class="hint">A file was downloaded. You can also copy the text:</p><textarea id="io-text" readonly></textarea><div class="row"><button class="buy" data-m="ok">DONE</button></div>', { ok() {} });
    $('io-text').value = text;
  }

  function syncShown() {
    const b = q.zoneDef(ui.zone).base;
    ui.shown = { coins: state.coins, raw: state.inv.raw[b], base: state.inv.base[b], lots: q.lotsOfBase(state, b) };
  }

  function replaceState(next) {
    state = next;
    CM.events.length = 0;
    CM.telemetry.resetSamples();
    scene.reset();
    ui.zone = B.zones[0].id;
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

  // Casilla misteriosa: los nombres giran un momento antes de enseñar el que ha tocado.
  function revealMystery(mouse, traitId) {
    const T = B.mice.traits;
    const def = T[traitId];
    const names = Object.keys(T).filter((k) => !T[k].job).map((k) => T[k].name);
    showModal('<h2>MYSTERY TRAIT</h2><div class="hero"><img class="pix face big" alt="" src="' + CM.mouseUrl(mouse) + '"></div><div id="slot" class="slot spin">?</div><p id="slot-desc" class="hint">&nbsp;</p><div class="row"><button id="slot-ok" class="buy" data-m="ok" disabled>...</button></div>', { ok() {} });
    let n = 0;
    const timer = setInterval(() => {
      const el = $('slot');
      if (!el) return clearInterval(timer);
      n += 1;
      if (n < 18) {
        el.textContent = names[Math.floor(Math.random() * names.length)];
        sfx.click();
        return;
      }
      clearInterval(timer);
      el.textContent = def.name.toUpperCase();
      el.className = 'slot ' + def.kind;
      if (def.kind === 'legend') {
        closeModal();
        return legendMoment(mouse, traitId);
      }
      el.innerHTML = (def.kind === 'quirk' ? '&#9660; ' : '&#9650; ') + def.name.toUpperCase();
      $('slot-desc').innerHTML = (def.kind === 'quirk' ? '<b class="tbad">A QUIRK.</b> ' : '') + CM.traitDesc(traitId) + '.';
      $('slot-ok').disabled = false;
      $('slot-ok').textContent = def.kind === 'quirk' ? 'OH WELL' : 'NICE';
      if (def.kind === 'quirk') {
        play('quirk');
        retrigger($('modal-body'), 'badflash');
      } else {
        play('reveal');
        scene.celebrate();
      }
    }, 80);
  }

  // Sale una opción legendaria entre las tres: se avisa antes de elegir.
  function legendOffer(mouse) {
    if (!mouse) return;
    play('goal');
    scene.celebrate();
    banner('A LEGENDARY TRAIT FOR ' + mouse.name.toUpperCase() + '!');
    toast('One of ' + mouse.name + "'s options is LEGENDARY. Go to MICE", true);
    dirty = true;
  }

  // EL momento: pantalla a oscuras, destello dorado, lluvia de monedas y la carta.
  let legendEl = null;
  function legendMoment(mouse, traitId, born) {
    const def = B.mice.traits[traitId];
    if (!mouse || !def) return;
    const [skill, zone] = mouse.post ? mouse.post.split(':') : [];
    let change = '';
    if (skill && !born) {
      const without = Object.assign({}, mouse, { learned: mouse.learned.filter((t) => t !== traitId) });
      const before = CM.mouseRate(state, without, skill, zone);
      const after = CM.mouseRate(state, mouse, skill, zone);
      if (before !== after) change = '<p class="was">' + before + '</p><p class="now">' + after + '</p>';
    }
    let rain = '';
    for (let i = 0; i < 26; i++) rain += '<i style="left:' + ((i * 37) % 100) + '%;animation-delay:' + ((i * 0.13) % 1.6).toFixed(2) + 's;animation-duration:' + (1.3 + ((i * 7) % 9) / 10) + 's"></i>';
    if (!legendEl) {
      legendEl = document.createElement('div');
      legendEl.className = 'legendfx';
      $('modal').parentNode.appendChild(legendEl);
      legendEl.addEventListener('click', () => {
        if (performance.now() - legendEl.shownAt > 1200) legendEl.hidden = true;
      });
    }
    legendEl.innerHTML =
      '<div class="rays"></div><div class="rain">' + rain + '</div><div class="card"><div class="top">&#9733; LEGENDARY &#9733;</div><img class="pix" alt="" src="' + CM.mouseUrl(mouse) + '"><div class="who">' + P.esc(mouse.name) + (born ? ' joined your colony' : '') + '</div><div class="name">' + def.name.toUpperCase() + '</div><p>' + def.desc + '.</p>' + change + '<small>tap to continue</small></div>';
    legendEl.shownAt = performance.now();
    legendEl.hidden = false;
    retrigger(legendEl, 'go');
    play('legend');
    scene.celebrate();
    dirty = true;
  }

  function confirmDismiss(id) {
    const m = CM.mice.byId(state, id);
    if (!m) return;
    const K = CM.mice;
    const now = K.recruitCost(state);
    const after = Math.round(B.mice.recruitCost * Math.pow(B.mice.recruitGrowth, state.mice.length - 1));
    const waiting = state.mice.find((x) => x !== m && !x.post && !x.rest);
    const post = !m.post ? '' : waiting ? ' ' + P.esc(waiting.name) + ' takes over ' + K.postLabel(m.post) + '.' : ' ' + K.postLabel(m.post) + ' is left with no mouse: you work it by hand until you recruit another.';
    showModal(
      '<h2>DISMISS ' + P.esc(m.name).toUpperCase() + '?</h2><div class="hero"><img class="pix face big" alt="" src="' + CM.mouseUrl(m) + '"></div><p class="hint"><b>LV ' + K.level(m) + ' ' + B.mice.ranks[m.rank].name + '.</b> It leaves for good: its level, rank and traits are lost and nothing is refunded.' + post + '</p><p class="hint">Your next recruit will cost ' + CM.fmt(after) + ' coins instead of ' + CM.fmt(now) + '.</p><div class="row"><button class="close" data-m="no">KEEP</button><button class="danger" data-m="ok">DISMISS</button></div>',
      {
        no() {},
        ok() {
          ui.card = null;
          ui.sel = null;
          K.dismiss(state, id);
          drainEvents();
          ui.dockHtml = null;
          ui.lanesKey = null;
          dirty = true;
        },
      }
    );
  }

  function confirmReset() {
    showModal('<h2>RESET GAME?</h2><p class="hint">All progress will be lost.</p><div class="row"><button class="close" data-m="no">CANCEL</button><button class="danger" data-m="ok">RESET</button></div>', {
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
      raw: () => D.addRaw(state, 10),
      base: () => D.addBase(state, 10),
      levels: () => D.addLevels(state, 5),
      micexp: () => state.mice.forEach((m) => (m.xp += 2000)),
      reveal: () => D.revealVeins(state),
      buildings: () => D.unlockBuildings(state),
      zones: () => D.unlockZones(state),
      hire: () => D.hireAll(state),
      noraw: () => D.forceNoRaw(state),
      pause: () => (D.paused = !D.paused),
    };
    if (simple[name]) simple[name]();
    else if (name === 'coins') D.addCoins(state, Number(arg));
    else if (name === 'power') D.powerUp(state, Number(arg));
    else if (name === 'speed') D.speed = Number(arg);
    else if (name === 'scn') replaceState(arg === 'fresh' ? CM.createState(Date.now()) : D.scenario(Date.now()));
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
    const base = baseOfZone();
    $('ic-coins').src = I.url('coin');
    $('ic-raw').src = I.url('raw', base);
    $('ic-base').src = I.url('base', base);
    $('ic-lots').src = I.url('lot', base);
    tiles.rock.querySelector('img').src = I.url('pick');
    tiles.drill.querySelector('img').src = I.url('raw', base);
    tiles.refinery.querySelector('img').src = I.url('base', base);
    tiles.cheesery.querySelector('img').src = I.url('lot', base);
    tiles.shop.querySelector('img').src = I.url('coin');
  }

  // Los contadores ruedan hacia su valor real en vez de saltar.
  function roll(key, target) {
    const cur = ui.shown[key];
    if (cur === target || cur === undefined) return (ui.shown[key] = target);
    const step = Math.max(1, Math.ceil(Math.abs(target - cur) * 0.18));
    return (ui.shown[key] = cur < target ? Math.min(target, cur + step) : Math.max(target, cur - step));
  }

  function updateHUD() {
    set($('coins'), 'text', CM.fmt(roll('coins', state.coins)));
    // Los tres contadores son los del queso que se está mirando, no la suma de todos.
    const hb = baseOfZone();
    set($('raw'), 'text', CM.fmt(roll('raw', state.inv.raw[hb])));
    set($('base'), 'text', CM.fmt(roll('base', state.inv.base[hb])));
    set($('lots'), 'text', CM.fmt(roll('lots', q.lotsOfBase(state, hb))));
    const hname = B.bases[hb].name.toUpperCase();
    // El nombre del queso en los tres; la forma del icono dice si es Raw, Base o queso.
    set($('lane-name'), 'text', hname);
    set($('lanegroup'), 'cls', 'lanegroup ' + hb);

    const obj = CM.sim.objective(state);
    set($('obj-text'), 'text', (obj.done ? '' : 'GOAL: ') + obj.text + (obj.reward ? '  (+' + CM.fmt(obj.reward) + ' coins)' : ''));
    set($('obj-num'), 'text', obj.hasBar ? CM.fmt(obj.cur) + '/' + CM.fmt(obj.max) : '');
    set($('obj-fill'), 'width', (obj.hasBar ? Math.round((obj.cur / obj.max) * 100) : obj.done ? 100 : 0) + '%');

    const comboOn = !state.zones[ui.zone].veinRevealed && state.combo >= 3 && state.clock - state.lastHitAt <= B.mining.comboWindowMs;
    set(els.combo, 'on', comboOn);
    if (comboOn) {
      set(els.combo.firstElementChild, 'text', 'COMBO x' + state.combo + (state.combo % B.mining.critEvery === B.mining.critEvery - 1 ? '  CRIT NEXT!' : ''));
      // La barra se vacía con el tiempo que queda para mantener el combo.
      els.combo.lastElementChild.firstElementChild.style.width = Math.max(0, 100 - ((state.clock - state.lastHitAt) / B.mining.comboWindowMs) * 100) + '%';
    }
    set($('devflag'), 'text', CM.dev.paused ? 'PAUSED' : CM.dev.speed > 1 ? 'SPEED x' + CM.dev.speed : '');

    updateChain();
    updateDock();
    document.querySelectorAll('[data-job]').forEach((el) => {
      const zone = state.zones[el.dataset.job.split(':')[1]];
      el.style.width = Math.round(progress(zone && zone.cookJob) * 100) + '%';
    });
  }

  // Ingresos por minuto bajo cada contador: lo que hace que un idle se sienta vivo.
  function updateRates() {
    const r = CM.telemetry.rates(state);
    const show = (id, value) => {
      const v = Math.round(value);
      set($(id), 'text', v ? (v > 0 ? '+' : '') + CM.fmt(v) + '/min' : '');
      set($(id), 'neg', v < 0);
    };
    show('rate-coins', r.coins);
    const lane = r.lanes[ui.zone];
    show('rate-raw', lane.raw - lane.rawUsed);
    show('rate-base', lane.base - lane.baseUsed);
    show('rate-lots', lane.lots);
  }
  // Los botones de compra se van llenando según te acercas a poder pagarlos.
  function updateAfford() {
    // Y dicen cuántos minutos faltan al ritmo actual de ingresos.
    const perMinute = CM.telemetry.rates(state).coins;
    document.querySelectorAll('[data-cost]').forEach((el) => {
      const cost = Number(el.dataset.cost);
      el.style.setProperty('--p', Math.round(Math.min(1, state.coins / cost) * 100) + '%');
      const mins = perMinute > 0 && cost > state.coins ? (cost - state.coins) / perMinute : 0;
      el.dataset.eta = !mins ? '' : mins < 1 ? 'under a minute' : mins < 90 ? 'in ~' + Math.round(mins) + ' min' : mins < 2880 ? 'in ~' + Math.round(mins / 60) + ' h' : '';
    });
  }
  // Aviso en COLONY cuando hay algo que comprar ahí.
  function updateDots() {
    const next = CM.zones.next(state);
    const colony = next && state.coins >= next.unlockCost;
    $('nav-colony').querySelector('.dot').classList.toggle('on', !!colony);
    // MICE avisa si hay casa por construir, candidatos por elegir, un puesto libre y monedas para reclutar, o un ascenso que ya se puede pagar.
    const mice = CM.construction.buildInfo(state, 'house').canBuild || state.candidates.length > 0 || (state.built.house && !!CM.mice.freePost(state) && state.coins >= CM.mice.recruitCost(state)) || state.mice.some((m) => m.offer || CM.mice.promoteInfo(state, m).can);
    $('nav-mice').querySelector('.dot').classList.toggle('on', !!mice);
    set($('nav-mice'), 'goal', GOAL_AT[CM.sim.objective(state).id] === 'mice');
    const n = buyable();
    set($('nav-all'), 'text', n ? 'BUY ALL ' + n : 'BUY ALL');
    set($('nav-all'), 'ready', n > 0);
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
    scene.draw(state, Date.now(), real / 1000, ui.zone);
    updateHUD();
    slowTick += real;
    if (slowTick > 400) {
      slowTick = 0;
      updateDots();
      renderPanel();
      CM.telemetry.sample(state);
      updateRates();
      updateAfford();
      checkUnlocks();
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
  syncShown();
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
    focusZone,
  };
  requestAnimationFrame(frame);
})();
