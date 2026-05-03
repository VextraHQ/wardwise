import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://wardwise.ng";
type OpenGraphMetadata = NonNullable<Metadata["openGraph"]>;
type TwitterMetadata = NonNullable<Metadata["twitter"]>;
type OpenGraphInput = Omit<OpenGraphMetadata, "title" | "description"> & {
  title: OpenGraphMetadata["title"];
  description?: string;
};
type TwitterInput = Omit<TwitterMetadata, "title" | "description"> & {
  title: TwitterMetadata["title"];
  description?: string;
};

function normalizeSiteUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_COLLECT_BASE_URL ||
      process.env.NEXTAUTH_URL ||
      FALLBACK_SITE_URL,
  );
}

/**
 * Origin for absolute URLs to `public/` assets in outbound email. Mail clients and
 * proxies cannot load `localhost`; plain `http:` is upgraded to `https` when the
 * hostname is public.
 */
export function getEmailAssetsBaseUrl(): string {
  try {
    const parsed = new URL(
      process.env.NEXT_PUBLIC_EMAIL_ASSETS_BASE_URL || getSiteUrl(),
    );
    const host = parsed.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "[::1]" ||
      host.endsWith(".local");

    if (isLocal) {
      return FALLBACK_SITE_URL;
    }

    if (parsed.protocol === "http:") {
      return normalizeSiteUrl(`https://${parsed.host}`);
    }

    return normalizeSiteUrl(parsed.origin);
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getMetadataBase(): URL {
  return new URL(getSiteUrl());
}

export function createDefaultOpenGraph({
  title,
  description,
  ...rest
}: OpenGraphInput): OpenGraphMetadata {
  return {
    siteName: "WardWise",
    type: "website",
    url: getSiteUrl(),
    images: [
      {
        url: "/opengraph-image.png",
        width: 2400,
        height: 1260,
        alt: "WardWise | From Ward to Victory",
      },
    ],
    title,
    description,
    ...rest,
  };
}

export function createDefaultTwitter({
  title,
  description,
  ...rest
}: TwitterInput): TwitterMetadata {
  return {
    card: "summary_large_image",
    images: ["/twitter-image.png"],
    title,
    description,
    ...rest,
  };
}

/**
 * Creates metadata for auth pages (/login, /forgot-password, /reset-password).
 * Non-indexable by default — auth routes should never appear in search results.
 */
export function createAuthMetadata({
  title,
  description,
  noArchive = false,
}: {
  title: string;
  description?: string;
  noArchive?: boolean;
}): Metadata {
  return {
    title: {
      absolute: `${title} | WardWise`,
    },
    description,
    robots: {
      index: false,
      follow: false,
      ...(noArchive && { nocache: true }),
    },
  };
}

/**
 * Creates metadata for public marketing/support pages.
 */
export function createPublicMetadata({
  title,
  description,
  openGraph,
  twitter,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  const resolvedTitle = `${title} | WardWise`;
  const resolvedDescription = description ?? undefined;

  return {
    ...rest,
    title: {
      absolute: resolvedTitle,
    },
    description: resolvedDescription,
    openGraph: createDefaultOpenGraph({
      title: resolvedTitle,
      description: resolvedDescription,
      ...openGraph,
    }),
    twitter: createDefaultTwitter({
      title: resolvedTitle,
      description: resolvedDescription,
      ...twitter,
    }),
  };
}

/**
 * Creates metadata for admin dashboard pages (/admin/*).
 */
export function createAdminMetadata({
  title,
  description,
  openGraph,
  twitter,
  ...rest
}: Omit<Metadata, "title"> & { title: string }): Metadata {
  const resolvedTitle = `${title} | WardWise Admin`;
  const resolvedDescription = description ?? undefined;

  return {
    ...rest,
    title: {
      absolute: resolvedTitle,
    },
    description: resolvedDescription,
    openGraph: createDefaultOpenGraph({
      title: resolvedTitle,
      description: resolvedDescription,
      ...openGraph,
    }),
    twitter: createDefaultTwitter({
      title: resolvedTitle,
      description: resolvedDescription,
      ...twitter,
    }),
  };
}
