
import React, { useEffect, useMemo, useState } from 'react';
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
import salonService from '../../../services/salonService';
import useAuthStore from '../../../store/useAuthStore';

const SalonDetailsScreen = ({ navigation, route }) => {
  const { branchId } = route.params;
  const token = useAuthStore((state) => state.token);

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  if (!token || !branchId) return;
    let isMounted = true;

    const fetchSalonData = async () => {
      try {
        setLoading(true);
        setError('');

        const [salonData, serviceData] = await Promise.all([
  salonService.getSalonDetails(branchId, token),
  salonService.getSalonServices(branchId, token),
]);
        if (!isMounted) return;

        setSalon(salonData);
        setServices(Array.isArray(serviceData) ? serviceData : []);
      } catch (err) {
        if (!isMounted) return;

        setError(
          err.response?.data?.message ||
          err.message ||
          'Unable to load salon details.'
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSalonData();

    return () => {
      isMounted = false;
    };
  }, [branchId, token]);

  const groupedServices = useMemo(() => {
    return services.reduce((groups, service) => {
      const category =
        service.categoryId?.name || 'Other services';

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(service);
      return groups;
    }, {});
  }, [services]);

  const selectedTotal = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      return total + (Number(service.price) || 0);
    }, 0);
  }, [selectedServices]);

  const selectedDuration = useMemo(() => {
    return selectedServices.reduce((total, service) => {
      return total + (Number(service.durationMinutes) || 0);
    }, 0);
  }, [selectedServices]);

  const toggleService = (service) => {
    setSelectedServices((current) => {
      const alreadySelected = current.some(
        (item) => item._id === service._id
      );

      if (alreadySelected) {
        return current.filter((item) => item._id !== service._id);
      }

      return [...current, service];
    });
  };

  const handleContinue = () => {
  if (selectedServices.length === 0) {
    Alert.alert(
      'Select a service',
      'Please select at least one service to continue.'
    );
    return;
  }

  navigation.navigate('BookingDetails', {
    branchId,
    salon,
    selectedServices,
    totalAmount: selectedTotal,
    totalDuration: selectedDuration,
  });
};
  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={Colors.secondary} />
        <Text style={styles.stateText}>Loading salon details...</Text>
      </View>
    );
  }

  if (error || !salon) {
    return (
      <View style={styles.centerState}>
        <Ionicons
          name="alert-circle-outline"
          size={36}
          color={Colors.error}
        />
        <Text style={styles.stateTitle}>Unable to load salon</Text>
        <Text style={styles.stateText}>
          {error || 'Salon information is unavailable.'}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const rating = Number(salon.avgRating) || 0;
  const ratingCount = Number(salon.ratingCount) || 0;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.hero}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={Colors.primary}
            />
          </Pressable>

          <View style={styles.heroPlaceholder}>
            <Ionicons
              name="storefront-outline"
              size={48}
              color={Colors.accent}
            />
            <Text style={styles.heroPlaceholderText}>
              SALON PHOTOGRAPHY
            </Text>
          </View>

          <View style={styles.heroLabel}>
            <Text style={styles.heroLabelText}>TRIMLY DISCOVERY</Text>
          </View>
        </View>

        <View style={styles.salonInfo}>
          <View style={styles.nameRow}>
            <View style={styles.nameContainer}>
              <Text style={styles.salonName}>{salon.name}</Text>
              <Text style={styles.salonLocation}>
                {[salon.area, salon.city].filter(Boolean).join(', ')}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                salon.isOpen ? styles.openBadge : styles.closedBadge,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  salon.isOpen ? styles.openDot : styles.closedDot,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  salon.isOpen ? styles.openText : styles.closedText,
                ]}
              >
                {salon.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={15} color={Colors.secondary} />
              <Text style={styles.metaText}>
                {rating.toFixed(1)} ({ratingCount} reviews)
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Ionicons
                name="location-outline"
                size={15}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {salon.address || 'Address unavailable'}
              </Text>
            </View>
          </View>

          {salon.description ? (
            <Text style={styles.description}>
              {salon.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.servicesSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>THE MENU</Text>
              <Text style={styles.sectionTitle}>Select your services</Text>
              <Text style={styles.sectionSubtitle}>
                Choose one or more services for your visit.
              </Text>
            </View>

            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>
                {selectedServices.length} selected
              </Text>
            </View>
          </View>

          {services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Ionicons
                name="cut-outline"
                size={30}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyTitle}>
                No services available
              </Text>
              <Text style={styles.emptyText}>
                This salon hasn't listed any active services yet.
              </Text>
            </View>
          ) : (
            Object.entries(groupedServices).map(([category, items]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>{category}</Text>

                {items.map((service) => {
                  const isSelected = selectedServices.some(
                    (item) => item._id === service._id
                  );

                  return (
                    <Pressable
                      key={service._id}
                      style={[
                        styles.serviceCard,
                        isSelected && styles.selectedServiceCard,
                      ]}
                      onPress={() => toggleService(service)}
                    >
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>
                          {service.name}
                        </Text>

                        {service.description ? (
                          <Text style={styles.serviceDescription}>
                            {service.description}
                          </Text>
                        ) : null}

                        <View style={styles.durationRow}>
                          <Ionicons
                            name="time-outline"
                            size={13}
                            color={Colors.textMuted}
                          />
                          <Text style={styles.durationText}>
                            {service.durationMinutes || 0} min
                          </Text>
                        </View>
                      </View>

                      <View style={styles.serviceRight}>
                        <Text style={styles.servicePrice}>
                          Rs. {Number(service.price || 0).toLocaleString()}
                        </Text>

                        <View
                          style={[
                            styles.selectionCircle,
                            isSelected && styles.selectionCircleActive,
                          ]}
                        >
                          {isSelected && (
                            <Ionicons
                              name="checkmark"
                              size={14}
                              color={Colors.white}
                            />
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>ESTIMATED TOTAL</Text>
          <Text style={styles.totalPrice}>
            Rs. {selectedTotal.toLocaleString()}
          </Text>
          <Text style={styles.totalDuration}>
            {selectedDuration} minutes · {selectedServices.length} services
          </Text>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            selectedServices.length === 0 && styles.continueButtonDisabled,
          ]}
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
  scrollContent: {
    paddingBottom: 125,
  },
  hero: {
    height: 245,
    backgroundColor: Colors.primary,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  heroPlaceholderText: {
    color: '#C5B69F',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '700',
  },
  heroLabel: {
    position: 'absolute',
    bottom: 15,
    right: 18,
    backgroundColor: '#393128',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  heroLabelText: {
    color: Colors.accent,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  salonInfo: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  nameContainer: {
    flex: 1,
  },
  salonName: {
    color: Colors.primary,
    fontSize: 25,
    fontWeight: '800',
  },
  salonLocation: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  openBadge: {
    backgroundColor: '#E7F0E7',
  },
  closedBadge: {
    backgroundColor: '#F3E7E4',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  openDot: {
    backgroundColor: '#39734D',
  },
  closedDot: {
    backgroundColor: '#A34D43',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  openText: {
    color: '#39734D',
  },
  closedText: {
    color: '#A34D43',
  },
  metaRow: {
    gap: 10,
    marginTop: 17,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: Colors.textSecondary,
    fontSize: 11,
    flexShrink: 1,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  servicesSection: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  sectionEyebrow: {
    color: Colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 5,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 5,
  },
  selectionCount: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  selectionCountText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: '700',
  },
  categorySection: {
    marginBottom: 23,
  },
  categoryTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedServiceCard: {
    borderColor: Colors.secondary,
    backgroundColor: '#FBF7F0',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  serviceDescription: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  durationText: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  serviceRight: {
    alignItems: 'flex-end',
    gap: 12,
  },
  servicePrice: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  selectionCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCircleActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  emptyServices: {
    alignItems: 'center',
    padding: 25,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    gap: 9,
  },
  emptyTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    color: Colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  totalPrice: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 3,
  },
  totalDuration: {
    color: Colors.textSecondary,
    fontSize: 9,
    marginTop: 3,
  },
  continueButton: {
    minHeight: 48,
    paddingHorizontal: 19,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },
  stateTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});

export default SalonDetailsScreen;
