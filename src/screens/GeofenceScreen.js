import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { UseApi } from '../hooks/UseApi';
import { transformGeofenceData } from '../../utils/transformGeofenceData';

const { width } = Dimensions.get('window');

const GeofencesScreen = () => {
  const navigation = useNavigation();
  const { get, patch } = UseApi();
  const [geofences, setGeofences] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [filterActive, setFilterActive] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();


  const fetchGeofences = async () => {
    try {
      setRefreshing(true);
      const response = await get('/geofence' );
      const transformedData = transformGeofenceData(response.data.data);
      setGeofences(transformedData);
    } catch (error) {
      console.error('Failed to fetch geofences:', error);
    } finally {
      setRefreshing(false);
    }
  };


   // Initial fetch
  useFocusEffect(
   useCallback(() => {
    fetchGeofences();
   }, [])
  );


  const handleRefresh = () => {
    fetchGeofences();
  };


  const toggleGeofenceActive = async (id) => {
    try {
      // Optimistic UI update
      setGeofences(prev => 
        prev.map(geofence => 
          geofence.id === id 
            ? { ...geofence, active: !geofence.active } 
            : geofence
        )
      );
      
      // API call to update status (no body needed)
      await patch(`/geofence/${id}/status`);
    } catch (error) {
      // Revert if API call fails
      fetchGeofences();
      console.error('Failed to update geofence status:', error);
    }
  };

  const toggleGeofenceNotifications = async (id) => {
    try {
      // Optimistic UI update
      setGeofences(prev => 
        prev.map(geofence => 
          geofence.id === id 
            ? { ...geofence, notifications: !geofence.notifications } 
            : geofence
        )
      );
  
      // API call to update notifications (no body needed)
      await patch(`/geofence/${id}/notifications`);
    } catch (error) {
      // Revert if API call fails
      fetchGeofences();
      console.error('Failed to update notifications:', error);
    }
  };


  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredGeofences = geofences
    .filter(geofence => {
      const nameMatch = geofence.geofence_name.toLowerCase().includes(searchText.toLowerCase());
      const descMatch = geofence.description.toLowerCase().includes(searchText.toLowerCase());
      const textFilter = nameMatch || descMatch;
      const activeFilter = filterActive === null ? true : geofence.active === filterActive;
      return textFilter && activeFilter;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'name': return a.geofence_name.localeCompare(b.geofence_name);
        case 'date': return new Date(b.created_at) - new Date(a.created_at);
        case 'radius': return b.radius - a.radius;
        default: return 0;
      }
    });



  

  

  // Render geofence card item
  const renderGeofenceCard = ({ item }) => (
   
    <View style={styles.geofenceCardContainer}>
      <TouchableOpacity
        style={styles.geofenceCard}
        onPress={() => navigation.navigate('GeoZoneScreen', { geofence: item })}>
        <LinearGradient
          colors={item.color}
          style={styles.gradientBar}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <CustomText style={styles.geofenceName}>{item.geofence_name}</CustomText>
              <View style={styles.badgeContainer}>
                <View style={[styles.statusBadge, { backgroundColor: item.active ? '#E3F2FD' : '#FFEBEE' }]}>
                  <View style={[styles.statusDot, { backgroundColor: item.active ? '#2196F3' : '#F44336' }]} />
                  <CustomText style={[styles.statusText, { color: item.active ? '#0D47A1' : '#B71C1C' }]}>
                    {item.active ? 'Active' : 'Inactive'}
                  </CustomText>
                </View>
                {item.alerts_count > 0 && (
                  <View style={styles.alertsBadge}>
                    <Icon name="bell-ring" size={12} color="#FFF" />
                    <CustomText style={styles.alertsText}>{item.alerts_count}</CustomText>
                  </View>
                )}
              </View>
            </View>
            <CustomText style={styles.description} numberOfLines={1}>{item.description}</CustomText>
          </View>
          
          <View style={styles.metaDataContainer}>
            <View style={styles.metaData}>
              <Icon name="map-marker" size={14} color="#666" />
              <CustomText style={styles.metaText}>
                {`${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
              </CustomText>
            </View>
            <View style={styles.metaData}>
              <Icon name="radius" size={14} color="#666" />
              <CustomText style={styles.metaText}>{item.radius}m radius</CustomText>
            </View>
            <View style={styles.metaData}>
              <Icon name="calendar" size={14} color="#666" />
              <CustomText style={styles.metaText}>{formatDate(item.created_at)}</CustomText>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => toggleGeofenceActive(item.id)}>
                <Icon 
                  name={item.active ? "toggle-switch" : "toggle-switch-off"} 
                  size={24} 
                  color={item.active ? "#6C63FF" : "#9e9e9e"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => toggleGeofenceNotifications(item.id)}>
                <Icon 
                  name={item.notifications ? "bell" : "bell-off"} 
                  size={22} 
                  color={item.notifications ? "#6C63FF" : "#9e9e9e"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('EditGeofence', { geofence: item })}>
                <Icon name="pencil" size={22} color="#6C63FF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigation.navigate('GeoZoneScreen', { geofence: item })}>
              <CustomText style={styles.viewButtonText}>View Details</CustomText>
              <Icon name="chevron-right" size={16} color="#6C63FF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Filter tabs component
  const FilterTabs = () => (
    <View style={styles.filterTabsContainer}>
      <TouchableOpacity 
        style={[styles.filterTab, filterActive === null && styles.filterTabActive]}
        onPress={() => setFilterActive(null)}>
        <CustomText style={[styles.filterTabText, filterActive === null && styles.filterTabTextActive]}>
          All
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterTab, filterActive === true && styles.filterTabActive]}
        onPress={() => setFilterActive(true)}>
        <CustomText style={[styles.filterTabText, filterActive === true && styles.filterTabTextActive]}>
          Active
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.filterTab, filterActive === false && styles.filterTabActive]}
        onPress={() => setFilterActive(false)}>
        <CustomText style={[styles.filterTabText, filterActive === false && styles.filterTabTextActive]}>
          Inactive
        </CustomText>
      </TouchableOpacity>
    </View>
  );

  // Sort options component
  const SortOptions = () => (
    <View style={styles.sortContainer}>
      <CustomText style={styles.sortLabel}>Sort by:</CustomText>
      <View style={styles.sortOptions}>
        <TouchableOpacity 
          style={[styles.sortOption, sortOption === 'name' && styles.sortOptionActive]}
          onPress={() => setSortOption('name')}>
          <CustomText style={[styles.sortOptionText, sortOption === 'name' && styles.sortOptionTextActive]}>
            Name
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortOption, sortOption === 'date' && styles.sortOptionActive]}
          onPress={() => setSortOption('date')}>
          <CustomText style={[styles.sortOptionText, sortOption === 'date' && styles.sortOptionTextActive]}>
            Date
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sortOption, sortOption === 'radius' && styles.sortOptionActive]}
          onPress={() => setSortOption('radius')}>
          <CustomText style={[styles.sortOptionText, sortOption === 'radius' && styles.sortOptionTextActive]}>
            Radius
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: tabBarHeight }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <CustomText style={styles.headerTitle}>My Geofences</CustomText>   
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => navigation.navigate('CreateGeofenceScreen')}>
            <Icon name="plus" size={24} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search geofences..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#999"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FilterTabs />
        <SortOptions />

        <View style={styles.listContainer}>
          <FlatList
            data={filteredGeofences}
            renderItem={renderGeofenceCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="map-marker-off" size={60} color="#ccc" />
                <CustomText style={styles.emptyText}>No geofences found</CustomText>
                <CustomText style={styles.emptySubText}>
                  {searchText ? "Try different search terms" : "Create your first geofence"}
                </CustomText>
                {!searchText && (
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => navigation.navigate('CreateGeofenceScreen')}>
                    <Icon name="plus" size={20} color="#fff" />
                    <CustomText style={styles.createButtonText}>Create Geofence</CustomText>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        </View>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('CreateGeofenceScreen')}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  headerAction: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Manrope-Regular',
    fontSize: 14,
    color: '#333',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  filterTabActive: {
    backgroundColor: '#6C63FF',
  },
  filterTabText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  sortOptionActive: {
    backgroundColor: '#E8E6FF',
  },
  sortOptionText: {
    fontFamily: 'Manrope-Medium',
    fontSize: 12,
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#6C63FF',
  },
  listContainer: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  geofenceCardContainer: {
    marginBottom: 16,
  },
  geofenceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientBar: {
    width: 8,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  geofenceName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
  },
  alertsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4785',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  alertsText: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
    color: '#fff',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  metaDataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaData: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 16,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EEFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default GeofencesScreen;