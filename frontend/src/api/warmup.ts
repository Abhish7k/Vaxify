import api from "./axios";

let warmedUp = false;

export const warmUpBackend = () => {
  // guard against react strict-mode double-invocation / repeat calls
  if (warmedUp) return;
  warmedUp = true;

  // ping is best-effort: the slow-request toast is driven by interceptors so
  // hanging centers/login calls still explain the wait if ping fails fast.
  api.get("/ping", { timeout: 90_000 }).catch(() => {});
};
