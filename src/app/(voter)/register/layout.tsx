import { DemoIndicator } from "@/components/ui/demo-indicator";

// Note: Register pages use createRegistrationMetadata() from @/lib/metadata
// to apply the "| WardWise Registration" template via absolute titles.
export const metadata = {
  description:
    "Register as a voter with WardWise - Nigeria's first location-precise civic intelligence platform.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2">
        <DemoIndicator variant="badge" />
      </div>
      {children}
    </div>
  );
}
