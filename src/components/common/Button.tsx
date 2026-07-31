import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const containerStyles = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    styles[`textSize_${size}`],
    isOutline && styles.textOutline,
    isSecondary && styles.textSecondary,
    isGhost && styles.textGhost,
    disabled && styles.textDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={containerStyles}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isGhost ? theme.colors.primary : theme.colors.surface}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export const PrimaryButton = (props: ButtonProps) => <Button variant="primary" {...props} />;
export const SecondaryButton = (props: ButtonProps) => <Button variant="secondary" {...props} />;

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  size_sm: {
    paddingVertical: theme.spacing.xs + 4,
    paddingHorizontal: theme.spacing.md,
  },
  size_md: {
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.lg,
  },
  size_lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  variant_primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  variant_secondary: {
    backgroundColor: theme.colors.primaryBg,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
  },
  textBase: {
    color: theme.colors.surface,
    fontWeight: theme.fontWeight.semibold,
    textAlign: 'center',
  },
  textSize_sm: {
    fontSize: theme.fontSize.sm,
  },
  textSize_md: {
    fontSize: theme.fontSize.md,
  },
  textSize_lg: {
    fontSize: theme.fontSize.lg,
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  textDisabled: {
    color: theme.colors.muted,
  },
});

export default Button;