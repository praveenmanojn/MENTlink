/**
 * NearbyMentorsScreen — Student — PeerLink
 * List of mentor cards — each as a paper card with rating, distance, subjects, and Video Call request action.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import * as Location from 'expo-location';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import RatingBadge from '../../components/common/RatingBadge';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import SubjectChip from '../../components/common/SubjectChip';
import SearchBar from '../../components/common/SearchBar';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { RootStackNavigationProp } from '../../types/navigation';
import { supabase } from '../../services/supabase/client';
import { fetchNearbyMentors, MentorProfile } from '../../services/mentorService';

const MOCK_FALLBACK_MENTORS: MentorProfile[] = [
  {
    id: 'mock-mentor-303',
    name: 'Rahul Sharma',
    reputation: 4.9,
    solved_count: 266,
    subjects: ['Mathematics', 'Physics'],
    availability: true,
    distance_meters: 600,
  },
  {
    id: 'mock-mentor-304',
    name: 'Ananya Roy',
    reputation: 4.8,
    solved_count: 142,
    subjects: ['Computer Science', 'Data Structures'],
    availability: true,
    distance_meters: 1200,
  },
  {
    id: 'mock-mentor-305',
    name: 'Vikram Patel',
    reputation: 4.7,
    solved_count: 98,
    subjects: ['Chemistry'],
    availability: false,
    distance_meters: 2500,
  },
];

const NearbyMentorsScreen = () => {
  const [search, setSearch] = useState('');
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<RootStackNavigationProp<'NearbyMentors'>>();

  useEffect(() => {
    const getMentors = async () => {
      try {
        let lat = 12.9716;
        let lon = 77.5946;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lon = location.coords.longitude;
        }

        const data = await fetchNearbyMentors(lat, lon, 50000, true);
        setMentors(data);
      } catch (error) {
        console.warn('Error loading DB mentors:', error);
      } finally {
        setLoading(false);
      }
    };

    getMentors();

    // Listen to real-time mentor availability & location changes in public.profiles table
    if (!supabase) return;
    const channelId = `nearby-mentors-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          getMentors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = mentors.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.subjects && m.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase())))
  );

  const formatDistance = (meters: number) => {
    if (!meters || meters < 1000) return `${Math.round(meters || 500)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Nearby Mentors</Text>
          <Text style={styles.pageSub}>Available mentors near your location</Text>

          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or subject..." style={styles.search} />

          {loading ? (
            <ActivityIndicator size="large" color={Colors.stickyBlue} style={{ marginTop: 40 }} />
          ) : filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Mentors Nearby Yet</Text>
              <Text style={styles.emptySub}>
                Mentors who sign up and set their status to Available will automatically appear here with their distance!
              </Text>
            </View>
          ) : (
            filtered.map((mentor, idx) => (
              <TouchableOpacity key={mentor.id} activeOpacity={0.9}
                style={[styles.mentorCard, { transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.7deg' }] }]}
                onPress={() => navigation.navigate('MentorBooking', { 
                  mentorId: mentor.id, 
                  mentorName: mentor.name, 
                  rating: mentor.reputation, 
                  distance: formatDistance(mentor.distance_meters) 
                })}
              >
                <View style={styles.mentorRow}>
                  <Avatar name={mentor.name} size={52} />
                  <View style={styles.mentorInfo}>
                    <View style={styles.mentorTopRow}>
                      <Text style={styles.mentorName}>{mentor.name}</Text>
                      <AvailabilityBadge available={mentor.availability} status={mentor.status} />
                    </View>
                    <Text style={styles.mentorDist}>📍 {formatDistance(mentor.distance_meters)} away</Text>
                    <View style={styles.subjectsRow}>
                      {mentor.subjects && mentor.subjects.map((s, i) => (
                        <SubjectChip key={s} subject={s} index={i} />
                      ))}
                    </View>
                    <View style={styles.mentorBottomRow}>
                      <RatingBadge rating={mentor.reputation} />
                      <Text style={styles.solved}>{mentor.solved_count} Solved</Text>
                      <TouchableOpacity
                        style={styles.callBookBtn}
                        onPress={() => navigation.navigate('MentorBooking', {
                          mentorId: mentor.id,
                          mentorName: mentor.name,
                          rating: mentor.reputation,
                          distance: formatDistance(mentor.distance_meters),
                        })}
                      >
                        <Text style={styles.callBookText}>📹 Video Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}

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
  mentorBottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  solved: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },
  callBookBtn: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1, elevation: 2,
  },
  callBookText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  emptyCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 30, alignItems: 'center', marginTop: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 6 },
  emptySub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, textAlign: 'center', lineHeight: 20 },
});

export default NearbyMentorsScreen;
