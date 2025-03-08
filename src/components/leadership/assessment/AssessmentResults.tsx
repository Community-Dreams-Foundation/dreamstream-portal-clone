
import React from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { LeadershipAssessment, LeadershipTier } from "@/types/leadership"

interface AssessmentResultsProps {
  assessment: LeadershipAssessment;
}

const tierColors: Record<LeadershipTier, string> = {
  emerging: "bg-blue-500",
  captain: "bg-green-500",
  "team-lead": "bg-purple-500",
  "product-owner": "bg-orange-500",
  executive: "bg-red-500"
}

const tierDescriptions: Record<LeadershipTier, string> = {
  emerging: "Beginning to develop leadership skills with potential for growth",
  captain: "Capable of leading small teams and handling basic project management",
  "team-lead": "Experienced in managing larger teams and complex projects",
  "product-owner": "Strategic thinker with proven track record of product success",
  executive: "Visionary leader capable of organizational-level impact"
}

export function AssessmentResults({ assessment }: AssessmentResultsProps) {
  const { metrics } = assessment

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Badge className={`${tierColors[metrics.tier]} text-white`}>
          {metrics.tier.replace("-", " ").toUpperCase()}
        </Badge>
        <p className="mt-2 text-sm text-muted-foreground">
          {tierDescriptions[metrics.tier]}
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Assessment Results</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm text-muted-foreground">
                {metrics.overallScore}/100
              </span>
            </div>
            <Progress value={metrics.overallScore} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Delegation Accuracy</span>
              <span className="text-sm text-muted-foreground">
                {metrics.delegationAccuracy}%
              </span>
            </div>
            <Progress value={metrics.delegationAccuracy} />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Team Efficiency</span>
              <span className="text-sm text-muted-foreground">
                {metrics.teamEfficiency}%
              </span>
            </div>
            <Progress value={metrics.teamEfficiency} />
          </div>
        </div>

        {metrics.domainSpecificScores && (
          <div className="mt-6">
            <h4 className="font-medium mb-4">Domain-Specific Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics.domainSpecificScores).map(([domain, score]) => (
                <Card key={domain} className="p-3">
                  <p className="text-sm font-medium capitalize">
                    {domain.replace("-", " ")}
                  </p>
                  <Progress value={score} className="mt-2" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {metrics.feedback && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Feedback</h4>
            <p className="text-sm text-muted-foreground">{metrics.feedback}</p>
          </div>
        )}
      </Card>
    </div>
  )
}
