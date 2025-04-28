import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from './CustomText';

const ColorPicker = ({ colors, selectedColor, onSelect }) => {
  return (
    <View style={styles.container}>
      {colors.map((color, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onSelect(color)}
          style={[
            styles.colorOption,
            selectedColor[0] === color[0] && styles.selectedColor,
          ]}
        >
          <LinearGradient
            colors={color}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#6C63FF',
  },
  gradient: {
    flex: 1,
  },
});

export default ColorPicker;