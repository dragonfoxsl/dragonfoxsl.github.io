# Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 3-page Astro/Tailwind portfolio site (`/`, `/checks`, `/about`) described in the design handoff, with build-time GitHub data fetching and a GitHub Pages deploy workflow.

**Architecture:** Astro static site, Tailwind CSS configured with the handoff's exact design tokens, pure-function data helpers (`lib/github.ts`, `lib/contributions.ts`) tested with Vitest, Astro components/pages verified by `npm run build` since there's no meaningful red/green cycle for static markup.

**Tech Stack:** Astro (static output), TypeScript, Tailwind CSS v4 (`@tailwindcss/vite` + `@import "tailwindcss"`), `@fontsource-variable/space-grotesk` + `@fontsource-variable/jetbrains-mono`, Vitest, GitHub REST + GraphQL APIs, GitHub Actions → GitHub Pages.

## Global Constraints

- Source of truth for every color/spacing/typography value is
  `design-handoff/design_handoff_portfolio_site/README.md` and
  `Bisina Portfolio.dc.html` — do not invent or approximate values; every
  Tailwind class below already encodes the exact handoff value.
- `GITHUB_TOKEN` env var (a GitHub PAT, default/public-read scope) must be set
  — in the shell or a local `.env` (Astro/Vite auto-loads `.env` for
  server-side `import.meta.env` access, and since the var has no `PUBLIC_`
  prefix it is never exposed client-side) — before running `npm run build` or
  `npm run dev` for any task from Task 7 onward. The build throws if it's
  unset; that's intentional, not a bug to fix.
- No icon set — status/nav communicated with dots and text arrows only, per
  the handoff. Don't add one.
- No media queries — every layout uses `repeat(auto-fit, minmax(...))` grids,
  `clamp()`, and `flex-wrap`, per the handoff. Don't convert to breakpoints.
- Every navigation target is a real `<a href>` (the prototype's `<span
  onClick>` pattern is explicitly called out in the handoff as something to
  fix, not preserve).
- This repo is a GitHub Pages **user site** (`dragonfoxsl.github.io`, public
  repo) — `astro.config.mjs` sets `site` with no `base` path.
- Package manager: npm. Node version: **22.12+** (revised during Task 1 — the
  Astro 7 scaffold and its `@astrojs/compiler-rs` dependency require Node
  ≥22.12.0; the plan originally said Node 20, which is incompatible with the
  toolchain actually installed. Task 12's GitHub Actions workflow must use
  `node-version: 22`, not `20`.)
- Do not add a co-author trailer to commits (per explicit user instruction
  earlier in this session). Do not commit `.claude/` or a `CLAUDE.md` (already
  excluded via `.gitignore`).

---

## File Structure

```
astro.config.mjs
tailwind.config.mjs
vitest.config.ts
.env.example
package.json
src/
  layouts/
    BaseLayout.astro
  components/
    Header.astro
    Footer.astro
    StatusPanel.astro
    RepoCard.astro
    RepoRow.astro
    ContributionBoard.astro
    SpaceScene.astro
  pages/
    index.astro
    checks.astro
    about.astro
  lib/
    github.ts
    github.test.ts
    contributions.ts
    contributions.test.ts
  styles/
    global.css
.github/
  workflows/
    deploy.yml
```

---

### Task 1: Scaffold Astro project, Tailwind tokens, fonts, Vitest

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tailwind.config.mjs`,
  `vitest.config.ts`, `.env.example`, `src/styles/global.css`,
  `src/pages/index.astro` (placeholder, overwritten in Task 7)
- Modify: `.gitignore` (already has `node_modules/`, `dist/`, `.astro/`,
  `.env` from the earlier commit — verify, don't duplicate)

**Interfaces:**
- Produces: Tailwind theme tokens (`bg`, `surface`, `surface-alt`, `border`,
  `border-subtle`, `border-hover`, `text`, `muted`, `accent`, `accent-hover`,
  `accent-wash`, `accent-border`, `accent-border-hover`, `accent-card-hover`,
  `signal`, `row-hover`, `selection`) and font families (`font-display`,
  `font-mono`) — every later task's Tailwind classes assume these exist.

- [ ] **Step 1: Scaffold the Astro project in place**

```bash
cd ~/Documents/dev/projects/github-profile
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install -D @tailwindcss/vite tailwindcss
npm install @fontsource-variable/space-grotesk @fontsource-variable/jetbrains-mono
npm install -D vitest
```

> **Note (deliberate substitution, controller-approved during Task 1):** the
> plan originally called for `npx astro add tailwind -y`, which installs the
> Tailwind v3-era `@astrojs/tailwind` integration and its `@tailwind
> base/components/utilities` CSS directives. The Astro/Tailwind tooling
> actually installed at implementation time pulled in Tailwind CSS v4, which
> replaces that integration with the `@tailwindcss/vite` Vite plugin and an
> `@import "tailwindcss"` directive in the global stylesheet instead. See
> `.superpowers/sdd/task-1-resume-notes.md` for the original reasoning; the
> steps below describe what was actually built.

- [ ] **Step 3: Write `tailwind.config.mjs`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E14',
        surface: '#10151E',
        'surface-alt': '#161D28',
        border: 'rgba(255,255,255,.07)',
        'border-subtle': 'rgba(255,255,255,.05)',
        'border-hover': 'rgba(255,255,255,.16)',
        text: '#E6EAF0',
        muted: '#7D8799',
        accent: '#38BDF8',
        'accent-hover': '#7DD3FC',
        'accent-wash': 'rgba(56,189,248,.08)',
        'accent-border': 'rgba(56,189,248,.35)',
        'accent-border-hover': 'rgba(56,189,248,.6)',
        'accent-card-hover': 'rgba(56,189,248,.32)',
        signal: '#4ADE80',
        'row-hover': 'rgba(255,255,255,.018)',
        selection: 'rgba(56,189,248,.25)',
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'monospace'],
      },
    },
  },
};
```

- [ ] **Step 4: Write `src/styles/global.css`**

```css
@import "tailwindcss";
@config "../../tailwind.config.mjs";

::selection {
  background: rgba(56, 189, 248, 0.25);
  color: #e6eaf0;
}

:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}
```

- [ ] **Step 5: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://dragonfoxsl.github.io',
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 6: Write `.env.example` and `vitest.config.ts`**

`.env.example`:
```
GITHUB_TOKEN=
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

- [ ] **Step 7: Add `test` script to `package.json`**

In the `"scripts"` block of `package.json`, add:

```json
"test": "vitest run"
```

(keep the `dev`/`build`/`preview`/`astro` scripts the Astro scaffold already added)

- [ ] **Step 8: Verify the scaffold builds**

```bash
npm run build
```

Expected: build succeeds (the scaffolded placeholder `src/pages/index.astro`
is enough to satisfy Astro's "at least one page" requirement at this point).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tailwind.config.mjs \
  vitest.config.ts .env.example src/styles/global.css src/pages/index.astro \
  .gitignore tsconfig.json
git commit -m "Scaffold Astro project with Tailwind tokens, fonts, and Vitest"
```

---

### Task 2: `lib/contributions.ts` — quantile bucketing (TDD)

**Files:**
- Create: `src/lib/contributions.ts`, `src/lib/contributions.test.ts`

**Interfaces:**
- Produces: `interface Day { date: string; count: number; level: number }`,
  `interface Week { days: Day[] }`, `bucketize(counts: number[]): number[]`,
  `levelColor(level: number): string`,
  `buildWeeks(days: { date: string; count: number }[]): Week[]`,
  `formatMonthYear(isoDate: string): string`
- Consumes: nothing from other tasks

- [ ] **Step 1: Write the failing tests**

`src/lib/contributions.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { bucketize, buildWeeks, levelColor, formatMonthYear } from './contributions';

describe('bucketize', () => {
  it('assigns level 0 to zero counts and spreads the rest across quartiles', () => {
    const counts = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8];
    const levels = bucketize(counts);
    expect(levels[0]).toBe(0);
    expect(levels[1]).toBe(0);
    expect(Math.max(...levels)).toBe(4);
    expect(levels.every((l) => l >= 0 && l <= 4)).toBe(true);
  });

  it('returns all zeros when every count is zero', () => {
    expect(bucketize([0, 0, 0])).toEqual([0, 0, 0]);
  });
});

describe('levelColor', () => {
  it('returns the heat ramp color for each level', () => {
    expect(levelColor(0)).toBe('#161D28');
    expect(levelColor(1)).toBe('rgba(74,222,128,.22)');
    expect(levelColor(2)).toBe('rgba(74,222,128,.45)');
    expect(levelColor(3)).toBe('rgba(74,222,128,.72)');
    expect(levelColor(4)).toBe('#4ADE80');
  });
});

describe('buildWeeks', () => {
  it('groups days into 7-day weeks in order', () => {
    const days = Array.from({ length: 14 }, (_, i) => ({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      count: i,
    }));
    const weeks = buildWeeks(days);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].days).toHaveLength(7);
    expect(weeks[1].days[0].date).toBe('2025-01-08');
  });
});

describe('formatMonthYear', () => {
  it('formats an ISO date as lowercase "mon yyyy"', () => {
    expect(formatMonthYear('2025-07-26')).toBe('jul 2025');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './contributions'`

- [ ] **Step 3: Implement `src/lib/contributions.ts`**

```ts
export interface Day {
  date: string;
  count: number;
  level: number;
}

export interface Week {
  days: Day[];
}

const HEAT_RAMP = [
  '#161D28',
  'rgba(74,222,128,.22)',
  'rgba(74,222,128,.45)',
  'rgba(74,222,128,.72)',
  '#4ADE80',
];

export function levelColor(level: number): string {
  return HEAT_RAMP[level];
}

export function bucketize(counts: number[]): number[] {
  const nonZero = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) return counts.map(() => 0);

  const quantile = (p: number) =>
    nonZero[Math.min(nonZero.length - 1, Math.floor(p * nonZero.length))];
  const t1 = quantile(0.25);
  const t2 = quantile(0.5);
  const t3 = quantile(0.75);

  return counts.map((c) => {
    if (c === 0) return 0;
    if (c <= t1) return 1;
    if (c <= t2) return 2;
    if (c <= t3) return 3;
    return 4;
  });
}

export function buildWeeks(days: { date: string; count: number }[]): Week[] {
  const levels = bucketize(days.map((d) => d.count));
  const withLevels: Day[] = days.map((d, i) => ({ ...d, level: levels[i] }));

  const weeks: Week[] = [];
  for (let i = 0; i < withLevels.length; i += 7) {
    weeks.push({ days: withLevels.slice(i, i + 7) });
  }
  return weeks;
}

export function formatMonthYear(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/contributions.ts src/lib/contributions.test.ts
git commit -m "Add contribution-board quantile bucketing logic"
```

---

### Task 3: `lib/github.ts` — repo + contribution fetchers (TDD)

**Files:**
- Create: `src/lib/github.ts`, `src/lib/github.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `interface Repo { name: string; description: string; url: string;
  language: string; color: string; stars: number; visibility: 'public' |
  'gist' }`, `mapRepo(raw): Repo`, `getRepos(token: string): Promise<Repo[]>`,
  `interface ContributionDay { date: string; count: number }`,
  `getContributionDays(token: string): Promise<{ days: ContributionDay[];
  from: string; to: string }>` — Tasks 7, 8, 11 call `getRepos` and
  `getContributionDays` directly.

- [ ] **Step 1: Write the failing tests**

`src/lib/github.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapRepo, getRepos, getContributionDays } from './github';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('mapRepo', () => {
  it('maps a known language to its handoff token color', () => {
    const result = mapRepo({
      name: 'terraform-opentofu-migration-sample',
      description: 'Sample Terraform configuration to test OpenTofu migration.',
      html_url: 'https://github.com/dragonfoxsl/terraform-opentofu-migration-sample',
      language: 'HCL',
      stargazers_count: 1,
    });
    expect(result).toEqual({
      name: 'terraform-opentofu-migration-sample',
      description: 'Sample Terraform configuration to test OpenTofu migration.',
      url: 'https://github.com/dragonfoxsl/terraform-opentofu-migration-sample',
      language: 'HCL',
      color: '#7D8799',
      stars: 1,
      visibility: 'public',
    });
  });

  it('falls back to the muted token color for an unmapped language and null description', () => {
    const result = mapRepo({
      name: 'some-repo',
      description: null,
      html_url: 'https://github.com/dragonfoxsl/some-repo',
      language: 'Rust',
      stargazers_count: 0,
    });
    expect(result.color).toBe('#7D8799');
    expect(result.description).toBe('');
  });
});

describe('getRepos', () => {
  it('filters out private and forked repos, maps the rest, and appends the hash-compare gist', async () => {
    const mockRepos = [
      {
        name: 'aws-dms-mapping-generator',
        description: 'Generates AWS DMS table mappings instead of writing the JSON by hand.',
        html_url: 'https://github.com/dragonfoxsl/aws-dms-mapping-generator',
        language: 'Python',
        stargazers_count: 0,
        private: false,
        fork: false,
      },
      {
        name: 'secret-internal-tool',
        description: 'Should be excluded.',
        html_url: 'https://github.com/dragonfoxsl/secret-internal-tool',
        language: 'Go',
        stargazers_count: 0,
        private: true,
        fork: false,
      },
      {
        name: 'someones-fork',
        description: 'Should be excluded.',
        html_url: 'https://github.com/dragonfoxsl/someones-fork',
        language: 'Go',
        stargazers_count: 0,
        private: false,
        fork: true,
      },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRepos,
      })
    );

    const repos = await getRepos('fake-token');

    expect(repos).toHaveLength(2);
    expect(repos[0].name).toBe('aws-dms-mapping-generator');
    expect(repos[1]).toEqual({
      name: 'hash-compare',
      description: 'Small utility to compare hash values of a file.',
      url: 'https://gist.github.com/dragonfoxsl/fa086bec2e195136266832f73bf81367',
      language: 'PowerShell',
      color: '#E6EAF0',
      stars: 1,
      visibility: 'gist',
    });
  });

  it('throws when the GitHub API responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(getRepos('fake-token')).rejects.toThrow('403');
  });
});

describe('getContributionDays', () => {
  it('flattens the GraphQL weeks into a day list with from/to bounds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            user: {
              contributionsCollection: {
                contributionCalendar: {
                  weeks: [
                    {
                      contributionDays: [
                        { date: '2025-07-27', contributionCount: 2 },
                        { date: '2025-07-28', contributionCount: 0 },
                      ],
                    },
                    {
                      contributionDays: [{ date: '2025-08-03', contributionCount: 5 }],
                    },
                  ],
                },
              },
            },
          },
        }),
      })
    );

    const result = await getContributionDays('fake-token');

    expect(result.days).toEqual([
      { date: '2025-07-27', count: 2 },
      { date: '2025-07-28', count: 0 },
      { date: '2025-08-03', count: 5 },
    ]);
    expect(result.from).toBe('2025-07-27');
    expect(result.to).toBe('2025-08-03');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module './github'`

- [ ] **Step 3: Implement `src/lib/github.ts`**

```ts
export interface Repo {
  name: string;
  description: string;
  url: string;
  language: string;
  color: string;
  stars: number;
  visibility: 'public' | 'gist';
}

export interface ContributionDay {
  date: string;
  count: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  HCL: '#7D8799',
  Python: '#4ADE80',
  Go: '#38BDF8',
  PowerShell: '#E6EAF0',
};
const DEFAULT_LANGUAGE_COLOR = '#7D8799';

const HASH_COMPARE_GIST: Repo = {
  name: 'hash-compare',
  description: 'Small utility to compare hash values of a file.',
  url: 'https://gist.github.com/dragonfoxsl/fa086bec2e195136266832f73bf81367',
  language: 'PowerShell',
  color: LANGUAGE_COLORS.PowerShell,
  stars: 1,
  visibility: 'gist',
};

const GITHUB_LOGIN = 'dragonfoxsl';

interface RawRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
}

interface RawRepoListItem extends RawRepo {
  private: boolean;
  fork: boolean;
}

export function mapRepo(raw: RawRepo): Repo {
  const language = raw.language ?? '';
  return {
    name: raw.name,
    description: raw.description ?? '',
    url: raw.html_url,
    language,
    color: LANGUAGE_COLORS[language] ?? DEFAULT_LANGUAGE_COLOR,
    stars: raw.stargazers_count,
    visibility: 'public',
  };
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };
}

export async function getRepos(token: string): Promise<Repo[]> {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_LOGIN}/repos?sort=updated&per_page=100`,
    { headers: authHeaders(token) }
  );
  if (!res.ok) throw new Error(`GitHub repos fetch failed: ${res.status}`);

  const data: RawRepoListItem[] = await res.json();
  const repos = data.filter((r) => !r.private && !r.fork).map(mapRepo);
  return [...repos, HASH_COMPARE_GIST];
}

const CONTRIBUTIONS_QUERY = `
  query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function getContributionDays(
  token: string
): Promise<{ days: ContributionDay[]; from: string; to: string }> {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: GITHUB_LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub GraphQL fetch failed: ${res.status}`);

  const json = await res.json();
  const weeks = json.data.user.contributionsCollection.contributionCalendar.weeks as {
    contributionDays: { date: string; contributionCount: number }[];
  }[];

  const days: ContributionDay[] = weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))
  );

  return { days, from: days[0].date, to: days[days.length - 1].date };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: PASS (all tests across both files)

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/lib/github.test.ts
git commit -m "Add build-time GitHub repo and contribution fetchers"
```

---

### Task 4: `BaseLayout`, `Header`, `Footer`

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`,
  `src/components/Footer.astro`

**Interfaces:**
- Consumes: `src/styles/global.css` (Task 1)
- Produces: `BaseLayout` props `{ title: string; description: string }` with
  a `<slot />` for page content — Tasks 7, 8, 11 wrap their page content in it.

- [ ] **Step 1: Write `src/components/Header.astro`**

```astro
---
const nav = [
  { href: '/', label: '/index' },
  { href: '/checks', label: '/checks' },
  { href: '/about', label: '/about' },
];
const currentPath = Astro.url.pathname;
---
<header class="sticky top-0 z-20 bg-[rgba(10,14,20,.82)] backdrop-blur-[14px] border-b border-border">
  <div class="max-w-[1120px] mx-auto px-6 py-3 min-h-[68px] flex items-center justify-between gap-x-6 gap-y-3 flex-wrap">
    <a href="/" class="flex items-baseline gap-2.5">
      <span class="text-[16px] font-semibold tracking-[-.01em]">Bisina Keshara</span>
      <span class="font-mono text-[11px] text-muted tracking-[.04em]">devops&nbsp;/&nbsp;lead</span>
    </a>
    <nav class="flex items-center gap-1 flex-wrap font-mono text-[12px]">
      {nav.map((item) => (
        <a
          href={item.href}
          class:list={[
            'px-3 py-[7px] rounded-md tracking-[.02em] hover:text-text hover:bg-white/[.04]',
            currentPath === item.href ? 'text-text' : 'text-muted',
          ]}
        >{item.label}</a>
      ))}
    </nav>
  </div>
</header>
```

- [ ] **Step 2: Write `src/components/Footer.astro`**

```astro
<footer class="border-t border-border mt-10">
  <div class="max-w-[1120px] mx-auto px-6 pt-8 pb-11 flex items-center justify-between gap-5 flex-wrap font-mono text-[11.5px] text-muted">
    <span>© 2026 Bisina Keshara · built and hosted by hand</span>
    <div class="flex gap-[18px]">
      <a href="https://github.com/dragonfoxsl" target="_blank" rel="noopener" class="text-muted hover:text-accent">github</a>
      <a href="https://medium.com/@bisinet" target="_blank" rel="noopener" class="text-muted hover:text-accent">medium</a>
    </div>
  </div>
</footer>
```

- [ ] **Step 3: Write `src/layouts/BaseLayout.astro`**

```astro
---
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
</head>
<body class="relative min-h-screen bg-bg text-text font-display antialiased overflow-x-hidden">
  <div class="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
    <div class="absolute inset-0" style="background-image: linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px); background-size: 72px 72px;"></div>
    <div class="absolute rounded-full" style="top: -18%; left: 58%; width: 1100px; height: 1100px; background: radial-gradient(circle, rgba(56,189,248,.10) 0%, rgba(56,189,248,.035) 38%, rgba(10,14,20,0) 70%);"></div>
    <div class="absolute rounded-full bg-text" style="top: 12%; left: 8%; width: 2px; height: 2px; opacity: .45;"></div>
    <div class="absolute rounded-full bg-text" style="top: 26%; left: 22%; width: 1px; height: 1px; opacity: .5;"></div>
    <div class="absolute rounded-full bg-text" style="top: 9%; left: 41%; width: 1px; height: 1px; opacity: .35;"></div>
    <div class="absolute rounded-full bg-text" style="top: 38%; left: 73%; width: 2px; height: 2px; opacity: .3;"></div>
    <div class="absolute rounded-full bg-text" style="top: 55%; left: 14%; width: 1px; height: 1px; opacity: .4;"></div>
    <div class="absolute rounded-full bg-text" style="top: 68%; left: 88%; width: 2px; height: 2px; opacity: .28;"></div>
    <div class="absolute rounded-full bg-text" style="top: 80%; left: 34%; width: 1px; height: 1px; opacity: .35;"></div>
    <div class="absolute rounded-full bg-text" style="top: 47%; left: 51%; width: 1px; height: 1px; opacity: .22;"></div>
    <div class="absolute rounded-full bg-text" style="top: 91%; left: 66%; width: 1px; height: 1px; opacity: .3;"></div>
    <div class="absolute rounded-full bg-text" style="top: 19%; left: 93%; width: 1px; height: 1px; opacity: .32;"></div>
  </div>
  <div class="relative z-10">
    <Header />
    <slot />
    <Footer />
  </div>
</body>
</html>
```

- [ ] **Step 4: Verify build still succeeds**

```bash
npm run build
```

Expected: build succeeds (BaseLayout/Header/Footer aren't wired into a page
yet, but nothing references them incorrectly — Astro only fails on files it
actually renders, so this just checks for syntax errors via `astro check` if
configured, otherwise proceed to Task 5 and verify at Task 7 once a page uses
it).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/components/Header.astro src/components/Footer.astro
git commit -m "Add BaseLayout, Header, and Footer with the atmosphere background layer"
```

---

### Task 5: `StatusPanel` component

**Files:**
- Create: `src/components/StatusPanel.astro`

**Interfaces:**
- Consumes: nothing (no props)
- Produces: `<StatusPanel />` — Task 7 renders it in the home hero's right
  column.

- [ ] **Step 1: Write `src/components/StatusPanel.astro`**

```astro
---
const rows = [
  { key: 'uptime_90d', value: '99.982%' },
  { key: 'p95_latency', value: '128ms' },
  { key: 'deploys_wk', value: '41' },
  { key: 'mttr', value: '11m 04s' },
  { key: 'on_call', value: 'available', signal: true },
];
---
<div class="bg-surface border border-border rounded-xl overflow-hidden font-mono">
  <div class="flex items-center justify-between gap-4 px-[18px] py-[14px] border-b border-border">
    <span class="text-[12.5px] text-text tracking-[.02em]"><span class="text-muted">GET</span> /status</span>
    <span class="inline-flex items-center gap-2 text-[12px] text-signal tracking-[.04em]">
      <span class="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_0_3px_rgba(74,222,128,.14)]"></span>200 OK
    </span>
  </div>
  <div class="px-[18px] pb-4 pt-1.5">
    {rows.map((row, i) => (
      <div class:list={['flex justify-between gap-4 py-[11px] text-[12.5px]', i < rows.length - 1 && 'border-b border-border-subtle']}>
        <span class="text-muted">{row.key}</span>
        <span class:list={[row.signal ? 'text-signal' : 'text-text']}>{row.value}</span>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusPanel.astro
git commit -m "Add StatusPanel component"
```

---

### Task 6: `RepoCard` and `RepoRow` components

**Files:**
- Create: `src/components/RepoCard.astro`, `src/components/RepoRow.astro`

**Interfaces:**
- Consumes: `Repo` type from `src/lib/github.ts` (Task 3)
- Produces: `<RepoCard repo={Repo} />`, `<RepoRow repo={Repo} />` — Task 7
  uses `RepoCard` in the home page's repo grid, Task 8 uses `RepoRow` in the
  `/checks` list.

- [ ] **Step 1: Write `src/components/RepoCard.astro`**

```astro
---
import type { Repo } from '../lib/github';

interface Props {
  repo: Repo;
}
const { repo } = Astro.props;
---
<a href={repo.url} target="_blank" rel="noopener" class="bg-surface border border-border rounded-xl p-6 flex flex-col gap-3 text-inherit hover:border-accent-card-hover">
  <div class="flex items-center justify-between gap-3">
    <span class="font-mono text-[13.5px] text-accent break-words">{repo.name}</span>
    <span class="font-mono text-[10.5px] text-muted border border-border rounded-full px-[9px] py-[3px] shrink-0">{repo.visibility}</span>
  </div>
  <p class="m-0 text-[14.5px] leading-[1.58] text-muted [text-wrap:pretty]">{repo.description}</p>
  <div class="mt-auto pt-2 flex items-center gap-4 font-mono text-[11.5px] text-muted">
    <span class="inline-flex items-center gap-[7px]">
      <span class="w-2 h-2 rounded-full" style={`background:${repo.color}`}></span>{repo.language}
    </span>
    {repo.stars > 0 && <span>★ {repo.stars}</span>}
  </div>
</a>
```

- [ ] **Step 2: Write `src/components/RepoRow.astro`**

```astro
---
import type { Repo } from '../lib/github';

interface Props {
  repo: Repo;
}
const { repo } = Astro.props;
---
<a href={repo.url} target="_blank" rel="noopener" class="grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-x-7 gap-y-2.5 items-baseline py-6 border-t border-border text-inherit hover:bg-row-hover">
  <div class="flex flex-col gap-2.5">
    <span class="font-mono text-[14px] text-accent break-words">{repo.name}</span>
    <span class="inline-flex items-center gap-2 font-mono text-[11.5px] text-muted">
      <span class="w-2 h-2 rounded-full" style={`background:${repo.color}`}></span>{repo.language}
      {repo.stars > 0 && <span>★ {repo.stars}</span>}
    </span>
  </div>
  <p class="[grid-column:span_2] m-0 text-[15px] leading-[1.6] text-muted [text-wrap:pretty]">{repo.description}</p>
</a>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RepoCard.astro src/components/RepoRow.astro
git commit -m "Add RepoCard and RepoRow components"
```

---

### Task 7: Home page (`/`)

**Files:**
- Modify: `src/pages/index.astro` (overwrite the Task 1 scaffold placeholder)

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `StatusPanel` (Task 5), `RepoCard` (Task
  6), `getRepos` (Task 3)

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import StatusPanel from '../components/StatusPanel.astro';
import RepoCard from '../components/RepoCard.astro';
import { getRepos } from '../lib/github';

const token = import.meta.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN env var is required to build this site');
const repos = await getRepos(token);
const pinned = repos.slice(0, 6);
---
<BaseLayout
  title="Bisina Keshara — DevOps technical lead"
  description="DevOps technical lead in Colombo. Pipelines, infrastructure and on-call practice."
>
  <main class="max-w-[1120px] mx-auto px-6">
    <section class="grid [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))] gap-[clamp(32px,5vw,64px)] items-center py-[clamp(56px,9vw,112px)] pb-[clamp(48px,7vw,88px)]">
      <div>
        <div class="font-mono text-[11px] text-muted tracking-[.18em] uppercase mb-[22px]">Platform &amp; reliability</div>
        <h1 class="m-0 mb-6 text-[clamp(38px,5.6vw,62px)] leading-[1.04] tracking-[-.035em] font-semibold [text-wrap:balance]">I keep delivery systems boring, observable and fast.</h1>
        <p class="m-0 mb-8 text-[clamp(16px,1.5vw,18px)] leading-[1.65] text-muted max-w-[48ch] [text-wrap:pretty]">DevOps technical lead in Colombo. I build the pipelines, infrastructure and on-call practice behind products that can't afford a bad Tuesday.</p>
        <div class="flex flex-wrap gap-3">
          <a href="/checks" class="font-mono text-[12.5px] px-5 py-3 rounded-lg border border-accent-border text-accent tracking-[.02em] hover:bg-accent-wash hover:border-accent-border-hover">view /checks →</a>
          <a href="/about" class="font-mono text-[12.5px] px-5 py-3 rounded-lg border border-border text-muted tracking-[.02em] hover:text-text hover:border-border-hover">about me</a>
        </div>
      </div>
      <StatusPanel />
    </section>

    <section class="py-[clamp(40px,6vw,72px)] border-t border-border">
      <div class="flex items-baseline justify-between gap-6 flex-wrap mb-8">
        <div>
          <div class="font-mono text-[12px] text-accent tracking-[.06em] mb-2.5">/checks</div>
          <h2 class="m-0 text-[clamp(26px,3vw,34px)] tracking-[-.025em] font-semibold">Selected work</h2>
        </div>
        <a href="/checks" class="font-mono text-[12px] text-accent">all {repos.length} public repositories →</a>
      </div>
      <div class="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
        {pinned.map((repo) => <RepoCard repo={repo} />)}
      </div>
    </section>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify the build (requires `GITHUB_TOKEN`)**

```bash
export GITHUB_TOKEN=<your-pat>
npm run build
```

Expected: build succeeds; `dist/index.html` contains the hero copy and at
least one repo card. If it fails with a 401/403, the PAT is invalid or
missing public read access — check the token, not the code.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "Build the home page with status panel and pinned repos"
```

---

### Task 8: `/checks` page

**Files:**
- Create: `src/pages/checks.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `RepoRow` (Task 6), `getRepos` (Task 3)

- [ ] **Step 1: Write `src/pages/checks.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import RepoRow from '../components/RepoRow.astro';
import { getRepos } from '../lib/github';

const token = import.meta.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN env var is required to build this site');
const repos = await getRepos(token);
const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);
---
<BaseLayout
  title="Public repositories — Bisina Keshara"
  description="Infrastructure tooling, migration helpers and small utilities."
>
  <main class="max-w-[900px] mx-auto px-6">
    <section class="pt-[clamp(48px,7vw,88px)] pb-9">
      <div class="font-mono text-[12px] text-accent tracking-[.06em] mb-3.5">/checks</div>
      <h1 class="m-0 mb-5 text-[clamp(34px,5vw,54px)] leading-[1.06] tracking-[-.035em] font-semibold">Public repositories</h1>
      <p class="m-0 text-[clamp(16px,1.6vw,18px)] leading-[1.65] text-muted max-w-[56ch] [text-wrap:pretty]">Infrastructure tooling, migration helpers and small utilities. Everything here is public on GitHub.</p>
    </section>

    <div class="flex items-center justify-between gap-4 flex-wrap px-5 py-4 bg-surface border border-border rounded-[10px] font-mono text-[12px] text-muted mb-2">
      <span><span class="text-text">{repos.length}</span> public repositories · <span class="text-text">{totalStars}</span> stars given</span>
      <a href="https://github.com/dragonfoxsl?tab=repositories" target="_blank" rel="noopener">browse all on github →</a>
    </div>

    <div class="flex flex-col pb-11">
      {repos.map((repo) => <RepoRow repo={repo} />)}
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify the build**

```bash
npm run build
```

Expected: build succeeds; `dist/checks/index.html` lists every repo returned
by `getRepos`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/checks.astro
git commit -m "Build the /checks public repositories page"
```

---

### Task 9: `ContributionBoard` component

**Files:**
- Create: `src/components/ContributionBoard.astro`

**Interfaces:**
- Consumes: `Week`, `levelColor` from `src/lib/contributions.ts` (Task 2)
- Produces: `<ContributionBoard weeks={Week[]} from={string} to={string}
  totalContributions={number} />` — Task 11 renders it on `/about`.

- [ ] **Step 1: Write `src/components/ContributionBoard.astro`**

```astro
---
import type { Week } from '../lib/contributions';
import { levelColor } from '../lib/contributions';

interface Props {
  weeks: Week[];
  from: string;
  to: string;
  totalContributions: number;
}
const { weeks, from, to, totalContributions } = Astro.props;
const legendLevels = [0, 1, 2, 3, 4];
---
<div class="bg-surface border border-border rounded-xl p-5 overflow-x-auto">
  <div
    class="flex gap-[3px] min-w-[620px]"
    role="img"
    aria-label={`Contribution history from ${from} to ${to}: ${totalContributions} total contributions`}
  >
    {weeks.map((week) => (
      <div class="flex flex-col gap-[3px]" aria-hidden="true">
        {week.days.map((day) => (
          <div class="w-[9px] h-[9px] rounded-sm" style={`background:${levelColor(day.level)}`}></div>
        ))}
      </div>
    ))}
  </div>
  <div class="flex items-center gap-2 mt-4 font-mono text-[10.5px] text-muted" aria-hidden="true">
    <span>less</span>
    {legendLevels.map((level) => <span class="w-[9px] h-[9px] rounded-sm" style={`background:${levelColor(level)}`}></span>)}
    <span>more</span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ContributionBoard.astro
git commit -m "Add ContributionBoard component"
```

---

### Task 10: `SpaceScene` component

**Files:**
- Create: `src/components/SpaceScene.astro`

**Interfaces:**
- Consumes: nothing (no props)
- Produces: `<SpaceScene />` — Task 11 renders it in the About page's README
  header art section.

- [ ] **Step 1: Write `src/components/SpaceScene.astro`**, porting
  `design-handoff/design_handoff_portfolio_site/Space Scene.dc.html:30-113`
  verbatim (same pixel coordinates, same `@keyframes`, same timing):

```astro
<div class="bg-surface border border-border rounded-xl overflow-hidden font-mono">
  <div class="flex items-center justify-between gap-4 px-[18px] py-[14px] border-b border-border">
    <span class="text-[12.5px] text-text tracking-[.02em]"><span class="text-muted">GET</span> /defence</span>
    <span class="inline-flex items-center gap-2 text-[12px] text-signal tracking-[.04em]">
      <span class="w-1.5 h-1.5 rounded-full bg-signal shadow-[0_0_0_3px_rgba(74,222,128,.14)]"></span>200 OK
    </span>
  </div>

  <div class="scene">
    <div class="glow"></div>
    <div class="star star-a"></div>
    <div class="star star-b"></div>
    <div class="star star-c"></div>
    <div class="star star-d"></div>
    <div class="star star-e"></div>
    <div class="star star-f"></div>
    <div class="star star-g"></div>
    <div class="star star-h"></div>
    <div class="star star-i"></div>

    <div class="planet-wrap">
      <div class="planet">
        <div class="crater crater-a"></div>
        <div class="crater crater-b"></div>
        <div class="crater crater-c"></div>
        <div class="crater crater-d"></div>
        <div class="crater crater-e"></div>
      </div>
    </div>

    <div class="invaders">
      <div class="row row-top">
        <div class="sprite invader-a"></div>
        <div class="sprite invader-a"></div>
        <div class="sprite invader-a"></div>
      </div>
      <div class="row row-bottom">
        <div class="sprite invader-b"></div>
        <div class="sprite invader-b"></div>
        <div class="sprite invader-b"></div>
      </div>
    </div>

    <div class="ship">
      <div class="laser"></div>
      <div class="sprite ship-sprite"></div>
      <div class="thrust"></div>
    </div>

    <div class="scanlines"></div>
  </div>

  <div class="flex items-center justify-between gap-4 flex-wrap px-[18px] py-[13px] border-t border-border text-[11.5px] text-muted">
    <span>wave <span class="text-text">07</span></span>
    <span>hostiles <span class="text-text">06</span></span>
    <span>shields <span class="text-signal">nominal</span></span>
    <span>renderer <span class="text-text">css</span></span>
  </div>
</div>

<style>
  .scene {
    position: relative;
    aspect-ratio: 16 / 9;
    min-height: 300px;
    background: #0a0e14;
    overflow: hidden;
  }
  .glow {
    position: absolute;
    top: -30%;
    left: 56%;
    width: 620px;
    height: 620px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(56, 189, 248, 0.11) 0%, rgba(56, 189, 248, 0.035) 40%, rgba(10, 14, 20, 0) 70%);
  }
  .star {
    position: absolute;
    background: #e6eaf0;
  }
  .star-a { top: 14%; left: 9%; width: 3px; height: 3px; opacity: 0.4; animation: om-twinkle 2.4s steps(2) infinite alternate; }
  .star-b { top: 28%; left: 21%; width: 2px; height: 2px; opacity: 0.3; }
  .star-c { top: 8%; left: 38%; width: 2px; height: 2px; opacity: 0.45; }
  .star-d { top: 19%; left: 63%; width: 3px; height: 3px; opacity: 0.28; animation: om-twinkle 3.1s steps(2) infinite alternate; }
  .star-e { top: 34%; left: 79%; width: 2px; height: 2px; opacity: 0.38; }
  .star-f { top: 11%; left: 90%; width: 2px; height: 2px; opacity: 0.3; }
  .star-g { top: 45%; left: 5%; width: 2px; height: 2px; opacity: 0.25; }
  .star-h { top: 52%; left: 94%; width: 3px; height: 3px; opacity: 0.32; animation: om-twinkle 2.8s steps(2) infinite alternate; }
  .star-i { top: 41%; left: 46%; width: 2px; height: 2px; opacity: 0.2; }

  .planet-wrap { position: absolute; left: 50%; top: 62%; width: 132%; margin-left: -66%; }
  .planet {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    border-radius: 50%;
    background: radial-gradient(circle at 34% 22%, #1e2a3a 0%, #16202c 42%, #0f1620 72%, #0c1119 100%);
    box-shadow: inset 0 5px 0 rgba(56, 189, 248, 0.22), inset 0 0 60px rgba(10, 14, 20, 0.9);
    overflow: hidden;
  }
  .crater { position: absolute; border-radius: 50%; background: rgba(10, 14, 20, 0.34); }
  .crater-a { top: 5%; left: 22%; width: 12%; padding-bottom: 12%; }
  .crater-b { top: 9%; left: 55%; width: 7%; padding-bottom: 7%; background: rgba(10, 14, 20, 0.28); }
  .crater-c { top: 14%; left: 36%; width: 16%; padding-bottom: 16%; background: rgba(10, 14, 20, 0.22); }
  .crater-d { top: 4%; left: 70%; width: 5%; padding-bottom: 5%; background: rgba(10, 14, 20, 0.3); }
  .crater-e { top: 13%; left: 11%; width: 8%; padding-bottom: 8%; background: rgba(10, 14, 20, 0.26); }

  .invaders { position: absolute; top: 14%; left: 50%; margin-left: -136px; animation: om-march 5s steps(9) infinite alternate; }
  .row { display: flex; gap: 32px; }
  .row-top { margin-bottom: 22px; }
  .row-bottom { animation: om-bob 1.1s steps(2) infinite alternate; }
  .sprite { width: 32px; height: 24px; }
  .sprite::before { content: ''; display: block; width: 4px; height: 4px; background: transparent; }
  .invader-a::before {
    box-shadow: 4px 0 #38bdf8, 8px 0 #38bdf8, 12px 0 #38bdf8, 16px 0 #38bdf8, 20px 0 #38bdf8, 24px 0 #38bdf8,
      0 4px #38bdf8, 4px 4px #38bdf8, 12px 4px #38bdf8, 16px 4px #38bdf8, 24px 4px #38bdf8, 28px 4px #38bdf8,
      0 8px #38bdf8, 4px 8px #38bdf8, 8px 8px #38bdf8, 12px 8px #38bdf8, 16px 8px #38bdf8, 20px 8px #38bdf8, 24px 8px #38bdf8, 28px 8px #38bdf8,
      4px 12px #38bdf8, 12px 12px #38bdf8, 16px 12px #38bdf8, 24px 12px #38bdf8,
      0 16px #38bdf8, 8px 16px #38bdf8, 20px 16px #38bdf8, 28px 16px #38bdf8,
      4px 20px #38bdf8, 24px 20px #38bdf8;
  }
  .invader-b::before {
    box-shadow: 8px 0 #4ade80, 20px 0 #4ade80,
      8px 4px #4ade80, 12px 4px #4ade80, 16px 4px #4ade80, 20px 4px #4ade80,
      4px 8px #4ade80, 8px 8px #4ade80, 12px 8px #4ade80, 16px 8px #4ade80, 20px 8px #4ade80, 24px 8px #4ade80,
      0 12px #4ade80, 4px 12px #4ade80, 12px 12px #4ade80, 16px 12px #4ade80, 24px 12px #4ade80, 28px 12px #4ade80,
      0 16px #4ade80, 4px 16px #4ade80, 8px 16px #4ade80, 12px 16px #4ade80, 16px 16px #4ade80, 20px 16px #4ade80, 24px 16px #4ade80, 28px 16px #4ade80,
      0 20px #4ade80, 8px 20px #4ade80, 20px 20px #4ade80, 28px 20px #4ade80;
  }

  .ship { position: absolute; bottom: 19%; left: 50%; margin-left: -18px; animation: om-patrol 7s steps(13) infinite alternate; }
  .laser { position: absolute; left: 16px; bottom: 30px; width: 4px; height: 16px; background: #38bdf8; animation: om-laser 1.3s steps(12) infinite; }
  .ship-sprite { width: 36px; height: 24px; }
  .ship-sprite::before {
    content: '';
    display: block;
    width: 4px;
    height: 4px;
    background: transparent;
    box-shadow: 16px 0 #e6eaf0,
      12px 4px #e6eaf0, 16px 4px #e6eaf0, 20px 4px #e6eaf0,
      8px 8px #e6eaf0, 12px 8px #e6eaf0, 16px 8px #e6eaf0, 20px 8px #e6eaf0, 24px 8px #e6eaf0,
      4px 12px #e6eaf0, 8px 12px #e6eaf0, 12px 12px #38bdf8, 16px 12px #38bdf8, 20px 12px #38bdf8, 24px 12px #e6eaf0, 28px 12px #e6eaf0,
      0 16px #e6eaf0, 4px 16px #e6eaf0, 8px 16px #e6eaf0, 12px 16px #e6eaf0, 16px 16px #e6eaf0, 20px 16px #e6eaf0, 24px 16px #e6eaf0, 28px 16px #e6eaf0, 32px 16px #e6eaf0,
      0 20px #e6eaf0, 8px 20px #e6eaf0, 24px 20px #e6eaf0, 32px 20px #e6eaf0;
  }
  .thrust { position: absolute; left: 12px; top: 24px; width: 12px; height: 4px; background: #38bdf8; animation: om-thrust 0.34s steps(2) infinite alternate; }

  .scanlines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(to bottom, rgba(10, 14, 20, 0.22) 0 1px, rgba(10, 14, 20, 0) 1px 3px);
  }

  @keyframes om-march { from { transform: translateX(-26px); } to { transform: translateX(26px); } }
  @keyframes om-patrol { from { transform: translateX(-104px); } to { transform: translateX(104px); } }
  @keyframes om-bob { from { transform: translateY(0); } to { transform: translateY(4px); } }
  @keyframes om-laser { 0% { transform: translateY(0); opacity: 1; } 92% { transform: translateY(-168px); opacity: 1; } 93%, 100% { opacity: 0; } }
  @keyframes om-thrust { from { opacity: 1; } to { opacity: 0.25; } }
  @keyframes om-twinkle { from { opacity: 0.18; } to { opacity: 0.55; } }

  @media (prefers-reduced-motion: reduce) {
    .invaders, .row-bottom, .ship, .laser, .thrust, .star-a, .star-d, .star-h {
      animation: none !important;
    }
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SpaceScene.astro
git commit -m "Port the 8-bit space scene as a live animated component"
```

---

### Task 11: `/about` page

**Files:**
- Create: `src/pages/about.astro`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `ContributionBoard` (Task 9), `SpaceScene`
  (Task 10), `getRepos`/`getContributionDays` (Task 3), `buildWeeks`/
  `formatMonthYear` (Task 2)

- [ ] **Step 1: Write `src/pages/about.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ContributionBoard from '../components/ContributionBoard.astro';
import SpaceScene from '../components/SpaceScene.astro';
import { getRepos, getContributionDays } from '../lib/github';
import { buildWeeks, formatMonthYear } from '../lib/contributions';

const token = import.meta.env.GITHUB_TOKEN;
if (!token) throw new Error('GITHUB_TOKEN env var is required to build this site');

const repos = await getRepos(token);
const totalStars = repos.reduce((sum, r) => sum + r.stars, 0);

const { days, from, to } = await getContributionDays(token);
const weeks = buildWeeks(days);
const totalContributions = days.reduce((sum, d) => sum + d.count, 0);

const trajectory = [
  { range: '2023 — now', role: 'DevOps technical lead' },
  { range: '2020 — 2023', role: 'Senior platform engineer' },
  { range: '2017 — 2020', role: 'Infrastructure engineer' },
];
const stack = ['Terraform', 'OpenTofu', 'AWS', 'Kubernetes', 'Python', 'Go', 'PowerShell'];
---
<BaseLayout
  title="About — Bisina Keshara"
  description="DevOps technical lead: trajectory, stack, and activity."
>
  <main class="max-w-[1120px] mx-auto px-6">
    <section class="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-[clamp(28px,4vw,48px)] items-start pt-[clamp(44px,6vw,76px)] pb-10">
      <div class="flex flex-col gap-[18px] max-w-[340px]">
        <img
          src="https://avatars.githubusercontent.com/u/909787?v=4"
          alt="Bisina Keshara"
          class="w-full aspect-square object-cover border border-border rounded-xl block bg-surface"
        />
        <div>
          <div class="text-[26px] font-semibold tracking-[-.025em]">Bisina Keshara</div>
          <div class="font-mono text-[13px] text-muted mt-1">@dragonfoxsl · devops technical lead</div>
        </div>
        <div class="flex flex-col gap-[9px] font-mono text-[12px] text-muted">
          <span>Colombo, Sri Lanka</span>
          <a href="https://medium.com/@bisinet" target="_blank" rel="noopener">medium.com/@bisinet</a>
          <a href="https://github.com/dragonfoxsl" target="_blank" rel="noopener">github.com/dragonfoxsl</a>
          <span><span class="text-text">4</span> followers · <span class="text-text">5</span> following</span>
        </div>
        <div class="grid grid-cols-3 gap-px bg-border border border-border rounded-[10px] overflow-hidden font-mono">
          <div class="bg-surface px-3 py-3.5">
            <div class="text-[18px] text-text">{repos.length}</div>
            <div class="text-[10px] text-muted tracking-[.1em] uppercase mt-[5px]">repos</div>
          </div>
          <div class="bg-surface px-3 py-3.5">
            <div class="text-[18px] text-text">{totalStars}</div>
            <div class="text-[10px] text-muted tracking-[.1em] uppercase mt-[5px]">stars</div>
          </div>
          <div class="bg-surface px-3 py-3.5">
            <div class="text-[18px] text-text">9y</div>
            <div class="text-[10px] text-muted tracking-[.1em] uppercase mt-[5px]">shipping</div>
          </div>
        </div>
        <span class="self-start font-mono text-[11.5px] px-[14px] py-2 border border-[rgba(74,222,128,.32)] rounded-full text-signal">mentoring · open</span>
      </div>

      <div class="flex flex-col gap-[26px]">
        <div class="font-mono text-[12px] text-accent tracking-[.06em]">/about</div>
        <p class="m-0 text-[17.5px] leading-[1.72] text-text [text-wrap:pretty]">I lead a platform team. Most of what I do is remove reasons for people to page each other at 3am.</p>
        <p class="m-0 text-[16.5px] leading-[1.72] text-muted [text-wrap:pretty]">I started in support, moved to sysadmin work when the servers stopped being someone else's problem, and have spent the last eight years on delivery infrastructure — build systems, deployment tooling, observability, and the human process wrapped around all three. I care more about the process than the tools; the tools are just where the process becomes enforceable.</p>
        <p class="m-0 text-[16.5px] leading-[1.72] text-muted [text-wrap:pretty]">The work I'm proudest of is rarely visible. A deploy that nobody watched. A runbook nobody had to open. An alert that fired once, correctly, and then never again because the underlying thing got fixed.</p>
        <p class="m-0 text-[16.5px] leading-[1.72] text-muted [text-wrap:pretty]">Longer notes on all of this live on Medium. Smaller experiments end up on GitHub, usually as a script that started as a one-off and refused to stay one.</p>

        <div class="border-t border-border pt-[26px]">
          <div class="font-mono text-[11px] text-muted tracking-[.14em] uppercase mb-[18px]">Trajectory</div>
          <div class="flex flex-col">
            {trajectory.map((item, i) => (
              <div class:list={['grid [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] gap-x-6 gap-y-1 py-[14px]', i < trajectory.length - 1 && 'border-b border-border-subtle']}>
                <span class="font-mono text-[11.5px] text-muted">{item.range}</span>
                <div class="text-[15.5px] font-medium">{item.role}</div>
              </div>
            ))}
          </div>
        </div>

        <div class="border-t border-border pt-[26px]">
          <div class="font-mono text-[11px] text-muted tracking-[.14em] uppercase mb-4">Day to day</div>
          <div class="flex flex-wrap gap-2 font-mono text-[11.5px]">
            {stack.map((tag) => (
              <span class="px-[11px] py-[6px] border border-border rounded-md text-muted">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section class="py-[clamp(36px,5vw,60px)] border-t border-border">
      <div class="flex items-baseline justify-between gap-5 flex-wrap mb-[22px]">
        <div>
          <div class="font-mono text-[12px] text-accent tracking-[.06em] mb-2.5">/contributions</div>
          <h2 class="m-0 text-[clamp(24px,2.8vw,30px)] tracking-[-.025em] font-semibold">Contribution board</h2>
        </div>
        <span class="font-mono text-[11.5px] text-muted">{formatMonthYear(from)} — {formatMonthYear(to)}</span>
      </div>
      <ContributionBoard weeks={weeks} from={from} to={to} totalContributions={totalContributions} />
    </section>

    <section class="pt-[clamp(36px,5vw,60px)] pb-6 border-t border-border">
      <div class="font-mono text-[11px] text-muted tracking-[.14em] uppercase mb-4">dragonfoxsl/dragonfoxsl · README.md</div>
      <div class="border border-border rounded-xl overflow-hidden">
        <SpaceScene />
      </div>
    </section>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Verify the build**

```bash
npm run build
```

Expected: build succeeds; `dist/about/index.html` contains the bio copy, a
53-week contribution board, and the space scene markup.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "Build the /about page with identity, trajectory, contribution board, and space scene"
```

---

### Task 12: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm run build`, `npm test` (Task 1), a repo secret named
  `GH_PAT` holding a GitHub PAT with public read access

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  schedule:
    - cron: '17 3 * * *'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PAT }}
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deploy workflow with scheduled rebuilds"
```

- [ ] **Step 3: Manual follow-up (not a git step — do this in the GitHub UI
  once the repo is pushed)**

1. Create the `dragonfoxsl.github.io` repo on GitHub (public), push this
   local repo to it.
2. In repo Settings → Secrets and variables → Actions, add a secret named
   `GH_PAT` containing a GitHub PAT (no extra scopes needed — public read
   access is enough for both the REST repos endpoint and the GraphQL
   contribution calendar of a public account).
3. In repo Settings → Pages, set Source to "GitHub Actions".

---

### Task 13: Final manual QA pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite and a clean build**

```bash
npm test
npm run build
npm run preview
```

- [ ] **Step 2: Open `http://localhost:4321` (or the port `preview` reports)
  and check each page against the handoff**

- `/` — hero copy matches exactly, status panel shows all 5 rows with
  `on_call: available` in `signal` green, repo grid shows up to 6 cards.
- `/checks` — count strip shows the real repo/star counts (not `15`/`263`
  unless those happen to still be accurate), every row links out with
  `target="_blank" rel="noopener"`.
- `/about` — avatar loads, stats strip shows real repo/star counts, trajectory
  and stack sections match, contribution board renders 53 columns and scrolls
  horizontally on a narrow viewport instead of squashing, space scene animates
  (verify it stops animating with `prefers-reduced-motion: reduce` enabled in
  devtools).
- All three pages: keyboard-tab through every link and confirm the 2px accent
  focus ring appears; resize the window narrow and confirm the header wraps
  to two lines instead of overlapping.

- [ ] **Step 3: Fix anything that doesn't match, re-run Step 1, then commit
  any fixes**

```bash
git add -A
git commit -m "Fix visual QA findings against the design handoff"
```

(Skip this commit if Step 2 found nothing to fix.)

---

## Self-Review Notes

- **Spec coverage:** every handoff section has a task — tokens (Task 1),
  atmosphere layer (Task 4), header/footer/nav (Task 4), status panel (Task
  5), repo card/row (Task 6), home/checks/about pages (Tasks 7/8/11),
  contribution board + quantile data (Tasks 2/9), space scene (Task 10),
  accessibility fixes (folded into Tasks 4/6/9 rather than a separate task,
  since each fix belongs to the component that needs it), real routing (Tasks
  7/8/11 are real `.astro` pages, not a client-side switch), deploy (Task 12).
  The static SVG/PNG export for the `dragonfoxsl/dragonfoxsl` README repo is
  explicitly out of scope per the design spec and is not a task here.
- **Type consistency:** `Repo` (Task 3) is consumed identically by `RepoCard`/
  `RepoRow` (Task 6) and both page tasks. `Week`/`Day`/`levelColor` (Task 2)
  match `ContributionBoard`'s props (Task 9) and `about.astro`'s usage (Task
  11). `getContributionDays` return shape (`{ days, from, to }`) matches how
  `about.astro` destructures it.
- **No placeholders:** every step has complete, runnable code — no "add
  appropriate styling" or "similar to Task N" steps.
