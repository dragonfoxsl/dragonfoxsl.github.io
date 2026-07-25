# Product

## Register

brand

## Users

Recruiters, hiring managers, collaborators, and peer engineers who land on
the site from a GitHub profile, résumé, LinkedIn, or a Medium byline. They're
scanning quickly to answer "is this person credible and worth a closer look,"
then may dig into specific repos or the About page for depth. Desktop and
mobile both matter; there's no logged-in state or workflow, just reading and
outbound links (repos, Medium).

## Product Purpose

A personal site for Bisina Keshara, a DevOps technical lead, that doubles as
an expanded GitHub profile: state what he does, prove the underlying
systems-reliability instinct through the site's own presentation (a
monitoring-tool aesthetic literally borrowed from his day job), and surface
the best public repositories and real GitHub activity. Success is a visitor
coming away with an accurate, credible impression of technical seniority
without reading a wall of prose.

## Brand Personality

Technical, precise, understated. Voice is dry and factual, not
promotional — copy reads like status output or a terse changelog, not
marketing copy. The design should feel like an instrument panel someone
who builds observability tooling would actually use: monospace data,
route-style labels (`/checks`, `/about`), a live-looking status panel,
restraint over decoration.

## Anti-references

Generic gradient-hero SaaS/startup templates (hero-metric cards, drenched
gradient blobs, glassmorphism, bouncy micro-animations). No icon set as
decoration — status is communicated with colored dots and text arrows, not
iconography. No "AI-made portfolio" tells: identical card grids, side-stripe
accent borders, gradient text.

## Design Principles

- **Borrow the owner's own tools.** The instrument-panel look (status panel,
  route labels, monospace data) is not a theme choice, it's literal: this is
  what the person who built it looks at all day. Departures from that
  vocabulary should be justified, not decorative.
- **Restraint signals seniority.** No gradients as decoration, no neon glow,
  no colored backgrounds beyond two greys. Depth comes from borders, not
  shadows or elevation.
- **Real data over decoration.** Repo cards, contribution board, and status
  panel are populated live at build time — the design has to hold up with
  real, occasionally uneven data (zero-star repos, sparse contribution
  weeks), not just polished placeholder content.
- **Fluid over responsive-as-breakpoints.** Every layout uses
  `clamp()`/`auto-fit`/`flex-wrap`, deliberately, not media-query
  breakpoints — this is a constraint to preserve, not an oversight to fix.
- **Show, don't tell.** No self-congratulatory copy about the design itself;
  the site proves competence through its own craft and through real
  GitHub/repo data, not through claims.

## Accessibility & Inclusion

WCAG AA baseline. Every navigation target is a real `<a href>` (no
click-handler-only nav). Visible 2px accent focus ring with 2px offset on
all interactive elements. Decorative elements (the atmosphere background
layer, individual contribution-board cells) are `aria-hidden`; the
contribution board as a whole carries one descriptive `aria-label`/caption
instead. The space scene's CSS animation respects
`prefers-reduced-motion: reduce`.
