// CHEESE DRILLER · BETA · Player Progression Roadmap como datos (D9 aprobado el 4-11-2026, D10 aprobado en su intención).
// Una entrada = un desbloqueo: qué es, de qué sistema, en qué etapa está pensado y qué pide. Referencia de diseño, no reglas
// cerradas: añadir contenido de LAB, HOUSE, Forbidden o estratos es añadir filas. Lo evalúa progression.js.
//   kind: 'unique' (cuenta como contenido nuevo) · 'repeatable' (da ritmo, no cuenta) · 'discovery' · 'social' (cosmético o social).
//   slot: lo que cuenta una vez por partida cuando dos caminos compiten (los caminos alternativos comparten slot).
//   planned: true = aún sin construir (de un hito posterior): se conserva el orden, pero no se abre ni se anuncia.
// Las puertas combinan estrato, desarrollo de la estación, investigación, materiales y ratones: no son un solo número de nivel,
// y ninguna es un temporizador. Las cifras son provisionales y se cambian aquí, sin tocar código.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.ROADMAP = (function () {
  const level = (st, n) => ({ t: 'level', st, n }), stratum = (id) => ({ t: 'stratum', id }), phase = (st, n) => ({ t: 'phase', st, n }), crew = (st) => ({ t: 'crewFull', st });
  const recipes = (n) => ({ t: 'recipes', n }), rank = (n, count) => ({ t: 'rank', r: n, n: count || 1 }), rankAt = (st, n) => ({ t: 'rankAt', st, n }), material = (id, n) => ({ t: 'material', id, n });
  const unlock = (id) => ({ t: 'unlock', id }), node = (id) => ({ t: 'labNode', id }), labPhase = (n) => ({ t: 'labPhase', n }), strains = (n) => ({ t: 'strains', n });
  const u = (id, stage, system, requires, extra) => Object.assign({ id, stage, system, kind: 'unique', requires }, extra || {});
  // Dos caminos de una horquilla comparten puerta y cuentan una vez.
  const steps = (stage, system, slot, ids, requires) => ids.map((id) => u('path.' + id, stage, system, requires, { slot }));

  const stages = [
    { id: 'cheddar', band: 'early', stratum: 'cheddar' },
    { id: 'gouda', band: 'early', stratum: 'gouda' },
    { id: 'brie', band: 'mid', stratum: 'brie' },
    { id: 'emmental', band: 'mid', stratum: 'emmental' },
    { id: 'parmesan', band: 'mid', stratum: 'parmesan' },
    { id: 'blue', band: 'late', stratum: 'blue' },
  ];
  const systems = ['main', 'mice', 'tree', 'lab', 'strains', 'materials', 'pantry', 'house', 'forbidden', 'strata'];

  const unlocks = [
    // ---- Edificios: se anuncian y los construye el jugador (regla 7). Son presentación, no cuentan en el reparto. ----
    u('build.drill', 'cheddar', 'main', [{ t: 'veins', n: 1 }], { tally: false }),
    u('build.refine', 'cheddar', 'main', [{ t: 'raw', n: 10 }], { tally: false }),
    u('build.cheese', 'cheddar', 'main', [{ t: 'base', n: 6 }], { tally: false }),
    u('build.sell', 'cheddar', 'main', [{ t: 'lots', n: 1 }], { tally: false }),
    u('build.house', 'cheddar', 'mice', [{ t: 'nodes', n: 1 }], { tally: false }),
    u('build.lab', 'cheddar', 'lab', [recipes(3)], { tally: false }),

    // ---- Refuerzos ----
    u('boost.1', 'cheddar', 'tree', [{ t: 'chain' }]),
    u('boost.2', 'gouda', 'tree', [stratum('gouda')]),
    u('boost.3', 'brie', 'tree', [stratum('brie')]),
    u('boost.4', 'emmental', 'tree', [stratum('emmental')]),
    u('boost.5', 'parmesan', 'tree', [stratum('parmesan')]),
    u('boost.6', 'blue', 'tree', [stratum('blue')]),

    // ---- Fases: de arriba abajo por la cadena; una estación crece cuando su equipo está completo ----
    u('phase2.mine', 'gouda', 'main', [level('mine', 15), crew('mine')]),
    u('phase2.drill', 'gouda', 'main', [level('drill', 15), crew('drill')]),
    u('phase2.refine', 'brie', 'main', [level('refine', 15), crew('refine'), phase('drill', 2), rank(1, 2)]),
    u('phase2.cheese', 'brie', 'main', [level('cheese', 15), crew('cheese'), phase('refine', 2), rank(1, 3)]),
    u('phase2.sell', 'brie', 'main', [level('sell', 15), crew('sell'), phase('cheese', 2), rank(1, 4)]),
    u('phase3.mine', 'emmental', 'main', [level('mine', 35), crew('mine'), phase('sell', 2), rankAt('mine', 2), stratum('brie')]),
    u('phase3.drill', 'emmental', 'main', [level('drill', 35), crew('drill'), phase('mine', 3), rankAt('drill', 2)]),
    u('phase3.refine', 'parmesan', 'main', [level('refine', 35), crew('refine'), phase('drill', 3), rankAt('refine', 2), stratum('emmental')]),
    u('phase3.cheese', 'parmesan', 'main', [level('cheese', 35), crew('cheese'), phase('refine', 3), rankAt('cheese', 2)]),
    u('phase3.sell', 'parmesan', 'main', [level('sell', 35), crew('sell'), phase('cheese', 3), rankAt('sell', 2)]),

    // ---- Caminos: decisiones por estación, repartidas entre etapas ----
    ...steps('brie', 'tree', 'mine.search#1', ['prospector', 'surveyCrew'], [phase('mine', 2), level('mine', 20), stratum('brie')]),
    ...steps('brie', 'tree', 'drill.extract#1', ['coreSampler', 'throughput'], [phase('drill', 2), level('drill', 20), material('gouda', 10)]),
    ...steps('brie', 'tree', 'refine.use#1', ['pureBase', 'fastStill'], [phase('refine', 2), level('refine', 20), rank(1, 3)]),
    ...steps('emmental', 'tree', 'sell.market#1', ['boutique', 'wholesale'], [phase('sell', 2), level('sell', 25), recipes(20)]),
    ...steps('emmental', 'tree', 'drill.extract#2', ['strataLogs', 'heavyBits'], [phase('drill', 3), level('drill', 40)]),
    ...steps('emmental', 'tree', 'refine.use#2', ['gaugeDiscipline'], [phase('refine', 2), level('refine', 40), rankAt('refine', 2)]),
    u('path.shiftRota', 'emmental', 'tree', [phase('mine', 3), level('mine', 40)], { slot: 'mine.search#survey', tally: false }),
    ...steps('parmesan', 'tree', 'mine.seams#1', ['wideSeams', 'quickSeams'], [phase('mine', 3), level('mine', 40), stratum('emmental')]),
    ...steps('parmesan', 'tree', 'cheese.time#1', ['affinage', 'freshMarket'], [phase('cheese', 3), level('cheese', 40), recipes(40)]),
    ...steps('parmesan', 'tree', 'mine.search#cap', ['blasting', 'surveyAhead'], [phase('mine', 3), level('mine', 40), rankAt('mine', 2), stratum('parmesan')]),
    ...steps('blue', 'tree', 'mine.seams#2', ['richSeams'], [level('mine', 60), material('parmesan', 20)]),
    ...steps('blue', 'tree', 'sell.market#2', ['collectorsList', 'bulkContracts'], [phase('sell', 3), level('sell', 50), recipes(60)]),

    // ---- Hitos de CHEESE ----
    u('ms.wheel', 'emmental', 'tree', [level('cheese', 30), phase('cheese', 2), recipes(15)]),
    u('ms.master', 'parmesan', 'tree', [unlock('ms.wheel'), level('cheese', 45), rankAt('cheese', 2)]),

    // ---- LAB: conocerlo abre un investigador, no todas las investigaciones ----
    u('lab.assistant', 'gouda', 'lab', [unlock('build.lab'), { t: 'chain' }]),
    u('lab.burners', 'gouda', 'lab', [unlock('build.lab'), recipes(3)], { kind: 'repeatable' }),
    u('lab.samples', 'gouda', 'lab', [unlock('build.lab'), recipes(3)], { kind: 'repeatable' }),
    u('lab.advanced', 'brie', 'lab', [{ t: 'worker' }, recipes(8)]),
    u('lab.phase2', 'brie', 'lab', [{ t: 'worker' }, recipes(10)]),
    u('lab.queue', 'brie', 'lab', [labPhase(2)]),
    u('lab.strains', 'emmental', 'strains', [node('advanced'), recipes(20), level('cheese', 25), phase('cheese', 2)]),
    u('lab.phase3', 'emmental', 'lab', [node('queue'), recipes(30), stratum('brie')]),
    u('lab.desk', 'emmental', 'materials', [labPhase(3), stratum('brie')]),
    u('plan.blasting', 'emmental', 'materials', [node('desk'), { t: 'owned', id: 'prospector' }], { slot: 'plan#1' }),
    u('plan.surveyAhead', 'emmental', 'materials', [node('desk'), { t: 'owned', id: 'shiftRota' }], { slot: 'plan#1' }),
    u('lab.phase4', 'parmesan', 'lab', [node('desk'), recipes(60), strains(3), stratum('emmental')]),
    u('lab.library', 'parmesan', 'strains', [labPhase(4), strains(3), stratum('emmental')]),

    // ---- Estudios de estilo: la profundidad abre la pregunta, el jugador la encarga con materiales ----
    u('study.gouda', 'gouda', 'lab', [stratum('gouda'), unlock('build.lab')]),
    u('study.brie', 'brie', 'lab', [stratum('brie'), unlock('build.lab')]),
    u('study.emmental', 'emmental', 'lab', [stratum('emmental'), unlock('build.lab')]),
    u('study.parmesan', 'parmesan', 'lab', [stratum('parmesan'), unlock('build.lab')]),
    u('study.blue', 'blue', 'lab', [stratum('blue'), unlock('build.lab')]),

    // ---- De hitos posteriores: el orden queda escrito, pero aún no se abre nada ----
    u('pantry.sheet', 'gouda', 'pantry', [{ t: 'material', id: 'gouda', n: 1 }], { planned: 'hito 3', tally: false }),
    u('pantry.building', 'brie', 'pantry', [unlock('pantry.sheet')], { planned: 'hito 3 (D5)', tally: false }),
    u('house.scene', 'gouda', 'house', [unlock('build.house')], { kind: 'social', planned: 'hito 6' }),
    u('house.commonRoom', 'brie', 'house', [unlock('house.scene')], { kind: 'social', planned: 'hito 6' }),
    u('house.bonds', 'emmental', 'house', [unlock('house.commonRoom')], { kind: 'social', planned: 'hito 6' }),
    u('forbidden.announce', 'emmental', 'forbidden', [labPhase(3)], { planned: 'hito 7 (D7, D8)', tally: false }),
    u('forbidden.first', 'parmesan', 'forbidden', [unlock('forbidden.announce'), labPhase(4), { t: 'worker' }], { planned: 'hito 7 (D7, D8)', tally: false }),
    u('forbidden.risk', 'blue', 'forbidden', [unlock('forbidden.first')], { planned: 'hito 7 (D7, D8)', tally: false }),
    u('strata.next', 'blue', 'strata', [stratum('blue')], { planned: 'ampliación', tally: false }),
  ];

  // Objetivos de arranque (texto y recompensa del juego actual; los de abrir rocas ya no existen).
  // `at`: dónde lleva tocar el objetivo. Todos apuntan a algo que funciona.
  const goals = [
    { id: 'vein', at: 'mine', text: 'Find a cheese vein', requires: [{ t: 'veins', n: 1 }] },
    { id: 'drill', at: 'drill', text: 'Build the Cheese Drill', requires: [{ t: 'built', id: 'drill' }] },
    { id: 'raw', at: 'drill', text: 'Drill 10 Raw Cheese', requires: [{ t: 'raw', n: 10 }] },
    { id: 'refinery', at: 'refine', text: 'Build the Refinery', requires: [{ t: 'built', id: 'refine' }] },
    { id: 'base', at: 'refine', text: 'Refine 6 Cheese Base', requires: [{ t: 'base', n: 6 }] },
    { id: 'cheesery', at: 'cheese', text: 'Build the Cheesery', requires: [{ t: 'built', id: 'cheese' }] },
    { id: 'firstLot', at: 'cheese', text: 'Make your first cheese', requires: [{ t: 'lots', n: 1 }] },
    { id: 'shop', at: 'sell', text: 'Open your Cheese Shop', requires: [{ t: 'built', id: 'sell' }] },
    { id: 'sale', at: 'sell', text: 'Sell a cheese', requires: [{ t: 'sold', n: 1 }] },
    { id: 'node', at: 'upgrades', text: 'Buy an upgrade', requires: [{ t: 'nodes', n: 1 }] },
    { id: 'house', at: 'mice', text: 'Build the Mouse House', requires: [{ t: 'built', id: 'house' }] },
    { id: 'mouse', at: 'mice', text: 'Recruit your first mouse', requires: [{ t: 'mice', n: 1 }] },
    { id: 'posted', at: 'mice', text: 'Give your mouse a job', requires: [{ t: 'staffed', n: 1 }] },
    { id: 'recipe', at: 'cheese', text: 'Discover a recipe', requires: [recipes(2)] },
    { id: 'level5', at: 'upgrades', text: 'Reach level 5 in any skill', requires: [{ t: 'levelAny', n: 5 }] },
    { id: 'allAuto', at: 'mice', text: 'Put a mouse on all five stages', requires: [{ t: 'chain' }] },
    { id: 'promote', at: 'mice', text: 'Promote a mouse', requires: [rank(1, 1)] },
    { id: 'depth3', at: 'mine', text: 'Dig down to depth 3', requires: [{ t: 'depth', n: 3 }] },
    { id: 'recipes8', at: 'cheese', text: 'Discover 8 recipes', requires: [recipes(8)] },
    { id: 'level25', at: 'upgrades', text: 'Reach level 25 in any skill', requires: [{ t: 'levelAny', n: 25 }] },
  ];
  return { stages, systems, unlocks, goals };
})();

// Objetos y orígenes. Solo lo que ya existía como hipótesis de S3: un material por estrato, que da cada veta abierta. Los quesos
// (u otros orígenes) se declaran añadiendo filas a `sources`; no se inventan tablas ni recompensas todavía (D4).
E2.BETA_DATA = {
  items: ['cheddar', 'gouda', 'brie', 'emmental', 'parmesan', 'blue'].map((id) => ({ id, kind: 'material', name: id[0].toUpperCase() + id.slice(1) + ' sample', icon: 'ic_raw_' + id })),
  sources: [{ id: 'vein', on: 'vein', item: '@stratum', n: 1 }],
  retired: {}, // id de nudo retirado -> lo que costó: se devuelve al cargar (mismo patrón que retiredNodes del juego)
};
