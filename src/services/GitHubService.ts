
import { GitHubContent } from "@/types/portfolio";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubService {
  private token: string | null;

  constructor(token?: string) {
    this.token = token || null;
  }

  private async fetchGitHub(endpoint: string) {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json'
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getPortfolioContent(username: string, repo: string): Promise<GitHubContent> {
    // Get README content
    const readmeResponse = await this.fetchGitHub(`/repos/${username}/${repo}/readme`);
    const readmeContent = atob(readmeResponse.content);

    // Get repository details for the portfolio page
    const repoResponse = await this.fetchGitHub(`/repos/${username}/${repo}`);

    // Generate a simple portfolio page from repo data
    const portfolioPage = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${repoResponse.name} - Portfolio</title>
        </head>
        <body>
          <h1>${repoResponse.name}</h1>
          <p>${repoResponse.description || ''}</p>
          <div>
            <h2>Repository Details</h2>
            <ul>
              <li>Stars: ${repoResponse.stargazers_count}</li>
              <li>Language: ${repoResponse.language}</li>
              <li>Last Updated: ${new Date(repoResponse.updated_at).toLocaleDateString()}</li>
            </ul>
          </div>
        </body>
      </html>
    `;

    return {
      readmeContent,
      portfolioPage,
      repositoryName: repo,
      commitMessage: `Update portfolio content - ${new Date().toISOString()}`
    };
  }
}

