
import React from "react"
import { Task } from "@/types/task"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, BarChart2 } from "lucide-react"

interface TaskMetadataProps {
  metadata: NonNullable<Task["metadata"]>
}

export function TaskMetadata({ metadata }: TaskMetadataProps) {
  const getComplexityColor = (complexity: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    }
    return colors[complexity as keyof typeof colors] || colors.medium
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Badge variant="outline" className={getComplexityColor(metadata.complexity)}>
        <BarChart2 className="w-3 h-3 mr-1" />
        {metadata.complexity} complexity
      </Badge>
      <Badge variant="outline" className="flex items-center">
        <TrendingUp className="w-3 h-3 mr-1" />
        Impact: {metadata.impact}
      </Badge>
      <Badge variant="outline" className="flex items-center">
        <Brain className="w-3 h-3 mr-1" />
        Learning: {metadata.learningOpportunity}/10
      </Badge>
    </div>
  )
}
