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
- **Rasgos de nivel:** uno cada 10 niveles, seis como mucho, y llegan solos. Nunca una manía: un rasgo bueno (o con contrapartida, como Wired o Heavy Hands) o, con un 2 %, uno legendario. La mitad de las veces sale del grupo de un oficio que ha ejercido, elegido en proporción a sus trabajos de toda la vida (`M.jobPools`). Sin garantía ni tope de legendarios: a nivel 60, un 87 % de ratones no tiene ninguno, un 12 % tiene uno y un 0,8 % dos o más (40.000 ratones simulados, contando los nacidos Legendary).
- **Legendarios:** un ratón maduro con uno solo rinde entre x1,5 y x4 frente al mismo sin él (Golden Paws x3, Time Skipper x2, Midas x1,5, King of Mice x2,5 con 26 ratones, Cheese Saint x3 con 60 recetas, Abyssal x3 a profundidad 25 y x4 a 50). El mejor doble (Abyssal + Cheese Saint) da x8.
- **La cama de la Mouse House:** una sola. Tratar una manía cuesta 2.000 monedas y reentrenar una especialidad 5.000, cada una x3 por cada vez ya hecha en la colonia. Dura 30 minutos (también con el juego cerrado) y el ratón sigue en su puesto. Reentrenar conserva el grado.
- **Especialidades:** llegan solas a los 200 trabajos de un oficio, al azar entre las cinco; grados a los 200, 2.000 y 20.000 trabajos, que multiplican el efecto por 1, 1,75 y 2,5.
- **Combinaciones de equipo:** 10 entre vecinos de línea (siempre dos rasgos distintos: repetir el mismo no forma nada) y 6 de roca entera; dan velocidad, cantidad o suerte a todos los implicados. El tendero cuenta como vecino del quesero de cada roca.
- **Topes:** suerte de doble 90 %, auras ±60 %, colonia contada hasta 30 ratones, recetas hasta 60, profundidad +100 % de velocidad y +100 % de cantidad. En la tienda, las bonificaciones de cantidad de su ratón cuentan la mitad.
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

**Cheese Lab.** Edificio propio (gratis, tras descubrir 3 recetas a mano). Sus funciones se compran en su árbol: Research Assistant (100 monedas, abre el puesto de **Research**), Advanced Research (3.000, direcciones; pide el ayudante) y Strain Research (25.000, pide Cheesemaking 10). Eficiencia: Bunsen Burners (+8 % de velocidad por rango, 25 rangos, desde 400 x1,6) y Smaller Samples (−5 % de Cheese Base por rango, 10 rangos, desde 600 x1,8). Medido con el bot casual: laboratorio al minuto 12, ayudante en el acto, investigador al 15, direcciones al 24, cepas al 30; rocas a los 39 / 66 / 99 / 150 / 210 min (medido cada 3 min). Las recetas se investigan aparte, a la vez que la quesería produce. La primera tarda 12 s y cada una un 3 % más que la anterior (la número 50, un minuto; la 100, cuatro; la 150, 17; la 216, casi dos horas); cuesta 4 de Cheese Base más 1 por receta ya conocida. Un 15 % de los resultados sale no concluyente (repite la mitad del trabajo, una sola vez) y un 5 % es un hallazgo (la receta nace con 15 quesos de maestría). Sin ratón, cada investigación la lanza el jugador; con ratón y una **dirección** marcada (más valor, más rápida de cocinar, un queso, un ingrediente, un tratamiento o una maduración) sigue sola dentro de ella. Un encargo a mano con el laboratorio ocupado o sin Cheese Base queda apuntado como lo siguiente. Mientras el laboratorio junta su base, la quesería de ese queso solo aparta lo que cuesta esa investigación y sigue cocinando con el resto.

Rasgos de oficio de Research (grados x1 / x1,75 / x2,5 como los demás): Lab Rat (+10 % velocidad), Thrifty (−10 % de base por investigación), Good Nose (+4 puntos de hallazgo), Methodical (−4 puntos de no concluyente), Tinkerer (4 % de sacar una segunda receta del mismo queso). Legendario: Eureka (nunca no concluyente, +25 puntos de hallazgo). Una investigación cuenta para la especialidad por los segundos que pide (grado 1 hacia la receta 14, grado 2 hacia la 60, grado 3 hacia la 133). Combinaciones con vecinos (el investigador es vecino de queseros, refinadores y tendero): Test Kitchen (Good Nose + Seasoner, +20 %), Clean Samples (Methodical + Purifier, +15 %), Launch Party (Tinkerer + Showman, +20 %). En pantalla no se enseñan las probabilidades.

**Qué cocina el Cheesemaker.** Sin receta fijada, la de más potencial de su queso: precio a igual maestría y sin cepa, menos el coste del ingrediente. Antes elegía la de mayor precio del momento y en el 21 % de las mediciones seguía con una receta dominada teniendo otra mejor con maestría 1. Con el criterio nuevo, en 574 mediciones del bot casual solo una vez había otra receta mejor por segundo (un 0,6 %), y la línea cambió de receta 12 veces en dos horas.

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

**Tiempo de cálculo de una ausencia (15-10-2026).** Colonia de 26 ratones, seis rocas, 185 recetas, en un ordenador de sobremesa: 2 h en 0,7 s y 24 h en 7,9 s (antes, unos 10 s y 2 minutos). Con inventarios enormes y todas las líneas saturadas, 1 h en 0,7 s (antes 8 s). La ausencia que se simula tiene un tope de 4 h, ampliable a 24 h con Night Lamp, así que 72 h o siete días cuestan lo mismo que 24 h. El resultado es idéntico al de antes.

**Medidas con los rasgos automáticos (14-10-2026).** Las tablas de arriba son anteriores. Con el sistema nuevo, mediana y rango de varias semillas (`audit-runner.js`):

| | Casual (11 partidas) | Optimizando la colocación (12 partidas) |
| --- | --- | --- |
| Rocas 2ª a 6ª (min) | 35 / 65 / 100 / 145 / 220 | 25 / 35 / 60 / 95 / 135 |
| Rango de la 6ª roca | 180 a más de 240 (10 de 11 llegan) | 110 a 165 |
| Lo que rinde el ratón mediano a 3 h | x3,7 (3,0 a 4,3) | x4,2 (3,5 a 4,5) |
| El mejor ratón de la colonia a 3 h | x5 a x12 | x7 a x18 |
| Ratones con rasgo legendario a 4 h (casual) | 27 de 282, uno de ellos con dos | — |

Una colonia casual a las 2 h a la que se le regalan seis joyas en sus líneas (tres con dos legendarios) gana x2,7 a x3,2 la hora siguiente; con un tendero con dos legendarios de cantidad, x3,9 a x4,6 (sería x7,5 si su cantidad contara entera); con todo a la vez, x10 a x13 (x21 con la tienda entera).

**Aviso sobre estas medidas.** Dos partidas del bot con un cambio mínimo pueden diferir en un factor dos, porque el azar de candidatos y rasgos se desvía. Las medidas de «Equilibrio de la cadena» y «Stocks a largo plazo» son anteriores al laboratorio y a los precios nuevos de las rocas: valen para las proporciones entre etapas, no para las cifras absolutas. Con recetas buenas la quesería limita más a menudo (unas cuatro de cada cinco veces en la partida casual), por un factor entre 1 y 2.

## BUY ALL y el final de las mejoras (13-10-2026)

No cambia ningún precio ni multiplicador: solo el orden en que BUY ALL compra. Antes recorría los árboles en orden (Mining primero) y vaciaba cada uno antes de pasar al siguiente; ahora compra siempre lo más barato de todos. Misma partida, mismas monedas, con el botón antiguo y con el nuevo:

| Partida del bot casual | Monedas | Antes | Ahora |
| --- | --- | --- | --- |
| 10 min + 4 min sin comprar | 511 | 9 mejoras, todas de Mining | 13 mejoras en cinco habilidades |
| 45 min + 10 min sin comprar | 2,5 M | 74 mejoras (63 de Mining) | 153 mejoras en siete árboles |
| 100 min + 10 min sin comprar | 1,4 T | 11 mejoras | 15 mejoras |
| 5 h, seis rocas, + 60 min sin comprar | 6,2 Qa | 1 mejora (55 % de las monedas) | 1 mejora (55 % de las monedas) |

El bot no usa este botón (compra árbol a árbol), así que el ritmo medido no cambia.

**Problema de fondo, sin tocar.** Al final de la partida el botón no tiene qué comprar porque las mejoras se acaban, no porque falle: de las 19 mejoras con tope quedan 3 a los 90 minutos y ninguna a las 5 horas. Solo quedan las de tamaño, que triplican su precio en cada rango: a las 5 horas la más barata cuesta 1,5 veces las monedas que hay y se compra una cada 40 a 60 minutos. Los gerentes tampoco compran ahí, porque nada baja del 10 % de las monedas. El cambio mínimo que lo arreglaría es dar contenido a ese tramo (la propuesta de mejoras por hitos cada 10 rangos); está sin decidir y no se ha construido.

## Las mejoras tardaban en notarse (arreglado el 13-10-2026)

Desde el primer día, el juego recordaba el efecto total de las mejoras con un sello numérico que perdía precisión a partir de unas diez mejoras distintas compradas. Un rango nuevo de las que iban detrás (More Moulds entre ellas) no se aplicaba hasta que se compraba otra de las primeras o se recargaba la partida; por eso el árbol enseñaba «Now: 20 / Next: 20». No se perdía nada, pero llegaba tarde. Ahora cada rango cuenta al momento.

Todas las medidas anteriores de este documento se tomaron con ese retraso. Seis partidas casuales de 4 horas, mismas semillas, antes y después del arreglo:

| | Rocas 2ª a 6ª (min, mediana) | Monedas ganadas a las 4 h (mediana) |
| --- | --- | --- |
| Antes | 35 / 65 / 100 / 153 / 230 (una de seis no abre la 6ª) | 190 T |
| Después | 35 / 65 / 95 / 140 / 205 (una de seis no abre la 6ª) | 268 T |

El arranque no cambia; desde la cuarta roca va algo más rápido. No se ha reajustado ningún precio.

## Hitos de Cheesemaking: prototipo (13-10-2026)

Cifras en `B.milestones`, todas provisionales. El bot de las pruebas no compra hitos, así que el ritmo medido del juego base no cambia.

| Hito | Se abre con | Precio | Efecto |
| --- | --- | --- | --- |
| Grand Wheel | More Moulds 20 | 174 B | cada 10 min de cocinado, una rueda que vale 2 min más de esa línea |
| Cheese Board | primer objetivo de producción | 40 T | +20 % por cada tipo efectivo de más en ingredientes, tratamientos y maduraciones, según lo vendido |
| Grand Master | segundo objetivo de producción | 200 T | +10 % por grado en la roca donde cocina; grado 1 a 20.000 hornadas, otro cada vez que se doblan |

Objetivo de producción: tres horas del mejor ritmo sostenido (media de media hora, sin ruedas), redondeado a dos cifras y fijo hasta cumplirse.

Medido con el bot casual comprando cada hito en cuanto puede, 12 horas, semillas 12 y 13:

| | Se abre | Se compra |
| --- | --- | --- |
| Grand Wheel | 1 h 20 – 1 h 35 | 1 h 30 – 1 h 45 |
| Cheese Board | 2 h 05 – 2 h 40 | 2 h 35 – 3 h |
| Grand Master | 3 h 40 – 4 h 20 | 4 h 35 – 5 h 15 |

Los objetivos se cumplen en 45 a 100 minutos y no en tres horas, porque a esas alturas la producción todavía se multiplica; con la producción ya plana serían tres horas de verdad.

Lo que aporta cada uno (la misma colonia, 30 minutos con y sin el hito, a las 6 y a las 12 horas):

| Hito | Sin decidir nada | Decidiendo |
| --- | --- | --- |
| Grand Wheel | x1,09 a x1,17 | igual: no hay nada que decidir |
| Cheese Board | x1,00 (todas las rocas cocinan lo mismo) | x1,21 a x1,30 bruto alternando tratamientos; hay que restar el valor que se pierde al cocinar recetas peores |
| Grand Master | x1,00 a x1,15 (título al quesero de la roca más rica, que suele ser el más novato) | x1,04 a x1,17 (título al quesero con más oficio, movido a la roca que más vende) |

- Ruedas: unas 5 por hora y línea; entre el 16 % y el 19 % de producción extra (no llega al 20 % porque las líneas no cocinan todo el tiempo).
- Monedas a las 12 horas: 23,6 y 30,0 Qa con hitos sin decidir, 33,3 y 24,4 Qa decidiendo, 29,9 y 25,6 Qa sin hitos. La diferencia entre partidas es mayor que el efecto: no cambia la economía de forma apreciable.
- Tienda: en una de las dos semillas, con hitos se acumularon entre 2,6 y 4,3 millones de quesos sin vender (sin hitos, unos cientos). Más queso aprieta a Trading.
- Cheese Board, cálculo aparte sobre cuatro colonias: el mejor reparto solo cambia tratamientos (cambiar ingrediente o maduración cuesta un 35 % y un 43 % del valor de esa roca y no compensa), y poner recetas flojas en las tres rocas más pobres pierde entre un 17 % y un 26 %.
