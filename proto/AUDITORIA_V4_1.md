# V4.1 — Auditorías (prototipo `proto-shop`)

Medido el 14-10-2026 con la simulación (`jsc`, colonias de prueba `proto/three.json`, `mid.json`, `late.json` y el bot casual, semilla 13). Nada de esto cambia la economía.

## 1. Gerentes (rango Manager): qué automatizan de verdad

**Cómo funciona (código: `CM.mice.managersTick`, `js/game/systems/mice.js`).**

- Cada 2 s de simulación, cada ratón Manager **en un puesto** mira el árbol de su oficio y compra **una** mejora: la más barata que se pueda comprar.
- Solo si cuesta **como mucho el 10 % de las monedas** que tienes (`B.mice.managerBudget`).
- Gasta las mismas monedas que el jugador.
- No compra hitos ni lo que abre funciones (`unlock`), ni inversiones (`key`, como las Night Lamps). Tampoco toca el árbol de la colonia ni el del laboratorio.
- El investigador Manager no compra nada: no hay árbol del oficio Research.
- Funciona igual con el juego cerrado: es la misma simulación.
- Se puede apagar en HOUSE («Managers buy upgrades»).
- Comparte las monedas con BUY ALL y con las compras a mano. No reserva nada ni compite en prioridad: compra quien llegue antes.

**Alcance medido.**

| Escenario | Compras de los gerentes | Comentario |
|---|---|---|
| Bot casual 12 h (compra cada 20 s) | **2** en toda la partida (min 163) | El jugador se adelanta: cuando un gerente mira, lo barato ya está comprado. |
| 8 h sin jugador, colonia de 3 rocas | 0 | Aún no hay Managers. |
| 8 h sin jugador, colonia media (3 Managers) | **10** (5 Trading, 5 Refining) | Diferencia de ingresos dentro del ruido del azar. |
| 8 h sin jugador, colonia avanzada (20 Managers) | **0** | Árboles casi agotados; lo que queda cuesta más del 10 %. |

En el bot casual, a las 8 h la partida con gerentes había ganado 7,6Qa y la de sin gerentes 8,7Qa. No es una ventaja: sus dos compras tempranas gastaron un 10 % de las monedas en un mal momento, y además el azar de la partida diverge.

**Conclusión.** Hoy MANAGER automatiza muy poco y no quita motivos para volver: el tope del 10 % y el agotamiento de los árboles lo frenan. El riesgo aparecerá con los **árboles profundos** (entrega 4): con mejoras sin fin y baratas, un gerente por puesto lo compraría todo solo.

**Propuestas para más adelante (sin implementar):**

1. **Presupuesto que fija el jugador**, por ejemplo «gasta hasta X por hora»: automatiza lo rutinario, pero la cantidad es una decisión.
2. **Solo el rango siguiente de lo que ya has comprado tú**: el gerente mantiene, el jugador elige qué ramas crecer.
3. **El gerente recomienda y no compra**: marca «UP!» con su cara y el jugador confirma.
4. **Un gerente por oficio y no por puesto**, para que veinte gerentes no compren veinte veces más.

## 2. Álbum

**De dónde salen las entradas.**

- Al contratar un ratón y cada vez que desarrolla algo (rasgo, especialidad, tratamiento), `CM.mice.note` apunta su pelaje, gorro, accesorio, rasgos y combinaciones propias.
- Cada 2 s, `CM.mice.scan` apunta las combinaciones de línea y de roca que estén formadas.
- Lo apuntado no se pierde aunque el ratón se vaya. Cada entrada sube un 1 % el precio de venta.

**Comprobado:**

- En las tres colonias de prueba y tras 10 h del bot no falta nada de lo que llevan los ratones actuales ni de las combinaciones formadas.
- Guardar y cargar conserva exactamente las mismas entradas.
- Todas las entradas se pueden conseguir con las reglas actuales.

**No hay desincronización que corregir.** Lo que puede dar la sensación de álbum «atrasado» es lo que **no** registra por diseño:

- Los **uniformes** (Master) y el aspecto de **Manager**: el álbum guarda el gorro de nacimiento, no el de trabajo.
- Los **rangos**, los **grados de especialidad** (I, II, III), las **cepas** y las **recetas** (estas tienen su propio libro).
- Los candidatos vistos y no contratados.

**Propuesta acotada (sin implementar):** una categoría **UNIFORMS**, con 6 oficios × Master, más 6 «Manager de…», que se apunte al ascender. Encaja con la progresión visual que pedís y no toca los criterios actuales.

## 3. Tienda, stock y mayorista

**Funcionamiento (`CM.shop.start`).**

- Cada venta coge primero el queso más caro.
- En las estanterías caben unos **3 minutos de ventas**; lo que sobra se lo lleva el mayorista a mitad de precio, empezando por lo más barato.
- Así el stock no crece sin fin: queda en unos 3 minutos de lo que la tienda vende.

**Medido (30 minutos de juego):**

| Colonia | Producido/min | Puede vender/min | Al mayorista | Stock máximo | Monedas del mayorista |
|---|---|---|---|---|---|
| 3 rocas | 7,8K | 49,8K | 0 | 132 | 0 % |
| Media | 97,4K | 83,3K | 15 % del queso | 3,0 min de ventas | 1,5 % |
| Avanzada | 275K | 186K | 43 % del queso | 3,0 min de ventas | 3,7 % |

- **Conservación:** producido = vendido + mayorista + cambio de stock + venta en curso. La diferencia de unos pocos quesos son las muestras que da el laboratorio al descubrir una receta, que no pasan por las estadísticas de las rocas.
- **No se pierde ni se duplica nada.**
- **Por qué se ve tanto queso:** el que queda en las estanterías es casi todo el más barato (Cheddar), porque lo caro se vende antes. Es la restricción intencional de capacidad. Ahora se ve en SHOP.
- **Fallo de contabilidad corregido:** las monedas del mayorista (`totals.wholesaleCoins`) se apuntaban antes del bonus del tendero, así que la cifra quedaba por debajo de lo cobrado. Ahora se apuntan con él. Lo cobrado de verdad no cambia.

## 4. Navegación de MICE (fallo confirmado y corregido)

**Causa.** `micePanel` enseñaba los candidatos pagados antes que cualquier otra vista.

- Tocar a Monty abría MICE con su ficha anotada, pero salía el reclutamiento.
- Al contratar desaparecían los candidatos y se abría la ficha que llevaba esperando.

**Corrección:**

- Los candidatos solo se ven si el jugador va a ellos (`ui.miceTab = 'recruit'`). Quedan esperando, pagados, con un aviso en COLONY y en HOUSE.
- Al contratar se limpian la ficha, el puesto elegido y el modo mover.
- Pedir candidatos desde otra vacante con tres ya pagados no cobra: los mismos tres irán a esa vacante.

## 5. BOOSTS

**Antes.** El mismo toque ponía un refuerzo si quedaba alguno libre y cabía, y si no, quitaba uno de ese puesto. No se podía prever.

**Ahora.** Tocar un puesto solo lo elige. Debajo hay una barra fija con:

- el puesto;
- cuántos tiene (n/2) y lo que dan;
- cuántos quedan libres;
- **−** y **+** separados, apagados cuando no se puede, con el motivo («full: 2 per post», «no free boost»).

La mecánica (`CM.boosts.place/remove`) no cambia.

## 6. Chapas UP!/NEW! recortadas

La caja de abajo (`.controls`) tiene scroll propio y recortaba lo que asoma por encima de las casillas. Eso es la chapa (−7 px), la casilla elegida (−3 px) y el anillo de 3 px de la animación de novedad. Se le ha dado ese margen dentro: alto fijo, 5 px más que antes, que no cambia mientras se juega.
