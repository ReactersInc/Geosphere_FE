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
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { UseApi } from '../hooks/UseApi';
import { useToast } from '../component/ToastProvider';
import { useConfirmation } from '../component/ConfirmationProvider';

// Get device dimensions
const { height, width } = Dimensions.get('window');

const UserDiscoveryScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const { user } = useUser();

   const { get, put, post } = UseApi();

   const {showToast}= useToast();
   const { showConfirmation } = useConfirmation();

  
  
  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await get('/public-profiles')
      console.log("the response is : ", response?.data?.list);
      
      const apiUsers = response.data.list.map(user => ({
        id: user.id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        username: `@${user.firstName.toLowerCase()}${user.lastName.toLowerCase()}`,
        bio: 'Bio not available', 
        avatar: user.photo,
        location: 'Location not specified', 
        mutualConnections: Math.floor(Math.random() * 5), 
        requestSent: user.requested || false, 
        isConnected: user.connected || false,
      }));
      setUsersData(apiUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast({
        type: 'error',
        message: 'Failed to fetch users. Please try again later.',
      });
    } 
  };

  
  const fetchPendingRequests = async () => {
    try {
      const response = await get('/connection-request');
      setPendingRequestsCount(response?.data?.count); 
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    // fetchPendingRequests();
  }, []);

  // Filter users based on search
  const filteredUsers = usersData.filter(user => 
    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
    user.username.toLowerCase().includes(searchText.toLowerCase()) ||
    user.location.toLowerCase().includes(searchText.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchText.toLowerCase())
  );

  // Send connection request
  const handleSendRequest = async (userId) => {
    try {
      
      const response = await post('/connection-request', {
        targetUserId: userId
      });  

      console.log("the response is : ", response);
      showConfirmation({
        title: 'Request Sent',
        message: 'Connection request sent successfully.',
        onConfirm: () => {
          setUsersData(prevUsers => 
            prevUsers.map(user => 
              user.id === userId 
                ? { ...user, requestSent: true } 
                : user
            )
          );
        },
        onCancel: () => {},
      });
      showToast({
        type: 'success',
        message: 'Connection request sent successfully!',
      }
      );
    } catch (error) {
      console.error('Error sending request:', error);
      // showToast({
      //   type: 'error',
      //   message: error || 'Failed to send request.',
      // });
    }
  };

  // Cancel sent request
  const handleCancelRequest = async (userId) => {
    try {
     
      await put(`/reject/${userId}`);
      
      setUsersData(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, requestSent: false } 
            : user
        )
      );
    } catch (error) {
      console.error('Error canceling request:', error);
      Alert.alert("Error", "Failed to cancel request");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate consistent avatar colors based on person name
  const getPersonColor = (name) => {
    const charCode = name.charCodeAt(0);
    const hue = (charCode * 15) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Render user item
  const renderUserItem = ({ item }) => {
    const userColor = getPersonColor(item.name);
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }} 
              style={styles.userAvatar} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.userAvatar, { backgroundColor: userColor }]}>
              <CustomText style={styles.userInitial}>
                {item.name.charAt(0).toUpperCase()}
              </CustomText>
            </View>
          )}
          
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <CustomText style={styles.userName}>{item.name}</CustomText>
              <CustomText style={styles.username}>{item.username}</CustomText>
            </View>
            
            <CustomText style={styles.userBio} numberOfLines={2}>
              {item.bio}
            </CustomText>
            
            <View style={styles.locationRow}>
              <Icon name="map-marker" size={14} color="#666" />
              <CustomText style={styles.locationText}>{item.location}</CustomText>
            </View>
            
            {item.mutualConnections > 0 && (
              <View style={styles.mutualConnectionsRow}>
                <Icon name="account-group" size={14} color="#6C63FF" />
                <CustomText style={styles.mutualConnectionsText}>
                  {item.mutualConnections} mutual connection{item.mutualConnections !== 1 ? 's' : ''}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.actionButton,
            item.requestSent ? styles.cancelButton : styles.connectButton
          ]}
          onPress={() => item.requestSent 
            ? handleCancelRequest(item.id) 
            : handleSendRequest(item.id)
          }
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon 
                name={item.requestSent ? "close" : "account-plus"} 
                size={16} 
                color="#fff" 
                style={styles.actionButtonIcon} 
              />
              <CustomText style={styles.actionButtonText}>
                {item.requestSent ? "Cancel" : "Connect"}
              </CustomText>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <CustomText style={styles.screenTitle}>Discover People</CustomText>
          <TouchableOpacity 
            style={styles.filtersButton}
            onPress={() => navigation.navigate('DiscoveryFilters')}>
            <Icon name="filter-variant" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users by name, location..."
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

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <CustomText style={styles.statNumber}>{filteredUsers.length}</CustomText>
            <CustomText style={styles.statLabel}>People Found</CustomText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <CustomText style={styles.statNumber}>
              {pendingRequestsCount}
            </CustomText>
            <CustomText style={styles.statLabel}>Pending Requests</CustomText>
          </View>
        </View>

        {isLoading && usersData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C63FF" />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-search-outline" size={64} color="#ccc" />
                <CustomText style={styles.emptyText}>No users found</CustomText>
                <CustomText style={styles.emptySubText}>
                  Try adjusting your search criteria
                </CustomText>
              </View>
            }
          />
        )}

        <TouchableOpacity
          style={styles.requestsButton}
          onPress={() => navigation.navigate('PendingRequests')}>
          <LinearGradient
            colors={['#6C63FF', '#5046e5']}
            style={styles.requestsButtonGradient}>
            <Icon name="account-clock" size={24} color="#fff" />
            {pendingRequestsCount > 0 && (
              <View style={styles.badge}>
                <CustomText style={styles.badgeText}>
                  {pendingRequestsCount > 9 ? '9+' : pendingRequestsCount}
                </CustomText>
              </View>
            )}
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
  filtersButton: {
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
  statsContainer: {
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
  usersList: {
    paddingBottom: 80,
  },
  userCard: {
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Manrope-Bold',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Manrope-SemiBold',
  },
  username: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Medium',
  },
  userBio: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginTop: 4,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginLeft: 4,
  },
  mutualConnectionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  mutualConnectionsText: {
    fontSize: 12,
    color: '#6C63FF',
    fontFamily: 'Manrope-Medium',
    marginLeft: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  connectButton: {
    backgroundColor: '#6C63FF',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Manrope-SemiBold',
  },
  requestsButton: {
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
  requestsButtonGradient: {
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

export default UserDiscoveryScreen;