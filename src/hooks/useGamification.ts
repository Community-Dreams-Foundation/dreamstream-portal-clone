
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  fetchGamificationProfile,
  addPointsToUser,
  awardBadgeToUser,
  joinTeamChallenge,
  checkDailyStreak,
  fetchLeaderboard
} from "@/utils/gamificationUtils";

export function useGamification() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["gamificationProfile", currentUser?.uid],
    queryFn: () => fetchGamificationProfile(currentUser?.uid || ""),
    enabled: !!currentUser?.uid,
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => fetchLeaderboard(10),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const addPointsMutation = useMutation({
    mutationFn: ({ points, reason }: { points: number; reason: string }) => 
      addPointsToUser(currentUser?.uid || "", points, reason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gamificationProfile", currentUser?.uid] });
      
      if (result.levelUp) {
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${Math.floor(result.newTotal / 1000) + 1}`,
        });
      } else {
        toast({
          title: "Points Added",
          description: `You've earned ${result.newTotal} total points`,
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add points. Please try again.",
      });
      console.error("Failed to add points:", error);
    },
  });

  const awardBadgeMutation = useMutation({
    mutationFn: (badge: string) => awardBadgeToUser(currentUser?.uid || "", badge),
    onSuccess: (awarded, badge) => {
      if (awarded) {
        queryClient.invalidateQueries({ queryKey: ["gamificationProfile", currentUser?.uid] });
        toast({
          title: "Badge Earned!",
          description: `You've earned the ${badge} badge`,
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to award badge. Please try again.",
      });
      console.error("Failed to award badge:", error);
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: (challengeId: string) => joinTeamChallenge(currentUser?.uid || "", challengeId),
    onSuccess: (joined, challengeId) => {
      if (joined) {
        queryClient.invalidateQueries({ queryKey: ["teamChallenges"] });
        queryClient.invalidateQueries({ queryKey: ["gamificationProfile", currentUser?.uid] });
        toast({
          title: "Challenge Joined",
          description: "You've successfully joined the team challenge",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Could Not Join",
          description: "You may already be in this challenge or the team is full",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join challenge. Please try again.",
      });
      console.error("Failed to join challenge:", error);
    },
  });

  const checkStreakMutation = useMutation({
    mutationFn: () => checkDailyStreak(currentUser?.uid || ""),
    onSuccess: (streak) => {
      queryClient.invalidateQueries({ queryKey: ["gamificationProfile", currentUser?.uid] });
      if (streak > 0) {
        toast({
          title: "Daily Streak",
          description: `You're on a ${streak} day streak!`,
        });
      }
    },
  });

  return {
    profile,
    profileLoading,
    leaderboard,
    leaderboardLoading,
    addPoints: (points: number, reason: string) => addPointsMutation.mutate({ points, reason }),
    awardBadge: (badge: string) => awardBadgeMutation.mutate(badge),
    joinChallenge: (challengeId: string) => joinChallengeMutation.mutate(challengeId),
    checkStreak: () => checkStreakMutation.mutate(),
    isAddingPoints: addPointsMutation.isPending,
    isAwardingBadge: awardBadgeMutation.isPending,
    isJoiningChallenge: joinChallengeMutation.isPending,
  };
}
