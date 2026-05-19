import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";

export const COLLECT_TOTAL_SCREENS = 8; // 0=splash, 1-6=input, 7=confirmation
export const COLLECT_CONFIRMATION_SCREEN = COLLECT_TOTAL_SCREENS - 1;
export const COLLECT_LAST_INPUT_SCREEN = COLLECT_TOTAL_SCREENS - 2;

export const COLLECT_STEP_TITLES = [
  "Welcome",
  "Personal Details",
  "Location",
  "Identity & Verification",
  "Your Role",
  "Canvasser",
  "Review & Submit",
  "Confirmation",
] as const;

export const COLLECT_STEP_KEYS = [
  "welcome",
  "personal_details",
  "location",
  "identity_verification",
  "role",
  "canvasser",
  "review_submit",
  "confirmation",
] as const;

const SCREEN_FIELD_MAP: Record<number, (keyof RegistrationFormData)[]> = {
  1: [
    "firstName",
    "middleName",
    "lastName",
    "phone",
    "email",
    "sex",
    "age",
    "occupation",
    "maritalStatus",
  ],
  2: [
    "lgaId",
    "lgaName",
    "wardId",
    "wardName",
    "pollingUnitId",
    "pollingUnitName",
  ],
  3: ["identityType", "identityValue", "voterIdNumber"],
  4: ["role", "supportGroupName"],
  5: ["canvasserName", "canvasserPhone"],
  6: ["wantsEmailReceipt"],
};

export function getCollectScreenFields(screen: number) {
  return SCREEN_FIELD_MAP[screen];
}

export function getCollectProgressCurrentStep(
  screen: number,
  skipCanvasserStep: boolean,
) {
  return skipCanvasserStep && screen > 4 ? screen - 1 : screen;
}

export function getCollectProgressStepTitles(skipCanvasserStep: boolean) {
  return skipCanvasserStep
    ? [
        COLLECT_STEP_TITLES[1],
        COLLECT_STEP_TITLES[2],
        COLLECT_STEP_TITLES[3],
        COLLECT_STEP_TITLES[4],
        COLLECT_STEP_TITLES[6],
      ]
    : COLLECT_STEP_TITLES.slice(1, 7);
}

export function getCollectProgressTotalSteps(skipCanvasserStep: boolean) {
  return COLLECT_LAST_INPUT_SCREEN - (skipCanvasserStep ? 1 : 0);
}

export function getCollectScreenFromProgressStep(
  index: number,
  skipCanvasserStep: boolean,
) {
  if (!skipCanvasserStep) {
    return index + 1;
  }

  return index >= 4 ? index + 2 : index + 1;
}
