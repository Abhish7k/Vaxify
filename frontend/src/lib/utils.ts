import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateOnly(dateString: string) {
  const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return new Date(dateString);
}

export function formatTime(time: string) {
  if (!time) return "";

  // if time is in hh:mm:ss format, return hh:mm
  return time.split(":").slice(0, 2).join(":");
}

export function formatTimeRange(startTime: string, endTime?: string) {
  if (!startTime || startTime === "N/A") return startTime;

  const start = formatTime(startTime);
  if (endTime) {
    return `${start} - ${formatTime(endTime)}`;
  }

  const parts = startTime.split(":");
  if (parts.length < 2) return startTime;

  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  if (Number.isNaN(hours)) return startTime;

  const endHours = (hours + 1) % 24;
  const startStr = `${String(hours).padStart(2, "0")}:${minutes}`;
  const endStr = `${String(endHours).padStart(2, "0")}:${minutes}`;

  return `${startStr} - ${endStr}`;
}

export function formatDate(dateString: string) {
  if (!dateString) return "";

  try {
    const date = parseDateOnly(dateString);

    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return dateString;
  }
}
