import React, { useContext, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import CustomText from '../component/CustomText';
import { launchImageLibrary } from 'react-native-image-picker';
import { UseApi } from '../hooks/UseApi';
import { LoadingContext } from '../context/LoadingProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showVerify, setShowVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoName, setPhotoName] = useState('helloPhoto');
  const [isLoading, setIsLoading] = useState(false);

  const { get, post } = UseApi();
  const { loading } = useContext(LoadingContext);

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        Alert.alert('You did not select any image');
      } else if (response.errorMessage) {
        Alert.alert('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedPhoto = response.assets[0];
        setPhotoName(selectedPhoto.fileName || 'No name');
      }
    });
  };

  const handleSendOtp = async () => {
    console.log("hello 1");
    if (!first_name || !last_name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
    
    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      Alert.alert(
        'Error',
        'Password should be at least 8 characters long and contain a special character'
      );
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const payload = {
      email: email,
      password: password,
      firstName: first_name,
      lastName: last_name,
      photo: photoName,
      publicProfile: true,
    };

    console.log("the payload is : ", payload);

    try {
      const response = await post('/auth/register-user', payload);
      console.log("Register response is ", response);
      if (response) {
        setShowVerify(true);
        Alert.alert('Success', response.message);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert('Error', 'Failed to send OTP');
    }
  };

  const handleResendOtp = async () => {

    try {

      const response = await post('/auth/resend-otp', { 
        email
      });

      if (response) {
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', 'Failed to resend OTP');
      }
      
    } catch (error) {
      console.error('Error during resend OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP');
      
    }
   
   
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await post('/auth/verify-otp', { 
        email, 
        otp 
      });

      if (response) {
        Alert.alert('Success', 'Registration Complete');
        navigation.navigate('Login');
        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
      
      <LinearGradient
        colors={['#6C63FF', '#5046e5']}
        style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <CustomText style={styles.appTitle}>Create Account</CustomText>
            <CustomText style={styles.appSubtitle}>Join the SafeZone community</CustomText>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>First Name</CustomText>
              <View style={styles.textInputContainer}>
                <Icon name="account-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9E9E9E"
                  autoCapitalize="words"
                  onChangeText={setFirstName}
                  value={first_name}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Last Name</CustomText>
              <View style={styles.textInputContainer}>
                <Icon name="account-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9E9E9E"
                  autoCapitalize="words"
                  onChangeText={setLastName}
                  value={last_name}
                />
              </View>
            </View>

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
                  onChangeText={setEmail}
                  value={email}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Password</CustomText>
              <View style={styles.textInputContainer}>
                <Icon name="lock-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create password"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  value={password}
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
              <CustomText style={styles.passwordHint}>
                Must be at least 8 characters with 1 special character
              </CustomText>
            </View>

            <View style={styles.inputGroup}>
              <CustomText style={styles.inputLabel}>Confirm Password</CustomText>
              <View style={styles.textInputContainer}>
                <Icon name="lock-check-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9E9E9E"
                  secureTextEntry={!showConfirmPassword}
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}>
                  <Icon
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6C63FF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {showVerify && (
              <View style={styles.otpContainer}>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <CustomText style={styles.dividerText}>Enter OTP</CustomText>
                  <View style={styles.dividerLine} />
                </View>
                
                <View style={styles.inputGroup}>
                  <CustomText style={styles.inputLabel}>Verification Code</CustomText>
                  <View style={styles.textInputContainer}>
                    <Icon name="shield-check-outline" size={20} color="#6C63FF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter OTP sent to your email"
                      placeholderTextColor="#9E9E9E"
                      keyboardType="numeric"
                      onChangeText={setOtp}
                      value={otp}
                    />
                  </View>
                </View>

                <View style={styles.otpButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.secondaryButton, isLoading && styles.disabledButton]} 
                    onPress={handleResendOtp}
                    disabled={isLoading}>
                    <CustomText style={styles.secondaryButtonText}>
                      {isLoading ? 'Sending...' : 'Resend OTP'}
                    </CustomText>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                    onPress={handleVerifyOtp}
                    disabled={isLoading}>
                    <LinearGradient
                      colors={['#6C63FF', '#5046e5']}
                      style={styles.buttonGradient}>
                      <CustomText style={styles.primaryButtonText}>
                        {isLoading ? 'Verifying...' : 'Verify & Register'}
                      </CustomText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!showVerify && (
              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.disabledButton]} 
                onPress={handleSendOtp}
                disabled={isLoading}>
                <LinearGradient
                  colors={['#6C63FF', '#5046e5']}
                  style={styles.buttonGradient}>
                  <CustomText style={styles.primaryButtonText}>
                    {isLoading ? 'Sending...' : 'Continue'}
                  </CustomText>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <View style={styles.loginPrompt}>
              <CustomText style={styles.loginPromptText}>
                Already have an account? 
              </CustomText>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <CustomText style={styles.loginLink}>Login</CustomText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  headerGradient: {
    height: height * 0.18,
    paddingHorizontal: width * 0.06,
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  appTitle: {
    fontSize: RFValue(20),
    color: '#ffffff',
    fontFamily: 'Manrope-Bold',
  },
  appSubtitle: {
    fontSize: RFValue(12),
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Manrope-Medium',
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: width * 0.06,
    paddingVertical: 30,
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
    height: height * 0.06,
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
  passwordHint: {
    fontSize: RFValue(11),
    color: '#666',
    fontFamily: 'Manrope-Regular',
    marginTop: 4,
    marginLeft: 4,
  },
  primaryButton: {
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
  primaryButtonText: {
    color: '#FFF',
    fontSize: RFValue(16),
    fontFamily: 'Manrope-Bold',
  },
  secondaryButton: {
    paddingVertical: height * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6C63FF',
    marginBottom: height * 0.02,
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: RFValue(14),
    fontFamily: 'Manrope-SemiBold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  loginPromptText: {
    fontSize: RFValue(14),
    fontFamily: 'Manrope-Medium',
    color: '#666',
  },
  loginLink: {
    fontSize: RFValue(14),
    fontFamily: 'Manrope-Bold',
    color: '#6C63FF',
    marginLeft: 5,
  },
  otpContainer: {
    marginTop: height * 0.01,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: RFValue(14),
    fontFamily: 'Manrope-SemiBold',
    color: '#666',
  },
  otpButtonsContainer: {
    marginTop: height * 0.01,
  }
});

export default RegisterScreen;