// RASGOS de los ratones, afinidades y combinaciones. Todo provisional.
//
// Tipos de rasgo (`kind`):
//   good   bueno general: de nacimiento o elegido al subir de nivel
//   quirk  manía: de nacimiento o de la casilla misteriosa
//   job    de oficio: se gana trabajando en ese oficio y solo cuenta en él;
//          tiene tres grados
//   legend legendario: ratones legendarios, 3 % en las elecciones de nivel,
//          o la casilla misteriosa
//
// Efectos (`eff`), todos se suman:
//   speed       velocidad
//   yield       cantidad por ciclo (en la tienda, monedas)
//   awaySpeed   velocidad solo mientras el jugador está fuera
//   hereSpeed   velocidad solo mientras el jugador está jugando
//   double      probabilidad de que un ciclo dé el doble
//   skillXp     experiencia de la habilidad
//   mouseXp     experiencia del propio ratón
//   jobXp       ritmo al que se especializa en un oficio
//   depthSpeed  velocidad por nivel de profundidad de su roca
//   depthYield  cantidad por nivel de profundidad de su roca
//   levelSpeed  velocidad por cada 10 niveles de la habilidad del puesto
//   crowdSpeed  velocidad por cada ratón de la colonia
//   rankSpeed   velocidad por cada rango del ratón
//   recipeYield cantidad por cada receta conocida
//   auraNext    velocidad que da al ratón del puesto siguiente de su línea
//   auraPrev    velocidad que da al ratón del puesto anterior de su línea
//   noQuirks    sus manías dejan de contar
(function () {
  const M = CM.BALANCE.mice;

  // Afinidad por oficio (como las pasiones de RimWorld): no hace al ratón el
  // mejor en eso, pero le gusta lo bastante para ir algo más rápido y, sobre
  // todo, para especializarse antes.
  M.affinity = [
    { name: '', speed: 0, learn: 1 },
    { name: 'Likes', speed: 0.07, learn: 1.5, chance: 0.28 },
    { name: 'Loves', speed: 0.15, learn: 2.5, chance: 0.12 },
  ];

  // Rasgos de nivel: uno cada 10 niveles del ratón.
  M.traitEvery = 10;
  M.traitSlots = 6;
  M.legendChance = 0.03; // cada opción ofrecida puede salir legendaria
  M.rerollLegendChance = 0.01; // al volver a tirar también, pero menos
  M.mystery = { legend: 0.06, quirk: 0.25 }; // casilla misteriosa: el resto, un rasgo bueno
  M.rerollCost = 250; // volver a tirar la primera elección
  M.rerollSlotGrowth = 6; // cada casilla siguiente cuesta x6
  M.rerollGrowth = 3; // cada tirada sobre la misma elección cuesta el triple

  // Rasgos de oficio: trabajos necesarios para cada grado y cuánto multiplica el efecto.
  M.jobGrades = [200, 2000, 20000];
  M.gradeMult = [1, 2, 3.5];
  M.jobRerollCost = 1000;

  // Topes para que ninguna suma se dispare.
  M.caps = { double: 0.9, depth: 1, aura: 0.6, crowd: 30, recipes: 60 };

  const T = (M.traits = {});
  const add = (kind, id, name, desc, eff, job) => (T[id] = { name, kind, good: kind !== 'quirk', desc, eff, job: job || '' });

  // ---------- Buenos (22) ----------
  add('good', 'fast', 'Fast', 'Works 15% faster', { speed: 0.15 });
  add('good', 'strong', 'Strong', 'Makes 20% more each time', { yield: 0.2 });
  add('good', 'nocturnal', 'Nocturnal', '50% faster while you are away', { awaySpeed: 0.5 });
  add('good', 'scholar', 'Scholar', 'Its work gives 30% more skill xp', { skillXp: 0.3 });
  add('good', 'prodigy', 'Prodigy', 'Levels up 50% faster', { mouseXp: 0.5 });
  add('good', 'earlybird', 'Early Bird', '25% faster while you are playing', { hereSpeed: 0.25 });
  add('good', 'lucky', 'Lucky', '10% chance to make double', { double: 0.1 });
  add('good', 'deepdiver', 'Deep Diver', '2% faster for each depth level of its rock', { depthSpeed: 0.02 });
  add('good', 'veteran', 'Veteran', '3% faster for every 10 levels of the skill it works', { levelSpeed: 0.03 });
  add('good', 'sociable', 'Sociable', '1% faster for each mouse in your colony', { crowdSpeed: 0.01 });
  add('good', 'mentor', 'Mentor', 'The next mouse in its line works 10% faster', { auraNext: 0.1 });
  add('good', 'cheerleader', 'Cheerleader', 'The previous mouse in its line works 10% faster', { auraPrev: 0.1 });
  add('good', 'taskmaster', 'Taskmaster', 'Both neighbours in its line work 5% faster', { auraNext: 0.05, auraPrev: 0.05 });
  add('good', 'tidy', 'Tidy', 'Makes 10% more and works 5% faster', { yield: 0.1, speed: 0.05 });
  add('good', 'focused', 'Focused', 'Specialises in a job 50% faster', { jobXp: 0.5 });
  add('good', 'sturdy', 'Sturdy', '5% faster, and 20% faster while you are away', { speed: 0.05, awaySpeed: 0.2 });
  add('good', 'quickstudy', 'Quick Study', 'Levels up 25% faster and gives 15% more skill xp', { mouseXp: 0.25, skillXp: 0.15 });
  add('good', 'heavyhands', 'Heavy Hands', 'Makes 35% more, but works 10% slower', { yield: 0.35, speed: -0.1 });
  add('good', 'wired', 'Wired', 'Works 30% faster, but makes 10% less', { speed: 0.3, yield: -0.1 });
  add('good', 'steady', 'Steady', '8% faster and makes 8% more', { speed: 0.08, yield: 0.08 });
  add('good', 'collector', 'Collector', 'Makes 1% more for each recipe you know', { recipeYield: 0.01 });
  add('good', 'ambitious', 'Ambitious', '5% faster for each rank it has earned', { rankSpeed: 0.05 });

  // ---------- Manías (13) ----------
  add('quirk', 'glutton', 'Glutton', 'Eats 8% of what it makes', { yield: -0.08 });
  add('quirk', 'dreamer', 'Dreamer', 'Works 8% slower', { speed: -0.08 });
  add('quirk', 'homebody', 'Homebody', '30% slower while you are away', { awaySpeed: -0.3 });
  add('quirk', 'shy', 'Shy', '15% slower while you are playing', { hereSpeed: -0.15 });
  add('quirk', 'clumsy', 'Clumsy', '5% slower and makes 5% less', { speed: -0.05, yield: -0.05 });
  add('quirk', 'lazy', 'Lazy', '12% slower, but levels up 20% faster', { speed: -0.12, mouseXp: 0.2 });
  add('quirk', 'stubborn', 'Stubborn', 'Specialises in a job 40% slower', { jobXp: -0.4 });
  add('quirk', 'forgetful', 'Forgetful', 'Levels up 30% slower', { mouseXp: -0.3 });
  add('quirk', 'loner', 'Loner', '1% slower for each mouse in your colony', { crowdSpeed: -0.01 });
  add('quirk', 'grumpy', 'Grumpy', 'The next mouse in its line works 8% slower', { auraNext: -0.08 });
  add('quirk', 'claustro', 'Claustrophobic', '1% slower for each depth level of its rock', { depthSpeed: -0.01 });
  add('quirk', 'fussy', 'Fussy', 'Its work gives 30% less skill xp', { skillXp: -0.3 });
  add('quirk', 'picky', 'Picky', 'Makes 15% less, but works 5% faster', { yield: -0.15, speed: 0.05 });

  // ---------- Legendarios (12) ----------
  // Raros de verdad, y enormes: uno solo viene a doblar lo que rinde el ratón.
  add('legend', 'goldenpaws', 'Golden Paws', 'Makes three times as much', { yield: 2 });
  add('legend', 'timeskipper', 'Time Skipper', 'Works twice as fast', { speed: 1 });
  add('legend', 'moonlit', 'Moonlit', 'Four times as fast while you are away', { awaySpeed: 3 });
  add('legend', 'midas', 'Midas Touch', 'Half of what it makes comes out double', { double: 0.5 });
  add('legend', 'serene', 'Serene', 'Its quirks stop counting, and it works 50% faster', { noQuirks: 1, speed: 0.5 });
  add('legend', 'genius', 'Genius', 'Levels up three times as fast and doubles the skill xp', { mouseXp: 2, skillXp: 1 });
  add('legend', 'conductor', 'Conductor', 'Both neighbours in its line work 50% faster', { auraNext: 0.5, auraPrev: 0.5 });
  add('legend', 'abyssal', 'Abyssal', '8% faster and 6% more for each depth level of its rock', { depthSpeed: 0.08, depthYield: 0.06 });
  add('legend', 'polymath', 'Polymath', 'Specialises five times as fast; 10% faster per 10 skill levels', { jobXp: 4, levelSpeed: 0.1 });
  add('legend', 'kingofmice', 'King of Mice', '8% faster for each mouse in your colony', { crowdSpeed: 0.08 });
  add('legend', 'ancient', 'Ancient', '35% faster for each rank it has earned', { rankSpeed: 0.35 });
  add('legend', 'cheesesaint', 'Cheese Saint', 'Makes 50% more, plus 5% for each recipe you know', { yield: 0.5, recipeYield: 0.05 });

  // ---------- De oficio (5 por habilidad; efecto de grado I) ----------
  const job = (skill, id, name, desc, eff) => add('job', id, name, desc, eff, skill);
  job('mining', 'pickmaster', 'Pick Master', 'Swings faster', { speed: 0.1 });
  job('mining', 'veinsniffer', 'Vein Sniffer', 'Each swing searches more', { yield: 0.15 });
  job('mining', 'rockwhisperer', 'Rock Whisperer', 'Faster the deeper the rock', { depthSpeed: 0.01 });
  job('mining', 'doublestrike', 'Double Strike', 'Chance of a double swing', { double: 0.06 });
  job('mining', 'tunnelrat', 'Tunnel Rat', 'Faster, and more so while you are away', { speed: 0.05, awaySpeed: 0.15 });
  job('drilling', 'bitexpert', 'Bit Expert', 'Drills faster', { speed: 0.1 });
  job('drilling', 'deepbore', 'Deep Bore', 'More Raw per cycle', { yield: 0.12 });
  job('drilling', 'oilhands', 'Oil Hands', 'Chance of a double cycle', { double: 0.06 });
  job('drilling', 'corekeeper', 'Core Keeper', 'More Raw the deeper the rock', { depthYield: 0.01 });
  job('drilling', 'nightdriller', 'Night Driller', 'Faster while you are away', { awaySpeed: 0.25 });
  job('refining', 'quickpress', 'Quick Press', 'Refines faster', { speed: 0.1 });
  job('refining', 'purifier', 'Purifier', 'More Base per cycle', { yield: 0.12 });
  job('refining', 'alchemist', 'Alchemist', 'Chance of a double cycle', { double: 0.06 });
  job('refining', 'foreman', 'Foreman', 'The cheesemaker after it works faster', { auraNext: 0.06 });
  job('refining', 'stoker', 'Stoker', 'A bit faster and a bit more', { speed: 0.06, yield: 0.06 });
  job('cheesemaking', 'masterchef', 'Master Chef', 'Cooks faster', { speed: 0.1 });
  job('cheesemaking', 'seasoner', 'Seasoner', 'Sometimes makes an extra cheese', { yield: 0.1 });
  job('cheesemaking', 'affineur', 'Affineur', 'Chance of a double batch', { double: 0.06 });
  job('cheesemaking', 'taster', 'Taster', 'More cheese for each recipe you know', { recipeYield: 0.004 });
  job('cheesemaking', 'brinemaster', 'Brine Master', 'Faster while you are away', { awaySpeed: 0.25 });
  job('trading', 'haggler', 'Haggler', 'Sells for more coins', { yield: 0.1 });
  job('trading', 'smoothtalker', 'Smooth Talker', 'Sells faster', { speed: 0.1 });
  job('trading', 'showman', 'Showman', 'Chance of a double sale', { double: 0.06 });
  job('trading', 'regulars', 'Regulars', 'More coins for each recipe you know', { recipeYield: 0.004 });
  job('trading', 'nightmarket', 'Night Market', 'Faster while you are away', { awaySpeed: 0.25 });

  // ---------- Combinaciones en un mismo ratón ----------
  // Se forman al reunir todos los rasgos de `needs`. Se descubren probando.
  const combo = (id, name, needs, desc, eff) => ({ id, name, needs, desc, eff });
  M.combos = [
    combo('sleepwalker', 'Sleepwalker', ['nocturnal', 'dreamer'], 'Works twice as fast while you are away', { awaySpeed: 1 }),
    combo('bigeater', 'Big Eater', ['glutton', 'strong'], '15% chance to make double', { double: 0.15 }),
    combo('jetlag', 'Jet Lag', ['nocturnal', 'homebody'], 'Cannot decide: 30% faster while you are away after all', { awaySpeed: 0.3 }),
    combo('bookworm', 'Bookworm', ['scholar', 'prodigy'], '30% more skill xp and levels up 30% faster', { skillXp: 0.3, mouseXp: 0.3 }),
    combo('speeddemon', 'Speed Demon', ['fast', 'wired'], 'Works another 25% faster', { speed: 0.25 }),
    combo('powerlifter', 'Powerlifter', ['strong', 'heavyhands'], 'Makes another 30% more', { yield: 0.3 }),
    combo('workaholic', 'Workaholic', ['fast', 'earlybird'], 'Another 25% faster while you are playing', { hereSpeed: 0.25 }),
    combo('teacher', 'Teacher', ['mentor', 'scholar'], 'The next mouse in its line works another 10% faster', { auraNext: 0.1 }),
    combo('mole', 'Mole', ['deepdiver', 'claustro'], 'Faces its fear: 3% faster for each depth level', { depthSpeed: 0.03 }),
    combo('partyanimal', 'Party Animal', ['sociable', 'cheerleader'], 'Another 1% faster for each mouse in your colony', { crowdSpeed: 0.01 }),
    combo('lonewolf', 'Lone Wolf', ['loner', 'focused'], 'Works 20% faster', { speed: 0.2 }),
    combo('lazygenius', 'Lazy Genius', ['lazy', 'prodigy'], 'No longer slow, and levels up 50% faster', { speed: 0.12, mouseXp: 0.5 }),
    combo('perfectionist', 'Perfectionist', ['picky', 'tidy'], 'Makes 30% more', { yield: 0.3 }),
    combo('goldrush', 'Gold Rush', ['lucky', 'collector'], 'Another 8% chance to make double', { double: 0.08 }),
    combo('oldhand', 'Old Hand', ['veteran', 'steady'], 'Another 3% faster for every 10 skill levels', { levelSpeed: 0.03 }),
    combo('hype', 'Hype Machine', ['cheerleader', 'mentor', 'taskmaster'], 'Both neighbours work another 10% faster', { auraNext: 0.1, auraPrev: 0.1 }),
    combo('critic', 'Cheese Critic', ['glutton', 'collector'], 'Another 1% more for each recipe you know', { recipeYield: 0.01 }),
    combo('mule', 'Mule', ['stubborn', 'focused'], 'Specialises 80% faster', { jobXp: 0.8 }),
    combo('climber', 'Social Climber', ['ambitious', 'sociable'], 'Another 5% faster for each rank', { rankSpeed: 0.05 }),
    combo('daydream', 'Daydream Chef', ['dreamer', 'masterchef'], '10% chance of a double batch', { double: 0.1 }),
    combo('stagefright', 'Stage Fright', ['shy', 'showman'], 'Sells 60% faster while you are away', { awaySpeed: 0.6 }),
    combo('treasure', 'Treasure Hunter', ['lucky', 'veinsniffer'], 'Another 10% chance of a double swing', { double: 0.1 }),
    combo('graveyard', 'Graveyard Shift', ['nocturnal', 'nightdriller'], 'Another 50% faster while you are away', { awaySpeed: 0.5 }),
    combo('jackpot', 'Jackpot', ['midas', 'lucky'], 'Another 15% chance to make double', { double: 0.15 }),
    combo('blur', 'Blur', ['timeskipper', 'fast'], 'Works another 30% faster', { speed: 0.3 }),
    combo('titan', 'Titan', ['goldenpaws', 'strong'], 'Makes another 40% more', { yield: 0.4 }),
    combo('professor', 'Absent-minded Professor', ['genius', 'forgetful'], 'Levels up another 60% faster', { mouseXp: 0.6 }),
    combo('zen', 'Zen Master', ['serene', 'grumpy'], 'Both neighbours work 20% faster', { auraNext: 0.2, auraPrev: 0.2 }),
    combo('lunatic', 'Lunatic', ['moonlit', 'nocturnal'], 'Twice as fast again while you are away', { awaySpeed: 1 }),
    combo('dynasty', 'Dynasty', ['kingofmice', 'ambitious'], 'Another 10% faster for each rank', { rankSpeed: 0.1 }),
  ];

  // ---------- Combinaciones entre vecinos de una línea ----------
  // Dos ratones en puestos seguidos de la misma roca (o el quesero y el
  // tendero), uno con el rasgo `a` y otro con el `b`. '*legend' vale por
  // cualquier ratón legendario. El efecto es para los dos. Siempre son dos
  // rasgos distintos: repetir el mismo rasgo no forma nada.
  // Efectos admitidos aquí y en las de roca: speed, yield, double, awaySpeed.
  const link = (id, name, a, b, desc, eff) => ({ id, name, a, b, desc, eff });
  M.links = [
    link('assembly', 'Assembly Line', 'fast', 'steady', 'Both work 15% faster', { speed: 0.15 }),
    link('nightcrew', 'Night Crew', 'nocturnal', 'sturdy', 'Both work 50% faster while you are away', { awaySpeed: 0.5 }),
    link('goodcop', 'Good Cop, Bad Cop', 'mentor', 'grumpy', 'Both work 20% faster', { speed: 0.2 }),
    link('apprentice', 'Master and Apprentice', 'veteran', 'prodigy', 'Both work 15% faster', { speed: 0.15 }),
    link('streak', 'Lucky Streak', 'lucky', 'ambitious', 'Both get another 10% chance to make double', { double: 0.1 }),
    link('muscle', 'Muscle', 'strong', 'heavyhands', 'Both make 20% more', { yield: 0.2 }),
    link('oddcouple', 'Odd Couple', 'tidy', 'clumsy', 'Both work 15% faster', { speed: 0.15 }),
    link('feast', 'Dinner Table', 'glutton', 'picky', 'One eats what the other leaves: both make 25% more', { yield: 0.25 }),
    link('gossip', 'Gossip', 'sociable', 'shy', 'Both work 20% faster while you are away', { awaySpeed: 0.2 }),
    link('court', 'Royal Court', '*legend', '*legend', 'Two legends side by side: both work 50% faster', { speed: 0.5 }),
  ];

  // ---------- Combinaciones de roca ----------
  // Miran a los cuatro ratones de una roca (picar, taladrar, refinar, cocinar),
  // con los cuatro puestos ocupados. El efecto es para los cuatro.
  const set = (id, name, desc, eff, test) => ({ id, name, desc, eff, test });
  M.sets = [
    set('dreamteam', 'Dream Team', 'Everyone on this rock likes their job: all work 20% faster', { speed: 0.2 }, (line) => line.every((x) => x.aff > 0)),
    set('oldguard', 'Old Guard', 'Four Masters or better on this rock: all work 30% faster', { speed: 0.3 }, (line) => line.every((x) => x.m.rank >= 2)),
    set('specialists', 'Specialists', 'All four have the speciality of their job: all make 25% more', { yield: 0.25 }, (line) => line.every((x) => x.spec)),
    set('family', 'Family Business', 'Four mice with the same fur: all work 25% faster', { speed: 0.25 }, (line) => line.every((x) => x.fur === line[0].fur)),
    set('crown', 'Under the Crown', 'A legendary mouse leads this rock: all work 10% faster', { speed: 0.1 }, (line) => line.some((x) => x.legend)),
    set('nightfactory', 'Night Factory', 'All four are better while you are away: another 50% faster then', { awaySpeed: 0.5 }, (line) => line.every((x) => x.night)),
  ];
})();
