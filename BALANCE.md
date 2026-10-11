# Balance provisional

Todas las cifras están en `js/game/config/balance.js` y son provisionales. Se cambian en ese archivo y se recarga la página.

## Habilidades

- Niveles 1 a 99. Pasar del 1 al 2 pide 25 de experiencia; cada nivel pide un 10 % más.
- Cada nivel da +2 % de rendimiento en esa habilidad.
- Experiencia: 1 por punto de búsqueda (Mining), 2 por Raw Cheese (Drilling), 5 por Cheese Base (Refining), 12 más la raíz del valor por queso (Cheesemaking), 6 más la raíz del precio por queso vendido (Trading).

## Zonas y profundidad

| Roca | Coste | Búsqueda inicial | Veta inicial | Valor de la base |
| --- | --- | --- | --- | --- |
| Cheddar | gratis | 30 | 60 | 10 |
| Gouda | 2.500 | 150 | 120 | 24 |
| Blue | 80.000 | 800 | 240 | 60 |

Por cada nivel de profundidad: búsqueda ×1,22, veta ×1,15 y +8 % de Raw Cheese por ciclo.

## Máquinas de partida

| Etapa | Valor inicial |
| --- | --- |
| Taladro | 2 Raw cada 6 s |
| Refinería | 4 Raw → 2 Base cada 6 s |
| Quesería | 8 s por queso, más tratamiento y maduración |
| Tienda | 1 queso cada 4 s |
| Almacén | 30 Raw, 20 Base, 10 quesos |

## Árboles

Coste de un nudo: `coste × crecimiento ^ rango`. El nivel indicado es el de la habilidad que hace falta.

| Árbol | Nudo | Rama | Nivel | Rangos | Coste inicial | Crecimiento | Efecto por rango |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mining | Sharper Pick | potencia | 1 | 80 | 12 | 1,3 | +1 búsqueda por golpe |
| Mining | Heavy Swing | potencia | 6 | 30 | 150 | 1,45 | críticos +0,5× |
| Mining | Miner Mouse | ratones | 2 | 15 | 60 | 2 | +1 ratón minero en cada roca |
| Mining | Quick Paws | ratones | 10 | 30 | 300 | 1,42 | mineros +10 % rápidos |
| Mining | Vein Sense | especial | 8 | 40 | 200 | 1,4 | vetas +10 % |
| Mining | Deep Riches | especial | 20 | 25 | 2.000 | 1,6 | +2 % de Raw por nivel de profundidad |
| Drilling | Bigger Bit | potencia | 1 | 100 | 18 | 1,28 | +1 Raw por ciclo |
| Drilling | Turbo Motor | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Drilling | Driller Mouse | ratones | 3 | 1 | 150 | — | automatiza todos los taladros |
| Drilling | Night Shift | ratones | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Drilling | Rich Extraction | especial | 9 | 50 | 250 | 1,38 | +6 % Raw |
| Refining | Bigger Vat | potencia | 1 | 100 | 18 | 1,28 | +1 Base por ciclo |
| Refining | Hot Furnace | potencia | 4 | 40 | 70 | 1,4 | +8 % velocidad |
| Refining | Refiner Mouse | ratones | 3 | 1 | 150 | — | automatiza la refinería |
| Refining | Twin Burners | ratones | 12 | 30 | 400 | 1,45 | +10 % velocidad |
| Refining | Double Press | especial | 9 | 50 | 250 | 1,38 | +5 % Base con el mismo Raw |
| Cheesemaking | Faster Curds | potencia | 1 | 60 | 30 | 1,33 | +8 % velocidad |
| Cheesemaking | Cheesemaker Mouse | ratones | 3 | 1 | 250 | — | cocina sola la receta elegida |
| Cheesemaking | Cheese Cellar | especial | 5 | 80 | 150 | 1,38 | +8 % valor |
| Trading | Better Prices | potencia | 1 | 80 | 40 | 1,36 | +6 % precio |
| Trading | Bigger Counter | potencia | 2 | 40 | 50 | 1,5 | +1 queso por venta |
| Trading | Shopkeeper Mouse | ratones | 3 | 1 | 200 | — | vende solo |
| Trading | Quick Sales | ratones | 5 | 40 | 100 | 1,4 | +10 % velocidad |
| Trading | Fancy Sign | especial | 15 | 40 | 900 | 1,55 | +10 % precio |
| Colonia | Raw Silo / Base Racks / Cheese Shelves | almacén | — | 40 | 40 | 1,55 | +50 % de esa capacidad |
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

Un bot que juega sin pausas y sin dev tools, comprando siempre lo más barato:

| Hito | Bot rápido (1 tap / 0,4 s) | Bot lento (1 tap / 1,5 s) |
| --- | --- | --- |
| Primera venta | 0,8 min | 1,4 min |
| Primer ratón | 1,4 min | 2 min |
| Las cinco etapas automatizadas | 4,7 min | 5,3 min |
| Profundidad 3 | 7,5 min | 8,1 min |
| Segunda roca y nivel 25 | 31 min | 31,5 min |

Al llegar a la segunda roca el bot rápido tenía niveles 11/19/22/25/24 y 8 recetas. Una persona tardará más. El tramo posterior a la segunda roca no está medido.
