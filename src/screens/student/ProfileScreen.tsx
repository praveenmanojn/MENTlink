import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import Button from '../../components/common/Button';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Student Profile</Text>
        <Text style={styles.subtitle}>Manage your academic preferences and account settings.</Text>

        <View style={styles.card}>
          <Text style={styles.emailLabel}>Logged in as:</Text>
          <Text style={styles.emailValue}>{user?.email || 'student@university.edu'}</Text>
          <Text style={styles.roleTag}>Role: {user?.role || 'student'}</Text>

          <Button
            title="Log Out"
            onPress={logout}
            variant="outline"
            style={styles.logoutBtn}
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
  container: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  emailValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: 2,
  },
  roleTag: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  logoutBtn: {
    width: '100%',
  },
});

export default ProfileScreen;
