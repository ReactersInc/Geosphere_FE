import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import { launchImageLibrary } from 'react-native-image-picker';
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
  const [photoName, setPhotoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const response = await fetch(
        'https://makemytwin.com/IoMTAppAPI//api/addGeoUser.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            u_pass: password,
            f_name: first_name,
            l_name: last_name,
            photo: "https://gratisography.com/wp-content/uploads/2024/01/gratisography-cyber-kitty-800x525.jpg",
            category: 0,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setShowVerify(true);
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://makemytwin.com/IoMTAppAPI//api/resendGeoOTP.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', data.message || 'Something went wrong');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://makemytwin.com/IoMTAppAPI//api/AuthGeoOtp.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.welcomeText}>Create Your Account</Text>
        <Text style={styles.signInText}>Sign up to manage your geofences</Text>

        <Text style={styles.textTitle}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          autoCapitalize="none"
          onChangeText={setFirstName}
          value={first_name}
        />

        <Text style={styles.textTitle}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          autoCapitalize="none"
          onChangeText={setLastName}
          value={last_name}
        />

        <Text style={styles.textTitle}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />

        <Text style={styles.textTitle}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Image
              style={{ height: RFValue(18), width: RFValue(18) }}
              source={
                showPassword
                  ? require('../assets/icons/visible.png')
                  : require('../assets/icons/invisible.png')
              }
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.textTitle}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passInput}
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Image
              style={{ height: RFValue(18), width: RFValue(18) }}
              source={
                showConfirmPassword
                  ? require('../assets/icons/visible.png')
                  : require('../assets/icons/invisible.png')
              }
            />
          </TouchableOpacity>
        </View>

        {showVerify && (
          <View>
            <Text style={styles.textTitle}>OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="OTP"
              keyboardType="numeric"
              onChangeText={setOtp}
              value={otp}
            />
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleResendOtp}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Processing...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleVerifyOtp}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Verifying...' : 'Submit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {!showVerify && (
          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.disabledButton]} 
            onPress={handleSendOtp}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.or}>
          <View style={styles.line} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.line} />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')} 
          style={styles.loginLink}
        >
          <Text style={styles.textTitle_login}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 35,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
  },
  eyeIcon: {
    paddingRight: width * 0.03,
    paddingBottom: height * 0.02,
    position: 'absolute',
    right: 0,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Manrope-ExtraBold',
    color: '#000',
    textAlign: 'left',
    marginTop: 10,
  },
  signInText: {
    fontSize: 16,
    color: '#6E6D7A',
    textAlign: 'left',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 25,
    marginTop: 5,
    color: 'black',
  },
  passInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 25,
    marginTop: 5,
    color: 'black',
  },
  textTitle: {
    color: 'black',
    fontFamily: 'Manrope-Bold',
  },
  textTitle_login: {
    color: '#7D5FFF',
    fontFamily: 'Manrope-Bold',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#3F3D56',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 30,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  or: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#ddd',
  },
  orText: {
    textAlign: 'center',
    color: '#6E6D7A',
    marginHorizontal: 10,
  },
  loginLink: {
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
});

export default RegisterScreen;