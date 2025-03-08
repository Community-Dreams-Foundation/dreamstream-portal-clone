
import { Task, TaskInput } from "./task";

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateData: Omit<TaskInput, "title" | "description">;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
  isPublic: boolean;
  tags: string[];
}

export interface TaskTemplateInput extends Omit<TaskTemplate, "id" | "createdAt" | "updatedAt" | "usageCount"> {}
