import React, {useState} from 'react';
import {NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme} from '@react-navigation/native';
import {Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, DarkTheme as PaperDarkTheme} from 'react-native-paper';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Icon} from 'native-base';
import fb from './Firebase';
import {colors} from './GlobalVariables';
import AuthScreen from '../screens/AuthScreen';
import MainScreen from '../screens/MainScreen';
import InfoScreen from '../screens/InfoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NauticalScreen from '../screens/NauticalScreen';
import NauticalDetails from '../screens/NauticalScreenSingle';

const AuthStack = createStackNavigator();
const [isDarkTheme, setIsDarkTheme] = useState(false);

//const toggleTheme = () => {
 // setIsDarkTheme(isDarkTheme => !isDarkTheme);
//}

const CustomDefaultTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    background: '#ffffff',
    text: '#333333'
  }
}

const CustomDarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    background: '#333333',
    text: '#ffffff'
  }
}

const theme = isDarkTheme? CustomDarkTheme : CustomDefaultTheme;

const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
      headerStyle: {
        backgroundColor: colors.dark.primary
      },
      headerTintColor: colors.dark.tint
    }}>
      <AuthStack.Screen name="Boat Navigation" component={AuthScreen}/>
    </AuthStack.Navigator>
  );
}

const InfoStack = createStackNavigator();

const InfoStackScreen = () => {
  return (
    <InfoStack.Navigator
      screenOptions={{
      headerStyle: {
        backgroundColor: colors.dark.primary
      },
      headerTintColor: colors.dark.tint
    }}>
      <InfoStack.Screen name="Info" component={InfoScreen}/>
      <InfoStack.Screen name="Weather" component={InfoScreen}/>
      <InfoStack.Screen name="Nautical Warnings" component={NauticalScreen}/>
      <InfoStack.Screen name="Nautical Warning" component={NauticalDetails}/>
    </InfoStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
      headerStyle: {
        backgroundColor: colors.dark.primary
      },
      headerTintColor: colors.dark.tint
    }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen}/>
      <SettingsStack.Screen name="Theme" component={SettingsScreen}/>
      <SettingsStack.Screen name="About" component={SettingsScreen}/>
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigatorScreen = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
      activeTintColor: colors.dark.accent,
      activeBackgroundColor: colors.dark.secondary,
      inactiveTintColor: colors.dark.tint,
      inactiveBackgroundColor: colors.dark.primary
    }}>
      <Tab.Screen
        name="Map"
        component={MainScreen}
        options={{
        tabBarIcon: () => <Icon name='md-boat' style={{
            color: colors.dark.tint
          }}/>
      }}/>
      <Tab.Screen
        name="Info"
        component={InfoStackScreen}
        options={{
        tabBarIcon: () => <Icon
            name="md-cloudy"
            style={{
            color: colors.dark.tint
          }}/>
      }}/>
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
        tabBarIcon: () => <Icon name="md-menu" style={{
            color: colors.dark.tint
          }}/>
      }}/>
    </Tab.Navigator>
  );
}

const Navigation = () => {
  const [isSigned,
    setSigned] = useState(false)
  fb
    .auth()
    .onAuthStateChanged(user => user
      ? setSigned(true)
      : setSigned(false))
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        {isSigned
          ? TabNavigatorScreen()
          : AuthStackScreen()}
      </NavigationContainer>
    </PaperProvider>

  );
}
// darkmode switch for map isDarkModeEnabled ? mapStyles.darkMode :
// mapStyles.lightMode

export default Navigation;
