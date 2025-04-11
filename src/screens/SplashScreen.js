import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';
import { StackActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Animation for fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after 2 seconds
    const timer = setTimeout(() => {
      // navigation.dispatch(StackActions.replace('Main'));
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FB', '#EFF1F5']}
        style={styles.gradientBackground}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#6C63FF', '#5046e5']}
              style={styles.logoBackground}
            >
              <Icon name="map-marker-radius" size={36} color="#fff" />
            </LinearGradient>
          </View>

          <Image
            source={require('../../assets/images/bro.png')}
            style={styles.image}
          />

          <View style={styles.textContainer}>
            <CustomText style={styles.title}>GeoSphere</CustomText>
            <CustomText style={styles.subtitle}>Location Safety Made Simple</CustomText>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#6C63FF', '#5046e5']}
                  style={styles.featureIconBackground}
                >
                  <Icon name="map-marker-radius" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <CustomText style={styles.featureText}>Custom Geofences</CustomText>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF4785']}
                  style={styles.featureIconBackground}
                >
                  <Icon name="account-group" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <CustomText style={styles.featureText}>Family Tracking</CustomText>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.featureIconBackground}
                >
                  <Icon name="bell-ring" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <CustomText style={styles.featureText}>Instant Alerts</CustomText>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  image: {
    width: width * 0.7,
    height: width * 0.5,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: 32,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
    width: '33%',
  },
  featureIconContainer: {
    marginBottom: 8,
  },
  featureIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  featureText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
});

export default SplashScreen;