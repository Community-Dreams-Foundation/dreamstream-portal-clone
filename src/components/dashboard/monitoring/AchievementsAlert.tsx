
import { Trophy, Star, Award } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  earned: boolean
  description: string
  category?: "leadership" | "technical" | "mentorship" | "innovation"
  earnedAt?: number
}

interface AchievementsAlertProps {
  achievements: Achievement[]
}

export function AchievementsAlert({ achievements }: AchievementsAlertProps) {
  const [showAll, setShowAll] = useState(false)
  const earnedAchievements = achievements.filter(achievement => achievement.earned)

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "leadership":
        return "bg-blue-500/10 text-blue-500"
      case "technical":
        return "bg-green-500/10 text-green-500"
      case "mentorship":
        return "bg-purple-500/10 text-purple-500"
      case "innovation":
        return "bg-orange-500/10 text-orange-500"
      default:
        return "bg-primary/10 text-primary"
    }
  }

  return (
    <Alert variant="default" className="relative">
      <Trophy className="h-5 w-5 text-primary" />
      <AlertTitle className="text-lg font-semibold mb-2">Leadership Achievements</AlertTitle>
      <AlertDescription className="space-y-4">
        <div className="grid gap-2 md:grid-cols-2">
          {earnedAchievements.slice(0, showAll ? undefined : 4).map(achievement => (
            <Badge 
              key={achievement.id} 
              variant="secondary"
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 text-sm justify-between",
                getCategoryColor(achievement.category)
              )}
            >
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span>{achievement.name}</span>
              </div>
              {achievement.earnedAt && (
                <span className="text-xs opacity-70">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              )}
            </Badge>
          ))}
        </div>
        
        {earnedAchievements.length > 4 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary hover:text-primary/80"
          >
            {showAll ? 'Show Less' : `Show ${earnedAchievements.length - 4} More`}
          </Button>
        )}

        <Card className="mt-4 p-4 bg-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{earnedAchievements.length} achievements earned</span>
            </div>
            <div className="flex gap-2">
              {["leadership", "technical", "mentorship", "innovation"].map(category => {
                const count = earnedAchievements.filter(a => a.category === category).length
                if (count === 0) return null
                return (
                  <Badge 
                    key={category}
                    variant="secondary" 
                    className={cn("text-xs", getCategoryColor(category))}
                  >
                    {count} {category}
                  </Badge>
                )
              })}
            </div>
          </div>
        </Card>
      </AlertDescription>
    </Alert>
  )
}
