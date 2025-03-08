
import { TrainingModule } from "@/utils/trainingModules"
import { TrainingModuleCard } from "./TrainingModuleCard"

interface TrainingModulesGridProps {
  modules: TrainingModule[]
  onModuleAction: (moduleId: number) => void
  disabled: boolean
}

export function TrainingModulesGrid({ 
  modules, 
  onModuleAction, 
  disabled 
}: TrainingModulesGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {modules.map((module) => (
        <TrainingModuleCard
          key={module.id}
          module={module}
          onAction={onModuleAction}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
