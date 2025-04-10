import React from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
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
import AppStack from './src/navigation/AppStack';
import LoginStack from './src/navigation/LoginStack';
import ToastProvider from './src/component/ToastProvider';
import GlobalLoader from './src/component/GlobalLoader';
import { LoadingProvider } from './src/context/LoadingProvider';
import SplashScreen from './src/screens/SplashScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation';



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
          <SafeAreaProvider>
            <ToastProvider>
              <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
              
              <AppNavigation />
              
              <GlobalLoader />
              {/* <NetworkComponent /> */}
            </ToastProvider>
          </SafeAreaProvider>
        {/* </NetworkProvider> */}
      </LoadingProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

export default App;