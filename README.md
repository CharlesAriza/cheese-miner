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
| Comprar la mejora más barata de una etapa | El botón con su nombre y precio, junto al botón grande |
| Comprar todo lo que alcance, en todos los árboles | **BUY ALL** |
| Repetir sin machacar | Mantener pulsado el botón grande |
| Ver el árbol entero de una etapa | **ALL UPGRADES** en su panel |
| Comprar todo lo que alcance en un árbol | **BUY EVERYTHING I CAN AFFORD** |
| Descubrir y cocinar recetas | Etapa CHEESE → botón grande |
| Abrir rocas nuevas y ampliar las horas offline | **COLONY** |
| Ver todo lo que tienes, tipo por tipo | **PANTRY**, o tocar un contador de arriba |
| Ver otro queso (escena y contadores) | Tocar su fila en el panel |
| Moverse por la colonia | Arrastrar la escena |
| Sonido, exportar, importar, reiniciar, dev tools | **MENU** |

Los edificios de la cadena se construyen solos al cumplir su condición. Etiquetas de las casillas: `LOCK` (aún no), `UP! 3` (tres mejoras que ya puedes pagar), `AUTO` (tiene ratón). Los botones de compra que aún no alcanzas se van llenando y dicen cuántos minutos faltan.

El Cheesemaker cocina por su cuenta la receta más valiosa que conozcas de cada queso; fijar otra a mano es opcional.

Bajo la escena se ve el subsuelo de la roca que estás mirando: baja contigo, cambia de material cada cinco niveles y el pozo llega hasta tu profundidad, con carteles numerados. La casilla que pide el objetivo actual parpadea.

No hay almacén con tope: todo se acumula sin límite en la despensa, cada queso por separado.

Cada roca abierta es una línea de producción completa y todas trabajan a la vez: se pica, se taladra, se refina y se cocina cada queso por separado. Debajo del panel hay una fila por queso con su recorrido (Raw → Base → queso), el progreso de cada paso y una frase que dice qué le pasa. Los tres contadores de arriba son los del queso que estás mirando; tocas una fila para cambiar. Una roca nunca se agota: al vaciar su veta baja un nivel de profundidad, y más hondo el queso es más rico.

## Arquitectura

La simulación avanza en pasos fijos de 100 ms y no depende del render. La interfaz solo lee el estado y llama a acciones.

| Archivo | Responsabilidad |
| --- | --- |
| `js/game/config/balance.js` | Todos los valores de balance, árboles y definiciones |
| `js/game/state.js` | Modelo de datos, niveles, efectos de los árboles, invariantes |
| `js/game/systems/skills.js` | Experiencia, compra de nudos, edificios, zonas |
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
