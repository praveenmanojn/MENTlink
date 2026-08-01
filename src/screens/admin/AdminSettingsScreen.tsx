import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { useMaintenanceStore } from '../../store/maintenanceStore';

const AdminSettingsScreen = () => {
  const navigation = useNavigation();
  const isMaintenanceMode = useMaintenanceStore((s) => s.isMaintenanceMode);
  const setMaintenanceMode = useMaintenanceStore((s) => s.setMaintenanceMode);
  const fetchMaintenanceStatus = useMaintenanceStore((s) => s.fetchMaintenanceStatus);

  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetchMaintenanceStatus();
  }, []);

  const handleToggleMaintenance = (val: boolean) => {
    setMaintenanceMode(val);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        
        {/* Header with Back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinRed} size={18} /></View>
            <View style={styles.settingsCard}>
              <Text style={styles.sectionTitle}>System</Text>
              
              <View style={[styles.settingsRow, styles.settingsRowBorder]}>
                <View style={styles.settingsLabelGroup}>
                  <Text style={styles.settingsIcon}>🛠</Text>
                  <Text style={styles.settingsLabel}>Maintenance Mode</Text>
                </View>
                <Switch 
                  value={isMaintenanceMode} 
                  onValueChange={handleToggleMaintenance} 
                  trackColor={{ false: Colors.borderLight, true: Colors.stickyGreen }}
                  thumbColor={Colors.paperWhite}
                />
              </View>

              <View style={styles.settingsRow}>
                <View style={styles.settingsLabelGroup}>
                  <Text style={styles.settingsIcon}>🔔</Text>
                  <Text style={styles.settingsLabel}>Admin Notifications</Text>
                </View>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications} 
                  trackColor={{ false: Colors.borderLight, true: Colors.stickyGreen }}
                  thumbColor={Colors.paperWhite}
                />
              </View>
            </View>
          </View>

          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinYellow} size={18} /></View>
            <View style={[styles.settingsCard, { backgroundColor: Colors.stickyYellowLight }]}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              
              <TouchableOpacity 
                style={[styles.settingsRow, styles.settingsRowBorder]}
                onPress={() => (navigation as any).navigate('AdminExportData')}
              >
                <View style={styles.settingsLabelGroup}>
                  <Text style={styles.settingsIcon}>💾</Text>
                  <Text style={styles.settingsLabel}>Export User Data</Text>
                </View>
                <Text style={styles.settingsChevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingsRow}
                onPress={() => (navigation as any).navigate('AdminSystemLogs')}
              >
                <View style={styles.settingsLabelGroup}>
                  <Text style={styles.settingsIcon}>📜</Text>
                  <Text style={styles.settingsLabel}>System Logs</Text>
                </View>
                <Text style={styles.settingsChevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.inkBlack, fontWeight: 'bold' },
  headerTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },
  
  scroll: { paddingHorizontal: 20, paddingTop: 10 },

  cardWrapper: { alignItems: 'center', marginBottom: 24 },
  pin: { marginBottom: -9, zIndex: 10 },
  settingsCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    width: '100%', padding: 16,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 12 },
  
  settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  settingsRowBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  settingsLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsIcon: { fontSize: 18, color: Colors.inkBlack, width: 24, textAlign: 'center' },
  settingsLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.inkBlack },
  settingsChevron: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkMedium },
});

export default AdminSettingsScreen;
