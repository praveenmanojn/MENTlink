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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { AuthStackNavigationProp, AuthStackParamList } from '../../types/navigation';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { DUMMY_USERS, findDummyUser } from '../../utils/constants';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

export const LoginScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'Login'>>();
  const route = useRoute<RouteProp<AuthStackParamList, 'Login'>>();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const preselectedRole = route.params?.role || 'student';

  const handleQuickFill = (type: 'teacher' | 'student' | 'admin') => {
    const user = DUMMY_USERS.find((u) => u.username === type);
    if (user) {
      setUsernameOrEmail(user.username);
      setPassword(user.password);
      setError('');
    }
  };

  const handleLogin = () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please enter both username/email and password.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const matchedUser = findDummyUser(usernameOrEmail, password);

      if (matchedUser) {
        login({
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
        });
      } else {
        setError(
          `Invalid credentials. Try dummy accounts:\n• teacher (pass: 123t)\n• student (pass: 123s)\n• admin (pass: 123a)`
        );
      }
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header Back & Logo */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <View style={styles.logoPill}>
              <Text style={styles.logoText}>MENT<Text style={styles.logoHighlight}>link</Text></Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in with your credentials to access MENTlink.</Text>

            {/* Demo Quick-Fill Section */}
            <View style={styles.quickFillContainer}>
              <Text style={styles.quickFillLabel}>⚡ Quick Fill Demo Logins:</Text>
              <View style={styles.quickFillChips}>
                <TouchableOpacity
                  onPress={() => handleQuickFill('teacher')}
                  style={[styles.chip, styles.teacherChip]}
                >
                  <Text style={styles.chipText}>👨‍🏫 Teacher (123t)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleQuickFill('student')}
                  style={[styles.chip, styles.studentChip]}
                >
                  <Text style={styles.chipText}>🎓 Student (123s)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleQuickFill('admin')}
                  style={[styles.chip, styles.adminChip]}
                >
                  <Text style={styles.chipText}>⚙️ Admin (123a)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            <TextInput
              label="Username or Email"
              placeholder="e.g. teacher, student, or admin"
              value={usernameOrEmail}
              onChangeText={setUsernameOrEmail}
              autoCapitalize="none"
            />

            <TextInput
              label="Password"
              placeholder="Enter password (e.g. 123t, 123s, 123a)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.submitBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register', { role: preselectedRole })}>
                <Text style={styles.signUpText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  logoPill: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoText: {
    fontSize: 16,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  logoHighlight: {
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  quickFillContainer: {
    backgroundColor: theme.colors.surfaceSecondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickFillLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  quickFillChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  teacherChip: {
    backgroundColor: theme.colors.secondaryBg,
    borderColor: theme.colors.secondary,
  },
  studentChip: {
    backgroundColor: theme.colors.primaryBg,
    borderColor: theme.colors.primary,
  },
  adminChip: {
    backgroundColor: '#FEF3C7',
    borderColor: theme.colors.accent,
  },
  chipText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  errorMessage: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    backgroundColor: theme.colors.errorBg,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    lineHeight: 18,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  submitBtn: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  signUpText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});

export default LoginScreen;