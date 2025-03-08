
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Brain, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AiInsightPanelProps {
  insights: string[];
  suggestedSkills?: string[];
  estimatedEffort?: number;
}

export function AiInsightPanel({
  insights,
  suggestedSkills = [],
  estimatedEffort = 0,
}: AiInsightPanelProps) {
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center">
          <Brain className="mr-2 h-5 w-5 text-primary" />
          CoS Agent Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center">
            <Lightbulb className="mr-1 h-4 w-4 text-yellow-500" />
            Key Insights
          </h4>
          <ul className="space-y-1 text-sm">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-500 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground italic">No insights available</li>
            )}
          </ul>
        </div>

        {suggestedSkills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Relevant Skills</h4>
            <div className="flex flex-wrap gap-1">
              {suggestedSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="capitalize">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {estimatedEffort > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-1">Estimated Effort</h4>
            <p className="text-sm">
              {Math.round(estimatedEffort / 60)} hours {estimatedEffort % 60 > 0 ? `${estimatedEffort % 60} minutes` : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
