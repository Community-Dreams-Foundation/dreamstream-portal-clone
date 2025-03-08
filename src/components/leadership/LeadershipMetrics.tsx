
import { useQuery } from "@tanstack/react-query"
import { getDatabase, ref, get } from "firebase/database"
import { useAuth } from "@/contexts/AuthContext"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Target, Star } from "lucide-react"
import { LeadershipProfile, LeadershipTier } from "@/types/leadership"
import { Badge } from "@/components/ui/badge"

const tierColors: Record<LeadershipTier, string> = {
  emerging: "bg-blue-500",
  captain: "bg-green-500",
  "team-lead": "bg-purple-500",
  "product-owner": "bg-orange-500",
  executive: "bg-red-500"
}

const tierNames: Record<LeadershipTier, string> = {
  emerging: "Emerging Leader",
  captain: "Captain",
  "team-lead": "Team Lead",
  "product-owner": "Product Owner",
  executive: "Executive"
}

export function LeadershipMetrics() {
  const { currentUser } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ['leadershipProfile', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null
      const db = getDatabase()
      const profileRef = ref(db, `users/${currentUser.uid}/leadership`)
      const snapshot = await get(profileRef)
      return snapshot.exists() ? snapshot.val() as LeadershipProfile : null
    },
    enabled: !!currentUser
  })

  if (!profile) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">No leadership data available yet.</p>
        </div>
      </Card>
    )
  }

  const { currentTier, metrics } = profile

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Leadership Development</h2>
            <p className="text-sm text-muted-foreground">
              Track your progress and achievements
            </p>
          </div>
          <Badge 
            className={`${tierColors[currentTier]} text-white`}
          >
            {tierNames[currentTier]}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{metrics.overallScore}</p>
            <Progress 
              value={metrics.overallScore} 
              className="mt-2"
            />
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <p className="text-sm text-muted-foreground">Team Impact</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{profile.metrics.mentorshipScore || 0}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <p className="text-sm text-muted-foreground">Innovation Impact</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">{profile.metrics.innovationImpact || 0}</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-500" />
              <p className="text-sm text-muted-foreground">Leaderboard Rank</p>
            </div>
            <p className="mt-1 text-2xl font-semibold">#{metrics.leaderboardRank}</p>
          </Card>
        </div>

        {profile.achievements.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Recent Achievements</h3>
            <div className="space-y-2">
              {profile.achievements.map((achievement) => (
                <Card key={achievement.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

