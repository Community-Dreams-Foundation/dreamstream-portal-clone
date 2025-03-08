
import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Award } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { LeadershipDomain } from "@/types/leadership"

interface Challenge {
  id: string
  title: string
  description: string
  domain: LeadershipDomain
  reward: {
    points: number
    badge?: string
  }
  progress: number
  deadline: number
}

const exampleChallenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Efficiency Master",
    description: "Maintain team efficiency above 90% for one week",
    domain: "strategy",
    reward: {
      points: 1000,
      badge: "Efficiency Expert"
    },
    progress: 65,
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000
  },
  {
    id: "challenge-2",
    title: "Innovation Champion",
    description: "Successfully implement 3 innovative solutions",
    domain: "product-design",
    reward: {
      points: 1500,
      badge: "Innovation Pioneer"
    },
    progress: 33,
    deadline: Date.now() + 14 * 24 * 60 * 60 * 1000
  }
]

export function LeadershipChallenges() {
  const [activeChallenges] = React.useState<Challenge[]>(exampleChallenges)
  const { toast } = useToast()

  const claimReward = (challenge: Challenge) => {
    if (challenge.progress < 100) {
      toast({
        title: "Challenge Incomplete",
        description: "Complete the challenge to claim your reward",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Reward Claimed!",
      description: `You've earned ${challenge.reward.points} points${challenge.reward.badge ? ` and the ${challenge.reward.badge} badge` : ''}!`
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Leadership Challenges</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Total Points: 2500
        </Badge>
      </div>

      <div className="grid gap-4">
        {activeChallenges.map((challenge) => (
          <Card key={challenge.id} className="p-4">
            <div className="space-y-4">
              <div className="flex items
-start justify-between">
                <div>
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="outline">{challenge.domain}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{challenge.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span>{challenge.reward.points} points</span>
                  {challenge.reward.badge && (
                    <>
                      <Award className="h-4 w-4 ml-2" />
                      <span>{challenge.reward.badge}</span>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  onClick={() => claimReward(challenge)}
                  disabled={challenge.progress < 100}
                >
                  Claim Reward
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                Deadline: {new Date(challenge.deadline).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
