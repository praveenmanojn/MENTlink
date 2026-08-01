/**
 * ChatScreen — Student — PeerLink
 * Real-time Chat List (WhatsApp style) + Live Chat Room with instant call controls.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, StatusBar, KeyboardAvoidingView, Platform,
  Modal, Image, Alert, ActivityIndicator, TextInput as RNTextInput, FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import SubjectChip from '../../components/common/SubjectChip';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

import { useAuthStore } from '../../store/authStore';
import { useQuestionStatus } from '../../hooks/useQuestionStatus';
import { useChatMessages } from '../../hooks/useChatMessages';
import { useCallSessionRealtime } from '../../hooks/useCallSessionRealtime';
import { supabase } from '../../services/supabase/client';
import { RootStackNavigationProp } from '../../types/navigation';
import { buildJitsiRoomUrl, openJitsiCall } from '../../utils/jitsiHelper';

export interface ChatListItem {
  id: string;
  subject: string;
  title: string;
  description: string | null;
  status: 'waiting' | 'accepted' | 'solved' | 'cancelled';
  created_at: string;
  updated_at: string;
  mentor_id: string | null;
  mentor_name: string;
  mentor_available: boolean;
  last_message: string;
  last_message_time: string;
}

const StudentChatScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<'CallScreen'>>();
  const route = useRoute<any>();

  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.id || '';
  const currentUserName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';

  const routeParamQuestionId = route.params?.questionId;
  const [activeQuestionId, setActiveQuestionId] = useState<string | undefined>(routeParamQuestionId);

  // Chat List State
  const [conversations, setConversations] = useState<ChatListItem[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(true);

  // Sync route param when navigated from outside
  useEffect(() => {
    if (routeParamQuestionId) {
      setActiveQuestionId(routeParamQuestionId);
    }
  }, [routeParamQuestionId]);

  // ── Fetch Conversations List for Student
  const fetchConversations = async () => {
    if (!supabase || !currentUserId) return;
    setListLoading(true);

    try {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id, subject, title, description, status, created_at, updated_at, mentor_id,
          mentor_profile:profiles!questions_mentor_id_fkey(name, availability, status)
        `)
        .eq('student_id', currentUserId)
        .order('updated_at', { ascending: false });

      if (error) {
        // Fallback without relation alias
        const { data: fallbackData } = await supabase
          .from('questions')
          .select('*')
          .eq('student_id', currentUserId)
          .order('updated_at', { ascending: false });

        if (fallbackData) {
          const formatted = fallbackData.map((q: any) => ({
            id: q.id,
            subject: q.subject || 'Doubt',
            title: q.title || 'Doubt Request',
            description: q.description,
            status: q.status,
            created_at: q.created_at,
            updated_at: q.updated_at,
            mentor_id: q.mentor_id,
            mentor_name: 'Mentor',
            mentor_available: false,
            last_message: q.status === 'waiting' ? 'Waiting for mentor to accept...' : 'Tap to open chat',
            last_message_time: q.updated_at ? new Date(q.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          }));
          setConversations(formatted);
        }
        return;
      }

      if (data) {
        // Fetch last message for each question
        const itemsWithMessages = await Promise.all(
          data.map(async (q: any) => {
            let lastMsg = q.status === 'waiting' ? '⏳ Waiting for a mentor to accept...' : 'Tap to chat';
            let lastTime = q.updated_at ? new Date(q.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

            try {
              const { data: chatData } = await supabase!
                .from('chats')
                .select('message, image_url, created_at')
                .eq('question_id', q.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

              if (chatData) {
                lastMsg = chatData.message || (chatData.image_url ? '📷 Image attached' : 'Message');
                if (chatData.created_at) {
                  lastTime = new Date(chatData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              }
            } catch {}

            const mentorProf = q.mentor_profile;
            return {
              id: q.id,
              subject: q.subject || 'Doubt',
              title: q.title || 'Doubt Question',
              description: q.description,
              status: q.status,
              created_at: q.created_at,
              updated_at: q.updated_at,
              mentor_id: q.mentor_id,
              mentor_name: mentorProf?.name || (q.status === 'waiting' ? 'Waiting for mentor...' : 'Mentor'),
              mentor_available: mentorProf?.availability ?? (mentorProf?.status === 'available'),
              last_message: lastMsg,
              last_message_time: lastTime,
            };
          })
        );

        setConversations(itemsWithMessages);
      }
    } catch (e) {
      console.warn('Error fetching student conversations:', e);
    } finally {
      setListLoading(false);
    }
  };

  // Subscribe to real-time updates on student questions & chats
  useEffect(() => {
    fetchConversations();
    if (!supabase || !currentUserId) return;

    const channelId = `student-chat-list-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'questions', filter: `student_id=eq.${currentUserId}` },
        () => fetchConversations()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chats' },
        () => fetchConversations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // ── Live Room Hooks
  const questionId = activeQuestionId;
  const { question, isLoading: isQuestionLoading } = useQuestionStatus(questionId);
  const { messages, sendMessage } = useChatMessages(questionId);
  const { sessions } = useCallSessionRealtime(questionId);

  const [input, setInput] = useState('');
  const [callSheetVisible, setCallSheetVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);

  // ── Rating state
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const handleSubmitRating = async () => {
    if (!selectedRating || !supabase || !question?.mentor_id || !currentUserId) return;
    setRatingSubmitting(true);
    try {
      await supabase.from('mentor_ratings').upsert({
        mentor_id: question.mentor_id,
        student_id: currentUserId,
        question_id: questionId,
        rating: selectedRating,
        comment: ratingComment.trim() || null,
        created_at: new Date().toISOString(),
      });
      setRatingSubmitted(true);
      setTimeout(() => {
        setRatingModalVisible(false);
        setRatingSubmitted(false);
        setSelectedRating(0);
        setRatingComment('');
      }, 1800);
    } catch (e: any) {
      Alert.alert('Rating Error', e?.message || 'Failed to submit rating.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // ── Scheduled Session state
  const [scheduledSession, setScheduledSession] = useState<any>(null);
  const [endingSession, setEndingSession] = useState(false);

  // Fetch active scheduled session for this question
  useEffect(() => {
    if (!questionId || !supabase) return;

    const fetchScheduledSession = async () => {
      const { data } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('question_id', questionId)
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_time', { ascending: true })
        .limit(1)
        .maybeSingle();
      setScheduledSession(data || null);
    };

    fetchScheduledSession();

    // Realtime: update banner when session changes
    const ssChannel = supabase
      .channel(`student-ss-${questionId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'scheduled_sessions',
        filter: `question_id=eq.${questionId}`,
      }, () => fetchScheduledSession())
      .subscribe();

    return () => { supabase.removeChannel(ssChannel); };
  }, [questionId]);

  const handleEndScheduledSession = async () => {
    if (!scheduledSession || !supabase) return;
    Alert.alert(
      'End Session',
      'Mark this scheduled session as completed and close the question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            setEndingSession(true);
            try {
              await supabase
                .from('scheduled_sessions')
                .update({ status: 'completed' })
                .eq('id', scheduledSession.id);
              if (questionId) {
                await supabase
                  .from('questions')
                  .update({ status: 'solved' })
                  .eq('id', questionId);
              }
              setScheduledSession(null);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to end session.');
            } finally {
              setEndingSession(false);
            }
          },
        },
      ]
    );
  };

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const isClosed = question?.status === 'solved' || question?.status === 'cancelled';
  const isWaiting = question?.status === 'waiting';

  const mentorName = question?.mentor_profile?.name || route.params?.openChatWith || 'Mentor';
  const mentorAvailable = question?.mentor_profile?.availability ?? (question?.mentor_profile?.status === 'available');
  const ongoingCall = sessions.find((s) => s.status === 'ongoing');

  // ── Message Handlers
  const handleSendText = async () => {
    if (!input.trim() || isClosed || isWaiting) return;
    const textToSend = input.trim();
    setInput('');
    try {
      await sendMessage(currentUserId, textToSend);
    } catch (e: any) {
      Alert.alert('Send Error', e?.message || 'Failed to send message.');
    }
  };

  const handleSendImage = async () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed || isClosed) return;
    setImageUploading(true);

    try {
      let finalUrl = trimmed;
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        if (supabase) {
          try {
            const resp = await fetch(trimmed);
            if (resp.ok) {
              const blob = await resp.blob();
              const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as ArrayBuffer);
                reader.onerror = reject;
                reader.readAsArrayBuffer(blob);
              });
              const uint8 = new Uint8Array(arrayBuffer);
              const fileName = `chat-${Date.now()}-${currentUserId}.jpg`;
              const { error: uploadErr } = await supabase.storage
                .from('doubt-images')
                .upload(fileName, uint8, { contentType: 'image/jpeg', upsert: true });

              if (!uploadErr) {
                const { data: urlData } = supabase.storage
                  .from('doubt-images')
                  .getPublicUrl(fileName);
                if (urlData?.publicUrl) finalUrl = urlData.publicUrl;
              }
            }
          } catch (e) {
            console.warn('Storage upload skipped:', e);
          }
        }
      }

      await sendMessage(currentUserId, '', finalUrl);
      setImageUrlInput('');
      setImageModalVisible(false);
    } catch (e: any) {
      Alert.alert('Image Send Error', e?.message || 'Failed to attach image.');
    } finally {
      setImageUploading(false);
    }
  };

  const startInstantCall = async (type: 'audio' | 'video') => {
    setCallSheetVisible(false);
    if (!questionId || !supabase) return;

    const mentorId = question?.mentor_id;
    const studentId = question?.student_id || currentUserId;

    if (!mentorId || !studentId) {
      Alert.alert('Call Error', 'Mentor must accept before starting a call.');
      return;
    }

    try {
      const { data: newSession, error } = await supabase
        .from('audio_sessions')
        .insert({
          question_id: questionId,
          mentor_id: mentorId,
          student_id: studentId,
          start_time: new Date().toISOString(),
          duration_minutes: 15,
          call_type: type,
          status: 'ongoing',
        })
        .select()
        .single();

      if (error || !newSession) {
        Alert.alert('Call Error', error?.message || 'Failed to start call session.');
        return;
      }

      // 1. Build Expo Go / Jitsi room URL
      const jitsiUrl = buildJitsiRoomUrl(newSession.id, {
        startWithVideo: type === 'video',
        displayName: currentUserName,
      });

      // 2. Save room_url to audio_sessions
      await supabase
        .from('audio_sessions')
        .update({ room_url: jitsiUrl })
        .eq('id', newSession.id);

      // 3. Post Jitsi room link message into chat
      await sendMessage(
        currentUserId,
        `📞 Started a Jitsi ${type === 'video' ? '📹 Video' : '🎤 Audio'} Call!\nRoom Link: ${jitsiUrl}`
      );

      navigation.navigate('CallScreen', {
        sessionId: newSession.id,
        callType: type,
        channelId: questionId,
        userId: currentUserId,
        userName: currentUserName,
      });
    } catch (err: any) {
      Alert.alert('Call Error', err?.message || 'Failed to start call.');
    }
  };

  const joinCall = (session: any) => {
    navigation.navigate('CallScreen', {
      sessionId: session.id,
      callType: session.call_type || 'video',
      channelId: questionId || '',
      userId: currentUserId,
      userName: currentUserName,
    });
  };

  // ──────────────────────────────────────────────────────────────
  // VIEW 1: Chat List View (if no activeQuestionId selected)
  // ──────────────────────────────────────────────────────────────
  if (!questionId) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
        <NotebookBackground>
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>My Conversations 💬</Text>
            <Text style={styles.listHeaderSub}>Your doubt chat history with mentors</Text>
          </View>

          {listLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.inkBlack} />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : conversations.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>✉️</Text>
              <Text style={styles.emptyTitle}>No Doubt Chats Yet</Text>
              <Text style={styles.emptySub}>
                When you post a doubt and a mentor accepts, your conversation will appear here!
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chatCard}
                  activeOpacity={0.85}
                  onPress={() => setActiveQuestionId(item.id)}
                >
                  <Avatar name={item.mentor_name} size={48} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.chatName} numberOfLines={1}>{item.mentor_name}</Text>
                      <Text style={styles.chatTime}>{item.last_message_time}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <SubjectChip subject={item.subject} />
                      <Text style={styles.chatQuestionTitle} numberOfLines={1}>{item.title}</Text>
                    </View>
                    <Text style={styles.lastMsgText} numberOfLines={1}>{item.last_message}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
                    {item.status === 'accepted' ? (
                      <View style={styles.statusBadgeAccepted}>
                        <Text style={styles.statusBadgeTextAccepted}>🟢 Live</Text>
                      </View>
                    ) : item.status === 'waiting' ? (
                      <View style={styles.statusBadgeWaiting}>
                        <Text style={styles.statusBadgeTextWaiting}>⏳ Waiting</Text>
                      </View>
                    ) : (
                      <View style={styles.statusBadgeSolved}>
                        <Text style={styles.statusBadgeTextSolved}>✓ Closed</Text>
                      </View>
                    )}
                    <Text style={styles.cardArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </NotebookBackground>
      </SafeAreaView>
    );
  }

  // ──────────────────────────────────────────────────────────────
  // VIEW 2: Direct Chat Room View (when a questionId is active)
  // ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setActiveQuestionId(undefined);
                if (route.params?.questionId) {
                  navigation.setParams({ questionId: undefined });
                }
              }}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Avatar name={mentorName} size={40} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle} numberOfLines={1}>{mentorName}</Text>
              <AvailabilityBadge available={mentorAvailable} status={mentorAvailable ? 'available' : 'offline'} />
            </View>

            {/* Instant Call Button */}
            <TouchableOpacity
              style={[styles.callHeaderBtn, (isClosed || isWaiting) && { opacity: 0.4 }]}
              disabled={isClosed || isWaiting}
              onPress={() => setCallSheetVisible(true)}
            >
              <Text style={styles.callHeaderIcon}>📞</Text>
            </TouchableOpacity>

            {/* Rate Mentor Button — only shown when mentor is assigned */}
            {question?.mentor_id && (
              <TouchableOpacity
                style={styles.rateHeaderBtn}
                onPress={() => setRatingModalVisible(true)}
              >
                <Text style={styles.rateHeaderIcon}>⭐</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Question Closed Banner */}
          {isClosed && (
            <View style={styles.closedBanner}>
              <Text style={styles.closedBannerText}>
                🔒 Question is {question?.status}. Chat history is read-only.
              </Text>
            </View>
          )}

          {/* Incoming Call Banner */}
          {ongoingCall && (
            <View style={styles.incomingCallBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.incomingCallTitle}>
                  {ongoingCall.call_type === 'video' ? '📹 Instant Video Call' : '🎤 Instant Audio Call'}
                </Text>
                <Text style={styles.incomingCallSub}>Live session in progress! Tap to join.</Text>
              </View>
              <TouchableOpacity style={styles.joinCallBtn} onPress={() => joinCall(ongoingCall)}>
                <Text style={styles.joinCallBtnText}>Join →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scheduled Session Banner */}
          {scheduledSession && !isClosed && (
            <View style={styles.scheduledSessionBanner}>
              <View style={styles.scheduledSessionInfo}>
                <Text style={styles.scheduledSessionTitle}>📅 Scheduled Session</Text>
                <Text style={styles.scheduledSessionDetail}>
                  {scheduledSession.subject || 'Doubt Session'} •{' '}
                  {scheduledSession.call_type === 'video' ? '📹 Video' : scheduledSession.call_type === 'audio' ? '🎤 Audio' : '📍 In-Person'}
                </Text>
                <Text style={styles.scheduledSessionTime}>
                  🕐 {scheduledSession.scheduled_time
                    ? new Date(scheduledSession.scheduled_time).toLocaleString([], {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })
                    : 'Scheduled'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.endSessionBtn}
                onPress={handleEndScheduledSession}
                disabled={endingSession}
              >
                {endingSession
                  ? <ActivityIndicator size="small" color={Colors.white} />
                  : <Text style={styles.endSessionBtnText}>End Session ✓</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Messages OR Waiting Screen */}
          {isWaiting ? (
            <View style={styles.waitingContainer}>
              <Text style={styles.waitingIcon}>⏳</Text>
              <Text style={styles.waitingTitle}>Waiting for a mentor to accept...</Text>
              <Text style={styles.waitingSub}>
                Your doubt is listed for available mentors. Once accepted, live chat and calls will connect right here!
              </Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.messagesScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.dateDivider}>
                <View style={styles.dateLine} />
                <Text style={styles.dateText}>Live Chat Room</Text>
                <View style={styles.dateLine} />
              </View>

              {messages.map((msg) => {
                const isMine = msg.sender_id === currentUserId;
                return (
                  <View key={msg.id} style={[styles.msgRow, isMine && styles.msgRowRight]}>
                    {!isMine && <Avatar name={mentorName} size={30} />}
                    <View style={{ maxWidth: '75%' }}>
                      <View style={[
                        styles.bubble,
                        isMine ? styles.bubbleMine : styles.bubbleTheirs,
                      ]}>
                        {msg.message ? (
                          msg.message.includes('meet.jit.si') || msg.message.includes('PeerLink-') || msg.message.includes('MENTlink-') ? (
                            <View style={styles.jitsiCard}>
                              <Text style={styles.jitsiCardTitle}>
                                {msg.message.includes('Video') ? '📹 Jitsi Video Call' : '🎤 Jitsi Audio Call'}
                              </Text>
                              <Text style={styles.jitsiCardSub}>Jitsi room link created & shared</Text>
                              <TouchableOpacity
                                style={styles.jitsiCardJoinBtn}
                                onPress={() => {
                                  const match = msg.message?.match(/PeerLink-([a-f0-9]+)/i) || msg.message?.match(/MENTlink-([a-f0-9]+)/i);
                                  const rawId = match ? match[1] : '';
                                  const sessionId = rawId || questionId || '';
                                  const isVideo = msg.message?.includes('Video');
                                  openJitsiCall(sessionId, {
                                    startWithVideo: !!isVideo,
                                    displayName: currentUserName,
                                  });
                                }}
                              >
                                <Text style={styles.jitsiCardJoinText}>📞 Join Jitsi Room →</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>
                              {msg.message}
                            </Text>
                          )
                        ) : null}
                        {msg.image_url ? (
                          <Image
                            source={{ uri: msg.image_url }}
                            style={styles.chatImage}
                            resizeMode="cover"
                          />
                        ) : null}
                      </View>
                      <Text style={[styles.timeText, isMine && styles.timeRight]}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <View style={{ height: 12 }} />
            </ScrollView>
          )}

          {/* Input Bar */}
          {!isWaiting && (
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={[styles.attachBtn, isClosed && { opacity: 0.4 }]}
                disabled={isClosed}
                onPress={() => setImageModalVisible(true)}
              >
                <Text style={styles.attachIcon}>📎</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.inputField, isClosed && { opacity: 0.6 }]}
                value={input}
                onChangeText={setInput}
                placeholder={isClosed ? 'Question closed' : 'Type a message...'}
                placeholderTextColor={Colors.inkFaint}
                editable={!isClosed}
                onSubmitEditing={handleSendText}
              />
              <TouchableOpacity
                style={[styles.sendBtn, (isClosed || !input.trim()) && { opacity: 0.5 }]}
                disabled={isClosed || !input.trim()}
                onPress={handleSendText}
              >
                <Text style={styles.sendIcon}>▶</Text>
              </TouchableOpacity>
            </View>
          )}

        </KeyboardAvoidingView>
      </NotebookBackground>

      {/* Call Modal */}
      <Modal visible={callSheetVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.callModalContent}>
            <Text style={styles.callModalTitle}>Start Instant Call 📞</Text>
            <Text style={styles.callModalSub}>Connect with mentor right now</Text>

            <TouchableOpacity style={styles.callOptionBtn} onPress={() => startInstantCall('audio')}>
              <Text style={styles.callOptionIcon}>🎤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.callOptionTitle}>Instant Audio Call</Text>
                <Text style={styles.callOptionSub}>Voice conversation via Jitsi</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.callOptionBtn} onPress={() => startInstantCall('video')}>
              <Text style={styles.callOptionIcon}>📹</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.callOptionTitle}>Instant Video Call</Text>
                <Text style={styles.callOptionSub}>Face-to-face video session</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelCallBtn} onPress={() => setCallSheetVisible(false)}>
              <Text style={styles.cancelCallText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.callModalContent}>
            <Text style={styles.callModalTitle}>Attach Image 🖼️</Text>
            <Text style={styles.callModalSub}>Paste image URL to share in chat</Text>
            <RNTextInput
              style={styles.imageUrlInput}
              placeholder="https://i.imgur.com/example.jpg"
              placeholderTextColor={Colors.inkLight}
              value={imageUrlInput}
              onChangeText={setImageUrlInput}
              autoCapitalize="none"
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.cancelCallBtn} onPress={() => setImageModalVisible(false)}>
                <Text style={styles.cancelCallText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendImageConfirmBtn, imageUploading && { opacity: 0.6 }]}
                disabled={imageUploading}
                onPress={handleSendImage}
              >
                {imageUploading ? (
                  <ActivityIndicator size="small" color={Colors.inkBlack} />
                ) : (
                  <Text style={styles.sendImageConfirmText}>Send Image →</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Rate Mentor Modal ── */}
      <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
        <View style={styles.rateOverlay}>
          <View style={styles.rateCard}>
            {/* Pin */}
            <View style={styles.ratePin}>
              <Text style={{ fontSize: 20 }}>📌</Text>
            </View>

            {ratingSubmitted ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 52, marginBottom: 12 }}>🎉</Text>
                <Text style={styles.rateThankTitle}>Thank you!</Text>
                <Text style={styles.rateThankSub}>Your rating has been submitted.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.rateTitle}>Rate Your Mentor</Text>
                <Text style={styles.rateSub}>How was your session with {mentorName}?</Text>

                {/* Star Picker */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setSelectedRating(star)}
                      activeOpacity={0.7}
                      style={styles.starBtn}
                    >
                      <Text style={[
                        styles.starIcon,
                        star <= selectedRating && styles.starIconActive,
                      ]}>
                        {star <= selectedRating ? '★' : '☆'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Rating Label */}
                {selectedRating > 0 && (
                  <Text style={styles.ratingLabel}>
                    {['', 'Poor 😞', 'Fair 😐', 'Good 🙂', 'Great 😃', 'Excellent 🌟'][selectedRating]}
                  </Text>
                )}

                {/* Comment Input */}
                <TextInput
                  style={styles.rateCommentInput}
                  placeholder="Leave a comment (optional)..."
                  placeholderTextColor={Colors.inkLight}
                  value={ratingComment}
                  onChangeText={setRatingComment}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />

                {/* Buttons */}
                <View style={styles.rateBtnRow}>
                  <TouchableOpacity
                    style={styles.rateCancelBtn}
                    onPress={() => setRatingModalVisible(false)}
                  >
                    <Text style={styles.rateCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rateSubmitBtn, (!selectedRating || ratingSubmitting) && { opacity: 0.5 }]}
                    disabled={!selectedRating || ratingSubmitting}
                    onPress={handleSubmitRating}
                  >
                    {ratingSubmitting
                      ? <ActivityIndicator color={Colors.inkBlack} />
                      : <Text style={styles.rateSubmitText}>Submit ★</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // List View Styles
  listHeader: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    borderBottomWidth: 2, borderColor: Colors.borderBlack, backgroundColor: Colors.paperWhite,
  },
  listHeaderTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xxl, color: Colors.inkBlack },
  listHeaderSub: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium, marginTop: 2 },

  listContainer: { padding: 16, gap: 12 },
  chatCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.paperWhite, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  chatName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, flex: 1 },
  chatTime: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkLight },
  chatQuestionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkDark, flex: 1 },
  lastMsgText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.inkMedium, marginTop: 2 },

  statusBadgeAccepted: { backgroundColor: Colors.stickyGreen, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  statusBadgeTextAccepted: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack },
  statusBadgeWaiting: { backgroundColor: Colors.stickyYellow, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  statusBadgeTextWaiting: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack },
  statusBadgeSolved: { backgroundColor: Colors.borderLight, borderWidth: 1.5, borderColor: Colors.borderBlack, borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  statusBadgeTextSolved: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkDark },

  cardArrow: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.inkBlack },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loadingText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginTop: 12 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 6 },
  emptySub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, textAlign: 'center', lineHeight: 20 },

  // Room View Styles
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.paperWhite,
    borderBottomWidth: 3, borderColor: Colors.borderBlack,
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  backBtn: { padding: 4 },
  backArrow: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, color: Colors.inkBlack },
  headerInfo: { flex: 1, gap: 4 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },

  callHeaderBtn: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
  },
  callHeaderIcon: { fontSize: 18 },

  closedBanner: {
    backgroundColor: Colors.stickyRed, borderBottomWidth: 2, borderColor: Colors.borderBlack,
    padding: 8, alignItems: 'center',
  },
  closedBannerText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },

  incomingCallBanner: {
    backgroundColor: Colors.stickyYellow, borderBottomWidth: 2, borderColor: Colors.borderBlack,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  incomingCallTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  incomingCallSub: { fontFamily: FontFamily.medium, fontSize: FontSize.xxs, color: Colors.inkDark },
  joinCallBtn: {
    backgroundColor: Colors.stickyBlue, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6,
  },
  joinCallBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  waitingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30,
  },
  waitingIcon: { fontSize: 48, marginBottom: 12 },
  waitingTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.inkBlack, textAlign: 'center', marginBottom: 8 },
  waitingSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, textAlign: 'center', lineHeight: 20 },

  messagesScroll: { paddingHorizontal: 14, paddingTop: 14 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 2, backgroundColor: Colors.borderLight },
  dateText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium, backgroundColor: Colors.notebookBg, paddingHorizontal: 6 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowRight: { justifyContent: 'flex-end' },

  bubble: {
    borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  bubbleMine: { backgroundColor: Colors.stickyYellow },
  bubbleTheirs: { backgroundColor: Colors.paperWhite },
  bubbleText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack, lineHeight: 20 },
  bubbleTextMine: { color: Colors.inkBlack },
  chatImage: { width: 180, height: 130, borderRadius: Radius.sm, marginTop: 6, borderWidth: 1, borderColor: Colors.borderBlack },

  // Jitsi Card Styles inside Chat Bubble
  jitsiCard: {
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 10, minWidth: 200,
  },
  jitsiCardTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.sm, color: Colors.inkBlack, marginBottom: 2 },
  jitsiCardSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkMedium, marginBottom: 8 },
  jitsiCardJoinBtn: {
    backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.xs, paddingVertical: 8, paddingHorizontal: 12, alignItems: 'center',
  },
  jitsiCardJoinText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  timeText: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkLight, marginTop: 4 },
  timeRight: { textAlign: 'right' },

  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.paperWhite, borderTopWidth: 3, borderColor: Colors.borderBlack,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  attachBtn: {
    backgroundColor: Colors.stickyBlue, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, width: 42, height: 42, justifyContent: 'center', alignItems: 'center',
  },
  attachIcon: { fontSize: 20 },
  inputField: {
    flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack,
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderInk,
    borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10,
  },
  sendBtn: {
    backgroundColor: Colors.stickyYellow, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, width: 44, height: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  sendIcon: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  callModalContent: {
    backgroundColor: Colors.paperWhite, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 20, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, elevation: 5,
  },
  callModalTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack, marginBottom: 4 },
  callModalSub: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium, marginBottom: 16 },

  callOptionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, padding: 12, marginBottom: 10,
  },
  callOptionIcon: { fontSize: 28 },
  callOptionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  callOptionSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkMedium },

  cancelCallBtn: {
    flex: 1, backgroundColor: Colors.stickyRed, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 10, alignItems: 'center',
  },
  cancelCallText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.white },

  sendImageConfirmBtn: {
    flex: 1, backgroundColor: Colors.stickyGreen, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 10, alignItems: 'center',
  },
  sendImageConfirmText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },

  imageUrlInput: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.inkBlack,
    borderWidth: 1.5, borderColor: Colors.borderLight, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: Colors.paperCream,
  },

  // Rate Mentor Header Button
  rateHeaderBtn: {
    backgroundColor: Colors.stickyYellow, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 6,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
  },
  rateHeaderIcon: { fontSize: 18 },

  // Rate Modal Styles
  rateOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  rateCard: {
    backgroundColor: Colors.paperWhite, borderWidth: 3, borderColor: Colors.borderBlack,
    borderRadius: Radius.md, padding: 24, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 5, height: 5 }, shadowOpacity: 1, elevation: 8,
    transform: [{ rotate: '-0.5deg' }],
  },
  ratePin: { alignItems: 'center', marginTop: -36, marginBottom: 8 },
  rateTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, textAlign: 'center', marginBottom: 4 },
  rateSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, textAlign: 'center', marginBottom: 20 },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  starBtn: { padding: 4 },
  starIcon: { fontSize: 42, color: Colors.borderLight },
  starIconActive: { color: '#F5A623' },

  ratingLabel: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack,
    textAlign: 'center', marginBottom: 14,
  },

  rateCommentInput: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack,
    backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderInk,
    borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 10,
    textAlignVertical: 'top', minHeight: 72, marginBottom: 18,
  },

  rateBtnRow: { flexDirection: 'row', gap: 10 },
  rateCancelBtn: {
    flex: 1, backgroundColor: Colors.paperCream, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center',
  },
  rateCancelText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkMedium },
  rateSubmitBtn: {
    flex: 2, backgroundColor: Colors.stickyYellow, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, elevation: 3,
  },
  rateSubmitText: { fontFamily: FontFamily.extraBold, fontSize: FontSize.md, color: Colors.inkBlack },

  rateThankTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.xl, color: Colors.inkBlack, marginBottom: 6 },
  rateThankSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium },

  // Scheduled Session Banner Styles
  scheduledSessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    backgroundColor: Colors.stickyBlueLight || Colors.paperCream,
    borderBottomWidth: 3,
    borderColor: Colors.borderBlack,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scheduledSessionInfo: {
    flex: 1,
    gap: 2,
  },
  scheduledSessionTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
  },
  scheduledSessionDetail: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkDark,
  },
  scheduledSessionTime: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xxs,
    color: Colors.inkMedium,
  },
  endSessionBtn: {
    backgroundColor: Colors.stickyRed,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    elevation: 2,
  },
  endSessionBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
});

export default StudentChatScreen;