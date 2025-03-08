
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getDatabase, ref, onValue, off } from "firebase/database"
import { useToast } from "@/hooks/use-toast"
import { TrainingApi } from "@/api/gateway"
import { TrainingModule as ApiTrainingModule, TrainingModuleProgress } from "@/types/api"
import { TrainingModule as UtilTrainingModule } from "@/utils/trainingModules"

export const useTrainingModules = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: apiModules = [] } = useQuery<ApiTrainingModule[], Error>({
    queryKey: ['trainingModules', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return []
      // Use the new API gateway
      return TrainingApi.fetchModules(currentUser.uid)
        .catch(error => {
          console.error("Error fetching training modules:", error)
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load training modules. Please try again."
          })
          return []
        })
    },
    enabled: !!currentUser,
  })

  // Convert API modules to utility module format
  const modules: UtilTrainingModule[] = apiModules.map(module => ({
    id: module.id,
    title: module.title,
    description: module.description,
    progress: module.progress,
    duration: typeof module.duration === 'number' 
      ? `${Math.floor(module.duration / 60)}h ${module.duration % 60}min` 
      : String(module.duration),
    completed: module.completed
  }))

  useEffect(() => {
    if (!currentUser) return

    const db = getDatabase()
    const modulesRef = ref(db, `users/${currentUser.uid}/trainingModules`)

    const unsubscribe = onValue(modulesRef, () => {
      queryClient.invalidateQueries({ queryKey: ['trainingModules', currentUser.uid] })
    })

    return () => {
      off(modulesRef)
      unsubscribe()
    }
  }, [currentUser, queryClient])

  const handleModuleAction = async (moduleId: number) => {
    if (!currentUser) return

    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newProgress = module.completed ? module.progress : Math.min(100, module.progress + 20)
    const completed = newProgress === 100

    try {
      // Use the new API gateway
      await TrainingApi.updateProgress({
        userId: currentUser.uid,
        moduleId,
        progress: newProgress,
        completed
      })

      toast({
        title: completed ? "Module Completed!" : "Progress Updated",
        description: completed 
          ? `Congratulations on completing ${module.title}!`
          : `Progress on ${module.title} updated to ${newProgress}%`
      })
    } catch (error) {
      console.error("Error updating module progress:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update module progress. Please try again."
      })
    }
  }

  return {
    modules,
    handleModuleAction,
    isAuthenticated: !!currentUser
  }
}
