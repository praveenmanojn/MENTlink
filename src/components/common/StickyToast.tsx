/**
 * StickyToast — PeerLink
 * Floating paper sticky note notification banner.
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import PinWidget from './PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface StickyToastProps {
  visible: boolean;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onHide?: () => void;
  durationMs?: number;
}

const StickyToast: React.FC<StickyToastProps> = ({
  visible,
  message,
  type = 'info',
  onHide,
  durationMs = 3000,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, durationMs);

      return () => clearTimeout(timer);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  let bgColor = Colors.stickyBlue;
  let pinColor = Colors.pinBlue;
  let icon = 'ℹ️';

  if (type === 'success') {
    bgColor = Colors.stickyGreen;
    pinColor = Colors.pinGreen;
    icon = '✅';
  } else if (type === 'warning') {
    bgColor = Colors.stickyYellow;
    pinColor = Colors.pinYellow;
    icon = '⚠️';
  } else if (type === 'error') {
    bgColor = Colors.stickyRed;
    pinColor = Colors.pinRed;
    icon = '🚫';
  }

  return (
    <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
      <View style={styles.pinContainer}>
        <PinWidget color={pinColor} size={16} />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[styles.toastCard, { backgroundColor: bgColor }]}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  pinContainer: {
    marginBottom: -8,
    zIndex: 10000,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 2.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    width: '100%',
    transform: [{ rotate: '-0.5deg' }],
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
  },
  closeIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default StickyToast;
