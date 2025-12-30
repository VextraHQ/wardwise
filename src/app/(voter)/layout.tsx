import { VoterHeader } from "@/components/voter/voter-header";
import { VoterFooter } from "@/components/voter/voter-footer";

// Note: Voter pages use createVoterMetadata() from @/lib/metadata
// to apply the "| WardWise" template via absolute titles.

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <VoterHeader />
      <main className="flex-1">{children}</main>
      <VoterFooter />
    </div>
  );
}
