/**
 * DashboardScreen — Mentor — PeerLink
 * Mentor dashboard with stats cards and pending requests preview.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Modal, Image, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useAuthStore } from '../../store/authStore';
import { useMentorStore } from '../../store/mentorStore';
import { updateMentorLocation } from '../../services/mentorService';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SubjectChip from '../../components/common/SubjectChip';
import { supabase } from '../../services/supabase/client';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { openJitsiCall } from '../../utils/jitsiHelper';

const STATS = [
  { label: 'Sessions\nDone', value: '48', bg: Colors.stickyBlue, rot: -1.5 },
  { label: 'Rating\nAvg', value: '4.9', bg: Colors.stickyYellow, rot: 1.2 },
  { label: 'Doubts\nSolved', value: '266', bg: Colors.stickyGreen, rot: -0.8 },
];

const INITIAL_DUMMY_QUESTIONS = [
  { id: 'q1', subject: 'Physics', title: 'Newton\'s 3rd Law', preview: 'Can someone explain the reaction force with an example in real life?', student: 'Arjun S.', distance: '1.2 km', time: '2 mins ago', hasImage: false },
  { id: 'q2', subject: 'Mathematics', title: 'Integration by Parts', preview: 'How do I apply ∫u dv = uv − ∫v du for this expression: x·eˣ?', student: 'Sweta R.', distance: '0.8 km', time: '5 mins ago', hasImage: true, imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Simple_integration_of_area_under_a_curve.svg/320px-Simple_integration_of_area_under_a_curve.svg.png' },
];

const REPORT_OPTIONS = [
  'Has links',
  'Improper question',
  'Offensive content',
  'Wrong subject',
  'Advertisement of other websites',
  'Question contains personal information',
  'Live quiz, test or exam question'
];

const DashboardScreen = () => {
  const user = useAuthStore((s) => s.user);
  const navigation = useNavigation<any>();
  const name = user?.email?.split('@')[0] ?? 'Rahul';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const upcomingSessions = useMentorStore((s) => s.upcomingSessions);

  const [status, setStatus] = useState('Available');
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [, setTick] = useState(0);

  const [dbQuestions, setDbQuestions] = useState<any[]>(INITIAL_DUMMY_QUESTIONS);
  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>([]);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState<string | null>(null);
  const [reportingQuestionId, setReportingQuestionId] = useState<string | null>(null);
  const [reportedQuestions, setReportedQuestions] = useState<Set<string>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const diff = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
      if (diff < 1) return 'Just now';
      if (diff < 60) return `${diff} mins ago`;
      return `${Math.round(diff / 60)}h ago`;
    } catch {
      return 'Just now';
    }
  };

  const mapDbQuestion = (q: any) => ({
    id: q.id,
    subject: q.subject || 'General',
    title: q.title || 'Doubt Question',
    preview: q.description || q.title || 'Student needs help.',
    student: q.profiles?.name || 'Student',
    distance: '1.0 km',
    time: formatTime(q.created_at),
    hasImage: !!q.image_url,
    imageUri: q.image_url || null,
  });

  // ── Fetch available questions from Supabase & Subscribe to Realtime
  useEffect(() => {
    if (!supabase) return;

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            id,
            student_id,
            subject,
            title,
            description,
            image_url,
            status,
            created_at,
            profiles!questions_student_id_fkey (name, email)
          `)
          .eq('status', 'waiting')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Error fetching available questions:', error.message);
          return;
        }

        if (data && data.length > 0) {
          setDbQuestions(data.map(mapDbQuestion));
        }
      } catch (err) {
        console.warn('Fetch questions exception:', err);
      }
    };

    fetchQuestions();

    // Subscribe to realtime postgres_changes
    const channelId = `dashboard-questions-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        async (payload) => {
          const newQ = payload.new as any;
          if (newQ && newQ.status === 'waiting') {
            let studentName = 'Student';
            try {
              const { data: profile } = await supabase!
                .from('profiles')
                .select('name')
                .eq('id', newQ.student_id)
                .single();
              if (profile?.name) studentName = profile.name;
            } catch {}

            setDbQuestions((prev) => [
              {
                id: newQ.id,
                subject: newQ.subject || 'General',
                title: newQ.title || 'Doubt Question',
                preview: newQ.description || newQ.title || 'Student needs help.',
                student: studentName,
                distance: '1.0 km',
                time: 'Just now',
                hasImage: !!newQ.image_url,
                imageUri: newQ.image_url || null,
              },
              ...prev.filter((item) => item.id !== newQ.id),
            ]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'questions' },
        (payload) => {
          const updated = payload.new as any;
          if (updated && updated.status !== 'waiting') {
            setDbQuestions((prev) => prev.filter((item) => item.id !== updated.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Fetch Mentor Scheduled Meetings & Subscribe to Realtime
  const fetchScheduledMeetings = async () => {
    if (!supabase || !user?.id) return;
    try {
      const { data } = await supabase
        .from('scheduled_sessions')
        .select('*, student_profile:profiles!scheduled_sessions_student_id_fkey(name, email)')
        .eq('mentor_id', user.id)
        .in('status', ['pending', 'accepted'])
        .order('scheduled_at', { ascending: true });

      if (data) {
        setScheduledMeetings(data);
      }
    } catch (e) {
      console.warn('Error fetching mentor scheduled sessions:', e);
    }
  };

  const handleAcceptScheduled = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('scheduled_sessions')
        .update({ status: 'accepted' })
        .eq('id', id);

      if (error) throw error;
      Alert.alert('Session Confirmed! 🎉', 'You have accepted the scheduled session.');
      fetchScheduledMeetings();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to accept session.');
    }
  };

  const handleDeclineScheduled = async (id: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('scheduled_sessions')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) throw error;
      fetchScheduledMeetings();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to decline session.');
    }
  };

  useEffect(() => {
    fetchScheduledMeetings();
    if (!supabase || !user?.id) return;

    const channelId = `mentor-scheduled-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scheduled_sessions', filter: `mentor_id=eq.${user.id}` },
        () => fetchScheduledMeetings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Update mentor GPS proximity location & availability in database
  useEffect(() => {
    if (!user?.id) return;
    const syncLocation = async () => {
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        let lat = 12.9716;
        let lon = 77.5946;
        if (locStatus === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }
        await updateMentorLocation(user.id, lat, lon, status === 'Available');
      } catch (err) {
        console.warn('Error updating mentor location in DB:', err);
      }
    };
    syncLocation();
  }, [user?.id, status]);

  // Tick every second to keep countdown real-time
  useEffect(() => {
    if (upcomingSessions.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [upcomingSessions.length]);

  const getCountdown = (scheduledFor: number) => {
    const ms = scheduledFor - Date.now();
    if (ms <= 0) return 'Now';
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    if (m === 0) return `In ${s}s`;
    return `In ${m}m ${s}s`;
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    if (!user?.id) return;
    try {
      let lat = 12.9716;
      let lon = 77.5946;
      try {
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lon = loc.coords.longitude;
        }
      } catch (e) {}
      await updateMentorLocation(user.id, lat, lon, newStatus === 'Available');
    } catch (err) {
      console.warn('Error updating mentor status in DB:', err);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
              <Text style={styles.sub}>Mentor Dashboard</Text>
            </View>
            <Avatar name={displayName} size={44} />
          </View>

          {/* Status Selector */}
          <View style={styles.statusRow}>
            {['Available', 'Busy', 'Offline'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[
                  styles.statusBtn, 
                  status === s ? styles.statusBtnActive : null,
                  status === s && s === 'Available' ? {backgroundColor: Colors.stickyGreen} : null,
                  status === s && s === 'Busy' ? {backgroundColor: Colors.stickyYellow} : null,
                  status === s && s === 'Offline' ? {backgroundColor: '#FF4444'} : null,
                ]}
                onPress={() => handleStatusChange(s)}
              >
                <Text style={[styles.statusBtnText, status === s ? styles.statusBtnTextActive : null]}>
                  {s === 'Available' ? '🟢 ' : s === 'Busy' ? '🟡 ' : '🔴 '}{s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats */}
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

          {/* Subjects */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>My Subjects</Text>
            <View style={styles.chipsRow}>
              {['Mathematics', 'Physics', 'CS'].map((s, i) => <SubjectChip key={s} subject={s} index={i} />)}
            </View>
          </View>

          {/* Scheduled Meetings Section */}
          {scheduledMeetings.length > 0 && (
            <View style={{ marginVertical: 16 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle2}>📅 Scheduled Jitsi Sessions ({scheduledMeetings.length})</Text>
              </View>

              {scheduledMeetings.map((item) => {
                const studentName = item.student_profile?.name || item.student_profile?.email?.split('@')[0] || 'Student';
                const dateObj = new Date(item.scheduled_at);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
                const isPending = item.status === 'pending';

                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: isPending ? Colors.stickyYellowLight : Colors.paperCream,
                      borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.md,
                      padding: 14, marginBottom: 12,
                      shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack }}>
                        {item.subject} Session
                      </Text>
                      {isPending ? (
                        <View style={{ backgroundColor: Colors.stickyYellow, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack }}>⏳ Requested</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: Colors.stickyGreen, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack }}>🟢 Confirmed</Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, marginTop: 4 }}>
                      👤 Student: {studentName}
                    </Text>
                    <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack, marginTop: 2 }}>
                      ⏰ {dateStr} at {timeStr}
                    </Text>
                    {item.notes ? (
                      <Text style={{ fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkMedium, marginTop: 4 }}>
                        Notes: {item.notes}
                      </Text>
                    ) : null}

                    {isPending ? (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                        <TouchableOpacity
                          style={{
                            flex: 1, backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
                            borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center',
                          }}
                          onPress={() => handleAcceptScheduled(item.id)}
                        >
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack }}>
                            ✓ Accept Session
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flex: 1, backgroundColor: Colors.stickyRed, borderWidth: 2, borderColor: Colors.borderBlack,
                            borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center',
                          }}
                          onPress={() => handleDeclineScheduled(item.id)}
                        >
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white }}>
                            ✕ Decline
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
                          borderRadius: Radius.sm, paddingVertical: 8, marginTop: 10, alignItems: 'center',
                          shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
                        }}
                        onPress={() => {
                          openJitsiCall(item.id, {
                            startWithVideo: true,
                            displayName: user?.email?.split('@')[0] || 'Mentor',
                          });
                        }}
                      >
                        <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack }}>
                          📞 Join Jitsi Call Room →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Upcoming Sessions */}


          {/* Available Questions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle2}>Available Questions</Text>
          </View>
          {dbQuestions.map((q, idx) => (
            <View key={q.id} style={styles.reqWrapper}>
              <View style={styles.reqPin}><PinWidget color={Colors.pinBlue} size={16} /></View>
              <View style={[styles.reqCard, { transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.5deg' }] }]}>
                {/* Reported flag badge */}
                {reportedQuestions.has(q.id) && (
                  <View style={styles.reportedBadge}>
                    <Text style={styles.reportedBadgeText}>🚩 Reported</Text>
                  </View>
                )}
                <View style={styles.reqTop}>
                  <Avatar name={q.student} size={36} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reqStudent}>{q.student} · {q.distance}</Text>
                    <Text style={styles.reqSubject}>{q.subject} · {q.time}</Text>
                  </View>
                  {q.hasImage && <Text style={{fontSize: 20}}>🖼️</Text>}
                </View>
                <Text style={styles.questionTitle}>{q.title}</Text>
                <Text style={styles.reqDoubt} numberOfLines={2}>{q.preview}</Text>
                {q.hasImage && (q as any).imageUri && (
                  <Image
                    source={{ uri: (q as any).imageUri }}
                    style={styles.questionThumb}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity style={styles.detailsBtn} onPress={() => setSelectedQuestion(q)}>
                  <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>

      {/* Question Details Modal */}
      <Modal visible={!!selectedQuestion} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Question Details</Text>
              <TouchableOpacity onPress={() => setSelectedQuestion(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedQuestion && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                <View style={styles.reqTop}>
                  <Avatar name={selectedQuestion.student} size={44} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.reqStudent}>{selectedQuestion.student}</Text>
                    <Text style={styles.reqSubject}>{selectedQuestion.distance} · {selectedQuestion.time}</Text>
                  </View>
                  <Badge label={selectedQuestion.subject} variant="info" />
                </View>
                <Text style={styles.questionTitleLarge}>{selectedQuestion.title}</Text>
                <Text style={styles.reqDoubtFull}>{selectedQuestion.preview}</Text>
                {selectedQuestion.hasImage && selectedQuestion.imageUri && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setZoomedImage(selectedQuestion.imageUri)}
                    style={styles.imagePreviewWrapper}
                  >
                    <Image
                      source={{ uri: selectedQuestion.imageUri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={styles.imageZoomHint}>
                      <Text style={styles.imageZoomHintText}>🔍 Tap to view full size</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <View style={{flexDirection: 'row', gap: 12, marginBottom: 20}}>
                  <TouchableOpacity 
                    style={[styles.startChatBtn, { flex: 1, marginBottom: 0 }]} 
                    onPress={async () => {
                      if (!selectedQuestion || !supabase || !user?.id) return;
                      const studentName = selectedQuestion.student;
                      const qId = selectedQuestion.id;
                      setSelectedQuestion(null);

                      try {
                        // 1. Fetch current question state
                        const { data: currentQ, error: fetchErr } = await supabase
                          .from('questions')
                          .select('id, status, mentor_id')
                          .eq('id', qId)
                          .single();

                        if (fetchErr || !currentQ) {
                          Alert.alert('Error', 'Could not fetch question status.');
                          return;
                        }

                        // 2. If already accepted by THIS mentor → navigate directly
                        if (currentQ.status === 'accepted' && currentQ.mentor_id === user.id) {
                          navigation.navigate('Chat', {
                            openChatWith: studentName,
                            questionId: qId,
                            mentorName: displayName,
                          });
                          return;
                        }

                        // 3. If already accepted by ANOTHER mentor → alert & remove
                        if (currentQ.status === 'accepted' && currentQ.mentor_id !== user.id) {
                          Alert.alert('Already Accepted', 'This question was accepted by another mentor.');
                          setDbQuestions((prev) => prev.filter((item) => item.id !== qId));
                          return;
                        }

                        // 4. Update status to accepted & set mentor_id
                        const { error: updateErr } = await supabase
                          .from('questions')
                          .update({ status: 'accepted', mentor_id: user.id })
                          .eq('id', qId);

                        if (updateErr) {
                          Alert.alert('Error', `Failed to accept question: ${updateErr.message}`);
                          return;
                        }

                        // 5. Insert system chat notification
                        await supabase
                          .from('chats')
                          .insert({
                            question_id: qId,
                            sender_id: user.id,
                            message: `🟢 Mentor ${displayName} accepted your doubt and is ready to chat!`,
                          });
                      } catch (err) {
                        console.warn('Error starting chat:', err);
                      }

                      navigation.navigate('Chat', {
                        openChatWith: studentName,
                        questionId: qId,
                        mentorName: displayName,
                      });
                    }}
                  >
                    <Text style={styles.startChatBtnText}>Start Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.reportBtn} 
                    onPress={() => {
                      setReportingQuestionId(selectedQuestion?.id ?? null);
                      setReportModalVisible(true);
                    }}
                  >
                    <Text style={styles.reportBtnText}>🚩</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Full-Screen Image Zoom Modal */}
      <Modal visible={!!zoomedImage} transparent animationType="fade" onRequestClose={() => setZoomedImage(null)}>
        <View style={styles.zoomOverlay}>
          <TouchableOpacity style={styles.zoomClose} onPress={() => setZoomedImage(null)}>
            <Text style={styles.zoomCloseText}>✕</Text>
          </TouchableOpacity>
          {zoomedImage && (
            <Image
              source={{ uri: zoomedImage }}
              style={styles.zoomedImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={reportModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.reportContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{padding: 20}}>
              <Text style={styles.reportSubtitle}>Tell us what's wrong with it:</Text>
              {REPORT_OPTIONS.map((opt) => (
                <TouchableOpacity key={opt} style={styles.radioRow} onPress={() => setSelectedReportOption(opt)}>
                  <View style={[styles.radioCircle, selectedReportOption === opt && styles.radioCircleActive]}>
                    {selectedReportOption === opt && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.radioText}>{opt}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[styles.sendBtnLarge, !selectedReportOption && {opacity: 0.5}]} 
                disabled={!selectedReportOption}
                onPress={() => {
                  if (reportingQuestionId) {
                    setReportedQuestions(prev => new Set(prev).add(reportingQuestionId));
                  }
                  setReportModalVisible(false);
                  setSelectedReportOption(null);
                  setReportingQuestionId(null);
                }}
              >
                <Text style={styles.sendBtnLargeText}>SEND</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  sub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },

  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  statusBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.paperWhite,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  statusBtnActive: { borderWidth: 3, shadowOffset: { width: 3, height: 3 } },
  statusBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium },
  statusBtnTextActive: { color: Colors.inkBlack, fontSize: FontSize.sm },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  statWrapper: { width: '31%', alignItems: 'center' },
  statCard: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  statValue: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  statLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark, textAlign: 'center', marginTop: 2 },

  sectionCard: {
    backgroundColor: Colors.paperCream,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, marginBottom: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle2: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },

  emptyCard: {
    backgroundColor: Colors.paperWhite, borderWidth: 3, borderColor: Colors.borderBlack, 
    borderRadius: Radius.md, padding: 20, alignItems: 'center', marginBottom: 18,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  emptyText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkMedium },

  reqWrapper: { alignItems: 'center', marginBottom: 18 },
  reqPin: { marginBottom: -8, zIndex: 10 },
  reqCard: {
    width: '100%', backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, padding: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  reqTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  reqStudent: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  reqSubject: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },
  reqDoubt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, marginBottom: 12, lineHeight: 20 },
  reqDoubtFull: { fontFamily: FontFamily.medium, fontSize: FontSize.md, color: Colors.inkDark, marginBottom: 16, lineHeight: 22 },
  
  questionTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 4 },
  questionTitleLarge: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 8 },
  countdownText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 12 },

  reqBtnRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.stickyGreen,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  acceptBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  declineBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  declineBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },

  joinBtn: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.stickyBlue,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  joinBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  
  detailsBtn: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 10, alignItems: 'center', backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  detailsBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  questionThumb: {
    width: '100%', height: 140, borderRadius: Radius.sm, borderWidth: 2,
    borderColor: Colors.borderBlack, marginBottom: 12,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: Colors.notebookBg, borderTopWidth: 4, borderColor: Colors.borderBlack,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg, maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 3, borderColor: Colors.borderBlack, backgroundColor: Colors.paperWhite,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
  },
  modalTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  modalClose: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkBlack },

  imagePlaceholder: {
    backgroundColor: Colors.paperCream, borderWidth: 3, borderColor: Colors.borderBlack,
    borderStyle: 'dashed', borderRadius: Radius.md, height: 160, alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  imagePlaceholderText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },

  imagePreviewWrapper: {
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 3, borderColor: Colors.borderBlack,
    marginBottom: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  imagePreview: {
    width: '100%', height: 200,
  },
  imageZoomHint: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 6, alignItems: 'center',
  },
  imageZoomHintText: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: '#FFFFFF',
  },

  zoomOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  zoomClose: {
    position: 'absolute', top: 50, right: 20, zIndex: 10,
    backgroundColor: Colors.paperWhite, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.full, width: 40, height: 40,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 4,
  },
  zoomCloseText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  zoomedImage: { width: '95%', height: '80%' },

  startChatBtn: {
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.stickyGreen,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    marginBottom: 20,
  },
  startChatBtnText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },

  reportBtn: {
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paperWhite,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  reportBtnText: { fontSize: 24 },

  reportContent: {
    backgroundColor: Colors.notebookBg, borderTopWidth: 4, borderColor: Colors.borderBlack,
    borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
  },
  reportSubtitle: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, marginBottom: 16 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  radioCircle: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2.5, borderColor: Colors.borderBlack,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paperWhite,
  },
  radioCircleActive: { borderColor: Colors.inkBlack },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.inkBlack },
  radioText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, flex: 1 },
  
  sendBtnLarge: {
    backgroundColor: Colors.inkBlack, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32,
    alignSelf: 'flex-end', marginTop: 10,
    borderWidth: 2, borderColor: Colors.borderBlack,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  sendBtnLargeText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.sm, color: Colors.white },
});

export default DashboardScreen;