// Client-side cache & shared fetcher for GitHub data across panels
// Prevents duplicate requests and unifies loading transitions across GithubHeatmap, SystemLog, and FeaturedProjects

export interface GithubCalendarDay {
  contributionCount: number;
  date: string;
}

export interface GithubCalendarWeek {
  contributionDays: GithubCalendarDay[];
}

export interface GithubApiCommit {
  id: string;
  repo: string;
  message: string;
  date: string;
}

export interface GithubApiRepo {
  name: string;
  desc: string;
  url: string;
  stars: number;
  primaryLanguage: string | null;
  stack: string[];
}

export interface GithubApiResponse {
  total?: number;
  weeks?: GithubCalendarWeek[];
  commits?: GithubApiCommit[];
  repos?: GithubApiRepo[];
  error?: string;
}

let cachedData: GithubApiResponse | null = null;
let inFlightPromise: Promise<GithubApiResponse> | null = null;

export function getCachedGithubData(): GithubApiResponse | null {
  return cachedData;
}

export async function getSharedGithubData(): Promise<GithubApiResponse> {
  if (cachedData) {
    return cachedData;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = fetch("/api/sys/github")
    .then((res) => res.json())
    .then((data: GithubApiResponse) => {
      if (!data.error) {
        cachedData = data;
      }
      return data;
    })
    .catch((err) => {
      console.error("Failed to load GitHub data:", err);
      return { error: String(err) };
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}

