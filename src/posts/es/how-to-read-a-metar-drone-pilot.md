---
title: Cómo leer un METAR como piloto de drones
date: 2026-04-28
excerpt: Los METAR no son solo para la aviación tripulada — son uno de los informes meteorológicos más accionables que un piloto de drones puede usar. Aquí tienes cómo descifrar uno en menos de dos minutos.
readTime: 6 min de lectura
---

## ¿Qué es un METAR?

Un METAR (Meteorological Aerodrome Report, Informe Meteorológico de Aeródromo) es una observación meteorológica aeronáutica estandarizada emitida por aeropuertos y estaciones meteorológicas de todo el mundo. Actualizados cada 30 a 60 minutos, los METAR te dan una instantánea en tiempo real de las condiciones en una ubicación específica — viento, visibilidad, cobertura de nubes, temperatura y presión.

Los pilotos tripulados están obligados a consultar los METAR antes de cada vuelo. Como piloto de drones que opera bajo la Part 107 de la FAA, estás sujeto a los mismos mínimos meteorológicos — y los METAR son tu fuente más fiable y actualizada precisamente para esas condiciones.

## Un METAR real, descifrado

Descompongamos un METAR de ejemplo línea por línea:

```
METAR KORD 121552Z 26012G22KT 10SM BKN035 OVC080 18/11 A2992 RMK AO2
```

### Estación y hora

**KORD** es el identificador ICAO del Aeropuerto Internacional O'Hare de Chicago. **121552Z** significa que esta observación se emitió el día 12 del mes a las 15:52 UTC (hora Zulú). La aviación siempre usa UTC — convierte siempre a tu zona horaria local antes de planificar un vuelo.

### Viento

**26012G22KT** te indica que el viento viene *desde* 260° (aproximadamente del oeste) a **12 nudos**, con rachas de hasta **22 nudos**.

El viento suele ser el campo más crítico para los pilotos de drones. La Part 107 de la FAA no define una velocidad máxima de viento fija, pero la mayoría de los drones de consumo y profesionales tienen límites operativos entre 20 y 30 mph (17 a 26 nudos). Un valor de racha que supere la especificación publicada de tu aeronave es una decisión firme de volar/no volar — no una sugerencia.

Conversión rápida: **1 nudo ≈ 1.15 mph**. Así que 22 nudos equivalen a aproximadamente 25 mph.

### Visibilidad

**10SM** significa 10 millas terrestres de visibilidad predominante. Bajo la Part 107, necesitas un mínimo de **3 millas terrestres** de visibilidad de vuelo en espacio aéreo Class G. Las autorizaciones de espacio aéreo controlado pueden imponer requisitos más estrictos.

Cuando la visibilidad cae por debajo de 3SM estás en tierra por normativa. Cuando está por debajo de 5SM, empieza a pensarlo con cuidado — especialmente cerca de aeropuertos, límites de espacio aéreo controlado o al volar cerca de estructuras.

### Condición del cielo

**BKN035 OVC080** describe dos capas de nubes:

- **BKN035** — Nubes fragmentadas (broken) a **3,500 pies AGL** (sobre el nivel del suelo)
- **OVC080** — Cielo cubierto (overcast) a **8,000 pies AGL**

Las alturas de las nubes en los METAR siempre se expresan en cientos de pies. "035" = 3,500 ft.

¿Por qué importa esto para los pilotos de drones? La Part 107 te exige permanecer al menos **500 pies por debajo de las nubes** y a **2,000 pies horizontalmente** de ellas. Con una capa fragmentada a 3,500 ft, tienes un margen saludable en el típico techo operativo de 400 ft. Pero si esa capa BKN fuera BKN008 (800 pies), tendrías solo 300 pies de margen legal de operación — o ninguno en algunas condiciones.

Conoce tus capas. Conoce tus márgenes.

### Temperatura y punto de rocío

**18/11** — La temperatura es de 18 °C (64 °F), el punto de rocío es de 11 °C (52 °F).

La diferencia entre la temperatura y el punto de rocío importa. Una brecha de 5 °C o menos señala que es posible la formación de niebla o estrato bajo — particularmente en las primeras horas de la mañana. En operaciones que abarcan el amanecer o el atardecer, vigila de cerca este número.

### Reglaje del altímetro

**A2992** es la presión barométrica actual: 29.92 inHg. Para los pilotos de drones, este campo es menos crítico operativamente, pero es un indicador útil del movimiento de los sistemas meteorológicos. Una presión en descenso a menudo señala un sistema frontal que se aproxima. Combínalo con el pronóstico de 15 días para entender hacia dónde se dirigen las condiciones.

### Observaciones

**RMK AO2** indica que se trata de una estación automatizada ASOS/AWOS con discriminador de precipitación. Las observaciones pueden incluir actividad de rayos, alturas de techo variables, tendencias de presión y meteorología significativa no captada en el cuerpo principal. No las omitas.

## Tu lista de comprobación METAR previa al vuelo

Cuando saques un METAR antes de un vuelo, repasa estos campos en orden:

- **Velocidad del viento y rachas** — ¿Dentro de los límites operativos de tu dron?
- **Visibilidad** — ¿En 3SM o más (o más alta según tu autorización)?
- **Techo de nubes** — ¿La capa más baja al menos 500 ft por encima de tu altitud operativa planeada?
- **Diferencia temperatura/punto de rocío** — ¿Algún riesgo de niebla o desarrollo rápido de nubes?
- **Observaciones** — ¿Alguna actividad meteorológica significativa o alerta de sensor?

Si alguno de estos no supera tu comprobación, reconsidera la operación.

## METAR vs. TAF

Un METAR es una *observación actual*. Un TAF (Terminal Aerodrome Forecast, Pronóstico de Aeródromo Terminal) es un *pronóstico de 24 a 30 horas* para la misma ubicación en el mismo formato codificado. Usa ambos: los METAR te dicen lo que está pasando ahora mismo, los TAF te dicen si las condiciones se mantendrán durante la duración de tu operación. Si el TAF muestra un deterioro de la visibilidad o un aumento de los vientos dentro de tu ventana de vuelo, esa es tu señal para reprogramar.

## Dónde obtener METAR

La meteorología aeronáutica está disponible públicamente a través del Aviation Weather Center de la NOAA. **PreFlight 107 Pro** entrega METAR y TAF descifrados directamente en la app, junto a tu mapa de espacio aéreo — para que veas el contexto meteorológico y la autorización de espacio aéreo juntos, antes de armar tus motores.

Leer METAR se vuelve más rápido con la práctica. Informa cada vuelo, incluso cuando el cielo parezca despejado. Los datos meteorológicos están ahí — úsalos.

*Vuela con seguridad.*
