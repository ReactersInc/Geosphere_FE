import React, { useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { LoadingContext } from '../context/LoadingProvider';

const { width, height } = Dimensions.get('window');

const GlobalLoader = () => {
  const { loading } = useContext(LoadingContext);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/loading.json')} 
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(1, 1, 1, 0.8)', 
  },
  animation: {
    width: 150,
    height: 150,
  },
});

export default GlobalLoader;
