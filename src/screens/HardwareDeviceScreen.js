import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { UseApi } from '../hooks/UseApi';
import CustomText from '../component/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const HardwareDevicesScreen = () => {
  const navigation = useNavigation();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = UseApi();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/hardware/user');
      setDevices(response.data.hardwareList || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.deviceCard,
        item.statusId === 1 ? styles.activeCard : styles.inactiveCard
      ]}
      activeOpacity={0.8}
      onPress={() => console.log('Device pressed', item.id)}
    >
      <View style={styles.deviceIconContainer}>
        <Icon 
          name={item.statusId === 1 ? "devices" : "devices-off"} 
          size={32} 
          color={item.statusId === 1 ? "#6C63FF" : "#A5A5A5"} 
        />
      </View>
      <View style={styles.deviceInfo}>
        <CustomText style={styles.deviceModel}>{item.model}</CustomText>
        <CustomText style={styles.deviceManufacturer}>{item.manufacturer}</CustomText>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusIndicator, 
            item.statusId === 1 ? styles.active : styles.inactive
          ]} />
          <CustomText style={[
            styles.deviceStatusText,
            item.statusId === 1 ? styles.activeStatusText : styles.inactiveStatusText
          ]}>
            {item.statusId === 1 ? 'Active' : 'Inactive'}
          </CustomText>
        </View>
        
        <View style={styles.dateContainer}>
          <Icon name="calendar" size={14} color="#888" />
          <CustomText style={styles.deviceDateText}>
            Added: {new Date(item.createdAt).toLocaleDateString()}
          </CustomText>
        </View>
      </View>
      <Icon name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6C63FF" barStyle="light-content" />
      
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <CustomText style={styles.headerTitle}>My Devices</CustomText>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={devices}
        renderItem={renderDeviceItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="devices-off" size={60} color="#D1D1D6" />
            </View>
            <CustomText style={styles.emptyTitle}>No Devices Found</CustomText>
            <CustomText style={styles.emptyText}>
              {loading ? 'Loading your devices...' : 'You have no devices linked to your account yet'}
            </CustomText>
          </View>
        }
        ListHeaderComponent={
          devices.length > 0 && (
            <View style={styles.listHeader}>
              <CustomText style={styles.headerText}>
                Your Devices <CustomText style={styles.deviceCount}>({devices.length})</CustomText>
              </CustomText>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#6C63FF',
    paddingTop: StatusBar.currentHeight + 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  headerRight: {
    width: 24,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  listHeader: {
    marginBottom: 16,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#444',
  },
  deviceCount: {
    color: '#6C63FF',
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activeCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#6C63FF',
  },
  inactiveCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#D1D1D6',
  },
  deviceIconContainer: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceModel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  deviceManufacturer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  active: {
    backgroundColor: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#F44336',
  },
  deviceStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#4CAF50',
  },
  inactiveStatusText: {
    color: '#F44336',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  devicedateText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconContainer: {
    backgroundColor: 'rgba(209, 209, 214, 0.2)',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default HardwareDevicesScreen;