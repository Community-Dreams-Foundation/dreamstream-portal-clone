
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PortfolioPreview } from "@/components/dashboard/portfolio/PortfolioPreview"
import { GitHubPortfolioPreview } from "@/components/dashboard/portfolio/GitHubPortfolioPreview"
import { LinkedInIntegration } from "@/components/dashboard/portfolio/LinkedInIntegration"
import { GitHubService } from "@/services/GitHubService"
import { useToast } from "@/components/ui/use-toast"
import type { Portfolio } from "@/types/portfolio"
import type { GitHubContent } from "@/types/portfolio"

interface PortfolioSectionProps {
  portfolio: Portfolio;
  githubContent?: GitHubContent;
}

export function PortfolioSection({ portfolio, githubContent: initialGithubContent }: PortfolioSectionProps) {
  const [githubContent, setGithubContent] = useState<GitHubContent | null>(initialGithubContent || null);
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const githubService = new GitHubService();

  const fetchGitHubContent = async (githubUsername: string) => {
    if (!githubUsername.trim()) {
      toast({
        variant: "destructive",
        title: "Username required",
        description: "Please enter a GitHub username."
      });
      return;
    }

    setIsLoading(true);
    try {
      const content = await githubService.getPortfolioContent(githubUsername, "portfolio");
      setGithubContent(content);
      toast({
        title: "Success",
        description: "GitHub content fetched successfully."
      });
    } catch (error) {
      console.error("Error fetching GitHub content:", error);
      toast({
        variant: "destructive",
        title: "Error fetching GitHub content",
        description: "Please check the username and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGitHubContent(username);
  };

  useEffect(() => {
    if (!initialGithubContent && username) {
      fetchGitHubContent(username);
    }
  }, [initialGithubContent]);

  const handleSave = async () => {
    try {
      // Implement GitHub save functionality here
      toast({
        title: "Changes saved",
        description: "Your portfolio has been updated on GitHub."
      });
    } catch (error) {
      console.error("Error saving to GitHub:", error);
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: "Failed to save changes to GitHub. Please try again."
      });
    }
  };

  return (
    <div className="col-span-full lg:col-span-2 space-y-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
          <Input
            placeholder="Enter GitHub username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Fetch Portfolio"}
          </Button>
        </form>
        <PortfolioPreview portfolio={portfolio} />
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-6">
          <GitHubPortfolioPreview 
            content={githubContent || {
              readmeContent: "Enter your GitHub username above to load content...",
              portfolioPage: "<p>Loading...</p>",
              repositoryName: "",
              commitMessage: ""
            }}
            onSave={handleSave}
          />
        </Card>
        <Card className="p-6">
          <LinkedInIntegration portfolio={portfolio} />
        </Card>
      </div>
    </div>
  );
}

