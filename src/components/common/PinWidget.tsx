/**
 * PinWidget
 * Decorative push-pin placed at the top-center of sticky note cards.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface PinWidgetProps {
  color?: string;
  size?: number;
}

const PinWidget: React.FC<PinWidgetProps> = ({
  color = Colors.pinRed,
  size = 18,
}) => {
  const innerSize = Math.round(size * 0.45);
  return (
    <View style={[styles.pin, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      {/* Highlight glint */}
      <View
        style={[
          styles.glint,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            top: Math.round(size * 0.12),
            left: Math.round(size * 0.12),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pin: {
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    // Slight shadow to look 3D
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 2,
  },
  glint: {
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});

export default PinWidget;
