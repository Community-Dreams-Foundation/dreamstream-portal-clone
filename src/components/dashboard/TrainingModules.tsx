
import { Card } from "@/components/ui/card"
import { TrainingModulesHeader } from "./TrainingModulesHeader"
import { TrainingModulesGrid } from "./TrainingModulesGrid"
import { useTrainingModules } from "@/hooks/useTrainingModules"
import { TrainingModule } from "@/utils/trainingModules"

export function TrainingModules() {
  const { modules, handleModuleAction, isAuthenticated } = useTrainingModules()
  const completedModules = modules.filter(module => module.completed).length

  return (
    <Card className="p-6">
      <TrainingModulesHeader 
        completedCount={completedModules}
        totalCount={modules.length}
      />
      <TrainingModulesGrid
        modules={modules as TrainingModule[]}
        onModuleAction={handleModuleAction}
        disabled={!isAuthenticated}
      />
    </Card>
  )
}
