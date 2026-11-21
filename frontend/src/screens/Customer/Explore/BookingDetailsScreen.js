
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const BookingDetailsScreen = ({ navigation, route }) => {
  const {
    branchId,
    salon,
    selectedServices = [],
    totalAmount,
    totalDuration,
  } = route.params || {};

  const token = useAuthStore((state) => state.token);

  // const serviceIds = useMemo(
  //   () =>
  //     [
  //       ...new Set(
  //         selectedServices
  //           .map((service) => service?._id || service?.id)
  //           .filter(Boolean)
  //       ),
  //     ],
  //   [selectedServices]
  // );
const serviceIds = useMemo(
  () =>
    [
      ...new Set(
        selectedServices
          .map((service) => service?._id || service?.id)
          .filter(Boolean)
      ),
    ],
  [selectedServices]
);

const hasValidServices =
  selectedServices.length > 0 &&
  selectedServices.every((service) =>
    Boolean(service?._id || service?.id)
  );
  // const hasValidServices =
  //   selectedServices.length > 0 &&
  //   serviceIds.length === selectedServices.length;

  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState(null);

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingBarbers, setLoadingBarbers] = useState(true);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [barberError, setBarberError] = useState('');
  const [dateError, setDateError] = useState('');
  const [slotError, setSlotError] = useState('');

  const selectedBarberId =
    selectedBarber?.barberProfileId || selectedBarber?._id;

  // Fetch barbers belonging to the selected salon.
  useEffect(() => {
    let active = true;

    const fetchBarbers = async () => {
      if (!token || !branchId) {
        setBarberError(
          'Salon or login information is unavailable.'
        );
        setLoadingBarbers(false);
        return;
      }

      try {
        setLoadingBarbers(true);
        setBarberError('');

        const response = await bookingService.getSalonBarbers(
          branchId,
          token
        );

        if (!active) return;

        const barberList = Array.isArray(response)
          ? response
          : response?.barbers || [];

        setBarbers(barberList);

        // Clear a selection if the barber is no longer returned.
        setSelectedBarber((current) => {
          if (!current) return null;

          const currentId =
            current.barberProfileId || current._id;

          const updatedBarber = barberList.find(
            (barber) =>
              (barber.barberProfileId || barber._id) === currentId
          );

          return updatedBarber || null;
        });
      } catch (error) {
        if (!active) return;

        setBarberError(
          error.response?.data?.message ||
            'Unable to load barbers. Please try again.'
        );
      } finally {
        if (active) {
          setLoadingBarbers(false);
        }
      }
    };

    fetchBarbers();

    return () => {
      active = false;
    };
  }, [branchId, token]);

  // Fetch available dates for the selected barber and services.
  useEffect(() => {
    let active = true;

    const fetchDates = async () => {
      setAvailableDates([]);
      setSelectedDate('');
      setAvailableSlots([]);
      setSelectedSlot(null);
      setDateError('');
      setSlotError('');

      if (
        !selectedBarberId ||
        !hasValidServices ||
        !token ||
        selectedBarber?.isAvailable === false
      ) {
        setLoadingDates(false);
        return;
      }

      try {
        setLoadingDates(true);

        const response = await bookingService.getAvailableDates(
          selectedBarberId,
          serviceIds,
          token
        );

        if (!active) return;

        // Backend returns dates as strings:
        // ["2026-11-23", "2026-11-30"]
        const dates = Array.isArray(response?.availableDates)
          ? response.availableDates
          : [];

        setAvailableDates(
          dates.filter(
            (date) =>
              typeof date === 'string' &&
              /^\d{4}-\d{2}-\d{2}$/.test(date)
          )
        );
      } catch (error) {
        if (!active) return;

        setDateError(
          error.response?.data?.message ||
            'Unable to load available dates. Please try again.'
        );
      } finally {
        if (active) {
          setLoadingDates(false);
        }
      }
    };

    fetchDates();

    return () => {
      active = false;
    };
  }, [
    selectedBarberId,
    selectedBarber?.isAvailable,
    hasValidServices,
    serviceIds,
    token,
  ]);

  // Fetch available time slots for the selected date.
  useEffect(() => {
    let active = true;

    const fetchSlots = async () => {
      setAvailableSlots([]);
      setSelectedSlot(null);
      setSlotError('');

      if (
        !selectedBarberId ||
        !selectedDate ||
        !hasValidServices ||
        !token ||
        selectedBarber?.isAvailable === false
      ) {
        setLoadingSlots(false);
        return;
      }

      try {
        setLoadingSlots(true);

        const response = await bookingService.getAvailableSlots(
          selectedBarberId,
          selectedDate,
          serviceIds,
          token
        );

        if (!active) return;

        const slots = Array.isArray(response?.availableSlots)
          ? response.availableSlots
          : [];

        // Only allow genuinely available slots to be selected.
        setAvailableSlots(
          slots.filter((slot) => slot?.isAvailable === true)
        );
      } catch (error) {
        if (!active) return;

        setSlotError(
          error.response?.data?.message ||
            'Unable to load available time slots. Please try another date.'
        );
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();

    return () => {
      active = false;
    };
  }, [
    selectedBarberId,
    selectedDate,
    selectedBarber?.isAvailable,
    hasValidServices,
    serviceIds,
    token,
  ]);

  const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00Z`);

    return {
      day: date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      }),
      number: date.getUTCDate(),
      month: date.toLocaleDateString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      }),
    };
  };

  const getBarberName = (barber) =>
    barber?.name ||
    barber?.fullName ||
    barber?.userId?.name ||
    'Barber';

  const handleBarberSelect = (barber) => {
    if (barber?.isAvailable === false) return;

    setSelectedBarber(barber);
    setSelectedDate('');
    setSelectedSlot(null);
    setAvailableDates([]);
    setAvailableSlots([]);
    setDateError('');
    setSlotError('');
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setAvailableSlots([]);
    setSlotError('');
  };

  const handleSlotSelect = (slot) => {
    if (!slot?.isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (
      !hasValidServices ||
      !selectedBarberId ||
      selectedBarber?.isAvailable === false ||
      !selectedDate ||
      !selectedSlot?.startTime ||
      selectedSlot?.isAvailable !== true
    ) {
      return;
    }

    navigation.navigate('BookingReview', {
      branchId,
      salon,
      selectedServices,
      totalAmount,
      totalDuration,
      selectedBarber,
      selectedDate,
      selectedSlot,
    });
  };

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString();

  const canContinue =
    hasValidServices &&
    !!selectedBarberId &&
    selectedBarber?.isAvailable !== false &&
    !!selectedDate &&
    selectedSlot?.isAvailable === true;

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
          <Text style={styles.headerEyebrow}>
            YOUR APPOINTMENT
          </Text>
          <Text style={styles.headerTitle}>
            Booking details
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Salon summary */}
        <View style={styles.salonCard}>
          <View style={styles.salonIcon}>
            <Ionicons
              name="storefront-outline"
              size={22}
              color={Colors.secondary}
            />
          </View>

          <View style={styles.salonInfo}>
            <Text style={styles.salonName}>
              {salon?.name || 'Selected salon'}
            </Text>

            <Text style={styles.salonLocation}>
              {salon?.area ||
                salon?.city ||
                salon?.address ||
                'Salon'}
            </Text>
          </View>

          <Text style={styles.serviceCount}>
            {selectedServices.length} services
          </Text>
        </View>

        {!hasValidServices && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Your selected services are incomplete. Please go back
              and select your services again.
            </Text>
          </View>
        )}

        {/* Barber selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>01</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Choose your barber
              </Text>
              <Text style={styles.sectionSubtitle}>
                Who would you like to book with?
              </Text>
            </View>
          </View>

          {loadingBarbers ? (
            <ActivityIndicator
              color={Colors.secondary}
              style={styles.loader}
            />
          ) : barberError ? (
            <Text style={styles.emptyText}>{barberError}</Text>
          ) : barbers.length === 0 ? (
            <Text style={styles.emptyText}>
              No barbers were found at this salon.
            </Text>
          ) : (
            barbers.map((barber) => {
              const barberId =
                barber?.barberProfileId || barber?._id;

              const isSelected =
                selectedBarberId === barberId;

              const isAvailable = barber?.isAvailable !== false;

              return (
                <Pressable
                  key={barberId}
                  disabled={!isAvailable}
                  style={[
                    styles.barberCard,
                    isSelected && styles.selectedCard,
                    !isAvailable && styles.unavailableCard,
                  ]}
                  onPress={() => handleBarberSelect(barber)}
                >
                  <View style={styles.barberAvatar}>
                    <Ionicons
                      name="person-outline"
                      size={23}
                      color={Colors.secondary}
                    />
                  </View>

                  <View style={styles.barberInfo}>
                    <Text style={styles.barberName}>
                      {getBarberName(barber)}
                    </Text>

                    <Text style={styles.barberSpeciality}>
                      {barber?.specialties?.join(' • ') ||
                        barber?.specialization ||
                        'Professional barber'}
                    </Text>

                    <View style={styles.barberMeta}>
                      {typeof barber?.avgRating === 'number' && (
                        <View style={styles.ratingRow}>
                          <Ionicons
                            name="star"
                            size={12}
                            color={Colors.secondary}
                          />
                          <Text style={styles.ratingText}>
                            {barber.avgRating.toFixed(1)}
                          </Text>
                          {typeof barber?.ratingCount === 'number' && (
                            <Text style={styles.ratingCount}>
                              ({barber.ratingCount})
                            </Text>
                          )}
                        </View>
                      )}

                      <Text
                        style={[
                          styles.availabilityText,
                          !isAvailable && styles.unavailableText,
                        ]}
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleActive,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* Date selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>02</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Choose a date
              </Text>
              <Text style={styles.sectionSubtitle}>
                Select an available appointment date.
              </Text>
            </View>
          </View>

          {!selectedBarber ? (
            <Text style={styles.helperText}>
              Select a barber to see available dates.
            </Text>
          ) : selectedBarber.isAvailable === false ? (
            <Text style={styles.emptyText}>
              This barber is currently unavailable.
            </Text>
          ) : !hasValidServices ? (
            <Text style={styles.emptyText}>
              Please select valid services before checking availability.
            </Text>
          ) : loadingDates ? (
            <ActivityIndicator
              color={Colors.secondary}
              style={styles.loader}
            />
          ) : dateError ? (
            <Text style={styles.emptyText}>{dateError}</Text>
          ) : availableDates.length === 0 ? (
            <Text style={styles.emptyText}>
              No available dates found for this barber and service
              combination.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            >
              {availableDates.map((date) => {
                const dateInfo = formatDate(date);
                const isSelected = selectedDate === date;

                return (
                  <Pressable
                    key={date}
                    style={[
                      styles.dateCard,
                      isSelected && styles.selectedDateCard,
                    ]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text
                      style={[
                        styles.dateDay,
                        isSelected && styles.selectedDateText,
                      ]}
                    >
                      {dateInfo.day}
                    </Text>

                    <Text
                      style={[
                        styles.dateNumber,
                        isSelected && styles.selectedDateText,
                      ]}
                    >
                      {dateInfo.number}
                    </Text>

                    <Text
                      style={[
                        styles.dateMonth,
                        isSelected && styles.selectedDateText,
                      ]}
                    >
                      {dateInfo.month}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Time selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>03</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Choose a time
              </Text>
              <Text style={styles.sectionSubtitle}>
                Pick your preferred available time.
              </Text>
            </View>
          </View>

          {!selectedDate ? (
            <Text style={styles.helperText}>
              Select a date to see available time slots.
            </Text>
          ) : loadingSlots ? (
            <ActivityIndicator
              color={Colors.secondary}
              style={styles.loader}
            />
          ) : slotError ? (
            <Text style={styles.emptyText}>{slotError}</Text>
          ) : availableSlots.length === 0 ? (
            <Text style={styles.emptyText}>
              No available time slots for this date.
            </Text>
          ) : (
            <View style={styles.slotGrid}>
              {availableSlots.map((slot) => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime;

                return (
                  <Pressable
                    key={`${slot.startTime}-${slot.endTime}`}
                    style={[
                      styles.slotCard,
                      isSelected && styles.selectedSlotCard,
                    ]}
                    onPress={() => handleSlotSelect(slot)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.selectedSlotText,
                      ]}
                    >
                      {slot.startTime}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            Appointment summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Services</Text>
            <Text style={styles.summaryValue}>
              {selectedServices.length} selected
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total duration</Text>
            <Text style={styles.summaryValue}>
              {totalDuration || 0} minutes
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated total</Text>
            <Text style={styles.summaryPrice}>
              Rs. {formatAmount(totalAmount)}
            </Text>
          </View>

          {selectedBarber && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Barber</Text>
              <Text style={styles.summaryValue}>
                {getBarberName(selectedBarber)}
              </Text>
            </View>
          )}

          {selectedDate && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>
                {selectedDate}
              </Text>
            </View>
          )}

          {selectedSlot && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>
                {selectedSlot.startTime} - {selectedSlot.endTime}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>
            ESTIMATED TOTAL
          </Text>
          <Text style={styles.bottomPrice}>
            Rs. {formatAmount(totalAmount)}
          </Text>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            !canContinue && styles.disabledButton,
          ]}
          disabled={!canContinue}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            Continue
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
  headerEyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.secondary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 23,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },
  salonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 15,
    borderRadius: 14,
    marginBottom: 27,
  },
  salonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  salonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  salonName: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  salonLocation: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  serviceCount: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  loader: {
    marginVertical: 22,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    paddingVertical: 15,
  },
  helperText: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingVertical: 12,
  },
  errorCard: {
    backgroundColor: Colors.surfaceSecondary,
    padding: 13,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.primary,
    fontSize: 12,
    lineHeight: 18,
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: Colors.secondary,
    backgroundColor: Colors.surfaceSecondary,
  },
  unavailableCard: {
    opacity: 0.5,
  },
  barberAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  barberName: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  barberSpeciality: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  barberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  ratingCount: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  availabilityText: {
    color: '#287A4B',
    fontSize: 10,
    fontWeight: '600',
  },
  unavailableText: {
    color: '#A14A43',
  },
  radioCircle: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.secondary,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
  dateList: {
    paddingRight: 5,
  },
  dateCard: {
    width: 65,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 9,
  },
  selectedDateCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDay: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dateNumber: {
    fontSize: 21,
    fontWeight: '700',
    color: Colors.primary,
    marginVertical: 5,
  },
  dateMonth: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  selectedDateText: {
    color: Colors.white,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    minWidth: '30%',
    paddingHorizontal: 13,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedSlotCard: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  selectedSlotText: {
    color: Colors.white,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    padding: 17,
    marginBottom: 10,
  },
  summaryTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  summaryValue: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 12,
  },
  summaryPrice: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
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
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 10,
    gap: 10,
  },
  disabledButton: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

export default BookingDetailsScreen;
