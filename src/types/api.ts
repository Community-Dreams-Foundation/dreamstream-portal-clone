/**
 * API Types
 * 
 * This file contains TypeScript interfaces for API requests and responses
 * to improve type safety throughout the application.
 */

// Task related types
export interface TaskCreateData {
  title: string;
  description: string;
  dueDate?: number;
  priority?: 'high' | 'medium' | 'low';
  assignedTo?: string;
  labels?: string[];
  parentTaskId?: string;
}

export interface TaskUpdateData {
  taskId: string;
  title?: string;
  description?: string;
  dueDate?: number;
  priority?: 'high' | 'medium' | 'low';
  assignedTo?: string;
  labels?: string[];
  status?: string;
}

export interface TaskStatusUpdateData {
  taskId: string;
  status: string;
}

export interface TaskTimerUpdateData {
  taskId: string;
  timeSpent: number;
  isRunning?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  priority: 'high' | 'medium' | 'low';
  status: string;
  assignedTo?: string;
  labels?: string[];
  timeSpent?: number;
  isTimerRunning?: boolean;
  parentTaskId?: string;
  subtasks?: Task[];
}

// Training related types
export interface TrainingModuleProgress {
  userId: string;
  moduleId: number;
  progress: number;
  completed: boolean;
  lastUpdated?: number;
}

export interface TrainingModule {
  id: number;
  title: string;
  description: string;
  progress: number;
  duration: number;
  completed: boolean;
  image?: string;
  sections?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

// Portfolio related types
export interface PortfolioData {
  userId: string;
  metadata: {
    title: string;
    description: string;
    lastUpdated: number;
    format: "linkedin" | "github" | "website";
    visibility: "public" | "private";
  };
  items: Array<{
    id: string;
    title: string;
    description: string;
    impact: {
      timeEfficiency: number;
      tasksCompleted: number;
      efficiency: number;
    };
    metrics: {
      avgCompletionTime: number;
      tasksAheadOfSchedule: number;
      totalTasks: number;
    };
    skills: string[];
    achievements: string[];
    createdAt: number;
    updatedAt: number;
    projectHighlights: string[];
  }>;
  metrics: {
    tasksCompleted: number;
    efficiency: number;
    timesSaved: number;
    impactScore: number;
  };
  preferences: {
    template: "default" | "minimal" | "detailed";
    primaryColor: string;
    showMetrics: boolean;
    selectedItems: string[];
  };
}

export interface PortfolioShareData {
  userId: string;
  portfolioId: string;
  platform: "linkedin" | "github" | "twitter" | "email";
  recipients?: string[];
  message?: string;
}

// Communication related types
export interface MessageData {
  content: string;
  threadId?: string;
  receiverId?: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    quote?: boolean;
  };
  attachments?: Array<{
    type: 'image' | 'link' | 'file' | 'chart' | 'audio';
    url: string;
    name: string;
    previewUrl?: string;
    mimeType?: string;
    size?: number;
    durationInSeconds?: number;
  }>;
}

export interface MessageQueryParams {
  threadId?: string;
  userId?: string;
  limit?: number;
  before?: number;
  after?: number;
}

export interface ConnectionData {
  userId: string;
  connectionId: string;
  status?: 'pending' | 'connected' | 'blocked';
}

// Performance related types
export interface PerformanceMetricsData {
  taskCompletionRate: number;
  avgTaskTime: number;
  delegationEfficiency: number;
  feedbackScore: number;
  efficiency: number;
  totalTasks: number;
  tasksThisWeek: number;
  averageTaskTime: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  leaderboardRank: number;
  totalParticipants: number;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    earnedAt: number;
  }>;
  goals: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    type: "tasks" | "efficiency" | "views";
    deadline: number;
    createdAt: number;
  }>;
  weeklyTasks: Array<{
    name: string;
    tasks: number;
  }>;
  feedback: Array<{
    id: string;
    text: string;
    rating: number;
    date: number;
    author: string;
    role: string;
    givenAt: number;
  }>;
  portfolioAnalytics: {
    views: Array<{
      timestamp: number;
      value: number;
    }>;
    uniqueVisitors: number;
    sectionEngagement: Array<{
      sectionId: string;
      sectionName: string;
      viewDuration: number;
      clicks: number;
    }>;
    platformPerformance: {
      linkedin: {
        shares: number;
        clicks: number;
        impressions: number;
      };
      github: {
        stars: number;
        forks: number;
        views: number;
      };
    };
    clickThroughRate: number;
  };
}

export interface PerformanceGoalsData {
  userId: string;
  goals: Array<{
    id?: string;
    title: string;
    target: number;
    type: "tasks" | "efficiency" | "views";
    deadline: number;
  }>;
}

// Payment related types
export interface PaymentData {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceData {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  createdAt: number;
  dueDate: number;
  paidAt?: number;
  items: Array<{
    description: string;
    amount: number;
    quantity: number;
  }>;
}

export interface PaymentMethodData {
  userId: string;
  type: 'card' | 'bank' | 'paypal';
  details: Record<string, unknown>;
  isDefault: boolean;
}

// Admin related types
export interface UserRoleData {
  userId: string;
  role: 'member' | 'admin' | 'super_admin';
}

export interface WaiverData {
  id: string;
  userId: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
  comments?: string;
  metadata?: Record<string, unknown>;
}

// Leadership related types
import { LeadershipTier, LeadershipDomain } from "@/types/leadership";

export interface LeadershipProfileData {
  userId: string;
  currentTier: LeadershipTier;
  joinedAt: number;
  assessments: any[];
  trainingCompleted: any[];
  teamId?: string;
  metrics: {
    teamSize: number;
    projectsManaged: number;
    avgTeamEfficiency: number;
    taskCompletionRate: number;
    teamSatisfactionScore: number;
    overallScore: number; // Required field
    leaderboardRank: number; // Required field
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
  mentors?: string[];
  mentees?: string[];
  specializations: LeadershipDomain[];
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

export interface PromotionRequirementsData {
  currentTier: string;
  targetTier: string;
  requirements: Array<{
    id: string;
    description: string;
    isMet: boolean;
    progress?: number;
    total?: number;
  }>;
  timeInCurrentTier: number;
  requiredTimeInTier: number;
  eligibleForPromotion: boolean;
}

export interface PromotionRequestData {
  userId: string;
  currentTier: string;
  targetTier: string;
  justification: string;
  achievements: string[];
  supportingDocuments?: string[];
}

// Account related types
export interface SessionData {
  id: string;
  userId: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  location?: {
    city?: string;
    country?: string;
    ip: string;
  };
  lastActive: number;
  createdAt: number;
  isCurrentSession: boolean;
}

export interface ActivityLogData {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'password_change' | 'profile_update' | 'mfa_enabled' | 'mfa_disabled' | 'email_change' | 'login_failed';
  timestamp: number;
  ipAddress: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  metadata?: Record<string, unknown>;
}

export interface SecuritySettingsData {
  userId: string;
  mfaEnabled: boolean;
  recoveryEmail?: string;
  sessionTimeout?: number;
  lastPasswordChange?: number;
  passwordExpiryDays?: number;
  loginNotifications: boolean;
}

export interface UserDataExportData {
  profile: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    phoneNumber?: string;
    createdAt: number;
    lastLogin?: number;
  };
  securitySettings: SecuritySettingsData;
  activityLog: ActivityLogData[];
  sessions: SessionData[];
}
