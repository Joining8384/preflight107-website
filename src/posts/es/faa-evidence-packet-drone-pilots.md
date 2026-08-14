---
title: El FAA Evidence Packet — El documento posterior al vuelo que te salva cuando alguien pregunta "¿Estabas seguro?"
date: 2026-05-23
excerpt: Un Mission Briefing demuestra que planificaste el vuelo correctamente. Un FAA Evidence Packet demuestra qué era realmente cierto en el momento en que volaste. La mayoría de los pilotos no construye ninguno de los dos, y termina reconstruyendo la historia de memoria meses después, cuando un ajustador de seguros o un inspector de la FAA finalmente llama. Aquí te explicamos qué contiene un Evidence Packet, cuándo desearás haber tenido uno y cómo generarlos automáticamente.
readTime: 8 min de lectura
---

## La llamada que ningún piloto espera

Han pasado tres meses desde una inspección de techo de rutina. El vuelo duró dieciocho minutos. Nada salió mal. Lo olvidaste el mismo día en que terminaste de facturarlo.

Entonces suena tu teléfono. Es el dueño de la propiedad. Han estado haciendo trabajos de renovación en el techo que fotografiaste, y ahora el contratista dice que hay marcas de rozadura en una unidad de HVAC que no era visible desde el suelo. El dueño de la propiedad quiere saber si tu dron pudo haberlas causado.

Lo piensas un segundo. ¿*Pudo* haberlas causado? Tu DJI estuvo allá arriba. Estabas volando de manera conservadora. No recuerdas haberte acercado tanto. Pero han pasado tres meses. Realmente no recuerdas la trayectoria específica. Tomaste fotos del techo, claro, pero no tomaste fotos del HVAC. No tienes reproducción del vuelo. No tienes registros con la resolución por segundo que necesitarías para probar altitud y proximidad.

Puedes decir "no creo que lo haya hecho" con confianza. No puedes decirlo con pruebas.

Este es el momento en que un piloto desearía haber tenido un **FAA Evidence Packet**: un registro sellado por servidor y a prueba de manipulaciones de lo que era realmente cierto en el momento del vuelo. No un recuerdo. No una captura de pantalla. Un documento que dice, con certeza criptográfica: a las 14:23 hora local del 4 de marzo, la aeronave estaba a 47 pies AGL, sobre las coordenadas X/Y, con viento de 6 kt desde 280°, METAR KGRR 191453Z reportando VFR, y el piloto estaba certificado, vigente y asegurado.

Este artículo trata sobre qué contiene ese documento, cuándo necesitarás uno y por qué el acto de construirlo es lo que separa a los pilotos que ganan disputas de los pilotos que las pierden.

## Mission Briefing vs. Evidence Packet — Dos documentos diferentes

Los pilotos suelen confundir estos dos. Están relacionados, pero son distintos, y sirven a audiencias diferentes.

El **Mission Briefing** es el documento del *plan*. Lo construyes antes del vuelo. Captura:

- Lo que pretendías hacer (objetivo de la misión, despegue planificado, ruta)
- El pronóstico que viste (TAF, viento planificado, visibilidad planificada)
- El espacio aéreo que analizaste (estado de LAANC si aplica, NOTAMs revisados)
- La evaluación de riesgo que realizaste
- La lista de verificación previa al vuelo que ejecutaste
- Los datos de tu piloto y aeronave

El Mission Briefing responde a la pregunta: **"¿Hizo el piloto su tarea antes de despegar?"** Demuestra la debida diligencia. Es lo que le entregas a un cliente para demostrar profesionalismo, o lo que presentas cuando alguien pregunta "¿revisaste el espacio aéreo?".

El **FAA Evidence Packet** es el documento del *registro*. Se genera a partir de tu bitácora de vuelo después del vuelo (a menudo de manera automática, sellado por servidor). Captura:

- Lo que realmente sucedió (coordenadas GPS reales de despegue y aterrizaje, duración real del vuelo)
- Las condiciones que estuvieron realmente presentes (METAR real obtenido en el momento del vuelo, no pronóstico)
- El estado del espacio aéreo al momento del vuelo
- Tu registro de certificación de piloto y estado de vigencia al momento del vuelo
- La cobertura de seguro vigente al momento del vuelo

El Evidence Packet responde a una pregunta diferente: **"¿Qué era realmente cierto en el momento del vuelo?"** Prueba las condiciones bajo las que operaste. Es lo que quiere un ajustador de seguros. Es lo que quiere un inspector de la FAA que revisa una investigación. Es lo que quiere un abogado si el dueño de una propiedad te demanda.

El Mission Briefing es lo que hiciste antes de despegar. El Evidence Packet es lo que realmente sucedió cuando volaste. **Necesitas ambos.** Los abogados de seguros y los inspectores de la FAA normalmente no se conforman con uno sin el otro: la documentación adecuada incluye tanto el plan como el registro.

## Qué contiene un buen FAA Evidence Packet

No toda "evidencia" es igual. Una foto de tu app del clima es técnicamente evidencia, pero no es evidencia muy *sólida*: es una captura de pantalla de un solo cliente, tomada a una hora poco clara, sin cadena de custodia. Un Evidence Packet bien construido tiene propiedades que resisten cuestionamientos.

Un Evidence Packet defendible debe incluir:

1. **Marcas de tiempo selladas por servidor.** No el reloj de tu teléfono. Un servidor central registra los momentos de despegue/aterrizaje con su propio reloj y los almacena de forma inmutable. Esto prueba que no antedataste la bitácora.

2. **Coordenadas GPS verificadas de despegue y aterrizaje.** Latitud/longitud con al menos cuatro decimales. La bitácora de vuelo registra dónde despegó el dron y dónde regresó.

3. **METAR obtenido de la fuente oficial en el momento del vuelo.** No "aproximadamente cómo estaba el clima". La cadena METAR real del AWC (el Aviation Weather Center de la FAA) para la estación más cercana, obtenida al momento del despegue y fijada en el registro.

4. **Instantánea de la certificación del piloto.** Tu número de certificado Part 107 y estado de vigencia (es decir, si tu capacitación recurrente de 24 meses estaba vigente) a la fecha del vuelo. No "actualmente estoy certificado". *¿Estaba certificado al momento del vuelo en cuestión?*

5. **Registro de la aeronave.** Tu número de registro de la FAA y el modelo y número de serie específicos del dron que volaba ese día.

6. **Seguro vigente.** Número de póliza, aseguradora y cobertura vigente al momento del vuelo.

7. **Un hash criptográfico en cada página.** Un hash SHA-256 calculado a partir de todos los datos anteriores, estampado en cada página del PDF resultante. Si alguien modifica un solo carácter del PDF, el hash deja de coincidir. Esto es lo que lo hace a prueba de manipulaciones.

8. **Un punto de verificación.** Una URL pública donde el destinatario puede pegar el hash y confirmar que el documento es auténtico, sin tener que creer en la palabra del piloto.

Esa última propiedad —la verificabilidad independiente— es la diferencia entre un documento que un piloto *dice* que es real y un documento que cualquiera puede *confirmar* que es real.

## Cuándo desearás haber tenido uno

La mayoría de los pilotos pasará toda su carrera sin necesitar producir un solo Evidence Packet. Los pilotos que *sí* lo necesitan suelen descubrir por las malas que no lo tienen. Aquí está la lista real de momentos en que se exige este documento:

**Investigación de la FAA tras una queja.** Alguien —un propietario, un administrador de propiedad, un competidor— presenta una queja ante la FAA. La FAA abre una investigación. El inspector de la Flight Standards District Office (FSDO) te llama. La pregunta es alguna variación de: "En la fecha en cuestión, ¿estabas operando en cumplimiento con Part 107?". Tienes que demostrar que sí. El Evidence Packet muestra tu altitud, tu distancia de las personas, tu autorización de espacio aéreo y tus condiciones. Sin él, estás describiendo tu recuerdo de un vuelo de hace meses.

**Reclamo de seguro que involucra al dron.** Una propiedad resulta dañada cerca de un sitio donde volaste. Un ajustador de seguros quiere confirmar o descartar la participación del dron. Quieren saber: ¿qué estaba haciendo el dron al momento del supuesto incidente? ¿Estaba en el aire? ¿Dónde? ¿A qué altitud? Tu aseguradora pedirá documentación. Si la proporcionas de forma limpia, el reclamo se resuelve de forma limpia. Si no puedes, tu aseguradora asume por defecto el peor escenario.

**Disputa con un cliente sobre entregables.** Un cliente afirma que el vuelo no sucedió, o que no sucedió durante la ventana que pagó, o que volaste donde no debías. Un Evidence Packet con coordenadas y horas de despegue/aterrizaje selladas por servidor termina esta conversación a tu favor de inmediato.

**Citación en una demanda.** Alguien está demandando a otra persona, y una de las partes tiene interés en saber si había un dron en el área. Recibes una citación para presentar registros. Tus Evidence Packets se entregan al abogado; el abogado confirma o descarta la participación del dron con base en las coordenadas.

**Auditoría anual de tu negocio.** Algunos operadores comerciales de drones son auditados por sus clientes comerciales (empresas de servicios públicos, contratistas gubernamentales, firmas inmobiliarias con políticas de responsabilidad estrictas). Quieren verificar que operas en cumplimiento en todos tus vuelos. Les entregas la carpeta de Evidence Packets del periodo.

El patrón es: **casi nunca necesitas este documento, pero cuando lo necesitas, nada más lo sustituye.** Y el momento de construir el sistema de documentación es *antes* de la investigación, no después.

## Qué hace la mayoría de los pilotos en su lugar (y por qué se desmorona)

El enfoque de evidencia "hágalo usted mismo" del piloto suele verse así:

- Una bitácora en Google Sheets con fecha, hora del vuelo, ubicación y un campo de texto libre de "notas del clima"
- Capturas de pantalla de UAV Forecast o AccuWeather de antes del vuelo
- Una hora de vuelo registrada en el control de tu DJI (que no se sincroniza con ningún lado)
- Una factura con una fecha (si fue un vuelo pagado)
- Tal vez algunas fotos del vuelo real

Esto funciona bien para la contabilidad. No resiste un cuestionamiento. Específicamente:

- La hoja de cálculo no tiene marca de tiempo en sus entradas individuales. Podrías haber agregado una fila ayer para un vuelo de hace tres meses. No hay prueba de que no lo hicieras.
- La captura de pantalla del clima se tomó en tu teléfono. Sin cadena de custodia. Los metadatos de la imagen se pueden editar. La versión de la app que usaste tal vez ya no exista.
- La bitácora del control DJI prueba que el dron voló; *no* prueba que tú eras el piloto, que estabas certificado en ese momento, ni en qué espacio aéreo estabas.
- La factura prueba que ocurrió una transacción. No prueba bajo qué condiciones operaste.
- Las fotos prueban que tomaste fotos. No prueban altitud, distancia, certificación ni estado del seguro.

El problema no es que los pilotos sean flojos. Es que lo que se necesita para *probar* que se operó en cumplimiento es distinto de lo que se necesita para *operar* en cumplimiento. Puedes ser completamente legal y no tener ningún registro de que fuiste completamente legal.

## Generar evidencia automáticamente — El enfoque de PreFlight 107

En PreFlight 107, cada vuelo que registras genera un Evidence Packet completo como subproducto. No tienes que acordarte de construirlo. No tienes que capturar el clima por separado. No tienes que adjuntar los archivos correctos.

Así funciona:

1. **Tocas "Depart"** cuando despegas. La app captura de inmediato tus coordenadas GPS, busca el METAR más cercano del AWC, obtiene tu perfil de dron activo, tu estado de seguro y tu vigencia de Part 107. Todo esto se sella por servidor con el momento exacto en que tocaste Depart.

2. **Vuelas.** La app corre en segundo plano. No tienes que hacer nada más.

3. **Tocas "Land"** cuando terminas. La app registra tus coordenadas de aterrizaje y la duración real del vuelo con las mismas marcas de tiempo del servidor. También se captura el METAR posterior al vuelo (a veces el clima cambia durante un vuelo; esto importa para la reconstrucción de accidentes).

4. **La bitácora de vuelo aparece en tu lista "My Flights"** con el botón Evidence. Tócalo y la app genera el PDF del Evidence Packet a demanda. El PDF incluye todo: coordenadas y horas de despegue/aterrizaje, clima en cada momento, tu instantánea de certificación, los datos de tu aeronave, tu seguro vigente y un hash criptográfico SHA-256 estampado en cada página.

5. **Si además tienes un Mission Briefing** para ese vuelo (de antes del despegue), puedes adjuntarlo al Evidence Packet para que ambos documentos viajen juntos. El resultado es un único entregable que responde tanto "¿qué planificaste?" como "¿qué sucedió realmente?".

6. **Cualquier destinatario puede verificar el hash** visitando preflight107.com/verify y pegando el hash del pie de página del PDF. La página confirma que el documento coincide con el registro del servidor y que no ha sido modificado.

Todo el flujo son dos toques: Depart y Land. El Evidence Packet existe desde el momento en que aterrizas. Puedes entregarlo a un cliente el mismo día, o puedes dejarlo en tu archivo y recuperarlo solo el día en que alguien pregunte.

## Por qué "automático" importa más que "exhaustivo"

Existe una tensión en la documentación de cumplimiento entre lo *exhaustivo* y lo *automático*. Un documento exhaustivo registra cada detalle de cada vuelo. Un documento automático registra los detalles correctos con cero intervención del piloto.

Exhaustivo sin ser automático = un gran flujo de trabajo que nadie sigue. Automático sin ser exhaustivo = muchos registros, pero ninguno de los que realmente necesitas.

La apuesta de PreFlight 107 es que **automático + los detalles correctos** le gana a *exhaustivo + manual* siempre. Aquí está el porqué:

- Los pilotos vuelan más de 100 vuelos al año. La documentación manual se degrada con el tiempo a medida que se desvanece la novedad.
- Las mayores fallas de cumplimiento no ocurren porque los pilotos no *conocieran* las reglas. Ocurren porque los pilotos no *capturaron* las condiciones bajo las que operaron en el momento de la operación.
- Cuando llega la investigación, no tienes oportunidad de reconstruir qué era cierto hace tres meses. Los datos existen a la resolución correcta, o no existen.
- El tú del futuro siempre estará menos motivado que el tú del presente para documentar algo a fondo. Construye el sistema en torno a las limitaciones del tú del futuro.

Los pilotos que ganan disputas no son los pilotos más cumplidores. Son los pilotos con más *documentación*. Y tienen documentación porque el sistema hizo el trabajo por ellos.

## Cuando llega la llamada

Volviendo al escenario del inicio: tres meses después, el dueño de la propiedad llama. Quiere saber si rozaste la unidad de HVAC.

Con un Evidence Packet, abres tu teléfono, navegas hasta ese vuelo, generas el PDF y, en 30 segundos, tienes un documento que muestra tu historial de altitud, tus coordenadas GPS durante todo el vuelo, las condiciones del momento y la certificación + seguro que tenías. Se lo reenvías al dueño de la propiedad con una nota breve: "Aquí está el registro completo del vuelo de ese día. Como puede ver, el dron se mantuvo por encima de los 35 pies AGL durante todo el vuelo, y el paso más cercano a la ubicación del HVAC que menciona fue de 22 pies en horizontal. No creo que mi vuelo haya causado esas marcas. Si desea una verificación independiente, este documento es verificable por hash en preflight107.com/verify."

Esa es la diferencia entre un piloto que puede responder con confianza + pruebas, y un piloto que solo puede responder con "no creo que lo haya hecho".

Casi nunca necesitarás este documento. Pero los pilotos que ganan cuando la llamada sí llega son los que construyeron el sistema para generarlo automáticamente, antes de tener algún motivo para pensar que lo necesitarían.

Vuela seguro. Y documéntalo.
