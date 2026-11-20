
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

const BarberHeader = ({ navigation }) => {
  return (
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

        <TouchableOpacity
          style={styles.headerAvatar}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person-outline"
            size={16}
            color={Colors.accent}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BarberHeader;

const styles = StyleSheet.create({
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
});