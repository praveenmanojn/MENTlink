/**
 * UsersScreen — Admin — PeerLink
 * User list on notebook paper rows with shortcuts to Mentors & Students directories.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { supabase } from '../../services/supabase/client';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  verified: 'success', pending: 'warning', suspended: 'error',
};

const DEFAULT_DEMO_USERS = [
  { id: 'u1', name: 'Rahul Sharma', email: 'rahul@mentlink.dev', role: 'Mentor', status: 'verified' },
  { id: 'u2', name: 'Praveen Manoj', email: 'praveen@mentlink.dev', role: 'Student', status: 'verified' },
  { id: 'u3', name: 'Ananya R.', email: 'ananya@mentlink.dev', role: 'Mentor', status: 'verified' },
  { id: 'u4', name: 'Sneha K.', email: 'sneha@mentlink.dev', role: 'Student', status: 'suspended' },
  { id: 'u5', name: 'Karthik M.', email: 'karthik@mentlink.dev', role: 'Mentor', status: 'suspended' },
];

const UsersScreen = () => {
  const navigation = useNavigation<any>();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'mentor' | 'student'>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let dbUsers: any[] = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          dbUsers = data.map((u) => ({
            id: u.id,
            name: u.name || 'User',
            email: u.email || 'user@mentlink.dev',
            role: (u.role || 'student').charAt(0).toUpperCase() + (u.role || 'student').slice(1),
            status: u.is_verified === false ? 'suspended' : 'verified',
          }));
        }
      }

      // Merge DB users with default demo accounts if not already present
      const dbEmails = new Set(dbUsers.map((u) => u.email.toLowerCase()));
      const missingDemos = DEFAULT_DEMO_USERS.filter((d) => !dbEmails.has(d.email.toLowerCase()));
      const combined = [...dbUsers, ...missingDemos];

      setUsers(combined);
    } catch (e) {
      console.warn('Error fetching all users for admin:', e);
      setUsers(DEFAULT_DEMO_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (!supabase) return;

    const channelId = `admin-users-list-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role.toLowerCase() === filterRole;
    return matchesSearch && matchesRole;
  });

  const verifyUser = async (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'verified' } : u)));
    if (supabase) {
      await supabase.from('profiles').update({ is_verified: true }).eq('id', id);
    }
  };

  const suspendUser = async (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: 'suspended' } : u)));
    if (supabase) {
      await supabase.from('profiles').update({ is_verified: false }).eq('id', id);
    }
  };

  const mentorCount = users.filter((u) => u.role.toLowerCase() === 'mentor').length;
  const studentCount = users.filter((u) => u.role.toLowerCase() === 'student').length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>User Management</Text>
          <Text style={styles.pageSub}>
            {users.length} Total Accounts ({mentorCount} Mentors, {studentCount} Students)
          </Text>

          {/* Quick Directory Shortcuts */}
          <View style={styles.shortcutRow}>
            <TouchableOpacity
              style={[styles.shortcutBtn, { backgroundColor: Colors.stickyGreen }]}
              onPress={() => navigation.navigate('AdminMentors')}
            >
              <Text style={styles.shortcutBtnText}>👨‍🏫 Mentors Directory →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shortcutBtn, { backgroundColor: Colors.stickyBlue }]}
              onPress={() => navigation.navigate('AdminStudents')}
            >
              <Text style={styles.shortcutBtnText}>🎓 Students Directory →</Text>
            </TouchableOpacity>
          </View>

          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or email..." style={styles.search} />

          {/* Role Filter Chips */}
          <View style={styles.filterRow}>
            {(['all', 'mentor', 'student'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, filterRole === r && styles.filterChipActive]}
                onPress={() => setFilterRole(r)}
              >
                <Text style={[styles.filterChipText, filterRole === r && styles.textWhite]}>
                  {r.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={Colors.stickyBlue} style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.userList}>
              {filtered.map((user, idx) => (
                <View key={user.id} style={[styles.userCard, idx < filtered.length - 1 && styles.userCardBorder]}>
                  <Avatar name={user.name} size={42} />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userBadgeRow}>
                      <Badge label={user.role} variant="info" />
                      <Badge label={user.status.toUpperCase()} variant={STATUS_VARIANT[user.status] ?? 'default'} />
                    </View>
                  </View>
                  <View style={styles.actionCol}>
                    {user.status !== 'verified' && (
                      <TouchableOpacity style={styles.verifyBtn} onPress={() => verifyUser(user.id)}>
                        <Text style={styles.verifyText}>✓</Text>
                      </TouchableOpacity>
                    )}
                    {user.status !== 'suspended' && (
                      <TouchableOpacity style={styles.suspendBtn} onPress={() => suspendUser(user.id)}>
                        <Text style={styles.suspendText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

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
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 16 },

  shortcutRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  shortcutBtn: {
    flex: 1, borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, elevation: 2,
  },
  shortcutBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },

  search: { marginBottom: 12 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    backgroundColor: Colors.paperWhite, borderWidth: 2, borderColor: Colors.borderBlack,
    borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: Colors.inkBlack },
  filterChipText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkBlack },
  textWhite: { color: Colors.white },

  userList: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  userCardBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  userInfo: { flex: 1 },
  userName: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  userEmail: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 1 },
  userBadgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  actionCol: { gap: 6 },
  verifyBtn: {
    width: 32, height: 32, borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stickyGreen,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  verifyText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
  suspendBtn: {
    width: 32, height: 32, borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.stickyRed,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  suspendText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.white },
});

export default UsersScreen;