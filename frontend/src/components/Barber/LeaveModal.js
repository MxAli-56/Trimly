
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Colors from '../../constants/Colors';
import useBarberStore from '../../store/useBarberStore';

const LeaveModal = ({ navigation }) => {
  // Zustand state and actions
  const leaves = useBarberStore((state) => state.leaves);
  const leavesLoading = useBarberStore((state) => state.leavesLoading);
  const leaveSubmitting = useBarberStore((state) => state.leaveSubmitting);
  const leaveDeletingId = useBarberStore((state) => state.leaveDeletingId);

  const fetchLeaves = useBarberStore((state) => state.fetchLeaves);
  const addLeave = useBarberStore((state) => state.addLeave);
  const deleteLeave = useBarberStore((state) => state.deleteLeave);

  // Form state
  const [leaveDate, setLeaveDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const resetForm = () => {
    setLeaveDate('');
    setStartTime('');
    setEndTime('');
    setReason('');
  };

  const validateForm = () => {
    if (!leaveDate.trim() || !startTime.trim() || !endTime.trim()) {
      Alert.alert(
        'Missing Information',
        'Please fill in the date and both times.'
      );
      return false;
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!datePattern.test(leaveDate)) {
      Alert.alert('Invalid Date', 'Use the YYYY-MM-DD format.');
      return false;
    }

    // Validate using local date components
    const [year, month, day] = leaveDate.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      Alert.alert('Invalid Date', 'Please enter a valid date.');
      return false;
    }

    if (!timePattern.test(startTime) || !timePattern.test(endTime)) {
      Alert.alert(
        'Invalid Time',
        'Use the HH:mm format, such as 09:30.'
      );
      return false;
    }

    if (startTime >= endTime) {
      Alert.alert(
        'Invalid Time Range',
        'End time must be greater than start time.'
      );
      return false;
    }

    return true;
  };

  const handleAddLeave = async () => {
    if (!validateForm()) return;

    const leaveData = {
      leaveDate,
      startTime,
      endTime,
      reason: reason.trim(),
    };

    const result = await addLeave(leaveData);

    if (!result.success) {
      Alert.alert('Error', result.error);
      return;
    }

    Alert.alert('Success', 'Leave added successfully.');
    resetForm();
  };

  const handleDeleteLeave = (leaveId) => {
    Alert.alert(
      'Remove Leave',
      'Are you sure you want to remove this leave?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteLeave(leaveId);

            if (!result.success) {
              Alert.alert('Error', result.error);
              return;
            }

            Alert.alert('Success', 'Leave removed successfully.');
          },
        },
      ]
    );
  };

  const renderLeave = ({ item }) => (
    <View style={styles.leaveCard}>
      <View style={styles.leaveInfo}>
        <View style={styles.leaveIcon}>
          <Ionicons
            name="calendar-outline"
            size={21}
            color={Colors.secondary}
          />
        </View>

        <View style={styles.leaveDetails}>
          <Text style={styles.leaveDate}>
            {item.leaveDate
              ? new Date(item.leaveDate).toLocaleDateString()
              : 'Date unavailable'}
          </Text>

          <Text style={styles.leaveTime}>
            {item.startTime} - {item.endTime}
          </Text>

          {!!item.reason && (
            <Text style={styles.leaveReason}>{item.reason}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteLeave(item._id)}
        disabled={leaveDeletingId === item._id}
      >
        {leaveDeletingId === item._id ? (
          <ActivityIndicator color={Colors.error} size="small" />
        ) : (
          <Ionicons
            name="trash-outline"
            size={20}
            color={Colors.error}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={23}
              color={Colors.text}
            />
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Manage Leaves</Text>
            <Text style={styles.headerSubtitle}>
              Manage your temporary time off
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Add Temporary Leave</Text>
            <Text style={styles.sectionSubtitle}>
              Select the date and time you will be unavailable.
            </Text>

            <Text style={styles.inputLabel}>Leave Date</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="calendar-outline"
                size={19}
                color={Colors.textMuted}
              />
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
                value={leaveDate}
                onChangeText={setLeaveDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            <View style={styles.timeRow}>
              <View style={styles.timeColumn}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textMuted}
                    value={startTime}
                    onChangeText={setStartTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.timeColumn}>
                <Text style={styles.inputLabel}>End Time</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="time-outline"
                    size={19}
                    color={Colors.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="17:00"
                    placeholderTextColor={Colors.textMuted}
                    value={endTime}
                    onChangeText={setEndTime}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.inputLabel}>Reason (Optional)</Text>
            <View style={[styles.inputContainer, styles.reasonContainer]}>
              <TextInput
                style={styles.reasonInput}
                placeholder="Enter reason for leave..."
                placeholderTextColor={Colors.textMuted}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                leaveSubmitting && styles.disabledButton,
              ]}
              onPress={handleAddLeave}
              disabled={leaveSubmitting}
            >
              {leaveSubmitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.addButtonText}>Add Leave</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>My Leaves</Text>
            <Text style={styles.leaveCount}>
              {leaves.length} Total
            </Text>
          </View>

          {leavesLoading ? (
            <ActivityIndicator
              size="large"
              color={Colors.secondary}
              style={styles.loader}
            />
          ) : leaves.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-clear-outline"
                size={42}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No Leaves Added</Text>
              <Text style={styles.emptySubtitle}>
                Your temporary leaves will appear here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={leaves}
              keyExtractor={(item) => item._id}
              renderItem={renderLeave}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 13,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 13,
  },
  inputContainer: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 11,
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 10,
    paddingVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  reasonContainer: {
    minHeight: 85,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  reasonInput: {
    flex: 1,
    width: '100%',
    fontSize: 14,
    color: Colors.text,
    minHeight: 65,
  },
  addButton: {
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 13,
  },
  leaveCount: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '700',
  },
  leaveCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leaveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leaveIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveDetails: {
    marginLeft: 12,
    flex: 1,
  },
  leaveDate: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  leaveTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  leaveReason: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FCEEEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  loader: {
    marginTop: 30,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 15,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default LeaveModal;
