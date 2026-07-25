import { describe, it, expect, vi, afterEach } from 'vitest';
import { mapRepo, getRepos, getContributionDays, getUser } from './github';

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

describe('getUser', () => {
  it('maps the GitHub user response to followers/following/createdAt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          login: 'dragonfoxsl',
          followers: 4,
          following: 5,
          created_at: '2017-01-01T00:00:00Z',
        }),
      })
    );

    const user = await getUser('fake-token');

    expect(user).toEqual({
      followers: 4,
      following: 5,
      createdAt: '2017-01-01T00:00:00Z',
    });
  });

  it('throws when the GitHub API responds with a non-OK status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(getUser('fake-token')).rejects.toThrow('404');
  });
});
