# dragonfoxsl.github.io

Personal site for Bisina Keshara — DevOps technical lead. Three pages
(`/`, `/checks`, `/about`) built with Astro and Tailwind CSS, fetching
repository and contribution data from GitHub at build time.

## Development

```bash
npm install
echo "GITHUB_TOKEN=<a github PAT with public read access>" > .env
npm run dev
```

Other commands:

```bash
npm test       # run the unit test suite (Vitest)
npm run build  # production build to dist/
npm run preview
```

`GITHUB_TOKEN` is required for `dev` and `build` — the site fetches your
public repos, contribution calendar, and profile stats live and fails the
build if the token is missing.

## Deployment

Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to `main`,
on a nightly schedule (to keep the contribution graph fresh), and on manual
dispatch. Requires a `GH_PAT` repository secret (public read access) and
Pages set to deploy from GitHub Actions.
