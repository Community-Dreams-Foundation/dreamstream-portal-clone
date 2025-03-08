
import React from "react";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{error}</span>
    </div>
  );
};
