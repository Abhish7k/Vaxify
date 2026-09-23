import { Info } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STEPS = [
  {
    title: "Your question",
    body: "You ask a vaccine-related question.",
  },
  {
    title: "Trusted sources",
    body: "AI Assistant searches Vaxify's curated vaccine information.",
  },
  {
    title: "Grounded answer",
    body: "It generates an answer using the retrieved information.",
  },
  {
    title: "Sources",
    body: "Citations show which official source was used, and open that document when a link is available.",
  },
] as const;

export default function VaccineAssistantHowItWorksSheet({
  open,
  onOpenChange,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 sm:max-w-md lg:max-w-lg"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="text-base leading-snug">
            How AI Assistant works
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            AI Assistant looks for relevant information in Vaxify&apos;s
            curated vaccine knowledge base and uses that information to generate
            an answer.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <ol className="space-y-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background tabular-nums">
                  {index + 1}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <SheetFooter className="border-t p-4">
          <div className="flex gap-3 rounded-xl border bg-muted/30 p-3">
            <Info
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                If the knowledge base does not contain enough information to
                answer confidently, AI Assistant may say it does not have enough
                information rather than guess.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI Assistant is designed to provide answers grounded in
                Vaxify&apos;s curated vaccine sources. Always consult a
                qualified healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
