# Resultados de pruebas

Última ejecución: 11 de octubre de 2026, sobre la primera entrega del rediseño.

## Pruebas automáticas

Ejecutadas abriendo `tests.html` en el navegador. **19 de 19 pasan.**

| Prueba | Resultado |
| --- | --- |
| Picar revela vetas y nunca da queso ni monedas | pasa |
| El taladro necesita veta; un ciclo da Raw Cheese una vez y consume veta | pasa |
| La refinería necesita Raw Cheese; consume y produce una vez | pasa |
| Sin topes: lo guardado se acumula por tipo de queso y nada se para por falta de espacio | pasa |
| Las rocas no se agotan: la veta vacía baja de profundidad, más dura y más rica | pasa |
| Las zonas se suman: todas las rocas abiertas se pican y taladran a la vez | pasa |
| Mejorar no automatiza; el ratón automatiza pero no acelera | pasa |
| Niveles: curva de experiencia, bloqueo por nivel y comprar todo | pasa |
| Offline: solo progresa lo automatizado, con tope y una sola vez | pasa |
| Taps rápidos, recarga a mitad de ciclo y venta doble no duplican | pasa |
| Recetas: descubrir, componentes bloqueados por nivel, renombrar, fabricar, persistir | pasa |
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
- Reiniciar deja la partida a cero.
- Sin desbordamiento horizontal a 320×640 y 375×812.
- Sin errores en la consola durante todo lo anterior.

## Lo que NO está probado

- **Dispositivo real.** Solo navegador de escritorio con vista móvil emulada.
- **Sonido.** Generado sin poder escucharlo.
- **Animaciones en movimiento.** Ratones acarreando, confeti e iconos que vuelan se revisaron solo en capturas.
- **Gestos táctiles:** arrastrar la escena y mantener pulsado.
- **Importar una partida** desde la interfaz.
- **Balance tras quitar los topes.** El principio va mucho más rápido que antes y no está reajustado.
- **Juego largo.** Nada más allá de la segunda roca está medido ni jugado: no sé cómo se comporta el balance a partir de ahí.
- **Rendimiento** con muchas horas de partida y números muy grandes.

## Limitaciones conocidas

- **Las partidas anteriores no se conservan:** el modelo de datos es nuevo.
- **Arte placeholder.** Los tramos de edificio se distinguen, pero el acabado sigue siendo el de dibujo por código.
- **Los ratones aún no son personajes:** hoy un ratón es un nudo comprado en el árbol. Los rasgos, niveles y ascensos son la segunda entrega.
- **Todos los mineros pican en todas las rocas a la vez;** no se asignan.
- **La escena enseña una roca cada vez,** aunque todas trabajan. Las demás se ven en las fichas del panel.
- **La tienda vende siempre primero el queso más caro;** no se puede reservar stock.
- **Fuente pixel desde Google Fonts.** Sin conexión se usa una monoespaciada del sistema.
