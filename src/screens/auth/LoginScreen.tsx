/**
 * LoginScreen — PeerLink
 * Login form on a large white sticky note card.
 * Quick-fill chips as paper labels. Notebook background.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackNavigationProp, AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { DUMMY_USERS, findDummyUser } from '../../utils/constants';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

export const LoginScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'Login'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const login = useAuthStore((state) => state.login);
  const preselectedRole = route.params?.role || 'student';

  const handleQuickFill = (type: 'teacher' | 'student' | 'admin') => {
    const user = DUMMY_USERS.find((u) => u.username === type);
    if (user) { setUsernameOrEmail(user.username); setPassword(user.password); setError(''); }
  };

  const handleLogin = () => {
    if (!usernameOrEmail.trim() || !password.trim()) { setError('Please enter both username and password.'); return; }
    setError(''); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const matchedUser = findDummyUser(usernameOrEmail, password);
      if (matchedUser) {
        login({ id: matchedUser.id, email: matchedUser.email, role: matchedUser.role });
      } else {
        setError('Invalid credentials.\nTry: teacher/123t  •  student/123s  •  admin/123a');
      }
    }, 400);
  };

  const QUICK_FILLS = [
    { type: 'teacher' as const, label: '👨‍🏫 Mentor (123t)', bg: Colors.stickyGreen },
    { type: 'student' as const, label: '🎓 Student (123s)', bg: Colors.stickyBlue },
    { type: 'admin'   as const, label: '⚙ Admin (123a)',   bg: Colors.stickyYellow },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* Back */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Main card */}
            <View style={styles.cardWrapper}>
              <View style={styles.pin}><PinWidget color={Colors.pinBlue} size={22} /></View>
              <View style={styles.card}>
                <Text style={styles.logo}>PeerLink</Text>
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Sign in to continue your learning journey.</Text>

                {/* Quick fill */}
                <View style={styles.quickBox}>
                  <Text style={styles.quickLabel}>⚡ Quick Demo Login:</Text>
                  <View style={styles.quickRow}>
                    {QUICK_FILLS.map((q) => (
                      <TouchableOpacity
                        key={q.type}
                        onPress={() => handleQuickFill(q.type)}
                        style={[styles.quickChip, { backgroundColor: q.bg }]}
                      >
                        <Text style={styles.quickChipText}>{q.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TextInput
                  label="Username or Email"
                  placeholder="e.g. student, teacher, admin"
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  autoCapitalize="none"
                />
                <TextInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  rightIcon={<Text style={styles.eyeIcon}>{showPass ? '◉' : '○'}</Text>}
                  onRightIconPress={() => setShowPass(!showPass)}
                />

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button title="Sign In" onPress={handleLogin} loading={loading} size="lg" style={styles.btn} />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register', { role: preselectedRole })}>
                    <Text style={styles.footerLink}>Sign Up</Text>
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
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 24,
    width: '100%',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  logo: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xxl,
    color: Colors.inkBlack,
    marginBottom: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    color: Colors.inkBlack,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    marginBottom: 18,
  },
  quickBox: {
    backgroundColor: Colors.paperCream,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 16,
  },
  quickLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
    marginBottom: 8,
  },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  quickChip: {
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 5,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  quickChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack },
  error: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.statusError,
    backgroundColor: Colors.statusErrorBg,
    borderWidth: 1.5,
    borderColor: Colors.statusError,
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 14,
    lineHeight: 18,
  },
  eyeIcon: { fontSize: 16, color: Colors.inkMedium },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 18 },
  forgotText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.pinBlue },
  btn: { width: '100%' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },
  footerLink: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textDecorationLine: 'underline' },
});

export default LoginScreen;