import React, { useState, useEffect, useRef, use, useContext } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Polygon, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { BlurView } from 'expo-blur';
import { UseApi } from '../hooks/UseApi';
import { useToast } from '../component/ToastProvider';
import { useConfirmation } from '../component/ConfirmationProvider';
import { LoadingContext } from '../context/LoadingProvider';

// Get device dimensions
const { width, height } = Dimensions.get('window');

// Color presets for geofences
const COLOR_PRESETS = [
  ['#6C63FF', '#5046e5'], // Purple
  ['#FF6B6B', '#FF4785'], // Red
  ['#4CAF50', '#2E7D32'], // Green
  ['#FF9800', '#F57C00'], // Orange
  ['#9C27B0', '#7B1FA2'], // Violet
  ['#3F51B5', '#303F9F'], // Indigo
  ['#00BCD4', '#0097A7'], // Cyan
  ['#009688', '#00796B'], // Teal
];

const searchLocations = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const results = [
    { id: '1', name: 'Central Park', address: 'New York, NY, USA', coordinates: { latitude: 40.7812, longitude: -73.9665 } },
    { id: '2', name: 'Times Square', address: 'Manhattan, NY, USA', coordinates: { latitude: 40.7580, longitude: -73.9855 } },
    { id: '3', name: 'Brooklyn Bridge', address: 'Brooklyn, NY, USA', coordinates: { latitude: 40.7061, longitude: -73.9969 } },
    { id: '4', name: 'Golden Gate Park', address: 'San Francisco, CA, USA', coordinates: { latitude: 37.7694, longitude: -122.4862 } },
    { id: '5', name: 'Fisherman\'s Wharf', address: 'San Francisco, CA, USA', coordinates: { latitude: 37.8080, longitude: -122.4177 } },
  ].filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.address.toLowerCase().includes(query.toLowerCase())
  );
  
  return results;
};

const CreateGeofenceScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const {post}= UseApi();

  const {showToast}= useToast();
  const {showConfirmation}= useConfirmation();
    const [geofenceName, setGeofenceName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [activeNotifications, setActiveNotifications] = useState(true);
    const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState([]);
  const [permissionStatus, setPermissionStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
    const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [panelHeight] = useState(new Animated.Value(0));
  const [headerOpacity] = useState(new Animated.Value(1));

  const {loading, setLoading} = useContext(LoadingContext);
    useEffect(() => {
    (async () => {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const initialRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          
          setRegion(initialRegion);
          
          if (mapRef.current) {
            mapRef.current.animateToRegion(initialRegion);
          }
        } catch (error) {
          console.error("Error getting location:", error);
          showToast({
            message: "Failed to get your current location.",
            type: "error",
            duration: 3000,
          });
        }
      }
      
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchLocations(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(handleSearch, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle details panel animations
  useEffect(() => {
    Animated.timing(panelHeight, {
      toValue: showDetailsForm ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    Animated.timing(headerOpacity, {
      toValue: showDetailsForm ? 0.5 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showDetailsForm, panelHeight, headerOpacity]);

  // Handle map press to add marker
  const handleMapPress = (event) => {
    if (showDetailsForm) {
      setShowDetailsForm(false);
      return;
    }
    
    const { coordinate } = event.nativeEvent;
    
    setMarkers(prevMarkers => [
      ...prevMarkers,
      {
        id: Date.now().toString(),
        coordinate,
      }
    ]);
  };

  // Remove marker
  const removeMarker = (markerId) => {
    setMarkers(prevMarkers => prevMarkers.filter(marker => marker.id !== markerId));
  };

  // Clear all markers
  const clearMarkers = () => {
    if (markers.length > 0) {
      showConfirmation({
        message: "Are you sure you want to clear all markers?",
        type: "warning",
        buttons: [
          { text: "Cancel", onPress: () => {} },
          { text: "Clear", onPress: () => setMarkers([]) },
        ],
      });
    }
  };

  // Handle marker drag
  const handleMarkerDrag = (markerId, event) => {
    const { coordinate } = event.nativeEvent;
    setMarkers(prevMarkers => 
      prevMarkers.map(marker => 
        marker.id === markerId 
          ? { ...marker, coordinate } 
          : marker
      )
    );
  };

  // Select a location from search results
  const selectLocation = (location) => {
    const newRegion = {
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion);
    setShowSearchModal(false);
    setSearchQuery('');
  };

  // Zoom to current location
  const goToCurrentLocation = async () => {
    if (permissionStatus !== 'granted') {
      showConfirmation({
        message: "Location permission is required to access your current location.",
        type: "info",
        buttons: [
          { text: "Cancel", onPress: () => {} },
          { text: "Settings", onPress: () => Linking.openSettings() },
        ],
      });
      return;
    }
    
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setRegion(currentLocation);
      mapRef.current?.animateToRegion(currentLocation);
    } catch (error) {
      console.error("Error getting current location:", error);
      showToast({
        message: "Failed to get your current location.",
        type: "error",
        duration: 3000,
      });
    }
  };

  // Zoom to fit the polygon
  const zoomToFit = () => {
    if (markers.length < 3) {
      showToast({
        message: "At least 3 points are required to zoom to fit.",
        type: "warning",
        duration: 3000,
      });
      return;
    }
    
    // Calculate bounds
    let minLat = markers[0].coordinate.latitude;
    let maxLat = markers[0].coordinate.latitude;
    let minLng = markers[0].coordinate.longitude;
    let maxLng = markers[0].coordinate.longitude;
    
    markers.forEach(marker => {
      minLat = Math.min(minLat, marker.coordinate.latitude);
      maxLat = Math.max(maxLat, marker.coordinate.latitude);
      minLng = Math.min(minLng, marker.coordinate.longitude);
      maxLng = Math.max(maxLng, marker.coordinate.longitude);
    });
    
    // Add padding
    const PADDING = 1.1;
    const latDelta = (maxLat - minLat) * PADDING;
    const lngDelta = (maxLng - minLng) * PADDING;
    
    mapRef.current?.animateToRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    });
  };

  // Validate form before saving
  const validateForm = () => {
    if (!geofenceName.trim()) {
      showToast({
        message: "Geofence name is required.",
        type: "error",
        duration: 3000,
      });
      return false;
    }
    
    if (markers.length < 3) {
      showToast({
        message: "At least 3 points are required to create a geofence.",
        type: "error",
        duration: 3000,
      });
      return false;
    }
    
    return true;
  };

  // Save and create the new geofence
  const handleSaveGeofence = () => {
    if (!validateForm()) return;
    
    const coordinates = markers.map(marker => ({
      lat: marker.coordinate.latitude,
      lang: marker.coordinate.longitude,
    }));
    
    const newGeofence = {
      
      name: geofenceName,
      description: description,
      coordinates: coordinates,
      enableNotifications: activeNotifications,
      colors: selectedColor,
      
    };

    // Call API to save geofence
    try {
     const response=  post('/geofence', newGeofence)
      console.log("Geofence saved successfully:", response);
      showToast({
        message: "Geofence created successfully.",
        type: "success",
        duration: 3000,
      });

      navigation.goBack();
      
    } catch (error) {
      console.error("Error saving geofence:", error);
      showToast({
        message: "Failed to create geofence.",
        type: "error",
        duration: 3000,
      });
      
    }
    
    
    
  };

  // Toggle details form panel
  const toggleDetailsForm = () => {
    setShowDetailsForm(!showDetailsForm);
  };

  // Render Search Modal
  const renderSearchModal = () => (
    <Modal
      visible={showSearchModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSearchModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <CustomText style={styles.modalTitle}>Search Location</CustomText>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSearchModal(false)}>
              <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6C63FF" />
              <CustomText style={styles.loadingText}>Searching...</CustomText>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.searchResultItem}
                  onPress={() => selectLocation(item)}
                >
                  <Icon name="map-marker" size={18} color="#6C63FF" style={styles.resultIcon} />
                  <View style={styles.resultTextContainer}>
                    <CustomText style={styles.resultName}>{item.name}</CustomText>
                    <CustomText style={styles.resultAddress}>{item.address}</CustomText>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <View style={styles.emptyResults}>
                    <CustomText style={styles.emptyResultsText}>
                      No locations found. Try a different search.
                    </CustomText>
                  </View>
                ) : (
                  <View style={styles.emptyResults}>
                    <CustomText style={styles.emptyResultsText}>
                      Type at least 3 characters to search
                    </CustomText>
                  </View>
                )
              }
            />
          )}
        </View>
      </View>
    </Modal>
  );

  // Calculate details panel height based on animation value
  const detailsPanelHeight = panelHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.6],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Full-screen map */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          loadingEnabled={loading}
        >
          {markers.map((marker, index) => (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              draggable
              onDragEnd={(e) => handleMarkerDrag(marker.id, e)}
              onPress={() => removeMarker(marker.id)}
            >
              <View style={styles.customMarker}>
                <LinearGradient
                  colors={selectedColor}
                  style={styles.markerGradient}
                >
                  <CustomText style={styles.markerText}>{index + 1}</CustomText>
                </LinearGradient>
              </View>
            </Marker>
          ))}
          
          {markers.length >= 3 && (
            <Polygon
              coordinates={markers.map(marker => marker.coordinate)}
              strokeWidth={2}
              strokeColor={selectedColor[0]}
              fillColor={`${selectedColor[0]}40`} // 40 = 25% opacity
            />
          )}
        </MapView>
        
        <Animated.View style={[styles.floatingHeader, { opacity: headerOpacity }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>
            <CustomText style={styles.headerTitle}>Create Geofence</CustomText>
            <TouchableOpacity
              style={styles.detailsToggleButton}
              onPress={toggleDetailsForm}>
              <Icon name={showDetailsForm ? "chevron-down" : "chevron-up"} size={22} color="#fff" />
              <CustomText style={styles.detailsToggleText}>
                {showDetailsForm ? "Hide Details" : "Show Details"}
              </CustomText>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={goToCurrentLocation}>
            <Icon name="crosshairs-gps" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={() => setShowSearchModal(true)}>
            <Icon name="magnify" size={22} color="#fff" />
          </TouchableOpacity>
          
          {markers.length >= 3 && (
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={zoomToFit}>
              <Icon name="fit-to-screen" size={22} color="#fff" />
            </TouchableOpacity>
          )}
          
          {markers.length > 0 && (
            <TouchableOpacity 
              style={[styles.mapControlButton, { backgroundColor: '#FF6B6B' }]}
              onPress={clearMarkers}>
              <Icon name="trash-can-outline" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Points counter */}
        <View style={styles.pointsCounter}>
          <CustomText style={styles.pointsCounterText}>
            {markers.length} {markers.length === 1 ? 'point' : 'points'} 
            {markers.length < 3 ? ' (need at least 3)' : ''}
          </CustomText>
        </View>
        
        {/* Map instructions */}
        <View style={styles.mapInstructions}>
          <Icon name="information-outline" size={16} color="#666" />
          <CustomText style={styles.mapInstructionsText}>
            Tap on the map to add points. Tap on a point to remove it.
          </CustomText>
        </View>
        
        {/* Collapsible details panel */}
        <Animated.View 
          style={[
            styles.detailsPanel, 
            { height: detailsPanelHeight }
          ]}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidView}
          >
            <ScrollView
              contentContainerStyle={styles.detailsContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.detailsHeader}>
                <CustomText style={styles.detailsTitle}>Geofence Details</CustomText>
                <TouchableOpacity 
                  style={styles.detailsCloseButton}
                  onPress={toggleDetailsForm}>
                  <Icon name="close" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <CustomText style={styles.inputLabel}>Geofence Name *</CustomText>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter geofence name"
                  value={geofenceName}
                  onChangeText={setGeofenceName}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <CustomText style={styles.inputLabel}>Description</CustomText>
                <TextInput
                  style={[styles.textInput, styles.textAreaInput]}
                  placeholder="Enter description (optional)"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.colorSection}>
                <CustomText style={styles.inputLabel}>Select Color</CustomText>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.colorList}>
                  {COLOR_PRESETS.map((colorPair, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        selectedColor === colorPair && styles.selectedColorOption,
                      ]}
                      onPress={() => setSelectedColor(colorPair)}>
                      <LinearGradient
                        colors={colorPair}
                        style={styles.colorGradient}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.toggleGroup}>
                <View style={styles.toggleRow}>
                  <CustomText style={styles.toggleLabel}>Notifications</CustomText>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() => setActiveNotifications(!activeNotifications)}>
                    <Icon
                      name={activeNotifications ? "bell" : "bell-off"}
                      size={22}
                      color={activeNotifications ? "#6C63FF" : "#9e9e9e"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.pointsListSection}>
                <CustomText style={styles.inputLabel}>Geofence Points</CustomText>
                {markers.length > 0 ? (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pointsList}
                  >
                    {markers.map((marker, index) => (
                      <View key={marker.id} style={styles.pointItem}>
                        <LinearGradient
                          colors={selectedColor}
                          style={styles.pointNumberContainer}
                        >
                          <CustomText style={styles.pointNumber}>{index + 1}</CustomText>
                        </LinearGradient>
                        <View style={styles.pointDetails}>
                          <CustomText style={styles.pointCoordinates}>
                            {marker.coordinate.latitude.toFixed(5)}, 
                            {marker.coordinate.longitude.toFixed(5)}
                          </CustomText>
                          <TouchableOpacity 
                            style={styles.removePoint}
                            onPress={() => removeMarker(marker.id)}
                          >
                            <Icon name="close" size={16} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.noPointsContainer}>
                    <CustomText style={styles.noPointsText}>
                      No points added yet. Tap on the map to start creating your geofence.
                    </CustomText>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (markers.length < 3 || !geofenceName.trim()) && styles.disabledButton
                ]}
                disabled={markers.length < 3 || !geofenceName.trim()}
                onPress={handleSaveGeofence}>
                <Icon name="check" size={20} color="#fff" />
                <CustomText style={styles.saveButtonText}>Create Geofence</CustomText>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
        
        {!showDetailsForm && markers.length >= 3 && (
          <View style={styles.createButtonContainer}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={toggleDetailsForm}>
              <Icon name="arrow-up" size={20} color="#fff" />
              <CustomText style={styles.createButtonText}>Continue</CustomText>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {renderSearchModal()}
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
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    paddingBottom: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Manrope-Bold',
  },
  detailsToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  detailsToggleText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
    marginLeft: 4,
  },
  mapControls: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 5,
  },
  mapControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pointsCounter: {
    position: 'absolute',
    top: 100,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 5,
  },
  pointsCounterText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Manrope-SemiBold',
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 5,
  },
  mapInstructionsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Manrope-Regular',
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
    overflow: 'hidden',
    zIndex: 20,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  detailsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  detailsCloseButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-Regular',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  colorSection: {
    marginBottom: 16,
  },
  colorList: {
    paddingVertical: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#6C63FF',
  },
  colorGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  toggleGroup: {
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  toggleButton: {
    padding: 8,
  },
  pointsListSection: {
    marginBottom: 24,
  },
  pointsList: {
    paddingVertical: 8,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
    minWidth: 180,
  },
  pointNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  pointNumber: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-Bold',
  },
  pointDetails: {
    flex: 1,
  },
  pointCoordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  removePoint: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  noPointsContainer: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noPointsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Manrope-Regular',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
    marginLeft: 8,
  },
  createButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6C63FF',
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
    marginLeft: 8,
  },
  customMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Manrope-Bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Manrope-Bold',
  },
  closeButton: {
    padding: 4,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-Regular',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Manrope-Regular',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Manrope-Regular',
  },
  emptyResults: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyResultsText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    textAlign: 'center',
  },
});

export default CreateGeofenceScreen;