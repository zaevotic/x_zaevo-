import { NextResponse } from "next/server";

const REPO_FRAGMENT = `
  name
  description
  url
  stargazerCount
  pushedAt
  primaryLanguage {
    name
  }
  languages(first: 3, orderBy: { field: SIZE, direction: DESC }) {
    nodes {
      name
    }
  }
  repositoryTopics(first: 3) {
    nodes {
      topic {
        name
      }
    }
  }
`;

const GQL = `
  query($login: String!) {
    user(login: $login) {
      pinnedItems(first: 6, types: [REPOSITORY]) {
        nodes {
          ... on Repository {
            ${REPO_FRAGMENT}
          }
        }
      }
      repositories(
        first: 12
        ownerAffiliations: [OWNER]
        isFork: false
        privacy: PUBLIC
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          ${REPO_FRAGMENT}
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
        commitContributionsByRepository(maxRepositories: 100) {
          repository {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 10) {
                    nodes {
                      messageHeadline
                      committedDate
                      abbreviatedOid
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME || "zaevotic";

    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: GQL, variables: { login: username } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`GQL returned ${res.status}`);

    const { data } = await res.json();
    const collection = data.user.contributionsCollection;
    const calendar = collection.contributionCalendar;

    // Flatten commits from all repos, sort by date, take the 4 most recent
    type Commit = { id: string; repo: string; message: string; date: string };
    const commits: Commit[] = [];

    for (const entry of collection.commitContributionsByRepository) {
      const repo = entry.repository.name;
      const nodes = entry.repository.defaultBranchRef?.target?.history?.nodes ?? [];
      for (const node of nodes) {
        commits.push({
          id: node.abbreviatedOid,
          repo,
          message: node.messageHeadline,
          date: node.committedDate,
        });
      }
    }

    commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Build top 5 repositories: pinned repos first, then top starred / recently pushed
    type RawRepo = {
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      pushedAt: string;
      primaryLanguage?: { name: string } | null;
      languages?: { nodes: { name: string }[] };
      repositoryTopics?: { nodes: { topic: { name: string } }[] };
    };

    const pinnedNodes: RawRepo[] = (data.user.pinnedItems?.nodes ?? []).filter(Boolean);
    const repoNodes: RawRepo[] = [...(data.user.repositories?.nodes ?? [])].sort(
      (a, b) =>
        b.stargazerCount - a.stargazerCount ||
        new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime(),
    );

    const seen = new Set<string>();
    const combinedRepos: RawRepo[] = [];

    for (const r of [...pinnedNodes, ...repoNodes]) {
      if (!r || !r.name) continue;
      if (r.name.toLowerCase() === username.toLowerCase()) continue;
      if (seen.has(r.name)) continue;
      seen.add(r.name);
      combinedRepos.push(r);
      if (combinedRepos.length === 5) break;
    }

    const repos = combinedRepos.map((r) => {
      const langs = r.languages?.nodes?.map((l) => l.name) ?? [];
      const topics = r.repositoryTopics?.nodes?.map((t) => t.topic.name) ?? [];
      const stack = Array.from(new Set([...langs, ...topics])).slice(0, 3);
      return {
        name: r.name,
        desc:
          r.description ||
          "Source repository on GitHub — systems, tooling & experiments.",
        url: r.url,
        stars: r.stargazerCount ?? 0,
        primaryLanguage: r.primaryLanguage?.name ?? null,
        stack: stack.length > 0 ? stack : ["code"],
      };
    });

    return NextResponse.json({
      total: calendar.totalContributions,
      weeks: calendar.weeks,
      commits: commits.slice(0, 4),
      repos,
    });
  } catch (err) {
    console.error("GitHub unreachable:", err);
    return NextResponse.json(
      { error: "Couldn't steal GitHub data" },
      { status: 500 },
    );
  }
}
