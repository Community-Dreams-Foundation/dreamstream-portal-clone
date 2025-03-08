export type LeadershipTier = "emerging" | "captain" | "team-lead" | "product-owner" | "executive";

export type LeadershipDomain = "strategy" | "product-design" | "data-engineering" | "software-development" | "engagement";

export interface LeadershipMetrics {
  assessmentId: string;
  userId: string;
  tier: LeadershipTier;
  averageTaskTime: number;
  tasksCompleted: number;
  delegationAccuracy: number;
  teamEfficiency: number;
  overallScore: number;
  feedback: string;
  timestamp: number;
  domainSpecificScores?: {
    [key in LeadershipDomain]?: number;
  };
  mentorshipScore?: number;
  communicationScore?: number;
  innovationScore?: number;
  competitiveScore?: number;
  resourceOptimization?: number;
  strategicImpact?: number;
  crossTeamCollaboration?: number;
  costEfficiency?: number;
}

export interface LeadershipAssessment {
  id: string;
  userId: string;
  projectId: string;
  startDate: number;
  endDate: number;
  metrics: LeadershipMetrics;
  status: "in-progress" | "completed";
  simulationScore?: number;
  mentorFeedback?: {
    mentorId: string;
    rating: number;
    comments: string;
    timestamp: number;
    areas?: {
      technicalSkills?: number;
      leadership?: number;
      communication?: number;
      innovation?: number;
      teamwork?: number;
    };
  }[];
  challengeResults?: {
    challengeId: string;
    score: number;
    rank: number;
    feedback: string;
    completedAt: number;
  }[];
}

export interface Team {
  id: string;
  domain: LeadershipDomain;
  captainId: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: number;
  performance?: {
    averageTaskCompletion: number;
    teamEfficiency: number;
    innovationScore: number;
    collaborationRate: number;
    communicationScore?: number;
    projectSuccessRate?: number;
    costOptimization?: number;
    crossTeamProjects?: number;
    resourceUtilization?: number;
    competitiveChallenges?: {
      participated: number;
      won: number;
      averageRank: number;
    };
  };
}

export interface LeadershipTraining {
  id: string;
  userId: string;
  moduleName: string;
  completionDate: number;
  score: number;
  certificationEarned: boolean;
  feedback?: string;
  mentorId?: string;
  moduleType: "technical" | "soft-skills" | "management" | "strategy" | "simulation";
  requiredForPromotion?: boolean;
  simulationData?: {
    scenarioType: string;
    decisions: Array<{
      timestamp: number;
      decision: string;
      outcome: string;
      impact: number;
    }>;
    performanceMetrics: {
      decisionQuality: number;
      timeManagement: number;
      resourceAllocation: number;
      teamSatisfaction: number;
    };
  };
}

export interface LeadershipProfile {
  userId: string;
  currentTier: LeadershipTier;
  joinedAt: number;
  assessments: LeadershipAssessment[];
  trainingCompleted: LeadershipTraining[];
  teamId?: string;
  metrics: {
    teamSize: number;
    projectsManaged: number;
    avgTeamEfficiency: number;
    taskCompletionRate: number;
    teamSatisfactionScore: number;
    overallScore: number;
    leaderboardRank: number;
    mentorshipScore?: number;
    innovationImpact?: number;
    communicationScore?: number;
    projectDeliveryRate?: number;
    teamGrowthRate?: number;
    teamEfficiency?: number;
  };
  skills: Array<{
    name: string;
    level: number;
    endorsed: number;
  }>;
  teams: string[];
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    earnedAt: number;
    category?: "leadership" | "technical" | "innovation" | "mentorship";
  }>;
  mentors: string[];
  mentees: string[];
  specializations?: LeadershipDomain[];
  promotionHistory?: Array<{
    fromTier: LeadershipTier;
    toTier: LeadershipTier;
    timestamp: number;
    approvedBy?: string;
  }>;
  mentorshipPreferences?: {
    availableAsMentor?: boolean;
    seekingMentor?: boolean;
    preferredMentorshipAreas?: string[];
  };
  displaySettings?: {
    showAchievements?: boolean;
    showMetrics?: boolean;
  };
}

export interface PromotionRequest {
  id: string;
  userId: string;
  currentTier: LeadershipTier;
  requestedTier: LeadershipTier;
  metrics: LeadershipMetrics;
  status: "pending" | "approved" | "rejected";
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  feedback?: string;
  requirements?: {
    trainingModules: string[];
    minimumMetrics: Partial<LeadershipMetrics>;
    timeInCurrentTier: number;
    mentorshipRequired: boolean;
  };
}
