import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';

const { width, height } = Dimensions.get('window');

const Paginator = ({ data, currentIndex }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.maincontainer}>
      <View style={styles.dotContainer}>
        {data.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? '#6C63FF' : '#D9D9D9' },
            ]}
          />
        ))}
      </View>
      {currentIndex !== 2 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.dispatch(StackActions.replace('Landing'))}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  maincontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  dotContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000000',
    marginHorizontal: 8,
  },
  skipButton: {
    position: 'absolute',
    left: width * 0.4, // Adjust as needed
    padding: 10,
    bottom: RFValue(-10),
  },
  skipText: {
    color: '#6C63FF',
    fontSize: 16,
    fontFamily: 'Manrope-Bold',
  },
});

export default Paginator;
