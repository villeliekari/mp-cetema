import { View, Text } from 'react-native'
import React from "react";

const SplashScreen = () => {
    return (
      <View style = {{  flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 30 }}>
          Splash Screen !
        </Text>
      </View>
    )
}

export default SplashScreen;