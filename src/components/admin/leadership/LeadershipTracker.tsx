
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PerformanceMetrics } from "@/types/performance"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Users, Award } from "lucide-react"

interface LeadershipTrackerProps {
  metrics: PerformanceMetrics
}

export function LeadershipTracker({ metrics }: LeadershipTrackerProps) {
  const leadershipScore = Math.round((metrics.taskCompletionRate + metrics.delegationEfficiency + metrics.feedbackScore) / 3)
  const leaderboardPosition = metrics.leaderboardRank
  const totalParticipants = metrics.totalParticipants

  const achievements = metrics.achievements.slice(0, 3)
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Leadership Overview</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Leadership Score</span>
              <span className="text-sm text-muted-foreground">{leadershipScore}%</span>
            </div>
            <Progress value={leadershipScore} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Experience Level</p>
                <p className="text-xs text-muted-foreground">Level {metrics.level}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Leaderboard</p>
                <p className="text-xs text-muted-foreground">
                  #{leaderboardPosition} of {totalParticipants}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Recent Achievements</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-start gap-2">
                <div className="p-2 rounded-full bg-primary/10">
                  <Award className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
