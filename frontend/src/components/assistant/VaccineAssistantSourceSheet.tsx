import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  formatDocumentDate,
  formatSourcePageLabel,
  formatSourceSection,
  isTrustedSourceUrl,
  sourceActionLabel,
  sourceDocumentHref,
} from "@/lib/assistant-citations";
import type { AiCitation } from "@/types/ai";

type Props = {
  citation: AiCitation | null;
  onOpenChange: (open: boolean) => void;
};

export default function VaccineAssistantSourceSheet({
  citation,
  onOpenChange,
}: Props) {
  const title = citation?.title?.trim() || citation?.source;
  const documentDate = citation?.documentDate
    ? formatDocumentDate(citation.documentDate)
    : null;
  const publisherLine = [citation?.publisher, documentDate]
    .filter(Boolean)
    .join(" · ");
  const pageLabel = citation ? formatSourcePageLabel(citation) : null;
  const sectionLabel = formatSourceSection(citation?.section);
  const sourceUrl =
    citation && isTrustedSourceUrl(citation.sourceUrl)
      ? citation.sourceUrl
      : null;
  const documentHref = sourceUrl
    ? sourceDocumentHref(sourceUrl, citation?.pageStart)
    : null;

  return (
    <Sheet open={citation !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md lg:max-w-lg"
      >
        {citation ? (
          <SheetHeader className="items-stretch gap-0 border-b-0 p-5 pr-12 text-left">
            <SheetDescription className="sr-only">
              Source details for citation {citation.citationIndex}
            </SheetDescription>
            <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2.5">
              <span className="flex size-6 items-center justify-center self-center rounded-md border border-input bg-background text-xs font-semibold text-foreground tabular-nums">
                {citation.citationIndex}
              </span>
              <SheetTitle className="self-center text-base leading-snug wrap-break-word">
                {title}
              </SheetTitle>

              {publisherLine ? (
                <p className="col-start-2 mt-1 text-xs leading-relaxed text-muted-foreground">
                  {publisherLine}
                </p>
              ) : null}

              {pageLabel || sectionLabel ? (
                <div className="col-start-2 mt-6 space-y-1">
                  {pageLabel ? (
                    <p className="text-sm font-medium text-foreground">
                      {pageLabel}
                    </p>
                  ) : null}
                  {sectionLabel ? (
                    <p className="text-sm leading-relaxed wrap-break-word text-muted-foreground">
                      {sectionLabel}
                    </p>
                  ) : null}
                </div>
              ) : null}

              {documentHref ? (
                <a
                  href={documentHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-start-2 mt-6 inline-flex w-fit max-w-full text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  {sourceActionLabel(citation.pageStart, documentHref)}
                  <span className="sr-only"> Opens in a new tab.</span>
                </a>
              ) : null}
            </div>
          </SheetHeader>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
