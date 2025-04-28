import React, { createContext, useState, useCallback, useContext } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../component/CustomText';

const ConfirmationContext = createContext(undefined);

export const ConfirmationProvider = ({ children }) => {
  const [confirmation, setConfirmation] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  const showConfirmation = useCallback((options) => {
    const {
      message,
      type = 'info',
      buttons = [{ text: 'Got it', onPress: () => {} }],
      icon,
    } = options;

    setConfirmation({ message, type, buttons, icon });

    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const hideConfirmation = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setConfirmation(null);
    });
  }, [animation]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#6C63FF'; // Info color
    }
  };

  const getIcon = (type, icon) => {
    if (icon) return icon;
    switch (type) {
      case 'success': return 'check-circle-outline';
      case 'error': return 'alert-circle-outline';
      case 'warning': return 'alert-outline';
      default: return 'information-outline';
    }
  };

  const handleButtonPress = (button) => {
    hideConfirmation();
    
    setTimeout(() => {
      if (button.onPress) {
        button.onPress();
      }
    }, 300);
  };

  return (
    <ConfirmationContext.Provider value={{ showConfirmation, hideConfirmation }}>
      {children}
      <Modal
        transparent
        visible={confirmation !== null}
        animationType="none"
        onRequestClose={hideConfirmation}
      >
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: animation }
          ]}
        >
          <Animated.View 
            style={[
              styles.confirmationContainer,
              {
                opacity: animation,
                transform: [
                  { scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })}
                ]
              }
            ]}
          >
            {confirmation && (
              <>
                <View style={styles.headerContainer}>
                  <View 
                    style={[
                      styles.iconContainer, 
                      { backgroundColor: getTypeColor(confirmation.type || 'info') }
                    ]}
                  >
                    <Icon
                      name={getIcon(confirmation.type || 'info', confirmation.icon)}
                      size={28}
                      color="white"
                    />
                  </View>
                </View>
                
                <View style={styles.contentContainer}>
                  <CustomText font="Medium" style={styles.confirmationText}>
                    {confirmation.message}
                  </CustomText>
                </View>
                
                <View style={styles.buttonContainer}>
                  {confirmation.buttons.length === 1 ? (
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        { backgroundColor: getTypeColor(confirmation.type || 'info') }
                      ]}
                      onPress={() => handleButtonPress(confirmation.buttons[0])}
                    >
                      <CustomText font="Medium" style={styles.primaryButtonText}>
                        {confirmation.buttons[0].text}
                      </CustomText>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => handleButtonPress(confirmation.buttons[0])}
                      >
                        <CustomText font="Medium" style={[
                          styles.secondaryButtonText,
                          { color: getTypeColor(confirmation.type || 'info') }
                        ]}>
                          {confirmation.buttons[0].text}
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.primaryButton,
                          { backgroundColor: getTypeColor(confirmation.type || 'info') }
                        ]}
                        onPress={() => handleButtonPress(confirmation.buttons[1])}
                      >
                        <CustomText font="Medium" style={styles.primaryButtonText}>
                          {confirmation.buttons[1].text}
                        </CustomText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </ConfirmationContext.Provider>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationContainer: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  confirmationText: {
    color: '#333333',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Manrope-Medium',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Manrope-SemiBold',
  },
});

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider');
  }
  return context;
};

export default ConfirmationProvider;