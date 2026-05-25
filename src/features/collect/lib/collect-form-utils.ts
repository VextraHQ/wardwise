import type { UseFormReturn } from "react-hook-form";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";

export function createCollectDefaultValues({
  prefilledCanvasserName,
  prefilledCanvasserPhone,
}: {
  prefilledCanvasserName: string;
  prefilledCanvasserPhone: string;
}): RegistrationFormData {
  return {
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    sex: undefined as unknown as RegistrationFormData["sex"],
    age: undefined as unknown as number,
    occupation: "",
    maritalStatus:
      undefined as unknown as RegistrationFormData["maritalStatus"],
    lgaId: undefined as unknown as number,
    lgaName: "",
    wardId: undefined as unknown as number,
    wardName: "",
    pollingUnitId: undefined as unknown as number,
    pollingUnitName: "",
    identityType: undefined as unknown as RegistrationFormData["identityType"],
    identityValue: "",
    voterIdNumber: "",
    role: undefined as unknown as RegistrationFormData["role"],
    supportGroupName: "",
    wantsEmailReceipt: false,
    customAnswer1: "",
    customAnswer2: "",
    canvasserName: prefilledCanvasserName,
    canvasserPhone: prefilledCanvasserPhone,
  };
}

export function focusFirstFieldError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<RegistrationFormData, any, any>,
  fields: (keyof RegistrationFormData)[],
) {
  const errs = form.formState.errors;
  for (const f of fields) {
    if (!errs[f]) continue;
    void form.setFocus(f);
    window.requestAnimationFrame(() => {
      document.activeElement?.scrollIntoView?.({
        behavior: "smooth",
        block: "center",
      });
    });
    return;
  }
}

export function getReviewEditNavProps(
  isEditingFromReview: boolean,
  nextLabel?: string,
) {
  return {
    backLabel: isEditingFromReview ? "Cancel edit" : "Back",
    nextLabel:
      nextLabel ?? (isEditingFromReview ? "Save & return" : "Continue"),
    navMobileLayout: (isEditingFromReview ? "stacked" : "inline") as
      | "inline"
      | "stacked",
    backVariant: "outline" as const,
  };
}
