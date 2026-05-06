---
title: How to Read a METAR as a Drone Pilot
date: 2026-04-28
excerpt: METARs aren't just for manned aviation — they're one of the most actionable weather briefings a drone pilot can use. Here's how to decode one in under two minutes.
readTime: 6 min read
---

## What Is a METAR?

A METAR (Meteorological Aerodrome Report) is a standardized aviation weather observation issued by airports and weather stations around the world. Updated every 30 to 60 minutes, METARs give you a real-time snapshot of conditions at a specific location — wind, visibility, cloud cover, temperature, and pressure.

Manned pilots are required to check METARs before every flight. As a drone pilot operating under FAA Part 107, you're bound by the same weather minimums — and METARs are your most reliable, up-to-date source for exactly those conditions.

## A Real METAR, Decoded

Let's break down a sample METAR line-by-line:

```
METAR KORD 121552Z 26012G22KT 10SM BKN035 OVC080 18/11 A2992 RMK AO2
```

### Station and Time

**KORD** is the ICAO identifier for Chicago O'Hare International Airport. **121552Z** means this observation was issued on the 12th of the month at 15:52 UTC (Zulu time). Aviation always uses UTC — always convert to your local time zone before planning a flight.

### Wind

**26012G22KT** tells you wind is coming *from* 260° (roughly west) at **12 knots**, gusting to **22 knots**.

Wind is often the most critical field for drone pilots. FAA Part 107 doesn't define a hard maximum wind speed, but most consumer and professional drones have operational limits between 20–30 mph (17–26 knots). A gust value that exceeds your aircraft's published spec is a hard go/no-go decision — not a suggestion.

Quick conversion: **1 knot ≈ 1.15 mph**. So 22 knots equals roughly 25 mph.

### Visibility

**10SM** means 10 statute miles of prevailing visibility. Under Part 107, you need a minimum of **3 statute miles** of flight visibility in Class G airspace. Controlled airspace authorizations may impose stricter requirements.

When visibility drops below 3SM you're grounded by regulation. When it's below 5SM, start thinking carefully — especially near airports, controlled airspace boundaries, or when flying near structures.

### Sky Condition

**BKN035 OVC080** describes two cloud layers:

- **BKN035** — Broken clouds at **3,500 feet AGL** (above ground level)
- **OVC080** — Overcast at **8,000 feet AGL**

Cloud heights in METARs are always expressed in hundreds of feet. "035" = 3,500 ft.

Why does this matter for drone pilots? Part 107 requires you to remain at least **500 feet below clouds** and **2,000 feet horizontally** from them. With a broken layer at 3,500 ft, you have a healthy margin at the typical 400 ft operational ceiling. But if that BKN layer were BKN008 (800 feet), you'd have only 300 feet of legal operating room — or none at all in some conditions.

Know your layers. Know your margins.

### Temperature and Dewpoint

**18/11** — Temperature is 18°C (64°F), dewpoint is 11°C (52°F).

The spread between temperature and dewpoint matters. A gap of 5°C or less signals that fog or low stratus formation is possible — particularly in the early morning hours. On operations that span sunrise or sunset, watch this number closely.

### Altimeter Setting

**A2992** is the current barometric pressure: 29.92 inHg. For drone pilots, this field is less operationally critical, but it's a useful indicator of weather system movement. Falling pressure often signals an approaching frontal system. Combine it with the 168-hour forecast to understand where conditions are headed.

### Remarks

**RMK AO2** indicates this is an automated ASOS/AWOS station with a precipitation discriminator. Remarks can include lightning activity, variable ceiling heights, pressure trends, and significant weather not captured in the main body. Don't skip them.

## Your Pre-Flight METAR Checklist

When you pull a METAR before a flight, run through these fields in order:

- **Wind speed and gusts** — Within your drone's operational limits?
- **Visibility** — At or above 3SM (or higher per your authorization)?
- **Cloud ceiling** — Lowest layer at least 500 ft above your planned operational altitude?
- **Temp/dewpoint spread** — Any risk of fog or rapid cloud development?
- **Remarks** — Any significant weather activity or sensor alerts?

If any one of these fails your check, reconsider the operation.

## METAR vs. TAF

A METAR is a *current observation*. A TAF (Terminal Aerodrome Forecast) is a *24–30 hour forecast* for the same location in the same encoded format. Use both: METARs tell you what's happening right now, TAFs tell you whether conditions will hold for the duration of your operation. If the TAF shows deteriorating visibility or rising winds within your flight window, that's your signal to reschedule.

## Where to Get METARs

Aviation weather is publicly available through NOAA's Aviation Weather Center. **PreFlight 107 Pro** delivers decoded METARs and TAFs directly in the app, alongside your airspace map — so you see weather context and airspace authorization together, before you arm your motors.

Reading METARs gets faster with practice. Brief every flight, even when the sky looks clear. The weather data is there — use it.

*Fly safe out there.*
