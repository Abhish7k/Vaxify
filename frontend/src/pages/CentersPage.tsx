import CenterPageHeader from "@/components/centers/centers-page/CenterPageHeader";
import CentersPageListSection from "@/components/centers/centers-page/CentersPageListSection";
import CentersPageControlsSection from "@/components/centers/centers-page/control-section/CentersPageControlsSection";
import type { SortOption } from "@/components/centers/centers-page/control-section/CentersSort";
import type { Center } from "@/types/hospital";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageLoadError } from "@/components/ui/page-load-error";
import { usePublicHospitals } from "@/hooks/queries/use-hospitals";
import { fadeUpItem, staggerContainer } from "@/lib/motion";

export default function CentersPage() {
  const centersQuery = usePublicHospitals();
  const centers = centersQuery.data ?? [];
  const isLoading = centersQuery.isPending;
  const loadError = centersQuery.isError;

  const [search, setSearch] = useState("");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("name-asc");

  const allVaccines = useMemo(
    () => Array.from(new Set(centers.flatMap((c) => c.availableVaccines || []))) as string[],
    [centers],
  );

  const filteredCenters: Center[] = useMemo(() => {
    let data = [...centers];

    // search filter
    if (search.trim()) {
      const q = search.toLowerCase();

      data = data.filter((c) => c.name.toLowerCase().includes(q) || c.address.toLowerCase().includes(q));
    }

    // vax filter
    if (selectedVaccines.length > 0) {
      data = data.filter((c) => selectedVaccines.every((v) => c.availableVaccines?.includes(v)));
    }

    // sort
    data.sort((a, b) => (sort === "name-asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

    return data;
  }, [centers, search, selectedVaccines, sort]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-7xl mx-auto px-5 mb-20">
      <motion.div variants={fadeUpItem}>
        <CenterPageHeader />
      </motion.div>

      <motion.div variants={fadeUpItem}>
        <CentersPageControlsSection
          search={search}
          onSearchChange={setSearch}
          vaccines={allVaccines}
          selectedVaccines={selectedVaccines}
          onVaccinesChange={setSelectedVaccines}
          sort={sort}
          onSortChange={setSort}
        />
      </motion.div>

      {loadError ? (
        <PageLoadError
          message="Could not load vaccination centers. Please try again."
          onRetry={() => void centersQuery.refetch()}
        />
      ) : (
        <CentersPageListSection centers={filteredCenters} isLoading={isLoading} />
      )}
    </motion.div>
  );
}
