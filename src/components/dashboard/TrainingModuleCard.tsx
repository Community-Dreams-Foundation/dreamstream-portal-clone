
import { BookOpen, CheckCircle, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TrainingModule } from "@/utils/trainingModules"

interface TrainingModuleCardProps {
  module: TrainingModule
  onAction: (moduleId: number) => void
  disabled?: boolean
}

export function TrainingModuleCard({ module, onAction, disabled }: TrainingModuleCardProps) {
  return (
    <div className="relative group rounded-lg border p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h4 className="font-medium">{module.title}</h4>
        </div>
        {module.completed ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Badge variant="secondary" className="text-xs">
            {module.duration}
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {module.description}
      </p>

      <div className="space-y-3">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${module.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Progress: {module.progress}%
          </span>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 px-2"
            onClick={() => onAction(module.id)}
            disabled={disabled}
          >
            <Play className="h-4 w-4 mr-1" />
            {module.completed ? "Review" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  )
}
