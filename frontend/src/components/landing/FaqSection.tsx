import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedGroup } from "@/components/ui/animated-group";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const transitionVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  },
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function FaqSection() {
  return (
    <section className="relative px-5 sm:px-10 py-16 md:py-32 bg-white overflow-hidden transition-all">
      <div className="mx-auto max-w-3xl px-6 w-full">
        {/* header */}
        <AnimatedGroup variants={transitionVariants} className="text-center mb-16">
          <p className="text-[#6366f1] text-[11px] font-mono font-bold mb-1 uppercase tracking-[0.2em]">
            Support & FAQ
          </p>
          <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-slate-900 mb-1 transition-all">
            Frequently asked questions <br className="hidden md:block" /> about
            our platform.
          </h2>
          <p className="text-slate-500 mt-4 text-sm md:text-base">
            Find answers to common questions about booking, <br /> hospital
            verification, and vaccine management.
          </p>
        </AnimatedGroup>

        <Accordion type="single" collapsible className="w-full">
          <AnimatedGroup variants={transitionVariants} className="w-full">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-slate-100 py-2"
              >
                <AccordionTrigger className="text-slate-900 font-medium hover:no-underline hover:text-indigo-600 transition-colors py-4 cursor-pointer">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 leading-relaxed pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </AnimatedGroup>
        </Accordion>
      </div>
    </section>
  );
}

const faqItems: FaqItem[] = [
  {
    id: "faq-1",
    question: "How do I book a vaccination appointment?",
    answer:
      "Simply search for a nearby hospital or vaccination center using our discovery tool, select an available time slot that works for you, and confirm your booking. You'll receive a digital ticket instantly.",
  },
  {
    id: "faq-2",
    question: "Can I manage multiple family members from one account?",
    answer:
      "Yes! Our system allows you to book and track vaccinations for multiple family members. Each appointment generates a unique ticket that can be managed from your dashboard.",
  },
  {
    id: "faq-3",
    question: "How do hospitals join the platform?",
    answer:
      "Hospitals can register through our provider portal. Once registered, our administrators verify the credentials and physical existence of the facility to ensure the highest safety standards before granting access to inventory management tools.",
  },
  {
    id: "faq-4",
    question:
      "What happens if a vaccine goes out of stock at my selected center?",
    answer:
      "Our system features real-time inventory tracking. If stock levels fall below a critical threshold, the center is automatically disabled for new bookings, and staff receive instant alerts to restock. We strive to only show available slots.",
  },
  {
    id: "faq-5",
    question: "Is there a fee for using VMS to book appointments?",
    answer:
      "Using the VMS platform to find centers and book slots is completely free for citizens. Our goal is to make healthcare accessible and organized for everyone.",
  },
  {
    id: "faq-6",
    question: "How is my vaccination data stored and protected?",
    answer:
      "We take data privacy very seriously. All records are encrypted and stored in compliance with healthcare data regulations. Only authorized medical staff at your chosen center can access relevant history for administration purposes.",
  },
];
