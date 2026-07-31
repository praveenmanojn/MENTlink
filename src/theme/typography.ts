/**
 * PeerLink Paper Design System — Typography Tokens
 * Font: Poppins (Google Fonts via @expo-google-fonts/poppins)
 */
import { Platform } from 'react-native';

/** Poppins font family map — loaded via useFonts() in App.tsx */
export const FontFamily = {
  extraBold: 'Poppins_800ExtraBold',
  bold: 'Poppins_700Bold',
  semiBold: 'Poppins_600SemiBold',
  medium: 'Poppins_500Medium',
  regular: 'Poppins_400Regular',
} as const;

/**
 * Safe font fallback for use before fonts load, or if they fail to load.
 * Uses a system sans-serif font on each platform.
 */
export const FontFallback = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const FontSize = {
  /** 10px — tiny labels */
  xxs: 10,
  /** 12px — captions */
  xs: 12,
  /** 14px — body small */
  sm: 14,
  /** 16px — body default */
  md: 16,
  /** 18px — body large */
  lg: 18,
  /** 20px — section titles */
  xl: 20,
  /** 24px — headings */
  xxl: 24,
  /** 30px — display */
  xxxl: 30,
  /** 40px — hero */
  display: 40,
  /** 56px — countdown timer */
  hero: 56,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const;
