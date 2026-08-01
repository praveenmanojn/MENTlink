/**
 * RatingsScreen — Mentor — PeerLink
 * Ratings and reviews as sticky note cards.
 */
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Avatar from '../../components/common/Avatar';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const REVIEWS = [
  { id: '1', student: 'Praveen M.', rating: 5, review: 'Rahul explained everything so clearly! Best mentor on MENTlink.', subject: 'Mathematics', date: 'Today' },
  { id: '2', student: 'Sneha K.', rating: 5, review: 'Very patient and thorough. Helped me understand Newton\'s Laws perfectly.', subject: 'Physics', date: 'Yesterday' },
  { id: '3', student: 'Arjun P.', rating: 4, review: 'Great session! Could have been a bit more detailed on edge cases.', subject: 'CS', date: '3 days ago' },
];

const STAR_COLORS = [Colors.stickyYellow, Colors.stickyYellowLight, Colors.paperCream];

const RatingsScreen = () => (
  <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
    <NotebookBackground>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Ratings & Reviews</Text>
        <Text style={styles.pageSub}>What students say about you</Text>

        {/* Overall rating card */}
        <View style={styles.overallWrapper}>
          <View style={styles.overallPin}><PinWidget color={Colors.pinYellow} size={20} /></View>
          <View style={styles.overallCard}>
            <Text style={styles.overallNum}>4.9</Text>
            <Text style={styles.overallStars}>★★★★★</Text>
            <Text style={styles.overallSub}>Based on 48 sessions</Text>
          </View>
        </View>

        {REVIEWS.map((r, idx) => (
          <View key={r.id} style={styles.reviewWrapper}>
            <View style={styles.reviewPin}><PinWidget color={[Colors.pinBlue, Colors.pinRed, Colors.pinGreen][idx % 3]} size={14} /></View>
            <View style={[styles.reviewCard, { backgroundColor: STAR_COLORS[idx % 3], transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.7deg' }] }]}>
              <View style={styles.reviewTop}>
                <Avatar name={r.student} size={36} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewStudent}>{r.student}</Text>
                  <Text style={styles.reviewDate}>{r.subject} · {r.date}</Text>
                </View>
                <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}</Text>
              </View>
              <Text style={styles.reviewText}>{r.review}</Text>
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

  overallWrapper: { alignItems: 'center', marginBottom: 24 },
  overallPin: { marginBottom: -10, zIndex: 10 },
  overallCard: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 24, width: '100%', alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  overallNum: { fontFamily: FontFamily.extraBold, fontSize: FontSize.hero, color: Colors.inkBlack, lineHeight: 70 },
  overallStars: { fontSize: 28, color: Colors.inkBlack, marginBottom: 4 },
  overallSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark },

  reviewWrapper: { alignItems: 'center', marginBottom: 18 },
  reviewPin: { marginBottom: -8, zIndex: 10 },
  reviewCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reviewStudent: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  reviewDate: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint },
  reviewStars: { fontSize: 18, color: Colors.inkBlack },
  reviewText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, lineHeight: 20 },
});

export default RatingsScreen;