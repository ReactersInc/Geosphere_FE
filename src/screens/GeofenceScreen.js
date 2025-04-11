import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Get device dimensions
const { width } = Dimensions.get('window');

// Expanded dummy data for geofences
const DUMMY_GEOFENCES = [
  {
    id: '1',
    geofence_name: 'Home Area',
    radius: 200,
    lat: 37.7749,
    lng: -122.4194,
    created_at: '2025-03-25T14:32:11Z',
    active: true,
    notifications: true,
    color: ['#6C63FF', '#5046e5'],
    description: 'Safe area around home',
    alerts_count: 3,
  },
  {
    id: '2',
    geofence_name: 'Office Zone',
    radius: 150,
    lat: 37.7833,
    lng: -122.4167,
    created_at: '2025-04-01T09:15:20Z',
    active: true,
    notifications: true,
    color: ['#FF6B6B', '#FF4785'],
    description: 'Work location boundaries',
    alerts_count: 1,
  },
  {
    id: '3',
    geofence_name: 'Park Safety Zone',
    radius: 300,
    lat: 37.7694,
    lng: -122.4862,
    created_at: '2025-04-05T17:45:33Z',
    active: false,
    notifications: false,
    color: ['#4CAF50', '#2E7D32'],
    description: 'Safe area for kids at the park',
    alerts_count: 0,
  },
  {
    id: '4',
    geofence_name: 'School Area',
    radius: 250,
    lat: 37.7855,
    lng: -122.4051,
    created_at: '2025-03-20T08:15:22Z',
    active: true,
    notifications: true,
    color: ['#FF9800', '#F57C00'],
    description: 'School campus and surrounding area',
    alerts_count: 2,
  },
  {
    id: '5',
    geofence_name: 'Gym Location',
    radius: 100,
    lat: 37.7825,
    lng: -122.4382,
    created_at: '2025-04-07T16:30:45Z',
    active: true,
    notifications: false,
    color: ['#9C27B0', '#7B1FA2'],
    description: 'Fitness center area',
    alerts_count: 0,
  },
  {
    id: '6',
    geofence_name: 'Grandparents House',
    radius: 180,
    lat: 37.7981,
    lng: -122.4095,
    created_at: '2025-03-15T12:45:30Z',
    active: false,
    notifications: true,
    color: ['#3F51B5', '#303F9F'],
    description: 'Safe area around grandparents',
    alerts_count: 0,
  },
];

const GeofencesScreen = () => {
  const navigation = useNavigation();
  const [geofences, setGeofences] = useState(DUMMY_GEOFENCES);
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState('name'); // 'name', 'date', 'radius'
  const [filterActive, setFilterActive] = useState(null); // null (all), true, false
  const tabBarHeight = useBottomTabBarHeight();
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter and sort geofences
  const filteredGeofences = geofences
    .filter(geofence => {
      // Apply search text filter
      const nameMatch = geofence.geofence_name.toLowerCase().includes(searchText.toLowerCase());
      const descMatch = geofence.description.toLowerCase().includes(searchText.toLowerCase());
      const textFilter = nameMatch || descMatch;
      
      // Apply active/inactive filter
      const activeFilter = filterActive === null ? true : geofence.active === filterActive;
      
      return textFilter && activeFilter;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortOption) {
        case 'name':
          return a.geofence_name.localeCompare(b.geofence_name);
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at); // Newest first
        case 'radius':
          return b.radius - a.radius; // Largest first
        default:
          return 0;
      }
    });

  // Toggle geofence active status
  const toggleGeofenceActive = (id) => {
    setGeofences(prev => 
      prev.map(geofence => 
        geofence.id === id 
          ? { ...geofence, active: !geofence.active } 
          : geofence
      )
    );
  };

  // Toggle geofence notifications
  const toggleGeofenceNotifications = (id) => {
    setGeofences(prev => 
      prev.map(geofence => 
        geofence.id === id 
          ? { ...geofence, notifications: !geofence.notifications } 
          : geofence
      )
    );
  };

  // Render geofence card item
  const renderGeofenceCard = ({ item }) => (
    <View style={styles.geofenceCardContainer}>
      <TouchableOpacity
        style={styles.geofenceCard}
        onPress={() => navigation.navigate('GeoZone', { geofence: item })}>
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
              onPress={() => navigation.navigate('GeoZone', { geofence: item })}>
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
            onPress={() => navigation.navigate('CreateGeofence')}>
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
                    onPress={() => navigation.navigate('CreateGeofence')}>
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
          onPress={() => navigation.navigate('CreateGeofence')}>
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