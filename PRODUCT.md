# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript, react-three-fiber (three.js) for 3D cases, Motion for UI animation, IndexedDB for storage. Runs locally only via `npm run dev`; not deployed. Dev server exposed on the home LAN so a phone can open it.

## Users

One physical-media collector (the owner), using the app on their phone first and on a desktop browser second. Job: record the game and movie cases they own, see their collection as real objects, and keep track of what they want next.

## Product Purpose

Turn photos of a person's own game and movie cases into 3D cases they can handle on screen: rotate, flip to the back, open, and pull the disc out. Success: the collection feels like a shelf of real objects, not a spreadsheet, and adding a case takes under a minute.

## Positioning

Each case is built from the owner's photos of their specific copy, so wear, stickers, and regional variants show. Cases take the plastic color and shape of their platform or format.

## Operating Context

- Capture: phone camera via the browser's file input (`capture="environment"`), or an existing photo. Front cover, back cover, and optional inside art.
- Browse: Games and Movies tabs; a Stacks view with every case as a spine on one alphabetical shelf, letter index, and shuffle.
- Track: score out of 10, written review, hours played or finished/watched status, catalog number assigned in order of adding.
- Wishlist: titles wanted but not owned; checking one off moves it into the collection with title and platform filled.

## Capabilities and Constraints

- Local-first, single user, no accounts, no server, no community Gallery in this version.
- Data lives in the browser's IndexedDB on each device; phone and desktop do not sync.
- Phone camera access over plain-HTTP LAN uses the file input, not `getUserMedia` (which needs HTTPS).
- First launch shows a seeded demo shelf of about 12 fictional titles with generated plain covers; one action clears it.
- Undecided: automatic title/platform recognition from photos (manual entry for now); perspective flattening of photos (crop for now).

## Brand Commitments

- Name: Caseshelf. Inspired by the iOS app "Disc Collection" by Akshat Saladi; must not reuse its name, branding, or assets.
- No real cover art ships with the app. Only the user's own photos or generated placeholder covers.
- Platform colors are generic case-plastic colors; no console maker logos or trademarks.

## Evidence on Hand

None. No photos, logos, or real titles exist in the project. Demo titles are fictional and must stay so.

## Product Principles

1. The case is the interface: the 3D object is the primary way to see and touch an item.
2. Physical truth: sizes, spine proportions, and plastic colors follow real case formats.
3. Fast capture beats complete data: a case can be saved with a front photo and a title.
4. Quiet shelf, loud object: chrome stays restrained so the cases carry the color.

## Accessibility & Inclusion

Every 3D interaction has a button equivalent (flip, open, eject disc). Respect `prefers-reduced-motion`.
