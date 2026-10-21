// ---------- HOUSE SLEEP · la secuencia completa · la página ----------
const MK = 7, BX = 54, BY = 20, SW = 104, SH = 46; // escena: la cama en (BX, BY), suelo en BY + 22
const room = (g, w, h, floor) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); for (let y = 2; y < floor; y += 5) for (let x = (y % 10 ? 0 : 6); x < w; x += 12) { g.fillStyle = '#33251a'; g.fillRect(x, y, 10, 1); } g.fillStyle = '#5a4028'; g.fillRect(0, floor, w, h - floor); g.fillStyle = '#7a5838'; g.fillRect(0, floor, w, 1); for (let x = 0; x < w; x += 7) { g.fillStyle = '#4a3420'; g.fillRect(x, floor + 1, 1, h - floor - 1); } };
const SCENES = [];
function sceneCard(parent, title, m, scale, cap, ctl = false) {
  const f = document.createElement('figure'); f.className = 'ev-card';
  const c = document.createElement('canvas'); c.width = SW * MK; c.height = SH * MK; c.style.width = Math.round(SW * scale) + 'px'; c.style.maxWidth = '100%'; c.style.height = 'auto';
  f.innerHTML = `<div class="ev-ct"><b>${title}</b></div>`; f.appendChild(c);
  const st = { c, m, t0: performance.now(), paused: false, t: 0 };
  if (ctl) {
    const bar = document.createElement('div'); bar.className = 'bs-bar';
    bar.innerHTML = `<button type="button" class="bs-btn">Pausa</button><input type="range" min="0" max="${BT.end - 1}" step="16" value="0" aria-label="Momento de la secuencia"><span class="bs-ph"></span>`;
    f.appendChild(bar); const [btn, rng, ph] = bar.children; st.rng = rng; st.ph = ph;
    btn.onclick = () => { st.paused = !st.paused; btn.textContent = st.paused ? 'Seguir' : 'Pausa'; if (!st.paused) st.t0 = performance.now() - st.t; };
    rng.oninput = () => { st.paused = true; btn.textContent = 'Seguir'; st.t = +rng.value; };
  }
  if (cap) { const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.appendChild(fc); }
  parent.appendChild(f); SCENES.push(st); return f;
}
setInterval(() => {
  const now = performance.now();
  for (const s of SCENES) {
    if (!s.paused) s.t = (now - s.t0) % BT.end;
    const g = s.c.getContext('2d'); g.setTransform(MK, 0, 0, MK, 0, 0); g.imageSmoothingEnabled = false; room(g, SW, SH, BY + 22); drawBedFrame(g, s.t, s.m, BX, BY);
    if (s.rng) { if (!s.paused) s.rng.value = s.t; s.ph.textContent = `${(s.t / 1000).toFixed(1)} s · ${PH_NAMES[phaseAt(s.t)][1]}`; }
  }
}, 33);

PP('<b>Una sola demostración</b>: el ratón entra, cuelga la mochila, sube a la cama, da una vuelta, se acurruca, se tapa, duerme, se despierta, se destapa, se levanta, recoge la mochila, baja y se va. Usa solo el sprite oficial de pie y la pose acurrucada aprobada. Debajo, la comprobación de todo el bucle, fotograma a fotograma.');
H2('A', 'LA SECUENCIA', 'Bucle de 12,2 s, a tamaño real de móvil y ampliado. En el ampliado puedes pausar y mover el tiempo.');
{ const R = DIV('ev-cards'); sceneCard(R, 'Poppy', CREW.town.idle, KPX); sceneCard(R, 'Tilly', CREW.cheddar.cook, KPX); sceneCard(R, 'Pepper', CREW.gouda.cook, KPX); }
PP('<span class="ad-cap">Tamaño real: 2,33 px por píxel de arte, como en un móvil de densidad 3. Tres ratones distintos, cada uno con su pelo, su sombrero y su mochila.</span>');
{ const R = DIV('ev-cards'); sceneCard(R, 'Ampliado (6×)', CREW.town.idle, 6.2, '', true); }
TB(['MOMENTO', 'QUÉ PASA'], PH_NAMES.map(([k, n], i) => [`${((i ? BT[PH_NAMES[i - 1][0]] : 0) / 1000).toFixed(1)}–${(BT[k] / 1000).toFixed(1)} s`, n]));
UL([
  '<b>Poses:</b> de pie, el sprite oficial (andar, quieto con su respiración y su parpadeo, y mirando a un lado o al otro, como en el juego). En la cama, el mismo sprite sin la mochila: se la cuelga en el pie de la cama al llegar y la recoge al irse, con un fotograma en que la lleva en la mano. Dormido, la pose acurrucada aprobada, con la cara oficial de dormir o con los ojos abiertos. No hay ninguna pose nueva.',
  '<b>La vuelta:</b> sobre el colchón mira hacia atrás y vuelve a mirar a la almohada, con un saltito de 1 px en cada giro (0,4 s en total), y se acurruca.',
  '<b>Subir y bajar:</b> por el pie de la cama y por delante de él. El salto primero sube y luego avanza, para pasar por encima del pie sin atravesarlo; 13 px de altura es lo mínimo que lo consigue y uso 15.',
  '<b>La manta:</b> está siempre en la cama, doblada a los pies y detrás del ratón. Sube en tres pasos hasta la cara (la versión que elegiste) y baja igual. Solo pasa a ir delante del ratón en el primer paso de subir, cuando todavía no lo toca, y vuelve detrás cuando ya está doblada a los pies. Mientras duerme, la manta sube 1 px sobre el lomo cada 2,4 s.',
]);

H2('B', 'COMPROBACIÓN DE TODO EL BUCLE', 'Se calcula al abrir la página, con tres ratones, cada 16 ms (763 fotogramas por ratón).');
{
  const mice = [CREW.town.idle, CREW.cheddar.cook, CREW.gouda.cook], res = mice.map((m) => checkBedLoop(m, BX, BY, SW, SH));
  const row = (label, fn) => [label, ...res.map(fn)];
  const ok = (n) => (n === 0 ? '<span class="ad-k keep">0</span>' : `<span class="ad-k rebuild">${n}</span>`);
  TB(['', ...mice.map((m) => m.name)], [
    row('Fotogramas revisados', (r) => r.frames),
    row('La manta va delante del ratón sin estar tapándolo (el fallo anterior)', (r) => ok(r.overBlanketWrong)),
    row('El ratón va delante de la manta mientras lo tapa', (r) => ok(r.underBlanketWrong)),
    row('La manta cambia de capa tocando al ratón', (r) => ok(r.layerSwitchTouching)),
    row('El ratón atraviesa el pie de la cama', (r) => ok(r.footHits)),
    row('El ratón atraviesa el cabecero', (r) => ok(r.headHits)),
    row('El ratón flota (fuera de los saltos)', (r) => ok(r.floating)),
    row('Sprites que no son los aprobados o no van a escala 1', (r) => ok(r.notApproved)),
    row('Mayor desplazamiento entre dos fotogramas seguidos', (r) => `${r.maxJump.toFixed(1)} px (a los ${(r.maxJumpAt / 1000).toFixed(1)} s)`),
    row('Cambios de capa de la manta', (r) => r.switches.map((t) => (t / 1000).toFixed(1) + ' s').join(' · ')),
  ]);
  // Control: la misma comprobación con el orden de capas antiguo (manta doblada delante del ratón al levantarse).
  const orig = bedFrame; let bad;
  try { window.bedFrame = (t, m, bx, by) => { const f = orig(t, m, bx, by); if (t >= BT.stand && f.blanket.cover === 0) f.blanket.layer = 'above'; return f; }; bad = checkBedLoop(mice[0], BX, BY, SW, SH); } finally { window.bedFrame = orig; }
  UL([
    `<b>El contador detecta el fallo:</b> con el orden de capas de antes (la manta doblada pintada delante del ratón al levantarse), la misma comprobación cuenta <b>${bad.overBlanketWrong}</b> fotogramas con el ratón detrás de la manta. Con el orden nuevo, 0.`,
    '<b>Cómo se mide:</b> en cada fotograma se pintan por separado el ratón, la manta y la madera del pie y del cabecero, y se cruzan sus píxeles. «Flota» quiere decir que la fila más baja del ratón no toca el colchón (o no se hunde en él 1 px, acurrucado) ni el suelo, fuera de los saltos y de los saltitos de 1 px.',
    '<b>El mayor desplazamiento</b> es el giro: al darse la vuelta el sprite se refleja y su centro se mueve unos 4 px, como en el juego cuando un ratón cambia de dirección. Al acurrucarse y al levantarse se mueve 3 px como mucho.',
  ]);
}
TB(['', 'THE BED'], [['Estado', 'Sigue pendiente del Project Manager. Esta cama no representa THE BED: no duplica a ningún ratón que esté trabajando y no cambia nada del juego.']]);
