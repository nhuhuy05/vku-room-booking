import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';

const DEMO_ACCOUNTS = [
  {
    mssv: '21IT001',
    password: '123456',
    name: 'Nguyễn Văn An',
    class: 'CNTT21A',
    role: 'Tài khoản 1',
    avatarColor: Colors.primary,
  },
  {
    mssv: '21IT002',
    password: '123456',
    name: 'Trần Thị B',
    class: 'CNTT21B',
    role: 'Tài khoản 2',
    avatarColor: Colors.secondary,
  },
];

export default function LoginScreen() {
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'mssv' | 'pw' | null>(null);

  const { login } = useAuthStore();
  const { setCurrentUser } = useBookingStore();

  const handleLogin = async () => {
    if (!mssv.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập MSSV và mật khẩu.');
      return;
    }
    setLoading(true);
    const ok = await login(mssv.trim(), password);
    setLoading(false);
    if (ok) {
      const loggedUser = useAuthStore.getState().user;
      if (loggedUser) {
        await setCurrentUser(loggedUser);
      }
      router.replace('/(tabs)');
    } else {
      Alert.alert(
        'Đăng nhập thất bại',
        'MSSV hoặc mật khẩu không đúng.\n\nChọn 1 trong 2 tài khoản demo bên dưới để đăng nhập nhanh!'
      );
    }
  };

  const handleSelectDemo = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setMssv(acc.mssv);
    setPassword(acc.password);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Decorative blobs ── */}
        <View style={styles.blobTR} />
        <View style={styles.blobBL} />
        <View style={styles.blobCenter} />

        {/* ── Logo section ── */}
        <View style={styles.logoSection}>
          <View style={styles.logoGlowRing}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Ionicons name="school" size={36} color={Colors.primary} />
              </View>
            </View>
          </View>

          <Text style={styles.appName}>VKU Room</Text>
          <Text style={styles.tagline}>Hệ thống đặt phòng học thông minh</Text>

          <View style={styles.institutionBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Đại học Công nghệ Việt – Hàn</Text>
          </View>
        </View>

        {/* ── Login card ── */}
        <View style={styles.card}>
          <View style={styles.cardTopBar} />

          <Text style={styles.cardTitle}>Đăng nhập</Text>
          <Text style={styles.cardSubtitle}>Dùng tài khoản sinh viên VKU</Text>

          {/* MSSV */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mã số sinh viên</Text>
            <View
              style={[
                styles.inputWrap,
                focusedField === 'mssv' && styles.inputFocused,
              ]}
            >
              <View
                style={[
                  styles.inputIconBox,
                  focusedField === 'mssv' && styles.inputIconBoxFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={focusedField === 'mssv' ? '#fff' : Colors.textMuted}
                />
              </View>
              <TextInput
                id="input-mssv"
                style={styles.input}
                placeholder="VD: 21IT001 hoặc 21IT002"
                placeholderTextColor={Colors.textMuted}
                value={mssv}
                onChangeText={setMssv}
                autoCapitalize="characters"
                autoCorrect={false}
                onFocus={() => setFocusedField('mssv')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mật khẩu</Text>
            <View
              style={[
                styles.inputWrap,
                focusedField === 'pw' && styles.inputFocused,
              ]}
            >
              <View
                style={[
                  styles.inputIconBox,
                  focusedField === 'pw' && styles.inputIconBoxFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={focusedField === 'pw' ? '#fff' : Colors.textMuted}
                />
              </View>
              <TextInput
                id="input-password"
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={Colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                onFocus={() => setFocusedField('pw')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                id="btn-toggle-pw"
                onPress={() => setShowPw(!showPw)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPw ? 'eye-off-outline' : 'eye-outline'}
                  size={17}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 2 Demo Accounts Section ── */}
          <View style={styles.demoSection}>
            <View style={styles.demoSectionHeader}>
              <Ionicons name="sparkles" size={14} color={Colors.accent} />
              <Text style={styles.demoSectionTitle}>
                Tài khoản Demo (Nhấn để điền nhanh)
              </Text>
            </View>

            <View style={styles.demoCardsRow}>
              {DEMO_ACCOUNTS.map((acc) => {
                const isSelected = mssv === acc.mssv;
                return (
                  <TouchableOpacity
                    key={acc.mssv}
                    id={`btn-demo-${acc.mssv}`}
                    style={[
                      styles.demoAccountCard,
                      isSelected && styles.demoAccountCardActive,
                    ]}
                    onPress={() => handleSelectDemo(acc)}
                    activeOpacity={0.78}
                  >
                    <View style={styles.demoCardTop}>
                      <View
                        style={[
                          styles.demoAvatar,
                          { backgroundColor: acc.avatarColor + '20' },
                        ]}
                      >
                        <Ionicons
                          name="person"
                          size={13}
                          color={acc.avatarColor}
                        />
                      </View>
                      <View style={styles.demoRoleBadge}>
                        <Text style={styles.demoRoleText}>{acc.role}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.primary}
                          style={{ marginLeft: 'auto' }}
                        />
                      )}
                    </View>

                    <Text style={styles.demoName} numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text style={styles.demoMeta}>
                      MSSV:{' '}
                      <Text style={styles.demoHighlight}>{acc.mssv}</Text>
                    </Text>
                    <Text style={styles.demoSub}>
                      {acc.class} · Pass: {acc.password}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            id="btn-login"
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={styles.footerBar}>
            <View style={[styles.footerDot, { backgroundColor: Colors.primary }]} />
            <View style={[styles.footerDot, { backgroundColor: Colors.secondary }]} />
            <View style={[styles.footerDot, { backgroundColor: Colors.accent }]} />
          </View>
          <Text style={styles.footerText}>Khoa CNTT · VKU © 2026</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
    paddingVertical: Spacing.xl,
  },

  // ── Blobs ──
  blobTR: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.primaryGlow,
  },
  blobBL: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.secondaryGlow,
  },
  blobCenter: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.accentGlow,
    transform: [{ translateX: -70 }],
  },

  // ── Logo ──
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logoGlowRing: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  logoRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  appName: {
    ...Typography.h1,
    fontSize: 30,
    letterSpacing: -0.5,
    color: Colors.textPrimary,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.textMuted,
    marginTop: 4,
  },
  institutionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    marginTop: 10,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  badgeText: {
    ...Typography.micro,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Colors.shadowOpacity * 1.5,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  cardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  cardTitle: { ...Typography.h2, color: Colors.textPrimary },
  cardSubtitle: {
    ...Typography.bodyMd,
    color: Colors.textMuted,
    marginTop: 3,
    marginBottom: Spacing.lg,
  },

  // ── Fields ──
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    height: 52,
    overflow: 'hidden',
  },
  inputFocused: { borderColor: Colors.primary },
  inputIconBox: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    height: '100%',
  },
  inputIconBoxFocused: {
    backgroundColor: Colors.primary,
    borderRightColor: Colors.primary,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 12,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  eyeBtn: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── 2 Demo Accounts Section ──
  demoSection: {
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  demoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  demoSectionTitle: {
    ...Typography.micro,
    color: Colors.accent,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  demoCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoAccountCard: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  demoAccountCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  demoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  demoAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoRoleBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  demoRoleText: {
    ...Typography.micro,
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  demoName: {
    ...Typography.label,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  demoMeta: {
    ...Typography.micro,
    color: Colors.textMuted,
  },
  demoHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  demoSub: {
    ...Typography.micro,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // ── Login button ──
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 7,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { ...Typography.h4, color: '#fff' },

  // ── Footer ──
  footer: { alignItems: 'center', gap: 6 },
  footerBar: { flexDirection: 'row', gap: 8 },
  footerDot: { width: 7, height: 7, borderRadius: 3.5 },
  footerText: { ...Typography.caption, color: Colors.textMuted },
});
