import type { RegistrationFormData } from "@/lib/schemas/collect-schemas";

export const COLLECT_TOTAL_SCREENS = 7; // 0=splash, 1-5=input, 6=confirmation
export const COLLECT_CONFIRMATION_SCREEN = COLLECT_TOTAL_SCREENS - 1;
export const COLLECT_LAST_INPUT_SCREEN = COLLECT_TOTAL_SCREENS - 2;

export const COLLECT_STEP_TITLES = [
  "Welcome",
  "Personal Details",
  "Location",
  "Party Information",
  "Your Role",
  "Canvasser",
  "Confirmation",
] as const;

export const COLLECT_STEP_KEYS = [
  "welcome",
  "personal_details",
  "location",
  "party_information",
  "role",
  "canvasser",
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
  3: ["apcRegNumber", "voterIdNumber"],
  4: ["role"],
  5: ["canvasserName", "canvasserPhone"],
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
    ? COLLECT_STEP_TITLES.slice(1, 5)
    : COLLECT_STEP_TITLES.slice(1, 6);
}

export function getCollectProgressTotalSteps(skipCanvasserStep: boolean) {
  return COLLECT_LAST_INPUT_SCREEN - (skipCanvasserStep ? 1 : 0);
}
