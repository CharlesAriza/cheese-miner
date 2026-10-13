// Ejecuta la simulación fuera del navegador con el motor de JavaScript que trae macOS
// (JavaScriptCore). Herramienta de balance: no forma parte del juego.
//
// Desde la carpeta del proyecto:
//   JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc
//   $JSC mi-experimento.js
// y en mi-experimento.js:
//   load('sim-headless.js');
//   let s = CM.createState(12);                       // semilla
//   s = CM_BOT.playBot(1500, 2 * 3600000, 'never', [], false, false,
//                      { state: s, buyEveryMs: 20000, idleAfterAuto: true }).s;   // bot casual, 2 horas
//   print(CM.fmt(s.totals.coinsEarned));
//
// Da exactamente la misma partida que tests.html?bot con la misma semilla, unas diez veces
// más rápido, y aguanta partidas de 24 horas (la pestaña oculta del navegador se caía).
var window = globalThis;
// Por defecto carga solo el bot. Para pasar las pruebas: definir antes HEADLESS_SEARCH = '' (todas)
// o '?only=texto', y leer después window.TEST_RESULTS.
var location = { search: typeof HEADLESS_SEARCH === 'string' ? HEADLESS_SEARCH : '?bot', href: '' };
var localStorage = (function () { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } }; })();
var performance = { now: () => Date.now() };
var navigator = { userAgent: 'jsc' };
var document = { addEventListener() {}, getElementById() { return { textContent: '', style: {} }; }, querySelector() { return null; }, querySelectorAll() { return []; }, createElement() { return { style: {}, appendChild() {}, setAttribute() {} }; }, body: { appendChild() {} }, hidden: false };
window.addEventListener = function () {};
var console = { log: (...a) => print(a.join(' ')), warn: (...a) => print(a.join(' ')), error: (...a) => print(a.join(' ')) };
var setTimeout = () => 0, clearTimeout = () => {}, setInterval = () => 0, clearInterval = () => {};
for (const f of ['js/game/config/balance.js', 'js/game/config/traits.js', 'js/playtest/telemetry.js', 'js/game/state.js', 'js/game/systems/skills.js', 'js/game/systems/mice.js', 'js/game/systems/production.js', 'js/game/systems/cheesery.js', 'js/game/simulation.js', 'js/storage.js', 'js/playtest/devtools.js', 'js/tests/tests.js']) load(f);
