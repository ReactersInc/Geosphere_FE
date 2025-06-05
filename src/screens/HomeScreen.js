import React, { useState, useEffect, useContext, useCallback } from "react";
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
  RefreshControl,
  ActivityIndicator,
  PermissionsAndroid,
  Alert,
  Linking,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../component/CustomText";
import { useUser } from "../context/userContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import LocationTracker from "../component/LocationTracker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GeofenceCard from "../component/GeofenceCard";
import {
  useGeofenceRequests,
  useGeofenceRequestActions,
} from "../hooks/useGeofenceRequests";
import { UseApi } from "../hooks/UseApi";
import WebSocketService from "../service/WebSocketService";
import LocationTrackingService from "../service/LocationTrackingService";
import { transformGeofenceData } from "../../utils/transformGeofenceData";
import { useProfile } from "../context/ProfileContext";
import LocationPermissionService from "../service/LocationPermissionService";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { useToast } from "../component/ToastProvider";
import { useConfirmation } from "../component/ConfirmationProvider";

// Get device dimensions
const { height, width } = Dimensions.get("window");

// Dummy data for the application (keeping only user profile pic)
const DUMMY_USER = {
  firstName: "John",
  lastName: "Doe",
  profilePic: "https://randomuser.me/api/portraits/men/32.jpg",
};

// Format date for display
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [greeting, setGreeting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const { user, token } = useUser();
  const api = UseApi();
  const { get, post } = api;
  const { profile, profileLoading, profileError, refreshProfile } =
    useProfile();

  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();

  // New state for geofences
  const [geofences, setGeofences] = useState([]);
  const [geofencesLoading, setGeofencesLoading] = useState(false);

  // New state for people/contacts
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // New state for user data and active geofences
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [myDevices, setMyDevices] = useState([]);

  const tabBarHeight = useBottomTabBarHeight();
  const [requests, setRequests]= useState([]);

  // const {
  //   requests: geofenceRequests,
  //   loading: requestsLoading,
  //   refetch: refetchRequests,
  // } = useGeofenceRequests();


  const fetchGeofenceRequests = async (page = 0, size = 10) => {
    try {
      setRequestsLoading(true);
      const result = await api.get(`/geofence/get-geofence-request?page=${page}&size=${size}`);
      
      if (result.result.responseCode === 200) {
        setRequests(result.data.list);
        setPagination({
          page: result.data.page,
          size: result.data.size,
          totalElements: result.data.totalElements,
          totalPages: result.data.totalPages
        });
      } else {

        setError('Failed to fetch requests');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setRequestsLoading(false);
    }
  };

  const [pendingRequests, setPendingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  console.log("the geofence requests are", requests);

  // Fetch contacts function
  const fetchContacts = async () => {
    try {
      setContactsLoading(true);
      const response = await get("/contacts/all");

      if (response?.data?.list) {
        // Sort by ID and take latest 5
        const sortedContacts = response.data.list
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setContacts(sortedContacts);
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  // Fetch user data function
  const fetchUserData = async () => {
    try {
      setUserDataLoading(true);
      const response = await get("/user");

      if (response?.data) {
        setUserData(response.data);

        // Extract latest 2 geofences for "My Devices" section
        if (response.data.userGeofenceDetails?.inWitchGeofence) {
          const latestDevices =
            response.data.userGeofenceDetails.inWitchGeofence
              .sort((a, b) => b.geofenceId - a.geofenceId)
              .slice(0, 2);
          setMyDevices(latestDevices);
        }
      } else {
        setUserData(null);
        setMyDevices([]);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserData(null);
      setMyDevices([]);
    } finally {
      setUserDataLoading(false);
    }
  };

  // Fetch geofences function
  const fetchGeofences = async () => {
    try {
      setGeofencesLoading(true);
      const response = await get("/geofence?page=0&pageSize=4&sortOrder=DESC");

      if (response?.data?.list) {
        const transformedData = transformGeofenceData(response.data.list);
        setGeofences(transformedData);
      } else {
        setGeofences([]);
      }
    } catch (error) {
      console.error("Failed to fetch geofences:", error);
      setGeofences([]);
    } finally {
      setGeofencesLoading(false);
    }
  };

  console.log(
    "the location tracking ran------------------------------------------"
  );
  // In the checkAndStartTracking function, update the showConfirmation calls:

  const checkAndStartTracking = async () => {
    try {
      console.log("🔄 Starting location permission check...");

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      console.log("Location services enabled:", isLocationEnabled);

      if (!isLocationEnabled) {
        showConfirmation({
          title: "Location Services Disabled",
          message: "Please enable location services to use this feature.",
          buttons: [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            {
              text: "Cancel",
              onPress: () => {
                showToast({
                  message: "Location services prompt cancelled",
                  type: "warning",
                  position: "top",
                  icon: "alert-circle",
                });
                console.warn("User cancelled location services prompt");
              },
            },
          ],
          icon: "map-marker-off",
        });
        return;
      }

      let permissionGranted = false;

      if (Platform.OS === "android") {
        console.log("📱 Checking Android permissions...");

        // Check fine location permission
        const fineLocationGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        console.log("Fine location already granted:", fineLocationGranted);

        if (!fineLocationGranted) {
          console.log("🔐 Requesting fine location permission...");
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission Required",
              message:
                "This app needs access to your location to track your movements and send geofence notifications.",
              buttonPositive: "Grant Permission",
              buttonNegative: "Deny",
            }
          );

          console.log("Fine location permission result:", granted);

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            showConfirmation({
              title: "Permission Required",
              message:
                "Location permission is required for this app to work properly.",
              buttons: [
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
                {
                  text: "Cancel",
                  onPress: () => {
                    showToast({
                      message: "Location permission prompt cancelled",
                      type: "warning",
                      position: "top",
                      icon: "alert-circle",
                    });
                    console.warn("User cancelled location permission prompt");
                  },
                },
              ],
              icon: "alert-circle-outline",
            });
            return;
          }
        }

        // For Android 10+ (API 29), handle background location
        if (Platform.Version >= 29) {
          const backgroundGranted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
          );

          console.log(
            "Background location already granted:",
            backgroundGranted
          );

          if (!backgroundGranted) {
            showConfirmation({
              title: "Background Location Required",
              message:
                "To track your location when the app is closed, please allow 'Allow all the time' in the next permission dialog. This is required for geofence notifications.",
              buttons: [
                {
                  text: "Continue",
                  onPress: async () => {
                    const bgGranted = await PermissionsAndroid.request(
                      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                      {
                        title: "Background Location Permission",
                        message:
                          "Allow location access all the time for continuous geofence tracking.",
                        buttonPositive: "Allow all the time",
                        buttonNegative: "Deny",
                      }
                    );
                    console.log(
                      "Background location permission result:",
                      bgGranted
                    );
                    if (bgGranted === PermissionsAndroid.RESULTS.GRANTED) {
                      permissionGranted = true;
                      startLocationServices();
                    } else {
                      showConfirmation({
                        title: "Limited Functionality",
                        message:
                          "Without background location access, geofence tracking will only work when the app is open. You can enable it later in Settings > Apps > [Your App] > Permissions > Location.",
                        buttons: [
                          {
                            text: "Open Settings",
                            onPress: () => Linking.openSettings(),
                          },
                          {
                            text: "Continue Anyway",
                            onPress: () => startLocationServices(),
                          },
                        ],
                        icon: "alert-outline",
                      });
                    }
                  },
                },
                {
                  text: "Cancel",
                  onPress: () => {
                    showToast({
                      message: "Background location permission cancelled",
                      type: "warning",
                      position: "top",
                      icon: "alert-circle",
                    });
                  },
                },
              ],
              icon: "map-marker-radius",
            });
            return;
          } else {
            permissionGranted = true;
          }
        } else {
          permissionGranted = true;
        }
      } else {
        // iOS permission handling
        console.log("🍎 Checking iOS permissions...");
        const permissionStatus =
          await Location.requestForegroundPermissionsAsync();

        if (permissionStatus.granted) {
          const backgroundPermission =
            await Location.requestBackgroundPermissionsAsync();
          console.log("iOS background permission:", backgroundPermission);
          permissionGranted = true;
        } else {
          showConfirmation({
            title: "Permission Required",
            message:
              "Location permission is required for this app to work properly.",
            buttons: [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              {
                text: "Cancel",
                onPress: () => {
                  showToast({
                    message: "Location permission prompt cancelled",
                    type: "warning",
                    position: "top",
                    icon: "alert-circle",
                  });
                  console.warn("User cancelled location permission prompt");
                },
              },
            ],
            icon: "alert-circle-outline",
          });
          return;
        }
      }

      if (permissionGranted) {
        startLocationServices();
      }
    } catch (error) {
      console.error("❌ Failed to get location permission:", error);
      showConfirmation({
        title: "Permission Error",
        message:
          "There was an error requesting location permissions. Please check your settings.",
        buttons: [
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
          {
            text: "Cancel",
            onPress: () => {
              showToast({
                message: "Location permission prompt cancelled",
                type: "warning",
                position: "top",
                icon: "alert-circle",
              });
              console.warn("User cancelled location permission prompt");
            },
          },
        ],
        icon: "alert-circle-outline",
      });
    }
  };

  const startLocationServices = () => {
    console.log("🚀 Starting location services...");

    // Ensure we have api and user before starting
    if (!get || !user) {
      console.error(
        "❌ Cannot start location services - missing API or user data"
      );
      return;
    }

    try {
      // Initialize and start location tracking
      console.log("🔧 Initializing LocationTrackingService...");
      LocationTrackingService.initialize(api, user);

      console.log("📍 Starting location tracking...");
      LocationTrackingService.startLocationTracking();

      // Connect WebSocket
      if (user && token) {
        console.log("🔌 Connecting WebSocket...");
        WebSocketService.connect(token, user.userId);
      }

      console.log("✅ Location services started successfully");
    } catch (error) {
      console.error("❌ Error starting location services:", error);
    }
  };

  // Update the useFocusEffect to handle errors better
  useFocusEffect(
    useCallback(() => {
      const initializeScreen = async () => {
        if (user && token) {
          try {
            console.log("🔄 HomeScreen focused - initializing...");

            // Fetch data
            await Promise.all([
              fetchGeofences(),
              fetchContacts(),
              fetchUserData(),
              // refetchRequests(),
            ]);

            // Start location tracking
            await checkAndStartTracking();

            console.log("✅ HomeScreen initialization complete");
          } catch (error) {
            console.error("❌ Error initializing HomeScreen:", error);
          }
        } else {
          console.warn("⚠️ User or token not available");
        }
      };

      initializeScreen();
    }, [user, token])
  );

  // Update the main useEffect to handle cleanup better
  useEffect(() => {
    const initializeServices = async () => {
      if (user && token) {
        try {
          console.log("🔧 Initializing services on mount...");

          // Initialize location tracking service
          LocationTrackingService.initialize(get, user);

          // Connect to WebSocket
          WebSocketService.connect(token, user.userId);

          console.log("✅ Services initialized successfully");
        } catch (error) {
          console.error("❌ Error initializing services:", error);
        }
      }
    };

    initializeServices();

    return () => {
      console.log("🧹 Cleaning up services...");
      try {
        // Cleanup on unmount
        LocationTrackingService.stopLocationTracking();
        WebSocketService.disconnect();
        console.log("✅ Cleanup completed");
      } catch (error) {
        console.error("❌ Error during cleanup:", error);
      }
    };
  }, [user, token]);

  // Set greeting based on time of day
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting("Good Morning,");
    } else if (currentHour < 18) {
      setGreeting("Good Afternoon,");
    } else {
      setGreeting("Good Evening,");
    }
  }, []);


  useEffect(() => {
    if (requests && requests.length > 0) {
      const transformedRequests = requests.map((req) => ({
        id: req.id.toString(),
        type: "geofence",
        from: {
          id: req.creator.id.toString(),
          name: `${req.creator.firstName} ${req.creator.lastName}`,
          email: req.creator.email,
          avatar: req.creator.photo,
        },
        geofence: {
          id: req.geofenceResponse.id.toString(),
          name: req.geofenceResponse.name,
          description: req.geofenceResponse.description,
          createdAt: req.geofenceResponse.createdAt,
          radius: 250,
          color: ["#FF9800", "#F57C00"],
        },
        status: req.responseStatus === 5 ? "pending" : "accepted",
        timestamp: req.geofenceResponse.createdAt,
        message:
          req.geofenceResponse.description ||
          "You have been invited to join this geofence.",
      }));

      setPendingRequests(transformedRequests);
    } else {
      setPendingRequests([]);
    }
  }, [requests]);

  // Enhanced refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchGeofences(),
        fetchContacts(),
        fetchUserData(),
        // refetchRequests(),
        fetchGeofenceRequests(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Updated GeofenceSection component
  const GeofenceSection = () => {
    if (geofencesLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <CustomText style={styles.loadingText}>
            Loading geofences...
          </CustomText>
        </View>
      );
    }

    if (geofences.length === 0) {
      return (
        <View style={styles.emptyGeofenceContainer}>
          <Icon name="map-marker-off" size={36} color="#ccc" />
          <CustomText style={styles.emptyGeofenceText}>
            No geofences yet
          </CustomText>
          <TouchableOpacity
            style={styles.createFirstGeofenceButton}
            onPress={() => navigation.navigate("CreateGeofenceScreen")}
          >
            <Icon name="plus" size={16} color="#6C63FF" />
            <CustomText style={styles.createFirstGeofenceText}>
              Create your first geofence
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.geofenceSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {geofences.map((geofence) => (
            <GeofenceCard
              key={geofence.id}
              geofence={geofence}
              variant="compact"
              onPress={() => navigation.navigate("GeoZoneScreen", { geofence })}
              style={styles.geofenceCard}
            />
          ))}
          <GeofenceCard
            variant="add"
            onPress={() => navigation.navigate("CreateGeofenceScreen")}
            style={styles.addGeofenceCard}
          />
        </ScrollView>
      </View>
    );
  };

  // Updated PeopleSection component with real API data
  const PeopleSection = () => {
    if (contactsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <CustomText style={styles.loadingText}>
            Loading contacts...
          </CustomText>
        </View>
      );
    }

    if (contacts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="account-off" size={36} color="#ccc" />
          <CustomText style={styles.emptyText}>No contacts yet</CustomText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("UserDiscoveryScreen")}
          >
            <Icon name="plus" size={16} color="#6C63FF" />
            <CustomText style={styles.addButtonText}>
              Add your first contact
            </CustomText>
          </TouchableOpacity>
        </View>
      );
    }

    console.log("the contacts are", contacts);

    return (
      <View style={styles.peopleSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {contacts.map((contact) => {
            // Generate consistent colors based on contact name
            const charCode =
              contact.firstName && contact.firstName.length > 1
                ? contact.firstName.charCodeAt(1)
                : contact.lastName && contact.lastName.length > 1
                ? contact.lastName.charCodeAt(1)
                : 65; // Default to 'A' if no name
            console.log("the car code is", charCode);

            const hue = (charCode * 15) % 360;
            const personColor = `hsl(${hue}, 70%, 60%)`;

            const isValidUrl =
              contact.photo &&
              contact.photo.startsWith("http") &&
              !contact.photo.includes("@");

            return (
              <TouchableOpacity
                key={contact.id}
                style={styles.personItem}
                onPress={() =>
                  navigation.navigate("PersonDetails", { person: contact })
                }
              >
                {contact.photo ? (
                  isValidUrl ? (
                    <Image
                      source={{ uri: contact.photo }}
                      style={styles.personImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.personCircle,
                        { backgroundColor: personColor },
                      ]}
                    >
                      <CustomText style={styles.personInitial}>
                        {contact.firstName.charAt(0).toUpperCase()}
                      </CustomText>
                    </View>
                  )
                ) : (
                  <View
                    style={[
                      styles.personCircle,
                      { backgroundColor: personColor },
                    ]}
                  >
                    <CustomText style={styles.personInitial}>
                      {contact.firstName.charAt(0).toUpperCase()}
                    </CustomText>
                  </View>
                )}
                <CustomText style={styles.personName} numberOfLines={1}>
                  {`${contact.firstName} ${contact.lastName}`}
                </CustomText>
                <CustomText style={styles.personEmail} numberOfLines={1}>
                  {contact.email}
                </CustomText>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={styles.personItem}
            onPress={() => navigation.navigate("UserDiscoveryScreen")}
          >
            <View style={[styles.personCircle, { backgroundColor: "#e0e0e0" }]}>
              <Icon name="plus" size={24} color="#6C63FF" />
            </View>
            <CustomText style={styles.personName}>Add New</CustomText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  // New MyDevicesSection component replacing Trackers
  const ZonesTrackingYouSection = () => {
    if (userDataLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <CustomText style={styles.loadingText}>Loading devices...</CustomText>
        </View>
      );
    }

    if (myDevices.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="devices" size={36} color="#ccc" />
          <CustomText style={styles.emptyText}>No active devices</CustomText>
          <CustomText style={styles.emptySubText}>
            You're not currently in any geofences
          </CustomText>
        </View>
      );
    }

    return (
      <View style={styles.devicesSection}>
        {myDevices.map((device) => (
          <TouchableOpacity
            key={device.geofenceId}
            style={styles.deviceCard}
            onPress={() =>
              navigation.navigate("TrackedGeofenceScreen", {
                geofenceId: device?.geofenceId,
              })
            }
          >
            <View style={styles.deviceInfo}>
              <View style={styles.deviceIconContainer}>
                <LinearGradient
                  colors={["#6C63FF", "#5046e5"]}
                  style={styles.deviceIconBackground}
                >
                  <Icon name="map-marker-radius" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.deviceDetails}>
                <CustomText style={styles.deviceName}>{device.name}</CustomText>
                <CustomText style={styles.deviceDescription} numberOfLines={2}>
                  {device.description}
                </CustomText>
              </View>
            </View>
            <View style={styles.deviceStatus}>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: "#4CAF50" },
                  ]}
                />
                <CustomText style={styles.deviceStatusText}>Active</CustomText>
              </View>
              <CustomText style={styles.deviceId}>
                ID: {device.geofenceId}
              </CustomText>
            </View>
          </TouchableOpacity>
        ))}
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
              <ActivityIndicator size="small" color="#6C63FF" />
              <CustomText style={styles.noRequestsText}>
                Loading requests...
              </CustomText>
            </>
          ) : (
            <>
              <Icon name="check-circle-outline" size={36} color="#8BC34A" />
              <CustomText style={styles.noRequestsText}>
                No pending requests
              </CustomText>
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
            onPress={() =>
              navigation.navigate("RequestDetailsScreen", { request })
            }
          >
            <View style={styles.requestInfo}>
              <View
                style={[
                  styles.requestIconContainer,
                  {
                    backgroundColor:
                      request.type === "connection" ? "#6C63FF" : "#FF9800",
                  },
                ]}
              >
                <Icon
                  name={
                    request.type === "connection"
                      ? "account-plus"
                      : "map-marker-radius"
                  }
                  size={16}
                  color="#fff"
                />
              </View>
              <View style={styles.requestDetails}>
                <CustomText style={styles.requestTitle}>
                  {request.type === "connection"
                    ? "Connection Request"
                    : "Geofence Permission"}
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
                  month: "short",
                  day: "numeric",
                })}
              </CustomText>
            </View>
          </TouchableOpacity>
        ))}
        {pendingRequests.length > 2 && (
          <TouchableOpacity
            style={styles.moreRequestsButton}
            onPress={() => navigation.navigate("AllRequestsScreen")}
          >
            <CustomText style={styles.moreRequestsText}>
              View {pendingRequests.length - 2} more requests
            </CustomText>
            <Icon name="chevron-right" size={16} color="#6C63FF" />
          </TouchableOpacity>
        )}
      </View>
    );
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

  // Updated sections array
  const sections = [
    // Only show pending requests if there are any or if loading
    ...pendingRequests.length > 0 || requestsLoading
      ? [
          {
            id: "0",
            title: "Pending Requests",
            content: <RequestsSection />,
            onSeeAllPress:
              pendingRequests.length > 0
                ? () => navigation.navigate("AllRequestsScreen")
                : null,
          },
        ]
      : [],
    // Only show geofences section if there are geofences or if loading
    ...(geofences.length > 0 || geofencesLoading
      ? [
          {
            id: "1",
            title: "Your Geofences",
            content: <GeofenceSection />,
            onSeeAllPress:
              geofences.length > 0
                ? () => navigation.navigate("Geofences")
                : null,
          },
        ]
      : []),
    {
      id: "2",
      title: "People",
      content: <PeopleSection />,
      onSeeAllPress:
        contacts.length > 0 ? () => navigation.navigate("People") : null,
    },
    {
      id: "3",
      title: "Zones Tracking You",
      content: <ZonesTrackingYouSection />,
      onSeeAllPress:
        myDevices.length > 0 ? () => navigation.navigate("Trackers") : null,
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingBottom: tabBarHeight,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FB" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <CustomText style={styles.greeting}>{greeting}</CustomText>
            <CustomText
              style={styles.name}
            >{`${profile?.firstName} ${profile?.lastName}`}</CustomText>
          </View>
          <View style={styles.headerRight}>
            {/* <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate("AllRequests")}
            >
              <Icon name="bell" size={22} color="#6C63FF" />
              {pendingRequests.length > 0 && (
                <View style={styles.notificationBadge}>
                  {pendingRequests.length > 9 ? (
                    <CustomText style={styles.badgeText}>9+</CustomText>
                  ) : pendingRequests.length > 0 ? (
                    <CustomText style={styles.badgeText}>
                      {pendingRequests.length}
                    </CustomText>
                  ) : null}
                </View>
              )}
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate("Profile")}
            >
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
            onPress={() => navigation.navigate("ActivitySummary")}
          >
            <LinearGradient
              colors={["#6C63FF", "#5046e5"]}
              style={styles.activityGradient}
            >
              <View style={styles.activityContent}>
                <View style={styles.activityLeft}>
                  <Icon name="chart-line" size={24} color="#fff" />
                  <View style={styles.activityText}>
                    <CustomText style={styles.activityTitle}>
                      Activity Summary
                    </CustomText>
                    <CustomText style={styles.activitySubtitle}>
                      {myDevices.length} active • {geofences.length} geofences
                    </CustomText>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Section title={item.title} onSeeAllPress={item.onSeeAllPress}>
              {item.content}
            </Section>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#6C63FF"]}
              tintColor="#6C63FF"
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "#F8F9FB",
  },
  greeting: {
    fontSize: 16,
    color: "#666",
    fontWeight: "400",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  activitySummaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activitySummary: {
    borderRadius: 16,
    overflow: "hidden",
  },
  activityGradient: {
    padding: 16,
  },
  activityContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityText: {
    marginLeft: 12,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  activitySubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  seeAll: {
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "500",
  },
  sectionContent: {
    paddingLeft: 20,
  },
  // Loading states
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  // Empty states
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#6C63FF",
  },
  addButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "500",
  },
  // Geofence section styles
  geofenceSection: {
    paddingRight: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  geofenceCard: {
    marginRight: 12,
  },
  addGeofenceCard: {
    marginRight: 12,
  },
  emptyGeofenceContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyGeofenceText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
  createFirstGeofenceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#6C63FF",
  },
  createFirstGeofenceText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "500",
  },
  // People section styles
  peopleSection: {
    paddingRight: 20,
  },
  personItem: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
  },
  personCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  personImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  personInitial: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  personName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1A1A1A",
    textAlign: "center",
  },
  personEmail: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
  // Devices section styles
  devicesSection: {
    paddingRight: 20,
  },
  deviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deviceIconContainer: {
    marginRight: 12,
  },
  deviceIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  deviceDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deviceStatus: {
    alignItems: "flex-end",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4CAF50",
  },
  deviceId: {
    fontSize: 12,
    color: "#999",
  },
  // Requests section styles
  requestsSection: {
    paddingRight: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  requestIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  requestFrom: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  requestTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestTime: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  moreRequestsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  moreRequestsText: {
    fontSize: 14,
    color: "#6C63FF",
    fontWeight: "500",
    marginRight: 4,
  },
  noRequestsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  noRequestsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
    fontWeight: "500",
  },
});

export default HomeScreen;
