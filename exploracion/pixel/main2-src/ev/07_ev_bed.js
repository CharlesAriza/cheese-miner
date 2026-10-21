// ---------- HOUSE · la cama (THE BED), corregida ----------
// El ratón sigue siendo el sprite oficial, sin tocar: se ve su cabeza (con la cara oficial de dormir) apoyada en la almohada,
// a la altura del colchón, y el resto queda bajo la manta. La manta es un bulto largo (el cuerpo estirado hasta los pies),
// con el embozo blanco doblado bajo la barbilla, su sombra y su caída por el lado; respira: el bulto sube 1 px cada 2,4 s.
// Las Z son de píxel con contorno, de tres tamaños, salen de la cabeza en diagonal y se van por pasos (sin transparencias).
// Despertar: abre los ojos (cara oficial de sorpresa) y la oreja se mueve; aparta la manta en tres pasos; se pone de pie
// junto a la cama con un saltito y se va andando. Una cama: una plaza (THE BED y TRAINING ROOM la comparten).
const Z5 = ['#####', '...#.', '..#..', '.#...', '#####'], Z4 = ['####', '..#.', '.#..', '####'], Z3 = ['###', '.#.', '###'];
const zGlyph = (rows) => evArt('z' + rows.length, () => { const b = PB(rows[0].length + 2, rows.length + 2); b.stamp(rows, { '#': '#e8f6ff' }, 1, 1); b.outline(); return b.canvas(); });
// La cabeza: las 11 filas de arriba del sprite oficial (sombrero, oreja, cara). El cuerpo no se dibuja: está bajo la manta.
const headOf2 = (m, o) => evArt('hd' + m.name + JSON.stringify(o), () => { const src = mouseCanvas(m, 0, false, o), c = document.createElement('canvas'); c.width = 20; c.height = 11; c.getContext('2d').drawImage(src, 0, 0, 20, 11, 0, 0, 20, 11); return c; });
// La cama, 52 × 24: cabecero alto a la izquierda, colchón, pie de cama bajo a la derecha.
const bedSprite = () => evArt('bed2', () => {
  const c = PB(54, 24), P = P2;
  vol(c, 0, 1, 5, 23, P.woo, { side: 1, ao: 1 }); c.ell(2.5, 1.5, 3, 2.2, P.woo[1]); c.hline(1, 7, 3, P.woo[3]); c.hline(1, 12, 3, P.woo[3]);
  vol(c, 49, 11, 5, 13, P.woo, { side: 1, ao: 1 }); c.ell(51.5, 11, 2.6, 1.8, P.woo[1]);
  vol(c, 5, 16, 44, 4, P.cre, { side: 1, ao: 1, face: 1 }); vol(c, 5, 20, 44, 2, P.woo, { side: 0, ao: 0 }); c.hline(5, 21, 44, P.woo[4]);
  for (const x of [7, 46]) c.rect(x, 22, 2, 2, P.woo[3]);
  closeGaps(c); c.outline(); return c.canvas();
});
const PILLOW = () => evArt('pillow', () => { const c = PB(14, 7); c.ell(7, 3.5, 6.6, 3.2, (x, y) => (y < 2 ? '#fffdf2' : y < 5 ? '#f4ecd6' : '#dccc9e')); c.hline(2, 3, 2, '#dccc9e'); closeGaps(c); c.outline(); return c.canvas(); });
// Manta: bulto largo desde la barbilla (x0) hasta el pie de la cama (x1). lift = respiración (0/1).
function blanket2(g, x0, x1, base, lift) {
  const R2 = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); }, G = ['#d8ecff', '#8ab4ec', '#5a84cc', '#3a5aa0', '#243868'];
  for (let xx = x0; xx < x1; xx++) { const u = (xx - x0) / Math.max(1, x1 - x0), h = Math.round((u < 0.45 ? 6 : 6 - (u - 0.45) * 5) + (u < 0.5 ? lift : 0)); R2(xx, base - h, 1, h + 3, G[2]); R2(xx, base - h + 1, 1, 1, G[1]); if (u > 0.55) R2(xx, base - h + 2, 1, 1, G[3]); R2(xx, base - h, 1, 1, INK); if ((xx - x0) % 7 === 3) R2(xx, base - h + 3, 1, h, G[3]); }
  R2(x1, base - 3, 1, 7, INK); R2(x1 - 1, base + 1, 2, 3, G[3]);
  const eh = 7 + lift; R2(x0 - 1, base - eh, 6, eh + 3, INK); R2(x0, base - eh + 1, 4, eh + 1, '#fffdf2'); R2(x0 + 3, base - eh + 1, 1, eh + 1, '#dccc9e'); R2(x0, base - eh + 1, 4, 1, '#ffffff');
  R2(x0, base + 3, x1 - x0, 1, G[4]);
}
// t en ms dentro del bucle de 10 s: 0–6,5 s duerme; 6,5–7,1 s abre los ojos; 7,1–7,7 s aparta la manta (3 pasos); se levanta y se va.
function drawBed(g, x, y, m, t, opt = {}) {
  const phase = opt.sleepOnly ? 'sleep' : t < 6500 ? 'sleep' : t < 7100 ? 'eyes' : t < 7700 ? 'out' : 'gone', base = y + 17;
  g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9);
  const lift = phase === 'sleep' && t % 2400 > 1500 ? 1 : 0, step = phase === 'out' ? 1 + Math.min(2, Math.floor(((t - 7100) / 600) * 3)) : phase === 'gone' ? 3 : 0;
  if (phase === 'sleep' || phase === 'eyes' || (phase === 'out' && step < 3)) g.drawImage(headOf2(m, phase === 'sleep' ? { face: 'sleep' } : { face: 'wow', ear: t % 300 < 150 }), x + 4, y + 5 - (phase === 'eyes' && t < 6650 ? 1 : 0));
  // La manta se aparta hacia los pies a pasos (queda doblada al final de la cama).
  blanket2(g, x + 22 + step * 6, x + 49, base, step ? 0 : lift);
  if (phase === 'sleep') { const z = (t % 2700) / 2700; [[Z3, 0], [Z4, 0.33], [Z5, 0.66]].forEach(([rows, d], i) => { const k = (z + 1 - d) % 1; if (k > 0.78) return; g.drawImage(zGlyph(rows), x + 18 + i * 5 + Math.round(k * 4), y - 2 - i * 5 - Math.round(k * 7)); }); }
  if (phase === 'out' && step >= 3) g.drawImage(mF(m, 0, false, { face: 'happy' }), x + 52, y + 1);
  if (phase === 'gone') { const k = Math.min(1, (t - 7700) / 2300), walk = Math.round(k * 38), hop = k < 0.04 ? 2 : k < 0.08 ? 1 : 0; g.drawImage(mF(m, 0, false, k < 0.1 ? { face: 'happy' } : { legs: Math.floor(t / 120) % 2 ? 'a' : 'b' }), x + 52 + walk, y + 2 - hop); }
}
// La plaza de la cama con un ratón que tiene puesto: en el juego sigue trabajando mientras le tratan, así que no puede estar
// también en la cama. Se ve la cama abierta y su retrato en el cabecero (propuesta).
function drawBedOccupied(g, x, y, m, t) {
  g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9); blanket2(g, x + 34, x + 49, y + 17, 0);
  g.fillStyle = '#1b1220'; g.fillRect(x - 1, y - 4, 12, 11); g.fillStyle = BRS[2]; g.fillRect(x, y - 3, 10, 9); g.fillStyle = '#3a2a40'; g.fillRect(x + 1, y - 2, 8, 7);
  const face = mouseCanvas(m, 0, false, {}); g.drawImage(face, 4, 1, 14, 10, x + 1, y - 2, 8, 6);
}
// Pose descartada (A): el sprite oficial entero girado 90°. Es casi cuadrado, así que tumbado sigue pareciendo un bloque.
const lyingOf = (m, face) => evArt('ly2' + m.name + face, () => { const src = mouseCanvas(m, 0, false, { face }), c = document.createElement('canvas'); c.width = src.height; c.height = src.width; const g = c.getContext('2d'); g.translate(0, src.width); g.rotate(-Math.PI / 2); g.drawImage(src, 0, 0); return c; });
function bedRotated(g, x, y, m) { g.drawImage(bedSprite(), x, y); g.drawImage(PILLOW(), x + 4, y + 9); g.drawImage(lyingOf(m, 'sleep'), x + 6, y + 2); blanket2(g, x + 18, x + 49, y + 17, 0); g.drawImage(bedSprite(), 5, 16, 44, 6, x + 5, y + 16, 44, 6); }
