
import { Task } from "@/types/task";
import { DomainCategory } from "./types";

/**
 * Enhanced task generator with improved metadata extraction and auto-categorization
 */
export const generateTasksFromDocuments = (
  documents: Record<string, string>,
  domain: DomainCategory
): Partial<Task>[] => {
  const tasks: Partial<Task>[] = [];
  
  // Create a task for each document with enhanced extraction
  Object.entries(documents).forEach(([docType, content]) => {
    // Extract potential tasks from document content using enhanced regex patterns
    const taskLines = content.match(/(?:^|\n)[-*•] (.+?)(?:\n|$)/g) || [];
    const bulletPoints = content.match(/(?:^|\n)(\d+\.\s)(.+?)(?:\n|$)/g) || [];
    const sections = content.match(/(?:^|\n)#{1,3}\s(.+?)(?:\n|$)/g) || [];
    
    // Process bullet point tasks with improved metadata extraction
    taskLines.forEach((line, index) => {
      const taskContent = line.replace(/^[-*•] /, '').trim();
      if (taskContent) {
        // Extract complexity and priority from task content
        const { complexity, priority, estimatedTime, tags } = extractTaskMetadata(taskContent, domain, docType);
        
        tasks.push({
          title: `[${domain}] ${docType} - ${taskContent}`,
          description: `Task extracted from ${docType} document for ${domain} domain.`,
          status: "todo",
          estimatedDuration: estimatedTime, 
          actualDuration: 0,
          priority: priority,
          tags: [...tags, domain, docType],
          metadata: {
            complexity: complexity,
            impact: determineImpact(taskContent, complexity),
            businessValue: calculateBusinessValue(taskContent, complexity),
            learningOpportunity: calculateLearningValue(taskContent, complexity),
            domain: domain,
            aiEligible: isAiEligible(taskContent),
            externalStakeholder: hasExternalStakeholder(taskContent, docType),
            autoSplitEligible: estimatedTime > 120 // Tasks over 2 hours are eligible for auto-splitting
          }
        });
      }
    });
    
    // Process numbered lists
    bulletPoints.forEach((line, index) => {
      const taskContent = line.replace(/^\d+\.\s/, '').trim();
      if (taskContent) {
        const { complexity, priority, estimatedTime, tags } = extractTaskMetadata(taskContent, domain, docType);
        
        tasks.push({
          title: `[${domain}] ${docType} - ${taskContent}`,
          description: `Task extracted from ${docType} document for ${domain} domain (numbered list).`,
          status: "todo",
          estimatedDuration: estimatedTime,
          actualDuration: 0,
          priority: priority,
          tags: [...tags, domain, docType, "sequential"],
          metadata: {
            complexity: complexity,
            impact: determineImpact(taskContent, complexity),
            businessValue: calculateBusinessValue(taskContent, complexity),
            learningOpportunity: calculateLearningValue(taskContent, complexity),
            domain: domain,
            aiEligible: isAiEligible(taskContent),
            externalStakeholder: hasExternalStakeholder(taskContent, docType)
          }
        });
      }
    });
    
    // Process section headers as higher-level tasks
    sections.forEach((section, index) => {
      const sectionTitle = section.replace(/^#{1,3}\s/, '').trim();
      if (sectionTitle && !sectionTitle.toLowerCase().includes("introduction") && 
          !sectionTitle.toLowerCase().includes("overview") && 
          !sectionTitle.toLowerCase().includes("summary")) {
        
        const { complexity, priority, estimatedTime, tags } = extractTaskMetadata(sectionTitle, domain, docType);
        
        // Create parent task from section
        const parentTask: Partial<Task> = {
          title: `[${domain}] ${docType} - ${sectionTitle}`,
          description: `Main task extracted from section in ${docType} document for ${domain} domain.`,
          status: "todo",
          estimatedDuration: estimatedTime,
          actualDuration: 0,
          priority: priority,
          tags: [...tags, domain, docType, "parent"],
          metadata: {
            complexity: complexity,
            impact: "high", // Section-level tasks are typically high impact
            businessValue: 8, // Higher business value for section tasks
            learningOpportunity: 7,
            domain: domain,
            hasSubtasks: true, // Mark as having subtasks
            aiEligible: false, // Parent tasks typically need human oversight
            externalStakeholder: hasExternalStakeholder(sectionTitle, docType)
          }
        };
        
        tasks.push(parentTask);
      }
    });

    // Create a document review task with enhanced metadata
    tasks.push({
      title: `Review ${docType.replace(/-/g, " ")} for ${domain} domain`,
      description: `Review and approve the ${docType.replace(/-/g, " ")} document for the ${domain} domain.`,
      status: "todo",
      estimatedDuration: 30, // 30 minutes for review
      actualDuration: 0,
      priority: "high",
      tags: [domain, docType, "review", "quality-assurance"],
      metadata: {
        complexity: "low",
        impact: "high",
        businessValue: 8,
        learningOpportunity: 4,
        domain: domain,
        aiEligible: false, // Reviews typically need human judgment
        externalStakeholder: docType.toLowerCase().includes("requirement") || docType.toLowerCase().includes("client")
      }
    });
  });
  
  // Link tasks by creating basic dependency relationships
  linkTaskDependencies(tasks, domain);
  
  return tasks;
};

/**
 * Extract task metadata from content with enhanced heuristics
 */
function extractTaskMetadata(
  content: string, 
  domain: DomainCategory, 
  docType: string
): { 
  complexity: "low" | "medium" | "high";
  priority: "low" | "medium" | "high";
  estimatedTime: number;
  tags: string[];
} {
  const lowerContent = content.toLowerCase();
  
  // Determine complexity based on multiple factors
  let complexity: "low" | "medium" | "high" = "medium";
  
  // Complexity keywords
  const lowComplexityTerms = ["simple", "basic", "minor", "quick", "easy", "small", "trivial"];
  const highComplexityTerms = ["complex", "challenging", "difficult", "major", "comprehensive", 
                             "critical", "intricate", "advanced", "significant", "extensive"];
  
  if (highComplexityTerms.some(term => lowerContent.includes(term))) {
    complexity = "high";
  } else if (lowComplexityTerms.some(term => lowerContent.includes(term))) {
    complexity = "low";
  } else {
    // Default to medium, but check length as a secondary indicator
    complexity = content.length > 80 ? "high" : content.length > 40 ? "medium" : "low";
  }
  
  // Extract time indicators if present
  let estimatedTime = 60; // Default 1 hour
  
  if (complexity === "low") {
    estimatedTime = 30;
  } else if (complexity === "high") {
    estimatedTime = 180;
  }
  
  // Check for explicit time mentions
  const hourMatch = lowerContent.match(/(\d+)\s*hours?/);
  const minuteMatch = lowerContent.match(/(\d+)\s*min(ute)?s?/);
  const dayMatch = lowerContent.match(/(\d+)\s*days?/);
  
  if (dayMatch && parseInt(dayMatch[1]) > 0) {
    // Convert days to minutes (max 3 hours per task)
    estimatedTime = Math.min(parseInt(dayMatch[1]) * 8 * 60, 180);
  } else if (hourMatch && parseInt(hourMatch[1]) > 0) {
    // Convert hours to minutes (max 3 hours)
    estimatedTime = Math.min(parseInt(hourMatch[1]) * 60, 180);
  } else if (minuteMatch && parseInt(minuteMatch[1]) > 0) {
    estimatedTime = parseInt(minuteMatch[1]);
  }
  
  // Determine priority based on content and document type
  let priority: "low" | "medium" | "high" = "medium";
  
  const highPriorityTerms = ["urgent", "critical", "important", "high priority", "asap", "immediately",
                           "top priority", "highest priority", "p0", "p1", "blocker", "blocking"];
  const lowPriorityTerms = ["low priority", "when possible", "optional", "nice to have", "p3", "p4",
                          "if time permits", "backlog", "later", "eventually", "not urgent"];
  
  if (highPriorityTerms.some(term => lowerContent.includes(term))) {
    priority = "high";
  } else if (lowPriorityTerms.some(term => lowerContent.includes(term))) {
    priority = "low";
  } else if (docType.includes("requirement") || docType.includes("critical")) {
    // Document type can influence priority
    priority = "high";
  }
  
  // Extract tags based on content analysis
  const tags: string[] = [];
  
  // Domain-specific tags
  const domainTags: Record<string, string[]> = {
    "frontend": ["ui", "interface", "design", "css", "html", "component", "user experience", "ux"],
    "backend": ["api", "server", "database", "endpoint", "service", "authentication", "authorization"],
    "data-engineering": ["data", "pipeline", "etl", "analytics", "visualization", "dashboard", "reporting"],
    "documentation": ["docs", "document", "wiki", "readme", "guide", "manual"],
    "testing": ["test", "unit test", "integration", "qa", "quality assurance"],
    "strategy": ["plan", "roadmap", "strategy", "vision", "goal", "objective"],
    "product-design": ["wireframe", "mockup", "prototype", "user flow", "journey map"]
  };
  
  // Check for domain-specific keywords and add relevant tags
  for (const [tagDomain, keywords] of Object.entries(domainTags)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      tags.push(tagDomain);
    }
  }
  
  // Add technical skill tags if detected
  const technicalTags: Record<string, RegExp> = {
    "react": /react|jsx|component|hook|state management/i,
    "api": /api|endpoint|rest|graphql|http/i,
    "database": /database|sql|query|schema|table|model/i,
    "testing": /test|spec|assertion|coverage|mock/i,
    "ui": /ui|interface|layout|design|css|style/i,
    "documentation": /document|readme|wiki|guide|comment/i
  };
  
  for (const [tag, regex] of Object.entries(technicalTags)) {
    if (regex.test(lowerContent)) {
      tags.push(tag);
    }
  }
  
  return { complexity, priority, estimatedTime, tags };
}

/**
 * Determine task impact based on content and complexity
 */
function determineImpact(content: string, complexity: "low" | "medium" | "high"): "low" | "medium" | "high" {
  const lowerContent = content.toLowerCase();
  
  // High impact markers
  if (lowerContent.includes("critical") || 
      lowerContent.includes("key feature") || 
      lowerContent.includes("core functionality") ||
      lowerContent.includes("user-facing") ||
      lowerContent.includes("essential")) {
    return "high";
  }
  
  // Low impact markers
  if (lowerContent.includes("minor") || 
      lowerContent.includes("nice to have") || 
      lowerContent.includes("optional") ||
      lowerContent.includes("internal only")) {
    return "low";
  }
  
  // Default based on complexity
  return complexity === "high" ? "high" : complexity === "medium" ? "medium" : "low";
}

/**
 * Calculate business value on a scale of 1-10
 */
function calculateBusinessValue(content: string, complexity: "low" | "medium" | "high"): number {
  const lowerContent = content.toLowerCase();
  let value = 5; // Default mid-range value
  
  // High value indicators
  if (lowerContent.includes("revenue") || 
      lowerContent.includes("conversion") || 
      lowerContent.includes("user acquisition") ||
      lowerContent.includes("retention") ||
      lowerContent.includes("core feature")) {
    value += 3;
  }
  
  // Adjust based on complexity
  if (complexity === "high") {
    value += 1;
  } else if (complexity === "low") {
    value -= 1;
  }
  
  // Cap between 1-10
  return Math.max(1, Math.min(10, value));
}

/**
 * Calculate learning opportunity value on a scale of 1-10
 */
function calculateLearningValue(content: string, complexity: "low" | "medium" | "high"): number {
  const lowerContent = content.toLowerCase();
  let value = 5; // Default mid-range value
  
  // High learning indicators
  if (lowerContent.includes("new technology") || 
      lowerContent.includes("innovation") || 
      lowerContent.includes("research") ||
      lowerContent.includes("explore") ||
      lowerContent.includes("learning opportunity")) {
    value += 3;
  }
  
  // Adjust based on complexity
  if (complexity === "high") {
    value += 2;
  } else if (complexity === "low") {
    value -= 2;
  }
  
  // Cap between 1-10
  return Math.max(1, Math.min(10, value));
}

/**
 * Determine if a task is eligible for AI assistance
 */
function isAiEligible(content: string): boolean {
  const lowerContent = content.toLowerCase();
  
  // Tasks that typically need human judgment
  const humanRequiredPatterns = [
    /review/i, /approve/i, /decide/i, /judgment/i, /evaluate/i, 
    /assess/i, /determine/i, /creative/i, /innovative/i,
    /stakeholder/i, /client/i, /meeting/i
  ];
  
  // If any human-required pattern is found, not AI eligible
  if (humanRequiredPatterns.some(pattern => pattern.test(lowerContent))) {
    return false;
  }
  
  // Tasks that are potentially AI-eligible
  const aiEligiblePatterns = [
    /generate/i, /calculate/i, /report/i, /compile/i,
    /format/i, /convert/i, /extract/i, /simple/i,
    /repetitive/i, /automate/i, /data entry/i
  ];
  
  // If any AI-eligible pattern is found, potentially AI eligible
  return aiEligiblePatterns.some(pattern => pattern.test(lowerContent));
}

/**
 * Check if task likely involves external stakeholders
 */
function hasExternalStakeholder(content: string, docType: string): boolean {
  const lowerContent = content.toLowerCase();
  const lowerDocType = docType.toLowerCase();
  
  // Document types that typically involve stakeholders
  if (lowerDocType.includes("requirement") || 
      lowerDocType.includes("client") ||
      lowerDocType.includes("stakeholder") ||
      lowerDocType.includes("presentation")) {
    return true;
  }
  
  // Content that suggests stakeholder involvement
  return lowerContent.includes("client") ||
         lowerContent.includes("stakeholder") ||
         lowerContent.includes("present to") ||
         lowerContent.includes("approval") ||
         lowerContent.includes("customer");
}

/**
 * Create dependency relationships between tasks
 */
function linkTaskDependencies(tasks: Partial<Task>[], domain: DomainCategory): void {
  // Group tasks by document type
  const tasksByDocType: Record<string, Partial<Task>[]> = {};
  
  tasks.forEach(task => {
    if (task.tags) {
      // Use the second tag which is typically the document type
      const docType = task.tags[1] || "unknown";
      
      if (!tasksByDocType[docType]) {
        tasksByDocType[docType] = [];
      }
      
      tasksByDocType[docType].push(task);
    }
  });
  
  // Natural document dependencies order (earlier documents are prerequisites for later ones)
  const documentOrder = [
    "project-charter", 
    "requirements", 
    "design-spec", 
    "technical-spec", 
    "implementation-plan",
    "test-plan"
  ];
  
  // For each document type
  Object.entries(tasksByDocType).forEach(([docType, docTasks]) => {
    // Find review task for this document
    const reviewTask = docTasks.find(task => 
      task.title?.includes("Review") && task.title?.includes(docType)
    );
    
    // Make other tasks in this document depend on review
    if (reviewTask) {
      docTasks.forEach(task => {
        if (task !== reviewTask && !task.title?.includes("Review")) {
          if (!task.dependencies) {
            task.dependencies = [];
          }
          
          // Add this document's review as a dependency
          if (reviewTask.id) {
            task.dependencies.push(reviewTask.id);
          }
        }
      });
    }
    
    // Find current document index in the order
    const currentDocIndex = documentOrder.indexOf(docType);
    
    if (currentDocIndex > 0) {
      // Get previous document type from the order
      const prevDocType = documentOrder[currentDocIndex - 1];
      
      // If there are tasks from the previous document
      if (tasksByDocType[prevDocType]) {
        // Find review task for the previous document
        const prevReviewTask = tasksByDocType[prevDocType].find(task => 
          task.title?.includes("Review") && task.title?.includes(prevDocType)
        );
        
        // Make all tasks in current document depend on previous document review
        if (prevReviewTask && prevReviewTask.id) {
          docTasks.forEach(task => {
            if (!task.dependencies) {
              task.dependencies = [];
            }
            
            task.dependencies.push(prevReviewTask.id);
          });
        }
      }
    }
  });
}
