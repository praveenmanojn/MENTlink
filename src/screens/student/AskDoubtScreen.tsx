import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AskDoubtScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Ask Doubt</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AskDoubtScreen;