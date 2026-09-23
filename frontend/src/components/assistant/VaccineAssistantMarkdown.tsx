import { useMemo } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import VaccineAssistantCitationMarker from "@/components/assistant/VaccineAssistantCitationMarker";
import { citationByIndex } from "@/lib/assistant-citations";
import { cn } from "@/lib/utils";
import type { AiCitation } from "@/types/ai";

const CITE_PREFIX = "#citation-";

const MARKDOWN_CLASSES = cn(
  "space-y-3 text-sm leading-relaxed text-foreground",
  "[&_p]:leading-relaxed [&_strong]:font-semibold",
  "[&_a]:font-medium [&_a]:underline [&_a]:underline-offset-4",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
  "[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
);

function withCitationLinks(text: string, validIndices: Set<number>): string {
  return text.replace(/\[(\d+)\]/g, (match, digits: string) => {
    const index = Number(digits);
    return validIndices.has(index) ? `[${match}](${CITE_PREFIX}${index})` : match;
  });
}

type Props = {
  text: string;
  citations: AiCitation[];
  selectedCitationIndex: number | null;
  onSelectCitation: (citation: AiCitation) => void;
};

export default function VaccineAssistantMarkdown({
  text,
  citations,
  selectedCitationIndex,
  onSelectCitation,
}: Props) {
  const validIndices = useMemo(
    () => new Set(citations.map((citation) => citation.citationIndex)),
    [citations],
  );
  const source = useMemo(
    () => withCitationLinks(text, validIndices),
    [text, validIndices],
  );

  const components: Partial<Components> = useMemo(
    () => ({
      a({ href, children, ...props }) {
        if (href?.startsWith(CITE_PREFIX)) {
          const index = Number(href.slice(CITE_PREFIX.length));
          const citation = citationByIndex(citations, index);
          if (citation) {
            return (
              <VaccineAssistantCitationMarker
                index={index}
                selected={selectedCitationIndex === index}
                onSelect={() => onSelectCitation(citation)}
              />
            );
          }
        }

        return (
          <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
            {children}
          </a>
        );
      },
    }),
    [citations, selectedCitationIndex, onSelectCitation],
  );

  return (
    <div className={MARKDOWN_CLASSES}>
      <ReactMarkdown components={components}>{source}</ReactMarkdown>
    </div>
  );
}
