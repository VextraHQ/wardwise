import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Fetches the authenticated candidate's name for use in metadata.
 */
export async function getCandidateNameForMetadata(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.candidateId) {
      return null;
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: session.user.candidateId },
      select: { name: true },
    });

    return candidate?.name || null;
  } catch (error) {
    console.error("Error fetching candidate name for metadata:", error);
    return null;
  }
}

/**
 * Generates a candidate-specific page title for metadata.
 * Returns title without suffix - root template applies "| WardWise".
 */
export function generateCandidateTitle(
  pageName: string,
  candidateName: string | null,
): string {
  if (candidateName) {
    return `${candidateName} - ${pageName}`;
  }
  return pageName;
}
