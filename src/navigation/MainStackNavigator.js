import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './BottomTabNavigator';
import { UserContext } from '../context/userContext';
import SplashScreen from '../screens/SplashScreen';
import { LoadingContext } from '../context/LoadingProvider';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';


import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';


const Stack = createStackNavigator();

const MainStackNavigator = () => {

  const { loading } = useContext(LoadingContext);
  const { token, } = useContext(UserContext);
  const [initialRoute, setInitialRoute] = useState('SplashScreen');

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        setInitialRoute(token ? 'MainApp' : 'Login');
      }, 2000);
    }
  }, [token, loading]);

  if (loading || initialRoute === 'SplashScreen') {
    return <SplashScreen />;
  }

  return (
    
    <Stack.Navigator initialRouteName={initialRoute}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainApp" component={BottomTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
      
    </Stack.Navigator>
    
  );
};

export default MainStackNavigator;