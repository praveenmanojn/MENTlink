import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthStackNavigationProp } from '../../types/navigation';
import { theme } from '../../theme';
import Button from '../../components/common/Button';

const { width } = Dimensions.get('window');

const FEATURES = [
  {
    id: '1',
    icon: '⚡',
    title: 'Instant Doubt Resolution',
    description: 'Ask questions & connect with top-performing peer mentors in under 5 minutes.',
    color: '#EEF2FF',
    iconBg: '#4F46E5',
  },
  {
    id: '2',
    icon: '💬',
    title: '1-on-1 Interactive Mentoring',
    description: 'Engage in dedicated chat sessions with live code sharing, voice, & diagrams.',
    color: '#ECFDF5',
    iconBg: '#10B981',
  },
  {
    id: '3',
    icon: '⭐',
    title: 'Verified Student Experts',
    description: 'Learn from highly rated peers validated by academic excellence & student feedback.',
    color: '#FFFBEB',
    iconBg: '#F59E0B',
  },
];

const SplashScreen = () => {
  const navigation = useNavigation<AuthStackNavigationProp<'Splash'>>();

  const handleGetStarted = () => {
    navigation.navigate('RoleSelection');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Branding Section */}
        <View style={styles.heroContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎓</Text>
            <Text style={styles.logoText}>MENT<Text style={styles.logoHighlight}>link</Text></Text>
          </View>

          <Text style={styles.headline}>
            Empowering Students Through <Text style={styles.gradientText}>Peer Mentorship</Text>
          </Text>

          <Text style={styles.subtitle}>
            Bridge the learning gap with real-time academic guidance from verified student mentors who have excelled in your exact courses.
          </Text>
        </View>

        {/* Feature Cards Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Why Choose MENTlink?</Text>
          {FEATURES.map((item) => (
            <View key={item.id} style={[styles.featureCard, { backgroundColor: item.color }]}>
              <View style={[styles.featureIconBox, { backgroundColor: item.iconBg }]}>
                <Text style={styles.featureIconText}>{item.icon}</Text>
              </View>
              <View style={styles.featureTextBox}>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Community Stats Bar */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1,200+</Text>
            <Text style={styles.statLabel}>Doubts Solved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.9/5</Text>
            <Text style={styles.statLabel}>Peer Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>&lt; 5 min</Text>
            <Text style={styles.statLabel}>Avg Match Time</Text>
          </View>
        </View>

        {/* Action Buttons / Navigation Redirects */}
        <View style={styles.ctaContainer}>
          <Button
            title="Get Started — It's Free"
            onPress={handleGetStarted}
            size="lg"
            variant="primary"
            style={styles.primaryButton}
          />

          <Button
            title="I already have an account (Log In)"
            onPress={handleLogin}
            size="lg"
            variant="outline"
            style={styles.secondaryButton}
          />
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
  heroContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  logoIcon: {
    fontSize: 22,
    marginRight: theme.spacing.xs,
  },
  logoText: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  logoHighlight: {
    color: theme.colors.primary,
  },
  headline: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: theme.spacing.sm,
  },
  gradientText: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.xs,
  },
  featuresContainer: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  featureIconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureIconText: {
    fontSize: 22,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.muted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
  },
  ctaContainer: {
    gap: theme.spacing.sm,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});

export default SplashScreen;