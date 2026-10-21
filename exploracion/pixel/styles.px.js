// Exploración de pixel art (NO es código del juego). La misma quesería y el mismo ratón en tres
// niveles de acabado, para elegir estilo: 1 detallado (doble resolución), 2 pulido (el de
// buildings.px.js y mice.px.js, no se redibuja aquí) y 3 sencillo.
// Construir: node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build styles.px.js
pal({ o: "#2a1a2a", k: "#2b1d12" })
const N = 8

// ---------- utilidades ----------
function ell(c, cx, cy, rx, ry, col, maxY = 1e9, mask) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
    if (y > maxY) continue
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / (rx + 0.3), dy = (y + 0.5 - cy) / (ry + 0.3)
      if (dx * dx + dy * dy <= 1 && (!mask || mask(x, y))) c.px(x, y, col)
    }
  }
}
const DITH = (x, y) => (x + y) % 2 === 0
const SPARSE = (x, y) => x % 2 === 0 && y % 2 === 0
function smoke(c, x, y, fr, { n = 3, rise = 24, drift = 7, size = 4, tones, d = 0 } = {}) {
  for (let k = 0; k < n; k++) {
    const a = ((fr + d + (k * N) / n) % N) / N
    const cx = x + a * drift, cy = y - a * rise, r = 1 + a * size
    const mask = a < 0.6 ? null : a < 0.85 ? DITH : SPARSE
    ell(c, cx + 1, cy + 1, r, r, tones[2], 1e9, mask)
    ell(c, cx, cy, r, r, tones[1], 1e9, mask)
    if (!mask && r > 1.8) ell(c, cx - r * 0.35, cy - r * 0.35, r * 0.4, r * 0.4, tones[0])
  }
}

// ================= 1 · DETALLADO =================
// Rampas con cambio de tono: luces cálidas, sombras hacia el morado. Claro -> oscuro.
const PL = ["#fff6de", "#f2dfb4", "#d9bd8e", "#b0906e", "#7a6060"]          // revoque
const WD = ["#c98a52", "#9a5e36", "#6e3c2a", "#472228"]                     // madera
const RF = ["#ff9e6e", "#e8623e", "#bf3e3c", "#8c2a42", "#5a1e3a"]          // tejas
const ST = ["#e2ddd6", "#b8b0aa", "#8e8590", "#655c70", "#3f3850"]          // piedra
const BR = ["#e8956a", "#c2603f", "#933c38", "#5e2634"]                     // ladrillo
const WM = ["#fff8c8", "#ffdd70", "#ffad3c", "#e0702a"]                     // luz cálida
const CH = ["#fff3a0", "#ffd43a", "#f5ab12", "#c97a08", "#8a4a10"]          // queso
const IR = ["#a3a9bc", "#646a80", "#363a4c"]                                // hierro
const GR = ["#b4e86a", "#72c446", "#3f8f3a", "#285a34"]                     // hierba
const SMK = ["#ffffff", "#eef0f6", "#c3c8d8"]

function stoneCourse(c, x, y, w, h, widths, off) {
  let cx = x - off
  let i = 0
  while (cx < x + w) {
    const bw = widths[i++ % widths.length]
    const x0 = Math.max(cx, x), x1 = Math.min(cx + bw - 1, x + w - 1)
    if (x1 > x0) {
      c.rect(x0, y, x1 - x0, h - 1, ST[2])
      c.hline(x0, y, x1 - x0, ST[1])
      c.vline(x0, y, h - 1, ST[1])
      c.hline(x0 + 1, y + h - 2, x1 - x0 - 1, ST[3])
      c.px(x0, y, ST[0])
    }
    c.vline(x1, y, h, ST[4])
    cx += bw
  }
  c.hline(x, y + h - 1, w, ST[4])
}

function richCheesery(c, fr) {
  const G = 123
  // Chimenea de ladrillo, detrás del tejado.
  const chx = 70, chy = G - 96
  c.rect(chx, chy, 12, 30, BR[3])
  for (let r = 0; r < 10; r++) {
    const y = chy + 1 + r * 3
    c.rect(chx + 1, y, 10, 2, BR[1])
    for (let x = chx + 1 + (r % 2 ? 3 : 0); x < chx + 11; x += 6) {
      c.px(x, y, BR[0])
      c.vline(x + 5, y, 2, BR[3])
    }
  }
  c.rect(chx + 1, chy + 1, 2, 28, BR[0])
  c.rect(chx + 9, chy + 1, 2, 28, BR[2])
  c.rect(chx - 2, chy - 3, 16, 4, ST[3])
  c.hline(chx - 2, chy - 3, 16, ST[1])
  c.hline(chx - 2, chy - 2, 16, ST[2])
  smoke(c, chx + 6, chy - 7, fr, { tones: SMK })

  // Tejado de tejas: hileras de 4 px, festón abajo, luz arriba a la izquierda.
  const eave = G - 52
  for (let r = 0; r < 7; r++) {
    const y0 = eave - 4 * (r + 1)
    const l = Math.round(8 + r * 3.5), rt = Math.round(104 - r * 3.5)
    for (let x = l; x <= rt; x++) {
      const tx = (x - l + (r % 2 ? 4 : 0)) % 8
      const side = x > 70 ? 1 : 0
      const base = (r >= 4 ? 1 : 2) + side
      for (let yy = 0; yy < 4; yy++) {
        let t = base
        if (yy === 0) t = base - 1
        if (tx === 7) t = base + 1
        if (yy === 3 && (tx === 0 || tx === 7)) t = 4
        if (yy === 3 && tx !== 0 && tx !== 7) t = base + 1
        if (x > 66 && x <= 70 && DITH(x, yy)) t = base + 1
        c.px(x, y0 + yy, RF[Math.min(4, t)])
      }
    }
    c.px(l, y0, RF[4]); c.vline(l, y0, 4, RF[3]); c.vline(rt, y0, 4, RF[4])
  }
  // Cumbrera y alero.
  c.rect(29, eave - 31, 55, 3, RF[4])
  c.hline(30, eave - 31, 53, RF[2])
  c.rect(6, eave, 100, 3, WD[2])
  c.hline(6, eave, 100, WD[1])
  c.hline(6, eave + 2, 100, WD[3])

  // Pared de revoque con entramado de madera.
  const wl = 16, wr = 96, wt = eave + 3, wb = G - 12
  c.rect(wl, wt, wr - wl, wb - wt, PL[1])
  // Sombra del alero y suciedad que sube del suelo, en trama.
  for (let y = wt; y < wt + 5; y++) for (let x = wl; x < wr; x++) if (y < wt + 2 || (y < wt + 4 ? DITH(x, y) : SPARSE(x, y))) c.px(x, y, PL[2])
  for (let y = wb - 4; y < wb; y++) for (let x = wl; x < wr; x++) if (y >= wb - 1 || (y >= wb - 3 ? DITH(x, y) : SPARSE(x, y))) c.px(x, y, PL[2])
  const beam = (x, y, w, h) => {
    c.rect(x, y, w, h, WD[1])
    if (w > h) { c.hline(x, y, w, WD[0]); c.hline(x, y + h - 1, w, WD[2]) }
    else { c.vline(x, y, h, WD[0]); c.vline(x + w - 1, y, h, WD[2]) }
    // Veta de la madera: rayas cortas a lo largo de la pieza.
    if (w > h) for (let i = x + 3; i < x + w - 4; i += 9) c.hline(i, y + 1 + (i % 2), 3, WD[2])
    else for (let i = y + 4; i < y + h - 4; i += 9) c.vline(x + 1 + (i % 2), i, 3, WD[2])
  }
  beam(wl, wt, wr - wl, 4)
  beam(wl, wb - 3, wr - wl, 4)
  for (const px of [wl, 54, wr - 4]) beam(px, wt, 4, wb - wt)
  beam(20, G - 30, 34, 3)
  c.line(22, wb - 4, 32, G - 28, WD[1], 3)
  c.line(52, wb - 4, 42, G - 28, WD[1], 3)

  // Ventana con el caldero dentro; el fuego tiñe el cristal.
  const gx = 28, gy = G - 44, gw = 17, gh = 11
  c.rect(gx - 2, gy - 2, gw + 4, gh + 4, WD[3])
  c.rect(gx - 1, gy - 1, gw + 2, gh + 2, WD[1])
  const flick = [0, 1, 0, 2, 1, 0, 1, 2][fr]
  for (let y = 0; y < gh; y++) c.hline(gx, gy + y, gw, WM[Math.min(3, Math.floor((y / gh) * 3) + (flick === 2 && y > 6 ? 1 : 0))])
  ell(c, gx + 8, gy + gh, 6, 4, "#3a2230", gy + gh - 1)
  c.hline(gx + 3, gy + gh - 4, 11, "#5a3a40")
  c.rect(gx + 5, gy + gh - 1, 7, 1, flick ? WM[0] : WM[1])
  c.vline(gx + 8, gy, gh, WD[2])
  c.hline(gx, gy + 5, gw, WD[2])
  c.line(gx + 1, gy + 3, gx + 3, gy + 1, "#ffffff")
  c.rect(gx - 3, gy + gh + 2, gw + 6, 2, WD[0])
  c.hline(gx - 3, gy + gh + 3, gw + 6, WD[2])

  // Puerta de tablones con bisagras y arco.
  const dx = 63, dy = G - 42, dw = 18, dh = 30
  c.rect(dx - 1, dy - 1, dw + 2, dh + 1, WD[3])
  c.rect(dx, dy, dw, dh, WD[1])
  for (let x = dx; x < dx + dw; x += 4) { c.vline(x, dy, dh, WD[0]); c.vline(x + 3, dy, dh, WD[2]) }
  for (const [ox, w] of [[0, 4], [0, 2], [dw - 4, 4], [dw - 2, 2]]) c.rect(dx + ox, dy + (w === 4 ? 0 : 1) - 1, w, 1, PL[1])
  c.px(dx, dy, WD[3]); c.px(dx + dw - 1, dy, WD[3])
  for (const hy of [dy + 6, dy + dh - 8]) { c.rect(dx, hy, 9, 2, IR[1]); c.hline(dx, hy, 9, IR[0]); c.px(dx + 8, hy + 1, IR[2]) }
  c.rect(dx + dw - 5, dy + 15, 2, 3, IR[1]); c.px(dx + dw - 5, dy + 15, IR[0])
  c.rect(dx - 3, G - 12, dw + 6, 2, ST[1]); c.hline(dx - 3, G - 11, dw + 6, ST[3])

  // Farol junto a la puerta: su luz tiñe el revoque.
  const lx = 86, ly = G - 38
  for (let y = ly - 6; y < ly + 12; y++) for (let x = lx - 6; x < lx + 10; x++) {
    const dd = Math.hypot(x - lx - 2, y - ly - 3)
    if (x >= wl + 4 && x < wr - 4 && dd < 7 && (dd < 4 || DITH(x, y))) c.px(x, y, PL[0])
  }
  c.hline(lx + 1, ly - 3, 3, IR[2]); c.vline(lx + 2, ly - 3, 2, IR[2])
  c.rect(lx, ly - 1, 5, 8, IR[2])
  c.rect(lx + 1, ly, 3, 5, fr % 4 < 2 ? WM[0] : WM[1])
  c.px(lx + 2, ly + 2, "#ffffff")
  c.hline(lx, ly + 6, 5, IR[1])

  // Cartel colgado con una cuña de queso.
  c.rect(96, G - 47, 11, 2, IR[2]); c.px(106, G - 48, IR[2]); c.hline(96, G - 47, 10, IR[1])
  c.vline(98, G - 45, 3, IR[1]); c.vline(104, G - 45, 3, IR[1])
  c.rect(95, G - 42, 13, 10, WD[3])
  c.rect(96, G - 41, 11, 8, WD[0])
  c.hline(96, G - 34, 11, WD[2])
  c.rect(98, G - 39, 7, 4, CH[1]); c.hline(98, G - 39, 7, CH[0]); c.hline(98, G - 36, 7, CH[3])
  c.px(100, G - 38, CH[3]); c.px(103, G - 37, CH[3]); c.px(104, G - 39, WD[0]); c.px(105, G - 39, WD[0])

  // Zócalo de piedra en tres hiladas con juntas al tresbolillo; algo de musgo.
  const fl = 14, fw = 84
  c.rect(fl - 1, G - 12, fw + 2, 13, ST[4])
  stoneCourse(c, fl, G - 11, fw, 4, [11, 9, 13, 10, 12], 0)
  stoneCourse(c, fl, G - 7, fw, 4, [9, 12, 10, 13, 11], 5)
  stoneCourse(c, fl, G - 3, fw, 4, [12, 10, 11, 9, 13], 2)
  c.rect(dx - 3, G - 12, dw + 6, 2, ST[1]); c.hline(dx - 3, G - 11, dw + 6, ST[3])
  for (const [mx, my] of [[16, G - 1], [17, G - 2], [18, G - 1], [52, G - 5], [53, G - 5], [90, G - 1], [91, G - 2]]) c.px(mx, my, GR[2])

  // Caja con ruedas de queso.
  c.rect(0, G - 10, 15, 11, WD[3])
  for (let y = G - 9; y < G; y += 3) { c.rect(1, y, 13, 2, WD[1]); c.hline(1, y, 13, WD[0]) }
  c.px(2, G - 8, IR[1]); c.px(12, G - 8, IR[1]); c.px(2, G - 2, IR[1]); c.px(12, G - 2, IR[1])
  const wheel = (x, y) => {
    c.rect(x + 1, y, 12, 7, CH[4])
    c.rect(x, y + 1, 14, 5, CH[4])
    c.rect(x + 1, y + 1, 12, 5, CH[2])
    c.rect(x + 2, y + 1, 10, 2, CH[1])
    c.hline(x + 3, y + 1, 7, CH[0])
    c.hline(x + 1, y + 4, 12, CH[3])
    c.px(x + 12, y + 2, CH[3])
  }
  wheel(0, G - 17)
  wheel(2, G - 24)

  // Hierba al pie.
  for (const gx2 of [3, 8, 22, 40, 47, 86, 100, 108]) {
    c.px(gx2, G, GR[2]); c.px(gx2 + 1, G - 1, GR[1]); c.px(gx2 + 2, G, GR[2]); c.px(gx2 + 1, G, GR[3])
  }
}
anim("style1_cheesery", { w: 112, h: 124, frames: N, fps: 10, outline: "o" }, (c) => richCheesery(c, c.frame))

// Ratón detallado (40 × 34): pelaje en 5 tonos con sombras hacia el morado.
const FU = ["#ffffff", "#f3ecf2", "#dccfdc", "#b6a5bd", "#86739a"]
const PK = ["#ffc4d6", "#f58fb0", "#d0638e", "#9a4070"]
const HY = ["#fff6b0", "#ffd84a", "#f0a820", "#b8700e"]
const BG = ["#d9a066", "#a8703e", "#7a4a2a", "#4e2c1c"]
function richMouse(c, blink) {
  // cola
  c.line(9, 29, 4, 27, PK[2], 2); c.line(4, 27, 2, 21, PK[2], 2); c.line(2, 21, 4, 16, PK[2])
  c.line(5, 27, 3, 23, PK[1])
  // oreja de atrás
  ell(c, 11, 12, 7, 7, FU[3]); ell(c, 10, 11, 6, 6, FU[2])
  ell(c, 11, 12, 4, 4, PK[2]); ell(c, 10, 11, 3, 3, PK[1]); c.px(9, 9, PK[0]); c.px(8, 10, PK[0])
  // mochila
  c.rect(4, 19, 9, 12, BG[3]); c.rect(5, 20, 7, 10, BG[1]); c.hline(5, 20, 7, BG[0]); c.vline(5, 20, 10, BG[0])
  c.vline(11, 20, 10, BG[2]); c.hline(5, 24, 7, BG[2]); c.px(8, 25, HY[1]); c.px(8, 26, HY[2])
  // cuerpo y barriga
  ell(c, 19, 26, 9, 7, FU[3]); ell(c, 18, 25, 8, 6, FU[2]); ell(c, 17, 24, 6, 4, FU[1])
  ell(c, 23, 27, 4, 5, FU[1]); ell(c, 22, 26, 3, 3, FU[0])
  c.line(12, 21, 14, 30, BG[2])
  // patas
  c.rect(14, 30, 3, 2, FU[3]); c.rect(22, 30, 3, 2, FU[3])
  c.rect(12, 32, 6, 2, PK[2]); c.hline(12, 32, 6, PK[1]); c.rect(21, 32, 7, 2, PK[2]); c.hline(21, 32, 7, PK[1])
  // brazo
  ell(c, 26, 24, 2, 3, FU[2]); c.px(26, 22, FU[1]); c.rect(26, 27, 2, 1, PK[1])
  // cabeza y hocico
  ell(c, 22, 15, 10, 8, FU[3]); ell(c, 21, 14, 9, 7, FU[2]); ell(c, 20, 13, 7, 5, FU[1]); ell(c, 18, 11, 3, 2, FU[0])
  ell(c, 30, 17, 5, 4, FU[3]); ell(c, 29, 16, 4, 3, FU[2]); ell(c, 28, 15, 3, 2, FU[1])
  c.hline(25, 20, 2, PK[0]); c.px(24, 19, PK[0])
  c.rect(34, 15, 2, 2, PK[2]); c.px(34, 15, PK[0]); c.px(35, 17, PK[3])
  c.hline(31, 19, 3, FU[4])
  // ojo
  if (blink) { c.hline(26, 14, 3, "#2a1a2a"); c.px(25, 13, "#2a1a2a") }
  else { c.rect(26, 11, 3, 4, "#2a1a2a"); c.rect(26, 11, 2, 2, "#ffffff"); c.px(26, 11, "#2a1a2a"); c.px(28, 14, "#6a5a8a") }
  // casco con lámpara
  ell(c, 19, 9, 10, 7, HY[3], 8); ell(c, 18, 8, 9, 6, HY[2], 8); ell(c, 17, 7, 7, 4, HY[1], 8); ell(c, 14, 5, 3, 2, HY[0])
  c.rect(8, 8, 25, 2, HY[3]); c.hline(8, 8, 24, HY[2]); c.hline(10, 8, 12, HY[1])
  c.rect(25, 3, 5, 5, HY[3]); c.rect(26, 4, 3, 3, "#4ac8e8"); c.px(26, 4, "#ffffff"); c.px(27, 4, "#c8fbff")
}
anim("style1_mouse", { w: 40, h: 35, outline: "o" }, frame({ ms: 1800 }, (c) => richMouse(c, false)), frame({ ms: 140 }, (c) => richMouse(c, true)))

// ================= 3 · SENCILLO =================
// Dos tonos por material, contorno grueso, formas de icono.
function flatCheesery(c, fr) {
  const G = 51
  c.rect(30, G - 44, 6, 12, "#a85a3a")
  for (const [dx2, dy2, r] of [[0, 0, 2], [2, -4, 3], [5, -9, 3]]) {
    const a = (fr % 4) - 1
    if (a + dx2 >= 0) ell(c, 33 + dx2 + a, G - 48 + dy2 - a, r, r, "#ffffff")
  }
  c.poly([2, G - 26, 12, G - 40, 36, G - 40, 46, G - 26], "#d9503a")
  c.rect(2, G - 28, 44, 2, "#a8392c")
  c.rect(5, G - 26, 38, 26, "#f6e3b4")
  c.rect(5, G - 4, 38, 4, "#d9c08a")
  c.rect(9, G - 21, 11, 9, fr % 2 ? "#ffb347" : "#ffc96a")
  c.vline(14, G - 21, 9, "k"); c.hline(9, G - 17, 11, "k")
  c.rect(26, G - 17, 10, 17, "#8b5a2b")
  c.px(33, G - 9, "#ffcf2e")
  c.rect(25, G - 24, 12, 5, "#ffcf2e")
}
anim("style3_cheesery", { w: 48, h: 52, frames: 4, fps: 4, outline: "k" }, (c) => flatCheesery(c, c.frame))
pal({ w: "#f4eef4", W: "#c9bccb", p: "#f58fb0", e: "#2a1a2a", y: "#ffd84a", Y: "#e0a020", b: "#a8703e" })
sprite("style3_mouse", { outline: "k" }, `
  .....yyyyyy.....
  ....yyyyyyyyY...
  ...YYYYYYYYYYY..
  .pp.wwwwwwwww...
  pppwwwwwwweeww..
  pppwwwwwwweewwwp
  .p.wwwwwwwwwww..
  ...bbwwwwwwW....
  ...bbwwwwwwW....
  ...bbWWwwwWW....
  p...wwwwwww.....
  .p..pp...pp.....`)
