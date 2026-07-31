/**
 * AudioSessionScreen — Student — PeerLink
 * Countdown timer on a large yellow sticky note. Join/Cancel paper buttons.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Button from '../../components/common/Button';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const AudioSessionScreen = () => {
  const [seconds, setSeconds] = useState(238); // 3:58

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Back */}
          <TouchableOpacity style={styles.back}><Text style={styles.backText}>←</Text></TouchableOpacity>

          <Text style={styles.pageTitle}>Audio Session</Text>
          <Text style={[styles.pageSub, { color: Colors.stickyRed }]}>Scheduled by Rahul</Text>

          {/* Countdown card */}
          <View style={styles.countdownWrapper}>
            <View style={styles.countdownPin}><PinWidget color={Colors.pinRed} size={22} /></View>
            <View style={styles.countdownCard}>
              <Text style={styles.startsIn}>Session starts in</Text>
              <Text style={styles.timer}>{pad(mins)}:{pad(secs)}</Text>

              {/* Session info */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>⊟</Text>
                  <Text style={styles.infoText}>Today, 4:30 PM</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>◷</Text>
                  <Text style={styles.infoText}>10 Minutes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Join button */}
          <View style={styles.joinWrapper}>
            <View style={styles.joinPin}><PinWidget color={Colors.pinBlue} size={18} /></View>
            <View style={styles.joinCard}>
              <Button
                title="♪  Join Session"
                onPress={() => {}}
                variant="secondary"
                size="lg"
                style={styles.joinBtn}
              />
            </View>
          </View>

          {/* Cancel */}
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel Session</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  back: { marginBottom: 12 },
  backText: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkBlack },
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, marginBottom: 28 },

  countdownWrapper: { alignItems: 'center', marginBottom: 24 },
  countdownPin: { marginBottom: -11, zIndex: 10 },
  countdownCard: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 28, width: '100%', alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    transform: [{ rotate: '-0.5deg' }],
  },
  startsIn: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkDark, marginBottom: 8 },
  timer: { fontFamily: FontFamily.extraBold, fontSize: FontSize.hero, color: Colors.inkBlack, lineHeight: 70, marginBottom: 20 },

  infoCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    padding: 14, width: '100%', gap: 8,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoIcon: { fontSize: 18, color: Colors.inkBlack },
  infoText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark },

  joinWrapper: { alignItems: 'center', marginBottom: 16 },
  joinPin: { marginBottom: -9, zIndex: 10 },
  joinCard: {
    backgroundColor: Colors.stickyBlue,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 16, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  joinBtn: { width: '100%' },

  cancelBtn: { alignItems: 'center', padding: 16 },
  cancelText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium, textDecorationLine: 'underline' },
});

export default AudioSessionScreen;
