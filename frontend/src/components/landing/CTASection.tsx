import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-12 bg-white mb-20">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-100 bg-[#F9FAFB] px-6 pt-10 shadow-sm">
          {/* top indigo gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-70 bg-linear-to-b from-indigo-600/15 via-indigo-600/5 to-transparent" />

          {/* content */}
          <div className="relative z-20 mx-auto max-w-2xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900"
            >
              Ready to Manage Vaccinations <br /> More Efficiently ?
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="mt-6"
            >
              <Link
                to="/login"
                className="group relative px-4 py-1.5 flex transform items-center justify-center gap-2 overflow-visible whitespace-nowrap rounded-md text-white bg-indigo-600/80 font-medium transition-all duration-300 hover:ring-2 hover:ring-offset-1 hover:ring-indigo-500 active:scale-90 w-fit mx-auto"
              >
                <span className="group relative z-10 flex items-center gap-2 transition-all text-sm md:text-base">
                  Get Started
                </span>
              </Link>
            </motion.div>
          </div>

          {/* dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            viewport={{ once: false, amount: 0.1 }}
            className="relative z-20 mt-8 flex justify-center"
          >
            <div className="relative w-full max-w-3xl max-h-[250px] overflow-hidden rounded-t-xl border-x border-t border-slate-200 bg-white p-1 shadow-xl ring-1 ring-slate-950/5">
              <img
                src="https://ik.imagekit.io/vaxify/hero-dash.png"
                alt="app screen"
                className="w-full h-auto rounded-t-lg"
                style={{ imageRendering: "-webkit-optimize-contrast" }}
                draggable={false}
              />

              <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white/30 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
