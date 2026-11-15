import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import useAuthStore from '../../store/useAuthStore';
import useBarberStore from '../../store/useBarberStore';
import useBarberAppointmentsStore from '../../store/useBarberAppointmentsStore';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatMoney = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

const formatWhen = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffDays = Math.round((startOfDay(d) - startOfDay(now)) / 86400000);

  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;

  let day;
  if (diffDays === 0) day = 'Today';
  else if (diffDays === 1) day = 'Tomorrow';
  else if (diffDays === -1) day = 'Yesterday';
  else day = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `${day}, ${h}:${m} ${period}`;
};

const initialsOf = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

// Badge shown at the top, by booking status
const BADGE = {
  PENDING_BARBER_APPROVAL: { label: 'AWAITING APPROVAL', color: '#C2661F', bg: 'rgba(194,102,31,0.12)', border: 'rgba(194,102,31,0.35)' },
  ACCEPTED: { label: 'AWAITING PAYMENT', color: '#8A6A12', bg: 'rgba(138,106,18,0.12)', border: 'rgba(138,106,18,0.35)' },
  CONFIRMED: { label: 'PAYMENT SETTLED', color: '#2F7A4D', bg: 'rgba(47,122,77,0.12)', border: 'rgba(47,122,77,0.35)' },
  IN_PROGRESS: { label: 'IN PROGRESS', color: '#3B63A0', bg: 'rgba(59,99,160,0.12)', border: 'rgba(59,99,160,0.35)' },
  COMPLETED: { label: 'PAYMENT SETTLED', color: '#2F7A4D', bg: 'rgba(47,122,77,0.12)', border: 'rgba(47,122,77,0.35)' },
  REJECTED: { label: 'REJECTED', color: '#B33A3A', bg: 'rgba(179,58,58,0.12)', border: 'rgba(179,58,58,0.35)' },
  CANCELLED: { label: 'CANCELLED', color: '#B33A3A', bg: 'rgba(179,58,58,0.12)', border: 'rgba(179,58,58,0.35)' },
};

const PAID = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

/*
 * PLACEHOLDER: builds the receipt details from a list item.
 * TODO: replace with GET /bookings/:id (not confirmed to exist for barbers yet)
 * and map the real response here.
 */
const buildDetails = (base, barberName, salonName) => {
  const services = base.services?.length
    ? base.services
    : [
        {
          name: base.service?.name || 'Service',
          description: 'Precision work finished with a hot lather razor.',
          durationMinutes: base.durationMinutes || 30,
          price: base.price || 1200,
        },
      ];

  const subtotal = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const tip = base.status === 'COMPLETED' ? 200 : 0;

  return {
    ...base,
    invoiceNo: `#TRM-${new Date(base.startTime).getFullYear()}-${String(base._id).replace(/\D/g, '').padStart(4, '0').slice(-4)}`,
    txnId: 'TXN-884920184',
    salon: { name: salonName, address: 'Chair 01' },
    barber: { name: barberName },
    customer: {
      name: base.customer?.name || 'Customer',
      phone: '+92 321 ••••891',
    },
    services,
    subtotal,
    fee: 0,
    tip,
    total: subtotal + tip,
    review:
      base.status === 'COMPLETED'
        ? { rating: 5.0, comment: 'Crisp fade and great attention to detail as always.' }
        : null,
  };
};

// Used only when the booking is not in any store (e.g. opened by deep link)
const FALLBACK = {
  _id: 'demo0915',
  startTime: new Date().toISOString(),
  durationMinutes: 45,
  status: 'CONFIRMED',
  customer: { name: 'Hamza Malik' },
  service: { name: 'Skin Fade & Beard Trim' },
  services: [
    {
      name: 'Skin Haircut',
      description: 'Precision low taper, hot lather razor finish',
      durationMinutes: 45,
      price: 1200,
    },
    {
      name: 'Beard Sculpting & Hot Towel',
      description: 'Organic cedarwood beard balm & steam therapy',
      durationMinutes: 30,
      price: 600,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */

export default function AppointmentDetailsScreen({ navigation, route }) {
  const appointmentId = route?.params?.appointmentId;

  const { user } = useAuthStore();
  const dashboardAppointments = useBarberStore((s) => s.appointments);
  const { appointments, actionId, confirmAppointment, startService, completeService, _setStatus } =
    useBarberAppointmentsStore();

  const barberName = user?.name || 'Barber';
  const salonName =
    user?.barberProfile?.salon?.name || user?.salon?.name || user?.salonName || 'Trimly Salon';

  // Always prefer the store version so status changes show up immediately
  const base = useMemo(
    () =>
      appointments.find((a) => a._id === appointmentId) ||
      dashboardAppointments.find((a) => a._id === appointmentId) ||
      FALLBACK,
    [appointments, dashboardAppointments, appointmentId]
  );

  const [localStatus, setLocalStatus] = useState(null);
  const status = localStatus || base.status;

  const details = useMemo(
    () => buildDetails({ ...base, status }, barberName, salonName),
    [base, status, barberName, salonName]
  );

  const badge = BADGE[status] || BADGE.PENDING_BARBER_APPROVAL;
  const paid = PAID.includes(status);
  const busy = actionId === base._id;

  /* --------------------------- actions ----------------------------- */

  const runAction = async (fn, nextStatus) => {
    await fn(base._id);
    setLocalStatus(nextStatus);
  };

  const handleReject = () => {
    Alert.alert('Reject booking', 'Are you sure you want to reject this booking?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          // TODO: PATCH /bookings/:id/reject  { reason }
          _setStatus(base._id, 'REJECTED');
          setLocalStatus('REJECTED');
        },
      },
    ]);
  };

  const comingSoon = (feature) =>
    Alert.alert(feature, 'This feature will be available soon.');

  /* --------------------------- pieces ------------------------------ */

  const renderActions = () => {
    if (status === 'PENDING_BARBER_APPROVAL') {
      return (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject} activeOpacity={0.85}>
            <Ionicons name="close" size={16} color={Colors.error} />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, busy && styles.disabled]}
            onPress={() => runAction(confirmAppointment, 'ACCEPTED')}
            disabled={busy}
            activeOpacity={0.85}
          >
            {busy ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
                <Text style={styles.primaryText}>Confirm Booking</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    if (status === 'ACCEPTED') {
      return (
        <View style={styles.noteBox}>
          <Ionicons name="hourglass-outline" size={16} color={Colors.textGold} />
          <Text style={styles.noteText}>Waiting for the customer to pay the deposit.</Text>
        </View>
      );
    }

    if (status === 'CONFIRMED' || status === 'IN_PROGRESS') {
      const starting = status === 'CONFIRMED';
      return (
        <TouchableOpacity
          style={[styles.primaryButton, styles.fullButton, busy && styles.disabled]}
          onPress={() =>
            starting
              ? runAction(startService, 'IN_PROGRESS')
              : runAction(completeService, 'COMPLETED')
          }
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons
                name={starting ? 'play' : 'checkmark-done'}
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.primaryText}>{starting ? 'Start Service' : 'Complete Service'}</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return null; // completed, rejected, cancelled
  };

  const actions = renderActions();

  /* ---------------------------- UI --------------------------------- */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Appointment Details</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => comingSoon('Share')}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={19} color={Colors.accent} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => comingSoon('Download receipt')}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={19} color={Colors.accent} />
          </TouchableOpacity>

          <View style={styles.headerAvatar}>
            <Ionicons name="person-outline" size={16} color={Colors.accent} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <View style={[styles.badgeDot, { backgroundColor: badge.color }]} />
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>

          {paid && <Text style={styles.txn}>{details.txnId}</Text>}
        </View>

        {/* Receipt card */}
        <View style={styles.receipt}>
          <View style={styles.receiptAccent} />

          {/* Brand */}
          <View style={styles.brandBlock}>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="content-cut" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.salonTitle}>{details.salon.name}</Text>
            <Text style={styles.tagline}>BESPOKE MEN'S GROOMING</Text>
          </View>

          {/* Location */}
          <View style={styles.locationBox}>
            <Text style={styles.locationMain}>
              {details.salon.name} • {details.salon.address}
            </Text>
            <Text style={styles.locationSub}>Artisan: {details.barber.name}</Text>
          </View>

          {/* Invoice + date */}
          <View style={styles.invoiceRow}>
            <View>
              <Text style={styles.smallLabel}>INVOICE NO.</Text>
              <Text style={styles.invoiceValue}>{details.invoiceNo}</Text>
            </View>

            <View style={styles.alignEnd}>
              <Text style={styles.smallLabel}>DATE & TIME</Text>
              <Text style={styles.invoiceValue}>{formatWhen(details.startTime)}</Text>
            </View>
          </View>

          {/* Patron + stylist */}
          <View style={styles.peopleRow}>
            <View style={styles.personCard}>
              <Text style={styles.smallLabel}>PATRON</Text>
              <View style={styles.personInner}>
                <View style={styles.initialsBadge}>
                  <Text style={styles.initialsText}>{initialsOf(details.customer.name)}</Text>
                </View>
                <View style={styles.personText}>
                  <Text style={styles.personName} numberOfLines={1}>
                    {details.customer.name}
                  </Text>
                  <Text style={styles.personSub} numberOfLines={1}>
                    {details.customer.phone}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.personCard}>
              <Text style={styles.smallLabel}>LEAD STYLIST</Text>
              <View style={styles.personInner}>
                <View style={[styles.initialsBadge, styles.stylistBadge]}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />
                </View>
                <View style={styles.personText}>
                  <Text style={styles.personName} numberOfLines={1}>
                    {details.barber.name}
                  </Text>
                  <Text style={styles.personSub} numberOfLines={1}>
                    Master Artisan
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Services */}
          <Text style={styles.sectionLabel}>SERVICES RENDERED</Text>

          {details.services.map((s, index) => (
            <View key={`${s.name}-${index}`} style={styles.serviceRow}>
              <View style={styles.serviceTop}>
                <Text style={styles.serviceName}>{s.name}</Text>
                <Text style={styles.servicePrice}>{formatMoney(s.price)}</Text>
              </View>
              {!!s.description && <Text style={styles.serviceDesc}>{s.description}</Text>}
              <Text style={styles.serviceDesc}>({s.durationMinutes} min)</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Services Subtotal</Text>
              <Text style={styles.totalValue}>{formatMoney(details.subtotal)}</Text>
            </View>

            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Atelier Concierge Fee</Text>
              <Text style={styles.complimentary}>Complimentary</Text>
            </View>

            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Artisan Gratuity (Tip)</Text>
              <Text style={styles.totalValue}>{formatMoney(details.tip)}</Text>
            </View>

            <View style={styles.grandDivider} />

            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>{paid ? 'Total Settled' : 'Total Amount'}</Text>
              <Text style={styles.grandValue}>{formatMoney(details.total)}</Text>
            </View>
          </View>

          {/* Review (completed only) */}
          {details.review && (
            <View style={styles.reviewBox}>
              <View style={styles.reviewTop}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= Math.round(details.review.rating) ? 'star' : 'star-outline'}
                      size={12}
                      color="#F59E0B"
                    />
                  ))}
                  <Text style={styles.ratingNumber}>{details.review.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.verified}>VERIFIED VISIT</Text>
              </View>
              <Text style={styles.reviewText}>"{details.review.comment}"</Text>
            </View>
          )}
        </View>

        <Text style={styles.footerNote}>Trimly • Barber Portal</Text>
      </ScrollView>

      {/* Sticky action bar */}
      {actions && <View style={styles.actionBar}>{actions}</View>}
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },

  /* header */
  header: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },
  headerIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    position: 'absolute',
    left: 60,
    right: 120,
    textAlign: 'center',
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  headerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  /* body */
  scrollView: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 28 },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 7 },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  txn: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },

  /* receipt card */
  receipt: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 18,
    overflow: 'hidden',
    elevation: 3,
  },
  receiptAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.accent,
  },

  brandBlock: { alignItems: 'center', marginBottom: 18 },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  salonTitle: { color: Colors.text, fontSize: 21, fontWeight: '700', fontFamily: 'serif', textAlign: 'center' },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginTop: 5,
  },

  locationBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 14,
  },
  locationMain: { color: Colors.text, fontSize: 12, fontWeight: '600' },
  locationSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },

  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  alignEnd: { alignItems: 'flex-end' },
  smallLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  invoiceValue: { color: Colors.text, fontSize: 12, fontWeight: '700' },

  peopleRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  personCard: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 11,
  },
  personInner: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  initialsBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylistBadge: { backgroundColor: Colors.accent },
  initialsText: { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  personText: { flex: 1, marginLeft: 9 },
  personName: { color: Colors.text, fontSize: 12.5, fontWeight: '700' },
  personSub: { color: Colors.textSecondary, fontSize: 10, marginTop: 2 },

  /* services */
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 12,
  },
  serviceRow: { marginBottom: 14 },
  serviceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  serviceName: { flex: 1, color: Colors.text, fontSize: 14, fontWeight: '700', marginRight: 10 },
  servicePrice: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  serviceDesc: { color: Colors.textSecondary, fontSize: 11.5, lineHeight: 17, marginTop: 3 },

  /* totals */
  totalsBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  totalLabel: { color: Colors.textSecondary, fontSize: 12 },
  totalValue: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  complimentary: { color: Colors.textGold, fontSize: 12, fontStyle: 'italic' },
  grandDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  grandLabel: { color: Colors.text, fontSize: 16, fontWeight: '700', fontFamily: 'serif' },
  grandValue: { color: Colors.textGold, fontSize: 20, fontWeight: '800', fontFamily: 'serif' },

  /* review */
  reviewBox: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingNumber: { color: Colors.text, fontSize: 12, fontWeight: '800', marginLeft: 6 },
  verified: { color: Colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 0.6 },
  reviewText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
  },

  footerNote: {
    textAlign: 'center',
    color: Colors.secondary,
    fontSize: 12,
    fontFamily: 'serif',
    fontStyle: 'italic',
    marginTop: 18,
  },

  /* action bar */
  actionBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 16,
  },
  actionRow: { flexDirection: 'row', gap: 10 },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 13,
    paddingVertical: 14,
    gap: 7,
  },
  fullButton: { flex: 0, alignSelf: 'stretch' },
  primaryText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  rejectButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCEAEA',
    borderWidth: 1,
    borderColor: '#F2D8D8',
    borderRadius: 13,
    paddingVertical: 14,
    gap: 6,
  },
  rejectText: { color: Colors.error, fontSize: 13, fontWeight: '800' },
  disabled: { opacity: 0.6 },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  noteText: { color: Colors.textSecondary, fontSize: 12 },
});
