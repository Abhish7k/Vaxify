import type { Center } from "@/types/hospital";
import type { Vaccine } from "@/types/vaccine";

const DRAFT_PREFIX = "vaxify:booking-draft:";
const LATEST_KEY = "vaxify:booking-draft:latest";

export type BookingDraft = {
  centerId: string;
  center: Pick<Center, "id" | "name" | "address">;
  selectedVaccineId: string | null;
  selectedDate: string | null;
  selectedSlot: string | null;
  vaccine: Pick<Vaccine, "id" | "name"> | null;
};

function draftKey(centerId: string) {
  return `${DRAFT_PREFIX}${centerId}`;
}

export function saveBookingDraft(draft: BookingDraft) {
  try {
    const payload = JSON.stringify(draft);
    sessionStorage.setItem(draftKey(draft.centerId), payload);
    sessionStorage.setItem(LATEST_KEY, payload);
  } catch {
    // ignore storage quota / private mode
  }
}

export function loadBookingDraft(centerId?: string | null): BookingDraft | null {
  try {
    const raw = centerId
      ? sessionStorage.getItem(draftKey(centerId))
      : sessionStorage.getItem(LATEST_KEY);

    if (!raw) return null;

    const draft = JSON.parse(raw) as BookingDraft;
    if (!draft?.centerId || !draft.center) return null;
    if (centerId && draft.centerId !== centerId) return null;

    return draft;
  } catch {
    return null;
  }
}

export function clearAllBookingDrafts() {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(DRAFT_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // ignore
  }
}

export function clearBookingDraft(centerId?: string | null) {
  try {
    if (centerId) {
      sessionStorage.removeItem(draftKey(centerId));
    }

    const latest = sessionStorage.getItem(LATEST_KEY);
    if (!latest) return;

    if (!centerId) {
      sessionStorage.removeItem(LATEST_KEY);
      return;
    }

    const draft = JSON.parse(latest) as BookingDraft;
    if (draft?.centerId === centerId) {
      sessionStorage.removeItem(LATEST_KEY);
    }
  } catch {
    // ignore
  }
}
