import CenterCard from "@/components/centers/centers-page/CenterCard";
import type { Center } from "@/types/hospital";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  centers: Center[];
  isLoading?: boolean
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staticItem = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0, transition: { duration: 0 } },
};

export default function CentersPageListSection({ centers, isLoading }: Props) {
  const hasMounted = useRef(false);

  useEffect(() => {
    // Determine that the initial mount animation phase is over after a short delay
    const timer = setTimeout(() => {
      hasMounted.current = true;
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="container mx-auto pb-16">
      <div className="mb-6 space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          Available Centers
        </h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Fetching centers..." : `${centers.length} centers found`}
        </p>
      </div>

      {isLoading ? (
        <div className="col-span-full py-24 text-center text-sm text-muted-foreground">
          Fetching centers...
        </div>
      ) :
        centers.length === 0 ? (
          <div className="py-24 text-center text-sm text-muted-foreground">
            No centers match your filters.
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {centers.map((center, index) => (
              <motion.div
                key={center.id}
                variants={hasMounted.current ? staticItem : item}
              >
                <CenterCard center={center} idx={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
    </section>
  );
}
