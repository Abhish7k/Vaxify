import { BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ASSISTANT_SUGGESTIONS } from "@/lib/assistant-citations";

type Props = {
  disabled?: boolean;
  onSuggest: (question: string) => void;
};

export default function VaccineAssistantEmptyState({
  disabled,
  onSuggest,
}: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-2xl border bg-muted/40">
          <BookOpenText className="size-6 text-foreground" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            AI Assistant
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Ask about immunization schedules, vaccine safety, and related topics.
            Answers are grounded in Vaxify&apos;s curated MoHFW and WHO sources.
          </p>
        </div>
      </div>

      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {ASSISTANT_SUGGESTIONS.map((question) => (
          <Button
            key={question}
            type="button"
            variant="outline"
            disabled={disabled}
            className="h-auto justify-start rounded-xl px-4 py-3 text-left text-sm font-normal whitespace-normal"
            onClick={() => onSuggest(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
}
