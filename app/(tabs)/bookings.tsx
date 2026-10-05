import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Booking } from '../../types';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { cancelBookingReminder } from '../../hooks/useNotifications';
import { BookingPassCard } from '../../components/BookingPassCard';
import { CheckInQRModal } from '../../components/CheckInQRModal';

const TABS = [
  { key: 'upcoming',  label: 'Sắp tới',   icon: 'time-outline' as const },
  { key: 'past',      label: 'Lịch sử',   icon: 'checkmark-done-outline' as const },
  { key: 'cancelled', label: 'Đã hủy',    icon: 'close-circle-outline' as const },
];

export default function BookingsScreen() {
  const { user } = useAuthStore();
  const { bookings, cancelBooking, checkInBooking } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const currentUserId = user?.id ?? 'u001';

  // Lọc theo user
  const all = bookings.filter((b) => b.userId === currentUserId);

  // Các phòng đặt cho ngày hôm nay và tương lai hiển thị ở "Sắp tới" (kể cả đã check-in)
  const upcoming = all.filter(
    (b) => b.status !== 'cancelled' && b.date >= todayStr
  );
  const past = all.filter(
    (b) => b.date < todayStr
  );
  const cancelled = all.filter((b) => b.status === 'cancelled');

  const tabData = { upcoming, past, cancelled };
  const counts  = { upcoming: upcoming.length, past: past.length, cancelled: cancelled.length };
  const data    = tabData[activeTab] ?? [];

  const handleOpenQR = (booking: Booking) => {
    // Lấy thông tin mới nhất từ store theo đúng ID của phòng được bấm
    const fresh = bookings.find((b) => b.id === booking.id) || booking;
    setSelectedBookingForQR(fresh);
    setQrModalVisible(true);
  };

  const handleCloseQR = () => {
    setQrModalVisible(false);
    setSelectedBookingForQR(null);
  };

  const handleCheckIn = async (bookingId: string) => {
    await checkInBooking(bookingId);
    // Chỉ cập nhật trạng thái cho đúng booking ID này
    setSelectedBookingForQR((prev) =>
      prev && prev.id === bookingId ? { ...prev, status: 'completed' as const } : prev
    );
  };

  const handleCancel = (booking: Booking) => {
    const msg = `Bạn có chắc muốn hủy phòng\n"${booking.roomName}"\nvào ngày ${booking.date} (${booking.startTime}–${booking.endTime})?`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Xác nhận hủy đặt phòng\n\n${msg}`);
      if (confirmed) {
        cancelBooking(booking.id);
        cancelBookingReminder(booking.id);
      }
    } else {
      Alert.alert('Xác nhận hủy đặt phòng', msg, [
        { text: 'Không, giữ lại', style: 'cancel' },
        {
          text: 'Hủy đặt phòng',
          style: 'destructive',
          onPress: () => {
            cancelBooking(booking.id);
            cancelBookingReminder(booking.id);
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Vé & Lịch đặt phòng</Text>
        <Text style={styles.subtitle}>{all.length} lượt đặt phòng của bạn</Text>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map((t) => {
          const active      = activeTab === t.key;
          const count       = counts[t.key as keyof typeof counts];
          const activeColor =
            t.key === 'upcoming'
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
                <View
                  style={[
                    styles.tabBadge,
                    active && { backgroundColor: activeColor, borderColor: activeColor },
                  ]}
                >
                  <Text style={[styles.tabBadgeText, active && { color: '#fff' }]}>
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List of Unique Booking Passes with 60fps Optimization ── */}
      <FlatList
        data={data}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BookingPassCard
            booking={item}
            onOpenQR={handleOpenQR}
            onCancel={
              item.status === 'confirmed' || item.status === 'pending'
                ? () => handleCancel(item)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS !== 'web'}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={[styles.emptyIcon, { backgroundColor: Colors.secondaryGlow }]}>
              <Ionicons name="ticket-outline" size={34} color={Colors.secondary} />
            </View>
            <Text style={styles.emptyTitle}>Chưa có vé đặt phòng</Text>
            <Text style={styles.emptyDesc}>
              {activeTab === 'upcoming'
                ? 'Hãy khám phá phòng và đặt ngay để nhận vé QR check-in!'
                : activeTab === 'cancelled'
                ? 'Không có lượt đặt phòng nào bị hủy.'
                : 'Chưa có lịch sử sử dụng phòng.'}
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

      {/* ── Interactive QR Check-in Modal ── */}
      <CheckInQRModal
        visible={qrModalVisible}
        booking={selectedBookingForQR}
        onClose={handleCloseQR}
        onCheckIn={handleCheckIn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  title:    { ...Typography.h1, color: Colors.textPrimary },
  subtitle: { ...Typography.bodyMd, color: Colors.textMuted, marginTop: 2 },

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
  tabText: { ...Typography.label, color: Colors.textMuted },
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

  list: { paddingHorizontal: Spacing.md },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  emptyDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radius.full,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: {
    ...Typography.bodyMd,
    color: '#fff',
    fontWeight: '700',
  },
});
