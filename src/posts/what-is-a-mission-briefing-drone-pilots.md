---
title: What Is a Mission Briefing? The Pre-Flight Document That Changes How You Defend a Part 107 Flight
date: 2026-05-21
excerpt: Part 107 requires every commercial pilot to assess weather, airspace, and risk before takeoff. A Mission Briefing is the document that proves you actually did it — locked, hashed, and ready for the FAA, your insurer, or the client who wants paperwork.
readTime: 9 min read
---

## The Two Words That Decide Every FAA Conversation

If you fly under Part 107 for money, eventually you will be asked one question — by an FAA inspector, an insurance adjuster, a lawyer, or a client's risk-management team. The question is some variation of:

**"Show me what you did before that flight."**

Not "did you check the weather?" Every pilot says yes. The question is what you can *produce*. A screenshot from your phone with no timestamp metadata, a half-remembered glance at a sectional, and a "yeah, I checked LAANC" don't add up to a defensible record. They add up to "the pilot said so."

A Mission Briefing is the document that closes that gap. It's a pre-flight planning artifact — a written, time-stamped, tamper-verifiable record of the weather, airspace, hazards, risks, and procedures you assessed *before* you took off. It's the thing that lets you say "show me what you did" and answer with a PDF instead of a story.

This post is about what a Mission Briefing actually is, what the law expects of you, what should be inside one, and why tamper-verification matters more than most pilots realize.

## What Part 107 Actually Says

Two regulations do most of the work here.

**14 CFR 107.49 — Preflight familiarization, inspection, and actions for aircraft operation.** Before each flight, the remote pilot in command must:

- Assess the operating environment, including local weather, airspace, ground hazards to non-participants, and any ground risks.
- Ensure all persons directly participating are informed about operating conditions, emergency procedures, contingency procedures, roles and responsibilities, and potential hazards.
- Inspect the sUAS to determine it is in a condition for safe operation.

**14 CFR 107.51 — Operating limitations for small unmanned aircraft.** You cannot operate unless you can comply with weather minimums, including 3 statute miles of flight visibility and at least 500 feet below clouds / 2,000 feet horizontally from clouds.

Read those carefully. Neither one says "fill out a form." Neither one says "produce a PDF." What they say is that you must *assess* and *ensure*. The FAA's regulatory enforcement, however, runs on documentation. If a complaint, ramp check, or post-incident review lands on your name, the inspector's first move is to ask what you assessed and how you assessed it. A pilot who can hand over a structured briefing has a fundamentally different conversation than a pilot who can't.

This is the part most new commercial pilots miss: you can be *fully compliant with the regulation and still lose the case*, because compliance you can't prove is functionally equivalent to non-compliance. The regulation doesn't require a briefing document. The aftermath of any meaningful incident does.

## What a Real Mission Briefing Contains

Forget the format for a second. A briefing is just six categories of information, ordered the way a working pilot thinks through a flight. Here's how a complete one looks across six pages.

### 1. Mission Overview

The "who, what, when" of the flight.

- Pilot in command — name, Part 107 certificate number, recurrent date.
- Aircraft — manufacturer, model, FAA registration, serial number, firmware version, max wind tolerance, max flight time.
- Insurance — carrier, policy number, coverage limit.
- Mission — name, client, project code, objective, planned departure time, planned duration.

Nothing fancy. But notice what's already on the page: if anything goes sideways, the first eight questions the FAA or your insurer would ask are answered before they're asked.

### 2. Site & Airspace

Where you're flying and what airspace you're in.

- Launch address and exact GPS coordinates.
- Operational radius.
- Airspace classification (B, C, D, E, or G).
- LAANC required? Approval ID? Ceiling?
- Nearest reporting airport (ICAO + distance in nautical miles).

LAANC approvals get appended to the briefing as a PDF appendix where applicable. The launch coordinates aren't a description — they're a lat/lon you actually planned around, locked at briefing time.

### 3. Weather Briefing

The page that most "I checked the weather" claims fall apart on.

- METAR for the closest reporting station, raw and decoded (wind, visibility, ceiling, flight category).
- TAF — the terminal forecast for that station over the next 24–30 hours.
- Surface conditions from NWS gridded / Open-Meteo data at your exact launch coordinates (temp, wind, gusts, pressure, cloud cover).
- Solar times for the launch site — civil dawn, sunrise, sunset, civil dusk.

That last block is non-obvious until you've been burned by it. Part 107.29 lets you fly during civil twilight with the right anti-collision lighting, but "I thought it was still daylight" is not a defense at 7:48 PM in October. Sunrise and sunset for your exact coordinates, on the planned departure date, are part of the legal envelope of the flight.

### 4. Aviation Hazards

The things that aren't visible from the launch site.

- PIREPs (pilot reports) within ~50 nm in the last 6 hours.
- SIGMETs (significant meteorological hazards — convective, turbulence, icing).
- AIRMETs (moderate weather hazards — IFR, mountain obscuration, low-level wind shear).
- TFRs (temporary flight restrictions) within 5 nm.

A drone pilot operating at 350 feet AGL isn't going to be inside a thunderstorm at FL250, but the SIGMET tells you about the convective system rolling in. PIREPs tell you what manned pilots are actually experiencing nearby right now. TFRs tell you whether the President, a wildfire, or a stadium event has just made your planned flight illegal — something that can change in the hours between when you scheduled the job and when you arrive on site.

### 5. Risk Assessment

The page that distinguishes a real briefing from a checklist.

- A computed Fly-Now score (0–100) summarizing how favorable the conditions are.
- A risk matrix — each identified risk, its severity (low/medium/high), and the specific mitigation you'll apply.
- Emergency procedures for that flight.
- Emergency contacts (911 dispatch, nearest hospital, property owner, client contact).
- Ditching site coordinates (where you'd put the drone down if you lost control).

Risk assessment is the part of pre-flight planning the FAA cares about most when something goes wrong. Not "did the risk materialize" — risks materialize sometimes, that's why they're risks — but "did the pilot identify the risk in advance and have a documented plan." A flyaway is bad. A flyaway where the pilot can show they identified GPS interference as a risk, set a conservative RTH altitude, and pre-briefed the observer on lost-link procedure is *recoverable*. A flyaway where the pilot can't show any of that is a settlement.

### 6. Pre-flight Checklist

The last page is the one the pilot actually carries to the field.

- Drone-specific pre-flight items (props, gimbal, ACL, RTH altitude, GPS lock, battery state).
- Battery cycle counts for the packs going on this mission.
- Crew roster and visual observer details (if used).
- Pilot sign-off line.

The checklist is the bridge between the briefing (planning) and the flight log (execution). It's also the artifact that proves you actually performed the inspection 107.49 requires.

## Why the Hash Matters

Here's the part that makes a briefing legally different from a Word doc on your desktop.

Every Mission Briefing PreFlight 107 generates is locked at generation time. The data — METAR, TAF, hazards, airspace, solar times — is captured server-side from authoritative sources, not typed in by the pilot. Once the briefing is generated, the row is frozen. Then a SHA-256 hash is computed across the canonical fields and embedded in the PDF footer.

That hash is verifiable on a public page — `preflight107.com/verify`. Paste the briefing code or upload the PDF, and the page recomputes the hash from the stored data and tells you whether it matches.

The practical implication: if anyone — including the pilot — alters the PDF after the fact, the hash mismatches and the tamper-verification fails. A briefing PDF with a verifiable hash is functionally a notarized record. A briefing PDF with a *broken* hash is worse than no briefing at all, because it shows someone tried to change something.

This is the part that changes the legal conversation. When you hand the FAA, an insurance adjuster, or a client's legal team a hash-verified briefing, you're not asking them to trust your word about what conditions were before takeoff. You're handing them a document they can independently verify against the original captured data. That's the difference between "the pilot says" and "the system recorded."

A reasonable question: can't you just create a fresh briefing after an incident and claim it's the pre-flight one? No, because the `generated_at` timestamp is part of the hashed payload. A briefing generated 4 hours after the flight has a generation time of 4 hours after the flight. You can't backdate it without breaking the hash.

## Plan vs. Record — Two Documents, One Paper Trail

A Mission Briefing is the **plan**. It captures what you knew and what you decided *before* the flight, against forecast data for your planned departure time.

A flight log entry — or in PreFlight 107's case, the **FAA Evidence Packet** — is the **record**. It captures what was actually true *at takeoff*: realtime METAR at the moment your motors armed, server-stamped GPS at departure, the duration logged, and a tamper hash of its own.

Both are tamper-verified. Both reference each other. Together they form a complete due-diligence trail: "here's what I planned for, here's what actually happened, here are the gaps if any." A pilot who can produce both for a flight is the pilot who walks out of an FAA inquiry without a fine.

A practical example: forecast TAF said wind 8 knots at your planned departure. Briefing locked that in. On flight day, the actual METAR at takeoff showed gusts to 18 knots. If you flew anyway and bent a prop, the evidence packet shows the gust. The briefing shows the forecast didn't predict it. Both are honest records. You're not in trouble for the surprise — you're protected by the documentation.

Now imagine the alternative: forecast TAF said wind 8 knots, actual METAR said gusts to 18 knots, the briefing was edited after the flight to say "expected gusts to 18 knots." The hash breaks. Everyone — FAA, insurer, client — sees the tamper and concludes you've been creative with the records. That's a fundamentally worse position than if you'd just kept the original honest briefing.

The system is designed so that the safest, easiest path is also the most defensible.

## When You Actually Need One

Not every flight needs a Mission Briefing. Hobby flights at the local park don't. Quick test flights on your own property don't. Here's where they earn their keep:

- **Paid commercial work.** Any time money changes hands, the briefing is your evidence of professional standards. Many commercial clients now request it before signing the contract.
- **Complex flights.** BVLOS, dense airspace, near sensitive infrastructure, anything you'd want to defend in front of an FAA inspector.
- **Recurring inspections.** Cell tower routes, solar farm inspections, agricultural surveys — set up the briefing once, regenerate fresh weather data each cycle, and you have a consistent paper trail across hundreds of flights.
- **Insurance-required documentation.** Some commercial drone insurance carriers now ask for pre-flight planning records as part of policy compliance. A briefing is the cleanest way to satisfy that.
- **Training new pilots.** A briefing is a teaching tool. New Part 107 pilots who fill one out before every flight learn the discipline of structured pre-flight planning faster than any classroom session does.
- **After any near-miss or incident.** If something happens on a flight — even a non-reportable one — generate a briefing for that flight from your records as soon as possible. It's how you document your assessment of conditions at the time.

## The Update Pattern — When Forecasts Change

One thing the briefing system does intentionally: it doesn't let you edit a briefing after it's been generated. If you try, you'll get a polite "create a new draft instead" error.

The reason: editing breaks the hash, and if briefings could be silently edited, none of the tamper-verification means anything. So instead of editing, the workflow is to **update** — clone the existing briefing, change the weather/risks/mitigations to reflect the new information, and generate a fresh briefing with its own code.

The result: instead of one briefing that you've quietly massaged, you have two briefings — the original plan (MB-7K3F9P) and the revised plan (MB-8L4K2M, "updated from MB-7K3F9P"). Both live in your records. The FAA, an insurer, or a client doesn't see a doctored single record — they see a pilot who *reassessed when conditions changed*. That's stronger, not weaker.

This is the part new commercial pilots find counterintuitive. Most people are used to documents being editable. A briefing is not a draft. It's a notarized snapshot of what you knew at a moment in time, and the value of that snapshot depends on it staying frozen.

## The Bottom Line

Part 107 doesn't require you to fly with a Mission Briefing. It requires you to do the assessment a briefing represents. The briefing is just the document that proves it.

The math is straightforward. The cost of generating a briefing is a few minutes of pre-flight planning you should already be doing. The cost of *not* having one — when an FAA inquiry, insurance claim, or commercial client audit lands on your desk — can be thousands of dollars and a suspended certificate.

If you're flying commercially, generate briefings for the flights that matter. Lock them with a hash. Keep them paired with your evidence packets. Build the paper trail before you need it, because by the time you need it, building it is too late.

The pilots who get in trouble aren't usually the ones who broke the rules. They're the ones who can't show they followed them.

*Fly safe out there.*
