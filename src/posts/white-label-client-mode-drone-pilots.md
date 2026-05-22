---
title: White-Label Mission Briefings — How Your Logo on a PDF Changes the Client Conversation
date: 2026-05-22
excerpt: Most drone pilots send clients a stack of screenshots and a chatty text. The pilots who win bigger contracts hand them a branded PDF that looks like it came from a company. Here's what white-label briefings are, why clients respond differently to them, and how to set yours up.
readTime: 7 min read
---

## Two Pilots, Same Inspection, Different Outcome

Two drone pilots quote the same roof inspection — a 12,000 square-foot commercial building, modest height, low-risk job. Both are properly licensed. Both have clean records. Both quote within a hundred dollars of each other.

Pilot A finishes the job, texts the client: "Got the photos. Wind was 8 mph, partly cloudy. Here's the album link. Thanks!"

Pilot B finishes the job, emails the client a four-page PDF on letterhead. The cover page has their company logo, business name, and contact info. Page two is the weather, the airspace authorization status, and the pre-flight risk assessment. Page three is the flight log entry — duration, altitude, drone model, pilot certificate number. Page four is a signature block with a QR code linking to a public verification page. Subject line: "Inspection complete — flight documentation attached."

Both pilots delivered the work. Only one of them just made it easy for the property manager to forward something to the building owner, the insurance company, and the asset management team — and only one of them is going to be top-of-mind the next time a job comes up.

This post is about what makes the difference. Not the photos. Not the price. The wrapper.

## What White-Label Client Mode Actually Does

White-label mode (a Pro+ feature in PreFlight 107) does one thing: it replaces PreFlight 107's branding on a generated Mission Briefing PDF with **your** business branding. Specifically:

- Your business name appears in the header instead of "PreFlight 107"
- Your business logo replaces the PreFlight 107 logo
- Your business contact info (phone, email, website) replaces ours in the footer
- The PDF still includes the tamper-evident SHA-256 hash and the briefing code, but the verification footer reads "Verify this document at [your business URL]" or, if you don't have one, the neutral language "Verify this document using the briefing code."

What it does *not* do:
- It does not change the underlying briefing data (weather, airspace, NOTAMs, etc.)
- It does not affect the public `/verify` page on preflight107.com — the hash still resolves there, because that's where the cryptographic record lives
- It does not let you remove the briefing format version or the hash algorithm metadata — those are needed for verification

Think of it as a polish layer on top of the same data. The cryptography stays ours. The branding becomes yours.

## Why a Branded PDF Changes the Conversation

There are a few things going on when a client opens a branded document instead of an unbranded one.

**Forwardability.** A client who receives a PreFlight 107-branded PDF and forwards it to their boss has to explain what PreFlight 107 is. A client who receives a PDF on your letterhead just forwards it. The mental friction is gone. The document represents *you*, not a tool you used.

**Perceived professionalism.** A pilot who can produce a branded operations document looks like a company. A pilot who can't, doesn't. This is unfair to the talented solo operator who flies better than anyone — but it's how decisions get made when the person comparing quotes has never seen a drone briefing before in their life.

**Account stickiness.** If the document on file at the client's office says "Sky Aerial LLC" with your contact info, they call Sky Aerial LLC the next time a job comes up. If it says "PreFlight 107," they don't know who to call. They might search their inbox, find your old email, eventually reach you. Or they might just call the next pilot they remember.

**Insurance and legal.** When an incident happens — even a minor one, like a complaint about a flight near a property line — the first thing an insurance adjuster or attorney asks for is the pre-flight documentation. A branded PDF from a recognizable business goes into a folder labeled "vendor records." An unbranded PDF from an app they don't recognize gets a follow-up question: "what is this?"

None of these effects are huge in isolation. They compound. Three or four jobs in, the branded operator is the one the client recommends to a peer. The unbranded operator is the one the client used "that one time."

## What You Need to Set It Up

White-label client mode requires three things:

1. **A Pro+ Operator subscription.** This is the only PreFlight 107 tier that includes the feature, by design — Pro+ is the commercial tier, and white-label is the commercial differentiator.
2. **A business logo.** PNG or JPG, ideally with a transparent background, at least 800 pixels on the long side. We resize it for the PDF but a higher-resolution source gives sharper output. Upload it in Settings → Branding inside the app.
3. **Business contact info.** Name, phone, email, and (optionally) website and physical address. These show on the footer of every white-label PDF.

That's it. Once those are set, every Mission Briefing generated by your account can be toggled to white-label mode via a switch on the briefing form. You can leave it off for personal flights and turn it on for client work.

If you don't have a logo yet — and a lot of solo operators don't — even a simple wordmark in your business name in a clean sans-serif font is dramatically better than nothing. You can put one together in 20 minutes in Canva or Figma. The bar isn't "professional designer." The bar is "looks like a business made it."

## How White-Label Interacts With Verification

This is the part that confuses some pilots when they first turn the feature on, so worth being explicit about.

**The verify page is still public.** Anyone who receives a white-label briefing can still paste the SHA-256 hash into a verifier and confirm the document is authentic. The default verifier is `preflight107.com/verify`. Pro+ Operators can optionally point the footer copy to their own verification URL — but right now the underlying data is on our servers, and `preflight107.com/verify` is where the actual hash check happens.

**The hash check returns less metadata in white-label mode.** When a normal Mission Briefing is verified, the verify page returns the mission name and pilot initials. In white-label mode, the mission name is hidden — the verifier sees "Verified — briefing matches our records" with the timestamp and format version, but not the mission's internal name (which might reveal client information you'd rather keep private). The hash is still cryptographically valid; we just don't broadcast the mission label to anyone with the hash.

**Your branding is on the PDF, our database is the source of truth.** This split is intentional. White-label is about presentation. Cryptographic provenance is about substance. Pilots who try to remove all references to PreFlight 107 from the PDF lose the ability to verify it cryptographically — which means the document loses its evidentiary value. Most pilots don't realize this until the first time they actually need the document to *do* something legal or financial.

The right mental model: your branding is on the front, ours is in the watermark. The watermark doesn't shout — but it's there, and it's what makes the document worth more than a PDF anyone could fake in Word.

## When to Use White-Label and When Not To

White-label isn't always the right call. A few cases where it's worth it:

- **Any client deliverable.** Inspection reports, real-estate fly-throughs, survey deliveries, event coverage. If the document leaves your hands and goes to someone who's paying you, it should look like a business document.
- **Recurring contracts.** Same client, multiple flights, monthly invoicing. The branding builds familiarity. By the third briefing, the client's filing system has a folder with your business name on it.
- **Subcontract work.** You're flying as a subcontractor for a larger firm. The firm wants documentation they can hand to *their* client. Your branding here is a professionalism signal to your subcontractor that you understand the chain — and they're more likely to keep using you.

And cases where it's not worth it:

- **Personal flights.** Hobby flights, practice flights, flights you're never going to share with anyone. No reason to spin up branded documentation.
- **Training records.** If you're documenting flights for a Part 107 currency requirement or as part of a structured training plan, the PreFlight 107 branding is fine — these are your records, not deliverables.
- **Sample / demo briefings you share publicly.** If you're posting a sample briefing to your website or social media to show prospective clients what your work looks like, *don't* white-label it. Use the PreFlight 107 branding so people understand the tool. Once they're a client, then your branding goes on their briefings.

## A Last Note on Substance

White-label client mode is a presentation feature. It is not, by itself, going to win business. The pilots who get the most out of it are pilots who already do excellent work and want the wrapper to match the substance. The pilots who try to use it to cover for sloppy work are going to lose the moment a client looks closely at the actual briefing content — the weather analysis, the risk assessment, the airspace clearances — and finds it shallow.

If you're going to invest in branded documentation, also invest in *the content* of the documentation. Fill in the optional fields. Add real risk mitigations specific to the site. Include landowner permissions when they apply. Write a real mission objective sentence instead of leaving it blank.

The pilots whose branded PDFs hold up to scrutiny are the pilots who get the second and third call. The pilots whose PDFs are fancy on the outside and empty on the inside get one shot and then go back to texting screenshots.

White-label is a multiplier. What it multiplies is up to you.
