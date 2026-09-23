import type { AiAskRequestDto, AiAskResponseDto } from "@/api/dto/ai";
import { mapAiAskResponse } from "@/api/mappers/ai";
import type { AiAskResult } from "@/types/ai";
import api from "./axios";

export const aiApi = {
  ask: async (question: string): Promise<AiAskResult> => {
    const response = await api.post<AiAskResponseDto>(
      "/ai/ask",
      { question } satisfies AiAskRequestDto,
    );
    return mapAiAskResponse(response.data);
  },
};
