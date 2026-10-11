# Cheese Miner · Internal Playtest Alpha

Juego web de gestión con ratones: picar revela vetas, el Cheese Drill extrae Raw Cheese, la Refinery lo convierte en Cheese Base, la Cheesery hace lotes de queso y el Market los vende. Con las monedas se construye, se mejora, se contrata y se abren yacimientos.

El contrato del proyecto está en [CLAUDE.md](CLAUDE.md).

## Cómo abrirlo

No hay nada que instalar ni compilar.

- **En tu equipo:** doble clic en `index.html`.
- **Como enlace:** la carpeta es un sitio estático, así que se puede publicar tal cual en GitHub Pages (rama principal, carpeta raíz).

La interfaz está en inglés; la documentación, en español.

## Controles

| Acción | Cómo |
| --- | --- |
| Picar la roca | Botón **MINE**, tocar la roca o tecla `1` |
| Arrancar o acelerar el taladro | Botón **DRILL**, tocar el taladro o tecla `2` |
| Arrancar o acelerar la refinería | Botón **REFINE**, tocar la refinería o tecla `3` |
| Moverse por la colonia | Arrastrar la escena hacia los lados |
| Construir, mejorar, abrir yacimientos | **BUILD** |
| Contratar y ver el estado de los trabajadores | **WORKERS** o tocar la Mouse House |
| Experimentar, Recipe Book, fabricar lotes | **CHEESE** o tocar la Cheesery |
| Pedidos y ventas | **MARKET** o tocar el puesto |
| Sonido, exportar, importar, reiniciar, dev tools | **OPT** |

Un punto rojo sobre un botón de navegación indica que ahí hay algo nuevo que se puede hacer.

## Arquitectura

La simulación avanza en pasos fijos de 100 ms y no depende del render. La interfaz solo lee el estado y llama a acciones.

| Carpeta o archivo | Responsabilidad |
| --- | --- |
| `js/game/config/balance.js` | Todos los valores de balance y definiciones (provisionales) |
| `js/game/state.js` | Modelo único de datos, consultas derivadas, validación de invariantes |
| `js/game/systems/production.js` | Mining, Drilling, Refining |
| `js/game/systems/colony.js` | Construcción, mejoras, trabajadores, yacimientos |
| `js/game/systems/cheesery.js` | Fórmula de recetas, experimentos, lotes, Recipe Book |
| `js/game/systems/merchant.js` | Compradores, pedidos, ventas |
| `js/game/simulation.js` | Reloj, automatización, hitos, progreso offline |
| `js/storage.js` | Guardado versionado, exportar e importar |
| `js/playtest/` | Telemetría local y herramientas de desarrollo |
| `js/ui/` | Escena, paneles, HUD, sonido |
| `js/tests/tests.js` + `tests.html` | Pruebas automáticas (se ejecutan en el navegador) |

Diferencia con el contrato: se pedía TypeScript + Vite, pero el equipo de desarrollo no tiene Node. Se usó JavaScript sin compilación, con la misma separación de responsabilidades. Migrar a TypeScript más adelante no cambia el diseño.

## Sustituir los gráficos

Todo el arte es un placeholder dibujado por código en `js/ui/scene.js`. Cada pieza está marcada con un comentario `SPRITE:`: ratón, Cheese Rock, Cheese Drill, Refinery, Storage, Mouse House, Cheesery y Market.

Para usar un PNG: carga la imagen y cambia el cuerpo de esa función por un `ctx.drawImage(...)` en la misma posición. La escena mide 160 píxeles lógicos de ancho; el ratón actual ocupa 22×19 y los edificios unos 38×34. Las posiciones de cada parcela están en la constante `POS`.

## Pruebas

Abre `tests.html`. Ejecuta los casos de la sección 11 del contrato, incluido un bot que juega una partida completa sin dev tools. Usa una clave de guardado propia y no toca tu partida. Los resultados de la última ejecución están en [TEST_RESULTS.md](TEST_RESULTS.md).

## Más documentación

- [BALANCE.md](BALANCE.md): cifras provisionales y dónde editarlas.
- [PLAYTEST.md](PLAYTEST.md): guía de sesión de 45 minutos y preguntas para testers.
- [TEST_RESULTS.md](TEST_RESULTS.md): pruebas ejecutadas, limitaciones y pendientes.
