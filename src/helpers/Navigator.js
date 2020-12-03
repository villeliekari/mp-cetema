import React, { useState, useMemo, useContext } from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "native-base";
import fb from "./Firebase";
import SplashScreen from "../screens/SplashScreen";
import AuthScreen from "../screens/AuthScreen";
import MainScreen from "../screens/MainScreen";
import InfoScreen from "../screens/InfoScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ModifyScreen from "../screens/MofidyScreen";
import NauticalScreen from "../screens/NauticalScreen";
import NauticalDetails from "../screens/NauticalScreenSingle";
import Forecast from "../screens/Forecast";

import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider, useTheme } from 'react-native-paper';
import ThemeContext from './ThemeContext';
import { CustomDarkTheme, CustomDefaultTheme } from '../styles/Themes';

const themeColors = () => {  
  const { isDarkTheme, toggleTheme } = useContext(ThemeContext)
  return toggleTheme
}

const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().background },
        headerTintColor: themeColors().text,
      }}
    >
      <AuthStack.Screen name="Boat Navigation" component={AuthScreen} />
    </AuthStack.Navigator>
  );
};

const MainStack = createStackNavigator();

const MainStackScreen = () => {
  return (
    <MainStack.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: themeColors().background },
      headerTintColor: themeColors().text,
     }}
     >
      <MainStack.Screen name="Map" component={MainScreen} />
    </MainStack.Navigator>
  );
};

const InfoStack = createStackNavigator();

const InfoStackScreen = () => {
  return (
    <InfoStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().background },
        headerTintColor: themeColors().text,
      }}
    >
      <InfoStack.Screen name="Info" component={InfoScreen} />
      <InfoStack.Screen name="Weather" component={InfoScreen} />
      <InfoStack.Screen name="Nautical Warnings" component={NauticalScreen} />
      <InfoStack.Screen name="Nautical Warning" component={NauticalDetails} />
      <InfoStack.Screen name="Forecast" component={Forecast} />
    </InfoStack.Navigator>
  );
};

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().background },
        headerTintColor: themeColors().text,
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Modify" component={ModifyScreen} />
      <SettingsStack.Screen name="About" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigatorScreen = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: themeColors().accent,
        activeBackgroundColor: themeColors().background,
        inactiveTintColor: themeColors().tint,
        inactiveBackgroundColor: themeColors().secondary,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MainStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-boat" style={{ color: themeColors().tint }} />
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-cloudy" style={{ color: themeColors().tint }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-menu" style={{ color: themeColors().tint }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const [isSigned, setSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const theme = isDarkTheme ? CustomDarkTheme : CustomDefaultTheme;

  function toggleTheme() {
    setIsDarkTheme(isDark => !isDark);
  }

  const themePreference = useMemo(() => ({
    toggleTheme,
    isDarkTheme,
  }), [isDarkTheme]);

  fb.auth().onAuthStateChanged((user) => {
    user ? setSigned(true) : setSigned(false);
    setIsLoading(false);
  });

  return (
    <ThemeContext.Provider value={themePreference}>
      <PaperProvider theme={theme}>
        <NavigationContainer theme={theme}>
          {isLoading ? (
            <SplashScreen />
          ) : isSigned ? (
            TabNavigatorScreen()
          ) : (
                AuthStackScreen()
              )}
        </NavigationContainer>
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export default Navigation;
