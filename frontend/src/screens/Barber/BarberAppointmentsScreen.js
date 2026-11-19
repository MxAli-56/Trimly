
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
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import useBarberAppointmentsStore from '../../store/useBarberAppointmentsStore';
import BarberHeader from '../../components/Barber/BarberHeader';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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
  PENDING_CUSTOMER: {
    label: 'Awaiting customer',
    bg: '#FDF4D9',
    border: '#EBD9A0',
    color: '#8A6A12',
  },
  PENDING_CUSTOMER_RESCHEDULE: {
    label: 'Reschedule requested',
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

const DONE = ['COMPLETED', 'CANCELLED', 'REJECTED'];

const formatWhen = (value) => {
  if (!value) return 'Time unavailable';

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return 'Time unavailable';

  const now = new Date();

  const startOfDay = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate());

  const diffDays = Math.round(
    (startOfDay(d) - startOfDay(now)) / 86400000
  );

  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';

  h = h % 12 || 12;

  const time = `${h}:${m} ${period}`;

  let day;

  if (diffDays === 0) day = 'Today';
  else if (diffDays === 1) day = 'Tomorrow';
  else if (diffDays === -1) day = 'Yesterday';
  else {
    day = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return `${day}, ${time}`;
};

const getServicesText = (item) => {
  // Supports the backend's services array.
  if (Array.isArray(item.services) && item.services.length > 0) {
    return item.services
      .map((service) => service.name)
      .filter(Boolean)
      .join(', ');
  }

  // Supports the older single-service response.
  if (item.service?.name) {
    return item.service.name;
  }

  return 'Service';
};

const getDuration = (item) => {
  if (item.durationMinutes) return item.durationMinutes;

  if (Array.isArray(item.services)) {
    return item.services.reduce(
      (total, service) => total + Number(service.durationMinutes || 0),
      0
    ) || 30;
  }

  return 30;
};

export default function BarberAppointmentsScreen({ navigation }) {
  const {
    appointments,
    loading,
    actionId,
    fetchAppointments,
    confirmAppointment,
    startService,
    completeService,
  } = useBarberAppointmentsStore();

  const [tab, setTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await fetchAppointments();
    } finally {
      setRefreshing(false);
    }
  };

  /* -------------------------- derived ------------------------------ */

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => !DONE.includes(a.status))
        .sort(
          (a, b) =>
            new Date(a.startTime) - new Date(b.startTime)
        ),
    [appointments]
  );

  const completed = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'COMPLETED')
        .sort(
          (a, b) =>
            new Date(b.startTime) - new Date(a.startTime)
        ),
    [appointments]
  );

  const list = tab === 'upcoming' ? upcoming : completed;

  const openDetails = (id) => {
    navigation.navigate('AppointmentDetails', {
      appointmentId: id,
    });
  };

  /* --------------------------- pieces ------------------------------ */

  const StatusPill = ({ status }) => {
    const s = STATUS[status] || STATUS.PENDING;

    return (
      <View
        style={[
          styles.pill,
          {
            backgroundColor: s.bg,
            borderColor: s.border,
          },
        ]}
      >
        <Text style={[styles.pillText, { color: s.color }]}>
          {s.label}
        </Text>
      </View>
    );
  };

  const ActionButton = ({ item }) => {
    const busy = actionId === item._id;

    let config = null;

    // Initial booking request.
    if (
      item.status === 'PENDING' ||
      item.status === 'PENDING_BARBER_APPROVAL'
    ) {
      config = {
        icon: 'checkmark',
        label: 'Confirm',
        onPress: () => confirmAppointment(item._id),
      };
    } else if (item.status === 'CONFIRMED') {
      config = {
        icon: 'play',
        label: 'Start Service',
        onPress: () => startService(item._id),
      };
    } else if (item.status === 'IN_PROGRESS') {
      config = {
        icon: 'checkmark-done',
        label: 'Complete',
        onPress: () => completeService(item._id),
      };
    }

    // No action for statuses that require customer payment or response.
    if (!config) return null;

    return (
      <TouchableOpacity
        style={[styles.primaryButton, busy && styles.disabled]}
        onPress={config.onPress}
        disabled={busy}
        activeOpacity={0.85}
      >
        {busy ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <>
            <Ionicons
              name={config.icon}
              size={15}
              color={Colors.primary}
            />
            <Text style={styles.primaryButtonText}>
              {config.label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const AppointmentCard = ({ item }) => {
    const appointmentId = item._id || item.id;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          {item.customer?.profilePhoto ? (
            <Image
              source={{ uri: item.customer.profilePhoto }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Ionicons
                name="person"
                size={20}
                color={Colors.textMuted}
              />
            </View>
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {item.customer?.name || 'Customer'}
            </Text>

            <Text style={styles.serviceName} numberOfLines={2}>
              {getServicesText(item)}
            </Text>
          </View>

          <StatusPill status={item.status} />
        </View>

        <View style={styles.timeBox}>
          <Ionicons
            name="time-outline"
            size={16}
            color={Colors.textGold}
          />

          <Text style={styles.timeText}>
            {formatWhen(item.startTime)}
          </Text>

          <View style={styles.timeDot} />

          <Text style={styles.durationText}>
            {getDuration(item)} min
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionButton item={item} />

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              ![
                'PENDING',
                'PENDING_BARBER_APPROVAL',
                'CONFIRMED',
                'IN_PROGRESS',
              ].includes(item.status) && styles.fullWidthButton,
            ]}
            onPress={() => openDetails(appointmentId)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ---------------------------- UI --------------------------------- */

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
        {/* Title */}
        <Text style={styles.title}>Appointments</Text>

        <Text style={styles.subtitle}>
          Manage your client bookings
        </Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              tab === 'upcoming' && styles.tabActive,
            ]}
            onPress={() => setTab('upcoming')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'upcoming' && styles.tabTextActive,
              ]}
            >
              Upcoming ({upcoming.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              tab === 'completed' && styles.tabActive,
            ]}
            onPress={() => setTab('completed')}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.tabText,
                tab === 'completed' && styles.tabTextActive,
              ]}
            >
              Completed ({completed.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading && !refreshing ? (
          <ActivityIndicator
            color={Colors.secondary}
            style={{ marginVertical: 60 }}
          />
        ) : list.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name={
                tab === 'upcoming'
                  ? 'calendar-blank-outline'
                  : 'check-circle-outline'
              }
              size={30}
              color={Colors.textMuted}
            />

            <Text style={styles.emptyTitle}>
              {tab === 'upcoming'
                ? 'No upcoming appointments'
                : 'No completed appointments yet'}
            </Text>

            <Text style={styles.emptySub}>
              {tab === 'upcoming'
                ? 'New bookings from your clients will appear here.'
                : 'Finished services will be listed here.'}
            </Text>
          </View>
        ) : (
          list.map((item) => (
            <AppointmentCard
              key={item._id || item.id}
              item={item}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

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

  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 30,
  },

  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'serif',
  },

  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },

  tabActive: {
    backgroundColor: Colors.accent,
  },

  tabText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },

  tabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },

  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },

  avatarFallback: {
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  customerName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'serif',
  },

  serviceName: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },

  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 11,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 14,
    marginBottom: 12,
  },

  timeText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },

  timeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    marginHorizontal: 9,
  },

  durationText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 13,
    gap: 7,
  },

  primaryButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 13,
  },

  fullWidthButton: {
    flex: 1,
  },

  secondaryButtonText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  disabled: {
    opacity: 0.6,
  },

  pill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  pillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  emptyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },

  emptyTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
  },

  emptySub: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
});
