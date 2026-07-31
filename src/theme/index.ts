import { createTheme } from '@windicramble/nativewind';

export const theme = createTheme({
  colors: {
    primary: '#6C63FF',
    secondary: '#10B981',
    background: '#FFFFFF',
    card: '#F9FAFB',
    text: '#111827',
    muted: '#6B7280',
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60],
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 1px 3px 0 rgba(0,0,0,0.1)',
    lg: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
  },
  fonts: {
    sans: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
});