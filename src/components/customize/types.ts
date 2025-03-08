
import { z } from "zod";

export const cosCustomizationSchema = z.object({
  communicationStyle: z.enum(["Direct", "Collaborative", "Diplomatic", "Analytical"]),
  primaryFocus: z.enum(["Strategic Planning", "Project Management", "Team Coordination", "Resource Optimization", "Process Improvement"]),
  decisionStyle: z.enum(["Data-Driven", "Intuitive", "Balanced", "Consultative"]),
  feedbackPreference: z.enum(["Real-time", "Scheduled", "As-needed", "Milestone-based"]),
  specialInstructions: z.string().max(500).optional(),
});

export type CosCustomizationData = z.infer<typeof cosCustomizationSchema>;

