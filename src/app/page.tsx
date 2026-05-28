import { CallToActionSection } from "@/features/public-site/components/landing/cta-section";
import { CollectSection } from "@/features/public-site/components/landing/collect-section";
import { FeaturesSection } from "@/features/public-site/components/landing/features";
import { HeroSection } from "@/features/public-site/components/landing/hero";
import { HowItWorksSection } from "@/features/public-site/components/landing/how-it-works";
import { ImpactSection } from "@/features/public-site/components/landing/impact";
import { PlatformPillarsSection } from "@/features/public-site/components/landing/platform-pillars";
import { SecuritySection } from "@/features/public-site/components/landing/security";
import { SiteFooter } from "@/features/public-site/components/shared/footer";
import { ScrollToTop } from "@/features/public-site/components/shared/scroll-to-top";
import { MarketingHeader } from "@/features/public-site/components/shared/marketing-header";

export default function Home() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <PlatformPillarsSection />
        <ImpactSection />
        <SecuritySection />
        <CollectSection />
        <CallToActionSection />
      </main>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
