
import { getDatabase, ref, get, set, push } from "firebase/database";
import type { Task } from "@/types/task";
import type { CostMetrics, ThresholdAlert, CostApproval } from "@/types/cost";

const HOURLY_RATE = 150; // Base hourly rate in USD
const OVERHEAD_MULTIPLIER = 1.3; // 30% overhead
const COST_THRESHOLD_WARNING = 5000; // $5000 warning threshold
const COST_THRESHOLD_CRITICAL = 10000; // $10000 critical threshold

export const evaluateTaskCost = async (userId: string, taskId: string): Promise<number> => {
  const db = getDatabase();
  const taskRef = ref(db, `users/${userId}/tasks/${taskId}`);
  const snapshot = await get(taskRef);
  const task = snapshot.val() as Task;

  if (!task) return 0;

  const totalMinutes = task.totalElapsedTime ? task.totalElapsedTime / (1000 * 60) : 0;
  const hours = totalMinutes / 60;
  const laborCost = hours * HOURLY_RATE;
  const totalCost = laborCost * OVERHEAD_MULTIPLIER;

  // Update task with cost information
  await set(ref(db, `users/${userId}/tasks/${taskId}/metadata/cost`), {
    laborCost,
    totalCost,
    lastUpdated: Date.now()
  });

  return totalCost;
};

export const checkCostThresholds = async (
  userId: string,
  cost: number
): Promise<ThresholdAlert[]> => {
  const alerts: ThresholdAlert[] = [];
  const now = Date.now();

  if (cost > COST_THRESHOLD_CRITICAL) {
    alerts.push({
      id: `alert-${now}`,
      type: "cost",
      threshold: COST_THRESHOLD_CRITICAL,
      currentValue: cost,
      status: "critical",
      createdAt: now
    });
  } else if (cost > COST_THRESHOLD_WARNING) {
    alerts.push({
      id: `alert-${now}`,
      type: "cost",
      threshold: COST_THRESHOLD_WARNING,
      currentValue: cost,
      status: "warning",
      createdAt: now
    });
  }

  // Store alerts in database
  const db = getDatabase();
  await set(ref(db, `users/${userId}/costAlerts`), alerts);

  return alerts;
};

export const requestCostApproval = async (
  userId: string,
  taskId: string,
  amount: number,
  justification: string
): Promise<string> => {
  const db = getDatabase();
  const approvalRef = push(ref(db, `users/${userId}/costApprovals`));
  
  const approval: CostApproval = {
    id: approvalRef.key as string,
    taskId,
    requestedBy: userId,
    amount,
    justification,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await set(approvalRef, approval);
  return approval.id;
};

export const updateTaskCostMetrics = async (userId: string): Promise<CostMetrics> => {
  const db = getDatabase();
  const tasksRef = ref(db, `users/${userId}/tasks`);
  const snapshot = await get(tasksRef);
  const tasks = snapshot.val() as Record<string, Task>;

  let totalCost = 0;
  let totalEfficiency = 0;
  let taskCount = 0;

  for (const taskId in tasks) {
    const task = tasks[taskId];
    const cost = await evaluateTaskCost(userId, taskId);
    totalCost += cost;

    if (task.estimatedDuration && task.totalElapsedTime) {
      const efficiency = task.estimatedDuration * 60 * 1000 / task.totalElapsedTime;
      totalEfficiency += efficiency;
      taskCount++;
    }
  }

  const costMetrics: CostMetrics = {
    hourlyRate: HOURLY_RATE,
    totalCost,
    remainingBudget: 50000 - totalCost, // Example budget of $50,000
    costEfficiencyScore: taskCount > 0 ? (totalEfficiency / taskCount) * 100 : 100,
    thresholdAlerts: await checkCostThresholds(userId, totalCost),
    costBreakdown: {
      laborCost: totalCost / OVERHEAD_MULTIPLIER,
      toolingCost: totalCost * 0.1, // Example: 10% of total cost
      overheadCost: totalCost - (totalCost / OVERHEAD_MULTIPLIER),
      date: Date.now()
    }
  };

  await set(ref(db, `users/${userId}/costMetrics`), costMetrics);
  return costMetrics;
};
