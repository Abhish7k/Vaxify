import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { getStoredToken } from "@/lib/auth-session";

const LEAVE_MESSAGE = "You have unsaved changes. Leave this page?";

export function useUnsavedChanges(
  when: boolean,
  options?: { allowPath?: (pathname: string) => boolean },
) {
  const blocker = useBlocker(({ nextLocation }) => {
    if (!when) return false;
    if (!getStoredToken()) return false;
    if (options?.allowPath?.(nextLocation.pathname)) return false;
    return true;
  });

  useEffect(() => {
    if (!when) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    if (window.confirm(LEAVE_MESSAGE)) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);
}
