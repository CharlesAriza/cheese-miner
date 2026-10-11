# CHEESE MINER — contrato del proyecto

Sustituye al handoff de la Internal Playtest Alpha. Recoge la visión acordada con el propietario el 11 de octubre de 2026.

## Qué es

Un **clicker idle incremental** de ratones queseros, pensado para echarle muchas horas. Referencias, por este orden de peso:

- **Melvor Idle:** cada mecánica es una habilidad con nivel y maestría; todo progresa también sin estar delante.
- **Legends of Idleon:** muchos sistemas enlazados y ratones como personajes que trabajan en paralelo; estética pixel art lateral.
- **Cookie Clicker:** números que explotan, mejoras por tramos, reinicio con ventaja.

Shop Titans deja de ser referencia.

## Reglas que no se tocan

1. **El bucle:** picar revela vetas → el taladro extrae Raw Cheese → la refinería hace Cheese Base → la quesería hace quesos → la tienda los vende. Picar nunca da queso ni monedas.
2. **Nada se pierde.** Las rocas no se agotan (bajan de profundidad), las zonas se suman y producen a la vez. Un revés da menos; no quita lo conseguido.
3. **Primero a mano, luego un ratón.** Cada etapa se juega tocando hasta que se compra su ratón, que la lleva sola.
4. **Tocar es un extra, no una obligación.** El juego avanza solo; el juego activo da empujones y premios puntuales.
5. **La progresión se ve.** Toda mejora cambia algo en pantalla: el edificio, la roca, el pueblo, el trasiego de ratones.
6. **Claridad antes que adorno.** En pantalla solo se mueve lo que el jugador puede explicar. Un ratón solo aparece trabajando o acarreando si está contratado. Mejor una animación de menos que una que confunda.
7. **Todo es exponencial.** Costes y producción crecen en curva; los números se abrevian.
8. **Fuera lo que no sirva a largo plazo.** Si una mecánica no va a dar horas de juego o va a confundir, se quita, aunque ya esté hecha.

## Cómo se trabaja

- **Siempre proponer antes de construir.** Las decisiones de diseño las plantea Claude con una recomendación y las aprueba el propietario.
- **Interfaz en inglés; documentación y conversación en español.**
- **Sin compilación:** HTML, CSS y JavaScript puros, publicables tal cual en GitHub Pages. El equipo de desarrollo no tiene Node.
- **Simulación separada del render,** por pasos de tiempo fijos. La economía nunca depende de frames ni de efectos visuales. Acciones atómicas: nada se cobra ni se entrega dos veces.
- **Balance centralizado** en `js/game/config/balance.js`, siempre provisional.
- **Pruebas en el navegador** (`tests.html`). No afirmar que algo está probado si no se ha ejecutado.
- **Arte por código, sustituible.** Cada pieza dibujada está marcada con `SPRITE:` para poder cambiarla por un PNG.
- **Sin** monetización, compras, multijugador, combate ni analítica externa.

## Estado: primera entrega (cimientos)

Hecho:

- Cinco habilidades (Mining, Drilling, Refining, Cheesemaking, Trading) con nivel 1–99.
- Un árbol por habilidad con tres ramas (potencia, ratones, especial) y uno de colonia (horas offline).
- Despensa sin tope, estilo banco de Melvor: cada recurso y cada receta en su fila.
- Rocas con profundidad sin fin y tres zonas (Cheddar, Gouda, Blue). Cada zona es una línea completa (minería, taladro, refinado y cocinado) que trabaja en paralelo a las demás; solo la tienda es común.
- Recetas de cuatro componentes con un único valor, rango y maestría; 108 combinaciones.
- Venta por ciclos; el nivel de Trading trae mejores compradores.
- Edificios con seis aspectos según sus mejoras, subsuelo que baja con la profundidad de la roca (capas, pozo, carteles, montacargas), pueblo que crece y ratones que acarrean.
- Primeros pasos a fuego lento: cada edificio de la cadena llega con una tarjeta que explica por qué aparece y lo construye el jugador. Compra rápida de mejoras desde cada etapa, «BUY ALL» global y Cheesemaker que elige la mejor receta.
- Progreso offline con la misma simulación.

Quitado respecto a la Alpha: almacén con capacidad, regateo, clientes con paciencia, Taste/Funk/Aroma, reputación, viajar entre zonas, rocas que se agotan y Mouse House con camas.

## Siguientes entregas (acordadas, sin construir)

2. **Ratones como personajes:** nombre, rasgos, nivel propio, ascensos, asignación a estaciones. Maestría también por base.
3. **Juego activo y largo plazo:** queso dorado, logros con porcentaje permanente y reinicio como franquicia.

Ideas del propietario para más adelante: una mecánica nueva por zona (envíos al mundo, teletransporte, cohetes a la luna), edificios disparatados al fondo de cada árbol (máquina del tiempo, pacto infernal), tienda por dentro e interfaz de recetas más física.
