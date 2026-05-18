---
title: Aviation Hazards Explained — How to Read PIREPs, SIGMETs, and AIRMETs as a Drone Pilot
date: 2026-05-18
excerpt: Manned pilots have used PIREPs, SIGMETs, and AIRMETs for decades to avoid in-flight surprises. Here's how to decode each one in plain English — and why they matter even when you're flying below 400 ft.
readTime: 8 min read
---

## Why Drone Pilots Should Care About "Manned Aviation" Weather Reports

You might think PIREPs and SIGMETs are only for airline captains and Cessna pilots cruising at 8,000 ft. They're not. The atmosphere doesn't stop at 400 ft AGL — turbulence, icing, wind shear, and severe weather happen at every altitude, and the conditions a Boeing 737 reports descending into your local airport are often the same conditions waiting to toss your drone around the moment you launch.

Aviation hazard reports are issued by the National Weather Service's Aviation Weather Center (aviationweather.gov) — the same authoritative source used by manned aviation. Three types of reports matter most to drone pilots: **PIREPs**, **SIGMETs**, and **AIRMETs**. Each tells you something different about the air mass around your flight area.

## PIREPs — Pilot Reports

A **PIREP** is a Pilot Report — an in-flight observation radioed in by an actual pilot describing what they're experiencing. PIREPs are the closest thing aviation has to a "Yelp review for the sky." They're issued in real time, by humans, about specific atmospheric conditions.

There are two types:
- **UA** — *Routine* pilot report. Nothing dramatic, just a status update.
- **UUA** — *Urgent* pilot report. Something significant: severe turbulence, severe icing, low-level wind shear, hail, volcanic ash.

If you see a UUA near your launch site, **don't fly**. Whatever caused the urgent report is happening *now*.

### A Real PIREP, Decoded

Here's a typical PIREP issued near San Francisco International:

```
SFO UUA /OV SFO /TM 0054 /FL001 /TP B738 /RM LLWS +20KT DURD
```

Looks cryptic. Let's break it down field-by-field:

- **SFO** — The reporting station is San Francisco International.
- **UUA** — This is an **urgent** report. Pay attention.
- **/OV SFO** — The location of the report: over the SFO airfield.
- **/TM 0054** — The observation time: 00:54 UTC (always Zulu time in aviation).
- **/FL001** — Flight level 001 = 100 ft AGL. (FL is hundreds of feet — FL050 would be 5,000 ft.)
- **/TP B738** — Aircraft type: Boeing 737-800.
- **/RM** — Remarks (the most important section, in plain text).
- **LLWS** — **Low Level Wind Shear**. A sudden, dramatic change in wind speed or direction within a short vertical distance. Extremely dangerous for any aircraft.
- **+20KT** — The wind shear shift was a +20 knot variation.
- **DURD** — During descent.

**The plain-English translation:** A Boeing 737 descending to land at SFO reported a sudden +20 knot wind shear at 100 ft above the ground at 00:54 UTC.

**What this means for a drone pilot:** If you were planning to fly near SFO that night, you'd be operating in the exact air mass that just slapped a 737-sized aircraft around. Your 249-gram drone would be flipped end-over-end. Hard no-fly.

### Common PIREP Fields You'll See

| Code | Meaning | Why drone pilots care |
|---|---|---|
| **/TB LGT** / **/TB MOD** / **/TB SEV** | Turbulence intensity (Light/Moderate/Severe) | Moderate or worse = drone won't hold position |
| **/IC LGT** / **/IC MOD** / **/IC SEV** | Icing intensity | If moisture is freezing on a manned aircraft, propellers can ice too |
| **/SK OVC012** | Sky condition: Overcast at 1,200 ft AGL | This is your legal cloud ceiling for drone ops |
| **/SK SCT040** | Scattered clouds at 4,000 ft | Less restrictive |
| **/WV 27045G55KT** | Wind from 270° at 45 knots gusting 55 | Way over most drone wind limits |
| **/WX RA** / **/WX SN** / **/WX TS** | Rain / Snow / Thunderstorm | All hard no-fly conditions |
| **DURD** / **DURC** | During descent / During climb | Where in the flight path the report happened |

## SIGMETs — Significant Meteorological Information

A **SIGMET** is a formal warning issued for **severe** weather affecting flight safety. Unlike PIREPs (which are observations), SIGMETs are *forecasts* of dangerous conditions in a defined geographic area. They're issued by NWS Aviation Weather Center and apply to all aircraft.

SIGMETs cover six hazard types:
1. **TURB** — Severe or extreme turbulence
2. **CONV** — Convective activity (thunderstorms, tornadoes)
3. **IFR** — Widespread Instrument Flight Rules conditions (low visibility / low ceilings)
4. **ICE** — Severe icing
5. **MTN** — Mountain obscuration
6. **ASH** — Volcanic ash

**Rule of thumb for drone pilots:** If an active SIGMET overlaps your flight area, **do not fly**. SIGMETs are issued when the NWS believes the hazard is severe enough to threaten manned aircraft — your drone has even less margin for error.

SIGMETs are valid for a specific time window (usually 4–6 hours) and a specific polygon on the map. They're updated and reissued as conditions evolve.

## AIRMETs — Airmen's Meteorological Information

An **AIRMET** is a step down from a SIGMET — same idea but for **moderate** hazards, not severe. AIRMETs are issued for conditions that affect aircraft safety but at a lower intensity threshold.

AIRMETs come in three flavors:
- **AIRMET Sierra** — IFR conditions and/or mountain obscuration
- **AIRMET Tango** — Moderate turbulence and/or sustained winds of 30 knots or more
- **AIRMET Zulu** — Moderate icing and freezing levels

**Drone pilot translation:**
- An AIRMET in your area isn't an automatic no-fly, but it's a "yellow flag" — proceed with extra caution.
- An AIRMET Tango with sustained 30+ knot winds = most consumer drones can't operate safely.
- An AIRMET Zulu with freezing levels below 5,000 ft = your battery performance will tank and motor torque could be affected.

## Real-World Example: A Day in the Life of an Aviation Hazard

Let's say you're a Part 107 pilot doing a real estate shoot Tuesday morning in Denver. You open PreFlight 107 and the Aviation Hazards card shows:

- **2 PIREPs** within 50 nm (both routine, sky cleared at 3,500 ft, no turbulence)
- **1 AIRMET Tango** active until 1500 UTC (sustained winds 35 kt at altitude, valid over Denver area)
- **0 SIGMETs**

**Decoding the situation:**
- The PIREPs tell you the air mass near the surface is calm and the cloud ceiling is high.
- The AIRMET Tango says aloft winds are high — that's a yellow flag. Above ~2,000 ft AGL, you'd be in 35 kt winds, but drone ops are below 400 ft, so the *surface* wind matters more.
- Check your METAR for surface conditions. If surface wind is under 15 kt and the gust spread is small, you can probably fly *low* — but keep flights brief and stay alert for the upper winds mixing down.

This is the kind of nuanced decision-making aviation hazard data lets you make. Without it, you'd either fly blind or stay grounded unnecessarily.

## How PreFlight 107 Handles This

The Aviation Hazards card on the Dashboard pulls PIREPs (bbox-filtered to 50 nm of your launch site), SIGMETs, and AIRMETs directly from the FAA Aviation Weather Center API. Each hazard is:

- **Decoded inline** — turbulence and icing codes translated to plain English, sky conditions converted to "Overcast at 1,200 ft AGL" instead of "OVC012"
- **Severity-coded** — green dots for routine, yellow for moderate, red for severe
- **Spatially filtered** — only reports within ~50 nm of you show up
- **Educationally annotated** — tap "Decode this" on any PIREP and the raw text breaks down field-by-field into the same kind of explanation you read in this article

If you've been ignoring PIREPs and SIGMETs because they looked like alphabet soup, this is your invitation to start reading them. They're some of the most actionable aviation weather data publicly available, and they're free.

## Quick Reference Card

Print this and keep it in your flight bag (or just bookmark this article).

### Turbulence Intensity Scale
- **NEG** — No turbulence
- **LGT** — Light (occasional bumps)
- **MOD** — Moderate (passengers strain against seatbelts)
- **SEV** — Severe (aircraft hard to control)
- **EXTM** — Extreme (structural damage possible)

### Icing Intensity Scale
- **NEG** — No icing
- **TRC** — Trace (visible but minimal accumulation)
- **LGT** — Light (some accumulation but easily handled)
- **MOD** — Moderate (deicing systems used continuously)
- **SEV** — Severe (deicing fails to keep up)

### Sky Coverage
- **SKC** / **CLR** — Sky clear
- **FEW** — Few clouds (1/8 to 2/8 coverage)
- **SCT** — Scattered (3/8 to 4/8)
- **BKN** — Broken (5/8 to 7/8)
- **OVC** — Overcast (8/8)

### Common Position Codes
- **DURD** — During descent
- **DURC** — During climb
- **DURGC** — During climb to cruise
- **DURGD** — During descent from cruise
- **LLWS** — Low Level Wind Shear (treat as emergency)

## The Bottom Line

Aviation hazard reports are written in jargon because they were designed for radio communications in the 1950s. The jargon stuck. But once you decode them, they're some of the most valuable real-time weather data available to any pilot — manned or unmanned.

A drone flying at 380 ft AGL is in the same air that a Cessna is descending through. When a Cessna pilot radios in moderate turbulence at 2,500 ft, that turbulence didn't magically stop at 400 ft. Treat PIREPs from your area like firsthand intelligence — because that's exactly what they are.

Fly safe. Read the reports. And when in doubt, postpone.
