// CHEESE DRILLER · BETA · La capa de hojas: abrir y cerrar con las transiciones aprobadas, resolver cada toque con una acción del núcleo,
// repintar solo lo que cambia y las ventanas (ascensos, ficha de objeto, resumen de vuelta, legendarios). Nada de esto guarda estado de
// la partida: si la capa no cargara, el juego seguiría igual debajo.
(function () {
  const H = window.H, B = CM.BALANCE, $ = (id) => document.getElementById(id), P = CM.panels, K = CM.mice;
  const G = () => H.G;
  const STOF = CM.STOF;
  const ui = (CM.uiState = {
    panel: null, tree: 'mine', miceView: 'rocks', miceTab: '', card: null, pick: null, moveSel: null, cardSec: {}, rockOpen: {}, comboOpen: {}, combo: { base: 'cheddar', ingredient: 'herbs', treatment: 'washed', maturation: 'fresh' },
    cheeseView: 'lines', cheeseLine: 'line', bookBase: null, bookRow: null, labTab: 'recipes', labHand: null, labDirOpen: false, labDirCat: null, promo: {}, promoDone: null, promoRite: null, boSlot: {}, found: null, lastMove: null, houseRoom: 'bed', trainSel: null,
  });
  const toastEl = $('toast');
  let toastT = 0;
  // Con una hoja abierta el aviso sale aquí, encima de ella; si no, en MAIN.
  const toast = (t, good) => {
    if ($('sheet').hidden && $('modal').hidden) return H.toastIn(t);
    toastEl.textContent = t; toastEl.classList.add('show'); toastEl.classList.toggle('good', !!good);
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };
  const FAIL = { 'no-coins': 'Not enough coins', locked: 'Not available yet', 'no-materials': 'Not enough materials', 'queue-full': 'The lab queue is full', 'bed-busy': 'The house is busy', 'no-house': 'Build the Mouse House first', 'not-built': 'Build it first', full: 'Two boosts at most', 'none-free': 'No free boost: take one off another station first', done: 'Already done', same: 'That mouse is already there', invalid: 'That is not possible' };
  const report = (r) => { if (r && r.ok === false) toast(FAIL[r.reason] || 'Not possible right now'); return r; };
  const act = (type, args) => report(H.act(type, args));
  // Mover: siempre por Core (el mismo estado que el arrastre de MAIN). Se recuerda cómo estaba para poder deshacerlo.
  function snapshot() { return G().s.placed.map((p) => ({ id: p.m.id, st: p.st, role: p.role })).concat(G().lab.workers.map((id) => ({ id, st: 'lab' }))); }
  function restore(list) { for (const m of G().roster) H.act('unassign', { id: m.id }); for (const a of list) H.act('assign', a); }
  function placeMouse(id, key) {
    const before = snapshot(), w = H.Core.whereIs(G(), id);
    let r;
    if (!key) r = H.act('unassign', { id });
    else {
      const [skill, role] = key.split(':');
      if (skill === 'research') r = H.act('assign', { id, st: 'lab' });
      else if (w && w.scene === 'main') r = H.act('move', { id, st: STOF[skill], role });
      else {
        // Desde la casa o el LAB: si el puesto estaba ocupado, el que estaba va adonde estaba este (o a la casa).
        r = H.act('assign', { id, st: STOF[skill], role });
      }
    }
    if (r && r.ok) { ui.lastMove = before; ui.moveSel = null; }
    return report(r);
  }
  const close = () => leave();
  const ACTS = {
    close, noop() {},
    treetab(t) { ui.tree = t; },
    open(name) { ui.labView = null; openPanel(name); },
    questgo() { H.questGo(); },
    questall() { ui.questAll = !ui.questAll; },
    tree(t) { ui.tree = t; openPanel('tree'); },
    book() { openPanel('cheese'); ui.cheeseView = 'book'; },
    build(id) { const r = act('build', { id }); if (r.ok) { toast((id === 'house' ? 'Mouse House' : 'Cheese Lab') + ' built!', true); H.afterBuild(id); leave(); } },
    recruit() { ui.cand = -1; const r = act('recruitOffer', {}); if (r.ok) { ui.miceTab = 'recruit'; top(); } },
    recruitfor(skill, zone) { ui.cand = -1; const r = act('recruitOffer', { forPost: { st: STOF[skill] || 'lab', role: zone } }); if (r.ok) { ui.miceTab = 'recruit'; top(); } },
    recruitview() { ui.miceTab = G().cands.length ? 'recruit' : ''; top(); },
    recruitlater() { ui.miceTab = ''; },
    // Sin vacante pedida, el nuevo llega sin puesto y se ve su ficha: desde ahí se decide. Nada entra solo en modo de colocar.
    choose(i) { ui.cand = -1; ui.pick = null; ui.card = null; ui.miceTab = ''; ui.moveSel = null; const r = act('recruitChoose', { index: +i }); const nm = r.ok && K.byId(null, r.id); if (nm && !nm.post) { ui.miceView = 'rocks'; ui.card = nm.id; ui.cardSec = {}; top(); } },
    cand(i) { ui.cand = +i; },
    bestfit() { const before = snapshot(), r = act('bestFit', {}); if (r.ok) { if (r.moved) ui.lastMove = before; toast(r.moved ? 'BEST FIT moved ' + r.moved + (r.moved === 1 ? ' mouse' : ' mice') + (r.gain > 1.005 ? ': about +' + Math.round((r.gain - 1) * 100) + '% coins' : '') : 'No better line-up found: your mice stay where they are', true); } },
    pickpost(skill, zone) { const key = skill + ':' + zone; top(); ui.pick = ui.pick === key ? null : key; },
    pickmouse(id) { ui.moveBack = ui.card === id ? id : null; ui.card = null; ui.pick = null; ui.cardHome = ui.moveBack ? ui.cardHome : false; ui.miceTab = ''; ui.miceView = 'rocks'; ui.moveSel = id; top(); },
    housego(room) { ui.miceView = 'house'; ui.houseRoom = room; ui.trainSel = null; ui.pick = null; ui.moveSel = null; top(); },
    // Cancelar no cambia nada y devuelve a donde se estaba.
    movecancel() { ui.moveSel = null; if (ui.moveBack) ui.card = ui.moveBack; ui.moveBack = null; },
    moveto(skill, zone) { const id = ui.moveSel; ui.moveSel = null; ui.moveBack = null; ui.cardHome = false; return placeMouse(id, skill + ':' + zone); },
    unpick() { ui.pick = null; },
    miceview(v) { ui.miceView = v; ui.card = null; ui.cardHome = false; ui.pick = null; ui.moveSel = null; ui.moveBack = null; top(); },
    rocktoggle(st) { const o = ui.rockOpen[st] !== undefined ? ui.rockOpen[st] : true; ui.rockOpen[st] = !o; },
    rosteropts() { ui.rosterOpts = !ui.rosterOpts; },
    combotoggle(st) { ui.comboOpen[st] = !ui.comboOpen[st]; },
    rosterfilter(v) { ui.miceView = 'roster'; ui.miceShow = v; ui.pick = null; },
    rosterclear() { ui.miceShow = 'all'; ui.miceLikes = ''; },
    rosterlikes(job) { ui.miceLikes = ui.miceLikes === job ? '' : job; },
    micesort(v) { ui.miceSort = v; },
    sec(id) { const def = { traits: true, specs: false, combos: false, rank: false }[id]; ui.cardSec[id] = !(ui.cardSec[id] !== undefined ? ui.cardSec[id] : def); },
    card(id) { ui.card = id; ui.cardSec = {}; top(); }, // desde el selector de puesto, BACK vuelve a él
    back() { if (ui.cardHome) { ui.cardHome = false; return leave(); } ui.card = null; },
    post(id, skill, zone) { const r = placeMouse(id, skill ? skill + ':' + zone : ''); if (r && r.ok && !(ui.pick && skill)) ui.pick = null; ui.card = null; ui.moveBack = null; },
    undomove() { if (!ui.lastMove) return; const l = ui.lastMove; ui.lastMove = null; restore(l); toast('Move undone', true); },
    promote(id) { act('promote', { id }); },
    promos() { ui.miceTab = 'promos'; ui.promo = K.promotePicks(null, 'afford'); ui.promoDone = null; },
    promoback() { ui.miceTab = ''; },
    promosel(id) { const m = K.byId(null, id), st = m ? K.promoteSteps(null, m) : []; if (!st.length) return; if (ui.promo[id]) delete ui.promo[id]; else ui.promo[id] = st[st.length - 1].rank; },
    promoset(mode) { ui.promo = mode === 'none' ? {} : K.promotePicks(null, mode); },
    promogo() {
      const before = {}; for (const m of G().roster) before[m.id] = m.rank || 0;
      const r = act('promoteMany', { picks: ui.promo }); if (!r.ok) return;
      ui.promoDone = { mice: r.mice, steps: r.steps, cost: r.cost, managers: G().roster.filter((m) => m.rank >= 3 && before[m.id] < 3).length };
      ui.promo = {};
      const list = G().roster.filter((m) => m.rank > before[m.id]).map((m) => ({ id: m.id, from: before[m.id], to: m.rank })).sort((a, b) => a.to - b.to);
      ui.promoRite = { at: performance.now(), list };
    },
    care(id, kind, what) { const r = act('care', { id, kind, what }); if (r.ok && kind === 'spec') { ui.trainSel = null; ui.houseRoom = 'training'; top(); } },
    cardtrain(id, what) { act('care', { id, kind: 'spec', what }); },
    houseroom(r) { ui.houseRoom = r; ui.trainSel = null; },
    bedall() { ui.bedAll = !ui.bedAll; }, trainall() { ui.trainAll = !ui.trainAll; }, newsall() { ui.newsAll = !ui.newsAll; },
    trainsel(id) { ui.trainSel = ui.trainSel && ui.trainSel.id === id ? null : { id, job: '' }; },
    trainjob(id, job) { ui.trainSel = { id, job: job || '' }; },
    album() { ui.miceTab = ui.miceTab === 'album' ? '' : 'album'; top(); },
    dismiss(id) { const m = K.byId(null, id); if (!m) return; showModal('<div class="mx-mn-layer"><div class="mx-box mx-mn-win mx-bad"><div class="mx-mn-wh"><b>DISMISS ' + P.esc(m.name).toUpperCase() + '?</b></div><p>For good, with no refund. The price of recruiting does not go down.</p><div class="mx-mn-bts"><button class="mx-act" data-m="no">KEEP</button><button class="mx-act mx-mn-red" data-m="ok">DISMISS</button></div></div></div>', { ok() { const r = act('dismiss', { id }); if (r.ok) { ui.card = null; repaint(); } } }); },
    managers() { act('setting', { key: 'managersBuy', value: !G().settings.managersBuy }); },
    namemaster(id) { const r = act('setMaster', { id }); if (r.ok) { const m = K.byId(null, id); if (m && CM.pmice.gmNamed) CM.pmice.gmNamed(m, ''); } },
    cview(name) { ui.cheeseView = name; ui.bookRow = null; top(); },
    cline() { ui.cheeseLine = ui.cheeseLine === '' ? 'line' : ''; },
    bookbase(b) { ui.cheeseView = 'book'; ui.bookBase = b; ui.bookRow = null; top(); },
    bookrow(id) { ui.bookRow = ui.bookRow === id ? null : id; },
    cook(id) { act('recipePin', { key: id }); },
    uncook() { act('recipePin', {}); },
    cheeseTap() { H.act('tap', { st: 'cheese' }); }, // tocar justo entre dos hornadas no hace nada ni avisa de nada
    staffpost(skill, zone) { openPanel('mice'); ui.pick = skill + ':' + zone; },
    researcher() { openPanel('mice'); if (G().lab.nodes.assistant) ui.pick = 'research:all'; },
    labtab(name) { ui.labTab = name; },
    labdiropen() { ui.labDirOpen = !ui.labDirOpen; ui.labDirCat = null; },
    labdircat(c) { ui.labDirCat = c; },
    labhand() { ui.labHand = !(ui.labHand === null || ui.labHand === undefined ? !H.Lb.worker(G()) : ui.labHand); },
    labdir(kind, id) { const dir = kind === 'none' ? '' : id ? kind + ':' + id : kind; act('labDir', { dir: G().lab.dir === dir ? '' : dir }); ui.labDirOpen = false; },
    labcancel() { act('labCancel', {}); },
    pick(part, value) { ui.combo[part] = value; },
    experiment() { act('labResearch', { key: CM.cheesery.keyOf(ui.combo) }); },
    strainrecipe(id) { ui.strainRecipe = id; },
    strainfind(id) { act('labCulture', { key: id }); },
    strain(key, id) { const r = act('strain', { key, id: id === 'plain' ? '' : id }); if (r.ok) ui.found = null; },
    strainkeep() { ui.found = null; },
    study(style) { act('labStudy', { style }); },
    blueprint(id) { act('labBlueprint', { id }); },
    item(id) { showModal(P.itemCard(id), { ok() {} }); },
    help(id) { showHelp(id); },
    buy(id, ev, el) { const r = el ? el.getBoundingClientRect() : null; report(CM.skilltree.buy(id, ui, r)); },
    switch(id) { report(CM.skilltree.switch(id, ui)); },
    sky(v) { H.setSky(v); },
    export() { const text = H.exportSave(); showModal(CM.pmenu.win('export', { bytes: text.length }).replace('A file was downloaded. You can also copy the text:', 'Copy this text and keep it safe:'), { ok() {} }); const ta = $('io-text'); if (ta) ta.value = text; },
    import() { showModal(CM.pmenu.win('import', {}), { ok() { const t = $('io-text').value.trim(); if (!H.importSave(t)) { CM.pmenu.importError('That is not a save of this game.'); return false; } } }); },
    reset() { showModal(CM.pmenu.win('reset', { lose: 'This beta colony. Other games are not touched.' }), { ok() { H.newGame(); } }); },
  };
  CM.ui = {
    state: () => CM.viewState,
    uiState: () => ui,
    openPanel: (n) => openPanel(n),
    act(name, ...a) { const f = ACTS[name]; if (f) f(...a); repaint(); },
    toast,
    // pulido-boosts.js cambia las gemas en su sitio con estas dos acciones.
    // Y deja la hoja marcada como pintada con el estado nuevo: si no, el repintado siguiente rehacía las gemas a media animación.
    quiet(name, sk, z, i) { const r = quietAct(name, sk, z, i); if (ui.panel) lastHtml = P.render(ui.panel, CM.viewState, ui); return r; },
  };
  function quietAct(name, sk, z, i) {
      if (name === 'boostclear') { for (const st of CM.ST) while (G().boosts.place[st] > 0) H.act('boostRemove', { st }); return { ok: true }; }
      if (name === 'boslot') {
        const key = sk + ':' + z, st = STOF[sk], j = +i, n = G().boosts.place[st] || 0;
        const occ = n >= 2 ? [true, true] : n <= 0 ? [false, false] : (ui.boSlot[key] || 0) === 1 ? [false, true] : [true, false];
        if (occ[j]) { const r = H.act('boostRemove', { st }); if (r.ok) ui.boSlot[key] = 1 - j; return report(r); }
        const r = H.act('boostPlace', { st }); if (r.ok && n === 0) ui.boSlot[key] = j; return report(r);
      }
      return { ok: false };
  }
  const top = () => { $('sheet-body').scrollTop = 0; };

  // ---- Pintar ----
  // El panel no se rehace con el dedo encima, justo al levantarlo (el navegador manda el toque después y su botón ya no estaría) ni mientras se desplaza.
  let lastHtml = '', touching = false, calmAt = 0, drag = { src: null }, quietUntil = 0;
  const holdRepaint = (ms) => { quietUntil = Math.max(quietUntil, performance.now() + ms); };
  const CALM = { stock: 1, shopinfo: 1, coins: 1 };
  function mountAll(b) {
    for (const f of [CM.pmice, CM.pcheese, CM.plab, CM.pboosts, CM.pecon, CM.pmenu]) { try { if (f) f.mount(b); } catch (e) { console.error(e); } }
    if (ui.panel === 'tree') CM.skilltree.mount(b, ui);
  }
  function repaint(tick) {
    if (!ui.panel || drag.src) return;
    if (tick && (touching || performance.now() < quietUntil)) return;
    if (tick && CALM[ui.panel] && performance.now() - calmAt < 1500) return;
    let html;
    try { html = P.render(ui.panel, CM.viewState, ui); } catch (e) { console.error(e); if (!tick) toast('That panel could not be drawn'); return; }
    if (html !== lastHtml) {
      lastHtml = html; calmAt = performance.now(); helpButton();
      const b = $('sheet-body'); b.innerHTML = html; mountAll(b);
    } else if (ui.panel === 'tree') CM.skilltree.tick(ui);
    paintBars();
  }
  // Las barras que corren solas (cocinado, investigación), sin repintar la hoja.
  function paintBars() {
    const j = G().s.job.cheese, bar = document.querySelector('#sheet-body [data-job="cook:line"]');
    if (ui.panel === 'cheese' && document.querySelector('#sheet-body .mx-ch-line')) {
      const v = P.cheeseLive();
      for (const el of document.querySelectorAll('#sheet-body [data-live]')) { if (v.held && el.dataset.live === 'text' && el.textContent) continue; const t = v[el.dataset.live]; if (t != null && el.textContent !== t) el.textContent = t; }
      for (const el of document.querySelectorAll('#sheet-body [data-live-w]')) el.style.width = v.pct + '%';
      if (bar && v.held) bar.style.width = '100%';
    }
    if (bar && j) bar.style.width = Math.min(100, (100 * (1 - (j.end - G().s.t) / j.total))).toFixed(1) + '%';
    const lb = document.querySelector('#sheet-body [data-labbar]'), L = G().lab.job;
    if (lb && L) lb.style.width = Math.round((1 - L.remaining / L.total) * 100) + '%';
    const xp = document.querySelector('#sheet-body [data-xp]');
    if (xp) { const m = K.byId(null, xp.dataset.xp), p = m && K.xpProgress(m), bar2 = document.querySelector('#sheet-body [data-xpw]'); if (p) { const t = p.maxed ? 'MAX' : CM.fmt(Math.floor(p.cur)) + ' / ' + CM.fmt(Math.floor(p.need)) + ' XP'; if (xp.textContent !== t) xp.textContent = t; if (bar2) bar2.style.width = (p.maxed ? 100 : Math.round((p.cur / p.need) * 100)) + '%'; } }
    for (const t of document.querySelectorAll('#sheet-body [data-gwt]')) { const every = B.milestones.wheel.everyMs; t.textContent = Math.max(0, Math.ceil((every - (G().s.wheelMs || 0)) / 60000)) + 'm'; }
  }
  const TITLE_IC = {
    mice: () => CM.pmice.ic('head', 2), options: () => CM.pmenu.ic('gear').replace('<canvas', '<canvas style="margin-top:3px"'),
    stock: () => '<canvas class="pix" data-pnic="pantry" style="margin-top:3px"></canvas>', shopinfo: () => '<canvas class="pix" data-pnic="shop" style="margin-top:3px"></canvas>', coins: () => '<canvas class="pix" data-pnic="coins" style="margin-top:3px"></canvas>',
    boosts: () => '<canvas class="pix" data-boic="gem" data-k="3" style="margin-top:1px"></canvas>',
    quests: () => '<img class="pix" alt="" src="' + H.questIcon + '" style="width:20px;height:20px;margin-top:1px">',
    lab: () => '<img class="pix" alt="" src="assets/main2/out/sprites/ic_flask.png" style="width:22px;height:24px">', cheese: () => '<img class="pix" alt="" src="assets/main2/out/sprites/ic_lot_cheddar.png" style="width:30px;height:26px">',
  };
  function openPanel(name) {
    if (name === 'cheese') { ui.cheeseView = 'lines'; ui.cheeseLine = 'line'; ui.bookBase = null; ui.bookRow = null; }
    if (name === 'mice') { ui.pick = null; ui.card = null; ui.cardHome = false; ui.moveBack = null; ui.miceTab = ''; ui.moveSel = null; ui.cardSec = {}; ui.rosterOpts = false; }
    if (name === 'lab') { ui.labDirOpen = false; ui.labDirCat = null; ui.labHand = null; if (ui.found) ui.labTab = 'strains'; }
    ui.panel = name; lastHtml = '';
    $('sheet').dataset.panel = name;
    const t = $('sheet-title'); t.textContent = P.title(name, ui);
    if (TITLE_IC[name]) t.insertAdjacentHTML('afterbegin', TITLE_IC[name]());
    helpButton();
    $('sheet').hidden = false;
    top();
    repaint();
    swapFx();
  }
  // ---- Transiciones (las de P1) ----
  const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  function rise(body, delay) { if (RM() || !body.animate) return; [...body.children].filter((el) => el.offsetParent !== null).slice(0, 8).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: delay + i * 28, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'backwards' })); }
  const viewKey = () => [ui.panel, ui.miceView, ui.miceTab, ui.card, ui.tree, ui.cheeseView, ui.pick, ui.labTab].join('|');
  let lastView = '', opening = false, closing = 0;
  function swapFx() { const b = $('sheet-body'); if (opening || !$('sheet').classList.contains('p1-in')) return; const k = viewKey(); if (k === lastView) return; lastView = k; if (!RM() && b.animate) b.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 170, easing: 'cubic-bezier(.2, .8, .2, 1)' }); }
  function enter() { const sh = $('sheet'); if (sh.hidden || sh.classList.contains('p1-in')) return; sh.classList.remove('p1-out'); void sh.offsetWidth; sh.classList.add('p1-in'); rise($('sheet-body'), 110); lastView = viewKey(); }
  function leave() {
    const sh = $('sheet'); if (sh.hidden || closing) return;
    sh.classList.remove('p1-in'); sh.classList.add('p1-out'); H.layerClosing();
    closing = setTimeout(() => { closing = 0; sh.classList.remove('p1-out'); sh.hidden = true; ui.panel = null; ui.lastMove = null; ui.moveSel = null; lastHtml = ''; if ($('modal').hidden) H.layerClosed(); }, RM() ? 160 : 210); // con una ventana abierta (WELCOME BACK), la capa sigue a la vista
  }
  // El clic fantasma del toque que abrió esta capa (lo explica beta.js): aquí también, antes que nadie. Un dedo de verdad lo desarma.
  document.addEventListener('pointerdown', () => H.ghostClear(), true);
  document.addEventListener('click', (e) => { if (H.ghostClick(e.clientX, e.clientY)) { e.stopPropagation(); e.preventDefault(); } }, true);
  document.addEventListener('click', (e) => {
    const sh = $('sheet');
    if (e.target === sh) { e.preventDefault(); leave(); return; }
    if (drag.endAt && performance.now() - drag.endAt < 450) return;
    const el = e.target.closest && e.target.closest('[data-act]');
    if (!el || !$('sheet').contains(el)) return;
    const parts = el.dataset.act.split(':'), f = ACTS[parts[0]];
    if (!f) return;
    if (parts[0] === 'buy') { f(parts[1], e, el); return; }
    f(...parts.slice(1));
    repaint();
    swapFx();
  });

  // ---- Ventanas ----
  let handlers = {};
  function showModal(html, h) { handlers = h || {}; $('modal-body').innerHTML = html; $('modal').hidden = false; for (const m of [CM.pmenu && $('modal-body').querySelector('.mx-mn-layer') && CM.pmenu.mountWin, CM.pwb && $('modal-body').querySelector('.wb-win') && CM.pwb.mount]) { try { if (m) m($('modal-body')); } catch (e) { console.error(e); } } }
  // La ayuda del LAB: una ventana, la de la ficha de un objeto. La guía es su índice; elegir una sección cambia el contenido, sin abrir otra encima.
  function showHelp(id) { const h = { ok() {}, guide() { showHelp('guide'); return false; } }; for (const x of ['recipes', 'directions', 'studies', 'strains', 'queue', 'desk', 'library', 'researcher', 'upgrades']) h['h:' + x] = () => { showHelp(x); return false; }; showModal(P.helpCard(id), h); $('modal-body').scrollTop = 0; }
  function helpButton() { const b = $('sheet-help'); if (!b) return; const id = P.helpFor(ui.panel, ui); b.hidden = !id; if (id) b.dataset.act = 'help:' + id; }
  function closeModal() { $('modal').hidden = true; $('modal-body').innerHTML = ''; handlers = {}; if ($('sheet').hidden) H.layerClosed(); }
  $('modal').addEventListener('click', (e) => {
    if (e.target === $('modal') && $('modal-body').querySelector('.lbh')) { closeModal(); return; } // la ayuda se cierra también tocando fuera
    const b = e.target.closest('[data-m]'); if (!b) return;
    const f = handlers[b.dataset.m], res = f ? f() : undefined;
    if (res === false) return;
    closeModal();
  });

  // ---- Arrastrar dentro de MICE: mantener quieto el dedo levanta al ratón (el gesto aprobado de COLONY). Mismo estado que MAIN. ----
  const LIFT = 380, SLOP = 9, body = $('sheet-body');
  function dStart(x, y, target, touch) {
    if (ui.panel !== 'mice' || drag.active) return;
    const card = target.closest && target.closest('.mx-post[data-mouse], .mx-ps-row[data-mouse]');
    if (!card) return;
    dReset();
    Object.assign(drag, { src: card, x, y, x0: x, y0: y, touch });
    drag.timer = setTimeout(dLift, LIFT);
  }
  function dLift() {
    const card = drag.src; if (!card || !document.body.contains(card)) return dReset();
    drag.active = true;
    const m = K.byId(null, card.dataset.mouse), g = document.createElement('div'), cv = card.querySelector('canvas[data-crew]');
    g.className = 'mcx-ghost';
    g.innerHTML = '<i class="mc-face r' + ((m && m.rarity) || 0) + '"><img class="pix" alt="" src="' + (cv ? cv.toDataURL() : '') + '"></i><b>' + P.esc(m ? m.name : '') + '</b><small></small>';
    document.body.appendChild(g); drag.ghost = g; drag.over = undefined;
    card.classList.add('mcx-src'); if (card.classList.contains('mx-post')) card.classList.add('mx-picked');
    body.classList.add('mcx-dragging'); ui.dragTold = true;
    try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {}
    dPaint(); drag.raf = requestAnimationFrame(dTick);
  }
  const dTarget = () => { const el = document.elementFromPoint(drag.x, drag.y), c = el && el.closest && el.closest('.mx-post[data-post]'); return c && c !== drag.src && body.contains(c) ? c : null; };
  const dSelf = () => { const el = document.elementFromPoint(drag.x, drag.y); return !!(el && el.closest && el.closest('.mx-post, .mx-ps-row') === drag.src); };
  function dPaint() {
    const g = drag.ghost; if (!g) return;
    g.style.transform = 'translate(' + Math.round(drag.x - 28) + 'px,' + Math.round(drag.y - 46) + 'px)';
    const over = dTarget(), home = !over && !!drag.src.dataset.post && !dSelf();
    if (over !== drag.over || home !== drag.home) {
      drag.home = home;
      if (drag.over) drag.over.classList.remove('mcx-over', 'mx-target');
      if (over) over.classList.add('mcx-over', 'mx-target');
      drag.over = over;
      const other = over && over.dataset.mouse ? K.byId(null, over.dataset.mouse) : null, fromHouse = !drag.src.dataset.post;
      g.querySelector('small').textContent = !over ? (home ? 'send to the house' : 'drop on a post') : other ? (fromHouse ? 'replace ' + other.name : 'swap with ' + other.name) : 'move here';
      g.classList.toggle('ok', !!over); g.classList.toggle('home', home);
    }
  }
  function dTick() { if (!drag.active) return; const r = body.getBoundingClientRect(), e = 44, v = drag.y < r.top + e ? -Math.ceil((r.top + e - drag.y) / 4) : drag.y > r.bottom - e ? Math.ceil((drag.y - (r.bottom - e)) / 4) : 0; if (v) { body.scrollTop += v; dPaint(); } drag.raf = requestAnimationFrame(dTick); }
  function dMove(x, y) { if (!drag.src) return; drag.x = x; drag.y = y; if (!drag.active) { if (Math.abs(x - drag.x0) > SLOP || Math.abs(y - drag.y0) > SLOP) dReset(); return; } dPaint(); }
  function dEnd(cancel) {
    if (!drag.active) return dReset();
    const over = cancel ? null : dTarget(), home = !cancel && !over && !!drag.src.dataset.post && !dSelf(), id = drag.src.dataset.mouse;
    drag.endAt = performance.now();
    dReset();
    if (over || home) placeMouse(id, over ? over.dataset.post : '');
    lastHtml = ''; repaint();
  }
  function dReset() {
    clearTimeout(drag.timer); cancelAnimationFrame(drag.raf);
    if (drag.ghost) drag.ghost.remove();
    if (drag.over) drag.over.classList.remove('mcx-over', 'mx-target');
    if (drag.src) drag.src.classList.remove('mcx-src', 'mx-picked');
    body.classList.remove('mcx-dragging');
    Object.assign(drag, { active: false, src: null, timer: 0, ghost: null, over: null, raf: 0, home: false });
  }
  body.addEventListener('touchstart', (e) => (e.touches.length === 1 ? dStart(e.touches[0].clientX, e.touches[0].clientY, e.target, true) : dReset()), { passive: true });
  body.addEventListener('touchmove', (e) => { if (!drag.src) return; if (drag.active) e.preventDefault(); dMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
  body.addEventListener('touchend', () => dEnd(false));
  body.addEventListener('touchcancel', () => dEnd(true));
  body.addEventListener('touchstart', () => (touching = true), { passive: true });
  for (const t of ['touchend', 'touchcancel']) body.addEventListener(t, (e) => { if (!e.touches.length) { touching = false; holdRepaint(180); } }, { passive: true });
  body.addEventListener('scroll', () => holdRepaint(160), { passive: true });
  body.addEventListener('pointerdown', () => holdRepaint(400), { passive: true });
  body.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button === 0) dStart(e.clientX, e.clientY, e.target, false); });
  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && drag.src && !drag.touch) dMove(e.clientX, e.clientY); });
  window.addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' && drag.src && !drag.touch) dEnd(false); });
  body.addEventListener('contextmenu', (e) => { if (e.target.closest('.mx-post, .mx-ps-row')) e.preventDefault(); });
  // Sin zoom del navegador (como en MAIN); las hojas sí se desplazan con un dedo.
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  // ---- Lo que pide la página madre ----
  const NAMED = { recruited: 1 };
  function legendMoment(id, trait, born) {
    const m = K.byId(null, id), def = B.mice.traits[trait]; if (!m || !def || !CM.pcb) return;
    const [sk] = m.post ? m.post.split(':') : [];
    H.layerShow();
    CM.pcb.l3({ m: CM.m2crew(m, sk || ''), born: !!born, who: m.name, trait: def.name.toUpperCase(), desc: def.desc + '.', at: sk ? 'AT ' + K.postLabel(m.post).toUpperCase() : '', before: '', after: '', where: '', then() { if ($('sheet').hidden) H.layerClosed(); } });
  }
  window.SHEETS = {
    open(kind, arg) {
      H.layerShow(); clearTimeout(closing); closing = 0; $('sheet').classList.remove('p1-out'); opening = true;
      if (kind === 'tree') { ui.tree = arg && CM.skilltree.TABS.includes(arg) ? arg : 'mine'; openPanel('tree'); }
      else if (kind === 'mice') { openPanel('mice'); ui.miceView = arg || 'rocks'; lastHtml = ''; repaint(); }
      else if (kind === 'card') { openPanel('mice'); ui.card = arg; ui.cardHome = true; lastHtml = ''; repaint(); }
      else if (kind === 'post') { openPanel('mice'); ui.pick = arg; lastHtml = ''; repaint(); }
      else if (kind === 'recruit') { openPanel('mice'); ui.miceTab = G().cands.length ? 'recruit' : ''; lastHtml = ''; repaint(); }
      else if (kind === 'book') { openPanel('cheese'); ui.cheeseView = 'book'; lastHtml = ''; repaint(); }
      else if (kind === 'treenode') { ui.tree = 'lab'; CM.skilltree.want(arg); openPanel('tree'); }
      else if (kind === 'labview') { ui.labView = arg; openPanel('lab'); }
      else if (kind === 'labstrains') { ui.labView = null; ui.labTab = 'strains'; openPanel('lab'); }
      else if (kind === 'labrecipes') { ui.labView = null; ui.labTab = 'recipes'; openPanel('lab'); }
      else { ui.labView = null; openPanel(kind); }
      opening = false; enter(); lastView = viewKey();
      return !$('sheet').hidden;
    },
    close: leave,
    get isOpen() { return !$('sheet').hidden || !$('modal').hidden; },
    event(ev) {
      if (ev.type === 'trait' && ev.legend) legendMoment(ev.id, ev.trait, false);
      if (ev.type === 'recruited') { const m = G().roster.find((x) => x.id === ev.id); if (m && m.rarity === 2) { const lg = (m.traits || []).find((t) => B.mice.traits[t] && B.mice.traits[t].kind === 'legend'); if (lg) legendMoment(m.id, lg, true); } }
    },
    // Una cepa nueva: su revelación, cuando el jugador mira el laboratorio.
    strainFound(recipeId, strain) { ui.found = { recipeId, strain }; if (CM.plab) CM.plab.found({ strain, recipeId }); },
    welcomeCatch(hoursText) { H.layerShow(); showModal(CM.pwb.markup({ catch: true, hoursText }), {}); },
    welcomeProgress(p) { const f = $('catch-fill'), n = $('catch-num'); if (f) f.style.width = Math.round(p * 100) + '%'; if (n) n.textContent = Math.round(p * 100) + '%'; },
    welcomeSummary(v) {
      H.layerShow();
      if (CM.pwb.isOpen()) { handlers = { ok() {} }; CM.pwb.summary(v); }
      else showModal(CM.pwb.markup({ v }), { ok() {} });
    },
    onResize() { lastHtml = ''; repaint(); },
  };
  setInterval(() => { if (document.visibilityState !== 'hidden') repaint(true); }, 250);
  setInterval(paintBars, 100);
  // La barra de la hornada, en cada fotograma: a saltos de 0,1 s parecía que el juego iba a tirones.
  setInterval(() => { if (ui.panel !== 'cheese') return; const j = G().s.job.cheese, bar = document.querySelector('#sheet-body [data-job="cook:line"]'); if (bar && j) bar.style.width = Math.min(100, 100 * (1 - (j.end - G().s.t) / j.total)).toFixed(1) + '%'; }, 16);
  H.layerReady();
})();
