import type { InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// free-tier backends (e.g. render) spin down after inactivity. any hanging
// request can be the one the user is waiting on — not just the warmup ping.
const COLD_START_THRESHOLD_MS = 2000;
const WARMUP_TOAST_ID = "backend-warmup";

type WatchedConfig = InternalAxiosRequestConfig & { __slowWatchId?: number };

const timerById = new Map<number, number>();
let nextWatchId = 0;
let pendingWatched = 0;
let toastShown = false;
let hadSuccess = false;

function isUploadRequest(config: InternalAxiosRequestConfig) {
  const url = config.url ?? "";
  return url.includes("/files/upload");
}

function showColdStartToast() {
  if (toastShown || pendingWatched === 0) return;
  toastShown = true;
  toast.loading("Waking up the server…", {
    id: WARMUP_TOAST_ID,
    description: "This is a free-tier demo! The first load can take up to a minute.",
    duration: Infinity,
  });
}

function finishToast() {
  if (!toastShown) return;

  if (hadSuccess) {
    toast.success("Server ready! Thanks for waiting!", {
      id: WARMUP_TOAST_ID,
      duration: 3000,
    });
  } else {
    toast.dismiss(WARMUP_TOAST_ID);
  }

  toastShown = false;
  hadSuccess = false;
}

export function beginSlowRequestWatch(config: InternalAxiosRequestConfig) {
  if (isUploadRequest(config)) return config;

  const watched = config as WatchedConfig;
  const id = ++nextWatchId;
  watched.__slowWatchId = id;
  pendingWatched += 1;
  timerById.set(id, window.setTimeout(showColdStartToast, COLD_START_THRESHOLD_MS));
  return config;
}

export function endSlowRequestWatch(config: InternalAxiosRequestConfig | undefined, succeeded: boolean) {
  const id = (config as WatchedConfig | undefined)?.__slowWatchId;
  if (id == null || !timerById.has(id)) return;

  window.clearTimeout(timerById.get(id));
  timerById.delete(id);
  pendingWatched = Math.max(0, pendingWatched - 1);

  if (succeeded) {
    hadSuccess = true;
  }

  if (pendingWatched === 0) {
    finishToast();
  }
}
