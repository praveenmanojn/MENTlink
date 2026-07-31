/**
 * AnalyticsScreen — Admin — PeerLink
 * Analytics on paper — hand-drawn bar charts style.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const WEEKLY_DATA = [
  { day: 'Mon', doubts: 18, sessions: 7 },
  { day: 'Tue', doubts: 24, sessions: 11 },
  { day: 'Wed', doubts: 32, sessions: 15 },
  { day: 'Thu', doubts: 28, sessions: 12 },
  { day: 'Fri', doubts: 40, sessions: 18 },
  { day: 'Sat', doubts: 22, sessions: 9 },
  { day: 'Sun', doubts: 14, sessions: 5 },
];

const MAX = 40;
const BAR_HEIGHT = 100;

const SUBJECT_DATA = [
  { subject: 'Mathematics', pct: 34, color: Colors.stickyBlue },
  { subject: 'Physics', pct: 22, color: Colors.stickyYellow },
  { subject: 'CS', pct: 20, color: Colors.stickyGreen },
  { subject: 'Chemistry', pct: 15, color: Colors.stickyRed },
  { subject: 'Biology', pct: 9, color: Colors.stickyBlueLight },
];

const AnalyticsScreen = () => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
    <NotebookBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Analytics</Text>
        <Text style={styles.pageSub}>Platform performance this week</Text>

        {/* Bar chart card */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartPin}><PinWidget color={Colors.pinBlue} size={20} /></View>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Activity</Text>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.stickyBlue }]} />
                <Text style={styles.legendText}>Doubts</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.stickyGreen }]} />
                <Text style={styles.legendText}>Sessions</Text>
              </View>
            </View>

            <View style={styles.barChart}>
              {WEEKLY_DATA.map((d, i) => (
                <View key={d.day} style={styles.barGroup}>
                  <View style={styles.barsContainer}>
                    <View style={[styles.bar, { height: (d.doubts / MAX) * BAR_HEIGHT, backgroundColor: Colors.stickyBlue }]} />
                    <View style={[styles.bar, { height: (d.sessions / MAX) * BAR_HEIGHT, backgroundColor: Colors.stickyGreen }]} />
                  </View>
                  <Text style={styles.barLabel}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Subjects breakdown */}
        <View style={styles.subjectWrapper}>
          <View style={styles.subjectPin}><PinWidget color={Colors.pinYellow} size={18} /></View>
          <View style={styles.subjectCard}>
            <Text style={styles.chartTitle}>Doubts by Subject</Text>
            {SUBJECT_DATA.map((s) => (
              <View key={s.subject} style={styles.subjectRow}>
                <Text style={styles.subjectName}>{s.subject}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
                </View>
                <Text style={styles.subjectPct}>{s.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </NotebookBackground>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 24 },

  chartWrapper: { alignItems: 'center', marginBottom: 24 },
  chartPin: { marginBottom: -10, zIndex: 10 },
  chartCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 18, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5,
    transform: [{ rotate: '-0.5deg' }],
  },
  chartTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 12 },

  legend: { flexDirection: 'row', gap: 16, marginBottom: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: 2 },
  legendText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark },

  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: BAR_HEIGHT + 24 },
  barGroup: { alignItems: 'center', flex: 1 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  bar: { width: 10, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: 2 },
  barLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkMedium, marginTop: 4 },

  subjectWrapper: { alignItems: 'center', marginBottom: 16 },
  subjectPin: { marginBottom: -9, zIndex: 10 },
  subjectCard: {
    backgroundColor: Colors.stickyYellowLight,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 18, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  subjectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  subjectName: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkBlack, width: 80 },
  barTrack: { flex: 1, height: 18, backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%' },
  subjectPct: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack, width: 32, textAlign: 'right' },
});

export default AnalyticsScreen;