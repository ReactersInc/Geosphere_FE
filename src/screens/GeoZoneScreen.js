import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, Circle, Polygon, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { UseApi } from '../hooks/UseApi';
import { BlurView } from 'expo-blur';


const { width, height } = Dimensions.get('window');

const GeoZoneScreen = ({ route }) => {
  const { geofence } = route.params;
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const scrollViewRef = useRef(null);
  const { get } = UseApi();
  const [loading, setLoading] = useState(false);
  const [deviceEntries, setDeviceEntries] = useState([]);
  const [entitiesData, setEntitiesData] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [showGeofenceInfo, setShowGeofenceInfo] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all'); // 'all', 'inside', 'outside'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const slideAnim = useRef(new Animated.Value(1)).current;
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(true);
  
  // Mock data for entities (persons and devices)
  const mockEntities = [
    {
      id: '1',
      name: 'John Doe',
      type: 'person',
      isInside: true,
      lastUpdated: new Date(Date.now() - 5 * 60000),
      coordinates: {
        latitude: geofence.lat + 0.001,
        longitude: geofence.lng + 0.002,
      },
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      batteryLevel: 75,
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'person',
      isInside: false,
      lastUpdated: new Date(Date.now() - 15 * 60000),
      coordinates: {
        latitude: geofence.lat - 0.005,
        longitude: geofence.lng - 0.003,
      },
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      batteryLevel: 45,
    },
    {
      id: '3',
      name: 'Delivery Vehicle',
      type: 'device',
      isInside: true,
      lastUpdated: new Date(Date.now() - 2 * 60000),
      coordinates: {
        latitude: geofence.lat + 0.0015,
        longitude: geofence.lng - 0.001,
      },
      icon: 'truck-delivery',
      batteryLevel: 92,
    },
    {
      id: '4',
      name: 'Smart Watch',
      type: 'device',
      isInside: false,
      lastUpdated: new Date(Date.now() - 30 * 60000),
      coordinates: {
        latitude: geofence.lat - 0.006,
        longitude: geofence.lng + 0.004,
      },
      icon: 'watch',
      batteryLevel: 23,
    },
    {
      id: '5',
      name: 'Pet Tracker',
      type: 'device',
      isInside: true,
      lastUpdated: new Date(Date.now() - 8 * 60000),
      coordinates: {
        latitude: geofence.lat + 0.0008,
        longitude: geofence.lng + 0.0009,
      },
      icon: 'paw',
      batteryLevel: 88,
    },
  ];

  useEffect(() => {
    fetchDeviceEntries();
    setEntitiesData(mockEntities);
    handleZoomToGeofence();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchDeviceEntries();
      return () => {};
    }, [])
  );

  const fetchDeviceEntries = async () => {
    if (!geofence || !geofence.id) return;
    
    try {
      setLoading(true);
      const response = await get(`/geofence/${geofence.id}`);
      setDeviceEntries(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch device entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Animate the refresh icon
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
    
    // Fetch fresh data
    fetchDeviceEntries();
    
    // Mock data refresh - In a real app, you'd fetch from API
    const newEntities = [...mockEntities];
    newEntities[1].isInside = Math.random() > 0.5;
    newEntities[3].isInside = Math.random() > 0.5;
    setEntitiesData(newEntities);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };


  useEffect(() => {
    if (isBottomSheetExpanded) {
     
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isBottomSheetExpanded]);

  // Format time since update
  const formatTimeSince = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} months ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} days ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hours ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minutes ago`;
    
    return 'Just now';
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

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleZoomToGeofence = () => {
    if (mapRef.current && geofence) {
      let region;
      if (geofence.coordinates && geofence.coordinates.length > 0) {
        // For polygon geofences
        const latitudes = geofence.coordinates.map(coord => coord.lat);
        const longitudes = geofence.coordinates.map(coord => coord.lang || coord.lng);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        const latDelta = (maxLat - minLat) * 1.5;
        const lngDelta = (maxLng - minLng) * 1.5;
        
        region = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: latDelta || 0.02,
          longitudeDelta: lngDelta || 0.02,
        };
      } else {
        // For circular geofences
        const radiusInDegrees = geofence.radius / 111000; // Rough conversion from meters to degrees
        region = {
          latitude: geofence.lat,
          longitude: geofence.lng,
          latitudeDelta: radiusInDegrees * 2.5,
          longitudeDelta: radiusInDegrees * 2.5,
        };
      }
      
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  const zoomToEntity = (entity) => {
    if (mapRef.current && entity) {
      const region = {
        latitude: entity.coordinates.latitude,
        longitude: entity.coordinates.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      
      mapRef.current.animateToRegion(region, 500);
      setSelectedPerson(entity);
    }
  };

  const toggleMapType = () => {
    setMapType(prevType => prevType === 'standard' ? 'satellite' : 'standard');
  };

  const toggleGeofenceInfo = () => {
    setShowGeofenceInfo(prev => !prev);
  };

  const filterEntities = (filter) => {
    setEntityFilter(filter);
  };

  const getFilteredEntities = () => {
    switch (entityFilter) {
      case 'inside':
        return entitiesData.filter(entity => entity.isInside);
      case 'outside':
        return entitiesData.filter(entity => !entity.isInside);
      default:
        return entitiesData;
    }
  };




  const renderMarkerIcon = (entity) => {
    if (entity.type === 'person') {
      return (
        <View style={[
          styles.personMarker, 
          { backgroundColor: entity.isInside ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)' }
        ]}>
          {entity.avatar ? (
            <Image 
              source={{ uri: entity.avatar }} 
              style={styles.avatarImage} 
              resizeMode="cover"
            />
          ) : (
            <Icon name="account" size={20} color="#fff" />
          )}
          <View style={[
            styles.markerStatus,
            { backgroundColor: entity.isInside ? '#4CAF50' : '#F44336' }
          ]} />
        </View>
      );
    } else {
      return (
        <View style={[
          styles.deviceMarker, 
          { backgroundColor: entity.isInside ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)' }
        ]}>
          <Icon name={entity.icon || 'cellphone'} size={18} color="#fff" />
          <View style={[
            styles.markerStatus,
            { backgroundColor: entity.isInside ? '#4CAF50' : '#F44336' }
          ]} />
        </View>
      );
    }
  };

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
            mapType={mapType}
            initialRegion={{
              latitude: geofence.lat,
              longitude: geofence.lng,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onMapReady={handleZoomToGeofence}
            showsUserLocation
            showsMyLocationButton={false}
            showsCompass={false}
            showsScale={true}
            rotateEnabled={true}
            toolbarEnabled={false}>
            
            {/* Render circle for circular geofence */}
            {(!geofence.coordinates || geofence.coordinates.length === 0) && (
              <Circle
                center={{
                  latitude: geofence.lat,
                  longitude: geofence.lng,
                }}
                radius={geofence.radius}
                strokeWidth={2}
                strokeColor={geofence.color[0]}
                fillColor={`${geofence.color[0]}40`} // 40 for 25% opacity
              />
            )}
            
            {/* Render polygon for polygon geofence */}
            {geofence.coordinates && geofence.coordinates.length > 0 && (
              <Polygon
                coordinates={geofence.coordinates.map(coord => ({
                  latitude: coord.lat,
                  longitude: coord.lang || coord.lng,
                }))}
                strokeWidth={2}
                strokeColor={geofence.color[0]}
                fillColor={`${geofence.color[0]}40`} 
              />
            )}
            
            {/* Center marker */}
            <Marker
              coordinate={{
                latitude: geofence.lat,
                longitude: geofence.lng,
              }}
              title={geofence.geofence_name}>
              <View style={[styles.centerMarker, { backgroundColor: geofence.color[0] }]}>
                <Icon name="map-marker-radius" size={22} color="#fff" />
              </View>
            </Marker>

            {/* Render entities (people and devices) */}
            {getFilteredEntities().map((entity) => (
              <Marker
                key={entity.id}
                coordinate={entity.coordinates}
                title={entity.name}
                description={entity.isInside ? "Inside Geofence" : "Outside Geofence"}
                onPress={() => setSelectedPerson(entity)}
              >
                {renderMarkerIcon(entity)}
                <Callout tooltip>
                  <View style={styles.calloutContainer}>
                    <View style={styles.calloutBubble}>
                      <View style={styles.calloutHeader}>
                        {entity.type === 'person' && entity.avatar ? (
                          <Image source={{ uri: entity.avatar }} style={styles.calloutAvatar} />
                        ) : (
                          <View style={styles.calloutIcon}>
                            <Icon 
                              name={entity.type === 'person' ? 'account' : (entity.icon || 'cellphone')} 
                              size={16} 
                              color="#fff" 
                            />
                          </View>
                        )}
                        <CustomText style={styles.calloutTitle}>{entity.name}</CustomText>
                      </View>
                      
                      <View style={styles.calloutContent}>
                        <View style={styles.calloutDetail}>
                          <Icon 
                            name={entity.isInside ? "map-marker-check" : "map-marker-off"} 
                            size={14} 
                            color={entity.isInside ? "#4CAF50" : "#F44336"} 
                          />
                          <CustomText style={styles.calloutText}>
                            {entity.isInside ? "Inside" : "Outside"} Geofence
                          </CustomText>
                        </View>
                        
                        <View style={styles.calloutDetail}>
                          <Icon name="clock-outline" size={14} color="#607D8B" />
                          <CustomText style={styles.calloutText}>
                            {formatTimeSince(entity.lastUpdated)}
                          </CustomText>
                        </View>
                        
                        <View style={styles.calloutDetail}>
                          <Icon name="battery" size={14} color={
                            entity.batteryLevel > 70 ? "#4CAF50" : 
                            entity.batteryLevel > 30 ? "#FF9800" : "#F44336"
                          } />
                          <CustomText style={styles.calloutText}>
                            {entity.batteryLevel}% Battery
                          </CustomText>
                        </View>
                      </View>
                      
                      <View style={styles.calloutArrow} />
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
          
          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={toggleMapType}>
              <Icon name={mapType === 'standard' ? "satellite-variant" : "map"} size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleZoomToGeofence}>
              <Icon name="target" size={22} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapControlButton}
              onPress={handleRefresh}>
              <Animated.View style={{ transform: [{ rotate: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['360deg', '0deg']
              }) }] }}>
                <Icon name="refresh" size={22} color="#fff" />
              </Animated.View>
            </TouchableOpacity>
          </View>
          
          {/* Filter Controls */}
          <View style={styles.filterControls}>
            <TouchableOpacity 
              style={[
                styles.filterButton,
                entityFilter === 'all' && styles.filterButtonActive
              ]}
              onPress={() => filterEntities('all')}>
              <Icon 
                name="filter-variant" 
                size={18} 
                color={entityFilter === 'all' ? "#fff" : "#B0BEC5"} 
              />
              <CustomText style={[
                styles.filterText,
                entityFilter === 'all' && styles.filterTextActive
              ]}>All</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                entityFilter === 'inside' && styles.filterButtonActive
              ]}
              onPress={() => filterEntities('inside')}>
              <Icon 
                name="map-marker-check" 
                size={18} 
                color={entityFilter === 'inside' ? "#fff" : "#B0BEC5"} 
              />
              <CustomText style={[
                styles.filterText,
                entityFilter === 'inside' && styles.filterTextActive
              ]}>Inside</CustomText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton,
                entityFilter === 'outside' && styles.filterButtonActive
              ]}
              onPress={() => filterEntities('outside')}>
              <Icon 
                name="map-marker-off" 
                size={18} 
                color={entityFilter === 'outside' ? "#fff" : "#B0BEC5"} 
              />
              <CustomText style={[
                styles.filterText,
                entityFilter === 'outside' && styles.filterTextActive
              ]}>Outside</CustomText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Header Bar - Floating on top of map */}
        <View style={styles.headerBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <CustomText style={styles.titleText}>
              {geofence.geofence_name}
            </CustomText>
            <View style={[styles.statusIndicator, { 
              backgroundColor: geofence.active ? '#4CAF50' : '#F44336' 
            }]} />
          </View>
          
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.navigate('EditGeofence', { geofence })}>
            <Icon name="dots-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Bottom Sheet With Entity List */}
        <View style={styles.bottomSheetContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.1)']}
            style={styles.bottomSheetShadow}
          />

<TouchableOpacity 
    style={styles.collapseButton}
    onPress={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}>
    <Icon 
      name={isBottomSheetExpanded ? "chevron-down" : "chevron-up"} 
      size={24} 
      color="#607D8B" 
    />
    <CustomText style={styles.collapseButtonText}>
      {isBottomSheetExpanded ? "Hide Details" : "Show Details"}
      {isBottomSheetExpanded ? " (Tap to collapse)" : " (Tap to expand)"}
    </CustomText>
  </TouchableOpacity>

  {isBottomSheetExpanded && (
          
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            
            
              <View style={styles.geofenceInfoContainer}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Icon name="map-marker-radius" size={20} color={geofence.color[0]} />
                    <View style={styles.infoTextContainer}>
                      <CustomText style={styles.infoLabel}>Type</CustomText>
                      <CustomText style={styles.infoValue}>
                        {geofence.coordinates && geofence.coordinates.length > 0 ? 'Polygon' : 'Circular'}
                      </CustomText>
                    </View>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Icon name="ruler" size={20} color={geofence.color[0]} />
                    <View style={styles.infoTextContainer}>
                      <CustomText style={styles.infoLabel}>
                        {(!geofence.coordinates || geofence.coordinates.length === 0) ? 'Radius' : 'Points'}
                      </CustomText>
                      <CustomText style={styles.infoValue}>
                        {(!geofence.coordinates || geofence.coordinates.length === 0) 
                          ? `${geofence.radius}m` 
                          : `${geofence.coordinates.length}`}
                      </CustomText>
                    </View>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Icon 
                      name={geofence.notifications ? "bell" : "bell-off"} 
                      size={20} 
                      color={geofence.color[0]} 
                    />
                    <View style={styles.infoTextContainer}>
                      <CustomText style={styles.infoLabel}>Alerts</CustomText>
                      <CustomText style={styles.infoValue}>
                        {geofence.notifications ? "Enabled" : "Disabled"}
                      </CustomText>
                    </View>
                  </View>
                </View>
                
                <View style={styles.quickStats}>
                  <View style={[styles.statItem, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
                    <Icon name="map-marker-check" size={24} color="#4CAF50" />
                    <CustomText style={styles.statCount}>
                      {entitiesData.filter(e => e.isInside).length}
                    </CustomText>
                    <CustomText style={styles.statLabel}>Inside</CustomText>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(244, 67, 54, 0.1)' }]}>
                    <Icon name="map-marker-off" size={24} color="#F44336" />
                    <CustomText style={styles.statCount}>
                      {entitiesData.filter(e => !e.isInside).length}
                    </CustomText>
                    <CustomText style={styles.statLabel}>Outside</CustomText>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
                    <Icon name="account-multiple" size={24} color="#2196F3" />
                    <CustomText style={styles.statCount}>
                      {entitiesData.filter(e => e.type === 'person').length}
                    </CustomText>
                    <CustomText style={styles.statLabel}>People</CustomText>
                  </View>
                  
                  <View style={[styles.statItem, { backgroundColor: 'rgba(255, 152, 0, 0.1)' }]}>
                    <Icon name="devices" size={24} color="#FF9800" />
                    <CustomText style={styles.statCount}>
                      {entitiesData.filter(e => e.type === 'device').length}
                    </CustomText>
                    <CustomText style={styles.statLabel}>Devices</CustomText>
                  </View>
                </View>
              </View>
            
            
            {/* Entity List */}
            <View style={styles.entitiesListHeader}>
              <CustomText style={styles.entitiesTitle}>People & Devices</CustomText>
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#6C63FF" />
              ) : (
                <CustomText style={styles.entitiesCount}>
                  {getFilteredEntities().length} {entityFilter === 'all' ? 'total' : entityFilter}
                </CustomText>
              )}
            </View>
            
            <ScrollView 
              ref={scrollViewRef}
              style={styles.entitiesList}
              showsVerticalScrollIndicator={false}>
              {getFilteredEntities().length > 0 ? (
                getFilteredEntities().map((entity) => (
                  <TouchableOpacity 
                    key={entity.id} 
                    style={[
                      styles.entityItem,
                      selectedPerson?.id === entity.id && styles.entityItemSelected
                    ]}
                    onPress={() => {zoomToEntity(entity);
                      setIsBottomSheetExpanded(false);
                    }}>
                    {entity.type === 'person' ? (
                      entity.avatar ? (
                        <Image source={{ uri: entity.avatar }} style={styles.entityAvatar} />
                      ) : (
                        <View style={[styles.entityIcon, { backgroundColor: entity.isInside ? '#4CAF50' : '#F44336' }]}>
                          <Icon name="account" size={18} color="#fff" />
                        </View>
                      )
                    ) : (
                      <View style={[styles.entityIcon, { backgroundColor: entity.isInside ? '#4CAF50' : '#F44336' }]}>
                        <Icon name={entity.icon || 'cellphone'} size={18} color="#fff" />
                      </View>
                    )}
                    
                    <View style={styles.entityInfo}>
                      <View style={styles.entityNameContainer}>
                        <CustomText style={styles.entityName}>{entity.name}</CustomText>
                        <View style={[
                          styles.entityStatus, 
                          { backgroundColor: entity.isInside ? '#4CAF50' : '#F44336' }
                        ]}>
                          <CustomText style={styles.entityStatusText}>
                            {entity.isInside ? 'Inside' : 'Outside'}
                          </CustomText>
                        </View>
                      </View>
                      
                      <View style={styles.entityDetails}>
                        <View style={styles.entityDetail}>
                          <Icon name="clock-outline" size={14} color="#607D8B" />
                          <CustomText style={styles.entityDetailText}>
                            {formatTimeSince(entity.lastUpdated)}
                          </CustomText>
                        </View>
                        
                        <View style={styles.entityDetail}>
                          <Icon 
                            name="battery" 
                            size={14} 
                            color={
                              entity.batteryLevel > 70 ? "#4CAF50" : 
                              entity.batteryLevel > 30 ? "#FF9800" : "#F44336"
                            } 
                          />
                          <CustomText style={styles.entityDetailText}>
                            {entity.batteryLevel}%
                          </CustomText>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.entityAction}
                      onPress={() =>{ 
                        zoomToEntity(entity)
                        
                        
                      }}>
                      <Icon name="crosshairs-gps" size={20} color="#6C63FF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyListContainer}>
                  <Icon name="alert-circle-outline" size={40} color="#B0BEC5" />
                  <CustomText style={styles.emptyListTitle}>No entities found</CustomText>
                  <CustomText style={styles.emptyListText}>
                    Try changing your filter or add more people and devices to this geofence
                  </CustomText>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#6C63FF' }]}
                onPress={() => navigation.navigate('AddEntityToGeofence', { geofenceId: geofence.id })}>
                <Icon name="account-plus" size={20} color="#fff" />
                <CustomText style={styles.actionButtonText}>Add Person</CustomText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => navigation.navigate('AddDeviceToGeofence', { geofenceId: geofence.id })}>
                <Icon name="cellphone-link" size={20} color="#fff" />
                <CustomText style={styles.actionButtonText}>Add Device</CustomText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { 
                  backgroundColor: geofence.active ? '#F44336' : '#4CAF50'
                }]}>
                <Icon 
                  name={geofence.active ? "pause-circle" : "play-circle"} 
                  size={20} 
                  color="#fff" 
                />
                <CustomText style={styles.actionButtonText}>
                  {geofence.active ? "Pause" : "Activate"}
                </CustomText>
              </TouchableOpacity>
            </View>
          </View>

              )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#263238',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerBar: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(38, 50, 56, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 50, 56, 0.8)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  titleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(38, 50, 56, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: 70,
    right: 16,
    backgroundColor: 'rgba(38, 50, 56, 0.8)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapControlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterControls: {
    position: 'absolute',
    top: 70,
    left: 16,
    backgroundColor: 'rgba(38, 50, 56, 0.8)',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  filterButtonActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.8)',
  },
  filterText: {
    fontSize: 12,
    color: '#B0BEC5',
    marginLeft: 4,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  centerMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  personMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  deviceMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  markerStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  calloutContainer: {
    width: 200,
  },
  calloutBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  calloutIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },
  calloutContent: {
    marginTop: 4,
  },
  calloutDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  calloutText: {
    fontSize: 12,
    color: '#607D8B',
    marginLeft: 6,
  },
  calloutArrow: {
    backgroundColor: 'transparent',
    borderWidth: 10,
    borderColor: 'transparent',
    borderTopColor: '#fff',
    alignSelf: 'center',
    marginTop: 6,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  collapseButtonText: {
    color: '#607D8B',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    paddingBottom: 30,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    maxHeight: height * 0.6, // Adjust this as needed
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  infoToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoToggleText: {
    color: '#607D8B',
    fontSize: 14,
    marginLeft: 4,
  },
  geofenceInfoContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTextContainer: {
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#90A4AE',
  },
  infoValue: {
    fontSize: 14,
    color: '#455A64',
    fontWeight: '500',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#607D8B',
    marginTop: 2,
  },
  entitiesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  entitiesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  entitiesCount: {
    fontSize: 14,
    color: '#607D8B',
  },
  entitiesList: {
    maxHeight: height * 0.3,
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  entityItemSelected: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  entityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  entityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  entityNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entityName: {
    fontSize: 14,
    color: '#263238',
    fontWeight: '500',
    marginRight: 8,
  },
  entityStatus: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  entityStatusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  entityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  entityDetailText: {
    fontSize: 12,
    color: '#607D8B',
    marginLeft: 4,
  },
  entityAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#455A64',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyListText: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
});

export default GeoZoneScreen;