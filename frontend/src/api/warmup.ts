import { toast } from "sonner";
import api from "./axios";

// free-tier backends (e.g. render) spin down after inactivity, so the first
// request after idle triggers a slow cold start. we ping the backend on app
// load to wake it while the user browses, and only surface a toast if the
// response is slow enough to indicate an actual cold start.
const COLD_START_THRESHOLD_MS = 2000;
const WARMUP_TOAST_ID = "backend-warmup";

let warmedUp = false;

export const warmUpBackend = () => {
  // guard against react strict-mode double-invocation / repeat calls
  if (warmedUp) return;
  warmedUp = true;

  let toastShown = false;

  const coldStartTimer = window.setTimeout(() => {
    toastShown = true;
    toast.loading("Waking up the server…", {
      id: WARMUP_TOAST_ID,
      description:
        "This is a free-tier demo — the first load can take up to a minute.",
      duration: Infinity,
    });
  }, COLD_START_THRESHOLD_MS);

  api
    .get("/ping", { timeout: 90_000 })
    .then(() => {
      window.clearTimeout(coldStartTimer);
      if (toastShown) {
        toast.success("Server ready — thanks for waiting!", {
          id: WARMUP_TOAST_ID,
          duration: 3000,
        });
      }
    })
    .catch(() => {
      // don't nag the user on a failed warm-up; real requests will surface
      // their own errors. just clear the "waking up" toast if it was shown.
      window.clearTimeout(coldStartTimer);
      if (toastShown) {
        toast.dismiss(WARMUP_TOAST_ID);
      }
    });
};
