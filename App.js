import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
import * as Expo from "expo";
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/helpers/Navigator';

const App = () => {
  LogBox.ignoreLogs(['Setting a timer']);
  const [fontReady, setFontReady] = useState(false);
  const loadFonts = async () => {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
    });
    setFontReady(true);
  }
  useEffect(() => {
    loadFonts();
  }, []);

  if (!fontReady) {
    return (
      <Expo.AppLoading />
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Navigation />
    </>
  );
}

export default App;
