---
name: Hallmere
description: One living brilliant in a white room; its light is the only colour.
colors:
  plaster: "#eceef1"
  plaster-lit: "#f6f7f9"
  plaster-shade: "#c6cdd5"
  ink: "#14171b"
  ink-raised: "#22272d"
  steel: "#49515a"
  hairline: "rgb(20 23 27 / 0.14)"
  hairline-strong: "rgb(20 23 27 / 0.32)"
  fire-red: "#ff5a6a"
  fire-amber: "#ffb347"
  fire-yellow: "#f2ea6b"
  fire-green: "#6fe3a8"
  fire-cyan: "#58cdf7"
  fire-violet: "#9a7cff"
  error-garnet: "#a3293a"
typography:
  display:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.25rem, 1.5rem + 5.6vw, 6rem)"
    fontWeight: 200
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  numeral:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(5rem, 2rem + 9vw, 10rem)"
    fontWeight: 150
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 2.4vw, 3.75rem)"
    fontWeight: 200
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1.6rem + 3vw, 4.5rem)"
    fontWeight: 200
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)"
    fontWeight: 520
  body:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.94rem + 0.2vw, 1.125rem)"
    fontWeight: 380
    lineHeight: 1.55
  small:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 380
    lineHeight: 1.5
  label:
    fontFamily: "Supreme, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 520
    lineHeight: 1.25
    fontFeature: "tnum"
rounded:
  none: "0"
  hairline: "1px"
  full: "50%"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "1rem"
  "4": "1.5rem"
  "5": "2.5rem"
  "6": "4rem"
  "7": "6.5rem"
  "8": "10rem"
  gutter: "clamp(1.25rem, 0.6rem + 2.6vw, 3rem)"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.plaster-lit}"
    typography: "{typography.label}"
    rounded: "{rounded.hairline}"
    padding: "0 2.5rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.plaster-lit}"
  nav-cta:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.5rem 0"
  input-underline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0"
    height: "2.75rem"
  scale-mark:
    textColor: "{colors.steel}"
    typography: "{typography.label}"
  scale-mark-current:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  facet-counter:
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
---

# Design System: Hallmere

## Overview

**Creative North Star: "Fire on White"**

A single brilliant in a cool white plaster room, and the light it throws is the only colour on the page. Everything a person made (type, rules, controls) is drawn in near-black ink and steel grey on plaster, thin and quiet, so the stone's dispersion has nothing to compete with. Spectral colour enters only as light: flecks slid across walls by the stone's turn, the fire inside the ray-traced brilliant, a spectral underline that appears when a control is touched.

The page is one pinned room through which a whole life is scrubbed. The story is measured in viewport heights of scroll (2300vh for the journey) and plays inside a single sticky viewport: Flow footage scrubbed frame by frame, held still at each chapter, with fog passing between worlds. One Three.js stage stays on top across all of it and hands its objects (the brilliant, the rough crystal, the facet wireframe) into and out of the footage at the exact frame position where the filmed stone sits. A vertical depth scale at the left edge addresses the journey as a survey plate would: 0 m, −150 km, Surface, Bench, 57, Setting, Hand.

Density is low and the composition is edge-anchored: copy sits bottom-left or top-left, actions bottom-right, the centre belongs to the stone. The world explicitly rejects the category default of black velvet, gold serif and a ring spinning on a gradient.

**Key Characteristics:**
- Cool plaster ground, ink and steel type; dispersion is the only colour.
- One variable grotesk (Supreme) at extreme ends: 150–200 for display, 380 for reading, 520 for labels.
- Hairlines (1px) instead of boxes, fills or shadows.
- Fog, blur and light do the transitions; no wipes, slides or cuts.
- One pinned, scrubbed, fully reversible timeline with holds at each chapter.
- A static column of stills whenever motion or power is in doubt.

## Colors

A near-monochrome cool palette of plaster, ink and steel, with a six-stop spectrum reserved for light.

### Primary
- **Gallery Ink** (`ink`): All type at full emphasis, the primary button fill, the active chapter mark, focus outlines, and the facet wireframe drawn in the 3D stage. It is the hand of the atelier.
- **Raised Ink** (`ink-raised`): The primary button on hover only; a one-step lift, not a new colour.

### Secondary
- **Dispersion Spectrum** (`fire-red`, `fire-amber`, `fire-yellow`, `fire-green`, `fire-cyan`, `fire-violet`): Always used together as a band, in this order, never as single flat fills. It paints the spectral flecks on the walls, the underline that sweeps under a button or nav link on hover/focus, and the text selection (cyan alone, under ink text, is the single sanctioned solo use).

### Tertiary
- **Garnet** (`error-garnet`): Form validation only: an invalid field's underline and its error message. The only non-spectral hue in the system.

### Neutral
- **Cool Plaster** (`plaster`): Page ground, pinned viewport, theme colour, and the base under the fog.
- **Lit Plaster** (`plaster-lit`): The plain white field of the 57 chapter, the consultation panel, button text, still-frame fallback.
- **Shaded Plaster** (`plaster-shade`): Scrollbar thumb; the shadow side of the room.
- **Steel** (`steel`): Secondary text: ledes, scene body copy, form labels, inactive chapter marks, footer.
- **Hairline / Strong Hairline** (`hairline`, `hairline-strong`): Ink at 14% and 32%. Footer rule (light); scale spine, part leaders, input underlines, success-state rule (strong).

### Named Rules
**The Light Is the Only Colour Rule.** Hue appears only where light from the stone could plausibly land: flecks, dispersion, a spectral sweep on interaction. Surfaces, type and controls stay ink, steel and plaster.

**The Whole Spectrum Rule.** The fire colours travel as a band, red to violet. Never pull one stop out as a brand accent or a fill.

**The Garnet Exception Rule.** Garnet means "this field needs you" and nothing else.

## Typography

**Display Font:** Supreme (variable 100–800, Fontshare, self-hosted woff2) with ui-sans-serif, system-ui
**Body Font:** Supreme, same file
**Label/Mono Font:** Supreme at label weight with tabular numerals

**Character:** A single crisp grotesk stretched across its weight axis: hairline-light at display sizes so headlines feel cut rather than printed, a slightly heavy label weight so small addresses stay legible over footage.

### Hierarchy
- **Numeral** (150, up to 10rem, 1): The live facet counter in the 57 chapter; tabular, counts with the wireframe.
- **Display** (200, up to 6rem, 0.98, −0.035em): The hero headline only; max 8em measure, balanced wrap.
- **Title** (200, up to 4.5rem, 1.04, −0.03em): The consultation headline.
- **Headline** (200, up to 3.75rem, 1.04, −0.03em): Chapter scene titles over footage; balanced wrap.
- **Lead** (520, up to 1.5rem): Confirmation title after the form is sent.
- **Body** (380, 1–1.125rem, 1.55): Scene and panel copy in steel, 34–42ch measure, pretty wrap.
- **Small** (380, 0.875rem, 1.5): Hero lede, nav link, button text, footer.
- **Label** (520, 0.75rem, 1.25, tabular): Chapter addresses, part names, form labels, the counter's unit, error text. Sentence case, no tracking, never uppercase.

### Named Rules
**The Weight Axis Rule.** Hierarchy comes from size and weight extremes on one family (150–200 large, 380 reading, 520 small), not from a second typeface or from colour.

**The Quiet Label Rule.** Labels are small, sentence case and steel; they address, they never announce. No uppercase tracking, no kickers above headlines.

## Layout

Edge-anchored, full-bleed. Horizontal inset is a fluid gutter; content inside the journey and the consultation section additionally clears the chapter scale by `--scale-width` (`clamp(0px, -2rem + 10vw, 8.5rem)`), so text never collides with the scale. The nav is fixed, 4.5rem tall, transparent and click-through except for its two links.

**Pinned journey (desktop, fine pointer, motion allowed):** one 100svh sticky viewport (min 36rem) inside a 2400vh section. Media, fog, veil, the WebGL stone and scene copy are stacked layers in that viewport. Scenes are full-viewport grids padded 10rem top / 6.5rem bottom; copy columns are 24–34rem wide and sit bottom (Bench), centre (57) or top under the nav (Origin, Surface, Setting). The centre and right of the frame belong to the stone and the footage.

**Static mode (`.is-static`: prefers-reduced-motion, viewport ≤ 47.99rem, or coarse pointer):** the journey unpins into a vertical column of full-height stills. The hero becomes a 100svh room with the live stone; each chapter becomes a min-100svh section with its footage end-frame as a cover background, a plaster gradient rising from the bottom, and the copy bottom-aligned. The 57 chapter keeps a still, non-following brilliant rendered only while on screen. Video, fog, curtain, veil, part labels and the counter are removed; chapter anchors move onto the sections themselves. This is a first-class layout, not a degraded one.

**Small screens (≤ 47.99rem):** the chapter scale is hidden and its width collapses to 0; the hero stacks headline and action at the bottom over a plaster gradient; the consultation becomes a single column with a 4:5 photo above the form; form fields go to one column.

**Consultation:** a two-column grid (form 1fr, photograph 1.25fr) on lit plaster, form content bottom-aligned, two-up fields.

**Spacing rhythm:** an eight-step scale (0.25 → 10rem) whose upper steps (4, 6.5, 10rem) set the large vertical margins; 1.5rem is the default gap between stacked copy elements.

## Elevation & Depth

There are no shadows. Depth is atmospheric: fog, blur, scale and light, plus the real depth of the 3D stage.

- **Fog** is a blurred (24px) stack of plaster radial gradients over plaster. It fades in while scaling up slightly (1.05–1.08) and fades out while scaling further (1.15–1.18), hiding every cut between footage sources.
- **Curtain** is a vertically blurred (18px) plaster band swept upward across the frame once, to hide a join in the descent footage.
- **Veil** gathers fog as a soft ellipse behind the chapter scale labels (9rem × 19rem) and a 7rem fade under the nav, so both stay legible over footage without bleaching the frame. It sits above the stone canvas, and fades out on the plain 57 field. Where a photographed object would sit under the labels, the plate is reframed instead (the Bench plate is anchored right and scaled 1.14 from its right edge).
- **Copy patches**: over footage, scene copy sits on its own soft radial plaster patch (12px blur), never on a card.
- **Static stills** rise a plaster gradient from the bottom edge behind the copy.

### Named Rules
**The Fog Not Box Rule.** When text needs separation from an image, gather plaster fog behind it. Never a card, scrim box or drop shadow.

**The Flat Plaster Rule.** UI is flat at rest and in every state; the only thing with volume on the page is the stone.

## Shapes

Square and linear. Controls are rectangles with a barely perceptible 1px corner; inputs have no box at all, only an underline. Lines are always 1px hairlines: the scale's spine and ticks, part leaders, input underlines, the footer and success-state rules. The single round form is the depth probe on the scale (an 0.5rem ink-outlined circle). The faceted brilliant and the crystal's fracture shards supply all the geometry; UI never imitates facets.

## Components

### Buttons
Dense ink slabs that catch a line of light when touched.
- **Shape:** near-square (1px radius), min height 3.25rem, 2.5rem side padding.
- **Primary:** ink fill, lit-plaster label text at label weight, small size.
- **Hover / Focus:** fill lifts to raised ink (180ms ease-out); a 2px spectrum band grows from the left along the bottom edge (scaleX 0 → 1, 420ms ease-out) on hover and on keyboard focus.
- **Text link (nav action):** ink text with a 1px ink underline that becomes the spectrum on hover.

### Inputs / Fields
- **Style:** transparent, no box, no radius; 1px strong-hairline underline, 2.75rem tall; label above in steel label type.
- **Hover:** underline darkens to steel. **Focus:** underline turns ink, no outline ring.
- **Error:** underline and a label-size message beneath turn garnet; messages are plain sentences that say what to do.
- **Success:** the form is replaced by a confirmation block under a hairline rule: lead-size title, steel body, a label-size note.

### Navigation
- **Top bar:** fixed, transparent, brand wordmark left (body size, label weight), one consultation link right. No background ever; the veil provides legibility over footage.
- **Focus:** global 1px ink outline, 4px offset.

### Chapter Scale (signature)
The survey-plate depth scale at the left edge, vertically centred, is both navigation and progress.
- A 1px strong-hairline spine with a short tick before each mark; marks are label-type addresses (0 m, −150 km, Surface, Bench, 57, Setting, Hand) in steel, tabular.
- **Current / hover:** text turns ink, the tick doubles from 0.5rem to 1rem, and the chapter name unfolds beneath the address (420ms).
- **Live depth:** during the descent the first address counts down in real units (−10 m steps, then km) with its name set to "Descent", and an outlined probe travels down the spine between 0 m and −150 km.
- Links land on a chapter's hold, never on the start of its transition. Hidden on small screens.

### Facet Counter and Part Leaders (signature)
In the 57 chapter a giant numeral (weight 150) counts 01 → 57 in step with the wireframe drawing itself facet by facet; a small steel unit sits under it. Part names (Crown, Girdle, Pavilion) sit on 1px strong-hairline leaders projected from the live stone's geometry, all ending on a common right edge.

### Stone Stage (signature)
One transparent WebGL canvas above the footage across the whole journey.
- **Brilliant:** ray-traced, per-channel refraction (IOR 2.417, dispersion 0.03–0.05), turning slowly and leaning toward the pointer; a fixed key/rim/under light rig.
- **Rough crystal:** a frosted octahedral crystal that refracts a copy of the current backdrop frame; at the Bench it shivers, then bursts its fractured shell outward.
- **Facet wireframe:** ink line segments that grow edge by edge in facet order (0–57), then dissolve as glass fills in.
- **Flecks:** soft spectral streaks on 2D canvases, flashing when the stone's turn lines a facet up with them and drifting with its tilt.
- **Handoff:** to pass the stone into footage, the stage moves it to the filmed stone's position (computed through `object-fit: cover`) and matches its size, then fades it while the footage continues.

### Motion grammar
- **Scrub:** one GSAP ScrollTrigger timeline, linear ease, 0.6s scrub smoothing, every step reversible. Footage is buffered as a blob so it seeks instantly in both directions.
- **Holds:** each chapter has a hold point where footage and stone stop and the copy reads; scroll between holds advances footage.
- **Entrances:** scene copy fades in over 30–40vh with a 30px lift (power1/power2 out); exits fade without movement.
- **Transitions between worlds:** fog in (power2 in), swap sources while fully fogged, fog out with growing scale (power2 out). Plain cross-fades are used only when both frames share plaster.
- **UI micro-motion:** 180ms for colour changes, 420ms for reveals, `cubic-bezier(0.16, 1, 0.3, 1)` ease-out.

## Do's and Don'ts

### Do:
- **Do** keep every surface plaster and every mark ink or steel; let the stone supply the colour.
- **Do** use the spectrum as a complete red-to-violet band, as light (flecks, a hover underline), never as a fill.
- **Do** separate text from footage with gathered plaster fog (radial patch, edge veil, bottom gradient).
- **Do** hide every change of footage source inside fog, and keep each transition reversible on scroll.
- **Do** hand 3D objects into footage at the filmed object's measured frame position and size.
- **Do** give each chapter a hold before advancing its footage again.
- **Do** ship the static column of stills for reduced motion, small screens and coarse pointers, with the stone still present.
- **Do** keep labels small, sentence case, tabular and steel.

### Don't:
- **Don't** use black velvet, gold, serif display type or a ring spinning on a gradient.
- **Don't** introduce a hue outside the spectrum and garnet, and don't use garnet for anything but validation.
- **Don't** add box-shadows, cards or filled panels behind copy.
- **Don't** add kickers, eyebrows or uppercase tracked labels above headlines.
- **Don't** add radius beyond 1px to controls or a box around inputs.
- **Don't** cut or wipe between footage sources; fog is the only transition between worlds.
