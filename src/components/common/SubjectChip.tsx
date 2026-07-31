/**
 * SubjectChip
 * Paper chip for academic subject tags.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const SUBJECT_COLORS: string[] = [
  Colors.stickyBlue,
  Colors.stickyYellow,
  Colors.stickyGreen,
  Colors.stickyRed,
];

interface SubjectChipProps {
  subject: string;
  index?: number;
}

const SubjectChip: React.FC<SubjectChipProps> = ({ subject, index = 0 }) => {
  const bg = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={styles.text}>{subject}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  text: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxs,
    color: Colors.inkBlack,
  },
});

export default SubjectChip;
