
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProgressIndicatorProps {
  isLoading: boolean;
  progress: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  isLoading,
  progress
}) => {
  if (!isLoading) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Processing document...</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};
