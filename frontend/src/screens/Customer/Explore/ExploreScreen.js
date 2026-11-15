
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import Colors from '../../../constants/Colors';
import salonService from '../../../services/salonService';
import useAuthStore from '../../../store/useAuthStore';

const ExploreScreen = ({ navigation }) => {
  const token = useAuthStore((state) => state.token);

  const [salons, setSalons] = useState([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    err.message ||
    'Something went wrong. Please try again.';

  const handleNearbySalons = async () => {
    try {
      setLoading(true);
      setError('');
      setActiveFilter('nearby');
      setHasSearched(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setSalons([]);
        setError(
          'Location permission is required to find nearby salons. You can search by area instead.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const results = await salonService.getNearbySalons({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 5,
      });

      setSalons(Array.isArray(results) ? results : []);
    } catch (err) {
      setSalons([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSearch = async () => {
    const trimmedArea = area.trim();

    if (!trimmedArea) {
      Alert.alert('Area required', 'Please enter an area to search.');
      return;
    }

    if (!token) {
      setError('Please log in again to search salons by area.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setActiveFilter('area');
      setHasSearched(true);

      const results = await salonService.getSalonsByArea(
        trimmedArea,
        token
      );

      setSalons(Array.isArray(results) ? results : []);
    } catch (err) {
      setSalons([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setArea('');
    setSalons([]);
    setError('');
    setHasSearched(false);
    setActiveFilter('all');
  };

  const renderSalonCard = (salon) => {
    const rating = Number(salon.avgRating) || 0;
    const ratingCount = Number(salon.ratingCount) || 0;

    return (
      <Pressable
  key={salon._id}
  style={styles.salonCard}
  onPress={() =>
    navigation.navigate('SalonDetails', {
      branchId: salon._id,
    })
  }
>
        {/* Salon image placeholder */}
        <View style={styles.salonImage}>
          <View style={styles.imagePlaceholder}>
            <Ionicons
              name="storefront-outline"
              size={34}
              color={Colors.secondary}
            />
            <Text style={styles.imagePlaceholderText}>
              SALON IMAGE
            </Text>
          </View>

          <View style={styles.imageOverlay}>
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
        </View>

        {/* Salon information */}
        <View style={styles.salonCardContent}>
          <View style={styles.salonTitleRow}>
            <View style={styles.salonInfo}>
              <Text style={styles.salonName} numberOfLines={1}>
                {salon.name || 'Unnamed Salon'}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.salonLocation} numberOfLines={1}>
                  {[salon.area, salon.city].filter(Boolean).join(', ')}
                </Text>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={Colors.secondary} />
              <Text style={styles.rating}>
                {rating.toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>
                ({ratingCount})
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardFooter}>
            <View style={styles.addressContainer}>
              <Ionicons
                name="navigate-outline"
                size={14}
                color={Colors.textMuted}
              />
              <Text style={styles.address} numberOfLines={1}>
                {salon.address || 'Address unavailable'}
              </Text>
            </View>

            <View style={styles.viewDetails}>
              <Text style={styles.viewDetailsText}>Details</Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={Colors.secondary}
              />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const resultTitle =
    activeFilter === 'nearby'
      ? 'Nearby salons'
      : activeFilter === 'area'
        ? `Salons in ${area.trim()}`
        : 'Explore salons';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.brand}>TRIMLY.</Text>
              <Text style={styles.headerLocation}>
                YOUR GROOMING DESTINATION
              </Text>
            </View>

            <Pressable style={styles.notificationButton}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color={Colors.primary}
              />
            </Pressable>
          </View>

          <Text style={styles.heading}>
            Find your
            <Text style={styles.headingAccent}> style.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Discover the best grooming experiences around you.
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textMuted}
          />

          <TextInput
  style={styles.searchInput}
  placeholder="Search salons..."
  placeholderTextColor={Colors.textMuted}
  editable={false}
  showSoftInputOnFocus={false}
  onPressIn={() => navigation.navigate('Search')}
/>

          {area.length > 0 && (
            <Pressable onPress={() => setArea('')}>
              <Ionicons
                name="close-circle"
                size={19}
                color={Colors.textMuted}
              />
            </Pressable>
          )}

          <Pressable
            style={styles.searchAction}
            onPress={handleAreaSearch}
            disabled={loading}
          >
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Colors.white}
            />
          </Pressable>
        </View>

        {/* Discovery filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <Pressable
            style={[
              styles.filterChip,
              activeFilter === 'all' && styles.activeFilterChip,
            ]}
            onPress={clearSearch}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}
            >
              All salons
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              activeFilter === 'nearby' && styles.activeFilterChip,
            ]}
            onPress={handleNearbySalons}
            disabled={loading}
          >
            <Ionicons
              name="navigate-outline"
              size={14}
              color={
                activeFilter === 'nearby'
                  ? Colors.white
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'nearby' && styles.activeFilterText,
              ]}
            >
              Nearby
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              activeFilter === 'area' && styles.activeFilterChip,
            ]}
            onPress={handleAreaSearch}
            disabled={loading || !area.trim()}
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={
                activeFilter === 'area'
                  ? Colors.white
                  : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'area' && styles.activeFilterText,
              ]}
            >
              By area
            </Text>
          </Pressable>
        </ScrollView>

        {/* Discovery banner */}
        <View style={styles.discoveryBanner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEyebrow}>
              THE TRIMLY EXPERIENCE
            </Text>
            <Text style={styles.bannerTitle}>
              Your next great
              {'\n'}look starts here.
            </Text>
            <Text style={styles.bannerSubtitle}>
              Find a salon that matches your style.
            </Text>
          </View>

          <View style={styles.bannerIcon}>
            <Ionicons
              name="cut-outline"
              size={37}
              color={Colors.accent}
            />
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>
                DISCOVER
              </Text>
              <Text style={styles.sectionTitle}>
                {resultTitle}
              </Text>
              <Text style={styles.resultsSubtitle}>
                {salons.length > 0
                  ? `${salons.length} salon${salons.length === 1 ? '' : 's'} found`
                  : 'Find your perfect grooming destination'}
              </Text>
            </View>

            {hasSearched && (
              <Pressable
                onPress={
                  activeFilter === 'nearby'
                    ? handleNearbySalons
                    : handleAreaSearch
                }
                disabled={loading}
                style={styles.refreshButton}
              >
                <Ionicons
                  name="refresh-outline"
                  size={19}
                  color={Colors.secondary}
                />
              </Pressable>
            )}
          </View>

          {loading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator
                size="large"
                color={Colors.secondary}
              />
              <Text style={styles.stateText}>
                Finding salons...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.stateContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={30}
                color={Colors.error}
              />
              <Text style={styles.stateTitle}>
                Unable to load salons
              </Text>
              <Text style={styles.stateText}>{error}</Text>
            </View>
          ) : salons.length > 0 ? (
            <View style={styles.salonList}>
              {salons.map(renderSalonCard)}
            </View>
          ) : (
            <View style={styles.stateContainer}>
              <Ionicons
                name="storefront-outline"
                size={34}
                color={Colors.textMuted}
              />

              <Text style={styles.stateTitle}>
                {hasSearched
                  ? 'No salons found'
                  : 'Ready to explore?'}
              </Text>

              <Text style={styles.stateText}>
                {hasSearched
                  ? 'Try searching another area or finding salons nearby.'
                  : 'Search by area or use your location to discover salons.'}
              </Text>

              {!hasSearched && (
                <Pressable
                  style={styles.emptyAction}
                  onPress={handleNearbySalons}
                  disabled={loading}
                >
                  <Text style={styles.emptyActionText}>
                    Find salons nearby
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },
  header: {
    marginBottom: 22,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 27,
  },
  brand: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 3,
  },
  headerLocation: {
    color: Colors.textMuted,
    fontSize: 8,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heading: {
    color: Colors.primary,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  headingAccent: {
    color: Colors.secondary,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  searchContainer: {
    minHeight: 55,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 15,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    paddingVertical: 12,
  },
  searchAction: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    gap: 9,
    paddingVertical: 19,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  activeFilterText: {
    color: Colors.white,
  },
  discoveryBanner: {
    minHeight: 150,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerContent: {
    flex: 1,
  },
  bannerEyebrow: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
  },
  bannerSubtitle: {
    color: '#D5CDC2',
    fontSize: 10,
    marginTop: 8,
  },
  bannerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#665640',
    backgroundColor: '#302A23',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  resultsSection: {
    marginTop: 30,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  sectionEyebrow: {
    color: Colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 5,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 21,
    fontWeight: '800',
  },
  resultsSubtitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  salonList: {
    gap: 16,
  },
  salonCard: {
    backgroundColor: Colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  salonImage: {
    height: 145,
    backgroundColor: '#29251F',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 7,
  },
  imagePlaceholderText: {
    color: '#B5A58E',
    fontSize: 8,
    letterSpacing: 2,
    fontWeight: '700',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
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
  salonCardContent: {
    padding: 15,
  },
  salonTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  salonInfo: {
    flex: 1,
  },
  salonName: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  salonLocation: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  rating: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  ratingCount: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 13,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  addressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  address: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 10,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewDetailsText: {
    color: Colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  stateContainer: {
    minHeight: 190,
    backgroundColor: Colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    gap: 10,
  },
  stateTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  emptyAction: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 5,
  },
  emptyActionText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
});

export default ExploreScreen ;
