import { Dimensions } from "react-native";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope"; // Make sure this is correctly installed and imported

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;

export const getFont = (weight = "Regular") => {
  const fonts = {
    Regular: Manrope_400Regular,
    Medium: Manrope_500Medium,
    SemiBold: Manrope_600SemiBold,
    Bold: Manrope_700Bold,
  };

  return fonts[weight] || fonts.Regular;
};

export const prettier = (prefix, data) => {
  const prettyData = JSON.stringify(data, null, 2);

  if (prefix) {
    console.log(`${prefix}:`, prettyData);
  } else {
    console.log(prettyData);
  }
};
