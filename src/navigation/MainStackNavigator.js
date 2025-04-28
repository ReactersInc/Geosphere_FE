import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import { UserContext } from '../context/userContext';
import SplashScreen from '../screens/SplashScreen';
import { LoadingContext } from '../context/LoadingProvider';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
import HomeScreen from '../screens/HomeScreen';
import LandingScreen from '../screens/LandingScreen';
import LiveMapScreen from '../screens/LiveMapScreen';
import CreateGeofenceScreen from '../screens/CreateGeofenceScreen';

import GeoZoneScreen from '../screens/GeoZoneScreen';
import UserDiscoveryScreen from '../screens/UserDiscoveryScreen';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  const { loading } = useContext(LoadingContext);
  const { token, isAuthenticated } = useContext(UserContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          
          {/* <Stack.Screen name="landing" component={LandingScreen} /> */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="LiveMapScreen" component={LiveMapScreen} />
          <Stack.Screen name="CreateGeofenceScreen" component={CreateGeofenceScreen} />
          
          <Stack.Screen name="GeoZoneScreen" component={GeoZoneScreen} />
          <Stack.Screen name="UserDiscoveryScreen" component={UserDiscoveryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
