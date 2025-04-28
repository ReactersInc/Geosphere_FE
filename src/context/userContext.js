import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';

// Theme Constants
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

async function requestPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== 'granted') {
      alert('Permission to show notifications denied!');
    }
  }
}

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('custom_notification', {
      name: 'Custom Notification',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'custom_notification',
    });
  }
  
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [theme, setTheme] = useState(LIGHT_THEME);
  // const navigation = useNavigation();

  // Initialize auth state and device info
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get device info
        const id = await DeviceInfo.getUniqueId();
        setDeviceId(id);
        
        // Setup notifications
        await requestPermissions();
        await setupNotificationChannel();

        // Get FCM token
        if (messaging().isDeviceRegisteredForRemoteMessages) {
          const token = await messaging().getToken();
          setFcmToken(token);
        }

        // Load stored auth data
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('user')
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }

        // Load theme preference
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize app. Please restart.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    // Setup notification listeners
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('A new FCM message arrived!', remoteMessage);
    
      const { title, body, image } = remoteMessage.notification || {
        title: remoteMessage.data.title || 'New Notification',
        body: remoteMessage.data.body || 'You have a new message!',
        image: remoteMessage.data.image || null
      };
    
      const notificationContent = {
        title: typeof title === 'string' ? title : JSON.stringify(title),
        body: typeof body === 'string' ? body : JSON.stringify(body),
        sound: true,
      };
    
      if (image && Platform.OS === 'android') {
        notificationContent.android = {
          imageUrl: image
        };
      }
    
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Notification handlers
  useEffect(() => {
    const unsubscribeForeground = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });
  
    const unsubscribeBackground = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      const data = response.notification.request.content.data;
      // if (data?.screen) {
      //   // navigation.navigate(data.screen);
      // }
    });
  
    return () => {
      unsubscribeForeground?.remove();
      unsubscribeBackground?.remove();
    };
  }, []);

  const login = async (userData, authToken) => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        AsyncStorage.setItem('authToken', authToken),
        AsyncStorage.setItem('user', JSON.stringify(userData))
        
      ]);

      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      console.error('Login storage error:', error);
      setError('Failed to save login data. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        AsyncStorage.removeItem('authToken'),
        AsyncStorage.removeItem('user'),
        // AsyncStorage.removeItem('appTheme'),
      ]);

      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setTheme(LIGHT_THEME);
      
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout properly. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
    setTheme(newTheme);
    await AsyncStorage.setItem('appTheme', newTheme);
  };


  // console.log("user detals are ", user);

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        error,
        setError,
        login,
        logout,
        deviceId,
        fcmToken,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};