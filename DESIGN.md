---
name: dragonfoxsl.github.io
description: A DevOps technical lead's personal site, styled as the monitoring instrument panel he builds for a living
colors:
  bg: "#0A0E14"
  surface: "#10151E"
  surface-alt: "#161D28"
  border: "rgba(255,255,255,.07)"
  border-subtle: "rgba(255,255,255,.05)"
  border-hover: "rgba(255,255,255,.16)"
  text: "#E6EAF0"
  muted: "#7D8799"
  accent: "#38BDF8"
  accent-hover: "#7DD3FC"
  accent-wash: "rgba(56,189,248,.08)"
  accent-border: "rgba(56,189,248,.35)"
  accent-border-hover: "rgba(56,189,248,.6)"
  accent-card-hover: "rgba(56,189,248,.32)"
  signal: "#4ADE80"
  row-hover: "rgba(255,255,255,.018)"
  selection: "rgba(56,189,248,.25)"
typography:
  display:
    fontFamily: "Space Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.6vw, 62px)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Space Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(34px, 5vw, 54px)"
    fontWeight: 600
    lineHeight: 1.06
    letterSpacing: "-.035em"
  title:
    fontFamily: "Space Grotesk Variable, system-ui, sans-serif"
    fontSize: "clamp(26px, 3vw, 34px)"
    fontWeight: 600
    letterSpacing: "-.025em"
  body:
    fontFamily: "Space Grotesk Variable, system-ui, sans-serif"
    fontSize: "16.5px"
    fontWeight: 400
    lineHeight: 1.72
  label:
    fontFamily: "JetBrains Mono Variable, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: ".12em"
rounded:
  sm: "2px"
  md: "6px"
  lg: "8px"
  xl: "10px"
  "2xl": "12px"
  full: "999px"
spacing:
  gutter: "24px"
  section: "clamp(40px, 6vw, 72px)"
  section-first: "clamp(48px, 7vw, 88px)"
  hero: "clamp(56px, 9vw, 112px)"
components:
  button-primary:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-wash}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: "12px 20px"
  button-secondary-hover:
    textColor: "{colors.text}"
  card-repo:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
    padding: "24px"
  card-repo-hover:
    backgroundColor: "{colors.surface}"
  status-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.2xl}"
  nav-item:
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "7px 12px"
  nav-item-active:
    textColor: "{colors.text}"
  pill:
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
    padding: "3px 9px"
---

# Design System: dragonfoxsl.github.io

## 1. Overview

**Creative North Star: "The Instrument Panel"**

This is not a portfolio wearing a dark theme for effect. It is the literal
monitoring-tool aesthetic its owner, a DevOps technical lead, builds for a
living, pointed at himself: a `GET /status → 200 OK` panel, route-style
section labels (`/checks`, `/about`), monospace data rows, a contribution
board rendered like a health graph. The site proves seniority by looking
like something a senior engineer would actually leave open on a second
monitor, not by claiming it in prose.

The system explicitly rejects the generic SaaS landing-page vocabulary:
no gradient-hero blocks, no glassmorphism, no bouncy micro-interactions,
no icon set standing in for content. Status is communicated with colored
dots and text arrows (`→`, `←`). Depth comes from borders and tonal
surfaces, never from shadows or elevation. Two functional colors carry the
entire system: Signal Cyan for information, Status Green for health. Every
other value is a tinted near-black neutral.

**Key Characteristics:**
- Instrument-panel dark theme borrowed literally from the owner's own tooling
- Strict content/data split: anything that reads as output is monospace,
  anything that reads as prose is the display sans
- No shadows, no elevation; depth is borders and surface-tone only
- Two functional accents (cyan, green), each used sparingly and for one job
- Fully fluid layout: `clamp()` and `auto-fit` grids, zero media-query
  breakpoints

## 2. Colors

A near-black tinted neutral scale carries the whole surface; two functional
colors do all of the signaling.

### Primary
- **Signal Cyan** (`#38BDF8`): links, route labels (`/checks`, `/about`),
  repo names, the primary button's border and text. This is the
  "information" color: it means *"this is clickable or this is data,"*
  never decoration. Hover state lightens to **Signal Cyan Bright**
  (`#7DD3FC`).

### Secondary
- **Status Green** (`#4ADE80`): the `200 OK` status dot, `on_call:
  available`, the "mentoring · open" pill, and the peak tier of the
  contribution heat ramp. This is the "health" color: it always means
  *"this is fine, this is available, this succeeded."* It never appears as
  a link or a route label; Signal Cyan owns that job.

### Neutral
- **Void** (`#0A0E14`): page background.
- **Panel** (`#10151E`): every card, panel, table strip, and the empty
  end-state of the contribution board's surface (not its cells).
- **Panel Dim** (`#161D28`): the contribution board's zero-activity cell
  color; slightly darker than Panel so the heat ramp has somewhere to
  start from.
- **Bone** (`#E6EAF0`): primary text, deliberately cool rather than pure
  white.
- **Slate** (`#7D8799`): body copy, metadata, labels, the overwhelming
  majority of visible text on any given screen.
- **Border** (`rgba(255,255,255,.07)`): every standard border and divider.
  **Border Subtle** (`rgba(255,255,255,.05)`): inner rows inside an
  already-bordered panel. **Border Hover** (`rgba(255,255,255,.16)`):
  secondary-button hover state only.

### Named Rules
**The Two-Job Rule.** Signal Cyan means "information/navigation." Status
Green means "health/availability." Neither ever borrows the other's job;
a link is never green, a status indicator is never cyan.

**The No-Surface-Accent Rule.** Signal Cyan and Status Green are text,
borders, and small fills (dots, pills, wash-on-hover) only. Neither is
ever used as a background fill larger than a status dot or a hover wash.
No gradients as decoration, no colored section backgrounds.

## 3. Typography

**Display Font:** Space Grotesk Variable (with system-ui, sans-serif fallback)
**Body Font:** Space Grotesk Variable (same family; body and display share
one typeface, differentiated by size and weight, not by a second font)
**Label/Mono Font:** JetBrains Mono Variable (with monospace fallback)

**Character:** Space Grotesk carries every human-authored sentence: prose,
headlines, names. JetBrains Mono carries every machine-authored or
data-shaped string: routes, timestamps, metrics, nav items, tags. The split
is total and literal, never a stylistic flourish; if it's output, it's mono.

### Hierarchy
- **Display** (600, `clamp(38px, 5.6vw, 62px)`, 1.04, `-.035em`): the home
  hero headline only.
- **Headline** (600, `clamp(34px, 5vw, 54px)`, 1.06, `-.035em`): page-level
  H1 on `/checks` and `/about`.
- **Title** (600, `clamp(26px, 3vw, 34px)`, `-.025em`): section H2s
  ("Selected work", "Contribution board").
- **Body** (400, 16.5px, 1.72): bio prose paragraphs, capped at 48–68ch
  depending on context.
- **Label** (400, 11px, `.12–.18em` tracking, uppercase): eyebrow labels,
  mono uppercase metadata tags. Sits alongside plain mono nav/data text at
  12–12.5px with no letter-spacing beyond `.02–.04em`.

### Named Rules
**The Output-Is-Mono Rule.** Anything that reads as a value produced by a
system, not written by a person, renders in JetBrains Mono: numbers,
routes, timestamps, tags, repo names, uppercase labels, nav items, the
footer. Everything a human wrote in full sentences renders in Space
Grotesk.

## 4. Elevation

Flat. There is no shadow vocabulary beyond two functional insets: a small
`box-shadow` ring on the status dot (`0 0 0 3px rgba(74,222,128,.14)`,
signaling an active/live state, not depth) and an inset highlight on the
space-scene planet. No card ever casts a shadow. Depth is communicated
entirely through borders and the two-step neutral scale (Void behind
Panel behind Panel Dim); nothing lifts, nothing floats.

### Named Rules
**The Border-Not-Shadow Rule.** If a surface needs to read as "in front
of" another surface, give it a 1px border and a lighter background tone.
Never reach for `box-shadow` to fake elevation.

## 5. Components

Every interactive surface is quiet and load-bearing: borders are barely
visible at rest, and the only moment of color is the hover state. Nothing
announces itself before it's touched.

### Buttons
- **Shape:** 8px radius, mono 12.5px label text, `12px 20px` padding.
- **Primary:** transparent fill, Signal Cyan text, `rgba(56,189,248,.35)`
  border. Hover: fills to `rgba(56,189,248,.08)`, border strengthens to
  `rgba(56,189,248,.6)`.
- **Secondary:** transparent fill, Slate text, standard `Border` outline.
  Hover: text lifts to Bone, border strengthens to `Border Hover`.
  No filled/solid button variant exists anywhere in the system.

### Chips / Tags / Pills
- **Style:** mono 10.5–11.5px, 1px `Border`, `6px` (tag) or `999px` (pill)
  radius, Slate text, `3–11px` horizontal padding depending on context.
- **State:** the sole colored pill is "mentoring · open" — Status Green
  text on a `rgba(74,222,128,.32)` border, the only pill that ever carries
  color.

### Cards / Containers
- **Corner Style:** 12px (repo cards, status panel, contribution board),
  10px (inner strips: the `/checks` count strip, the About stats grid).
- **Background:** Panel (`#10151E`) uniformly; no card ever varies its own
  fill.
- **Shadow Strategy:** none. See Elevation.
- **Border:** 1px `Border` at rest; repo cards alone brighten to
  `rgba(56,189,248,.32)` on hover, the system's only card-level hover
  treatment.
- **Internal Padding:** 24px (repo cards), 16–20px (status panel, count
  strip, contribution board).

### Navigation
- Sticky header, `rgba(10,14,20,.82)` fill with `14px` backdrop blur, 1px
  bottom border. Nav items are mono 12px, Slate at rest, lifting to Bone
  with a `rgba(255,255,255,.04)` background fill on hover — the one place
  in the system a neutral (not a functional color) carries a hover state.
  The active route reuses the same Bone text color (no background fill,
  no functional-color highlight) — deliberately understated rather than a
  distinct "selected" treatment.

### Contribution Board (signature component)
53 columns of 7 cells each, 9×9px, 2px radius, 3px gaps. Cell color comes
from a 5-step heat ramp: `#161D28` (Panel Dim, zero activity) through
three `rgba(74,222,128, .22/.45/.72)` steps to solid Status Green at peak.
This is the one place Status Green is allowed to act as a fill rather
than text/border/dot — because the fill IS the data, not decoration.

## 6. Do's and Don'ts

### Do:
- **Do** keep the mono/sans split total: mono for anything
  machine-authored (routes, timestamps, metrics, tags, nav), sans for
  anything human-authored (headlines, bio prose).
- **Do** use borders and tonal-surface steps (Void → Panel → Panel Dim)
  for all depth. Nothing casts a shadow.
- **Do** keep Signal Cyan and Status Green each doing exactly one job
  (information vs. health) and nowhere else.
- **Do** use only `clamp()`, `auto-fit`/`minmax()` grids, and `flex-wrap`
  for responsiveness. No media-query breakpoints anywhere.
- **Do** make every navigation target a real `<a href>` with a visible
  2px accent focus ring, 2px offset.

### Don't:
- **Don't** introduce gradient-hero blocks, glassmorphism, or bouncy
  micro-animations — named anti-references from PRODUCT.md.
- **Don't** add an icon set. Status is dots; navigation is text arrows
  (`→`, `←`). This restraint is deliberate, not an oversight.
- **Don't** use `box-shadow` for elevation or depth; it's reserved for the
  two functional insets (status-dot ring, planet highlight) only.
- **Don't** let Status Green appear as a link or nav color, or Signal Cyan
  appear as a health/availability indicator — the Two-Job Rule.
- **Don't** build identical repeating card grids as filler, or use a
  `border-left`/`border-right` colored stripe as an accent anywhere.
