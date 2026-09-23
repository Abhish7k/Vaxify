import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CircleHelp, RotateCcw } from "lucide-react";
import VaccineAssistantComposer from "@/components/assistant/VaccineAssistantComposer";
import VaccineAssistantError from "@/components/assistant/VaccineAssistantError";
import VaccineAssistantHowItWorksSheet from "@/components/assistant/VaccineAssistantHowItWorksSheet";
import VaccineAssistantMessageList from "@/components/assistant/VaccineAssistantMessageList";
import VaccineAssistantSourceSheet from "@/components/assistant/VaccineAssistantSourceSheet";
import { Button } from "@/components/ui/button";
import { useAskAi } from "@/hooks/queries/use-ai";
import {
  DEMO_UNSUPPORTED_ANSWER,
  findDemoConversation,
} from "@/lib/copilot/demo-data";
import {
  DEMO_REPLY_DELAY_MS,
  isCopilotDemoMode,
} from "@/lib/copilot-mode";
import {
  getAiAskErrorMessage,
  isAiAskRetryable,
} from "@/lib/errors";
import { fadeUpItemSlow, staggerContainer } from "@/lib/motion";
import type { AiCitation, AssistantChatMessage } from "@/types/ai";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function VaccineAssistantPage() {
  const demoMode = isCopilotDemoMode();
  const askMutation = useAskAi();
  const workspaceLabelId = useId();
  const chatSessionRef = useRef(0);
  const demoTimerRef = useRef<number | null>(null);

  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [demoPending, setDemoPending] = useState(false);
  const [composerKey, setComposerKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorRetryable, setErrorRetryable] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [selectedCitation, setSelectedCitation] = useState<AiCitation | null>(
    null,
  );
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  const isLoading = demoMode ? demoPending : askMutation.isPending;
  const hasStartedConversation = messages.some(
    (message) => message.role === "user",
  );
  useEffect(() => {
    return () => {
      if (demoTimerRef.current !== null) {
        window.clearTimeout(demoTimerRef.current);
      }
    };
  }, []);

  function clearDemoTimer() {
    if (demoTimerRef.current !== null) {
      window.clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  }

  function handleReset() {
    chatSessionRef.current += 1;
    clearDemoTimer();
    setDemoPending(false);
    askMutation.reset();
    setMessages([]);
    setComposerKey((current) => current + 1);
    setErrorMessage(null);
    setErrorRetryable(false);
    setLastQuestion("");
    setSelectedCitation(null);
    setHowItWorksOpen(false);
  }

  const askQuestion = async (
    rawQuestion: string,
    options?: { fromRetry?: boolean },
  ) => {
    const question = rawQuestion.trim();
    if (!question || isLoading) return;

    const session = chatSessionRef.current;
    setLastQuestion(question);
    setErrorMessage(null);
    setErrorRetryable(false);
    setSelectedCitation(null);

    if (!options?.fromRetry) {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("user"),
          role: "user",
          content: question,
        },
      ]);
    }

    if (demoMode) {
      setDemoPending(true);
      clearDemoTimer();
      demoTimerRef.current = window.setTimeout(() => {
        demoTimerRef.current = null;
        if (session !== chatSessionRef.current) return;
        const conversation = findDemoConversation(question);
        setMessages((current) => [
          ...current,
          {
            id: createMessageId("assistant"),
            role: "assistant",
            status: conversation?.status ?? "answered",
            content: conversation?.answer ?? DEMO_UNSUPPORTED_ANSWER,
            citations: conversation?.citations ?? [],
          },
        ]);
        setDemoPending(false);
      }, DEMO_REPLY_DELAY_MS);
      return;
    }

    try {
      const response = await askMutation.mutateAsync(question);
      if (session !== chatSessionRef.current) return;
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("assistant"),
          role: "assistant",
          status: response.status,
          content: response.answer,
          citations: response.citations,
        },
      ]);
    } catch (error) {
      if (session !== chatSessionRef.current) return;
      setErrorMessage(getAiAskErrorMessage(error));
      setErrorRetryable(isAiAskRetryable(error));
    }
  };

  return (
    <motion.div
      aria-labelledby={workspaceLabelId}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex h-[calc(100dvh-3.5rem-3rem)] min-h-0 flex-col gap-6 px-3 sm:px-4 lg:px-6"
    >
      <motion.header variants={fadeUpItemSlow} className="shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              id={workspaceLabelId}
              className="text-xl font-semibold tracking-tight sm:text-2xl"
            >
              AI Assistant
            </h1>
            {demoMode ? (
              <div className="text-sm text-muted-foreground">
                <p>Demo Mode · AI/RAG service not deployed.</p>
                <p>
                  This is a simulated preview of how Vaxify Copilot works since
                  the Python AI RAG service is not deployed.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ask vaccine questions grounded in curated sources
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasStartedConversation ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleReset}
                aria-label="Reset conversation"
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setHowItWorksOpen(true)}
              aria-label="How it works"
            >
              <CircleHelp className="size-4" />
              How it works
            </Button>
          </div>
        </div>
      </motion.header>

      <motion.div
        variants={fadeUpItemSlow}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <VaccineAssistantMessageList
          messages={messages}
          isLoading={isLoading}
          selectedCitationIndex={selectedCitation?.citationIndex ?? null}
          onSelectCitation={setSelectedCitation}
          onSuggest={(question) => void askQuestion(question)}
        />

        {errorMessage ? (
          <div className="mx-auto w-full max-w-3xl pb-2">
            <VaccineAssistantError
              message={errorMessage}
              onRetry={
                errorRetryable
                  ? () => void askQuestion(lastQuestion, { fromRetry: true })
                  : undefined
              }
            />
          </div>
        ) : null}

        <VaccineAssistantComposer
          key={composerKey}
          isLoading={isLoading}
          onSend={(question) => void askQuestion(question)}
        />
      </motion.div>

      <VaccineAssistantSourceSheet
        citation={selectedCitation}
        onOpenChange={(open) => {
          if (!open) setSelectedCitation(null);
        }}
      />

      <VaccineAssistantHowItWorksSheet
        open={howItWorksOpen}
        onOpenChange={setHowItWorksOpen}
      />
    </motion.div>
  );
}
