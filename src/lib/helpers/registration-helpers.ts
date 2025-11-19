/**
 * Registration Status Helpers
 *
 * Single source of truth for computing registration status from lastCompletedStep.
 * This eliminates redundancy and prevents data inconsistency.
 */
import type { RegistrationStep } from "@/types/voter";

export const orderedSteps: RegistrationStep[] = [
  "nin",
  "profile",
  "location",
  "candidate",
  "survey",
  "confirm",
];

/**
 * Compute registration status from lastCompletedStep
 * Single source of truth - no redundancy
 *
 * @param lastCompletedStep - The last step the user completed
 * @returns "complete" if last step is "confirm", otherwise "incomplete"
 */
export function computeRegistrationStatus(
  lastCompletedStep: RegistrationStep | null | undefined,
): "complete" | "incomplete" {
  return lastCompletedStep === "confirm" ? "complete" : "incomplete";
}

/**
 * Get the next step after the last completed step
 *
 * @param lastCompletedStep - The last step the user completed
 * @returns The next step to complete
 */
export function getNextStep(
  lastCompletedStep: RegistrationStep | null | undefined,
): RegistrationStep {
  const currentIndex = lastCompletedStep
    ? orderedSteps.indexOf(lastCompletedStep)
    : -1;
  return orderedSteps[Math.min(currentIndex + 1, orderedSteps.length - 1)];
}

/**
 * Check if user can proceed to a specific step
 * Users can only proceed to the next step or go back to previous completed steps
 *
 * @param targetStep - The step to check
 * @param lastCompletedStep - The last step the user completed
 * @returns true if user can proceed to target step
 */
export function canProceedToStep(
  targetStep: RegistrationStep,
  lastCompletedStep: RegistrationStep | null | undefined,
): boolean {
  const targetIndex = orderedSteps.indexOf(targetStep);
  const lastIndex = lastCompletedStep
    ? orderedSteps.indexOf(lastCompletedStep)
    : -1;

  // Can only proceed to next step or previous completed steps
  return targetIndex <= lastIndex + 1;
}

/**
 * Get step label for display
 */
export function getStepLabel(step: RegistrationStep): string {
  const labels: Record<RegistrationStep, string> = {
    nin: "NIN Verification",
    profile: "Personal Information",
    location: "Voting Location",
    candidate: "Candidate Selection",
    survey: "Survey",
    confirm: "Confirmation",
  };
  return labels[step] || step;
}

/**
 * Get step progress percentage
 *
 * @param lastCompletedStep - The last step the user completed
 * @returns Progress percentage (0-100)
 */
export function getProgressPercentage(
  lastCompletedStep: RegistrationStep | null | undefined,
): number {
  if (!lastCompletedStep) return 0;
  const currentIndex = orderedSteps.indexOf(lastCompletedStep);
  return Math.round(((currentIndex + 1) / orderedSteps.length) * 100);
}
