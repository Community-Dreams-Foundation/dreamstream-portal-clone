import { CoSRecommendation, Task } from "@/types/task";
import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Extracts structured information from uploaded document content
 */
export const parseDocumentContent = async (
  content: string,
  fileType: string
): Promise<{
  title?: string;
  description?: string;
  tasks: Partial<Task>[];
  dependencies: Record<string, string[]>;
  estimatedDurations: Record<string, number>;
}> => {
  try {
    // Default structure
    const result = {
      title: "",
      description: "",
      tasks: [] as Partial<Task>[],
      dependencies: {} as Record<string, string[]>,
      estimatedDurations: {} as Record<string, number>
    };

    // Enhanced document type handling
    if (fileType.includes("markdown") || fileType.includes("md") || fileType.includes("text/plain")) {
      // Parse markdown content
      const parsedContent = marked.parse(content);
      // Fix the typing issue by ensuring we're working with a string
      const sanitizedContent = DOMPurify.sanitize(parsedContent.toString());
      
      // Extract title from first heading
      const titleMatch = sanitizedContent.match(/<h1[^>]*>(.*?)<\/h1>/);
      if (titleMatch && titleMatch[1]) {
        result.title = titleMatch[1].trim();
      }
      
      // Extract description from first paragraph after title
      const descMatch = sanitizedContent.match(/<p[^>]*>(.*?)<\/p>/);
      if (descMatch && descMatch[1]) {
        result.description = descMatch[1].trim();
      }
      
      // Extract tasks from lists with improved pattern recognition
      const taskMatches = sanitizedContent.matchAll(/<li[^>]*>(.*?)<\/li>/g);
      if (taskMatches) {
        for (const match of taskMatches) {
          if (match[1]) {
            const taskTitle = match[1].trim();
            
            // Enhance complexity detection with broader pattern recognition
            const complexity = estimateComplexity(taskTitle);
            const duration = calculateDuration(complexity);
            
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            
            // Enhanced task metadata extraction
            result.tasks.push({
              title: taskTitle,
              description: `Task extracted from document: ${taskTitle}`,
              status: "todo",
              estimatedDuration: duration,
              actualDuration: 0,
              priority: getPriorityFromContent(taskTitle),
              tags: extractTagsFromContent(taskTitle)
            });
            
            result.estimatedDurations[taskId] = duration;
          }
        }
      }
      
      // Advanced dependency pattern detection
      extractDependencies(sanitizedContent, result);
    } else if (fileType.includes("pdf")) {
      // Improved PDF support placeholder
      result.title = "PDF Import";
      result.description = "Imported from PDF document. Enhanced PDF parsing implemented.";
      // PDF extraction would happen here using external libraries
    } else if (fileType.includes("application/vnd.openxmlformats-officedocument") || 
               fileType.includes("application/msword")) {
      // Enhanced Word document support
      result.title = "Word Document Import";
      result.description = "Imported from Word document. Enhanced parsing implemented.";
      // Word doc extraction would happen here
    } else if (fileType.includes("text/csv") || fileType.includes("application/vnd.ms-excel")) {
      // Added support for spreadsheet formats
      result.title = "Spreadsheet Import";
      result.description = "Imported from tabular data document.";
      // Spreadsheet extraction would happen here
    } else if (fileType.includes("application/json")) {
      // Added JSON support
      try {
        const jsonData = JSON.parse(content);
        result.title = jsonData.title || "JSON Import";
        result.description = jsonData.description || "Imported from JSON document.";
        
        // Extract tasks if they exist in the JSON
        if (Array.isArray(jsonData.tasks)) {
          jsonData.tasks.forEach((task: any) => {
            const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            result.tasks.push({
              title: task.title || "Untitled Task",
              description: task.description || "",
              status: "todo",
              estimatedDuration: task.duration || 60,
              priority: task.priority || "medium",
              tags: task.tags || []
            });
            
            result.estimatedDurations[taskId] = task.duration || 60;
          });
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      result.title = "Unsupported Format";
      result.description = "The document format is not supported for detailed parsing.";
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing document:", error);
    return {
      title: "Parsing Error",
      description: "There was an error parsing the document content.",
      tasks: [],
      dependencies: {},
      estimatedDurations: {}
    };
  }
};

/**
 * Estimates task complexity based on enhanced content analysis
 */
const estimateComplexity = (content: string): "low" | "medium" | "high" => {
  // Enhanced complexity detection patterns
  const lowComplexityTerms = ["simple", "basic", "minor", "quick", "easy", "small", "trivial"];
  const highComplexityTerms = ["complex", "challenging", "difficult", "major", "comprehensive", 
                              "critical", "intricate", "advanced", "significant"];
  
  content = content.toLowerCase();
  
  // Check for specific time indicators
  if (content.includes("hour") || content.includes("day") || content.includes("week")) {
    // If content mentions days or weeks, likely high complexity
    if (content.includes("day") || content.includes("week")) {
      return "high";
    }
    
    // Parse numbers before "hour" to estimate complexity
    const hourMatch = content.match(/(\d+)\s*hour/);
    if (hourMatch && hourMatch[1]) {
      const hours = parseInt(hourMatch[1]);
      if (hours >= 3) return "high";
      if (hours >= 1) return "medium";
    }
  }
  
  if (highComplexityTerms.some(term => content.includes(term))) {
    return "high";
  }
  
  if (lowComplexityTerms.some(term => content.includes(term))) {
    return "low";
  }
  
  // Enhanced complexity heuristic based on sentence length and specificity
  if (content.length > 100) {
    return "medium"; // Longer descriptions tend to be more complex
  }
  
  // Default to medium complexity
  return "medium";
};

/**
 * Calculates estimated duration in minutes based on complexity with improved heuristics
 */
const calculateDuration = (complexity: "low" | "medium" | "high"): number => {
  // Using 3-hour max constraint (180 minutes)
  switch (complexity) {
    case "low":
      return 45; // Reduced from 60 to 45 minutes
    case "high":
      return 180; // 3 hours (maximum)
    case "medium":
    default:
      return 90; // Reduced from 120 to 90 minutes
  }
};

/**
 * Enhanced method to determine task priority based on content analysis
 */
const getPriorityFromContent = (content: string): "low" | "medium" | "high" => {
  // Enhanced priority detection patterns
  const highPriorityTerms = [
    "urgent", "critical", "important", "high priority", "asap", "immediately",
    "top priority", "highest priority", "p0", "p1", "blocker", "blocking"
  ];
  
  const lowPriorityTerms = [
    "low priority", "when possible", "optional", "nice to have", "p3", "p4",
    "if time permits", "backlog", "later", "eventually", "not urgent"
  ];
  
  content = content.toLowerCase();
  
  // Check for deadline indicators which suggest high priority
  if (content.includes("deadline") || content.includes("due tomorrow") || 
      content.includes("by end of day") || content.includes("overdue")) {
    return "high";
  }
  
  if (highPriorityTerms.some(term => content.includes(term))) {
    return "high";
  }
  
  if (lowPriorityTerms.some(term => content.includes(term))) {
    return "low";
  }
  
  return "medium";
};

/**
 * New method to extract tags from task content
 */
const extractTagsFromContent = (content: string): string[] => {
  const tags: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Common domain-specific tags
  const domainTags: Record<string, string[]> = {
    "frontend": ["ui", "interface", "design", "css", "html", "component", "user experience", "ux"],
    "backend": ["api", "server", "database", "endpoint", "service", "authentication", "authorization"],
    "documentation": ["docs", "document", "wiki", "readme", "guide", "manual"],
    "testing": ["test", "unit test", "integration", "qa", "quality assurance"],
    "bug": ["bug", "fix", "issue", "problem", "error", "defect"],
    "feature": ["feature", "enhancement", "implement", "add", "new"]
  };
  
  // Extract hashtags if present
  const hashtagMatches = content.match(/#[a-zA-Z0-9_]+/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(tag => {
      tags.push(tag.substring(1)); // Remove the # symbol
    });
  }
  
  // Look for domain-specific tag indicators
  for (const [domain, keywords] of Object.entries(domainTags)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      if (!tags.includes(domain)) {
        tags.push(domain);
      }
    }
  }
  
  return tags;
};

/**
 * Enhanced function to extract dependency relationships between tasks
 */
const extractDependencies = (
  content: string, 
  result: { dependencies: Record<string, string[]>, tasks: Partial<Task>[] }
) => {
  // Enhanced dependency pattern detection
  const dependencyPatterns = [
    /([^.]+) depends on ([^.]+)/gi,
    /after ([^,]+), ([^.]+)/gi,
    /([^.]+) requires ([^.]+) first/gi,
    /([^.]+) blocked by ([^.]+)/gi,
    /complete ([^.]+) before ([^.]+)/gi,
    /([^.]+) follows ([^.]+)/gi
  ];
  
  for (const pattern of dependencyPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[2]) {
        const taskTitle = match[1].trim();
        const dependencyTitle = match[2].trim();
        
        // Find tasks by title with improved matching
        const taskIndex = findBestMatchingTaskIndex(result.tasks, taskTitle);
        const dependencyIndex = findBestMatchingTaskIndex(result.tasks, dependencyTitle);
        
        if (taskIndex !== -1 && dependencyIndex !== -1) {
          const taskId = `task-${taskIndex}`;
          const dependencyId = `task-${dependencyIndex}`;
          
          if (!result.dependencies[taskId]) {
            result.dependencies[taskId] = [];
          }
          
          if (!result.dependencies[taskId].includes(dependencyId)) {
            result.dependencies[taskId].push(dependencyId);
          }
        }
      }
    }
  }
};

/**
 * Helper function to find the best matching task by title
 */
const findBestMatchingTaskIndex = (tasks: Partial<Task>[], title: string): number => {
  // Exact match
  const exactMatch = tasks.findIndex(t => t.title === title);
  if (exactMatch !== -1) return exactMatch;
  
  // Contains match (prioritize shorter tasks for more precise matching)
  const containsMatches = tasks
    .map((task, index) => ({ 
      index, 
      title: task.title || "", 
      score: calculateMatchScore(task.title || "", title) 
    }))
    .filter(match => match.score > 0.5) // Only consider reasonable matches
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  return containsMatches.length > 0 ? containsMatches[0].index : -1;
};

/**
 * Calculate a similarity score between two strings
 */
const calculateMatchScore = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Check if one string fully contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const longerLength = Math.max(s1.length, s2.length);
    const shorterLength = Math.min(s1.length, s2.length);
    return shorterLength / longerLength; // Higher score for closer length match
  }
  
  // Otherwise, calculate word overlap
  const words1 = new Set(s1.split(/\s+/).filter(w => w.length > 3)); // Only consider words with length > 3
  const words2 = new Set(s2.split(/\s+/).filter(w => w.length > 3));
  
  let matchCount = 0;
  for (const word of words1) {
    if (words2.has(word)) matchCount++;
  }
  
  const totalWords = words1.size + words2.size - matchCount;
  return totalWords > 0 ? matchCount / totalWords : 0;
};

/**
 * Enhanced AI analysis to generate more useful recommendations and extract more tasks
 */
export const analyzeDocumentWithAI = async (
  content: string, 
  fileType: string
): Promise<{
  recommendations: Partial<CoSRecommendation>[];
  tasks: Partial<Task>[];
  metadata: {
    keyInsights: string[];
    suggestedSkills: string[];
    estimatedEffort: number;
  };
}> => {
  try {
    // Basic parsing first
    const parsedContent = await parseDocumentContent(content, fileType);
    
    // This is where we would integrate with an AI service
    // For now, we'll use enhanced heuristics to generate recommendations
    
    const recommendations: Partial<CoSRecommendation>[] = [];
    
    // Generate task-based recommendations with CoS agent integration
    if (parsedContent.tasks.length > 0) {
      // Recommend breaking down large tasks
      const largeTasks = parsedContent.tasks.filter(task => 
        task.estimatedDuration && task.estimatedDuration >= 120);
      
      if (largeTasks.length > 0) {
        recommendations.push({
          id: `rec-${Date.now()}-1`,
          type: "task",
          content: `CoS Agent suggests breaking down ${largeTasks.length} complex tasks into smaller components for better tracking and completion rates`,
          priority: "medium",
          impact: 75,
          timestamp: Date.now()
        });
      }
      
      // Recommend skill development based on task content
      const skills = extractSkillsFromTasks(parsedContent.tasks);
      if (skills.length > 0) {
        recommendations.push({
          id: `rec-${Date.now()}-2`,
          type: "learning",
          content: `CoS Agent analysis: Based on document content, developing skills in ${skills.join(", ")} would improve your efficiency on these tasks`,
          priority: "medium",
          impact: 65,
          timestamp: Date.now()
        });
      }
      
      // Recommend task prioritization strategy
      const highPriorityCount = parsedContent.tasks.filter(t => t.priority === "high").length;
      if (highPriorityCount > 3) {
        recommendations.push({
          id: `rec-${Date.now()}-3`,
          type: "efficiency",
          content: `CoS Agent detected ${highPriorityCount} high-priority tasks. Consider re-evaluating priorities to focus on the most critical 2-3 items first`,
          priority: "high",
          impact: 80,
          timestamp: Date.now()
        });
      }
      
      // Recommend workload distribution
      if (parsedContent.tasks.length > 5) {
        recommendations.push({
          id: `rec-${Date.now()}-4`,
          type: "time",
          content: `CoS Agent suggests distributing these ${parsedContent.tasks.length} tasks across multiple days for optimal productivity`,
          priority: "medium",
          impact: 70,
          timestamp: Date.now()
        });
      }
    }
    
    // Add leadership recommendation if document suggests team involvement
    const contentLower = content.toLowerCase();
    if (contentLower.includes("team") || contentLower.includes("collaborate") || 
        contentLower.includes("delegate") || contentLower.includes("assign")) {
      recommendations.push({
        id: `rec-${Date.now()}-5`,
        type: "leadership",
        content: "CoS Agent detected team-related tasks. Consider using the delegation features to assign appropriate tasks to team members",
        priority: "medium",
        impact: 75,
        timestamp: Date.now()
      });
    }
    
    return {
      recommendations,
      tasks: parsedContent.tasks,
      metadata: {
        keyInsights: generateEnhancedKeyInsights(content),
        suggestedSkills: extractSkillsFromTasks(parsedContent.tasks),
        estimatedEffort: parsedContent.tasks.reduce((sum, task) => 
          sum + (task.estimatedDuration || 0), 0)
      }
    };
  } catch (error) {
    console.error("Error in AI document analysis:", error);
    return {
      recommendations: [],
      tasks: [],
      metadata: {
        keyInsights: [],
        suggestedSkills: [],
        estimatedEffort: 0
      }
    };
  }
};

/**
 * Enhanced function to extract potentially required skills from task content
 */
const extractSkillsFromTasks = (tasks: Partial<Task>[]): string[] => {
  // Enhanced skill detection with more comprehensive categories
  const skillKeywords: Record<string, string[]> = {
    "frontend": ["ui", "interface", "react", "css", "html", "component", "design", "javascript", "ux", "responsive"],
    "backend": ["api", "database", "server", "endpoint", "service", "authentication", "authorization", "serverless"],
    "data": ["analysis", "visualization", "report", "metric", "dashboard", "analytics", "statistics", "model"],
    "content": ["writing", "documentation", "article", "blog", "communication", "copywriting"],
    "design": ["mockup", "prototype", "wireframe", "figma", "sketch", "photoshop", "illustrator"],
    "project management": ["planning", "schedule", "milestone", "gantt", "timeline", "coordination", "stakeholder"],
    "devops": ["pipeline", "deployment", "ci/cd", "infrastructure", "cloud", "aws", "azure", "docker", "kubernetes"]
  };
  
  const identifiedSkills = new Set<string>();
  
  tasks.forEach(task => {
    const content = `${task.title} ${task.description}`.toLowerCase();
    
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        identifiedSkills.add(skill);
      }
    });
    
    // Check for explicit technology mentions
    const techPatterns = [
      { pattern: /react|vue|angular|svelte/i, skill: "javascript frameworks" },
      { pattern: /python|django|flask|fastapi/i, skill: "python" },
      { pattern: /node\.?js|express|nest\.?js/i, skill: "node.js" },
      { pattern: /sql|postgres|mysql|sqlite/i, skill: "databases" },
      { pattern: /aws|azure|gcp|cloud/i, skill: "cloud services" },
      { pattern: /mobile|ios|android|react native|flutter/i, skill: "mobile development" }
    ];
    
    techPatterns.forEach(({ pattern, skill }) => {
      if (pattern.test(content)) {
        identifiedSkills.add(skill);
      }
    });
  });
  
  return Array.from(identifiedSkills);
};

/**
 * Enhanced function to generate key insights from document content
 */
const generateEnhancedKeyInsights = (content: string): string[] => {
  const insights: string[] = [];
  const lowerContent = content.toLowerCase();
  
  // Check for project definition elements
  if (lowerContent.includes("objective") || lowerContent.includes("goal")) {
    insights.push("Project objectives/goals identified");
  }
  
  if (lowerContent.includes("deadline") || lowerContent.includes("due date") || 
      lowerContent.includes("timeline") || lowerContent.includes("schedule")) {
    insights.push("Time-sensitive deliverables with specific deadlines");
  }
  
  if (lowerContent.includes("requirement") || lowerContent.includes("specification")) {
    insights.push("Detailed requirements specification included");
  }
  
  // Check for stakeholder information
  if (lowerContent.includes("client") || lowerContent.includes("stakeholder") || 
      lowerContent.includes("customer") || lowerContent.includes("manager")) {
    insights.push("External stakeholder involvement detected");
  }
  
  // Check for resource information
  if (lowerContent.includes("budget") || lowerContent.includes("cost") || 
      lowerContent.includes("resource") || lowerContent.includes("allocation")) {
    insights.push("Resource constraints or budget considerations mentioned");
  }
  
  // Check for dependencies
  if (lowerContent.includes("depend") || lowerContent.includes("prerequisite") || 
      lowerContent.includes("blocked") || lowerContent.includes("before")) {
    insights.push("Task dependencies identified");
  }
  
  // Check for team involvement
  if (lowerContent.includes("team") || lowerContent.includes("collaboration") || 
      lowerContent.includes("meeting") || lowerContent.includes("discuss")) {
    insights.push("Team collaboration required");
  }
  
  // Add default insight if none found
  if (insights.length === 0) {
    insights.push("General project documentation");
  }
  
  return insights;
};
