import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { UseApi } from '../hooks/UseApi';
import { useToast } from '../component/ToastProvider';
import { useConfirmation } from '../component/ConfirmationProvider';
import { useUser } from '../context/userContext';
import { jwtDecode } from 'jwt-decode';

export default function SimpleQRScanner() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState('');
  const api = UseApi(); 
  const navigation = useNavigation();
  const {showToast}= useToast();
  const {showConfirmation}= useConfirmation();
  const {token}= useUser();
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {

        showConfirmation({
          title: 'Camera Permission Required',
          message: 'Please grant camera permission to scan QR codes',
          confirmText: 'Grant Permission',
          cancelText: 'Cancel',
          onConfirm: async () => {
            const { status: newStatus } = await Camera.requestCameraPermissionsAsync();
            if (newStatus === 'granted') {
              setHasPermission(true);
            } else {
              setHasPermission(false);
            }
          },
          onCancel: () => {
            setHasPermission(false);
          }
        });
        
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  
    
    const validateMacId = (mac) => {
      const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      return macPattern.test(mac);
    };

    const {userId} = jwtDecode(token);

    const handleDeviceUserMapping = async (macId) => {
      try {
        const response = await api.post('/hardware/user', {
          hardwareMac: macId,
          userId: userId, 
          battery:84
        });
        if (response.result.responseCode === 200) {
          showToast({ message: 'Device user mapping successful', type: 'success', position: 'top', icon: 'checkmark-circle' });
          navigation.navigate('HardwareDevices');
        } else {
          showToast({ message: 'Device user mapping failed', type: 'error', position: 'top', icon: 'close-circle' });
        }
      }
      catch (error) {
        console.error('Error mapping device to user:', error);
        showToast({ message: 'Device user mapping failed', type: 'error', position: 'top', icon: 'close-circle' });
      }
    }


    const handleBarCodeScanned = async ({ data }) => {
    // if (!validateMacId(data)) {
    //   showToast({ message: 'Invalid QR code format', type: 'error', position: 'top', icon: 'close-circle' });
    //   setScanned(false);
    //   return;
    // }

    setScanned(true);
    try {
      const response = await api.post('/hardware', { model: "X-1000",
    manufacturer: "GeoTech",
    macAddress: data});
      if (response.result.responseCode === 200) {
        showToast({ message: 'Device registered successfully', type: 'success', position: 'top', icon: 'checkmark-circle' });
        handleDeviceUserMapping( data);
        
      }else{
        showToast({ message: 'Registration failed', type: 'error', position: 'top', icon: 'close-circle' });
        navigation.goBack();
        setScanned(false);
      }
    } catch (error) {
      showToast({ message: 'Registration failed', type: 'error', position: 'top', icon: 'close-circle' });
      navigation.goBack();
      setScanned(false);
    }
  

    
  };

  

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Scanning overlay */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer} />
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer} />
          <View style={styles.focusedContainer}>
            <Text style={styles.scanText}>Point camera at QR code</Text>
          </View>
          <View style={styles.unfocusedContainer} />
        </View>
        <View style={styles.unfocusedContainer} />
      </View>

      {scanned && (
        <View style={styles.resultOverlay}>
          <Text style={styles.resultText}>Scanned: {data}</Text>
          <TouchableOpacity 
            onPress={() => setScanned(false)} 
            style={styles.rescanButton}
          >
            <Text style={styles.buttonText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  middleContainer: {
    flexDirection: 'row',
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    borderWidth: 2,
    borderColor: '#00ff00',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  resultOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  rescanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});