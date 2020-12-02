import { View, Text, Image } from 'react-native'
import React from "react";


const SplashScreen = () => {
    return (
      <View style={{
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%'}}>
      <Image
        source={require('../../assets/splash.png')}
      />
      </View>
    )
    
}

export default SplashScreen;