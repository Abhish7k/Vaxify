import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Your privacy is important to us. This policy outlines how Vaxify
          collects, uses, and protects your personal information.
        </p>
      </section>

      <div className="mt-20 space-y-16">
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">1. Information Collection</h2>

          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly, such as your name,
            email address, and healthcare preferences when you register or book
            appointments.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">2. Use of Information</h2>

          <p className="text-muted-foreground leading-relaxed">
            We use your information to manage appointments, verify center
            operations, and improve our services. We do not sell your personal
            data to third parties.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">3. Data Security</h2>

          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your
            data from unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">4. Consent</h2>

          <p className="text-muted-foreground leading-relaxed">
            By using Vaxify, you consent to the collection and use of your
            information as described in this policy.
          </p>
        </section>
      </div>

      <section className="mt-32 max-w-3xl">
        <p className="text-muted-foreground text-sm italic">
          Last updated: February 2026
        </p>
      </section>
    </motion.main>
  );
}
