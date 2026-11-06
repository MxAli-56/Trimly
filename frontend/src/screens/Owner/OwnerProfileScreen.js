
import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

import Colors from '../../constants/Colors';
import useAuthStore from '../../store/useAuthStore';

const OwnerProfileScreen = () => {
  const { user, logout } = useAuthStore();

  // Salon information from the authenticated user
  const salon = user?.salon || {};

  const salonName = salon.name || user?.salonName || 'Your Salon';
  const salonAddress = salon.address || 'Add your salon address';
  const salonPhone = salon.phone || user?.phone || 'Add contact number';
  const salonCategory = salon.category || 'Add salon category';
  const salonDescription = salon.description || 'Add a description of your salon.';

  // Display placeholders until operating hours are available from the backend
  const operatingHours = salon.operatingHours || [
    { day: 'Monday', time: 'Set hours', isOpen: false },
    { day: 'Tuesday', time: 'Set hours', isOpen: false },
    { day: 'Wednesday', time: 'Set hours', isOpen: false },
    { day: 'Thursday', time: 'Set hours', isOpen: false },
    { day: 'Friday', time: 'Set hours', isOpen: false },
    { day: 'Saturday', time: 'Set hours', isOpen: false },
    { day: 'Sunday', time: 'Set hours', isOpen: false },
  ];

  const InfoRow = ({ label, value, editable = true }) => (
    <View style={styles.infoFieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValueText} numberOfLines={2}>
          {value}
        </Text>

        {editable && (
          <TouchableOpacity style={styles.fieldEditBtn}>
            <Ionicons
              name="pencil"
              size={13}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.backgroundDark}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconButton}>
          <Ionicons
            name="menu-outline"
            size={26}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Store & Profile</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo */}
        <View style={styles.coverSection}>
          {salon.coverPhoto ? (
            <Image
              source={{ uri: salon.coverPhoto }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={42}
                color={Colors.textMuted}
              />
              <Text style={styles.coverPlaceholderText}>
                Salon Cover
              </Text>
            </View>
          )}

          <View style={styles.coverOverlay} />

          <TouchableOpacity style={styles.coverEditButton}>
            <Ionicons
              name="camera"
              size={13}
              color={Colors.white}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.coverEditText}>Cover</Text>
          </TouchableOpacity>

          {/* Salon Logo */}
          <View style={styles.logoBadgeContainer}>
            {salon.logo ? (
              <Image
                source={{ uri: salon.logo }}
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.logoBadgeInner}>
                <MaterialCommunityIcons
                  name="content-cut"
                  size={23}
                  color={Colors.accent}
                />
                <Text style={styles.logoBrandName}>YOUR</Text>
                <Text style={styles.logoBrandName}>SALON</Text>
              </View>
            )}

            <TouchableOpacity style={styles.logoEditBadge}>
              <Ionicons
                name="pencil"
                size={11}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Information */}
        <View style={styles.storeInfoCard}>
          <View style={styles.storeInfoHeaderRow}>
            <Text style={styles.storeInfoHeading}>
              Store Information
            </Text>

            {salon.isVerified && (
              <View style={styles.verifiedTag}>
                <Ionicons
                  name="checkmark-circle"
                  size={12}
                  color={Colors.success}
                />
                <Text style={styles.verifiedTagText}>Verified</Text>
              </View>
            )}
          </View>

          <InfoRow label="Store Name" value={salonName} />

          <InfoRow label="Address" value={salonAddress} />

          <InfoRow label="Phone Number" value={salonPhone} />

          <View style={styles.infoFieldRow}>
            <Text style={styles.fieldLabel}>Category</Text>

            <View style={styles.categoryPill}>
              <MaterialCommunityIcons
                name="content-cut"
                size={12}
                color={Colors.secondary}
              />
              <Text style={styles.categoryPillText}>
                {salonCategory}
              </Text>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesSection}>
            <View style={styles.amenitiesHeader}>
              <Text style={styles.fieldLabel}>Amenities</Text>

              <TouchableOpacity>
                <Ionicons
                  name="pencil"
                  size={13}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {salon.amenities?.length > 0 ? (
              <View style={styles.amenityChipsRow}>
                {salon.amenities.map((amenity, index) => (
                  <View key={`${amenity}-${index}`} style={styles.amenityChip}>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Add amenities available at your salon
              </Text>
            )}
          </View>

          <InfoRow
            label="Description"
            value={salonDescription}
            editable
          />
        </View>

        {/* Operating Hours */}
        <View style={styles.operatingHoursCard}>
          <View style={styles.operatingHoursHeader}>
            <View style={styles.operatingHeaderLeft}>
              <Ionicons
                name="time-outline"
                size={17}
                color={Colors.accent}
                style={{ marginRight: 7 }}
              />

              <Text style={styles.operatingTitle}>
                OPERATING HOURS
              </Text>
            </View>

            <TouchableOpacity style={styles.editHoursButton}>
              <Text style={styles.editHoursText}>Edit hours</Text>
            </TouchableOpacity>
          </View>

          {operatingHours.map((item) => (
            <View key={item.day} style={styles.dayRow}>
              <View style={styles.daySwitchContainer}>
                <Switch
                  value={item.isOpen}
                  disabled
                  trackColor={{
                    false: Colors.borderDark,
                    true: Colors.accent,
                  }}
                  thumbColor={Colors.white}
                  style={styles.daySwitch}
                />

                <Text style={styles.dayName}>{item.day}</Text>
              </View>

              <Text
                style={[
                  styles.dayTime,
                  !item.isOpen && styles.dayTimeClosed,
                ]}
              >
                {item.time}
              </Text>
            </View>
          ))}
        </View>

        {/* Services */}
        <TouchableOpacity
          style={styles.servicesCard}
          activeOpacity={0.85}
        >
          <View style={styles.servicesTopRow}>
            <View style={styles.servicesIconBox}>
              <MaterialCommunityIcons
                name="content-cut"
                size={19}
                color={Colors.white}
              />
            </View>

            <View style={styles.servicesTextBox}>
              <Text style={styles.servicesHeading}>
                Services & Pricing
              </Text>

              <Text style={styles.servicesSubHeading}>
                Manage your salon services
              </Text>
            </View>
          </View>

          <View style={styles.servicesDivider} />

          <View style={styles.servicesBottomRow}>
            <View>
              <Text style={styles.manageServicesTitle}>
                Manage services
              </Text>

              <Text style={styles.manageServicesSubtitle}>
                Haircuts, beard care, packages and pricing
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={Colors.white}
            />
          </View>
        </TouchableOpacity>

        {/* Barbers */}
        <View style={styles.barbersCard}>
          <View style={styles.barbersTopRow}>
            <View style={styles.barbersIconBox}>
              <FontAwesome5
                name="user-friends"
                size={15}
                color={Colors.accent}
              />
            </View>

            <View style={styles.barbersTextBox}>
              <Text style={styles.barbersTitle}>Barbers</Text>

              <Text style={styles.barbersSubtitle}>
                Manage your salon team
              </Text>
            </View>
          </View>

          <View style={styles.barbersBottomRow}>
            <View style={styles.avatarStack}>
              <View style={styles.emptyAvatar}>
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={Colors.accent}
                />
              </View>

              <View style={[styles.emptyAvatar, styles.avatarOverlap]}>
                <Ionicons
                  name="person-outline"
                  size={15}
                  color={Colors.accent}
                />
              </View>

              <View style={[styles.emptyAvatar, styles.avatarOverlap]}>
                <Ionicons
                  name="person-add-outline"
                  size={15}
                  color={Colors.accent}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.manageTeamBtn}>
              <Text style={styles.manageTeamText}>Manage team</Text>

              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.accent}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Gallery */}
        <Text style={styles.sectionHeader}>
          CLIENT EXPERIENCE
        </Text>

        <View style={styles.galleryCard}>
          <View style={styles.galleryHeader}>
            <View style={styles.galleryIconBox}>
              <Ionicons
                name="images-outline"
                size={18}
                color={Colors.secondary}
              />
            </View>

            <View style={styles.galleryTextBox}>
              <Text style={styles.galleryTitle}>Gallery</Text>

              <Text style={styles.gallerySubtitle}>
                Show clients your space and your work
              </Text>
            </View>
          </View>

          <View style={styles.galleryThumbnailsRow}>
            {salon.gallery?.length > 0 ? (
              salon.gallery.slice(0, 2).map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.galleryThumbnail}
                />
              ))
            ) : (
              <View style={styles.galleryEmpty}>
                <Ionicons
                  name="image-outline"
                  size={22}
                  color={Colors.textMuted}
                />
                <Text style={styles.galleryEmptyText}>
                  No photos yet
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.addPhotoCard}>
              <Ionicons
                name="add"
                size={22}
                color={Colors.textMuted}
              />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutCard}
          onPress={logout}
          activeOpacity={0.7}
        >
          <View style={styles.logoutIconBox}>
            <Ionicons
              name="exit-outline"
              size={19}
              color={Colors.error}
            />
          </View>

          <View style={styles.logoutTextBox}>
            <Text style={styles.logoutTitle}>Logout</Text>

            <Text style={styles.logoutSubtitle}>
              Sign out from your account
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={Colors.textMuted}
          />
        </TouchableOpacity>

        <Text style={styles.footer}>
          TRIMLY · SALON OWNER EDITION
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundDark,
  },

  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundDark,
  },

  headerIconButton: {
    padding: 6,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: 28,
  },

  coverSection: {
    position: 'relative',
    height: 180,
    backgroundColor: Colors.surfaceDark,
    marginBottom: 44,
  },

  coverImage: {
    width: '100%',
    height: '100%',
  },

  coverPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceDark,
  },

  coverPlaceholderText: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 7,
  },

  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  coverEditButton: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  coverEditText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },

  logoBadgeContainer: {
    position: 'absolute',
    bottom: -36,
    left: 20,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    elevation: 6,
  },

  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },

  logoBadgeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBrandName: {
    color: Colors.accent,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.7,
    lineHeight: 9,
  },

  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  storeInfoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },

  storeInfoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  storeInfoHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },

  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  verifiedTagText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '700',
  },

  infoFieldRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '68%',
  },

  fieldValueText: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    lineHeight: 17,
  },

  fieldEditBtn: {
    marginLeft: 8,
    padding: 3,
  },

  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },

  amenitiesSection: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },

  amenitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },

  amenityChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  amenityChip: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },

  amenityText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  emptyText: {
    fontSize: 11,
    color: Colors.textMuted,
  },

  operatingHoursCard: {
    backgroundColor: Colors.surfaceDark,
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },

  operatingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  operatingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  operatingTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.8,
  },

  editHoursButton: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: Colors.surfaceDarkSecondary,
    borderRadius: 9,
  },

  editHoursText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '600',
  },

  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  daySwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  daySwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginLeft: -5,
    marginRight: -3,
  },

  dayName: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: '500',
  },

  dayTime: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  dayTimeClosed: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  servicesCard: {
    backgroundColor: '#A85A32',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  servicesTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  servicesIconBox: {
    width: 37,
    height: 37,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  servicesTextBox: {
    flex: 1,
  },

  servicesHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  servicesSubHeading: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },

  servicesDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 13,
  },

  servicesBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  manageServicesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },

  manageServicesSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 3,
  },

  barbersCard: {
    backgroundColor: Colors.surfaceDark,
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },

  barbersTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  barbersIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceDarkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  barbersTextBox: {
    flex: 1,
    marginLeft: 11,
  },

  barbersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },

  barbersSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 3,
  },

  barbersBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyAvatar: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: Colors.surfaceDark,
    backgroundColor: Colors.surfaceDarkSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarOverlap: {
    marginLeft: -8,
  },

  manageTeamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  manageTeamText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.9,
    marginBottom: 9,
    marginHorizontal: 18,
  },

  galleryCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  galleryIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  galleryTextBox: {
    marginLeft: 11,
  },

  galleryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  gallerySubtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 3,
  },

  galleryThumbnailsRow: {
    flexDirection: 'row',
    gap: 10,
  },

  galleryThumbnail: {
    width: 88,
    height: 88,
    borderRadius: 12,
  },

  galleryEmpty: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  galleryEmptyText: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 5,
  },

  addPhotoCard: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  addPhotoText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 3,
  },

  logoutCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  logoutIconBox: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  logoutTextBox: {
    flex: 1,
  },

  logoutTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },

  logoutSubtitle: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
  },

  footer: {
    textAlign: 'center',
    fontSize: 9,
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginTop: 25,
    marginBottom: 12,
  },
});

export default OwnerProfileScreen;
