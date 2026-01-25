import { HeroSectionComponent } from "@/components/landing/hero-section-1";
import { Features } from '@/components/landing/features-section';
import { Features1 } from "@/components/landing/features-section1";
import { HowItWorks }  from "@/components/landing/how-it-works";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from '@/components/landing/footer-section';


const HomePage = () => {
  return (
    <div>
      <HeroSectionComponent />
      <HowItWorks />
      <Features1/>
      <Features />
      <FAQSection />
      <Footer/>
    </div>
  );
};

export default HomePage;
