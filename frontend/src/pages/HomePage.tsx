import { HeroSectionComponent } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorksSection";
import { Features } from "@/components/landing/FeaturesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CTASection } from "@/components/landing/CTASection";

const HomePage = () => {
  return (
    <div>
      <HeroSectionComponent />

      <HowItWorks />

      <Features />

      <FaqSection />

      <CTASection />
    </div>
  );
};

export default HomePage;
