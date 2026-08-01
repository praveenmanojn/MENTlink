import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Avatar from '../../components/common/Avatar';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const STATS = [
  { label: 'Active\nUsers', value: '1,248', bg: Colors.stickyBlue, rot: -1.5 },
  { label: 'Pending\nReports', value: '12', bg: Colors.stickyRed, rot: 1.2 },
  { label: 'Total\nSessions', value: '8.4k', bg: Colors.stickyYellow, rot: -0.8 },
];

const AdminProfileScreen = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigation = useNavigation<any>();

  const name = user?.email?.split('@')[0] ?? 'Admin';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const handleSettingsPress = () => {
    navigation.navigate('AdminSettings');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Profile header card */}
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinBlue} size={22} /></View>
            <View style={styles.profileCard}>
              <Avatar name={displayName} size={80} />
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.role}>System Administrator</Text>
              <Text style={styles.dept}>MENTlink Core Team</Text>
            </View>
          </View>

          {/* Stats row */}
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

          {/* Settings list */}
          <View style={styles.settingsCard}>
            <TouchableOpacity style={[styles.settingsRow, styles.settingsRowBorder]} onPress={handleSettingsPress}>
              <Text style={styles.settingsIcon}>⚙</Text>
              <Text style={styles.settingsLabel}>Platform Settings</Text>
              <Text style={styles.settingsValue}></Text>
              <Text style={styles.settingsChevron}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsRow} onPress={logout}>
              <Text style={styles.settingsIcon}>⇥</Text>
              <Text style={styles.settingsLabel}>Logout</Text>
              <Text style={styles.settingsValue}></Text>
              <Text style={styles.settingsChevron}>›</Text>
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

  cardWrapper: { alignItems: 'center', marginBottom: 22 },
  pin: { marginBottom: -11, zIndex: 10 },
  profileCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 24, width: '100%', alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  name: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginTop: 12 },
  role: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.pinBlue, marginTop: 2 },
  dept: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginTop: 4 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statWrapper: { width: '31%', alignItems: 'center' },
  statCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },
  statLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark, textAlign: 'center', marginTop: 2 },

  settingsCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingsRowBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  settingsIcon: { fontSize: 18, color: Colors.inkBlack, width: 24, textAlign: 'center' },
  settingsLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.inkBlack, flex: 1 },
  settingsValue: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.inkFaint },
  settingsChevron: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkMedium },
});

export default AdminProfileScreen;
