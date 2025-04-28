import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Get device dimensions
const { height, width } = Dimensions.get('window');

// Dummy data for trackers
const DUMMY_TRACKERS = [
  {
    id: '1',
    name: 'Personal Tracker',
    device_id: 'PT-2873',
    battery: 85,
    active: true,
    last_ping: '2025-04-11T09:55:12Z',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: '123 Market St, San Francisco, CA'
    },
    color: ['#6C63FF', '#5046e5']
  },
  {
    id: '2',
    name: 'Keychain Tracker',
    device_id: 'KT-9621',
    battery: 62,
    active: true,
    last_ping: '2025-04-11T08:30:45Z',
    location: {
      lat: 37.7833,
      lng: -122.4167,
      address: '456 Mission St, San Francisco, CA'
    },
    color: ['#FF6B6B', '#FF4785']
  },
  {
    id: '3',
    name: 'Backpack Tag',
    device_id: 'BT-4517',
    battery: 24,
    active: false,
    last_ping: '2025-04-10T17:15:22Z',
    location: {
      lat: 37.7694,
      lng: -122.4862,
      address: '789 Oak St, San Francisco, CA'
    },
    color: ['#4CAF50', '#2E7D32']
  },
  {
    id: '4',
    name: 'Wallet Finder',
    device_id: 'WF-1289',
    battery: 91,
    active: true,
    last_ping: '2025-04-11T10:12:33Z',
    location: {
      lat: 37.7835,
      lng: -122.4084,
      address: '101 Pine St, San Francisco, CA'
    },
    color: ['#FF9800', '#F57C00']
  },
  {
    id: '5',
    name: 'Bike Tracker',
    device_id: 'BK-7634',
    battery: 45,
    active: true,
    last_ping: '2025-04-11T07:40:18Z',
    location: {
      lat: 37.7785,
      lng: -122.4256,
      address: '222 Howard St, San Francisco, CA'
    },
    color: ['#9C27B0', '#7B1FA2']
  }
];

const TrackerScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTrackers, setFilteredTrackers] = useState(DUMMY_TRACKERS);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const tabBarHeight = useBottomTabBarHeight();

  // Filter trackers based on search query and filter type
  useEffect(() => {
    let result = DUMMY_TRACKERS;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        tracker => 
          tracker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          tracker.device_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (selectedFilter === 'active') {
      result = result.filter(tracker => tracker.active);
    } else if (selectedFilter === 'inactive') {
      result = result.filter(tracker => !tracker.active);
    } else if (selectedFilter === 'low_battery') {
      result = result.filter(tracker => tracker.battery < 30);
    }
    
    setFilteredTrackers(result);
  }, [searchQuery, selectedFilter]);

  // Helper function to determine battery icon
  const getBatteryIcon = (level) => {
    if (level > 75) return 'battery-high';
    if (level > 50) return 'battery-medium';
    if (level > 25) return 'battery-low';
    return 'battery-alert';
  };

  // Helper function to determine battery color
  const getBatteryColor = (level) => {
    if (level > 75) return '#4CAF50';
    if (level > 50) return '#8BC34A';
    if (level > 25) return '#FF9800';
    return '#F44336';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Component for filter options
  const FilterOptions = () => {
    const filters = [
      { id: 'all', name: 'All', icon: 'view-grid' },
      { id: 'active', name: 'Active', icon: 'check-circle' },
      { id: 'inactive', name: 'Inactive', icon: 'close-circle' },
      { id: 'low_battery', name: 'Low Battery', icon: 'battery-alert' },
    ];

    return (
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}>
              <Icon
                name={filter.icon}
                size={18}
                color={selectedFilter === filter.id ? '#fff' : '#6C63FF'}
                style={styles.filterIcon}
              />
              <CustomText
                style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive,
                ]}>
                {filter.name}
              </CustomText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render individual tracker item
  const renderTrackerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trackerCard}
      onPress={() => navigation.navigate('TrackerDetails', { tracker: item })}>
      <LinearGradient
        colors={item.color}
        style={styles.trackerColorBand}
      />
      <View style={styles.trackerContent}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerTitleSection}>
            <CustomText style={styles.trackerName}>{item.name}</CustomText>
            <CustomText style={styles.trackerId}>ID: {item.device_id}</CustomText>
          </View>
          <View style={styles.trackerStatusSection}>
            <View style={styles.batteryContainer}>
              <Icon
                name={getBatteryIcon(item.battery)}
                size={18}
                color={getBatteryColor(item.battery)}
              />
              <CustomText style={[styles.batteryText, { color: getBatteryColor(item.battery) }]}>
                {item.battery}%
              </CustomText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }]}>
              <View style={[styles.statusDot, { backgroundColor: item.active ? '#4CAF50' : '#FF9800' }]} />
              <CustomText style={[styles.statusText, { color: item.active ? '#4CAF50' : '#FF9800' }]}>
                {item.active ? 'Active' : 'Inactive'}
              </CustomText>
            </View>
          </View>
        </View>
        
        <View style={styles.trackerDetails}>
          <View style={styles.locationContainer}>
            <Icon name="map-marker" size={16} color="#666" />
            <CustomText style={styles.locationText} numberOfLines={1}>
              {item.location.address}
            </CustomText>
          </View>
          <View style={styles.timeContainer}>
            <Icon name="clock-outline" size={16} color="#666" />
            <CustomText style={styles.timeText}>
              Last updated: {formatDate(item.last_ping)}
            </CustomText>
          </View>
        </View>
        
        <View style={styles.trackerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Map', { tracker: item })}>
            <Icon name="map" size={20} color="#6C63FF" />
            <CustomText style={styles.actionText}>Locate</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Sound alert functionality */}}>
            <Icon name="bell-ring" size={20} color="#6C63FF" />
            <CustomText style={styles.actionText}>Alert</CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('TrackerSettings', { tracker: item })}>
            <Icon name="cog" size={20} color="#6C63FF" />
            <CustomText style={styles.actionText}>Settings</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render placeholder when no trackers are found
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="radar-off" size={60} color="#ccc" />
      <CustomText style={styles.emptyTitle}>No trackers found</CustomText>
      <CustomText style={styles.emptyText}>
        {searchQuery 
          ? "Try a different search term or filter" 
          : "Add your first tracker to start tracking your important items"}
      </CustomText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { paddingBottom: tabBarHeight }]}>
      
      <View style={styles.container}>
        <View style={styles.header}>
          <CustomText style={styles.headerTitle}>Your Trackers</CustomText>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('AddTracker')}>
            <Icon name="plus" size={22} color="#6C63FF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trackers by name or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <FilterOptions />

        <FlatList
          data={filteredTrackers}
          renderItem={renderTrackerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Manrope-Medium',
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    padding: 6,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  filterButtonActive: {
    backgroundColor: '#6C63FF',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    paddingBottom: 16,
  },
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
  },
  trackerColorBand: {
    width: 6,
    height: '100%',
  },
  trackerContent: {
    flex: 1,
    padding: 16,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackerTitleSection: {
    flex: 1,
  },
  trackerName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  trackerId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginTop: 2,
  },
  trackerStatusSection: {
    alignItems: 'flex-end',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  batteryText: {
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
  trackerDetails: {
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-Medium',
    marginLeft: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 6,
  },
  trackerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
  },
});

export default TrackerScreen;