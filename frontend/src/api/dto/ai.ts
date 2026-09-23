export interface AiAskRequestDto {
  question: string;
}

export interface AiCitationDto {
  source?: string;
  sourceId?: string | null;
  title?: string | null;
  publisher?: string | null;
  documentDate?: string | null;
  sourceUrl?: string | null;
  pageStart?: number | null;
  pageEnd?: number | null;
  section?: string | null;
  topic?: string | null;
}

export interface AiAskResponseDto {
  status: string;
  answer: string;
  citations?: AiCitationDto[];
}
