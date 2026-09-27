import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Booking } from '../../types';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { cancelBookingReminder } from '../../hooks/useNotifications';

const TABS = [
  { key: 'upcoming',  label: 'Sắp tới', icon: 'time-outline' as const },
  { key: 'past',      label: 'Đã qua',  icon: 'checkmark-done-outline' as const },
  { key: 'cancelled', label: 'Đã hủy',  icon: 'close-circle-outline' as const },
];

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  confirmed: { label: 'Đã xác nhận', color: Colors.secondary,  icon: 'checkmark-circle' },
  pending:   { label: 'Chờ duyệt',   color: Colors.accent,     icon: 'time' },
  completed: { label: 'Hoàn thành',  color: Colors.textMuted,  icon: 'checkmark-done' },
  cancelled: { label: 'Đã hủy',      color: Colors.error,      icon: 'close-circle' },
};

/* ─── Booking Card ────────────────────────────────────── */
function BookingCard({
  booking,
  onCancel,
}: {
  booking: Booking;
  onCancel?: () => void;
}) {
  const meta = STATUS_META[booking.status] ?? {
    label: booking.status, color: Colors.textMuted, icon: 'help',
  };
  const isUpcoming = booking.status === 'confirmed' || booking.status === 'pending';
  const canCancel  = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <View style={[styles.card, isUpcoming && styles.cardUpcoming]}>
      {/* Left accent stripe */}
      {isUpcoming && (
        <View style={[styles.cardStripe, {
          backgroundColor: booking.status === 'pending' ? Colors.accent : Colors.secondary,
        }]} />
      )}

      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.statusIconBox, { backgroundColor: meta.color + '20' }]}>
          <Ionicons name={meta.icon as any} size={22} color={meta.color} />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.roomName} numberOfLines={1}>{booking.roomName}</Text>
          <Text style={styles.purpose}  numberOfLines={1}>{booking.purpose}</Text>
        </View>

        <View style={[styles.statusChip, {
          backgroundColor: meta.color + '18',
          borderColor:     meta.color + '44',
        }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <View style={[styles.infoIconBox, { backgroundColor: Colors.primaryGlow }]}>
            <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
          </View>
          <Text style={styles.infoText}>{booking.date}</Text>
        </View>

        <View style={styles.infoItem}>
          <View style={[styles.infoIconBox, { backgroundColor: Colors.secondaryGlow }]}>
            <Ionicons name="time-outline" size={13} color={Colors.secondary} />
          </View>
          <Text style={styles.infoText}>{booking.startTime} – {booking.endTime}</Text>
        </View>

        {!booking.synced && (
          <View style={styles.infoItem}>
            <Ionicons name="cloud-offline-outline" size={13} color={Colors.accent} />
            <Text style={[styles.infoText, { color: Colors.accent }]}>Chưa đồng bộ</Text>
          </View>
        )}
      </View>

      {/* Cancel button — hiện khi confirmed HOẶC pending */}
      {canCancel && onCancel && (
        <TouchableOpacity
          id={`btn-cancel-${booking.id}`}
          style={styles.cancelBtn}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
          <Text style={styles.cancelText}>Hủy đặt phòng</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─── Bookings Screen ─────────────────────────────────── */
export default function BookingsScreen() {
  const { user }                                      = useAuthStore();
  const { bookings, cancelBooking, getUserBookings }  = useBookingStore();   // subscribe trực tiếp vào store
  const [activeTab, setActiveTab]                     = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [cancellingId, setCancellingId]               = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Lọc theo user — dùng bookings từ store để tự động re-render khi state đổi
  const all = bookings.filter((b) => b.userId === (user?.id ?? ''));

  const upcoming  = all.filter(
    (b) => (b.status === 'confirmed' || b.status === 'pending') && b.date >= todayStr
  );
  const past      = all.filter(
    (b) => b.status === 'completed' ||
           (b.status === 'confirmed' && b.date < todayStr)
  );
  const cancelled = all.filter((b) => b.status === 'cancelled');

  const tabData = { upcoming, past, cancelled };
  const counts  = { upcoming: upcoming.length, past: past.length, cancelled: cancelled.length };
  const data    = tabData[activeTab] ?? [];

  const handleCancel = (booking: Booking) => {
    const msg = `Bạn có chắc muốn hủy phòng\n"${booking.roomName}"\nvào ngày ${booking.date} (${booking.startTime}–${booking.endTime})?`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Xác nhận hủy đặt phòng\n\n${msg}`);
      if (confirmed) {
        cancelBooking(booking.id);
        cancelBookingReminder(booking.id);
      }
    } else {
      Alert.alert(
        'Xác nhận hủy đặt phòng',
        msg,
        [
          { text: 'Không, giữ lại', style: 'cancel' },
          {
            text: 'Hủy đặt phòng',
            style: 'destructive',
            onPress: () => {
              cancelBooking(booking.id);
              cancelBookingReminder(booking.id);
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch đặt phòng</Text>
        <Text style={styles.subtitle}>{all.length} lượt đặt</Text>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active      = activeTab === t.key;
          const count       = counts[t.key as keyof typeof counts];
          const activeColor = t.key === 'upcoming'
            ? Colors.secondary
            : t.key === 'cancelled'
            ? Colors.error
            : Colors.textMuted;

          return (
            <TouchableOpacity
              key={t.key}
              id={`tab-${t.key}`}
              style={[styles.tabItem, active && { backgroundColor: activeColor + '18' }]}
              onPress={() => setActiveTab(t.key as any)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={t.icon}
                size={14}
                color={active ? activeColor : Colors.textMuted}
              />
              <Text style={[styles.tabText, active && { color: activeColor }]}>
                {t.label}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.tabBadge,
                  active && { backgroundColor: activeColor, borderColor: activeColor },
                ]}>
                  <Text style={[styles.tabBadgeText, active && { color: '#fff' }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ── */}
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        extraData={cancellingId}   // force re-render khi đang cancel
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={
              (item.status === 'confirmed' || item.status === 'pending')
                ? () => handleCancel(item)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIcon, { backgroundColor: Colors.secondaryGlow }]}>
              <Ionicons name="calendar-outline" size={32} color={Colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Không có lịch đặt</Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'upcoming'
                ? 'Hãy đặt phòng để bắt đầu!'
                : activeTab === 'cancelled'
                ? 'Không có lịch đặt nào bị hủy.'
                : 'Chưa có lịch sử đặt phòng.'}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                id="btn-go-book"
                style={styles.emptyBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Ionicons name="add-circle-outline" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Đặt phòng ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={<View style={{ height: 32 }} />}
      />
    </View>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  title:    { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMd, color: Colors.textMuted, marginTop: 2 },

  /* ── Tabs ── */
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
    gap: 5,
  },
  tabText:      { ...Typography.label, color: Colors.textMuted },
  tabBadge: {
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.border,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBadgeText: { ...Typography.micro, color: Colors.textMuted },

  /* ── List ── */
  list: { paddingHorizontal: Spacing.md },

  /* ── Card ── */
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Colors.shadowOpacity * 0.5,
    shadowRadius: 6,
    elevation: 2,
  },
  cardUpcoming: { borderColor: Colors.secondary + '40' },
  cardStripe: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    width: 3,
    borderTopLeftRadius: Radius.lg,
    borderBottomLeftRadius: Radius.lg,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusIconBox: {
    width: 44, height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: { ...Typography.h4, color: Colors.textPrimary },
  purpose:  { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  statusChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: { ...Typography.micro },

  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },

  infoRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  infoItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoIconBox: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { ...Typography.caption, color: Colors.textSecondary },

  /* ── Cancel button ── */
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.error + '33',
    alignSelf: 'flex-start',        // không full-width, gọn hơn
    paddingRight: 8,
  },
  cancelText: { ...Typography.label, color: Colors.error },

  /* ── Empty ── */
  emptyBox:  { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { ...Typography.h3, color: Colors.textPrimary },
  emptyDesc:  { ...Typography.bodyMd, color: Colors.textMuted, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: { ...Typography.label, color: '#fff' },
});
