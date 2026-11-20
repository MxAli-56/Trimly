
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import Colors from '../../../constants/Colors';
import bookingService from '../../../services/bookingService';
import useAuthStore from '../../../store/useAuthStore';

const BookingReviewScreen = ({ navigation, route }) => {
  const {
    branchId,
    salon,
    selectedServices: initialServices,
    selectedBarber,
    selectedDate,
    selectedSlot,
  } = route.params || {};

  const token = useAuthStore((state) => state.token);

  const [selectedServices, setSelectedServices] = useState(
    Array.isArray(initialServices) ? initialServices : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const totalAmount = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) =>
          total + Number(service.price || 0),
        0
      ),
    [selectedServices]
  );

  const totalDuration = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) =>
          total + Number(service.durationMinutes || 0),
        0
      ),
    [selectedServices]
  );

  const serviceIds = useMemo(
    () =>
      selectedServices
        .map((service) => service?._id || service?.id)
        .filter(Boolean),
    [selectedServices]
  );

  const barberProfileId =
    selectedBarber?.barberProfileId || selectedBarber?._id;

  const barberName =
    selectedBarber?.name ||
    selectedBarber?.fullName ||
    selectedBarber?.userId?.name ||
    'Selected barber';

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString();

  const formatDate = (dateString) => {
    if (!dateString) return 'Not selected';

    const date = new Date(`${dateString}T00:00:00Z`);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const removeService = (serviceId) => {
    setSelectedServices((current) =>
      current.filter(
        (service) =>
          (service._id || service.id) !== serviceId
      )
    );
  };

  const navigateToBookings = () => {
    setSuccessModalVisible(false);

    // Find the parent navigator containing the Bookings tab.
    let navigator = navigation;

    while (navigator) {
      const state = navigator.getState?.();

      if (state?.routeNames?.includes('Bookings')) {
        navigator.navigate('Bookings');
        return;
      }

      navigator = navigator.getParent?.();
    }

    // Fallback if the tab navigator cannot be found.
    navigation.goBack();
  };

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;

    if (!token) {
      Alert.alert(
        'Session expired',
        'Please log in again.'
      );
      return;
    }

    if (!barberProfileId) {
      Alert.alert(
        'Barber unavailable',
        'Please select a barber again.'
      );
      return;
    }

    if (!selectedDate || !selectedSlot?.startTime) {
      Alert.alert(
        'Incomplete booking',
        'Please select your appointment date and time.'
      );
      return;
    }

    if (
      selectedServices.length === 0 ||
      serviceIds.length !== selectedServices.length
    ) {
      Alert.alert(
        'Invalid services',
        'Please select at least one valid service.'
      );
      return;
    }

    const bookingData = {
      barberProfileId,
      serviceIds,
      date: selectedDate,
      startTime: selectedSlot.startTime,
    };

    try {
      setIsSubmitting(true);

      const response = await bookingService.createBooking(
        bookingData,
        token
      );

      const booking =
        response?.data?.data ||
        response?.data ||
        response?.booking ||
        response;

      setBookingConfirmation({
        appointmentCode:
          booking?.appointmentCode || 'Not available',

        status:
          booking?.status ||
          booking?.statusId?.name ||
          'PENDING',
      });

      setSuccessModalVisible(true);
    } catch (error) {
      const statusCode = error.response?.status;

      const message =
        error.response?.data?.message ||
        'Unable to submit your booking. Please try again.';

      if (statusCode === 409) {
        Alert.alert(
          'Time slot unavailable',
          'This appointment slot is no longer available. Please go back and choose another time.'
        );
      } else {
        Alert.alert('Booking failed', message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          disabled={isSubmitting}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.primary}
          />
        </Pressable>

        <View>
          <Text style={styles.eyebrow}>ALMOST THERE</Text>
          <Text style={styles.headerTitle}>Review booking</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Confirmation heading */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>
            Your appointment,{'\n'}your way.
          </Text>

          <Text style={styles.introSubtitle}>
            Review everything before confirming your booking.
          </Text>
        </View>

        {/* Salon */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>SALON</Text>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons
                name="storefront-outline"
                size={22}
                color={Colors.secondary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.primaryText}>
                {salon?.name || 'Selected salon'}
              </Text>

              <Text style={styles.secondaryText}>
                {salon?.area ||
                  salon?.city ||
                  salon?.address ||
                  ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment details */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>
            APPOINTMENT DETAILS
          </Text>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color={Colors.secondary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>BARBER</Text>
              <Text style={styles.detailValue}>
                {barberName}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color={Colors.secondary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>DATE</Text>
              <Text style={styles.detailValue}>
                {formatDate(selectedDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="time-outline"
                size={19}
                color={Colors.secondary}
              />
            </View>

            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>TIME</Text>
              <Text style={styles.detailValue}>
                {selectedSlot?.startTime || 'Not selected'}
                {selectedSlot?.endTime
                  ? ` – ${selectedSlot.endTime}`
                  : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Selected services */}
        <View style={styles.servicesSection}>
          <View style={styles.servicesHeading}>
            <View>
              <Text style={styles.sectionTitle}>
                Selected services
              </Text>

              <Text style={styles.sectionSubtitle}>
                {selectedServices.length} services selected
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.editButton}
              disabled={isSubmitting}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          {selectedServices.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyText}>
                No services selected.
              </Text>

              <Pressable
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.editButtonText}>
                  Add services
                </Text>
              </Pressable>
            </View>
          ) : (
            selectedServices.map((service) => {
              const serviceId = service._id || service.id;

              return (
                <View
                  key={serviceId}
                  style={styles.serviceCard}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {service.name || 'Service'}
                    </Text>

                    <Text style={styles.serviceDuration}>
                      {Number(service.durationMinutes || 0)} min
                    </Text>
                  </View>

                  <Text style={styles.servicePrice}>
                    Rs. {formatAmount(service.price)}
                  </Text>

                  <Pressable
                    onPress={() => removeService(serviceId)}
                    hitSlop={10}
                    style={styles.removeButton}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={21}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Price breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceCardTitle}>
            Price breakdown
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Services</Text>
            <Text style={styles.priceValue}>
              Rs. {formatAmount(totalAmount)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Estimated duration
            </Text>
            <Text style={styles.priceValue}>
              {totalDuration} minutes
            </Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rs. {formatAmount(totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.note}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.secondary}
          />

          <Text style={styles.noteText}>
            Your booking will remain pending until the barber
            accepts your request. You will receive an appointment
            code after successful submission.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom confirmation bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomPrice}>
            Rs. {formatAmount(totalAmount)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.confirmButton,
            (
              selectedServices.length === 0 ||
              isSubmitting
            ) && styles.disabledButton,
          ]}
          disabled={
            selectedServices.length === 0 ||
            isSubmitting
          }
          onPress={handleConfirmBooking}
        >
          {isSubmitting ? (
            <ActivityIndicator
              color={Colors.white}
              size="small"
            />
          ) : (
            <>
              <Text style={styles.confirmButtonText}>
                Confirm booking
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={Colors.white}
              />
            </>
          )}
        </Pressable>
      </View>

      {/* Booking success modal */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <Ionicons
                name="checkmark"
                size={34}
                color={Colors.white}
              />
            </View>

            <Text style={styles.successEyebrow}>
              BOOKING SUBMITTED
            </Text>

            <Text style={styles.successTitle}>
              You're one step{'\n'}closer to looking sharp.
            </Text>

            <Text style={styles.successDescription}>
              Your appointment request has been sent
              successfully. The barber will review and
              respond to your request shortly.
            </Text>

            <View style={styles.confirmationCard}>
              <Text style={styles.confirmationLabel}>
                APPOINTMENT CODE
              </Text>

              <Text style={styles.appointmentCode}>
                {bookingConfirmation?.appointmentCode ||
                  'Not available'}
              </Text>

              <View style={styles.confirmationDivider} />

              <View style={styles.confirmationStatusRow}>
                <Text style={styles.confirmationLabel}>
                  BOOKING STATUS
                </Text>

                <View style={styles.pendingBadge}>
                  <View style={styles.pendingDot} />

                  <Text style={styles.pendingText}>
                    {bookingConfirmation?.status || 'PENDING'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.acceptanceNote}>
              <Ionicons
                name="time-outline"
                size={18}
                color={Colors.secondary}
              />

              <Text style={styles.acceptanceText}>
                The barber has 2 minutes to accept your
                booking request.
              </Text>
            </View>

            <Pressable
              style={styles.modalButton}
              onPress={navigateToBookings}
            >
              <Text style={styles.modalButtonText}>
                View my bookings
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color={Colors.white}
              />
            </Pressable>

            <Text style={styles.modalFooter}>
              THANK YOU FOR CHOOSING TRIMLY
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 18,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eyebrow: {
    color: Colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerTitle: {
    color: Colors.primary,
    fontSize: 23,
    fontWeight: '700',
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  intro: {
    marginBottom: 23,
  },
  introTitle: {
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '700',
    color: Colors.primary,
  },
  introSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 17,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardEyebrow: {
    color: Colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 13,
  },
  primaryText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  detailValue: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
    marginLeft: 48,
  },
  servicesSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  servicesHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 12,
    marginBottom: 9,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  serviceDuration: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  servicePrice: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 12,
  },
  removeButton: {
    padding: 3,
  },
  emptyServices: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  priceCard: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 18,
    borderRadius: 15,
  },
  priceCardTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  priceLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  priceValue: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  totalLabel: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  totalValue: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
    marginBottom: 10,
  },
  noteText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 25,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: '700',
  },
  bottomPrice: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: '700',
    marginTop: 3,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 19,
    paddingVertical: 15,
    borderRadius: 10,
    gap: 9,
  },
  disabledButton: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Success modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 13, 11, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  successModal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.background,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 22,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  successEyebrow: {
    color: Colors.secondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  successTitle: {
    color: Colors.primary,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  successDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 23,
  },
  confirmationCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 17,
  },
  confirmationLabel: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  appointmentCode: {
    color: Colors.primary,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 7,
  },
  confirmationDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 15,
  },
  confirmationStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3DC',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C58A28',
  },
  pendingText: {
    color: '#95651C',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  acceptanceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 19,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  acceptanceText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
    marginLeft: 9,
  },
  modalButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 11,
    paddingVertical: 16,
    gap: 10,
  },
  modalButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  modalFooter: {
    color: Colors.textSecondary,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 20,
  },
});

export default BookingReviewScreen;
