// BALANCE DE LA ALPHA.
// Todo lo que hay aquí es PLAYTEST_DEFAULT: valores provisionales para poder
// probar, no decisiones de producto. Cambia cualquier número y recarga.
window.CM = window.CM || {};

CM.BALANCE = {
  start: { coins: 0 }, // PLAYTEST_DEFAULT: se empieza sin monedas

  sim: { stepMs: 100 },

  // Monedas que se regalan una sola vez al cumplir cada objetivo. Revelar la
  // primera veta no da nada, para no confundir con «picar da monedas».
  goalRewards: { vein: 0, drill: 5, raw: 5, refinery: 10, base: 10, cheesery: 15, recipe: 15, market: 20, sale: 20, markup: 25, house: 30, worker: 30, allRoles: 60, rep3: 50, deposit2: 100, cook: 60, depleted: 150 }, // paso fijo de simulación (no depende de los frames)

  mining: {
    pickPowerBase: 1, // progreso de búsqueda por golpe
    pickPowerPerLevel: 1,
    comboWindowMs: 650, // golpes manuales más seguidos que esto hacen combo
    critEvery: 5, // cada N golpes de combo, golpe crítico
    critMultiplier: 3,
    minerIntervalMs: 1500, // un Miner da un golpe cada N ms
  },

  // Bases de queso. Las stats entran en la fórmula de recetas.
  bases: {
    cheddar: { name: 'Cheddar', stats: { taste: 3, funk: 1, aroma: 1 } },
    gouda: { name: 'Gouda', stats: { taste: 2, funk: 1, aroma: 4 } },
    blue: { name: 'Blue', stats: { taste: 1, funk: 4, aroma: 2 } }, // preparada, sin contenido en la Alpha
  },

  // Yacimientos. Cada veta pide `hits` de progreso y contiene `capacity` de Raw Cheese.
  deposits: [
    {
      id: 'cheddar',
      base: 'cheddar',
      name: 'Cheddar Rock',
      unlockCost: 0,
      veins: [
        { hits: 30, capacity: 50 },
        { hits: 90, capacity: 100 },
        { hits: 150, capacity: 150 },
      ],
    },
    {
      id: 'gouda',
      base: 'gouda',
      name: 'Gouda Rock',
      unlockCost: 900,
      veins: [
        { hits: 120, capacity: 100 },
        { hits: 200, capacity: 160 },
        { hits: 280, capacity: 220 },
      ],
    },
    { id: 'blue', base: 'blue', name: 'Blue Rock', unlockCost: 2500, inAlpha: false, veins: [{ hits: 200, capacity: 200 }] },
  ],

  drill: {
    yieldBase: 2, // Raw Cheese por ciclo
    yieldPerLevel: 1,
    durationMs: 8000,
    durationFactorPerLevel: 0.88,
    boostMs: 250, // tiempo que ahorra cada tap manual durante un ciclo
  },

  refinery: {
    rawPerBase: 2, // Raw Cheese por cada Cheese Base
    batchBase: 2, // Cheese Base por ciclo
    batchPerLevel: 1,
    durationMs: 8000,
    durationFactorPerLevel: 0.88,
    boostMs: 250,
  },

  // Capacidades. Índice 0 = sin edificio Storage; 1 = recién construido; 2+ = mejoras.
  storage: {
    levels: [
      { raw: 20, base: 12, lots: 6 },
      { raw: 50, base: 30, lots: 12 },
      { raw: 100, base: 60, lots: 20 },
      { raw: 200, base: 120, lots: 32 },
    ],
  },

  // Camas para trabajadores. Índice 0 = sin Mouse House.
  house: { slots: [0, 2, 4, 5] },

  // Edificios. PLAYTEST_DEFAULT: los cuatro de la cadena principal son gratis
  // (kit inicial) y se desbloquean por hitos, para que se pueda llegar a la
  // primera venta sin tener monedas.
  buildings: {
    drill: { name: 'Cheese Drill', cost: 0, requires: { total: 'veinsFound', min: 1, text: 'Reveal a cheese vein first' } },
    refinery: { name: 'Refinery', cost: 0, requires: { total: 'rawProduced', min: 4, text: 'Drill 4 Raw Cheese first' } },
    cheesery: { name: 'Cheesery', cost: 0, requires: { total: 'baseProduced', min: 3, text: 'Refine 3 Cheese Base first' } },
    market: { name: 'Cheese Shop', cost: 0, requires: { total: 'recipes', min: 1, text: 'Discover a recipe first' } },
    storage: { name: 'Storage', cost: 90 },
    house: { name: 'Mouse House', cost: 120 },
  },

  // Mejoras: coste = base * growth ^ nivel. Mejoran la máquina, no la automatizan.
  upgrades: {
    pickaxe: { name: 'Pickaxe', maxLevel: 5, base: 60, growth: 1.8 },
    drill: { name: 'Cheese Drill', maxLevel: 5, base: 80, growth: 1.8 },
    refinery: { name: 'Refinery', maxLevel: 5, base: 80, growth: 1.8 },
    cheesery: { name: 'Cheesery', maxLevel: 5, base: 100, growth: 1.8 }, // solo velocidad
    storage: { name: 'Storage', maxLevel: 2, base: 200, growth: 2.2 },
    house: { name: 'Mouse House', maxLevel: 2, base: 200, growth: 2 },
  },

  // Trabajadores: automatizan su etapa, no la aceleran. Sin salario en la Alpha.
  workers: {
    miner: { name: 'Miner', cost: 100, max: 2, does: 'Searches for veins on its own' },
    driller: { name: 'Driller', cost: 180, max: 1, does: 'Runs the Cheese Drill non-stop' },
    refiner: { name: 'Refiner', cost: 180, max: 1, does: 'Runs the Refinery non-stop' },
    // Cocina sin parar la receta que se le asigne; vender sigue siendo manual.
    cheesemaker: { name: 'Cheesemaker', cost: 220, max: 1, does: 'Cooks the recipe you assign, non-stop' },
  },

  cheesery: {
    experimentBase: 3, // Cheese Base que cuesta un experimento (da receta + 1 lote)
    lotBase: 2, // Cheese Base por lote de una receta conocida
    baseTimeMs: 10000, // tiempo por lote antes de tratamiento y maduración
    maxQueue: 5, // lotes máximos por encargo
    boostMs: 300,
    durationFactorPerLevel: 0.85, // cada nivel de la Cheesery acorta el tiempo por lote
    // Maestría: lotes fabricados de una receta para alcanzar los niveles 1, 2, 3...
    masteryAt: [0, 3, 8, 15, 25],
    masteryValue: 0.08, // +8 % de Value por nivel de maestría
    masteryTime: 0.06, // -6 % de tiempo por nivel de maestría
  },

  ingredients: {
    herbs: { name: 'Herbs', adj: 'Herb', stats: { taste: 1, funk: 0, aroma: 2 }, coinCost: 0 },
    pepper: { name: 'Pepper', adj: 'Pepper', stats: { taste: 2, funk: 1, aroma: 0 }, coinCost: 3 },
  },
  treatments: {
    washed: { name: 'Washed', adj: 'Washed', stats: { taste: 0, funk: 3, aroma: 1 }, timeMs: 0 },
    smoked: { name: 'Smoked', adj: 'Smoked', stats: { taste: 1, funk: 1, aroma: 2 }, timeMs: 6000 },
  },
  maturations: {
    fresh: { name: 'Fresh', adj: '', stats: { taste: 1, funk: 0, aroma: 1 }, timeMs: 0, valueMult: 1 },
    aged: { name: 'Aged', adj: 'Aged', stats: { taste: 2, funk: 2, aroma: 1 }, timeMs: 20000, valueMult: 1.5 },
  },

  // Sinergias: si la receta cumple `when`, se suma `add` a sus stats.
  synergies: [
    { when: { base: 'cheddar', treatment: 'smoked' }, add: { taste: 2 }, label: 'Smoked Cheddar' },
    { when: { base: 'gouda', ingredient: 'herbs' }, add: { aroma: 2 }, label: 'Herbed Gouda' },
    { when: { treatment: 'washed', maturation: 'aged' }, add: { funk: 2 }, label: 'Aged rind' },
    { when: { ingredient: 'pepper', treatment: 'smoked' }, add: { taste: 1, aroma: 1 }, label: 'Smoky pepper' },
  ],

  // Value = (taste*w + funk*w + aroma*w) * valueMult de la maduración
  valueWeights: { taste: 3, funk: 2, aroma: 2 },

  merchant: {
    slots: 3, // clientes en la tienda a la vez; el primero siempre es un vecino
    cooldownMs: 15000, // espera hasta que entra otro cliente en ese hueco
    cooldownPerRepMs: 1000, // cada nivel de reputación acorta esa espera
    cooldownMinMs: 7000,
    reqSlack: 1, // margen que se resta a las stats de la receta objetivo
    // Puntos de reputación necesarios para cada nivel (el índice 0 es el nivel 1).
    repLevels: [0, 6, 16, 32, 55, 85, 125, 180],
    repPricePerLevel: 0.03, // +3 % de precio por nivel de reputación
    // Regateo: precio y probabilidad base de que el cliente acepte.
    stances: {
      discount: { label: 'DISCOUNT', priceMult: 0.8, chance: 1, rep: 3 },
      fair: { label: 'FAIR PRICE', priceMult: 1, chance: 1, rep: 2 },
      markup: { label: 'MARKUP', priceMult: 1.25, chance: 0.55, rep: 1 },
      premium: { label: 'BIG MARKUP', priceMult: 1.5, chance: 0.25, rep: 1 },
    },
    fitChancePerPoint: 0.05, // cada punto de stat por encima de lo pedido
    fitChanceMax: 0.3,
    bonusChance: 0.15, // si el queso cumple la preferencia del cliente
    repChancePerLevel: 0.03,
    chanceMax: 0.95,
    buyers: {
      // unlockRep: nivel de reputación necesario; patienceMs: cuánto espera
      neighbor: {
        name: 'Neighbor',
        blurb: 'Buys any cheese, pays little',
        unlockRep: 1,
        patienceMs: 90000,
        priceMult: 0.8,
        qty: [1, 1],
        reqStats: [],
        bonus: { stat: 'taste', min: 8, mult: 1.25 }, // preferencia: paga más si le gusta
      },
      restaurant: {
        name: 'Restaurant',
        blurb: 'Wants tasty, aromatic cheese in bulk',
        unlockRep: 2,
        patienceMs: 120000,
        priceMult: 1.3,
        qty: [2, 3],
        reqStats: ['taste', 'aroma'],
      },
      collector: {
        name: 'Collector',
        blurb: 'Pays well for funky aged cheese',
        unlockRep: 3,
        patienceMs: 150000,
        priceMult: 1.6,
        qty: [1, 1],
        reqStats: ['funk'],
        maturation: 'aged',
      },
      premium: {
        name: 'Premium Client',
        blurb: 'Only the finest aged cheese',
        unlockRep: 4,
        patienceMs: 150000,
        priceMult: 2,
        qty: [1, 2],
        reqStats: ['taste', 'aroma', 'value'],
        maturation: 'aged',
      },
    },
  },

  offline: {
    capMs: 4 * 60 * 60 * 1000, // máximo de ausencia que se simula
    minMs: 15000, // ausencias más cortas no cuentan como offline
    stepMs: 1000,
  },
};
