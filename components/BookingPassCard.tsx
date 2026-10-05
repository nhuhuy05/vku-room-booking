import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { Colors, Spacing, Radius, Typography } from '../constants/Colors';

interface BookingPassCardProps {
  booking: Booking;
  onOpenQR: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

const STATUS_META: Record<string, { label: string; color: string; icon: string }> = {
  confirmed: { label: 'Đã xác nhận', color: Colors.secondary, icon: 'checkmark-circle' },
  pending:   { label: 'Chờ duyệt',   color: Colors.accent,    icon: 'time' },
  completed: { label: 'Đã Check-in', color: Colors.success,   icon: 'checkmark-done' },
  cancelled: { label: 'Đã hủy',      color: Colors.error,     icon: 'close-circle' },
};

export const BookingPassCard = memo(
  function BookingPassCard({ booking, onOpenQR, onCancel }: BookingPassCardProps) {
    const meta = STATUS_META[booking.status] ?? {
      label: booking.status,
      color: Colors.textMuted,
      icon: 'help',
    };

    const isUpcoming =
      booking.status === 'confirmed' || booking.status === 'pending';
    const canCancel = isUpcoming;
    const canCheckIn = booking.status === 'confirmed';

    return (
      <View style={[styles.card, isUpcoming && styles.cardUpcoming]}>
        {/* Pass Top Banner */}
        <View style={styles.cardHeader}>
          <View style={styles.passBadge}>
            <Ionicons name="ticket-outline" size={13} color={Colors.primary} />
            <Text style={styles.passCodeText}>
              {booking.passCode || `VKU-PASS-${booking.id.toUpperCase()}`}
            </Text>
          </View>

          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: meta.color + '18',
                borderColor: meta.color + '55',
              },
            ]}
          >
            <Ionicons name={meta.icon as any} size={12} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>
              {meta.label}
            </Text>
          </View>
        </View>

        {/* Room Info */}
        <View style={styles.body}>
          <Text style={styles.roomName} numberOfLines={1}>
            {booking.roomName}
          </Text>
          <Text style={styles.purpose} numberOfLines={1}>
            {booking.purpose}
          </Text>

          {/* Ticket Dashed Separator */}
          <View style={styles.cutoutRow}>
            <View style={styles.leftCutout} />
            <View style={styles.dashedLine} />
            <View style={styles.rightCutout} />
          </View>

          {/* Date & Time Slot Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="calendar-outline" size={12} color={Colors.primary} />
                <Text style={styles.infoLabel}>NGÀY SỬ DỤNG</Text>
              </View>
              <Text style={styles.infoValue}>{booking.date}</Text>
            </View>

            <View style={styles.infoCol}>
              <View style={styles.infoLabelRow}>
                <Ionicons name="time-outline" size={12} color={Colors.secondary} />
                <Text style={styles.infoLabel}>KHUNG GIỜ</Text>
              </View>
              <Text style={[styles.infoValue, { color: Colors.secondary }]}>
                {booking.startTime} – {booking.endTime}
              </Text>
            </View>
          </View>

          {/* Offline Sync State */}
          {!booking.synced && (
            <View style={styles.syncNotice}>
              <Ionicons name="cloud-offline-outline" size={13} color={Colors.accent} />
              <Text style={styles.syncNoticeText}>Đang chờ đồng bộ lên máy chủ</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* QR Check-in CTA Button */}
          <TouchableOpacity
            id={`btn-qr-${booking.id}`}
            style={[
              styles.qrBtn,
              booking.status === 'completed' && styles.qrBtnCompleted,
            ]}
            onPress={() => onOpenQR(booking)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={booking.status === 'completed' ? 'checkmark-circle' : 'qr-code-outline'}
              size={17}
              color={booking.status === 'completed' ? Colors.success : '#fff'}
            />
            <Text
              style={[
                styles.qrBtnText,
                booking.status === 'completed' && { color: Colors.success },
              ]}
            >
              {booking.status === 'completed' ? 'Đã Check-in' : 'Mã QR Check-in'}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          {canCancel && onCancel && (
            <TouchableOpacity
              id={`btn-cancel-${booking.id}`}
              style={styles.cancelBtn}
              onPress={() => onCancel(booking)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={15} color={Colors.error} />
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.booking.id === next.booking.id &&
    prev.booking.status === next.booking.status &&
    prev.booking.synced === next.booking.synced
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Colors.shadowOpacity,
    shadowRadius: 10,
    elevation: 3,
  },
  cardUpcoming: {
    borderColor: Colors.secondary + '55',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.bgInput,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  passBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  passCodeText: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  statusText: {
    ...Typography.micro,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.md,
  },
  roomName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  purpose: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  cutoutRow: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    marginVertical: 10,
  },
  dashedLine: {
    marginHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderStyle: 'dashed',
  },
  leftCutout: {
    position: 'absolute',
    left: -24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.bg,
  },
  rightCutout: {
    position: 'absolute',
    right: -24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.bg,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    gap: 2,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    ...Typography.micro,
    color: Colors.textMuted,
    fontWeight: '700',
    fontSize: 10,
  },
  infoValue: {
    ...Typography.label,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  syncNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentGlow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    marginTop: 10,
  },
  syncNoticeText: {
    ...Typography.micro,
    color: Colors.accent,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  qrBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  qrBtnCompleted: {
    backgroundColor: Colors.success + '18',
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  qrBtnText: {
    ...Typography.label,
    color: '#fff',
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.error + '12',
    borderWidth: 1,
    borderColor: Colors.error + '33',
  },
  cancelText: {
    ...Typography.label,
    color: Colors.error,
    fontWeight: '600',
  },
});
