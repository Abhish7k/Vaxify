import { HeroSectionComponent } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorksSection";
import { Features } from "@/components/landing/FeaturesSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/FooterSection";

const HomePage = () => {
  return (
    <div>
      <HeroSectionComponent />

      <HowItWorks />

      <Features />

      <FaqSection />

      <CTASection />

      <Footer />
    </div>
  );
};

export default HomePage;
