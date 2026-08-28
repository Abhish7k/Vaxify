export const PHONE_REGEX = /^\d{10}$/;
export const PINCODE_REGEX = /^\d{6}$/;

export const PHONE_MESSAGE = "Enter a valid 10-digit phone number";
export const PINCODE_MESSAGE = "Enter a valid 6-digit pincode";

export const SLOT_CAPACITY_MAX = 10;
export const BUSINESS_TIMEZONE = "Asia/Kolkata";

export function clampSlotCapacity(value: string, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, SLOT_CAPACITY_MAX);
}
