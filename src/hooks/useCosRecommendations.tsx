
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { CoSRecommendation } from "@/types/task";
import { UseRecommendationsReturn } from "@/types/recommendations";
import { 
  recordRecommendationFeedback, 
  createRecommendation, 
  createDefaultRecommendations 
} from "@/services/recommendationService";
import { useRecommendationActions } from "@/hooks/useRecommendationActions";

export function useCosRecommendations(): UseRecommendationsReturn {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendationsState] = useState<CoSRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { handleAction: processAction } = useRecommendationActions(currentUser?.uid);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${currentUser.uid}/recommendations`);

    // Listen for recommendations in Firebase
    const unsubscribe = onValue(recommendationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const recommendationsArray = Object.values(data) as CoSRecommendation[];
        setRecommendationsState(recommendationsArray.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        // If no recommendations exist, create default ones
        createDefaultRecommendations(currentUser.uid)
          .then((defaultRecs) => {
            setRecommendationsState(defaultRecs);
          })
          .catch(error => {
            console.error("Error creating default recommendations:", error);
          });
      }
      setIsLoading(false);
    });

    return () => {
      off(recommendationsRef);
      unsubscribe();
    };
  }, [currentUser]);

  // Set recommendations with proper sorting
  const setRecommendations = (recs: CoSRecommendation[]) => {
    setRecommendationsState(recs.sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleFeedback = async (recId: string, feedback: "positive" | "negative") => {
    if (!currentUser) return;
    
    try {
      await recordRecommendationFeedback(currentUser.uid, recId, feedback);
      
      // Update local state
      setRecommendations(
        recommendations.map(rec => 
          rec.id === recId 
            ? { ...rec, feedback } 
            : rec
        )
      );
    } catch (error) {
      console.error("Error in handleFeedback:", error);
    }
  };

  const handleAction = async (recId: string, actionType: string) => {
    if (!currentUser) return;
    
    try {
      // Find the recommendation
      const recommendation = recommendations.find(rec => rec.id === recId);
      if (!recommendation) return;
      
      await processAction(recommendation, actionType);
      
      // Update local state for UI changes
      if (
        (actionType === "start" && recommendation.type === "task") ||
        (actionType === "apply" && (recommendation.type === "efficiency" || recommendation.type === "time"))
      ) {
        setRecommendations(
          recommendations.map(rec => 
            rec.id === recId 
              ? { ...rec, actedUpon: true, ...(actionType === "apply" ? { appliedAt: Date.now() } : {}) } 
              : rec
          )
        );
      }
    } catch (error) {
      console.error("Error in handleAction:", error);
    }
  };

  const createTaskRecommendation = async (
    taskId: string, 
    title: string, 
    content: string, 
    priority: "high" | "medium" | "low" = "medium"
  ) => {
    if (!currentUser) return;
    
    try {
      const newRecKey = await createRecommendation(
        currentUser.uid,
        taskId, 
        title, 
        content, 
        priority
      );
      
      if (newRecKey) {
        // The recommendation will be added through the Firebase listener,
        // but we can also update the local state immediately
        const newRecommendation: CoSRecommendation = {
          id: newRecKey,
          type: "task",
          content,
          timestamp: Date.now(),
          priority,
          impact: priority === "high" ? 80 : priority === "medium" ? 60 : 40,
          metadata: {
            taskId,
            taskTitle: title
          }
        };
        
        setRecommendations([...recommendations, newRecommendation]);
      }
      
      return newRecKey;
    } catch (error) {
      console.error("Error in createTaskRecommendation:", error);
      return undefined;
    }
  };

  return {
    recommendations,
    setRecommendations,
    handleFeedback,
    handleAction,
    createTaskRecommendation,
    isLoading
  };
}
