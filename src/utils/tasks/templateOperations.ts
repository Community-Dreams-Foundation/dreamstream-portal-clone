
import { getDatabase, ref, set, get, push, query, orderByChild, equalTo, update } from "firebase/database";
import { TaskTemplate, TaskTemplateInput } from "@/types/template";
import { Task, TaskInput } from "@/types/task";

// Create a new task template
export const createTaskTemplate = async (userId: string, template: TaskTemplateInput): Promise<string> => {
  const db = getDatabase();
  const templatesRef = ref(db, `users/${userId}/taskTemplates`);
  const newTemplateRef = push(templatesRef);
  
  const newTemplate: TaskTemplate = {
    ...template,
    id: newTemplateRef.key as string,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    usageCount: 0
  };
  
  await set(newTemplateRef, newTemplate);
  return newTemplate.id;
};

// Fetch all task templates for a user
export const fetchTaskTemplates = async (userId: string): Promise<TaskTemplate[]> => {
  const db = getDatabase();
  const templatesRef = ref(db, `users/${userId}/taskTemplates`);
  
  const snapshot = await get(templatesRef);
  if (!snapshot.exists()) return [];
  
  const templates: TaskTemplate[] = [];
  snapshot.forEach((childSnapshot) => {
    templates.push({
      id: childSnapshot.key as string,
      ...childSnapshot.val()
    });
  });
  
  return templates;
};

// Update a task template
export const updateTaskTemplate = async (userId: string, templateId: string, updates: Partial<TaskTemplate>): Promise<void> => {
  const db = getDatabase();
  const templateRef = ref(db, `users/${userId}/taskTemplates/${templateId}`);
  
  const snapshot = await get(templateRef);
  if (!snapshot.exists()) {
    throw new Error("Template not found");
  }
  
  await update(templateRef, {
    ...updates,
    updatedAt: Date.now()
  });
};

// Delete a task template
export const deleteTaskTemplate = async (userId: string, templateId: string): Promise<void> => {
  const db = getDatabase();
  const templateRef = ref(db, `users/${userId}/taskTemplates/${templateId}`);
  
  const snapshot = await get(templateRef);
  if (!snapshot.exists()) {
    throw new Error("Template not found");
  }
  
  await set(templateRef, null);
};

// Create a task from a template
export const createTaskFromTemplate = async (
  userId: string, 
  templateId: string, 
  customizations: { title: string; description: string; dueDate?: number }
): Promise<string> => {
  const db = getDatabase();
  const templateRef = ref(db, `users/${userId}/taskTemplates/${templateId}`);
  
  const snapshot = await get(templateRef);
  if (!snapshot.exists()) {
    throw new Error("Template not found");
  }
  
  const template = snapshot.val() as TaskTemplate;
  
  // Create new task from template
  const tasksRef = ref(db, `users/${userId}/tasks`);
  const newTaskRef = push(tasksRef);
  
  const newTask: Task = {
    id: newTaskRef.key as string,
    title: customizations.title,
    description: customizations.description,
    ...template.templateData,
    dueDate: customizations.dueDate || template.templateData.dueDate,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  await set(newTaskRef, newTask);
  
  // Update template usage count
  await update(templateRef, {
    usageCount: (template.usageCount || 0) + 1,
    updatedAt: Date.now()
  });
  
  return newTask.id;
};

// Fetch templates by category
export const fetchTemplatesByCategory = async (userId: string, category: string): Promise<TaskTemplate[]> => {
  const db = getDatabase();
  const templatesRef = ref(db, `users/${userId}/taskTemplates`);
  
  const templatesQuery = query(templatesRef, orderByChild('category'), equalTo(category));
  const snapshot = await get(templatesQuery);
  
  if (!snapshot.exists()) return [];
  
  const templates: TaskTemplate[] = [];
  snapshot.forEach((childSnapshot) => {
    templates.push({
      id: childSnapshot.key as string,
      ...childSnapshot.val()
    });
  });
  
  return templates;
};
