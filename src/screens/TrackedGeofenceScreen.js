import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from "react-native-maps";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomText from "../component/CustomText";
import { UseApi } from "../hooks/UseApi";
import { useUser } from "../context/userContext";

const { width, height } = Dimensions.get("window");

const TrackedGeofenceScreen = ({ route }) => {
  const { geofenceId } = route.params;
  const {user}=useUser();  // Pass userId as param
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const { get } = UseApi();

  const userId = user?.userId; // Get userId from context

  const [geofenceData, setGeofenceData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    fetchGeofenceData();
    getCurrentLocationWithFallback();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchGeofenceData = async () => {
    try {
      setLoading(true);
      const response = await get(`/geofence/${geofenceId}`);
      if (response.data) {
        const geofence = response.data;
        setGeofenceData({
          id: geofence.id,
          name: geofence.name,
          description: geofence.description,
          coordinates: geofence.coordinates,
          colors: JSON.parse(geofence.colors || '["#4CAF50","#2E7D32"]'),
          enableNotifications: geofence.enableNotifications,
          status: geofence.status,
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load geofence information");
    } finally {
      setLoading(false);
    }
  };

  // Updated location logic
  const getCurrentLocationWithFallback = () => {
    let gotLocation = false;

    // Try to get live location
    const id = navigator?.geolocation?.watchPosition(
      (position) => {
        gotLocation = true;
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
      },
      async (error) => {
        // If fails, fallback to API
        if (!gotLocation) {
          await fetchUserLocationFromApi();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 10,
      }
    );
    setWatchId(id);

    // Set a timeout as an extra fallback
    setTimeout(async () => {
      if (!gotLocation && !userLocation) {
        await fetchUserLocationFromApi();
      }
    }, 10000);
  };

  const fetchUserLocationFromApi = async () => {
    try {
      const response = await get(`/geofence/locations/user/${userId}/current`);
      if (
        response.data &&
        response.data.location &&
        typeof response.data.location.latitude === "number" &&
        typeof response.data.location.longitude === "number"
      ) {
        setUserLocation({
          latitude: response.data.location.latitude,
          longitude: response.data.location.longitude,
        });
      }
    } catch (error) {
      Alert.alert("Location Error", "Unable to get your current location");
    }
  };

  const handleZoomToGeofence = () => {
    if (mapRef.current && geofenceData && geofenceData.coordinates) {
      const latitudes = geofenceData.coordinates.map((coord) => coord.lat);
      const longitudes = geofenceData.coordinates.map((coord) => coord.lang);

      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;

      const region = {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: latDelta || 0.02,
        longitudeDelta: lngDelta || 0.02,
      };

      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const centerOnUserLocation = () => {
    if (mapRef.current && userLocation) {
      const region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <CustomText style={styles.loadingText}>Loading geofence...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (!geofenceData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#F44336" />
          <CustomText style={styles.errorText}>
            Unable to load geofence information
          </CustomText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchGeofenceData}
          >
            <CustomText style={styles.retryButtonText}>Retry</CustomText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#263238" />
      <View style={styles.container}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: geofenceData.coordinates[0]?.lat || 0,
              longitude: geofenceData.coordinates[0]?.lang || 0,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={false}
            onMapReady={handleZoomToGeofence}
          >
            {/* Render Geofence Polygon */}
            {geofenceData.coordinates && geofenceData.coordinates.length > 0 && (
              <Polygon
                coordinates={geofenceData.coordinates.map((coord) => ({
                  latitude: coord.lat,
                  longitude: coord.lang,
                }))}
                strokeWidth={2}
                strokeColor={geofenceData.colors[0]}
                fillColor={`${geofenceData.colors[0]}40`}
              />
            )}

            {/* Center marker for geofence */}
            {geofenceData.coordinates && geofenceData.coordinates.length > 0 && (
              <Marker
                coordinate={{
                  latitude: geofenceData.coordinates[0].lat,
                  longitude: geofenceData.coordinates[0].lang,
                }}
                title={geofenceData.name}
                description={geofenceData.description}
              >
                <View
                  style={[
                    styles.geofenceMarker,
                    { backgroundColor: geofenceData.colors[0] },
                  ]}
                >
                  <Icon name="map-marker-radius" size={20} color="#fff" />
                </View>
              </Marker>
            )}

            {/* User Location Marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                description="You are here"
              >
                <View style={styles.userMarker}>
                  <Icon name="account" size={20} color="#fff" />
                  <View style={styles.userMarkerPulse} />
                </View>
              </Marker>
            )}
          </MapView>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={handleZoomToGeofence}
            >
              <Icon name="map-marker-radius" size={22} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapControlButton}
              onPress={centerOnUserLocation}
              disabled={!userLocation}
            >
              <Icon 
                name="crosshairs-gps" 
                size={22} 
                color={userLocation ? "#fff" : "#666"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerTitle}>
            <CustomText style={styles.titleText}>
              {geofenceData.name}
            </CustomText>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: geofenceData.status === 1 ? "#4CAF50" : "#F44336",
                },
              ]}
            />
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Bottom Info Card */}
        <View style={styles.bottomCard}>
          <LinearGradient
            colors={["rgba(0,0,0,0.02)", "rgba(0,0,0,0.1)"]}
            style={styles.cardShadow}
          />
          
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon 
                  name="map-marker-radius" 
                  size={24} 
                  color={geofenceData.colors[0]} 
                />
                <View style={styles.cardTitleText}>
                  <CustomText style={styles.cardTitle}>
                    {geofenceData.name}
                  </CustomText>
                  <CustomText style={styles.cardSubtitle}>
                    {geofenceData.description}
                  </CustomText>
                </View>
              </View>
            </View>

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Icon name="bell" size={18} color="#607D8B" />
                <CustomText style={styles.detailText}>
                  Notifications: {geofenceData.enableNotifications ? "Enabled" : "Disabled"}
                </CustomText>
              </View>
              
              <View style={styles.detailItem}>
                <Icon name="map" size={18} color="#607D8B" />
                <CustomText style={styles.detailText}>
                  Type: Polygon ({geofenceData.coordinates.length} points)
                </CustomText>
              </View>

              <View style={styles.detailItem}>
                <Icon 
                  name={geofenceData.status === 1 ? "check-circle" : "alert-circle"} 
                  size={18} 
                  color={geofenceData.status === 1 ? "#4CAF50" : "#F44336"} 
                />
                <CustomText style={styles.detailText}>
                  Status: {geofenceData.status === 1 ? "Active" : "Inactive"}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#263238",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#607D8B",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#607D8B",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#6C63FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerBar: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(38, 50, 56, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(38, 50, 56, 0.8)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  titleText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  placeholder: {
    width: 40,
  },
  mapControls: {
    position: "absolute",
    top: 70,
    right: 16,
    backgroundColor: "rgba(38, 50, 56, 0.8)",
    borderRadius: 12,
    overflow: "hidden",
  },
  mapControlButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  geofenceMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2196F3",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userMarkerPulse: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(33, 150, 243, 0.3)",
    top: -7,
    left: -7,
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  cardShadow: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    height: 10,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#263238",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#607D8B",
    marginTop: 2,
  },
  cardDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#455A64",
    marginLeft: 12,
  },
});

export default TrackedGeofenceScreen;
