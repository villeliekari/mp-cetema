import React from 'react';
import { Button, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { mapStyleDark } from '../styles/MapStyleDark';

const MainScreen = () => {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 60.1587262,
          longitude: 24.922834,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyleDark}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={true}
      >

      </MapView>
    </View>
  );
}

export default MainScreen;