import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

// Get device dimensions
const { height, width } = Dimensions.get('window');

// Dummy data for people (using the same data from HomeScreen)
const DUMMY_PEOPLE = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Family',
    last_seen: '2025-04-11T08:45:23Z',
    avatar: null,
    location: 'Home Area',
    status: 'Inside geofence',
    notifications: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    relationship: 'Friend',
    last_seen: '2025-04-11T09:30:15Z',
    avatar: null,
    location: 'Downtown',
    status: 'Moving',
    notifications: true,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    relationship: 'Family',
    last_seen: '2025-04-10T22:12:05Z',
    avatar: null,
    location: 'Office Zone',
    status: 'Inside geofence',
    notifications: true,
  },
  {
    id: '4',
    name: 'Robert Garcia',
    relationship: 'Colleague',
    last_seen: '2025-04-11T07:55:18Z',
    avatar: null,
    location: 'Unknown',
    status: 'Offline for 2h',
    notifications: false,
  },
  {
    id: '5',
    name: 'Lisa Taylor',
    relationship: 'Friend',
    last_seen: '2025-04-10T20:40:33Z',
    avatar: null,
    location: 'Park Safety Zone',
    status: 'Inside geofence',
    notifications: true,
  },
  {
    id: '6',
    name: 'David Rodriguez',
    relationship: 'Family',
    last_seen: '2025-04-11T10:15:45Z',
    avatar: null,
    location: 'School',
    status: 'Inside geofence',
    notifications: true,
  },
  {
    id: '7',
    name: 'Jessica Kim',
    relationship: 'Friend',
    last_seen: '2025-04-11T09:20:30Z',
    avatar: null,
    location: 'Grocery Store',
    status: 'Outside geofence',
    notifications: true,
  }
];

// Define relationship types for filtering
const RELATIONSHIP_TYPES = ['All', 'Family', 'Friend', 'Colleague', 'Other'];

const PeopleScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedRelationship, setSelectedRelationship] = useState('All');
  const [filteredPeople, setFilteredPeople] = useState(DUMMY_PEOPLE);
  const { user } = useUser();

  const tabBarHeight = useBottomTabBarHeight();


  // Apply search and filter
  useEffect(() => {
    let result = DUMMY_PEOPLE;
    
    // Apply search filter
    if (searchText) {
      result = result.filter(person => 
        person.name.toLowerCase().includes(searchText.toLowerCase()) ||
        person.relationship.toLowerCase().includes(searchText.toLowerCase()) ||
        person.location.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Apply relationship filter
    if (selectedRelationship !== 'All') {
      result = result.filter(person => person.relationship === selectedRelationship);
    }
    
    setFilteredPeople(result);
  }, [searchText, selectedRelationship]);

  // Generate consistent avatar colors based on person name
  const getPersonColor = (name) => {
    const charCode = name.charCodeAt(0);
    const hue = (charCode * 15) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Render relationship filter chips
  const renderRelationshipFilters = () => {
    return (
      <View style={styles.filterContainer}>
        <FlatList
          data={RELATIONSHIP_TYPES}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedRelationship === item && styles.filterChipSelected
              ]}
              onPress={() => setSelectedRelationship(item)}>
              <CustomText
                style={[
                  styles.filterChipText,
                  selectedRelationship === item && styles.filterChipTextSelected
                ]}>
                {item}
              </CustomText>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          contentContainerStyle={styles.filterList}
        />
      </View>
    );
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Render a person item
  const renderPersonItem = ({ item }) => {
    const personColor = getPersonColor(item.name);
    
    return (
      <TouchableOpacity
        style={styles.personCard}
        onPress={() => navigation.navigate('PersonDetails', { person: item })}>
        <View style={styles.personInfo}>
          <View style={[styles.personAvatar, { backgroundColor: personColor }]}>
            <CustomText style={styles.personInitial}>
              {item.name.charAt(0).toUpperCase()}
            </CustomText>
          </View>
          <View style={styles.personDetails}>
            <View style={styles.personNameRow}>
              <CustomText style={styles.personName}>{item.name}</CustomText>
              {item.notifications && (
                <Icon name="bell" size={14} color="#6C63FF" style={styles.notificationIcon} />
              )}
            </View>
            <CustomText style={styles.personRelationship}>{item.relationship}</CustomText>
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={14} color="#666" />
              <CustomText style={styles.locationText}>{item.location}</CustomText>
            </View>
          </View>
        </View>
        <View style={styles.personStatus}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: item.status.includes('Inside') ? '#4CAF50' : 
                               item.status.includes('Moving') ? '#FF9800' : '#9E9E9E' }
            ]} />
            <CustomText style={styles.statusText}>{item.status}</CustomText>
          </View>
          <CustomText style={styles.lastSeenText}>
            {getRelativeTime(item.last_seen)}
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea,{
      paddingBottom: tabBarHeight , // Adjust padding to avoid overlap with tab bar
    
    }]}>
      
      <View style={styles.container}>
        <View style={styles.header}>
         
          <CustomText style={styles.screenTitle}>People</CustomText>
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => navigation.navigate('PeopleSettings')}>
            <Icon name="dots-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Icon name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {renderRelationshipFilters()}

        <View style={styles.peopleStatsContainer}>
          <View style={styles.statItem}>
            <CustomText style={styles.statNumber}>{filteredPeople.length}</CustomText>
            <CustomText style={styles.statLabel}>People</CustomText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CustomText style={styles.statNumber}>
              {filteredPeople.filter(p => p.status.includes('Inside')).length}
            </CustomText>
            <CustomText style={styles.statLabel}>In Geofences</CustomText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CustomText style={styles.statNumber}>
              {filteredPeople.filter(p => !p.status.includes('Inside') && !p.status.includes('Offline')).length}
            </CustomText>
            <CustomText style={styles.statLabel}>On the Move</CustomText>
          </View>
        </View>

        <FlatList
          data={filteredPeople}
          renderItem={renderPersonItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.peopleList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="account-search" size={64} color="#ccc" />
              <CustomText style={styles.emptyText}>No people found</CustomText>
              <CustomText style={styles.emptySubText}>
                Try adjusting your search or filters
              </CustomText>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPerson')}>
          <LinearGradient
            colors={['#6C63FF', '#5046e5']}
            style={styles.addButtonGradient}>
            <Icon name="plus" size={24} color="#fff" />
          </LinearGradient>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 4,
  },
  screenTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  optionsButton: {
    padding: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-Medium',
    padding: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterChipSelected: {
    backgroundColor: '#6C63FF',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  peopleStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  peopleList: {
    // paddingBottom: 80,
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  personAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personInitial: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Manrope-Bold',
  },
  personDetails: {
    flex: 1,
  },
  personNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
    marginRight: 4,
  },
  notificationIcon: {
    marginLeft: 4,
  },
  personRelationship: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 4,
  },
  personStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
  },
  lastSeenText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Manrope-Regular',
    marginTop: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Manrope-SemiBold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Manrope-Regular',
    marginTop: 8,
  },
});

export default PeopleScreen;