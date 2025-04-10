import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useUser } from '../context/userContext'
import { useNavigation } from '@react-navigation/native'

const ProfileScreen = () => {

  const {logout} = useUser()

  const navigation = useNavigation()


  const handleLogout = async () => {
    console.log("logout clicked");
    try {
    console.log("logout clicked_1");

      await logout();
      Alert.alert('Logged out', 'You have been successfully logged out.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Logout Failed', 'Something went wrong.');
    }
  };
  return (
    <View style={styles.container}>
      <Text>ProfileScreen</Text>


      <TouchableOpacity onPress={handleLogout} style={{ marginTop: 20, padding: 10, backgroundColor: 'blue', borderRadius: 5 }}>
        <Text style={{ color: 'white' }}>Logout</Text>
        {/* <Text>Logout</Text> */}
      </TouchableOpacity>

    
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default ProfileScreen

