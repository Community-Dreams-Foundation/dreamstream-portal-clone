
import { Card, CardContent } from "@/components/ui/card"
import type { Portfolio } from "@/types/portfolio"

interface PortfolioTemplateProps {
  portfolio: Portfolio;
}

export function PortfolioTemplate({ portfolio }: PortfolioTemplateProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tighter">
            Professional Portfolio
          </h1>
          <p className="text-muted-foreground">
            Showcasing {portfolio.summary.totalProjects} completed projects with an average efficiency of {portfolio.summary.avgEfficiency}%
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Core Skills</h2>
          <div className="flex flex-wrap gap-2">
            {portfolio.summary.topSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Overall Impact</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Completed {portfolio.summary.overallImpact.tasksCompleted} tasks successfully</li>
            <li>Improved efficiency by {portfolio.summary.overallImpact.efficiencyImprovement}%</li>
            <li>Saved {portfolio.summary.overallImpact.timesSaved} minutes through optimization</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
