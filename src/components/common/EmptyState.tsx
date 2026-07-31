/**
 * EmptyState
 * A blank sticky note shown when there's no content.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import PinWidget from './PinWidget';

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nothing here yet',
  subtitle = 'Check back later!',
  icon = '📋',
}) => (
  <View style={styles.wrapper}>
    <View style={styles.card}>
      <View style={styles.pinRow}>
        <PinWidget color={Colors.pinYellow} size={18} />
      </View>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginVertical: 32,
  },
  card: {
    backgroundColor: Colors.stickyYellowLight,
    borderWidth: 2.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 24,
    alignItems: 'center',
    width: 240,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
  pinRow: {
    position: 'absolute',
    top: -9,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
    marginTop: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.inkBlack,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    textAlign: 'center',
  },
});

export default EmptyState;