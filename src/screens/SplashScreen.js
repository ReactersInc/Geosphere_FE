import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import CustomText from '../component/CustomText';
import { StackActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const data = {
  id: '1',
  image: require('../../assets/images/bro.png'),
  text: 'Welcome to GeoFencer',
  desc: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui dicta minus molestiae vel beatae natus eveniet ratione temporibus aperiam harum alias officiis assumenda officia quibusdam deleniti eos cupiditate dolore doloribus!',
};

const SplashScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.slide}>
        <View style={styles.content}>
          <Image source={data.image} style={styles.image1} />
          <CustomText style={styles.textBelowImage}>{data.text}</CustomText>
          <CustomText style={styles.textBelowImageDesc}>{data.desc}</CustomText>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.dispatch(StackActions.replace('Landing'))}
      >
        <CustomText style={styles.buttonText}>Get Started</CustomText>
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
    alignSelf: 'center',
  },
  textBelowImage: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Manrope-ExtraBold',
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
    fontFamily: 'Manrope-Medium',
  },
  button: {
    marginBottom: 30,
    backgroundColor: '#3F3D56',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
  },
});

export default SplashScreen;
