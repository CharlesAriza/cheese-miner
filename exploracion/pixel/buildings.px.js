// Exploración de pixel art (NO es código del juego). Los edificios de la cadena con sus seis
// aspectos (tier 0..5, como `q.visualTier` en js/ui/scene.js) y animados trabajando, más la roca de
// queso redibujada por planos. Lienzos fijos por edificio: el suelo es la última fila, así que
// todos los tiers se alinean al montarlos.
// Construir: node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build buildings.px.js

const K = "#2b1d12"
const N = 8 // fotogramas por ciclo
// Material de las máquinas por tier (claro, medio, oscuro), de chapa naranja a oro (como METAL).
const METAL = [
  ["#ff8a4a", "#e2562a", "#5a1e12"],
  ["#ffa85a", "#d9772a", "#5a2a12"],
  ["#8fbcf0", "#5a8fd0", "#1f3a66"],
  ["#a99ff0", "#7a6fd0", "#2a2466"],
  ["#7fe0b8", "#3fb38a", "#14503a"],
  ["#fff3a0", "#ffcf2e", "#8a5a0a"],
]

function hash(n) {
  n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d)
  n = Math.imul(n ^ (n >>> 12), 0x297a2d39)
  return ((n ^ (n >>> 15)) >>> 0) / 4294967296
}
const h2 = (x, y, seed) => hash(x * 374761393 + y * 668265263 + seed * 982451653)
function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const A = p(a), B = p(b)
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")
}

// ---------- Efectos ----------
// Disco de píxeles; `mask(x, y)` lo deja en trama para que se deshaga.
function disc(c, cx, cy, r, col, mask) {
  const R = r + 0.35
  for (let y = Math.floor(cy - R); y <= cy + R; y++)
    for (let x = Math.floor(cx - R); x <= cx + R; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy
      if (dx * dx + dy * dy <= R * R && (!mask || mask(x, y))) c.px(x, y, col)
    }
}
const STEAM = ["#ffffff", "#eef1f7", "#c9d0df"]
const FUMES = ["#c9d0df", "#a3abbd", "#7b8396"]
// Columna de humo: `n` bocanadas desfasadas que nacen en (x, y), suben, crecen, derivan y se
// deshacen en trama. Cada una tiene luz arriba a la izquierda y sombra abajo a la derecha.
function smoke(c, x, y, fr, { n = 3, rise = 15, drift = 4, size = 2.6, tones = STEAM, d = 0 } = {}) {
  for (let k = 0; k < n; k++) {
    const a = ((fr + d + (k * N) / n) % N) / N
    const cx = x + a * drift
    const cy = y - a * rise
    const r = 0.7 + a * size
    const mask = a < 0.6 ? null : a < 0.85 ? (px, py) => (px + py) % 2 === 0 : (px, py) => px % 2 === 0 && py % 2 === 0
    disc(c, cx + 0.7, cy + 0.7, r, tones[2], mask)
    disc(c, cx, cy, r, tones[1], mask)
    if (!mask && r > 1.4) c.px(Math.floor(cx - r * 0.45), Math.floor(cy - r * 0.45), tones[0])
  }
}
// Chispas que saltan desde (x, y): nacen como estrella blanca, se estiran en raya y se apagan.
function sparks(c, x, y, fr) {
  const dirs = [[1.4, -1.1], [1.7, 0.2], [1.1, 1], [1.5, -0.4]]
  dirs.forEach(([dx, dy], k) => {
    const age = (fr + k * 2) % N
    if (age > 3) return
    const sx = Math.round(x + dx * age * 1.6), sy = Math.round(y + dy * age * 1.6 + (age * age) / 4)
    if (age === 0) {
      c.px(sx, sy, "#ffffff")
      for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.px(sx + ox, sy + oy, "#fff3a0")
    } else if (age === 1) {
      c.px(sx, sy, "#ffffff")
      c.px(sx - Math.sign(dx), sy - Math.round(dy), "#ffcf2e")
    } else c.px(sx, sy, age === 2 ? "#ffcf2e" : "#e2862a")
  })
}
// Fuego de horno en lenguas: cada lengua sube y baja desfasada; núcleo claro, borde rojo.
function fire(c, x, y, w, h, fr) {
  c.rect(x, y, w, h, "#4a1a0e")
  for (let i = 0; i < w; i++) {
    const tongue = 1 - Math.abs(((i + (fr % 4)) % 4) - 1.5) / 1.5
    const fh = Math.round(h * 0.35 + tongue * h * 0.35 + (Math.sin(i * 1.7 + (fr * Math.PI) / 4) * 0.5 + 0.5) * h * 0.25)
    c.rect(x + i, y + h - fh, 1, fh, "#d93a1f")
    c.rect(x + i, y + h - Math.round(fh * 0.75), 1, Math.round(fh * 0.75), "#ff8a2e")
    c.rect(x + i, y + h - Math.round(fh * 0.45), 1, Math.round(fh * 0.45), "#ffcf2e")
    if (i > 1 && i < w - 2) c.rect(x + i, y + h - Math.round(fh * 0.2), 1, Math.round(fh * 0.2), "#fff3a0")
  }
  c.hline(x, y + h - 1, w, fr % 2 ? "#ffcf2e" : "#fff3a0")
}

// ---------- TALADRO (44 × 44) ----------
function drill(c, t, fr) {
  const G = 43
  const [hi, md, dk] = METAL[t]
  const big = t >= 2 ? 3 : 0
  const j = fr % 2
  // Ruedas, u orugas desde el tier 3 (los tacos avanzan).
  if (t >= 3) {
    c.rect(2, G - 6, 25, 7, K)
    c.rect(3, G - 5, 23, 5, "#3a3d4a")
    for (let i = 0; i < 6; i++) c.rect(3 + ((i * 4 + fr) % 23), G - 4, 2, 2, "#8a90a3")
    c.rect(3, G - 5, 23, 1, "#565b6b")
  } else {
    for (const wx of [4, 16]) {
      c.rect(wx, G - 6, 8, 7, K)
      c.rect(wx + 1, G - 5, 6, 5, "#3a3d4a")
      c.rect(wx + 1, G - 5, 6, 1, "#565b6b")
      const sp = [[0, 0], [1, 0], [1, 1], [0, 1]][fr % 4]
      c.px(wx + 3 + sp[0], G - 4 + sp[1], "#c9d0df")
    }
  }
  const top = G - 17 - big
  // Tubos de escape con humo de motor.
  for (const px of t >= 1 ? [6, 12] : [6]) {
    c.rect(px + j, top - 6, 4, 7, K)
    c.rect(px + 1 + j, top - 5, 2, 6, "#656a7b")
    c.px(px + 1 + j, top - 5, "#8a90a3")
    smoke(c, px + 2, top - 8, fr, { n: 2, rise: 10, drift: -3, size: 1.8, tones: FUMES, d: px === 12 ? 3 : 0 })
  }
  // Cuerpo con luz arriba y sombra abajo.
  c.rect(2 + j, top, 24, G - 5 - top, K)
  c.rect(3 + j, top + 1, 22, G - 7 - top, md)
  c.rect(3 + j, top + 1, 22, 2, hi)
  c.rect(3 + j, G - 8, 22, 1, dk)
  for (let x = 5; x < 24; x += 5) c.px(x + j, top + 4, hi)
  // Indicador de trabajo.
  c.rect(14 + j, G - 13, 6, 4, K)
  c.rect(15 + j, G - 12, 4, 2, fr % 4 < 2 ? "#ffe55c" : "#ffffff")
  // Cabina desde el tier 4.
  if (t >= 4) {
    c.rect(3 + j, top - 8, 10, 9, K)
    c.rect(4 + j, top - 7, 8, 5, "#8ff3ff")
    c.px(5 + j, top - 6, "#ffffff")
    c.rect(4 + j, top - 2, 8, 2, md)
  }
  // Broca en tres escalones, con la espiral que gira.
  const steel = t >= 5 ? "#b8860b" : "#4a4f60"
  const shine = t >= 5 ? "#ffe55c" : "#c9d0df"
  const mid = G - 12 - (big ? 1 : 0)
  const hh = (x) => (x < 29 ? 4 : x < 32 ? 3 : x < 34 ? 2 : 1)
  const tipEnd = t >= 2 ? 36 : 35
  for (let x = 26; x <= tipEnd; x++) {
    const h = hh(x)
    c.vline(x + j, mid - h, h * 2 + 1, steel)
    for (let y = mid - h; y <= mid + h; y++) if ((x + y + fr) % 4 === 0) c.px(x + j, y, shine)
  }
  c.px(tipEnd + 1 + j, mid, shine)
  sparks(c, tipEnd + 2, mid, fr)
}

// ---------- REFINERÍA (56 × 70) ----------
function refinery(c, t, fr) {
  const G = 69
  const M = METAL[t]
  const body = ["#3d6fd1", "#3d6fd1", "#3d8fd1", "#6a5fd0", "#2f9f8a", "#d9a514"][t]
  const hi = ["#74a6ff", "#74a6ff", "#7fc4ff", "#a99ff0", "#7fe0b8", "#fff3a0"][t]
  const low = ["#2b4f9c", "#2b4f9c", "#2b6a9c", "#4a4296", "#1f7a5a", "#b8860b"][t]
  const top = G - 27 + (fr % 4 === 0 ? 1 : 0)
  // Chimeneas: 1, 2 con el tier 1 y 3 con el 4; más altas desde el 3.
  const chimneys = 1 + (t >= 1 ? 1 : 0) + (t >= 4 ? 1 : 0)
  for (let i = 0; i < chimneys; i++) {
    const cx = 43 - i * 9
    const ch = 10 + i * 4 + (t >= 3 ? 6 : 0)
    c.rect(cx, top - ch, 7, ch + 1, "#1f2a44")
    c.rect(cx + 1, top - ch + 1, 5, ch, "#596079")
    c.rect(cx + 1, top - ch + 1, 1, ch, "#7a819a")
    c.rect(cx, top - ch, 7, 2, M[1])
    c.hline(cx, top - ch, 7, M[0])
    smoke(c, cx + 3, top - ch - 2, fr, { d: i * 3, drift: 5 })
  }
  // Depósito lateral con tubería desde el tier 2; el nivel sube y baja.
  if (t >= 2) {
    c.rect(2, G - 22, 13, 23, "#1f2a44")
    c.rect(3, G - 21, 11, 21, "#aab0c0")
    c.rect(3, G - 21, 3, 21, "#dfe6ee")
    c.hline(3, G - 14, 11, "#656a7b")
    c.hline(3, G - 6, 11, "#656a7b")
    c.rect(9, G - 19, 3, 11, "#1f2a44")
    const lv = 5 + [0, 1, 2, 2, 1, 0, 0, 0][fr]
    c.rect(10, G - 9 - lv, 1, lv, "#ffcf2e")
    c.px(10, G - 9 - lv, "#fff3a0")
    c.rect(15, G - 17, 2, 2, "#656a7b")
    c.rect(5, G - 25, 6, 4, "#656a7b")
  }
  // Tolva de Raw encima.
  c.rect(18, top - 4, 16, 5, "#5c3620")
  c.rect(19, top - 3, 14, 3, "#a9713a")
  c.hline(19, top - 3, 14, "#c9975a")
  c.rect(21, top, 10, 2, "#5c3620")
  // Cuerpo.
  c.rect(16, top, 36, G - top - 1, "#1f2a44")
  c.rect(17, top + 1, 34, G - top - 3, body)
  c.rect(17, top + 1, 34, 3, hi)
  c.rect(17, G - 7, 34, 5, low)
  for (let x = 19; x < 51; x += 4) c.px(x, G - 5, hi)
  // Horno con fuego en lenguas.
  c.rect(20, top + 6, 18, 12, "#1f2a44")
  fire(c, 21, top + 7, 16, 10, fr)
  // Manómetro con aguja que oscila.
  c.rect(41, top + 9, 9, 7, "#1f2a44")
  c.rect(42, top + 10, 7, 5, "#f3e3b6")
  c.px(45, top + 12, K)
  c.px([43, 44, 45, 46, 47, 46, 45, 44][fr], top + 11, "#d93a4f")
  // Válvulas desde el tier 3: la rueda gira y suelta un soplo de vapor.
  if (t >= 3) {
    c.rect(41, top + 18, 9, 5, "#1f2a44")
    c.rect(42, top + 19, 7, 3, "#656a7b")
    c.px(44 + (fr % 2) * 2, top + 20, "#d93a4f")
    c.px(45, top + 19 + (fr % 2) * 2, "#d93a4f")
    if (fr >= 4) smoke(c, 51, top + 18, (fr - 4) * 2, { n: 1, rise: 6, drift: 2, size: 1.5 })
  }
  if (t >= 5) c.hline(17, top + 1, 34, "#ffffff")
  c.rect(18, G - 1, 6, 1, "#1f2a44")
  c.rect(44, G - 1, 6, 1, "#1f2a44")
}

// ---------- QUESERÍA (60 × 68) ----------
function cheesery(c, t, fr) {
  const G = 67
  const roofA = ["#b8503a", "#b8503a", "#3d6fd1", "#7a6fd0", "#3fb38a", "#d9a514"][t]
  const roofB = ["#8f3b2a", "#8f3b2a", "#2b4f9c", "#4a4296", "#1f7a5a", "#b8860b"][t]
  const roofH = ["#d9735a", "#d9735a", "#74a6ff", "#a99ff0", "#7fe0b8", "#fff3a0"][t]
  const wallTop = G - 24
  // Torre de maduración (tier 3+), detrás; su ventana alumbra.
  if (t >= 3) {
    c.rect(40, G - 52, 14, 30, K)
    c.rect(41, G - 51, 12, 29, "#e9d2a8")
    c.rect(41, G - 51, 2, 29, "#f6e6c4")
    for (let i = 0; i < 5; i++) c.rect(39 + i, G - 53 - i, 16 - i * 2, 1, i % 2 ? roofA : roofB)
    c.rect(44, G - 46, 6, 6, K)
    c.rect(45, G - 45, 4, 4, fr < 4 ? "#ffcf2e" : "#ffb347")
    c.px(45, G - 45, "#fff3a0")
    c.hline(41, G - 38, 12, "#d9c38a")
  }
  // Chimeneas con vapor.
  const stacks = t >= 1 ? [24, 16] : [24]
  stacks.forEach((sx, i) => {
    c.rect(sx, wallTop - 14, 6, 12, K)
    c.rect(sx + 1, wallTop - 13, 4, 11, "#a85a3a")
    c.rect(sx + 1, wallTop - 13, 1, 11, "#c97a5a")
    c.hline(sx + 1, wallTop - 10, 4, "#7a3a24")
    smoke(c, sx + 3, wallTop - 16, fr, { d: i * 4, drift: 5 })
  })
  // Tejado a dos aguas con tejas en hileras.
  for (let i = 0; i < 10; i++) c.rect(11 + i, wallTop - 1 - i, 44 - i * 2, 1, i % 3 === 0 ? roofB : roofA)
  for (let i = 1; i < 10; i += 3) for (let x = 13 + i; x < 53 - i; x += 4) c.px(x, wallTop - 1 - i, roofH)
  c.rect(11, wallTop, 44, 2, t >= 5 ? "#b8860b" : K)
  // Paredes con entramado.
  c.rect(13, wallTop + 2, 40, G - wallTop - 1, K)
  c.rect(14, wallTop + 3, 38, G - wallTop - 3, "#f3e3b6")
  c.rect(14, wallTop + 3, 38, 1, "#fff6d8")
  c.vline(31, wallTop + 3, 18, "#d9c38a")
  c.rect(14, G - 4, 38, 4, "#d9c38a")
  c.hline(14, G - 4, 38, "#c9a56a")
  // Ventana: dentro, el caldero sobre el fuego.
  c.rect(17, wallTop + 6, 12, 10, K)
  c.rect(18, wallTop + 7, 10, 8, ["#ffb347", "#ffc061", "#ffb347", "#ffa83a"][fr % 4])
  c.rect(20, wallTop + 10, 6, 3, "#5a3a24")
  c.hline(20, wallTop + 10, 6, "#7a5a3a")
  c.rect(21, wallTop + 13, 4, 2, fr % 2 ? "#ff8a2e" : "#ffcf2e")
  c.px(22 + (fr % 2), wallTop + 13, "#fff3a0")
  c.vline(23, wallTop + 7, 3, K)
  c.rect(16, wallTop + 16, 14, 1, "#c9a56a")
  // Puerta y cartel con queso.
  c.rect(35, wallTop + 9, 11, G - wallTop - 8, K)
  c.rect(36, wallTop + 10, 9, G - wallTop - 10, "#8b5a2b")
  c.vline(40, wallTop + 10, G - wallTop - 10, "#6b4a2b")
  c.px(43, wallTop + 17, "#ffe55c")
  c.rect(35, wallTop + 2, 11, 6, K)
  c.rect(36, wallTop + 3, 9, 4, "#ffcf2e")
  c.hline(36, wallTop + 3, 9, "#fff3a0")
  c.px(38, wallTop + 5, "#e08a10")
  c.px(42, wallTop + 4, "#e08a10")
  // Ruedas de queso apiladas fuera (una con el tier 2, dos con el 3, tres con el 4).
  for (let i = 0; i < Math.min(3, t - 1); i++) {
    c.rect(2, G - 4 - i * 5, 10, 5, K)
    c.rect(3, G - 3 - i * 5, 8, 3, "#ffcf2e")
    c.hline(3, G - 3 - i * 5, 8, "#fff3a0")
    c.hline(3, G - 2 - i * 5, 8, "#d93a4f")
  }
}

// ---------- TIENDA (50 × 54) ----------
function shop(c, t, fr) {
  const G = 53
  const stripe = ["#e2462f", "#e2462f", "#3d6fd1", "#9a5fd0", "#3fa860", "#d9a514"][t]
  const stripeD = ["#a8301f", "#a8301f", "#2b4f9c", "#6a3fa0", "#2a7a44", "#a8780a"][t]
  const A = G - 34
  // Segundo puesto detrás (tier 4+).
  if (t >= 4) {
    c.rect(26, A - 6, 22, G - A + 7, K)
    c.rect(27, A - 5, 20, G - A + 5, "#e9d2a8")
    c.rect(27, A - 5, 20, 1, "#f6e6c4")
    c.rect(25, A - 8, 24, 3, K)
    c.rect(26, A - 7, 22, 1, stripeD)
    c.rect(30, A, 5, 5, "#ffe55c")
    c.rect(38, A, 5, 5, "#ffe55c")
    c.px(30, A, "#fff3a0")
    c.px(38, A, "#fff3a0")
  }
  // Fondo del puesto, en sombra.
  c.rect(10, A + 9, 30, G - A - 19, "#6b4a2f")
  c.rect(10, A + 9, 30, 2, "#4e3420")
  // Postes.
  c.rect(8, A + 8, 2, G - A - 8, "#5c3620")
  c.rect(40, A + 8, 2, G - A - 8, "#5c3620")
  // Toldo a rayas con festón; segundo piso de toldo desde el tier 2.
  if (t >= 2) for (let i = 0; i < 6; i++) c.rect(7 + i * 6, A - 3, 6, 4, i % 2 ? stripe : "#ffffff")
  c.rect(6, A, 38, 2, K)
  for (let i = 0; i < 6; i++) {
    c.rect(7 + i * 6, A + 2, 6, 7, i % 2 ? "#ffffff" : stripe)
    c.hline(7 + i * 6, A + 2, 6, i % 2 ? "#ffffff" : stripeD)
    c.rect(8 + i * 6, A + 9, 4, 2, i % 2 ? "#dfe6ee" : stripeD)
  }
  // Cartel con queso (tier 1+, más alto con el 2).
  if (t >= 1) {
    const sy = A - 12 - (t >= 2 ? 3 : 0)
    c.vline(25, sy + 8, A - sy - 8, "#5c3620")
    c.rect(19, sy, 13, 9, K)
    c.rect(20, sy + 1, 11, 7, "#f3e3b6")
    c.rect(22, sy + 3, 7, 3, "#ffcf2e")
    c.hline(22, sy + 3, 7, "#fff3a0")
  }
  // Farol (tier 3+): luz cálida que respira.
  if (t >= 3) {
    c.rect(37, A + 12, 3, 5, K)
    c.px(38, A + 13, fr % 4 < 2 ? "#fff3a0" : "#ffe55c")
    c.px(38, A + 14, "#ffcf2e")
    c.px(38, A + 11, K)
  }
  // Mostrador (de oro en el tier 5) con quesos a la venta.
  const wood = t >= 5 ? ["#fff3a0", "#ffcf2e"] : ["#c9975a", "#a9713a"]
  c.rect(6, G - 10, 38, 11, K)
  c.rect(7, G - 9, 36, 9, wood[1])
  c.rect(7, G - 9, 36, 2, wood[0])
  for (let x = 13; x < 43; x += 7) c.vline(x, G - 7, 7, t >= 5 ? "#d9a514" : "#8b5a2b")
  for (let i = 0; i < 4; i++) {
    c.rect(10 + i * 8, G - 15, 6, 5, "#c97a08")
    c.rect(11 + i * 8, G - 14, 4, 3, "#ffcf2e")
    c.hline(11 + i * 8, G - 14, 4, "#fff3a0")
    c.hline(11 + i * 8, G - 12, 4, "#d93a4f")
  }
  // Una moneda salta girando sobre el mostrador y destella al caer.
  if (fr < 6) {
    const cy = G - 13 + [0, -3, -5, -6, -5, -3][fr]
    const cw = [3, 2, 1, 2, 3, 2][fr]
    const cx = 36 - Math.ceil(cw / 2)
    c.rect(cx, cy, cw, 3, cw === 1 ? "#c97a08" : "#ffcf2e")
    if (cw > 1) c.px(cx, cy, "#fff3a0")
    if (cw === 3) c.px(cx + 2, cy + 2, "#c97a08")
  } else {
    c.px(35, G - 12, "#ffffff")
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.px(35 + ox, G - 12 + oy, fr === 6 ? "#fff3a0" : "#ffcf2e")
  }
}

// ---------- ROCA de queso (54 × 42, el tamaño del juego) ----------
// Paletas de ROCK_PAL en js/ui/scene.js; la propuesta añade un brillo y una sombra profunda.
const ROCK_PAL = {
  cheddar: { rock: ["#b4bacb", "#8a90a3", "#656a7b"], cheese: ["#ffe55c", "#ffcf2e", "#f5ab12"], hole: "#e08a10", rim: "#c97a08", glint: "#ffd43a" },
  gouda: { rock: ["#cdb7a0", "#a08a76", "#77634f"], cheese: ["#ffc46a", "#ff9f3a", "#e87a1c"], hole: "#c9600f", rim: "#a8520f", glint: "#ffb04a" },
  brie: { rock: ["#d9d2c4", "#aea596", "#80786b"], cheese: ["#ffffff", "#fbf3d6", "#e3d3a0"], hole: "#c9b06a", rim: "#b09a5a", glint: "#fff8e0" },
  emmental: { rock: ["#c4c9a8", "#989d7c", "#6d7256"], cheese: ["#fff6b0", "#f7de6a", "#dcb93a"], hole: "#a8862a", rim: "#96782a", glint: "#fff2a0" },
  parmesan: { rock: ["#d4b89a", "#a88c70", "#7c644c"], cheese: ["#f6e2b0", "#e3bf78", "#bf9550"], hole: "#8a6630", rim: "#7a5a2a", glint: "#ffe0a0" },
  blue: { rock: ["#aab7d6", "#7f8cb0", "#5a6686"], cheese: ["#f4f1dc", "#dcd8bd", "#7fa7d9"], hole: "#4a78b8", rim: "#8a8870", glint: "#cfe4ff" },
}
const RW = 54, RH = 42

// Copia exacta de buildRock (scene.js), para comparar.
function rockCurrent(c, seed, crack, revealed, deplStage, pal) {
  const cx = 27, cy = 24, a = 25, b = 19
  const inside = (x, y) => x >= 0 && y >= 0 && x < RW && y < RH && Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2) + (h2(x >> 2, y >> 2, seed) - 0.5) * 0.28 < 1
  const core = (x, y) => Math.pow((x - cx) / (a * 0.66), 2) + Math.pow((y - cy - 1) / (b * 0.68), 2) + (h2(x >> 1, y >> 1, seed + 7) - 0.5) * 0.2 < 1
  const holes = []
  for (let i = 0; i < 7; i++) holes.push([cx + (hash(seed * 10 + i) - 0.5) * 26, cy + (hash(seed * 20 + i) - 0.5) * 18, 1.4 + hash(seed * 30 + i) * 2.2])
  const coreTop = cy + 1 - b * 0.68, coreH = 2 * b * 0.68
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (!inside(x, y)) continue
    let color
    const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || (y < RH - 1 && !inside(x, y + 1))
    if (edge) color = "#2b2f3a"
    else if (revealed && core(x, y)) {
      const cavity = (y - coreTop) / coreH < 1 - deplStage / 6
      const rim = !core(x - 1, y) || !core(x + 1, y) || !core(x, y - 1) || !core(x, y + 1)
      if (cavity) color = rim ? "#1c1410" : h2(x >> 1, y >> 1, seed + 11) > 0.8 ? "#4a3524" : "#33241a"
      else if (rim) color = pal.rim
      else if (holes.some((h) => Math.hypot(x - h[0], y - h[1]) < h[2])) color = pal.hole
      else color = y - cy < -4 ? pal.cheese[0] : y - cy < 6 ? pal.cheese[1] : pal.cheese[2]
    } else {
      const lit = (x - cx) * -0.4 + (y - cy) * -1 + h2(x >> 1, y >> 1, seed + 3) * 6
      color = lit > 8 ? pal.rock[0] : lit > -4 ? pal.rock[1] : pal.rock[2]
      if (!revealed && crack >= 3 && core(x, y) && h2(x, y, seed + 5) > (crack >= 4 ? 0.9 : 0.96)) color = pal.glint
    }
    c.px(x, y, color)
  }
  if (!revealed) for (let w = 0; w < crack * 2; w++) {
    let x = cx + (hash(seed + w * 13) - 0.5) * 8, y = cy + (hash(seed + w * 17) - 0.5) * 6
    const ang = hash(seed + w * 29) * Math.PI * 2
    for (let step = 0; step < 12; step++) {
      x += Math.cos(ang) + (hash(seed + w * 31 + step) - 0.5) * 1.6
      y += Math.sin(ang) + (hash(seed + w * 37 + step) - 0.5) * 1.6
      if (inside(Math.round(x), Math.round(y))) c.px(Math.round(x), Math.round(y), "#1d2029")
    }
  }
}

// Propuesta: roca por planos (como el tutorial: silueta, caras con luz, sombras secundarias, trama
// en las transiciones), luz de arriba a la izquierda.
const pip = (poly, x, y) => {
  const px = x + 0.5, py = y + 0.5
  let inn = false
  for (let i = 0, j = poly.length / 2 - 1; i < poly.length / 2; j = i++) {
    const xi = poly[i * 2], yi = poly[i * 2 + 1], xj = poly[j * 2], yj = poly[j * 2 + 1]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inn = !inn
  }
  return inn
}
// Cinco bloques, de atrás adelante. Cada uno: silueta, cara de arriba (luz), cara lateral (sombra),
// arista con brillo y alguna marca de sombra secundaria. La veta se abre en el bloque central.
const CHUNKS = [
  { body: [6, 31, 5, 18, 9, 10, 15, 6, 21, 7, 25, 12, 25, 31], top: [5, 18, 9, 10, 15, 6, 21, 7, 25, 12, 18, 13, 11, 16], side: [25, 12, 25, 31, 21, 31, 21, 14], hi: [9, 11, 15, 7, 20, 8, 15, 9, 10, 13], marks: [[[9, 20], [11, 25]]] },
  { body: [24, 31, 25, 15, 30, 10, 38, 9, 45, 13, 49, 20, 49, 31], top: [25, 15, 30, 10, 38, 9, 45, 13, 39, 15, 31, 17], side: [45, 13, 49, 20, 49, 31, 43, 31, 42, 18, 39, 15], hi: [30, 11, 38, 10, 42, 12, 36, 12], marks: [[[31, 20], [35, 22]]] },
  { body: [0, 42, 0, 30, 3, 25, 9, 22, 16, 24, 19, 30, 18, 42], top: [0, 30, 3, 25, 9, 22, 16, 24, 11, 28, 4, 30], side: [16, 24, 19, 30, 18, 42, 14, 42, 14, 30, 13, 27], hi: [3, 26, 9, 23, 12, 24, 6, 26], marks: [[[4, 33], [7, 36]]] },
  { body: [14, 42, 15, 26, 20, 20, 30, 17, 39, 20, 43, 28, 42, 42], top: [15, 26, 20, 20, 30, 17, 39, 20, 33, 23, 22, 24], side: [39, 20, 43, 28, 42, 42, 38, 42, 38, 30, 35, 23], hi: [20, 21, 29, 18, 33, 19, 24, 21], marks: [] },
  { body: [40, 42, 41, 33, 45, 28, 51, 28, 54, 33, 54, 42], top: [41, 33, 45, 28, 51, 28, 54, 33, 48, 33], side: [52, 30, 54, 33, 54, 42, 50, 42, 50, 34], hi: [45, 29, 50, 29, 48, 30], marks: [] },
]
const DITH = (x, y) => (x + y) % 2 === 0
const SPARSE = (x, y) => x % 2 === 0 && y % 2 === 0
// Grietas por grado: cada grado añade dos, que salen del centro del bloque central.
const CRACKS = [
  [[28, 31], [25, 28], [23, 26]], [[28, 31], [32, 34], [34, 38]],
  [[27, 32], [23, 35], [21, 38]], [[29, 30], [33, 28], [36, 25]],
  [[23, 26], [20, 26]], [[32, 34], [36, 33]],
  [[23, 35], [19, 35]], [[33, 28], [34, 24]],
]
// Cavidad de la veta, ya abierta, en la cara de frente del bloque central.
const VEIN = [15, 31, 19, 25, 27, 22, 35, 24, 39, 30, 37, 37, 30, 40, 19, 40, 15, 36]
const HOLES = [[21, 31, 2], [30, 27, 1.6], [33, 34, 2.2], [24, 37, 1.4], [27.5, 31.5, 1]]

function bres(pts, cb) {
  for (let i = 0; i + 1 < pts.length; i++) {
    let [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1
    let err = dx + dy
    for (;;) {
      cb(x0, y0)
      if (x0 === x1 && y0 === y1) break
      const e2 = 2 * err
      if (e2 >= dy) { err += dy; x0 += sx }
      if (e2 <= dx) { err += dx; y0 += sy }
    }
  }
}

function rockNew(c, pal, { crack = 0, revealed = false, depl = 6 } = {}) {
  const T = { A: mix(pal.rock[0], "#ffffff", 0.4), a: pal.rock[0], m: pal.rock[1], d: pal.rock[2], D: mix(pal.rock[2], "#1d2029", 0.55) }
  const down = { A: "a", a: "m", m: "d", d: "d", D: "D" }
  const g = [], own = []
  for (let y = 0; y < RH; y++) { g[y] = Array(RW).fill(null); own[y] = Array(RW).fill(-1) }
  CHUNKS.forEach((ch, i) => {
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      if (!pip(ch.body, x, y)) continue
      let tone = "m"
      if (pip(ch.side, x, y)) tone = "d"
      else if (pip(ch.top, x, y)) tone = "a"
      // Transiciones en trama, más densa cerca del plano: hacia la sombra lateral y bajo la luz.
      else if (pip(ch.side, x + 1, y) && DITH(x, y)) tone = "d"
      else if ((pip(ch.side, x + 2, y) || pip(ch.side, x + 3, y)) && SPARSE(x, y)) tone = "d"
      else if (pip(ch.top, x, y - 1) && DITH(x, y)) tone = "a"
      else if (pip(ch.top, x, y - 2) && SPARSE(x, y)) tone = "a"
      if (pip(ch.hi, x, y)) tone = "A"
      g[y][x] = tone
      own[y][x] = i
    }
    for (const m of ch.marks) bres(m, (x, y) => { if (own[y][x] === i) g[y][x] = down[g[y][x]] })
  })
  // Grietas entre bloques: el borde del bloque de delante, donde toca a uno de detrás.
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    const o = own[y][x]
    if (o < 0) continue
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = own[y + dy] && own[y + dy][x + dx]
      if (n !== undefined && n >= 0 && n < o) { g[y][x] = "D"; break }
    }
  }
  // Contacto con el suelo: las tres últimas filas se oscurecen.
  for (let y = RH - 5; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (!g[y][x] || g[y][x] === "D") continue
    if (y === RH - 1) g[y][x] = "D"
    else if (y === RH - 2 || (y === RH - 3 && DITH(x, y)) || (y >= RH - 5 && SPARSE(x, y + (y === RH - 4 ? 1 : 0)))) g[y][x] = down[g[y][x]]
  }
  if (!revealed) {
    const lines = CRACKS.slice(0, crack * 2)
    for (const l of lines) bres(l, (x, y) => {
      g[y][x] = "#1d2029"
      // Canto de luz bajo la grieta, donde la piedra se abre.
      if (g[y + 1] && g[y + 1][x] && g[y + 1][x].length === 1 && g[y + 1][x] !== "D") g[y + 1][x] = { d: "m", m: "a", a: "A", A: "A" }[g[y + 1][x]]
    })
    // Desde el grado 3 asoma queso por las grietas, más con el 4.
    if (crack >= 3) lines.forEach((l, i) => bres(l, (x, y) => { if ((x * 3 + y + i) % (crack >= 4 ? 3 : 5) === 0) g[y][x] = pal.glint }))
  } else {
    const inV = (x, y) => pip(VEIN, x, y)
    let top = RH, bot = 0
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) if (inV(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y) }
    const h = bot - top + 1
    const emptyTo = top + Math.round(h * (1 - depl / 6))
    const hi = mix(pal.cheese[0], "#ffffff", 0.55)
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      if (!inV(x, y)) {
        // Labio de la cavidad: el borde de abajo a la derecha recibe la luz.
        if (g[y][x] && g[y][x].length === 1 && (inV(x - 1, y) || inV(x, y - 1)) && !inV(x + 1, y) && !inV(x, y + 1)) g[y][x] = "a"
        continue
      }
      const shadowEdge = !inV(x, y - 1) || !inV(x - 1, y)
      const edge = shadowEdge || !inV(x + 1, y) || !inV(x, y + 1)
      if (y < emptyTo) {
        g[y][x] = edge ? "#1c1410" : x % 5 === 2 && y % 3 === 0 ? "#4a3524" : "#33241a"
        continue
      }
      if (y === emptyTo && emptyTo > top) { g[y][x] = pal.rim; continue }
      if (shadowEdge) { g[y][x] = mix(pal.rim, "#1d2029", 0.4); continue }
      if (edge) { g[y][x] = pal.rim; continue }
      const hole = HOLES.find(([hx, hy, r]) => Math.hypot(x + 0.5 - hx, y + 0.5 - hy) < r)
      if (hole) {
        const [hx, hy, r] = hole
        g[y][x] = Math.hypot(x - 0.5 - hx, y - 0.5 - hy) < r ? pal.hole : pal.rim
        continue
      }
      const ry = (y - top) / h
      let col = ry < 0.35 ? pal.cheese[0] : ry < 0.7 ? pal.cheese[1] : pal.cheese[2]
      if (ry >= 0.3 && ry < 0.4 && DITH(x, y)) col = pal.cheese[1]
      if (ry >= 0.65 && ry < 0.75 && DITH(x, y)) col = pal.cheese[2]
      if (y > emptyTo && x + y >= 45 && x + y <= 46 && x < 24) col = hi
      g[y][x] = col
    }
  }
  // Contorno del juego por fuera de los bloques (menos la fila del suelo).
  const inR = (x, y) => own[y] !== undefined && own[y][x] !== undefined && own[y][x] >= 0
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (!g[y][x]) continue
    const edge = !inR(x - 1, y) || !inR(x + 1, y) || !inR(x, y - 1) || (y < RH - 1 && !inR(x, y + 1))
    const v = edge ? "#2b2f3a" : g[y][x]
    c.px(x, y, v.length === 1 ? T[v] : v)
  }
}

const STATES = { intact: { crack: 0 }, crack2: { crack: 2 }, crack4: { crack: 4 }, vein: { revealed: true, depl: 6 }, half: { revealed: true, depl: 3 }, low: { revealed: true, depl: 1 } }
Object.keys(ROCK_PAL).forEach((zone, zi) => {
  for (const [st, o] of Object.entries(STATES)) {
    sprite(`rock_${zone}_${st}`, { w: RW, h: RH }, (c) => rockNew(c, ROCK_PAL[zone], o))
    sprite(`rockcur_${zone}_${st}`, { w: RW, h: RH }, (c) => rockCurrent(c, (zi + 1) * 100, o.crack || 0, !!o.revealed, o.depl || 6, ROCK_PAL[zone]))
  }
})

const SIZES = { drill: [44, 44, drill], refinery: [56, 70, refinery], cheesery: [60, 68, cheesery], shop: [50, 54, shop] }
for (const [name, [w, h, fn]] of Object.entries(SIZES)) {
  for (let t = 0; t <= 5; t++) anim(`${name}_${t}`, { w, h, frames: N, fps: 10 }, (c) => fn(c, t, c.frame))
}

// =====================================================================================
// PULIDO+ : los mismos edificios con el tratamiento de la roca. Cinco tonos por material
// (brillo y sombra profunda sacados de cada color), luz arriba a la izquierda, lado derecho en
// sombra con trama, apoyo oscuro en el suelo, sombras arrojadas (alero) y huecos hundidos.
// Misma resolución, mismas piezas por tier.
// =====================================================================================
const DEEP = "#1d1830"
const r5 = (l, m, d) => [mix(l, "#ffffff", 0.35), l, m, d, mix(d, DEEP, 0.45)]
const DI = (x, y) => (x + y) % 2 === 0
const SP = (x, y) => x % 2 === 0 && y % 2 === 0
const PLA = ["#fffaea", "#f6e6c0", "#ecd6a6", "#cfb07e", "#9a7a64"]
const WOO = ["#d9a06a", "#b07642", "#8b5a2b", "#633c22", "#3e2420"]
const BRI = ["#eaa07a", "#c97a5a", "#a85a3a", "#7a3a2a", "#4e2428"]
const PLI = ["#f4e6be", "#e3cc96", "#d0b47c", "#a88a60", "#6e5848"]
const STL = ["#a7b0c8", "#7a819a", "#596079", "#3f455c", "#262a3c"]
const TNK = ["#ffffff", "#e6ecf3", "#b6bccb", "#858b9e", "#535868"]
const CHZ = ["#fff3a0", "#ffd43a", "#f5ab12", "#c97a08"]
const FAB = ["#ffffff", "#f3f3f8", "#d8dae6", "#a9acc0"]

// Caja con volumen. R = rampa de 5 (A, a, m, d, D).
function vbox(c, x, y, w, h, R, { edge = K, side = 3, ao = 3, top = 2 } = {}) {
  c.rect(x, y, w, h, edge)
  const ix = x + 1, iy = y + 1, iw = w - 2, ih = h - 2
  c.rect(ix, iy, iw, ih, R[2])
  c.rect(ix, iy, iw, Math.min(top, ih), R[1])
  c.hline(ix, iy, iw, R[0])
  c.vline(ix, iy + 1, ih - 1, R[1])
  for (let k = 0; k < side; k++) {
    const xx = ix + iw - 1 - k
    for (let yy = iy + 1; yy < iy + ih; yy++) if (k === 0 || (k === 1 && DI(xx, yy)) || (k === 2 && SP(xx, yy))) c.px(xx, yy, R[3])
  }
  for (let j = 0; j < ao; j++) {
    const yy = iy + ih - 1 - j
    for (let xx = ix; xx < ix + iw; xx++) if (j === 0 || (j === 1 && DI(xx, yy)) || (j === 2 && SP(xx, yy))) c.px(xx, yy, j === 0 ? R[4] : R[3])
  }
}
// Cilindro de pie (chimeneas, depósitos): brillo a un tercio por la izquierda, sombra a la derecha.
function cyl(c, x, y, w, h, R, edge = K) {
  c.rect(x, y, w, h, edge)
  const n = w - 2
  for (let i = 0; i < n; i++) {
    const f = n > 1 ? i / (n - 1) : 0
    const t = f < 0.15 ? 1 : f < 0.4 ? 0 : f < 0.65 ? 2 : f < 0.85 ? 3 : 4
    c.vline(x + 1 + i, y + 1, h - 2, R[t])
  }
}
// Hueco hundido: sombra dentro arriba y a la izquierda, labio con luz abajo y a la derecha.
function recess(c, x, y, w, h, R, edge = K) {
  c.rect(x, y, w, h, edge)
  c.hline(x + 1, y + h, w, R[0])
  c.vline(x + w, y + 1, h, R[0])
}
// Sombra arrojada en trama sobre una pared de rampa R: fila llena, luego trama, luego rala.
function castShadow(c, x, y, w, R) {
  for (let xx = x; xx < x + w; xx++) {
    c.px(xx, y, R[3])
    if (DI(xx, y + 1)) c.px(xx, y + 1, R[3])
    if (SP(xx, y + 2)) c.px(xx, y + 2, R[3])
  }
}

// ---------- TALADRO+ ----------
function drillP(c, t, fr) {
  const G = 49
  const MR = r5(...METAL[t])
  const big = t >= 2 ? 3 : 0
  // fr < 0: parado (sin humo, sin chispas, sin vibrar, luz apagada).
  const idle = fr < 0
  if (idle) fr = 0
  const j = idle ? 0 : fr % 2
  if (t >= 3) {
    c.rect(2, G - 6, 25, 7, K)
    c.rect(3, G - 5, 23, 5, "#3a3d4a")
    c.hline(3, G - 5, 23, "#6a7082")
    c.hline(3, G - 1, 23, "#24262f")
    for (let i = 0; i < 6; i++) { const tx = 3 + ((i * 4 + fr) % 23); c.rect(tx, G - 4, 2, 2, "#8a90a3"); c.px(tx, G - 4, "#c9d0df") }
  } else {
    for (const wx of [4, 16]) {
      ell2(c, wx + 3.5, G - 2.5, 4, 3.5, K)
      ell2(c, wx + 3.5, G - 2.5, 3, 2.5, "#3a3d4a")
      ell2(c, wx + 3, G - 3, 2, 1.5, "#565b6b")
      const sp = [[0, 0], [1, 0], [1, 1], [0, 1]][fr % 4]
      c.px(wx + 3 + sp[0], G - 3 + sp[1], "#c9d0df")
    }
  }
  const top = G - 17 - big
  // Escape delante, junto a la broca: el humo sale hacia delante, lejos del puesto de mando.
  // Con el tier 1 el tubo crece y echa más humo.
  const ph = t >= 1 ? 9 : 6
  cyl(c, 22 + j, top - ph + 1, 4, ph, STL)
  c.rect(21 + j, top - ph, 6, 2, K)
  c.hline(22 + j, top - ph, 4, STL[1])
  if (!idle) smoke(c, 24, top - ph - 3, fr, { n: t >= 1 ? 3 : 2, rise: 10, drift: 4, size: 1.8, tones: FUMES })
  vbox(c, 2 + j, top, 24, G - 5 - top, MR, { side: 4, ao: 3 })
  // Puesto del conductor, igual en todos los tiers y siempre en el mismo sitio respecto a la
  // plataforma (`top`): asiento tapizado (respaldo y cojín) y panel con su palanca delante.
  // El ratón conductor se ancla en (x + 1, y + top - 21) del sprite: vale para cualquier tier.
  const SEAT = ["#f08a6a", "#d9573f", "#a83a30", "#6e2228"]
  c.rect(1 + j, top - 15, 5, 15, K)
  c.rect(2 + j, top - 14, 3, 13, SEAT[1])
  c.vline(2 + j, top - 14, 13, SEAT[0]); c.vline(4 + j, top - 13, 12, SEAT[2])
  c.hline(2 + j, top - 14, 3, SEAT[0])
  for (const y of [top - 10, top - 6]) c.px(3 + j, y, SEAT[3])
  c.rect(4 + j, top - 4, 9, 4, K)
  c.rect(5 + j, top - 3, 7, 2, SEAT[1])
  c.hline(5 + j, top - 3, 7, SEAT[0]); c.hline(5 + j, top - 2, 7, SEAT[2])
  c.px(8 + j, top - 3, SEAT[3])
  vbox(c, 17 + j, top - 6, 5, 7, STL, { side: 1, ao: 0, top: 1 })
  c.px(18 + j, top - 3, idle ? "#3a3d4a" : fr % 4 < 2 ? "#5fcf6a" : "#2f8f44")
  c.vline(19 + j, top - 9, 3, "#3a3d4a")
  c.rect(18 + j, top - 12, 3, 3, K)
  c.px(18 + j, top - 11, "#ff8a6a"); c.px(19 + j, top - 11, "#e2462f"); c.px(19 + j, top - 10, "#a8301f")
  for (let x = 6; x < 22; x += 5) { c.px(x + j, top + 4, MR[0]); c.px(x + j + 1, top + 5, MR[3]) }
  c.hline(4 + j, top + 7, 18, MR[3])
  c.hline(4 + j, top + 8, 18, MR[1])
  recess(c, 14 + j, G - 13, 6, 4, MR)
  c.rect(15 + j, G - 12, 4, 2, idle ? MR[3] : fr % 4 < 2 ? "#ffe55c" : "#ffffff")
  c.px(15 + j, G - 12, "#ffffff")
  // Tier 4+: tejadillo sobre el asiento, sujeto detrás del respaldo (el conductor cabe debajo).
  if (t >= 4) {
    c.rect(1 + j, top - 24, 2, 10, K)
    c.vline(2 + j, top - 23, 9, STL[1])
    vbox(c, 0 + j, top - 27, 22, 4, MR, { side: 3, ao: 1, top: 1 })
  }
  // Broca: mitad de arriba con luz, de abajo en sombra; la espiral gira.
  const SR = t >= 5 ? ["#fff8c8", "#ffe55c", "#d9a514", "#a8780a", "#6a4a08"] : STL
  const mid = G - 12 - (big ? 1 : 0)
  const hh = (x) => (x < 29 ? 4 : x < 32 ? 3 : x < 34 ? 2 : 1)
  const tipEnd = t >= 2 ? 36 : 35
  for (let x = 26; x <= tipEnd; x++) {
    const h = hh(x)
    for (let y = mid - h; y <= mid + h; y++) {
      const rel = (y - mid) / (h || 1)
      let tone = rel < -0.5 ? 1 : rel < 0.2 ? 2 : rel < 0.7 ? 3 : 4
      if ((x + y + fr) % 4 === 0) tone = Math.max(0, tone - 2)
      c.px(x + j, y, SR[tone])
    }
    c.px(x + j, mid - h - 1, K)
    c.px(x + j, mid + h + 1, K)
  }
  c.px(tipEnd + 1 + j, mid, SR[0])
  if (!idle) sparks(c, tipEnd + 2, mid, fr)
}
function ell2(c, cx, cy, rx, ry, col) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry
      if (dx * dx + dy * dy <= 1) c.px(x, y, col)
    }
}

// ---------- REFINERÍA+ ----------
function refineryP(c, t, fr) {
  const G = 69
  const M = METAL[t]
  const body = ["#3d6fd1", "#3d6fd1", "#3d8fd1", "#6a5fd0", "#2f9f8a", "#d9a514"][t]
  const hi = ["#74a6ff", "#74a6ff", "#7fc4ff", "#a99ff0", "#7fe0b8", "#fff3a0"][t]
  const low = ["#2b4f9c", "#2b4f9c", "#2b6a9c", "#4a4296", "#1f7a5a", "#b8860b"][t]
  const BR5 = r5(hi, body, low)
  const top = G - 27 + (fr % 4 === 0 ? 1 : 0)
  const chimneys = 1 + (t >= 1 ? 1 : 0) + (t >= 4 ? 1 : 0)
  for (let i = 0; i < chimneys; i++) {
    const cx = 43 - i * 9
    const ch = 10 + i * 4 + (t >= 3 ? 6 : 0)
    cyl(c, cx, top - ch, 7, ch + 1, STL, "#1f2a44")
    for (let y = top - ch + 5; y < top; y += 5) { c.hline(cx + 1, y, 5, STL[3]); c.hline(cx + 1, y + 1, 5, STL[1]) }
    c.rect(cx - 1, top - ch - 1, 9, 3, "#1f2a44")
    c.hline(cx, top - ch, 7, M[0])
    c.hline(cx, top - ch + 1, 7, M[1])
    smoke(c, cx + 3, top - ch - 3, fr, { d: i * 3, drift: 5 })
  }
  if (t >= 2) {
    cyl(c, 2, G - 22, 13, 23, TNK, "#1f2a44")
    c.rect(1, G - 23, 15, 2, "#1f2a44")
    c.hline(2, G - 23, 13, TNK[2])
    for (const by of [G - 14, G - 6]) { c.hline(3, by, 11, TNK[4]); c.hline(3, by + 1, 11, TNK[1]) }
    recess(c, 9, G - 19, 3, 11, TNK, "#1f2a44")
    const lv = 5 + [0, 1, 2, 2, 1, 0, 0, 0][fr]
    c.rect(10, G - 9 - lv, 1, lv, "#ffcf2e")
    c.px(10, G - 9 - lv, "#fff3a0")
    cyl(c, 14, G - 18, 4, 4, STL, "#1f2a44")
    cyl(c, 5, G - 26, 6, 4, STL, "#1f2a44")
  }
  vbox(c, 18, top - 4, 16, 5, WOO, { side: 2, ao: 1, top: 1 })
  c.rect(21, top, 10, 2, WOO[4])
  vbox(c, 16, top, 36, G - top, BR5, { edge: "#1f2a44", side: 4, ao: 4, top: 3 })
  c.hline(17, G - 8, 34, BR5[3])
  c.hline(17, G - 7, 34, BR5[1])
  for (let x = 19; x < 48; x += 4) { c.px(x, G - 5, BR5[0]); c.px(x + 1, G - 4, BR5[3]) }
  for (let x = 19; x < 48; x += 4) { c.px(x, top + 4, BR5[0]); c.px(x + 1, top + 5, BR5[3]) }
  recess(c, 20, top + 6, 18, 12, BR5, "#1f2a44")
  fire(c, 21, top + 7, 16, 10, fr)
  c.hline(21, top + 7, 16, "#2a0e08")
  c.vline(21, top + 7, 10, "#2a0e08")
  recess(c, 41, top + 9, 9, 7, BR5, "#1f2a44")
  c.rect(42, top + 10, 7, 5, "#f3e3b6")
  c.hline(42, top + 10, 7, "#d9c38a")
  c.px(45, top + 12, K)
  c.px([43, 44, 45, 46, 47, 46, 45, 44][fr], top + 11, "#d93a4f")
  if (t >= 3) {
    recess(c, 41, top + 18, 9, 5, BR5, "#1f2a44")
    c.rect(42, top + 19, 7, 3, "#656a7b")
    c.hline(42, top + 19, 7, "#8a90a3")
    c.px(44 + (fr % 2) * 2, top + 20, "#d93a4f")
    c.px(45, top + 19 + (fr % 2) * 2, "#d93a4f")
    if (fr >= 4) smoke(c, 51, top + 18, (fr - 4) * 2, { n: 1, rise: 6, drift: 2, size: 1.5 })
  }
  if (t >= 5) c.hline(17, top + 1, 34, "#ffffff")
  c.rect(18, G, 6, 1, "#1f2a44")
  c.rect(44, G, 6, 1, "#1f2a44")
}

// ---------- QUESERÍA+ ----------
function cheeseryP(c, t, fr) {
  const G = 67
  const roofA = ["#b8503a", "#b8503a", "#3d6fd1", "#7a6fd0", "#3fb38a", "#d9a514"][t]
  const roofB = ["#8f3b2a", "#8f3b2a", "#2b4f9c", "#4a4296", "#1f7a5a", "#b8860b"][t]
  const roofH = ["#d9735a", "#d9735a", "#74a6ff", "#a99ff0", "#7fe0b8", "#fff3a0"][t]
  const RR = r5(roofH, roofA, roofB)
  const wallTop = G - 24
  const roof = (x0, x1, yBase, rows, tileEvery) => {
    for (let i = 0; i < rows; i++) {
      const y = yBase - i, l = x0 + i, r = x1 - i
      for (let x = l; x <= r; x++) {
        let tone = i % 3 === 0 ? 3 : 2
        if (i % 3 === 2) tone = 1
        if (x > r - 6 && DI(x, y)) tone++
        if (x > r - 3) tone++
        if (i % 3 === 1 && (x - l) % tileEvery === 0) tone = 0
        c.px(x, y, RR[Math.min(4, tone)])
      }
      c.px(l, y, RR[1])
      c.px(r, y, RR[4])
    }
  }
  if (t >= 3) {
    vbox(c, 40, G - 52, 14, 30, PLA, { side: 3, ao: 0 })
    roof(39, 54, G - 53, 5, 3)
    recess(c, 44, G - 46, 6, 6, PLA)
    c.rect(45, G - 45, 4, 4, fr < 4 ? "#ffcf2e" : "#ffb347")
    c.px(45, G - 45, "#fff3a0")
    c.hline(41, G - 38, 12, PLA[3])
  }
  const stacks = t >= 1 ? [24, 16] : [24]
  stacks.forEach((sx, i) => {
    c.rect(sx, wallTop - 14, 6, 12, K)
    for (let r = 0; r < 5; r++) {
      const y = wallTop - 13 + r * 2
      c.hline(sx + 1, y, 4, BRI[2])
      c.px(sx + 1 + (r % 2 ? 2 : 0), y, BRI[1])
      c.hline(sx + 1, y + 1, 4, BRI[3])
    }
    c.vline(sx + 1, wallTop - 13, 10, BRI[1])
    c.vline(sx + 4, wallTop - 13, 10, BRI[3])
    c.rect(sx - 1, wallTop - 15, 8, 2, K)
    c.hline(sx, wallTop - 15, 6, PLI[2])
    smoke(c, sx + 3, wallTop - 17, fr, { d: i * 4, drift: 5 })
  })
  roof(11, 54, wallTop - 1, 10, 4)
  c.rect(11, wallTop, 44, 2, t >= 5 ? "#b8860b" : K)
  c.hline(12, wallTop, 42, t >= 5 ? "#fff3a0" : WOO[3])
  // Pared de revoque con volumen y la sombra del alero.
  vbox(c, 13, wallTop + 2, 40, G - wallTop - 1, PLA, { side: 4, ao: 0, top: 1 })
  castShadow(c, 14, wallTop + 3, 38, PLA)
  c.vline(31, wallTop + 6, 15, PLA[3])
  c.vline(32, wallTop + 6, 15, PLA[1])
  // Zócalo de piedra con juntas al tresbolillo.
  c.rect(14, G - 4, 38, 4, PLI[2])
  for (let r = 0; r < 2; r++) {
    const y = G - 4 + r * 2
    c.hline(14, y, 38, PLI[1])
    for (let x = 14 + (r ? 3 : 0); x < 52; x += 6) { c.px(x, y, PLI[0]); if (x + 5 < 52) c.vline(x + 5, y, 2, PLI[4]) }
    c.hline(14, y + 1, 38, PLI[3])
  }
  c.hline(14, G - 1, 38, PLI[4])
  // Ventana hundida con el caldero.
  recess(c, 17, wallTop + 6, 12, 10, PLA)
  c.rect(18, wallTop + 7, 10, 8, ["#ffb347", "#ffc061", "#ffb347", "#ffa83a"][fr % 4])
  c.hline(18, wallTop + 7, 10, "#e0702a")
  c.vline(18, wallTop + 7, 8, "#e0702a")
  c.rect(20, wallTop + 10, 6, 3, "#5a3a24")
  c.hline(20, wallTop + 10, 6, "#8a6a4a")
  c.rect(21, wallTop + 13, 4, 2, fr % 2 ? "#ff8a2e" : "#ffcf2e")
  c.px(22 + (fr % 2), wallTop + 13, "#fff3a0")
  c.vline(23, wallTop + 7, 3, K)
  c.rect(16, wallTop + 16, 14, 2, WOO[3])
  c.hline(16, wallTop + 16, 14, WOO[1])
  // Puerta de tablones, hundida.
  recess(c, 35, wallTop + 9, 11, G - wallTop - 13, PLA)
  for (let x = 36; x < 45; x += 3) {
    c.vline(x, wallTop + 10, G - wallTop - 14, WOO[1])
    c.vline(x + 1, wallTop + 10, G - wallTop - 14, WOO[2])
    c.vline(x + 2, wallTop + 10, G - wallTop - 14, WOO[3])
  }
  c.hline(36, wallTop + 10, 9, WOO[4])
  c.px(43, wallTop + 17, "#ffe55c")
  c.px(43, wallTop + 18, "#c97a08")
  // Cartel de queso con volumen.
  c.rect(35, wallTop + 2, 11, 6, K)
  c.rect(36, wallTop + 3, 9, 4, CHZ[1])
  c.hline(36, wallTop + 3, 9, CHZ[0])
  c.hline(36, wallTop + 6, 9, CHZ[2])
  c.px(38, wallTop + 4, CHZ[3]); c.px(42, wallTop + 5, CHZ[3]); c.px(39, wallTop + 5, CHZ[2])
  // Ruedas de queso con canto y cera.
  for (let i = 0; i < Math.min(3, t - 1); i++) {
    const y = G - 4 - i * 5
    c.rect(2, y, 10, 5, K)
    c.rect(3, y + 1, 8, 3, CHZ[2])
    c.hline(3, y + 1, 8, CHZ[0])
    c.hline(4, y + 1, 5, "#fffbe0")
    c.hline(3, y + 2, 8, CHZ[1])
    c.hline(3, y + 3, 8, "#d93a4f")
    c.px(10, y + 3, "#9a2a3a")
  }
}

// ---------- TIENDA+ ----------
function shopP(c, t, fr) {
  const G = 53
  const stripe = ["#e2462f", "#e2462f", "#3d6fd1", "#9a5fd0", "#3fa860", "#d9a514"][t]
  const stripeD = ["#a8301f", "#a8301f", "#2b4f9c", "#6a3fa0", "#2a7a44", "#a8780a"][t]
  const SR = r5(mix(stripe, "#ffffff", 0.25), stripe, stripeD)
  const A = G - 34
  if (t >= 4) {
    vbox(c, 26, A - 6, 22, G - A + 7, PLA, { side: 3, ao: 3 })
    c.rect(25, A - 8, 24, 3, K)
    c.hline(26, A - 7, 22, SR[2])
    castShadow(c, 27, A - 5, 20, PLA)
    for (const wx of [30, 38]) {
      recess(c, wx, A, 5, 5, PLA)
      c.rect(wx + 1, A + 1, 4, 4, "#ffe55c")
      c.px(wx + 1, A + 1, "#fff8c8")
    }
  }
  // Fondo en sombra, más oscuro arriba (bajo el toldo).
  c.rect(10, A + 9, 30, G - A - 19, WOO[3])
  for (let x = 10; x < 40; x++) { c.px(x, A + 9, WOO[4]); c.px(x, A + 10, WOO[4]); if (DI(x, A + 11)) c.px(x, A + 11, WOO[4]) }
  for (let x = 12; x < 40; x += 5) c.vline(x, A + 12, G - A - 22, WOO[4])
  // Postes redondos.
  cyl(c, 7, A + 8, 4, G - A - 8, WOO, K)
  cyl(c, 39, A + 8, 4, G - A - 8, WOO, K)
  // Toldo: cada franja con luz arriba y pliegue en sombra abajo.
  const band = (x, y, w, h, white) => {
    const R = white ? FAB : SR
    for (let yy = 0; yy < h; yy++) {
      let tone = yy === 0 ? 0 : yy < h / 2 ? 1 : 2
      for (let xx = 0; xx < w; xx++) {
        let tt = tone
        if (yy >= h - 2 && DI(x + xx, y + yy)) tt++
        if (xx === w - 1) tt++
        c.px(x + xx, y + yy, R[Math.min(R.length - 1, tt)])
      }
    }
  }
  if (t >= 2) for (let i = 0; i < 6; i++) band(7 + i * 6, A - 3, 6, 4, i % 2 === 0)
  c.rect(6, A, 38, 2, K)
  c.hline(7, A, 36, WOO[3])
  for (let i = 0; i < 6; i++) {
    band(7 + i * 6, A + 2, 6, 7, i % 2 === 1)
    const R = i % 2 ? FAB : SR
    c.rect(8 + i * 6, A + 9, 4, 2, R[2])
    c.hline(8 + i * 6, A + 10, 4, R[3])
  }
  if (t >= 1) {
    const sy = A - 12 - (t >= 2 ? 3 : 0)
    c.vline(25, sy + 8, A - sy - 8, WOO[3])
    vbox(c, 19, sy, 13, 9, WOO, { side: 2, ao: 1, top: 1 })
    c.rect(22, sy + 3, 7, 3, CHZ[1])
    c.hline(22, sy + 3, 7, CHZ[0])
    c.hline(22, sy + 5, 7, CHZ[2])
    c.px(24, sy + 4, CHZ[3])
  }
  if (t >= 3) {
    c.rect(37, A + 12, 3, 5, K)
    c.px(38, A + 13, fr % 4 < 2 ? "#fff8c8" : "#ffe55c")
    c.px(38, A + 14, "#ffcf2e")
    c.px(38, A + 11, K)
  }
  const WR = t >= 5 ? ["#fffbe0", "#fff3a0", "#ffcf2e", "#d9a514", "#a8780a"] : WOO
  vbox(c, 6, G - 10, 38, 11, WR, { side: 3, ao: 2 })
  for (let x = 13; x < 42; x += 7) { c.vline(x, G - 7, 6, WR[3]); c.vline(x + 1, G - 7, 6, WR[1]) }
  c.hline(7, G - 8, 36, WR[3])
  for (let i = 0; i < 4; i++) {
    c.rect(10 + i * 8, G - 15, 6, 5, K)
    c.rect(11 + i * 8, G - 14, 4, 3, CHZ[2])
    c.hline(11 + i * 8, G - 14, 4, CHZ[0])
    c.hline(11 + i * 8, G - 13, 4, CHZ[1])
    c.hline(11 + i * 8, G - 12, 4, "#d93a4f")
  }
  if (fr < 6) {
    const cy = G - 13 + [0, -3, -5, -6, -5, -3][fr]
    const cw = [3, 2, 1, 2, 3, 2][fr]
    const cx = 36 - Math.ceil(cw / 2)
    c.rect(cx, cy, cw, 3, cw === 1 ? "#c97a08" : "#ffcf2e")
    if (cw > 1) c.px(cx, cy, "#fff3a0")
    if (cw === 3) c.px(cx + 2, cy + 2, "#c97a08")
  } else {
    c.px(35, G - 12, "#ffffff")
    for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) c.px(35 + ox, G - 12 + oy, fr === 6 ? "#fff3a0" : "#ffcf2e")
  }
}

for (let t = 0; t <= 5; t++) sprite(`pdrill_${t}_idle`, { w: 44, h: 50 }, (c) => drillP(c, t, -1))
const SIZES_P = { pdrill: [44, 50, drillP], prefinery: [56, 70, refineryP], pcheesery: [60, 68, cheeseryP], pshop: [50, 54, shopP] }
for (const [name, [w, h, fn]] of Object.entries(SIZES_P)) {
  for (let t = 0; t <= 5; t++) anim(`${name}_${t}`, { w, h, frames: N, fps: 10 }, (c) => fn(c, t, c.frame))
}

// =====================================================================================
// ROCA ENORME (Pulido+): una sola roca con la silueta y el tamaño de la del juego (54 × 42), por
// planos: cara de arriba con luz y arista en brillo, cara izquierda a media luz, frente partido
// en tres por fracturas, lado derecho en sombra con trama y apoyo oscuro. Grados de grieta 0..4
// y veta abierta con vaciado 6..1, como en el juego.
// =====================================================================================
const BIG = {
  sil: [3, 42, 1, 34, 2, 25, 6, 17, 12, 10, 19, 5, 27, 3, 35, 4, 42, 8, 48, 14, 52, 22, 54, 30, 53, 37, 51, 42],
  facets: [
    [[1, 34, 2, 25, 6, 17, 9, 21, 7, 28, 5, 36], "a", DI],
    [[2, 25, 6, 17, 8, 19, 5, 25, 3, 30], "a", null],
    [[6, 17, 12, 10, 19, 5, 27, 3, 35, 4, 42, 8, 38, 12, 30, 14, 22, 15, 14, 18, 9, 21], "a", null],
    [[12, 11, 19, 6, 27, 4, 34, 5, 30, 7, 22, 8, 16, 11], "A", null],
    [[9, 21, 14, 18, 22, 15, 30, 14, 38, 12, 36, 15, 28, 17, 20, 18, 12, 22], "a", DI],
    [[9, 22, 21, 17, 21, 40, 8, 40], "a", DI],
    [[42, 8, 48, 14, 44, 16, 38, 12], "a", null],
    [[44, 16, 46, 24, 46, 33, 44, 42, 41, 42, 43, 33, 43, 24, 40, 15], "d", DI],
    [[48, 14, 52, 22, 54, 30, 53, 37, 51, 42, 44, 42, 46, 33, 46, 24, 44, 16], "d", null],
    [[49, 20, 52, 26, 53, 34, 50, 29], "D", SP],
    [[38, 13, 44, 16, 43, 42, 38, 42], "d", SP],
  ],
  seams: [[[22, 16], [20, 25], [21, 33], [19, 41]], [[38, 13], [40, 22], [39, 31], [41, 41]]],
  cracks: [
    [[27, 27], [23, 23], [20, 19]], [[27, 27], [32, 31], [35, 36]],
    [[26, 28], [22, 32], [19, 37]], [[28, 26], [33, 22], [37, 17]],
    [[20, 19], [16, 17]], [[32, 31], [37, 30]],
    [[22, 32], [17, 32]], [[33, 22], [33, 17]],
  ],
  vein: [13, 27, 17, 20, 25, 17, 34, 18, 41, 23, 43, 30, 39, 37, 30, 40, 19, 39, 13, 34],
  holes: [[20, 29, 2.2], [31, 23, 1.7], [35, 32, 2.4], [25, 35, 1.5], [28, 28.5, 1]],
}
function rockBig(c, pal, { crack = 0, revealed = false, depl = 6 } = {}) {
  const T = { A: mix(pal.rock[0], "#ffffff", 0.4), a: pal.rock[0], m: pal.rock[1], d: pal.rock[2], D: mix(pal.rock[2], "#1d2029", 0.55) }
  const down = { A: "a", a: "m", m: "d", d: "d", D: "D" }
  const up = { D: "d", d: "m", m: "a", a: "A", A: "A" }
  const inS = (x, y) => x >= 0 && y >= 0 && x < RW && y < RH && pip(BIG.sil, x, y)
  const g = []
  for (let y = 0; y < RH; y++) { g[y] = []; for (let x = 0; x < RW; x++) g[y][x] = inS(x, y) ? "m" : null }
  for (const [poly, tone, mask] of BIG.facets)
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) if (g[y][x] && pip(poly, x, y) && (!mask || mask(x, y))) g[y][x] = tone
  // Fracturas del frente: raya profunda con canto de luz a la izquierda.
  for (const s of BIG.seams) bres(s, (x, y) => {
    if (!g[y][x]) return
    g[y][x] = "D"
    if (g[y][x - 1] && g[y][x - 1].length === 1 && g[y][x - 1] !== "D") g[y][x - 1] = up[g[y][x - 1]]
  })
  for (let y = RH - 5; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (!g[y][x] || g[y][x] === "D") continue
    if (y === RH - 1) g[y][x] = "D"
    else if (y === RH - 2 || (y === RH - 3 && DI(x, y)) || SP(x, y + (y === RH - 4 ? 1 : 0))) g[y][x] = down[g[y][x]]
  }
  if (!revealed) {
    const lines = BIG.cracks.slice(0, crack * 2)
    for (const l of lines) bres(l, (x, y) => {
      g[y][x] = "#1d2029"
      const b = g[y + 1] && g[y + 1][x]
      if (b && b.length === 1 && b !== "D") g[y + 1][x] = up[b]
    })
    if (crack >= 3) lines.forEach((l, i) => bres(l, (x, y) => { if ((x * 3 + y + i) % (crack >= 4 ? 3 : 5) === 0) g[y][x] = pal.glint }))
  } else {
    const inV = (x, y) => pip(BIG.vein, x, y)
    let top = RH, bot = 0
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) if (inV(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y) }
    const h = bot - top + 1
    const emptyTo = top + Math.round(h * (1 - depl / 6))
    const hi = mix(pal.cheese[0], "#ffffff", 0.55)
    for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
      if (!inV(x, y)) {
        if (g[y][x] && g[y][x].length === 1 && (inV(x - 1, y) || inV(x, y - 1)) && !inV(x + 1, y) && !inV(x, y + 1)) g[y][x] = "a"
        continue
      }
      const shadowEdge = !inV(x, y - 1) || !inV(x - 1, y)
      const edge = shadowEdge || !inV(x + 1, y) || !inV(x, y + 1)
      if (y < emptyTo) { g[y][x] = edge ? "#1c1410" : x % 5 === 2 && y % 3 === 0 ? "#4a3524" : "#33241a"; continue }
      if (y === emptyTo && emptyTo > top) { g[y][x] = pal.rim; continue }
      if (shadowEdge) { g[y][x] = mix(pal.rim, "#1d2029", 0.4); continue }
      if (edge) { g[y][x] = pal.rim; continue }
      const hole = BIG.holes.find(([hx, hy, r]) => Math.hypot(x + 0.5 - hx, y + 0.5 - hy) < r)
      if (hole) { const [hx, hy, r] = hole; g[y][x] = Math.hypot(x - 0.5 - hx, y - 0.5 - hy) < r ? pal.hole : pal.rim; continue }
      const ry = (y - top) / h
      let col = ry < 0.35 ? pal.cheese[0] : ry < 0.7 ? pal.cheese[1] : pal.cheese[2]
      if (ry >= 0.3 && ry < 0.4 && DI(x, y)) col = pal.cheese[1]
      if (ry >= 0.65 && ry < 0.75 && DI(x, y)) col = pal.cheese[2]
      if (y > emptyTo && x + y >= 38 && x + y <= 39 && x < 22) col = hi
      g[y][x] = col
    }
  }
  for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
    if (!g[y][x]) continue
    const edge = !inS(x - 1, y) || !inS(x + 1, y) || !inS(x, y - 1) || (y < RH - 1 && !inS(x, y + 1))
    const v = edge ? "#2b2f3a" : g[y][x]
    c.px(x, y, v.length === 1 ? T[v] : v)
  }
}
// Todos los estados del juego por zona: grietas 0..4 (c0..c4) y veta con vaciado 6..1 (v6..v1).
for (const zone of Object.keys(ROCK_PAL)) {
  for (let k = 0; k <= 4; k++) sprite(`big_${zone}_c${k}`, { w: RW, h: RH }, (c) => rockBig(c, ROCK_PAL[zone], { crack: k }))
  for (let d = 1; d <= 6; d++) sprite(`big_${zone}_v${d}`, { w: RW, h: RH }, (c) => rockBig(c, ROCK_PAL[zone], { revealed: true, depl: d }))
}
