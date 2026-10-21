// ---------- SIMULACIÓN ESPEJO (V4.1) ----------
// Copia, para Cheddar, de las reglas reales de js/game/systems/production.js y js/game/simulation.js. Lo que cambia son las
// cifras: son de ejemplo (rotuladas en la columna) para que el ciclo entero se vea en menos de un minuto. No toca el juego.
//  · MINE: solo se pica sin veta a la vista (status 'ready'); con veta, picar falla ('vein-exposed').
//  · Golpe a mano: combo si llega antes de 650 ms; crítico cada 5 del combo. Con un minero en la roca, cada toque hace al menos
//    el 4 % de la búsqueda (12 % si es crítico). Sin minero, la fuerza del pico (x3 en crítico).
//  · El minero da un golpe cada «intervalo» solo mientras la roca está 'ready'; con veta a la vista, su acumulador vuelve a 0.
//  · Al completar la búsqueda: la veta se abre con toda su capacidad y el combo vuelve a 0.
//  · DRILL: solo arranca con veta y sin ciclo en marcha; al arrancar reserva su Raw de la veta y lo entrega al acabar. Tocar con
//    un ciclo en marcha lo acelera 250 ms. Con perforador, encadena ciclos mientras haya veta.
//  · Veta vacía al acabar un ciclo: la veta se cierra, la búsqueda vuelve a 0 y la roca baja un nivel de profundidad.
//  · REFINE, CHEESE y SELL: arrancan si tienen material (lo gastan al arrancar) y entregan al acabar; tocar acelera.
const RULE = { help: 0.04, helpCrit: 0.12, critEvery: 5, critMult: 3, comboMs: 650, drillBoostMs: 250, refBoostMs: 250, cookBoostMs: 250, sellBoostMs: 300 };
// Cifras de ejemplo (no son las del juego): búsqueda en unidades, ritmos en ms.
const EX = { need: 60, pick: 2, minerPower: 4, minerMs: 1400, capacity: 32, drillYield: 4, drillMs: 2000, rawPerBase: 2, refBatch: 2, refMs: 3000, cookBase: 1, cookMs: 3500, sellLots: 1, sellMs: 2600 };
const P41 = { miner: true, driller: true, refiner: true, cook: true, keeper: true };
let Z41, EVL = [];
function simReset(o = {}) {
  Z41 = { depth: DEP.cheddar, discover: 0, veinRevealed: false, veinRemaining: 0, drillJob: null, refJob: null, cookJob: null, sellJob: null, minerAcc: 0, combo: 0, lastHitAt: -1e9, raw: 4, base: 3, lots: 2, coins: 0, hits: 0, ...o };
}
simReset();
const emit41 = (type, d = {}) => { const e = { type, t: performance.now(), ...d }; EVL.push(e); if (EVL.length > 400) EVL.shift(); for (const f of EVH) f(e); };
const EVH = [];
const on41 = (f) => EVH.push(f);
const fail41 = (reason) => ({ ok: false, reason });
const veinNeed = () => EX.need;
const SIM41 = {
  mineStatus: () => (Z41.veinRevealed ? 'vein-exposed' : 'ready'),
  // Golpe: 'manual' (el jugador) o 'worker' (el minero). Misma regla que CM.mining.hit.
  hit(source) {
    if (this.mineStatus() !== 'ready') return fail41('vein-exposed');
    const need = veinNeed(), now = performance.now(); let crit = false;
    if (source === 'manual') { Z41.combo = now - Z41.lastHitAt <= RULE.comboMs ? Z41.combo + 1 : 1; Z41.lastHitAt = now; crit = Z41.combo % RULE.critEvery === 0; }
    let power = source === 'manual' ? EX.pick * (crit ? RULE.critMult : 1) : EX.minerPower;
    if (source === 'manual' && P41.miner) power = Math.max(power, need * (crit ? RULE.helpCrit : RULE.help));
    const amount = Math.min(need - Z41.discover, power); Z41.discover += amount; Z41.hits++;
    emit41('hit', { source, crit, amount, combo: source === 'manual' ? Z41.combo : 0 });
    if (Z41.discover >= need - 1e-6) { Z41.discover = need; Z41.veinRevealed = true; Z41.veinRemaining = EX.capacity; Z41.combo = 0; emit41('reveal', { capacity: Z41.veinRemaining }); }
    return { ok: true, crit };
  },
  drillStatus: () => (Z41.drillJob ? 'running' : !Z41.veinRevealed || Z41.veinRemaining <= 0 ? 'no-vein' : 'ready'),
  drillStart(source) { if (this.drillStatus() !== 'ready') return fail41(this.drillStatus()); const amount = Math.max(1, Math.min(EX.drillYield, Z41.veinRemaining)); Z41.veinRemaining -= amount; Z41.drillJob = { remaining: EX.drillMs, total: EX.drillMs, amount, source }; emit41('drillStart', { source, amount }); return { ok: true }; },
  drillTap() { if (!Z41.drillJob) return this.drillStart('manual'); Z41.drillJob.remaining = Math.max(0, Z41.drillJob.remaining - RULE.drillBoostMs); emit41('drillBoost'); return { ok: true, boosted: true }; },
  drillComplete() { const j = Z41.drillJob; Z41.drillJob = null; Z41.raw += j.amount; emit41('drillDone', { amount: j.amount, source: j.source }); if (Z41.veinRevealed && Z41.veinRemaining <= 0) { Z41.veinRevealed = false; Z41.veinRemaining = 0; Z41.discover = 0; Z41.depth += 1; emit41('deeper', { depth: Z41.depth }); } },
  refStatus: () => (Z41.refJob ? 'running' : Math.floor(Z41.raw / EX.rawPerBase) < 1 ? 'no-raw' : 'ready'),
  refStart(source) { if (this.refStatus() !== 'ready') return fail41(this.refStatus()); const batches = Math.min(EX.refBatch, Math.floor(Z41.raw / EX.rawPerBase)); const used = batches * EX.rawPerBase; Z41.raw -= used; Z41.refJob = { remaining: EX.refMs, total: EX.refMs, amount: batches, used, source }; emit41('refineStart', { used }); return { ok: true }; },
  refTap() { if (!Z41.refJob) return this.refStart('manual'); Z41.refJob.remaining = Math.max(0, Z41.refJob.remaining - RULE.refBoostMs); emit41('refineBoost'); return { ok: true, boosted: true }; },
  refComplete() { const j = Z41.refJob; Z41.refJob = null; Z41.base += j.amount; emit41('refineDone', { amount: j.amount, source: j.source }); },
  cookStatus: () => (Z41.cookJob ? 'running' : Z41.base < EX.cookBase ? 'no-base' : 'ready'),
  cookStart(source) { if (this.cookStatus() !== 'ready') return fail41(this.cookStatus()); Z41.base -= EX.cookBase; Z41.cookJob = { remaining: EX.cookMs, total: EX.cookMs, amount: 1, source }; emit41('cookStart'); return { ok: true }; },
  cookTap() { if (!Z41.cookJob) return this.cookStart('manual'); Z41.cookJob.remaining = Math.max(0, Z41.cookJob.remaining - RULE.cookBoostMs); emit41('cookBoost'); return { ok: true, boosted: true }; },
  cookComplete() { const j = Z41.cookJob; Z41.cookJob = null; Z41.lots += j.amount; emit41('cookDone', { amount: j.amount, source: j.source }); },
  sellStatus: () => (Z41.sellJob ? 'running' : Z41.lots < EX.sellLots ? 'no-stock' : 'ready'),
  sellStart(source) { if (this.sellStatus() !== 'ready') return fail41(this.sellStatus()); Z41.lots -= EX.sellLots; Z41.sellJob = { remaining: EX.sellMs, total: EX.sellMs, amount: EX.sellLots, source }; emit41('sellStart'); return { ok: true }; },
  sellTap() { if (!Z41.sellJob) return this.sellStart('manual'); Z41.sellJob.remaining = Math.max(0, Z41.sellJob.remaining - RULE.sellBoostMs); emit41('sellBoost'); return { ok: true, boosted: true }; },
  sellComplete() { const j = Z41.sellJob; Z41.sellJob = null; Z41.coins += j.amount * 120; emit41('sellDone', { amount: j.amount, source: j.source }); },
};
// Igual que runJob y runMiner de simulation.js.
function runJob41(dt, get, auto, start, complete) { let left = dt; for (let g = 0; g < 50; g++) { let job = get(); if (!job) { if (!auto || !start().ok) return; job = get(); } const used = Math.min(left, job.remaining); job.remaining -= used; left -= used; if (job.remaining > 0) return; complete(); } }
function runMiner41(dt) { if (!P41.miner || SIM41.mineStatus() !== 'ready') { Z41.minerAcc = 0; return; } Z41.minerAcc += dt; while (Z41.minerAcc >= EX.minerMs) { Z41.minerAcc -= EX.minerMs; if (!SIM41.hit('worker').ok) { Z41.minerAcc = 0; break; } } }
// Estados forzados (rotulados SIMULACIÓN): solo quitan material o puestos; nunca permiten acciones que el juego no permite.
const FORCE = { state: 'normal' };
function step41(dt) {
  runMiner41(dt);
  runJob41(dt, () => Z41.drillJob, P41.driller, () => SIM41.drillStart('worker'), () => SIM41.drillComplete());
  runJob41(dt, () => Z41.refJob, P41.refiner, () => SIM41.refStart('worker'), () => SIM41.refComplete());
  runJob41(dt, () => Z41.cookJob, P41.cook, () => SIM41.cookStart('worker'), () => SIM41.cookComplete());
  runJob41(dt, () => Z41.sellJob, P41.keeper, () => SIM41.sellStart('worker'), () => SIM41.sellComplete());
}
