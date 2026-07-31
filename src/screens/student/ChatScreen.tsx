/**
 * ChatScreen — Student — PeerLink
 * Chat bubbles as paper notes. Sent messages yellow, received white.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import AvailabilityBadge from '../../components/common/AvailabilityBadge';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const MOCK_MESSAGES = [
  { id: '1', sender: 'mentor', text: "Hi Praveen! I can help you with this doubt.", time: '10:30 AM' },
  { id: '2', sender: 'student', text: "Thank you! Here is the question image.", time: '10:31 AM' },
  { id: '3', sender: 'mentor', text: "Got it! Let me explain step by step.", time: '10:32 AM' },
  { id: '4', sender: 'mentor', text: "▶ 0:45", time: '10:33 AM', isAudio: true },
];

const ChatScreen = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: String(Date.now()), sender: 'student', text: input.trim(), time: 'Now' }]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
            <Avatar name="Rahul Sharma" size={40} />
            <View style={styles.headerInfo}>
              <Text style={styles.mentorName}>Rahul Sharma</Text>
              <AvailabilityBadge available={true} />
            </View>
            <Text style={styles.menuDots}>⋮</Text>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messagesScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dateDivider}>
              <View style={styles.dateLine} />
              <Text style={styles.dateText}>Today</Text>
              <View style={styles.dateLine} />
            </View>

            {messages.map((msg) => {
              const isMine = msg.sender === 'student';
              return (
                <View key={msg.id} style={[styles.msgRow, isMine && styles.msgRowRight]}>
                  {!isMine && <Avatar name="Rahul Sharma" size={30} />}
                  <View style={{ maxWidth: '72%' }}>
                    <View style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleTheirs,
                      msg.isAudio && styles.audioBubble,
                    ]}>
                      <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{msg.text}</Text>
                    </View>
                    <Text style={[styles.timeText, isMine && styles.timeRight]}>{msg.time}</Text>
                  </View>
                </View>
              );
            })}
            <View style={{ height: 12 }} />
          </ScrollView>

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.inputField}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.inkFaint}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.attachBtn}><Text style={styles.attachIcon}>⊕</Text></TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendIcon}>▶</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },

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
  mentorName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  menuDots: { fontSize: 22, color: Colors.inkMedium },

  messagesScroll: { paddingHorizontal: 14, paddingTop: 14 },
  dateDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 2, backgroundColor: Colors.borderLight },
  dateText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium, backgroundColor: Colors.notebookBg, paddingHorizontal: 6 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 12 },
  msgRowRight: { flexDirection: 'row-reverse' },

  bubble: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 12, shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  bubbleMine: { backgroundColor: Colors.stickyYellow },
  bubbleTheirs: { backgroundColor: Colors.paperWhite },
  audioBubble: { backgroundColor: Colors.stickyBlueLight },
  bubbleText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkBlack, lineHeight: 20 },
  bubbleTextMine: { color: Colors.inkBlack },
  timeText: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 4, marginLeft: 4 },
  timeRight: { textAlign: 'right', marginRight: 4 },

  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.paperWhite,
    borderTopWidth: 3, borderColor: Colors.borderBlack,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  inputField: {
    flex: 1, backgroundColor: Colors.paperCream,
    borderWidth: 2, borderColor: Colors.borderInk, borderRadius: Radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.inkBlack,
  },
  attachBtn: {
    width: 40, height: 40, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.paperCream,
  },
  attachIcon: { fontSize: 20, color: Colors.inkMedium },
  sendBtn: {
    width: 40, height: 40, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.inkBlack,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  sendIcon: { fontSize: 16, color: Colors.white },
});

export default ChatScreen;