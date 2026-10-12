// RATONES: la plantilla. Cada ratón es un personaje con nombre, un rasgo
// bueno, una manía, un oficio favorito, nivel propio y rango.
// Una etapa de una línea está automatizada si tiene un ratón en su puesto.
// Un ratón solo se va si el jugador lo despide; el que no trabaja espera en la Mouse House.
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const M = B.mice;

  const postKey = (skill, zone) => skill + ':' + (skill === 'trading' ? 'all' : zone);
  const xpFor = (level) => (M.xpBase * (Math.pow(M.xpGrowth, level - 1) - 1)) / (M.xpGrowth - 1);
  function level(m) {
    const raw = Math.floor(Math.log((m.xp * (M.xpGrowth - 1)) / M.xpBase + 1) / Math.log(M.xpGrowth) + 1e-9) + 1;
    return Math.max(1, Math.min(M.maxLevel, raw));
  }
  const T = M.traits;
  const CHAIN = ['mining', 'drilling', 'refining', 'cheesemaking', 'trading'];
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
    if (!(m.rerolls >= 0)) m.rerolls = 0;
    if (m.offer === undefined) m.offer = null; // elección pendiente: { kind, skill, options }
    if (!(m.rarity >= 0)) m.rarity = 0;
    return m;
  }

  // Grado (0-3) del rasgo de oficio de un ratón en una habilidad.
  const gradeOf = (m, skill) => (m.spec && m.spec[skill] ? M.jobGrades.filter((n) => ((m.jobs && m.jobs[skill]) || 0) >= n).length : 0);
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
  function fx(m, skill) {
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
  const mouseAt = (s, skill, zone) => s.mice.find((x) => x.post === postKey(skill, zone)) || null;
  const linksBetween = (x, y) => (x && y ? M.links.filter((l) => (hasTrait(x, l.a) && hasTrait(y, l.b)) || (hasTrait(x, l.b) && hasTrait(y, l.a))) : []);
  // Vecinos de un puesto: el anterior y el siguiente de su línea. El tendero
  // es vecino del quesero de cada roca.
  function neighbours(s, skill, zone) {
    const i = CHAIN.indexOf(skill);
    if (skill === 'trading') return q.openZones(s).map((z) => mouseAt(s, 'cheesemaking', z.id));
    return [i > 0 ? mouseAt(s, CHAIN[i - 1], zone) : null, mouseAt(s, CHAIN[i + 1], zone)];
  }
  function setsOf(s, zone) {
    const line = CHAIN.slice(0, 4).map((skill) => {
      const m = mouseAt(s, skill, zone);
      return m && { m, aff: (m.aff && m.aff[skill]) || 0, spec: !!m.spec[skill], fur: parts(m).fur, legend: hasTrait(m, '*legend'), night: trait(m, 'awaySpeed', skill) > 0 };
    });
    return line.every(Boolean) ? M.sets.filter((d) => d.test(line)) : [];
  }
  // Lo que un puesto recibe de las combinaciones de vecinos y de roca. Se
  // recalcula solo cuando cambia la plantilla.
  let teamKey = '';
  let teamMap = {};
  function team(s, skill, zone) {
    const key = s.mice.map((m) => m.id + m.post + m.rank + m.learned.length + Object.keys(m.spec).join('')).join('|');
    if (key !== teamKey) {
      teamKey = key;
      teamMap = {};
    }
    const pk = postKey(skill, zone);
    if (teamMap[pk]) return teamMap[pk];
    const out = { eff: {}, links: [], sets: [] };
    const me = mouseAt(s, skill, zone);
    if (me) {
      for (const n of neighbours(s, skill, zone)) for (const l of linksBetween(me, n)) if (out.links.indexOf(l) < 0) out.links.push(l);
      if (skill !== 'trading') out.sets = setsOf(s, zone);
      for (const c of out.links.concat(out.sets)) for (const k of Object.keys(c.eff)) out.eff[k] = (out.eff[k] || 0) + c.eff[k];
    }
    return (teamMap[pk] = out);
  }
  const affinity = (m, skill) => M.affinity[(m.aff && m.aff[skill]) || 0] || M.affinity[0];

  // Lo que le dan sus vecinos de línea (auras). Con `s` y `zone`.
  function auraFor(s, skill, zone) {
    const i = CHAIN.indexOf(skill);
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
  function speed(m, skill, s, zone) {
    const f = fx(m, skill);
    const power = 1 + M.perLevel * (level(m) - 1) + M.ranks[m.rank].bonus + M.rarities[m.rarity || 0].bonus + affinity(m, skill).speed + (f.rankSpeed || 0) * m.rank;
    let mult = 1 + (f.speed || 0) + (CM.away ? f.awaySpeed || 0 : f.hereSpeed || 0);
    if (s) {
      const depth = s.zones[zone] ? s.zones[zone].depth : 0;
      mult += clamp((f.depthSpeed || 0) * depth, -0.5, M.caps.depth);
      mult += (f.levelSpeed || 0) * Math.floor(q.level(s, skill) / 10);
      mult += (f.crowdSpeed || 0) * Math.min(s.mice.length, M.caps.crowd);
      mult += auraFor(s, skill, zone);
      const te = team(s, skill, zone).eff;
      mult += (te.speed || 0) + (CM.away ? te.awaySpeed || 0 : 0);
    }
    return Math.max(0.2, power * mult);
  }
  // Cantidad por ciclo, sin contar la suerte.
  function yieldMult(m, skill, s, zone) {
    const f = fx(m, skill || '');
    let y = 1 + (f.yield || 0);
    if (s) {
      const depth = s.zones[zone] ? s.zones[zone].depth : 0;
      y += clamp((f.depthYield || 0) * depth, -0.5, M.caps.depth * 3);
      y += (f.recipeYield || 0) * Math.min(s.recipes.length, M.caps.recipes);
      y += team(s, skill, zone).eff.yield || 0;
    }
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
    for (const skill of CM.skills.list) {
      const r = CM.rand(s);
      const lv = r < M.affinity[2].chance ? 2 : r < M.affinity[2].chance + M.affinity[1].chance ? 1 : 0;
      if (lv) aff[skill] = lv;
    }
    if (!Object.keys(aff).length) aff[pick(s, CM.skills.list)] = 1;
    // `look` decide su aspecto (pelaje, gorro, accesorio...): cada ratón es distinto.
    return { name, traits: [first, second], aff, look: Math.floor(CM.rand(s) * 1048576), rarity };
  }

  // Piezas del aspecto de un ratón. Los raros y legendarios tienen pelajes
  // propios; el legendario lleva corona.
  const FUR_NAMES = ['White', 'Grey', 'Brown', 'Cream', 'Charcoal', 'Peach', 'Blue', 'Mint', 'Lilac', 'Golden'];
  const HAT_NAMES = ['Helmet', 'Cap', 'Bobble hat', 'Top hat', 'Bow', 'Crown'];
  const ACC_NAMES = ['', 'Glasses', 'Eye patch', 'Moustache', 'Blush'];
  // Rasgos que se ven en el cuerpo del ratón.
  const MARKS = { nocturnal: 'glow', moonlit: 'glow', lucky: 'clover', midas: 'goldpaws', goldenpaws: 'goldpaws', glutton: 'belly', strong: 'headband', heavyhands: 'headband', dreamer: 'zzz', lazy: 'zzz', fast: 'bolt', wired: 'bolt', timeskipper: 'bolt', kingofmice: 'cape', conductor: 'cape', ancient: 'cape', deepdiver: 'goggles', abyssal: 'goggles' };
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
    for (const skill of CHAIN) if (!m.spec[skill] && (m.jobs[skill] || 0) >= M.jobGrades[0]) return { kind: 'job', skill };
    return null;
  }
  function drawOptions(s, m, kind, skill, reroll) {
    const have = {};
    traitsOf(m).forEach((t) => (have[t.id] = true));
    const out = [];
    const takeFrom = (pool) => {
      const left = pool.filter((id) => !have[id] && out.indexOf(id) < 0);
      if (left.length) out.push(pick(s, left));
    };
    for (let i = 0; i < 3; i++) {
      if (kind === 'job') takeFrom(jobTraits(skill));
      else if (CM.rand(s) < (reroll ? M.rerollLegendChance : M.legendChance)) takeFrom(idsOf('legend'));
      else takeFrom(idsOf('good'));
    }
    return out;
  }
  // Prepara (una sola vez) las opciones de la elección pendiente. Se guardan
  // en el ratón: recargar no las cambia.
  function prepare(s, m) {
    const p = pending(m);
    if (!p) {
      m.offer = null;
      return null;
    }
    if (m.offer && m.offer.kind === p.kind && m.offer.skill === p.skill && m.offer.options.length) return m.offer;
    m.offer = { kind: p.kind, skill: p.skill, options: drawOptions(s, m, p.kind, p.skill) };
    m.rerolls = 0;
    CM.emit(s, 'traitReady', { id: m.id, kind: p.kind, legend: m.offer.options.some((id) => T[id].kind === 'legend') });
    return m.offer;
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
      return fresh;
    },
    byId: (s, id) => s.mice.find((m) => m.id === id) || null,
    at: (s, skill, zone) => s.mice.find((m) => m.post === postKey(skill, zone)) || null,
    // Progreso dentro del nivel actual.
    xpProgress(m) {
      const lv = level(m);
      if (lv >= M.maxLevel) return { level: lv, cur: 1, need: 1, maxed: true };
      const from = xpFor(lv);
      return { level: lv, cur: Math.floor(m.xp - from), need: Math.ceil(xpFor(lv + 1) - from), maxed: false };
    },
    // Puestos que existen ahora, en orden de prioridad para colocar ratones:
    // la tienda, después taladro, refinado y cocinado de cada roca (la más
    // valiosa primero) y por último la minería.
    posts(s) {
      const out = [];
      const zones = q.openZones(s).slice().reverse();
      if (s.built.shop) out.push({ skill: 'trading', zone: 'all' });
      for (const z of zones) for (const skill of ['drilling', 'refining', 'cheesemaking']) if (s.built[B.skills[skill].station]) out.push({ skill, zone: z.id });
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

    // --- Usado por la producción ---
    // Ratón de un puesto con sus multiplicadores, o null si está vacío.
    work(s, skill, zone) {
      const m = this.at(s, skill, zone);
      return m ? { m, skill, speed: speed(m, skill, s, zone), yield: yieldMult(m, skill, s, zone), double: doubleChance(m, skill, s, zone) } : null;
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
      m.jobs[skill] = (m.jobs[skill] || 0) + n * affinity(m, skill).learn * Math.max(0.1, 1 + trait(m, 'jobXp', skill));
      if (gradeOf(m, skill) > grade) {
        CM.emit(s, 'specUp', { id: m.id, skill, grade: gradeOf(m, skill) });
        this.note(s, m);
      }
      if (!m.offer && pending(m)) prepare(s, m);
      return Math.max(0.1, 1 + trait(m, 'skillXp', skill));
    },
    addXp(s, m, amount) {
      const before = level(m);
      m.xp += amount;
      const after = level(m);
      if (after > before) CM.emit(s, 'mouseLevel', { id: m.id, level: after });
    },

    // --- Reclutar ---
    recruitCost: (s) => Math.round(M.recruitCost * Math.pow(M.recruitGrowth, s.mice.length)),
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
    choice: (s, m) => prepare(s, m),
    rerollCost(m) {
      if (!m.offer) return 0;
      const base = m.offer.kind === 'job' ? M.jobRerollCost : M.rerollCost * Math.pow(M.rerollSlotGrowth, m.picks);
      return Math.round(base * Math.pow(M.rerollGrowth, m.rerolls));
    },
    reroll(s, id) {
      const m = this.byId(s, id);
      if (!m || !m.offer) return CM.fail('invalid');
      const cost = this.rerollCost(m);
      if (s.coins < cost) return CM.fail('no-coins');
      s.coins -= cost;
      s.totals.coinsSpent += cost;
      m.offer.options = drawOptions(s, m, m.offer.kind, m.offer.skill, true);
      m.rerolls += 1;
      CM.emit(s, 'purchase', { what: 'reroll', cost });
      if (m.offer.options.some((id) => T[id].kind === 'legend')) CM.emit(s, 'legendOffer', { id: m.id });
      return CM.ok();
    },
    // `index` es una de las opciones, o 'mystery' (solo en rasgos de nivel):
    // un rasgo cualquiera, con más probabilidad de legendario... o una manía.
    pickTrait(s, id, index) {
      const m = this.byId(s, id);
      if (!m || !m.offer) return CM.fail('invalid');
      const offer = m.offer;
      let got;
      const mystery = index === 'mystery';
      if (mystery) {
        if (offer.kind !== 'level') return CM.fail('invalid');
        const have = {};
        traitsOf(m).forEach((t) => (have[t.id] = true));
        const free = (kind) => idsOf(kind).filter((k) => !have[k]);
        const r = CM.rand(s);
        const pool = r < M.mystery.legend && free('legend').length ? free('legend') : r < M.mystery.legend + M.mystery.quirk && free('quirk').length ? free('quirk') : free('good');
        got = pick(s, pool);
      } else got = offer.options[Number(index)];
      if (!T[got]) return CM.fail('invalid');
      if (offer.kind === 'job') m.spec[offer.skill] = got;
      else {
        m.learned.push(got);
        m.picks += 1;
      }
      m.offer = null;
      m.rerolls = 0;
      CM.emit(s, 'traitLearned', { id: m.id, trait: got, mystery, kind: T[got].kind });
      this.note(s, m);
      prepare(s, m);
      return CM.ok({ trait: got });
    },
    // Ratones con una elección pendiente.
    choosing: (s) => s.mice.filter((m) => m.offer),
    hasTrait,
    team,
    // Para dibujar la plantilla: combinaciones activas entre dos puestos y en una roca.
    linksAt: (s, skillA, zoneA, skillB, zoneB) => linksBetween(mouseAt(s, skillA, zoneA), mouseAt(s, skillB, zoneB)),
    setsAt: (s, zone) => setsOf(s, zone),
    // Apunta en el álbum las combinaciones de vecinos y de roca que estén activas.
    scan(s) {
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
    // Recoloca a toda la plantilla: cada puesto, por prioridad, se lleva al mejor que quede.
    bestFitPlan(s) {
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
    // Cuántos ratones cambiarían de sitio con BEST FIT (0: ya están bien).
    bestFitMoves(s) {
      const plan = this.bestFitPlan(s);
      return s.mice.filter((m) => (plan[m.id] || '') !== m.post).length;
    },
    bestFit(s) {
      const plan = this.bestFitPlan(s);
      for (const m of s.mice) {
        m.post = plan[m.id] || '';
        m.rest = false;
      }
      CM.emit(s, 'assigned', { all: true });
      this.scan(s);
      return CM.ok();
    },

    // --- Despedir ---
    // El ratón se va para siempre: se pierden su nivel y su rango y no se
    // devuelve nada. Su puesto lo ocupa el primero que esté esperando.
    dismiss(s, id) {
      const i = s.mice.findIndex((m) => m.id === id);
      if (i < 0) return CM.fail('invalid');
      const m = s.mice.splice(i, 1)[0];
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
    // Los gerentes compran la mejora más barata de su oficio, si el jugador lo permite.
    managersTick(s) {
      if (!s.settings.managersBuy) return;
      for (const m of s.mice) {
        if (!m.post || !M.ranks[m.rank].manager) continue;
        const skill = m.post.split(':')[0];
        let best = null;
        for (const node of B.trees[skill]) {
          const info = CM.tree.info(s, skill, node.id);
          if (info.canBuy && (!best || info.cost < best.cost)) best = { id: node.id, cost: info.cost };
        }
        if (best) CM.tree.buy(s, skill, best.id);
      }
    },
  };
})();
