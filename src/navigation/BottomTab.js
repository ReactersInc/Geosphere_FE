import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Home, People, Profile, Geofences, Trackers } from './screens';
import HomeScreen from '../screens/HomeScreen';
import PeopleScreen from '../screens/PeopleScreen';
import GeofenceScreen from '../screens/GeofenceScreen';
import Trackers from '../screens/Trackers';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../constant/theme';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '../component/CustomText';

const Tab = createBottomTabNavigator();
const { height, width } = Dimensions.get('window');

const tabBarStyle = {
  height: height / 14,
  position: 'absolute',
  left: 0,
  right: 0,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
};

const BottomTab = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      inactiveColor="#3E2465"
      tabBarHideOnKeyboard={true}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarStyle: tabBarStyle,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                style={styles.icon}
                source={
                  focused
                    ? require('../../assets/icons/home_active.png')
                    : require('../../assets/icons/home.png')
                }
              />
              <CustomText
                style={[
                  styles.iconText,
                  { color: focused ? COLORS.primary : COLORS.dark },
                ]}
              >
                Home
              </CustomText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="People"
        component={PeopleScreen}
        options={{
          tabBarStyle: tabBarStyle,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                style={{ height: RFValue(22), width: RFValue(25) }}
                source={
                  focused
                    ? require('../../assets/icons/people_active.png')
                    : require('../../assets/icons/people.png')
                }
              />
              <CustomText
                style={[
                  styles.iconText,
                  { color: focused ? COLORS.primary : COLORS.dark },
                ]}
              >
                People
              </CustomText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Geofences"
        component={GeofenceScreen}
        options={{
          tabBarStyle: tabBarStyle,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                style={styles.icon}
                source={
                  focused
                    ? require('../../assets/icons/geo_active.png')
                    : require('../../assets/icons/geo.png')
                }
              />
              <CustomText
                style={[
                  styles.iconText,
                  { color: focused ? COLORS.primary : COLORS.dark },
                ]}
              >
                Geofences
              </CustomText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Trackers"
        component={Trackers}
        options={{
          tabBarStyle: tabBarStyle,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                style={styles.icon}
                source={
                  focused
                    ? require('../../assets/icons/trackers_active.png')
                    : require('../../assets/icons/trackers.png')
                }
              />
              <CustomText
                style={[
                  styles.iconText,
                  { color: focused ? COLORS.primary : COLORS.dark },
                ]}
              >
                Trackers
              </CustomText>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarStyle: tabBarStyle,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                style={styles.icon}
                source={
                  focused
                    ? require('../../assets/icons/profile_active.png')
                    : require('../../assets/icons/profile.png')
                }
              />
              <CustomText
                style={[
                  styles.iconText,
                  { color: focused ? COLORS.primary : COLORS.dark },
                ]}
              >
                Profile
              </CustomText>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  icon: {
    height: RFValue(23),
    width: RFValue(23),
  },
  iconText: {
    fontSize: RFValue(9.5),
    fontFamily: 'Manrope-Bold',
  },
});

export default BottomTab;