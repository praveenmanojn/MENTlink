/**
 * ScheduleCallSheet — Modal for Mentors to schedule an Audio or Video Call
 * Paper / Sticky-Note visual theme with react-hook-form integration.
 */
import React from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import PinWidget from './common/PinWidget';
import Button from './common/Button';
import { Colors } from '../theme/colors';
import { FontFamily, FontSize } from '../theme/typography';
import { Radius } from '../theme/decorations';
import { CallType } from '../types/call';
import { useScheduleCall } from '../hooks/useScheduleCall';

interface ScheduleCallFormData {
  callType: CallType;
  durationMinutes: number;
  startDelayMinutes: number;
}

interface ScheduleCallSheetProps {
  visible: boolean;
  onClose: () => void;
  questionId: string;
  mentorId: string;
  studentId: string;
}

const DURATIONS = [2, 5, 10, 15];

export const ScheduleCallSheet: React.FC<ScheduleCallSheetProps> = ({
  visible,
  onClose,
  questionId,
  mentorId,
  studentId,
}) => {
  const scheduleCallMutation = useScheduleCall();

  const { control, handleSubmit, watch, setValue } = useForm<ScheduleCallFormData>({
    defaultValues: {
      callType: 'audio',
      durationMinutes: 5,
      startDelayMinutes: 0, // 0 = Now, 1 = in 1 min, 5 = in 5 mins
    },
  });

  const selectedCallType = watch('callType');
  const selectedDuration = watch('durationMinutes');
  const selectedDelay = watch('startDelayMinutes');

  const onSubmit = async (data: ScheduleCallFormData) => {
    const startTime = new Date(Date.now() + data.startDelayMinutes * 60000).toISOString();

    try {
      await scheduleCallMutation.mutateAsync({
        question_id: questionId,
        mentor_id: mentorId,
        student_id: studentId,
        start_time: startTime,
        duration_minutes: data.durationMinutes,
        call_type: data.callType,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to schedule call:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.cardContainer}>
                <View style={styles.pin}><PinWidget color={Colors.pinRed} size={22} /></View>
                <View style={styles.sheet}>
                  <Text style={styles.title}>Schedule Live Call</Text>
                  <Text style={styles.subtitle}>Set call type & duration for doubt resolution</Text>

                  {/* Call Type Selection */}
                  <Text style={styles.sectionLabel}>Call Mode</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.toggleBtn,
                        selectedCallType === 'audio' && styles.toggleBtnActiveAudio,
                      ]}
                      onPress={() => setValue('callType', 'audio')}
                    >
                      <Text style={[styles.toggleText, selectedCallType === 'audio' && styles.textWhite]}>
                        🎙 Audio Call
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.toggleBtn,
                        selectedCallType === 'video' && styles.toggleBtnActiveVideo,
                      ]}
                      onPress={() => setValue('callType', 'video')}
                    >
                      <Text style={[styles.toggleText, selectedCallType === 'video' && styles.textWhite]}>
                        📹 Video Call
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Duration Picker */}
                  <Text style={styles.sectionLabel}>Duration (Minutes)</Text>
                  <View style={styles.chipRow}>
                    {DURATIONS.map((dur) => (
                      <TouchableOpacity
                        key={dur}
                        activeOpacity={0.8}
                        style={[
                          styles.chip,
                          selectedDuration === dur && styles.chipActive,
                        ]}
                        onPress={() => setValue('durationMinutes', dur)}
                      >
                        <Text style={[styles.chipText, selectedDuration === dur && styles.textWhite]}>
                          {dur} Min
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Start Delay */}
                  <Text style={styles.sectionLabel}>Start Time</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.chip, selectedDelay === 0 && styles.chipActive]}
                      onPress={() => setValue('startDelayMinutes', 0)}
                    >
                      <Text style={[styles.chipText, selectedDelay === 0 && styles.textWhite]}>⚡ Right Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.chip, selectedDelay === 2 && styles.chipActive]}
                      onPress={() => setValue('startDelayMinutes', 2)}
                    >
                      <Text style={[styles.chipText, selectedDelay === 2 && styles.textWhite]}>In 2 Mins</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.chip, selectedDelay === 5 && styles.chipActive]}
                      onPress={() => setValue('startDelayMinutes', 5)}
                    >
                      <Text style={[styles.chipText, selectedDelay === 5 && styles.textWhite]}>In 5 Mins</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Submit / Cancel Buttons */}
                  <View style={styles.actionRow}>
                    <Button
                      title="Cancel"
                      variant="outline"
                      onPress={onClose}
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Schedule Call →"
                      variant="danger"
                      loading={scheduleCallMutation.isPending}
                      onPress={handleSubmit(onSubmit)}
                      style={{ flex: 1.4 }}
                    />
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', paddingHorizontal: 16, paddingBottom: 24,
  },
  cardContainer: { alignItems: 'center' },
  pin: { marginBottom: -11, zIndex: 10 },
  sheet: {
    backgroundColor: Colors.paperCream,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 20, width: '100%',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 5,
  },
  title: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  subtitle: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium, marginBottom: 16 },

  sectionLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    backgroundColor: Colors.paperWhite, borderWidth: 2.5, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  toggleBtnActiveAudio: { backgroundColor: Colors.stickyBlue },
  toggleBtnActiveVideo: { backgroundColor: Colors.stickyRed },
  toggleText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    flex: 1, paddingVertical: 8, alignItems: 'center',
    backgroundColor: Colors.paperWhite, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
  },
  chipActive: { backgroundColor: Colors.inkBlack },
  chipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  textWhite: { color: Colors.white },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
});

export default ScheduleCallSheet;
