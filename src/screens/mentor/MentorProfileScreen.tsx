/**
 * MentorProfileScreen — Mentor — PeerLink
 * Mentor profile with subjects, stats, and ratings.
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
import SubjectChip from '../../components/common/SubjectChip';
import RatingBadge from '../../components/common/RatingBadge';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const STATS = [
  { label: 'Sessions', value: '48', bg: Colors.stickyBlue, rot: -1.5 },
  { label: 'Solved', value: '266', bg: Colors.stickyGreen, rot: 1 },
  { label: 'Rating', value: '4.9', bg: Colors.stickyYellow, rot: -0.7 },
];

const SETTINGS_ITEMS = [
  { icon: '◉', label: 'Location', value: 'Coimbatore, India' },
  { icon: '✦', label: 'Availability', value: 'Mon–Fri, 4–8 PM' },
  { icon: '⚙', label: 'Settings', value: '' },
  { icon: '⇥', label: 'Logout', value: '' },
];

const MentorProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const name = user?.email?.split('@')[0] ?? 'Rahul';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1) + ' Sharma';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile card */}
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinGreen} size={22} /></View>
            <View style={styles.profileCard}>
              <TouchableOpacity style={styles.editBtn}><Text style={styles.editIcon}>✎</Text></TouchableOpacity>
              <Avatar name={displayName} size={80} />
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>Peer Mentor</Text>
              <Text style={styles.dept}>Computer Science Engineering · 3rd Year</Text>
              <View style={styles.badgeRow}>
                <RatingBadge rating={4.9} count={48} />
                <AvailabilityBadge available={true} />
              </View>
            </View>
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
          <View style={styles.subjectCard}>
            <Text style={styles.sectionLabel}>Subjects I Teach</Text>
            <View style={styles.chipsRow}>
              {['Mathematics', 'Physics', 'CS', 'Statistics'].map((sub, i) => (
                <SubjectChip key={sub} subject={sub} index={i} />
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsCard}>
            {SETTINGS_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.settingsRow, i < SETTINGS_ITEMS.length - 1 && styles.rowBorder]}
                onPress={item.label === 'Logout' ? logout : undefined}
              >
                <Text style={styles.settingsIcon}>{item.icon}</Text>
                <Text style={styles.settingsLabel}>{item.label}</Text>
                <Text style={styles.settingsValue}>{item.value}</Text>
                <Text style={styles.settingsChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },
  cardWrapper: { alignItems: 'center', marginBottom: 22 },
  pin: { marginBottom: -11, zIndex: 10 },
  profileCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 24, width: '100%', alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  editBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 34, height: 34, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paperCream,
  },
  editIcon: { fontSize: 16, color: Colors.inkBlack },
  name: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginTop: 12 },
  role: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.pinGreen, marginTop: 2 },
  dept: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginTop: 4, textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statWrapper: { width: '31%', alignItems: 'center' },
  statCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  statLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark, textAlign: 'center', marginTop: 2 },

  subjectCard: {
    backgroundColor: Colors.paperCream,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 16, marginBottom: 18,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  sectionLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },

  settingsCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  settingsIcon: { fontSize: 18, color: Colors.inkBlack, width: 24, textAlign: 'center' },
  settingsLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.inkBlack, flex: 1 },
  settingsValue: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.inkFaint },
  settingsChevron: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkMedium },
});

export default MentorProfileScreen;
