# Balance provisional

Todas las cifras están en `js/game/config/balance.js` y son provisionales. Se cambian en ese archivo y se recarga la página.

## Habilidades

- Niveles 1 a 99. Pasar del 1 al 2 pide 25 de experiencia; cada nivel pide un 15 % más.
- Cada nivel da +2 % de rendimiento en esa habilidad.
- La experiencia se gana **por acción completada, no por unidad producida**: sacar más por ciclo da más queso, no más niveles. Base: 0,4 por golpe (Mining), 5 por ciclo de taladro, 6 por ciclo de refinado, 8 por queso cocinado, 5 por venta.
- Lo difícil da más: la experiencia se multiplica por (valor de la base ÷ 10)^0,7 y por +5 % por nivel de profundidad en minería y taladro, y por (valor de fórmula ÷ 10)^0,5 en quesería y comercio.

## Equilibrio de la cadena

Versión del 12-10-2026 (guardado v6). Todas las cifras de este documento salen de `balance.js` y de las simulaciones de esa misma versión.

**La regla: la misma ley en todas las etapas.** A igual inversión e iguales ratones, cada etapa procesa una cantidad parecida, y lo que una etapa gana en cantidad lo tiene que recibir de la anterior.

| Etapa | Por ciclo | Ciclo | Mejora de tamaño (50 monedas, x3 por rango, sin tope) |
| --- | --- | --- | --- |
| Taladro | 2 Raw | 6 s | +1 Raw |
| Refinería | 2 Base (de 4 Raw) | 6 s | +2 Base |
| Quesería | 1 queso (de 2 Base) | 6 a 9 s según receta | +1 queso por hornada |
| Tienda | 18 quesos | 2 s | +18 quesos |

- **La quesería cocina por hornadas** (More Moulds).
- **El nivel de habilidad y el ratón agrandan la tanda, y la tanda gasta lo que le toca.** En refinería y quesería, más nivel o un ratón que rinde más significa tandas mayores que consumen más Raw o más Base. Solo Double Press saca más Base del mismo Raw, y solo la suerte (rasgos de doble) da quesos de más sin gastar. Antes estas bonificaciones fabricaban producto sin materia prima y el excedente crecía sin fin.
- **La velocidad nunca se desperdicia.** Un ciclo no baja de 0,4 s; la velocidad que sobra se convierte en cantidad en ese ciclo.
- **La profundidad multiplica el valor del queso de esa roca:** x1,03 por nivel, compuesto. Cada nivel cuesta un 15 % más de búsqueda y de veta que el anterior. Así picar y taladrar rinden siempre, limiten o no.
- **Búsqueda y veta crecen igual** y todas las rocas nuevas tienen una veta tan grande como su búsqueda, así que picar y taladrar pesan lo mismo a cualquier profundidad.
- **La tienda atiende a todas las rocas.**

### Antes y después (bot, 4 h, roca Cheddar, quesos por minuto que cada etapa puede procesar)

| | Picar | Taladrar | Refinar | Cocinar |
| --- | --- | --- | --- | --- |
| Antes del rebalanceo | 196.000 | 15.200.000 | 56.000 | 67 |
| Ahora | 43.500 | 52.600 | 23.800 | 19.200 |

Ahora, en todas las rocas a las 4 h (en negrita, la etapa que limita):

| Roca | Picar | Taladrar | Refinar | Cocinar | Raw / Base en stock |
| --- | --- | --- | --- | --- | --- |
| Cheddar | 43.500 | 52.600 | 23.800 | **19.200** | 3,9 M / 721.000 |
| Gouda | 21.000 | **19.800** | 36.900 | 20.400 | 1 / 1 |
| Brie | **14.500** | 17.600 | 48.300 | 29.600 | 1 / 0 |
| Emmental | 19.400 | **12.800** | 21.600 | 28.500 | 195 / 1 |
| Parmesan | **11.500** | 11.700 | 15.600 | 12.400 | 1 / 107 |

Tienda: 128.000 frente a 110.000 que cocinan las cinco rocas.

A lo largo de 5 h, la etapa que limita es el taladro el 43 % de las veces, la quesería el 25 %, picar el 24 %, la refinería el 6 % y la tienda el 3 %.

### Cuánto rinde un ratón el doble de rápido en cada etapa

Desde la misma partida a las 4 h, sin comprar nada más, durante una hora:

| Etapa con ratones al doble | Monedas | Quesos |
| --- | --- | --- |
| Mining | +23 % | +19 % |
| Drilling | +24 % | +19 % |
| Refining | 0 % | 0 % |
| Cheesemaking | +29 % | +29 % |
| Trading | 0 % | 0 % |

En ese momento la refinería y la tienda iban sobradas; en otra partida o más adelante cambia (a las 24 h la tienda es la que limita). No hay una etapa que convenga siempre.

Sin invertir nada en una habilidad durante 4 h (medido antes de los últimos ajustes; sirve como orden de magnitud), las monedas ganadas caen entre mil y doscientas mil veces, sea cual sea la habilidad.

### Stocks a largo plazo

Mismo bot, continuando la partida. "Cobertura" es cuánto duraría el stock al ritmo de consumo de ese momento.

| | Raw por min (entra / se gasta) | Base por min | Queso por min (hecho / vendido) | Cobertura de Raw | de Base | Queso sin vender |
| --- | --- | --- | --- | --- | --- | --- |
| 4 h | 79.200 / 62.700 | 62.300 / 59.300 | 29.900 / 29.900 | 63 min | 12 min | nada |
| 8 h | 276.000 / 223.000 | 223.000 / 204.000 | 104.000 / 104.000 | 75 min | 26 min | nada |
| 12 h | 395.000 / 331.000 | 331.000 / 297.000 | 151.000 / 150.000 | 97 min | 46 min | 1 min de ventas |
| 24 h | 537.000 / 469.000 | 469.000 / 411.000 | 209.000 / 197.000 | 173 min | 135 min | 42 min de ventas |

Se consume entre el 85 % y el 95 % de lo que se produce en cada etapa. El stock crece despacio: de una a tres horas de cobertura, no días. Antes del rebalanceo, la Cheese Base acumulada a las 4 h equivalía a 46 días de consumo.

**Tienda.** La capacidad teórica de las queserías supera a la de la tienda desde las 8 h (218.000 frente a 168.000), pero lo que de verdad se fabrica lo limitan las etapas de arriba, así que la tienda vende todo hasta las 12 h. A partir de ahí empieza a quedarse queso sin vender; a las 24 h vende el 94 % de lo que se hace.

**Límite conocido.** Las mejoras de tamaño triplican su precio en cada rango. A las 24 h el bot lleva 28 o 29 rangos de cada una y el siguiente cuesta varias horas de ingresos por un 3,5 % más. La partida se frena mucho a partir de las 8 h; no hay contenido pensado para ese tramo todavía.

## Zonas y profundidad

| Roca | Coste | Búsqueda / veta iniciales | Valor de la base |
| --- | --- | --- | --- |
| Cheddar | gratis | 30 / 60 | 10 |
| Gouda | 200.000 | 150 / 150 | 24 |
| Brie | 3.000 M | 400 / 400 | 60 |
| Emmental | 1 B | 1.000 / 1.000 | 150 |
| Parmesan | 12 B | 2.500 / 2.500 | 380 |
| Blue | 80 B | 6.000 / 6.000 | 950 |

(M = millones, B = billones.) Por cada nivel de profundidad: búsqueda y veta x1,15, y valor del queso de esa roca x1,03.

## Máquinas de partida

| Etapa | Valor inicial |
| --- | --- |
| Pico | 1 de búsqueda por golpe; el ratón minero golpea cada 4,5 s |
| Taladro | 2 Raw cada 6 s |
| Refinería | 4 Raw → 2 Base cada 6 s, en cada línea |
| Quesería | 1 queso cada 6 s, más tratamiento y maduración |
| Tienda | 18 quesos cada 2 s |

## Líneas en paralelo

Cada roca abierta es una línea completa: se pica, se taladra, se refina y se cocina por separado y a la vez que las demás. Solo la tienda es común. El Cheesemaker lleva una receta por cada queso. Las mejoras de los árboles valen para todas las líneas.

## Primeros pasos

Los cuatro edificios de la cadena son gratis y los construye el jugador desde el panel de su casilla, que explica para qué sirven: el taladro al encontrar la primera veta, la refinería tras sacar 10 Raw Cheese, la quesería tras refinar 6 Cheese Base y la tienda tras descubrir la primera receta. Con el bot, la primera venta llega a 1,2 minutos (1,8 con el bot lento).

## Despensa

No hay almacén con tope. Raw Cheese, Cheese Base y quesos se acumulan sin límite, cada tipo por separado, hasta que la etapa siguiente los usa. Lo único que limita la ausencia es la Night Lamp.

## Ratones

- Reclutar: 100 monedas el primero y un 50 % más cada recluta, contando todos los que has reclutado en la partida. Despedir no baja el precio. Cubrir los 25 puestos cuesta 1,7 M en total; cada búsqueda extra sigue subiendo (el recluta 40 cuesta 1.100 M, el 60 3,7 B). Se elige entre tres candidatos.
- Aspecto: cada ratón guarda un número `look` que decide pelaje (7), gorro (5 formas × 8 colores), accesorio (5) y mochila (5): 7.000 combinaciones. No afecta al juego. El rango se ve en la ropa: bufanda azul (Journeyman), bufanda roja y medalla (Master), traje con corbata dorada (Manager).
- Rareza de cada candidato: 83 % Common, 15 % Rare (+10 % de velocidad, pelajes Mint y Lilac), 2 % Legendary (+25 %, dos rasgos buenos y ninguna manía, pelaje dorado y corona).
- Álbum: 138 piezas (10 pelajes, 6 gorros, 4 accesorios, 72 rasgos, 46 combinaciones). No se pierden al despedir. Cada pieza: +1 % al precio de venta.
- Despedir: gratis y sin reembolso, y no abarata el siguiente recluta.
- Un puesto por etapa y por roca (minería, taladro, refinado, quesería) más un tendero común: 5 con una roca, 25 con las seis.
- Velocidad en su puesto: +1 % por nivel, más rango, rareza, afinidad y rasgos (ver abajo).
- Nivel del ratón: 12 acciones para el nivel 2, un 15 % más cada nivel, máximo 60. Un golpe de minería cuenta un cuarto de acción.

| Rango | Nivel | Coste | Velocidad extra |
| --- | --- | --- | --- |
| Apprentice | 1 | — | — |
| Journeyman | 10 | 2.000 | +10 % |
| Master | 25 | 150.000 | +20 % |
| Manager | 40 | 20.000.000 | +35 %, y compra solo la mejora más barata de su oficio |

### Rasgos, afinidades y combinaciones

Todo está en `js/game/config/traits.js`: 22 rasgos buenos, 13 manías, 12 legendarios, 25 de oficio (5 por habilidad) y 30 combinaciones.

- **Afinidad:** por cada oficio, 28 % de `Likes` (+7 % de velocidad, se especializa x1,5) y 12 % de `Loves` (+15 %, x2,5). Al menos un oficio le gusta.
- **Rasgos de nivel:** uno cada 10 niveles, seis como mucho. Tres opciones; cada una tiene un 3 % de salir legendaria (1 % al volver a tirar). Casilla misteriosa: 6 % legendario, 25 % manía, el resto bueno. El juego no enseña estos porcentajes.
- **Legendarios:** pocos y enormes; uno solo viene a doblar lo que rinde el ratón (Golden Paws x3 de cantidad, Time Skipper x2 de velocidad, Midas 50 % de doble).
- **Volver a tirar:** 250 monedas la primera casilla, x6 cada casilla siguiente, x3 cada tirada sobre la misma elección. En especialidades: 1.000, x2 por tirada.
- **Especialidades:** 200, 2.000 y 20.000 trabajos; el efecto del rasgo se multiplica por 1, 2 y 3,5.
- **Combinaciones de equipo:** 10 entre vecinos de línea (siempre dos rasgos distintos: repetir el mismo no forma nada) y 6 de roca entera; dan velocidad, cantidad o suerte a todos los implicados. El tendero cuenta como vecino del quesero de cada roca.
- **Topes:** suerte de doble 90 %, auras ±60 %, colonia contada hasta 30 ratones, recetas hasta 60.
- **Velocidad:** (1 + nivel + rango + rareza + afinidad) x (1 + suma de rasgos, combinaciones, profundidad, nivel de habilidad, colonia y auras).

Las medidas con el bot están en «Equilibrio de la cadena» y «Ritmo medido». Los gerentes solo compran mejoras que cuesten hasta el 10 % de tus monedas.

## Árboles

Coste de un nudo: `coste × crecimiento ^ rango`. El nivel indicado es el de la habilidad que hace falta. La descripción es la que muestra el juego.

| Árbol | Nudo | Rama | Nivel | Rangos | Coste inicial | Crecimiento | Efecto por rango |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mining | Sharper Pick | potencia | 1 | 80 | 12 | 1,3 | +1 search power per hit |
| Mining | Heavy Swing | potencia | 6 | 30 | 150 | 1,45 | Critical hits are 0.5x stronger |
| Mining | Quick Paws | ritmo | 10 | 30 | 300 | 1,42 | The mouse mining each rock swings 10% faster |
| Mining | Vein Sense | especial | 8 | 40 | 200 | 1,4 | Every vein holds 4% more cheese |
| Mining | Deep Riches | especial | 20 | 25 | 2.000 | 1,6 | Each depth level is worth another 0.1% on that rock's cheese |
| Drilling | Bigger Bit | potencia | 1 | sin tope | 50 | 3 | +1 Raw Cheese per cycle |
| Drilling | Turbo Motor | potencia | 4 | 40 | 70 | 1,4 | Drills run 8% faster |
| Drilling | Night Shift | ritmo | 12 | 30 | 400 | 1,45 | Drills run another 10% faster |
| Drilling | Rich Extraction | especial | 9 | 50 | 250 | 1,38 | 2.5% more Raw Cheese from every cycle |
| Refining | Bigger Vat | potencia | 1 | sin tope | 50 | 3 | +2 Cheese Base per cycle |
| Refining | Hot Furnace | potencia | 4 | 40 | 70 | 1,4 | Refines 8% faster |
| Refining | Twin Burners | ritmo | 12 | 30 | 400 | 1,45 | Refines another 10% faster |
| Refining | Double Press | especial | 9 | 50 | 250 | 1,38 | 2% more Cheese Base from the same Raw |
| Cheesemaking | More Moulds | potencia | 1 | sin tope | 50 | 3 | +1 cheese per batch |
| Cheesemaking | Faster Curds | potencia | 1 | 60 | 30 | 1,33 | Cheese cooks 8% faster |
| Cheesemaking | Cheese Cellar | especial | 5 | 80 | 150 | 1,38 | Every cheese is worth 8% more |
| Trading | Better Prices | potencia | 1 | 80 | 40 | 1,36 | Sell everything for 6% more |
| Trading | Bigger Counter | potencia | 1 | sin tope | 50 | 3 | +18 cheese sold per cycle |
| Trading | Quick Sales | ritmo | 5 | 40 | 100 | 1,4 | Sales are 10% faster |
| Trading | Fancy Sign | especial | 15 | 40 | 900 | 1,55 | Another 10% on every price |
| Colonia | Night Lamp | especial | — | 10 | 500 | 2,2 | Your mice keep working 2 more hours while you are away |

El aspecto de cada edificio cambia al sumar 3, 8, 16, 30 y 50 rangos en la rama de potencia de su árbol.

## Recetas

**Valor = valor de la base × ingrediente × tratamiento × maduración × sinergias.** Después se aplican maestría, Cheese Cellar y la profundidad de la roca. El nivel de Cheesemaking ya no sube el valor: agranda la hornada.

| Componente | Multiplicador | Extra | Nivel de Cheesemaking |
| --- | --- | --- | --- |
| Herbs | ×1 | gratis | 1 |
| Pepper | ×1,3 | 2 monedas | 4 |
| Honey | ×1,7 | 10 monedas | 12 |
| Truffle | ×2,6 | 60 monedas | 25 |
| Washed | ×1 | — | 1 |
| Smoked | ×1,35 | +0,5 s | 3 |
| Brined | ×1,8 | +1 s | 16 |
| Fresh | ×1 | — | 1 |
| Aged | ×1,6 | +1 s | 8 |
| Vintage | ×2,8 | +2 s | 30 |

Una hornada tarda 6 s más los extras de la receta: de 6 a 9 s antes de mejoras y maestría.

**Cheese Lab.** Edificio propio (gratis, tras descubrir 3 recetas a mano) con un puesto de **Research**. Las recetas se investigan aparte, a la vez que la quesería produce. La primera tarda 12 s y cada una un 3 % más que la anterior (la número 50, un minuto; la 100, cuatro; la 150, 17; la 216, casi dos horas); cuesta 4 de Cheese Base más 1 por receta ya conocida. Un 15 % de los resultados sale no concluyente (repite la mitad del trabajo, una sola vez) y un 5 % es un hallazgo (la receta nace con 15 quesos de maestría). Sin ratón, cada investigación la lanza el jugador; con ratón y una **dirección** marcada (más valor, más rápida de cocinar, un queso, un ingrediente, un tratamiento o una maduración) sigue sola dentro de ella. Un encargo a mano con el laboratorio ocupado o sin Cheese Base queda apuntado como lo siguiente. Mientras el laboratorio junta su base, la quesería de ese queso solo aparta lo que cuesta esa investigación y sigue cocinando con el resto.

Rasgos de oficio de Research (grados x1 / x2 / x3,5 como los demás): Lab Rat (+10 % velocidad), Thrifty (−10 % de base por investigación), Good Nose (+4 puntos de hallazgo), Methodical (−4 puntos de no concluyente), Tinkerer (4 % de sacar una segunda receta del mismo queso). Legendario: Eureka (nunca no concluyente, +25 puntos de hallazgo). Una investigación cuenta para la especialidad por los segundos que pide (grado 1 hacia la receta 14, grado 2 hacia la 60, grado 3 hacia la 133). Combinaciones con vecinos (el investigador es vecino de queseros, refinadores y tendero): Test Kitchen (Good Nose + Seasoner, +20 %), Clean Samples (Methodical + Purifier, +15 %), Launch Party (Tinkerer + Showman, +20 %). En pantalla no se enseñan las probabilidades.

**Cepas (prototipo, solo Cheddar).** Desde Cheesemaking 10, con laboratorio e investigador, la dirección «Cheddar strains» busca cepas para la receta que cocina la línea de Cheddar (y luego para las demás de ese queso). Cultivar una cuesta lo mismo que una receta y tarda el doble. La cepa encontrada queda guardada en la receta; cuál se usa lo elige el jugador, gratis, y entra con el siguiente encargo (los quesos ya hechos se convierten sin ganar ni perder valor). El Cheesemaker compara recetas sin contar la cepa.

| Cepa | Da | Pide |
| --- | --- | --- |
| Quick-set | se cocina en la mitad de tiempo | el queso vale un 20 % menos |
| Dense | el queso vale 2,2 veces más | gasta 3 veces más Cheese Base |
| Teaching | su quesero gana 3 veces más experiencia y especialidad | el queso vale un 40 % menos |

Medido con `CM_BOT.strainReport` sobre la misma fábrica (casual, minuto 25, diez minutos por cepa, monedas ganadas):

| Situación | Sin cepa | Quick-set | Dense | Teaching |
| --- | --- | --- | --- | --- |
| Falta Cheese Base (lo normal en Cheddar) | 116.000 | 92.700 | 80.800 | 69.700 (aprende el triple) |
| Sobra Cheese Base | 912.000 | 2,0 M | 2,0 M (gasta un 35 % más de base que Quick-set) | 571.000 |
| Sobra base y la tienda no da abasto | 866.000 | 1,4 M | 1,9 M | 543.000 |

Ninguna gana en las tres. A los 120 minutos, con cuatro rocas, el Cheddar pesa poco: Teaching cuesta un 5 % de los ingresos totales y triplica lo que aprende su quesero, así que una roca vieja tiende a convertirse en escuela. Con el ciclo ya en su mínimo, Quick-set no da más experiencia que una receta sin cepa.

Sinergias: Cheddar + Smoked ×1,2; Gouda + Honey ×1,25; Brie + Truffle ×1,25; Emmental + Aged ×1,25; Parmesan + Vintage ×1,3; Blue + Brined ×1,3; Pepper + Smoked ×1,15; Truffle + Vintage ×1,4.

- Descubrir una receta cuesta 3 Cheese Base y da un queso. Fabricar una conocida cuesta 2 por queso.
- Maestría: niveles al fabricar 5, 15, 40, 100, 250, 600 y 1.500 quesos. Cada nivel da +10 % de valor y −5 % de tiempo.
- Rangos por valor: Common, Fine (30), Rare (120), Epic (500), Legendary (2.500).

## Compradores

El nivel de Trading multiplica el precio de todo: Neighbors ×1 (nivel 1), Restaurants ×1,5 (10), Collectors ×2,5 (25), Royal Court ×4 (45), Moon Embassy ×7 (70).

## Offline

Se simula el tiempo real desde el último guardado, con tope de 4 horas (ampliable con Night Lamp). Usa la misma simulación: solo producen las etapas con ratón.

## Ritmo medido

**El perfil de referencia es el jugador casual**, no el experto: toca una vez cada 1,5 s, compra mejoras cada 20 s (la más barata primero), deja de tocar cuando las cinco etapas tienen ratón, recluta al primer candidato, elige siempre el primer rasgo, investiga a mano hasta tener el Cheese Lab y luego marca «más valor» y deja al ratón de Research. Los precios de las rocas están calibrados para él.

| Hito | Casual | Experto (2,5 toques por segundo, compra cada 2 s) | Optimizando ratones |
| --- | --- | --- | --- |
| Primera venta | 1,8 min | 1,2 min | — |
| Primer ratón | 1,7 min | 1 min | — |
| Un ratón en las cinco etapas | 15 min | 8 min | — |
| Primer ascenso | 23 min | 15 min | — |
| Segunda roca | 36 min | 18 min | 18 min |
| Tercera roca | 67 min | 32 min | 28 min |
| Cuarta roca | 97 min | 77 min | 43 min |
| Quinta roca | 148 min | 120 min | 59 min |
| Sexta roca | 219 min | 181 min | 80 min |

La columna del casual está medida con el Cheese Lab como edificio (12-10-2026): va un 15 % más lento que antes porque el laboratorio pide tres recetas a mano y ocupa un ratón; las otras dos columnas son anteriores.

Casual, a lo largo de cuatro horas:

| Tiempo | Niveles (Mining / Drilling / Refining / Cheesemaking / Trading) | Rocas | Recetas | Monedas ganadas |
| --- | --- | --- | --- | --- |
| 10 min | 2 / 11 / 10 / 9 / 6 | 1 | 2 | 915 |
| 30 min | 4 / 21 / 18 / 21 / 17 | 1 | 18 | 105.000 |
| 1 h | 13 / 37 / 31 / 41 / 37 | 2 | 52 | 1.200 M |
| 2 h | 31 / 57 / 52 / 63 / 57 | 4 | 102 | 7,1 B |
| 4 h | 46 / 71 / 67 / 77 / 72 | 6 | 137 | 296 B |

**Por qué se cambió la referencia.** Con los precios anteriores, calibrados con el experto, el jugador casual sin recetas tenía a los 30 minutos unos cientos de monedas y 9.600 ganadas, y no abría la segunda roca ni en 90 minutos. La diferencia venía sobre todo de las recetas: el experto las descubría antes de automatizar y el casual no podía, porque investigar paraba la quesería.

**Aviso sobre estas medidas.** Dos partidas del bot con un cambio mínimo pueden diferir en un factor dos, porque el azar de candidatos y rasgos se desvía. Las medidas de «Equilibrio de la cadena» y «Stocks a largo plazo» son anteriores al laboratorio y a los precios nuevos de las rocas: valen para las proporciones entre etapas, no para las cifras absolutas. Con recetas buenas la quesería limita más a menudo (unas cuatro de cada cinco veces en la partida casual), por un factor entre 1 y 2.
