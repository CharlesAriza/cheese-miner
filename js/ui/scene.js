// Render del cuartel general en vista lateral, sobre un canvas de baja
// resolución (160 px lógicos de ancho) escalado con image-rendering: pixelated.
// Solo dibuja: no modifica el estado ni decide nada de la economía.
//
// PROGRESIÓN VISUAL: cada edificio recibe su "tier" (0..5), que sale de los
// rangos comprados en la rama POWER de su árbol, y añade piezas según sube.
// La roca enseña su profundidad con un pozo; el pueblo del fondo crece con el
// nivel total. Los ratones acarrean cada recurso de un edificio al siguiente.
//
// Todo el arte es placeholder hecho por código. Cada pieza sustituible por un
// PNG está marcada con "SPRITE:".
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const makeSprite = CM.makeSprite;
  const W = 160;
  const WORLD = 390;
  const ROCK_W = 54;
  const ROCK_H = 42;
  // Posición X (mundo) de cada edificio.
  const POS = { shop: 8, cheesery: 54, storage: 102, refinery: 150, house: 214, drill: 306, rock: 330 };
  const WIDTH = { shop: 38, cheesery: 40, storage: 38, refinery: 38, house: 36, drill: 24, rock: ROCK_W };

  function hash(n) {
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
    n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  }
  const h2 = (x, y, seed) => hash(x * 374761393 + y * 668265263 + seed * 982451653);

  // SPRITE: ratón (mira a la derecha). El casco cambia de color según el rol.
  const MOUSE_ROWS = [
    '......HHHHHH........',
    '.....HHHHHHHHLL.....',
    '....HHHHHHHHHLLL....',
    '....hhhhhhhhhhhhh...',
    '.EEE..GGGGGGGG......',
    'EPPPE.GGGGGKGG......',
    'EPPPEGGGGGGKGGGN....',
    'EPPPEGGGGGGGGGGN....',
    '.EEEGGGGGcGGGG......',
    '....GGGGGGGGG.......',
    '...BBBBGGWWW........',
    'T..BBBBGGWWWGG......',
    'T..BBBBGGWWW........',
    'T..BBBBGGWWW........',
    '.T..BBGGGGGG........',
    '..TTGGGG..GGG.......',
    '....FFFF..FFFF......',
  ];
  const mousePalette = (helmet, brim, lamp) => ({ H: helmet, h: brim, L: lamp, E: '#cfc6cc', P: '#ff9ab5', G: '#f1eaec', K: '#1b1622', N: '#ff7a9c', c: '#ffc2d1', B: '#8b5a2b', W: '#ffffff', T: '#ff9ab5', F: '#ff9ab5' });
  const mouse = (a, b, c) => makeSprite(MOUSE_ROWS, mousePalette(a, b, c), '#2a1d2e');
  const MICE = {
    player: mouse('#ffcf2e', '#d99a12', '#8ff3ff'),
    customer: mouse('#c9975a', '#8b5a2b', '#e6bb80'),
    // Tus ratones: el color del gorro es su rango (aprendiz, oficial, maestro, gerente).
    r0: mouse('#9aa3b5', '#6b7386', '#dfe6ee'),
    r1: mouse('#4a8fe8', '#2b5cab', '#dff3ff'),
    r2: mouse('#e2562a', '#9c2f14', '#ffe55c'),
    r3: mouse('#9a5fd0', '#5f3590', '#ffe55c'),
  };
  const rankSprite = (m) => MICE['r' + Math.min(3, m.rank)];
  // Retrato de un ratón para los paneles.
  const portraits = {};
  CM.mouseUrl = (rank) => portraits[rank] || (portraits[rank] = MICE['r' + Math.min(3, rank)].toDataURL());
  const MOUSE_W = MICE.player.width;
  const MOUSE_H = MICE.player.height;

  const ROCK_PAL = {
    cheddar: { rock: ['#b4bacb', '#8a90a3', '#656a7b'], cheese: ['#ffe55c', '#ffcf2e', '#f5ab12'], hole: '#e08a10', rim: '#c97a08', glint: '#ffd43a' },
    gouda: { rock: ['#cdb7a0', '#a08a76', '#77634f'], cheese: ['#ffc46a', '#ff9f3a', '#e87a1c'], hole: '#c9600f', rim: '#a8520f', glint: '#ffb04a' },
    blue: { rock: ['#aab7d6', '#7f8cb0', '#5a6686'], cheese: ['#f4f1dc', '#dcd8bd', '#7fa7d9'], hole: '#4a78b8', rim: '#8a8870', glint: '#cfe4ff' },
  };
  // Cada zona tiñe el paisaje.
  const ZONE_BG = {
    cheddar: { sky: ['#2f8fe6', '#3ea0f0', '#55b2f6', '#74c4fa', '#98d7fc', '#bfe8fd'], mount: '#7fb4d8', far: '#5fbf9a', farTop: '#86dcb4', tree: '#2f8f55', treeHi: '#4fb873', near: '#3fa860', sun: '#fff3a0' },
    gouda: { sky: ['#e8743a', '#f08a45', '#f6a258', '#fabb74', '#fcd398', '#fde6bf'], mount: '#b98a9a', far: '#c9903a', farTop: '#e6b35a', tree: '#b9521f', treeHi: '#e07a2a', near: '#8fa23a', sun: '#fff0c0' },
    blue: { sky: ['#2a3f8a', '#34509f', '#4666b8', '#6384cc', '#8aa6dd', '#b8cbec'], mount: '#6f7fb0', far: '#4f8f9a', farTop: '#6fb3bd', tree: '#2a6f7a', treeHi: '#3f95a1', near: '#3f8f7a', sun: '#e6f0ff' },
  };
  // Material de las máquinas según su tier: de chapa naranja a oro.
  const METAL = [
    ['#e2562a', '#ff8a4a', '#5a1e12'],
    ['#d9772a', '#ffa85a', '#5a2a12'],
    ['#5a8fd0', '#8fbcf0', '#1f3a66'],
    ['#7a6fd0', '#a99ff0', '#2a2466'],
    ['#3fb38a', '#7fe0b8', '#14503a'],
    ['#ffcf2e', '#fff3a0', '#8a5a0a'],
  ];

  // SPRITE: Cheese Rock, generada por píxel según zona, profundidad, grietas y veta restante.
  function buildRock(seed, crack, revealed, deplStage, pal) {
    const c = document.createElement('canvas');
    c.width = ROCK_W;
    c.height = ROCK_H;
    const g = c.getContext('2d');
    const cx = 27;
    const cy = 24;
    const a = 25;
    const b = 19;
    const inside = (x, y) => x >= 0 && y >= 0 && x < ROCK_W && y < ROCK_H && Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2) + (h2(x >> 2, y >> 2, seed) - 0.5) * 0.28 < 1;
    const core = (x, y) => Math.pow((x - cx) / (a * 0.66), 2) + Math.pow((y - cy - 1) / (b * 0.68), 2) + (h2(x >> 1, y >> 1, seed + 7) - 0.5) * 0.2 < 1;
    const holes = [];
    for (let i = 0; i < 7; i++) holes.push([cx + (hash(seed * 10 + i) - 0.5) * 26, cy + (hash(seed * 20 + i) - 0.5) * 18, 1.4 + hash(seed * 30 + i) * 2.2]);
    const coreTop = cy + 1 - b * 0.68;
    const coreH = 2 * b * 0.68;
    for (let y = 0; y < ROCK_H; y++) {
      for (let x = 0; x < ROCK_W; x++) {
        if (!inside(x, y)) continue;
        let color;
        const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || (y < ROCK_H - 1 && !inside(x, y + 1));
        if (edge) color = '#2b2f3a';
        else if (revealed && core(x, y)) {
          const cavity = (y - coreTop) / coreH < 1 - deplStage / 6;
          const rim = !core(x - 1, y) || !core(x + 1, y) || !core(x, y - 1) || !core(x, y + 1);
          if (cavity) color = rim ? '#1c1410' : h2(x >> 1, y >> 1, seed + 11) > 0.8 ? '#4a3524' : '#33241a';
          else if (rim) color = pal.rim;
          else if (holes.some((h) => Math.hypot(x - h[0], y - h[1]) < h[2])) color = pal.hole;
          else color = y - cy < -4 ? pal.cheese[0] : y - cy < 6 ? pal.cheese[1] : pal.cheese[2];
        } else {
          const lit = (x - cx) * -0.4 + (y - cy) * -1 + h2(x >> 1, y >> 1, seed + 3) * 6;
          color = lit > 8 ? pal.rock[0] : lit > -4 ? pal.rock[1] : pal.rock[2];
          // Con la roca muy agrietada asoma un brillo de queso (aviso visual, no recurso).
          if (!revealed && crack >= 3 && core(x, y) && h2(x, y, seed + 5) > (crack >= 4 ? 0.9 : 0.96)) color = pal.glint;
        }
        g.fillStyle = color;
        g.fillRect(x, y, 1, 1);
      }
    }
    if (!revealed) {
      g.fillStyle = '#1d2029';
      for (let w = 0; w < crack * 2; w++) {
        let x = cx + (hash(seed + w * 13) - 0.5) * 8;
        let y = cy + (hash(seed + w * 17) - 0.5) * 6;
        const ang = hash(seed + w * 29) * Math.PI * 2;
        for (let step = 0; step < 12; step++) {
          x += Math.cos(ang) + (hash(seed + w * 31 + step) - 0.5) * 1.6;
          y += Math.sin(ang) + (hash(seed + w * 37 + step) - 0.5) * 1.6;
          if (inside(Math.round(x), Math.round(y))) g.fillRect(Math.round(x), Math.round(y), 1, 1);
        }
      }
    }
    return c;
  }

  CM.createScene = function (canvas) {
    const ctx = canvas.getContext('2d');
    let H = 240;
    let groundY = 200;
    let rockCache = { key: '', img: null };
    let blinking = false;
    const particles = [];
    const walkers = []; // ratones que acarrean recursos o clientes que se van
    const far = -1e9;
    const fx = { shake: 0, flash: 0, swingAt: far, minerSwingAt: far, rockHitAt: far, rockDropAt: far, rockLanded: true, station: 'rock', mouseX: POS.rock - 22, cam: WORLD - W, camTarget: WORLD - W, popAt: {}, pulseAt: {}, selected: 'rock', zone: 'cheddar', zoneId: B.zones[0].id };

    const R = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };
    const rockY = () => groundY - 40;
    const center = (id) => POS[id] + WIDTH[id] / 2;

    function resize() {
      const box = canvas.parentElement.getBoundingClientRect();
      if (!box.width) return;
      H = Math.max(130, Math.min(420, Math.round((W * box.height) / box.width)));
      canvas.width = W;
      canvas.height = H;
      // El subsuelo ocupa buena parte de la escena: es donde se ve la profundidad.
      groundY = H - Math.max(44, Math.round(H * 0.42));
    }

    function burst(x, y, count, colors, speed, up) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.8);
        particles.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - (up || 0), g: 260, life: 0.35 + Math.random() * 0.45, size: Math.random() < 0.3 ? 2 : 1, color: colors[(Math.random() * colors.length) | 0] });
      }
      if (particles.length > 280) particles.splice(0, particles.length - 280);
    }
    const puff = (x, y, color) => particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: -20, g: -10, life: 0.9, size: 2, color });
    const GREYS = ['#b4bacb', '#8a90a3', '#656a7b'];
    const YELLOWS = ['#ffe55c', '#ffcf2e', '#f5ab12', '#ffffff'];
    const ORANGES = ['#ff9a2e', '#ffcf2e', '#ffffff'];
    const COINS = ['#ffe55c', '#ffb81e', '#fff3a0'];
    const tone = (base) => (CM.icons.TONES[base] || CM.icons.TONES.cheddar).M;

    function focus(id) {
      fx.camTarget = Math.max(0, Math.min(WORLD - W, center(id === 'drill' ? 'rock' : id) - W / 2));
    }

    // REGLA DE CLARIDAD: en pantalla solo se mueve lo que el jugador puede
    // explicar. Un ratón acarrea únicamente si ESE ratón está contratado: es el
    // mismo que trabaja en su puesto, que sale con el producto, lo deja en el
    // edificio siguiente y vuelve. Nunca hay dos acarreando por la misma ruta.
    function carry(role, m, from, to, color) {
      if (!m || walkers.some((w) => w.role === role)) return;
      walkers.push({ role, img: rankSprite(m), x: from, home: from, to, carry: color, bob: 0 });
    }
    // Un cliente se va de la tienda con su queso.
    function customerLeaves() {
      if (walkers.some((w) => w.role === 'customer')) return;
      walkers.push({ role: 'customer', img: MICE.customer, x: POS.shop + 14, to: -30, carry: '#d93a4f', bob: 0 });
    }
    const away = (role) => walkers.some((w) => w.role === role);

    function onEvent(ev, state, now, zoneId) {
      const rx = POS.rock;
      const ry = rockY();
      const here = !ev.zone || ev.zone === zoneId;
      switch (ev.type) {
        case 'hit':
          if (!here) break;
          fx.rockHitAt = now;
          if (ev.source === 'manual') {
            fx.station = 'rock';
            fx.swingAt = now;
            fx.shake = Math.max(fx.shake, ev.crit ? 5 : 1.4);
            burst(rx + 8, ry + 22, ev.crit ? 16 : 6, ev.crit ? GREYS.concat(['#ffffff', '#ffd43a']) : GREYS, ev.crit ? 110 : 70, 40);
          } else {
            fx.minerSwingAt = now;
            burst(rx + 20, ry + 4, 3, GREYS, 60, 30);
          }
          break;
        case 'reveal':
          if (!here) break;
          fx.flash = 1;
          fx.shake = 8;
          burst(rx + 27, ry + 22, 46, YELLOWS.concat(GREYS), 150, 60);
          break;
        case 'drillStart':
        case 'drillBoost':
          if (here && ev.source !== 'worker') fx.station = 'drill';
          if (here && ev.type === 'drillBoost') burst(rx + 6, ry + 26, 4, ['#ffffff', '#ffe55c'], 80, 30);
          break;
        case 'drillDone':
          fx.pulseAt.drill = now;
          if (here) burst(rx + 14, ry + 20, 12, YELLOWS, 110, 70);
          if (here && ev.source === 'worker' && state.built.refinery) carry('drilling', CM.mice.at(state, 'drilling', zoneId), POS.drill - 6, POS.refinery + 40, tone(ev.base));
          break;
        case 'deeper':
          if (!here) break;
          fx.shake = Math.max(fx.shake, 5);
          burst(rx + 27, ry + 22, 26, GREYS, 110, 40);
          break;
        case 'refineStart':
        case 'refineBoost':
          if (ev.source !== 'worker') fx.station = 'refinery';
          if (ev.type === 'refineBoost') burst(POS.refinery + 30, groundY - 16, 3, ORANGES, 60, 30);
          break;
        case 'refineDone':
          fx.pulseAt.refinery = now;
          burst(POS.refinery + 36, groundY - 12, 12, ORANGES, 100, 70);
          if (here && ev.source === 'worker' && state.built.cheesery) carry('refining', CM.mice.at(state, 'refining', zoneId), POS.refinery + 36, POS.cheesery + 42, tone(ev.base));
          break;
        case 'cheeseBoost':
          fx.station = 'cheesery';
          break;
        case 'lotDone':
          fx.pulseAt.cheesery = now;
          burst(center('cheesery'), groundY - 30, 16, YELLOWS, 100, 70);
          if (here && ev.source === 'worker' && state.built.shop) carry('cheesemaking', CM.mice.at(state, 'cheesemaking', zoneId), POS.cheesery + 38, POS.shop + 38, '#d93a4f');
          break;
        case 'sellStart':
        case 'sellBoost':
          if (ev.source !== 'worker') fx.station = 'shop';
          break;
        case 'sale':
          fx.pulseAt.shop = now;
          burst(center('shop'), groundY - 24, Math.min(40, 14 + ev.count * 4), COINS, 120, 90);
          customerLeaves();
          break;
        case 'nodeBought': {
          const st = (B.skills[ev.skill] || { station: 'storage' }).station;
          fx.pulseAt[st === 'rock' ? 'drill' : st] = now;
          burst(center(st), groundY - 26, 14, ['#ffe55c', '#ffffff', '#8df09a'], 90, 70);
          break;
        }
        case 'built':
          fx.popAt[ev.id] = now;
          fx.shake = Math.max(fx.shake, 3);
          break;
        case 'zoneFocus':
          fx.station = 'rock';
          fx.flash = 0.6;
          break;
      }
    }

    // ---------- Fondo ----------
    function drawBackground(state, now) {
      const Z = ZONE_BG[fx.zone] || ZONE_BG.cheddar;
      const horizon = groundY - 14;
      const bandH = Math.ceil(horizon / Z.sky.length);
      Z.sky.forEach((color, i) => R(0, i * bandH, W, bandH + 1, color));
      R(0, horizon, W, 16, Z.sky[5]);
      R(W - 34, 14, 12, 12, Z.sun);
      R(W - 36, 16, 16, 8, Z.sun);
      R(W - 32, 12, 8, 16, Z.sun);
      for (let i = 0; i < 4; i++) {
        const x = ((((i * 67 + now * (0.004 + i * 0.0012) - fx.cam * 0.05) % (W + 60)) + W + 60) % (W + 60)) - 40;
        const y = 10 + i * Math.max(12, horizon * 0.13);
        R(x, y + 3, 30, 5, '#dff3ff');
        R(x + 2, y + 1, 26, 5, '#ffffff');
        R(x + 7, y - 2, 12, 4, '#ffffff');
      }
      for (let x = 0; x < W; x++) {
        const wx = x + fx.cam * 0.15;
        const m = 34 + Math.abs(((wx * 0.9) % 70) - 35) * -0.9 + 32 + Math.sin(wx * 0.07) * 4;
        R(x, groundY - m, 1, m, Z.mount);
        if (m > 52) R(x, groundY - m, 1, Math.min(5, m - 52), '#eef8ff');
      }
      const hillAt = (wx) => 26 + Math.sin(wx * 0.045) * 9 + Math.sin(wx * 0.11 + 1) * 4;
      for (let x = 0; x < W; x++) {
        const wx = x + fx.cam * 0.4;
        const farH = hillAt(wx);
        R(x, groundY - farH, 1, farH, Z.far);
        R(x, groundY - farH, 1, 2, Z.farTop);
      }
      // El pueblo crece con el nivel total: una casa cada 6 niveles, torres más adelante.
      const total = q.totalLevel(state);
      const houses = Math.min(16, Math.floor((total - 5) / 6));
      for (let i = 0; i < houses; i++) {
        const wx = 14 + ((i * 53) % 230) + (i % 3) * 5;
        const x = Math.round(wx - fx.cam * 0.4);
        if (x < -12 || x > W + 4) continue;
        const y = groundY - Math.round(hillAt(wx + 4)) - 2;
        const tall = i >= 8 ? 5 : 0;
        const roof = ['#d9503a', '#4a8fe8', '#d9a514', '#9a5fd0'][i % 4];
        R(x, y - 4 - tall, 9, 7 + tall, '#2b1d12');
        R(x + 1, y - 3 - tall, 7, 5 + tall, '#f3e3b6');
        R(x - 1, y - 6 - tall, 11, 3, roof);
        R(x + 1, y - 8 - tall, 7, 2, roof);
        R(x + 3, y - 1, 2, 3, '#8b5a2b');
        if ((now / 900 + i) % 7 < 5) R(x + 6, y - 2 - tall, 2, 2, '#ffe55c');
        if (i >= 12) {
          R(x + 3, y - 15 - tall, 3, 8, '#2b1d12');
          R(x + 4, y - 14 - tall, 1, 7, roof);
        }
      }
      for (let i = 0; i < 9; i++) {
        const tx = Math.round(i * 44 + hash(i + 70) * 20 - fx.cam * 0.4);
        if (tx < -16 || tx > W + 4) continue;
        const ty = groundY - 20 - Math.round(hash(i + 90) * 8);
        R(tx + 5, ty + 8, 2, 12, '#6b4a2b');
        R(tx, ty, 12, 9, Z.tree);
        R(tx + 2, ty - 3, 8, 4, Z.tree);
        R(tx + 1, ty + 1, 5, 3, Z.treeHi);
      }
      for (let x = 0; x < W; x++) {
        const wx = x + fx.cam * 0.7;
        const nearH = 9 + Math.sin(wx * 0.08 + 2) * 4 + Math.sin(wx * 0.21) * 2;
        R(x, groundY - nearH, 1, nearH, Z.near);
      }
    }

    function drawGround(state, zoneId, now, dt) {
      const off = Math.round(fx.cam);
      R(0, groundY, W, 6, '#4fc234');
      R(0, groundY, W, 1, '#9cf45e');
      R(0, groundY + 6, W, H - groundY, '#7a4a2a');
      R(0, groundY + 6, W, 1, '#5c3620');
      // Camino de tierra por donde acarrean los ratones.
      R(-off, groundY + 1, WORLD, 2, '#c9a56a');
      for (let x = 0; x < W; x++) {
        const wx = x + off;
        if (wx % 5 === 0 && hash(wx + 3) > 0.5) R(x, groundY - 1, 1, 1, '#9cf45e');
        if (wx % 7 === 0 && hash(wx + 9) > 0.55) R(x, groundY + 5, 2, 2, '#4fc234');
        if (wx % 23 === 0 && hash(wx + 31) > 0.45) {
          R(x, groundY - 3, 1, 3, '#2f8f44');
          R(x - 1, groundY - 4, 3, 2, hash(wx) > 0.5 ? '#ffffff' : '#ff9ab5');
          R(x, groundY - 4, 1, 1, '#ffe55c');
        }
      }
      drawUnderground(state, zoneId, now, dt, off);
    }

    // Dígitos de 3x5 píxeles para los carteles de profundidad.
    const DIGITS = ['111101101101111', '010110010010111', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111'];
    function drawNumber(x, y, n, color) {
      const str = String(n);
      for (let i = 0; i < str.length; i++) {
        const glyph = DIGITS[+str[i]];
        for (let p = 0; p < 15; p++) if (glyph[p] === '1') R(x + i * 4 + (p % 3), y + ((p / 3) | 0), 1, 1, color);
      }
    }
    function drawSign(x, y, n) {
      const w = String(n).length * 4 + 3;
      R(x, y, w, 7, '#2b1d12');
      R(x + 1, y + 1, w - 2, 5, '#f3e3b6');
      drawNumber(x + 2, y + 1, n, '#2b1d12');
    }

    // SUBSUELO: enseña la profundidad de la roca que se está mirando. El terreno
    // baja contigo: cada nivel son LAYER píxeles, el material cambia cada cinco
    // niveles y el pozo llega siempre hasta donde estás, con su cartel.
    const LAYER = 8;
    const STRATA = [
      ['#7a4a2a', '#6e4226', '#5c3620'], // tierra
      ['#9a6a3a', '#8a5c30', '#6e4826'], // arcilla
      ['#6b6f7e', '#5f6371', '#4a4d59'], // piedra
      ['#4a5a7a', '#40506e', '#323f58'], // pizarra
      ['#5a3f7a', '#4f366c', '#3c2854'], // cristal
      ['#7a2f2a', '#6c2824', '#521d1a'], // magma
    ];
    function drawUnderground(state, zoneId, now, dt, off) {
      const z = state.zones[zoneId];
      const top = groundY + 6;
      const U = H - top;
      // El fondo del pozo se queda a media altura; lo de arriba se va por el borde.
      const target = Math.max(0, z.depth * LAYER - U * 0.5);
      if (fx.depthZone !== zoneId) {
        fx.depthZone = zoneId;
        fx.depthScroll = target;
      }
      fx.depthScroll += (target - fx.depthScroll) * Math.min(1, dt * 3);
      const scroll = fx.depthScroll;
      const T = CM.icons.TONES[q.zoneDef(zoneId).base] || CM.icons.TONES.cheddar;
      const strata = (level) => STRATA[Math.floor(Math.max(0, level) / 5) % STRATA.length];

      for (let y = top; y < H; y++) {
        const wy = y - top + scroll;
        const level = Math.floor(wy / LAYER);
        const pal = strata(level);
        const boundary = level > 0 && level % 5 === 0 && Math.floor(wy) % LAYER === 0;
        R(0, y, W, 1, boundary ? pal[2] : level % 2 ? pal[1] : pal[0]);
      }
      if (scroll < 1) R(0, top, W, 1, '#5c3620');

      // Piedras y trocitos de queso incrustados; se mueven con el terreno.
      for (let wy = Math.floor(scroll / 6) * 6; wy < scroll + U + 6; wy += 6) {
        const y = top + wy - scroll;
        if (y < top + 3 || y > H) continue;
        const pal = strata(Math.floor(wy / LAYER));
        for (let wx = off - (off % 7) - 7; wx < off + W + 7; wx += 7) {
          const r = h2(wx, wy, 5);
          const x = wx - off + Math.floor(h2(wx, wy, 6) * 4);
          if (r > 0.975) {
            R(x, y - 1, 5, 4, T.H);
            R(x + 1, y, 3, 2, T.M);
            R(x + 1, y, 1, 1, T.L);
          } else if (r > 0.93) R(x, y, 2, 2, T.M);
          else if (r > 0.6) R(x, y, 3, 2, pal[2]);
        }
      }
      if (z.depth <= 0) return;

      // Pozo desde la superficie hasta la profundidad actual.
      const sx = POS.rock + 22 - off;
      const y0 = top - 2;
      const bottom = top + z.depth * LAYER - scroll;
      const y1 = Math.min(H, bottom);
      R(sx - 1, y0, 12, y1 - y0 + 1, '#2b1d12');
      R(sx, y0, 10, y1 - y0, '#1c1410');
      R(sx + 2, y0, 1, y1 - y0, '#6b4a2b');
      R(sx + 7, y0, 1, y1 - y0, '#6b4a2b');
      for (let wy = Math.ceil(scroll / 4) * 4; wy < scroll + U; wy += 4) {
        const y = top + wy - scroll;
        if (y > y0 && y < y1 - 1) R(sx + 2, y, 6, 1, '#8b5a2b');
      }
      // Un cartel cada cinco niveles.
      for (let level = 5; level < z.depth; level += 5) {
        const y = top + level * LAYER - scroll;
        if (y > top + 4 && y < H - 4) drawSign(sx - 5 - String(level).length * 4, y - 3, level);
      }
      // Fondo del pozo: la bolsa de queso, un farol y el cartel del nivel actual.
      if (bottom < H) {
        R(sx - 5, bottom, 20, 5, T.H);
        R(sx - 4, bottom + 1, 18, 3, T.M);
        R(sx - 2, bottom + 1, 5, 1, T.L);
        R(sx + 12, bottom - 7, 1, 3, '#2b1d12');
        R(sx + 11, bottom - 4, 3, 4, ((now / 380) | 0) % 2 ? '#ffe55c' : '#fff3a0');
        drawSign(sx + 16, bottom - 4, z.depth);
      }
      // Montacargas: sube y baja mientras el taladro trabaja.
      if (z.drillJob && y1 - y0 > 14) {
        const t = (now / 1400) % 2;
        const cy = y0 + 2 + (y1 - y0 - 11) * (t < 1 ? t : 2 - t);
        R(sx + 4, y0, 1, cy - y0, '#aab0c0');
        R(sx + 1, cy, 8, 7, '#2b1d12');
        R(sx + 2, cy + 1, 6, 5, '#c9975a');
        R(sx + 3, cy + 2, 4, 2, T.M);
      }
    }

    // ---------- Edificios (coordenadas de mundo; el contexto ya está trasladado) ----------
    const pop = (id, now) => {
      const t = (now - (fx.popAt[id] || far)) / 300;
      return t < 1 ? -Math.pow(1 - t, 2) * 60 : 0;
    };

    // Parcela vacía: cartel de obra. Parpadea si ya se puede construir.
    function drawPlot(id, state, now) {
      const x = center(id) - 7;
      const y = groundY - 18;
      const can = CM.construction.buildInfo(state, id).canBuild;
      R(x + 6, y + 8, 2, 10, '#5c3620');
      R(x, y, 14, 9, '#2b1d12');
      R(x + 1, y + 1, 12, 7, '#c9975a');
      R(x + 1, y + 1, 12, 1, '#e6bb80');
      if (can && ((now / 350) | 0) % 2) {
        R(x + 6, y + 2, 2, 3, '#d93a4f');
        R(x + 6, y + 6, 2, 1, '#d93a4f');
      } else {
        R(x + 3, y + 3, 8, 1, '#7a4a2a');
        R(x + 3, y + 5, 6, 1, '#7a4a2a');
      }
    }
    const flag = (x, y, color, now) => {
      R(x, y, 1, 9, '#2b1d12');
      R(x + 1, y + (((now / 260) | 0) % 2), 5, 3, color);
    };

    // SPRITE: Cheese Shop
    function drawShop(state, now) {
      const t = q.visualTier(state, 'trading');
      const x = POS.shop;
      const y = groundY - 34 + pop('shop', now);
      const stripe = ['#e2462f', '#e2462f', '#3d6fd1', '#9a5fd0', '#3fa860', '#d9a514'][t];
      if (t >= 4) {
        // Segundo puesto detrás.
        R(x + 20, y - 6, 20, 30, '#2b1d12');
        R(x + 21, y - 5, 18, 28, '#e9d2a8');
        R(x + 24, y, 5, 5, '#ffe55c');
        R(x + 31, y, 5, 5, '#ffe55c');
      }
      R(x + 2, y + 8, 2, 26, '#5c3620');
      R(x + 34, y + 8, 2, 26, '#5c3620');
      const keeper = CM.mice.at(state, 'trading', 'all');
      if (keeper) ctx.drawImage(rankSprite(keeper), x + 9, y + 12 + (((now / 500) | 0) % 2));
      for (let i = 0; i < 6; i++) R(x + i * 6 + 1, y + 2, 6, 8, i % 2 ? '#ffffff' : stripe);
      R(x, y + 1, 38, 2, '#2b1d12');
      for (let i = 0; i < 6; i++) R(x + i * 6 + 2, y + 10, 4, 2, i % 2 ? '#dfe6ee' : '#2b1d12');
      if (t >= 2) for (let i = 0; i < 6; i++) R(x + i * 6 + 1, y - 2, 6, 4, i % 2 ? stripe : '#ffffff');
      R(x, y + 24, 38, 10, '#2b1d12');
      R(x + 1, y + 25, 36, 8, t >= 5 ? '#ffcf2e' : '#a9713a');
      R(x + 1, y + 25, 36, 2, t >= 5 ? '#fff3a0' : '#c9975a');
      const shown = Math.min(4, q.lotsTotal(state));
      for (let i = 0; i < shown; i++) {
        R(x + 4 + i * 8, y + 20, 6, 5, '#c97a08');
        R(x + 5 + i * 8, y + 21, 4, 3, '#ffcf2e');
        R(x + 5 + i * 8, y + 22, 4, 1, '#d93a4f');
      }
      if (t >= 1) {
        // Cartel con un queso.
        R(x + 13, y - 11 - (t >= 2 ? 4 : 0), 12, 9, '#2b1d12');
        R(x + 14, y - 10 - (t >= 2 ? 4 : 0), 10, 7, '#f3e3b6');
        R(x + 16, y - 8 - (t >= 2 ? 4 : 0), 6, 3, '#ffcf2e');
      }
      if (t >= 3) {
        flag(x + 1, y - 9, stripe, now);
        R(x + 33, y + 12, 3, 4, ((now / 300) | 0) % 2 ? '#ffe55c' : '#fff3a0');
      }
      if (state.jobs.shop) {
        const p = 1 - state.jobs.shop.remaining / state.jobs.shop.total;
        R(x + 4, y + 28, 30, 3, '#2b1d12');
        R(x + 5, y + 29, Math.round(28 * p), 1, '#5fcf6a');
      }
    }

    // SPRITE: Cheesery
    function drawCheesery(state, now) {
      const t = q.visualTier(state, 'cheesemaking');
      const x = POS.cheesery;
      const job = state.zones[fx.zoneId].cookJob;
      const y = groundY - 36 + pop('cheesery', now);
      const roofA = ['#b8503a', '#b8503a', '#3d6fd1', '#7a6fd0', '#3fb38a', '#d9a514'][t];
      const roofB = ['#8f3b2a', '#8f3b2a', '#2b4f9c', '#4a4296', '#1f7a5a', '#b8860b'][t];
      if (t >= 3) {
        // Torre de maduración.
        R(x + 26, y - 16, 14, 28, '#2b1d12');
        R(x + 27, y - 15, 12, 27, '#e9d2a8');
        for (let i = 0; i < 5; i++) R(x + 25 + i, y - 16 - i, 16 - i * 2, 1, roofA);
        R(x + 30, y - 10, 5, 5, job ? '#ffb347' : '#5a6a8a');
      }
      R(x + 30, y - 4, 6, 12, '#2b1d12');
      R(x + 31, y - 3, 4, 10, '#a85a3a');
      if (t >= 1) {
        R(x + 4, y - 2, 5, 10, '#2b1d12');
        R(x + 5, y - 1, 3, 9, '#a85a3a');
      }
      for (let i = 0; i < 9; i++) R(x - 1 + i, y + 9 - i, 42 - i * 2, 1, i % 3 === 0 ? roofB : roofA);
      R(x - 1, y + 9, 42, 2, '#2b1d12');
      R(x + 1, y + 11, 38, 25, '#2b1d12');
      R(x + 2, y + 12, 36, 23, '#f3e3b6');
      R(x + 2, y + 12, 36, 2, '#fff6d8');
      R(x + 2, y + 31, 36, 4, '#d9c38a');
      R(x + 5, y + 16, 12, 10, '#2b1d12');
      R(x + 6, y + 17, 10, 8, job ? (((now / 110) | 0) % 2 ? '#ffb347' : '#ff8a2e') : '#5a6a8a');
      R(x + 6, y + 20, 10, 1, '#2b1d12');
      R(x + 10, y + 17, 1, 8, '#2b1d12');
      R(x + 22, y + 20, 11, 16, '#2b1d12');
      R(x + 23, y + 21, 9, 14, '#8b5a2b');
      R(x + 30, y + 28, 1, 2, '#ffe55c');
      R(x + 23, y + 13, 9, 6, '#2b1d12');
      R(x + 24, y + 14, 7, 4, '#ffcf2e');
      R(x + 25, y + 15, 1, 1, '#e08a10');
      R(x + 28, y + 16, 1, 1, '#e08a10');
      if (t >= 2) {
        // Ruedas de queso apiladas fuera.
        for (let i = 0; i < Math.min(3, t - 1); i++) {
          R(x - 6, y + 30 - i * 5, 8, 5, '#2b1d12');
          R(x - 5, y + 31 - i * 5, 6, 3, '#ffcf2e');
          R(x - 5, y + 32 - i * 5, 6, 1, '#d93a4f');
        }
      }
      if (t >= 4) flag(x + 18, y - 8, roofA, now);
      if (job) {
        const p = 1 - job.remaining / job.total;
        R(x + 4, y + 28, 15, 3, '#2b1d12');
        R(x + 5, y + 29, Math.round(13 * p), 1, '#5fcf6a');
        if (Math.random() < 0.3) puff(x + 33, y - 5, '#fff6d8');
        if (t >= 1 && Math.random() < 0.2) puff(x + 6, y - 3, '#fff6d8');
      }
    }

    // SPRITE: Storage. Es una despensa sin tope: fuera se apilan cajas de lo que
    // guardas (Raw, Base y quesos), más altas cuanto más tienes. El edificio
    // nunca cambia de tamaño, así que no pisa a los vecinos.
    function drawStorage(state, now) {
      const x = POS.storage;
      const y = groundY - 30;
      for (let i = 0; i < 6; i++) R(x - 1 + i * 2, y + 6 - i, 40 - i * 4, 1, '#6b4a2b');
      R(x - 1, y + 6, 40, 2, '#2b1d12');
      R(x + 1, y + 8, 36, 22, '#2b1d12');
      R(x + 2, y + 9, 34, 20, '#a9713a');
      for (let i = 0; i < 5; i++) R(x + 2 + i * 7, y + 9, 1, 20, '#8b5a2b');
      R(x + 2, y + 9, 34, 2, '#c9975a');
      // Puerta abierta, oscura por dentro.
      R(x + 12, y + 14, 14, 16, '#2b1d12');
      R(x + 13, y + 15, 12, 15, '#3a2a1c');
      // Tres pilas: Raw, Base y quesos. Una caja más por cada orden de magnitud.
      const base = q.zoneDef(fx.zoneId || B.zones[0].id).base;
      const T = CM.icons.TONES[base] || CM.icons.TONES.cheddar;
      const piles = [
        [q.rawTotal(state), T.M, T.H, x + 2],
        [q.baseTotal(state), T.D, T.L, x + 14],
        [q.lotsTotal(state), '#d93a4f', '#ffffff', x + 26],
      ];
      for (const [amount, color, mark, px] of piles) {
        const crates = amount <= 0 ? 0 : Math.min(6, 1 + Math.floor(Math.log10(amount + 1) * 1.6));
        for (let c = 0; c < crates; c++) {
          const cy = groundY - 5 - c * 5;
          R(px, cy, 10, 5, '#2b1d12');
          R(px + 1, cy + 1, 8, 3, color);
          R(px + 4, cy + 2, 2, 1, mark);
        }
      }
    }

    // SPRITE: Mouse House. Las luces de la fachada son tus ratones; los que
    // no tienen puesto se asoman a la puerta.
    function drawHouse(state, now) {
      const x = POS.house;
      const y = groundY - 32 + pop('house', now);
      const count = state.mice.length;
      const idle = state.mice.filter((m) => !m.post);
      R(x + 26, y - 2, 5, 10, '#2b1d12');
      R(x + 27, y - 1, 3, 9, '#8a90a3');
      for (let i = 0; i < 10; i++) R(x - 1 + i, y + 10 - i, 38 - i * 2, 1, i % 3 === 0 ? '#2b5cab' : '#4a8fe8');
      R(x - 1, y + 10, 38, 2, '#2b1d12');
      R(x + 1, y + 12, 34, 20, '#2b1d12');
      R(x + 2, y + 13, 32, 18, '#e9d2a8');
      R(x + 2, y + 13, 32, 2, '#fff0cf');
      R(x + 6, y + 19, 10, 13, '#2b1d12');
      R(x + 7, y + 20, 8, 12, '#8b5a2b');
      R(x + 13, y + 26, 1, 2, '#ffe55c');
      R(x + 20, y + 17, 11, 9, '#2b1d12');
      R(x + 21, y + 18, 9, 7, count ? '#ffe55c' : '#5a6a8a');
      R(x + 25, y + 18, 1, 7, '#2b1d12');
      R(x + 21, y + 21, 9, 1, '#2b1d12');
      for (let i = 0; i < Math.min(8, count); i++) R(x + 3 + i * 4, y + 6 - (i % 2), 2, 2, '#ffe55c');
      if (count && Math.random() < 0.08) puff(x + 28, y - 3, '#e8ecf5');
      if (idle.length) drawMouseSprite(rankSprite(idle[0]), x - 12, groundY - MOUSE_H + 2 + (((now / 600) | 0) % 2), false, null);
    }

    // SPRITE: Refinery
    function drawRefinery(state, now) {
      const t = q.visualTier(state, 'refining');
      const job = state.zones[fx.zoneId].refJob;
      const M = METAL[t];
      const x = POS.refinery;
      const y = groundY - 30 + pop('refinery', now) + (job && ((now / 70) | 0) % 2 ? 1 : 0);
      const body = ['#3d6fd1', '#3d6fd1', '#3d8fd1', '#6a5fd0', '#2f9f8a', '#d9a514'][t];
      const hi = ['#74a6ff', '#74a6ff', '#7fc4ff', '#a99ff0', '#7fe0b8', '#fff3a0'][t];
      const chimneys = 1 + (t >= 1 ? 1 : 0) + (t >= 4 ? 1 : 0);
      for (let i = 0; i < chimneys; i++) {
        const cx = x + 24 - i * 9;
        const ch = 12 + i * 4 + (t >= 3 ? 6 : 0);
        R(cx, y + 4 - ch, 7, ch, '#1f2a44');
        R(cx + 1, y + 5 - ch, 5, ch - 1, '#596079');
        R(cx, y + 4 - ch, 7, 2, M[0]);
        if (job && Math.random() < 0.18) puff(cx + 3, y + 2 - ch, '#e8ecf5');
      }
      if (t >= 2) {
        // Depósito lateral con tubería.
        R(x - 12, y + 8, 12, 22, '#1f2a44');
        R(x - 11, y + 9, 10, 20, '#aab0c0');
        R(x - 11, y + 9, 3, 20, '#dfe6ee');
        R(x - 11, y + 16, 10, 1, '#656a7b');
        R(x - 2, y + 12, 4, 2, '#656a7b');
        R(x - 9, y + 5, 6, 4, '#656a7b');
      }
      R(x + 2, y - 4, 16, 5, '#5c3620');
      R(x + 3, y - 3, 14, 3, '#a9713a');
      R(x + 5, y, 10, 3, '#5c3620');
      R(x, y + 3, 36, 27, '#1f2a44');
      R(x + 1, y + 4, 34, 25, body);
      R(x + 1, y + 4, 34, 3, hi);
      R(x + 1, y + 24, 34, 5, '#2b4f9c');
      R(x + 4, y + 9, 18, 12, '#1f2a44');
      R(x + 5, y + 10, 16, 10, '#262b3a');
      if (job) {
        const p = 1 - job.remaining / job.total;
        R(x + 5, y + 10, 16, 10, ((now / 90) | 0) % 2 ? '#ff7a10' : '#ff9a2e');
        R(x + 5, y + 20 - Math.round(p * 10), 16, Math.round(p * 10), '#ffe55c');
      }
      R(x + 3, y + 6, 1, 1, '#bcd4ff');
      R(x + 32, y + 6, 1, 1, '#bcd4ff');
      R(x + 25, y + 12, 9, 6, '#1f2a44');
      R(x + 26, y + 13, 9, 4, '#aab0c0');
      if (t >= 3) {
        // Válvulas y manómetro.
        R(x + 25, y + 20, 8, 7, '#1f2a44');
        R(x + 26, y + 21, 6, 5, '#f3e3b6');
        R(x + 28, y + 22, 2, 2, job ? '#d93a4f' : '#656a7b');
      }
      if (t >= 5) R(x + 1, y + 4, 34, 1, '#ffffff');
      R(x + 2, y + 30, 6, 2, '#1f2a44');
      R(x + 28, y + 30, 6, 2, '#1f2a44');
    }

    // SPRITE: Cheese Drill
    function drawDrill(state, now, zoneId) {
      const t = q.visualTier(state, 'drilling');
      const M = METAL[t];
      const active = !!state.zones[zoneId].drillJob;
      const jitter = active ? ((now / 40) | 0) % 2 : 0;
      const x = POS.drill + jitter;
      const y = groundY - 15 + pop('drill', now);
      const big = t >= 2 ? 3 : 0;
      // Orugas a partir de tier 3; ruedas antes.
      if (t >= 3) {
        R(x - 3, y + 10, 22, 6, '#23252e');
        for (let i = 0; i < 5; i++) R(x - 2 + i * 4 + (active ? jitter : 0), y + 12, 2, 2, '#8a90a3');
      } else {
        R(x, y + 10, 6, 5, '#23252e');
        R(x + 10, y + 10, 6, 5, '#23252e');
        R(x + 2, y + 12, 2, 1, '#8a90a3');
        R(x + 12, y + 12, 2, 1, '#8a90a3');
      }
      R(x + 3, y - 1 - big, 4, 5 + big, '#2b2f3a');
      R(x + 4, y - big, 2, 4 + big, '#656a7b');
      if (t >= 1) {
        R(x + 9, y - 2 - big, 4, 6 + big, '#2b2f3a');
        R(x + 10, y - 1 - big, 2, 5 + big, '#656a7b');
      }
      R(x - 1, y + 2 - big, 18, 10 + big, M[2]);
      R(x, y + 3 - big, 16, 8 + big, M[0]);
      R(x, y + 3 - big, 16, 2, M[1]);
      R(x + 9, y + 6, 4, 3, active ? (jitter ? '#ffe55c' : '#ffffff') : M[2]);
      if (t >= 4) {
        // Cabina.
        R(x + 1, y - 6 - big, 9, 9, '#2b2f3a');
        R(x + 2, y - 5 - big, 7, 5, '#8ff3ff');
        flag(x + 13, y - 9 - big, M[0], now);
      }
      const tip = t >= 5 ? '#ffe55c' : active && jitter ? '#ffffff' : '#c9d0df';
      const steel = t >= 5 ? '#b8860b' : '#4a4f60';
      R(x + 17, y + 3 - big, 3, 8 + big, steel);
      R(x + 17, y + 4 - big, 3, 2, tip);
      R(x + 20, y + 4 - big, 3, 6 + big, steel);
      R(x + 20, y + 5, 3, 1, tip);
      R(x + 23, y + 5 - (big ? 1 : 0), 2, 4 + (big ? 2 : 0), steel);
      R(x + 25, y + 6, 2 + (t >= 2 ? 2 : 0), 2, tip);
      if (active && Math.random() < 0.5) burst(x + 27, y + 7, 1, ['#ffffff', '#ffe55c', '#ffcf2e'], 70, 30);
      if (active && Math.random() < 0.2) puff(x + 5, y - 2 - big, '#c9d0df');
    }

    function drawRock(state, now, zoneId) {
      const def = q.zoneDef(zoneId);
      const z = state.zones[zoneId];
      const need = q.veinHits(state, zoneId);
      const capacity = q.veinCapacity(state, zoneId);
      const job = z.drillJob;
      const crack = z.veinRevealed ? 0 : Math.min(4, Math.floor((5 * z.discover) / need));
      const depl = z.veinRevealed ? Math.max(1, Math.ceil((6 * (z.veinRemaining + (job ? job.amount : 0))) / capacity)) : 6;
      const key = [zoneId, z.depth, crack, z.veinRevealed, depl].join('|');
      if (rockCache.key !== key) rockCache = { key, img: buildRock((B.zones.indexOf(def) + 1) * 100 + z.depth, crack, z.veinRevealed, depl, ROCK_PAL[def.base]) };
      let x = POS.rock;
      let y = rockY();
      const dropT = (now - fx.rockDropAt) / 320;
      if (dropT < 1) y -= Math.pow(1 - dropT, 2) * (groundY + 20);
      else if (!fx.rockLanded) {
        fx.rockLanded = true;
        fx.shake = 5;
        burst(x + 27, groundY, 18, ['#93603a', '#7a4a2a', '#c9d0df'], 90, 40);
      }
      const hitT = (now - fx.rockHitAt) / 120;
      if (hitT < 1) x += Math.round((1 - hitT) * 2);
      if (job) x += ((now / 45) | 0) % 2;
      ctx.drawImage(rockCache.img, Math.round(x), Math.round(y));
      // Destello blanco al recibir un golpe.
      if (hitT < 0.6) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.55 * (1 - hitT / 0.6);
        ctx.drawImage(rockCache.img, Math.round(x), Math.round(y));
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
      }
      if (z.veinRevealed) {
        const n = Math.floor(now / 260);
        const sx = x + 14 + Math.floor(hash(n) * 26);
        const sy = y + 14 + Math.floor(hash(n + 99) * 20);
        R(sx, sy, 1, 1, '#ffffff');
        if (now % 260 < 130) {
          R(sx - 1, sy, 3, 1, '#ffffff');
          R(sx, sy - 1, 1, 3, '#ffffff');
        }
      }
      // Andamio de mina a partir de cierta profundidad.
      if (z.depth >= 2) {
        R(POS.rock + 46, groundY - 26, 2, 26, '#6b4a2b');
        R(POS.rock + 40, groundY - 26, 12, 2, '#8b5a2b');
        R(POS.rock + 50, groundY - 24, 1, 6, '#2b1d12');
        R(POS.rock + 49, groundY - 18, 3, 3, ((now / 400) | 0) % 2 ? '#ffe55c' : '#fff3a0');
      }
    }

    function drawPick(angle, gold) {
      ctx.rotate(angle);
      ctx.fillStyle = '#5c3620';
      ctx.fillRect(0, -1, 12, 2);
      ctx.fillStyle = '#2b2f3a';
      ctx.fillRect(10, -7, 4, 14);
      ctx.fillStyle = gold ? '#ffcf2e' : '#c9d0df';
      ctx.fillRect(11, -6, 2, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, -6, 2, 2);
    }
    const swing = (t, idle) => (t < 1 ? (t < 0.45 ? -1.9 + (t / 0.45) * 2.5 : 0.6 - ((t - 0.45) / 0.55) * 1.75) : idle);

    function drawMouseSprite(img, x, y, faceLeft, pickAngle, gold) {
      ctx.save();
      if (faceLeft) {
        ctx.translate(Math.round(x) + MOUSE_W, Math.round(y));
        ctx.scale(-1, 1);
      } else ctx.translate(Math.round(x), Math.round(y));
      ctx.drawImage(img, 0, 0);
      if (blinking) {
        ctx.fillStyle = '#f1eaec';
        ctx.fillRect(12, 6, 1, 2);
        ctx.fillStyle = '#2a1d2e';
        ctx.fillRect(12, 7, 1, 1);
      }
      if (pickAngle !== null) {
        ctx.translate(14, 12);
        drawPick(pickAngle, gold);
      }
      ctx.restore();
    }

    // Ratones en su puesto: los que tienes asignados a la línea que se está mirando.
    function drawStaff(state, now, zoneId) {
      const beat = (ms) => ((now / ms) | 0) % 2;
      const z = state.zones[zoneId];
      const at = (skill) => CM.mice.at(state, skill, zoneId);
      const miner = at('mining');
      if (miner) {
        const active = !z.veinRevealed;
        drawMouseSprite(rankSprite(miner), POS.rock + 6, rockY() - MOUSE_H + 8 + (active ? 0 : beat(700)), false, active ? swing(((now - fx.minerSwingAt) / 200) % 1.6, -1.1) + 0.5 : null);
      }
      const driller = at('drilling');
      if (driller && state.built.drill && !away('drilling')) drawMouseSprite(rankSprite(driller), POS.drill - 6, groundY - MOUSE_H - 8 + (z.drillJob ? beat(60) : beat(700)), false, null);
      const refiner = at('refining');
      if (refiner && state.built.refinery && !away('refining')) drawMouseSprite(rankSprite(refiner), POS.refinery + 36, groundY - MOUSE_H + 2 + (z.refJob ? beat(90) : beat(700)), true, null);
      const cook = at('cheesemaking');
      if (cook && state.built.cheesery && !away('cheesemaking')) drawMouseSprite(rankSprite(cook), POS.cheesery + 38, groundY - MOUSE_H + 2 + (z.cookJob ? beat(110) : beat(700)), true, null);
    }

    function drawWalkers(now, dt) {
      for (let i = walkers.length - 1; i >= 0; i--) {
        const w = walkers[i];
        const dir = w.to < w.x ? -1 : 1;
        w.x += dir * 70 * dt;
        if ((dir < 0 && w.x <= w.to) || (dir > 0 && w.x >= w.to)) {
          // Al llegar suelta la carga; si tiene puesto, vuelve a él con las manos vacías.
          if (w.carry && w.home !== undefined) {
            w.carry = null;
            w.to = w.home;
            continue;
          }
          walkers.splice(i, 1);
          continue;
        }
        const y = groundY - MOUSE_H + 2 - Math.abs(Math.sin(now / 60 + w.bob)) * 2;
        drawMouseSprite(w.img, w.x, y, dir < 0, null);
        if (w.carry) {
          R(w.x + 5, y - 5, 8, 6, '#2b1d12');
          R(w.x + 6, y - 4, 6, 4, w.carry);
          R(w.x + 6, y - 4, 6, 1, '#ffffff');
        }
      }
    }

    function drawPlayer(state, now, dt, zoneId) {
      const z = state.zones[zoneId];
      const st = fx.station === 'rock' && z.veinRevealed && state.built.drill ? 'drill' : fx.station;
      const target = { rock: POS.rock - 22, drill: POS.drill - 22, refinery: POS.refinery + 44, cheesery: POS.cheesery + 44, shop: POS.shop + 40 }[st];
      const gap = target - fx.mouseX;
      fx.mouseX += gap * Math.min(1, dt * 10);
      const walking = Math.abs(gap) > 1;
      if (walking && Math.random() < 0.3) puff(fx.mouseX + 8, groundY - 1, '#d9c9a8');
      const working = (st === 'drill' && z.drillJob) || (st === 'refinery' && state.zones[fx.zoneId].refJob) || (st === 'cheesery' && state.zones[fx.zoneId].cookJob) || (st === 'shop' && state.jobs.shop);
      const bob = walking ? -Math.abs(Math.sin(now / 55)) * 3 : working ? ((now / 80) | 0) % 2 : Math.round(Math.sin(now / 450) * 0.6);
      const faceLeft = walking ? gap < 0 : st !== 'rock' && st !== 'drill';
      const mining = st === 'rock' && !walking;
      const angle = mining ? swing((now - fx.swingAt) / 170, -1.15 + Math.sin(now / 420) * 0.05) : null;
      drawMouseSprite(MICE.player, fx.mouseX, groundY - MOUSE_H + 2 + bob, faceLeft, angle, q.visualTier(state, 'mining') >= 3);
    }

    // Rebote elástico de un edificio cuando produce o se mejora.
    function pulsed(id, now, drawFn) {
      const t = (now - (fx.pulseAt[id] || far)) / 260;
      if (t >= 1 || t < 0) return drawFn();
      const k = Math.sin(t * Math.PI) * 0.12;
      const cx = center(id);
      ctx.save();
      ctx.translate(cx, groundY);
      ctx.scale(1 - k * 0.6, 1 + k);
      ctx.translate(-cx, -groundY);
      drawFn();
      ctx.restore();
    }

    // Flecha que marca la estación seleccionada.
    function drawSelection(now) {
      const id = fx.selected;
      if (!POS[id]) return;
      const x = Math.round(center(id)) - 3;
      const y = (id === 'rock' ? rockY() - 14 : id === 'drill' ? groundY - 34 : groundY - 60) + Math.round(Math.sin(now / 180) * 2);
      R(x - 1, y - 1, 9, 3, '#1b1622');
      R(x, y + 2, 7, 2, '#1b1622');
      R(x + 1, y + 4, 5, 2, '#1b1622');
      R(x + 2, y + 6, 3, 2, '#1b1622');
      R(x, y, 7, 2, '#ffe55c');
      R(x + 1, y + 2, 5, 2, '#ffcf2e');
      R(x + 2, y + 4, 3, 2, '#ffcf2e');
      R(x + 3, y + 6, 1, 1, '#f5ab12');
    }

    function drawParticles(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.g > 0 && p.y > groundY + 2) {
          p.y = groundY + 2;
          p.vy *= -0.35;
          p.vx *= 0.6;
        }
        R(p.x, p.y, p.size, p.size, p.color);
      }
    }

    const BUILDINGS = { shop: drawShop, cheesery: drawCheesery, refinery: drawRefinery, house: drawHouse };

    function draw(state, now, dt, zoneId) {
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      fx.shake *= Math.exp(-dt * 11);
      fx.flash = Math.max(0, fx.flash - dt * 2.2);
      fx.cam += (fx.camTarget - fx.cam) * Math.min(1, dt * 8);
      fx.zone = q.zoneDef(zoneId).base;
      fx.zoneId = zoneId;
      blinking = now % 3400 < 130;
      drawBackground(state, now);
      drawGround(state, zoneId, now, dt);
      const sx = fx.shake > 0.3 ? Math.round((Math.random() - 0.5) * 2 * fx.shake) : 0;
      const sy = fx.shake > 0.3 ? Math.round((Math.random() - 0.5) * 2 * fx.shake) : 0;
      ctx.setTransform(1, 0, 0, 1, sx - Math.round(fx.cam), sy);
      for (const id of Object.keys(BUILDINGS)) {
        if (state.built[id]) pulsed(id, now, () => BUILDINGS[id](state, now));
        else if (CM.construction.buildInfo(state, id).condOk || id === 'refinery') drawPlot(id, state, now);
      }
      pulsed('storage', now, () => drawStorage(state, now));
      drawRock(state, now, zoneId);
      if (state.built.drill) pulsed('drill', now, () => drawDrill(state, now, zoneId));
      else if (CM.construction.buildInfo(state, 'drill').condOk) drawPlot('drill', state, now);
      drawStaff(state, now, zoneId);
      drawWalkers(now, dt);
      drawPlayer(state, now, dt, zoneId);
      drawSelection(now);
      drawParticles(dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (fx.flash > 0) R(0, 0, W, H, 'rgba(255,255,255,' + fx.flash.toFixed(2) + ')');
    }

    function reset() {
      particles.length = 0;
      walkers.length = 0;
      rockCache = { key: '', img: null };
      Object.assign(fx, { shake: 0, flash: 0, selected: 'rock', station: 'rock', rockDropAt: far, rockLanded: true, popAt: {}, pulseAt: {}, mouseX: POS.rock - 22 });
      focus('rock');
      fx.cam = fx.camTarget;
    }

    resize();
    focus('rock');
    fx.cam = fx.camTarget;
    return {
      W,
      resize,
      draw,
      onEvent,
      reset,
      focus,
      select(id) {
        fx.selected = id;
      },
      // Lluvia de confeti para los hitos.
      celebrate() {
        const colors = ['#ffe55c', '#ff5a7a', '#5fcf6a', '#74c4fa', '#ffffff', '#ff9a2e'];
        for (let i = 0; i < 60; i++) particles.push({ x: fx.cam + Math.random() * W, y: -4 - Math.random() * 30, vx: (Math.random() - 0.5) * 40, vy: 30 + Math.random() * 60, g: 60, life: 1.2 + Math.random() * 0.8, size: Math.random() < 0.5 ? 2 : 1, color: colors[i % colors.length] });
      },
      panBy(logicalPx) {
        fx.camTarget = Math.max(0, Math.min(WORLD - W, fx.camTarget + logicalPx));
        fx.cam = fx.camTarget;
      },
      // Posición en pantalla (fracción 0..1) del punto donde flotan los textos de un edificio.
      anchor(id) {
        const top = id === 'rock' ? rockY() + 6 : id === 'drill' ? groundY - 30 : groundY - 46;
        return [(center(id) - fx.cam) / W, top / H];
      },
      // Qué se ha pulsado, dada la X en píxeles lógicos de pantalla.
      hitTest(screenX) {
        const wx = screenX + fx.cam;
        if (wx >= POS.rock - 2) return 'rock';
        for (const id of ['drill', 'house', 'refinery', 'storage', 'cheesery', 'shop']) if (wx >= POS[id] - 3 && wx <= POS[id] + WIDTH[id] + 3) return id;
        return null;
      },
    };
  };
})();
