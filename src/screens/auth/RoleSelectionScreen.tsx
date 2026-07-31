import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import { theme } from '../../theme';
import Button from '../../components/common/Button';

export const RoleSelectionScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'RoleSelection'>>();

  const handleSelectRole = (role: 'student' | 'mentor') => {
    navigation.navigate('Register', { role });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.headline}>Choose Your Journey</Text>
        <Text style={styles.subtitle}>
          How would you like to participate in the MENTlink community?
        </Text>

        {/* Student Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSelectRole('student')}
          style={[styles.roleCard, styles.studentCard]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.iconText}>🎓</Text>
            </View>
            <View style={styles.badgeLabel}>
              <Text style={styles.badgeText}>Most Popular</Text>
            </View>
          </View>

          <Text style={styles.roleTitle}>I'm a Student</Text>
          <Text style={styles.roleDescription}>
            I want to ask doubts, connect with peer mentors, join live study sessions, and excel in my courses.
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ Unlimited doubt submissions</Text>
            <Text style={styles.bulletItem}>✓ Match with top peer mentors</Text>
            <Text style={styles.bulletItem}>✓ Access study notes & session history</Text>
          </View>

          <Button
            title="Continue as Student →"
            onPress={() => handleSelectRole('student')}
            variant="primary"
            style={styles.cardButton}
          />
        </TouchableOpacity>

        {/* Mentor Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleSelectRole('mentor')}
          style={[styles.roleCard, styles.mentorCard]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, { backgroundColor: '#ECFDF5' }]}>
              <Text style={styles.iconText}>👨‍🏫</Text>
            </View>
            <View style={[styles.badgeLabel, { backgroundColor: '#ECFDF5' }]}>
              <Text style={[styles.badgeText, { color: theme.colors.secondaryDark }]}>High Impact</Text>
            </View>
          </View>

          <Text style={styles.roleTitle}>I'm a Peer Mentor</Text>
          <Text style={styles.roleDescription}>
            I want to share my academic expertise, answer queries, earn student ratings, and enhance my leadership resume.
          </Text>

          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>✓ Guide junior & peer students</Text>
            <Text style={styles.bulletItem}>✓ Build verified mentor credentials</Text>
            <Text style={styles.bulletItem}>✓ Flexible session scheduling</Text>
          </View>

          <Button
            title="Continue as Mentor →"
            onPress={() => handleSelectRole('mentor')}
            variant="secondary"
            style={styles.cardButton}
          />
        </TouchableOpacity>

        {/* Footer Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  headline: {
    fontSize: 26,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  roleCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  studentCard: {
    borderColor: theme.colors.primaryLight,
  },
  mentorCard: {
    borderColor: theme.colors.secondary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  badgeLabel: {
    backgroundColor: theme.colors.primaryBg,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roleDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  bulletList: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  bulletItem: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
  cardButton: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loginText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
});

export default RoleSelectionScreen;