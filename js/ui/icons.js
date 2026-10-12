// Iconos de recursos en pixel art. Se usan igual en el HUD, la cadena, los
// paneles y los efectos, para que cada recurso tenga siempre la misma forma:
//   Raw Cheese  = trozo irregular con agujeros
//   Cheese Base = bloque liso
//   Lote        = rueda de queso con etiqueta
//   Moneda      = disco dorado
// El color depende de la base (Cheddar amarillo, Gouda naranja, Blue claro).
// SPRITE: para usar PNG finales, devuelve aquí la ruta del archivo.
(function () {
  // Convierte un mapa de caracteres en un canvas con contorno automático.
  CM.makeSprite = function (rows, palette, outline) {
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement('canvas');
    c.width = w + 2;
    c.height = rows.length + 2;
    const g = c.getContext('2d');
    const at = (x, y) => (rows[y] && rows[y][x] && rows[y][x] !== '.' ? rows[y][x] : null);
    for (let y = -1; y <= rows.length; y++) {
      for (let x = -1; x <= w; x++) {
        const ch = at(x, y);
        if (ch) g.fillStyle = palette[ch];
        else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) g.fillStyle = outline;
        else continue;
        g.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    return c;
  };

  const TONES = {
    cheddar: { L: '#fff09a', M: '#ffcf2e', D: '#f5ab12', H: '#d9830c' },
    gouda: { L: '#ffd08a', M: '#ff9f3a', D: '#e87a1c', H: '#b9560c' },
    blue: { L: '#ffffff', M: '#e9e6cf', D: '#c2be9f', H: '#4a78b8' },
  };

  const SHAPES = {
    raw: ['...LLM....', '..LLMMMD..', '.LMHMMMMD.', 'LMMMMHMMDD', 'LMMMMMMMDD', 'MHMMMMHMD.', '.MMMHMMDD.', '..DDDDDD..'],
    base: ['.LLLLLLLL.', 'LLLLLLLLLL', 'MMMMMMMMMM', 'MMMMMMMMMM', 'MMMMMMMMMM', 'MMMMMMMMMM', 'DDDDDDDDDD', '.DDDDDDDD.'],
    lot: ['..LLLLLL..', '.LLLLLLLL.', 'MMMMMMMMMM', 'RRRRRRRRRR', 'RRRWWWWRRR', 'RRRRRRRRRR', 'DDDDDDDDDD', '.DDDDDDDD.', '..DDDDDD..'],
    coin: ['..LLLL..', '.LMMMMD.', 'LMMLLMMD', 'LMLMMDMD', 'LMLMMDMD', 'LMMDDMMD', '.LMMMMD.', '..DDDD..'],
    pick: ['.SSSSSS..', 'SS....SS.', '....WW.S.', '...WW....', '..WW.....', '.WW......', 'WW.......'],
  };

  const cache = {};
  function icon(kind, base) {
    const key = kind + ':' + (base || '');
    if (!cache[key]) {
      const pal =
        kind === 'coin'
          ? { L: '#fff3a0', M: '#ffc21e', D: '#d98a0a' }
          : kind === 'pick'
            ? { S: '#c9d0df', W: '#8b5a2b' }
            : Object.assign({ R: '#d93a4f', W: '#ffffff' }, TONES[base] || TONES.cheddar);
      cache[key] = CM.makeSprite(SHAPES[kind], pal, '#1b1622').toDataURL();
    }
    return cache[key];
  }

  // Símbolo de un rasgo según su efecto principal. El color lo pone la casilla.
  const GLYPHS = {
    speed: ['...XX..', '..XX...', '.XXXXX.', '...XX..', '..XX...', '.XX....', '.X.....'],
    yield: ['..XXX..', '..XXX..', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '..XXX..', '..XXX..'],
    awaySpeed: ['..XXX..', '.XX....', 'XX.....', 'XX.....', 'XX.....', '.XX..X.', '..XXX..'],
    hereSpeed: ['X..X..X', '.XXXXX.', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '.XXXXX.', 'X..X..X'],
    double: ['XX...XX', 'XX...XX', '.XX.XX.', '..XXX..', '.XX.XX.', 'XX...XX', 'XX...XX'],
    skillXp: ['XXXXXXX', 'X..X..X', 'X..X..X', 'X..X..X', 'X..X..X', 'XXXXXXX', '...X...'],
    mouseXp: ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', 'X.....X'],
    jobXp: ['.XXXXX.', '.XXXXX.', '...X...', '...X...', '...X...', '...X...', '...X...'],
    depthSpeed: ['..XXX..', '..XXX..', '..XXX..', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    levelSpeed: ['...X...', '..XXX..', '.XX.XX.', 'XX.X.XX', '..XXX..', '.XX.XX.', 'XX...XX'],
    crowdSpeed: ['.XX.XX.', '.XX.XX.', '.......', 'XXX.XXX', 'XXX.XXX', 'XXX.XXX', '.......'],
    rankSpeed: ['X.....X', '.X...X.', '..XXX..', '.XXXXX.', '.XXXXX.', '.XXXXX.', '..XXX..'],
    recipeYield: ['......X', '....XXX', '..XXXXX', 'XXXXXXX', 'X.XX.XX', 'XXXXXXX', '.......'],
    auraNext: ['...X...', '...XX..', 'XXXXXX.', 'XXXXXXX', 'XXXXXX.', '...XX..', '...X...'],
    auraPrev: ['...X...', '..XX...', '.XXXXXX', 'XXXXXXX', '.XXXXXX', '..XX...', '...X...'],
    noQuirks: ['.XXXXX.', 'XX...XX', 'X.....X', 'X..X..X', 'X.....X', 'XX...XX', '.XXXXX.'],
    combo: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    lock: ['..XXX..', '.X...X.', '.X...X.', 'XXXXXXX', 'XXX.XXX', 'XXX.XXX', 'XXXXXXX'],
  };
  GLYPHS.depthYield = GLYPHS.depthSpeed;
  const glyphCache = {};
  function glyph(key, color) {
    const k = key + (color || '');
    if (!glyphCache[k]) glyphCache[k] = CM.makeSprite(GLYPHS[key] || GLYPHS.speed, { X: color || '#ffffff' }, '#1b1622').toDataURL();
    return glyphCache[k];
  }
  // Efecto que más pesa en un rasgo: decide su símbolo.
  function traitGlyph(def) {
    if (def.eff.noQuirks) return 'noQuirks';
    const keys = Object.keys(def.eff).sort((a, b) => Math.abs(def.eff[b]) - Math.abs(def.eff[a]));
    return keys[0] || 'speed';
  }

  CM.icons = {
    glyph,
    traitGlyph,
    TONES,
    url: icon,
    img: (kind, base, cls) => '<img class="pix ' + (cls || '') + '" alt="" src="' + icon(kind, base) + '">',
  };
})();
