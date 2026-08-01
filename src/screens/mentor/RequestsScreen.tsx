/**
 * RequestsScreen — Mentor — PeerLink
 * Real-Time incoming doubt & video call requests for Mentors.
 * Fetches questions from public.questions with student name & image.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import SubjectChip from '../../components/common/SubjectChip';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { supabase } from '../../services/supabase/client';
import { useAuthStore } from '../../store/authStore';

interface DoubtRequest {
  id: string;
  student: string;
  studentId: string;
  subject: string;
  title: string;
  doubt: string;
  imageUrl?: string | null;
  time: string;
  callType?: 'video' | 'audio' | 'meetup';
  sessionId?: string;
}

const formatTime = (isoString: string) => {
  try {
    const diff = Math.round((Date.now() - new Date(isoString).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} min ago`;
    return `${Math.round(diff / 60)}h ago`;
  } catch {
    return 'Just now';
  }
};

const RequestsScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((state) => state.user);
  const mentorId = user?.id || 'mock-mentor-303';
  const mentorName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Mentor';

  const [requests, setRequests] = useState<DoubtRequest[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const mapQuestion = (q: any): DoubtRequest => ({
    id: q.id,
    student: q.profiles?.name || 'Student',
    studentId: q.student_id,
    subject: q.subject || 'General',
    title: q.title || 'Doubt',
    doubt: q.description || q.title || 'Student needs help.',
    imageUrl: q.image_url || null,
    time: formatTime(q.created_at),
    callType: 'video',
    sessionId: q.id,
  });

  // ──────────────────────────────────────────────────────────────
  // Fetch open questions with student profile join
  // ──────────────────────────────────────────────────────────────
  const fetchOpenQuestions = async () => {
    if (!supabase) { setLoading(false); return; }

    try {
      const { data: questions, error } = await supabase
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
        console.warn('Error fetching questions:', error.message);
        setLoading(false);
        return;
      }

      if (questions && questions.length > 0) {
        setRequests(questions.map(mapQuestion));
      }
    } catch (e) {
      console.warn('Error in fetchOpenQuestions:', e);
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // Realtime listener for new questions
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOpenQuestions();

    if (!supabase) return;

    const channelId = `mentor-requests-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'questions' },
        async (payload) => {
          const newQ = payload.new as any;
          if (newQ && newQ.status === 'waiting') {
            // Fetch student name for the new question
            let studentName = 'Student';
            try {
              const { data: profile } = await supabase!
                .from('profiles')
                .select('name')
                .eq('id', newQ.student_id)
                .single();
              if (profile?.name) studentName = profile.name;
            } catch {}

            setRequests((prev) => [
              {
                id: newQ.id,
                student: studentName,
                studentId: newQ.student_id,
                subject: newQ.subject || 'General',
                title: newQ.title || 'Doubt',
                doubt: newQ.description || newQ.title || 'Student needs help.',
                imageUrl: newQ.image_url || null,
                time: 'Just now',
                callType: 'video',
                sessionId: newQ.id,
              },
              ...prev,
            ]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'questions' },
        (payload) => {
          const updatedQ = payload.new as any;
          if (updatedQ.status !== 'waiting') {
            setRequests((prev) => prev.filter((r) => r.id !== updatedQ.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mentorId]);

  // ──────────────────────────────────────────────────────────────
  // Accept request → fetch first, then update → navigate to Chat
  // ──────────────────────────────────────────────────────────────
  const handleAccept = async (req: DoubtRequest) => {
    if (!supabase) return;

    // 1. Fetch the current state of the question first
    const { data: currentQ, error: fetchErr } = await supabase
      .from('questions')
      .select('id, status, mentor_id')
      .eq('id', req.id)
      .single();

    if (fetchErr || !currentQ) {
      Alert.alert('Error', 'Could not load question details. Please try again.');
      return;
    }

    // 2. If already accepted by THIS mentor → just navigate to chat
    if (currentQ.status === 'accepted' && currentQ.mentor_id === mentorId) {
      navigation.navigate('Chat', { questionId: req.id, openChatWith: req.student, subject: req.subject });
      return;
    }

    // 3. If already accepted by ANOTHER mentor → show alert and remove from list
    if (currentQ.status === 'accepted' && currentQ.mentor_id !== mentorId) {
      Alert.alert('Already Accepted', 'This question was accepted by another mentor.');
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      return;
    }

    // 4. Still waiting → perform the update (RLS allows: status='waiting' AND mentor_id IS NULL)
    const { error: updateErr } = await supabase
      .from('questions')
      .update({ status: 'accepted', mentor_id: mentorId })
      .eq('id', req.id);

    if (updateErr) {
      Alert.alert('Error', `Could not accept question: ${updateErr.message}`);
      return;
    }

    setAcceptedIds((prev) => [...prev, req.id]);

    // 5. Post acceptance message in chat
    try {
      await supabase.from('chats').insert({
        question_id: req.id,
        sender_id: mentorId,
        message: `🟢 Mentor accepted your doubt and is ready to chat!`,
      });
    } catch {}

    navigation.navigate('Chat', {
      questionId: req.id,
      openChatWith: req.student,
      subject: req.subject,
    });
  };

  const handleDecline = async (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>Incoming Requests</Text>
          <Text style={styles.pageSub}>
            {loading ? 'Loading...' : `${requests.length} student${requests.length !== 1 ? 's' : ''} waiting for help`}
          </Text>

          {loading && (
            <View style={styles.loadingBox}>
              <Text style={styles.loadingSpinner}>⏳</Text>
              <Text style={styles.loadingText}>Loading questions from mentors...</Text>
            </View>
          )}

          {!loading && requests.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySub}>No pending requests right now.</Text>
            </View>
          )}

          {requests.map((req, idx) => {
            const isAccepted = acceptedIds.includes(req.id);
            return (
              <View key={req.id} style={styles.cardWrapper}>
                <View style={styles.card}>

                  {/* ── Top row */}
                  <View style={styles.cardTop}>
                    <Avatar name={req.student} size={44} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.studentName}>{req.student}</Text>
                      <Text style={styles.time}>🕐 {req.time}</Text>
                    </View>
                    <SubjectChip subject={req.subject} index={idx} />
                  </View>

                  {/* ── Title */}
                  <Text style={styles.doubtTitle}>{req.title}</Text>

                  {/* ── Description */}
                  <Text style={styles.doubt} numberOfLines={3}>{req.doubt}</Text>

                  {/* ── Image (if attached) */}
                  {req.imageUrl ? (
                    <View style={styles.imageContainer}>
                      <Text style={styles.imageLabel}>📷 Student attached an image:</Text>
                      <Image
                        source={{ uri: req.imageUrl }}
                        style={styles.questionImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}

                  {/* ── Call type tag */}
                  {req.callType && (
                    <View style={styles.modeTag}>
                      <Text style={styles.modeTagText}>
                        {req.callType === 'video' ? '📹 Video Call Request'
                          : req.callType === 'audio' ? '🎙 Audio Call Request'
                          : '📍 Meetup Request'}
                      </Text>
                    </View>
                  )}

                  {/* ── Actions */}
                  {isAccepted ? (
                    <View style={styles.acceptedContainer}>
                      <View style={styles.acceptedBanner}>
                        <Text style={styles.acceptedText}>✓ Request Accepted</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.callLaunchBtn}
                        onPress={() => navigation.navigate('CallScreen', {
                          sessionId: req.sessionId || req.id,
                          callType: (req.callType as any) || 'video',
                          channelId: req.id,
                          userId: mentorId,
                          userName: mentorName,
                        })}
                      >
                        <Text style={styles.callLaunchText}>📹 Join Video Call Now</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.btnRow}>
                      <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(req)}>
                        <Text style={styles.acceptText}>✓ Accept & Start Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(req.id)}>
                        <Text style={styles.declineText}>✕ Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}

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

  emptyCard: {
    backgroundColor: Colors.stickyGreen, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 32, alignItems: 'center', marginTop: 30,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },
  emptySub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark, marginTop: 4 },

  cardWrapper: { marginBottom: 18 },
  card: {
    backgroundColor: Colors.paperWhite, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 16,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 4,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  studentName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  time: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkLight, marginTop: 2 },

  doubtTitle: {
    fontFamily: FontFamily.extraBold, fontSize: FontSize.md,
    color: Colors.inkBlack, marginBottom: 4,
  },
  doubt: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm,
    color: Colors.inkDark, lineHeight: 20, marginBottom: 12,
  },

  imageContainer: { marginBottom: 12 },
  imageLabel: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs,
    color: Colors.inkDark, marginBottom: 6,
  },
  questionImage: {
    width: '100%', height: 180, borderRadius: Radius.sm,
    borderWidth: 2, borderColor: Colors.borderBlack,
  },

  modeTag: {
    backgroundColor: Colors.stickyBlue, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  modeTagText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  btnRow: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1, backgroundColor: Colors.stickyGreen, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  acceptText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  declineBtn: {
    flex: 1, backgroundColor: Colors.stickyRed, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  declineText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.white },

  acceptedContainer: { gap: 10 },
  acceptedBanner: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 10, alignItems: 'center',
  },
  acceptedText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  callLaunchBtn: {
    backgroundColor: Colors.stickyBlue, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  callLaunchText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  loadingBox: { alignItems: 'center', paddingTop: 48, paddingBottom: 24 },
  loadingSpinner: { fontSize: 40, marginBottom: 12 },
  loadingText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },
});

export default RequestsScreen;
