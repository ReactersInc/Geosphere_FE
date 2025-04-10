import React, { useEffect, useState, useCallback } from 'react';
import {
  RefreshControl,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
// import PushNotification from 'react-native-push-notification';
// import { requestPermissions } from '../utils/permissions';
import { API_BASE_URL } from '../config/constant';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'expo-linear-gradient';
import CustomText from '../component/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Get device dimensions
const { height, width } = Dimensions.get('window');

// Define the Geofence type
const HomeScreen = () => {
  const navigation = useNavigation();

  // State variables
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [latestGeofence, setLatestGeofence] = useState(null);
  const [recentPeople, setRecentPeople] = useState([]);
  const [trackers, setTrackers] = useState([]);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Refresh data
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchGeofences(),
      fetchPeople(),
      fetchTrackers(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [userId]);

  // Get user data from AsyncStorage
  const getUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const storedUserId = await AsyncStorage.getItem('userId');
      if (storedUser && storedUserId) {
        setUser(storedUser?.toUpperCase());
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Set greeting based on time of day
  const setGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning,');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon,');
    } else {
      setGreeting('Good Evening,');
    }
  };



  // Update user location in database
  const updateLocationInPeopleTable = async (latitude, longitude) => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/peoples/update_location/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: latitude,
          lon: longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update location: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Fetch geofences data
  const fetchGeofences = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/geofence/geofence_creator_details?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch geofences: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.length > 0) {
        const sortedData = data.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setLatestGeofence(sortedData[0]);
      }
    } catch (error) {
      console.error('Error fetching geofences:', error);
    }
  };

  // Fetch people data
  const fetchPeople = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/peoples?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch people: ${response.statusText}`);
      }
      
      const data = await response.json();
      setRecentPeople(data.slice(0, 5)); // Only show 5 most recent people
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  // Fetch trackers data
  const fetchTrackers = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/trackers?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trackers: ${response.statusText}`);
      }
      
      const data = await response.json();
      setTrackers(data.slice(0, 3)); // Only show 3 most recent trackers
    } catch (error) {
      console.error('Error fetching trackers:', error);
    }
  };

  // Set up location tracking
  useEffect(() => {
    if (!userId) return;
    
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        updateLocationInPeopleTable(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      }
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, [userId]);

  // Initial setup
  useEffect(() => {
    setGreetingMessage();
    getUserData();
  }, []);

  // Refresh data when userId changes or screen is focused
  useEffect(() => {
    if (userId) {
      
      onRefresh();
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        onRefresh();
      }
      return () => {};
    }, [userId])
  );

  // Section component
  const Section = ({ title, type, data, onPress }) => {
    const renderContent = () => {
      switch (type) {
        case 'geofence':
          return latestGeofence ? (
            <TouchableOpacity
              style={styles.geofenceCard}
              onPress={() => navigation.navigate('GeoZone', { geofence: latestGeofence })}>
              <LinearGradient
                colors={['#6C63FF', '#5046e5']}
                style={styles.gradientCard}>
                <View style={styles.cardHeader}>
                  <Icon name="map-marker-radius" size={22} color="#fff" />
                  <CustomText style={styles.geofenceName}>{latestGeofence.geofence_name}</CustomText>
                </View>
                <CustomText style={styles.geofenceDetails}>
                  Created: {formatDate(latestGeofence.created_at)}
                </CustomText>
                <View style={styles.geofenceFooter}>
                  <View style={styles.statusBadge}>
                    <CustomText style={styles.statusText}>Active</CustomText>
                  </View>
                  <CustomText style={styles.viewDetailsText}>View Details</CustomText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => navigation.navigate('CreateGeofence')}>
              <Icon name="plus-circle-outline" size={36} color="#6C63FF" />
              <CustomText style={styles.emptyCardText}>Create a new geofence</CustomText>
            </TouchableOpacity>
          );
        case 'people':
          return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.circleContainer}>
                {recentPeople.length > 0 ? (
                  recentPeople.map((person, index) => (
                    <View key={index} style={styles.personItem}>
                      <View style={styles.personCircle}>
                        <CustomText style={styles.personInitial}>
                          {person.name ? person.name.charAt(0).toUpperCase() : '?'}
                        </CustomText>
                      </View>
                      <CustomText style={styles.personName} numberOfLines={1}>
                        {person.name || 'Unknown'}
                      </CustomText>
                    </View>
                  ))
                ) : (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <View key={index} style={styles.personItem}>
                        <View style={styles.personCircle}>
                          <Icon name="account-question" size={20} color="#fff" />
                        </View>
                        <CustomText style={styles.personName}>Add Person</CustomText>
                      </View>
                    ))}
                  </>
                )}
              </View>
            </ScrollView>
          );
        case 'trackers':
          return (
            <View style={styles.trackerContainer}>
              {trackers.length > 0 ? (
                trackers.map((tracker, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.trackerCard}
                    onPress={() => navigation.navigate('TrackerDetails', { tracker })}>
                    <View style={styles.trackerInfo}>
                      <Icon name="radar" size={20} color="#6C63FF" />
                      <CustomText style={styles.trackerName}>{tracker.name || 'Tracker'}</CustomText>
                    </View>
                    <View style={styles.trackerStatus}>
                      <View style={[styles.statusIndicator, { backgroundColor: tracker.active ? '#4CAF50' : '#FF9800' }]} />
                      <CustomText style={styles.trackerStatusText}>
                        {tracker.active ? 'Active' : 'Inactive'}
                      </CustomText>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity
                  style={styles.emptyCard}
                  onPress={() => navigation.navigate('CreateTracker')}>
                  <Icon name="plus-circle-outline" size={36} color="#6C63FF" />
                  <CustomText style={styles.emptyCardText}>Add a new tracker</CustomText>
                </TouchableOpacity>
              )}
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>{title}</CustomText>
          <TouchableOpacity onPress={onPress}>
            <CustomText style={styles.seeAll}>See all</CustomText>
          </TouchableOpacity>
        </View>
        <View style={styles.sectionContent}>{renderContent()}</View>
      </View>
    );
  };

  const sections = [
    {
      id: '1',
      title: 'Your Geofences',
      type: 'geofence',
      onPress: () => navigation.navigate('Geofences'),
    },
    {
      id: '2',
      title: 'People',
      type: 'people',
      onPress: () => navigation.navigate('People'),
    },
    {
      id: '3',
      title: 'Trackers',
      type: 'trackers',
      onPress: () => navigation.navigate('Trackers'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#EEF3F5" barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <CustomText style={styles.greeting}>{greeting}</CustomText>
            <CustomText style={styles.name}>{user}</CustomText>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Alerts')}>
              <Icon name="bell" size={24} color="#6C63FF" />
              {/* Notification badge would go here if needed */}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings')}>
              <Icon name="cog" size={24} color="#6C63FF" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <Section
              title={item.title}
              type={item.type}
              onPress={item.onPress}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6C63FF']}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF3F5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  name: {
    fontSize: 20,
    color: '#6C63FF',
    fontFamily: 'Manrope-Bold',
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  list: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
  },
  sectionContent: {
    borderRadius: 12,
  },
  gradientCard: {
    padding: 16,
    borderRadius: 12,
    height: '100%',
  },
  geofenceCard: {
    height: 130,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  geofenceName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Manrope-Bold',
    marginLeft: 8,
  },
  geofenceDetails: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Manrope-Regular',
    opacity: 0.9,
  },
  geofenceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Manrope-SemiBold',
  },
  viewDetailsText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
  },
  emptyCard: {
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyCardText: {
    marginTop: 8,
    color: '#6C63FF',
    fontSize: 16,
    fontFamily: 'Manrope-SemiBold',
  },
  circleContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  personItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 70,
  },
  personCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  personInitial: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
  },
  personName: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    fontFamily: 'Manrope-Medium',
    textAlign: 'center',
  },
  trackerContainer: {
    marginTop: 8,
  },
  trackerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  trackerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackerName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 10,
  },
  trackerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  trackerStatusText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Medium',
  },
});

export default HomeScreen;