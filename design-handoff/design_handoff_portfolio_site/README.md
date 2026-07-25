# Handoff: Bisina Keshara — personal site (DevOps technical lead)

## Overview

A three-page personal site for a DevOps technical lead, doubling as an expanded
GitHub profile. Dark, instrument-panel aesthetic borrowed from the owner's own
monitoring tool: monospace data, a `GET /status → 200 OK` panel, and
route-style section labels (`/checks`, `/about`).

Pages:

1. **`/index`** — hero + live-status panel + pinned repositories
2. **`/checks`** — full list of public repositories
3. **`/about`** — profile identity, prose bio, trajectory, stack, contribution board, and an 8-bit space scene as the GitHub README header

## About the design files

The files in this bundle are **design references created in HTML** — prototypes
that show intended look and behavior. They are **not production code to copy
directly**.

They are authored in a proprietary component format (`.dc.html`: a template plus
a small logic class, styles inline). Treat them as you would a Figma file:
read the markup for exact values and structure, then **recreate the design in the
target codebase's own environment** — React, Vue, Svelte, Astro, plain HTML +
CSS — using its established patterns, component library, and styling approach.

If there is no existing codebase, this site is a good fit for a static setup:
Astro or Next.js with static export, Tailwind or plain CSS custom properties,
deployed to any static host. Nothing here needs a server or a database.

## Fidelity

**High fidelity.** Colors, typography, spacing, and interaction states are final.
Recreate the UI faithfully.

Two caveats:

- **Copy is placeholder in the owner's voice.** The hero headline, bio prose,
  trajectory entries, and status-panel metrics are written to fit but are not
  verified facts. Confirm with the owner before shipping.
- **The contribution board is synthetic.** It is generated from a seeded
  pseudo-random function purely to show the visual. In production it must be fed
  by the real GitHub contributions data (see *Data* below).

---

## Design tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#0A0E14` | Page background |
| `surface` | `#10151E` | Cards, panels, table strips |
| `surface-alt` | `#161D28` | Empty contribution cell |
| `border` | `rgba(255,255,255,.07)` | All standard borders and dividers |
| `border-subtle` | `rgba(255,255,255,.05)` | Inner rows inside a panel |
| `border-hover` | `rgba(255,255,255,.16)` | Secondary button hover |
| `text` | `#E6EAF0` | Primary text |
| `muted` | `#7D8799` | Body copy, labels, metadata |
| `accent` | `#38BDF8` | Cyan. Links, route labels, repo names. Used sparingly |
| `accent-hover` | `#7DD3FC` | Link hover |
| `accent-wash` | `rgba(56,189,248,.08)` | Primary button hover fill |
| `accent-border` | `rgba(56,189,248,.35)` | Primary button border |
| `accent-border-hover` | `rgba(56,189,248,.6)` | Primary button border, hover |
| `accent-card-hover` | `rgba(56,189,248,.32)` | Card border on hover |
| `signal` | `#4ADE80` | Green. Status OK, availability, contribution peak |
| `row-hover` | `rgba(255,255,255,.018)` | List-row hover fill |
| `selection` | `rgba(56,189,248,.25)` | `::selection` background |

Contribution heat ramp (5 levels, low → high):
`#161D28`, `rgba(74,222,128,.22)`, `rgba(74,222,128,.45)`, `rgba(74,222,128,.72)`, `#4ADE80`

Rule: **accent and signal are accents, not surfaces.** No gradients as
decoration, no neon glow, no colored backgrounds beyond the two greys.

### Typography

Two families, loaded from Google Fonts:

```
Space Grotesk — 400, 500, 600, 700   → display and body
JetBrains Mono — 400, 500, 600       → all data, labels, metadata, nav
```

The split is strict: anything that reads as *output* (numbers, routes,
timestamps, tags, repo names, uppercase labels, nav items, footer) is mono.
Prose and headings are Space Grotesk.

| Role | Size | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| H1 hero | `clamp(38px, 5.6vw, 62px)` | 600 | `-.035em` | 1.04 |
| H1 page | `clamp(34px, 5vw, 54px)` | 600 | `-.035em` | 1.06 |
| H2 section | `clamp(26px, 3vw, 34px)` | 600 | `-.025em` | default |
| H2 sub-section | `clamp(24px, 2.8vw, 30px)` | 600 | `-.025em` | default |
| Lead paragraph | `clamp(16px, 1.6vw, 18px)` | 400 | — | 1.65 |
| Bio opener | 17.5px | 400 | — | 1.72 |
| Body prose | 16.5px | 400 | — | 1.72 |
| Card body | 14.5–15px | 400 | — | 1.58–1.6 |
| Name / label large | 26px | 600 | `-.025em` | default |
| List item title | 15.5px | 500 | — | default |
| Mono nav / link | 12px | 400 | `.02em` | default |
| Mono data row | 12.5px | 400 | — | default |
| Mono meta | 11–11.5px | 400 | `.04em` | default |
| Mono uppercase label | 10.5–11px | 400 | `.12–.18em`, uppercase | default |
| Eyebrow (hero) | 11px | 400 | `.18em`, uppercase | default |

Long-form text uses `text-wrap: pretty`; headlines use `text-wrap: balance`.
Prose is capped at `48ch`–`68ch` depending on context (noted per component).

### Spacing, radius, misc

- Content max-widths: **1120px** (home, about), **900px** (checks). Gutter `24px`.
- Vertical section rhythm: `clamp(40px, 6vw, 72px)` between sections;
  `clamp(48px, 7vw, 88px)` for the first section on a page;
  `clamp(56px, 9vw, 112px)` for the home hero.
- Radii: `12px` cards and panels, `10px` inner/small cards, `8px` buttons,
  `6px` nav items and tags, `2px` contribution cells, `999px` pills.
- Sticky header: `68px` min-height, `rgba(10,14,20,.82)` +
  `backdrop-filter: blur(14px)`, 1px bottom border.
- Only shadows in the design are two insets on the status dot and the planet;
  there is no card elevation. Depth comes from borders.

---

## Atmosphere layer

A single `position: fixed; inset: 0; pointer-events: none` layer behind all
content (`z-index: 0`; content sits at `z-index: 1`). Three parts, in order:

1. **72px grid** — two `linear-gradient` 1px lines at `rgba(255,255,255,.028)`,
   `background-size: 72px 72px`.
2. **One offset radial glow** — 1100 × 1100px circle at `top: -18%; left: 58%`:
   `radial-gradient(circle, rgba(56,189,248,.10) 0%, rgba(56,189,248,.035) 38%, rgba(10,14,20,0) 70%)`.
3. **Ten static stars** — 1–2px circles at fixed percentage positions,
   `rgba(230,234,240,.22–.5)`.

No particles, no animation, no parallax, no floating elements. This is a
deliberate constraint — do not add motion here.

The layer is toggleable via an `atmosphere` boolean (default on).

---

## Screens

### 1. `/index` — home

**Purpose:** state what the owner does, prove the system is healthy, show the
best repositories.

**Layout:** single column, max-width 1120px, 24px gutter. Two sections separated
by a 1px top border.

#### Hero section

`display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: clamp(32px, 5vw, 64px); align-items: center`.
Padding `clamp(56px, 9vw, 112px) 0 clamp(48px, 7vw, 88px)`.

**Left column:**

- Eyebrow, mono 11px, `.18em`, uppercase, muted, 22px bottom margin:
  `Platform & reliability`
- H1, hero scale, 24px bottom margin:
  `I keep delivery systems boring, observable and fast.`
- Lead paragraph, muted, `max-width: 48ch`, 32px bottom margin:
  `DevOps technical lead in Colombo. I build the pipelines, infrastructure and on-call practice behind products that can't afford a bad Tuesday.`
- Button row: `display: flex; flex-wrap: wrap; gap: 12px`
  - **Primary** — `view /checks →`. Mono 12.5px, padding `12px 20px`,
    radius 8px, 1px border `accent-border`, text `accent`, transparent fill.
    Hover: fill `accent-wash`, border `accent-border-hover`. Navigates to `/checks`.
  - **Secondary** — `about me`. Same metrics, border `border`, text `muted`.
    Hover: text `text`, border `border-hover`. Navigates to `/about`.

**Right column — the status panel (signature element, must be preserved):**

Card: `surface` fill, 1px `border`, radius 12px, `overflow: hidden`, entirely
JetBrains Mono.

- Header row: `display: flex; justify-content: space-between; align-items: center; gap: 16px`,
  padding `14px 18px`, 1px bottom border.
  - Left: `GET` in `muted` + ` /status` in `text`, 12.5px, `.02em`.
  - Right: 6px `signal` dot with `box-shadow: 0 0 0 3px rgba(74,222,128,.14)`,
    8px gap, then `200 OK` in `signal`, 12px, `.04em`.
- Body: padding `6px 18px 16px`. Five rows, each
  `display: flex; justify-content: space-between; gap: 16px; padding: 11px 0`,
  1px bottom `border-subtle` (last row none), 12.5px. Key in `muted`, value in
  `text` (last value in `signal`):

  | key | value |
  | --- | --- |
  | `uptime_90d` | `99.982%` |
  | `p95_latency` | `128ms` |
  | `deploys_wk` | `41` |
  | `mttr` | `11m 04s` |
  | `on_call` | `available` *(signal green)* |

#### Pinned repositories section

Header block: `display: flex; align-items: baseline; justify-content: space-between; gap: 24px; flex-wrap: wrap`, 32px bottom margin.

- Left: route label `/checks` (mono 12px, `accent`, `.06em`, 10px bottom margin),
  then H2 `Selected work`.
- Right: mono 12px `accent` link `all 15 public repositories →` → `/checks`.

Grid: `repeat(auto-fit, minmax(280px, 1fr))`, `gap: 18px`.

**Repo card** — an `<a>` to the GitHub URL, `target="_blank" rel="noopener"`.
`surface` fill, 1px `border`, radius 12px, padding 24px,
`display: flex; flex-direction: column; gap: 12px`.
Hover: border → `accent-card-hover`.

- Top row: `space-between`, `gap: 12px`
  - Repo name — mono 13.5px, `accent`, `word-break: break-word`
  - Visibility pill — mono 10.5px, `muted`, 1px `border`, radius 999px,
    padding `3px 9px`, `flex-shrink: 0`
- Description — 14.5px, `muted`, line-height 1.58, `text-wrap: pretty`
- Footer, pushed down with `margin-top: auto; padding-top: 8px` —
  `display: flex; align-items: center; gap: 16px`, mono 11.5px, `muted`:
  8px language dot + language name, then star count (omitted when zero)

### 2. `/checks` — public repositories

**Purpose:** the full repository index; the hub the home page's "all repositories"
link points at.

Max-width **900px**.

- Intro section, padding `clamp(48px, 7vw, 88px) 0 36px`: route label `/checks`,
  H1 `Public repositories`, lead paragraph capped at `56ch`:
  `Infrastructure tooling, migration helpers and small utilities. Everything here is public on GitHub.`
- **Count strip** — `surface` card, 1px `border`, radius 10px, padding `16px 20px`,
  `display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap`,
  mono 12px `muted`, 8px bottom margin.
  Left: `15 public repositories · 263 stars given` (numbers in `text`).
  Right: `accent` link `browse all on github →` →
  `https://github.com/dragonfoxsl?tab=repositories`.
- **Repository rows** — column, `padding-bottom: 44px`. Each row is an `<a>`:
  `display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px 28px; align-items: baseline; padding: 24px 0`,
  1px top `border`. Hover: background `row-hover`.
  - Column 1: repo name (mono 14px, `accent`) stacked over language dot +
    language + stars (mono 11.5px, `muted`), `gap: 10px`
  - Columns 2–3 (`grid-column: span 2`): description, 15px, `muted`,
    line-height 1.6

### 3. `/about` — profile

**Purpose:** who the owner is, the trajectory, activity, and the GitHub README
header art. This page merges what were previously separate "profile" and "about"
pages.

Max-width 1120px. Four sections.

#### Identity + prose (two columns)

`display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(28px, 4vw, 48px); align-items: start`,
padding `clamp(44px, 6vw, 76px) 0 40px`.

**Left rail** (`max-width: 340px`, column, `gap: 18px`):

- Avatar — `aspect-ratio: 1`, `object-fit: cover`, 1px `border`, radius 12px,
  `surface` fallback background. Source:
  `https://avatars.githubusercontent.com/u/909787?v=4`
- Name `Bisina Keshara` (26px / 600 / `-.025em`) over mono 13px `muted`
  `@dragonfoxsl · devops technical lead`
- Meta column, mono 12px, `gap: 9px`: `Colombo, Sri Lanka`,
  link `medium.com/@bisinet`, link `github.com/dragonfoxsl`,
  `4 followers · 5 following` (numbers in `text`)
- Stats strip — 3-column grid with `gap: 1px` on a `border`-colored background
  (the 1px gaps become the dividers), 1px outer border, radius 10px,
  `overflow: hidden`. Each cell: `surface`, padding `14px 12px`, mono 18px value
  in `text` over mono 10px uppercase `.1em` `muted` label.
  Cells: `15 / repos`, `263 / stars`, `9y / shipping`
- Availability pill — `align-self: flex-start`, mono 11.5px, padding `8px 14px`,
  1px `rgba(74,222,128,.32)` border, radius 999px, text `signal`:
  `mentoring · open`

**Right column** (column, `gap: 26px`):

- Route label `/about` (mono 12px, `accent`, `.06em`)
- Opening line, 17.5px, `text` (not muted — it carries the page):
  `I lead a platform team. Most of what I do is remove reasons for people to page each other at 3am.`
- Three body paragraphs, 16.5px, `muted`, line-height 1.72 (see the HTML for
  exact copy)
- **Trajectory** block — 1px top `border`, `padding-top: 26px`, mono uppercase
  `.14em` label `Trajectory`, 18px bottom margin. Rows:
  `display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 4px 24px; padding: 14px 0`,
  1px bottom `border-subtle` (last none). Left: mono 11.5px `muted` date range.
  Right: 15.5px / 500 role.
  - `2023 — now` / DevOps technical lead
  - `2020 — 2023` / Senior platform engineer
  - `2017 — 2020` / Infrastructure engineer
- **Day to day** block — same header treatment, label `Day to day`, 16px bottom
  margin. Tag row: `display: flex; flex-wrap: wrap; gap: 8px`; each tag mono
  11.5px, padding `6px 11px`, 1px `border`, radius 6px, `muted`:
  Terraform, OpenTofu, AWS, Kubernetes, Python, Go, PowerShell

#### Contribution board

1px top `border`, padding `clamp(36px, 5vw, 60px) 0`.

Header: route label `/contributions` + H2 `Contribution board` on the left;
mono 11.5px `muted` `jul 2025 — jul 2026 · sample data` on the right,
`align-items: baseline; justify-content: space-between; flex-wrap: wrap`.

Board: `surface` card, 1px `border`, radius 12px, padding 20px,
`overflow-x: auto`. Inside, `display: flex; gap: 3px; min-width: 620px` — 53
week columns, each a `flex-direction: column; gap: 3px` stack of 7 cells.
Cell: 9 × 9px, radius 2px, background from the 5-level heat ramp.

Legend below, `margin-top: 16px`, `display: flex; align-items: center; gap: 8px`,
mono 10.5px `muted`: `less` + five 9px swatches ascending + `more`.

*Replace the synthetic data — see Data below.*

#### README header art

1px top `border`, padding `clamp(36px, 5vw, 60px) 0 24px`. Mono uppercase
`.14em` `muted` label `dragonfoxsl/dragonfoxsl · README.md`, 16px bottom margin,
then the space scene inside a 1px `border`, radius 12px, `overflow: hidden`
frame.

**The space scene** is a separate design file (`Space Scene.dc.html`) — a pure
CSS 8-bit tableau: starfield, a planet whose limb crosses the lower third, and a
spaceship. **No canvas, no JavaScript, no animation** — this was an explicit
requirement, since it is destined for a GitHub profile README where scripts do
not run.

For the real README, this must ship as a **static SVG or PNG** committed to the
`dragonfoxsl/dragonfoxsl` repo and referenced with a plain `<img>`. GitHub
strips inline styles and scripts from rendered markdown, so the CSS version
cannot be embedded there. Suggested: render the scene at 1280 × 520 and export
at 2× for retina.

---

## Header and footer

**Header** (all pages) — sticky, `top: 0`, `z-index: 20`, `rgba(10,14,20,.82)`,
`backdrop-filter: blur(14px)`, 1px bottom `border`. Inner: max-width 1120px,
padding `12px 24px`, `min-height: 68px`,
`display: flex; align-items: center; justify-content: space-between; gap: 12px 24px; flex-wrap: wrap`.

- Left (clickable → home): `Bisina Keshara` (16px / 600 / `-.01em`) beside mono
  11px `muted` `devops / lead`, `align-items: baseline; gap: 10px`
- Right nav: `display: flex; gap: 4px; flex-wrap: wrap`, mono 12px. Items
  `/index`, `/checks`, `/about` — padding `7px 12px`, radius 6px, `muted`.
  Hover: text `text`, background `rgba(255,255,255,.04)`.

There is no active-route styling in the current design. Adding a subtle one
(text `text`, or a 1px accent underline) is a reasonable improvement — confirm
with the owner.

**Footer** (all pages) — 1px top `border`, `margin-top: 40px`. Inner: max-width
1120px, padding `32px 24px 44px`,
`display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap`,
mono 11.5px `muted`.
Left: `© 2026 Bisina Keshara · built and hosted by hand`.
Right: `gap: 18px` links `github`, `medium` — `muted`, hover `accent`.

---

## Interactions & behavior

Deliberately minimal. The design has no animation beyond CSS color transitions.

| Trigger | Behavior |
| --- | --- |
| Header logo / `/index` | Navigate home, scroll to top |
| `/checks`, `/about` nav | Navigate, scroll to top |
| `view /checks →` | Navigate to `/checks` |
| `about me` | Navigate to `/about` |
| `all 15 public repositories →` | Navigate to `/checks` |
| Repo card / repo row | Open GitHub URL in a new tab (`rel="noopener"`) |
| `browse all on github →` | Open the repositories tab in a new tab |
| Card hover | Border → `accent-card-hover` |
| List-row hover | Background → `row-hover` |
| Nav hover | Text → `text`, background `rgba(255,255,255,.04)` |
| Button hover | Per-button, see Hero section |
| Link hover | `accent` → `accent-hover` |

**Navigation model.** The prototype is a single component switching on a `page`
value (`home` / `checks` / `about`), resetting scroll to top on change. In
production these should be **real routes** — `/`, `/checks`, `/about` — with
their own URLs, titles, and meta. Do not ship a client-side page switch with no
URL; it breaks sharing, back-button, and SEO.

**Responsive.** There are **no media queries.** Every layout is fluid:
`repeat(auto-fit, minmax(<floor>, 1fr))` grids that collapse to one column on
their own, `clamp()` type and spacing, `flex-wrap` on every row. Preserve this
approach rather than converting to breakpoints. Two things to verify on small
screens: the header wraps to two lines (hence `min-height` rather than fixed
`height`), and the contribution board scrolls horizontally inside its card
(`min-width: 620px` + `overflow-x: auto`) rather than squashing.

**Accessibility to fix during implementation.** The prototype uses `<span>` with
click handlers for navigation. In production, every navigation target must be a
real `<a href>` or `<button>` — keyboard focusable, with a visible focus ring
(the design has `style-focus` support but no focus styles are defined; use a 2px
`accent` outline with 2px offset). Also add `aria-label`s to the contribution
cells or, better, describe the board in a caption and mark the cells
`aria-hidden`.

---

## State

Almost none. The prototype holds:

- `page` — `'home' | 'checks' | 'about'`. Becomes routing in production.
- `atmosphere` — boolean, default `true`. Toggles the fixed background layer. Keep
  it as a prop/flag if useful; it is also the natural hook for
  `prefers-reduced-motion` or a low-power mode, though nothing currently moves.

No forms, no fetching in the prototype. See Data.

## Data

Two sources should be live rather than hardcoded:

1. **Repositories.** The prototype hardcodes six. Fetch from
   `GET https://api.github.com/users/dragonfoxsl/repos?sort=updated&per_page=100`
   at build time (not on the client — the unauthenticated rate limit is 60/hr per
   IP). Fields used: `name`, `description`, `html_url`, `language`,
   `stargazers_count`, `private`. Language dot colors can come from GitHub's
   `linguist` color set; the prototype's ad-hoc mapping is:
   HCL `#7D8799`, Python `#4ADE80`, Go `#38BDF8`, PowerShell `#E6EAF0`.
   Note one entry is a **gist**, not a repo (`hash-compare`) — its pill reads
   `gist`. Keep that distinction if you keep the entry.
   **Nine repositories are missing** from the prototype; the owner needs to
   supply them, or the build-time fetch will pick them up automatically.
2. **Contributions.** Currently synthetic (seeded LCG, weekends damped). Real
   data requires the GitHub **GraphQL** API — `user.contributionsCollection.contributionCalendar`
   — which needs a token, so fetch at build time and cache. Map each day's
   `contributionCount` onto the 5-level ramp with quantile thresholds rather than
   fixed counts, so the board stays legible at any activity level. Remove the
   `· sample data` note in the header once it is real.

Counts shown in the UI that must be recomputed from real data: `15` public
repositories, `263` stars, `4` followers, `5` following, `9y` shipping.

## Assets

| Asset | Source | Notes |
| --- | --- | --- |
| Avatar | `https://avatars.githubusercontent.com/u/909787?v=4` | Hotlinked in the prototype. Download and self-host, or proxy — GitHub avatar URLs are not a stable CDN contract |
| Space Grotesk, JetBrains Mono | Google Fonts | Self-host (`fontsource` or similar) for performance and privacy |
| Space scene | `Space Scene.dc.html` in this bundle | Pure CSS. Export as static SVG/PNG for the GitHub README |

There are **no icons** in this design — status is communicated with colored dots,
navigation with text arrows (`→`, `←`). Do not introduce an icon set; the
restraint is part of the look.

## Files in this bundle

- `Bisina Portfolio.dc.html` — the three-page site (template + logic class)
- `Space Scene.dc.html` — the 8-bit space scene used as the README header
- `README.md` — this document

Both `.dc.html` files open directly in a browser if you want to see them running.
