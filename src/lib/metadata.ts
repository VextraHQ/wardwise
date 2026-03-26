import type { Metadata } from "next";

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
