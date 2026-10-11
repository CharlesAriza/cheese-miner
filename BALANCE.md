# Balance provisional

Todas las cifras están en `js/game/config/balance.js` y son `PLAYTEST_DEFAULT`: valores para poder probar, no decisiones de producto. Se cambian en ese archivo y se recarga la página.

## Arranque sin monedas

Se empieza con 0 monedas. Para que el circuito sea jugable desde cero, los cuatro edificios de la cadena principal son **gratis** y se desbloquean por hitos:

| Edificio | Coste | Condición |
| --- | --- | --- |
| Cheese Drill | gratis | revelar una veta |
| Refinery | gratis | haber extraído 4 Raw Cheese |
| Cheesery | gratis | haber refinado 3 Cheese Base |
| Market | gratis | haber descubierto una receta |
| Storage | 90 | ninguna |
| Mouse House | 120 | ninguna |

El primer ingrediente (Herbs) también es gratis, y el vecino compra cualquier queso, así que la primera venta nunca exige una inversión previa.

## Minería y yacimientos

- Fuerza del pico: 1 por golpe, +1 por nivel.
- Combo manual: golpes con menos de 0,65 s entre sí; cada 5.º golpe es crítico (×3).
- Miner: un golpe cada 1,5 s, sin combo.

| Yacimiento | Coste | Vetas (progreso → Raw Cheese) | Total |
| --- | --- | --- | --- |
| Cheddar Rock | inicial | 30 → 50, 90 → 100, 150 → 150 | 300 |
| Gouda Rock | 900 | 120 → 100, 200 → 160, 280 → 220 | 480 |
| Blue Rock | — | preparado en datos, fuera de la Alpha | — |

Salvaguarda anti-bloqueo: si no queda nada que extraer, procesar ni vender, el siguiente yacimiento cuesta lo que el jugador tenga.

## Máquinas

| Máquina | Nivel 1 | Por nivel | Tap manual |
| --- | --- | --- | --- |
| Cheese Drill | 2 Raw cada 8 s | +1 Raw, duración ×0,88 | −0,25 s |
| Refinery | 4 Raw → 2 Base cada 8 s | +1 Base por ciclo, duración ×0,88 | −0,25 s |

Coste de mejora: `base × crecimiento ^ nivel`.

| Mejora | Base | Crecimiento | Nivel máximo |
| --- | --- | --- | --- |
| Pickaxe | 60 | 1,8 | 6 |
| Cheese Drill | 80 | 1,8 | 6 |
| Refinery | 80 | 1,8 | 6 |
| Storage | 200 | 2,2 | 3 |
| Mouse House | 200 | 2 | 3 |

## Almacén y camas

| Storage | Raw | Base | Lotes |
| --- | --- | --- | --- |
| Sin edificio | 20 | 12 | 6 |
| Nivel 1 | 50 | 30 | 12 |
| Nivel 2 | 100 | 60 | 20 |
| Nivel 3 | 200 | 120 | 32 |

Mouse House: 2, 3 y 4 camas en los niveles 1, 2 y 3.

## Trabajadores

Automatizan su etapa; no la aceleran. No hay salario en la Alpha.

| Rol | Coste | Máximo |
| --- | --- | --- |
| Miner | 100 | 2 |
| Driller | 180 | 1 |
| Refiner | 180 | 1 |

## Cheesery

- Experimento: 3 Cheese Base, da la receta y 1 lote de muestra.
- Lote de receta conocida: 2 Cheese Base. Hasta 5 lotes por encargo.
- Tiempo por lote: 10 s + tratamiento + maduración.

| Componente | Taste | Funk | Aroma | Extra |
| --- | --- | --- | --- | --- |
| Base Cheddar | 3 | 1 | 1 | |
| Base Gouda | 2 | 1 | 4 | |
| Herbs | 1 | 0 | 2 | gratis |
| Pepper | 2 | 1 | 0 | 3 monedas por lote |
| Washed | 0 | 3 | 1 | sin tiempo extra |
| Smoked | 1 | 1 | 2 | +6 s |
| Fresh | 1 | 0 | 1 | Value ×1 |
| Aged | 2 | 2 | 1 | +20 s, Value ×1,5 |

Sinergias: Cheddar + Smoked (+2 Taste), Gouda + Herbs (+2 Aroma), Washed + Aged (+2 Funk), Pepper + Smoked (+1 Taste, +1 Aroma).

**Value = (Taste × 3 + Funk × 2 + Aroma × 2) × multiplicador de maduración**, redondeado.

## Merchant

Tres pedidos a la vez; el primero siempre es del vecino. Tras vender o rechazar, el hueco tarda 20 s en traer otro cliente. Cada pedido exigente se genera a partir de una receta que existe con las bases abiertas (con 1 punto de margen), así que siempre es alcanzable.

| Comprador | Aparece tras | Precio | Lotes | Exige |
| --- | --- | --- | --- | --- |
| Neighbor | 0 ventas | ×0,8 (×1,25 extra si Taste ≥ 8) | 1 | nada |
| Restaurant | 2 ventas | ×1,3 | 2–3 | Taste y Aroma mínimos |
| Collector | 4 ventas | ×1,6 | 1 | Funk mínimo, solo Aged |
| Premium Client | 7 ventas | ×2 | 1–2 | Taste, Aroma y Value mínimos, solo Aged |

## Offline

- Se simula el tiempo real desde el último guardado, con tope de 4 horas.
- Ausencias de menos de 15 s no cuentan.
- Usa la misma simulación que el juego en vivo: solo producen las etapas con trabajador, y respetan vetas, materia prima y almacén.
- Un ciclo que ya estaba en marcha al salir (manual o un encargo de la Cheesery) se completa, porque sus inputs ya se consumieron.

## Ritmo medido

Un bot que juega sin pausas y sin dev tools (ver `tests.html`):

| Hito | Bot rápido (1 tap / 0,4 s) | Bot lento (1 tap / 1,5 s) |
| --- | --- | --- |
| Primera venta | 1,5 min | 2,6 min |
| Primer trabajador | 5,6 min | 9,4 min |
| Segundo yacimiento | 14,6 min | 19,6 min |
| Primer yacimiento agotado | 20,7 min | 24,4 min |
| Los tres roles contratados | 23,7 min | 27,4 min |

El bot no lee menús ni duda. Una persona tardará más: la estimación de 30–60 minutos está sin confirmar hasta hacer playtests reales.
