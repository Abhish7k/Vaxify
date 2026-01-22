import CenterPageHeader from "@/components/centers/CenterPageHeader";
import CentersPageListSection from "@/components/centers/CentersPageListSection";

export default function CentersPage() {
  return (
    <div className="max-w-7xl mx-auto px-5">
      <CenterPageHeader />

      <CentersPageListSection />
    </div>
  );
}
