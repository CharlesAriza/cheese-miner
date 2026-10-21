// ---------- BLOQUE 5 · SISTEMAS COMPARTIDOS (producción, 21-10-2026) ----------
// 1 · La columna vertical del MVP: superficie, Cheddar, Gouda y Brie, una debajo de otra, unidas por un solo pozo. El capítulo
//     (161 px) se coloca bajo el mercado del pueblo, desde x = 254: así el centro de la polea del castillete (x 409,5 del
//     pueblo) cae justo entre los dos cables del pozo de cada capítulo (x 152 y 159, centro 155,5).
// 2 · El montacargas: una sola jaula para todo el pozo. Baja hasta Brie y sube recogiendo en el rellano de cada quesería la
//     rueda de su queso (blanca en Brie, de cera roja en Gouda, ámbar en Cheddar); arriba la descarga y las ruedas entran en
//     la despensa. La polea del castillete gira solo mientras la jaula se mueve.
// 3 · Bocadillos y placas en pixel art, en 9 cortes, para la interfaz del juego (la dirección aprobada de la revisión de arte).
const STACK = { x0: 254, w: Math.ceil(SC.worldW), surfH: SH1, chH: STOPS[1].h };
STACK.y = { surface: 0, cheddar: STACK.surfH, gouda: STACK.surfH + STACK.chH, brie: STACK.surfH + 2 * STACK.chH };
STACK.h = STACK.surfH + 3 * STACK.chH;
// Dónde para la jaula: el suelo del mercado arriba; en cada capítulo, el rellano de la quesería (TR + 2 en su sistema).
const LANDING = { surface: GR1 + 1, cheddar: STACK.y.cheddar + 62, gouda: STACK.y.gouda + 62, brie: STACK.y.brie + 62 };
const CAGE_X = 150; // como en V4.1 (o + 133 con o = 17)
const WHEEL_COL = { cheddar: ['#c97a08', '#f5ab12', '#ffd84a'], gouda: ['#7e2018', '#e8523a', '#ffd84a'], brie: ['#ac9672', '#f6ecd0', '#fffdf2'] };
// Guion del montacargas (ms): baja a Brie, sube parando en Gouda y Cheddar, descarga arriba y vuelve a empezar.
const LIFT_T = [['down', 'surface', 'brie', 2600], ['load', 'brie', 'brie', 1100], ['up', 'brie', 'gouda', 1000], ['load', 'gouda', 'gouda', 1100], ['up', 'gouda', 'cheddar', 1000], ['load', 'cheddar', 'cheddar', 1100], ['up', 'cheddar', 'surface', 1300], ['unload', 'surface', 'surface', 1500]];
const LIFT_LOOP = LIFT_T.reduce((s, x) => s + x[3], 0);
const ease = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
function liftAt(t) {
  t %= LIFT_LOOP; let acc = 0, cargo = [];
  for (let i = 0; i < LIFT_T.length; i++) {
    const [kind, a, b, ms] = LIFT_T[i];
    if (t < acc + ms) {
      const k = (t - acc) / ms, y = kind === 'up' || kind === 'down' ? LANDING[a] + (LANDING[b] - LANDING[a]) * ease(k) : LANDING[a];
      if (kind === 'load' && k > 0.45) cargo.push(a); if (kind === 'unload') cargo = k < 0.3 ? ['brie', 'gouda', 'cheddar'] : k < 0.55 ? ['gouda', 'cheddar'] : k < 0.8 ? ['cheddar'] : [];
      return { kind, at: a, to: b, k, y: Math.round(y), cargo, moving: kind === 'up' || kind === 'down', loading: kind === 'load' ? a : null, waiting: ['brie', 'gouda', 'cheddar'].filter((z) => !cargo.includes(z) && kind !== 'unload' && !(kind === 'down')) };
    }
    if (kind === 'load') cargo.push(a);
    acc += ms;
  }
}
// La jaula (12 × 15): marco de hierro, techo con su argolla, suelo de tablas y barrotes delante; el farol va en el techo.
const cageBack = () => art('cageB', () => { const c = PB(12, 15), P = PAL; c.rect(0, 2, 12, 13, P.irn[3]); c.rect(1, 3, 10, 11, '#24222c'); c.rect(0, 2, 12, 2, P.irn[2]); c.hline(0, 2, 12, P.irn[1]); c.rect(1, 12, 10, 3, P.woo[2]); c.hline(1, 12, 10, P.woo[1]); c.rect(5, 0, 2, 2, P.irn[2]); c.outline(); return c.canvas(); });
const cageFront = () => art('cageF', () => { const c = PB(12, 15), P = PAL; for (const x of [0, 3, 6, 9, 11]) c.vline(x, 4, 8, x === 0 ? P.irn[1] : P.irn[2]); c.hline(0, 7, 12, P.irn[3]); return c.canvas(); });
function wheelSmall(g, x, y, zone) { const [d, m, l] = WHEEL_COL[zone]; g.fillStyle = INK; g.fillRect(x - 1, y, 6, 3); g.fillRect(x, y - 1, 4, 5); g.fillStyle = m; g.fillRect(x, y, 4, 3); g.fillStyle = l; g.fillRect(x, y, 4, 1); g.fillStyle = d; g.fillRect(x, y + 2, 4, 1); }
// Pinta la jaula, su cable, las ruedas que esperan en cada rellano y las que entran en la despensa. (g ya en coordenadas de la
// columna; la superficie empieza en x = 0 de la columna, que es x = 254 del pueblo.)
function drawLift5(g, t) {
  const L = liftAt(t), x = CAGE_X, y = L.y - 15;
  // Las ruedas que esperan en cada rellano las pinta el capítulo (la cola de V4.1, por detrás de los ratones); aquí solo el
  // último saltito de la rueda al entrar en la jaula, desde su borde, para no pasar por delante del quesero.
  if (L.loading) { const k = Math.min(1, L.k / 0.45); if (k < 1) wheelSmall(g, Math.round(x - 1 + k * 4), LANDING[L.loading] - 3 - Math.round(Math.sin(k * Math.PI) * 3), L.loading); }
  // Cable desde la polea del castillete hasta la argolla de la jaula.
  g.fillStyle = '#c8c2d4'; g.fillRect(x + 5, 46, 1, Math.max(0, y - 46)); g.fillStyle = '#8a8496'; g.fillRect(x + 6, 46, 1, Math.max(0, y - 46));
  g.drawImage(cageBack(), x, y);
  L.cargo.forEach((z, i) => wheelSmall(g, x + 2 + (i % 2) * 4, y + 9 - Math.floor(i / 2) * 3, z));
  g.drawImage(cageFront(), x, y);
  g.fillStyle = L.moving && Math.floor(t / 250) % 2 ? '#ffcf2e' : '#a86a10'; g.fillRect(x + 5, y + 1, 2, 1); if (L.moving) vfxGlow(g, x + 6, y + 1, 4, t, '#ffd860');
  // Descarga: las ruedas saltan del montacargas a la puerta de la despensa (x 102 de la columna).
  if (L.kind === 'unload') for (const [z, a] of [['brie', 0], ['gouda', 0.25], ['cheddar', 0.5]]) { const k = (L.k - a) / 0.3; if (k > 0 && k < 1) wheelSmall(g, Math.round(x - 2 - k * 46), LANDING.surface - 4 - Math.round(Math.sin(k * Math.PI) * 8), z); }
  return L;
}
// La columna entera en un lienzo (STACK.w × STACK.h): la superficie recortada desde x = 254, los tres capítulos y el montacargas.
const surfBG = () => art('stackSurfBG', () => { const c = document.createElement('canvas'); c.width = SW1; c.height = SH1; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintSurface(g); return c; });
function drawStack(g, now, cv3) {
  const surf = cv3.surf; { const sg = surf.getContext('2d'); sg.imageSmoothingEnabled = false; sg.drawImage(surfBG(), 0, 0); const L = liftAt(now); drawSurface(sg, now, { lift: L.moving }); }
  g.drawImage(surf, STACK.x0, 0, STACK.w, STACK.surfH, 0, 0, STACK.w, STACK.surfH);
  renderStopTo(1, now, cv3.ched); g.drawImage(cv3.ched, 0, STACK.y.cheddar);
  renderGouda(now, cv3.gouda); g.drawImage(cv3.gouda, 0, STACK.y.gouda);
  renderBrie(now, cv3.brie); g.drawImage(cv3.brie, 0, STACK.y.brie);
  return drawLift5(g, now);
}

// ================= BOCADILLOS Y PLACAS (9 cortes) =================
// Bocadillo: crema con 1 px de tinta y esquinas de 2 px recortadas, una sombra clara dentro abajo; la punta va aparte (abajo o
// a un lado). Placa de máquina: chapa ámbar remachada, colgada de una cadena; la roja es para «parada». Insignia: el estado
// pequeño sobre un puesto (aviso ámbar, parado rojo, listo verde). Todo a 1:1; el juego los estira con border-image.
const BUBC = { bg: '#fffdf2', shade: '#e2d4ac' };
const bubble9 = () => art('bub9', () => { const c = PB(9, 9); c.rect(1, 1, 7, 7, BUBC.bg); c.rect(2, 0, 5, 1, BUBC.bg); c.rect(2, 8, 5, 1, BUBC.bg); c.rect(0, 2, 1, 5, BUBC.bg); c.rect(8, 2, 1, 5, BUBC.bg); c.hline(1, 7, 7, BUBC.shade); c.outline(); return c.canvas(); });
const bubbleTail = () => art('bubT', () => { const c = PB(7, 6); c.rect(0, 0, 7, 1, BUBC.bg); c.rect(1, 1, 5, 1, BUBC.bg); c.rect(2, 2, 3, 1, BUBC.bg); c.px(3, 3, BUBC.bg); c.outline(); return c.canvas(); });
const plate9 = (red) => art('plate9' + red, () => { const c = PB(11, 11), M = red ? ['#ffb0a0', '#e8523a', '#b8341f', '#7e2018', '#4a1210'] : PNT; c.rect(0, 0, 11, 11, M[2]); c.hline(0, 0, 11, M[1]); c.vline(0, 0, 11, M[1]); c.hline(0, 10, 11, M[3]); c.vline(10, 0, 11, M[3]); for (const [x, y] of [[2, 2], [8, 2], [2, 8], [8, 8]]) { c.px(x, y, M[0]); c.px(x + 1, y + 1, M[4]); } c.outline(); return c.canvas(); });
const chainSprite = () => art('chain', () => { const c = PB(3, 8); for (let y = 0; y < 8; y += 3) { c.px(1, y, PAL.irn[1]); c.px(0, y + 1, PAL.irn[2]); c.px(2, y + 1, PAL.irn[2]); c.px(1, y + 2, PAL.irn[3]); } return c.canvas(); });
const badge = (kind) => art('badge' + kind, () => { const c = PB(9, 9), M = { warn: PNT, stop: ['#ffb0a0', '#e8523a', '#b8341f', '#7e2018', '#4a1210'], ok: ['#c8f0b0', '#62d36e', '#3aa048', '#26702e', '#164a1a'] }[kind]; c.ell(4.5, 4.5, 4.2, 4.2, (x, y) => (x + y < 7 ? M[0] : x + y < 10 ? M[1] : M[2])); if (kind === 'warn') { c.vline(4, 2, 3, M[4]); c.px(4, 6, M[4]); } else if (kind === 'stop') { c.rect(3, 3, 3, 3, '#fffdf2'); } else { c.px(2, 4, '#fffdf2').px(3, 5, '#fffdf2').px(4, 6, '#fffdf2').px(5, 5, '#fffdf2').px(6, 4, '#fffdf2').px(7, 3, '#fffdf2'); } c.outline(); return c.canvas(); });
