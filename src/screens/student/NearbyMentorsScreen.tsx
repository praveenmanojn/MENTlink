/**
 * NearbyMentorsScreen — Student — PeerLink
 * List of mentor cards — each as a paper card with rating, distance, subjects.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import RatingBadge from '../../components/common/RatingBadge';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import SubjectChip from '../../components/common/SubjectChip';
import SearchBar from '../../components/common/SearchBar';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const MENTORS = [
  { id: '1', name: 'Rahul Sharma', distance: '0.6 km', subjects: ['Maths', 'Physics'], rating: 4.9, solved: 266, available: true },
  { id: '2', name: 'Ananya R.',    distance: '0.8 km', subjects: ['Chemistry', 'Biology'], rating: 4.8, solved: 201, available: true },
  { id: '3', name: 'Karthik M.',  distance: '1.1 km', subjects: ['CS', 'Maths'], rating: 4.7, solved: 156, available: false },
  { id: '4', name: 'Priya S.',    distance: '1.4 km', subjects: ['Physics', 'Chemistry'], rating: 4.6, solved: 132, available: true },
];

const NearbyMentorsScreen = () => {
  const [search, setSearch] = useState('');
  const filtered = MENTORS.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Nearby Mentors</Text>
          <Text style={styles.pageSub}>Mentors available to help you</Text>

          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or subject..." style={styles.search} />

          {filtered.map((mentor, idx) => (
            <TouchableOpacity key={mentor.id} activeOpacity={0.85}
              style={[styles.mentorCard, { transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.7deg' }] }]}
            >
              <View style={styles.mentorRow}>
                <Avatar name={mentor.name} size={52} />
                <View style={styles.mentorInfo}>
                  <View style={styles.mentorTopRow}>
                    <Text style={styles.mentorName}>{mentor.name}</Text>
                    <AvailabilityBadge available={mentor.available} />
                  </View>
                  <Text style={styles.mentorDist}>📍 {mentor.distance}</Text>
                  <View style={styles.subjectsRow}>
                    {mentor.subjects.map((s, i) => (
                      <SubjectChip key={s} subject={s} index={i} />
                    ))}
                  </View>
                  <View style={styles.mentorBottomRow}>
                    <RatingBadge rating={mentor.rating} />
                    <Text style={styles.solved}>{mentor.solved} Solved</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all mentors →</Text>
          </TouchableOpacity>
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
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 16 },
  search: { marginBottom: 18 },

  mentorCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, marginBottom: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  mentorRow: { flexDirection: 'row', gap: 12 },
  mentorInfo: { flex: 1 },
  mentorTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mentorName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  mentorDist: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium, marginBottom: 6 },
  subjectsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  mentorBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  solved: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },

  viewAll: {
    alignItems: 'center', padding: 14,
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  viewAllText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
});

export default NearbyMentorsScreen;
