import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../component/CustomText';
import { NavigationContainerRef } from '@react-navigation/native';
// import getFont from '../../utils/util';

const Tab = createBottomTabNavigator();

export const navigationRef = React.createRef();

const EmptyScreen = () => {
  return null;
};

const BottomTabNavigator = () => {
//   const [menuVisible, setMenuVisible] = useState(false);
//   const [animation] = useState(new Animated.Value(0));

//   const toggleMenu = () => {
//     if (menuVisible) {
//       Animated.timing(animation, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }).start(() => setMenuVisible(false));
//     } else {
//       setMenuVisible(true);
//       Animated.timing(animation, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }).start();
//     }
//   };

//   const menuTranslateY = animation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [100, 0],
//   });

//   const menuOpacity = animation.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0, 1],
//   });

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarItemStyle: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 8,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const iconSize = 24;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'People') {
              iconName = focused ? 'people' : 'people-circle-outline';
            } else if (route.name === 'Geofences') {
                iconName = focused ? 'location' : 'location-outline';
            //   iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Trackers') {
              iconName = focused ? 'map' : 'map-outline';
            //   iconName = focused ? 'podium' : 'podium-outline';
            } else if (route.name === 'Championship') {
              iconName = focused ? 'trophy' : 'trophy-outline';   
            }else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return (
              <View style={focused ? {
                backgroundColor: 'rgba(110, 69, 226, 0.1)',
                padding: 0,
                borderRadius: 16,
              } : null}>
                <Ionicons 
                  name={iconName} 
                  size={iconSize} 
                  color={focused ? '#6E45E2' : '#888'} 
                />
              </View>
            );
          },
          tabBarLabelStyle: {
            fontSize: 10,
            marginTop: 4,
          },
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#6E45E2',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            height: 70,
            position: 'absolute',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
          tabBarActiveTintColor: '#6E45E2',
          tabBarInactiveTintColor: '#888',
          ellipsizeMode: 'tail',
          numberOfLines: 1,
          tabBarShowLabel: true,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={require('../../src/screens/HomeScreen').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText  ellipsizeMode='tail' numberOfLines={1}  style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 }}>Home</CustomText>
          }} 
        />
        <Tab.Screen 
          name="People" 
          component={require('../../src/screens/PeopleScreen').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText  ellipsizeMode='tail' numberOfLines={1} style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 }}>People</CustomText>
          }} 
        />
        {/* <Tab.Screen 
          name="Concept" 
          component={require('../screens/ConceptScreen').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 }}>Concepts</CustomText>
          }} 
        /> */}
        <Tab.Screen 
          name="Geofences" 
          component={require('../../src/screens/GeofenceScreen').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText ellipsizeMode='tail' numberOfLines={1}  style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 ,  }}>Geofences</CustomText>
          }} 
        />
        <Tab.Screen 
          name="Trackers" 
          component={require('../../src/screens/Trackers').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText ellipsizeMode='tail' numberOfLines={1} style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 }}>Trackers</CustomText>
          }} 
        />
        <Tab.Screen 
          name="Profile" 
          component={require('../../src/screens/ProfileScreen').default} 
          options={{
            tabBarLabel: ({ focused }) => <CustomText ellipsizeMode='tail' numberOfLines={1} style={{ color: focused ? '#6E45E2' : '#888', fontSize:10 }}>Profile</CustomText>
          }} 
        />
      </Tab.Navigator>

      {/* Menu Popup */}
      {/* {menuVisible && (
        <View style={styles.menuOverlay} onTouchStart={toggleMenu}>
          <Animated.View style={[
            styles.menuContainer,
            {
              opacity: menuOpacity,
              transform: [{ translateY: menuTranslateY }],
            }
          ]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                navigationRef.current?.navigate('Championship');
              }}
            >
              <Ionicons name="trophy-outline" size={24} color="#6E45E2" />
              <CustomText style={styles.menuText}>Championship</CustomText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                toggleMenu();
                navigationRef.current?.navigate('Profile');
              }}
            >
              <Ionicons name="person-outline" size={24} color="#6E45E2" />
              <CustomText style={styles.menuText}>Profile</CustomText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )} */}
    </>
  );
};

const styles = StyleSheet.create({
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    margin: 20,
    marginBottom: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    marginLeft: 12,
    color: '#6E45E2',
    fontSize: 14,
  },
});

export default BottomTabNavigator;