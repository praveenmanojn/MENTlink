/**
 * DashboardScreen — Admin — PeerLink
 * Admin overview with KPI sticky notes.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const KPI_NOTES = [
  { label: 'Total Users', value: '1,248', icon: '⊞', bg: Colors.stickyBlue, pin: Colors.pinBlue, rot: -1.5 },
  { label: 'Active Mentors', value: '87', icon: '⊙', bg: Colors.stickyGreen, pin: Colors.pinGreen, rot: 1.2 },
  { label: 'Doubts Today', value: '34', icon: '?', bg: Colors.stickyYellow, pin: Colors.pinYellow, rot: -0.8 },
  { label: 'Pending Verification', value: '12', icon: '!', bg: Colors.stickyRed, pin: Colors.pinRed, rot: 1.5 },
];

const RECENT_ACTIVITY = [
  { id: '1', action: 'New mentor registered', user: 'Karthik M.', time: '5 min ago', icon: '★' },
  { id: '2', action: 'User flagged for review', user: 'Unknown User', time: '22 min ago', icon: '!' },
  { id: '3', action: 'Session completed', user: 'Praveen + Rahul', time: '1 hour ago', icon: '✓' },
  { id: '4', action: 'Report submitted', user: 'Sneha K.', time: '2 hours ago', icon: '⊞' },
];

const DashboardScreen = () => {
  const navigation = useNavigation();
  
  return (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
    <NotebookBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Admin Dashboard</Text>
        <Text style={styles.pageSub}>Platform overview</Text>

        {/* KPI Notes grid */}
        <View style={styles.kpiGrid}>
          {KPI_NOTES.map((kpi, i) => (
            <View key={i} style={styles.kpiWrapper}>
              <View style={styles.kpiPin}><PinWidget color={kpi.pin} size={14} /></View>
              <View style={[styles.kpiCard, { backgroundColor: kpi.bg, transform: [{ rotate: `${kpi.rot}deg` }] }]}>
                <Text style={styles.kpiIcon}>{kpi.icon}</Text>
                <Text style={styles.kpiValue}>{kpi.value}</Text>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {RECENT_ACTIVITY.map((item, i) => (
            <View key={item.id} style={[styles.activityRow, i < RECENT_ACTIVITY.length - 1 && styles.activityRowBorder]}>
              <View style={styles.activityIconBox}><Text style={styles.activityIcon}>{item.icon}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityAction}>{item.action}</Text>
                <Text style={styles.activityUser}>{item.user}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>

        {/* Quick Links */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Directory</Text>
        <View style={styles.quickLinksRow}>
          <TouchableOpacity 
            style={[styles.quickLinkBtn, { backgroundColor: Colors.stickyBlueLight }]}
            onPress={() => (navigation as any).navigate('AdminMentors')}
          >
            <Text style={styles.quickLinkIcon}>🎓</Text>
            <Text style={styles.quickLinkText}>Mentors</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.quickLinkBtn, { backgroundColor: Colors.stickyYellowLight }]}
            onPress={() => (navigation as any).navigate('AdminStudents')}
          >
            <Text style={styles.quickLinkIcon}>🎒</Text>
            <Text style={styles.quickLinkText}>Students</Text>
          </TouchableOpacity>
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
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 20 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24, rowGap: 20 },
  kpiWrapper: { width: '47%', alignItems: 'center' },
  kpiPin: { marginBottom: -8, zIndex: 10 },
  kpiCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 16, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  kpiIcon: { fontSize: 28, color: Colors.inkBlack, marginBottom: 6 },
  kpiValue: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxxl, color: Colors.inkBlack },
  kpiLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 14 },
  activityCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  activityRowBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  activityIconBox: {
    width: 36, height: 36, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, backgroundColor: Colors.paperCream, alignItems: 'center', justifyContent: 'center',
  },
  activityIcon: { fontSize: 16, color: Colors.inkBlack },
  activityAction: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  activityUser: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 2 },
  activityTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint },

  quickLinksRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  quickLinkBtn: {
    flex: 1, paddingVertical: 18, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  quickLinkIcon: { fontSize: 24, marginBottom: 8 },
  quickLinkText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
});

export default DashboardScreen;