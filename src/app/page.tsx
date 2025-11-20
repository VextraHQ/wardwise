import { CallToActionSection } from "@/components/landing/cta-section";
import { FeaturesSection } from "@/components/landing/features";
import { HeroSection } from "@/components/landing/hero";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { ImpactSection } from "@/components/landing/impact";
import { PlatformPillarsSection } from "@/components/landing/platform-pillars";
import { SecuritySection } from "@/components/landing/security";
import { SiteFooter } from "@/components/landing/footer";
import { SiteHeader } from "@/components/landing/header";

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformPillarsSection />
        <ImpactSection />
        <SecuritySection />
        <CallToActionSection />
      </main>
      <SiteFooter />
    </div>
  );
}
