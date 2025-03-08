
import { Task, TaskInput } from "@/types/task"

// Mock data to use instead of Firebase Realtime Database
const mockTasks: Record<string, Task[]> = {};

export const fetchTasks = async (userId: string): Promise<Task[]> => {
  console.log('Fetching mock tasks for user:', userId);
  return mockTasks[userId] || [];
}

export const createTask = async (userId: string, task: TaskInput): Promise<string> => {
  console.log('Creating mock task for user:', userId);
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  const newTask: Task = {
    id: taskId,
    ...task,
    isTimerRunning: false,
    totalElapsedTime: 0,
    createdAt: now,
    updatedAt: now,
    completionPercentage: 0,
    lastActivity: {
      type: "status_change",
      timestamp: now,
      details: "Task created"
    }
  };
  
  if (!mockTasks[userId]) {
    mockTasks[userId] = [];
  }
  
  mockTasks[userId].push(newTask);
  
  return taskId;
}
