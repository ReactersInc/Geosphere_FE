import React, { useEffect, useState } from 'react';
import {
    View,
    CustomText,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height, width } = Dimensions.get('window');

const Frogotpassword = ({ navigation, route }) => {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showVerify, setShowVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [Passwordsection, setPasswordsection] = useState(false);

    const Resendotp = async () => {
        try {
            const response = await fetch('https://makemytwin.com/IoMTAppAPI//api/resendGeoOTP.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setShowVerify(true);
            } else {
                Alert.alert('Error', data.message || 'Something went wrong');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to resend OTP');
        }
    };

    const Verifyotp = async () => {
        try {
            const response = await fetch('https://makemytwin.com/IoMTAppAPI//api/AuthGeoOtp.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setPasswordsection(true);
                setShowVerify(false);
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP');
        }
    };

    const SubmitPassword = async () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }
        if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            Alert.alert('Error', 'Password should be at least 8 characters long and contain a special character');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        try {
            const response = await fetch('https://makemytwin.com/IoMTAppAPI/api/setGeopassword.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    new_password: password,
                }),
            });
            const data = await response.json();
            if (data.status === 'success') {
                setPasswordsection(false);
                setShowVerify(false);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setOtp('');
                navigation.navigate('Login');
            } else {
                Alert.alert('Error', data.message || 'Invalid OTP');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled">
                <CustomText style={styles.textTitle}>Email</CustomText>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                />

                {showVerify && (
                    <View>
                        <CustomText style={styles.textTitle}>OTP</CustomText>
                        <TextInput
                            style={styles.input}
                            placeholder="OTP"
                            onChangeText={setOtp}
                            value={otp}
                        />
                    </View>
                )}

                {Passwordsection && (
                    <View>
                        <CustomText style={styles.textTitle}>New Password</CustomText>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry={!showPassword}
                                onChangeText={setPassword}
                                value={password}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>

                        <CustomText style={styles.textTitle}>Confirm Password</CustomText>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                secureTextEntry={!showConfirmPassword}
                                onChangeText={setConfirmPassword}
                                value={confirmPassword}
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}>
                                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="gray" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {showVerify && (
                    <TouchableOpacity style={styles.loginButton} onPress={Verifyotp}>
                        <CustomText style={styles.loginButtonText}>Verify OTP</CustomText>
                    </TouchableOpacity>
                )}

                {(!showVerify && Passwordsection) || (
                    <TouchableOpacity style={styles.loginButton} onPress={Resendotp}>
                        <CustomText style={styles.loginButtonText}>Send OTP</CustomText>
                    </TouchableOpacity>
                )}

                {Passwordsection && (
                    <TouchableOpacity style={styles.loginButton} onPress={SubmitPassword}>
                        <CustomText style={styles.loginButtonText}>Submit</CustomText>
                    </TouchableOpacity>
                )}
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
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    eyeIcon: {
        padding: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 10,
        padding: 10,
        marginBottom: 25,
        marginTop: 5,
        color: 'black',
        flex: 1,
    },
    textTitle: {
        color: 'black',
        fontWeight: 'bold',
    },
    loginButton: {
        backgroundColor: '#3F3D56',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 30,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Frogotpassword;
