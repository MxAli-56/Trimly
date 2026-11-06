
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import useAuthStore from '../../store/useAuthStore';
import Colors from '../../constants/Colors';

// Reusable menu row
const MenuRow = ({
  icon,
  title,
  subtitle,
  iconColor = '#74665A',
  iconBackground = '#F5F2ED',
  rightText,
  danger = false,
  onPress,
}) => (
  <Pressable style={styles.menuRow} onPress={onPress}>
    <View style={[styles.menuIcon, { backgroundColor: iconBackground }]}>
      <Ionicons
        name={icon}
        size={18}
        color={danger ? Colors.error : iconColor}
      />
    </View>

    <View style={styles.menuContent}>
      <Text style={[styles.menuTitle, danger && styles.dangerText]}>
        {title}
      </Text>

      {!!subtitle && (
        <Text style={styles.menuSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>

    {rightText ? (
      <Text style={styles.rightText}>{rightText}</Text>
    ) : null}

    <Ionicons
      name="chevron-forward"
      size={17}
      color={danger ? Colors.error : Colors.textMuted}
    />
  </Pressable>
);

// Reusable section
const MenuSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.menuCard}>{children}</View>
  </View>
);

// Reusable information modal
const ProfileModal = ({ visible, title, message, onClose, icon }) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalIcon}>
          <Ionicons
            name={icon || 'information-circle-outline'}
            size={27}
            color={Colors.accent}
          />
        </View>

        <Text style={styles.modalTitle}>{title}</Text>

        <Text style={styles.modalMessage}>{message}</Text>

        <Pressable
          style={styles.modalButton}
          onPress={onClose}
        >
          <Text style={styles.modalButtonText}>Got it</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const CustomerProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();

  const [activeModal, setActiveModal] = useState(null);

  const name = user?.name || 'Customer';
  const phone = user?.phone || 'Phone number unavailable';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  const modalContent = {
    rewards: {
      title: 'Trimly Rewards',
      message:
        'Your loyalty journey starts here. You will be able to view your earned points and rewards here.',
      icon: 'gift-outline',
    },
    saved: {
      title: 'Saved Salons & Barbers',
      message:
        'Your favourite salons and barbers will be available here. The dedicated favorites section is coming soon.',
      icon: 'heart-outline',
    },
    security: {
      title: 'Account Security',
      message:
        'Your account verification status is displayed on your profile. Password management will be available here.',
      icon: 'shield-checkmark-outline',
    },
    ai: {
      title: 'AI Hairstyle Studio',
      message:
        'Discover hairstyle recommendations tailored to your preferences. This feature is being prepared.',
      icon: 'sparkles-outline',
    },
    payments: {
      title: 'Payment Methods',
      message:
        'Payment methods are not available yet. You will be able to manage your payment options here when payment integration is ready.',
      icon: 'card-outline',
    },
    notifications: {
      title: 'Notifications & Reminders',
      message:
        'Notification preferences and appointment reminders will be managed here once notification settings are implemented.',
      icon: 'notifications-outline',
    },
    terms: {
      title: 'Terms & Policies',
      message:
        'Our privacy policy and booking terms will be available here.',
      icon: 'document-text-outline',
    },
    delete: {
      title: 'Delete Account',
      message:
        'Account deletion is not currently available. Your account and personal data have not been changed.',
      icon: 'trash-outline',
    },
  };

  const openModal = (modal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleLogout = () => {
    setActiveModal('logout');
  };

  const confirmLogout = async () => {
    closeModal();
    await logout();
  };

  const currentModal = modalContent[activeModal];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.brandName}>Trimly</Text>
          <View style={styles.brandDot} />
        </View>

        <Text style={styles.headerTitle}>Profile</Text>

        <Pressable
          style={styles.headerButton}
          onPress={() => openModal('notifications')}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={Colors.primary}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Information */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {user?.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.initials}>{initials}</Text>
              </View>
            )}

            <Pressable
              style={styles.editAvatar}
              onPress={() =>
                navigation.navigate('EditCustomerProfile')
              }
              hitSlop={8}
            >
              <Ionicons
                name="pencil"
                size={13}
                color={Colors.white}
              />
            </Pressable>
          </View>

          <Text style={styles.userName}>{name}</Text>

          <View style={styles.profileMeta}>
            <Text style={styles.phone}>{phone}</Text>

            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={13}
                  color={Colors.textGold}
                />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}
          </View>

          <Text style={styles.profileCaption}>
            Your personal grooming profile
          </Text>
        </View>

        {/* Rewards */}
        <Pressable
          style={styles.rewardsCard}
          onPress={() => openModal('rewards')}
        >
          <View style={styles.orbitalOne} />
          <View style={styles.orbitalTwo} />

          <View style={styles.rewardsHeader}>
            <View style={styles.rewardsHeading}>
              <MaterialCommunityIcons
                name="content-cut"
                size={17}
                color={Colors.accent}
              />
              <Text style={styles.rewardsTitle}>TRIMLY REWARDS</Text>
            </View>

            <View style={styles.comingSoon}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>
          </View>

          <Text style={styles.rewardsMainText}>A little more</Text>

          <Text style={styles.rewardsDescription}>
            Earn rewards every time you visit your favourite salon.
          </Text>

          <View style={styles.rewardsBottom}>
            <Text style={styles.rewardsBottomText}>
              Your loyalty journey starts here.
            </Text>

            <MaterialCommunityIcons
              name="star-four-points"
              size={20}
              color={Colors.accent}
            />
          </View>
        </Pressable>

        {/* AI Hairstyle Studio */}
        <Pressable
          style={styles.aiCard}
          onPress={() => openModal('ai')}
        >
          <View style={styles.aiIcon}>
            <Ionicons
              name="sparkles"
              size={19}
              color={Colors.accent}
            />
          </View>

          <View style={styles.aiContent}>
            <View style={styles.aiTitleRow}>
              <Text style={styles.aiTitle}>AI Hairstyle Studio</Text>
              <Text style={styles.betaTag}>BETA</Text>
            </View>

            <Text style={styles.aiSubtitle}>
              Discover a look that suits you.
            </Text>
          </View>

          <View style={styles.chevronCircle}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.textSecondary}
            />
          </View>
        </Pressable>

        {/* Saved & Engagement */}
        <MenuSection title="SAVED & ENGAGEMENT">
          <MenuRow
            icon="heart"
            title="Saved Salons & Barbers"
            subtitle="Your favourite places will appear here"
            iconColor="#8C6337"
            iconBackground="#F5EFE6"
            onPress={() => openModal('saved')}
          />

          <View style={styles.divider} />

          <MenuRow
            icon="shield-checkmark-outline"
            title="Account Security"
            subtitle={
              user?.isVerified
                ? 'Your account is verified'
                : 'Verification status'
            }
            iconColor="#4B6B59"
            iconBackground="#EDF3EE"
            rightText={user?.isVerified ? 'ACTIVE' : 'PENDING'}
            onPress={() => openModal('security')}
          />
        </MenuSection>

        {/* Preferences */}
        <MenuSection title="PREFERENCES & SETTINGS">
          <MenuRow
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => openModal('payments')}
          />

          <View style={styles.divider} />

          <MenuRow
            icon="notifications-outline"
            title="Notifications & Reminders"
            subtitle="Manage your notification preferences"
            onPress={() => openModal('notifications')}
          />

          <View style={styles.divider} />

          <MenuRow
            icon="document-text-outline"
            title="Terms & Policies"
            subtitle="Privacy and booking terms"
            onPress={() => openModal('terms')}
          />
        </MenuSection>

        {/* Session */}
        <MenuSection title="SESSION & SECURITY">
          <Pressable
            style={styles.menuRow}
            onPress={handleLogout}
          >
            <View style={styles.menuIcon}>
              <Ionicons
                name="log-out-outline"
                size={18}
                color={Colors.textSecondary}
              />
            </View>

            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                Sign Out of Account
              </Text>

              <Text style={styles.menuSubtitle}>
                Sign out from this device
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={Colors.textMuted}
            />
          </Pressable>

          <View style={styles.divider} />

          <MenuRow
            icon="trash-outline"
            title="Delete Account & Personal Data"
            subtitle="Permanently remove your account"
            danger
            iconBackground="#FDECEC"
            onPress={() => openModal('delete')}
          />
        </MenuSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            Trimly Concierge
          </Text>

          <Text style={styles.footerCaption}>
            Crafted for refined grooming
          </Text>
        </View>
      </ScrollView>

      {/* Information Modal */}
      <ProfileModal
        visible={!!currentModal}
        title={currentModal?.title}
        message={currentModal?.message}
        icon={currentModal?.icon}
        onClose={closeModal}
      />

      {/* Logout Confirmation */}
      <Modal
        visible={activeModal === 'logout'}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons
                name="log-out-outline"
                size={27}
                color={Colors.accent}
              />
            </View>

            <Text style={styles.modalTitle}>
              Sign Out
            </Text>

            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your Trimly account?
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={confirmLogout}
            >
              <Text style={styles.modalButtonText}>
                Sign Out
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={closeModal}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandName: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
  },

  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
    marginLeft: 5,
    marginTop: 9,
  },

  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },

  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 35,
  },

  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },

  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 23,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'serif',
  },

  editAvatar: {
    position: 'absolute',
    right: -5,
    bottom: -4,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  userName: {
    fontSize: 25,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
    marginBottom: 7,
  },

  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  phone: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  verifiedText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.textGold,
  },

  profileCaption: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 7,
  },

  rewardsCard: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 20,
    padding: 19,
    marginBottom: 16,
    overflow: 'hidden',
  },

  orbitalOne: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    borderWidth: 1,
    borderColor: 'rgba(229,184,117,0.10)',
    top: -100,
    right: -65,
  },

  orbitalTwo: {
    position: 'absolute',
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: 'rgba(229,184,117,0.06)',
    top: -135,
    right: -105,
  },

  rewardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  rewardsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  rewardsTitle: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  comingSoon: {
    backgroundColor: Colors.surfaceDarkSecondary,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  comingSoonText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  rewardsMainText: {
    fontSize: 25,
    fontFamily: 'serif',
    color: Colors.textLight,
    marginBottom: 5,
  },

  rewardsDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: Colors.textMuted,
    maxWidth: '85%',
  },

  rewardsBottom: {
    marginTop: 19,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: Colors.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rewardsBottomText: {
    fontSize: 11,
    color: Colors.accent,
  },

  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF7F0',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },

  aiIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  aiContent: {
    flex: 1,
  },

  aiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },

  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  betaTag: {
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
    color: Colors.white,
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  aiSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  chevronCircle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  section: {
    marginBottom: 21,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginBottom: 9,
  },

  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  menuRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  menuIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  menuContent: {
    flex: 1,
    marginRight: 8,
  },

  menuTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },

  menuSubtitle: {
    fontSize: 10.5,
    color: Colors.textSecondary,
  },

  rightText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
    marginRight: 8,
  },

  dangerText: {
    color: Colors.error,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.background,
    marginLeft: 49,
  },

  footer: {
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 15,
  },

  footerBrand: {
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontSize: 14,
    color: Colors.textGold,
    marginBottom: 5,
  },

  footerCaption: {
    fontSize: 10,
    color: Colors.textMuted,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },

  modalIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: 13,
    lineHeight: 21,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 22,
  },

  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },

  cancelButton: {
    paddingVertical: 13,
  },

  cancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

export default CustomerProfileScreen;
