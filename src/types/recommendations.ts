
import { CoSRecommendation } from "@/types/task";

export interface UseRecommendationsReturn {
  recommendations: CoSRecommendation[];
  setRecommendations: (recommendations: CoSRecommendation[]) => void;
  handleFeedback: (recId: string, feedback: "positive" | "negative") => void;
  handleAction: (recId: string, actionType: string) => void;
  createTaskRecommendation: (taskId: string, title: string, content: string, priority?: "high" | "medium" | "low") => Promise<string | undefined>;
  isLoading: boolean;
}
