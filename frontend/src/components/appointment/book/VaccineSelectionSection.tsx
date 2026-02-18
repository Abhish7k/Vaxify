import { cn } from "@/lib/utils";

export type Vaccine = {
  id: string;
  name: string;
  description?: string;
};

type Props = {
  vaccines: Vaccine[];
  selectedVaccineId: string | null;
  onSelect: (vaccineId: string) => void;
};

export default function VaccineSelectionSection({
  vaccines,
  selectedVaccineId,
  onSelect,
}: Props) {
  return (
    <section className="space-y-6">
      {/* header */}
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Select vaccine</h2>
        <p className="text-sm text-muted-foreground">
          Choose the vaccine you want to book an appointment for.
        </p>
      </div>

      {/* vaccine options */}
      <div className="grid grid-cols-1 gap-4">
        {vaccines.map((vaccine) => {
          const isSelected = vaccine.id === selectedVaccineId;

          return (
            <button
              key={vaccine.id}
              type="button"
              onClick={() => onSelect(vaccine.id)}
              className={cn(
                "text-left rounded-xl border p-4 hover:shadow-sm cursor-pointer active:scale-95 transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-dashed hover:border-foreground/30",
              )}
            >
              <div className="flex items-center gap-3">
                {/* icon */}
                <div className="">
                  <img
                    src="https://ik.imagekit.io/vaxify/icons/booster.png"
                    alt=""
                    className="h-14 w-14"
                    draggable={false}
                  />
                </div>

                {/* content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{vaccine.name}</h3>

                  {vaccine.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {vaccine.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
