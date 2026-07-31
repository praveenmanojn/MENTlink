/**
 * ForgotPasswordScreen — PeerLink
 * Simple paper note with email reset form.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'ForgotPassword'>>();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinYellow} size={22} /></View>
            <View style={styles.card}>
              <Text style={styles.icon}>✉</Text>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your password.
              </Text>

              {sent ? (
                <View style={styles.successBox}>
                  <Text style={styles.successText}>
                    ✓ Reset link sent! Check your inbox.
                  </Text>
                </View>
              ) : (
                <>
                  <TextInput
                    label="University Email"
                    placeholder="jane@university.edu"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Button title="Send Reset Link" onPress={handleSend} loading={loading} size="lg" style={styles.btn} />
                </>
              )}

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footer}>
                <Text style={styles.footerText}>← Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
    backgroundColor: Colors.stickyYellowLight,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 24, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    transform: [{ rotate: '-1deg' }],
  },
  icon: { fontSize: 42, textAlign: 'center', marginBottom: 10 },
  title: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  btn: { width: '100%' },
  successBox: {
    backgroundColor: Colors.stickyGreen,
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    padding: 14, marginTop: 8,
  },
  successText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, textAlign: 'center' },
  footer: { marginTop: 22, alignItems: 'center' },
  footerText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textDecorationLine: 'underline' },
});

export default ForgotPasswordScreen;