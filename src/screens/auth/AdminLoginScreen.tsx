/**
 * AdminLoginScreen — PeerLink
 * Dedicated Administrator Login Screen.
 * Pre-filled / Quick Fill with username: admin, pass: admin.
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
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase/client';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

export const AdminLoginScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'AdminLogin'>>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleAdminLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter both admin username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const adminEmail = username.trim() === 'admin' ? 'admin@peerlink.dev' : username.trim();

      if (supabase) {
        // Attempt Supabase login
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        if (!signInError && signInData?.session?.user) {
          const userId = signInData.session.user.id;

          // Upsert admin role in profiles table
          await supabase.from('profiles').upsert({
            id: userId,
            email: adminEmail,
            name: 'System Administrator',
            role: 'admin',
            availability: true,
            is_verified: true,
          });

          await useAuthStore.getState().setSession(signInData.session);
          return;
        }
      }

      // Fallback Admin Authentication for username: admin, pass: admin (or 123a)
      if ((username.trim() === 'admin' || username.trim() === 'admin@peerlink.dev') && (password === 'admin' || password === '123a')) {
        const mockAdminSession: any = {
          access_token: 'mock-admin-token',
          token_type: 'bearer',
          user: {
            id: 'admin-001-uuid',
            email: 'admin@peerlink.dev',
            user_metadata: {
              name: 'System Administrator',
              role: 'admin',
            },
          },
        };

        // Save admin role in authStore
        useAuthStore.setState({
          user: mockAdminSession.user,
          session: mockAdminSession,
          role: 'admin',
          isAuthenticated: true,
        });

        if (supabase) {
          try {
            await supabase.from('profiles').upsert({
              id: 'admin-001-uuid',
              email: 'admin@peerlink.dev',
              name: 'System Administrator',
              role: 'admin',
              availability: true,
              is_verified: true,
            });
          } catch (e) {}
        }
      } else {
        setError('Invalid admin credentials. Use username: admin & pass: admin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during admin authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header / Back */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backText}>← Return to General Login</Text>
            </TouchableOpacity>

            {/* Title Block */}
            <View style={styles.titleBlock}>
              <Text style={styles.appTitle}>MENTlink Admin Portal</Text>
              <Text style={styles.appSubtitle}>System Administration & Control Center</Text>
            </View>

            {/* Main Sticky Card */}
            <View style={styles.cardWrapper}>
              <View style={styles.pinContainer}>
                <PinWidget color={Colors.pinRed} size={22} />
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitle}>🛡️ Administrator Login</Text>
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminBadgeText}>RESTRICTED</Text>
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                  </View>
                ) : null}

                <TextInput
                  label="Admin Username / Email"
                  placeholder="admin"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  containerStyle={styles.inputSpacing}
                />

                {/* Password Input */}
                <View style={styles.inputSpacing}>
                  <TextInput
                    label="Admin Password"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.showPassToggle}
                    onPress={() => setShowPass(!showPass)}
                  >
                    <Text style={styles.showPassText}>{showPass ? 'HIDE' : 'SHOW'}</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Credentials Info Box */}
                <View style={styles.credentialsNotice}>
                  <Text style={styles.noticeTitle}>Default System Admin Credentials:</Text>
                  <Text style={styles.noticeText}>Username: <Text style={styles.boldText}>admin</Text> | Password: <Text style={styles.boldText}>admin</Text></Text>
                </View>

                {/* Login Button */}
                <Button
                  title={loading ? 'Authenticating Admin...' : 'Login to Admin Portal →'}
                  onPress={handleAdminLogin}
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  style={styles.loginBtn}
                />

                {/* Switch back link */}
                <TouchableOpacity
                  style={styles.switchLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.switchLinkText}>Log in as Student or Mentor instead</Text>
                </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.xxl,
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  appSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    marginTop: 4,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  pinContainer: {
    zIndex: 10,
    marginBottom: -10,
  },
  card: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 20,
    width: '100%',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    transform: [{ rotate: '-0.4deg' }],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.md,
    color: Colors.inkBlack,
  },
  adminBadge: {
    backgroundColor: Colors.stickyRed,
    borderWidth: 1.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxs,
    color: Colors.white,
  },
  errorBox: {
    backgroundColor: Colors.stickyRedLight,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
  },
  inputSpacing: {
    marginBottom: 14,
    position: 'relative',
  },
  showPassToggle: {
    position: 'absolute',
    right: 12,
    top: 36,
  },
  showPassText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkMedium,
  },
  credentialsNotice: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    padding: 10,
    marginBottom: 16,
  },
  noticeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
  },
  noticeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.inkDark,
    marginTop: 2,
  },
  boldText: {
    fontFamily: FontFamily.extraBold,
    color: Colors.inkBlack,
  },
  loginBtn: {
    width: '100%',
  },
  switchLink: {
    marginTop: 14,
    alignItems: 'center',
  },
  switchLinkText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkMedium,
    textDecorationLine: 'underline',
  },
});

export default AdminLoginScreen;
