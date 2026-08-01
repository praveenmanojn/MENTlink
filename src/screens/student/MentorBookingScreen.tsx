/**
 * MentorBookingScreen — Student — MENTlink
 * Book a session / Video Call with a selected mentor, with live availability status.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import RatingBadge from '../../components/common/RatingBadge';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { RootStackParamList, RootStackNavigationProp } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { createBookingRequest } from '../../services/mentorService';
import { supabase } from '../../services/supabase/client';

type MentorBookingRouteProp = RouteProp<RootStackParamList, 'MentorBooking'>;

const CALL_MODES = [
  { id: 'video', label: '📹 Video Call', bg: Colors.stickyYellow },
  { id: 'audio', label: '🎙 Audio Call', bg: Colors.stickyBlue },
  { id: 'meetup', label: '📍 In-Person Meetup', bg: Colors.stickyGreen },
];

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science'];

const DATES = [
  { label: 'Now (Immediate)', date: 'Instant Call' },
  { label: 'Today', date: 'Later Today' },
  { label: 'Tomorrow', date: 'Scheduled' },
];

const MentorBookingScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<'MentorBooking'>>();
  const route = useRoute<MentorBookingRouteProp>();
  const params = route.params || { mentorId: 'mock-mentor-303', mentorName: 'Rahul Sharma', rating: 4.9, distance: '0.6 km' };

  const user = useAuthStore((state) => state.user);
  const studentId = user?.id || 'mock-student-202';
  const studentName = user?.user_metadata?.name || 'Praveen M.';

  const [callMode, setCallMode] = useState<'video' | 'audio' | 'meetup'>('video');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(DATES[0].label);
  const [submitting, setSubmitting] = useState(false);
  const [bookedSession, setBookedSession] = useState<any>(null);

  // Mentor live availability status
  const [mentorStatus, setMentorStatus] = useState<string>('available');

  useEffect(() => {
    if (!supabase || !params.mentorId) return;

    // Initial fetch
    supabase
      .from('profiles')
      .select('status, availability')
      .eq('id', params.mentorId)
      .single()
      .then(({ data }) => {
        if (data) {
          setMentorStatus(data.status || (data.availability ? 'available' : 'offline'));
        }
      });

    // Realtime subscription for live status
    const channel = supabase
      .channel(`mentor-status-${params.mentorId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${params.mentorId}` },
        (payload: any) => {
          if (payload.new) {
            setMentorStatus(payload.new.status || (payload.new.availability ? 'available' : 'offline'));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.mentorId]);

  const handleBook = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a quick topic / doubt title.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createBookingRequest({
        studentId,
        mentorId: params.mentorId,
        subject: selectedSubject,
        title: title.trim(),
        description: description.trim() || `Help needed for ${selectedSubject}`,
        callType: callMode,
        scheduledTime: new Date().toISOString(),
        durationMinutes: 5,
      });

      setBookedSession(result);
    } catch (err: any) {
      console.warn('Booking request failed, creating local fallback session:', err);
      setBookedSession({
        question: { id: `q-${Date.now()}`, title, subject: selectedSubject },
        session: {
          id: `sess-${Date.now()}`,
          question_id: `q-${Date.now()}`,
          call_type: callMode,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>Book & Call Mentor</Text>
          <Text style={styles.pageSub}>Request immediate or scheduled help</Text>

          {/* Mentor Summary Card */}
          <View style={styles.cardWrapper}>
            <View style={styles.pin}><PinWidget color={Colors.pinBlue} size={20} /></View>
            <View style={styles.mentorCard}>
              <View style={styles.mentorRow}>
                <Avatar name={params.mentorName} size={56} />
                <View style={styles.mentorInfo}>
                  <Text style={styles.mentorName}>{params.mentorName}</Text>
                  <AvailabilityBadge status={mentorStatus} />
                  <Text style={styles.mentorDist}>📍 {params.distance} away</Text>
                  <RatingBadge rating={params.rating} />
                </View>
              </View>
            </View>
          </View>

          {bookedSession ? (
            <View style={styles.successWrapper}>
              <View style={styles.pin}><PinWidget color={Colors.pinGreen} size={20} /></View>
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>Request Sent to Mentor!</Text>
                <Text style={styles.successDesc}>
                  Your {callMode.toUpperCase()} call request for "{selectedSubject}" has been sent to {params.mentorName}.
                </Text>
                {callMode !== 'meetup' && (
                  <Button
                    title="📹 Join Live Room Now"
                    onPress={() => {
                      const sessId = bookedSession?.session?.id || 'mock-session-101';
                      navigation.navigate('CallScreen', {
                        sessionId: sessId,
                        callType: callMode as 'video' | 'audio',
                        channelId: bookedSession?.question?.id || 'mock-question-101',
                        userId: studentId,
                        userName: studentName,
                      });
                    }}
                    variant="danger"
                    size="lg"
                    style={{ marginTop: 14, width: '100%' }}
                  />
                )}
                <Button
                  title="View Chat & Sessions"
                  onPress={() => navigation.navigate('Main')}
                  variant="primary"
                  style={{ marginTop: 10, width: '100%' }}
                />
              </View>
            </View>
          ) : (
            <>
              {/* Call Mode Selection */}
              <Text style={styles.sectionTitle}>Select Session Type</Text>
              <View style={styles.chipRow}>
                {CALL_MODES.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    activeOpacity={0.8}
                    style={[
                      styles.modeChip,
                      callMode === m.id && { backgroundColor: m.bg, borderColor: Colors.borderBlack }
                    ]}
                    onPress={() => setCallMode(m.id as any)}
                  >
                    <Text style={styles.modeChipText}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Subject Selection */}
              <Text style={styles.sectionTitle}>Select Subject</Text>
              <View style={styles.chipRowWrap}>
                {SUBJECTS.map((sub) => (
                  <TouchableOpacity
                    key={sub}
                    activeOpacity={0.8}
                    style={[styles.subChip, selectedSubject === sub && styles.subChipActive]}
                    onPress={() => setSelectedSubject(sub)}
                  >
                    <Text style={[styles.subChipText, selectedSubject === sub && styles.textWhite]}>{sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Doubt Details */}
              <Text style={styles.sectionTitle}>Topic / Doubt Title</Text>
              <TextInput
                style={styles.inputField}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Help with Integration by Parts"
                placeholderTextColor={Colors.inkFaint}
              />

              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Details / Notes (Optional)</Text>
              <TextInput
                style={[styles.inputField, { height: 70, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your question or difficulty..."
                placeholderTextColor={Colors.inkFaint}
                multiline
              />

              {/* Submit Button */}
              {submitting ? (
                <ActivityIndicator size="large" color={Colors.stickyRed} style={{ marginTop: 20 }} />
              ) : (
                <Button
                  title={callMode === 'video' ? '📹 Send Request & Video Call →' : 'Send Booking Request →'}
                  onPress={handleBook}
                  variant="danger"
                  size="lg"
                  style={styles.bookBtn}
                />
              )}
            </>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  backBtn: { marginBottom: 12 },
  backText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  pageTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 20 },

  cardWrapper: { alignItems: 'center', marginBottom: 20 },
  pin: { marginBottom: -10, zIndex: 10 },
  mentorCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 16, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  mentorRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  mentorInfo: { flex: 1, alignItems: 'flex-start', gap: 4 },
  mentorName: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  mentorDist: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark },

  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 8, marginTop: 10 },
  chipRow: { flexDirection: 'column', gap: 8, marginBottom: 16 },
  modeChip: {
    backgroundColor: Colors.paperCream,
    borderWidth: 2.5, borderColor: Colors.borderLight, borderRadius: Radius.sm,
    paddingVertical: 10, paddingHorizontal: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
  },
  modeChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  chipRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  subChip: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 8, paddingHorizontal: 12,
  },
  subChipActive: { backgroundColor: Colors.inkBlack },
  subChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },
  textWhite: { color: Colors.white },

  inputField: {
    backgroundColor: Colors.paperCream,
    borderWidth: 2, borderColor: Colors.borderInk, borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.inkBlack,
    marginBottom: 4,
  },

  bookBtn: { width: '100%', marginTop: 20 },

  successWrapper: { alignItems: 'center', marginTop: 12 },
  successCard: {
    backgroundColor: Colors.stickyGreenLight,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20, width: '100%', alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  successIcon: { fontSize: 40, color: Colors.inkBlack, marginBottom: 8 },
  successTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginBottom: 8 },
  successDesc: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
});

export default MentorBookingScreen;
