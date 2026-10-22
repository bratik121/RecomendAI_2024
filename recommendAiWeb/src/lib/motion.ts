import type { Variants, Transition } from "framer-motion";

/**
 * Centralized motion language for RecomendAI.
 *
 * Every animated surface in the app imports its variants from here so the
 * easing, distance, and stagger rhythm stay consistent. The `<MotionConfig
 * reducedMotion="user">` wrapper in App.tsx makes Framer respect
 * `prefers-reduced-motion` automatically (transform/layout motion is dropped,
 * opacity fades remain for legibility).
 */

/** Signature ease: exponential ease-out from an already-visible default. */
export const EASE = [0.16, 1, 0.3, 1] as const;

export const SPRING: Transition = {
	type: "spring",
	stiffness: 260,
	damping: 24,
} as const;

export const DURATION = {
	fast: 0.18,
	base: 0.4,
	slow: 0.6,
} as const;

/* ------------------------------------------------------------------ */
/* Directional entrances (single element)                              */
/* ------------------------------------------------------------------ */

export const fade: Variants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE } },
};

export const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

export const fadeDown: Variants = {
	hidden: { opacity: 0, y: -24 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

export const fadeLeft: Variants = {
	hidden: { opacity: 0, x: -32 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

export const fadeRight: Variants = {
	hidden: { opacity: 0, x: 32 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

export const scaleIn: Variants = {
	hidden: { opacity: 0, scale: 0.96 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

/* ------------------------------------------------------------------ */
/* Lists: staggered container + item                                   */
/* ------------------------------------------------------------------ */

export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
	hidden: {},
	visible: {
		transition: { staggerChildren: stagger, delayChildren: delay },
	},
});

export const staggerItem: Variants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
};

/** Build an item variant that inherits the container's stagger. */
export const listItem = (distance = 20): Variants => ({
	hidden: { opacity: 0, y: distance },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
});

/* ------------------------------------------------------------------ */
/* Page transitions (used by AnimatePresence around routes)            */
/* ------------------------------------------------------------------ */

export const pageTransition: Variants = {
	initial: { opacity: 0, y: 8 },
	enter: {
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE },
	},
	exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" } },
};

/* ------------------------------------------------------------------ */
/* Shared whileInView config                                           */
/* ------------------------------------------------------------------ */

export const inViewOnce = {
	once: true,
	margin: "-80px",
} as const;
