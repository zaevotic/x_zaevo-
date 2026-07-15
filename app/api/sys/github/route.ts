import { NextResponse } from "next/server";

const GQL = `
  query($login: String!) {
    user(login: $login) {
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
        commitContributionsByRepository(maxRepositories: 5) {
          repository {
            name
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 3) {
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
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: GQL, variables: { login: "zaevotic" } }),
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

    return NextResponse.json({
      total: calendar.totalContributions,
      weeks: calendar.weeks,
      commits: commits.slice(0, 4),
    });
  } catch (err) {
    console.error("GitHub unreachable:", err);
    return NextResponse.json(
      { error: "Couldn't steal GitHub data" },
      { status: 500 },
    );
  }
}
