# Cheese Miner

Clicker idle incremental de ratones queseros. Picas la roca para encontrar vetas, las taladras, refinas el queso, cocinas recetas y las vendes. Cada etapa es una habilidad que sube de nivel y tiene su árbol de mejoras; cada una acaba teniendo un ratón que la lleva sola.

La visión y las reglas del proyecto están en [CLAUDE.md](CLAUDE.md).

## Cómo abrirlo

No hay nada que instalar ni compilar.

- **Enlace:** https://charlesariza.github.io/cheese-miner/
- **En tu equipo:** doble clic en `index.html`.

La interfaz está en inglés; la documentación, en español.

## Cómo se juega

La pantalla es el cuartel general. Abajo está la **cadena**: MINE → DRILL → REFINE → CHEESE → SELL. Cada casilla muestra el nivel de esa habilidad y su estado. Al tocar una, el panel de debajo enseña qué hace, su barra de experiencia, su botón de acción y el acceso a su árbol.

| Acción | Cómo |
| --- | --- |
| Hacer la acción de una etapa | Tocar su edificio en la escena, o el botón grande |
| Comprar la mejora más barata de una etapa | El botón con su nombre y precio, bajo el botón grande |
| Comprar todo lo que alcance, en todos los árboles | **BUY ALL**, en la fila de mejoras: enseña antes cuántas compraría y por cuánto |
| Repetir sin machacar | Mantener pulsado el botón grande |
| Ver el árbol entero de una etapa | **UPGRADES** en su panel |
| Comprar un hito (Grand Wheel, Grand Master) | **UPGRADES** de Cheesemaking, rama MILESTONES; BUY ALL no los compra |
| Nombrar al Grand Master | Abrir un ratón en MICE → NAME GRAND MASTER |
| Colocar o mover un refuerzo | **BOOSTS** → tocar el puesto (etapa de una roca, o la tienda); si no queda ninguno libre, tocar uno colocado lo recupera |
| Ascender a varios ratones de una vez | MICE → aviso «N can be promoted»: se eligen, se ve el total y se confirma una vez |
| Comprar todo lo que alcance en un árbol | **BUY EVERYTHING I CAN AFFORD** |
| Descubrir y cocinar recetas | Etapa CHEESE → botón grande |
| Reclutar, colocar y ascender ratones | **MICE**: COLONY (puestos por roca), ROSTER (todos los ratones) y HOUSE (cama, reclutar, diario, álbum) |
| Abrir rocas nuevas y ampliar las horas offline | **COLONY** |
| Ver todo lo que tienes, tipo por tipo | Tocar un contador de arriba, o el almacén |
| Ver otro queso (escena y contadores) | Tocar su fila en el panel |
| Moverse por la colonia | Arrastrar la escena |
| Sonido, exportar, importar, reiniciar, dev tools | **MENU** |

Los primeros pasos van a fuego lento. Cuando se desbloquea un edificio nuevo de la cadena, el juego lo avisa, su casilla se marca con `NEW!` y tú vas a su panel, lees para qué sirve y lo construyes. Tras la primera venta, una tarjeta resume para qué sirven las monedas. Etiquetas de las casillas: `LOCK` (aún no), `UP! 3` (tres mejoras que ya puedes pagar), `AUTO` (tiene ratón). Los botones de compra que aún no alcanzas se van llenando y dicen cuántos minutos faltan.

**Ratones.** Un puesto con ratón trabaja solo. Cada ratón es irrepetible:

- **Aspecto y rareza.** Pelaje, gorro, accesorio y mochila propios. Puede salir **Rare** (más rápido, pelaje propio) o **Legendary** (aún más rápido, nace con un rasgo legendario y sin manía, pelaje dorado y corona). El rango se ve en la ropa y en el marco del retrato.
- **Afinidades.** A cada ratón le gustan (`Likes`) o le encantan (`Loves`) algunos oficios: ahí va algo más rápido y, sobre todo, se especializa antes.
- **Rasgos.** Nace con uno bueno y una manía. Cada 10 niveles desarrolla otro **por su cuenta**: no lo eliges, lo descubres. Lo que ha trabajado a lo largo de su vida inclina lo que acaba siendo. Subir de nivel nunca trae una manía. Muy de vez en cuando el rasgo es **legendario**, y el juego lo celebra a pantalla completa; la mayoría de ratones no tendrá ninguno.
- **Especialidades.** Trabajando un oficio (200, 2.000 y 20.000 trabajos) le llega una especialidad de ese oficio y la sube de grado. Se conserva al cambiar de puesto, pero solo cuenta en su oficio.
- **La cama de la Mouse House.** Una sola. Sirve para tratar una manía o para reentrenar una especialidad eligiendo cuál. Tarda media hora, cuesta cada vez más y el ratón sigue trabajando mientras tanto: tú decides a quién merece la pena.
- **Combinaciones.** Ciertos rasgos juntos en un mismo ratón forman una combinación con nombre y efecto propio. No hay pistas: se descubren probando.
- **Vecinos y rocas.** Algunos rasgos mejoran (o estorban) al ratón del puesto anterior o siguiente de la misma línea. Además hay combinaciones entre dos vecinos con rasgos distintos que encajan y de roca entera (los cuatro puestos ocupados cumpliendo una condición). También se descubren probando.
- **Se les nota.** Algunos rasgos cambian el dibujo: ojos que brillan, cinta en la frente, gafas de buceo, capa, patas doradas.
- **Álbum.** Cada pelaje, gorro, accesorio, rasgo y combinación que consigues queda apuntado para siempre y sube un 1 % el precio de todas tus ventas.

**La pantalla MICE** tiene dos vistas. **BY ROCK** es una rejilla con una fila por roca y una columna por oficio: en cada puesto ves quién está y cuánto rinde ahí por sí solo. **ALL MICE** es la lista completa, ordenable por puesto, nivel o rendimiento, con nivel, puesto, rasgos principales y afinidad de cada ratón. Arriba salen siempre lo pendiente (un rasgo por elegir o un ascenso que ya puedes pagar, resoluble ahí mismo) y los ratones sin puesto.

- **Tocar un puesto** abre sus candidatos: todos los ratones ordenados por lo que rendirían ahí, con su afinidad y su especialidad. Tocar uno lo asigna; si el puesto estaba ocupado, se intercambian.
- **Tocar un ratón** (en la lista o sin puesto) abre los puestos a los que puede ir, del mejor al peor para él. Tocar uno lo manda ahí. Desde esa hoja se abre su ficha completa.
- El número que acompaña a cada ratón es lo que rinde por sí solo; no cuenta vecinos ni combinaciones, que siguen siendo cosa tuya.

Al reclutar eliges uno de tres y va él solo al mejor puesto libre. **BEST FIT** recoloca a toda la plantilla mirando a cada ratón por separado; no tiene en cuenta vecinos ni combinaciones, eso es cosa tuya. Los rasgos nunca se eligen solos. Cada ficha dice qué hace el ratón en valores reales («2 Raw every 2.1s»), qué le falta para ascender y qué ganará; **MANAGE** despliega sus rasgos, casillas, especialidades, rangos, los puestos a los que puede ir y el botón para despedirlo (se pierde todo lo suyo y no se devuelve nada).

El ratón de Cheesemaking cocina por su cuenta la receta más valiosa que conozcas de su queso; fijar otra a mano es opcional.

**Cheese Lab.** Las recetas se investigan aparte de la producción: la quesería no se para. Las tres primeras las descubres tú eligiendo cuatro componentes; entonces puedes construir el Cheese Lab, un edificio propio en la colonia con un puesto para un ratón de **Research**. Tú marcas la dirección (más valor, más rápidas de cocinar, un queso o un componente concreto) y el ratón investiga dentro de ella; sin dirección no elige por ti. Research es un oficio más: afinidad, rasgos de oficio propios, un legendario y combinaciones con queseros, refinadores y tendero.

**LAB en la barra.** El laboratorio tiene su propia pestaña junto a Mine, Drill, Refine, Cheese y Sell. Empieza con lo esencial (investigar una receta a mano) y aprende con sus mejoras: Research Assistant (un ratón investiga por ti), Advanced Research (eliges la dirección) y Strain Research (cepas).

**Cheesery.** PRODUCTION enseña una tarjeta por roca: qué receta cocina, su progreso, si la lleva un ratón o va a mano y, si está parada, qué le falta. Al tocar una se abre con sus datos y acciones. RECIPE BOOK lista las recetas de cada queso para compararlas y fijar una con ALWAYS COOK THIS.

**Cepas (prototipo).** Otra manera de fabricar el mismo queso, de momento solo en Cheddar: Quick-set (más rápido, vale menos), Dense (vale más, gasta más Cheese Base) y Teaching (su quesero aprende más, vale menos). El investigador las encuentra para la receta que cocina la línea; tú decides cuál usar y puedes cambiarla cuando cambie tu fábrica.

Bajo la escena se ve el subsuelo de la roca que estás mirando: baja contigo, cambia de material cada cinco niveles y el pozo llega hasta tu profundidad, con carteles numerados. La casilla que pide el objetivo actual parpadea.

No hay almacén con tope: todo se acumula sin límite en la despensa, cada queso por separado.

Cada roca abierta es una línea de producción completa y todas trabajan a la vez: se pica, se taladra, se refina y se cocina cada queso por separado. En el panel hay una ficha por roca, todas del mismo tamaño, con un punto que dice cómo va su línea (verde, ámbar o rojo); debajo, un renglón cuenta qué le pasa a la que estás mirando. Los tres contadores de arriba son los de esa roca; tocas una ficha para cambiar. Una roca nunca se agota: al vaciar su veta baja un nivel de profundidad, y cuanto más hondo, más vale el queso que sale de ella (cada nivel multiplica su valor por 1,03).

**La cadena está equilibrada entre sus etapas.** Taladro, refinería, quesería y tienda tienen cada una su mejora de tamaño con el mismo precio; la quesería cocina por hornadas. Si una etapa va por detrás, las anteriores acumulan lo que no puede procesar: esa pila es la señal de dónde conviene invertir o poner a tu mejor ratón. El cuello de botella cambia de etapa según lo que mejores.

## Arquitectura

La simulación avanza en pasos fijos de 100 ms y no depende del render. La interfaz solo lee el estado y llama a acciones.

| Archivo | Responsabilidad |
| --- | --- |
| `js/game/config/balance.js` | Todos los valores de balance, árboles y definiciones |
| `js/game/config/traits.js` | Rasgos de los ratones, afinidades y combinaciones |
| `js/game/state.js` | Modelo de datos, niveles, efectos de los árboles, invariantes |
| `js/game/systems/skills.js` | Experiencia, compra de nudos, edificios, zonas |
| `js/game/systems/mice.js` | Ratones: reclutar, rasgos, niveles, rangos, puestos |
| `js/game/systems/production.js` | Mining, Drilling, Refining |
| `js/game/systems/cheesery.js` | Recetas, maestría, Cheesemaker y tienda |
| `js/game/simulation.js` | Reloj, automatización, objetivos, progreso offline |
| `js/storage.js` | Guardado versionado, exportar e importar |
| `js/playtest/` | Telemetría local y herramientas de desarrollo |
| `js/ui/scene.js` | Escena: edificios por tramos, roca, pueblo, ratones |
| `js/ui/icons.js` | Iconos de recursos |
| `js/ui/panels.js`, `js/ui/main.js` | Paneles, cadena, HUD, feedback |
| `js/ui/sfx.js` | Sonido sintetizado |
| `js/tests/tests.js` + `tests.html` | Pruebas (se ejecutan en el navegador) |

## Sustituir los gráficos

Todo el arte es un placeholder dibujado por código. Cada pieza está marcada con un comentario `SPRITE:` en `js/ui/scene.js` (ratón, roca, taladro, refinería, almacén, quesería, tienda) y en `js/ui/icons.js` (recursos).

Cada edificio recibe un `tier` de 0 a 5 según sus mejoras. Para usar PNG, hace falta una imagen por tramo y cambiar el cuerpo de la función por un `ctx.drawImage(...)`. La escena mide 160 píxeles lógicos de ancho; el ratón ocupa 22×19 y los edificios unos 38×34. Las posiciones están en la constante `POS`.

## Más documentación

- [BALANCE.md](BALANCE.md): cifras provisionales.
- [PLAYTEST.md](PLAYTEST.md): cómo probarlo y qué mirar.
- [TEST_RESULTS.md](TEST_RESULTS.md): pruebas ejecutadas y limitaciones.
