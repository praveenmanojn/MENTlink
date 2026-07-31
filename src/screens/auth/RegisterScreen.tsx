/**
 * RegisterScreen — PeerLink
 * Registration form on a sticky note. Role selector as two paper tabs.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackNavigationProp, AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

export const RegisterScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'Register'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Register'>>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'mentor'>(route.params?.role || 'student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) { setError('Please fill in all required fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({ id: `user_${Date.now()}`, email: email.trim(), role });
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.cardWrapper}>
              <View style={styles.pin}><PinWidget color={Colors.pinGreen} size={22} /></View>
              <View style={styles.card}>
                <Text style={styles.logo}>PeerLink</Text>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join the peer learning community today.</Text>

                {/* Role selector */}
                <Text style={styles.roleLabel}>I am joining as a:</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    onPress={() => setRole('student')}
                    style={[styles.roleTab, role === 'student' && styles.roleTabActiveBlue]}
                  >
                    <Text style={styles.roleTabText}>🎓 Student</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('mentor')}
                    style={[styles.roleTab, role === 'mentor' && styles.roleTabActiveGreen]}
                  >
                    <Text style={styles.roleTabText}>👨‍🏫 Peer Mentor</Text>
                  </TouchableOpacity>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput label="Full Name" placeholder="Jane Doe" value={name} onChangeText={setName} />
                <TextInput label="University Email" placeholder="jane@university.edu" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                <TextInput label="Password" placeholder="Create a strong password" value={password} onChangeText={setPassword} secureTextEntry />
                <TextInput label="Confirm Password" placeholder="Re-enter password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

                <Button title="Create Account" onPress={handleRegister} loading={loading} size="lg" style={styles.btn} />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login', { role })}>
                    <Text style={styles.footerLink}>Log In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  back: { marginBottom: 16 },
  backText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  cardWrapper: { alignItems: 'center' },
  pin: { marginBottom: -11, zIndex: 10 },
  card: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 24, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  logo: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack, marginBottom: 4 },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkBlack, marginBottom: 2 },
  subtitle: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 18 },

  roleLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  roleTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  roleTabActiveBlue: { backgroundColor: Colors.stickyBlue },
  roleTabActiveGreen: { backgroundColor: Colors.stickyGreen },
  roleTabText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  error: {
    fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.statusError,
    backgroundColor: Colors.statusErrorBg, borderWidth: 1.5, borderColor: Colors.statusError,
    borderRadius: Radius.sm, padding: 10, marginBottom: 14,
  },
  btn: { width: '100%', marginTop: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },
  footerLink: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textDecorationLine: 'underline' },
});

export default RegisterScreen;