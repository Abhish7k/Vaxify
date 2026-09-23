export type AiAskStatus = "answered" | "abstained";

export interface AiCitation {
  citationIndex: number;
  source: string;
  sourceId?: string;
  title?: string;
  publisher?: string;
  documentDate?: string;
  sourceUrl?: string;
  pageStart?: number;
  pageEnd?: number;
  section?: string;
  topic?: string;
}

export interface AiAskResult {
  status: AiAskStatus;
  answer: string;
  citations: AiCitation[];
}

export type AssistantChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      status: AiAskStatus;
      content: string;
      citations: AiCitation[];
    };
