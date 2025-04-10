import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import BottomTab from './BottomTab';
// import { AddPersonScreen, Alerts } from './screens';
import AddPersonScreen from '../screens/AddPersonScreen';
import Alerts from '../screens/Alerts';
import GeoZoneScreen from '../screens/GeoZoneScreen';
import EditGeofenceScreen from '../screens/EditGeoFenceScreen';
import AddGeofenceScreen from '../screens/AddGeofenceScreen';
import Invitation from '../screens/Invitation';
import MsgSend from '../screens/MsgSend';
import PeopleGeoZoneScreen from '../screens/PeopleGeoZoneScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (

<Stack.Navigator
      initialRouteName="BottomTab"
      screenOptions={{ headerShown: true }}
    >
      <Stack.Screen
        name="BottomTab"
        component={BottomTab}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddPerson"
        component={AddPersonScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PeopleGeoZone"
        component={PeopleGeoZoneScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GeoZone"
        component={GeoZoneScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditGeofence"
        component={EditGeofenceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddGeofence"
        component={AddGeofenceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Alerts"
        component={Alerts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Invitation"
        component={Invitation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MsgSend"
        component={MsgSend}
        options={{ title: 'MsgSend' }}
      />
    </Stack.Navigator>

    
  );
};

export default AppStack;