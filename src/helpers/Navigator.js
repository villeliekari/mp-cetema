import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Icon } from "native-base";
import fb from "./Firebase";
import { colors } from "./GlobalVariables";
import SplashScreen from "../screens/SplashScreen";
import AuthScreen from "../screens/AuthScreen";
import MainScreen from "../screens/MainScreen";
import InfoScreen from "../screens/InfoScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NauticalScreen from "../screens/NauticalScreen";
import NauticalDetails from "../screens/NauticalScreenSingle";
import {useTheme} from '../helpers/ThemeContext';

const AuthStack = createStackNavigator();


const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.primary },
        headerTintColor: colors.dark.tint,
      }}
    >
      <AuthStack.Screen name="Boat Navigation" component={AuthScreen} />
    </AuthStack.Navigator>
  );
};

const MainStack = createStackNavigator();

const MainStackScreen = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.primary },
        headerTintColor: colors.dark.tint,
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
        headerStyle: { backgroundColor: colors.dark.primary },
        headerTintColor: colors.dark.tint,
      }}
    >
      <InfoStack.Screen name="Info" component={InfoScreen} />
      <InfoStack.Screen name="Weather" component={InfoScreen} />
      <InfoStack.Screen name="Nautical Warnings" component={NauticalScreen} />
      <InfoStack.Screen name="Nautical Warning" component={NauticalDetails} />
    </InfoStack.Navigator>
  );
};

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.primary },
        headerTintColor: colors.dark.tint,
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Theme" component={SettingsScreen} />
      <SettingsStack.Screen name="About" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

const TabNavigatorScreen = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: colors.dark.accent,
        activeBackgroundColor: colors.dark.secondary,
        inactiveTintColor: colors.dark.tint,
        inactiveBackgroundColor: colors.dark.primary,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MainStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-boat" style={{ color: colors.dark.tint }} />
          ),
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-cloudy" style={{ color: colors.dark.tint }} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{
          tabBarIcon: () => (
            <Icon name="md-menu" style={{ color: colors.dark.tint }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const [isSigned, setSigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  fb.auth().onAuthStateChanged((user) => {
    user ? setSigned(true) : setSigned(false)
    setIsLoading(false)
  });

  return (
    <NavigationContainer>
      { isLoading ? ( <SplashScreen /> ) : (isSigned ? (TabNavigatorScreen()) : (AuthStackScreen()))}
    </NavigationContainer>
  )

}
// darkmode switch for map isDarkModeEnabled ? mapStyles.darkMode :
// mapStyles.lightMode

export default Navigation;
