/**
 * Badge / PaperChip
 * Small paper label chips for tags, status, subjects, etc.
 * Thick border, flat micro-shadow.
 */
import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'dark';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_MAP: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: Colors.paperCream,     text: Colors.inkBlack,    border: Colors.inkBlack },
  success: { bg: Colors.stickyGreen,    text: Colors.inkBlack,    border: Colors.inkBlack },
  warning: { bg: Colors.stickyYellow,   text: Colors.inkBlack,    border: Colors.inkBlack },
  error:   { bg: Colors.stickyRed,      text: Colors.white,       border: Colors.inkBlack },
  info:    { bg: Colors.stickyBlue,     text: Colors.inkBlack,    border: Colors.inkBlack },
  dark:    { bg: Colors.inkBlack,       text: Colors.white,       border: Colors.inkBlack },
};

const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const v = VARIANT_MAP[variant];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    // Micro flat shadow
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  text: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxs,
    letterSpacing: 0.4,
  },
});

export default Badge;