/**
 * ScheduledCallCard — In-chat card for Audio/Video Sessions
 * Displays call mode, live countdown timer, status badge, and "Join Call" button.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CallSession } from '../types/call';
import PinWidget from './common/PinWidget';
import Button from './common/Button';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Radius } from '../theme/decorations';
import { RootStackNavigationProp } from '../types/navigation';

interface ScheduledCallCardProps {
  session: CallSession;
  currentUserId: string;
  currentUserName: string;
}

export const ScheduledCallCard: React.FC<ScheduledCallCardProps> = ({
  session,
  currentUserId,
  currentUserName,
}) => {
  const navigation = useNavigation<RootStackNavigationProp<'CallScreen'>>();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const startTimeMs = new Date(session.start_time).getTime();
  const isReady = Date.now() >= startTimeMs && session.status !== 'completed' && session.status !== 'cancelled';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';

  useEffect(() => {
    const updateCountdown = () => {
      const diff = Math.max(0, Math.floor((startTimeMs - Date.now()) / 1000));
      setTimeLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [startTimeMs]);

  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return 'Ready to Join!';
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `Starts in ${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleJoin = () => {
    navigation.navigate('CallScreen', {
      sessionId: session.id,
      callType: session.call_type,
      channelId: session.question_id,
      userId: currentUserId,
      userName: currentUserName,
    });
  };

  const getCardBg = () => {
    if (isCompleted) return Colors.paperCream;
    if (isCancelled) return Colors.statusErrorBg;
    return session.call_type === 'video' ? Colors.stickyRedLight : Colors.stickyBlueLight;
  };

  const getPinColor = () => {
    if (session.call_type === 'video') return Colors.pinRed;
    return Colors.pinBlue;
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.pin}><PinWidget color={getPinColor()} size={18} /></View>
      <View style={[styles.card, { backgroundColor: getCardBg() }]}>
        <View style={styles.headerRow}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeText}>
              {session.call_type === 'video' ? '📹 Video Call' : '🎙 Audio Call'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            isCompleted && { backgroundColor: Colors.stickyGreen },
            isCancelled && { backgroundColor: Colors.stickyRed },
            !isCompleted && !isCancelled && isReady && { backgroundColor: Colors.stickyYellow },
          ]}>
            <Text style={styles.statusText}>{session.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.durationText}>Duration: {session.duration_minutes} minutes</Text>
        
        {!isCompleted && !isCancelled && (
          <Text style={styles.timerText}>{formatCountdown(timeLeft)}</Text>
        )}

        {isCompleted && <Text style={styles.completedText}>Call session finished ✅</Text>}
        {isCancelled && <Text style={styles.cancelledText}>Call session cancelled ❌</Text>}

        {!isCompleted && !isCancelled && (
          <Button
            title={isReady ? 'Join Call Now 🚀' : 'Waiting for Start Time...'}
            disabled={!isReady}
            variant={session.call_type === 'video' ? 'danger' : 'primary'}
            onPress={handleJoin}
            style={styles.joinBtn}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
  pin: { marginBottom: -9, zIndex: 10 },
  card: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modeBadge: {
    backgroundColor: Colors.paperWhite, borderWidth: 1.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  modeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },
  statusBadge: {
    backgroundColor: Colors.paperCream, borderWidth: 1.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusText: { fontFamily: FontFamily.bold, fontSize: FontSize.xxs, color: Colors.inkBlack },
  durationText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkDark, marginBottom: 4 },
  timerText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack, marginVertical: 6 },
  completedText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium, marginTop: 4 },
  cancelledText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.statusError, marginTop: 4 },
  joinBtn: { marginTop: 8 },
});

export default ScheduledCallCard;
