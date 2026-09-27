import React, { useEffect, useState, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ScrollView, Image, ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useRoomStore } from '../../store/roomStore';
import { Room } from '../../types';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { getRoomImage } from '../../constants/roomImages';

const FILTER_TYPES = [
  { key: 'all',       label: 'Tất cả',    icon: 'apps-outline' },
  { key: 'classroom', label: 'Phòng học', icon: 'school-outline' },
  { key: 'lab',       label: 'Lab',       icon: 'desktop-outline' },
  { key: 'seminar',   label: 'Seminar',   icon: 'people-outline' },
];

/* ─── Status badge ────────────────────────────────────── */
function StatusBadge({ status }: { status: Room['status'] }) {
  const meta = {
    available:   { label: 'Trống',     color: Colors.statusAvailable },
    occupied:    { label: 'Đang dùng', color: Colors.statusOccupied },
    maintenance: { label: 'Bảo trì',  color: Colors.statusMaintenance },
  }[status];
  return (
    <View style={[badge.wrap, { backgroundColor: meta.color + '22', borderColor: meta.color + '55' }]}>
      <View style={[badge.dot, { backgroundColor: meta.color }]} />
      <Text style={[badge.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  dot:  { width: 5, height: 5, borderRadius: 2.5 },
  text: { ...Typography.micro },
});

/* ─── Room Card with Image ────────────────────────────── */
const RoomCard = memo(function RoomCard({ room }: { room: Room }) {
  const isAvail = room.status === 'available';
  const image = getRoomImage(room.id, room.type);

  return (
    <TouchableOpacity
      id={`room-card-${room.id}`}
      style={styles.card}
      onPress={() => router.push(`/room/${room.id}`)}
      activeOpacity={0.82}
    >
      {/* ── Photo banner ── */}
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.roomImage} resizeMode="cover" />
        {/* Dark gradient overlay */}
        <View style={styles.imageOverlay} />
        {/* Status badge on top of image */}
        <View style={styles.imageBadge}>
          <StatusBadge status={room.status} />
        </View>
        {/* Building tag */}
        <View style={styles.buildingTag}>
          <Ionicons name="location-outline" size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.buildingTagText}>{room.building} · Tầng {room.floor}</Text>
        </View>
      </View>

      {/* ── Card body ── */}
      <View style={styles.cardBody}>
        {/* Left accent stripe for available */}
        {isAvail && <View style={styles.stripe} />}

        <View style={styles.bodyInner}>
          {/* Room name & meta */}
          <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color={Colors.textMuted} />
              <Text style={styles.metaText}>{room.capacity} chỗ</Text>
            </View>
            <View style={styles.metaDot} />
            <View style={styles.metaItem}>
              <Ionicons
                name={room.type === 'lab' ? 'desktop-outline' : room.type === 'seminar' ? 'chatbubbles-outline' : 'book-outline'}
                size={13} color={Colors.textMuted}
              />
              <Text style={styles.metaText}>
                {room.type === 'lab' ? 'Lab máy tính' : room.type === 'seminar' ? 'Seminar' : 'Lớp học'}
              </Text>
            </View>
          </View>

          {/* Amenity pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            {room.amenities.slice(0, 3).map((a, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{a}</Text>
              </View>
            ))}
            {room.amenities.length > 3 && (
              <View style={[styles.pill, { backgroundColor: Colors.accentGlow, borderColor: Colors.borderGoldGlow }]}>
                <Text style={[styles.pillText, { color: Colors.accent }]}>+{room.amenities.length - 3}</Text>
              </View>
            )}
          </ScrollView>

          {/* CTA row */}
          {isAvail && (
            <View style={styles.ctaRow}>
              <Text style={styles.ctaText}>Đặt phòng ngay</Text>
              <Ionicons name="arrow-forward-circle" size={18} color={Colors.primary} />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

/* ─── Home Screen ─────────────────────────────────────── */
export default function HomeScreen() {
  const { user } = useAuthStore();
  const { rooms, isRefreshing, refresh, lastUpdated } = useRoomStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => { refresh(); }, []);

  const filtered = filter === 'all' ? rooms : rooms.filter((r) => r.type === filter);
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const occupiedCount  = rooms.filter((r) => r.status === 'occupied').length;

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
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh}
            tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>{greeting()},</Text>
                <Text style={styles.username}>{user?.name?.split(' ').pop()} 👋</Text>
                <Text style={styles.userInfo}>{user?.mssv} · {user?.class}</Text>
              </View>
              <TouchableOpacity id="btn-notif" style={styles.notifBtn}
                onPress={() => router.push('/room/A101')}>
                <Ionicons name="notifications-outline" size={20} color={Colors.textSecondary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
            </View>

            {/* ── Stats Banner ── */}
            <View style={styles.statsBanner}>
              {[
                { icon: 'business-outline',         color: Colors.primary,          num: rooms.length,     label: 'Tổng phòng' },
                { icon: 'checkmark-circle-outline',  color: Colors.statusAvailable,  num: availableCount,   label: 'Đang trống' },
                { icon: 'time-outline',              color: Colors.statusOccupied,   num: occupiedCount,    label: 'Đang dùng' },
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
              <Text style={styles.sectionTitle}>Danh sách phòng</Text>
              {lastUpdated && (
                <Text style={styles.lastUpdated}>
                  Cập nhật {lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>

            {/* ── Filter chips ── */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {FILTER_TYPES.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key} id={`filter-${f.key}`}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setFilter(f.key)} activeOpacity={0.75}
                  >
                    <Ionicons name={f.icon as any} size={14}
                      color={active ? '#fff' : Colors.textMuted} />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
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
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.md,
  },
  greeting: { ...Typography.bodyMd, color: Colors.textMuted },
  username: { ...Typography.h2, color: Colors.textPrimary, marginTop: 2 },
  userInfo: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary, borderWidth: 1.5, borderColor: Colors.bg,
  },

  statsBanner: {
    flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 12, elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statNum: { ...Typography.h2, color: Colors.textPrimary },
  statLabel: { ...Typography.micro, color: Colors.textMuted },
  statSep: { width: 1, backgroundColor: Colors.border, marginVertical: 8 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, marginBottom: Spacing.sm,
  },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  lastUpdated: { ...Typography.caption, color: Colors.textMuted },

  filterScroll: { marginBottom: Spacing.sm },
  filterContent: { paddingHorizontal: Spacing.md, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.label, color: Colors.textMuted },
  chipTextActive: { color: '#fff' },

  listContent: { paddingHorizontal: Spacing.md },

  /* ── Card with image ── */
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 12, elevation: 4,
  },

  /* Image section */
  imageWrap: { width: '100%', height: 160, position: 'relative' },
  roomImage: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  imageBadge: {
    position: 'absolute', top: 10, right: 10,
  },
  buildingTag: {
    position: 'absolute', bottom: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  buildingTagText: {
    ...Typography.micro,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  /* Body section */
  cardBody: { flexDirection: 'row', overflow: 'hidden' },
  stripe: {
    width: 3, backgroundColor: Colors.primary,
  },
  bodyInner: { flex: 1, padding: Spacing.md },
  roomName: { ...Typography.h4, color: Colors.textPrimary, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...Typography.caption, color: Colors.textSecondary },
  metaDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: Colors.border, marginHorizontal: 8,
  },
  pill: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  pillText: { ...Typography.micro, color: Colors.textSecondary },
  ctaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    gap: 6, marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  ctaText: { ...Typography.label, color: Colors.primary },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { ...Typography.body, color: Colors.textMuted },
});
