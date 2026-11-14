"use client";
// Shared motion tokens and wrappers. Every animation uses transform/opacity only, and
// <MotionConfig reducedMotion="user"> in page.tsx turns movement off for reduced-motion users.
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const DURATION = 0.32;

/** A step card entering: rises 16px and fades in. */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE_OUT } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.26, ease: EASE_OUT } },
};

/** Staggered list: children should be <StaggerItem>. */
export function Stagger({ as = "ul", className, children }: { as?: "ul" | "ol" | "div"; className?: string; children: ReactNode }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={listVariants} initial="hidden" animate="show">
      {children}
    </Comp>
  );
}

export function StaggerItem({ as = "li", className, children }: { as?: "li" | "div"; className?: string; children: ReactNode }) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={itemVariants}>
      {children}
    </Comp>
  );
}

/** Fade-and-rise for a block that appears after its parent (e.g. a verdict banner). */
export function Reveal({ delay = 0, className, children }: { delay?: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}
