
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Animated,
  PanResponder,
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

import Colors from '../../../constants/Colors';
import salonService from '../../../services/salonService';
import favoriteService from '../../../services/favoriteService';
import useAuthStore from '../../../store/useAuthStore';

const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
const DEFAULT_COORDINATE = [67.0011, 24.8607];

const SHEET_HEIGHT = 400;
const COLLAPSED_Y = 325;
const SELECTED_Y = 155;
const EXPANDED_Y = 0;

const ExploreScreen = ({ navigation }) => {
  const token = useAuthStore((state) => state.token);

  const cameraRef = useRef(null);
  const sheetY = useRef(new Animated.Value(COLLAPSED_Y)).current;
  const sheetStartY = useRef(COLLAPSED_Y);

  const [mapStyle, setMapStyle] = useState(null);
  const [salons, setSalons] = useState([]);
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('nearby');
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [sheetState, setSheetState] = useState('collapsed');
  const [mapReady, setMapReady] = useState(false);

  const [favoriteSalonIds, setFavoriteSalonIds] = useState(new Set());
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState(new Set());

  const selectedSalon = useMemo(
    () =>
      salons.find(
        (salon) => String(salon._id) === String(selectedSalonId)
      ) || null,
    [salons, selectedSalonId]
  );

  const getErrorMessage = (err) =>
    err.response?.data?.message ||
    err.message ||
    'Something went wrong. Please try again.';

  // Load map style and remove symbol layers to avoid unavailable glyph errors.

  useEffect(() => {
    let isMounted = true;

    const loadMapStyle = async () => {
      try {
        const response = await fetch(MAP_STYLE_URL);

        if (!response.ok) {
          throw new Error(`Map style request failed: ${response.status}`);
        }

        const style = await response.json();

        const updatedStyle = {
          ...style,
          layers: style.layers.filter(
            (layer) => layer.type !== 'symbol'
          ),
        };

        if (isMounted) {
          setMapStyle(updatedStyle);
        }
      } catch (err) {
        console.warn('Map style loading failed:', err.message);
        if (isMounted) {
          setError('Unable to load the map. Please try again.');
        }
      }
    };

    loadMapStyle();

    return () => {
      isMounted = false;
    };
  }, []);

  // Bottom sheet animation.

  const animateSheet = useCallback(
    (position, state) => {
      setSheetState(state);

      Animated.spring(sheetY, {
        toValue: position,
        useNativeDriver: true,
        tension: 65,
        friction: 12,
      }).start();
    },
    [sheetY]
  );

  const collapseSheet = useCallback(() => {
    setSelectedSalonId(null);
    animateSheet(COLLAPSED_Y, 'collapsed');
  }, [animateSheet]);

  const showSelectedSalon = useCallback(
    (salon) => {
      if (!salon?._id) return;

      setSelectedSalonId(salon._id);
      animateSheet(SELECTED_Y, 'selected');
    },
    [animateSheet]
  );

  const expandSheet = useCallback(() => {
    animateSheet(EXPANDED_Y, 'expanded');
  }, [animateSheet]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 5,

        onPanResponderGrant: () => {
          sheetY.stopAnimation((value) => {
            sheetStartY.current = value;
          });
        },

        onPanResponderMove: (_, gesture) => {
          const nextPosition = Math.max(
            EXPANDED_Y,
            Math.min(
              COLLAPSED_Y,
              sheetStartY.current + gesture.dy
            )
          );

          sheetY.setValue(nextPosition);
        },

        onPanResponderRelease: (_, gesture) => {
          const currentPosition = Math.max(
            EXPANDED_Y,
            Math.min(
              COLLAPSED_Y,
              sheetStartY.current + gesture.dy
            )
          );

          if (gesture.vy < -0.5 || currentPosition < 80) {
            animateSheet(EXPANDED_Y, 'expanded');
          } else if (
            gesture.vy > 0.5 ||
            currentPosition > 255
          ) {
            collapseSheet();
          } else {
            animateSheet(SELECTED_Y, 'selected');
          }
        },
      }),
    [sheetY, animateSheet, collapseSheet]
  );

  // Fetch all salons.

  const fetchAllSalonsData = useCallback(async () => {
    if (!token) {
      throw new Error('Please log in again to discover salons.');
    }

    const results = await salonService.getSalons(token);

    return Array.isArray(results) ? results : [];
  }, [token]);

  // Fetch favorite salons.

  const fetchFavoriteSalons = useCallback(async () => {
    if (!token) return;

    try {
      const response = await favoriteService.getFavoriteSalons(token);

      const favorites = Array.isArray(response?.favorites)
        ? response.favorites
        : [];

      setFavoriteSalonIds(
        new Set(
          favorites
            .map((item) => item?.salon?._id)
            .filter(Boolean)
        )
      );
    } catch (err) {
      console.warn(
        'Failed to fetch favorite salons:',
        getErrorMessage(err)
      );
    }
  }, [token]);

  useEffect(() => {
    fetchFavoriteSalons();
  }, [fetchFavoriteSalons]);

  // Toggle favorite salon.

  const toggleFavoriteSalon = async (salon) => {
    const branchId = salon?._id;

    if (!branchId || !token || favoriteLoadingIds.has(branchId)) {
      return;
    }

    const isFavorite = favoriteSalonIds.has(branchId);

    setFavoriteLoadingIds((previous) => {
      const updated = new Set(previous);
      updated.add(branchId);
      return updated;
    });

    try {
      if (isFavorite) {
        await favoriteService.removeFavoriteSalon(branchId, token);

        setFavoriteSalonIds((previous) => {
          const updated = new Set(previous);
          updated.delete(branchId);
          return updated;
        });
      } else {
        await favoriteService.addFavoriteSalon(branchId, token);

        setFavoriteSalonIds((previous) => {
          const updated = new Set(previous);
          updated.add(branchId);
          return updated;
        });
      }
    } catch (err) {
      Alert.alert('Favorite update failed', getErrorMessage(err));
    } finally {
      setFavoriteLoadingIds((previous) => {
        const updated = new Set(previous);
        updated.delete(branchId);
        return updated;
      });
    }
  };

  // Fetch all salons.

  const fetchAllSalons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setActiveFilter('all');

      const results = await fetchAllSalonsData();

      setSalons(results);
      console.log('ALL SALONS API:', JSON.stringify(results, null, 2));

console.log(
  'SALONS WITH COORDINATES:',
  results.filter((salon) => getSalonCoordinates(salon)).length
);
      collapseSheet();
    } catch (err) {
      setSalons([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [fetchAllSalonsData, collapseSheet]);

  // Fetch nearby salons using current location.

  const handleNearbySalons = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setActiveFilter('nearby');

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
        collapseSheet();
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

      const results = await salonService.getNearbySalons(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          radius: 5,
        },
        token
      );

      setSalons(Array.isArray(results) ? results : []);
      collapseSheet();
    } catch (err) {
      setError(getErrorMessage(err));
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }, [token, fetchAllSalonsData, collapseSheet]);

  useEffect(() => {
    handleNearbySalons();
  }, [handleNearbySalons]);

  // Search salons by area.

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

      const results = await salonService.getSalonsByArea(
        trimmedArea,
        token
      );

      setSalons(Array.isArray(results) ? results : []);
      collapseSheet();
    } catch (err) {
      setSalons([]);
      console.log('AREA SALONS API:', JSON.stringify(results, null, 2));

console.log(
  'AREA SALONS WITH COORDINATES:',
  results.filter((salon) => getSalonCoordinates(salon)).length
);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setArea('');
    fetchAllSalons();
  };

  // Open salon details.

  const openSalonDetails = (salon) => {
    if (!salon?._id) return;

    navigation.navigate('SalonDetails', {
      branchId: salon._id,
    });
  };

  // Extract valid salon coordinates.
  // GeoJSON coordinates must be [longitude, latitude].

  const getSalonCoordinates = (salon) => {
    const location = salon?.location || salon?.geoLocation;

    const coordinates =
      location?.coordinates ||
      salon?.coordinates;

    if (
      Array.isArray(coordinates) &&
      coordinates.length === 2
    ) {
      const [longitude, latitude] = coordinates;

      if (
        Number.isFinite(Number(longitude)) &&
        Number.isFinite(Number(latitude)) &&
        Number(longitude) >= -180 &&
        Number(longitude) <= 180 &&
        Number(latitude) >= -90 &&
        Number(latitude) <= 90
      ) {
        return [Number(longitude), Number(latitude)];
      }
    }

    const latitude =
      location?.latitude ??
      location?.lat ??
      salon?.latitude ??
      salon?.lat;

    const longitude =
      location?.longitude ??
      location?.lng ??
      salon?.longitude ??
      salon?.lng;

    if (
      latitude !== undefined &&
      longitude !== undefined &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude)) &&
      Number(latitude) >= -90 &&
      Number(latitude) <= 90 &&
      Number(longitude) >= -180 &&
      Number(longitude) <= 180
    ) {
      return [Number(longitude), Number(latitude)];
    }

    return null;
  };

  // Salons with valid coordinates.

  const salonsWithCoordinates = useMemo(
    () =>
      salons.filter((salon) => getSalonCoordinates(salon)),
    [salons]
  );

  // Salon markers GeoJSON.

  const mapFeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: salonsWithCoordinates.map((salon) => ({
        type: 'Feature',
        id: String(salon._id),
        properties: {
          salonId: String(salon._id),
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

  // Current user location GeoJSON.

  const userFeatureCollection = useMemo(
    () => ({
      type: 'FeatureCollection',
      features: userLocation
        ? [
            {
              type: 'Feature',
              id: 'current-user',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: userLocation,
              },
            },
          ]
        : [],
    }),
    [userLocation]
  );

  // Select salon from map marker.

  const selectSalon = useCallback(
    (salon) => {
      if (!salon?._id) return;

      showSelectedSalon(salon);

      const coordinates = getSalonCoordinates(salon);

      if (coordinates) {
        cameraRef.current?.easeTo({
          center: coordinates,
          zoom: 15,
          duration: 600,
        });
      }
    },
    [showSelectedSalon]
  );

  // Handle marker press.

  const handleMarkerPress = useCallback(
    (event) => {
      const features = event?.nativeEvent?.features || [];

      const salonId =
        features[0]?.properties?.salonId ??
        features[0]?.properties?.id ??
        features[0]?.id;

      if (salonId === undefined || salonId === null) {
        return;
      }

      const salon = salons.find(
        (item) => String(item._id) === String(salonId)
      );

      if (salon) {
        event.stopPropagation?.();
        selectSalon(salon);
      }
    },
    [salons, selectSalon]
  );

  // Handle empty map press.

  const handleMapPress = useCallback(() => {
    collapseSheet();
  }, [collapseSheet]);

  // Automatically center map when location and map are ready.

  useEffect(() => {
    if (!mapReady || !userLocation) return;

    cameraRef.current?.easeTo({
      center: userLocation,
      zoom: 14,
      duration: 800,
    });
  }, [mapReady, userLocation]);

  // Center map on current user.

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

      cameraRef.current?.easeTo({
        center: coordinates,
        zoom: 14,
        duration: 700,
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

  const selectedRating = Number(selectedSalon?.avgRating) || 0;
  const selectedRatingCount = Number(selectedSalon?.ratingCount) || 0;

  const selectedIsFavorite = selectedSalon
    ? favoriteSalonIds.has(selectedSalon._id)
    : false;

  const selectedFavoriteLoading = selectedSalon
    ? favoriteLoadingIds.has(selectedSalon._id)
    : false;

  return (
    <View style={styles.container}>
      {/* Map */}

      {mapStyle && (
        <MapLibreGL.Map
          style={StyleSheet.absoluteFill}
          mapStyle={mapStyle}
          logo={false}
          attribution
          compass={false}
          onPress={handleMapPress}
          onDidFinishLoadingMap={() => setMapReady(true)}
        >
          <MapLibreGL.Camera
            ref={cameraRef}
            initialViewState={{
              center: DEFAULT_COORDINATE,
              zoom: 14,
            }}
          />

          {/* User location marker */}

          {userFeatureCollection.features.length > 0 && (
            <MapLibreGL.GeoJSONSource
              id="userLocation"
              data={userFeatureCollection}
            >
              <MapLibreGL.Layer
                id="userLocationCircle"
                type="circle"
                paint={{
                  'circle-radius': 9,
                  'circle-color': '#2583E9',
                  'circle-stroke-width': 4,
                  'circle-stroke-color': '#FFFFFF',
                }}
              />
            </MapLibreGL.GeoJSONSource>
          )}

          {/* Salon markers */}

          {mapFeatureCollection.features.length > 0 && (
            <MapLibreGL.GeoJSONSource
              id="salons"
              data={mapFeatureCollection}
              onPress={handleMarkerPress}
              hitbox={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <MapLibreGL.Layer
                id="salonMarkers"
                type="circle"
                paint={{
                  'circle-radius': [
                    'case',
                    [
                      '==',
                      ['get', 'salonId'],
                      String(selectedSalonId || ''),
                    ],
                    13,
                    9,
                  ],
                  'circle-color': '#C49352',
                  'circle-stroke-width': 3,
                  'circle-stroke-color': '#FFFFFF',
                }}
              />
            </MapLibreGL.GeoJSONSource>
          )}
        </MapLibreGL.Map>
      )}

      {/* Top search interface */}

      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <View style={styles.brandContainer}>
            <Text style={styles.brand}>TRIMLY.</Text>
            <Text style={styles.brandSubtitle}>FIND YOUR STYLE</Text>
          </View>

          <Pressable
            style={styles.iconButton}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons
              name="heart-outline"
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
          onPress={() =>
            cameraRef.current?.zoomTo(15, { duration: 400 })
          }
        >
          <Ionicons name="add" size={23} color={Colors.primary} />
        </Pressable>

        <View style={styles.controlDivider} />

        <Pressable
          style={styles.mapControlButton}
          onPress={() =>
            cameraRef.current?.zoomTo(11, { duration: 400 })
          }
        >
          <Ionicons name="remove" size={23} color={Colors.primary} />
        </Pressable>

        <View style={styles.controlDivider} />

        <Pressable
          style={styles.mapControlButton}
          onPress={centerOnUser}
        >
          <Ionicons
            name="locate-outline"
            size={20}
            color={Colors.primary}
          />
        </Pressable>
      </View>

      {/* Draggable bottom sheet */}

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: SHEET_HEIGHT,
            transform: [{ translateY: sheetY }],
          },
        ]}
      >
        <View
          style={styles.sheetDragArea}
          {...panResponder.panHandlers}
        >
          <View style={styles.panelHandle} />

          <View style={styles.sheetHeading}>
            <View>
              <Text style={styles.panelEyebrow}>
                DISCOVER YOUR NEXT LOOK
              </Text>

              <Text style={styles.panelTitle}>
                {selectedSalon
                  ? selectedSalon.name || 'Selected salon'
                  : resultTitle}
              </Text>
            </View>

            <Pressable
              style={styles.sheetAction}
              onPress={() => {
                if (sheetState === 'expanded') {
                  animateSheet(SELECTED_Y, 'selected');
                } else if (selectedSalon) {
                  expandSheet();
                } else {
                  animateSheet(SELECTED_Y, 'selected');
                }
              }}
            >
              <Ionicons
                name={
                  sheetState === 'expanded'
                    ? 'chevron-down'
                    : 'chevron-up'
                }
                size={21}
                color={Colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {selectedSalon ? (
          <View style={styles.selectedContent}>
            <View style={styles.selectedCard}>
              <View style={styles.selectedCardTop}>
                <View style={styles.cardIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={25}
                    color={Colors.accent}
                  />
                </View>

                <View style={styles.selectedCardInfo}>
                  <Text style={styles.salonName} numberOfLines={1}>
                    {selectedSalon.name || 'Unnamed Salon'}
                  </Text>

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={Colors.textMuted}
                    />

                    <Text
                      style={styles.salonLocation}
                      numberOfLines={2}
                    >
                      {[
                        selectedSalon.area,
                        selectedSalon.city,
                      ].filter(Boolean).join(', ') ||
                        selectedSalon.address ||
                        'Location unavailable'}
                    </Text>
                  </View>

                  <View style={styles.selectedMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons
                        name="star"
                        size={14}
                        color={Colors.secondary}
                      />

                      <Text style={styles.rating}>
                        {selectedRating.toFixed(1)}
                      </Text>

                      <Text style={styles.ratingCount}>
                        ({selectedRatingCount})
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        selectedSalon.isOpen
                          ? styles.openBadge
                          : styles.closedBadge,
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          selectedSalon.isOpen
                            ? styles.openDot
                            : styles.closedDot,
                        ]}
                      />

                      <Text
                        style={[
                          styles.statusText,
                          selectedSalon.isOpen
                            ? styles.openText
                            : styles.closedText,
                        ]}
                      >
                        {selectedSalon.isOpen ? 'Open' : 'Closed'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  style={styles.favoriteButton}
                  onPress={() => toggleFavoriteSalon(selectedSalon)}
                  disabled={selectedFavoriteLoading}
                >
                  {selectedFavoriteLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={Colors.secondary}
                    />
                  ) : (
                    <Ionicons
                      name={
                        selectedIsFavorite
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={21}
                      color={
                        selectedIsFavorite
                          ? '#B94B45'
                          : Colors.primary
                      }
                    />
                  )}
                </Pressable>
              </View>

              {sheetState === 'expanded' && (
                <View style={styles.expandedDetails}>
                  <View style={styles.expandedDetailRow}>
                    <Ionicons
                      name="navigate-outline"
                      size={17}
                      color={Colors.secondary}
                    />

                    <Text style={styles.expandedDetailText}>
                      {selectedSalon.address ||
                        'Address details available on salon page'}
                    </Text>
                  </View>

                  <View style={styles.expandedDetailRow}>
                    <Ionicons
                      name="location-outline"
                      size={17}
                      color={Colors.secondary}
                    />

                    <Text style={styles.expandedDetailText}>
                      {getSalonCoordinates(selectedSalon)
                        ? 'Location available on map'
                        : 'Map coordinates unavailable'}
                    </Text>
                  </View>
                </View>
              )}

              <Pressable
                style={styles.detailsButton}
                onPress={() => openSalonDetails(selectedSalon)}
              >
                <Text style={styles.detailsButtonText}>
                  View salon details
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={Colors.white}
                />
              </Pressable>
            </View>

            {sheetState === 'expanded' && (
              <Text style={styles.expandedHint}>
                Drag down to close this salon preview.
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.discoveryContent}>
            {loading ? (
              <View style={styles.stateContainer}>
                <ActivityIndicator
                  size="small"
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
                  size={24}
                  color={Colors.error}
                />
                <Text style={styles.stateText}>{error}</Text>
              </View>
            ) : salons.length === 0 ? (
              <View style={styles.stateContainer}>
                <Ionicons
                  name="storefront-outline"
                  size={25}
                  color={Colors.textMuted}
                />
                <Text style={styles.emptyTitle}>
                  No salons found
                </Text>
                <Text style={styles.stateText}>
                  Try another area or search nearby salons.
                </Text>
              </View>
            ) : (
              <View style={styles.discoverySummary}>
                <View style={styles.discoveryIcon}>
                  <Ionicons
                    name="map-outline"
                    size={22}
                    color={Colors.secondary}
                  />
                </View>

                <View style={styles.discoveryTextContainer}>
                  <Text style={styles.discoveryTitle}>
                    {salons.length} salons found
                  </Text>

                  <Text style={styles.discoverySubtitle}>
                    Select a marker on the map to explore a salon.
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
            )}

            {salons.length > 0 &&
              salonsWithCoordinates.length === 0 && (
                <View style={styles.coordinateNotice}>
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color={Colors.secondary}
                  />

                  <Text style={styles.coordinateNoticeText}>
                    Salon markers will appear when coordinates are available.
                  </Text>
                </View>
              )}
          </View>
        )}
      </Animated.View>

      {(!mapReady || !mapStyle) && (
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
    bottom: 110,
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

  // Bottom sheet.

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 10,
    paddingBottom: 25,
    elevation: 18,
  },

  sheetDragArea: {
    paddingHorizontal: 19,
    paddingBottom: 15,
  },

  panelHandle: {
    width: 38,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#C8C0B5',
    alignSelf: 'center',
    marginBottom: 15,
  },

  sheetHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontSize: 18,
    fontWeight: '800',
  },

  sheetAction: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedContent: {
    paddingHorizontal: 17,
  },

  selectedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
  },

  selectedCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },

  selectedCardInfo: {
    flex: 1,
    paddingTop: 2,
  },

  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#302A23',
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 15,
  },

  selectedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
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

  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F5F1EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  detailsButton: {
    height: 40,
    marginTop: 14,
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

  expandedDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 14,
    paddingTop: 13,
    gap: 11,
  },

  expandedDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  expandedDetailText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },

  expandedHint: {
    textAlign: 'center',
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 10,
  },

  discoveryContent: {
    paddingHorizontal: 19,
  },

  discoverySummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 8,
  },

  discoveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F0E9DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  discoveryTextContainer: {
    flex: 1,
  },

  discoveryTitle: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  discoverySubtitle: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 15,
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

  coordinateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
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
    minHeight: 100,
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
