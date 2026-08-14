---
title: Peligros aeronáuticos explicados — Cómo leer PIREPs, SIGMETs y AIRMETs como piloto de dron
date: 2026-05-18
excerpt: Los pilotos tripulados llevan décadas usando PIREPs, SIGMETs y AIRMETs para evitar sorpresas en vuelo. Aquí te explicamos cómo decodificar cada uno en lenguaje sencillo, y por qué importan incluso cuando vuelas por debajo de 400 ft.
readTime: 8 min de lectura
---

## Por qué a los pilotos de dron deberían importarles los reportes meteorológicos de "aviación tripulada"

Podrías pensar que los PIREPs y SIGMETs son solo para capitanes de aerolínea y pilotos de Cessna que crucean a 8,000 ft. No lo son. La atmósfera no se detiene a 400 ft AGL: la turbulencia, el engelamiento, la cizalladura de viento y el clima severo ocurren a toda altitud, y las condiciones que un Boeing 737 reporta al descender hacia tu aeropuerto local suelen ser las mismas condiciones que esperan para zarandear tu dron en el momento en que despegue.

Los reportes de peligros aeronáuticos son emitidos por el Aviation Weather Center del National Weather Service (aviationweather.gov), la misma fuente autoritativa que usa la aviación tripulada. Tres tipos de reportes importan más a los pilotos de dron: **PIREPs**, **SIGMETs** y **AIRMETs**. Cada uno te dice algo distinto sobre la masa de aire alrededor de tu área de vuelo.

## PIREPs — Reportes de pilotos

Un **PIREP** es un Pilot Report (reporte de piloto): una observación en vuelo transmitida por radio por un piloto real que describe lo que está experimentando. Los PIREPs son lo más parecido que tiene la aviación a una "reseña de Yelp para el cielo". Se emiten en tiempo real, por humanos, sobre condiciones atmosféricas específicas.

Hay dos tipos:
- **UA** — Reporte de piloto *de rutina*. Nada dramático, solo una actualización de estado.
- **UUA** — Reporte de piloto *urgente*. Algo significativo: turbulencia severa, engelamiento severo, cizalladura de viento a bajo nivel, granizo, ceniza volcánica.

Si ves un UUA cerca de tu sitio de despegue, **no vueles**. Lo que sea que causó el reporte urgente está ocurriendo *ahora*.

### Un PIREP real, decodificado

Aquí hay un PIREP típico emitido cerca del San Francisco International:

```
SFO UUA /OV SFO /TM 0054 /FL001 /TP B738 /RM LLWS +20KT DURD
```

Se ve críptico. Desglosémoslo campo por campo:

- **SFO** — La estación de reporte es San Francisco International.
- **UUA** — Es un reporte **urgente**. Presta atención.
- **/OV SFO** — La ubicación del reporte: sobre el aeródromo de SFO.
- **/TM 0054** — La hora de observación: 00:54 UTC (siempre hora Zulú en aviación).
- **/FL001** — Flight level 001 = 100 ft AGL. (FL son cientos de pies — FL050 serían 5,000 ft.)
- **/TP B738** — Tipo de aeronave: Boeing 737-800.
- **/RM** — Remarks (observaciones; la sección más importante, en texto plano).
- **LLWS** — **Low Level Wind Shear** (cizalladura de viento a bajo nivel). Un cambio súbito y dramático en la velocidad o dirección del viento en una corta distancia vertical. Extremadamente peligroso para cualquier aeronave.
- **+20KT** — El desplazamiento de la cizalladura fue una variación de +20 nudos.
- **DURD** — Durante el descenso.

**La traducción en lenguaje sencillo:** Un Boeing 737 que descendía para aterrizar en SFO reportó una cizalladura de viento súbita de +20 nudos a 100 ft sobre el suelo a las 00:54 UTC.

**Qué significa esto para un piloto de dron:** Si planeabas volar cerca de SFO esa noche, estarías operando en la misma masa de aire que acaba de zarandear a una aeronave del tamaño de un 737. Tu dron de 249 gramos daría vueltas de campana. No volar, rotundo.

### Campos comunes de PIREP que verás

| Código | Significado | Por qué le importa al piloto de dron |
|---|---|---|
| **/TB LGT** / **/TB MOD** / **/TB SEV** | Intensidad de turbulencia (Ligera/Moderada/Severa) | Moderada o peor = el dron no mantiene posición |
| **/IC LGT** / **/IC MOD** / **/IC SEV** | Intensidad de engelamiento | Si la humedad se congela en una aeronave tripulada, las hélices también pueden engelarse |
| **/SK OVC012** | Condición del cielo: cubierto a 1,200 ft AGL | Este es tu techo de nubes legal para operaciones con dron |
| **/SK SCT040** | Nubes dispersas a 4,000 ft | Menos restrictivo |
| **/WV 27045G55KT** | Viento desde 270° a 45 nudos con ráfagas de 55 | Muy por encima de la mayoría de los límites de viento del dron |
| **/WX RA** / **/WX SN** / **/WX TS** | Lluvia / Nieve / Tormenta eléctrica | Todas son condiciones rotundas de no volar |
| **DURD** / **DURC** | Durante el descenso / Durante el ascenso | En qué parte de la trayectoria de vuelo ocurrió el reporte |

## SIGMETs — Información meteorológica significativa

Un **SIGMET** es una advertencia formal emitida por clima **severo** que afecta la seguridad de vuelo. A diferencia de los PIREPs (que son observaciones), los SIGMETs son *pronósticos* de condiciones peligrosas en un área geográfica definida. Los emite el Aviation Weather Center del NWS y aplican a todas las aeronaves.

Los SIGMETs cubren seis tipos de peligros:
1. **TURB** — Turbulencia severa o extrema
2. **CONV** — Actividad convectiva (tormentas eléctricas, tornados)
3. **IFR** — Condiciones generalizadas de Instrument Flight Rules (baja visibilidad / techos bajos)
4. **ICE** — Engelamiento severo
5. **MTN** — Oscurecimiento de montaña
6. **ASH** — Ceniza volcánica

**Regla general para pilotos de dron:** Si un SIGMET activo se superpone con tu área de vuelo, **no vueles**. Los SIGMETs se emiten cuando el NWS considera que el peligro es lo bastante severo como para amenazar a aeronaves tripuladas; tu dron tiene aún menos margen de error.

Los SIGMETs son válidos para una ventana de tiempo específica (normalmente de 4 a 6 horas) y un polígono específico en el mapa. Se actualizan y reemiten a medida que las condiciones evolucionan.

## AIRMETs — Información meteorológica para aviadores

Un **AIRMET** es un escalón por debajo de un SIGMET: la misma idea pero para peligros **moderados**, no severos. Los AIRMETs se emiten para condiciones que afectan la seguridad de la aeronave pero con un umbral de intensidad más bajo.

Los AIRMETs vienen en tres variantes:
- **AIRMET Sierra** — Condiciones IFR o oscurecimiento de montaña
- **AIRMET Tango** — Turbulencia moderada o vientos sostenidos de 30 nudos o más
- **AIRMET Zulu** — Engelamiento moderado y niveles de congelación

**Traducción para el piloto de dron:**
- Un AIRMET en tu área no es un no-volar automático, pero es una "bandera amarilla": procede con precaución adicional.
- Un AIRMET Tango con vientos sostenidos de 30+ nudos = la mayoría de los drones de consumo no pueden operar con seguridad.
- Un AIRMET Zulu con niveles de congelación por debajo de 5,000 ft = el rendimiento de tu batería se desplomará y el torque del motor podría verse afectado.

## Ejemplo del mundo real: un día en la vida de un peligro aeronáutico

Digamos que eres un piloto Part 107 haciendo una toma inmobiliaria un martes por la mañana en Denver. Abres PreFlight 107 y la tarjeta de Aviation Hazards muestra:

- **2 PIREPs** dentro de 50 nm (ambos de rutina, cielo despejado a 3,500 ft, sin turbulencia)
- **1 AIRMET Tango** activo hasta las 1500 UTC (vientos sostenidos de 35 kt en altitud, válido sobre el área de Denver)
- **0 SIGMETs**

**Decodificando la situación:**
- Los PIREPs te dicen que la masa de aire cerca de la superficie está en calma y el techo de nubes es alto.
- El AIRMET Tango dice que los vientos en altura son fuertes: eso es una bandera amarilla. Por encima de ~2,000 ft AGL estarías en vientos de 35 kt, pero las operaciones con dron son por debajo de 400 ft, así que el viento *de superficie* importa más.
- Revisa tu METAR para las condiciones de superficie. Si el viento de superficie está por debajo de 15 kt y el diferencial de ráfaga es pequeño, probablemente puedas volar *bajo*, pero mantén los vuelos breves y permanece atento a que los vientos superiores se mezclen hacia abajo.

Este es el tipo de toma de decisiones matizada que permiten los datos de peligros aeronáuticos. Sin ellos, o volarías a ciegas o te quedarías en tierra innecesariamente.

## Cómo maneja esto PreFlight 107

La tarjeta de Aviation Hazards en el Dashboard obtiene PIREPs (filtrados por bbox a 50 nm de tu sitio de despegue), SIGMETs y AIRMETs directamente de la API del Aviation Weather Center de la FAA. Cada peligro está:

- **Decodificado en línea** — los códigos de turbulencia y engelamiento traducidos a lenguaje sencillo, las condiciones del cielo convertidas a "Cubierto a 1,200 ft AGL" en lugar de "OVC012"
- **Codificado por severidad** — puntos verdes para rutina, amarillos para moderado, rojos para severo
- **Filtrado espacialmente** — solo aparecen los reportes dentro de ~50 nm de ti
- **Anotado con fines educativos** — toca "Decode this" en cualquier PIREP y el texto en bruto se desglosa campo por campo en el mismo tipo de explicación que leíste en este artículo

Si has estado ignorando los PIREPs y SIGMETs porque parecían sopa de letras, esta es tu invitación a empezar a leerlos. Son algunos de los datos meteorológicos de aviación más accionables disponibles públicamente, y son gratuitos.

## Tarjeta de referencia rápida

Imprime esto y guárdalo en tu maletín de vuelo (o simplemente marca este artículo como favorito).

### Escala de intensidad de turbulencia
- **NEG** — Sin turbulencia
- **LGT** — Ligera (baches ocasionales)
- **MOD** — Moderada (los pasajeros se tensan contra los cinturones)
- **SEV** — Severa (aeronave difícil de controlar)
- **EXTM** — Extrema (posible daño estructural)

### Escala de intensidad de engelamiento
- **NEG** — Sin engelamiento
- **TRC** — Traza (visible pero con acumulación mínima)
- **LGT** — Ligero (algo de acumulación pero fácil de manejar)
- **MOD** — Moderado (sistemas antihielo usados continuamente)
- **SEV** — Severo (el antihielo no da abasto)

### Cobertura del cielo
- **SKC** / **CLR** — Cielo despejado
- **FEW** — Pocas nubes (1/8 a 2/8 de cobertura)
- **SCT** — Dispersas (3/8 a 4/8)
- **BKN** — Fragmentadas (5/8 a 7/8)
- **OVC** — Cubierto (8/8)

### Códigos de posición comunes
- **DURD** — Durante el descenso
- **DURC** — Durante el ascenso
- **DURGC** — Durante el ascenso a crucero
- **DURGD** — Durante el descenso desde crucero
- **LLWS** — Low Level Wind Shear (trátalo como una emergencia)

## En resumen

Los reportes de peligros aeronáuticos están escritos en jerga porque fueron diseñados para comunicaciones por radio en la década de 1950. La jerga se quedó. Pero una vez que los decodificas, son algunos de los datos meteorológicos en tiempo real más valiosos disponibles para cualquier piloto, tripulado o no tripulado.

Un dron que vuela a 380 ft AGL está en el mismo aire por el que desciende un Cessna. Cuando un piloto de Cessna reporta por radio turbulencia moderada a 2,500 ft, esa turbulencia no se detuvo mágicamente a 400 ft. Trata los PIREPs de tu área como inteligencia de primera mano, porque es exactamente lo que son.

Vuela seguro. Lee los reportes. Y ante la duda, pospón.
