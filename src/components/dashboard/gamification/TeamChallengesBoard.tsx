
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Target, Award } from "lucide-react"
import type { TeamChallenge } from "@/types/gamification"

interface TeamChallengesBoardProps {
  challenges: TeamChallenge[];
  onJoinChallenge?: (challengeId: string) => void;
}

export function TeamChallengesBoard({ challenges, onJoinChallenge }: TeamChallengesBoardProps) {
  const getStatusColor = (status: TeamChallenge["status"]) => {
    switch (status) {
      case "upcoming":
        return "text-blue-500 bg-blue-500/10";
      case "active":
        return "text-green-500 bg-green-500/10";
      case "completed":
        return "text-gray-500 bg-gray-500/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold">Team Challenges</h3>
        </div>
        <Badge variant="secondary" className="px-2 py-1">
          {challenges.filter(c => c.status === "active").length} Active
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h4 className="font-medium">{challenge.title}</h4>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
              <Badge className={getStatusColor(challenge.status)}>
                {challenge.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.participants.length}/{challenge.teamSize}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>
                    {challenge.objectives.filter(o => o.completed).length}/
                    {challenge.objectives.length} Goals
                  </span>
                </div>
              </div>

              {challenge.objectives.map((objective) => (
                <div key={objective.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{objective.description}</span>
                    <span className="text-muted-foreground">
                      {objective.progress}/{objective.target}
                    </span>
                  </div>
                  <Progress value={(objective.progress / objective.target) * 100} />
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {challenge.rewards.points} points
                  </span>
                </div>
                {challenge.status === "active" && onJoinChallenge && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onJoinChallenge(challenge.id)}
                  >
                    Join Challenge
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
