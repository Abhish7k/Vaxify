import { Button } from "@/components/ui/button";

interface PageLoadErrorProps {
  message?: string;
  onRetry: () => void;
}

export function PageLoadError({
  message = "Could not load data.",
  onRetry,
}: PageLoadErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed px-4">
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
