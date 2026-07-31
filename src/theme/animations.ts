/**
 * PeerLink Paper Design System — Animation Constants
 * Subtle paper-lift animations. Short duration. No spring overshoot.
 */
export const Animations = {
  /** Duration for card hover / lift */
  cardLift: 200,
  /** Duration for button press */
  buttonPress: 150,
  /** Duration for rotation straighten */
  straighten: 200,
  /** Duration for page transitions */
  pageTransition: 250,
} as const;

/** Animated values for paper card interactions */
export const CardAnimations = {
  /** Rotation range: card straightens on hover */
  hoverRotation: 0,
  /** Default card scale */
  defaultScale: 1,
  /** Scale on press */
  pressScale: 0.97,
} as const;
