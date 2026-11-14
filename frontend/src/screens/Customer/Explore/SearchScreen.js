
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Colors from '../../../constants/Colors';
import salonService from '../../../services/salonService';
import useAuthStore from '../../../store/useAuthStore';

const SearchScreen = ({ navigation }) => {
  const token = useAuthStore((state) => state.token);

  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const query = searchText.trim();

    if (!query) {
      setResults([]);
      setHasSearched(false);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setHasSearched(true);

      const data = await salonService.searchSalons(query, token);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setResults([]);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to search salons. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openSalon = (salon) => {
    navigation.navigate('SalonDetails', {
      branchId: salon._id,
    });
  };

  const renderSalon = ({ item }) => {
    const rating = Number(item.avgRating) || 0;
    const ratingCount = Number(item.ratingCount) || 0;

    return (
      <Pressable
        style={styles.resultCard}
        onPress={() => openSalon(item)}
      >
        <View style={styles.salonImage}>
          <Ionicons
            name="storefront-outline"
            size={30}
            color={Colors.accent}
          />
        </View>

        <View style={styles.resultContent}>
          <View style={styles.titleRow}>
            <Text style={styles.salonName} numberOfLines={1}>
              {item.name || 'Unnamed Salon'}
            </Text>

            <View style={styles.rating}>
              <Ionicons name="star" size={13} color={Colors.secondary} />
              <Text style={styles.ratingText}>
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.textMuted}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {[item.area, item.city].filter(Boolean).join(', ')}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.reviewCount}>
              {ratingCount} reviews
            </Text>

            <View style={styles.viewDetails}>
              <Text style={styles.viewDetailsText}>View salon</Text>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={Colors.primary}
          />
        </Pressable>

        <View>
          <Text style={styles.eyebrow}>DISCOVER TRIMLY</Text>
          <Text style={styles.heading}>Find your salon</Text>
        </View>
      </View>

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
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />

        {searchText.length > 0 && (
          <Pressable
            onPress={() => {
              setSearchText('');
              setResults([]);
              setHasSearched(false);
              setError('');
            }}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color={Colors.textMuted}
            />
          </Pressable>
        )}

        <Pressable
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Ionicons
            name="arrow-forward"
            size={18}
            color={Colors.white}
          />
        </Pressable>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>
          {hasSearched ? 'Search results' : 'Start exploring'}
        </Text>

        {hasSearched && !loading && !error && (
          <Text style={styles.resultCount}>
            {results.length} found
          </Text>
        )}
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.stateText}>Finding salons...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={Colors.error}
          />
          <Text style={styles.stateTitle}>Search failed</Text>
          <Text style={styles.stateText}>{error}</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={renderSalon}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={styles.stateContainer}>
          <Ionicons
            name="search-outline"
            size={36}
            color={Colors.textMuted}
          />

          <Text style={styles.stateTitle}>
            {hasSearched ? 'No salons found' : 'What are you looking for?'}
          </Text>

          <Text style={styles.stateText}>
            {hasSearched
              ? 'Try another salon name or search term.'
              : 'Search by salon name to discover grooming destinations.'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 55,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 25,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    color: Colors.secondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heading: {
    color: Colors.primary,
    fontSize: 23,
    fontWeight: '800',
  },
  searchContainer: {
    minHeight: 55,
    marginHorizontal: 20,
    paddingLeft: 14,
    paddingRight: 6,
    borderRadius: 15,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
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
  searchButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 15,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  resultCount: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 13,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    minHeight: 112,
  },
  salonImage: {
    width: 100,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    padding: 13,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  salonName: {
    flex: 1,
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  reviewCount: {
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
    fontSize: 10,
    fontWeight: '700',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
    gap: 10,
  },
  stateTitle: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default SearchScreen;
