
import { Task, TaskInput } from "./task";

export type DocumentType = "project-charter" | "prd" | "execution-calendar" | "sprint-plan";

export interface DocumentMetadata {
  type: DocumentType;
  title: string;
  author: string;  
  createdAt: number;
  version: string;
  status: "draft" | "in-review" | "approved";
}

export interface ParsedDocument {
  id: string;
  metadata: DocumentMetadata;
  content: string;
  entities: {
    objectives: string[];
    deliverables: string[];
    dependencies: string[];
    risks: string[];
    skillRequirements: string[];
    stakeholders: string[];
    milestones: Array<{
      title: string;
      dueDate: number;
      description: string;
    }>;
  };
  nlpAnalysis: {
    complexity: number; // 0-100
    sentiment: number; // -1 to 1
    urgency: number; // 0-100
    technicalDensity: number; // 0-100
    businessImpact: number; // 0-100
  };
  suggestedTasks: TaskInput[];
  knowledgeGraphNodes: Array<{
    id: string;
    type: "task" | "skill" | "stakeholder" | "milestone" | "risk";
    label: string;
    properties: Record<string, any>;
  }>;
  knowledgeGraphRelationships: Array<{
    source: string;
    target: string;
    type: string;
    properties: Record<string, any>;
  }>;
}

export interface DocumentParsingConfig {
  maxTaskDuration: number; // in minutes
  autoSplitThreshold: number; // percentage of estimated time
  minTaskSize: number; // in minutes
  complexityThreshold: number; // 0-100, triggers auto-split recommendations
  requiresDependencyMapping: boolean;
  includeMetadataEnrichment: boolean;
  nlpOptions: {
    performSentimentAnalysis: boolean;
    extractTechnicalTerms: boolean;
    identifyStakeholders: boolean;
    calculateComplexity: boolean;
  };
}

export interface ParseDocumentResult {
  document: ParsedDocument;
  generatedTasks: Task[];
  warnings: string[];
  graphUpdateSummary: {
    nodesAdded: number;
    relationshipsCreated: number;
    entitiesIdentified: number;
  };
}

