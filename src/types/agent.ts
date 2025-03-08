import { SimulationNodeDatum } from "d3";

export interface CoSPreferences {
  tone: "formal" | "casual";
  notificationFrequency: "high" | "medium" | "low";
  trainingFocus: string[];
  workloadThreshold: number; // hours per week
  delegationPreference: "aggressive" | "balanced" | "conservative";
  communicationStyle: "formal" | "casual";
  agentInteractionLevel: "high" | "medium" | "low";
  knowledgeDomains?: string[];
  aiFeatures?: {
    autoLearning: boolean;
    proactiveAssistance: boolean;
    contextAwareness: boolean;
  };
  portfolioIntegration?: {
    github?: boolean;
    linkedin?: boolean;
    personalWebsite?: boolean;
  };
  recruitmentPreferences?: {
    primaryRole: string;
    industries: string[];
    locationPreference: string;
    remotePreference: "remote" | "hybrid" | "onsite";
  };
  hasCompletedOnboarding?: boolean;
}

export interface KnowledgeNode extends SimulationNodeDatum {
  id: string;
  type: "skill" | "project" | "experience" | "connection";
  title: string;
  description: string;
  tags: string[];
  connections: string[]; // IDs of connected nodes
  strength: number; // 0-100
  lastAccessed: number;
  createdAt: number;
  metadata?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: Array<{
    source: string;
    target: string;
    type: "knows" | "uses" | "created" | "learned";
    strength: number;
  }>;
}

export interface RecruitmentStage {
  id: string;
  name: string;
  companies: Array<{
    id: string;
    name: string;
    status: "researching" | "applied" | "interviewing" | "offered" | "rejected";
    lastContact: number;
    notes: string;
    nextSteps?: string;
    probability?: number;
  }>;
  requirements: string[];
  timeline: {
    start: number;
    target: number;
    actual?: number;
  };
}

export interface RecruitmentFunnel {
  stages: RecruitmentStage[];
  metrics: {
    totalApplications: number;
    activeProcesses: number;
    successRate: number;
    averageTimeToOffer: number;
  };
}
