
import { Medal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Achievement } from "@/types/performance";

interface AchievementsListProps {
  achievements: Achievement[];
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  if (!achievements.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Recent Achievements</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Medal className="h-4 w-4 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="font-medium">{achievement.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
