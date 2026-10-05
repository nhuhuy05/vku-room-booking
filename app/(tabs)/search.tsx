import React, { useState, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
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
  { key: 'Tòa V', label: 'Tòa V' },
];

const CAPACITY_RANGES = [
  { key: 'all', label: 'Tất cả' },
  { key: '2-5', label: '2–5 chỗ' },
  { key: '6-10', label: '6–10 chỗ' },
  { key: '11-20', label: '11–20 chỗ' },
  { key: '20+', label: '> 20 chỗ' },
];

const CORE_AMENITIES = [
  { key: 'Máy chiếu', label: 'Máy chiếu', icon: 'videocam-outline' },
  { key: 'Bảng trắng', label: 'Bảng trắng', icon: 'easel-outline' },
  { key: 'PC cấu hình cao', label: 'PC cấu hình cao', icon: 'desktop-outline' },
  { key: 'Điều hòa', label: 'Điều hòa', icon: 'snow-outline' },
];

const STATUS_FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'available', label: 'Trống ngay' },
  { key: 'occupied', label: 'Đang dùng' },
];

/* ─── Chip ────────────────────────────────────────────── */
function Chip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={13}
          color={active ? '#fff' : Colors.textMuted}
        />
      )}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ─── Result Card (Memoized) ─────────────────────────── */
const SearchRoomCard = memo(function SearchRoomCard({ room }: { room: Room }) {
  const isAvail = room.status === 'available';
  const statusMeta = {
    available:   { label: 'Trống ngay', color: Colors.statusAvailable, icon: 'checkmark-circle' },
    occupied:    { label: 'Đang dùng',  color: Colors.statusOccupied,  icon: 'time' },
    maintenance: { label: 'Bảo trì',    color: Colors.statusMaintenance, icon: 'construct' },
  }[room.status];

  const typeIcon =
    room.type === 'lab'
      ? 'desktop-outline'
      : room.type === 'seminar'
      ? 'people-outline'
      : 'school-outline';

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
        <Ionicons
          name={typeIcon as any}
          size={16}
          style={styles.thumbIcon}
          color="rgba(255,255,255,0.9)"
        />
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.name}
        </Text>
        <Text style={styles.roomSub}>
          {room.building} · Tầng {room.floor} ·{' '}
          <Text style={{ color: Colors.secondary, fontWeight: '700' }}>
            {room.capacity} chỗ
          </Text>
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 6 }}
        >
          {room.amenities.map((a, i) => (
            <View key={i} style={styles.pill}>
              <Text style={styles.pillText}>{a}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: statusMeta.color + '18',
            borderColor: statusMeta.color + '44',
          },
        ]}
      >
        <Ionicons name={statusMeta.icon as any} size={12} color={statusMeta.color} />
        <Text style={[styles.statusText, { color: statusMeta.color }]}>
          {statusMeta.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

/* ─── Search Screen ───────────────────────────────────── */
export default function SearchScreen() {
  const { rooms } = useRoomStore();
  const [query, setQuery] = useState('');
  const [building, setBuilding] = useState('all');
  const [capacity, setCapacity] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [status, setStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(true);

  const toggleAmenity = (amenityKey: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityKey)
        ? prev.filter((k) => k !== amenityKey)
        : [...prev, amenityKey]
    );
  };

  const results = useMemo(() => {
    return rooms.filter((r) => {
      // 1. Text Query Search
      const q = query.toLowerCase().trim();
      const matchQ =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.building.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.amenities.some((a) => a.toLowerCase().includes(q));

      // 2. Building Filter (A, B, C, V)
      const matchBuilding = building === 'all' || r.building === building;

      // 3. Capacity Filter (2-20 students, etc.)
      let matchCapacity = true;
      if (capacity === '2-5') {
        matchCapacity = r.capacity >= 2 && r.capacity <= 5;
      } else if (capacity === '6-10') {
        matchCapacity = r.capacity >= 6 && r.capacity <= 10;
      } else if (capacity === '11-20') {
        matchCapacity = r.capacity >= 11 && r.capacity <= 20;
      } else if (capacity === '20+') {
        matchCapacity = r.capacity > 20;
      }

      // 4. Equipment / Amenities Filter (Máy chiếu, Bảng trắng, PC cấu hình cao, Điều hòa)
      const matchAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((amenity) =>
          r.amenities.some(
            (a) => a.toLowerCase() === amenity.toLowerCase()
          )
        );

      // 5. Status Filter
      const matchStatus = status === 'all' || r.status === status;

      return (
        matchQ &&
        matchBuilding &&
        matchCapacity &&
        matchAmenities &&
        matchStatus
      );
    });
  }, [rooms, query, building, capacity, selectedAmenities, status]);

  const hasFilter =
    building !== 'all' ||
    capacity !== 'all' ||
    selectedAmenities.length > 0 ||
    status !== 'all';

  const clearAll = () => {
    setBuilding('all');
    setCapacity('all');
    setSelectedAmenities([]);
    setStatus('all');
    setQuery('');
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tìm kiếm phòng</Text>
          <Text style={styles.subtitle}>{results.length} phòng phù hợp</Text>
        </View>
        {hasFilter && (
          <TouchableOpacity
            id="btn-clear-all"
            style={styles.clearBtn}
            onPress={clearAll}
          >
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
          placeholder="Tìm theo tên phòng, thiết bị, tòa nhà..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 ? (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            id="btn-toggle-filter"
            style={[styles.filterToggle, showFilters && styles.filterToggleOn]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons
              name="options-outline"
              size={16}
              color={showFilters ? Colors.secondary : Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Multi-Parameter Filters ── */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Tòa nhà (A, B, C, V) */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Tòa nhà</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {BUILDINGS.map((b) => (
                <Chip
                  key={b.key}
                  label={b.label}
                  active={building === b.key}
                  onPress={() => setBuilding(b.key)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Sức chứa (2–20 sinh viên) */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sức chứa</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CAPACITY_RANGES.map((c) => (
                <Chip
                  key={c.key}
                  label={c.label}
                  active={capacity === c.key}
                  onPress={() => setCapacity(c.key)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Trang thiết bị (Máy chiếu, Bảng trắng, PC cấu hình cao, Điều hòa) */}
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Trang thiết bị</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {CORE_AMENITIES.map((a) => {
                const isSelected = selectedAmenities.includes(a.key);
                return (
                  <Chip
                    key={a.key}
                    label={a.label}
                    icon={a.icon}
                    active={isSelected}
                    onPress={() => toggleAmenity(a.key)}
                  />
                );
              })}
            </ScrollView>
          </View>

          {/* Trạng thái thời gian thực */}
          <View style={[styles.filterRow, { marginBottom: 0 }]}>
            <Text style={styles.filterLabel}>Trạng thái</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {STATUS_FILTERS.map((s) => (
                <Chip
                  key={s.key}
                  label={s.label}
                  active={status === s.key}
                  onPress={() => setStatus(s.key)}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* ── Results FlatList with 60fps Optimization ── */}
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        renderItem={({ item }) => <SearchRoomCard room={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search" size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptyDesc}>
              Thử nới lỏng các bộ lọc (Tòa nhà, Sức chứa hoặc Thiết bị)
            </Text>
            <TouchableOpacity
              id="btn-empty-clear"
              style={styles.emptyBtn}
              onPress={clearAll}
            >
              <Text style={styles.emptyBtnText}>Xóa toàn bộ bộ lọc</Text>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMd, color: Colors.textMuted, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderGoldGlow,
  },
  clearText: { ...Typography.micro, color: Colors.accent, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    padding: 0,
  },
  filterToggle: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgInput,
  },
  filterToggleOn: {
    backgroundColor: Colors.secondaryGlow,
  },

  filtersPanel: {
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgInput,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  list: { paddingHorizontal: Spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cardAvail: {
    borderColor: Colors.primary + '33',
  },
  thumbWrap: {
    width: 60,
    height: 60,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  thumbIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  roomName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  roomSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  pill: {
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginRight: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    ...Typography.micro,
    fontWeight: '700',
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  emptyDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  emptyBtnText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '700',
  },
});
