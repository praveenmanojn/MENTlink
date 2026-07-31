import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RoleSelectionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Role</Text>
      <Button title="Student" />
      <Button title="Mentor" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});

export default RoleSelectionScreen;