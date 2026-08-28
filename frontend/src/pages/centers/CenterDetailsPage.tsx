import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import CenterDetailsHeaderSection from "@/components/centers/center-details/CenterDetailsHeaderSection";
import CenterDetailsVaccinesSection from "@/components/centers/center-details/CenterDetailsVaccinesSection";
import CenterDetailsInfoSection from "@/components/centers/center-details/CenterDetailsInfoSection";
import CenterDetailsOperatingInfoSection from "@/components/centers/center-details/CenterDetailsOperatingInfoSection";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import CenterNotFound from "@/components/centers/center-details/CenterNotFound";
import { isNotFoundError } from "@/lib/errors";
import { PageLoadError } from "@/components/ui/page-load-error";
import { useHospital } from "@/hooks/queries/use-hospitals";
import { toCenterData } from "@/types/hospital";
import { fadeUpItem, staggerContainer } from "@/lib/motion";

const CenterDetailsPage = () => {
  const { centerId } = useParams();
  const hospitalQuery = useHospital(centerId);
  const hospitalData = hospitalQuery.data;
  const loading = hospitalQuery.isPending;
  const notFound =
    (!hospitalQuery.isPending && !hospitalData && !hospitalQuery.isError) ||
    isNotFoundError(hospitalQuery.error);
  const loadError = hospitalQuery.isError && !notFound;

  const center = useMemo(
    () => (hospitalData ? toCenterData(hospitalData) : null),
    [hospitalData],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/80" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <PageLoadError
          message="Could not load center details. Please try again."
          onRetry={() => void hospitalQuery.refetch()}
        />
      </div>
    );
  }

  if (notFound || !center) {
    return <CenterNotFound />;
  }

  return (
    <div className="min-h-screen mb-20">
      <motion.div className="max-w-6xl mx-auto px-8 py-20" variants={staggerContainer} initial="hidden" animate="show">
        <motion.div className="mb-6" variants={fadeUpItem}>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-all duration-300" />
            Back to Centers
          </button>
        </motion.div>

        <motion.div variants={fadeUpItem} className="mb-8">
          <CenterDetailsHeaderSection center={center} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div variants={fadeUpItem}>
              <CenterDetailsVaccinesSection center={center} />
            </motion.div>

            <motion.div variants={fadeUpItem}>
              <CenterDetailsInfoSection center={center} />
            </motion.div>
          </div>

          <motion.div variants={fadeUpItem}>
            <CenterDetailsOperatingInfoSection center={center} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CenterDetailsPage;
