import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { AI_QUESTION_MAX_LENGTH } from "@/lib/assistant-citations";

type Props = {
  isLoading: boolean;
  onSend: (question: string) => void;
};

export default function VaccineAssistantComposer({ isLoading, onSend }: Props) {
  const [input, setInput] = useState("");
  const trimmed = input.trim();
  const canSend =
    trimmed.length > 0 &&
    trimmed.length <= AI_QUESTION_MAX_LENGTH &&
    !isLoading;

  function submit() {
    if (!canSend) return;
    onSend(trimmed);
    setInput("");
  }

  return (
    <div className="bg-background pb-1 pt-2">
      <div className="mx-auto w-full max-w-3xl">
        <PromptInput
          value={input}
          onValueChange={setInput}
          isLoading={isLoading}
          onSubmit={submit}
          className="rounded-2xl"
        >
          <PromptInputTextarea
            placeholder="Ask a vaccine-related question…"
            maxLength={AI_QUESTION_MAX_LENGTH}
            disabled={isLoading}
            aria-label="Ask AI Assistant a vaccine question"
          />
          <PromptInputActions className="justify-end pt-1">
            <PromptInputAction tooltip="Ask">
              <Button
                type="button"
                size="icon"
                className="rounded-full"
                onClick={submit}
                disabled={!canSend}
                aria-label="Send question"
              >
                <ArrowUp className="size-4" />
              </Button>
            </PromptInputAction>
          </PromptInputActions>
        </PromptInput>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          AI Assistant answers are grounded in curated vaccine sources. Verify
          citations before relying on them.
        </p>
      </div>
    </div>
  );
}
