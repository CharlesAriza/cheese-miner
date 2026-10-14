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
  // Arrastre de ratones en COLONY (V4). Mientras dura, el panel no se repinta.
  const mdrag = { active: false, src: null, timer: 0, x: 0, y: 0, x0: 0, y0: 0, ghost: null, over: null, raf: 0, endAt: 0, touch: false };
  const ui = {
    investSeen: {}, // inversiones ya anunciadas (por rango)
    openedAt: 0, // cuándo se abrió el último panel o ventana (para ignorar el clic fantasma)
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
    rocks: $('dock-rocks'), boost: $('dock-boost'), info: $('dock-info'), why: $('dock-why'), side: $('dock-side'),
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
    if (at[0] < 0.03 || at[0] > 0.97 || els.floaters.childElementCount > 8) return;
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.innerHTML = text;
    el.style.setProperty('--r', (Math.random() * 16 - 8).toFixed(1) + 'deg');
    el.style.left = (at[0] + (Math.random() - 0.5) * 0.22) * 100 + '%';
    el.style.top = (at[1] + 0.03 + Math.random() * 0.06) * 100 + '%';
    els.floaters.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
  function banner(text, kind) {
    // Detrás de un panel la franja no se vería: la noticia va en el aviso de arriba.
    if (covered()) return toast(text, true);
    els.banner.textContent = text;
    // La Grand Wheel tiene su propia franja, dorada, para no confundirse con las demás noticias.
    els.banner.classList.toggle('wheel', kind === 'wheel');
    retrigger(els.banner, 'show');
  }
  // Los avisos hacen cola: cada uno se lee entero antes de dar paso al siguiente, en vez de
  // pisarse. Con cola, cada aviso dura menos; si se acumulan demasiados, se quedan los últimos.
  let toastTimer = 0;
  let toastBusy = false;
  const toastQueue = [];
  function nextToast() {
    // Mientras se ve el aviso de un movimiento de ratones (mismo sitio), los demás esperan.
    // También esperan los avisos de éxito mientras hay una ventana abierta (se ponían encima
    // de su título); un «no se puede» responde a un toque y sale siempre.
    if (toastQueue.length && (!$('mcx-fx').hidden || (!$('modal').hidden && toastQueue[0].good))) {
      els.toast.classList.remove('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(nextToast, 500);
      return;
    }
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
  // Con la colonia automatizada cada etapa de cada roca termina un ciclo por segundo: un sonido por
  // ciclo era una metralleta. Lo que hace el jugador con el dedo suena siempre. Lo de los ratones,
  // solo de la roca que se mira y como un latido suave cada pocos segundos; las ventas de la
  // tienda, una caja registradora de vez en cuando.
  const HUM_MS = 2600;
  const TILL_MS = 5200;
  let humAt = 0;
  let tillAt = 0;
  function workSound(name, ev, here) {
    if (ev.source === 'manual') return play(name);
    if (!here || covered()) return;
    const t = performance.now();
    if (t - humAt < HUM_MS) return;
    humAt = t;
    sfx.soft(name);
  }
  function saleSound(ev) {
    if (ev.source === 'manual') return play('coin');
    const t = performance.now();
    if (t - tillAt < TILL_MS) return;
    tillAt = t;
    sfx.soft('coin');
  }
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
    if (covered() || els.flyers.childElementCount > 10) return onArrive && onArrive();
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
  // Con la colonia automatizada cada etapa termina un ciclo por segundo: un número y unos iconos
  // por cada uno tapaban a los ratones y el marcador. Lo que producen los ratones se junta y se
  // enseña de vez en cuando con el total real; lo que hace el jugador con su dedo sale siempre.
  const FX_EVERY = 1200;
  const paced = {};
  function pace(key, amount, everyMs, manual) {
    const now = performance.now();
    const p = paced[key] || (paced[key] = { at: 0, sum: 0 });
    p.sum += amount;
    if (!manual && now - p.at < everyMs) return 0;
    const total = p.sum;
    p.at = now;
    p.sum = 0;
    return total;
  }
  const bump = (id) => retrigger($(id), 'bump');
  // V4.3: el pop de una estación. Antes era una clase (`bump`) que no se quitaba nunca y competía
  // en la misma propiedad `animation` con el latido de NEW! y con la casilla elegida: una tarjeta
  // podía quedarse con el estado equivocado. Ahora es una animación de la Web Animations API que
  // se suma a su posición (no la sustituye), la siguiente cancela a la anterior y al acabar no
  // deja nada puesto. Un salto de dos píxeles a pasos, como el resto del pixel art, en vez de
  // escalar la tarjeta (que además sacaba la chapa UP!/NEW! fuera de su sitio).
  const tilePops = {};
  const calmMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  const tileBump = (st) => {
    const el = tiles[st];
    if (!el || !el.animate || (calmMotion && calmMotion.matches)) return;
    if (tilePops[st]) tilePops[st].cancel();
    const step = (y) => ({ transform: 'translateY(' + y + 'px)', easing: 'steps(1, end)' });
    try {
      tilePops[st] = el.animate([step(0), step(-2), step(-1), step(0)], { duration: 240, composite: 'add' });
    } catch (e) {
      tilePops[st] = el.animate([step(0), step(-2), step(-1), step(0)], { duration: 240 });
    }
  };
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
        workSound('raw', ev, here);
        // Números e iconos solo de la roca que se mira: el marcador de arriba es el suyo.
        if (here) {
          const n = pace('raw:' + ev.zone, ev.amount, FX_EVERY, ev.source === 'manual');
          if (n) {
            float(I.img('raw', ev.base) + '+' + CM.fmt(n), 'rock', 'raw');
            fly(I.url('raw', ev.base), 'rock', $('res-raw'), Math.min(2, n), () => bump('res-raw'));
          }
        }
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
        workSound('base', ev, here);
        if (here) {
          const n = pace('base:' + ev.zone, ev.amount, FX_EVERY, ev.source === 'manual');
          if (n) {
            float(I.img('base', ev.base) + '+' + CM.fmt(n), 'refinery', 'base');
            fly(I.url('base', ev.base), 'refinery', $('res-base'), Math.min(2, n), () => bump('res-base'));
          }
        }
        tileBump('refinery');
        break;
      case 'lotDone': {
        const base = recipeBase(ev.recipeId);
        workSound('lot', ev, here);
        if (here) {
          const n = pace('lot:' + ev.zone, ev.amount || 1, FX_EVERY, ev.source === 'manual');
          if (n) {
            float(I.img('lot', base) + '+' + CM.fmt(n), 'cheesery', 'lot');
            fly(I.url('lot', base), 'cheesery', $('res-lots'), 1, () => bump('res-lots'));
          }
        }
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
        // Un solo aviso: quién llega y dónde trabaja (con el panel abierto, la franja sería otro aviso).
        const where = ev.taken ? CM.mice.postLabel(ev.wanted) + ' was filled while you chose: ' + (mouse.post ? 'it works at ' + CM.mice.postLabel(mouse.post) : 'it waits in the house') + '. Nobody was replaced' : mouse.post ? 'Works at ' + CM.mice.postLabel(mouse.post) : 'It waits in the house: every post has a mouse';
        if (ui.panel === 'mice') showFx('<img class="pix mcx-joinpic" alt="" src="' + CM.mouseUrl(mouse) + '"><div class="mcx-fxmain"><b>' + P.esc(mouse.name).toUpperCase() + ' JOINED THE COLONY!</b><span class="up">' + P.esc(where) + '</span></div>', 3800, 'join');
        else if (covered()) toast(mouse.name.toUpperCase() + ' JOINED THE COLONY! ' + where, true);
        else {
          banner(mouse.name.toUpperCase() + ' JOINED THE COLONY!');
          toast(where, true);
        }
        // V4.2: el nuevo llega a su puesto en COLONY con un pequeño salto y destello (sin ventanas).
        if (mouse.post) ui.arrive = mouse.post;
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
        ui.careLast = ev; // la cama de HOUSE enseña cómo acabó
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
      case 'milestoneOpen': {
        const node = CM.tree.node('cheesemaking', ev.id);
        play('goal');
        banner('NEW MILESTONE: ' + node.name.toUpperCase());
        toast(node.name + ' is waiting in CHEESE > UPGRADES', true);
        dirty = true;
        break;
      }
      case 'quotaSet':
        toast('Next milestone: cook ' + CM.fmt(ev.need) + ' cheese', true);
        dirty = true;
        break;
      // La rueda siempre se cobra; solo se celebra la de la roca que se está mirando.
      case 'grandWheel':
        if (ev.zone === ui.zone && !covered()) {
          play('goal');
          scene.celebrate();
          banner('GRAND WHEEL!\n+' + CM.fmt(ev.lots) + ' ' + B.bases[q.zoneDef(ev.zone).base].name.toUpperCase(), 'wheel');
        }
        break;
      case 'masterNamed': {
        const mouse = CM.mice.byId(state, ev.id);
        play('goal');
        scene.celebrate();
        // Si el título cambia varias veces seguidas, solo se anuncia el último.
        for (let i = toastQueue.length - 1; i >= 0; i--) if (toastQueue[i].text.indexOf(' IS YOUR GRAND MASTER!') > 0) toastQueue.splice(i, 1);
        if (mouse) banner(mouse.name.toUpperCase() + ' IS YOUR GRAND MASTER!');
        dirty = true;
        break;
      }
      case 'masterUp': {
        const mouse = CM.mice.byId(state, ev.id);
        play('goal');
        if (mouse) toast(mouse.name + ' is now Grand Master ' + ev.grade + ': its cheese is worth +' + Math.round(ev.grade * B.milestones.master.per * 100) + '%', true);
        dirty = true;
        break;
      }
      case 'boostEarned':
        play('goal');
        banner(ev.n > 1 ? ev.n + ' BOOSTS TO PLACE!' : 'NEW BOOST!');
        toast((ev.n > 1 ? ev.n + ' boosts wait' : 'A boost waits') + ' in BOOSTS: more speed for the post you choose, or more Base from a refinery', true);
        dirty = true;
        break;
      case 'boostPlaced':
      case 'boostRemoved':
        dirty = true;
        break;
      case 'promoted': {
        dirty = true;
        // En un ascenso en bloque se presentan todos juntos, uno a uno, al terminar.
        if (ui.bulkPromo) break;
        scene.celebrate();
        promoShow([{ id: ev.id, from: ev.rank - 1, to: ev.rank }]);
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
        saleSound(ev);
        if (ev.source === 'manual') buzz(15);
        {
          const n = pace('coins', ev.coins, FX_EVERY, ev.source === 'manual');
          if (n) {
            fly(I.url('coin'), 'shop', $('res-coins'), ev.source === 'manual' ? Math.min(5, 2 + ev.count) : 2, () => bump('res-coins'));
            float(I.img('coin') + '+' + CM.fmt(n), 'shop', 'coins');
          }
        }
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
        // Lo que compran solos los gerentes no suena: pasa a menudo y nadie lo ha pedido.
        if (!ev.auto || node.max === 1) play(ev.auto && node.max === 1 ? 'build' : 'upgrade');
        if (ev.auto && node.max === 1) {
          banner(node.name.toUpperCase() + ' HIRED!');
          scene.celebrate();
        }
        if (ev.skill === 'lab' && node.unlock) labUpgradeCard(ev.id);
        if (node.key && !ev.auto) investCard(ev.skill, ev.id);
        if (node.gate) milestoneCard(ev.id);
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
    renderPanel(true);
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
  // V4.4. NEW! es una novedad sin consultar; se marca vista al abrir donde se consulta y no
  // vuelve por lo mismo (se guarda en la partida). UP! es algo disponible y sigue mientras lo esté.
  const seen = (k) => !!(state.seen && state.seen[k]);
  function markSeen(...keys) {
    if (!state.seen) state.seen = {};
    for (const k of keys) if (k && !state.seen[k]) {
      state.seen[k] = true;
      dirty = true;
    }
  }
  // Lo que cuenta como «ya lo he visto» al abrir cada sitio.
  const stationNewKeys = (st) => {
    const out = [];
    if (st !== 'rock' && st !== 'lab' && !state.built[st] && CM.construction.buildInfo(state, st).canBuild) out.push('build:' + st);
    return out;
  };
  const colonyKeys = () => {
    const out = [];
    const next = CM.zones.next(state);
    if (next && state.coins >= next.unlockCost) out.push('zone:' + next.id);
    for (const it of CM.tree.investments(state)) out.push('invest:' + it.skill + '.' + it.node.id + ':' + CM.tree.rank(state, it.skill, it.node.id));
    return out;
  };
  const milestoneKeys = () => CM.milestones.waiting(state).map((n) => 'hito:' + n.id);
  // Las novedades del LAB que existen ahora mismo, cada una con su clave.
  const labKeys = () => {
    const out = [];
    const f = state.lab.found;
    if (f) out.push('lab:found:' + f.recipeId + ':' + f.strain);
    const job = state.lab.job;
    if (CM.cheesery.strainsOpen(state) && !state.recipes.some((r) => (r.strains || []).length) && !(job && job.strain)) out.push('lab:strains');
    if (!state.built.lab && CM.construction.buildInfo(state, 'lab').canBuild) out.push('lab:build');
    if (!state.built.lab && state.totals.recipes === 1) out.push('lab:first');
    return out;
  };
  function select(st, quiet) {
    markSeen(...stationNewKeys(st));
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
  const GOAL_AT = { quota: 'cheesery', milestone: 'cheesery', zone4: 'colony', zone5: 'colony', zone6: 'colony', house: 'mice', mouse: 'mice', allAuto: 'mice', promote: 'mice', vein: 'rock', drill: 'drill', raw: 'drill', refinery: 'refinery', base: 'refinery', cheesery: 'cheesery', recipe: 'cheesery', shop: 'shop', sale: 'shop', recipes8: 'cheesery', zone2: 'colony', zone3: 'colony', depth3: 'rock' };

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
      const hito = st === 'cheesery' && info.state !== 'locked' && info.state !== 'build' && CM.milestones.waiting(state).some((n) => !seen('hito:' + n.id));
      const canBuild = info.state === 'build' && CM.construction.buildInfo(state, st).canBuild;
      const fresh = (canBuild && !seen('build:' + st)) || hito;
      set(tile, 'isnew', fresh);
      set(tile, 'sel', ui.station === st);
      set(tile, 'goal', goalAt === st && ui.station !== st);
      set(tile.querySelector('.mini > i'), 'width', Math.round(info.progress * 100) + '%');
      // Refuerzos de esta etapa en la roca que se mira: marco azul y una chapa con uno o dos galones.
      const nb = String((info.state !== 'locked' && info.state !== 'build' && CM.boosts.at(state, skill, ui.zone)) || '');
      if (tile.dataset.boost !== nb) tile.dataset.boost = nb;
      set(tile.querySelector('u'), 'text', 'LV ' + q.level(state, skill));
      const auto = q.auto(state, skill, ui.zone);
      const ups = info.state !== 'locked' && info.state !== 'build' ? CM.tree.affordable(state, skill) : 0;
      // La mina pide ayuda cuando la roca busca veta y el taladro está parado esperándola.
      const zr = state.zones[ui.zone];
      const dig = st === 'rock' && state.built.drill && !zr.veinRevealed && !zr.drillJob && state.inv.raw[baseOfZone()] < 1;
      set(tile, 'help', dig);
      set(tile.querySelector('em'), 'text', info.state === 'locked' ? 'LOCK' : fresh ? 'NEW!' : canBuild ? 'UP!' : dig ? 'DIG!' : ups ? 'UP! ' + ups : auto ? 'AUTO' : '');
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
    // NEW! solo hasta abrir el LAB; lo que siga pendiente (una cepa por decidir, construirlo) pasa a UP!.
    const labPending = !!state.lab.found || strainsFresh || (!state.built.lab && CM.construction.buildInfo(state, 'lab').canBuild);
    const labNew = labKeys().some((k) => !seen(k));
    const noLab = state.totals.recipes < 1;
    if (lab.hidden !== noLab) lab.hidden = noLab;
    set(lab, 'sel', ui.panel === 'lab');
    set(lab, 'working', !!labJob);
    set(lab, 'isnew', labNew);
    set(lab.querySelector('.mini > i'), 'width', Math.round(progress(labJob) * 100) + '%');
    set(lab.querySelector('u'), 'text', researcher ? 'LV ' + CM.mice.level(researcher) : state.built.lab ? 'BY HAND' : Math.min(state.totals.recipes, B.buildings.lab.requires.min) + '/' + B.buildings.lab.requires.min);
    set(lab.querySelector('em'), 'text', labNew ? 'NEW!' : labPending ? 'UP!' : labUps ? 'UP! ' + labUps : researcher && CM.cheesery.labDir(state) ? 'AUTO' : '');
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
      // Con refuerzos, la refinería saca más Base del mismo Raw: se enseña la cifra real.
      const y = isDrill ? q.drillYield(state, ui.zone) : q.refineBatch(state) * q.refineMult(state) * CM.boosts.baseMult(state, ui.zone);
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
        // Cuánto cocinado falta para la siguiente Grand Wheel de esta línea.
        if (CM.milestones.has(state, 'wheel')) {
          const left = Math.max(0, B.milestones.wheel.everyMs - z.wheelMs) / 1000;
          m.status = 'Grand Wheel in ' + Math.floor(left / 60) + ':' + String(Math.floor(left % 60)).padStart(2, '0') + ' · ' + m.status;
        }
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
    // Lo que puede vender por minuto (con su vendedor) y cuánto cabe en las estanterías.
    const sw = CM.mice.work(state, 'trading', 'all');
    const capMin = (q.sellCount(state) / (q.sellDuration(state) / 1000 / (sw ? sw.speed : 1))) * 60;
    m.status = buyer.name + ' pay x' + buyer.mult + ' · sells up to ' + CM.fmt(Math.round(capMin)) + '/min · shelves hold ' + CM.fmt(Math.round(capMin * B.shop.shelfMinutes));
    if (info.state === 'working') {
      const job = state.jobs.shop;
      m.sub = (auto ? 'Auto · ' : '') + 'selling ' + CM.fmt(job.count) + ' for ' + CM.fmt(job.coins) + (job.whole ? ' (' + CM.fmt(job.whole) + ' at ½ price)' : '');
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
    // Refuerzos del puesto que se mira, con lo que dan («+50% SPEED», «x2.25 BASE»).
    const nb = m.tree ? CM.boosts.at(state, skill, ui.zone) : 0;
    // V4.4: solo las gemas (una por refuerzo); el multiplicador se consulta en BOOSTS.
    set(dk.boost, 'text', '');
    if (dk.boost.dataset.n !== String(nb || '')) dk.boost.dataset.n = String(nb || '');
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
        if (!node.unlock && !info.locked && !info.maxed && (!pick || info.cost < pick.cost)) pick = { id: node.id, name: node.name, cost: info.cost, can: info.canBuy };
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
    // Un hito esperando se anuncia aquí: se compra dentro, leyéndolo.
    const hito = m.tree && skill === 'cheesemaking' && CM.milestones.waiting(state).length > 0;
    set(dk.treeNum, 'text', !m.tree ? 'LOCKED' : hito ? 'MILESTONE!' : ups ? ups + ' READY' : 'TREE');
    set(dk.tree, 'has', ups > 0 || hito);
    set(dk.tree, 'hito', hito);
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
      const gm = w && w.id === state.master && CM.milestones.has(state, 'master');
      set(dk.workSub, 'text', w ? (pr.can ? 'PROMOTE!' : gm ? 'Grand Master ' + CM.milestones.masterGrade(w) : 'LV ' + CM.mice.level(w) + ' ' + B.mice.ranks[w.rank].name) : 'Tap to assign one');
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
    const inv = CM.tree.investments(state);
    if (r.bought) return toast('Bought ' + r.bought + ' upgrade' + (r.bought === 1 ? '' : 's') + ' for ' + CM.fmt(r.cost) + ': ' + Object.keys(r.bySkill).map((k) => TREE_NAME(k) + ' ' + r.bySkill[k]).join(', ') + (inv.length ? '. ' + inv[0].node.name + ' waits for you in COLONY' : ''), true);
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
  // Picar es a toques: cada uno, un golpe con su sonido. Las demás etapas se pueden mantener pulsadas.
  const REPEATABLE = { drill: 1, refine: 1, cheeseBoost: 1, sell: 1 };
  // Lo que se hace al apoyar el dedo (para que el golpe se sienta inmediato); lo demás, al soltar.
  const ON_PRESS = { mine: 1, drill: 1, refine: 1, cheeseBoost: 1, sell: 1 };
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
    // Abrir paneles, construir o ir a otra etapa se hace al soltar (con el clic): si se hiciera al
    // apoyar el dedo, el clic de ese mismo toque caería sobre lo que acaba de aparecer debajo.
    if (!ON_PRESS[ui.dockKind]) return;
    mainAction();
    if (REPEATABLE[ui.dockKind]) holdTimer = setInterval(() => (REPEATABLE[ui.dockKind] ? mainAction() : stopHold()), 160);
  });
  els.main.addEventListener('click', () => {
    if (!ON_PRESS[ui.dockKind]) mainAction();
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
    drag = { x: e.clientX, last: e.clientX, moved: false, at: performance.now() };
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
    const held = drag && performance.now() - drag.at >= 450;
    drag = null;
    if (wasDrag) return;
    // Prioridad de los toques en la escena: el edificio manda. Un ratón trabajando delante de su
    // estación no la tapa; su ficha se abre manteniendo el dedo sobre él, o tocándolo donde no hay
    // ningún edificio (los que van acarreando por el camino).
    const calm = performance.now() - lastStageTap > 600;
    lastStageTap = performance.now();
    const cv = stage.tagName === 'CANVAS' ? stage : stage.querySelector('canvas');
    const cbox = cv.getBoundingClientRect();
    // La altura se convierte con la del propio lienzo: puede no escalar igual que el ancho.
    const mouseId = scene.mouseAt(((e.clientX - cbox.left) / cbox.width) * cv.width, ((e.clientY - cbox.top) / cbox.height) * cv.height);
    const id = scene.hitTest(logical(e.clientX - stage.getBoundingClientRect().left));
    if (mouseId && (held || (!id && calm))) {
      sfx.click();
      openPanel('mice');
      ui.card = mouseId;
      return renderPanel();
    }
    if (!id) return;
    if (id === 'storage') return openPanel('stock');
    if (id === 'house') return openPanel('mice');
    if (id === 'lab') return openPanel('lab');
    const same = ui.station === id;
    if (!same) select(id, true);
    updateDock();
    if (same || ON_PRESS[ui.dockKind]) mainAction();
  });
  stage.addEventListener('pointercancel', () => (drag = null));
  // Mantener el dedo sobre un ratón no debe abrir el menú del navegador.
  stage.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---------- Paneles ----------
  function openPanel(name) {
    if (name === 'cheese' && !state.built.cheesery) return select('cheesery');
    // Sin recetas no hay libro que enseñar: la primera se descubre en el laboratorio.
    if (name === 'cheese' && !state.recipes.length) name = 'lab';
    if (name === 'lab') markSeen(...labKeys());
    if (name === 'mice') markSeen('build:house');
    if (name === 'lab') {
      ui.labDirOpen = false;
      ui.labDirCat = null;
      ui.labHand = null;
      if (state.recipes.length) ui.labSeen = true;
      if (state.lab.found) ui.labTab = 'strains';
      scene.focus(state.built.lab ? 'lab' : 'cheesery');
    }
    if (ui.panel !== name) {
      ui.openedAt = performance.now();
      $('mcx-fx').hidden = true;
      ui.fxOn = false;
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
      ui.moveSel = null;
      ui.cardSec = {};
      ui.rosterOpts = false;
      if (state.built.house) scene.focus('house');
    }
    renderPanel();
  }
  function openTree(skill) {
    if (skill === 'cheesemaking') markSeen(...milestoneKeys());
    if (skill === 'colony') markSeen(...colonyKeys());
    ui.tree = skill;
    openPanel('tree');
    scene.focus(skill === 'colony' ? 'storage' : skill === 'lab' ? 'lab' : B.skills[skill].station);
  }
  function closePanel() {
    ui.panel = null;
    ui.lastMove = null;
    ui.moveSel = null;
    ui.fxOn = false;
    $('mcx-fx').hidden = true;
    $('sheet').hidden = true;
  }
  // Solo toca el DOM si el contenido cambió, para no perder taps a medio pulsar.
  // V4.2: los paneles de cifras que cambian solas (despensa, SHOP, COINS) se repintan como mucho
  // cada 1,5 s cuando es la simulación la que pide repintar; la economía sigue igual y un toque
  // del jugador repinta al momento. Así se pueden leer.
  const CALM = { stock: 1, shopinfo: 1, coins: 1 };
  function renderPanel(tick) {
    if (!ui.panel || mdrag.src) return;
    if (tick && CALM[ui.panel] && performance.now() - (ui.calmAt || 0) < 1500) return;
    const html = P.render(ui.panel, state, ui);
    if (html !== ui.lastHtml) {
      ui.lastHtml = html;
      ui.calmAt = performance.now();
      $('sheet-body').innerHTML = html;
      // Las filas que se desplazan de lado vuelven a enseñar lo elegido, centrado.
      $('sheet-body').querySelectorAll('.strainpick').forEach((row) => {
        const on = row.querySelector('.on');
        if (on) row.scrollLeft = on.offsetLeft - row.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
      });
      updateAfford();
    }
    landCards();
    jumpRock();
    questHighlight();
    const rep = $('dev-report');
    if (rep) rep.textContent = CM.dev.report(state);
  }
  $('nav-colony').addEventListener('click', () => openTree('colony'));
  // La barra del objetivo se toca: una flecha pixel art dice que lleva a algún sitio.
  $('objective').addEventListener('click', () => {
    if (ghostClick()) return;
    sfx.click();
    questGo();
  });
  $('obj-text').insertAdjacentHTML('afterend', '<img class="pix obj-go" alt="" src="' + I.url('arrow') + '">');
  $('nav-mice').addEventListener('click', () => openPanel('mice'));
  // Tocar un contador de recurso abre la despensa.
  for (const id of ['res-raw', 'res-base', 'res-lots']) $(id).addEventListener('click', () => openPanel('stock'));
  // V4.1: tocar la tienda o las monedas explica la economía; la estación SELL sigue a un toque.
  $('res-shop').addEventListener('click', () => openPanel('shopinfo'));
  $('res-coins').addEventListener('click', () => openPanel('coins'));
  $('nav-menu').addEventListener('click', () => openPanel('options'));
  $('nav-boosts').addEventListener('click', () => openPanel('boosts'));
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
  // Un toque que abre un panel o una ventana (al apoyar el dedo, o al tocar la escena) no debe
  // pulsar además lo que aparece debajo del dedo cuando se levanta: el clic de ese mismo toque se
  // ignora. Era lo que cocinaba un queso al tocar RECIPES o cambiaba de pestaña al abrir el LAB.
  let pressAt = 0;
  document.addEventListener('pointerdown', () => (pressAt = performance.now()), true);
  const ghostClick = () => ui.openedAt > pressAt && performance.now() - pressAt < 700;
  // Clic suave en cualquier botón que no sea el de acción principal (ese ya suena por sí mismo).
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('button');
    if (b && b !== els.main) sfx.click();
  });

  // ---------- MICE V4: mover ratones con consecuencias a la vista ----------
  // Todo movimiento (arrastrar, tocar en un selector) pasa por aquí: se mide la colonia antes
  // y después con el mismo modelo que BEST FIT, se cuenta en un aviso que no bloquea y se
  // guarda lo necesario para deshacerlo exactamente.
  const K_ = () => CM.mice;
  const pct = (a, b) => (a > 0 ? (b / a - 1) * 100 : b > 0 ? Infinity : 0);
  function moveMouse(id, key) {
    const K = K_();
    const mover = K.byId(state, id);
    if (!mover) return CM.fail('invalid');
    const other = key ? state.mice.find((x) => x.post === key && x !== mover) : null;
    const before = [mover, other].filter(Boolean).map((m) => ({ id: m.id, post: m.post, rest: m.rest }));
    const snap0 = K.snapshot(state);
    const from = mover.post;
    const r = K.assign(state, id, key);
    if (!r.ok) return r;
    ui.moveSel = null;
    const snap1 = K.snapshot(state);
    ui.lastMove = { before, label: other && from ? mover.name + ' ↔ ' + other.name : mover.name + ' → ' + (key ? K.postLabel(key) : 'house') + (other ? ' · ' + other.name + ' to house' : '') };
    play('click');
    moveFeedback(snap0, snap1, { mover, other, from, key, label: ui.lastMove.label });
    ui.landed = [key, from].filter(Boolean);
    dirty = true;
    return r;
  }
  function undoMove() {
    const m = ui.lastMove;
    if (!m) return CM.fail('invalid');
    const snap0 = K_().snapshot(state);
    const r = K_().restore(state, m.before);
    if (!r.ok) {
      ui.lastMove = null;
      toast('Cannot undo: the colony changed since that move');
      return CM.ok();
    }
    const snap1 = K_().snapshot(state);
    ui.lastMove = null;
    play('click');
    moveFeedback(snap0, snap1, { label: 'UNDONE: ' + m.label, undo: true });
    ui.landed = m.before.map((x) => x.post).filter(Boolean);
    dirty = true;
    return r;
  }
  // El aviso: quién se ha movido, cómo cambian los ingresos estimados y la producción de las
  // rocas tocadas, y qué combinaciones aparecen o se pierden. Sustituye al anterior, no tapa los
  // puestos (va encima del panel) y se va solo.
  let fxTimer = 0;
  function moveFeedback(a, b, o) {
    const P2 = CM.panels;
    const fmtPct = (v) => (v === Infinity ? 'STARTS' : Math.abs(v) < 0.05 ? '±0%' : (v > 0 ? '+' : '−') + (Math.abs(v) >= 10 ? Math.round(Math.abs(v)) : Math.abs(v).toFixed(1)) + '%');
    const tone = (v) => (v === Infinity || v >= 0.05 ? 'up' : v <= -0.05 ? 'down' : 'flat');
    const chips = [];
    const inc = pct(a.income, b.income);
    if (a.income > 0 || b.income > 0) chips.push('<i class="' + tone(inc) + '">EST. INCOME ' + fmtPct(inc) + '</i>');
    // Las rocas que han cambiado de verdad (y las de los puestos tocados, aunque no cambien).
    const touched = {};
    for (const k of [o.key, o.from]) if (k && k.split(':')[1] !== 'all') touched[k.split(':')[1]] = true;
    for (const z of Object.keys(b.flow)) if (Math.abs(pct(a.flow[z], b.flow[z])) >= 0.05) touched[z] = true;
    for (const z of Object.keys(touched)) {
      const v = pct(a.flow[z] || 0, b.flow[z] || 0);
      const name = B.bases[q.zoneDef(z).base].name.toUpperCase();
      // Una línea parada solo tiene el goteo de la despensa: pasar de eso a producir es arrancar.
      const fa = a.flow[z] || 0, fb = b.flow[z] || 0;
      const word = fa <= fb * 0.02 && fb > 0 ? 'RUNNING' : fb <= fa * 0.02 && fa > 0 ? 'STOPPED' : '';
      chips.push('<i class="' + (word === 'RUNNING' ? 'up' : word ? 'down' : tone(v)) + '">' + name + ' ' + (word || fmtPct(v)) + '</i>');
    }
    // Una combinación con la tienda o el laboratorio se ve desde los dos puestos: se nombra una vez.
    const names = (x, y) => Object.keys(x).filter((k) => !y[k]).map((k) => x[k].name).filter((n, i, all) => all.indexOf(n) === i);
    const gained = names(b.combos, a.combos);
    const lost = names(a.combos, b.combos);
    let combos = '';
    if (gained.length) combos += '<span class="up">NEW COMBO: ' + gained.map(P2.esc).join(', ') + '</span>';
    if (lost.length) combos += '<span class="down">LOST: ' + lost.map(P2.esc).join(', ') + '</span>';
    showFx('<div class="mcx-fxmain"><b>' + P2.esc(o.label).toUpperCase().replace(' \u2194 ', ' ' + I.px('swap') + ' ').replace(' \u2192 ', ' ' + I.px('arrow') + ' ') + '</b><div class="mcx-chips">' + chips.join('') + '</div>' + combos + '</div>' + (o.undo ? '' : '<button data-act="undomove" class="mcx-undo mcx-pixbtn">' + I.img('undo') + 'UNDO</button>'));
    if (gained.length) play('reveal');
  }
  // El aviso de arriba del panel: uno a la vez (el nuevo sustituye al anterior), entra y sale
  // a saltos y se va solo. Lo usan los movimientos de ratones y las llegadas de contratados.
  function showFx(html, ms, cls) {
    const el = $('mcx-fx');
    if (toastBusy && els.toast.classList.contains('show')) {
      toastQueue.unshift({ text: els.toast.textContent, good: els.toast.classList.contains('good') });
      els.toast.classList.remove('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(nextToast, 500);
    }
    el.innerHTML = html;
    el.className = 'mcx-fx' + (cls ? ' ' + cls : '');
    el.hidden = false;
    ui.fxOn = true; // mientras se ve, el UNDO está en el aviso; después, en la línea de ocupación
    void el.offsetWidth;
    el.classList.add('in');
    clearTimeout(fxTimer);
    fxTimer = setTimeout(() => {
      el.classList.add('out');
      fxTimer = setTimeout(() => {
        el.hidden = true;
        ui.fxOn = false;
        renderPanel();
      }, 240);
    }, ms || 6000);
  }
  // V4.4. Objetivos como acceso: tocar la barra lleva a donde se avanza en el objetivo actual,
  // resalta el control que toca y no compra ni ejecuta nada. Ver la tabla en la entrega.
  const QUEST_STATION = { vein: 'rock', depth3: 'rock', drill: 'drill', raw: 'drill', refinery: 'refinery', base: 'refinery', cheesery: 'cheesery', shop: 'shop', sale: 'shop' };
  function questGo() {
    const goal = CM.sim.objective(state);
    const id = goal.id;
    if (QUEST_STATION[id]) {
      if (ui.panel) closePanel();
      return select(QUEST_STATION[id]);
    }
    if (id === 'recipe') return openPanel('cheese');
    if (id === 'recipes8') return openPanel(state.built.lab ? 'lab' : 'cheese');
    if (id === 'house' || id === 'mouse' || id === 'allAuto') return openPanel('mice');
    if (id === 'promote') {
      openPanel('mice');
      if (state.mice.some((m) => CM.mice.promoteInfo(state, m).levelOk && m.rank < B.mice.ranks.length - 1)) {
        ui.miceTab = 'promos';
        ui.promo = CM.mice.promotePicks(state, 'afford');
        ui.promoDone = null;
      }
      return renderPanel();
    }
    if (/^zone\d$/.test(id)) {
      // La siguiente roca se abre en COLONY: se lleva allí y se resalta su botón (sin pagarlo).
      const next = CM.zones.next(state);
      openTree('colony');
      if (next) ui.questHl = '[data-act="zone:' + next.id + '"]';
      return renderPanel();
    }
    if (id === 'milestone') {
      const wait = CM.milestones.waiting(state)[0];
      openTree('cheesemaking');
      if (wait) ui.questHl = '[data-act="node:cheesemaking:' + wait.id + '"]';
      return renderPanel();
    }
    if (id === 'quota') {
      openTree('cheesemaking');
      ui.questHl = '.ms-goal';
      return renderPanel();
    }
    if (id === 'node') {
      // «Compra una mejora»: el árbol de la estación que se mira, o el de la mejora más barata.
      const sw = CM.tree.sweep(state, true).next;
      return openTree(SKILL[ui.station] && B.trees[SKILL[ui.station]] ? SKILL[ui.station] : sw ? sw.skill : 'mining');
    }
    if (id === 'level5' || id === 'level25') {
      // Sube trabajando: se elige la estación de la habilidad más avanzada (su barra de XP).
      const best = Object.keys(SKILL).filter((st) => st !== 'lab' && (st === 'rock' || state.built[st])).sort((a, b) => q.level(state, SKILL[b]) - q.level(state, SKILL[a]))[0];
      if (ui.panel) closePanel();
      return select(best || 'rock');
    }
  }
  // Tras pintar: llevar a la vista y resaltar el control que pide el objetivo.
  // El panel se repinta solo (cambian las monedas): el resaltado se vuelve a poner durante 1,6 s
  // sobre el control nuevo, sin volver a desplazar la lista.
  function questHighlight() {
    const q2 = ui.questHl;
    if (!q2) return;
    if (typeof q2 === 'string') ui.questHl = { sel: q2, until: performance.now() + 1600, scrolled: false };
    const h = ui.questHl;
    if (performance.now() > h.until) {
      $('sheet-body').querySelectorAll('.qhl').forEach((e) => e.classList.remove('qhl'));
      ui.questHl = null;
      return;
    }
    const el = $('sheet-body').querySelector(h.sel);
    if (!el) return;
    if (!h.scrolled) {
      el.scrollIntoView({ block: 'center' });
      h.scrolled = true;
    }
    if (!el.classList.contains('qhl')) el.classList.add('qhl');
  }
  // Llevar una roca (o los puestos de toda la colonia) arriba de la lista, bajo la barra de mover.
  function jumpRock() {
    if (!ui.jumpTo) return;
    const body = $('sheet-body');
    const el = body.querySelector('[data-rock="' + ui.jumpTo + '"]');
    ui.jumpTo = '';
    if (!el) return;
    const bar = body.querySelector('.mcx-movebar');
    body.scrollTop += el.getBoundingClientRect().top - body.getBoundingClientRect().top - (bar ? bar.offsetHeight + 4 : 0);
  }
  // Tras pintar, los puestos que acaban de cambiar dan un pequeño salto.
  function landCards() {
    if (ui.arrive) {
      const c = $('sheet-body').querySelector('[data-post="' + ui.arrive + '"]');
      if (c) {
        ui.arrive = '';
        c.scrollIntoView({ block: 'center' });
        c.classList.remove('mcx-arrive');
        void c.offsetWidth;
        c.classList.add('mcx-arrive');
      }
    }
    if (!ui.landed || !ui.landed.length) return;
    for (const k of ui.landed) {
      const c = $('sheet-body').querySelector('[data-post="' + k + '"]');
      if (c) {
        c.classList.remove('mcx-land');
        void c.offsetWidth;
        c.classList.add('mcx-land');
      }
    }
    ui.landed = null;
  }

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
    // V4.1: el botón con el precio paga una vez y abre a los tres candidatos.
    recruit: () => {
      ui.cand = -1;
      const r = CM.mice.offer(state);
      if (r.ok) ui.miceTab = 'recruit';
      return r;
    },
    // Ir a los candidatos ya pagados, o dejarlos esperando para mirar otra cosa.
    recruitview: () => void ((ui.miceTab = state.candidates.length ? 'recruit' : ''), ($('sheet-body').scrollTop = 0)),
    recruitlater: () => void (ui.miceTab = ''),
    choose: (i) => {
      ui.cand = -1;
      // De vuelta a COLONY, para ver al nuevo llegar a su puesto. Nada de lo que hubiera antes
      // (una ficha, un puesto elegido) se abre después por su cuenta.
      ui.pick = null;
      ui.card = null;
      ui.miceTab = '';
      ui.moveSel = null;
      return CM.mice.choose(state, Number(i));
    },
    // PROTOTIPO: cargar una colonia de prueba (temprana, media o avanzada).
    protoload: (which) => {
      fetch('proto/' + which + '.json')
        .then((r) => r.text())
        .then((text) => {
          const next = CM.storage.parse(text, Date.now());
          if (!next) return toast('Could not load the test colony');
          next.lastSavedAt = Date.now();
          replaceState(next);
          closePanel();
          toast('Test colony loaded: ' + which, true);
        })
        .catch(() => toast('Could not load the test colony'));
      return CM.ok();
    },
    // BEST FIT busca al tocarlo (unas décimas de segundo) y dice qué ha hecho.
    bestfit: () => {
      const r = CM.mice.bestFit(state);
      if (r.ok) toast(r.moved ? 'BEST FIT moved ' + r.moved + (r.moved === 1 ? ' mouse' : ' mice') + (r.gain > 1.005 ? ': about +' + Math.round((r.gain - 1) * 100) + '% coins (an estimate)' : '') : 'No better line-up found: your mice stay where they are', true);
      return r;
    },
    // Colonia: tocar un puesto enseña candidatos; tocar un ratón, sus puestos posibles.
    pickpost: (skill, zone) => {
      const key = skill + ':' + zone;
      $('sheet-body').scrollTop = 0;
      ui.pick = ui.pick && ui.pick.type === 'post' && ui.pick.key === key ? null : { type: 'post', key };
    },
    // V4.1: MOVE vuelve a COLONY con el ratón elegido; el destino se toca a la vista.
    pickmouse: (id) => {
      ui.card = null;
      ui.pick = null;
      ui.miceTab = '';
      ui.miceView = 'rocks';
      ui.moveSel = id;
      const m = CM.mice.byId(state, id);
      ui.jumpTo = m && m.post ? m.post.split(':')[1] : '';
    },
    movecancel: () => void (ui.moveSel = null),
    moveto: (skill, zone) => {
      const id = ui.moveSel;
      ui.moveSel = null;
      return moveMouse(id, skill + ':' + zone);
    },
    // Saltar a una roca sin tener que recorrer la colonia (también con un ratón elegido).
    jump: (zone) => {
      if (zone !== 'all') ui.rockOpen[zone] = true;
      ui.jumpTo = zone;
    },
    unpick: () => void (ui.pick = null),
    miceview: (v) => {
      ui.miceView = v;
      ui.pick = null;
      ui.moveSel = null;
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
      const r = moveMouse(id, skill ? skill + ':' + zone : '');
      if (r.ok) {
        ui.pick = null;
        ui.card = null;
      }
      return r;
    },
    undomove: undoMove,
    stockall: () => void (ui.stockAll = !ui.stockAll),
    // Puesto vacío: mover uno que ya tienes o conocer a tres nuevos (pagando con dos toques).
    recruitfor: (skill, zone) => {
      ui.cand = -1;
      const r = CM.mice.offer(state, skill + ':' + zone);
      if (r.ok) {
        ui.miceTab = 'recruit';
        $('sheet-body').scrollTop = 0;
      }
      return r;
    },
    promote: (id) => CM.mice.promote(state, id),
    // Refuerzos: tocar un puesto pone uno libre; si no cabe o no queda ninguno, quita uno de ahí.
    boost: (skill, zone) => {
      const key = CM.mice.postKey(skill, zone);
      const B2 = CM.boosts;
      if (B2.free(state) > 0 && B2.at(state, skill, zone) < B.boosts.perPost) return B2.place(state, key);
      if (B2.at(state, skill, zone) > 0) return B2.remove(state, key);
      return B2.place(state, key);
    },
    // V4.1: elegir un puesto, y poner o quitar con botones separados (misma mecánica).
    // V4.3: un hueco lleno se quita; uno vacío pone un refuerzo libre. Si no queda ninguno, no
    // se toca nada (nunca se quita de otro puesto) y se dice por qué.
    boslot: (skill, zone, i) => {
      const key = skill + ':' + zone;
      const j = Number(i);
      const n = CM.boosts.at(state, skill, zone);
      if (!ui.boSlot) ui.boSlot = {};
      const occ = n >= 2 ? [true, true] : n <= 0 ? [false, false] : (ui.boSlot[key] || 0) === 1 ? [false, true] : [true, false];
      if (occ[j]) {
        // Quitar ESTE: si queda uno, se queda en el otro hueco.
        const r = CM.boosts.remove(state, key);
        if (r.ok) ui.boSlot[key] = 1 - j;
        return r;
      }
      if (CM.boosts.free(state) <= 0) return CM.fail('no-boost');
      const r = CM.boosts.place(state, key);
      if (r.ok && n === 0) ui.boSlot[key] = j;
      return r;
    },
    boostclear: () => {
      while (state.boosts.length) CM.boosts.remove(state, state.boosts[state.boosts.length - 1]);
    },
    namemaster: (id) => CM.milestones.nameMaster(state, id),
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
      const ranks = {};
      for (const m of state.mice) ranks[m.id] = m.rank;
      ui.bulkPromo = true;
      const r = CM.mice.promoteMany(state, ui.promo);
      drainEvents();
      ui.bulkPromo = false;
      if (!r.ok) return r;
      ui.promo = {};
      ui.promoDone = r;
      play('goal');
      scene.celebrate();
      // V4.1: cada ascenso se ve, uno a uno, en una sola ventana (los grandes, al final).
      const list = state.mice.filter((m) => m.rank > ranks[m.id]).map((m) => ({ id: m.id, from: ranks[m.id], to: m.rank }));
      list.sort((a, b) => a.to - b.to);
      promoShow(list);
      return r;
    },
    care: (id, kind, what, to) => {
      const r = CM.mice.careStart(state, id, kind, what, to);
      if (r.ok) ui.retrain = null;
      if (r.ok) ui.bedIntro = { id, at: performance.now() }; // HOUSE enseña cómo llega a la cama
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
    if (!el || ghostClick()) return;
    // El clic que llega al soltar un arrastre no abre la ficha.
    if (performance.now() - mdrag.endAt < 450 && $('sheet-body').contains(el)) return;
    const parts = el.dataset.act.split(':');
    const fn = ACTS[parts[0]];
    if (!fn) return;
    report(fn.apply(null, parts.slice(1)), el);
    drainEvents();
    renderPanel();
    dirty = true;
  }
  $('sheet').addEventListener('click', onAct);

  // ---------- MICE V4: arrastrar ratones entre puestos ----------
  // Tocar abre la ficha. Mantener quieto el dedo un momento levanta al ratón; entonces se
  // arrastra a otro puesto (vacío: se traslada; ocupado: se intercambian) y al soltar fuera se
  // cancela. Si el dedo se mueve antes de levantarlo, es un scroll normal y no pasa nada.
  const LIFT_MS = 380;
  const SLOP = 9;
  const body = $('sheet-body');
  function dragStart(x, y, target, touch) {
    if (ui.panel !== 'mice' || mdrag.active) return;
    const card = target.closest && target.closest('.mc-post[data-mouse], .mc-row[data-mouse]');
    if (!card || !body.contains(card)) return;
    dragReset();
    Object.assign(mdrag, { src: card, x, y, x0: x, y0: y, touch });
    mdrag.timer = setTimeout(dragLift, LIFT_MS);
  }
  function dragLift() {
    const card = mdrag.src;
    if (!card || !document.body.contains(card)) return dragReset();
    mdrag.active = true;
    const m = CM.mice.byId(state, card.dataset.mouse);
    const g = document.createElement('div');
    g.className = 'mcx-ghost';
    g.innerHTML = card.querySelector('.mc-face').outerHTML + '<b>' + P.esc(m ? m.name : '') + '</b><small></small>';
    document.body.appendChild(g);
    mdrag.ghost = g;
    mdrag.over = undefined; // así el primer pintado ya pone la etiqueta
    card.classList.add('mcx-src');
    body.classList.add('mcx-dragging');
    try {
      if (navigator.vibrate) navigator.vibrate(12);
    } catch (e) {}
    sfx.click();
    ui.dragTold = true;
    dragPaint();
    mdrag.raf = requestAnimationFrame(dragTick);
  }
  // Qué hay bajo el dedo: un puesto distinto del de origen, o nada (cancelar).
  function dragTarget() {
    const el = document.elementFromPoint(mdrag.x, mdrag.y);
    const card = el && el.closest && el.closest('.mc-post[data-post]');
    return card && card !== mdrag.src && body.contains(card) ? card : null;
  }
  function dragPaint() {
    const g = mdrag.ghost;
    if (!g) return;
    g.style.transform = 'translate(' + Math.round(mdrag.x - 28) + 'px,' + Math.round(mdrag.y - 46) + 'px)';
    const over = dragTarget();
    if (over !== mdrag.over) {
      if (mdrag.over) mdrag.over.classList.remove('mcx-over');
      if (over) over.classList.add('mcx-over');
      mdrag.over = over;
      const other = over && over.dataset.mouse ? CM.mice.byId(state, over.dataset.mouse) : null;
      const fromHouse = !mdrag.src.dataset.post;
      g.querySelector('small').textContent = !over ? 'drop on a post' : other ? (fromHouse ? 'replace ' + other.name : 'swap with ' + other.name) : 'move here';
      g.classList.toggle('ok', !!over);
    }
  }
  // Cerca de los bordes de la lista, se desplaza sola.
  function dragTick() {
    if (!mdrag.active) return;
    const r = body.getBoundingClientRect();
    const edge = 44;
    const v = mdrag.y < r.top + edge ? -Math.ceil((r.top + edge - mdrag.y) / 4) : mdrag.y > r.bottom - edge ? Math.ceil((mdrag.y - (r.bottom - edge)) / 4) : 0;
    if (v) {
      body.scrollTop += v;
      dragPaint();
    }
    mdrag.raf = requestAnimationFrame(dragTick);
  }
  function dragMove(x, y) {
    if (!mdrag.src) return;
    mdrag.x = x;
    mdrag.y = y;
    if (!mdrag.active) {
      if (Math.abs(x - mdrag.x0) > SLOP || Math.abs(y - mdrag.y0) > SLOP) dragReset();
      return;
    }
    dragPaint();
  }
  function dragEnd(cancel) {
    if (!mdrag.active) return dragReset();
    const over = cancel ? null : dragTarget();
    const id = mdrag.src.dataset.mouse;
    mdrag.endAt = performance.now();
    dragReset();
    if (over) {
      report(moveMouse(id, over.dataset.post));
      drainEvents();
    }
    ui.lastHtml = '';
    renderPanel();
  }
  function dragReset() {
    clearTimeout(mdrag.timer);
    cancelAnimationFrame(mdrag.raf);
    if (mdrag.ghost) mdrag.ghost.remove();
    if (mdrag.over) mdrag.over.classList.remove('mcx-over');
    if (mdrag.src) mdrag.src.classList.remove('mcx-src');
    body.classList.remove('mcx-dragging');
    Object.assign(mdrag, { active: false, src: null, timer: 0, ghost: null, over: null, raf: 0 });
  }
  // Dedo: eventos táctiles, para poder frenar el scroll solo cuando hay un ratón levantado.
  body.addEventListener('touchstart', (e) => (e.touches.length === 1 ? dragStart(e.touches[0].clientX, e.touches[0].clientY, e.target, true) : dragReset()), { passive: true });
  body.addEventListener(
    'touchmove',
    (e) => {
      if (!mdrag.src) return;
      if (mdrag.active) e.preventDefault();
      dragMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: false }
  );
  body.addEventListener('touchend', () => dragEnd(false));
  body.addEventListener('touchcancel', () => dragEnd(true));
  // Ratón (escritorio): lo mismo con el botón izquierdo.
  body.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button === 0) dragStart(e.clientX, e.clientY, e.target, false);
  });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && mdrag.src && !mdrag.touch) dragMove(e.clientX, e.clientY);
  });
  window.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse' && mdrag.src && !mdrag.touch) dragEnd(false);
  });
  // Mantener pulsado no abre el menú del sistema ni selecciona texto sobre un puesto.
  body.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.mc-post')) e.preventDefault();
  });
  // Si se cierra el panel con un ratón levantado, se cancela sin mover a nadie.
  document.addEventListener('visibilitychange', () => mdrag.src && dragEnd(true));
  $('sheet').addEventListener('click', (e) => {
    if (e.target === $('sheet') && !ghostClick()) closePanel();
  });

  // ---------- Modales ----------
  let modalHandlers = {};
  // Si ya hay una ventana abierta, la nueva espera su turno (salvo si la abre la propia ventana).
  const modalQueue = [];
  let inModal = false;
  let modalToken = 0;
  function showModal(html, handlers) {
    if (!$('modal').hidden && !inModal) return void modalQueue.push([html, handlers]);
    ui.openedAt = performance.now();
    modalToken += 1;
    modalHandlers = handlers || {};
    $('modal-body').classList.remove('badflash'); // el destello rojo de una manía no se queda para la siguiente ventana
    $('modal-body').innerHTML = html;
    $('modal').hidden = false;
  }
  function closeModal() {
    $('modal').hidden = true;
    modalHandlers = {};
    const next = modalQueue.shift();
    if (next) showModal(next[0], next[1]);
  }
  $('modal').addEventListener('click', (e) => {
    const el = e.target.closest('[data-m]');
    if (!el || ghostClick()) return;
    const fn = modalHandlers[el.dataset.m];
    const token = modalToken;
    inModal = true;
    let keep = false;
    try {
      keep = !!fn && fn() === false;
    } finally {
      inModal = false;
    }
    // Si el manejador abrió otra ventana, esa se queda; si no, se cierra esta.
    if (!keep && token === modalToken) closeModal();
    renderPanel();
  });

  // Nombre de oficio para los uniformes: «Master Miner», «Master Cheesemaker».
  const TRADE = { mining: 'MINER', drilling: 'DRILLER', refining: 'REFINER', cheesemaking: 'CHEESEMAKER', trading: 'TRADER', research: 'RESEARCHER' };
  // ---------- Ascensos: uno a uno, con el antes, la transformación y el después ----------
  // V4.1. Una sola ventana para todos los ascensos de una vez: cada ratón con su aspecto de
  // antes, un cambio en pixel art y su aspecto, rango y beneficio nuevos. Master y Manager
  // tienen presentación especial. Se puede acelerar o saltar. Clases `pv-`.
  const RANK_NAME = B.mice.ranks.map((r) => r.name.toUpperCase());
  function promoGains(m, from, to) {
    const K = CM.mice;
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const before = Object.assign({}, m, { rank: from });
    const out = [];
    if (skill) {
      const pct = Math.round((K.speed(m, skill, state, zone) / K.speed(before, skill, state, zone) - 1) * 100);
      if (pct > 0) out.push('Works <b>' + pct + '% faster</b> at ' + K.postLabel(m.post));
    } else out.push('Works faster at any job, for good');
    if (from < 2 && to >= 2) out.push(skill && m.look !== undefined && CM.mice.parts(m).hat !== 5 ? 'Wears the <b>' + TRADE[skill] + '</b> uniform at work' : 'Wears the uniform of its trade at work');
    if (from < 3 && to >= 3) {
      out.push('<span class="pv-unlock">AUTO-UPGRADES UNLOCKED</span>');
      const budget = Math.round(B.mice.managerBudget * 100);
      out.push(skill && B.trees[skill] ? 'Every 2 seconds it buys the cheapest ' + B.skills[skill].name + ' upgrade it can, if it costs at most ' + budget + '% of your coins. Milestones and investments stay yours.' : skill ? 'In the lab there are no upgrades for it to buy: on another post it buys that job\'s upgrades.' : 'On a post, it buys the cheapest upgrades of that job on its own.');
      if (!state.settings.managersBuy) out.push('Managers are switched OFF in HOUSE: turn them on there.');
    }
    return out;
  }
  const promo = { list: [], i: 0, fast: false, timer: 0 };
  function promoHtml() {
    const n = promo.list.length;
    if (promo.summary) {
      return '<div class="pv-card"><h2>' + n + ' PROMOTIONS</h2><div class="pv-team">' + promo.list.map((it) => { const m = CM.mice.byId(state, it.id); return m ? '<figure class="r' + it.to + '"><img class="pix" src="' + CM.mouseUrl(m) + '" alt="" /><figcaption>' + P.esc(m.name) + '<small>' + RANK_NAME[it.to] + '</small></figcaption></figure>' : ''; }).join('') + '</div><div class="row"><button class="buy pv-btn" data-m="next">GREAT</button></div></div>';
    }
    const it = promo.list[promo.i];
    const m = CM.mice.byId(state, it.id);
    if (!m) return '<div class="pv-card"><div class="row"><button class="buy pv-btn" data-m="next">OK</button></div></div>';
    const special = it.to >= 2 && it.from < it.to && (it.to === 3 || it.from < 2);
    const before = CM.mouseUrl(Object.assign({}, m, { rank: it.from }));
    const title = it.to === 3 ? 'MANAGER!' : it.to === 2 ? 'MASTER!' : 'PROMOTED';
    const last = promo.i >= n - 1;
    return (
      '<div class="pv-card r' + it.to + (special ? ' special' : '') + (promo.fast ? ' fast' : '') + '">' + (n > 1 ? '<small class="pv-count">' + (promo.i + 1) + ' / ' + n + '</small>' : '') +
      '<h2>' + title + '</h2><div class="pv-stage">' + (special ? '<i class="pv-rays"></i>' : '') + '<img class="pix pv-before" src="' + before + '" alt="" /><img class="pix pv-after" src="' + CM.mouseUrl(m) + '" alt="" /><i class="pv-spark"></i></div>' +
      '<p class="pv-who"><b>' + P.esc(m.name) + '</b><span>' + RANK_NAME[it.from] + ' <i>&gt;</i> <u>' + RANK_NAME[it.to] + '</u></span></p>' +
      '<ul class="pv-gains">' + promoGains(m, it.from, it.to).map((g) => '<li>' + g + '</li>').join('') + '</ul>' +
      '<div class="row">' + (!last ? '<button class="close pv-btn" data-m="skip">SKIP ALL</button><button class="close pv-btn" data-m="fast">' + (promo.fast ? 'NORMAL' : 'FASTER') + '</button>' : '') + '<button class="buy pv-btn" data-m="next">' + (last ? 'GREAT' : 'NEXT') + '</button></div></div>'
    );
  }
  function promoStep() {
    clearTimeout(promo.timer);
    // Si la ventana ya se cerró (o es otra), no se pinta nada encima.
    if ($('modal').hidden || !$('modal-body').querySelector('.pv-card')) return;
    $('modal-body').innerHTML = promoHtml();
    const it = promo.list[promo.i];
    play(it && it.to >= 2 && !promo.summary ? 'goal' : 'bell');
    // Más rápido: pasa solo al siguiente cuando ha terminado su animación.
    if (promo.fast && !promo.summary && promo.i < promo.list.length - 1) promo.timer = setTimeout(() => (promo.i++, promoStep()), it.to >= 2 ? 1300 : 700);
  }
  function promoShow(list) {
    if (!list.length) return;
    Object.assign(promo, { list, i: 0, fast: false, summary: false });
    clearTimeout(promo.timer);
    play(list.some((it) => it.to >= 2) ? 'goal' : 'bell');
    showModal(promoHtml(), {
      next() {
        clearTimeout(promo.timer);
        if (promo.summary || promo.i >= promo.list.length - 1) return;
        promo.i += 1;
        promoStep();
        return false;
      },
      fast() {
        promo.fast = !promo.fast;
        promoStep();
        return false;
      },
      skip() {
        promo.summary = true;
        promoStep();
        return false;
      },
    });
  }
  // Inversión comprada (por ejemplo, una Night Lamp): qué cambia, con números de antes y después.
  function investCard(skill, id) {
    const node = CM.tree.node(skill, id);
    const rank = CM.tree.rank(state, skill, id);
    let what = node.desc;
    if (node.eff.offlineHours) {
      const now = Math.round(q.offlineCapMs(state) / 3600000);
      what = 'Your mice now keep working <b>' + now + ' hours</b> while you are away, instead of ' + (now - node.eff.offlineHours) + '.';
    }
    play('bell');
    scene.celebrate();
    showModal('<h2>' + node.name.toUpperCase() + (node.max > 1 ? ' ' + rank + '/' + node.max : '') + '</h2><p class="lead">' + what + '</p><p class="hint">Investments are yours to buy: BUY ALL and managers leave them to you.</p><div class="row"><button class="buy" data-m="ok">NICE</button></div>', { ok() {} });
  }

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

  // Explica el hito que se acaba de comprar: qué hace y qué se puede decidir con él.
  function milestoneCard(id) {
    const cards = {
      wheel: ['GRAND WHEEL', 'Every line now turns out a <b>Grand Wheel</b> from time to time.', ['Each line makes one after every 10 minutes of cooking.', 'A wheel is worth 2 more minutes of that line\'s cheese, on top of what it makes.', 'It costs no Base and no coins, and it also happens while you are away.', 'The Cheesery shows how long until the next one.'], 'lot'],
      board: ['CHEESE BOARD', 'Customers now pay more for a <b>real mix</b> of cheeses.', ['The mix is measured on what you actually sell: ingredients, treatments and maturations.', 'Selling two types in equal parts counts as two. A type that barely sells barely counts.', 'To change the mix, fix a different recipe for a rock in the RECIPE BOOK. It stays fixed.', 'The Cheesery shows the board and what it adds to every sale.'], 'coin'],
      master: ['GRAND MASTER', 'You can now give one mouse the title of <b>Grand Master</b>.', ['Open a mouse in MICE and name it. Only one mouse holds the title.', 'The cheese it cooks is worth more with every grade: the first at 20K batches cooked in its life, and one more each time that doubles.', 'It only counts while it works on a Cheesemaking post, for that rock.', 'You can pass the title on. Each mouse keeps the experience it has.'], 'lot'],
    };
    const c = cards[id];
    if (!c) return;
    // Ya está comprado: el aviso de que esperaba, si aún hacía cola, sobra.
    for (let i = toastQueue.length - 1; i >= 0; i--) if (toastQueue[i].text.indexOf(' is waiting in CHEESE') > 0) toastQueue.splice(i, 1);
    banner(c[0] + ' UNLOCKED!');
    scene.celebrate();
    showModal('<h2>' + c[0] + '</h2><div class="hero">' + I.img(c[3], baseOfZone(), 'huge') + '</div><p class="lead">' + c[1] + '</p><ul class="list">' + c[2].map((l) => '<li>' + l + '</li>').join('') + '</ul><div class="row"><button class="buy wide" data-m="ok">GOT IT</button></div>', { ok: () => {} });
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
    if (d.wheels) lines.push(I.img('lot', base) + 'Grand Wheels: ' + d.wheels + ' (+' + CM.fmt(d.wheelLots) + ' cheese)');
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
        if (legends <= 3) lines.push('<b class="tleg">' + I.px('star') + ' ' + P.esc(n.name) + ' developed a LEGENDARY trait: ' + TR[t].name + '</b>');
        jewel = jewel || { id: n.id, trait: t };
      }
    }
    if (legends > 3) lines.push('<b class="tleg">' + I.px('star') + ' ...and ' + (legends - 3) + ' more legendary traits.</b> Find them in MICE: ROSTER, show Legendary');
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
      '<div class="rays"></div><div class="rain">' + rain + '</div><div class="card"><div class="top">' + I.px('star') + ' LEGENDARY ' + I.px('star') + '</div><img class="pix" alt="" src="' + CM.mouseUrl(mouse) + '"><div class="who">' + P.esc(mouse.name) + (born ? ' joined your colony' : '') + '</div><div class="name">' + def.name.toUpperCase() + '</div><p>' + def.desc + '.</p>' + change + '<small>tap to continue</small></div>';
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
    $('ic-shop').src = I.url('lot', 'cheddar');
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
    // La tienda: el queso en el mostrador (también el que se está vendiendo ahora mismo).
    const onSale = state.jobs.shop ? state.jobs.shop.count - (state.jobs.shop.whole || 0) : 0;
    set($('shop-stock'), 'text', CM.fmt(roll('shop', q.lotsTotal(state) + onSale)));

    const obj = CM.sim.objective(state);
    // Sin nada pendiente, la franja se queda en un renglón fino; vuelve a su tamaño con el siguiente objetivo.
    set($('objective'), 'idle', !!obj.done);
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
    // Los tres contadores de la roca son estrechos: la unidad va una vez, en su etiqueta.
    const show = (id, value, unit) => {
      const v = Math.round(value);
      set($(id), 'text', v ? (v > 0 ? '+' : '') + CM.fmt(v) + (unit || '') : '');
      set($(id), 'neg', v < 0);
    };
    show('rate-coins', r.coins, '/min');
    // La roca que se mira: para Raw y Base, si se amontona, se gasta todo lo que llega o está parada.
    const lane = r.lanes[ui.zone];
    const flow = (id, made, used, allWord, idleWord) => {
      const el = $(id);
      const net = made - used;
      let text = '';
      let cls = '';
      if (made < 0.5 && used < 0.5) {
        text = idleWord;
        cls = 'idle';
      } else if (Math.abs(net) <= 0.05 * Math.max(made, used)) {
        text = allWord;
        cls = 'ok';
      } else {
        text = (net > 0 ? '+' : '−') + CM.fmt(Math.round(Math.abs(net))) + '/min';
        cls = net > 0 ? 'pile' : 'draw';
      }
      set(el, 'text', text);
      set(el, 'cls', cls);
    };
    flow('rate-raw', lane.raw, lane.rawUsed, 'all refined', state.zones[ui.zone].veinRevealed ? 'no drilling' : 'finding a vein');
    flow('rate-base', lane.base, lane.baseUsed, 'all cooked', 'no refining');
    set($('lots'), 'text', lane.lots >= 0.5 ? '+' + CM.fmt(Math.round(lane.lots)) : '0');
    set($('rate-lots'), 'text', lane.lots >= 0.5 ? '/min to shop' : 'not cooking');
    set($('rate-lots'), 'cls', lane.lots >= 0.5 ? 'ok' : 'idle');
    // La tienda: lo que vende por minuto frente a lo que podría; si no da abasto, lo que sobra
    // se va al mayorista a mitad de precio.
    const w = CM.mice.work(state, 'trading', 'all');
    const cap = state.built.shop ? (q.sellCount(state) / (q.sellDuration(state) / 1000 / (w ? w.speed : 1))) * 60 : 0;
    const full = r.whole >= 0.5;
    set($('shop-rate'), 'text', !state.built.shop ? 'not built' : full ? 'FULL · extra at ½ price' : 'sells ' + CM.fmt(Math.round(r.sold)) + '/min');
    set($('res-shop'), 'full', full);
    set($('shop-fill'), 'width', (cap ? Math.round(Math.min(1, (r.sold - r.whole) / cap) * 100) : 0) + '%');
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
  function navChip(id, text) {
    const d = $(id).querySelector('.dot');
    set(d, 'text', text);
    set(d, 'on', !!text);
    set(d, 'new', text === 'NEW!');
  }
  function updateDots() {
    const next = CM.zones.next(state);
    const invest = CM.tree.investments(state);
    const colony = (next && state.coins >= next.unlockCost) || invest.length > 0;
    // V4.4: chapas con texto en vez de puntos rojos. NEW! hasta abrirlo; luego UP! mientras siga.
    const ckeys = colonyKeys();
    navChip('nav-colony', ckeys.some((k) => !seen(k)) ? 'NEW!' : colony ? 'UP!' : '');
    set($('nav-colony'), 'invest', invest.length > 0);
    // Una inversión que ya se puede pagar se anuncia una vez por rango.
    for (const it of invest) {
      const k = it.skill + '.' + it.node.id + ':' + CM.tree.rank(state, it.skill, it.node.id);
      if (ui.investSeen[k]) continue;
      ui.investSeen[k] = true;
      toast(it.node.name + ' ready in COLONY: ' + it.node.desc.charAt(0).toLowerCase() + it.node.desc.slice(1), true);
    }
    // Puestos cubiertos / totales, siempre a la vista en MICE.
    if (state.built.house) {
      const posts = CM.mice.posts(state);
      const staffed = posts.filter((p) => CM.mice.at(state, p.skill, p.zone)).length;
      set($('nav-mice-n'), 'text', staffed + '/' + posts.length);
      set($('nav-mice'), 'vacant', staffed < posts.length);
    }
    // MICE avisa si hay casa por construir, candidatos por elegir, un puesto libre y monedas para reclutar, o un ascenso que ya se puede pagar.
    // MICE: la casa por construir (novedad), candidatos pagados esperando (PICK) o un ascenso
    // que ya se puede pagar (UP!). Las vacantes las dice el contador 24/26.
    const house = !state.built.house && CM.construction.buildInfo(state, 'house').canBuild;
    navChip('nav-mice', house ? (seen('build:house') ? 'UP!' : 'NEW!') : state.candidates.length ? 'PICK' : state.mice.some((m) => CM.mice.promoteInfo(state, m).can) ? 'UP!' : '');
    set($('nav-mice'), 'goal', GOAL_AT[CM.sim.objective(state).id] === 'mice');
    // BOOSTS aparece con el primer refuerzo; el punto solo avisa de los que están sin colocar.
    const owned = CM.boosts.owned(state);
    if ($('nav-boosts').hidden === owned > 0) $('nav-boosts').hidden = !(owned > 0);
    // BOOSTS: cuántos refuerzos quedan por colocar.
    const freeB = CM.boosts.free(state);
    navChip('nav-boosts', freeB > 0 ? '+' + freeB : '');
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
      renderPanel(true);
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
