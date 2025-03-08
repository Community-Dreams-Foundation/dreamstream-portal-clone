
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CoSRecommendation } from "@/types/task";
import { updateRecommendationAction } from "@/services/recommendationService";

export function useRecommendationActions(userId: string | undefined) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAction = async (
    recommendation: CoSRecommendation, 
    actionType: string
  ) => {
    if (!userId || !recommendation) return;
    
    try {
      // Execute different actions based on the actionType and recommendation type
      switch (actionType) {
        case "start": {
          // For task-type recommendations, navigate to task page or launch task creation
          if (recommendation.type === "task") {
            // Update recommendation to show it was acted upon
            await updateRecommendationAction(userId, recommendation.id, { actedUpon: true });
            
            // If this is about creating a task
            if (recommendation.content.toLowerCase().includes("create") || 
                recommendation.content.toLowerCase().includes("add")) {
              // Navigate to the task creation page
              toast({
                title: "Creating New Task",
                description: "Opening the task creation dialog"
              });
              // In a real implementation, this would open the task creation dialog
              // For this example, we'll just navigate to the dashboard
              navigate("/dashboard");
            } else {
              // Navigate to the task management section
              toast({
                title: "Task Management",
                description: "Navigating to your tasks"
              });
              navigate("/dashboard");
            }
          }
          break;
        }
        
        case "view": {
          // For learning-type recommendations, navigate to the training page
          if (recommendation.type === "learning") {
            toast({
              title: "Learning Resource",
              description: "Navigating to training modules"
            });
            navigate("/training");
          }
          break;
        }
        
        case "apply": {
          // For efficiency or time recommendations, mark as applied
          if (recommendation.type === "efficiency" || recommendation.type === "time") {
            await updateRecommendationAction(userId, recommendation.id, { 
              actedUpon: true,
              appliedAt: Date.now()
            });
            
            toast({
              title: "Recommendation Applied",
              description: "This suggestion has been applied to your workflow."
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error handling recommendation action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform the requested action. Please try again."
      });
    }
  };

  return { handleAction };
}
