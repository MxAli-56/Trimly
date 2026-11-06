import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';

export default function SalonOwnerProfile({ navigation }) {
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState([
    { day: 'Tuesday', time: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Wednesday', time: '9:00 AM – 7:00 PM', isOpen: true },
    { day: 'Thursday', time: '10:00 AM – 8:00 PM', isOpen: true },
    { day: 'Friday', time: '10:00 AM – 8:00 PM', isOpen: true },
    { day: 'Saturday', time: '9:00 AM – 5:00 PM', isOpen: true },
    { day: 'Sunday', time: 'Closed', isOpen: false },
  ]);

  const toggleDay = (index) => {
    setOperatingHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isOpen: !updated[index].isOpen };
      return updated;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          activeOpacity={0.7}
          accessibilityLabel="Open Menu"
        >
          <Ionicons name="menu-outline" size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Store & Profile</Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Photo & Brand Logo Section */}
        <View style={styles.coverSection}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop',
            }}
            style={styles.coverImage}
          />
          <View style={styles.coverOverlay} />

          {/* Change Cover Button */}
          <TouchableOpacity
            style={styles.coverEditButton}
            activeOpacity={0.8}
            accessibilityLabel="Change Cover Photo"
          >
            <Ionicons name="camera" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.coverEditText}>Cover</Text>
          </TouchableOpacity>

          {/* Overlapping Brand Logo Emblem */}
          <View style={styles.logoBadgeContainer}>
            <View style={styles.logoBadgeInner}>
              <MaterialCommunityIcons name="content-cut" size={20} color="#E5C583" />
              <Text style={styles.logoBrandName}>THE</Text>
              <Text style={styles.logoBrandName}>GROOMING</Text>
              <Text style={styles.logoBrandName}>HOUSE</Text>
            </View>

            {/* Edit Logo Pencil */}
            <TouchableOpacity
              style={styles.logoEditBadge}
              activeOpacity={0.85}
              accessibilityLabel="Edit Store Logo"
            >
              <Ionicons name="pencil" size={11} color="#1C1917" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Information White Card */}
        <View style={styles.storeInfoCard}>
          <View style={styles.storeInfoHeaderRow}>
            <Text style={styles.storeInfoHeading}>Store Information</Text>
            <View style={styles.verifiedTag}>
              <Text style={styles.verifiedTagText}>Verified</Text>
            </View>
          </View>

          {/* Field: Store Name */}
          <View style={styles.infoFieldRow}>
            <Text style={styles.fieldLabel}>Store Name</Text>
            <View style={styles.fieldValueContainer}>
              <Text style={styles.fieldValueBold}>The Grooming House</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.fieldEditBtn}>
                <Ionicons name="pencil" size={13} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Field: Address */}
          <View style={styles.infoFieldRow}>
            <Text style={styles.fieldLabel}>Address</Text>
            <View style={styles.fieldValueContainer}>
              <Text style={[styles.fieldValueText, { flex: 1, textAlign: 'right' }]}>
                Shop 4, Bukhari Commercial,{'\n'}DHA Phase 6, Karachi, Pakistan
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.fieldEditBtn}>
                <Ionicons name="pencil" size={13} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Field: Phone Number */}
          <View style={styles.infoFieldRow}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.fieldValueContainer}>
              <Text style={styles.fieldValueBold}>+92 300 1234567</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.fieldEditBtn}>
                <Ionicons name="pencil" size={13} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Field: Category */}
          <View style={styles.infoFieldRow}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillIcon}>👑</Text>
              <Text style={styles.categoryPillText}>Men's Grooming</Text>
            </View>
          </View>

          {/* Field: Amenities */}
          <View style={styles.amenitiesSection}>
            <View style={styles.amenitiesHeader}>
              <Text style={styles.fieldLabel}>Amenities</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="pencil" size={13} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.amenityChipsRow}>
              <View style={[styles.amenityChip, { backgroundColor: '#E0F7FA' }]}>
                <Text style={[styles.amenityText, { color: '#00838F' }]}>❄️ AC</Text>
              </View>
              <View style={[styles.amenityChip, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.amenityText, { color: '#2E7D32' }]}>📶 High-speed Wi-Fi</Text>
              </View>
              <View style={[styles.amenityChip, { backgroundColor: '#EDE7F6' }]}>
                <Text style={[styles.amenityText, { color: '#5E35B1' }]}>🅿️ Dedicated Parking</Text>
              </View>
            </View>
          </View>

          {/* Field: Opening Hours */}
          <View style={[styles.infoFieldRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Opening Hours</Text>
            <View style={styles.fieldValueContainer}>
              <Text style={styles.fieldValueBold}>10:00 AM – 10:00 PM</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.fieldEditBtn}>
                <Ionicons name="pencil" size={13} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Operating Hours Dark Card */}
        <View style={styles.operatingHoursCard}>
          <View style={styles.operatingHoursHeader}>
            <View style={styles.operatingHeaderLeft}>
              <Ionicons name="time-outline" size={16} color="#E5C583" style={{ marginRight: 6 }} />
              <Text style={styles.operatingTitle}>OPERATING HOURS</Text>
            </View>
            <View style={styles.openTodayBadge}>
              <Text style={styles.openTodayText}>OPEN TODAY</Text>
            </View>
          </View>

          {operatingHours.map((item, index) => (
            <View key={item.day} style={styles.dayRow}>
              <View style={styles.daySwitchContainer}>
                <Switch
                  value={item.isOpen}
                  onValueChange={() => toggleDay(index)}
                  trackColor={{ false: '#374151', true: '#F59E0B' }}
                  thumbColor="#FFFFFF"
                  style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                />
                <Text style={styles.dayName}>{item.day}</Text>
              </View>

              <Text style={[styles.dayTime, !item.isOpen && styles.dayTimeClosed]}>
                {item.time}
              </Text>
            </View>
          ))}
        </View>

        {/* Services & Pricing Terracotta Card */}
        <TouchableOpacity style={styles.servicesCard} activeOpacity={0.88}>
          <View style={styles.servicesTopRow}>
            <View style={styles.servicesIconBox}>
              <MaterialCommunityIcons name="content-cut" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.servicesTextBox}>
              <Text style={styles.servicesHeading}>Services & pricing</Text>
              <Text style={styles.servicesSubHeading}>6 services currently bookable</Text>
            </View>
          </View>

          <View style={styles.servicesDivider} />

          <View style={styles.servicesBottomRow}>
            <View>
              <Text style={styles.manageServicesTitle}>Manage services</Text>
              <Text style={styles.manageServicesSubtitle}>
                Haircuts, beard care, packages and pricing
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FCE7D6" />
          </View>
        </TouchableOpacity>

        {/* Barbers Team Card */}
        <View style={styles.barbersCard}>
          <View style={styles.barbersTopRow}>
            <View style={styles.barbersIconBox}>
              <FontAwesome5 name="user-friends" size={14} color="#E5C583" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.barbersTitle}>Barbers</Text>
              <Text style={styles.barbersSubtitle}>4 professionals on your team</Text>
            </View>
          </View>

          <View style={styles.barbersBottomRow}>
            {/* Avatar Stack */}
            <View style={styles.avatarStack}>
              <View style={[styles.avatarCircle, { backgroundColor: '#374151' }]}>
                <Text style={styles.avatarInitials}>JM</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#92400E', marginLeft: -8 }]}>
                <Text style={styles.avatarInitials}>AR</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#1F2937', marginLeft: -8 }]}>
                <Text style={styles.avatarInitials}>DK</Text>
              </View>
              <View style={[styles.avatarCircle, { backgroundColor: '#111827', marginLeft: -8 }]}>
                <Text style={styles.avatarInitials}>+1</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.manageTeamBtn} activeOpacity={0.7}>
              <Text style={styles.manageTeamText}>Manage team</Text>
              <Ionicons name="chevron-forward" size={14} color="#E5C583" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Client Experience / Gallery Section */}
        <Text style={styles.sectionHeader}>CLIENT EXPERIENCE</Text>
        <View style={styles.galleryCard}>
          <View style={styles.galleryHeader}>
            <View style={styles.galleryIconBox}>
              <Ionicons name="images-outline" size={17} color="#D97706" />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.galleryTitle}>Gallery</Text>
              <Text style={styles.gallerySubtitle}>Show clients your space and your work</Text>
            </View>
          </View>

          <View style={styles.galleryThumbnailsRow}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=500&auto=format&fit=crop',
              }}
              style={styles.galleryThumbnail}
            />
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=500&auto=format&fit=crop',
              }}
              style={styles.galleryThumbnail}
            />
            <TouchableOpacity style={styles.addPhotoCard} activeOpacity={0.75}>
              <Ionicons name="add" size={20} color="#9CA3AF" />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Card */}
        <TouchableOpacity style={styles.logoutCard} activeOpacity={0.7}>
          <View style={styles.logoutIconBox}>
            <Ionicons name="exit-outline" size={18} color="#EF4444" />
          </View>
          <View style={styles.logoutTextBox}>
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutSubtitle}>Sign out from your account</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('HUB')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid-outline"
            size={22}
            color={activeTab === 'HUB' ? '#E5C583' : '#6B7280'}
          />
          <Text style={[styles.navLabel, activeTab === 'HUB' && styles.navLabelActive]}>
            Hub
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('STAFF')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="people-outline"
            size={23}
            color={activeTab === 'STAFF' ? '#E5C583' : '#6B7280'}
          />
          <Text style={[styles.navLabel, activeTab === 'STAFF' && styles.navLabelActive]}>
            Staff
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('PROFILE')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="home"
            size={21}
            color={activeTab === 'PROFILE' ? '#E5C583' : '#6B7280'}
          />
          <Text style={[styles.navLabel, activeTab === 'PROFILE' && styles.navLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#141414',
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#161616',
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    paddingBottom: 28,
  },
  coverSection: {
    position: 'relative',
    height: 180,
    backgroundColor: '#1C1917',
    marginBottom: 44,
  },
  coverImage: {
    width: '100%',
    height: '100%',
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
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  coverEditText: {
    color: '#FFFFFF',
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
    backgroundColor: '#141414',
    borderWidth: 2,
    borderColor: '#C5A059',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 6,
  },
  logoBadgeInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBrandName: {
    color: '#E5C583',
    fontSize: 6.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    lineHeight: 8,
  },
  logoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
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
    color: '#111827',
  },
  verifiedTag: {
    backgroundColor: '#E6F8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedTagText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '700',
  },
  infoFieldRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12.5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  fieldValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '68%',
  },
  fieldValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F2937',
  },
  fieldValueText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  fieldEditBtn: {
    marginLeft: 6,
    padding: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryPillIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  amenitiesSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  amenitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  operatingHoursCard: {
    backgroundColor: '#1C1917',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  operatingHoursHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  operatingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatingTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  openTodayBadge: {
    backgroundColor: '#352E28',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#4A4037',
  },
  openTodayText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E5C583',
    letterSpacing: 0.4,
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
  dayName: {
    fontSize: 12.5,
    color: '#E5E7EB',
    fontWeight: '500',
    marginLeft: 6,
  },
  dayTime: {
    fontSize: 11.5,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dayTimeClosed: {
    color: '#6B7280',
    fontStyle: 'italic',
  },
  servicesCard: {
    backgroundColor: '#A85A32',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#A85A32',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  servicesTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicesIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  servicesTextBox: {
    flex: 1,
  },
  servicesHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  servicesSubHeading: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 1,
  },
  servicesDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  servicesBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageServicesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  manageServicesSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  barbersCard: {
    backgroundColor: '#1C1917',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  barbersTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barbersIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#2E2722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barbersTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  barbersSubtitle: {
    fontSize: 11.5,
    color: '#9CA3AF',
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
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  manageTeamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageTeamText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E5C583',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginHorizontal: 18,
  },
  galleryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
  },
  gallerySubtitle: {
    fontSize: 11,
    color: '#6B7280',
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
  addPhotoCard: {
    width: 88,
    height: 88,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 10,
  },
  logoutIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoutTextBox: {
    flex: 1,
  },
  logoutTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  logoutSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bottomNav: {
    height: 58,
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#E5C583',
    fontWeight: '700',
  },
});