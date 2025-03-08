
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Award, ChevronUp } from "lucide-react"
import type { PortfolioItem } from "@/types/portfolio"

interface ProjectHighlightsProps {
  items: PortfolioItem[];
}

export function ProjectHighlights({ items }: ProjectHighlightsProps) {
  const sortedItems = useMemo(() => 
    [...items].sort((a, b) => b.impact.efficiency - a.impact.efficiency),
    [items]
  )

  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No project highlights available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Highlights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedItems.map((item) => (
          <article 
            key={item.id} 
            className="space-y-4 p-4 rounded-lg border bg-card transition-colors hover:bg-accent/5"
          >
            <header className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <div className="flex items-center gap-2">
                <ChevronUp className="text-green-500 h-4 w-4" />
                <span className="text-sm font-medium text-green-500">
                  {item.impact.efficiency}% efficiency
                </span>
              </div>
            </header>
            
            <p className="text-sm text-muted-foreground">{item.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Impact Score</span>
                <span className="font-medium">{item.impact.timeEfficiency}%</span>
              </div>
              <Progress value={item.impact.timeEfficiency} className="h-2" />
            </div>
            
            <footer className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              
              {item.achievements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Achievements</h4>
                  <ul className="space-y-1">
                    {item.achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {item.projectHighlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Project Impact</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {item.projectHighlights.map((highlight, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </footer>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
