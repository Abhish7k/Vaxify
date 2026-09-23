import { useState } from "react";
import { Check, Copy, Info } from "lucide-react";
import VaccineAssistantCitationChip from "@/components/assistant/VaccineAssistantCitationChip";
import VaccineAssistantMarkdown from "@/components/assistant/VaccineAssistantMarkdown";
import { Button } from "@/components/ui/button";
import type { AiCitation } from "@/types/ai";

function withTrailingCitationMarkers(
  text: string,
  citations: AiCitation[],
): string {
  if (citations.length === 0 || /\[\d+\]/.test(text)) {
    return text;
  }

  const markers = citations
    .map((citation) => `[${citation.citationIndex}]`)
    .join("");
  return `${text.trimEnd()} ${markers}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8 text-muted-foreground"
      onClick={() => void handleCopy()}
      aria-label="Copy answer"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}

type Props = {
  content: string;
  status: "answered" | "abstained";
  citations: AiCitation[];
  selectedCitationIndex: number | null;
  onSelectCitation: (citation: AiCitation) => void;
};

export default function VaccineAssistantMessage({
  content,
  status,
  citations,
  selectedCitationIndex,
  onSelectCitation,
}: Props) {
  if (status === "abstained") {
    return (
      <div className="min-w-0 space-y-3">
        <div className="flex items-start gap-3 rounded-xl border border-dashed bg-muted/30 px-4 py-3">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Not enough information
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {content.trim() ||
                "Vaxify could not find enough information in its vaccine knowledge base to answer this confidently."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderedContent = withTrailingCitationMarkers(content, citations);

  return (
    <div className="min-w-0 space-y-3">
      <VaccineAssistantMarkdown
        text={renderedContent}
        citations={citations}
        selectedCitationIndex={selectedCitationIndex}
        onSelectCitation={onSelectCitation}
      />

      {citations.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {citations.map((citation) => (
            <VaccineAssistantCitationChip
              key={`${citation.source}-${citation.citationIndex}`}
              citation={citation}
              selected={selectedCitationIndex === citation.citationIndex}
              onSelect={onSelectCitation}
            />
          ))}
        </div>
      ) : null}

      {content ? (
        <div className="flex items-center gap-1 pt-0.5">
          <CopyButton text={content} />
        </div>
      ) : null}
    </div>
  );
}
