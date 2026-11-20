
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import Colors from '../../../constants/Colors';
import useAuthStore from '../../../store/useAuthStore';
import favoriteService from '../../../services/favoriteService';

const FavoritesScreen = ({ navigation }) => {
  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState('salons');
  const [salons, setSalons] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingIds, setRemovingIds] = useState([]);

  const fetchFavorites = useCallback(async (showLoader = true) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoader) setLoading(true);

      const [salonResponse, barberResponse] = await Promise.all([
        favoriteService.getFavoriteSalons(token),
        favoriteService.getFavoriteBarbers(token),
      ]);

      setSalons(salonResponse?.favorites || []);
      setBarbers(barberResponse?.favorites || []);
    } catch (error) {
      console.error(
        'Fetch favorites error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Unable to load favorites',
        'Please try again in a moment.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavorites(false);
  };

  const handleRemove = async (item, type) => {
    const itemId =
      type === 'salon' ? item.salon?._id : item.barber?._id;

    if (!itemId || !token || removingIds.includes(itemId)) return;

    try {
      setRemovingIds(previous => [...previous, itemId]);

      if (type === 'salon') {
        await favoriteService.removeFavoriteSalon(itemId, token);
        setSalons(previous =>
          previous.filter(favorite => favorite.salon?._id !== itemId)
        );
      } else {
        await favoriteService.removeFavoriteBarber(itemId, token);
        setBarbers(previous =>
          previous.filter(favorite => favorite.barber?._id !== itemId)
        );
      }
    } catch (error) {
      console.error(
        'Remove favorite error:',
        error.response?.data || error.message
      );

      Alert.alert(
        'Unable to remove',
        'This item could not be removed from your favorites.'
      );
    } finally {
      setRemovingIds(previous =>
        previous.filter(id => id !== itemId)
      );
    }
  };

  const renderSalon = (item) => {
    const salon = item.salon;

    if (!salon) return null;

    return (
      <View key={item.favoriteId || salon._id} style={styles.card}>
        <View style={styles.itemIcon}>
          <Ionicons name="business-outline" size={24} color={Colors.accent} />
        </View>

        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {salon.name || 'Salon'}
          </Text>

          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {[salon.area, salon.city].filter(Boolean).join(', ') ||
              salon.address ||
              'Location unavailable'}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color={Colors.accent} />
            <Text style={styles.rating}>
              {Number(salon.avgRating || 0).toFixed(1)}
            </Text>
            <Text style={styles.ratingCount}>
              ({salon.ratingCount || 0} reviews)
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemove(item, 'salon')}
          disabled={removingIds.includes(salon._id)}
          hitSlop={8}
        >
          {removingIds.includes(salon._id) ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="heart" size={21} color={Colors.error} />
          )}
        </Pressable>
      </View>
    );
  };

  const renderBarber = (item) => {
    const barber = item.barber;

    if (!barber) return null;

    const barberName =
      barber.userId?.name || barber.user?.name || barber.name || 'Barber';

    const photo =
      barber.userId?.profilePhoto || barber.user?.profilePhoto ||
      barber.profilePhoto;

    const photoUri =
      typeof photo === 'string' ? photo : photo?.url || photo?.secure_url;

    const specialties = Array.isArray(barber.specialties)
      ? barber.specialties.join(' · ')
      : '';

    return (
      <View key={item.favoriteId || barber._id} style={styles.card}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person" size={23} color={Colors.textSecondary} />
          </View>
        )}

        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {barberName}
          </Text>

          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {specialties || 'Professional barber'}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={13} color={Colors.accent} />
            <Text style={styles.rating}>
              {Number(barber.avgRating || 0).toFixed(1)}
            </Text>
            <Text style={styles.ratingCount}>
              ({barber.ratingCount || 0} reviews)
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.removeButton}
          onPress={() => handleRemove(item, 'barber')}
          disabled={removingIds.includes(barber._id)}
          hitSlop={8}
        >
          {removingIds.includes(barber._id) ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="heart" size={21} color={Colors.error} />
          )}
        </Pressable>
      </View>
    );
  };

  const currentItems = activeTab === 'salons' ? salons : barbers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Your Favorites</Text>
          <Text style={styles.subtitle}>
            The places and people you love
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="heart" size={21} color={Colors.accent} />
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[styles.tab, activeTab === 'salons' && styles.activeTab]}
          onPress={() => setActiveTab('salons')}
        >
          <Ionicons
            name="business-outline"
            size={17}
            color={activeTab === 'salons' ? Colors.white : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'salons' && styles.activeTabText,
            ]}
          >
            Salons ({salons.length})
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 'barbers' && styles.activeTab]}
          onPress={() => setActiveTab('barbers')}
        >
          <Ionicons
            name="person-outline"
            size={17}
            color={activeTab === 'barbers' ? Colors.white : Colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'barbers' && styles.activeTabText,
            ]}
          >
            Barbers ({barbers.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.secondary}
            />
          }
        >
          {currentItems.length > 0 ? (
            currentItems.map(item =>
              activeTab === 'salons'
                ? renderSalon(item)
                : renderBarber(item)
            )
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="heart-outline"
                  size={34}
                  color={Colors.accent}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Nothing saved yet
              </Text>

              <Text style={styles.emptyDescription}>
                {activeTab === 'salons'
                  ? 'Save salons you would love to visit and they will appear here.'
                  : 'Save your favourite barbers and find them here whenever you need.'}
              </Text>

              <Pressable
                style={styles.exploreButton}
                onPress={() => navigation.navigate('ExploreHome')}
              >
                <Text style={styles.exploreButtonText}>
                  Explore {activeTab === 'salons' ? 'Salons' : 'Barbers'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.white} />
              </Pressable>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
  },
  tab: {
    flex: 1,
    minHeight: 43,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  listContent: {
    padding: 18,
    paddingBottom: 35,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 13,
    marginBottom: 12,
  },
  itemIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: Colors.surfaceSecondary,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  ratingCount: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 65,
  },
  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'serif',
    color: Colors.primary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    color: Colors.textSecondary,
    maxWidth: 270,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 22,
  },
  exploreButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FavoritesScreen;
