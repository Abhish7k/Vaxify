import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  return (
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
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">
          Terms of Service
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Please read these terms carefully before using the Vaxify platform.
        </p>
      </section>

      <div className="mt-20 space-y-16">
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>

          <p className="text-muted-foreground leading-relaxed">
            By accessing or using Vaxify, you agree to be bound by these Terms
            of Service and all applicable laws and regulations.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">2. User Responsibilities</h2>

          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account information and for all activities that occur under your
            account.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">3. Prohibited Use</h2>

          <p className="text-muted-foreground leading-relaxed">
            You agree not to use Vaxify for any unlawful purpose or in any way
            that could damage, disable, or impair the platform's functionality.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>

          <p className="text-muted-foreground leading-relaxed">
            Vaxify is provided "as is" without any warranties. We are not liable
            for any damages resulting from the use or inability to use the
            platform.
          </p>
        </section>
      </div>

      <section className="mt-32 max-w-3xl">
        <p className="text-muted-foreground text-sm italic">
          For any legal inquiries, please contact our team.
        </p>
      </section>
    </motion.main>
  );
}
