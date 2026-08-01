import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const AdminExportDataScreen = () => {
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
          <Text style={styles.headerTitle}>Export Data</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinYellow} size={18} /></View>
            <View style={styles.contentCard}>
              <Text style={styles.title}>Export User Data</Text>
              <Text style={styles.description}>
                Select the format below to export all user data, including students and mentors.
              </Text>

              <TouchableOpacity style={styles.exportBtn}>
                <Text style={styles.exportBtnText}>Export as CSV</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.exportBtn, { backgroundColor: Colors.stickyBlue }]}>
                <Text style={styles.exportBtnText}>Export as JSON</Text>
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
  contentCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    width: '100%', padding: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 8 },
  description: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 24 },
  
  exportBtn: {
    backgroundColor: Colors.stickyGreen,
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', marginBottom: 12,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  exportBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
});

export default AdminExportDataScreen;
