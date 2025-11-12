import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get candidate name from session for metadata generation - Returns null if not authenticated or not a candidate
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

// Generate candidate-specific title for metadata - Uses candidate name as-is from database (no prefix assumptions)
export function generateCandidateTitle(
  pageName: string,
  candidateName: string | null,
): string {
  if (candidateName) {
    // Use candidate name exactly as stored in database
    return `${candidateName} - ${pageName} | WardWise`;
  }
  // Fallback to generic title if no candidate name
  return `${pageName} | WardWise`;
}
