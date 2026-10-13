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
7. **Lo nuevo se desbloquea, se anuncia y lo activa el jugador.** Nada aparece solo ni se construye desde una ventana: el juego avisa, marca dónde está lo nuevo y el jugador va a su panel, lee para qué sirve y lo construye. Vale para toda mecánica futura.
8. **Todo es exponencial.** Costes y producción crecen en curva; los números se abrevian.
9. **Fuera lo que no sirva a largo plazo.** Si una mecánica no va a dar horas de juego o va a confundir, se quita, aunque ya esté hecha.

## Cómo se trabaja

- **Siempre proponer antes de construir.** Las decisiones de diseño las plantea Claude con una recomendación y las aprueba el propietario.
- **Interfaz en inglés; documentación y conversación en español.**
- **Sin compilación:** HTML, CSS y JavaScript puros, publicables tal cual en GitHub Pages. El equipo de desarrollo no tiene Node.
- **Simulación separada del render,** por pasos de tiempo fijos. La economía nunca depende de frames ni de efectos visuales. Acciones atómicas: nada se cobra ni se entrega dos veces.
- **Balance centralizado** en `js/game/config/balance.js`, siempre provisional.
- **El ritmo se calibra con el jugador casual, no con el experto.** El bot tiene un perfil casual (pocos toques, compra cada 20 s, deja de tocar al automatizar); los precios de las rocas se ajustan a él. Un bot experto dio por bueno un arranque que para una persona era desesperante.
- **La cadena se equilibra con una sola ley:** a igual inversión e iguales ratones, cada etapa procesa una cantidad parecida. Antes de tocar el rendimiento de una etapa, medir las cinco con el bot (`tests.html` informa de la capacidad de cada etapa por roca; `tests.html?bot` carga solo el bot para calibrar desde la consola).
- **Al publicar, cambiar el `?v=` de los enlaces de `index.html`** (hoja de estilos y scripts): si no, el móvil sigue con los archivos viejos en caché.
- **Nombres de clase CSS propios por pantalla:** antes de añadir una clase, comprobar que no existe ya (un `.lrow` y un `.hot` repetidos rompieron la pantalla principal).
- **Pruebas en el navegador** (`tests.html`). No afirmar que algo está probado si no se ha ejecutado.
- **Arte por código, sustituible.** Cada pieza dibujada está marcada con `SPRITE:` para poder cambiarla por un PNG.
- **Sin** monetización, compras, multijugador, combate ni analítica externa.

## Estado: hitos 1 (cimientos) y 2 (ratones)

Hecho:

- Cinco habilidades (Mining, Drilling, Refining, Cheesemaking, Trading) con nivel 1–99.
- Un árbol por habilidad con tres ramas (potencia, ratones, especial) y uno de colonia (horas offline).
- Despensa sin tope, estilo banco de Melvor: cada recurso y cada receta en su fila.
- Rocas con profundidad sin fin y seis zonas en escalera de precio (Cheddar, Gouda, Brie, Emmental, Parmesan, Blue). Cada zona es una línea completa (minería, taladro, refinado y cocinado) que trabaja en paralelo a las demás; solo la tienda es común.
- Recetas de cuatro componentes con un único valor, rango y maestría; 216 combinaciones.
- Venta por ciclos; el nivel de Trading trae mejores compradores.
- Edificios con seis aspectos según sus mejoras, subsuelo que baja con la profundidad de la roca (capas, pozo, carteles, montacargas), pueblo que crece y ratones que acarrean.
- Primeros pasos a fuego lento: cada edificio de la cadena se anuncia, su casilla se marca como nueva y el jugador va a su panel a construirlo. Compra rápida de mejoras desde cada etapa, «BUY ALL» global y Cheesemaker que elige la mejor receta.
- **Panel inferior de alto fijo** (13-10-2026): ficha por roca, título y experiencia, dos renglones de información, acción + ratón del puesto, y fila de mejoras (la más barata, el árbol, BUY ALL). Sus piezas son fijas en `index.html` y solo se les cambia el texto. **Nada del panel, del marcador ni del objetivo puede cambiar de alto mientras el juego corre**: la escena es `flex: 1` y se redimensionaría. Un texto nuevo va en un renglón que ya existe, cortado con puntos suspensivos.
- El efecto de las mejoras se guarda en caché con un sello de los rangos comprados (`modsNow`, enteros de 32 bits). Un sello con números normales perdía precisión y los rangos nuevos tardaban en aplicarse.
- **BUY ALL** (`CM.tree.sweep`) recorre todos los árboles a la vez y compra siempre lo más barato que quede; con `dry` solo dice qué compraría, y eso es lo que enseña el botón. No compra mejoras que abren funciones ni árboles de edificios sin construir. Los gerentes siguen igual: compran solos lo que cuesta menos del 10 % de las monedas.
- Progreso offline con la misma simulación.

Hito 2, ratones como personajes: Mouse House, reclutar eligiendo uno de tres, nivel propio, cuatro rangos (el gerente compra mejoras solo), un puesto por etapa y roca, colocación automática, BEST FIT y despido voluntario (sin reembolso). Sustituye a los antiguos nudos de ratón de los árboles.

### Sistema de ratones (en construcción, por entregas)

Aquí la profundidad es deliberada: es el sistema que tiene que sentirse único (referencia: Mewgenics). Reglas propias, acordadas con el propietario:

- **Optimizar es cosa del jugador, y lo que se optimiza son personajes únicos e imperfectos.** Los rasgos ya no se eligen: cada ratón desarrolla los suyos al azar (referencias: Darkest Dungeon, Mewgenics). La decisión está en dónde trabaja cada uno, con quién, a quién se trata o reentrena y a quién se conserva. Se automatiza lo tedioso, nunca esas decisiones: BEST FIT mira a cada ratón por separado y no hay pistas de combinaciones.
- **Nada garantizado, nada perdido.** Un rasgo legendario es un hallazgo raro (2 % por hito, sin garantía ni tope por ratón); la mayoría de ratones no tendrá ninguno y un doble es una joya. Subir de nivel nunca da una manía. No se apuestan monedas ni queso a doble o nada.
- **El balance se decide con el bot** y con partidas reales; las cifras son provisionales.

Entrega A (hecha): rareza (Rare, Legendary), afinidad por oficio, unos 70 rasgos (buenos, manías, de oficio con tres grados, legendarios), rasgos de nivel elegidos entre tres, casilla misteriosa, volver a tirar, combinaciones en un mismo ratón, auras entre vecinos de línea y álbum que sube el precio de venta.

Entrega B (hecha): la colonia dibujada (una línea de puestos por roca con el retrato de cada ratón; tocar un ratón y tocar un puesto lo mueve), ficha con cada rasgo en una línea (los iconos y los avisos flotantes se quitaron por recargados; paleta sobria donde el color solo significa bueno, manía, legendario o pendiente), rasgos visibles en el dibujo del ratón, combinaciones entre vecinos de línea y de roca entera. Los legendarios se celebran a pantalla completa y llevan aura dorada; las manías van en rojo; el juego no enseña probabilidades.

Rasgos automáticos (14-10-2026): cada 10 niveles el ratón desarrolla un rasgo solo (nunca una manía), la mitad de las veces sacado de los oficios que ha ejercido en toda su vida; a los 200 trabajos de un oficio le llega una especialidad al azar. Sin elección entre tres, sin volver a tirar, sin casilla misteriosa. La Mouse House tiene **una cama**: trata una manía o reentrena una especialidad (eligiendo cuál) en 30 minutos, con coste creciente, y el ratón sigue trabajando mientras tanto. Las bonificaciones de cantidad del tendero cuentan la mitad, porque su puesto cobra por todas las rocas. La interfaz de MICE está adaptada lo justo; su rediseño es el siguiente trabajo.

Entrega C (pendiente): fusión de dos ratones, mutaciones y linajes.

Interfaz de MICE (14-10-2026): tres pestañas. **COLONY** agrupa los puestos por roca (plegables: plegada enseña las caras de quien trabaja ahí; desplegada, una tarjeta por puesto con retrato, nombre, nivel y rango, oficio, afinidad y lo que rinde de verdad), con la tienda y el laboratorio como «whole colony» y una línea de avisos arriba (ascensos, ratones sin puesto, la cama). **ROSTER** lista a todos, con orden y filtros plegados. **HOUSE** reúne la cama, reclutar, el diario de la colonia y el álbum. Tocar un puesto abre su selector: quién está y los demás ratones ordenados por lo que harían ahí **por sí solos** (`CM.mice.solo`, sin vecinos ni combinaciones, para no prometer lo que depende de con quién trabajen), con la diferencia frente al actual; un toque asigna o intercambia. La ficha es una hoja de personaje con secciones plegables. Reclutar enseña un candidato a pantalla entera, con los tres arriba para cambiar. El marco del retrato es la rareza (gris, azul, dorado). Las clases CSS de esta pantalla empiezan por `mc-`. Reclutar cuesta un 50 % más por cada recluta de toda la partida y despedir no lo abarata.

Avisos: un rasgo normal es un aviso breve y queda en el diario; uno legendario se celebra a pantalla completa (si llegó con el juego cerrado, al cerrar el resumen de vuelta, que agrupa lo ocurrido).

Rendimiento (15-10-2026): simular horas de ausencia con la colonia llena era lento (una hora, 5 s). Ahora tarda 0,35 s con el mismo resultado exacto, comprobado bit a bit. Cómo: (1) `CM.memo` guarda dentro de un avance las respuestas que no cambian (qué rinde un ratón, cuánto vale un queso, efectos de mejoras) y `CM.rev` las invalida: sube con cada evento que no sea rutinario y en los pocos sitios que cambian algo sin evento. **Quien añada una mecánica que cambie el rendimiento de un ratón, un precio o un tiempo sin emitir un evento debe subir `CM.rev`.** (2) La receta de cada línea y las candidatas del laboratorio se recalculan solo cuando cambia lo que las decide. (3) El libro de recetas tiene índice. (4) Con el juego cerrado no se construyen los eventos rutinarios que nadie escucha. La prueba «offline: the fast path, the slow path...» compara las tres formas de calcular; `CM.noMemo = true` apaga la memoria para comparar. Las ausencias de más de 30 minutos se calculan a trozos con una barra de progreso (`offlineStart/offlineRun/offlineEnd`); guardar a medias conserva lo que falte. Los avisos (`toast`) hacen cola en vez de pisarse.

Ascensos en bloque (13-10-2026): el aviso «N can be promoted» de COLONY y ROSTER abre la lista de ratones con nivel para ascender (clases `pm-`). Se eligen uno a uno o con SELECT ALL / AFFORDABLE / NONE, se elige hasta qué rango cuando hay varios acumulados, se ve el total frente a las monedas y se confirma una vez. `CM.mice.promoteMany` usa el ascenso normal paso a paso; si el total no alcanza no cobra nada. No hay ascenso automático.

### Hitos de Cheesemaking (prototipo jugable, 13-10-2026)

Tres mejoras especiales para probar jugando si el tramo medio gana decisiones. Cifras provisionales en `B.milestones`; lógica en `CM.milestones` (`skills.js`). Son nudos del árbol con `unlock: true` y `gate`: **los compra el jugador** (ni BUY ALL ni los gerentes), se anuncian al abrirse y explican qué hacen al comprarlos.

- **Desbloqueo.** Grand Wheel se abre con More Moulds 20. Los siguientes, con un **objetivo de producción**: «cocina N quesos». N se fija una vez (tres horas del mejor ritmo sostenido: media de media hora, sin contar las ruedas) y no cambia hasta cumplirse. Producir más lo acerca; producir menos no lo abarata. Cuenta todo lo cocinado, también offline. Se enseña en el árbol de Cheesemaking y, acabados los objetivos de arranque, en la franja de objetivo. No es una mecánica sin fin: hoy solo abre dos hitos.
- **Grand Wheel.** Cada 10 minutos de cocinado, cada línea saca una rueda que vale 2 minutos más de su producción (+20 % de media). No gasta Base ni monedas y ocurre igual con el juego cerrado. Solo se celebra la de la roca que se está mirando; la Cheesery dice cuánto falta.
- **Cheese Board.** Las ventas valen más cuanto más repartidas estén entre ingredientes, tratamientos y maduraciones: en cada familia se calcula el número efectivo de tipos según lo vendido en los últimos ~10 minutos, y cada tipo efectivo de más da un 20 %. Un tipo que apenas vende apenas cuenta. Se cambia fijando otra receta en una roca; el Cheesemaker sin receta fijada sigue eligiendo por potencial, sin mirar la tabla.
- **Grand Master.** Un único título para toda la colonia, que el jugador da a un ratón desde su ficha y puede pasar a otro (cada uno conserva su experiencia). Su grado sale de las hornadas cocinadas en su vida (el primero a 20.000, otro cada vez que se doblan) y cada grado sube un 10 % el queso de la roca donde cocina. Fuera de un puesto de quesero no cuenta.

Quien toque el valor del queso: el título entra en `valueNow` (memorizado por `CM.rev`; nombrar, mover y subir de grado emiten evento) y la tabla multiplica las monedas de cada venta en `shop.start`, fuera de la memoria.

### Cheese Lab

Edificio propio en la colonia (gratis tras 3 recetas a mano). **Empieza sencillo y gana funciones con su propio árbol de mejoras** (`B.trees.lab`, sin nivel de habilidad): Research Assistant abre el puesto de Research; Advanced Research, las direcciones de investigación (antes, el ratón va siempre a por la receta más valiosa); Strain Research (Cheesemaking 10), la sección STRAINS. Además, dos mejoras de eficiencia (velocidad y coste). Las mejoras que abren una función las compra el jugador una a una, nunca BUY ALL, y cada una se explica al comprarla. La interfaz solo enseña lo desbloqueado. El oficio Research usa el sistema de ratones tal cual. Pendiente: las recetas son finitas (216).

Interfaz: pestaña LAB en la barra de etapas (seis casillas; la del laboratorio va aparte de la cadena) y panel con cabecera común y, cuando hay cepas, dos secciones, RECIPES y STRAINS. Lo que ocupa mucho (selector de dirección, receta a mano) va plegado. LAB aparece en la barra con la primera receta; antes, la primera se descubre desde CHEESE.

Cheesery: dos vistas. PRODUCTION es una tarjeta por línea (receta entera, progreso, quién cocina, por qué está parada) y solo la elegida se abre con sus acciones; RECIPE BOOK lista las recetas de un queso para comparar y fijar una. Investigar es cosa del laboratorio. El Cheesemaker sin receta fijada cocina la de más potencial: lo que deja a igual maestría y sin cepa, descontado el ingrediente (no la de mayor precio hoy, que arrinconaba recetas nuevas mejores). Una cepa equipada en una receta que la línea no cocina se avisa en STRAINS con un botón para fijarla; nunca cambia sola.

Cepas (prototipo, solo Cheddar): Quick-set, Dense y Teaching. Cada cepa da algo y pide algo; ninguna sube el valor sin coste en otra parte de la cadena. El investigador las encuentra, el jugador elige cuál usa y las encontradas no se pierden. Antes de ampliar (más quesos, Raw-pressed, dos cepas por receta) hay que jugarlo.

Quitado respecto a la Alpha: almacén con capacidad, regateo, clientes con paciencia, Taste/Funk/Aroma, reputación, viajar entre zonas, rocas que se agotan y Mouse House con camas.

## Siguientes entregas (acordadas, sin construir)

3. **Juego activo, colección y progresión** (en curso): hecho, seis rocas en escalera y álbum de ratones; falta queso dorado, logros con premio permanente, estadísticas, y un edificio o mecánica propia por roca (pendiente de proponer).
4. **Árboles profundos:** elegir una ventaja cada 10 niveles, maestría por base y edificios disparatados al fondo de cada árbol.
5. **Vender a lo grande:** cadena de tiendas, encargos, envíos, teletransporte, cohetes.
6. **Zonas con mecánica propia.**
7. **Franquicia:** reinicio con ventaja permanente.
8. **Salud a largo plazo:** números enormes, rendimiento, copia de la partida, instalable.
9. **Arte y sonido finales.**

Ideas del propietario para más adelante: una mecánica nueva por zona (envíos al mundo, teletransporte, cohetes a la luna), edificios disparatados al fondo de cada árbol (máquina del tiempo, pacto infernal), tienda por dentro e interfaz de recetas más física.
