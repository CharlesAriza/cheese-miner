// Exploración de pixel art (NO es código del juego). Test de animación por fotogramas del ratón
// propuesto (mice.px.js). Hoy el juego no anima por fotogramas: sube y baja una sola imagen y gira
// el pico aparte. Construir: node ../../.claude/skills/pxl-pixel-art/bin/pxl.js build anims.px.js
include("mice.px.js")

// Letras libres: chispa (y, z), hierro del pico (C luz, 0 sombra). El mango usa la madera (B/O).
pal({ y: "#ffe55c", z: "#fffbe0", C: "#c3cad8", "0": "#6c7488" })

// El ratón propuesto partido en cuerpo (sin patas) y patas, para moverlos por separado.
const UPPER = `
  .DDD..gggggggG......
  DppqD.ggggGkwG......
  DpqqDggggGGkkGGn....
  DpqqDGggGGGGGGGN....
  .DDDDGGGGcGGGGD.....
  ....DDGGGGGGGD......
  ...bBBBDGwwwD.......
  T..bBBODGwwsGG......
  T..BBBODGwwsDD......
  T..BBBODGwss........
  .T..BOODGGGGD.......`
sprite("_upper", UPPER)
sprite("_legs_stand", `
  ..TtDGGD..GGGD......
  ....ffFF..ffFFF.....`)
sprite("_legs_a", `
  ..TtDGGD...GGGD.....
  ...ffFF.....ffFFF...`)
sprite("_legs_b", `
  ...TDGGDGGGD........
  .....ffFFfFF........`)
sprite("_hat", `
  ......YHHHHH........
  .....YHHHHHHHlL.....
  ....YHHHHHHHHLLL....
  ....hhhhhhhhhhhhh...`)
// Ojo cerrado: se tapa la fila de arriba del ojo de 2 × 2 (pupila y brillo, columnas 11-12) y queda
// la de abajo como raya, en su sitio.
const BLINK = (y) => grid(11, y, "GG")

// Cuerpo completo con el cuerpo `dy` píxeles más abajo (respirar / rebotar). Lienzo de 18 de alto
// para que el cuerpo pueda subir 1 px sin cortar el gorro.
const mouse = (dy, legs) => [stamp("_hat", 0, 1 + dy), stamp("_upper", 0, 5 + dy), stamp(legs, 0, 16)]

// 1. Reposo: respira (el cuerpo baja 1 px) y parpadea; a veces dos veces.
anim("idle", { w: 20, h: 18, outline: "o" },
  frame({ ms: 700 }, ...mouse(0, "_legs_stand")),
  frame({ ms: 700 }, ...mouse(1, "_legs_stand")),
  frame({ ms: 700 }, ...mouse(0, "_legs_stand")),
  frame({ ms: 120 }, ...mouse(0, "_legs_stand"), BLINK(6)),
  frame({ ms: 700 }, ...mouse(1, "_legs_stand")),
  frame({ ms: 700 }, ...mouse(0, "_legs_stand")),
  frame({ ms: 100 }, ...mouse(0, "_legs_stand"), BLINK(6)),
  frame({ ms: 100 }, ...mouse(0, "_legs_stand")),
  frame({ ms: 100 }, ...mouse(0, "_legs_stand"), BLINK(6)))

// 2. Caminar: patas alternas, el cuerpo sube 1 px en los pasos y la cola cambia de lado.
anim("walk", { w: 20, h: 18, outline: "o", fps: 8 },
  frame(...mouse(0, "_legs_a")),
  frame(...mouse(-1, "_legs_b")),
  frame(...mouse(0, "_legs_a"), grid(0, 12, "_\n_\nT\nT")),
  frame(...mouse(-1, "_legs_b")))

// 3. Picar: el ratón en un lienzo más ancho (el pico llega delante). Levanta, golpea, chispa,
// se recupera. Mango de madera (B), cabeza de hierro (C/0).
const pick = (hx, hy, tx, ty, head) => [line(hx, hy, tx, ty, "B"), ...head]
// Cabeza curva de pico, de pie y abombada hacia fuera: centro en (x, y), las puntas (sombra) dobladas
// hacia el mango. Siete de alto.
const archV = (x, y) => [px(x - 2, y - 3, "0"), px(x - 1, y - 2, "C"), vline(x, y - 1, 3, "C"), px(x - 1, y + 2, "C"), px(x - 2, y + 3, "0")]
anim("mine", { w: 30, h: 18, outline: "o" },
  // arriba: el pico por encima del gorro, cabeza tumbada con las puntas hacia abajo
  frame({ ms: 220 }, ...mouse(-1, "_legs_stand"), ...pick(14, 11, 20, 1, [hline(19, 0, 3, "C"), px(18, 1, "C"), px(22, 1, "C"), px(17, 2, "0"), px(23, 2, "0")])),
  // bajando
  frame({ ms: 90 }, ...mouse(0, "_legs_stand"), ...pick(13, 12, 21, 6, archV(22, 6))),
  // golpe: la punta de abajo toca el suelo; chispa
  frame({ ms: 120 }, ...mouse(1, "_legs_stand"), ...pick(13, 13, 22, 14, archV(23, 14)),
    px(19, 16, "y"), px(20, 15, "z"), px(18, 17, "y"), px(24, 17, "y")),
  // rebote
  frame({ ms: 160 }, ...mouse(0, "_legs_stand"), ...pick(13, 12, 22, 9, archV(23, 9))),
)


