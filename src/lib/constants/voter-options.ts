type OccupationOption = {
  value: string;
  label: string;
  description?: string;
};

type OccupationGroup = {
  heading: string;
  options: OccupationOption[];
};

// Voter form options centralized dropdown/select options for voter registration and profile forms.
export const OCCUPATION_OPTION_GROUPS: OccupationGroup[] = [
  {
    heading: "Common",
    options: [
      {
        value: "farmer",
        label: "Farmer",
        description: "Crop farming, livestock, or agro work",
      },
      {
        value: "trader",
        label: "Trader / Business Owner",
        description: "Market sellers, shop owners, and small businesses",
      },
      {
        value: "civil-servant",
        label: "Civil Servant",
        description: "Government or public sector worker",
      },
      {
        value: "teacher",
        label: "Teacher / Educator",
        description: "School, college, or training staff",
      },
      {
        value: "student",
        label: "Student",
        description: "Secondary school, college, or university",
      },
      {
        value: "self-employed",
        label: "Self Employed",
        description: "Independent work or personal services",
      },
      {
        value: "unemployed",
        label: "Unemployed",
        description: "Currently not in paid work",
      },
      {
        value: "retired",
        label: "Retired",
        description: "Not currently working",
      },
    ],
  },
  {
    heading: "Work & Services",
    options: [
      {
        value: "artisan",
        label: "Artisan",
        description: "Carpenter, tailor, mechanic, or craft worker",
      },
      {
        value: "driver",
        label: "Driver / Transport Worker",
        description: "Commercial driver, rider, or transport staff",
      },
      {
        value: "healthcare-worker",
        label: "Healthcare Worker",
        description: "Clinic, pharmacy, hospital, or care worker",
      },
      {
        value: "security",
        label: "Security Personnel",
        description: "Private or public security work",
      },
      {
        value: "nurse",
        label: "Nurse",
        description: "Registered nurse or nursing staff",
      },
      {
        value: "doctor",
        label: "Doctor / Medical Professional",
        description: "Doctor, clinician, or medical specialist",
      },
    ],
  },
  {
    heading: "Professional",
    options: [
      {
        value: "engineer",
        label: "Engineer",
        description: "Engineering, technical, or infrastructure work",
      },
      {
        value: "accountant",
        label: "Accountant",
        description: "Finance, bookkeeping, or audit work",
      },
      {
        value: "lawyer",
        label: "Lawyer",
        description: "Legal practice or advisory work",
      },
      {
        value: "banker",
        label: "Banker",
        description: "Banking, finance, or lending work",
      },
      {
        value: "journalist",
        label: "Journalist / Media",
        description: "Print, broadcast, digital, or media work",
      },
    ],
  },
  {
    heading: "Faith & Community",
    options: [
      {
        value: "pastor",
        label: "Pastor / Religious Leader",
        description: "Church leadership or ministry",
      },
      {
        value: "imam",
        label: "Imam / Religious Leader",
        description: "Mosque leadership or ministry",
      },
      {
        value: "private-sector",
        label: "Private Sector Employee",
        description: "Company or organization staff",
      },
      {
        value: "other",
        label: "Other",
        description: "Choose this if your work is not listed",
      },
    ],
  },
];

export const OCCUPATION_OPTIONS: OccupationOption[] =
  OCCUPATION_OPTION_GROUPS.flatMap((group) => group.options);

export const RELIGION_OPTIONS = [
  { value: "christianity", label: "Christianity" },
  { value: "islam", label: "Islam" },
  { value: "traditional", label: "Traditional Religion" },
  { value: "other", label: "Other" },
  { value: "none", label: "None/Prefer not to say" },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
] as const;
