import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../types';
import { Colors, Spacing, Radius, Typography } from '../constants/Colors';
import { getRoomImage } from '../constants/roomImages';

export interface RoomCardProps {
  room: Room;
  onPress?: (room: Room) => void;
}

/* ─── Status badge ────────────────────────────────────── */
function StatusBadge({ status }: { status: Room['status'] }) {
  const meta = {
    available:   { label: 'Trống ngay', color: Colors.statusAvailable },
    occupied:    { label: 'Đang dùng',  color: Colors.statusOccupied },
    maintenance: { label: 'Bảo trì',   color: Colors.statusMaintenance },
  }[status];

  return (
    <View style={[badgeStyles.wrap, { backgroundColor: meta.color + '25', borderColor: meta.color + '66' }]}>
      <View style={[badgeStyles.dot, { backgroundColor: meta.color }]} />
      <Text style={[badgeStyles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...Typography.micro, fontWeight: '700' },
});

/* ─── Room Card (Memoized) ────────────────────────────── */
export const RoomCard = memo(
  function RoomCard({ room, onPress }: RoomCardProps) {
    const isAvail = room.status === 'available';
    const image = getRoomImage(room.id, room.type);

    const handlePress = () => {
      if (onPress) {
        onPress(room);
      } else {
        router.push(`/room/${room.id}`);
      }
    };

    return (
      <TouchableOpacity
        id={`room-card-${room.id}`}
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* ── Photo banner ── */}
        <View style={styles.imageWrap}>
          <Image source={image} style={styles.roomImage} resizeMode="cover" />
          <View style={styles.imageOverlay} />

          {/* Real-time Status Badge */}
          <View style={styles.imageBadge}>
            <StatusBadge status={room.status} />
          </View>

          {/* Building & Floor Tag */}
          <View style={styles.buildingTag}>
            <Ionicons name="business-outline" size={12} color="#fff" />
            <Text style={styles.buildingTagText}>
              {room.building} · Tầng {room.floor}
            </Text>
          </View>

          {/* Capacity pill on image */}
          <View style={styles.capacityBadge}>
            <Ionicons name="people-outline" size={11} color="#fff" />
            <Text style={styles.capacityBadgeText}>{room.capacity} chỗ</Text>
          </View>
        </View>

        {/* ── Card body ── */}
        <View style={styles.cardBody}>
          {isAvail && <View style={styles.stripe} />}

          <View style={styles.bodyInner}>
            <View style={styles.titleRow}>
              <Text style={styles.roomName} numberOfLines={1}>
                {room.name}
              </Text>
              <View style={styles.typeBadge}>
                <Ionicons
                  name={
                    room.type === 'lab'
                      ? 'desktop-outline'
                      : room.type === 'seminar'
                      ? 'people-outline'
                      : 'school-outline'
                  }
                  size={12}
                  color={Colors.secondary}
                />
                <Text style={styles.typeBadgeText}>
                  {room.type === 'lab' ? 'Lab máy tính' : room.type === 'seminar' ? 'Seminar/Họp' : 'Phòng học'}
                </Text>
              </View>
            </View>

            <Text style={styles.desc} numberOfLines={1}>
              {room.description}
            </Text>

            {/* Amenity pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.amenityScroll}
              contentContainerStyle={{ gap: 6 }}
            >
              {room.amenities.map((amenity, idx) => (
                <View key={idx} style={styles.pill}>
                  <Text style={styles.pillText}>{amenity}</Text>
                </View>
              ))}
            </ScrollView>

            {/* CTA row */}
            <View style={styles.footerRow}>
              <Text style={styles.subtext}>
                {room.status === 'available'
                  ? '🟢 Sẵn sàng đặt ngay'
                  : room.status === 'occupied'
                  ? '🟠 Đang có lớp học'
                  : '🔧 Đang bảo trì'}
              </Text>
              {isAvail ? (
                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>Đặt phòng</Text>
                  <Ionicons name="arrow-forward-circle" size={18} color={Colors.primary} />
                </View>
              ) : (
                <View style={[styles.ctaRow, { opacity: 0.6 }]}>
                  <Text style={[styles.ctaText, { color: Colors.textMuted }]}>Xem lịch</Text>
                  <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.room.id === next.room.id &&
    prev.room.status === next.room.status &&
    prev.room.capacity === next.room.capacity &&
    prev.room.amenities.length === next.room.amenities.length
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrap: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  imageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  buildingTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buildingTagText: {
    ...Typography.micro,
    color: '#fff',
    fontWeight: '600',
  },
  capacityBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14, 165, 233, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  capacityBadgeText: {
    ...Typography.micro,
    color: '#fff',
    fontWeight: '700',
  },
  cardBody: {
    position: 'relative',
    padding: Spacing.md,
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: Colors.primary,
  },
  bodyInner: {
    paddingLeft: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  roomName: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondaryGlow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.secondary + '33',
  },
  typeBadgeText: {
    ...Typography.micro,
    color: Colors.secondary,
    fontWeight: '600',
  },
  desc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  amenityScroll: {
    marginTop: 10,
    marginBottom: 4,
  },
  pill: {
    backgroundColor: Colors.bgInput,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    ...Typography.micro,
    color: Colors.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  subtext: {
    ...Typography.micro,
    color: Colors.textMuted,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    ...Typography.label,
    color: Colors.primary,
    fontWeight: '700',
  },
});
