import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { CollectApiError } from "@/features/collect/api/collect-api";
import type { RegistrationFormData } from "@/features/collect/schemas/collect-schemas";

export const HANDLED_SUBMIT_REASONS = new Set([
  "identity_required",
  "identity_incomplete",
  "vin_required",
  "invalid_vin_format",
  "duplicate_phone",
  "duplicate_vin",
]);

type ApplyCollectSubmitErrorArgs = {
  error: Error;
  form: UseFormReturn<RegistrationFormData>;
  setScreen: (screen: number) => void;
};

export function applyCollectSubmitError({
  error,
  form,
  setScreen,
}: ApplyCollectSubmitErrorArgs) {
  const msg = error.message || "";
  const reason = error instanceof CollectApiError ? error.reason : undefined;

  if (reason === "identity_required") {
    setScreen(3);
    form.setError("identityType", {
      message: "Please complete your identity verification.",
    });
    toast.error("Verification Required", {
      description:
        "This form now requires identity verification. Please fill in the fields.",
      duration: 6000,
    });
    return;
  }

  if (reason === "identity_incomplete") {
    const identityType = form.getValues("identityType");
    const identityValue = form.getValues("identityValue")?.trim();
    const hasType = Boolean(identityType);
    const hasValue = Boolean(identityValue);

    setScreen(3);

    if (hasType && !hasValue) {
      form.setError("identityValue", {
        message:
          'Enter the number for the selected method, or use "Leave blank instead" to skip this optional section.',
      });
    } else if (!hasType && hasValue) {
      form.setError("identityType", {
        message:
          "Choose a verification method for this number, or clear it to skip this optional section.",
      });
    } else {
      form.setError("identityType", {
        message:
          'Complete this optional section, or use "Leave blank instead" to skip it.',
      });
    }

    toast.error("Complete this section or leave it blank", {
      description:
        'You selected a verification method. Enter the number, or use "Leave blank instead" to skip this optional section.',
      duration: 6000,
    });
    return;
  }

  if (reason === "vin_required") {
    setScreen(3);
    form.setError("voterIdNumber", {
      message: "Voter ID (VIN) is required for this campaign.",
    });
    toast.error("Voter ID Required", {
      description: "This form now requires your Voter ID number.",
      duration: 6000,
    });
    return;
  }

  if (reason === "invalid_vin_format") {
    setScreen(3);
    form.setError("voterIdNumber", {
      message:
        "Voter ID must be exactly 19 alphanumeric characters. Please check your PVC.",
    });
    toast.error("Invalid Voter ID", {
      description:
        "Please re-enter your Voter ID — it must be exactly 19 characters.",
      duration: 6000,
    });
    return;
  }

  if (reason === "duplicate_phone") {
    setScreen(1);
    form.clearErrors(["identityType", "identityValue", "voterIdNumber"]);
    form.setError("phone", {
      message: "This phone number has already been used for this campaign.",
    });
    toast.error("Phone Number Already Used", {
      description: "This phone number has already been used for this campaign.",
      duration: 6000,
    });
    return;
  }

  if (reason === "duplicate_vin") {
    setScreen(3);
    form.clearErrors(["phone"]);
    form.setError("voterIdNumber", {
      message: "This Voter ID (VIN) has already been used for this campaign.",
    });
    toast.error("Voter ID Already Used", {
      description:
        "This Voter ID (VIN) has already been used for this campaign.",
      duration: 6000,
    });
    return;
  }

  if (msg.includes("already registered")) {
    toast.error("Duplicate Registration", {
      description:
        "This registration matches an existing record for this campaign.",
      duration: 6000,
    });
    return;
  }

  toast.error("Submission Failed", {
    description: msg || "Please try again.",
  });
}
