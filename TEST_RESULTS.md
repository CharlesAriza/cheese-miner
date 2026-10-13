# Resultados de pruebas

Última ejecución: 13 de octubre de 2026, con el refuerzo de Refining que da más Base y el rediseño visual de los refuerzos (51 de 51). Ejecutadas en el navegador (`tests.html`) y fuera de él (`sim-headless.js`), con el mismo resultado.

## Pruebas automáticas

Ejecutadas abriendo `tests.html` en el navegador. **51 de 51 pasan** (también tras arreglar la caché de efectos de las mejoras; la prueba de BUY ALL comprueba ahora que cada rango nuevo se nota al momento).

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
| Ratones: despedir, aviso de BEST FIT y motivo por el que un ratón no asciende | pasa |
| Ratones: rarezas y álbum que sube el precio de venta para siempre | pasa |
| Rasgos: los ratones los desarrollan solos, según lo que han trabajado | pasa |
| Datos de la pantalla MICE: rendimiento en solitario y en el puesto, intercambio y diario de la colonia | pasa |
| Cama de la Mouse House: tratar una manía o reentrenar una especialidad sin dejar el puesto | pasa |
| Rasgos: afinidad, especialidades con grados, combinaciones, auras y suerte | pasa |
| Combinaciones de equipo: vecinos de una línea y los cuatro ratones de una roca | pasa |
| Los ratones clonados de partidas antiguas pasan a ser distintos, conservando lo ganado | pasa |
| Cheese Lab: edificio propio, puesto de Research y dirección elegida por el jugador | pasa |
| Cepas: otra manera de hacer el mismo queso, encontrada por el investigador y elegida por el jugador | pasa |
| Ratones: cada uno tiene su propio aspecto, y los guardados antiguos reciben uno | pasa |
| Niveles: curva de experiencia, bloqueo por nivel y comprar todo | pasa |
| Offline: el camino rápido, el lento y la puesta al día a trozos dan exactamente la misma partida | pasa |
| Offline: solo progresa lo automatizado, con tope y una sola vez | pasa |
| Taps rápidos, recarga a mitad de ciclo y venta doble no duplican | pasa |
| Recetas: descubrir, componentes bloqueados por nivel, renombrar, fabricar, persistir | pasa |
| Líneas en paralelo: un queso escaso se refina y se cocina aunque otro tenga mucho más Raw | pasa |
| Los edificios de la cadena esperan al jugador, en orden; el Cheesemaker elige la receta más valiosa | pasa |
| Valor del queso: fórmula, sinergias, maestría, bodega y nivel de Trading | pasa |
| Cheesemaker y Shopkeeper llevan solos el final de la cadena, dentro de sus límites | pasa |
| La automatización solo espera por lo que le falta, nunca por espacio | pasa |
| BUY ALL: recorre todos los árboles de más barato a más caro, dice antes lo que comprará y nunca cobra dos veces | pasa |
| Ratones: varios ascensos de una vez cuestan y hacen exactamente lo mismo que uno a uno (1, 5, 15 y 26 ratones; rangos acumulados; selección parcial; sin monedas; selección vieja) | pasa |
| Hitos: se abren por un rango o por un objetivo de producción, y solo los compra el jugador (ni BUY ALL ni los gerentes); el objetivo queda fijo, usa el ritmo sostenido, las ruedas no lo inflan y producir menos no lo abarata | pasa |
| Grand Wheel: una cada diez minutos de cocinado, vale dos más, no gasta Base ni monedas y mantiene la cadencia con una cepa más rápida | pasa |
| Cheese Board: paga por una mezcla real de ventas; un tipo que apenas vende apenas cuenta; el bono de una venta es el que había antes de ella | pasa |
| Grand Master: un solo título, que da el jugador; vale según lo cocinado por ese ratón y solo mientras cocina; pasa a otro sin perder experiencia | pasa |
| Refuerzos: velocidad de más para el puesto que elige el jugador, dos por puesto, nunca se pierden (colocar, quitar, mover, producción real, guardados dañados y partidas anteriores) | pasa |
| Refuerzos: en una refinería dan más Base del mismo Raw, no velocidad (cero, uno y dos; mismo Raw, mismas hornadas y misma experiencia; con afinidad encima; nada a mano sin ratón; mover a otra etapa; guardar y cargar a media hornada; capacidad) | pasa |
| Refuerzos: las pistas marcan también la refinería cuando a la roca le falta Base, y dejan de hacerlo con dos refuerzos, con Base de sobra o sin refinador | pasa |
| Refuerzos: con todas las rocas abiertas se ganan cocinando, también en una ausencia de 4 horas con un objetivo en curso, una sola vez | pasa |
| Mining: Blasting Charges se abre cuando Sharper Pick llega a su último rango y no se acaba | pasa |
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

### Panel inferior, BUY ALL y ascensos (13-10-2026)

Medido en el navegador con vista móvil emulada, con el juego a velocidad ×20 y pasando por las cinco etapas (unas 300 a 400 lecturas por medida del alto y la posición de cada bloque):

| Vista | Partida | Resultado |
| --- | --- | --- |
| 360×740 | 45 min, 2 rocas | ningún bloque cambia de alto ni de posición (antes el panel iba de 234 a 292 px y la escena de 222 a 279) |
| 320×640 | 5 h, 6 rocas | ningún bloque cambia; el panel se compacta y cabe sin desplazarse |
| 375×812 | 100 min, 3 rocas | ningún bloque cambia |
| escritorio (1024×768) | 5 h, 6 rocas | ningún bloque cambia |
| 390×844 | partida nueva | solo revisión visual (Mining y un edificio sin construir) |

Lo único que se mueve es el botón grande cuando late para pedir un toque, que es una animación a propósito.

- BUY ALL: con 38 monedas anuncia «2 · 36», compra esas dos y cobra 36; un doble toque no cobra de más; sin nada que comprar enseña la siguiente mejora y su precio.
- Ascensos: con 21 ratones listos, SELECT ALL y NONE no compran; quitar una fila y elegir un rango más bajo cambian el total; tres toques seguidos en PROMOTE cobran una sola vez (361.968.000, lo mismo que suma la lista) y sale un único aviso.
- Sin errores en la consola.
- Marcador: a 320×640 con cifras de final de partida («+107T/min», «+58.5K») ningún número se corta y el alto del marcador no cambia (57 px). La unidad «per min» de los tres contadores de la roca va una vez, en su etiqueta.

No comprobado aquí: 375 y 390 px con partidas largas más allá de lo indicado, y ningún teléfono real.

### Hitos de Cheesemaking (13-10-2026)

En el navegador, a 360×740, sobre partidas preparadas:

- Con More Moulds 20 se anuncia Grand Wheel, la casilla CHEESE marca NEW! y el botón UPGRADES dice MILESTONE!; BUY ALL no lo compra.
- Comprar cada hito abre su explicación. Los tres se compran desde la rama MILESTONES del árbol.
- Objetivo de producción: el árbol enseña «1383 / 5.8M cheese cooked» con su barra y el tiempo estimado.
- Grand Wheel: a velocidad ×20 sale el aviso «GRAND WHEEL! +122K CHEDDAR» dentro de la escena, sin tapar el marcador, y la Cheesery cuenta atrás hasta la siguiente.
- Cheese Board: la tarjeta de la Cheesery enseña el reparto de ventas por familia y el bono.
- Grand Master: nombrar a un ratón desde su ficha le pone la estrella en el retrato, y el panel inferior dice su grado.

Validación interactiva posterior (mismo día, 360×740, partidas del bot cargadas en el juego a las 2, 6 y 12 horas, a velocidad ×20 por tramos):

- Al comprar Grand Wheel ya no aparece después el aviso «is waiting»: salen «NEW MILESTONE: GRAND WHEEL» y «GRAND WHEEL UNLOCKED!».
- Con 5 rocas, en 13 minutos de juego: 2 franjas de Grand Wheel (solo la roca que se mira) entre otras 10 noticias; con 6 rocas a las 12 horas, 1 franja en 12 minutos y ninguna otra. La franja queda dentro de la escena; marcador, objetivo, escena y panel no cambian de alto.
- La franja de la rueda es ahora dorada y dura más; comprobé su clase y su texto, pero no conseguí una captura limpia de ella.
- Grand Master: cinco cambios seguidos de título desde la ficha (tres queseros, el tendero y vuelta al primero). Tras cada uno, el guardado tiene un solo titular, una sola estrella en la lista y las hornadas de todos los ratones intactas.
- Cheese Board: fijar «Vintage Smoked Truffle Parmesan» desde RECIPE BOOK y dejar correr 12 minutos lleva la tarjeta a «Brined 79 % · Smoked 21 %, +10 %» y x1,10.

No comprobado jugando: una partida a mano de principio a fin, el aspecto de la rueda a velocidad normal, ni nada en un teléfono real.

### Refuerzos (13-10-2026)

En el navegador, con una partida del bot de 12 horas y seis rocas cargada en el juego:

- 360×740: al cargar una partida anterior salen «4 BOOSTS TO PLACE!», el botón BOOSTS en la barra de abajo y su punto. El panel enseña libres y colocados, el siguiente objetivo («6481 / 40.0M cheese cooked», con tiempo estimado), la rejilla de seis rocas por cuatro etapas y la tienda.
- Tocando: dos refuerzos en la quesería de Blue, uno en la mina de Parmesan y uno en la tienda; un tercer toque en Blue con todo colocado quita uno; tocar otro puesto lo pone ahí. El guardado refleja cada paso y el punto de BOOSTS se apaga cuando no queda ninguno libre.
- Pantalla principal: la casilla CHEESE lleva dos galones y SELL uno al mirar Blue; el panel, la escena y la barra de abajo miden lo mismo que antes (255 / 256 / 32 px).
- 320×640: los cuatro botones de la barra caben sin cortarse, el panel no se desplaza y la rejilla no se desborda.

### Refuerzo de Refining y rediseño visual (13-10-2026)

En el navegador, con una partida casual de 5 horas (seis rocas) y 12 refuerzos repartidos entre puestos con cero, uno y dos:

- 360×760 y 320×640: las casillas reforzadas llevan marco azul y chapa con uno o dos galones; se distinguen de las normales de un vistazo, también la elegida (borde amarillo y marco azul a la vez). Con y sin refuerzos, la barra de etapas, el panel y cada casilla miden lo mismo (controles 348 px, panel 234 px, casillas 55×47 a 320 px).
- El panel del puesto enseña la chapa con lo que da («+50% SPEED», «x2.25 BASE») y, en la refinería, la Base real por hornada (124 Raw > 742,1 Base con dos; 494,8 con uno).
- BOOSTS: rejilla de seis rocas con casillas de alto fijo (48 px), «+50%» o «x2.25» bajo el icono, la unidad (SPEED o BASE) en la cabecera de cada columna, «SLOW?» y «+BASE?» como pistas, y la tienda con «x2.25 SPEED».
- Tocando: doce refuerzos colocados uno a uno; quitar uno de la refinería de Cheddar y ponerlo en el taladro de Parmesan cambia la Base de la refinería a x1,5 y la velocidad del taladro a x1,5; devuelto a su sitio, tras recargar la página siguen los doce donde estaban.
- La prueba de ausencia de cuatro horas con objetivo de refuerzo en curso y la de igualdad offline (ahora con un refuerzo en la refinería) pasan.

### Tres ajustes de cierre (13-10-2026)

En el navegador a 320×640, con una partida guardada por la versión anterior (carga sin migración) y la colonia automatizada:

- La chapa de dos refuerzos apila sus galones por debajo de 345 px: ya no roza «UP!». Casillas 55×47 y controles 348 px, igual que antes.
- Con todos los objetivos cumplidos la franja mide 16 px en vez de 51 y la escena gana esa altura (214 px).
- Efectos durante 15 s con el intervalo final de 1,2 s, a 360×760 mirando la quesería y la tienda de Cheddar: como mucho 2 números y 5 iconos a la vez (media 1,3 y 2,4). Antes los topes eran 26 y 30.

No comprobado jugando: una partida a mano de varias horas con refuerzos, ni nada en un teléfono real.

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

- **Marcador superior en pantallas estrechas (anotado el 13-10-2026, sin arreglar).** A 320 px, con cifras grandes y la línea de ritmo por minuto debajo, la cifra de un contador se corta contra el siguiente (se vio «33.2M» de Cheese Base recortado). Pendiente; no se abre un rediseño por esto.

- **Las partidas anteriores no se conservan:** el modelo de datos es nuevo.
- **Arte placeholder.** Los tramos de edificio se distinguen, pero el acabado sigue siendo el de dibujo por código.
- **Los rangos Master y Manager** solo están cubiertos por pruebas; no los alcancé jugando.
- **Elegir entre candidatos** no está medido: el bot siempre coge el primero.
- **Las partidas de la versión anterior se convierten** al cargar; está cubierto por una prueba, no probado con una partida real larga.
- **La escena enseña una roca cada vez,** aunque todas trabajan. Las demás se ven en las fichas del panel.
- **La tienda vende siempre primero el queso más caro;** no se puede reservar stock.
- **Fuente pixel desde Google Fonts.** Sin conexión se usa una monoespaciada del sistema.
