
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import useAuthStore from '../../store/useAuthStore';

export default function BarberProfileScreen() {
  const { user, logout } = useAuthStore();

  // Barber-specific information, if available from the backend.
  const barber = user?.barberProfile || user?.barber || {};

  const name = user?.name || 'Barber';
  const email = user?.email || 'Not available';
  const phone = user?.phone || 'Not available';
  const profilePhoto = user?.profilePhoto;

  const salonName =
    barber?.salon?.name ||
    user?.salon?.name ||
    user?.salonName ||
    'No salon assigned';

  const bio = barber?.bio || '';
  const specialties = Array.isArray(barber?.specialties)
    ? barber.specialties
    : [];

  const experience = barber?.experienceYears;
  const rating = barber?.rating;
  const reviewCount = barber?.reviewCount;

  const showComingSoon = (feature) => {
    Alert.alert(feature, 'This feature will be available soon.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const InfoCard = ({ icon, title, subtitle, children }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons
            name={icon}
            size={19}
            color={Colors.textGold}
          />
        </View>

        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {children}
    </View>
  );

  const MenuItem = ({ icon, title, description, onPress, color }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>

      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={Colors.textMuted}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <MaterialCommunityIcons
            name="content-cut"
            size={21}
            color={Colors.accent}
          />
          <Text style={styles.brandTitle}>Trimly</Text>
          <View style={styles.brandDot} />
        </View>

        <View style={styles.headerRight}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>BARBER PORTAL</Text>
          </View>

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
        {/* Profile Hero */}
        <View style={styles.heroCard}>
          <View style={styles.orbitalRingOuter} />
          <View style={styles.orbitalRingInner} />

          <View style={styles.heroTopRow}>
            <View style={styles.accountBadge}>
              <View style={styles.accountDot} />
              <Text style={styles.accountBadgeText}>BARBER ACCOUNT</Text>
            </View>

            <Text style={styles.salonName} numberOfLines={1}>
              {salonName}
            </Text>
          </View>

          <View style={styles.heroCenter}>
            <View style={styles.avatarWrapper}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Ionicons
                    name="person"
                    size={38}
                    color={Colors.accent}
                  />
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroRole}>Professional Barber</Text>

            <View style={styles.ratingPill}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={styles.ratingText}>
                {rating != null ? Number(rating).toFixed(1) : '—'}
              </Text>
              <Text style={styles.reviewText}>
                {reviewCount != null
                  ? `(${reviewCount} reviews)`
                  : '(No reviews yet)'}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {experience != null ? `${experience}+` : '—'}
              </Text>
              <Text style={styles.statLabel}>YEARS EXP.</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {reviewCount ?? '—'}
              </Text>
              <Text style={styles.statLabel}>REVIEWS</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {rating != null ? Number(rating).toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>RATING</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => showComingSoon('Edit Profile')}
            activeOpacity={0.85}
          >
            <Ionicons name="pencil" size={15} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Professional Bio */}
        <Text style={styles.sectionHeading}>PROFESSIONAL PROFILE</Text>

        <InfoCard
          icon="content-cut"
          title="About & Specialties"
          subtitle="Your professional experience and craft"
        >
          <Text style={styles.bioText}>
            {bio || 'Add a short introduction about your barbering experience and services.'}
          </Text>

          <View style={styles.lightDivider} />

          <Text style={styles.subheading}>SPECIALTIES</Text>

          {specialties.length > 0 ? (
            <View style={styles.specialtiesContainer}>
              {specialties.map((item, index) => (
                <View key={`${item}-${index}`} style={styles.specialtyChip}>
                  <View style={styles.chipDot} />
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              No specialties added yet.
            </Text>
          )}
        </InfoCard>

        {/* Account Information */}
        <Text style={styles.sectionHeading}>ACCOUNT CREDENTIALS</Text>

        <InfoCard
          icon="account-circle-outline"
          title="Account Information"
          subtitle="Your contact and login details"
        >
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={16} color={Colors.primary} />
            </View>

            <View style={styles.contactDetails}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <Text style={styles.fieldValue}>{email}</Text>
            </View>
          </View>

          <View style={styles.lightDivider} />

          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={16} color={Colors.primary} />
            </View>

            <View style={styles.contactDetails}>
              <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
              <Text style={styles.fieldValue}>{phone}</Text>
            </View>
          </View>

          <View style={styles.lightDivider} />

          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <MaterialCommunityIcons
                name="store-outline"
                size={17}
                color={Colors.primary}
              />
            </View>

            <View style={styles.contactDetails}>
              <Text style={styles.fieldLabel}>SALON AFFILIATION</Text>
              <Text style={styles.fieldValue}>{salonName}</Text>
            </View>
          </View>
        </InfoCard>

        {/* Barber Management */}
        <Text style={styles.sectionHeading}>CLIENT & PERFORMANCE</Text>

        <View style={styles.card}>
          <MenuItem
            icon="star-outline"
            title="Customer Reviews"
            description="View ratings and customer feedback"
            color="#FDF0D9"
            onPress={() => showComingSoon('Customer Reviews')}
          />

          <View style={styles.lightDivider} />

          <MenuItem
            icon="trending-up-outline"
            title="Personal Statistics"
            description="Appointments, performance and earnings"
            color="#EAF0F8"
            onPress={() => showComingSoon('Personal Statistics')}
          />

          <View style={styles.lightDivider} />

          <MenuItem
            icon="chatbubble-ellipses-outline"
            title="Customer Messages"
            description="Manage appointment inquiries"
            color="#F6EAF0"
            onPress={() => showComingSoon('Customer Messages')}
          />

          <View style={styles.lightDivider} />

          <MenuItem
            icon="shield-checkmark-outline"
            title="Change Password"
            description="Update your account password"
            color="#EEECE8"
            onPress={() => showComingSoon('Change Password')}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={Colors.error}
            />
          </View>

          <View style={styles.logoutText}>
            <Text style={styles.logoutTitle}>Log Out</Text>
            <Text style={styles.logoutSubtitle}>
              Sign out from your barber account
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={Colors.error}
          />
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Trimly • Barber Portal</Text>
          <Text style={styles.footerSubtitle}>
            Your craft. Your clients. Your journey.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary,
  },

  header: {
    height: 56,
    paddingHorizontal: 18,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderDark,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 7,
    fontFamily: 'serif',
  },

  brandDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginLeft: 5,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  roleBadge: {
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 10,
  },

  roleBadgeText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 30,
  },

  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 18,
    marginBottom: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderDark,
    elevation: 4,
  },

  orbitalRingOuter: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 117, 0.07)',
    top: -120,
    right: -100,
  },

  orbitalRingInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(229, 184, 117, 0.1)',
    top: -70,
    right: -50,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  accountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(77, 155, 115, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(77, 155, 115, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  accountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },

  accountBadgeText: {
    color: Colors.success,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  salonName: {
    color: Colors.textMuted,
    fontSize: 11,
    flexShrink: 1,
    marginLeft: 8,
    textAlign: 'right',
  },

  heroCenter: {
    alignItems: 'center',
  },

  avatarWrapper: {
    marginBottom: 12,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: Colors.accent,
  },

  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surfaceDarkSecondary,
    borderWidth: 2.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroName: {
    color: Colors.white,
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'serif',
    textAlign: 'center',
  },

  heroRole: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
    marginBottom: 10,
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginBottom: 18,
    gap: 5,
  },

  ratingText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '800',
  },

  reviewText: {
    color: Colors.textMuted,
    fontSize: 11,
  },

  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceDark,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginBottom: 16,
  },

  statBox: {
    flex: 1,
    alignItems: 'center',
  },

  statNumber: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 3,
  },

  statLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: Colors.borderDark,
  },

  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 13,
    gap: 7,
  },

  editButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  sectionHeading: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
    marginLeft: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 19,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  cardIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeaderText: {
    marginLeft: 11,
  },

  cardTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  bioText: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 21,
    marginBottom: 12,
  },

  lightDivider: {
    height: 1,
    backgroundColor: Colors.background,
    marginVertical: 12,
  },

  subheading: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 11,
  },

  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginRight: 7,
  },

  chipText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '700',
  },

  emptyText: {
    color: Colors.textMuted,
    fontSize: 12,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },

  contactIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contactDetails: {
    flex: 1,
  },

  fieldLabel: {
    color: Colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  fieldValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },

  menuIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },

  menuDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },

  logoutCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: '#F2D8D8',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  logoutIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: '#FCEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  logoutText: {
    flex: 1,
  },

  logoutTitle: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },

  logoutSubtitle: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },

  footer: {
    alignItems: 'center',
    marginBottom: 12,
  },

  footerTitle: {
    color: Colors.secondary,
    fontSize: 13,
    fontFamily: 'serif',
    fontStyle: 'italic',
    marginBottom: 3,
  },

  footerSubtitle: {
    color: Colors.textMuted,
    fontSize: 10,
  },
});
