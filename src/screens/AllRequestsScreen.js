import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useGeofenceRequests, useGeofenceRequestActions } from '../hooks/useGeofenceRequests';

const AllRequestsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { 
    requests: apiRequests, 
    loading, 
    error, 
    refetch 
  } = useGeofenceRequests();
  const { acceptRequest, declineRequest } = useGeofenceRequestActions();
  
  const [requests, setRequests] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  

  useEffect(() => {
    if (apiRequests && apiRequests.length > 0) {
      const transformedRequests = apiRequests.map(req => ({
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
      
      setRequests(transformedRequests);
    } else {
      setRequests([]);
    }
  }, [apiRequests]);

  useEffect(() => {
    if (route.params?.refresh) {
      refetch();
    }
  }, [route.params?.refresh]);

  const handleRequestPress = (request) => {
    navigation.navigate('RequestDetailsScreen', { request });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' }) + ', ' + 
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleAccept = async (requestId) => {
    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              const result = await acceptRequest(requestId);
              if (result.success) {
                const updatedRequests = requests.filter(req => req.id !== requestId);
                setRequests(updatedRequests);
                
                // Show success message
                Alert.alert("Success", "Request accepted successfully");
              } else {
                Alert.alert("Error", result.message || "Failed to accept request");
              }
            } catch (error) {
              Alert.alert("Error", "An unexpected error occurred");
            }
          }
        }
      ]
    );
  };

  const handleDecline = async (requestId) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this request?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await declineRequest(requestId);
              if (result.success) {
                // Update the local state
                const updatedRequests = requests.filter(req => req.id !== requestId);
                setRequests(updatedRequests);
                
                // Show success message
                Alert.alert("Success", "Request declined successfully");
              } else {
                Alert.alert("Error", result.message || "Failed to decline request");
              }
            } catch (error) {
              Alert.alert("Error", "An unexpected error occurred");
            }
          }
        }
      ]
    );
  };

  const filteredRequests = () => {
    if (activeFilter === 'all') return requests;
    return requests.filter(request => request.type === activeFilter);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.requestCard}
      onPress={() => handleRequestPress(item)}>
      <View style={styles.requestHeader}>
        <View style={[styles.requestTypeIndicator, { 
          backgroundColor: item.type === 'connection' ? '#6C63FF' : '#FF9800' 
        }]} />
        <CustomText style={styles.requestType}>
          {item.type === 'connection' ? 'Connection Request' : 'Geofence Permission'}
        </CustomText>
      </View>
      
      <View style={styles.requestContent}>
        <View style={styles.fromInfo}>
          <View style={[styles.personAvatar, { 
            backgroundColor: getPersonColor(item.from.name) 
          }]}>
            <CustomText style={styles.personInitial}>
              {item.from.name.charAt(0).toUpperCase()}
            </CustomText>
          </View>
          <View style={styles.fromDetails}>
            <CustomText style={styles.fromName}>{item.from.name}</CustomText>
            {item.type === 'geofence' && (
              <CustomText style={styles.geofenceName}>
                Geofence: {item.geofence.name}
              </CustomText>
            )}
          </View>
        </View>
        
        {item.message && (
          <View style={styles.messagePreview}>
            <CustomText numberOfLines={1} style={styles.messageText}>
              {item.message}
            </CustomText>
          </View>
        )}
      </View>
      
      <View style={styles.requestFooter}>
        <View style={styles.timestampContainer}>
          <Icon name="clock-outline" size={12} color="#90A4AE" />
          <CustomText style={styles.timestamp}>
            {formatDate(item.timestamp)}
          </CustomText>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => handleDecline(item.id)}>
            <Icon name="close" size={16} color="#FF4785" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAccept(item.id)}>
            <Icon name="check" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

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
            onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitle}>
            <CustomText style={styles.titleText}>Pending Requests</CustomText>
          </View>
          <View style={styles.placeholderButton} />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
            onPress={() => setActiveFilter('all')}>
            <CustomText style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
              All
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'connection' && styles.activeFilter]}
            onPress={() => setActiveFilter('connection')}>
            <CustomText style={[styles.filterText, activeFilter === 'connection' && styles.activeFilterText]}>
              Connections
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, activeFilter === 'geofence' && styles.activeFilter]}
            onPress={() => setActiveFilter('geofence')}>
            <CustomText style={[styles.filterText, activeFilter === 'geofence' && styles.activeFilterText]}>
              Geofences
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <FlatList
          data={filteredRequests()}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6C63FF']}
            />
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#6C63FF" />
                <CustomText style={styles.emptyText}>Loading requests...</CustomText>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Icon name="check-circle-outline" size={48} color="#8BC34A" />
                <CustomText style={styles.emptyText}>No pending requests</CustomText>
                <CustomText style={styles.emptySubText}>
                  When someone sends you a connection or geofence request, it will appear here.
                </CustomText>
              </View>
            )
          }
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#263238',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    alignItems: 'center',
  },
  titleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Manrope-SemiBold',
  },
  placeholderButton: {
    width: 40,
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#EEF0FF',
  },
  filterText: {
    fontSize: 14,
    color: '#607D8B',
    fontFamily: 'Manrope-Medium',
  },
  activeFilterText: {
    color: '#6C63FF',
    fontFamily: 'Manrope-SemiBold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
  },
  requestTypeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  requestType: {
    fontSize: 14,
    color: '#455A64',
    fontFamily: 'Manrope-SemiBold',
  },
  requestContent: {
    padding: 16,
  },
  fromInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personInitial: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
  },
  fromDetails: {
    flex: 1,
  },
  fromName: {
    fontSize: 16,
    color: '#263238',
    fontFamily: 'Manrope-SemiBold',
  },
  geofenceName: {
    fontSize: 13,
    color: '#607D8B',
    fontFamily: 'Manrope-Regular',
    marginTop: 2,
  },
  messagePreview: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 10,
  },
  messageText: {
    fontSize: 13,
    color: '#455A64',
    fontFamily: 'Manrope-Regular',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECEFF1',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#90A4AE',
    marginLeft: 4,
    fontFamily: 'Manrope-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  declineButton: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#FFD0D9',
  },
  acceptButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#455A64',
    fontFamily: 'Manrope-SemiBold',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#607D8B',
    fontFamily: 'Manrope-Regular',
    textAlign: 'center',
    marginTop: 8,
  }
});

export default AllRequestsScreen;
