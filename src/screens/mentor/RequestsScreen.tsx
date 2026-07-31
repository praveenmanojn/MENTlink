import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RequestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Requests</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default RequestsScreen;