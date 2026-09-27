import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Alert, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { Colors, Spacing, Radius, Typography } from '../../constants/Colors';

export default function LoginScreen() {
  const [mssv, setMssv] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'mssv' | 'pw' | null>(null);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!mssv.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập MSSV và mật khẩu.');
      return;
    }
    setLoading(true);
    const ok = await login(mssv.trim(), password);
    setLoading(false);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Đăng nhập thất bại', 'MSSV hoặc mật khẩu không đúng.\n\nDemo: 21IT001 / 123456');
    }
  };

  const autofill = () => { setMssv('21IT001'); setPassword('123456'); };

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
          {/* Outer glow ring */}
          <View style={styles.logoGlowRing}>
            <View style={styles.logoRing}>
              <View style={styles.logoInner}>
                <Ionicons name="school" size={36} color={Colors.primary} />
              </View>
            </View>
          </View>

          <Text style={styles.appName}>VKU Room</Text>
          <Text style={styles.tagline}>Hệ thống đặt phòng học thông minh</Text>

          {/* VKU badge */}
          <View style={styles.institutionBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Đại học Công nghệ Việt – Hàn</Text>
          </View>
        </View>

        {/* ── Login card ── */}
        <View style={styles.card}>
          {/* Card top accent line */}
          <View style={styles.cardTopBar} />

          <Text style={styles.cardTitle}>Đăng nhập</Text>
          <Text style={styles.cardSubtitle}>Dùng tài khoản sinh viên VKU</Text>

          {/* MSSV */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mã số sinh viên</Text>
            <View style={[
              styles.inputWrap,
              focusedField === 'mssv' && styles.inputFocused,
            ]}>
              <View style={[
                styles.inputIconBox,
                focusedField === 'mssv' && styles.inputIconBoxFocused,
              ]}>
                <Ionicons
                  name="person-outline" size={17}
                  color={focusedField === 'mssv' ? '#fff' : Colors.textMuted}
                />
              </View>
              <TextInput
                id="input-mssv"
                style={styles.input}
                placeholder="VD: 21IT001"
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
            <View style={[
              styles.inputWrap,
              focusedField === 'pw' && styles.inputFocused,
            ]}>
              <View style={[
                styles.inputIconBox,
                focusedField === 'pw' && styles.inputIconBoxFocused,
              ]}>
                <Ionicons
                  name="lock-closed-outline" size={17}
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
                  size={17} color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Demo autofill hint */}
          <TouchableOpacity
            id="btn-autofill"
            style={styles.demoBox}
            onPress={autofill}
            activeOpacity={0.7}
          >
            <View style={styles.demoIconBox}>
              <Ionicons name="flash" size={13} color={Colors.accent} />
            </View>
            <Text style={styles.demoText}>
              Demo: <Text style={styles.demoBold}>21IT001</Text>{' / '}<Text style={styles.demoBold}>123456</Text>
              {'  ·  '}Nhấn để điền tự động
            </Text>
          </TouchableOpacity>

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
          <Text style={styles.footerText}>Khoa CNTT · VKU © 2025</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    flexGrow: 1, justifyContent: 'center',
    padding: Spacing.md, paddingVertical: Spacing.xl,
  },

  // ── Blobs ──
  blobTR: {
    position: 'absolute', top: -100, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: Colors.primaryGlow,
  },
  blobBL: {
    position: 'absolute', bottom: -60, left: -60,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.secondaryGlow,
  },
  blobCenter: {
    position: 'absolute', top: '35%', left: '50%',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: Colors.accentGlow,
    transform: [{ translateX: -70 }],
  },

  // ── Logo ──
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logoGlowRing: {
    width: 116, height: 116, borderRadius: 58,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: Colors.borderGlow,
    backgroundColor: Colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  logoInner: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    ...Typography.h1,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  institutionBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.primaryGlow,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7,
    marginTop: Spacing.sm,
    borderWidth: 1, borderColor: Colors.borderGlow,
  },
  badgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  badgeText: { ...Typography.label, color: Colors.primary },

  // ── Card ──
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3,
    // 3-color gradient bar (simulated with 3 divs isn't possible — use primary)
    backgroundColor: Colors.primary,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginTop: 6, marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // ── Fields ──
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: {
    ...Typography.label, color: Colors.textSecondary, marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, height: 52,
    overflow: 'hidden',
  },
  inputFocused: { borderColor: Colors.primary },
  inputIconBox: {
    width: 48, alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: Colors.border,
    height: '100%',
  },
  inputIconBoxFocused: {
    backgroundColor: Colors.primary,
    borderRightColor: Colors.primary,
  },
  input: {
    flex: 1, height: 52, paddingHorizontal: 12,
    color: Colors.textPrimary, ...Typography.body,
  },
  eyeBtn: {
    width: 44, height: 52, alignItems: 'center', justifyContent: 'center',
  },

  // ── Demo hint ──
  demoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.accentGlow,
    borderRadius: Radius.sm, padding: 10, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGoldGlow,
  },
  demoIconBox: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.accent + '33',
    alignItems: 'center', justifyContent: 'center',
  },
  demoText: { ...Typography.caption, color: Colors.textSecondary, flex: 1 },
  demoBold: { color: Colors.accent, fontWeight: '700' },

  // ── Login button ──
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: Colors.primary,
    borderRadius: Radius.md, height: 54, marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 7,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { ...Typography.h4, color: '#fff' },

  // ── Footer ──
  footer: { alignItems: 'center', gap: 6 },
  footerBar: { flexDirection: 'row', gap: 8 },
  footerDot: { width: 7, height: 7, borderRadius: 3.5 },
  footerText: { ...Typography.caption, color: Colors.textMuted },
});
