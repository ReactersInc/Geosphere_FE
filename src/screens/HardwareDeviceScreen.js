import React, { useEffect, useState } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { UseApi } from '../hooks/UseApi';
import CustomText from '../component/CustomText';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HardwareDevicesScreen = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = UseApi();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/hardware/user');
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDeviceItem = ({ item }) => (
    <View style={styles.deviceCard}>
      <Icon name="devices" size={24} color="#6C63FF" />
      <View style={styles.deviceInfo}>
        <CustomText style={styles.deviceMac}>{item.macId}</CustomText>
        <CustomText style={styles.deviceStatus}>
          {item.status === 'active' ? 'Connected' : 'Inactive'}
        </CustomText>
      </View>
    </View>
  );

  return (
    <FlatList
      data={devices}
      renderItem={renderDeviceItem}
      keyExtractor={item => item.macId}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <CustomText style={styles.emptyText}>
          {loading ? 'Loading...' : 'No devices linked'}
        </CustomText>
      }
    />
  );
};

const styles = StyleSheet.create({
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8
  },
  deviceInfo: {
    marginLeft: 16
  },
  deviceMac: {
    fontSize: 16,
    color: '#333'
  },
  deviceStatus: {
    color: '#666'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20
  }
});

export default HardwareDevicesScreen;
