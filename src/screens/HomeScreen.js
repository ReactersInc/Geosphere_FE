import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LocationTracker from '../component/LocationTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GeofenceCard from '../component/GeofenceCard';
import { useGeofenceRequests, useGeofenceRequestActions } from '../hooks/useGeofenceRequests';
import { UseApi } from '../hooks/UseApi';
import WebSocketService from '../service/WebSocketService';
import LocationTrackingService from '../service/LocationTrackingService';
// import ApiClient from '../service/ApiClient';

// Get device dimensions
const { height, width } = Dimensions.get('window');

// Dummy data for the application
const DUMMY_USER = {
  firstName: 'John',
  lastName: 'Doe',
  profilePic: 'https://randomuser.me/api/portraits/men/32.jpg'
};

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
    color: ['#6C63FF', '#5046e5']
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
    color: ['#FF6B6B', '#FF4785']
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
    color: ['#4CAF50', '#2E7D32']
  }
];

// Dummy data for requests
const DUMMY_REQUESTS = [
  {
    id: '1',
    type: 'connection',
    from: {
      id: '101',
      name: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      avatar: null
    },
    status: 'pending',
    timestamp: '2025-05-08T14:32:11Z',
    message: 'Hi John, I would like to connect with you on GeoTrack.'
  },
  {
    id: '2',
    type: 'geofence',
    from: {
      id: '102',
      name: 'Sophia Williams',
      email: 'sophia.w@example.com',
      avatar: null
    },
    geofence: {
      id: '201',
      name: 'Downtown Safety Zone',
      radius: 250,
      color: ['#FF9800', '#F57C00']
    },
    status: 'pending',
    timestamp: '2025-05-09T10:15:20Z',
    message: 'I\'ve added you to my Downtown Safety Zone geofence for our meetup this weekend.'
  },
  {
    id: '3',
    type: 'connection',
    from: {
      id: '103',
      name: 'Daniel Kim',
      email: 'daniel.kim@example.com',
      avatar: null
    },
    status: 'pending',
    timestamp: '2025-05-07T09:45:33Z',
    message: 'Hey, let\'s connect on GeoTrack to share our locations during the hiking trip.'
  }
];

const DUMMY_PEOPLE = [
  {
    id: '1',
    name: 'Sarah Johnson',
    relationship: 'Family',
    last_seen: '2025-04-11T08:45:23Z',
    avatar: null,
  },
  {
    id: '2',
    name: 'Michael Chen',
    relationship: 'Friend',
    last_seen: '2025-04-11T09:30:15Z',
    avatar: null,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    relationship: 'Family',
    last_seen: '2025-04-10T22:12:05Z',
    avatar: null,
  },
  {
    id: '4',
    name: 'Robert Garcia',
    relationship: 'Colleague',
    last_seen: '2025-04-11T07:55:18Z',
    avatar: null,
  },
  {
    id: '5',
    name: 'Lisa Taylor',
    relationship: 'Friend',
    last_seen: '2025-04-10T20:40:33Z',
    avatar: null,
  }
];

const DUMMY_TRACKERS = [
  {
    id: '1',
    name: 'Personal Tracker',
    device_id: 'PT-2873',
    battery: 85,
    active: true,
    last_ping: '2025-04-11T09:55:12Z'
  },
  {
    id: '2',
    name: 'Keychain Tracker',
    device_id: 'KT-9621',
    battery: 62,
    active: true,
    last_ping: '2025-04-11T08:30:45Z'
  },
  {
    id: '3',
    name: 'Backpack Tag',
    device_id: 'BT-4517',
    battery: 24,
    active: false,
    last_ping: '2025-04-10T17:15:22Z'
  }
];

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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useUser();
  const api = UseApi();

  useEffect(() => {
    if (user && token) {
      // Initialize location tracking service
      LocationTrackingService.initialize(api, user);
      
      // Connect to WebSocket
      WebSocketService.connect(token, user.userId);
    }

    return () => {
      // Cleanup on unmount
      LocationTrackingService.stopLocationTracking();
      WebSocketService.disconnect();
    };
  }, [user, token]);
  // const [pendingRequests, setPendingRequests] = useState(DUMMY_REQUESTS);


  


  
  const tabBarHeight = useBottomTabBarHeight();


 

   const { 
    requests: geofenceRequests, 
    loading: requestsLoading, 
    refetch: refetchRequests 
  } = useGeofenceRequests();
  
  const [pendingRequests, setPendingRequests] = useState([]);

  // Set greeting based on time of day
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting('Good Morning,');
    } else if (currentHour < 18) {
      setGreeting('Good Afternoon,');
    } else {
      setGreeting('Good Evening,');
    }
  }, []);

   useEffect(() => {
    if (geofenceRequests && geofenceRequests.length > 0) {
      const transformedRequests = geofenceRequests.map(req => ({
        id: req.id.toString(),
        type: 'geofence',
        from: {
          id: req.creator.id.toString(),
          name: `${req.creator.firstName} ${req.creator.lastName}`,
          email: req.creator.email,
          avatar: req.creator.photo
        },
        geofence: {
          id: req.geofenceResponse.id.toString(),
          name: req.geofenceResponse.name,
          description: req.geofenceResponse.description,
          createdAt: req.geofenceResponse.createdAt,
          radius: 250, // Default value
          color: ['#FF9800', '#F57C00'] // Default colors
        },
        status: req.responseStatus === 5 ? 'pending' : 'accepted',
        timestamp: req.geofenceResponse.createdAt,
        message: req.geofenceResponse.description || 'You have been invited to join this geofence.'
      }));
      
      setPendingRequests(transformedRequests);
    } else {
      setPendingRequests([]);
    }
  }, [geofenceRequests]);

  // Simulate refresh action
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  // Component for rendering geofence cards
  const GeofenceSection = () => {
    // Get the latest 4 geofences
    const latestGeofences = [...DUMMY_GEOFENCES]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);

    return (
      <View style={styles.geofenceSection}>
        {/* <LocationTracker token={token} userId={user?.userId}/> */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {latestGeofences.map((geofence) => (
            <GeofenceCard
              key={geofence.id}
              geofence={geofence}
              variant="compact"
              onPress={() => navigation.navigate('GeoZone', { geofence })}
              style={styles.geofenceCard}
            />
          ))}
          <GeofenceCard
            variant="add"
            onPress={() => navigation.navigate('CreateGeofenceScreen')}
            style={styles.addGeofenceCard}
          />
        </ScrollView>
      </View>
    );
  };

  // Component for people section
  const PeopleSection = () => {
    return (
      <View style={styles.peopleSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DUMMY_PEOPLE.map((person, index) => {
            // Generate consistent colors based on person name
            const charCode = person.name.charCodeAt(0);
            const hue = (charCode * 15) % 360;
            const personColor = `hsl(${hue}, 70%, 60%)`;
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.personItem}
                onPress={() => navigation.navigate('PersonDetails', { person })}>
                <View style={[styles.personCircle, { backgroundColor: personColor }]}>
                  <CustomText style={styles.personInitial}>{person.name.charAt(0).toUpperCase()}</CustomText>
                </View>
                <CustomText style={styles.personName} numberOfLines={1}>
                  {person.name}
                </CustomText>
                {person.last_seen && (
                  <View style={styles.lastSeenContainer}>
                    <Icon name="clock-outline" size={10} color="#666" />
                    <CustomText style={styles.lastSeenText}>
                      {new Date(person.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </CustomText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity 
            style={styles.personItem}
            onPress={() => navigation.navigate('UserDiscoveryScreen')}>
            <View style={[styles.personCircle, { backgroundColor: '#e0e0e0' }]}>
              <Icon name="plus" size={24} color="#6C63FF" />
            </View>
            <CustomText style={styles.personName}>Add New</CustomText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // Component for trackers section
  const TrackersSection = () => {
    return (
      <View style={styles.trackersSection}>
        {DUMMY_TRACKERS.map((tracker, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trackerCard}
            onPress={() => navigation.navigate('TrackerDetails', { tracker })}>
            <View style={styles.trackerInfo}>
              <View style={styles.trackerIconContainer}>
                <LinearGradient
                  colors={tracker.active ? ['#6C63FF', '#5046e5'] : ['#9e9e9e', '#757575']}
                  style={styles.trackerIconBackground}>
                  <Icon name="radar" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.trackerDetails}>
                <CustomText style={styles.trackerName}>{tracker.name}</CustomText>
                <CustomText style={styles.trackerDeviceId}>ID: {tracker.device_id}</CustomText>
              </View>
            </View>
            <View style={styles.trackerStatus}>
              <View style={styles.batteryContainer}>
                <Icon 
                  name={getBatteryIcon(tracker.battery)} 
                  size={16} 
                  color={getBatteryColor(tracker.battery)} 
                />
                <CustomText style={[styles.batteryText, { color: getBatteryColor(tracker.battery) }]}>
                  {tracker.battery}%
                </CustomText>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: tracker.active ? '#4CAF50' : '#FF9800' }]} />
                <CustomText style={styles.trackerStatusText}>
                  {tracker.active ? 'Active' : 'Inactive'}
                </CustomText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addTrackerCard}
          onPress={() => navigation.navigate('AddTracker')}>
          <Icon name="plus-circle-outline" size={24} color="#6C63FF" />
          <CustomText style={styles.addTrackerText}>Add New Tracker</CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  // Component for pending requests section
   const RequestsSection = () => {
    if (pendingRequests.length === 0) {
      return (
        <View style={styles.noRequestsContainer}>
          {requestsLoading ? (
            <>
              <Icon name="loading" size={36} color="#6C63FF" />
              <CustomText style={styles.noRequestsText}>Loading requests...</CustomText>
            </>
          ) : (
            <>
              <Icon name="check-circle-outline" size={36} color="#8BC34A" />
              <CustomText style={styles.noRequestsText}>No pending requests</CustomText>
            </>
          )}
        </View>
      );
    }

     return (
      <View style={styles.requestsSection}>
        {pendingRequests.slice(0, 2).map((request, index) => (
          <TouchableOpacity
            key={request.id}
            style={styles.requestCard}
            onPress={() => navigation.navigate('RequestDetailsScreen', { request })}>
            <View style={styles.requestInfo}>
              <View style={[styles.requestIconContainer, { 
                backgroundColor: request.type === 'connection' ? '#6C63FF' : '#FF9800'
              }]}>
                <Icon 
                  name={request.type === 'connection' ? 'account-plus' : 'map-marker-radius'} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View style={styles.requestDetails}>
                <CustomText style={styles.requestTitle}>
                  {request.type === 'connection' ? 'Connection Request' : 'Geofence Permission'}
                </CustomText>
                <CustomText style={styles.requestFrom} numberOfLines={1}>
                  From: {request.from.name}
                </CustomText>
              </View>
            </View>
            <View style={styles.requestTimeContainer}>
              <Icon name="clock-outline" size={12} color="#666" />
              <CustomText style={styles.requestTime}>
                {new Date(request.timestamp).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                })}
              </CustomText>
            </View>
          </TouchableOpacity>
        ))}
        {pendingRequests.length > 2 && (
          <TouchableOpacity
            style={styles.moreRequestsButton}
            onPress={() => navigation.navigate('AllRequestsScreen')}>
            <CustomText style={styles.moreRequestsText}>
              View {pendingRequests.length - 2} more requests
            </CustomText>
            <Icon name="chevron-right" size={16} color="#6C63FF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
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

  // Section component with title and content
  const Section = ({ title, children, onSeeAllPress }) => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <CustomText style={styles.sectionTitle}>{title}</CustomText>
          {onSeeAllPress && (
            <TouchableOpacity onPress={onSeeAllPress}>
              <CustomText style={styles.seeAll}>See all</CustomText>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };

  const sections = [
    {
      id: '0',
      title: 'Pending Requests',
      content: <RequestsSection />,
      onSeeAllPress: pendingRequests.length > 0 ? () => navigation.navigate('AllRequestsScreen') : null,
    },
    {
      id: '1',
      title: 'Your Geofences',
      content: <GeofenceSection />,
      onSeeAllPress: () => navigation.navigate('Geofences'),
    },
    {
      id: '2',
      title: 'People',
      content: <PeopleSection />,
      onSeeAllPress: () => navigation.navigate('People'),
    },
    {
      id: '3',
      title: 'Trackers',
      content: <TrackersSection />,
      onSeeAllPress: () => navigation.navigate('Trackers'),
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, {
      paddingBottom: tabBarHeight, // Add padding at the bottom to avoid overlap with the tab bar
    }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <CustomText style={styles.greeting}>{greeting}</CustomText>
            <CustomText style={styles.name}>{`${DUMMY_USER.firstName} ${DUMMY_USER.lastName}`}</CustomText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('AllRequests')}>
              <Icon name="bell" size={22} color="#6C63FF" />
              {pendingRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  {pendingRequests.length > 9 ? (
                    <CustomText style={styles.badgeText}>9+</CustomText>
                  ) : pendingRequests.length > 0 ? (
                    <CustomText style={styles.badgeText}>{pendingRequests.length}</CustomText>
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}>
              <Image 
                source={{ uri: DUMMY_USER.profilePic }} 
                style={styles.profileImage} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activitySummaryContainer}>
          <TouchableOpacity 
            style={styles.activitySummary}
            onPress={() => navigation.navigate('GeofenceActivity')}>
            <LinearGradient
              colors={['rgba(108, 99, 255, 0.8)', 'rgba(80, 70, 229, 0.9)']}
              style={styles.activityGradient}>
              <View style={styles.activityContent}>
                <View style={styles.activityIconContainer}>
                  <Icon name="map-marker-path" size={24} color="#fff" />
                </View>
                <View style={styles.activityTextContainer}>
                  <CustomText style={styles.activityTitle}>Geofence Activity</CustomText>
                  <CustomText style={styles.activitySubtitle}>
                    {DUMMY_GEOFENCES.filter(g => g.active).length} active zones • 12 events today
                  </CustomText>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sections}
          renderItem={({ item }) => (
            <Section
              title={item.title}
              onSeeAllPress={item.onSeeAllPress}>
              {item.content}
            </Section>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
 // All your existing styles...
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 16,
    paddingBottom: 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 8,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manrope-SemiBold',
  },
  name: {
    fontSize: 24,
    color: '#333',
    fontFamily: 'Manrope-Bold',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4785',
    borderWidth: 1,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  activitySummaryContainer: {
    marginBottom: 16,
  },
  activitySummary: {
    height: 70,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  activityGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
  },
  activitySubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: 'Manrope-Medium',
    marginTop: 2,
  },
  list: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  // Geofence section styles
  geofenceSection: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  geofenceCard: {
    marginRight: 12,
  },
  addGeofenceCard: {
    marginRight: 16,
  },
  // People section styles
  peopleSection: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  personItem: {
    alignItems: 'center',
    marginRight: 18,
    width: 70,
  },
  personCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  lastSeenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  lastSeenText: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 2,
  },
  // Trackers section styles
  trackersSection: {
    marginTop: 4,
  },
  trackerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  trackerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackerIconContainer: {
    marginRight: 12,
  },
  trackerIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerDetails: {
    flex: 1,
  },
  trackerName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  trackerDeviceId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginTop: 2,
  },
  trackerStatus: {
    alignItems: 'flex-end',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  batteryText: {
    fontSize: 12,
    fontFamily: 'Manrope-Medium',
    marginLeft: 4,
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
  trackerStatusText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
  },
  addTrackerCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addTrackerText: {
    color: '#6C63FF',
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 8,
  },
  // Requests section styles
  requestsSection: {
    marginTop: 4,
  },
  requestCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  requestFrom: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginTop: 2,
  },
  requestTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTime: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 4,
  },
  moreRequestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F2F5',
    padding: 12,
    borderRadius: 12,
  },
  moreRequestsText: {
    fontSize: 13,
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
    marginRight: 4,
  },
  noRequestsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noRequestsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Medium',
    marginTop: 8,
  },
});

export default HomeScreen;
