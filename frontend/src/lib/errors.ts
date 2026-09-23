import axios from "axios";

export type AiErrorCode =
  | "validation_error"
  | "unauthorized"
  | "rate_limited"
  | "ai_provider_error"
  | "service_unavailable"
  | "timeout"
  | "unknown";

const AI_ERROR_MESSAGES: Record<AiErrorCode, string> = {
  rate_limited:
    "AI Assistant is temporarily busy. Please try again in a moment.",
  service_unavailable:
    "AI Assistant is temporarily unavailable. Please try again shortly.",
  timeout: "That took longer than expected. Please try again.",
  unauthorized: "Your session has expired. Please sign in again.",
  validation_error: "Please enter a vaccine-related question.",
  ai_provider_error:
    "AI Assistant couldn't complete that request. Please try again.",
  unknown: "AI Assistant couldn't complete that request. Please try again.",
};

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      const body = data as Record<string, unknown>;
      if (typeof body.message === "string" && body.message.trim()) {
        return body.message;
      }
      if (typeof body.error === "string" && body.error.trim()) {
        return body.error;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const NON_FIELD_ERROR_KEYS = new Set([
  "message",
  "status",
  "code",
  "error",
  "requestId",
  "retryAfterSeconds",
]);

export function getServerFieldErrors(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) {
    return null;
  }

  const data = error.response.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (NON_FIELD_ERROR_KEYS.has(key)) continue;
    if (typeof value === "string" && value.trim()) {
      fields[key] = value;
    }
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

export function mapServerFieldErrors(
  error: unknown,
  fieldMap: Record<string, string>,
): Record<string, string> | null {
  const raw = getServerFieldErrors(error);
  if (!raw) return null;

  const mapped: Record<string, string> = {};
  for (const [apiField, message] of Object.entries(raw)) {
    const formField = fieldMap[apiField];
    if (formField && !mapped[formField]) {
      mapped[formField] = message;
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
}

export function fieldErrorAria(id: string, invalid: boolean) {
  return {
    "aria-invalid": invalid ? true : undefined,
    "aria-describedby": invalid ? `${id}-error` : undefined,
  };
}

export function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function isUnauthorizedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isConflictError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 409;
}

export function isServiceUnavailableError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 503;
}

export function isRateLimitedError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 429;
}

export function isTimeoutError(error: unknown) {
  if (!axios.isAxiosError(error)) return false;
  if (error.response?.status === 504) return true;
  return error.code === "ECONNABORTED" || /timeout/i.test(error.message);
}

function readAiErrorCode(error: unknown): AiErrorCode | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;
  const code = (data as Record<string, unknown>).code;
  if (typeof code !== "string") return null;
  if (code in AI_ERROR_MESSAGES) {
    return code as AiErrorCode;
  }
  return null;
}

export function getAiAskErrorCode(error: unknown): AiErrorCode {
  const fromBody = readAiErrorCode(error);
  if (fromBody) return fromBody;

  if (isUnauthorizedError(error)) return "unauthorized";
  if (isRateLimitedError(error)) return "rate_limited";
  if (isTimeoutError(error)) return "timeout";
  if (isServiceUnavailableError(error)) return "service_unavailable";
  if (axios.isAxiosError(error) && error.response?.status === 400) {
    return "validation_error";
  }
  return "unknown";
}

export function isAiAskRetryable(error: unknown) {
  const code = getAiAskErrorCode(error);
  return (
    code === "rate_limited" ||
    code === "service_unavailable" ||
    code === "timeout" ||
    code === "ai_provider_error" ||
    code === "unknown"
  );
}

export function getAiAskErrorMessage(error: unknown) {
  const code = getAiAskErrorCode(error);
  return AI_ERROR_MESSAGES[code];
}
