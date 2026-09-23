import { useMutation } from "@tanstack/react-query";
import { aiApi } from "@/api/ai.api";

export function useAskAi() {
  return useMutation({
    mutationFn: (question: string) => aiApi.ask(question),
  });
}
