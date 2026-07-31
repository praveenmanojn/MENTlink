/**
 * ActivityScreen — Student — PeerLink
 * Recent activity feed as paper note list.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const ACTIVITY = [
  { id: '1', icon: '✓', text: 'Your doubt on Quadratic Equations was marked Solved', time: '10:35 AM', color: Colors.stickyGreen },
  { id: '2', icon: '★', text: 'You rated Rahul Sharma 5 stars', time: '10:40 AM', color: Colors.stickyYellow },
  { id: '3', icon: '♪', text: 'Audio session with Rahul ended', time: '10:50 AM', color: Colors.stickyBlue },
  { id: '4', icon: '?', text: 'You posted a new doubt: Organic Chemistry', time: 'Yesterday', color: Colors.stickyRed },
];

const ActivityScreen = () => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
    <NotebookBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Activity</Text>
        <Text style={styles.pageSub}>Your recent actions</Text>

        <View style={styles.activityList}>
          {ACTIVITY.map((item, i) => (
            <View key={item.id} style={[styles.activityRow, i < ACTIVITY.length - 1 && styles.rowBorder]}>
              <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actText}>{item.text}</Text>
                <Text style={styles.actTime}>{item.time}</Text>
              </View>
            </View>
          ))}
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
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 20 },

  activityList: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  iconBox: {
    width: 38, height: 38, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 18, color: Colors.inkBlack },
  actText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack, lineHeight: 20 },
  actTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 2 },
});

export default ActivityScreen;
