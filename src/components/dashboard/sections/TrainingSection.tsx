
import { Card } from "@/components/ui/card"
import { TrainingModules } from "@/components/dashboard/TrainingModules"
import { KnowledgeGraph } from "@/components/dashboard/cos-agent/KnowledgeGraph"
import { TeamChallengesBoard } from "@/components/dashboard/gamification/TeamChallengesBoard"
import { GamificationProfile } from "@/components/dashboard/gamification/GamificationProfile"
import { Leaderboard } from "@/components/dashboard/gamification/Leaderboard"
import { BadgeShowcase } from "@/components/dashboard/gamification/BadgeShowcase"
import { useGamification } from "@/hooks/useGamification"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import type { TeamChallenge } from "@/types/gamification"

interface TrainingSectionProps {
  knowledgeData: any;
  challenges: TeamChallenge[];
}

export function TrainingSection({ knowledgeData, challenges }: TrainingSectionProps) {
  const { currentUser } = useAuth();
  const { profile, leaderboard, joinChallenge, addPoints, checkStreak } = useGamification();
  const { toast } = useToast();

  const mockBadges = [
    {
      id: "1",
      name: "Fast Learner",
      description: "Complete 5 training modules in a week",
      icon: "trophy" as const,
      category: "achievement" as const,
      earnedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      isUnlocked: true
    },
    {
      id: "2",
      name: "Team Player",
      description: "Participate in 3 team challenges",
      icon: "medal" as const,
      category: "participation" as const,
      earnedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      isUnlocked: true
    },
    {
      id: "3",
      name: "Knowledge Master",
      description: "Add 10 connections to the knowledge graph",
      icon: "award" as const,
      category: "skill" as const,
      isUnlocked: false
    },
    {
      id: "4",
      name: "Streak Keeper",
      description: "Maintain a 7-day activity streak",
      icon: "star" as const,
      category: "special" as const,
      isUnlocked: profile?.currentStreak >= 7
    },
    {
      id: "5",
      name: "Challenge Winner",
      description: "Win a team challenge",
      icon: "trophy" as const,
      category: "achievement" as const,
      isUnlocked: false
    }
  ];

  const handleJoinChallenge = (challengeId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join challenges",
        variant: "destructive",
      });
      return;
    }
    
    joinChallenge(challengeId);
  };

  const handleCheckIn = () => {
    if (!currentUser) return;
    
    checkStreak();
    addPoints(10, "Daily check-in");
  };

  return (
    <div className="md:col-span-2 space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleCheckIn}>
          Daily Check-in
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {profile && (
          <GamificationProfile profile={profile} />
        )}
        {leaderboard && (
          <Leaderboard 
            individuals={leaderboard.individuals}
            teams={leaderboard.teams}
            userId={currentUser?.uid}
          />
        )}
      </div>
      
      <Card className="p-6">
        <TrainingModules />
      </Card>
      
      <Card className="p-6">
        <KnowledgeGraph data={knowledgeData} />
      </Card>
      
      <Card className="p-6">
        <TeamChallengesBoard 
          challenges={challenges}
          onJoinChallenge={handleJoinChallenge}
        />
      </Card>
      
      <Card className="p-6">
        <BadgeShowcase badges={mockBadges} />
      </Card>
    </div>
  );
}
