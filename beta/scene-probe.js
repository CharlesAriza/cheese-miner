// CHEESE DRILLER BETA · Escena de prueba: solo instrumento, para comprobar HOUSE y LAB antes de que tengan su escena. Se ve únicamente con ?scenes en la dirección.
// No es contenido: enseña la colonia compartida tal cual, sin arte ni interfaz de juego. Cuando exista la escena de verdad, este archivo se va.
window.BetaProbe = function (id, api) {
  let el = null, last = 0, draws = 0;
  const NAME = { house: 'HOUSE', lab: 'LAB' };
  return {
    keep: false, content: false,
    ready: api.dev,
    get draws() { return draws; },
    init() { el = document.createElement('div'); el.className = 'scene-probe'; el.dataset.scene = id; api.host.appendChild(el); },
    enter() { api.host.hidden = false; el.hidden = false; last = 0; },
    frame(now) {
      draws += 1;
      if (now - last < 250) return; last = now;
      const c = api.colony(), who = api.Core.presence(c)[id].map((m) => m + ' ' + (c.roster.find((x) => x.id === m) || {}).name).join(', ') || 'nobody';
      el.textContent = NAME[id] + ' · TEST SCENE\nNot game content\n\ncoins ' + api.fmt(c.s.coins) + '\nraw ' + api.fmt(c.s.inv.raw) + ' · base ' + api.fmt(c.s.inv.base) + '\ncolony clock ' + Math.round(c.s.t / 1000) + ' s\nhere: ' + who;
    },
    leave() { el.hidden = true; api.host.hidden = true; },
    release() { el.remove(); el = null; },
  };
};
