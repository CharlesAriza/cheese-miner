// Render de la colonia en vista lateral, sobre un canvas de baja resolución
// (160 px lógicos de ancho) escalado con image-rendering: pixelated.
// Solo dibuja: no modifica el estado ni decide nada de la economía.
// Todo el arte es placeholder hecho por código. Cada pieza sustituible por un
// PNG está marcada con "SPRITE:".
(function () {
  const B = CM.BALANCE;
  const q = CM.q;
  const W = 160;
  const WORLD = 346;
  const ROCK_W = 54;
  const ROCK_H = 42;
  // Posición X (mundo) de cada parcela.
  const POS = { market: 8, cheesery: 52, house: 98, storage: 140, refinery: 184, drill: 262, rock: 286 };
  const WIDTH = { market: 38, cheesery: 40, house: 36, storage: 38, refinery: 38, drill: 24, rock: ROCK_W };

  function hash(n) {
    n = Math.imul(n ^ (n >>> 15), 0x2c1b3c6d);
    n = Math.imul(n ^ (n >>> 12), 0x297a2d39);
    return ((n ^ (n >>> 15)) >>> 0) / 4294967296;
  }
  const h2 = (x, y, seed) => hash(x * 374761393 + y * 668265263 + seed * 982451653);

  const makeSprite = CM.makeSprite;

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
  const mousePalette = (helmet, brim, lamp) => ({
    H: helmet,
    h: brim,
    L: lamp,
    E: '#cfc6cc',
    P: '#ff9ab5',
    G: '#f1eaec',
    K: '#1b1622',
    N: '#ff7a9c',
    c: '#ffc2d1',
    B: '#8b5a2b',
    W: '#ffffff',
    T: '#ff9ab5',
    F: '#ff9ab5',
  });
  const MICE = {
    player: makeSprite(MOUSE_ROWS, mousePalette('#ffcf2e', '#d99a12', '#8ff3ff'), '#2a1d2e'),
    miner: makeSprite(MOUSE_ROWS, mousePalette('#ff8a3a', '#c85a14', '#ffe55c'), '#2a1d2e'),
    driller: makeSprite(MOUSE_ROWS, mousePalette('#e2562a', '#9c2f14', '#ffe55c'), '#2a1d2e'),
    refiner: makeSprite(MOUSE_ROWS, mousePalette('#4a8fe8', '#2b5cab', '#dff3ff'), '#2a1d2e'),
    merchant: makeSprite(MOUSE_ROWS, mousePalette('#5fcf6a', '#2f8f44', '#fff3a0'), '#2a1d2e'),
    cheesemaker: makeSprite(MOUSE_ROWS, mousePalette('#ffffff', '#c9d0df', '#ffffff'), '#2a1d2e'),
    // Clientes de la tienda: el sombrero indica el tipo de comprador.
    neighbor: makeSprite(MOUSE_ROWS, mousePalette('#c9975a', '#8b5a2b', '#e6bb80'), '#2a1d2e'),
    restaurant: makeSprite(MOUSE_ROWS, mousePalette('#f4f4f4', '#d93a4f', '#f4f4f4'), '#2a1d2e'),
    collector: makeSprite(MOUSE_ROWS, mousePalette('#9a5fd0', '#5f3590', '#ffe55c'), '#2a1d2e'),
    premium: makeSprite(MOUSE_ROWS, mousePalette('#ffd43a', '#b8860b', '#ffffff'), '#2a1d2e'),
  };
  // Mismo sprite para los paneles (retratos de clientes y trabajadores).
  const mouseUrls = {};
  CM.mouseUrl = (kind) => mouseUrls[kind] || (mouseUrls[kind] = (MICE[kind] || MICE.player).toDataURL());

  const MOUSE_W = MICE.player.width;
  const MOUSE_H = MICE.player.height;

  const ROCK_PAL = {
    cheddar: { rock: ['#b4bacb', '#8a90a3', '#656a7b'], spent: ['#7b8090', '#5f6473', '#484c59'], cheese: ['#ffe55c', '#ffcf2e', '#f5ab12'], hole: '#e08a10', rim: '#c97a08', glint: '#ffd43a' },
    gouda: { rock: ['#cdb7a0', '#a08a76', '#77634f'], spent: ['#8e7f70', '#6e6052', '#51463b'], cheese: ['#ffc46a', '#ff9f3a', '#e87a1c'], hole: '#c9600f', rim: '#a8520f', glint: '#ffb04a' },
    blue: { rock: ['#aab7d6', '#7f8cb0', '#5a6686'], spent: ['#7b8090', '#5f6473', '#484c59'], cheese: ['#f4f1dc', '#dcd8bd', '#7fa7d9'], hole: '#4a78b8', rim: '#8a8870', glint: '#cfe4ff' },
  };

  // SPRITE: Cheese Rock, generada por píxel según yacimiento, grietas y veta restante.
  function buildRock(seed, crack, revealed, deplStage, pal, spent) {
    const c = document.createElement('canvas');
    c.width = ROCK_W;
    c.height = ROCK_H;
    const g = c.getContext('2d');
    const cx = 27;
    const cy = 24;
    const a = 25;
    const b = 19;
    const inside = (x, y) =>
      x >= 0 && y >= 0 && x < ROCK_W && y < ROCK_H &&
      Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2) + (h2(x >> 2, y >> 2, seed) - 0.5) * 0.28 < 1;
    const core = (x, y) =>
      Math.pow((x - cx) / (a * 0.66), 2) + Math.pow((y - cy - 1) / (b * 0.68), 2) + (h2(x >> 1, y >> 1, seed + 7) - 0.5) * 0.2 < 1;
    const holes = [];
    for (let i = 0; i < 7; i++) {
      holes.push([cx + (hash(seed * 10 + i) - 0.5) * 26, cy + (hash(seed * 20 + i) - 0.5) * 18, 1.4 + hash(seed * 30 + i) * 2.2]);
    }
    const coreTop = cy + 1 - b * 0.68;
    const coreH = 2 * b * 0.68;
    const rock = spent ? pal.spent : pal.rock;

    for (let y = 0; y < ROCK_H; y++) {
      for (let x = 0; x < ROCK_W; x++) {
        if (!inside(x, y)) continue;
        let color;
        const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || (y < ROCK_H - 1 && !inside(x, y + 1));
        if (edge) {
          color = '#2b2f3a';
        } else if ((revealed || spent) && core(x, y)) {
          const cavity = spent || (y - coreTop) / coreH < 1 - deplStage / 6;
          const rim = !core(x - 1, y) || !core(x + 1, y) || !core(x, y - 1) || !core(x, y + 1);
          if (cavity) color = rim ? '#1c1410' : h2(x >> 1, y >> 1, seed + 11) > 0.8 ? '#4a3524' : '#33241a';
          else if (rim) color = pal.rim;
          else if (holes.some((h) => Math.hypot(x - h[0], y - h[1]) < h[2])) color = pal.hole;
          else color = y - cy < -4 ? pal.cheese[0] : y - cy < 6 ? pal.cheese[1] : pal.cheese[2];
        } else {
          const lit = (x - cx) * -0.4 + (y - cy) * -1 + h2(x >> 1, y >> 1, seed + 3) * 6;
          color = lit > 8 ? rock[0] : lit > -4 ? rock[1] : rock[2];
          // Con la roca muy agrietada asoma un brillo de queso (aviso visual, no recurso).
          if (!revealed && !spent && crack >= 3 && core(x, y) && h2(x, y, seed + 5) > (crack >= 4 ? 0.9 : 0.96)) color = pal.glint;
        }
        g.fillStyle = color;
        g.fillRect(x, y, 1, 1);
      }
    }
    if (!revealed && !spent) {
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

  // Cada zona tiñe el paisaje, para que cambiar de yacimiento se note.
  const ZONE_BG = {
    cheddar: { sky: ['#2f8fe6', '#3ea0f0', '#55b2f6', '#74c4fa', '#98d7fc', '#bfe8fd'], mount: '#7fb4d8', far: '#5fbf9a', farTop: '#86dcb4', tree: '#2f8f55', treeHi: '#4fb873', near: '#3fa860', sun: '#fff3a0' },
    gouda: { sky: ['#e8743a', '#f08a45', '#f6a258', '#fabb74', '#fcd398', '#fde6bf'], mount: '#b98a9a', far: '#c9903a', farTop: '#e6b35a', tree: '#b9521f', treeHi: '#e07a2a', near: '#8fa23a', sun: '#fff0c0' },
    blue: { sky: ['#2a3f8a', '#34509f', '#4666b8', '#6384cc', '#8aa6dd', '#b8cbec'], mount: '#6f7fb0', far: '#4f8f9a', farTop: '#6fb3bd', tree: '#2a6f7a', treeHi: '#3f95a1', near: '#3f8f7a', sun: '#e6f0ff' },
  };

  CM.createScene = function (canvas) {
    const ctx = canvas.getContext('2d');
    let H = 240;
    let groundY = 200;
    let rockCache = { key: '', img: null };
    const particles = [];
    const far = -1e9;
    const fx = {
      shake: 0,
      flash: 0,
      swingAt: far,
      minerSwingAt: far,
      rockHitAt: far,
      rockDropAt: far,
      rockLanded: true,
      station: 'mine',
      mouseX: POS.rock - 22,
      cam: WORLD - W,
      camTarget: WORLD - W,
      popAt: {},
      pulseAt: {},
      selected: 'rock',
      zone: 'cheddar',
    };

    const R = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x), Math.round(y), w, h);
    };

    function resize() {
      const box = canvas.parentElement.getBoundingClientRect();
      if (!box.width) return;
      H = Math.max(130, Math.min(420, Math.round((W * box.height) / box.width)));
      canvas.width = W;
      canvas.height = H;
      groundY = H - Math.max(30, Math.round(H * 0.26));
    }

    function burst(x, y, count, colors, speed, up) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.8);
        particles.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v - (up || 0), g: 260, life: 0.35 + Math.random() * 0.45, size: Math.random() < 0.3 ? 2 : 1, color: colors[(Math.random() * colors.length) | 0] });
      }
      if (particles.length > 260) particles.splice(0, particles.length - 260);
    }
    const puff = (x, y, color) => particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: -20, g: -10, life: 0.9, size: 2, color });

    const GREYS = ['#b4bacb', '#8a90a3', '#656a7b'];
    const YELLOWS = ['#ffe55c', '#ffcf2e', '#f5ab12', '#ffffff'];
    const ORANGES = ['#ff9a2e', '#ffcf2e', '#ffffff'];
    const COINS = ['#ffe55c', '#ffb81e', '#fff3a0'];
    const rockY = () => groundY - 40;
    const center = (id) => POS[id] + WIDTH[id] / 2;

    function focus(id) {
      fx.camTarget = Math.max(0, Math.min(WORLD - W, center(id) - W / 2));
    }

    function onEvent(ev, state, now) {
      const rx = POS.rock;
      const ry = rockY();
      switch (ev.type) {
        case 'hit':
          fx.rockHitAt = now;
          if (ev.source === 'manual') {
            fx.station = 'mine';
            fx.swingAt = now;
            fx.shake = Math.max(fx.shake, ev.crit ? 5 : 1.4);
            burst(rx + 8, ry + 22, ev.crit ? 16 : 6, ev.crit ? GREYS.concat(['#ffffff', '#ffd43a']) : GREYS, ev.crit ? 110 : 70, 40);
          } else {
            fx.minerSwingAt = now;
            burst(rx + 20, ry + 4, 4, GREYS, 60, 30);
          }
          break;
        case 'reveal':
          fx.flash = 1;
          fx.shake = 8;
          burst(rx + 27, ry + 22, 46, YELLOWS.concat(GREYS), 150, 60);
          break;
        case 'drillStart':
        case 'drillBoost':
          if (ev.source !== 'worker') fx.station = 'drill';
          if (ev.type === 'drillBoost') burst(rx + 6, ry + 26, 4, ['#ffffff', '#ffe55c'], 80, 30);
          break;
        case 'drillDone':
          fx.pulseAt.drill = now;
          burst(rx + 14, ry + 20, 12, YELLOWS, 110, 70);
          break;
        case 'veinDepleted':
          fx.shake = Math.max(fx.shake, 4);
          burst(rx + 27, ry + 22, 22, GREYS, 100, 30);
          break;
        case 'refineStart':
        case 'refineBoost':
          if (ev.source !== 'worker') fx.station = 'refine';
          if (ev.type === 'refineBoost') burst(POS.refinery + 30, groundY - 16, 3, ORANGES, 60, 30);
          break;
        case 'refineDone':
          fx.pulseAt.refinery = now;
          burst(POS.refinery + 36, groundY - 12, 12, ORANGES, 100, 70);
          break;
        case 'lotDone':
          fx.pulseAt.cheesery = now;
          burst(center('cheesery'), groundY - 30, 16, YELLOWS, 100, 70);
          break;
        case 'sale':
          fx.pulseAt.market = now;
          burst(center('market'), groundY - 24, ev.stance === 'premium' ? 44 : 24, COINS, 120, 90);
          if (ev.stance === 'premium' || ev.stance === 'markup') fx.shake = Math.max(fx.shake, 3);
          break;
        case 'upgraded':
        case 'hired':
          fx.pulseAt[ev.id || { driller: 'drill', refiner: 'refinery', cheesemaker: 'cheesery' }[ev.role] || 'house'] = now;
          break;
        case 'built':
          fx.popAt[ev.id] = now;
          fx.shake = Math.max(fx.shake, 3);
          break;
        case 'depositSwitched':
          fx.station = 'mine';
          fx.flash = 0.8;
          fx.rockDropAt = now;
          fx.rockLanded = false;
          break;
      }
    }

    // ---------- Fondo ----------
    function drawBackground(now) {
      const Z = ZONE_BG[fx.zone] || ZONE_BG.cheddar;
      const bands = Z.sky;
      const horizon = groundY - 14;
      const bandH = Math.ceil(horizon / bands.length);
      bands.forEach((color, i) => R(0, i * bandH, W, bandH + 1, color));
      R(0, horizon, W, 16, bands[5]);
      R(W - 34, 14, 12, 12, Z.sun);
      R(W - 36, 16, 16, 8, Z.sun);
      R(W - 32, 12, 8, 16, Z.sun);

      for (let i = 0; i < 4; i++) {
        const x = ((i * 67 + now * (0.004 + i * 0.0012) - fx.cam * 0.05) % (W + 60) + W + 60) % (W + 60) - 40;
        const y = 10 + i * Math.max(12, horizon * 0.13);
        R(x, y + 3, 30, 5, '#dff3ff');
        R(x + 2, y + 1, 26, 5, '#ffffff');
        R(x + 7, y - 2, 12, 4, '#ffffff');
      }
      // Montañas lejanas (parallax lento)
      for (let x = 0; x < W; x++) {
        const wx = x + fx.cam * 0.15;
        const m = 34 + Math.abs(((wx * 0.9) % 70) - 35) * -0.9 + 32 + Math.sin(wx * 0.07) * 4;
        R(x, groundY - m, 1, m, Z.mount);
        if (m > 52) R(x, groundY - m, 1, Math.min(5, m - 52), '#eef8ff');
      }
      // Colinas con arbolado (parallax medio)
      for (let x = 0; x < W; x++) {
        const wx = x + fx.cam * 0.4;
        const farH = 26 + Math.sin(wx * 0.045) * 9 + Math.sin(wx * 0.11 + 1) * 4;
        R(x, groundY - farH, 1, farH, Z.far);
        R(x, groundY - farH, 1, 2, Z.farTop);
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

    function drawGround() {
      const off = Math.round(fx.cam);
      R(0, groundY, W, 6, '#4fc234');
      R(0, groundY, W, 1, '#9cf45e');
      R(0, groundY + 6, W, H - groundY, '#7a4a2a');
      R(0, groundY + 6, W, 1, '#5c3620');
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
      for (let y = groundY + 10; y < H; y += 6) {
        for (let wx = off - (off % 7) - 7; wx < off + W + 7; wx += 7) {
          const r = h2(wx, y, 5);
          const x = wx - off + Math.floor(h2(wx, y, 6) * 4);
          if (r > 0.975) {
            R(x, y - 1, 5, 4, '#c97a08');
            R(x + 1, y, 3, 2, '#ffcf2e');
            R(x + 1, y, 1, 1, '#fff3a0');
          } else if (r > 0.93) R(x, y, 2, 2, '#f5b921');
          else if (r > 0.6) R(x, y, 3, 2, '#5c3620');
          else if (r > 0.5) R(x, y, 2, 1, '#93603a');
        }
      }
    }

    // ---------- Edificios (coordenadas de mundo; el contexto ya está trasladado) ----------
    const pop = (id, now) => {
      const t = (now - (fx.popAt[id] || far)) / 300;
      return t < 1 ? -Math.pow(1 - t, 2) * 60 : 0;
    };

    // Parcela vacía: cartel de obra. Parpadea si ya se puede construir.
    function drawPlot(id, state, now) {
      const x = POS[id] + WIDTH[id] / 2 - 7;
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

    // SPRITE: Market
    function drawMarket(state, now) {
      const x = POS.market;
      const y = groundY - 34 + pop('market', now);
      R(x + 2, y + 8, 2, 26, '#5c3620');
      R(x + 34, y + 8, 2, 26, '#5c3620');
      ctx.drawImage(MICE.merchant, x + 9, y + 12 + (((now / 500) | 0) % 2));
      for (let i = 0; i < 6; i++) R(x + i * 6 + 1, y + 2, 6, 8, i % 2 ? '#ffffff' : '#e2462f');
      R(x, y + 1, 38, 2, '#2b1d12');
      for (let i = 0; i < 6; i++) R(x + i * 6 + 2, y + 10, 4, 2, i % 2 ? '#dfe6ee' : '#b8321f');
      R(x, y + 24, 38, 10, '#2b1d12');
      R(x + 1, y + 25, 36, 8, '#a9713a');
      R(x + 1, y + 25, 36, 2, '#c9975a');
      const lots = Math.min(4, q.lotsTotal(state));
      for (let i = 0; i < lots; i++) {
        R(x + 4 + i * 8, y + 20, 6, 5, '#c97a08');
        R(x + 5 + i * 8, y + 21, 4, 3, '#ffcf2e');
      }
      // Clientes esperando delante del mostrador.
      state.orders.forEach((o, i) => {
        if (!o || !o.id) return;
        const hurry = o.patience < o.patienceMax * 0.25;
        drawMouseSprite(MICE[o.buyer], x + 12 + i * 10, groundY - MOUSE_H + 3 + (((now / (hurry ? 120 : 520) + i) | 0) % 2), true, null);
      });
      const waiting = state.orders.filter((o) => o && o.id).length;
      if (waiting && ((now / 400) | 0) % 2) {
        R(x + 30, y - 8, 7, 8, '#2b1d12');
        R(x + 31, y - 7, 5, 6, '#ffffff');
        R(x + 33, y - 6, 1, 3, '#d93a4f');
        R(x + 33, y - 2, 1, 1, '#d93a4f');
      }
    }

    // SPRITE: Cheesery
    function drawCheesery(state, now) {
      const x = POS.cheesery;
      const job = state.jobs.cheesery;
      const y = groundY - 36 + pop('cheesery', now);
      R(x + 30, y - 4, 6, 12, '#2b1d12');
      R(x + 31, y - 3, 4, 10, '#a85a3a');
      for (let i = 0; i < 9; i++) R(x - 1 + i, y + 9 - i, 42 - i * 2, 1, i % 3 === 0 ? '#8f3b2a' : '#b8503a');
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
      if (job) {
        const p = 1 - job.remaining / job.total;
        R(x + 4, y + 28, 15, 3, '#2b1d12');
        R(x + 5, y + 29, Math.round(13 * p), 1, '#5fcf6a');
        if (Math.random() < 0.3) puff(x + 33, y - 5, '#fff6d8');
      }
    }

    // SPRITE: Mouse House
    function drawHouse(state, now) {
      const x = POS.house;
      const y = groundY - 32 + pop('house', now);
      const lit = q.workersTotal(state) > 0;
      R(x + 26, y - 2, 5, 10, '#2b1d12');
      R(x + 27, y - 1, 3, 9, '#8a90a3');
      for (let i = 0; i < 10; i++) R(x - 1 + i, y + 10 - i, 38 - i * 2, 1, i % 3 === 0 ? '#2b5cab' : '#4a8fe8');
      R(x - 1, y + 10, 38, 2, '#2b1d12');
      R(x + 1, y + 12, 34, 20, '#2b1d12');
      R(x + 2, y + 13, 32, 18, '#e9d2a8');
      R(x + 2, y + 13, 32, 2, '#fff0cf');
      R(x + 6, y + 19, 10, 13, '#2b1d12');
      R(x + 7, y + 20, 8, 12, '#8b5a2b');
      R(x + 8, y + 19, 6, 1, '#8b5a2b');
      R(x + 13, y + 26, 1, 2, '#ffe55c');
      R(x + 20, y + 17, 11, 9, '#2b1d12');
      R(x + 21, y + 18, 9, 7, lit ? '#ffe55c' : '#5a6a8a');
      R(x + 25, y + 18, 1, 7, '#2b1d12');
      R(x + 21, y + 21, 9, 1, '#2b1d12');
      const beds = q.slots(state);
      for (let i = 0; i < beds; i++) R(x + 4 + i * 5, y + 6, 3, 3, i < q.workersTotal(state) ? '#ffe55c' : '#1f3f7a');
      if (lit && Math.random() < 0.08) puff(x + 28, y - 3, '#e8ecf5');
    }

    // SPRITE: Storage. Las tres barras muestran el llenado real de raw, base y lotes.
    function drawStorage(state, now) {
      const x = POS.storage;
      const y = groundY - 30 + pop('storage', now);
      const caps = q.caps(state);
      for (let i = 0; i < 6; i++) R(x - 1 + i * 2, y + 6 - i, 40 - i * 4, 1, '#6b4a2b');
      R(x - 1, y + 6, 40, 2, '#2b1d12');
      R(x + 1, y + 8, 36, 22, '#2b1d12');
      R(x + 2, y + 9, 34, 20, '#a9713a');
      for (let i = 0; i < 5; i++) R(x + 2 + i * 7, y + 9, 1, 20, '#8b5a2b');
      R(x + 2, y + 9, 34, 2, '#c9975a');
      const bars = [
        [q.rawTotal(state) / caps.raw, '#ffcf2e'],
        [q.baseTotal(state) / caps.base, '#ff9a2e'],
        [q.lotsTotal(state) / caps.lots, '#5fcf6a'],
      ];
      bars.forEach((bar, i) => {
        const bx = x + 6 + i * 10;
        R(bx, y + 13, 7, 14, '#2b1d12');
        R(bx + 1, y + 14, 5, 12, '#3a2a1c');
        const h = Math.round(Math.min(1, bar[0]) * 12);
        R(bx + 1, y + 26 - h, 5, h, bar[0] >= 1 && ((now / 300) | 0) % 2 ? '#ff5a7a' : bar[1]);
      });
    }

    // SPRITE: Refinery
    function drawRefinery(state, now) {
      const job = state.jobs.refinery;
      const x = POS.refinery;
      const y = groundY - 30 + pop('refinery', now) + (job && ((now / 70) | 0) % 2 ? 1 : 0);
      R(x + 24, y - 8, 7, 12, '#1f2a44');
      R(x + 25, y - 7, 5, 11, '#596079');
      R(x + 2, y - 4, 16, 5, '#5c3620');
      R(x + 3, y - 3, 14, 3, '#a9713a');
      R(x + 5, y, 10, 3, '#5c3620');
      R(x, y + 3, 36, 27, '#1f2a44');
      R(x + 1, y + 4, 34, 25, '#3d6fd1');
      R(x + 1, y + 4, 34, 3, '#74a6ff');
      R(x + 1, y + 24, 34, 5, '#2b4f9c');
      R(x + 4, y + 9, 18, 12, '#1f2a44');
      R(x + 5, y + 10, 16, 10, '#262b3a');
      if (job) {
        const p = 1 - job.remaining / job.total;
        R(x + 5, y + 10, 16, 10, ((now / 90) | 0) % 2 ? '#ff7a10' : '#ff9a2e');
        R(x + 5, y + 20 - Math.round(p * 10), 16, Math.round(p * 10), '#ffe55c');
        if (Math.random() < 0.3) puff(x + 27, y - 9, '#e8ecf5');
      }
      R(x + 3, y + 6, 1, 1, '#bcd4ff');
      R(x + 32, y + 6, 1, 1, '#bcd4ff');
      R(x + 25, y + 12, 9, 6, '#1f2a44');
      R(x + 26, y + 13, 9, 4, '#aab0c0');
      R(x + 2, y + 30, 6, 2, '#1f2a44');
      R(x + 28, y + 30, 6, 2, '#1f2a44');
    }

    // SPRITE: Cheese Drill
    function drawDrill(state, now) {
      const active = !!state.jobs.drill;
      const jitter = active ? ((now / 40) | 0) % 2 : 0;
      const x = POS.drill + jitter;
      const y = groundY - 15 + pop('drill', now);
      R(x, y + 10, 6, 5, '#23252e');
      R(x + 10, y + 10, 6, 5, '#23252e');
      R(x + 2, y + 12, 2, 1, '#8a90a3');
      R(x + 12, y + 12, 2, 1, '#8a90a3');
      R(x + 3, y - 1, 4, 5, '#2b2f3a');
      R(x + 4, y, 2, 4, '#656a7b');
      R(x - 1, y + 2, 18, 10, '#5a1e12');
      R(x, y + 3, 16, 8, '#e2562a');
      R(x, y + 3, 16, 2, '#ff8a4a');
      R(x + 9, y + 6, 4, 3, active ? (jitter ? '#ffe55c' : '#ffffff') : '#5a1e12');
      const light = active && jitter ? '#ffffff' : '#c9d0df';
      R(x + 17, y + 3, 3, 8, '#4a4f60');
      R(x + 17, y + 4, 3, 2, light);
      R(x + 20, y + 4, 3, 6, '#4a4f60');
      R(x + 20, y + 5, 3, 1, light);
      R(x + 23, y + 5, 2, 4, '#4a4f60');
      R(x + 25, y + 6, 2, 2, light);
      if (active && Math.random() < 0.5) burst(x + 27, y + 7, 1, ['#ffffff', '#ffe55c', '#ffcf2e'], 70, 30);
      if (active && Math.random() < 0.2) puff(x + 5, y - 2, '#c9d0df');
    }

    function drawRock(state, now) {
      const id = state.activeDeposit;
      const def = q.depDef(id);
      const d = state.deposits[id];
      const vein = q.veinDef(state, id);
      const spent = !vein;
      const job = state.jobs.drill && state.jobs.drill.deposit === id ? state.jobs.drill : null;
      const crack = spent || d.veinRevealed ? 0 : Math.min(4, Math.floor((5 * d.discover) / vein.hits));
      const depl = spent ? 0 : d.veinRevealed ? Math.max(1, Math.ceil((6 * (d.veinRemaining + (job ? job.amount : 0))) / vein.capacity)) : 6;
      const key = [id, d.veinIndex, crack, d.veinRevealed, depl, spent].join('|');
      if (rockCache.key !== key) {
        const seed = (B.deposits.indexOf(def) + 1) * 10 + d.veinIndex;
        rockCache = { key, img: buildRock(seed, crack, d.veinRevealed, depl, ROCK_PAL[def.base], spent) };
      }
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

      if (d.veinRevealed) {
        const n = Math.floor(now / 260);
        const sx = x + 14 + Math.floor(hash(n) * 26);
        const sy = y + 14 + Math.floor(hash(n + 99) * 20);
        R(sx, sy, 1, 1, '#ffffff');
        if (now % 260 < 130) {
          R(sx - 1, sy, 3, 1, '#ffffff');
          R(sx, sy - 1, 1, 3, '#ffffff');
        }
      }
      if (spent) {
        R(x + 2, groundY - 3, 4, 3, '#5f6473');
        R(x + 9, groundY - 2, 3, 2, '#7b8090');
        R(x + 44, groundY - 3, 5, 3, '#5f6473');
      }
      // Marcadores de vetas del yacimiento: agotada, actual, pendiente.
      def.veins.forEach((v, i) => {
        const px = POS.rock + 27 - def.veins.length * 3 + i * 6;
        R(px, rockY() - 8, 5, 5, '#2b1d12');
        R(px + 1, rockY() - 7, 3, 3, i < d.veinIndex ? '#484c59' : i === d.veinIndex && d.veinRevealed ? '#ffcf2e' : '#aab0c0');
      });
    }

    function drawPick(angle) {
      ctx.rotate(angle);
      ctx.fillStyle = '#5c3620';
      ctx.fillRect(0, -1, 12, 2);
      ctx.fillStyle = '#2b2f3a';
      ctx.fillRect(10, -7, 4, 14);
      ctx.fillStyle = '#c9d0df';
      ctx.fillRect(11, -6, 2, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(11, -6, 2, 2);
    }
    const swing = (t, idle) => (t < 1 ? (t < 0.45 ? -1.9 + (t / 0.45) * 2.5 : 0.6 - ((t - 0.45) / 0.55) * 1.75) : idle);

    let blinking = false;
    function drawMouseSprite(img, x, y, faceLeft, pickAngle) {
      ctx.save();
      if (faceLeft) {
        ctx.translate(Math.round(x) + MOUSE_W, Math.round(y));
        ctx.scale(-1, 1);
      } else ctx.translate(Math.round(x), Math.round(y));
      ctx.drawImage(img, 0, 0);
      // Parpadeo.
      if (blinking) {
        ctx.fillStyle = '#f1eaec';
        ctx.fillRect(12, 6, 1, 2);
        ctx.fillStyle = '#2a1d2e';
        ctx.fillRect(12, 7, 1, 1);
      }
      if (pickAngle !== null) {
        ctx.translate(14, 12);
        drawPick(pickAngle);
      }
      ctx.restore();
    }

    function drawWorkers(state, now) {
      const beat = (ms) => ((now / ms) | 0) % 2;
      if (state.workers.miner > 0) {
        const active = CM.workers.status(state, 'miner') === 'active';
        for (let i = 0; i < state.workers.miner; i++) {
          const t = (now - fx.minerSwingAt) / 200;
          const angle = active ? swing(t, -1.1) + 0.5 : null;
          drawMouseSprite(MICE.miner, POS.rock + 4 + i * 18, rockY() - MOUSE_H + 8 + (active ? 0 : beat(700)), false, angle);
        }
      }
      if (state.workers.driller > 0) {
        const active = !!state.jobs.drill;
        drawMouseSprite(MICE.driller, POS.drill - 6, groundY - MOUSE_H - 8 + (active ? beat(60) : beat(700)), false, null);
      }
      if (state.workers.cheesemaker > 0) {
        const active = !!state.jobs.cheesery;
        drawMouseSprite(MICE.cheesemaker, POS.cheesery + 38, groundY - MOUSE_H + 2 + (active ? beat(110) : beat(700)), true, null);
      }
      if (state.workers.refiner > 0) {
        const active = !!state.jobs.refinery;
        drawMouseSprite(MICE.refiner, POS.refinery + 36, groundY - MOUSE_H + 2 + (active ? beat(90) : beat(700)), true, null);
      }
    }

    function drawPlayer(state, now, dt) {
      const d = q.dep(state);
      const station = fx.station === 'mine' && d.veinRevealed ? 'drill' : fx.station;
      const target = station === 'refine' ? POS.refinery + 44 : station === 'drill' ? POS.drill - 22 : POS.rock - 22;
      const gap = target - fx.mouseX;
      fx.mouseX += gap * Math.min(1, dt * 10);
      const walking = Math.abs(gap) > 1;
      if (walking && Math.random() < 0.3) puff(fx.mouseX + 8, groundY - 1, '#d9c9a8');
      const working = (station === 'drill' && state.jobs.drill) || (station === 'refine' && state.jobs.refinery);
      const bob = walking ? -Math.abs(Math.sin(now / 55)) * 3 : working ? ((now / 80) | 0) % 2 : Math.round(Math.sin(now / 450) * 0.6);
      const faceLeft = walking ? gap < 0 : station === 'refine';
      const mining = station === 'mine' && !walking;
      const angle = mining ? swing((now - fx.swingAt) / 170, -1.15 + Math.sin(now / 420) * 0.05) : null;
      drawMouseSprite(MICE.player, fx.mouseX, groundY - MOUSE_H + 2 + bob, faceLeft, angle);
    }

    // Rebote elástico de un edificio cuando produce, se mejora o recibe a su trabajador.
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

    // Vida de fondo: mariposas que revolotean sobre la hierba.
    function drawAmbient(now) {
      for (let i = 0; i < 3; i++) {
        const t = now / 1000 + i * 7.3;
        const x = 60 + i * 95 + Math.sin(t * 0.7) * 26;
        const y = groundY - 16 - Math.abs(Math.sin(t * 1.3)) * 14;
        const flap = ((now / 110 + i) | 0) % 2;
        const color = ['#ff9ab5', '#fff3a0', '#8ff3ff'][i];
        R(x, y, 1, 2, '#2a1d2e');
        R(x - (flap ? 2 : 1), y - (flap ? 1 : 0), flap ? 2 : 1, 2, color);
        R(x + 1, y - (flap ? 1 : 0), flap ? 2 : 1, 2, color);
      }
    }

    // Flecha que marca la estación seleccionada.
    function drawSelection(now) {
      const id = fx.selected;
      if (!POS[id]) return;
      const x = Math.round(center(id)) - 3;
      const y = (id === 'rock' ? rockY() - 20 : id === 'drill' ? groundY - 30 : groundY - 52) + Math.round(Math.sin(now / 180) * 2);
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

    const BUILDINGS = { market: drawMarket, cheesery: drawCheesery, house: drawHouse, storage: drawStorage, refinery: drawRefinery, drill: drawDrill };

    function draw(state, now, dt) {
      ctx.imageSmoothingEnabled = false;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      fx.shake *= Math.exp(-dt * 11);
      fx.flash = Math.max(0, fx.flash - dt * 2.2);
      fx.cam += (fx.camTarget - fx.cam) * Math.min(1, dt * 8);
      fx.zone = q.depDef(state.activeDeposit).base;
      blinking = now % 3400 < 130;
      drawBackground(now);
      drawGround();
      const sx = fx.shake > 0.3 ? Math.round((Math.random() - 0.5) * 2 * fx.shake) : 0;
      const sy = fx.shake > 0.3 ? Math.round((Math.random() - 0.5) * 2 * fx.shake) : 0;
      ctx.setTransform(1, 0, 0, 1, sx - Math.round(fx.cam), sy);
      for (const id of Object.keys(BUILDINGS)) {
        if (id === 'drill') continue;
        if (state.built[id]) pulsed(id, now, () => BUILDINGS[id](state, now));
        else drawPlot(id, state, now);
      }
      drawAmbient(now);
      drawRock(state, now);
      if (state.built.drill) pulsed('drill', now, () => drawDrill(state, now));
      else if (CM.construction.buildInfo(state, 'drill').condOk) drawPlot('drill', state, now);
      drawWorkers(state, now);
      drawPlayer(state, now, dt);
      drawSelection(now);
      drawParticles(dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (fx.flash > 0) R(0, 0, W, H, 'rgba(255,255,255,' + fx.flash.toFixed(2) + ')');
    }

    function reset() {
      particles.length = 0;
      rockCache = { key: '', img: null };
      Object.assign(fx, { shake: 0, flash: 0, selected: 'rock', station: 'mine', rockDropAt: far, rockLanded: true, popAt: {}, mouseX: POS.rock - 22 });
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
      focus(id) {
        focus(id === 'drill' ? 'rock' : id);
      },
      select(id) {
        fx.selected = id;
      },
      // Lluvia de confeti para los hitos.
      celebrate() {
        const colors = ['#ffe55c', '#ff5a7a', '#5fcf6a', '#74c4fa', '#ffffff', '#ff9a2e'];
        for (let i = 0; i < 60; i++) {
          particles.push({ x: fx.cam + Math.random() * W, y: -4 - Math.random() * 30, vx: (Math.random() - 0.5) * 40, vy: 30 + Math.random() * 60, g: 60, life: 1.2 + Math.random() * 0.8, size: Math.random() < 0.5 ? 2 : 1, color: colors[i % colors.length] });
        }
      },
      panBy(logicalPx) {
        fx.camTarget = Math.max(0, Math.min(WORLD - W, fx.camTarget + logicalPx));
        fx.cam = fx.camTarget;
      },
      // Posición en pantalla (fracción 0..1) del punto donde flotan los textos de un edificio.
      anchor(id) {
        const top = id === 'rock' ? rockY() + 6 : groundY - 44;
        return [(center(id) - fx.cam) / W, top / H];
      },
      // Qué se ha pulsado, dada la X en píxeles lógicos de pantalla.
      hitTest(screenX) {
        const wx = screenX + fx.cam;
        if (wx >= POS.rock - 2) return 'rock';
        for (const id of ['drill', 'refinery', 'storage', 'house', 'cheesery', 'market']) {
          if (wx >= POS[id] - 3 && wx <= POS[id] + WIDTH[id] + 3) return id;
        }
        return null;
      },
    };
  };
})();
