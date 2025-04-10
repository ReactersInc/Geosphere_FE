import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';
import Login from '../screens/Login';
import RegisterScreen from '../screens/Register';
import Frogotpassword from '../screens/ForgotPassword';

const Stack = createNativeStackNavigator();

const LoginStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FroGotPassword"
        component={Frogotpassword}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default LoginStack;
