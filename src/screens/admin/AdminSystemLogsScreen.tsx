import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const LOGS = [
  { id: '1', time: '10:45 AM', type: 'INFO', msg: 'System backup completed successfully.' },
  { id: '2', time: '09:30 AM', type: 'WARN', msg: 'High latency detected in Chat Service.' },
  { id: '3', time: '08:15 AM', type: 'ERROR', msg: 'Failed authentication attempt for admin.' },
  { id: '4', time: 'Yesterday', type: 'INFO', msg: 'New mentor registered and verified.' },
];

const AdminSystemLogsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>System Logs</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinRed} size={18} /></View>
            <View style={styles.logsCard}>
              <Text style={styles.title}>Recent Server Logs</Text>
              
              <View style={styles.logsContainer}>
                {LOGS.map((log, index) => (
                  <View key={log.id} style={[styles.logRow, index < LOGS.length - 1 && styles.logRowBorder]}>
                    <View style={styles.logMeta}>
                      <Text style={[styles.logType, log.type === 'ERROR' ? { color: Colors.stickyRed } : log.type === 'WARN' ? { color: Colors.stickyYellow } : { color: Colors.stickyGreen }]}>
                        [{log.type}]
                      </Text>
                      <Text style={styles.logTime}>{log.time}</Text>
                    </View>
                    <Text style={styles.logMsg}>{log.msg}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity style={styles.refreshBtn}>
                <Text style={styles.refreshBtnText}>Refresh Logs</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scroll: { paddingHorizontal: 20, paddingTop: 20 },

  cardWrapper: { alignItems: 'center', marginBottom: 24 },
  pin: { marginBottom: -9, zIndex: 10 },
  logsCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    width: '100%', padding: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 16 },
  
  logsContainer: { backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm, padding: 12, marginBottom: 20 },
  logRow: { paddingVertical: 10 },
  logRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  logMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logType: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  logTime: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkMedium },
  logMsg: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.inkDark },

  refreshBtn: {
    backgroundColor: Colors.paperCream,
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  refreshBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
});

export default AdminSystemLogsScreen;
