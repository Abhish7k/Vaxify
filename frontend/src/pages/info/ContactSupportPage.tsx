import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function ContactSupportPage() {
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
        <h1 className="text-2xl md:text-5xl font-bold tracking-tight">
          Contact Support
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          Have a specific issue or feedback? We're here to help. Get in touch
          with our team.
        </p>
      </section>

      <div className="mt-20 grid gap-16 md:grid-cols-[1fr_1.5fr]">
        <aside className="space-y-12">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Contact Information</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Mail className="h-5 w-5" />
                </div>
                <span>support@vaxify.com</span>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Phone className="h-5 w-5" />
                </div>
                <span>+1 (555) 123-4567</span>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <span>123 Innovation Way, Tech City</span>
              </div>
            </div>
          </div>
        </aside>

        <form className="space-y-8 rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                placeholder="John"
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                placeholder="Doe"
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="john@example.com"
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="How can we help?"
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Describe your issue in detail..."
              className="min-h-[150px] rounded-xl border-slate-200 resize-none"
            />
          </div>

          <Button className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </Button>
        </form>
      </div>
    </motion.main>
  );
}
