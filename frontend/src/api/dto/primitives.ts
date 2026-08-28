export function asIdString(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

export function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}
