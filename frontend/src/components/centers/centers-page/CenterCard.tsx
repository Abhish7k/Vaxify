import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import type { Center } from "@/types/hospital";

type Props = {
  center: Center;
  idx: number;
};

export default function CenterCard({ center, idx }: Props) {
  const imageAnimation: Variants = {
    hover: {
      scale: 1.1,
      rotate: 3,
      x: 10,
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  return (
    <Link to={`/centers/${center.id}`} className="block group">
      <motion.div whileHover="hover" className="h-full">
        <Card className="relative overflow-hidden rounded-xl p-4 transition-all duration-500 border border-border/60 bg-background hover:-translate-y-1 hover:shadow-md">
          {/* card content */}
          <div className="relative flex flex-col gap-5 z-10">
            <div className="flex items-start justify-between">
              {/* name */}
              <h3 className="text-[15px] font-medium tracking-tight">
                {center.name}
              </h3>
            </div>

            {/* address */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{center.address}</span>
            </div>

            {/* footer */}
            <div className="flex items-center justify-start pt-1 mt-10">
              <span className="flex items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground duration-500">
                Explore
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </div>
          </div>

          <motion.div
            variants={imageAnimation}
            className="absolute -right-8 -bottom-8 w-40 h-40 opacity-90 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          >
            {idx % 2 === 0 ? (
              <img
                src="/icons/hospital-2.png"
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src="/icons/hospital-1.png"
                alt=""
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        </Card>
      </motion.div>
    </Link>
  );
}
