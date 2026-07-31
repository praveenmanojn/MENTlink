import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MentorChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Mentor Chat</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MentorChatScreen;