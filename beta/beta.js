// CHEESE DRILLER BETA · MAIN 3.0 sobre la partida real. La composición, la escena y la navegación son las de P1 (proto3/p0.js);
// aquí se sustituyen sus datos simulados por el núcleo (core/game.js): lo que se ve es lo que hay. `sim` ya no simula nada: es la
// vista que lee la escena, copiada de la partida en cada fotograma. Las hojas Pulido+ viven en su capa (sheets.html). Guarda en su propia clave (core/save.js) y no lee ni toca ninguna otra partida.
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
  const scene = CM.createColonyScene($('cv'), $('scene-box'), sim, { hit: () => {}, crewAt, boostLabel: (st, n, x, y) => boostLabel(st, n, x, y) });
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
  const toSheets = (e) => { if (PZ.ready) try { pzWin().SHEETS.event(e); } catch (err) { console.warn(err); } };
  // Lo que pasa en la partida sigue contando con cualquier escena; sus efectos en MAIN, solo si se ve: sin dibujar, nadie los consumiría y se amontonarían.
  const sceneFx = (t) => { if (scenes.current === 'main') scene.onEvent(t); };
  function processEvents() {
    for (const e of Core.drain(G)) {
      switch (e.type) {
        case 'reveal': sceneFx('reveal'); if (!G.s.built.drill) toast('Vein found!'); break;
        case 'drillDone': made('raw', e.amount); sceneFx('drillDone'); break;
        case 'refineDone': made('base', e.amount); sceneFx('refineDone'); break;
        case 'lotDone': made('cheese', e.n + (e.wheel || 0)); sceneFx('cookDone'); break;
        case 'sale': made('coins', e.coins); sceneFx('sale'); break;
        case 'sellStart': if (e.by) { if (saleFrom == null) saleFrom = performance.now(); saleLog.push({ at: performance.now(), by: e.by, f: e.f || 1 }); } break;
        case 'depth': { sceneFx('deeper'); const t = tierNow(); if (t !== tierShown) { scene.setTier(t); tierShown = t; sceneFx('stratum'); toast('New stratum: ' + t.toUpperCase()); } break; }
        case 'unlock': { const tx = UNLOCK_TXT(e.id); if (tx) toast(tx); if (/^(phase|path|ms)/.test(e.id)) freshUp = true; break; }
        case 'specialty': case 'trait': { const m = G.roster.find((x) => x.id === e.id), tr = REAL.mice.traits[e.trait]; if (m && tr && tr.kind !== 'legend') toast(m.name + ' learned ' + tr.name); toSheets(e); break; }
        case 'recruited': toSheets(e); break;
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
  function goBuild(id) { if (id === 'sell') focusSt('sell'); else { scene.showSurface(); openPz(id === 'house' ? 'mice' : 'lab', id === 'house' && G.built.house ? 'house' : undefined); } if (!SIGNS[id].el.hidden) pulse(SIGNS[id].el.firstChild, 'bump', 320); }
  const BUILDING_OF = { shop: 'sell', house: 'house', lab: 'lab' };
  const isBuilt = (id) => scene.stationState(id) === 'on' || (id === 'house' && G.built.house) || (id === 'lab' && G.lab.built) || (id === 'sell' && G.s.built.sell);
  function tapBuilding(hid) {
    const id = BUILDING_OF[hid], r = scene.buildingRect(hid);
    if (r) { const sb = $('scene-box').getBoundingClientRect(), cr = $('cv').getBoundingClientRect(), [x0, y0] = scene.toScreen(r[0], r[1]), [x1, y1] = scene.toScreen(r[0] + r[2], r[1] + r[3]), el = document.createElement('i'); el.className = 'bd-press'; el.style.cssText = 'left:' + Math.round(cr.left - sb.left + x0) + 'px;top:' + Math.round(cr.top - sb.top + y0) + 'px;width:' + Math.round(x1 - x0) + 'px;height:' + Math.round(y1 - y0) + 'px'; $('scene-box').appendChild(el); setTimeout(() => el.remove(), 260); }
    const sp = scenes.get(id); if (sp && sp.content && isBuilt(id)) return scenes.go(id); // cuando HOUSE o LAB tengan su escena, se entra en ella; hasta entonces, su panel
    if (id === 'sell') return isBuilt('sell') ? openPz('shopinfo') : focusSt('sell'); // sin construir, su estación dice cómo se construye
    if (id === 'lab') return openPz('lab');
    return openPz('mice', G.built.house ? 'house' : undefined);
  }
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
    if (st === 'sell') { const lots = Mo.lotsTotal(s); status = job ? 'Selling cheese' : lots > 0 ? 'Tap to sell' : 'No cheese to sell'; tone = job ? 'good' : 'stop'; flow = ri('lot') + fmt(lots) + ' → ' + ri('coin') + '+' + fmt(income()) + '/min'; }
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
  const ST_SHEET = { cheese: () => openPz('cheese'), sell: () => openPz('shopinfo') };
  $('pn-st').addEventListener('click', () => { const sp = ST_SHEET[selected]; if (sp) sp(); });

  // ---- Equipo de la estación: los puestos de verdad; un puesto vacío se ve vacío ----
  const pop = $('crew-pop');
  let popSig = '', popHold = 0, popBySel = false; // popHold: hasta cuándo no se rehace la tira. popBySel: la abrió elegir un ratón, y se cierra al dejar de elegirlo
  const PORTRAIT = {};
  const portrait = (m, st) => { const k = m.id + ':' + st + ':' + (m.rank || 0); return PORTRAIT[k] || (PORTRAIT[k] = scene.portrait(m, st)); };
  const byId = (id) => G.roster.find((m) => m.id === id);
  const tone = (s) => (/Waiting|Idle/.test(s) ? 'wait' : /Working|Carrying|Passing|Digging|On shift/.test(s) ? 'busy' : '');
  // Lo que aporta en una palabra, con las cifras del núcleo. El detalle está en su ficha.
  const CREW_UNIT = { mine: 'power', drill: 'Raw', refine: 'batch', cheese: 'cheese', sell: 'coins' };
  function crewGives(st, role, id) {
    const i = Ru.postInfo(G, st, role, id); if (!i || !i.mouse) return '';
    if (i.fn === 'pr') return Math.round(i.mouse.value * 100) + '% speed';
    if (i.fn === 'ritmo') return '+' + Math.round(i.mouse.value * 100) + '% speed';
    return '+' + Math.round(i.mouse.value * (st === 'sell' ? E2.PARAMS.sell.yieldWeight : 1) * 100) + '% ' + CREW_UNIT[st];
  }
  function paintCrew(force) {
    const posts = Core.postsOf(G, selected), selId = scene.selectedMouse, here = scene.stationState(selected) === 'on';
    const sel = posts.find((p) => p.mouse && p.mouse === selId), node = sel && scene.nodes().find((q) => q.m && q.m.id === selId), m = sel && byId(selId);
    const line = sel && m ? '<b>' + m.name + '</b> · ' + (ROLE[sel.role] || sel.role) + ' · ' + crewGives(selected, sel.role, m.id) + (node ? '<br><span class="' + tone(scene.stateOf(node)) + '">' + scene.stateOf(node) + '</span>' : '') : here ? 'Tap a worker, or an empty post to fill it.' : 'Build this station first.';
    const sig = selected + '|' + selId + '|' + scene.following + '|' + posts.map((p) => p.role + p.mouse).join(',') + here;
    if ((force || sig !== popSig) && performance.now() >= popHold) {
      popSig = sig;
      const rows = !here ? '<p>Nobody works here.</p>' : posts.map((p) => { const w = p.mouse && byId(p.mouse); return w ? '<button class="crew-row' + (w.id === selId ? ' on' : '') + '" data-mouse="' + w.id + '" aria-label="' + w.name + ', ' + (ROLE[p.role] || p.role) + '"><img class="pix" src="' + portrait(w, selected) + '" alt=""><b>' + w.name + '</b></button>' : '<button class="crew-row empty" data-post="' + p.role + '" aria-label="Empty post: ' + (ROLE[p.role] || p.role) + '"><i>+</i><b>' + (ROLE[p.role] || p.role) + '</b></button>'; }).join('');
      pop.innerHTML = '<h5>' + NAME[selected] + ' CREW <small>' + posts.filter((p) => p.mouse).length + '/' + posts.length + ' WORKERS</small></h5><div class="crew-strip" style="--n:' + Math.max(4, posts.length) + '">' + rows + '</div><div class="crew-sel" id="crew-sel"></div>';
    }
    // Solo cambia lo que ha cambiado: esto se pinta cada 0,4 s y, rehaciendo los botones, un toque empezaba en uno y acababa en otro y se perdía.
    const box = $('crew-sel'); if (!box) return;
    if (box.dataset.sel !== String(!!sel)) { box.dataset.sel = String(!!sel); box.innerHTML = '<span></span>' + (sel ? '<button class="crew-card bx" data-follow></button><button class="crew-card bx" data-card>CARD</button>' : ''); box.dataset.line = ''; }
    if (box.dataset.line !== line) { box.dataset.line = line; box.firstChild.innerHTML = line; }
    const fb = box.querySelector('[data-follow]'); if (fb) { const t = scene.following ? 'STOP' : 'FOLLOW'; if (fb.textContent !== t) fb.textContent = t; fb.setAttribute('aria-pressed', String(scene.following)); }
    if (force && sel) { const b = pop.querySelector('.crew-row.on'); if (b) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }
  function openCrew(open) {
    if (open) showEl(pop); else hideEl(pop); $('pn-crew').setAttribute('aria-expanded', String(open));
    if (open) { pop.style.bottom = ($('p0').clientHeight - $('panel').offsetTop) + 'px'; paintCrew(true); closeRes(); }
    scene.setInsetBottom(open ? pop.offsetHeight : 0);
    homePos();
  }
  $('pn-crew').addEventListener('click', () => { popBySel = false; openCrew(!isOpen(pop)); });
  pop.addEventListener('pointerdown', () => { popHold = Infinity; }, true);
  for (const t of ['pointerup', 'pointercancel']) window.addEventListener(t, () => { if (popHold === Infinity) popHold = performance.now() + 250; }, true);
  pop.addEventListener('click', (e) => {
    const id = scene.selectedMouse; popHold = 0;
    if (e.target.closest('[data-card]')) { if (id) openPz('card', id); return; }
    if (e.target.closest('[data-follow]')) { if (scene.following) scene.unfollow(); else if (id) scene.focusMouse(id); paintCrew(true); return; }
    const po = e.target.closest('[data-post]'); if (po) return openPz('post', SKILL[selected] + ':' + po.dataset.post);
    const b = e.target.closest('[data-mouse]'); if (!b) return;
    if (b.dataset.mouse === id) return openPz('card', id); // igual que en la escena: tocar al ya elegido abre su ficha
    chooseMouse(b.dataset.mouse);
  });
  pop.addEventListener('transitionend', () => homePos());

  // ---- Recursos ----
  const res = $('res-pop');
  function paintRes() {
    const t = tierNow(), s = G.s, row = (icon, name, sub, val, r) => '<button class="res-row" data-res="' + name + '"><img class="pix" src="' + icd(icon) + '" alt=""><span><b>' + name + '</b><small>' + sub + '</small></span><em><b>' + val + '</b><small>' + r + '</small></em><i class="rr-go" aria-hidden="true">›</i></button>';
    res.innerHTML = '<h5>RESOURCES <small>STOCK · LAST MINUTE</small></h5>' +
      row('ic_coin', 'COINS', 'Earned in the shop', fmt(s.coins), '+' + fmt(income()) + '/min') +
      row('ic_lot_' + t, 'CHEESE', 'Wheels waiting to sell', fmt(Mo.lotsTotal(s)), '+' + fmt(rate('cheese')) + '/min') +
      row('ic_base_' + t, 'CHEESE BASE', 'Ready for the cheesery', fmt(s.inv.base), '+' + fmt(rate('base')) + '/min') +
      row('ic_raw_' + t, 'RAW CHEESE', 'Ready for the refinery', fmt(s.inv.raw), '+' + fmt(rate('raw')) + '/min');
  }
  function closeRes() { hideEl(res); $('hud-coinsbox').setAttribute('aria-expanded', 'false'); }
  res.addEventListener('click', (e) => { const b = e.target.closest('[data-res]'); if (!b) return; if (b.dataset.res === 'COINS') openPz('coins'); else openPz('stock'); });
  $('hud-coinsbox').addEventListener('click', () => { const open = !isOpen(res); $('hud-coinsbox').setAttribute('aria-expanded', String(open)); if (open) { paintRes(); showEl(res); if (isOpen(pop)) openCrew(false); } else closeRes(); });

  // ---- Hojas: las Pulido+ aprobadas viven en su propia capa (sheets.html), como en P1; aquí solo se abren y se les da la partida ----
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rise(body, delay) { if (RM() || !body.animate) return; [...body.children].slice(0, 8).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: delay + i * 28, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' })); }
  // La hoja propia de P1, para lo que es de MAIN (la profundidad).
  function sheet(title, html) { closePz(); const was = isOpen($('sheet')); $('sheet-title').textContent = title; $('sheet-body').innerHTML = html; $('sheet-body').scrollTop = 0; showEl($('sheet')); rise($('sheet-body'), was ? 0 : 110); closeRes(); if (isOpen(pop)) openCrew(false); }
  const closeSheet = () => { hideEl($('sheet'), 220); };
  $('sheet-close').addEventListener('click', closeSheet);
  $('sheet').addEventListener('click', (e) => { if (e.target === $('sheet')) closeSheet(); });
  const REASON = { 'no-coins': 'Not enough coins', locked: 'Not available yet', 'no-materials': 'Not enough materials', 'queue-full': 'The lab queue is full', 'bed-busy': 'The bed is taken', 'no-house': 'Build the Mouse House first', 'not-built': 'Build it first', full: 'Two boosts at most', 'none-free': 'No free boosts' };
  let rev = 0;
  // Toda acción pasa por aquí, venga de MAIN o de una hoja: la escena, el panel y lo guardado se ponen al día a la vez.
  function applied(type) { rev += 1; syncSim(); syncCrew(); processEvents(); paintPanel(true); if (type !== 'seen') saveNow(); }
  function doAct(type, args, okMsg) {
    const r = Core.act(G, type, args);
    if (!r.ok) { toast(REASON[r.reason] || 'Not possible right now'); return r; }
    if (okMsg) toast(okMsg);
    applied(type);
    return r;
  }
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const pretty = (id) => id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  const recipeName = (key) => { const [b, i, t, m] = key.split('+'), B = REAL; return B.ingredients[i].name + ' ' + B.treatments[t].name + ' ' + B.maturations[m].name + ' ' + B.bases[b].name; };
  const PATH_TXT = { prospector: 'Taps hit twice as hard; the crew lands critical hits', blasting: 'Three critical taps set off a blast of crew search', surveyCrew: 'Mine 30% faster', shiftRota: 'Scaffolders count for more', surveyAhead: 'Search for the next vein while drilling', wideSeams: 'Veins hold 40% more; deeper levels are richer', richSeams: 'Each vein gives one more material', quickSeams: 'Smaller veins, found much faster', pureBase: '20% more BASE, refining 20% slower', gaugeDiscipline: 'Yield posts count for more', fastStill: 'Refine 30% faster and cook 20% faster', affinage: 'Cheese worth 40% more, taking 50% longer', freshMarket: 'Cook 40% faster, cheese worth 5% less', boutique: 'Sell fewer, Fine cheese pays 40% more', collectorsList: 'Better buyers sooner', wholesale: 'Sell 80% more at 10% less', bulkContracts: 'Better wholesale prices', coreSampler: 'Twice the materials', strataLogs: 'Blueprints need 30% less material', throughput: '25% more RAW', heavyBits: 'Yield posts count for more' };
  // Refuerzos desde su hoja: el efecto en la escena (ya aprobado) sale al cerrarla, cuando se ve.
  // Lo pendiente va por estación: al cerrar la hoja, cada máquina cuenta su cambio. Vale el último valor; poner o quitar se anima igual.
  const boostPend = {};
  function boostFx(st, n, was) {
    if (n > was) { if (plates[st]) pulse(plates[st].querySelector('.bo-chip'), 'stamp', 420); if (st === selected) pulse($('pn-st').querySelector('.bo-chip'), 'stamp', 420); }
    boostPend[st] = n;
  }
  // Lo económico ya ha cambiado; la máquina cuenta el cambio cuando se la puede ver. Fuera de pantalla espera: si empezara allí, al volver ya estaría sin la pieza.
  const stationSeen = (st) => { const q = scene.stationRect(st); if (!q) return true; const y0 = scene.toScreen(q[0], q[1])[1], y1 = scene.toScreen(q[0], q[1] + q[3])[1]; return Math.min(y1, $('scene-box').clientHeight) - Math.max(y0, topInset()) >= (y1 - y0) * 0.35; };
  function flushBoost() { for (const st of Object.keys(boostPend)) if (stationSeen(st)) { const n = boostPend[st]; delete boostPend[st]; scene.boostTo(st, n, true); } }
  function boostLabel(st, n, x, y) {
    const el = document.createElement('div'); el.className = 'bo-float'; el.textContent = BO_LABEL[st][n] + (st === 'refine' ? ' BASE' : ' SPEED');
    $('scene-box').appendChild(el); const w = el.offsetWidth; el.style.left = Math.round(Math.max(6, Math.min($('scene-box').clientWidth - w - 6, x - w / 2))) + 'px'; el.style.top = Math.round(Math.max(topInset(), y - 14)) + 'px';
    setTimeout(() => el.remove(), 1300);
  }
  // Ventas de los últimos minutos, por queso: las de verdad, contadas según llegan. Con el juego cerrado no se cuentan.
  const saleLog = []; let saleFrom = null, incomeAt = -1e9, incomeV = 0;
  // Monedas por minuto: la misma cifra en el marcador, en RESOURCES, en el panel de SELL, en SHOP y en COINS.
  const income = () => { const t = performance.now(); if (t - incomeAt > 250) { incomeAt = t; incomeV = salesRates(null, 60000).coins; } return incomeV; };
  function salesRates(s, win) {
    const now = performance.now(), from = now - win; while (saleLog.length && saleLog[0].at < from) saleLog.shift();
    // Lo vendido en la ventana, por minuto. Hasta tener la ventana entera se divide por lo medido (nunca menos de 12 s, para no inflar la primera venta).
    const span = saleFrom == null ? 0 : Math.max(0.2, Math.min(win, now - saleFrom) / 60000), bases = {}; let coins = 0;
    for (const e of saleLog) for (const b of Object.keys(e.by)) { const o = bases[b] || (bases[b] = { c: 0, w: 0, n: 0, wn: 0 }), v = e.by[b]; o.n += v[0] / span; o.c += (v[1] * e.f) / span; o.wn += v[2] / span; o.w += (v[3] * e.f) / span; coins += ((v[1] + v[3]) * e.f) / span; }
    return { span, bases, coins };
  }
  function shopCapacity() {
    const s = G.s, SP = E2.PARAMS.sell, r = s.rates.sell, per = SP.perCycleByStage ? SP.perCycleByStage[s.stage.sell - 1] : SP.perCycle, cyc = Mo.cycle(SP.cycleMs / (r.auto ? r.ritmo : 1)), perMin = ((per * s.mods.sell.count * cyc.mult) / cyc.total) * 60000;
    return { perMin, shelf: Math.floor(perMin * REAL.shop.shelfMinutes) };
  }
  function stXp(st) {
    const lv = G.stLv[st], at = (l) => Ru.stXpFor(l), a = at(lv), b = at(lv + 1), x = G.stXp[st] || 0;
    return { cur: Math.max(0, x - a), need: Math.max(1, b - a) };
  }
  const hhmm = (h) => { h = ((h % 24) + 24) % 24; const m = Math.round((h % 1) * 60); return String(Math.floor(h) + (m === 60 ? 1 : 0)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
  window.BETA_HOST = {
    get G() { return G; }, Core, Ru, Lb, Mo, Cr, Pg, Inv, REAL, get PARAMS() { return E2.PARAMS; }, ROLE, PATH_TXT, pretty, fmt, recipeName,
    tier: tierNow, rev: () => rev, salesRates, shopCapacity, stXp, boLabel: (st, n) => (n ? BO_LABEL[st][n] + (st === 'refine' ? ' BASE' : ' SPEED') : ''),
    act(type, args) {
      const was = type === 'boostPlace' || type === 'boostRemove' ? G.boosts.place[args.st] || 0 : null;
      const r = Core.act(G, type, args);
      if (r.ok) { applied(type); if (was != null) boostFx(args.st, G.boosts.place[args.st] || 0, was); }
      return r;
    },
    toastIn: (t) => toast(t),
    afterBuild: () => scene.showSurface(),
    newsList: () => G.news.filter((e) => e.trait).slice().reverse().map((e) => { const m = G.roster.find((x) => x.id === e.id); return { id: e.id, trait: e.trait, name: m ? m.name : '' }; }),
    itemSource: (id) => { const d = E2.PARAMS.strata.find((x) => x.id === id), k = Inv.card(G, id); return k.sources.some((r) => r.on === 'vein') && d ? 'Every cheese vein opened in the ' + REAL.bases[id].name + ' stone gives some (depth ' + d.from + ' to ' + d.to + ').' : 'Nobody knows yet.'; },
    saveInfo: () => ({ failed: saveFailed, ago: savedAt ? Math.max(0, Math.round((Date.now() - savedAt) / 1000)) : null, hours: Math.round(Core.capMs(G) / 3600000), build: window.BETA_BUILD || 'dev' }),
    skyInfo: () => { const i = scene.skyInfo(); return { mode: i.mode, text: (i.mode === 'auto' ? 'Now ' : 'Set to ') + hhmm(i.hour), value: i.mode === 'auto' ? 'auto' : String(i.hour) }; },
    setSky: (v) => scene.setSky(v === 'auto' ? { mode: 'auto' } : { mode: 'fixed', hour: +v }),
    exportSave: () => Sv.serialize(G, Date.now()),
    importSave: (t) => { if (!store || !Sv.deserialize(t)) return false; paused = true; store.setItem(Sv.KEY, t); location.reload(); return true; },
    newGame: () => { paused = true; try { if (store) Sv.erase(store); } catch (e) {} location.reload(); },
    layerReady() { PZ.ready = true; if (PZ.want) pzGo(); flushWelcome(); },
    layerShow() { PZ.el.classList.remove('off'); PZ.el.classList.add('in'); PZ.el.setAttribute('aria-hidden', 'false'); },
    layerClosing() { PZ.el.classList.remove('in'); },
    layerClosed() { closePz(true); },
    questIcon: NAV_IC.goal, questGo: () => goToGoal(), E2,
    ghostClick: (x, y) => { const r = PZ.fr.getBoundingClientRect(); return isGhost(r.left + x, r.top + y); }, ghostClear: () => { ghost.until = 0; },
  };
  const PZ = { el: $('pz'), fr: null, ready: false, want: null, t: 0 };
  const pzWin = () => PZ.fr && PZ.fr.contentWindow;
  const pzOpen = () => !PZ.el.classList.contains('off');
  function ensurePz() {
    if (PZ.fr) return;
    const f = document.createElement('iframe'); f.className = 'pz-frame'; f.title = 'Game panels'; f.src = 'sheets.html?v=' + (window.BETA_BUILD || 'dev');
    PZ.el.appendChild(f); PZ.fr = f;
  }
  setTimeout(ensurePz, 3500); // precarga cuando la escena ya está en marcha
  function openPz(kind, arg) {
    if (isOpen($('sheet'))) closeSheet(); closeRes(); if (isOpen(pop)) { PZ.popWas = true; openCrew(false); } // WORKERS vuelve al cerrar: no se pierde FOLLOW / STOP
    ensurePz(); PZ.want = [kind, arg];
    PZ.el.classList.remove('off'); PZ.el.setAttribute('aria-hidden', 'false');
    if (PZ.ready) return pzGo();
    $('pz-load').hidden = false; clearTimeout(PZ.t); PZ.t = setTimeout(() => { if (PZ.want && !PZ.ready) { closePz(true); toast('The game panels are taking too long to load'); } }, 12000);
  }
  function pzGo() {
    const [k, a] = PZ.want; PZ.want = null; $('pz-load').hidden = true;
    let ok = false; try { ok = pzWin().SHEETS.open(k, a); } catch (e) { console.warn(e); }
    if (!ok) { closePz(true); toast('This panel is not available yet'); return; }
    PZ.el.classList.add('in');
  }
  function closePz(fromSheet) {
    PZ.want = null; $('pz-load').hidden = true; PZ.el.classList.remove('in');
    if (!fromSheet && PZ.ready) { let open = false; try { open = pzWin().SHEETS.isOpen; if (open) pzWin().SHEETS.close(); } catch (e) {} if (open) return; }
    PZ.el.classList.add('off'); PZ.el.setAttribute('aria-hidden', 'true'); boostAfter = performance.now();
    if (PZ.popWas) { PZ.popWas = false; if (!isOpen(pop)) openCrew(true); }
  }
  const openDepth = () => sheet('DEPTH ' + G.s.depth, '<p>Stratum: ' + tierNow().toUpperCase() + '. Every emptied vein takes the colony one level deeper. Each new stratum brings a richer cheese to study in the Cheese Lab.</p>');
  document.querySelectorAll('[data-nav]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.nav;
    if (k === 'mice') return openPz('mice');
    if (k === 'upgrades') { freshUp = false; return openPz('tree', selected); }
    if (k === 'boosts') return openPz('boosts');
    if (k === 'menu') return openPz('options');
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
    onGrab: () => { if (!gesture.grabbed()) return dragger.cancel(performance.now()); camBefore = { follow: scene.following ? scene.selectedMouse : null, sel: scene.selectedMouse, st: scene.focusedStation, pop: isOpen(pop) }; closeRes(); if (isOpen(pop)) openCrew(false); scene.unpick(); scene.dragStart(); },
    onEnd: () => scene.dragEnd(0),
    onDone: () => { camBack = camBefore; camBefore = null; restoreCam(); },
  });
  let camBefore = null, camBack = null;
  // Devolver la cámara y la selección al acabar. El ratón puede no estar aún en la escena (en un fotograma lento vuelve y la transición acaba en el mismo paso):
  // entonces se espera a que esté, sin perder lo que se estaba viendo. Si ya no trabaja en esta escena, queda lo demás.
  function restoreCam() {
    const c = camBack; if (!c) return;
    const n = c.sel && scene.nodes().find((q) => q.m && q.m.id === c.sel), w = c.sel && Core.whereIs(G, c.sel);
    if (c.sel && w && w.scene === 'main' && (!n || n.px == null)) return;
    camBack = null;
    if (n && n.px != null) { pickMouseId(c.sel); if (c.follow === c.sel) scene.focusMouse(c.sel); } else if (c.st) scene.focusStation(c.st);
    if (c.pop) openCrew(true);
  }
  // Si el jugador toca cualquier otra cosa antes de que acabe la transición, manda él: la selección vuelve, pero no se le recoloca la cámara.
  document.addEventListener('pointerdown', () => { if (dragger.holding) return; const c = camBefore || camBack; camBefore = null; camBack = null; if (!c) return; if (c.sel && scene.nodes().some((n) => n.m && n.m.id === c.sel && n.px != null)) pickMouseId(c.sel); if (c.pop && !isOpen(pop)) openCrew(true); }, true);

  const inputLog = /[?&]input\b/.test(location.search) ? document.createElement('pre') : null;
  if (inputLog) { inputLog.className = 'input-log'; document.body.appendChild(inputLog); }
  function inputNote(t) { if (!inputLog) return; const l = inputLog.textContent.split('\n'); l.push(t); inputLog.textContent = l.slice(-14).join('\n'); }

  // ---- Qué hay bajo el dedo ----
  // Por este orden: el cuerpo de un ratón (está pintado delante de todo); el ratón elegido, con una zona más amplia porque es al que se va a volver a
  // tocar; los edificios y la roca, enteros; un margen alrededor de los demás ratones para acertarles con el dedo; y, si no, la estación o nada.
  // Un ratón delante de un edificio solo se lleva lo que tapa de verdad, así que el edificio siempre se puede tocar.
  const SEL_RX = 30, SEL_RY = 36, SPOT_R = 30, SPOT_MS = 1200;
  let selSpot = null; // dónde estaba el ratón al elegirlo: la cámara lo lleva a su sitio y, mientras tanto, quien vuelve a tocar apunta ahí
  function selectedNear(x, y) {
    const id = scene.selectedMouse; if (!id || !byId(id)) return '';
    if (selSpot && selSpot.id === id && performance.now() - selSpot.t < SPOT_MS && Math.hypot(x - selSpot.x, y - selSpot.y) <= SPOT_R) return 'spot';
    const n = scene.nodes().find((q) => q.m && q.m.id === id); if (!n || n.px == null) return '';
    const [mx, my] = scene.toScreen(n.px + 11, n.py - 9);
    return Math.abs(x - mx) <= SEL_RX && Math.abs(y - my) <= SEL_RY ? 'mouse' : '';
  }
  function targetAt(x, y) {
    const hit = scene.mouseHit(x, y); if (hit && hit.body) return { m: hit.m };
    const h = scene.hit(x, y), near = selectedNear(x, y);
    if (near === 'spot' || (near === 'mouse' && !(h && (h.type === 'building' || h.type === 'face')))) return { m: byId(scene.selectedMouse) };
    if (hit) return { m: hit.m };
    return { h };
  }

  // ---- Clic fantasma ----
  // Un toque se decide al levantar el dedo y lo que abre aparece en ese momento; después, el navegador puede generar un clic en el mismo punto, que caería
  // sobre lo recién abierto (el velo de una hoja la cerraba al instante). touchend lo evita en el móvil; esto es la red: un clic junto a un toque recién
  // decidido, sin que haya vuelto a apoyarse ningún dedo, no es del jugador. No hace esperar a nadie: un segundo toque de verdad empieza con su pointerdown.
  const GHOST_MS = 450, GHOST_R = 48, ghost = { until: 0, x: 0, y: 0 };
  const isGhost = (x, y) => performance.now() < ghost.until && Math.hypot(x - ghost.x, y - ghost.y) <= GHOST_R;
  document.addEventListener('pointerdown', () => { ghost.until = 0; }, true);
  document.addEventListener('click', (e) => { if (isGhost(e.clientX, e.clientY)) { e.stopPropagation(); e.preventDefault(); inputNote('ghost click'); } }, true);

  // ---- Un solo clasificador (gesture.js); aquí, solo qué hace cada resultado ----
  const cv = $('cv'), TAP_SLOP = 7, TAP_SLOP_MOUSE = 12; // apoyar el dedo en un ratón admite más temblor: en un móvil, un toque se mueve varios píxeles
  const gesture = window.BetaGesture({
    resolve: targetAt, slop: (t) => (t && t.m ? TAP_SLOP_MOUSE : TAP_SLOP),
    label: (t) => (t.m ? 'mouse ' + t.m.id : t.h ? t.h.type + (t.h.id ? ' ' + t.h.id : '') : 'nothing'),
    onNote: (t) => inputNote(t),
    press: (t, x, y) => { if (!t.m) return false; const w = Core.whereIs(G, t.m.id); return !!(w && w.scene === 'main') && dragger.press(t.m, x, y, performance.now()); },
    pressMove: (x, y) => dragger.move(x, y), pressAbort: () => dragger.abort(performance.now()),
    cameraStart: (x, y) => { scene.dragStart(y, x); closeRes(); }, cameraMove: (dy, x, y) => scene.dragBy(dy, y, x), cameraEnd: (v) => scene.dragEnd(v),
    holdMove: (x, y) => dragger.move(x, y),
    holdDrop: (moved) => { if (moved) dragger.release(performance.now()); else dragger.cancel(performance.now(), true); }, // soltarlo sin haberlo llevado a ningún sitio: vuelve, y no abre nada
    holdCancel: () => dragger.cancel(performance.now()),
    tap: (t, x, y) => {
      const r = cv.getBoundingClientRect(); ghost.until = performance.now() + GHOST_MS; ghost.x = r.left + x; ghost.y = r.top + y;
      if (pzOpen() || paused) return; // se abrió algo mientras el dedo estaba puesto: ese toque ya no es para la escena
      closeRes(); scene.tapAt(x, y);
      if (t.m) return tapMouse(t.m, x, y);
      const h = t.h;
      if (!h) return dropMouse();
      if (h.type === 'face') { if (!scene.following && scene.focusedStation !== 'mine') focusSt('mine'); tapMine(); return; } // picar no saca de FOLLOW
      if (h.type === 'station') { dropMouse(true); if (scene.focusedStation !== h.id) focusSt(h.id); return; }
      if (h.type === 'building') return tapBuilding(h.id);
    },
  });
  const pointer = (e) => { const r = cv.getBoundingClientRect(); return { id: e.pointerId, x: e.clientX - r.left, y: e.clientY - r.top, button: e.button, primary: e.isPrimary, kind: e.pointerType }; };
  cv.addEventListener('pointerdown', (e) => { if (gesture.down(pointer(e))) try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
  // En la ventana, no en el lienzo: el final de un dedo tiene que llegar aunque la captura falle o algo se haya abierto encima.
  window.addEventListener('pointermove', (e) => { if (gesture.active) gesture.move(pointer(e)); }, true);
  window.addEventListener('pointerup', (e) => gesture.up(pointer(e)), true);
  window.addEventListener('pointercancel', (e) => gesture.cancel(pointer(e)), true);
  cv.addEventListener('lostpointercapture', (e) => gesture.cancel(pointer(e), 'lost'));
  // Mantener pulsado no debe abrir nada del navegador ni hacer scroll de la página: cortaría el gesto. El clic que seguiría a un toque tampoco hace falta.
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  cv.addEventListener('selectstart', (e) => e.preventDefault());
  cv.addEventListener('touchmove', (e) => { if (gesture.active) e.preventDefault(); }, { passive: false });
  cv.addEventListener('touchend', (e) => { if (e.cancelable) e.preventDefault(); }, { passive: false });
  let wheelT = 0;
  cv.addEventListener('wheel', (e) => { e.preventDefault(); if (gesture.active) return; if (!wheelT) scene.dragStart(); scene.dragBy(-e.deltaY); clearTimeout(wheelT); wheelT = setTimeout(() => { scene.dragEnd(0); wheelT = 0; }, 120); }, { passive: false });

  // ---- Elegir y seguir ----
  // Primer toque: lo elige, WORKERS lo enseña y la cámara le sigue. Segundo toque, sin límite de tiempo: su ficha. Otro ratón: pasa a él, sin abrir nada.
  function tapMouse(m, x, y) {
    if (!byId(m.id)) return;
    if (scene.selectedMouse === m.id) return openPz('card', m.id);
    chooseMouse(m.id); if (scene.selectedMouse === m.id) selSpot = { id: m.id, x, y, t: performance.now() };
  }
  function chooseMouse(id) {
    const n = scene.nodes().find((q) => q.m && q.m.id === id); if (!n || n.px == null) return;
    const w = workOf(n), work = WORK.includes(w); if (work && w !== selected) select(w);
    if (work && !isOpen(pop)) { popBySel = true; openCrew(true); }
    scene.focusMouse(id); if (isOpen(pop)) paintCrew(true);
  }
  // Tocar en vacío lo suelta. keepCam: ya se ocupa de la cámara quien llama.
  function dropMouse(keepCam) {
    const had = scene.selectedMouse; selSpot = null;
    if (!keepCam) scene.release(); else if (had) scene.unpick();
    if (had && popBySel && isOpen(pop)) openCrew(false); else if (isOpen(pop)) paintCrew(true);
    popBySel = false;
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') gesture.reset('hidden'); });
  const tag = document.createElement('button'); tag.className = 'focus-tag'; $('scene-box').appendChild(tag);
  tag.addEventListener('click', () => { const id = scene.selectedMouse; if (id) openPz('card', id); });
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
    if (gesture.state === 'camera' || wheelT || (!scene.following && now - mineMoved < 150)) return;
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
    if (gShown && G.goals[gShown.id] != null && now >= gDoneUntil && !gEl.classList.contains('done')) { gDoneUntil = now + 1300; gEl.classList.add('done'); gEl.classList.remove('min'); $('goal-t').textContent = '✓ ' + gShown.text; { const rw = (REAL.goalRewards || {})[gShown.id]; $('goal-n').textContent = rw ? '+' + fmt(rw) + ' coins' : ''; } return; }
    if (now < gDoneUntil) return;
    const v = Core.view(G).goal;
    // Sin objetivos pendientes, la tira se queda: sigue siendo la entrada a QUESTS.
    if (!v) { if (gShown || gEl.hidden) { gShown = null; gEl.hidden = false; gEl.classList.remove('done', 'min'); gEl.classList.add('in', 'allq'); $('goal-ic').src = NAV_IC.goal; $('goal-t').textContent = 'QUESTS'; $('goal-n').textContent = '✓'; $('goal-bar').style.width = '100%'; } return; }
    gEl.classList.remove('allq');
    const q = v.requires[0], counted = q.need > 1, ps = counted ? fmt(q.cur) + '/' + fmt(q.need) : '';
    if (!gShown || gShown.id !== v.id) { gShown = goalDef(v.id); gChange = now; gEl.hidden = false; gEl.classList.remove('done', 'min'); $('goal-ic').src = NAV_IC.goal; $('goal-t').textContent = v.text; void gEl.offsetWidth; gEl.classList.add('in'); pulse(gEl, 'bump', 320); gProg = '-'; }
    if (ps !== gProg) { gProg = ps; gChange = now; $('goal-n').textContent = ps; $('goal-bar').style.width = counted ? Math.round((100 * q.cur) / q.need) + '%' : '0%'; }
    // Solo se pliega si le queda una cuenta que enseñar: un objetivo sin cuenta plegado era un icono suelto y parecía que se iba.
    gEl.classList.toggle('min', counted && (now - gChange > 7000 || gSqueeze));
  }
  // La tira es el resumen; tocarla abre QUESTS. Llevar al sitio es el botón GO THERE de allí.
  gEl.addEventListener('click', () => openPz('quests'));
  function goToGoal() {
    if (!gShown) return closePz();
    const at = gShown.at;
    if (gShown.id === 'shop') { closePz(); return toMain(() => goBuild('sell')); }
    if (gShown.id === 'house' || gShown.id === 'lab') return goBuild(gShown.id);
    if (at === 'upgrades') { freshUp = false; return openPz('tree', selected); }
    if (at === 'mice') return openPz('mice');
    if (/^recipe/.test(gShown.id) || at === 'lab') return openPz('lab');
    closePz(); toMain(() => { focusSt(at); if (plates[at]) pulse(plates[at], 'bump', 320); });
  }
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
    off = { total: J.total, t0: performance.now(), long: J.total > 30 * 60000, shown: false };
    if (off.long) ensurePz();
    card.innerHTML = '<h1>WELCOME BACK</h1><p>Your colony kept working…</p><div class="bt-load"><i id="bt-bar"></i></div>'; cover.hidden = false;
    return true;
  }
  function offlineStep() {
    const t0 = performance.now(); let left = G.offJob ? G.offJob.left : 0;
    while (left > 0 && performance.now() - t0 < 14) left = Core.offlineRun(G, 300000);
    const b = $('bt-bar'), p = (off.total - left) / Math.max(1, off.total); if (b) b.style.width = Math.round(100 * p) + '%';
    if (off.long && PZ.ready) { try { if (!off.shown) { off.shown = true; cover.hidden = true; pzWin().SHEETS.welcomeCatch(dur(off.total)); } pzWin().SHEETS.welcomeProgress(p); } catch (e) { console.warn(e); } }
    if (left > 0) return;
    const S = Core.offlineEnd(G); off = null; cover.hidden = true; rev += 1;
    syncSim(); syncCrew(); syncWorld(); saveNow(); Core.drain(G);
    welcomeV = welcomeData(S); flushWelcome();
  }
  // El resumen de vuelta, con lo que dice el núcleo: nada se calcula aquí ni se cuenta dos veces.
  let welcomeV = null;
  function welcomeData(S) {
    const T = REAL.mice.traits, name = (id) => { const m = G.roster.find((x) => x.id === id); return m ? m.name : ''; }, t = tierNow();
    const legs = [], grew = {}, legacy = [], news = [];
    for (const e of S.notes || []) {
      if ((e.type === 'trait' || e.type === 'specialty') && T[e.trait]) { if (T[e.trait].kind === 'legend') legs.push({ k: 'leg', name: esc(name(e.id)), trait: T[e.trait].name, desc: T[e.trait].desc }); else (grew[name(e.id)] = grew[name(e.id)] || []).push(T[e.trait].name); }
      if (e.type === 'careDone') legacy.push(esc(name(e.id)) + (e.kind === 'quirk' ? ' got over <b class="tok">' + T[e.what].name + '</b>' : ' finished retraining: now <b class="tok">' + T[e.to].name + '</b>'));
    }
    news.push(...legs);
    if (S.depth) legacy.unshift('The colony dug <b>' + S.depth + '</b> level' + (S.depth > 1 ? 's' : '') + ' deeper, to depth <b>' + G.s.depth + '</b>');
    if (S.recipes) legacy.push('<b>' + S.recipes + '</b> new recipe' + (S.recipes > 1 ? 's' : '') + ' discovered in the lab');
    for (const id of Object.keys(S.items || {})) legacy.push('<b>+' + fmt(S.items[id]) + '</b> ' + esc(Inv.card(G, id).name));
    const mins = Math.round((S.ms + S.lost) / 60000);
    if (S.wheels) legacy.push('<b>' + S.wheels + '</b> Grand Wheel' + (S.wheels > 1 ? 's' : ''));
    const skills = S.levels ? WORK.filter((st) => G.stLv[st] > S.levels[st]).map((st) => [NAME[st], S.levels[st], G.stLv[st]]) : [];
    const ups = (S.miceFrom || []).map(([id, lv]) => { const m = G.roster.find((x) => x.id === id); return m ? { name: m.name, from: lv, to: Cr.level(m), d: Cr.level(m) - lv } : null; }).filter((x) => x && x.d > 0).sort((a, b) => b.d - a.d);
    return {
      away: mins < 1 ? 'under a minute' : mins >= 120 ? Math.round(mins / 60) + ' h' : mins + ' min', capped: S.lost > 0 ? Math.round(S.ms / 3600000) : 0, zone: t, coins: S.coins, raw: S.raw, base: S.base, lots: S.lots, sold: S.sold || 0, wheels: 0, wheelLots: 0, veins: S.depth || 0,
      news, legacy, grew: Object.keys(grew).map((k) => [esc(k), grew[k]]), ups: ups.length === 1 ? { n: 1, name: esc(ups[0].name), from: ups[0].from, to: ups[0].to } : { n: ups.length, top: ups[0] ? esc(ups[0].name) : '' }, grades: 0, skills, nothing: !(S.coins > 0 || S.raw > 0 || S.base > 0 || S.lots > 0 || S.depth > 0 || legacy.length || news.length),
    };
  }
  function flushWelcome() {
    if (!welcomeV) return;
    if (!PZ.fr) ensurePz();
    if (!PZ.ready) return;
    const v = welcomeV; welcomeV = null;
    if (v.nothing && !v.capped) return;
    try { pzWin().SHEETS.welcomeSummary(v); } catch (e) { console.warn(e); toast('Your colony kept working while you were away'); closePz(true); }
  }
  function startCover() {
    if (brokenSave) card.innerHTML = '<h1>CHEESE DRILLER</h1><p>This save could not be read. It has been kept aside on this device, not deleted.</p><button class="bx bt-main" id="bt-new">START A NEW COLONY</button>';
    else card.innerHTML = '<h1>CHEESE DRILLER</h1><p>Beta. Build a colony of mice that dig, drill, refine, cook and sell cheese.</p><p>' + (store ? 'Your colony is saved on this device and browser.' : 'This browser is not allowing saves: your colony will be lost when you close it.') + '</p><button class="bx bt-main" id="bt-new">START NEW COLONY</button>';
    cover.hidden = false;
    $('bt-new').addEventListener('click', () => { paused = false; cover.hidden = true; lastReal = Date.now(); saveNow(); });
  }

  // ---- Bucle ----
  let last = performance.now(), hudSig = '', slow = 0, lastReal = loadedSave ? loadedSave.savedAt : Date.now(), nextSave = 0;
  // Lo que el núcleo no anuncia con un evento: recetas, quesos y cepas nuevas se ven en cuanto aparecen.
  const labSeen = { known: G.lab.known.length, styles: Object.keys(G.lab.styles).length, strains: {} };
  for (const k of Object.keys(G.lab.strainsOf || {})) labSeen.strains[k] = G.lab.strainsOf[k].length;
  function watchLab() {
    const L = G.lab;
    if (L.known.length > labSeen.known) { toast('New recipe: ' + recipeName(L.known[L.known.length - 1])); labSeen.known = L.known.length; }
    const st = Object.keys(L.styles).length; if (st > labSeen.styles) { labSeen.styles = st; toast('New cheese to research!'); }
    for (const k of Object.keys(L.strainsOf || {})) { const n = L.strainsOf[k].length; if (n > (labSeen.strains[k] || 0)) { labSeen.strains[k] = n; if (PZ.ready) try { pzWin().SHEETS.strainFound(k, L.strainsOf[k][n - 1]); } catch (e) { console.warn(e); } toast('New strain found: compare it in LAB'); } }
  }
  let scenes = null;
  const toMain = (fn) => (scenes.current === 'main' ? fn() : scenes.go('main', fn));
  let revAt = 0, lastDraw = 0, boostAfter = 0, boostCalm = 0, lastFrameAt = 0;
  const boostSettled = (now) => { if (!boostAfter) return true; boostCalm = now - lastFrameAt < 40 ? boostCalm + 1 : 0; if (boostCalm >= 3 || performance.now() - boostAfter > 500) { boostAfter = 0; boostCalm = 0; return true; } return false; };
  const COVERED_MS = 66;
  // ---- Avisos de máquina: la placa aprobada (.ad-warn y su colocación, labelLayer) con lo que le falta de verdad ----
  // Ámbar si lo que falta ya viene de camino; roja si no viene. Sale al segundo y medio de faltar y se va a los 0,8 s de volver, para no parpadear.
  const lbHost = document.createElement('div'); lbHost.className = 'lb-host'; $('scene-box').appendChild(lbHost);
  const screenOf = () => { const sb = $('scene-box').getBoundingClientRect(), cr = $('cv').getBoundingClientRect(); return [cr.left - sb.left, cr.top - sb.top, sb]; };
  const LBL = CM.art.labelLayer(lbHost, {
    k: 1,
    view: () => [0, 0, $('scene-box').clientWidth, $('scene-box').clientHeight],
    keepOut: () => { const [, , sb] = screenOf(), out = []; for (const el of document.querySelectorAll('.hud > .bx, #goal:not([hidden]), #home-btn.in, #plates > *')) { if (el.style.visibility === 'hidden' || el.hidden) continue; const r = el.getBoundingClientRect(); if (r.width) out.push([r.left - sb.left, r.top - sb.top, r.width, r.height]); } return out; },
    mice: () => { const [ox, oy] = screenOf(), out = []; for (const n of scene.nodes()) { if (!n.crew || n.px == null || n.inside) continue; const [ax, ay] = scene.toScreen(n.px, n.py - 20), [bx, by] = scene.toScreen(n.px + 22, n.py); out.push([n.key, ox + ax, oy + ay, bx - ax, by - ay]); } return out; },
  });
  const alertWant = {}, ALERT_POST = { drill: 'operator', refine: 'stoker', cheese: 'mixer', sell: 'keeper' };
  function alertOf(st) {
    const s = G.s; if (!s.built[st] || s.job[st]) return null;
    const r = s.rates, t = tierNow();
    if (st === 'drill') return !s.vein.open && !r.mine.auto ? { text: 'NO VEIN', tone: 'red', icon: 'ic_raw_' + t } : null;
    if (st === 'refine') return s.inv.raw < REAL.refinery.rawPerBase ? { text: 'NO RAW', tone: s.job.drill || (r.drill.auto && s.vein.open) ? 'amber' : 'red', icon: 'ic_raw_' + t } : null;
    if (st === 'cheese') {
      const f = Mo.formula(Mo.currentKey(s)), pm = Mo.productMods(s, Mo.currentKey(s)), need = REAL.cheesery.lotBase * (pm && pm.base ? pm.base : 1) + (s.labWant || 0);
      if (s.inv.base < need) return { text: 'NO BASE', tone: s.job.refine || (r.refine.auto && s.inv.raw >= REAL.refinery.rawPerBase) ? 'amber' : 'red', icon: 'ic_base_' + t };
      return s.coins < f.coin ? { text: 'NO COINS', tone: 'red', icon: 'ic_coin' } : null;
    }
    if (st === 'sell') return Mo.lotsTotal(s) <= 0 ? { text: 'NO CHEESE', tone: s.job.cheese || r.cheese.auto ? 'amber' : 'red', icon: 'ic_lot_' + t } : null;
    return null;
  }
  function alertsTick(now) {
    const [ox, oy] = screenOf(); let any = false;
    for (const st of ['drill', 'refine', 'cheese', 'sell']) {
      const a = alertOf(st); let w = alertWant[st];
      if (a) { if (!w || w.text !== a.text) w = alertWant[st] = Object.assign({ t0: now, shown: w && w.shown }, a); else { w.tone = a.tone; w.off = 0; } }
      else if (w && !w.off) w.off = now;
      if (!w) continue;
      if (w.off && now - w.off > 800) { delete alertWant[st]; LBL.unwarn(st); continue; }
      any = true;
      if (!w.shown && now - w.t0 < 1500) continue;
      const q = scene.posts().find((p) => p.st === st && p.role === ALERT_POST[st]); if (!q) continue;
      w.shown = true;
      const [x, y] = scene.toScreen(q.x + 11, q.feet - 26); // cuelga de donde trabaja el principal, junto a su máquina
      LBL.warn(st, { tone: w.tone, icon: icd(w.icon), text: w.text, anchor: [ox + x, oy + y] });
    }
    if (any || LBL.plates.size) LBL.tick(now);
  }
  // Lo que dibuja MAIN en cada fotograma. Solo se llama con MAIN a la vista.
  function mainFrame(now) {
    // Lo pendiente de los refuerzos sale con la escena ya estable: justo al cerrar la hoja, el móvil pierde fotogramas y se comería la animación.
    if (!pzOpen() && boostSettled(now)) flushBoost();
    lastFrameAt = now;
    rushTick(now);
    // Con una hoja delante, la escena queda tapada y atenuada: se pinta menos para que la hoja vaya fluida en el móvil (mismo hilo).
    if (!pzOpen() || now - lastDraw >= COVERED_MS) {
      lastDraw = now; scene.draw(now);
      placePlates(); placeSigns(); dragger.render(performance.now());
      alertsTick(now);
    }
    homeTick();
    paintPanel(false); paintTag(now);
  }
  function tick(now) {
    if (now - revAt > 200) { revAt = now; rev += 1; watchLab(); }
    const real = Date.now(), elapsed = Math.max(0, real - lastReal); lastReal = real;
    if (off) offlineStep();
    else if (!paused) { if (elapsed >= OFFLINE_MIN && beginOffline(elapsed)) {} else if (elapsed > 0 && elapsed < OFFLINE_MIN) Core.advance(G, elapsed); }
    syncSim(); processEvents(); dragger.step(performance.now()); syncCrew(); dragger.settle(); restoreCam(); syncWorld();
    goalTick(now);
    scenes.frame(now);
    const s = G.s, t = tierNow(), sig = [fmt(s.coins), fmt(income()), s.depth, t, s.vein.open, Math.floor((100 * (s.vein.open ? s.vein.left / Math.max(1, s.vein.cap) : s.vein.found / Math.max(1e-9, s.vein.need))))].join('|');
    if (sig !== hudSig) {
      hudSig = sig;
      $('hud-coins').textContent = fmt(s.coins); $('hud-rate').textContent = '+' + fmt(income()) + '/min';
      $('hud-depth').textContent = 'DEPTH ' + s.depth; $('hud-tier').textContent = t.toUpperCase(); $('hud-tieric').src = icd('ic_raw_' + t);
      $('hud-depthbar').style.width = Math.round(100 * (s.vein.open ? s.vein.left / Math.max(1, s.vein.cap) : s.vein.found / Math.max(1e-9, s.vein.need))) + '%';
      $('hud-depthbox').classList.toggle('vein', s.vein.open);
    }
    if (now - slow > 400) {
      slow = now; if (scenes.current === 'main') goalPlace(now); perfPaint(); for (const k of Object.keys(madeLog)) rate(k);
      if (isOpen(pop)) paintCrew(false); if (isOpen(res)) paintRes();
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

  // ---- Espacios: HOUSE ← MAIN → LAB (scenes.js). Una colonia y un avance, el de tick(); cada escena solo la dibuja ----
  // MAIN conserva cámara, selección y FOLLOW en la propia escena: no se rehace nunca, solo deja de dibujarse. HOUSE y LAB aún no tienen contenido:
  // sus edificios siguen abriendo sus paneles y solo se entra en ellas con ?scenes, para comprobar la arquitectura.
  const SCENE_DEV = /[?&]scenes\b/.test(location.search);
  const sceneHost = document.createElement('div'); sceneHost.className = 'scene-host'; sceneHost.hidden = true; $('scene-box').appendChild(sceneHost);
  const veil = document.createElement('div'); veil.className = 'scene-veil'; veil.hidden = true; $('scene-box').appendChild(veil);
  // El velo va por pasos, como el resto del pixel art, y del color de los paneles: nunca una pantalla negra.
  const paintVeil = (a) => { const q = Math.ceil(a * 4) / 4; veil.hidden = q <= 0; veil.style.opacity = String(q); $('p0').classList.toggle('scene-fading', q > 0); $('p0').style.setProperty('--veil', String(q)); };
  scenes = window.BetaScenes({
    fadeMs: RM() ? 0 : 130, veil: paintVeil, onError: (e, id) => console.error('scene ' + id, e),
    onChange: (to) => { $('p0').dataset.scene = to; paintSceneDev(); },
  });
  let mainShown = false;
  scenes.register('main', {
    keep: true, content: true, frame: mainFrame,
    enter() {
      syncSim(); syncCrew(); plateSig = ''; hudSig = ''; paintPanel(true); if (isOpen(pop)) paintCrew(true);
      if (mainShown) { const now = performance.now(); lastDraw = now; scene.draw(now); placePlates(); placeSigns(); } // ya dibujada detrás del velo: al retirarse, nada salta
      mainShown = true;
    },
    leave() { gesture.reset('scene'); dragger.cancel(performance.now()); closeRes(); scene.bubbles().clear(); }, // lo que tuviera en la mano vuelve a su sitio; ningún globo sobrevive a la salida
  });
  const probeApi = { host: sceneHost, dev: () => SCENE_DEV, colony: () => G, Core, fmt };
  scenes.register('house', window.BetaProbe('house', probeApi)).register('lab', window.BetaProbe('lab', probeApi));
  function paintSceneDev() { const d = $('scene-dev'); if (d) for (const b of d.children) b.classList.toggle('on', b.dataset.go === scenes.current); }
  if (SCENE_DEV) {
    const d = document.createElement('div'); d.id = 'scene-dev'; d.className = 'scene-dev';
    d.innerHTML = ['house', 'main', 'lab'].map((id) => '<button class="bx" data-go="' + id + '">' + id.toUpperCase() + '</button>').join('');
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) scenes.go(b.dataset.go); });
    $('scene-box').appendChild(d);
  }
  $('p0').dataset.scene = scenes.start(SCENE_DEV ? (location.search.match(/[?&]scene=(\w+)/) || [])[1] : 'main');
  paintSceneDev();
  requestAnimationFrame(frame);
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') window.BETA = { get G() { return G; }, get dragger() { return dragger; }, sim, scene, stationSeen, boostPend, pick: chooseMouse, gesture, isGhost, get scenes() { return scenes; }, save: saveNow, sync: () => { syncSim(); syncCrew(); }, act: doAct, tick, focus: focusSt };
})();
