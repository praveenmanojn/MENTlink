/**
 * PaperButton
 * Buttons that look like paper labels — thick border, flat shadow, slight rotation, press animation.
 * NOT a pill. NOT material. NOT rounded 20px.
 */
import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { Animations } from '../../theme/animations';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Slight tilt rotation in degrees (default 0) */
  rotation?: number;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; textColor: string; borderColor: string }> = {
  primary: { bg: Colors.inkBlack, textColor: Colors.white, borderColor: Colors.inkBlack },
  secondary: { bg: Colors.stickyGreen, textColor: Colors.inkBlack, borderColor: Colors.inkBlack },
  danger:    { bg: Colors.stickyRed,  textColor: Colors.white,    borderColor: Colors.inkBlack },
  outline:   { bg: Colors.paperWhite, textColor: Colors.inkBlack, borderColor: Colors.inkBlack },
  ghost:     { bg: Colors.transparent, textColor: Colors.inkBlack, borderColor: Colors.transparent },
};

const SIZE_STYLES: Record<ButtonSize, { paddingV: number; paddingH: number; fontSize: number }> = {
  sm: { paddingV: 6,  paddingH: 12, fontSize: FontSize.xs },
  md: { paddingV: 10, paddingH: 18, fontSize: FontSize.sm },
  lg: { paddingV: 14, paddingH: 24, fontSize: FontSize.md },
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  rotation = 0,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const varStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 0.96, duration: Animations.buttonPress, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 2, duration: Animations.buttonPress, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: Animations.buttonPress, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: Animations.buttonPress, useNativeDriver: true }),
    ]).start();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: isDisabled ? Colors.inkFaint : varStyle.bg,
            borderColor: isDisabled ? Colors.inkFaint : varStyle.borderColor,
            paddingVertical: sizeStyle.paddingV,
            paddingHorizontal: sizeStyle.paddingH,
            transform: [{ scale }, { translateY }, { rotate: `${rotation}deg` }],
            opacity: isDisabled ? 0.65 : 1,
          },
          style as ViewStyle,
        ]}
      >
        {/* Flat shadow layer */}
        <View style={[styles.shadowLayer, { borderColor: isDisabled ? Colors.inkFaint : Colors.inkBlack }]} />

        {loading ? (
          <ActivityIndicator color={varStyle.textColor} size="small" />
        ) : (
          <Text style={[styles.label, { color: varStyle.textColor, fontSize: sizeStyle.fontSize }]}>
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2.5,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderWidth: 2.5,
    borderRadius: Radius.sm,
    backgroundColor: Colors.transparent,
    zIndex: -1,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
});

export default Button;