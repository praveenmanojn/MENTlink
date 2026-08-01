/**
 * HomeScreen — Student — PeerLink
 * Bulletin board layout: greeting card + 4 action sticky notes.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, StatusBar, Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import NotebookBackground from '../../components/common/NotebookBackground';
import PinWidget from '../../components/common/PinWidget';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { openJitsiCall } from '../../utils/jitsiHelper';

const ACTION_NOTES = [
  {
    id: '1', title: 'Ask a Doubt',
    desc: 'Post your question and get help from nearby mentors',
    icon: '?', bg: Colors.stickyRed, textColor: Colors.white, pin: Colors.pinBlack, rot: -1.5,
  },
  {
    id: '2', title: 'My Chats',
    desc: 'Continue your conversations',
    icon: '✉', bg: Colors.stickyYellow, textColor: Colors.inkBlack, pin: Colors.pinBlue, rot: 1.2,
  },
  {
    id: '3', title: 'Schedule Call',
    desc: 'Book 1-on-1 Jitsi call',
    icon: '📅', bg: Colors.stickyYellow, textColor: Colors.inkBlack, pin: Colors.pinRed, rot: -0.8,
  },
  {
    id: '4', title: 'Nearby Mentors',
    desc: 'View mentors available near you',
    icon: '⊞', bg: Colors.stickyGreen, textColor: Colors.inkBlack, pin: Colors.pinYellow, rot: 1.8,
  },
];

import { supabase } from '../../services/supabase/client';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const name = user?.email?.split('@')[0] ?? 'Praveen';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);

  const [acceptedNotif, setAcceptedNotif] = useState<{ questionId: string; mentorName: string } | null>(null);
  // acceptedSession is set once the mentor accepts, replaces the fake hardcoded session card
  const [acceptedSession, setAcceptedSession] = useState<{ questionId: string; mentorName: string; subject: string } | null>(null);
  const [scheduledMeetings, setScheduledMeetings] = useState<any[]>([]);

  // Fetch student's scheduled meetings
  const fetchScheduledMeetings = async () => {
    if (!supabase || !user?.id) return;
    try {
      const { data } = await supabase
        .from('scheduled_sessions')
        .select('*, mentor_profile:profiles!scheduled_sessions_mentor_id_fkey(name)')
        .eq('student_id', user.id)
        .in('status', ['accepted', 'pending'])
        .order('scheduled_at', { ascending: true });

      if (data) {
        setScheduledMeetings(data);
      }
    } catch (e) {
      console.warn('Error fetching scheduled meetings:', e);
    }
  };

  // Listen for Realtime question acceptance & scheduled sessions when student is on HomeScreen
  useEffect(() => {
    fetchScheduledMeetings();
    if (!supabase || !user?.id) return;

    const channelId = `student-home-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `student_id=eq.${user.id}`,
        },
        async (payload) => {
          const updatedQ = payload.new as any;
          if (updatedQ && updatedQ.status === 'accepted') {
            let mentorName = 'A mentor';
            if (updatedQ.mentor_id) {
              try {
                const { data: profile } = await supabase!
                  .from('profiles')
                  .select('name')
                  .eq('id', updatedQ.mentor_id)
                  .single();
                if (profile?.name) mentorName = profile.name;
              } catch {}
            }
            setAcceptedNotif({ questionId: updatedQ.id, mentorName });
            setAcceptedSession({
              questionId: updatedQ.id,
              mentorName,
              subject: updatedQ.subject || 'Your Doubt',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_sessions',
          filter: `student_id=eq.${user.id}`,
        },
        () => fetchScheduledMeetings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />

      {/* ── Mentor Accepted Notification Modal ──────────── */}
      <Modal visible={!!acceptedNotif} transparent animationType="fade">
        <View style={styles.notifOverlay}>
          <View style={styles.notifCard}>
            <View style={styles.notifIconRow}>
              <Text style={styles.notifBigIcon}>🎉</Text>
            </View>
            <Text style={styles.notifTitle}>Mentor Accepted Your Doubt!</Text>
            <Text style={styles.notifBody}>
              <Text style={{ fontFamily: FontFamily.bold }}>{acceptedNotif?.mentorName}</Text> has accepted your question and is ready to help you right now.
            </Text>
            <View style={styles.notifBtnRow}>
              <TouchableOpacity
                style={styles.notifOpenChatBtn}
                onPress={() => {
                  const qId = acceptedNotif?.questionId;
                  setAcceptedNotif(null);
                  navigation.navigate('Chat', {
                    questionId: qId,
                    openChatWith: acceptedNotif?.mentorName || 'Mentor',
                  });
                }}
              >
                <Text style={styles.notifOpenChatText}>💬 Open Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notifDismissBtn}
                onPress={() => setAcceptedNotif(null)}
              >
                <Text style={styles.notifDismissText}>Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* ── Top bar ─────────────────────────────────── */}
          <View style={styles.topBar}>
            <View style={styles.hamburger}>
              <View style={styles.hLine} /><View style={styles.hLine} /><View style={styles.hLine} />
            </View>
            <TouchableOpacity style={styles.bellWrapper} onPress={() => acceptedNotif && setAcceptedNotif(acceptedNotif)}>
              <Text style={styles.bell}>◆</Text>
              {acceptedNotif && <View style={styles.notifDot} />}
            </TouchableOpacity>
          </View>

          {/* ── Mentor Accepted Banner (inline, dismissable) ── */}
          {acceptedNotif && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.acceptedBanner}
              onPress={() => {
                const qId = acceptedNotif.questionId;
                setAcceptedNotif(null);
                navigation.navigate('Chat', {
                  questionId: qId,
                  openChatWith: acceptedNotif.mentorName,
                });
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.acceptedBannerTitle}>🟢 {acceptedNotif.mentorName} accepted your doubt!</Text>
                <Text style={styles.acceptedBannerSub}>Tap to open chat and start talking →</Text>
              </View>
              <TouchableOpacity onPress={() => setAcceptedNotif(null)} style={styles.bannerDismiss}>
                <Text style={styles.bannerDismissText}>✕</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* ── Greeting ────────────────────────────────── */}
          <View style={styles.greetCard}>
            <Text style={styles.greetHello}>Hello, {displayName} 👋</Text>
            <Text style={styles.greetSub}>What would you like to learn today?</Text>
          </View>

          {/* ── Action notes grid ────────────────────────── */}
          <View style={styles.notesGrid}>
            {/* Large note: Ask a Doubt */}
            <View style={styles.noteWrapper}>
              <View style={styles.notePin}><PinWidget color={ACTION_NOTES[0].pin} size={18} /></View>
              <TouchableOpacity
                style={[styles.noteLarge, { backgroundColor: ACTION_NOTES[0].bg, transform: [{ rotate: `${ACTION_NOTES[0].rot}deg` }] }]}
                activeOpacity={0.85}
                onPress={() => (navigation as any).navigate('Ask Doubt')}
              >
                <Text style={[styles.noteIcon, { color: Colors.white }]}>{ACTION_NOTES[0].icon}</Text>
                <Text style={[styles.noteTitle, { color: Colors.white }]}>{ACTION_NOTES[0].title}</Text>
                <Text style={[styles.noteDesc, { color: 'rgba(255,255,255,0.85)' }]}>{ACTION_NOTES[0].desc}</Text>
                <Text style={[styles.noteArrow, { color: Colors.white }]}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Two smaller notes side by side */}
            <View style={styles.smallRow}>
              <View style={styles.smallWrapper}>
                <View style={styles.notePin}><PinWidget color={ACTION_NOTES[1].pin} size={14} /></View>
                <TouchableOpacity
                  style={[styles.noteSmall, { backgroundColor: ACTION_NOTES[1].bg, transform: [{ rotate: `${ACTION_NOTES[1].rot}deg` }] }]}
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).navigate('Chat')}
                >
                  <Text style={styles.noteIcon}>{ACTION_NOTES[1].icon}</Text>
                  <Text style={styles.noteTitle}>{ACTION_NOTES[1].title}</Text>
                  <Text style={styles.noteDesc}>{ACTION_NOTES[1].desc}</Text>
                  <Text style={styles.noteArrow}>→</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.smallWrapper}>
                <View style={styles.notePin}><PinWidget color={ACTION_NOTES[2].pin} size={14} /></View>
                <TouchableOpacity
                  style={[styles.noteSmall, { backgroundColor: ACTION_NOTES[2].bg, transform: [{ rotate: `${ACTION_NOTES[2].rot}deg` }] }]}
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).navigate('ScheduleMeeting')}
                >
                  <Text style={styles.noteIcon}>{ACTION_NOTES[2].icon}</Text>
                  <Text style={styles.noteTitle}>{ACTION_NOTES[2].title}</Text>
                  <Text style={styles.noteDesc}>{ACTION_NOTES[2].desc}</Text>
                  <Text style={styles.noteArrow}>→</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Nearby Mentors — full width */}
            <View style={styles.noteWrapper}>
              <View style={styles.notePin}><PinWidget color={ACTION_NOTES[3].pin} size={18} /></View>
              <TouchableOpacity
                style={[styles.noteMedium, { backgroundColor: ACTION_NOTES[3].bg, transform: [{ rotate: `${ACTION_NOTES[3].rot}deg` }] }]}
                activeOpacity={0.85}
                onPress={() => (navigation as any).navigate('NearbyMentors')}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteTitle}>{ACTION_NOTES[3].title}</Text>
                    <Text style={styles.noteDesc}>{ACTION_NOTES[3].desc}</Text>
                  </View>
                  <Text style={[styles.noteIcon, { fontSize: 36 }]}>{ACTION_NOTES[3].icon}</Text>
                </View>
                <Text style={styles.noteArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Scheduled Meetings Section ── */}
          {scheduledMeetings.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 10 }}>
                📅 Scheduled Jitsi Calls
              </Text>
              {scheduledMeetings.map((item) => {
                const mentorName = item.mentor_profile?.name || 'Mentor';
                const dateObj = new Date(item.scheduled_at);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
                const isAccepted = item.status === 'accepted';

                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: isAccepted ? Colors.stickyYellowLight : Colors.paperCream,
                      borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.md,
                      padding: 14, marginBottom: 10,
                      shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack }}>
                        {item.subject} Call
                      </Text>
                      {isAccepted ? (
                        <View style={{ backgroundColor: Colors.stickyGreen, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack }}>🟢 Confirmed</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: Colors.stickyYellow, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 8, paddingVertical: 2 }}>
                          <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack }}>⏳ Pending Mentor</Text>
                        </View>
                      )}
                    </View>

                    <Text style={{ fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, marginTop: 4 }}>
                      👤 Mentor: {mentorName}
                    </Text>
                    <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack, marginTop: 2 }}>
                      ⏰ {dateStr} at {timeStr}
                    </Text>
                    {item.notes ? (
                      <Text style={{ fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkMedium, marginTop: 4 }}>
                        Notes: {item.notes}
                      </Text>
                    ) : null}

                    {isAccepted && (
                      <TouchableOpacity
                        style={{
                          backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
                          borderRadius: Radius.sm, paddingVertical: 8, marginTop: 10, alignItems: 'center',
                          shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
                        }}
                        onPress={() => {
                          openJitsiCall(item.id, {
                            startWithVideo: true,
                            displayName: user?.email?.split('@')[0] || 'Student',
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

          {/* ── Active Session (shown only after mentor accepts live doubt) ─── */}
          {acceptedSession && (
            <TouchableOpacity
              style={styles.sessionWrapper}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Chat', {
                questionId: acceptedSession.questionId,
                openChatWith: acceptedSession.mentorName,
              })}
            >
              <View style={styles.notePin}><PinWidget color={Colors.pinRed} size={18} /></View>
              <View style={styles.sessionCard}>
                <Text style={styles.sessionLabel}>🟢 Active Session</Text>
                <Text style={styles.sessionMentor}>{acceptedSession.mentorName}</Text>
                <Text style={styles.sessionMeta}>{acceptedSession.subject} · Tap to open chat →</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  hamburger: { gap: 5 },
  hLine: { width: 26, height: 3, backgroundColor: Colors.inkBlack, borderRadius: 2 },
  bellWrapper: { position: 'relative' },
  bell: { fontSize: 22, color: Colors.inkBlack },
  notifDot: { position: 'absolute', top: 0, right: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.stickyRed, borderWidth: 1.5, borderColor: Colors.borderBlack },

  // Accepted Notification Banner
  acceptedBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.stickyGreen, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 4,
  },
  acceptedBannerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 3 },
  acceptedBannerSub: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark },
  bannerDismiss: { padding: 6 },
  bannerDismissText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },

  // Full-screen Modal Notification
  notifOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  notifCard: {
    backgroundColor: Colors.paperWhite, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 24, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, elevation: 8,
    alignItems: 'center',
  },
  notifIconRow: { marginBottom: 12 },
  notifBigIcon: { fontSize: 52 },
  notifTitle: {
    fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack,
    textAlign: 'center', marginBottom: 10,
  },
  notifBody: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark,
    textAlign: 'center', lineHeight: 22, marginBottom: 20,
  },
  notifBtnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  notifOpenChatBtn: {
    flex: 2, backgroundColor: Colors.stickyGreen, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  notifOpenChatText: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  notifDismissBtn: {
    flex: 1, backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 14, alignItems: 'center',
  },
  notifDismissText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },

  greetCard: { marginBottom: 20 },
  greetHello: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  greetSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginTop: 2 },

  notesGrid: { gap: 16, marginBottom: 20 },

  noteWrapper: { alignItems: 'center' },
  notePin: { marginBottom: -9, zIndex: 10 },
  noteLarge: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20, shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  noteMedium: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 18, shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },

  smallRow: { flexDirection: 'row', gap: 14 },
  smallWrapper: { flex: 1, alignItems: 'center' },
  noteSmall: {
    width: '100%', borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },

  noteIcon: { fontSize: 28, marginBottom: 8, color: Colors.inkBlack },
  noteTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 4 },
  noteDesc: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, lineHeight: 17, marginBottom: 10 },
  noteArrow: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack },

  // Session card (only shown when mentor accepts)
  sessionWrapper: { alignItems: 'center', marginBottom: 12 },
  sessionCard: {
    width: '100%', backgroundColor: Colors.stickyGreen,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
    transform: [{ rotate: '0.5deg' }],
  },
  sessionLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 4 },
  sessionMentor: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginBottom: 4 },
  sessionMeta: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkDark },
});

export default HomeScreen;