import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[`size_${size}`], styles[`variant_${variant}`], style]}>
      <Text style={[styles.text, styles[`textSize_${size}`], styles[`textVariant_${variant}`], textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
  },
  size_sm: {
    paddingHorizontal: theme.spacing.xs + 4,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: 4,
  },
  variant_primary: {
    backgroundColor: theme.colors.primaryBg,
  },
  variant_secondary: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  variant_success: {
    backgroundColor: theme.colors.secondaryBg,
  },
  variant_warning: {
    backgroundColor: '#FEF3C7',
  },
  variant_error: {
    backgroundColor: theme.colors.errorBg,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  textSize_sm: {
    fontSize: 10,
  },
  textSize_md: {
    fontSize: theme.fontSize.xs,
  },
  textVariant_primary: {
    color: theme.colors.primary,
  },
  textVariant_secondary: {
    color: theme.colors.textSecondary,
  },
  textVariant_success: {
    color: theme.colors.secondaryDark,
  },
  textVariant_warning: {
    color: '#D97706',
  },
  textVariant_error: {
    color: theme.colors.error,
  },
  textVariant_outline: {
    color: theme.colors.textSecondary,
  },
});

export default Badge;