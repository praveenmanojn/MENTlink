/**
 * LoadingSpinner
 * Paper-themed loading indicator.
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotation]);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
        <Text style={styles.spinnerIcon}>✦</Text>
      </Animated.View>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spinner: {
    width: 44,
    height: 44,
    borderWidth: 2.5,
    borderColor: Colors.borderBlack,
    borderRadius: 22,
    backgroundColor: Colors.stickyYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  spinnerIcon: {
    fontSize: 20,
    color: Colors.inkBlack,
  },
  message: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    marginTop: 12,
  },
});

export default LoadingSpinner;