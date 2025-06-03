// App.js - Updated version
import React, { useEffect } from 'react';
import { StatusBar, LogBox, SafeAreaView } from 'react-native';
import 'react-native-get-random-values'; 
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';

import { UserProvider } from './src/context/userContext';
import ToastProvider from './src/component/ToastProvider';
import GlobalLoader from './src/component/GlobalLoader';
import { LoadingProvider } from './src/context/LoadingProvider';
import SplashScreen from './src/screens/SplashScreen';
import AppNavigation from './src/navigation';
import ConfirmationProvider from './src/component/ConfirmationProvider';
import LocationTrackingService from './src/service/LocationTrackingService';
import WebSocketService from './src/service/WebSocketService';
import { ProfileProvider } from './src/context/ProfileContext';

LogBox.ignoreAllLogs(true); 

const AppContent = () => {

  
  // Remove the useUser hook from here since it might cause navigation issues
  // Move location tracking initialization to a screen component instead
  
  return (
    <AppNavigation />
  );
};

const App = () => {
  const [fontsLoaded] = useFonts({
    Manrope_Regular: Manrope_400Regular,
    Manrope_Medium: Manrope_500Medium,
    Manrope_SemiBold: Manrope_600SemiBold,
    Manrope_Bold: Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <LoadingProvider>
        
              <ToastProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <ConfirmationProvider>
                <StatusBar backgroundColor="#F8F9FB" barStyle="dark-content" />
                <AppContent />
                <GlobalLoader />
            </ConfirmationProvider>
          </SafeAreaView>
              </ToastProvider>
        
        </LoadingProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
};

export default App;
