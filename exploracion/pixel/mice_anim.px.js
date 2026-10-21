// Exploración de pixel art (NO es código del juego). Animaciones de oficio del ratón (diseño
// Pulido de mice.px.js): minero apoyado en el pico, conductor del taladro con su palanca, ratón que
// acarrea la caja en brazos (y vuelve sin ella) e investigador con un matraz. Mismo cuerpo, mismos
// pelajes y gorros (swap). Construir:
// node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build mice_anim.px.js --only <nombres>
include("mice.px.js")

// Letras libres para los objetos (no las toca el swap de pelaje ni de gorro).
pal({
  y: "#ffe55c", z: "#fffbe0", "!": "#ffcf2e", "?": "#e0960e", // queso
  C: "#d4dae4", "0": "#6c7488", ")": "#9aa2b4",               // hierro del pico
  "+": "#cfeefa", "^": "#ffffff", "=": "#3fbf5a", "%": "#9df5a8", "~": "#22803e", // matraz
  "&": "#e2462f", "@": "#8c2235", "*": "#3a3d4a",             // palanca
})

// Pico: una sola forma, dibujada igual en cualquier ángulo. Mango de la mano (h) a la abrazadera (e);
// cabeza perpendicular al mango, curva, gruesa en el centro y afilada en las puntas, que se curvan
// hacia el mango. Brillo en el lado de fuera, sombra en el de dentro. `gold`: el pico dorado.
function pickTool(hx, hy, ex, ey, { L = 5, bend = 1.8, gold = false } = {}) {
  const S = gold ? ["#fffbe0", "#ffd84a", "#c98a12", "#8a5a0a"] : ["#f2f5fa", "#b9c1d1", "#6c7488", "#454a5a"]
  return (c) => {
    const len = Math.hypot(ex - hx, ey - hy), d = [(ex - hx) / len, (ey - hy) / len], n = [-d[1], d[0]]
    // Grosor de 2 px sin huecos: la segunda línea se desplaza en un solo eje.
    const [ox, oy] = Math.abs(n[0]) >= Math.abs(n[1]) ? [Math.sign(n[0]), 0] : [0, Math.sign(n[1])]
    // Lado oscuro casi de tinta: el mango se despega de cualquier pelaje (también del marrón).
    c.line(hx + ox, hy + oy, ex + ox, ey + oy, "#3e2418")
    c.line(hx, hy, ex, ey, "#dcaa6a")
    const pts = []
    for (let s = -L; s <= L + 0.001; s += 0.2) {
      const a = Math.abs(s), b = bend * (s / L) * (s / L)
      const layers = a <= 2.6 ? [[-0.55, 2], [0.55, a < 1.6 ? 0 : 1]] : [[0, a > L - 1.1 ? 3 : 1]]
      for (const [off, tone] of layers) {
        const k = 1.2 - b + off
        pts.push([Math.round(ex + d[0] * k + n[0] * s), Math.round(ey + d[1] * k + n[1] * s), tone])
      }
    }
    for (const want of [2, 3, 1, 0]) for (const [x, y, tone] of pts) if (tone === want) c.px(x, y, S[tone])
    c.px(Math.round(ex), Math.round(ey), "#4e2c1c")
  }
}

const ROWS = NEW_BODY.split("\n").map((r) => r.trim()).filter(Boolean)
sprite("_mu", ROWS.slice(0, 11).join("\n"))
sprite("_ml_stand", ROWS.slice(11).join("\n"))
sprite("_ml_a", "..TtDGGD...GGGD.....\n...ffFF.....ffFFF...")
sprite("_ml_b", "...TDGGDGGGD........\n.....ffFFfFF........")
// Ratón entero: gorro en y 1, cuerpo en y 5..15, patas en 16..17. `dy` respira o rebota.
const M = (hat, dy, legs = "_ml_stand", x = 0) => [stamp("_new_" + hat, x, 1 + dy), stamp("_mu", x, 5 + dy), stamp(legs, x, 16)]
const BLINK = (dy, x = 0) => grid(11 + x, 6 + dy, "GG")
const PAW = (x, y) => grid(x, y, "gG")
const IDLE_MS = [700, 700, 700, 120, 700, 700, 100, 100, 100]
const IDLE_DY = [0, 1, 0, 0, 1, 0, 0, 0, 0]
const IDLE_BL = [0, 0, 0, 1, 0, 0, 1, 0, 1]
const ROLES = {
  miner: { hat: "helmet", swap: { ...FUR_NEW.brown } },
  driller: { hat: "cap", swap: { ...HAT_SWAP.cap, ...FUR_NEW.grey } },
  researcher: { hat: "beanie", swap: { ...HAT_SWAP.beanie, ...FUR_NEW.dark } },
}

// 1. Minero en reposo, apoyado en el pico clavado en el suelo (respira y parpadea).
// Pico apoyado como un bastón: cabeza en el suelo, mango hacia arriba, la pata encima.
// Pico apoyado como un bastón: mango hacia arriba y la cabeza en el suelo, abombada hacia abajo,
// con las puntas curvadas hacia el mango.
const PICK = [pickTool(20, 9, 20, 15)]
{
  const r = ROLES.miner
  anim("job_miner", { w: 27, h: 18, outline: "o", swap: r.swap },
    ...IDLE_MS.map((ms, i) => frame({ ms }, ...PICK, ...M(r.hat, IDLE_DY[i]), ...(IDLE_BL[i] ? [BLINK(IDLE_DY[i])] : []),
      grid(14, 11 + IDLE_DY[i], "GGGG"), PAW(19, 10 + IDLE_DY[i]))))
}

// 2. Conductor del taladro, sentado: muslos sobre el cojín, piernas colgando por delante y la pata
// en la palanca del panel. Mismo cuerpo que todos (vale para cualquier pelaje, gorro o accesorio).
// Se ancla en el taladro en (x + 1, y + top - 21); vibra 1 px con él, al mismo compás (100 ms).
sprite("_ml_sit", "..TDGGGGGGGGD.......\n...T.......GGD......\n...........ffFF.....")
{
  const r = ROLES.driller
  const frames = []
  for (let f = 0; f < 8; f++) {
    const x = f % 2
    frames.push(frame({ ms: 100 }, ...M(r.hat, 0, "_ml_sit", x), ...(f === 5 ? [BLINK(0, x)] : []),
      grid(14 + x, 11, "GG"), grid(16 + x, 10, "G"), PAW(16 + x, 9)))
  }
  anim("job_driller", { w: 21, h: 19, outline: "o", swap: r.swap }, ...frames)
}

// 3. Acarrea Raw: la caja va en brazos, delante del cuerpo, y sube y baja con el paso.
const CRATE = (dy) => [
  grid(13, 9 + dy, "..y!y...\n.y!!!?.."),
  grid(12, 11 + dy, "bbbbbbbb\nbBBBBBBO\nbBOBBOBO\nOOOOOOOO"),
]
{
  const r = ROLES.driller
  anim("job_carry", { w: 22, h: 18, outline: "o", fps: 8, swap: r.swap },
    ...[["_ml_a", 0], ["_ml_b", -1], ["_ml_a", 0], ["_ml_b", -1]].map(([legs, dy], i) =>
      frame(...M(r.hat, dy, legs), ...(i === 2 ? [grid(0, 12, "_\n_\nT\nT")] : []), ...CRATE(dy), PAW(11, 12 + dy))))
  // Vuelta al puesto, con las manos vacías.
  anim("job_return", { w: 20, h: 18, outline: "o", fps: 8, swap: r.swap },
    ...[["_ml_a", 0], ["_ml_b", -1], ["_ml_a", 0], ["_ml_b", -1]].map(([legs, dy], i) =>
      frame(...M(r.hat, dy, legs), ...(i === 2 ? [grid(0, 12, "_\n_\nT\nT")] : []))))
}

// 4. Investigador con un matraz. Los efectos viven solo en la zona del matraz (columnas 14–21,
// filas 0–13): valen igual para cualquier pelaje, gorro o accesorio.
{
  const r = ROLES.researcher
  const BUB = [[17, 6, 1], [19, 6, 2], [16, 6, 1]] // x, fila de salida, tamaño
  const frames = []
  for (let f = 0; f < 8; f++) {
    const dy = f >= 4 ? 1 : 0
    const items = [...M(r.hat, dy), ...(f === 6 ? [BLINK(dy)] : [])]
    // Matraz: cuello, cuerpo de cristal con brillo, líquido que se balancea.
    items.push(grid(16, 7 + dy, ".^+.\n.++.\n++++\n+++^"))
    const tilt = [0, 1, 1, 0, 0, -1, -1, 0][f]
    items.push(grid(15, 11 + dy, tilt > 0 ? ".%=..\n=====\n.~~~." : tilt < 0 ? "..=%.\n=====\n.~~~." : "..%=.\n=====\n.~~~."))
    items.push(grid(15, 10 + dy, "+"), grid(19, 10 + dy, "+"), grid(15, 11 + dy, "+"), grid(19, 11 + dy, "+"))
    // Burbujas que suben desde la boca y se deshacen.
    BUB.forEach(([bx, by, size], k) => {
      const a = (f + k * 3) % 8
      if (a > 5) return
      const y = by + dy - a - 1, x = bx + (a % 2 && k === 1 ? 1 : 0)
      if (size === 2 && a < 4) items.push(grid(x, y - 1, "%%\n%%"))
      else items.push(px(x, y, a < 4 ? "%" : "^"))
    })
    // Bocanada de vapor de vez en cuando.
    if (f === 3 || f === 4) items.push(grid(18, 1 + dy - (f - 3), ".^^\n^%^"))
    items.push(grid(13, 11 + dy, "G"), PAW(14, 10 + dy))
    frames.push(frame({ ms: 140 }, ...items))
  }
  anim("job_researcher", { w: 22, h: 18, outline: "o", swap: r.swap }, ...frames)
}

// 5. Picar. Cinco fotogramas para cualquier ratón (el principal y el minero, cualquier pelaje y
// gorro): 0–1 en guardia con el pico en alto (respira), 2 bajando, 3 impacto con chispa, 4 rebote.
// La cabeza del pico siempre con las puntas hacia el mango. El juego elige el fotograma:
//   toque del jugador → 3 (al instante) → 4 → 0/1; cada toque nuevo reinicia en 3.
//   minero automático → 0 → 2 → 3 → 4 en bucle; cada 3 es un golpe.
const SWING = [
  (hat, g) => [...M(hat, -1), pickTool(14, 11, 19, 4, { gold: g }), PAW(13, 11)],
  (hat, g) => [...M(hat, 0), pickTool(14, 12, 19, 5, { gold: g }), PAW(13, 12)],
  (hat, g) => [...M(hat, 0), pickTool(13, 12, 20, 8, { gold: g }), PAW(12, 12)],
  (hat, g) => [...M(hat, 1), pickTool(13, 13, 21, 13, { gold: g }), PAW(12, 13), px(25, 11, "z"), px(26, 12, "y"), px(25, 16, "y"), px(26, 15, "z")],
  (hat, g) => [...M(hat, 0), pickTool(13, 12, 21, 10, { gold: g }), PAW(12, 12)],
]
// El pico dorado (Mining, desde 16 rangos de POWER): la misma animación con el pico de oro.
for (const [name, role, g] of [["swing_player", { hat: "helmet", swap: {} }, false], ["swing_miner", ROLES.miner, false], ["swing_gold", { hat: "helmet", swap: {} }, true]]) {
  anim(name, { w: 30, h: 18, outline: "o", swap: role.swap }, ...SWING.map((f) => frame({ ms: 100 }, ...f(role.hat, g))))
}
