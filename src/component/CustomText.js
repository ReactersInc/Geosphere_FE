import { StyleSheet, Text } from "react-native";
import React from "react";
import { RFValue } from "react-native-responsive-fontsize";

const CustomText = ({
  style,
  children,
  font = "Regular",
  numberOfLines,
  ellipsizeMode,
  ...props
}) => {
  // Map font weights to the loaded font names
  const fontFamily = {
    Regular: 'Manrope_Regular',
    Medium: 'Manrope_Medium',
    SemiBold: 'Manrope_SemiBold',
    Bold: 'Manrope_Bold',
  }[font] || 'Manrope_Regular';

  return (
    <Text
      style={[
        styles.defaultText,
        { fontFamily },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 14,
    color: '#000000', // default text color
  },
});

export default CustomText;