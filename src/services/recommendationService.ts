import { getDatabase, ref, update, push, get } from "firebase/database";
import { CoSRecommendation, Task, TaskStatus } from "@/types/task";
import { toast } from "@/hooks/use-toast";
import { analyzeDocumentWithAI, parseDocumentContent } from "@/utils/documentParser";

/**
 * Records feedback for a recommendation in Firebase
 */
export const recordRecommendationFeedback = async (
  userId: string,
  recId: string,
  feedback: "positive" | "negative"
): Promise<void> => {
  try {
    const db = getDatabase();
    const recommendationRef = ref(db, `users/${userId}/recommendations/${recId}`);
    
    await update(recommendationRef, { feedback });
    
    // Update user's learning profile based on feedback
    await updateUserLearningProfile(userId, recId, feedback);
    
    toast({
      title: "Feedback Recorded",
      description: "Thank you for your feedback! This helps your CoS agent improve."
    });
  } catch (error) {
    console.error("Error recording feedback:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to record feedback. Please try again."
    });
    throw error;
  }
};

/**
 * Updates the user's learning profile based on recommendation feedback
 */
const updateUserLearningProfile = async (
  userId: string,
  recId: string,
  feedback: "positive" | "negative"
): Promise<void> => {
  try {
    const db = getDatabase();
    const recRef = ref(db, `users/${userId}/recommendations/${recId}`);
    const recSnapshot = await get(recRef);
    
    if (!recSnapshot.exists()) return;
    
    const recommendation = recSnapshot.val() as CoSRecommendation;
    const learningProfileRef = ref(db, `users/${userId}/learningProfile`);
    
    // Get current learning profile or create default
    const profileSnapshot = await get(learningProfileRef);
    const learningProfile = profileSnapshot.exists() 
      ? profileSnapshot.val() 
      : {
          preferredRecommendationTypes: {},
          skillInterests: {},
          feedbackHistory: [],
          adaptiveScore: 50
        };
    
    // Update recommendation type preferences
    if (!learningProfile.preferredRecommendationTypes[recommendation.type]) {
      learningProfile.preferredRecommendationTypes[recommendation.type] = {
        positive: 0,
        negative: 0,
        total: 0
      };
    }
    
    learningProfile.preferredRecommendationTypes[recommendation.type][feedback]++;
    learningProfile.preferredRecommendationTypes[recommendation.type].total++;
    
    // Update skills interests if present in recommendation
    if (recommendation.metadata?.skills) {
      for (const skill of recommendation.metadata.skills) {
        if (!learningProfile.skillInterests[skill]) {
          learningProfile.skillInterests[skill] = {
            positive: 0,
            negative: 0,
            total: 0
          };
        }
        
        learningProfile.skillInterests[skill][feedback]++;
        learningProfile.skillInterests[skill].total++;
      }
    }
    
    // Add to feedback history (last 20 items)
    learningProfile.feedbackHistory.push({
      recId: recommendation.id,
      type: recommendation.type,
      timestamp: Date.now(),
      feedback
    });
    
    // Keep only most recent 20 feedback items
    if (learningProfile.feedbackHistory.length > 20) {
      learningProfile.feedbackHistory = learningProfile.feedbackHistory.slice(-20);
    }
    
    // Update adaptive score
    const recentFeedback = learningProfile.feedbackHistory.slice(-10);
    const positiveCount = recentFeedback.filter(f => f.feedback === "positive").length;
    learningProfile.adaptiveScore = Math.round((positiveCount / recentFeedback.length) * 100) || 50;
    
    // Save updated learning profile
    await update(learningProfileRef, learningProfile);
    
  } catch (error) {
    console.error("Error updating user learning profile:", error);
  }
};

/**
 * Creates a new task recommendation in Firebase
 */
export const createRecommendation = async (
  userId: string,
  taskId: string,
  title: string,
  content: string,
  priority: "high" | "medium" | "low" = "medium",
  skills?: string[]
): Promise<string | undefined> => {
  try {
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    const newRecKey = push(recommendationsRef).key;
    
    if (!newRecKey) throw new Error("Failed to generate recommendation key");
    
    const newRecommendation: CoSRecommendation = {
      id: newRecKey,
      type: "task",
      content,
      timestamp: Date.now(),
      priority,
      impact: priority === "high" ? 80 : priority === "medium" ? 60 : 40,
      metadata: {
        taskId,
        taskTitle: title,
        skills: skills || []
      }
    };
    
    await update(ref(db, `users/${userId}/recommendations/${newRecKey}`), newRecommendation);
    
    return newRecKey;
  } catch (error) {
    console.error("Error creating task recommendation:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to create recommendation. Please try again."
    });
    return undefined;
  }
};

/**
 * Updates a recommendation to mark actions taken
 */
export const updateRecommendationAction = async (
  userId: string,
  recId: string,
  updates: Partial<CoSRecommendation>
): Promise<void> => {
  try {
    const db = getDatabase();
    const recommendationRef = ref(db, `users/${userId}/recommendations/${recId}`);
    await update(recommendationRef, updates);
  } catch (error) {
    console.error("Error updating recommendation:", error);
    throw error;
  }
};

/**
 * Creates default recommendations if none exist
 */
export const createDefaultRecommendations = async (
  userId: string
): Promise<CoSRecommendation[]> => {
  const defaultRecommendations: Record<string, CoSRecommendation> = {
    "rec-1": {
      id: "rec-1",
      type: "task",
      content: "Set up your weekly priorities. Start each week by defining your top 3 priorities to stay focused and productive.",
      timestamp: Date.now(),
      priority: "high",
      impact: 75,
      metadata: {
        skills: ["planning", "time-management"]
      }
    },
    "rec-2": {
      id: "rec-2",
      type: "learning",
      content: "Complete your portfolio section. Adding your projects and skills to your portfolio will help you showcase your work.",
      timestamp: Date.now() - 86400000, // 1 day ago
      priority: "medium",
      impact: 60,
      metadata: {
        skills: ["portfolio", "career-development"]
      }
    },
    "rec-3": {
      id: "rec-3",
      type: "leadership",
      content: "Take the leadership course. Based on your profile, the 'Effective Leadership' training module would be valuable for your growth.",
      timestamp: Date.now() - 172800000, // 2 days ago
      priority: "medium",
      impact: 65,
      metadata: {
        skills: ["leadership", "communication"]
      }
    },
    "rec-4": {
      id: "rec-4",
      type: "efficiency",
      content: "Try time-blocking your calendar. Allocating specific time slots for focused work can increase your productivity by 30%.",
      timestamp: Date.now() - 259200000, // 3 days ago
      priority: "medium",
      impact: 70,
      actualDuration: 15,
      metadata: {
        skills: ["productivity", "time-management"]
      }
    }
  };
  
  try {
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    
    // Save default recommendations to Firebase
    await update(recommendationsRef, defaultRecommendations);
    
    return Object.values(defaultRecommendations);
  } catch (error) {
    console.error("Error creating default recommendations:", error);
    throw error;
  }
};

/**
 * Generates recommendations from document content
 */
export const generateRecommendationsFromDocument = async (
  userId: string,
  fileContent: string,
  fileType: string
): Promise<{
  recommendations: CoSRecommendation[];
  tasks: Partial<Task>[];
  keyInsights: string[];
}> => {
  try {
    // Analyze document content
    const analysis = await analyzeDocumentWithAI(fileContent, fileType);
    
    // Store recommendations in Firebase
    const db = getDatabase();
    const recommendationsRef = ref(db, `users/${userId}/recommendations`);
    
    const savedRecommendations: CoSRecommendation[] = [];
    
    // Process and save each recommendation
    for (const rec of analysis.recommendations) {
      const newRecKey = push(recommendationsRef).key;
      
      if (!newRecKey) continue;
      
      // Ensure type is one of the allowed values
      const recommendationType = (rec.type && ["agent", "leadership", "time", "task", "learning", "efficiency"].includes(rec.type)) 
        ? (rec.type as "agent" | "leadership" | "time" | "task" | "learning" | "efficiency") 
        : "task";
      
      const newRecommendation: CoSRecommendation = {
        id: newRecKey,
        type: recommendationType,
        content: rec.content || "",
        timestamp: Date.now(),
        priority: rec.priority || "medium",
        impact: rec.impact || 50,
        actualDuration: rec.actualDuration,
        metadata: rec.metadata || {}
      };
      
      await update(ref(db, `users/${userId}/recommendations/${newRecKey}`), newRecommendation);
      savedRecommendations.push(newRecommendation);
    }
    
    return {
      recommendations: savedRecommendations,
      tasks: analysis.tasks,
      keyInsights: analysis.metadata.keyInsights
    };
  } catch (error) {
    console.error("Error generating recommendations from document:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to analyze document content. Please try again."
    });
    return {
      recommendations: [],
      tasks: [],
      keyInsights: []
    };
  }
};

/**
 * Process a document for task creation and generate recommendations
 */
export const processDocumentForTaskCreation = async (
  userId: string, 
  file: File,
  textContent?: string
): Promise<{
  success: boolean;
  tasks: Partial<Task>[];
  recommendations: CoSRecommendation[];
  insights: string[];
}> => {
  try {
    // Read the file content or use provided text content
    let content: string;
    if (textContent) {
      content = textContent;
    } else {
      content = await readFileAsText(file);
    }
    
    // Analyze the document content using AI
    const analysis = await analyzeDocumentWithAI(content, file.type);
    
    // Convert the tasks to the proper format
    const formattedTasks = analysis.tasks.map(task => ({
      ...task,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "todo" as TaskStatus,
      estimatedDuration: task.estimatedDuration || 60,
      actualDuration: 0,
      completionPercentage: 0,
      activities: [{
        type: "status_change" as "status_change",
        timestamp: Date.now(),
        details: "Task created from document import"
      }],
      totalElapsedTime: 0,
      isTimerRunning: false,
    }));
    
    // Create tasks in the database
    let createdTasks: Partial<Task>[] = [];
    for (const task of formattedTasks) {
      try {
        // In a real implementation, you'd save the task to your database here
        // We're just passing back the formatted tasks for this example
        createdTasks.push(task);
      } catch (error) {
        console.error("Error creating task:", error);
      }
    }
    
    // Format recommendations
    const formattedRecommendations: CoSRecommendation[] = analysis.recommendations.map(rec => {
      // Ensure type is one of the allowed values
      const recommendationType = (rec.type && ["agent", "leadership", "time", "task", "learning", "efficiency"].includes(rec.type)) 
        ? (rec.type as "agent" | "leadership" | "time" | "task" | "learning" | "efficiency") 
        : "task";
        
      return {
        id: rec.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: recommendationType,
        content: rec.content || "",
        timestamp: rec.timestamp || Date.now(),
        priority: rec.priority || "medium",
        impact: rec.impact || 50,
        feedback: undefined,
        actualDuration: undefined,
        actedUpon: false,
        metadata: {
          ...(rec.metadata || {}),
          skills: rec.metadata?.skills || []
        }
      };
    });
    
    return {
      success: true,
      tasks: createdTasks,
      recommendations: formattedRecommendations,
      insights: analysis.metadata.keyInsights
    };
  } catch (error) {
    console.error("Error processing document:", error);
    return {
      success: false,
      tasks: [],
      recommendations: [],
      insights: []
    };
  }
};

/**
 * Helper function to read file content as text
 */
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

/**
 * Generates personalized recommendations based on user profile
 */
export const generatePersonalizedRecommendations = async (
  userId: string
): Promise<CoSRecommendation[]> => {
  try {
    const db = getDatabase();
    
    // Get user's learning profile
    const learningProfileRef = ref(db, `users/${userId}/learningProfile`);
    const profileSnapshot = await get(learningProfileRef);
    
    if (!profileSnapshot.exists()) {
      // If no learning profile exists, return default recommendations
      return createDefaultRecommendations(userId);
    }
    
    const learningProfile = profileSnapshot.val();
    
    // Get user's task data for context
    const tasksRef = ref(db, `users/${userId}/tasks`);
    const tasksSnapshot = await get(tasksRef);
    const tasks = tasksSnapshot.exists() ? Object.values(tasksSnapshot.val()) as Task[] : [];
    
    // Generate personalized recommendations
    const recommendations: CoSRecommendation[] = [];
    
    // Add task prioritization recommendation if we have tasks
    if (tasks.length > 0) {
      const overdueTasks = tasks.filter(t => 
        t.status !== "completed" && 
        t.dueDate && 
        t.dueDate < Date.now()
      );
      
      if (overdueTasks.length > 0) {
        recommendations.push({
          id: `personalized-rec-${Date.now()}-1`,
          type: "task",
          content: `You have ${overdueTasks.length} overdue tasks. Would you like to create a plan to address them?`,
          timestamp: Date.now(),
          priority: "high",
          impact: 80,
          metadata: {
            skills: ["time-management", "planning"],
            adaptive: true,
            source: "task-analysis"
          }
        });
      }
    }
    
    // Add skill-based recommendation
    const topSkill = getTopSkill(learningProfile.skillInterests);
    if (topSkill) {
      recommendations.push({
        id: `personalized-rec-${Date.now()}-2`,
        type: "learning",
        content: `Based on your interests, exploring more ${topSkill} content could be valuable for your growth.`,
        timestamp: Date.now(),
        priority: "medium",
        impact: 65,
        metadata: {
          skills: [topSkill],
          adaptive: true,
          source: "skill-interest"
        }
      });
    }
    
    // Add preferred recommendation type
    const preferredType = getPreferredRecommendationType(learningProfile.preferredRecommendationTypes);
    if (preferredType) {
      let content = "";
      
      // Validate and ensure preferredType is one of the valid recommendation types
      const validRecommendationType = ["agent", "leadership", "time", "task", "learning", "efficiency"].includes(preferredType)
        ? (preferredType as "agent" | "leadership" | "time" | "task" | "learning" | "efficiency")
        : "task";
      
      switch (validRecommendationType) {
        case "efficiency":
          content = "Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break. This could increase your productivity by 20%.";
          break;
        case "leadership":
          content = "Schedule 15 minutes each day for reflection on your leadership decisions. This simple habit can significantly improve your decision-making.";
          break;
        case "time":
          content = "Review your completed tasks from last week. Identifying patterns in your work can help optimize your schedule.";
          break;
        default:
          content = "Based on your preferences, consider setting aside time each week for structured learning in your areas of interest.";
      }
      
      recommendations.push({
        id: `personalized-rec-${Date.now()}-3`,
        type: validRecommendationType,
        content,
        timestamp: Date.now() - 3600000, // 1 hour ago
        priority: "medium",
        impact: 70,
        metadata: {
          skills: ["self-improvement"],
          adaptive: true,
          source: "preference-analysis"
        }
      });
    }
    
    // If we still have fewer than 3 recommendations, add some defaults
    if (recommendations.length < 3) {
      const defaultRecs = await createDefaultRecommendations(userId);
      recommendations.push(...defaultRecs.slice(0, 3 - recommendations.length));
    }
    
    return recommendations;
    
  } catch (error) {
    console.error("Error generating personalized recommendations:", error);
    return createDefaultRecommendations(userId);
  }
};

/**
 * Helper to get top skill from learning profile
 */
const getTopSkill = (skillInterests: Record<string, { positive: number, negative: number, total: number }>): string | null => {
  if (!skillInterests || Object.keys(skillInterests).length === 0) return null;
  
  return Object.entries(skillInterests)
    .sort((a, b) => {
      const scoreA = a[1].positive / (a[1].total || 1);
      const scoreB = b[1].positive / (b[1].total || 1);
      return scoreB - scoreA;
    })[0][0];
};

/**
 * Helper to get preferred recommendation type
 */
const getPreferredRecommendationType = (
  preferredTypes: Record<string, { positive: number, negative: number, total: number }>
): string | null => {
  if (!preferredTypes || Object.keys(preferredTypes).length === 0) return null;
  
  return Object.entries(preferredTypes)
    .sort((a, b) => {
      const scoreA = a[1].positive / (a[1].total || 1);
      const scoreB = b[1].positive / (b[1].total || 1);
      return scoreB - scoreA;
    })[0][0];
};

/**
 * Reads content from a file
 */
const readFileContent = async (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        resolve(null);
      }
    };
    
    reader.onerror = () => {
      console.error("Error reading file");
      resolve(null);
    };
    
    if (file.type.includes("image")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
};
