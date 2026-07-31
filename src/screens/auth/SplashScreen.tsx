/**
 * SplashScreen — PeerLink
 * A bulletin board with PEERLINK branding on a large pinned sticky note.
 * Feature cards as individually colored sticky notes with push pins.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { AppInfo } from '../../theme/constants';

const FEATURES = [
  { icon: '?', label: 'Ask Doubt', desc: 'Post your academic questions', bg: Colors.stickyRed, pin: Colors.pinBlack, rot: -2 },
  { icon: '✉', label: 'Chat',      desc: 'Get instant help via chat',     bg: Colors.stickyYellow, pin: Colors.pinBlue, rot: 1.5 },
  { icon: '♪', label: 'Audio Session', desc: 'Schedule & join live audio', bg: Colors.stickyBlue, pin: Colors.pinRed, rot: -1.2 },
  { icon: '★', label: 'Rate & Grow', desc: 'Rate mentors and build trust',  bg: Colors.stickyGreen, pin: Colors.pinYellow, rot: 2 },
];

const SplashScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'Splash'>>();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── Hero Card ─────────────────────────────────────── */}
          <View style={styles.heroWrapper}>
            <View style={styles.heroPin}>
              <PinWidget color={Colors.pinBlack} size={24} />
            </View>
            <View style={styles.heroCard}>
              {/* Corner doodle */}
              <Text style={styles.doodle}>✦</Text>

              <Text style={styles.appName}>{AppInfo.name}</Text>
              <View style={styles.underline} />
              <Text style={styles.tagline}>{AppInfo.tagline.split('.').map(t => t.trim()).join('\n')}</Text>
              <Text style={styles.desc}>{AppInfo.description}</Text>
              <Text style={styles.doodleCorner}>✎</Text>
            </View>
          </View>

          {/* ── "Welcome to PeerLink!" card ───────────────────── */}
          <View style={[styles.welcomeCard, { transform: [{ rotate: '-1deg' }] }]}>
            <View style={styles.welcomePin}>
              <PinWidget color={Colors.pinYellow} size={20} />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to PeerLink!</Text>
            <Text style={styles.welcomeBody}>
              Get help from verified peer mentors near you. Ask doubts, chat, schedule sessions and grow together.
            </Text>
          </View>

          {/* ── Feature sticky notes grid ─────────────────────── */}
          <View style={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureCard, { backgroundColor: f.bg, transform: [{ rotate: `${f.rot}deg` }] }]}>
                <View style={styles.featurePin}>
                  <PinWidget color={f.pin} size={16} />
                </View>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>

          {/* ── Stats bar ─────────────────────────────────────── */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>1,200+</Text>
              <Text style={styles.statLbl}>Doubts Solved</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>4.9★</Text>
              <Text style={styles.statLbl}>Avg Rating</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>&lt;5 min</Text>
              <Text style={styles.statLbl}>Match Time</Text>
            </View>
          </View>

          {/* ── CTA Buttons ───────────────────────────────────── */}
          <View style={styles.cta}>
            <Button
              title="Get Started — It's Free →"
              onPress={() => navigation.navigate('RoleSelection')}
              variant="primary"
              size="lg"
              style={styles.ctaBtn}
            />
            <Button
              title="I already have an account"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              size="md"
              style={[styles.ctaBtn, { marginTop: 12 }]}
            />
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.notebookBg },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  // Hero card
  heroWrapper: { alignItems: 'center', marginBottom: 16 },
  heroPin: { marginBottom: -10, zIndex: 10 },
  heroCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 28,
    width: '100%',
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    transform: [{ rotate: '-1deg' }],
  },
  doodle: { position: 'absolute', top: 10, right: 14, fontSize: 22, color: Colors.inkFaint },
  doodleCorner: { position: 'absolute', bottom: 10, right: 16, fontSize: 28, color: Colors.inkFaint },
  appName: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.display,
    color: Colors.inkBlack,
    letterSpacing: -1,
  },
  underline: {
    height: 4,
    backgroundColor: Colors.stickyRed,
    width: 80,
    marginVertical: 8,
    borderRadius: 2,
  },
  tagline: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
    color: Colors.inkBlack,
    lineHeight: 32,
    marginBottom: 10,
  },
  desc: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    lineHeight: 22,
    maxWidth: '85%',
  },

  // Welcome card
  welcomeCard: {
    backgroundColor: Colors.stickyGreenLight,
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 18,
    marginBottom: 20,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  welcomePin: { position: 'absolute', top: -10, left: 0, right: 0, alignItems: 'center' },
  welcomeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.inkBlack,
    marginBottom: 6,
    marginTop: 6,
  },
  welcomeBody: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkDark,
    lineHeight: 20,
  },

  // Feature grid
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  featureCard: {
    width: '47%',
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 16,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  featurePin: { position: 'absolute', top: -8, left: 0, right: 0, alignItems: 'center' },
  featureIcon: { fontSize: 28, marginTop: 6, marginBottom: 6, color: Colors.inkBlack },
  featureLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
    marginBottom: 2,
  },
  featureDesc: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xxs,
    color: Colors.inkDark,
    lineHeight: 16,
  },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.paperCream,
    borderWidth: 3,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 24,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  statLbl: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkMedium, marginTop: 2 },
  statDiv: { width: 2, height: 32, backgroundColor: Colors.borderBlack },

  // CTA
  cta: { marginBottom: 8 },
  ctaBtn: { width: '100%' },
});

export default SplashScreen;