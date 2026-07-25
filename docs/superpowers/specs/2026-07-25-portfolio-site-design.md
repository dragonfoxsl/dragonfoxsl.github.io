# Portfolio site — design spec

## Source of truth

The full visual/content spec lives in the design handoff bundle, unzipped to
`design-handoff/design_handoff_portfolio_site/`:

- `README.md` — tokens, layout, typography, copy, data requirements, a11y notes.
  Treat as authoritative for every pixel value, color, spacing, and copy string.
- `Bisina Portfolio.dc.html` — the 3-page prototype (home/checks/about), including
  exact repo data shape and the seeded-LCG contribution generator being replaced.
- `Space Scene.dc.html` — the CSS-only 8-bit space scene used as the About page's
  README-header art.

This document covers only what the handoff leaves open: engineering architecture,
data plumbing, and deploy. Do not restate token values here — read the handoff.

## Stack

- **Astro**, static output (`output: 'static'`), TypeScript.
- **Tailwind CSS** (via `@astrojs/tailwind`), configured with the handoff's design
  tokens as theme extensions (colors, font families, custom spacing/radius where
  they don't map to Tailwind's default scale — several values are non-standard,
  e.g. `12.5px`, `.035em` tracking, so expect arbitrary-value utilities
  (`text-[12.5px]`) alongside theme tokens for the odd ones).
- **Space Grotesk** + **JetBrains Mono**, self-hosted via `@fontsource-variable`
  packages (not the Google Fonts CDN link the prototype uses).
- No component framework (React/Vue/etc.) — everything is static Astro components;
  there is no client-side interactivity in the design beyond CSS `:hover`/`:focus`.

## Project structure

```
src/
  layouts/
    BaseLayout.astro       # <head>, fonts, atmosphere layer, Header, Footer, <slot/>
  components/
    Header.astro
    Footer.astro
    StatusPanel.astro      # home hero's GET /status card
    RepoCard.astro         # home "Selected work" grid card
    RepoRow.astro          # /checks list row
    ContributionBoard.astro
    SpaceScene.astro       # ported from Space Scene.dc.html, kept animated
  pages/
    index.astro
    checks.astro
    about.astro
  lib/
    github.ts              # build-time fetchers (see Data below)
    contributions.ts        # quantile bucketing into the 5-level heat ramp
  styles/
    global.css              # Tailwind directives + any base/selection rules
tailwind.config.mjs
astro.config.mjs
.github/workflows/deploy.yml
```

Routing is real Astro pages (`/`, `/checks`, `/about`) — no client-side page
switch, per the handoff's explicit instruction.

## Data

Both fetchers run at build time only (inside `.astro` frontmatter / `lib/`
modules executed during `astro build`), never client-side.

- **Repositories** — `lib/github.ts` calls
  `GET https://api.github.com/users/dragonfoxsl/repos?sort=updated&per_page=100`
  with the PAT (raises rate limit; unauthenticated 60/hr is otherwise fine but
  the token is already required for contributions, so reuse it). Maps
  `name`, `description`, `html_url`, `language`, `stargazers_count`, `private`
  into the shape the components expect (`vis`, `lang`, `color`, `stars` display
  string). Language dot colors: use the four the handoff specifies (HCL, Python,
  Go, PowerShell) and fall back to `muted` (`#7D8799`) for any language not in
  that map. The prototype's `hash-compare` gist entry is not part of the REST
  repos response (it's a gist, not a repo) — hardcode that one entry alongside
  the fetched list, keeping its `vis: 'gist'` pill, per the handoff's note.
- **Contributions** — `lib/github.ts` calls the GraphQL API
  (`user.contributionsCollection.contributionCalendar`) for `dragonfoxsl`,
  authenticated with the same PAT. `lib/contributions.ts` buckets each day's
  `contributionCount` into the 5-level ramp using quantile thresholds computed
  over the fetched year of data (not fixed counts), so the board stays legible
  regardless of activity level. Remove the "· sample data" label once wired to
  real data (the label becomes the actual date range from the API response).
- **Token**: `GITHUB_TOKEN` env var, a PAT with default (no extra) scopes —
  public read access is sufficient. Required at build time; the build fails
  loudly if unset rather than silently falling back to sample data.

## Space scene

Ported as a live Astro component with its original CSS `@keyframes` animation
intact (march/patrol/bob/laser/thrust/twinkle) — animation is fine within the
site itself; the handoff's "no animation" constraint is specific to the GitHub
markdown README embed, which strips inline styles/scripts and can't run it.
`prefers-reduced-motion: reduce` disables all animation, per the source file.

Exporting a static SVG/PNG of this scene for the actual `dragonfoxsl/dragonfoxsl`
profile README is a separate downstream task against a different repo — out of
scope for this build. Noted here so it isn't lost, not implemented now.

## Accessibility fixes (folding in the handoff's own punch list)

- Every navigation target (header nav, hero buttons, "all repositories" link)
  is a real `<a href>`, not a `<span onClick>`.
- Visible focus ring: `2px solid var(--accent)` (or Tailwind `outline-accent`),
  `2px` offset, on all interactive elements.
- Contribution cells: the whole board gets one descriptive `aria-label`/caption
  (e.g. "53-week contribution history, N total contributions"); individual day
  cells are `aria-hidden="true"`.

## Deploy

`.github/workflows/deploy.yml`:

- Triggers: `push` to `main`, plus `schedule` (nightly cron) so the contribution
  board and repo list stay fresh without a manual rebuild.
- Steps: checkout → setup Node → `npm ci` → `npm run build` (with `GITHUB_TOKEN`
  sourced from a repo secret, e.g. `GH_PAT` to avoid colliding with the
  workflow's own ambient `GITHUB_TOKEN`) → `actions/upload-pages-artifact` →
  `actions/deploy-pages`.
- This is a GitHub Pages **user site**: the remote repo must be named exactly
  `dragonfoxsl.github.io`. `astro.config.mjs` sets `site: 'https://dragonfoxsl.github.io'`
  with no `base` path (user sites serve from the domain root). The local
  working directory name (`github-profile`) doesn't need to match — that's
  reconciled when the git remote is added, not part of this build.

## Out of scope for this pass

- Static SVG/PNG export of the space scene for the GitHub profile README repo.
- Any CMS/editing UI for the placeholder bio copy — copy ships as written in
  the handoff; the user confirms/edits it directly in source before shipping.
