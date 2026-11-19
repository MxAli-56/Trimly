
import React, { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import useBarberStore from '../../store/useBarberStore';
import BarberHeader from '../../components/Barber/BarberHeader';

// Week days
const WEEK_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const formatDay = (day) =>
  day.charAt(0) + day.slice(1).toLowerCase();

const formatTime = (time) => {
  if (!time) return '--:--';

  const [hour, minute] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${String(minute).padStart(2, '0')} ${period}`;
};

const getMinutes = (time) => {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time)) return 0;

  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getDailyHours = (day) => {
  if (!day || !day.isWorkingDay) return 0;

  let total =
    getMinutes(day.endTime) - getMinutes(day.startTime);

  if (day.breakStart && day.breakEnd) {
    total -=
      getMinutes(day.breakEnd) - getMinutes(day.breakStart);
  }

  return Math.max(total, 0);
};

const formatHours = (minutes) => {
  const hours = minutes / 60;

  return Number.isInteger(hours)
    ? `${hours}h`
    : `${hours.toFixed(1)}h`;
};
const formatRequestDate = (date) => {
  if (!date) return 'Not available';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not available';
  }

  return parsedDate.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getRequestStatus = (request) => {
  const status =
    request.overallStatusId?.name ||
    request.overallStatus?.name ||
    request.status?.name ||
    request.status ||
    'PENDING';

  return String(status)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
const BarberScheduleScreen = ({ navigation }) => {
  const {
    schedule,
    scheduleLoading,
    scheduleError,
    fetchSchedule,

    scheduleRequestSubmitting,
    scheduleRequestError,
    submitScheduleRequest,
    clearScheduleError,
    clearScheduleRequestError,
    scheduleRequests,
    scheduleRequestsLoading,
    fetchScheduleRequests,
  } = useBarberStore();

  const [refreshing, setRefreshing] = useState(false);

  // Local changes are not active until owner approval
  const [pendingChanges, setPendingChanges] = useState([]);

  // Edit modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const [form, setForm] = useState({
    startTime: '',
    endTime: '',
    breakStart: '',
    breakEnd: '',
    isWorkingDay: true,
  });

  useEffect(() => {
    fetchSchedule();
    fetchScheduleRequests();
  }, []);

  // Map schedule records by weekday
  const scheduleMap = useMemo(() => {
    return schedule.reduce((result, item) => {
      result[item.dayOfWeek] = item;
      return result;
    }, {});
  }, [schedule]);

  // Calculate summary using active schedule only
  const summary = useMemo(() => {
    const workingDays = schedule.filter(
      (day) => day.isWorkingDay
    ).length;

    const totalMinutes = schedule.reduce(
      (total, day) => total + getDailyHours(day),
      0
    );

    return {
      workingDays,
      totalMinutes,
    };
  }, [schedule]);

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchSchedule(),
      fetchScheduleRequests(),
    ]);

    setRefreshing(false);
  };

  const openEditor = (dayName) => {
    const existingDay =
      pendingChanges.find((item) => item.dayOfWeek === dayName) ||
      scheduleMap[dayName];

    setSelectedDay(dayName);

    setForm({
      startTime: existingDay?.startTime || '',
      endTime: existingDay?.endTime || '',
      breakStart: existingDay?.breakStart || '',
      breakEnd: existingDay?.breakEnd || '',
      isWorkingDay: existingDay?.isWorkingDay ?? true,
    });

    setModalVisible(true);
  };

  const closeEditor = () => {
    setModalVisible(false);
    setSelectedDay(null);
  };

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveDayChanges = () => {
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    if (
      !timePattern.test(form.startTime) ||
      !timePattern.test(form.endTime)
    ) {
      Alert.alert(
        'Invalid Time',
        'Please enter valid start and end times in HH:mm format.'
      );
      return;
    }

    if (getMinutes(form.endTime) <= getMinutes(form.startTime)) {
      Alert.alert(
        'Invalid Time',
        'End time must be later than start time.'
      );
      return;
    }

    if (
      (form.breakStart && !form.breakEnd) ||
      (!form.breakStart && form.breakEnd)
    ) {
      Alert.alert(
        'Invalid Break',
        'Please provide both break start and break end.'
      );
      return;
    }

    if (form.breakStart || form.breakEnd) {
      if (
        !timePattern.test(form.breakStart) ||
        !timePattern.test(form.breakEnd)
      ) {
        Alert.alert(
          'Invalid Break',
          'Please enter valid break timings.'
        );
        return;
      }

      const start = getMinutes(form.startTime);
      const end = getMinutes(form.endTime);
      const breakStart = getMinutes(form.breakStart);
      const breakEnd = getMinutes(form.breakEnd);

      if (
        breakStart >= breakEnd ||
        breakStart < start ||
        breakEnd > end
      ) {
        Alert.alert(
          'Invalid Break',
          'Break timings must be within working hours.'
        );
        return;
      }
    }

    const updatedDay = {
      dayOfWeek: selectedDay,
      startTime: form.startTime,
      endTime: form.endTime,
      breakStart: form.breakStart || null,
      breakEnd: form.breakEnd || null,
      isWorkingDay: form.isWorkingDay,
    };

    setPendingChanges((previous) => {
      const filtered = previous.filter(
        (item) => item.dayOfWeek !== selectedDay
      );

      return [...filtered, updatedDay];
    });

    closeEditor();
  };

  const handleSubmitRequest = () => {
    if (!pendingChanges.length) {
      Alert.alert(
        'No Changes',
        'Please edit at least one day before submitting a request.'
      );
      return;
    }

    Alert.alert(
      'Submit Schedule Request',
      'Your changes will be sent to the salon owner for approval.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: async () => {
            const result = await submitScheduleRequest(
              pendingChanges
            );

            if (result.success) {
              setPendingChanges([]);

              Alert.alert(
                'Request Submitted',
                result.message ||
                'Your schedule request has been sent to the salon owner.'
              );
            } else {
              Alert.alert(
                'Submission Failed',
                result.error || 'Unable to submit request.'
              );
            }
          },
        },
      ]
    );
  };

  const handleAddLeave = () => {
    navigation.navigate('LeaveModal');
  };
  const renderRequestHistory = () => {
    return (
      <View style={styles.historySection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Schedule Request History
            </Text>

            <Text style={styles.sectionSubtitle}>
              Track your submitted schedule changes
            </Text>
          </View>
        </View>

        {scheduleRequestsLoading ? (
          <ActivityIndicator
            size="small"
            color={Colors.secondary}
          />
        ) : scheduleRequests.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons
              name="document-text-outline"
              size={28}
              color={Colors.textMuted}
            />

            <Text style={styles.emptyHistoryTitle}>
              No Requests Yet
            </Text>

            <Text style={styles.emptyHistoryText}>
              Your submitted schedule requests will appear here.
            </Text>
          </View>
        ) : (
          scheduleRequests.map((request) => {
            const status = getRequestStatus(request);
            const changes = Array.isArray(request.requestedChanges)
              ? request.requestedChanges
              : [];

            return (
              <View
                key={request._id}
                style={styles.historyCard}
              >
                <View style={styles.historyTopRow}>
                  <View style={styles.historyIcon}>
                    <Ionicons
                      name="calendar-outline"
                      size={19}
                      color={Colors.secondary}
                    />
                  </View>

                  <View style={styles.historyTitleContainer}>
                    <Text style={styles.historyTitle}>
                      Schedule Change Request
                    </Text>

                    <Text style={styles.historyDate}>
                      Submitted: {formatRequestDate(request.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.historyStatus}>
                    <Text style={styles.historyStatusText}>
                      {status}
                    </Text>
                  </View>
                </View>

                <View style={styles.historyDivider} />

                <Text style={styles.historyLabel}>
                  Requested Changes
                </Text>

                {changes.length > 0 ? (
                  changes.map((day, index) => (
                    <View
                      key={`${request._id}-${day.dayOfWeek}-${index}`}
                      style={styles.historyDayRow}
                    >
                      <Text style={styles.historyDayName}>
                        {formatDay(day.dayOfWeek || '')}
                      </Text>

                      <Text style={styles.historyDayTime}>
                        {day.isWorkingDay
                          ? `${formatTime(day.startTime)} - ${formatTime(day.endTime)}`
                          : 'Day Off'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.historyEmptyChanges}>
                    No change details available.
                  </Text>
                )}

                <View style={styles.effectiveDateRow}>
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={Colors.textMuted}
                  />

                  <Text style={styles.effectiveDateText}>
                    Effective date: {formatRequestDate(request.effectiveDate)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    );
  };
  const renderScheduleCard = (dayName) => {
    const day = scheduleMap[dayName];

    const hasPendingChange = pendingChanges.some(
      (item) => item.dayOfWeek === dayName
    );

    const isConfigured = Boolean(day);

    return (
      <View key={dayName} style={styles.dayCard}>
        <View style={styles.dayTopRow}>
          <View style={styles.dayInfo}>
            <Text style={styles.dayName}>
              {formatDay(dayName)}
            </Text>

            {!isConfigured ? (
              <Text style={styles.notConfigured}>
                Not configured
              </Text>
            ) : (
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: day.isWorkingDay
                        ? Colors.success
                        : Colors.textMuted,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: day.isWorkingDay
                        ? Colors.success
                        : Colors.textSecondary,
                    },
                  ]}
                >
                  {day.isWorkingDay ? 'Working Day' : 'Day Off'}
                </Text>
              </View>
            )}
          </View>

          <Pressable
            style={styles.editButton}
            onPress={() => openEditor(dayName)}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color={Colors.secondary}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        {isConfigured && day.isWorkingDay ? (
          <View style={styles.timeContainer}>
            <View style={styles.timeItem}>
              <Ionicons
                name="time-outline"
                size={17}
                color={Colors.secondary}
              />

              <View>
                <Text style={styles.timeLabel}>Working Hours</Text>
                <Text style={styles.timeValue}>
                  {formatTime(day.startTime)} -{' '}
                  {formatTime(day.endTime)}
                </Text>
              </View>
            </View>

            {day.breakStart && day.breakEnd && (
              <View style={styles.timeItem}>
                <Ionicons
                  name="cafe-outline"
                  size={17}
                  color={Colors.secondary}
                />

                <View>
                  <Text style={styles.timeLabel}>Break</Text>
                  <Text style={styles.timeValue}>
                    {formatTime(day.breakStart)} -{' '}
                    {formatTime(day.breakEnd)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.dayDescription}>
            {isConfigured
              ? 'You are not available on this day.'
              : 'No schedule information is available.'}
          </Text>
        )}

        {hasPendingChange && (
          <View style={styles.pendingBadge}>
            <Ionicons
              name="time-outline"
              size={13}
              color={Colors.warning}
            />
            <Text style={styles.pendingBadgeText}>
              Change pending submission
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (scheduleLoading && schedule.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.secondary}
        />
        <Text style={styles.loadingText}>
          Loading your schedule...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BarberHeader navigation={navigation} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.secondary}
          />
        }
      >
        {/* Page heading */}
        <View style={styles.pageHeading}>
          <View>
            <Text style={styles.pageTitle}>My Schedule</Text>
            <Text style={styles.pageSubtitle}>
              Manage your weekly working hours
            </Text>
          </View>

          <View style={styles.calendarIcon}>
            <Ionicons
              name="calendar-outline"
              size={23}
              color={Colors.secondary}
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="calendar"
                size={20}
                color={Colors.secondary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {summary.workingDays}
              <Text style={styles.summaryUnit}> / 7</Text>
            </Text>

            <Text style={styles.summaryLabel}>
              Working Days
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="time"
                size={20}
                color={Colors.secondary}
              />
            </View>

            <Text style={styles.summaryValue}>
              {formatHours(summary.totalMinutes)}
            </Text>

            <Text style={styles.summaryLabel}>
              Weekly Hours
            </Text>
          </View>
        </View>

        {/* Schedule heading */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Weekly Schedule
            </Text>
            <Text style={styles.sectionSubtitle}>
              Your current working hours
            </Text>
          </View>

          <Text style={styles.weekLabel}>MON - SUN</Text>
        </View>

        {/* Schedule error */}
        {scheduleError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {scheduleError}
            </Text>

            <Pressable
              onPress={() => {
                clearScheduleError();
                fetchSchedule();
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Weekly cards */}
        {WEEK_DAYS.map(renderScheduleCard)}

        {/* Pending changes */}
        {pendingChanges.length > 0 && (
          <View style={styles.requestInfoCard}>
            <View style={styles.requestInfoHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.warning}
              />

              <Text style={styles.requestInfoTitle}>
                Unsaved Schedule Changes
              </Text>
            </View>

            <Text style={styles.requestInfoText}>
              You have edited {pendingChanges.length}{' '}
              {pendingChanges.length === 1 ? 'day' : 'days'}.
              Submit your changes for salon owner approval.
            </Text>

            <Pressable
              style={[
                styles.submitButton,
                scheduleRequestSubmitting &&
                styles.disabledButton,
              ]}
              onPress={handleSubmitRequest}
              disabled={scheduleRequestSubmitting}
            >
              {scheduleRequestSubmitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="paper-plane-outline"
                    size={17}
                    color={Colors.white}
                  />
                  <Text style={styles.submitButtonText}>
                    Submit for Approval
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}
        {renderRequestHistory()}
        {scheduleRequestError && (
          <Text style={styles.errorText}>
            {scheduleRequestError}
          </Text>
        )}

        {/* Leave button */}
        <Pressable
          style={styles.leaveButton}
          onPress={handleAddLeave}
        >
          <View style={styles.leaveIcon}>
            <Ionicons
              name="calendar-clear-outline"
              size={20}
              color={Colors.secondary}
            />
          </View>

          <View style={styles.leaveTextContainer}>
            <Text style={styles.leaveTitle}>Request Leave</Text>
            <Text style={styles.leaveSubtitle}>
              Add your upcoming leave dates
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </Pressable>

        <View style={styles.bottomNote}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.textMuted}
          />

          <Text style={styles.bottomNoteText}>
            Schedule changes require salon owner approval before
            becoming active.
          </Text>
        </View>
      </ScrollView>

      {/* Edit Schedule Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Edit Schedule
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedDay ? formatDay(selectedDay) : ''}
                </Text>
              </View>

              <Pressable
                style={styles.closeButton}
                onPress={closeEditor}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={Colors.text}
                />
              </Pressable>
            </View>

            {/* Working day toggle */}
            <Pressable
              style={styles.workingToggle}
              onPress={() =>
                updateForm('isWorkingDay', !form.isWorkingDay)
              }
            >
              <View>
                <Text style={styles.fieldTitle}>
                  Working Day
                </Text>
                <Text style={styles.fieldHint}>
                  Enable or disable this day
                </Text>
              </View>

              <View
                style={[
                  styles.toggleTrack,
                  form.isWorkingDay && styles.toggleTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    form.isWorkingDay && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </Pressable>

            <Text style={styles.inputLabel}>
              Start Time (24-hour format)
            </Text>

            <TextInput
              style={styles.input}
              value={form.startTime}
              onChangeText={(value) =>
                updateForm('startTime', value)
              }
              placeholder="10:00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Text style={styles.inputLabel}>
              End Time (24-hour format)
            </Text>

            <TextInput
              style={styles.input}
              value={form.endTime}
              onChangeText={(value) =>
                updateForm('endTime', value)
              }
              placeholder="18:00"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <View style={styles.breakHeading}>
              <Text style={styles.inputLabel}>Break Time</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>

            <View style={styles.breakInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                value={form.breakStart}
                onChangeText={(value) =>
                  updateForm('breakStart', value)
                }
                placeholder="14:00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />

              <Text style={styles.breakSeparator}>TO</Text>

              <TextInput
                style={[styles.input, styles.halfInput]}
                value={form.breakEnd}
                onChangeText={(value) =>
                  updateForm('breakEnd', value)
                }
                placeholder="15:00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
            </View>

            <Pressable
              style={styles.saveButton}
              onPress={saveDayChanges}
            >
              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            </Pressable>

            <Text style={styles.modalNote}>
              Saving here only prepares your changes. They will
              become active after owner approval.
            </Text>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  // Header
  header: {
    height: 65,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
  },

  brandName: {
    color: Colors.textLight,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },

  portalText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },

  profileButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: Colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 35,
  },

  // Page heading
  pageHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: Colors.text,
  },

  pageSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
  },

  calendarIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 27,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  summaryValue: {
    fontSize: 25,
    fontWeight: '800',
    color: Colors.text,
  },

  summaryUnit: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  weekLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
  },

  // Day card
  dayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
    marginBottom: 11,
  },

  dayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dayInfo: {
    flex: 1,
  },

  dayName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 6,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  notConfigured: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 5,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSecondary,
  },

  editButtonText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },

  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  timeLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    marginBottom: 3,
  },

  timeValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  dayDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 12,
  },

  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#F8F0DF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 12,
  },

  pendingBadgeText: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },

  // Request section
  requestInfoCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 16,
    marginTop: 8,
    marginBottom: 15,
  },

  requestInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  requestInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },

  requestInfoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 9,
  },

  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 11,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 15,
  },

  submitButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.6,
  },

  // Leave
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 15,
    marginTop: 12,
  },

  leaveIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  leaveTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  leaveTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
  },

  leaveSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  bottomNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    marginTop: 20,
    paddingHorizontal: 3,
  },

  bottomNoteText: {
    flex: 1,
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 17,
  },

  errorContainer: {
    backgroundColor: '#FCEAEA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  errorText: {
    color: Colors.error,
    fontSize: 12,
  },

  retryText: {
    color: Colors.secondary,
    fontWeight: '700',
    fontSize: 12,
    marginTop: 7,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 32,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },

  modalSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  workingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  fieldTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  fieldHint: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },

  toggleTrack: {
    width: 45,
    height: 25,
    borderRadius: 15,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },

  toggleTrackActive: {
    backgroundColor: Colors.secondary,
  },

  toggleThumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },

  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    height: 47,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 13,
    color: Colors.text,
    fontSize: 14,
    marginBottom: 15,
  },

  breakHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  optionalText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 8,
  },

  breakInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  breakSeparator: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 15,
  },

  saveButton: {
    height: 49,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  modalNote: {
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
    color: Colors.textMuted,
    marginTop: 12,
  },
  // Schedule request history
  historySection: {
    marginTop: 22,
    marginBottom: 10,
  },

  historyCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },

  historyTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyTitleContainer: {
    flex: 1,
    marginLeft: 10,
  },

  historyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.text,
  },

  historyDate: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },

  historyStatus: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },

  historyStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.secondary,
  },

  historyDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },

  historyLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 9,
  },

  historyDayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },

  historyDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },

  historyDayTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  historyEmptyChanges: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  effectiveDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },

  effectiveDateText: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  emptyHistory: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 22,
    alignItems: 'center',
  },

  emptyHistoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 9,
  },

  emptyHistoryText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default BarberScheduleScreen;
