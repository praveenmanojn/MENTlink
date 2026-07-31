/**
 * HomeScreen — Student — PeerLink
 * Bulletin board layout: greeting card + 4 action sticky notes.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const ACTION_NOTES = [
  {
    id: '1', title: 'Ask a Doubt',
    desc: 'Post your question and get help from nearby mentors',
    icon: '?', bg: Colors.stickyRed, textColor: Colors.white, pin: Colors.pinBlack, rot: -1.5,
  },
  {
    id: '2', title: 'My Chats',
    desc: 'Continue your conversations',
    icon: '✉', bg: Colors.stickyYellow, textColor: Colors.inkBlack, pin: Colors.pinBlue, rot: 1.2,
  },
  {
    id: '3', title: 'My Sessions',
    desc: 'Join or schedule audio sessions',
    icon: '♪', bg: Colors.stickyYellow, textColor: Colors.inkBlack, pin: Colors.pinRed, rot: -0.8,
  },
  {
    id: '4', title: 'Nearby Mentors',
    desc: 'View mentors available near you',
    icon: '⊞', bg: Colors.stickyGreen, textColor: Colors.inkBlack, pin: Colors.pinYellow, rot: 1.8,
  },
];

const HomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const name = user?.email?.split('@')[0] ?? 'Praveen';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const [countdown, setCountdown] = useState({ m: 3, s: 58 });
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { m: prev.m - 1, s: 59 };
        clearInterval(t); return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Top bar ─────────────────────────────────── */}
          <View style={styles.topBar}>
            <View style={styles.hamburger}>
              <View style={styles.hLine} /><View style={styles.hLine} /><View style={styles.hLine} />
            </View>
            <View style={styles.bellWrapper}>
              <Text style={styles.bell}>◆</Text>
              <View style={styles.notifDot} />
            </View>
          </View>

          {/* ── Greeting ────────────────────────────────── */}
          <View style={styles.greetCard}>
            <Text style={styles.greetHello}>Hello, {displayName} 👋</Text>
            <Text style={styles.greetSub}>What would you like to learn today?</Text>
          </View>

          {/* ── Action notes grid ────────────────────────── */}
          <View style={styles.notesGrid}>
            {/* Large note: Ask a Doubt */}
            <View style={styles.noteWrapper}>
              <View style={styles.notePin}><PinWidget color={ACTION_NOTES[0].pin} size={18} /></View>
              <TouchableOpacity
                style={[styles.noteLarge, { backgroundColor: ACTION_NOTES[0].bg, transform: [{ rotate: `${ACTION_NOTES[0].rot}deg` }] }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.noteIcon, { color: Colors.white }]}>{ACTION_NOTES[0].icon}</Text>
                <Text style={[styles.noteTitle, { color: Colors.white }]}>{ACTION_NOTES[0].title}</Text>
                <Text style={[styles.noteDesc, { color: 'rgba(255,255,255,0.85)' }]}>{ACTION_NOTES[0].desc}</Text>
                <Text style={[styles.noteArrow, { color: Colors.white }]}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Two smaller notes side by side */}
            <View style={styles.smallRow}>
              {[ACTION_NOTES[1], ACTION_NOTES[2]].map((n) => (
                <View key={n.id} style={styles.smallWrapper}>
                  <View style={styles.notePin}><PinWidget color={n.pin} size={14} /></View>
                  <TouchableOpacity
                    style={[styles.noteSmall, { backgroundColor: n.bg, transform: [{ rotate: `${n.rot}deg` }] }]}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.noteIcon}>{n.icon}</Text>
                    <Text style={styles.noteTitle}>{n.title}</Text>
                    <Text style={styles.noteDesc}>{n.desc}</Text>
                    <Text style={styles.noteArrow}>→</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Nearby Mentors — full width */}
            <View style={styles.noteWrapper}>
              <View style={styles.notePin}><PinWidget color={ACTION_NOTES[3].pin} size={18} /></View>
              <TouchableOpacity
                style={[styles.noteMedium, { backgroundColor: ACTION_NOTES[3].bg, transform: [{ rotate: `${ACTION_NOTES[3].rot}deg` }] }]}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteTitle}>{ACTION_NOTES[3].title}</Text>
                    <Text style={styles.noteDesc}>{ACTION_NOTES[3].desc}</Text>
                  </View>
                  <Text style={[styles.noteIcon, { fontSize: 36 }]}>{ACTION_NOTES[3].icon}</Text>
                </View>
                <Text style={styles.noteArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Audio Session teaser ─────────────────────── */}
          <View style={styles.sessionWrapper}>
            <View style={styles.notePin}><PinWidget color={Colors.pinRed} size={18} /></View>
            <View style={styles.sessionCard}>
              <Text style={styles.sessionLabel}>Upcoming Session</Text>
              <Text style={styles.sessionTimer}>{pad(countdown.m)}:{pad(countdown.s)}</Text>
              <Text style={styles.sessionMeta}>Rahul • Mathematics</Text>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hamburger: { gap: 5 },
  hLine: { width: 26, height: 3, backgroundColor: Colors.inkBlack, borderRadius: 2 },
  bellWrapper: { position: 'relative' },
  bell: { fontSize: 22, color: Colors.inkBlack },
  notifDot: { position: 'absolute', top: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.stickyRed, borderWidth: 1.5, borderColor: Colors.borderBlack },

  greetCard: { marginBottom: 20 },
  greetHello: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  greetSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginTop: 2 },

  notesGrid: { gap: 16, marginBottom: 20 },

  noteWrapper: { alignItems: 'center' },
  notePin: { marginBottom: -9, zIndex: 10 },
  noteLarge: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20, shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  noteMedium: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 18, shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },

  smallRow: { flexDirection: 'row', gap: 14 },
  smallWrapper: { flex: 1, alignItems: 'center' },
  noteSmall: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },

  noteIcon: { fontSize: 28, marginBottom: 8, color: Colors.inkBlack },
  noteTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 4 },
  noteDesc: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, lineHeight: 17, marginBottom: 10 },
  noteArrow: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },

  // Session card
  sessionWrapper: { alignItems: 'center', marginBottom: 12 },
  sessionCard: {
    width: '100%', backgroundColor: Colors.stickyYellow,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  sessionLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.stickyRed, marginBottom: 4 },
  sessionTimer: { fontFamily: FontFamily.extraBold, fontSize: FontSize.hero, color: Colors.inkBlack, lineHeight: 68 },
  sessionMeta: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },
});

export default HomeScreen;