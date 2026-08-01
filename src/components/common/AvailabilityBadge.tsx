/**
 * AvailabilityBadge
 * Green/yellow/red indicator showing if a mentor is Available, Busy, or Offline.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface AvailabilityBadgeProps {
  available?: boolean;
  status?: string; // 'available' | 'busy' | 'offline'
  label?: string;
}

const AvailabilityBadge: React.FC<AvailabilityBadgeProps> = ({
  available = true,
  status,
  label,
}) => {
  const normStatus = (status || (available ? 'available' : 'offline')).toLowerCase();

  let bgColor = Colors.stickyGreen;
  let dotColor = Colors.statusSolved;
  let displayText = label || 'Available';

  if (normStatus === 'busy') {
    bgColor = Colors.stickyYellow;
    dotColor = '#E6A100';
    displayText = label || 'Busy';
  } else if (normStatus === 'offline') {
    bgColor = Colors.stickyRed;
    dotColor = Colors.statusError;
    displayText = label || 'Offline';
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={styles.text}>{displayText}</Text>
    </View>
  );
};

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
