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
    // V4.3. SPRITE: iconos de interfaz, todos en pixel art (nada de símbolos de texto ni emojis):
    // afinidad, rasgo bueno, manía, legendario, flecha, intercambio, refuerzo y tratamiento.
    heart: ['.RR.RR.', 'RLRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
    tup: ['..G..', '.GGG.', 'GGGGG'],
    tdown: ['RRRRR', '.RRR.', '..R..'],
    star: ['...Y...', '..YYY..', 'YYYLYYY', '.YYYYY.', '..YYY..', '.YY.YY.', 'Y.....Y'],
    arrow: ['..A..', '..AA.', 'AAAAA', '..AA.', '..A..'],
    swap: ['.A.....A.', 'AAAAAAAAA', '.A.....A.'],
    boost: ['..B..', '.BBB.', 'BB.BB', 'B...B'],
    plus: ['.A.', 'AAA', '.A.'],
    // V4.4. SPRITE: los huecos de refuerzo: engaste vacío y gema puesta.
    // V4.5. SPRITE: ficha de refuerzo puesta (placa azul con galón blanco) y su hueco vacío
    // (marco apagado con el galón en sombra): la misma forma, encendida o apagada.
    // V4.6: un poco más grandes (11 px de lado, a 2x en BOOSTS).
    socket: ['.DDDDDDDDD.', 'DFFFFFFFFFD', 'DFFFFFFFFFD', 'DFFFFEFFFFD', 'DFFFEEEFFFD', 'DFFEEFEEFFD', 'DFEEFFFEEFD', 'DFFFFFFFFFD', 'DFFFFFFFFFD', 'DFFFFFFFFFD', '.DDDDDDDDD.'],
    gem: ['.BBBBBBBBB.', 'BHHHHHHHHLB', 'BHLLLLLLLLB', 'BLLLLWLLLLB', 'BLLLWWWLLLB', 'BLLWWLWWLLB', 'BLWWLLLWWLB', 'BLLLLLLLLLB', 'BLLLLLLLLLD', 'BLLLLLLLLDD', '.DDDDDDDDD.'],
    // V4.6. SPRITE: la TRAINING ROOM, a la misma escala que la cama: mesa de trabajo, libro
    // abierto (dos páginas para pasarlas) y pizarra con un esquema.
    desk: ['WWWWWWWWWWWW', 'wwwwwwwwwwww', '.L........L.', '.L........L.', '.L........L.'],
    book: ['PPPPBPPPP', 'PLLPBPLLP', 'PPPPBPPPP', 'PLLPBPLLP', 'BBBBBBBBB'],
    book2: ['PPPPBPPP.', 'PLLPBPPPP', 'PPPPBPLLP', 'PLLPBPPPP', 'BBBBBBBBB'],
    board: ['FFFFFFFF', 'FGWGGGGF', 'FGGWWGWF', 'FGGGGWGF', 'FFFFFFFF'],
    // V4.6. SPRITE: aviso de una roca que necesita algo (amarillo) o está parada (rojo), y la
    // flecha de ascenso disponible.
    alert: ['...Y...', '..YKY..', '..YKY..', '.YYKYY.', '.YYYYY.', 'YYYKYYY', 'YYYYYYY'],
    alertr: ['...Y...', '..YKY..', '..YKY..', '.YYKYY.', '.YYYYY.', 'YYYKYYY', 'YYYYYYY'],
    rankup: ['...L...', '..LGL..', '.LGGGL.', 'GGGGGGG', '..GGG..', '..GGG..', '..GGG..'],
    treat: ['.WWWWWW.', 'WWWRRWWW', 'WRRRRRRW', 'WRRRRRRW', 'WWWRRWWW', '.WWWWWW.'],
    // V4.2. SPRITE: cabeza de ratón para contratar (HIRE).
    mouse: ['EE....EE.', 'EPE..EPE.', '.GGGGGG..', 'GGKGGKGG.', 'GGGGGGGGN', '.GGWWGG..', '..GGGG...'],
    album: ['BBBBBBBB.', 'BLLLLLLBB', 'BLLSLLLBB', 'BLSSSLLBB', 'BLLSLLLBB', 'BLLLLLLBB', 'BBBBBBBBB'],
  };
  const EXTRA = {
    bed: { H: '#8b5a2b', F: '#b07a44', W: '#f4f1e4', B: '#c44a78', L: '#ff7aa8' },
    undo: { A: '#ffffff' },
    heart: { R: '#ff5a7a', L: '#ffc2d1' },
    tup: { G: '#8df09a' },
    tdown: { R: '#ff7a8a' },
    star: { Y: '#ffcf2e', L: '#fff3a0' },
    arrow: { A: '#ffffff' },
    swap: { A: '#ffffff' },
    boost: { B: '#5ad1ff' },
    plus: { A: '#8fe0ff' },
    socket: { D: '#4a5878', E: '#3a4560', F: '#221c2e' },
    gem: { B: '#2f8fc0', L: '#5ad1ff', H: '#9fe6ff', W: '#ffffff', D: '#1d5f86' },
    desk: { W: '#b07a44', w: '#8b5a2b', L: '#6b4220' },
    book: { P: '#f6ecd2', L: '#8b7a5a', B: '#5f3590' },
    book2: { P: '#f6ecd2', L: '#8b7a5a', B: '#5f3590' },
    board: { F: '#8b5a2b', G: '#2f5c3a', W: '#e8f0e8' },
    alert: { Y: '#ffd43a', K: '#1b1622' },
    alertr: { Y: '#ff5a7a', K: '#1b1622' },
    rankup: { G: '#5fcf6a', L: '#c8ffd0' },
    treat: { W: '#f4f1e4', R: '#e2462f' },
    mouse: { E: '#cfc6cc', P: '#ff9ab5', G: '#f1eaec', K: '#1b1622', N: '#ff7a9c', W: '#ffffff' },
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
    // V4.3: icono pequeño dentro de un texto (a su tamaño natural, para que el píxel no se deforme).
    px: (kind, n) => ('<img class="pix pxi pxi-' + kind + '" alt="" src="' + icon(kind) + '">').repeat(n || 1),
  };
  // Las chapas que dibuja el CSS (::before) usan el mismo sprite de refuerzo.
  document.documentElement.style.setProperty('--px-boost', 'url(' + icon('boost') + ')');
  document.documentElement.style.setProperty('--px-gem', 'url(' + icon('gem') + ')');
  document.documentElement.style.setProperty('--px-alert', 'url(' + icon('alert') + ')');
  document.documentElement.style.setProperty('--px-alertr', 'url(' + icon('alertr') + ')');
  document.documentElement.style.setProperty('--px-rankup', 'url(' + icon('rankup') + ')');
})();
