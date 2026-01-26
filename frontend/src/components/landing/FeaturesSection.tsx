import {
  Database,
  BellRing,
  ShieldCheck,
  Users,
  BarChart3,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

export function Features() {
  return (
    <section className="py-24 md:py-5">
      <div className="mx-auto max-w-6xl px-6 space-y-16">
        <div className="grid grid-cols-1 divide-x divide-y divide-dashed border border-dashed sm:grid-cols-2 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: (typeof FEATURES)[number] }) {
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden p-6",
        "border border-dashed",
        "bg-background",
      )}
    >
      {/* subtle inner blur / glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-muted/40 to-transparent opacity-60" />
      </div>

      {/* grid pattern with targeted fading */}
      <GridPattern />

      <Icon className="relative z-10 h-5 w-5 text-foreground/70" />

      <h3 className="relative z-10 mt-8 text-sm font-medium">
        {feature.title}
      </h3>

      <p className="relative z-10 mt-2 text-xs leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </div>
  );
}

function GridPattern() {
  const id = React.useId();

  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        // UPDATED MASK:
        // 0% to 30% is 'transparent' (Blank/White background for text/logo)
        // 30% to 100% fades in to 'white' (Making the grid visible on the right)
        "mask-[linear-gradient(to_right,transparent_0%,transparent_30%,white_100%)]",
      )}
    >
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path
            d="M.5 24V.5H24"
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} />

      {/* random darker blocks */}
      <g fill="rgba(0,0,0,0.08)">
        <rect x="72" y="48" width="24" height="24" />
        <rect x="168" y="96" width="24" height="24" />
        <rect x="120" y="24" width="24" height="24" />
      </g>
    </svg>
  );
}

const FEATURES = [
  {
    title: "Smart Records",
    icon: Database,
    description:
      "Store and access complete vaccination histories securely in one centralized digital system.",
  },
  {
    title: "Auto Reminders",
    icon: BellRing,
    description:
      "Get timely alerts for upcoming doses and boosters to ensure schedule adherence.",
  },
  {
    title: "Data Security",
    icon: ShieldCheck,
    description:
      "Protect vaccination data with verified, tamper-resistant, and privacy-focused safeguards.",
  },
  {
    title: "Role Access",
    icon: Users,
    description:
      "Enable controlled access for patients, healthcare providers, and authorized institutions.",
  },
  {
    title: "Insight Analytics",
    icon: BarChart3,
    description:
      "Monitor vaccination coverage, trends, and performance through intuitive dashboards.",
  },
  {
    title: "Compliance Ready",
    icon: FileCheck2,
    description:
      "Support regulatory standards and official verification with structured, audit-ready records.",
  },
];
