import { hospitalApi } from "@/api/hospital.api";
import CenterPageHeader from "@/components/centers/centers-page/CenterPageHeader";
import CentersPageListSection from "@/components/centers/centers-page/CentersPageListSection";
import CentersPageControlsSection from "@/components/centers/centers-page/control-section/CentersPageControlsSection";
import type { SortOption } from "@/components/centers/centers-page/control-section/CentersSort";
import type { Center } from "@/types/hospital";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("name-asc");

  // fetch centers on mount
  useEffect(() => {
    const fetchCenters = async () => {
      try {
        setIsLoading(true);

        const data = await hospitalApi.getAllHospitals();

        setCenters(data);
      } catch (error) {
        console.error("Failed to fetch centers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const allVaccines = useMemo(
    () =>
      Array.from(
        new Set(centers.flatMap((c) => c.availableVaccines || [])),
      ) as string[],
    [centers],
  );

  const filteredCenters: Center[] = useMemo(() => {
    let data = [...centers];

    // search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q),
      );
    }

    // vaccine filter
    if (selectedVaccines.length > 0) {
      data = data.filter((c) =>
        selectedVaccines.every((v) => c.availableVaccines?.includes(v)),
      );
    }

    // sort
    data.sort((a, b) =>
      sort === "name-asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );

    return data;
  }, [centers, search, selectedVaccines, sort]);


  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-7xl mx-auto px-5 mb-20"
    >
      <motion.div variants={item}>
        <CenterPageHeader />
      </motion.div>

      <motion.div variants={item}>
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

      <CentersPageListSection centers={filteredCenters} isLoading={isLoading} />
    </motion.div>
  );
}
