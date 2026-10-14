// RATONES: la plantilla. Cada ratón es un personaje con nombre, un rasgo
// bueno, una manía, un oficio favorito, nivel propio y rango.
// Una etapa de una línea está automatizada si tiene un ratón en su puesto.
// Un ratón solo se va si el jugador lo despide; el que no trabaja espera en la Mouse House.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const M = B.mice;

  const postKey = (skill, zone) => skill + ':' + (skill === 'trading' || skill === 'research' ? 'all' : zone);
  const xpFor = (level) => (M.xpBase * (Math.pow(M.xpGrowth, level - 1) - 1)) / (M.xpGrowth - 1);
  // El nivel se recuerda mientras la experiencia siga claramente dentro de su tramo (con un
  // margen muy por encima del redondeo de la fórmula): cerca del cambio se calcula siempre.
  const levelMemo = new WeakMap();
  function level(m) {
    const hit = levelMemo.get(m);
    if (hit && m.xp >= hit.lo && m.xp < hit.hi) return hit.level;
    const lv = levelNow(m);
    levelMemo.set(m, { level: lv, lo: m.xp, hi: lv >= M.maxLevel ? Infinity : xpFor(lv + 1) * (1 - 1e-6) });
    return lv;
  }
  function levelNow(m) {
    const raw = Math.floor(Math.log((m.xp * (M.xpGrowth - 1)) / M.xpBase + 1) / Math.log(M.xpGrowth) + 1e-9) + 1;
    return Math.max(1, Math.min(M.maxLevel, raw));
  }
  const T = M.traits;
  const CHAIN = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading'];
  // Todos los oficios en los que puede trabajar un ratón: la cadena y el laboratorio.
  const JOBS = CHAIN.concat('research');
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const idsOf = (kind) => Object.keys(T).filter((k) => T[k].kind === kind);
  const jobTraits = (skill) => Object.keys(T).filter((k) => T[k].job === skill);

  // Rellena los campos que le falten a un ratón (partidas viejas, pruebas, dev tools).
  function normalize(m) {
    if (!m.aff) m.aff = {};
    if (!m.learned) m.learned = []; // rasgos aprendidos al subir de nivel
    if (!(m.picks >= 0)) m.picks = 0; // elecciones de nivel ya hechas
    if (!m.spec) m.spec = {}; // oficio -> rasgo de oficio elegido
    if (!m.jobs) m.jobs = {}; // oficio -> trabajos hechos (para especializarse)
    if (!(m.rarity >= 0)) m.rarity = 0;
    return m;
  }

  // Grado (0-3) del rasgo de oficio de un ratón en una habilidad.
  function gradeOf(m, skill) {
    if (!m.spec || !m.spec[skill]) return 0;
    const done = (m.jobs && m.jobs[skill]) || 0;
    let g = 0;
    for (let i = 0; i < M.jobGrades.length; i++) if (done >= M.jobGrades[i]) g += 1;
    return g;
  }
  // Todos sus rasgos: de nacimiento, aprendidos y de oficio (con su grado).
  function traitsOf(m) {
    const out = m.traits.concat(m.learned || []).map((id) => ({ id, grade: 1 }));
    for (const skill of Object.keys(m.spec || {})) if (T[m.spec[skill]]) out.push({ id: m.spec[skill], grade: Math.max(1, gradeOf(m, skill)) });
    return out.filter((t) => T[t.id]);
  }
  function combosOf(m) {
    const have = {};
    traitsOf(m).forEach((t) => (have[t.id] = true));
    return M.combos.filter((c) => c.needs.every((id) => have[id]));
  }
  // Suma de efectos de un ratón en un oficio. Los rasgos de oficio solo cuentan
  // en el suyo; un rasgo con `noQuirks` anula las manías.
  const fxCache = {};
  // Mientras BEST FIT busca, lo que no depende del puesto (efectos de cada ratón, combinaciones
  // entre dos ratones) se calcula una vez, y quién está en cada puesto se lleva en un índice.
  let fit = null;
  function fx(m, skill) {
    if (fit) {
      const k = m.id + '|' + skill;
      let v = fit.fx.get(k);
      if (!v) fit.fx.set(k, (v = fxNow(m, skill)));
      return v;
    }
    const memo = CM.memo;
    if (memo) {
      const k = 'f' + m.id + '|' + skill;
      const hit = memo.get(k);
      if (hit && hit.rev === CM.rev) return hit.v;
      const v = fxNow(m, skill);
      memo.set(k, { rev: CM.rev, v });
      return v;
    }
    return fxNow(m, skill);
  }
  function fxNow(m, skill) {
    const list = traitsOf(m);
    const sig = skill + '|' + list.map((t) => t.id + t.grade).join(',');
    if (fxCache[sig]) return fxCache[sig];
    const calm = list.some((t) => T[t.id].eff.noQuirks);
    const sum = {};
    const addAll = (eff, mult) => {
      for (const k of Object.keys(eff)) sum[k] = (sum[k] || 0) + eff[k] * mult;
    };
    for (const t of list) {
      const def = T[t.id];
      if (def.job && def.job !== skill) continue;
      if (def.kind === 'quirk' && calm) continue;
      addAll(def.eff, def.job ? M.gradeMult[t.grade - 1] : 1);
    }
    for (const c of combosOf(m)) addAll(c.eff, 1);
    return (fxCache[sig] = sum);
  }
  const trait = (m, key, skill) => fx(m, skill || '')[key] || 0;
  const hasTrait = (m, id) => (id === '*legend' ? m.rarity === 2 || traitsOf(m).some((t) => T[t.id].kind === 'legend') : traitsOf(m).some((t) => t.id === id));

  // ---------- Combinaciones de vecinos y de roca ----------
  const mouseAt = (s, skill, zone) => (fit ? fit.at[postKey(skill, zone)] || null : s.mice.find((x) => x.post === postKey(skill, zone)) || null);
  const linksNow = (x, y) => M.links.filter((l) => (hasTrait(x, l.a) && hasTrait(y, l.b)) || (hasTrait(x, l.b) && hasTrait(y, l.a)));
  function linksBetween(x, y) {
    if (!x || !y) return [];
    if (!fit) return linksNow(x, y);
    const k = x.id < y.id ? x.id + '|' + y.id : y.id + '|' + x.id;
    let v = fit.links.get(k);
    if (!v) fit.links.set(k, (v = linksNow(x, y)));
    return v;
  }
  // Vecinos de un puesto: el anterior y el siguiente de su línea. El tendero
  // es vecino del quesero de cada roca.
  function neighbours(s, skill, zone) {
    const i = CHAIN.indexOf(skill);
    const lab = mouseAt(s, 'research', 'all');
    // El investigador es vecino de todos los queseros y refinadores, y del tendero.
    if (skill === 'research') return q.openZones(s).reduce((a, z) => a.concat(mouseAt(s, 'cheesemaking', z.id), mouseAt(s, 'refining', z.id)), [mouseAt(s, 'trading', 'all')]);
    if (skill === 'trading') return q.openZones(s).map((z) => mouseAt(s, 'cheesemaking', z.id)).concat(lab);
    return [i > 0 ? mouseAt(s, CHAIN[i - 1], zone) : null, mouseAt(s, CHAIN[i + 1], zone)].concat(skill === 'cheesemaking' || skill === 'refining' ? lab : []);
  }
  function setsOf(s, zone) {
    const entry = (m, skill) => ({ m, aff: (m.aff && m.aff[skill]) || 0, spec: !!m.spec[skill], fur: parts(m).fur, legend: hasTrait(m, '*legend'), night: trait(m, 'awaySpeed', skill) > 0 });
    const line = CHAIN.slice(0, 4).map((skill) => {
      const m = mouseAt(s, skill, zone);
      if (!m || !fit) return m && entry(m, skill);
      const k = m.id + '|' + skill;
      let v = fit.line.get(k);
      if (!v) fit.line.set(k, (v = entry(m, skill)));
      return v;
    });
    return line.every(Boolean) ? M.sets.filter((d) => d.test(line)) : [];
  }
  // Lo que un puesto recibe de las combinaciones de vecinos y de roca. Se
  // recalcula solo cuando cambia la plantilla.
  let teamKey = '';
  let teamMap = {};
  // Dentro de un paso de simulación la plantilla no cambia (y si cambia, quien la cambia
  // lo avisa con `teamKey = ''`), así que la firma se calcula una vez por paso y no en cada
  // consulta: con 26 ratones era lo que más tiempo se llevaba al simular horas de ausencia.
  let frozen = false;
  let scanSig = '';
  let scanState = null;
  const teamSig = (s) => s.mice.map((m) => m.id + m.post + m.rank + m.traits.join('') + m.learned.join('') + Object.keys(m.spec).join('')).join('|');
  function team(s, skill, zone) {
    if (!frozen || teamKey === '') {
      const key = teamSig(s);
      if (key !== teamKey) {
        teamKey = key;
        teamMap = {};
      }
    }
    const pk = postKey(skill, zone);
    if (teamMap[pk]) return teamMap[pk];
    const out = { eff: {}, links: [], sets: [] };
    const me = mouseAt(s, skill, zone);
    if (me) {
      for (const n of neighbours(s, skill, zone)) for (const l of linksBetween(me, n)) if (out.links.indexOf(l) < 0) out.links.push(l);
      if (skill !== 'trading' && skill !== 'research') out.sets = setsOf(s, zone);
      for (const c of out.links.concat(out.sets)) for (const k of Object.keys(c.eff)) out.eff[k] = (out.eff[k] || 0) + c.eff[k];
    }
    return (teamMap[pk] = out);
  }
  const affinity = (m, skill) => M.affinity[(m.aff && m.aff[skill]) || 0] || M.affinity[0];

  // ---------- BEST FIT: estimación de ingresos y búsqueda ----------
  const FIT_GAIN = 1.01; // un intercambio solo se propone si sube la estimación más de un 1 %
  const FIT_ROUNDS = 40;
  let fitCache = {};
  // Lo que cambia el plan: la plantilla, los refuerzos, las rocas, las mejoras y las recetas.
  const fitKey = (s) => teamSig(s) + '|' + s.boosts.join() + '|' + s.totals.zonesUnlocked + '|' + s.recipes.length + '|' + Object.keys(s.nodes).reduce((a, k) => a + s.nodes[k], 0);
  // Lo que saca una roca (quesos por segundo) y a cuánto se venden. `alone`: cada ratón por
  // separado, sin vecinos ni combinaciones.
  function fitLine(s, def, alone) {
    const r = CM.cheesery.laneRecipe(s, def.id);
    if (!r) return { id: def.id, price: 0, flow: 0 };
    const c = CM.boosts.capacity(s, def, true, alone);
    // Lo que ya está en la despensa también se cocina: cuenta como si llegara a lo largo de una hora.
    const B0 = CM.BALANCE;
    const perRaw = ((1 + q.mods(s)('refBonus')) * CM.boosts.baseMult(s, def.id)) / B0.refinery.rawPerBase / B0.cheesery.lotBase;
    const raw = (s.inv.raw[def.base] * perRaw) / 3600;
    const base = s.inv.base[def.base] / B0.cheesery.lotBase / 3600;
    return { id: def.id, price: CM.shop.price(s, r), flow: Math.min(c.cheesemaking, Math.min(c.refining, c.supply + raw) + base) };
  }
  function fitIncome(s, lines, alone) {
    const w = mouseAt(s, 'trading', 'all');
    if (!w) return 0;
    // La tienda vende un número de quesos por ciclo, empezando por los más caros.
    let cap = (q.sellCount(s) / (q.sellDuration(s) / 1000)) * speed(w, 'trading', s, 'all', alone) * CM.boosts.mult(s, 'trading', 'all');
    let coins = 0;
    for (const l of lines.slice().sort((a, b) => b.price - a.price)) {
      const n = Math.min(cap, l.flow);
      coins += n * l.price;
      cap -= n;
      if (cap <= 0) break;
    }
    return coins * yieldMult(w, 'trading', s, 'all', alone) * (1 + (alone ? doubleChance(w, 'trading') : doubleChance(w, 'trading', s, 'all')));
  }
  // Búsqueda: cambia de verdad los puestos de `s.mice` para estimar y los devuelve a su sitio al
  // terminar. No emite eventos ni toca nada más de la partida.
  function fitSearch(s) {
    const memo = CM.memo, wasFrozen = frozen;
    const start = s.mice.map((m) => m.post);
    CM.memo = null;
    frozen = true;
    fit = { fx: new Map(), links: new Map(), line: new Map(), at: {} };
    const index = () => { fit.at = {}; s.mice.forEach((m) => { if (m.post) fit.at[m.post] = m; }); };
    const swap = (i, j) => { const a = s.mice[i].post; s.mice[i].post = s.mice[j].post; s.mice[j].post = a; index(); };
    const defs = q.openZones(s);
    const zoneOf = (post) => (post ? post.split(':')[1] : '');
    // Con todo: equipos, auras y combinaciones tal como quedarían.
    const whole = () => { teamKey = ''; return fitIncome(s, defs.map((d) => fitLine(s, d))); };
    const climb = () => {
      index();
      teamKey = '';
      const lines = {};
      for (const d of defs) lines[d.id] = fitLine(s, d, true);
      const all = () => defs.map((d) => lines[d.id]);
      let now = fitIncome(s, all(), true);
      let real = whole();
      for (let round = 0; round < FIT_ROUNDS; round++) {
        // Todos los intercambios que suben la estimación, de mayor a menor. Aquí cada ratón
        // cuenta por sí solo: BEST FIT no busca combinaciones entre ratones.
        const found = [];
        for (let i = 0; i < s.mice.length; i++) {
          const a = s.mice[i].post;
          if (a.indexOf('research') === 0) continue;
          for (let j = i + 1; j < s.mice.length; j++) {
            const b = s.mice[j].post;
            if (a === b || b.indexOf('research') === 0) continue;
            swap(i, j);
            // Solo cambian las rocas de esos dos puestos (y la tienda, que se recalcula siempre).
            const touched = {};
            for (const z of [zoneOf(a), zoneOf(b)]) if (lines[z]) touched[z] = fitLine(s, q.zoneDef(z), true);
            const e = fitIncome(s, defs.map((d) => touched[d.id] || lines[d.id]), true);
            if (e > now * FIT_GAIN) found.push({ i, j, e, zones: [zoneOf(a) || 'house', zoneOf(b) || 'house'] });
            swap(i, j);
          }
        }
        if (!found.length) break;
        // En la misma vuelta se hacen todos los que no se pisan (rocas distintas). Antes de dar
        // cada uno por bueno se mira el resultado con todo: si rompe un equipo o una combinación
        // que valía más que lo que gana, no se hace.
        found.sort((x, y) => y.e - x.e);
        const busy = {};
        let done = 0;
        for (const f of found) {
          if (f.zones.some((z) => busy[z])) continue;
          swap(f.i, f.j);
          const after = whole();
          if (after < real) { swap(f.i, f.j); continue; }
          real = after;
          f.zones.forEach((z) => (busy[z] = true));
          done += 1;
        }
        if (!done) break;
        for (const d of defs) lines[d.id] = fitLine(s, d, true);
        now = fitIncome(s, all(), true);
      }
      return { e: whole(), posts: s.mice.map((m) => m.post) };
    };
    // Dos puntos de partida: la plantilla actual y la de prioridades. Gana la que más estime
    // (con todo); a igualdad (menos de un 1 %), la que sale de la actual, que mueve menos ratones.
    const fromNow = climb();
    const greedy = CM.mice.bestFitGreedy(s);
    // También ahí el investigador sigue en el laboratorio.
    const lab = s.mice.find((m) => m.post.indexOf('research') === 0);
    if (lab) {
      const other = s.mice.find((m) => greedy[m.id] === lab.post);
      if (other && other !== lab) greedy[other.id] = greedy[lab.id] || '';
      greedy[lab.id] = lab.post;
    }
    s.mice.forEach((m) => (m.post = greedy[m.id] || ''));
    const fromGreedy = climb();
    const pick = fromGreedy.e > fromNow.e * FIT_GAIN ? fromGreedy : fromNow;
    s.mice.forEach((m, i) => (m.post = start[i]));
    // Las combinaciones de equipo se vuelven a calcular con la plantilla de verdad.
    fit = null;
    teamKey = '';
    frozen = wasFrozen;
    CM.memo = memo;
    const plan = {};
    s.mice.forEach((m, i) => { if (pick.posts[i]) plan[m.id] = pick.posts[i]; });
    return plan;
  }

  // Lo que le dan sus vecinos de línea (auras). Con `s` y `zone`.
  function auraFor(s, skill, zone) {
    const i = CHAIN.indexOf(skill);
    if (i < 0) return 0; // el laboratorio no está en la línea: no recibe auras
    let total = 0;
    const from = (sk, z, key) => {
      const n = s.mice.find((x) => x.post === postKey(sk, z));
      return n ? trait(n, key, sk) : 0;
    };
    if (i > 0) {
      // El tendero es vecino del quesero de cada roca: cuenta el mejor.
      if (skill === 'trading') total += Math.max(0, ...q.openZones(s).map((z) => from('cheesemaking', z.id, 'auraNext')));
      else total += from(CHAIN[i - 1], zone, 'auraNext');
    }
    if (i < CHAIN.length - 1) total += from(CHAIN[i + 1], zone, 'auraPrev');
    return clamp(total, -M.caps.aura, M.caps.aura);
  }

  // Velocidad de un ratón en un oficio. Con `s` y `zone` cuenta también lo que
  // depende de la partida: profundidad, nivel de la habilidad, colonia y auras.
  // `alone`: sin lo que le dan los demás (auras y combinaciones de equipo), para comparar candidatos.
  function speed(m, skill, s, zone, alone) {
    const f = fx(m, skill);
    const power = 1 + M.perLevel * (level(m) - 1) + M.ranks[m.rank].bonus + M.rarities[m.rarity || 0].bonus + affinity(m, skill).speed + (f.rankSpeed || 0) * m.rank;
    let mult = 1 + (f.speed || 0) + (CM.away ? f.awaySpeed || 0 : f.hereSpeed || 0);
    if (s) {
      const depth = s.zones[zone] ? s.zones[zone].depth : 0;
      mult += clamp((f.depthSpeed || 0) * depth, -0.5, M.caps.depth);
      mult += (f.levelSpeed || 0) * Math.floor(q.level(s, skill) / 10);
      mult += (f.crowdSpeed || 0) * Math.min(s.mice.length, M.caps.crowd);
      if (!alone) {
        mult += auraFor(s, skill, zone);
        const te = team(s, skill, zone).eff;
        mult += (te.speed || 0) + (CM.away ? te.awaySpeed || 0 : 0);
      }
    }
    return Math.max(0.2, power * mult);
  }
  // Cantidad por ciclo, sin contar la suerte.
  function yieldMult(m, skill, s, zone, alone) {
    const f = fx(m, skill || '');
    let y = 1 + (f.yield || 0);
    if (s) {
      const depth = s.zones[zone] ? s.zones[zone].depth : 0;
      y += clamp((f.depthYield || 0) * depth, -0.5, M.caps.depthYield);
      y += (f.recipeYield || 0) * Math.min(s.recipes.length, M.caps.recipes);
      if (!alone) y += team(s, skill, zone).eff.yield || 0;
    }
    // La tienda cobra por todas las rocas a la vez: sus bonificaciones de cantidad pueden contar solo en parte.
    if (skill === 'trading' && M.tradeYield !== 1) y = 1 + (y - 1) * M.tradeYield;
    return Math.max(0.2, y);
  }
  const doubleChance = (m, skill, s, zone) => clamp(trait(m, 'double', skill) + (s ? team(s, skill, zone).eff.double || 0 : 0), 0, M.caps.double);

  function pick(s, list) {
    return list[Math.floor(CM.rand(s) * list.length)];
  }
  function candidate(s, taken) {
    const goods = idsOf('good');
    const free = M.names.filter((n) => taken.indexOf(n) < 0);
    const name = pick(s, free.length ? free : M.names);
    taken.push(name);
    const roll = CM.rand(s);
    const rarity = roll < M.rarities[2].chance ? 2 : roll < M.rarities[2].chance + M.rarities[1].chance ? 1 : 0;
    // Un legendario nace con un rasgo legendario y otro bueno, sin manía.
    const first = rarity === 2 ? pick(s, idsOf('legend')) : pick(s, goods);
    const second = rarity === 2 ? pick(s, goods) : pick(s, idsOf('quirk'));
    // Afinidad por cada oficio; al menos uno le gusta.
    const aff = {};
    for (const skill of JOBS) {
      const r = CM.rand(s);
      const lv = r < M.affinity[2].chance ? 2 : r < M.affinity[2].chance + M.affinity[1].chance ? 1 : 0;
      if (lv) aff[skill] = lv;
    }
    if (!Object.keys(aff).length) aff[pick(s, JOBS)] = 1;
    // `look` decide su aspecto (pelaje, gorro, accesorio...): cada ratón es distinto.
    return { name, traits: [first, second], aff, look: Math.floor(CM.rand(s) * 1048576), rarity };
  }

  // Piezas del aspecto de un ratón. Los raros y legendarios tienen pelajes
  // propios; el legendario lleva corona.
  const FUR_NAMES = ['White', 'Grey', 'Brown', 'Cream', 'Charcoal', 'Peach', 'Blue', 'Mint', 'Lilac', 'Golden'];
  const HAT_NAMES = ['Helmet', 'Cap', 'Bobble hat', 'Top hat', 'Bow', 'Crown'];
  const ACC_NAMES = ['', 'Glasses', 'Eye patch', 'Moustache', 'Blush'];
  // Rasgos que se ven en el cuerpo del ratón.
  const MARKS = { nocturnal: 'glow', moonlit: 'glow', lucky: 'clover', midas: 'goldpaws', goldenpaws: 'goldpaws', glutton: 'belly', strong: 'headband', heavyhands: 'headband', dreamer: 'zzz', lazy: 'zzz', kingofmice: 'cape', conductor: 'cape', ancient: 'cape', deepdiver: 'goggles', abyssal: 'goggles' };
  function marksOf(m) {
    const out = {};
    if (Array.isArray(m.traits)) for (const t of traitsOf(m)) if (MARKS[t.id]) out[MARKS[t.id]] = true;
    return Object.keys(out).sort().join(',');
  }
  function parts(m) {
    const n = (m.look || 0) >>> 0;
    const r = m.rarity || 0;
    return {
      marks: marksOf(m), fur: r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7, hat: r === 2 ? 5 : (n >> 3) % 5, hatColor: (n >> 6) % 8, acc: (n >> 9) % 5, pack: (n >> 12) % 5, rarity: r };
  }
  // El álbum: todo lo coleccionable, por categorías. Las combinaciones no
  // enseñan su nombre hasta que se forman.
  const traitItems = (kind, rarity) => idsOf(kind).map((id) => ({ key: 'trait:' + id, name: T[id].name, desc: T[id].desc + (T[id].job ? ' (' + B.skills[T[id].job].name + ')' : ''), rarity: rarity || 0 }));
  const ALBUM = [
    { kind: 'fur', title: 'FURS', items: FUR_NAMES.map((name, i) => ({ key: 'fur:' + i, name, rarity: i === 9 ? 2 : i >= 7 ? 1 : 0 })) },
    { kind: 'hat', title: 'HATS', items: HAT_NAMES.map((name, i) => ({ key: 'hat:' + i, name, rarity: i === 5 ? 2 : 0 })) },
    { kind: 'acc', title: 'ACCESSORIES', items: ACC_NAMES.map((name, i) => ({ key: 'acc:' + i, name, rarity: 0 })).slice(1) },
    { kind: 'trait', title: 'TRAITS', items: traitItems('good') },
    { kind: 'trait', title: 'QUIRKS', items: traitItems('quirk') },
    { kind: 'trait', title: 'JOB TRAITS', items: traitItems('job') },
    { kind: 'trait', title: 'LEGENDARY TRAITS', items: traitItems('legend', 2) },
    { kind: 'combo', title: 'LINE COMBOS', items: M.links.map((c) => ({ key: 'link:' + c.id, name: c.name, desc: [c.a, c.b].map((id) => (id === '*legend' ? 'a legendary mouse' : T[id].name)).join(' next to ') + ': ' + c.desc, rarity: 0 })) },
    { kind: 'combo', title: 'ROCK COMBOS', items: M.sets.map((c) => ({ key: 'set:' + c.id, name: c.name, desc: c.desc, rarity: 0 })) },
    { kind: 'combo', title: 'COMBOS', items: M.combos.map((c) => ({ key: 'combo:' + c.id, name: c.name, desc: c.needs.map((id) => T[id].name).join(' + ') + ': ' + c.desc, rarity: 0 })) },
  ];
  const ALBUM_KEYS = {};
  ALBUM.forEach((cat) => cat.items.forEach((it) => (ALBUM_KEYS[it.key] = it)));
  function albumKeys(m) {
    const p = parts(m);
    return ['fur:' + p.fur, 'hat:' + p.hat]
      .concat(p.acc ? ['acc:' + p.acc] : [], traitsOf(m).map((t) => 'trait:' + t.id), combosOf(m).map((c) => 'combo:' + c.id))
      .filter((k) => ALBUM_KEYS[k]);
  }

  // ---------- Elecciones de rasgo ----------
  // Qué tiene pendiente de elegir: primero los rasgos de nivel, luego los de oficio.
  function pending(m) {
    if (m.picks < Math.min(M.traitSlots, Math.floor(level(m) / M.traitEvery))) return { kind: 'level', skill: '' };
    for (const skill of JOBS) if (!m.spec[skill] && (m.jobs[skill] || 0) >= M.jobGrades[0]) return { kind: 'job', skill };
    return null;
  }
  // Rasgo que desarrolla un ratón por sí solo: nunca una manía. A veces legendario (si aún
  // puede tener uno); si no, uno bueno, que la mitad de las veces sale de lo que ha trabajado.
  function autoTrait(s, m) {
    const have = {};
    traitsOf(m).forEach((t) => (have[t.id] = true));
    const free = (ids) => ids.filter((id) => !have[id]);
    if (CM.rand(s) < M.autoLegendChance && free(idsOf('legend')).length) return pick(s, free(idsOf('legend')));
    const jobs = JOBS.filter((k) => (m.jobs[k] || 0) > 0);
    const total = jobs.reduce((a, k) => a + m.jobs[k], 0);
    if (total > 0 && CM.rand(s) < M.historyWeight) {
      // Un oficio de su historial, con más peso cuanto más lo haya ejercido.
      let r = CM.rand(s) * total;
      const job = jobs.find((k) => (r -= m.jobs[k]) < 0) || jobs[0];
      const themed = free(M.jobPools[job] || []);
      if (themed.length) return pick(s, themed);
    }
    const goods = free(idsOf('good'));
    return goods.length ? pick(s, goods) : null;
  }
  // No hay nada que elegir: lo que toca se resuelve en el acto.
  function grow(s, m) {
    for (let guard = 0; guard < 16; guard++) {
      const p = pending(m);
      if (!p) break;
      let got;
      if (p.kind === 'job') {
        got = pick(s, jobTraits(p.skill));
        m.spec[p.skill] = got;
      } else {
        got = autoTrait(s, m);
        m.picks += 1;
        if (!got) continue;
        m.learned.push(got);
      }
      // Diario de la colonia: lo que van desarrollando, para consultarlo después.
      s.news.unshift({ at: s.clock, name: m.name, id: m.id, trait: got });
      if (s.news.length > 40) s.news.length = 40;
      teamKey = '';
      CM.emit(s, 'traitLearned', { id: m.id, trait: got, auto: true, kind: T[got].kind });
      CM.mice.note(s, m);
    }
    return null;
  }
  CM.mice = {
    postKey,
    level,
    speed,
    yieldMult,
    trait,
    fx,
    normalize,
    traitsOf,
    combosOf,
    gradeOf,
    affinity,
    doubleChance,
    pending,
    CHAIN,
    JOBS,
    jobTraits,
    parts,
    ALBUM,
    albumItem: (key) => ALBUM_KEYS[key] || null,
    albumTotal: Object.keys(ALBUM_KEYS).length,
    albumCount: (s) => Object.keys(s.album).length,
    // Apunta en el álbum las piezas de un ratón reclutado. Devuelve las nuevas.
    record(s, m) {
      const fresh = albumKeys(m).filter((k) => !s.album[k]);
      fresh.forEach((k) => (s.album[k] = true));
      if (fresh.length) CM.rev += 1;
      return fresh;
    },
    // La simulación abre y cierra cada paso: dentro, las combinaciones de equipo no se recalculan.
    beginStep(s) {
      frozen = false;
      team(s, 'trading', 'all');
      frozen = true;
    },
    endStep() {
      frozen = false;
    },
    // Tras cambiar números de rasgos en caliente (simulaciones de balance).
    resetCache() {
      for (const k of Object.keys(fxCache)) delete fxCache[k];
      teamKey = '';
    },
    byId: (s, id) => s.mice.find((m) => m.id === id) || null,
    at(s, skill, zone) {
      if (fit) return fit.at[postKey(skill, zone)] || null;
      const memo = CM.memo;
      if (!memo) return s.mice.find((m) => m.post === postKey(skill, zone)) || null;
      const k = 'a' + skill + '|' + zone;
      const hit = memo.get(k);
      if (hit && hit.rev === CM.rev && hit.n === s.mice.length) return hit.v;
      const v = s.mice.find((m) => m.post === postKey(skill, zone)) || null;
      memo.set(k, { rev: CM.rev, n: s.mice.length, v });
      return v;
    },
    // Progreso dentro del nivel actual.
    xpProgress(m) {
      const lv = level(m);
      if (lv >= M.maxLevel) return { level: lv, cur: 1, need: 1, maxed: true };
      const from = xpFor(lv);
      return { level: lv, cur: Math.floor(m.xp - from), need: Math.ceil(xpFor(lv + 1) - from), maxed: false };
    },
    // Puestos que existen ahora, en orden de prioridad para colocar ratones:
    // la tienda, después taladro, refinado y cocinado de cada roca (la más
    // valiosa primero), el laboratorio y por último la minería.
    posts(s) {
      const out = [];
      const zones = q.openZones(s).slice().reverse();
      if (s.built.shop) out.push({ skill: 'trading', zone: 'all' });
      for (const z of zones) for (const skill of ['drilling', 'refining', 'cheesemaking']) if (s.built[B.skills[skill].station]) out.push({ skill, zone: z.id });
      if (s.built.lab && CM.tree.rank(s, 'lab', 'assistant')) out.push({ skill: 'research', zone: 'all' });
      for (const z of zones) out.push({ skill: 'mining', zone: z.id });
      return out.map((p) => Object.assign(p, { key: postKey(p.skill, p.zone) }));
    },
    postLabel(key) {
      const [skill, zone] = key.split(':');
      return B.skills[skill].name + (zone === 'all' ? '' : ' · ' + B.bases[q.zoneDef(zone).base].name);
    },
    // Lo que rinde un ratón en un oficio (para comparar puestos).
    // BEST FIT solo mira al ratón por separado: ni auras ni sinergias de plantilla.
    score: (m, skill) => speed(m, skill) * yieldMult(m, skill) * (1 + doubleChance(m, skill)),
    // Lo que rendiría en un puesto concreto por sí solo: cuenta su roca, la habilidad y la colonia,
    // pero no a sus vecinos ni las combinaciones de equipo. Sirve para comparar candidatos sin
    // prometer lo que depende de con quién acabe trabajando.
    solo: (m, skill, s, zone) => speed(m, skill, s, zone, true) * yieldMult(m, skill, s, zone, true) * (1 + doubleChance(m, skill)),
    // Lo que rinde ahora mismo en su puesto, con todo.
    here(s, m) {
      if (!m.post) return 0;
      const [skill, zone] = m.post.split(':');
      return speed(m, skill, s, zone) * yieldMult(m, skill, s, zone) * (1 + doubleChance(m, skill, s, zone));
    },

    // --- Usado por la producción ---
    // Ratón de un puesto con sus multiplicadores, o null si está vacío.
    work(s, skill, zone) {
      const memo = CM.memo;
      if (memo) {
        const k = 'w' + skill + '|' + zone;
        const hit = memo.get(k);
        if (hit && hit.rev === CM.rev) return hit.v;
        const v = this.workNow(s, skill, zone);
        memo.set(k, { rev: CM.rev, v });
        return v;
      }
      return this.workNow(s, skill, zone);
    },
    workNow(s, skill, zone) {
      const m = this.at(s, skill, zone);
      // Un refuerzo en el puesto multiplica su velocidad, trabaje quien trabaje en él (en la
      // refinería no: ahí da más Base, y eso se aplica al planear la hornada).
      return m ? { m, skill, speed: speed(m, skill, s, zone) * CM.boosts.mult(s, skill, zone), yield: yieldMult(m, skill, s, zone), double: doubleChance(m, skill, s, zone) } : null;
    },
    // Cantidad de un ciclo concreto: con suerte, sale doble.
    out(s, w) {
      const chance = w.double === undefined ? doubleChance(w.m, w.skill) : w.double;
      return w.yield * (chance > 0 && CM.rand(s) < chance ? 2 : 1);
    },
    // Tras completar una acción: experiencia para el ratón. Devuelve el
    // multiplicador de experiencia de la habilidad (rasgo Estudioso).
    reward(s, skill, zone, amount) {
      const m = this.at(s, skill, zone);
      if (!m) return 1;
      const n = amount || M.xpPerAction;
      this.addXp(s, m, n * Math.max(0.1, 1 + trait(m, 'mouseXp', skill)));
      // Cada trabajo le acerca a su rasgo de oficio; la afinidad lo acelera.
      const grade = gradeOf(m, skill);
      const title = m.id === s.master && skill === 'cheesemaking' ? CM.milestones.masterGrade(m) : -1;
      m.jobs[skill] = (m.jobs[skill] || 0) + n * affinity(m, skill).learn * Math.max(0.1, 1 + trait(m, 'jobXp', skill));
      // El Grand Master sube de grado cocinando: su queso vale más desde ese momento.
      if (title >= 0 && CM.milestones.masterGrade(m) > title) CM.emit(s, 'masterUp', { id: m.id, grade: CM.milestones.masterGrade(m) });
      if (gradeOf(m, skill) > grade) {
        CM.emit(s, 'specUp', { id: m.id, skill, grade: gradeOf(m, skill) });
        this.note(s, m);
      }
      if (pending(m)) grow(s, m);
      return Math.max(0.1, 1 + trait(m, 'skillXp', skill));
    },
    addXp(s, m, amount) {
      const before = level(m);
      m.xp += amount;
      const after = level(m);
      if (after > before) CM.emit(s, 'mouseLevel', { id: m.id, level: after });
    },

    // --- Reclutar ---
    // El precio sube con cada ratón reclutado en toda la partida, no con los que tienes:
    // despedir no lo abarata. Cubrir los puestos es barato; buscar al ratón perfecto, no.
    recruited: (s) => Math.max(s.totals.miceRecruited, s.mice.length),
    recruitCost: (s) => Math.round(M.recruitCost * Math.pow(M.recruitGrowth, CM.mice.recruited(s))),
    // Paga y presenta tres candidatos. Se guardan en la partida: recargar no los cambia.
    offer(s) {
      if (!s.built.house) return CM.fail('no-house');
      if (s.candidates.length) return CM.ok();
      const cost = this.recruitCost(s);
      if (s.coins < cost) return CM.fail('no-coins');
      s.coins -= cost;
      s.totals.coinsSpent += cost;
      const taken = s.mice.map((m) => m.name);
      s.candidates = [];
      for (let i = 0; i < M.candidates; i++) s.candidates.push(candidate(s, taken));
      CM.emit(s, 'purchase', { what: 'recruit', cost });
      CM.emit(s, 'candidates');
      return CM.ok();
    },
    choose(s, index) {
      const c = s.candidates[index];
      if (!c) return CM.fail('invalid');
      const m = normalize({ id: 'm' + s.nextId++, name: c.name, traits: c.traits.slice(), aff: Object.assign({}, c.aff), look: c.look || 0, rarity: c.rarity || 0, xp: 0, rank: 0, post: '', rest: false });
      s.mice.push(m);
      this.note(s, m);
      s.candidates = [];
      s.totals.miceRecruited += 1;
      this.autoPlace(s, m);
      CM.emit(s, 'recruited', { id: m.id });
      return CM.ok({ id: m.id });
    },

    // --- Rasgos: elegir, casilla misteriosa y volver a tirar ---
    // Apunta en el álbum lo nuevo de un ratón (rasgos, combinaciones) y lo avisa.
    note(s, m) {
      const found = this.record(s, m);
      const combos = found.filter((k) => k.indexOf('combo:') === 0);
      if (combos.length) CM.emit(s, 'combo', { id: m.id, combos: combos.map((k) => k.slice(6)) });
      if (found.length) CM.emit(s, 'album', { keys: found });
      return found;
    },
    // Lo que le toque desarrollar a un ratón (rasgo de nivel o especialidad) llega solo.
    choice: (s, m) => grow(s, m),
    grow,

    // ---------- MOUSE HOUSE: la cama ----------
    // Una sola cama. Trata una manía o reentrena una especialidad mientras el ratón sigue
    // en su puesto: lo que cuesta es la inversión y la espera, no parar la producción.
    careCost: (s, kind) => Math.round((kind === 'spec' ? M.care.retrainCost : M.care.treatCost) * Math.pow(M.care.growth, kind === 'spec' ? s.totals.retrains : s.totals.treatments)),
    // `what`: la manía que se trata o el oficio que se reentrena; `to`: la especialidad nueva.
    careStart(s, id, kind, what, to) {
      const m = this.byId(s, id);
      if (!m || !s.built.house) return CM.fail('invalid');
      if (s.care) return CM.fail('bed-busy');
      if (kind === 'quirk') {
        if (!T[what] || T[what].kind !== 'quirk' || m.traits.concat(m.learned).indexOf(what) < 0) return CM.fail('invalid');
      } else if (kind === 'spec') {
        if (!m.spec[what] || jobTraits(what).indexOf(to) < 0 || m.spec[what] === to) return CM.fail('invalid');
      } else return CM.fail('invalid');
      const cost = this.careCost(s, kind);
      if (s.coins < cost) return CM.fail('no-coins');
      s.coins -= cost;
      s.totals.coinsSpent += cost;
      if (kind === 'spec') s.totals.retrains += 1;
      else s.totals.treatments += 1;
      s.care = { id: m.id, kind, what, to: to || '', remaining: M.care.ms, total: M.care.ms };
      CM.emit(s, 'purchase', { what: 'care', cost });
      CM.emit(s, 'careStart', { id: m.id, kind, what });
      return CM.ok();
    },
    careTick(s, dt) {
      const c = s.care;
      if (!c) return;
      const m = this.byId(s, c.id);
      if (!m) return void (s.care = null);
      c.remaining -= dt;
      if (c.remaining > 0) return;
      s.care = null;
      if (c.kind === 'quirk') {
        m.traits = m.traits.filter((t) => t !== c.what);
        m.learned = m.learned.filter((t) => t !== c.what);
      } else m.spec[c.what] = c.to;
      teamKey = '';
      CM.emit(s, 'careDone', { id: m.id, kind: c.kind, what: c.what, to: c.to });
      this.note(s, m);
    },
    hasTrait,
    team,
    // Los ratones que son vecinos de un puesto (los que cuentan para las combinaciones de línea).
    neighboursOf: (s, skill, zone) => neighbours(s, skill, zone).filter(Boolean),
    // Para dibujar la plantilla: combinaciones activas entre dos puestos y en una roca.
    linksAt: (s, skillA, zoneA, skillB, zoneB) => linksBetween(mouseAt(s, skillA, zoneA), mouseAt(s, skillB, zoneB)),
    setsAt: (s, zone) => setsOf(s, zone),
    // Apunta en el álbum las combinaciones de vecinos y de roca que estén activas.
    scan(s) {
      // Solo hay algo nuevo que apuntar si la plantilla ha cambiado desde la última vez.
      const sig = teamSig(s) + '|' + s.totals.zonesUnlocked + '|' + Object.keys(s.built).filter((k) => s.built[k]).length + '|' + (s.nodes['lab.assistant'] || 0);
      if (sig === scanSig && s === scanState) return;
      scanSig = sig;
      scanState = s;
      for (const p of this.posts(s)) {
        const t = team(s, p.skill, p.zone);
        for (const c of t.links.map((l) => ['link:', l]).concat(t.sets.map((d) => ['set:', d]))) {
          const key = c[0] + c[1].id;
          if (s.album[key]) continue;
          s.album[key] = true;
          CM.emit(s, 'teamCombo', { name: c[1].name, desc: c[1].desc, rock: c[0] === 'set:' });
          CM.emit(s, 'album', { keys: [key] });
        }
      }
    },
    // Legendario de nacimiento o con algún rasgo legendario: se le nota.
    isLegend: (m) => m.rarity === 2 || traitsOf(m).some((t) => T[t.id].kind === 'legend'),

    // --- Colocar ---
    freePost: (s) => CM.mice.posts(s).find((p) => !s.mice.some((x) => x.post === p.key)) || null,
    // Modo sin pensar: un ratón sin puesto va solo al primer puesto libre.
    autoPlace(s, m) {
      const free = this.freePost(s);
      if (free) m.post = free.key;
      teamKey = '';
      CM.rev += 1;
      return !!free;
    },
    // Coloca a los que esperan en la casa (salvo a los que el jugador mandó descansar).
    fillEmpty(s) {
      for (const m of s.mice) {
        if (m.post || m.rest) continue;
        if (!this.autoPlace(s, m)) break;
        CM.emit(s, 'assigned', { id: m.id, auto: true });
      }
    },
    // Mueve un ratón a un puesto (o a la casa con key vacío). Si el puesto
    // está ocupado, se intercambian.
    assign(s, id, key) {
      const m = this.byId(s, id);
      if (!m) return CM.fail('invalid');
      if (key && !this.posts(s).some((p) => p.key === key)) return CM.fail('invalid');
      const other = key ? s.mice.find((x) => x.post === key && x !== m) : null;
      if (other) other.post = m.post;
      m.post = key || '';
      m.rest = !key;
      CM.emit(s, 'assigned', { id: m.id });
      this.scan(s);
      return CM.ok();
    },
    // --- BEST FIT ---
    // Con puestos sin cubrir (el principio de la partida): cada puesto, por prioridad, se lleva
    // al mejor que quede. Lo que se hace a mano no se puede estimar, así que manda el orden.
    bestFitGreedy(s) {
      const pool = s.mice.slice();
      const plan = {};
      for (const p of this.posts(s)) {
        if (!pool.length) break;
        let best = 0;
        for (let i = 1; i < pool.length; i++) if (this.score(pool[i], p.skill) > this.score(pool[best], p.skill)) best = i;
        plan[pool.splice(best, 1)[0].id] = p.key;
      }
      return plan;
    },
    // Monedas por segundo que daría la colonia con la plantilla tal como está: lo que cada roca
    // puede sacar (su etapa más lenta, con equipos, auras y refuerzos) al precio de su queso, y
    // la tienda vendiendo primero lo más caro hasta donde llegue. No mira las reservas: es una
    // estimación para comparar plantillas, no una predicción.
    estimate(s) {
      return fitIncome(s, q.openZones(s).map((def) => fitLine(s, def)));
    },
    // Con todos los puestos cubiertos, BEST FIT busca ingresos de la colonia, no al ratón más
    // fuerte de cada puesto: parte de la plantilla actual (y de la de prioridades) y va haciendo
    // los intercambios que más suben la estimación, mientras alguno la suba más de un 1 %. Así
    // cuenta lo que vale cada roca, qué etapa la frena y a quién deja peor atendido. Juzga a cada
    // ratón por separado (no busca combinaciones: son cosa del jugador), pero no hace un cambio
    // que rompa equipos o combinaciones que valían más de lo que gana. Nunca propone una
    // plantilla que estime peor que la que hay. El investigador se queda donde esté.
    bestFitPlan(s) {
      const posts = this.posts(s);
      const staffed = posts.every((p) => s.mice.some((m) => m.post === p.key));
      if (!staffed) return this.bestFitGreedy(s);
      const key = fitKey(s);
      if (fitCache.s === s && fitCache.key === key) return fitCache.plan;
      const plan = fitSearch(s);
      fitCache = { s, key, plan, moves: s.mice.filter((m) => (plan[m.id] || '') !== m.post).length };
      return plan;
    },
    // Lo que BEST FIT ya sabe sin volver a buscar: cuántos movería, o -1 si no lo ha mirado
    // desde el último cambio. La búsqueda cuesta unas décimas de segundo, así que solo se
    // hace al tocar el botón, nunca al pintar el panel.
    bestFitKnown(s) {
      const posts = this.posts(s);
      if (!posts.every((p) => s.mice.some((m) => m.post === p.key))) return this.bestFitMoves(s);
      return fitCache.s === s && fitCache.key === fitKey(s) ? fitCache.moves : -1;
    },
    // Cuántos ratones cambiarían de sitio con BEST FIT (0: ya están bien).
    bestFitMoves(s) {
      const plan = this.bestFitPlan(s);
      return s.mice.filter((m) => (plan[m.id] || '') !== m.post).length;
    },
    // Aplica el plan. Devuelve cuántos ratones movió y cuánto cambia la estimación de ingresos.
    bestFit(s) {
      const plan = this.bestFitPlan(s);
      const moved = s.mice.filter((m) => (plan[m.id] || '') !== m.post).length;
      const before = moved ? this.estimate(s) : 0;
      for (const m of s.mice) {
        m.post = plan[m.id] || '';
        m.rest = false;
      }
      teamKey = '';
      CM.rev += 1;
      // Recién aplicado, volver a buscar no movería a nadie: el botón ya puede decir DONE.
      if (fitCache.s === s) fitCache = { s, key: fitKey(s), plan, moves: 0 };
      CM.emit(s, 'assigned', { all: true });
      this.scan(s);
      return CM.ok({ moved, gain: before > 0 ? this.estimate(s) / before : 1 });
    },

    // --- Despedir ---
    // El ratón se va para siempre: se pierden su nivel y su rango y no se
    // devuelve nada. Su puesto lo ocupa el primero que esté esperando.
    dismiss(s, id) {
      const i = s.mice.findIndex((m) => m.id === id);
      if (i < 0) return CM.fail('invalid');
      // El precio de reclutar no baja: cuenta a todos los que han pasado por la colonia.
      s.totals.miceRecruited = Math.max(s.totals.miceRecruited, s.mice.length);
      const m = s.mice.splice(i, 1)[0];
      if (s.care && s.care.id === m.id) s.care = null; // la cama queda libre
      if (s.master === m.id) s.master = ''; // el título queda libre
      CM.emit(s, 'dismissed', { name: m.name, post: m.post });
      this.fillEmpty(s);
      return CM.ok();
    },

    // --- Ascender ---
    promoteInfo(s, m) {
      const next = M.ranks[m.rank + 1];
      if (!next) return { maxed: true, why: 'top' };
      const levelOk = level(m) >= next.level;
      const can = levelOk && s.coins >= next.cost;
      // `why` dice qué falta: 'level', 'coins' o nada ('ok').
      return { next, levelOk, cost: next.cost, can, why: can ? 'ok' : levelOk ? 'coins' : 'level', levelsLeft: Math.max(0, next.level - level(m)) };
    },
    promote(s, id) {
      const m = this.byId(s, id);
      if (!m) return CM.fail('invalid');
      const info = this.promoteInfo(s, m);
      if (info.maxed) return CM.fail('max-level');
      if (!info.levelOk) return CM.fail('mouse-level');
      if (s.coins < info.cost) return CM.fail('no-coins');
      s.coins -= info.cost;
      s.totals.coinsSpent += info.cost;
      m.rank += 1;
      CM.emit(s, 'purchase', { what: 'promote', cost: info.cost });
      CM.emit(s, 'promoted', { id: m.id, rank: m.rank });
      return CM.ok();
    },
    // Rangos que el nivel de un ratón ya permite, uno tras otro: lo que cuesta cada paso y
    // lo que cuesta llegar hasta él desde donde está.
    promoteSteps(s, m) {
      const out = [];
      let total = 0;
      for (let r = m.rank + 1; r < M.ranks.length && level(m) >= M.ranks[r].level; r++) {
        total += M.ranks[r].cost;
        out.push({ rank: r, name: M.ranks[r].name, cost: M.ranks[r].cost, total });
      }
      return out;
    },
    // Una selección de ascensos, { id: rango de destino }. 'all': todos hasta donde su nivel
    // permite. 'afford': los pasos más baratos primero, mientras alcancen las monedas.
    promotePicks(s, mode) {
      const picks = {};
      const steps = [];
      for (const m of s.mice) for (const st of this.promoteSteps(s, m)) steps.push({ id: m.id, rank: st.rank, cost: st.cost });
      if (mode === 'afford') steps.sort((a, b) => a.cost - b.cost || a.rank - b.rank);
      let left = s.coins;
      for (const st of steps) {
        if (mode === 'afford') {
          if (st.cost > left) break;
          left -= st.cost;
        }
        picks[st.id] = Math.max(picks[st.id] || 0, st.rank);
      }
      return picks;
    },
    // Lo que cuesta una selección, contando solo los pasos que siguen siendo válidos.
    promoteCost(s, picks) {
      const out = { mice: 0, steps: 0, cost: 0 };
      for (const m of s.mice) {
        const to = picks[m.id];
        if (!to) continue;
        const steps = this.promoteSteps(s, m).filter((st) => st.rank <= to);
        if (!steps.length) continue;
        out.mice += 1;
        out.steps += steps.length;
        out.cost += steps[steps.length - 1].total;
      }
      return out;
    },
    // Varios ascensos de una vez. Cada paso es un ascenso normal, con su requisito y su coste;
    // si el total no alcanza no se cobra nada, para que nunca se quede a medias.
    promoteMany(s, picks) {
      const plan = this.promoteCost(s, picks);
      if (!plan.steps) return CM.fail('invalid');
      if (s.coins < plan.cost) return CM.fail('no-coins');
      const out = { mice: 0, steps: 0, cost: 0, managers: 0 };
      for (const m of s.mice) {
        const to = picks[m.id];
        if (!to) continue;
        let did = 0;
        while (m.rank < to && this.promote(s, m.id).ok) {
          did += 1;
          out.cost += M.ranks[m.rank].cost;
          if (M.ranks[m.rank].manager) out.managers += 1;
        }
        out.steps += did;
        if (did) out.mice += 1;
      }
      return CM.ok(out);
    },
    // Los gerentes compran la mejora más barata de su oficio, si el jugador lo permite.
    managersTick(s) {
      if (!s.settings.managersBuy) return;
      for (const m of s.mice) {
        if (!m.post || !M.ranks[m.rank].manager) continue;
        const skill = m.post.split(':')[0];
        let best = null;
        for (const node of B.trees[skill] || []) {
          if (node.unlock) continue; // los hitos y lo que abre funciones los compra el jugador
          const info = CM.tree.info(s, skill, node.id);
          if (info.canBuy && (!best || info.cost < best.cost)) best = { id: node.id, cost: info.cost };
        }
        // Solo gasta calderilla: nunca más de una parte pequeña de lo que tienes ahorrado.
        if (best && best.cost <= s.coins * M.managerBudget) CM.tree.buy(s, skill, best.id);
      }
    },
  };
})();
