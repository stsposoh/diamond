# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite, matching the sibling presentation projects (`../watch-company`, `../publishing-house`). 3D: Three.js (vanilla, chosen by the user).

## Users

This is a demo project, so there are two audiences:

- **In the fiction:** private clients of a high-end atelier who want a bespoke piece (engagement ring, significant gift, personal heirloom) and want to know who cuts the stone and how. They come to be convinced of the craft and to book a consultation.
- **In reality:** people evaluating the studio's work (prospective clients, portfolio viewers). For them the site is proof of what a WebGL/3D-driven landing page can be.

## Product Purpose

A one-page English landing site for a fictional atelier that cuts precious stones in-house and sets them into its own jewelry. Success in the fiction means the visitor books a private consultation. Success in reality means a memorable "wow" site whose complex 3D animation carries the story instead of decorating it.

## Positioning

The atelier controls the whole path from rough stone to finished piece: the same hands that cut the stone design its setting. A retailer selling certified stones, or a brand buying pre-cut diamonds, cannot honestly claim this. The narrative mechanism is the transformation: rough crystal → marking → facets emerge → polish and light → set into the piece.

## Operating Context

- Visitors arrive on desktop first; the main 3D scene is built for desktop.
- Mobile gets a working baseline (the content reads, the layout holds), not the full 3D experience.
- The conversion action is a consultation request. No e-commerce, cart, or pricing.

## Capabilities and Constraints

- Single landing page, English copy.
- Heavy real-time 3D (WebGL) is a core requirement, not an enhancement.
- Desktop-first; mobile is a simplified baseline.
- `prefers-reduced-motion`: provide a non-animated fallback (agreed only as the minimum; exact behaviour is undecided).
- Undecided: source of 3D models (procedural vs. modelled assets), whether the consultation form actually submits anywhere.

## Brand Commitments

- Name: **Hallmere** (proposed by Claude, fictional; replace if desired. Check that it doesn't clash with a real jewelry brand before publishing).
- The company, its history, people, and locations are fictional.

## Evidence on Hand

None. There is no brief, copy, logo, photography, or 3D assets. All content will be written for the demo. Do not present invented facts as real-world claims: no real certification bodies (GIA, etc.) shown as endorsements, no fake press, no named real clients or testimonials framed as genuine.

## Product Principles

1. The 3D is the story. Every major animation should advance the rough-to-finished narrative, not just spin an object.
2. Craft over catalogue. Show process and expertise before product.
3. One clear action: book a consultation.
4. Be honest that it's fiction. Invented content stays plausible but never impersonates real brands or authorities.
5. Desktop is the showpiece, and the other contexts must still not break.
