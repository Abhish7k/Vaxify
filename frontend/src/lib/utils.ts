import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string) {
  if (!time) return "";

  // if time is in hh:mm:ss format, return hh:mm
  return time.split(":").slice(0, 2).join(":");
}

export function formatTimeRange(startTime: string) {
  if (!startTime || startTime === "N/A") return startTime;

  // Handle cases like "09:00:00" or "09:00"
  const parts = startTime.split(":");
  if (parts.length < 2) return startTime;

  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];

  const startStr = `${hours}:${minutes}`;
  const endHours = hours + 1;
  const endStr = `${endHours}:${minutes}`;

  return `${startStr} - ${endStr}`;
}

export function formatDate(dateString: string) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return dateString;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch (error) {
    return dateString;
  }
}
