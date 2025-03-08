
import { z } from "zod";
import { positions, availabilityOptions, membershipStatusOptions } from "./constants";

export const intakeFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  position: z.string().min(1, "Please select a position"),
  membershipStatus: z.string().min(1, "Please select your current status"),
  availability: z.number().min(1, "Please select your availability"),
  dreamerStatement: z
    .string()
    .min(100, "Statement must be at least 100 characters long")
    .max(1000, "Statement must not exceed 1000 characters"),
  resume: z.any(),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

export type OnboardingStep = "intake" | "personalization" | "simulation" | "completion";

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  totalSteps: number;
  completedSteps: number;
}
