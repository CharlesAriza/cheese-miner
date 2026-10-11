# CHEESE MINER — CLAUDE CODE HANDOFF

**Proyecto:** CHEESE MINER  
**Entregable:** Internal Playtest Alpha / vertical slice funcional  
**Idioma de documentación y feedback:** español  
**Plataforma:** juego web local, móvil vertical como diseño prioritario y escritorio compatible  
**Dirección visual aprobada:** pixel art 2D lateral (side view), energía de idle/action RPG al estilo de *Legends of Idleon*, con assets originales.

> **IMPORTANTE — CAMBIO DE ALCANCE:** Este documento sustituye el antiguo handoff de MVP de tres etapas. **No** construyas solamente minería → taladro → refinería. Se solicita un prototipo suficientemente completo para testar internamente una sesión de aproximadamente **30–60 minutos**: descubrimiento, extracción, refinado, construcción, trabajadores, recetas, venta y reinversión.
>
> La ambición es **profundidad funcional**, no cantidad de pantallas. Nada de botones de mentira, cifras sin efecto, sistemas simulados con pantallas vacías o interfaces decorativas.

---

## 1. Tu papel y modo de trabajo

Actúa como **lead gameplay engineer + technical game designer**. Encárgate del proyecto de extremo a extremo, minimizando intervención técnica del usuario. Inspecciona antes el repositorio. Si está vacío, crea la aplicación; si existe, conserva lo reutilizable. Toma decisiones técnicas razonables sin paralizarte haciendo preguntas de poca importancia.

**No cambies las reglas fundamentales:**
- **MINING**: picar la *Cheese Rock* **revela vetas**. **No da Raw Cheese, Cheese Base ni monedas por golpe**.
- **DRILLING**: la *Cheese Drill* extrae **Raw Cheese** de las vetas descubiertas.
- **REFINING**: la *Refinery* convierte **Raw Cheese** en **Cheese Base**.
- **CHEESERY**: a partir de una base e ingredientes/tratamientos/maduración se descubren recetas y se producen lotes.
- **MERCHANT**: vender los lotes a compradores con preferencias genera ingresos para reinvertir.
- **TRABAJADORES** automatizan acciones; **UPGRADES** mejoran rendimiento de máquinas. Son mecanismos separados.

No agregues combate, enemigos, habilidades mágicas, exploración de mundo abierto, cajas de botín, compras premium, multiplayer ni sistemas de energía arbitrarios. El referente Idleon es **solo artístico y de legibilidad/feedback**, no un permiso para importar sus mecánicas.

Si faltan números de balance, implementa valores **provisionales, visibles y configurables**, no los presentes como decisiones de producto aprobadas. Si hay un conflicto entre el arte de referencia y estas reglas, prevalecen las reglas.

## 2. Qué queremos validar

En una sesión de prueba, una persona debe poder:
1. Empezar con un ratón y una roca intacta.
2. Descubrir una veta picando manualmente.
3. Construir/activar una Cheese Drill y producir Raw Cheese.
4. Construir/activar una Refinery y producir Cheese Base.
5. Desbloquear parcelas y una colonia pequeña con edificios funcionales.
6. Contratar por lo menos un Miner, un Driller y un Refiner y observar sus efectos reales.
7. Experimentar en la Cheesery, descubrir una receta, ponerle nombre y producir un lote.
8. Vender ese lote a un comprador, conseguir dinero y reinvertir en una mejora o empleado.
9. Agotar un yacimiento y abrir otro; comprobar que las fuentes de recursos son finitas.
10. Cerrar y reabrir el juego sin perder datos y obtener progreso offline **solo** donde hay automatización real y capacidad disponible.

**Objetivo de diseño provisional:** 30–60 min para completar el circuito, ideal ~45 min. Instrumentar tiempos para saber si ocurre. No aceleres artificialmente todos los procesos para que parezca terminado.

## 3. Core loop y meta loop

### Bucle operativo

```text
Picar roca (progreso de descubrimiento)
       ↓
Revelar veta (capacidad finita)
       ↓
Cheese Drill consume capacidad de veta
       ↓
Raw Cheese (inventario / capacidad)
       ↓
Refinery consume Raw Cheese
       ↓
Cheese Base (inventario / capacidad)
       ↓
Cheesery: descubrir receta / producir lotes
       ↓
Cheese Merchant: satisfacer preferencias y vender
       ↓
Monedas
       ↓
Construir, mejorar máquinas, contratar y abrir yacimientos
       ↺
```

### Dónde está la decisión interesante

- La cadena se atasca si una fase produce más rápido de lo que la siguiente procesa.
- La capacidad de almacenaje limita el throughput: el excedente **no se crea ni se pierde silenciosamente**.
- El jugador compara inversiones en velocidad, capacidad, contratación y nuevos yacimientos.
- La automatización evita microgestión, pero permite intervención manual para acelerar.
- El Merchant recompensa diseñar/escoger recetas adecuadas, no simplemente vender el mismo queso siempre.
- El recurso se agota; abrir otro yacimiento tiene un coste y una recompensa tangible.

## 4. Alcance de la Alpha: siete sistemas conectados

### 4.1 Mining / Cheese Rock

- Una roca inicial visible en una escena 2D lateral fija o con desplazamiento muy corto.
- Estados: `intact` → `searching` → `vein_revealed` → `depleted` (el estado de veta y agotamiento puede modelarse por separado para soportar varias vetas).
- Click/tap activa animación de pico, partículas y **progreso de exploración**.
- Encontrar una veta habilita la fase de taladro; la roca indica gráficamente la zona descubierta.
- Capacidad finita de la veta; al agotarse, la extracción se detiene.
- No mostrar `+12 cheese` al picar: el número de impacto, si existe, representa **progreso de búsqueda**, no recurso obtenido.
- Priorizar una única roca activa por escena y un segundo yacimiento desbloqueable para la prueba. Posibles bases de queso: Cheddar y Gouda como ejemplos provisionales; Blue puede quedar preparada en datos sin contenido adicional.

### 4.2 Cheese Drill

- Se habilita tras el descubrimiento de la veta y requiere construcción o activación coherente con la economía de la prueba.
- Iniciar ciclo manual de extracción con duración y cantidad configurables.
- Cada ciclo completado reduce la capacidad restante de la veta y añade **Raw Cheese** al inventario si hay espacio.
- Cuando no hay veta o espacio en el almacén, bloquea la operación y muestra el motivo.
- Mejora de máquina: rendimiento/velocidad/capacidad, **no** contratación automática.
- Feedback claro de en marcha, parada, bloqueada y sin recursos.

### 4.3 Refinery

- Procesa Raw Cheese → Cheese Base mediante ciclos con duración y ratio configurables.
- Reserva/consume materia prima en un punto **definido** del ciclo; no la descuentes dos veces ni dejes que duplicación tras recarga cree recursos.
- Si falta materia prima o capacidad de salida, muestra bloqueo comprensible.
- Mejora de máquina independiente de contratación de Refiner.
- Estado y progreso visibles.

### 4.4 Base building y almacenamiento

- Parcelas **predeterminadas**, sin editor libre de construcción ni mundo abierto.
- Edificios de la Alpha: Drill, Refinery, Storage, Mouse House, Cheesery y Market/Merchant; representa cada uno de forma sencilla y coherente en la escena o como panel contextual.
- Desbloquear/edificar tiene coste y condiciones claras; evitar callejones sin salida económicos.
- Storage debe tener una capacidad real con límites de entrada/salida. Mouse House define cupos de ratones si se usa.
- No construir cinco escenarios gigantes: una colonia compacta con edificios que aparecen a medida que se progresan los hitos.

### 4.5 Trabajadores y automatización

- Tres roles reales: **Miner** (descubrimiento), **Driller** (extracción) y **Refiner** (procesamiento).
- Contratar cuesta dinero, ocupa un cupo (si aplica) y activa trabajo continuo condicionado por recursos/capacidad.
- El Miner solo descubre vetas; **no extrae**. El Driller extrae **Raw Cheese**; el Refiner procesa **Cheese Base**.
- Separar en código: `isAutomated`, `workerCount`, `machineLevel` y `machineThroughput`.
- Permitir actividad manual durante la automatización sin contar dos veces los mismos ciclos.
- La automatización debe respetar reservas, colas, agotamiento y almacenes.
- Estado claro por trabajador: activo, esperando veta, sin material, almacén lleno, sin trabajo.

### 4.6 Cheesery / Recipe Book

- Primera versión **pequeña pero jugable** del sistema:
  `BASE + INGREDIENTE + TRATAMIENTO + MADURACIÓN = QUESO`.
- Usar una selección compacta de opciones para cada componente (p. ej. 2 bases, 2 ingredientes, 2 tratamientos y 2 maduraciones **como valores provisionales**); evitar decenas de objetos cosméticos.
- Las combinaciones generan estadísticas reales: **Taste, Funk, Aroma, Value**. Documentar la fórmula en configuración, con sinergias simples y reproducibles.
- El jugador descubre una combinación, puede renombrarla y guardarla en **Recipe Book**.
- La producción posterior selecciona recetas conocidas y crea **lotes**, consume inputs y tiempo, y respeta capacidad disponible.
- La experimentación y fabricación de lotes deben diferenciarse; no exigir redescubrir una receta guardada.
- Usar imágenes/iconos genéricos pixel art coherentes en lugar de prometer un sprite único por receta.

### 4.7 Cheese Merchant / economía

- Compradores de escala reducida: **vecino**, **restaurante**, **coleccionista** y **premium** (puedes introducirlos gradualmente).
- Cada comprador tiene preferencias reales de gusto, intensidad/funk, aroma, maduración y/o precio. Mostrar preferencias legibles.
- Un pedido solicita ciertas propiedades/cantidad; el jugador elige un lote producido para entregarlo.
- La venta consume inventario **una sola vez** y acredita monedas **una sola vez**.
- Las condiciones deben ser alcanzables con las combinaciones que existen en la Alpha.
- Los ingresos vuelven a edificios, trabajadores, upgrades y nuevos yacimientos.
- Al menos una decisión genuina entre «mejorar un proceso» y «contratar a alguien».

## 5. Ritmo del test (metas, no cronómetro rígido)

| Minuto orientativo | Hito esperado |
|---|---|
| 0–5 | Ratón, primera roca, veta descubierta, taladro desbloqueado |
| 5–10 | Raw Cheese, primera Refinery, Cheese Base |
| 10–20 | Primera mejora o trabajador; cuello de botella visible |
| 20–30 | Primera receta creada/guardada y primer lote vendido |
| 30–45 | Automatización tangible, mejora económica, segundo yacimiento |
| 45–60 | Optimizar, probar otra receta/comprador y observar producción offline tras volver |

No inventar complejidad para llenar 45 minutos. Crear una curva de desbloqueos y costes configurable y observar los datos reales.

## 6. Balance provisional y prevención de bloqueos

Crear `src/game/config/balance.ts` (o ubicación equivalente) con **todos** los valores balanceables, con comentarios `PLAYTEST_DEFAULT`:
- golpes/progreso necesarios para descubrir veta;
- cantidad y capacidad de vetas; costes de desbloquear yacimientos;
- tiempo y output de cada ciclo Drill / Refinery / Cheesery;
- ratios de conversión y consumos;
- capacidad de almacén;
- costes y efectos de edificios, trabajadores y upgrades;
- límites y tasas offline;
- precios/condiciones de compradores;
- fórmulas de stats y sinergias de recetas.

**El modelo económico debe ser jugable desde cero:** no exigir monedas para el primer taladro si el jugador empieza sin forma de ganarlas. Elegir una solución explícita en balance (por ejemplo, kit inicial o primer taladro gratuito) y documentarla como provisional. Del mismo modo, siempre debe existir camino legítimo para producir y vender el primer lote antes de necesitar una inversión imposible.

Agregar validaciones automatizadas para evitar: saldos negativos, inventarios por encima de capacidad, venta de lotes inexistentes, yacimientos con capacidad negativa, bucles de producción imposibles y softlocks económicos conocidos.

## 7. Persistencia e idle/offline

- Guardado automático versionado en `localStorage`, con opción de exportar/importar JSON para testers.
- Persistir: edificios, máquinas, mejoras, trabajadores, vetas, inventarios, recetas con nombres, pedidos, monedas, desbloqueos, tiempos de ciclo y estadísticas de test.
- El cálculo offline usa tiempo transcurrido **desde último guardado real**, con límite configurable, y simula pasos/capacidades/cuello de botella sin generar materiales de la nada.
- **Sin trabajadores no existe producción offline de esa etapa**. La minería manual no progresa sola; un trabajador Miner sí puede explorar si tiene tarea válida.
- Aplicar el progreso offline **una sola vez** por retorno/reanudación; registrar el tiempo procesado para que refrescar no multiplique resultados.
- Mostrar un resumen del retorno (producido, consumido, bloqueos).
- Incluir `Reset Save` con confirmación y gestión de esquemas antiguos/dañados sin pantalla rota.

## 8. Visual, UX y accesibilidad de la Alpha

**Referencia estética aprobada:** *Legends of Idleon* en espíritu visual: **pixel art 2D lateral**, colores alegres, ratones expresivos, siluetas claras, animaciones de pico y máquinas, partículas ligeras, números flotantes **solo cuando representen eventos reales**, barras y paneles compactos de acción/idle RPG.

- Assets **originales**; no copiar sprites, personajes ni UI de Idleon.
- El mockup aprobado es **referencia de lenguaje gráfico**, **no** contrato de mecánicas, contadores, monedas ni edificaciones. En particular, los `+cheese` flotantes durante Mining en el mockup contradicen las reglas y deben corregirse.
- Resolución de diseño móvil: vertical **9:16** como referencia, responsive también en escritorio. No hacer el juego exclusivamente apaisado.
- Escenario reducido, cámara lateral, plataformas y terreno sencillos, capas de parallax opcionales. Sin castillos o paisajes monumentales como elemento principal.
- Ratón protagonista legible; pocos trabajadores visibles con animación sencilla si están contratados.
- Sprites PNG originales, sprite sheets o pixel art dibujado en Canvas; `image-rendering: pixelated` donde corresponda. Mantener escala de píxel consistente.
- UI con HUD (recursos existentes), objetivo/hito, panel contextual del edificio, acción manual, navegación compacta para Workers/Build/Recipes/Market y menú de opciones/dev.
- Controles táctiles cómodos, indicadores claros de botón inhabilitado, textos contrastados y animaciones cortas. Evitar que el HUD tape el gameplay.
- No hace falta arte final perfecto para validar economía; sí una experiencia visual coherente, atractiva y **realmente jugable**.

## 9. Stack y arquitectura técnica

Preferencia: **TypeScript + Vite**, HTML/CSS y Canvas 2D o DOM según convenga. Sin Unity, Unreal, rigs 3D ni backend obligatorio. Dependencias mínimas, scripts de arranque simples y código mantenible.

**Separación obligatoria de responsabilidades:**
- `game/state`: modelo único de datos;
- `game/config`: balance, recetas y definiciones;
- `game/systems`: mining, drilling, refinery, workers, construction, cheesery, merchant, progression, offline;
- `game/simulation`: tick/reloj, producción, reservas, almacenamiento;
- `ui/render`: escena, animaciones, paneles y entradas;
- `storage`: persistencia/versiones/exportación;
- `playtest`: telemetría local y herramientas de desarrollo.

Puede adaptarse la estructura al repositorio existente. Las acciones económicas deben ser **atómicas e idempotentes**. No basar la economía en efectos visuales ni en el número de frames renderizados. Simulación y render separados. El resultado de un guardado/carga a mitad de ciclo debe ser consistente.

## 10. Menú de herramientas de playtest (OBLIGATORIO)

Solo para desarrollo; acceso visible pero discreto y sin contaminar la partida normal:
- añadir monedas/materiales;
- acelerar simulación `×2` / `×10`;
- desbloquear fases, edificios y yacimientos;
- contratar trabajadores / cambiar niveles de máquinas;
- pausar y reanudar;
- reiniciar partida y seleccionar un escenario de prueba;
- forzar inventario lleno, veta agotada y ausencia de materia prima;
- consultar tasas por minuto, capacidades, bloqueos y recursos consumidos/producidos;
- exportar partida + métricas + eventos (JSON).

**Telemetría local, sin servicio externo:** duración de sesión; tiempo a cada desbloqueo; taps manuales por etapa; tiempos de espera; compras; producción y consumo por minuto; recetas descubiertas y lotes vendidos; periodos de bloqueo de cada máquina; errores. Si no se tiene consentimiento para analítica externa, los datos **no salen del navegador**.

## 11. Casos de prueba mínimos (implementa tests automatizados cuando sea viable)

1. Antes de revelar veta, picar no da Raw Cheese ni monedas.
2. Sin veta, el taladro no extrae. Al revelarla, un ciclo completo crea Raw Cheese una vez y consume veta.
3. Sin Raw Cheese, Refinery no produce. Con materia prima, consume input y genera output correctamente.
4. Almacén lleno detiene el proceso pertinente sin pérdida/duplicación.
5. Agotar veta bloquea extracción y habilita el camino hacia otro yacimiento.
6. Mejorar Drill aumenta su parámetro, **pero no lo automatiza**; contratar Driller lo automatiza, **pero no mejora arbitrariamente su velocidad**.
7. Sin Miner, no hay progreso de exploración offline; con Miner y trabajo válido sí, respetando límite.
8. Dos taps simultáneos, recarga durante ciclo y doble click en venta no duplican recursos/monedas.
9. Una receta descubierta y renombrada persiste; la fabricación consume inputs y produce un lote identificable.
10. Un pedido válido consume lote, paga correctamente y no puede entregarse de nuevo.
11. Trabajadores y máquinas se detienen ante cuellos de botella, recursos agotados y límite de almacenamiento.
12. Guardado/carga mantiene estado; un retorno offline se contabiliza una sola vez.
13. El recorrido desde nueva partida hasta **primera venta y segundo yacimiento** puede completarse sin dev tools.
14. La pantalla funciona en viewport móvil estrecho y ventana de escritorio sin acciones inaccesibles.

Crear pruebas unitarias de sistemas críticos (p. ej. Vitest), y, si es posible sin mucha carga, un smoke test end-to-end del flujo principal. Ejecutar y reportar resultados; no afirmar que está probado si no se ha ejecutado.

## 12. Forma de trabajar y entregables

Trabaja por bloques **jugables, no por mockups**:

**Milestone A — Fundamentos**: proyecto ejecutable, modelo de datos, escena lateral, Mining → Drill → Refinery, persistencia y test unitarios de economía.

**Milestone B — Producción gestionable**: parcelas, edificios, capacidades, almacenamiento, upgrades, los tres trabajadores y automatización fiable.

**Milestone C — Ciclo económico completo**: Cheesery, stats de recetas, Recipe Book, lotes, cuatro perfiles de comprador, pedidos y ventas, reinversión y segundo yacimiento.

**Milestone D — Pruebas internas**: progreso offline, dev tools, telemetría, balance provisional, test end-to-end, pulido del feedback visual y documentación.

En cada milestone: implementar → arrancar → probar → corregir → continuar. **No detenerte a pedir confirmación entre milestones**, salvo decisión verdaderamente bloqueante. Si un sistema es técnicamente difícil, entregar una implementación pequeña pero real e informar de la limitación; no reemplazarlo por una maqueta fingida.

**Archivos finales:**
- aplicación web ejecutable con `npm install` / `npm run dev` y `npm run build`;
- `README.md` en español con instrucciones sencillas, mapa de controles, arquitectura y cómo sustituir sprites;
- `BALANCE.md`: todas las cifras provisionales y dónde editarlas;
- `PLAYTEST.md`: guía de sesión de 45 minutos, checklist y preguntas para testers;
- `TEST_RESULTS.md`: pruebas ejecutadas, limitaciones, bugs conocidos y tareas pendientes;
- `CLAUDE.md` conservado en la raíz del repositorio como contrato del proyecto.

## 13. Definición de completado

La Alpha está lista **solo si** una persona puede, sin consola ni dev tools:
- revelar su primera veta, extraer y refinar;
- contratar al menos un trabajador de cada rol;
- reconocer y resolver un cuello de botella;
- descubrir y guardar una receta, fabricar un lote y completar una venta;
- reinvertir y desbloquear un segundo yacimiento;
- cerrar y volver al juego con estado consistente y producción offline acotada;
- jugar en móvil vertical con controles legibles y sin fallos graves.

Si falla cualquiera, documentar el bloqueo de forma explícita. No presentar una interfaz visualmente bonita como una Alpha completa.

## 14. Qué queda provisional y qué NO debe asumirse aprobado

**Decisiones de producto fijadas:** las 3 etapas distintas; vetas finitas; base building en parcelas; Miner/Driller/Refiner; upgrades separados; fórmulas de recetas con cuatro componentes; Recipe Book renombrable; Merchant con preferencias; idle/offline condicionado; pixel art side-view inspirado visualmente en Idleon; HTML/CSS/JS/TS con mínima intervención del usuario.

**Implementación propuesta para poder probar (NO canon):** ritmo de 45 min, dos yacimientos, 2×2×2×2 combinaciones, cuatro compradores, fórmulas numéricas, precios, salarios, tiempos, capacidades, costes y orden exacto de desbloqueo. Deben estar **centralizados y ser fáciles de modificar** tras el playtest. No inventar sistemas de monetización, energía o combate.

## 15. Instrucción final para Claude Code

**Empieza implementando inmediatamente.** Primero explica en no más de 8 líneas el stack elegido y los milestones. Luego crea el proyecto, ejecuta el juego y pruebas, comprueba los errores, y continúa hasta entregar la Alpha funcional definida arriba. Prioriza la simulación íntegra y una UX clara por encima de decoración. Si necesitas assets no proporcionados, crea placeholders pixel art originales reemplazables; no bloquees el desarrollo esperando sprites.
