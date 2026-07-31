/**
 * StickyNoteCard (Card)
 * The fundamental building block of the PeerLink UI.
 * Every major section is a sticky note card.
 *
 * Features:
 * - Thick 3px black border
 * - Flat offset shadow (no blur)
 * - Optional rotation
 * - Optional push pin at top center
 * - Press animation: card lifts + rotation reduces
 */
import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { Radius, flatShadow } from '../../theme/decorations';
import { Animations } from '../../theme/animations';
import PinWidget from './PinWidget';

interface CardProps {
  children: React.ReactNode;
  backgroundColor?: string;
  rotation?: number;
  showPin?: boolean;
  pinColor?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Disable press animation (for static display cards) */
  pressable?: boolean;
  padding?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  backgroundColor = Colors.paperWhite,
  rotation = 0,
  showPin = false,
  pinColor = Colors.pinRed,
  style,
  onPress,
  pressable = false,
  padding = 16,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(rotation)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: Animations.buttonPress,
        useNativeDriver: true,
      }),
      Animated.timing(rot, {
        toValue: 0,
        duration: Animations.straighten,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: Animations.cardLift,
        useNativeDriver: true,
      }),
      Animated.timing(rot, {
        toValue: rotation,
        duration: Animations.straighten,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolate = rot.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor,
          padding,
          transform: [
            { rotate: rotateInterpolate },
            { scale },
          ],
        },
        style,
      ]}
    >
      {showPin && (
        <View style={styles.pinContainer}>
          <PinWidget color={pinColor} size={20} />
        </View>
      )}
      {children}
    </Animated.View>
  );

  if (!pressable && !onPress) return cardContent;

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {cardContent}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    ...flatShadow(4, 4),
  },
  pinContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});

export default Card;