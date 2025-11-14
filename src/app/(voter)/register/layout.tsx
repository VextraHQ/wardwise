import { DemoIndicator } from "@/components/ui/demo-indicator";

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
