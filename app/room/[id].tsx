import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Modal, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoomStore } from '../../store/roomStore';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';
import { TIME_SLOTS } from '../../constants/mockData';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';
import { getRoomImage } from '../../constants/roomImages';
import {
  scheduleBookingReminder,
  sendBookingConfirmation,
} from '../../hooks/useNotifications';

function getDateList() {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
type SlotState = 'available' | 'mine' | 'booked' | 'past';

/* ─── Slot style helper ──────────────────────────────── */
function getSlotStyle(state: SlotState, isSelected: boolean) {
  const map: Record<SlotState, { bg: string; border: string; textColor: string }> = {
    available: {
      bg:        isSelected ? Colors.primary : Colors.slotAvailable,
      border:    isSelected ? Colors.primary : Colors.slotAvailableBorder,
      textColor: isSelected ? '#fff' : Colors.slotAvailableBorder,
    },
    mine: {
      bg: Colors.slotMine, border: Colors.slotMineBorder,
      textColor: Colors.slotMineBorder,
    },
    booked: {
      bg: Colors.slotBooked, border: Colors.slotBookedBorder,
      textColor: Colors.slotBookedBorder,
    },
    past: {
      bg: Colors.slotPast, border: Colors.slotPastBorder,
      textColor: Colors.textMuted,
    },
  };
  return map[state];
}

/* ─── Room Detail Screen ──────────────────────────────── */
export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRoomById } = useRoomStore();
  const { getRoomBookingsForDate, createBooking, getUserBookings } = useBookingStore();
  const { user } = useAuthStore();

  const room = getRoomById(id ?? '');
  const dates = getDateList();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate,  setSelectedDate]  = useState(todayStr);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [modalVisible,  setModalVisible]  = useState(false);
  const [purpose,       setPurpose]       = useState('');
  const [booking,       setBooking]       = useState(false);

  const bookedSlots   = getRoomBookingsForDate(id ?? '', selectedDate);
  const myBookedSlots = getUserBookings(user?.id ?? '')
    .filter((b) => b.roomId === id && b.date === selectedDate && b.status !== 'cancelled');

  const getSlotState = useCallback((slot: { start: string; end: string }): SlotState => {
    const now = new Date();
    const [h, m] = slot.start.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(h, m, 0, 0);
    if (slotDate < now) return 'past';
    if (myBookedSlots.some((b) => b.startTime === slot.start)) return 'mine';
    if (bookedSlots.some((b) => b.startTime === slot.start)) return 'booked';
    return 'available';
  }, [selectedDate, myBookedSlots, bookedSlots]);

  const toggleSlot = (slotId: string) => {
    const slot = TIME_SLOTS.find((s) => s.id === slotId)!;
    const state = getSlotState(slot);
    if (state === 'past' || state === 'booked') return;
    if (state === 'mine') { Alert.alert('Thông báo', 'Bạn đã đặt khung giờ này rồi!'); return; }
    setSelectedSlots((prev) =>
      prev.includes(slotId) ? prev.filter((s) => s !== slotId) : [...prev, slotId]
    );
  };

  const handleBook = async () => {
    if (!purpose.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập mục đích sử dụng.'); return; }
    if (selectedSlots.length === 0) return;
    setBooking(true);
    try {
      const bookedSlotObjects: { start: string; end: string }[] = [];

      for (const slotId of selectedSlots) {
        const slot = TIME_SLOTS.find((s) => s.id === slotId)!;
        const booking = await createBooking({
          userId: user!.id, roomId: room!.id, roomName: room!.name,
          date: selectedDate, startTime: slot.start, endTime: slot.end,
          purpose: purpose.trim(),
        });
        bookedSlotObjects.push({ start: slot.start, end: slot.end });

        // ⏰ Schedule nhắc nhở 30 phút trước cho từng khung giờ
        await scheduleBookingReminder({
          bookingId:  booking.id,
          roomName:   room!.name,
          date:       selectedDate,
          startTime:  slot.start,
          purpose:    purpose.trim(),
        });
      }

      // 🔔 Thông báo xác nhận tức thì (chỉ hiển thị slot đầu tiên nếu đặt nhiều)
      await sendBookingConfirmation({
        roomName:  room!.name,
        date:      selectedDate,
        startTime: bookedSlotObjects[0].start,
        endTime:   bookedSlotObjects[bookedSlotObjects.length - 1].end,
      });

      setModalVisible(false); setSelectedSlots([]); setPurpose('');
      Alert.alert(
        '✅ Đặt phòng thành công!',
        `${room?.name}\n📅 ${selectedDate}\n⏰ ${selectedSlots.length} khung giờ\n🔔 Đã đặt nhắc nhở 30 phút trước`,
        [{ text: 'Xem lịch', onPress: () => router.push('/(tabs)/bookings') }, { text: 'OK' }]
      );
    } catch {
      Alert.alert('Lỗi', 'Không thể đặt phòng. Vui lòng thử lại.');
    } finally {
      setBooking(false);
    }
  };

  if (!room) {
    return (
      <View style={styles.notFound}>
        <View style={[styles.notFoundIcon, { backgroundColor: Colors.error + '18' }]}>
          <Ionicons name="alert-circle" size={40} color={Colors.error} />
        </View>
        <Text style={styles.notFoundTitle}>Không tìm thấy phòng</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const typeIcon  = room.type === 'lab' ? 'desktop' : room.type === 'seminar' ? 'people' : 'school';
  const typeLabel = { classroom: 'Phòng học', lab: 'Lab máy tính', seminar: 'Seminar' }[room.type];
  const statusColor = {
    available:   Colors.statusAvailable,
    occupied:    Colors.statusOccupied,
    maintenance: Colors.statusMaintenance,
  }[room.status];
  const statusLabel = {
    available:   'Đang trống',
    occupied:    'Đang sử dụng',
    maintenance: 'Đang bảo trì',
  }[room.status];
  const heroImage = getRoomImage(room.id, room.type);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Hero image ── */}
        <View style={styles.heroImageWrap}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
          {/* Gradient overlay — dark at top & bottom */}
          <View style={styles.heroGradTop} />
          <View style={styles.heroGradBottom} />

          {/* Floating back button */}
          <TouchableOpacity
            id="btn-back"
            style={styles.backHeader}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Room info overlaid on bottom of image */}
          <View style={styles.heroOverlayInfo}>
            <View style={styles.heroOverlayTop}>
              <View style={[styles.statusChip, {
                backgroundColor: statusColor + '22',
                borderColor: statusColor + '66',
              }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
              </View>
              <View style={styles.metaChip}>
                <Ionicons name="bookmark-outline" size={12} color="rgba(255,255,255,0.8)" />
                <Text style={[styles.metaText, { color: 'rgba(255,255,255,0.8)' }]}>{typeLabel}</Text>
              </View>
            </View>
            <Text style={styles.heroNameOverlay}>{room.name}</Text>
            <Text style={styles.heroSubOverlay}>
              {room.building} · Tầng {room.floor} · {room.capacity} chỗ
            </Text>
          </View>
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Mô tả</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        {/* ── Amenities ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tiện nghi ({room.amenities.length})</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <View style={styles.amenityCheck}>
                  <Ionicons name="checkmark" size={12} color={Colors.success} />
                </View>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Date Picker ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Chọn ngày</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {dates.map((d) => {
              const str = d.toISOString().split('T')[0];
              const isSelected = str === selectedDate;
              const isToday = str === todayStr;
              return (
                <TouchableOpacity
                  key={str}
                  id={`date-${str}`}
                  style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                  onPress={() => { setSelectedDate(str); setSelectedSlots([]); }}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.dateDayName, isSelected && { color: '#fff' }]}>
                    {DAYS_VI[d.getDay()]}
                  </Text>
                  <Text style={[styles.dateNum, isSelected && { color: '#fff' }]}>
                    {d.getDate()}
                  </Text>
                  {isToday && (
                    <View style={[styles.todayDot, isSelected && { backgroundColor: '#fff' }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Time Slots ── */}
        <View style={styles.section}>
          <View style={styles.slotHeaderRow}>
            <Text style={styles.sectionLabel}>Khung giờ</Text>
            <Text style={styles.slotDate}>{selectedDate}</Text>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              { color: Colors.slotAvailableBorder, label: 'Trống' },
              { color: Colors.slotMineBorder,      label: 'Của bạn' },
              { color: Colors.slotBookedBorder,    label: 'Đã đặt' },
              { color: Colors.slotPastBorder,      label: 'Đã qua' },
            ].map((l) => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const state = getSlotState(slot);
              const isSelected = selectedSlots.includes(slot.id);
              const { bg, border, textColor } = getSlotStyle(state, isSelected);
              return (
                <TouchableOpacity
                  key={slot.id}
                  id={`slot-${slot.id}`}
                  style={[
                    styles.slotItem,
                    { backgroundColor: bg, borderColor: border },
                    (state === 'past' || state === 'booked') && styles.slotDisabled,
                  ]}
                  onPress={() => toggleSlot(slot.id)}
                  disabled={state === 'past' || state === 'booked'}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.slotTime, { color: textColor }]}>{slot.start}</Text>
                  {state === 'mine'   && <Ionicons name="person"       size={10} color={Colors.slotMineBorder} />}
                  {state === 'booked' && <Ionicons name="lock-closed"  size={10} color={Colors.slotBookedBorder} />}
                  {isSelected         && <Ionicons name="checkmark"    size={12} color="#fff" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Book Bar ── */}
      {room.status === 'available' && selectedSlots.length > 0 && (
        <View style={styles.bookBar}>
          <View>
            <Text style={styles.bookBarCount}>{selectedSlots.length} khung giờ đã chọn</Text>
            <Text style={styles.bookBarDate}>{selectedDate}</Text>
          </View>
          <TouchableOpacity
            id="btn-open-modal"
            style={styles.bookBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-sharp" size={18} color="#fff" />
            <Text style={styles.bookBtnText}>Đặt phòng</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Booking Modal ── */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            {/* Top accent bar — tri-color */}
            <View style={styles.modalTopBar}>
              <View style={[styles.modalTopSegment, { backgroundColor: Colors.primary }]} />
              <View style={[styles.modalTopSegment, { backgroundColor: Colors.secondary }]} />
              <View style={[styles.modalTopSegment, { backgroundColor: Colors.accent }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Xác nhận đặt phòng</Text>
              <TouchableOpacity id="btn-close-modal" onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.modalSummary}>
              {[
                { icon: 'business-outline', color: Colors.primary,    text: room.name },
                { icon: 'calendar-outline', color: Colors.secondary,  text: selectedDate },
                {
                  icon: 'time-outline', color: Colors.accent,
                  text: selectedSlots.map((sid) =>
                    TIME_SLOTS.find((s) => s.id === sid)?.label).join(', '),
                },
              ].map((row, i) => (
                <View key={i} style={styles.modalRow}>
                  <View style={[styles.modalRowIcon, { backgroundColor: row.color + '18' }]}>
                    <Ionicons name={row.icon as any} size={15} color={row.color} />
                  </View>
                  <Text style={styles.modalRowText}>{row.text}</Text>
                </View>
              ))}
            </View>

            {/* Purpose */}
            <View style={styles.purposeGroup}>
              <Text style={styles.purposeLabel}>Mục đích sử dụng *</Text>
              <TextInput
                id="input-purpose"
                style={styles.purposeInput}
                placeholder="VD: Học nhóm môn TTNT, Họp đồ án..."
                placeholderTextColor={Colors.textMuted}
                value={purpose}
                onChangeText={setPurpose}
                multiline numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              id="btn-confirm"
              style={[styles.confirmBtn, booking && { opacity: 0.6 }]}
              onPress={handleBook}
              disabled={booking}
              activeOpacity={0.85}
            >
              {booking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmBtnText}>Xác nhận đặt phòng</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  notFound: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, backgroundColor: Colors.bg, padding: Spacing.lg,
  },
  notFoundIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  notFoundTitle: { ...Typography.h3, color: Colors.textPrimary },
  backBtn: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  backBtnText: { ...Typography.label, color: Colors.textPrimary },

  // ── Back header (now inside image) ──
  backHeader: {
    position: 'absolute', top: 52, left: Spacing.md, zIndex: 10,
  },
  backCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },

  // ── Hero image ──
  heroImageWrap: {
    width: '100%', height: 260, position: 'relative', overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroGradTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 100,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroGradBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  heroOverlayInfo: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.md, paddingBottom: Spacing.lg,
  },
  heroOverlayTop: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8,
  },
  heroNameOverlay: {
    ...Typography.h2, color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubOverlay: {
    ...Typography.caption, color: 'rgba(255,255,255,0.8)', marginTop: 4,
  },
  heroBuildingText: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: Radius.full, borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusLabel: { ...Typography.micro },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 5,
  },
  metaText: { ...Typography.micro, color: Colors.textMuted },

  // ── Sections ──
  section: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionLabel: { ...Typography.overline, color: Colors.textMuted, marginBottom: 12 },
  description: { ...Typography.bodyMd, color: Colors.textSecondary, lineHeight: 22 },

  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '47%' },
  amenityCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.success + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  amenityText: { ...Typography.bodyMd, color: Colors.textSecondary, flex: 1 },

  // ── Date Picker ──
  dateItem: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: Radius.md, minWidth: 54,
    backgroundColor: Colors.bgCard, borderWidth: 1.5, borderColor: Colors.border,
  },
  dateItemSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dateDayName: { ...Typography.micro, color: Colors.textMuted },
  dateNum: { ...Typography.h3, color: Colors.textPrimary, marginTop: 2 },
  todayDot: {
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: Colors.primary, marginTop: 4,
  },

  // ── Slots ──
  slotHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  slotDate: { ...Typography.caption, color: Colors.textMuted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...Typography.micro, color: Colors.textMuted },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotItem: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: Radius.md, borderWidth: 1.5, minWidth: '30%',
  },
  slotDisabled: { opacity: 0.5 },
  slotTime: { ...Typography.label },

  // ── Book Bar ──
  bookBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, padding: Spacing.md, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 12, elevation: 8,
  },
  bookBarCount: { ...Typography.h4, color: Colors.textPrimary },
  bookBarDate: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  bookBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: 22, paddingVertical: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4,
    shadowRadius: 10, elevation: 6,
  },
  bookBtnText: { ...Typography.h4, color: '#fff' },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: '#000C', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.bgModal,
    borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg, paddingTop: Spacing.md,
    borderTopWidth: 1, borderColor: Colors.border,
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.sm,
  },
  // Tri-color top bar
  modalTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    flexDirection: 'row',
  },
  modalTopSegment: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.md,
  },
  modalTitle: { ...Typography.h3, color: Colors.textPrimary },
  modalSummary: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.md, gap: 10,
  },
  modalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  modalRowIcon: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  modalRowText: { ...Typography.bodyMd, color: Colors.textSecondary, flex: 1, lineHeight: 20 },

  purposeGroup: { marginBottom: Spacing.md },
  purposeLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 8 },
  purposeInput: {
    backgroundColor: Colors.bgInput, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border,
    padding: Spacing.sm, color: Colors.textPrimary,
    ...Typography.bodyMd, minHeight: 88, textAlignVertical: 'top',
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35,
    shadowRadius: 10, elevation: 5,
  },
  confirmBtnText: { ...Typography.h4, color: '#fff' },
});
