import type { Metadata } from "next";

/**
 * Creates metadata for voter-facing authenticated pages (/voter/*).
 */
export function createVoterMetadata({
  title,
  description,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  return {
    ...rest,
    title: {
      absolute: `${title} | WardWise Voter`,
    },
    description,
  };
}

/**
 * Creates metadata for voter registration flow pages (/register/*).
 */
export function createRegistrationMetadata({
  title,
  description,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  return {
    ...rest,
    title: {
      absolute: `${title} | WardWise Registration`,
    },
    description,
  };
}

/**
 * Creates metadata for admin dashboard pages (/admin/*).
 */
export function createAdminMetadata({
  title,
  description,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  return {
    ...rest,
    title: {
      absolute: `${title} | WardWise Admin`,
    },
    description,
  };
}

/**
 * Creates metadata for canvasser portal pages (/canvasser/*).
 */
export function createCanvasserMetadata({
  title,
  description,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  return {
    ...rest,
    title: {
      absolute: `${title} | WardWise Canvasser`,
    },
    description,
  };
}
