import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useGeofenceRequestActions } from '../hooks/useGeofenceRequests';
import LocationPermissionService from '../service/LocationPermissionService';
import LocationTrackingService from '../service/LocationTrackingService';
import WebSocketService from '../service/WebSocketService';
import { useUser } from '../context/userContext';
import { UseApi } from '../hooks/UseApi';

const RequestDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { request } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const { acceptRequest, declineRequest } = useGeofenceRequestActions();
  const { user, token } = useUser();
  const { get, post } = UseApi();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      const result = await acceptRequest(request.id);
      
      if (result.success) {
        if (result.needsLocationPermission) {
          // Show permission guidance
          Alert.alert(
            "Location Permission Required",
            result.permissionMessage,
            [
              { text: "Cancel", style: "cancel" },
              { 
                text: "Grant Permission", 
                onPress: async () => {
                  const permissionResult = await LocationPermissionService.requestLocationPermissions();
                  
                  if (permissionResult.success) {
                    // Initialize and start location tracking
                    LocationTrackingService.initialize({ post }, user);
                    await LocationTrackingService.startLocationTracking();
                    
                    // Connect to WebSocket for real-time updates
                    if (user && token) {
                      WebSocketService.connect(token, user.userId);
                    }
                    
                    Alert.alert(
                      "Success",
                      "Request accepted and location tracking enabled!",
                      [{ text: "OK", onPress: () => navigation.replace('AllRequestsScreen', { refresh: true }) }]
                    );
                  }
                }
              }
            ]
          );
        } else {
          // Location tracking already started
          Alert.alert(
            "Request Accepted",
            "Location tracking has been enabled successfully!",
            [{ text: "OK", onPress: () => navigation.replace('AllRequestsScreen', { refresh: true }) }]
          );
        }
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    setIsLoading(true);
    try {
      const result = await declineRequest(request.id);
      setIsLoading(false);
      
      Alert.alert(
        result.success ? "Request Declined" : "Error",
        result.success 
          ? "The request has been declined"
          : result.message,
        [
          { text: "OK", onPress: () => {
            if (result.success) {
              // Navigate back and refresh the list
              navigation.replace('AllRequestsScreen', { refresh: true });
            }
          }}
        ]
      );
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate consistent color based on name
  const getPersonColor = (name) => {
    const charCode = name.charCodeAt(0);
    const hue = (charCode * 15) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#263238" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <CustomText style={styles.titleText}>
              {request.type === 'connection' ? 'Connection Request' : 'Geofence Permission'}
            </CustomText>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Request Info Card */}
          <View style={styles.requestCard}>
            <LinearGradient
              colors={request.type === 'connection' ? ['#6C63FF', '#5046e5'] : ['#FF9800', '#F57C00']}
              style={styles.requestBanner}
            >
              <View style={styles.requestIconContainer}>
                <Icon 
                  name={request.type === 'connection' ? 'account-plus' : 'map-marker-radius'} 
                  size={28} 
                  color="#fff" 
                />
              </View>
              <CustomText style={styles.requestBannerText}>
                {request.type === 'connection' ? 'Connection Request' : 'Geofence Permission Request'}
              </CustomText>
            </LinearGradient>

            <View style={styles.requestDetails}>
              <View style={styles.fromSection}>
                <CustomText style={styles.detailLabel}>From:</CustomText>
                <View style={styles.personInfo}>
                  <View style={[styles.personAvatar, { backgroundColor: getPersonColor(request.from.name) }]}>
                    <CustomText style={styles.personInitial}>
                      {request.from.name.charAt(0).toUpperCase()}
                    </CustomText>
                  </View>
                  <View style={styles.personDetails}>
                    <CustomText style={styles.personName}>{request.from.name}</CustomText>
                    <CustomText style={styles.personEmail}>{request.from.email}</CustomText>
                  </View>
                </View>
              </View>

              {request.type === 'geofence' && (
                <View style={styles.geofenceSection}>
                  <CustomText style={styles.detailLabel}>Geofence:</CustomText>
                  <View style={styles.geofenceInfo}>
                    <LinearGradient
                      colors={request.geofence.color}
                      style={styles.geofenceIcon}
                    >
                      <Icon name="map-marker" size={20} color="#fff" />
                    </LinearGradient>
                    <View style={styles.geofenceDetails}>
                      <CustomText style={styles.geofenceName}>{request.geofence.name}</CustomText>
                      <CustomText style={styles.geofenceRadius}>Radius: {request.geofence.radius}m</CustomText>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.messageSection}>
                <CustomText style={styles.detailLabel}>Message:</CustomText>
                <View style={styles.messageBox}>
                  <CustomText style={styles.messageText}>{request.message}</CustomText>
                </View>
              </View>

              <View style={styles.timeSection}>
                <Icon name="clock-outline" size={16} color="#607D8B" />
                <CustomText style={styles.timeText}>
                  Received on {formatDate(request.timestamp)}
                </CustomText>
              </View>
            </View>
          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>
            <Icon name="information-outline" size={24} color="#607D8B" />
            <CustomText style={styles.infoTitle}>
              {request.type === 'connection' ? 'About Connection Requests' : 'About Geofence Permissions'}
            </CustomText>
            <CustomText style={styles.infoText}>
              {request.type === 'connection' 
                ? 'When you accept a connection request, the person will be able to see your location when you are both online. You can manage your connections and privacy settings at any time.'
                : 'When you accept a geofence permission, you will receive notifications when entering or exiting this geofence area. The owner of the geofence will also be notified of your activity within this area.'
              }
            </CustomText>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Icon name="shield-account" size={16} color="#607D8B" />
            <CustomText style={styles.privacyText}>
              You can change your privacy settings at any time in your profile.
            </CustomText>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={handleDecline}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF4785" />
            ) : (
              <>
                <Icon name="close" size={20} color="#FF4785" />
                <CustomText style={[styles.actionButtonText, styles.declineButtonText]}>
                  Decline
                </CustomText>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check" size={20} color="#fff" />
                <CustomText style={[styles.actionButtonText, styles.acceptButtonText]}>
                  Accept
                </CustomText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // All your existing styles...
  safeArea: {
    flex: 1,
    backgroundColor: '#263238',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#263238',
    borderBottomWidth: 1,
    borderBottomColor: '#37474F',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  placeholderButton: {
    width: 28,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  requestIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    padding: 8,
    marginRight: 16,
  },
  requestBannerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  requestDetails: {
    padding: 16,
  },
  fromSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    color: '#37474F',
    marginBottom: 4,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  personInitial: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    color: '#263238',
    fontWeight: 'bold',
  },
  personEmail: {
    fontSize: 14,
    color: '#607D8B',
  },
  geofenceSection: {
    marginBottom: 16,
  },
  geofenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  geofenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  geofenceDetails: {
    flex: 1,
  },
  geofenceName: {
    fontSize: 16,
    color: '#263238',
    fontWeight: 'bold',
  },
  geofenceRadius: {
    fontSize: 14,
    color: '#607D8B',
  },
  messageSection: {
    marginBottom: 16,
  },
  messageBox: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
  },
  messageText: {
    fontSize: 14,
    color: '#263238',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    color: '#263238',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#607D8B',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  privacyText: {
    fontSize: 14,
    color: '#607D8B',
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  declineButton: {
    backgroundColor: '#FF4785',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  declineButtonText: {
    color: '#fff',
  },
  acceptButtonText: {
    color: '#fff',
  },
});
export default RequestDetailsScreen;
