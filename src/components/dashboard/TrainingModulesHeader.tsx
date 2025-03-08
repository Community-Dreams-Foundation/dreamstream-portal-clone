
import { GraduationCap, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TrainingModulesHeaderProps {
  completedCount: number
  totalCount: number
}

export function TrainingModulesHeader({ completedCount, totalCount }: TrainingModulesHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Training Modules</h3>
      </div>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Trophy className="h-3 w-3" />
        {completedCount}/{totalCount} Completed
      </Badge>
    </div>
  )
}
