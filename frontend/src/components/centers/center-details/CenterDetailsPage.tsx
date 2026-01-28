import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { mockCenterData, type CenterData } from "./types";

import CenterDetailsHeaderSection from "./CenterDetailsHeaderSection";
import CenterDetailsVaccinesSection from "./CenterDetailsVaccinesSection";
import CenterDetailsInfoSection from "./CenterDetailsInfoSection";
import CenterDetailsOperatingInfoSection from "./CenterDetailsOperatingInfoSection";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CenterDetailsPage = () => {
  const center: CenterData = mockCenterData;

  return (
    <div className="min-h-screen">
      <motion.div
        className="max-w-6xl mx-auto px-8 py-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* back btn */}
        <motion.div className="mb-6" variants={itemVariants}>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-all duration-300" />
            Back to Centers
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <CenterDetailsHeaderSection center={center} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={itemVariants}>
              <CenterDetailsVaccinesSection center={center} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <CenterDetailsInfoSection center={center} />
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <CenterDetailsOperatingInfoSection center={center} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CenterDetailsPage;
