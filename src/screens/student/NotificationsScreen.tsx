/**
 * NotificationsScreen — Student — PeerLink
 * Notification cards as pinned paper notes.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const NOTIFICATIONS = [
  { id: '1', icon: '✉', title: 'Rahul Sharma accepted your doubt', time: '2 min ago', bg: Colors.stickyBlueLight, pin: Colors.pinBlue, rot: -1 },
  { id: '2', icon: '★', title: 'Rate your session with Ananya R.', time: '1 hour ago', bg: Colors.stickyYellowLight, pin: Colors.pinYellow, rot: 1.2 },
  { id: '3', icon: '♪', title: 'Session starts in 5 minutes!', time: '4 hours ago', bg: Colors.stickyGreenLight, pin: Colors.pinGreen, rot: -0.8 },
  { id: '4', icon: '!', title: 'New mentor available near you: Karthik M.', time: 'Yesterday', bg: Colors.paperCream, pin: Colors.pinRed, rot: 0.5 },
];

const NotificationsScreen = () => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
    <NotebookBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Notifications</Text>
        <Text style={styles.pageSub}>Your recent alerts</Text>

        {NOTIFICATIONS.map((n) => (
          <View key={n.id} style={styles.noteWrapper}>
            <View style={styles.pin}><PinWidget color={n.pin} size={16} /></View>
            <View style={[styles.notifCard, { backgroundColor: n.bg, transform: [{ rotate: `${n.rot}deg` }] }]}>
              <View style={styles.notifRow}>
                <View style={styles.iconBox}><Text style={styles.notifIcon}>{n.icon}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifTime}>{n.time}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>
    </NotebookBackground>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 20 },

  noteWrapper: { alignItems: 'center', marginBottom: 18 },
  pin: { marginBottom: -8, zIndex: 10 },
  notifCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 16,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 40, height: 40, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, backgroundColor: Colors.paperWhite,
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 20, color: Colors.inkBlack },
  notifTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, lineHeight: 20 },
  notifTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 3 },
});

export default NotificationsScreen;
