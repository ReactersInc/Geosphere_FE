import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './MainStackNavigator';
import { navigationRef } from './BottomTabNavigator';

const AppNavigation = () => {
  const CustomTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#fff",
    },
    dark: true,
  };
  return (
    <NavigationContainer ref={navigationRef} theme={CustomTheme}>
      <MainStackNavigator />    
    </NavigationContainer>
  );
};

export default AppNavigation;