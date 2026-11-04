// GENERADO por exploracion/pixel/main2-src/game/build_menu.py: no editar a mano. MENU aprobado: iconos y ventanas copiados del
// mockup (menu.html). Las acciones y lo que hacen son las del juego; aquí solo se pinta.
(function () {
  if (!window.CM) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const K = '#1b1220';
  const GLY = {};
  const glyph = (k, rows, pal) => (GLY[k] ||= icon(rows, pal));
function icon(rows, pal, outline = '#1b1220') {
  const H = rows.length, W = Math.max(...rows.map((r) => r.length));
  const c = document.createElement('canvas'); c.width = W + 2; c.height = H + 2; const x = c.getContext('2d');
  const at = (i, j) => rows[j] && rows[j][i] && rows[j][i] !== '.';
  for (let j = -1; j <= H; j++) for (let i = -1; i <= W; i++) {
    if (at(i, j)) { x.fillStyle = pal[rows[j][i]]; x.fillRect(i + 1, j + 1, 1, 1); }
    else if (at(i - 1, j) || at(i + 1, j) || at(i, j - 1) || at(i, j + 1)) { x.fillStyle = outline; x.fillRect(i + 1, j + 1, 1, 1); }
  }
  return c;
}
const IC = {
  up: () => icon(['..l..', '.lgg.', 'lgggG', '.gGG.', '.gGG.'], { l: '#c8ffc0', g: '#62d36e', G: '#2f8f44' }),
  heart: () => icon(['.rR.rr.', 'rWrrrrR', 'rrrrrrR', '.rrrrR.', '..rrR..', '...R...'], { r: '#ff5a6a', R: '#b8263a', W: '#ffd0d8' }),
  star: () => icon(['...y...', '..yYy..', 'yyYWyyy', '.yyyyO.', '..yyO..', '.yO.yO.'], { y: '#ffcf2e', Y: '#fff3a0', W: '#ffffff', O: '#c98a08' }),
  chain: () => icon(['.lyy....lyy.', 'l..Yd..l..Yd', 'y..lyyyy..Yd', 'Y..dYYYd..dd', '.ddd....ddd.'], { l: '#fff3a0', y: '#ffcf2e', Y: '#e0a020', d: '#a8700a' }),
  bed: () => icon(['P.......', 'PWW.....', 'PWWbbbbb', 'Pbbbbbbb', 'P......P'], { P: '#9a6a5a', W: '#ffffff', b: '#ff8fb4' }),
  book: () => icon(['vvv.vvv', 'vWWvWWv', 'vWWvWWv', 'vvvvvvv'], { v: '#b58cff', W: '#efe6ff' }),
  // Cabeza de ratón (MICE, contratar, sin asignar): cinco tonos de pelaje, luz arriba a la izquierda,
  // orejas con fondo rosa, ojos con brillo, nariz con sombra y mejillas.
  head: () => icon([
    '.gGD.....gGD.',
    'gqpGD...gqpGD',
    'gppPGgggGppPD',
    '.gPGAAgggGPD.',
    '..gAAggggGGD.',
    '.gggkwggkwGGD',
    '.gggkkggkkGGD',
    '.ggcggnnggcGD',
    '..gGgNNggGGD.',
    '...GGGGGGDD..',
    '....DDDDD....'],
    { A: '#ffffff', g: '#f3ecf2', G: '#dccfdc', D: '#a897b2', q: '#ffc4d6', p: '#f58fb0', P: '#c9557f', k: '#1b1622', w: '#ffffff', n: '#ff7a9c', N: '#b8406a', c: '#ffb3c6' }, '#2a1d2e'),
  rank1: () => icon(['b...b', 'bb.bb', '.bbb.', '..b..'], { b: '#5a9cf0' }),
  rank2: () => icon(['.rr.', '.rr.', 'yyyy', 'yYyy', '.yy.'], { r: '#e2462f', y: '#ffcf2e', Y: '#fff3a0' }),
  rank3: () => icon(['.yyy.', 'kWWWk', 'kWsWk', 'kWWWk', 'kWsWk', 'kkkkk'], { y: '#ffcf2e', k: '#1b1622', W: '#f4f4f4', s: '#9aa3b8' }),
  chevU: () => icon(['..w..', '.wSw.', 'wS.Sw'], { w: '#d6d0e6', S: '#9f97b8' }),
  chevD: () => icon(['wS.Sw', '.wSw.', '..w..'], { w: '#d6d0e6', S: '#9f97b8' }),
  go: () => icon(['w..', 'Sw.', '.Sw', 'Sw.', 'w..'], { w: '#d6d0e6', S: '#9f97b8' }),
};
const toImg = (c, scale = 2) => { c.classList.add('pix'); c.style.width = Math.round(c.width * scale) + 'px'; c.style.height = Math.round(c.height * scale) + 'px'; c.style.flex = 'none'; return c; };
// ---------- SPRITES ----------
// SPRITE: engranaje del título (a 2×, como los iconos de título aprobados).
const icGear = () => glyph('gear', ['...hGh...', '.h.hGG.g.', '.hhGGGgg.', 'hhGg.gGgg', 'GGG...Ggg', 'hGGg.gGgg', '.GGGGGgg.', '.G.GGg.g.', '...Ggg...'], { h: '#e8e2f4', G: '#b5aec8', g: '#6f6886' });
// SPRITE: altavoz. Encendido, con dos ondas en oro (el color del ON del interruptor); silenciado, con un aspa gris.
const SPK = ['....D......', '...DS......', 'DDDSL......', 'DSSSL......', 'DSSSL......', 'DSSSL......', 'DDDSL......', '...DS......', '....D......'];
const withMarks = (marks, ch) => SPK.map((r, y) => [...r].map((c, x) => (marks.some(([mx, my]) => mx === x && my === y) ? ch : c)).join(''));
const WAVES = [[6, 2], [7, 3], [7, 4], [7, 5], [6, 6], [8, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [8, 7]];
const CROSS = [[7, 3], [9, 3], [8, 4], [7, 5], [9, 5]];
const SPK_PAL = { D: '#8a83a0', S: '#d6d0e6', L: '#ffffff' };
const icSpkOn = () => glyph('spkon', withMarks(WAVES, 'w'), { ...SPK_PAL, w: '#ffcf2e' });
const icSpkOff = () => glyph('spkoff', withMarks(CROSS, 'x'), { ...SPK_PAL, x: '#9f97b8' });
// SPRITE: archivo de partida (hoja con la esquina doblada y renglones) con su flecha: hacia fuera (EXPORT) o hacia
// dentro (IMPORT). La flecha en blanco roto, sin color de función.
const FILE = ['PPPPPf......', 'PPPPPff.....', 'PPPPPfff....', 'PqqqqqPP....', 'PPPPPPPP....', 'PqqqqPPP....', 'PPPPPPPP....', 'PqqqqqPP....', 'PPPPPPPP....', 'PPPPPPPP....'];
const FILE_PAL = { P: '#efe4c8', f: '#b8a07a', q: '#a8987a', a: '#e8e2f4', A: '#9f97b8' };
const arrowOn = (rows, ox, oy) => { const g = FILE.map((r) => [...r]); rows.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g[oy + y][ox + x] = c; })); return g.map((r) => r.join('')); };
const icExport = () => glyph('exp', arrowOn(['..a..', '.aaA.', 'aaaAA', '.aaA.', '.aaA.'], 7, 4), FILE_PAL);
const icImport = () => glyph('imp', arrowOn(['.aaA.', '.aaA.', 'aaaAA', '.aaA.', '..a..'], 7, 4), FILE_PAL);
const icFile = () => glyph('file', FILE.map((r) => r.slice(0, 8)), FILE_PAL);
// SPRITE: reinicio (flecha circular roja) y aviso (triángulo rojo con «!»), solo en la zona de peligro.
const icReset = () => glyph('reset', ['..RRRR.R.', '.R....RR.', 'R....RRR.', 'R........', 'R.......R', 'R.......R', '.R.....R.', '..RRRRR..'], { R: '#ff6a4a' });
const icWarn = () => glyph('warn', ['.....R.....', '....RRD....', '....RwD....', '...RRwDD...', '...RRwDD...', '..RRRwRDD..', '..RRRRRDD..', '.RRRRwRRDD.', 'RRRRRRRRDDD'], { R: '#e2462f', D: '#9c2a1c', w: '#ffffff' });


  const EASE = 'cubic-bezier(.22,.8,.3,1)';
  const ICS = { gear: icGear, spkon: icSpkOn, spkoff: icSpkOff, exp: icExport, imp: icImport, file: icFile, reset: icReset, warn: icWarn };
  const ic = (k, sc = 2) => '<canvas class="pix" data-mnic="' + k + '" data-k="' + sc + '"></canvas>';
  function paint(root) {
    for (const c of root.querySelectorAll('canvas[data-mnic]')) {
      const g = ICS[c.dataset.mnic](), k = +c.dataset.k || 2;
      c.width = g.width; c.height = g.height; c.style.width = g.width * k + 'px'; c.style.height = g.height * k + 'px';
      c.getContext('2d').drawImage(g, 0, 0);
    }
  }
  const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const fmtBytes = (n) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB');
  const warnLine = (t) => '<div class="mx-mn-warn">' + ic('warn', 1) + '<span>' + t + '</span></div>';

  // La hoja: el sonido se cambia en su sitio (el interruptor salta a pasos y el altavoz cambia), con la acción del juego.
  function mount(root) {
    paint(document.getElementById('sheet-title'));
    if (!root.querySelector('.mx-mn-sec')) return;
    paint(root);
    const row = root.querySelector('.mx-mn-row[data-act="sound"]');
    if (row) {
      row.removeAttribute('data-act');
      row.onclick = () => {
        CM.ui.quiet('sound');
        const muted = CM.sfx.isMuted(), sw = row.querySelector('.mx-mn-sw');
        sw.classList.toggle('mx-on', !muted); sw.querySelector('em').textContent = muted ? 'OFF' : 'ON';
        row.querySelector('small').innerHTML = 'Effects are ' + (muted ? '<em class="mx-off">muted</em>' : '<em>on</em>');
        const box = row.querySelector('.mx-ic'); box.innerHTML = ic(muted ? 'spkoff' : 'spkon'); paint(box);
        if (!reduced) box.firstChild.animate(muted ? [{ opacity: 0.4, transform: 'translateX(1px)' }, { opacity: 1, transform: 'none' }] : [{ clipPath: 'inset(0 60% 0 0)' }, { clipPath: 'inset(0 30% 0 0)', offset: 0.5 }, { clipPath: 'inset(0 0 0 0)' }], { duration: muted ? 140 : 210, easing: 'steps(3)' });
      };
    }
  }
  // Las ventanas del juego, con el aspecto aprobado. Los botones llevan los data-m de siempre (ok / no).
  function win(kind, d) {
    let h = '<div class="mx-mn-layer"><div class="mx-box mx-mn-win' + (kind === 'reset' || kind === 'proto' ? ' mx-bad' : '') + '">';
    if (kind === 'export') {
      h += '<div class="mx-mn-wh">' + ic('exp') + '<b>EXPORT</b></div><p>A file was downloaded. You can also copy the text:</p>' +
        '<div class="mx-mn-file">' + ic('file', 1.5) + '<span>cheese-miner-save.json</span><u>' + fmtBytes(d.bytes) + '</u></div>' +
        '<textarea id="io-text" class="mx-mn-ta mx-tall" readonly></textarea><p class="mx-mn-hint">Hold on the text to select it and copy it.</p>' +
        '<div class="mx-mn-bts"><button class="mx-act mx-mn-go" data-m="ok">DONE</button></div>';
    } else if (kind === 'import') {
      h += '<div class="mx-mn-wh">' + ic('imp') + '<b>IMPORT</b></div><p>Paste an exported save.</p>' + warnLine('It replaces the current game.') +
        '<textarea id="io-text" class="mx-mn-ta" spellcheck="false" autocomplete="off" placeholder="Paste the exported text here"></textarea><div class="mx-mn-err" id="io-err" hidden></div>' +
        '<div class="mx-mn-bts"><button class="mx-act" data-m="no">CANCEL</button><button class="mx-act mx-mn-go" data-m="ok">LOAD</button></div>';
    } else if (kind === 'proto') {
      // Test colony: la misma ventana que RESET (zona de peligro): qué se carga y qué se pierde.
      h += '<div class="mx-mn-wh">' + ic('warn') + '<b>LOAD TEST COLONY?</b></div><p>The <b>' + esc(d.name) + '</b> test colony replaces your current game.</p>' +
        '<div class="mx-mn-lose"><small>YOU LOSE</small><b>' + esc(d.lose) + '</b></div>' +
        '<div class="mx-mn-bts"><button class="mx-act" data-m="no">CANCEL</button><button class="mx-act mx-mn-red" data-m="ok">LOAD</button></div>';
    } else {
      h += '<div class="mx-mn-wh">' + ic('warn') + '<b>RESET GAME?</b></div><p>All progress will be lost.</p>' +
        '<div class="mx-mn-lose"><small>YOU LOSE</small><b>' + esc(d.lose) + '</b></div>' +
        '<div class="mx-mn-bts"><button class="mx-act" data-m="no">CANCEL</button><button class="mx-act mx-mn-red" data-m="ok">RESET</button></div>';
    }
    return h + '</div></div>';
  }
  function mountWin(root) {
    paint(root);
    const ta = root.querySelector('#io-text'), er = root.querySelector('#io-err');
    if (ta && er) ta.oninput = () => { ta.classList.remove('mx-err'); er.hidden = true; };
    const w = root.querySelector('.mx-mn-win');
    if (w && !reduced) w.animate([{ opacity: 0, transform: 'translateY(6px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 180, easing: EASE });
  }
  // IMPORT que no vale: el campo en rojo, tiembla y el aviso del juego se lee junto a él; la ventana sigue abierta.
  function importError(text) {
    const ta = document.getElementById('io-text'), er = document.getElementById('io-err');
    if (!ta || !er) return false;
    ta.classList.add('mx-err');
    if (!reduced) ta.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(-2px)' }, { transform: 'none' }], { duration: 260, easing: 'ease-in-out' });
    er.innerHTML = ic('warn', 1) + '<span>' + esc(text) + '</span>'; paint(er); er.hidden = false;
    if (!reduced) er.animate([{ opacity: 0, transform: 'translateY(-3px)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: EASE });
    return true;
  }
  CM.pmenu = { mount, win, mountWin, importError, ic };
})();
