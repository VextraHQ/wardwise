// Voter Form Options Centralized dropdown/select options for voter registration and profile forms.

export const OCCUPATION_OPTIONS = [
  { value: "civil-servant", label: "Civil Servant" },
  { value: "teacher", label: "Teacher/Educator" },
  { value: "healthcare-worker", label: "Healthcare Worker" },
  { value: "farmer", label: "Farmer" },
  { value: "trader", label: "Trader/Business Owner" },
  { value: "artisan", label: "Artisan (Carpenter, Tailor, etc.)" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed" },
  { value: "retired", label: "Retired" },
  { value: "private-sector", label: "Private Sector Employee" },
  { value: "security", label: "Security Personnel" },
  { value: "driver", label: "Driver/Transport Worker" },
  { value: "engineer", label: "Engineer" },
  { value: "lawyer", label: "Lawyer" },
  { value: "doctor", label: "Doctor/Medical Professional" },
  { value: "nurse", label: "Nurse" },
  { value: "accountant", label: "Accountant" },
  { value: "banker", label: "Banker" },
  { value: "journalist", label: "Journalist/Media" },
  { value: "pastor", label: "Pastor/Religious Leader" },
  { value: "imam", label: "Imam/Religious Leader" },
  { value: "self-employed", label: "Self Employed" },
  { value: "other", label: "Other" },
] as const;

export const RELIGION_OPTIONS = [
  { value: "christianity", label: "Christianity" },
  { value: "islam", label: "Islam" },
  { value: "traditional", label: "Traditional Religion" },
  { value: "other", label: "Other" },
  { value: "none", label: "None/Prefer not to say" },
] as const;
