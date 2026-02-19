import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type Props = {
  isDisabled: boolean;
  vaccineName?: string;
  selectedDate?: string | null;
  selectedSlot?: string | null;
  onConfirm: () => void;
};

export default function ConfirmBookingFooter({
  isDisabled,
  vaccineName,
  selectedDate,
  selectedSlot,
  onConfirm,
}: Props) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur mb-10">
      <div className="max-w-6xl mx-10 xl:mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-4 border rounded-xl shadow-lg">
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {vaccineName || "Select a vaccine"}
          </span>

          <span className="text-xs text-muted-foreground">
            {selectedDate && selectedSlot
              ? `${new Date(selectedDate).toDateString()} • ${selectedSlot}`
              : "Select date & time"}
          </span>
        </div>

        <Button
          disabled={isDisabled}
          onClick={onConfirm}
          className="text-sm gap-2 cursor-pointer active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4" />
          Review
        </Button>
      </div>
    </div>
  );
}
