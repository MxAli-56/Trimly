
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import useBarberStore from '../../store/useBarberStore';
import useAuthStore from '../../store/useAuthStore';
import barberService from '../../services/BarberService';

const BookingRequestDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const { bookingId } = route.params || {};

  // Zustand store
  const fetchBookingRequestDetails = useBarberStore(
    (state) => state.fetchBookingRequestDetails
  );

  const bookingRequestDetails = useBarberStore(
    (state) => state.bookingRequestDetails
  );

  const bookingRequestLoading = useBarberStore(
    (state) => state.bookingRequestLoading
  );

  const bookingRequestError = useBarberStore(
    (state) => state.bookingRequestError
  );

  const clearBookingRequestDetails = useBarberStore(
    (state) => state.clearBookingRequestDetails
  );

  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Prevent expiration alert from appearing multiple times
  const expiryAlertShown = useRef(false);

  // Fetch booking details when screen opens
  useEffect(() => {
    if (bookingId) {
      fetchBookingRequestDetails(bookingId);
    }

    return () => {
      clearBookingRequestDetails();
    };
  }, [bookingId]);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const booking = bookingRequestDetails;

  // Countdown calculation
  const expiryTime = booking?.holdExpiresAt
    ? new Date(booking.holdExpiresAt).getTime()
    : null;

  const hasValidExpiry =
    expiryTime !== null && Number.isFinite(expiryTime);

  const remainingMs = hasValidExpiry
    ? Math.max(0, expiryTime - currentTime)
    : null;

  const isExpired = hasValidExpiry && remainingMs === 0;

  const formatCountdown = (milliseconds) => {
    if (milliseconds === null) return 'Unavailable';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      seconds
    ).padStart(2, '0')}`;
  };

  // Automatically close screen when request expires
  useEffect(() => {
    if (!booking || !isExpired || expiryAlertShown.current) {
      return;
    }

    expiryAlertShown.current = true;

    Alert.alert(
      'Request Expired',
      'The 2-minute response time has expired.',
      [
        {
          text: 'OK',
          onPress: () => {
            clearBookingRequestDetails();
            navigation.goBack();
          },
        },
      ],
      { cancelable: false }
    );
  }, [
    booking,
    isExpired,
    clearBookingRequestDetails,
    navigation,
  ]);

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';

    const [hours, minutes] = time.split(':');
    const date = new Date();

    date.setHours(Number(hours), Number(minutes));

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const isPending = booking?.status === 'PENDING';

  // Accept booking
  const handleAccept = () => {
    if (isExpired) {
      Alert.alert('Request Expired', 'This booking request has expired.');
      return;
    }

    Alert.alert(
      'Accept Booking',
      'Are you sure you want to accept this booking request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: confirmAccept,
        },
      ]
    );
  };

  const confirmAccept = async () => {
    if (isExpired) {
      Alert.alert('Request Expired', 'This booking request has expired.');
      return;
    }

    try {
      setActionLoading(true);

      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await barberService.acceptBooking(
        bookingId,
        token
      );

      if (response?.success === false) {
        throw new Error(
          response.message || 'Unable to accept booking.'
        );
      }

      Alert.alert('Success', 'Booking accepted successfully.', [
        {
          text: 'OK',
          onPress: () => {
            clearBookingRequestDetails();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          error.message ||
          'Unable to accept booking.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Reject booking
  const handleReject = () => {
    if (isExpired) {
      Alert.alert('Request Expired', 'This booking request has expired.');
      return;
    }

    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this booking request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: confirmReject,
        },
      ]
    );
  };

  const confirmReject = async () => {
    if (isExpired) {
      Alert.alert('Request Expired', 'This booking request has expired.');
      return;
    }

    try {
      setActionLoading(true);

      const token = useAuthStore.getState().token;

      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await barberService.rejectBooking(
        bookingId,
        'Rejected by barber',
        token
      );

      if (response?.success === false) {
        throw new Error(
          response.message || 'Unable to reject booking.'
        );
      }

      Alert.alert('Success', 'Booking rejected successfully.', [
        {
          text: 'OK',
          onPress: () => {
            clearBookingRequestDetails();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          error.message ||
          'Unable to reject booking.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (bookingRequestLoading && !booking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#262522" />
        <Text style={styles.loadingText}>
          Loading booking details...
        </Text>
      </View>
    );
  }

  // Error state
  if (bookingRequestError && !booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{bookingRequestError}</Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => fetchBookingRequestDetails(bookingId)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Booking details not available.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Booking Request</Text>
          <Text style={styles.subtitle}>
            Review the customer's booking details
          </Text>
        </View>

        {/* Countdown */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>
            {isExpired ? 'Request Expired' : 'Time Remaining'}
          </Text>

          <Text
            style={[
              styles.timerValue,
              isExpired && styles.expiredText,
            ]}
          >
            {formatCountdown(remainingMs)}
          </Text>

          <Text style={styles.timerHint}>
            Please review this request before the timer expires.
          </Text>
        </View>

        {/* Booking Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Information</Text>

          <InfoRow
            label="Appointment Code"
            value={booking.appointmentCode}
          />

          <InfoRow
            label="Status"
            value={booking.status}
          />

          <InfoRow
            label="Date"
            value={formatDate(booking.date)}
          />

          <InfoRow
            label="Start Time"
            value={formatTime(booking.startTime)}
          />

          <InfoRow
            label="End Time"
            value={formatTime(booking.endTime)}
          />

          <InfoRow
            label="Duration"
            value={`${booking.totalDuration || 0} minutes`}
          />
        </View>

        {/* Customer Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Information</Text>

          <InfoRow
            label="Customer Name"
            value={booking.customer?.name}
          />

          <InfoRow
            label="Phone Number"
            value={booking.customer?.phone}
          />
        </View>

        {/* Branch Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Salon Information</Text>

          <InfoRow
            label="Branch"
            value={booking.branch?.name}
          />

          <InfoRow
            label="Address"
            value={booking.branch?.address}
          />
        </View>

        {/* Services */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Selected Services</Text>

          {booking.services?.length > 0 ? (
            booking.services.map((service, index) => (
              <View
                key={service.serviceId || index}
                style={styles.serviceItem}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {service.name}
                  </Text>

                  <Text style={styles.serviceDuration}>
                    {service.durationMinutes} minutes
                  </Text>
                </View>

                <Text style={styles.servicePrice}>
                  Rs. {service.price}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>
              No services found.
            </Text>
          )}
        </View>

        {/* Payment Information */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <InfoRow
            label="Total Amount"
            value={`Rs. ${booking.totalAmount ?? 0}`}
          />

          <InfoRow
            label="Required Deposit"
            value={`Rs. ${booking.depositAmount ?? 0}`}
          />
        </View>

        {/* Action Buttons */}
        {isPending && (
          <View style={styles.actionContainer}>
            <Pressable
              style={[
                styles.acceptButton,
                (actionLoading || isExpired) && styles.disabledButton,
              ]}
              onPress={handleAccept}
              disabled={actionLoading || isExpired}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.acceptButtonText}>
                  Accept Request
                </Text>
              )}
            </Pressable>

            <Pressable
              style={[
                styles.rejectButton,
                (actionLoading || isExpired) && styles.disabledButton,
              ]}
              onPress={handleReject}
              disabled={actionLoading || isExpired}
            >
              <Text style={styles.rejectButtonText}>
                Reject Request
              </Text>
            </Pressable>
          </View>
        )}

        {!isPending && (
          <View style={styles.statusMessage}>
            <Text style={styles.statusMessageText}>
              This booking request is no longer pending.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// Reusable information row
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

export default BookingRequestDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EBE3',
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EBE3',
    padding: 20,
  },

  header: {
    marginBottom: 20,
  },

  heading: {
    fontSize: 25,
    fontWeight: '700',
    color: '#262522',
  },

  subtitle: {
    fontSize: 14,
    color: '#706A62',
    marginTop: 5,
  },

  timerCard: {
    backgroundColor: '#262522',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },

  timerLabel: {
    color: '#F0EBE3',
    fontSize: 15,
  },

  timerValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 8,
  },

  expiredText: {
    color: '#F28B82',
  },

  timerHint: {
    color: '#B7AA9A',
    fontSize: 12,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#262522',
    marginBottom: 15,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
    gap: 12,
  },

  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: '#706A62',
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#262522',
    textAlign: 'right',
  },

  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
    gap: 12,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262522',
  },

  serviceDuration: {
    fontSize: 12,
    color: '#706A62',
    marginTop: 4,
  },

  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#262522',
  },

  emptyText: {
    color: '#706A62',
    fontSize: 13,
  },

  actionContainer: {
    marginTop: 5,
    gap: 12,
  },

  acceptButton: {
    backgroundColor: '#262522',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#B7AA9A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  rejectButtonText: {
    color: '#262522',
    fontSize: 15,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.5,
  },

  statusMessage: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 5,
  },

  statusMessageText: {
    color: '#706A62',
    textAlign: 'center',
    fontSize: 14,
  },

  loadingText: {
    marginTop: 12,
    color: '#706A62',
  },

  errorText: {
    color: '#B42318',
    fontSize: 14,
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#262522',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
