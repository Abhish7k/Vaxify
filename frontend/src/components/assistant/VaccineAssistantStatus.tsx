import { useEffect, useState } from "react";
import { ASSISTANT_LOADING_MESSAGES } from "@/lib/assistant-citations";
import { cn } from "@/lib/utils";

const PHASE_COUNT = ASSISTANT_LOADING_MESSAGES.length + 1;

function TypingDots() {
  return (
    <span className="flex h-5 items-center gap-1" aria-hidden>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 rounded-full bg-foreground/80 motion-safe:animate-[typing-dot_1.15s_ease-in-out_infinite]"
          style={{ animationDelay: `${dot * 160}ms` }}
        />
      ))}
    </span>
  );
}

export default function VaccineAssistantStatus() {
  const [index, setIndex] = useState(0);
  const showingDots = index === 0;
  const message = showingDots ? null : ASSISTANT_LOADING_MESSAGES[index - 1];

  useEffect(() => {
    const delay = index === 0 ? 1400 : 2200;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % PHASE_COUNT);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [index]);

  return (
    <div aria-live="polite" className="flex h-5 items-center">
      <span className="sr-only">
        {showingDots ? "Assistant is responding" : message}
      </span>
      {showingDots ? (
        <TypingDots />
      ) : (
        <p
          className={cn(
            "w-fit bg-clip-text text-sm font-medium text-transparent",
            "bg-[linear-gradient(to_right,var(--muted-foreground)_35%,var(--foreground)_50%,var(--muted-foreground)_65%)]",
            "bg-size-[200%_auto]",
            "animate-[shimmer_2.5s_linear_infinite]",
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}
