// ---------- ARTE V4.1: separar identidades ----------
// REFINE = industria (ladrillo, hierro, cobre, fuego, vapor, chimenea; nada de madera ni toldo).
// CHEESE = taller artesano (madera, alero de tablas, cuba, prensa de husillo, moldes, mesa, baldas de curado; sin toldo).
// SELL = comercio (puesto con toldo a rayas, mostrador con el queso a la vista, rótulo con la moneda, balanza, pizarra).
MAT.wood3 = ['#2a1a10', '#5a3a20', '#8a5e34', '#b48450', '#d8aa70'];
MAT.slate = ['#14161c', '#242832', '#363c4a', '#4c5466', '#6a7488'];
MAT.coin = ['#6a4206', '#b8800a', '#f2c02a', '#ffe070', '#fffbd0'];
MAT.green = ['#123a1c', '#1e5e2c', '#2e8a40', '#52b85e', '#98e8a0'];
// Alero de tablas de la quesería (en vez del toldo): tablas en perspectiva con su canto y un farol colgado.
const artEave = (W = 40) => art('eave' + W, () => { const p = Px(W, 8); p.poly('wood3', [[0, 2], [W, 2], [W - 2, 7], [2, 7]], { shade: 'top' }); for (let x = 3; x < W - 2; x += 5) p.vline(x, 3, 4, 1); p.rect('wood2', 0, 0, W, 2, { shade: 'top' }); return p.render(); });
// Rótulo de la quesería: tabla colgada con una cuña de queso (no la moneda de la tienda).
const artCheeseSign = () => art('csign', () => { const p = Px(14, 10); p.rect('wood', 0, 2, 14, 8); p.rect('rope', 3, 0, 1, 2); p.rect('rope', 10, 0, 1, 2); p.poly('cheese', [[3, 8], [11, 8], [11, 4], [3, 6]]); p.tone(5, 6, 1).tone(8, 6, 1); return p.render(); });
// Mesa de trabajo con un cuchillo y media rueda.
const artTable = () => art('table', () => { const p = Px(16, 10); p.rect('wood', 0, 3, 16, 2, { shade: 'top' }); p.rect('wood2', 1, 5, 2, 5); p.rect('wood2', 13, 5, 2, 5); p.ell('cheese', 6, 2.6, 3.4, 2); p.rect('steel', 10, 1, 4, 1, { shade: 'flat' }); p.rect('wood2', 13, 1, 2, 1); return p.render(); });
const artMolds = () => art('molds', () => { const p = Px(10, 9); for (let i = 0; i < 3; i++) { p.rect('wood', 1 + (i % 2), 6 - i * 3, 8, 3, { shade: 'cyl' }); p.hline(1 + (i % 2), 7 - i * 3, 8, 1); } return p.render(); });
// Paleta de remover (se mueve aparte, dentro de la cuba).
const artPaddle = (f) => art('paddle' + f, () => { const p = Px(8, 10); p.line('wood', f ? 6 : 2, 0, f ? 3 : 5, 8, { shade: 'flat' }); p.rect('wood', f ? 2 : 4, 7, 3, 2); return p.render(); });
// ---- SELL: el puesto de la tienda (superficie). 44 × 46, cabe entre el laboratorio y el pozo del montacargas ----
const artShop = () => art('shop', () => {
  const p = Px(44, 46);
  p.rect('wood3', 2, 12, 3, 34); p.rect('wood3', 39, 12, 3, 34);
  for (let x = 0; x < 44; x += 6) { const x1 = Math.min(44, x + 6); p.poly(Math.floor(x / 6) % 2 ? 'canvas' : 'cloth', [[x, 4], [x1, 4], [x1, 12], [(x + x1) / 2, 15], [x, 12]], { shade: 'top' }); }
  p.rect('wood2', 0, 2, 44, 3, { shade: 'top' });
  p.rect('wood', 4, 32, 36, 4, { shade: 'top' }); p.rect('wood3', 4, 36, 36, 10); for (let x = 7; x < 40; x += 6) p.vline(x, 37, 9, 1);
  // El queso a la venta va a la izquierda del mostrador, bajo la pizarra de precios; el tendero, detrás, a la derecha.
  p.rect('slate', 8, 17, 10, 8); p.hline(10, 19, 6, 3).hline(10, 21, 4, 3); p.rect('rope', 12, 15, 1, 2);
  return p.render();
});
// Rótulo de la tienda: una moneda colgada.
const artCoinSign = () => art('coinsign', () => { const p = Px(12, 13); p.rect('rope', 3, 0, 1, 3); p.rect('rope', 8, 0, 1, 3); p.ell('coin', 6, 8, 5.4, 5.4, { shade: 'top' }); p.ell('coin', 6, 8, 3.2, 3.2, { shade: 'flat' }); p.vline(6, 6, 5, 1); return p.render(); });

// ---------- PROPUESTA: una roca distinta por capítulo ----------
// Siluetas y materiales distintos, con lo que todas deben conservar: una cresta plana para el minero (línea verde), la cara
// de la veta donde muerde la broca (punto rojo) y su zona táctil (rectángulo). Dos estados: entera y con la veta abierta.
const ROCKS6 = [
  { id: 'cheddar', name: 'Cheddar', note: 'Canto rodado redondo: la roca aprobada de hoy (c0 y v5).', w: 54, h: 42, real: true, crest: [16, 36] },
  { id: 'gouda', name: 'Gouda', note: 'Losas apiladas, ancha y baja, con vetas de cera roja entre losa y losa.', w: 60, h: 34, mat: ['#2a3038', '#4e5866', '#76808e', '#a2acb8', '#d8dee6'], shape: (x, y, w, h) => { const band = Math.floor(y / 9); const inset = [8, 4, 1, 0][Math.min(3, band)]; return x >= inset && x < w - inset - (band === 0 ? 4 : 0); }, crest: [12, 44], cheese: 'cheese', seams: '#c0392b' },
  { id: 'brie', name: 'Brie', note: 'Montículo blando y achatado, con costra de moho blanco que se desborda un poco.', w: 56, h: 36, mat: ['#4a4438', '#8a8270', '#c8c0a8', '#e8e2d0', '#ffffff'], shape: (x, y, w, h) => { const t = Math.abs((x + 0.5 - w / 2) / (w / 2)), u = Math.max(0, t - 0.4) / 0.6; return y >= h * (0.16 + 0.8 * u * u); }, crest: [17, 39], cheese: 'cream', rind: true },
  { id: 'emmental', name: 'Emmental', note: 'Roca de lomo ancho con ojos (cavidades); la veta se abre en el centro.', w: 56, h: 42, mat: ['#4a4020', '#8a7a40', '#c8b060', '#e8d48a', '#fff4c0'], shape: (x, y, w, h) => ((x + 0.5 - w / 2) / (w / 2)) ** 4 + ((y + 0.5 - h) / h) ** 2 <= 1, crest: [17, 39], cheese: 'cheese', holes: [[11, 20, 4.2], [44, 30, 3.4], [16, 35, 2.4]] },
  { id: 'parmesan', name: 'Parmesano', note: 'Bloque facetado y granuloso, más alto, con brillos de cristal y una meseta arriba.', w: 50, h: 46, mat: ['#3e3020', '#7a6040', '#b8986a', '#dcc094', '#fff0c8'], shape: (x, y, w, h) => inPoly(x + 0.5, y + 0.5, [[3, h], [0, 26], [7, 9], [15, 2], [35, 2], [44, 11], [50, 28], [w, h]]), crest: [16, 34], cheese: 'aged', grain: true },
  { id: 'blue', name: 'Blue', note: 'Pizarra oscura con vetas minerales azules; los costados en sierra y la cresta llana.', w: 54, h: 44, mat: ['#14182a', '#262c46', '#3a4466', '#56648c', '#8a9ac0'], shape: (x, y, w, h) => { const c = x >= 17 && x <= 37, top = c ? 8 : 9 + Math.abs(((x * 7) % 14) - 7) * 0.7 + ((x + 0.5 - w / 2) / (w / 2)) ** 2 * 22; return y >= top; }, crest: [17, 37], cheese: 'cheese', veins: '#5ab0ff' },
];
// Luz de arriba a la izquierda, como la roca aprobada: tono por posición y canto superior iluminado.
function rockProposal(r, open) {
  if (r.real) return im(open ? ROCKV[4] : ROCKC[0]);
  return art('rp' + r.id + open, () => {
    MAT['rp' + r.id] = r.mat; const p = Px(r.w, r.h), inS = (x, y) => x >= 0 && y >= 0 && x < r.w && y < r.h && r.shape(x, y, r.w, r.h);
    p.fn('rp' + r.id, (x, y) => inS(x, y), 0, 0, r.w, r.h, { shade: 'flat' });
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { if (!inS(x, y)) continue; const d = (x / r.w) * 0.55 + (y / r.h) * 0.75 + (hash4(x, y, 7) - 0.5) * 0.1; p.tone(x, y, !inS(x, y - 1) ? 4 : d < 0.38 ? 3 : d < 0.82 ? 2 : 1); if (!inS(x + 1, y) || !inS(x, y + 1)) p.tone(x, y, 1); }
    for (let i = 0; i < 6; i++) { const x = 6 + Math.floor(hash4(i, r.w) * (r.w - 12)), y = 8 + Math.floor(hash4(i, r.h) * (r.h - 12)); bres(x, y, x + 3 - (i % 3) * 2, y + 5, (a, b) => inS(a, b) && inS(a, b - 2) && p.tone(a, b, 0)); }
    if (r.seams) for (let y = 9; y < r.h; y += 9) for (let x = 0; x < r.w; x++) if (inS(x, y)) p.px(x, y, r.seams);
    if (r.rind) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) if (inS(x, y) && (!inS(x, y - 1) || (!inS(x, y - 2) && hash4(x, y, 3) < 0.6))) p.px(x, y, '#ffffff');
    if (r.grain) for (let i = 0; i < 46; i++) { const x = Math.floor(hash4(i, 9) * r.w), y = Math.floor(hash4(i, 11) * r.h); if (inS(x, y) && inS(x, y - 1)) p.px(x, y, hash4(i, 5) < 0.3 ? '#fffbe8' : '#8a6c48'); }
    if (r.veins) for (let i = 0; i < 4; i++) bres(8 + i * 11, r.h - 3, 14 + i * 9, 16 + (i % 2) * 6, (a, b) => { if (inS(a, b) && inS(a, b - 1)) p.px(a, b, r.veins); });
    if (r.holes) for (const [cx, cy, rr] of r.holes) for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const q = (x * x + y * y) / (rr * rr); if (q < 1 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, y > rr * 0.4 ? '#7a6a30' : '#2a2010'); else if (q < 1.45 && y < 0 && inS(cx + x, cy + y)) p.px(cx + x, cy + y, MAT['rp' + r.id][1]); }
    if (open) { const cx = Math.round(r.w / 2), cy = r.h - 14; for (let y = -7; y <= 7; y++) for (let x = -11; x <= 11; x++) if ((x / 11) ** 2 + (y / 7) ** 2 <= 1) { const inner = (x / 9) ** 2 + ((y - 1) / 5.5) ** 2 <= 1; p.px(cx + x, cy + y, inner ? (y < -2 ? '#2a1a10' : MAT[r.cheese][y > 2 ? 2 : 3]) : '#1b1220'); } }
    return p.render();
  });
}
