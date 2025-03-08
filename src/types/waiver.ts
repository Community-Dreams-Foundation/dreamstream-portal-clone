
export type WaiverType = "leadership" | "sweat-equity" | "competition" | "hardship" | "referral";

export type WaiverStatus = "pending" | "approved" | "rejected";

export interface WaiverRequest {
  waiver_id: string;
  user_id: string;
  type: WaiverType;
  status: WaiverStatus;
  submitted_at: string;
  recruit_count?: number;
  approved_duration?: string | null;
  review_comments?: string;
}

export interface WaiverStats {
  pending: number;
  approved: number;
  rejected: number;
}
