/**
 * PeerLink Paper Design System — Theme Entry Point
 *
 * Import from this file anywhere in the app:
 *   import { Colors, FontFamily, FontSize, Spacing, Radius, flatShadow } from '../../theme';
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './decorations';
export * from './constants';
export * from './animations';

// Legacy theme object kept for backward compat during migration
// (some existing imports use `theme.colors.*`, `theme.spacing.*`, etc.)
import { Colors } from './colors';
import { FontSize } from './typography';
import { Spacing } from './spacing';
import { Radius } from './decorations';

export const theme = {
  colors: {
    // Map legacy names → paper tokens
    primary: Colors.pinBlue,
    primaryDark: '#1558B0',
    primaryLight: Colors.stickyBlue,
    primaryBg: '#E8F0FE',
    secondary: Colors.stickyGreen,
    secondaryDark: '#1E8E3E',
    secondaryBg: '#E8F5E9',
    accent: Colors.stickyYellow,
    background: Colors.notebookBg,
    surface: Colors.paperWhite,
    surfaceSecondary: Colors.paperCream,
    text: Colors.inkBlack,
    textSecondary: Colors.inkMedium,
    muted: Colors.inkLight,
    border: Colors.borderBlack,
    borderLight: Colors.borderLight,
    error: Colors.statusError,
    errorBg: Colors.statusErrorBg,
    success: Colors.statusSolved,
    warning: Colors.statusPending,
  },
  spacing: {
    xs: Spacing.xxs,
    sm: Spacing.sm,
    md: Spacing.md,
    lg: Spacing.lg,
    xl: Spacing.xl,
    xxl: Spacing.xxl,
  },
  borderRadius: {
    sm: Radius.sm,
    md: Radius.md,
    lg: Radius.lg,
    xl: Radius.lg,
    full: 9999,
  },
  fontSize: {
    xs: FontSize.xs,
    sm: FontSize.sm,
    md: FontSize.md,
    lg: FontSize.lg,
    xl: FontSize.xl,
    xxl: FontSize.xxl,
    xxxl: FontSize.xxxl,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: Colors.borderBlack,
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    md: {
      shadowColor: Colors.borderBlack,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    lg: {
      shadowColor: Colors.borderBlack,
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;