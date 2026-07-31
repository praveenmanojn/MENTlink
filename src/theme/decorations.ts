/**
 * PeerLink Paper Design System — Decorations
 * Flat shadows, borders, and card styles matching the bulletin board aesthetic.
 * NO blur. NO gradients. NO rounded 20px corners.
 */
import { StyleSheet, ViewStyle } from 'react-native';
import { Colors } from './colors';

/** Flat (offset) shadow — looks like a physical paper shadow */
export const flatShadow = (
  offsetX = 4,
  offsetY = 4,
  color: string = Colors.borderBlack,
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: offsetX, height: offsetY },
  shadowOpacity: 1,
  shadowRadius: 0,  // Zero blur — flat / printed look
  elevation: 4,
});

/** Standard card border — 3px solid black */
export const cardBorder: ViewStyle = {
  borderWidth: 3,
  borderColor: Colors.borderBlack,
};

/** Thin card border — 2px solid black */
export const thinBorder: ViewStyle = {
  borderWidth: 2,
  borderColor: Colors.borderBlack,
};

/** Dashed border — for upload zones */
export const dashedBorder: ViewStyle = {
  borderWidth: 2,
  borderColor: Colors.borderLight,
  borderStyle: 'dashed',
};

/** Border radius presets — paper-like, NOT pill shaped */
export const Radius = {
  /** 0px — sharp corners */
  none: 0,
  /** 2px — barely rounded */
  xs: 2,
  /** 4px — paper label style */
  sm: 4,
  /** 6px — card corners */
  md: 6,
  /** 8px — input corners */
  lg: 8,
} as const;

/** Pre-built sticky note card style */
export const stickyNoteCard = (
  bgColor: string,
  rotation: number = 0,
): ViewStyle => ({
  backgroundColor: bgColor,
  borderWidth: 3,
  borderColor: Colors.borderBlack,
  borderRadius: Radius.md,
  padding: 16,
  transform: [{ rotate: `${rotation}deg` }],
  ...flatShadow(4, 4),
});
