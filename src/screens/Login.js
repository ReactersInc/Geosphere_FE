// screens/Login.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { StackActions } from '@react-navigation/native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { useUser } from '../contexts/UserContext';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useUser();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigation.dispatch(StackActions.replace('AppStack'));
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to login');
    }
  };

  return (
    <View style={styles.container1}>
      <ImageBackground
        source={require('../../assets/images/header_bg.png')}
        style={styles.image}>
        <TouchableOpacity
          onPress={() => navigation.replace('Splash')}
          style={styles.backButton}>
          <Image source={require('../../assets/icons/back_white.png')} />
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.container}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.signInText}>sign in to your account</Text>

        <Text style={styles.textTitle}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.textTitle}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passInput}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}>
            <Image
              style={{ height: RFValue(18), width: RFValue(18) }}
              source={
                showPassword
                  ? require('../../assets/icons/visible.png')
                  : require('../../assets/icons/invisible.png')
              }
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.createAccountText}>
            Don't have an account? Create Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: height * -0.06,
    paddingHorizontal: width * 0.09,
  },
  container1: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginVertical: height * 0.03,
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
  image: {
    width: '100%',
    height: height * 0.3,
    resizeMode: 'cover',
    marginBottom: height * 0.03,
  },
  textTitle: {
    color: 'black',
    fontFamily: 'Manrope-Bold',
    fontSize: RFValue(12),
  },
  welcomeText: {
    fontSize: RFValue(22),
    fontFamily: 'Manrope-ExtraBold',
    color: '#000',
    textAlign: 'left',
    marginTop: height * 0.01,
  },
  signInText: {
    fontSize: RFValue(12),
    color: '#6E6D7A',
    textAlign: 'left',
    marginBottom: height * 0.03,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: width * 0.025,
    marginBottom: height * 0.03,
    marginTop: height * 0.006,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.03,
  },
  forgotPasswordText: {
    color: '#7D5FFF',
    fontSize: RFValue(12),
  },
  loginButton: {
    backgroundColor: '#3F3D56',
    paddingVertical: height * 0.02,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: RFValue(14),
    fontWeight: 'bold',
  },
  createAccountText: {
    textAlign: 'center',
    color: '#7D5FFF',
    fontSize: RFValue(12),
  },
});

export default Login;