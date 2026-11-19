
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import * as MapLibreGL from '@maplibre/maplibre-react-native';
//import MapLibreGL from '@maplibre/maplibre-react-native';
import { Map } from '@maplibre/maplibre-react-native';

import Colors from '../../../constants/Colors';
import salonService from '../../../services/salonService';
import useAuthStore from '../../../store/useAuthStore';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

// Karachi is the default map viewport because it is the backend's default city.
// This is only the initial camera position, never a salon marker.
const DEFAULT_COORDINATE = [67.0011, 24.8607];

const ExploreScreen = ({ navigation }) => {
  const token = useAuthStore((state) => state.token);
  const cameraRef = useRef(null);

  const [salons, setSalons] = useState([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('nearby');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    err.message ||
    'Something went wrong. Please try again.';

  const fetchAllSalonsData = useCallback(async () => {
    if (!token) {
      throw new Error('Please log in again to discover salons.');
    }

    const results = await salonService.getSalons(token);
    return Array.isArray(results) ? results : [];
  }, [token]);

  const fetchAllSalons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setActiveFilter('all');
      setHasSearched(true);

      const results = await fetchAllSalonsData();
      setSalons(results);
      setSelectedSalonId(null);
    } catch (err) {
      setSalons([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAllSalonsData]);

  const handleNearbySalons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setActiveFilter('nearby');
      setHasSearched(true);

      if (!token) {
        throw new Error('Please log in again to discover salons.');
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setUserLocation(null);

        const allSalons = await fetchAllSalonsData();
        setSalons(allSalons);
        setActiveFilter('all');
        setSelectedSalonId(null);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coordinates = [
        location.coords.longitude,
        location.coords.latitude,
      ];

      setUserLocation(coordinates);

      const results = await salonService.getNearbySalons({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 5,
      });

      if (Array.isArray(results) && results.length > 0) {
        setSalons(results);
      } else {
        const allSalons = await fetchAllSalonsData();
        setSalons(allSalons);
        setActiveFilter('all');
      }

      setSelectedSalonId(null);
    } catch (err) {
      try {
        const allSalons = await fetchAllSalonsData();
        setSalons(allSalons);
        setActiveFilter('all');
        setSelectedSalonId(null);
        setError('');
      } catch (fallbackError) {
        setSalons([]);
        setError(getErrorMessage(fallbackError));
      }
    } finally {
      setLoading(false);
    }
  }, [token, fetchAllSalonsData]);

  useEffect(() => {
    handleNearbySalons();
  }, [handleNearbySalons]);

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
      setSelectedSalonId(null);
    } catch (err) {
      setSalons([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setArea('');
    fetchAllSalons();
  };

  const openSalonDetails = (salon) => {
    if (!salon?._id) return;

    navigation.navigate('SalonDetails', {
      branchId: salon._id,
    });
  };

  // Only use the confirmed GeoJSON schema from the Branch model.
  // GeoJSON coordinates are [longitude, latitude].
  const getSalonCoordinates = (salon) => {
    const coordinates = salon?.location?.coordinates;

    if (
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      return null;
    }

    const [longitude, latitude] = coordinates;

    if (
      typeof longitude !== 'number' ||
      typeof latitude !== 'number' ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      return null;
    }

    return coordinates;
  };

  const salonsWithCoordinates = useMemo(
    () =>
      salons.filter((salon) => getSalonCoordinates(salon) !== null),
    [salons]
  );

  const mapFeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: salonsWithCoordinates.map((salon) => ({
        type: 'Feature',
        id: salon._id,
        properties: {
          id: salon._id,
          name: salon.name || 'Salon',
        },
        geometry: {
          type: 'Point',
          coordinates: getSalonCoordinates(salon),
        },
      })),
    }),
    [salonsWithCoordinates]
  );

  const selectedSalon = salons.find(
    (salon) => salon._id === selectedSalonId
  );

  const selectSalon = (salon) => {
    setSelectedSalonId(salon._id);

    const coordinates = getSalonCoordinates(salon);

    if (coordinates && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 15,
        animationDuration: 600,
      });
    }
  };

  const handleMarkerPress = (event) => {
    const feature = event?.features?.[0];
    const salonId = feature?.properties?.id;

    if (!salonId) return;

    const salon = salons.find((item) => item._id === salonId);

    if (salon) {
      selectSalon(salon);
    }
  };

  const centerOnUser = async () => {
    try {
      let coordinates = userLocation;

      if (!coordinates) {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert(
            'Location permission',
            'Allow location access to center the map on your position.'
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        coordinates = [
          location.coords.longitude,
          location.coords.latitude,
        ];

        setUserLocation(coordinates);
      }

      cameraRef.current?.setCamera({
        centerCoordinate: coordinates,
        zoomLevel: 14,
        animationDuration: 700,
      });
    } catch (err) {
      Alert.alert('Location unavailable', getErrorMessage(err));
    }
  };

  const resultTitle =
    activeFilter === 'nearby'
      ? 'Nearby salons'
      : activeFilter === 'area'
        ? `Salons in ${area.trim()}`
        : 'All salons';

  return (
    <View style={styles.container}>
     {/* Interactive map */}
<MapLibreGL.Map
  style={StyleSheet.absoluteFill}
  mapStyle={MAP_STYLE}
  logoEnabled={false}
  attributionEnabled
  compassEnabled={false}
  onDidFinishLoadingMap={() => setMapReady(true)}
>
  <MapLibreGL.Camera
  ref={cameraRef}
  initialViewState={{
    center: DEFAULT_COORDINATE,
    zoom: 14,
  }}
  trackUserLocation="default"
/>

  <MapLibreGL.UserLocation
    visible
    animated
    showsUserHeadingIndicator
  />

  {mapFeatureCollection.features.length > 0 && (
    <MapLibreGL.GeoJSONSource
      id="salonMarkers"
      data={mapFeatureCollection}
      onPress={handleMarkerPress}
    >
      <MapLibreGL.CircleLayer
        id="salonMarkerCircles"
        style={{
          circleRadius: [
            'case',
            ['==', ['get', 'id'], selectedSalonId || ''],
            12,
            9,
          ],
          circleColor: [
            'case',
            ['==', ['get', 'id'], selectedSalonId || ''],
            '#C49352',
            '#1C1815',
          ],
          circleStrokeWidth: 3,
          circleStrokeColor: '#FFFFFF',
        }}
      />

      <MapLibreGL.SymbolLayer
        id="salonMarkerLabels"
        style={{
          textField: ['get', 'name'],
          textSize: 11,
          textColor: '#1C1815',
          textHaloColor: '#FFFFFF',
          textHaloWidth: 2,
          textOffset: [0, 1.7],
          textAllowOverlap: false,
        }}
      />
    </MapLibreGL.GeoJSONSource>
  )}
</MapLibreGL.Map>
      {/* Top search interface */}
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>TRIMLY.</Text>
            <Text style={styles.brandSubtitle}>
              FIND YOUR STYLE
            </Text>
          </View>

          <Pressable
            style={styles.iconButton}
            onPress={centerOnUser}
          >
            <Ionicons
              name="locate-outline"
              size={21}
              color={Colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Colors.textMuted}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search salons by area..."
            placeholderTextColor={Colors.textMuted}
            value={area}
            onChangeText={setArea}
            onSubmitEditing={handleAreaSearch}
            returnKeyType="search"
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
            disabled={loading}
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
      </View>

      {/* Floating map controls */}
      <View style={styles.mapControls}>
        <Pressable
          style={styles.mapControlButton}
          onPress={() => {
            cameraRef.current?.setCamera({
              zoomLevel: 15,
              animationDuration: 400,
            });
          }}
        >
          <Ionicons
            name="add"
            size={23}
            color={Colors.primary}
          />
        </Pressable>

        <View style={styles.controlDivider} />

        <Pressable
          style={styles.mapControlButton}
          onPress={() => {
            cameraRef.current?.setCamera({
              zoomLevel: 11,
              animationDuration: 400,
            });
          }}
        >
          <Ionicons
            name="remove"
            size={23}
            color={Colors.primary}
          />
        </Pressable>
      </View>

      {/* Bottom discovery panel */}
      <View style={styles.bottomPanel}>
        <View style={styles.panelHandle} />

        <View style={styles.panelHeader}>
          <View style={styles.panelHeadingContainer}>
            <Text style={styles.panelEyebrow}>DISCOVER YOUR NEXT LOOK</Text>
            <Text style={styles.panelTitle}>{resultTitle}</Text>
            <Text style={styles.panelSubtitle}>
              {loading
                ? 'Finding grooming destinations...'
                : `${salons.length} salon${salons.length === 1 ? '' : 's'} found`}
            </Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={
              activeFilter === 'nearby'
                ? handleNearbySalons
                : activeFilter === 'area'
                  ? handleAreaSearch
                  : fetchAllSalons
            }
            disabled={loading}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color={Colors.secondary}
            />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="small"
              color={Colors.secondary}
            />
            <Text style={styles.stateText}>Finding salons...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color={Colors.error}
            />
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : salons.length === 0 ? (
          <View style={styles.stateContainer}>
            <Ionicons
              name="storefront-outline"
              size={27}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No salons found</Text>
            <Text style={styles.stateText}>
              Try another area or search nearby salons.
            </Text>
          </View>
        ) : (
          <>
            {salonsWithCoordinates.length === 0 && (
              <View style={styles.coordinateNotice}>
                <Ionicons
                  name="information-circle-outline"
                  size={15}
                  color={Colors.secondary}
                />
                <Text style={styles.coordinateNoticeText}>
                  Salon map locations will appear when coordinates are available.
                </Text>
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.salonCards}
            >
              {salons.map((salon) => {
                const isSelected = salon._id === selectedSalonId;
                const rating = Number(salon.avgRating) || 0;
                const ratingCount = Number(salon.ratingCount) || 0;
                const hasCoordinates =
                  getSalonCoordinates(salon) !== null;

                return (
                  <Pressable
                    key={salon._id}
                    style={[
                      styles.salonCard,
                      isSelected && styles.selectedSalonCard,
                    ]}
                    onPress={() => selectSalon(salon)}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.cardIcon}>
                        <Ionicons
                          name="storefront-outline"
                          size={23}
                          color={Colors.accent}
                        />
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          salon.isOpen
                            ? styles.openBadge
                            : styles.closedBadge,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            salon.isOpen
                              ? styles.openDot
                              : styles.closedDot,
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            salon.isOpen
                              ? styles.openText
                              : styles.closedText,
                          ]}
                        >
                          {salon.isOpen ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={styles.salonName}
                      numberOfLines={1}
                    >
                      {salon.name || 'Unnamed Salon'}
                    </Text>

                    <View style={styles.locationRow}>
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color={Colors.textMuted}
                      />
                      <Text
                        style={styles.salonLocation}
                        numberOfLines={1}
                      >
                        {[salon.area, salon.city]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>

                    <View style={styles.cardBottomRow}>
                      <View style={styles.ratingContainer}>
                        <Ionicons
                          name="star"
                          size={13}
                          color={Colors.secondary}
                        />
                        <Text style={styles.rating}>
                          {rating.toFixed(1)}
                        </Text>
                        <Text style={styles.ratingCount}>
                          ({ratingCount})
                        </Text>
                      </View>

                      <View style={styles.mapAvailability}>
                        <Ionicons
                          name={
                            hasCoordinates
                              ? 'location'
                              : 'location-outline'
                          }
                          size={13}
                          color={
                            hasCoordinates
                              ? Colors.secondary
                              : Colors.textMuted
                          }
                        />
                        <Text style={styles.mapAvailabilityText}>
                          {hasCoordinates ? 'On map' : 'Location pending'}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.detailsButton}
                      onPress={() => openSalonDetails(salon)}
                    >
                      <Text style={styles.detailsButtonText}>
                        View salon
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={Colors.white}
                      />
                    </Pressable>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>

      {!mapReady && (
        <View style={styles.mapLoading}>
          <ActivityIndicator
            size="small"
            color={Colors.secondary}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAE6DF',
  },

  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 55,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 17,
  },
  brandContainer: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 13,
    elevation: 4,
  },
  brand: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  brandSubtitle: {
    color: Colors.textMuted,
    fontSize: 7,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },

  searchContainer: {
    minHeight: 54,
    backgroundColor: Colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 15,
    paddingRight: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 13,
    paddingVertical: 12,
  },
  searchAction: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filters: {
    gap: 8,
    paddingTop: 13,
    paddingBottom: 5,
  },
  filterChip: {
    minHeight: 35,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    elevation: 3,
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

  mapControls: {
    position: 'absolute',
    right: 17,
    bottom: 285,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    elevation: 5,
    overflow: 'hidden',
  },
  mapControlButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 9,
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 10,
    paddingBottom: 25,
    elevation: 15,
  },
  panelHandle: {
    width: 38,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#C8C0B5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 19,
    marginBottom: 14,
  },
  panelHeadingContainer: {
    flex: 1,
  },
  panelEyebrow: {
    color: Colors.secondary,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  panelTitle: {
    color: Colors.primary,
    fontSize: 19,
    fontWeight: '800',
  },
  panelSubtitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 3,
  },
  refreshButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  salonCards: {
    paddingHorizontal: 18,
    gap: 12,
    paddingBottom: 5,
  },
  salonCard: {
    width: 255,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },
  selectedSalonCard: {
    borderColor: Colors.secondary,
    borderWidth: 1.5,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#302A23',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
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
  salonName: {
    color: Colors.primary,
    fontSize: 15,
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
    fontSize: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  ratingCount: {
    color: Colors.textMuted,
    fontSize: 9,
  },
  mapAvailability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapAvailabilityText: {
    color: Colors.textMuted,
    fontSize: 9,
  },
  detailsButton: {
    height: 37,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  detailsButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  coordinateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 19,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  coordinateNoticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  stateContainer: {
    minHeight: 115,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    gap: 8,
  },
  emptyTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
  },
  mapLoading: {
    position: 'absolute',
    top: '48%',
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    elevation: 4,
  },
});

export default ExploreScreen;
