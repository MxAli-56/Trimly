
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
    selectedServices,
    totalAmount,
    totalDuration,
  } = route.params;

  const token = useAuthStore((state) => state.token);

  // Current backend availability endpoints accept one serviceId.
  const availabilityServiceId = selectedServices?.[0]?._id;

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

  // Fetch salon barbers.
  useEffect(() => {
    let active = true;

    const fetchBarbers = async () => {
      if (!token || !branchId) {
        setBarberError('Salon or login information is unavailable.');
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
      } catch (error) {
        if (!active) return;

        setBarberError(
          error.response?.data?.message ||
          'Unable to load barbers. Please try again.'
        );
      } finally {
        if (active) setLoadingBarbers(false);
      }
    };

    fetchBarbers();

    return () => {
      active = false;
    };
  }, [branchId, token]);

  // Fetch available dates when barber changes.
  useEffect(() => {
    let active = true;

    const fetchDates = async () => {
      if (!selectedBarber?._id || !availabilityServiceId || !token) {
        return;
      }

      try {
        setLoadingDates(true);
        setAvailableDates([]);
        setSelectedDate('');
        setAvailableSlots([]);
        setSelectedSlot(null);

        const response = await bookingService.getAvailableDates(
          selectedBarber._id,
          availabilityServiceId,
          token
        );

        if (!active) return;

        const dates = response?.availableDates || [];

        setAvailableDates(
          dates.filter((item) => item?.date)
        );
      } catch (error) {
        if (active) {
          Alert.alert(
            'Unable to load dates',
            error.response?.data?.message ||
              'Please try selecting the barber again.'
          );
        }
      } finally {
        if (active) setLoadingDates(false);
      }
    };

    fetchDates();

    return () => {
      active = false;
    };
  }, [selectedBarber, availabilityServiceId, token]);

  // Fetch available slots when date changes.
  useEffect(() => {
    let active = true;

    const fetchSlots = async () => {
      if (
        !selectedBarber?._id ||
        !selectedDate ||
        !availabilityServiceId ||
        !token
      ) {
        return;
      }

      try {
        setLoadingSlots(true);
        setAvailableSlots([]);
        setSelectedSlot(null);

        const response = await bookingService.getAvailableSlots(
          selectedBarber._id,
          selectedDate,
          availabilityServiceId,
          token
        );

        if (!active) return;

        setAvailableSlots(
          response?.availableSlots || []
        );
      } catch (error) {
        if (active) {
          Alert.alert(
            'Unable to load time slots',
            error.response?.data?.message ||
              'Please select another date.'
          );
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    };

    fetchSlots();

    return () => {
      active = false;
    };
  }, [
    selectedBarber,
    selectedDate,
    availabilityServiceId,
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

  const handleContinue = () => {
    if (!selectedBarber) {
      Alert.alert('Select a barber', 'Please choose a barber.');
      return;
    }

    if (!selectedDate) {
      Alert.alert('Select a date', 'Please choose an appointment date.');
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Select a time', 'Please choose an available time.');
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
          <Text style={styles.headerEyebrow}>YOUR APPOINTMENT</Text>
          <Text style={styles.headerTitle}>Booking details</Text>
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
            <Text style={styles.salonName}>{salon?.name}</Text>
            <Text style={styles.salonLocation}>
              {salon?.area || salon?.city || salon?.address || 'Salon'}
            </Text>
          </View>

          <Text style={styles.serviceCount}>
            {selectedServices?.length || 0} services
          </Text>
        </View>

        {/* Barber selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>01</Text>
            </View>

            <View>
              <Text style={styles.sectionTitle}>Choose your barber</Text>
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
              No barbers are currently available at this salon.
            </Text>
          ) : (
            barbers.map((barber) => {
              const isSelected =
                selectedBarber?._id === barber._id;

              return (
                <Pressable
                  key={barber._id}
                  style={[
                    styles.barberCard,
                    isSelected && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedBarber(barber)}
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
                      {barber.specialization ||
                        'Professional barber'}
                    </Text>
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
              <Text style={styles.sectionTitle}>Choose a date</Text>
              <Text style={styles.sectionSubtitle}>
                Select an available appointment date.
              </Text>
            </View>
          </View>

          {!selectedBarber ? (
            <Text style={styles.helperText}>
              Select a barber to see available dates.
            </Text>
          ) : loadingDates ? (
            <ActivityIndicator
              color={Colors.secondary}
              style={styles.loader}
            />
          ) : availableDates.length === 0 ? (
            <Text style={styles.emptyText}>
              No available dates found for this barber.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateList}
            >
              {availableDates.map((item) => {
                const dateInfo = formatDate(item.date);
                const isSelected = selectedDate === item.date;

                return (
                  <Pressable
                    key={item.date}
                    style={[
                      styles.dateCard,
                      isSelected && styles.selectedDateCard,
                    ]}
                    onPress={() => setSelectedDate(item.date)}
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
              <Text style={styles.sectionTitle}>Choose a time</Text>
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
          ) : availableSlots.length === 0 ? (
            <Text style={styles.emptyText}>
              No available time slots for this date.
            </Text>
          ) : (
            <View style={styles.slotGrid}>
              {availableSlots.map((slot, index) => {
                const isSelected =
                  selectedSlot?.startTime === slot.startTime;

                return (
                  <Pressable
                    key={`${slot.startTime}-${index}`}
                    style={[
                      styles.slotCard,
                      isSelected && styles.selectedSlotCard,
                    ]}
                    onPress={() => setSelectedSlot(slot)}
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
              {selectedServices?.length || 0} selected
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total duration</Text>
            <Text style={styles.summaryValue}>
              {totalDuration} minutes
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated total</Text>
            <Text style={styles.summaryPrice}>
              Rs. {Number(totalAmount || 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>ESTIMATED TOTAL</Text>
          <Text style={styles.bottomPrice}>
            Rs. {Number(totalAmount || 0).toLocaleString()}
          </Text>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            (!selectedBarber || !selectedDate || !selectedSlot) &&
              styles.disabledButton,
          ]}
          disabled={!selectedBarber || !selectedDate || !selectedSlot}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
