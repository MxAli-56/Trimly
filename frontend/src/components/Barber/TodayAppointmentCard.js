
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

const TodayAppointmentCard = ({ appointment, onPress }) => {
  if (!appointment) return null;

  const customerName =
    appointment.customer?.name ||
    appointment.customer?.fullName ||
    'Customer';

  const serviceName =
    typeof appointment.service === 'string'
      ? appointment.service
      : appointment.service?.name ||
        appointment.service?.serviceName ||
        'Service';

  const getTime = (value) => {
    if (!value) return 'Time not available';

    // Already formatted time, e.g. 10:30 AM
    if (typeof value === 'string' && /AM|PM/i.test(value)) {
      return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return styles.confirmed;

      case 'IN_PROGRESS':
        return styles.inProgress;

      case 'COMPLETED':
        return styles.completed;

      case 'PENDING':
      case 'PENDING_BARBER_APPROVAL':
        return styles.pending;

      default:
        return styles.defaultStatus;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';

    return status
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.customerSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {customerName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName} numberOfLines={1}>
              {customerName}
            </Text>

            <Text style={styles.appointmentCode}>
              {appointment.appointmentCode || 'Appointment'}
            </Text>
          </View>
        </View>

        <View style={[styles.statusBadge, getStatusStyle(appointment.status)]}>
          <Text style={styles.statusText}>
            {formatStatus(appointment.status)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>SERVICE</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {serviceName}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>TIME</Text>
          <Text style={styles.detailValue}>
            {getTime(appointment.startTime)}
          </Text>
        </View>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.price}>
          Rs. {appointment.price ?? 0}
        </Text>

        <Text style={styles.duration}>
          {appointment.durationMinutes
            ? `${appointment.durationMinutes} min`
            : ''}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E2DA',
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D8D0C5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#262522',
  },

  customerInfo: {
    marginLeft: 11,
    flex: 1,
  },

  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#262522',
  },

  appointmentCode: {
    fontSize: 12,
    color: '#8A837A',
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  confirmed: {
    backgroundColor: '#E7F2EA',
  },

  inProgress: {
    backgroundColor: '#F9EBD8',
  },

  completed: {
    backgroundColor: '#E8E8E8',
  },

  pending: {
    backgroundColor: '#F5EBD5',
  },

  defaultStatus: {
    backgroundColor: '#EFECE7',
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B463F',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEAE4',
    marginVertical: 14,
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#969087',
    letterSpacing: 0.7,
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262522',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#262522',
  },

  duration: {
    fontSize: 12,
    color: '#8A837A',
  },
});

export default TodayAppointmentCard;
