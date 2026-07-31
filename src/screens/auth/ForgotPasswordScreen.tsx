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
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import { theme } from '../../theme';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'ForgotPassword'>>();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleReset = () => {
    if (!email.trim()) {
      setError('Please enter your university email address.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>🔑</Text>
            </View>

            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your registered university email to receive a password reset link.
            </Text>

            {error ? <Text style={styles.errorMessage}>{error}</Text> : null}

            {submitted ? (
              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Check Your Inbox 📩</Text>
                <Text style={styles.successDesc}>
                  We have sent instructions to <Text style={{ fontWeight: 'bold' }}>{email}</Text>. Please check your spam folder if it doesn't appear in 2 minutes.
                </Text>
                <Button
                  title="Back to Sign In"
                  onPress={() => navigation.navigate('Login')}
                  variant="primary"
                  style={styles.submitBtn}
                />
              </View>
            ) : (
              <>
                <TextInput
                  label="University Email"
                  placeholder="student@university.edu"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Button
                  title="Send Reset Instructions"
                  onPress={handleReset}
                  loading={loading}
                  size="lg"
                  style={styles.submitBtn}
                />
              </>
            )}
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconText: {
    fontSize: 26,
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
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  errorMessage: {
    color: theme.colors.error,
    fontSize: theme.fontSize.xs,
    backgroundColor: theme.colors.errorBg,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  submitBtn: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  successBox: {
    backgroundColor: theme.colors.secondaryBg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  successTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.secondaryDark,
    marginBottom: theme.spacing.xs,
  },
  successDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
});

export default ForgotPasswordScreen;