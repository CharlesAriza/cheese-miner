// CHEESE DRILLER · BETA · UPGRADES: el árbol de mejoras como un grafo vivo.
// El grafo sale de los datos del núcleo (fundamentales, fases, caminos, hitos, LAB y la tabla de progresión): no hay lista de nodos en la
// interfaz. Una conexión solo se dibuja si la dependencia existe: la fase que pide un camino, el paso anterior de ese camino, el nudo
// que pide otro. Lo que depende de otra estación o de otro sistema va como requisito escrito, no como línea.
// Para añadir contenido: una fila en los datos. Para una familia nueva de nodos: una entrada en SOURCES y otra en STATE.
// Estados: unknown (no se dibuja), announced (silueta: se sabe que hay algo), locked (se ve y dice qué pide), available, owned,
// excluded (el otro lado de una decisión), future (de un hito posterior).
(function () {
  const H = window.H, B = CM.BALANCE, S2 = () => H.PARAMS.s2, Ru = H.Ru, Pg = H.Pg, Core = H.Core, Lb = H.Lb;
  const G = () => H.G;
  const NAME = { mine: 'MINE', drill: 'DRILL', refine: 'REFINE', cheese: 'CHEESE', sell: 'SELL', lab: 'LAB', colony: 'COLONY' };
  const SKILL = { mine: 'mining', drill: 'drilling', refine: 'refining', cheese: 'cheesemaking', sell: 'trading', lab: 'lab', colony: 'colony' };
  const TABS = ['mine', 'drill', 'refine', 'cheese', 'sell', 'lab', 'colony'];
  const realNode = (tab, id) => (B.trees[SKILL[tab]] || []).find((n) => n.id === id) || {};
  const entry = (id) => E2index()[id];
  let IDX = null;
  const E2index = () => { if (!IDX) { IDX = {}; for (const e of parent.E2.ROADMAP.unlocks) IDX[e.id] = e; } return IDX; };
  const PATH_NAME = H.PATH_TXT;
  // ---- De dónde salen los nodos de cada pestaña ----
  const SOURCES = [
    (tab) => (S2().fundamentals[tab] || []).map((f) => ({ id: 'fund.' + tab + '.' + f.id, kind: 'fund', tab, f, name: realNode(tab, f.id).name || H.pretty(f.id), desc: realNode(tab, f.id).desc || '', parents: [] })),
    (tab) => (S2().fundamentals[tab] ? Object.keys(S2().phases).map(Number).filter((n) => n > 1).sort((a, b) => a - b).map((n) => ({ id: 'phase' + n + '.' + tab, kind: 'phase', tab, n, name: NAME[tab] + ' STAGE ' + n, desc: 'New posts and bigger machinery for this station.', parents: n > 2 ? ['phase' + (n - 1) + '.' + tab] : [] })) : []),
    (tab) => {
      const out = [];
      for (const fork of S2().paths[tab] || []) {
        const fk = tab + '.' + fork.id, opts = Object.keys(fork.opts);
        for (const opt of opts) fork.opts[opt].forEach((n, i, arr) => out.push({ id: 'path.' + n.id, kind: 'path', tab, fk, opt, step: i, nodeId: n.id, blueprint: n.blueprint || '', name: H.pretty(n.id), desc: PATH_NAME[n.id] || '', fork: opts.length > 1 && i === 0 ? fk : '', parents: i ? ['path.' + arr[i - 1].id] : [] }));
      }
      return out;
    },
    (tab) => (tab === 'cheese' ? Object.keys(S2().milestones).map((id) => ({ id: 'ms.' + id, kind: 'milestone', tab, ms: id, name: realNode('cheese', id).name || H.pretty(id), desc: realNode('cheese', id).desc || (B.milestones[id] && B.milestones[id].desc) || '', parents: [] })) : []),
    (tab) => {
      if (tab !== 'lab') return [];
      const out = [];
      for (const n of B.trees.lab) out.push({ id: 'lab.' + n.id, kind: n.max > 1 ? 'labrank' : 'labnode', tab, labId: n.id, max: n.max, name: n.name, desc: n.desc, parents: [] });
      for (const id of ['queue', 'desk', 'library']) out.push({ id: 'lab.' + id, kind: 'labnode', tab, labId: id, name: { queue: 'Research Queue', desk: 'Drawing Desk', library: 'Strain Library' }[id], desc: { queue: 'Line up more than one research at a time.', desk: 'Draw blueprints for the last step of a path.', library: 'A strain counts for every recipe of its cheese.' }[id], parents: [] });
      for (const n of Object.keys(H.PARAMS.s3.lab.phases || {}).map(Number)) out.push({ id: 'lab.phase' + n, kind: 'labphase', tab, n, name: 'LAB STAGE ' + n, desc: 'A bigger lab.', parents: [] });
      return out;
    },
    (tab) => (tab === 'colony' ? [{ id: 'colony.lamp', kind: 'lamp', tab, name: realNode('colony', 'lamp').name, desc: realNode('colony', 'lamp').desc, max: realNode('colony', 'lamp').max, parents: [] }] : []),
  ];
  // El padre de un nodo: lo que pide su fila de progresión y exista en esta misma pestaña. Sin nada así, cuelga de la estación.
  function parentsFromRequires(n, ids) {
    const e = entry(n.id); if (!e) return [];
    const out = [];
    for (const q of e.requires) {
      let id = null;
      if (q.t === 'phase' && q.st === n.tab) id = 'phase' + q.n + '.' + q.st;
      else if (q.t === 'unlock') id = q.id;
      else if (q.t === 'owned') id = 'path.' + q.id;
      else if (q.t === 'labNode') id = 'lab.' + q.id;
      else if (q.t === 'labPhase') id = 'lab.phase' + q.n;
      else if (q.t === 'worker') id = 'lab.assistant';
      if (id && ids[id] && id !== n.id) out.push(id);
    }
    return out;
  }
  // Solo el requisito más adelantado es la línea: si una fase pide otra que ya es antepasada, no se dibuja dos veces.
  function buildGraph(tab) {
    const list = [].concat(...SOURCES.map((f) => f(tab))), byId = { root: { id: 'root', kind: 'root', tab, name: NAME[tab], parents: [], kids: [] } };
    for (const n of list) byId[n.id] = Object.assign(n, { kids: [] });
    for (const n of list) { if (!n.parents.length) n.parents = parentsFromRequires(n, byId); if (!n.parents.length) n.parents = ['root']; }
    const anc = (id, seen = {}) => { for (const p of byId[id].parents) if (!seen[p]) { seen[p] = 1; anc(p, seen); } return seen; };
    for (const n of list) if (n.parents.length > 1) { const others = n.parents; n.parents = others.filter((p) => !others.some((o) => o !== p && anc(o)[p])); n.parents = n.parents.slice(0, 2); }
    for (const n of list) for (const p of n.parents) byId[p].kids.push(n.id);
    // Hermanos en orden estable: fundamentales por nivel; luego fases; las dos opciones de una decisión, juntas.
    const rankOf = (n) => (n.kind === 'fund' ? 0 : n.kind === 'path' ? 2 : n.kind === 'phase' ? 3 : 1);
    for (const id of Object.keys(byId)) byId[id].kids.sort((a, b) => rankOf(byId[a]) - rankOf(byId[b]) || ((byId[a].f && byId[a].f.level) || 0) - ((byId[b].f && byId[b].f.level) || 0) || String(byId[a].fk || '').localeCompare(String(byId[b].fk || '')));
    return byId;
  }
  const GRAPHS = {};
  const graph = (tab) => GRAPHS[tab] || (GRAPHS[tab] = buildGraph(tab));
  // ---- Estado de cada nodo: siempre lo que dice la partida ----
  function optionMap() {
    const o = {};
    for (const x of Core.options(G())) {
      if (x.kind === 'fund') o['fund.' + x.st + '.' + x.f.id] = x;
      else if (x.kind === 'phase') o['phase' + x.next + '.' + x.st] = x;
      else if (x.kind === 'path') o['path.' + x.node.id] = x;
      else if (x.kind === 'milestone') o['ms.' + x.id] = x;
      else if (x.kind === 'labnode' || x.kind === 'labrank') o['lab.' + x.id] = x;
      else if (x.kind === 'labphase') o['lab.phase' + x.next] = x;
      else if (x.kind === 'lamp') o['colony.lamp'] = x;
    }
    return o;
  }
  const rankOfNode = (n) => {
    const c = G();
    return n.kind === 'root' ? 1 : n.kind === 'fund' ? c.fund[n.tab][n.f.id] || 0 : n.kind === 'phase' ? (c.phase[n.tab] >= n.n ? 1 : 0) : n.kind === 'path' ? (c.owned[n.nodeId] ? 1 : 0) : n.kind === 'milestone' ? (c.ms[n.ms] ? 1 : 0) : n.kind === 'labphase' ? (c.lab.phase >= n.n ? 1 : 0) : n.kind === 'lamp' ? c.lamp : c.lab.nodes[n.labId] || 0;
  };
  function states(tab) {
    const g = graph(tab), opt = optionMap(), c = G(), out = {};
    const visit = (id) => {
      if (out[id]) return out[id];
      const n = g[id]; let st = { rank: rankOfNode(n), opt: opt[id] || null };
      out[id] = st; // sin ciclos en los datos, pero nunca se cuelga
      if (n.kind === 'root') { st.s = 'owned'; return st; }
      const ps = n.parents.map(visit), anyOwned = ps.some((p) => p.s === 'owned' || p.rank > 0), allOwned = ps.every((p) => p.s === 'owned' || p.rank > 0), anyShown = ps.some((p) => p.s !== 'unknown' && p.s !== 'announced');
      const e = entry(id);
      if (e && e.planned) st.s = anyOwned ? 'future' : 'unknown';
      else if (st.rank > 0) st.s = 'owned';
      else if (n.kind === 'path' && c.active[n.fk] && c.active[n.fk] !== n.opt) st.s = n.step === 0 ? 'excluded' : 'unknown';
      else if (st.opt) st.s = 'available';
      else if (allOwned || anyOwned) st.s = 'locked';
      else if (anyShown) st.s = 'announced';
      else st.s = 'unknown';
      return st;
    };
    for (const id of Object.keys(g)) visit(id);
    return out;
  }
  function needsOf(n) {
    const out = [];
    const e = entry(n.id);
    if (e) for (const r of Pg.status(G(), n.id).requires) if (!r.ok) out.push(r.text);
    if (!e && n.kind === 'fund' && G().stLv[n.tab] < (n.f.level || 1)) out.push(NAME[n.tab] + ' level ' + n.f.level);
    if (n.kind === 'fund' && !out.length && (G().fund[n.tab][n.f.id] || 0) >= Ru.fundMax(n.tab, n.f, G())) out.push(Ru.fundRule(n.f) === 'A' ? 'Next stage of ' + NAME[n.tab] : 'Reach the next cheese');
    if (n.kind === 'path' && n.blueprint && !G().lab.blueprints[n.blueprint]) out.push('Blueprint: ' + H.pretty(n.blueprint) + ' (in the lab)');
    return out;
  }
  // ---- Colocación: filas por profundidad; cada rama con su ancho, para que nada se pise y el árbol pueda crecer sin límite ----
  const CELL_W = 74, CELL_H = 84, NODE = 52;
  function layout(tab, st) {
    const g = graph(tab), pos = {}, firstParent = (n) => g[n].parents[0], shownKids = (id) => g[id].kids.filter((k) => st[k].s !== 'unknown' && firstParent(k) === id);
    let x = 0, maxD = 0;
    const walk = (id, d) => {
      maxD = Math.max(maxD, d);
      const kids = shownKids(id);
      if (!kids.length) { pos[id] = { x: x * CELL_W, y: d * CELL_H }; x += 1; return pos[id].x; }
      const xs = kids.map((k) => walk(k, d + 1));
      pos[id] = { x: (xs[0] + xs[xs.length - 1]) / 2, y: d * CELL_H };
      return pos[id].x;
    };
    walk('root', 0);
    return { pos, w: x * CELL_W, h: (maxD + 1) * CELL_H };
  }
  // ---- Iconos: los del árbol aprobado; lo que no tiene icono propio usa el de su estación, sin dibujar nada nuevo ----
  const SP = 'assets/main2/out/sprites/';
  const stIcon = (tab) => { const r = CM.ptree.tree(SKILL[tab]); return r && r[0] ? r : ['', 0, 0]; };
  const ICON_ALIAS = { queue: 'assistant', desk: 'advanced', library: 'strains' };
  function iconOf(n) {
    if (n.kind === 'root' || n.kind === 'phase' || n.kind === 'labphase') return stIcon(n.tab);
    if (n.kind === 'fund') return CM.ptree.node(SKILL[n.tab], n.f.id);
    if (n.kind === 'milestone') return CM.ptree.node('cheesemaking', n.ms);
    if (n.kind === 'lamp') return CM.ptree.node('colony', 'lamp');
    if (n.kind === 'labnode' || n.kind === 'labrank') return CM.ptree.node('lab', ICON_ALIAS[n.labId] || n.labId);
    return stIcon(n.tab);
  }
  const img = (r, cls) => (r && r[0] ? '<img class="pix' + (cls ? ' ' + cls : '') + '" alt="" src="' + r[0] + '" style="width:' + r[1] + 'px;height:' + r[2] + 'px">' : '');
  const coinI = (w) => '<img class="pix" src="' + SP + 'ic_coin.png" alt="" style="width:' + (w || 12) + 'px;height:' + (w || 12) + 'px">';
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const fmt = (n) => CM.fmt(Math.floor(n));
  // Qué da un rango, con las reglas del núcleo (nunca una fórmula copiada aquí).
  const WORD = { power: 'pick power', speed: 'speed', yield: 'output', value: 'cheese value', count: 'cheese per sale', price: 'sale price' };
  const fundTxt = (n, r) => '+' + Math.round(Ru.fundEff(n.f, r) * n.f.per * 100) + '% ' + (WORD[n.f.key] || n.f.key);
  // ---- La vista ----
  const T = { el: null, tab: '', model: '', sel: null, sig: '', first: {}, nodes: {} };
  function render(s, ui) {
    if (!ui.tree || TABS.indexOf(ui.tree) < 0) ui.tree = 'mine';
    return '<div class="st-root" data-tab="' + ui.tree + '"></div>';
  }
  const tabOpen = (t) => { const c = G(); return t === 'mine' || (t === 'lab' ? c.lab.built : t === 'colony' ? c.built.house : c.s.built[t]); };
  function tabsHtml(tab) {
    const opt = optionMap();
    return '<div class="st-tabs">' + TABS.filter(tabOpen).map((t) => {
      const n = Object.keys(opt).filter((id) => { const g = graph(t); return g[id] && G().s.coins >= opt[id].cost; }).length;
      return '<span role="button" class="mx-box st-tab' + (t === tab ? ' mx-sel' : '') + '" data-act="treetab:' + t + '">' + img(stIcon(t)) + '<b>' + NAME[t] + '</b>' + (n ? '<i class="st-badge">' + n + '</i>' : '') + '</span>';
    }).join('') + '</div>';
  }
  function headHtml(tab) {
    const c = G();
    if (tab === 'lab') return '<div class="box up-labrow st-head" role="button" data-act="open:lab"><span class="t"><b>CHEESE LAB · STAGE ' + c.lab.phase + '</b><small>The lab starts simple. Each upgrade here teaches it something new.</small></span><span class="act">BACK</span></div>';
    if (tab === 'colony') return '<div class="box up-labrow st-head"><span class="t"><b>COLONY</b><small>What works for the whole colony. Only stations with a mouse keep going when the game is closed.</small></span></div>';
    const lv = c.stLv[tab], xp = H.stXp(tab);
    return '<div class="box up-head st-head"><span class="t"><span class="sk">' + NAME[tab] + '</span><span class="lv"><b><small>LV</small>' + lv + '</b><small data-xpn>' + fmt(xp.cur) + ' / ' + fmt(xp.need) + ' xp</small></span><span class="xp"><i data-xp style="width:' + Math.round((xp.cur / xp.need) * 100) + '%"></i></span><p>Levels open new upgrades. You earn xp by doing the work, or by having a mouse do it.</p></span></div>';
  }
  const LABEL = { owned: '', available: '', locked: 'LOCKED', announced: '?', excluded: 'OTHER PATH', future: 'LATER' };
  function nodeHtml(id, n, st, p) {
    const hidden = st.s === 'announced';
    const icon = hidden ? '<span class="st-q">?</span>' : img(iconOf(n));
    const rank = n.kind === 'fund' || n.kind === 'labrank' || n.kind === 'lamp' ? st.rank : 0;
    return '<div role="button" class="st-n st-' + st.s + (n.kind === 'root' ? ' st-root-n' : '') + (n.fork ? ' st-fork' : '') + '" data-n="' + id + '" style="left:' + p.x + 'px;top:' + p.y + 'px">' +
      '<span class="st-ic">' + icon + (st.s === 'locked' ? img(CM.ptree.lock(), 'st-lk') : '') + (rank ? '<u>' + rank + '</u>' : '') + '</span><small>' + (hidden ? '???' : esc(n.name)) + '</small></div>';
  }
  function edgesHtml(g, st, pos) {
    let h = '';
    for (const id of Object.keys(g)) {
      const n = g[id], q = pos[id]; if (!q || st[id].s === 'unknown') continue;
      for (const pid of n.parents) {
        const p = pos[pid]; if (!p) continue;
        const lit = st[pid].rank > 0 && st[id].rank > 0, near = st[pid].rank > 0 && st[id].s === 'available', dim = st[id].s === 'announced' || st[id].s === 'excluded';
        const x1 = p.x + NODE / 2 + 11 - 1, y1 = p.y + NODE, x2 = q.x + NODE / 2 + 11 - 1, y2 = q.y, mid = Math.round((y1 + y2) / 2);
        const cls = 'st-e' + (lit ? ' st-lit' : near ? ' st-near' : dim ? ' st-dim' : '');
        h += '<i class="' + cls + '" data-e="' + pid + '>' + id + '" style="left:' + x1 + 'px;top:' + y1 + 'px;width:3px;height:' + (mid - y1) + 'px"></i>';
        if (x1 !== x2) h += '<i class="' + cls + '" data-e="' + pid + '>' + id + '" style="left:' + Math.min(x1, x2) + 'px;top:' + mid + 'px;width:' + (Math.abs(x2 - x1) + 3) + 'px;height:3px"></i>';
        h += '<i class="' + cls + '" data-e="' + pid + '>' + id + '" style="left:' + x2 + 'px;top:' + mid + 'px;width:3px;height:' + (y2 - mid) + 'px"></i>';
      }
    }
    // Una decisión de verdad: «OR» entre las opciones de una horquilla.
    const seen = {};
    for (const id of Object.keys(g)) {
      const n = g[id]; if (!n.fork || seen[n.fk] || !pos[id] || st[id].s === 'unknown' || st[id].s === 'announced') continue;
      const sib = Object.keys(g).filter((k) => g[k].fork === n.fork && pos[k]);
      if (sib.length < 2) continue;
      seen[n.fk] = 1;
      const xs = sib.map((k) => pos[k].x), mx = (Math.min(...xs) + Math.max(...xs)) / 2 + NODE / 2 + 11;
      h += '<em class="st-or' + (G().active[n.fk] ? ' st-chosen' : '') + '" style="left:' + mx + 'px;top:' + (pos[id].y - 22) + 'px">' + (G().active[n.fk] ? 'CHOSEN' : 'CHOOSE') + '</em>';
    }
    return h;
  }
  // La ficha del nodo elegido: la misma tarjeta del árbol aprobado (.up-node), con lo que pide, lo que cuesta y lo que da.
  function cardHtml(id, n, st) {
    if (n.kind === 'root') return '<div class="box up-node st-card"><span class="ic">' + img(stIcon(n.tab)) + '</span><span class="t"><span class="unm">' + NAME[n.tab] + '</span><span class="d">Tap a node to see what it does. Buying one lights its connection and shows what comes after it.</span></span><span class="act2"></span></div>';
    if (st.s === 'announced') return '<div class="box up-node st-card locked"><span class="ic"><span class="st-q">?</span></span><span class="t"><span class="unm">Something further on</span><span class="d">Get what comes before it to find out.</span></span><span class="act2"></span></div>';
    const key = st.s === 'owned' ? ' maxed' : st.s === 'available' ? '' : ' locked', rk = n.kind === 'fund' ? st.rank + (Ru.fundMax(n.tab, n.f, G()) === Infinity ? '' : '/' + Ru.fundMax(n.tab, n.f, G())) : n.kind === 'labrank' || n.kind === 'lamp' ? st.rank + '/' + n.max : '';
    let fx = '';
    if (n.kind === 'fund') fx = '<span class="fx"><i>NOW</i><span class="nw">' + (st.rank ? fundTxt(n, st.rank) : 'Nothing yet') + '</span>' + (st.opt ? '<i>NEXT</i><span class="nx">' + fundTxt(n, st.rank + 1) + '</span>' : '') + '</span>';
    else if (st.s === 'owned') fx = '<span class="fx"><i>NOW</i><span>Working for you</span></span>';
    else if (st.s === 'excluded') { const other = H.pretty((S2().paths[n.tab].find((f) => n.fk.endsWith('.' + f.id)).opts[G().active[n.fk]] || [{ id: '' }])[0].id); fx = '<span class="fx"><i>NOW</i><span>You chose ' + other + '. Changing is free, but the station refits for ' + Math.round(S2().refitMs / 60000) + ' min.</span></span>'; }
    const needs = st.s === 'locked' || st.s === 'future' ? (st.s === 'future' ? ['Comes in a later update'] : needsOf(n)) : [];
    const more = st.s === 'owned' && n.kind === 'fund' && !st.opt ? needsOf(n) : []; // comprado hasta el tope de ahora: dice qué abre más rangos
    if (more.length) fx += '<span class="gate st-needs"><span class="d">More ranks: ' + esc(more[0]) + '</span></span>';
    const gate = needs.length ? '<span class="gate st-needs">' + needs.map((t) => '<span class="d">' + esc(t) + '</span>').join('') + '</span>' : '';
    let a;
    if (st.s === 'available') { const can = G().s.coins >= st.opt.cost; a = '<button class="up-btn' + (can ? (n.kind === 'path' || n.kind === 'phase' ? ' go' : '') : ' off') + '" data-act="buy:' + id + '" data-cost="' + st.opt.cost + '">' + (n.kind === 'path' && !G().active[n.fk] ? 'CHOOSE' : 'BUY') + '<small>' + coinI() + fmt(st.opt.cost) + '</small></button>'; }
    else if (st.s === 'excluded') a = '<button class="up-btn" data-act="switch:' + id + '">SWITCH</button>';
    else if (st.s === 'owned') a = '<span class="up-tag">' + (n.kind === 'fund' || n.kind === 'labrank' || n.kind === 'lamp' ? 'MAX' : 'DONE') + '</span>';
    else a = '<span class="up-tag lock">' + LABEL[st.s] + '</span>';
    const t = '<span class="t"><span class="unm">' + esc(n.name) + (rk ? '<span class="rk">' + rk + '</span>' : '') + '</span><span class="d">' + esc(n.desc) + '</span>' + (gate || fx) + '</span>';
    return '<div class="box up-node st-card' + key + '" data-node="' + id + '"><span class="ic">' + img(iconOf(n)) + (st.s === 'locked' ? img(CM.ptree.lock(), 'lk') : '') + '</span>' + t + '<span class="act2">' + a + '</span></div>';
  }
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Un nodo recién revelado es un pequeño acontecimiento: su línea crece desde el padre y el nodo salta, con unas chispas.
  function reveal(wrap, id) {
    const el = wrap.querySelector('[data-n="' + id + '"]');
    if (!el || reduced()) return;
    let delay = 0;
    const edges = [...wrap.querySelectorAll('[data-e$=">' + id + '"]')];
    edges.forEach((e, i) => { e.animate([{ clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 170, delay: i * 150, easing: 'steps(5)', fill: 'backwards' }); delay = (i + 1) * 150; });
    el.animate([{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.25)', opacity: 1, offset: 0.65 }, { transform: 'none' }], { duration: 300, delay, easing: 'steps(6)', fill: 'backwards' });
    setTimeout(() => {
      if (!el.isConnected) return;
      el.classList.add('st-fresh'); setTimeout(() => el.classList.remove('st-fresh'), 2600);
      spark(wrap, el, 10, ['#ffcf2e', '#fff3a0', '#ffffff']);
    }, delay + 180);
  }
  function spark(wrap, el, n, colors) {
    if (reduced()) return;
    const cx = el.offsetLeft + el.offsetWidth / 2, cy = el.offsetTop + NODE / 2;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i'); p.className = 'st-px'; p.style.cssText = 'left:' + cx + 'px;top:' + cy + 'px;background:' + colors[i % colors.length]; wrap.appendChild(p);
      const a = (i / n) * Math.PI * 2, r = 24 + (i % 3) * 8;
      p.animate([{ transform: 'translate(0,0)', opacity: 1 }, { transform: 'translate(' + Math.round(Math.cos(a) * r / 2) * 2 + 'px,' + Math.round(Math.sin(a) * r / 2) * 2 + 'px)', opacity: 0 }], { duration: 520, easing: 'steps(6)' }).onfinish = () => p.remove();
    }
  }
  function focusNode(gw, id, smooth) {
    const el = gw.querySelector('[data-n="' + id + '"]'); if (!el) return;
    const x = el.offsetLeft + el.offsetWidth / 2 - gw.clientWidth / 2, y = el.offsetTop + el.offsetHeight / 2 - gw.clientHeight / 2;
    if (smooth && !reduced()) gw.scrollTo({ left: x, top: y, behavior: 'smooth' }); else { gw.scrollLeft = x; gw.scrollTop = y; }
  }
  function paint(root, ui, force) {
    const tab = root.dataset.tab, g = graph(tab), st = states(tab), L = layout(tab, st);
    const sig = Object.keys(g).map((id) => id + ':' + st[id].s + ':' + (st[id].rank > 0 ? 1 : 0) + ':' + st[id].rank).join('|');
    let gw = root.querySelector('.st-graph');
    if (!gw || T.tab !== tab) {
      root.innerHTML = '<div class="st-tabs-w"></div><div class="st-head-w"></div><div class="st-graph"><div class="st-canvas"></div></div><div class="st-card-w"></div>';
      gw = root.querySelector('.st-graph'); T.tab = tab; T.sig = ''; T.sel = null;
      gw.addEventListener('click', (e) => { const el = e.target.closest('[data-n]'); if (!el) return; T.sel = el.dataset.n; paintCard(root, tab); for (const x of gw.querySelectorAll('.st-sel')) x.classList.remove('st-sel'); el.classList.add('st-sel'); });
    }
    const tb = tabsHtml(tab), tw = root.querySelector('.st-tabs-w'); if (tw._h !== tb) { tw._h = tb; tw.innerHTML = tb; }
    const hd = headHtml(tab), hw = root.querySelector('.st-head-w'); if (hw._h !== hd) { hw._h = hd; hw.innerHTML = hd; }
    if (sig !== T.sig || force) {
      const known = (id) => G().seen['tree.' + id] != null, firstTime = G().seen['tree.tab.' + tab] == null;
      const fresh = Object.keys(g).filter((id) => st[id].s !== 'unknown' && st[id].s !== 'announced' && !known(id));
      const cv = gw.querySelector('.st-canvas'), xs = cv.style.width;
      const W = Math.max(L.w, 74) + 22, Ht = L.h;
      let h = edgesHtml(g, st, L.pos);
      for (const id of Object.keys(g)) if (L.pos[id] && st[id].s !== 'unknown') h += nodeHtml(id, g[id], st[id], L.pos[id]);
      cv.style.width = W + 'px'; cv.style.height = Ht + 'px'; cv.innerHTML = h;
      if (T.sel && cv.querySelector('[data-n="' + T.sel + '"]')) cv.querySelector('[data-n="' + T.sel + '"]').classList.add('st-sel');
      if (firstTime) { H.act('seen', { id: 'tree.tab.' + tab }); for (const id of fresh) H.act('seen', { id: 'tree.' + id }); }
      else if (fresh.length) {
        for (const id of fresh) { reveal(cv, id); H.act('seen', { id: 'tree.' + id }); }
        if (T.sig) setTimeout(() => focusNode(gw, fresh[0], true), 60);
      }
      if (!T.sig) { // al abrir: lo que se puede hacer ahora, a la vista
        const go = Object.keys(g).find((id) => st[id].s === 'available' && G().s.coins >= st[id].opt.cost) || Object.keys(g).find((id) => st[id].s === 'available') || 'root';
        if (!T.sel) { T.sel = go; const e = cv.querySelector('[data-n="' + go + '"]'); if (e) e.classList.add('st-sel'); }
        focusNode(gw, go, false);
      }
      T.sig = sig;
    }
    paintCard(root, tab, st);
  }
  function paintCard(root, tab, stIn) {
    const g = graph(tab), st = stIn || states(tab), id = T.sel && g[T.sel] && st[T.sel] && st[T.sel].s !== 'unknown' ? T.sel : 'root';
    const w = root.querySelector('.st-card-w'), h = cardHtml(id, g[id], st[id]);
    if (w._h !== h) { w._h = h; w.innerHTML = h; }
  }
  // Comprar: la moneda sale del botón y cae en el nodo; el rango sube; lo demás lo dice el repintado (conexión encendida y lo que se revela).
  function bought(root, id, fromRect) {
    const cv = root.querySelector('.st-canvas'), el = cv && cv.querySelector('[data-n="' + id + '"]'); if (!el || reduced()) return;
    const ic = el.querySelector('.st-ic');
    if (ic) ic.animate([{ transform: 'scale(1.3)', filter: 'brightness(1.6)' }, { transform: 'none', filter: 'none' }], { duration: 280, easing: 'steps(4)' });
    const lit = [...cv.querySelectorAll('[data-e$=">' + id + '"].st-lit')];
    lit.forEach((e, i) => e.animate([{ background: '#ffffff' }, { background: '#ffcf2e' }], { duration: 300, delay: i * 70, easing: 'steps(3)' }));
    spark(cv, el, 8, ['#a8ccff', '#5a9cf0', '#ffffff']);
    if (fromRect) {
      const a = document.createElement('img'); a.src = SP + 'ic_coin.png'; a.className = 'pix st-fly'; document.body.appendChild(a);
      const r = el.getBoundingClientRect(), x0 = fromRect.left + fromRect.width / 2, y0 = fromRect.top + fromRect.height / 2, x1 = r.left + r.width / 2, y1 = r.top + 20;
      a.style.left = x0 - 7 + 'px'; a.style.top = y0 - 7 + 'px';
      a.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(' + (x1 - x0) / 2 + 'px,' + ((y1 - y0) / 2 - 22) + 'px)', offset: 0.5 }, { transform: 'translate(' + (x1 - x0) + 'px,' + (y1 - y0) + 'px)' }], { duration: 300, easing: 'steps(8)' }).onfinish = () => a.remove();
    }
  }
  const ACT = {
    fund: (n) => ['fund', { st: n.tab, id: n.f.id }], phase: (n) => ['phase', { st: n.tab }], path: (n) => ['path', { fk: n.fk, opt: n.opt }], milestone: (n) => ['milestone', { id: n.ms }],
    labnode: (n) => ['labNode', { id: n.labId }], labrank: (n) => ['labRank', { id: n.labId }], labphase: () => ['labPhase', {}], lamp: () => ['lamp', {}],
  };
  CM.skilltree = {
    render, graph, states, TABS,
    mount(root, ui) { const r = root.querySelector('.st-root'); if (r) { T.sig = ''; T.tab = ''; paint(r, ui, true); } },
    tick(ui) { const r = document.querySelector('#sheet-body .st-root'); if (r) paint(r, ui, false); },
    buy(id, ui, rect) {
      const n = graph(T.tab)[id]; if (!n) return { ok: false };
      const res = H.act.apply(null, ACT[n.kind](n));
      if (res.ok) { const r = document.querySelector('#sheet-body .st-root'); if (r) { paint(r, ui, false); bought(r, id, rect); } }
      return res;
    },
    switch(id, ui) { const n = graph(T.tab)[id]; const res = H.act('switchPath', { fk: n.fk, opt: n.opt }); const r = document.querySelector('#sheet-body .st-root'); if (r) paint(r, ui, false); return res; },
    select(id) { T.sel = id; },
  };
})();
