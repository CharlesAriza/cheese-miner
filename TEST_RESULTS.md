# Resultados de pruebas

Última ejecución: 11 de octubre de 2026.

## Pruebas automáticas

Ejecutadas abriendo `tests.html` en el navegador. **23 de 23 pasan.**

| Caso del contrato | Prueba | Resultado |
| --- | --- | --- |
| 1 | Picar revela vetas y nunca da queso ni monedas | pasa |
| 2 | El taladro necesita veta; un ciclo da Raw Cheese una vez y consume veta | pasa |
| 3 | La refinería necesita Raw Cheese; consume y produce una vez | pasa |
| 4 | El almacén lleno detiene la producción sin pérdida ni duplicación | pasa |
| 5 | Veta agotada bloquea; yacimiento agotado lleva al siguiente | pasa |
| 6 | Mejorar el taladro no lo automatiza; contratar no lo acelera | pasa |
| 7 | Exploración offline solo con Miner, respetando el tope | pasa |
| 8 | Taps rápidos, recarga a mitad de ciclo y doble clic en venta no duplican | pasa |
| 9 | Receta descubierta y renombrada persiste; fabricar consume y da un lote | pasa |
| 10 | Un pedido válido consume el lote, paga bien y no se entrega dos veces | pasa |
| 10 (extra) | Todo pedido generado lo cumple alguna receta de la Alpha | pasa |
| 11 | Los trabajadores paran ante cuellos de botella, vetas vacías y almacén lleno | pasa |
| 12 | Guardar y cargar mantiene el estado; el retorno offline cuenta una vez | pasa |
| 13 | De partida nueva a primera venta, tres roles y segundo yacimiento, sin dev tools | pasa |
| 13 (extra) | Un jugador lento también completa el circuito | pasa |
| — | El Cheesemaker cocina solo la receta asignada, de uno en uno, y para sin base o sin hueco | pasa |
| — | Regateo: un sobreprecio rechazado pierde al cliente pero nunca el queso ni monedas | pasa |
| — | Los clientes se van al agotar la paciencia; la reputación desbloquea compradores | pasa |
| — | La mejora de la Cheesery y la maestría aceleran los lotes; la maestría sube el valor | pasa |
| — | Las recompensas por objetivo se pagan una sola vez, y nunca por picar | pasa |
| — | Salvaguarda anti-bloqueo del siguiente yacimiento | pasa |
| — | La fórmula de stats coincide con la documentada, con sinergias | pasa |
| — | Las dev tools marcan la partida y no rompen invariantes | pasa |

El caso 13 lo juega un bot que solo usa las acciones del jugador y comprueba los invariantes cada 5 segundos de simulación (saldos no negativos, inventarios dentro de capacidad, vetas dentro de rango, trabajadores dentro de camas).

## Comprobaciones manuales en el navegador

Hechas sobre el juego real, pulsando los controles de la interfaz:

- Flujo completo desde cero con la interfaz de cadena y panel de estación: veta → taladro → refinería → Cheesery → receta con nombre → Market → venta.
- Contratar al Cheesemaker abre el Recipe Book; al asignarle una receta fabrica lotes solo hasta llenar el almacén.
- Abrir una zona muestra la explicación de qué se ha comprado y permite viajar; el paisaje y los iconos cambian de color.
- Tienda: elegir queso muestra los cuatro precios con su probabilidad; una venta con sobreprecio cobró lo anunciado, consumió el queso y sumó reputación.
- Doble clic en una venta: se cobró una sola vez.
- Contratar sin camas libres: se rechaza con mensaje.
- Recarga de la página: se conservan monedas, receta renombrada y trabajadores.
- Retorno tras 10 minutos simulados: aparece el resumen; una segunda llamada no produce nada.
- Almacén lleno: los botones lo indican y el toque explica el motivo.
- Abrir y cambiar al segundo yacimiento.
- Exportar: el JSON incluye partida, hitos, totales e indicador de dev tools.
- Reiniciar: cancelar conserva la partida; confirmar la borra.
- Caso 14: sin desbordamiento horizontal a 320×640, 375×812 y ventana de escritorio.
- Sin errores en la consola durante todo lo anterior.

## Lo que NO está probado

- **Dispositivos reales.** Solo se probó en el navegador de escritorio con vista móvil emulada. Falta probar en un teléfono: tacto, vibración, barra de direcciones, rendimiento.
- **Sonido.** Todo el sonido se rehízo (golpes con ruido, notas que suben en racha, campana de cliente, caja registradora) sin poder escucharlo; puede ser molesto o estar mal de volumen.
- **Arrastre de la escena y mantener pulsado.** La lógica funciona, pero los gestos con el dedo no se probaron.
- **Animaciones.** Los iconos que vuelan, el confeti y los contadores solo se revisaron en capturas sueltas, no en movimiento.
- **Importar una partida** desde la interfaz. El lector de guardados sí está cubierto por los tests.
- **Sesión humana de 45 minutos.** El ritmo solo está medido con un bot (ver BALANCE.md).
- **Test end-to-end automatizado** de la interfaz: no hay; el recorrido de interfaz se hizo a mano.

## Limitaciones conocidas

- **Arte placeholder.** Todo está dibujado por código. Es coherente y legible, pero queda lejos de la referencia aprobada. Necesita sprites reales (ver README).
- **Sin TypeScript ni Vite**, por no haber Node en el equipo de desarrollo.
- **Un solo guardado por navegador.** No hay sincronización entre dispositivos.
- **Los primeros clientes son todos vecinos**, porque los demás aparecen al subir la reputación.
- **La tienda no tiene mostrador ni vista interior propia**: los clientes se ven en la escena delante del puesto y en el panel.
- **Fuente pixel desde Google Fonts.** Sin conexión se usa una monoespaciada del sistema.

## Pendiente

- Publicar en GitHub Pages (requiere la cuenta del propietario).
- Sustituir placeholders por sprites finales.
- Ajustar el balance con datos de playtests reales.
- Decidir si Blue entra como tercera zona.
- Volver a medir el ritmo: el bot de las pruebas no usa al Cheesemaker, el regateo ni la mejora de la Cheesery.
- Siguiente paso acordado: zonas con profundidad y puestos en paralelo.
