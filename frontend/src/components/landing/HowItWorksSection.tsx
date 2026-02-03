import { AnimatedGroup } from "@/components/ui/animated-group";
import { ShieldCheck, Check } from "lucide-react";

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

export function HowItWorks() {
  return (
    <section className="relative py-8 bg-white overflow-hidden min-h-[85vh] flex flex-col justify-center my-20">
      <div className="mx-auto max-w-5xl px-6 w-full">
        {/* header */}
        <AnimatedGroup variants={transitionVariants} className="text-center">
          <p className="text-[#6366f1] text-[11px] font-mono font-bold mb-1 uppercase tracking-[0.2em]">
            How it works
          </p>
          <h2 className="text-2xl md:text-4xl font-medium tracking-tight text-slate-900 mb-1">
            Vaccination Management <br /> in 3 Simple Steps
          </h2>
        </AnimatedGroup>

        {/* steps */}
        <AnimatedGroup
          variants={transitionVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-6 relative max-w-4xl mx-auto mt-32"
        >
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative flex flex-col items-center h-full"
            >
              {(index === 0 || index === 2) && (
                <div className="hidden md:flex flex-col items-center absolute -top-12">
                  <span className="text-[13px] font-bold text-slate-900 mb-0.5">
                    {step.label}
                  </span>
                  {step.arrow}
                </div>
              )}

              <div className="relative flex flex-col bg-[#F3F4F6]/50 border border-transparent rounded-3xl p-5 h-full w-full max-w-[280px]">
                <h4 className="text-center text-md font-bold text-[#0F172A] mb-3">
                  {step.title}
                </h4>

                <div className="relative aspect-square w-full bg-[#E5E7EB]/30 rounded-xl flex items-center justify-center mb-3 border border-white/20 overflow-hidden">
                  <div className="scale-155">{step.graphic}</div>
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                </div>

                <p className="text-center text-slate-500 text-[13px] leading-relaxed px-2">
                  {step.description}
                </p>
              </div>

              {index === 1 && (
                <div className="hidden md:flex flex-col items-center absolute -bottom-12">
                  {step.arrow}
                  <span className="text-[13px] font-bold text-slate-900 mt-0.5">
                    {step.label}
                  </span>
                </div>
              )}
            </div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  );
}

const steps = [
  {
    id: 1,
    title: "Discover & Choose",
    label: "Step 1",
    description:
      "Browse verified centers, view vaccines, and real-time availability in one place.",
    arrow: (
      <svg
        width="30"
        height="20"
        viewBox="0 0 40 35"
        fill="none"
        className="text-slate-400"
      >
        <path
          d="M5 5C15 5 25 10 30 25M30 25L23 24M30 25L29 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    graphic: (
      <div className="relative w-24 h-32 bg-white rounded-lg shadow-sm border border-slate-100 p-2.5 flex flex-col gap-2 overflow-hidden">
        <div className="w-full h-1.5 bg-slate-100 rounded-full" />
        <div className="w-3/4 h-1.5 bg-slate-100 rounded-full" />
        <div className="mt-auto space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full h-4 bg-slate-50 rounded border border-slate-100"
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Book & Manage",
    label: "Step 2",
    description:
      "Select a slot and book instantly. Visible to both the user and hospital staff.",
    arrow: (
      <svg
        width="30"
        height="20"
        viewBox="0 0 40 35"
        fill="none"
        className="text-slate-400 rotate-180"
      >
        <path
          d="M5 5C15 5 25 10 30 25M30 25L23 24M30 25L29 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    graphic: (
      <div className="relative w-32 h-24 bg-white rounded-lg shadow-sm border border-slate-100 p-2.5">
        <div className="flex justify-between mb-2">
          <div className="w-10 h-1.5 bg-slate-100 rounded-full" />
          <div className="w-3 h-3 bg-slate-50 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-4 bg-slate-50 rounded border border-slate-100"
            />
          ))}
          <div className="h-4 rounded border flex items-center justify-center bg-indigo-500 border-indigo-600">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Administer & Track",
    label: "Step 3",
    description:
      "Hospital staff update status, while admins oversee hospital approvals.",
    arrow: (
      <svg
        width="30"
        height="20"
        viewBox="0 0 40 35"
        fill="none"
        className="text-slate-400 scale-x-[-1]"
      >
        <path
          d="M5 5C15 5 25 10 30 25M30 25L23 24M30 25L29 18"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    graphic: (
      <div className="w-32 space-y-1.5 p-1">
        <div className="bg-white rounded p-1.5 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-100 rounded-full" />
            <div className="w-8 h-1 bg-slate-100 rounded-full" />
          </div>
          <div className="px-1 py-0.5 rounded-full bg-emerald-50 text-[6px] font-bold text-emerald-600">
            COMPLETED
          </div>
        </div>
        <div className="bg-white rounded p-1.5 shadow-md border-l-2 border-l-indigo-500 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-50 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-2.5 h-2.5 text-indigo-500" />
            </div>
            <div className="w-8 h-1 bg-slate-100 rounded-full" />
          </div>
          <div className="px-1 py-0.5 rounded-full bg-indigo-50 text-[6px] font-bold text-indigo-600">
            UPCOMING
          </div>
        </div>
      </div>
    ),
  },
];
