
export type ChallengeType = "team" | "individual" | "mentorship";
export type RewardTier = "bronze" | "silver" | "gold" | "platinum";

export interface TeamChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  startDate: number;
  endDate: number;
  participants: string[];
  teamSize: number;
  rewards: {
    tier: RewardTier;
    points: number;
    badges: string[];
  };
  objectives: {
    id: string;
    description: string;
    progress: number;
    target: number;
    completed: boolean;
  }[];
  status: "upcoming" | "active" | "completed";
}

export interface GamificationProfile {
  userId: string;
  level: number;
  points: number;
  badges: string[];
  challengesCompleted: number;
  teamContributions: number;
  currentStreak: number;
  longestStreak: number;
  rewards: {
    tier: RewardTier;
    unlockedAt: number;
    benefits: string[];
  }[];
}
