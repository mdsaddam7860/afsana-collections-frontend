# Design Rationale — "Nocturne"

## The shift
The first pass was a safe, daylight boutique: cream, blush, plum-on-white.
It read fine but blended into every other DTC hair-accessory site. This
redesign moves the whole storefront into a **dark, editorial, boutique-
at-night** register — the same brand, shown after hours, styled like a
small print magazine rather than a template.

## Color
Base is a near-black warm plum (`hsl(315 18% 7%)`) rather than pure black —
it keeps warmth without going gray. Against that, **one** accent does all
the work: molten copper (`#E0793C`). It appears only on CTAs, active
filter chips, focus states, and the cart badge — never as decoration — so
it stays legible as "this is actionable" rather than becoming wallpaper.
A secondary clay tone exists only for the mesh-gradient atmosphere and
variant swatches, kept low-opacity so it never competes with the accent.

## Type
Fraunces carries all headlines — a high-contrast serif with real
personality (its optical-size and "wonk" axes give it a slightly
handmade, un-corporate feel) — set in italic at key emotional beats
("*beautifully*", "*Hold on.*"). Archivo replaces Inter for body copy:
same readability, more character in the letterforms. Prices, SKUs, chip
labels, and buttons run in JetBrains Mono — a deliberate switch that
gives commerce moments (numbers, actions) an apothecary-label, tactile
feel distinct from the editorial voice of the headlines.

## Motion
One orchestrated moment matters more than many small ones: the hero
headline masks and slides up line-by-line, then the CTA and copy stagger
in behind it. Everywhere else, motion is restrained and purposeful —
product images do a slow 600ms zoom on hover (not a bounce), the cart
badge pulses only when an item is added, and buttons fill from the center
outward rather than just changing color. All animation respects
`prefers-reduced-motion`.

## Why this serves a hair-accessories brand
Hair accessories are small, tactile, personal objects — the kind of thing
photographed on a nightstand, not a lightbox. A dark surface with a single
warm accent makes product photography (silk, gold hardware, acetate) sit
like jewelry under a spotlight rather than floating on white e-commerce
default. The serif/mono pairing signals "considered small brand," not
"Shopify starter theme" — which is the whole point of this pass.
