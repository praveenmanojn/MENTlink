import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import StickyToast from '../../components/common/StickyToast';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';
import { supabase } from '../../services/supabase/client';

const INITIAL_FALLBACK_STUDENTS = [
  { id: '1', name: 'Praveen Manoj', email: 'student@peerlink.dev', suspended: false },
  { id: '2', name: 'Sneha K.', email: 'sneha@uni.edu', suspended: true },
  { id: '3', name: 'Ajay Verma', email: 'ajay@uni.edu', suspended: false },
];

const AdminStudentsScreen = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const fetchStudents = async () => {
    if (!supabase) {
      setStudents(INITIAL_FALLBACK_STUDENTS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setStudents(data.map((s) => ({
          id: s.id,
          name: s.name || 'Student',
          email: s.email || 'student@peerlink.dev',
          suspended: s.is_verified === false,
        })));
      } else {
        setStudents(INITIAL_FALLBACK_STUDENTS);
      }
    } catch (e) {
      console.warn('Failed to load students from database:', e);
      setStudents(INITIAL_FALLBACK_STUDENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    if (!supabase) return;

    const channelId = `admin-students-list-${Date.now()}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: "role=eq.student" },
        () => fetchStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (message: string, type: any = 'info') => {
    setToast({ visible: true, message, type });
  };

  const toggleSuspend = async (id: string) => {
    const student = students.find((s) => s.id === id);
    const newSuspended = !student?.suspended;

    if (student) {
      showToast(newSuspended ? 'Student suspended.' : 'Student restored!', newSuspended ? 'warning' : 'success');
    }

    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, suspended: newSuspended } : s)));

    if (supabase) {
      await supabase.from('profiles').update({ is_verified: !newSuspended }).eq('id', id);
    }
  };

  const removeStudent = async (id: string) => {
    showToast('Student permanently removed.', 'error');
    setStudents((prev) => prev.filter((s) => s.id !== id));

    if (supabase) {
      await supabase.from('profiles').delete().eq('id', id);
    }
  };

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <StickyToast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((prev) => ({ ...prev, visible: false }))} />

      <NotebookBackground>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Students Directory ({students.length})</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search students by name or email..." style={{ marginBottom: 20 }} />

          {loading ? (
            <ActivityIndicator size="large" color={Colors.stickyBlue} style={{ marginTop: 40 }} />
          ) : filtered.length > 0 ? (
            <View style={styles.listContainer}>
              {filtered.map((student, idx) => (
                <View key={student.id} style={[styles.card, idx < filtered.length - 1 && styles.cardBorder, student.suspended && styles.cardSuspended]}>
                  <Avatar name={student.name} size={42} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{student.name}</Text>
                    <Text style={styles.email}>{student.email}</Text>
                    <View style={styles.badgeRow}>
                      <Badge label="Student" variant="default" />
                      {student.suspended && <Badge label="SUSPENDED" variant="error" />}
                    </View>
                  </View>
                  <View style={styles.actionCol}>
                    <TouchableOpacity
                      style={[styles.actionBtn, student.suspended ? styles.rejoinBtn : styles.suspendBtn]}
                      onPress={() => toggleSuspend(student.id)}
                    >
                      <Text style={[styles.actionText, student.suspended ? styles.rejoinText : styles.suspendText]}>
                        {student.suspended ? 'Restore' : 'Suspend'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.removeBtn]}
                      onPress={() => removeStudent(student.id)}
                    >
                      <Text style={[styles.actionText, styles.removeText]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="🎒" title="No students found" subtitle="Try searching for someone else!" />
          )}
          <View style={{ height: 80 }} />
        </ScrollView>
      </NotebookBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10,
  },
  backBtn: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  backIcon: { fontSize: 24, color: Colors.inkBlack, fontWeight: 'bold' },
  headerTitle: { fontFamily: FontFamily.extraBold, fontSize: FontSize.lg, color: Colors.inkBlack },
  scroll: { paddingHorizontal: 20, paddingTop: 18 },

  listContainer: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md, overflow: 'hidden',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  cardBorder: { borderBottomWidth: 2, borderBottomColor: Colors.borderLight },
  cardSuspended: { backgroundColor: Colors.paperCream },
  info: { flex: 1 },
  name: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack },
  email: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 6, paddingRight: 4 },

  actionCol: { gap: 8 },
  actionBtn: {
    borderWidth: 2, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0, elevation: 2,
    minWidth: 85,
  },
  removeBtn: { backgroundColor: Colors.stickyRed },
  suspendBtn: { backgroundColor: Colors.stickyYellow },
  rejoinBtn: { backgroundColor: Colors.stickyGreen },
  actionText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs },
  removeText: { color: Colors.white },
  suspendText: { color: Colors.inkBlack },
  rejoinText: { color: Colors.inkBlack },
});

export default AdminStudentsScreen;
