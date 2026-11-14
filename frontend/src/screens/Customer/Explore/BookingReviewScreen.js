
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../../constants/Colors';

const BookingReviewScreen = ({ navigation, route }) => {
  const {
    branchId,
    salon,
    selectedServices: initialServices,
    selectedBarber,
    selectedDate,
    selectedSlot,
  } = route.params;

  const [selectedServices, setSelectedServices] = useState(
    initialServices || []
  );

  const totalAmount = useMemo(
    () =>
      selectedServices.reduce(
        (total, service) => total + Number(service.price || 0),
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

  const removeService = (serviceId) => {
    setSelectedServices((current) =>
      current.filter((service) => service._id !== serviceId)
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00Z`);

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
  };

  const barberName =
    selectedBarber?.name ||
    selectedBarber?.fullName ||
    selectedBarber?.userId?.name ||
    'Selected barber';

  const handleConfirmBooking = () => {
    if (selectedServices.length === 0) {
      Alert.alert(
        'No services selected',
        'Please go back and select at least one service.'
      );
      return;
    }

    // Booking creation will be connected to the existing
    // backend booking API once its exact contract is verified.
    Alert.alert(
      'Ready to confirm',
      'Your booking details are ready. Booking confirmation will be connected to the booking API next.'
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
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
                {salon?.area || salon?.city || salon?.address || ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Appointment details */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>APPOINTMENT DETAILS</Text>

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
              <Text style={styles.detailValue}>{barberName}</Text>
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
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          {selectedServices.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyText}>
                No services selected.
              </Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.editButtonText}>
                  Add services
                </Text>
              </Pressable>
            </View>
          ) : (
            selectedServices.map((service) => (
              <View
                key={service._id}
                style={styles.serviceCard}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>
                    {service.name}
                  </Text>

                  <Text style={styles.serviceDuration}>
                    {service.durationMinutes || 0} min
                  </Text>
                </View>

                <Text style={styles.servicePrice}>
                  Rs. {Number(service.price || 0).toLocaleString()}
                </Text>

                <Pressable
                  onPress={() => removeService(service._id)}
                  hitSlop={10}
                  style={styles.removeButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={21}
                    color={Colors.textSecondary}
                  />
                </Pressable>
              </View>
            ))
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
              Rs. {totalAmount.toLocaleString()}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated duration</Text>
            <Text style={styles.priceValue}>
              {totalDuration} minutes
            </Text>
          </View>

          <View style={styles.priceDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              Rs. {totalAmount.toLocaleString()}
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
            Please review your appointment details carefully before
            confirming.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom confirmation bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.bottomPrice}>
            Rs. {totalAmount.toLocaleString()}
          </Text>
        </View>

        <Pressable
          style={[
            styles.confirmButton,
            selectedServices.length === 0 && styles.disabledButton,
          ]}
          disabled={selectedServices.length === 0}
          onPress={handleConfirmBooking}
        >
          <Text style={styles.confirmButtonText}>
            Confirm booking
          </Text>
          <Ionicons
            name="arrow-forward"
            size={17}
            color={Colors.white}
          />
        </Pressable>
      </View>
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
});

export default BookingReviewScreen;
