import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

// Note: Voter pages use createVoterMetadata() from @/lib/metadata
// to apply the "| WardWise" template via absolute titles.

export default function VoterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header badge="Voter Portal" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
