
export interface VisaStatus {
  type: string;
  expiryDate: number;
  remainingDays: number;
  documents: Array<{
    name: string;
    status: "valid" | "expiring" | "expired";
    expiryDate?: number;
    category: "primary" | "supporting" | "optional";
    uploadedAt?: number;
    fileUrl?: string;
    notes?: string;
    metadata?: {
      fileSize?: number;
      fileType?: string;
      lastModified?: number;
    };
  }>;
  nextSteps: Array<{
    id: string;
    description: string;
    deadline: number;
    completed: boolean;
    requiredDocuments?: string[];
  }>;
}

export type DocumentCategory = "primary" | "supporting" | "optional";
export type DocumentStatus = "valid" | "expiring" | "expired";

export interface DocumentUpload {
  file: File;
  category: DocumentCategory;
  notes?: string;
}

