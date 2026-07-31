/**
 * RequestsScreen — Mentor — PeerLink
 * Full list of incoming doubt requests.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SubjectChip from '../../components/common/SubjectChip';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const REQUESTS = [
  { id: '1', student: 'Praveen M.', subject: 'Mathematics', doubt: 'I\'m stuck on solving quadratic equations with imaginary roots.', time: '2 min ago', urgent: true },
  { id: '2', student: 'Sneha K.', subject: 'Physics', doubt: 'Newton\'s Third Law application in rocket propulsion.', time: '15 min ago', urgent: false },
  { id: '3', student: 'Arjun P.', subject: 'CS', doubt: 'Time complexity of merge sort vs quick sort.', time: '32 min ago', urgent: false },
];

const RequestsScreen = () => {
  const [accepted, setAccepted] = useState<string[]>([]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Incoming Requests</Text>
          <Text style={styles.pageSub}>{REQUESTS.length} students waiting for help</Text>

          {REQUESTS.map((req, idx) => (
            <View key={req.id} style={styles.cardWrapper}>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Avatar name={req.student} size={44} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.studentName}>{req.student}</Text>
                    <Text style={styles.time}>{req.time}</Text>
                  </View>
                  <SubjectChip subject={req.subject} index={idx} />
                </View>
                <Text style={styles.doubt}>{req.doubt}</Text>
                {accepted.includes(req.id) ? (
                  <View style={styles.acceptedBanner}>
                    <Text style={styles.acceptedText}>✓ Request Accepted</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => setAccepted((p) => [...p, req.id])}>
                      <Text style={styles.acceptText}>✓ Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineBtn}>
                      <Text style={styles.declineText}>✕ Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 20 },

  cardWrapper: { marginBottom: 16 },
  card: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 16,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  studentName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  time: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 2 },
  doubt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, lineHeight: 20, marginBottom: 14 },

  btnRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center',
    backgroundColor: Colors.stickyGreen, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  acceptText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  declineBtn: {
    flex: 1, paddingVertical: 9, alignItems: 'center',
    backgroundColor: Colors.paperCream, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  declineText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },

  acceptedBanner: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 10, alignItems: 'center',
  },
  acceptedText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
});

export default RequestsScreen;