---
title: How Commercial Drone Clients Actually Verify a Part 107 Pilot in 2026
date: 2026-05-22
excerpt: A printed certificate number doesn't prove much. Here's how clients are starting to demand verifiable credentials — and what the Apple Wallet pilot card, public profile pages, and SHA-256-verifiable briefings have to do with winning more work.
readTime: 8 min read
---

## The Question Every Commercial Pilot Eventually Hears

You quote a job — roof inspection, real estate, an event flyover — and the client comes back with one line that didn't appear in any of your earlier conversations:

**"Can you send proof you're licensed?"**

The question sounds simple. It almost never is. The client doesn't want a screenshot. A screenshot of an FAA wallet card proves nothing — anyone with five minutes can fake one. Cropping a date out of an old certificate, slapping someone else's headshot on a PDF, "borrowing" a friend's Part 107 number — none of that is hard. The fact that pilots routinely send certificate photos by text and clients routinely accept them isn't because the system works. It's because the system hasn't been challenged yet.

That is changing. Larger commercial clients — utilities, insurers, municipalities, anyone whose lawyer has touched a drone contract recently — are getting wise. They want something they can actually verify. And the pilots who can show up with verifiable credentials are starting to get the work.

This post is about what verifiable credentials actually mean for a Part 107 pilot, what a client is really asking for when they ask for "proof," and how to set yourself up so the answer is "yes, here's the link" instead of "let me text you a screenshot."

## What "Verifiable" Actually Means

A credential is *verifiable* when a third party — your client, an insurer, a lawyer — can independently confirm it's real, without trusting you to tell the truth. There are three properties that matter:

1. **The credential resolves to a single, identifiable person.** Not just a number — a name, a photo, a stable identifier that ties the document to a human.
2. **The verification doesn't go through you.** The client should be able to open something — a link, a card, a profile page — without your phone in their hand.
3. **The verification is current.** A certificate that was real in 2022 doesn't prove anything in 2026 if the pilot let it lapse.

The FAA Airman Registry meets all three. It's a public database. You can search by certificate number or name, and it tells you whether someone holds an active Remote Pilot Certificate. That is the gold-standard verification — and most commercial pilots have never told a client it exists, because they didn't know it themselves.

But the registry has limits. It returns a name. It doesn't return a flight history, an insurance policy, or anything else a client might actually want to see alongside the cert. And clients have to know to look there in the first place, which most of them don't.

That gap — between "the FAA technically lets anyone verify your cert" and "the client actually does it" — is where verifiable digital credentials come in.

## The Three Things Clients Are Actually Trying to Confirm

When a client asks for proof, they almost never just want the certificate number. They want answers to three implicit questions. If you can answer all three in one link, you win the job.

**Question 1: "Are you a real licensed pilot?"** This is the FAA Airman Registry question. A real cert number, an active status, your name attached.

**Question 2: "Have you actually flown before, or did you just pass the test?"** A first-time pilot with a fresh cert is technically legal and operationally unproven. A pilot with a hundred logged flights is a different proposition. Clients can't always articulate this distinction — but they feel it the moment they see a flight history.

**Question 3: "If something goes wrong, who's on the hook?"** Insurance. Either you have a commercial drone liability policy or you don't. If you do, the policy has a number, a carrier, a coverage amount, and a date range. If you don't, the client's lawyer wants to know that before contracts go out, not after a drone hits a window.

Sending a screenshot of your certificate answers maybe one and a half of those questions, badly. A real verifiable credential answers all three in one place.

## The Apple Wallet Pilot Card

This is the cleanest answer to the "send me proof you're licensed" question, and it lives on hardware the client already trusts. An Apple Wallet pass is a PassKit object — a small structured document, cryptographically signed by the issuer (in our case, PreFlight 107's signing certificate), stored on the client's iPhone right next to their boarding passes and credit cards.

When you generate a pilot card in PreFlight 107 Pro, you get a `.pkpass` file. You can AirDrop it, message it, or email it. The recipient taps "Add to Wallet" and now your credentials live in their phone. The card shows:

- Your name and (optionally) a photo
- Your Part 107 certificate number
- Your stable PreFlight 107 account code (the public identifier)
- A link to your public profile, which is where verification happens

The card itself is not the proof. The card is the *handle* on the proof. It's the thing that lives in the client's pocket, with your name on it, ready to be tapped when they need to remember who you are or look you up again.

Two things to be honest about. First: an Apple Wallet pass is not an FAA-issued credential. The FAA does not run a digital wallet program. The pass is a credential we issue, signed by us, that *points* to credentials the FAA *can* confirm. We say "Verified Part 107 Pilot" on the pass because the user told us they are one, and the card includes the cert number for the recipient to verify independently. That's also why our public profile page includes the line "self-reported credentials, verify Part 107 status independently at the FAA Airman Registry." Honest marketing wins over the long run.

Second: Apple Wallet works on iPhone. Android users can receive the equivalent through Google Pay or a shared web link — but the elegance of the AirDrop-to-Wallet flow is uniquely an iPhone experience right now. For the next year or two, the pilots whose clients are mostly on iPhone get the most leverage from this feature.

## The Public Profile Page

This is the thing that does the actual verifying. Every Pro subscriber gets a public web page at `preflight107.com/pilot/<account-code>` — a real URL the client can open in any browser, no app required.

The page shows:

- Pilot name (as you've entered it)
- A "Verified Part 107 Pilot" badge, only if you've entered a cert number, with a footer disclosing it's self-reported and pointing to the FAA registry
- A flight history summary — total logged flights, total flight hours, last-flight date
- Insurance card details if you've added a policy
- Your business name and contact info (if you've chosen to make those public)

The point of the page is that it consolidates everything a client would otherwise ask for piecemeal — cert, hours, insurance, business details — into a single URL they can pull up in a browser on their desk, share with their compliance team, or print to a file for their job folder.

The page is also where the client can tap "Add to Apple Wallet" themselves, if you sent them the link instead of the pass directly. Sharing the URL is friendlier than sending a file — links are easy to forward, easy to bookmark, and don't trigger any "is this a virus" instincts.

## Tamper-Evident Briefings Close the Last Loop

For most jobs, a pilot card and a public profile are enough. The client confirms you're real, books the work, gets the deliverable. Done.

For more demanding jobs — utilities, government, anything involving an insurance claim or a public safety inspection — the conversation goes one step further. The client wants to see, after the fact, that you actually did the planning you said you did before each flight. That's where Mission Briefings come in.

Every Mission Briefing PDF generated by PreFlight 107 includes a SHA-256 cryptographic hash at the bottom of every page, plus a briefing code like `MB-XKA5RC`. That hash is computed at generation time from the weather data, airspace state, hazards, NOTAMs, pilot block, and other authoritative content captured for that briefing — and stored in our database.

If anyone modifies the PDF — changes a wind speed, alters a timestamp, edits the signature line — the hash printed on the document no longer matches the hash on file. Anyone can verify a briefing at `preflight107.com/verify`. They paste in the hash, and the page reports whether the document is authentic, when it was generated, what mission it was for (unless you generated it in white-label client mode), and the pilot initials.

The verification page is public, requires no login, and reveals only the minimum metadata needed to confirm authenticity. Sensitive details — full pilot identity, certificate numbers, exact coordinates, insurance policy numbers — are never exposed by the verify endpoint. Only what a third party legitimately needs to confirm "yes, this PDF is real."

## The Practical Stack

Here is how it ties together in a real client interaction.

You quote a job. The client asks for proof of credentials. You text three things:

1. A `.pkpass` file (the Apple Wallet pilot card) — they add it to their phone in two taps
2. A link to your public profile — they can show their compliance person without forwarding files
3. A short note: "If you need verified pre-flight documentation per mission, I provide tamper-evident Mission Briefing PDFs for each flight — verifiable at preflight107.com/verify."

Three messages. Three minutes. Every client question answered, every claim independently verifiable.

Compare that to the version where you screenshot your wallet card, type out your cert number in a message, dig up your insurance declaration page from a PDF buried in your downloads folder, and email it as an attachment.

Same information. Wildly different signal.

## A Word on Honesty

It's worth saying out loud: the goal of verifiable credentials is not to look impressive. It's to make verification trivially easy for the client. Pilots who use these tools to dress up shaky credentials are going to lose, badly, the first time a client actually verifies. The FAA Airman Registry still has the final say. The hash on your Mission Briefing still has to match what's in the database. The flight count on your public profile is still computed from your logged flights — you can't fake it without faking the flights.

The pilots who win with these tools are the pilots who already do the work — fly real flights, hold real insurance, maintain real records — and want a clean, professional way to communicate that to clients. The tools are a megaphone for honest pilots, not a costume for dishonest ones.

## Where to Start

If you're a working Part 107 pilot and you want to set up verifiable credentials this week:

1. **Enter your Part 107 cert number in PreFlight 107.** This unlocks the Verified Part 107 badge on your public profile and the cert line on your Wallet card.
2. **Add your business name and (if relevant) your insurance policy.** Both render on your public profile and Wallet card.
3. **Log every flight.** Your public profile shows your flight count and total hours computed from your actual logs.
4. **Generate the Apple Wallet pilot card** in the Pilot Card screen. AirDrop or message it to yourself first, confirm the formatting looks right, then send it to your next client.
5. **Bookmark your public profile URL** — it's the link you send when someone asks "send me proof you're licensed."

For pilots who need the full credential stack including per-flight tamper-evident briefings, that's the Pro+ tier. For most operators, the Pro Pilot tier — which includes the Wallet card and the public profile — is enough to start.

The clients who care will notice. The clients who don't are going to notice eventually too.

Fly safe, and prove it.
