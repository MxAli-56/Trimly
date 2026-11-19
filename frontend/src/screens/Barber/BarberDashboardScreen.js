
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

import TodayAppointmentCard from '../../components/Barber/TodayAppointmentCard';
import Colors from '../../constants/Colors';
import useAuthStore from '../../store/useAuthStore';
import useBarberStore from '../../store/useBarberStore';
import BarberHeader from '../../components/Barber/BarberHeader';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const getGreeting = () => {
  const h = new Date().getHours();

  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';

  return 'Good evening';
};

const formatDate = () =>
  new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();

const minutesUntil = (iso) =>
  Math.round((new Date(iso) - new Date()) / 60000);

const formatMoney = (n) =>
  `Rs ${Number(n || 0).toLocaleString('en-PK')}`;

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
/* Screen                                                             */
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

    // Daily timeline
    dailyTimeline,
    timelineLoading,
    timelineError,
    fetchDailyTimeline,
  } = useBarberStore();

  const [refreshing, setRefreshing] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  const name = user?.name || 'Barber';
  const profilePhoto = user?.profilePhoto;

  /* ---------------------------- Data ------------------------------- */

  useEffect(() => {
    setAvailable(user?.barberProfile?.isAvailable);

    fetchDashboard();
    fetchDailyTimeline();
  }, [
    user?.barberProfile?.isAvailable,
    setAvailable,
    fetchDashboard,
    fetchDailyTimeline,
  ]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        fetchDashboard(),
        fetchDailyTimeline(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  /* ------------------------ Availability --------------------------- */

  const handleAvailabilityChange = async (value) => {
    if (availabilityLoading) return;

    setAvailabilityLoading(true);

    try {
      await toggleAvailability(value);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  /* -------------------------- Derived ------------------------------ */

  const sorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      ),
    [appointments]
  );

  const upcoming = useMemo(
    () =>
      sorted.filter(
        (a) =>
          !INACTIVE.includes(a.status) &&
          minutesUntil(a.startTime) >= -15
      ),
    [sorted]
  );

  const total = stats.total || appointments.length;

  const completed =
    stats.completed ||
    appointments.filter((a) => a.status === 'COMPLETED').length;

  const weekly = stats.weekly || [];

  const maxCount = Math.max(
    ...weekly.map((w) => w.count),
    1
  );

  const weekTotal = weekly.reduce(
    (sum, w) => sum + w.count,
    0
  );

  const todayIndex = (new Date().getDay() + 6) % 7;

  /* ------------------------- Components ---------------------------- */

  const SummaryCard = ({ icon, value, label }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color={Colors.textGold}
        />
      </View>

      <Text
        style={styles.summaryValue}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  /* ---------------------- Timeline Helpers ------------------------- */

  const getTimelineSlotStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return styles.slotAvailable;

      case 'BOOKED':
        return styles.slotBooked;

      case 'BLOCKED':
        return styles.slotBlocked;

      default:
        return styles.slotUnknown;
    }
  };

  const getTimelineTextStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return styles.slotAvailableText;

      case 'BOOKED':
        return styles.slotBookedText;

      case 'BLOCKED':
        return styles.slotBlockedText;

      default:
        return styles.slotUnknownText;
    }
  };

  /* ---------------------- Timeline Section ------------------------ */

  const renderTimeline = () => {
    if (timelineLoading && !dailyTimeline) {
      return (
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View>
              <Text style={styles.timelineTitle}>
                Today's Availability
              </Text>
              <Text style={styles.timelineSubtitle}>
                Your working hours and time slots
              </Text>
            </View>

            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color={Colors.textGold}
            />
          </View>

          <ActivityIndicator
            color={Colors.secondary}
            style={{ marginVertical: 25 }}
          />
        </View>
      );
    }

    if (timelineError && !dailyTimeline) {
      return (
        <View style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <View>
              <Text style={styles.timelineTitle}>
                Today's Availability
              </Text>
              <Text style={styles.timelineSubtitle}>
                Your working hours and time slots
              </Text>
            </View>

            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color={Colors.textGold}
            />
          </View>

          <View style={styles.timelineEmpty}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={28}
              color="#B33A3A"
            />

            <Text style={styles.timelineError}>
              {timelineError}
            </Text>

            <TouchableOpacity
              onPress={() => fetchDailyTimeline()}
              style={styles.retryButton}
            >
              <Text style={styles.timelineRetry}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!dailyTimeline) return null;

    const slots = dailyTimeline.timeline || [];

    return (
      <View style={styles.timelineCard}>
        {/* Header */}
        <View style={styles.timelineHeader}>
          <View>
            <Text style={styles.timelineTitle}>
              Today's Availability
            </Text>

            <Text style={styles.timelineSubtitle}>
              Your working hours and time slots
            </Text>
          </View>

          <MaterialCommunityIcons
            name="clock-outline"
            size={22}
            color={Colors.textGold}
          />
        </View>

        {/* Non-working day */}
        {!dailyTimeline.isWorkingDay ? (
          <View style={styles.timelineEmpty}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={30}
              color={Colors.textMuted}
            />

            <Text style={styles.timelineEmptyTitle}>
              Non-working day
            </Text>

            <Text style={styles.timelineSubtitle}>
              You are not scheduled to work today.
            </Text>
          </View>
        ) : (
          <>
            {/* Working hours and bookings */}
            <View style={styles.workingHours}>
              <View>
                <Text style={styles.workingHoursLabel}>
                  WORKING HOURS
                </Text>

                <Text style={styles.workingHoursValue}>
                  {dailyTimeline.workingHours?.start || '--:--'}
                  {' - '}
                  {dailyTimeline.workingHours?.end || '--:--'}
                </Text>
              </View>

              <View style={styles.bookingCount}>
                <Text style={styles.bookingCountValue}>
                  {dailyTimeline.totalBookings ?? 0}
                </Text>

                <Text style={styles.bookingCountLabel}>
                  Bookings
                </Text>
              </View>
            </View>

            <View style={styles.timelineDivider} />

            {/* Slots header */}
            <View style={styles.timelineSlotsHeader}>
              <Text style={styles.timelineSlotsTitle}>
                TIME SLOTS
              </Text>

              <Text style={styles.timelineSlotCount}>
                {slots.length} slots
              </Text>
            </View>

            {/* Slots */}
            {slots.length > 0 ? (
              <View style={styles.timelineSlots}>
                {slots.map((slot, index) => {
                  const status = String(
                    slot.status || 'UNKNOWN'
                  ).toUpperCase();

                  return (
                    <View
                      key={`${slot.time}-${index}`}
                      style={[
                        styles.timelineSlot,
                        getTimelineSlotStyle(status),
                      ]}
                    >
                      <Text style={styles.timelineSlotTime}>
                        {slot.time}
                      </Text>

                      <Text
                        style={[
                          styles.timelineSlotStatus,
                          getTimelineTextStyle(status),
                        ]}
                      >
                        {status.replace(/_/g, ' ')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noSlotsText}>
                No time slots available for today.
              </Text>
            )}

            {/* Legend */}
            <View style={styles.timelineLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    styles.legendAvailable,
                  ]}
                />
                <Text style={styles.legendText}>
                  Available
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    styles.legendBooked,
                  ]}
                />
                <Text style={styles.legendText}>
                  Booked
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    styles.legendBlocked,
                  ]}
                />
                <Text style={styles.legendText}>
                  Blocked
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Background refresh indicator */}
        {timelineLoading && (
          <ActivityIndicator
            color={Colors.secondary}
            size="small"
            style={{ marginTop: 12 }}
          />
        )}

        {/* Refresh error when old data is available */}
        {timelineError && dailyTimeline && (
          <Text style={styles.timelineRefreshError}>
            Could not refresh timeline: {timelineError}
          </Text>
        )}
      </View>
    );
  };

  /* ----------------------------- UI -------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary}
      />

      {/* Header */}
      <BarberHeader navigation={navigation} />

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
            <Text style={styles.dateText}>
              {formatDate()}
            </Text>

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
            <Image
              source={{ uri: profilePhoto }}
              style={styles.greetingAvatar}
            />
          ) : (
            <View
              style={[
                styles.greetingAvatar,
                styles.greetingAvatarFallback,
              ]}
            >
              <Ionicons
                name="person"
                size={26}
                color={Colors.textGold}
              />
            </View>
          )}
        </View>

        {/* Availability */}
        <View style={styles.availabilityCard}>
          <View
            style={[
              styles.availabilityDot,
              !isAvailable && styles.availabilityDotOff,
            ]}
          />

          <Text style={styles.availabilityText}>
            {isAvailable
              ? 'Accepting bookings'
              : 'Not accepting bookings'}
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

          {availabilityLoading && (
            <ActivityIndicator
              size="small"
              color={Colors.secondary}
              style={{ marginLeft: 8 }}
            />
          )}
        </View>

        {dashboardLoading && !refreshing ? (
          <ActivityIndicator
            color={Colors.secondary}
            style={{ marginVertical: 60 }}
          />
        ) : (
          <>
            {/* Daily Timeline */}
            {renderTimeline()}

            {/* Today's numbers */}
            <View style={styles.summaryRow}>
              <SummaryCard
                icon="calendar-check-outline"
                value={total}
                label="Appointments"
              />

              <SummaryCard
                icon="check-circle-outline"
                value={completed}
                label="Completed"
              />

              <SummaryCard
                icon="cash-multiple"
                value={formatMoney(stats.earnings)}
                label="Earnings"
              />
            </View>

            {/* Today's schedule */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                TODAY'S SCHEDULE
              </Text>

              <Text style={styles.sectionCount}>
                {sorted.length} total
              </Text>
            </View>

            {sorted.length > 0 ? (
              sorted.slice(0, 4).map((appointment) => (
                <TodayAppointmentCard
                  key={appointment._id || appointment.id}
                  appointment={appointment}
                  onPress={() =>
                    navigation.navigate('AppointmentDetails', {
                      appointmentId:
                        appointment._id || appointment.id,
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
              onPress={() =>
                navigation.navigate('Appointments')
              }
            >
              <Text style={styles.viewAllText}>
                View all appointments
              </Text>

              <Ionicons
                name="chevron-forward"
                size={15}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {/* Weekly performance */}
            {weekly.length > 0 && (
              <>
                <Text style={styles.sectionHeading}>
                  WEEKLY PERFORMANCE
                </Text>

                <View style={styles.weekCard}>
                  <View style={styles.weekHeader}>
                    <View>
                      <Text style={styles.weekTitle}>
                        This week
                      </Text>

                      <Text style={styles.weekSub}>
                        Appointments per day
                      </Text>
                    </View>

                    <View style={styles.weekTotal}>
                      <Text style={styles.weekTotalNumber}>
                        {weekTotal}
                      </Text>

                      <Text style={styles.weekTotalLabel}>
                        total
                      </Text>
                    </View>
                  </View>

                  <View style={styles.chart}>
                    {weekly.map((w, i) => {
                      const h = Math.max(
                        (w.count / maxCount) * 72,
                        4
                      );

                      const isToday = i === todayIndex;

                      return (
                        <View
                          key={w.day}
                          style={styles.barCol}
                        >
                          <Text style={styles.barValue}>
                            {w.count || ''}
                          </Text>

                          <View
                            style={[
                              styles.bar,
                              { height: h },
                              isToday
                                ? styles.barToday
                                : styles.barNormal,
                            ]}
                          />

                          <Text
                            style={[
                              styles.barDay,
                              isToday && styles.barDayToday,
                            ]}
                          >
                            {w.day}
                          </Text>
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
                <Ionicons
                  name="stats-chart-outline"
                  size={16}
                  color={Colors.textGold}
                />

                <Text style={styles.quickText}>
                  View Stats
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickButton}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Reviews')}
              >
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={Colors.textGold}
                />

                <Text style={styles.quickText}>
                  Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  /* Header */
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

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

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

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

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

  /* Body */
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 30,
  },

  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  greetingText: {
    flex: 1,
    paddingRight: 12,
  },

  dateText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  greeting: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'serif',
  },

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

  summaryPillText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

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

  /* Availability */
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

  availabilityDotOff: {
    backgroundColor: Colors.textMuted,
  },

  availabilityText: {
    flex: 1,
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  /* Timeline card */
  timelineCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 22,
    elevation: 2,
  },

  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timelineTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },

  timelineSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  workingHours: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 13,
    marginTop: 16,
  },

  workingHoursLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },

  workingHoursValue: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 5,
  },

  bookingCount: {
    alignItems: 'center',
  },

  bookingCountValue: {
    color: Colors.textGold,
    fontSize: 21,
    fontWeight: '800',
  },

  bookingCountLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
  },

  timelineDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },

  timelineSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  timelineSlotsTitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  timelineSlotCount: {
    color: Colors.textMuted,
    fontSize: 10,
  },

  timelineSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  timelineSlot: {
    width: '31%',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
  },

  slotAvailable: {
    backgroundColor: '#E6F3EA',
    borderColor: '#B9DCC5',
  },

  slotBooked: {
    backgroundColor: '#FCEAEA',
    borderColor: '#F2D8D8',
  },

  slotBlocked: {
    backgroundColor: '#FDF4D9',
    borderColor: '#EBD9A0',
  },

  slotUnknown: {
    backgroundColor: Colors.surfaceSecondary,
    borderColor: Colors.border,
  },

  timelineSlotTime: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '800',
  },

  timelineSlotStatus: {
    color: Colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
  },

  slotAvailableText: {
    color: '#2F7A4D',
  },

  slotBookedText: {
    color: '#B33A3A',
  },

  slotBlockedText: {
    color: '#8A6A12',
  },

  slotUnknownText: {
    color: Colors.textSecondary,
  },

  timelineLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  legendAvailable: {
    backgroundColor: '#2F7A4D',
  },

  legendBooked: {
    backgroundColor: '#B33A3A',
  },

  legendBlocked: {
    backgroundColor: '#8A6A12',
  },

  legendText: {
    color: Colors.textSecondary,
    fontSize: 10,
  },

  timelineEmpty: {
    alignItems: 'center',
    paddingVertical: 22,
  },

  timelineEmptyTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  timelineError: {
    color: '#B33A3A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },

  retryButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 7,
  },

  timelineRetry: {
    color: Colors.textGold,
    fontSize: 12,
    fontWeight: '800',
  },

  timelineRefreshError: {
    color: '#B33A3A',
    fontSize: 10,
    marginTop: 10,
  },

  noSlotsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 15,
  },

  /* Summary cards */
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

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

  summaryValue: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '800',
    maxWidth: '100%',
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },

  /* Section headings */
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

  sectionCount: {
    color: Colors.textMuted,
    fontSize: 11,
    marginRight: 4,
  },

  /* Empty state */
  emptyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    marginBottom: 22,
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  emptySub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
    textAlign: 'center',
  },

  /* View all */
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

  viewAllText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  /* Weekly performance */
  weekCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 19,
    elevation: 2,
  },

  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  weekTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  weekSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  weekTotal: {
    alignItems: 'flex-end',
  },

  weekTotalNumber: {
    color: Colors.textGold,
    fontSize: 22,
    fontWeight: '800',
  },

  weekTotalLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 14,
  },

  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  barValue: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 4,
    height: 14,
  },

  bar: {
    width: 18,
    borderRadius: 6,
  },

  barNormal: {
    backgroundColor: 'rgba(229, 184, 117, 0.4)',
  },

  barToday: {
    backgroundColor: Colors.accent,
  },

  barDay: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 6,
  },

  barDayToday: {
    color: Colors.textGold,
    fontWeight: '700',
  },

  /* Quick links */
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },

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

  quickText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
