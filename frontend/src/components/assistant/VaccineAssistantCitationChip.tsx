import { citationChipLabel } from "@/lib/assistant-citations";
import { cn } from "@/lib/utils";
import type { AiCitation } from "@/types/ai";

type Props = {
  citation: AiCitation;
  selected?: boolean;
  onSelect: (citation: AiCitation) => void;
};

export default function VaccineAssistantCitationChip({
  citation,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(citation)}
      className={cn(
        "inline-flex max-w-full cursor-pointer items-center rounded-full border px-3 py-1 text-left text-xs font-medium transition-colors",
        selected
          ? "border-foreground bg-foreground/5 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      <span className="truncate">{citationChipLabel(citation)}</span>
    </button>
  );
}
