import React, { useState, useMemo, memo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoomStore } from '../../store/roomStore';
import { Room } from '../../types';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { getRoomImage } from '../../constants/roomImages';

const BUILDINGS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Tòa A', label: 'Tòa A' },
  { key: 'Tòa B', label: 'Tòa B' },
  { key: 'Tòa C', label: 'Tòa C' },
];
const ROOM_TYPES = [
  { key: 'all',       label: 'Tất cả',    icon: 'apps-outline' },
  { key: 'classroom', label: 'Phòng học', icon: 'school-outline' },
  { key: 'lab',       label: 'Lab',        icon: 'desktop-outline' },
  { key: 'seminar',   label: 'Seminar',    icon: 'people-outline' },
];
const STATUS_FILTERS = [
  { key: 'all',       label: 'Tất cả' },
  { key: 'available', label: 'Trống' },
  { key: 'occupied',  label: 'Đang dùng' },
];

/* ─── Chip ────────────────────────────────────────────── */
function Chip({ label, active, onPress, icon }: {
  label: string; active: boolean; onPress: () => void; icon?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress} activeOpacity={0.75}
    >
      {icon && <Ionicons name={icon as any} size={13} color={active ? '#fff' : Colors.textMuted} />}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ─── Result Card ─────────────────────────────────────── */
const SearchRoomCard = memo(function SearchRoomCard({ room }: { room: Room }) {
  const isAvail = room.status === 'available';
  const statusMeta = {
    available:   { label: 'Trống',      color: Colors.statusAvailable, icon: 'checkmark-circle' },
    occupied:    { label: 'Đang dùng',  color: Colors.statusOccupied,  icon: 'time' },
    maintenance: { label: 'Bảo trì',    color: Colors.statusMaintenance, icon: 'construct' },
  }[room.status];

  const typeIcon = room.type === 'lab' ? 'desktop-outline'
    : room.type === 'seminar' ? 'people-outline' : 'school-outline';

  const image = getRoomImage(room.id, room.type);

  return (
    <TouchableOpacity
      id={`search-room-${room.id}`}
      style={[styles.card, isAvail && styles.cardAvail]}
      onPress={() => router.push(`/room/${room.id}`)}
      activeOpacity={0.75}
    >
      {/* Thumbnail image */}
      <View style={styles.thumbWrap}>
        <Image source={image} style={styles.thumb} resizeMode="cover" />
        <View style={styles.thumbOverlay} />
        <Ionicons name={typeIcon as any} size={16}
          style={styles.thumbIcon}
          color="rgba(255,255,255,0.9)" />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
        <Text style={styles.roomSub}>
          {room.building} · Tầng {room.floor} · {room.capacity} chỗ
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
          {room.amenities.slice(0, 3).map((a, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillText}>{a}</Text>
            </View>
          ))}
          {room.amenities.length > 3 && (
            <View style={[styles.pill, { backgroundColor: Colors.accentGlow, borderColor: Colors.borderGoldGlow }]}>
              <Text style={[styles.pillText, { color: Colors.accent }]}>
                +{room.amenities.length - 3}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <View style={[
        styles.statusBadge,
        { backgroundColor: statusMeta.color + '18', borderColor: statusMeta.color + '44' },
      ]}>
        <Ionicons name={statusMeta.icon as any} size={12} color={statusMeta.color} />
        <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
      </View>
    </TouchableOpacity>
  );
});

/* ─── Search Screen ───────────────────────────────────── */
export default function SearchScreen() {
  const { rooms } = useRoomStore();
  const [query, setQuery]       = useState('');
  const [building, setBuilding] = useState('all');
  const [type, setType]         = useState('all');
  const [status, setStatus]     = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  const results = useMemo(() => rooms.filter((r) => {
    const q = query.toLowerCase().trim();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.building.toLowerCase().includes(q)
      || r.description.toLowerCase().includes(q) || r.amenities.some((a) => a.toLowerCase().includes(q));
    return matchQ
      && (building === 'all' || r.building === building)
      && (type === 'all' || r.type === type)
      && (status === 'all' || r.status === status);
  }), [rooms, query, building, type, status]);

  const hasFilter = building !== 'all' || type !== 'all' || status !== 'all';
  const clearAll = () => { setBuilding('all'); setType('all'); setStatus('all'); setQuery(''); };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tìm phòng</Text>
          <Text style={styles.subtitle}>{results.length} phòng phù hợp</Text>
        </View>
        {hasFilter && (
          <TouchableOpacity id="btn-clear-all" style={styles.clearBtn} onPress={clearAll}>
            <Ionicons name="refresh" size={13} color={Colors.accent} />
            <Text style={styles.clearText}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          id="input-search"
          style={styles.searchInput}
          placeholder="Tên phòng, tòa nhà, tiện nghi..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            id="btn-toggle-filter"
            style={[styles.filterToggle, showFilters && styles.filterToggleOn]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={16}
              color={showFilters ? Colors.secondary : Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filters ── */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Tòa nhà</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {BUILDINGS.map((b) => (
                <Chip key={b.key} label={b.label}
                  active={building === b.key} onPress={() => setBuilding(b.key)} />
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Loại phòng</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ROOM_TYPES.map((t) => (
                <Chip key={t.key} label={t.label} icon={t.icon}
                  active={type === t.key} onPress={() => setType(t.key)} />
              ))}
            </ScrollView>
          </View>
          <View style={[styles.filterRow, { marginBottom: 0 }]}>
            <Text style={styles.filterLabel}>Trạng thái</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {STATUS_FILTERS.map((s) => (
                <Chip key={s.key} label={s.label}
                  active={status === s.key} onPress={() => setStatus(s.key)} />
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* ── Results ── */}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <SearchRoomCard room={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search" size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy phòng</Text>
            <Text style={styles.emptyDesc}>Thử điều chỉnh bộ lọc hoặc từ khoá</Text>
            <TouchableOpacity id="btn-empty-clear" style={styles.emptyBtn} onPress={clearAll}>
              <Text style={styles.emptyBtnText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingTop: 56, paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMd, color: Colors.textMuted, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.accentGlow, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.borderGoldGlow,
  },
  clearText: { ...Typography.micro, color: Colors.accent },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.md, marginBottom: 12,
    borderRadius: Radius.md, paddingHorizontal: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, height: 50,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: Colors.shadowOpacity * 0.5,
    shadowRadius: 6, elevation: 2,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, ...Typography.body },
  filterToggle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bgInput,
    alignItems: 'center', justifyContent: 'center',
  },
  filterToggleOn: { backgroundColor: Colors.secondaryGlow },

  filtersPanel: {
    backgroundColor: Colors.bgCard, marginHorizontal: Spacing.md, marginBottom: 12,
    borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 12,
  },
  filterRow: { gap: 8 },
  filterLabel: { ...Typography.overline, color: Colors.textMuted },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full, backgroundColor: Colors.bgInput,
    borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { ...Typography.label, color: Colors.textSecondary },
  chipTextActive: { color: '#fff' },

  list: { paddingHorizontal: Spacing.md },
  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: Colors.shadowOpacity * 0.5,
    shadowRadius: 6, elevation: 2,
  },
  cardAvail: { borderColor: Colors.primary + '40' },
  thumbWrap: {
    width: 80, height: 80,
    position: 'relative', margin: Spacing.sm,
    borderRadius: Radius.sm, overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  thumbIcon: {
    position: 'absolute', bottom: 4, right: 4,
  },
  roomName: { ...Typography.h4, color: Colors.textPrimary },
  roomSub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  pill: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, marginRight: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  pillText: { ...Typography.micro, color: Colors.textSecondary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: Radius.sm, borderWidth: 1,
    paddingHorizontal: 8, paddingVertical: 5,
    alignSelf: 'flex-start', marginLeft: 8,
  },
  statusText: { ...Typography.micro },

  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary },
  emptyDesc: { ...Typography.bodyMd, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: {
    marginTop: 8, backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.md, paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.borderGlow,
  },
  emptyBtnText: { ...Typography.label, color: Colors.primary },
});
