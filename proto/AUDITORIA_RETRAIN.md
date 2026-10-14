# RETRAIN — auditoría y recomendación (V4.6)

> **Decisión (V4.8, 14-10-2026): aprobada la opción b e implementada.** Aleatorio entre las otras cuatro, mismo grado, mismo coste, misma duración y la misma plaza única. El resultado se sortea al empezar y se guarda en la partida (`s.care.to`); se revela al acabar.

Escrito el 14-10-2026. Código: `js/game/systems/mice.js` (`gradeOf`, `grow`, `careStart`, `careTick`, `careCost`) y `js/game/config/traits.js` (`M.jobGrades`, `M.care`, las especialidades).

## Cómo funciona hoy

- **Cómo llega una especialidad.** Cada trabajo de un ratón en un oficio suma a su contador de ese oficio (`m.jobs[oficio]`); la afinidad y algunos rasgos lo aceleran. Con **200 trabajos** recibe una especialidad de ese oficio **al azar** entre las 5 que hay. Puede tener una por oficio: hasta 6.
- **Grados.** El grado **no es de la especialidad, es del contador de trabajos de ese oficio**: I con 200, II con 2.000 y III con 20.000. Por eso reentrenar ya conserva el grado sin hacer nada especial: el contador no cambia.
- **Nivel del ratón y puestos.** El grado no depende del nivel global, solo de trabajar en ese oficio. Un ratón que cambia de puesto empieza a sumar en el oficio nuevo; el contador del anterior se queda donde estaba.
- **RETRAIN hoy.**
  - El jugador **elige** cuál de las otras 4 especialidades del oficio quiere.
  - Se mantiene el grado.
  - Dura 30 minutos y el ratón sigue trabajando.
  - Comparte el único sitio de la casa con los tratamientos: un ratón a la vez.
  - Cuesta 5.000 × 3^(reentrenos hechos en toda la partida): 5K, 15K, 45K… el 10.º cuesta unos 98M y el 20.º, unos 5,8T.
- **Combinaciones.** Algunas dependen de una especialidad concreta: Dreamer + Master Chef, Shy + Showman, Lucky + Vein Sniffer, Nocturnal + Night Driller y Good Nose + Seasoner. La de roca «Specialists» solo pide que los cuatro tengan alguna.

## Qué problema hay

Con el coste ×3 por reentreno, los primeros salen casi gratis y en la colonia media (unos 5T/min) unos 20 reentrenos cuestan menos de una hora de ingresos. Como **se elige el resultado**, montar a mano la especialidad ideal de cada ratón y las combinaciones que dependen de una especialidad es solo cuestión de esperar 30 minutos por paso. La decisión interesante («¿a quién merece la pena pulir?») se reduce a una lista de la compra.

## Recomendación

1. **Aleatorio, sí.** Reentrenar da una especialidad **al azar entre las otras 4** del oficio (nunca la misma). Hay incertidumbre, cuesta más conseguir la combinación perfecta y encaja con el espíritu de MICE: personajes únicos e imperfectos, sin garantías.
2. **Conservar el grado.** Es lo natural, porque el grado sale del contador de trabajos y no de la especialidad. Volver a grado I obligaría a inventar un contador por especialidad: castigaría a los ratones veteranos sin una vía razonable de recuperarlo. Bit Expert III pasaría a otra especialidad de grado III.
3. **Una limitación pequeña, sin monedas nuevas.** Para que tirar y tirar no sea trivial cuando sobra el dinero, propongo **una de estas dos** (no las dos):
   - **a)** que el coste suba por ratón y no por partida, para que pulir a uno concreto encarezca a ese y no a todos; o
   - **b)** mantener el coste global de hoy y añadir solo el azar. Es lo mínimo y quizá suficiente: cada tirada sigue costando 30 minutos de la única plaza de la casa, y eso ya frena.

   Mi preferencia es la **b**: medir primero cómo se siente el azar antes de tocar los costes.
4. **Ratones avanzados.** No pierden nada: conservan el grado y el resto de especialidades. Lo que cambia es que su especialidad «perfecta» pasa a ser un hallazgo y no una compra.
5. **Qué aporta a la progresión.** Más razones para volver (probar suerte con el ratón que importa), más valor a los ratones con la especialidad buena «de nacimiento» y combinaciones de especialidad que se sienten como hallazgos, como los rasgos legendarios.

**Para decidir:** ¿aleatorio entre las otras 4 manteniendo el grado (opción b)? Si lo aprobáis, el cambio es pequeño: `careStart` dejaría de recibir la especialidad elegida y `careTick` la sortearía al terminar. La TRAINING ROOM ya está preparada para enseñar el resultado al acabar.
