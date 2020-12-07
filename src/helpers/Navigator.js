import React, { useState, useMemo, useEffect } from "react";
import { NavigationContainer, useTheme } from "@react-navigation/native";
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

import ThemeContext from './ThemeContext';
import { CustomDarkTheme, CustomDefaultTheme } from '../styles/Themes';


const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
  const { colors } = useTheme();
  return (
    <NavigationContainer independent={true}>
      <AuthStack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      >
        <AuthStack.Screen name="Boat Navigation" component={AuthScreen} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
};

const MainStack = createStackNavigator();

const MainStackScreen = () => {
  const { colors } = useTheme();
  return (
    <MainStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
    }}
    >
      <MainStack.Screen name="Map" component={MainScreen} />
    </MainStack.Navigator>
  );
};

const InfoStack = createStackNavigator();

const InfoStackScreen = () => {
  const { colors } = useTheme();
  return (
    <InfoStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
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
  const { colors } = useTheme();
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
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
  const { colors } = useTheme();
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Map"
        component={MainStackScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon name="md-boat" color={color} style={{ color: "#5ADFFF" }} />
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoStackScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon name="md-cloudy" color={color} style={{ color: "#5ADFFF" }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Icon name="md-menu" color={color} style={{ color: "#5ADFFF" }} />
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
    setIsLoading(false)
  });

  // to avoid "React has detected a change in the order of Hooks called by Navigation."
  // splashscreen has to load right after the usecontext hook
  const loadSplashScreen = () => {
  if (isLoading) {
    return (
      <SplashScreen/>
    )
  }
}

  return (
    <ThemeContext.Provider value={themePreference}>
      {loadSplashScreen()}
      <NavigationContainer theme={theme}>
      {isSigned ? ( TabNavigatorScreen() ) : ( AuthStackScreen() )}
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};

export default Navigation;
