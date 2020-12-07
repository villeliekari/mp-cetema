import { View, Text, Image } from 'react-native'
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import {useTheme} from '../helpers/ThemeContext';


const SplashScreen = () => {
  const {colors} = useTheme();
    return (
      <View style={{
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      backgroundColor: colors.background}}>
      <Image
        source={require('../../assets/splash.png')}
      />
      </View>
    )
    
}

export default SplashScreen;