# Balance provisional

Todas las cifras están en `js/game/config/balance.js` y son provisionales. Se cambian en ese archivo y se recarga la página.

## Habilidades

- Niveles 1 a 99. Pasar del 1 al 2 pide 25 de experiencia; cada nivel pide un 15 % más.
- Cada nivel da +2 % de rendimiento en esa habilidad.
- La experiencia se gana **por acción completada, no por unidad producida**: sacar más por ciclo da más queso, no más niveles. Base: 0,4 por golpe (Mining), 5 por ciclo de taladro, 6 por ciclo de refinado, 8 por queso cocinado, 5 por venta.
- Lo difícil da más: la experiencia se multiplica por (valor de la base ÷ 10)^0,7 y por +5 % por nivel de profundidad en minería y taladro, y por (valor de fórmula ÷ 10)^0,5 en quesería y comercio.

## Zonas y profundidad

| Roca | Coste | Búsqueda inicial | Veta inicial | Valor de la base |
| --- | --- | --- | --- | --- |
| Cheddar | gratis | 30 | 60 | 10 |
| Gouda | 15.000 | 150 | 120 | 24 |
| Brie | 1.200.000 | 800 | 240 | 60 |
| Emmental | 60.000.000 | 4.000 | 480 | 150 |
| Parmesan | 700.000.000 | 20.000 | 960 | 380 |
| Blue | 12.000.000.000 | 100.000 | 1.920 | 950 |

Con el bot (12-10-2026), un jugador que no optimiza abre las rocas a los 36, 66, 124, 164 y 265 minutos; uno que optimiza sus ratones, a los 38, 64, 92, 114 y 170.

Por cada nivel de profundidad: búsqueda ×1,22, veta ×1,15 y +8 % de Raw Cheese por ciclo.

## Máquinas de partida

| Etapa | Valor inicial |
| --- | --- |
| Taladro | 2 Raw cada 6 s |
| Refinería | 4 Raw → 2 Base cada 6 s, en cada línea |
| Quesería | 8 s por queso, más tratamiento y maduración |
| Tienda | 1 queso cada 4 s |

## Líneas en paralelo

Cada roca abierta es una línea completa: se pica, se taladra, se refina y se cocina por separado y a la vez que las demás. Solo la tienda es común. El Cheesemaker lleva una receta por cada queso. Las mejoras de los árboles valen para todas las líneas.

## Primeros pasos

Los cuatro edificios de la cadena son gratis y los construye el jugador desde el panel de su casilla, que explica para qué sirven: el taladro al encontrar la primera veta, la refinería tras sacar 10 Raw Cheese, la quesería tras refinar 6 Cheese Base y la tienda tras descubrir la primera receta. Con el bot, la primera venta llega a 1,2 minutos (1,8 con el bot lento).

## Despensa

No hay almacén con tope. Raw Cheese, Cheese Base y quesos se acumulan sin límite, cada tipo por separado, hasta que la etapa siguiente los usa. Lo único que limita la ausencia es la Night Lamp.

## Ratones

- Reclutar: 150 monedas el primero, cada uno un 80 % más que el anterior. Se elige entre tres candidatos.
- Aspecto: cada ratón guarda un número `look` que decide pelaje (7), gorro (5 formas × 8 colores), accesorio (5) y mochila (5): 7.000 combinaciones. No afecta al juego. El rango se ve en la ropa: bufanda azul (Journeyman), bufanda roja y medalla (Master), traje con corbata dorada (Manager).
- Rareza de cada candidato: 83 % Common, 15 % Rare (+10 % de velocidad, pelajes Mint y Lilac), 2 % Legendary (+25 %, dos rasgos buenos y ninguna manía, pelaje dorado y corona).
- Álbum: 138 piezas (10 pelajes, 6 gorros, 4 accesorios, 72 rasgos, 46 combinaciones). No se pierden al despedir. Cada pieza: +1 % al precio de venta.
- Despedir: gratis y sin reembolso. El precio de reclutar depende de cuántos ratones tienes, así que despedir abarata el siguiente (cambiar un ratón cuesta lo que costó su hueco).
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

Medido el 12-10-2026 con dos bots: uno elige siempre la primera opción; el otro optimiza rasgos, candidatos y colocación. Con seis rocas, a las 4 h el primero ha ganado 23,9 MM y el segundo 214 MM (unas nueve veces más), con ratones que rinden entre x5 y x14. Los gerentes solo compran mejoras que cuesten hasta el 10 % de tus monedas, para no gastarse lo que ahorras para la siguiente roca. Sin partidas reales todavía.

## Árboles

Coste de un nudo: `coste × crecimiento ^ rango`. El nivel indicado es el de la habilidad que hace falta.

| Árbol | Nudo | Rama | Nivel | Rangos | Coste inicial | Crecimiento | Efecto por rango |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mining | Sharper Pick | potencia | 1 | 80 | 12 | 1,3 | +1 búsqueda por golpe |
| Mining | Heavy Swing | potencia | 6 | 30 | 150 | 1,45 | críticos +0,5× |
| Mining | Quick Paws | ritmo | 10 | 30 | 300 | 1,42 | mineros +10 % rápidos |
| Mining | Vein Sense | especial | 8 | 40 | 200 | 1,4 | vetas +10 % |
| Mining | Deep Riches | especial | 20 | 25 | 2.000 | 1,6 | +2 % de Raw por nivel de profundidad |
| Drilling | Bigger Bit | potencia | 1 | 100 | 18 | 1,28 | +1 Raw por ciclo |
| Drilling | Turbo Motor | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Drilling | Night Shift | ritmo | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Drilling | Rich Extraction | especial | 9 | 50 | 250 | 1,38 | +6 % Raw |
| Refining | Bigger Vat | potencia | 1 | 100 | 18 | 1,28 | +1 Base por ciclo |
| Refining | Hot Furnace | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Refining | Twin Burners | ritmo | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Refining | Double Press | especial | 9 | 50 | 250 | 1,38 | +5 % Base con el mismo Raw |
| Cheesemaking | Faster Curds | potencia | 1 | 60 | 30 | 1,33 | +8 % velocidad |
| Cheesemaking | Cheese Cellar | especial | 5 | 80 | 150 | 1,38 | +8 % valor |
| Trading | Better Prices | potencia | 1 | 80 | 40 | 1,36 | +6 % precio |
| Trading | Bigger Counter | potencia | 2 | 40 | 50 | 1,5 | +1 queso por venta |
| Trading | Quick Sales | ritmo | 5 | 40 | 100 | 1,4 | +10 % velocidad |
| Trading | Fancy Sign | especial | 15 | 40 | 900 | 1,55 | +10 % precio |
| Colonia | Night Lamp | especial | — | 10 | 500 | 2,2 | +2 horas offline |

El aspecto de cada edificio cambia al sumar 3, 8, 16, 30 y 50 rangos en la rama de potencia de su árbol.

## Recetas

**Valor = valor de la base × ingrediente × tratamiento × maduración × sinergias.** Después se aplican maestría, Cheese Cellar y nivel de Cheesemaking.

| Componente | Multiplicador | Extra | Nivel de Cheesemaking |
| --- | --- | --- | --- |
| Herbs | ×1 | gratis | 1 |
| Pepper | ×1,3 | 2 monedas | 4 |
| Honey | ×1,7 | 10 monedas | 12 |
| Truffle | ×2,6 | 60 monedas | 25 |
| Washed | ×1 | — | 1 |
| Smoked | ×1,35 | +4 s | 3 |
| Brined | ×1,8 | +9 s | 16 |
| Fresh | ×1 | — | 1 |
| Aged | ×1,6 | +12 s | 8 |
| Vintage | ×2,8 | +45 s | 30 |

Sinergias: Cheddar + Smoked ×1,2; Gouda + Honey ×1,25; Blue + Brined ×1,3; Pepper + Smoked ×1,15; Truffle + Vintage ×1,4.

- Descubrir una receta cuesta 3 Cheese Base y da un queso. Fabricar una conocida cuesta 2.
- Maestría: niveles al fabricar 5, 15, 40, 100, 250, 600 y 1.500 quesos. Cada nivel da +10 % de valor y −5 % de tiempo.
- Rangos por valor: Common, Fine (30), Rare (120), Epic (500), Legendary (2.500).

## Compradores

El nivel de Trading multiplica el precio de todo: Neighbors ×1 (nivel 1), Restaurants ×1,5 (10), Collectors ×2,5 (25), Royal Court ×4 (45), Moon Embassy ×7 (70).

## Offline

Se simula el tiempo real desde el último guardado, con tope de 4 horas (ampliable con Night Lamp). Usa la misma simulación: solo producen las etapas con ratón.

## Ritmo medido

Un bot que juega sin pausas y sin dev tools (1 tap cada 0,4 s), que recluta al primer candidato, asciende cuando puede y ahorra para cada ratón y cada roca:

| Hito | Objetivo | Medido |
| --- | --- | --- |
| Primera venta | — | 1,2 min |
| Primer ratón | 2–3 min | 2,1 min |
| Un ratón en las cinco etapas | 10–15 min | 12,8 min |
| Primer ascenso | — | 19,6 min |
| Segunda roca | 30–45 min | 41 min |
| Nivel 25 en una habilidad | 1 hora | unos 60 min |

Niveles (Mining / Drilling / Refining / Cheesemaking / Trading) a lo largo de cuatro horas:

| Tiempo | Niveles | Rocas | Recetas | Monedas ganadas |
| --- | --- | --- | --- | --- |
| 10 min | 5 / 10 / 11 / 10 / 8 | 1 | 8 | 3,1K |
| 30 min | 13 / 17 / 19 / 18 / 13 | 1 | 8 | 9,5K |
| 1 h | 22 / 24 / 25 / 25 / 20 | 2 | 26 | 43K |
| 2 h | 36 / 35 / 40 / 38 / 33 | 2 | 26 | 5,3M |
| 4 h | 48 / 39 / 50 / 48 / 44 | 2 | 26 | 66M |

Entre la primera y la segunda hora los ingresos se multiplican por más de cien: es cuando el Gouda y los ingredientes caros entran en juego. Por eso la tercera roca cuesta 150 millones; el bot no llega a ella en cuatro horas (estimado: unas cinco).

Sin medir: la tercera roca, el nivel 50 y todo lo posterior. El bot se queda con el primer candidato y no elige rasgos, así que una persona que elija bien irá algo por delante.
