import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AboutUsPage() {

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ease: "easeInOut",
        duration: 0.4,
        delay: 0.1,
        type: "tween",
        stiffness: 260,
        damping: 20,
      }}
      className="mx-auto max-w-5xl px-10 py-20"
    >
      {/* about */}
      <section className="space-y-10">
        <h1 className="text-5xl font-bold tracking-tight">About Us</h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          We're a team of passionate innovators building a modern vaccination
          management system that simplifies appointment scheduling, center
          operations, and public health coordination. Vaxify focuses on
          reliability, transparency, and real-world healthcare workflows.
        </p>
      </section>

      {/* core vision */}
      <section className="mt-24 space-y-6">
        <h2 className="text-xl font-semibold">Core Vision</h2>

        <p className="text-muted-foreground leading-relaxed max-w-3xl">
          Our vision is to create a unified digital platform that enables
          seamless coordination between citizens, hospitals, vaccination
          centers, and administrators. We aim to make vaccination programs
          accessible, efficient, and scalable through thoughtfully designed
          technology.
        </p>
      </section>


      {/* team */}
      <section className="mt-32">
        <h2 className="mb-12 text-xl font-medium">Our Team</h2>

        <div className="space-y-6">
          {team.map((member, index) => (
            <div key={index} className="group"
              onMouseEnter={() => setHovered(member.name)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-6">
                  <p className={cn(
                    "text-3xl font-medium group-hover:translate-x-5 transition-all duration-500 will-change-transform",
                    hovered && hovered !== member.name
                      ? "opacity-50"
                      : "opacity-100"
                  )}>
                    {member.name}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground hover:scale-110 will-change-transform transition-all duration-300"
                  >
                    <FaGithub size={22} />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground hover:scale-110 will-change-transform transition-all duration-300"
                  >
                    <FaLinkedin size={22} />
                  </a>
                </div>
              </div>

              <Separator />
            </div>
          ))}
        </div>
      </section>

      {/* footer */}
      <section className="mt-32 max-w-3xl">
        <p className="text-muted-foreground">
          Built as a real-world healthcare system project with usability at its
          core.
        </p>
      </section>
    </motion.main>
  );
}

const team = [
  {
    name: "Indu",
    github: "https://github.com/indu61",
    linkedin: "https://www.linkedin.com/in/indu-gadagi/",
  },
  {
    name: "Abhishek",
    github: "https://github.com/abhish7k",
    linkedin: "https://www.linkedin.com/in/abhish7k/",
  },
  {
    name: "Rahul",
    github: "http://github.com/rahulkhadeeng/",
    linkedin: "https://www.linkedin.com/in/contactrahulkhade/",
  },
];
