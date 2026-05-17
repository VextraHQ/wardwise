export const NIGERIAN_PARTIES = [
  { value: "APC", label: "APC", description: "All Progressives Congress" },
  { value: "PDP", label: "PDP", description: "Peoples Democratic Party" },
  { value: "LP", label: "LP", description: "Labour Party" },
  { value: "NNPP", label: "NNPP", description: "New Nigeria Peoples Party" },
  { value: "SDP", label: "SDP", description: "Social Democratic Party" },
  {
    value: "APGA",
    label: "APGA",
    description: "All Progressives Grand Alliance",
  },
  { value: "ADC", label: "ADC", description: "African Democratic Congress" },
  { value: "YPP", label: "YPP", description: "Young Progressives Party" },
];

export const CANDIDATE_PARTY_OTHER_OPTION = {
  value: "__other__",
  label: "Other (type manually)",
  description: "Enter a custom party name",
} as const;

export const CANDIDATE_TITLES = [
  { value: "Hon.", label: "Hon.", description: "Honourable" },
  { value: "Sen.", label: "Sen.", description: "Senator" },
  { value: "Dr.", label: "Dr.", description: "Doctor" },
  { value: "Chief", label: "Chief", description: "Chief" },
  { value: "Alh.", label: "Alh.", description: "Alhaji" },
  { value: "Engr.", label: "Engr.", description: "Engineer" },
  { value: "Barr.", label: "Barr.", description: "Barrister" },
  { value: "Prof.", label: "Prof.", description: "Professor" },
  { value: "Arc.", label: "Arc.", description: "Architect" },
];

export const CANDIDATE_TITLE_OTHER_OPTION = {
  value: "__other__",
  label: "Other (type manually)",
  description: "Enter a custom title",
} as const;
