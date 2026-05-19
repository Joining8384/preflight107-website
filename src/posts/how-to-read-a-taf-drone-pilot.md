---
title: How to Read a TAF as a Drone Pilot — Forecasting Your Flight Window
date: 2026-05-19
category: Weather
excerpt: A METAR tells you what the sky is doing right now. A TAF tells you what it'll be doing in 6 hours. Here's how to decode a TAF and use it to plan drone operations that won't get scrubbed mid-shoot.
readTime: 7 min read
---

## METAR vs. TAF — The 60-Second Distinction

A **METAR** is an *observation* — what the weather actually is at a given station, right now (well, within the last 30–60 minutes).

A **TAF** is a *forecast* — what the weather is *expected to be* at that same station over the next 24–30 hours.

If you're flying a 20-minute mission in the next hour, a METAR is probably all you need. If you're planning a half-day shoot, a sunset timelapse, or a multi-day mapping project — the TAF is where the real decisions get made.

TAFs are the aviation industry's standard "should I commit to this flight window?" tool. They've been used by manned pilots since the 1960s, and they apply to drone operations just as cleanly.

## What a TAF Looks Like

Here's a real TAF from Chicago O'Hare:

```
TAF KORD 121730Z 1218/1324 26012G22KT P6SM SCT040 BKN080
     FM130200 28015G25KT P6SM SCT050 BKN100
     FM131200 30018G28KT 5SM -SHRA BKN030 OVC060
     TEMPO 1314/1318 3SM TSRA BKN020CB
     FM132000 32012KT P6SM SCT040
```

Let's decode it piece by piece.

## The Header

```
TAF KORD 121730Z 1218/1324
```

- **TAF** — This is a Terminal Aerodrome Forecast.
- **KORD** — The forecast applies to Chicago O'Hare (ICAO identifier).
- **121730Z** — The TAF was *issued* on the 12th day of the month at 17:30 UTC.
- **1218/1324** — The TAF is *valid* from the 12th at 18:00 UTC through the 13th at 24:00 (i.e. 00:00 on the 14th) UTC.

That validity window is the most important part of the header. If your flight is outside that window, this TAF doesn't cover you.

TAFs are typically issued **4 times per day** (00Z, 06Z, 12Z, 18Z) and forecast 24 or 30 hours forward. Larger airports usually get 30-hour TAFs.

## The Prevailing Forecast

The first line of conditions after the header is the **prevailing forecast** — what's expected through the validity window unless modified by a change group.

```
26012G22KT P6SM SCT040 BKN080
```

- **26012G22KT** — Wind from 260° at 12 knots, gusting to 22. (Same format as a METAR.)
- **P6SM** — Visibility *greater than 6 statute miles*. The "P" stands for "plus." For drone ops under Part 107, anything P6SM is comfortably above the 3SM minimum.
- **SCT040** — Scattered clouds at 4,000 ft AGL.
- **BKN080** — Broken layer at 8,000 ft AGL.

This is your "if nothing changes, this is what you've got" baseline.

## Change Groups — The Heart of a TAF

The lines starting with **FM**, **BECMG**, **TEMPO**, or **PROB** are *change groups*. They tell you when and how the weather is expected to shift during the validity window.

### FM — "From this time forward"

```
FM130200 28015G25KT P6SM SCT050 BKN100
```

**FM130200** = "From the 13th at 02:00 UTC, the new conditions are..." Everything after this group **replaces** the previous forecast until the next change group.

So at 02:00 UTC on the 13th, you'd expect wind from 280° at 15 knots gusting 25, visibility still over 6SM, scattered at 5,000 ft, broken at 10,000 ft.

### BECMG — "Becoming"

A *gradual* transition over a stated period. You won't see this one in our example, but it would look like:
```
BECMG 1306/1308 31020KT
```
"Between 06:00 and 08:00 UTC on the 13th, conditions are *becoming* wind from 310° at 20 knots." The change happens gradually over those two hours, not instantly.

### TEMPO — "Temporary"

```
TEMPO 1314/1318 3SM TSRA BKN020CB
```

**TEMPO** = "Temporary fluctuations, expected for less than half of the stated period." Reading the codes:

- **1314/1318** — Between 14:00 and 18:00 UTC on the 13th
- **3SM** — Visibility drops to 3 statute miles
- **TSRA** — Thunderstorms with rain (TS = thunderstorm, RA = rain)
- **BKN020CB** — Broken cumulonimbus clouds at 2,000 ft AGL

**Drone pilot translation:** Sometime between 14:00 and 18:00 UTC on the 13th, expect short bursts of thunderstorms with low ceilings. These aren't continuous — they're temporary — but if you're planning a flight in that window, you should expect to be grounded by the bursts.

**TEMPO is the most dangerous condition to ignore.** A pilot scanning a TAF too fast might see the prevailing forecast and miss the TEMPO group entirely, walking right into a thunderstorm window.

### PROB30 / PROB40 — Probability

A **PROB30** group means there's a 30% chance of the stated conditions occurring. PROB40 = 40%. The FAA doesn't issue PROB groups for probabilities above 40% — anything more likely gets a TEMPO or FM treatment.

```
PROB30 1320/1324 1SM FG BKN002
```

= "30% probability between 20:00 and 24:00 UTC on the 13th of visibility 1 statute mile in fog, with broken clouds at 200 ft AGL."

That's a flat no-fly window for drones at 30% likelihood. Plan accordingly.

## Weather Phenomena Codes

TAFs use the same phenomena codes as METARs. The common ones for drone pilots:

| Code | Meaning |
|---|---|
| **RA** | Rain |
| **SN** | Snow |
| **FG** | Fog |
| **BR** | Mist (visibility 5/8 to 6 SM) |
| **HZ** | Haze |
| **TS** | Thunderstorm |
| **TSRA** | Thunderstorms with rain |
| **SH** | Shower |
| **-SHRA** | Light rain showers (the `-` means light) |
| **+TSRA** | Heavy thunderstorms with rain (the `+` means heavy) |
| **DZ** | Drizzle |
| **GR** | Hail |
| **GS** | Small hail / snow pellets |
| **BLSN** | Blowing snow |
| **VCSH** | Showers in the vicinity (not at the station) |

Combined with the intensity prefix (`-` for light, no prefix for moderate, `+` for heavy) and a descriptor like SH (shower) or TS (thunderstorm), you can build up surprisingly specific forecasts.

## Putting It All Together — A Real Drone Decision

Back to our example TAF. Suppose you're planning a 3-hour aerial mapping flight at a construction site starting at 15:00 UTC on the 13th.

Reading top to bottom:

1. **Prevailing forecast** (12th 18:00 to 13th 02:00 UTC) — Wind 26012G22KT. Within most drone limits, but the 22 kt gust is borderline. Doesn't apply to your window anyway.
2. **FM130200** — Wind shifts to 28015G25KT. Outside most consumer drone gust limits. Doesn't apply to your window either.
3. **FM131200** — Wind 30018G28KT, 5SM visibility, light rain showers, broken layer at 3,000 ft. **This is your prevailing forecast window.** A broken layer at 3,000 ft is fine for ops below 400 ft, but the 28 kt gust is past safe limits for most platforms.
4. **TEMPO 1314/1318** — **Your 3-hour window is 1500–1800 UTC. The TEMPO is 1400–1800 UTC. Your flight overlaps the TEMPO window entirely.** TSRA (thunderstorms) with cumulonimbus at 2,000 ft.

**Decision:** Hard no-fly. Even if the FM131200 wind was within your limits (it isn't), the TEMPO thunderstorm window completely covers your flight time. Reschedule.

This is the kind of go/no-go decision a TAF lets you make 24 hours in advance — *before* you load the truck, *before* you call your client, *before* you waste a day driving to a site.

## TAF vs. 15-Day Forecast — When to Use Each

PreFlight 107 surfaces both kinds of forecast, and they answer different questions:

- **15-Day Forecast** — Big-picture trend over multi-day windows. Best for: "Should I schedule this shoot for Thursday or Saturday?" Uses model data, lower granularity, broader area.
- **TAF** — Surgical 24–30 hour forecast for a specific airport. Best for: "I'm flying tomorrow at 1500 UTC. What exactly should I expect?" Uses station-level forecasts, much higher precision near the airport, includes hazardous weather phenomena.

**The workflow:** Use the 15-Day Forecast to *pick the day*. Use the TAF the night before to *confirm the window*. Use the METAR an hour before launch to *verify reality matches the forecast*.

## TAFs Have Limits

A few honest caveats:

1. **TAFs are most accurate within 5–10 statute miles of the issuing airport.** If your flight site is 30 miles away from the nearest TAF station, treat it as directional guidance, not gospel.
2. **TAFs aren't perfect.** Even within validity, atmospheric models can be wrong. Always cross-check with the METAR closest to launch time.
3. **Smaller airports may not have TAFs at all.** Only Class B, C, D, and select Class E airports issue TAFs. Use the nearest one and adjust for distance.
4. **TAFs don't cover micro-weather.** A TAF won't predict the lake-effect snow band 8 miles east of the airport. For micro-weather, layer in radar and PIREPs.

## Quick Reference Card

When you pull a TAF for a planned flight, check these in order:

- [ ] **Validity window** — Does it cover the time you plan to fly?
- [ ] **Prevailing forecast for your time slot** — Wind, visibility, ceilings within drone limits?
- [ ] **Change groups affecting your window** — Any FM, BECMG, TEMPO, or PROB that overlap?
- [ ] **TEMPO groups especially** — Easy to miss, often the showstopper
- [ ] **Hazardous phenomena** — Any TS, FG, FZRA, or +RA in your window?
- [ ] **Wind gusts** — The G value matters more than the steady wind speed for drone stability

Run through that checklist every time and you'll never get caught by a forecast you "didn't see."

## The Bottom Line

A METAR tells you what just happened. A TAF tells you what's coming. As a drone pilot, you need both — the METAR for the launch decision, the TAF for the schedule decision.

Most drone pilots have heard of METARs but treat TAFs as "manned aviation stuff." That mindset costs you flights you didn't have to lose, and forces last-minute cancellations that cost you client trust. Five minutes of TAF reading the night before a shoot solves both problems.

Read the TAFs. Plan the windows. Earn the reputation as the pilot who doesn't no-show.

Fly safe out there.
