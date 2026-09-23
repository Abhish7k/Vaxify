import type { AiAskResponseDto, AiCitationDto } from "@/api/dto/ai";
import { asString } from "@/api/dto/primitives";
import { isTrustedSourceUrl } from "@/lib/assistant-citations";
import type { AiAskResult, AiAskStatus, AiCitation } from "@/types/ai";

function optionalText(value: unknown): string | undefined {
  const text = asString(value).trim();
  return text || undefined;
}

function presentPage(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || value < 1) {
    return undefined;
  }
  return value;
}

function mapCitation(dto: AiCitationDto, index: number): AiCitation {
  const citation: AiCitation = {
    citationIndex: index + 1,
    source: asString(dto.source, "Unknown source"),
  };

  const sourceId = optionalText(dto.sourceId);
  if (sourceId) {
    citation.sourceId = sourceId;
  }

  const title = optionalText(dto.title);
  if (title) {
    citation.title = title;
  }

  const publisher = optionalText(dto.publisher);
  if (publisher) {
    citation.publisher = publisher;
  }

  const documentDate = optionalText(dto.documentDate);
  if (documentDate) {
    citation.documentDate = documentDate;
  }

  const sourceUrl = asString(dto.sourceUrl).trim();
  if (isTrustedSourceUrl(sourceUrl)) {
    citation.sourceUrl = sourceUrl;
  }

  const pageStart = presentPage(dto.pageStart);
  if (pageStart !== undefined) {
    citation.pageStart = pageStart;
  }
  const pageEnd = presentPage(dto.pageEnd);
  if (pageEnd !== undefined) {
    citation.pageEnd = pageEnd;
  }

  const section = optionalText(dto.section);
  if (section) {
    citation.section = section;
  }

  const topic = optionalText(dto.topic);
  if (topic) {
    citation.topic = topic;
  }

  return citation;
}

export function mapAiAskResponse(dto: AiAskResponseDto): AiAskResult {
  const status: AiAskStatus =
    dto.status === "abstained" ? "abstained" : "answered";

  return {
    status,
    answer: asString(dto.answer),
    citations: (dto.citations ?? []).map((citation, index) =>
      mapCitation(citation, index),
    ),
  };
}
