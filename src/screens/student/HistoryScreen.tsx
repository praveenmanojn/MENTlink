/**
 * HistoryScreen — Student — PeerLink
 * History cards as stacked sticky notes with status badges.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import NotebookBackground from '../../components/common/NotebookBackground';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

type FilterType = 'All' | 'Chats' | 'Sessions';

const HISTORY = [
  { id: '1', title: 'Quadratic Equation', mentor: 'Rahul Sharma', time: 'Today, 10:30 AM', type: 'Chats', status: 'Solved' as const },
  { id: '2', title: 'Organic Chemistry', mentor: 'Ananya R.', time: 'Yesterday, 3:10 PM', type: 'Chats', status: 'Solved' as const },
  { id: '3', title: 'Limits & Continuity', mentor: 'Karthik M.', time: 'May 17, 2025', type: 'Sessions', status: 'Solved' as const },
  { id: '4', title: 'Newton\'s Laws', mentor: 'Rahul Sharma', time: 'May 14, 2025', type: 'Chats', status: 'Pending' as const },
];

const FILTERS: FilterType[] = ['All', 'Chats', 'Sessions'];

const HistoryScreen = () => {
  const [filter, setFilter] = useState<FilterType>('All');
  const filtered = filter === 'All' ? HISTORY : HISTORY.filter((h) => h.type === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.notebookBg} />
      <NotebookBackground>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>History</Text>
          <Text style={styles.pageSub}>Your recent doubts</Text>

          {/* Filter chips */}
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* History items */}
          {filtered.length === 0 ? (
            <EmptyState title="No history yet" subtitle="Solved doubts will appear here" />
          ) : (
            filtered.map((item, idx) => (
              <TouchableOpacity key={item.id} activeOpacity={0.85}
                style={[styles.histCard, { transform: [{ rotate: idx % 2 === 0 ? '-0.5deg' : '0.5deg' }] }]}
              >
                <View style={styles.histRow}>
                  <Avatar name={item.mentor} size={36} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.histTitle}>{item.title}</Text>
                    <Text style={styles.histMentor}>{item.mentor}</Text>
                    <Text style={styles.histTime}>{item.time}</Text>
                  </View>
                  <Badge label={item.status} variant={item.status === 'Solved' ? 'success' : 'warning'} />
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* View all */}
          <TouchableOpacity style={styles.viewAll}>
            <Text style={styles.viewAllText}>View all history →</Text>
          </TouchableOpacity>
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
  pageSub: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.inkMedium, marginBottom: 18 },

  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  filterChip: {
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.paperWhite,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 2,
  },
  filterChipActive: { backgroundColor: Colors.stickyRed },
  filterText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.inkMedium },
  filterTextActive: { color: Colors.white },

  histCard: {
    backgroundColor: Colors.paperWhite,
    borderWidth: 3, borderColor: Colors.borderBlack, borderRadius: Radius.md,
    padding: 14, marginBottom: 14,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 4,
  },
  histRow: { flexDirection: 'row', alignItems: 'center' },
  histTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.inkBlack, marginBottom: 2 },
  histMentor: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.inkMedium },
  histTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xxs, color: Colors.inkFaint, marginTop: 1 },

  viewAll: {
    alignItems: 'center', padding: 14,
    borderWidth: 2.5, borderColor: Colors.borderBlack, borderRadius: Radius.sm,
    backgroundColor: Colors.paperCream,
    shadowColor: Colors.borderBlack, shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1, shadowRadius: 0, elevation: 3,
    marginTop: 4,
  },
  viewAllText: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.inkBlack },
});

export default HistoryScreen;