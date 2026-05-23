---
title: The FAA Evidence Packet — The Post-Flight Document That Saves You When Someone Asks "Were You Sure?"
date: 2026-05-23
excerpt: A Mission Briefing proves you planned the flight properly. An FAA Evidence Packet proves what was actually true at the moment you flew. Most pilots build neither — and end up reconstructing the story from memory months later, when an insurance adjuster or FAA inspector finally calls. Here's what an Evidence Packet contains, when you'll wish you had one, and how to build them automatically.
readTime: 8 min read
---

## The Phone Call No Pilot Expects

You're three months removed from a routine roof inspection. The flight took eighteen minutes. Nothing went wrong. You forgot it the day you finished invoicing.

Then your phone rings. It's the property owner. They've been doing renovation work on the roof you photographed, and the contractor is now saying there are scuff marks on a HVAC unit that wasn't visible from the ground. The property owner wants to know if your drone could have caused them.

You think for a second. *Could* it have? Your DJI was up there. You were flying conservatively. You don't remember getting that close. But it's been three months. You don't really remember the specific path. You took photos of the roof, sure, but you didn't take photos of the HVAC. You don't have flight playback. You don't have logs at the per-second resolution you'd need to prove altitude and proximity.

You can say "I don't think I did" with confidence. You can't say it with proof.

This is the moment a pilot wishes they had an **FAA Evidence Packet** — a server-stamped, tamper-evident record of what was actually true at the moment of flight. Not a memory. Not a screenshot. A document that says, with cryptographic certainty: at 14:23 local time on March 4th, the aircraft was at 47 feet AGL, over coordinates X/Y, with wind at 6 kt from 280°, METAR KGRR 191453Z reporting VFR, and the pilot was certified, current, and insured.

This post is about what's in that document, when you'll need one, and why the act of building it is what separates pilots who win disputes from pilots who lose them.

## Mission Briefing vs. Evidence Packet — Two Different Documents

Pilots often conflate these. They're related but distinct, and they serve different audiences.

**Mission Briefing** is the *plan* document. You build it before the flight. It captures:

- What you intended to do (mission objective, planned departure, route)
- The forecast you saw (TAF, planned wind, planned visibility)
- The airspace you analyzed (LAANC status if applicable, NOTAMs reviewed)
- The risk assessment you performed
- The pre-flight checklist you ran
- Your pilot and aircraft details

The Mission Briefing answers the question: **"Did the pilot do their homework before launching?"** It demonstrates due diligence. It's what you hand a client to demonstrate professionalism, or what you produce when someone asks "did you check airspace?"

**FAA Evidence Packet** is the *record* document. It's generated from your flight log after the flight (often automatically, server-stamped). It captures:

- What actually happened (real GPS coordinates at depart and land, actual flight duration)
- The conditions that were actually present (real METAR pulled at flight time, not forecast)
- Airspace status as of the flight moment
- Your pilot certification record and currency status at flight time
- Insurance coverage in effect at flight time

The Evidence Packet answers a different question: **"What was actually true at the moment of flight?"** It proves the conditions you operated under. It's what an insurance adjuster wants. It's what an FAA inspector reviewing an inquiry wants. It's what a lawyer wants if a property owner sues.

The Mission Briefing is what you did before you took off. The Evidence Packet is what actually happened when you flew. **You need both.** Insurance lawyers and FAA inspectors aren't usually satisfied with one without the other — proper documentation includes both the plan and the record.

## What's Inside a Good FAA Evidence Packet

Not all "evidence" is created equal. A photo of your weather app is technically evidence, but it's not very *strong* evidence — it's a screenshot from a single client, taken at an unclear time, with no chain of custody. An Evidence Packet built right has properties that resist challenge.

A defensible Evidence Packet should include:

1. **Server-stamped timestamps.** Not your phone's clock. A central server records the depart/land moments with its own clock and stores them immutably. This proves you didn't backdate the log.

2. **Verified GPS coordinates at depart and land.** Latitude/longitude to at least four decimal places. The flight log records where the drone left the ground and where it returned.

3. **METAR pulled from the official source at flight time.** Not "approximately what the weather was." The actual METAR string from AWC (the FAA's Aviation Weather Center) for the closest station, fetched at depart time and locked into the record.

4. **Pilot certification snapshot.** Your Part 107 certificate number and currency status (i.e., whether your 24-month recurrent training was current) as of the flight date. Not "I am currently certified." *Was I certified at the time of the flight in question.*

5. **Aircraft registration.** Your FAA registration number and the specific drone model and serial flying that day.

6. **Insurance in effect.** Policy number, carrier, and coverage in effect at the flight moment.

7. **A cryptographic hash on every page.** A SHA-256 hash computed from all the above data, stamped on every page of the resulting PDF. If anyone modifies a single character of the PDF, the hash no longer matches. This is what makes it tamper-evident.

8. **A verification endpoint.** A public URL where the recipient can paste the hash and confirm the document is authentic — without needing to take the pilot's word for it.

That last property — independent verifiability — is the difference between a document a pilot *says* is real and a document anyone can *confirm* is real.

## When You'll Wish You Had One

Most pilots will go their entire career without ever needing to produce a single Evidence Packet. The pilots who *do* need one usually find out the hard way that they don't have one. Here's the actual list of moments when this document gets demanded:

**FAA inquiry following a complaint.** Someone — a homeowner, a property manager, a competitor — files a complaint with the FAA. The FAA opens an inquiry. The Flight Standards District Office (FSDO) inspector calls you. The question is some variation of: "On the date in question, were you operating in compliance with Part 107?" You have to demonstrate that you were. The Evidence Packet shows your altitude, your distance from people, your airspace authorization, and your conditions. Without it, you're describing your memory of a flight from months ago.

**Insurance claim involving the drone.** A property is damaged near a site you flew. An insurance adjuster wants to confirm or rule out drone involvement. They want to know: what was the drone doing at the time of the alleged incident? Was it in the air? Where? At what altitude? Your insurance carrier will ask for documentation. If you provide it cleanly, the claim resolves cleanly. If you can't, your carrier defaults to assuming the worst case.

**Client dispute about deliverables.** A client claims the flight didn't happen, or didn't happen during the window they paid for, or that you flew somewhere you shouldn't have. Evidence Packet with server-stamped depart/land coordinates and times ends this conversation in your favor immediately.

**Subpoena in a lawsuit.** Someone is suing someone else, and one of the parties is interested in whether a drone was in the area. You receive a subpoena to produce records. Your Evidence Packets get turned over to the lawyer; the lawyer either confirms drone involvement or rules it out based on coordinates.

**Annual audit of your business.** Some commercial drone operators are audited by their commercial clients (utilities, government contractors, real estate firms with strict liability policies). They want to verify you're operating compliantly across all flights. You hand them the folder of Evidence Packets for the period.

The pattern is: **you almost never need this document, but when you do, nothing else substitutes for it.** And the time to build the documentation system is *before* the inquiry, not after.

## What Most Pilots Do Instead (And Why It Falls Apart)

The pilot-DIY approach to evidence usually looks like:

- A Google Sheets log with date, flight time, location, and a free-text "weather notes" field
- Screenshots of UAV Forecast or AccuWeather from before the flight
- A flight time recorded in your DJI controller (which doesn't sync to anywhere)
- An invoice with a date on it (if it was a paid flight)
- Maybe a few photos from the actual flight

This holds up fine for accounting. It doesn't hold up against challenge. Specifically:

- The spreadsheet has no timestamp on its individual entries. You could have added a row yesterday for a flight three months ago. There's no proof you didn't.
- The weather screenshot was taken on your phone. No chain of custody. The image metadata can be edited. The app version you used may not exist anymore.
- The DJI controller log proves the drone flew — it does *not* prove you were the pilot, that you were certified at the time, or what airspace you were in.
- The invoice proves a transaction occurred. It doesn't prove what conditions you operated under.
- Photos prove you took photos. They don't prove altitude, distance, certification, or insurance status.

The problem isn't that pilots are lazy. It's that the things needed to *prove* operation in compliance are different from the things needed to *operate* in compliance. You can be fully legal and have no record that you were fully legal.

## Building Evidence Automatically — The PreFlight 107 Approach

In PreFlight 107, every flight you log generates a complete Evidence Packet as a byproduct. You don't have to remember to build it. You don't have to capture the weather separately. You don't have to attach the right files.

Here's how it works:

1. **You tap "Depart"** when you take off. The app immediately captures your GPS coordinates, looks up the closest METAR from AWC, pulls your active drone profile, your insurance status, and your Part 107 currency. All of these are server-stamped with the exact moment you tapped Depart.

2. **You fly.** The app runs in the background. You don't have to do anything else.

3. **You tap "Land"** when you finish. The app records your landing coordinates and the actual flight duration with the same server timestamps. The post-flight METAR is also captured (sometimes weather changes during a flight — this matters for accident reconstruction).

4. **The flight log appears in your "My Flights" list** with the Evidence button. Tap it, and the app generates the Evidence Packet PDF on demand. The PDF includes everything: depart/land coordinates and times, weather at each moment, your certification snapshot, your aircraft details, your insurance in effect, and a cryptographic SHA-256 hash stamped on every page.

5. **If you also have a Mission Briefing** for that flight (from before takeoff), you can attach it to the Evidence Packet so the two documents travel together. The result is a single deliverable that answers both "what did you plan?" and "what actually happened?"

6. **Any recipient can verify the hash** by visiting preflight107.com/verify and pasting the hash from the PDF footer. The page confirms the document matches the server record and hasn't been modified.

The whole workflow is two taps — Depart and Land. The Evidence Packet exists from the moment you land. You can deliver it to a client the same day, or you can leave it in your archive and only retrieve it the day someone asks.

## Why "Automatic" Matters More Than "Comprehensive"

There's a tension in compliance documentation between *comprehensive* and *automatic*. A comprehensive document records every detail of every flight. An automatic document records the right details with zero pilot intervention.

Comprehensive without automatic = a great workflow nobody follows. Automatic without comprehensive = lots of records, but none of the ones you actually need.

PreFlight 107's bet is that **automatic + the right details** beats *comprehensive + manual* every time. Here's why:

- Pilots fly 100+ flights a year. Manual documentation degrades over time as the novelty wears off.
- The biggest compliance failures aren't because pilots didn't *know* the rules. They're because pilots didn't *capture* the conditions they operated under at the moment of operation.
- When the inquiry happens, you don't get a chance to reconstruct what was true three months ago. The data either exists at the right resolution, or it doesn't.
- Future-you is always going to be less motivated than current-you to document something thoroughly. Build the system around future-you's limitations.

The pilots who win disputes aren't the most-compliant pilots. They're the most-*documented* pilots. And they're documented because the system did the work for them.

## When the Phone Call Comes

Going back to the opening scenario: three months in, the property owner calls. They want to know if you scuffed the HVAC unit.

With an Evidence Packet, you open your phone, navigate to that flight, generate the PDF, and within 30 seconds you have a document showing your altitude history, your GPS coordinates throughout the flight, the conditions at the time, and the certification + insurance you held. You forward it to the property owner with a brief note: "Here's the complete flight record from that day. As you can see, the drone stayed above 35 feet AGL throughout the flight, and the closest pass to the HVAC location you mentioned was 22 feet horizontally. I don't believe my flight caused those marks. If you'd like an independent verification, this document is hash-verifiable at preflight107.com/verify."

That's the difference between a pilot who can answer with confidence + proof, and a pilot who can only answer with "I don't think I did."

You'll almost never need this document. But the pilots who win when the phone call does come are the ones who built the system to generate it automatically, before they had any reason to think they'd need it.

Fly safe. And document it.
