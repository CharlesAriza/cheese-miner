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
  // Suma de lo que aportan sus rasgos a un efecto.
  const trait = (m, key) => m.traits.reduce((a, id) => a + ((M.traits[id] && M.traits[id].eff[key]) || 0), 0);

  // Velocidad de un ratón en un oficio: nivel, rango, oficio favorito y rasgos.
  function speed(m, skill) {
    const power = 1 + M.perLevel * (level(m) - 1) + M.ranks[m.rank].bonus + M.rarities[m.rarity || 0].bonus + (m.fav === skill ? M.favoriteBonus : 0);
    return Math.max(0.2, power * (1 + trait(m, 'speed') + (CM.away ? trait(m, 'awaySpeed') : 0)));
  }
  const yieldMult = (m) => Math.max(0.2, 1 + trait(m, 'yield'));

  function pick(s, list) {
    return list[Math.floor(CM.rand(s) * list.length)];
  }
  function candidate(s, taken) {
    const goods = Object.keys(M.traits).filter((k) => M.traits[k].good);
    const quirks = Object.keys(M.traits).filter((k) => !M.traits[k].good);
    const free = M.names.filter((n) => taken.indexOf(n) < 0);
    const name = pick(s, free.length ? free : M.names);
    taken.push(name);
    const roll = CM.rand(s);
    const rarity = roll < M.rarities[2].chance ? 2 : roll < M.rarities[2].chance + M.rarities[1].chance ? 1 : 0;
    const good = pick(s, goods);
    // Un legendario no tiene manía: lleva un segundo rasgo bueno.
    const second = rarity === 2 ? pick(s, goods.filter((g) => g !== good)) : pick(s, quirks);
    // `look` decide su aspecto (pelaje, gorro, accesorio...): cada ratón es distinto.
    return { name, traits: [good, second], fav: pick(s, CM.skills.list), look: Math.floor(CM.rand(s) * 1048576), rarity };
  }

  // Piezas del aspecto de un ratón. Los raros y legendarios tienen pelajes
  // propios; el legendario lleva corona.
  const FUR_NAMES = ['White', 'Grey', 'Brown', 'Cream', 'Charcoal', 'Peach', 'Blue', 'Mint', 'Lilac', 'Golden'];
  const HAT_NAMES = ['Helmet', 'Cap', 'Bobble hat', 'Top hat', 'Bow', 'Crown'];
  const ACC_NAMES = ['', 'Glasses', 'Eye patch', 'Moustache', 'Blush'];
  function parts(m) {
    const n = (m.look || 0) >>> 0;
    const r = m.rarity || 0;
    return { fur: r === 2 ? 9 : r === 1 ? 7 + (n % 2) : n % 7, hat: r === 2 ? 5 : (n >> 3) % 5, hatColor: (n >> 6) % 8, acc: (n >> 9) % 5, pack: (n >> 12) % 5, rarity: r };
  }
  // El álbum: todo lo coleccionable, por categorías.
  const ALBUM = [
    { kind: 'fur', title: 'FURS', items: FUR_NAMES.map((name, i) => ({ key: 'fur:' + i, name, rarity: i === 9 ? 2 : i >= 7 ? 1 : 0 })) },
    { kind: 'hat', title: 'HATS', items: HAT_NAMES.map((name, i) => ({ key: 'hat:' + i, name, rarity: i === 5 ? 2 : 0 })) },
    { kind: 'acc', title: 'ACCESSORIES', items: ACC_NAMES.map((name, i) => ({ key: 'acc:' + i, name, rarity: 0 })).slice(1) },
    { kind: 'trait', title: 'TRAITS', items: Object.keys(M.traits).map((id) => ({ key: 'trait:' + id, name: M.traits[id].name, rarity: 0 })) },
  ];
  const ALBUM_KEYS = {};
  ALBUM.forEach((cat) => cat.items.forEach((it) => (ALBUM_KEYS[it.key] = it)));
  function albumKeys(m) {
    const p = parts(m);
    return ['fur:' + p.fur, 'hat:' + p.hat].concat(p.acc ? ['acc:' + p.acc] : [], m.traits.map((t) => 'trait:' + t)).filter((k) => ALBUM_KEYS[k]);
  }

  CM.mice = {
    postKey,
    level,
    speed,
    yieldMult,
    trait,
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
    score: (m, skill) => speed(m, skill) * yieldMult(m),

    // --- Usado por la producción ---
    // Ratón de un puesto con sus multiplicadores, o null si está vacío.
    work(s, skill, zone) {
      const m = this.at(s, skill, zone);
      return m ? { m, speed: speed(m, skill), yield: yieldMult(m) } : null;
    },
    // Tras completar una acción: experiencia para el ratón. Devuelve el
    // multiplicador de experiencia de la habilidad (rasgo Estudioso).
    reward(s, skill, zone, amount) {
      const m = this.at(s, skill, zone);
      if (!m) return 1;
      this.addXp(s, m, (amount || M.xpPerAction) * (1 + trait(m, 'mouseXp')));
      return 1 + trait(m, 'skillXp');
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
      const m = { id: 'm' + s.nextId++, name: c.name, traits: c.traits.slice(), fav: c.fav, look: c.look || 0, rarity: c.rarity || 0, xp: 0, rank: 0, post: '', rest: false };
      s.mice.push(m);
      const found = this.record(s, m);
      if (found.length) CM.emit(s, 'album', { keys: found });
      s.candidates = [];
      s.totals.miceRecruited += 1;
      this.autoPlace(s, m);
      CM.emit(s, 'recruited', { id: m.id });
      return CM.ok({ id: m.id });
    },

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
