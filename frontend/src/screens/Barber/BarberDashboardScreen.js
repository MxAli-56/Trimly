import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TodayAppointmentCard from '../../components/barber/TodayAppointmentCard';
import Colors from '../../constants/Colors';
import useAuthStore from '../../store/useAuthStore';
import useBarberStore from '../../store/useBarberStore';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () =>
  new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();

const splitTime = (iso) => {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return { clock: `${h}:${m}`, period };
};

const minutesUntil = (iso) => Math.round((new Date(iso) - new Date()) / 60000);

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

const STATUS = {
  PENDING: {
    label: 'Pending',
    bg: '#FCEBDD',
    border: '#F2C9A5',
    color: '#C2661F',
  },

  PENDING_BARBER_APPROVAL: {
    label: 'Pending',
    bg: '#FCEBDD',
    border: '#F2C9A5',
    color: '#C2661F',
  },

  ACCEPTED: {
    label: 'Awaiting payment',
    bg: '#FDF4D9',
    border: '#EBD9A0',
    color: '#8A6A12',
  },

  CONFIRMED: {
    label: 'Confirmed',
    bg: '#E6F3EA',
    border: '#B9DCC5',
    color: '#2F7A4D',
  },

  IN_PROGRESS: {
    label: 'In progress',
    bg: '#EAF0F8',
    border: '#C5D4EA',
    color: '#3B63A0',
  },

  COMPLETED: {
    label: 'Completed',
    bg: '#EAF0F8',
    border: '#C5D4EA',
    color: '#3B63A0',
  },

  REJECTED: {
    label: 'Rejected',
    bg: '#FCEAEA',
    border: '#F2D8D8',
    color: '#B33A3A',
  },

  CANCELLED: {
    label: 'Cancelled',
    bg: '#FCEAEA',
    border: '#F2D8D8',
    color: '#B33A3A',
  },
};

const INACTIVE = ['COMPLETED', 'CANCELLED', 'REJECTED'];

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function BarberDashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const {
    appointments,
    stats,
    isAvailable,
    dashboardLoading,
    fetchDashboard,
    toggleAvailability,
    setAvailable,
  } = useBarberStore();

  const [refreshing, setRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const handleAvailabilityChange = async (value) => {
    if (availabilityLoading) return;

    setAvailabilityLoading(true);

    try {
      await toggleAvailability(value);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const name = user?.name || 'Barber';
  const profilePhoto = user?.profilePhoto;

  /* ---------------------------- data ------------------------------- */

  useEffect(() => {
    setAvailable(user?.barberProfile?.isAvailable);
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------- derived ------------------------------ */

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [appointments]
  );

  const upcoming = useMemo(
    () =>
      sorted.filter(
        (a) => !INACTIVE.includes(a.status) && minutesUntil(a.startTime) >= -15
      ),
    [sorted]
  );

  const next = upcoming[0];
  const total = stats.total || appointments.length;
  const completed =
    stats.completed || appointments.filter((a) => a.status === 'COMPLETED').length;

  const weekly = stats.weekly || [];
  const maxCount = Math.max(...weekly.map((w) => w.count), 1);
  const weekTotal = weekly.reduce((sum, w) => sum + w.count, 0);
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  /* --------------------------- pieces ------------------------------ */

  const StatusPill = ({ status }) => {
    const s = STATUS[status] || STATUS.PENDING_BARBER_APPROVAL;
    return (
      <View style={[styles.pill, { backgroundColor: s.bg, borderColor: s.border }]}>
        <Text style={[styles.pillText, { color: s.color }]}>{s.label}</Text>
      </View>
    );
  };

  const SummaryCard = ({ icon, value, label }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons name={icon} size={17} color={Colors.textGold} />
      </View>
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  /* ---------------------------- UI --------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons name="content-cut" size={21} color={Colors.accent} />
          <Text style={styles.brandTitle}>Trimly</Text>
          <View style={styles.brandDot} />
        </View>

        <View style={styles.headerRight}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>BARBER PORTAL</Text>
          </View>

          <TouchableOpacity
            style={styles.headerAvatar}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-outline" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.secondary}
            colors={[Colors.secondary]}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={styles.dateText}>{formatDate()}</Text>
            <Text style={styles.greeting} numberOfLines={1}>
              {getGreeting()}, {name.split(' ')[0]}
            </Text>

            <View style={styles.summaryPill}>
              <View style={styles.summaryDot} />
              <Text style={styles.summaryPillText}>
                {appointments.length === 1
                  ? '1 Appointment Today'
                  : `${appointments.length} Appointments Today`}
              </Text>
            </View>
          </View>

          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.greetingAvatar} />
          ) : (
            <View style={[styles.greetingAvatar, styles.greetingAvatarFallback]}>
              <Ionicons name="person" size={26} color={Colors.textGold} />
            </View>
          )}
        </View>

        {/* Availability */}
        <View style={styles.availabilityCard}>
          <View style={[styles.availabilityDot, !isAvailable && styles.availabilityDotOff]} />
          <Text style={styles.availabilityText}>
            {isAvailable ? 'Accepting bookings' : 'Not accepting bookings'}
          </Text>
          <Switch
            value={isAvailable}
            onValueChange={handleAvailabilityChange}
            disabled={availabilityLoading}
            trackColor={{
              false: Colors.border,
              true: Colors.accent,
            }}
            thumbColor={Colors.white}
          />
        </View>

        {dashboardLoading && !refreshing ? (
          <ActivityIndicator color={Colors.secondary} style={{ marginVertical: 60 }} />
        ) : (
          <>
            {/* Today's numbers */}
            <View style={styles.summaryRow}>
              <SummaryCard icon="calendar-check-outline" value={total} label="Appointments" />
              <SummaryCard icon="check-circle-outline" value={completed} label="Completed" />
              <SummaryCard
                icon="cash-multiple"
                value={formatMoney(stats.earnings)}
                label="Earnings"
              />
            </View>

            {/* Up next */}

            {/* Today's schedule */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>TODAY'S SCHEDULE</Text>
              <Text style={styles.sectionCount}>{sorted.length} total</Text>
            </View>

            {sorted.length > 0 ? (
              sorted.slice(0, 4).map((appointment) => (
                <TodayAppointmentCard
                  key={appointment._id || appointment.id}
                  appointment={appointment}
                  onPress={() =>
                    navigation.navigate('AppointmentDetails', {
                      appointmentId: appointment._id || appointment.id,
                    })
                  }
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="calendar-blank-outline"
                  size={26}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  No appointments today
                </Text>
                <Text style={styles.emptySub}>
                  Your schedule is currently empty.
                </Text>
              </View>
            )}

            {/* View all */}
            <TouchableOpacity
              style={styles.viewAll}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Appointments')}
            >
              <Text style={styles.viewAllText}>View all appointments</Text>
              <Ionicons name="chevron-forward" size={15} color={Colors.primary} />
            </TouchableOpacity>

            {/* Weekly performance (shown only when the backend provides data) */}
            {weekly.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>WEEKLY PERFORMANCE</Text>

                <View style={styles.weekCard}>
                  <View style={styles.weekHeader}>
                    <View>
                      <Text style={styles.weekTitle}>This week</Text>
                      <Text style={styles.weekSub}>Appointments per day</Text>
                    </View>
                    <View style={styles.weekTotal}>
                      <Text style={styles.weekTotalNumber}>{weekTotal}</Text>
                      <Text style={styles.weekTotalLabel}>total</Text>
                    </View>
                  </View>

                  <View style={styles.chart}>
                    {weekly.map((w, i) => {
                      const h = Math.max((w.count / maxCount) * 72, 4);
                      const isToday = i === todayIndex;
                      return (
                        <View key={w.day} style={styles.barCol}>
                          <Text style={styles.barValue}>{w.count || ''}</Text>
                          <View
                            style={[
                              styles.bar,
                              { height: h },
                              isToday ? styles.barToday : styles.barNormal,
                            ]}
                          />
                          <Text style={[styles.barDay, isToday && styles.barDayToday]}>{w.day}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            {/* Quick links */}
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Stats')}
              >
                <Ionicons name="stats-chart-outline" size={16} color={Colors.textGold} />
                <Text style={styles.quickText}>View Stats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Reviews')}
              >
                <Ionicons name="star-outline" size={16} color={Colors.textGold} />
                <Text style={styles.quickText}>Reviews</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },

  /* header (dark, same as barber profile) */
  header: {
    height: 56,
    paddingHorizontal: 18,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  brandTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 7,
    fontFamily: 'serif',
  },
  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginLeft: 5,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  roleBadge: {
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 10,
  },
  roleBadgeText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* light body */
  scrollView: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 30 },

  /* greeting */
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetingText: { flex: 1, paddingRight: 12 },
  dateText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  greeting: { color: Colors.text, fontSize: 26, fontWeight: '700', fontFamily: 'serif' },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 10,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginRight: 7,
  },
  summaryPillText: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  greetingAvatar: {
    width: 62,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  greetingAvatarFallback: {
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* availability */
  availabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 8,
  },
  availabilityDotOff: { backgroundColor: Colors.textMuted },
  availabilityText: { flex: 1, color: Colors.text, fontSize: 12, fontWeight: '600' },

  /* summary cards */
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    elevation: 2,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: { color: Colors.text, fontSize: 17, fontWeight: '800', maxWidth: '100%' },
  summaryLabel: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },

  /* section headers */
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  sectionHeading: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
    marginLeft: 4,
  },
  sectionCount: { color: Colors.textMuted, fontSize: 11, marginRight: 4 },
  inRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 9, marginRight: 4 },
  inText: { color: Colors.textGold, fontSize: 11, fontWeight: '700' },

  /* next appointment (dark hero card, like profile hero) */
  nextCard: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 16,
    marginBottom: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDark,
    elevation: 4,
  },
  orbitalRingOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 117, 0.07)',
    top: -110,
    right: -90,
  },
  orbitalRingInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 117, 0.1)',
    top: -60,
    right: -45,
  },
  nextTop: { flexDirection: 'row', alignItems: 'center' },
  nextAvatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  nextAvatarFallback: {
    backgroundColor: Colors.surfaceDarkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  nextName: { color: Colors.white, fontSize: 17, fontWeight: '700', fontFamily: 'serif' },
  nextService: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 14,
    marginBottom: 12,
  },
  timeBoxTime: { color: Colors.white, fontSize: 13, fontWeight: '800', marginLeft: 8 },
  timeBoxDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 9,
  },
  timeBoxDuration: { color: Colors.textMuted, fontSize: 12 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 13,
    paddingVertical: 13,
    gap: 7,
  },
  primaryButtonText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 22,
  },
  emptyTitle: { color: Colors.text, fontSize: 14, fontWeight: '700', marginTop: 8 },
  emptySub: { color: Colors.textSecondary, fontSize: 12, marginTop: 3, textAlign: 'center' },

  /* status pill */
  pill: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 4 },
  pillText: { fontSize: 10, fontWeight: '700' },

  /* schedule rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
    elevation: 1,
  },
  rowTime: { width: 52 },
  rowClock: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  rowPeriod: { color: Colors.textSecondary, fontSize: 10, marginTop: 1 },
  rowInfo: { flex: 1, marginRight: 8 },
  rowName: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  rowService: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },

  /* view all */
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 13,
    paddingVertical: 13,
    marginTop: 4,
    marginBottom: 22,
    gap: 4,
  },
  viewAllText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },

  /* weekly */
  weekCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 19,
    elevation: 2,
  },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  weekTitle: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  weekSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  weekTotal: { alignItems: 'flex-end' },
  weekTotalNumber: { color: Colors.textGold, fontSize: 22, fontWeight: '800' },
  weekTotalLabel: { color: Colors.textMuted, fontSize: 10 },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 14,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { color: Colors.textMuted, fontSize: 10, marginBottom: 4, height: 14 },
  bar: { width: 18, borderRadius: 6 },
  barNormal: { backgroundColor: 'rgba(229, 184, 117, 0.4)' },
  barToday: { backgroundColor: Colors.accent },
  barDay: { color: Colors.textMuted, fontSize: 10, marginTop: 6 },
  barDayToday: { color: Colors.textGold, fontWeight: '700' },

  /* quick buttons */
  quickRow: { flexDirection: 'row', gap: 10 },
  quickButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    paddingVertical: 14,
    gap: 7,
    elevation: 1,
  },
  quickText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
});
