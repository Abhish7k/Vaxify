import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/landing/FooterSection";

export default function FAQsPage() {
  return (
    <>
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          ease: "easeInOut",
          duration: 0.4,
          delay: 0.1,
          type: "tween",
        }}
        className="mx-auto max-w-5xl px-10 py-20"
      >
        <section className="space-y-10">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">Frequently Asked Questions</h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Find answers to common questions about Vaxify, appointments, and vaccination center management.
          </p>
        </section>

        <section className="mt-20">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-slate-900 font-medium hover:no-underline hover:text-indigo-600 transition-colors py-4 cursor-pointer text-base text-left">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="text-slate-500 leading-relaxed pb-6">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-32 max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Still have questions?</h2>

          <p className="text-muted-foreground">
            Can't find the answer you're looking for? Reach out to our support team for assistance.
          </p>
        </section>
      </motion.main>

      <Footer />
    </>
  );
}

const faqs = [
  {
    question: "How do I book an appointment?",
    answer:
      "You can book an appointment by searching for a vaccination center near you, selecting an available slot, and confirming your details.",
  },
  {
    question: "Is Vaxify free to use for citizens?",
    answer: "Yes, Vaxify is completely free for citizens to find and book vaccination appointments.",
  },
  {
    question: "How can my hospital join Vaxify?",
    answer:
      "Hospitals can register through the staff portal by providing their license details and facility information for verification.",
  },
  {
    question: "Can I cancel or reschedule my appointment?",
    answer:
      "Yes, you can manage your appointments through your dashboard, where you have options to cancel or reschedule.",
  },
  {
    question: "What documents do I need to carry for my appointment?",
    answer: "Please carry a valid government-issued photo ID and your appointment confirmation (digital or printed).",
  },
];
