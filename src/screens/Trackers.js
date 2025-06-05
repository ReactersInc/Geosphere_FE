import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { UseApi } from '../hooks/UseApi';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';

const TrackerScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useUser();
  const api = UseApi();
  const tabBarHeight = useBottomTabBarHeight();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGeofences, setFilteredGeofences] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const geofenceGradients = [
  ['#6C63FF', '#5046e5'],
  ['#FF6B6B', '#FF4785'],
  ['#4CAF50', '#2E7D32'],
  ['#9C27B0', '#7B1FA2'],
  ['#F06292', '#BA68C8'],
];

function getGeofenceGradient(index) {
  return geofenceGradients[index % geofenceGradients.length];
}

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/user');
      if (response.data) {
        setProfileData(response.data);
        filterGeofences(response.data.userGeofenceDetails.inWitchGeofence, searchQuery, selectedFilter);
      }
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterGeofences = (geofences, query, filterType) => {
    let filtered = geofences.filter(geofence =>
      geofence.name.toLowerCase().includes(query.toLowerCase()) ||
      geofence.description.toLowerCase().includes(query.toLowerCase())
    );

    switch(filterType) {
      case 'active':
        filtered = filtered.filter(g => g.status === 'active');
        break;
      case 'inactive':
        filtered = filtered.filter(g => g.status === 'inactive');
        break;
    }

    setFilteredGeofences(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, []);

  const renderGeofenceItem = ({ item, index }) => (
  <TouchableOpacity
    style={styles.geofenceCardWrapper}
    onPress={() =>
          navigation.navigate("TrackedGeofenceScreen", {
            geofenceId: item?.geofenceId,
          })
        }
    activeOpacity={0.9}
  >
    <LinearGradient
      colors={getGeofenceGradient(index)}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.geofenceCardGradient}
    >
      <View style={styles.geofenceCardContent}>
        <View style={styles.geofenceHeader}>
          <Icon name="map-marker-radius" size={24} color="#fff" />
          <View style={styles.geofenceInfo}>
            <CustomText style={styles.geofenceName}>{item.name}</CustomText>
            <CustomText style={styles.geofenceId}>ID: {item.geofenceId}</CustomText>
          </View>
        </View>
        <CustomText style={styles.geofenceDescription}>{item.description}</CustomText>
        <View style={styles.geofenceStats}>
          <View style={styles.statItem}>
            <Icon name="account-group" size={16} color="#fff" />
            <CustomText style={styles.statText}>
              {profileData?.userGeofenceDetails.totalUsersInGeofence} Members
            </CustomText>
          </View>
          <View style={styles.statItem}>
            <Icon name="connection" size={16} color="#fff" />
            <CustomText style={styles.statText}>
              {profileData?.userGeofenceDetails.totalConnections} Connections
            </CustomText>
          </View>
        </View>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

  const FilterButton = ({ icon, label, value }) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === value && styles.activeFilter]}
      onPress={() => {
        setSelectedFilter(value);
        filterGeofences(profileData?.userGeofenceDetails.inWitchGeofence, searchQuery, value);
      }}>
      <Icon name={icon} size={20} color={selectedFilter === value ? '#FFF' : '#6C63FF'} />
      <CustomText style={[styles.filterText, selectedFilter === value && styles.activeFilterText]}>
        {label}
      </CustomText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: tabBarHeight }]}>
      <View style={styles.header}>
        <CustomText style={styles.title}>Zones Tracking You</CustomText>
        {/* <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateGeofenceScreen')}>
          <Icon name="plus" size={24} color="#6C63FF" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search geofences..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            filterGeofences(profileData?.userGeofenceDetails.inWitchGeofence, text, selectedFilter);
          }}
          placeholderTextColor="#999"
        />
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
      </View>

      <View style={styles.filterContainer}>
        <FilterButton icon="view-grid" label="All" value="all" />
        <FilterButton icon="check-circle" label="Active" value="active" />
        <FilterButton icon="close-circle" label="Inactive" value="inactive" />
      </View>

      <FlatList
        data={filteredGeofences}
        renderItem={renderGeofenceItem}
        keyExtractor={item => item.geofenceId.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6C63FF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="map-marker-off" size={48} color="#CCC" />
            <CustomText style={styles.emptyText}>
              {searchQuery ? 'No matching geofences found' : 'No Zone is tracking you'}
            </CustomText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
    color: '#333'
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2
  },
  searchContainer: {
    marginBottom: 16,
    position: 'relative'
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 48,
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: '#333'
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    top: 18
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFF'
  },
  activeFilter: {
    backgroundColor: '#6C63FF'
  },
  filterText: {
    marginLeft: 8,
    fontFamily: 'Manrope-SemiBold',
    color: '#6C63FF'
  },
  activeFilterText: {
    color: '#FFF'
  },
  geofenceCardWrapper: {
  marginBottom: 16,
  borderRadius: 16,
  overflow: 'hidden',
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
},
geofenceCardGradient: {
  padding: 16,
  borderRadius: 16,
},
geofenceCardContent: {
  // No backgroundColor here, gradient handles it
},
geofenceName: {
  fontSize: 16,
  fontFamily: 'Manrope-Bold',
  color: '#fff',
},
geofenceId: {
  fontSize: 12,
  color: '#e0e0e0',
  fontFamily: 'Manrope-Medium',
},
geofenceDescription: {
  fontSize: 14,
  color: '#f0f0f0',
  marginBottom: 12,
  fontFamily: 'Manrope-Regular',
},
geofenceStats: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 8,
},
statItem: {
  flexDirection: 'row',
  alignItems: 'center',
},
statText: {
  marginLeft: 8,
  color: '#fff',
  fontFamily: 'Manrope-Medium',
},
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContent: {
    paddingBottom: 15
  }
});

export default TrackerScreen;
