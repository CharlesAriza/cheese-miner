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
    cheeseTab: 'book',
    cheeseView: 'lines', // PRODUCTION o RECIPE BOOK
    cheeseLine: null, // línea abierta en PRODUCTION
    bookBase: null,
    bookRow: null,
    labTab: 'recipes', // sección del laboratorio a la vista
    rockOpen: {}, // rocas desplegadas en MICE
    comboOpen: {}, // rocas con el detalle de sus combinaciones a la vista
    cardSec: {}, // secciones abiertas de la ficha
    miceShow: 'all',
    miceLikes: '',
    rosterOpts: false,
    cand: -1,
    newsAll: false,
    labDirOpen: false,
    labDirCat: null,
    labSeen: false,
    labHand: null, // null: abierto solo si no hay investigador
    strainRecipe: null,
    combo: { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' },
    lastHtml: '',
    rocksKey: null,
    dockKind: 'mine',
    shown: {},
  };
  const els = { floaters: $('floaters'), banner: $('banner'), toast: $('toast'), combo: $('combo'), main: $('dock-main'), flyers: $('flyers'), bubbles: $('bubbles') };
  // Piezas fijas del panel inferior: se les cambia el texto, nunca se rehacen.
  const dk = {
    rocks: $('dock-rocks'), info: $('dock-info'), why: $('dock-why'), side: $('dock-side'),
    worker: $('dock-worker'), face: $('dock-worker').querySelector('img'), workName: $('dock-worker').querySelector('b'), workSub: $('dock-worker').querySelector('u'), book: $('dock-book'),
    quick: $('up-quick'), quickName: $('up-quick').querySelector('b'), quickCost: $('up-quick').querySelector('u'),
    tree: $('up-tree'), treeNum: $('up-tree').querySelector('u'), all: $('up-all'), allNum: $('up-all').querySelector('u'),
  };
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
  // Con un panel o una ventana delante, la escena no se ve: nada flota ni vuela por encima.
  const covered = () => !!ui.panel || !$('modal').hidden;
  function float(text, id, cls) {
    if (covered()) return;
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
    // Detrás de un panel la franja no se vería: la noticia va en el aviso de arriba.
    if (covered()) return toast(text, true);
    els.banner.textContent = text;
    retrigger(els.banner, 'show');
  }
  // Los avisos hacen cola: cada uno se lee entero antes de dar paso al siguiente, en vez de
  // pisarse. Con cola, cada aviso dura menos; si se acumulan demasiados, se quedan los últimos.
  let toastTimer = 0;
  let toastBusy = false;
  const toastQueue = [];
  function nextToast() {
    const t = toastQueue.shift();
    if (!t) {
      toastBusy = false;
      els.toast.classList.remove('show');
      return;
    }
    toastBusy = true;
    els.toast.textContent = t.text;
    els.toast.classList.toggle('good', t.good);
    els.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(nextToast, toastQueue.length ? 1500 : 2400);
  }
  function toast(text, good) {
    const last = toastQueue[toastQueue.length - 1];
    if ((last && last.text === text) || (toastBusy && !toastQueue.length && els.toast.textContent === text)) return;
    // Un «no se puede» responde a un toque: sale al momento, por delante de la cola.
    if (!good) toastQueue.unshift({ text, good: false });
    else toastQueue.push({ text, good: true });
    while (toastQueue.length > 4) toastQueue.splice(good ? 0 : 1, 1);
    if (!toastBusy || !good) nextToast();
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
    if (covered() || els.flyers.childElementCount > 30) return onArrive && onArrive();
    const a = pointOf(from);
    // Llegan al icono del contador, no encima de la cifra.
    const b = pointOf((to.querySelector && to.querySelector('img.pix')) || to);
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
          { transform: 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(0.45)', opacity: 0.25 },
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
        banner((ev.breakthrough ? 'BREAKTHROUGH: ' : ev.bonus ? 'BONUS RECIPE: ' : 'NEW RECIPE: ') + found.name.toUpperCase());
        // Con la primera receta aparece LAB en la barra: se dice dónde y para qué.
        if (state.totals.recipes === 1) {
          toast(found.name + ' is yours. Research more in the new LAB tab: with ' + B.buildings.lab.requires.min + ' recipes you can build the Cheese Lab', true);
          if (ui.panel === 'lab') closePanel();
          select('cheesery');
          break;
        }
        toast(found.name + ' sells for ' + CM.fmt(CM.shop.price(state, found)) + ' coins' + (ev.breakthrough ? ' and starts with mastery ' + CM.cheesery.masteryLevel(found) : '') + '. It is in your Recipe Book', true);
        break;
      }
      case 'strainFound': {
        const r = CM.cheesery.recipe(state, ev.recipeId);
        play('reveal');
        banner('NEW STRAIN: ' + B.strains[ev.strain].name.toUpperCase());
        toast('For ' + r.name + '. It waits for you in LAB: compare it and decide', true);
        ui.strainRecipe = r.id;
        scene.celebrate();
        break;
      }
      case 'labSetback':
        toast('Inconclusive result in the lab: it tries again (half the time)');
        break;
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
      case 'traitLearned': {
        // Los rasgos llegan solos: se cuenta lo que ha pasado, sin parar al jugador.
        // Un legendario sí se celebra a lo grande.
        const mouse = CM.mice.byId(state, ev.id);
        const def = B.mice.traits[ev.trait];
        if (!mouse || !def) break;
        if (ev.kind === 'legend') legendMoment(mouse, ev.trait);
        else {
          // Un rasgo normal: un aviso breve, sin franja ni ventana. Queda en el diario de HOUSE.
          play('bell');
          toast(mouse.name + (def.job ? ' specialised: ' : ' developed ') + def.name + '. ' + def.desc, true);
        }
        dirty = true;
        break;
      }
      case 'careStart':
        play('click');
        dirty = true;
        break;
      case 'careDone': {
        const mouse = CM.mice.byId(state, ev.id);
        if (!mouse) break;
        play('goal');
        banner(mouse.name.toUpperCase() + (ev.kind === 'quirk' ? ' IS OVER ' + B.mice.traits[ev.what].name.toUpperCase() : ': ' + B.mice.traits[ev.to].name.toUpperCase()) + '!');
        toast(ev.kind === 'quirk' ? mouse.name + ' no longer has ' + B.mice.traits[ev.what].name + '. The Mouse House bed is free' : mouse.name + ' retrained to ' + B.mice.traits[ev.to].name + '. The Mouse House bed is free', true);
        dirty = true;
        break;
      }
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
        dirty = true;
        // En un ascenso en bloque se celebra una vez, con el resumen.
        if (ui.bulkPromo) break;
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
        if (ev.skill === 'lab' && node.unlock) labUpgradeCard(ev.id);
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
        if (ev.id === 'lab') labBuiltCard();
        else toast(UNLOCK[ev.id].then, true);
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
  }
  // Cambia la roca que se ve en la escena. Todas siguen trabajando.
  function focusZone(id) {
    if (ui.zone === id || !state.zones[id].unlocked) return;
    ui.zone = id;
    scene.onEvent({ type: 'zoneFocus' }, state, Date.now(), id);
    setIcons();
    syncShown();
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
  const GOAL_AT = { zone4: 'colony', zone5: 'colony', zone6: 'colony', house: 'mice', mouse: 'mice', allAuto: 'mice', promote: 'mice', vein: 'rock', drill: 'drill', raw: 'drill', refinery: 'refinery', base: 'refinery', cheesery: 'cheesery', recipe: 'cheesery', shop: 'shop', sale: 'shop', recipes8: 'cheesery', zone2: 'colony', zone3: 'colony', depth3: 'rock' };

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
    // LAB: no es una etapa de la cadena, pero se llega igual. Aparece con la quesería.
    const lab = tiles.lab;
    const researcher = CM.cheesery.labWorker(state);
    const labJob = state.lab.job;
    const strainsFresh = CM.cheesery.strainsOpen(state) && !state.recipes.some((r) => (r.strains || []).length) && !(labJob && labJob.strain);
    const labUps = state.built.lab ? CM.tree.affordable(state, 'lab') : 0;
    const labNew = !!state.lab.found || strainsFresh || (!state.built.lab && (CM.construction.buildInfo(state, 'lab').canBuild || (!ui.labSeen && state.totals.recipes === 1)));
    const noLab = state.totals.recipes < 1;
    if (lab.hidden !== noLab) lab.hidden = noLab;
    set(lab, 'sel', ui.panel === 'lab');
    set(lab, 'working', !!labJob);
    set(lab, 'isnew', labNew);
    set(lab.querySelector('.mini > i'), 'width', Math.round(progress(labJob) * 100) + '%');
    set(lab.querySelector('u'), 'text', researcher ? 'LV ' + CM.mice.level(researcher) : state.built.lab ? 'BY HAND' : Math.min(state.totals.recipes, B.buildings.lab.requires.min) + '/' + B.buildings.lab.requires.min);
    set(lab.querySelector('em'), 'text', labNew ? 'NEW!' : labUps ? 'UP! ' + labUps : researcher && CM.cheesery.labDir(state) ? 'AUTO' : '');
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
        m.status = 'Vein exposed: ' + CM.fmt(z.veinRemaining) + ' Raw Cheese inside';
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
        m.status = 'Power ' + round1(q.pickPower(state)) + ' · mining finds the vein, not cheese';
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
      m.status = (isDrill ? '+' + round1(y) + ' Raw' : q.refineBatch(state) * B.refinery.rawPerBase + ' Raw > ' + round1(y) + ' Base') + ' / ' + P.secs(d) + ' · ' + perMin(y, d) + '/min';
      if (info.state === 'working') {
        m.sub = auto ? 'Auto · hold to boost' : 'HOLD TO BOOST!';
        m.fill = info.progress;
        m.mode = '';
      } else if (info.state === 'ready') {
        m.sub = 'Tap to start';
        m.mode = 'hot';
      } else {
        m.status = { 'no-vein': 'Waiting for a vein in ' + def.name, 'no-raw': 'Waiting for ' + B.refinery.rawPerBase + ' Raw ' + B.bases[def.base].name + ' from its drill' }[info.reason];
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
        m.status = (job.kind === 'experiment' && !r ? 'Experimenting with a new combination' : 'Making ' + (r ? r.name : 'cheese'));
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
    m.status = buyer.name + ' pay x' + buyer.mult + ' · ' + q.sellCount(state) + ' per sale / ' + P.secs(q.sellDuration(state));
    if (info.state === 'working') {
      m.sub = (auto ? 'Auto · ' : '') + 'selling for ' + CM.fmt(state.jobs.shop.coins);
      m.fill = info.progress;
      m.mode = '';
    } else if (info.state === 'ready') {
      m.sub = q.lotsTotal(state) + ' cheese to sell';
      m.mode = 'hot';
    } else {
      m.status = 'No cheese to sell yet: make some in CHEESE';
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

    // Mejoras: tres huecos que no cambian de sitio ni de tamaño. La más barata de esta
    // habilidad (de un toque, sin abrir el árbol), el árbol entero y BUY ALL.
    let pick = null;
    if (m.tree) {
      for (const node of B.trees[skill]) {
        const info = CM.tree.info(state, skill, node.id);
        if (!info.locked && !info.maxed && (!pick || info.cost < pick.cost)) pick = { id: node.id, name: node.name, cost: info.cost, can: info.canBuy };
      }
    }
    ui.quick = pick ? { skill, id: pick.id } : null;
    set(dk.quickName, 'text', pick ? pick.name : m.tree ? 'ALL MAXED' : 'NO UPGRADES YET');
    set(dk.quickCost, 'text', pick ? CM.fmt(pick.cost) : '');
    set(dk.quick, 'off', !pick || !pick.can);
    set(dk.quick, 'ready', !!pick && pick.can);
    set(dk.quick, 'none', !pick);
    costOf(dk.quick, pick && !pick.can ? pick.cost : 0);
    const ups = m.tree ? CM.tree.affordable(state, skill) : 0;
    set(dk.treeNum, 'text', !m.tree ? 'LOCKED' : ups ? ups + ' READY' : 'TREE');
    set(dk.tree, 'has', ups > 0);
    set(dk.tree, 'off', !m.tree);

    // Quién trabaja en este puesto: siempre en el mismo hueco.
    const showSide = !!state.built.house && m.tree;
    if (dk.side.hidden === showSide) dk.side.hidden = !showSide;
    if (showSide) {
      const w = CM.mice.at(state, skill, ui.zone);
      const pr = w ? CM.mice.promoteInfo(state, w) : null;
      ui.workerId = w ? w.id : '';
      const faceKey = w ? w.id + '|' + w.rank : '';
      if (dk.face.dataset.k !== faceKey) {
        dk.face.dataset.k = faceKey;
        if (w) dk.face.src = CM.mouseUrl(w);
      }
      set(dk.workName, 'text', w ? w.name : 'NO MOUSE');
      set(dk.workSub, 'text', w ? (pr.can ? 'PROMOTE!' : 'LV ' + CM.mice.level(w) + ' ' + B.mice.ranks[w.rank].name) : 'Tap to assign one');
      set(dk.worker, 'empty', !w);
      set(dk.worker, 'ready', !!(w && pr.can));
      const book = st === 'cheesery';
      if (dk.book.hidden === book) dk.book.hidden = !book;
    }

    const why = updateRocks();
    const def = q.zoneDef(ui.zone);
    // Sin línea que contar (antes del taladro, o en un edificio sin construir), la explicación usa los dos renglones.
    const line = m.tree && why ? def.name + ' · depth ' + state.zones[ui.zone].depth + ' · ' + why[0] : '';
    set(dk.why, 'text', line);
    set(dk.why, 'cls', why ? why[1] || 'good' : '');
    set(dk.info, 'wide', !line);
  }

  // Pone o quita el precio que un botón enseña cuánto falta para pagar.
  function costOf(el, cost) {
    const v = cost ? String(cost) : '';
    if ((el.dataset.cost || '') === v) return;
    if (v) el.dataset.cost = v;
    else {
      delete el.dataset.cost;
      el.dataset.eta = '';
      el.style.removeProperty('--p');
    }
  }
  // BUY ALL enseña antes de tocarlo cuántas mejoras compraría y lo que cuestan; si no alcanza
  // para ninguna, cuál es la siguiente.
  function updateBuyAll() {
    const plan = (ui.plan = CM.tree.sweep(state, true));
    set(dk.allNum, 'text', plan.bought ? plan.bought + ' · ' + CM.fmt(plan.cost) : plan.next ? 'NEXT ' + CM.fmt(plan.next.cost) : 'ALL MAXED');
    set(dk.all, 'ready', plan.bought > 0);
    set(dk.all, 'off', !plan.bought);
    costOf(dk.all, plan.bought || !plan.next ? 0 : plan.next.cost);
  }
  const TREE_NAME = (k) => (B.skills[k] ? B.skills[k].name : k === 'lab' ? 'Lab' : 'Colony');
  let boughtAt = 0;
  function buyEverything() {
    // Un doble toque no tapa el resumen de la compra con un «no alcanza».
    if (performance.now() - boughtAt < 700) return;
    const r = CM.tree.sweep(state);
    if (r.bought) boughtAt = performance.now();
    drainEvents();
    dirty = true;
    updateBuyAll();
    renderPanel();
    if (r.bought) return toast('Bought ' + r.bought + ' upgrade' + (r.bought === 1 ? '' : 's') + ' for ' + CM.fmt(r.cost) + ': ' + Object.keys(r.bySkill).map((k) => TREE_NAME(k) + ' ' + r.bySkill[k]).join(', '), true);
    report(CM.fail('no-coins'), dk.all);
    if (r.next) toast('Next upgrade: ' + CM.tree.node(r.next.skill, r.next.id).name + ' (' + TREE_NAME(r.next.skill) + ') for ' + CM.fmt(r.next.cost));
  }

  // ---------- Rocas: una ficha igual por roca ----------
  // Todas trabajan a la vez; la ficha dice de un vistazo cómo va cada línea (verde, ámbar,
  // rojo) y tocarla la enseña en la escena. Los números de la roca elegida están arriba.
  const rockEls = {};
  function laneWhy(def) {
    const z = state.zones[def.id];
    const name = B.bases[def.base].name;
    const auto = (k) => q.auto(state, k, def.id);
    if (!z.veinRevealed) {
      const pct = Math.floor((z.discover / q.veinHits(state, def.id)) * 100);
      return auto('mining') ? ['Searching for the next vein ' + pct + '%', ''] : ['No vein: mine this rock (' + pct + '%)', 'warn'];
    }
    if (!state.built.drill) return ['Vein found: build the drill', 'warn'];
    if (!auto('drilling') && !z.drillJob) return ['Drill idle: tap DRILL', 'warn'];
    if (state.built.refinery && !auto('refining') && !z.refJob && CM.refining.status(state, def.id) === 'ready') return ['Raw waiting: tap REFINE', 'warn'];
    if (state.built.cheesery) {
      const cs = CM.cheesery.status(state, def.id);
      if (cs === 'no-recipe') return ['No recipe yet: discover one in CHEESE', 'bad'];
      if (cs === 'no-coins') return ['No coins for the ingredient', 'bad'];
      if (cs === 'idle' && state.inv.base[def.base] >= B.cheesery.lotBase) return ['Base waiting: make cheese', 'warn'];
    }
    return ['Running', 'good'];
  }
  // Devuelve el estado de la línea que se está mirando (o null si aún no hay líneas).
  function updateRocks() {
    const open = state.built.drill ? q.openZones(state) : [];
    const show = open.length > 1;
    const key = show ? open.map((d) => d.id).join(',') : '';
    if (key !== ui.rocksKey) {
      ui.rocksKey = key;
      let h = '';
      if (show) for (const def of open) h += '<button data-zone="' + def.id + '" class="rchip">' + I.img('raw', def.base) + '<b>' + P.esc(B.bases[def.base].name) + '</b><i class="rdot"></i></button>';
      dk.rocks.innerHTML = h;
      dk.rocks.hidden = !show;
      for (const id of Object.keys(rockEls)) delete rockEls[id];
      dk.rocks.querySelectorAll('.rchip').forEach((el) => (rockEls[el.dataset.zone] = el));
      ui.rockShown = null;
    }
    let mine = null;
    for (const def of open) {
      const why = laneWhy(def);
      if (def.id === ui.zone) mine = why;
      const el = rockEls[def.id];
      if (!el) continue;
      set(el, 'on', def.id === ui.zone);
      set(el, 'warn', why[1] === 'warn');
      set(el, 'need', why[1] === 'bad');
    }
    // Con más rocas de las que caben, la elegida queda siempre a la vista.
    if (show && ui.rockShown !== ui.zone && rockEls[ui.zone]) {
      ui.rockShown = ui.zone;
      const el = rockEls[ui.zone];
      const box = dk.rocks;
      if (el.offsetLeft < box.scrollLeft) box.scrollLeft = el.offsetLeft;
      else if (el.offsetLeft + el.offsetWidth > box.scrollLeft + box.clientWidth) box.scrollLeft = el.offsetLeft + el.offsetWidth - box.clientWidth;
    }
    return mine;
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
  tiles.lab.addEventListener('click', () => openPanel('lab'));
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
  let lastStageTap = 0;
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
    // Un toque suelto sobre un ratón abre su ficha. Tocando seguido (jugando) no, para no estorbar.
    const box = stage.getBoundingClientRect();
    const calm = performance.now() - lastStageTap > 600;
    lastStageTap = performance.now();
    const cv = stage.tagName === 'CANVAS' ? stage : stage.querySelector('canvas');
    const cbox = cv.getBoundingClientRect();
    // La altura se convierte con la del propio lienzo: puede no escalar igual que el ancho.
    const mouseId = calm ? scene.mouseAt(((e.clientX - cbox.left) / cbox.width) * cv.width, ((e.clientY - cbox.top) / cbox.height) * cv.height) : null;
    if (mouseId) {
      sfx.click();
      openPanel('mice');
      ui.card = mouseId;
      return renderPanel();
    }
    const id = scene.hitTest(logical(e.clientX - stage.getBoundingClientRect().left));
    if (!id) return;
    if (id === 'storage') return openPanel('stock');
    if (id === 'house') return openPanel('mice');
    if (id === 'lab') return openPanel('lab');
    const same = ui.station === id;
    if (!same) select(id, true);
    updateDock();
    if (same || REPEATABLE[ui.dockKind]) mainAction();
  });
  stage.addEventListener('pointercancel', () => (drag = null));

  // ---------- Paneles ----------
  function openPanel(name) {
    if (name === 'cheese' && !state.built.cheesery) return select('cheesery');
    // Sin recetas no hay libro que enseñar: la primera se descubre en el laboratorio.
    if (name === 'cheese' && !state.recipes.length) name = 'lab';
    if (name === 'lab') {
      ui.labDirOpen = false;
      ui.labDirCat = null;
      ui.labHand = null;
      if (state.recipes.length) ui.labSeen = true;
      if (state.lab.found) ui.labTab = 'strains';
      scene.focus(state.built.lab ? 'lab' : 'cheesery');
    }
    ui.panel = name;
    ui.lastHtml = '';
    $('sheet-title').textContent = P.title(name, ui, state);
    $('sheet').hidden = false;
    $('sheet-body').scrollTop = 0;
    if (name === 'cheese') {
      scene.focus('cheesery');
      ui.cheeseView = 'lines';
      // Con pocas rocas se abre la que estás mirando; con muchas, todas a la vista.
      ui.cheeseLine = q.openZones(state).length <= 2 ? ui.zone : '';
      ui.bookBase = null;
      ui.bookRow = null;
    }
    if (name === 'mice') {
      ui.pick = null;
      ui.card = null;
      ui.miceTab = '';
      ui.cardSec = {};
      ui.rosterOpts = false;
      if (state.built.house) scene.focus('house');
    }
    renderPanel();
  }
  function openTree(skill) {
    ui.tree = skill;
    openPanel('tree');
    scene.focus(skill === 'colony' ? 'storage' : skill === 'lab' ? 'lab' : B.skills[skill].station);
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
      // Las filas que se desplazan de lado vuelven a enseñar lo elegido, centrado.
      $('sheet-body').querySelectorAll('.strainpick').forEach((row) => {
        const on = row.querySelector('.on');
        if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
      });
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
  // Botones fijos del panel inferior.
  const dockTap = (fn) => () => {
    fn();
    drainEvents();
    renderPanel();
    dirty = true;
  };
  dk.quick.addEventListener('click', dockTap(() => (ui.quick ? report(CM.tree.buy(state, ui.quick.skill, ui.quick.id), dk.quick) : report(CM.fail('locked'), dk.quick))));
  dk.tree.addEventListener('click', () => (B.trees[SKILL[ui.station]] && (ui.station === 'rock' || state.built[ui.station]) ? openTree(SKILL[ui.station]) : report(CM.fail('locked'), dk.tree)));
  dk.all.addEventListener('click', buyEverything);
  dk.worker.addEventListener('click', () => {
    openPanel('mice');
    // Con ratón, su ficha; sin él, los candidatos para este puesto.
    if (ui.workerId) ui.card = ui.workerId;
    else {
      const skill = SKILL[ui.station];
      const post = CM.mice.posts(state).find((p) => p.skill === skill && (p.zone === ui.zone || p.zone === 'all'));
      if (post) ui.pick = { type: 'post', key: post.key };
    }
    renderPanel();
  });
  dk.book.addEventListener('click', () => openPanel('cheese'));
  dk.rocks.addEventListener('click', (e) => {
    const el = e.target.closest('[data-zone]');
    if (el) focusZone(el.dataset.zone);
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
    choose: (i) => {
      ui.cand = -1;
      return CM.mice.choose(state, Number(i));
    },
    bestfit: () => CM.mice.bestFit(state),
    // Colonia: tocar un puesto enseña candidatos; tocar un ratón, sus puestos posibles.
    pickpost: (skill, zone) => {
      const key = skill + ':' + zone;
      ui.pick = ui.pick && ui.pick.type === 'post' && ui.pick.key === key ? null : { type: 'post', key };
    },
    pickmouse: (id) => {
      ui.card = null;
      ui.pick = ui.pick && ui.pick.type === 'mouse' && ui.pick.id === id ? null : { type: 'mouse', id };
      $('sheet-body').scrollTop = 0;
    },
    unpick: () => void (ui.pick = null),
    miceview: (v) => {
      ui.miceView = v;
      ui.pick = null;
      $('sheet-body').scrollTop = 0;
    },
    rocktoggle: (zoneId) => {
      const zones = q.openZones(state);
      const open = ui.rockOpen[zoneId] !== undefined ? ui.rockOpen[zoneId] : zones.length <= 2 || zoneId === ui.zone;
      ui.rockOpen[zoneId] = !open;
    },
    rosteropts: () => void (ui.rosterOpts = !ui.rosterOpts),
    combotoggle: (zoneId) => void (ui.comboOpen[zoneId] = !ui.comboOpen[zoneId]),
    // Un filtro del roster (también desde los avisos de COLONY y HOUSE).
    rosterfilter: (v) => {
      ui.miceView = 'roster';
      ui.miceShow = v;
      ui.pick = null;
    },
    rosterlikes: (job) => void (ui.miceLikes = ui.miceLikes === job ? '' : job),
    sec: (id) => {
      const def = { traits: true, specs: false, combos: null, rank: null }[id];
      const m = CM.mice.byId(state, ui.card);
      const auto = id === 'combos' ? !!m && (CM.mice.combosOf(m).length > 0 || (m.post && (() => { const t = CM.mice.team(state, m.post.split(':')[0], m.post.split(':')[1]); return t.links.length + t.sets.length > 0; })())) : id === 'rank' ? !!m && CM.mice.promoteInfo(state, m).can : def;
      ui.cardSec[id] = !(ui.cardSec[id] !== undefined ? ui.cardSec[id] : auto);
    },
    cand: (i) => void (ui.cand = Number(i)),
    newsall: () => void (ui.newsAll = !ui.newsAll),
    micesort: (v) => void (ui.miceSort = v),
    card: (id) => {
      ui.card = id;
      ui.pick = null;
      ui.cardSec = {};
      ui.retrain = null;
      $('sheet-body').scrollTop = 0;
    },
    back: () => void (ui.card = null),
    emptypost: () => CM.fail('empty-post'),
    // Asignar o intercambiar: un toque. Se cuenta qué ha pasado con los dos.
    post: (id, skill, zone) => {
      const key = skill ? skill + ':' + zone : '';
      const mover = CM.mice.byId(state, id);
      const other = key ? state.mice.find((x) => x.post === key && x !== mover) : null;
      const from = mover ? mover.post : '';
      const r = CM.mice.assign(state, id, key);
      if (r.ok) {
        ui.pick = null;
        ui.card = null;
        play('click');
        toast(!key ? mover.name + ' is resting in the house' : mover.name + ' now works at ' + CM.mice.postLabel(key) + (other ? '. ' + other.name + (from ? ' took ' + CM.mice.postLabel(from) : ' is waiting in the house') : ''), true);
      }
      return r;
    },
    promote: (id) => CM.mice.promote(state, id),
    // Ascensos pendientes: se eligen, se ve el total y se confirma una sola vez.
    promos: () => {
      ui.miceTab = 'promos';
      ui.promo = CM.mice.promotePicks(state, 'afford');
      ui.promoDone = null;
    },
    promoback: () => void (ui.miceTab = ''),
    promosel: (id) => {
      const m = CM.mice.byId(state, id);
      const steps = m ? CM.mice.promoteSteps(state, m) : [];
      if (!steps.length) return;
      if (ui.promo[id]) delete ui.promo[id];
      else ui.promo[id] = steps[steps.length - 1].rank;
    },
    promoto: (id, rank) => void (ui.promo[id] = Number(rank)),
    promoset: (mode) => void (ui.promo = mode === 'none' ? {} : CM.mice.promotePicks(state, mode)),
    promogo: () => {
      const plan = CM.mice.promoteCost(state, ui.promo);
      // Un segundo toque, con la selección ya gastada, no hace nada.
      if (!plan.steps) return;
      ui.bulkPromo = true;
      const r = CM.mice.promoteMany(state, ui.promo);
      drainEvents();
      ui.bulkPromo = false;
      if (!r.ok) return r;
      ui.promo = {};
      ui.promoDone = r;
      play('goal');
      scene.celebrate();
      toast('Promoted ' + r.mice + (r.mice === 1 ? ' mouse' : ' mice') + ' for ' + CM.fmt(r.cost), true);
      return r;
    },
    care: (id, kind, what, to) => {
      const r = CM.mice.careStart(state, id, kind, what, to);
      if (r.ok) ui.retrain = null;
      return r;
    },
    retrain: (id, skill) => void (ui.retrain = ui.retrain === id + ':' + skill ? null : id + ':' + skill),
    album: () => void ((ui.miceTab = ui.miceTab === 'album' ? '' : 'album'), ($('sheet-body').scrollTop = 0)),
    dismiss: (id) => void confirmDismiss(id),
    managers: () => void (state.settings.managersBuy = !state.settings.managersBuy),
    tab: (name) => void (ui.cheeseTab = name),
    book: () => {
      openPanel('cheese');
      ui.cheeseView = 'book';
    },
    cview: (name) => void ((ui.cheeseView = name), (ui.bookRow = null), ($('sheet-body').scrollTop = 0)),
    cline: (zoneId) => void (ui.cheeseLine = ui.cheeseLine === zoneId ? '' : zoneId),
    bookbase: (base) => void ((ui.cheeseView = 'book'), (ui.bookBase = base), (ui.bookRow = null), ($('sheet-body').scrollTop = 0)),
    bookrow: (id) => void (ui.bookRow = ui.bookRow === id ? null : id),
    // Abrir MICE con un puesto ya elegido.
    staffpost: (skill, zone) => {
      openPanel('mice');
      ui.pick = { type: 'post', key: skill + ':' + zone };
    },
    labtab: (name) => void (ui.labTab = name),
    labdiropen: () => void ((ui.labDirOpen = !ui.labDirOpen), (ui.labDirCat = null)),
    labdircat: (cat) => void (ui.labDirCat = cat),
    labhand: () => void (ui.labHand = !(ui.labHand === null ? !CM.cheesery.labWorker(state) : ui.labHand)),
    strainrecipe: (id) => void (ui.strainRecipe = id),
    strainfind: (id) => CM.cheesery.strainStart(state, id),
    // Cambiar de investigador: MICE, con el puesto de Research ya abierto.
    researcher: () => {
      openPanel('mice');
      if (!CM.cheesery.labHas(state, 'assistant')) return;
      ui.pick = { type: 'post', key: 'research:all' };
    },
    pick: (part, value) => void (ui.combo[part] = value),
    experiment: () => CM.cheesery.experiment(state, ui.combo),
    labcancel: () => CM.cheesery.labCancel(state),
    strain: (recipeId, id) => CM.cheesery.setStrain(state, recipeId, id === 'plain' ? '' : id),
    strainkeep: () => CM.cheesery.strainKeep(state),
    // Dirección de investigación: la marca el jugador (tocar la activa la quita).
    labdir: (kind, id) => {
      const dir = kind === 'none' ? '' : id ? kind + ':' + id : kind;
      state.lab.dir = state.lab.dir === dir ? '' : dir;
      ui.labDirOpen = false;
    },
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
      '<h2>' + (isNew ? 'NEW RECIPE!' : 'RENAME RECIPE') + '</h2><div class="hero">' + I.img('lot', combo.base, 'huge') + '</div><p class="hint">' + P.comboLine(combo) + '</p><div class="stats"><span class="stat v">' + P.coin(CM.shop.price(state, recipe)) + '</span><span class="stat tier ' + CM.cheesery.tierOf(value).toLowerCase() + '">' + CM.cheesery.tierOf(value) + '</span></div><input id="name-input" maxlength="40" autocomplete="off" value="' + P.esc(recipe.name) + '" /><p class="hint">' +
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
    lab: { why: 'Research gets its own building and its own job for a mouse.', then: 'Choose a direction, and put a mouse on Research in MICE' },
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

  // Del experimento a mano al laboratorio: qué cambia y qué hay que hacer ahora.
  function labBuiltCard() {
    showModal(
      '<h2>CHEESE LAB BUILT!</h2><div class="hero">' + I.img('flask', '', 'huge') + '</div><p class="lead">The lab <b>discovers new recipes</b> while your cheesemakers keep cooking.</p><ul class="list"><li><b>For now you start each research</b> yourself: pick the parts and go.</li><li><b>The lab learns with its upgrades.</b> The first one, Research Assistant, lets a mouse research for you.</li></ul><div class="row"><button class="buy" data-m="ok">OPEN THE LAB</button></div>',
      { ok: () => openPanel('lab') }
    );
  }

  // Cada mejora que abre una función del laboratorio: qué es y dónde está.
  function labUpgradeCard(id) {
    const cards = {
      assistant: ['RESEARCH ASSISTANT', 'The lab now has a <b>Research post</b>.', ['Put a mouse there and it researches for you, one recipe after another.', 'It always goes for the <b>most valuable recipe</b> you can make.', 'Your cheesemakers keep cooking meanwhile.'], 'ASSIGN A MOUSE', () => ACTS.researcher()],
      advanced: ['ADVANCED RESEARCH', 'You now choose the <b>direction</b> of the research.', ['Highest value, quickest to cook, one cheese, or one ingredient, treatment or maturation.', 'The mouse does the work; what to look for is your call.', 'With no direction it waits for you.'], 'CHOOSE A DIRECTION', () => { openPanel('lab'); ui.labTab = 'recipes'; ui.labDirOpen = true; }],
      strains: ['STRAIN RESEARCH', 'The lab has a new section: <b>STRAINS</b>.', ['A strain is a mutation of a cheese you already know: the same recipe, made another way.', 'Each one gives something and asks for something.', 'Found strains are never lost: you decide which one a recipe uses.'], 'SEE STRAINS', () => { openPanel('lab'); ui.labTab = 'strains'; }],
    };
    const c = cards[id];
    if (!c) return;
    banner(c[0] + ' UNLOCKED!');
    scene.celebrate();
    showModal('<h2>' + c[0] + '</h2><div class="hero">' + I.img('flask', '', 'huge') + '</div><p class="lead">' + c[1] + '</p><ul class="list">' + c[2].map((l) => '<li>' + l + '</li>').join('') + '</ul><div class="row"><button class="buy" data-m="ok">' + c[3] + '</button></div>', { ok: c[4] });
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
    if (sum.strainWaiting && B.strains[sum.strainWaiting.strain]) lines.push('<b class="tok">New strain found: ' + B.strains[sum.strainWaiting.strain].name + '</b> · compare it in LAB');
    // Partidas anteriores: lo que estaba pendiente de elegir lo han desarrollado ellos solos.
    if (state.inbox.length) {
      lines.push('<b>Mice now develop their traits on their own.</b> What was waiting for a choice:');
      for (const n of state.inbox.slice(0, 8)) lines.push(P.esc(n.name) + ': ' + n.traits.map((t) => '<b class="' + (B.mice.traits[t].kind === 'legend' ? 'tleg' : 'tok') + '">' + B.mice.traits[t].name + '</b>').join(' · '));
      if (state.inbox.length > 8) lines.push('...and ' + (state.inbox.length - 8) + ' more mice');
      state.inbox = [];
    }
    for (const up of sum.levelUps) lines.push(B.skills[up.skill].name + ': level ' + up.from + ' > ' + up.to);
    // Los ratones, agrupados: primero lo excepcional (un rasgo legendario), luego la cama,
    // después quién ha desarrollado algo y, en una sola línea, los que solo subieron de nivel.
    const news = sum.mouseNews || [];
    const TR = B.mice.traits;
    const isLegend = (t) => TR[t] && TR[t].kind === 'legend';
    let jewel = null;
    // Varios legendarios en una misma ausencia: se nombran los primeros, se cuenta el resto y
    // se celebra uno solo al cerrar, sin encadenar ventanas.
    let legends = 0;
    for (const n of news) {
      for (const t of (n.grew || []).filter(isLegend)) {
        legends += 1;
        if (legends <= 3) lines.push('<b class="tleg">&#9733; ' + P.esc(n.name) + ' developed a LEGENDARY trait: ' + TR[t].name + '</b>');
        jewel = jewel || { id: n.id, trait: t };
      }
    }
    if (legends > 3) lines.push('<b class="tleg">&#9733; ...and ' + (legends - 3) + ' more legendary traits.</b> Find them in MICE: ROSTER, show Legendary');
    if (sum.careDone) {
      const pat = CM.mice.byId(state, sum.careDone.id);
      if (pat) lines.push('Mouse House bed: ' + P.esc(pat.name) + (sum.careDone.kind === 'quirk' ? ' is over <b class="tok">' + TR[sum.careDone.what].name + '</b>' : ' retrained to <b class="tok">' + TR[sum.careDone.to].name + '</b>') + '. The bed is free');
    }
    const grew = news.filter((n) => (n.grew || []).some((t) => TR[t] && !isLegend(t)));
    for (const n of grew.slice(0, 4)) lines.push(P.esc(n.name) + ' developed ' + n.grew.filter((t) => TR[t] && !isLegend(t)).map((t) => '<b class="tok">' + TR[t].name + '</b>').join(', '));
    if (grew.length > 4) lines.push('...and ' + (grew.length - 4) + ' more mice developed traits. They are all in MICE, under HOUSE');
    const ups = news.filter((n) => n.to > n.from);
    if (ups.length) lines.push(ups.length === 1 ? P.esc(ups[0].name) + ': LV ' + ups[0].from + ' > ' + ups[0].to : ups.length + ' mice levelled up, ' + P.esc(ups.slice().sort((a, b) => b.to - b.from - (a.to - a.from))[0].name) + ' the most');
    const grades = news.reduce((a, n) => a + n.spec.length, 0);
    if (grades) lines.push(grades + (grades === 1 ? ' speciality went up a grade' : ' specialities went up a grade'));
    // Sin nada automatizado ni producido no hay nada que contar.
    if (!lines.length && (!sum.automated || sum.simulatedMs < 60000)) return;
    showModal(
      '<h2>WELCOME BACK</h2><p class="hint">Away ' + (mins < 1 ? 'under a minute' : mins >= 120 ? Math.round(mins / 60) + ' h' : mins + ' min') + (sum.capped ? ' (your mice work up to ' + Math.round(sum.capMs / 3600000) + ' h alone; the Night Lamp in COLONY extends it)' : '') + '</p>' +
        (lines.length ? '<ul class="list plain">' + lines.map((l) => '<li>' + l + '</li>').join('') + '</ul>' : '<p class="hint">Your mice had nothing they could do. Check what is stopped.</p>') + '<div class="row"><button class="buy" data-m="ok">NICE</button></div>',
      {
        // Un legendario descubierto con el juego cerrado se celebra al cerrar el resumen.
        ok() {
          const m = jewel && CM.mice.byId(state, jewel.id);
          if (m) legendMoment(m, jewel.trait);
        },
      }
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
    saveNow();
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
  // Sale una opción legendaria entre las tres: se avisa antes de elegir.
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
    const waiting = state.mice.find((x) => x !== m && !x.post && !x.rest);
    const post = !m.post ? '' : waiting ? ' ' + P.esc(waiting.name) + ' takes over ' + K.postLabel(m.post) + '.' : ' ' + K.postLabel(m.post) + ' is left with no mouse: you work it by hand until you recruit another.';
    showModal(
      '<h2>DISMISS ' + P.esc(m.name).toUpperCase() + '?</h2><div class="hero"><img class="pix face big" alt="" src="' + CM.mouseUrl(m) + '"></div><p class="hint"><b>LV ' + K.level(m) + ' ' + B.mice.ranks[m.rank].name + '.</b> It leaves for good: its level, rank and traits are lost and nothing is refunded.' + post + '</p><p class="hint">Recruiting does not get cheaper: the next mouse still costs ' + CM.fmt(K.recruitCost(state)) + ' coins.</p><div class="row"><button class="close" data-m="no">KEEP</button><button class="danger" data-m="ok">DISMISS</button></div>',
      {
        no() {},
        ok() {
          ui.card = null;
          ui.pick = null;
          K.dismiss(state, id);
          drainEvents();
          ui.rocksKey = null;
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
    tiles.lab.querySelector('img').src = I.url('flask');
    dk.quick.querySelector('img').src = I.url('coin');
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
      el.style.width = Math.round(progress(el.dataset.job === 'lab' ? state.lab.job : zone && zone.cookJob) * 100) + '%';
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
    updateBuyAll();
  }

  // ---------- Bucle ----------
  let last = performance.now();
  let acc = 0;
  let slowTick = 0;
  let saveTick = 0;
  function frame(t) {
    const real = Math.min(250, t - last);
    last = t;
    // Mientras se pone al día tras una ausencia, el tiempo de ahora espera.
    if (!CM.dev.paused && !catching) {
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
      saveNow();
    }
    requestAnimationFrame(frame);
  }

  // Una ausencia corta se calcula de golpe. Una larga, a trozos: la pantalla sigue viva y
  // enseña cuánto falta. Los pasos son los mismos, así que el resultado no cambia.
  let catching = null;
  // Siguiente trozo en cuanto el navegador haya podido pintar (un canal de mensajes no sufre
  // el freno que los temporizadores tienen en segundo plano).
  const later = (fn) => {
    const ch = new MessageChannel();
    ch.port1.onmessage = fn;
    ch.port2.postMessage(0);
  };
  // Mientras se pone al día, lo ya calculado llega hasta `now - left`: si el jugador cierra
  // a medias, lo que falte se cuenta la próxima vez.
  function saveNow() {
    CM.storage.save(state, catching ? catching.now - catching.left : Date.now());
  }
  function comeBack() {
    if (catching) return;
    const job = CM.sim.offlineStart(state, Date.now());
    const done = (sum) => {
      catching = null;
      saveNow();
      last = performance.now();
      acc = 0;
      syncShown();
      showOffline(sum);
    };
    if (!job) return done(null);
    if (job.simulated <= 30 * 60 * 1000) {
      CM.sim.offlineRun(job, Infinity);
      return done(CM.sim.offlineEnd(job));
    }
    catching = job;
    const hours = job.simulated / 3600000;
    showModal('<h2>WELCOME BACK</h2><p class="lead">Your mice kept working for <b>' + (hours >= 2 ? Math.round(hours) + ' hours' : Math.round(job.simulated / 60000) + ' minutes') + '</b>.</p><p class="hint">Catching up on everything they did...</p><div class="bar catchbar"><i id="catch-fill"></i></div><p class="hint" id="catch-num">0%</p>', {});
    const slice = () => {
      if (catching !== job) return;
      // Con la pestaña en segundo plano nadie mira la barra: trozos largos, para acabar antes.
      const part = CM.sim.offlineRun(job, document.hidden ? 400 : 60);
      const fill = $('catch-fill');
      if (fill) fill.style.width = Math.round(part * 100) + '%';
      const num = $('catch-num');
      if (num) num.textContent = Math.round(part * 100) + '%';
      if (job.left > 0) return void later(slice);
      closeModal();
      done(CM.sim.offlineEnd(job));
    };
    later(slice);
  }

  window.addEventListener('resize', scene.resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveNow();
    else comeBack();
  });
  window.addEventListener('pagehide', () => saveNow());

  setIcons();
  syncShown();
  // Al volver, se abre la estación que pide el objetivo actual.
  const startAt = GOAL_AT[CM.sim.objective(state).id];
  select(STATIONS.indexOf(startAt) >= 0 ? startAt : 'rock');
  if (loaded.recovered) toast('Your save was damaged, so a new game was started');
  if (!loaded.isNew) comeBack();
  else saveNow();
  // Acceso para depurar desde la consola del navegador.
  window.CM_DEBUG = {
    scene,
    get state() {
      return state;
    },
    comeBack,
    select,
    focusZone,
  };
  requestAnimationFrame(frame);
})();
