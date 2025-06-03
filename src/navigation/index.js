import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import MainStackNavigator from './MainStackNavigator';
import { navigationRef } from './BottomTabNavigator';
import { ProfileProvider } from '../context/ProfileContext';

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
      <ProfileProvider>

      <MainStackNavigator />    
      </ProfileProvider>
    </NavigationContainer>
  );
};

export default AppNavigation;