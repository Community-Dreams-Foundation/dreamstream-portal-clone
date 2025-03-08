
import React from "react";
import { DocumentParsingEngine } from "@/components/tasks/document-parsing";
import { Task, CoSRecommendation } from "@/types/task";

interface DocumentImportTabProps {
  onTasksExtracted: (tasks: Partial<Task>[]) => void;
  onRecommendationsGenerated: (recommendations: CoSRecommendation[]) => void;
}

const DocumentImportTab = ({ 
  onTasksExtracted, 
  onRecommendationsGenerated 
}: DocumentImportTabProps) => {
  return (
    <DocumentParsingEngine
      onTasksExtracted={onTasksExtracted}
      onRecommendationsGenerated={onRecommendationsGenerated}
    />
  );
};

export default DocumentImportTab;
