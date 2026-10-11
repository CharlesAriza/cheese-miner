// RATONES: la plantilla. Cada ratón es un personaje con nombre, un rasgo
// bueno, una manía, un oficio favorito, nivel propio y rango.
// Una etapa de una línea está automatizada si tiene un ratón en su puesto.
// Los ratones nunca se van: el que no trabaja espera en la Mouse House.
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
    const power = 1 + M.perLevel * (level(m) - 1) + M.ranks[m.rank].bonus + (m.fav === skill ? M.favoriteBonus : 0);
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
    // `look` decide su aspecto (pelaje, gorro, accesorio...): cada ratón es distinto.
    return { name, traits: [pick(s, goods), pick(s, quirks)], fav: pick(s, CM.skills.list), look: Math.floor(CM.rand(s) * 1048576) };
  }

  CM.mice = {
    postKey,
    level,
    speed,
    yieldMult,
    trait,
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
      const m = { id: 'm' + s.nextId++, name: c.name, traits: c.traits.slice(), fav: c.fav, look: c.look || 0, xp: 0, rank: 0, post: '', rest: false };
      s.mice.push(m);
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
    bestFit(s) {
      const pool = s.mice.slice();
      pool.forEach((m) => {
        m.post = '';
        m.rest = false;
      });
      for (const p of this.posts(s)) {
        if (!pool.length) break;
        let best = 0;
        for (let i = 1; i < pool.length; i++) if (this.score(pool[i], p.skill) > this.score(pool[best], p.skill)) best = i;
        pool.splice(best, 1)[0].post = p.key;
      }
      CM.emit(s, 'assigned', { all: true });
      return CM.ok();
    },

    // --- Ascender ---
    promoteInfo(s, m) {
      const next = M.ranks[m.rank + 1];
      if (!next) return { maxed: true };
      const levelOk = level(m) >= next.level;
      return { next, levelOk, cost: next.cost, can: levelOk && s.coins >= next.cost };
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
