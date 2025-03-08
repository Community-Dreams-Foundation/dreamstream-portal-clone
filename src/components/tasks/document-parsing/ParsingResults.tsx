
import React from "react";
import { CheckCircle } from "lucide-react";

interface ParsingResultsProps {
  parsingComplete: boolean;
  insights: string[];
}

export const ParsingResults: React.FC<ParsingResultsProps> = ({
  parsingComplete,
  insights
}) => {
  if (!parsingComplete) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-primary">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Document processing complete!</span>
      </div>
      {insights.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Key Insights:</h4>
          <ul className="text-xs space-y-1">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-primary">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
