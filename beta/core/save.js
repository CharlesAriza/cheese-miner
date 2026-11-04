// CHEESE DRILLER · BETA · Guardado. Clave propia: las partidas del juego actual no se leen, no se migran y no se tocan (D1).
// Se guarda lo que el jugador ha hecho (ids, rangos, ratones, existencias), nunca efectos: al cargar se recalculan, así que
// cambiar el balance no exige migrar. Versionado: MIGRATIONS lleva cada versión a la siguiente. Una partida rota no se pierde:
// se aparta a <clave>-broken y no se sobrescribe. Quien llama pone la hora y el almacén.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.save = (function () {
  const Mo = () => E2.model, Ru = () => E2.rules, P = () => E2.PARAMS;
  const KEY = 'cheese-driller-beta', VERSION = 1;
  const MIGRATIONS = {}; // versión -> función(datos) que la deja en la siguiente
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  function toPlain(c) {
    const { rng, profile, out, s, ...rest } = c;
    const { team, rates, mods, q, muted, placed, ...state } = s;
    return Object.assign({}, rest, { s: Object.assign({}, state, { placed: placed.map((p) => ({ id: p.m.id, st: p.st, fn: p.fn, role: p.role })) }) });
  }
  const pack = (v) => JSON.stringify(v, (k, x) => (x === Infinity ? 'Inf' : x));
  function serialize(c, now) { return pack({ app: KEY, v: VERSION, savedAt: now || 0, game: toPlain(c) }); }

  // Devuelve { game, savedAt } o null si no es una partida válida.
  function deserialize(text) {
    let d;
    try { d = JSON.parse(text, (k, x) => (x === 'Inf' ? Infinity : x)); } catch (e) { return null; }
    if (!isObj(d) || d.app !== KEY || !(d.v >= 1) || d.v > VERSION || !isObj(d.game)) return null;
    for (let v = d.v; v < VERSION; v++) { if (!MIGRATIONS[v]) return null; MIGRATIONS[v](d.game); }
    const c = rebuild(d.game);
    return c ? { game: c, savedAt: d.savedAt || 0 } : null;
  }
  // Repara lo que ya no exista en los datos y recalcula lo derivado.
  function rebuild(c) {
    const s = c.s;
    if (!isObj(s) || !Array.isArray(c.roster) || !isObj(s.inv) || !Number.isFinite(s.t) || !isObj(c.lab)) return null;
    const S2 = P().s2, nodes = {};
    for (const st of Object.keys(S2.paths)) for (const f of S2.paths[st]) for (const o of Object.keys(f.opts)) for (const n of f.opts[o]) nodes[n.id] = true;
    for (const id of Object.keys(c.owned)) if (!nodes[id]) { const back = (P().retired || {})[id] || 0; delete c.owned[id]; if (back) { s.coins += back; s.coinsStart += back; } }
    for (const fk of Object.keys(c.active)) { const [st, fid] = fk.split('.'), f = (S2.paths[st] || []).find((x) => x.id === fid); if (!f || !f.opts[c.active[fk]]) delete c.active[fk]; }
    for (const st of Object.keys(S2.fundamentals)) { const ok = {}; for (const f of S2.fundamentals[st]) { ok[f.id] = true; if (!(c.fund[st][f.id] >= 0)) c.fund[st][f.id] = 0; } for (const id of Object.keys(c.fund[st])) if (!ok[id]) delete c.fund[st][id]; }
    for (const k of ['coins', 'coinsStart', 'depth']) if (!Number.isFinite(s[k])) return null;
    const byId = {};
    for (const m of c.roster) byId[m.id] = m;
    const placed = [];
    for (const p of s.placed || []) { const post = (P().posts[p.st][s.stage[p.st] - 1] || []).find(([r]) => r === p.role); if (byId[p.id] && post) placed.push({ m: byId[p.id], st: p.st, fn: post[1], role: p.role }); }
    c.lab.workers = c.lab.workers.filter((id) => byId[id]);
    s.placed = [];
    E2.game.attach(c);
    c.rng = Ru().rngOf(c); c.profile = null;
    // Los efectos se recalculan como estaban: con la hora de la última vez que se aplicaron (el reajuste de camino depende de ella).
    const t = s.t;
    s.mods = s.mods || Mo().defaultMods();
    s.away = !!s.away;
    Mo().place(s, placed);
    s.t = c.modsT;
    Ru().applyMods(c);
    s.t = t;
    if (c.offJob) s.muted = true;
    return c;
  }

  // ---------- Almacén (localStorage en el navegador; en las pruebas, uno de mentira) ----------
  const guard = (k) => { if (k !== KEY && k.indexOf(KEY + '-') !== 0) throw new Error('save: clave ajena ' + k); return k; };
  function write(store, c, now, key) {
    const k = guard(key || KEY), text = serialize(c, now), prev = store.getItem(k);
    if (prev) store.setItem(guard(k + '-prev'), prev); // la copia anterior, por si se corta a medias
    store.setItem(k, text);
    return text.length;
  }
  function read(store, key) {
    const k = guard(key || KEY), text = store.getItem(k);
    if (!text) return null;
    const r = deserialize(text);
    if (r) return r;
    store.setItem(guard(k + '-broken'), text); // no se pierde ni se pisa
    return null;
  }
  function erase(store, key) { const k = guard(key || KEY); store.removeItem(k); store.removeItem(k + '-prev'); }
  return { KEY, VERSION, MIGRATIONS, serialize, deserialize, write, read, erase };
})();
