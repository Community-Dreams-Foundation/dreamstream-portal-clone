
export interface CostMetrics {
  hourlyRate: number;
  totalCost: number;
  remainingBudget: number;
  costEfficiencyScore: number;
  thresholdAlerts: ThresholdAlert[];
  costBreakdown: CostBreakdown;
}

export interface ThresholdAlert {
  id: string;
  type: "cost" | "time" | "resource";
  threshold: number;
  currentValue: number;
  status: "warning" | "critical" | "normal";
  createdAt: number;
}

export interface CostBreakdown {
  laborCost: number;
  toolingCost: number;
  overheadCost: number;
  date: number;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface CostApproval {
  id: string;
  taskId: string;
  requestedBy: string;
  amount: number;
  justification: string;
  status: ApprovalStatus;
  createdAt: number;
  updatedAt: number;
  approvedBy?: string;
  comments?: string[];
}
