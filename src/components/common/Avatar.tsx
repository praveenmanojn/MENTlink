/**
 * Avatar
 * Circular avatar with thick black border — paper aesthetic.
 */
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  borderColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  name = '?',
  uri,
  size = 48,
  borderColor = Colors.borderBlack,
}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const bgColors = [
    Colors.stickyRed, Colors.stickyYellow, Colors.stickyBlue, Colors.stickyGreen,
  ];
  // Deterministic color based on name
  const bgColor = bgColors[name.charCodeAt(0) % bgColors.length];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          backgroundColor: bgColor,
        },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
        />
      ) : (
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  initials: {
    fontFamily: FontFamily.bold,
    color: Colors.inkBlack,
    lineHeight: undefined,
  },
});

export default Avatar;