/**
 * NotebookBackground
 * Renders the warm-beige grid-lined notebook background.
 * Wrap every screen with this component.
 */
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../theme/colors';

const { width: W, height: H } = Dimensions.get('window');
const GRID_SIZE = 28;

interface NotebookBackgroundProps {
  children: React.ReactNode;
}

const NotebookBackground: React.FC<NotebookBackgroundProps> = ({ children }) => {
  // Build horizontal grid lines
  const horizontalLines: number[] = [];
  for (let y = 0; y < H + 100; y += GRID_SIZE) horizontalLines.push(y);

  // Build vertical grid lines
  const verticalLines: number[] = [];
  for (let x = 0; x < W + 100; x += GRID_SIZE) verticalLines.push(x);

  return (
    <View style={styles.container}>
      {/* Grid layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {horizontalLines.map((y) => (
          <View key={`h-${y}`} style={[styles.hLine, { top: y }]} />
        ))}
        {verticalLines.map((x) => (
          <View key={`v-${x}`} style={[styles.vLine, { left: x }]} />
        ))}
      </View>

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.notebookBg,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gridLine,
    opacity: 0.5,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: Colors.gridLine,
    opacity: 0.35,
  },
});

export default NotebookBackground;
