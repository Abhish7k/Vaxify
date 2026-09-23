import type { Variants } from "framer-motion";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Tween, not spring. An underdamped spring settles past the target and then
// snaps back, which flashes cards (shadows, borders, blur) when the transform is cleared.
const entrance = {
  duration: 0.45,
  ease: EASE_OUT_EXPO,
} as const;

const stagger = {
  staggerChildren: 0.1,
  delayChildren: 0.1,
  opacity: entrance,
} as const;

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: stagger,
  },
  show: {
    opacity: 1,
    transition: stagger,
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: entrance,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: entrance,
  },
};

const entranceSlow = {
  duration: 0.8,
  ease: EASE_OUT_EXPO,
} as const;

export const fadeUpItemSlow: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: entranceSlow,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: entranceSlow,
  },
};

// Kept for existing call sites. Same settled tween as fadeUpItem — do not restore a spring here.
export const fadeUpItemSpring: Variants = fadeUpItem;

export const fadeItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: entrance,
  },
  show: {
    opacity: 1,
    transition: entrance,
  },
};
