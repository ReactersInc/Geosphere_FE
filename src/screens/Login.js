import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { CommonActions, StackActions } from '@react-navigation/native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import CustomText from '../component/CustomText';
import { useUser } from '../context/userContext';
import { useProfile } from '../context/ProfileContext'; // Add this import
import { UseApi } from '../hooks/UseApi';
import { LoadingContext } from '../context/LoadingProvider';
import { jwtDecode } from 'jwt-decode';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import DeviceInfo, { getDevice } from 'react-native-device-info';
import {API_BASE_URL} from '../config/constant';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('raivivek0902@gmail.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, deviceId, fcmToken } = useUser();
  const { fetchProfile } = useProfile(); // Add this line
  const { get, post } = UseApi();
  const { loading } = useContext(LoadingContext);

  const handleLogin = async () => {
    try {
      const response = await post('/login', { email, password });

      console.log("the login response is : ", response);
      
      const { userId, firstName, lastName, sub } = jwtDecode(response?.data?.token);
      
      const userData = {
        userId: userId,
        firstName: firstName,
        lastName: lastName,
        email: email,
      };

      // Login user first
      await login(userData, response?.data?.token);

      // Send FCM token
      await handleFCMToken(response?.data?.token);

      // Profile will be automatically fetched by ProfileContext after login
      // No need to manually call fetchProfile here as it's handled in useEffect

    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const handleFCMToken = async (authToken) => {
    console.log("the auth token is : ", authToken);
    console.log("fcm function running");
    try {
      const FCMData = {
        deviceId,
        token: fcmToken,
        deviceType: Platform.OS,
      };
  
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      };


      console.log("the fcm token is : ", fcmToken);
  
      const response = await fetch(`${API_BASE_URL}/notification/fcm-token`, {
        method: 'POST',
        headers,
        body: JSON.stringify(FCMData),
      });
  
      const data = await response.json();
      console.log("the fcm token response is : ", data);
    } catch (error) {
      console.error('Error sending FCM token:', error);
    } finally {
      console.log("fcm function ran successfully");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      <LinearGradient
        colors={['#6C63FF', '#5046e5']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <CustomText style={styles.appTitle}>GeoSphere</CustomText>
          <CustomText style={styles.appSubtitle}>Location safety for everyone</CustomText>
        </View>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.welcomeSection}>
          <CustomText style={styles.welcomeText}>Welcome back</CustomText>
          <CustomText style={styles.signInText}>Sign in to your account</CustomText>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <CustomText style={styles.inputLabel}>Email</CustomText>
            <View style={styles.textInputContainer}>
              <Icon name="email-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#9E9E9E"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <CustomText style={styles.inputLabel}>Password</CustomText>
            <View style={styles.textInputContainer}>
              <Icon name="lock-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#9E9E9E"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}>
                <Icon
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#6C63FF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}>
            <CustomText style={styles.forgotPasswordText}>Forgot Password?</CustomText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={loading}>
            <LinearGradient
              colors={['#6C63FF', '#5046e5']}
              style={styles.buttonGradient}>
              <CustomText style={styles.loginButtonText}>
                {loading ? 'Signing in...' : 'Sign In'}
              </CustomText>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
          <TouchableOpacity 
            style={styles.createAccount}
            onPress={() => navigation.navigate('Register')}>
            <CustomText style={styles.createAccountText}>
              Don't have an account? <CustomText style={styles.createAccountHighlight}>Create Now</CustomText>
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerGradient: {
    height: height * 0.28,
    paddingHorizontal: width * 0.06,
    justifyContent: 'center',
  },
  headerContent: {
    marginTop: height * 0.02,
  },
  appTitle: {
    fontSize: RFValue(28),
    color: '#ffffff',
    fontFamily: 'Manrope-Bold',
  },
  appSubtitle: {
    fontSize: RFValue(14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Manrope-Medium',
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: width * 0.06,
    paddingTop: 30,
  },
  welcomeSection: {
    marginBottom: height * 0.03,
  },
  welcomeText: {
    fontSize: RFValue(24),
    fontFamily: 'Manrope-Bold',
    color: '#333',
  },
  signInText: {
    fontSize: RFValue(14),
    fontFamily: 'Manrope-Medium',
    color: '#666',
    marginTop: 6,
  },
  inputSection: {
    marginTop: height * 0.01,
  },
  inputGroup: {
    marginBottom: height * 0.02,
  },
  inputLabel: {
    fontSize: RFValue(14),
    fontFamily: 'Manrope-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: height * 0.065,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontFamily: 'Manrope-Regular',
    fontSize: RFValue(14),
    paddingVertical: 10,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.03,
  },
  forgotPasswordText: {
    color: '#6C63FF',
    fontSize: RFValue(14),
    fontFamily: 'Manrope-SemiBold',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: height * 0.02,
    elevation: 3,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: RFValue(16),
    fontFamily: 'Manrope-Bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  footerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: height * 0.05,
  },
  createAccount: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  createAccountText: {
    fontSize: RFValue(14),
    fontFamily: 'Manrope-Medium',
    color: '#666',
  },
  createAccountHighlight: {
    color: '#6C63FF',
    fontFamily: 'Manrope-Bold',
  }
});

export default Login;