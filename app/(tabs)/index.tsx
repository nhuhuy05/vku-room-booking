import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { RoomCard } from '../../components/RoomCard';

const FILTER_TYPES = [
  { key: 'all', label: 'Tất cả phòng', icon: 'apps-outline' },
  { key: 'classroom', label: 'Phòng học', icon: 'school-outline' },
  { key: 'lab', label: 'Lab máy tính', icon: 'desktop-outline' },
  { key: 'seminar', label: 'Seminar / Họp', icon: 'people-outline' },
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { rooms, isRefreshing, refresh, lastUpdated } = useRoomStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    refresh();
  }, []);

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.type === filter);
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 11) return '☀️ Chào buổi sáng';
    if (h < 13) return '🌤 Chào buổi trưa';
    if (h < 18) return '🌅 Chào buổi chiều';
    return '🌙 Chào buổi tối';
  };

  return (
    <View style={styles.root}>
      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <RoomCard room={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // ── 60fps Optimization Props ──
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting()},</Text>
                <Text style={styles.username}>{user?.name?.split(' ').pop()} 👋</Text>
                <Text style={styles.userInfo}>
                  {user?.mssv} · {user?.class}
                </Text>
              </View>
              <TouchableOpacity
                id="btn-notif"
                style={styles.notifBtn}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ── Stats Banner ── */}
            <View style={styles.statsBanner}>
              {[
                { icon: 'business-outline', color: Colors.primary, num: rooms.length, label: 'Tổng phòng' },
                { icon: 'checkmark-circle-outline', color: Colors.statusAvailable, num: availableCount, label: 'Đang trống' },
                { icon: 'time-outline', color: Colors.statusOccupied, num: occupiedCount, label: 'Đang dùng' },
              ].map((s, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={styles.statSep} />}
                  <View style={styles.statItem}>
                    <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                      <Ionicons name={s.icon as any} size={16} color={s.color} />
                    </View>
                    <Text style={[styles.statNum, i > 0 && { color: s.color }]}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>

            {/* ── Section title ── */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Danh sách phòng VKU</Text>
              {lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Cập nhật {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>

            {/* ── Filter chips ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {FILTER_TYPES.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    id={`filter-${f.key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFilter(f.key)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={f.icon as any}
                      size={14}
                      color={active ? '#fff' : Colors.textMuted}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Không có phòng phù hợp</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  greeting: { ...Typography.bodyMd, color: Colors.textMuted },
  username: { ...Typography.h2, color: Colors.textPrimary, marginTop: 2 },
  userInfo: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statsBanner: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: { ...Typography.h2, color: Colors.textPrimary },
  statLabel: { ...Typography.micro, color: Colors.textMuted },
  statSep: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  lastUpdated: { ...Typography.caption, color: Colors.textMuted },

  filterScroll: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.md, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.label, color: Colors.textMuted },
  chipTextActive: { color: '#fff' },

  listContent: { paddingHorizontal: Spacing.md, paddingBottom: 28 },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.textMuted,
  },
});
