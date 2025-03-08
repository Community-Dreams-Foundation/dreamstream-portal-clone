
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ExperienceProgress } from "@/components/dashboard/metrics/ExperienceProgress"
import { Trophy, Medal, Star, Target, Users } from "lucide-react"
import type { GamificationProfile as ProfileType } from "@/types/gamification"

interface GamificationProfileProps {
  profile: ProfileType;
}

export function GamificationProfile({ profile }: GamificationProfileProps) {
  const getRewardTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "text-amber-700 bg-amber-100";
      case "silver": return "text-gray-500 bg-gray-100";
      case "gold": return "text-yellow-500 bg-yellow-100";
      case "platinum": return "text-indigo-600 bg-indigo-100";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Gamification Profile
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Level {profile.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges ({profile.badges.length})</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <ExperienceProgress 
              level={profile.level}
              experience={profile.points}
              experienceToNextLevel={profile.level * 1000}
            />
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Challenges Completed</p>
                <p className="text-lg font-semibold">{profile.challengesCompleted}</p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Team Contributions</p>
                <p className="text-lg font-semibold">{profile.teamContributions}</p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-lg font-semibold">{profile.currentStreak} days</p>
              </Card>
              <Card className="p-3">
                <p className="text-sm text-muted-foreground">Longest Streak</p>
                <p className="text-lg font-semibold">{profile.longestStreak} days</p>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {profile.badges.map((badge, index) => (
                <Badge
                  key={index}
                  className="flex items-center gap-1 p-2 h-auto justify-center"
                  variant="secondary"
                >
                  <Medal className="h-3 w-3" />
                  {badge}
                </Badge>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-4">
            {profile.rewards.map((reward, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{reward.tier.charAt(0).toUpperCase() + reward.tier.slice(1)} Tier</p>
                    <p className="text-sm text-muted-foreground">
                      Unlocked {new Date(reward.unlockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getRewardTierColor(reward.tier)}`}>
                    {reward.tier}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Benefits:</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {reward.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
