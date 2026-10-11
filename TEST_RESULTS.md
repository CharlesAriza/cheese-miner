# Resultados de pruebas

Última ejecución: 11 de octubre de 2026, sobre la primera entrega del rediseño.

## Pruebas automáticas

Ejecutadas abriendo `tests.html` en el navegador. **27 de 27 pasan.**

| Prueba | Resultado |
| --- | --- |
| Picar revela vetas y nunca da queso ni monedas | pasa |
| El taladro necesita veta; un ciclo da Raw Cheese una vez y consume veta | pasa |
| La refinería necesita Raw Cheese; consume y produce una vez | pasa |
| Sin topes: lo guardado se acumula por tipo de queso y nada se para por falta de espacio | pasa |
| Las rocas no se agotan: la veta vacía baja de profundidad, más dura y más rica | pasa |
| Las zonas se suman: todas las rocas abiertas se pican y taladran a la vez | pasa |
| Mejorar no automatiza; un ratón en el puesto sí, y solo en su roca | pasa |
| Ratones: reclutar, candidatos que no cambian al recargar, colocación automática | pasa |
| Ratones: rasgos, oficio favorito, niveles y ascensos cambian cómo trabajan | pasa |
| Ratones: mover, intercambiar, descansar y BEST FIT | pasa |
| Ratones: el gerente compra mejoras de su oficio, solo si se le permite | pasa |
| Ratones: cada uno tiene su propio aspecto, y los guardados antiguos reciben uno | pasa |
| Niveles: curva de experiencia, bloqueo por nivel y comprar todo | pasa |
| Offline: solo progresa lo automatizado, con tope y una sola vez | pasa |
| Taps rápidos, recarga a mitad de ciclo y venta doble no duplican | pasa |
| Recetas: descubrir, componentes bloqueados por nivel, renombrar, fabricar, persistir | pasa |
| Líneas en paralelo: un queso escaso se refina y se cocina aunque otro tenga mucho más Raw | pasa |
| Los edificios de la cadena esperan al jugador, en orden; el Cheesemaker elige la receta más valiosa | pasa |
| Valor del queso: fórmula, sinergias, maestría, bodega y nivel de Trading | pasa |
| Cheesemaker y Shopkeeper llevan solos el final de la cadena, dentro de sus límites | pasa |
| La automatización solo espera por lo que le falta, nunca por espacio | pasa |
| Guardar y cargar mantiene el estado; guardados dañados o antiguos empiezan limpios | pasa |
| Las recompensas por objetivo se pagan una vez, y nunca por picar | pasa |
| Las dev tools marcan la partida y no rompen invariantes | pasa |
| Una partida nueva llega a automatización total, profundidad 3 y segunda roca sin dev tools | pasa |
| Un jugador lento también llega | pasa |

Las dos últimas las juega un bot que solo usa las acciones del jugador y comprueba los invariantes cada 5 segundos de simulación.

## Comprobaciones manuales en el navegador

Hechas sobre el juego real, pulsando los controles:

- Desde cero: veta → construir taladro → Raw → refinería → Base → quesería → descubrir receta → tienda → venta.
- Árbol de Refining: se abre desde el panel, compra un nudo y descuenta las monedas.
- Contratar a los cinco ratones y asignar receta: la cadena produce y vende sola.
- Subidas de nivel: aviso, confeti y mensaje de lo desbloqueado.
- Abrir la segunda roca: explicación, fichas de roca en el panel y cambio de paisaje.
- Aspectos de edificios: con la rama de potencia subida cambian taladro, refinería, almacén, quesería y tienda; aparece el pozo de la roca y crece el pueblo del fondo.
- Claridad de animaciones: taladrando a mano no aparece ningún ratón acarreando; con los ratones contratados, cada uno sale de su puesto con el producto y vuelve.
- Despensa: una fila por tipo de Raw, de Base y por receta, con sus cantidades; se abre desde PANTRY o tocando un contador.
- Árboles: cada nudo enseña el valor actual y el siguiente en unidades reales.
- El edificio del almacén ya no cambia de tamaño ni pisa a los vecinos; apila cajas según lo guardado.
- Líneas: con tres rocas abiertas el Blue se refina aunque haya 900 de Raw de Cheddar; cada fila enseña sus cantidades, sus barras y por qué está parada («No Blue recipe chosen»); al tocar una fila cambian escena y contadores.
- Repaso de interfaz: al encontrar la veta se anuncia el taladro, su casilla marca NEW! y se construye desde su panel; lo mismo con la refinería al llegar a 10 de Raw; la compra rápida y BUY ALL compran y descuentan; descubrir una receta no abre ventana; con la veta a la vista el botón de la roca taladra.
- Subsuelo: a profundidad 13 y 27 cambian las capas, el pozo llega al fondo con su cartel y aparece el montacargas.
- Ratones: aviso de la Mouse House, construirla desde MICE, reclutar y elegir entre tres, colocación automática en la tienda y luego taladro, refinado, quesería y minería; mover con intercambio; ascender a Journeyman (cambia el gorro y la velocidad); BEST FIT; la plantilla se conserva al recargar y la cadena produce sola.
- Reiniciar deja la partida a cero.
- Sin desbordamiento horizontal a 320×640 y 375×812.
- Sin errores en la consola durante todo lo anterior.

## Lo que NO está probado

- **Dispositivo real.** Solo navegador de escritorio con vista móvil emulada.
- **Sonido.** Generado sin poder escucharlo.
- **«Faltan N minutos» en los botones de compra.** Depende del ritmo de ingresos del último minuto; no lo vi con datos reales, solo vacío al empezar.
- **Animaciones en movimiento.** Ratones acarreando, confeti e iconos que vuelan se revisaron solo en capturas.
- **Gestos táctiles:** arrastrar la escena y mantener pulsado.
- **Importar una partida** desde la interfaz.
- **Balance tras quitar los topes.** El principio va mucho más rápido que antes y no está reajustado.
- **Juego largo.** Nada más allá de la segunda roca está medido ni jugado: no sé cómo se comporta el balance a partir de ahí.
- **Rendimiento** con muchas horas de partida y números muy grandes.

## Limitaciones conocidas

- **Las partidas anteriores no se conservan:** el modelo de datos es nuevo.
- **Arte placeholder.** Los tramos de edificio se distinguen, pero el acabado sigue siendo el de dibujo por código.
- **Los rangos Master y Manager** solo están cubiertos por pruebas; no los alcancé jugando.
- **Elegir entre candidatos** no está medido: el bot siempre coge el primero.
- **Las partidas de la versión anterior se convierten** al cargar; está cubierto por una prueba, no probado con una partida real larga.
- **La escena enseña una roca cada vez,** aunque todas trabajan. Las demás se ven en las fichas del panel.
- **La tienda vende siempre primero el queso más caro;** no se puede reservar stock.
- **Fuente pixel desde Google Fonts.** Sin conexión se usa una monoespaciada del sistema.
