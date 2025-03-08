
import { getDatabase, ref, get, set, update } from "firebase/database";
import { Task } from "@/types/task";
import type { 
  Portfolio, 
  PortfolioItem, 
  PortfolioFormat, 
  PortfolioMetadata,
  PortfolioSummary 
} from "@/types/portfolio";

export const generatePortfolioFromTasks = async (
  userId: string,
  tasks: Task[],
  format: PortfolioFormat = "linkedin"
): Promise<Portfolio> => {
  const portfolioItems: PortfolioItem[] = tasks
    .filter((task) => task.status === "completed")
    .map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      impact: {
        timeEfficiency: calculateTimeEfficiency(task),
        tasksCompleted: 1,
        efficiency: calculateEfficiency(task),
      },
      metrics: {
        avgCompletionTime: task.actualDuration || 0,
        tasksAheadOfSchedule: task.actualDuration && task.estimatedDuration ? 
          (task.actualDuration < task.estimatedDuration ? 1 : 0) : 0,
        totalTasks: 1
      },
      skills: task.tags || [],
      achievements: generateAchievements(task),
      createdAt: task.createdAt || Date.now(),
      updatedAt: task.updatedAt || Date.now(),
      projectHighlights: [
        `Completed ${task.title} with ${calculateEfficiency(task)}% efficiency`,
        task.actualDuration && task.estimatedDuration && task.actualDuration < task.estimatedDuration ?
          `Completed ahead of schedule by ${task.estimatedDuration - task.actualDuration} minutes` : 
          undefined,
      ].filter(Boolean) as string[],
    }));

  const metrics = calculatePortfolioMetrics(portfolioItems);
  const metadata = generatePortfolioMetadata(format);
  const allSkills = portfolioItems.flatMap(item => item.skills);
  const topSkills = [...new Set(allSkills)].slice(0, 5); // Get unique skills, limit to top 5

  const summary: PortfolioSummary = {
    totalProjects: portfolioItems.length,
    avgEfficiency: portfolioItems.reduce((sum, item) => sum + item.impact.efficiency, 0) / portfolioItems.length || 0,
    topSkills,
    overallImpact: {
      tasksCompleted: portfolioItems.length,
      efficiencyImprovement: metrics.efficiency,
      timesSaved: metrics.timesSaved
    }
  };
  
  return {
    userId,
    metadata,
    items: portfolioItems,
    metrics,
    preferences: {
      template: "default",
      primaryColor: "#4F46E5", // Indigo-600
      showMetrics: true,
      selectedItems: portfolioItems.map(item => item.id)
    },
    summary
  };
};

const calculateTimeEfficiency = (task: Task): number => {
  if (!task.actualDuration || !task.estimatedDuration) return 0;
  const improvement = ((task.estimatedDuration - task.actualDuration) / task.estimatedDuration) * 100;
  return Math.max(improvement, 0);
};

const calculateEfficiency = (task: Task): number => {
  if (!task.actualDuration || !task.estimatedDuration) return 0;
  return Math.min(100, 
    Math.round((task.estimatedDuration / task.actualDuration) * 100)
  );
};

const generateAchievements = (task: Task): string[] => {
  const achievements: string[] = [];
  
  if (task.completionPercentage === 100) {
    achievements.push("Completed task successfully");
  }
  
  if (task.actualDuration && task.estimatedDuration && 
      task.actualDuration < task.estimatedDuration) {
    achievements.push("Completed ahead of schedule");
  }
  
  if (task.metadata?.complexity === "high") {
    achievements.push("Handled complex task effectively");
  }
  
  return achievements;
};

const calculatePortfolioMetrics = (items: PortfolioItem[]): Portfolio["metrics"] => {
  return {
    tasksCompleted: items.length,
    efficiency: items.reduce((sum, item) => sum + item.impact.efficiency, 0) / items.length,
    timesSaved: items.reduce((sum, item) => sum + item.metrics.avgCompletionTime, 0),
    impactScore: items.reduce((sum, item) => sum + item.impact.timeEfficiency, 0)
  };
};

const generatePortfolioMetadata = (format: PortfolioFormat): PortfolioMetadata => ({
  title: `My Professional Portfolio`,
  description: "A showcase of my professional achievements and impact",
  lastUpdated: Date.now(),
  format,
  visibility: "private"
});

export const savePortfolio = async (userId: string, portfolio: Portfolio) => {
  const db = getDatabase();
  const portfolioRef = ref(db, `users/${userId}/portfolio`);
  return set(portfolioRef, portfolio);
};

export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
  const db = getDatabase();
  const portfolioRef = ref(db, `users/${userId}/portfolio`);
  const snapshot = await get(portfolioRef);
  return snapshot.exists() ? snapshot.val() : null;
};

export const updatePortfolioPreferences = async (
  userId: string,
  preferences: Portfolio["preferences"]
) => {
  const db = getDatabase();
  const preferencesRef = ref(db, `users/${userId}/portfolio/preferences`);
  return update(preferencesRef, preferences);
};

export const formatPortfolioForPlatform = async (
  portfolio: Portfolio,
  format: PortfolioFormat
): Promise<string> => {
  switch (format) {
    case "linkedin":
      return formatForLinkedIn(portfolio);
    case "github":
      return formatForGitHub(portfolio);
    case "website":
      return formatForWebsite(portfolio);
    default:
      throw new Error(`Unsupported portfolio format: ${format}`);
  }
};

const formatForLinkedIn = (portfolio: Portfolio): string => {
  const { items, metrics } = portfolio;
  const highlights = items
    .slice(0, 3)
    .map(item => `🎯 ${item.title}: ${item.projectHighlights[0]}`)
    .join("\n\n");

  return `🚀 Professional Portfolio Update\n\n${highlights}\n\n📊 Impact Metrics:\n` +
    `✨ ${metrics.tasksCompleted} Tasks Completed\n` +
    `⚡ ${Math.round(metrics.efficiency)}% Average Efficiency\n` +
    `🎯 ${Math.round(metrics.impactScore)} Impact Score\n\n` +
    `#ProfessionalDevelopment #ProductivityMetrics #CareerGrowth`;
};

const formatForGitHub = (portfolio: Portfolio): string => {
  const { items, metrics } = portfolio;
  
  return `# Professional Portfolio\n\n` +
    `## Overview\n${portfolio.metadata.description}\n\n` +
    `## Key Metrics\n` +
    `- Tasks Completed: ${metrics.tasksCompleted}\n` +
    `- Average Efficiency: ${Math.round(metrics.efficiency)}%\n` +
    `- Impact Score: ${Math.round(metrics.impactScore)}\n\n` +
    `## Project Highlights\n\n` +
    items.map(item => (
      `### ${item.title}\n\n${item.description}\n\n` +
      `**Impact:**\n` +
      `- Time Efficiency: ${Math.round(item.impact.timeEfficiency)}%\n` +
      `- Tasks Completed: ${item.metrics.totalTasks}\n` +
      `\n**Skills:** ${item.skills.join(", ")}\n`
    )).join("\n");
};

const formatForWebsite = (portfolio: Portfolio): string => {
  return JSON.stringify(portfolio, null, 2);
};
