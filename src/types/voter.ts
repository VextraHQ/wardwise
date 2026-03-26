export type Voter = {
  id: string;
  nin?: string; // National Identification Number (optional — canvasser may not have it)
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string; // ISO date string (optional for field registration)
  yearOfBirth?: number; // Simpler alternative to dateOfBirth
  email?: string; // Not collected in field — optional
  phoneNumber: string; // Primary contact channel & secondary dedup key
  gender?: string;
  occupation?: string;
  religion?: string;
  age?: number; // Derived from yearOfBirth, optional
  state: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  role: string; // Default "voter"
  vin?: string; // Legacy VIN field — optional
  canvasserCode?: string; // Links to canvasser who registered this voter

  // Canvasser workflow fields
  supportLevel?: string; // "strong" | "leaning" | "undecided"
  contactOutcome?: string; // "spoke_to" | "not_home" | "refused"
  gpsLatitude?: number; // Silent GPS auto-capture
  gpsLongitude?: number; // Silent GPS auto-capture
  consentGiven?: boolean; // NDPA compliance
  notes?: string; // Canvasser notes about the voter

  registrationDate: string; // ISO date string
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
};
