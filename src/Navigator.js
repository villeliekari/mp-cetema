import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import MainScreen from './screens/MainScreen';
import InfoScreen from './screens/InfoScreen';
import SettingsScreen from './screens/SettingsScreen';
import NauticalScreen from './screens/NauticalScreen';
import NauticalDetails from './screens/NauticalScreenSingle';

import { colors } from './GlobalVariables';

const InfoStack = createStackNavigator();

const InfoStackScreen = () => {
  return (
    <InfoStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.darkPrimary },
      headerTintColor: colors.darkTint
    }}>
      <InfoStack.Screen name="Info" component={InfoScreen} />
      <InfoStack.Screen name="Weather" component={InfoScreen} />
      <InfoStack.Screen name="Nautical Warnings" component={NauticalScreen} />
      <InfoStack.Screen name="Nautical Warning" component={NauticalDetails} />
    </InfoStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.darkPrimary },
      headerTintColor: colors.darkTint
    }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Theme" component={SettingsScreen} />
      <SettingsStack.Screen name="About" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBarOptions={{
        activeTintColor: colors.accent,
        activeBackgroundColor: colors.darkSecondary,
        inactiveBackgroundColor: colors.darkPrimary,
        inactiveTintColor: colors.darkTint,
      }}>
        <Tab.Screen name="Map" component={MainScreen} options={{
          tabBarIcon: ({ tintColor }) => <MaterialCommunityIcons name="map" color={tintColor} size={32} />
        }} />
        <Tab.Screen name="Info" component={InfoStackScreen} options={{
          tabBarIcon: ({ tintColor }) => <MaterialCommunityIcons name="weather-cloudy" color={tintColor} size={32} />
        }} />
        <Tab.Screen name="Settings" component={SettingsStackScreen} options={{
          tabBarIcon: ({ tintColor }) => <MaterialCommunityIcons name="settings" color={tintColor} size={32} />
        }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default Navigation;