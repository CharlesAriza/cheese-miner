# HOUSE como edificio de habitaciones — reflexión (V4.2, sin implementar)

Escrito el 14-10-2026, a petición, tras la cama pixel art de la V4.1. No cambia nada del juego: es una propuesta para decidir más adelante.

## La idea

Hoy HOUSE es una lista: la cama, contratar, el diario, el álbum y el interruptor de los gerentes. La cama demuestra que una **escena pequeña con una función** se entiende mejor que un bloque de controles.

La dirección propuesta: HOUSE como **edificio con habitaciones**. Cada una es una escena compacta con su utilidad, y la casa crece con el juego, como crecen los edificios de la cadena.

## Qué encaja hoy en cada habitación

| Habitación | Lo que ya existe y viviría ahí | Qué daría la escena |
|---|---|---|
| **Bedroom / Infirmary** | La cama: tratar una manía, reentrenar una especialidad, tiempo y estado | Ya hecha. Base de una futura «recuperación» (jubilación, descanso). |
| **Hiring Room** | HIRE NEW, los 3 candidatos pagados esperando, el precio | Los candidatos esperando en un banco: se ve que hay tres pagados sin abrir nada. |
| **Training Room** | Especialidades, sus grados y el reentrenamiento (hoy en la ficha y en la cama) | Ver quién está cerca de una especialidad o de subir de grado. |
| **Trophy Room** | El álbum (147 piezas, bono de venta), los legendarios, los títulos (Grand Master) | Vitrinas que se llenan: la colección como lugar. |
| **Common Room** | El diario de la colonia; hoy nada más | Futuras relaciones y afinidades entre ratones. Hoy estaría casi vacía: **no conviene abrirla aún**. |

El interruptor de los gerentes encaja mejor en una **oficina** (o en la Training Room) que en el salón.

## Cómo escalaría sin añadir pasos

- **HOUSE abre en un corte transversal del edificio:** una pantalla con todas las habitaciones a la vez, cada una de una o dos líneas y con su estado («Swiss en la cama · 26:44», «3 candidatos esperando», «2 especialidades a punto»). Un toque en una habitación la abre en grande.
- **Las habitaciones se ganan**, una por hito, como los edificios: se anuncian, se marcan y las construye el jugador (regla 7 del contrato). Al principio basta con dos: dormitorio y contratación.
- **Lo urgente sigue en COLONY:** el icono de cama en la tarjeta y el aviso de candidatos esperando. A HOUSE se va a decidir, no a descubrir que algo pasa.
- **Una habitación, una pregunta:** «¿quién está enfermo?», «¿a quién contrato?», «¿qué me falta coleccionar?».

## Riesgos

1. **Más navegación.** Cada habitación es un toque más. Si hay que entrar en tres habitaciones para ver si hay algo pendiente, se pierde lo ganado en la V4.1. Mitigación: el corte transversal enseña el estado de todas a la vez y los avisos siguen en COLONY.
2. **Habitaciones vacías.** Una habitación sin decisiones dentro es decorado y confunde (regla 6: solo se mueve lo que se puede explicar). La Common Room no debería existir hasta que tenga una mecánica.
3. **Duplicar funciones.** Contratar ya se hace desde la vacante y reentrenar desde la ficha. Si la habitación es un segundo sitio para lo mismo, son dos caminos. Mejor: la habitación es el sitio general y la vacante o la ficha son atajos al mismo flujo.
4. **Coste de arte.** Cada escena necesita sprites propios. Con arte por código se puede empezar, pero el propietario ya quiere arte final (pendiente de sus sprites).
5. **Alcance.** Es la base natural de MICE 2.0 (jubilación, generaciones, legado). Conviene diseñarlo **junto** con esas mecánicas, no antes, para no rehacer las habitaciones cuando lleguen.

## Recomendación

No abrir este trabajo todavía. Cuando se diseñe MICE 2.0:

1. Empezar con el **corte transversal** y solo dos habitaciones: Bedroom (la cama actual) y Hiring Room.
2. Mover el álbum a una Trophy Room cuando tenga más que enseñar, por ejemplo la categoría UNIFORMS propuesta en `AUDITORIA_V4_1.md`.
3. Training y Common, solo con mecánicas propias que las justifiquen.
