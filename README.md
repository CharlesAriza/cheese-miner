# Cheese Miner · Internal Playtest Alpha

Juego web de gestión con ratones: picar revela vetas, el Cheese Drill extrae Raw Cheese, la Refinery lo convierte en Cheese Base, la Cheesery hace quesos y tú los vendes en tu propia tienda, regateando con cada cliente. Con las monedas se construye, se mejora, se contrata y se abren yacimientos.

El contrato del proyecto está en [CLAUDE.md](CLAUDE.md).

## Cómo abrirlo

No hay nada que instalar ni compilar.

- **En tu equipo:** doble clic en `index.html`.
- **Como enlace:** la carpeta es un sitio estático, así que se puede publicar tal cual en GitHub Pages (rama principal, carpeta raíz).

La interfaz está en inglés; la documentación, en español.

## Controles

La pantalla se organiza en torno a la **cadena de producción**: cinco casillas (ROCK → DRILL → REFINE → CHEESE → SHOP) que muestran el estado de cada estación. Al tocar una, el panel de debajo enseña qué hace, por qué está parada si lo está, su botón de acción, su mejora y su trabajador.

| Acción | Cómo |
| --- | --- |
| Elegir estación | Tocar su casilla, tocar el edificio o teclas `1`–`5` |
| Acción de la estación (picar, taladrar, refinar, acelerar) | Botón grande, tocar otra vez el edificio o barra espaciadora |
| Repetir sin machacar | Mantener pulsado el botón grande |
| Mejorar la máquina o contratar a su trabajador | Botones a la derecha del botón grande |
| Recetas, experimentos y cocinero | Estación CHEESE → botón grande |
| Atender clientes y regatear | Estación SHOP → botón grande, elegir queso y luego precio |
| Zonas, almacén, Mouse House y todos los trabajadores | **COLONY** |
| Moverse por la colonia | Arrastrar la escena hacia los lados |
| Sonido, exportar, importar, reiniciar, dev tools | **OPTIONS** |

La casilla que pide el objetivo actual parpadea. Las etiquetas de las casillas avisan de `BUILD`, `UP!` (hay una mejora o contratación que ya puedes pagar), `AUTO` (tiene trabajador) y ventas listas.

Cada recurso tiene siempre la misma forma: Raw Cheese es un trozo irregular, Cheese Base un bloque liso, el queso terminado una rueda con etiqueta y la moneda un disco. El color indica la base (Cheddar amarillo, Gouda naranja). Cuando algo se produce o se gasta, su icono vuela entre el edificio y el contador.

## Arquitectura

La simulación avanza en pasos fijos de 100 ms y no depende del render. La interfaz solo lee el estado y llama a acciones.

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| `js/game/config/balance.js` | Todos los valores de balance y definiciones (provisionales) |
| `js/game/state.js` | Modelo único de datos, consultas derivadas, validación de invariantes |
| `js/game/systems/production.js` | Mining, Drilling, Refining |
| `js/game/systems/colony.js` | Construcción, mejoras, trabajadores, yacimientos |
| `js/game/systems/cheesery.js` | Fórmula de recetas, experimentos, lotes, Recipe Book, maestría, Cheesemaker |
| `js/game/systems/merchant.js` | Tienda: clientes, paciencia, regateo, reputación |
| `js/game/simulation.js` | Reloj, automatización, hitos, progreso offline |
| `js/storage.js` | Guardado versionado, exportar e importar |
| `js/playtest/` | Telemetría local y herramientas de desarrollo |
| `js/ui/` | Escena, iconos de recursos, paneles, cadena y panel de estación, sonido |
| `js/tests/tests.js` + `tests.html` | Pruebas automáticas (se ejecutan en el navegador) |

Diferencias con el contrato:

- Hay un cuarto trabajador, el **Cheesemaker**, que cocina sin parar la receta que se le asigne. El contrato solo definía Miner, Driller y Refiner; se añadió a petición del propietario. Vender sigue siendo manual.
- El Merchant es ahora una **tienda propia**: los clientes entran, esperan con paciencia limitada y se regatea el precio. La reputación sustituye al número de ventas para desbloquear compradores.
- Las recetas tienen **maestría** y la Cheesery tiene mejora de velocidad.
- Se pedía TypeScript + Vite, pero el equipo de desarrollo no tiene Node. Se usó JavaScript sin compilación, con la misma separación de responsabilidades. Migrar a TypeScript más adelante no cambia el diseño.

## Sustituir los gráficos

Todo el arte es un placeholder dibujado por código en `js/ui/scene.js` (escena) y `js/ui/icons.js` (iconos de recursos). Cada pieza está marcada con un comentario `SPRITE:`: ratón, Cheese Rock, Cheese Drill, Refinery, Storage, Mouse House, Cheesery y Market.

Para usar un PNG: carga la imagen y cambia el cuerpo de esa función por un `ctx.drawImage(...)` en la misma posición. La escena mide 160 píxeles lógicos de ancho; el ratón actual ocupa 22×19 y los edificios unos 38×34. Las posiciones de cada parcela están en la constante `POS`.

## Pruebas

Abre `tests.html`. Ejecuta los casos de la sección 11 del contrato, incluido un bot que juega una partida completa sin dev tools. Usa una clave de guardado propia y no toca tu partida. Los resultados de la última ejecución están en [TEST_RESULTS.md](TEST_RESULTS.md).

## Más documentación

- [BALANCE.md](BALANCE.md): cifras provisionales y dónde editarlas.
- [PLAYTEST.md](PLAYTEST.md): guía de sesión de 45 minutos y preguntas para testers.
- [TEST_RESULTS.md](TEST_RESULTS.md): pruebas ejecutadas, limitaciones y pendientes.
