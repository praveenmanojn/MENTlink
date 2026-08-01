/**
 * ScheduleMeetingScreen — Student — MENTlink
 * Select previously contacted mentors, choose date & clock time, and schedule a Jitsi session.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../services/supabase/client';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import SubjectChip from '../../components/common/SubjectChip';
import PinWidget from '../../components/common/PinWidget';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English', 'Biology', 'General Doubt'];

export const ScheduleMeetingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const user = useAuthStore((s) => s.user);

  // Pre-selected mentor from params if any
  const initialMentorId = route.params?.mentorId;
  const initialMentorName = route.params?.mentorName;

  // Contacted Mentors State
  const [mentors, setMentors] = useState<Array<{ id: string; name: string; email?: string }>>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [selectedMentorId, setSelectedMentorId] = useState<string | null>(initialMentorId || null);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Date Selection: Today, Tomorrow, +2 days, +3 days, +4 days
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);

  // Clock Time Picker State
  const [selectedHour, setSelectedHour] = useState<number>(5); // 1-12
  const [selectedMinute, setSelectedMinute] = useState<number>(0); // 0, 15, 30, 45
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  // Dates array generator
  const dateOptions = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: d,
    };
  });

  // Fetch Previously Contacted Mentors
  useEffect(() => {
    const fetchContactedMentors = async () => {
      if (!supabase || !user?.id) return;
      setLoadingMentors(true);

      try {
        // Fetch mentor IDs from student's accepted questions
        const { data: questions, error } = await supabase
          .from('questions')
          .select('mentor_id, mentor_profile:profiles!questions_mentor_id_fkey(id, name, email, availability, status)')
          .eq('student_id', user.id)
          .not('mentor_id', 'is', null);

        if (error) throw error;

        // Deduplicate mentors
        const mentorMap = new Map<string, { id: string; name: string; email?: string; availability?: boolean; status?: string }>();

        if (questions) {
          questions.forEach((q: any) => {
            if (q.mentor_id && q.mentor_profile) {
              mentorMap.set(q.mentor_id, {
                id: q.mentor_id,
                name: q.mentor_profile.name || 'Mentor',
                email: q.mentor_profile.email,
                availability: q.mentor_profile.availability ?? true,
                status: q.mentor_profile.status || (q.mentor_profile.availability ? 'available' : 'offline'),
              });
            }
          });
        }

        // If no past mentors found, fetch general active mentors list
        if (mentorMap.size === 0) {
          const { data: allMentors } = await supabase
            .from('profiles')
            .select('id, name, email, availability, status')
            .eq('role', 'mentor')
            .limit(10);

          if (allMentors) {
            allMentors.forEach((m: any) => {
              mentorMap.set(m.id, {
                id: m.id,
                name: m.name || 'Mentor',
                email: m.email,
                availability: m.availability ?? true,
                status: m.status || (m.availability ? 'available' : 'offline'),
              });
            });
          }
        }

        const list = Array.from(mentorMap.values());
        setMentors(list);

        // Auto-select first mentor if none selected
        if (!selectedMentorId && list.length > 0) {
          setSelectedMentorId(list[0].id);
        }
      } catch (err: any) {
        console.warn('Error fetching contacted mentors:', err);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchContactedMentors();
  }, [user?.id]);

  // Handle Schedule Submit
  const handleScheduleSubmit = async () => {
    if (!selectedMentorId) {
      Alert.alert('Selection Required', 'Please select a mentor to schedule the call with.');
      return;
    }

    if (!user?.id || !supabase) return;

    setSubmitting(true);

    try {
      // Calculate scheduled_at timestamp
      const targetDate = new Date(dateOptions[selectedDateIndex].fullDate);
      let hour24 = selectedHour;
      if (selectedPeriod === 'PM' && selectedHour < 12) hour24 += 12;
      if (selectedPeriod === 'AM' && selectedHour === 12) hour24 = 0;

      targetDate.setHours(hour24, selectedMinute, 0, 0);

      const jitsiRoomId = `MENTlink-${Date.now()}`;

      const { error } = await supabase
        .from('scheduled_sessions')
        .insert({
          student_id: user.id,
          mentor_id: selectedMentorId,
          subject: selectedSubject,
          title: `${selectedSubject} Learning Session`,
          scheduled_at: targetDate.toISOString(),
          duration_minutes: 30,
          status: 'pending',
          jitsi_room_id: jitsiRoomId,
          notes: notes.trim() || null,
        });

      if (error) throw error;

      // Also post a chat notification to mentor if chat table exists
      try {
        await supabase.from('chats').insert({
          question_id: null,
          sender_id: user.id,
          message: `📅 Sent a Scheduled Session Request for ${targetDate.toLocaleDateString()} at ${selectedHour}:${selectedMinute === 0 ? '00' : selectedMinute} ${selectedPeriod}`,
        });
      } catch {}

      Alert.alert(
        '🎉 Meeting Requested!',
        `Your meeting request for ${targetDate.toLocaleDateString()} at ${selectedHour}:${selectedMinute === 0 ? '00' : selectedMinute} ${selectedPeriod} has been sent to the mentor.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Booking Error', err?.message || 'Failed to schedule meeting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={styles.headerTitle}>Schedule Jitsi Session 📅</Text>
            <Text style={styles.headerSub}>Book a 1-on-1 learning call with your mentor</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Section 1: Select Mentor */}
          <View style={styles.sectionCard}>
            <View style={styles.pinWrapper}><PinWidget color={Colors.pinRed} size={16} /></View>
            <Text style={styles.sectionTitle}>1. Select Previously Contacted Mentor</Text>

            {loadingMentors ? (
              <ActivityIndicator color={Colors.inkBlack} style={{ marginVertical: 12 }} />
            ) : mentors.length === 0 ? (
              <Text style={styles.emptyText}>No previous mentors found. Ask a doubt first!</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mentorScroll}>
                {mentors.map((m) => {
                  const isSelected = selectedMentorId === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.mentorChip, isSelected && styles.mentorChipSelected]}
                      onPress={() => setSelectedMentorId(m.id)}
                      activeOpacity={0.8}
                    >
                      <Avatar name={m.name} size={36} />
                      <View>
                        <Text style={[styles.mentorName, isSelected && styles.mentorNameSelected]} numberOfLines={1}>
                          {m.name}
                        </Text>
                        <AvailabilityBadge available={m.availability} status={m.status} />
                      </View>
                      {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Section 2: Choose Date */}
          <View style={styles.sectionCard}>
            <View style={styles.pinWrapper}><PinWidget color={Colors.pinYellow} size={16} /></View>
            <Text style={styles.sectionTitle}>2. Choose Meeting Date</Text>

            <View style={styles.dateGrid}>
              {dateOptions.map((item, idx) => {
                const isSelected = selectedDateIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                    onPress={() => setSelectedDateIndex(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>{item.dayName}</Text>
                    <Text style={[styles.dateNum, isSelected && styles.dateTextSelected]}>{item.dateNum}</Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>{item.monthName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section 3: Interactive Clock Time Picker */}
          <View style={styles.sectionCard}>
            <View style={styles.pinWrapper}><PinWidget color={Colors.pinBlue} size={16} /></View>
            <Text style={styles.sectionTitle}>3. Pick Meeting Time ⏰</Text>

            {/* Time Preview Display */}
            <View style={styles.timePreviewBox}>
              <Text style={styles.timePreviewText}>
                {selectedHour}:{selectedMinute === 0 ? '00' : selectedMinute} {selectedPeriod}
              </Text>
            </View>

            {/* Hours Selector Grid */}
            <Text style={styles.pickerSubLabel}>Hour:</Text>
            <View style={styles.pickerGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[styles.pickerCell, selectedHour === h && styles.pickerCellSelected]}
                  onPress={() => setSelectedHour(h)}
                >
                  <Text style={[styles.pickerCellText, selectedHour === h && styles.pickerCellTextSelected]}>
                    {h}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Minutes & Period Selector */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
              <View style={{ flex: 2 }}>
                <Text style={styles.pickerSubLabel}>Minute:</Text>
                <View style={styles.pickerRow}>
                  {[0, 15, 30, 45].map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerCellSmall, selectedMinute === m && styles.pickerCellSelected]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text style={[styles.pickerCellText, selectedMinute === m && styles.pickerCellTextSelected]}>
                        :{m === 0 ? '00' : m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.pickerSubLabel}>Period:</Text>
                <View style={styles.pickerRow}>
                  {(['AM', 'PM'] as const).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pickerCellSmall, selectedPeriod === p && styles.pickerCellSelectedPeriod]}
                      onPress={() => setSelectedPeriod(p)}
                    >
                      <Text style={[styles.pickerCellText, selectedPeriod === p && styles.pickerCellTextSelected]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Section 4: Subject & Notes */}
          <View style={styles.sectionCard}>
            <View style={styles.pinWrapper}><PinWidget color={Colors.pinGreen} size={16} /></View>
            <Text style={styles.sectionTitle}>4. Subject & Learning Goal</Text>

            <Text style={styles.inputLabel}>Subject:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 12 }}>
              {SUBJECTS.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  onPress={() => setSelectedSubject(sub)}
                >
                  <SubjectChip subject={sub} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Notes / Topics to discuss:</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. Need help with Integration formulas and practice problems..."
              placeholderTextColor={Colors.inkLight}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            disabled={submitting}
            onPress={handleScheduleSubmit}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.inkBlack} />
            ) : (
              <Text style={styles.submitBtnText}>📅 Confirm & Request Session →</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.paperWhite, borderBottomWidth: 3, borderColor: Colors.borderBlack,
    paddingHorizontal: 16, paddingVertical: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, elevation: 4,
  },
  backBtn: { padding: 4 },
  backArrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkBlack },
  headerTextGroup: { flex: 1 },
  headerTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  headerSub: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkMedium },

  scroll: { padding: 16, gap: 16 },

  sectionCard: {
    backgroundColor: Colors.paperWhite, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 16, position: 'relative',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  pinWrapper: { position: 'absolute', top: -8, right: 16, zIndex: 5 },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 12 },

  emptyText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium, fontStyle: 'italic' },

  mentorScroll: { gap: 10, paddingVertical: 4 },
  mentorChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderLight,
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6,
  },
  mentorChipSelected: {
    backgroundColor: Colors.stickyYellow, borderColor: Colors.borderBlack,
  },
  mentorName: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },
  mentorNameSelected: { color: Colors.inkBlack },
  checkIcon: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xs, color: Colors.statusSolved },

  dateGrid: { flexDirection: 'row', gap: 8 },
  dateCard: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderLight,
    borderRadius: Radius.sm, paddingVertical: 10,
  },
  dateCardSelected: {
    backgroundColor: Colors.stickyGreen, borderColor: Colors.borderBlack,
  },
  dateDayName: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkMedium },
  dateNum: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginVertical: 2 },
  dateMonth: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark },
  dateTextSelected: { color: Colors.inkBlack },

  timePreviewBox: {
    backgroundColor: Colors.stickyYellow, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 10, alignItems: 'center', marginBottom: 12,
  },
  timePreviewText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },

  pickerSubLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkDark, marginBottom: 6 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  pickerCell: {
    width: '23%', paddingVertical: 8, alignItems: 'center',
    backgroundColor: Colors.paperCream, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: Radius.xs,
  },
  pickerCellSelected: {
    backgroundColor: Colors.stickyBlue, borderColor: Colors.borderBlack, borderWidth: 2,
  },
  pickerCellSelectedPeriod: {
    backgroundColor: Colors.stickyRed, borderColor: Colors.borderBlack, borderWidth: 2,
  },
  pickerCellText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  pickerCellTextSelected: { color: Colors.inkBlack },

  pickerRow: { flexDirection: 'row', gap: 6 },
  pickerCellSmall: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: Colors.paperCream, borderWidth: 1.5, borderColor: Colors.borderLight,
    borderRadius: Radius.xs,
  },

  inputLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkDark, marginBottom: 6 },
  notesInput: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack,
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderInk,
    borderRadius: Radius.sm, padding: 12, textAlignVertical: 'top', minHeight: 70,
  },

  submitBtn: {
    backgroundColor: Colors.stickyGreen, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  submitBtnText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.inkBlack },
});

export default ScheduleMeetingScreen;
