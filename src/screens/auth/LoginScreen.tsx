import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/authStore';

const LoginScreen = () => {
  const login = useAuthStore((state) => state.login);

  const handleLogin = (email: string, password: string) => {
    // placeholder login
    login({ id: '1', email, role: 'student' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value="test@example.com"
        onChangeText={(text) => {}}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value="********"
        onChangeText={(text) => {}}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={() => handleLogin('test@example.com', 'password')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { marginBottom: 12, padding: 12 },
});

export default LoginScreen;