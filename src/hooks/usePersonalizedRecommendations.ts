
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CoSRecommendation } from "@/types/task";
import { generatePersonalizedRecommendations } from "@/services/recommendationService";
import { subscribeToRealTimeDB } from "@/lib/firebase";

export function usePersonalizedRecommendations() {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<CoSRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [learningProfile, setLearningProfile] = useState<any>(null);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    
    // Subscribe to real-time learning profile updates
    const unsubscribe = subscribeToRealTimeDB(`users/${currentUser.uid}/learningProfile`, async (profile) => {
      if (profile) {
        setLearningProfile(profile);
        
        // Generate personalized recommendations
        try {
          const personalizedRecs = await generatePersonalizedRecommendations(currentUser.uid);
          setRecommendations(personalizedRecs);
        } catch (error) {
          console.error("Error fetching personalized recommendations:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  const refreshRecommendations = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const personalizedRecs = await generatePersonalizedRecommendations(currentUser.uid);
      setRecommendations(personalizedRecs);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    learningProfile,
    refreshRecommendations,
    adaptiveScore: learningProfile?.adaptiveScore || 50
  };
}
