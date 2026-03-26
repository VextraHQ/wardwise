/**
 * Data Validation Helpers
 *
 * NIN validation utilities for field registration.
 */

/**
 * NIN Validation Result Type
 */
export type NINValidationResult = {
  isValid: boolean;
  error?: string;
  formattedNIN?: string;
};

/**
 * Validates Nigerian National Identification Number (NIN)
 *
 * Rules:
 * - Must be exactly 11 digits
 * - Must contain only numeric characters
 * - No spaces, dashes, or special characters
 *
 * @param nin - The NIN string to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * validateNIN("12345678901") // { isValid: true, formattedNIN: "12345678901" }
 * validateNIN("123456789") // { isValid: false, error: "NIN must be exactly 11 digits" }
 */
export function validateNIN(nin: string): NINValidationResult {
  // Remove any whitespace
  const trimmedNIN = nin.trim();

  // Check if empty
  if (!trimmedNIN) {
    return {
      isValid: false,
      error: "NIN is required",
    };
  }

  // Check if contains only digits
  if (!/^\d+$/.test(trimmedNIN)) {
    return {
      isValid: false,
      error: "NIN must contain only numbers",
    };
  }

  // Check length
  if (trimmedNIN.length !== 11) {
    return {
      isValid: false,
      error: `NIN must be exactly 11 digits (you entered ${trimmedNIN.length})`,
    };
  }

  // Check if it's not all the same digit (e.g., "11111111111")
  if (/^(\d)\1{10}$/.test(trimmedNIN)) {
    return {
      isValid: false,
      error: "NIN cannot be all the same digit",
    };
  }

  // Check if it's not a sequential pattern (e.g., "12345678901")
  if (trimmedNIN === "12345678901" || trimmedNIN === "01234567890") {
    return {
      isValid: false,
      error: "Please enter a valid NIN (sequential patterns not allowed)",
    };
  }

  return {
    isValid: true,
    formattedNIN: trimmedNIN,
  };
}

/**
 * Quick check if NIN is valid (returns boolean only)
 * @param nin - The NIN string to validate
 * @returns true if valid, false otherwise
 */
export function isValidNIN(nin: string): boolean {
  return validateNIN(nin).isValid;
}

/**
 * Formats NIN for display (adds spaces for readability)
 * @param nin - The NIN string to format
 * @returns Formatted NIN (e.g., "123 4567 8901")
 *
 * @example
 * formatNINForDisplay("12345678901") // "123 4567 8901"
 */
export function formatNINForDisplay(nin: string): string {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 3)} ${nin.slice(3, 7)} ${nin.slice(7)}`;
}

/**
 * Masks NIN for privacy (shows only last 4 digits)
 * @param nin - The NIN string to mask
 * @returns Masked NIN (e.g., "*******8901")
 *
 * @example
 * maskNIN("12345678901") // "*******8901"
 */
export function maskNIN(nin: string): string {
  if (!nin || nin.length !== 11) return nin;
  return `*******${nin.slice(-4)}`;
}
