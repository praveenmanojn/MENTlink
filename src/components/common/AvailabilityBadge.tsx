/**
 * AvailabilityBadge
 * Green/red indicator showing if a mentor is available.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface AvailabilityBadgeProps {
  available: boolean;
  label?: string;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  available,
  label,
}) => (
  <View style={[styles.container, { backgroundColor: available ? Colors.stickyGreen : Colors.stickyRed }]}>
    <View style={[styles.dot, { backgroundColor: available ? Colors.statusSolved : Colors.statusError }]} />
    <Text style={styles.text}>{label ?? (available ? 'Online' : 'Offline')}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: Colors.inkBlack,
  },
  text: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxs,
    color: Colors.inkBlack,
  },
});

export default AvailabilityBadge;
