import { useEffect, useRef } from "react";
import VaccineAssistantMessage from "@/components/assistant/VaccineAssistantMessage";
import VaccineAssistantEmptyState from "@/components/assistant/VaccineAssistantEmptyState";
import VaccineAssistantStatus from "@/components/assistant/VaccineAssistantStatus";
import type { AiCitation, AssistantChatMessage } from "@/types/ai";

type Props = {
  messages: AssistantChatMessage[];
  isLoading: boolean;
  selectedCitationIndex: number | null;
  onSelectCitation: (citation: AiCitation) => void;
  onSuggest: (question: string) => void;
};

export default function VaccineAssistantMessageList({
  messages,
  isLoading,
  selectedCitationIndex,
  onSelectCitation,
  onSuggest,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 py-2">
        {messages.length === 0 ? (
          <VaccineAssistantEmptyState
            disabled={isLoading}
            onSuggest={onSuggest}
          />
        ) : (
          messages.map((message) => {
            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-secondary-foreground">
                    {message.content}
                  </div>
                </div>
              );
            }

            return (
              <VaccineAssistantMessage
                key={message.id}
                content={message.content}
                status={message.status}
                citations={message.citations}
                selectedCitationIndex={selectedCitationIndex}
                onSelectCitation={onSelectCitation}
              />
            );
          })
        )}

        {isLoading ? <VaccineAssistantStatus /> : null}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
