import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
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
import { useTheme } from "../helpers/ThemeContext";

const themeColors = () => {  
    const {colors, isDark} = useTheme();
return colors;
}
console.log(themeColors);

const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();
const InfoStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().primary },
        headerTintColor: themeColors().tint,        
      }}      
    >
      <AuthStack.Screen name="Boat Navigation" component={AuthScreen} />
    </AuthStack.Navigator>
  );
};

const MainStackScreen = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Map" component={MainScreen} />
    </MainStack.Navigator>
  );
};

const InfoStackScreen = () => {
  return (
    <InfoStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().primary },
        headerTintColor: themeColors().tint,
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


const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: themeColors().primary },
        headerTintColor: themeColors().tint,
      }}
    >
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Modify" component={ModifyScreen} />
      <SettingsStack.Screen name="About" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
};


const TabNavigatorScreen = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: themeColors().accent,
        activeBackgroundColor: themeColors().secondary,
        inactiveTintColor: themeColors().tint,
        inactiveBackgroundColor: themeColors().primary,
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

  fb.auth().onAuthStateChanged((user) => {
    user ? setSigned(true) : setSigned(false);
    setIsLoading(false);
  });

  return (
    <NavigationContainer>
      {isLoading ? (
        <SplashScreen />
      ) : isSigned ? (
        TabNavigatorScreen()
      ) : (
        AuthStackScreen()
      )}
    </NavigationContainer>
  );
};

export default Navigation;
