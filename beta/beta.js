// CHEESE DRILLER BETA · MAIN 3.0 sobre la partida real. La composición, la escena y la navegación son las de P1 (proto3/p0.js);
// aquí se sustituyen sus datos simulados por el núcleo (core/game.js): lo que se ve es lo que hay. `sim` ya no simula nada: es la
// vista que lee la escena, copiada de la partida en cada fotograma. Las hojas de este hito son vistas básicas: las hojas Pulido+
// completas llegan en el Hito 3. Guarda en su propia clave (core/save.js) y no lee ni toca ninguna otra partida.
(function () {
  const $ = (id) => document.getElementById(id);
  const Core = E2.game, Sv = E2.save, Pg = E2.progression, Inv = E2.inventory, Mo = E2.model, Ru = E2.rules, Cr = E2.crew, Lb = E2.lab;
  Core.setup();
  const REAL = E2.REAL, ROOT = window.BETA_ROOT != null ? window.BETA_ROOT : '../';
  const NAME = { mine: 'MINE', drill: 'DRILL', refine: 'REFINE', cheese: 'CHEESE', sell: 'SELL', lift: 'LIFT', lab: 'LAB' };
  const ICON = { mine: 'ic_pick', drill: 'ic_raw_cheddar', refine: 'ic_base_cheddar', cheese: 'ic_lot_cheddar', sell: 'ic_coin' };
  const RANKS = REAL.mice.ranks.map((r) => r.name);
  const ROLE = { picker: 'Picker', climber: 'Scaffolder', collector: 'Collector', hauler: 'Hauler', operator: 'Operator', filler: 'Filler', greaser: 'Greaser', pumphand: 'Pump hand', runner: 'Runner', stoker: 'Stoker', gauge: 'Gauge hand', valve: 'Valve hand', moulder: 'Moulder', mixer: 'Curd mixer', presser: 'Presser', sealer: 'Sealer', stacker: 'Stacker', carrier: 'Carrier', turner: 'Wheel turner', taster: 'Taster', winch: 'Winch', liftman: 'Lift operator', keeper: 'Shopkeeper', porter: 'Porter', researcher: 'Researcher' };
  // Los mismos puestos con el nombre que usa la escena.
  const SCENE_ROLE = { checker: 'pumphand', molder: 'moulder', packer: 'sealer' };
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading' };
  const WORK = ['mine', 'drill', 'refine', 'cheese', 'sell'];
  const BO_LABEL = { drill: ['', '+50%', 'x2.25'], refine: ['', '+50%', 'x1.8'], cheese: ['', '+50%', 'x2.25'], mine: ['', '+50%', 'x2.25'], sell: ['', '+50%', 'x2.25'] };
  const VERB = { mine: 'DIG', drill: 'DRILL', refine: 'STOKE', cheese: 'STIR', sell: 'SELL' };
  const RUSH_MAX = 3200, RUSH_TAP = 1200, RUSH_ST = ['drill', 'refine', 'cheese', 'sell'];
  const rush = { until: {} };
  const SAVE_EVERY = 15000, OFFLINE_MIN = REAL.offline.minMs;
  const fmt = (n) => { n = Math.floor(n); if (n < 10000) return String(n); const u = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'], t = Math.min(6, Math.floor(Math.log10(n) / 3)), v = n / Math.pow(10, t * 3); return v.toFixed(v < 100 ? 1 : 0) + u[t]; };
  const ic = (k) => ROOT + 'assets/main2/out/sprites/' + k + '.png';
  const ICD = {};
  function icd(k) {
    if (ICD[k]) return ICD[k];
    const im = new Image(); im.onload = () => { try { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); ICD[k] = c.toDataURL(); } catch (e) {} }; im.src = ic(k);
    return ic(k);
  }
  for (const t of ['cheddar', 'gouda', 'brie', 'emmental', 'parmesan', 'blue']) for (const k of ['ic_raw_', 'ic_base_', 'ic_lot_']) icd(k + t);
  for (const k of ['ic_pick', 'ic_coin']) icd(k);
  const isOpen = (el) => el.dataset.open === '1';
  function showEl(el) { clearTimeout(el._t); el.dataset.open = '1'; el.hidden = false; void el.offsetWidth; el.classList.add('in'); }
  function hideEl(el, ms = 200) { if (!isOpen(el) && el.hidden) return; el.dataset.open = '0'; el.classList.remove('in'); clearTimeout(el._t); el._t = setTimeout(() => (el.hidden = true), ms); }
  function pulse(el, cls = 'hit', ms = 260) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); clearTimeout(el['_' + cls]); el['_' + cls] = setTimeout(() => el.classList.remove(cls), ms); }

  // ---- Iconos de la barra: los de P1 ----
  function sprite(rows, pal) {
    const w = Math.max(...rows.map((r) => r.length)), h = rows.length, c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2; const g = c.getContext('2d');
    const at = (x, y) => (rows[y] && rows[y][x] && rows[y][x] !== '.' ? rows[y][x] : null);
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) { const ch = at(x, y); if (ch) g.fillStyle = pal[ch]; else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) g.fillStyle = '#1b1220'; else continue; g.fillRect(x + 1, y + 1, 1, 1); }
    return c.toDataURL();
  }
  const NAV_IC = {
    mouse: sprite(['EE....EE.', 'EPE..EPE.', '.GGGGGG..', 'GGKGGKGG.', 'GGGGGGGGN', '.GGWWGG..', '..GGGG...'], { E: '#cfc6cc', P: '#ff9ab5', G: '#f1eaec', K: '#1b1622', N: '#ff7a9c', W: '#ffffff' }),
    bolt: sprite(['....HBB', '...HBB.', '..HBB..', '.HBBBBB', '...BBB.', '..BBB..', '.BB....', '.B.....'], { B: '#5ad1ff', H: '#c8f2ff' }),
    menu: sprite(['HHHHHHHHHH', 'SSSSSSSSSS', '..........', '..........', 'HHHHHHHHHH', 'SSSSSSSSSS', '..........', '..........', 'HHHHHHHHHH', 'SSSSSSSSSS'], { H: '#f4f0fa', S: '#b9b2cc' }),
    ret: sprite(['...Y......', '..YY......', '.YYYYYYYY.', '..YY....YY', '...Y.....Y', '.........Y', '........YY', '....YYYYY.'], { Y: '#ffcf2e' }),
    bars: sprite(['......YY.', '.....YYYY', '......YY.', '......YY.', '...SS.YY.', '...SS.YY.', 'SS.SS.YY.', 'SS.SS.YY.'], { Y: '#ffcf2e', S: '#d6d0e6' }),
    // SPRITE: el registro de objetivos, una tablilla con su lista (provisional). Una moneda se confundía con otra divisa.
    goal: sprite(['...DDDD...', '.BBDGGDBB.', 'BPPPPPPPPB', 'BPLLPLLLPB', 'BPPPPPPPPB', 'BPLLPLLLPB', 'BPPPPPPPPB', 'BPLLPLLLPB', 'BPPPPPPPPB', 'BBBBBBBBBB'], { B: '#a8703a', D: '#6c7a96', G: '#c9d1e0', P: '#f4efe0', L: '#6b5a4a' }),
  };
  document.querySelectorAll('[data-ic]').forEach((im) => (im.src = NAV_IC[im.dataset.ic]));

  // ---- La partida ----
  // Guardado: nada de aquí toca otra clave (save.js lo impide). Sin almacenamiento disponible se juega, y se avisa de que no guarda.
  let store = null;
  try { const t = '__cd_beta_test'; localStorage.setItem(Sv.KEY + '-t', t); localStorage.removeItem(Sv.KEY + '-t'); store = localStorage; } catch (e) { store = null; }
  let G = null, savedAt = 0, brokenSave = false, loadedSave = null, saveFailed = !store;
  if (store) { const raw = store.getItem(Sv.KEY); try { loadedSave = Sv.read(store); } catch (e) { loadedSave = null; } if (raw && !loadedSave) brokenSave = true; }
  G = loadedSave ? loadedSave.game : Core.create({ seed: (Date.now() % 2147483647) || 1 });
  let paused = !loadedSave;
  function saveNow() {
    if (!store || paused) return false;
    try { Sv.write(store, G, Date.now()); savedAt = Date.now(); saveFailed = false; return true; } catch (e) { saveFailed = true; return false; }
  }

  // ---- Lo que lee la escena: una copia de la partida, sin nada propio ----
  const sim = { depth: 0, hits: 0, need: 1, vein: false, left: 0, cap: 1, raw: 0, base: 0, cheese: 0, coins: 0, drillJob: 0, refJob: 0, cookJob: 0, sellJob: 0, boost: {}, boosted: { drill: 0, refine: 0, cheese: 0, mine: 0, sell: 0 }, built: {}, ready: {} };
  const tierNow = () => Mo.stratumOf(G.s.depth).id;
  const remain = (j, scale) => (j ? Math.max(1, ((j.end - G.s.t) / j.total) * scale) : 0);
  function syncSim() {
    const s = G.s;
    sim.depth = s.depth; sim.vein = s.vein.open; sim.hits = s.vein.found; sim.need = Math.max(1e-9, s.vein.need); sim.left = s.vein.left; sim.cap = Math.max(1, s.vein.cap);
    sim.raw = s.inv.raw; sim.base = s.inv.base; sim.cheese = Mo.lotsTotal(s); sim.coins = s.coins;
    sim.drillJob = remain(s.job.drill, 2000); sim.refJob = remain(s.job.refine, 3000); sim.cookJob = remain(s.job.cheese, 3500); sim.sellJob = remain(s.job.sell, 2600);
    for (const st of ['drill', 'refine', 'cheese', 'sell']) { sim.built[st] = !!s.built[st]; sim.ready[st] = Pg.isOpen(G, 'build.' + st); }
    sim.built.house = !!G.built.house; sim.ready.house = Pg.isOpen(G, 'build.house'); sim.built.lab = !!G.lab.built; sim.ready.lab = Pg.isOpen(G, 'build.lab');
    for (const st of WORK) sim.boosted[st] = G.boosts.place[st] || 0;
  }
  syncSim();
  // Ritmos del último minuto: los de verdad, contados según llegan.
  const madeLog = { raw: [], base: [], cheese: [], coins: [] };
  const made = (k, n) => madeLog[k].push([performance.now(), n]);
  const rate = (k) => { const now = performance.now(), a = madeLog[k]; while (a.length && now - a[0][0] > 60000) a.shift(); return a.reduce((x, y) => x + y[1], 0); };

  // ---- La escena: la de P1; quién hay en cada puesto lo dice la partida ----
  let dragger = null;
  function crewAt(st, role) {
    const stCore = st === 'lift' ? 'sell' : st;
    if (st === 'lab') return role === 'researcher' && G.lab.workers.length ? G.roster.find((m) => m.id === G.lab.workers[0]) || null : null;
    const r = SCENE_ROLE[role] || role, p = G.s.placed.find((q) => q.st === stCore && q.role === r);
    return p && !(dragger && dragger.isHidden(p.m)) ? p.m : null;
  }
  const scene = CM.createColonyScene($('cv'), $('scene-box'), sim, { hit: () => {}, crewAt, camExit: new URLSearchParams(location.search).get('exit'), boostLabel: (st, n, x, y) => boostLabel(st, n, x, y) });
  let crewSig = '', selected = 'mine', tierShown = null;
  const crewSigOf = () => G.s.placed.map((p) => p.st + p.role + p.m.id).sort().join() + '|' + G.lab.workers.join() + '|' + WORK.map((st) => G.phase[st]).join('') + '|' + (dragger ? dragger.sig : '');
  function syncCrew(force) {
    const sg = crewSigOf();
    if (!force && sg === crewSig) return;
    crewSig = sg;
    for (const st of ['mine', 'drill', 'refine', 'cheese']) scene.setStageOf(st, G.phase[st]);
    scene.setMice(G.roster.slice());
    if (isOpen(pop)) paintCrew(true);
  }
  function syncWorld() {
    const t = tierNow(); if (t !== tierShown) { scene.setTier(t); tierShown = t; }
    scene.setSurface(Math.max(1, Math.min(4, G.lab.phase)));
  }

  // ---- Lo que pasa en la partida llega a la escena y a los avisos ----
  const UNLOCK_TXT = (id) => {
    const [a, b] = id.split('.');
    if (a === 'build') return ({ drill: 'The Cheese Drill can be built', refine: 'The Refinery can be built', cheese: 'The Cheesery can be built', sell: 'The Cheese Shop can be built', house: 'The Mouse House can be built', lab: 'The Cheese Lab can be built' })[b];
    if (a === 'boost') return 'New boost! See BOOSTS';
    if (a === 'phase2' || a === 'phase3') return NAME[b] + ' can grow: see UPGRADES';
    if (a === 'path' || a === 'ms') return 'New choice in UPGRADES';
    if (a === 'lab' || a === 'plan') return 'New in the Cheese Lab';
    if (a === 'study') return 'New cheese to study in the Lab';
    return null;
  };
  let freshUp = false;
  function processEvents() {
    for (const e of Core.drain(G)) {
      switch (e.type) {
        case 'reveal': scene.onEvent('reveal'); if (!G.s.built.drill) toast('Vein found!'); break;
        case 'drillDone': made('raw', e.amount); scene.onEvent('drillDone'); break;
        case 'refineDone': made('base', e.amount); scene.onEvent('refineDone'); break;
        case 'lotDone': made('cheese', e.n + (e.wheel || 0)); scene.onEvent('cookDone'); break;
        case 'sale': made('coins', e.coins); scene.onEvent('sale'); break;
        case 'depth': { scene.onEvent('deeper'); const t = tierNow(); if (t !== tierShown) { scene.setTier(t); tierShown = t; scene.onEvent('stratum'); toast('New stratum: ' + t.toUpperCase()); } break; }
        case 'unlock': { const tx = UNLOCK_TXT(e.id); if (tx) toast(tx); if (/^(phase|path|ms)/.test(e.id)) freshUp = true; break; }
        case 'specialty': case 'trait': { const m = G.roster.find((x) => x.id === e.id), tr = REAL.mice.traits[e.trait]; if (m && tr) toast(m.name + ' learned ' + tr.name); break; }
        default: break;
      }
    }
  }

  // ---- Placas de estación ----
  const plates = {};
  for (const id of ['cheese', 'refine', 'drill', 'mine']) {
    const b = document.createElement('button'); b.className = 'p0-plate'; b.innerHTML = '<img class="pix" src="' + icd(ICON[id]) + '" alt="">' + NAME[id] + '<i class="bo-chip" aria-hidden="true"><i></i><i></i></i><b class="rx">×2</b>';
    b.insertAdjacentHTML('beforeend', '<b class="bd">BUILD</b>');
    b.addEventListener('click', () => focusSt(id));
    $('plates').appendChild(b); plates[id] = b;
  }
  // Carteles de obra: SHOP, HOUSE y LAB no tienen placa de estación. Mientras se pueden construir llevan la misma placa verde que las
  // máquinas, encima de su silueta; si la superficie no se ve, el cartel se queda arriba con una flecha. Construidos, desaparecen.
  const SIGNS = { sell: { at: 'shop', name: 'SHOP', ic: icd('ic_coin') }, house: { at: 'house', name: 'HOUSE', ic: NAV_IC.mouse }, lab: { at: 'lab', name: 'LAB', ic: icd('ic_base_cheddar') } };
  for (const [id, g] of Object.entries(SIGNS)) {
    const w = document.createElement('div'); w.className = 'bs-sign'; w.hidden = true;
    w.innerHTML = '<button class="p0-plate build"><i class="bs-up"></i><img class="pix" src="' + g.ic + '" alt="">' + g.name + '<b class="bd">BUILD</b></button><i class="bs-down"></i>';
    w.firstChild.addEventListener('click', () => goBuild(id));
    $('plates').appendChild(w); g.el = w;
  }
  function goBuild(id) { if (id === 'sell') focusSt('sell'); else { scene.showSurface(); if (id === 'house') openMice(); else openLab(); } if (!SIGNS[id].el.hidden) pulse(SIGNS[id].el.firstChild, 'bump', 320); }
  function placeSigns() {
    if (Object.keys(SIGNS).every((id) => SIGNS[id].el.hidden && scene.stationState(id) !== 'build')) return; // sin obras pendientes no se mide nada en cada fotograma
    const sb = $('scene-box').getBoundingClientRect(), cr = $('cv').getBoundingClientRect(), ox = cr.left - sb.left, oy = cr.top - sb.top, W = sb.width, top = topInset(), used = [];
    for (const [id, g] of Object.entries(SIGNS)) {
      const on = scene.stationState(id) === 'build'; if (g.el.hidden === on) g.el.hidden = !on;
      if (!on) continue;
      const r = scene.buildingRect(g.at), [ax, ay] = scene.toScreen(r[0] + r[2] / 2, r[1]), by = oy + scene.toScreen(r[0], r[1] + r[3])[1], w = g.el.offsetWidth, up = by < top + 28;
      const x = up ? W - w - 6 : Math.max(6, Math.min(W - w - 6, Math.round(ox + ax - w / 2))); let y = up ? top : Math.max(top, Math.round(oy + ay) - 36);
      while (used.some((u) => x < u[0] + u[2] && u[0] < x + w && y < u[1] + 28 && u[1] < y + 28)) y += 28;
      used.push([x, y, w]); g.el.style.left = x + 'px'; g.el.style.top = y + 'px'; g.el.classList.toggle('up', up);
    }
  }
  let plateSig = ''; const ghostAt = {};
  function topInset() { const sb = $('scene-box').getBoundingClientRect(), gl = $('goal'); return Math.max($('hud-coinsbox').getBoundingClientRect().bottom - sb.top + 6, gl.hidden ? 0 : gl.getBoundingClientRect().bottom - sb.top + 4); }
  function placePlates() {
    const top = topInset(), H = $('scene-box').clientHeight;
    const sb = $('scene-box').getBoundingClientRect(), cr = $('cv').getBoundingClientRect(), ox = cr.left - sb.left, oy = cr.top - sb.top;
    const now = performance.now();
    const covers = (id, x, y, w) => { for (const n of scene.nodes()) { if (n.st !== id || !n.crew || n.px == null) continue; const [ax, ay] = scene.toScreen(n.px + 3, n.py - 20), [bx, by] = scene.toScreen(n.px + 19, n.py + 1); if (!(ox + bx < x || ox + ax > x + w || oy + by < y || oy + ay > y + 24)) return true; } return false; };
    const list = scene.plates().map((p) => {
      const pin = p.y < top && p.bottom >= top, y = pin ? top : p.y, w = plates[p.id].offsetWidth, x = p.x;
      if (pin && covers(p.id, x, y, w)) ghostAt[p.id] = now;
      const ghost = pin && now - (ghostAt[p.id] || -1e9) < 700;
      return { ...p, x, y, pin, ghost, hide: p.bottom < top || p.y > H - 10 };
    });
    const sig = list.map((p) => p.id + Math.round(p.x) + ':' + Math.round(p.y) + p.hide + p.pin + p.ghost).join('|');
    if (sig === plateSig) return; plateSig = sig;
    for (const p of list) { const b = plates[p.id]; b.style.left = Math.round(p.x) + 'px'; b.style.top = Math.round(p.y) + 'px'; b.style.visibility = p.hide ? 'hidden' : ''; b.classList.toggle('ghost', p.ghost); }
  }
  function select(st) {
    const changed = st !== selected;
    selected = st; scene.select(st);
    for (const [k, b] of Object.entries(plates)) b.classList.toggle('on', k === st);
    if (changed && plates[st]) pulse(plates[st], 'bump', 320);
    if (changed) pulse($('panel'), 'swap', 260);
    paintPanel(true); if (isOpen($('crew-pop'))) paintCrew(true);
  }
  function focusSt(st) { select(st); scene.focusStation(st); }
  const workOf = (n) => (n.st === 'lift' ? 'sell' : n.st);
  function pickMouseId(id) { const n = scene.nodes().find((q) => q.m && q.m.id === id); if (!n) return; const w = workOf(n); if (WORK.includes(w) && w !== selected) select(w); scene.pickMouse(id, topInset()); }

  // ---- Panel de la estación ----
  let panelSig = '';
  const ri = (k) => '<img class="pix ri" src="' + icd(k === 'coin' ? 'ic_coin' : 'ic_' + k + '_' + tierNow()) + '" alt="' + k + '">';
  const BNAME = { drill: 'Cheese Drill', refine: 'Refinery', cheese: 'Cheesery', sell: 'Cheese Shop' };
  const hasBoss = (st) => G.s.placed.some((p) => p.st === st && p.fn === 'pr');
  const buildReq = (st) => Pg.status(G, 'build.' + st).requires[0];
  function paintPanel(force) {
    const st = selected, s = G.s, t = tierNow(), T = t.charAt(0).toUpperCase() + t.slice(1), v = s.vein, job = s.job[st], boss = hasBoss(st);
    let status = '', flow = '', tone = '', act = VERB[st], acts = boss ? 'Tap · faster' : 'Tap to work', dig = false, off = false, bar = job ? 1 - Math.max(0, job.end - s.t) / job.total : 0;
    if (st === 'mine') {
      if (v.open) { status = !s.built.drill ? 'Vein found!' : s.job.drill ? 'Vein open · drilling' : 'Vein open · waiting for DRILL'; flow = s.built.drill ? Math.round((100 * v.left) / Math.max(1, v.cap)) + '% of the vein left' : 'Next: build the DRILL'; act = 'VEIN'; acts = s.job.drill ? 'Drill working' : 'Drill it'; off = true; tone = 'good'; bar = v.left / Math.max(1, v.cap); }
      else { status = boss ? 'Searching for a vein' : 'Dig to find a vein'; flow = 'Depth ' + s.depth + ' · ' + T; act = 'DIG'; acts = 'Tap · ' + fmt(v.found) + '/' + fmt(v.need); dig = true; bar = v.found / Math.max(1e-9, v.need); }
    }
    if (st === 'drill') { status = job ? 'Extracting RAW' : v.open ? 'Tap to extract RAW' : 'Waiting for a vein'; tone = job ? 'good' : 'stop'; flow = ri('raw') + fmt(s.inv.raw) + ' · +' + fmt(rate('raw')) + '/min'; off = !v.open; if (off) acts = 'No vein yet'; }
    if (st === 'refine') { status = job ? 'Refining RAW' : s.inv.raw >= REAL.refinery.rawPerBase ? 'Tap to refine' : 'Waiting for RAW'; tone = job ? 'good' : 'stop'; flow = ri('raw') + fmt(s.inv.raw) + ' → ' + ri('base') + fmt(s.inv.base); }
    if (st === 'cheese') { status = job ? 'Making wheels' : s.inv.base >= REAL.cheesery.lotBase ? 'Tap to make cheese' : 'Waiting for BASE'; tone = job ? 'good' : 'stop'; flow = ri('base') + fmt(s.inv.base) + ' → ' + ri('lot') + fmt(Mo.lotsTotal(s)); }
    if (st === 'sell') { const lots = Mo.lotsTotal(s); status = job ? 'Selling cheese' : lots > 0 ? 'Tap to sell' : 'No cheese to sell'; tone = job ? 'good' : 'stop'; flow = ri('lot') + fmt(lots) + ' → ' + ri('coin') + '+' + fmt(rate('coins')) + '/min'; }
    const ss = scene.stationState(st);
    if (ss !== 'on') { const q = buildReq(st); tone = ss === 'build' ? 'good' : 'stop'; status = ss === 'build' ? 'Ready to build' : 'Not built yet'; flow = ss === 'build' ? (st === 'sell' ? 'Sells your cheese · free' : BNAME[st] + ' · free') : q.text + ' (' + fmt(q.cur) + '/' + fmt(q.need) + ')'; act = 'BUILD'; acts = ss === 'build' ? 'Tap to build' : 'Locked'; off = ss !== 'build'; dig = false; bar = q.cur / q.need; }
    $('pn-bar').style.width = Math.round(Math.max(0, Math.min(1, bar)) * 100) + '%';
    const posts = Core.postsOf(G, st), staffed = posts.filter((p) => p.mouse).length;
    $('pn-act').classList.toggle('manual', !boss && !off);
    const bo = ss === 'on' ? G.boosts.place[st] || 0 : 0;
    const sig = [st, status, flow, act, acts, dig, off, staffed, posts.length, bo, G.stLv[st]].join('|');
    if (!force && sig === panelSig) return; panelSig = sig;
    { const u = icd(ICON[st]); if ($('pn-ic').getAttribute('src') !== u) $('pn-ic').src = u; } $('pn-name').textContent = NAME[st]; $('pn-lv').textContent = 'LV ' + G.stLv[st];
    $('pn-st').dataset.bo = bo; $('pn-bot').textContent = bo ? BO_LABEL[st][bo] : '';
    const sp = ST_SHEET[st]; $('pn-st').classList.toggle('na', !sp); $('pn-st').setAttribute('aria-label', sp ? NAME[st] + ' panel' : NAME[st]); $('pn-st').tabIndex = sp ? 0 : -1;
    $('pn-status').textContent = status; $('pn-status').className = 'pn-status ' + tone; $('pn-flow').innerHTML = flow;
    $('pn-crewn').textContent = staffed + '/' + posts.length;
    $('pn-actb').textContent = act; $('pn-acts').textContent = acts;
    $('pn-act').classList.toggle('dig', dig); $('pn-act').classList.toggle('off', off);
  }
  // La acción: picar (MINE) o trabajar a mano y acelerar (las demás), siempre tocando. El toque es real: lo hace el núcleo.
  function tapMine() {
    if (G.s.vein.open) return toast('The vein is open: the drill extracts it');
    Core.act(G, 'tap', { st: 'mine' }); scene.onEvent('tap'); syncSim();
  }
  const act = $('pn-act');
  act.addEventListener('pointerdown', () => {
    pulse(act, 'hit', 180);
    if (scene.focusedStation !== selected) focusSt(selected);
    if (selected === 'mine') return tapMine();
    const ss = scene.stationState(selected);
    if (ss === 'build') { doAct('build', { id: selected }, BNAME[selected] + ' built!'); return; }
    if (ss === 'locked') { const q = buildReq(selected); return toast(q.text + ' first'); }
    const r = Core.act(G, 'tap', { st: selected });
    if (!r.ok) return toast(selected === 'drill' ? 'No vein yet: dig in MINE' : selected === 'refine' ? 'No RAW yet' : selected === 'cheese' ? (G.s.inv.base >= REAL.cheesery.lotBase ? 'Not enough coins for this recipe' : 'No BASE yet') : 'No cheese to sell yet');
    const now = performance.now(); rush.until[selected] = Math.min(now + RUSH_MAX, Math.max(now, rush.until[selected] || 0) + RUSH_TAP); scene.rushTap(selected);
  });
  let rushQ = -1;
  function rushTick(now) {
    sim.boost = {}; for (const st of RUSH_ST) if (now < (rush.until[st] || 0) && G.s.job[st]) sim.boost[st] = true;
    const q = RUSH_ST.includes(selected) ? Math.max(0, Math.min(1, ((rush.until[selected] || 0) - now) / RUSH_MAX)) : 0;
    if (Math.abs(q - rushQ) > 0.015 || (q === 0) !== (rushQ === 0)) { rushQ = q; act.style.setProperty('--q', q.toFixed(3)); }
    act.classList.toggle('rush', !!sim.boost[selected]); $('pn-bar').parentElement.classList.toggle('rush', !!sim.boost[selected]);
    for (const [k, b] of Object.entries(plates)) { const ss = k === 'mine' ? 'on' : scene.stationState(k), bo = ss === 'on' ? G.boosts.place[k] || 0 : 0; b.classList.toggle('rush', !!sim.boost[k]); b.classList.toggle('build', ss === 'build'); b.classList.toggle('locked', ss === 'locked'); if (b.dataset.bo !== String(bo)) b.dataset.bo = bo; }
  }
  const ST_SHEET = { cheese: () => openCheese(), sell: () => openShop() };
  $('pn-st').addEventListener('click', () => { const sp = ST_SHEET[selected]; if (sp) sp(); });

  // ---- Equipo de la estación: los puestos de verdad; un puesto vacío se ve vacío ----
  const pop = $('crew-pop');
  let popSig = '';
  const PORTRAIT = {};
  const portrait = (m, st) => { const k = m.id + ':' + st + ':' + (m.rank || 0); return PORTRAIT[k] || (PORTRAIT[k] = scene.portrait(m, st)); };
  const byId = (id) => G.roster.find((m) => m.id === id);
  const tone = (s) => (/Waiting|Idle/.test(s) ? 'wait' : /Working|Carrying|Passing|Digging|On shift/.test(s) ? 'busy' : '');
  function paintCrew(force) {
    const posts = Core.postsOf(G, selected), selId = scene.selectedMouse, here = scene.stationState(selected) === 'on';
    const sel = posts.find((p) => p.mouse && p.mouse === selId), node = sel && scene.nodes().find((q) => q.m && q.m.id === selId), m = sel && byId(selId);
    const line = sel && m ? '<b>' + m.name + '</b> · ' + RANKS[Math.min(3, m.rank || 0)] + ' ' + (ROLE[sel.role] || sel.role) + (node ? ' · <span class="' + tone(scene.stateOf(node)) + '">' + scene.stateOf(node) + '</span>' : '') : here ? 'Tap a worker, or an empty post to fill it.' : 'Build this station first.';
    const sig = selected + '|' + selId + '|' + scene.following + '|' + posts.map((p) => p.role + p.mouse).join(',') + here;
    if (force || sig !== popSig) {
      popSig = sig;
      const rows = !here ? '<p>Nobody works here.</p>' : posts.map((p) => { const w = p.mouse && byId(p.mouse); return w ? '<button class="crew-row' + (w.id === selId ? ' on' : '') + '" data-mouse="' + w.id + '" aria-label="' + w.name + ', ' + (ROLE[p.role] || p.role) + '"><img class="pix" src="' + portrait(w, selected) + '" alt=""><b>' + w.name + '</b></button>' : '<button class="crew-row empty" data-post="' + p.role + '" aria-label="Empty post: ' + (ROLE[p.role] || p.role) + '"><i>+</i><b>' + (ROLE[p.role] || p.role) + '</b></button>'; }).join('');
      pop.innerHTML = '<h5>' + NAME[selected] + ' CREW <small>' + posts.filter((p) => p.mouse).length + '/' + posts.length + ' WORKERS</small></h5><div class="crew-strip" style="--n:' + Math.max(4, posts.length) + '">' + rows + '</div><div class="crew-sel" id="crew-sel"></div>';
    }
    $('crew-sel').innerHTML = '<span>' + line + '</span>' + (sel ? '<button class="crew-card bx" data-follow aria-pressed="' + scene.following + '">' + (scene.following ? 'STOP' : 'FOLLOW') + '</button><button class="crew-card bx" data-card>CARD</button>' : '');
    if (force && sel) { const b = pop.querySelector('.crew-row.on'); if (b) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  function openCrew(open) {
    if (open) showEl(pop); else hideEl(pop); $('pn-crew').setAttribute('aria-expanded', String(open));
    if (open) { pop.style.bottom = ($('p0').clientHeight - $('panel').offsetTop) + 'px'; paintCrew(true); closeRes(); }
    scene.setInsetBottom(open ? pop.offsetHeight : 0);
    homePos();
  }
  $('pn-crew').addEventListener('click', () => openCrew(!isOpen(pop)));
  pop.addEventListener('click', (e) => {
    const id = scene.selectedMouse;
    if (e.target.closest('[data-card]')) { if (id) openMouse(id); return; }
    if (e.target.closest('[data-follow]')) { if (scene.following) scene.unfollow(); else if (id) scene.focusMouse(id); paintCrew(true); return; }
    const po = e.target.closest('[data-post]'); if (po) return openPost(selected, po.dataset.post);
    const b = e.target.closest('[data-mouse]'); if (!b) return; pickMouseId(b.dataset.mouse); paintCrew(true);
  });
  pop.addEventListener('transitionend', () => homePos());

  // ---- Recursos ----
  const res = $('res-pop');
  function paintRes() {
    const t = tierNow(), s = G.s, row = (icon, name, sub, val, r) => '<button class="res-row" data-res="' + name + '"><img class="pix" src="' + icd(icon) + '" alt=""><span><b>' + name + '</b><small>' + sub + '</small></span><em><b>' + val + '</b><small>' + r + '</small></em><i class="rr-go" aria-hidden="true">›</i></button>';
    res.innerHTML = '<h5>RESOURCES <small>LAST MINUTE</small></h5>' +
      row('ic_coin', 'COINS', 'From the shop', fmt(s.coins), '+' + fmt(rate('coins')) + '/min') +
      row('ic_lot_' + t, 'CHEESE', 'Wheels waiting to sell', fmt(Mo.lotsTotal(s)), '+' + fmt(rate('cheese')) + '/min') +
      row('ic_base_' + t, 'CHEESE BASE', 'Ready for the cheesery', fmt(s.inv.base), '+' + fmt(rate('base')) + '/min') +
      row('ic_raw_' + t, 'RAW CHEESE', 'Ready for the refinery', fmt(s.inv.raw), '+' + fmt(rate('raw')) + '/min');
  }
  function closeRes() { hideEl(res); $('hud-coinsbox').setAttribute('aria-expanded', 'false'); }
  res.addEventListener('click', (e) => { const b = e.target.closest('[data-res]'); if (b) openPantry(); });
  $('hud-coinsbox').addEventListener('click', () => { const open = !isOpen(res); $('hud-coinsbox').setAttribute('aria-expanded', String(open)); if (open) { paintRes(); showEl(res); if (isOpen(pop)) openCrew(false); } else closeRes(); });

  // ---- Hojas: el armazón de P1. Vistas básicas de este hito: las Pulido+ completas llegan en el Hito 3. ----
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rise(body, delay) { if (RM() || !body.animate) return; [...body.children].slice(0, 8).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: delay + i * 28, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' })); }
  let sheetFn = null, sheetHtml = '';
  function sheet(title, fn) {
    const was = isOpen($('sheet')); sheetFn = fn; $('sheet-title').textContent = title; sheetHtml = fn(); $('sheet-body').innerHTML = sheetHtml; $('sheet-body').scrollTop = 0; showEl($('sheet')); rise($('sheet-body'), was ? 0 : 110); closeRes(); if (isOpen(pop)) openCrew(false);
  }
  function refreshSheet() { if (!sheetFn || !isOpen($('sheet'))) return; const h = sheetFn(); if (h !== sheetHtml) { sheetHtml = h; const b = $('sheet-body'), y = b.scrollTop; b.innerHTML = h; b.scrollTop = y; } }
  const closeSheet = () => { hideEl($('sheet'), 220); sheetFn = null; flushBoost(); };
  $('sheet-close').addEventListener('click', closeSheet);
  $('sheet').addEventListener('click', (e) => { if (e.target === $('sheet')) closeSheet(); });
  const REASON = { 'no-coins': 'Not enough coins', locked: 'Not available yet', 'no-materials': 'Not enough materials', 'queue-full': 'The lab queue is full', 'bed-busy': 'The bed is taken', 'no-house': 'Build the Mouse House first', 'not-built': 'Build it first', full: 'Two boosts at most', 'none-free': 'No free boosts' };
  function doAct(type, args, okMsg) {
    const r = Core.act(G, type, args);
    if (!r.ok) { toast(REASON[r.reason] || 'Not possible right now'); return r; }
    if (okMsg) toast(okMsg);
    syncSim(); syncCrew(); processEvents(); paintPanel(true); saveNow(); refreshSheet();
    return r;
  }
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const btn = (label, type, args, opt) => { const o = opt || {}; return '<button class="bx bt-act' + (o.warn ? ' warn' : '') + '" data-do="' + type + '" data-arg=\'' + JSON.stringify(args || {}).replace(/'/g, '') + '\'' + (o.disabled ? ' disabled' : '') + '>' + label + (o.cost != null ? '<small>' + fmt(o.cost) + '</small>' : '') + '</button>'; };
  const row = (icon, title, sub, right, cls) => '<div class="p0-row bx ' + (cls || '') + '">' + (icon ? '<img class="pix" src="' + icon + '" alt="">' : '<i></i>') + '<span><b>' + title + '</b><small>' + sub + '</small></span><em>' + (right || '') + '</em></div>';
  const buy = (type, args, cost, label) => btn(label || 'BUY', type, args, { cost, disabled: G.s.coins < cost });
  const pretty = (id) => id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  const BASIC = '<div class="p1-band"><b>BASIC VIEW</b>The full panel arrives in a later update.</div>';
  $('sheet-body').addEventListener('click', (e) => {
    const b = e.target.closest('[data-do]');
    if (b && !b.disabled) { const t = b.dataset.do, a = JSON.parse(b.dataset.arg || '{}'); if (LOCAL[t]) LOCAL[t](a); else doAct(t, a); return; }
    const ba = e.target.closest('[data-boadd]'); if (ba && !ba.disabled) setBoost((G.boosts.place[ba.dataset.bost] || 0) + +ba.dataset.boadd, ba.dataset.bost);
  });

  // UPGRADES
  const realNode = (st, id) => (REAL.trees[SKILL[st]] || []).find((n) => n.id === id) || {};
  const PATH_TXT = { prospector: 'Taps hit twice as hard; the crew lands critical hits', blasting: 'Three critical taps set off a blast of crew search', surveyCrew: 'Mine 30% faster', shiftRota: 'Scaffolders count for more', surveyAhead: 'Search for the next vein while drilling', wideSeams: 'Veins hold 40% more; deeper levels are richer', richSeams: 'Each vein gives one more material', quickSeams: 'Smaller veins, found much faster', pureBase: '20% more BASE, refining 20% slower', gaugeDiscipline: 'Yield posts count for more', fastStill: 'Refine 30% faster and cook 20% faster', affinage: 'Cheese worth 40% more, taking 50% longer', freshMarket: 'Cook 40% faster, cheese worth 5% less', boutique: 'Sell fewer, Fine cheese pays 40% more', collectorsList: 'Better buyers sooner', wholesale: 'Sell 80% more at 10% less', bulkContracts: 'Better wholesale prices', coreSampler: 'Twice the materials', strataLogs: 'Blueprints need 30% less material', throughput: '25% more RAW', heavyBits: 'Yield posts count for more' };
  function upgradesHtml() {
    const opts = Core.options(G), order = [selected].concat(WORK.filter((x) => x !== selected));
    let h = BASIC;
    for (const st of order) {
      if (st !== 'mine' && !G.s.built[st]) continue;
      h += '<h4 class="bt-h">' + NAME[st] + ' · LV ' + G.stLv[st] + '</h4><div class="bt-rows">';
      for (const o of opts) {
        if (o.st !== st) continue;
        if (o.kind === 'fund') { const n = realNode(st, o.f.id); h += row(icd(ICON[st]), (n.name || pretty(o.f.id)) + ' · ' + (G.fund[st][o.f.id] || 0), n.desc || '', buy('fund', { st, id: o.f.id }, o.cost)); }
        if (o.kind === 'phase') h += row(icd(ICON[st]), NAME[st] + ' stage ' + o.next, 'New posts and machinery', buy('phase', { st }, o.cost));
        if (o.kind === 'path') h += row(icd(ICON[st]), pretty(o.node.id), (G.active[o.fk] ? '' : 'Choose one path · ') + (PATH_TXT[o.node.id] || ''), buy('path', { fk: o.fk, opt: o.opt }, o.cost));
      }
      const nx = G.phase[st] + 1, id = 'phase' + nx + '.' + st;
      if (Pg.has(id) && !Pg.isOpen(G, id)) { const q = Pg.status(G, id).requires.filter((r) => !r.ok); h += row(icd(ICON[st]), NAME[st] + ' stage ' + nx, 'Needs: ' + q.map((r) => r.text).join(' · '), '', 'bt-lock'); }
      h += '</div>';
    }
    const extra = opts.filter((o) => o.kind === 'milestone' || o.kind === 'lamp');
    if (extra.length) { h += '<h4 class="bt-h">COLONY</h4><div class="bt-rows">'; for (const o of extra) h += o.kind === 'lamp' ? row(icd('ic_coin'), 'Night Lamp · ' + G.lamp, 'Mice keep working 2 more hours while you are away', buy('lamp', {}, o.cost)) : row(icd('ic_lot_cheddar'), pretty(o.id === 'wheel' ? 'grandWheel' : 'grandMaster'), (REAL.milestones[o.id] && REAL.milestones[o.id].desc) || '', buy('milestone', { id: o.id }, o.cost)); h += '</div>'; }
    return h;
  }
  function openUpgrades() { freshUp = false; sheet('UPGRADES', upgradesHtml); }

  // MICE
  const levelOf = (m) => Cr.level(m);
  const whereTxt = (m) => { const w = Core.whereIs(G, m.id); return !w ? '' : w.scene === 'main' ? NAME[w.st] + ' · ' + (ROLE[w.role] || w.role) : w.scene === 'lab' ? 'LAB · Researcher' : 'No job yet'; };
  const stFor = (m) => { const w = Core.whereIs(G, m.id); return w && w.scene === 'main' ? w.st : 'mine'; };
  function miceHtml() {
    let h = BASIC;
    if (!G.built.house) {
      const open = Pg.isOpen(G, 'build.house');
      return h + row(NAV_IC.mouse, 'Mouse House', open ? 'Recruit mice to automate your stations' : REAL.buildings.house.requires.text, open ? btn('BUILD', 'build', { id: 'house' }) : '', open ? '' : 'bt-lock');
    }
    const cost = Ru.recruitCost(G);
    h += row(NAV_IC.mouse, G.cands.length ? 'Three candidates are waiting' : 'Recruit a mouse', G.cands.length ? 'Already paid: choose one' : 'You choose one of three', G.cands.length ? btn('SEE', 'showCands', {}) : buy('hire', {}, cost, 'HIRE'));
    if (!G.roster.length) return h;
    const list = G.roster.slice().sort((a, b) => (Core.whereIs(G, a.id).scene === 'house' ? 0 : 1) - (Core.whereIs(G, b.id).scene === 'house' ? 0 : 1));
    h += '<h4 class="bt-h">YOUR MICE · ' + list.length + '</h4><div class="bt-rows">';
    for (const m of list) h += row(portrait(m, stFor(m)), esc(m.name) + ' · LV ' + levelOf(m), RANKS[Math.min(3, m.rank || 0)] + ' · ' + whereTxt(m), btn('CARD', 'showMouse', { id: m.id }));
    return h + '</div>';
  }
  function openMice() { sheet('MICE', miceHtml); }
  let hireFor = null;
  function hire(forPost) {
    hireFor = forPost || null;
    const r = doAct('recruitOffer', forPost ? { forPost } : {});
    if (r.ok) sheet('RECRUIT', candsHtml);
  }
  const traitName = (id) => (REAL.mice.traits[id] ? REAL.mice.traits[id].name : id);
  function candsHtml() {
    if (!G.cands.length) return '<p>No candidates.</p>';
    let h = BASIC + '<p>' + (hireFor ? 'For the post of ' + (ROLE[hireFor.role] || hireFor.role) + '.' : 'They will arrive without a job: you choose where they work.') + '</p><div class="bt-rows">';
    G.cands.forEach((k, i) => { const aff = Object.keys(k.aff || {}).map((a) => a + (k.aff[a] > 1 ? ' ★★' : ' ★')).join(', '), rar = ['', 'Rare · ', 'Legendary · '][k.rarity || 0]; h += row(portrait(k, 'mine'), esc(k.name), rar + k.traits.map(traitName).join(', ') + (aff ? ' · ' + aff : ''), btn('PICK', 'pick', { index: i })); });
    return h + '</div>';
  }
  function openPost(st, role) { sheet(NAME[st] + ' · ' + (ROLE[role] || role).toUpperCase(), () => postHtml(st, role)); }
  function postHtml(st, role) {
    const free = Core.unassigned(G);
    let h = BASIC;
    if (!G.built.house) return h + row(NAV_IC.mouse, 'No Mouse House yet', 'Build it from MICE to recruit', btn('MICE', 'showMice', {}));
    h += '<div class="bt-rows">';
    for (const m of free) h += row(portrait(m, st), esc(m.name) + ' · LV ' + levelOf(m), 'No job yet', btn('ASSIGN', 'assignHere', { id: m.id, st, role }));
    h += row(NAV_IC.mouse, G.cands.length ? 'Three candidates are waiting' : 'Recruit for this post', G.cands.length ? 'Already paid: choose one' : 'You choose one of three', G.cands.length ? btn('SEE', 'hirePost', { st, role }) : buy('hirePost', { st, role }, Ru.recruitCost(G), 'HIRE'));
    return h + '</div>';
  }
  let dismissArm = null;
  function openMouse(id) { dismissArm = null; const m = byId(id); if (m) sheet(m.name.toUpperCase(), () => mouseHtml(id)); }
  function mouseHtml(id) {
    const m = byId(id); if (!m) return '<p>This mouse has left the colony.</p>';
    const w = Core.whereIs(G, id), pr = Ru.promoteOptions(G).find((o) => o.m.id === id), next = REAL.mice.ranks[(m.rank || 0) + 1];
    const all = Cr.traitsOf(m).map((t) => traitName(t.id));
    let h = BASIC + '<div class="bt-rows">' + row(portrait(m, stFor(m)), esc(m.name) + ' · LV ' + levelOf(m), ['', 'Rare · ', 'Legendary · '][m.rarity || 0] + RANKS[Math.min(3, m.rank || 0)] + ' · ' + whereTxt(m), '');
    h += row('', 'Traits', all.length ? all.join(', ') : 'None yet', '');
    h += next ? row('', 'Promote to ' + next.name, pr ? 'Works better' : 'Needs level ' + next.level, pr ? buy('promote', { id }, pr.cost) : '', pr ? '' : 'bt-lock') : '';
    h += w.scene === 'house' ? row('', 'No job yet', 'Pick an empty post', btn('POSTS', 'postsFor', { id })) : row('', 'Take off this post', 'Production there changes right away', btn('REMOVE', 'unassign', { id }));
    h += row('', 'Dismiss', dismissArm === id ? 'For good, with no refund. Sure?' : 'Leaves the colony for good', dismissArm === id ? btn('YES, DISMISS', 'dismissGo', { id }, { warn: true }) : btn('DISMISS', 'dismissArm', { id }, { warn: true }));
    return h + '</div>';
  }
  function postsForHtml(id) {
    const m = byId(id); if (!m) return '';
    let h = BASIC + '<div class="bt-rows">';
    const empty = Core.emptyPosts(G);
    for (const p of empty) h += row(icd(ICON[p.st]), NAME[p.st] + ' · ' + (ROLE[p.role] || p.role), p.fn === 'pr' ? 'Runs the station by itself' : p.fn === 'ritmo' ? 'Makes the station faster' : 'Makes the station yield more', btn('ASSIGN', 'assignHere', { id, st: p.st, role: p.role }));
    if (G.lab.nodes.assistant && !G.lab.workers.length) h += row(icd('ic_base_cheddar'), 'LAB · Researcher', 'Researches recipes by itself', btn('ASSIGN', 'assignHere', { id, st: 'lab' }));
    if (!empty.length) h += row('', 'No empty posts', 'Upgrade a station to its next stage for more', '');
    return h + '</div>';
  }
  // Acciones de navegación de las hojas.
  const LOCAL = {
    // Construir desde la hoja: se cierra y la cámara va al edificio, para ver cómo se levanta.
    build: (a) => { const r = doAct('build', a, (a.id === 'house' ? 'Mouse House' : 'Cheese Lab') + ' built!'); if (r.ok) { closeSheet(); scene.showSurface(); } },
    hire: () => hire(null),
    hirePost: (a) => hire({ st: a.st, role: a.role }),
    showCands: () => sheet('RECRUIT', candsHtml),
    showMice: () => openMice(),
    showMouse: (a) => openMouse(a.id),
    pick: (a) => { const want = hireFor; const r = doAct('recruitChoose', { index: a.index }); hireFor = null; if (!r.ok) return; toast(byId(r.id).name + (want ? ' got the job!' : ' joined the colony')); if (want) { closeSheet(); focusSt(want.st); } else openMouse(r.id); },
    assignHere: (a) => { const r = doAct('assign', a); if (r.ok) { const m = byId(a.id); closeSheet(); toast(m.name + (a.st === 'lab' ? ' now works in the lab' : ' now works at ' + NAME[a.st])); if (a.st !== 'lab') focusSt(a.st); } },
    postsFor: (a) => sheet('CHOOSE A POST', () => postsForHtml(a.id)),
    dismissArm: (a) => { dismissArm = a.id; refreshSheet(); },
    dismissGo: (a) => { const r = doAct('dismiss', a); if (r.ok) { dismissArm = null; openMice(); } },
    newArm: () => { newArmed = true; refreshSheet(); },
    newGo: () => { paused = true; try { if (store) Sv.erase(store); } catch (e) {} location.reload(); },
    sky: (a) => { scene.setSky(a.v === 'auto' ? { mode: 'auto' } : { mode: 'fixed', hour: +a.v }); refreshSheet(); },
    showLab: () => openLab(),
  };

  // BOOSTS: el panel real sobre los refuerzos que hay.
  const BO_TXT = { drill: 'speed', refine: 'BASE per batch', cheese: 'speed', mine: 'speed', sell: 'selling speed' };
  function boostsHtml() {
    const free = G.boosts.earned - Ru.placedBoosts(G);
    const r = (st) => { const n = G.boosts.place[st] || 0, off = st !== 'mine' && !G.s.built[st]; return '<div class="p0-row bx bo-row"><img class="pix" src="' + ic(ICON[st]) + '" alt=""><span><b>' + NAME[st] + '</b><small>' + (off ? 'Not built yet' : n ? BO_LABEL[st][n] + ' ' + BO_TXT[st] : 'No boost') + '</small></span><em class="bo-ctl"><button class="bx" data-boadd="-1" data-bost="' + st + '"' + (n ? '' : ' disabled') + ' aria-label="Remove a boost">−</button><i class="bo-chip" data-bo="' + n + '"><i></i><i></i></i><button class="bx" data-boadd="1" data-bost="' + st + '"' + (n < 2 && free > 0 && !off ? '' : ' disabled') + ' aria-label="Add a boost">+</button></em></div>'; };
    return '<p>A boost improves one station for good (×1.5 each, two at most), whoever works there. REFINE gets more BASE from the same RAW instead of speed. Moving one is free.</p><h4>FREE BOOSTS · ' + free + ' OF ' + G.boosts.earned + '</h4>' + WORK.map(r).join('');
  }
  function openBoosts() { sheet('BOOSTS', boostsHtml); }
  let boostPend = null;
  function setBoost(n, st) {
    n = Math.max(0, Math.min(2, n)); const was = G.boosts.place[st] || 0; if (n === was) return;
    const r = Core.act(G, n > was ? 'boostPlace' : 'boostRemove', { st });
    if (!r.ok) return toast(REASON[r.reason] || 'Not possible right now');
    syncSim(); saveNow(); refreshSheet(); paintPanel(true);
    if (n > was) { if (plates[st]) pulse(plates[st].querySelector('.bo-chip'), 'stamp', 420); if (st === selected) pulse($('pn-st').querySelector('.bo-chip'), 'stamp', 420); }
    if (isOpen($('sheet')) && !scene.stationInView(st, topInset(), sheetCover())) boostPend = { n, st, at: performance.now() }; else showBoost(n, st);
  }
  function sheetCover() { if (!isOpen($('sheet'))) return isOpen(pop) ? pop.offsetHeight : 0; const sb = $('scene-box').getBoundingClientRect(), bx = document.querySelector('.p0-sheetbox').getBoundingClientRect(); return Math.max(0, sb.bottom - bx.top); }
  function showBoost(n, st) { boostPend = null; scene.boostTo(st, n, scene.stationInView(st, topInset(), sheetCover())); }
  function flushBoost() { if (!boostPend) return; const b = boostPend; if (performance.now() - b.at < 10000) showBoost(b.n, b.st); else { scene.boostTo(b.st, b.n, false); boostPend = null; } }
  function boostLabel(st, n, x, y) {
    const el = document.createElement('div'); el.className = 'bo-float'; el.textContent = BO_LABEL[st][n] + (st === 'refine' ? ' BASE' : ' SPEED');
    $('scene-box').appendChild(el); const w = el.offsetWidth; el.style.left = Math.round(Math.max(6, Math.min($('scene-box').clientWidth - w - 6, x - w / 2))) + 'px'; el.style.top = Math.round(Math.max(topInset(), y - 14)) + 'px';
    setTimeout(() => el.remove(), 1300);
  }

  // CHEESE, SHOP, LAB, PANTRY, COINS, DEPTH y MENU: lo justo para jugar y entender.
  const recipeName = (key) => { const [b, i, t, m] = key.split('+'), B = REAL; return B.ingredients[i].name + ' ' + B.treatments[t].name + ' ' + B.maturations[m].name + ' ' + B.bases[b].name; };
  // El nivel de CHEESE que abre la siguiente receta: para decir qué falta en vez de un «no hay nada».
  const nextRecipeLevel = () => { let best = Infinity; for (const st of Object.keys(G.lab.styles)) for (const k of Lb.combosOf(st)) { if (G.lab.isKnown[k]) continue; const [, i, t, m] = k.split('+'); best = Math.min(best, Math.max(REAL.ingredients[i].level, REAL.treatments[t].level, REAL.maturations[m].level)); } return best; };
  function researchRow() {
    const L = G.lab, job = L.job, cost = Lb.labCost(G), next = Lb.pick(G, 'value');
    if (job) return row(icd('ic_base_cheddar'), 'Researching…', Math.round(100 * (1 - job.remaining / job.total)) + '% · ' + (job.kind === 'recipe' ? 'a new recipe' : job.kind === 'study' ? 'a new cheese' : job.kind === 'strain' ? 'a strain' : 'a blueprint'), '');
    if (L.queue.length) return row(icd('ic_base_cheddar'), 'Research waiting', 'Needs ' + cost + ' Cheese Base', '');
    if (!next) { const lv = nextRecipeLevel(); return row(icd('ic_base_cheddar'), 'No recipes to research yet', lv > G.stLv.cheese && lv < Infinity ? 'Reach CHEESE level ' + lv + ' (now ' + G.stLv.cheese + ')' : 'Study a new cheese to find more', '', 'bt-lock'); }
    return row(icd('ic_base_cheddar'), 'Research a recipe', 'Uses ' + cost + ' Cheese Base', btn('RESEARCH', 'labResearch', {}));
  }
  function cheeseHtml() {
    const L = G.lab, built = G.s.built.cheese;
    if (!built) return BASIC + '<p>Build the Cheesery first.</p>';
    const f = Mo.formula(G.s.recipe);
    return BASIC + '<div class="bt-rows">' + row(icd('ic_lot_' + f.combo.base), 'Cooking: ' + recipeName(G.s.recipe), 'Worth ' + fmt(Mo.price(G.s, G.s.recipe)) + ' each · the Cheesemaker picks the best you know', '') + row(icd('ic_base_cheddar'), L.known.length + ' recipes known', L.built ? 'Discover more in the Cheese Lab' : Pg.isOpen(G, 'build.lab') ? 'Build the Cheese Lab to discover more' : 'The Cheese Lab will discover more', L.built || Pg.isOpen(G, 'build.lab') ? btn('LAB', 'showLab', {}) : '') + '</div>';
  }
  function openCheese() { sheet('CHEESERY', cheeseHtml); }
  function openShop() { const f = () => BASIC + '<div class="bt-rows">' + (G.s.built.sell ? row(icd('ic_coin'), 'Coins earned', fmt(G.s.m.coins) + ' in total · +' + fmt(rate('coins')) + '/min', '') + row(icd('ic_lot_' + tierNow()), 'Cheese sold', fmt(G.s.m.sold + G.s.m.whole) + ' in total · ' + fmt(Mo.lotsTotal(G.s)) + ' waiting', '') : row(icd('ic_coin'), 'Cheese Shop', 'Not built yet', '', 'bt-lock')) + '</div>'; sheet('SHOP', f); }
  function labHtml() {
    const L = G.lab; let h = BASIC;
    if (!L.built) { const open = Pg.isOpen(G, 'build.lab'); return h + row(icd('ic_base_cheddar'), 'Cheese Lab', open ? 'Discover new recipes here' : 'Opens at CHEESE level 3, with a mouse at work', open ? btn('BUILD', 'build', { id: 'lab' }) : '', open ? '' : 'bt-lock'); }
    h += '<div class="bt-rows">' + researchRow();
    const w = L.workers[0] && byId(L.workers[0]);
    if (L.nodes.assistant) h += w ? row(portrait(w, 'mine'), esc(w.name) + ' · LV ' + levelOf(w), 'Your researcher · ' + L.known.length + ' recipes known', btn('CARD', 'showMouse', { id: w.id })) : row(NAV_IC.mouse, 'Research post is empty', 'Give a mouse from MICE this job', btn('MICE', 'showMice', {}));
    if (L.nodes.advanced) h += row('', 'Looking for', L.dir === 'strain' ? 'New strains' : 'The most valuable recipes', btn(L.dir === 'strain' ? 'RECIPES' : 'STRAINS', 'labDir', { dir: L.dir === 'strain' ? 'value' : 'strain' }, { disabled: !L.nodes.strains }));
    for (const st of E2.PARAMS.strata) { const id = 'study.' + st.id; if (Pg.has(id) && Pg.isOpen(G, id) && !L.styles[st.id]) { const busy = (L.job && L.job.style === st.id) || L.queue.some((q) => q.style === st.id); h += row(icd('ic_lot_' + st.id), 'Study ' + REAL.bases[st.id].name, busy ? 'In progress' : 'Uses ' + Lb.studyNeed(st.id)[st.id] + ' ' + REAL.bases[st.id].name + ' samples (you have ' + Math.floor(Inv.count(G.s, st.id)) + ')', busy ? '' : btn('STUDY', 'labStudy', { style: st.id })); } }
    for (const id of Object.keys(E2.PARAMS.s3.lab.blueprints || {})) if (Pg.has('plan.' + id) && Pg.isOpen(G, 'plan.' + id) && !L.blueprints[id]) h += row('', 'Blueprint: ' + pretty(id), 'Opens the last step of its path', btn('MAKE', 'labBlueprint', { id }));
    h += '</div>';
    const opts = Core.options(G).filter((o) => /^lab/.test(o.kind));
    if (opts.length) { h += '<h4 class="bt-h">IMPROVE THE LAB</h4><div class="bt-rows">'; for (const o of opts) { const n = (REAL.trees.lab || []).find((x) => x.id === o.id) || {}; h += o.kind === 'labphase' ? row('', 'Lab stage ' + o.next, 'A bigger lab', buy('labPhase', {}, o.cost)) : o.kind === 'labrank' ? row('', (n.name || pretty(o.id)) + ' · ' + (L.nodes[o.id] || 0), n.desc || '', buy('labRank', { id: o.id }, o.cost)) : row('', n.name || pretty(o.id), n.desc || '', buy('labNode', { id: o.id }, o.cost)); } h += '</div>'; }
    return h;
  }
  function openLab() { sheet('CHEESE LAB', labHtml); }
  function pantryHtml() {
    const t = tierNow(), l = Inv.list(G); let h = BASIC + '<div class="bt-rows">' + row(ic('ic_raw_' + t), 'RAW CHEESE', 'Ready for the refinery', '<b>' + fmt(l.raw) + '</b>') + row(ic('ic_base_' + t), 'CHEESE BASE', 'Ready for the cheesery', '<b>' + fmt(l.base) + '</b>') + row(ic('ic_lot_' + t), 'CHEESE', 'Wheels waiting to sell', '<b>' + fmt(Mo.lotsTotal(G.s)) + '</b>');
    for (const m of l.materials) { const k = Inv.card(G, m.id); h += row(ic('ic_raw_' + m.id), esc(m.name), 'Found in its veins' + (k.uses.length ? ' · used to study and make blueprints' : ''), '<b>' + fmt(m.n) + '</b>'); }
    return h + '</div>';
  }
  function openPantry() { sheet('PANTRY', pantryHtml); }
  function openDepth() { sheet('DEPTH ' + G.s.depth, () => '<p>Stratum: ' + tierNow().toUpperCase() + '. Every emptied vein takes the colony one level deeper. Each new stratum brings a richer cheese to study in the Cheese Lab.</p>'); }
  const hhmm = (h) => { h = ((h % 24) + 24) % 24; const m = Math.round((h % 1) * 60); return String(Math.floor(h) + (m === 60 ? 1 : 0)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  const SKY_OPTS = [['auto', 'AUTO'], [8, 'DAWN'], [13, 'DAY'], [18.4, 'DUSK'], [23, 'NIGHT']];
  let newArmed = false;
  function menuHtml() {
    const i = scene.skyInfo();
    let h = '<div class="bt-rows">' + row('', 'Your colony', (saveFailed ? 'Could not save on this device.' : 'Saved on this device' + (savedAt ? ', ' + Math.max(0, Math.round((Date.now() - savedAt) / 1000)) + ' s ago' : '')) + ' · away up to ' + Math.round(Core.capMs(G) / 3600000) + ' h', '');
    h += row('', 'Sky', (i.mode === 'auto' ? 'Follows your clock (' + hhmm(i.hour) + ')' : 'Fixed at ' + hhmm(i.hour)), '') + '</div><div class="bt-sky">' + SKY_OPTS.map(([v, l]) => btn(l, 'sky', { v })).join('') + '</div>';
    h += '<h4 class="bt-h">NEW COLONY</h4><div class="bt-rows">' + row('', 'Start over', newArmed ? 'This erases this colony for good. Sure?' : 'Only this beta colony. Other games are not touched', newArmed ? btn('YES, ERASE', 'newGo', {}, { warn: true }) : btn('START OVER', 'newArm', {}, { warn: true })) + row('', 'Cheese Driller Beta', 'Build ' + esc(window.BETA_BUILD || 'dev'), '') + '</div>';
    return h;
  }
  function openMenu() { newArmed = false; sheet('MENU', menuHtml); }
  document.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.nav;
    if (k === 'mice') return openMice();
    if (k === 'upgrades') return openUpgrades();
    if (k === 'boosts') return openBoosts();
    if (k === 'menu') return openMenu();
  }));
  $('hud-depthbox').addEventListener('click', openDepth);

  // ---- Toques en la escena: los de P1 ----
  // ---- Arrastrar un ratón a otro puesto (drag.js). Aquí, qué puestos hay y confirmar al soltar: la partida solo cambia en ese momento. ----
  const dragTargets = (held) => {
    const w = Core.whereIs(G, held.id), out = [];
    for (const p of scene.posts()) {
      const stCore = p.st === 'lift' ? 'sell' : p.st, role = SCENE_ROLE[p.role] || p.role;
      if (stCore !== 'mine' && !G.s.built[stCore]) continue;
      const post = Core.postsOf(G, stCore).find((q) => q.role === role); if (!post) continue;
      out.push({ key: stCore + ':' + role, st: stCore, role, x: p.x, feet: p.feet, face: p.face, label: NAME[stCore] + ' · ' + (ROLE[role] || role), source: w.st === stCore && w.role === role, occ: post.mouse && post.mouse !== held.id ? byId(post.mouse) : null });
    }
    return out;
  };
  dragger = BetaDrag({
    scene, box: $('scene-box'), targets: dragTargets, reduced: RM, topInset,
    confirm: (m, t) => doAct('move', { id: m.id, st: t.st, role: t.role }).ok,
    // Coger un ratón suspende lo que hacía la cámara (hay que ver los puestos); al terminar, se devuelve tal cual: FOLLOW sigue a quien seguía,
    // la selección y el foco de estación siguen ahí, y siempre con el controlador de P1, sin mover la cámara por otro camino.
    onGrab: () => { camBefore = { follow: scene.following ? scene.selectedMouse : null, sel: scene.selectedMouse, st: scene.focusedStation, pop: isOpen(pop) }; closeRes(); if (isOpen(pop)) openCrew(false); scene.unpick(); scene.dragStart(); },
    onEnd: () => scene.dragEnd(0),
    onDone: () => { const c = camBefore; camBefore = null; if (!c) return; if (c.tap) return tapMouse(c.tap); const has = (id) => id && scene.nodes().some((n) => n.m && n.m.id === id && n.px != null);
      if (has(c.sel)) { pickMouseId(c.sel); if (c.follow === c.sel) scene.focusMouse(c.sel); if (c.pop) openCrew(true); return; }
      if (c.st) scene.focusStation(c.st); if (c.pop) openCrew(true); },
  });
  let camBefore = null;
  // Si el jugador toca cualquier otra cosa antes de que acabe la transición, manda él: no se le recoloca la cámara.
  document.addEventListener('pointerdown', () => { if (!dragger.holding) camBefore = null; }, true);
  const cv = $('cv'); let drag = null, multi = false; const fingers = new Set();
  cv.addEventListener('pointerdown', (e) => {
    fingers.add(e.pointerId);
    if (fingers.size > 1 || multi) { multi = true; dragger.cancel(performance.now()); if (drag) { if (drag.moved) scene.dragEnd(0); drag = null; } return; }
    const r = cv.getBoundingClientRect(); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, ly: e.clientY, moved: false, done: false, sx: e.clientX - r.left, sy: e.clientY - r.top, pts: [[performance.now(), e.clientY]] };
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    if (!e.button) { const m = scene.mouseAt(drag.sx, drag.sy), w = m && Core.whereIs(G, m.id); if (w && w.scene === 'main') dragger.press(m, drag.sx, drag.sy, performance.now()); }
  });
  cv.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (dragger.holding || dragger.pressing) { const r = cv.getBoundingClientRect(); dragger.move(e.clientX - r.left, e.clientY - r.top); if (dragger.holding) return; }
    if (!drag.moved && Math.hypot(e.clientY - drag.y, e.clientX - drag.x) > 7) { drag.moved = true; clearTimeout(drag.timer); dragger.abort(performance.now()); scene.dragStart(e.clientY - cv.getBoundingClientRect().top); closeRes(); drag.ly = e.clientY; }
    if (drag.moved) { scene.dragBy(e.clientY - drag.ly, e.clientY - cv.getBoundingClientRect().top); drag.pts.push([performance.now(), e.clientY]); if (drag.pts.length > 6) drag.pts.shift(); }
    drag.ly = e.clientY;
  });
  const endDrag = (e) => {
    fingers.delete(e.pointerId); if (multi) { if (!fingers.size) multi = false; return; }
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null; clearTimeout(d.timer);
    if (dragger.holding) {
      if (e.type === 'pointercancel') dragger.cancel(performance.now());
      // Soltarlo sin haberlo movido es un toque algo lento: lo selecciona, como en P1, en vez de quedarse en nada.
      else if (Math.hypot(e.clientY - d.y, e.clientX - d.x) <= 7) { const m = dragger.heldMouse; dragger.cancel(performance.now(), true); camBefore = m ? { tap: m } : camBefore; }
      else dragger.release(performance.now());
      return;
    }
    dragger.abort(performance.now());
    if (e.type === 'pointercancel' && !d.moved) return;
    if (d.moved) { const a = d.pts[0], b = d.pts[d.pts.length - 1], dt = Math.max(16, b[0] - a[0]), v = performance.now() - b[0] > 90 ? 0 : (b[1] - a[1]) / dt; scene.dragEnd(v); return; }
    if (d.done) return;
    closeRes(); scene.tapAt(d.sx, d.sy);
    const m = scene.mouseAt(d.sx, d.sy);
    if (m) return tapMouse(m);
    const h = scene.hit(d.sx, d.sy); if (!h) { scene.release(); return; }
    if (h.type === 'face') { if (scene.focusedStation !== 'mine') focusSt('mine'); tapMine(); return; }
    if (h.type === 'station') { if (scene.focusedStation !== h.id) focusSt(h.id); return; }
    if (h.type === 'building') { if (h.id === 'shop') return focusSt('sell'); if (h.id === 'lab') return openLab(); return openMice(); }
  };
  // Mantener pulsado no debe abrir nada del navegador ni hacer scroll de la página: cortaría el gesto.
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('selectstart', (e) => e.preventDefault());
  cv.addEventListener('touchmove', (e) => { if (dragger.holding || dragger.pressing) e.preventDefault(); }, { passive: false });
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointercancel', endDrag);
  let wheelT = 0;
  cv.addEventListener('wheel', (e) => { e.preventDefault(); if (!wheelT) scene.dragStart(); scene.dragBy(-e.deltaY); clearTimeout(wheelT); wheelT = setTimeout(() => { scene.dragEnd(0); wheelT = 0; }, 120); }, { passive: false });
  function tapMouse(m) {
    const n = scene.nodes().find((q) => q.m && q.m.id === m.id); if (!n) return;
    const w = workOf(n), work = WORK.includes(w); if (work && w !== selected) select(w);
    openCrew(work); scene.pickMouse(m.id, topInset()); if (work) paintCrew(true);
  }
  const tag = document.createElement('button'); tag.className = 'focus-tag'; $('scene-box').appendChild(tag);
  tag.addEventListener('click', () => { const id = scene.selectedMouse; if (id) openMouse(id); });
  let tagT = 0, tagId = null;
  function paintTag(now) {
    const f = scene.focusTag();
    if (!f) { tag.classList.remove('in'); tagId = null; return; }
    const cr = G.s.placed.find((p) => p.m.id === f.n.m.id), roleTxt = cr ? ROLE[cr.role] || cr.role : ROLE[f.n.role] || f.n.role;
    if (f.n.m.id !== tagId || now - tagT > 300) { tagT = now; tagId = f.n.m.id; tag.innerHTML = '<b>' + esc(f.n.m.name) + ' ›</b><small>' + roleTxt + '</small><small>' + scene.stateOf(f.n) + '</small>'; }
    tag.style.left = Math.round(f.x) + 'px'; tag.style.top = Math.round(f.y) + 'px'; tag.classList.add('in');
  }

  // ---- Volver a la mina ----
  const home = $('home-btn'); let homeOn = false;
  function homePos() { home.style.setProperty('--ib', (isOpen(pop) ? pop.offsetHeight : 0) + 'px'); }
  let mineY = null, mineMoved = 0;
  function mineSeen() { const m = scene.plates().find((p) => p.id === 'mine'), H = $('scene-box').clientHeight, a = m.y, b = m.bottom + 40; return { y: a, vis: Math.max(0, Math.min(H, b) - Math.max(0, a)) / (b - a) }; }
  function homeTick() {
    const now = performance.now(), m = mineSeen();
    if (mineY == null || Math.abs(m.y - mineY) > 0.5) { mineY = m.y; mineMoved = now; }
    if ((drag && drag.moved) || wheelT || (!scene.following && now - mineMoved < 150)) return;
    const on = homeOn ? m.vis <= 0.4 : m.vis < 0.2;
    if (on === homeOn) return; homeOn = on; homePos();
    if (on) showEl(home); else hideEl(home, 160);
  }
  home.addEventListener('click', () => { scene.home(); if (isOpen(pop)) paintCrew(true); });

  // ---- Objetivo: la píldora de P1, con los objetivos reales ----
  const gEl = $('goal'); let gShown = null, gChange = 0, gProg = '', gDoneUntil = 0;
  const goalDef = (id) => E2.ROADMAP.goals.find((g) => g.id === id);
  let gSlot = 0, gSlotAt = 0, gSqueeze = false;
  function goalPlace(now) {
    if (gEl.hidden) return;
    const sb = $('scene-box').getBoundingClientRect(), W = sb.width, top0 = $('hud-coinsbox').getBoundingClientRect().bottom - sb.top + 6, w = gEl.offsetWidth, h = gEl.offsetHeight;
    const cands = [[W - 6 - w, top0], [6, top0], [W - 6 - w, top0 + h + 6], [6, top0 + h + 6]];
    const cr = $('cv').getBoundingClientRect(), ox = cr.left - sb.left, oy = cr.top - sb.top;
    const boxes = [];
    for (const n of scene.nodes()) { if (!n.crew || n.px == null || n.inside) continue; const [ax, ay] = scene.toScreen(n.px + 3, n.py - 20), [bx, by] = scene.toScreen(n.px + 19, n.py + 1); boxes.push([ox + ax, oy + ay, ox + bx, oy + by, 1]); }
    for (const el of document.querySelectorAll('#plates > *, #p0-toast.show, #home-btn.in')) { if (el.style.visibility === 'hidden') continue; const r = el.getBoundingClientRect(); boxes.push([r.left - sb.left, r.top - sb.top, r.right - sb.left, r.bottom - sb.top, 2]); }
    const cost = ([x, y], ww = w) => { let c = 0; for (const [l, t, r, b, wgt] of boxes) { const ix = Math.min(r, x + ww) - Math.max(l, x), iy = Math.min(b, y + h) - Math.max(t, y); if (ix > 1 && iy > 1) c += ix * iy * wgt; } return c; };
    const costs = cands.map((c) => cost(c)), free = costs.findIndex((c) => c === 0);
    let slot = gSlot;
    if (costs[gSlot] > 0 && free >= 0 && now - gSlotAt > 1200) { slot = free; gSlotAt = now; }
    gSqueeze = free < 0;
    if (slot !== gSlot) gSlot = slot;
    // Anclada a su lado: al desplegarse crece hacia dentro. Con left calculado para el tamaño plegado se salía de la pantalla y volvía.
    const atRight = gSlot % 2 === 0; gEl.style.left = atRight ? 'auto' : '6px'; gEl.style.right = atRight ? '6px' : 'auto'; gEl.style.top = Math.round(cands[gSlot][1]) + 'px';
  }
  function goalTick(now) {
    if (paused) return;
    if (gShown && G.goals[gShown.id] != null && now >= gDoneUntil && !gEl.classList.contains('done')) { gDoneUntil = now + 1300; gEl.classList.add('done'); gEl.classList.remove('min'); $('goal-t').textContent = '✓ ' + gShown.text; $('goal-n').textContent = ''; return; }
    if (now < gDoneUntil) return;
    const v = Core.view(G).goal;
    if (!v) { if (gShown) { gEl.classList.remove('in'); setTimeout(() => { if (!Core.view(G).goal) gEl.hidden = true; }, 220); gShown = null; } return; }
    const q = v.requires[0], counted = q.need > 1, ps = counted ? fmt(q.cur) + '/' + fmt(q.need) : '';
    if (!gShown || gShown.id !== v.id) { gShown = goalDef(v.id); gChange = now; gEl.hidden = false; gEl.classList.remove('done', 'min'); $('goal-ic').src = NAV_IC.goal; $('goal-t').textContent = v.text; void gEl.offsetWidth; gEl.classList.add('in'); pulse(gEl, 'bump', 320); gProg = '-'; }
    if (ps !== gProg) { gProg = ps; gChange = now; $('goal-n').textContent = ps; $('goal-bar').style.width = counted ? Math.round((100 * q.cur) / q.need) + '%' : '0%'; }
    // Solo se pliega si le queda una cuenta que enseñar: un objetivo sin cuenta plegado era un icono suelto y parecía que se iba.
    gEl.classList.toggle('min', counted && (now - gChange > 7000 || gSqueeze));
  }
  gEl.addEventListener('click', () => {
    if (!gShown) return;
    if (gEl.classList.contains('min')) { gChange = performance.now(); gEl.classList.remove('min'); }
    const at = gShown.at;
    if (gShown.id === 'shop' || gShown.id === 'house' || gShown.id === 'lab') return goBuild(gShown.id === 'shop' ? 'sell' : gShown.id);
    if (at === 'upgrades') return openUpgrades();
    if (at === 'mice') return openMice();
    if (/^recipe/.test(gShown.id)) return openLab();
    focusSt(at); if (plates[at]) pulse(plates[at], 'bump', 320);
  });
  // Avisos en cola: cada uno se lee; si llegan muchos a la vez, se quedan los primeros.
  let toastT = 0; const toastQ = [];
  function toast(t) { if (toastQ.includes(t)) return; if (toastT) { if (toastQ.length < 3) toastQ.push(t); return; } showToast(t); }
  function showToast(t) {
    const el = $('p0-toast');
    el.style.bottom = (10 + (isOpen(pop) ? pop.offsetHeight : 0) + ($('home-btn').classList.contains('in') ? 42 : 0)) + 'px';
    el.textContent = t; el.classList.add('show');
    toastT = setTimeout(() => { el.classList.remove('show'); toastT = 0; if (toastQ.length) setTimeout(() => { if (!toastT && toastQ.length) showToast(toastQ.shift()); }, 120); }, 2000);
  }

  // ---- Volver tras una ausencia: la misma simulación, a trozos, con su resumen ----
  const cover = $('bt-cover'), card = $('bt-card');
  let off = null;
  const dur = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : ''); };
  function beginOffline(ms) {
    const J = Core.offlineStart(G, ms);
    if (!J) return false;
    off = { total: J.total, t0: performance.now() };
    card.innerHTML = '<h1>WELCOME BACK</h1><p>Your colony kept working…</p><div class="bt-load"><i id="bt-bar"></i></div>'; cover.hidden = false;
    return true;
  }
  function offlineStep() {
    const t0 = performance.now(); let left = G.offJob ? G.offJob.left : 0;
    while (left > 0 && performance.now() - t0 < 14) left = Core.offlineRun(G, 300000);
    const b = $('bt-bar'); if (b) b.style.width = Math.round((100 * (off.total - left)) / Math.max(1, off.total)) + '%';
    if (left > 0) return;
    const S = Core.offlineEnd(G); off = null; cover.hidden = true;
    syncSim(); syncCrew(); syncWorld(); saveNow(); Core.drain(G);
    const rows = [['ic_coin', 'Coins', S.coins], ['ic_raw_' + tierNow(), 'Raw Cheese', S.raw], ['ic_base_' + tierNow(), 'Cheese Base', S.base], ['ic_lot_' + tierNow(), 'Cheese', S.lots]].filter((x) => x[2] > 0);
    const body = () => '<p>Away for ' + dur(S.ms + S.lost) + (S.lost ? ': the colony worked the first ' + dur(S.ms) + '. Night Lamp in UPGRADES lets it work longer.' : '.') + '</p><div class="bt-rows">' + rows.map((x) => row(ic(x[0]), x[1], '+' + fmt(x[2]), '')).join('') + (S.depth ? row(ic('ic_pick'), 'Depth', S.depth + ' levels deeper', '') : '') + (S.recipes ? row(ic('ic_base_cheddar'), 'Recipes', S.recipes + ' new', '') : '') + (S.notes.filter((n) => n.type === 'trait' || n.type === 'specialty').length ? row(NAV_IC.mouse, 'Your mice', S.notes.filter((n) => n.type === 'trait' || n.type === 'specialty').length + ' new skills learned', '') : '') + '</div>';
    if (rows.length || S.depth) sheet('WELCOME BACK', body);
  }
  function startCover() {
    if (brokenSave) card.innerHTML = '<h1>CHEESE DRILLER</h1><p>This save could not be read. It has been kept aside on this device, not deleted.</p><button class="bx bt-main" id="bt-new">START A NEW COLONY</button>';
    else card.innerHTML = '<h1>CHEESE DRILLER</h1><p>Beta. Build a colony of mice that dig, drill, refine, cook and sell cheese.</p><p>' + (store ? 'Your colony is saved on this device and browser.' : 'This browser is not allowing saves: your colony will be lost when you close it.') + '</p><button class="bx bt-main" id="bt-new">START NEW COLONY</button>';
    cover.hidden = false;
    $('bt-new').addEventListener('click', () => { paused = false; cover.hidden = true; lastReal = Date.now(); saveNow(); });
  }

  // ---- Bucle ----
  let last = performance.now(), hudSig = '', slow = 0, lastReal = loadedSave ? loadedSave.savedAt : Date.now(), nextSave = 0;
  function tick(now) {
    const real = Date.now(), elapsed = Math.max(0, real - lastReal); lastReal = real;
    if (off) offlineStep();
    else if (!paused) { if (elapsed >= OFFLINE_MIN && beginOffline(elapsed)) {} else if (elapsed > 0 && elapsed < OFFLINE_MIN) Core.advance(G, elapsed); }
    syncSim(); processEvents(); dragger.step(performance.now()); syncCrew(); dragger.settle(); syncWorld();
    rushTick(now); goalTick(now);
    scene.draw(now);
    placePlates(); placeSigns(); dragger.render(performance.now());
    const s = G.s, t = tierNow(), sig = [fmt(s.coins), fmt(rate('coins')), s.depth, t, s.vein.open, Math.floor((100 * (s.vein.open ? s.vein.left / Math.max(1, s.vein.cap) : s.vein.found / Math.max(1e-9, s.vein.need))))].join('|');
    if (sig !== hudSig) {
      hudSig = sig;
      $('hud-coins').textContent = fmt(s.coins); $('hud-rate').textContent = '+' + fmt(rate('coins')) + '/min';
      $('hud-depth').textContent = 'DEPTH ' + s.depth; $('hud-tier').textContent = t.toUpperCase(); $('hud-tieric').src = icd('ic_raw_' + t);
      $('hud-depthbar').style.width = Math.round(100 * (s.vein.open ? s.vein.left / Math.max(1, s.vein.cap) : s.vein.found / Math.max(1e-9, s.vein.need))) + '%';
      $('hud-depthbox').classList.toggle('vein', s.vein.open);
    }
    homeTick();
    paintPanel(false); paintTag(now);
    if (now - slow > 400) {
      slow = now; goalPlace(now); perfPaint(); for (const k of Object.keys(madeLog)) rate(k);
      if (isOpen(pop)) paintCrew(false); if (isOpen(res)) paintRes(); refreshSheet();
      $('nav-upgrades').classList.toggle('fresh', freshUp || (gShown && gShown.id === 'node' && Core.options(G).some((o) => s.coins >= o.cost)));
      $('nav-boosts').classList.toggle('fresh', G.boosts.earned - Ru.placedBoosts(G) > 0);
      $('nav-mice').classList.toggle('fresh', !paused && (Core.unassigned(G).length > 0 || G.cands.length > 0 || Ru.promoteOptions(G).some((o) => s.coins >= o.cost) || scene.stationState('house') === 'build' || (gShown && gShown.id === 'mouse' && s.coins >= Ru.recruitCost(G))));
    }
    if (!paused && !off && real >= nextSave) { nextSave = real + SAVE_EVERY; saveNow(); }
  }
  // ---- Medidor, solo con ?perf ----
  const PERF = { on: /[?&]perf\b/.test(location.search), iv: [], js: [], last: 0 };
  function perfFrame(now, js) { if (!PERF.on) return; if (PERF.last) { PERF.iv.push(now - PERF.last); if (PERF.iv.length > 240) PERF.iv.shift(); } PERF.last = now; PERF.js.push(js); if (PERF.js.length > 240) PERF.js.shift(); }
  function perfPaint() { const m = $('perf-meter'); if (!PERF.on) return; const a = PERF.iv.filter((x) => x > 0).sort((x, y) => x - y), j = [...PERF.js].sort((x, y) => x - y); m.hidden = false; if (a.length < 10) { m.textContent = 'measuring…'; return; } m.textContent = Math.round(1000 / (a.reduce((x, y) => x + y, 0) / a.length)) + ' fps · p95 ' + Math.round(a[Math.floor(a.length * 0.95)]) + ' ms · long ' + a.filter((x) => x > 33).length + ' · JS ' + j[j.length >> 1].toFixed(1) + ' ms · ' + innerWidth + '×' + innerHeight + ' @' + devicePixelRatio; }
  function frame(now) { const t0 = performance.now(); try { tick(now); } catch (e) { if (!frame.err) { frame.err = true; console.error(e); toast('Something went wrong. Your colony is safe: reload the page.'); } } perfFrame(now, performance.now() - t0); requestAnimationFrame(frame); }
  // Guardar al irse: en móvil, cerrar o cambiar de app no siempre avisa de otra forma.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { dragger.cancel(performance.now()); saveNow(); } });
  window.addEventListener('pagehide', () => saveNow());
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  // ---- Arranque ----
  crewSig = ''; syncCrew(true); syncWorld();
  for (const st of WORK) if (G.boosts.place[st]) scene.boostTo(st, G.boosts.place[st], false);
  select('mine');
  if (paused) startCover();
  requestAnimationFrame(frame);
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') window.BETA = { get G() { return G; }, get dragger() { return dragger; }, sim, scene, save: saveNow, sync: () => { syncSim(); syncCrew(); }, act: doAct, tick, focus: focusSt };
})();
