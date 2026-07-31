/**
 * RatingBadge
 * Star rating displayed as a paper chip.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

interface RatingBadgeProps {
  rating: number;
  count?: number;
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ rating, count }) => (
  <View style={styles.container}>
    <Text style={styles.star}>★</Text>
    <Text style={styles.rating}>{rating.toFixed(1)}</Text>
    {count !== undefined && <Text style={styles.count}> ({count})</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.stickyYellow,
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
  star: {
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
    marginRight: 3,
  },
  rating: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
  },
  count: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.inkDark,
  },
});

export default RatingBadge;
