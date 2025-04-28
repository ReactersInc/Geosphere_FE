import React from 'react';
import { StatusBar, View, ActivityIndicator, LogBox, SafeAreaView } from 'react-native';
import 'react-native-get-random-values'; 
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';

import { UserProvider, useUser } from './src/context/userContext';

import ToastProvider from './src/component/ToastProvider';
import GlobalLoader from './src/component/GlobalLoader';
import { LoadingProvider } from './src/context/LoadingProvider';
import SplashScreen from './src/screens/SplashScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation';
import ConfirmationProvider from './src/component/ConfirmationProvider';



LogBox.ignoreAllLogs(true); 

const App = () => {

  // const { isAuthenticated, isLoading, theme } = useUser();
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
        {/* <NetworkProvider> */}
          <SafeAreaView style={{ flex:1 }}>
              <ConfirmationProvider>
            <ToastProvider>

             <StatusBar backgroundColor="#F8F9FB" barStyle="dark-content" />
              
              <AppNavigation />
              
              <GlobalLoader />
              {/* <NetworkComponent /> */}

            </ToastProvider>
              </ConfirmationProvider>
          </SafeAreaView>
        {/* </NetworkProvider> */}
      </LoadingProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

export default App;