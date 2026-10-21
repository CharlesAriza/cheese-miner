// ---------- HOUSE SLEEP · la secuencia completa (21-10-2026) ----------
// Pose aprobada: el ratón acurrucado (poseCanvas 'A'), tapado con la manta hasta la cabeza o destapado. De pie, el sprite
// oficial (andar con las patas a/b, quieto con su respiración y su parpadeo) y, en la cama, el mismo sprite oficial sin la
// mochila: se la cuelga en el pie de la cama al llegar y la recoge al irse. No hay ninguna otra pose.
// Capas, de atrás adelante: cama · almohada · mochila colgada · manta en reposo (doblada a los pies) · ratón · manta que lo
// tapa · mochila en la mano · Z. La manta solo cambia de capa en un fotograma en que no toca al ratón.

// El sprite oficial sin la mochila: se borran sus tres colores y se rehace el contorno (el de mouseCanvas: pal.o por fuera de
// la silueta). Nada más cambia.
function noPackCanvas(m, dy = 0, blink = false, o = {}) {
  const key = 'np' + m.name + dy + (blink ? 'b' : '') + JSON.stringify(o);
  return art(key, () => {
    const src = mouseCanvas(m, dy, blink, o), c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
    const x = c.getContext('2d'); x.drawImage(src, 0, 0); const im = x.getImageData(0, 0, c.width, c.height), d = im.data, W = c.width, H = c.height;
    const hex = (i) => '#' + [d[i], d[i + 1], d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
    const pack = new Set(PACKS[(hashS(m.name) >>> 3) % PACKS.length]), OUT = BASE.o;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] && (pack.has(hex(i)) || hex(i) === OUT)) d[i + 3] = 0;
    const body = (xx, yy) => xx >= 0 && yy >= 0 && xx < W && yy < H && d[(yy * W + xx) * 4 + 3] > 0, add = [];
    for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) if (!body(xx, yy) && (body(xx - 1, yy) || body(xx + 1, yy) || body(xx, yy - 1) || body(xx, yy + 1))) add.push((yy * W + xx) * 4);
    for (const i of add) { d[i] = 0x2a; d[i + 1] = 0x1d; d[i + 2] = 0x2e; d[i + 3] = 255; }
    x.putImageData(im, 0, 0); return c;
  });
}
// La mochila como objeto: colgada del pie de la cama (la misma que en la escena estática aprobada) o en la mano.
function packOnPost(g, bx, by, m) { const pk = packOf(m); g.fillStyle = INK; g.fillRect(bx + 1, by + 10, 6, 7); g.fillStyle = pk[1]; g.fillRect(bx + 2, by + 11, 4, 5); g.fillStyle = pk[0]; g.fillRect(bx + 2, by + 11, 4, 1); g.fillStyle = pk[2]; g.fillRect(bx + 2, by + 14, 4, 1); }
function packHeld(g, x, y, m) { const pk = packOf(m); g.fillStyle = INK; g.fillRect(x, y, 6, 6); g.fillStyle = pk[1]; g.fillRect(x + 1, y + 1, 4, 4); g.fillStyle = pk[0]; g.fillRect(x + 1, y + 1, 4, 1); g.fillStyle = pk[2]; g.fillRect(x + 1, y + 3, 4, 1); }

// Guion (ms). El bucle dura 12,2 s; dormir es la parte larga.
const BT = { walkIn: 1100, hang: 1400, hopUp: 1900, walkBed: 2400, turnL: 2600, turnR: 2800, curl: 3000, blanketUp: 3900, sleep: 7900, wake: 8400, blanketDown: 9300, stand: 9500, walkFoot: 10000, takePack: 10300, hopDown: 10800, walkOut: 11900, end: 12200 };
const PH_NAMES = [['walkIn', 'Entra andando'], ['hang', 'Cuelga la mochila en el pie de la cama'], ['hopUp', 'Sube de un salto por encima del pie'], ['walkBed', 'Anda por el colchón'], ['turnL', 'Da la vuelta (mira atrás)'], ['turnR', '… y vuelve a mirar a la almohada'], ['curl', 'Se acurruca'], ['blanketUp', 'La manta sube en tres pasos'], ['sleep', 'Duerme: respira y salen las Z'], ['wake', 'Abre los ojos'], ['blanketDown', 'La manta vuelve a los pies en tres pasos'], ['stand', 'Se levanta, entero y a la vista'], ['walkFoot', 'Anda hasta el pie de la cama'], ['takePack', 'Recoge la mochila'], ['hopDown', 'Baja de un salto por delante del pie'], ['walkOut', 'Se va'], ['end', 'Pausa y vuelve a empezar']];
const phaseAt = (t) => PH_NAMES.findIndex(([k]) => t < BT[k]);
// Posiciones (relativas al pie de la cama bx). Sobre el colchón el ratón empieza en bx + 6 para no pisar el pie.
// hop: altura del salto; 13 px es lo mínimo para pasar por encima del pie sin tocarlo (medido con checkBedLoop); 15 deja margen.
const BP = { start: -48, door: -19, bedFoot: 6, bedMid: 18, out: -24, gone: -62, hop: 15 };

// Describe un fotograma: qué sprite, dónde, la manta (cuánto tapa y en qué capa), la mochila y las Z.
function bedFrame(t, m, bx, by) {
  const mat = by + 14, floor = by + 22, ph = phaseAt(t), P = PH_NAMES[ph][0], f = {};
  const A = poseCanvas(m, 'A'), csx = bx + SLEEP_X - A.width, csy = mat - A.height + 1;
  const breath = Math.floor((t + m.name.length * 431) / 650) % 2, blink = (t + m.name.length * 997) % 3300 < 110, legs = { legs: Math.floor(t / 120) % 2 ? 'a' : 'b' };
  const span = (a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const stand = (x, feet, flip, pack, o = {}, still = false) => { const dy = still ? breath : 0; f.mouse = { key: pack ? 'oficial' : 'oficial sin mochila', cv: pack ? mF(m, o.legs ? 0 : dy, blink, o) : noPackCanvas(m, o.legs ? 0 : dy, blink, o), x, y: feet - 20, flip }; };
  // Salto: primero sube y luego avanza, para pasar por encima del pie de la cama sin atravesarlo.
  const hop = (k, x0, f0, x1, f1, up) => { const e = up ? Math.min(1, Math.max(0, (k - 0.3) / 0.55)) : Math.min(1, Math.max(0, (k - 0.15) / 0.55)); return [Math.round(x0 + (x1 - x0) * e), Math.round(f0 + (f1 - f0) * k - BP.hop * Math.sin(Math.PI * k))]; };
  f.pack = 'back'; f.blanket = { cover: 0, layer: 'below', lift: 0 }; f.z = false; f.phase = ph;
  if (P === 'walkIn') stand(Math.round(bx + BP.start + (BP.door - BP.start) * span(0, BT.walkIn)), floor, false, true, legs);
  else if (P === 'hang') { const held = t < BT.walkIn + 150; stand(bx + BP.door, floor, false, false, {}, true); f.pack = held ? 'held' : 'post'; f.held = [bx + BP.door + 15, floor - 13]; }
  else if (P === 'hopUp') { const [x, feet] = hop(span(BT.hang, BT.hopUp), bx + BP.door, floor, bx + BP.bedFoot, mat, true); stand(x, feet, false, false); f.pack = 'post'; f.air = true; }
  else if (P === 'walkBed') { stand(Math.round(bx + BP.bedFoot + (BP.bedMid - BP.bedFoot) * span(BT.hopUp, BT.walkBed)), mat, false, false, legs); f.pack = 'post'; }
  else if (P === 'turnL') { stand(bx + BP.bedMid, mat - (t - BT.walkBed < 80 ? 1 : 0), true, false); f.pack = 'post'; f.air = t - BT.walkBed < 80; }
  else if (P === 'turnR') { stand(bx + BP.bedMid, mat - (t - BT.turnL < 80 ? 1 : 0), false, false); f.pack = 'post'; f.air = t - BT.turnL < 80; }
  else {
    f.pack = 'post';
    const curled = (eyes, settle = 0) => { f.mouse = { key: eyes === 'open' ? 'acurrucado (ojos abiertos)' : 'acurrucado', cv: poseCanvas(m, 'A', eyes === 'open' ? { eyes: 'open' } : {}), x: csx, y: csy - settle, flip: false }; };
    if (P === 'curl') curled(t < BT.turnR + 120 ? 'open' : 'sleep', t < BT.turnR + 90 ? 1 : 0);
    else if (P === 'blanketUp') { curled('sleep'); const s = Math.min(3, 1 + Math.floor(span(BT.curl, BT.blanketUp - 300) * 3)); f.blanket = { cover: s / 3, layer: 'above', lift: 0 }; }
    else if (P === 'sleep') { curled('sleep'); f.blanket = { cover: 1, layer: 'above', lift: (t - BT.blanketUp) % 2400 > 1600 ? 1 : 0 }; f.z = true; }
    else if (P === 'wake') { curled(t < BT.sleep + 120 ? 'sleep' : 'open'); f.blanket = { cover: 1, layer: 'above', lift: 0 }; }
    else if (P === 'blanketDown') { curled('open'); const s = Math.min(3, 1 + Math.floor(span(BT.wake, BT.blanketDown - 300) * 3)), c = (3 - s) / 3; f.blanket = { cover: c, layer: c > 0 ? 'above' : 'below', lift: 0 }; }
    else if (P === 'stand') { stand(bx + BP.bedMid, mat - (t - BT.blanketDown < 90 ? 1 : 0), true, false, {}, true); f.air = t - BT.blanketDown < 90; }
    else if (P === 'walkFoot') stand(Math.round(bx + BP.bedMid + (BP.bedFoot - BP.bedMid) * span(BT.stand, BT.walkFoot)), mat, true, false, legs);
    else if (P === 'takePack') { const held = t < BT.walkFoot + 150; stand(bx + BP.bedFoot, mat, true, !held, {}, true); f.pack = held ? 'held' : 'back'; f.held = [bx + BP.bedFoot + 1, mat - 13]; }
    else if (P === 'hopDown') { const [x, feet] = hop(span(BT.takePack, BT.hopDown), bx + BP.bedFoot, mat, bx + BP.out, floor, false); stand(x, feet, true, true); f.pack = 'back'; f.air = true; }
    else if (P === 'walkOut') { stand(Math.round(bx + BP.out + (BP.gone - BP.out) * span(BT.hopDown, BT.walkOut)), floor, true, true, legs); f.pack = 'back'; }
    else { f.mouse = null; f.pack = 'back'; }
  }
  f.csx = csx; f.csy = csy; return f;
}
// Manta: doblada a los pies (cover 0) o extendida desde el pie hasta la cara del ratón acurrucado (cover 1), por pasos.
function drawBlanketB(g, bx, by, b, csx, csy, m) {
  const mat = by + 14;
  if (b.cover <= 0) { blanketFolded(g, bx, mat); return; }
  const A = poseCanvas(m, 'A'), T = topsOf(A, false), x1 = Math.round(bx + 5 + (csx + 10 - bx - 5) * b.cover);
  blanket3(g, bx + 5, (x) => Math.min(mat - 2, x >= csx && x - csx < T.length ? csy + T[x - csx] - (b.lift && x >= csx + 2 && x <= csx + 9 ? 1 : 0) : mat - 2), () => x1, mat, 1, () => false, false);
}
function drawMouseB(g, mo) { if (!mo) return; if (mo.flip) { g.save(); g.translate(mo.x + mo.cv.width, mo.y); g.scale(-1, 1); g.drawImage(mo.cv, 0, 0); g.restore(); } else g.drawImage(mo.cv, mo.x, mo.y); }
function drawBedFrame(g, t, m, bx, by) {
  const f = bedFrame(t, m, bx, by), mat = by + 14;
  g.drawImage(bed3(), bx, by); g.drawImage(pillow3(), bx + 30, mat - 5);
  if (f.pack === 'post') packOnPost(g, bx, by, m);
  if (f.blanket.layer === 'below') drawBlanketB(g, bx, by, f.blanket, f.csx, f.csy, m);
  drawMouseB(g, f.mouse);
  if (f.blanket.layer === 'above') drawBlanketB(g, bx, by, f.blanket, f.csx, f.csy, m);
  if (f.pack === 'held') packHeld(g, f.held[0], f.held[1], m);
  if (f.z) zzz(g, f.csx + 14, f.csy - 3, t);
  return f;
}

// ---------- Comprobación de todo el bucle, fotograma a fotograma (cada 16 ms) ----------
// Pinta por separado el ratón, la manta, el pie y el cabecero, y cuenta: manta encima del ratón sin estar tapándolo; ratón
// encima de la manta mientras lo tapa; cambios de capa con la manta tocando al ratón; ratón dentro del pie o del cabecero;
// ratón en el aire fuera de los saltos y de los saltitos; sprites que no son los aprobados o no van a escala 1; y el mayor
// salto entre dos fotogramas seguidos.
function checkBedLoop(m, bx, by, W, H) {
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = false; return [c, x]; };
  const mask = (draw) => { const [c, x] = mk(); draw(x); const d = x.getImageData(0, 0, W, H).data, out = new Uint8Array(W * H); for (let i = 0; i < W * H; i++) out[i] = d[i * 4 + 3] > 127 ? 1 : 0; return out; };
  const and = (a, b) => { let n = 0; for (let i = 0; i < a.length; i++) if (a[i] && b[i]) n++; return n; };
  const bedOnly = mask((x) => x.drawImage(bed3(), bx, by)), foot = new Uint8Array(W * H), head = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!bedOnly[i]) continue; if (x <= bx + 4 && y < by + 14) foot[i] = 1; if (x >= bx + 41 && y < by + 14) head[i] = 1; } // la madera del pie y del cabecero, sin su contorno
  const APPROVED = new Set(['oficial', 'oficial sin mochila', 'acurrucado', 'acurrucado (ojos abiertos)']);
  const r = { frames: 0, overBlanketWrong: 0, underBlanketWrong: 0, layerSwitchTouching: 0, footHits: 0, headHits: 0, floating: 0, notApproved: 0, maxJump: 0, maxJumpAt: 0, switches: [] };
  let prev = null, prevLayer = null, prevAnchor = null;
  for (let t = 0; t < BT.end; t += 16) {
    const f = bedFrame(t, m, bx, by); r.frames++;
    if (!f.mouse) { prevAnchor = null; prevLayer = f.blanket.layer; continue; }
    if (!APPROVED.has(f.mouse.key) || !(f.mouse.cv.width === 22 || f.mouse.cv.width === poseCanvas(m, 'A').width)) r.notApproved++;
    const mm = mask((x) => drawMouseB(x, f.mouse)), bm = mask((x) => drawBlanketB(x, bx, by, f.blanket, f.csx, f.csy, m)), ov = and(mm, bm);
    const covering = f.blanket.cover > 0;
    if (f.blanket.layer === 'above' && ov && !covering) r.overBlanketWrong++;
    if (f.blanket.layer === 'below' && ov && covering) r.underBlanketWrong++;
    if (prevLayer && prevLayer !== f.blanket.layer) { r.switches.push(t); if (ov) r.layerSwitchTouching++; }
    prevLayer = f.blanket.layer;
    if (and(mm, foot)) r.footHits++; if (and(mm, head)) r.headHits++;
    // Apoyo: la fila más baja del ratón toca el colchón (o se hunde 1 px, acurrucado) o el suelo, salvo en los saltos.
    let bottom = -1, minx = W, maxx = 0; for (let i = 0; i < mm.length; i++) if (mm[i]) { const y = (i / W) | 0, x = i % W; bottom = Math.max(bottom, y); minx = Math.min(minx, x); maxx = Math.max(maxx, x); }
    const onBed = minx > bx + 4 && maxx < bx + 41, surf = onBed ? by + 14 : by + 22;
    if (!f.air && !(bottom === surf - 1 || bottom === surf)) r.floating++;
    const anchor = [(minx + maxx) / 2, bottom];
    if (prevAnchor) { const j = Math.hypot(anchor[0] - prevAnchor[0], anchor[1] - prevAnchor[1]); if (j > r.maxJump) { r.maxJump = j; r.maxJumpAt = t; } }
    prevAnchor = anchor;
  }
  return r;
}
