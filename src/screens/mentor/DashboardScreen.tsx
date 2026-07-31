/**
 * DashboardScreen — Mentor — PeerLink
 * Mentor dashboard with stats cards and pending requests preview.
 */
import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import RatingBadge from '../../components/common/RatingBadge';
import SubjectChip from '../../components/common/SubjectChip';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const STATS = [
  { label: 'Sessions\nDone', value: '48', bg: Colors.stickyBlue, rot: -1.5 },
  { label: 'Rating\nAvg', value: '4.9', bg: Colors.stickyYellow, rot: 1.2 },
  { label: 'Doubts\nSolved', value: '266', bg: Colors.stickyGreen, rot: -0.8 },
];

const REQUESTS = [
  { id: '1', student: 'Praveen M.', subject: 'Mathematics', doubt: 'Quadratic Equation', time: '2 min ago' },
  { id: '2', student: 'Sneha K.', subject: 'Physics', doubt: 'Newton\'s Third Law', time: '15 min ago' },
];

const DashboardScreen = () => {
  const user = useAuthStore((s) => s.user);
  const name = user?.email?.split('@')[0] ?? 'Rahul';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
              <Text style={styles.sub}>Mentor Dashboard</Text>
            </View>
            <Avatar name={displayName} size={44} />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={i} style={styles.statWrapper}>
                <View style={[styles.statCard, { backgroundColor: s.bg, transform: [{ rotate: `${s.rot}deg` }] }]}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Subjects */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>My Subjects</Text>
            <View style={styles.chipsRow}>
              {['Mathematics', 'Physics', 'CS'].map((s, i) => <SubjectChip key={s} subject={s} index={i} />)}
            </View>
          </View>

          {/* Pending requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle2}>Pending Requests</Text>
            <Badge label={`${REQUESTS.length} New`} variant="error" />
          </View>

          {REQUESTS.map((req, idx) => (
            <View key={req.id} style={styles.reqWrapper}>
              <View style={styles.reqPin}><PinWidget color={idx === 0 ? Colors.pinRed : Colors.pinBlue} size={16} /></View>
              <View style={[styles.reqCard, { transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.5deg' }] }]}>
                <View style={styles.reqTop}>
                  <Avatar name={req.student} size={36} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reqStudent}>{req.student}</Text>
                    <Text style={styles.reqSubject}>{req.subject} · {req.time}</Text>
                  </View>
                  <Badge label="New" variant="error" />
                </View>
                <Text style={styles.reqDoubt}>{req.doubt}</Text>
                <View style={styles.reqBtnRow}>
                  <TouchableOpacity style={styles.acceptBtn}><Text style={styles.acceptBtnText}>✓ Accept</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn}><Text style={styles.declineBtnText}>✕ Decline</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  sub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statWrapper: { width: '31%', alignItems: 'center' },
  statCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  statLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark, textAlign: 'center', marginTop: 2 },

  sectionCard: {
    backgroundColor: Colors.paperCream,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, marginBottom: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle2: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },

  reqWrapper: { alignItems: 'center', marginBottom: 18 },
  reqPin: { marginBottom: -8, zIndex: 10 },
  reqCard: {
    width: '100%', backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  reqTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqStudent: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  reqSubject: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },
  reqDoubt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, marginBottom: 12, lineHeight: 20 },
  reqBtnRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.stickyGreen,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  acceptBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  declineBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  declineBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },
});

export default DashboardScreen;