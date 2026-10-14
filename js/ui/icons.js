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
    brie: { L: '#ffffff', M: '#fbf3d6', D: '#e3d3a0', H: '#c9b06a' },
    emmental: { L: '#fff6b0', M: '#f7de6a', D: '#dcb93a', H: '#a8862a' },
    parmesan: { L: '#f6e2b0', M: '#e3bf78', D: '#bf9550', H: '#8a6630' },
    blue: { L: '#ffffff', M: '#e9e6cf', D: '#c2be9f', H: '#4a78b8' },
  };

  const SHAPES = {
    raw: ['...LLM....', '..LLMMMD..', '.LMHMMMMD.', 'LMMMMHMMDD', 'LMMMMMMMDD', 'MHMMMMHMD.', '.MMMHMMDD.', '..DDDDDD..'],
    base: ['.LLLLLLLL.', 'LLLLLLLLLL', 'MMMMMMMMMM', 'MMMMMMMMMM', 'MMMMMMMMMM', 'MMMMMMMMMM', 'DDDDDDDDDD', '.DDDDDDDD.'],
    lot: ['..LLLLLL..', '.LLLLLLLL.', 'MMMMMMMMMM', 'RRRRRRRRRR', 'RRRWWWWRRR', 'RRRRRRRRRR', 'DDDDDDDDDD', '.DDDDDDDD.', '..DDDDDD..'],
    coin: ['..LLLL..', '.LMMMMD.', 'LMMLLMMD', 'LMLMMDMD', 'LMLMMDMD', 'LMMDDMMD', '.LMMMMD.', '..DDDD..'],
    flask: ['..GGGG..', '...GG...', '...GG...', '..GCCG..', '.GCCCCG.', 'GCCLCCCG', 'GCCCCLCG', '.GGGGGG.'],
    // Cepas: un rayo, una pesa y un libro.
    quick: ['....QQQ.', '...QQQ..', '..QQQ...', '.QQQQQQ.', '...QQQ..', '..QQQ...', '.QQQ....', '.QQ.....'],
    dense: ['..HHHH..', '..H..H..', '.DDDDDD.', 'DDLLLLDD', 'DDLDDDDD', 'DDLDDDDD', 'DDDDDDDD', '.DDDDDD.'],
    teaching: ['.BBB.BBB.', 'BWWWBWWWB', 'BWLWBWLWB', 'BWWWBWWWB', 'BWLWBWLWB', 'BWWWBWWWB', 'BBBBBBBBB'],
    pick: ['.SSSSSS..', 'SS....SS.', '....WW.S.', '...WW....', '..WW.....', '.WW......', 'WW.......'],
    // V4.1. SPRITE: la cama de la Mouse House (cabecero, almohada, manta y patas), deshacer,
    // el diario de la colonia y el álbum.
    bed: ['HH..........', 'HHWW........', 'HHWWWBBBBBBB', 'HHBBBBBBBBBB', 'HHLLLLLLLLLL', 'HHFFFFFFFFFF', 'HH........FF'],
    undo: ['..A....', '.AA....', 'AAAAAA.', '.AA...A', '..A...A', '....AA.'],
    news: ['.PPPPPP.', 'PLLLLLLP', 'PLDDDDLP', 'PLLLLLLP', 'PLDDDLLP', 'PLLLLLLP', 'PLDDDDLP', '.PPPPPP.'],
    album: ['BBBBBBBB.', 'BLLLLLLBB', 'BLLSLLLBB', 'BLSSSLLBB', 'BLLSLLLBB', 'BLLLLLLBB', 'BBBBBBBBB'],
  };
  const EXTRA = {
    bed: { H: '#8b5a2b', F: '#6b4220', W: '#f4f1e4', B: '#c44a78', L: '#ff7aa8' },
    undo: { A: '#ffffff' },
    news: { P: '#c9a46a', L: '#f6ecd2', D: '#8b7a5a' },
    album: { B: '#5f3590', L: '#9a5fd0', S: '#ffcf2e' },
  };

  const cache = {};
  function icon(kind, base) {
    const key = kind + ':' + (base || '');
    if (!cache[key]) {
      const pal = EXTRA[kind]
        ? EXTRA[kind]
        : kind === 'coin'
          ? { L: '#fff3a0', M: '#ffc21e', D: '#d98a0a' }
          : kind === 'quick'
            ? { Q: '#ffe55c' }
            : kind === 'dense'
              ? { H: '#b9560c', D: '#ff9f3a', L: '#ffd08a' }
              : kind === 'teaching'
                ? { B: '#3f6fb5', W: '#f4f1e4', L: '#9fb4d0' }
          : kind === 'flask'
            ? { G: '#dfe9f5', C: '#4fd6a0', L: '#c8ffe6' }
            : kind === 'pick'
              ? { S: '#c9d0df', W: '#8b5a2b' }
            : Object.assign({ R: '#d93a4f', W: '#ffffff' }, TONES[base] || TONES.cheddar);
      cache[key] = CM.makeSprite(SHAPES[kind], pal, '#1b1622').toDataURL();
    }
    return cache[key];
  }

  CM.icons = {
    TONES,
    url: icon,
    img: (kind, base, cls) => '<img class="pix ' + (cls || '') + '" alt="" src="' + icon(kind, base) + '">',
  };
})();
