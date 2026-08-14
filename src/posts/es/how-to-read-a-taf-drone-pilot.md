---
title: Cómo leer un TAF como piloto de dron — Pronosticando tu ventana de vuelo
date: 2026-05-19
excerpt: Un METAR te dice qué está haciendo el cielo ahora mismo. Un TAF te dice qué estará haciendo dentro de 6 horas. Aquí te explicamos cómo decodificar un TAF y usarlo para planificar operaciones con dron que no se cancelen a mitad de la toma.
readTime: 7 min de lectura
---

## METAR vs. TAF — La distinción en 60 segundos

Un **METAR** es una *observación*: lo que el clima realmente es en una estación dada, en este momento (bueno, dentro de los últimos 30 a 60 minutos).

Un **TAF** es un *pronóstico*: lo que se *espera que sea* el clima en esa misma estación durante las próximas 24 a 30 horas.

Si vas a volar una misión de 20 minutos dentro de la próxima hora, un METAR probablemente sea todo lo que necesitas. Si estás planificando una toma de medio día, un timelapse de atardecer o un proyecto de mapeo de varios días, el TAF es donde se toman las decisiones de verdad.

Los TAFs son la herramienta estándar de la industria aeronáutica para "¿debería comprometerme con esta ventana de vuelo?". Los pilotos tripulados los usan desde la década de 1960, y aplican a las operaciones con dron con la misma limpieza.

## Cómo se ve un TAF

Aquí hay un TAF real de Chicago O'Hare:

```
TAF KORD 121730Z 1218/1324 26012G22KT P6SM SCT040 BKN080
     FM130200 28015G25KT P6SM SCT050 BKN100
     FM131200 30018G28KT 5SM -SHRA BKN030 OVC060
     TEMPO 1314/1318 3SM TSRA BKN020CB
     FM132000 32012KT P6SM SCT040
```

Decodifiquémoslo pieza por pieza.

## El encabezado

```
TAF KORD 121730Z 1218/1324
```

- **TAF** — Es un Terminal Aerodrome Forecast (pronóstico de aeródromo terminal).
- **KORD** — El pronóstico aplica a Chicago O'Hare (identificador ICAO).
- **121730Z** — El TAF fue *emitido* el día 12 del mes a las 17:30 UTC.
- **1218/1324** — El TAF es *válido* desde el día 12 a las 18:00 UTC hasta el día 13 a las 24:00 (es decir, las 00:00 del día 14) UTC.

Esa ventana de validez es la parte más importante del encabezado. Si tu vuelo está fuera de esa ventana, este TAF no te cubre.

Los TAFs normalmente se emiten **4 veces al día** (00Z, 06Z, 12Z, 18Z) y pronostican 24 o 30 horas hacia adelante. Los aeropuertos más grandes suelen recibir TAFs de 30 horas.

## El pronóstico predominante

La primera línea de condiciones después del encabezado es el **pronóstico predominante**: lo que se espera durante la ventana de validez a menos que lo modifique un grupo de cambio.

```
26012G22KT P6SM SCT040 BKN080
```

- **26012G22KT** — Viento desde 260° a 12 nudos, con ráfagas de hasta 22. (Mismo formato que un METAR.)
- **P6SM** — Visibilidad *mayor a 6 millas terrestres*. La "P" significa "plus" (más). Para operaciones con dron bajo Part 107, cualquier cosa P6SM está cómodamente por encima del mínimo de 3SM.
- **SCT040** — Nubes dispersas a 4,000 ft AGL.
- **BKN080** — Capa fragmentada a 8,000 ft AGL.

Esta es tu base de "si nada cambia, esto es lo que tienes".

## Grupos de cambio — El corazón de un TAF

Las líneas que empiezan con **FM**, **BECMG**, **TEMPO** o **PROB** son *grupos de cambio*. Te dicen cuándo y cómo se espera que el clima varíe durante la ventana de validez.

### FM — "Desde este momento en adelante"

```
FM130200 28015G25KT P6SM SCT050 BKN100
```

**FM130200** = "Desde el día 13 a las 02:00 UTC, las nuevas condiciones son...". Todo lo que sigue a este grupo **reemplaza** al pronóstico anterior hasta el siguiente grupo de cambio.

Así que a las 02:00 UTC del día 13, esperarías viento desde 280° a 15 nudos con ráfagas de 25, visibilidad aún sobre 6SM, dispersas a 5,000 ft, fragmentadas a 10,000 ft.

### BECMG — "Becoming" (transición)

Una transición *gradual* durante un periodo indicado. No verás este en nuestro ejemplo, pero se vería así:
```
BECMG 1306/1308 31020KT
```
"Entre las 06:00 y las 08:00 UTC del día 13, las condiciones están *cambiando* a viento desde 310° a 20 nudos." El cambio ocurre de forma gradual durante esas dos horas, no instantáneamente.

### TEMPO — "Temporal"

```
TEMPO 1314/1318 3SM TSRA BKN020CB
```

**TEMPO** = "Fluctuaciones temporales, esperadas durante menos de la mitad del periodo indicado." Leyendo los códigos:

- **1314/1318** — Entre las 14:00 y las 18:00 UTC del día 13
- **3SM** — La visibilidad baja a 3 millas terrestres
- **TSRA** — Tormentas eléctricas con lluvia (TS = tormenta eléctrica, RA = lluvia)
- **BKN020CB** — Nubes cumulonimbus fragmentadas a 2,000 ft AGL

**Traducción para el piloto de dron:** En algún momento entre las 14:00 y las 18:00 UTC del día 13, espera ráfagas breves de tormentas eléctricas con techos bajos. No son continuas —son temporales—, pero si planeas un vuelo en esa ventana, deberías esperar quedar en tierra por las ráfagas.

**El TEMPO es la condición más peligrosa de ignorar.** Un piloto que escanea un TAF demasiado rápido podría ver el pronóstico predominante y pasar por alto el grupo TEMPO por completo, metiéndose directo en una ventana de tormentas eléctricas.

### PROB30 / PROB40 — Probabilidad

Un grupo **PROB30** significa que hay un 30% de probabilidad de que ocurran las condiciones indicadas. PROB40 = 40%. La FAA no emite grupos PROB para probabilidades superiores al 40%: cualquier cosa más probable recibe tratamiento de TEMPO o FM.

```
PROB30 1320/1324 1SM FG BKN002
```

= "30% de probabilidad entre las 20:00 y las 24:00 UTC del día 13 de visibilidad de 1 milla terrestre en niebla, con nubes fragmentadas a 200 ft AGL."

Eso es una ventana rotunda de no volar para drones a un 30% de probabilidad. Planifica en consecuencia.

## Códigos de fenómenos meteorológicos

Los TAFs usan los mismos códigos de fenómenos que los METARs. Los más comunes para pilotos de dron:

| Código | Significado |
|---|---|
| **RA** | Lluvia |
| **SN** | Nieve |
| **FG** | Niebla |
| **BR** | Neblina (visibilidad de 5/8 a 6 SM) |
| **HZ** | Calima |
| **TS** | Tormenta eléctrica |
| **TSRA** | Tormentas eléctricas con lluvia |
| **SH** | Chubasco |
| **-SHRA** | Chubascos ligeros de lluvia (el `-` significa ligero) |
| **+TSRA** | Tormentas eléctricas fuertes con lluvia (el `+` significa fuerte) |
| **DZ** | Llovizna |
| **GR** | Granizo |
| **GS** | Granizo pequeño / gránulos de nieve |
| **BLSN** | Ventisca de nieve |
| **VCSH** | Chubascos en las cercanías (no en la estación) |

Combinados con el prefijo de intensidad (`-` para ligero, sin prefijo para moderado, `+` para fuerte) y un descriptor como SH (chubasco) o TS (tormenta eléctrica), puedes construir pronósticos sorprendentemente específicos.

## Juntándolo todo — Una decisión real con dron

Volvamos a nuestro TAF de ejemplo. Supón que planificas un vuelo de mapeo aéreo de 3 horas en una obra de construcción, comenzando a las 15:00 UTC del día 13.

Leyendo de arriba hacia abajo:

1. **Pronóstico predominante** (día 12 18:00 al día 13 02:00 UTC) — Viento 26012G22KT. Dentro de la mayoría de los límites de dron, pero la ráfaga de 22 kt está al límite. De todos modos, no aplica a tu ventana.
2. **FM130200** — El viento cambia a 28015G25KT. Fuera de los límites de ráfaga de la mayoría de los drones de consumo. Tampoco aplica a tu ventana.
3. **FM131200** — Viento 30018G28KT, visibilidad 5SM, chubascos ligeros de lluvia, capa fragmentada a 3,000 ft. **Esta es tu ventana de pronóstico predominante.** Una capa fragmentada a 3,000 ft está bien para operaciones por debajo de 400 ft, pero la ráfaga de 28 kt supera los límites seguros de la mayoría de las plataformas.
4. **TEMPO 1314/1318** — **Tu ventana de 3 horas es de 1500 a 1800 UTC. El TEMPO es de 1400 a 1800 UTC. Tu vuelo se superpone por completo con la ventana del TEMPO.** TSRA (tormentas eléctricas) con cumulonimbus a 2,000 ft.

**Decisión:** No volar, rotundo. Aunque el viento del FM131200 estuviera dentro de tus límites (no lo está), la ventana de tormentas eléctricas del TEMPO cubre por completo tu horario de vuelo. Reprograma.

Este es el tipo de decisión de volar/no volar que un TAF te permite tomar con 24 horas de anticipación: *antes* de cargar la camioneta, *antes* de llamar a tu cliente, *antes* de desperdiciar un día conduciendo hasta un sitio.

## TAF vs. pronóstico de 15 días — Cuándo usar cada uno

PreFlight 107 muestra ambos tipos de pronóstico, y responden preguntas diferentes:

- **Pronóstico de 15 días** — Tendencia general a lo largo de ventanas de varios días. Ideal para: "¿Debería agendar esta toma para el jueves o el sábado?". Usa datos de modelo, menor granularidad, área más amplia.
- **TAF** — Pronóstico quirúrgico de 24 a 30 horas para un aeropuerto específico. Ideal para: "Vuelo mañana a las 1500 UTC. ¿Qué debería esperar exactamente?". Usa pronósticos a nivel de estación, mucha mayor precisión cerca del aeropuerto, incluye fenómenos meteorológicos peligrosos.

**El flujo de trabajo:** Usa el pronóstico de 15 días para *elegir el día*. Usa el TAF la noche anterior para *confirmar la ventana*. Usa el METAR una hora antes del despegue para *verificar que la realidad coincide con el pronóstico*.

## Los TAFs tienen límites

Algunas advertencias honestas:

1. **Los TAFs son más precisos dentro de 5 a 10 millas terrestres del aeropuerto emisor.** Si tu sitio de vuelo está a 30 millas de la estación TAF más cercana, trátalo como una guía direccional, no como palabra santa.
2. **Los TAFs no son perfectos.** Incluso dentro de la validez, los modelos atmosféricos pueden equivocarse. Siempre contrasta con el METAR más cercano a la hora de despegue.
3. **Los aeropuertos más pequeños pueden no tener TAFs en absoluto.** Solo los aeropuertos Class B, C, D y algunos Class E emiten TAFs. Usa el más cercano y ajusta por distancia.
4. **Los TAFs no cubren el microclima.** Un TAF no predecirá la banda de nieve por efecto lago a 8 millas al este del aeropuerto. Para el microclima, súmale radar y PIREPs.

## Tarjeta de referencia rápida

Cuando obtengas un TAF para un vuelo planificado, revisa esto en orden:

- [ ] **Ventana de validez** — ¿Cubre la hora en que planeas volar?
- [ ] **Pronóstico predominante para tu franja horaria** — ¿Viento, visibilidad y techos dentro de los límites del dron?
- [ ] **Grupos de cambio que afectan tu ventana** — ¿Algún FM, BECMG, TEMPO o PROB que se superponga?
- [ ] **Grupos TEMPO en especial** — Fáciles de pasar por alto, a menudo el factor decisivo
- [ ] **Fenómenos peligrosos** — ¿Algún TS, FG, FZRA o +RA en tu ventana?
- [ ] **Ráfagas de viento** — El valor de la G importa más que la velocidad sostenida del viento para la estabilidad del dron

Recorre esa lista cada vez y nunca te agarrará por sorpresa un pronóstico que "no viste".

## En resumen

Un METAR te dice qué acaba de pasar. Un TAF te dice qué viene. Como piloto de dron, necesitas ambos: el METAR para la decisión de despegue, el TAF para la decisión de agenda.

La mayoría de los pilotos de dron ha oído hablar de los METARs, pero trata a los TAFs como "cosas de aviación tripulada". Esa mentalidad te cuesta vuelos que no tenías por qué perder, y te obliga a cancelaciones de último minuto que te cuestan la confianza del cliente. Cinco minutos de lectura de TAF la noche anterior a una toma resuelven ambos problemas.

Lee los TAFs. Planifica las ventanas. Gánate la reputación del piloto que no falla.

Vuela seguro allá afuera.
