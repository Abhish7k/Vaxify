import { useEffect } from "react";
import { toastUtils } from "@/lib/toast";

export function useQueryErrorToast(isError: boolean, message: string, error?: unknown) {
  useEffect(() => {
    if (!isError) return;

    toastUtils.error(message);
  }, [isError, message, error]);
}
