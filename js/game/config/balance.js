// BALANCE.
// Todo lo que hay aquí es PLAYTEST_DEFAULT: valores provisionales para poder
// probar, no decisiones cerradas. Cambia cualquier número y recarga.
window.CM = window.CM || {};

CM.BALANCE = {
  sim: { stepMs: 100 }, // paso fijo de simulación (no depende de los frames)

  // ---------- HABILIDADES ----------
  // Cada etapa de la cadena es una habilidad con nivel 1..99. Se gana
  // experiencia haciendo esa tarea, la haga el jugador o un ratón.
  skills: {
    mining: { name: 'Mining', station: 'rock' },
    drilling: { name: 'Drilling', station: 'drill' },
    refining: { name: 'Refining', station: 'refinery' },
    cheesemaking: { name: 'Cheesemaking', station: 'cheesery' },
    trading: { name: 'Trading', station: 'shop' },
  },
  xp: {
    base: 25, // experiencia para pasar del nivel 1 al 2
    growth: 1.1, // cada nivel pide un 10 % más que el anterior
    maxLevel: 99,
    bonusPerLevel: 0.02, // +2 % de rendimiento en esa habilidad por nivel
    perSearch: 1, // minería: por punto de búsqueda
    perRaw: 2, // taladro: por Raw Cheese
    perBase: 5, // refinado: por Cheese Base
    perCheese: 12, // quesería: por queso (más la raíz de su valor)
    perSale: 6, // comercio: por queso vendido (más la raíz de su precio)
  },

  mining: {
    pickPower: 1, // progreso de búsqueda por golpe
    comboWindowMs: 650, // golpes manuales más seguidos que esto hacen combo
    critEvery: 5, // cada N golpes de combo, golpe crítico
    critMultiplier: 3,
    minerIntervalMs: 1500, // cada ratón minero da un golpe cada N ms en cada roca
  },

  // ---------- ZONAS ----------
  // Las rocas no se agotan: al vaciar una veta, la roca baja un nivel de
  // profundidad. Más hondo = vetas más duras y grandes, y queso más rico.
  bases: {
    cheddar: { name: 'Cheddar', value: 10 },
    gouda: { name: 'Gouda', value: 24 },
    blue: { name: 'Blue', value: 60 },
  },
  zones: [
    { id: 'cheddar', base: 'cheddar', name: 'Cheddar Rock', unlockCost: 0, hits: 30, capacity: 60 },
    { id: 'gouda', base: 'gouda', name: 'Gouda Rock', unlockCost: 2500, hits: 150, capacity: 120 },
    { id: 'blue', base: 'blue', name: 'Blue Rock', unlockCost: 80000, hits: 800, capacity: 240 },
  ],
  depth: {
    hitsGrowth: 1.22, // búsqueda necesaria por nivel de profundidad
    capacityGrowth: 1.15, // tamaño de la veta por nivel de profundidad
    richness: 0.08, // +8 % de Raw Cheese por ciclo por nivel de profundidad
  },

  // ---------- MÁQUINAS ----------
  drill: { yield: 2, durationMs: 6000, boostMs: 250 },
  refinery: { rawPerBase: 2, batch: 2, durationMs: 6000, boostMs: 250 },
  storage: { raw: 30, base: 20, lots: 10 }, // capacidades iniciales

  // ---------- QUESERÍA ----------
  // BASE + INGREDIENTE + TRATAMIENTO + MADURACIÓN = QUESO.
  // Valor = valor de la base x multiplicadores. `level` es el nivel de
  // Cheesemaking que hace falta para usar ese componente.
  cheesery: {
    experimentBase: 3, // Cheese Base que cuesta descubrir una receta (da 1 queso)
    lotBase: 2, // Cheese Base por queso de una receta conocida
    baseTimeMs: 8000,
    maxQueue: 10,
    boostMs: 300,
    masteryAt: [0, 5, 15, 40, 100, 250, 600, 1500], // quesos hechos para cada nivel de maestría
    masteryValue: 0.1, // +10 % de valor por nivel de maestría
    masteryTime: 0.05, // -5 % de tiempo por nivel de maestría
  },
  ingredients: {
    herbs: { name: 'Herbs', adj: 'Herb', mult: 1, coinCost: 0, level: 1 },
    pepper: { name: 'Pepper', adj: 'Pepper', mult: 1.3, coinCost: 2, level: 4 },
    honey: { name: 'Honey', adj: 'Honey', mult: 1.7, coinCost: 10, level: 12 },
    truffle: { name: 'Truffle', adj: 'Truffle', mult: 2.6, coinCost: 60, level: 25 },
  },
  treatments: {
    washed: { name: 'Washed', adj: 'Washed', mult: 1, timeMs: 0, level: 1 },
    smoked: { name: 'Smoked', adj: 'Smoked', mult: 1.35, timeMs: 4000, level: 3 },
    brined: { name: 'Brined', adj: 'Brined', mult: 1.8, timeMs: 9000, level: 16 },
  },
  maturations: {
    fresh: { name: 'Fresh', adj: '', mult: 1, timeMs: 0, level: 1 },
    aged: { name: 'Aged', adj: 'Aged', mult: 1.6, timeMs: 12000, level: 8 },
    vintage: { name: 'Vintage', adj: 'Vintage', mult: 2.8, timeMs: 45000, level: 30 },
  },
  synergies: [
    { when: { base: 'cheddar', treatment: 'smoked' }, mult: 1.2, label: 'Smoked Cheddar' },
    { when: { base: 'gouda', ingredient: 'honey' }, mult: 1.25, label: 'Honey Gouda' },
    { when: { base: 'blue', treatment: 'brined' }, mult: 1.3, label: 'Brined Blue' },
    { when: { ingredient: 'pepper', treatment: 'smoked' }, mult: 1.15, label: 'Smoky pepper' },
    { when: { ingredient: 'truffle', maturation: 'vintage' }, mult: 1.4, label: 'Grand reserve' },
  ],
  // Rango de un queso según su valor.
  tiers: [
    { name: 'Common', min: 0 },
    { name: 'Fine', min: 30 },
    { name: 'Rare', min: 120 },
    { name: 'Epic', min: 500 },
    { name: 'Legendary', min: 2500 },
  ],

  // ---------- TIENDA ----------
  // Vender es un ciclo como los demás. El nivel de Trading trae mejores
  // compradores, que multiplican el precio de todo.
  shop: {
    perSale: 1, // quesos por ciclo
    durationMs: 4000,
    boostMs: 250,
    buyers: [
      { level: 1, name: 'Neighbors', mult: 1 },
      { level: 10, name: 'Restaurants', mult: 1.5 },
      { level: 25, name: 'Collectors', mult: 2.5 },
      { level: 45, name: 'Royal Court', mult: 4 },
      { level: 70, name: 'Moon Embassy', mult: 7 },
    ],
  },

  // Edificios de la cadena: gratis, se desbloquean por hitos (son el tutorial).
  buildings: {
    drill: { name: 'Cheese Drill', requires: { total: 'veinsFound', min: 1, text: 'Reveal a cheese vein first' } },
    refinery: { name: 'Refinery', requires: { total: 'rawProduced', min: 4, text: 'Drill 4 Raw Cheese first' } },
    cheesery: { name: 'Cheesery', requires: { total: 'baseProduced', min: 3, text: 'Refine 3 Cheese Base first' } },
    shop: { name: 'Cheese Shop', requires: { total: 'recipes', min: 1, text: 'Discover a recipe first' } },
  },

  // ---------- ÁRBOLES ----------
  // Cada nudo se compra con monedas y se puede subir varias veces.
  // coste = cost * growth ^ rango. `level` = nivel de la habilidad necesario.
  // `eff` suma su valor por cada rango. Ramas: power, auto, special.
  trees: {
    mining: [
      { id: 'pick', branch: 'power', name: 'Sharper Pick', desc: '+1 search power per hit', level: 1, max: 80, cost: 12, growth: 1.3, eff: { pickPower: 1 } },
      { id: 'swing', branch: 'power', name: 'Heavy Swing', desc: 'Critical hits are 0.5x stronger', level: 6, max: 30, cost: 150, growth: 1.45, eff: { critMult: 0.5 } },
      { id: 'miner', branch: 'auto', name: 'Miner Mouse', desc: 'One more mouse mining every rock, non-stop', level: 2, max: 15, cost: 60, growth: 2, eff: { miners: 1 } },
      { id: 'paws', branch: 'auto', name: 'Quick Paws', desc: 'Miner mice swing 10% faster', level: 10, max: 30, cost: 300, growth: 1.42, eff: { minerSpeed: 0.1 } },
      { id: 'sense', branch: 'special', name: 'Vein Sense', desc: 'Every vein holds 10% more cheese', level: 8, max: 40, cost: 200, growth: 1.4, eff: { veinCap: 0.1 } },
      { id: 'deep', branch: 'special', name: 'Deep Riches', desc: 'Each depth level gives 2% more raw', level: 20, max: 25, cost: 2000, growth: 1.6, eff: { richDepth: 0.02 } },
    ],
    drilling: [
      { id: 'bit', branch: 'power', name: 'Bigger Bit', desc: '+1 Raw Cheese per cycle', level: 1, max: 100, cost: 18, growth: 1.28, eff: { drillYield: 1 } },
      { id: 'motor', branch: 'power', name: 'Turbo Motor', desc: 'Drills run 8% faster', level: 4, max: 40, cost: 70, growth: 1.4, eff: { drillSpeed: 0.08 } },
      { id: 'driller', branch: 'auto', name: 'Driller Mouse', desc: 'Runs every drill non-stop', level: 3, max: 1, cost: 150, growth: 1, eff: { drillAuto: 1 } },
      { id: 'shift', branch: 'auto', name: 'Night Shift', desc: 'Drills run another 10% faster', level: 12, max: 30, cost: 400, growth: 1.45, eff: { drillSpeed: 0.1 } },
      { id: 'rich', branch: 'special', name: 'Rich Extraction', desc: '6% more Raw Cheese from every cycle', level: 9, max: 50, cost: 250, growth: 1.38, eff: { drillRich: 0.06 } },
    ],
    refining: [
      { id: 'vat', branch: 'power', name: 'Bigger Vat', desc: '+1 Cheese Base per cycle', level: 1, max: 100, cost: 18, growth: 1.28, eff: { refBatch: 1 } },
      { id: 'furnace', branch: 'power', name: 'Hot Furnace', desc: 'Refines 8% faster', level: 4, max: 40, cost: 70, growth: 1.4, eff: { refSpeed: 0.08 } },
      { id: 'refiner', branch: 'auto', name: 'Refiner Mouse', desc: 'Runs the Refinery non-stop', level: 3, max: 1, cost: 150, growth: 1, eff: { refAuto: 1 } },
      { id: 'burners', branch: 'auto', name: 'Twin Burners', desc: 'Refines another 10% faster', level: 12, max: 30, cost: 400, growth: 1.45, eff: { refSpeed: 0.1 } },
      { id: 'press', branch: 'special', name: 'Double Press', desc: '5% more Cheese Base from the same Raw', level: 9, max: 50, cost: 250, growth: 1.38, eff: { refBonus: 0.05 } },
    ],
    cheesemaking: [
      { id: 'curds', branch: 'power', name: 'Faster Curds', desc: 'Cheese cooks 8% faster', level: 1, max: 60, cost: 30, growth: 1.33, eff: { cheeseSpeed: 0.08 } },
      { id: 'maker', branch: 'auto', name: 'Cheesemaker Mouse', desc: 'Cooks the recipe you pick, non-stop', level: 3, max: 1, cost: 250, growth: 1, eff: { cheeseAuto: 1 } },
      { id: 'cellar', branch: 'special', name: 'Cheese Cellar', desc: 'Every cheese is worth 8% more', level: 5, max: 80, cost: 150, growth: 1.38, eff: { cheeseValue: 0.08 } },
    ],
    trading: [
      { id: 'prices', branch: 'power', name: 'Better Prices', desc: 'Sell everything for 6% more', level: 1, max: 80, cost: 40, growth: 1.36, eff: { price: 0.06 } },
      { id: 'counter', branch: 'power', name: 'Bigger Counter', desc: '+1 cheese sold per cycle', level: 2, max: 40, cost: 50, growth: 1.5, eff: { sellCount: 1 } },
      { id: 'keeper', branch: 'auto', name: 'Shopkeeper Mouse', desc: 'Sells your cheese non-stop', level: 3, max: 1, cost: 200, growth: 1, eff: { sellAuto: 1 } },
      { id: 'quick', branch: 'auto', name: 'Quick Sales', desc: 'Sales are 10% faster', level: 5, max: 40, cost: 100, growth: 1.4, eff: { sellSpeed: 0.1 } },
      { id: 'sign', branch: 'special', name: 'Fancy Sign', desc: 'Another 10% on every price', level: 15, max: 40, cost: 900, growth: 1.55, eff: { price: 0.1 } },
    ],
    // La colonia no tiene nivel: sus nudos solo cuestan monedas.
    colony: [
      { id: 'silo', branch: 'power', name: 'Raw Silo', desc: '+50% Raw Cheese storage', level: 0, max: 40, cost: 40, growth: 1.55, eff: { capRaw: 0.5 } },
      { id: 'racks', branch: 'power', name: 'Base Racks', desc: '+50% Cheese Base storage', level: 0, max: 40, cost: 40, growth: 1.55, eff: { capBase: 0.5 } },
      { id: 'shelves', branch: 'power', name: 'Cheese Shelves', desc: '+50% cheese storage', level: 0, max: 40, cost: 40, growth: 1.55, eff: { capLots: 0.5 } },
      { id: 'lamp', branch: 'special', name: 'Night Lamp', desc: '+2 hours of offline progress', level: 0, max: 10, cost: 500, growth: 2.2, eff: { offlineHours: 2 } },
    ],
  },

  // Cuántos rangos de la rama POWER hacen falta para cada aspecto del edificio.
  visualTiers: [0, 3, 8, 16, 30, 50],

  // Monedas que se regalan una sola vez al cumplir cada objetivo.
  goalRewards: { vein: 0, drill: 5, raw: 5, refinery: 10, base: 10, cheesery: 15, recipe: 15, shop: 20, sale: 20, node: 30, mouse: 60, level5: 80, allAuto: 400, zone2: 1000, depth3: 300, recipes8: 1500, level25: 5000, zone3: 20000 },

  offline: {
    baseHours: 4, // máximo de ausencia que se simula (ampliable en el árbol de colonia)
    minMs: 15000, // ausencias más cortas no cuentan como offline
    stepMs: 1000,
  },
};
