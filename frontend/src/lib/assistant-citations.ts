import type { AiCitation } from "@/types/ai";
import { formatDate } from "@/lib/utils";

export function isTrustedSourceUrl(
  value: string | undefined | null,
): value is string {
  if (!value) {
    return false;
  }
  const url = value.trim();
  if (!url.startsWith("https://")) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function formatDocumentDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return value.trim();
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return value.trim();
  }
  return formatDate(date);
}

export function formatSourcePageLabel(citation: AiCitation): string | null {
  if (typeof citation.pageStart !== "number" || citation.pageStart < 1) {
    return null;
  }

  if (
    typeof citation.pageEnd === "number" &&
    citation.pageEnd >= 1 &&
    citation.pageEnd !== citation.pageStart
  ) {
    return `Pages ${citation.pageStart}–${citation.pageEnd}`;
  }

  return `Page ${citation.pageStart}`;
}

const TRAILING_PAGE_SUFFIX =
  /\s*[—–-]\s*pages?\s+\d+(?:\s*[–-]\s*\d+)?\s*$/i;

export function formatSourceSection(section: string | undefined): string | null {
  const raw = section?.trim();
  if (!raw) {
    return null;
  }

  const withoutPage = raw.replace(TRAILING_PAGE_SUFFIX, "").trim();
  if (!withoutPage || /^pages?\s+\d+(?:\s*[–-]\s*\d+)?$/i.test(withoutPage)) {
    return null;
  }

  const chapter = /^Ch\.?\s*(\d+)\b\s*(.*)$/i.exec(withoutPage);
  if (!chapter) {
    return withoutPage;
  }

  const title = chapter[2].replace(/^[:.\-–—]\s*/, "").trim();
  return title ? `Chapter ${chapter[1]} · ${title}` : `Chapter ${chapter[1]}`;
}

export function sourceDocumentHref(
  sourceUrl: string,
  pageStart: number | undefined,
): string {
  if (typeof pageStart !== "number" || pageStart < 1 || sourceUrl.includes("#")) {
    return sourceUrl;
  }
  if (!/\.pdf(?:$|[?#])/i.test(sourceUrl)) {
    return sourceUrl;
  }
  return `${sourceUrl}#page=${pageStart}`;
}

export function sourceActionLabel(pageStart: number | undefined, href: string): string {
  if (
    typeof pageStart === "number" &&
    pageStart >= 1 &&
    href.includes("#page=")
  ) {
    return `Open source · Page ${pageStart} ↗`;
  }
  return "Open source document ↗";
}

export function citationChipLabel(citation: AiCitation): string {
  return `${citation.citationIndex}. ${citation.source}`;
}

export function citationByIndex(
  citations: AiCitation[],
  index: number,
): AiCitation | undefined {
  return citations.find((citation) => citation.citationIndex === index);
}

export const ASSISTANT_SUGGESTIONS = [
  "What vaccines are given at birth?",
  "When is Td given during pregnancy?",
  "What is PCV?",
  "Are vaccines safe?",
] as const;

export const ASSISTANT_LOADING_MESSAGES = [
  "Checking vaccine information…",
  "Reviewing trusted sources…",
] as const;

export const AI_QUESTION_MAX_LENGTH = 2000;
