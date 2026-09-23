import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function VaccineAssistantError({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Couldn’t get an answer
            </p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
