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

  if (days.length === 0) throw new Error('GitHub contribution calendar returned no days');

  return { days, from: days[0].date, to: days[days.length - 1].date };
}
