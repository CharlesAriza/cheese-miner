// CHEESE DRILLER · BETA · Los paneles Pulido+ aprobados con los datos del núcleo: el marcado es el de js/ui/panels.js (mismas clases,
// mismos iconos, mismos textos) y lo que cambia es de dónde salen las cifras. Una colonia y una cadena: COLONY agrupa los puestos por
// estación, no por roca; PRODUCTION tiene una línea. Las acciones las resuelve ui.js con Core.act.
(function () {
  const H = window.H, B = CM.BALANCE, Lb = H.Lb, Mo = H.Mo, Ru = H.Ru, Cr = H.Cr, Pg = H.Pg, Inv = H.Inv;
  const G = () => H.G;
  const M = B.mice, T = M.traits, RARITY = M.rarities, ROMAN = ['', 'I', 'II', 'III'];
  const romanN = (n) => { let r = ''; for (const [v, t] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { r += t; n -= v; } return r; };
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const round1 = (n) => Math.round(n * 10) / 10;
  const secs = (ms) => (ms < 10000 ? round1(ms / 1000) + 's' : ms < 60000 ? Math.round(ms / 1000) + 's' : ms < 3600000 ? Math.floor(ms / 60000) + 'm ' + String(Math.round((ms % 60000) / 1000)).padStart(2, '0') + 's' : Math.floor(ms / 3600000) + 'h ' + String(Math.round((ms % 3600000) / 60000)).padStart(2, '0') + 'm');
  const clock = (ms) => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
  const canPromote = (s, m) => CM.mice.promoteInfo(s, m).can;
  const m2 = (m, job) => (m.aff && m.aff[job]) || 0;
  let GM = '';
  const tier = () => H.tier();
  const mxBase = () => tier();
  const mxJobIc = (k) => MXSP + ({ mining: 'ic_pick', trading: 'ic_coin', research: 'ic_flask' }[k] || 'ic_' + { drilling: 'raw', refining: 'base', cheesemaking: 'lot' }[k] + '_' + tier()) + '.png';
  const MXZ = { cheddar: [['#3a3022', '#5a4a30', '#241c14'], '#30291f'], gouda: [['#3a2a20', '#5a3e2a', '#24180f'], '#33251c'], brie: [['#34322c', '#504c42', '#201e1a'], '#2e2c27'], emmental: [['#30331f', '#4a4f2e', '#1e2012'], '#2b2e1d'], parmesan: [['#3a2e22', '#56442f', '#241a12'], '#32281e'], blue: [['#262c3a', '#3a4458', '#161a24'], '#232836'] };
  const mxWall = (z) => (z === 'all' ? '#2a2433' : (MXZ[tier()] || MXZ.cheddar)[1]);
  const mxPostN = (key) => { const [k, z] = key.split(':'); return k === 'research' ? 'Lab · Researcher' : MXJ[k].charAt(0) + MXJ[k].slice(1).toLowerCase() + ' · ' + (H.ROLE[z] || z); };
  const STN = { mining: 'mine', drilling: 'drill', refining: 'refine', cheesemaking: 'cheese', trading: 'sell' };
  const FN_TXT = { pr: 'runs the station', ritmo: 'speeds it up', rend: 'raises its output' };

  // Lo que hace un ratón en un puesto, en valores reales: el principal, su ciclo; los apoyos, lo que suman a la estación.
  function mouseRate(s, m, skill, role) {
    const K = CM.mice, sp = K.solo(m, skill, s, role);
    if (skill === 'research') return 'a recipe every ' + secs(Lb.labTime(G(), tier()) / sp);
    const st = STN[skill], c = G().s, md = c.mods[st], P = H.PARAMS, def = (P.posts[st][c.stage[st] - 1] || []).find((x) => x[0] === role) || ['', 'pr'], W = (md && c.mods.w && c.mods.w[st]) || {};
    if (def[1] === 'ritmo') return '+' + Math.round((W.ritmo != null ? W.ritmo : P.crew.ritmo) * sp * 100) + '% speed for ' + MXJ[skill];
    if (def[1] === 'rend') return '+' + Math.round((W.rend != null ? W.rend : P.crew.rend) * sp * 100) + '% output for ' + MXJ[skill];
    const ritmo = sp * (P.invest[st] || 1) * md.speed, rend = (c.rates[st] && c.rates[st].rend) || 1, R = B, num = (n, u) => (n >= 100 ? CM.fmt(Math.round(n)) : round1(n)) + ' ' + u;
    if (skill === 'mining') return 'a swing every ' + secs(R.mining.minerIntervalMs / ritmo);
    if (skill === 'drilling') { const y = Mo.cycle(R.drill.durationMs / ritmo); return num(R.drill.yield * Mo.skillMult() * rend * md.yield * y.mult, 'Raw') + ' every ' + secs(y.total); }
    if (skill === 'refining') { const y = Mo.cycle(R.refinery.durationMs / ritmo); return num(R.refinery.batch * Mo.skillMult() * rend * md.yield * md.base * y.mult, 'Base') + ' every ' + secs(y.total); }
    if (skill === 'trading') { const y = Mo.cycle(P.sell.cycleMs / ritmo), per = (P.sell.perCycleByStage ? P.sell.perCycleByStage[c.stage.sell - 1] : P.sell.perCycle) * md.count; return num(per * y.mult, 'cheese sold') + ' every ' + secs(y.total); }
    const key = Mo.currentKey(c), y = Mo.cycle(CM.cheesery.jobTime(s, CM.cheesery.parseKey(key)) / ritmo), n = R.cheesery.batch * Mo.skillMult() * rend * md.yield * y.mult;
    return (Math.abs(n - 1) < 0.005 ? 'a cheese' : num(n, 'cheese')) + ' every ' + secs(y.total);
  }
  // Un nicho de COLONY: el papel arriba, el ratón, su nombre, lo que rinde y su nivel.
  function mxPost(s, skill, zone, sel, wide) {
    const K = CM.mice, key = K.postKey(skill, zone), m = K.at(s, skill, zone);
    const target = sel && (!m || m.id !== sel.id), picked = sel && m && m.id === sel.id;
    const act = !sel ? (m ? 'card:' + m.id : 'pickpost:' + key) : target ? 'moveto:' + key : 'movecancel';
    const extra = picked ? ' mx-picked' : target ? ' mx-target' : '';
    const role = skill === 'research' ? 'RESEARCH' : (H.ROLE[zone] || zone).toUpperCase();
    const job = '<div class="mx-job"><img class="pix" src="' + mxJobIc(skill) + '" alt=""><span class="mx-meta">' + role + '</span>' + (m && m.aff[skill] ? '<i class="mx-hearts" style="display:flex;gap:1px">' + Array.from({ length: m.aff[skill] }, () => mxI('heart', 1)).join('') + '</i>' : '') + '</div>';
    if (!m) return '<div role="button" data-act="' + act + '" data-post="' + key + '" class="mx-box mx-post mx-empty' + extra + '">' + job + '<div class="mx-stage">' + mxM('ghost', 'mx-ghost') + '</div><div class="mx-name">EMPTY</div><div class="mx-line"><span class="mx-lv">TAP TO ASSIGN</span></div></div>';
    const care = s.care && s.care.id === m.id ? s.care.kind : '';
    const due = !care && canPromote(s, m);
    const mins = care ? Math.max(1, Math.ceil(s.care.remaining / 60000)) : 0;
    let band = '';
    if (picked) band = '<span class="mx-band">MOVING</span>';
    else if (care === 'spec') band = '<span class="mx-band">TRAINING ' + mins + 'M</span>' + mxI('book', 2).replace('<canvas', '<canvas style="position:absolute;right:5px;bottom:8px"');
    else if (care) band = '<span class="mx-band">RESTING ' + mins + 'M</span><span class="mx-zz" style="left:56%;top:16px">Z</span><span class="mx-zz" style="left:64%;top:22px;animation-delay:1s">z</span>';
    else if (due) band = '<span class="mx-band">' + mxI('up', 1) + 'PROMOTE</span>';
    const sparks = m.rarity === 2 ? [0, 1, 2, 3].map((i) => '<i class="mx-spark" style="left:' + [12, 74, 20, 82][i] + '%;top:' + [26, 30, 62, 56][i] + '%;animation-delay:' + i * 0.4 + 's"></i>').join('') : '';
    return '<div role="button" data-act="' + act + '" data-post="' + key + '" data-mouse="' + m.id + '" class="mx-box mx-post' + (m.rarity ? ' mx-r' + m.rarity : '') + (due ? ' mx-due' : '') + (care === 'quirk' ? ' mx-bed' : care === 'spec' ? ' mx-train' : '') + extra + '" style="--zw2:' + mxWall(zone) + '">' + job +
      '<div class="mx-stage">' + mxM('m:' + m.id + ':' + skill, 'mx-m') + band + sparks + '</div>' +
      '<div class="mx-name">' + (m.id === GM ? mxI('star', 1.5, 'mx-gm') : '') + '<span>' + esc(m.name) + '</span></div><div class="mx-line"><span class="mx-out">' + mxX(CM.mice.here(s, m)) + '</span><span class="mx-lv">' + (wide && m.rank ? mxI('rank' + Math.min(3, m.rank), 2) : '') + 'LV ' + CM.mice.level(m) + (wide ? '<span class="mx-rn"> · ' + M.ranks[m.rank].name + '</span>' : '') + '</span></div></div>';
  }
  // Combinaciones de una estación: las parejas de su equipo y la que forma su principal con el de la estación siguiente.
  function pairsOf(st) {
    const t = G().s.team, placed = G().s.placed, atOf = (id) => placed.find((p) => p.m.id === id);
    const K = CM.mice, out = [];
    for (const e of t.pairs || []) { const a = atOf(e.a), b = atOf(e.b); if (!a || !b) continue; if (a.st === st || (e.why === 'line' && b.st === st && a.st !== st && false)) out.push([e.link, K.byId(null, e.a), K.byId(null, e.b)]); else if (b.st === st && a.st !== st && e.why === 'line' && ['mine', 'drill', 'refine', 'cheese', 'sell'].indexOf(b.st) < ['mine', 'drill', 'refine', 'cheese', 'sell'].indexOf(a.st)) out.push([e.link, K.byId(null, e.a), K.byId(null, e.b)]); }
    return out;
  }
  function mxCombos(s, st, ui) {
    const groups = [];
    for (const [l, a, b] of pairsOf(st)) { let g = groups.find((x) => x.l === l); if (!g) groups.push((g = { l, pairs: [] })); g.pairs.push([a, b]); }
    const open = ui.comboOpen && ui.comboOpen[st];
    let h = '<div class="mx-box mx-combos' + (open ? ' mx-open' : '') + '"><div class="mx-cmb-sum" role="button" data-act="combotoggle:' + st + '"><div class="mx-cmb-n"><b>' + groups.length + '</b><span>COMBOS</span></div>' +
      '<div class="mx-cmb-gain"><span class="mx-lbl">Between neighbours</span><span class="mx-chips">' + (groups.length ? groups.slice(0, 2).map((g) => '<span class="mx-chip">' + effTxt(g.l.eff) + '</span>').join('') : '<span class="mx-chip mx-off">None yet</span>') + '</span>' +
      '<span class="mx-cmb-foot"><span class="mx-cmb-pairs">' + mxI('chain', 1) + '<b>+' + groups.length + '</b> in this crew</span><span class="mx-act">' + (open ? 'HIDE' + mxI('chevU', 2) : 'DETAILS' + mxI('chevD', 2)) + '</span></span></div></div><div class="mx-cmb-list">';
    if (open) {
      h += '<div class="mx-cmb-h">Between neighbours · both mice</div>';
      for (const g of groups) h += '<div class="mx-cmb-row"><span class="mx-who">' + g.pairs[0].map((m) => '<i class="mx-mini' + (m.rarity ? ' mx-r' + m.rarity : '') + '">' + mxM('m:' + m.id) + '</i>').join('') + '</span><span class="mx-t"><b>' + g.l.name + (g.pairs.length > 1 ? ' <i style="font-style:normal;color:var(--muted);font-weight:700">×' + g.pairs.length + '</i>' : '') + '</b><span>' + g.pairs.map((p) => esc(p[0].name) + ' + ' + esc(p[1].name)).join(' · ') + '</span></span><span class="mx-chip">' + effTxt(g.l.eff) + '</span></div>';
      if (!groups.length) h += '<div class="mx-cmb-row"><span class="mx-who"></span><span class="mx-t"><span>None yet: the right traits on neighbours make one.</span></span><span></span></div>';
    }
    return { html: h + '</div></div>', n: groups.length };
  }
  const STATIONS = [['mining', 'mine', 'MINE', 'ic_pick'], ['drilling', 'drill', 'DRILL', null], ['refining', 'refine', 'REFINE', null], ['cheesemaking', 'cheese', 'CHEESE', null], ['trading', 'sell', 'SELL', 'ic_coin']];
  function mxColony(s, ui) {
    const K = CM.mice, c = G();
    const promos = s.mice.filter((m) => canPromote(s, m)), idle = s.mice.filter((m) => !m.post);
    const all = K.posts(s), empty = all.filter((p) => !K.at(s, p.skill, p.zone)), total = all.length;
    const sel = ui.moveSel ? K.byId(s, ui.moveSel) : null;
    let h = '';
    if (sel) h += '<div class="mx-box mx-ps-left" style="justify-content:space-between"><span style="display:flex;align-items:center;gap:8px"><i class="mx-mini' + (sel.rarity ? ' mx-r' + sel.rarity : '') + '">' + mxM('m:' + sel.id) + '</i><span>Moving <b>' + esc(sel.name) + '</b>: tap a post</span></span><span class="mx-act" data-act="movecancel">CANCEL</span></div>' +
      (sel.post ? '<div class="mx-notes"><div role="button" class="mx-box mx-note" data-act="post:' + sel.id + ':"><span>TO HOUSE</span></div></div>' : '');
    h += '<div class="mx-status"><b>' + (total - empty.length) + '/' + total + ' POSTS</b><span style="display:flex;align-items:center;gap:8px">' + (ui.lastMove ? '<span class="mx-act" data-act="undomove">UNDO</span>' : '') + '<span class="mx-meta mx-ok">' + (empty.length ? empty.length + ' empty' : 'all staffed') + '</span></span></div>';
    let notes = '';
    if (promos.length) notes += mxNote('up', mxI('up', 2), promos.length, 'to promote', 'promos');
    if (idle.length) notes += mxNote('free', mxI('head', 1), idle.length, 'unassigned', idle.length === 1 ? 'pickmouse:' + idle[0].id : 'rosterfilter:free');
    if (s.care && K.byId(s, s.care.id)) notes += mxNote('bed', mxI(s.care.kind === 'spec' ? 'book' : 'bed', 2), esc(K.byId(s, s.care.id).name).toUpperCase(), Math.max(1, Math.ceil(s.care.remaining / 60000)) + 'm', 'housego:' + (s.care.kind === 'spec' ? 'training' : 'bed'));
    if (notes) h += '<div class="mx-notes">' + notes + '</div>';
    h += mxHire(s, 'recruit', 'recruitview');
    if (s.mice.length > 1) h += '<div role="button" class="mx-box mx-note mx-bf" data-act="bestfit"><span class="mx-t"><b>BEST FIT</b><span>Puts each mouse where the colony earns the most. Combos between mice are yours to find.</span></span><span class="mx-act">DO IT</span></div>';
    if (!ui.dragTold && s.mice.length > 1) h += '<p class="mx-ps-hint">Tap a mouse for its card. Hold it to drag it to another post; drop it on a mouse to swap them.</p>';
    if (K.posts(s).some((p) => p.skill === 'research')) h += '<div class="mx-grp" data-rock="lab"><div class="mx-box mx-ghead" style="cursor:default"><img class="pix" src="' + MXSP + 'ic_flask.png" alt="" style="width:18px;height:20px"><span class="mx-t"><b>LAB</b><span>Researches for the colony</span></span><span></span></div><div class="mx-crew mx-c2">' + mxPost(s, 'research', 'all', sel, true).replace('--zw2:#2a2433', '--zw2:#22302a') + '</div></div>';
    const zc = (MXZ[tier()] || MXZ.cheddar)[0];
    for (const [skill, st, name, ic] of STATIONS) {
      if (st !== 'mine' && !c.s.built[st]) continue;
      const open = sel || (ui.rockOpen && ui.rockOpen[st] !== undefined ? ui.rockOpen[st] : true);
      const list = all.filter((p) => p.st === st), cmb = mxCombos(s, st, ui), crew = list.map((p) => K.at(s, p.skill, p.zone));
      const faces = open ? '' : '<span class="mx-faces">' + crew.map((m) => (m ? '<i class="mx-mini' + (m.rarity ? ' mx-r' + m.rarity : '') + (canPromote(s, m) ? ' mx-due' : '') + '">' + mxM('m:' + m.id + ':' + skill) + '</i>' : '<i class="mx-mini mx-empty"><span class="mx-nm" style="color:var(--gold)">+</span></i>')).join('') + '</span>';
      const icSrc = ic ? MXSP + ic + '.png' : mxJobIc(skill);
      h += '<div class="mx-grp' + (open ? '' : ' mx-collapsed') + '" data-zone="' + tier() + '" data-rock="' + st + '" style="--zw:' + zc[0] + ';--zl:' + zc[1] + ';--zd:' + zc[2] + '">' +
        '<div role="button" class="mx-box mx-ghead" data-act="' + (sel ? 'noop' : 'rocktoggle:' + st) + '"><img class="pix" src="' + icSrc + '" alt="" style="width:21px"><span class="mx-t"><b>' + name + '</b><span>LV ' + c.stLv[st] + ' · stage ' + c.phase[st] + ' <i>· ' + plural(cmb.n, 'combo') + '</i></span></span><span class="mx-right">' + faces + '<span class="mx-act">' + mxI(open ? 'chevU' : 'chevD', 2) + '</span></span></div>';
      if (open) h += '<div class="mx-crew mx-c4">' + list.map((p) => mxPost(s, p.skill, p.zone, sel)).join('') + '</div>' + cmb.html;
      h += '</div>';
    }
    const sets = (c.s.team && c.s.team.sets) || [];
    if (sets.length) h += '<div class="mx-box mx-combos mx-open"><div class="mx-cmb-list"><div class="mx-cmb-h">Whole line · the four running MINE to CHEESE</div>' + sets.map((d) => '<div class="mx-cmb-row"><span class="mx-who"><img class="pix" src="' + MXSP + 'ic_raw_' + tier() + '.png" alt="" style="width:18px"></span><span class="mx-t"><b>' + d.name + '</b><span>' + d.desc.split(':')[0] + '</span></span><span class="mx-chip">' + effTxt(d.eff) + '</span></div>').join('') + '</div></div>';
    if (idle.length) {
      h += '<div class="mx-ps-h"><b>NO POST · ' + idle.length + '</b><small>tap one to place it</small></div><div class="mx-ps-list">';
      for (const m of idle) h += '<div role="button" class="mx-box mx-ps-row" data-act="pickmouse:' + m.id + '" data-mouse="' + m.id + '"><span class="mx-pt' + (m.rarity ? ' mx-r' + m.rarity : '') + '">' + mxM('m:' + m.id) + '</span><span class="mx-t"><b>' + esc(m.name) + '<em>LV ' + K.level(m) + '</em></b><span class="mx-from mx-free">Waiting in the house</span><span class="mx-tags">' + mxTags(m, '', 2) + '</span></span><span class="mx-v"><span class="mx-put">PLACE</span></span></div>';
      h += '</div>';
    }
    return h;
  }
  const EFF_WORD = { speed: 'speed', yield: 'output', double: 'chance of double', awaySpeed: 'speed while away', depthSpeed: 'speed per depth level', depthYield: 'output per depth level', recipeYield: 'output per recipe known', auraNext: 'speed for the next mouse', labCost: 'Cheese Base per research', labLuck: 'chance of a breakthrough', labFail: 'inconclusive results', labBonus: 'chance of a second recipe' };
  const RANK_LOOK = ['no scarf', 'a blue scarf', 'the hat of its trade, a red scarf and a medal', 'a suit, a gold tie, a gold-brimmed hat and a manager\'s clipboard'];
  const signed = (n) => (n < 0 ? '-' : '+') + Math.round(Math.abs(n) * 100) + '%';
  const times = (n) => 'x' + (Math.round(n * 100) / 100).toFixed(2);
  const plural = (n, word) => n + ' ' + (n === 1 ? word : word === 'mouse' ? 'mice' : word + 's');
  const whole = (n) => CM.fmt(Math.floor(n));
  function gradeNumbers(id, grade) {
    const def = T[id];
    return Object.keys(def.eff)
      .map((k) => M.gradeMult.map((g, i) => (i + 1 === grade ? '<b>' : '') + (def.eff[k] < 0 ? '' : '+') + round1(def.eff[k] * g * 100) + '%' + (i + 1 === grade ? '</b>' : '')).join(' / ') + ' ' + (EFF_WORD[k] || k))
      .join(', ');
  }
  function traitDesc(id, grade) {
    const def = T[id];
    if (def.job) return def.desc + ': ' + gradeNumbers(id, grade || 0) + (grade ? '' : ' (grade I / II / III)');
    const parts = def.desc.split(', but ');
    if (def.kind === 'quirk') return '<span class="tbad">' + parts[0] + '</span>' + (parts[1] ? ', but <span class="tok">' + parts[1] + '</span>' : '');
    return parts[0] + (parts[1] ? ', but <span class="tbad">' + parts[1] + '</span>' : '');
  }
  const JOB_SHORT = { mining: 'Mine', drilling: 'Drill', refining: 'Refine', cheesemaking: 'Cheese', trading: 'Sell', research: 'Lab' };
  const quirksOf = (m) => m.traits.concat(m.learned).filter((id) => T[id] && T[id].kind === 'quirk');
  const legendsOf = (m) => CM.mice.traitsOf(m).filter((t) => T[t.id].kind === 'legend');
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const ROSTER_SORT = [['post', 'Post'], ['level', 'Level'], ['rarity', 'Rarity'], ['power', 'Output']];
  const ROSTER_SHOW = [['all', 'All'], ['free', 'No post'], ['legend', 'Legendary'], ['promote', 'Promote'], ['quirk', 'Quirks']];
  const RARITY_NAME = ['', 'Rare', 'Legendary'];
  const MXJ = { mining: 'MINE', drilling: 'DRILL', refining: 'REFINE', cheesemaking: 'CHEESE', trading: 'SELL', research: 'LAB' };
  const MXSP = 'assets/main2/out/sprites/';
  const mxX = (n) => 'x' + (n >= 10 ? Math.round(n) : (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''));
  const mxI = (k, scale, cls) => '<canvas class="pix' + (cls ? ' ' + cls : '') + '" data-ic="' + k + '" data-k="' + (scale || 2) + '"></canvas>';
  const mxM = (key, cls) => '<canvas' + (cls ? ' class="' + cls + '"' : '') + ' width="22" height="20" data-crew="' + key + '"></canvas>';
  const mxHearts = (n, max) => '<span class="mx-hh">' + Array.from({ length: max || 2 }, (_, i) => mxI(i < n ? 'heart' : 'heartE', 1)).join('') + '</span>';
  const mxCoin = (w) => '<img class="pix" src="' + MXSP + 'ic_coin.png" alt="" style="width:' + (w || 21) + 'px;height:' + (w || 21) + 'px">';
  const TK = { legend: 'l', job: 'j', quirk: 'q', good: 'g' };
  const effTxt = (e) => Object.keys(e).map((k) => '+' + Math.round(e[k] * 100) + '% ' + ({ speed: 'faster', yield: 'more', double: 'double', awaySpeed: 'faster away' }[k] || k)).join(' · ');
  const mxNote = (cls, icon, n, label, act) => '<div role="button" class="mx-box mx-note mx-' + cls + '" data-act="' + act + '">' + icon + '<b>' + n + '</b><span>' + label + '</span>' + mxI('go', 2, 'mx-go') + '</div>';
  const mxCare = (s, m) => (s.care && s.care.id === m.id ? s.care : null);
  const mxRankI = (r, k) => (r ? mxI('rank' + Math.min(3, r), k || 2) : '');
  const mxPct = (e) => { const v = Object.values(e || {})[0] || 0; return '+' + Math.round(v * 100) + '%'; };
  const mxBtn = (cls, label, small, act) => '<span role="button" class="mx-fc-btn ' + cls + '"' + (act ? ' data-act="' + act + '"' : '') + '><b>' + label + '</b>' + (small ? '<small>' + small + '</small>' : '') + '</span>';
  function mxHire(s, payAct, waitAct) {
    const head = '<span class="mx-h">' + mxI('head', 2) + '</span>';
    if (s.candidates.length) return '<div class="mx-box mx-hire">' + head + '<span class="mx-who"><b>3 MICE WAITING</b><span>Already paid' + (s.candidatesFor ? ', for ' + CM.mice.postLabel(s.candidatesFor) : '') + '. They wait until you choose.</span></span><div role="button" class="mx-box mx-price mx-go" data-act="' + waitAct + '">CONTINUE</div></div>';
    const cost = CM.mice.recruitCost(s), short = s.coins < cost;
    return '<div class="mx-box mx-hire">' + head + '<span class="mx-who"><b>FIND NEW MICE</b><span>' + (short ? 'Not enough coins yet.' : 'Meet 3 candidates. Choose one to hire.') + '</span></span><div role="button" class="mx-box mx-price' + (short ? ' mx-short' : '') + '"' + (short ? '' : ' data-act="' + payAct + '"') + ' data-cost="' + cost + '">' + mxCoin() + CM.fmt(cost) + '</div></div>';
  }
  function mxTags(m, skill, max) {
    const order = { l: 0, j: 1, g: 2, q: 3 };
    const list = CM.mice.traitsOf(m).map((t) => ({ t, k: TK[T[t.id].kind] || 'g' })).sort((a, b) => order[a.k] - order[b.k]).slice(0, max);
    return (skill && m.aff[skill] ? mxHearts(m.aff[skill]) : '') + list.map(({ t, k }) => '<span class="mx-tag' + (k === 'g' ? '' : ' mx-' + k) + '">' + (k === 'l' ? '★ ' : k === 'q' ? '▼ ' : '') + T[t.id].name + (k === 'j' && t.grade ? ' ' + ROMAN[t.grade] : '') + '</span>').join('');
  }
  function mxPicker(s, ui, key) {
    const K = CM.mice, [skill, zone] = key.split(':'), now = K.at(s, skill, zone);
    const base = now ? K.solo(now, skill, s, zone) : 0;
    let h = '<div class="mx-ps-top" role="button" data-act="unpick"><span class="mx-act">' + mxI('back', 2) + (now ? 'BACK' : 'CANCEL') + '</span><span class="mx-meta">COLONY · ' + mxPostN(key).toUpperCase() + '</span></div>';
    const p = '<span class="mx-p"><img class="pix" src="' + mxJobIc(skill, zone) + '" alt="">' + mxPostN(key).toUpperCase() + '</span>';
    h += '<div class="mx-box mx-ps-head"><div class="mx-fc-niche' + (now ? (now.rarity ? ' mx-r' + now.rarity : '') : ' mx-empty') + '" style="--zw2:' + mxWall(zone) + '"' + (now ? ' data-hero="pick:' + key + '" data-hero-crew="m:' + now.id + ':' + skill + '" data-enter' : '') + '><i class="mx-bricks"></i><i class="mx-shadow"></i>' +
      (now ? '<canvas class="mx-m" width="22" height="20"></canvas><div class="mx-fc-nfx"></div>' : mxM('ghost', 'mx-ghost')) + '</div><div class="mx-ps-id">' +
      (now ? '<span class="mx-k">WHO WORKS AT</span>' + p + '<span class="mx-who">' + esc(now.name) + '<em>here now</em></span><span class="mx-out"><b class="mx-ov">' + mxX(base) + '</b><small>ALONE</small></span><span class="mx-rate">' + mouseRate(s, now, skill, zone) + '</span>'
        : '<span class="mx-k">ASSIGN A MOUSE TO</span>' + p + '<span class="mx-who" style="color:var(--muted)">Nobody works here</span><span class="mx-rate" style="white-space:normal;margin-top:auto">You do it by hand until a mouse takes it.</span>') + '</div></div>';
    if (!now) h += mxHire(s, 'recruitfor:' + skill + ':' + zone, 'recruitfor:' + skill + ':' + zone) + (s.mice.length ? '<div class="mx-ps-h"><b>OR MOVE ONE YOU HAVE</b><small>free ones first</small></div>' : '');
    const list = s.mice.filter((m) => m !== now).map((m) => ({ m, v: K.solo(m, skill, s, zone) }));
    list.sort(now ? (a, b) => b.v - a.v : (a, b) => (a.m.post ? 1 : 0) - (b.m.post ? 1 : 0) || b.v - a.v);
    if (!list.length) return h + (now ? '<p class="mx-ps-hint">You have no other mouse. Find new mice in COLONY.</p>' : '');
    h += '<p class="mx-ps-hint">' + (now ? 'Tap a mouse to put it here: it swaps places with <b>' + esc(now.name) + '</b>. The number is what each would do <b>on its own</b> at this post; neighbours and combos can change it.' : 'Tap a mouse to put it here. The number is what it would do <b>on its own</b> here; neighbours and combos can change it.') + '</p><div class="mx-ps-list">';
    for (const { m, v } of list) {
      const d = v - base;
      const from = !now ? (m.post ? '<span class="mx-from mx-leaves">Leaves ' + mxPostN(m.post) + ' empty</span>' : '<span class="mx-from mx-free">Unassigned · in the house</span>')
        : m.post ? '<span class="mx-from"><img class="pix" src="' + mxJobIc(m.post.split(':')[0], m.post.split(':')[1]) + '" alt=""><span class="mx-at">Now at </span>' + mxPostN(m.post) + '<span class="mx-sw"> · swaps</span></span>' : '<span class="mx-from mx-free">Free</span>';
      h += '<div role="button" class="mx-box mx-ps-row" data-act="post:' + m.id + ':' + key + '"><span class="mx-pt' + (m.rarity ? ' mx-r' + m.rarity : '') + '" style="--zw2:' + (m.post ? mxWall(m.post.split(':')[1]) : '#2a2433') + '">' + mxM('m:' + m.id + ':' + skill) + '</span>' +
        '<span class="mx-t"><b>' + esc(m.name) + '<em>' + (m.rank ? mxI('rank' + Math.min(3, m.rank), 1.5) : '') + 'LV ' + K.level(m) + '</em></b>' + from + '<span class="mx-tags">' + mxTags(m, skill, now ? 3 : 2) + '</span></span>' +
        '<span class="mx-v"><b>' + mxX(v) + '</b>' + (now ? '<span class="mx-d ' + (d > 0.05 ? 'mx-up">▲ +' : d < -0.05 ? 'mx-dn">▼ ' : 'mx-eq">= ') + (Math.round(d * 10) / 10).toFixed(1) + '</span>' : '<span class="mx-put">PUT HERE</span>') + '</span></div>';
    }
    h += '</div>';
    if (now) h += '<div style="display:flex;justify-content:flex-end"><span class="mx-act mx-send" data-act="post:' + now.id + ':">SEND ' + esc(now.name).toUpperCase() + ' TO REST</span></div>';
    return h;
  }
  function mxRecruit(s, ui) {
    const K = CM.mice;
    const cands = s.candidates.map((c) => K.normalize(Object.assign({ xp: 0, rank: 0 }, c)));
    const best = cands.reduce((b, c, i) => ((c.rarity || 0) > (cands[b].rarity || 0) ? i : b), 0);
    const at = ui.cand >= 0 && ui.cand < cands.length ? ui.cand : best, c = cands[at];
    const free = K.posts(s).filter((p) => !K.at(s, p.skill, p.zone));
    const want = s.candidatesFor ? free.find((p) => p.key === s.candidatesFor) : null;
    const RN = ['Common', 'Rare', 'Legendary'];
    let h = '<div class="mx-rc-top" role="button" data-act="recruitlater"><span class="mx-act">' + mxI('back', 2) + 'LATER</span><span class="mx-meta"></span></div>';
    h += '<div class="mx-rc-head"><small>ALREADY PAID · THEY WAIT IF YOU LEAVE</small><b>CHOOSE WHO TO HIRE</b></div>';
    if (s.candidatesFor) { const [fk, fz] = s.candidatesFor.split(':'); h += '<div class="mx-box mx-rc-for' + (want ? '' : ' mx-gone') + '"><img class="pix" src="' + mxJobIc(fk, fz) + '" alt=""><span><small>HIRING FOR</small><b>' + mxPostN(s.candidatesFor).toUpperCase() + (want ? '' : '<span class="mx-filled">FILLED</span>') + '</b>' + (want ? '' : '<em>Filled meanwhile: the new mouse arrives unassigned and you choose its post</em>') + '</span></div>'; }
    h += '<div class="mx-rc-cards" data-reveal="' + cands.map((x) => x.name).join('|') + '">' + cands.map((x, i) => '<div role="button" class="mx-rc-card mx-r' + (x.rarity || 0) + (i === at ? ' mx-on' : '') + '" data-act="cand:' + i + '" data-rar="' + (x.rarity || 0) + '"><span class="mx-st">' + mxM('c:' + i) + '</span><b>' + esc(x.name) + '</b><small class="mx-rar mx-r' + (x.rarity || 0) + '">' + RN[x.rarity || 0] + '</small></div>').join('') + '</div>';
    const sparks = c.rarity === 2 ? [0, 1, 2].map((i) => '<i class="mx-spark" style="left:' + [12, 84, 70][i] + '%;top:' + [24, 36, 12][i] + '%;animation-delay:' + i * 0.5 + 's"></i>').join('') : '';
    h += '<div class="mx-box mx-rc-hero"><div class="mx-fc-niche' + (c.rarity ? ' mx-r' + c.rarity : '') + '" style="--zw2:#2a2433" data-hero="rc" data-hero-crew="c:' + at + '" data-enter><i class="mx-bricks"></i><i class="mx-shadow"></i><canvas class="mx-m" width="22" height="20"></canvas><div class="mx-fc-nfx"></div>' + sparks + '</div>' +
      '<div class="mx-rc-id"><span class="mx-fc-name"><b>' + esc(c.name) + '</b></span><span class="mx-rar mx-r' + (c.rarity || 0) + '">' + RN[c.rarity || 0].toUpperCase() + (c.rarity ? ' · ' + Math.round(RARITY[c.rarity].bonus * 100) + '% faster at any job' : '') + '</span><span class="mx-lv"><b><small>LV</small>1</b></span></div></div>';
    const zz = want ? want.zone : 'cheddar';
    h += '<div style="display:flex;flex-direction:column;gap:10px"><div class="mx-fc-aff">' + K.JOBS.map((k) => '<i class="mx-a' + (c.aff[k] || 0) + '"><img class="pix" src="' + mxJobIc(k, zz) + '" alt=""><em>' + MXJ[k] + '</em>' + mxHearts(c.aff[k] || 0) + '</i>').join('') + '</div>' +
      '<div class="mx-fc-legend"><span>' + mxHearts(1, 1) + M.affinity[1].name + ' +' + Math.round(M.affinity[1].speed * 100) + '%</span><span>' + mxHearts(2, 2) + M.affinity[2].name + ' +' + Math.round(M.affinity[2].speed * 100) + '% faster</span></div></div>';
    h += '<div class="mx-rc-traits">' + c.traits.map((id) => { const k = TK[T[id].kind] || 'g'; return '<div class="mx-fc-tr mx-' + k + '"><span class="mx-t"><b>' + (k === 'q' ? '▼ ' : k === 'l' ? '★ ' : '') + T[id].name + '</b><span>' + (k === 'q' ? '<span class="mx-bad">' + traitDesc(id) + '</span>' : traitDesc(id)) + '</span></span></div>'; }).join('') + '</div>';
    const liked = free.filter((p) => c.aff[p.skill]);
    h += '<div class="mx-box mx-rc-fit"><small>IN YOUR COLONY</small>' + (want ? '<span>It would start at <b>' + mxPostN(want.key) + '</b>: ' + mouseRate(s, c, want.skill, want.zone) + '.</span>' : '<span>It arrives <b>unassigned</b>: after hiring you choose its post.</span>') + (liked.length ? '<span>Empty posts it likes: ' + liked.slice(0, 3).map((p) => mxPostN(p.key)).join(', ') + '.</span>' : '') + '<span class="mx-q">What it becomes later is for you to find out.</span></div>';
    return h + '<span role="button" class="mx-fc-go" data-act="choose:' + at + '">HIRE ' + esc(c.name).toUpperCase() + '</span>';
  }
  function mxTabs(s, view) {
    const todo = s.mice.filter((m) => canPromote(s, m)).length;
    const tab = (v, name, extra) => '<div role="button" class="mx-box mx-tab' + (view === v ? ' mx-sel' : '') + '" data-act="miceview:' + v + '"><span class="mx-nm">' + name + '</span>' + (extra || '') + '</div>';
    return '<div class="mx-tabs">' + tab('rocks', 'COLONY') + tab('roster', 'ROSTER', '<span class="mx-meta">' + s.mice.length + '</span>' + (todo ? '<span class="mx-badge">' + todo + '</span>' : '')) + tab('house', 'HOUSE') + '</div>';
  }
  function mxSec(ui, id, title, count, sub, body, open) {
    const on = ui.cardSec && ui.cardSec[id] !== undefined ? ui.cardSec[id] : open;
    return '<div class="mx-box mx-fc-sec' + (on ? ' mx-open' : '') + '"><div class="mx-fc-sh" role="button" data-act="sec:' + id + '"><span class="mx-t"><b>' + title + '</b>' + (count !== '' ? '<i>' + count + '</i>' : '') + (sub ? '<span class="mx-sub">' + sub + '</span>' : '') + '</span><span class="mx-act">' + (on ? 'HIDE' + mxI('chevU', 2) : 'SHOW' + mxI('chevD', 2)) + '</span></div><div class="mx-fc-sb"><div><div>' + (on ? body : '') + '</div></div></div></div>';
  }
  function mxPromo(s, m) {
    const K = CM.mice, pr = K.promoteInfo(s, m);
    if (pr.maxed) return '';
    const nr = m.rank + 1, of = 'Rank ' + (nr + 1) + ' of ' + M.ranks.length;
    if (!pr.levelOk) {
      const lv = K.level(m), base = M.ranks[m.rank].level, pct = Math.round(Math.min(1, (lv - base) / Math.max(1, pr.next.level - base)) * 100);
      return '<div class="mx-box mx-fc-promo mx-wait"><div class="mx-fc-ph"><b>' + pr.next.name.toUpperCase() + ' AT LV ' + pr.next.level + '</b><small>' + of + '</small></div><div class="mx-fc-wait"><span class="mx-bar"><i style="width:' + pct + '%"></i></span><small>' + plural(pr.levelsLeft, 'level') + ' to go, then ' + mxCoin(10) + CM.fmt(pr.cost) + (m.post ? '' : ' · only on a post') + '</small></div></div>';
    }
    const [skill, zone] = m.post ? m.post.split(':') : [];
    const next = Object.assign({}, m, { rank: nr });
    const pct = skill ? Math.round((K.speed(next, skill, s, zone) / K.speed(m, skill, s, zone) - 1) * 100) : 0;
    const gains = [pct > 0 ? 'Works ' + pct + '% faster here' : 'Works faster at any job'];
    if (pr.next.manager) gains.push('<span><b>AUTO-UPGRADES:</b> buys its job\'s cheapest upgrades</span>');
    gains.push('New look: ' + RANK_LOOK[nr]);
    const k = pr.can ? 'mx-ready' : 'mx-short', sk = skill || '';
    const fig = (cls, crew, r) => '<figure class="mx-fc-pfig ' + cls + '"><span class="mx-st">' + mxM(crew) + (r ? mxI('rank' + Math.min(3, r), 2, 'mx-ins') : '') + (cls === 'mx-to' && pr.can ? [0, 1, 2].map((i) => '<i class="mx-tw" style="left:' + [10, 58, 40][i] + 'px;top:' + [14, 22, 6][i] + 'px;animation-delay:' + i * 0.6 + 's"></i>').join('') : '') + '</span></figure>';
    return '<div class="mx-box mx-fc-promo ' + k + '"><div class="mx-fc-ph"><b>' + (pr.can ? mxI('up', 2) + 'PROMOTION READY' : 'PROMOTION · SAVE UP') + '</b><small>' + of + '</small></div>' +
      '<div class="mx-fc-pbody"><div class="mx-fc-pstage">' + fig('mx-now', 'm:' + m.id + ':' + sk, m.rank) + fig('mx-to', 'm:' + m.id + ':' + sk + ':' + nr, nr) + '<span class="mx-fc-parrow">' + mxI('arrowR', 2) + '</span></div><ul class="mx-fc-gains">' + gains.map((g) => '<li>' + g + '</li>').join('') + '</ul></div>' +
      '<div role="button" class="mx-fc-go' + (pr.can ? '' : ' mx-off') + '"' + (pr.can ? ' data-act="promote:' + m.id + '"' : '') + '>PROMOTE TO ' + pr.next.name.toUpperCase() + '<span>' + mxCoin(14) + CM.fmt(pr.cost) + (pr.can ? '' : ' · ' + CM.fmt(pr.cost - s.coins) + ' short') + '</span></div></div>';
  }
  function mxCareBox(s, m) {
    const c = mxCare(s, m); if (!c) return '';
    const pct = Math.round((1 - c.remaining / c.total) * 100), where = m.post ? CM.mice.postLabel(m.post) : 'the house';
    if (c.kind === 'quirk') return '<div class="mx-fc-slot mx-open"><div><div class="mx-box mx-fc-care mx-bed"><div class="mx-h"><b>' + mxI('bed', 2) + 'THE BED</b><small class="mx-left">' + clock(c.remaining) + ' left</small></div><p>Treating <span style="color:#ff8a96;font-weight:800">▼ ' + T[c.what].name + '</span>. It keeps working at ' + where + '.</p><span class="mx-bar"><i style="width:' + pct + '%"></i></span></div></div></div>';
    const g = Math.max(1, CM.mice.gradeOf(m, c.what));
    return '<div class="mx-fc-slot mx-open"><div><div class="mx-box mx-fc-care mx-train"><div class="mx-h"><b>' + mxI('book', 2) + 'TRAINING ROOM</b><small class="mx-left">' + clock(c.remaining) + ' left</small></div><p>Retraining <b style="color:#9cc0f4">' + T[c.from || m.spec[c.what]].name + ' ' + ROMAN[g] + '</b> → <span class="mx-q">? ' + ROMAN[g] + '</span> random among the other 4, keeps grade ' + ROMAN[g] + '.</p><span class="mx-bar"><i style="width:' + pct + '%"></i></span></div></div></div>';
  }
  function mxGm(s, m) {
    if (!CM.milestones.has(s, 'master')) return '';
    const MS = CM.milestones, jobs = Math.floor((m.jobs && m.jobs.cheesemaking) || 0), grade = MS.masterGrade(m);
    const pct = (g) => '+' + Math.round(g * B.milestones.master.per * 100) + '%';
    const next = 'Next grade at ' + CM.fmt(MS.masterNext(grade)) + ' batches cooked (now ' + CM.fmt(jobs) + ').';
    if (s.master === m.id) {
      const cooking = m.post && m.post.split(':')[0] === 'cheesemaking';
      return '<div class="mx-box mx-fc-gm mx-on"><span class="mx-t"><b>' + mxI('star', 2) + 'GRAND MASTER' + (grade ? ' ' + romanN(grade) : '') + '</b><small>' + (grade ? 'The cheese it cooks is worth ' + pct(grade) + '. ' : 'No grade yet. ') + next + '</small>' + (cooking ? '' : '<small class="mx-warn">The title only counts while it cooks: put it on a Cheesemaking post.</small>') + '</span></div>';
    }
    const cur = MS.master(s);
    return '<div class="mx-box mx-fc-gm"><span class="mx-t"><b>' + mxI('star', 2) + 'GRAND MASTER</b><small>' + (cur ? esc(cur.name) + ' holds the title. ' : 'One mouse in the colony holds the title. ') + 'This one: ' + (grade ? 'grade ' + romanN(grade) + ' (' + pct(grade) + ')' : 'no grade yet') + ' (' + CM.fmt(jobs) + ' of ' + CM.fmt(MS.masterNext(grade)) + ' batches cooked).</small></span><span class="mx-act" data-act="namemaster:' + m.id + '">' + (cur ? 'GIVE IT<br>THE TITLE' : 'NAME<br>GRAND MASTER') + '</span></div>';
  }
  function mxCard(s, ui, m) {
    const K = CM.mice, p = K.xpProgress(m), [skill, zone] = m.post ? m.post.split(':') : [];
    const care = mxCare(s, m), due = canPromote(s, m);
    const st = care ? (care.kind === 'spec' ? 'train' : 'bed') : !m.post ? 'free' : due ? 'due' : '';
    const rar = m.rarity || 0, idx = s.mice.indexOf(m);
    let h = mxTabs(s, ui.miceView === 'roster' || ui.miceView === 'house' ? ui.miceView : 'rocks') + '<div class="mx-fc-back" role="button" data-act="back"><span class="mx-act">' + mxI('back', 2) + (ui.miceView === 'roster' ? 'ROSTER' : 'COLONY') + '</span><span class="mx-meta">' + (idx + 1) + ' of ' + s.mice.length + '</span></div>';
    // Héroe: el nicho grande con la pared de su roca y el ratón vivo; al lado, quién es.
    h += '<div class="mx-box mx-fc-hero"><div class="mx-fc-niche' + (rar ? ' mx-r' + rar : '') + (st === 'bed' ? ' mx-bed' : st === 'train' ? ' mx-train' : '') + '" style="--zw2:' + (zone ? mxWall(zone) : '#2a2433') + '" data-hero="card:' + m.id + '" data-hero-crew="m:' + m.id + ':' + (skill || '') + '" data-st="' + st + '" data-lv="' + p.level + '" data-cer data-enter><i class="mx-bricks"></i><i class="mx-shadow"></i><canvas class="mx-m" width="22" height="20"></canvas><div class="mx-fc-nfx"></div>' +
      (st === 'bed' ? '<span class="mx-zz" style="left:66%;top:14px">Z</span><span class="mx-zz" style="left:78%;top:26px;animation-delay:1s">z</span>' : '') +
      (rar === 2 ? [0, 1, 2].map((i) => '<i class="mx-spark" style="left:' + [12, 84, 70][i] + '%;top:' + [24, 36, 12][i] + '%;animation-delay:' + i * 0.5 + 's"></i>').join('') : '') + '</div>' +
      '<div class="mx-fc-id"><span class="mx-fc-name"><b>' + esc(m.name) + '</b>' + (m.id === GM ? mxI('star', 2) : '') + '</span><span class="mx-fc-who"><span class="mx-rk">' + mxRankI(m.rank) + '</span><span class="mx-rn">' + M.ranks[m.rank].name + '</span><span class="mx-rar mx-r' + rar + '">· ' + RARITY[rar].name + '</span></span>' +
      '<span class="mx-fc-lv"><b><small>LV</small><span class="mx-lvn">' + p.level + '</span></b><span class="mx-xpn">' + (p.maxed ? 'MAX' : whole(p.cur) + ' / ' + whole(p.need) + ' XP') + '</span></span><span class="mx-fc-xp"><i style="width:' + (p.maxed ? 100 : Math.round((p.cur / p.need) * 100)) + '%"></i></span></div><div class="mx-fc-hfx"></div></div>';
    // Trabajo de hoy, con MOVE (el flujo de siempre: COLONY con el ratón elegido).
    h += skill ? '<div class="mx-box mx-fc-job" role="button" data-act="pickmouse:' + m.id + '"><span class="mx-t"><span class="mx-k">WORKS AT</span><span class="mx-p"><img class="pix" src="' + mxJobIc(skill, zone) + '" alt="">' + mxPostN(m.post) + '<span class="mx-x">' + mxX(K.here(s, m)) + '</span></span><span class="mx-r">' + mouseRate(s, m, skill, zone) + '</span></span><span class="mx-act">MOVE</span></div>'
      : '<div class="mx-box mx-fc-job mx-none" role="button" data-act="pickmouse:' + m.id + '"><span class="mx-t"><span class="mx-k">UNASSIGNED</span><span class="mx-p">In the Mouse House</span><span class="mx-r">It only works and levels up on a post</span></span><span class="mx-act mx-go">ASSIGN</span></div>';
    // Afinidades: los seis oficios con sus corazones; la marca, donde trabaja.
    h += '<div class="mx-fc-aff">' + K.JOBS.map((k) => '<i class="mx-a' + ((m.aff && m.aff[k]) || 0) + (k === skill ? ' mx-here' : '') + '"><img class="pix" src="' + mxJobIc(k, zone || 'cheddar') + '" alt=""><em>' + MXJ[k] + '</em>' + mxHearts((m.aff && m.aff[k]) || 0) + '</i>').join('') + '</div>' +
      '<div class="mx-fc-legend"><span>' + mxHearts(1, 1) + M.affinity[1].name + ' +' + Math.round(M.affinity[1].speed * 100) + '%</span><span>' + mxHearts(2, 2) + M.affinity[2].name + ' +' + Math.round(M.affinity[2].speed * 100) + '% faster</span></div>';
    h += mxPromo(s, m) + mxCareBox(s, m) + mxGm(s, m);
    // TRAITS: lo que es. Una manía se trata en la cama.
    const all = m.traits.concat(m.learned).filter((id) => T[id]);
    const order = { legend: 0, job: 1, good: 2, quirk: 3 };
    let tb = all.slice().sort((a, b) => order[T[a].kind] - order[T[b].kind]).map((id) => {
      const k = TK[T[id].kind] || 'g', d = traitDesc(id);
      let act = '';
      if (k === 'q' && s.built.house) {
        const c = s.care, cost = CM.mice.careCost(s, 'quirk');
        act = c && c.id === m.id && c.what === id ? mxBtn('mx-bed mx-on', 'RESTING', clock(c.remaining) + ' left') : c ? mxBtn('mx-busy', 'HOUSE BUSY', clock(c.remaining)) : mxBtn('mx-bed' + (s.coins < cost ? ' mx-short' : ''), 'TREAT', mxCoin(10) + CM.fmt(cost), s.coins < cost ? '' : 'care:' + m.id + ':quirk:' + id);
      }
      return '<div class="mx-fc-tr mx-' + k + '"><span class="mx-t"><b>' + (k === 'q' ? '▼ ' : k === 'l' ? '★ ' : '') + T[id].name + '</b><span>' + (k === 'q' ? '<span class="mx-bad">' + d + '</span>' : d) + '</span></span>' + act + '</div>';
    }).join('');
    tb += '<p class="mx-fc-hint">' + (m.picks >= M.traitSlots ? 'It has developed all its traits.' : 'Next trait at LV ' + (m.picks + 1) * M.traitEvery + (m.post ? ', shaped by its jobs.' : '. It only levels up on a post.')) + (quirksOf(m).length ? ' A quirk can be treated in the bed: ' + Math.round(M.care.ms / 60000) + ' min, and it keeps working.' : '') + '</p>';
    h += mxSec(ui, 'traits', 'TRAITS', all.length, '', tb, true);
    // SPECIALITIES: lo que ha aprendido trabajando; RETRAIN lleva a la TRAINING ROOM con todo elegido.
    const worked = K.JOBS.filter((k) => m.spec[k] || (m.jobs[k] || 0) > 0);
    let sb = worked.map((k) => {
      const id = m.spec[k], grade = K.gradeOf(m, k), n = m.jobs[k] || 0, next = M.jobGrades[id ? grade : 0], from = id && grade ? M.jobGrades[grade - 1] : 0;
      let btnH = '';
      if (id && s.built.house) {
        const c = s.care, cost = CM.mice.careCost(s, 'spec');
        btnH = c && c.id === m.id && c.kind === 'spec' && c.what === k ? mxBtn('mx-train mx-on', 'TRAINING', clock(c.remaining) + ' left') : c ? mxBtn('mx-busy', 'HOUSE BUSY', clock(c.remaining)) : mxBtn('mx-train' + (s.coins < cost ? ' mx-short' : ''), 'RETRAIN', mxCoin(10) + CM.fmt(cost), s.coins < cost ? '' : 'cardtrain:' + m.id + ':' + k);
      }
      return '<div class="mx-fc-sp' + (id ? '' : ' mx-none') + '"><div class="mx-h"><b><img class="pix" src="' + mxJobIc(k, zone || 'cheddar') + '" alt="">' + B.skills[k].name + '<span class="mx-hs">' + mxHearts((m.aff && m.aff[k]) || 0) + '</span></b>' + (id ? '<span class="mx-gr">GRADE ' + ROMAN[grade] + '</span>' : '') + '</div>' +
        (id ? '<span class="mx-n">' + T[id].name + '</span><span class="mx-d">' + traitDesc(id, grade) + '</span>' : '<span class="mx-d">No speciality yet.</span>') +
        '<span class="mx-bar"><i style="width:' + (next ? Math.round(Math.min(1, (n - from) / (next - from)) * 100) : 100) + '%"></i></span>' +
        '<div class="mx-foot"><small>' + (next ? whole(n) + ' / ' + CM.fmt(next) + ' jobs to ' + (id ? 'grade ' + ROMAN[grade + 1] : 'a speciality') : 'Top grade') + (id ? '<br>Retrain: random among the other 4, keeps grade ' + ROMAN[Math.max(1, grade)] + '.' : '') + '</small>' + btnH + '</div></div>';
    }).join('');
    if (!worked.length) sb = '<p class="mx-fc-hint">It has not worked yet. After ' + M.jobGrades[0] + ' jobs in a trade it gets a speciality of that trade on its own.</p>';
    h += mxSec(ui, 'specs', 'SPECIALITIES', worked.filter((k) => m.spec[k]).length, '', sb, false);
    // COMBOS: las suyas y las que forma ahora con sus vecinos y su roca.
    const own = K.combosOf(m), team = G().s.team || { pairs: [], sets: [] };
    const rows = [], gains = [];
    for (const c of own) { rows.push(['<img class="pix" src="' + mxJobIc(skill || 'mining') + '" alt="" style="width:18px">', c.name, c.desc, c.needs.map((id) => T[id].name).join(' + ') + ' · on this mouse', mxPct(c.eff)]); gains.push(c.eff); }
    if (skill) {
      for (const e of team.pairs || []) { if (e.a !== m.id && e.b !== m.id) continue; const o = K.byId(s, e.a === m.id ? e.b : e.a); if (!o) continue; rows.push(['<i class="mx-mini' + (o.rarity ? ' mx-r' + o.rarity : '') + '">' + mxM('m:' + o.id) + '</i>', e.link.name, e.link.desc, 'With ' + esc(o.name) + ' · ' + (e.why === 'line' ? 'next in the line' : 'same crew'), mxPct(e.link.eff)]); gains.push(e.link.eff); }
      const pr = G().s.placed.find((p) => p.m.id === m.id && p.fn === 'pr' && p.st !== 'sell');
      if (pr) for (const d of team.sets || []) { rows.push(['<img class="pix" src="' + MXSP + 'ic_raw_' + tier() + '.png" alt="" style="width:21px">', d.name, d.desc.split(':').pop().trim(), 'The four running the line', mxPct(d.eff)]); gains.push(d.eff); }
    }
    const best = gains.reduce((a, e) => Math.max(a, Object.values(e || {})[0] || 0), 0);
    const cb = rows.length ? rows.map((r) => '<div class="mx-fc-cb"><span class="mx-who">' + r[0] + '</span><span class="mx-t"><b>' + r[1] + '</b><span>' + r[2] + '</span><span>' + r[3] + '</span></span><span class="mx-chip">' + r[4] + '</span></div>').join('') : '<p class="mx-fc-hint">None active. Combos are found by trying: certain traits on one mouse, on neighbours in a crew, or along the whole line.</p>';
    h += mxSec(ui, 'combos', 'COMBOS', rows.length, best ? 'up to +' + Math.round(best * 100) + '%' : '', cb, false);
    // RANK: la escalera de los cuatro.
    const rb = '<div class="mx-fc-rank"><div class="mx-fc-rk">' + M.ranks.map((r, i) => '<i class="' + (i < m.rank ? 'mx-done' : i === m.rank ? 'mx-now' : i === m.rank + 1 ? 'mx-next' : '') + '">' + (i ? mxRankI(i) : '<span style="height:12px"></span>') + '<em>' + r.name + '</em><small>LV ' + r.level + '</small></i>').join('') + '</div><p class="mx-fc-hint">Each rank makes it faster for good. A Manager buys its job\'s cheapest upgrades on its own.</p></div>';
    h += mxSec(ui, 'rank', 'RANK', '', M.ranks[m.rank].name, rb, false);
    return h + '<div class="mx-fc-foot" role="button" data-act="dismiss:' + m.id + '"><span class="mx-act">DISMISS</span></div>';
  }
  function mxRoster(s, ui) {
    const K = CM.mice, sort = ui.miceSort || 'post', show = ui.miceShow || 'all', likes = ui.miceLikes || '';
    const posts = K.posts(s), where = (m) => (m.post ? posts.findIndex((p) => p.key === m.post) : 999);
    const by = { post: (a, b) => where(a) - where(b), level: (a, b) => K.level(b) - K.level(a), rarity: (a, b) => (b.rarity || 0) + legendsOf(b).length * 0.1 - ((a.rarity || 0) + legendsOf(a).length * 0.1) || K.level(b) - K.level(a), power: (a, b) => K.here(s, b) - K.here(s, a) }[sort];
    const pass = { all: () => true, free: (m) => !m.post, legend: (m) => m.rarity === 2 || legendsOf(m).length > 0, promote: (m) => canPromote(s, m), quirk: (m) => quirksOf(m).length > 0 }[show];
    let list = s.mice.filter(pass);
    if (likes) list = list.filter((m) => m.aff && m.aff[likes]);
    list.sort(likes ? (a, b) => m2(b, likes) - m2(a, likes) || by(a, b) : by);
    const nm = (table, id) => table.find((o) => o[0] === id)[1];
    let h = '';
    const ready = s.mice.filter((m) => canPromote(s, m)).length, idle = s.mice.filter((m) => !m.post);
    let notes = '';
    if (ready) notes += mxNote('up', mxI('up', 2), ready, 'to promote', 'promos');
    if (idle.length) notes += mxNote('free', mxI('head', 1), idle.length, 'unassigned', 'rosterfilter:free');
    if (notes) h += '<div class="mx-notes">' + notes + '</div>';
    h += mxHire(s, 'recruit', 'recruitview');
    h += '<div class="mx-box mx-filter" role="button" data-act="rosteropts"><span class="mx-sel"><span>Sort <b>' + nm(ROSTER_SORT, sort) + '</b></span><span>Show <b>' + nm(ROSTER_SHOW, show) + (likes ? ' · likes ' + JOB_SHORT[likes] : '') + '</b></span><em>' + list.length + '/' + s.mice.length + '</em></span><span class="mx-act">' + (ui.rosterOpts ? 'CLOSE' + mxI('chevU', 2) : 'CHANGE' + mxI('chevD', 2)) + '</span></div>';
    if (ui.rosterOpts) {
      const grp = (title, table, act, cur) => '<div><span class="mx-meta">' + title + '</span><div class="mx-row" style="margin-top:6px">' + table.map((o) => '<span role="button" class="mx-opt' + (cur === o[0] ? ' mx-on' : '') + '" data-act="' + act + ':' + o[0] + '">' + o[1] + '</span>').join('') + '</div></div>';
      h += '<div class="mx-optwrap mx-open"><div><div class="mx-box mx-opts">' + grp('Sort by', ROSTER_SORT, 'micesort', sort) + grp('Show', ROSTER_SHOW, 'rosterfilter', show) + grp('Likes the job', K.JOBS.map((k) => [k, JOB_SHORT[k]]), 'rosterlikes', likes) + '</div></div></div>';
    }
    if (!list.length) return h + '<div class="mx-box mx-nores"><span class="mx-scene"><i class="mx-hole" style="left:10px"></i><i class="mx-hole" style="right:10px"></i>' + mxM('ghost') + '</span><b>NO MOUSE MATCHES</b><p>Nobody fits <b style="color:var(--soft)">' + [show !== 'all' && nm(ROSTER_SHOW, show), likes && 'likes ' + JOB_SHORT[likes]].filter(Boolean).join(' + ') + '</b>. Try other filters or show the whole colony.</p><span class="mx-act" data-act="rosterclear">CLEAR FILTERS</span></div>';
    h += '<div class="mx-rlist">';
    let last = null;
    for (const m of list) {
      const [skill, zone] = m.post ? m.post.split(':') : [];
      if (sort === 'post') { const g = m.post ? skill : 'none'; if (g !== last) { h += '<div class="mx-sep">' + (g === 'none' ? 'No post' : mxPostN(m.post).split(' · ')[0]) + '</div>'; last = g; } }
      const care = mxCare(s, m), due = canPromote(s, m);
      const st = care ? (care.kind === 'spec' ? 'train' : 'bed') : !m.post ? 'free' : due ? 'due' : '';
      const chip = st === 'due' ? mxI('up', 1) + 'PROMOTE' : st === 'bed' ? mxI('bed', 1) + 'RESTING ' + Math.max(1, Math.ceil(care.remaining / 60000)) + 'M' : st === 'train' ? mxI('book', 1) + 'TRAINING ' + Math.max(1, Math.ceil(care.remaining / 60000)) + 'M' : st === 'free' ? mxI('house', 1) + 'NO POST' : '';
      const affHere = skill ? (m.aff && m.aff[skill]) || 0 : 0;
      const fav = K.JOBS.filter((k) => m.aff && m.aff[k]).sort((a, b) => m.aff[b] - m.aff[a])[0];
      const favOther = fav && (!m.post || (fav !== skill && m.aff[fav] > affHere)) ? fav : '';
      const ts = CM.mice.traitsOf(m);
      const hs = (n) => '<i class="mx-h" style="display:inline-flex;gap:1px;margin-left:2px">' + Array.from({ length: n }, () => mxI('heart', 1)).join('') + '</i>';
      h += '<div role="button" class="mx-box mx-mrow' + (st ? ' mx-' + st : '') + '" data-act="card:' + m.id + '" data-mouse="' + m.id + '" data-ntr="' + ts.length + '"><span class="mx-pt' + (m.rarity ? ' mx-r' + m.rarity : '') + '" style="--zw2:' + (zone ? mxWall(zone) : '#2a2433') + '">' + mxM('m:' + m.id + ':' + (skill || ''), 'mx-m') +
        (m.rarity === 2 ? [0, 1].map((i) => '<i class="mx-spark" style="left:' + [14, 78][i] + '%;top:' + [20, 40][i] + '%;animation-delay:' + i * 0.6 + 's"></i>').join('') : '') + (st === 'bed' ? '<span class="mx-zz" style="left:58%;top:6px">Z</span><span class="mx-zz" style="left:68%;top:12px;animation-delay:1s">z</span>' : '') + '</span>' +
        '<span class="mx-info"><span class="mx-l1"><b>' + (m.id === GM ? mxI('star', 1.5) : '') + '<span class="mx-nm2">' + esc(m.name) + '</span></b><span class="mx-out">' + (m.post ? mxX(K.here(s, m)) : '') + '</span></span>' +
        '<span class="mx-l2">' + (m.post ? '<span class="mx-where"><img class="pix" src="' + mxJobIc(skill, zone) + '" alt=""><span class="mx-wt">' + mxPostN(m.post) + '</span>' + hs(affHere) + '</span>' : '<span class="mx-where mx-none">Waiting in the house</span>') + '<span class="mx-stw">' + (chip ? '<span class="mx-st">' + chip + '</span>' : '') + '</span></span>' +
        '<span class="mx-l3"><span class="mx-lvl">' + mxRankI(m.rank) + 'LV ' + K.level(m) + '</span>' + (favOther ? '<span class="mx-like"><span class="mx-lw">Likes </span>' + JOB_SHORT[favOther] + hs(m.aff[favOther]) + '</span>' : '') + mxTagsRow(ts) + '</span></span></div>';
    }
    return h + '</div>';
  }
  function mxTagsRow(ts) {
    const order = { l: 0, j: 1, g: 2, q: 3 };
    const list = ts.map((t) => ({ t, k: TK[T[t.id].kind] || 'g' })).sort((a, b) => order[a.k] - order[b.k]);
    return list.slice(0, 2).map(({ t, k }) => '<span class="mx-tag' + (k === 'g' ? '' : ' mx-' + k) + '">' + (k === 'l' ? '★ ' : k === 'q' ? '▼ ' : '') + T[t.id].name + (k === 'j' && t.grade ? ' ' + ROMAN[t.grade] : '') + '</span>').join('') + '<span class="mx-tag mx-more"' + (list.length > 2 ? '' : ' hidden') + '>+' + (list.length - 2) + '</span>';
  }
  function mxBulk(s, ui) {
    const K = CM.mice, sel = ui.promo || {};
    const list = s.mice.map((m) => ({ m, steps: K.promoteSteps(s, m) })).filter((x) => x.steps.length);
    list.sort((a, b) => a.steps[0].cost - b.steps[0].cost || K.level(b.m) - K.level(a.m));
    let h = '<div class="mx-box mx-pb-head"><span class="mx-ic">' + mxI('up', 3) + '</span><span class="mx-t"><b>PROMOTIONS</b><small>A promotion makes a mouse faster for good. Nothing is bought until you confirm.</small></span><span class="mx-act" data-act="promoback">BACK</span></div>';
    const done = ui.promoDone, rite = ui.promoRite && performance.now() - ui.promoRite.at < 1800 ? ui.promoRite.list : [];
    if (done) h += '<div class="mx-box mx-pb-done"><b>' + done.mice + ' ' + (done.mice === 1 ? 'MOUSE' : 'MICE') + ' PROMOTED <span class="mx-ins">' + (ui.promoRite ? ui.promoRite.list.map((it) => mxRankI(it.to, 1.5)).join('') : '') + '</span></b><small>' + plural(done.steps, 'rank') + ' for ' + CM.fmt(done.cost) + ' coins' + (done.managers ? ' · ' + done.managers + ' new ' + (done.managers === 1 ? 'manager' : 'managers') + ' buying upgrades' : '') + '</small></div>';
    // Recién ascendidos: su rito en la fila y, al acabar, se recogen.
    h += '<div class="mx-pb-list">';
    rite.forEach((it, i) => {
      const m = K.byId(s, it.id); if (!m) return;
      const [skill, zone] = m.post ? m.post.split(':') : [];
      h += '<div class="mx-box mx-pb-row mx-on mx-solo mx-done" data-rite="' + it.id + ':' + it.from + ':' + it.to + '" data-i="' + i + '"><span class="mx-duo"><span class="mx-pt mx-now" style="--zw2:' + (zone ? mxWall(zone) : '#2a2433') + '">' + mxM('m:' + m.id + ':' + (skill || '')) + '</span><span class="mx-pt mx-to"></span><span class="mx-arw"></span></span><span class="mx-t"><b>' + esc(m.name) + '<i>LV ' + K.level(m) + '</i></b><span class="mx-path">' + mxRankI(it.to, 1.5) + M.ranks[it.to].name + ' ✓</span>' + (M.ranks[it.to].manager ? '<span class="mx-gain"><span class="mx-mgr">AUTO-UPGRADES on</span></span>' : '') + '</span><span class="mx-side"><span class="mx-cost" style="color:var(--up)">✓</span></span></div>';
    });
    if (!list.length) return h + '</div><p class="mx-pb-empty">' + (done ? 'Nobody else is ready for a promotion.' : 'No mouse is ready for a promotion yet. They get there by working.') + '</p>';
    h += '</div><div class="mx-pb-tools"><span role="button" class="mx-opt" data-act="promoset:all">SELECT ALL</span><span role="button" class="mx-opt" data-act="promoset:afford">AFFORDABLE</span><span role="button" class="mx-opt" data-act="promoset:none">NONE</span></div><div class="mx-pb-list">';
    for (const { m, steps } of list) {
      const to = sel[m.id] && steps.some((x) => x.rank === sel[m.id]) ? sel[m.id] : 0;
      const step = steps.find((x) => x.rank === to) || steps[steps.length - 1];
      const after = Object.assign({}, m, { rank: step.rank }), [skill, zone] = m.post ? m.post.split(':') : [];
      const pctUp = skill ? Math.round((K.speed(after, skill, s, zone) / K.speed(m, skill, s, zone) - 1) * 1000) / 10 : 0;
      const wall = zone ? mxWall(zone) : '#2a2433';
      // Cada paso (insignia y nombre) salta de renglón entero: nunca una insignia sola al final.
      const stp = (html, mid) => '<span' + (mid ? ' class="mx-mid"' : '') + ' style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">' + html + '</span>';
      let path = stp(mxRankI(m.rank, 1.5) + M.ranks[m.rank].name);
      for (let r = m.rank + 1; r <= step.rank; r++) path += stp('› ' + mxRankI(r, 1.5) + (r === step.rank ? '<u>' + M.ranks[r].name + '</u>' : M.ranks[r].name), r < step.rank);
      if (step.rank - m.rank > 1) path += ' <em>' + (step.rank - m.rank) + ' ranks</em>';
      h += '<div role="button" class="mx-box mx-pb-row' + (to ? ' mx-on' : '') + (step.total > s.coins ? ' mx-dear' : '') + '" data-act="promosel:' + m.id + '"><span class="mx-duo"><span class="mx-pt mx-now" style="--zw2:' + wall + '">' + mxM('m:' + m.id + ':' + (skill || '')) + '</span><span class="mx-pt mx-to" style="--zw2:' + wall + '">' + mxM('m:' + m.id + ':' + (skill || '') + ':' + step.rank) + '</span><span class="mx-arw">' + mxI('arrowR', 1.5) + '</span></span>' +
        '<span class="mx-t"><b>' + esc(m.name) + '<i>LV ' + K.level(m) + (m.rarity ? ' · ' + RARITY_NAME[m.rarity] : '') + '</i></b><span class="mx-path">' + path + '</span><span class="mx-gain">' + (skill ? mouseRate(s, after, skill, zone) + ' · <b>+' + pctUp + '% speed</b>' : 'No post: it will work faster once placed') + (M.ranks[step.rank].manager ? ' · <span class="mx-mgr">buys upgrades</span>' : '') + '</span></span>' +
        '<span class="mx-side"><span class="mx-cost">' + mxCoin(12) + CM.fmt(step.total) + '</span><span class="mx-pb-ck">' + mxI('ck', 2) + '</span></span></div>';
    }
    h += '</div>';
    const plan = K.promoteCost(s, sel), short = plan.cost > s.coins;
    h += '<div class="mx-pb-foot"><div class="mx-pb-sum"><b>' + (plan.steps ? plural(plan.mice, 'mouse', 'mice') + ' · ' + plural(plan.steps, 'rank') : 'Select mice to promote') + '</b>' +
      (plan.steps ? '<span class="mx-cost' + (short ? ' mx-short' : '') + '">' + mxCoin(14) + '<strong>' + CM.fmt(plan.cost) + '</strong><span>of ' + CM.fmt(s.coins) + (short ? ' · <span class="mx-sh">' + CM.fmt(plan.cost - s.coins) + ' short</span>' : '') + '</span></span>' : '<span class="mx-cost"><span>Tap a mouse, or SELECT ALL</span></span>') + '</div>' +
      '<span role="button" class="mx-pb-go' + (plan.steps && !short ? ' mx-ready' : '') + '"' + (plan.steps && !short ? ' data-act="promogo"' : '') + '>' + (plan.steps ? 'PROMOTE ' + plan.mice : 'PROMOTE') + '</span></div>';
    return h;
  }
  function mxHouse(s, ui) {
    const K = CM.mice, room = ui.houseRoom === 'training' ? 'train' : 'bed';
    const c = s.care, pc = c && K.byId(s, c.id), mins = Math.round(M.care.ms / 60000);
    const tc = K.careCost(s, 'quirk'), rc = K.careCost(s, 'spec');
    const stOf = (kind) => (!pc ? 'free' : (c.kind === 'quirk') === (kind === 'bed') ? esc(pc.name) + ' · ' + clock(c.remaining) : 'waits');
    const used = (kind) => pc && (c.kind === 'quirk') === (kind === 'bed');
    const door = (kind) => '<div role="button" class="mx-box mx-hs-door mx-' + kind + (room === kind ? ' mx-on' : '') + (used(kind) ? ' mx-used' : '') + '" data-act="houseroom:' + (kind === 'bed' ? 'bed' : 'training') + '"><span class="mx-ic">' + mxI(kind === 'bed' ? 'bed' : 'book', 3) + '</span><span class="mx-t"><b>' + (kind === 'bed' ? 'THE BED' : 'TRAINING') + '</b><small>' + stOf(kind) + '</small></span></div>';
    let h = '<div class="mx-hs-rooms">' + door('bed') + door('train') + '</div>';
    // La sala elegida: quién está, cómo acabó el último o libre / esperando.
    const mine = used(room), last = !pc && ui.careLast && (ui.careLast.kind === 'quirk') === (room === 'bed') ? K.byId(s, ui.careLast.id) : null;
    const mode = mine ? 'busy' : pc ? 'waits' : last ? 'done' : 'free', who = mine ? pc : last;
    const prog = mine ? 1 - c.remaining / c.total : 0;
    h += '<div class="mx-box mx-hs-room" data-room="' + room + '" data-mode="' + mode + '" data-crew="' + (who ? 'm:' + who.id : 'ghost') + '" data-prog="' + prog.toFixed(2) + '"><canvas class="mx-sc" width="116" height="58"></canvas><div class="mx-fx">' + (room === 'bed' ? '<span class="mx-zz" style="left:62%;top:24%' + (mode === 'busy' ? '' : ';visibility:hidden') + '">Z</span><span class="mx-zz" style="left:67%;top:16%;animation-delay:1s' + (mode === 'busy' ? '' : ';visibility:hidden') + '">z</span>' : '') + '</div>' + (mode === 'waits' ? '<i class="mx-dim"></i>' : '') + '</div>';
    const where = (m) => (m.post ? K.postLabel(m.post) : 'the house');
    let info = '';
    if (room === 'bed') {
      if (mode === 'busy') info = '<div class="mx-h"><b>' + esc(pc.name) + '</b><small class="mx-left">' + clock(c.remaining) + ' left</small></div><p>Treating <span class="mx-bad">▼ ' + T[c.what].name + '</span>. It keeps working at ' + where(pc) + '.</p><span class="mx-bar"><i style="width:' + Math.round(prog * 100) + '%"></i></span>';
      else if (mode === 'done') info = '<div class="mx-h"><b>' + esc(last.name) + ' is out of bed</b></div><p>No more <span class="mx-bad">▼ ' + T[ui.careLast.what].name + '</span>. The bed is free.</p>';
      else if (mode === 'waits') info = '<div class="mx-h"><b>The bed waits: the house is busy</b></div><p>The house looks after one mouse at a time: <b>' + esc(pc.name) + '</b> is in the TRAINING ROOM for ' + clock(c.remaining) + '.</p>';
      else info = '<div class="mx-h"><b>The bed is free</b></div><p>Pick a mouse with a quirk below.</p>';
    } else {
      const g = mine ? Math.max(1, K.gradeOf(pc, c.what)) : 0;
      if (mode === 'busy') info = '<div class="mx-h"><b>' + esc(pc.name) + ' is retraining</b><small class="mx-left">' + clock(c.remaining) + ' left</small></div><p><b style="color:#9cc0f4">' + T[c.from || pc.spec[c.what]].name + ' ' + ROMAN[g] + '</b> → <span class="mx-q">? ' + ROMAN[g] + '</span> · random, keeps grade ' + ROMAN[g] + '. It keeps working at ' + where(pc) + '.</p><span class="mx-bar"><i style="width:' + Math.round(prog * 100) + '%"></i></span>';
      else if (mode === 'done') info = '<div class="mx-h"><b>' + esc(last.name) + ' finished training</b></div><p>Now a <b style="color:#9cc0f4">' + T[ui.careLast.to].name + '</b>. The training room is free.</p>';
      else if (mode === 'waits') info = '<div class="mx-h"><b>The room waits: the house is busy</b></div><p>The house looks after one mouse at a time: <b>' + esc(pc.name) + '</b> is in the BED for ' + clock(c.remaining) + '.</p>';
      else info = '<div class="mx-h"><b>The training room is free</b></div><p>Pick a mouse below to retrain one of its specialities.</p>';
    }
    h += '<div class="mx-box mx-hs-info' + (mode === 'busy' ? ' mx-' + room : mode === 'done' ? ' mx-done' : '') + '">' + info + '</div>';
    h += '<p class="mx-hs-hint">' + mins + ' minutes and it keeps working at its post. ' + (room === 'bed' ? 'Treat a quirk: <b>' + CM.fmt(tc) + '</b> coins.' : 'Retrain a speciality: <b>' + CM.fmt(rc) + '</b> coins. It keeps its grade.') + '</p>';
    // Quién se puede cuidar, con su acción.
    const row = (m, sub, btnH, extra) => '<div class="mx-box mx-hs-row" role="button" data-act="card:' + m.id + '"><span class="mx-pt' + (m.rarity ? ' mx-r' + m.rarity : '') + '" style="--zw2:' + (m.post ? mxWall(m.post.split(':')[1]) : '#2a2433') + '">' + mxM('m:' + m.id) + '</span><span class="mx-t"><b>' + esc(m.name) + '<em>LV ' + K.level(m) + '</em></b><span>' + sub + '</span></span>' + btnH + '</div>' + (extra || '');
    h += '<div class="mx-hs-list">';
    if (room === 'bed') {
      const sick = s.mice.filter((m) => quirksOf(m).length).sort((a, b) => K.level(b) - K.level(a));
      if (!sick.length) h += '<p class="mx-hs-hint">No mouse has a quirk right now.</p>';
      for (const m of sick.slice(0, ui.bedAll ? sick.length : 5)) {
        const id = quirksOf(m)[0];
        const b = c && c.id === m.id && c.what === id ? mxBtn('mx-bed mx-on', 'RESTING', clock(c.remaining) + ' left') : c ? mxBtn('mx-busy', 'HOUSE BUSY', clock(c.remaining)) : mxBtn('mx-bed' + (s.coins < tc ? ' mx-short' : ''), 'TREAT', mxCoin(10) + CM.fmt(tc), s.coins < tc ? '' : 'care:' + m.id + ':quirk:' + id);
        h += row(m, '<span class="mx-bad">▼ ' + T[id].name + '</span>: ' + lower(T[id].desc), b);
      }
      if (sick.length > 5) h += '<span role="button" class="mx-act mx-hs-more" data-act="bedall">' + (ui.bedAll ? 'SHOW FEWER' : 'SEE ALL ' + sick.length + ' MICE WITH A QUIRK') + '</span>';
    } else {
      const sel = ui.trainSel || null, specsOf = (m) => K.JOBS.filter((k) => m.spec[k]), best = (m) => Math.max(0, ...specsOf(m).map((k) => K.gradeOf(m, k)));
      const list = s.mice.filter((m) => specsOf(m).length).sort((a, b) => (sel && b.id === sel.id) - (sel && a.id === sel.id) || best(b) - best(a) || K.level(b) - K.level(a));
      if (!list.length) h += '<p class="mx-hs-hint">No mouse has a speciality yet. After ' + M.jobGrades[0] + ' jobs in a trade a mouse gets one on its own.</p>';
      for (const m of list.slice(0, ui.trainAll ? list.length : 5)) {
        const open = sel && sel.id === m.id, jobs = specsOf(m);
        const b = c && c.id === m.id && c.kind === 'spec' ? mxBtn('mx-train mx-on', 'TRAINING', clock(c.remaining) + ' left') : c ? mxBtn('mx-busy', 'HOUSE BUSY', clock(c.remaining)) : mxBtn('mx-train', open ? 'CLOSE' : 'RETRAIN', open ? '' : mxCoin(10) + CM.fmt(rc), 'trainsel:' + m.id);
        const sub = jobs.map((k) => '<span class="mx-sp">' + T[m.spec[k]].name + ' ' + ROMAN[Math.max(1, K.gradeOf(m, k))] + '</span>').join(' · ') + (m.post ? ' · ' + mxPostN(m.post) : '');
        let pick = '';
        if (open && !c) {
          const job = sel.job && m.spec[sel.job] ? sel.job : jobs.length === 1 ? jobs[0] : '';
          pick = '<div class="mx-box mx-hs-info mx-train">';
          if (!job) pick += '<div class="mx-h"><b>Which speciality?</b></div><div class="mx-pb-tools" style="flex-wrap:wrap">' + jobs.map((k) => '<span role="button" class="mx-opt" data-act="trainjob:' + m.id + ':' + k + '">' + B.skills[k].name + ' · ' + T[m.spec[k]].name + '</span>').join('') + '</div>';
          else {
            const g = Math.max(1, K.gradeOf(m, job));
            pick += '<div class="mx-h"><b>Replace ' + esc(m.name) + '\'s ' + B.skills[job].name + ' speciality</b>' + (jobs.length > 1 ? '<span role="button" class="mx-act" data-act="trainjob:' + m.id + ':">BACK</span>' : '') + '</div>' +
              '<p><b style="color:#9cc0f4">' + T[m.spec[job]].name + ' ' + ROMAN[g] + '</b> → <span class="mx-q">? ' + ROMAN[g] + '</span> · random among the other 4, each as likely; never the same one. Keeps grade ' + ROMAN[g] + '.</p>' +
              '<p>Could become: ' + K.retrainOptions(m, job).map((t2) => '<b>' + T[t2].name + '</b>').join(', ') + '. ' + mins + ' minutes; it keeps working meanwhile. The result shows when it ends.</p>' +
              '<div role="button" class="mx-fc-go' + (s.coins < rc ? ' mx-off' : '') + '"' + (s.coins < rc ? '' : ' data-act="care:' + m.id + ':spec:' + job + '"') + '>RETRAIN ' + esc(m.name).toUpperCase() + '<span>' + mxCoin(14) + CM.fmt(rc) + '</span></div>';
          }
          pick += '</div>';
        }
        h += row(m, sub, b, pick);
      }
      if (list.length > 5) h += '<span role="button" class="mx-act mx-hs-more" data-act="trainall">' + (ui.trainAll ? 'SHOW FEWER' : 'SEE ALL ' + list.length + ' MICE') + '</span>';
    }
    h += '</div>';
    // Diario de la colonia: lo que han ido desarrollando.
    if (s.news.length) {
      h += '<div class="mx-hs-h"><b>COLONY NEWS</b><small>what your mice developed</small></div><ul class="mx-box mx-hs-news">';
      for (const n of s.news.slice(0, ui.newsAll ? 40 : 5)) {
        const m = n.id && K.byId(s, n.id), k = TK[T[n.trait].kind] || 'g';
        h += '<li class="' + (k === 'l' ? 'mx-l' : '') + '"><i class="mx-mini' + (m && m.rarity ? ' mx-r' + m.rarity : '') + '">' + mxM(m ? 'm:' + m.id : 'ghost') + '</i><span class="mx-t"><span><span class="mx-chip2 mx-' + k + '">' + (k === 'l' ? '★ ' : '') + T[n.trait].name + '</span></span><span><b style="font-size:11px;color:var(--soft)">' + esc(n.name) + '</b> ' + (T[n.trait].job ? 'specialised' : 'developed it') + '</span></span></li>';
      }
      h += '</ul>' + (s.news.length > 5 ? '<span role="button" class="mx-act mx-hs-more" data-act="newsall">' + (ui.newsAll ? 'SHOW LESS' : 'SHOW ' + Math.min(40, s.news.length) + ' ENTRIES') + '</span>' : '');
    }
    // Colección y gerentes.
    const got = K.albumCount(s), tot = K.albumTotal;
    h += '<div class="mx-hs-h"><b>COLLECTION</b></div><div role="button" class="mx-box mx-hs-album" data-act="album"><span class="mx-ic">' + mxI('album', 3) + '</span><span class="mx-t"><b>ALBUM</b><span><span>' + got + ' of ' + tot + ' found</span></span><span class="mx-bar"><i style="width:' + Math.round((got / tot) * 100) + '%"></i></span></span><span class="mx-act">OPEN</span></div>';
    if (s.mice.some((m) => M.ranks[m.rank].manager)) h += '<div class="mx-box mx-hs-mgr"><span class="mx-t"><b>' + mxI('clip', 2) + 'Managers buy upgrades</b><small>They buy cheap upgrades of their job on their own: never more than ' + Math.round(M.managerBudget * 100) + '% of your coins at once</small></span><span role="button" class="mx-hs-sw' + (s.settings.managersBuy ? ' mx-on' : '') + '" data-act="managers"><i></i><em>' + (s.settings.managersBuy ? 'ON' : 'OFF') + '</em></span></div>';
    return h;
  }
  function mxAlbum(s) {
    const K = CM.mice, got = K.albumCount(s), tot = K.albumTotal;
    let h = '<div class="mx-hs-alb"><div class="mx-fc-back" role="button" data-act="album"><span class="mx-act">' + mxI('back', 2) + 'BACK</span><span class="mx-meta">MICE · HOUSE</span></div>' +
      '<div class="mx-box mx-hs-alb-head"><span class="mx-ic">' + mxI('album', 4) + '</span><span class="mx-t"><b>ALBUM</b><span><span>' + got + ' of ' + tot + ' found</span></span><span class="mx-bar"><i style="width:' + Math.round((got / tot) * 100) + '%"></i></span></span></div>' +
      '<p class="mx-hs-hint">Every new fur, hat, accessory, trait and combo on your mice goes in here for good, even if that mouse leaves. '+' Combos are found by trying: the right traits on one mouse, on neighbours in a crew, or along the whole line.</p>';
    for (const cat of K.ALBUM) {
      const n = cat.items.filter((it) => s.album[it.key]).length, look = cat.kind === 'fur' || cat.kind === 'hat' || cat.kind === 'acc';
      h += '<div class="mx-hs-h"><b>' + cat.title + '</b><small>' + n + ' / ' + cat.items.length + '</small></div><div class="mx-hs-agrid' + (look ? '' : ' mx-names') + '">';
      const tcls = cat.title === 'QUIRKS' ? ' mx-q' : /JOB/.test(cat.title) ? ' mx-j' : '';
      for (const it of cat.items) {
        const have = !!s.album[it.key];
        if (cat.kind === 'combo' && !have) continue;
        const [pk, pi] = it.key.split(':');
        h += '<div class="mx-hs-tile' + (have ? '' : ' mx-miss') + (it.rarity ? ' mx-r' + it.rarity : '') + tcls + '">' + (look ? '<canvas data-crew="p:' + pk + ':' + pi + (have ? '' : ':miss') + '" width="22" height="20" style="width:44px;height:40px"></canvas>' : '') + '<span>' + (have ? it.name : '???') + (have && it.desc ? '<small>' + it.desc + '</small>' : !have && it.rarity && cat.kind !== 'trait' ? '<small>' + RARITY[it.rarity].name + ' only</small>' : '') + '</span></div>';
      }
      if (cat.kind === 'combo' && n < cat.items.length) h += '<div class="mx-hs-tile mx-miss mx-more"><span>' + (cat.items.length - n) + ' more to discover</span></div>';
      h += '</div>';
    }
    return h + '</div>';
  }
  // ---------- CHEESERY: una línea, la de la colonia (PRODUCTION) y las recetas por queso estudiado (RECIPE BOOK) ----------
  const CHZ = { cheddar: ['#fff09a', '#ffcf2e', '#f5ab12'], gouda: ['#ffd08a', '#ff9f3a', '#e87a1c'], brie: ['#ffffff', '#efe8d0', '#c9bd9a'], emmental: ['#fff7b0', '#f5e15a', '#c9a92a'], parmesan: ['#ffe9b8', '#e8c98a', '#b8924f'], blue: ['#d8e8ff', '#8fb4e8', '#4a6fb0'] };
  const CH_TONE = { cook: '', start: '', base: ' mx-t-wait', coins: ' mx-t-bad', none: ' mx-t-bad', ready: ' mx-t-idle' };
  const mxBaseIc = (b) => MXSP + 'ic_base_' + b + '.png';
  const CH_NEED = { base: ['NEEDS CHEESE BASE', (o) => mxBaseIc(o.base)], coins: ['NEEDS COINS', () => MXSP + 'ic_coin.png'] };
  const cookMouse = (s) => { const p = G().s.placed.find((q) => q.st === 'cheese' && q.fn === 'pr'); return p ? CM.mice.byId(s, p.m.id) : null; };
  // Quedarse sin Base entre dos hornadas no se enseña hasta que dura: tocando deprisa, la tarjeta no parpadea ni se mueve el botón.
  const CH_HOLD = 1000;
  let chShown = '', chWaitAt = 0, chFlow = false;
  function chInfo(s) {
    const C = CM.cheesery, c = G().s, job = c.job.cheese, mouse = cookMouse(s);
    const key = job ? job.key : c.recipe, r = C.recipe(s, key), lane = C.recipe(s, c.recipe), base = r ? C.parseKey(r.key).base : tier(), name = B.bases[base].name, have = c.inv.base, reserve = c.labWant || 0;
    const o = { base, name, job, mouse, lane, cooking: job ? r : null, r, have, reserve, pinned: !!G().lab.pin };
    const need = r ? C.baseUse(r) : 1, coin = r ? Mo.formula(r.key).coin : 0;
    if (job) { o.st = 'cook'; o.text = (job.per > 1 ? CM.fmt(job.per) + ' cheeses' : '1 cheese') + ' every ' + secs(job.total); }
    else if (have - reserve < need) { o.st = 'base'; o.need = need + reserve; o.text = 'Waiting for Cheese Base: ' + CM.fmt(have) + '/' + CM.fmt(o.need) + (reserve ? ' (' + reserve + ' set aside for the lab)' : ''); }
    else if (c.coins < coin) { o.st = 'coins'; o.coins = coin; o.text = 'Needs ' + coin + ' coins for ' + B.ingredients[C.parseKey(r.key).ingredient].name; }
    else if (!mouse) { o.st = 'ready'; o.text = 'Ready: make it by hand'; }
    else { o.st = 'start'; o.text = 'Starting'; }
    const now = performance.now(), waiting = o.st === 'base' || o.st === 'coins';
    if (!waiting) { chWaitAt = 0; chShown = o.st === 'start' ? 'cook' : o.st; }
    else if (chShown === 'cook' && now - (chWaitAt || (chWaitAt = now)) < CH_HOLD) { o.held = true; o.st = 'cook'; }
    else chShown = o.st;
    return o;
  }
  const chNeedN = (o) => (o.st === 'base' ? CM.fmt(Math.min(o.have, o.need)) + '/' + CM.fmt(o.need) : o.st === 'coins' ? CM.fmt(o.coins) : '?');
  const chPlate = (o, wide) => (CH_NEED[o.st] ? '<div class="mx-ch-need mx-n-' + o.st + '"><img class="pix" src="' + CH_NEED[o.st][1](o) + '" alt=""><i>!</i>' + (wide ? '<b data-live="need"></b>' : '') + '</div>' : '');
  function chLine(s, ui, open) {
    const o = chInfo(s), c = CHZ[o.base] || CHZ.cheddar, MS = CM.milestones;
    const wheel = MS.has(s, 'wheel'), gm = o.mouse && MS.has(s, 'master') && s.master === o.mouse.id ? MS.masterGrade(o.mouse) : 0;
    if (o.job) chFlow = o.job.total < 700;
    const flow = chFlow;
    const bar = o.st === 'cook' ? (flow ? '<div class="mx-ch-bar mx-flow"><i></i></div>' : '<div class="mx-ch-bar"><i data-job="cook:line"></i></div>')
      : o.st === 'base' ? '<div class="mx-ch-bar mx-wait"><i data-live-w="base"></i></div>' : '<div class="mx-ch-bar' + (o.st === 'coins' ? ' mx-bad' : '') + '"><i></i></div>';
    const need = CH_NEED[o.st];
    let h = '<div class="mx-box mx-ch-line' + CH_TONE[o.st] + (open ? ' mx-on' : '') + '" data-line="line" data-base="' + o.base + '" data-st="' + (o.st === 'start' ? 'cook' : o.st) + '" data-cook="' + (o.mouse ? o.mouse.id : '') + '" data-gm="' + gm + '" style="--zc:' + c[1] + ';--zl:' + c[0] + ';--zd:' + c[2] + '">' +
      '<div class="mx-ch-scene"><canvas width="110" height="30"></canvas>' + chPlate(o, true) + '</div>' +
      '<div class="mx-ch-head" role="button" data-act="cline:line"><div class="mx-ch-st"><canvas width="40" height="26"></canvas>' + chPlate(o, false) + '</div><div class="mx-ch-t">' +
      '<div class="mx-ch-k"><b>' + o.name.toUpperCase() + '</b>·<span>' + (o.mouse ? 'AUTO' : 'BY HAND') + '</span>' + (o.mouse ? '·<span class="mx-who">' + esc(o.mouse.name) + '</span>' : '') + (gm ? '<span class="mx-gm">' + mxI('star', 1) + 'GM ' + romanN(gm) + '</span>' : '') + (wheel ? '<span class="mx-gw"><canvas width="13" height="13" data-gw="line"></canvas><span data-gwt></span></span>' : '') + '</div>' +
      '<div class="mx-ch-rn"><span>' + (o.r ? esc(o.r.name) : 'No recipe') + '</span></div>' +
      '<div class="mx-ch-row">' + bar + '<em class="mx-ch-s">' + (need ? '<img class="pix mx-' + o.st + '" src="' + need[1](o) + '" alt="">' : '') + '<span data-live="text"></span></em></div></div></div>';
    if (!open) return h + '</div>';
    // El aviso de lo que falta y la explicación comparten un hueco de alto fijo: la tarjeta no cambia de tamaño ni los botones de sitio.
    let b = '<div class="st-ch-slot">';
    if (need) b += '<div class="mx-ch-needrow mx-n-' + o.st + '"><span class="mx-ic"><img class="pix" src="' + need[1](o) + '" alt=""><i>!</i></span><span class="mx-t"><b>' + need[0] + '</b><small data-live="needtx"></small>' + (o.st === 'base' ? '<span class="mx-m"><i data-live-w="base"></i></span>' : '') + '</span></div>';
    else if (o.r) {
      const C = CM.cheesery, combo = C.parseKey(o.r.key), coins = B.ingredients[combo.ingredient].coinCost;
      const why = !o.mouse ? 'You choose what to make here.' : o.pinned ? 'Pinned by you: ' + esc(o.mouse.name) + ' always cooks this one.' : esc(o.mouse.name) + ' cooks the recipe that pays best once mastered.';
      b += '<p class="mx-ch-why">' + (o.mouse ? '<i class="mx-ch-tag ' + (o.pinned ? 'mx-pin">PINNED' : 'mx-best">BEST') + '</i>' : '') + (o.r.strain ? '<i class="mx-ch-tag mx-strain">' + B.strains[o.r.strain].name + '</i>' : '') + why + '</p>';
      if (o.cooking && o.lane && o.lane.id !== o.cooking.id) b += '<div class="mx-ch-next">Next batch: <b>' + esc(o.lane.name) + '</b></div>';
    }
    b += '</div>';
    if (o.r) {
      const C = CM.cheesery, combo = C.parseKey(o.r.key), coins = B.ingredients[combo.ingredient].coinCost;
      b += '<div class="mx-ch-facts"><div class="mx-ch-fact"><b><img class="pix" src="' + mxBaseIc(o.base) + '" alt="">' + C.baseUse(o.r) + '</b><small>Base each' + (coins ? ' + ' + coins + 'c' : '') + '</small></div>' +
        '<div class="mx-ch-fact"><b><img class="pix" src="' + mxBaseIc(o.base) + '" alt=""><span data-live="have"></span></b><small>Base in stock</small></div>' +
        '<div class="mx-ch-fact' + (gm ? ' mx-gm' : '') + '"><b><img class="pix mx-cn" src="' + MXSP + 'ic_coin.png" alt="">' + CM.fmt(CM.shop.price(s, o.r)) + '</b><small>coins each</small>' + (gm ? '<small class="mx-ch-gmx"><span>' + mxI('star', 1) + '+' + Math.round(gm * B.milestones.master.per * 100) + '%</span><span>Grand Master</span></small>' : '') + '</div></div>';
    }
    if (wheel) b += '<div class="mx-ch-gwrow"><canvas width="22" height="22" data-gw="line"></canvas><div class="mx-t"><b>GRAND WHEEL</b><small>after ' + Math.round(B.milestones.wheel.everyMs / 60000) + ' min of cooking: +' + Math.round(B.milestones.wheel.worthMs / 60000) + ' min of this line</small></div><em data-gwt></em></div>';
    b += '<div class="mx-ch-acts">';
    // El primer botón está siempre en el mismo sitio: tocar sin parar nunca cae en otro.
    if (o.st === 'cook' || o.st === 'start') b += '<span role="button" class="mx-ch-btn mx-speed st-act1" data-act="cheeseTap">SPEED UP<small>each tap: -' + secs(B.cheesery.boostMs) + '</small></span>';
    else if (!o.mouse) b += '<span role="button" class="mx-ch-btn mx-make st-act1' + (o.st === 'ready' ? '' : ' mx-off') + '"' + (o.st === 'ready' ? ' data-act="cheeseTap"' : '') + '>MAKE<small>1</small></span>';
    else b += '<span class="mx-ch-btn mx-off st-act1">SPEED UP<small>not cooking</small></span>';
    b += '<span role="button" class="mx-ch-btn" data-act="bookbase:' + o.base + '">CHANGE<br>RECIPE</span>';
    if (!o.mouse) b += '<span role="button" class="mx-ch-btn" data-act="staffpost:cheesemaking:mixer">PUT A<br>MOUSE</span>';
    return h + '<div class="mx-ch-body">' + b + '</div></div></div>';
  }
  function chTabs(s, view) {
    return '<div class="mx-ch-tabs"><span role="button" class="mx-box mx-ch-tab' + (view === 'lines' ? ' mx-sel' : '') + '"' + (view === 'lines' ? '' : ' data-act="cview:lines"') + '><span class="mx-nm">PRODUCTION</span></span><span role="button" class="mx-box mx-ch-tab' + (view === 'book' ? ' mx-sel' : '') + '"' + (view === 'book' ? '' : ' data-act="cview:book"') + '><span class="mx-nm">RECIPE BOOK</span><span class="mx-ch-cnt">' + s.recipes.length + '/' + CM.cheesery.totalCombos() + '</span></span></div>';
  }
  function mxProduction(s, ui) {
    let h = chTabs(s, 'lines') + '<div class="mx-ch-list">' + chLine(s, ui, ui.cheeseLine !== '') + '</div>';
    if (!cookMouse(s)) h += '<p class="mx-ch-hint">A mouse running CHEESE keeps the line going on its own.</p>';
    return h + (G().lab.built ? '<div role="button" class="mx-box mx-ch-lab" data-act="open:lab"><canvas width="13" height="14" data-flask></canvas><span class="mx-t"><b>CHEESE LAB</b><span>new recipes are discovered there</span></span><em>OPEN</em></div>' : '');
  }
  const bkPerBase = () => Object.keys(B.ingredients).length * Object.keys(B.treatments).length * Object.keys(B.maturations).length;
  const bkLot = (b) => MXSP + 'ic_lot_' + b + '.png';
  function mxBook(s, ui) {
    const C = CM.cheesery, bases = C.unlockedBases(s), c = G().s;
    const base = bases.indexOf(ui.bookBase) >= 0 ? ui.bookBase : C.parseKey(c.recipe).base, name = B.bases[base].name, total = bkPerBase();
    const mouse = cookMouse(s), lane = C.recipe(s, c.recipe), pinnedId = G().lab.pin || '';
    const known = (b) => s.recipes.filter((r) => C.parseKey(r.key).base === b);
    let h = chTabs(s, 'book');
    if (bases.length > 1) h += '<div class="mx-bk-shelf">' + bases.map((b) => '<span role="button" class="mx-box mx-bk-cz' + (b === base ? ' mx-sel' : '') + '"' + (b === base ? '' : ' data-act="bookbase:' + b + '"') + '><img class="pix" src="' + bkLot(b) + '" alt=""><span class="mx-nm">' + B.bases[b].name.toUpperCase() + '</span><small>' + known(b).length + '/' + total + '</small></span>').join('') + '</div>';
    const list = known(base).sort((a, b) => C.potential(s, b) - C.potential(s, a));
    const hint = !list.length ? 'You know no ' + name + ' recipe yet. Discover one in LAB.' : mouse ? esc(mouse.name) + ' cooks on its own the recipe that pays best once mastered (BEST), even if another sells for more today. Tap a recipe to pin another.' : 'Nobody cooks yet: tap a recipe to choose what you make by hand.';
    h += '<div class="mx-bk-page"><div class="mx-box mx-bk-head"><span class="mx-pt" style="background:' + mxWall() + '">' + (mouse ? mxM('m:' + mouse.id + ':cheesemaking') : '<i class="mx-bk-none">' + mxM('ghost') + '</i>') + '</span><span class="mx-t"><span class="mx-k"><b>' + name.toUpperCase() + ' RECIPES</b><em>' + list.length + '/' + total + ' discovered</em></span><span class="mx-bar"><i style="width:' + Math.round((list.length / total) * 100) + '%"></i></span><small>' + hint + '</small></span></div><div class="mx-bk-list">';
    const MAT = B.cheesery.masteryAt, scale = H.PARAMS.masteryScale || 1;
    for (const r of list) {
      const combo = C.parseKey(r.key), m = C.masteryLevel(r), nextAt = MAT[m + 1] != null ? MAT[m + 1] * scale : 0;
      const tier2 = C.tierOf(C.valueOf(s, r)), tc = ' mx-t-' + tier2.toLowerCase();
      const isPin = pinnedId === r.id, isBest = !pinnedId && lane && lane.id === r.id, open = ui.bookRow === r.id;
      const pips = () => '<span class="mx-pips' + (nextAt ? '' : ' mx-top') + '">' + Array.from({ length: MAT.length - 1 }, (_, i) => '<i' + (i < m ? ' class="mx-on"' : '') + '></i>').join('') + '</span>';
      h += '<div class="mx-box mx-bk-row' + tc + (isPin || isBest ? ' mx-cook' : '') + (open ? ' mx-on' : '') + '"><div class="mx-bk-rh" role="button" data-act="bookrow:' + r.id + '"><span class="mx-bk-mini' + tc + '"><i class="mx-band"></i><img class="pix" src="' + bkLot(base) + '" alt=""></span>' +
        '<span class="mx-bk-t"><span class="mx-bk-nm">' + esc(r.name) + '</span><span class="mx-bk-sub"><i class="mx-bk-tier' + tc + '">' + tier2.toUpperCase() + '</i>' + pips() + '<span class="mx-tm">' + secs(C.jobTime(s, combo, r)) + '</span></span></span>' +
        '<span class="mx-bk-r"><b>' + mxCoin(12) + CM.fmt(CM.shop.price(s, r)) + '</b><span class="mx-tags">' + (isPin ? '<i class="mx-ch-tag mx-pin">PINNED</i>' : isBest ? '<i class="mx-ch-tag mx-best">' + (mouse ? 'BEST' : 'COOKING') + '</i>' : '') + (r.strain ? '<i class="mx-ch-tag mx-strain">' + B.strains[r.strain].name + '</i>' : '') + '</span></span></div>';
      if (open) {
        const coins = B.ingredients[combo.ingredient].coinCost, syn = C.formula(combo).synergies;
        const part = (id, tbl) => '<span class="mx-bk-part"><canvas class="pix" data-part="' + id + '" style="width:18px;height:18px"></canvas><span>' + B[tbl][id].name + '</span></span>';
        h += '<div class="mx-bk-body"><div class="mx-bk-parts"><span class="mx-bk-part"><img class="pix mx-lot" src="' + bkLot(base) + '" alt=""><span>' + name + '</span></span>' + part(combo.ingredient, 'ingredients') + part(combo.treatment, 'treatments') + part(combo.maturation, 'maturations') + '</div>' +
          (syn.length || coins ? '<div class="mx-bk-syn">' + syn.map((x) => '<span class="mx-ch-tag mx-syn">' + x + '</span>').join('') + (coins ? '<span class="mx-cn">' + mxCoin(11) + coins + ' coins each</span>' : '') + '</div>' : '') +
          '<div class="mx-bk-facts"><span><b>' + mxCoin(12) + CM.fmt(CM.shop.price(s, r)) + '</b><small>coins each</small></span><span><b>' + secs(C.jobTime(s, combo, r)) + '</b><small>a batch</small></span><span><b><img class="pix" src="' + mxBaseIc(base) + '" alt="">' + C.baseUse(r) + '</b><small>Base each</small></span><span><b>' + CM.fmt(s.lots[r.id] || 0) + '</b><small>in stock</small></span></div>' +
          '<div class="mx-bk-mast' + (nextAt ? '' : ' mx-top') + '"><span class="mx-lv"><small>MASTERY</small><b>' + (m + 1) + '</b></span><span class="mx-t">' + pips() + '<span class="mx-bar"><i style="width:' + (nextAt ? Math.round(Math.min(1, (r.made || 0) / nextAt) * 100) : 100) + '%"></i></span><small>' + (nextAt ? CM.fmt(r.made || 0) + '/' + CM.fmt(nextAt) + ' made for the next level' : 'Mastery at its top level') + '</small></span></div>' +
          '<div class="mx-ch-acts"><span role="button" class="mx-ch-btn' + (isPin ? '' : ' mx-make') + '" data-act="' + (isPin ? 'uncook' : 'cook:' + r.id) + '">' + (isPin ? 'BACK TO AUTO' : 'ALWAYS<br>COOK THIS') + '</span></div></div>';
      }
      h += '</div>';
    }
    h += '</div>';
    const left = total - list.length;
    if (left > 0) h += '<div class="mx-box mx-bk-sealed"><span class="mx-pile">' + Array.from({ length: Math.min(5, left) }, (_, k) => '<i class="mx-bk-back" style="left:' + k * 9 + 'px;z-index:' + (5 - k) + '"><canvas class="pix" data-seal></canvas></i>').join('') + '</span><span class="mx-t"><b>' + left + ' STILL SEALED</b><small>' + (list.length ? 'The rest of the ' + name + ' recipes. Discover them in LAB.' : 'Every ' + name + ' recipe is still sealed. Discover one in LAB.') + '</small></span></div>';
    return h + '</div>';
  }
  const cheesePanel = (s, ui) => (!G().s.built.cheese ? '<p class="hint">Build the Cheesery first.</p>' : ui.cheeseView === 'book' ? mxBook(s, ui) : mxProduction(s, ui));

  // ---------- CHEESE LAB ----------
  const DIR_NAME = (dir) => { const [kind, id] = String(dir || '').split(':'); return kind === 'value' ? 'the most valuable recipe' : kind === 'fast' ? 'the quickest recipe to cook' : kind === 'strain' ? 'strains' : kind === 'base' ? B.bases[id].name + ' recipes' : kind === 'ingredient' ? 'recipes with ' + B.ingredients[id].name : kind === 'treatment' ? B.treatments[id].name + ' recipes' : kind === 'maturation' ? B.maturations[id].name + ' recipes' : ''; };
  const DIR_LABEL = (dir) => { const [kind, id] = String(dir || '').split(':'); return kind === 'value' ? 'Highest value' : kind === 'fast' ? 'Quickest to cook' : kind === 'strain' ? 'Strains' : kind === 'base' ? B.bases[id].name + ' recipes' : kind === 'ingredient' ? 'With ' + B.ingredients[id].name : kind === 'treatment' ? B.treatments[id].name : kind === 'maturation' ? B.maturations[id].name : 'No direction'; };
  const DIR_CATS = [['goal', 'GOAL'], ['base', 'CHEESE'], ['ingredient', 'INGREDIENT'], ['treatment', 'TREATMENT'], ['maturation', 'AGING']];
  const lbIc = (k, sc) => '<canvas class="pix" data-lbic="' + k + '" data-k="' + (sc || 2) + '"></canvas>';
  const lbDur = (ms) => (CM.plab ? CM.plab.dur(ms) : secs(ms));
  const STRAIN_NAME = (id) => (id ? B.strains[id].name : 'Plain');
  const STRAIN_NOTE = { quick: 'A restless culture: the curd sets before it has time to mature.', dense: 'Pressed until there is nothing left to press. Heavy, rich and hungry.', teaching: 'Slow and fussy. Every wheel is a lesson for whoever makes it.' };
  const labW = () => { const w = Lb.worker(G()); return w ? CM.mice.byId(null, w.id) : null; };
  const labSpeedOf = (w) => (w ? CM.mice.solo(w, 'research', null, 'all') : 1);
  function lbMode(s) {
    const L = G().lab, j = L.job, w = labW(), q = L.queue[0];
    if (j ? j.source === 'manual' : q && !w) return 'hand';
    if (!j && !q && !w) return '';
    return L.nodes.advanced ? (L.dir ? 'dir' : '') : 'auto';
  }
  const LB_MODE_TXT = { auto: 'AUTO', dir: 'DIRECTED', hand: 'BY HAND' };
  const jobName = (j) => (j.kind === 'recipe' ? CM.cheesery.defaultName(j.key) : j.kind === 'strain' ? CM.cheesery.defaultName(j.key) : j.kind === 'study' ? B.bases[j.style].name + ' cheese' : 'Blueprint: ' + H.pretty(j.id));
  function lbHead(s) {
    const C = CM.cheesery, L = G().lab, job = L.job, w = labW(), built = L.built, q = L.queue[0], total = C.totalCombos();
    let lbl, tone, nm, bar = '', sub = '', x = false;
    if (job) {
      lbl = job.retried ? 'INCONCLUSIVE · AGAIN' : job.kind === 'strain' ? 'CULTURING A STRAIN' : job.kind === 'study' ? 'STUDYING A NEW CHEESE' : job.kind === 'blueprint' ? 'DRAWING A BLUEPRINT' : 'RESEARCHING'; tone = job.retried ? 'bad' : 'busy'; nm = esc(jobName(job));
      bar = '<i class="mx-lb-bar' + (job.kind === 'strain' ? ' mx-strain' : '') + '"><i style="width:' + Math.round((1 - job.remaining / job.total) * 100) + '%" data-labbar></i></i>';
      if (q) { sub = 'Next: ' + esc(jobName(q)); x = true; }
    } else if (q && (q.kind === 'recipe' || q.kind === 'strain')) {
      const need = Lb.labCost(G()), have = G().s.inv.base, coin = q.kind === 'recipe' ? Mo.formula(q.key).coin : 0, short = have < need, poor = coin > G().s.coins;
      lbl = short ? 'WAITING FOR CHEESE BASE' : poor ? 'WAITING FOR COINS' : 'ABOUT TO START'; tone = short ? 'wait' : poor ? 'bad' : 'busy'; nm = esc(jobName(q));
      bar = '<i class="mx-lb-bar mx-wait"><i style="width:' + Math.round(Math.min(1, have / need) * 1000) / 10 + '%"></i></i>'; sub = CM.fmt(Math.min(have, need)) + '/' + CM.fmt(need) + ' Cheese Base' + (coin ? ' · ' + coin + ' coins' : ''); x = true;
    } else if (L.known.length >= total) { lbl = 'RECIPE BOOK COMPLETE'; tone = 'gold'; nm = 'Every recipe discovered'; bar = '<i class="mx-lb-bar mx-idle"><i></i></i>'; sub = L.known.length + '/' + total + ' in your Recipe Book'; }
    else { lbl = 'IDLE'; tone = 'idle'; nm = w && L.nodes.advanced && !L.dir ? 'Choose a direction' : w ? 'Nothing left to research at your level' : 'Start a research below'; bar = '<i class="mx-lb-bar mx-idle"><i></i></i>'; }
    const m = lbMode(s);
    let h = '<div class="mx-box mx-lb-head' + (built ? '' : ' mx-pre') + '" data-tone="' + tone + '">';
    if (built) h += '<div class="mx-lb-scene"><canvas width="110" height="36"></canvas></div>';
    if (L.nodes.assistant) h += w
      ? '<div class="mx-lb-who" role="button" data-act="researcher"><canvas class="mx-lb-face" width="22" height="20" data-crew="m:' + w.id + ':research"></canvas><span class="mx-t"><b>' + esc(w.name) + '</b><small>Research LV ' + CM.mice.level(w) + mxHearts((w.aff && w.aff.research) || 0) + '</small><small>a recipe every ' + lbDur(Lb.labTime(G(), tier()) / labSpeedOf(w)) + '</small></span><em>CHANGE</em></div>'
      : '<div class="mx-lb-who mx-none" role="button" data-act="researcher"><i class="mx-lb-hole">+</i><span class="mx-t"><b>No researcher</b><small>Research by hand</small></span><em>ASSIGN</em></div>';
    h += '<div class="mx-lb-now">' + (built ? '' : '<canvas class="pix mx-lb-fl" width="13" height="14"></canvas>') + '<div class="mx-t"><div class="mx-lb-k"><small class="mx-lb-lbl">' + lbl + '</small><span class="mx-lb-mode" data-m="' + m + '">' + (m ? lbIc('mode:' + m, 1) + LB_MODE_TXT[m] : '') + '</span></div><b class="mx-lb-nm">' + nm + '</b>' + bar +
      '<div class="mx-lb-sub' + (sub ? '' : ' mx-hide') + '"><span>' + sub + '</span>' + (x ? '<span class="mx-lb-x" role="button" data-act="labcancel">CANCEL</span>' : '') + '</div></div></div></div>';
    return h;
  }
  const lbRow = (m, title, desc, act, em, on, extra) => '<div class="mx-box mx-lb-row' + (on ? ' mx-on' : '') + (extra || '') + '" data-m="' + m + '" role="button"' + (act ? ' data-act="' + act + '"' : '') + '><span class="mx-ic">' + (m === 'auto' || m === 'dir' || m === 'hand' ? lbIc('mode:' + m, 2) : m === 'up' ? '<img class="pix" src="' + MXSP + 'ic_flask.png" alt="" style="width:22px;height:24px">' : lbIc('book', 2)) + '</span><span class="mx-t">' + title + '<span class="mx-d">' + desc + '</span></span>' + (em ? '<em>' + em + '</em>' : '') + '</div>';
  function lbPicker(s, ui) {
    const C = CM.cheesery, level = G().stLv.cheese, combo = ui.combo, Lv = G().lab;
    for (const p of C.PARTS) if (C.partLocked(s, p, combo[p])) combo[p] = Object.keys(B[C.TABLES[p]]).find((id) => !C.partLocked(s, p, id));
    const have = G().s.inv.base, cost = Lb.labCost(G());
    const sub = (part, id) => { const o = B[C.TABLES[part]][id]; if (part === 'base') return 'worth ' + Mo.styleValue(id); if (part === 'ingredient') return 'x' + o.mult + (o.coinCost ? ' · ' + o.coinCost + ' coins' : ' · free'); return 'x' + o.mult + (o.timeMs ? ' · +' + lbDur(o.timeMs) : ''); };
    let h = '<div class="mx-lb-pick">';
    for (const [part, t] of [['base', '1 · BASE'], ['ingredient', '2 · INGREDIENT'], ['treatment', '3 · TREATMENT'], ['maturation', '4 · MATURATION']]) {
      h += '<div class="mx-lb-grp"><span class="mx-lb-gh">' + t + '</span><div class="mx-lb-chips">';
      for (const id of Object.keys(B[C.TABLES[part]])) {
        const lk = C.partLocked(s, part, id);
        if (lk && part === 'base') continue;
        h += '<span role="button" class="mx-lb-chip' + (lk ? ' mx-lock' : '') + (combo[part] === id ? ' mx-on' : '') + '"' + (lk ? '' : ' data-act="pick:' + part + ':' + id + '"') + '><span class="mx-r">' + (part === 'base' ? '<img class="pix" src="' + mxBaseIc(id) + '" alt="" style="width:14px;height:12px">' : lbIc('part:' + id, 2)) + B[C.TABLES[part]][id].name + '</span><small>' + (lk ? 'CHEESE LV ' + B[C.TABLES[part]][id].level : sub(part, id)) + '</small></span>';
      }
      h += '</div></div>';
    }
    const key = C.keyOf(combo), known = C.recipeByKey(s, key), coins = B.ingredients[combo.ingredient].coinCost;
    if (known) {
      const t2 = C.tierOf(C.valueOf(s, known));
      h += '<div class="mx-lb-res mx-known"><span class="mx-art"><img class="pix" src="' + MXSP + 'ic_lot_' + combo.base + '.png" alt=""></span><div><b>' + esc(known.name) + '</b><span class="mx-v">' + mxCoin(11) + CM.fmt(CM.shop.price(s, known)) + ' each · <i class="mx-tier mx-t-' + t2.toLowerCase() + '">' + t2.toUpperCase() + '</i></span><small>Already in your Recipe Book</small></div></div>';
    } else {
      const syn = C.formula(combo).synergies, short = have < cost, queued = Lv.queue.some((q) => q.key === key), busy = !!Lv.job, same = busy && Lv.job.key === key, full = Lv.queue.length >= Lb.queueCap(G());
      const can = !queued && !same && !full && (busy || short || G().s.coins >= coins);
      h += '<div class="mx-lb-res"><span class="mx-art">' + lbIc('seal', 2) + '</span><div><b>Undiscovered cheese</b>' + (syn.length ? '<span class="mx-syn">These go well together!</span>' : '') + '<small>Costs ' + cost + ' Cheese Base' + (coins ? ' + ' + coins + ' coins' : '') + ' · ' + lbDur(Lb.labTime(G(), combo.base)) + ' · you get the recipe</small></div></div>';
      h += '<span role="button" class="mx-lb-go' + (can ? '' : ' mx-off') + '"' + (can ? ' data-act="experiment"' : '') + '>' + (queued || same ? '<b>NEXT IN THE LAB</b>' : full ? '<b>THE QUEUE IS FULL</b>' : busy ? '<b>DISCOVER IT NEXT</b><small>after the research in progress</small>' : short ? '<b>DISCOVER IT</b><small>the lab saves up the Cheese Base first</small>' : '<b>DISCOVER IT</b>') + '</span>';
    }
    return h + '<p class="mx-lb-hint">CHEESE LV ' + level + '. Higher levels unlock better ingredients.</p></div>';
  }
  // ---- STRAINS ----
  const stDish = (kind, k, o) => '<canvas class="pix mx-st-dish" data-dish="' + (kind || '') + '" data-k="' + (k || 2) + '"' + (o ? ' data-o="' + o + '"' : '') + '></canvas>';
  const stLot = (base, w, h) => '<img class="pix" src="' + MXSP + 'ic_lot_' + base + '.png" alt="" style="width:' + w + 'px;height:' + h + 'px">';
  const stIc = (id, base, k) => (id ? lbIc('s:' + id, k || 2) : stLot(base, 14 * (k || 2) / 2, 12 * (k || 2) / 2));
  // Lo que da una cepa frente a otra: las reglas del núcleo (model.startCheese y price), con esa cepa en vez de la activa.
  function strainStats(s, r, id) {
    const C = CM.cheesery, cur = B.strains[r.strain] || {}, st = B.strains[id] || {}, f = Mo.formula(r.key), mt = Math.max(0.3, 1 - B.cheesery.masteryTime * (Mo.mastery(G().s, r.key) - 1));
    return { time: Math.max(300, Math.round(f.timeMs * mt * G().s.mods.cheese.time * (st.time || 1))), base: B.cheesery.lotBase * (st.base || 1), price: Math.max(1, Math.round((Mo.price(G().s, r.key) / (cur.value || 1)) * (st.value || 1))), teach: st.teach || 1 };
  }
  function strainLines(s, r, id) {
    const a = strainStats(s, r, id), p = strainStats(s, r, ''), out = [];
    if (a.time !== p.time) out.push(['Cooks in ' + secs(a.time) + ' <s>' + secs(p.time) + '</s>', a.time < p.time ? 'up' : 'down']);
    if (a.teach !== p.teach) out.push(['Cheesemaker learns ' + a.teach + 'x as fast', 'up']);
    if (a.price > p.price) out.push(['Sells for ' + CM.fmt(a.price) + ' <s>' + CM.fmt(p.price) + '</s>', 'up']);
    if (a.base !== p.base) out.push(['Uses ' + a.base + ' Cheese Base <s>' + p.base + '</s>', a.base < p.base ? 'up' : 'down']);
    if (a.price < p.price) out.push(['Sells for ' + CM.fmt(a.price) + ' <s>' + CM.fmt(p.price) + '</s>', 'down']);
    return out;
  }
  function stCmp(s, r, a, b) {
    const A = strainStats(s, r, a), Bs = strainStats(s, r, b), base = CM.cheesery.parseKey(r.key).base, rows = [];
    if (A.time !== Bs.time) rows.push([lbIc('clock', 2), 'Cooks in', lbDur(A.time), lbDur(Bs.time), Bs.time < A.time]);
    if (A.base !== Bs.base) rows.push(['<img class="pix" src="' + mxBaseIc(base) + '" alt="" style="width:14px;height:12px">', 'Cheese Base each', A.base, Bs.base, Bs.base < A.base]);
    if (A.price !== Bs.price) rows.push([mxCoin(12), 'Sells for', CM.fmt(A.price), CM.fmt(Bs.price), Bs.price > A.price]);
    if (A.teach !== Bs.teach) rows.push([lbIc('star', 2), 'Cheesemaker learns', A.teach + 'x', Bs.teach + 'x', Bs.teach > A.teach]);
    return rows.map(([ic, l, x, y, good]) => '<div class="mx-rw ' + (good ? 'mx-up' : 'mx-dn') + '"><span class="mx-ic">' + ic + '</span><span class="mx-l">' + l + '</span><span class="mx-a">' + x + '</span><span class="mx-b">' + lbIc(good ? 'up' : 'down', 2) + y + '</span></div>').join('');
  }
  function mxStrains(s, ui) {
    const C = CM.cheesery, L = G().lab, w = labW(), P3 = H.PARAMS.s3.lab;
    let h = '';
    const f = ui.found, fr = f && C.recipe(s, f.recipeId);
    if (fr) {
      const cur = fr.strain || '';
      h += '<div class="mx-box mx-st-new" data-s="' + f.strain + '"><div class="mx-st-nh"><span class="mx-art">' + stDish(f.strain, 3) + '</span><div><small>DISCOVERY</small><b>' + B.strains[f.strain].name.toUpperCase() + '</b><span>A new strain of ' + esc(fr.name) + '</span></div></div><p>' + STRAIN_NOTE[f.strain] + '</p>' +
        '<div class="mx-st-cmp"><div class="mx-hd"><span></span><span></span><span>NOW · ' + STRAIN_NAME(cur) + '</span><span>' + STRAIN_NAME(f.strain) + '</span></div>' + stCmp(s, fr, cur, f.strain) + '</div>' +
        '<div class="mx-st-acts"><span role="button" class="mx-st-go mx-use" data-act="strain:' + fr.id + ':' + f.strain + '">USE ' + B.strains[f.strain].name.toUpperCase() + '</span><span role="button" class="mx-st-go mx-keep" data-act="strainkeep">KEEP ' + STRAIN_NAME(cur).toUpperCase() + '</span></div></div>';
    }
    const strainable = (k) => P3.strainBases === 'all' || (B.cheesery.strainBases || []).indexOf(C.parseKey(k).base) >= 0;
    const pool = s.recipes.filter((r) => strainable(r.key)).sort((a, b) => C.potential(s, b) - C.potential(s, a));
    if (!pool.length) return h + '<p class="mx-lb-hint">You know no recipe that takes a strain yet.</p>';
    const lane = pool.find((r) => r.key === G().s.recipe) || null;
    const shown = pool.filter((r, i) => r === lane || r.strains.length || i < 3 || r.id === ui.strainRecipe);
    shown.sort((a, b) => (b === lane) - (a === lane));
    const r = shown.find((x) => x.id === ui.strainRecipe) || (fr && shown.find((x) => x.id === fr.id)) || shown[0];
    const want = r.strain || '', combo = C.parseKey(r.key);
    if (shown.length > 1) h += '<div class="mx-st-pick">' + shown.map((x) => '<span role="button" class="mx-st-rc' + (x === r ? ' mx-on' : '') + '"' + (x === r ? '' : ' data-act="strainrecipe:' + x.id + '"') + '>' + esc(x.name) + (x === lane ? ' · cooking' : '') + '</span>').join('') + '</div>';
    h += '<div class="mx-box mx-st-hero" data-rid="' + r.id + '" data-want="' + (want || 'plain') + '"><span class="mx-art">' + (want ? stDish(want, 2) : stLot(combo.base, 42, 36)) + '</span><div><small>SPECIMEN</small><b>' + esc(r.name) + '</b><span>' + (r === lane ? 'Your line cooks this one' : 'Not being cooked now') + '</span></div><em><i>' + stIc(want, combo.base, 2) + '</i>' + STRAIN_NAME(want).toUpperCase() + '</em></div>';
    const cook = cookMouse(s);
    if (want && lane && r !== lane && cook) h += '<div class="mx-box mx-st-idle"><span><b>' + STRAIN_NAME(want) + ' is equipped, but it is doing nothing yet.</b> ' + esc(cook.name) + ' is cooking ' + esc(lane.name) + '.</span><span role="button" class="mx-st-go mx-cook" data-act="cook:' + r.id + '">COOK THIS ONE</span></div>';
    h += '<div class="mx-st-grid">';
    const plain = strainStats(s, r, '');
    for (const id of [''].concat(Object.keys(B.strains))) {
      if (id && r.strains.indexOf(id) < 0) continue;
      const on = want === id;
      const lines = id ? strainLines(s, r, id).map((l) => '<li class="' + (l[1] === 'up' ? 'mx-up' : 'mx-dn') + '"><i>' + lbIc(l[1] === 'up' ? 'up' : 'down', 2) + '</i>' + l[0] + '</li>').join('')
        : '<li>Cooks in ' + lbDur(plain.time) + '</li><li>Uses ' + plain.base + ' Cheese Base</li><li>Sells for ' + CM.fmt(plain.price) + '</li>';
      h += '<div role="button" class="mx-box mx-st-card' + (on ? ' mx-on' : '') + '" data-s="' + (id || 'plain') + '"' + (on ? '' : ' data-act="strain:' + r.id + ':' + (id || 'plain') + '"') + '><span class="mx-art">' + (id ? stDish(id, 2, on ? '' : 'still') : stLot(combo.base, 42, 36)) + '</span><b>' + STRAIN_NAME(id).toUpperCase() + '</b><ul>' + lines + '</ul><em>' + (on ? 'IN USE' : 'USE') + '</em></div>';
    }
    const missing = Object.keys(B.strains).length - r.strains.length;
    if (missing) h += '<div class="mx-box mx-st-card mx-st-unk"><span class="mx-arts">' + stDish('', 1.5, 'lid').repeat(missing) + '</span><small>' + missing + ' undiscovered strain' + (missing > 1 ? 's' : '') + '</small></div>';
    h += '</div>';
    const job = L.job, busy = !!job, q0 = L.queue[0], queued = L.queue.some((q) => q.kind === 'strain' && q.key === r.key), cult = busy && job.kind === 'strain' ? C.recipe(s, job.key) : null;
    const nr = q0 && q0.key ? q0.key : '', nxName = q0 ? jobName(q0) : '';
    if (missing) {
      const p = cult ? 1 - job.remaining / job.total : 0, k = p < 0.1 ? 0 : p < 0.35 ? 1 : 2;
      h += '<div class="mx-box mx-st-station"><div class="mx-st-slot mx-now' + (cult ? ' mx-on' : busy ? ' mx-busy' : '') + '"><small>' + (cult ? 'CULTURING NOW' : busy ? 'LAB BUSY' : 'NOW') + '</small><span class="mx-art">' +
        (cult ? stDish('stage', 3) : busy ? '<img class="pix" src="' + MXSP + 'ic_flask.png" alt="" style="width:26px;height:28px">' : stDish('', 2, 'still')) + '</span><div class="mx-tx"><b>' + (cult ? esc(cult.name) : busy ? 'Researching' : 'Nothing culturing') + '</b>' + (cult ? '<i class="mx-st-bar"><i style="width:' + (p * 100).toFixed(1) + '%"></i></i>' : '') + '</div>' +
        (cult ? '<i class="mx-st-steps">' + ['SAMPLE', 'REACTION', 'GROWTH'].map((t, i) => '<span data-k="' + i + '" class="' + (i < k ? 'mx-done' : i === k ? 'mx-on' : '') + '">' + t + '</span>').join('') + '</i>' : '') + '</div>' +
        '<div class="mx-st-slot mx-next' + (q0 ? ' mx-on' : '') + '"><small>NEXT</small><span class="mx-art">' + (q0 ? (q0.kind === 'strain' ? stDish('', 1.5, 'lid still') : lbIc('seal', 2)) : '<i class="mx-st-hole"></i>') + '</span><b>' + (q0 ? esc(nxName) : 'Empty') + '</b>' + (q0 ? '<span role="button" class="mx-lb-x" data-act="labcancel">CANCEL</span>' : '') + '</div></div>';
    }
    const time = lbDur((Lb.labTime(G(), combo.base) * B.cheesery.strainTime) / labSpeedOf(w)), full = L.queue.length >= Lb.queueCap(G());
    const off = !missing || queued || full;
    h += '<span role="button" class="mx-st-go mx-culture' + (off ? ' mx-off' : '') + '"' + (off ? '' : ' data-act="strainfind:' + r.id + '"') + '>' + (!missing ? '<b>EVERY STRAIN OF THIS CHEESE FOUND</b>' : queued ? '<b>NEXT IN THE LAB</b>' : full ? '<b>THE QUEUE IS FULL</b>' : '<b>CULTURE A NEW STRAIN' + (busy ? ' NEXT' : '') + '</b><small>' + CM.fmt(Lb.labCost(G())) + ' Cheese Base · ' + time + '</small>') + '</span>';
    if (w) h += lbRow('auto', '<b>' + esc(w.name).toUpperCase() + ' KEEPS CULTURING</b>', 'follows the recipe your line cooks', 'labdir:strain', L.dir === 'strain' ? 'ON' : 'OFF', L.dir === 'strain', ' mx-st-keep');
    return h;
  }
  // Estudiar un queso nuevo y dibujar planos: lo que gasta materiales, con su coste a la vista y la ficha del material a un toque.
  function matCost(need) { return Object.keys(need || {}).map((k) => { const n = Math.ceil(need[k]), have = Math.floor(Inv.count(G().s, k)); return '<span role="button" class="mx-lb-mat' + (have >= n ? '' : ' mx-short') + '" data-act="item:' + k + '"><img class="pix" src="' + MXSP + 'ic_raw_' + k + '.png" alt="" style="width:14px;height:12px">' + CM.fmt(have) + '/' + CM.fmt(n) + '</span>'; }).join(''); }
  function mxStudies(s) {
    const L = G().lab, P = H.PARAMS; let h = '';
    for (const st of P.strata) {
      const id = 'study.' + st.id;
      if (!Pg.has(id) || !Pg.isOpen(G(), id) || L.styles[st.id]) continue;
      const busy = (L.job && L.job.style === st.id) || L.queue.some((q) => q.style === st.id), need = Lb.studyNeed(st.id), ok = Lb.afford(G(), { kind: 'study', style: st.id });
      h += '<div class="mx-box mx-lb-row mx-lb-study' + (ok && !busy ? ' mx-ready' : '') + '" data-m="book"><span class="mx-ic"><img class="pix" src="' + MXSP + 'ic_lot_' + st.id + '.png" alt="" style="width:22px;height:19px"></span><span class="mx-t"><small>NEW CHEESE</small><b>STUDY ' + B.bases[st.id].name.toUpperCase() + '</b><span class="mx-d">' + (busy ? 'In the lab now' : matCost(need)) + '</span></span><em' + (busy || !ok ? ' class="mx-off"' : ' data-act="study:' + st.id + '"') + ' role="button">' + (busy ? 'BUSY' : 'STUDY') + '</em></div>';
    }
    for (const bp of Object.keys(H.PARAMS.s3.lab.blueprints || {})) {
      const id = 'plan.' + bp;
      if (!Pg.has(id) || !Pg.isOpen(G(), id) || L.blueprints[bp]) continue;
      const busy = (L.bpJob && L.bpJob.id === bp) || (L.bpQueue || []).some((q) => q.id === bp), ok = Lb.afford(G(), { kind: 'blueprint', id: bp });
      h += '<div class="mx-box mx-lb-row mx-lb-study' + (ok && !busy ? ' mx-ready' : '') + '" data-m="book"><span class="mx-ic">' + lbIc('book', 2) + '</span><span class="mx-t"><small>BLUEPRINT</small><b>' + H.pretty(bp).toUpperCase() + '</b><span class="mx-d">' + (busy ? 'On the drawing desk' : matCost(Lb.bpNeed(bp))) + '</span></span><em' + (busy || !ok ? ' class="mx-off"' : ' data-act="blueprint:' + bp + '"') + ' role="button">' + (busy ? 'BUSY' : 'DRAW') + '</em></div>';
    }
    return h;
  }
  function mxLab(s, ui) {
    const L = G().lab, C = CM.cheesery, w = labW();
    if (!L.built) {
      const open = Pg.isOpen(G(), 'build.lab'), q = Pg.status(G(), 'build.lab').requires.filter((r) => !r.ok);
      return lbHead(s) + '<div class="mx-box mx-lb-build' + (open ? ' mx-ready' : '') + '"><span class="mx-ic"><img class="pix" src="' + MXSP + 'ic_flask.png" alt="" style="width:26px;height:28px"></span><div class="mx-t">' + (open
        ? '<b>THE CHEESE LAB IS READY TO BUILD</b><small>Its own building: discover new recipes there, and later give a mouse the research post.</small><span role="button" class="mx-lb-go mx-build" data-act="build:lab"><b>BUILD</b><small>It is free</small></span>'
        : '<b>CHEESE LAB</b><small>' + q.map((r) => r.text).join(' · ') + '</small>') + '</div></div>';
    }
    let h = lbHead(s);
    const m = lbMode(s);
    if (L.nodes.strains) {
      const tab = ui.labTab === 'strains' ? 'strains' : 'recipes', fresh = !!ui.found || (!s.recipes.some((r) => r.strains.length) && !(L.job && L.job.kind === 'strain'));
      h += '<div class="mx-lb-tabs">' + [['recipes', 'RECIPES'], ['strains', 'STRAINS']].map(([k, l]) => '<span role="button" class="mx-box mx-lb-tab' + (tab === k ? ' mx-sel' : '') + (k === 'strains' && fresh && tab !== k ? ' mx-st-newtab' : '') + '"' + (tab === k ? '' : ' data-act="labtab:' + k + '"') + '><span class="mx-nm">' + l + (k === 'strains' && fresh ? ' · NEW' : '') + '</span></span>').join('') + '</div>';
      if (tab === 'strains') return h + mxStrains(s, ui);
    }
    const dir = L.dir;
    h += mxStudies(s);
    if (L.nodes.advanced) {
      const what = dir === 'strain' ? 'is culturing strains: choose a direction to go back to recipes' : !dir ? 'researches nothing on its own until you choose' : Lb.pick(G(), dir) ? 'works through ' + DIR_NAME(dir) : 'has nothing left in ' + DIR_NAME(dir) + ' at your CHEESE level';
      h += '<div class="mx-lb-dwrap">' + lbRow('dir', '<small>DIRECTION</small><b>' + DIR_LABEL(dir === 'strain' ? '' : dir) + '</b>', w ? esc(w.name) + ' ' + what : 'Your researcher will follow it', 'labdiropen', ui.labDirOpen ? 'CLOSE' : 'CHANGE', m === 'dir');
      if (ui.labDirOpen) {
        const kind = String(dir || '').split(':')[0], cat = ui.labDirCat || (DIR_CATS.some((c) => c[0] === kind) ? kind : 'goal');
        const chip = (d, label, icn) => '<span role="button" class="mx-lb-chip mx-lb-dchip' + (dir === d ? ' mx-on' : '') + '" data-act="labdir:' + (d || 'none') + '"><span class="mx-r">' + (icn || '') + label + '</span></span>';
        const ids = cat === 'base' ? C.unlockedBases(s) : cat === 'goal' ? [] : Object.keys(B[C.TABLES[cat]]).filter((id) => !C.partLocked(s, cat, id));
        h += '<div class="mx-box mx-lb-dsel"><div class="mx-lb-cats">' + DIR_CATS.map((c) => '<span role="button" class="mx-lb-cat' + (c[0] === cat ? ' mx-on' : '') + '" data-act="labdircat:' + c[0] + '">' + c[1] + '</span>').join('') + '</div><div class="mx-lb-opts">' +
          (cat === 'goal' ? chip('value', 'Highest value') + chip('fast', 'Quickest to cook') + chip('', 'None') : ids.map((id) => chip(cat + ':' + id, B[C.TABLES[cat]][id].name, cat === 'base' ? '<img class="pix" src="' + mxBaseIc(id) + '" alt="" style="width:14px;height:12px">' : lbIc('part:' + id, 2))).join('')) + '</div></div>';
      }
      h += '</div>';
    } else if (w) h += lbRow('auto', '<small>AUTOMATIC</small><b>' + esc(w.name) + ' researches for you</b>', 'Always the most valuable recipe you can make, one after another.', '', '', m === 'auto');
    const ready = H.Core.options(G()).filter((o) => /^lab/.test(o.kind) && G().s.coins >= o.cost).length;
    h += lbRow('up', '<b>LAB UPGRADES</b>', 'Stage ' + L.phase + '. New posts, faster and cheaper research', 'tree:lab', ready ? ready + ' READY' : 'OPEN', false, ready ? ' mx-ready' : '');
    h += lbRow('book', '<b>RECIPE BOOK</b>', s.recipes.length + '/' + C.totalCombos() + ' discovered', 'book', 'OPEN');
    const hand = ui.labHand === null || ui.labHand === undefined ? !w : ui.labHand;
    h += lbRow('hand', '<b>RESEARCH ONE BY HAND</b>', Lb.labCost(G()) + ' Cheese Base · ' + lbDur(Lb.labTime(G(), tier()) / labSpeedOf(w)), 'labhand', hand ? 'CLOSE' : 'OPEN', m === 'hand');
    if (hand) h += lbPicker(s, ui);
    return h;
  }

  // ---------- BOOSTS ----------
  const BOOST_COLS = [['mining', 'MINE', 'pick'], ['drilling', 'DRILL', 'raw'], ['refining', 'REFINE', 'base'], ['cheesemaking', 'CHEESE', 'lot']];
  const boOcc = (ui, key, n) => (n >= 2 ? [true, true] : n <= 0 ? [false, false] : ((ui.boSlot && ui.boSlot[key]) || 0) === 1 ? [false, true] : [true, false]);
  const boSlotH = (on, off, w, i) => '<span class="mx-bo-slot' + (on ? ' mx-on' : '') + (off ? ' mx-off' : '') + '" data-w="' + w + '"' + (w === 'post' ? ' role="button" data-i="' + i + '"' : '') + '><canvas class="pix" data-boic="' + (on ? 'socket' : 'socketd') + '"></canvas>' + (on ? '<i class="mx-bo-g" data-k="' + (off ? 'off' : 'on') + '" style="--d:' + ((i * 1.37) % 4).toFixed(2) + 's"><canvas class="pix" data-boic="' + (off ? 'gemoff' : 'gem') + '"></canvas></i>' : '') + '</span>';
  function boCell(s, ui, skill, zone, face, shop) {
    const BO = CM.boosts, key = skill + ':' + zone, n = BO.at(s, skill, zone), st = !!CM.mice.at(s, skill, zone), occ = boOcc(ui, key, n);
    const lab = n ? (shop ? BO.label(skill, n) : BO.label(skill, n).split(' ')[0]) : '';
    return '<div class="mx-box ' + (shop ? 'mx-bo-shop' : 'mx-bo-cell') + (n ? ' mx-n' + n : '') + (st ? '' : ' mx-off') + '" data-key="' + key + '"><span class="mx-bo-face">' + face + (shop ? '<span class="mx-t"><b>SHOP</b><small>Sells all your cheese</small></span>' : '') + '<u>' + lab + '</u></span><span class="mx-bo-slots">' + occ.map((on, i) => boSlotH(on, !st, 'post', i)).join('') + '</span></div>';
  }
  function mxBoosts(s, ui) {
    const BO = CM.boosts, owned = BO.owned(s), free = BO.free(s), placed = Ru.placedBoosts(G()), t = tier();
    let h = '<div class="mx-box mx-bo-head"><div class="mx-bo-tray' + (free > 0 ? ' mx-has' : '') + '"><div class="mx-bo-sock">' + (owned ? Array.from({ length: owned }, (_, i) => boSlotH(i < free, false, 'tray', i)).join('') : '<span class="mx-bo-none">No boosts yet</span>') + '</div><div class="mx-bo-cnt"><span><b>' + free + '</b><small>FREE</small></span><span><b>' + placed + '</b><small>PLACED</small></span></div></div>' +
      '<p>A boost gives one station <b>' + BO.label('mining', 1).toLowerCase() + '</b>, whoever works there. On the refinery it gives <b>' + BO.label('refining', 1).split(' ')[0] + ' Base</b> from the same Raw instead. Up to 2 per station.</p></div>';
    const nx = CM.boostNext();
    if (nx) h += '<div class="mx-box mx-bo-next" data-nx="rock"><canvas class="pix mx-bo-ghost" data-ghost="0"></canvas><div class="mx-t"><b>NEXT BOOST</b><span>' + nx + '</span></div></div>';
    if (!owned) return h + '<p class="mx-bo-hint">You have no boosts yet.</p>';
    h += '<p class="mx-bo-hint">Tap an empty slot <i><canvas class="pix" data-boic="socketd" data-k="1"></canvas></i> to put a boost in it; tap a boost <i><canvas class="pix" data-boic="gem" data-k="1"></canvas></i> to take it back.</p>';
    h += '<div class="mx-bo-grid"><span></span>' + BOOST_COLS.map((c) => '<small class="mx-bo-col">' + c[1] + '<i>' + (c[0] === 'refining' ? 'BASE' : 'SPEED') + '</i></small>').join('');
    const face = (k) => (k === 'pick' ? '<img class="pix" src="' + MXSP + 'ic_pick.png" alt="" style="width:14px;height:14px">' : '<img class="pix" src="' + MXSP + 'ic_' + k + '_' + t + '.png" alt="" style="width:' + (k === 'lot' ? 15 : 14) + 'px;height:' + (k === 'lot' ? 13 : 12) + 'px">');
    h += '<b class="mx-bo-rock"><img class="pix" src="' + MXSP + 'ic_raw_' + t + '.png" alt="" style="width:14px;height:12px">Chain</b>';
    for (const c of BOOST_COLS) { if (c[0] !== 'mining' && !G().s.built[STN[c[0]]]) { h += '<span></span>'; continue; } h += boCell(s, ui, c[0], 'line', face(c[2]), false); }
    h += '</div>';
    if (G().s.built.sell) h += boCell(s, ui, 'trading', 'all', '<img class="pix" src="' + MXSP + 'ic_coin.png" alt="" style="width:16px;height:16px">', true);
    h += '<p class="mx-bo-hint">A station with no mouse running it gets nothing from a boost.</p>';
    h += '<span role="button" class="mx-bo-back"' + (placed ? '' : ' hidden') + '>TAKE ALL BOOSTS BACK</span>';
    return h;
  }

  // ---------- MENU ----------
  function mxMenu() {
    const ic = CM.pmenu.ic;
    const sec = (title, tag, cls, inner) => '<div class="mx-mn-sec' + (cls ? ' ' + cls : '') + '"><div class="mx-mn-h"><b>' + title + '</b>' + (tag ? '<small>' + tag + '</small>' : '') + '</div>' + inner + '</div>';
    const row = (icn, title, sub, right, cls, act) => '<div class="mx-box mx-mn-row' + (cls ? ' ' + cls : '') + '"' + (act ? ' role="button" data-act="' + act + '"' : '') + '><span class="mx-ic">' + icn + '</span><span class="mx-t"><b>' + title + '</b><small>' + sub + '</small></span>' + right + '</div>';
    const b = (act, label, cls) => '<span role="button" class="mx-act' + (cls ? ' ' + cls : '') + '" data-act="' + act + '">' + label + '</span>';
    const i = H.saveInfo(), sky = H.skyInfo();
    const alert = G().s.vein.open || G().s.rates.mine.auto ? 'Nothing is stopped.' : 'DRILL is stopped: dig in MINE to open a vein.';
    let h = sec('ALERTS', '', '', '<div class="mx-box mx-mn-row st-plain"><span class="mx-t"><b>' + alert + '</b></span></div>') + sec('YOUR COLONY', '', '', '<div class="mx-box mx-mn-row st-plain"><span class="mx-t"><b>Saved on this device</b><small>' + (i.failed ? '<em class="mx-off">Could not save here</em>' : i.ago != null ? i.ago + ' s ago' : 'Not saved yet') + ' · works up to ' + i.hours + ' h while you are away</small></span></div>');
    h += sec('SKY', '', '', '<div class="mx-box mx-mn-row st-plain"><span class="mx-t"><b>' + (sky.mode === 'auto' ? 'Follows your clock' : 'Fixed time') + '</b><small>' + sky.text + '</small></span></div><div class="p1-opts">' + [['auto', 'AUTO'], ['8', 'DAWN'], ['13', 'DAY'], ['18.4', 'DUSK'], ['23', 'NIGHT']].map(([v, l]) => '<span role="button" class="mx-act' + (sky.value === v ? ' p1-on' : '') + '" data-act="sky:' + v + '">' + l + '</span>').join('') + '</div>');
    h += sec('YOUR SAVE', '', '', row(ic('exp'), 'Export save', 'A copy of this colony, as text', b('export', 'EXPORT', 'mx-mn-btn')) + row(ic('imp'), 'Import save', 'Paste an exported colony', b('import', 'IMPORT', 'mx-mn-btn')));
    h += sec('DANGER ZONE', '', 'mx-mn-danger', row(ic('reset'), 'Start over', 'Only this beta colony. Other games are not touched', b('reset', 'RESET', 'mx-mn-red'), 'mx-bad'));
    return h + '<p class="mx-mn-foot"><b>Cheese Driller Beta</b> · build ' + esc(i.build) + '. Data never leaves this browser.</p>';
  }

  // ---------- Ficha de un objeto: se abre desde cualquier coste, sin perder lo que se estaba haciendo ----------
  function itemCard(id) {
    const k = Inv.card(G(), id), uses = Inv.uses(G(), id, true);
    const USE = (u) => { const [kind, x] = String(u.what).split(':'); return (kind === 'study' ? 'Study ' + B.bases[x].name : kind === 'blueprint' ? 'Blueprint: ' + H.pretty(x) : u.what) + ' · ' + CM.fmt(u.n); };
    return '<div class="mx-mn-layer"><div class="mx-box mx-mn-win mx-it-win" role="dialog"><div class="mx-mn-wh"><img class="pix" src="' + MXSP + k.icon + '.png" alt="" style="width:21px;height:18px"><b>' + esc(k.name).toUpperCase() + '</b></div>' +
      '<div class="mx-it-n"><b>' + CM.fmt(Math.floor(k.have)) + '</b><small>in the pantry · ' + CM.fmt(Math.floor(k.made)) + ' found, ' + CM.fmt(Math.floor(k.spent)) + ' used</small></div>' +
      '<div class="mx-it-sec"><small>WHERE IT COMES FROM</small><p>' + H.itemSource(id) + '</p></div>' +
      '<div class="mx-it-sec"><small>WHAT IT IS FOR</small>' + (uses.length ? '<ul>' + uses.map((u) => '<li>' + USE(u) + '</li>').join('') + '</ul>' : '<p>Nothing you know of yet.</p>') + '</div>' +
      '<div class="mx-mn-bts"><button class="mx-act mx-mn-go" data-m="ok">OK</button></div></div></div>';
  }

  function micePanel(s, ui) {
    if (!G().built.house) {
      const open = Pg.isOpen(G(), 'build.house'), q = Pg.status(G(), 'build.house').requires.filter((r) => !r.ok);
      return '<p class="lead">A <b>mouse on a post</b> does that job on its own, even while you are away.</p><p class="hint">Every mouse is one of a kind: its own look, traits, quirks and jobs it likes. As it works it levels up, develops new traits of its own and specialises in its trade. They stay until you dismiss them.</p>' +
        (open ? '<span role="button" class="mx-fc-go" data-act="build:house">BUILD THE MOUSE HOUSE<span>It is free</span></span>' : '<p class="hint">First: ' + q.map((r) => r.text.toLowerCase()).join(' · ') + '.</p>');
    }
    if (s.candidates.length && ui.miceTab === 'recruit') return mxRecruit(s, ui);
    if (ui.miceTab === 'album') return mxAlbum(s);
    if (ui.miceTab === 'promos') return mxBulk(s, ui);
    const shown = ui.card ? CM.mice.byId(s, ui.card) : null;
    if (shown) return mxCard(s, ui, shown);
    if (ui.pick && CM.mice.posts(s).some((p) => p.key === ui.pick)) return mxPicker(s, ui, ui.pick);
    const view = ui.miceView === 'roster' || ui.miceView === 'house' ? ui.miceView : 'rocks';
    let h = mxTabs(s, view);
    if (!s.mice.length && view === 'rocks') h += '<p class="mx-ps-hint">Hire your first mouse, then tap a post to put it to work. A mouse on a post does that stage for you, even while you are away.</p>';
    return h + (view === 'roster' ? mxRoster(s, ui) : view === 'house' ? mxHouse(s, ui) : mxColony(s, ui));
  }
  const pnRoot = (kind, extra) => '<div class="mx-pn-root" data-pn="' + kind + '" data-k="' + (extra || '') + '"></div>';
  const TITLES = { cheese: 'CHEESERY', lab: 'CHEESE LAB', stock: 'PANTRY', shopinfo: 'SHOP', coins: 'COINS', mice: 'MICE', boosts: 'BOOSTS', options: 'MENU', tree: 'UPGRADES' };
  CM.panels = {
    esc, mouseRate, itemCard,
    // Las cifras de la tarjeta de CHEESE se ponen al día en su sitio, sin rehacer la tarjeta.
    cheeseLive() {
      const s = CM.viewState, o = chInfo(s), C = CM.cheesery, reserve = o.reserve ? ' · ' + o.reserve + ' set aside for the lab' : '';
      return { held: !!o.held, have: CM.fmt(o.have), text: o.text, need: chNeedN(o), needtx: o.st === 'base' ? CM.fmt(Math.min(o.have, o.need)) + '/' + CM.fmt(o.need) + ' for the next batch' + reserve : o.text, pct: o.need ? Math.round(Math.min(1, o.have / o.need) * 100) : 0 };
    },
    title: (name) => TITLES[name],
    render(name, s, ui) {
      GM = s.master && G().ms.master ? s.master : '';
      if (name === 'mice') return micePanel(s, ui);
      if (name === 'cheese') return cheesePanel(s, ui);
      if (name === 'lab') return mxLab(s, ui);
      if (name === 'boosts') return mxBoosts(s, ui);
      if (name === 'options') return mxMenu();
      if (name === 'tree') return CM.skilltree.render(s, ui);
      if (name === 'stock') return pnRoot('pantry', Object.keys(G().lab.styles).join());
      if (name === 'shopinfo') return pnRoot('shop', Object.keys(G().lab.styles).join() + ':' + !!G().s.built.sell);
      if (name === 'coins') return pnRoot('coins', Object.keys(G().lab.styles).join());
      return '';
    },
  };
})();
