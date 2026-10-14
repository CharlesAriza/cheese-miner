(async () => {
  const out = {};
  const sc = CM_DEBUG.scene;
  const cv = document.getElementById('scene');
  const box = cv.getBoundingClientRect();
  const s = CM_DEBUG.state;
  // 1. LAB en la barra de etapas
  await closeAll(); await new Promise((r) => setTimeout(r, 300));
  const tile = document.querySelector('.tile.labtile');
  out.labTile = await tapAt(...centerOf(tile));
  // 2. LAB en la escena, justo donde está el investigador
  await closeAll(); await new Promise((r) => setTimeout(r, 300));
  sc.focus('lab'); await new Promise((r) => setTimeout(r, 1500));
  const r = s.mice.find((m) => m.post === 'research:all');
  let spot = null;
  for (let yy = box.top + 4; yy < box.bottom && !spot; yy += 3) for (let xx = box.left + 2; xx < box.right; xx += 3) {
    const cx = ((xx - box.left) / box.width) * cv.width, cy = ((yy - box.top) / box.height) * cv.height;
    if (sc.mouseAt(cx, cy) === (r && r.id) && sc.hitTest(((xx - box.left) / box.width) * sc.W) === 'lab') { spot = [xx, yy]; break; }
  }
  out.labSpot = !!spot;
  if (spot) out.labScene = await tapAt(...spot);
  // 3. Mantener pulsado sobre el investigador: su ficha
  await closeAll(); await new Promise((r) => setTimeout(r, 300));
  if (spot) out.holdMouse = await tapAt(...spot, 600);
  // 4. RECIPES en el botón grande (línea parada sin Base) y en el lateral
  await closeAll(); await new Promise((r) => setTimeout(r, 300));
  CM_DEBUG.focusZone('cheddar'); CM_DEBUG.select('cheesery');
  const cook = s.mice.find((m) => m.post === 'cheesemaking:cheddar');
  if (cook) { cook.post = ''; cook.rest = true; }
  s.zones.cheddar.cookJob = null; s.inv.base.cheddar = 50; CM.rev++;
  await new Promise((r) => setTimeout(r, 900));
  const main = document.getElementById('dock-main');
  out.mainLabel = main.querySelector('b').textContent;
  const made0 = s.totals.lotsProduced, jobs0 = !!s.zones.cheddar.cookJob;
  out.mainRecipes = await tapAt(...centerOf(main));
  out.cookedAfterMain = !!s.zones.cheddar.cookJob;
  await closeAll(); await new Promise((r) => setTimeout(r, 300));
  const book = document.getElementById('dock-book');
  out.sideRecipes = book.hidden ? 'hidden' : await tapAt(...centerOf(book));
  if (cook) { cook.post = 'cheesemaking:cheddar'; cook.rest = false; }
  window.TAPRESULT = JSON.stringify(out);
})();
'started';
