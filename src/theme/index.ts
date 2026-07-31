export const theme = {
  colors: {
    primary: '#4F46E5', // Indigo 600
    primaryDark: '#4338CA', // Indigo 700
    primaryLight: '#818CF8', // Indigo 400
    primaryBg: '#EEF2FF', // Indigo 50
    secondary: '#10B981', // Emerald 500
    secondaryDark: '#059669', // Emerald 600
    secondaryBg: '#ECFDF5', // Emerald 50
    accent: '#F59E0B', // Amber 500
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F5F9', // Slate 100
    text: '#0F172A', // Slate 900
    textSecondary: '#475569', // Slate 600
    muted: '#94A3B8', // Slate 400
    border: '#E2E8F0', // Slate 200
    borderLight: '#F1F5F9',
    error: '#EF4444', // Red 500
    errorBg: '#FEF2F2',
    success: '#10B981', // Emerald 500
    warning: '#F59E0B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;