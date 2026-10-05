import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types';
import { Colors, Spacing, Radius, Typography } from '../constants/Colors';

interface CheckInQRModalProps {
  visible: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCheckIn: (bookingId: string) => Promise<void> | void;
}

/**
 * Deterministic QR Pattern Generator (23x23 grid)
 * Creates Finder Patterns at 3 corners and data modules seeded by string
 */
function generateQRGrid(text: string, size = 23): boolean[][] {
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );

  // Helper: Draw 7x7 finder pattern
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  };

  // 1. Finder patterns at 3 corners
  drawFinder(0, 0); // Top-left
  drawFinder(size - 7, 0); // Top-right
  drawFinder(0, size - 7); // Bottom-left

  // 2. Timing lines
  for (let i = 8; i < size - 8; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // 3. Simple pseudo-random hash generator for payload modules
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  const isReserved = (r: number, c: number) => {
    // Top-left finder + separator
    if (r <= 7 && c <= 7) return true;
    // Top-right finder + separator
    if (r <= 7 && c >= size - 8) return true;
    // Bottom-left finder + separator
    if (r >= size - 8 && c <= 7) return true;
    // Timing lines
    if (r === 6 || c === 6) return true;
    return false;
  };

  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!isReserved(r, c)) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        grid[r][c] = seed % 3 !== 0;
      }
    }
  }

  return grid;
}

export function CheckInQRModal({
  visible,
  booking,
  onClose,
  onCheckIn,
}: CheckInQRModalProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const qrData = useMemo(() => {
    if (!booking) return '';
    return `${booking.passCode || booking.id}|${booking.roomId}|${booking.date}|${booking.startTime}`;
  }, [booking]);

  const qrMatrix = useMemo(() => {
    return generateQRGrid(qrData || 'VKU-ROOM-PASS');
  }, [qrData]);

  if (!booking) return null;

  // Trạng thái hoàn thành được xác định chính xác theo từng lượt đặt phòng riêng biệt
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';

  const handleSimulateScan = async () => {
    if (isCompleted || isCancelled) return;
    setIsCheckingIn(true);
    try {
      await onCheckIn(booking.id);
      if (Platform.OS === 'web') {
        alert(`🎉 Check-in thành công!\nPhòng ${booking.roomName} (${booking.startTime}–${booking.endTime}) đã được mở khóa.`);
      } else {
        Alert.alert(
          '🎉 Check-in thành công!',
          `Đã xác nhận phòng ${booking.roomName} (${booking.startTime}–${booking.endTime}).\nCửa phòng đã được mở khóa. Chúc bạn có buổi học hiệu quả!`,
          [{ text: 'Hoàn tất', onPress: onClose }]
        );
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể check-in. Vui lòng thử lại.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
              <Text style={styles.headerTitle}>Vé Check-in Phòng học</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* ── PASS TICKET CARD ── */}
            <View style={styles.ticket}>
              {/* Ticket Top: Room info */}
              <View style={styles.ticketTop}>
                <View style={styles.schoolBadge}>
                  <Text style={styles.schoolBadgeText}>VKU SMART CAMPUS</Text>
                </View>
                <Text style={styles.roomTitle}>{booking.roomName}</Text>
                <Text style={styles.purposeText} numberOfLines={1}>
                  Mục đích: {booking.purpose}
                </Text>

                <View style={styles.detailsRow}>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>NGÀY ĐẶT</Text>
                    <Text style={styles.detailVal}>{booking.date}</Text>
                  </View>
                  <View style={styles.detailCol}>
                    <Text style={styles.detailLabel}>KHUNG GIỜ</Text>
                    <Text style={[styles.detailVal, { color: Colors.secondary }]}>
                      {booking.startTime} – {booking.endTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Dashed Separator with Ticket Cutouts */}
              <View style={styles.cutoutRow}>
                <View style={styles.leftCutout} />
                <View style={styles.dashedLine} />
                <View style={styles.rightCutout} />
              </View>

              {/* Ticket Bottom: QR Code Section */}
              <View style={styles.ticketBottom}>
                <Text style={styles.passCodeLabel}>MÃ VÉ DUY NHẤT (PASS CODE)</Text>
                <View style={styles.passCodeBadge}>
                  <Text style={styles.passCodeText}>
                    {booking.passCode || `VKU-PASS-${booking.id.toUpperCase()}`}
                  </Text>
                </View>

                {/* QR Code Container with Viewfinder effect */}
                <View style={styles.qrContainer}>
                  <View style={styles.qrWrapper}>
                    {qrMatrix.map((row, rIdx) => (
                      <View key={rIdx} style={styles.qrRow}>
                        {row.map((col, cIdx) => (
                          <View
                            key={cIdx}
                            style={[
                              styles.qrCell,
                              col ? styles.qrCellBlack : styles.qrCellWhite,
                            ]}
                          />
                        ))}
                      </View>
                    ))}
                  </View>

                  {/* Corner Viewfinder brackets */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>

                {/* Status indicator */}
                <View style={styles.statusBox}>
                  {isCompleted ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-done-circle" size={16} color={Colors.success} />
                      <Text style={styles.completedText}>ĐÃ CHECK-IN THÀNH CÔNG</Text>
                    </View>
                  ) : isCancelled ? (
                    <View style={styles.cancelledBadge}>
                      <Ionicons name="close-circle" size={16} color={Colors.error} />
                      <Text style={styles.cancelledText}>VÉ ĐÃ BỊ HỦY</Text>
                    </View>
                  ) : (
                    <Text style={styles.guideText}>
                      Đưa mã QR trước camera/máy quét tại cửa phòng để check-in mở khóa.
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Interactive Simulation Button */}
            {!isCompleted && !isCancelled && (
              <TouchableOpacity
                id="btn-simulate-checkin"
                style={styles.checkInBtn}
                onPress={handleSimulateScan}
                disabled={isCheckingIn}
                activeOpacity={0.85}
              >
                <Ionicons name="scan-circle-outline" size={22} color="#fff" />
                <Text style={styles.checkInBtnText}>
                  {isCheckingIn ? 'Đang xác thực check-in...' : 'Mô phỏng Quét Check-in'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.dismissBtn} onPress={onClose}>
              <Text style={styles.dismissText}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  container: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  ticket: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  ticketTop: {
    padding: 16,
    backgroundColor: '#1E293B',
  },
  schoolBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
    marginBottom: 8,
  },
  schoolBadgeText: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 1,
  },
  roomTitle: {
    ...Typography.h2,
    color: '#F8FAFC',
  },
  purposeText: {
    ...Typography.caption,
    color: '#94A3B8',
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  detailCol: {
    gap: 2,
  },
  detailLabel: {
    ...Typography.micro,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailVal: {
    ...Typography.label,
    color: '#F1F5F9',
    fontWeight: '700',
  },
  cutoutRow: {
    position: 'relative',
    height: 24,
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  dashedLine: {
    marginHorizontal: 22,
    borderBottomWidth: 1.5,
    borderBottomColor: '#475569',
    borderStyle: 'dashed',
  },
  leftCutout: {
    position: 'absolute',
    left: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
  },
  rightCutout: {
    position: 'absolute',
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.bgCard,
  },
  ticketBottom: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  passCodeLabel: {
    ...Typography.micro,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  passCodeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#475569',
    marginTop: 4,
    marginBottom: 14,
  },
  passCodeText: {
    ...Typography.caption,
    color: Colors.accent,
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrContainer: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  qrWrapper: {
    width: 161,
    height: 161,
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 7,
    height: 7,
  },
  qrCellBlack: {
    backgroundColor: '#0F172A',
  },
  qrCellWhite: {
    backgroundColor: '#FFFFFF',
  },
  corner: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderColor: Colors.primary,
  },
  cornerTL: { top: 6, left: 6, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 6, right: 6, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 6, left: 6, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 6, right: 6, borderBottomWidth: 3, borderRightWidth: 3 },

  statusBox: {
    marginTop: 14,
    alignItems: 'center',
    width: '100%',
  },
  guideText: {
    ...Typography.micro,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.success + '55',
  },
  completedText: {
    ...Typography.micro,
    color: Colors.success,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.error + '22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.error + '55',
  },
  cancelledText: {
    ...Typography.micro,
    color: Colors.error,
    fontWeight: '800',
  },

  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInBtnText: {
    ...Typography.bodyMd,
    color: '#fff',
    fontWeight: '700',
  },
  dismissBtn: {
    paddingVertical: 10,
    marginTop: 6,
  },
  dismissText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
