/**
 * RoleSelectionScreen — PeerLink
 * Three role cards (Student / Mentor / Admin) as individually pinned sticky notes.
 */
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const ROLES = [
  {
    type: 'student' as const,
    emoji: '🎓',
    title: "I'm a Student",
    badge: 'Most Popular',
    badgeBg: Colors.stickyBlue,
    cardBg: Colors.paperWhite,
    pin: Colors.pinBlue,
    rot: -2,
    bullets: [
      '✓ Unlimited doubt submissions',
      '✓ Match with top peer mentors',
      '✓ Access study notes & session history',
    ],
    btnLabel: 'Continue as Student →',
    btnBg: Colors.stickyBlue,
  },
  {
    type: 'mentor' as const,
    emoji: '👨‍🏫',
    title: "I'm a Peer Mentor",
    badge: 'High Impact',
    badgeBg: Colors.stickyGreen,
    cardBg: Colors.paperCream,
    pin: Colors.pinGreen,
    rot: 1.5,
    bullets: [
      '✓ Guide junior & peer students',
      '✓ Build verified mentor credentials',
      '✓ Flexible session scheduling',
    ],
    btnLabel: 'Continue as Mentor →',
    btnBg: Colors.stickyGreen,
  },
];

export const RoleSelectionScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'RoleSelection'>>();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {/* Header note */}
          <View style={styles.headerCard}>
            <Text style={styles.headline}>Choose Your Journey</Text>
            <Text style={styles.subheadline}>How would you like to join PeerLink?</Text>
          </View>

          {/* Role cards */}
          {ROLES.map((r) => (
            <View key={r.type} style={styles.cardWrapper}>
              <View style={styles.cardPin}><PinWidget color={r.pin} size={22} /></View>
              <View style={[styles.card, { backgroundColor: r.cardBg, transform: [{ rotate: `${r.rot}deg` }] }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.emojiBox}><Text style={styles.emoji}>{r.emoji}</Text></View>
                  <View style={[styles.badge, { backgroundColor: r.badgeBg }]}>
                    <Text style={styles.badgeText}>{r.badge}</Text>
                  </View>
                </View>

                <Text style={styles.roleTitle}>{r.title}</Text>

                <View style={styles.bullets}>
                  {r.bullets.map((b, i) => (
                    <Text key={i} style={styles.bullet}>{b}</Text>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Register', { role: r.type })}
                  style={[styles.roleBtn, { backgroundColor: r.btnBg }]}
                >
                  <Text style={styles.roleBtnText}>{r.btnLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  back: { marginBottom: 12 },
  backText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  headerCard: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 18, marginBottom: 28,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '-0.5deg' }],
  },
  headline: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack, marginBottom: 4 },
  subheadline: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark },

  cardWrapper: { alignItems: 'center', marginBottom: 28 },
  cardPin: { marginBottom: -11, zIndex: 10 },
  card: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 22,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  emojiBox: {
    width: 52, height: 52, backgroundColor: Colors.paperCream,
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  badge: {
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  badgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack },
  roleTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginBottom: 14 },
  bullets: { marginBottom: 20, gap: 6 },
  bullet: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, lineHeight: 22 },

  roleBtn: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  roleBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  footerText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },
  footerLink: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, textDecorationLine: 'underline' },
});

export default RoleSelectionScreen;