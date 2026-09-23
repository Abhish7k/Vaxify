import { z } from "zod";

export const PHONE_REGEX = /^\d{10}$/;
export const PINCODE_REGEX = /^\d{6}$/;

export const PHONE_MESSAGE = "Enter a valid 10-digit phone number";
export const PINCODE_MESSAGE = "Enter a valid 6-digit pincode";

export const NAME_MAX = 100;
export const NAME_MAX_MESSAGE = "Name must be between 2 and 100 characters";
export const STAFF_NAME_MAX_MESSAGE = "Staff name must be between 2 and 100 characters";

export const PASSWORD_MAX = 20;
export const PASSWORD_MIN_MESSAGE = "Password must be at least 6 characters";
export const PASSWORD_MAX_MESSAGE = "Password must be at most 20 characters";

export const HOSPITAL_NAME_MAX = 100;
export const HOSPITAL_NAME_MAX_MESSAGE = "Hospital name must be between 2 and 100 characters";
export const ADDRESS_MAX = 255;
export const ADDRESS_MAX_MESSAGE = "Hospital address must be at most 255 characters";
export const CITY_MAX = 100;
export const CITY_MAX_MESSAGE = "City must be at most 100 characters";
export const STATE_MAX = 100;
export const STATE_MAX_MESSAGE = "State must be at most 100 characters";

export const passwordField = z
  .string()
  .min(6, PASSWORD_MIN_MESSAGE)
  .max(PASSWORD_MAX, PASSWORD_MAX_MESSAGE);

export const SLOT_CAPACITY_MAX = 10;
export const BUSINESS_TIMEZONE = "Asia/Kolkata";

export function clampSlotCapacity(value: string, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, SLOT_CAPACITY_MAX);
}
