import { Link } from "react-router-dom";
import { AnimatedGroup } from "@/components/ui/animated-group";

interface FooterLink {
  title: string;
  href: string;
}

interface FooterSection {
  label: string;
  links: FooterLink[];
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

export function Footer() {
  return (
    <footer className="relative mt-20 bg-white">
      <div className="relative mx-auto max-w-6xl px-6 py-14 rounded-t-4xl border-t border-slate-100">
        <div className="grid gap-12 md:grid-cols-[1.2fr_2fr]">
          <AnimatedGroup variants={transitionVariants} className="">
            <div>
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 w-fit">
                <img src="/logo.svg" alt="" aria-hidden="true" className="w-8 h-8" />
                Vaxify
              </Link>
            </div>

            <p className="text-slate-400 text-xs mt-4">
              Simplifying Vaccination Management for Everyone
            </p>
          </AnimatedGroup>

          <AnimatedGroup
            variants={transitionVariants}
            className="grid grid-cols-2 gap-10 sm:grid-cols-3"
          >
            {footerLinks.map((section) => (
              <div key={section.label}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900">
                  {section.label}
                </h3>

                <ul className="mt-6 space-y-3 text-sm">
                  {section.links.map((link) => {
                    const isExternal = link.href.startsWith("http");

                    return (
                      <li key={link.title}>
                        {isExternal ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-slate-500 transition-colors hover:text-indigo-600"
                          >
                            {link.title}
                          </a>
                        ) : (
                          <Link
                            to={link.href}
                            className="inline-flex items-center text-slate-500 transition-colors hover:text-indigo-600"
                          >
                            {link.title}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </AnimatedGroup>
        </div>
      </div>
    </footer>
  );
}

const footerLinks: FooterSection[] = [
  {
    label: "Product",
    links: [
      { title: "Features", href: "/" },
      { title: "Hospitals", href: "/" },
      { title: "Appointments", href: "/" },
      { title: "Dashboards", href: "/" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "FAQs", href: "/" },
      { title: "Privacy Policy", href: "/" },
      { title: "Terms of Service", href: "/" },
    ],
  },
  {
    label: "Resources",
    links: [
      {
        title: "GitHub Repository",
        href: "https://github.com/Abhish7k/vaxify",
      },
      { title: "Contact Support", href: "mailto:contact@vaxify.xyz" },
    ],
  },
];
