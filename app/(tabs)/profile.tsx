import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Modal, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';

/* ─── Install Guide Modal ─────────────────────────────── */
function InstallStep({ num, icon, text }: { num: string; icon: string; text: string }) {
  return (
    <View style={guide.step}>
      <View style={guide.stepBubble}><Text style={guide.stepNum}>{num}</Text></View>
      <Ionicons name={icon as any} size={16} color={Colors.secondary} style={{ marginTop: 2 }} />
      <Text style={guide.stepText}>{text}</Text>
    </View>
  );
}

function InstallGuideModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={guide.root}>
        <View style={guide.header}>
          <Text style={guide.title}>📲 Cài đặt ứng dụng</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={guide.body} showsVerticalScrollIndicator={false}>
          <Text style={guide.subtitle}>Cài VKU Room như ứng dụng thật — miễn phí, không cần App Store!</Text>
          {[
            {
              platform: 'iPhone / iPad (Safari)', icon: 'logo-apple',
              iconColor: '#007AFF', iconBg: '#007AFF22',
              steps: [
                { num: '1', icon: 'share-outline',           text: 'Mở Safari → nhấn nút "Chia sẻ" ↑' },
                { num: '2', icon: 'add-circle-outline',      text: 'Chọn "Thêm vào MH chính"' },
                { num: '3', icon: 'checkmark-circle-outline',text: 'Nhấn "Thêm" → app toàn màn hình!' },
              ],
            },
            {
              platform: 'Android (Chrome)', icon: 'logo-android',
              iconColor: '#34A853', iconBg: '#34A85322',
              steps: [
                { num: '1', icon: 'ellipsis-vertical-outline', text: 'Mở Chrome → nhấn menu "⋮" góc trên' },
                { num: '2', icon: 'phone-portrait-outline',    text: 'Chọn "Thêm vào màn hình chính"' },
                { num: '3', icon: 'checkmark-circle-outline',  text: 'Nhấn "Thêm" — Chrome tự cài app.' },
              ],
            },
            {
              platform: 'Máy tính (Chrome / Edge)', icon: 'desktop-outline',
              iconColor: Colors.secondary, iconBg: Colors.secondaryGlow,
              steps: [
                { num: '1', icon: 'globe-outline',            text: 'Mở Chrome/Edge → truy cập link demo' },
                { num: '2', icon: 'download-outline',         text: 'Nhấn "⊕ Cài đặt" trên thanh địa chỉ' },
                { num: '3', icon: 'checkmark-circle-outline', text: 'Nhấn "Cài đặt" → chạy như app desktop.' },
              ],
            },
          ].map((p) => (
            <View key={p.platform} style={guide.section}>
              <View style={guide.sectionHeader}>
                <View style={[guide.platformIcon, { backgroundColor: p.iconBg }]}>
                  <Ionicons name={p.icon as any} size={22} color={p.iconColor} />
                </View>
                <Text style={guide.sectionTitle}>{p.platform}</Text>
              </View>
              {p.steps.map((s) => <InstallStep key={s.num} {...s} />)}
            </View>
          ))}
          <View style={guide.linkBox}>
            <Ionicons name="link-outline" size={16} color={Colors.secondary} />
            <Text style={guide.linkText}>vku-room-booking.vercel.app</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const guide = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  body: { padding: Spacing.md, paddingBottom: 40, gap: 12 },
  subtitle: { ...Typography.bodyMd, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  section: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, padding: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  platformIcon: {
    width: 40, height: 40, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { ...Typography.h4, color: Colors.textPrimary },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 10 },
  stepBubble: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  stepNum: { ...Typography.micro, color: '#fff' },
  stepText: { flex: 1, ...Typography.bodyMd, color: Colors.textSecondary, lineHeight: 20 },
  linkBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center',
    backgroundColor: Colors.secondaryGlow, borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderBlueGlow,
  },
  linkText: { ...Typography.label, color: Colors.secondary },
});

/* ─── Stat Card ───────────────────────────────────────── */
function StatCard({ icon, value, label, color }: {
  icon: string; value: number; label: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + '33' }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ─── Menu Item ───────────────────────────────────────── */
function MenuItem({ icon, iconBg, iconColor, label, onPress, danger = false }: {
  icon: string; iconBg: string; iconColor: string;
  label: string; onPress: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      id={`menu-${label}`}
      style={styles.menuItem} onPress={onPress} activeOpacity={0.75}
    >
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16}
        color={danger ? Colors.error + '88' : Colors.textMuted} />
    </TouchableOpacity>
  );
}

/* ─── Profile Screen ──────────────────────────────────── */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { getUserBookings } = useBookingStore();
  const [showInstall, setShowInstall] = useState(false);

  const bookings = getUserBookings(user?.id ?? '');
  const stats = {
    total:     bookings.length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    upcoming:  bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const initials = user?.name
    ?.split(' ').filter(Boolean).slice(-2)
    .map((w) => w[0]).join('').toUpperCase() ?? '?';

  const handleLogout = () => {
    const doLogout = async () => {
      await logout();
      await useBookingStore.getState().setCurrentUser(null);
      router.replace('/(auth)/login');
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Bạn có chắc muốn đăng xuất khỏi hệ thống VKU Room?');
      if (confirmed) {
        doLogout();
      }
    } else {
      Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất', style: 'destructive',
          onPress: doLogout,
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* ── Hero / Avatar ── */}
      <View style={styles.heroSection}>
        {/* Tri-color blobs */}
        <View style={[styles.blob, styles.blobRed]} />
        <View style={[styles.blob, styles.blobBlue]} />
        <View style={[styles.blob, styles.blobGold]} />

        <View style={styles.avatarGlow}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.name}>{user?.name}</Text>

        <View style={styles.mssvChip}>
          <Ionicons name="id-card-outline" size={14} color={Colors.primary} />
          <Text style={styles.mssvText}>{user?.mssv}</Text>
        </View>

        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.facultyChip}>
          <Ionicons name="school-outline" size={13} color={Colors.secondary} />
          <Text style={styles.facultyText}>{user?.faculty} · {user?.class}</Text>
        </View>
      </View>

      {/* ── Stats ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thống kê đặt phòng</Text>
      </View>
      <View style={styles.statsGrid}>
        <StatCard icon="calendar"        value={stats.total}     label="Tổng đặt"   color={Colors.primary} />
        <StatCard icon="checkmark-circle" value={stats.completed} label="Hoàn thành" color={Colors.success} />
        <StatCard icon="time"             value={stats.upcoming}  label="Sắp tới"    color={Colors.secondary} />
        <StatCard icon="close-circle"     value={stats.cancelled} label="Đã hủy"     color={Colors.error} />
      </View>

      {/* ── Menu ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tùy chọn</Text>
      </View>
      <View style={styles.menuCard}>
        <MenuItem icon="calendar-outline"      iconBg={Colors.primaryGlow}    iconColor={Colors.primary}
          label="Lịch sử đặt phòng"      onPress={() => router.push('/(tabs)/bookings')} />
        <View style={styles.menuDivider} />
        <MenuItem icon="notifications-outline" iconBg={Colors.accentGlow}     iconColor={Colors.accent}
          label="Cài đặt thông báo"       onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển.')} />
        <View style={styles.menuDivider} />
        <MenuItem icon="phone-portrait-outline" iconBg={Colors.secondaryGlow} iconColor={Colors.secondary}
          label="Cài đặt ứng dụng (PWA)" onPress={() => setShowInstall(true)} />
      </View>

      <View style={[styles.menuCard, styles.dangerCard]}>
        <MenuItem icon="log-out-outline" iconBg={Colors.error + '18'} iconColor={Colors.error}
          label="Đăng xuất" onPress={handleLogout} danger />
      </View>

      <Text style={styles.footer}>VKU Room · Khoa CNTT · v1.0.0</Text>

      <InstallGuideModal visible={showInstall} onClose={() => setShowInstall(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // ── Hero ──
  heroSection: {
    alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md, position: 'relative', overflow: 'hidden',
  },
  blob: {
    position: 'absolute', borderRadius: 999,
    // blobs positioned behind avatar
  },
  blobRed: {
    top: -40, left: -40, width: 180, height: 180,
    backgroundColor: Colors.primaryGlow,
  },
  blobBlue: {
    top: 20, right: -40, width: 160, height: 160,
    backgroundColor: Colors.secondaryGlow,
  },
  blobGold: {
    bottom: 10, left: '40%', width: 120, height: 120,
    backgroundColor: Colors.accentGlow,
  },

  // Avatar
  avatarGlow: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 2, borderColor: Colors.borderGlow,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.h1, color: '#fff' },
  name: { ...Typography.h2, color: Colors.textPrimary, marginBottom: 6 },
  mssvChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.borderGlow, marginBottom: 4,
  },
  mssvText: { ...Typography.label, color: Colors.primary },
  email: { ...Typography.caption, color: Colors.textMuted, marginBottom: 8 },
  facultyChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.secondaryGlow,
    borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.borderBlueGlow,
  },
  facultyText: { ...Typography.label, color: Colors.secondary },

  // ── Sections ──
  sectionHeader: {
    paddingHorizontal: Spacing.md, marginBottom: 10, marginTop: 4,
  },
  sectionTitle: { ...Typography.overline, color: Colors.textMuted },

  // ── Stats grid ──
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, gap: 10, marginBottom: Spacing.lg,
  },
  statCard: {
    width: '47%', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, borderWidth: 1,
    alignItems: 'center', paddingVertical: Spacing.md, gap: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: Colors.shadowOpacity * 0.5,
    shadowRadius: 6, elevation: 2,
  },
  statIconBox: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { ...Typography.h2 },
  statLabel: { ...Typography.micro, color: Colors.textMuted },

  // ── Menu ──
  menuCard: {
    backgroundColor: Colors.bgCard, marginHorizontal: Spacing.md,
    marginBottom: Spacing.md, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: Colors.shadowOpacity * 0.5,
    shadowRadius: 6, elevation: 2,
  },
  dangerCard: { borderColor: Colors.error + '33' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.md, gap: 14,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, ...Typography.body, color: Colors.textPrimary },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 66 },

  footer: {
    textAlign: 'center', ...Typography.micro,
    color: Colors.textMuted, marginVertical: Spacing.xl,
  },
});
