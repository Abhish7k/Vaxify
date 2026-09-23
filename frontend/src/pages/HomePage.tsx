import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CTASection } from "@/components/landing/CTASection";
import { FooterSection } from "@/components/landing/FooterSection";

const HomePage = () => {
  return (
    <div>
      <HeroSection />

      <HowItWorksSection />

      <FeaturesSection />

      <FaqSection />

      <CTASection />

      <FooterSection />
    </div>
  );
};

export default HomePage;
