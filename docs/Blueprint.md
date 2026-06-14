# OneKey Closer · Documento Maestro y Blueprint de la App

**Versión 1.0 · Sistema de guía activa para ejecutivos junior**
**Desde el primer contacto hasta la reserva**

---

## Cómo leer este documento

Este documento tiene dos lectores:

1. **El ejecutivo / líder de equipo**: lo lee como manual de venta. Cada estación tiene el guión literal en chileno, qué escuchar, y qué hacer cuando el cliente se desvía.
2. **Claude Code (programación de la app)**: lo lee como especificación. Cada estación = una pantalla. Cada bloque marcado como `[LÓGICA APP]` es instrucción de comportamiento del sistema.

La app es **guía activa por clics**, no escucha en vivo. El ejecutivo avanza estación por estación tocando botones. El clic es la disciplina que obliga a seguir el riel.

---

## Principios no negociables del sistema

1. **CERO PROPIEDADES antes de terminar la Estación 2 (Discovery).** La app NO permite avanzar a Estación 4 sin completar Discovery. Bloqueo duro.
2. **El perfil se auto-detecta en Estación 3**, pero el ejecutivo puede corregirlo.
3. **El "no" lo dice el cliente, nunca el silencio del ejecutivo.** La app obliga a registrar si se ofreció la reserva.
4. **Una reunión nunca termina sin: (a) reserva ofrecida, (b) si reservó, promesa agendada.**
5. **Modo 2 reuniones**: la Reunión 1 corta al final de Estación 3. La Reunión 2 arranca en Estación 4.

---

## Mapa de las 6 estaciones

| # | Estación | Duración | Qué pasa |
|---|----------|----------|----------|
| 1 | Apertura | 2-3 min | Encuadre + consentimiento de notas |
| 2 | Discovery | 15-20 min | 8 preguntas críticas · cero propiedades |
| 3 | Perfil + Semáforo | 2-3 min | App auto-detecta · bifurca · **corte Reunión 1** |
| 4 | Proyecto + Palancas + Anclaje | 10 min | Recién acá aparecen propiedades |
| 5 | Objeciones | variable | Loop de 5 pasos · 4 grandes pre-resueltas |
| 6 | Cierre + Reserva | 5 min | Cierre sugerido por perfil · pedido · Día 0 |

Las objeciones (Estación 5) pueden gatillarse también DENTRO de la Estación 6.

---

# ESTACIÓN 1 · APERTURA

**Objetivo**: tomar el control del frame y conseguir el consentimiento de notas. Duración: 2-3 min.

`[LÓGICA APP]` Pantalla con: nombre del ejecutivo y del cliente (pre-cargados desde GHL), el guión de apertura visible en grande, y UN botón al final: "✅ Cliente dio consentimiento de notas → Continuar". El botón no se activa hasta que el ejecutivo lo tilda manualmente (confirma que pidió permiso).

## Guión literal (chileno)

"Hola [nombre cliente], soy [nombre ejecutivo], asesor patrimonial en OneKey. Gracias por tu tiempo.

Esta reunión es el primer paso para lograr tu objetivo, sea inversión, crecimiento patrimonial o compra de una propiedad. Te voy a ser honesto desde ya: vamos a hacer algo distinto a lo que quizás esperas. Yo NO te voy a mostrar departamentos todavía.

Primero necesito entender bien tu situación, porque no estás comprando un par de zapatillas — esta es de las decisiones financieras más importantes de tu vida. Y mi análisis solo sirve si es sobre tu caso real, no sobre un folleto genérico.

**Una cosa antes de partir: voy a tomar notas de la reunión para mandarte un resumen completo después. ¿Te parece bien?**

[ESPERAR EL SÍ — sin el sí, no se activan las notas de Gemini]

Perfecto. La dinámica es simple: te voy a hacer unas preguntas, algunas personales sobre tu situación financiera. Necesito que seas lo más real posible — sin eso no puedo armarte nada serio. Al final, si lo que vemos te hace sentido, vas a poder dejar tu mejor opción asegurada. ¿De acuerdo? Partamos."

## Qué escuchar
- ¿El cliente acepta el frame o intenta apurarte a "mostrame departamentos"? Si te apura, mantené el frame: "Justamente para no hacerte perder el tiempo con departamentos que no te calzan, déjame entender tu caso primero. Son 15 minutos."

## Si el cliente se desvía
- **"Solo quiero ver precios / cotizaciones"** → "Te entiendo, y te las voy a dar — pero precios sin contexto te confunden más que te ayudan. Dame 15 minutos de preguntas y después los números van a tener sentido para TU caso."
- **"Tengo poco tiempo"** → "Perfecto, vamos directo entonces. ¿Cuánto tiempo tienes? [ajusta] Con eso me alcanza para lo esencial."

`[LÓGICA APP]` La frase "al final vas a poder dejar tu mejor opción asegurada" siembra la reserva desde el minuto 2. Es obligatoria en el guión — mata el factor sorpresa del cierre.

---

# ESTACIÓN 2 · DISCOVERY

**Objetivo**: detectar las 4 capas (situación financiera, motivación profunda, criterio de decisión, urgencia/timing) sin mencionar ninguna propiedad. Duración: 15-20 min.

`[LÓGICA APP]` Pantalla con las 8 preguntas, una a una o en lista scrolleable. Cada pregunta tiene: el texto a leer (grande), tags clicables para registrar la respuesta, y campo de notas opcional. Banner fijo arriba en rojo: **🚫 CERO PROPIEDADES HASTA TERMINAR ESTA ESTACIÓN**. El botón "Continuar a Perfil" se bloquea hasta que las 8 preguntas tengan al menos un tag o nota.

## Las 8 preguntas críticas

### Capa 1 — Situación financiera real

**P1.** "Cuéntame, ¿en qué trabajas y hace cuánto?"
`[LÓGICA APP]` Tags: [Dependiente] [Independiente] [Empresario] [Renta de inversiones] · [<1 año] [1-3 años] [3+ años]
*Por qué*: estabilidad de ingreso, base del semáforo crediticio.

**P2.** "¿Cuál es aproximadamente tu renta líquida mensual? ¿Y tienes deudas activas — hipotecario, consumo, tarjetas? ¿Cuánto en total?"
`[LÓGICA APP]` Input numérico: renta líquida (CLP). Input numérico: deuda total (CLP). Tags: [Sin deudas] [Deuda baja] [Deuda media] [Deuda alta] [Morosidades]
*Por qué*: insumo directo del semáforo. La pregunta de morosidades es crítica.

**P3.** "¿Cuánto tienes disponible hoy para el pie? No es lo mismo armar estrategia con 5 millones que con 50. Y dime con confianza si todavía no tienes pie juntado — eso también lo trabajamos."
`[LÓGICA APP]` Doble input: monto en CLP (input principal) **y** equivalente en UF (auto-calculado, UF ref = $41.000, la app toma el valor real del día en producción). Tags de rango:
- 🔴 [No tiene pie / negativo] (deudas > ahorro)
- [$0 – $5MM]
- [$5MM – $15MM] (≈ UF 122–366)
- [$15MM – $30MM] (≈ UF 366–732)
- [$30MM – $50MM] (≈ UF 732–1.220)
- [$50MM – $80MM] (≈ UF 1.220–1.951)
- [$80MM+] (≈ UF 1.951+)
- 💰 [Compra al contado]

*Por qué*: ancla la capacidad y alimenta el perfil y el semáforo. El rango "No tiene pie" no descalifica — deriva a ruta de preparación (igual que semáforo Rojo). "Compra al contado" salta señales de Inversionista/Experto.

### Capa 2 — Motivación profunda

**P4.** "¿Qué te motivó a buscar esto AHORA y no hace 3 años?"
`[LÓGICA APP]` Tags: [Juntó capital] [Cambió situación] [Miedo a quedar atrás] [Oportunidad puntual] [Exploración] · Slider urgencia 1-5.
*Por qué*: urgencia real vs exploración.

**P5. (LA pregunta del dolor — no se salta)** "¿Y qué pasa si dentro de 3 años sigues sin invertir? ¿Cómo se ve tu situación?"
`[LÓGICA APP]` Tags: [Quedarse igual] [Perder poder adquisitivo] [Frustración] [Miedo a vejez/retiro] [Indiferente] · Slider intensidad emocional 1-5.
*Por qué*: sin dolor con emoción (slider ≥3), el cliente no está listo. Si slider <3, es exploración fría.

**P6.** "Aparte de la rentabilidad, ¿hay alguien específico en quien estés pensando con esto? Hijos, padres, tu retiro."
`[LÓGICA APP]` Tags: [Hijos] [Pareja] [Padres] [Retiro propio] [Solo rentabilidad]
*Por qué*: la motivación emocional bajo la racional. Combustible para las palancas de Estación 4.

### Capa 3 — Criterio de decisión

**P7.** "¿Con quién más vas a tomar esta decisión?"
`[LÓGICA APP]` Tags: [Solo yo] [Pareja] [Socio] [Asesor financiero] [Familia]. Si NO es "Solo yo" → flag visible: "⚠️ DECISOR OCULTO — incorporar antes de la reserva".
*Por qué*: si hay otro decisor, se incorpora ANTES de pedir reserva, no después.

**P8. (combina criterio + urgencia)** "Del 1 al 10, ¿qué tan listo estás para avanzar en los próximos 60 días? Y si encontráramos la opción ideal, ¿qué te llevaría a NO hacerlo?"
`[LÓGICA APP]` Slider 1-10 (prontitud) + tags de freno: [Nada me frena] [Necesito ver números] [Miedo al crédito] [Dudas del proyecto] [Tema pareja] [Otro]. **Regla dura: slider <7 → la app marca "NO pedir reserva hoy → Nurturing".**
*Por qué*: bajo 7 no es cierre, es nurturing. Sobre 7 es luz verde. Los frenos son las objeciones futuras, regaladas.

## Qué escuchar (transversal)
`[LÓGICA APP]` Estas 3 ayudas van FIJAS y VISIBLES en pantalla durante toda la Estación 2 (panel lateral o pie de pantalla, siempre a la vista). El ejecutivo no las tiene que recordar — las ve mientras conversa.
- **Silencios productivos**: deja que el cliente piense. No llenes el silencio.
- **Toma nota visible** — al cliente le da seguridad ver que anotas su caso.
- **Si se abre un dolor (P5), no lo pases rápido**: "Cuéntame más de eso."

## Si el cliente se desvía
`[LÓGICA APP]` Estas respuestas van VISIBLES en pantalla durante la Estación 2 (acordeón "¿Cliente se desvió?" siempre accesible con un toque). El ejecutivo las lee sin perder el hilo.
- **"¿Y qué departamentos tienen?"** (la trampa más común) → "Ya llegamos a eso, te lo prometo. Pero si te muestro ahora, te estaría vendiendo a ciegas. Dos preguntas más y pasamos a lo bueno."
- **Cliente que no quiere dar números** → "Entiendo que es información sensible. Te lo pregunto porque sin saber tu capacidad real, cualquier proyecto que te muestre es adivinanza. Un rango aproximado me basta."

---

# ESTACIÓN 3 · PERFIL + SEMÁFORO

**Objetivo**: la app procesa el discovery, auto-detecta perfil y semáforo crediticio, y el ejecutivo confirma o corrige. **Corte de Reunión 1 si trabajan en 2 sesiones.** Duración: 2-3 min.

`[LÓGICA APP]` Al cerrar Estación 2, la app calcula automáticamente PERFIL y SEMÁFORO con las reglas de abajo. Muestra el resultado en pantalla con resumen de las 4 capas + el perfil detectado + el semáforo. El ejecutivo ve dos botones: "✅ Confirmar perfil" y "✏️ Corregir perfil" (dropdown con los 4). Y para el semáforo igual. Recién con el perfil confirmado se desbloquea Estación 4 — y la app carga las palancas/anclajes/cierre correctos para ESE perfil.

## Reglas de auto-detección de PERFIL (definidas por el sistema)

La app evalúa en este orden y asigna el primero que calce:

**INVERSIONISTA EXPERTO** si:
- Tiene 1+ propiedades de inversión (P1/P6) **Y**
- Maneja indicadores (mencionó cap rate / ROI / plusvalía sin que se lo expliquen) **Y**
- Pie disponible ≥ UF 1.500

**INVERSIONISTA** si:
- Tiene al menos 1 propiedad O pie ≥ UF 1.000 **Y**
- Motivación claramente de rentabilidad (P5 tag "perder poder adquisitivo" / P6 tag "solo rentabilidad") **Y**
- Prontitud (P8) ≥ 7

**PRIMERA INVERSIÓN** si:
- Sin propiedades de inversión previas **Y**
- Motivación incluye rentabilidad/futuro (P4/P5) **Y**
- Pie ≥ UF 500 **Y**
- Prontitud ≥ 6

**VIVIENDA PROPIA** si:
- Motivación dominante es uso propio / familia (P6 tags "hijos"/"pareja" + lenguaje de "vivir", "mi casa") **O**
- No calza en las anteriores y el foco es habitacional, no de renta.

`[LÓGICA APP]` Si el cliente queda ambiguo entre dos perfiles, la app muestra los dos más probables y pide al ejecutivo que elija. Siempre prevalece la corrección del ejecutivo.

## Reglas del SEMÁFORO crediticio (definidas por el sistema)

Cálculo: **dividendo estimado ≈ (UF del proyecto objetivo) ÷ 200** en UF/mes. Como en Estación 3 aún no hay proyecto, se usa el rango de pie × 9 como proxy del valor de propiedad alcanzable (pie ≈ 10%). Ese dividendo se compara contra la renta líquida (P2).

> ⚠️ El factor ÷200 es una aproximación para tasas vigentes 2026. Validar contra el simulador hipotecario de OneKey y ajustar antes de fijar en la app.

- **🟢 VERDE**: dividendo estimado ≤ 25% de renta líquida **Y** sin morosidades (P2) **Y** pie ≥ 10% del valor objetivo. → Cierre completo, pedir reserva con todo.
- **🟡 AMARILLO**: dividendo entre 25-35% de renta, **O** renta variable (independiente sin antigüedad), **O** pie justo. → SÍ se pide reserva, con honestidad: "tu caso necesita trabajo fino de crédito, por eso conviene congelar la unidad ya y usar los 7 días para dejar la pre-aprobación lista". Pre-aprobación gatillada Día 1. Evaluar complemento de renta si hay pareja (P7).
- **🔴 ROJO**: dividendo > 35% de renta, **O** morosidades activas, **O** sin pie. → NO se pide reserva. Pivote a "ruta de preparación crediticia 6 meses" → etapa Nurturing en GHL.

`[LÓGICA APP]` El semáforo ROJO bloquea el botón de reserva en Estación 6 y muestra el guión de pivote. El ejecutivo puede override con confirmación del líder (campo de autorización), por si hay contexto que la app no captó (ej: complemento de renta de un tercero no declarado en P2).

## Guión de cierre de Reunión 1 (solo modo 2 reuniones)

"[Nombre], con todo lo que conversamos ya tengo clarísimo tu perfil y puedo armarte algo a tu medida. Lo que vamos a hacer: yo preparo las 2-3 mejores opciones para tu caso específico, y nos juntamos [fecha concreta] para que las veas con números reales. Mientras tanto, te voy a mandar una lista corta de documentos para ir adelantando tu pre-aprobación de crédito — así cuando decidas, vamos rápido y sin trabas. ¿Te calza el [día/hora]?"

`[LÓGICA APP]` En modo 2 reuniones, Estación 3 termina agendando la Reunión 2 en GHL Calendar y disparando la tarea de documentos. En modo 1 reunión, continúa directo a Estación 4.

---

# ESTACIÓN 4 · PROYECTO + PALANCAS + ANCLAJE

**Objetivo**: recién acá aparecen propiedades. Mover las 4 palancas y aplicar el anclaje correcto según perfil. Duración: 10 min.

`[LÓGICA APP]` La app carga esta pantalla con el contenido FILTRADO por el perfil confirmado en Estación 3. El ejecutivo ve: (a) la Ficha de Proyecto del Mes con los números reales, (b) las 4 palancas con frases-modelo de SU perfil, (c) el anclaje recomendado de SU perfil con la calculadora de cifras del cliente pre-llenada (usa el pie de P3 y la renta de P2). Botón al final: "Continuar a Cierre" o "Apareció objeción → ir a Estación 5".

## Las 4 palancas (marco fijo, frases por perfil)

La Value Equation: **Valor = (Resultado deseado × Probabilidad) / (Tiempo × Esfuerzo)**. Subir numerador, bajar denominador. El precio aparece DESPUÉS de mover las 4.

### Palanca 1 — Subir resultado deseado
Conectar el resultado al destino emocional detectado en P6.

- **Vivienda Propia**: "Imagínate llegando a TU casa, sin pedirle permiso a nadie, sabiendo que cada peso que pagas es tuyo y no del arrendador. Eso es lo que estamos armando."
- **Primera Inversión**: "Esto no es un departamento, es tu primer activo. El que te va a generar ingreso mientras duermes y el que abre la puerta al segundo. Tu yo de 5 años más te lo va a agradecer."
- **Inversionista**: "Esta unidad te suma UF [X] anuales de flujo y se aprecia [Y]% proyectado. Es un ladrillo más en tu muro patrimonial."
- **Experto**: "Cap rate proyectado [X]%, sobre tu costo de oportunidad actual. Es eficiente y escala con tu portafolio."

### Palanca 2 — Subir probabilidad de logro
Data dura, casos reales, track record OneKey, garantías cuando apliquen.

- **Todos los perfiles**: "Mira los números de la comuna: tasa de captura [X]%, arriendo promedio UF [Y] para esta tipología. No es promesa mía, es data del mercado. Y nosotros llevamos [N] años haciendo esto — tenemos clientes con tu mismo perfil ya arrendando."
- **Primera Inversión** (extra tranquilidad): "Y no estás solo en esto: te acompañamos en cada paso, desde la promesa hasta que el arriendo esté funcionando."

### Palanca 3 — Bajar tiempo al resultado
Cifras concretas de cuándo empieza el retorno.

- **Todos**: "Desde el mes 2 post-entrega ya estás arrendando. En [N] años recuperas el pie. No es para tus nietos — es para ti, pronto."

### Palanca 4 — Bajar esfuerzo del cliente
Servicio llave en mano.

- **Todos**: "Y lo mejor: tú no te complicas con nada. Nosotros gestionamos promesa, escritura, búsqueda de arrendatario, administración. Tú firmas, revisas y cobras."
- **Vivienda Propia** (adaptado): "Nosotros te acompañamos en todo el papeleo — promesa, crédito, escritura. Tú solo te preocupas de elegir el color de las paredes."

## Anclaje de precio por perfil

`[LÓGICA APP]` La app pre-llena las cifras con el pie (P3) y renta (P2) del cliente. El ejecutivo solo lee.

### Anclaje invertido (base, para Primera Inversión e Inversionista)
"Antes de ver el precio del proyecto, una cosa. Tú hoy tienes aproximadamente UF [pie del cliente] entre cuenta y ahorros, ¿correcto? Esa plata, con inflación de 4% anual, está perdiendo UF [pie × 0.04] al año. En 5 años son UF [pie × 0.2] que no vuelven. ¿Estamos de acuerdo en que ese es tu escenario si no haces nada? [ESPERAR EL SÍ] Perfecto. Ahora veamos cómo se ve si lo cambiamos."

### Variante Vivienda Propia (emocional, sin números pesados)
"No lo mires como un gasto. Hoy, si arriendas, esa plata se va y no vuelve nunca — es de otro. Acá, cada peso que pones es tuyo, construye tu patrimonio. Es la diferencia entre pagar la casa de otro o la tuya."

### Variante Inversionista (anclaje por costo de oportunidad financiero)
"Si dejas tus UF [pie] en un fondo conservador, sacas 3% real al año, UF [pie × 0.03]. Acá, esas mismas UF como pie controlan un activo de UF [valor], que te genera UF [arriendo anual] al año más plusvalía. Compara los dos números."

### Variante Experto (anclaje temporal + precio futuro)
"Hoy en verde está a UF [precio]. Con la tendencia de la comuna, en blanco a la entrega se transa a UF [precio × 1.15-1.20]. Estás comprando un activo que ya vale más mañana. La UF de entrada de hoy no se sostiene en lista."

## Ficha de Proyecto del Mes (plantilla a llenar por el líder)

`[LÓGICA APP]` Esta ficha es un formulario que el líder de equipo llena 1 vez al mes con los 3-5 proyectos activos. Todos los ejecutivos la usan. Campos por proyecto:
- Nombre del proyecto y comuna
- Tipologías disponibles (1D, 2D, studio) + m²
- Precio desde (UF) por tipología
- Arriendo estimado (UF/mes) por tipología
- Tasa de captura de la comuna (%)
- Plusvalía proyectada (%)
- Fecha de entrega
- Pie mínimo (%) y monto de reserva
- **Urgencia legítima REAL**: ¿sube lista? ¿fecha? ¿unidades limitadas? (esto alimenta el Cierre 3)

---

# ESTACIÓN 5 · OBJECIONES

**Objetivo**: desarmar objeciones con el loop de 5 pasos. Se gatilla desde Estación 4 o desde Estación 6. Duración: variable.

`[LÓGICA APP]` Pantalla con dos modos:
1. **Las 5 grandes pre-resueltas**: 5 botones. Al tocar uno, se despliega el guión completo del loop para esa objeción. 
2. **Objeción nueva**: campo de texto donde el ejecutivo escribe la objeción del cliente → la app llama a Claude (Haiku) con el prompt fijo y devuelve el loop de 5 pasos armado para esa objeción específica, considerando el perfil. ~3-5 seg.
Botón "Objeción resuelta → volver" que regresa a la estación donde estaba (4 o 6).

## El loop de 5 pasos (marco fijo, siempre visible arriba)

1. **Acuerdo** — "Entiendo perfectamente por qué dices eso."
2. **Aislamiento** — "Además de eso, ¿hay algo más que te frene?"
3. **Indagación** — "¿Qué específicamente te hace pensar [objeción]?"
4. **Reframe** — entregar la nueva información que reduce la fricción.
5. **Test de cierre** — "¿Con eso despejado, te hace sentido avanzar?"

Regla: si el cliente vuelve a objetar, se vuelve al loop con la nueva objeción. Nunca se pelea. Siempre se loopea.

## Las 4 grandes — guiones completos

### Objeción 1: "Lo voy a pensar / lo converso con mi pareja"
*Diagnóstico: 80% miedo encubierto, 20% verdad operativa.*
- **Acuerdo**: "Por supuesto, una decisión así se piensa, y conversarla en pareja es lo correcto."
- **Aislamiento**: "Antes de cerrar, déjame asegurarme: además de conversarlo con [pareja], ¿hay algo más del proyecto, del flujo o del proceso que necesites resolver?" → si dice "no, eso no más" = operativo real, avanza. Si menciona algo más = ESE es el punto, loopealo.
- **Indagación**: "Para que la conversación con [pareja] sea productiva, ¿qué crees que va a querer saber ella/él? Porque la pareja suele tener 2-3 preguntas específicas, y si no las llevas resueltas, queda en 'mejor lo pensamos más'."
- **Reframe**: "Lo que mejor funciona es una llamada de 20 minutos con [pareja]. Yo le explico lo mismo que a ti — tú no tienes que ser el vendedor de tu propia inversión. ¿Mañana o pasado?"
- **Test de cierre**: "¿Te calza martes 7 o miércoles 8?"

### Objeción 2: "Está caro / mejor espero que bajen las tasas"
*Diagnóstico: compara contra el precio histórico que ya pasó, no contra el futuro.*
- **Acuerdo**: "Te entiendo, es lo que mucha gente está pensando ahora."
- **Aislamiento**: "¿Es el precio del departamento lo que se siente caro, o es la cuota mensual lo que te preocupa? Son dos cosas distintas."
- **Indagación**: "¿Con qué estás comparando para decir caro? ¿Otro proyecto, el precio de hace 2 años, tu presupuesto inicial?"
- **Reframe (con data dura)**: Si compara con hace 2 años: "Hace 2 años este modelo costaba UF [X]. Hoy UF [Y]. Subió [Z]%. El año que viene, con esa tendencia, UF [W]. Esperar te sale más caro que comprar caro." Si compara con esperar tasas: "Las tasas bajaron fuerte por última vez en [año]. ¿Sabes qué pasó con los precios? Subieron [X]%. Cuando bajan las tasas sube la demanda, suben los precios y desaparece el inventario bueno. Esperar la tasa perfecta es llegar tarde."
- **Test de cierre**: "¿Vemos las dos formas de financiar para que veas la cuota concreta y decidas desde ahí?"

### Objeción 3: "Quiero comparar con otros proyectos"
*Diagnóstico: oro. Comparar es lo que hace un inversor serio. No te defiendas, facilítalo.*
- **Acuerdo**: "Excelente, eso es lo que haría un buen inversor. Comparar mal es peor que no comparar."
- **Aislamiento**: "¿Qué proyectos específicos estás viendo? Te pregunto porque conozco casi todos los activos en venta en Santiago y te puedo ahorrar el análisis."
- **Indagación**: "¿Qué criterios estás usando? Porque la mayoría compara precio por m², y ese es el que MENOS importa para inversión."
- **Reframe**: "Para inversión importan: cap rate proyectado, tasa de captura de la comuna, plusvalía histórica vs proyectada, perfil del arrendatario, y costo total (no precio inicial). Te propongo algo: dame los 2-3 que estás viendo y armo la comparación con criterios reales. Si el otro gana, te lo digo y te ayudo a llevarlo. Mi negocio es que inviertas bien, no que inviertas conmigo."
- **Test de cierre**: "¿Te calza tener el comparativo para el viernes?"

### Objeción 4: "Solo quiero info, no quiero reunión / mándame todo"
*Diagnóstico: resistencia al cierre, miedo a presión.*
- **Acuerdo**: "Claro, nadie quiere sentirse presionado."
- **Aislamiento**: "¿Qué es lo que no quieres que pase si nos juntamos a revisar tu caso?" → casi siempre "que me presionen".
- **Reframe**: "Te propongo algo distinto: en vez de mandarte 30 PDFs que vas a filtrar solo, hagamos 15 minutos donde te entrego el análisis personalizado de TU situación. Si al minuto 14 sientes que no aporta, cortas. ¿Justo?"
- **Test de cierre**: "¿Tienes esos 15 minutos esta semana o la próxima?"

### Objeción 5: "Quiero ir a verlo antes de decidir"
*Diagnóstico: mezcla. Algunos tienen interés real, otros lo usan para evadir la reserva. No importa cuál sea — el manejo es el mismo: la reserva agenda la visita y garantiza la devolución. La reserva no compite con la visita, la habilita.*
- **Acuerdo**: "Me parece perfecto, y de hecho te lo recomiendo — una inversión así hay que verla en persona."
- **Aislamiento**: "Antes de coordinar la visita, déjame preguntarte: si vas, te gusta lo que ves y los números te cierran, ¿hay algo más que te frenaría para avanzar?" → si dice "no, nada más" = interés real, cierra con la visita. Si menciona algo más = ESE es el punto real, loopealo primero.
- **Reframe (ancla de reserva → visita)**: "Hagamos esto: dejas la reserva de $100.000 ahora, congelamos la unidad, y vamos juntos a verla. Si en persona no te convence, te devuelvo el 100% ahí mismo y sin preguntas. Así no arriesgas nada, y te aseguras de que la unidad siga disponible cuando la veas — porque si la dejas suelta, perfectamente la toma otro antes de tu visita."
- **Test de cierre**: "¿Te parece? Dejamos la reserva y coordinamos la visita para [día]. ¿Te calza [opción A] o [opción B]?"

`[LÓGICA APP]` Esta objeción es botón fijo en Estación 5 (las 5 grandes pre-resueltas). Tras resolverla, el flujo vuelve a Estación 6 con la reserva + agendamiento de visita como microcompromiso. El "Día 0" en este caso agenda la visita además de (o antes de) la promesa.

`[LÓGICA APP]` Prompt para objeción nueva (Claude Haiku): "Eres un coach de cierre inmobiliario chileno. El cliente (perfil: [PERFIL]) objetó: '[OBJECIÓN]'. Aplica el loop de Belfort de 5 pasos (Acuerdo, Aislamiento, Indagación, Reframe, Test de cierre) y devuelve cada paso con una frase literal en chileno, lista para leer. Máximo 1 frase por paso. No inventes datos de proyecto; usa variables [X] donde falten cifras."

---

# ESTACIÓN 6 · CIERRE + RESERVA

**Objetivo**: pedir la reserva con el cierre correcto según perfil, y agendar la promesa (Día 0). Duración: 5 min.

`[LÓGICA APP]` La app muestra: (a) el cierre SUGERIDO según perfil (1 destacado + 1 alternativo), (b) el guión del pedido de reserva de SU perfil, (c) un checklist obligatorio de salida. Si el semáforo es ROJO, en vez del pedido muestra el guión de pivote a Nurturing. Botones de salida: "✅ Reservó" / "Ofrecí y dijo no" / "No alcancé a ofrecer". El primero abre el sub-flujo Día 0.

## Mapa de cierre por perfil (la app sugiere)

| Perfil detectado | Cierre sugerido | Alternativo |
|------------------|-----------------|-------------|
| Analítico (Inversionista/Experto que pide datos) | Alternativo | Pregunta inversa |
| Emocional (Vivienda/Primera con dolor alto) | Asumido | Pregunta inversa |
| Procrastinador (prontitud 7-8, dudas) | Urgencia legítima | Asumido |
| Decisor rápido (prontitud 9-10) | Pregunta inversa | Asumido |

## Los 4 cierres (guiones)

### 1. Cierre asumido (Cardone) — para emocional
No preguntas si compra, asumes el sí y ofreces opciones operativas.
- "Perfecto. ¿Ponemos la reserva el viernes o prefieres el lunes?"
- "¿La promesa la firmamos en notaría de Providencia o más cerca de tu casa?"
Baja el costo psicológico del sí — ya está implícito.

### 2. Cierre alternativo — para analítico
Dos opciones operativas, ambas avanzan.
- "¿Empezamos con el modelo de 1D o el de 2D?"
- "¿Te conviene financiar 80% o 90%?"
El cliente decide entre dos avances, no entre avanzar y no avanzar.

### 3. Cierre por urgencia legítima — para procrastinador
SOLO con razón real (de la Ficha de Proyecto). NUNCA inventada.
- "Las unidades de este modelo están limitadas. La inmobiliaria sube lista el [fecha real]. Si quieres asegurar esta UF, hay que reservar antes."
Si es verdad funciona; si es mentira, quema la relación.

### 4. Cierre por pregunta inversa (Ziglar) — para decisor rápido
- "¿Te gustaría tener una propiedad que te genere UF [X] al año desde [año]?" → "Sí, claro." → "Entonces lo único que decidimos hoy es si lo haces conmigo o con otro. Y eso ya lo decidiste hace 30 minutos cuando dijiste que confiabas en el análisis. ¿Vamos?"

## El pedido de reserva (guión base + variantes)

**Base (todos)**: "[Nombre], te propongo algo. No me digas hoy si compras. Dime si quieres congelar esta unidad. La reserva son $100.000, completamente reembolsables, y te guarda el departamento 7 días. Si en esos 7 días decides que no, te devuelvo el 100% y quedamos igual de bien. Lo único que no puedo hacer es guardártela gratis — si mañana otro la quiere, se va. ¿La congelamos? Te paso el link y queda en 2 minutos."

- **Vivienda Propia**: "...por 100 lucas reembolsables, durante 7 días esta casa es tuya para decidir con calma, sin que nadie te la quite. Es comprarte tranquilidad, no comprometerte."
- **Primera Inversión**: "...y en esos 7 días no estás solo: te acompaño paso a paso, vemos juntos la pre-aprobación, resolvemos dudas, y recién ahí decides. La reserva solo asegura que la unidad te espere mientras hacemos ese trabajo juntos."
- **Inversionista / Experto**: "...en 7 días la lista puede moverse y esta UF de entrada no se sostiene. La reserva congela el precio de hoy. Es la opción call más barata del mercado: $100.000 reembolsables por asegurar UF [X] de upside. ¿La tomamos?"

## Manejo de objeción DENTRO del cierre

`[LÓGICA APP]` Si al pedir la reserva el cliente objeta, botón "Apareció objeción → Estación 5". Especialmente el "lo voy a pensar" en el cierre = miedo, no duda. La app muestra acceso rápido a la técnica de 3 pasos:
1. **Validar el miedo**: "Entiendo que es una decisión grande y da nervio. Es normal."
2. **Aislar el miedo**: "Si te quito el nervio dándote claridad en algo concreto, ¿qué tendría que ser?"
3. **Microcompromiso (la reserva)**: "¿Qué tal si en vez de decidir HOY si compras, decides hoy si reservas? Son $100.000 reembolsables, 7 días de exclusividad. Te da tiempo de pensar SIN perder la unidad." → la reserva no es comprar, es no perder.

## Checklist de salida (OBLIGATORIO)

`[LÓGICA APP]` La reunión no se cierra en la app sin completar:
1. `Reserva Ofrecida`: Sí / No (si No, pide motivo).
2. Si reservó → `Día 0`: agendar fecha y hora de firma de promesa en GHL ANTES de cerrar. Campo obligatorio.
3. `Perfil` confirmado + `Semáforo`.
4. Disparo a GHL: actualizar contacto, tags, etapa de pipeline, y si reservó, gatillar el workflow "Protocolo Reserva 7 Días".

## Guión Día 0 (post-pago de reserva)
"Listo, felicitaciones — la unidad es tuya por 7 días. Último paso de hoy: dejemos agendada YA la firma de la promesa, así los 7 días trabajan para ti y no en tu contra. ¿Te calza el [día 6-7] a las [hora]? [agendar en GHL en vivo] Perfecto. Mañana te llega un WhatsApp con la lista de documentos para dejar tu crédito pre-aprobado antes de la firma. Quedamos en contacto."

## Guión de pivote (semáforo ROJO — no se pide reserva)
"[Nombre], te voy a ser honesto, porque para eso me pagan y porque te respeto: hoy un banco no te aprobaría esto, y yo no te voy a hacer perder plata ni ilusión. Lo que SÍ vamos a hacer es armarte una ruta de [N] meses para que califiques sin problema: [ordenar deudas / juntar pie / antigüedad]. Te dejo agendado un seguimiento mensual y cuando estés listo, retomamos donde quedamos. ¿Te parece?"

---

# ANEXOS

## A. Modos de operación
- **Modo 1 reunión**: corre las 6 estaciones seguidas (30-60 min).
- **Modo 2 reuniones**: Reunión 1 = Estaciones 1-3 (corta en perfil + agenda Reunión 2 + tarea documentos). Reunión 2 = Estaciones 4-6.

## B. KPIs que la app registra (eventos)
- `step_started` / `step_completed` / `step_abandoned` por estación + timestamp.
- `tiempo_por_estacion`.
- `reserva_ofrecida` (Sí/No).
- `perfil_detectado` vs `perfil_corregido` (mide precisión de la auto-detección).
- `semaforo`.
- `resultado_reunion`.
- Dashboard por ejecutivo: tiempo por estación, dónde abandona, tasa de ofrecimiento, % de uso vs reuniones reales.

## C. Stack técnico (extender app actual del Railway)
- Front: el existente (Next.js sobre la base actual).
- BD: Supabase (respuestas estructuradas, eventos, perfiles).
- IA: Claude Haiku para objeción nueva (Estación 5) + resumen final; Claude Opus para resumen que va a GHL.
- CRM: GHL vía API (contacto, tags, pipeline, workflows).
- Captura de notas: Gemini en Meet (con consentimiento) → handoff a GHL (vía Make/Zapier, definir después; n8n descartado por ahora).

## D. Lo que la app NO hace (resistir la tentación)
- NO escucha la conversación en vivo (legal + sobrecarga al junior + latencia).
- NO graba audio.
- NO toma decisiones por el ejecutivo — sugiere, el ejecutivo decide y puede corregir.
- NO reemplaza el criterio: es un riel, no un piloto automático.
