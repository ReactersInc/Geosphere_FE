import React, { createContext, useState, useCallback, useContext } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from '../component/CustomText';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [animation] = useState(new Animated.Value(0));

  const showToast = useCallback((options) => {
    const {
      message,
      type = 'info',
      duration = 3000,
      position = 'bottom',
      icon,
      onDismiss,
    } = options;

    setToast({ message, type, duration, position, icon, onDismiss });

    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (duration > 0) {
        setTimeout(() => {
          hideToast();
        }, duration);
      }
    });
  }, []);

  const hideToast = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Call onDismiss callback if it exists
      if (toast?.onDismiss) {
        toast.onDismiss();
      }
      setToast(null);
    });
  }, [animation, toast]);

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FFC107';
      default: return '#6C22BD';
    }
  };

  const getIcon = (type, icon) => {
    if (icon) return icon;
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [toast?.position === 'top' ? -100 : 150, 0],
  });

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Animated.View style={[
          styles.toastContainer,
          {
            backgroundColor: getBackgroundColor(toast.type || 'info'),
            transform: [{ translateY }],
            opacity: animation,
            [toast.position === 'top' ? 'top' : 'bottom']: 50,
          }
        ]}>
          <Ionicons
            name={getIcon(toast.type || 'info', toast.icon)}
            size={24}
            color="white"
            style={styles.icon}
          />
          <CustomText font="Medium" style={styles.toastText}>{toast.message}</CustomText>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
    marginLeft: 10,
  },
  icon: {
    marginRight: 8,
  },
});

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
