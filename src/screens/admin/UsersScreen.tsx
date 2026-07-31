/**
 * UsersScreen — Admin — PeerLink
 * User list on notebook paper rows. Verify/Suspend as paper action buttons.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

const USERS = [
  { id: '1', name: 'Praveen Manoj', role: 'Student', status: 'verified', email: 'student@peerlink.dev' },
  { id: '2', name: 'Rahul Sharma', role: 'Mentor', status: 'verified', email: 'teacher@peerlink.dev' },
  { id: '3', name: 'Ananya R.', role: 'Mentor', status: 'pending', email: 'ananya@uni.edu' },
  { id: '4', name: 'Karthik M.', role: 'Mentor', status: 'pending', email: 'karthik@uni.edu' },
  { id: '5', name: 'Sneha K.', role: 'Student', status: 'suspended', email: 'sneha@uni.edu' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  verified: 'success', pending: 'warning', suspended: 'error',
};

const UsersScreen = () => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(USERS);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase())
  );

  const verifyUser = (id: string) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'verified' } : u));
  const suspendUser = (id: string) => setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: 'suspended' } : u));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>User Management</Text>
          <Text style={styles.pageSub}>{users.length} users on platform</Text>

          <SearchBar value={search} onChangeText={setSearch} placeholder="Search users..." style={styles.search} />

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
  search: { marginBottom: 18 },

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