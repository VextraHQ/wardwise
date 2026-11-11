/** @keep Not used yet. Kept for future features (knip skips @keep). */
export type LocationState = {
  code: string;
  name: string;
};

type LocationLGA = {
  code: string;
  name: string;
  stateCode: string;
};

export type LocationWard = {
  code: string;
  name: string;
  lgaCode: string;
} & LocationLGA;

export type LocationPollingUnit = {
  code: string;
  name: string;
  wardCode: string;
};
