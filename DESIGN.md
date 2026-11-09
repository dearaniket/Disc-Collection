---
name: Caseshelf
description: Your own game and movie cases, handled one at a time under a lamp.
colors:
  void: "#0a0a0a"
  ink: "#121316"
  slate: "#1e2026"
  mist: "#2a2f39"
  fog: "#5a6472"
  text-secondary: "#a3abb6"
  sand: "#c7b9a6"
  bone-white: "#f4f4f2"
  alert: "#ff8a7a"
  plastic-ps5: "#2149b8"
  plastic-ps4: "#1a3a94"
  plastic-xbox: "#1f7d3c"
  plastic-switch: "#c8262c"
  plastic-pc: "#1a1a1c"
  plastic-dvd: "#141416"
  plastic-bluray: "#2a5ad6"
  plastic-uhd: "#111113"
typography:
  display:
    fontFamily: "Antonio, 'Arial Narrow', sans-serif"
    fontSize: "clamp(36px, 11vw, 60px)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Antonio, 'Arial Narrow', sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
  body:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "'Inter Variable', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    fontFeature: "tnum"
rounded:
  spine: "2px"
  field: "10px"
  button: "12px"
  sheet: "16px"
  chip: "18px"
spacing:
  gutter: "16px"
  sheet: "20px"
  field-gap: "18px"
components:
  button-primary:
    backgroundColor: "{colors.bone-white}"
    textColor: "{colors.void}"
    rounded: "{rounded.button}"
    height: "44px"
    padding: "0 18px"
  button-secondary:
    backgroundColor: "{colors.slate}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.button}"
    height: "44px"
  input:
    backgroundColor: "{colors.slate}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.field}"
    height: "46px"
  chip:
    backgroundColor: "{colors.void}"
    textColor: "{colors.bone-white}"
    rounded: "{rounded.chip}"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.bone-white}"
    textColor: "{colors.void}"
  score-selected:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.void}"
---

# Design System: Caseshelf

## Overview

**Creative North Star: "The Lamplit Case"**

One case at a time, held under a single lamp in a dark room. The interface is the dark room: near-black grounds, white line glyphs, thin type. The colour belongs to the objects. The case's own plastic and cover, and a soft lamp tinted from that cover, are the only saturation on screen. Each case owns the whole viewport. Everything else sits at the edges: tabs at the top, a glyph rail on the right, the caption low left over a bottom scrim, nothing in the middle.

Density is low on the Shelf and high in Stacks, where every case stands as a spine at true thickness. Motion is physical. Cases spring, hinge, and spin. Chrome barely moves.

**Key Characteristics:**
- Full-bleed, one-object-per-screen feed with vertical snap.
- Real 3D cases at true relative scale on a shared floor.
- Ambient lamp recoloured per case.
- Tall condensed display caps over a neutral workhorse sans.
- Tabular figures for every catalog number, count, and score.

## Colors

A dark neutral ramp plus case-plastic colours. Bone white and sand are the only interface accents.

### Primary
- **Bone White** (bone-white): primary buttons, the capture button, selected chips, active tab labels, rail glyphs. Never pure #fff on large fields.

### Secondary
- **Lamp Sand** (sand): score, focus ring, selection highlight, active tab underline, "Edit details" link. Warm, quiet, used in small amounts.

### Neutral
- **Void** (void): page ground, tab bar.
- **Ink** (ink): sheets, the top of the lamp gradient, the Stacks index strip.
- **Slate** (slate): inputs, segmented controls, secondary buttons, dividers.
- **Mist** (mist): borders, selected segment, shelf board.
- **Secondary Text** (text-secondary): metadata, hints, field labels. Passes 4.5:1 on void and ink.
- **Alert** (alert): error text and the destructive text button.

### Case plastics
- **Plastic colours** (plastic-*): one per format. They colour 3D case edges, spine bands, format chips, and wishlist swatches. Generic plastic hues; no console-maker marks.

### Named Rules
**The Object Owns the Colour Rule.** Saturated colour comes only from a case: its photo, its plastic, or the lamp derived from its cover. Interface surfaces stay neutral.

**The Lamp Rule.** The ground behind the Shelf is a radial lamp mixed from the active case's cover tint (lightened 16%, 74% strength) over ink-to-void. It recolours between cases; it never animates on its own.

## Typography

**Display Font:** Antonio (with Arial Narrow)
**Body Font:** Inter Variable (with system-ui)

**Character:** Antonio is the poster voice: compressed, all caps, tall. It is only for case titles and screen names. Inter carries everything you read or tap.

### Hierarchy
- **Display** (700, clamp 36–60px, 0.95, uppercase): the active case's title on the Shelf.
- **Headline** (700, 32–34px, 1, uppercase): screen names (Stacks, Wishlist), sheet titles, pulled-spine title.
- **Body** (400–600, 15px, 1.45): status lines, reviews (max 46ch), form text. Inputs use 16px so phones don't zoom.
- **Label** (600, 13px, tabular figures): catalog numbers, formats, field labels, counts.
- **Micro** (600, 11px): rail and tab bar labels only.

### Named Rules
**The Two Sizes Rule.** A list or caption uses two body sizes at most (13 and 15px). Rank comes from weight and colour.

**The Tabular Rule.** Every number the collector compares (No. 0012, 8/10, 41 h, 3 / 8) is set in tabular figures.

**The No-Eyebrow Rule.** Metadata goes under the title it describes, never above it.

## Layout

Phone-first. The Shelf is a full-viewport vertical snap feed (one slide = 100dvh, snap-stop always). The stage takes the top 70dvh (74dvh at 768px+). The caption anchors 14px above the tab bar with 18px left inset. The rail sits 10px from the right edge. The tab bar is 64px plus the safe-area inset, four columns, max content width 520px.

Stacks and Wishlist use a 16px gutter. On 768px+ their content centres at 720px max. Sheets cap at 560px wide and 92dvh tall.

Stacks scale: 1mm = clamp(1.25px, (100dvh − 430px) / 190, 2.3px). Spines are drawn at their real case depth × height in that unit, bottom-aligned on a 10px mist board.

## Elevation & Depth

Depth lives in the objects. The interface is flat, layered by tone (void, ink, slate, mist). Real shadow appears only under cases: the 3D contact shadow, and the static cover preview (`box-shadow: 18px 26px 40px -12px rgb(0 0 0 / 0.7)`). Sheets separate from the page with a 62% black overlay and a 1px mist border, not a shadow.

### Named Rules
**The Flat Chrome Rule.** No shadows on buttons, chips, cards, or bars. If something needs to lift, it is a case.

## Shapes

Small, physical radii. Spines and covers 2–3px, like moulded plastic. Fields 10px, buttons 12px, sheet top corners 16px. Pills only for chips and the sample-shelf notice. Rail controls and the capture button are full circles.

## Components

### Buttons
- **Shape:** gently rounded (12px), 44px min height, 50px when full-width in a sheet footer.
- **Primary:** bone white on void text. One per view: "Put it on the shelf", "Save", "Open case".
- **Secondary:** slate fill, bone text. Hover (fine pointers only) to mist.
- **Destructive:** text-only alert colour first, then an inline two-button confirm with a #b3261e fill. No dialogs.
- **Press:** scale 0.97 over 120ms with ease-out (`cubic-bezier(0.23, 1, 0.32, 1)`).

### Rail
- 48px glyph discs at 10% white, white 1.75-stroke icons, 11px labels. A pressed state flips to bone fill with a void icon. The score disc is always sand with the number in Antonio.

### Chips
- **Style:** 36px pill, 1px mist border, 14px text, optional plastic swatch (10×14px, 2px radius).
- **State:** selected is solid bone white with void text.

### Segmented control
- Slate track, 3px inset, selected segment mist with bone text, unselected text-secondary.

### Inputs / Fields
- **Style:** slate fill, 1px mist border, 10px radius, 46px tall, 16px text.
- **Focus:** border shifts to sand.
- **Error:** message in alert colour under the form, naming the problem and the fix.

### Navigation
- **Tab bar:** void at 94%, 1px slate top rule, outline icons with 11px labels. Inactive #8a929e, active bone white. The centre capture button is a 52px bone-white circle.
- **Kind tabs (Shelf):** 17px semibold, inactive at 55% opacity, active with a 2px sand underline.

### 3D Case (signature)
- Built from the owner's photos at true format size (PS5 135×170×14 mm, DVD 135×190×14, Blu-ray 128×148×12, Switch 105×170×11). Clearcoat plastic, cover under a glossy sleeve, a generated spine with title and catalog number.
- Drag sideways to turn: 1:1 while held, then a velocity-seeded spring (k 140, c 19) that always rests on the front or the back.
- The lid hinges at the spine (spring k 90, c 17). The disc rises and spins with an iridescent data side; a Switch case ejects a cartridge instead.
- Every gesture has a rail button. Reduced motion stiffens all springs and removes spin.

### Spine (Stacks)
- Plastic band on the top 13%, cover tint darkened 42% below, vertical Antonio title. Selected spines pull up 22px and brighten (220ms ease-out); under reduced motion they show a sand outline instead.

## Do's and Don'ts

### Do:
- **Do** keep the centre of the Shelf empty of chrome; it belongs to the case.
- **Do** draw every case and spine at its real millimetre proportions.
- **Do** label generated covers and sample data as samples.
- **Do** gate hover effects behind `(hover: hover) and (pointer: fine)`.
- **Do** use bottom sheets (Vaul) for capture and editing; dismiss by drag, scrim tap, or Escape.

### Don't:
- **Don't** put saturated colour on interface surfaces; colour comes from cases.
- **Don't** ship real cover art or console-maker logos.
- **Don't** place a kicker or eyebrow above a heading.
- **Don't** add shadows to flat chrome.
- **Don't** animate keyboard-driven or high-frequency actions (tab switches, segment changes); colour transitions at 160ms are the ceiling.
