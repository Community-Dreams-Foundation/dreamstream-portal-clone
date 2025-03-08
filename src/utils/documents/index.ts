
import { DomainCategory, StandardDocumentType } from "./types";
import { createAllStandardDocuments } from "./standardDocuments";
import { createDomainSpecificDocuments } from "./domainDocuments";
import { generateTasksFromDocuments } from "./taskGenerator";
import { Task } from "@/types/task";

// Re-export types and constants
export * from "./types";
export * from "./standardDocuments";
export * from "./domainDocuments";
export * from "./taskGenerator";

// Generate full project documentation and tasks across all domains
export const generateFullProjectDocumentation = (
  projectTitle: string,
  projectDescription: string,
  priority: string,
  deadline: string
): { documents: Record<string, Record<string, string>>, tasks: Partial<Task>[] } => {
  const allDomains: DomainCategory[] = ["strategy", "data-engineering", "frontend", "product-design", "engagement"];
  const allDocuments: Record<string, Record<string, string>> = {};
  let allTasks: Partial<Task>[] = [];
  
  // Generate standard documents (common for the project)
  const standardDocs = createAllStandardDocuments(
    projectTitle,
    projectDescription, 
    priority,
    deadline
  );
  
  allDocuments["standard"] = standardDocs;
  
  // Generate domain-specific documents and tasks for each domain
  allDomains.forEach(domain => {
    // Generate domain-specific documents
    const domainDocs = createDomainSpecificDocuments(
      domain,
      projectTitle,
      projectDescription,
      priority,
      deadline
    );
    
    // Store domain documents
    allDocuments[domain] = domainDocs;
    
    // Generate tasks from domain documents
    const domainTasks = generateTasksFromDocuments(domainDocs, domain);
    
    // Add tasks to overall list
    allTasks = [...allTasks, ...domainTasks];
  });
  
  // Generate tasks from standard documents (assign them to strategy domain for simplicity)
  const standardTasks = generateTasksFromDocuments(standardDocs, "strategy");
  allTasks = [...allTasks, ...standardTasks];
  
  return {
    documents: allDocuments,
    tasks: allTasks
  };
};
