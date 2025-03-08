import { getDatabase, ref, set, get, update } from "firebase/database";
import type { PerformanceMetrics, PersonalGoal, PortfolioAnalytics, SectionEngagement } from "@/types/performance";

export const fetchPerformanceData = async (userId: string): Promise<PerformanceMetrics> => {
  const db = getDatabase();
  const performanceRef = ref(db, `users/${userId}/performance`);
  const snapshot = await get(performanceRef);

  if (!snapshot.exists()) {
    const defaultData: PerformanceMetrics = {
      taskCompletionRate: 0,
      avgTaskTime: 0,
      delegationEfficiency: 0,
      feedbackScore: 0,
      efficiency: 0,
      totalTasks: 0,
      tasksThisWeek: 0,
      averageTaskTime: 0,
      level: 1,
      experience: 0,
      experienceToNextLevel: 1000,
      leaderboardRank: 1,
      totalParticipants: 1,
      achievements: [
        {
          id: "first-task",
          title: "First Steps",
          description: "Completed your first task",
          icon: "trophy",
          earnedAt: Date.now()
        }
      ],
      goals: [],
      weeklyTasks: [
        { name: "Mon", tasks: 0 },
        { name: "Tue", tasks: 0 },
        { name: "Wed", tasks: 0 },
        { name: "Thu", tasks: 0 },
        { name: "Fri", tasks: 0 }
      ],
      feedback: [],
      portfolioAnalytics: {
        views: [],
        uniqueVisitors: 0,
        sectionEngagement: [],
        platformPerformance: {
          linkedin: {
            shares: 0,
            clicks: 0,
            impressions: 0
          },
          github: {
            stars: 0,
            forks: 0,
            views: 0
          }
        },
        clickThroughRate: 0
      }
    };

    await set(performanceRef, defaultData);
    return defaultData;
  }

  return snapshot.val();
};

export const addPersonalGoal = async (userId: string, goal: Omit<PersonalGoal, "id" | "createdAt">) => {
  const db = getDatabase();
  const goalsRef = ref(db, `users/${userId}/performance/goals`);
  
  const newGoal: PersonalGoal = {
    ...goal,
    id: `goal-${Date.now()}`,
    createdAt: Date.now(),
  };

  await update(goalsRef, {
    [newGoal.id]: newGoal
  });

  return newGoal;
};

export const updateGoalProgress = async (userId: string, goalId: string, current: number) => {
  const db = getDatabase();
  const goalRef = ref(db, `users/${userId}/performance/goals/${goalId}`);
  
  await update(goalRef, {
    current
  });
};

export const calculateLevel = (experience: number): { level: number; nextLevelXP: number } => {
  const baseXP = 1000;
  const exponent = 1.5;
  
  let level = 1;
  let totalXPForNextLevel = baseXP;
  
  while (experience >= totalXPForNextLevel) {
    level++;
    totalXPForNextLevel += Math.floor(baseXP * Math.pow(level, exponent));
  }
  
  return {
    level,
    nextLevelXP: totalXPForNextLevel
  };
};

export const trackPortfolioView = async (userId: string) => {
  const db = getDatabase();
  const analyticsRef = ref(db, `users/${userId}/performance/portfolioAnalytics`);
  
  const snapshot = await get(analyticsRef);
  const currentAnalytics = snapshot.val() as PortfolioAnalytics;
  
  const updatedViews = [
    ...currentAnalytics.views,
    { timestamp: Date.now(), value: 1 }
  ];
  
  await update(analyticsRef, {
    views: updatedViews,
    uniqueVisitors: currentAnalytics.uniqueVisitors + 1
  });
};

export const trackSectionEngagement = async (
  userId: string,
  sectionId: string,
  sectionName: string,
  viewDuration: number
) => {
  const db = getDatabase();
  const engagementRef = ref(db, `users/${userId}/performance/portfolioAnalytics/sectionEngagement`);
  
  const snapshot = await get(engagementRef);
  const currentEngagement = snapshot.val() as SectionEngagement[];
  
  const existingIndex = currentEngagement.findIndex(s => s.sectionId === sectionId);
  
  if (existingIndex >= 0) {
    currentEngagement[existingIndex].viewDuration += viewDuration;
    currentEngagement[existingIndex].clicks += 1;
  } else {
    currentEngagement.push({
      sectionId,
      sectionName,
      viewDuration,
      clicks: 1
    });
  }
  
  await set(engagementRef, currentEngagement);
};

export const updatePlatformMetrics = async (
  userId: string,
  platform: 'linkedin' | 'github',
  metrics: Partial<PortfolioAnalytics['platformPerformance']['linkedin' | 'github']>
) => {
  const db = getDatabase();
  const platformRef = ref(db, `users/${userId}/performance/portfolioAnalytics/platformPerformance/${platform}`);
  
  await update(platformRef, metrics);
};

export const calculateClickThroughRate = async (userId: string) => {
  const db = getDatabase();
  const analyticsRef = ref(db, `users/${userId}/performance/portfolioAnalytics`);
  
  const snapshot = await get(analyticsRef);
  const analytics = snapshot.val() as PortfolioAnalytics;
  
  const totalViews = analytics.views.length;
  const totalClicks = analytics.sectionEngagement.reduce((sum, section) => sum + section.clicks, 0);
  
  const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  
  await update(analyticsRef, {
    clickThroughRate: Math.round(ctr * 100) / 100
  });
  
  return ctr;
};
