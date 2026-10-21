// Exploración de pixel art (NO es código del juego). Piezas para el mockup de la pantalla
// principal en Pulido+: fondo, suelo, subsuelo, Mouse House, laboratorio, andamio, flecha, caja,
// montacargas e iconos de interfaz. Reusa las utilidades de buildings.px.js.
// Construir: node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build main.px.js --only <nombres>
include("buildings.px.js")
pal({ k: "#1b1220" })

// Escena del móvil: 160 × 135 píxeles de arte, suelo en 78, cámara mirando la roca (x 230).
const GY = 78, CAM = 230

// ---------- REGLA DE LEGIBILIDAD ----------
// Fondo: sin contorno, 2–3 tonos, colores que tiran al del cielo con la distancia, poco
// contraste y nada de trama ruidosa. Así lo jugable (contorno oscuro, 5 tonos) se despega.
const SKY = ["#3d93e0", "#4aa2ea", "#5fb2f0", "#7cc3f5", "#9dd4f8", "#c2e6fb"]
const haze = (col, t) => mix(col, SKY[4], t)

sprite("bg_cheddar", { w: 160, h: GY }, (c) => {
  const horizon = GY - 14, band = Math.ceil(horizon / 6)
  for (let y = 0; y < GY; y++) for (let x = 0; x < 160; x++) {
    const i = Math.min(5, Math.floor(y / band))
    let col = y >= horizon ? SKY[5] : SKY[i]
    if (y < horizon && i < 5 && y % band >= band - 2 && (y % band === band - 1 ? DI(x, y) : SP(x, y))) col = SKY[i + 1]
    c.px(x, y, col)
  }
  // Sol con halo en trama.
  for (let y = 4; y < 36; y++) for (let x = 112; x < 152; x++) {
    const d = Math.hypot(x + 0.5 - 132, y + 0.5 - 18)
    if (d < 11 && d >= 7.5 && DI(x, y)) c.px(x, y, mix(SKY[1], "#fff3a0", 0.35))
  }
  ell2(c, 132, 18, 7, 7, "#ffeb8a")
  ell2(c, 131, 17, 5.5, 5.5, "#fff6c0")
  // Montañas lejanas: lado que mira a la luz más claro, nieve en las cumbres.
  const mtn = haze("#7fb4d8", 0.3), mtnS = haze("#6a9cc4", 0.25), snow = haze("#f4fbff", 0.15)
  const mh = (wx) => 34 + Math.abs(((wx * 0.9) % 70) - 35) * -0.9 + 32 + Math.sin(wx * 0.07) * 4
  for (let x = 0; x < 160; x++) {
    const wx = x + CAM * 0.15, m = mh(wx), down = mh(wx + 1) < m
    for (let y = Math.round(GY - m); y < GY; y++) c.px(x, y, down ? mtnS : mtn)
    if (m > 52) for (let k = 0; k < Math.min(5, m - 52); k++) c.px(x, Math.round(GY - m) + k, k === Math.ceil(Math.min(5, m - 52)) - 1 && DI(x, k) ? mtn : snow)
  }
  // Colinas lejanas y pueblo.
  const far = haze("#5fbf9a", 0.3), farTop = haze("#86dcb4", 0.3)
  const hillAt = (wx) => 26 + Math.sin(wx * 0.045) * 9 + Math.sin(wx * 0.11 + 1) * 4
  for (let x = 0; x < 160; x++) {
    const wx = x + CAM * 0.4, h = Math.round(hillAt(wx))
    for (let y = GY - h; y < GY; y++) c.px(x, y, y < GY - h + 2 ? farTop : far)
  }
  const roofs = ["#d9503a", "#4a8fe8", "#d9a514", "#9a5fd0"]
  for (let i = 0; i < 10; i++) {
    const wx = 14 + ((i * 53) % 230) + (i % 3) * 5
    const x = Math.round(wx - CAM * 0.4)
    if (x < -12 || x > 164) continue
    const y = GY - Math.round(hillAt(wx + 4)) - 2
    const tall = i >= 8 ? 4 : 0
    const wall = haze(mix("#f3e3b6", far, 0.3), 0.15), wallS = haze(mix("#d9c38a", far, 0.35), 0.15)
    const rf = haze(mix(roofs[i % 4], far, 0.4), 0.2), rfS = haze(mix(roofs[i % 4], "#2b2440", 0.25), 0.25)
    c.rect(x, y - 3 - tall, 8, 6 + tall, wall)
    c.vline(x + 7, y - 3 - tall, 6 + tall, wallS)
    for (let r = 0; r < 3; r++) c.hline(x - 1 + r, y - 4 - tall - r, 10 - r * 2, r === 2 ? rfS : rf)
    c.hline(x - 1, y - 4 - tall, 10, rfS)
    c.px(x + 5, y - 1 - tall, haze("#ffe9a0", 0.2))
    c.rect(x + 2, y, 2, 3, haze("#a07a52", 0.3))
  }
  // Árboles: copa redonda en dos tonos, sin contorno.
  const tr = haze("#3f9a60", 0.25), trS = haze("#2f7f50", 0.25), trH = haze("#6cc07a", 0.25), trunk = haze("#7a5a3a", 0.3)
  for (let i = 0; i < 9; i++) {
    const tx = Math.round(i * 44 + hash(i + 70) * 20 - CAM * 0.4)
    if (tx < -16 || tx > 164) continue
    const ty = GY - 20 - Math.round(hash(i + 90) * 8)
    c.rect(tx + 5, ty + 8, 2, GY - ty - 8, trunk)
    ell2(c, tx + 6.5, ty + 4, 6.5, 5, trS)
    ell2(c, tx + 6, ty + 3.5, 5.8, 4.3, tr)
    ell2(c, tx + 4, ty + 2, 2.5, 1.6, trH)
  }
  // Colinas cercanas: lo más vivo del fondo, aún sin contorno.
  const near = haze("#4aad5c", 0.12), nearTop = haze("#7fd27a", 0.12)
  for (let x = 0; x < 160; x++) {
    const wx = x + CAM * 0.7
    const h = Math.round(9 + Math.sin(wx * 0.08 + 2) * 4 + Math.sin(wx * 0.21) * 2)
    for (let y = GY - h; y < GY; y++) c.px(x, y, y === GY - h ? nearTop : near)
  }
})
for (const [name, w, h] of [["cloud_a", 30, 9], ["cloud_b", 20, 7]]) sprite(name, { w, h }, (c) => {
  ell2(c, w * 0.32, h * 0.62, w * 0.3, h * 0.38, "#dbeefb")
  ell2(c, w * 0.62, h * 0.5, w * 0.36, h * 0.5, "#dbeefb")
  ell2(c, w * 0.3, h * 0.5, w * 0.26, h * 0.32, "#ffffff")
  ell2(c, w * 0.6, h * 0.4, w * 0.3, h * 0.4, "#ffffff")
  c.rect(1, h - 2, w - 2, 2, "#c4e2f6")
})

// ---------- SUELO (160 × 9: 3 filas por encima para matas y flores) ----------
sprite("ground", { w: 160, h: 9 }, (c) => {
  const T = 3
  c.rect(0, T, 160, 6, "#4fc234")
  c.hline(0, T, 160, "#9cf45e")
  for (let x = 0; x < 160; x++) if (DI(x, T + 1)) c.px(x, T + 1, "#7fe04a")
  c.rect(0, T + 1, 160, 2, "#c9a56a")
  c.hline(0, T + 1, 160, "#dcbd84")
  c.hline(0, T + 3, 160, "#3fa02c")
  for (let x = 0; x < 160; x++) {
    const wx = x + CAM
    if (wx % 9 === 0 && hash(wx + 3) > 0.4) { c.px(x, T + 2, "#a8844e"); c.px(x + 1, T + 2, "#b8955e") }
    if (DI(x, T + 5)) c.px(x, T + 5, "#3a9a2a")
    if (wx % 5 === 0 && hash(wx + 7) > 0.5) { c.px(x, T - 1, "#3fa02c"); c.px(x + 1, T - 1, "#5fbf3a") }
    if (wx % 23 === 0 && hash(wx + 31) > 0.45) {
      c.vline(x, T - 2, 2, "#2f8f44")
      const petal = hash(wx) > 0.5 ? "#ffffff" : "#ff9ab5"
      c.px(x - 1, T - 3, petal); c.px(x + 1, T - 3, petal); c.px(x, T - 3, "#ffe55c")
    }
  }
})

// ---------- SUBSUELO (160 × 51, desde la fila 84) a profundidad 80 ----------
const STRATA = [
  ["#7a4a2a", "#6e4226", "#5c3620"], ["#9a6a3a", "#8a5c30", "#6e4826"], ["#6b6f7e", "#5f6371", "#4a4d59"],
  ["#4a5a7a", "#40506e", "#323f58"], ["#5a3f7a", "#4f366c", "#3c2854"], ["#7a2f2a", "#6c2824", "#521d1a"],
]
const UTOP = GY + 6, UH = 135 - UTOP, DEPTH = 80, LAYER = 8
const SCROLL = DEPTH * LAYER - UH * 0.5
const strata = (level) => STRATA[Math.floor(Math.max(0, level) / 5) % STRATA.length]
sprite("under", { w: 160, h: UH }, (c) => {
  for (let y = 0; y < UH; y++) {
    const wy = y + SCROLL, level = Math.floor(wy / LAYER), p = strata(level)
    const inLayer = Math.floor(wy) % LAYER
    const boundary = level > 0 && level % 5 === 0 && inLayer === 0
    for (let x = 0; x < 160; x++) {
      let col = boundary ? p[2] : level % 2 ? p[1] : p[0]
      // Costura en trama entre capas, luz bajo un cambio de material.
      if (!boundary && inLayer === LAYER - 1 && DI(x, y)) col = (level + 1) % 2 ? p[1] : p[0]
      if (level % 5 === 0 && inLayer === 1) col = mix(p[0], "#ffffff", 0.08)
      c.px(x, y, col)
    }
  }
  const T = { H: "#c9a24a", M: "#b0883a", L: "#e0c070" }
  for (let wy = Math.floor(SCROLL / 6) * 6; wy < SCROLL + UH + 6; wy += 6) {
    const y = Math.round(wy - SCROLL)
    if (y < 3 || y > UH) continue
    const p = strata(Math.floor(wy / LAYER))
    for (let wx = CAM - (CAM % 7) - 7; wx < CAM + 160 + 7; wx += 7) {
      const r = h2(wx, wy, 5)
      const x = wx - CAM + Math.floor(h2(wx, wy, 6) * 4)
      if (r > 0.975) {
        c.rect(x, y - 1, 5, 4, mix(T.H, p[2], 0.35))
        c.rect(x + 1, y, 3, 2, mix(T.M, p[1], 0.2))
        c.px(x + 1, y, mix(T.L, p[0], 0.2))
      } else if (r > 0.93) { c.rect(x, y, 2, 2, mix(T.M, p[1], 0.3)); c.px(x, y, mix(T.L, p[0], 0.3)) }
      else if (r > 0.6) { c.rect(x, y, 3, 2, p[2]); c.px(x, y, mix(p[0], "#ffffff", 0.12)) }
    }
  }
})

// ---------- POZO (32 × 36, en x 117, y 82): marco, escalera, bolsa de queso, farol y cartel ----------
const DIGITS = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111"]
function sign(c, x, y, n) {
  const s = String(n), w = s.length * 4 + 3
  c.rect(x, y, w, 7, K)
  c.rect(x + 1, y + 1, w - 2, 5, "#f3e3b6")
  c.hline(x + 1, y + 1, w - 2, "#fff6dc")
  c.hline(x + 1, y + 5, w - 2, "#d9c38a")
  for (let i = 0; i < s.length; i++) {
    const gl = DIGITS[+s[i]]
    for (let p = 0; p < 15; p++) if (gl[p] === "1") c.px(x + 2 + i * 4 + (p % 3), y + 1 + ((p / 3) | 0), K)
  }
}
anim("shaft", { w: 32, h: 36, frames: N, fps: 10 }, (c) => {
  const sx = 5, bottom = Math.round(UTOP + UH * 0.5) - 82
  c.rect(sx - 1, 0, 12, bottom + 1, K)
  c.rect(sx, 0, 10, bottom, "#1c1410")
  c.vline(sx, 0, bottom, "#120c0a")
  c.vline(sx + 9, 0, bottom, "#2e221a")
  for (const rx of [sx + 2, sx + 7]) { c.vline(rx, 0, bottom, "#8b5a2b"); c.vline(rx + 1, 0, bottom, "#4a2e1c") }
  for (let wy = Math.ceil(SCROLL / 4) * 4; wy < SCROLL + UH; wy += 4) {
    const y = Math.round(UTOP + wy - SCROLL) - 82
    if (y > 1 && y < bottom - 1) { c.hline(sx + 2, y, 7, "#a8703e"); c.hline(sx + 3, y + 1, 5, "#4a2e1c") }
  }
  // Bolsa de queso al fondo.
  c.rect(sx - 5, bottom, 20, 6, K)
  c.rect(sx - 4, bottom + 1, 18, 4, "#ffcf2e")
  c.hline(sx - 4, bottom + 1, 18, "#fff09a")
  c.hline(sx - 4, bottom + 4, 18, "#f5ab12")
  c.px(sx, bottom + 2, "#d9830c"); c.px(sx + 6, bottom + 3, "#d9830c"); c.px(sx + 10, bottom + 2, "#d9830c")
  // Farol: su luz tiñe la pared del pozo.
  const on = c.frame % 4 < 2
  c.vline(sx + 12, bottom - 7, 3, K)
  c.rect(sx + 11, bottom - 4, 3, 4, K)
  c.px(sx + 12, bottom - 3, on ? "#fff8c8" : "#ffe55c")
  c.px(sx + 12, bottom - 2, "#ffcf2e")
  sign(c, sx + 16, bottom - 4, DEPTH)
})
sprite("lift", { w: 8, h: 7 }, (c) => {
  c.rect(0, 0, 8, 7, K)
  c.rect(1, 1, 6, 5, "#c9975a")
  c.hline(1, 1, 6, "#e6bb80")
  c.rect(2, 2, 4, 2, "#ffcf2e")
  c.hline(2, 2, 4, "#fff09a")
  c.hline(1, 5, 6, "#8b5a2b")
})

// ---------- MOUSE HOUSE (40 × 46, paredes desde x 1) ----------
const HPL = ["#fff6e0", "#f6e6c4", "#e9d2a8", "#c9ad80", "#8e7660"]
function roofRows(c, x0, x1, yBase, rows, RR, every = 4) {
  for (let i = 0; i < rows; i++) {
    const y = yBase - i, l = x0 + i, r = x1 - i
    for (let x = l; x <= r; x++) {
      let tone = i % 3 === 0 ? 3 : 2
      if (i % 3 === 2) tone = 1
      if (x > r - 6 && DI(x, y)) tone++
      if (x > r - 3) tone++
      if (i % 3 === 1 && (x - l) % every === 0) tone = 0
      c.px(x, y, RR[Math.min(4, tone)])
    }
    c.px(l, y, RR[1]); c.px(r, y, RR[4])
  }
}
anim("phouse", { w: 40, h: 46, frames: N, fps: 10 }, (c) => {
  const G = 45, fr = c.frame
  cyl(c, 27, 10, 6, 12, STL)
  c.rect(26, 9, 8, 2, K); c.hline(27, 9, 6, STL[1])
  smoke(c, 30, 6, fr, { d: 2, drift: 5, rise: 12, size: 2.2 })
  roofRows(c, 0, 37, 23, 10, r5("#74a6ff", "#4a8fe8", "#2b5cab"))
  // Luces del tejado: una por ratón (aquí, 8).
  for (let i = 0; i < 8; i++) {
    const lx = 4 + i * 4, ly = 18 - (i % 2)
    c.rect(lx - 1, ly - 1, 4, 4, "#1f3a66")
    c.rect(lx, ly, 2, 2, "#ffe55c")
    c.px(lx, ly, "#fff8c8")
  }
  c.rect(0, 24, 38, 2, K)
  c.hline(1, 24, 36, "#633c22")
  vbox(c, 1, 26, 36, 20, HPL, { side: 4, ao: 0, top: 1 })
  castShadow(c, 2, 27, 34, HPL)
  // Zócalo.
  c.rect(2, G - 3, 34, 3, PLI[2]); c.hline(2, G - 3, 34, PLI[1]); c.hline(2, G - 1, 34, PLI[4])
  for (let x = 4; x < 35; x += 6) c.vline(x, G - 3, 2, PLI[3])
  // Puerta y ventana hundidas.
  recess(c, 7, 33, 10, 12, HPL)
  for (let x = 8; x < 16; x += 3) { c.vline(x, 34, 11, WOO[1]); c.vline(x + 1, 34, 11, WOO[2]); c.vline(x + 2, 34, 11, WOO[3]) }
  c.hline(8, 34, 8, WOO[4]); c.px(14, 39, "#ffe55c")
  recess(c, 21, 31, 11, 9, HPL)
  c.rect(22, 32, 10, 8, fr % 4 < 2 ? "#ffe55c" : "#ffd84a")
  c.hline(22, 32, 10, "#e0a020"); c.vline(22, 32, 8, "#e0a020")
  c.vline(26, 32, 8, K); c.hline(22, 35, 10, K)
  c.px(23, 33, "#fff8c8")
  c.rect(20, 40, 13, 2, WOO[3]); c.hline(20, 40, 13, WOO[1])
})

// ---------- LABORATORIO (36 × 46, paredes desde x 1) ----------
const WHT = ["#ffffff", "#f4f7fa", "#e2e8ee", "#b8c2cc", "#7f8a96"]
anim("plab", { w: 36, h: 46, frames: N, fps: 10 }, (c) => {
  const G = 45, fr = c.frame
  // Matraz en el tejado: burbujea mientras se investiga.
  c.rect(15, 8, 6, 6, K)
  c.rect(16, 9, 4, 5, "#d8f0fa"); c.vline(16, 9, 5, "#ffffff")
  c.hline(14, 8, 8, K); c.hline(15, 8, 6, "#eaf8ff")
  ell2(c, 18, 17, 6, 4.2, K)
  ell2(c, 18, 17, 5, 3.3, "#bfe4f2")
  for (let y = 16; y <= 20; y++) for (let x = 13; x <= 23; x++) {
    const dx = (x + 0.5 - 18) / 5, dy = (y + 0.5 - 17) / 3.3
    if (dx * dx + dy * dy <= 1) c.px(x, y, y === 16 ? "#8df09a" : y > 18 ? "#22a04a" : "#3fbf5a")
  }
  c.px(15, 15, "#ffffff"); c.px(14, 16, "#ffffff")
  const b = [[17, 4, 0], [19, 2, 2], [16, 1, 5]]
  for (const [bx, by, d] of b) {
    const a = (fr + d) % N
    const y = 14 - a * 1.6 - by * 0
    if (a < 6) { c.px(bx + (a % 2), Math.round(y - by), "#bff5c8"); if (a < 3) c.px(bx + (a % 2), Math.round(y - by) + 1, "#7fd89a") }
  }
  // Tejado verde.
  roofRows(c, 1, 32, 20, 6, r5("#7fe0a0", "#3fa860", "#2f8f55"), 3)
  c.rect(0, 21, 34, 2, K); c.hline(1, 21, 32, "#1f5c3a")
  vbox(c, 1, 23, 32, 23, WHT, { side: 4, ao: 0, top: 1 })
  castShadow(c, 2, 24, 30, WHT)
  c.rect(2, G - 4, 30, 4, "#c9d2da"); c.hline(2, G - 4, 30, "#e2e8ee"); c.hline(2, G - 1, 30, "#8a96a4")
  // Ventana: luz verde mientras investiga.
  recess(c, 5, 28, 8, 7, WHT)
  const lit = fr % 4 < 2
  c.rect(6, 29, 7, 6, lit ? "#bff5c8" : "#8fd3ff")
  c.hline(6, 29, 7, lit ? "#8fe0a8" : "#5ab0e0"); c.vline(6, 29, 6, lit ? "#8fe0a8" : "#5ab0e0")
  c.vline(9, 29, 6, K)
  c.px(7, 30, "#ffffff")
  // Puerta.
  recess(c, 21, 32, 8, 12, WHT)
  for (let x = 22; x < 29; x += 3) { c.vline(x, 33, 11, "#8a96a4"); c.vline(x + 1, 33, 11, "#6c7888"); c.vline(x + 2, 33, 11, "#56606e") }
  c.hline(22, 33, 7, "#3a4250"); c.px(27, 38, "#ffe55c")
})

// ---------- ANDAMIO DE MINA (14 × 28) ----------
anim("scaffold", { w: 14, h: 28, frames: N, fps: 10 }, (c) => {
  const fr = c.frame
  cyl(c, 6, 2, 4, 26, WOO)
  vbox(c, 0, 1, 14, 3, WOO, { side: 2, ao: 0, top: 1 })
  c.vline(11, 4, 5, K)
  c.rect(10, 9, 3, 4, K)
  c.px(11, 10, fr % 4 < 2 ? "#fff8c8" : "#ffe55c")
  c.px(11, 11, "#ffcf2e")
})

// ---------- PIEZAS SUELTAS ----------
sprite("sel_arrow", { w: 9, h: 7, outline: "k" }, (c) => {
  const R = ["#fff8c8", "#ffe55c", "#ffcf2e", "#f5ab12", "#c97a08"]
  for (let r = 0; r < 4; r++) {
    for (let x = r; x < 9 - r; x++) c.px(x, r * 2, R[r === 0 ? 1 : 2]), c.px(x, r * 2 + 1, R[r === 0 ? 2 : 3])
  }
  c.hline(0, 0, 9, R[0])
  c.px(8, 1, R[4]); c.px(7, 3, R[4]); c.px(6, 5, R[4])
})
sprite("crate_raw", { w: 10, h: 8 }, (c) => {
  vbox(c, 0, 2, 10, 6, WOO, { side: 2, ao: 1, top: 1 })
  c.hline(1, 4, 8, WOO[3])
  c.rect(2, 0, 6, 3, K)
  c.rect(3, 1, 4, 2, "#ffcf2e"); c.px(3, 1, "#fff09a"); c.px(5, 2, "#d9830c")
})

// ---------- ICONOS DE INTERFAZ (Pulido+: contorno, luz arriba a la izquierda, 4–5 tonos) ----------
const ZT = {
  cheddar: ["#fffbe0", "#fff09a", "#ffcf2e", "#f5ab12", "#d9830c"],
  gouda: ["#ffe9c8", "#ffd08a", "#ff9f3a", "#e87a1c", "#b9560c"],
  brie: ["#ffffff", "#ffffff", "#fbf3d6", "#e3d3a0", "#c9b06a"],
  emmental: ["#fffbe0", "#fff6b0", "#f7de6a", "#dcb93a", "#a8862a"],
  parmesan: ["#fff4d8", "#f6e2b0", "#e3bf78", "#bf9550", "#8a6630"],
  blue: ["#ffffff", "#ffffff", "#e9e6cf", "#c2be9f", "#4a78b8"],
}
function rawIcon(c, T) {
  c.poly([0, 7, 2, 2, 7, 0, 11, 3, 12, 8, 9, 10, 3, 10], T[2])
  c.poly([0, 7, 2, 2, 7, 0, 7, 3, 4, 5, 2, 7], T[1])
  c.poly([11, 3, 12, 8, 9, 10, 8, 6], T[3])
  c.px(3, 3, T[0]); c.px(4, 2, T[0]); c.px(6, 1, T[0])
  c.rect(4, 6, 2, 2, T[4]); c.px(5, 7, T[3])
  c.px(8, 4, T[4]); c.px(7, 8, T[4]); c.px(10, 7, T[4])
  c.hline(2, 9, 6, T[3])
}
for (const z of Object.keys(ZT)) sprite(`ic_raw_${z}`, { w: 12, h: 10, outline: "k" }, (c) => rawIcon(c, ZT[z]))
// Cheese Base (REFINE): el bloque aprobado, uno por queso con la paleta de su roca (como RAW). El genérico es el de Cheddar.
function baseIcon(c, T) {
  c.poly([0, 3, 3, 0, 12, 0, 9, 3], T[1])
  c.rect(0, 3, 9, 7, T[2])
  c.poly([9, 3, 12, 0, 12, 7, 9, 10], T[3])
  c.hline(0, 3, 9, T[0]); c.hline(3, 0, 9, T[0])
  c.hline(0, 9, 9, T[3]); c.vline(11, 1, 6, T[4])
  c.px(2, 5, T[1]); c.px(3, 5, T[1])
}
for (const z of Object.keys(ZT)) sprite(`ic_base_${z}`, { w: 12, h: 10, outline: "k" }, (c) => baseIcon(c, ZT[z]))
sprite("ic_base", { w: 12, h: 10, outline: "k" }, (c) => baseIcon(c, ZT.cheddar))
// Queso (CHEESE): rueda de queso comercial con su etiqueta de marca ovalada en el costado. Una por queso, con la
// misma forma y el mismo tamaño (13 × 11 + contorno) y lo que distingue a cada uno:
//   cheddar  rueda naranja, etiqueta roja          gouda     rueda anaranjada, etiqueta oscura
//   brie     disco bajo y blanco, etiqueta verde    emmental  ojos en la tapa, etiqueta roja
//   parmesan tambor alto con la corteza punteada   blue      vetas azules en la tapa, etiqueta azul
// Tapa PLANA con canto, sombra de cilindro (luz a la izquierda) y sin cintas ni franjas: ni regalo ni hamburguesa.
const LOT_ROWS = {
  std: [
    "...yYYYYYy...",
    ".yYWWYYYYYYy.",
    "yYWYYYYYYYYYy",
    "yyyyyyyyyyyyO",
    "ssSSrrrrrSSOO",
    "ssSrLLLLLRSOO",
    "ssSRgGLttRSOO",
    "ssSRGGLLLRSOO",
    "ssSSdddddSSOO",
    "SsSSSSSSSSSOe",
    ".eeeeeeeeeee.",
  ],
  emmental: [
    "...yYYYYYy...",
    ".yYWWYYhHYYy.",
    "yYWYhHYYYYhYy",
    "yyyyyyyyyyyyO",
    "ssSSrrrrrSSOO",
    "ssSrLLLLLRSOO",
    "ssSRgGLttRSOO",
    "ssSRGGLLLRSOO",
    "ssSSdddddSSOO",
    "SsSSSSSSSSSOe",
    ".eeeeeeeeeee.",
  ],
  blue: [
    "...yYYYYYy...",
    ".yYWWYbYYYYy.",
    "yYWYbYYYbbYYy",
    "yyyyyyyyyyyyO",
    "ssSSrrrrrSSOO",
    "ssSrLLLLLRSOO",
    "ssSRgGLttRSOO",
    "ssSRGGLLLRSOO",
    "ssSSdddddSSOO",
    "SsSSSSSSSSSOe",
    ".eeeeeeeeeee.",
  ],
  brie: [
    ".............",
    "..yYYYYYYYy..",
    ".yYWWYYYhYYy.",
    "yYWYYYhYYYYYy",
    "yYYYYYYYYYhYy",
    "yyyyyyyyyyyyO",
    "ssSSrrrrrSSOO",
    "ssSRgGLttRSOO",
    "ssSSdddddSSOO",
    "SsSSSSSSSSSOe",
    ".eeeeeeeeeee.",
  ],
  parmesan: [
    "..yYYYYYYYy..",
    "yYWWYYYYYYYYy",
    "yyyyyyyyyyyyO",
    "sSpSSpSSpSSOO",
    "ssSSrrrrrSSOO",
    "spSrLLLLLRpOO",
    "ssSRgGLttRSOO",
    "spSRGGLLLRpOO",
    "ssSSdddddSSOO",
    "SpSSpSSpSSpOe",
    ".eeeeeeeeeee.",
  ],
}
const LOT_LABEL = {
  red: { r: "#ff6a5a", R: "#d93a3f", d: "#8c2235" },
  dark: { r: "#7a6470", R: "#3e2e3a", d: "#1e141c" },
  green: { r: "#7ad08a", R: "#3f9f5a", d: "#22603a" },
  blue: { r: "#7aa0e8", R: "#2f5aa8", d: "#1a2f60" },
  brown: { r: "#d0804a", R: "#a8452a", d: "#5a2414" },
}
const LOT = {
  cheddar: { rows: "std", label: "red", e: "#7a4a08" },
  gouda: { rows: "std", label: "dark", e: "#6a3406" },
  brie: { rows: "brie", label: "green", e: "#8a7440", h: "#e3d3a0", g: ["#e3d3a0", "#c9b06a"] },
  emmental: { rows: "emmental", label: "red", e: "#6a5418", h: "#a8862a", H: "#dcb93a" },
  parmesan: { rows: "parmesan", label: "brown", e: "#5a4018", p: "#8a6630" },
  blue: { rows: "blue", label: "blue", e: "#7a7660", O: "#a8a488", b: "#4a78b8", g: ["#c2be9f", "#4a78b8"] },
}
function lotIcon(c, z) {
  const T = ZT[z], V = LOT[z]
  const P = { W: T[0], Y: T[1], y: T[3], s: T[2], S: T[3], O: V.O || T[4], e: V.e, L: "#fffbe0", l: "#e0d2a8", t: "#b89a70",
    g: (V.g || [T[2]])[0], G: (V.g || [, T[4]])[1], h: V.h || T[4], H: V.H || T[3], p: V.p || T[4], b: V.b || T[4], ...LOT_LABEL[V.label] }
  LOT_ROWS[V.rows].forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== ".") c.px(x, y, P[ch]) }))
}
for (const z of Object.keys(ZT)) sprite(`ic_lot_${z}`, { w: 13, h: 11, outline: "k" }, (c) => lotIcon(c, z))
// Genérico (todas las rocas, la tienda): el de Cheddar.
sprite("ic_lot", { w: 13, h: 11, outline: "k" }, (c) => lotIcon(c, "cheddar"))
// Moneda de oro: canto visible abajo, aro con luz arriba a la izquierda, cara hundida con una
// cuña de queso en relieve y un destello.
sprite("ic_coin", { w: 14, h: 14, outline: "k" }, (c) => {
  const G = ["#fffbe6", "#fff09a", "#ffd84a", "#f2b01e", "#d4860c", "#94520a"]
  ell2(c, 7, 7.6, 7, 6.4, G[5])
  ell2(c, 7, 6.6, 7, 6.4, G[3])
  ell2(c, 6.6, 6.2, 6.4, 5.8, G[2])
  for (const [x, y] of [[3, 1], [4, 1], [2, 2], [1, 3], [1, 4], [5, 0], [6, 0]]) c.px(x, y, G[1])
  for (const [x, y] of [[12, 9], [11, 10], [10, 11], [12, 8], [9, 11]]) c.px(x, y, G[4])
  ell2(c, 7, 6.6, 4.3, 4, G[3])
  ell2(c, 7.3, 6.9, 3.6, 3.3, G[2])
  for (const [y, x0] of [[5, 9], [6, 8], [7, 7], [8, 6]]) for (let x = x0; x <= 9; x++) c.px(x, y, G[1])
  c.px(9, 5, G[0]); c.px(8, 6, G[0]); c.px(7, 7, G[0]); c.px(6, 8, G[0])
  c.hline(6, 9, 4, G[4]); c.vline(10, 5, 5, G[4])
  c.px(8, 8, G[3])
  c.px(2, 4, G[0]); c.px(3, 2, G[0]); c.px(4, 2, "#ffffff")
})
// Pico: mango en diagonal que encaja en el centro de la cabeza; cabeza curva perpendicular al
// mango, abombada hacia fuera, con las puntas hacia la mano.
sprite("ic_pick", { w: 12, h: 12, outline: "k" }, (c) => {
  c.line(1, 11, 7, 5, "#c9975a")
  c.line(2, 11, 7, 6, "#8b5a2b")
  c.px(1, 11, "#5c3620"); c.px(2, 10, "#6b4426")
  const outer = [[3, 1], [4, 1], [5, 1], [6, 2], [7, 2], [8, 3], [9, 4], [9, 5], [10, 6], [10, 7], [11, 8], [11, 9]]
  const inner = [[2, 2], [3, 2], [4, 2], [5, 3], [6, 3], [7, 4], [8, 5], [8, 6], [9, 7], [9, 8], [10, 9], [10, 10]]
  for (const [x, y] of inner) c.px(x, y, "#7a8296")
  for (const [x, y] of outer) c.px(x, y, "#d4dae4")
  c.px(5, 1, "#ffffff"); c.px(6, 2, "#ffffff")
  c.px(2, 2, "#565c6e"); c.px(10, 10, "#565c6e")
  c.px(7, 4, "#5c3620"); c.px(8, 5, "#6c7488")
})
sprite("ic_flask", { w: 11, h: 12, outline: "k" }, (c) => {
  c.rect(4, 0, 3, 4, "#d8f0fa"); c.vline(4, 0, 4, "#ffffff")
  ell2(c, 5.5, 8, 5.5, 4, "#bfe4f2")
  for (let y = 7; y < 12; y++) for (let x = 0; x < 11; x++) {
    const dx = (x + 0.5 - 5.5) / 5.5, dy = (y + 0.5 - 8) / 4
    if (dx * dx + dy * dy <= 1) c.px(x, y, y === 7 ? "#8df09a" : y > 9 ? "#22a04a" : "#3fbf5a")
  }
  c.px(2, 6, "#ffffff"); c.px(1, 7, "#ffffff"); c.px(6, 9, "#bff5c8"); c.px(4, 10, "#bff5c8")
})
sprite("ic_arrow", { w: 5, h: 8, outline: "k" }, (c) => {
  for (let r = 0; r < 4; r++) { c.hline(0, r, r + 1, "#ffe55c"); c.hline(0, 7 - r, r + 1, "#f5ab12") }
  c.px(0, 0, "#fff8c8")
})
