
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { PersonalGoal } from "@/types/performance"

interface PersonalGoalsListProps {
  goals: PersonalGoal[];
}

export function PersonalGoalsList({ goals }: PersonalGoalsListProps) {
  if (goals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Personal Goals</h4>
      <div className="space-y-2">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.title}</span>
                  <Badge variant="secondary">
                    {goal.current} / {goal.target}
                  </Badge>
                </div>
                <Progress 
                  value={(goal.current / goal.target) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

