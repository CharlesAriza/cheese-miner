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
    growth: 1.15, // cada nivel pide un 15 % más que el anterior
    maxLevel: 99,
    bonusPerLevel: 0.02, // +2 % de rendimiento en esa habilidad por nivel
    // La experiencia se gana POR ACCIÓN completada, no por unidad producida:
    // sacar más por ciclo da más queso, no más niveles. Lo que da más
    // experiencia es hacer cosas más difíciles (mejor zona, más hondo, mejor receta).
    perHit: 0.4, // minería: por golpe, sea cual sea su fuerza
    perDrill: 5, // taladro: por ciclo
    perRefine: 6, // refinado: por ciclo
    perCheese: 8, // quesería: por queso
    perSale: 5, // comercio: por venta
    tierPower: 0.7, // experiencia x (valor de la base / 10) ^ tierPower
    depthBonus: 0.05, // +5 % de experiencia por nivel de profundidad
    recipePower: 0.5, // quesería y comercio: x (valor de fórmula / 10) ^ recipePower
  },

  mining: {
    pickPower: 1, // progreso de búsqueda por golpe
    comboWindowMs: 650, // golpes manuales más seguidos que esto hacen combo
    critEvery: 5, // cada N golpes de combo, golpe crítico
    critMultiplier: 3,
    minerIntervalMs: 4500, // cada ratón minero da un golpe cada N ms en cada roca
  },

  // ---------- ZONAS ----------
  // Las rocas no se agotan: al vaciar una veta, la roca baja un nivel de
  // profundidad. Más hondo = vetas más duras y grandes, y queso más rico.
  bases: {
    cheddar: { name: 'Cheddar', value: 10 },
    gouda: { name: 'Gouda', value: 24 },
    brie: { name: 'Brie', value: 60 },
    emmental: { name: 'Emmental', value: 150 },
    parmesan: { name: 'Parmesan', value: 380 },
    blue: { name: 'Blue', value: 950 },
  },
  // Seis rocas en escalera: cada una vale unas 2,5 veces más por queso, es
  // bastante más dura y cuesta mucho más abrirla. Siempre hay una siguiente
  // a la vista. (Cada roca tendrá además su propio edificio o mecánica.)
  zones: [
    { id: 'cheddar', base: 'cheddar', name: 'Cheddar Rock', unlockCost: 0, hits: 30, capacity: 60 },
    { id: 'gouda', base: 'gouda', name: 'Gouda Rock', unlockCost: 200000, hits: 150, capacity: 150 },
    { id: 'brie', base: 'brie', name: 'Brie Rock', unlockCost: 3000000000, hits: 400, capacity: 400 },
    { id: 'emmental', base: 'emmental', name: 'Emmental Rock', unlockCost: 1000000000000, hits: 1000, capacity: 1000 },
    { id: 'parmesan', base: 'parmesan', name: 'Parmesan Rock', unlockCost: 12000000000000, hits: 2500, capacity: 2500 },
    { id: 'blue', base: 'blue', name: 'Blue Rock', unlockCost: 80000000000000, hits: 6000, capacity: 6000 },
  ],
  depth: {
    // Búsqueda y veta crecen al mismo ritmo: más hondo todo es más grande y más
    // lento, pero picar y taladrar siguen pesando lo mismo el uno frente al otro.
    hitsGrowth: 1.15, // búsqueda necesaria por nivel de profundidad
    capacityGrowth: 1.15, // tamaño de la veta por nivel de profundidad
    richness: 0.03, // cada nivel de profundidad multiplica por 1,03 el VALOR del queso de esa roca
  },

  // ---------- MÁQUINAS ----------
  drill: { yield: 2, durationMs: 6000, boostMs: 250 },
  refinery: { rawPerBase: 2, batch: 2, durationMs: 6000, boostMs: 250 },

  // ---------- QUESERÍA ----------
  // BASE + INGREDIENTE + TRATAMIENTO + MADURACIÓN = QUESO.
  // Valor = valor de la base x multiplicadores. `level` es el nivel de
  // Cheesemaking que hace falta para usar ese componente.
  cheesery: {
    batch: 1, // quesos por hornada (sube con More Moulds)
    // Laboratorio: cada receta nueva tarda un 3 % más que la anterior. Las primeras
    // salen en segundos; completar el libro entero es un objetivo de muchas horas.
    labBaseMs: 12000,
    labGrowth: 1.03,
    experimentBase: 3, // Cheese Base que cuesta descubrir una receta (da 1 queso)
    lotBase: 2, // Cheese Base por queso de una receta conocida
    baseTimeMs: 6000,
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
    smoked: { name: 'Smoked', adj: 'Smoked', mult: 1.35, timeMs: 500, level: 3 },
    brined: { name: 'Brined', adj: 'Brined', mult: 1.8, timeMs: 1000, level: 16 },
  },
  maturations: {
    fresh: { name: 'Fresh', adj: '', mult: 1, timeMs: 0, level: 1 },
    aged: { name: 'Aged', adj: 'Aged', mult: 1.6, timeMs: 1000, level: 8 },
    vintage: { name: 'Vintage', adj: 'Vintage', mult: 2.8, timeMs: 2000, level: 30 },
  },
  synergies: [
    { when: { base: 'cheddar', treatment: 'smoked' }, mult: 1.2, label: 'Smoked Cheddar' },
    { when: { base: 'gouda', ingredient: 'honey' }, mult: 1.25, label: 'Honey Gouda' },
    { when: { base: 'brie', ingredient: 'truffle' }, mult: 1.25, label: 'Truffle Brie' },
    { when: { base: 'emmental', maturation: 'aged' }, mult: 1.25, label: 'Aged Emmental' },
    { when: { base: 'parmesan', maturation: 'vintage' }, mult: 1.3, label: 'Vintage Parmesan' },
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
    perSale: 18, // quesos por ciclo (la tienda atiende a todas las rocas)
    durationMs: 2000,
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
  // No se construyen solos: al cumplir la condición el juego para, explica para
  // qué sirve el edificio y el jugador lo construye. A fuego lento.
  buildings: {
    drill: { name: 'Cheese Drill', requires: { total: 'veinsFound', min: 1, text: 'Reveal a cheese vein first' } },
    refinery: { name: 'Refinery', requires: { total: 'rawProduced', min: 10, text: 'Drill 10 Raw Cheese first' } },
    cheesery: { name: 'Cheesery', requires: { total: 'baseProduced', min: 6, text: 'Refine 6 Cheese Base first' } },
    shop: { name: 'Cheese Shop', requires: { total: 'recipes', min: 1, text: 'Discover a recipe first' } },
    house: { name: 'Mouse House', requires: { total: 'nodesBought', min: 1, text: 'Buy your first upgrade' } },
  },

  // ---------- RATONES ----------
  // Cada ratón es un personaje: un rasgo bueno, una manía, un oficio favorito,
  // nivel propio y rango. Un puesto con ratón trabaja solo.
  mice: {
    recruitCost: 100, // coste del primero
    recruitGrowth: 1.5, // cada recluta cuesta un 50 % más que el anterior, para siempre (despedir no lo baja)
    candidates: 3, // se elige uno de tres
    managerBudget: 0.1, // un gerente solo compra mejoras que cuesten hasta el 10 % de tus monedas
    // Rareza de cada candidato. Un raro es más rápido y tiene pelajes propios;
    // un legendario, además, trae dos rasgos buenos y ninguna manía.
    rarities: [
      { name: 'Common', chance: 0.83, bonus: 0 },
      { name: 'Rare', chance: 0.15, bonus: 0.1 },
      { name: 'Legendary', chance: 0.02, bonus: 0.25 },
    ],
    albumPrice: 0.01, // cada pieza nueva del álbum sube un 1 % el precio de venta, para siempre
    xpBase: 12, // acciones para pasar del nivel 1 al 2
    xpGrowth: 1.15,
    maxLevel: 60,
    perLevel: 0.01, // +1 % de velocidad por nivel del ratón
    xpPerAction: 1, // experiencia por ciclo completado en su puesto
    xpPerHit: 0.25, // un golpe de minería vale menos que un ciclo
    // Rangos: nivel que piden, coste y velocidad extra. El gerente compra mejoras solo.
    ranks: [
      { name: 'Apprentice', level: 1, cost: 0, bonus: 0 },
      { name: 'Journeyman', level: 10, cost: 2000, bonus: 0.1 },
      { name: 'Master', level: 25, cost: 150000, bonus: 0.2 },
      { name: 'Manager', level: 40, cost: 20000000, bonus: 0.35, manager: true },
    ],
    // Los rasgos, las afinidades y las combinaciones están en traits.js.
    names: ['Pip', 'Brie', 'Nibbles', 'Gus', 'Colby', 'Mozza', 'Pepper', 'Squeak', 'Rind', 'Fondue', 'Biscuit', 'Curd', 'Tilly', 'Monty', 'Gruyere', 'Havarti', 'Swiss', 'Feta', 'Ricotta', 'Paneer', 'Jack', 'Stilton', 'Muenster', 'Edam', 'Roque', 'Camem', 'Whey', 'Nacho', 'Truffle', 'Poppy', 'Dot', 'Olive', 'Basil', 'Clover', 'Hazel', 'Rye', 'Oats', 'Maple', 'Juniper', 'Sage'],
  },

  // ---------- ÁRBOLES ----------
  // Cada nudo se compra con monedas y se puede subir varias veces.
  // coste = cost * growth ^ rango. `level` = nivel de la habilidad necesario.
  // `eff` suma su valor por cada rango. Ramas: power, auto, special.
  trees: {
    mining: [
      { id: 'pick', branch: 'power', name: 'Sharper Pick', desc: '+1 search power per hit', level: 1, max: 80, cost: 12, growth: 1.3, eff: { pickPower: 1 } },
      { id: 'swing', branch: 'power', name: 'Heavy Swing', desc: 'Critical hits are 0.5x stronger', level: 6, max: 30, cost: 150, growth: 1.45, eff: { critMult: 0.5 } },
      { id: 'paws', branch: 'auto', name: 'Quick Paws', desc: 'The mouse mining each rock swings 10% faster', level: 10, max: 30, cost: 300, growth: 1.42, eff: { minerSpeed: 0.1 } },
      { id: 'sense', branch: 'special', name: 'Vein Sense', desc: 'Every vein holds 4% more cheese', level: 8, max: 40, cost: 200, growth: 1.4, eff: { veinCap: 0.04 } },
      { id: 'deep', branch: 'special', name: 'Deep Riches', desc: 'Each depth level is worth another 0.1% on that rock\'s cheese', level: 20, max: 25, cost: 2000, growth: 1.6, eff: { richDepth: 0.001 } },
    ],
    drilling: [
      { id: 'bit', branch: 'power', name: 'Bigger Bit', desc: '+1 Raw Cheese per cycle', level: 1, max: 999, cost: 50, growth: 3, eff: { drillYield: 1 } },
      { id: 'motor', branch: 'power', name: 'Turbo Motor', desc: 'Drills run 8% faster', level: 4, max: 40, cost: 70, growth: 1.4, eff: { drillSpeed: 0.08 } },
      { id: 'shift', branch: 'auto', name: 'Night Shift', desc: 'Drills run another 10% faster', level: 12, max: 30, cost: 400, growth: 1.45, eff: { drillSpeed: 0.1 } },
      { id: 'rich', branch: 'special', name: 'Rich Extraction', desc: '2.5% more Raw Cheese from every cycle', level: 9, max: 50, cost: 250, growth: 1.38, eff: { drillRich: 0.025 } },
    ],
    refining: [
      { id: 'vat', branch: 'power', name: 'Bigger Vat', desc: '+2 Cheese Base per cycle', level: 1, max: 999, cost: 50, growth: 3, eff: { refBatch: 2 } },
      { id: 'furnace', branch: 'power', name: 'Hot Furnace', desc: 'Refines 8% faster', level: 4, max: 40, cost: 70, growth: 1.4, eff: { refSpeed: 0.08 } },
      { id: 'burners', branch: 'auto', name: 'Twin Burners', desc: 'Refines another 10% faster', level: 12, max: 30, cost: 400, growth: 1.45, eff: { refSpeed: 0.1 } },
      { id: 'press', branch: 'special', name: 'Double Press', desc: '2% more Cheese Base from the same Raw', level: 9, max: 50, cost: 250, growth: 1.38, eff: { refBonus: 0.02 } },
    ],
    cheesemaking: [
      { id: 'moulds', branch: 'power', name: 'More Moulds', desc: '+1 cheese per batch', level: 1, max: 999, cost: 50, growth: 3, eff: { cheeseBatch: 1 } },
      { id: 'curds', branch: 'power', name: 'Faster Curds', desc: 'Cheese cooks 8% faster', level: 1, max: 60, cost: 30, growth: 1.33, eff: { cheeseSpeed: 0.08 } },
      { id: 'cellar', branch: 'special', name: 'Cheese Cellar', desc: 'Every cheese is worth 8% more', level: 5, max: 80, cost: 150, growth: 1.38, eff: { cheeseValue: 0.08 } },
    ],
    trading: [
      { id: 'prices', branch: 'power', name: 'Better Prices', desc: 'Sell everything for 6% more', level: 1, max: 80, cost: 40, growth: 1.36, eff: { price: 0.06 } },
      { id: 'counter', branch: 'power', name: 'Bigger Counter', desc: '+18 cheese sold per cycle', level: 1, max: 999, cost: 50, growth: 3, eff: { sellCount: 18 } },
      { id: 'quick', branch: 'auto', name: 'Quick Sales', desc: 'Sales are 10% faster', level: 5, max: 40, cost: 100, growth: 1.4, eff: { sellSpeed: 0.1 } },
      { id: 'sign', branch: 'special', name: 'Fancy Sign', desc: 'Another 10% on every price', level: 15, max: 40, cost: 900, growth: 1.55, eff: { price: 0.1 } },
    ],
    // La colonia no tiene nivel: sus nudos solo cuestan monedas. No hay almacén
    // con tope: todo se acumula sin límite en la despensa, como un banco.
    colony: [
      { id: 'lamp', branch: 'special', name: 'Night Lamp', desc: 'Your mice keep working 2 more hours while you are away', level: 0, max: 10, cost: 500, growth: 2.2, eff: { offlineHours: 2 } },
    ],
  },

  // Cuántos rangos de la rama POWER hacen falta para cada aspecto del edificio.
  visualTiers: [0, 3, 8, 16, 30, 50],
  // Nudos que existieron y ya no: al cargar una partida se devuelven sus monedas.
  // Los nudos de ratón pasaron a ser ratones de verdad (ver migración en storage.js).
  retiredNodes: { 'colony.silo': { cost: 40, growth: 1.55 }, 'colony.racks': { cost: 40, growth: 1.55 }, 'colony.shelves': { cost: 40, growth: 1.55 } },

  // Monedas que se regalan una sola vez al cumplir cada objetivo.
  goalRewards: { vein: 0, drill: 5, raw: 5, refinery: 10, base: 10, cheesery: 15, recipe: 15, shop: 20, sale: 20, node: 30, house: 40, mouse: 60, promote: 500, level5: 80, allAuto: 400, zone2: 20000, depth3: 300, recipes8: 1500, level25: 5000, zone3: 300000000, zone4: 100000000000, zone5: 1000000000000, zone6: 8000000000000 },

  offline: {
    baseHours: 4, // máximo de ausencia que se simula (ampliable en el árbol de colonia)
    minMs: 15000, // ausencias más cortas no cuentan como offline
    stepMs: 1000,
  },
};
