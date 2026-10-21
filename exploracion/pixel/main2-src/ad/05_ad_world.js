// ---------- ART DIRECTION · el motor de V4.1 para las demostraciones (sin su interfaz) ----------
// La escala de un 375 × 635 con DPR 3: 7/3 px CSS por píxel de arte en la colonia.
SC = { d: 7, s: 7 / 3, LW: 375 / (7 / 3), ox: 8, worldW: 375 / (7 / 3) }; buildStops();
function paintLabels() {}
// Dibuja una parada entera en un lienzo propio (mismo motor, otro destino).
function renderStopTo(i, now, cvs) { const st = STOPS[i]; cvs.width = Math.ceil(SC.worldW); cvs.height = st.h; const g = cvs.getContext('2d'); g.imageSmoothingEnabled = false; g.setTransform(1, 0, 0, 1, 0, -st.top); const was = ctx, hs = HITS; ctx = g; HITS = []; try { if (st.kind === 'pilot') drawCheddar(st, now); else if (st.kind === 'district') drawDistrictB(st, now); } finally { ctx = was; HITS = hs; } return cvs; }

// ---------- C · EL PUEBLO (propuesta de composición) ----------
// Más ancho que la pantalla (346 × 152 píxeles de arte; la pantalla ve 160 de ancho): a la derecha, el mercado (tienda,
// almacén y castillete de la mina, justo encima del pozo de Cheddar); en medio, el laboratorio en un altozano; a la
// izquierda, la casa en la colina. Debajo, el corte del terreno: la bodega del almacén, el pozo y la madriguera de la casa.
const VW = 346, VH = 152, GR = 96, GH = 78, GL = 88;
const VPOS = { house: [10, GH], lab: [106, GL], shop: [186, GR], pantry: [252, GR], head: [317, GR] };
// Suelo: altura de la hierba en cada x (colina → altozano → mercado, con taludes).
const groundY = (x) => (x < 84 ? GH : x < 98 ? GH + ((x - 84) / 14) * (GL - GH) : x < 158 ? GL : x < 172 ? GL + ((x - 158) / 14) * (GR - GL) : GR);
const tree = (big) => adArt('tree' + big, () => { const W = big ? 34 : 22, H = big ? 46 : 30, c = PB(W, H), P = PAL, cx = W / 2; c.rect(Math.round(cx) - 2, H - (big ? 18 : 11), 4, big ? 18 : 11, (x, y) => (x < cx - 1 ? P.wod[1] : x < cx + 1 ? P.wod[2] : P.wod[3])); const blobs = big ? [[cx, 13, 13, 11], [cx - 8, 19, 8, 7], [cx + 8, 18, 9, 7], [cx - 2, 7, 9, 6]] : [[cx, 9, 9, 8], [cx - 5, 13, 6, 5], [cx + 5, 12, 6, 5]]; for (const [bx, by, rx, ry] of blobs) c.ell(bx, by, rx, ry, (x, y) => faceTone(P.lea, x, y, bx - rx, by - ry, rx * 2, ry * 2, 0.25)); for (let i = 0; i < (big ? 30 : 14); i++) { const x = Math.floor(hh2(i, 1, big) * W), y = Math.floor(hh2(i, 2, big) * (H - 10)); if (c.get(x, y)) c.px(x, y, hh2(i, 3) < 0.5 ? P.lea[0] : P.lea[3]); } c.outline(); return c; });
const bush = (s) => adArt('bush' + s, () => { const c = PB(14, 8), P = PAL; c.ell(7, 5, 6.4, 3.6, (x, y) => faceTone(P.lead, x, y, 0, 1, 14, 7, 0.3)); if (s) for (const [x, y] of [[4, 3], [9, 4], [6, 5]]) c.px(x, y, s === 1 ? '#ff9ab5' : '#fff6b8'); c.outline(); return c; });
const fence = (n) => adArt('fence' + n, () => { const c = PB(n * 6 + 2, 9), P = PAL; for (let i = 0; i <= n; i++) c.rect(i * 6, 1, 2, 8, (x) => (x === i * 6 ? P.woo[1] : P.woo[3])); c.hline(0, 3, n * 6 + 2, P.woo[2]); c.hline(0, 6, n * 6 + 2, P.woo[2]); c.outline(); return c; });
const bench = () => adArt('bench', () => { const c = PB(16, 8), P = PAL; c.rect(0, 3, 16, 2, P.woo[1]); c.hline(0, 3, 16, P.woo[0]); c.rect(0, 0, 16, 2, P.woo[2]); c.rect(1, 5, 2, 3, P.woo[3]); c.rect(13, 5, 2, 3, P.woo[3]); c.outline(); return c; });
const lampPost = () => adArt('lamp', () => { const c = PB(7, 24), P = PAL; c.rect(3, 6, 1, 18, P.irn[2]); c.rect(2, 22, 3, 2, P.irn[3]); c.rect(1, 1, 5, 6, P.irn[3]); c.rect(2, 2, 3, 4, P.win[1]); c.px(2, 2, P.win[0]); c.rect(2, 0, 3, 1, P.irn[2]); c.outline(); return c; });
const signPost = () => adArt('sign', () => { const c = PB(16, 18), P = PAL; c.rect(6, 4, 2, 14, P.woo[2]); c.poly([[0, 2], [12, 2], [15, 5], [12, 8], [0, 8]], P.woo[1]); c.hline(1, 2, 11, P.woo[0]); c.hline(2, 5, 7, P.woo[3]); c.poly([[6, 9], [13, 9], [13, 14], [6, 14]], P.woo[2]); c.vline(9, 10, 3, INK); c.px(8, 11, INK).px(10, 11, INK); c.outline(); return c; });
function paintVillage(g) {
  const P = PAL, R2 = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  // Cielo de media tarde, nubes y dos líneas de colinas lejanas (sin contorno, veladas hacia el cielo).
  const SKY = ['#4c5f98', '#5a6ea6', '#6a80b4', '#7c92c0', '#94a8cc', '#b4c0d4', '#d8cdb8'];
  SKY.forEach((c, i) => R2(0, i * 12, VW, 12, c)); R2(0, 84, VW, 20, '#e2d0b0');
  // Transición en trama entre bandas del cielo (sin degradados).
  [...SKY, '#e2d0b0'].forEach((c, i) => { if (!i) return; const y = i * 12; for (let x = 0; x < VW; x++) { if ((x + y) % 2 === 0) R2(x, y, 1, 1, SKY[i - 1]); if (x % 2 === 0 && y % 4 === 0) R2(x, y + 1, 1, 1, SKY[i - 1]); } });
  for (const [cx, cy, w] of [[40, 16, 26], [150, 10, 34], [262, 20, 22], [318, 8, 18]]) { R2(cx, cy, w, 4, '#f4f2fa'); R2(cx + 4, cy - 3, w - 10, 3, '#f4f2fa'); R2(cx + 2, cy + 4, w - 2, 2, '#c8cce4'); }
  for (let x = 0; x < VW; x++) { const h1 = 22 + Math.round(Math.sin(x * 0.03 + 1) * 7 + Math.sin(x * 0.09) * 3); R2(x, GR - 6 - h1, 1, h1 + 6, '#8a9cbc'); }
  for (let x = 0; x < VW; x++) { const h2 = 12 + Math.round(Math.sin(x * 0.05 + 3) * 5 + Math.sin(x * 0.13) * 2); R2(x, GR - 4 - h2, 1, h2 + 4, '#7a9a8e'); if (hh2(x, 7) < 0.08) R2(x, GR - 6 - h2, 1, 2, '#6a8a7e'); }
  // Terreno: hierba con su borde, taludes y el corte del suelo con estratos.
  for (let x = 0; x < VW; x++) { const y = Math.round(groundY(x)); R2(x, y, 1, VH - y, P.soi[1]); R2(x, y, 1, 4, P.gra[1]); R2(x, y, 1, 1, P.gra[0]); R2(x, y + 4, 1, 2, P.gra[3]); if (hh2(x, 1) < 0.3) R2(x, y - 1, 1, 1, P.gra[1]); if (hh2(x, 2) < 0.12) R2(x, y - 2, 1, 1, P.gra[2]); }
  for (let y = 104; y < VH; y += 9) for (let x = 0; x < VW; x++) { const yy = y + Math.round(Math.sin(x * 0.07 + y) * 1.5); if (yy > groundY(x) + 8) R2(x, yy, 1, 1, P.soi[3]); }
  for (let i = 0; i < 160; i++) { const x = Math.floor(hh2(i, 11) * VW), y = 104 + Math.floor(hh2(i, 12) * 46); if (y > groundY(x) + 8) { R2(x, y, 2, 1, P.soi[0]); R2(x, y + 1, 2, 1, P.soi[3]); } }
  for (let i = 0; i < 14; i++) { let x = 20 + Math.floor(hh2(i, 21) * 300), y = Math.round(groundY(x)) + 6; for (let k = 0; k < 9; k++) { R2(x, y + k, 1, 1, '#4a3424'); x += hh2(i, k) < 0.5 ? -1 : 1; } }
  // Camino de tierra con taludes y escalones.
  for (let x = 4; x < 346; x++) { const y = Math.round(groundY(x)); if (x > 72 && x < 104 || x > 150 && x < 186) R2(x, y + 1, 1, 2, P.dir[1]); else R2(x, y + 1, 1, 2, P.dir[0]); if (hh2(x, 33) < 0.2) R2(x, y + 2, 1, 1, P.dir[2]); }
  for (const [x0, x1] of [[84, 98], [158, 172]]) for (let x = x0; x < x1; x += 4) { const y = Math.round(groundY(x)); R2(x, y, 4, 1, P.stw[1]); R2(x, y + 1, 4, 1, P.stw[3]); }
  // Corte del subsuelo: la madriguera bajo la casa (dormitorio), la bodega bajo el almacén y el pozo.
  const room = (x, y, w, h, back) => { R2(x - 1, y - 1, w + 2, h + 2, INK); R2(x, y, w, h, back); R2(x, y, w, 2, '#00000040'); };
  room(16, 86, 54, 22, '#3a2a1e'); for (let x = 16; x < 70; x += 3) R2(x, 86 + (x % 2), 1, 1, '#2a1c12'); R2(16, 106, 54, 2, P.woo[3]);
  for (const bx of [22, 44]) { R2(bx, 99, 18, 5, P.woo[2]); R2(bx, 99, 18, 1, P.woo[1]); R2(bx + 1, 97, 16, 3, '#6a7ac8'); R2(bx + 1, 97, 16, 1, '#9aa8e8'); R2(bx + 1, 96, 5, 2, P.cre[1]); R2(bx, 95, 2, 9, P.woo[3]); }
  R2(39, 88, 1, 4, INK); R2(38, 92, 3, 3, P.win[1]);
  // Escalera de la casa a la madriguera.
  R2(60, GH + 1, 7, 86 - GH, '#2a1c12'); for (let y = GH + 3; y < 86; y += 3) R2(61, y, 5, 1, P.woo[1]); R2(60, GH + 1, 1, 86 - GH, P.woo[3]); R2(66, GH + 1, 1, 86 - GH, P.woo[3]);
  room(258, 104, 52, 30, '#2e2218'); for (const sy of [114, 124]) { R2(260, sy, 48, 2, P.woo[2]); R2(260, sy, 48, 1, P.woo[1]); }
  for (let i = 0; i < 6; i++) { const x = 262 + i * 8, cc = ['#e08a2e', '#efe6c4', P.chz[1]][i % 3]; R2(x - 1, 107, 8, 7, INK); R2(x, 108, 6, 6, P.woo[1]); R2(x + 1, 110, 4, 2, cc); }
  for (let i = 0; i < 5; i++) { const x = 266 + i * 9; R2(x - 1, 117, 8, 7, INK); R2(x, 118, 6, 6, P.chz[2]); R2(x, 118, 6, 2, P.chz[0]); }
  R2(252, 97, 6, 37, P.woo[3]); for (let y = 99; y < 134; y += 4) R2(253, y, 4, 1, P.woo[1]);
  R2(326, GR, 12, VH - GR, '#120c0a'); R2(326, GR, 2, VH - GR, P.woo[3]); R2(336, GR, 2, VH - GR, P.woo[3]); for (let y = GR + 6; y < VH; y += 10) R2(326, y, 12, 1, P.woo[2]);
  // Fondo medio: árboles grandes detrás.
  for (const [x, big] of [[72, 1], [158, 0], [0, 0]]) { const tr = tree(big).canvas(); g.drawImage(tr, x, Math.round(groundY(x + tr.width / 2)) - tr.height + 1); }
}
// Lo que va delante del fondo: edificios (con su sombra de contacto), objetos y la vida. Por orden de profundidad.
function drawVillage(g, now, opt = {}) {
  const P = PAL, at = (k) => VPOS[k], spr = (cv, x, base) => { groundShadow(g, x, base, cv.width); g.drawImage(cv, x, base - cv.height); };
  spr(houseSprite().canvas(), ...at('house')); houseSmoke(g, VPOS.house[0] + 47, VPOS.house[1] - 54 + 6, now);
  g.drawImage(fence(3).canvas(), 72, GH - 8); g.drawImage(bench().canvas(), 74, GH - 8); g.drawImage(bush(1).canvas(), 0, GH - 7);
  spr(labSprite().canvas(), ...at('lab')); const blink = Math.floor(now / 700) % 2; g.fillStyle = blink ? '#ff6a5a' : '#7a2a24'; g.fillRect(VPOS.lab[0] + 24, VPOS.lab[1] - 70, 2, 2);
  if (Math.floor(now / 380) % 3 === 0) { g.fillStyle = '#e8fff0'; g.fillRect(VPOS.lab[0] + 43, VPOS.lab[1] - 8 - (Math.floor(now / 380) % 2), 1, 1); }
  g.drawImage(bush(2).canvas(), 96, GL - 7); g.drawImage(signPost().canvas(), 168, GR - 17);
  spr(shopSprite().canvas(), ...at('shop'));
  g.drawImage(lampPost().canvas(), 245, GR - 23); g.globalAlpha = 0.12; g.fillStyle = '#ffe08a'; g.fillRect(241, GR - 26, 15, 12); g.globalAlpha = 1;
  spr(pantrySprite().canvas(), ...at('pantry'));
  spr(headframeSprite().canvas(), ...at('head'));
  g.drawImage(bush(0).canvas(), 238, GR - 7);
  // Ratones: el tendero detrás del mostrador (se redibuja el frente encima), el investigador en la puerta del laboratorio,
  // uno sin puesto leyendo en el banco y otro durmiendo en la madriguera. Solo poses aprobadas.
  const T = CREW.town, mk = (m, x, feet, o = {}, flip = false) => { const cv = mF(m, Math.floor((now + m.name.length * 431) / 650) % 2, (now + m.name.length * 997) % 3300 < 110, o); if (flip) { g.save(); g.translate(x + 22, feet - 20); g.scale(-1, 1); g.drawImage(cv, 0, 0); g.restore(); } else g.drawImage(cv, x, feet - 20); return [x, feet]; };
  const shop = shopSprite().canvas(); MPOS.keeper = mk(T.keeper, VPOS.shop[0] + 24, GR - 13, opt.keeper || {}); g.drawImage(shop, 0, 36, 58, 16, VPOS.shop[0], GR - 52 + 36, 58, 16);
  MPOS.sci = mk(T.sci, VPOS.lab[0] + 18, GL, opt.sci || { book: Math.floor(now / 900) % 2 ? 2 : 1 }, true);
  // Sin puesto: descansa en la madriguera, metido en la cama (la manta se pinta por encima).
  MPOS.idle = mk(T.idle, 20, 100, opt.idle || { face: 'sleep' }); g.fillStyle = '#6a7ac8'; g.fillRect(23, 96, 16, 4); g.fillStyle = '#9aa8e8'; g.fillRect(23, 96, 16, 1); g.fillStyle = INK; g.fillRect(22, 96, 1, 4);
  if (!opt.noZ) { const z = Math.floor(now / 500) % 3; g.fillStyle = '#bfe8fd'; for (let i = 0; i <= z; i++) g.fillRect(36 + i * 3, 84 - i * 3, 2, 1); }
}
const MPOS = {};

// ---------- Bucle común: una simulación espejo para todas las demostraciones; cada teléfono dibuja su encuadre ----------
let SOUND_NEW = false; SOUND = false; // esta página no suena: ningún sonido nuevo está aprobado
const WORLD = { ched: document.createElement('canvas'), vill: document.createElement('canvas'), villBG: null, t: 0, hooks: [] };
function villageBG() { if (!WORLD.villBG) { const c = document.createElement('canvas'); c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; paintVillage(g); WORLD.villBG = c; } return WORLD.villBG; }
function renderVillage(now, opt) { const c = WORLD.vill; c.width = VW; c.height = VH; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(villageBG(), 0, 0); drawVillage(g, now, opt); return c; }
function worldTick(dt) { const now = performance.now(); dt = dt ?? Math.min(64, now - (WORLD.t || now)); WORLD.t = now; step41(dt); renderStopTo(1, now, WORLD.ched); renderVillage(now); for (const h of WORLD.hooks) h(now, dt); for (const P of PHONES) { if (P.tick) P.tick(now, dt); if (P.vis && P.live) P.render(now); } }
// Una imagen con su lienzo propio llamando a una función de dibujo del motor (que pinta en el ctx global).
function viaCtx(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; const was = ctx; ctx = g; try { fn(g); } finally { ctx = was; } return c; }
const frameOf = (src, fw, f = 0, fh) => { const i = im(src), c = document.createElement('canvas'); c.width = fw; c.height = fh || i.height; c.getContext('2d').drawImage(i, f * fw, 0, fw, c.height, 0, 0, fw, c.height); return c; };
// La página se monta cuando están cargadas todas las imágenes que usa (si no, salen miniaturas vacías).
function adReady(fn) { ['out/anims/swing_player.png', 'out/anims/swing_gold.png', 'out/anims/swing_miner.png', 'out/anims/phouse.png', 'out/anims/plab.png', 'out/anims/pdrill_3.png', 'out/sprites/big_gouda_c0.png', 'out/sprites/ic_coin.png', 'out/sprites/ic_pick.png', 'out/sprites/ic_flask.png', 'out/sprites/ic_raw_cheddar.png', 'out/sprites/ic_base_cheddar.png', 'out/sprites/ic_lot_cheddar.png'].forEach(im); Promise.all(Object.values(IMC).map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); })))).then(fn); }
