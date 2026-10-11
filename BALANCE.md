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
| Gouda | 6.000 | 150 | 120 | 24 |
| Blue | 1.000.000 | 800 | 240 | 60 |

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

## Despensa

No hay almacén con tope. Raw Cheese, Cheese Base y quesos se acumulan sin límite, cada tipo por separado, hasta que la etapa siguiente los usa. Lo único que limita la ausencia es la Night Lamp.

## Árboles

Coste de un nudo: `coste × crecimiento ^ rango`. El nivel indicado es el de la habilidad que hace falta.

| Árbol | Nudo | Rama | Nivel | Rangos | Coste inicial | Crecimiento | Efecto por rango |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mining | Sharper Pick | potencia | 1 | 80 | 12 | 1,3 | +1 búsqueda por golpe |
| Mining | Heavy Swing | potencia | 6 | 30 | 150 | 1,45 | críticos +0,5× |
| Mining | Miner Mouse | ratones | 2 | 15 | 100 | 2 | +1 ratón minero en cada roca |
| Mining | Quick Paws | ratones | 10 | 30 | 300 | 1,42 | mineros +10 % rápidos |
| Mining | Vein Sense | especial | 8 | 40 | 200 | 1,4 | vetas +10 % |
| Mining | Deep Riches | especial | 20 | 25 | 2.000 | 1,6 | +2 % de Raw por nivel de profundidad |
| Drilling | Bigger Bit | potencia | 1 | 100 | 18 | 1,28 | +1 Raw por ciclo |
| Drilling | Turbo Motor | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Drilling | Driller Mouse | ratones | 3 | 1 | 200 | — | automatiza todos los taladros |
| Drilling | Night Shift | ratones | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Drilling | Rich Extraction | especial | 9 | 50 | 250 | 1,38 | +6 % Raw |
| Refining | Bigger Vat | potencia | 1 | 100 | 18 | 1,28 | +1 Base por ciclo |
| Refining | Hot Furnace | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Refining | Refiner Mouse | ratones | 4 | 1 | 350 | — | automatiza la refinería |
| Refining | Twin Burners | ratones | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Refining | Double Press | especial | 9 | 50 | 250 | 1,38 | +5 % Base con el mismo Raw |
| Cheesemaking | Faster Curds | potencia | 1 | 60 | 30 | 1,33 | +8 % velocidad |
| Cheesemaking | Cheesemaker Mouse | ratones | 5 | 1 | 800 | — | cocina sola la receta elegida |
| Cheesemaking | Cheese Cellar | especial | 5 | 80 | 150 | 1,38 | +8 % valor |
| Trading | Better Prices | potencia | 1 | 80 | 40 | 1,36 | +6 % precio |
| Trading | Bigger Counter | potencia | 2 | 40 | 50 | 1,5 | +1 queso por venta |
| Trading | Shopkeeper Mouse | ratones | 3 | 1 | 500 | — | vende solo |
| Trading | Quick Sales | ratones | 5 | 40 | 100 | 1,4 | +10 % velocidad |
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

Un bot que juega sin pausas y sin dev tools (1 tap cada 0,4 s), ahorrando para cada ratón y para cada roca:

| Hito | Objetivo | Medido |
| --- | --- | --- |
| Primer ratón | 2–3 min | 2,5 min |
| Las cinco etapas automatizadas | 10–15 min | 7 min |
| Nivel 10 en una habilidad | 10 min | 8 min |
| Segunda roca | 30–45 min | 43 min |
| Nivel 25 | 1 hora | 55 min |

Niveles (Mining / Drilling / Refining / Cheesemaking / Trading) a lo largo de una partida de cuatro horas:

| Tiempo | Niveles | Rocas | Monedas ganadas |
| --- | --- | --- | --- |
| 10 min | 3 / 11 / 11 / 10 / 8 | 1 | 3,6K |
| 30 min | 11 / 19 / 18 / 16 / 13 | 1 | 9,3K |
| 1 h | 21 / 26 / 23 / 21 / 18 | 2 | 28K |
| 2 h | 33 / 34 / 28 / 26 / 23 | 2 | 62K |
| 4 h | 44 / 41 / 32 / 31 / 28 | 2 | 194K |

Estas tablas son anteriores a las líneas en paralelo. Con ellas, la primera hora no cambia; después el bot gana bastante más (759K a las 4 horas en vez de 194K) porque el Gouda ya se refina y se cocina. Por eso la tercera roca subió a 1.000.000.

Sin medir: la tercera roca (estimada entre 4 y 5 horas), el nivel 50 (estimado en 5–8 horas) y todo lo posterior.
