import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Nigerian phone number validation
// Accepts formats: +2348031234567, 08031234567, 8031234567
export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(
    /^(\+234|0)?(7\d{2}|8\d{2}|9\d{2})\d{7}$/,
    "Enter a valid Nigerian mobile number (e.g., 08031234567 or +2348031234567)",
  );

// NIN (National Identification Number) validation
// NIN is an 11-digit number issued by NIMC
const NIN_REGEX = /^\d{11}$/;
export const ninSchema = z
  .string()
  .trim()
  .regex(NIN_REGEX, "NIN must contain only numbers (11 digits)")
  .length(11, "NIN must be exactly 11 digits")
  .refine((nin) => !/^(\d)\1{10}$/.test(nin), {
    message: "NIN cannot be all the same digit",
  })
  .refine(
    (nin) => nin !== "12345678901" && nin !== "01234567890",
    {
      message: "Please enter a valid NIN (sequential patterns not allowed)",
    }
  );

// VIN (Voter Identification Number) validation - 19-20 digits
const VIN_REGEX = /^\d{19,20}$/;
export const vinSchema = z
  .string()
  .trim()
  .regex(VIN_REGEX, "Please enter a valid VIN/PVC number (19-20 digits)")
  .optional();

// Helper functions for NIN
export const isValidNIN = (nin: string): boolean => {
  return NIN_REGEX.test(nin);
};

export const formatNINForDisplay = (nin: string): string => {
  if (!nin || nin.length !== 11) {
    return nin;
  }
  return `${nin.slice(0, 5)} ${nin.slice(5, 10)} ${nin.slice(10)}`;
};

export const normalizeNINInput = (input: string): string => {
  return input.replace(/\D/g, ""); // Remove all non-digits
};

// Helper functions for phone
export const isValidNigerianPhone = (phone: string): boolean => {
  return /^(\+234|0)?(7\d{2}|8\d{2}|9\d{2})\d{7}$/.test(phone);
};

export const normalizeNigerianPhoneInput = (input: string): string => {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // Already has 234 country code
  if (digits.startsWith("234")) {
    const localPart = digits.slice(3, 13);
    return localPart ? `+234${localPart}` : "";
  }

  // Local format starting with 0 (e.g., 08031234567)
  if (digits.startsWith("0")) {
    const localPart = digits.slice(1, 11);
    return localPart ? `+234${localPart}` : "";
  }

  // Assume it's missing the 0 prefix (e.g., 8031234567)
  const localPart = digits.slice(0, 10);
  return localPart ? `+234${localPart}` : "";
};

export const toLocalPhoneDisplay = (phone: string): string => {
  if (!phone) {
    return "";
  }

  if (!phone.startsWith("+234")) {
    return phone;
  }

  const digits = phone.slice(4);
  if (digits.length >= 10) {
    return `0${digits.slice(-10)}`;
  }

  return phone;
};
