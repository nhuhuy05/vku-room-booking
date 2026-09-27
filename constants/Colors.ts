import { Platform, Appearance } from 'react-native';

// ─── VKU Brand Design Tokens ──────────────────────────────────────
// Ocean Blue · Tech Cyan · Amber Gold
// Dark:  Deep Oceanic Midnight background, vibrant cyan & sky blue
// Light: Crisp Ice White & Sky subtle background, deep ocean blue
// ──────────────────────────────────────────────────────────────────

const dark = {
  // ── Brand ──
  primary: '#0EA5E9',          // Electric Ocean Sky Blue
  primaryDark: '#0284C7',
  primaryLight: '#38BDF8',
  primaryGlow: '#0EA5E926',

  secondary: '#06B6D4',        // High-tech Cyan
  secondaryDark: '#0891B2',
  secondaryLight: '#67E8F9',
  secondaryGlow: '#06B6D420',

  accent: '#F59E0B',           // Amber Gold
  accentDark: '#D97706',
  accentLight: '#FCD34D',
  accentGlow: '#F59E0B20',

  warning: '#F59E0B',
  error: '#F43F5E',
  success: '#10B981',

  // ── Backgrounds — Deep oceanic midnight ──
  bg: '#050D1A',
  bgSubtle: '#09162B',
  bgCard: '#0F213D',
  bgCardHover: '#162F56',
  bgModal: '#0F213D',
  bgInput: '#132849',
  bgGlass: 'rgba(15,33,61,0.88)',

  // ── Text ──
  textPrimary: '#F0F9FF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#050D1A',

  // ── Borders ──
  border: '#1B3559',
  borderLight: '#264B7D',
  borderGlow: '#0EA5E933',
  borderBlueGlow: '#06B6D433',
  borderGoldGlow: '#F59E0B33',

  // ── Time slot states ──
  slotAvailable: '#10B98118',
  slotAvailableBorder: '#10B981',
  slotBooked: '#F43F5E18',
  slotBookedBorder: '#F43F5E',
  slotMine: '#0EA5E918',
  slotMineBorder: '#0EA5E9',
  slotPast: '#132849',
  slotPastBorder: '#1B3559',

  // ── Room status ──
  statusAvailable: '#10B981',
  statusOccupied: '#F43F5E',
  statusMaintenance: '#F59E0B',

  // ── Tab bar ──
  tabActive: '#38BDF8',
  tabInactive: '#64748B',
  tabBar: '#09162B',
  tabBarBorder: '#1B3559',

  // ── Shadow ──
  shadow: '#000000',
  shadowOpacity: 0.5,
};

const light = {
  // ── Brand ──
  primary: '#0284C7',          // Oceanic Blue 600
  primaryDark: '#0369A1',
  primaryLight: '#38BDF8',
  primaryGlow: '#0284C71A',

  secondary: '#0891B2',        // Cyan 600
  secondaryDark: '#0E7490',
  secondaryLight: '#06B6D4',
  secondaryGlow: '#0891B21A',

  accent: '#D97706',           // Amber Gold
  accentDark: '#B45309',
  accentLight: '#FCD34D',
  accentGlow: '#D977061A',

  warning: '#D97706',
  error: '#E11D48',
  success: '#059669',

  // ── Backgrounds — Crisp ice white ──
  bg: '#F8FAFC',
  bgSubtle: '#F0F9FF',
  bgCard: '#FFFFFF',
  bgCardHover: '#E0F2FE',
  bgModal: '#FFFFFF',
  bgInput: '#F0F9FF',
  bgGlass: 'rgba(255,255,255,0.92)',

  // ── Text ──
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // ── Borders ──
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
  borderGlow: '#0284C733',
  borderBlueGlow: '#0891B233',
  borderGoldGlow: '#D9770633',

  // ── Time slot states ──
  slotAvailable: '#05966918',
  slotAvailableBorder: '#059669',
  slotBooked: '#E11D4818',
  slotBookedBorder: '#E11D48',
  slotMine: '#0284C718',
  slotMineBorder: '#0284C7',
  slotPast: '#F1F5F9',
  slotPastBorder: '#E2E8F0',

  // ── Room status ──
  statusAvailable: '#059669',
  statusOccupied: '#E11D48',
  statusMaintenance: '#D97706',

  // ── Tab bar ──
  tabActive: '#0284C7',
  tabInactive: '#94A3B8',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',

  // ── Shadow ──
  shadow: '#0284C7',
  shadowOpacity: 0.08,
};

// ── Auto scheme detection ──
function getScheme() {
  const scheme = Appearance.getColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const Colors = Platform.select({
  web: light,
  default: getScheme(),
}) ?? light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Typography = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1:      { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2:      { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3:      { fontSize: 18, fontWeight: '700' as const },
  h4:      { fontSize: 16, fontWeight: '700' as const },
  body:    { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodyMd:  { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  label:   { fontSize: 13, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  micro:   { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.3 },
  overline:{ fontSize: 10, fontWeight: '700' as const, letterSpacing: 1, textTransform: 'uppercase' as const },
};
