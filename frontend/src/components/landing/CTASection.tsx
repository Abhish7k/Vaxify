import { AnimatedGroup } from "@/components/ui/animated-group";
import { Link } from "react-router-dom";

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

export function CTASection() {
  return (
    <section className="py-12 bg-white mb-20">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-100 bg-[#F9FAFB] px-6 pt-10 shadow-sm">
          {/* top indigo gradient */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-70 bg-linear-to-b from-indigo-600/15 via-indigo-600/5 to-transparent" />

          <AnimatedGroup variants={transitionVariants}>
            <div className="relative z-20 mx-auto max-w-2xl text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-slate-900">
                Ready to Manage Vaccinations <br /> More Efficiently ?
              </h2>
            </div>

            <div className="relative z-20 mt-6">
              <Link
                to="/login"
                className="group relative px-4 py-1.5 flex transform items-center justify-center gap-2 overflow-visible whitespace-nowrap rounded-md text-white bg-indigo-600/80 font-medium transition-all duration-300 hover:ring-2 hover:ring-offset-1 hover:ring-indigo-500 active:scale-90 w-fit mx-auto"
              >
                <span className="group relative z-10 flex items-center gap-2 transition-all text-sm md:text-base">
                  Get Started
                </span>
              </Link>
            </div>

            <div className="relative z-20 mt-8 flex justify-center">
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
            </div>
          </AnimatedGroup>
        </div>
      </div>
    </section>
  );
}
