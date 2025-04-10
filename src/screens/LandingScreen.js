import React from 'react';
import {
  View,
  
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { StackActions } from '@react-navigation/native';
import CustomText from '../component/CustomText';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/pana.png')}
          style={styles.image1}
        />
        <CustomText style={styles.textBelowImage}>Welcome to Geofencing App</CustomText>
        <CustomText style={styles.textBelowImageDesc}></CustomText>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => navigation.dispatch(StackActions.replace('Login'))}>
        <CustomText style={styles.buttonText}>Login</CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.registerButton]}
        onPress={() => navigation.dispatch(StackActions.replace('Register'))}>
        <CustomText style={styles.buttonText}>Register</CustomText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width,
  },
  content: {
    alignItems: 'center',
  },
  image1: {
    width: width * 0.8,
    height: null,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginVertical: 0,
    alignSelf: 'center',
  },
  textBelowImage: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Manrope-Bold',
    color: '#6C63FF',
    marginTop: 20,
    marginBottom: 10,
  },
  textBelowImageDesc: {
    textAlign: 'center',
    fontSize: 12,
    color: '#3F3D56',
    paddingHorizontal: 20,
    marginBottom: 10,
    fontFamily: 'Manrope-Bold',
  },
  paginatorContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    width: '40%',
    backgroundColor: '#3F3D56',
    paddingVertical: 15,
    paddingHorizontal: 6,
    borderRadius: 18,
    marginBottom: 15,
  },
  loginButton: {
    position: 'absolute',
    bottom: 120,
  },
  registerButton: {
    position: 'absolute',
    bottom: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(12),
    fontFamily: 'Manrope-Bold',
  },
});

export default LandingScreen;
