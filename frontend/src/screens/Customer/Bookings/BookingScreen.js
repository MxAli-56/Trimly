
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/Colors';
import useAuthStore from '../../../store/useAuthStore';
import bookingService from '../../../services/bookingService';

const BookingsScreen = () => {
  const token = useAuthStore((state) => state.token);

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshingBookingId, setRefreshingBookingId] = useState(null);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (!token) {
      setBookings([]);
      setError('Please sign in to view your bookings.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response =
        activeTab === 'upcoming'
          ? await bookingService.getUpcomingBookings(token)
          : await bookingService.getPastBookings(token);

      const bookingList = Array.isArray(response)
        ? response
        : Array.isArray(response?.bookings)
          ? response.bookings
          : Array.isArray(response?.data?.bookings)
            ? response.data.bookings
            : [];

      setBookings(bookingList);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load your bookings. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, token]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const refreshBookingStatus = async (booking) => {
    const bookingId = booking._id || booking.bookingId;

    if (!bookingId || !token) {
      return;
    }

    setRefreshingBookingId(bookingId);

    try {
      const response = await bookingService.getBookingStatus(
        bookingId,
        token
      );

      const statusData =
        response?.data?.data ||
        response?.data ||
        response;

      if (!statusData?.status) {
        throw new Error('The booking status could not be retrieved.');
      }

      setBookings((currentBookings) =>
        currentBookings.map((item) => {
          const itemId = item._id || item.bookingId;

          if (itemId !== bookingId) {
            return item;
          }

          return {
            ...item,
            status: statusData.status,
            statusId: item.statusId
              ? {
                  ...item.statusId,
                  name: statusData.status,
                }
              : item.statusId,
            holdExpiresAt: statusData.holdExpiresAt,
          };
        })
      );
    } catch (err) {
      Alert.alert(
        'Unable to refresh status',
        err.response?.data?.message ||
          err.message ||
          'Please try again.'
      );
    } finally {
      setRefreshingBookingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Date unavailable';

    const datePart = String(date).slice(0, 10);
    const parsedDate = new Date(`${datePart}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return new Intl.DateTimeFormat('en-PK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsedDate);
  };

  const formatTime = (time) => {
    if (!time) return '';

    const [hour, minute] = time.split(':').map(Number);

    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return '';
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || '').toUpperCase();

    if (['CONFIRMED', 'IN_PROGRESS'].includes(normalized)) {
      return {
        backgroundColor: '#E6F1E9',
        color: '#34734A',
      };
    }

    if (normalized === 'COMPLETED') {
      return {
        backgroundColor: '#E8EAF0',
        color: '#515B72',
      };
    }

    if (normalized === 'EXPIRED') {
      return {
        backgroundColor: '#EAE9E6',
        color: '#77746E',
      };
    }

    if (
      normalized.includes('CANCELLED') ||
      ['REJECTED', 'NO_SHOW'].includes(normalized)
    ) {
      return {
        backgroundColor: '#F8E8E6',
        color: '#B64B43',
      };
    }

    return {
      backgroundColor: '#F5EEDF',
      color: '#A47A35',
    };
  };

  const renderBookingCard = (booking) => {
    const salon =
      booking.branchId && typeof booking.branchId === 'object'
        ? booking.branchId
        : booking.salonId && typeof booking.salonId === 'object'
          ? booking.salonId
          : booking.salon || {};

    const barber =
      booking.barberId && typeof booking.barberId === 'object'
        ? booking.barberId
        : booking.barber || {};

    const status = String(
      booking.status || booking.statusId?.name || 'PENDING'
    ).toUpperCase();

    const statusStyle = getStatusStyle(status);
    const isExpired = status === 'EXPIRED';

    const services = Array.isArray(booking.services)
      ? booking.services
      : [];

    const bookingDate = booking.date || booking.bookingDate;
    const bookingId = booking._id || booking.bookingId;

    const barberName =
      barber.name ||
      barber.fullName ||
      barber.userId?.name ||
      booking.barberName ||
      'Barber';

    const canRefreshStatus =
      activeTab === 'upcoming' &&
      ['PENDING', 'ACCEPTED'].includes(status);

    const isRefreshingThisBooking =
      refreshingBookingId === bookingId;

    return (
      <View
        key={bookingId}
        style={[
          styles.bookingCard,
          isExpired && styles.expiredBookingCard,
        ]}
      >
        <View style={styles.cardTop}>
          <View style={styles.salonInfo}>
            <View
              style={[
                styles.salonIcon,
                isExpired && styles.expiredSalonIcon,
              ]}
            >
              <Ionicons
                name="cut-outline"
                size={21}
                color={isExpired ? '#77746E' : Colors.secondary}
              />
            </View>

            <View style={styles.salonText}>
              <Text
                style={[
                  styles.salonName,
                  isExpired && styles.expiredText,
                ]}
                numberOfLines={1}
              >
                {salon.name || 'Salon'}
              </Text>

              <Text style={styles.salonAddress} numberOfLines={1}>
                {salon.address || 'Salon appointment'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.backgroundColor },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: statusStyle.color },
              ]}
            >
              {status
                .replace(/_/g, ' ')
                .toLowerCase()
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </Text>
          </View>
        </View>

        {canRefreshStatus && (
          <TouchableOpacity
            style={styles.statusRefreshButton}
            onPress={() => refreshBookingStatus(booking)}
            disabled={!!refreshingBookingId}
          >
            {isRefreshingThisBooking ? (
              <ActivityIndicator
                size="small"
                color={Colors.secondary}
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={15}
                color={Colors.secondary}
              />
            )}

            <Text style={styles.statusRefreshText}>
              {isRefreshingThisBooking
                ? 'Checking status...'
                : 'Refresh booking status'}
            </Text>
          </TouchableOpacity>
        )}

        {isExpired && (
          <View style={styles.expiredNotice}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color="#77746E"
            />

            <View style={styles.expiredNoticeContent}>
              <Text style={styles.expiredNoticeTitle}>
                Request expired
              </Text>

              <Text style={styles.expiredNoticeText}>
                This booking request is no longer active. You can
                make another appointment whenever you're ready.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.cardDivider} />

        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={17}
            color={isExpired ? '#99968F' : Colors.secondary}
          />
          <Text
            style={[
              styles.detailText,
              isExpired && styles.expiredDetailText,
            ]}
          >
            {formatDate(bookingDate)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="time-outline"
            size={17}
            color={isExpired ? '#99968F' : Colors.secondary}
          />
          <Text
            style={[
              styles.detailText,
              isExpired && styles.expiredDetailText,
            ]}
          >
            {formatTime(booking.startTime)}
            {booking.endTime
              ? ` – ${formatTime(booking.endTime)}`
              : ''}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="person-outline"
            size={17}
            color={isExpired ? '#99968F' : Colors.secondary}
          />
          <Text
            style={[
              styles.detailText,
              isExpired && styles.expiredDetailText,
            ]}
          >
            {barberName}
          </Text>
        </View>

        <View
          style={[
            styles.servicesSection,
            isExpired && styles.expiredServicesSection,
          ]}
        >
          <Text style={styles.sectionLabel}>SERVICES</Text>

          {services.length > 0 ? (
            services.map((service, index) => (
              <View
                key={
                  service.serviceId?._id ||
                  service.serviceId ||
                  index
                }
                style={styles.serviceRow}
              >
                <Text
                  style={[
                    styles.serviceName,
                    isExpired && styles.expiredDetailText,
                  ]}
                >
                  {service.name ||
                    service.serviceId?.name ||
                    'Service'}
                </Text>

                <Text
                  style={[
                    styles.servicePrice,
                    isExpired && styles.expiredDetailText,
                  ]}
                >
                  Rs.{' '}
                  {Number(service.price || 0).toLocaleString('en-PK')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.serviceName}>
              Service details unavailable
            </Text>
          )}
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
            <Text
              style={[
                styles.totalAmount,
                isExpired && styles.expiredText,
              ]}
            >
              Rs.{' '}
              {Number(booking.totalAmount || 0).toLocaleString('en-PK')}
            </Text>
          </View>

          <Text style={styles.appointmentCode}>
            {booking.appointmentCode || ''}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>YOUR APPOINTMENTS</Text>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>
            Keep track of your grooming appointments.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchBookings(true)}
          disabled={loading || refreshing}
        >
          <Ionicons
            name="refresh-outline"
            size={21}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'upcoming' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'past' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.activeTabText,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={Colors.secondary}
          />
          <Text style={styles.stateText}>
            Loading your bookings...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={Colors.textMuted}
          />

          <Text style={styles.stateTitle}>
            Something went wrong
          </Text>

          <Text style={styles.stateText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBookings()}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(true)}
              tintColor={Colors.secondary}
            />
          }
        >
          {bookings.length > 0 ? (
            bookings.map(renderBookingCard)
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={34}
                  color={Colors.secondary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {activeTab === 'upcoming'
                  ? 'No upcoming appointments'
                  : 'No past appointments'}
              </Text>

              <Text style={styles.emptyText}>
                {activeTab === 'upcoming'
                  ? 'Your upcoming salon appointments will appear here.'
                  : 'Your completed appointments will appear here.'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 7,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 22,
    marginBottom: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 9,
  },
  activeTab: {
    backgroundColor: Colors.surface,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  bookingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expiredBookingCard: {
    backgroundColor: '#F0EFEC',
    borderColor: '#DAD8D2',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salonInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  salonIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  expiredSalonIcon: {
    backgroundColor: '#E5E3DE',
  },
  salonText: {
    flex: 1,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  salonAddress: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 5,
  },
  statusRefreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
    marginLeft: 6,
  },
  expiredNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8E7E3',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  expiredNoticeContent: {
    flex: 1,
    marginLeft: 9,
  },
  expiredNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#68665F',
    marginBottom: 4,
  },
  expiredNoticeText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#77746E',
  },
  expiredText: {
    color: '#77746E',
  },
  expiredDetailText: {
    color: '#89867F',
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 10,
  },
  servicesSection: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  expiredServicesSection: {
    backgroundColor: '#E9E8E4',
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 10,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  serviceName: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 10,
  },
  servicePrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 9,
    letterSpacing: 1,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 4,
  },
  appointmentCode: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  stateText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 14,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 18,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 75,
  },
  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 19,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
});

export default BookingsScreen;
